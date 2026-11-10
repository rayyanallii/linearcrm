import assert from "node:assert/strict";
import {
  applyAction,
  flushScheduled,
  normalizeAction,
  normalizeWorkflowShape,
  previewWorkflow,
  runGraph,
  runScheduledEntry,
  runWorkflowOn,
  runWorkflows,
} from "./workflow-engine.mjs";
import { WORKFLOW_TEMPLATES } from "./workflow-templates.mjs";

const clone = (value) => structuredClone(value);

function baseState() {
  return {
    workspace: "Workflow tests",
    members: ["Alex Morgan", "Maya Chen"],
    companies: [],
    contacts: [],
    tasks: [],
    notes: [],
    emails: [],
    leads: [],
    deals: [
      {
        id: "d1",
        name: "Acme renewal",
        stage: "Proposal",
        pipeline: "sales",
        amount: 40000,
        owner: "Alex Morgan",
        probability: 55,
      },
    ],
    pipelines: [{ id: "sales", name: "Sales" }],
    defaultPipelineId: "sales",
    customFields: [],
    objects: [],
    files: [],
    pins: [],
    trash: [],
    activity: [],
    views: [],
    reports: [],
    workflows: [],
    workflowRuns: [],
    scheduled: [],
  };
}

function rule(overrides = {}) {
  return normalizeWorkflowShape({
    id: "w1",
    name: "Test rule",
    enabled: true,
    trigger: {
      object: "deals",
      event: "stage_changed",
      field: "stage",
      value: "Negotiation",
    },
    ...overrides,
  });
}

function negotiate(state) {
  const next = clone(state);
  next.deals[0].stage = "Negotiation";
  return next;
}

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`• ${name} — ok`);
}

test("a condition gate blocks a record that does not match", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({
      conditions: [{ field: "amount", op: "gt", value: 50000 }],
      actions: [{ type: "create_task", title: "Big renewal" }],
    }),
  ];
  runWorkflows(before, after, Date.now());
  assert.equal(after.tasks.length, 0);
  assert.equal(after.workflowRuns.length, 0);
});

test("all / any logic evaluates every condition", () => {
  const before = baseState();
  const both = negotiate(before);
  both.workflows = [
    rule({
      conditions: [
        { field: "amount", op: "gt", value: 10000 },
        { field: "stage", op: "is", value: "Negotiation" },
      ],
      logic: "and",
      actions: [{ type: "create_task", title: "Qualified renewal" }],
    }),
  ];
  runWorkflows(before, both, Date.now());
  assert.equal(both.tasks.length, 1);

  const either = negotiate(baseState());
  either.workflows = [
    rule({
      conditions: [
        { field: "amount", op: "lt", value: 1 },
        { field: "stage", op: "is", value: "Negotiation" },
      ],
      logic: "or",
      actions: [{ type: "create_task", title: "Either branch" }],
    }),
  ];
  runWorkflows(before, either, Date.now());
  assert.equal(either.tasks.length, 1);
});

test("if / otherwise branches run only the matching step", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({
      actions: [
        {
          type: "create_task",
          title: "Executive brief",
          when: { mode: "when", field: "amount", op: "gt", value: 50000 },
        },
        {
          type: "create_task",
          title: "Standard follow-up",
          when: { mode: "otherwise", field: "amount", op: "gt", value: 50000 },
        },
      ],
    }),
  ];
  runWorkflows(before, after, Date.now());
  assert.deepEqual(
    after.tasks.map((task) => task.name),
    ["Standard follow-up"],
  );
});

test("a waited step is queued, not executed", () => {
  const before = baseState();
  const after = negotiate(before);
  const now = Date.now();
  after.workflows = [
    rule({ actions: [{ type: "create_task", title: "Check in", wait: 2 }] }),
  ];
  runWorkflows(before, after, now);
  assert.equal(after.tasks.length, 0);
  assert.equal(after.scheduled.length, 1);
  assert.equal(after.scheduled[0].runAt, now + 2 * 86400000);
});

test("the queue flushes once when due and never twice", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({ actions: [{ type: "create_task", title: "Check in", wait: 2 }] }),
  ];
  runWorkflows(before, after, Date.now());
  const entry = after.scheduled[0];

  const early = clone(after);
  assert.equal(flushScheduled(early, entry.runAt - 1000), 0);
  assert.equal(early.scheduled.length, 1);
  assert.equal(early.tasks.length, 0);

  const due = clone(after);
  assert.equal(flushScheduled(due, entry.runAt + 1000), 1);
  assert.equal(due.scheduled.length, 0);
  assert.equal(due.tasks.length, 1);
  assert.equal(due.workflowRuns[0].scheduled, true);

  const again = clone(due);
  assert.equal(flushScheduled(again, entry.runAt + 5000), 0);
  assert.equal(again.tasks.length, 1);
});

test("run now executes a queued step early", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({ actions: [{ type: "create_task", title: "Later", wait: 5 }] }),
  ];
  runWorkflows(before, after, Date.now());
  assert.equal(runScheduledEntry(after, after.scheduled[0].id), true);
  assert.equal(after.scheduled.length, 0);
  assert.equal(after.tasks.length, 1);
  assert.equal(after.workflowRuns[0].scheduled, false);
});

test("deleting a workflow cancels its queued steps", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({ actions: [{ type: "create_task", title: "Later", wait: 3 }] }),
  ];
  runWorkflows(before, after, Date.now());
  const dueAt = after.scheduled[0].runAt + 1000;
  after.workflows = [];
  assert.equal(flushScheduled(after, dueAt), 0);
  assert.equal(after.scheduled.length, 0);
  assert.equal(after.tasks.length, 0);
});

test("a field step writes the value and refreshes probability", () => {
  const state = baseState();
  const workflow = rule();
  const run = applyAction(
    state,
    workflow,
    normalizeAction({ type: "update_field", field: "stage", value: "Won" }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.deals[0].stage, "Won");
  assert.equal(state.deals[0].probability, 100);
  assert.equal(run.changes[0].from, "Proposal");
  assert.equal(run.changes[0].to, "Won");
});

test("an owner step validates membership", () => {
  const state = baseState();
  const workflow = rule();
  applyAction(
    state,
    workflow,
    normalizeAction({ type: "assign_owner", value: "Maya Chen" }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.deals[0].owner, "Maya Chen");

  assert.throws(() =>
    applyAction(
      state,
      workflow,
      normalizeAction({ type: "assign_owner", value: "Nobody" }),
      state.deals[0],
      "deals",
      Date.now(),
      state,
    ),
  );
});

test("invalid field steps are rejected instead of corrupting the record", () => {
  const state = baseState();
  const workflow = rule();
  assert.throws(() =>
    applyAction(
      state,
      workflow,
      normalizeAction({ type: "update_field", field: "notAField", value: "x" }),
      state.deals[0],
      "deals",
      Date.now(),
      state,
    ),
  );
  assert.equal(state.deals[0].notAField, undefined);
});

test("legacy single-action workflows normalize into steps", () => {
  const workflow = normalizeWorkflowShape({
    id: "legacy",
    name: "Legacy rule",
    action: { type: "create_task", title: "Old task", delay: 2 },
  });
  assert.equal(workflow.actions.length, 1);
  assert.equal(workflow.actions[0].title, "Old task");
  assert.equal(workflow.actions[0].delay, 2);
  assert.equal(workflow.actions[0].wait, 0);
  assert.equal(workflow.action, undefined);
  assert.deepEqual(workflow.conditions, []);
});

test("the engine links created tasks back to the triggering record", () => {
  const state = baseState();
  state.deals[0].company = "c1";
  state.deals[0].contact = "p1";
  const workflow = rule();
  applyAction(
    state,
    workflow,
    normalizeAction({ type: "create_task", title: "Linked follow-up" }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.tasks[0].deal, "d1");
  assert.equal(state.tasks[0].company, "c1");
  assert.equal(state.tasks[0].contact, "p1");
});

function graphRule(overrides = {}) {
  return normalizeWorkflowShape({
    id: "g1",
    name: "Graph rule",
    enabled: true,
    trigger: {
      object: "deals",
      event: "stage_changed",
      field: "stage",
      value: "Negotiation",
    },
    nodes: [
      { id: "n_trigger", type: "trigger", x: 0, y: 0 },
      ...(overrides.nodes || []),
    ],
    edges: overrides.edges || [],
  });
}

test("a graph wait pauses the rest of the flow", () => {
  const before = baseState();
  const after = negotiate(before);
  const now = Date.now();
  after.workflows = [
    graphRule({
      nodes: [
        { id: "a1", type: "action", action: "create_task", title: "First", x: 200, y: 0 },
        { id: "w1", type: "wait", days: 2, x: 400, y: 0 },
        { id: "a2", type: "action", action: "create_task", title: "Second", x: 600, y: 0 },
      ],
      edges: [
        { id: "e1", from: "n_trigger", to: "a1", port: "out" },
        { id: "e2", from: "a1", to: "w1", port: "out" },
        { id: "e3", from: "w1", to: "a2", port: "out" },
      ],
    }),
  ];
  runWorkflows(before, after, now);
  assert.deepEqual(after.tasks.map((task) => task.name), ["First"]);
  assert.equal(after.scheduled.length, 1);
  assert.equal(after.scheduled[0].nodeId, "a2");
  assert.equal(after.scheduled[0].runAt, now + 2 * 86400000);

  const due = clone(after);
  flushScheduled(due, now + 3 * 86400000);
  assert.deepEqual(due.tasks.map((task) => task.name).sort(), ["First", "Second"]);
});

test("a graph condition routes down the yes or no edge", () => {
  const before = baseState();
  const after = negotiate(before);
  after.deals[0].amount = 40000;
  after.workflows = [
    graphRule({
      nodes: [
        {
          id: "c1",
          type: "condition",
          conditions: [{ field: "amount", op: "gt", value: 50000 }],
          logic: "and",
          x: 200,
          y: 0,
        },
        { id: "big", type: "action", action: "create_task", title: "Big deal", x: 400, y: 0 },
        { id: "small", type: "action", action: "create_task", title: "Small deal", x: 400, y: 160 },
      ],
      edges: [
        { id: "e1", from: "n_trigger", to: "c1", port: "out" },
        { id: "e2", from: "c1", to: "big", port: "true" },
        { id: "e3", from: "c1", to: "small", port: "false" },
      ],
    }),
  ];
  runWorkflows(before, after, Date.now());
  assert.deepEqual(after.tasks.map((task) => task.name), ["Small deal"]);

  const rich = negotiate(baseState());
  rich.deals[0].amount = 90000;
  rich.workflows = [structuredClone(after.workflows[0])];
  runWorkflows(before, rich, Date.now());
  assert.deepEqual(rich.tasks.map((task) => task.name), ["Big deal"]);
});

test("legacy actions migrate into a trigger-connected graph", () => {
  const workflow = normalizeWorkflowShape({
    id: "legacy-graph",
    name: "Legacy",
    trigger: { object: "deals", event: "stage_changed", field: "stage", value: "Won" },
    conditions: [{ field: "amount", op: "gt", value: 10 }],
    actions: [{ type: "create_task", title: "Call", wait: 1 }],
  });
  assert.equal(workflow.nodes.filter((node) => node.type === "trigger").length, 1);
  assert.ok(workflow.nodes.some((node) => node.type === "condition"));
  assert.ok(workflow.nodes.some((node) => node.type === "wait"));
  assert.ok(workflow.nodes.some((node) => node.type === "action"));
  assert.ok(workflow.edges.some((edge) => edge.from === "n_trigger"));
  assert.ok(workflow.edges.every((edge) => edge.from && edge.to));
});

test("a note step writes a note linked to the record", () => {
  const state = baseState();
  const workflow = rule();
  applyAction(
    state,
    workflow,
    normalizeAction({ type: "create_note", title: "Call summary", body: "Discussed pricing." }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.notes.length, 1);
  assert.equal(state.notes[0].name, "Call summary");
  assert.equal(state.notes[0].deal, "d1");
  assert.equal(state.notes[0].details, "Discussed pricing.");
});

test("an activity step writes to the audit log", () => {
  const state = baseState();
  const workflow = rule();
  applyAction(
    state,
    workflow,
    normalizeAction({ type: "log_activity", title: "Renewal touched" }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.activity[0].text, "Renewal touched");
  assert.equal(state.activity[0].actor, "Automation");
  assert.deepEqual(state.activity[0].changes, [{ type: "deals", id: "d1" }]);
});

test("an email draft is stored locally and never sent", () => {
  const state = baseState();
  const workflow = rule();
  const run = applyAction(
    state,
    workflow,
    normalizeAction({ type: "email_draft", title: "Checking in", value: "buyer@acme.test" }),
    state.deals[0],
    "deals",
    Date.now(),
    state,
  );
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].to, "buyer@acme.test");
  assert.equal(state.emails[0].deal, "d1");
  assert.ok(run.summary.includes("not sent"));
});

test("a stop step ends the run before later steps", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    graphRule({
      nodes: [
        { id: "stop", type: "action", action: "stop", x: 200, y: 0 },
        { id: "task", type: "action", action: "create_task", title: "Never", x: 400, y: 0 },
      ],
      edges: [
        { id: "e1", from: "n_trigger", to: "stop", port: "out" },
        { id: "e2", from: "stop", to: "task", port: "out" },
      ],
    }),
  ];
  runWorkflows(before, after, Date.now());
  assert.equal(after.tasks.length, 0);
  assert.equal(after.workflowRuns.length, 1);
  assert.equal(after.workflowRuns[0].summary, "Stopped the flow");
});

test("pausing suspends queued runs instead of discarding them", () => {
  const now = Date.now();
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    rule({ actions: [{ type: "create_task", title: "Held", wait: 5 }] }),
  ];
  runWorkflows(before, after, now);
  assert.equal(after.scheduled.length, 1);

  after.workflows[0].enabled = false;
  assert.equal(flushScheduled(after, now + 10 * 86400000), 0);
  assert.equal(after.scheduled.length, 1);
  assert.equal(after.tasks.length, 0);

  after.workflows[0].enabled = true;
  assert.equal(flushScheduled(after, now + 10 * 86400000), 1);
  assert.equal(after.scheduled.length, 0);
  assert.equal(after.tasks.length, 1);
});

test("a dry run reports steps without writing anything", () => {
  const state = negotiate(baseState());
  const workflow = rule({ actions: [{ type: "create_task", title: "Previewed" }] });
  const result = previewWorkflow(state, workflow, state.deals[0], "deals");
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].summary.includes("Previewed"), true);
  assert.equal(state.tasks.length, 0);
  assert.equal(state.workflowRuns.length, 0);
});

test("a manual run applies the flow to the chosen record", () => {
  const state = negotiate(baseState());
  const workflow = rule({ actions: [{ type: "create_task", title: "Manual" }] });
  const entries = runWorkflowOn(state, workflow, state.deals[0], "deals");
  assert.equal(entries.length, 1);
  assert.equal(state.tasks[0].name, "Manual");
});

test("all steps of one run share a run id", () => {
  const before = baseState();
  const after = negotiate(before);
  after.workflows = [
    graphRule({
      nodes: [
        { id: "a1", type: "action", action: "create_task", title: "One", x: 200, y: 0 },
        { id: "a2", type: "action", action: "create_task", title: "Two", x: 400, y: 0 },
      ],
      edges: [
        { id: "e1", from: "n_trigger", to: "a1", port: "out" },
        { id: "e2", from: "a1", to: "a2", port: "out" },
      ],
    }),
  ];
  runWorkflows(before, after, Date.now());
  assert.equal(after.workflowRuns.length, 2);
  assert.ok(after.workflowRuns[0].runId);
  assert.equal(after.workflowRuns[0].runId, after.workflowRuns[1].runId);
});

test("every workflow template builds a connected, editable graph", () => {
  const state = baseState();
  for (const template of WORKFLOW_TEMPLATES) {
    const workflow = template.build(state);
    assert.ok(workflow.name, `${template.key} needs a name`);
    assert.ok(
      workflow.nodes.some((node) => node.type === "trigger"),
      `${template.key} needs a trigger`,
    );
    assert.ok(
      workflow.nodes.some((node) => node.type === "action"),
      `${template.key} needs an action`,
    );
    const ids = new Set(workflow.nodes.map((node) => node.id));
    assert.ok(workflow.edges.length, `${template.key} needs connections`);
    for (const edge of workflow.edges) {
      assert.ok(ids.has(edge.from) && ids.has(edge.to), `${template.key} has a dangling edge`);
    }
  }
});

test("the speed-to-lead template runs on a new lead", () => {
  const state = baseState();
  state.leads = [
    { id: "l1", name: "New lead", status: "Not contacted", priority: "High", owner: "Alex Morgan" },
  ];
  const workflow = WORKFLOW_TEMPLATES.find(
    (template) => template.key === "speed-to-lead",
  ).build(state);
  runGraph(state, workflow, state.leads[0], "leads");
  assert.equal(state.tasks.length, 1);
  assert.equal(state.tasks[0].name, "Call the new lead");
  assert.equal(state.tasks[0].lead, "l1");
  assert.equal(state.scheduled.length, 1);
});

console.log(`\n${passed} workflow checks passed.`);

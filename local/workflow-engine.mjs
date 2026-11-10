/*
 * Local workflow engine.
 *
 * A workflow is: trigger -> optional condition gate -> ordered action steps.
 * Each step can carry a branch ("only when" / "otherwise") and a wait time.
 * Steps with a wait are persisted in state.scheduled and executed when the app
 * next runs (on load or on a later save). There is no background worker, so a
 * queued step cannot run while the browser is closed.
 */

import {
  fieldDef,
  fieldDefs,
  stageProbability,
  today,
} from "./schema.js";
import { pipelineProbability } from "./pipelines.mjs";

const DAY = 86400000;

export const MAX_STEPS = 6;
export const MAX_WAIT = 90;
export const MAX_DELAY = 365;

export const ACTION_TYPES = [
  { value: "create_task", label: "Create task" },
  { value: "create_note", label: "Create note" },
  { value: "log_activity", label: "Log activity" },
  { value: "email_draft", label: "Email draft" },
  { value: "update_field", label: "Update field" },
  { value: "assign_owner", label: "Assign owner" },
  { value: "stop", label: "Stop flow" },
];

export const BRANCH_MODES = [
  { value: "always", label: "Always" },
  { value: "when", label: "Only when…" },
  { value: "otherwise", label: "Otherwise" },
];

export const OPERATOR_LABELS = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  not_contains: "does not contain",
  gt: "greater than",
  lt: "less than",
  before: "before",
  after: "after",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  is_true: "is true",
  is_false: "is false",
};

const clamp = (value, max) => Math.max(0, Math.min(max, Number(value) || 0));
const filled = (value) => value !== "" && value !== null && value !== undefined;

export function conditionFields(type, db) {
  return fieldDefs(type, db).filter(
    (field) => !field.system && field.type !== "computed" && field.type !== "textarea",
  );
}

export function editableFields(type, db) {
  return fieldDefs(type, db).filter(
    (field) =>
      !field.system &&
      !field.readonly &&
      field.type !== "computed" &&
      field.key !== "name",
  );
}

export function operatorOptions(field) {
  if (!field) return ["contains"];
  if (field.type === "boolean") return ["is_true", "is_false"];
  if (["number", "currency", "percent"].includes(field.type))
    return ["is", "is_not", "gt", "lt", "is_empty", "is_not_empty"];
  if (["date", "datetime"].includes(field.type))
    return ["is", "before", "after", "is_empty", "is_not_empty"];
  return ["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty"];
}

export function operatorNeedsValue(op) {
  return !["is_empty", "is_not_empty", "is_true", "is_false"].includes(op);
}

function optionLabel(option) {
  return typeof option === "string" ? option : option?.name || "";
}

export function resolveValue(field, value, db) {
  if (!field) return String(value ?? "");
  if (field.type === "relation")
    return db?.[field.object]?.find((row) => row.id === value)?.name || "";
  if (field.type === "boolean")
    return value === true || value === "true" || value === "True" ? "Yes" : "No";
  return String(value ?? "");
}

/** Condition check used by both the workflow gate and a step branch. */
export function testCondition(record, condition, type, db) {
  const field = fieldDef(type, condition.field, db);
  if (!field) return true;
  const raw = record?.[condition.field];
  const shown = resolveValue(field, raw, db).toLowerCase();
  const target = String(condition.value ?? "").toLowerCase().trim();

  switch (condition.op) {
    case "is_empty":
      return !filled(raw) || !shown.trim();
    case "is_not_empty":
      return filled(raw) && !!shown.trim();
    case "is_true":
      return raw === true || raw === "true" || raw === "True";
    case "is_false":
      return raw === false || raw === "false" || raw === "False" || !filled(raw);
    case "gt":
      return filled(raw) && Number(raw) > Number(condition.value);
    case "lt":
      return filled(raw) && Number(raw) < Number(condition.value);
    case "before":
      return filled(raw) && String(raw).slice(0, 10) < String(condition.value);
    case "after":
      return filled(raw) && String(raw).slice(0, 10) > String(condition.value);
    case "is":
      if (field.type === "date" || field.type === "datetime")
        return String(raw || "").slice(0, 10) === String(condition.value).slice(0, 10);
      return shown === target;
    case "is_not":
      if (field.type === "date" || field.type === "datetime")
        return String(raw || "").slice(0, 10) !== String(condition.value).slice(0, 10);
      return shown !== target;
    case "not_contains":
      return !shown.includes(target);
    case "contains":
    default:
      return shown.includes(target);
  }
}

export function matchesGate(record, workflow, type, db) {
  const rows = (workflow.conditions || []).filter((row) => row.field);
  if (!rows.length) return true;
  const results = rows.map((row) => testCondition(record, row, type, db));
  return workflow.logic === "or" ? results.some(Boolean) : results.every(Boolean);
}

export function matchesBranch(action, record, type, db) {
  const when = action.when;
  if (!when || when.mode === "always" || !when.field) return true;
  const result = testCondition(record, when, type, db);
  return when.mode === "otherwise" ? !result : result;
}

export function defaultCondition(type, db) {
  const fields = conditionFields(type, db);
  const field = fields.find((row) => row.type === "select") || fields[0];
  return {
    id: crypto.randomUUID(),
    field: field?.key || "",
    op: field?.type === "boolean" ? "is_true" : "is",
    value: "",
  };
}

export function normalizeCondition(row = {}) {
  return {
    id: row.id || crypto.randomUUID(),
    field: String(row.field || ""),
    op: String(row.op || "is"),
    value: row.value ?? "",
  };
}

function normalizeBranch(branch = {}) {
  const mode =
    branch.mode === "when" || branch.mode === "otherwise" ? branch.mode : "always";
  if (mode === "always") return { mode: "always", field: "", op: "is", value: "" };
  return {
    mode,
    field: String(branch.field || ""),
    op: String(branch.op || "is"),
    value: branch.value ?? "",
  };
}

export function normalizeAction(action = {}, index = 0) {
  return {
    id: action.id || `step_${index}_${Math.random().toString(36).slice(2, 8)}`,
    type: ACTION_TYPES.some((entry) => entry.value === action.type)
      ? action.type
      : "create_task",
    title: String(action.title || "").slice(0, 120),
    delay: clamp(action.delay, MAX_DELAY),
    wait: clamp(action.wait, MAX_WAIT),
    field: String(action.field || ""),
    value: action.value ?? "",
    body: String(action.body || "").slice(0, 600),
    when: normalizeBranch(action.when),
  };
}

/*
 * Graph model
 *
 * A workflow is a trigger node, then a graph of condition / action / wait nodes.
 * Conditions have two labelled outputs (yes / no); every other node has one.
 * Legacy linear workflows (conditions + actions) are converted to this graph on
 * load, so there is exactly one execution model and one source of truth.
 */

export const GRAPH_LIMITS = { nodes: 40, depth: 60, visits: 3, waitDays: 90 };

const positionFor = (index) => ({
  x: 60 + index * 250,
  y: 200 + (index % 3) * 30,
});

function graphEdge(from, port, to) {
  return { id: `e_${from}_${port}_${to}`, from, to, port };
}

function nodeLabel(node, type, db) {
  if (node.type === "condition") return "Condition";
  if (node.type === "wait")
    return `Wait ${node.days} day${Number(node.days) === 1 ? "" : "s"}`;
  if (node.type === "action") return actionTitle(node, type, db);
  return "Trigger";
}

function normalizeNode(node, index) {
  const type = ["trigger", "condition", "action", "wait"].includes(node.type)
    ? node.type
    : "action";
  const next = {
    id: String(node.id || `n_${index}_${Math.random().toString(36).slice(2, 7)}`),
    type,
    x: Number.isFinite(Number(node.x)) ? Math.max(0, Number(node.x)) : positionFor(index).x,
    y: Number.isFinite(Number(node.y)) ? Math.max(0, Number(node.y)) : positionFor(index).y,
  };
  if (type === "trigger") return { ...next, name: "Trigger" };
  if (type === "condition") {
    return {
      ...next,
      name: "Condition",
      logic: node.logic === "or" ? "or" : "and",
      negate: node.negate === true,
      conditions: Array.isArray(node.conditions)
        ? node.conditions.map(normalizeCondition).filter((row) => row.field)
        : [],
    };
  }
  if (type === "wait") {
    return {
      ...next,
      name: "Wait",
      days: clamp(node.days, GRAPH_LIMITS.waitDays),
    };
  }
  const action = normalizeAction(
    {
      type: node.action || node.type,
      title: node.title,
      delay: node.delay,
      field: node.field,
      value: node.value,
      body: node.body,
    },
    0,
  );
  return {
    ...next,
    name: actionTitle(action, "deals", {}),
    action: action.type,
    title: action.title,
    delay: action.delay,
    field: action.field,
    value: action.value,
    body: action.body,
  };
}

/** Legacy linear workflow -> the same graph the studio edits. */
export function graphFromActions(workflow) {
  const nodes = [];
  const edges = [];
  const triggerId = "n_trigger";
  nodes.push({ id: triggerId, type: "trigger", name: "Trigger", ...positionFor(0) });

  const segments = [];
  let gateId = null;
  if ((workflow.conditions || []).length) {
    gateId = "n_gate";
    segments.push(null); // placeholder for the gate
  }

  const list = workflow.actions || [];
  for (const [index, action] of list.entries()) {
    const segment = {
      actionId: `n_action_${index}`,
      condId:
        action.when?.mode && action.when.mode !== "always" && action.when.field
          ? `n_condition_${index}`
          : null,
      waitId: action.wait > 0 ? `n_wait_${index}` : null,
      action,
      skipTarget: null,
    };
    segments.push(segment);
  }

  // Create nodes in path order so positions read left to right.
  const created = [];
  if (gateId) {
    created.push({
      id: gateId,
      type: "condition",
      name: "Condition",
      conditions: workflow.conditions,
      logic: workflow.logic,
      negate: false,
      ...positionFor(1),
    });
  }
  for (const segment of segments) {
    if (!segment) continue;
    if (segment.condId) {
      created.push({
        id: segment.condId,
        type: "condition",
        name: "Condition",
        conditions: [normalizeCondition(segment.action.when)].filter((row) => row.field),
        logic: "and",
        negate: segment.action.when.mode === "otherwise",
        ...positionFor(created.length + 1),
      });
    }
    if (segment.waitId) {
      created.push({
        id: segment.waitId,
        type: "wait",
        name: "Wait",
        days: segment.action.wait,
        ...positionFor(created.length + 1),
      });
    }
    created.push({
      id: segment.actionId,
      type: "action",
      name: "Action",
      action: segment.action.type,
      title: segment.action.title,
      delay: segment.action.delay,
      field: segment.action.field,
      value: segment.action.value,
      ...positionFor(created.length + 1),
    });
  }
  nodes.push(...created);

  let cursor = { id: triggerId, port: "out" };
  if (gateId) {
    edges.push(graphEdge(triggerId, "out", gateId));
    cursor = { id: gateId, port: "true" };
  }

  for (const [index, segment] of segments.entries()) {
    if (!segment) continue;
    const entry = segment.condId || segment.waitId || segment.actionId;
    edges.push(graphEdge(cursor.id, cursor.port, entry));
    let nextCursor = { id: entry, port: "out" };
    if (segment.condId) {
      const afterCondition = segment.waitId || segment.actionId;
      edges.push(graphEdge(segment.condId, "true", afterCondition));
      nextCursor = { id: afterCondition, port: "out" };
      segment.skipSource = segment.condId;
    }
    if (segment.waitId) {
      edges.push(graphEdge(segment.waitId, "out", segment.actionId));
    }
    // The node after this segment is the next segment's entry; patch after ids exist.
    const following = segments.slice(index + 1).find(Boolean);
    if (segment.condId) {
      segment.skipTarget = following
        ? following.condId || following.waitId || following.actionId
        : null;
    }
    cursor = { id: segment.actionId, port: "out" };
  }

  for (const segment of segments) {
    if (!segment?.skipSource) continue;
    if (segment.skipTarget) {
      edges.push(graphEdge(segment.skipSource, "false", segment.skipTarget));
    }
  }

  // Trigger -> first segment when there is no gate.
  if (!gateId && segments.filter(Boolean).length) {
    const first = segments.find(Boolean);
    edges.push(graphEdge(triggerId, "out", first.condId || first.waitId || first.actionId));
  }

  // Remove the duplicate chain edge that the loop added from the trigger's port
  // when a gate exists (trigger already points at the gate).
  const unique = [];
  const seen = new Set();
  for (const edge of edges) {
    const key = `${edge.from}:${edge.port}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(edge);
  }

  return { nodes, edges: unique };
}

/** Accepts the legacy linear shape, or an existing studio graph. */
export function normalizeWorkflowShape(workflow) {
  if (!workflow || typeof workflow !== "object") return workflow;
  workflow.conditions = Array.isArray(workflow.conditions)
    ? workflow.conditions.map(normalizeCondition).filter((row) => row.field)
    : [];
  workflow.logic = workflow.logic === "or" ? "or" : "and";
  const source = Array.isArray(workflow.actions)
    ? workflow.actions
    : workflow.action
      ? [workflow.action]
      : [];
  workflow.actions = source.slice(0, MAX_STEPS).map(normalizeAction);
  delete workflow.action;

  const hasGraph =
    Array.isArray(workflow.nodes) &&
    workflow.nodes.some((node) => node && node.type === "trigger");
  if (!hasGraph) {
    const graph = graphFromActions(workflow);
    workflow.nodes = graph.nodes;
    workflow.edges = graph.edges;
  } else {
    workflow.nodes = workflow.nodes
      .slice(0, GRAPH_LIMITS.nodes)
      .map((node, index) => normalizeNode(node, index));
    const ids = new Set(workflow.nodes.map((node) => node.id));
    workflow.edges = (Array.isArray(workflow.edges) ? workflow.edges : [])
      .filter((edge) => edge && ids.has(edge.from) && ids.has(edge.to))
      .map((edge, index) => ({
        id: String(edge.id || `e_${index}`),
        from: String(edge.from),
        to: String(edge.to),
        port: edge.port === "true" || edge.port === "false" ? edge.port : "out",
      }));
  }
  return workflow;
}

/** Editable copy of an action node, in the shape applyAction expects. */
export function actionFromNode(node) {
  return normalizeAction({
    id: node.id,
    type: node.action,
    title: node.title,
    delay: node.delay,
    field: node.field,
    value: node.value,
    body: node.body,
  });
}

export function nodeSummary(node, type, db) {
  if (node.type === "trigger") return "When this happens";
  if (node.type === "wait") return `Wait ${node.days} day${Number(node.days) === 1 ? "" : "s"}`;
  if (node.type === "condition") {
    const count = node.conditions?.length || 0;
    return `${count} condition${count === 1 ? "" : "s"}${node.negate ? " · inverted" : ""}`;
  }
  return actionSummary(actionFromNode(node), type, db);
}

function nextNode(workflow, fromId, port) {
  const edge = (workflow.edges || []).find(
    (row) => row.from === fromId && (row.port || "out") === port,
  );
  return edge ? (workflow.nodes || []).find((node) => node.id === edge.to) : null;
}

function passesConditions(record, node, type, state) {
  const rows = (node.conditions || []).filter((row) => row.field);
  if (!rows.length) return true;
  const results = rows.map((row) => testCondition(record, row, type, state));
  const pass = node.logic === "or" ? results.some(Boolean) : results.every(Boolean);
  return node.negate ? !pass : pass;
}

/**
 * Executes a graph from `startNodeId` (or the trigger). Stops at a wait.
 * Every entry written by one execution shares a runId so the list can group
 * the steps of a single run together.
 */
export function runGraph(
  state,
  workflow,
  record,
  type,
  startNodeId = null,
  at = Date.now(),
  runId = null,
) {
  if (!record || !Array.isArray(workflow.nodes) || !workflow.nodes.length) return;
  const executionId = runId || crypto.randomUUID();
  state.workflowRuns ??= [];
  state.scheduled ??= [];
  let node;
  if (startNodeId) {
    node = workflow.nodes.find((row) => row.id === startNodeId);
  } else {
    const trigger = workflow.nodes.find((row) => row.type === "trigger");
    node = trigger ? nextNode(workflow, trigger.id, "out") : null;
  }

  const visits = new Map();
  let depth = 0;
  while (node && depth < GRAPH_LIMITS.depth) {
    depth += 1;
    const count = (visits.get(node.id) || 0) + 1;
    visits.set(node.id, count);
    if (count > GRAPH_LIMITS.visits) {
      state.workflowRuns.unshift({
        id: crypto.randomUUID(),
        runId: executionId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        at,
        targetType: type,
        targetId: record.id,
        targetName: record.name,
        actionType: "loop",
        taskName: "",
        summary: "Workflow loop stopped after repeated visits.",
        changes: [],
        status: "failed",
        scheduled: false,
      });
      return;
    }

    if (node.type === "wait") {
      const days = clamp(node.days, GRAPH_LIMITS.waitDays);
      const after = nextNode(workflow, node.id, "out");
      if (days <= 0 || !after) {
        node = after;
        continue;
      }
      state.scheduled.push({
        id: crypto.randomUUID(),
        runId: executionId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodeId: after.id,
        recordType: type,
        recordId: record.id,
        runAt: at + days * DAY,
        createdAt: at,
      });
      return;
    }

    if (node.type === "condition") {
      node = nextNode(workflow, node.id, passesConditions(record, node, type, state) ? "true" : "false");
      continue;
    }

    if (node.type === "action") {
      const action = actionFromNode(node);
      let run;
      try {
        run = applyAction(state, workflow, action, record, type, at, state);
      } catch (error) {
        state.workflowRuns.unshift(
          runEntry(workflow, action, record, type, at, {
            status: "failed",
            summary: error.message || "Step could not run.",
          }),
        );
        return;
      }
      if (run) {
        run.runId = executionId;
        const stopped = run.stopped === true;
        delete run.stopped;
        state.workflowRuns.unshift(run);
        if (stopped) return;
      }
      node = nextNode(workflow, node.id, "out");
      continue;
    }

    // Trigger nodes reached in a loop simply continue.
    node = nextNode(workflow, node.id, "out");
  }
}

export function actionSummary(action, type, db) {
  if (action.type === "create_task")
    return `Create task “${action.title || "Follow up"}” due in ${action.delay || 0} day(s)`;
  if (action.type === "create_note") return `Add note “${action.title || "Note"}”`;
  if (action.type === "log_activity")
    return `Log activity “${action.title || "Workflow ran"}”`;
  if (action.type === "email_draft")
    return `Draft email “${action.title || "Untitled"}”${
      action.value ? ` to ${action.value}` : ""
    }`;
  if (action.type === "stop") return "Stop the flow here";
  if (action.type === "assign_owner")
    return `Assign owner ${action.value || "nobody"}`;
  const field = fieldDef(type, action.field, db);
  const shown = field ? resolveValue(field, action.value, db) : action.value;
  return `Set ${field?.label || action.field} to ${shown || "empty"}`;
}

export function actionTitle(action, type, db) {
  if (action.type === "create_task") return action.title || "Create task";
  if (action.type === "create_note") return action.title || "Create note";
  if (action.type === "log_activity") return "Log activity";
  if (action.type === "email_draft") return action.title || "Email draft";
  if (action.type === "stop") return "Stop flow";
  if (action.type === "assign_owner") return `Assign ${action.value || "owner"}`;
  const field = fieldDef(type, action.field, db);
  return `Set ${field?.label || action.field}`;
}

function coerce(field, value, db) {
  if (field.type === "boolean")
    return value === true || value === "true" || value === "True";
  if (["number", "currency", "percent"].includes(field.type)) {
    if (String(value).trim() === "") return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error(`${field.label} must be a number.`);
    return parsed;
  }
  if (field.type === "date") {
    if (value === "") return "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(String(value)))
      throw new Error(`${field.label} must be a date.`);
    return String(value).slice(0, 10);
  }
  if (field.type === "owner" && value && !(db.members || []).includes(value))
    throw new Error("Choose an existing workspace member.");
  if (field.type === "relation" && value && !(db[field.object] || []).some((row) => row.id === value))
    throw new Error(`Choose an existing ${field.object} record.`);
  if (Array.isArray(field.options) && field.options.length && value && !field.options.includes(value))
    throw new Error(`${field.label} must be one of its options.`);
  return value;
}

function runEntry(workflow, action, record, type, at, extra = {}) {
  return {
    id: crypto.randomUUID(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    at,
    targetType: type,
    targetId: record.id,
    targetName: record.name,
    actionType: action.type,
    taskName: extra.taskName || "",
    summary: extra.summary || actionSummary(action, type, extra.db || {}),
    changes: extra.changes || [],
    status: extra.status || "done",
    scheduled: !!extra.scheduled,
  };
}

/** Applies one step. Throws on invalid configuration so callers can log it. */
export function applyAction(state, workflow, action, record, type, at = Date.now(), db = state) {
  if (!record) return null;

  if (action.type === "create_task") {
    const task = {
      id: crypto.randomUUID(),
      name: action.title || workflow.name,
      status: "Open",
      priority: "Normal",
      taskType: "To-do",
      date: today(action.delay || 0),
      owner: record.owner || "",
      company: "",
      contact: "",
      details: `Created by workflow “${workflow.name}”.`,
      createdBy: "Automation",
      createdAt: new Date(at).toISOString(),
    };
    for (const field of fieldDefs("tasks", state)) {
      if (field.type === "relation" && field.object === type) task[field.key] = record.id;
    }
    if (!task.company && record.company) task.company = record.company;
    if (!task.contact && record.contact) task.contact = record.contact;
    state.tasks.unshift(task);
    return runEntry(workflow, action, record, type, at, {
      taskName: task.name,
      summary: `Created task “${task.name}”`,
      db,
    });
  }

  if (action.type === "create_note") {
    if (!String(action.title || "").trim())
      throw new Error("Give the note step a title.");
    state.notes ??= [];
    const note = {
      id: crypto.randomUUID(),
      name: action.title.trim(),
      category: "General",
      meetingDate: today(0),
      details: action.body || "",
      createdBy: "Automation",
      createdAt: new Date(at).toISOString(),
    };
    for (const field of fieldDefs("notes", state)) {
      if (field.type === "relation" && field.object === type) note[field.key] = record.id;
    }
    if (!note.company && record.company) note.company = record.company;
    if (!note.contact && record.contact) note.contact = record.contact;
    if (!note.deal && record.deal) note.deal = record.deal;
    state.notes.unshift(note);
    return runEntry(workflow, action, record, type, at, {
      taskName: note.name,
      summary: `Added note “${note.name}”`,
      db,
    });
  }

  if (action.type === "log_activity") {
    state.activity ??= [];
    const text = String(action.title || `Workflow “${workflow.name}” ran`).slice(0, 160);
    state.activity.unshift({
      at,
      text,
      changes: [{ type, id: record.id }],
      actor: "Automation",
    });
    state.activity = state.activity.slice(0, 250);
    return runEntry(workflow, action, record, type, at, {
      summary: `Logged “${text}”`,
      db,
    });
  }

  if (action.type === "email_draft") {
    if (!String(action.title || "").trim())
      throw new Error("Give the email draft a subject.");
    state.emails ??= [];
    const recipient =
      action.value || record.email || (record.contact ? record.email : "") || "";
    const draft = {
      id: crypto.randomUUID(),
      name: action.title.trim(),
      direction: "Outbound",
      date: today(0),
      to: recipient,
      from: "",
      contact: type === "contacts" ? record.id : record.contact || "",
      company: record.company || "",
      deal: type === "deals" ? record.id : record.deal || "",
      details: action.body || "",
      createdBy: "Automation",
      createdAt: new Date(at).toISOString(),
    };
    state.emails.unshift(draft);
    return runEntry(workflow, action, record, type, at, {
      taskName: draft.name,
      summary: `Drafted email “${draft.name}”${recipient ? ` to ${recipient}` : ""} — not sent`,
      db,
    });
  }

  if (action.type === "stop") {
    return {
      ...runEntry(workflow, action, record, type, at, {
        summary: "Stopped the flow",
        db,
      }),
      stopped: true,
    };
  }

  if (action.type === "assign_owner") {
    if (action.value && !(state.members || []).includes(action.value))
      throw new Error("Choose an existing workspace member.");
    const before = record.owner || "";
    record.owner = action.value || "";
    return runEntry(workflow, action, record, type, at, {
      changes: [{ field: "owner", from: before, to: record.owner }],
      summary: `Assigned ${record.owner || "nobody"}`,
      db,
    });
  }

  if (action.type === "update_field") {
    const field = fieldDef(type, action.field, state);
    if (!field || field.readonly || field.system || field.type === "computed")
      throw new Error("Choose an editable field for this step.");
    const value = coerce(field, action.value, state);
    const before = record[field.key] ?? "";
    record[field.key] = value;
    if (type === "deals" && field.key === "stage")
      record.probability = pipelineProbability(
        state,
        record.pipeline,
        record.stage,
        stageProbability,
      );
    return runEntry(workflow, action, record, type, at, {
      changes: [{ field: field.key, from: before, to: value }],
      summary: `Set ${field.label} to ${resolveValue(field, value, state) || "empty"}`,
      db,
    });
  }

  throw new Error("Unknown workflow action.");
}

function targetsFor(previous, next, trigger) {
  const before = previous[trigger.object] || [];
  const after = next[trigger.object] || [];
  if (trigger.event === "created") {
    const ids = new Set(before.map((row) => row.id));
    return after.filter((row) => !ids.has(row.id));
  }
  const byId = new Map(before.map((row) => [row.id, row]));
  if (trigger.event === "stage_changed") {
    const field = trigger.field || "stage";
    return after.filter((row) => {
      const old = byId.get(row.id);
      return (
        old &&
        JSON.stringify(old[field]) !== JSON.stringify(row[field]) &&
        (!trigger.value || String(row[field]) === String(trigger.value))
      );
    });
  }
  if (trigger.event === "field_changed") {
    const field = trigger.field;
    if (!field) return [];
    return after.filter((row) => {
      const old = byId.get(row.id);
      return (
        old &&
        JSON.stringify(old[field]) !== JSON.stringify(row[field]) &&
        (!trigger.value || String(row[field]) === String(trigger.value))
      );
    });
  }
  return [];
}

export function runWorkflows(previous, next, now = Date.now()) {
  next.workflowRuns ??= [];
  next.scheduled ??= [];
  const workflows = (next.workflows || []).filter(
    (workflow) => workflow && workflow.enabled !== false,
  );

  for (const workflow of workflows) {
    const trigger = workflow.trigger || {};
    if (!trigger.object || !next[trigger.object]) continue;
    if (!Array.isArray(workflow.nodes) || !workflow.nodes.length) continue;
    for (const record of targetsFor(previous, next, trigger)) {
      runGraph(next, workflow, record, trigger.object, null, now);
    }
  }

  next.workflowRuns = next.workflowRuns.slice(0, 120);
}

/** Runs queued steps that are due. Entries whose workflow, record or enablement is gone are cancelled. */
export function flushScheduled(state, now = Date.now()) {
  if (!Array.isArray(state.scheduled) || !state.scheduled.length) return 0;
  state.workflowRuns ??= [];
  let count = 0;
  const remaining = [];

  for (const entry of state.scheduled) {
    const workflow = (state.workflows || []).find((row) => row.id === entry.workflowId);
    const record = (state[entry.recordType] || []).find((row) => row.id === entry.recordId);
    if (!workflow || !record) continue;
    // Pausing suspends the queued path instead of discarding it; resuming
    // picks the entry up again. Deleting the workflow still cancels.
    if (workflow.enabled === false) {
      remaining.push(entry);
      continue;
    }
    if (entry.runAt > now) {
      remaining.push(entry);
      continue;
    }
    try {
      if (entry.nodeId) {
        runGraph(state, workflow, record, entry.recordType, entry.nodeId, now, entry.runId);
        const latest = state.workflowRuns[0];
        if (latest && latest.workflowId === workflow.id) latest.scheduled = true;
      } else if (entry.action) {
        const run = applyAction(state, workflow, entry.action, record, entry.recordType, now, state);
        if (run) {
          run.scheduled = true;
          run.runId = entry.runId || crypto.randomUUID();
          state.workflowRuns.unshift(run);
        }
      }
      count += 1;
    } catch (error) {
      state.workflowRuns.unshift(
        runEntry(workflow, entry.action || {}, record, entry.recordType, now, {
          status: "failed",
          summary: error.message || "Queued step could not run.",
          scheduled: true,
        }),
      );
    }
  }

  state.workflowRuns = state.workflowRuns.slice(0, 120);
  state.scheduled = remaining;
  return count;
}

/** Manual "Run now" for one queued step. */
export function runScheduledEntry(state, id, now = Date.now()) {
  const entry = (state.scheduled || []).find((row) => row.id === id);
  if (!entry) return false;
  const workflow = (state.workflows || []).find((row) => row.id === entry.workflowId);
  const record = (state[entry.recordType] || []).find((row) => row.id === entry.recordId);
  state.scheduled = state.scheduled.filter((row) => row.id !== id);
  if (!workflow || !record) return false;
  if (entry.nodeId) {
    runGraph(state, workflow, record, entry.recordType, entry.nodeId, now, entry.runId);
    return true;
  }
  const run = applyAction(state, workflow, entry.action, record, entry.recordType, now, state);
  if (run) {
    run.scheduled = false;
    run.runId = entry.runId || crypto.randomUUID();
    state.workflowRuns.unshift(run);
  }
  return true;
}

/**
 * Manual run against one record. Returns the entries this run produced.
 */
export function runWorkflowOn(state, workflow, record, type, at = Date.now()) {
  if (!record) return [];
  state.workflowRuns ??= [];
  state.scheduled ??= [];
  const before = state.workflowRuns.length;
  runGraph(state, workflow, record, type, null, at);
  return state.workflowRuns.slice(0, state.workflowRuns.length - before);
}

/**
 * Dry run: executes against a copy, so nothing is written. Returns the steps it
 * would perform and the waits it would queue.
 */
export function previewWorkflow(state, workflow, record, type, at = Date.now()) {
  if (!record) return { steps: [], queued: [] };
  const copy = structuredClone(state);
  copy.workflowRuns ??= [];
  copy.scheduled ??= [];
  const runsBefore = copy.workflowRuns.length;
  const queuedBefore = copy.scheduled.length;
  const target = (copy[type] || []).find((row) => row.id === record.id);
  runGraph(copy, workflow, target, type, null, at);
  return {
    steps: copy.workflowRuns.slice(0, copy.workflowRuns.length - runsBefore),
    queued: copy.scheduled.slice(queuedBefore),
  };
}

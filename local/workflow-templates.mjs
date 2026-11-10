/*
 * Workflow templates.
 *
 * Each template builds a real Studio graph (nodes + edges) from the current
 * workspace, so opening one gives an editable flow that executes exactly like a
 * hand-built one. Templates are starting points, not a separate mode.
 */

import { normalizeCondition, normalizeWorkflowShape } from "./workflow-engine.mjs";

function graph(trigger, steps, edges) {
  const nodes = [{ id: "n_trigger", type: "trigger", name: "Trigger", x: 60, y: 240 }];
  steps.forEach((step, index) => {
    nodes.push({ x: 330 + index * 260, y: 240, ...step });
  });
  return normalizeWorkflowShape({
    id: crypto.randomUUID(),
    name: "",
    enabled: true,
    trigger,
    conditions: [],
    actions: [],
    nodes,
    edges: edges.map(([from, to, port], index) => ({
      id: `e_${index}_${from}_${to}`,
      from,
      to,
      port: port || "out",
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function condition(id, rows, extra = {}) {
  return {
    id,
    type: "condition",
    logic: "and",
    negate: false,
    conditions: rows.map(normalizeCondition),
    ...extra,
  };
}

export const WORKFLOW_TEMPLATES = [
  {
    key: "speed-to-lead",
    label: "Speed to lead",
    description:
      "Call a new lead, wait a day, then branch on priority so hot leads get a tailored follow-up.",
    build() {
      const workflow = graph(
        { object: "leads", event: "created", field: "status", value: "" },
        [
          { id: "n_call", type: "action", action: "create_task", title: "Call the new lead", delay: 0 },
          { id: "n_wait", type: "wait", days: 1 },
          condition("n_priority", [{ field: "priority", op: "is", value: "High" }]),
          {
            id: "n_hot",
            type: "action",
            action: "create_task",
            title: "Send a tailored follow-up",
            delay: 0,
            y: 130,
          },
          {
            id: "n_nurture",
            type: "action",
            action: "create_task",
            title: "Add the lead to the nurture list",
            delay: 2,
            y: 360,
          },
        ],
        [
          ["n_trigger", "n_call"],
          ["n_call", "n_wait"],
          ["n_wait", "n_priority"],
          ["n_priority", "n_hot", "true"],
          ["n_priority", "n_nurture", "false"],
        ],
      );
      workflow.name = "Speed to lead";
      workflow.description = "New lead follow-up with a priority branch.";
      return workflow;
    },
  },
  {
    key: "proposal-follow-up",
    label: "Proposal follow-up",
    description:
      "When an opportunity reaches Proposal: log what was sent, wait two days, then chase it — with a bigger push for large deals.",
    build() {
      const workflow = graph(
        { object: "deals", event: "stage_changed", field: "stage", value: "Proposal" },
        [
          {
            id: "n_note",
            type: "action",
            action: "create_note",
            title: "Proposal sent",
            body: "Proposal shared with the buying team.",
          },
          { id: "n_wait", type: "wait", days: 2 },
          {
            id: "n_task",
            type: "action",
            action: "create_task",
            title: "Follow up on the proposal",
            delay: 0,
          },
          condition("n_size", [{ field: "amount", op: "gt", value: "50000" }]),
          {
            id: "n_exec",
            type: "action",
            action: "email_draft",
            title: "Executive follow-up",
            body: "Sharing the highlights and offering a short call to answer questions.",
            y: 130,
          },
          {
            id: "n_check",
            type: "action",
            action: "create_task",
            title: "Check in on the proposal",
            delay: 1,
            y: 360,
          },
        ],
        [
          ["n_trigger", "n_note"],
          ["n_note", "n_wait"],
          ["n_wait", "n_task"],
          ["n_task", "n_size"],
          ["n_size", "n_exec", "true"],
          ["n_size", "n_check", "false"],
        ],
      );
      workflow.name = "Proposal follow-up";
      workflow.description = "Proposal stage playbook with a large-deal branch.";
      return workflow;
    },
  },
  {
    key: "renewal-reminder",
    label: "Renewal reminder",
    description:
      "When a company renewal date changes, wait 30 days, then create the check-in task and a note for the account.",
    build() {
      const workflow = graph(
        { object: "companies", event: "field_changed", field: "renewalDate", value: "" },
        [
          { id: "n_wait", type: "wait", days: 30 },
          {
            id: "n_task",
            type: "action",
            action: "create_task",
            title: "Renewal check-in",
            delay: 0,
          },
          {
            id: "n_note",
            type: "action",
            action: "create_note",
            title: "Renewal window opened",
            body: "Confirm the renewal owner, budget and next step.",
          },
        ],
        [
          ["n_trigger", "n_wait"],
          ["n_wait", "n_task"],
          ["n_task", "n_note"],
        ],
      );
      workflow.name = "Renewal reminder";
      workflow.description = "A 30-day renewal follow-up for accounts.";
      return workflow;
    },
  },
];

export function templateByKey(key) {
  return WORKFLOW_TEMPLATES.find((template) => template.key === key) || null;
}

import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconAutomation,
  IconBolt,
  IconClock,
  IconCopy,
  IconGitBranch,
  IconPencil,
  IconPlayerPlay,
  IconPlus,
  IconTemplate,
  IconTrash,
} from "@tabler/icons-react";
import { Select } from "./Select";
import { fieldDef } from "./schema";
import { confirmAction } from "./dialogs";
import { objectDef } from "./schema";
import {
  runScheduledEntry,
  nodeSummary,
  normalizeWorkflowShape,
  previewWorkflow,
  runWorkflowOn,
} from "./workflow-engine.mjs";
import { WorkflowStudio } from "./WorkflowStudio";
import { WORKFLOW_TEMPLATES } from "./workflow-templates.mjs";

function triggerText(workflow, db) {
  const trigger = workflow.trigger || {};
  const object = objectDef(trigger.object, db);
  if (trigger.event === "created") return `New ${object.singular.toLowerCase()}`;
  if (trigger.event === "stage_changed")
    return `${object.plural} enter ${trigger.value || "a stage"}`;
  const field = fieldDef(trigger.object, trigger.field, db);
  return `${field?.label || trigger.field || "Field"} changes${
    trigger.value ? ` to ${trigger.value}` : ""
  }`;
}

function emptyWorkflow(db) {
  return normalizeWorkflowShape({
    id: crypto.randomUUID(),
    name: "Untitled workflow",
    enabled: true,
    trigger: {
      object: "deals",
      event: "stage_changed",
      field: "stage",
      value: "Negotiation",
    },
    conditions: [],
    logic: "and",
    actions: [],
    nodes: [{ id: "n_trigger", type: "trigger", name: "Trigger", x: 60, y: 220 }],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function Workflows({ db, commit }) {
  const [editing, setEditing] = useState(null);
  const [runner, setRunner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const workflows = db.workflows || [];
  const scheduled = db.scheduled || [];
  const runs = db.workflowRuns || [];
  const runnerWorkflow = runner
    ? workflows.find((row) => row.id === runner.workflowId)
    : null;

  const groupedRuns = [];
  const byRun = new Map();
  for (const run of runs) {
    const key = run.runId || run.id;
    if (!byRun.has(key)) {
      const group = { key, runs: [] };
      byRun.set(key, group);
      groupedRuns.push(group);
    }
    byRun.get(key).runs.push(run);
  }

  function openRunner(workflow) {
    const type = workflow.trigger?.object || "deals";
    const first = (db[type] || [])[0];
    setPreview(null);
    setRunner({
      workflowId: workflow.id,
      type,
      recordId: first?.id || "",
      dryRun: true,
    });
  }

  function executeRun() {
    const workflow = workflows.find((row) => row.id === runner.workflowId);
    const record = (db[runner.type] || []).find((row) => row.id === runner.recordId);
    if (!workflow || !record) return;
    if (runner.dryRun) {
      setPreview(previewWorkflow(db, workflow, record, runner.type));
      return;
    }
    const ok = commit(
      (state) => {
        const row = (state.workflows || []).find((item) => item.id === runner.workflowId);
        const target = (state[runner.type] || []).find((item) => item.id === runner.recordId);
        if (!row || !target) throw new Error("That workflow or record is no longer available.");
        runWorkflowOn(state, row, target, runner.type);
      },
      `Ran workflow · ${workflow.name}`,
    );
    if (ok) setRunner(null);
  }

  function openNew() {
    setEditing(emptyWorkflow(db));
  }

  function openExisting(workflow) {
    setEditing(structuredClone(workflow));
  }

  function duplicate(workflow) {
    const copy = structuredClone(workflow);
    copy.id = crypto.randomUUID();
    copy.name = `${workflow.name} copy`;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    setEditing(copy);
  }

  function toggle(workflow) {
    commit(
      (state) => {
        const row = state.workflows.find((item) => item.id === workflow.id);
        if (row) row.enabled = !row.enabled;
      },
      `${workflow.enabled ? "Paused" : "Resumed"} workflow · ${workflow.name}`,
    );
  }

  async function remove(workflow) {
    if (
      !(await confirmAction(
        `Delete workflow “${workflow.name}”? Queued runs for it are cancelled.`,
      ))
    )
      return;
    commit(
      (state) => {
        state.workflows = state.workflows.filter((item) => item.id !== workflow.id);
        state.scheduled = (state.scheduled || []).filter(
          (entry) => entry.workflowId !== workflow.id,
        );
      },
      `Deleted workflow · ${workflow.name}`,
    );
  }

  if (editing) {
    return (
      <WorkflowStudio
        key={editing.id}
        workflow={editing}
        db={db}
        commit={commit}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="workflows-page">
      <div className="page-heading">
        <div>
          <small>Automation</small>
          <h1>Workflows</h1>
          <p>Build a flow on a canvas, then let it handle the follow-up.</p>
        </div>
        <div className="workflow-heading-actions">
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconTemplate size={14} />}
            onClick={() => setTemplatesOpen(true)}
          >
            Templates
          </Button>
          <Button
            size="sm"
            variant="solid"
            startIcon={<IconPlus size={14} />}
            onClick={openNew}
          >
            New workflow
          </Button>
        </div>
      </div>

      <div className="workflow-list">
        {workflows.map((workflow) => {
          const nodes = workflow.nodes || [];
          const actions = nodes.filter((node) => node.type === "action");
          const conditions = nodes.filter((node) => node.type === "condition");
          const workflowRuns = runs.filter((run) => run.workflowId === workflow.id);
          const queued = scheduled.filter((entry) => entry.workflowId === workflow.id).length;
          return (
            <section className="panel-card workflow-card" key={workflow.id}>
              <header>
                <span className={"workflow-dot " + (workflow.enabled ? "on" : "")} />
                <button
                  type="button"
                  className="workflow-title workflow-open"
                  aria-label={`Open ${workflow.name}`}
                  onClick={() => openExisting(workflow)}
                >
                  <h2>{workflow.name}</h2>
                  <small>{triggerText(workflow, db)}</small>
                </button>
                <Tag color={workflow.enabled ? "green" : "gray"}>
                  {workflow.enabled ? "Active" : "Paused"}
                </Tag>
              </header>

              <div className="workflow-flow">
                <span className="flow-node">
                  <IconBolt size={12} /> {triggerText(workflow, db)}
                </span>
                {conditions.length > 0 && (
                  <>
                    <span className="flow-arrow">→</span>
                    <span className="flow-node">
                      <IconGitBranch size={12} /> {conditions.length} condition
                      {conditions.length === 1 ? "" : "s"}
                    </span>
                  </>
                )}
                {actions.slice(0, 3).map((action, index) => (
                  <React.Fragment key={action.id}>
                    <span className="flow-arrow">→</span>
                    <span className="flow-node accent">
                      {nodeSummary(action, workflow.trigger.object, db)}
                    </span>
                  </React.Fragment>
                ))}
                {actions.length > 3 && (
                  <span className="flow-node">+{actions.length - 3} more</span>
                )}
                {!actions.length && <span className="flow-node">No actions yet</span>}
              </div>

              <div className="workflow-meta">
                <span>
                  {nodes.length} step{nodes.length === 1 ? "" : "s"}
                </span>
                <span>
                  {workflowRuns.length} run{workflowRuns.length === 1 ? "" : "s"}
                </span>
                {queued > 0 && <span>{queued} queued</span>}
                <div className="workflow-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconPencil size={13} />}
                    onClick={() => openExisting(workflow)}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconCopy size={13} />}
                    onClick={() => duplicate(workflow)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconPlayerPlay size={13} />}
                    onClick={() => openRunner(workflow)}
                  >
                    Run
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(workflow)}>
                    {workflow.enabled ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${workflow.name}`}
                    onClick={() => remove(workflow)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              </div>
            </section>
          );
        })}

        {!workflows.length && (
          <section className="panel-card">
            <div className="empty-state">
              <IconAutomation size={24} />
              <strong>No workflows yet</strong>
              <span>
                Create a flow: drag a condition or action onto the canvas and connect it
                to the trigger.
              </span>
              <div className="workflow-heading-actions">
                <Button size="sm" onClick={openNew}>
                  New workflow
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTemplatesOpen(true)}>
                  Start from a template
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      {!!scheduled.length && (
        <section className="panel-card">
          <div className="panel-heading">
            <h2>
              <IconClock size={16} /> Waiting to run
            </h2>
            <small>Resumes when the app is open</small>
          </div>
          {scheduled.slice(0, 8).map((entry) => {
            const workflow = workflows.find((row) => row.id === entry.workflowId);
            const node = (workflow?.nodes || []).find((row) => row.id === entry.nodeId);
            const record = (db[entry.recordType] || []).find(
              (row) => row.id === entry.recordId,
            );
            return (
              <div className="run-row" key={entry.id}>
                <span className="run-mark">⏱</span>
                <div>
                  <strong>{entry.workflowName}</strong>
                  <small>
                    {record?.name || "Deleted record"} ·{" "}
                    {node
                      ? nodeSummary(node, entry.recordType, db)
                      : entry.action
                        ? "Next step"
                        : "Continue flow"}
                  </small>
                </div>
                <small>{new Date(entry.runAt).toLocaleString()}</small>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    commit(
                      (state) => runScheduledEntry(state, entry.id),
                      "Ran queued workflow step",
                    )
                  }
                >
                  Run now
                </Button>
              </div>
            );
          })}
        </section>
      )}

      <section className="panel-card">
        <div className="panel-heading">
          <h2>
            <IconAutomation size={16} /> Recent runs
          </h2>
          <small>{runs.length} total</small>
        </div>
        {groupedRuns.slice(0, 10).map((group) => {
          const first = group.runs[0];
          const failed = group.runs.some((run) => run.status === "failed");
          return (
            <details className="run-group" key={group.key}>
              <summary className="run-row">
                <span className={"run-mark" + (failed ? " failed" : "")}>
                  {failed ? "!" : "✓"}
                </span>
                <div>
                  <strong>{first.workflowName}</strong>
                  <small>
                    {`${first.targetName} → ${first.taskName || first.summary || "Updated"}${
                      group.runs.length > 1 ? ` · ${group.runs.length} steps` : ""
                    }${first.scheduled ? " · queued" : ""}`}
                  </small>
                </div>
                <small>{new Date(first.at).toLocaleString()}</small>
              </summary>
              <ol className="run-steps">
                {[...group.runs].reverse().map((run) => (
                  <li key={run.id} className={run.status === "failed" ? "failed" : ""}>
                    <span>{run.summary || run.taskName || "Updated"}</span>
                    {run.status === "failed" && <em>failed</em>}
                  </li>
                ))}
              </ol>
            </details>
          );
        })}
        {!runs.length && (
          <p className="empty-copy">
            No runs yet. Move an opportunity into the trigger stage to see a workflow fire.
          </p>
        )}
      </section>

      {templatesOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTemplatesOpen(false);
          }}
        >
          <section
            className="modal-sheet template-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Workflow templates"
          >
            <header>
              <strong>Start from a template</strong>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Close templates"
                onClick={() => setTemplatesOpen(false)}
              >
                ✕
              </Button>
            </header>
            <div className="template-grid">
              {WORKFLOW_TEMPLATES.map((template) => (
                <article className="template-card" key={template.key}>
                  <h3>{template.label}</h3>
                  <p>{template.description}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(template.build(db));
                      setTemplatesOpen(false);
                    }}
                  >
                    Use template
                  </Button>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {runner && runnerWorkflow && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRunner(null);
          }}
        >
          <section
            className="modal-sheet run-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Run workflow"
          >
            <header>
              <strong>Run “{runnerWorkflow.name}”</strong>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={() => setRunner(null)}>
                ✕
              </Button>
            </header>
            <div className="run-dialog-body">
              <label>
                Record
                <Select
                  ariaLabel="Record to run on"
                  value={runner.recordId}
                  placeholder="Choose a record…"
                  options={(db[runner.type] || []).map((row) => ({
                    value: row.id,
                    label: row.name,
                  }))}
                  onChange={(recordId) => {
                    setPreview(null);
                    setRunner((current) => ({ ...current, recordId }));
                  }}
                />
              </label>
              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={runner.dryRun}
                  onChange={(event) => {
                    setPreview(null);
                    setRunner((current) => ({ ...current, dryRun: event.target.checked }));
                  }}
                />
                Dry run — show the steps without changing anything
              </label>

              {preview && (
                <div className="run-preview" aria-live="polite">
                  <strong>
                    {preview.steps.length} step{preview.steps.length === 1 ? "" : "s"}
                    {preview.queued.length
                      ? ` · ${preview.queued.length} wait queued`
                      : ""}
                  </strong>
                  <ol>
                    {preview.steps.map((step) => (
                      <li key={step.id} className={step.status === "failed" ? "failed" : ""}>
                        {step.summary || step.taskName || "Updated"}
                        {step.status === "failed" ? " (failed)" : ""}
                      </li>
                    ))}
                    {preview.queued.map((entry) => (
                      <li key={entry.id} className="queued">
                        Pause until {new Date(entry.runAt).toLocaleDateString()}
                      </li>
                    ))}
                  </ol>
                  {!preview.steps.length && !preview.queued.length && (
                    <p className="muted">
                      Nothing would run. No step is connected to the trigger yet.
                    </p>
                  )}
                </div>
              )}

              <div className="run-dialog-actions">
                <Button size="sm" variant="ghost" onClick={() => setRunner(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={executeRun}
                  disabled={!runner.recordId}
                >
                  {runner.dryRun ? "Preview" : "Run now"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

import React, { useRef, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconActivity,
  IconArrowLeft,
  IconBolt,
  IconCheckbox,
  IconClock,
  IconDatabase,
  IconDeviceFloppy,
  IconGitBranch,
  IconMail,
  IconMinus,
  IconNote,
  IconPlayerStop,
  IconPlus,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { Select } from "./Select";
import { confirmAction } from "./dialogs";
import { collections } from "./store";
import {
  fieldDef,
  fieldDefs,
  objectDef,
  optionsFor,
  stages,
} from "./schema";
import {
  OPERATOR_LABELS,
  conditionFields,
  defaultCondition,
  editableFields,
  operatorNeedsValue,
  operatorOptions,
} from "./workflow-engine.mjs";

const NODE_WIDTH = 224;
const NODE_HEIGHT = 96;

const WIDGETS = [
  { kind: "condition", label: "Condition", hint: "Route on a field value", icon: IconGitBranch, tone: "violet" },
  { kind: "create_task", label: "Create task", hint: "Add follow-up work", icon: IconCheckbox, tone: "green" },
  { kind: "create_note", label: "Create note", hint: "Write to the record", icon: IconNote, tone: "violet" },
  { kind: "log_activity", label: "Log activity", hint: "Add an audit entry", icon: IconActivity, tone: "blue" },
  { kind: "email_draft", label: "Email draft", hint: "Prepare a local draft", icon: IconMail, tone: "amber" },
  { kind: "update_field", label: "Update field", hint: "Change a record", icon: IconDatabase, tone: "rose" },
  { kind: "assign_owner", label: "Assign owner", hint: "Hand it to a teammate", icon: IconUser, tone: "blue" },
  { kind: "stop", label: "Stop flow", hint: "End the run here", icon: IconPlayerStop, tone: "rose" },
  { kind: "wait", label: "Wait", hint: "Pause before the next step", icon: IconClock, tone: "amber" },
];

function nodeTone(node) {
  if (node.type === "condition") return "violet";
  if (node.type === "wait") return "amber";
  if (node.action === "update_field") return "rose";
  if (node.action === "assign_owner") return "blue";
  if (node.action === "create_note") return "violet";
  if (node.action === "log_activity") return "blue";
  if (node.action === "email_draft") return "amber";
  if (node.action === "stop") return "rose";
  return "green";
}

function nodeTitle(node, type, db) {
  if (node.type === "trigger") return "Trigger";
  if (node.type === "condition") {
    const row = node.conditions?.find((check) => check.field);
    const field = row ? fieldDef(type, row.field, db) : null;
    return field ? `If ${field.label}` : "Condition";
  }
  if (node.type === "wait") return "Wait";
  if (node.action === "create_task") return node.title || "Create task";
  if (node.action === "create_note") return node.title || "Create note";
  if (node.action === "log_activity") return "Log activity";
  if (node.action === "email_draft") return node.title || "Email draft";
  if (node.action === "stop") return "Stop flow";
  if (node.action === "update_field") {
    const field = fieldDef(type, node.field, db);
    return field ? `Set ${field.label}` : "Update field";
  }
  return node.value ? `Assign ${node.value}` : "Assign owner";
}

function nodeDetail(node, type, db, trigger) {
  if (node.type === "trigger") {
    if (trigger?.event === "created") return "Record created";
    if (trigger?.event === "stage_changed")
      return `Stage → ${trigger.value || "any stage"}`;
    const field = fieldDef(type, trigger?.field, db);
    return `${field?.label || trigger?.field || "Field"} changes`;
  }
  if (node.type === "condition") {
    const row = node.conditions?.find((check) => check.field);
    if (!row) return "No check yet";
    const field = fieldDef(type, row.field, db);
    const option = optionsFor(field, db).find(
      (value) => (typeof value === "string" ? value : value.id) === row.value,
    );
    const shown = option
      ? typeof option === "string"
        ? option
        : option.name
      : row.value;
    const needsValue = operatorNeedsValue(row.op);
    return `${OPERATOR_LABELS[row.op] || row.op}${
      shown ? ` ${shown}` : needsValue ? " · needs a value" : ""
    }${node.negate ? " · inverted" : ""}`;
  }
  if (node.type === "wait") return `${node.days} day${Number(node.days) === 1 ? "" : "s"}`;
  if (node.action === "create_task") return `Due in ${node.delay || 0} day(s)`;
  if (node.action === "create_note")
    return node.body ? node.body.slice(0, 48) : "Adds a note to the record";
  if (node.action === "log_activity") return node.title || "Adds an activity entry";
  if (node.action === "email_draft")
    return `${node.value || "Recipient from record"} · not sent`;
  if (node.action === "stop") return "Ends this run";
  if (node.action === "update_field") {
    const field = fieldDef(type, node.field, db);
    const option = optionsFor(field, db).find(
      (row) => (typeof row === "string" ? row : row.id) === node.value,
    );
    return option ? (typeof option === "string" ? option : option.name) : node.value || "Choose a value";
  }
  return node.value || "Choose a member";
}

function FieldValue({ field, db, value, onChange, ariaLabel }) {
  if (!field) return null;
  if (["select", "owner", "relation"].includes(field.type)) {
    return (
      <Select
        ariaLabel={ariaLabel}
        value={String(value ?? "")}
        onChange={onChange}
        placeholder="Choose…"
        options={optionsFor(field, db).map((option) =>
          typeof option === "string"
            ? { value: option, label: option }
            : { value: option.id, label: option.name },
        )}
      />
    );
  }
  if (["number", "currency", "percent"].includes(field.type)) {
    return (
      <input
        aria-label={ariaLabel}
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.type === "date") {
    return (
      <input
        aria-label={ariaLabel}
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <Select
        ariaLabel={ariaLabel}
        value={String(value ?? "")}
        onChange={onChange}
        options={[
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
      />
    );
  }
  return (
    <input
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TriggerSettings({ draft, db, patch }) {
  const objectTypes = collections(db).filter((type) => db[type]);
  const objectType = draft.trigger.object;
  const triggerFields = fieldDefs(objectType, db).filter(
    (field) => !field.system && !field.readonly && field.type !== "computed" && field.type !== "textarea",
  );
  const field =
    triggerFields.find((row) => row.key === draft.trigger.field) || triggerFields[0];
  const event = draft.trigger.event;

  return (
    <div className="studio-fields">
      <label>
        Record type
        <Select
          ariaLabel="Trigger record type"
          value={objectType}
          onChange={(value) =>
            patch({ trigger: { ...draft.trigger, object: value, field: "", value: "" } })
          }
          options={objectTypes.map((type) => ({
            value: type,
            label: objectDef(type, db).plural,
          }))}
        />
      </label>
      <label>
        When
        <Select
          ariaLabel="Trigger event"
          value={event}
          onChange={(value) => {
            const next = { ...draft.trigger, event: value, value: "" };
            if (value === "stage_changed") {
              next.object = "deals";
              next.field = "stage";
              next.value = "Negotiation";
            }
            patch({ trigger: next });
          }}
          options={[
            { value: "stage_changed", label: "Opportunity stage changes to…" },
            { value: "created", label: "A record is created" },
            { value: "field_changed", label: "A field changes to…" },
          ]}
        />
      </label>
      {event === "stage_changed" && (
        <label>
          Stage
          <Select
            ariaLabel="Trigger stage"
            value={draft.trigger.value || "Negotiation"}
            onChange={(value) => patch({ trigger: { ...draft.trigger, value } })}
            options={stages.map((stage) => ({ value: stage, label: stage }))}
          />
        </label>
      )}
      {event === "field_changed" && (
        <>
          <label>
            Field
            <Select
              ariaLabel="Trigger field"
              value={draft.trigger.field || field?.key || ""}
              onChange={(value) =>
                patch({ trigger: { ...draft.trigger, field: value, value: "" } })
              }
              options={triggerFields.map((row) => ({ value: row.key, label: row.label }))}
            />
          </label>
          <label>
            New value (optional)
            <FieldValue
              ariaLabel="Trigger value"
              field={field}
              db={db}
              value={draft.trigger.value}
              onChange={(value) => patch({ trigger: { ...draft.trigger, value } })}
            />
          </label>
        </>
      )}
      <p className="studio-hint">
        {event === "created"
          ? "Runs once when a record of this type is created."
          : event === "stage_changed"
            ? "Runs when an opportunity moves into the chosen stage."
            : "Runs when the chosen field changes to the chosen value."}
      </p>
    </div>
  );
}

function ConditionSettings({ node, type, db, update }) {
  const fields = conditionFields(type, db);
  const rows = node.conditions || [];

  function changeRow(index, patch) {
    update({
      conditions: rows.map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    });
  }

  return (
    <div className="studio-fields">
      {rows.length > 1 && (
        <label>
          Match
          <Select
            ariaLabel="Condition match"
            value={node.logic || "and"}
            onChange={(logic) => update({ logic })}
            options={[
              { value: "and", label: "All conditions" },
              { value: "or", label: "Any condition" },
            ]}
          />
        </label>
      )}
      {rows.map((row, index) => {
        const field = fields.find((item) => item.key === row.field) || fields[0];
        const operators = operatorOptions(field);
        const op = operators.includes(row.op) ? row.op : operators[0];
        return (
          <div className="studio-condition" key={row.id || index}>
            <Select
              ariaLabel={`Condition ${index + 1} field`}
              value={row.field || field?.key || ""}
              onChange={(value) => {
                const next = fields.find((item) => item.key === value);
                changeRow(index, {
                  field: value,
                  op: operatorOptions(next)[0],
                  value: "",
                });
              }}
              options={fields.map((item) => ({ value: item.key, label: item.label }))}
            />
            <Select
              ariaLabel={`Condition ${index + 1} operator`}
              value={op}
              onChange={(value) => changeRow(index, { op: value })}
              options={operators.map((value) => ({
                value,
                label: OPERATOR_LABELS[value] || value,
              }))}
            />
            {operatorNeedsValue(op) ? (
              <FieldValue
                ariaLabel={`Condition ${index + 1} value`}
                field={field}
                db={db}
                value={row.value}
                onChange={(value) => changeRow(index, { value })}
              />
            ) : (
              <span className="studio-static">No value</span>
            )}
            {rows.length > 1 && (
              <button
                type="button"
                className="studio-icon-button"
                aria-label={`Remove condition ${index + 1}`}
                onClick={() => update({ conditions: rows.filter((_, at) => at !== index) })}
              >
                <IconX size={13} />
              </button>
            )}
          </div>
        );
      })}
      <Button
        size="sm"
        variant="ghost"
        startIcon={<IconPlus size={13} />}
        onClick={() => update({ conditions: [...rows, defaultCondition(type, db)] })}
      >
        Add condition
      </Button>
      <label className="studio-check">
        <input
          type="checkbox"
          checked={node.negate === true}
          onChange={(event) => update({ negate: event.target.checked })}
        />
        Invert (continue when this does not match)
      </label>
      <p className="studio-hint">
        Connect the <strong>Yes</strong> and <strong>No</strong> circles to decide where each
        result goes.
      </p>
    </div>
  );
}

function ActionSettings({ node, type, db, update }) {
  const fields = editableFields(type, db);
  const field = fields.find((row) => row.key === node.field) || fields[0];

  if (node.action === "create_note") {
    return (
      <div className="studio-fields">
        <label>
          Note title
          <input
            aria-label="Note title"
            value={node.title || ""}
            maxLength={120}
            placeholder="Call summary"
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label>
          Note body
          <textarea
            aria-label="Note body"
            rows={3}
            value={node.body || ""}
            maxLength={600}
            placeholder="What should the note say?"
            onChange={(event) => update({ body: event.target.value })}
          />
        </label>
        <p className="studio-hint">The note is linked to the triggering record.</p>
      </div>
    );
  }

  if (node.action === "log_activity") {
    return (
      <div className="studio-fields">
        <label>
          Activity text
          <input
            aria-label="Activity text"
            value={node.title || ""}
            maxLength={120}
            placeholder="Workflow ran"
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <p className="studio-hint">
          Adds an entry to the workspace activity log with this record linked.
        </p>
      </div>
    );
  }

  if (node.action === "email_draft") {
    return (
      <div className="studio-fields">
        <label>
          To (optional)
          <input
            aria-label="Email recipient"
            value={node.value || ""}
            placeholder="Defaults to the record email"
            onChange={(event) => update({ value: event.target.value })}
          />
        </label>
        <label>
          Subject
          <input
            aria-label="Email subject"
            value={node.title || ""}
            maxLength={120}
            placeholder="Following up"
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label>
          Body
          <textarea
            aria-label="Email body"
            rows={4}
            value={node.body || ""}
            maxLength={600}
            onChange={(event) => update({ body: event.target.value })}
          />
        </label>
        <p className="studio-hint">
          Saves a draft in the Emails log. Nothing is sent — sending needs a backend.
        </p>
      </div>
    );
  }

  if (node.action === "stop") {
    return (
      <div className="studio-fields">
        <p className="studio-hint">
          Ends this run. Steps after it never execute, even if they are connected.
        </p>
      </div>
    );
  }

  if (node.action === "create_task") {
    return (
      <div className="studio-fields">
        <label>
          Task title
          <input
            aria-label="Task title"
            value={node.title || ""}
            maxLength={120}
            placeholder="Send implementation plan"
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label>
          Due in (days)
          <input
            aria-label="Task due days"
            type="number"
            min="0"
            max="365"
            value={node.delay ?? 0}
            onChange={(event) => update({ delay: event.target.value })}
          />
        </label>
        <p className="studio-hint">
          The task is linked to the triggering record and owned by its owner.
        </p>
      </div>
    );
  }

  if (node.action === "update_field") {
    return (
      <div className="studio-fields">
        <label>
          Field
          <Select
            ariaLabel="Update field"
            value={node.field || field?.key || ""}
            onChange={(value) => update({ field: value, value: "" })}
            options={fields.map((row) => ({ value: row.key, label: row.label }))}
          />
        </label>
        <label>
          New value
          <FieldValue
            ariaLabel="Update value"
            field={field}
            db={db}
            value={node.value}
            onChange={(value) => update({ value })}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="studio-fields">
      <label>
        Owner
        <Select
          ariaLabel="Assign owner"
          value={String(node.value ?? "")}
          onChange={(value) => update({ value })}
          options={(db.members || []).map((member) => ({ value: member, label: member }))}
        />
      </label>
    </div>
  );
}

function Inspector({ node, draft, db, update, remove, onSelect }) {
  const type = draft.trigger.object;
  const outgoing = (draft.edges || []).filter((edge) => edge.from === node.id);

  return (
    <aside className="studio-inspector">
      <div className="studio-inspector-head">
        <small>Step settings</small>
        <Tag color="gray">{node.type === "action" ? node.action            .replaceAll("_", " ") : node.type}</Tag>
      </div>
      <h3>{nodeTitle(node, type, db)}</h3>

      {node.type === "trigger" ? (
        <TriggerSettings
          draft={draft}
          db={db}
          patch={(patch) => update(patch, "trigger")}
        />
      ) : node.type === "condition" ? (
        <ConditionSettings node={node} type={type} db={db} update={update} />
      ) : node.type === "wait" ? (
        <div className="studio-fields">
          <label>
            Days to wait
            <input
              aria-label="Wait days"
              type="number"
              min="1"
              max="90"
              value={node.days ?? 1}
              onChange={(event) => update({ days: event.target.value })}
            />
          </label>
          <p className="studio-hint">
            The rest of the flow waits too. Timed steps run when you next open the app —
            there is no background worker.
          </p>
        </div>
      ) : (
        <ActionSettings node={node} type={type} db={db} update={update} />
      )}

      {!!outgoing.length && (
        <div className="studio-connections">
          <h4>Connections</h4>
          {outgoing.map((edge) => {
            const target = draft.nodes.find((row) => row.id === edge.to);
            return (
              <div key={edge.id}>
                <span>
                  {edge.port === "true" ? "Yes → " : edge.port === "false" ? "No → " : "→ "}
                  {target ? nodeTitle(target, type, db) : "Missing step"}
                </span>
                <button
                  type="button"
                  className="studio-icon-button"
                  aria-label={`Remove connection to ${target?.name || edge.to}`}
                  onClick={() =>
                    update({ edges: draft.edges.filter((row) => row.id !== edge.id) }, "edges")
                  }
                >
                  <IconX size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {node.type !== "trigger" && (
        <div className="studio-inspector-actions">
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconTrash size={14} />}
            onClick={() => remove(node)}
          >
            Delete step
          </Button>
        </div>
      )}
      {node.type === "trigger" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const first = draft.nodes.find((row) => row.type !== "trigger");
            if (first) onSelect(first.id);
          }}
        >
          Continue to first step
        </Button>
      )}
    </aside>
  );
}

export function WorkflowStudio({ workflow, db, commit, onClose }) {
  const [draft, setDraft] = useState(() => structuredClone(workflow));
  const [selected, setSelected] = useState("n_trigger");
  const [connecting, setConnecting] = useState(null);
  const [zoom, setZoom] = useState(0.85);
  const [error, setError] = useState("");
  const drag = useRef(null);
  const board = useRef(null);
  const type = draft.trigger?.object || "deals";
  const node = draft.nodes.find((row) => row.id === selected) || draft.nodes[0];

  function update(patch, key) {
    setDraft((current) => {
      if (key === "trigger") return { ...current, trigger: patch.trigger };
      if (key === "edges") return { ...current, edges: patch.edges };
      return {
        ...current,
        nodes: current.nodes.map((row) =>
          row.id === selected ? { ...row, ...patch } : row,
        ),
      };
    });
    setError("");
  }

  function freeSpot() {
    let x = 360;
    let y = 120;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const taken = draft.nodes.some(
        (row) =>
          Math.abs(row.x - x) < NODE_WIDTH + 24 &&
          Math.abs(row.y - y) < NODE_HEIGHT + 30,
      );
      if (!taken) break;
      x += 280;
      if (x > 1240) {
        x = 360;
        y += 150;
      }
    }
    return { x, y };
  }

  function addWidget(kind, x, y) {
    const id = crypto.randomUUID();
    const spot = x === undefined ? freeSpot() : { x, y };
    const base = {
      id,
      type: kind === "condition" || kind === "wait" ? kind : "action",
      x: Math.max(20, Math.min(1300, spot.x)),
      y: Math.max(20, Math.min(760, spot.y)),
    };
    const next =
      kind === "condition"
        ? { ...base, conditions: [defaultCondition(type, db)], logic: "and", negate: false }
        : kind === "wait"
          ? { ...base, days: 1 }
          : {
              ...base,
              action: kind,
              title: kind === "create_task" ? "Follow up" : "",
              delay: 1,
              field: "",
              value: "",
              body: "",
            };
    setDraft((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelected(id);
    setError("");
  }

  function connect(targetId) {
    if (!connecting) return;
    if (connecting.from === targetId) {
      setConnecting(null);
      return;
    }
    setDraft((current) => ({
      ...current,
      edges: [
        ...current.edges.filter(
          (edge) => edge.from !== connecting.from || (edge.port || "out") !== connecting.port,
        ),
        {
          id: crypto.randomUUID(),
          from: connecting.from,
          to: targetId,
          port: connecting.port,
        },
      ],
    }));
    setConnecting(null);
  }

  async function removeNode(target) {
    if (target.type === "trigger") return;
    if (!(await confirmAction("Remove this step and its connections?"))) return;
    setDraft((current) => ({
      ...current,
      nodes: current.nodes.filter((row) => row.id !== target.id),
      edges: current.edges.filter(
        (edge) => edge.from !== target.id && edge.to !== target.id,
      ),
    }));
    setSelected("n_trigger");
  }

  function validate() {
    if (!draft.name.trim()) return "Give this workflow a name.";
    if (draft.nodes.length > 40) return "A workflow can hold at most 40 steps.";
    if (!draft.nodes.some((row) => row.type === "trigger")) return "The trigger is missing.";
    for (const node of draft.nodes) {
      if (node.type === "condition") {
        if (!(node.conditions || []).some((row) => row.field))
          return "Every condition needs at least one check.";
        const incomplete = (node.conditions || []).find(
          (row) => row.field && operatorNeedsValue(row.op) && String(row.value ?? "") === "",
        );
        if (incomplete) return "Give every condition a value, or use an is empty check.";
      }
      if (node.type === "wait" && !(Number(node.days) > 0))
        return "Waits need at least one day.";
      if (node.type === "action" && node.action === "create_task" && !String(node.title || "").trim())
        return "Every task step needs a title.";
      if (
        node.type === "action" &&
        node.action === "create_note" &&
        !String(node.title || "").trim()
      )
        return "Every note step needs a title.";
      if (
        node.type === "action" &&
        node.action === "email_draft" &&
        !String(node.title || "").trim()
      )
        return "Every email draft needs a subject.";
      if (node.type === "action" && node.action === "update_field" && !node.field)
        return "Every update step needs a field.";
      if (node.type === "action" && node.action === "assign_owner" && !node.value)
        return "Every owner step needs a member.";
    }
    return "";
  }

  function save() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    const saved = {
      ...draft,
      name: draft.name.trim(),
      updatedAt: new Date().toISOString(),
      nodes: draft.nodes.map((node) => ({
        ...node,
        days: node.days === undefined ? undefined : Math.max(1, Math.min(90, Number(node.days) || 1)),
        delay: node.delay === undefined ? undefined : Math.max(0, Math.min(365, Number(node.delay) || 0)),
      })),
    };
    const existing = (db.workflows || []).some((row) => row.id === saved.id);
    const ok = commit(
      (state) => {
        state.workflows ??= [];
        const index = state.workflows.findIndex((row) => row.id === saved.id);
        if (index >= 0) state.workflows[index] = saved;
        else state.workflows.unshift(saved);
        state.workflowRuns ??= [];
      },
      `${existing ? "Updated" : "Created"} workflow · ${saved.name}`,
    );
    if (ok) onClose();
    else setError("The workflow could not be saved.");
  }

  return (
    <div className="studio">
      <header className="studio-topbar">
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconArrowLeft size={14} />}
          onClick={onClose}
        >
          Workflows
        </Button>
        <input
          className="studio-name"
          aria-label="Workflow name"
          value={draft.name}
          maxLength={80}
          onChange={(event) =>
            setDraft((current) => ({ ...current, name: event.target.value }))
          }
        />
        <label className="studio-check studio-active">
          <input
            type="checkbox"
            checked={draft.enabled !== false}
            onChange={(event) =>
              setDraft((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          Active
        </label>
        {error && <span className="studio-error" role="alert">{error}</span>}
        <div className="studio-topbar-actions">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="solid"
            startIcon={<IconDeviceFloppy size={14} />}
            onClick={save}
          >
            Save workflow
          </Button>
        </div>
      </header>

      <div className="studio-body">
        <aside className="studio-palette">
          <h3>Steps</h3>
          <p>Drag onto the canvas or click to add.</p>
          {WIDGETS.map((widget) => (
            <button
              key={widget.kind}
              type="button"
              draggable
              className={`studio-widget tone-${widget.tone}`}
              onDragStart={(event) =>
                event.dataTransfer.setData("application/linear-step", widget.kind)
              }
              onClick={() => addWidget(widget.kind)}
            >
              <span className="studio-widget-icon">
                <widget.icon size={17} />
              </span>
              <span>
                <strong>{widget.label}</strong>
                <small>{widget.hint}</small>
              </span>
              <IconPlus size={13} />
            </button>
          ))}
          <div className="studio-palette-help">
            <strong>Connect steps</strong>
            Click a circle on the right of a step, then a step to its right.
            Conditions have <em>Yes</em> and <em>No</em> circles.
          </div>
        </aside>

        <div
          className="studio-canvas-wrap"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const kind = event.dataTransfer.getData("application/linear-step");
            if (!kind) return;
            const rect = board.current.getBoundingClientRect();
            addWidget(
              kind,
              (event.clientX - rect.left + board.current.scrollLeft) / zoom,
              (event.clientY - rect.top + board.current.scrollTop) / zoom,
            );
          }}
        >
          <div
            className="studio-canvas"
            ref={board}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") setConnecting(null);
            }}
          >
            <div
              className="studio-stage"
              style={{ width: 1700 * zoom, height: 1000 * zoom }}
            >
              <div
                className="studio-world"
                style={{ transform: `scale(${zoom})`, width: 1700, height: 1000 }}
              >
                <svg className="studio-edges" width="1700" height="1000">
                  <defs>
                    <marker
                      id="studio-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                    </marker>
                  </defs>
                  {draft.edges.map((edge) => {
                    const from = draft.nodes.find((row) => row.id === edge.from);
                    const to = draft.nodes.find((row) => row.id === edge.to);
                    if (!from || !to) return null;
                    const startY =
                      from.type === "condition"
                        ? from.y + (edge.port === "false" ? 70 : 40)
                        : from.y + NODE_HEIGHT / 2;
                    const x1 = from.x + NODE_WIDTH;
                    const y1 = startY;
                    const x2 = to.x;
                    const y2 = to.y + NODE_HEIGHT / 2;
                    return (
                      <g key={edge.id} className={`studio-edge port-${edge.port || "out"}`}>
                        <path
                          d={`M${x1},${y1} C${x1 + 80},${y1} ${x2 - 80},${y2} ${x2},${y2}`}
                          markerEnd="url(#studio-arrow)"
                        />
                        {edge.port !== "out" && (
                          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8}>
                            {edge.port === "true" ? "Yes" : "No"}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {draft.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`studio-node tone-${nodeTone(node)} ${
                      selected === node.id ? "is-selected" : ""
                    }`}
                    style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                    data-node-id={node.id}
                  >
                    {node.type !== "trigger" && (
                      <button
                        type="button"
                        className="studio-port is-input"
                        aria-label={`Connect into ${nodeTitle(node, type, db)}`}
                        onClick={() => (connecting ? connect(node.id) : setSelected(node.id))}
                      />
                    )}
                    <button
                      type="button"
                      className="studio-node-body"
                      aria-label={`Select ${nodeTitle(node, type, db)}`}
                      onClick={() => setSelected(node.id)}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        setSelected(node.id);
                        drag.current = {
                          id: node.id,
                          x: event.clientX,
                          y: event.clientY,
                          startX: node.x,
                          startY: node.y,
                        };
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerMove={(event) => {
                        const start = drag.current;
                        if (start?.id !== node.id) return;
                        setDraft((current) => ({
                          ...current,
                          nodes: current.nodes.map((row) =>
                            row.id === node.id
                              ? {
                                  ...row,
                                  x: Math.max(0, Math.min(1400, start.startX + (event.clientX - start.x) / zoom)),
                                  y: Math.max(0, Math.min(820, start.startY + (event.clientY - start.y) / zoom)),
                                }
                              : row,
                          ),
                        }));
                      }}
                      onPointerUp={() => {
                        drag.current = null;
                      }}
                      onPointerCancel={() => {
                        drag.current = null;
                      }}
                    >
                      <span className="studio-node-icon">
                        {node.type === "trigger" ? (
                          <IconBolt size={18} />
                        ) : node.type === "condition" ? (
                          <IconGitBranch size={18} />
                        ) : node.type === "wait" ? (
                          <IconClock size={18} />
                        ) : node.action === "update_field" ? (
                          <IconDatabase size={18} />
                        ) : node.action === "assign_owner" ? (
                          <IconUser size={18} />
                        ) : (
                          <IconCheckbox size={18} />
                        )}
                      </span>
                      <span className="studio-node-copy">
                        <small>
                          {node.type === "trigger"
                            ? "TRIGGER"
                            : node.type === "condition"
                              ? "CONDITION"
                              : node.type === "wait"
                                ? "WAIT"
                                : "ACTION"}
                        </small>
                        <strong>{nodeTitle(node, type, db)}</strong>
                        <em>{nodeDetail(node, type, db, draft.trigger)}</em>
                      </span>
                    </button>

                    {node.type === "condition" ? (
                      <>
                        <button
                          type="button"
                          className={`studio-port is-output port-true ${
                            connecting?.from === node.id && connecting.port === "true"
                              ? "is-connecting"
                              : ""
                          }`}
                          aria-label={`Connect yes from ${nodeTitle(node, type, db)}`}
                          onClick={() =>
                            connecting?.from === node.id && connecting.port === "true"
                              ? setConnecting(null)
                              : setConnecting({ from: node.id, port: "true" })
                          }
                        >
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          className={`studio-port is-output port-false ${
                            connecting?.from === node.id && connecting.port === "false"
                              ? "is-connecting"
                              : ""
                          }`}
                          aria-label={`Connect no from ${nodeTitle(node, type, db)}`}
                          onClick={() =>
                            connecting?.from === node.id && connecting.port === "false"
                              ? setConnecting(null)
                              : setConnecting({ from: node.id, port: "false" })
                          }
                        >
                          <span>No</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={`studio-port is-output ${
                          connecting?.from === node.id ? "is-connecting" : ""
                        }`}
                        aria-label={`Connect from ${nodeTitle(node, type, db)}`}
                        onClick={() =>
                          connecting?.from === node.id
                            ? setConnecting(null)
                            : setConnecting({ from: node.id, port: "out" })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="studio-canvas-footer">
            <span>
              {connecting
                ? "Choose a step to connect to · Esc to cancel"
                : `${draft.nodes.length} steps · ${draft.edges.length} connections`}
            </span>
            <div>
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom((value) => Math.max(0.5, +(value - 0.1).toFixed(2)))}
              >
                <IconMinus size={15} />
              </button>
              <button type="button" aria-label="Reset zoom" onClick={() => setZoom(0.85)}>
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom((value) => Math.min(1.3, +(value + 0.1).toFixed(2)))}
              >
                <IconPlus size={15} />
              </button>
            </div>
          </div>
        </div>

        {node && (
          <Inspector
            node={node}
            draft={draft}
            db={db}
            update={update}
            remove={removeNode}
            onSelect={setSelected}
          />
        )}
      </div>
    </div>
  );
}

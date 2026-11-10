import { confirmAction, notifyUser } from "./dialogs";
import { LeadConversion } from "./LeadConversion";
import { TaskChecklist } from "./TaskChecklist";
import { TaskSchedule } from "./TaskSchedule";
import { pipelineProbability } from "./pipelines.mjs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import {
  IconAlignLeft,
  IconAt,
  IconBuilding,
  IconCalendar,
  IconChevronRight,
  IconCopy,
  IconCurrencyDollar,
  IconHash,
  IconLink,
  IconMail,
  IconMapPin,
  IconNote,
  IconPaperclip,
  IconPhone,
  IconPlus,
  IconStar,
  IconTag,
  IconTextSize,
  IconToggleRight,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import {
  collections,
  db as liveDb,
  enabledCollections,
} from "./store";
import {
  fieldDefs,
  featureEnabled,
  objectDef,
  stageProbability,
  tagColorFor,
  today,
} from "./schema";
import { displayValue } from "./format";
import { FieldEditor } from "./FieldEditor";
import { QuoteBuilder } from "./QuoteBuilder";
import { CampaignStudio } from "./CampaignStudio";
import { FieldControl } from "./FieldEditor";
import { moveToTrash } from "./trash";

const FIELD_ICONS = {
  name: IconTextSize,
  website: IconLink,
  linkedIn: IconLink,
  email: IconAt,
  phone: IconPhone,
  address: IconMapPin,
  city: IconMapPin,
  country: IconMapPin,
  company: IconBuilding,
  contact: IconUser,
  owner: IconUsers,
  amount: IconCurrencyDollar,
  annualRevenue: IconCurrencyDollar,
  date: IconCalendar,
  meetingDate: IconCalendar,
  nextFollowUp: IconCalendar,
  lastContacted: IconCalendar,
  renewalDate: IconCalendar,
  employees: IconHash,
  probability: IconHash,
  stage: IconTag,
  status: IconTag,
  priority: IconTag,
  category: IconTag,
  taskType: IconTag,
  direction: IconTag,
  accountTier: IconTag,
  leadSource: IconTag,
  icp: IconToggleRight,
  budget: IconCurrencyDollar,
  spent: IconCurrencyDollar,
  details: IconAlignLeft,
};

function iconForField(field) {
  if (!field) return IconTextSize;
  if (FIELD_ICONS[field.key]) return FIELD_ICONS[field.key];
  if (["date", "datetime"].includes(field.type)) return IconCalendar;
  if (["number", "currency", "percent"].includes(field.type)) return IconHash;
  if (field.type === "relation") return IconLink;
  if (["select", "owner", "boolean"].includes(field.type)) return IconTag;
  if (field.type === "textarea") return IconAlignLeft;
  return IconTextSize;
}

function defaultsFor(type, db) {
  const owner = db.members?.[0] || "";
  if (type === "deals")
    return {
      stage: "Prospecting",
      pipeline: db.defaultPipelineId,
      probability: pipelineProbability(db, db.defaultPipelineId, "Prospecting", stageProbability),
      date: today(30),
      owner,
    };
  if (type === "tasks")
    return {
      status: "Open",
      priority: "Normal",
      taskType: "To-do",
      date: today(),
      owner,
    };
  if (type === "leads") return {status:"Not contacted",priority:"Normal",owner};
  if (type === "contacts") return { status: "Lead", owner };
  if (type === "companies") return { owner, icp: false };
  if (type === "emails") return { direction: "Outbound", date: today() };
  if (type === "projects")
    return { status: "Planning", progress: 0, startDate: today(), dueDate: today(30), owner };
  if (type === "campaigns")
    return { status: "Planned", channel: "Email", startDate: today(), budget: 0, spend: 0, owner };
  if (type === "tickets")
    return { status: "Open", priority: "Normal", category: "Question", opened: today(), owner };
  return {};
}

function RecordValue({ field, record, type, db }) {
  const text = displayValue(record, field.key, type, db);
  if (!text) return <span className="record-empty">Add {field.label.toLowerCase()}…</span>;
  if (field.type === "select")
    return <Tag color={tagColorFor(field, text)}>{text}</Tag>;
  if (field.type === "boolean")
    return <span className="boolean">{text === "Yes" ? "Yes" : "No"}</span>;
  if (field.type === "textarea")
    return <span className="record-long">{text}</span>;
  if (["relation", "owner", "name"].includes(field.key) || field.type === "relation")
    return (
      <span className="record-person">
        <Avatar
          size="xs"
          shape={field.type === "relation" ? "rounded-square" : "circle"}
          name={text}
        />
        {text}
      </span>
    );
  return <span>{text}</span>;
}

function FieldList({
  type,
  record,
  db,
  layout,
  editing,
  setEditing,
  commit,
  writable = true,
}) {
  const fields = fieldDefs(type, db);
  const sections = new Map();
  for (const field of fields) {
    const section = layout?.groups?.[field.key] || field.section || "General";
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(field);
  }

  return [...sections.entries()].map(([section, sectionFields]) => (
    <section key={section} className="record-section">
      <h4>{section}</h4>
      {sectionFields.map((field) => {
        const canEdit = writable && !field.readonly && !field.system && field.type !== "computed";
        const FieldIcon = iconForField(field);
        return (
          <div className="record-field" key={field.key}>
            <span className="record-field-label">
              <FieldIcon size={13} aria-hidden="true" />
              {field.label}
            </span>
            <div className="record-field-value">
              {editing === field.key ? (
                <FieldEditor
                  field={field}
                  record={record}
                  type={type}
                  db={db}
                  onSave={(value) => {
                    if (
                      commit(
                        (state) => {
                          const match = state[type].find((row) => row.id === record.id);
                          if (match) match[field.key] = value;
                        },
                        `Updated ${field.label} · ${record.name}`,
                      )
                    )
                      setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <button
                  type="button"
                  className={"record-field-button" + (canEdit ? " editable" : "")}
                  aria-label={
                    canEdit ? `Edit ${field.label}` : `${field.label} (read only)`
                  }
                  onClick={() => canEdit && setEditing(field.key)}
                >
                  <RecordValue field={field} record={record} type={type} db={db} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  ));
}

function NewRecordForm({ type, draft, db, close, commit, onCreated }) {
  const object = objectDef(type, db);
  const fields = fieldDefs(type, db).filter((field) => !field.system && field.type !== "computed");
  const [values, setValues] = useState(() => {
    const initial = { ...defaultsFor(type, db), ...draft };
    for (const field of fields) {
      if (initial[field.key] === undefined)
        initial[field.key] = field.type === "boolean" ? false : "";
    }
    return initial;
  });
  const [error, setError] = useState("");

  function change(key, value) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (type === "deals" && ["stage", "pipeline"].includes(key))
        next.probability = pipelineProbability(db, next.pipeline, next.stage, stageProbability) ?? current.probability;
      return next;
    });
  }

  function submit(event) {
    event.preventDefault();
    for (const field of fields) {
      if (field.required && !String(values[field.key] ?? "").trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    const record = { ...values, id: crypto.randomUUID() };
    for (const field of fields) {
      if (
        ["number", "currency", "percent"].includes(field.type) &&
        record[field.key] !== ""
      ) {
        record[field.key] = Number(record[field.key]);
        if (!Number.isFinite(record[field.key])) {
          setError(`${field.label} must be a number.`);
          return;
        }
      }
    }
    const label = object.singular.toLowerCase();
    if (
      commit(
        (state) => state[type].unshift(record),
        `Created ${label} · ${record.name}`,
      )
    ) {
      onCreated?.(record);
      close();
    }
  }

  return (
    <form className="new-record-form" onSubmit={submit} noValidate>
      <div className="new-record-grid">
        {fields.map((field) => (
          <label
            key={field.key}
            className={field.type === "textarea" ? "wide" : ""}
          >
            {field.label}
            <FieldControl
              field={field}
              db={db}
              value={values[field.key]}
              onChange={(value) => change(field.key, value)}
            />
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <footer className="drawer-footer">
        <Button type="button" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" variant="solid">
          Create {object.singular.toLowerCase()}
        </Button>
      </footer>
    </form>
  );
}

function FilesPanel({ type, record, db, commit }) {
  const [error, setError] = useState("");
  const files = (db.files || []).filter(
    (file) => file.type === type && file.record === record.id,
  );

  async function attach(file) {
    if (!file) return;
    setError("");
    if (file.size > 1024 * 1024) {
      setError("Choose a file under 1 MB so it fits in browser storage.");
      return;
    }
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      commit(
        (state) => {
          state.files ??= [];
          state.files.push({
            id: crypto.randomUUID(),
            record: record.id,
            type,
            name: file.name,
            data,
          });
        },
        `Attached ${file.name} to ${record.name}`,
      );
    } catch {
      setError("That file could not be read.");
    }
  }

  return (
    <div className="timeline-panel">
      <div className="panel-heading">
        <h4>Files</h4>
        <label className="file-button">
          <IconPaperclip size={14} /> Attach file
          <input
            type="file"
            hidden
            onChange={(event) => {
              attach(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {files.map((file) => (
        <div className="file-row" key={file.id}>
          <a
            download={file.name}
            href={`data:application/octet-stream;base64,${file.data}`}
          >
            {file.name}
          </a>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              commit(
                (state) => {
                  state.files = state.files.filter((item) => item.id !== file.id);
                },
                `Removed attachment ${file.name}`,
              )
            }
          >
            <IconTrash size={14} />
          </Button>
        </div>
      ))}
      {!files.length && (
        <p className="muted">
          Attach briefs, call notes or contracts. Files are stored in this browser only.
        </p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TimelinePanel({ type, record, db, onEmail, onNew }) {
  const events = [];
  if (type === "deals") for (const change of record.stageHistory || []) {
    events.push({
      key: change.id, at: Date.parse(change.at), kind: "stage",
      title: change.from ? `${change.from} → ${change.to}` : `Entered ${change.to}`,
      body: `${change.fromPipeline ? change.fromPipeline + " → " : ""}${change.toPipeline} · ${change.actor}`,
    });
  }

  for (const item of db.activity || []) {
    if (item.changes?.some((change) => change.type === type && change.id === record.id)) {
      events.push({
        key: `activity-${item.at}-${item.text}`,
        at: item.at,
        kind: "activity",
        title: item.text,
        body: "",
      });
    }
  }

  for (const email of db.emails || []) {
    const related =
      (type === "emails" && email.id === record.id) ||
      (type === "contacts" && email.contact === record.id) ||
      (type === "companies" && email.company === record.id) ||
      (type === "deals" && email.deal === record.id) ||
      (type === "leads" && email.lead === record.id);
    if (related) {
      events.push({
        key: `email-${email.id}`,
        at: new Date(`${email.date}T12:00:00`).getTime(),
        kind: "email",
        title: email.name,
        body: email.details,
      });
    }
  }

  events.sort((a, b) => b.at - a.at);

  return (
    <div className="timeline-panel">
      <div className="panel-heading">
        <h4>Timeline</h4>
        <div className="panel-actions">
          <Button size="sm" variant="ghost" startIcon={<IconMail size={14} />} onClick={onEmail}>
            Log email
          </Button>
          {["deals", "companies", "contacts","leads", "projects", "tickets"].includes(type) && (
            <Button size="sm" variant="ghost" startIcon={<IconNote size={14} />} onClick={onNew}>
              New note
            </Button>
          )}
        </div>
      </div>
      {!events.length && (
        <p className="muted">
          No activity yet. Changes and logged emails will appear here.
        </p>
      )}
      {events.map((event) => (
        <article className={`timeline-event ${event.kind}`} key={event.key}>
          <span className="timeline-dot" />
          <div>
            <strong>{event.title}</strong>
            {event.body && <p>{event.body}</p>}
            <small>{new Date(event.at).toLocaleString()}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RecordPage({
  type,
  recordId,
  draft,
  db,
  close,
  commit,
  open,
  openNew,
  onDuplicate,
  onEmail,
  nav,
}) {
  const [tab, setTab] = useState("record");
  const [editing, setEditing] = useState(null);
  const object = objectDef(type, db);
  const isCampaign = type === "campaigns";
  const record = recordId
    ? (db[type] || []).find((row) => row.id === recordId)
    : draft || {};
  const exists = !!recordId && !!record?.id;
  const layout = db.layout?.[type] || {};
  const pinned = (db.pins || []).some(
    (pin) => pin.type === type && pin.id === record.id,
  );

  if (exists && !record) return null;

  function toggleFavorite() {
    if (!exists) return;
    commit(
      (state) => {
        state.pins ??= [];
        if (state.pins.some((pin) => pin.type === type && pin.id === record.id)) {
          state.pins = state.pins.filter(
            (pin) => pin.type !== type || pin.id !== record.id,
          );
        } else {
          state.pins.push({ type, id: record.id });
        }
      },
      pinned ? "Removed from favorites" : "Added to favorites",
    );
  }

  function duplicate() {
    const copy = {};
    for (const field of fieldDefs(type, db)) {
      if (!field.readonly && !field.system && field.type !== "computed")
        copy[field.key] = record[field.key];
    }
    copy.name = `${record.name} (copy)`;
    if (type === "campaigns") {
      copy.followUps = (record.followUps || []).map((step) => ({
        ...step,
        id: crypto.randomUUID(),
      }));
      copy.status = "Planned";
      copy.sentCount = 0;
      copy.sentTo = [];
      copy.followUpStep = 0;
      copy.lastSent = "";
    }
    if (type === "tasks") { copy.status = "Open"; copy.checklist = (record.checklist || []).map(item => ({ ...item, id: crypto.randomUUID(), done: false })); }
    if (type === "leads") copy.status = "Not contacted";
    onDuplicate(copy);
  }

  async function remove() {
    if (
      await confirmAction(`Move “${record.name}” to trash? You can restore it from Settings.`) &&
      commit(
        (state) => moveToTrash(state, type, record.id),
        `Moved ${record.name} to trash`,
      )
    ) {
      close();
    }
  }

  function taskPrefill() {
    if (type === "deals")
      return {
        deal: record.id,
        company: record.company,
        contact: record.contact,
        owner: record.owner,
      };
    if (type === "contacts")
      return { contact: record.id, company: record.company, owner: record.owner };
    if(type==="leads")return {lead:record.id,owner:record.owner};
    if (type === "companies") return { company: record.id, owner: record.owner };
    if (type === "projects")
      return {
        project: record.id,
        company: record.company,
        contact: record.contact,
        owner: record.owner,
      };
    if (type === "tickets")
      return { company: record.company, contact: record.contact, owner: record.owner };
    return {};
  }

  function notePrefill() {
    if (type === "deals")
      return { deal: record.id, company: record.company, contact: record.contact };
      if (type === "contacts") return { contact: record.id, company: record.company };
    if(type==="leads")return {lead:record.id};
    if (type === "companies") return { company: record.id };
    if (type === "projects")
      return { project: record.id, company: record.company, contact: record.contact };
    if (type === "tickets") return { company: record.company, contact: record.contact };
    return {};
  }

  const related = [];
  if (exists) {
    for (const otherType of enabledCollections(db)) {
      if (otherType === type) continue;
      const relationFields = fieldDefs(otherType, db).filter(
        (field) => field.type === "relation" && field.object === type,
      );
      for (const field of relationFields) {
        for (const row of db[otherType] || []) {
          if (row[field.key] === record.id)
            related.push({ type: otherType, record: row, field: field.label });
        }
      }
    }
  }

  return (
    <div
      className="record-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        className={`record-drawer${isCampaign ? " campaign-drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={exists ? record.name : `New ${object.singular}`}
      >
        <header className="drawer-header">
          <div className="drawer-breadcrumb">
            <span>{object.plural}</span>
            <IconChevronRight size={12} />
            <strong>{exists ? record.name : `New ${object.singular.toLowerCase()}`}</strong>
          </div>
          <div className="drawer-actions">
            {exists && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={pinned ? "Remove from favorites" : "Add to favorites"}
                  onClick={toggleFavorite}
                >
                  <IconStar
                    size={16}
                    fill={pinned ? "currentColor" : "none"}
                  />
                </Button>
                <Button size="sm" variant="ghost" aria-label="Duplicate record" onClick={duplicate}>
                  <IconCopy size={16} />
                </Button>
                <Button size="sm" variant="ghost" aria-label="Move to trash" onClick={remove}>
                  <IconTrash size={16} />
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" aria-label="Close record" onClick={close}>
              <IconX size={17} />
            </Button>
          </div>
        </header>

        {!isCampaign && <div className="drawer-title">
          <span className="drawer-icon">
            <Avatar
              size="md"
              shape={type === "contacts" ? "circle" : "rounded-square"}
              name={exists ? record.name : object.singular}
            />
          </span>
          <div>
            <h2>{exists ? record.name : `New ${object.singular.toLowerCase()}`}</h2>
            <small>
              {object.singular}
              {exists && record.stage ? ` · ${record.stage}` : ""}
            </small>
          </div>
        </div>}

        {exists && !isCampaign && (
          <div className="drawer-tabs" role="tablist">
            {["record", "timeline", "files"].map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
              >
                {name}
                {name === "files" && (db.files || []).some((file) => file.record === record.id)
                  ? " ·"
                  : ""}
              </button>
            ))}
          </div>
        )}

        <div className="drawer-body">
          {type === "campaigns" ? (
            <CampaignStudio
              record={exists ? record : null}
              draft={draft}
              db={db}
              commit={commit}
              open={open}
              close={close}
              nav={nav}
            />
          ) : !exists ? (
            <NewRecordForm
              type={type}
              draft={draft}
              db={db}
              close={close}
              commit={commit}
              onCreated={() => setTab("record")}
            />
          ) : tab === "record" ? (
            <>
              <div className="quick-actions">
                {["deals", "companies", "contacts","leads", "projects", "tickets"].includes(type) && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      startIcon={<IconPlus size={14} />}
                      onClick={() => openNew("tasks", taskPrefill())}
                    >
                      Task
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      startIcon={<IconNote size={14} />}
                      onClick={() => openNew("notes", notePrefill())}
                    >
                      Note
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  startIcon={<IconMail size={14} />}
                  onClick={() => onEmail({ type, record })}
                >
                  Email
                </Button>
              </div>

              {type==="leads"&&<LeadConversion record={record} db={db} commit={commit} open={open}/>}
              {type === "tasks" && <TaskChecklist record={record} commit={commit} />}
              {type === "tasks" && <TaskSchedule record={record} db={db} open={open} commit={commit} />}
              <FieldList
                type={type}
                record={record}
                db={db}
                layout={layout}
                editing={editing}
                setEditing={setEditing}
                commit={commit}
              />

              {!!related.length && (
                <section className="record-section">
                  <h4>Related records</h4>
                  {related.map((item) => (
                    <button
                      type="button"
                      className="related-link"
                      key={item.type + item.record.id + item.field}
                      onClick={() => open(item.type, item.record)}
                    >
                      <span>
                        <small>{objectDef(item.type, db).singular}</small>
                        {item.record.name}
                      </span>
                      <IconChevronRight size={14} />
                    </button>
                  ))}
                </section>
              )}

              {type === "deals" && exists && featureEnabled(db, "products") && (
                <QuoteBuilder record={record} db={db} commit={commit} openNew={openNew} />
              )}


              <section className="record-section metadata-section">
                <h4>Metadata</h4>
                <div className="metadata-row">
                  <span>Created</span>
                  <small>
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : "Unknown"}{" "}
                    · {record.createdBy || "Unknown"}
                  </small>
                </div>
                <div className="metadata-row">
                  <span>Last updated</span>
                  <small>
                    {record.updatedAt
                      ? new Date(record.updatedAt).toLocaleString()
                      : "Unknown"}
                  </small>
                </div>
              </section>
            </>
          ) : tab === "timeline" ? (
            <TimelinePanel
              type={type}
              record={record}
              db={db}
              onEmail={() => onEmail({ type, record })}
              onNew={() => openNew("notes", notePrefill())}
            />
          ) : (
            <FilesPanel type={type} record={record} db={db} commit={commit} />
          )}
        </div>
      </aside>
    </div>
  );
}
import { confirmAction, notifyUser } from "./dialogs";
import React, { useEffect, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import {
  IconAdjustments,
  IconCloud,
  IconDatabase,
  IconDownload,
  IconMail,
  IconMoon,
  IconPlus,
  IconRefresh,
  IconSun,
  IconTrash,
  IconUpload,
  IconUsers,
} from "@tabler/icons-react";
import { collections, listWorkspaces } from "./store";
import {
  customFieldTypes,
  fieldDefs,
  objectDef,
} from "./schema";
import { purgeTrash, restoreRecord } from "./trash";
import { Select } from "./Select";
import { PipelineSettings } from "./PipelineSettings";
import { LinerConnection } from "./LinerConnection";
import { DataQuality } from "./DataQuality";
import { FeaturePacks } from "./FeaturePacks";
import {
  EXPERIENTIAL_BASE_URL,
  EXPERIENTIAL_CHAT_MODEL,
  EXPERIENTIAL_MODEL,
  experientialConfig,
} from "./experiential";

const TABS = [
  ["workspace", "Workspace"],
  ["packs", "Feature packs"],
  ["model", "Data model"],
  ["quality", "Data quality"],
  ["pipelines", "Pipelines"],
  ["members", "Members"],
  ["trash", "Trash"],
  ["data", "Data"],
  ["integrations", "Integrations"],
];

export function Settings({
  db,
  commit,
  saveQuiet,
  theme,
  setTheme,
  backup,
  restoreFile,
  resetDemo,
  open,
  nav,
}) {
  const [tab, setTab] = useState("workspace");
  const [message, setMessage] = useState("");
  const [density, setDensity] = useState(db.ui?.density || "comfortable");
  const [fieldObject, setFieldObject] = useState("companies");
  const [fieldTitle, setFieldTitle] = useState("");
  const [fieldKind, setFieldKind] = useState("text");
  const [fieldOptions, setFieldOptions] = useState("");
  const [storage, setStorage] = useState(null);
  const objectTypes = collections(db);
  const relationTargets = objectTypes;
  const ai = experientialConfig();

  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then((estimate) => setStorage(estimate))
      .catch(() => setStorage(null));
  }, []);

  function addMember(event) {
    event.preventDefault();
    const name = new FormData(event.target).get("member").trim();
    if (!name || db.members.includes(name)) {
      setMessage("Choose a unique member name.");
      return;
    }
    if (
      commit(
        (state) => {
          state.members.push(name);
        },
        `Added member · ${name}`,
      )
    ) {
      event.target.reset();
      setMessage("Member added.");
    }
  }

  async function removeMember(name) {
    if (db.members.length <= 1) {
      setMessage("Keep at least one member.");
      return;
    }
    if (await confirmAction(`Remove ${name}? Records keep their current owner value.`)) {
      commit(
        (state) => {
          state.members = state.members.filter((member) => member !== name);
        },
        `Removed member · ${name}`,
      );
    }
  }

  function addObject(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const singular = String(data.singular || "").trim();
    const plural = String(data.plural || "").trim();
    if (!singular || !plural) return;
    if (objectTypes.some((type) => objectDef(type, db).plural.toLowerCase() === plural.toLowerCase())) {
      setMessage("Choose a unique object name.");
      return;
    }
    const key = `obj_${crypto.randomUUID()}`;
    if (
      commit(
        (state) => {
          state.objects ??= [];
          state.objects.push({ key, singular, plural });
          state[key] = [];
          state.views ??= [];
          state.views.push({
            id: crypto.randomUUID(),
            type: key,
            name: `${plural} list`,
            layout: "table",
            query: "",
            filters: [],
            logic: "and",
            sort: { field: "name", direction: "asc" },
            groupBy: null,
            dateField: "date",
            visibleFields: null,
            pinned: false,
          });
        },
        `Created custom object · ${plural}`,
      )
    ) {
      event.target.reset();
      setMessage("Object created.");
      nav(key);
    }
  }

  async function deleteObject(type) {
    const object = objectDef(type, db);
    if (
      !await confirmAction(
        `Delete “${object.plural}”, its ${db[type]?.length || 0} records and custom fields?`,
      )
    )
      return;
    commit(
      (state) => {
        state.objects = state.objects.filter((item) => item.key !== type);
        delete state[type];
        state.customFields = state.customFields.filter((field) => field.type !== type);
        state.views = state.views.filter((view) => view.type !== type);
        delete state.layout?.[type];
        state.pins = state.pins.filter((pin) => pin.type !== type);
      },
      `Deleted custom object · ${object.plural}`,
    );
    setTab("model");
  }

  function addField(event) {
    event.preventDefault();
    const title = fieldTitle.trim();
    if (!title) return;
    const defs = fieldDefs(fieldObject, db);
    if (defs.some((field) => field.label.toLowerCase() === title.toLowerCase())) {
      setMessage("Choose a unique field name.");
      return;
    }
    const isRelation = relationTargets.includes(fieldKind);
    const options = fieldOptions
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
    if (fieldKind === "select" && !options.length) {
      setMessage("A select field needs at least one option.");
      return;
    }
    const definition = {
      type: fieldObject,
      key: `custom_${crypto.randomUUID()}`,
      title,
      kind: fieldKind,
      ...(isRelation ? {} : { options }),
    };
    if (
      commit(
        (state) => {
          state.customFields ??= [];
          state.customFields.push(definition);
        },
        `Added field · ${title}`,
      )
    ) {
      setFieldTitle("");
      setFieldOptions("");
      setMessage("Field added.");
    }
  }

  function renameField(field, title) {
    title = title.trim();
    if (!title || fieldDefs(field.type, db).some(other => other.key !== field.key && other.label.toLowerCase() === title.toLowerCase())) {
      setMessage("Choose a nonempty, unique field name.");
      return;
    }
    if (
      commit(
        (state) => {
          const match = state.customFields.find((item) => item.key === field.key);
          if (match) match.title = title;
        },
        `Renamed field · ${title}`,
      )
    )
      setMessage("Field renamed.");
  }

  async function deleteField(field) {
    if (!await confirmAction(`Delete “${field.title}” and its values on every record?`)) return;
    commit(
      (state) => {
        state.customFields = state.customFields.filter((item) => item.key !== field.key);
        for (const record of state[field.type] || []) delete record[field.key];
      },
      `Deleted field · ${field.title}`,
    );
  }

  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <small>Local workspace administration</small>
          <h1>Settings</h1>
          <p>Model, members, data and appearance for this browser workspace.</p>
        </div>
        <Tag color="gray">No backend · browser storage</Tag>
      </div>

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "active" : ""}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => { setTab(key); setMessage(""); }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="settings-panels">
            {tab === "quality" && <DataQuality db={db} commit={commit} open={open} />}
            {tab === "pipelines" && <PipelineSettings db={db} commit={commit} />}
            {tab === "packs" && <FeaturePacks db={db} commit={commit} />}
          {tab === "workspace" && (
            <>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconAdjustments size={16} /> Workspace
                  </h2>
                </div>
                <form
                  className="form-grid"
                  key={db.workspace}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const name = new FormData(event.target).get("workspace").trim();
                    if (!name) return;
                    if (
                      commit(
                        (state) => {
                          state.workspace = name;
                          state.ui ??= {};
                          state.ui.density = density;
                        },
                        `Renamed workspace · ${name}`,
                      )
                    )
                      setMessage("Workspace saved.");
                  }}
                >
                  <label>
                    Workspace name
                    <input name="workspace" required maxLength={60} defaultValue={db.workspace} />
                  </label>
                  <label>
                    Row density
                    <Select
                      ariaLabel="Row density"
                      value={density}
                      onChange={setDensity}
                      options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                      ]}
                    />
                  </label>
                  <div className="form-actions">
                    <Button type="submit" variant="solid">
                      Save workspace
                    </Button>
                  </div>
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconUsers size={16} /> Workspaces
                  </h2>
                  <Tag color="gray">{listWorkspaces().length}</Tag>
                </div>
                <p className="muted">
                  Create, switch, rename, duplicate or delete local workspaces from
                  Account. Each workspace keeps its own records and settings.
                </p>
                <div className="button-row">
                  <Button onClick={() => nav("account")}>Manage account & workspaces</Button>
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    {theme === "dark" ? <IconMoon size={16} /> : <IconSun size={16} />} Appearance
                  </h2>
                </div>
                <p className="muted">
                  Choose your preferred appearance. Changes save automatically.
                </p>
                <div className="theme-choice">
                  <button
                    type="button"
                    className={theme === "light" ? "active" : ""}
                    onClick={() => setTheme("light")}
                  >
                    <IconSun size={16} /> Light
                  </button>
                  <button
                    type="button"
                    className={theme === "dark" ? "active" : ""}
                    onClick={() => setTheme("dark")}
                  >
                    <IconMoon size={16} /> Dark
                  </button>
                </div>
              </section>


            </>
          )}

          {tab === "model" && (
            <>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconDatabase size={16} /> Objects
                  </h2>
                  <small>{objectTypes.length} objects</small>
                </div>
                <div className="object-list">
                  {objectTypes.map((type) => {
                    const object = objectDef(type, db);
                    return (
                      <div className="object-row" key={type}>
                        <div>
                          <strong>{object.plural}</strong>
                          <small>
                            {object.custom ? "Custom object" : "Standard object"} ·{" "}
                            {db[type]?.length || 0} records · {fieldDefs(type, db).length} fields
                          </small>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => nav(type)}>
                          Open
                        </Button>
                        {object.custom && (
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Delete ${object.plural}`}
                            onClick={() => deleteObject(type)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconPlus size={16} /> Create a custom object
                  </h2>
                </div>
                <form className="form-grid" onSubmit={addObject}>
                  <label>
                    Singular name
                    <input name="singular" required maxLength={40} placeholder="Project" />
                  </label>
                  <label>
                    Plural name
                    <input name="plural" required maxLength={40} placeholder="Projects" />
                  </label>
                  <div className="form-actions">
                    <Button type="submit" variant="solid">
                      Create object
                    </Button>
                  </div>
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconPlus size={16} /> Add a field
                  </h2>
                </div>
                <form className="form-grid" onSubmit={addField}>
                  <label>
                    Object
                    <Select
                      ariaLabel="Object"
                      value={fieldObject}
                      onChange={setFieldObject}
                      options={objectTypes.map((type) => ({
                        value: type,
                        label: objectDef(type, db).plural,
                      }))}
                    />
                  </label>
                  <label>
                    Field name
                    <input
                      required
                      maxLength={64}
                      value={fieldTitle}
                      onChange={(event) => setFieldTitle(event.target.value)}
                      placeholder="Procurement stage"
                    />
                  </label>
                  <label>
                    Type
                    <Select
                      ariaLabel="Type"
                      value={fieldKind}
                      onChange={setFieldKind}
                      options={[
                        ...customFieldTypes.map((type) => ({
                          value: type,
                          label: type,
                        })),
                        ...relationTargets
                          .filter((type) => type !== fieldObject)
                          .map((type) => ({
                            value: type,
                            label: `Relation · ${objectDef(type, db).plural}`,
                          })),
                      ]}
                    />
                  </label>
                  {fieldKind === "select" && (
                    <label>
                      Options
                      <input
                        value={fieldOptions}
                        onChange={(event) => setFieldOptions(event.target.value)}
                        placeholder="Low, Medium, High"
                      />
                    </label>
                  )}
                  <div className="form-actions">
                    <Button type="submit" variant="solid">
                      Add field
                    </Button>
                  </div>
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h2>Custom fields</h2>
                  <small>{(db.customFields || []).length} fields</small>
                </div>
                {(db.customFields || []).map((field) => (
                  <div className="custom-field-row" key={field.key}>
                    <span>
                      <strong>{field.title}</strong>
                      <small>
                        {objectDef(field.type, db).plural} · {field.kind}
                        {field.options?.length ? ` · ${field.options.join(", ")}` : ""}
                      </small>
                    </span>
                    <form
                      className="inline-rename"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const title = new FormData(event.target).get("title").trim();
                        if (title) renameField(field, title);
                      }}
                    >
                      <input name="title" defaultValue={field.title} maxLength={64} />
                      <Button size="sm" type="submit">
                        Rename
                      </Button>
                    </form>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${field.title}`}
                      onClick={() => deleteField(field)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                ))}
                {!(db.customFields || []).length && (
                  <p className="empty-copy">No custom fields yet.</p>
                )}
              </section>
            </>
          )}

          {tab === "members" && (
            <section className="panel-card">
              <div className="panel-heading">
                <h2>
                  <IconUsers size={16} /> Members
                </h2>
                <Tag color="gray">Single-browser demo</Tag>
              </div>
              <p className="muted">
                Members populate owner fields. This local workspace has no authentication or
                sharing.
              </p>
              {db.members.map((member) => (
                <div className="member-row" key={member}>
                  <Avatar size="sm" shape="circle" name={member} />
                  <div>
                    <strong>{member}</strong>
                    <small>
                      {db.deals.filter((deal) => deal.owner === member).length} opportunities ·{" "}
                      {db.companies.filter((company) => company.owner === member).length} accounts
                    </small>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={db.members.length <= 1}
                    onClick={() => removeMember(member)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <form className="inline-add" onSubmit={addMember}>
                <input name="member" required maxLength={50} placeholder="New member name" />
                <Button type="submit" size="sm" variant="solid">
                  Add member
                </Button>
              </form>
            </section>
          )}

          {tab === "trash" && (
            <section className="panel-card">
              <div className="panel-heading">
                <h2>
                  <IconTrash size={16} /> Trash
                </h2>
                <small>{db.trash?.length || 0} records</small>
              </div>
              {(db.trash || []).map((entry) => (
                <div className="trash-row" key={entry.id}>
                  <div>
                    <strong>{entry.record.name}</strong>
                    <small>
                      {objectDef(entry.type, db).singular} · deleted{" "}
                      {new Date(entry.at).toLocaleString()}
                    </small>
                    {entry.mergedInto && <small>Merged duplicate. Restore keeps transferred links on the retained record.</small>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      commit(
                        (state) => restoreRecord(state, entry),
                        `Restored ${entry.record.name}`,
                      )
                    }
                  >
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (await confirmAction(`Permanently delete “${entry.record.name}”?`))
                        commit(
                          (state) => purgeTrash(state, entry.id),
                          `Permanently deleted ${entry.record.name}`,
                        );
                    }}
                  >
                    Delete forever
                  </Button>
                </div>
              ))}
              {!db.trash?.length && (
                <p className="empty-copy">Trash is empty. Deleted records appear here.</p>
              )}
            </section>
          )}

          {tab === "data" && (
            <>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconDatabase size={16} /> Local data
                  </h2>
                </div>
                <p className="muted">
                  Everything is stored in this browser. Each workspace has its own local
                  storage key. A backup is a complete JSON snapshot of the current
                  workspace.
                </p>
                <div className="stat-row">
                  <div>
                    <strong>{objectTypes.reduce((total, type) => total + (db[type]?.length || 0), 0)}</strong>
                    <small>Records</small>
                  </div>
                  <div>
                    <strong>{db.views?.length || 0}</strong>
                    <small>Saved views</small>
                  </div>
                  <div>
                    <strong>{db.workflows?.length || 0}</strong>
                    <small>Workflows</small>
                  </div>
                  <div>
                    <strong>
                      {storage?.usage ? `${(storage.usage / 1024 / 1024).toFixed(1)} MB` : "—"}
                    </strong>
                    <small>Browser storage</small>
                  </div>
                </div>
                <div className="button-row">
                  <Button startIcon={<IconDownload size={14} />} onClick={backup}>
                    Export backup
                  </Button>
                  <label className="file-button">
                    <IconUpload size={14} /> Restore backup
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={(event) => {
                        restoreFile(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    startIcon={<IconRefresh size={14} />}
                    onClick={resetDemo}
                  >
                    Reset demo data
                  </Button>
                </div>
              </section>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconAdjustments size={16} /> What is stored
                  </h2>
                </div>
                <p className="muted">
                  Objects, fields, views, dashboards, workflows, attachments, favourites, trash,
                  activity and assistant history are all included in the backup. Restoring a
                  backup replaces the current workspace.
                </p>
              </section>
            </>
          )}

          {tab === "integrations" && (
            <>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconMail size={16} /> Email
                  </h2>
                  <Tag color="blue">Local log</Tag>
                </div>
                <p className="muted">
                  Compose emails with templates, open them in your mail client, and keep the
                  message in the record timeline. No mailbox is connected and nothing is sent.
                </p>
              </section>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconCloud size={16} /> Calendar
                  </h2>
                  <Tag color="green">.ics export</Tag>
                </div>
                <p className="muted">
                  Opportunity close dates, task due dates and note meeting dates render in the
                  calendar view. Export an .ics feed to import into another calendar.
                </p>
              </section>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconDatabase size={16} /> APIs, webhooks & serverless
                  </h2>
                  <Tag color="gray">Requires a backend</Tag>
                </div>
                <p className="muted">
                  Authentication, secure roles, mailbox sync, APIs, webhooks and background jobs require a backend. A backend will not be used in this personal project. Local members are assignment labels.
                </p>
              </section>
              <section className="panel-card">
                <div className="panel-heading">
                  <h2>
                    <IconSun size={16} /> Liner
                  </h2>
                </div>
                <p className="muted">
                  Liner uses your connected AI service to answer workspace questions and prepare record edits. Proposed changes are reviewed before saving. Local workspace tools work without a connection.
                </p>
                <LinerConnection />
                <p className="muted">
                  This static build keeps the key in a git-ignored <code>public/env.js</code>.
                  Do not publish a build made with a live key. Without a key, the deterministic
                  workspace tools and insights still work.
                </p>
              </section>
            </>
          )}

          {message && (
            <p role="status" className="options-message">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
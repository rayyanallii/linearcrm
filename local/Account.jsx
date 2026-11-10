import React, { useEffect, useState } from "react";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import { Button } from "twenty-ui/primitives/input";
import {
  IconCopy,
  IconDatabase,
  IconDownload,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconUserCircle,
} from "@tabler/icons-react";
import { confirmAction, notifyUser } from "./dialogs";
import { LinerConnection } from "./LinerConnection";
import {
  activateWorkspace,
  createWorkspace,
  deleteWorkspace,
  duplicateWorkspace,
  listWorkspaces,
  renameWorkspaceSnapshot,
} from "./store";

function bytesLabel(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function createdLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Account({
  db,
  commit,
  backup,
  restoreFile,
  resetDemo,
  nav,
}) {
  const account = db.account || {
    name: db.members?.[0] || "Alex Morgan",
    email: "",
    role: "",
  };
  const workspaces = listWorkspaces();
  const current = workspaces.find((workspace) => workspace.active);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [includeDemo, setIncludeDemo] = useState(false);
  const [renaming, setRenaming] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then((estimate) => setStorage(estimate))
      .catch(() => setStorage(null));
  }, []);

  function saveProfile(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const name = String(data.name || "").trim();
    if (!name) {
      setMessage("Add a display name.");
      return;
    }
    if (
      commit(
        (state) => {
          state.account = {
            name,
            email: String(data.email || "").trim(),
            role: String(data.role || "").trim(),
          };
        },
        "Updated account",
      )
    ) {
      setMessage("Account saved.");
    }
  }

  function create(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setMessage("Give the workspace a name.");
      return;
    }
    try {
      const id = createWorkspace(name, { demo: includeDemo });
      activateWorkspace(id);
    } catch (error) {
      notifyUser(
        error?.name === "QuotaExceededError"
          ? "There is not enough browser storage to add that workspace."
          : error.message || "That workspace could not be created.",
      );
    }
  }

  async function remove(workspace) {
    if (workspaces.length <= 1) {
      setMessage("Keep at least one workspace.");
      return;
    }
    if (
      !(await confirmAction(
        `Delete “${workspace.name}” and all of its ${workspace.records} records? This cannot be undone unless you exported a backup.`,
      ))
    ) {
      return;
    }
    if (!deleteWorkspace(workspace.id)) {
      setMessage("That workspace could not be deleted.");
    } else {
      setMessage(`Deleted ${workspace.name}.`);
    }
  }

  function duplicate(workspace) {
    try {
      duplicateWorkspace(workspace.id, `${workspace.name} copy`);
      setMessage(`Duplicated ${workspace.name}. Switch to it from the list.`);
    } catch (error) {
      notifyUser(error.message || "That workspace could not be duplicated.");
    }
  }

  function saveRename(event, workspace) {
    event.preventDefault();
    const name = renameValue.trim();
    if (!name) return;
    try {
      if (workspace.active) {
        commit((state) => {
          state.workspace = name;
        }, `Renamed workspace · ${name}`);
      } else {
        renameWorkspaceSnapshot(workspace.id, name);
      }
      setRenaming("");
      setMessage("Workspace renamed.");
    } catch (error) {
      notifyUser(error.message || "That workspace could not be renamed.");
    }
  }

  return (
    <div className="account-page">
      <div className="page-heading">
        <div>
          <small>Local account administration</small>
          <h1>Account</h1>
          <p>Profile, workspaces and storage for this browser.</p>
        </div>
        <Tag color="gray">No sign-in · local only</Tag>
      </div>

      <section className="panel-card account-hero">
        <Avatar size="lg" shape="circle" name={account.name} />
        <div className="account-hero-copy">
          <strong>{account.name}</strong>
          <span>
            {account.role || "Personal workspace"}
            {account.email ? ` · ${account.email}` : ""}
          </span>
        </div>
        <div className="account-hero-workspace">
          <span>Current workspace</span>
          <strong>{current?.name || db.workspace}</strong>
          <small>
            {current?.records || 0} records · {bytesLabel(current?.bytes || 0)}
          </small>
        </div>
      </section>

      <div className="account-grid">
        <section className="panel-card account-card account-span">
          <header>
            <h2>
              <IconUserCircle size={16} /> Profile
            </h2>
            <Tag color="gray">Display only</Tag>
          </header>
          <p className="muted">
            This identity labels the account in the sidebar. Record owners are still
            managed through Settings → Members.
          </p>
          <form
            className="form-grid account-profile-form"
            key={`${account.name}|${account.email}|${account.role}`}
            onSubmit={saveProfile}
          >
            <label>
              Display name
              <input
                name="name"
                required
                maxLength={60}
                defaultValue={account.name}
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                maxLength={120}
                placeholder="you@company.com"
                defaultValue={account.email}
              />
            </label>
            <label>
              Role
              <input
                name="role"
                maxLength={60}
                placeholder="Founder"
                defaultValue={account.role}
              />
            </label>
            <div className="form-actions">
              <Button type="submit" variant="solid">
                Save profile
              </Button>
            </div>
          </form>
        </section>

        <section className="panel-card account-card account-span">
          <header>
            <h2>
              <IconDatabase size={16} /> Workspaces
            </h2>
            <Tag color="gray">
              {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
            </Tag>
          </header>
          <p className="muted">
            Each workspace keeps its own records, settings, views and local data.
            Switching reloads the app into that workspace.
          </p>

          <div className="account-workspaces">
            {workspaces.map((workspace) => (
              <article
                key={workspace.id}
                className={`account-workspace${
                  workspace.active ? " active" : ""
                }`}
              >
                <div className="account-workspace-main">
                  <span className="account-workspace-mark" aria-hidden="true">
                    {workspace.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="account-workspace-copy">
                    <strong>{workspace.name}</strong>
                    <small>
                      {workspace.records}{" "}
                      {workspace.records === 1 ? "record" : "records"} ·{" "}
                      {bytesLabel(workspace.bytes)} · created{" "}
                      {createdLabel(workspace.createdAt)}
                    </small>
                  </div>
                  {workspace.active ? (
                    <Tag color="green">Current</Tag>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => activateWorkspace(workspace.id)}
                    >
                      Switch
                    </Button>
                  )}
                </div>

                <div className="account-workspace-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenaming(workspace.id);
                      setRenameValue(workspace.name);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconCopy size={13} />}
                    onClick={() => duplicate(workspace)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconTrash size={13} />}
                    disabled={workspaces.length <= 1}
                    onClick={() => remove(workspace)}
                  >
                    Delete
                  </Button>
                </div>

                {renaming === workspace.id && (
                  <form
                    className="account-rename"
                    onSubmit={(event) => saveRename(event, workspace)}
                  >
                    <input
                      aria-label={`Rename ${workspace.name}`}
                      value={renameValue}
                      maxLength={60}
                      autoFocus
                      onChange={(event) => setRenameValue(event.target.value)}
                    />
                    <Button type="submit" size="sm" variant="solid">
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRenaming("")}
                    >
                      Cancel
                    </Button>
                  </form>
                )}
              </article>
            ))}
          </div>

          <form className="account-create" onSubmit={create}>
            <label>
              New workspace
              <input
                aria-label="New workspace name"
                value={newName}
                maxLength={60}
                placeholder="Clients, experiments, next year…"
                onChange={(event) => setNewName(event.target.value)}
              />
            </label>
            <label className="account-checkbox">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(event) => setIncludeDemo(event.target.checked)}
              />
              Start with sample records
            </label>
            <Button
              type="submit"
              size="sm"
              variant="solid"
              startIcon={<IconPlus size={14} />}
            >
              Create & switch
            </Button>
          </form>
        </section>

        <section className="panel-card account-card">
          <header>
            <h2>
              <IconDatabase size={16} /> Storage & data
            </h2>
            <small>
              {storage?.usage ? bytesLabel(storage.usage) : "—"} browser usage
            </small>
          </header>
          <p className="muted">
            Backups and reset apply to the current workspace only. Export another
            workspace from its own account session.
          </p>
          <div className="stat-row">
            <div>
              <strong>{current?.records || 0}</strong>
              <small>Records</small>
            </div>
            <div>
              <strong>{bytesLabel(current?.bytes || 0)}</strong>
              <small>Workspace size</small>
            </div>
            <div>
              <strong>{db.views?.length || 0}</strong>
              <small>Saved views</small>
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

        <section className="panel-card account-card">
          <header>
            <h2>AI connection</h2>
          </header>
          <p className="muted">
            Liner can read this workspace and prepare edits for review. Local tools
            still work without a connection.
          </p>
          <LinerConnection />
          <Button size="sm" variant="ghost" onClick={() => nav("settings")}>
            Open all settings
          </Button>
        </section>
      </div>

      {message && (
        <p role="status" className="options-message">
          {message}
        </p>
      )}
    </div>
  );
}

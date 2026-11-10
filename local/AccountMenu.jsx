import React, { useEffect } from "react";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import { Button } from "twenty-ui/primitives/input";
import {
  IconCheck,
  IconChevronRight,
  IconPlus,
  IconSettings,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { activateWorkspace, listWorkspaces } from "./store";

export function AccountMenu({ db, onClose, nav }) {
  const workspaces = listWorkspaces();
  const account = db.account || {
    name: db.members?.[0] || "Alex Morgan",
    email: "",
    role: "",
  };

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function go(route) {
    onClose();
    nav(route);
  }

  return (
    <div
      className="account-menu-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="account-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Account and workspaces"
      >
        <header className="account-menu-head">
          <Avatar size="sm" shape="circle" name={account.name} />
          <div className="account-menu-who">
            <strong>{account.name}</strong>
            <small>{account.email || "Local account"}</small>
          </div>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Close account menu"
            onClick={onClose}
          >
            <IconX size={16} />
          </Button>
        </header>

        <div className="account-menu-current">
          <span>Current workspace</span>
          <strong>{db.workspace || "Linear CRM"}</strong>
        </div>

        <div className="account-menu-section">
          <div className="account-menu-label">
            <span>Workspaces</span>
            <small>{workspaces.length}</small>
          </div>
          <div className="account-menu-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                className={`account-menu-workspace${
                  workspace.active ? " active" : ""
                }`}
                aria-current={workspace.active ? "true" : undefined}
                onClick={() => {
                  if (!workspace.active) activateWorkspace(workspace.id);
                }}
              >
                <span className="account-menu-check" aria-hidden="true">
                  {workspace.active && <IconCheck size={13} />}
                </span>
                <span className="account-menu-workspace-copy">
                  <strong>{workspace.name}</strong>
                  <small>
                    {workspace.records}{" "}
                    {workspace.records === 1 ? "record" : "records"}
                    {workspace.demo ? " · Sample data" : ""}
                  </small>
                </span>
                {!workspace.active && (
                  <IconChevronRight size={13} className="account-menu-chevron" />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="account-menu-link"
            onClick={() => go("account")}
          >
            <IconPlus size={14} /> Create or manage workspaces
          </button>
        </div>

        <div className="account-menu-section account-menu-links">
          <button
            type="button"
            className="account-menu-link"
            onClick={() => go("account")}
          >
            <IconUserCircle size={14} /> Account settings
          </button>
          <button
            type="button"
            className="account-menu-link"
            onClick={() => go("settings")}
          >
            <IconSettings size={14} /> Workspace settings
          </button>
        </div>

        <footer className="account-menu-foot">
          <Tag color="gray">Local only</Tag>
          <span>Records stay in this browser.</span>
        </footer>
      </section>
    </div>
  );
}

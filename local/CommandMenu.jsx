import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconDownload,
  IconGitBranch,
  IconHome,
  IconLayoutDashboard,
  IconMail,
  IconNotes,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconSun,
  IconTargetArrow,
  IconTable,
  IconUsers,
  IconBox,
  IconFolder,
  IconSpeakerphone,
  IconLifebuoy,
} from "@tabler/icons-react";
import { objectDef, fieldDefs } from "./schema";
import { enabledCollections } from "./store";
import { displayValue } from "./format";

const ICONS = {
  leads:IconTargetArrow,
  companies: IconBuildingSkyscraper,
  contacts: IconUsers,
  deals: IconTargetArrow,
  tasks: IconCheckbox,
  notes: IconNotes,
  emails: IconMail,
  projects: IconFolder,
  campaigns: IconSpeakerphone,
  tickets: IconLifebuoy,
  products: IconBox,
};

export function CommandMenu({
  db,
  close,
  onNav,
  onOpen,
  onNew,
  onToggleTheme,
  onBackup,
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = [];
    const add = (item) => {
      if (!term || item.label.toLowerCase().includes(term)) items.push(item);
    };

    add({
      key: "nav-overview",
      group: "Go to",
      label: "Overview",
      icon: IconHome,
      run: () => onNav("overview"),
    });
    add({
      key: "nav-dash",
      group: "Go to",
      label: "Dashboards",
      icon: IconLayoutDashboard,
      run: () => onNav("dashboards"),
    });
    add({
      key: "nav-workflows",
      group: "Go to",
      label: "Workflows",
      icon: IconGitBranch,
      run: () => onNav("workflows"),
    });
    add({
      key: "nav-assistant",
      group: "Go to",
      label: "Liner",
      icon: IconSparkles,
      run: () => onNav("assistant"),
    });
    add({
      key: "nav-settings",
      group: "Go to",
      label: "Settings",
      icon: IconSettings,
      run: () => onNav("settings"),
    });

    for (const [type, object] of Object.entries({
      companies: objectDef("companies", db),
      leads: objectDef("leads",db),
      contacts: objectDef("contacts", db),
      deals: objectDef("deals", db),
      tasks: objectDef("tasks", db),
      notes: objectDef("notes", db),
      emails: objectDef("emails", db),
      projects: objectDef("projects", db),
      campaigns: objectDef("campaigns", db),
      tickets: objectDef("tickets", db),
    }).filter(([type]) => enabledCollections(db).includes(type))) {
      add({
        key: `new-${type}`,
        group: "Create",
        label: `New ${object.singular.toLowerCase()}`,
        icon: IconPlus,
        run: () => onNew(type),
      });
    }

    add({
      key: "toggle-theme",
      group: "Workspace",
      label: "Toggle light / dark theme",
      icon: IconSun,
      run: onToggleTheme,
    });
    add({
      key: "backup",
      group: "Workspace",
      label: "Export a workspace backup",
      icon: IconDownload,
      run: onBackup,
    });

    if (term) {
      const recordItems = [];
      for (const type of enabledCollections(db)) {
        const Icon = ICONS[type] || IconTable;
        for (const record of db[type] || []) {
          if (!fieldDefs(type, db).some(field => String(displayValue(record, field.key, type, db) ?? "").toLowerCase().includes(term))) continue;
          recordItems.push({
            key: `record-${type}-${record.id}`,
            group: objectDef(type, db).plural,
            label: record.name || "Untitled record",
            icon: Icon,
            run: () => onOpen(type, record),
          });
        }
      }
      items.push(...recordItems.slice(0, 14));
    }

    return items;
  }, [query, db, onNav, onNew, onOpen, onToggleTheme, onBackup]);

  useEffect(() => setIndex(0), [query]);

  function run(item) {
    if (!item) return;
    close();
    item.run();
  }

  return (
    <div
      className="command-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="command-menu" role="dialog" aria-modal="true" aria-label="Command menu">
        <div className="command-input">
          <IconSearch size={17} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search records or run a command…"
            aria-label="Command menu search"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIndex((current) => Math.min(results.length - 1, current + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setIndex((current) => Math.max(0, current - 1));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                run(results[index]);
              }
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="command-results">
          {results.map((item, itemIndex) => {
            const Icon = item.icon;
            const showGroup = itemIndex === 0 || results[itemIndex - 1].group !== item.group;
            return (
              <React.Fragment key={item.key}>
                {showGroup && <h4>{item.group}</h4>}
                <button
                  type="button"
                  className={"command-item " + (itemIndex === index ? "active" : "")}
                  onMouseEnter={() => setIndex(itemIndex)}
                  onClick={() => run(item)}
                >
                  <Icon size={15} stroke={1.6} />
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
          {!results.length && (
            <p className="command-empty">No commands or records match “{query}”.</p>
          )}
        </div>
        <footer className="command-footer">
          <span>
            <IconArrowUp size={12} />
            <IconArrowDown size={12} /> navigate
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span className="command-brand">
            <IconSparkles size={12} /> Linear CRM
          </span>
        </footer>
      </div>
    </div>
  );
}

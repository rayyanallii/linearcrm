import { IconUserSearch, IconBriefcase } from "@tabler/icons-react";
import { SectionMenu } from "./SectionMenu";
import { confirmAction, notifyUser } from "./dialogs";
import { IconPin, IconPinnedOff } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "twenty-ui/theme";
import { SearchButton } from "./SearchButton";
import { Button } from "twenty-ui/primitives/input";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import {
  IconAutomation,
  IconBuildingSkyscraper,
  IconChartBar,
  IconCheckbox,
  IconChevronUp,
  IconLayoutDashboard,
  IconLayoutSidebar,
  IconMail,
  IconMoon,
  IconNotes,
  IconPackage,
  IconPlus,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconFolder,
  IconSpeakerphone,
  IconLifebuoy,
  IconSparkles,
  IconSun,
  IconTable,
  IconTargetArrow,
  IconUserCircle,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import "twenty-ui/style.css";
import "twenty-ui/theme-light.css";
import "twenty-ui/theme-dark.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./app.css";

import { PageContainer } from "./upstream/PageContainer";
import { PageHeader } from "./upstream/PageHeader";
import { DrawerItem } from "./upstream/DrawerItem";
import { NavigationDrawerItemGroup } from "./upstream/NavigationDrawerItemGroup";
import { NavigationDrawerItemIcon } from "./upstream/NavigationDrawerItemIcon";

import { seed } from "../data.js";
import {
  db,
  key,
  readError,
  reload,
  save,
  saveQuiet,
  valid,
  collections,
  enabledCollections,
  listWorkspaces,
} from "./store";
import {
  columnsFor,
  defaultVisibleColumns,
  featureEnabled,
  fieldDef,
  objectDef,
  openStages,
  stages,
} from "./schema";
import { applyView, sortRows } from "./query";
import { displayValue } from "./format";
import { download } from "./csv";
import { moveToTrash } from "./trash";

import { Overview } from "./Overview";
import { DashboardView } from "./DashboardView";
import { Workflows } from "./Workflows";
import { Assistant } from "./Assistant";
import { Settings } from "./Settings";
import { ViewBar } from "./ViewBar";
import { TableView } from "./TableView";
import { BoardView } from "./BoardView";
import { RecordCalendar } from "./RecordCalendar";
import { RecordPage } from "./RecordPage";
import { EmailComposer } from "./EmailComposer";
import { CommandMenu } from "./CommandMenu";
import { TableOptions } from "./TableOptions";
import { Mailboxes } from "./Mailboxes";
import { Account } from "./Account";
import { AccountMenu } from "./AccountMenu";
import "./campaigns.css";
import "./campaign-studio.css";
import "./account.css";

const SPECIAL = {
  overview: ["Overview", IconLayoutDashboard],
  dashboards: ["Dashboards", IconChartBar],
  workflows: ["Workflows", IconAutomation],
  assistant: ["Liner", IconSparkles],
  settings: ["Settings", IconSettings],
  mailboxes: ["Email accounts", IconMail],
  account: ["Account", IconUserCircle],
};

const OBJECT_ICONS = {
  building: IconBuildingSkyscraper,
  user: IconUsers,
  target: IconBriefcase,
  prospect: IconUserSearch,
  check: IconCheckbox,
  note: IconNotes,
  mail: IconMail,
  table: IconTable,
  project: IconFolder,
  campaign: IconSpeakerphone,
  ticket: IconLifebuoy,
  product: IconPackage,
  receipt: IconReceipt,
};

function routeFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash === "activity") return "tasks";
  if (hash === "mailboxes" && !featureEnabled(db, "mailboxes")) return "overview";
  if (SPECIAL[hash]) return hash;
  if (enabledCollections(db).includes(hash)) return hash;
  return "overview";
}

function blankConfig(object) {
  return {
    viewId: "",
    layout: "table",
    query: "",
    filters: [],
    logic: "and",
    sort: { field: "name", direction: "asc" },
    groupBy: object.defaultGroup || null,
    dateField: object.dateField || "date",
  };
}

function configFor(view, object) {
  return {
    viewId: view.id || "",
    layout: view.layout || "table",
    query: view.query || "",
    filters: (view.filters || []).map((filter) => ({ ...filter })),
    logic: view.logic || "and",
    sort: { ...(view.sort || { field: "name", direction: "asc" }) },
    groupBy: view.groupBy || object.defaultGroup || null,
    dateField: view.dateField || object.dateField || "date",
  };
}

function viewIsDirty(config, view) {
  if (!view)
    return !!(
      config.query ||
      config.filters?.length ||
      (config.layout && config.layout !== "table") ||
      (config.sort && config.sort.field !== "name")
    );
  return (
    (config.query || "") !== (view.query || "") ||
    JSON.stringify(config.filters || []) !== JSON.stringify(view.filters || []) ||
    config.logic !== view.logic ||
    config.layout !== view.layout ||
    config.groupBy !== view.groupBy ||
    config.dateField !== view.dateField ||
    JSON.stringify(config.sort) !== JSON.stringify(view.sort)
  );
}

function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [drawer, setDrawer] = useState(null);
  const [configs, setConfigs] = useState({});
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [email, setEmail] = useState(null);
  const [theme, setThemeState] = useState(db.ui?.theme === "dark" ? "dark" : "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!!db.ui?.sidebarCollapsed);
  const [toast, setToast] = useState("");
  const [, setTick] = useState(0);

  const objectTypes = enabledCollections(db);
  const isObjectRoute = objectTypes.includes(route);
  const special = SPECIAL[route];
  const object = isObjectRoute
    ? objectDef(route, db)
    : objectDef("companies", db);
  const Icon = isObjectRoute
    ? OBJECT_ICONS[object.icon] || IconTable
    : special?.[1] || IconLayoutDashboard;

  const viewsFor = isObjectRoute
    ? (db.views || []).filter((view) => view.type === route)
    : [];
  const config = isObjectRoute
    ? configs[route] || blankConfig(object)
    : blankConfig(object);
  const currentView = viewsFor.find((view) => view.id === config.viewId);
  const dirty = isObjectRoute && viewIsDirty(config, currentView);

  const allColumns = isObjectRoute
    ? (() => {
        const raw = columnsFor(route, db);
        const order = db.layout?.[route]?.order || [];
        return [
          ...orderedUnique([
            ...order.filter((column) => raw.includes(column)),
            ...raw.filter((column) => !order.includes(column)),
          ]),
        ];
      })()
    : [];
  const visibleColumns = isObjectRoute
    ? (() => {
        const defaults = defaultVisibleColumns(route, db);
        const hidden =
          db.layout?.[route]?.hidden ??
          allColumns.filter((column) => !defaults.includes(column));
        let visible = config.visibleFields
          ? config.visibleFields.filter((column) => allColumns.includes(column))
          : allColumns.filter(
              (column) => column === "name" || !hidden.includes(column),
            );
        if (!visible.includes("name")) visible = ["name", ...visible];
        return orderedUnique(visible);
      })()
    : [];

  const rows = isObjectRoute
    ? sortRows(
        applyView(db[route] || [], config, route, db),
        config.sort,
        route,
        db,
      )
    : [];

  function flash(message) {
    setToast(message);
  }

  function commit(change, message) {
    if (!save(change, message)) return false;
    setTick((value) => value + 1);
    if (message) flash(message);
    return true;
  }

  function nav(next) {
    if (location.hash !== `#${next}`) location.hash = next;
    setRoute(next);
    setMenuOpen(false);
    setOptionsOpen(false);
    setAccountMenu(false);
  }

  function openRecord(type, record) {
    if (!record?.id) return;
    setDrawer({ type, id: record.id });
    setCommandOpen(false);
    setRoute(type);
    if (location.hash !== `#${type}`) location.hash = type;
  }

  function openNew(type, draft = {}) {
    setCommandOpen(false);
    if (type === "emails") {
      setEmail({});
      return;
    }
    setDrawer({ type, draft });
    setRoute(type);
    if (location.hash !== `#${type}`) location.hash = type;
  }

  function setTheme(next) {
    if (saveQuiet((state) => {
      state.ui ??= {};
      state.ui.theme = next;
    })) setThemeState(next);
    else notifyUser("Appearance could not be saved. Check available browser storage.");
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  useEffect(() => {
    function onHashChange() {
      setRoute(routeFromHash());
      setMenuOpen(false);
    }
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!SPECIAL[route] && !objectTypes.includes(route)) {
      nav("overview");
    }
  }, [route, objectTypes.join("|")]);

  useEffect(() => {
    const label = SPECIAL[route]?.[0] || (isObjectRoute ? object.plural : "Overview");
    document.title = `${label} · Linear CRM`;
  }, [route, isObjectRoute, object.plural]);

  function updateConfig(patch) {
    if (!isObjectRoute) return;
    setConfigs((all) => ({
      ...all,
      [route]: { ...(all[route] || blankConfig(object)), ...patch },
    }));
  }

  function showView(view) {
    const viewType = view.type || route;
    if (!view.id) {
      setConfigs((all) => ({
        ...all,
        [viewType]: blankConfig(objectDef(viewType, db)),
      }));
      return;
    }
    setConfigs((all) => ({
      ...all,
      [viewType]: configFor(view, objectDef(viewType, db)),
    }));
  }

  function openSavedView(view) {
    setConfigs((all) => ({
      ...all,
      [view.type]: configFor(view, objectDef(view.type, db)),
    }));
    nav(view.type);
  }

  function saveView({ name, existingId }) {
    const id = existingId || crypto.randomUUID();
    const view = {
      id,
      type: route,
      name,
      layout: config.layout,
      query: config.query || "",
      filters: (config.filters || []).map((filter) => ({ ...filter })),
      logic: config.logic || "and",
      sort: { ...config.sort },
      groupBy: config.groupBy,
      dateField: config.dateField,
      visibleFields: null,
      pinned: currentView?.pinned || false,
    };
    if (
      commit(
        (state) => {
          state.views ??= [];
          const existing = state.views.find((item) => item.id === id);
          if (existing) Object.assign(existing, view);
          else state.views.push(view);
        },
        `Saved view · ${name}`,
      )
    ) {
      setConfigs((all) => ({ ...all, [route]: { ...config, viewId: id } }));
    }
  }

  async function deleteView(view) {
    if (!await confirmAction(`Delete the view “${view.name}”?`)) return;
    if (
      commit(
        (state) => {
          state.views = state.views.filter((item) => item.id !== view.id);
        },
        `Deleted view · ${view.name}`,
      )
    ) {
      setConfigs((all) => ({ ...all, [route]: blankConfig(object) }));
    }
  }

  function showStage(stage, pipelineName) {
    const deals = objectDef("deals", db);
    setConfigs((all) => ({
      ...all,
      deals: {
        ...blankConfig(deals),
        filters: [
            ...(stage ? [{ id: crypto.randomUUID(), field: "stage", op: "is", value: stage }] : []),
            ...(pipelineName ? [{ id: crypto.randomUUID(), field: "pipeline", op: "is", value: pipelineName }] : []),
        ],
      },
    }));
    nav("deals");
  }

  function moveRecord(id, field, value) {
    const record = (db[route] || []).find((row) => row.id === id);
    if (!record || record[field] === value) return;
    commit(
      (state) => {
        const match = state[route].find((row) => row.id === id);
        if (match) match[field] = value;
      },
      `Moved ${record.name}`,
    );
  }

  function bulkDelete(ids) {
    const set = new Set(ids);
    commit(
      (state) => {
        for (const id of set) moveToTrash(state, route, id);
      },
      `Moved ${ids.length} ${object.plural.toLowerCase()} to trash`,
    );
  }

  function backup() {
    download(
      JSON.stringify(db, null, 2),
      `linear-crm-backup-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
    );
    flash("Backup exported");
  }

  async function restoreFile(file) {
    if (!file) return;
    try {
      const value = JSON.parse(await file.text());
      if (!valid(value)) throw new Error("Invalid backup");
      if (!await confirmAction("Replace this workspace with the backup?")) return;
      reload(value);
      setConfigs({});
      setDrawer(null);
      setThemeState(db.ui?.theme === "dark" ? "dark" : "light");
      setTick((tick) => tick + 1);
      nav("overview");
      flash("Backup restored");
    } catch (error) {
      notifyUser(error.name === "QuotaExceededError" ? "The backup could not be saved because browser storage is full. Your current workspace is unchanged." : "That backup could not be restored. Check the file and available browser storage. Your current workspace is unchanged.");
    }
  }

  async function resetDemo() {
    if (!await confirmAction("Reset the workspace to the original demo data? This removes your changes."))
      return;
    const fresh = seed();
    try { reload(fresh); }
    catch { notifyUser("The reset could not be saved. Your current workspace is unchanged."); return; }
    setConfigs({});
    setDrawer(null);
    setThemeState(fresh.ui?.theme === "dark" ? "dark" : "light");
    setTick((tick) => tick + 1);
    nav("overview");
    flash("Demo workspace restored");
  }

  const counts = {
    companies: db.companies.length,
    contacts: db.contacts.length,
    deals: db.deals.length,
    tasks: db.tasks.filter((task) => !["Done", "Cancelled"].includes(task.status)).length,
  };
  const sections = [
    { key: "overview", label: "Overview", Icon: IconLayoutDashboard },
    ...objectTypes.map(type => ({ key: type, label: objectDef(type, db).plural, Icon: OBJECT_ICONS[objectDef(type, db).icon] || IconTable })),
    ...(featureEnabled(db, "mailboxes") ? [{ key: "mailboxes", label: "Email accounts", Icon: IconMail }] : []),
    { key: "workflows", label: "Workflows", Icon: IconAutomation },
    { key: "assistant", label: "Liner", Icon: IconSparkles },
    { key: "dashboards", label: "Dashboards", Icon: IconChartBar },
    { key: "settings", label: "Settings", Icon: IconSettings },
  ];
  const pinnedSections = [...new Set(db.ui?.pinnedSections || [])].map(key => sections.find(section => section.key === key)).filter(Boolean);
  function toggleSectionPin(section) {
    commit(state => {
      state.ui ??= {};
      const pins = state.ui.pinnedSections || [];
      state.ui.pinnedSections = pins.includes(section.key) ? pins.filter(key => key !== section.key) : [...pins, section.key];
    });
  }

  return (
    <ThemeProvider colorScheme={theme}>
    <div className={`app-shell density-${db.ui?.density || "comfortable"} ${menuOpen ? "menu-open" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar" id="crm-sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>
            <strong>Linear CRM</strong>
            <small>Local-first CRM</small>
          </span>
        </div>

        <SearchButton block className="sidebar-search" onOpen={() => setCommandOpen(true)} />

        <NavigationDrawerItemGroup>
          <h3>Pinned</h3>
          {!pinnedSections.length && <p className="pinned-empty">Right-click a page to pin it.</p>}
          {pinnedSections.map(section => <SectionMenu key={section.key} section={section} pinned={pinnedSections.some(pin => pin.key === section.key)} toggle={toggleSectionPin}>
            <button type="button" className={"pinned-section-link " + (route === section.key ? "active" : "")} aria-label={`Open pinned ${section.label}`} onClick={() => nav(section.key)}><IconPin size={15} aria-hidden="true" /><span>{section.label}</span></button>
          </SectionMenu>)}
          {[
            ["Workspace", ["overview", "assistant"]],
            ["Sales", ["leads", "companies", "contacts", "deals", "products", "invoices", "campaigns", "mailboxes"]],
            ["Productivity", ["tasks", "notes", "emails", "projects", "tickets"]],
            ["Insights & automation", ["dashboards", "workflows"]],
            ["Custom objects", objectTypes.filter(key => !["leads", "companies", "contacts", "deals", "tasks", "notes", "emails", "projects", "campaigns", "tickets", "products", "invoices"].includes(key))],
          ].filter(([,keys]) => keys.some(key => sections.some(section => section.key === key))).map(([group, keys]) => <React.Fragment key={group}><h3>{group}</h3>
          {sections.filter(section => keys.includes(section.key)).map(section => <SectionMenu key={section.key} section={section} pinned={pinnedSections.some(pin => pin.key === section.key)} toggle={toggleSectionPin}>
            <DrawerItem icon={<section.Icon size={16} />} label={section.label} active={route === section.key} onClick={() => nav(section.key)} />
          </SectionMenu>)}</React.Fragment>)}
        </NavigationDrawerItemGroup>

        <div className="sidebar-footer">
          <div className="sidebar-account-row">
            <button
              type="button"
              className="sidebar-account"
              aria-haspopup="dialog"
              aria-expanded={accountMenu}
              aria-label="Account and workspaces"
              onClick={() => setAccountMenu((open) => !open)}
            >
              <Avatar
                size="xs"
                shape="circle"
                name={db.account?.name || db.members?.[0] || "Alex Morgan"}
              />
              <span className="sidebar-account-copy">
                <strong>{db.account?.name || db.members?.[0] || "Alex Morgan"}</strong>
                <small title={db.workspace || "Local workspace"}>
                  {db.workspace || "Local workspace"}
                </small>
              </span>
              <IconChevronUp size={13} className="sidebar-account-chevron" />
            </button>
            <button
              type="button"
              className="sidebar-account-action"
              aria-label="Settings"
              title="Settings"
              onClick={() => nav("settings")}
            >
              <IconSettings size={15} />
            </button>
            <button
              type="button"
              className="sidebar-account-action"
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <PageContainer>
          <PageHeader
            title={special?.[0] || (isObjectRoute ? object.plural : "Overview")}
            icon={
              <>
                <Button
                  className="menu-toggle"
                  variant="ghost"
                  aria-label="Toggle sidebar"
                  aria-controls="crm-sidebar"
                  aria-expanded={window.innerWidth <= 980 ? menuOpen : !sidebarCollapsed}
                  onClick={() => {
                    if (window.innerWidth <= 980) setMenuOpen(!menuOpen);
                    else {
                      const next = !sidebarCollapsed;
                      if (commit(state => {state.ui.sidebarCollapsed = next;})) setSidebarCollapsed(next);
                    }
                  }}
                >
                  <IconLayoutSidebar size={16} />
                </Button>
                <Icon size={17} />
              </>
            }
          >
            <span className="header-count">
              {isObjectRoute
                ? `${rows.length} of ${db[route].length}`
                : route === "workflows"
                  ? `${db.workflows?.length || 0} workflows`
                  : route === "settings"
                    ? "Local only"
                    : route === "account"
                      ? `${listWorkspaces().length} ${
                          listWorkspaces().length === 1 ? "workspace" : "workspaces"
                        }`
                    : route === "mailboxes"
                      ? `${(db.mailboxes || []).length} ${
                          (db.mailboxes || []).length === 1 ? "account" : "accounts"
                        }`
                      : ""}
            </span>
            <SearchButton className="header-search" onOpen={() => setCommandOpen(true)} />
            {route === "leads" && <Button size="sm" onClick={() => setOptionsOpen("transfer")}>Import / export</Button>}
            {isObjectRoute && (
              <Button
                size="sm"
                variant="solid"
                startIcon={<IconPlus size={14} />}
                onClick={() => openNew(route)}
              >
                New {object.singular.toLowerCase()}
              </Button>
            )}
          </PageHeader>

          <div className="surface">
            {isObjectRoute ? (
              <div className="object-page">
                {route === "leads" && <p className="lead-list-hint">Your raw prospect list. Track outreach here, then convert interested leads into People and Companies to manage the relationship.</p>}
                <ViewBar
                  type={route}
                  db={db}
                  config={config}
                  views={viewsFor}
                  onChange={updateConfig}
                  onOpenView={showView}
                  onSaveView={saveView}
                  onDeleteView={deleteView}
                  onOptions={() => setOptionsOpen(true)}
                  dirty={dirty}
                />

                {config.layout === "table" && (
                  <TableView
                    type={route}
                    db={db}
                    rows={rows}
                    visible={visibleColumns}
                    sort={config.sort}
                    onSort={(field) =>
                      updateConfig({
                        sort: {
                          field,
                          direction:
                            config.sort?.field === field &&
                            config.sort?.direction === "asc"
                              ? "desc"
                              : "asc",
                        },
                      })
                    }
                    onOpen={(record) => openRecord(route, record)}
                    onCreate={() => openNew(route)}
                    commit={commit}
                    onBulkDelete={bulkDelete}
                    onOptions={() => setOptionsOpen(true)}
                    label={(key) => fieldDef(route, key, db)?.label || key}
                  />
                )}

                {config.layout === "kanban" && (
                  <BoardView
                    type={route}
                    db={db}
                    rows={rows}
                    groupBy={config.groupBy || object.defaultGroup}
                    onMove={moveRecord}
                    onOpen={(record) => openRecord(route, record)}
                    onCreate={(prefill) => openNew(route, prefill)}
                  />
                )}

                {config.layout === "calendar" && (
                  <RecordCalendar
                    type={route}
                    db={db}
                    rows={rows}
                    dateField={config.dateField || object.dateField || "date"}
                    label={(key) => fieldDef(route, key, db)?.label || key}
                    onOpen={(record) => openRecord(route, record)}
                    onCreate={(date) => openNew(route, { [config.dateField || "date"]: date })}
                  />
                )}
              </div>
            ) : route === "overview" ? (
              <Overview
                db={db}
                open={openRecord}
                openNew={openNew}
                goToDeals={showStage}
                commit={commit}
                nav={nav}
              />

            ) : route === "dashboards" ? (
              <DashboardView db={db} commit={commit} open={openRecord} />
            ) : route === "workflows" ? (
              <Workflows db={db} commit={commit} />
            ) : route === "mailboxes" ? (
              <Mailboxes db={db} commit={commit} />
            ) : route === "assistant" ? (
              <Assistant
                db={db}
                commit={commit}
                open={openRecord}
                openNew={openNew}
                nav={nav}
              />
            ) : route === "account" ? (
              <Account
                db={db}
                commit={commit}
                backup={backup}
                restoreFile={restoreFile}
                resetDemo={resetDemo}
                nav={nav}
              />
            ) : route === "settings" ? (
              <Settings
                db={db}
                commit={commit}
                saveQuiet={saveQuiet}
                theme={theme}
                setTheme={setTheme}
                backup={backup}
                restoreFile={restoreFile}
                resetDemo={resetDemo}
                open={openRecord}
                nav={nav}
              />
            ) : (
              <div className="empty-state">
                <strong>Nothing here</strong>
                <Button onClick={() => nav("overview")}>Back to overview</Button>
              </div>
            )}
          </div>
        </PageContainer>
      </div>

      {readError && (
        <div className="storage-warning" role="alert">
          Local storage could not be read. Restore a backup from Settings.
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {drawer && (
        <RecordPage
          key={`${drawer.type}-${drawer.id || drawer.draft?.name || "new"}`}
          type={drawer.type}
          recordId={drawer.id}
          draft={drawer.draft}
          db={db}
          close={() => setDrawer(null)}
          commit={commit}
          open={openRecord}
          openNew={openNew}
          onDuplicate={(copy) => {
            setDrawer({ type: drawer.type, draft: copy });
          }}
          onEmail={(context) => setEmail(context)}
          nav={nav}
        />
      )}

      {email && (
        <EmailComposer
          context={email.record ? email : null}
          db={db}
          close={() => setEmail(null)}
          commit={commit}
        />
      )}

      {accountMenu && (
        <AccountMenu
          db={db}
          onClose={() => setAccountMenu(false)}
          nav={nav}
        />
      )}

      {commandOpen && (
        <CommandMenu
          db={db}
          close={() => setCommandOpen(false)}
          onNav={nav}
          onOpen={openRecord}
          onNew={openNew}
          onToggleTheme={toggleTheme}
          onBackup={backup}
        />
      )}

      {optionsOpen && isObjectRoute && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOptionsOpen(false);
          }}
        >
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-label="View options">
            <header>
              <strong>{object.plural} {optionsOpen === "transfer" ? "import / export" : "options"}</strong>
              <Button size="sm" variant="ghost" aria-label="Close" onClick={() => setOptionsOpen(false)}>
                <IconX size={16} />
              </Button>
            </header>
            <TableOptions
              transferOnly={optionsOpen === "transfer"}
              type={route}
              db={db}
              all={allColumns}
              visible={visibleColumns}
              label={(key) => fieldDef(route, key, db)?.label || key}
              rows={rows}
              commit={commit}
            />
          </section>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}

function orderedUnique(values) {
  return [...new Set(values)];
}

createRoot(document.getElementById("root")).render(<App />);
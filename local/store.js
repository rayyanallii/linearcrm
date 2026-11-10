import { confirmAction, notifyUser } from "./dialogs";
import { seed } from "../data.js";
import { updateTaskActivity, activityStatuses } from "./task-activity.mjs";
import { normalizePipelines, recordStageChanges, pipelineProbability } from "./pipelines.mjs";
import { flushScheduled, normalizeWorkflowShape, runWorkflows } from "./workflow-engine.mjs";
import { normalizeQuoteLine } from "./commerce.mjs";
import { normalizeFollowUps } from "./campaigns.mjs";
import { normalizeMailbox } from "./mailbox-health.mjs";
import {
  OBJECTS,
  FEATURE_PACKS,
  featureEnabled,
  fieldDefs,
  stageProbability,
  stages,
  today,
  nowIso,
  owners,
  objectDef,
  nextId,
} from "./schema";

const LEGACY_KEY = "linear-crm.v1";
const REGISTRY_KEY = "linear-crm.workspaces.v1";
let key = LEGACY_KEY;
let activeWorkspace = "default";
let registry = null;
let db;
let readError = false;

function storageKeyFor(id) {
  return id === "default" ? LEGACY_KEY : `linear-crm.ws.${id}`;
}

function readRegistry() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REGISTRY_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.workspaces)) return null;
    const workspaces = parsed.workspaces
      .filter((workspace) => workspace && typeof workspace.id === "string")
      .map((workspace) => ({
        id: workspace.id,
        createdAt: workspace.createdAt || new Date().toISOString(),
      }));
    if (!workspaces.length) return null;
    return {
      activeId: workspaces.some((workspace) => workspace.id === parsed.activeId)
        ? parsed.activeId
        : workspaces[0].id,
      workspaces,
    };
  } catch {
    return null;
  }
}

function writeRegistry(next) {
  registry = next;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(next));
}

export function collections(state = db) {
  return [
    ...Object.keys(OBJECTS),
    ...((state?.objects || []).map((object) => object.key)),
  ];
}

export function enabledCollections(state = db) {
  return collections(state).filter((type) => featureEnabled(state, type));
}

export function valid(value) {
  return (
    !!value &&
    typeof value === "object" &&
    ["companies", "contacts", "deals", "tasks", "notes"].every((collection) =>
      Array.isArray(value[collection]),
    )
  );
}

const FILTER_FIELD = {
  companies: "industry",
  contacts: "company",
  deals: "stage",
  tasks: "status",
  notes: "deal",
};

function normalizeFilter(filter, index = 0) {
  if (!filter || typeof filter !== "object") return null;
  const opMap = {
    contains: "contains",
    equals: "is",
    excludes: "not_contains",
    empty: "is_empty",
    greater: "gt",
    less: "lt",
  };
  return {
    id: filter.id || `filter_${index}_${Math.random().toString(36).slice(2, 8)}`,
    field: String(filter.field || ""),
    op: opMap[filter.op] || filter.op || "contains",
    value:
      filter.value === undefined || filter.value === null
        ? filter.term || ""
        : filter.value,
  };
}

function normalizeView(view, state) {
  if (!view || typeof view !== "object") return null;
  const type = view.type;
  if (!collections(state).includes(type)) return null;
  const object = objectDef(type, state);

  let filters = Array.isArray(view.filters)
    ? view.filters.map(normalizeFilter).filter(Boolean)
    : Array.isArray(view.conditions)
      ? view.conditions.map(normalizeFilter).filter(Boolean)
      : [];

  if (view.value) {
    const field = view.valueField || FILTER_FIELD[type];
    if (field) {
      filters = [
        { id: nextId("filter"), field, op: "is", value: view.value },
        ...filters,
      ];
    }
  }

  const layout =
    view.layout === "kanban" || view.layout === "calendar" || view.layout === "table"
      ? view.layout
      : view.calendar === true
        ? "calendar"
        : view.board === false
          ? "table"
          : view.board === true
            ? "kanban"
            : "table";

  return {
    id: view.id || nextId("view"),
    type,
    name: String(view.name || "Untitled view"),
    layout,
    query: String(view.query || ""),
    filters,
    logic: view.logic === "or" || view.logic === "any" ? "or" : "and",
    sort: {
      field: view.sort?.field || view.sortKey || "name",
      direction:
        view.sort?.direction === "desc" || view.descending === true ? "desc" : "asc",
    },
    groupBy:
      view.groupBy ||
      object.defaultGroup ||
      (type === "deals" ? "stage" : null),
    dateField: view.dateField || object.dateField || "date",
    visibleFields: Array.isArray(view.visibleFields) ? view.visibleFields : null,
    pinned: view.pinned === true,
  };
}

function normalizeWorkflow(workflow, index = 0, state) {
  if (!workflow || typeof workflow !== "object") return null;
  const trigger = workflow.trigger || {};
  const action = workflow.action || {};
  const knownObjects = state ? collections(state) : ["deals"];
  const triggerObject = knownObjects.includes(trigger.object)
    ? trigger.object
    : "deals";
  return {
    ...workflow,
    id: workflow.id || `workflow_${index}`,
    name: String(workflow.name || "Untitled workflow"),
    enabled: workflow.enabled !== false,
    trigger: {
      object: trigger.object || triggerObject,
      event:
        trigger.event === "created" || trigger.event === "field_changed"
          ? trigger.event
          : "stage_changed",
      field: trigger.field || (trigger.object === "deals" ? "stage" : "status"),
      value: trigger.value ?? "",
    },
    action: {
      type: "create_task",
      title: String(action.title || workflow.name || "Follow up"),
      delay: Math.max(0, Math.min(365, Number(action.delay) || 0)),
    },
    createdAt: workflow.createdAt || nowIso(),
  };
}

export function normalize(input) {
  if (!input || typeof input !== "object") return seed();
  const state = structuredClone(input);

  state.version = 1;
  state.workspace = String(state.workspace || "Linear CRM");
  state.members =
    Array.isArray(state.members) && state.members.length
      ? state.members.filter((member) => typeof member === "string")
      : [...owners];
  state.account = {
    name: String(state.account?.name || state.members?.[0] || "Alex Morgan"),
    email: String(state.account?.email || ""),
    role: String(state.account?.role || ""),
  };
  state.objects = Array.isArray(state.objects)
    ? state.objects.filter(
        (object) =>
          object && typeof object.key === "string" && typeof object.plural === "string",
      )
    : [];
  state.customFields = Array.isArray(state.customFields)
    ? state.customFields.filter(
        (field) =>
          field &&
          typeof field.key === "string" &&
          typeof field.type === "string" &&
          typeof field.title === "string",
      )
    : [];

  for (const collection of collections(state)) {
    if (!Array.isArray(state[collection])) state[collection] = [];
    state[collection] = state[collection]
      .filter((record) => record && typeof record === "object")
      .map((record) => ({
        ...record,
        id: record.id || nextId("rec"),
        name: String(record.name || "Untitled"),
      }));
  }

  state.layout =
    state.layout && typeof state.layout === "object" ? state.layout : {};
  state.views = Array.isArray(state.views)
    ? state.views.map((view) => normalizeView(view, state)).filter(Boolean)
    : [];
  if (!state.views.length) {
    for (const type of collections(state)) {
      state.views.push(
        normalizeView(
          {
            id: nextId("view"),
            type,
            name: `All ${objectDef(type, state).plural.toLowerCase()}`,
            icon: "table",
          },
          state,
        ),
      );
    }
  }

  state.reports = Array.isArray(state.reports)
    ? state.reports
        .filter(
          (report) =>
            report &&
            collections(state).includes(report.source) &&
            typeof report.group === "string",
        )
        .map((report) => ({
          id: report.id || nextId("report"),
          title: String(report.title || "Untitled widget"),
          source: report.source,
          group: report.group,
          measure: ["count", "amount", "avg"].includes(report.measure)
            ? report.measure
            : "count",
          type: ["bar", "donut", "line", "metric"].includes(report.type)
            ? report.type
            : "bar",
          width: report.width === "full" ? "full" : "half",
        }))
    : [];

  state.workflows = Array.isArray(state.workflows)
    ? state.workflows
        .map((workflow, index) => normalizeWorkflow(workflow, index, state))
        .filter(Boolean)
    : Array.isArray(state.rules)
      ? state.rules
          .filter((rule) => rule && rule.title && rule.stage)
          .map((rule) => ({
            id: rule.id || nextId("workflow"),
            name: rule.title,
            enabled: !rule.paused,
            trigger: {
              object: "deals",
              event: "stage_changed",
              field: "stage",
              value: rule.stage,
            },
            action: {
              type: "create_task",
              title: rule.title,
              delay: Math.max(0, Math.min(365, Number(rule.delay) || 0)),
            },
            createdAt: nowIso(),
          }))
      : [];
  delete state.rules;
  state.workflows.forEach((workflow) => normalizeWorkflowShape(workflow));
  state.scheduled = Array.isArray(state.scheduled)
    ? state.scheduled.filter(
        (entry) =>
          entry &&
          entry.workflowId &&
          entry.recordType &&
          entry.recordId &&
          Number.isFinite(entry.runAt),
      )
    : [];

  state.workflowRuns = Array.isArray(state.workflowRuns) ? state.workflowRuns : [];
  state.mailboxes = Array.isArray(state.mailboxes)
    ? state.mailboxes
        .filter((mailbox) => mailbox && typeof mailbox === "object")
        .map(normalizeMailbox)
    : [];
  for (const campaign of state.campaigns || []) {
    campaign.followUps = normalizeFollowUps(campaign.followUps);
    campaign.sentTo = Array.isArray(campaign.sentTo)
      ? campaign.sentTo.filter((key) => typeof key === "string")
      : [];
    campaign.sentCount = Math.max(0, Number(campaign.sentCount) || 0);
    campaign.followUpStep = Math.max(0, Number(campaign.followUpStep) || 0);
    campaign.audienceObject = campaign.audienceObject === "People" ? "People" : "Leads";
    campaign.audienceStatus ||= "Any";
    campaign.audienceSource ||= "Any";
    campaign.audiencePriority ||= "Any";
    campaign.audienceOwner ||= "Any";
    campaign.subject = String(campaign.subject || "");
    campaign.body = String(campaign.body || "");
    campaign.attachment = String(campaign.attachment || "");
    campaign.emailAccount ||= "";
  }
  state.files = Array.isArray(state.files) ? state.files : [];
  state.pins = Array.isArray(state.pins) ? state.pins : [];
  state.trash = Array.isArray(state.trash) ? state.trash : [];
  state.activity = Array.isArray(state.activity)
    ? state.activity.filter(
        (item) => item && typeof item.text === "string" && Number.isFinite(item.at),
      )
    : [];
  state.chat = Array.isArray(state.chat) ? state.chat : [];
  state.ui = {
    theme: state.ui?.theme === "dark" ? "dark" : "light",
    density: state.ui?.density === "compact" ? "compact" : "comfortable",
    ...state.ui,
  };

  state.ui.features = Object.fromEntries(
    FEATURE_PACKS.map((pack) => [pack.key, state.ui.features?.[pack.key] === true]),
  );

  for(const lead of state.leads){
    if(!lead.status)lead.status="Not contacted";
    if(lead.conversion)lead.status="Converted";
  }
    normalizePipelines(state);
    for (const deal of state.deals) {
    if (!stages.includes(deal.stage)) deal.stage = "Prospecting";
    if (deal.probability === undefined || deal.probability === "") {
        deal.probability = pipelineProbability(state, deal.pipeline, deal.stage, stageProbability);
    }
    if (deal.amount === undefined || deal.amount === "") deal.amount = 0;
    if (!deal.source) deal.source = "";
    if (!deal.type) deal.type = "";
    if (!deal.nextStep) deal.nextStep = "";
    deal.lineItems = Array.isArray(deal.lineItems)
      ? deal.lineItems
          .filter((line) => line && typeof line === "object")
          .map(normalizeQuoteLine)
      : [];
  }
  for (const task of state.tasks) {
    if (!activityStatuses.includes(task.status)) task.status = "Open";
    if (!task.repeat) task.repeat = "None";
    if (!task.priority) task.priority = "Normal";
    if (!task.taskType) task.taskType = "To-do";
  }
  for (const contact of state.contacts) {
    if (!contact.status) contact.status = "Lead";
  }
  for (const product of state.products || []) {
    if (!product.category) product.category = "Software";
    if (product.unitPrice === undefined || product.unitPrice === "") product.unitPrice = 0;
    if (product.unitCost === undefined || product.unitCost === "") product.unitCost = 0;
    if (!product.billing) product.billing = "One-time";
    if (product.active === undefined) product.active = true;
  }

  return state;
}

registry = readRegistry();
if (registry) {
  activeWorkspace = registry.activeId;
  key = storageKeyFor(activeWorkspace);
}

try {
  const raw = localStorage.getItem(key);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!valid(parsed)) throw new Error("Invalid workspace");
    db = normalize(parsed);
    flushScheduled(db);
    localStorage.setItem(key, JSON.stringify(db));
  } else {
    db = normalize(seed());
    localStorage.setItem(key, JSON.stringify(db));
  }
} catch (error) {
  db = normalize(seed());
  readError = true;
}

if (!registry) {
  activeWorkspace = "default";
  key = LEGACY_KEY;
  try {
    writeRegistry({
      activeId: "default",
      workspaces: [{ id: "default", createdAt: new Date().toISOString() }],
    });
  } catch {
    registry = {
      activeId: "default",
      workspaces: [{ id: "default", createdAt: new Date().toISOString() }],
    };
  }
}

export function listWorkspaces() {
  if (!registry) return [];
  return registry.workspaces.map((workspace) => {
    const raw = (() => {
      try {
        return localStorage.getItem(storageKeyFor(workspace.id)) || "";
      } catch {
        return "";
      }
    })();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
    const records = data
      ? collections(data).reduce(
          (total, type) => total + (Array.isArray(data[type]) ? data[type].length : 0),
          0,
        )
      : 0;
    return {
      id: workspace.id,
      name: data?.workspace || "Untitled workspace",
      createdAt: workspace.createdAt,
      active: workspace.id === activeWorkspace,
      records,
      bytes: raw.length,
      demo: data?.demoData === true,
    };
  });
}

export function createWorkspace(name, { demo = false } = {}) {
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Give the workspace a name.");
  const id = `ws_${crypto.randomUUID()}`;
  const fresh = normalize(seed());
  fresh.workspace = trimmed;
  fresh.demoData = demo === true;
  if (!fresh.demoData) {
    for (const type of collections(fresh)) fresh[type] = [];
    fresh.views = [];
    fresh.reports = [];
    fresh.workflows = [];
    fresh.workflowRuns = [];
    fresh.scheduled = [];
    fresh.activity = [];
    fresh.trash = [];
    fresh.files = [];
    fresh.pins = [];
    fresh.chat = [];
    fresh.objects = [];
    fresh.customFields = [];
    fresh.layout = {};
  }
  localStorage.setItem(storageKeyFor(id), JSON.stringify(fresh));
  writeRegistry({
    activeId: registry?.activeId || activeWorkspace,
    workspaces: [
      ...(registry?.workspaces || []),
      { id, createdAt: new Date().toISOString() },
    ],
  });
  return id;
}

export function activateWorkspace(id) {
  if (!registry || !registry.workspaces.some((workspace) => workspace.id === id)) {
    return false;
  }
  if (id === activeWorkspace) return true;
  writeRegistry({ activeId: id, workspaces: registry.workspaces });
  location.reload();
  return true;
}

export function renameWorkspaceSnapshot(id, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Give the workspace a name.");
  const targetKey = storageKeyFor(id);
  const raw = localStorage.getItem(targetKey);
  if (!raw) throw new Error("That workspace is no longer available.");
  const data = JSON.parse(raw);
  data.workspace = trimmed;
  localStorage.setItem(targetKey, JSON.stringify(data));
  if (id === activeWorkspace) db.workspace = trimmed;
  return true;
}

export function duplicateWorkspace(id, name) {
  const sourceKey = storageKeyFor(id);
  const raw = localStorage.getItem(sourceKey);
  if (!raw) throw new Error("That workspace is no longer available.");
  const copy = normalize(JSON.parse(raw));
  copy.workspace = String(name || `${copy.workspace} copy`).trim();
  const nextId = `ws_${crypto.randomUUID()}`;
  localStorage.setItem(storageKeyFor(nextId), JSON.stringify(copy));
  writeRegistry({
    activeId: registry?.activeId || activeWorkspace,
    workspaces: [
      ...(registry?.workspaces || []),
      { id: nextId, createdAt: new Date().toISOString() },
    ],
  });
  return nextId;
}

export function deleteWorkspace(id) {
  if (!registry || registry.workspaces.length <= 1) return false;
  const remaining = registry.workspaces.filter((workspace) => workspace.id !== id);
  if (remaining.length === registry.workspaces.length) return false;
  localStorage.removeItem(storageKeyFor(id));
  if (id === activeWorkspace) {
    writeRegistry({ activeId: remaining[0].id, workspaces: remaining });
    location.reload();
    return true;
  }
  writeRegistry({ activeId: registry.activeId, workspaces: remaining });
  return true;
}

function stampChanges(next, description) {
  const now = nowIso();
  const changes = [];
  for (const type of collections(next)) {
    const previous = new Map((db[type] || []).map((record) => [record.id, record]));
    for (const record of next[type]) {
      const before = previous.get(record.id);
      if (!before) {
        if (!record.createdBy) record.createdBy = next.members?.[0] || "Alex Morgan";
        if (!record.createdAt) record.createdAt = now;
      }
      if (!before || JSON.stringify(before) !== JSON.stringify(record)) {
        record.updatedAt = now;
        changes.push({ type, id: record.id });
      }
    }
  }
  if (description) {
    next.activity.unshift({
      at: Date.now(),
      text: description,
      changes,
      actor: next.members?.[0] || "Alex Morgan",
    });
    next.activity = next.activity.slice(0, 250);
  }
  return changes;
}

export function save(change, description) {
  const next = structuredClone(db);
  try {
    change(next);

    updateTaskActivity(db, next);
    for(const lead of next.leads||[]){
      if(!lead.status)lead.status="Not contacted";
      if(lead.status==="Converted"&&!lead.conversion)throw Error("Use Convert lead to create or link customer records.");
      if(lead.conversion)lead.status="Converted";
    }
  } catch (error) {
    console.error(error);
    notifyUser(error.message || "That change could not be applied. Nothing was saved.");
    return false;
  }
  if (!Array.isArray(next.activity)) next.activity = [];
  if (!Array.isArray(next.workflows)) next.workflows = [];
  if (!Array.isArray(next.workflowRuns)) next.workflowRuns = [];
  runWorkflows(db, next);
  flushScheduled(next);
  recordStageChanges(db, next, stageProbability);
  stampChanges(next, description);
  try {
    localStorage.setItem(key, JSON.stringify(next));
    db = next;
    return true;
  } catch {
    notifyUser(
      "Unable to save this workspace. Browser storage may be full — export a backup and remove large attachments.",
    );
    return false;
  }
}

export function saveQuiet(change) {
  const next = structuredClone(db);
  try {
    change(next);
    localStorage.setItem(key, JSON.stringify(next));
    db = next;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function reload(value) {
  const next = normalize(structuredClone(value));
  localStorage.setItem(key, JSON.stringify(next));
  db = next;
  readError = false;
}

export function recordFields(type) {
  return fieldDefs(type, db).map((field) => [
    field.key,
    field.label,
    field.type === "relation" ? field.object : field.options || field.type,
  ]);
}

export { db, readError, key, activeWorkspace };
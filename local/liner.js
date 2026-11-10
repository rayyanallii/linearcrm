import { OBJECTS, featureEnabled, fieldDefs, optionsFor, today, openStages } from "./schema";

export const recordTypes = db => [...Object.keys(OBJECTS), ...(db.objects || []).map(row => row.key)].filter(type => featureEnabled(db, type));
export function localAnswer(db, question) {
  const text = question.trim().toLowerCase().replace(/[?.!]+$/, "");
  if (/^(hi|hello|hey)( liner)?$/.test(text)) return "Hi! I’m Liner. Ask me about your leads, opportunities or tasks, or tell me what you’d like to update.";
  const list = (heading, rows, empty) => rows.length ? heading + "\n" + rows.slice(0, 20).map(row => "• " + row).join("\n") + (rows.length > 20 ? "\nShowing 20 of " + rows.length + " matches." : "") : empty;
  const active = (db.tasks || []).filter(task => !["Done", "Cancelled"].includes(task.status));
  if (/^(which|what) (opportunities|deals) need attention$/.test(text)) {
    const rows = (db.deals || []).filter(deal => openStages.includes(deal.stage)).map(deal => {
      const reasons = [];
      if (deal.date && deal.date < today()) reasons.push("close date overdue");
      if (deal.nextFollowUp && deal.nextFollowUp < today()) reasons.push("follow-up overdue");
      if (!deal.nextStep) reasons.push("no next step");
      if (!deal.owner) reasons.push("unassigned");
      return reasons.length ? deal.name + " — " + reasons.join(", ") : null;
    }).filter(Boolean);
    return list("Opportunities needing attention (based on dates, next steps and owners):", rows, "No open opportunities have overdue dates, missing next steps or missing owners.");
  }
  if (text === "find interested leads without a follow-up") {
    const rows = (db.leads || []).filter(lead => lead.status === "Interested" && !lead.nextFollowUp && !active.some(task => task.lead === lead.id)).map(lead => lead.name);
    return list("Interested leads with no scheduled follow-up or open linked task:", rows, "Every interested lead has a follow-up date or an open linked task.");
  }
  if (text === "help me clean up missing contact details") {
    const rows = (db.contacts || []).filter(person => !person.email || !person.phone).map(person => person.name + " — missing " + [!person.email && "email", !person.phone && "phone"].filter(Boolean).join(" and "));
    return list("People with missing contact details:", rows, "All people have an email address and phone number. No changes were made.");
  }
  const match = text.match(/^(?:how many|count(?: my| all)?|what is the (?:total |)number of) (leads|companies|people|contacts|opportunities|deals|tasks|notes|emails)(?: (?:do (?:i|we) have|are there|in (?:my|the|our) workspace))?$/);
  if (!match) return null;
  const types = { people:"contacts", opportunities:"deals" };
  const count = (db[types[match[1]] || match[1]] || []).length;
  return `You have ${count} ${match[1]} in your workspace. This count comes directly from your current CRM records.`;
}
const clone = value => structuredClone(value);
const same = (a, b) => JSON.stringify(a ?? "") === JSON.stringify(b ?? "");

export function catalog(db) {
  return {
    workspace: db.workspace, today: today(),
    collections: recordTypes(db).map(type => ({ type, count: db[type]?.length || 0,
      fields: fieldDefs(type, db).filter(field => !field.readonly && field.type !== "computed").map(field => ({ key: field.key, label: field.label, type: field.type, required: !!field.required, relation: field.object, options: field.type === "select" || field.type === "owner" ? optionsFor(field, db) : undefined })) })),
    members: db.members, pipelines: db.pipelines,
  };
}

export function readWorkspace(db, args) {
  if (args.section === "catalog") return catalog(db);
  const sections = { trash: db.trash, favorites: db.pins, workflowRuns: db.workflowRuns, views: db.views, workflows: db.workflows, dashboards: db.reports, activity: db.activity, files: (db.files || []).map(({ data, ...metadata }) => metadata), settings: { workspace: db.workspace, ui: db.ui, members: db.members, pipelines: db.pipelines } };
  if (args.section !== "records") {
    if (!Object.hasOwn(sections, args.section)) throw Error("Unknown workspace section.");
    return clone(sections[args.section] || []);
  }
  if (!recordTypes(db).includes(args.type)) throw Error("Choose a collection from the catalog.");
  const query = String(args.query || "").toLowerCase();
  const rows = (db[args.type] || []).filter(row => (!args.id || row.id === args.id) && (!query || JSON.stringify(row).toLowerCase().includes(query)));
  const offset = Math.max(0, Number(args.offset) || 0);
  const limit = Math.min(100, Math.max(1, Number(args.limit) || 30));
  return { total: rows.length, offset, nextOffset: offset + limit < rows.length ? offset + limit : null, records: clone(rows.slice(offset, offset + limit)) };
}

export function validateValues(db, type, values, operation, original) {
  if (!recordTypes(db).includes(type)) throw Error("Unknown record collection.");
  if (!values || typeof values !== "object" || Array.isArray(values) || !Object.keys(values).length) throw Error("Specify fields to change.");
  const fields = fieldDefs(type, db);
  for (const [key, value] of Object.entries(values)) {
    const field = fields.find(item => item.key === key);
    if (!field || field.readonly || field.system || field.type === "computed") throw Error(`Field ${key} cannot be edited.`);
    if (["__proto__", "constructor", "prototype"].includes(key)) throw Error("Invalid field.");
    if (value !== null && typeof value === "object") throw Error(`${field.label} must be a simple value.`);
    if (!["number", "currency", "percent", "boolean"].includes(field.type) && typeof value !== "string") throw Error(`${field.label} must be text.`);
    if (field.type === "url" && value && /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) throw Error("Use an http or https URL.");
    if (field.required && !String(value ?? "").trim()) throw Error(`${field.label} is required.`);
    if (["number", "currency", "percent"].includes(field.type) && value !== "" && (typeof value !== "number" || !Number.isFinite(value))) throw Error(`${field.label} must be a number.`);
    if (field.type === "percent" && (value < 0 || value > 100)) throw Error("Probability must be between 0 and 100.");
    if (field.type === "currency" && value < 0) throw Error("Amounts cannot be negative.");
    if (field.type === "boolean" && typeof value !== "boolean") throw Error(`${field.label} must be true or false.`);
    if (field.type === "select" && value && !optionsFor(field, db).includes(value)) throw Error(`Invalid ${field.label}.`);
    if (field.type === "owner" && value && !(db.members || []).includes(value)) throw Error("Choose an existing owner.");
    if (field.type === "relation" && value && !(db[field.object] || []).some(row => row.id === value)) throw Error(`Related ${field.label} does not exist.`);
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw Error("Enter a valid email address.");
    if (field.type === "date" && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw Error("Enter a valid YYYY-MM-DD date.");
    if (type === "leads" && key === "status" && value === "Converted") throw Error("Use the lead conversion screen to link customer records.");
    if (type === "leads" && key === "status" && original?.conversion) throw Error("A converted lead keeps its conversion status.");
  }
  if (operation === "create") for (const field of fields.filter(field => field.required)) if (!String(values[field.key] ?? "").trim()) throw Error(`${field.label} is required.`);
}

export function proposeChange(db, args) {
  if (!["create", "update"].includes(args.operation)) throw Error("Supported changes are create and update.");
  const original = (db[args.type] || []).find(row => row.id === args.id);
  if (args.operation === "update" && !original) throw Error("Record no longer exists.");
  validateValues(db, args.type, args.values, args.operation, original);
  return { id: crypto.randomUUID(), status: "pending", operation: args.operation, type: args.type, recordId: original?.id || crypto.randomUUID(), name: original?.name || args.values.name,
    values: clone(args.values), before: Object.fromEntries(Object.keys(args.values).map(key => [key, original?.[key] ?? ""])) };
}

export function applyChange(db, proposal) {
  if (proposal.status !== "pending") throw Error("This change is already resolved.");
  const original = (db[proposal.type] || []).find(row => row.id === proposal.recordId);
  validateValues(db, proposal.type, proposal.values, proposal.operation, original);
  if (proposal.operation === "update") {
    if (!original) throw Error("Record no longer exists.");
    for (const [key, before] of Object.entries(proposal.before)) if (!same(original[key], before)) throw Error("This record changed since the preview. Ask Liner for an updated proposal.");
    Object.assign(original, clone(proposal.values));
  } else {
    if (original) throw Error("This record was already created.");
    const defaults = proposal.type === "tasks" ? { status: "Open", priority: "Normal", taskType: "To-do" } : proposal.type === "leads" ? { status: "Not contacted", priority: "Normal" } : proposal.type === "deals" ? { stage: "Prospecting", pipeline: db.defaultPipelineId, amount: 0 } : {};
    db[proposal.type].unshift({ ...defaults, ...clone(proposal.values), id: proposal.recordId });
  }
}

export const linerTools = [
  { type: "function", function: { name: "read_workspace", description: "Read current CRM records and metadata. Page through records using nextOffset. Query matches all stored record fields. File metadata only; no attachment binary or credentials.", parameters: { type: "object", properties: { section: { type: "string", enum: ["catalog", "records", "settings", "views", "workflows", "dashboards", "activity", "files", "trash", "favorites", "workflowRuns"] }, type: { type: "string" }, id: { type: "string" }, query: { type: "string" }, offset: { type: "integer" }, limit: { type: "integer" } }, required: ["section"] } } },
  { type: "function", function: { name: "propose_change", description: "Propose creating or editing a CRM record. Use exact field keys and record IDs from read_workspace. Does not save: the user sees a review card and applies the change. Completing a repeating task creates one follow-up automatically. No deletions or configuration changes.", parameters: { type: "object", properties: { operation: { type: "string", enum: ["create", "update"] }, type: { type: "string" }, id: { type: "string" }, values: { type: "object", additionalProperties: true } }, required: ["operation", "type", "values"] } } },
];

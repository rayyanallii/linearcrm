import { OBJECTS, fieldDefs } from "./schema";
const clean = value => String(value || "").trim().toLowerCase();
const filled = value => value !== "" && value !== null && value !== undefined;
function domain(value) {
  if (!clean(value)) return "";
  try { return new URL(/^https?:\/\//i.test(value) ? value : "https://" + value.trim()).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return ""; }
}
export function duplicateGroups(db, type) {
  const buckets = new Map();
  for (const record of db[type] || []) {
    const key = type === "contacts" ? clean(record.email) : domain(record.website) || clean(record.name);
    if (!key) continue;
    const kind = type === "contacts" ? "Email" : domain(record.website) ? "Domain" : "Name (no domain)";
    const identity = kind + ":" + key;
    if (!buckets.has(identity)) buckets.set(identity, { key: identity, match: key, kind, records: [] });
    buckets.get(identity).records.push(record);
  }
  return [...buckets.values()].filter(group => group.records.length > 1);
}

export function mergePreview(db, type, primaryId, duplicateId) {
  if (!["companies", "contacts"].includes(type) || primaryId === duplicateId) throw Error("Choose two different People or Company records.");
  const primary = db[type]?.find(row => row.id === primaryId);
  const duplicate = db[type]?.find(row => row.id === duplicateId);
  if (!primary || !duplicate) throw Error("One of these records no longer exists.");
  const fields = fieldDefs(type, db).filter(field => !field.readonly && field.type !== "computed" && JSON.stringify(primary[field.key] ?? "") !== JSON.stringify(duplicate[field.key] ?? ""));
  const choices = Object.fromEntries(fields.map(field => [field.key, !filled(primary[field.key]) ? "duplicate" : field.type === "textarea" && filled(duplicate[field.key]) ? "combine" : "primary"]));
  return { type, primary: structuredClone(primary), duplicate: structuredClone(duplicate), fields, choices };
}

export function mergedValues(preview, choices) {
  const values = {};
  for (const field of preview.fields) {
    const option = choices[field.key];
    if (!["primary", "duplicate", "combine"].includes(option)) throw Error("Choose how to handle each field.");
    if (option === "combine" && field.type !== "textarea") throw Error("Only text notes can be combined.");
    const value = option === "combine" ? [preview.primary[field.key], `From ${preview.duplicate.name}:\n${preview.duplicate[field.key] || ""}`].filter(Boolean).join("\n\n") : (option === "duplicate" ? preview.duplicate[field.key] : preview.primary[field.key]) ?? "";
    if (field.required && !String(value).trim()) throw Error(`${field.label} cannot be empty.`);
    values[field.key] = value;
  }
  return values;
}

export function mergeRecords(db, preview, choices) {
  const { type, primary: before, duplicate: old } = preview;
  const primary = db[type]?.find(row => row.id === before.id);
  const duplicate = db[type]?.find(row => row.id === old.id);
  if (!primary || !duplicate) throw Error("One of these records no longer exists. Reopen the review.");
  if (JSON.stringify(primary) !== JSON.stringify(before) || JSON.stringify(duplicate) !== JSON.stringify(old)) throw Error("A record changed after this review was opened. Reopen it to see the latest values.");
  const values = mergedValues(preview, choices);
  const collectionTypes = [...Object.keys(OBJECTS), ...(db.objects || []).map(object => object.key)];
  Object.assign(primary, values);
  primary.mergeHistory = [...(primary.mergeHistory || []), { id: crypto.randomUUID(), at: new Date().toISOString(), sourceId: old.id, sourceName: old.name }];
  for (const collection of collectionTypes) {
    const relations = fieldDefs(collection, db).filter(field => field.type === "relation" && field.object === type);
    const records = [...(db[collection] || []), ...(db.trash || []).filter(entry => entry.type === collection).map(entry => entry.record)];
    for (const record of records) for (const field of relations) if (record[field.key] === old.id) record[field.key] = primary.id;
  }
  const conversionKey = type === "companies" ? "companyId" : "contactId";
  for (const lead of [...(db.leads || []), ...(db.trash || []).filter(entry => entry.type === "leads").map(entry => entry.record)]) if (lead.conversion?.[conversionKey] === old.id) lead.conversion[conversionKey] = primary.id;
  for (const file of db.files || []) if (file.type === type && file.record === old.id) file.record = primary.id;
  for (const item of db.activity || []) if (item.changes?.some(change => change.type === type && change.id === old.id) && !item.changes.some(change => change.type === type && change.id === primary.id)) item.changes.push({type, id:primary.id});
  for (const run of db.workflowRuns || []) if (run.targetType === type && run.targetId === old.id) run.targetId = primary.id;
  for (const entry of db.trash || []) for (const link of entry.links || []) if (link.type === type && link.id === old.id) link.id = primary.id;
  db.pins = (db.pins || []).map(pin => pin.type === type && pin.id === old.id ? {...pin,id:primary.id} : pin).filter((pin,index,all) => all.findIndex(other => other.type === pin.type && other.id === pin.id) === index);
  db[type] = db[type].filter(row => row.id !== old.id);
  db.trash ??= [];
  db.trash.unshift({ id: crypto.randomUUID(), type, record: structuredClone(old), links: [], at: Date.now(), mergedInto: primary.id });
  return primary;
}

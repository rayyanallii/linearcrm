import { allFieldDefs } from "./schema";

function collectionsOf(state) {
  return [
    ...new Set([
      ...["companies", "contacts", "leads", "deals", "tasks", "notes", "emails", "projects", "campaigns", "tickets"],
      ...((state.objects || []).map((object) => object.key)),
    ]),
  ];
}

export function moveToTrash(next, type, id) {
  const record = (next[type] || []).find((row) => row.id === id);
  if (!record) return false;
  const links = [];

  for (const otherType of collectionsOf(next)) {
    for (const field of allFieldDefs(otherType, next)) {
      if (field.type !== "relation" || field.object !== type) continue;
      for (const row of next[otherType] || []) {
        if (row[field.key] === id) {
          links.push({ type: otherType, id: row.id, field: field.key });
          row[field.key] = "";
        }
      }
    }
  }

  next.trash ??= [];
  next.trash.unshift({
    id: crypto.randomUUID(),
    type,
    record,
    links,
    at: Date.now(),
  });
  next[type] = (next[type] || []).filter((row) => row.id !== id);
  if (next.pins) {
    next.pins = next.pins.filter((pin) => pin.type !== type || pin.id !== id);
  }
  return true;
}

export function restoreRecord(next, entry) {
  if (!next[entry.type]) next[entry.type] = [];
  if (next[entry.type].some((row) => row.id === entry.record.id)) return false;
  next[entry.type].unshift(structuredClone(entry.record));
  for (const link of entry.links || []) {
    const row = (next[link.type] || []).find((item) => item.id === link.id);
    if (row && !row[link.field]) row[link.field] = entry.record.id;
  }
  next.trash = (next.trash || []).filter((item) => item.id !== entry.id);
  return true;
}

export function purgeTrash(next, id) {
  next.trash = (next.trash || []).filter((item) => item.id !== id);
}

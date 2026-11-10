import { fieldDef, fieldDefs, optionsFor } from "./schema";
import { displayValue, formatMoney } from "./format";

function filled(value) {
  return value !== "" && value !== null && value !== undefined;
}

function filterValue(record, field, type, db) {
  return displayValue(record, field.key, type, db);
}

export function testFilter(record, filter, type, db) {
  const field = fieldDef(type, filter.field, db);
  if (!field) return true;
  const raw = record[filter.field];
  const shown = String(filterValue(record, field, type, db) || "").toLowerCase();
  const target = String(filter.value ?? "").toLowerCase().trim();

  switch (filter.op) {
    case "is_empty":
      return !filled(raw) || !shown.trim();
    case "is_not_empty":
      return filled(raw) && !!shown.trim();
    case "is_true":
      return raw === true || raw === "true" || raw === "True";
    case "is_false":
      return raw === false || raw === "false" || raw === "False" || !filled(raw);
    case "gt":
      return filled(raw) && Number(raw) > Number(filter.value);
    case "lt":
      return filled(raw) && Number(raw) < Number(filter.value);
    case "before":
      return filled(raw) && String(raw).slice(0, 10) < String(filter.value);
    case "after":
      return filled(raw) && String(raw).slice(0, 10) > String(filter.value);
    case "is":
      if (field.type === "date" || field.type === "datetime")
        return String(raw || "").slice(0, 10) === String(filter.value).slice(0, 10);
      return shown === target;
    case "is_not":
      if (field.type === "date" || field.type === "datetime")
        return String(raw || "").slice(0, 10) !== String(filter.value).slice(0, 10);
      return shown !== target;
    case "not_contains":
      return !shown.includes(target);
    case "contains":
    default:
      return shown.includes(target);
  }
}

export function applyView(rows, config = {}, type, db) {
  let out = rows;
  const query = String(config.query || "").trim().toLowerCase();

  if (query) {
    const fields = fieldDefs(type, db);
    out = out.filter((record) =>
      fields.some((field) =>
        String(displayValue(record, field.key, type, db) || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }

  const filters = (config.filters || []).filter(
    (filter) => filter && filter.field && filter.op,
  );
  if (filters.length) {
    out = out.filter((record) => {
      const results = filters.map((filter) => testFilter(record, filter, type, db));
      return config.logic === "or" ? results.some(Boolean) : results.every(Boolean);
    });
  }

  return out;
}

export function sortRows(rows, sort, type, db) {
  if (!sort?.field) return [...rows];
  const field = fieldDef(type, sort.field, db);
  const direction = sort.direction === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    if (field && ["number", "currency", "percent"].includes(field.type)) {
      return ((Number(a[sort.field]) || 0) - (Number(b[sort.field]) || 0)) * direction;
    }
    if (field?.type === "boolean") {
      return ((a[sort.field] ? 1 : 0) - (b[sort.field] ? 1 : 0)) * direction;
    }
    const av = String(displayValue(a, sort.field, type, db) || "");
    const bv = String(displayValue(b, sort.field, type, db) || "");
    return (
      av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" }) *
      direction
    );
  });
}

export function groupRows(rows, fieldKey, type, db) {
  const field = fieldDef(type, fieldKey, db);
  if (!field) return [{ label: "All", rows }];
  const buckets = new Map();
  const options = optionsFor(field, db).map((option) =>
    typeof option === "string" ? option : option.name,
  );

  for (const option of options) buckets.set(option, []);
  for (const row of rows) {
    const label = displayValue(row, fieldKey, type, db) || "None";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(row);
  }

  const ordered = [...buckets.entries()].sort(([a], [b]) => {
    const ai = options.indexOf(a);
    const bi = options.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });
  return ordered.map(([label, groupRows]) => ({ label, rows: groupRows }));
}

export function totalAmount(rows) {
  return rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}

export function aggregate(rows, measure, source = "deals") {
  if (measure === "count") return rows.length;
  const values = rows
    .map((row) => (source === "deals" ? Number(row.amount) : Number(row.amount)))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return 0;
  if (measure === "avg")
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + value, 0);
}

export function formatMeasure(value, measure) {
  return measure === "count" ? Number(value).toLocaleString() : formatMoney(value);
}

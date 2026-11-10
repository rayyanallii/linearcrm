import Papa from "papaparse";
import { fieldDef, fieldDefs } from "./schema";
import { displayValue } from "./format";

export function exportRows(rows, keys, label, display, type) {
  const csv = Papa.unparse(
    {
      fields: keys.map(label),
      data: rows.map((row) => keys.map((key) => display(row, key))),
    },
    { escapeFormulae: true },
  );
  download(
    `\uFEFF${csv}`,
    `${type}-${new Date().toISOString().slice(0, 10)}.csv`,
    "text/csv;charset=utf-8",
  );
}

export function download(content, filename, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function parseImport(text, type, db) {
  const parsed = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase(),
  });
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  if (!parsed.data.length) throw new Error("The file contains no records.");

  const defs = fieldDefs(type, db);
  const map = new Map();
  for (const def of defs) {
    map.set(def.key.toLowerCase(), def);
    map.set(def.label.toLowerCase(), def);
  }

  if (!parsed.meta.fields.some((header) => map.get(header)?.key === "name"))
    throw new Error("Include a Name column.");

  return parsed.data.map((raw, index) => {
    const record = {
      id: crypto.randomUUID(),
      createdBy: db.members?.[0] || "Imported",
      createdAt: new Date().toISOString(),
    };
    for (const def of defs) {
      record[def.key] =
        def.type === "boolean"
          ? false
          : ["number", "currency", "percent"].includes(def.type)
            ? ""
            : "";
    }

    for (const [header, rawValue] of Object.entries(raw)) {
      const def = map.get(header);
      if (!def) continue;
      let value = String(rawValue ?? "").trim();
      const fail = (message) => {
        throw new Error(`Row ${index + 2}, ${header} — ${message}`);
      };

      if (def.type === "boolean") {
        value = ["yes", "true", "1", "y"].includes(value.toLowerCase());
      } else if (["number", "currency", "percent"].includes(def.type)) {
        if (value) {
          value = Number(value.replace(/[$,%]/g, ""));
          if (!Number.isFinite(value)) fail("enter a number");
        }
      } else if (def.type === "date" && value) {
        if (!/^\d{4}-\d\d-\d\d$/.test(value)) fail("use YYYY-MM-DD");
      } else if (def.type === "select" && value) {
        value = def.options.find(option => option.toLowerCase() === value.toLowerCase()) || value;
        if (!def.options.includes(value)) fail(`choose ${def.options.join(", ")}`);
      } else if (def.type === "relation" && value) {
        const matches = (db[def.object] || []).filter(
          (record) => record.id === value || record.name === value,
        );
        if (matches.length !== 1) fail("enter a unique related record name or ID");
        value = matches[0].id;
      } else if (def.type === "email" && value && !value.includes("@")) {
        fail("enter a valid email");
      }

      record[def.key] = value;
    }

    if (type === "leads") {
      if (!record.status) record.status = "Not contacted";
      if (record.status === "Converted") throw new Error(`Row ${index + 2}: import prospects with an outreach status, then use Convert lead. Use JSON backup to restore converted records and their links.`);
    }
    if (!record.name) throw new Error(`Row ${index + 2} needs a name.`);
    return record;
  });
}

export function recordDisplay(row, key, type, db) {
  const field = fieldDef(type, key, db);
  if (field?.type === "computed")
    return displayValue(row, key, type, db);
  return displayValue(row, key, type, db);
}

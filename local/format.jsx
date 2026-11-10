import React from "react";
import { Avatar, Tag } from "twenty-ui/primitives/data-display";
import { fieldDef, tagColorFor } from "./schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(value) {
  if (value === "" || value === null || value === undefined) return "";
  return currency.format(Number(value) || 0);
}

export function formatCompactMoney(value) {
  if (value === "" || value === null || value === undefined) return "$0";
  return compact.format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "";
  const raw = String(value);
  const date = new Date(raw.length <= 10 ? `${raw}T12:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function displayValue(record, key, type, db) {
  if (!record) return "";
  const field = fieldDef(type, key, db);
  if (!field) return record[key] === undefined || record[key] === null ? "" : record[key];
  const raw = record[key];

  switch (field.type) {
    case "relation":
      return db?.[field.object]?.find((row) => row.id === raw)?.name || "";
    case "owner":
      return raw || "";
    case "currency":
      return raw === "" || raw === null || raw === undefined ? "" : formatMoney(raw);
    case "number":
      return raw === "" || raw === null || raw === undefined
        ? ""
        : Number(raw).toLocaleString();
    case "percent":
      return raw === "" || raw === null || raw === undefined ? "" : `${raw}%`;
    case "boolean":
      return raw === true || raw === "true" || raw === "True"
        ? "Yes"
        : raw === false || raw === "false" || raw === "False"
          ? "No"
          : "";
    case "date":
      return formatDate(raw);
    case "datetime":
      return formatDateTime(raw);
    case "computed":
      if (field.computed === "taskCompleted") return formatDateTime(record.completedAt);
      if (field.computed === "checklistProgress") return record.checklist?.length ? `${record.checklist.filter(item => item.done).length}/${record.checklist.length}` : "";
      if(field.computed==="leadAge"){
        const created=Date.parse(record.createdAt);
        return Number.isFinite(created)?String(Math.max(0,Math.floor((Date.now()-created)/86400000))):"";
      }
      if (field.computed === "companyPeople") {
        return (db.contacts || [])
          .filter((contact) => contact.company === record.id)
          .map((contact) => contact.name)
          .join(", ");
      }
      return "";
    default:
      return raw ?? "";
  }
}

export function FieldValue({ record, fieldKey, type, db }) {
  const field = fieldDef(type, fieldKey, db);
  const text = displayValue(record, fieldKey, type, db);
  if (text === "" || text === null || text === undefined)
    return <span className="muted">—</span>;

  if (field?.type === "boolean") {
    return (
      <span className={"boolean " + (text === "Yes" ? "yes" : "no")}>
        {text === "Yes" ? "✓" : "×"}
      </span>
    );
  }

  if (field?.type === "select") {
    return <Tag color={tagColorFor(field, text)}>{text}</Tag>;
  }

  if (["name", "owner", "company", "contact"].includes(fieldKey)) {
    return (
      <span className="cell-person">
        <Avatar
          size="xs"
          shape={fieldKey === "name" || fieldKey === "owner" ? "circle" : "rounded-square"}
          name={text}
        />
        <span className="ellipsis">{text}</span>
      </span>
    );
  }

  if (field?.type === "currency") {
    return <span className="money">{text}</span>;
  }

  return <span className="ellipsis">{text}</span>;
}

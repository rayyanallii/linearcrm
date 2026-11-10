import React, { useEffect, useRef, useState } from "react";
import { Select } from "./Select";
import { optionsFor } from "./schema";

export function FieldControl({
  field,
  value,
  onChange,
  db,
  autoFocus = false,
  name,
  onKeyDown,
}) {
  const options = optionsFor(field, db);
  const common = {
    name: name || field.key,
    "aria-label": field.label,
    autoFocus,
    onKeyDown,
  };
  const stringValue = value === null || value === undefined ? "" : value;

  if (field.type === "textarea") {
    return (
      <textarea
        {...common}
        rows={4}
        value={stringValue}
        placeholder={field.label}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "boolean") {
    const checked = value === true || value === "true" || value === "True";
    return (
      <label className="switch-control">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{checked ? "Yes" : "No"}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <Select
        ariaLabel={field.label}
        value={stringValue}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder="None"
        options={[
          { value: "", label: "None" },
          ...options.map((option) => ({ value: option, label: option })),
        ]}
      />
    );
  }

  if (field.type === "owner") {
    return (
      <Select
        ariaLabel={field.label}
        value={stringValue}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder="Unassigned"
        options={[
          { value: "", label: "Unassigned" },
          ...options.map((option) => ({ value: option, label: option })),
        ]}
      />
    );
  }

  if (field.type === "relation") {
    const records = optionsFor(field, db);
    return (
      <Select
        ariaLabel={field.label}
        value={stringValue}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder="Unassigned"
        options={[
          { value: "", label: "Unassigned" },
          ...records.map((record) => ({ value: record.id, label: record.name })),
        ]}
      />
    );
  }

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "url"
        ? "url"
        : field.type === "phone"
          ? "tel"
          : ["number", "currency", "percent"].includes(field.type)
            ? "number"
            : field.type === "date"
              ? "date"
              : "text";

  return (
    <input
      {...common}
      type={inputType}
      value={stringValue}
      step={inputType === "number" ? "any" : undefined}
      placeholder={field.label}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const PICK_TYPES = ["select", "owner", "relation", "boolean"];

export function FieldEditor({
  field,
  record,
  type,
  db,
  onSave,
  onCancel,
  autoFocus = true,
}) {
  const initial = record[field.key] ?? "";
  const [value, setValue] = useState(initial);
  const finished = useRef(false);
  const cancelled = useRef(false);
  const commits = PICK_TYPES.includes(field.type);

  function commit(next) {
    let parsed = next;
    if (["number", "currency", "percent"].includes(field.type)) {
      if (String(next).trim() === "") {
        parsed = "";
      } else {
        parsed = Number(next);
        if (!Number.isFinite(parsed)) return false;
      }
    }
    if (field.required && String(parsed).trim() === "") return false;
    finished.current = true;
    onSave(parsed);
    return true;
  }

  function change(next) {
    setValue(next);
    if (commits) commit(next);
  }

  function close() {
    if (finished.current) return;
    finished.current = true;
    if (String(value) === String(initial)) {
      onCancel();
      return;
    }
    if (!commit(value)) {
      finished.current = false;
      onCancel();
    }
  }

  function cancel() {
    if (finished.current) return;
    cancelled.current = true;
    finished.current = true;
    onCancel();
  }

  useEffect(() => {
    if (!autoFocus) return;
    const node = document.querySelector(".field-editor input, .field-editor textarea");
    node?.focus();
    if (node?.select) node.select();
  }, [autoFocus]);

  return (
    <div
      className={"field-editor" + (commits ? " is-instant" : "")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
          return;
        }
        if (event.key !== "Enter") return;
        if (field.type === "textarea" && !(event.metaKey || event.ctrlKey)) return;
        event.preventDefault();
        close();
      }}
    >
      <FieldControl
        field={field}
        value={value}
        onChange={change}
        db={db}
        autoFocus={autoFocus}
      />
    </div>
  );
}

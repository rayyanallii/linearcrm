import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "twenty-ui/primitives/input";
import { IconX } from "@tabler/icons-react";
import { FieldControl } from "./FieldEditor";
import { Select } from "./Select";
import { fieldDefs } from "./schema";

const WIDTH = 344;

export function BulkEdit({ type, db, selected, commit, onClose, onApplied }) {
  const defs = fieldDefs(type, db).filter(
    (field) =>
      !field.system &&
      !field.readonly &&
      field.type !== "computed" &&
      field.key !== "name",
  );
  const [key, setKey] = useState(defs[0]?.key || "owner");
  const [value, setValue] = useState("");
  const [position, setPosition] = useState(null);
  const panelRef = useRef(null);
  const field = defs.find((item) => item.key === key) || defs[0];

  useLayoutEffect(() => {
    const anchor =
      document.querySelector(".bulk-bar") ||
      document.querySelector(".view-bar-top");
    const box = anchor?.getBoundingClientRect();
    const top = box ? box.bottom + 6 : 96;
    setPosition({
      left: Math.max(12, Math.min(box?.left ?? 32, window.innerWidth - WIDTH - 12)),
      top: Math.min(top, window.innerHeight - 250),
      width: Math.min(WIDTH, window.innerWidth - 24),
    });
  }, []);

  useEffect(() => {
    function onPointerDown(event) {
      const target = event.target;
      if (panelRef.current?.contains(target)) return;
      if (target.closest?.(".ui-select-menu")) return;
      if (target.closest?.(".bulk-bar")) return;
      onClose();
    }
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function apply(event) {
    event?.preventDefault();
    if (!field) return;
    const ids = new Set(selected.map((record) => record.id));
    let next = value;
    if (["number", "currency", "percent"].includes(field.type)) {
      next = String(value).trim() === "" ? "" : Number(value);
      if (next !== "" && !Number.isFinite(next)) return;
    }
    if (
      commit(
        (state) => {
          for (const record of state[type]) {
            if (ids.has(record.id)) record[field.key] = next;
          }
        },
        `Bulk updated ${field.label} on ${ids.size} ${type}`,
      )
    ) {
      onApplied();
    }
  }

  if (!field || !position) return null;

  return createPortal(
    <form
      ref={panelRef}
      className="bulk-edit-panel"
      style={position}
      role="dialog"
      aria-label="Edit selected records"
      onSubmit={apply}
    >
      <div className="bulk-edit-panel-head">
        <strong>
          Edit {selected.length} {selected.length === 1 ? "record" : "records"}
        </strong>
        <button
          type="button"
          className="bulk-edit-close"
          aria-label="Close bulk edit"
          onClick={onClose}
        >
          <IconX size={14} />
        </button>
      </div>
      <p className="bulk-edit-panel-caption">
        Pick a field and a value. The change is written to every selected
        record.
      </p>

      <label className="bulk-edit-panel-row">
        <span>Field</span>
        <Select
          ariaLabel="Bulk edit field"
          value={key}
          onChange={(next) => {
            setKey(next);
            setValue("");
          }}
          options={defs.map((item) => ({
            value: item.key,
            label: item.label,
          }))}
        />
      </label>

      <label className="bulk-edit-panel-row">
        <span>{field.label}</span>
        <FieldControl
          field={field}
          db={db}
          value={value}
          onChange={(next) => setValue(next)}
        />
      </label>

      <div className="bulk-edit-panel-foot">
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" variant="solid">
          Apply to {selected.length}
        </Button>
      </div>
    </form>,
    document.body,
  );
}

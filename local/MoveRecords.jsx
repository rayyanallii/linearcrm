import React, { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "twenty-ui/primitives/input";
import { IconX } from "@tabler/icons-react";
import { Select } from "./Select";
import { objectDef } from "./schema";
import { moveBlockReason, moveRecords, moveTargets } from "./move-records.mjs";

export function MoveRecords({
  type,
  db,
  selected,
  commit,
  onClose,
  onMoved,
}) {
  const targets = moveTargets(type);
  const [targetType, setTargetType] = useState(targets[0]?.type || "");
  const [error, setError] = useState("");
  const titleId = useId();
  const source = objectDef(type, db);
  const target = objectDef(targetType, db);
  const blocked = moveBlockReason(type, selected);
  const destination = targets.find((item) => item.type === targetType);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!targets.length) return null;

  function submit(event) {
    event.preventDefault();
    if (blocked || !targetType) return;
    const ids = selected.map((record) => record.id);
    try {
      moveRecords(structuredClone(db), type, ids, targetType);
      if (
        commit(
          (state) => moveRecords(state, type, ids, targetType),
          `Moved ${selected.length} ${selected.length === 1 ? source.singular : source.plural} to ${target.plural}`,
        )
      ) {
        onMoved(targetType);
      }
    } catch (failure) {
      setError(failure.message);
    }
  }

  return createPortal(
    <div
      className="modal-overlay move-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="move-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
      >
        <header className="move-dialog-head">
          <div>
            <h2 id={titleId}>
              Move {selected.length} {selected.length === 1 ? "record" : "records"}
            </h2>
            <p>
              The selection leaves {source.plural} and keeps its links, files,
              favourites and history.
            </p>
          </div>
          <button
            type="button"
            className="move-dialog-close"
            aria-label="Close move dialog"
            onClick={onClose}
          >
            <IconX size={16} />
          </button>
        </header>

        <label className="move-dialog-field">
          <span>Move to</span>
          <Select
            ariaLabel="Move records to"
            value={targetType}
            onChange={(next) => {
              setTargetType(next);
              setError("");
            }}
            options={targets.map((item) => ({
              value: item.type,
              label: objectDef(item.type, db).plural,
            }))}
          />
        </label>

        <div className="move-dialog-preview">
          <strong>{target.plural}</strong>
          <p>{destination?.description}</p>
          <div className="move-dialog-names">
            {selected.slice(0, 3).map((record) => (
              <span key={record.id}>{record.name}</span>
            ))}
            {selected.length > 3 && (
              <span>and {selected.length - 3} more</span>
            )}
          </div>
        </div>

        {blocked && (
          <p className="move-dialog-warning" role="alert">
            {blocked}
          </p>
        )}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <footer className="move-dialog-foot">
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="solid"
            disabled={!!blocked || !targetType}
          >
            Move to {target.plural}
          </Button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

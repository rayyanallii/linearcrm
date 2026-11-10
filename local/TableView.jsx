import { confirmAction, notifyUser } from "./dialogs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTableOptions,
} from "@tabler/icons-react";
import { RecordTableRowDiv } from "./upstream/RecordTableRowDiv";
import { RecordTableCellStyleWrapper as Cell } from "./upstream/RecordTableCellStyleWrapper";
import { RecordTableHeaderCellContainer as Head } from "./upstream/RecordTableHeaderCellContainer";
import { FieldEditor } from "./FieldEditor";
import { FieldValue, displayValue, formatMoney } from "./format";
import { fieldDef, objectDef } from "./schema";
import { BulkEdit } from "./BulkEdit";
import { MoveRecords } from "./MoveRecords";
import { moveTargets } from "./move-records.mjs";
import { exportRows } from "./csv";

export function TableView({
  type,
  db,
  rows,
  visible,
  sort,
  onSort,
  onOpen,
  onCreate,
  commit,
  onBulkDelete,
  onOptions,
  label,
}) {
  const [editing, setEditing] = useState(null);
  const [checked, setChecked] = useState([]);
  const [bulkEditing, setBulkEditing] = useState(false);
  const [moving, setMoving] = useState(false);
  const selected = rows.filter((row) => checked.includes(row.id));
  const canMove = moveTargets(type).length > 0;
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const canEdit = (field) =>
    field && !field.readonly && !field.system && field.type !== "computed";
  const createLabel = `New ${objectDef(type, db).singular.toLowerCase()}`;

  function toggle(id) {
    setChecked((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }

  function saveCell(record, field, value) {
    if (
      commit(
        (next) => {
          const match = next[type].find((row) => row.id === record.id);
          if (match) match[field.key] = value;
        },
        `Updated ${field.label} · ${record.name}`,
      )
    ) {
      setEditing(null);
    }
  }

  function exportSelection() {
    exportRows(
      selected,
      visible,
      label,
      (row, key) => displayValue(row, key, type, db),
      type,
    );
  }

  return (
    <div className="table-scroll">
      <div role="table" aria-label={label("name")} className="record-table">
        {selected.length > 0 && (
          <div className="bulk-bar">
            <strong>{selected.length} selected</strong>
            <Button size="sm" variant="ghost" onClick={exportSelection}>
              Export selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBulkEditing(!bulkEditing)}
            >
              Edit selected
            </Button>
            {canMove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBulkEditing(false);
                  setMoving(true);
                }}
              >
                Move to…
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (
                  await confirmAction(
                    `Move ${selected.length} selected record(s) to trash? You can restore them from Settings.`,
                  )
                ) {
                  onBulkDelete(selected.map((row) => row.id));
                  setChecked([]);
                }
              }}
            >
              Delete selected
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setChecked([]);
                setBulkEditing(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}

        <div role="row" className="table-head">
          <div role="columnheader" className="check-cell">
            <input
              type="checkbox"
              aria-label="Select all visible records"
              checked={allSelected}
              onChange={() => setChecked(allSelected ? [] : rows.map((row) => row.id))}
            />
          </div>
          {visible.map((key) => {
            const field = fieldDef(type, key, db);
            const active = sort?.field === key;
            return (
              <Head
                key={key}
                role="columnheader"
                isReadOnly
                shouldDisplayBorderBottom
                className={`col c-${key}`}
              >
                <button
                  type="button"
                  className="field-heading"
                  title={`Sort by ${label(key)}`}
                  onClick={() => onSort(key)}
                >
                  {label(key)}
                  {active &&
                    (sort.direction === "desc" ? (
                      <IconArrowDown size={12} />
                    ) : (
                      <IconArrowUp size={12} />
                    ))}
                </button>
              </Head>
            );
          })}
        </div>

        {rows.map((record) => (
          <RecordTableRowDiv
            key={record.id}
            role="row"
            className="record-row"
            onDoubleClick={(event) => {
              if (!event.target.closest("button,input,select,form,textarea"))
                onOpen(record);
            }}
          >
            <div role="cell" className="check-cell">
              <input
                type="checkbox"
                aria-label={`Select ${record.name}`}
                checked={checked.includes(record.id)}
                onChange={() => toggle(record.id)}
              />
            </div>
            {visible.map((key) => {
              const field = fieldDef(type, key, db);
              const isEditing = editing?.id === record.id && editing?.key === key;
              return (
                <Cell key={key} role="cell" widthClassName={`col c-${key}`}>
                  {isEditing ? (
                    <FieldEditor
                      field={field}
                      record={record}
                      type={type}
                      db={db}
                      onSave={(value) => saveCell(record, field, value)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : key === "name" ? (
                    <button type="button" className="record-link" onClick={() => onOpen(record)}>
                      <FieldValue
                        record={record}
                        fieldKey={key}
                        type={type}
                        db={db}
                      />
                    </button>
                  ) : canEdit(field) ? (
                    <button
                      type="button"
                      className="cell-value"
                      aria-label={`Edit ${field.label} for ${record.name}`}
                      onClick={() => setEditing({ id: record.id, key })}
                    >
                      <FieldValue
                        record={record}
                        fieldKey={key}
                        type={type}
                        db={db}
                      />
                    </button>
                  ) : (
                    <span className="cell-static">
                      <FieldValue
                        record={record}
                        fieldKey={key}
                        type={type}
                        db={db}
                      />
                    </span>
                  )}
                </Cell>
              );
            })}
          </RecordTableRowDiv>
        ))}

        {!rows.length && (
          <div className="table-empty">
            <strong>No records match this view.</strong>
            <span>Adjust the filters, or create a new record.</span>
            <Button size="sm" onClick={onCreate}>
              {createLabel}
            </Button>
          </div>
        )}

        <button type="button" className="add-row" onClick={onCreate}>
          <IconPlus size={14} /> {createLabel}
        </button>
      </div>

      <div className="table-footer">
        <span>
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
        {visible.includes("amount") && (
          <span>
            Total{" "}
            {formatMoney(rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))}
          </span>
        )}
        <button type="button" className="footer-options" onClick={onOptions}>
          <IconTableOptions size={14} /> Columns
        </button>
      </div>

      {bulkEditing && (
        <BulkEdit
          type={type}
          db={db}
          selected={selected}
          commit={commit}
          onClose={() => setBulkEditing(false)}
          onApplied={() => {
            setBulkEditing(false);
            setChecked([]);
          }}
        />
      )}

      {moving && (
        <MoveRecords
          type={type}
          db={db}
          selected={selected}
          commit={commit}
          onClose={() => setMoving(false)}
          onMoved={() => {
            setMoving(false);
            setBulkEditing(false);
            setChecked([]);
          }}
        />
      )}
    </div>
  );
}
import React from "react";
import { Button } from "twenty-ui/primitives/input";
import {
  IconArrowRight,
  IconBuilding,
  IconCalendar,
  IconCircleDot,
  IconCurrencyDollar,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import { RecordCard } from "./upstream/RecordCard";
import { displayValue } from "./format";
import {
  fieldDef,
  optionsFor,
  tagColorFor,
  objectDef,
} from "./schema";
import { groupRows, totalAmount } from "./query";
import { formatMoney } from "./format";

const SECONDARY = {
  deals: ["amount", "date", "owner"],
  contacts: ["role", "company", "status"],
  companies: ["industry", "employees", "owner"],
  tasks: ["date", "priority", "taskType"],
  notes: ["category", "meetingDate", "company"],
  emails: ["contact", "date", "direction"],
};

const DOT = {
  gray: "#9aa0a8",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  turquoise: "#14b8a6",
};

const META_ICON = {
  amount: IconCurrencyDollar,
  date: IconCalendar,
  meetingDate: IconCalendar,
  nextFollowUp: IconCalendar,
  lastContacted: IconCalendar,
  owner: IconUser,
  contact: IconUser,
  company: IconBuilding,
  role: IconUser,
  status: IconCircleDot,
  priority: IconCircleDot,
  category: IconCircleDot,
  taskType: IconCircleDot,
  direction: IconCircleDot,
};

export function BoardView({
  type,
  db,
  rows,
  groupBy,
  onMove,
  onOpen,
  onCreate,
}) {
  const field = fieldDef(type, groupBy, db);
  const groups = groupRows(rows, groupBy, type, db);
  if (type === "deals" && groupBy === "stage" && rows.length && new Set(rows.map(row => row.pipeline)).size === 1) {
    const order = db.pipelines?.find(pipeline => pipeline.id === rows[0].pipeline)?.stageOrder;
    if (order) groups.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  }
  const secondary = (SECONDARY[type] || ["date"]).filter((key) => key !== groupBy);
  const object = objectDef(type, db);

  if (!field) {
    return (
      <div className="table-empty">
        <strong>This object has no field to group by.</strong>
        <span>Add a select or relation field, or switch to table view.</span>
      </div>
    );
  }

  function drop(recordId, label) {
    if (!field || label === "None") {
      onMove(recordId, field.key, field.type === "boolean" ? false : "");
      return;
    }
    let value = label;
    if (field.type === "relation") {
      value =
        (db[field.object] || []).find((record) => record.name === label)?.id || "";
    } else if (field.type === "boolean") {
      value = label === "Yes";
    }
    onMove(recordId, field.key, value);
  }

  return (
    <div className="board-scroll">
      <div className="board-summary">
        <span>
          {rows.length} {object.plural.toLowerCase()}
          {type === "deals" ? ` · ${formatMoney(totalAmount(rows))}` : ""}
        </span>
        <span>Grouped by {field.label.toLowerCase()}</span>
      </div>
      <div className="board">
        {groups.map((group) => (
          <section
            key={group.label}
            className="board-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              drop(event.dataTransfer.getData("text/plain"), group.label);
            }}
          >
            <header>
              <span className="board-column-title">
                <i
                  className="board-stage-dot"
                  style={{
                    background:
                      DOT[tagColorFor(field, group.label)] || DOT.gray,
                  }}
                />
                <strong>{group.label}</strong>
                <small>{group.rows.length}</small>
              </span>
              {type === "deals" && (
                <small className="board-total">{formatMoney(totalAmount(group.rows))}</small>
              )}
              <Button
                variant="ghost"
                size="sm"
                aria-label={`New record in ${group.label}`}
                onClick={() => {
                  let value = group.label === "None" ? "" : group.label;
                  if (field.type === "relation") {
                    value =
                      (db[field.object] || []).find(
                        (record) => record.name === group.label,
                      )?.id || "";
                  }
                  onCreate({ [field.key]: value });
                }}
              >
                <IconPlus size={14} />
              </Button>
            </header>
            <div className="board-cards">
              {group.rows.map((record) => (
                <RecordCard
                  key={record.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", record.id)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onOpen(record);
                  }}
                  onClick={() => onOpen(record)}
                >
                  <b className="board-card-title">{record.name}</b>
                  {secondary.map((key) => {
                    const value = displayValue(record, key, type, db);
                    if (!value) return null;
                    const Icon = META_ICON[key] || IconCircleDot;
                    return (
                      <span key={key} className="board-card-meta">
                        <Icon size={12} />
                        {key === "amount" ? formatMoney(record.amount) : value}
                      </span>
                    );
                  })}
                  {record.nextStep && (
                    <span className="board-card-next">
                      <IconArrowRight size={12} />
                      {record.nextStep}
                    </span>
                  )}
                </RecordCard>
              ))}
              {!group.rows.length && <p className="board-empty">Drop a card here</p>}
            </div>
          </section>
        ))}
        {!groups.length && <p className="board-empty">No records in this view.</p>}
      </div>
    </div>
  );
}

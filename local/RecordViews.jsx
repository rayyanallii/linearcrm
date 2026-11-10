import { confirmAction, notifyUser } from "./dialogs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import {
  IconAdjustmentsHorizontal,
  IconBookmark,
  IconX,
} from "@tabler/icons-react";
export const filterFields = {
  companies: ["industry", "Industry"],
  contacts: ["company", "Company"],
  deals: ["stage", "Stage"],
  tasks: ["status", "Status"],
  notes: ["deal", "Opportunity"],
};
export function matchRows(
  rows,
  { query = "", value = "", conditions = [], logic = "all" },
  type,
  columns,
  display,
) {
  const term = query.trim().toLowerCase();
  return rows.filter(
    (r) =>
      (!value || r[(filterFields[type] || ["createdBy"])[0]] === value) &&
      (!conditions.length ||
        conditions[logic === "any" ? "some" : "every"]((c) => {
          const v = String(display(r, c.field)).toLowerCase(),
            match = c.term.toLowerCase();
          if (c.op === "empty") return !v;
          if (c.op === "equals") return v === match;
          if (c.op === "excludes") return !v.includes(match);
          if (c.op === "greater" || c.op === "less") {
            const n = Number(r[c.field]),
              m = Number(c.term);
            return (
              r[c.field] !== "" &&
              r[c.field] != null &&
              c.term !== "" &&
              (c.op === "greater" ? n > m : n < m)
            );
          }
          return v.includes(match);
        })) &&
      (!term ||
        columns.some((k) =>
          String(display(r, k)).toLowerCase().includes(term),
        )),
  );
}
export function RecordViews({
  all,
  fieldLabel,
  type,
  rows,
  display,
  views,
  config,
  update,
  restore,
  commit,
  board,
  sort,
}) {
  const [expanded, setExpanded] = useState(false),
    [naming, setNaming] = useState(false),
    [name, setName] = useState(""), [replace,setReplace]=useState("");
  const [field, label] = filterFields[type] || ["createdBy", "Created by"],
    possibilities = new Map(
      rows.filter((r) => r[field]).map((r) => [r[field], display(r, field)]),
    );
  const current = views.find((v) => v.id === config.id),
    dirty = !!(config.query || config.value || config.conditions?.length);
  function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const view = {
      id:replace||crypto.randomUUID(),
      name: name.trim(),
      type,
      conditions: config.conditions || [],
      logic: config.logic || "all",
      query: config.query || "",
      value: config.value || "",
      board,
      calendar: !!config.calendar,
      sortKey: config.sortKey || "name",
      descending: !!config.descending,
      sort,
    };
    if (
      commit((n) => {const previous=n.views?.find(v=>v.id===replace);if(previous)Object.assign(previous,view);else(n.views??=[]).push(view)}, "Saved view · " + view.name)
    ) {
      restore(view);
      setNaming(false);setReplace("");
      setName("");
    }
  }
  return (
    <div className="record-views">
      <div className="view-line">
        <Button
          size="sm"
          variant={expanded || dirty ? "outline" : "ghost"}
          startIcon={<IconAdjustmentsHorizontal size={14} />}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          Filters
          {dirty
            ? " · " +
              ([config.query, config.value].filter(Boolean).length +
                (config.conditions?.length || 0))
            : ""}
        </Button>
        <select
          aria-label="Saved views"
          value={current?.id || ""}
          onChange={(e) =>
            restore(
              views.find((v) => v.id === e.target.value) || {
                query: "",
                value: "",
                sort: false,
                board: true,
              },
            )
          }
        >
          <option value="">{dirty ? "Custom view" : "All records"}</option>
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {current && (
          <Button
            size="sm"
            variant="ghost"
            aria-label="Remove saved view"
            onClick={async () => {
              if (
                await confirmAction("Remove saved view “" + current.name + "”?") &&
                commit((n) => {
                  n.views = n.views.filter((v) => v.id !== current.id);
                }, "Removed view · " + current.name)
              )
                update({ id: "" });
            }}
          >
            <IconX size={14} />
          </Button>
        )}
      </div>
      {expanded && (
        <div className="filter-options">
          <input
            aria-label="Filter records by text"
            placeholder="Find in this view…"
            value={config.query || ""}
            onChange={(e) => update({ query: e.target.value, id: "" })}
          />
          <label>
            {label}{" "}
            <select
              aria-label={"Filter by " + label.toLowerCase()}
              value={config.value || ""}
              onChange={(e) => update({ value: e.target.value, id: "" })}
            >
              <option value="">Any</option>
              {config.value && !possibilities.has(config.value) && (
                <option value={config.value}>Unavailable</option>
              )}
              {Array.from(possibilities)
                .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
                .map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
            </select>
          </label>
          <Button
            size="sm"
            onClick={() =>
              update({
                id: "",
                conditions: [
                  ...(config.conditions || []),
                  { field: "name", op: "contains", term: "" },
                ],
              })
            }
          >
            Add condition
          </Button>
          {dirty && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                update({ query: "", value: "", id: "", conditions: [] })
              }
            >
              Clear filters
            </Button>
          )}
          <Button
            size="sm"
            startIcon={<IconBookmark size={14} />}
            onClick={() => setNaming(!naming)}
          >
            Save view
          </Button>
        </div>
      )}
      {expanded && !!config.conditions?.length && (
        <div className="filter-options">
          <select
            aria-label="Combine conditions"
            value={config.logic || "all"}
            onChange={(e) => update({ id: "", logic: e.target.value })}
          >
            <option value="all">Match all</option>
            <option value="any">Match any</option>
          </select>
          {config.conditions.map((c, i) => {
            function change(part) {
              update({
                id: "",
                conditions: config.conditions.map((row, j) =>
                  j === i ? { ...row, ...part } : row,
                ),
              });
            }
            return (
              <div key={i} className="condition">
                <select
                  aria-label="Condition field"
                  value={c.field}
                  onChange={(e) => change({ field: e.target.value })}
                >
                  {all.map((k) => (
                    <option key={k} value={k}>
                      {fieldLabel(k)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Condition operator"
                  value={c.op}
                  onChange={(e) => change({ op: e.target.value })}
                >
                  {[
                    "contains",
                    "equals",
                    "excludes",
                    "empty",
                    "greater",
                    "less",
                  ].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
                {c.op !== "empty" && (
                  <input
                    aria-label="Condition value"
                    value={c.term}
                    onChange={(e) => change({ term: e.target.value })}
                  />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Remove condition"
                  onClick={() =>
                    update({
                      id: "",
                      conditions: config.conditions.filter((_, j) => j !== i),
                    })
                  }
                >
                  ×
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {expanded && naming && (
        <form className="filter-options" onSubmit={add}><select aria-label="Save view destination" value={replace} onChange={e=>{setReplace(e.target.value);setName(views.find(v=>v.id===e.target.value)?.name||"")}}><option value="">New view</option>{views.map(v=><option key={v.id} value={v.id}>Update {v.name}</option>)}</select>
          <input
            autoFocus
            required
            maxLength={60}
            value={name}
            aria-label="View name"
            placeholder="View name"
            onChange={(e) => setName(e.target.value)}
          />
          <Button size="sm" type="submit">
            Save named view
          </Button>
        </form>
      )}
    </div>
  );
}
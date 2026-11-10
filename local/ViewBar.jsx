import React, { useMemo, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import {
  IconAdjustmentsHorizontal,
  IconArrowDown,
  IconArrowUp,
  IconBookmark,
  IconCalendar,
  IconLayoutKanban,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  fieldDef,
  fieldDefs,
  operatorsFor,
  optionsFor,
  objectDef,
} from "./schema";
import { Select } from "./Select";
import { FloatingPanel } from "./Popover";

function defaultValueFor(field) {
  if (!field) return "";
  if (field.type === "select" || field.type === "owner") {
    const first = optionsFor(field, {});
    return typeof first[0] === "string" ? first[0] : "";
  }
  return "";
}

export function ViewBar({
  type,
  db,
  config,
  views,
  onChange,
  onOpenView,
  onSaveView,
  onDeleteView,
  onOptions,
  dirty,
}) {
  const [panel, setPanel] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [updateExisting, setUpdateExisting] = useState(true);
  const [draft, setDraft] = useState(null);

  const object = objectDef(type, db);
  const fields = useMemo(
    () => fieldDefs(type, db).filter((field) => !field.system),
    [type, db],
  );
  const currentView = views.find((view) => view.id === config.viewId);
  const appliedFilters = config.filters || [];
  const filters = panel === "filters" && draft ? draft.filters : appliedFilters;
  const activeLogic =
    panel === "filters" && draft ? draft.logic : config.logic || "and";
  const sort = config.sort || { field: "name", direction: "asc" };
  const layouts = [
    { key: "table", label: "Table", icon: <IconTable size={14} /> },
    { key: "kanban", label: "Board", icon: <IconLayoutKanban size={14} /> },
    { key: "calendar", label: "Calendar", icon: <IconCalendar size={14} /> },
  ];
  const dateFields = fields.filter((field) =>
    ["date", "datetime"].includes(field.type),
  );
  const groupFields = fields.filter((field) =>
    ["select", "owner", "relation", "boolean"].includes(field.type),
  );

  function changeFilter(id, patch) {
    if (panel === "filters" && draft) {
      setDraft({
        ...draft,
        filters: draft.filters.map((filter) =>
          filter.id === id ? { ...filter, ...patch } : filter,
        ),
      });
      return;
    }
    onChange({
      viewId: config.viewId,
      filters: filters.map((filter) =>
        filter.id === id ? { ...filter, ...patch } : filter,
      ),
    });
  }

  function addFilter() {
    const field = fields[0];
    const nextFilter = {
      id: `filter_${crypto.randomUUID()}`,
      field: field?.key || "name",
      op: operatorsFor(field)[0],
      value: "",
    };
    if (panel === "filters" && draft) {
      setDraft({ ...draft, filters: [...draft.filters, nextFilter] });
      return;
    }
    onChange({
      viewId: config.viewId,
      filters: [...filters, nextFilter],
    });
  }

  function closeFilters() {
    setDraft(null);
    setPanel("");
  }

  function applyFilters() {
    onChange({ viewId: config.viewId, filters, logic: activeLogic });
    setDraft(null);
    setPanel("");
  }

  function startSave() {
    setName(currentView?.name || `${object.plural} view`);
    setUpdateExisting(!!currentView);
    setSaving(true);
  }

  function saveView(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onSaveView({
      name: name.trim(),
      existingId: updateExisting ? config.viewId || null : null,
    });
    setSaving(false);
    setPanel("");
  }

  return (
    <div className="view-bar">
      <div className="view-bar-top">
        <div className="view-tabs" role="tablist" aria-label="Saved views">
          <button
            type="button"
            role="tab"
            aria-selected={!config.viewId}
            className={"view-tab " + (!config.viewId ? "active" : "")}
            onClick={() =>
              onOpenView({
                id: "",
                name: `All ${object.plural.toLowerCase()}`,
                layout: "table",
                filters: [],
                sort: { field: "name", direction: "asc" },
                groupBy: object.defaultGroup,
                dateField: object.dateField,
                query: "",
                logic: "and",
              })
            }
          >
            All records
          </button>
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={config.viewId === view.id}
              className={"view-tab " + (config.viewId === view.id ? "active" : "")}
              onClick={() => onOpenView(view)}
            >
              {view.name}
            </button>
          ))}
        </div>

        <div className="view-actions">
          <label className="view-search">
            <IconSearch size={14} />
            <input
              aria-label="Search this view"
              placeholder="Search…"
              value={config.query || ""}
              onChange={(event) =>
                onChange({ viewId: config.viewId, query: event.target.value })
              }
            />
          </label>
          <Button
            size="sm"
            variant={appliedFilters.length ? "outline" : "ghost"}
            startIcon={<IconAdjustmentsHorizontal size={14} />}
            onClick={() => {
              if (panel === "filters") {
                closeFilters();
                return;
              }
              setDraft({
                logic: config.logic || "and",
                filters: appliedFilters.map((filter) => ({ ...filter })),
              });
              setPanel("filters");
            }}
          >
            Filter{appliedFilters.length ? ` · ${appliedFilters.length}` : ""}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPanel(panel === "sort" ? "" : "sort")}
          >
            Sort
          </Button>
          <Button size="sm" variant="ghost" onClick={onOptions}>
            Options
          </Button>
          {dirty && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconBookmark size={14} />}
              onClick={startSave}
            >
              Save view
            </Button>
          )}
          <div className="layout-switch" role="group" aria-label="Layout">
            {layouts.map((layout) => (
              <button
                key={layout.key}
                type="button"
                aria-label={`${layout.label} layout`}
                aria-pressed={config.layout === layout.key}
                className={config.layout === layout.key ? "active" : ""}
                onClick={() =>
                  onChange({ viewId: config.viewId, layout: layout.key })
                }
              >
                {layout.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {saving && (
        <form className="view-subpanel save-view-form" onSubmit={saveView}>
          <label>
            View name
            <input
              autoFocus
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {config.viewId && (
            <label className="inline-check">
              <input
                type="checkbox"
                checked={updateExisting}
                onChange={(event) => setUpdateExisting(event.target.checked)}
              />
              Update “{currentView?.name}”
            </label>
          )}
          <Button type="submit" size="sm" variant="solid">
            Save view
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSaving(false)}>
            Cancel
          </Button>
        </form>
      )}

      {panel === "filters" && (
        <FloatingPanel
          width={560}
          ariaLabel="Filters"
          className="filter-panel"
          onClose={closeFilters}
        >
          <div className="filter-header">
            <strong>Filters</strong>
            {filters.length > 1 && (
              <label>
                Match
                <Select
                  ariaLabel="Match"
                  value={activeLogic}
                  onChange={(next) => {
                    if (draft) setDraft({ ...draft, logic: next });
                    else onChange({ viewId: config.viewId, logic: next });
                  }}
                  options={[
                    { value: "and", label: "all conditions" },
                    { value: "or", label: "any condition" },
                  ]}
                />
              </label>
            )}
            <Button size="sm" variant="ghost" startIcon={<IconPlus size={13} />} onClick={addFilter}>
              Add condition
            </Button>
            {!!filters.length && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (draft) setDraft({ ...draft, filters: [] });
                  else onChange({ viewId: config.viewId, filters: [] });
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {filters.map((filter) => {
            const field = fieldDef(type, filter.field, db) || fields[0];
            const options = optionsFor(field, db).map((option) =>
              typeof option === "string" ? option : option.name,
            );
            return (
              <div className="filter-row" key={filter.id}>
                <Select
                  ariaLabel="Filter field"
                  value={filter.field}
                  onChange={(next) => {
                    const nextField = fieldDef(type, next, db);
                    changeFilter(filter.id, {
                      field: next,
                      op: operatorsFor(nextField)[0],
                      value: "",
                    });
                  }}
                  options={fields.map((option) => ({
                    value: option.key,
                    label: option.label,
                  }))}
                />
                <Select
                  ariaLabel="Filter operator"
                  value={filter.op}
                  onChange={(next) => changeFilter(filter.id, { op: next })}
                  options={operatorsFor(field).map((operator) => ({
                    value: operator,
                    label: operator.replaceAll("_", " "),
                  }))}
                />
                {!["is_empty", "is_not_empty", "is_true", "is_false"].includes(filter.op) &&
                  (["select", "owner", "relation"].includes(field?.type) ? (
                    <Select
                      ariaLabel="Filter value"
                      value={filter.value}
                      onChange={(next) => changeFilter(filter.id, { value: next })}
                      placeholder="Any"
                      options={[
                        { value: "", label: "Any" },
                        ...options.map((option) => ({ value: option, label: option })),
                      ]}
                    />
                  ) : (
                    <input
                      aria-label="Filter value"
                      type={
                        ["date", "datetime"].includes(field?.type)
                          ? "date"
                          : ["number", "currency", "percent"].includes(field?.type)
                            ? "number"
                            : "text"
                      }
                      value={filter.value}
                      onChange={(event) =>
                        changeFilter(filter.id, { value: event.target.value })
                      }
                    />
                  ))}
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Remove filter"
                  onClick={() => {
                    if (draft) {
                      setDraft({
                        ...draft,
                        filters: draft.filters.filter(
                          (item) => item.id !== filter.id,
                        ),
                      });
                      return;
                    }
                    onChange({
                      viewId: config.viewId,
                      filters: filters.filter((item) => item.id !== filter.id),
                    });
                  }}
                >
                  <IconX size={14} />
                </Button>
              </div>
            );
          })}
          {!filters.length && <p className="muted">No conditions. Showing every record.</p>}
          <div className="filter-footer">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Discard filter changes"
              onClick={closeFilters}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="solid"
              aria-label="Apply filter changes"
              onClick={applyFilters}
            >
              Apply
            </Button>
          </div>
        </FloatingPanel>
      )}

      {panel === "sort" && (
        <FloatingPanel
          width={340}
          ariaLabel="Sort"
          className="sort-panel"
          onClose={() => setPanel("")}
        >
          <strong>Sort by</strong>
          <Select
            ariaLabel="Sort field"
            value={sort.field}
            onChange={(next) =>
              onChange({ viewId: config.viewId, sort: { ...sort, field: next } })
            }
            options={fields.map((field) => ({
              value: field.key,
              label: field.label,
            }))}
          />
          <Button
            size="sm"
            variant="ghost"
            startIcon={sort.direction === "desc" ? <IconArrowDown size={14} /> : <IconArrowUp size={14} />}
            onClick={() =>
              onChange({
                viewId: config.viewId,
                sort: {
                  ...sort,
                  direction: sort.direction === "desc" ? "asc" : "desc",
                },
              })
            }
          >
            {sort.direction === "desc" ? "Descending" : "Ascending"}
          </Button>
        </FloatingPanel>
      )}

      {config.layout === "kanban" && (
        <div className="view-subpanel sort-row">
          <strong>Group board by</strong>
          <Select
            ariaLabel="Group board by"
            value={config.groupBy || groupFields[0]?.key || ""}
            onChange={(next) =>
              onChange({ viewId: config.viewId, groupBy: next })
            }
            options={groupFields.map((field) => ({
              value: field.key,
              label: field.label,
            }))}
          />
        </div>
      )}

      {config.layout === "calendar" && (
        <div className="view-subpanel sort-row">
          <strong>Calendar date</strong>
          <Select
            ariaLabel="Calendar date"
            value={config.dateField || dateFields[0]?.key || "date"}
            onChange={(next) =>
              onChange({ viewId: config.viewId, dateField: next })
            }
            options={dateFields.map((field) => ({
              value: field.key,
              label: field.label,
            }))}
          />
        </div>
      )}

      {config.viewId && currentView && (
        <div className="view-bar-footer">
          <span>
            {object.plural} · {currentView.layout} view
          </span>
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconTrash size={13} />}
            onClick={() => onDeleteView(currentView)}
          >
            Delete view
          </Button>
        </div>
      )}
    </div>
  );
}

import {Select} from "./Select";
import { SalesPerformance } from "./SalesPerformance";
import { enabledCollections } from "./store";
import { confirmAction, notifyUser } from "./dialogs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChartBar,
  IconChartDonut,
  IconChartLine,
  IconPencil,
  IconPlus,
  IconTargetArrow,
  IconTrash,
} from "@tabler/icons-react";
import { displayValue, formatCompactMoney, formatMoney } from "./format";
import {
  fieldDefs,
  objectDef,
  openStages,
  stages,
  stageColors,
  today,
} from "./schema";
import { aggregate, formatMeasure } from "./query";
import { Tag } from "twenty-ui/primitives/data-display";

const COLORS = ["#5b8def", "#9b7ede", "#37a48b", "#e0a458", "#d96b6b", "#7d8597", "#4aa8c9", "#c979b8"];

function measureOf(row, source, measure) {
  if (measure === "count") return 1;
  const value =
    source === "companies"
      ? row.annualRevenue
      : source === "deals"
        ? row.amount
        : row.amount;
  return Number(value) || 0;
}

function buildData(report, db) {
  const rows = db[report.source] || [];
  const map = new Map();

  for (const row of rows) {
    let label;
    if (report.group === "date") {
      const raw = String(row[report.dateField || "date"] || "").slice(0, 7);
      if (!raw) continue;
      label = new Date(`${raw}-01T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    } else {
      label = displayValue(row, report.group, report.source, db) || "None";
    }
    if (!map.has(label)) map.set(label, { label, value: 0, count: 0 });
    const entry = map.get(label);
    entry.value += measureOf(row, report.source, report.measure);
    entry.count += 1;
  }

  let data = [...map.values()];
  if (report.measure === "avg") {
    data = data.map((entry) => ({
      ...entry,
      value: entry.count ? entry.value / entry.count : 0,
    }));
  }
  if (report.group === "date") {
    data.sort(
      (a, b) =>
        new Date(`01 ${a.label}`).getTime() - new Date(`01 ${b.label}`).getTime(),
    );
  } else if (["stage", "status", "priority"].includes(report.group)) {
    const order =
      report.group === "stage"
        ? stages
        : report.group === "status"
          ? ["Open", "In progress", "Done"]
          : ["Low", "Normal", "High", "Urgent"];
    data.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  } else {
    data.sort((a, b) => b.value - a.value);
  }
  return data;
}

function WidgetActions({ report, index, count, onEdit, onMove, onDelete }) {
  return (
    <div className="widget-actions">
      <Button size="sm" variant="ghost" aria-label="Edit widget" onClick={() => onEdit(report)}>
        <IconPencil size={14} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Move widget earlier"
        disabled={!index}
        onClick={() => onMove(index, -1)}
      >
        <IconArrowLeft size={14} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Move widget later"
        disabled={index === count - 1}
        onClick={() => onMove(index, 1)}
      >
        <IconArrowRight size={14} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Delete widget"
        onClick={async () => {
          if (await confirmAction(`Remove “${report.title}”?`)) onDelete(report);
        }}
      >
        <IconTrash size={14} />
      </Button>
    </div>
  );
}

function BarWidget({ data, measure }) {
  const max = Math.max(1, ...data.map((entry) => entry.value));
  return (
    <div className="bar-widget">
      {data.map((entry, index) => (
        <div className="bar-row" key={entry.label}>
          <span className="bar-label">{entry.label}</span>
          <span className="bar-track">
            <i
              style={{
                width: `${Math.max(2, (entry.value / max) * 100)}%`,
                background: COLORS[index % COLORS.length],
              }}
            />
          </span>
          <b>{formatMeasure(entry.value, measure)}</b>
        </div>
      ))}
      {!data.length && <p className="empty-copy">No records yet.</p>}
    </div>
  );
}

function DonutWidget({ data, measure }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  let cursor = 0;
  const stops = data.map((entry, index) => {
    const start = total ? (cursor / total) * 100 : 0;
    cursor += entry.value;
    const end = total ? (cursor / total) * 100 : 0;
    return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
  });
  return (
    <div className="donut-widget">
      <div
        className="donut-chart"
        style={{
          background: total
            ? `conic-gradient(${stops.join(", ")})`
            : "var(--t-background-tertiary)",
        }}
      >
        <span>
          <b>{formatMeasure(total, measure)}</b>
          <small>total</small>
        </span>
      </div>
      <div className="donut-legend">
        {data.map((entry, index) => (
          <div key={entry.label}>
            <i style={{ background: COLORS[index % COLORS.length] }} />
            <span>{entry.label}</span>
            <b>{formatMeasure(entry.value, measure)}</b>
          </div>
        ))}
        {!data.length && <p className="empty-copy">No records yet.</p>}
      </div>
    </div>
  );
}

function LineWidget({ data, measure }) {
  const max = Math.max(1, ...data.map((entry) => entry.value));
  const points = data
    .map((entry, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 40 - (entry.value / max) * 34;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="line-widget">
      <svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={points || "0,40 100,40"}
          fill="none"
          stroke="var(--app-accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`0,40 ${points || "0,40 100,40"} 100,40`}
          fill="var(--app-accent-soft)"
          opacity="0.45"
        />
      </svg>
      <div className="line-labels">
        {data.map((entry) => (
          <span key={entry.label}>{entry.label}</span>
        ))}
      </div>
      <div className="line-summary">
        <span>Latest</span>
        <b>{formatMeasure(data[data.length - 1]?.value || 0, measure)}</b>
      </div>
      {!data.length && <p className="empty-copy">No records yet.</p>}
    </div>
  );
}

function ReportWidget({ report, index, count, db, onEdit, onMove, onDelete }) {
  const data = buildData(report, db);
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const source = objectDef(report.source, db);
  return (
    <section className={`widget-card ${report.width === "full" ? "full" : ""}`}>
      <header>
        <div>
          <h2>{report.title}</h2>
          <small>
            {source.plural} ·{" "}
            {report.measure === "count"
              ? "record count"
              : report.measure === "avg"
                ? "average value"
                : "total value"}{" "}
            by {report.group}
          </small>
        </div>
        <WidgetActions
          report={report}
          index={index}
          count={count}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
        />
      </header>
      {report.type === "metric" ? (
        <div className="metric-widget">
          <strong>{formatMeasure(total, report.measure)}</strong>
          <small>{data.length} groups</small>
        </div>
      ) : report.type === "donut" ? (
        <DonutWidget data={data} measure={report.measure} />
      ) : report.type === "line" ? (
        <LineWidget data={data} measure={report.measure} />
      ) : (
        <BarWidget data={data} measure={report.measure} />
      )}
    </section>
  );
}

function FormSelect({name,value,defaultValue,onChange,children,ariaLabel}) {
 const [selected,setSelected]=useState(defaultValue);
 const options=React.Children.toArray(children).map(option=>({value:option.props.value,label:option.props.children}));
 const current=value ?? selected ?? options[0]?.value ?? "";
 return <><input type="hidden" name={name} value={current}/><Select ariaLabel={ariaLabel || name || "Records"} value={current} options={options} onChange={next=>{setSelected(next);onChange?.({target:{value:next}});}}/></>;
}
export function DashboardView({ db, commit, open }) {
  const [tab,setTab]=useState("performance");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [source, setSource] = useState("deals");
  const reports = (db.reports || []).filter((report) =>
    enabledCollections(db).includes(report.source),
  );
  const openDeals = db.deals.filter((deal) => openStages.includes(deal.stage));
  const pipeline = openDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const weighted = openDeals.reduce(
    (sum, deal) => sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100,
    0,
  );
  const won = db.deals
    .filter((deal) => deal.stage === "Won")
    .reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const overdue = db.tasks.filter(
    (task) => !["Done", "Cancelled"].includes(task.status) && task.date && task.date < today(),
  ).length;

  const groupFields = fieldDefs(source, db).filter((field) =>
    ["select", "owner", "relation", "date"].includes(field.type),
  );

  function startNew() {
    setTab("widgets");
    setEditing(null);
    setSource("deals");
    setFormOpen(true);
  }

  function startEdit(report) {
    setEditing(report);
    setSource(report.source);
    setFormOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const title = String(form.title || "").trim();
    if (!title) return;
    const report = {
      id: editing?.id || crypto.randomUUID(),
      title,
      source,
      group: form.group,
      measure: form.measure,
      type: form.type,
      width: form.width,
    };
    if (
      commit(
        (state) => {
          state.reports ??= [];
          const existing = state.reports.find((item) => item.id === report.id);
          if (existing) Object.assign(existing, report);
          else state.reports.push(report);
        },
        `${editing ? "Updated" : "Added"} widget · ${title}`,
      )
    ) {
      setFormOpen(false);
      setEditing(null);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <small>Live from your local records</small>
          <h1>Dashboards</h1>
          <p>Pipeline health, revenue and demand at a glance.</p>
        </div>
        <Button size="sm" variant="solid" startIcon={<IconPlus size={14} />} onClick={startNew}>
          Add widget
        </Button>
      </div>

      <div className="dashboard-tabs" role="tablist" aria-label="Dashboard views">
        <button role="tab" aria-selected={tab==="performance"} onClick={()=>setTab("performance")}>Sales performance</button>
        <button role="tab" aria-selected={tab==="widgets"} onClick={()=>setTab("widgets")}>Custom widgets</button>
      </div>
      {tab==="performance"?<SalesPerformance db={db} open={open} />:<>

      <div className="kpi-grid dashboard-kpis">
        {[
          ["Open pipeline", formatCompactMoney(pipeline), `${openDeals.length} opportunities`, "blue"],
          ["Weighted forecast", formatCompactMoney(weighted), "Probability adjusted", "purple"],
          ["Won revenue", formatCompactMoney(won), "Closed won", "green"],
          ["Overdue tasks", overdue, "Needs follow-up", overdue ? "red" : "gray"],
        ].map(([label, value, caption, tone]) => (
          <section className={`kpi-card tone-${tone}`} key={label}>
            <span className="kpi-icon">
              <IconTargetArrow size={17} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <span>{caption}</span>
            </div>
          </section>
        ))}
      </div>

      {formOpen && (
        <form className="panel-card widget-form" onSubmit={submit}>
          <div className="panel-heading">
            <h2>{editing ? "Edit widget" : "New widget"}</h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
          <div className="form-grid">
            <label>
              Title
              <input name="title" required maxLength={80} defaultValue={editing?.title} />
            </label>
            <label>
              Records
              <FormSelect ariaLabel="Records" value={source} onChange={(event) => setSource(event.target.value)}>
                {enabledCollections(db).map((type) => (
                  <option key={type} value={type}>
                    {objectDef(type, db).plural}
                  </option>
                ))}
              </FormSelect>
            </label>
            <label>
              Group by
              <FormSelect ariaLabel="Group by" name="group" key={source} defaultValue={editing?.source === source ? editing.group : groupFields[0]?.key}>
                {groupFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </FormSelect>
            </label>
            <label>
              Measure
              <FormSelect ariaLabel="Measure" name="measure" defaultValue={editing?.measure || "count"}>
                <option value="count">Record count</option>
                <option value="amount">Total value</option>
                <option value="avg">Average value</option>
              </FormSelect>
            </label>
            <label>
              Visualization
              <FormSelect ariaLabel="Visualization" name="type" defaultValue={editing?.type || "bar"}>
                <option value="bar">Bar</option>
                <option value="donut">Donut</option>
                <option value="line">Line</option>
                <option value="metric">Metric</option>
              </FormSelect>
            </label>
            <label>
              Width
              <FormSelect ariaLabel="Width" name="width" defaultValue={editing?.width || "half"}>
                <option value="half">Half</option>
                <option value="full">Full</option>
              </FormSelect>
            </label>
          </div>
          <div className="form-actions">
            <Button type="submit" variant="solid">
              {editing ? "Save widget" : "Add widget"}
            </Button>
          </div>
        </form>
      )}

      <div className="widget-grid">
        {reports.map((report, index) => (
          <ReportWidget
            key={report.id}
            report={report}
            index={index}
            count={reports.length}
            db={db}
            onEdit={startEdit}
            onMove={(from, delta) =>
              commit(
                (state) => {
                  const [item] = state.reports.splice(from, 1);
                  state.reports.splice(from + delta, 0, item);
                },
                `Moved widget · ${report.title}`,
              )
            }
            onDelete={(item) =>
              commit(
                (state) => {
                  state.reports = state.reports.filter((report) => report.id !== item.id);
                },
                `Removed widget · ${item.title}`,
              )
            }
          />
        ))}
        {!reports.length && (
          <section className="widget-card full">
            <div className="empty-state">
              <IconChartBar size={24} />
              <strong>No widgets yet</strong>
              <span>Add a chart to see your pipeline and workload.</span>
              <Button size="sm" onClick={startNew}>
                Add widget
              </Button>
            </div>
          </section>
        )}
      </div>
      </>}
    </div>
  );
}
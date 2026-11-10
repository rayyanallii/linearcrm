import { confirmAction, notifyUser } from "./dialogs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
const groups = {
  deals: ["stage", "owner", "company"],
  tasks: ["status", "owner","priority","taskType"],
  companies: ["industry", "owner", "icp"],
  contacts: ["role", "company"],
};
export function Dashboards({ db, commit, display, labelFor }) {
  const [editing,setEditing]=useState(null);
  const [source, setSource] = useState("deals");
  function add(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!f.title.trim()) return;
    if (
      commit(
        n=>{const report={...f,source,id:editing?.id||crypto.randomUUID(),title:f.title.trim()};if(editing)Object.assign(n.reports.find(r=>r.id===editing.id),report);else(n.reports??=[]).push(report)},
        (editing?"Updated chart · ":"Added chart · ")+f.title
      )){
      e.target.reset();setEditing(null);setSource("deals");
    }

  }
  return (
    <article className="overview">
      <div className="report-heading">
        <h1>Dashboards</h1>
      </div>
      <section className="report-panel">
        <h2>{editing?"Edit chart":"Add a chart"}</h2>
        <form key={editing?.id||"new"} className="workflow-form" onSubmit={add}>
          <label>
            Chart title
            <input defaultValue={editing?.title} name="title" required maxLength={80} />
          </label>
          <label>
            Records
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              {Object.keys(groups).map((s) => (
                <option key={s} value={s}>
                  {labelFor(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Group by
            <select name="group" key={source} defaultValue={editing?.source===source?editing.group:undefined}>
              {groups[source].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Measure
            <select name="measure" defaultValue={editing?.measure}>
              <option value="count">Record count</option>
              {source === "deals" && (
                <option value="amount">Total value (USD)</option>
              )}
            </select>
          </label>
          <label>Widget width<select name="width" defaultValue={editing?.width||"half"}><option value="half">Half width</option><option value="full">Full width</option></select></label><Button type="submit">{editing?"Save chart":"Add chart"}</Button>{editing&&<Button type="button" onClick={()=>{setEditing(null);setSource("deals")}}>Cancel</Button>}
        </form>
      </section>
      <div className="report-grid">
        {(db.reports || []).map((r,index) => {
          const totals = new Map();
          for (const row of db[r.source]) {
            const v = display(row, r.group) || "Unassigned";
            totals.set(
              v,
              (totals.get(v) || 0) + (r.measure === "amount" ? row.amount : 1),
            );
          }
          const max = Math.max(1, ...totals.values());
          return (
            <section key={r.id} className="report-panel" style={{gridColumn:r.width==="full"?"1/-1":undefined}}>
              <h2>{r.title}</h2>
              <small>
                {labelFor(r.source)} ·{" "}
                {r.measure === "amount" ? "USD" : "Record count"} by {r.group}
              </small>
              {Array.from(totals)
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => (
                  <div className="chart-line" key={label}>
                    <span>{label}</span>
                    <b>{value.toLocaleString()}</b>
                    <i style={{ width: (value / max) * 100 + "%" }} />
                  </div>
                ))}
              {!totals.size && <p>No records yet.</p>}
              <Button size="sm" onClick={()=>{setEditing(r);setSource(r.source);document.querySelector(".overview")?.scrollTo(0,0)}}>Edit chart</Button> <Button size="sm" disabled={!index} onClick={()=>commit(n=>{const [item]=n.reports.splice(index,1);n.reports.splice(index-1,0,item)},"Moved chart · "+r.title)}>Move earlier</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (await confirmAction("Remove this chart?")){if(editing?.id===r.id){setEditing(null);setSource("deals")}
                    commit(
                      (n) =>
                        (n.reports = n.reports.filter((x) => x.id !== r.id)),
                      "Removed chart · " + r.title,
                    );}
                }}
              >
                Remove chart
              </Button>
            </section>
          );
        })}
      </div>
    </article>
  );
}
export function validReports(reports) {
  return (
    reports === undefined ||
    (Array.isArray(reports) &&
      reports.every(
        (r) =>
          r &&
          Object.hasOwn(groups, r.source) &&
          groups[r.source].includes(r.group) &&
          typeof r.id === "string" &&
          typeof r.title === "string" &&
          (r.measure === "count" ||
            (r.measure === "amount" && r.source === "deals")),
      ))
  );
}
import {Select} from "./Select";
import {performanceDemo} from "./performance-demo.mjs";
import React, {useState} from "react";
import {Button} from "twenty-ui/primitives/input";
import {salesPerformance,performanceCsv} from "./sales-performance.mjs";
import {formatMoney} from "./format";
export function SalesPerformance({db,open}) {
 const [pipeline,setPipeline]=useState(""),[owner,setOwner]=useState(""),[since,setSince]=useState(""),[until,setUntil]=useState(""),[staleDays,setStaleDays]=useState(30);
 const [demo,setDemo]=useState(()=>salesPerformance(db).outcomes.length===0);
 const data=demo?performanceDemo():db;
 const invalid=since&&until&&since>until;
 const report=salesPerformance(data,{pipeline,owner,since,until,staleDays});
 function download(){
  const url=URL.createObjectURL(new Blob([performanceCsv(report)],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=demo?"demo-sales-outcomes.csv":"sales-outcomes.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function results(rows,label){return <div className="performance-table"><table><thead><tr><th>{label}</th><th>Won</th><th>Lost</th><th>Win rate</th><th>Won value</th></tr></thead><tbody>{rows.map(row=><tr key={row.name}><td>{row.name}</td><td>{row.won}</td><td>{row.lost}</td><td>{Math.round(row.won/(row.won+row.lost)*100)}%</td><td>{formatMoney(row.revenue)}</td></tr>)}</tbody></table>{!rows.length&&<p>No recorded outcomes match these filters.</p>}</div>;}
 return <section className="panel-card sales-performance" aria-label="Sales performance">
  <div className="panel-heading"><div><h2>Sales performance</h2><p>Recorded outcomes and time in stage.</p></div><Button size="sm" disabled={!!invalid||!report.outcomes.length} onClick={download}>Export outcomes</Button></div>
  <div className="performance-source"><span>{demo?"Demo preview · sample opportunities":"Your workspace · live records"}</span><Button size="sm" variant="ghost" onClick={()=>{setDemo(!demo);setPipeline("");setOwner("");setSince("");setUntil("");}}>{demo?"Use my data":"Show demo data"}</Button></div>
  <div className="performance-filters">
   <label>Pipeline<Select ariaLabel="Performance pipeline" value={pipeline} onChange={setPipeline} options={[{value:"",label:"All pipelines"},...data.pipelines.map(p=>({value:p.id,label:p.name}))]}/></label>
   <label>Owner<Select ariaLabel="Performance owner" value={owner} onChange={setOwner} options={[{value:"",label:"All owners"},...[...new Set(data.deals.map(d=>d.owner).filter(Boolean))].map(name=>({value:name,label:name}))]}/></label>
   <label>Closed from<input aria-label="Closed from" type="date" value={since} onChange={e=>setSince(e.target.value)}/></label>
   <label>Closed through<input aria-label="Closed through" type="date" value={until} onChange={e=>setUntil(e.target.value)}/></label>
   <Button size="sm" onClick={()=>{setPipeline("");setOwner("");setSince("");setUntil("");}}>Reset filters</Button>
  </div>
  {invalid?<p role="alert">The end date must be on or after the start date.</p>:<>
   <div className="performance-metrics">
    <div><span>Recorded wins / losses</span><strong>{report.won} / {report.lost}</strong></div>
    <div><span>Win rate</span><strong>{report.winRate===null?"—":Math.round(report.winRate)+"%"}</strong></div>
    <div><span>Won value</span><strong>{formatMoney(report.revenue)}</strong></div>
    <div><span>Average sales cycle</span><strong>{report.cycleDays===null?"—":Math.round(report.cycleDays)+" days"}</strong><small>{report.cycleCount} dated outcomes</small></div>
   </div>
   <details className="performance-method"><summary>About these metrics{demo?" · demonstration data":""}</summary><p className="performance-note">Uses actual stage-history dates, not planned close dates. {report.unknownClosed} closed opportunities lack recorded outcome dates and are excluded. Sales cycle runs from creation to the latest recorded outcome; reopened opportunities count only in their current outcome.</p></details>
   <div className="performance-grid"><section><h3>Outcomes by month</h3>{results(report.months,"Month")}</section><section><h3>Results by owner</h3>{results(report.owners,"Owner")}</section></div>
   <details><summary>View matching outcomes ({report.outcomes.length})</summary><div className="performance-table"><table><thead><tr><th>Opportunity</th><th>Outcome</th><th>Recorded date</th><th>Amount</th></tr></thead><tbody>{report.outcomes.map(({deal,at})=><tr key={deal.id}><td><button className="performance-record" disabled={demo} onClick={()=>open("deals",deal)}>{deal.name}</button></td><td>{deal.stage}</td><td>{at.slice(0,10)}</td><td>{formatMoney(deal.amount)}</td></tr>)}</tbody></table></div></details>
  </>}
  <section className="performance-aging"><div className="panel-heading"><h3>Opportunities staying in one stage</h3><label>At least <Select ariaLabel="Stage age threshold" value={staleDays} onChange={setStaleDays} options={[7,14,30,60,90].map(n=>({value:n,label:n+" days"}))}/></label></div>
   <p className="performance-note">Current open opportunities, filtered by pipeline and owner. Close-date filters do not apply. {report.unknownAge} have no stage-entry date.</p>
   <div className="performance-table"><table><thead><tr><th>Opportunity</th><th>Stage</th><th>Days in stage</th><th>Owner</th><th>Next step</th></tr></thead><tbody>{report.stale.map(({deal,days})=><tr key={deal.id}><td><button className="performance-record" disabled={demo} onClick={()=>open("deals",deal)}>{deal.name}</button></td><td>{deal.stage}</td><td>{days}</td><td>{deal.owner||"Unassigned"}</td><td>{deal.nextStep||"Not set"}</td></tr>)}</tbody></table>{!report.stale.length&&<p>No dated opportunities exceed this threshold.</p>}</div>
  </section>
 </section>;
}

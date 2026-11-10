const day = 86400000;
const timestamp = value => {const time=Date.parse(value);return Number.isFinite(time)?time:null;};
export function salesPerformance(db, {pipeline="",owner="",since="",until="",staleDays=30,now=Date.now()}={}) {
 const deals=(db.deals||[]).filter(d=>(!pipeline||d.pipeline===pipeline)&&(!owner||d.owner===owner));
 const closed=deals.filter(d=>["Won","Lost"].includes(d.stage));
 const dated=closed.map(deal=>{
  const history=[...(deal.stageHistory||[])].filter(h=>h.to===deal.stage && timestamp(h.at)!==null).sort((a,b)=>timestamp(b.at)-timestamp(a.at));
  const at=history[0]?.at;
  return {deal,at,day:at?.slice(0,10)};
 }).filter(row=>row.day);
 const outcomes=dated.filter(r=>(!since||r.day>=since)&&(!until||r.day<=until));
 const cycles=outcomes.map(({deal,at})=>{const start=timestamp(deal.createdAt);return start!==null&&timestamp(at)>=start?(timestamp(at)-start)/day:null;}).filter(v=>v!==null);
 const open=deals.filter(d=>!["Won","Lost"].includes(d.stage)).map(deal=>{
  const at=deal.stageEnteredAt || [...(deal.stageHistory||[])].reverse().find(h=>h.to===deal.stage)?.at;
  const start=timestamp(at);
  return {deal,days:start===null?null:Math.max(0,Math.floor((now-start)/day))};
 });
 const owners=new Map(), months=new Map();
 for(const {deal,day:date} of outcomes){
  for(const [map,key] of [[owners,deal.owner||"Unassigned"],[months,date.slice(0,7)]]){
   if(!map.has(key))map.set(key,{name:key,won:0,lost:0,revenue:0});
   const row=map.get(key);row[deal.stage==="Won"?"won":"lost"]++;if(deal.stage==="Won")row.revenue+=Number(deal.amount)||0;
  }
 }
 const won=outcomes.filter(r=>r.deal.stage==="Won");
 return {outcomes,open,stale:open.filter(r=>r.days!==null&&r.days>=staleDays).sort((a,b)=>b.days-a.days),
 unknownClosed:closed.length-dated.length,unknownAge:open.filter(r=>r.days===null).length,
 won:won.length,lost:outcomes.length-won.length,revenue:won.reduce((n,r)=>n+(Number(r.deal.amount)||0),0),
 winRate:outcomes.length?won.length/outcomes.length*100:null,cycleDays:cycles.length?cycles.reduce((a,b)=>a+b,0)/cycles.length:null,cycleCount:cycles.length,
 owners:[...owners.values()].sort((a,b)=>b.revenue-a.revenue),months:[...months.values()].sort((a,b)=>a.name.localeCompare(b.name))};
}
export function performanceCsv(report) {
 const cell=value=>'"'+String(value??"").replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 return [["Opportunity","Outcome","Actual close date","Owner","Amount"],...report.outcomes.map(({deal,at})=>[deal.name,deal.stage,at,deal.owner,deal.amount])].map(row=>row.map(cell).join(",")).join("\r\n");
}

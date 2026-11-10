import {test} from "node:test";
import assert from "node:assert/strict";
import {salesPerformance,performanceCsv} from "../local/sales-performance.mjs";
const db={deals:[
{id:"won",name:"=Example",stage:"Won",owner:"Alex",pipeline:"sales",amount:100,createdAt:"2026-01-01",stageHistory:[{to:"Won",at:"2026-01-11"},{to:"Qualified",at:"2026-01-12"},{to:"Won",at:"2026-02-01"}]},
{id:"lost",name:"Lost deal",stage:"Lost",owner:"Alex",pipeline:"sales",amount:200,createdAt:"2026-01-01",stageHistory:[{to:"Lost",at:"2026-02-11"}]},
{id:"old",stage:"Won",date:"2026-02-01",amount:900},
{id:"open",stage:"Proposal",owner:"Alex",pipeline:"sales",stageEnteredAt:"2026-01-01"},
{id:"unknown",stage:"Proposal",pipeline:"other"}]};
test("outcomes use latest actual transition, exclude undated and apply filters",()=>{
 const r=salesPerformance(db,{since:"2026-02-01",until:"2026-02-28",now:Date.parse("2026-03-01")});
 assert.equal(r.won,1);assert.equal(r.lost,1);assert.equal(r.winRate,50);assert.equal(r.revenue,100);assert.equal(r.unknownClosed,1);assert.equal(r.cycleDays,36);
 assert.equal(r.months.length,1);assert.equal(r.stale[0].days,59);assert.equal(r.unknownAge,1);
 assert.equal(salesPerformance(db,{pipeline:"other"}).outcomes.length,0);
 assert.equal(salesPerformance(db,{until:"2026-01-31"}).outcomes.length,0);
 assert.match(performanceCsv(r),/"'=Example"/);
});
test("empty reports expose unknown rather than misleading zero rates",()=>{
 const r=salesPerformance({deals:[]});assert.equal(r.winRate,null);assert.equal(r.cycleDays,null);assert.deepEqual(r.stale,[]);
});

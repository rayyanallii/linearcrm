import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
const compiled = await build({ entryPoints: ["local/liner.js"], bundle: true, platform: "node", format: "esm", write: false });
const { readWorkspace, proposeChange, applyChange, catalog, localAnswer } = await import("data:text/javascript;base64," + Buffer.from(compiled.outputFiles[0].text).toString("base64"));
test("simple counts use current local data without guessing filtered or edit requests", () => {
  const db = { leads: [{id:"a"},{id:"b"}], contacts: [] };
  assert.match(localAnswer(db, "How many leads do I have?"), /2 leads/);
  assert.match(localAnswer(db, "How many people are there?"), /0 people/);
  assert.equal(localAnswer(db, "How many interested leads do I have?"), null);
  assert.equal(localAnswer(db, "Count leads then delete them"), null);
});
const workspace = () => ({ workspace: "Test", members: ["Alex"], tasks: [{ id: "t", name: "Call", status: "Open" }], leads: [], companies: [], contacts: [], deals: [], notes: [], emails: [], objects: [{key:"projects",plural:"Projects"}], projects: [{id:"p",name:"Project"}], files: [{id:"f",name:"brief",data:"SECRET_BINARY"}], pipelines: [{id:"sales",name:"Sales"}], defaultPipelineId:"sales" });
test("catalog and reads include custom objects, paginate, and omit file bytes", () => {
  const db = workspace(); db.tasks = Array.from({length:105}, (_,i) => ({id:String(i),name:`Task ${i}`}));
  assert.ok(catalog(db).collections.some(row => row.type === "projects"));
  const first = readWorkspace(db,{section:"records",type:"tasks",limit:100});
  assert.equal(first.nextOffset,100); assert.equal(first.records.length,100);
  assert.equal(readWorkspace(db,{section:"records",type:"tasks",offset:100}).records.length,5);
  assert.equal(JSON.stringify(readWorkspace(db,{section:"files"})).includes("SECRET_BINARY"),false);
});
test("proposals do not mutate data; applying updates validates and rejects conflicts", () => {
  const db=workspace(), before=structuredClone(db);
  const proposal=proposeChange(db,{operation:"update",type:"tasks",id:"t",values:{status:"Done"}});
  assert.deepEqual(db,before); applyChange(db,proposal); assert.equal(db.tasks[0].status,"Done");
  assert.throws(()=>applyChange(db,proposal),/changed since/);
  const stale=proposeChange(db,{operation:"update",type:"tasks",id:"t",values:{name:"Later"}});
  db.tasks[0].name="Edited elsewhere"; assert.throws(()=>applyChange(db,stale),/changed since/);
});
test("create validates required fields and cannot be repeated", () => {
  const db=workspace(); const proposal=proposeChange(db,{operation:"create",type:"leads",values:{name:"Prospect",email:"p@example.com"}});
  applyChange(db,proposal); assert.equal(db.leads[0].status,"Not contacted");
  assert.throws(()=>applyChange(db,proposal),/already created/);
  assert.throws(()=>proposeChange(db,{operation:"create",type:"tasks",values:{status:"Open"}}),/required/);
});
test("invalid fields, types, relations, dates, URLs and workflow-bypassing statuses are rejected", () => {
  const db=workspace();
  for(const values of [{id:"evil"},{name:42},{status:"Made up"},{date:"2026-02-31"},{company:"missing"},{owner:"Unknown"}])
    assert.throws(()=>proposeChange(db,{operation:"update",type:"tasks",id:"t",values}));
  assert.throws(()=>proposeChange(db,{operation:"create",type:"leads",values:{name:"Bad",status:"Converted"}}),/conversion/);
  assert.throws(()=>proposeChange(db,{operation:"create",type:"companies",values:{name:"Bad",website:"javascript:alert(1)"}}),/https/);
  assert.equal(db.tasks[0].name,"Call");
});

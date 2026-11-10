import test from "node:test";
import assert from "node:assert/strict";
import { nextOccurrence, updateTaskActivity } from "../local/task-activity.mjs";
const workspace=()=>({members:["Alex"],tasks:[{id:"task",name:"Weekly review",status:"Open",date:"2026-11-03",repeat:"Weekly",company:"company",contact:"person",deal:"deal",checklist:[{id:"step",text:"Prepare notes",done:true}]}]});
test("completion generates one linked occurrence with a fresh checklist",()=>{
  const before=workspace(),next=structuredClone(before);next.tasks[0].status="Done";
  const [created]=updateTaskActivity(before,next);
  assert.equal(created.date,"2026-11-10");assert.equal(created.company,"company");assert.equal(created.contact,"person");assert.equal(created.deal,"deal");assert.equal(created.checklist[0].done,false);assert.notEqual(created.checklist[0].id,"step");assert.equal(next.tasks[1].repeatNextId,created.id);assert.ok(next.tasks[1].completedAt);
  const edit=structuredClone(next);edit.tasks[1].details="Updated completed task";assert.equal(updateTaskActivity(next,edit).length,0);
  const reopen=structuredClone(edit);reopen.tasks[1].status="Open";updateTaskActivity(edit,reopen);const done=structuredClone(reopen);done.tasks[1].status="Done";assert.equal(updateTaskActivity(reopen,done).length,0);
});
test("monthly repeats preserve the day anchor across short months and leap years",()=>{
  assert.equal(nextOccurrence("2026-01-31","Monthly"),"2026-02-28");assert.equal(nextOccurrence("2028-01-31","Monthly"),"2028-02-29");
  const before=workspace();before.tasks[0].date="2026-01-31";before.tasks[0].repeat="Monthly";const next=structuredClone(before);next.tasks[0].status="Done";updateTaskActivity(before,next);
  const third=structuredClone(next);third.tasks[0].status="Done";updateTaskActivity(next,third);assert.equal(third.tasks[0].date,"2026-03-31");
});
test("end dates stop the series; cancellation and imported completions do not generate tasks",()=>{
  const before=workspace();before.tasks[0].repeatUntil="2026-11-05";const next=structuredClone(before);next.tasks[0].status="Done";assert.equal(updateTaskActivity(before,next).length,0);
  const cancelled=workspace();cancelled.tasks[0].status="Cancelled";assert.equal(updateTaskActivity(before,cancelled).length,0);
  const imported=workspace();imported.tasks[0].status="Done";assert.equal(updateTaskActivity({tasks:[]},imported).length,0);
});
test("invalid schedules are rejected and explicit rescheduling resets the anchor",()=>{
  const before=workspace(),next=structuredClone(before);next.tasks[0].date="2026-02-31";assert.throws(()=>updateTaskActivity(before,next),/valid due/);
  next.tasks[0].date="2026-11-10";next.tasks[0].repeatUntil="2026-11-01";assert.throws(()=>updateTaskActivity(before,next),/on or after/);
  next.tasks[0].repeatUntil="";next.tasks[0].repeat="Monthly";updateTaskActivity(before,next);assert.equal(next.tasks[0].repeatAnchorDay,10);
});

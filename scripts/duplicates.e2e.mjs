import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"chrome",headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("linear-crm.v1")));
const nav=name=>page.getByRole("button",{name,exact:true}).click();
try{
  await page.goto("http://127.0.0.1:4817/app.html");
  await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem("linear-crm.v1"));db.companies.unshift({id:"qa-primary",name:"Merge Company",website:"merge.test",phone:"",details:"Original context"},{id:"qa-duplicate",name:"Merge Duplicate",website:"https://www.merge.test/about",phone:"555-1010",details:"Follow-up context"});db.tasks.unshift({id:"qa-task",name:"Merge-linked task",status:"Open",company:"qa-duplicate"});localStorage.setItem("linear-crm.v1",JSON.stringify(db));});
  await page.reload();await nav("Settings");await nav("Data quality");
  await page.getByLabel("Duplicate record type").click();await page.getByRole("option",{name:"Companies",exact:true}).click();
  const group=page.locator(".duplicate-group").filter({hasText:"merge.test"});await group.getByRole("button",{name:"Review merge"}).click();
  const dialog=page.getByRole("dialog",{name:"Review duplicate merge"});await dialog.waitFor();
  await page.screenshot({path:"screenshots/duplicate-review.png"});
  await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException("Full","QuotaExceededError");};});
  await dialog.getByRole("button",{name:"Merge records"}).click();assert.ok((await state()).companies.some(row=>row.id==="qa-duplicate"));
  await page.locator("dialog.app-dialog").getByRole("button",{name:"Close"}).click();
  await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});
  await dialog.getByRole("button",{name:"Merge records"}).click();await dialog.waitFor({state:"hidden"});
  const merged=await state();assert.equal(merged.companies.some(row=>row.id==="qa-duplicate"),false);assert.equal(merged.tasks.find(row=>row.id==="qa-task").company,"qa-primary");assert.equal(merged.companies.find(row=>row.id==="qa-primary").phone,"555-1010");
  await page.reload();await nav("Trash");assert.match(await page.locator(".settings-panels").innerText(),/Merged duplicate/);
  await page.getByRole("button",{name:"Restore",exact:true}).click();assert.ok((await state()).companies.some(row=>row.id==="qa-duplicate"));assert.equal((await state()).tasks.find(row=>row.id==="qa-task").company,"qa-primary");
  await nav("Companies");await page.getByLabel("Search this view").fill("Merge Company");await page.locator(".record-link").filter({hasText:"Merge Company"}).click();
  const drawer=page.locator(".record-drawer");await drawer.getByRole("button",{name:"Edit Relationship status",exact:true}).click();await drawer.getByLabel("Relationship status",{exact:true}).click();await page.getByRole("option",{name:"Active customer",exact:true}).click();
  assert.equal((await state()).companies.find(row=>row.id==="qa-primary").relationshipStatus,"Active customer");
  await drawer.getByRole("button",{name:"Close record"}).click();await nav("Settings");await nav("Data quality");
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.querySelector(".app-sidebar").getBoundingClientRect().right<=0);await page.screenshot({path:"screenshots/data-quality-mobile.png"});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  console.log("Duplicate browser checks passed: review, storage failure rollback, merge, linked tasks, reload, Trash restore, relationship status, mobile.");
}finally{await browser.close();}

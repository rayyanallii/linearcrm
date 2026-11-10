import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"chrome",headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto("http://127.0.0.1:4817/app.html");
 await page.getByRole("button",{name:"Toggle sidebar"}).click();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector(".app-sidebar")).display==="none");
 await page.reload();assert.equal(await page.locator(".app-sidebar").isVisible(),false);
 await page.getByRole("button",{name:"Toggle sidebar"}).click();await page.getByRole("button",{name:"Dashboards",exact:true}).click();
 await page.getByRole("region",{name:"Sales performance",exact:true}).waitFor();
 await page.evaluate(()=>{
 const db=JSON.parse(localStorage.getItem("linear-crm.v1"));
 db.deals[0].stage="Won";db.deals[0].stageHistory=[{to:"Won",at:"2026-10-01T00:00:00Z"}];db.deals[0].createdAt="2026-09-01T00:00:00Z";
 localStorage.setItem("linear-crm.v1",JSON.stringify(db));
 });
 await page.reload();
 await page.getByLabel("Closed from",{exact:true}).fill("2026-09-01");await page.getByLabel("Closed through",{exact:true}).fill("2026-10-31");
 const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export outcomes"}).click();assert.equal((await download).suggestedFilename(),"sales-outcomes.csv");
 await page.getByText(/View matching outcomes/).click();
 await page.locator(".sales-performance details .performance-record").first().click();await page.locator(".record-drawer").waitFor();await page.getByRole("button",{name:"Close record"}).click();await page.getByRole("button",{name:"Dashboards",exact:true}).click();await page.getByLabel("Closed through",{exact:true}).fill("2026-10-31");
 await page.getByLabel("Closed from",{exact:true}).fill("2026-11-01");await page.getByRole("alert").filter({hasText:"end date"}).waitFor();
 await page.getByRole("button",{name:"Reset filters",exact:true}).click();
 await page.screenshot({path:"screenshots/sales-performance.png"});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole("button",{name:"Toggle sidebar"}).click();await page.getByRole("button",{name:"Overview",exact:true}).click();
 await page.waitForFunction(()=>document.querySelector(".app-sidebar").getBoundingClientRect().right<=0);
 assert.deepEqual(errors,[]);
 console.log("Performance and sidebar checks passed: collapse persistence, desktop/mobile navigation, report filters, export, record drilldown.");
}finally{await browser.close();}

import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({channel:"chrome",headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
let requests=0;
await page.route("**/env.js",r=>r.fulfill({contentType:"text/javascript",body:'globalThis.LINEAR_CRM_CONFIG={experientialApiKey:"test-only"};'}));
await page.route("**/chat/completions",r=>{requests++;return r.fulfill({status:401,contentType:"application/json",body:'{"error":{"message":"unauthorized"}}'});});
try {
 await page.goto("http://127.0.0.1:4817/app.html#activity");
 assert.equal(await page.getByRole("button",{name:"Activity",exact:true}).count(),0);
 await page.getByRole("button",{name:"Tasks",exact:true}).waitFor();
 for(const group of ["Sales","Productivity","Insights & automation"]) await page.locator(".app-sidebar").getByRole("heading",{name:group,exact:true}).waitFor();
 await page.getByRole("button",{name:"Tasks",exact:true}).click({button:"right"});
 await page.getByRole("menuitem",{name:"Pin Tasks",exact:true}).click();
 assert.equal(await page.getByRole("button",{name:"Open pinned Tasks"}).locator("svg").count(),1);
 await page.reload();await page.getByRole("button",{name:"Open pinned Tasks"}).waitFor();
 await page.getByRole("button",{name:"Liner",exact:true}).click();
 for(const question of ["Which opportunities need attention?","Find interested leads without a follow-up","Help me clean up missing contact details"]) {
  await page.getByLabel("Message Liner").fill(question);
  await page.getByRole("button",{name:"Send message"}).click();
  await page.getByRole("button",{name:"Stop",exact:true}).waitFor({state:"hidden"});
 }
 assert.equal(requests,0);
 assert.equal(await page.locator(".liner-message.assistant").count(),3);
 await page.getByLabel("Message Liner").fill("Explain my business strategy");
 await page.getByRole("button",{name:"Send message"}).click();
 await page.getByRole("alert").filter({hasText:"key was rejected"}).waitFor();
 assert.equal(requests,1);
 await page.screenshot({path:"screenshots/liner-fixed.png"});
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  const button=await page.getByRole("button",{name:"Send message"}).boundingBox();
  const footer=await page.locator(".liner-composer-footer").boundingBox();
  assert.ok(button.x>=footer.x && button.x+button.width<=footer.x+footer.width+1);
  assert.ok(button.y>=footer.y && button.y+button.height<=footer.y+footer.height+1);
 }
 console.log("Navigation and Liner checks passed: local insights, auth errors, SVG pins, persistence, removed Activity, responsive send control.");
} finally {await browser.close();}

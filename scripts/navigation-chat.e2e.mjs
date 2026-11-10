import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"chrome",headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
let calls=0; const errors=[];
page.on("pageerror",error=>errors.push(error.message));
page.on("dialog",dialog=>dialog.accept());
await page.route("**/chat/completions",route=>{calls++;return route.abort();});
try {
  await page.goto("http://127.0.0.1:4817/app.html");
  const sidebar=page.locator(".app-sidebar");
  const pin=async label=>{
    await sidebar.getByRole("button",{name:label,exact:true}).click({button:"right"});
    await page.getByRole("menuitem",{name:`Pin ${label}`,exact:true}).click();
  };
  const unpin=async label=>{
    await sidebar.getByRole("button",{name:`Open pinned ${label}`,exact:true}).click({button:"right"});
    await page.getByRole("menuitem",{name:`Unpin ${label}`,exact:true}).click();
  };
  assert.equal(await sidebar.getByRole("heading",{name:"Favorites",exact:true}).count(),0);
  assert.equal(await sidebar.getByRole("heading",{name:"Views",exact:true}).count(),0);
  await pin("Leads");
  await pin("Overview");
  await page.reload();
  await sidebar.getByRole("button",{name:"Open pinned Leads",exact:true}).click();
  assert.equal(new URL(page.url()).hash,"#leads");
  assert.equal(await sidebar.locator(".pinned-section-link").first().locator("svg").count(),1);
  await unpin("Leads");
  assert.equal(await sidebar.getByRole("button",{name:"Open pinned Leads",exact:true}).count(),0);
  await sidebar.getByRole("button",{name:"Liner",exact:true}).click();
  await page.getByLabel("Message Liner").fill("How many leads do I have");
  const started=Date.now();
  await page.getByRole("button",{name:"Send message",exact:true}).click();
  await page.locator(".liner-message.assistant").waitFor({timeout:5000});
  assert.ok(Date.now()-started<5000);
  assert.equal(calls,0);
  assert.match(await page.locator(".liner-message.assistant").innerText(),/0 leads/);
  await sidebar.getByRole("button",{name:"Dark mode",exact:true}).click();
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    if (width < 700) await page.waitForFunction(()=>document.querySelector(".app-sidebar").getBoundingClientRect().right<=0);
    await page.getByLabel("Message Liner").fill("Hello");
    const box=await page.getByLabel("Message Liner").boundingBox();
    const send=await page.getByRole("button",{name:"Send message"}).boundingBox();
    assert.ok(send.y>=box.y+box.height, "Send must be below the textarea");
    assert.ok(send.x+send.width<=width,"Send must stay inside viewport");
    await page.screenshot({path:`screenshots/liner-fixed-${width}.png`});
  }
  await page.getByRole("button",{name:"Clear chat",exact:true}).click();
  await page.getByRole("dialog",{name:"Confirm action"}).getByRole("button",{name:"Confirm"}).click();
  assert.equal(await page.locator(".liner-message").count(),0);
  assert.equal(await page.getByRole("alert").count(),0);
  assert.deepEqual(errors,[]);
  console.log("Navigation and chat checks passed: persisted section pins, local count without API calls, composer geometry, clear chat, desktop/mobile.");
} finally {await browser.close();}

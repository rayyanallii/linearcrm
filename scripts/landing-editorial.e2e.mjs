import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4817/';
await page.goto(base);
await page.getByRole('heading',{level:1}).waitFor();
assert.match(await page.locator('h1').innerText(),/Good relationships/);
assert.ok(await page.locator('h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=80);
await page.getByRole('button',{name:'H Helio Systems',exact:true}).click();
assert.match(await page.locator('.ed-contact').innerText(),/Theo Marshall/);
await page.getByRole('tab',{name:'Next task',exact:true}).click();
assert.match(await page.locator('.ed-contact-note').innerText(),/Follow up with Theo/);
await page.getByRole('textbox',{name:'Search sample companies'}).fill('unknown');
assert.equal(await page.locator('.ed-product tbody tr').count(),0);
await page.getByRole('textbox',{name:'Search sample companies'}).fill('');
await page.getByRole('tab',{name:'Forecast',exact:true}).click();
assert.match(await page.locator('.ed-forecast').innerText(),/46,850/);
await page.getByRole('button',{name:'Summarize Northstar Studio',exact:true}).click();
assert.match(await page.locator('.ed-answer').innerText(),/40 seats/);
await page.getByText('Where does my data live?',{exact:true}).click();
assert.equal(await page.locator('details[open]').count(),1);
for(const width of [390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(800);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,`home overflow ${width}`);
  await page.screenshot({path:`screenshots/editorial-${width}.png`,fullPage:true});
}
for(const route of ['platform','product','resources','customers','pricing']) {
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(`${base}${route}.html`);
    await page.locator('h1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,`${route} overflow ${width}`);
  }
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(base);
assert.equal(await page.locator('.ed-hero-preview').evaluate(e=>getComputedStyle(e).opacity),'1');
await page.setViewportSize({width:390,height:900});
await page.getByRole('button',{name:'Open menu',exact:true}).click();
assert.equal(await page.locator('#mobile-navigation').getByRole('link',{name:'Use cases'}).getAttribute('href'),'./customers.html');
assert.deepEqual(errors,[]);
await browser.close();
console.log('Editorial landing: previews, tabs, FAQ, routes, typography, responsive layouts and reduced motion passed.');

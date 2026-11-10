import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("dialog", dialog => dialog.accept());
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("linear-crm.v1")));
const drawer = page.locator(".record-drawer");
const openLead = () => page.locator(".record-link").filter({ hasText: "Ada Prospect" }).first().click();
async function createLead(name, email) {
  await page.getByRole("button", { name: "New lead", exact: true }).first().click();
  await drawer.getByLabel("Lead name", { exact: true }).fill(name);
  await drawer.getByLabel("Email", { exact: true }).fill(email);
  await drawer.getByLabel("Company name", { exact: true }).fill("Conversion Labs");
  await drawer.getByRole("button", { name: "Create lead", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
}
try {
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:4817/app.html");
  await page.getByRole("button", { name: "Leads", exact: true }).click();
  await createLead("Ada Prospect", "ada@conversion.example");
  await openLead();
  await drawer.getByRole("button", { name: "Edit Phone", exact: true }).click();
  await drawer.locator(".field-editor input").fill("+1 555 0123");
  await page.keyboard.press("Enter");
  assert.equal((await state()).leads[0].phone, "+1 555 0123");
  await drawer.getByRole("button", { name: "Task", exact: true }).click();
  await drawer.getByLabel("Task", { exact: true }).fill("Qualify Ada");
  await drawer.getByRole("button", { name: "Create task", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Leads", exact: true }).click();
  await openLead();
  await drawer.getByRole("button", { name: "Note", exact: true }).click();
  await drawer.getByLabel("Title", { exact: true }).fill("Discovery with Ada");
  await drawer.getByRole("button", { name: "Create note", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Leads", exact: true }).click();
  await openLead();
  await drawer.getByRole("button", { name: "Convert lead", exact: true }).click();
  await drawer.getByLabel("Create an opportunity").check();
  await drawer.getByLabel("Amount (USD)", { exact: true }).fill("25000");
  await page.screenshot({ path: "screenshots/lead-conversion.png" });
  // A quota failure must not leave half-converted records in memory or storage.
  await page.evaluate(() => {
    window.originalStorageSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "linear-crm.v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return window.originalStorageSet.call(this, key, value);
    };
  });
  await drawer.getByRole("button", { name: "Confirm conversion" }).click();
  const failure = page.locator(".app-dialog");
  await failure.waitFor();
  assert.ok((await failure.innerText()).includes("Unable to save"));
  await failure.getByRole("button", { name: "Close", exact: true }).click();
  await failure.waitFor({ state: "hidden" });
  assert.equal((await state()).leads[0].status, "Not contacted");
  assert.equal((await state()).contacts.some(row => row.email === "ada@conversion.example"), false);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet; });
  await drawer.getByRole("button", { name: "Confirm conversion" }).click();
  await drawer.getByRole("button", { name: /Contact · Ada Prospect/ }).waitFor();
  const converted = await state();
  const lead = converted.leads[0];
  assert.equal(lead.status, "Converted");
  assert.equal(converted.contacts.find(row => row.id === lead.conversion.contactId).phone, "+1 555 0123");
  assert.equal(converted.deals.find(row => row.id === lead.conversion.dealId).amount, 25000);
  for (const type of ["tasks", "notes"]) {
    const related = converted[type].find(row => row.lead === lead.id);
    assert.equal(related.contact, lead.conversion.contactId);
    assert.equal(related.company, lead.conversion.companyId);
    assert.equal(related.deal, lead.conversion.dealId);
  }
  assert.equal(await drawer.getByRole("button", { name: "Convert lead", exact: true }).count(), 0);
  await page.reload();
  await openLead();
  await drawer.getByRole("button", { name: /Contact · Ada Prospect/ }).waitFor();
  await drawer.getByRole("button", { name: "Close record" }).click();
  await createLead("Ada Repeat", "ADA@conversion.example");
  await page.locator(".record-link").filter({ hasText: "Ada Repeat" }).click();
  await drawer.getByRole("button", { name: "Convert lead", exact: true }).click();
  await drawer.getByRole("button", { name: "Confirm conversion" }).click();
  await drawer.getByRole("button", { name: /Contact · Ada Prospect/ }).waitFor();
  const reused = await state();
  assert.equal(reused.contacts.length, converted.contacts.length);
  assert.equal(reused.companies.length, converted.companies.length);
  assert.equal(reused.leads[0].conversion.contactId, lead.conversion.contactId);
  await drawer.getByRole("button", { name: "Duplicate record" }).click();
  await drawer.getByRole("button", { name: "Create lead", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
  assert.equal((await state()).leads[0].status, "Not contacted");
  assert.equal((await state()).leads[0].conversion, undefined);
  await page.getByLabel("Search this view").fill("Ada Repeat (copy)");
  assert.equal(await page.locator(".record-row").count(), 1);
  await page.getByLabel("Search this view").fill("");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  assert.equal(await page.locator(".lead-summary").count(), 0);
  await page.getByRole("button", { name: "Leads", exact: true }).click();
  await page.getByLabel("Board layout").click();
  await page.locator(".board-column").first().waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "screenshots/leads-mobile.png" });
  // An older snapshot must migrate without removing existing business records.
  await page.evaluate(() => {
    const old = JSON.parse(localStorage.getItem("linear-crm.v1"));
    delete old.leads;
    localStorage.setItem("linear-crm.v1", JSON.stringify(old));
  });
  await page.reload();
  await page.getByLabel("Table layout").waitFor();
  await page.getByLabel("Table layout").click();
  assert.equal(await page.locator(".record-row").count(), 0);
  assert.equal((await state()).companies.length, reused.companies.length);
  assert.deepEqual(errors, []);
  console.log("Lead browser checks passed: CRUD, atomic save failure, conversion, duplicate reuse, refresh, duplication, board, mobile, legacy migration.");
} finally {
  await browser.close();
}

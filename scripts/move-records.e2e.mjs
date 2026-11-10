import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

fs.mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("linear-crm.v1")));
const drawer = page.locator(".record-drawer");
const nav = (name) => page.getByRole("button", { name, exact: true }).click();

async function createLead(name, companyName, website = "") {
  await page.getByRole("button", { name: "New lead", exact: true }).first().click();
  await drawer.getByLabel("Lead name", { exact: true }).fill(name);
  await drawer.getByLabel("Email", { exact: true }).fill(`${name.replaceAll(" ", ".").toLowerCase()}@example.com`);
  await drawer.getByLabel("Company name", { exact: true }).fill(companyName);
  if (website) await drawer.getByLabel("Company website", { exact: true }).fill(website);
  await drawer.getByLabel("Status", { exact: true }).click();
  await page.getByRole("option", { name: "Interested", exact: true }).click();
  await drawer.getByRole("button", { name: "Create lead", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
}

async function move(name, from, to, targetName = name) {
  await page.locator(".record-row").filter({ hasText: name }).first().locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Move to…", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /Move 1 record/ });
  await dialog.waitFor();
  await dialog.getByLabel("Move records to", { exact: true }).click();
  await page.getByRole("option", { name: to, exact: true }).click();
  if (from === "leads" && to === "People")
    await page.screenshot({ path: "screenshots/move-records-desktop.png", fullPage: false });
  await dialog.getByRole("button", { name: `Move to ${to}`, exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  const saved = await state();
  assert.equal(saved[from].some((row) => row.name === name), false, `${name} stayed in ${from}`);
  assert.equal(saved[to.toLowerCase() === "people" ? "contacts" : to.toLowerCase()].some((row) => row.name === targetName), true);
}

try {
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:4817/app.html");
  await nav("Leads");
  await createLead("Move Person", "Layers");
  await page.locator(".record-link").filter({ hasText: "Move Person" }).click();
  await drawer.getByRole("button", { name: "Task", exact: true }).click();
  await drawer.getByLabel("Task", { exact: true }).fill("Qualify Move Person");
  await drawer.getByRole("button", { name: "Create task", exact: true }).click();
  await drawer.waitFor({ state: "hidden" });
  await nav("Leads");
  const before = await state();
  const layers = before.companies.find((row) => row.name === "Layers");
  const lead = before.leads.find((row) => row.name === "Move Person");
  const task = before.tasks.find((row) => row.name === "Qualify Move Person");
  assert.ok(layers && lead && task);

  await move("Move Person", "leads", "People");
  const people = await state();
  const person = people.contacts.find((row) => row.name === "Move Person");
  const movedTask = people.tasks.find((row) => row.name === "Qualify Move Person");
  assert.equal(person.id, lead.id);
  assert.equal(person.company, layers.id);
  assert.equal(person.status, "Qualified");
  assert.equal(movedTask.lead, "");
  assert.equal(movedTask.contact, lead.id);

  await nav("People");
  await move("Move Person", "contacts", "Leads");
  const back = await state();
  const backLead = back.leads.find((row) => row.name === "Move Person");
  assert.equal(backLead.companyName, "Layers");
  assert.equal(backLead.website, layers.website);
  assert.equal(backLead.status, "Qualified");
  assert.equal(back.tasks.find((row) => row.name === "Qualify Move Person").lead, backLead.id);

  await nav("Leads");
  await createLead("Move Company", "Move Labs", "movelabs.example");
  await nav("Leads");
  await move("Move Company", "leads", "Companies", "Move Labs");
  const companies = await state();
  const movedCompany = companies.companies.find((row) => row.name === "Move Labs");
  assert.equal(movedCompany.website, "movelabs.example");
  assert.equal(movedCompany.relationshipStatus, "Prospect");

  await nav("Companies");
  await move("Move Labs", "companies", "Leads");
  const companyBack = await state();
  const companyLead = companyBack.leads.find((row) => row.name === "Move Labs");
  assert.equal(companyLead.companyName, "Move Labs");
  assert.equal(companyLead.website, "movelabs.example");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${process.env.BASE_URL || "http://127.0.0.1:4817/app.html"}#leads`);
  await page.locator(".record-row").first().waitFor();
  await page.locator(".record-row").first().locator('input[type="checkbox"]').check();
  const bar = await page.locator(".bulk-bar").boundingBox();
  assert.ok(bar.x >= 0 && bar.width <= 390, JSON.stringify(bar));
  const moveButton = await page.getByRole("button", { name: "Move to…", exact: true }).boundingBox();
  assert.ok(moveButton.x >= 0 && moveButton.x + moveButton.width <= 390, JSON.stringify(moveButton));
  await page.getByRole("button", { name: "Move to…", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: /Move 1 record/ });
  await sheet.waitFor();
  const box = await sheet.boundingBox();
  assert.ok(box.width <= 390 && box.y + box.height <= 845, JSON.stringify(box));
  await page.waitForTimeout(2800);
  await page.screenshot({ path: "screenshots/move-records-mobile.png", fullPage: false });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
  await sheet.getByRole("button", { name: "Close move dialog" }).click();

  assert.deepEqual(errors, []);
  console.log("Move browser checks passed: Leads → People/Companies, People/Companies → Leads, linked task, and mobile sheet.");
} finally {
  await browser.close();
}

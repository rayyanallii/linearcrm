import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4817/app.html";
const SHOTS = "screenshots";
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 920 },
  acceptDownloads: true,
});
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];

page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("dialog", (dialog) => dialog.accept());

async function wait(ms = 300) {
  await page.waitForTimeout(ms);
}

async function shot(name, fullPage = true) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage });
}

async function body() {
  return page.locator("body").innerText();
}

async function nav(name) {
  await page.getByRole("button", { name, exact: true }).click();
  await wait();
}

async function drawer() {
  return page.locator(".record-drawer");
}

async function closeDrawer() {
  await page.getByRole("button", { name: "Close record" }).click();
  await wait(200);
}

async function pick(scope, label, option) {
  await scope.getByLabel(label, { exact: true }).first().click();
  await page
    .getByRole("option", { name: option, exact: true })
    .first()
    .click();
  await wait(150);
}

async function confirmDialog() {
  const dialog = page.locator("dialog.app-dialog");
  await dialog.waitFor({ state: "visible" });
  await dialog.getByRole("button", { name: "Confirm" }).click();
  await wait(300);
}

async function step(name, fn) {
  process.stdout.write(`• ${name} ... `);
  try {
    await fn();
    console.log("ok");
  } catch (error) {
    console.log("FAILED");
    await shot(`failure-${name.replaceAll(/[^a-z0-9]+/gi, "-")}`, false);
    console.error(error);
    throw error;
  }
}

await page.goto(BASE, { waitUntil: "networkidle" });
await wait(600);

await step("overview loads with live metrics", async () => {
  assert.match(await page.title(), /Overview/);
  const text = await body();
  assert.ok(text.includes("Workspace overview"));
  assert.ok(text.includes("Open pipeline"));
  assert.ok(text.includes("Weighted forecast"));
  assert.ok(text.includes("Pipeline by stage"));
  await shot("01-overview");
});

await step("feature packs are opt-in", async () => {
  const sidebar = await page.locator(".app-sidebar").innerText();
  assert.ok(!sidebar.includes("Campaigns"));
  assert.ok(!sidebar.includes("Projects"));
  assert.ok(!sidebar.includes("Support tickets"));
  assert.ok(!sidebar.includes("Emails"));
  assert.ok(!sidebar.includes("Products"));
  await nav("Settings");
  await page.getByRole("button", { name: "Feature packs", exact: true }).click();
  await wait();
  for (const pack of ["Campaigns", "Projects", "Support tickets", "Emails", "Products & quotes"]) {
    await page.getByLabel(`${pack} pack`, { exact: true }).check();
    await wait(250);
  }
  const enabled = await page.locator(".app-sidebar").innerText();
  for (const label of ["Campaigns", "Projects", "Support tickets", "Emails", "Products"]) {
    assert.ok(enabled.includes(label), `${label} pack was not added to navigation`);
  }
  await shot("02a-feature-packs");
  await nav("Companies");
});

await step("companies table uses clean default columns", async () => {
  await nav("Companies");
  const text = await body();
  assert.ok(text.includes("All records"));
  assert.ok(text.includes("Revenue accounts"));
  assert.ok(text.includes("12 of 12"));
  assert.ok(text.includes("Company name"));
  assert.ok(!text.includes("Created at"));
  const searchButtons = page.locator(".search-button");
  assert.equal(await searchButtons.count(), 2);
  const searchBoxes = await searchButtons.evaluateAll((nodes) =>
    nodes.map((node) => ({
      height: Math.round(node.getBoundingClientRect().height),
      shortcut: node.querySelector(".search-button-kbd")?.textContent || "",
    })),
  );
  assert.ok(searchBoxes.every((item) => item.height === 32));
  assert.ok(/^(Ctrl K|⌘K)$/.test(searchBoxes[0].shortcut));
  assert.equal(
    await page.locator(".boolean").first().evaluate((el) => getComputedStyle(el).whiteSpace),
    "nowrap",
  );
  await shot("02-companies");
});

await step("delivery modules create and persist records", async () => {
  await nav("Projects");
  let text = await body();
  assert.ok(text.includes("Active projects"));
  assert.ok(text.includes("5 of 5"));
  assert.ok(text.includes("Hourglass group rollout"));
  await page.locator(".page-header").getByRole("button", { name: "New project", exact: true }).click();
  await wait();
  const project = await drawer();
  await project.getByLabel("Project name").fill("Playwright rollout");
  await pick(project, "Status", "In progress");
  await project.getByRole("button", { name: "Create project" }).click();
  await wait(500);
  await page.getByLabel("Search this view").fill("Playwright rollout");
  await wait();
  assert.ok((await body()).includes("Playwright rollout"));
  await shot("02b-projects");
  await page.reload({ waitUntil: "networkidle" });
  await wait(500);
  await nav("Projects");
  await page.getByLabel("Search this view").fill("Playwright rollout");
  await wait();
  assert.ok((await body()).includes("Playwright rollout"));
  await page.getByLabel("Search this view").fill("");
  await wait();
  await nav("Campaigns");
  text = await body();
  assert.ok(text.includes("Q4 enterprise outbound"));
  assert.ok(text.includes("Spend"));
  await nav("Support tickets");
  text = await body();
  assert.ok(text.includes("Open tickets"));
  assert.ok(text.includes("Billing address mismatch"));
  assert.ok(text.includes("Waiting on customer"));
  await nav("Companies");
  await wait();
});

await step("quote builder totals a product line", async () => {
  await nav("Products");
  assert.ok((await body()).includes("Platform seats"));
  await nav("Opportunities");
  const row = page.locator(".record-row").filter({ hasText: "Layers design systems" });
  await row.locator(".record-link").click();
  await wait();
  const record = await drawer();
  await record.getByLabel("Add product to quote").click();
  await page.getByRole("option", { name: /Platform seats/ }).first().click();
  await wait(500);
  assert.ok((await record.innerText()).includes("$2,400"), await record.innerText());
  const qty = record.getByLabel("Quantity 1", { exact: true });
  await qty.fill("3");
  await qty.press("Tab");
  await wait(600);
  assert.ok((await record.innerText()).includes("$7,200"), await record.innerText());
  await shot("05b-quote", false);
  await record.getByRole("button", { name: "Use total as amount" }).click();
  await wait(600);
  await closeDrawer();
  const updated = await page
    .locator(".record-row")
    .filter({ hasText: "Layers design systems" })
    .innerText();
  assert.ok(updated.includes("$7,200"), updated);
  await page.reload();
  await wait(900);
  await page
    .locator(".record-row")
    .filter({ hasText: "Layers design systems" })
    .locator(".record-link")
    .click();
  await wait();
  const reopened = await drawer();
  assert.ok((await reopened.innerText()).includes("$7,200"), await reopened.innerText());
  await closeDrawer();
  await nav("Companies");
});

await step("open record and inline edit a field", async () => {
  await page.locator(".record-row").filter({ hasText: "Boltshift" }).locator(".record-link").click();
  await wait();
  const record = await drawer();
  assert.ok((await record.innerText()).includes("Boltshift"));
  await record.getByRole("button", { name: "Edit Account tier" }).click();
  await pick(record, "Account tier", "Strategic");
  await wait();
  assert.ok((await record.innerText()).includes("Strategic"));
  await shot("03-record-drawer", false);
  await closeDrawer();
});

await step("edit persists after reload", async () => {
  await page.reload({ waitUntil: "networkidle" });
  await wait(500);
  await page.locator(".record-row").filter({ hasText: "Boltshift" }).locator(".record-link").click();
  await wait();
  assert.ok((await (await drawer()).innerText()).includes("Strategic"));
  await closeDrawer();
});

await step("create a company with typed fields", async () => {
  await page.locator(".page-header").getByRole("button", { name: "New company", exact: true }).click();
  await wait();
  const record = await drawer();
  await record.getByLabel("Company name").fill("Playwright Labs");
  await record.getByLabel("Domain").fill("playwright.example");
  await pick(record, "Industry", "Technology");
  await pick(record, "Account tier", "Growth");
  await record.getByLabel("Employees").fill("42");
  await record.getByRole("button", { name: "Create company" }).click();
  await wait(500);
  await page.getByLabel("Search this view").fill("Playwright Labs");
  await wait();
  assert.ok((await body()).includes("Playwright Labs"));
  await shot("04-created-company");
});

await step("inline table edit changes the value", async () => {
  await page.getByLabel("Edit Employees for Playwright Labs").click();
  const editor = page.locator(".field-editor input");
  await editor.fill("55");
  await page.keyboard.press("Enter");
  await wait();
  assert.equal(await page.locator(".field-editor").count(), 0);
  assert.ok((await body()).includes("55"));
  await page.getByLabel("Search this view").fill("");
  await wait();
});

await step("filter records and save a named view", async () => {
  await page.locator(".view-actions").getByRole("button", { name: /Filter/ }).click();
  assert.ok(await page.getByRole("dialog", { name: "Filters" }).isVisible());
  await page.getByRole("button", { name: /Add condition/ }).click();
  await wait();
  const row = page.locator(".filter-row").last();
  await pick(row, "Filter field", "Industry");
  await pick(row, "Filter operator", "is");
  await pick(row, "Filter value", "Technology");
  await page.getByRole("button", { name: "Apply filter changes" }).click();
  await wait();
  const filtered = await page.locator(".record-row").count();
  assert.equal(filtered, 4);
  await page.locator(".view-actions").getByRole("button", { name: /Save view/ }).click();
  await page.locator(".save-view-form").getByLabel("View name").fill("Tech accounts");
  await page.locator(".save-view-form").getByRole("button", { name: "Save view" }).click();
  await wait(500);
  assert.ok((await body()).includes("Tech accounts"));
  await shot("05-filtered-saved-view");
});

await step("saved view tab survives reload", async () => {
  await page.reload({ waitUntil: "networkidle" });
  await wait(500);
  assert.ok((await body()).includes("Tech accounts"));
});

await step("sort opens a menu from the toolbar", async () => {
  await page.locator(".view-actions").getByRole("button", { name: "Sort", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Sort" });
  assert.ok(await menu.isVisible());
  await pick(menu, "Sort field", "Annual revenue");
  await wait();
  await page.keyboard.press("Escape");
  await wait();
  assert.equal(await page.getByRole("dialog", { name: "Sort" }).count(), 0);
});

await step("filter changes can be discarded", async () => {
  const trigger = page.locator(".view-actions").getByRole("button", { name: /^Filter/ });
  const before = (await trigger.innerText()).trim();
  await trigger.click();
  assert.ok(await page.getByRole("dialog", { name: "Filters" }).isVisible());
  await page.getByRole("button", { name: /Add condition/ }).click();
  await pick(page.locator(".filter-panel"), "Filter field", "Industry");
  await page.getByRole("button", { name: "Discard filter changes" }).click();
  await wait();
  assert.equal(await page.getByRole("dialog", { name: "Filters" }).count(), 0);
  assert.equal((await trigger.innerText()).trim(), before);
});

await step("board and calendar layouts render", async () => {
  await page.getByLabel("Board layout").click();
  await wait();
  assert.ok((await page.locator(".board-column").count()) >= 1);
  await shot("06-board");
  await page.getByLabel("Calendar layout").click();
  await wait();
  assert.ok((await page.locator(".calendar-grid").count()) === 1);
  await shot("07-calendar");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await wait();
  assert.ok((await page.locator(".calendar-agenda").count()) === 1);
  await shot("07b-agenda");
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await wait();
  await page.getByLabel("Table layout").click();
  await wait();
});

await step("opportunity stage edit fires a workflow", async () => {
  await nav("Opportunities");
  const row = page.locator(".record-row").filter({ hasText: "Layers design systems" });
  await row.locator(".record-link").click();
  await wait();
  const record = await drawer();
  await record.getByRole("button", { name: "Edit Stage" }).click();
  await pick(record, "Stage", "Negotiation");
  await wait(500);
  await closeDrawer();
  await nav("Workflows");
  await wait();
  const text = await body();
  assert.ok(text.includes("Recent runs"));
  assert.ok(
    text.includes("Layers design systems → Send implementation plan"),
    text.slice(0, 500),
  );
  await shot("08-workflows-run");
});

await step("workflow-created task is linked", async () => {
  await nav("Tasks");
  assert.ok((await body()).includes("Send implementation plan"));
  await shot("09-tasks");
});

await step("studio builds and runs a new workflow", async () => {
  await nav("Workflows");
  await page.getByRole("button", { name: "New workflow", exact: true }).click();
  await wait();
  assert.ok(await page.locator(".studio").isVisible());
  await page.getByLabel("Workflow name").fill("Studio follow-up");
  await page.locator(".studio-widget").filter({ hasText: "Create task" }).click();
  await wait();
  assert.equal(await page.locator(".studio-node").count(), 2);
  await page.getByLabel("Task title").fill("Studio check-in");
  await page.getByLabel("Connect from Trigger").click();
  await page.getByLabel("Connect into Studio check-in").click();
  await wait();
  assert.ok((await page.locator(".studio-edge").count()) >= 1);
  await shot("08b-studio", false);
  await page.getByRole("button", { name: "Save workflow" }).click();
  await wait(600);
  assert.ok((await body()).includes("Studio follow-up"));

  await nav("Opportunities");
  await page
    .locator(".record-row")
    .filter({ hasText: "FeatherDev growth package" })
    .locator(".record-link")
    .click();
  await wait();
  const record = await drawer();
  await record.getByRole("button", { name: "Edit Stage" }).click();
  await pick(record, "Stage", "Negotiation");
  await wait(500);
  await closeDrawer();
  await nav("Workflows");
  assert.ok((await body()).includes("Studio check-in"));
  await nav("Tasks");
  assert.ok((await body()).includes("Studio check-in"));

  await nav("Workflows");
  await page.getByLabel("Delete Studio follow-up").click();
  await confirmDialog();
  await wait(400);
  assert.equal(
    await page.locator(".workflow-card").filter({ hasText: "Studio follow-up" }).count(),
    0,
  );
});

await step("log an email and show it in the timeline", async () => {
  await nav("Opportunities");
  await page.locator(".record-row").filter({ hasText: "Layers design systems" }).locator(".record-link").click();
  await wait();
  const record = await drawer();
  await record.getByRole("button", { name: "Email" }).click();
  await wait();
  const composer = page.locator(".email-composer");
  assert.ok((await composer.getByLabel("Subject").inputValue()).includes("Layers design systems"));
  assert.ok((await composer.innerText()).includes("Log an email"));
  await composer.getByRole("button", { name: "Log email" }).click();
  await wait(500);
  const recordAgain = await drawer();
  await recordAgain.getByRole("tab", { name: "timeline" }).click();
  await wait();
  assert.ok((await recordAgain.innerText()).includes("Following up on Layers design systems"));
  await shot("10-record-timeline", false);
  await closeDrawer();
});

await step("dashboard widget can be added", async () => {
  await nav("Dashboards");
  await page.getByRole("tab", { name: "Custom widgets" }).click();
  await wait();
  assert.ok((await body()).includes("Deal value by stage"));
  await page.getByRole("button", { name: "Add widget" }).first().click();
  const form = page.locator(".widget-form");
  await form.getByLabel("Title").fill("Playwright widget");
  await pick(form, "Records", "Opportunities");
  await pick(form, "Group by", "Stage");
  await pick(form, "Measure", "Record count");
  await pick(form, "Visualization", "Bar");
  await pick(form, "Width", "Half");
  await form.getByRole("button", { name: "Add widget" }).click();
  await wait(500);
  assert.ok((await body()).includes("Playwright widget"));
  await shot("11-dashboards");
});

await step("assistant answers workspace questions locally", async () => {
  await nav("Liner");
  await page.getByLabel("Message Liner").fill("How many companies do I have?");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.locator(".liner-message.assistant").last().waitFor({ state: "visible", timeout: 8000 });
  const text = await page.locator(".liner-message.assistant").last().innerText();
  assert.match(text, /You have \d+ companies in your workspace/);
  await shot("12-assistant");
});

if (process.env.EXPLABS_API_KEY) {
  await step("gpt-6-luna answers a workspace question", async () => {
    await nav("Liner");
    await page
      .getByLabel("Message Liner")
      .fill("Which opportunity should I focus on this week?");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.locator(".liner-message.assistant").last().waitFor({ state: "visible", timeout: 60_000 });
    const text = await page.locator(".liner-message.assistant").last().innerText();
    assert.ok(text.length > 30);

    await page.locator(".ai-chat-card").scrollIntoViewIfNeeded();
    await wait(200);
    await shot("22-assistant-gpt", false);
  });

  await step("experiential clef-flash prioritizes the pipeline", async () => {
    await nav("Liner");
    await page.getByRole("button", { name: "Prioritize pipeline" }).click();
    await page.locator(".ai-result").waitFor({ state: "visible", timeout: 60_000 });
    const text = await page.locator(".ai-result").innerText();
    assert.match(text, /% confidence/);
    assert.match(text, /in ·/);
    assert.match(text, /out tokens/);
    await page.locator(".ai-result").scrollIntoViewIfNeeded();
    await wait(200);
    await shot("18-assistant-ai", false);
  });

  await step("experiential risk review scores open deals", async () => {
    await nav("Liner");
    await page.getByRole("button", { name: "Review deal risk" }).click();
    await page.locator(".ai-result.ai-risk").waitFor({ state: "visible", timeout: 60_000 });
    const text = await page.locator(".ai-result.ai-risk").innerText();
    assert.match(text, /Deal risk review/);
    assert.match(text, /%/);
    await page.locator(".ai-result.ai-risk").scrollIntoViewIfNeeded();
    await wait(200);
    await shot("19-assistant-risk", false);
  });

  await step("experiential custom decision scores a yes / no question", async () => {
    await nav("Liner");
    await page
      .getByLabel("Custom yes / no decision")
      .fill("Is the forecast likely to land this quarter?");
    await page.getByRole("button", { name: "Run decision" }).click();
    await page.locator(".ai-result.ai-custom").waitFor({ state: "visible", timeout: 60_000 });
    const text = await page.locator(".ai-result.ai-custom").innerText();
    assert.match(text, /\d+%/);
    assert.match(text, /likely true/);
    await page.locator(".ai-result.ai-custom").scrollIntoViewIfNeeded();
    await wait(200);
    await shot("20-assistant-custom", false);
  });

  await step("settings integrations reports the Experiential connection", async () => {
    await nav("Settings");
    await page.getByRole("button", { name: "Integrations" }).click();
    await wait();
    const text = await body();
    assert.ok(text.includes("Liner"));
    assert.ok(text.includes("configured"));
    await page.locator(".panel-card").filter({ hasText: "Session API key" }).scrollIntoViewIfNeeded();
    await wait(200);
    await shot("21-settings-ai", false);
  });
} else {
  console.log("• experiential AI step skipped (EXPLABS_API_KEY is not set)");
}

await step("command menu searches and opens records", async () => {
  await page.keyboard.press("Control+k");
  await wait();
  const menu = page.locator(".command-menu");
  assert.ok(await menu.isVisible());
  await menu.locator("input").fill("Layers");
  await wait();
  await menu.locator(".command-item").filter({ hasText: /^Layers$/ }).first().click();
  await wait();
  assert.ok((await (await drawer()).innerText()).includes("Layers"));
  await closeDrawer();
});

await step("settings adds a custom field and object", async () => {
  await nav("Settings");
  await page.getByRole("button", { name: "Data model" }).click();
  await wait();
  const fieldCard = page.locator(".panel-card").filter({ hasText: "Add a field" }).last();
  await fieldCard.getByLabel("Field name").fill("Playwright field");
  await pick(fieldCard, "Type", "text");
  await fieldCard.getByRole("button", { name: "Add field" }).click();
  await wait();
  assert.ok((await body()).includes("Field added."));
  const objectCard = page.locator(".panel-card").filter({ hasText: "Create a custom object" }).last();
  await objectCard.getByLabel("Singular name").fill("Property");
  await objectCard.getByLabel("Plural name").fill("Properties");
  await objectCard.getByRole("button", { name: "Create object" }).click();
  await wait(600);
  assert.ok((await body()).includes("Properties"));
  await shot("13-custom-object");
});

await step("trash deletes and restores a record", async () => {
  await nav("Companies");
  await page.getByLabel("Search this view").fill("Playwright Labs");
  await wait();
  await page.locator(".record-row").filter({ hasText: "Playwright Labs" }).locator(".record-link").click();
  await wait();
  await page.getByRole("button", { name: "Move to trash" }).click();
  await confirmDialog();
  await nav("Settings");
  await page.getByRole("button", { name: "Trash" }).click();
  await wait();
  assert.ok((await body()).includes("Playwright Labs"));
  await page.getByRole("button", { name: "Restore" }).first().click();
  await wait(500);
  assert.ok((await body()).includes("Trash is empty"));
});

await step("dark theme applies", async () => {
  await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await wait(400);
  assert.ok((await page.locator("html").getAttribute("class")).includes("dark"));
  await nav("Overview");
  await wait();
  const iconColors = await page
    .locator(".kpi-icon")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
  assert.ok(iconColors.length >= 3);
  assert.equal(new Set(iconColors).size, 1);
  await shot("14-dark-overview");
  await nav("Settings");
  await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await wait();
});

await step("backup download works", async () => {
  await page.getByRole("button", { name: "Data", exact: true }).click();
  await wait();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export backup" }).click(),
  ]);
  assert.match(download.suggestedFilename(), /linear-crm-backup.*\.json/);
});

await step("bulk edit updates selected rows", async () => {
  await nav("Companies");
  await page.getByLabel("Search this view").fill("");
  await wait();
  const rows = page.locator(".record-row");
  await rows.nth(0).locator('input[type="checkbox"]').check();
  await rows.nth(1).locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Edit selected" }).click();

  const panel = page.getByRole("dialog", { name: "Edit selected records" });
  await panel.waitFor();
  await shot("bulk-edit-panel", false);
  assert.match(await panel.innerText(), /Edit 2 records/);

  await pick(panel, "Bulk edit field", "Account tier");
  await pick(panel, "Account tier", "Standard");
  await page.keyboard.press("Escape");
  await wait(250);
  assert.equal(await panel.count(), 0);
  assert.ok((await body()).includes("2 selected"));

  await page.getByRole("button", { name: "Edit selected" }).click();
  const reopened = page.getByRole("dialog", { name: "Edit selected records" });
  await pick(reopened, "Bulk edit field", "Account tier");
  await pick(reopened, "Account tier", "Standard");
  await reopened.getByRole("button", { name: "Apply to 2" }).click();
  await wait(500);
  assert.ok((await body()).includes("2 selected") === false);
});

await step("CSV export and import round-trip", async () => {
  await nav("Companies");
  await page.getByLabel("Search this view").fill("");
  await wait();
  await page.getByRole("button", { name: "Options" }).click();
  const sheet = page.locator(".modal-sheet");
  const [csvDownload] = await Promise.all([
    page.waitForEvent("download"),
    sheet.getByRole("button", { name: "Export view" }).click(),
  ]);
  assert.match(csvDownload.suggestedFilename(), /\.csv$/);
  fs.writeFileSync(
    "tmp-import.csv",
    "Name,Domain,Industry,Account tier,Employees,Annual revenue\nCSV Imported,csvimported.example,Technology,Growth,12,1200000\n",
  );
  await sheet.locator('input[type="file"]').setInputFiles("tmp-import.csv");
  await wait(500);
  assert.ok((await sheet.innerText()).includes("ready to import"));
  await sheet.getByRole("button", { name: "Confirm import" }).click();
  await wait(500);
  assert.ok((await sheet.innerText()).includes("Import complete"));
  await sheet.getByRole("button", { name: "Close" }).click();
  await wait();
  assert.ok((await body()).includes("CSV Imported"));
});

await step("attachments, favourites, duplication and custom-field editing", async () => {
  await page.getByLabel("Search this view").fill("Playwright Labs");
  await wait();
  await page.locator(".record-row").filter({ hasText: "Playwright Labs" }).locator(".record-link").click();
  await wait();
  const record = await drawer();
  assert.ok((await record.innerText()).includes("Playwright field"));
  await record.getByRole("button", { name: "Edit Playwright field" }).click();
  await record.locator(".field-editor input").fill("Covered by Playwright");
  await page.keyboard.press("Enter");
  await wait();
  assert.equal(await record.locator(".field-editor").count(), 0);
  assert.ok((await record.innerText()).includes("Covered by Playwright"));
  await record.getByRole("button", { name: "Add to favorites" }).click();
  await wait();
  assert.ok(await record.getByRole("button", { name: "Remove from favorites" }).isVisible());
  await record.getByRole("tab", { name: /files/i }).click();
  await wait();
  await record.locator('input[type="file"]').setInputFiles({
    name: "call-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Discovery call notes"),
  });
  await wait(500);
  assert.ok((await record.innerText()).includes("call-notes.txt"));
  await record.getByRole("button", { name: "Duplicate record" }).click();
  await wait();
  const copy = await drawer();
  assert.ok((await copy.getByLabel("Company name").inputValue()).endsWith("(copy)"));
  await closeDrawer();
});

await step("member management adds an owner option", async () => {
  await nav("Settings");
  await page.getByRole("button", { name: "Members", exact: true }).click();
  await wait();
  await page.getByPlaceholder("New member name").fill("Taylor Reed");
  await page.getByRole("button", { name: "Add member" }).click();
  await wait(400);
  assert.ok((await body()).includes("Taylor Reed"));
});

await step("board drag moves an opportunity stage", async () => {
  await nav("Opportunities");
  await page.getByLabel("Board layout").click();
  await wait(400);
  const target = page.locator(".board-column", { hasText: "Negotiation" }).first();
  const source = page
    .locator('.board-cards [role="button"]')
    .filter({ hasText: "FeatherDev growth package" });
  await source.dragTo(target);
  await wait(700);
  assert.ok((await target.innerText()).includes("FeatherDev growth package"));
  await shot("17-board-drag");
  await page.getByLabel("Table layout").click();
  await wait();
});

await step("calendar exports an .ics feed", async () => {
  await nav("Companies");
  await page.getByLabel("Search this view").fill("");
  await wait();
  await page.getByLabel("Calendar layout").click();
  await wait(400);
  const [ics] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Export .ics/ }).click(),
  ]);
  assert.match(ics.suggestedFilename(), /\.ics$/);
  await page.getByLabel("Table layout").click();
  await wait();
});

await step("mobile navigation and layout", async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}#overview`, { waitUntil: "networkidle" });
  await wait(500);
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await wait(250);
  assert.ok(await page.locator(".app-sidebar").isVisible());
  await shot("15-mobile-menu", false);
  await page.getByRole("button", { name: "Companies", exact: true }).click();
  await wait(300);
  await shot("16-mobile-companies", false);
});

console.log("PAGE ERRORS:", pageErrors.length ? pageErrors : "none");
console.log("CONSOLE ERRORS:", consoleErrors.length ? consoleErrors : "none");
assert.equal(pageErrors.length, 0, "page errors found");

await browser.close();
console.log("E2E COMPLETE");

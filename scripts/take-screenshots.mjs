import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 4817;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve("docs/images");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Check if server is already running, or spawn python http server
async function ensureServer() {
  try {
    const res = await fetch(`${BASE}/index.html`);
    if (res.ok) {
      console.log("Server already running on port", PORT);
      return null;
    }
  } catch (e) {}

  console.log("Starting python http.server on port", PORT);
  const proc = spawn("python", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    stdio: "ignore",
  });
  // Wait for server to become responsive
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}/index.html`);
      if (res.ok) {
        console.log("Server ready!");
        return proc;
      }
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Server failed to start");
}

const serverProc = await ensureServer();

try {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // HiDPI / Retina quality
  });

  const page = await context.newPage();

  // 1. Landing Hero
  console.log("Capturing 01-landing-hero.png...");
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, "01-landing-hero.png"), clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // 2. CRM Workspace Overview
  console.log("Capturing 02-workspace-overview.png...");
  await page.goto(`${BASE}/app.html#overview`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, "02-workspace-overview.png") });

  // 3. Companies & Record Drawer
  console.log("Capturing 03-companies-table.png...");
  await page.getByRole("button", { name: "Companies", exact: true }).click();
  await page.waitForTimeout(400);
  // Click first company row to open drawer
  const companyRow = page.locator("tbody tr").first();
  if (await companyRow.count() > 0) {
    await companyRow.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "03-companies-table.png") });

  // Close drawer
  const closeBtn = page.getByRole("button", { name: "Close record" });
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // 4. Opportunities Kanban Board
  console.log("Capturing 04-opportunities-kanban.png...");
  await page.getByRole("button", { name: "Opportunities", exact: true }).click();
  await page.waitForTimeout(400);
  // Switch to Board view
  const boardBtn = page.getByRole("button", { name: "Board", exact: true });
  if (await boardBtn.count() > 0) {
    await boardBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "04-opportunities-kanban.png") });

  // 5. Workflow Studio
  console.log("Capturing 05-workflow-studio.png...");
  await page.getByRole("button", { name: "Workflows", exact: true }).click();
  await page.waitForTimeout(500);
  // Open the first workflow into the Studio canvas
  const firstWorkflow = page.locator(".workflow-open").first();
  if (await firstWorkflow.count() > 0) {
    await firstWorkflow.click();
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "05-workflow-studio.png") });
  // Close studio if close button exists
  const studioClose = page.getByRole("button", { name: /close studio|back|close/i }).first();
  if (await studioClose.count() > 0) {
    await studioClose.click();
    await page.waitForTimeout(300);
  }

  // 6. Leads & Pipeline
  console.log("Capturing 06-leads-pipeline.png...");
  await page.getByRole("button", { name: "Leads", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "06-leads-pipeline.png") });

  // 7. Tasks & Recurrence Manager
  console.log("Capturing 07-tasks-manager.png...");
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "07-tasks-manager.png") });

  // 8. Dark Mode View
  console.log("Capturing 08-dark-mode-overview.png...");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.waitForTimeout(300);
  // Toggle dark mode (theme button)
  const themeToggle = page.locator("button:has(svg.tabler-icon-moon)").first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "08-dark-mode-overview.png") });

  console.log("All screenshots captured successfully!");
  await browser.close();
} finally {
  if (serverProc) {
    serverProc.kill();
  }
}

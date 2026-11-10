import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message, e.stack));
page.on("console", (m) => console.log("CONSOLE", m.type(), m.text()));
page.on("dialog", (d) => { console.log("DIALOG:", d.message()); d.accept(); });

await page.goto("http://127.0.0.1:4817/app.html", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: "Companies", exact: true }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "New company", exact: true }).click();
await page.waitForTimeout(300);

const drawer = page.locator(".record-drawer");
await drawer.getByLabel("Company name").fill("Playwright Labs");
await drawer.getByLabel("Domain").fill("playwright.example");
await drawer.getByLabel("Industry").selectOption("Technology");
await drawer.getByLabel("Account tier").selectOption("Growth");
await drawer.getByLabel("Employees").fill("42");
console.log("FORM BEFORE:", await drawer.innerText());
await drawer.getByRole("button", { name: "Create company" }).click();
await page.waitForTimeout(900);
console.log("DRAWER COUNT:", await page.locator(".record-drawer").count());
console.log("BODY:", (await page.locator("body").innerText()).slice(-1200));
const data = await page.evaluate(() => {
  const raw = localStorage.getItem("linear-crm.v1");
  const parsed = JSON.parse(raw);
  return {
    companies: parsed.companies.length,
    names: parsed.companies.slice(0, 3).map((c) => c.name),
    activity: parsed.activity.slice(0, 3).map((a) => a.text),
  };
});
console.log("STORAGE:", data);
await page.screenshot({ path: "screenshots/debug-create.png", fullPage: false });
await browser.close();

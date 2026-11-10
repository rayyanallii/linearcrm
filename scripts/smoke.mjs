import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4817/app.html";
const shots = "screenshots";
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 920 } });
const page = await context.newPage();
const errors = [];

page.on("pageerror", (error) => errors.push(`PAGEERROR: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`);
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
console.log("TITLE:", await page.title());
console.log("BODY HEAD:", (await page.locator("body").innerText()).slice(0, 700));
await page.screenshot({ path: `${shots}/01-overview.png`, fullPage: true });

await page.getByRole("button", { name: "Companies", exact: true }).click();
await page.waitForTimeout(400);
console.log("COMPANIES HEAD:", (await page.locator("body").innerText()).slice(0, 900));
await page.screenshot({ path: `${shots}/02-companies.png`, fullPage: true });

console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();

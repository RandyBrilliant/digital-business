import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:4173";
const ART = "/opt/cursor/artifacts";
const SESSIONS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const VIEWPORTS = [
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1024x768", width: 1024, height: 768 }
];

fs.mkdirSync(ART, { recursive: true });

function overflowCheck() {
  const stage = document.querySelector(".stage");
  const slide = document.querySelector(".slide.is-active");
  if (!stage || !slide) return { ok: false, reason: "missing stage/slide" };
  const inner = slide.querySelector(".slide-inner") || slide;
  const issues = [];
  if (inner.scrollHeight > inner.clientHeight + 4) {
    issues.push(`inner scrollHeight ${inner.scrollHeight} > clientHeight ${inner.clientHeight}`);
  }
  if (inner.scrollWidth > inner.clientWidth + 4) {
    issues.push(`inner scrollWidth ${inner.scrollWidth} > clientWidth ${inner.clientWidth}`);
  }
  const stageBox = stage.getBoundingClientRect();
  const nodes = slide.querySelectorAll("h1,h2,h3,p,li,td,th,.card,.stat,.callout,.funnel-band");
  nodes.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const pad = 3;
    if (r.right > stageBox.right + pad || r.bottom > stageBox.bottom + pad) {
      issues.push(`${el.tagName}.${el.className} clipped ${Math.round(r.right)}/${Math.round(r.bottom)} vs stage ${Math.round(stageBox.right)}/${Math.round(stageBox.bottom)}`);
    }
  });
  return { ok: issues.length === 0, issues: issues.slice(0, 8) };
}

const report = [];

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(ART, "hub.png"), fullPage: true });
report.push({ page: "hub", viewport: "1440x900", ok: true });

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const id of SESSIONS) {
    await page.goto(`${BASE}/sessions/${id}.html#slide-1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(80);
    const total = await page.locator(".slide").count();
    for (let i = 1; i <= total; i++) {
      await page.evaluate((n) => { location.hash = "#slide-" + n; }, i);
      await page.waitForTimeout(40);
      const result = await page.evaluate(overflowCheck);
      const row = { session: id, slide: i, viewport: vp.name, ok: result.ok, issues: result.issues || [] };
      report.push(row);
      if (id === "03" && vp.name === "1920x1080") {
        const name = `s03-slide-${String(i).padStart(2, "0")}.png`;
        await page.screenshot({ path: path.join(ART, name) });
      }
    }
  }
}

await browser.close();
const fails = report.filter((r) => r.ok === false);
fs.writeFileSync(path.join(ART, "qa-report.json"), JSON.stringify({ fails, total: report.length }, null, 2));
console.log("checked", report.length, "failing", fails.length);
for (const f of fails.slice(0, 40)) {
  console.log(JSON.stringify(f));
}
if (fails.length > 40) console.log("…", fails.length - 40, "more");
process.exit(fails.length ? 1 : 0);

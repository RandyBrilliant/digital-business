import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:4173";
const ART = "/opt/cursor/artifacts";
const ALL = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const SESSIONS = (process.env.QA_SESSIONS || ALL.join(",")).split(",").map((s) => s.trim()).filter(Boolean);
const VIEWPORTS = [
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1024x768", width: 1024, height: 768 }
];
const MIN_TEXT = 28;
const MAX_EMPTY = 0.45;

fs.mkdirSync(ART, { recursive: true });

function slideAudit() {
  const stage = document.querySelector(".stage");
  const slide = document.querySelector(".slide.is-active");
  if (!stage || !slide) return { ok: false, overflow: ["missing stage/slide"], text: [], empty: 1 };

  const inner = slide.querySelector(".slide-inner") || slide;
  const overflow = [];
  if (inner.scrollHeight > inner.clientHeight + 4) {
    overflow.push(`inner scrollHeight ${inner.scrollHeight} > clientHeight ${inner.clientHeight}`);
  }
  if (inner.scrollWidth > inner.clientWidth + 4) {
    overflow.push(`inner scrollWidth ${inner.scrollWidth} > clientWidth ${inner.clientWidth}`);
  }

  const stageBox = stage.getBoundingClientRect();
  const scale = stageBox.width / 1920;
  const text = [];
  const skip = new Set(["SCRIPT", "STYLE", "ASIDE"]);
  const walker = document.createTreeWalker(inner, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (skip.has(el.tagName)) continue;
    if (el.closest(".notes, .help, .chrome, .progress")) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    const raw = (el.childNodes.length ? Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("") : "");
    const own = raw.replace(/\s+/g, " ").trim();
    if (!own) continue;
    const px = parseFloat(style.fontSize) / scale;
    if (px + 0.2 < 28) {
      text.push(`${el.tagName}.${(el.className || "").toString().slice(0, 40)} ${Math.round(px)}px “${own.slice(0, 32)}”`);
    }
  }

  const content = [];
  inner.querySelectorAll("*").forEach((el) => {
    if (el.closest(".notes")) return;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const bg = style.backgroundColor;
    const filled = (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent")
      || el.tagName === "IMG"
      || el.tagName === "SVG"
      || (el.textContent || "").trim().length > 0;
    if (!filled) return;
    content.push({
      x: r.left - stageBox.left,
      y: r.top - stageBox.top,
      w: r.width,
      h: r.height
    });
  });

  const cols = 48;
  const rows = 27;
  const hit = new Uint8Array(cols * rows);
  for (const b of content) {
    const x0 = Math.max(0, Math.floor((b.x / stageBox.width) * cols));
    const y0 = Math.max(0, Math.floor((b.y / stageBox.height) * rows));
    const x1 = Math.min(cols - 1, Math.floor(((b.x + b.w) / stageBox.width) * cols));
    const y1 = Math.min(rows - 1, Math.floor(((b.y + b.h) / stageBox.height) * rows));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) hit[y * cols + x] = 1;
    }
  }
  let filledCells = 0;
  for (const v of hit) filledCells += v;
  const empty = 1 - filledCells / (cols * rows);

  return {
    ok: overflow.length === 0 && text.length === 0 && empty <= 0.45,
    overflow,
    text: text.slice(0, 12),
    empty: Number(empty.toFixed(3))
  };
}

const report = [];
const browser = await chromium.launch();
const page = await browser.newPage();

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const id of SESSIONS) {
    await page.goto(`${BASE}/sessions/${id}.html#slide-1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(80);
    const total = await page.locator(".slide").count();
    for (let i = 1; i <= total; i++) {
      await page.evaluate((n) => { location.hash = "#slide-" + n; }, i);
      await page.waitForTimeout(50);
      const result = await page.evaluate(slideAudit);
      report.push({
        session: id,
        slide: i,
        viewport: vp.name,
        ok: result.ok,
        empty: result.empty,
        overflow: result.overflow || [],
        text: result.text || []
      });
    }
  }
}

await browser.close();
const fails = report.filter((r) => !r.ok);
fs.writeFileSync(path.join(ART, "qa-report.json"), JSON.stringify({ fails, total: report.length, minText: MIN_TEXT, maxEmpty: MAX_EMPTY }, null, 2));
console.log("checked", report.length, "failing", fails.length);
for (const f of fails.slice(0, 60)) {
  console.log(JSON.stringify(f));
}
if (fails.length > 60) console.log("…", fails.length - 60, "more");
process.exit(fails.length ? 1 : 0);

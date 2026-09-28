import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:4173";
const ART = "/opt/cursor/artifacts";
const TMP = "/tmp/v5-tiles";
fs.mkdirSync(ART, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

function compose(outName, tiles) {
  const py = `
from PIL import Image, ImageDraw, ImageFont
import os
tiles = ${JSON.stringify(tiles)}
out = ${JSON.stringify(path.join(ART, outName))}
tw, th, gap, pad, lab = 1280, 720, 36, 48, 52
cols, rows = 2, 2
W = pad * 2 + cols * tw + gap
H = pad * 2 + rows * (th + lab) + gap
img = Image.new("RGB", (W, H), (8, 14, 26))
draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
except Exception:
    font = ImageFont.load_default()
for i, t in enumerate(tiles):
    r, c = divmod(i, 2)
    x = pad + c * (tw + gap)
    y = pad + r * (th + lab + gap)
    if t.get("path") and os.path.exists(t["path"]):
        tile = Image.open(t["path"]).convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        img.paste(tile, (x, y))
    else:
        draw.rectangle([x, y, x+tw, y+th], fill=(12, 22, 40))
    draw.text((x, y + th + 10), t.get("label", ""), fill=(244, 247, 251), font=font)
img.save(out, "PNG", optimize=True)
print(out)
`;
  const res = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stderr);
    throw new Error("compose failed " + outName);
  }
  console.log(res.stdout.trim());
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });

async function shot(sess, slide, dest) {
  await page.goto(`${BASE}/sessions/${sess}.html#slide-${slide}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(80);
  await page.screenshot({ path: dest });
}

for (let i = 1; i <= 23; i++) {
  const dest = path.join(TMP, `s03-${String(i).padStart(2, "0")}.png`);
  await shot("03", i, dest);
}

const groups = [
  ["v5-s03-sheet-01-04.png", [1, 2, 3, 4]],
  ["v5-s03-sheet-05-08.png", [5, 6, 7, 8]],
  ["v5-s03-sheet-09-12.png", [9, 10, 11, 12]],
  ["v5-s03-sheet-13-16.png", [13, 14, 15, 16]],
  ["v5-s03-sheet-17-20.png", [17, 18, 19, 20]],
  ["v5-s03-sheet-21-23.png", [21, 22, 23]]
];
for (const [name, ids] of groups) {
  compose(name, ids.map((n) => ({
    path: path.join(TMP, `s03-${String(n).padStart(2, "0")}.png`),
    label: `slide${String(n).padStart(2, "0")}`
  })));
}

const other = [
  { sess: "01", slide: 1, label: "S01 · 01 title" },
  { sess: "06", slide: 1, label: "S06 · 01 title" },
  { sess: "02", slide: 5, label: "S02 · 05 Indonesia map" },
  { sess: "09", slide: 8, label: "S09 · 08 Warung Sari" }
];
for (const o of other) {
  o.path = path.join(TMP, `other-${o.sess}-${o.slide}.png`);
  await shot(o.sess, o.slide, o.path);
}
compose("v5-other-sheet.png", other);

await browser.close();

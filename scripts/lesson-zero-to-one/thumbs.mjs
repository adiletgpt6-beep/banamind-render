// Пять обложек BM-010: рендер PNG (своя точка входа src/books/peter-thiel-zero-to-one/index.tsx),
// затем общие проверки и листы канала: scripts/books/thumbnails.mjs --skip-render
// (JPEG ≤ 2 МБ, орфография Hunspell, различие, comparison-sheet, readability-320x180)
// и thumbnail-contact-sheet.jpg (= comparison-sheet) для галереи.
//   node scripts/lesson-zero-to-one/thumbs.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const SLUG = "peter-thiel-zero-to-one";
const RAW = `out/thumbs/${SLUG}`;
mkdirSync(RAW, { recursive: true });
const serveUrl = await bundle({ entryPoint: `src/books/${SLUG}/index.tsx` });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
for (const n of [1, 2, 3, 4, 5]) {
  const composition = await selectComposition({ serveUrl, id: `thumb-${SLUG}-${n}`, browserExecutable });
  await renderStill({ serveUrl, composition, frame: 0, output: `${RAW}/${n}.png`, imageFormat: "png", browserExecutable });
  console.log(`✓ ${RAW}/${n}.png`);
}
let failed = false;
try {
  execFileSync("node", ["scripts/books/thumbnails.mjs", SLUG, "--skip-render"], { stdio: "inherit" });
} catch {
  failed = true;
}
copyFileSync(`books/${SLUG}/thumbnails/comparison-sheet.jpg`, `books/${SLUG}/thumbnails/thumbnail-contact-sheet.jpg`);
if (failed) process.exit(1);

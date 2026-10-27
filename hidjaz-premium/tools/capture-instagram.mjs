// Один публичный просмотр профиля Instagram без входа (как обычный посетитель
// в браузере): скриншоты, мета-теги, подписи и изображения постов.
// Не логинится, не обходит ограничения, не использует скрытые API.
// Чтение в человеческом темпе: профиль + до MAX_POSTS публичных постов.
//
// node hidjaz-premium/tools/capture-instagram.mjs <handle> <outDir> [maxPosts]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const handle = process.argv[2] ?? "hidjaz.premium";
const OUT = process.argv[3] ?? `hidjaz-premium/research/capture/${handle}`;
const MAX_POSTS = Number(process.argv[4] ?? 12);
mkdirSync(join(OUT, "img"), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = { handle, url: `https://www.instagram.com/${handle}/`, capturedAt: new Date().toISOString(), profile: null, posts: [], images: [], notes: [] };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  locale: "ru-RU",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();

const dismiss = async () => {
  for (const label of ["Разрешить все cookie", "Allow all cookies", "Отклонить необязательные файлы cookie", "Decline optional cookies", "Не сейчас", "Not now"]) {
    const b = page.getByRole("button", { name: label });
    if (await b.count().catch(() => 0)) await b.first().click({ timeout: 2000 }).catch(() => {});
  }
  const close = page.locator('svg[aria-label="Закрыть"], svg[aria-label="Close"]');
  if (await close.count().catch(() => 0)) await close.first().click({ timeout: 2000 }).catch(() => {});
};

const meta = async () =>
  page.evaluate(() => {
    const m = {};
    for (const el of document.querySelectorAll("meta[property], meta[name]")) {
      const k = el.getAttribute("property") || el.getAttribute("name");
      if (/^(og:|description|twitter:|al:)/.test(k)) m[k] = el.getAttribute("content");
    }
    m.title = document.title;
    return m;
  });

const images = [];
const saveImg = async (src, tag) => {
  if (!src || images.some((i) => i.src === src) || images.length >= 60) return null;
  try {
    const r = await ctx.request.get(src, { timeout: 20000 });
    if (!r.ok()) return null;
    const ct = r.headers()["content-type"] || "";
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
    const file = `img/${String(images.length + 1).padStart(2, "0")}-${tag}.${ext}`;
    writeFileSync(join(OUT, file), await r.body());
    const rec = { file, src: src.split("?")[0], tag };
    images.push({ ...rec, src });
    return file;
  } catch {
    return null;
  }
};

try {
  const res = await page.goto(report.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  report.status = res?.status();
  await sleep(6000);
  await dismiss();
  await sleep(1500);
  report.finalUrl = page.url();
  await page.screenshot({ path: join(OUT, "profile-top.png") });
  await page.screenshot({ path: join(OUT, "profile-full.png"), fullPage: true });
  writeFileSync(join(OUT, "profile.html"), await page.content());
  const m = await meta();
  const visible = await page.evaluate(() => document.body.innerText.slice(0, 6000));
  const imgs = await page.evaluate(() => [...document.querySelectorAll("img")].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })));
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => /\/(p|reel)\//.test(h)))]);
  report.profile = { meta: m, visibleText: visible, images: imgs, postLinks: links };
  if (m["og:image"]) await saveImg(m["og:image"], "avatar");
  for (const i of imgs) if (i.w >= 150) await saveImg(i.src, "grid");

  for (const href of links.slice(0, MAX_POSTS)) {
    const url = new URL(href, "https://www.instagram.com").toString();
    await sleep(4000 + Math.random() * 3000);
    try {
      const r = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await sleep(4000);
      await dismiss();
      const pm = await meta();
      const text = await page.evaluate(() => document.body.innerText.slice(0, 4000));
      const slug = href.split("/").filter(Boolean).pop();
      await page.screenshot({ path: join(OUT, `post-${slug}.png`) });
      const pimgs = await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => i.naturalWidth >= 300).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt })));
      const files = [];
      if (pm["og:image"]) files.push(await saveImg(pm["og:image"], `post-${slug}`));
      for (const i of pimgs.slice(0, 6)) files.push(await saveImg(i.src, `post-${slug}`));
      report.posts.push({ url, status: r?.status(), meta: pm, visibleText: text, imageAlts: pimgs.map((i) => i.alt), files: files.filter(Boolean) });
    } catch (e) {
      report.posts.push({ url, error: String(e).slice(0, 300) });
    }
  }
} catch (e) {
  report.notes.push(`Ошибка открытия профиля: ${String(e).slice(0, 400)}`);
}
report.images = images.map(({ file, tag }) => ({ file, tag }));
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`status ${report.status} final ${report.finalUrl}; posts ${report.posts.length}; images ${images.length}`);
console.log(JSON.stringify(report.profile?.meta ?? {}, null, 2));
await browser.close();

// Кандидаты естественных звуков (фоли) для BalaGoNoBackup2D с Wikimedia
// Commons — только записи со свободной лицензией (CC0, Public domain,
// CC BY). Для каждого файла сохраняются автор, лицензия и страница
// источника (candidates.json). Файлы сокращаются до 12 с и переводятся в
// MP3 моно 128 кбит/с; выбор и сведение — вручную, в
// public/audio/no-backup-2d/foley/ с SOURCES.json.
// Запуск: node scripts/fetch-nb2d-foley.mjs <папка> (нужны сеть и ffmpeg).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "foley-candidates";
mkdirSync(OUT, { recursive: true });
const UA = "BalaGoVideo/1.0 (https://github.com/adiletzainidinov/balago-video; video sound design)";
const FREE = /^(cc0|cc-zero|public domain|pd|cc by( |-)?(2\.0|2\.5|3\.0|4\.0)?$)/i;

const info = async (titles) => {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", titles: titles.join("|"), prop: "imageinfo", iiprop: "url|size|mime|extmetadata" }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  return Object.values((await r.json()).query?.pages ?? {});
};

const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, "").trim();
const result = [];
// Выбранные по названиям записи (полный список — all-titles.json прошлого запуска).
const TITLES = {
  steps: ["Step Indoors (Gravity Sound).mp3", "Walking in sandals (Gravity Sound).wav", "Cold Walk (Gravity Sound).wav", "Step in Gravel (Gravity Sound).mp3", "Walking on gravel (Gravity Sound).mp3"],
  keys: ["Keys shaking (Gravity Sound).wav", "Key item pick up 2 (Gravity Sound).wav"],
  click: ["Clicking (Gravity Sound).wav", "Tight door lock (Gravity Sound).wav", "Tight door lock 2 (Gravity Sound).wav"],
  door: ["Close door (Gravity Sound).wav", "Close door 2 (Gravity Sound).wav", "Close door 3 (Gravity Sound).wav", "Open Door (Gravity Sound).mp3", "Enter door 1 (Gravity Sound).wav", "Open and close bathroom door (Gravity Sound).wav", "Close bathroom door (Gravity Sound).wav"],
  ambience: ["Main Street (Gravity Sound).wav", "Bird sings in the morning with cars in the background.ogg", "Breeze birds and geese.ogg"],
};
for (const [group, list] of Object.entries(TITLES)) {
  let n = 0;
  for (const p of await info(list.map((t) => `File:${t}`))) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value);
    if (!FREE.test(license) || /sa/i.test(license)) continue;
    const file = `${group}-${String(++n).padStart(2, "0")}.mp3`;
    const raw = join(OUT, `raw-${file}`);
    try {
      const r = await fetch(ii.url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(String(r.status));
      writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
      execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-t", group === "ambience" ? "40" : "15", "-ac", "1", "-ar", "44100", "-b:a", "160k", join(OUT, file)]);
      execFileSync("rm", ["-f", raw]);
    } catch (e) {
      console.warn(`⚠ ${p.title}: ${e.message}`);
      n--;
      continue;
    }
    result.push({
      group, file, title: p.title, license,
      licenseUrl: strip(m.LicenseUrl?.value), artist: strip(m.Artist?.value), credit: strip(m.Credit?.value),
      source: ii.descriptionurl, original: ii.url, description: strip(m.ImageDescription?.value).slice(0, 300),
    });
    console.log(`✓ ${file}: ${p.title} (${license})`);
  }
}
writeFileSync(join(OUT, "candidates.json"), JSON.stringify(result, null, 2) + "\n");
console.log(`Кандидатов: ${result.length}`);

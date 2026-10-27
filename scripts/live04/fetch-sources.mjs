// Исходники BalaGoLive04Motion из GitHub Release (в Git не храним).
// Скачиваются без пересжатия через `gh api` (локально — авторизация gh,
// в CI — GH_TOKEN=github.token) и проверяются по SHA-256.
//
//   node scripts/live04/fetch-sources.mjs            — основная съёмка
//   node scripts/live04/fetch-sources.mjs --all      — плюс референс
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cfg = JSON.parse(readFileSync(new URL("./sources.json", import.meta.url), "utf8"));
const all = process.argv.includes("--all");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const gh = (args, opts = {}) => execFileSync("gh", args, { maxBuffer: 1 << 30, ...opts });

mkdirSync(cfg.dir, { recursive: true });
let release = null;
for (const f of cfg.files) {
  if (f.optional && !all) continue;
  const dest = join(cfg.dir, f.name);
  if (existsSync(dest) && sha(dest) === f.sha256) {
    console.log(`✓ ${f.name} уже на месте`);
    continue;
  }
  if (!release) {
    try {
      release = JSON.parse(gh(["api", `repos/${cfg.repo}/releases/tags/${cfg.tag}`]).toString());
    } catch (e) {
      console.error(`Нет доступа к Release ${cfg.tag} (${cfg.repo}). Нужен gh с правом чтения репозитория (в CI — GH_TOKEN: \${{ github.token }}, permissions: contents: read).`);
      throw e;
    }
  }
  const asset = release.assets.find((a) => f.assetNames.includes(a.name));
  if (!asset) throw new Error(`В Release ${cfg.tag} нет файла ${f.assetNames.join(" / ")}`);
  const buf = gh(["api", "-H", "Accept: application/octet-stream", `repos/${cfg.repo}/releases/assets/${asset.id}`]);
  writeFileSync(dest + ".part", buf);
  const got = sha(dest + ".part");
  if (got !== f.sha256) throw new Error(`${f.name}: SHA-256 ${got} не совпадает с ожидаемым ${f.sha256}`);
  renameSync(dest + ".part", dest);
  console.log(`↓ ${f.name} ← ${asset.name} (${(buf.length / 1e6).toFixed(1)} МБ, SHA-256 совпал)`);
}

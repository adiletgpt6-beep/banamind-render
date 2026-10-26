#!/usr/bin/env node
// Скачать исходник LIVE-NNN из приватного R2 для монтажа (Claude Code / Actions).
//   node apps/balago-studio/scripts/fetch-source.mjs live/raw/<uuid>/source.mp4 public/liveNNN/src/source.mp4
// Ключи берутся из окружения (R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID,
// R2_SECRET_ACCESS_KEY) — лучше отдельный токен только на чтение. Ничего не печатает
// из секретов и не создаёт публичных ссылок.
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { AwsClient } from "aws4fetch";

const [key, out] = process.argv.slice(2);
if (!key || !out || !/^live\/raw\/[0-9a-f-]{36}\/source\.(mp4|mov)$/.test(key)) {
  console.error("Использование: fetch-source.mjs live/raw/<uuid>/source.mp4 <путь-сохранения>");
  process.exit(2);
}
const missing = ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"].filter((n) => !process.env[n]);
if (missing.length) {
  console.error(`Не заданы секреты: ${missing.join(", ")} (см. apps/balago-studio/docs/DEPLOY.md)`);
  process.exit(2);
}

const client = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});
const url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;
const res = await client.fetch(url);
if (!res.ok || !res.body) {
  console.error(`R2 вернул ${res.status} для ${key}`);
  process.exit(1);
}
await mkdir(dirname(out), { recursive: true });
await pipeline(Readable.fromWeb(res.body), createWriteStream(out));
console.log(`Сохранено: ${out} (${res.headers.get("content-length") ?? "?"} байт)`);

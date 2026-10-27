// Короткие голосовые пробы BalaGoWorkFromHome2D перед полной озвучкой:
// N01 (рассказчик: начало и пауза перед «Болгону»), M02 (главное
// объяснение мамы), B01 и B02 (один и тот же мальчик), F02 (удивление папы).
// Каждая проба — реплика сценария выбранным голосом и seed; готовые файлы
// не синтезируются повторно. Результаты и замеры (MMS CER, медиана F0) —
// voice-samples/work-from-home-2d/report.json; файлы сохраняются в Git.
//
// Дополнительно (если ключ имеет право Voices: Read) в отчёт пишется список
// голосов аккаунта — чтобы выбирать только из реально существующих.
//
// Запуск: node scripts/wfh2d-probe.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { wfhLine } from "../src/work-from-home-2d/script.ts";
import { synthLine } from "./lib/wfh2d-tts.mjs";

const OUT = "voice-samples/work-from-home-2d";
const REPORT = join(OUT, "report.json");
const CONFIG = JSON.parse(readFileSync("scripts/wfh2d-probe.json", "utf8"));
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const report = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : { probes: [] };
const known = new Map(report.probes.map((p) => [p.file, p]));

// Голоса аккаунта (без ключей и личных данных — только имя, id, метки).
try {
  const res = await fetch("https://api.elevenlabs.io/v2/voices?page_size=100", { headers: { "xi-api-key": apiKey } });
  if (res.ok) {
    const data = await res.json();
    report.accountVoices = (data.voices ?? []).map((v) => ({
      name: v.name,
      voiceId: v.voice_id,
      category: v.category,
      labels: v.labels ?? {},
      description: (v.description ?? "").slice(0, 160),
    }));
    console.log(`Голоса аккаунта: ${report.accountVoices.length}`);
    for (const v of report.accountVoices) console.log(`  ${v.name} ${v.voiceId} ${v.category} ${JSON.stringify(v.labels)}`);
  } else console.log(`Список голосов недоступен (${res.status}).`);
} catch (e) {
  console.log(`Список голосов недоступен: ${e.message}`);
}

const fresh = [];
for (const p of CONFIG.probes) {
  const base = wfhLine(p.line);
  for (const v of p.voices) {
    for (const seed of p.seeds) {
      for (const tag of p.tags ?? [base.tag ?? null]) {
        const tagName = tag ? tag.replace(/\W+/g, "") : "notag";
        const file = `${p.line}-${v.name}-${seed}-${tagName}.mp3`;
        if (known.has(file) && existsSync(join(OUT, file))) continue;
        const line = { ...base, tag: tag ?? undefined, text: p.text ?? base.text, spoken: p.spoken ?? base.spoken };
        const info = await synthLine(apiKey, line, v, join(OUT, file), seed);
        const entry = { file, line: p.line, voice: v.name, voiceId: v.voiceId, seed, tag, durationSec: info.durationSec, speechSec: Number((info.speechEnd - info.speechStart).toFixed(3)), words: info.words };
        known.set(file, entry);
        fresh.push({ entry, text: line.spoken ?? line.text });
      }
    }
  }
}
if (fresh.length) {
  const inp = "/tmp/wfh2d-probe-in.json";
  const out = "/tmp/wfh2d-probe-out.json";
  writeFileSync(inp, JSON.stringify(fresh.map((x) => ({ path: join(OUT, x.entry.file), text: x.text }))));
  try {
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    const scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
    for (const x of fresh) {
      const s = scores.get(join(OUT, x.entry.file));
      if (s) Object.assign(x.entry, { cer: s.cer, heard: s.heard, f0: s.f0 });
    }
  } catch (e) {
    console.warn(`распознавание недоступно: ${e.message.split("\n")[0]}`);
  }
}
report.probes = [...known.values()];
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
console.log(`Проб: ${report.probes.length} (новых: ${fresh.length})`);
for (const p of report.probes) console.log(`  ${p.file}: ${p.speechSec} с, CER ${p.cer ?? "?"}, F0 ${p.f0 ?? "?"} — «${p.heard ?? ""}»`);

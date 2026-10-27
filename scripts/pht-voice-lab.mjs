// Пробы голосов фильма №35 перед полной озвучкой.
//
// 1. Сохраняет список голосов аккаунта (voices.json), если у ключа есть
//    право voices_read; иначе берутся известные голоса проекта (ниже).
// 2. Для каждой роли синтезирует ключевые разговорные фразы сценария
//    кандидатами (той же обработкой, что и итоговая озвучка):
//      диктор — VO01, VO36; папа — VO13, VO23; мама — VO14, VO24;
//      сын — VO22, VO10.
//    Пробы диктора сделаны на прежней VO36 — слогане «BalaGo менен жолго
//    чыгалы!» (теперь это VO35). id в LAB не меняются: от них зависит хэш
//    настроек, и смена id заново запустила бы платные пробы.
// 3. Распознаёт пробы Meta MMS (кыргызский): CER и медиана основного тона.
//    Это технический замер, а не прослушивание.
// Пробы и отчёт сохраняются в voice-samples/programmers-hardest-task/.
// При тех же настройках повторно не синтезируются. Аккаунт не меняется.
//
// Запуск: node scripts/pht-voice-lab.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { lineById, PHT_TTS } from "../src/programmers-hardest-task/script.ts";
import { elevenFetch, synthLine } from "./lib/pht-tts.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = "voice-samples/programmers-hardest-task";
// Кандидаты — сохранённые кыргызские голоса проекта (ElevenLabs Voice
// Design; id из voice-samples/*/design/voices.json и сценариев роликов
// №10, №11, №20–№30). Новые голоса не создаются.
const V = {
  husband: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" }, // №10: муж ~35–40, низкий, тёплый
  boss: { name: "KG-boss", voiceId: "yCcjraKUNFsfIv02eS9D" }, // №10: мужчина ~50, спокойный, размеренный
  father11: { name: "KG-father", voiceId: "xxKkhYUgtZTPTuHpktPy" }, // №11: отец, F0 ≈ 113 Гц
  brother11: { name: "KG-brother", voiceId: "IRGPSiyjpLdMfh3zNzFo" }, // №11: молодой мужчина, F0 ≈ 122 Гц
  colleague: { name: "KG-colleague", voiceId: "S87HaYymDP3SARzmBPgS" }, // №10: мужчина ~28, торопливый
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  boy: { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" }, // №22, №24: «мальчик-подросток»
  sonRemix: { name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" }, // №20, №29, №30
  son10: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" }, // №10–№12: светлый женский голос
};
const LAB = {
  v: 2,
  model: PHT_TTS,
  roles: {
    narrator: { lines: ["vo01", "vo36"], voices: [V.boss, V.father11, V.brother11, V.colleague] },
    father: { lines: ["vo13", "vo23"], voices: [V.husband, V.father11] },
    mother: { lines: ["vo14", "vo24"], voices: [V.mother] },
    son: { lines: ["vo22", "vo10"], voices: [V.boy, V.sonRemix, V.son10] },
  },
};

if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const configHash = createHash("sha1").update(JSON.stringify(LAB)).digest("hex").slice(0, 16);
const reportPath = join(OUT, "report.json");
if (existsSync(reportPath) && JSON.parse(readFileSync(reportPath, "utf8")).configHash === configHash) {
  console.log(`= пробы голосов уже есть (${OUT}), повторно не создаются`);
  process.exit(0);
}

// Список голосов аккаунта — если у ключа есть право voices_read.
try {
  const { voices } = await (await elevenFetch(apiKey, "/v1/voices")).json();
  const list = voices.map((v) => ({ name: v.name, id: v.voice_id, category: v.category, labels: v.labels ?? {} }));
  writeFileSync(join(OUT, "voices.json"), JSON.stringify(list, null, 2) + "\n");
  console.log(`Голоса аккаунта: ${list.length}`);
} catch (e) {
  console.log(`Список голосов недоступен (${e.message.slice(0, 120)}) — берутся известные голоса проекта.`);
}

const samples = [];
for (const [role, cfg] of Object.entries(LAB.roles)) {
  console.log(`\n${role}: ${cfg.voices.map((v) => v.name).join(", ")}`);
  for (const v of cfg.voices) {
    for (const id of cfg.lines) {
      const line = { ...lineById(id), role };
      const file = `${role}--${v.name.replace(/[^\w-]+/g, "_")}--${id}.mp3`;
      try {
        const info = await synthLine(apiKey, line, v, join(OUT, file));
        samples.push({ role, voice: v.name, voiceId: v.voiceId, line: id, file, text: line.spoken ?? line.text, speechSec: info.speechEnd - info.speechStart, tag: info.tag });
      } catch (e) {
        console.warn(`  ⚠ ${role}/${v.name}/${id}: ${e.message}`);
        samples.push({ role, voice: v.name, voiceId: v.voiceId, line: id, file: null, error: e.message.slice(0, 200) });
      }
    }
  }
}

// Распознавание MMS и основной тон (если установлен Python с моделью).
const ok = samples.filter((s) => s.file);
const inp = join(OUT, ".score-in.json");
const outp = join(OUT, ".score-out.json");
writeFileSync(inp, JSON.stringify(ok.map((s) => ({ path: join(OUT, s.file), text: s.text }))));
try {
  execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, outp], { stdio: "inherit" });
  const scores = new Map(JSON.parse(readFileSync(outp, "utf8")).map((r) => [r.path, r]));
  for (const s of ok) {
    const r = scores.get(join(OUT, s.file));
    Object.assign(s, { cer: r?.cer ?? null, heard: r?.heard ?? null, f0: r?.f0 ?? null });
  }
} catch (e) {
  console.warn(`  ⚠ распознавание недоступно: ${e.message.split("\n")[0]}`);
}
execFileSync("rm", ["-f", inp, outp]);
writeFileSync(reportPath, JSON.stringify({ configHash, model: PHT_TTS, samples }, null, 2) + "\n");
console.log("\nИтог проб:");
for (const s of samples) console.log(`  ${s.role.padEnd(8)} ${s.voice.padEnd(16)} ${s.line}  CER ${s.cer ?? "?"}  F0 ${s.f0 ?? "?"}  ${s.speechSec?.toFixed?.(2) ?? ""} с`);

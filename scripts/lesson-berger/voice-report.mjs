// Отчёт о проверке речи BM-038 по распознаванию GigaAM (поле asr в manifest.json,
// заполняется tts_piper.py): совпадение букв текста и распознанной речи, WER по словам.
//   node scripts/lesson-berger/voice-report.mjs [books/contagious-berger/video/qa-voice]
import { mkdirSync, writeFileSync } from "node:fs";
import { loadManifest, SCENES } from "./lib.mjs";

const OUT = process.argv[2] ?? "books/contagious-berger/video/qa-voice";
const m = loadManifest();
const byId = new Map(m.lines.map((l) => [l.id, l]));
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(Boolean);
const wer = (ref, hyp) => {
  const d = Array.from({ length: ref.length + 1 }, (_, i) => [i, ...Array(hyp.length).fill(0)]);
  for (let j = 1; j <= hyp.length; j++) d[0][j] = j;
  for (let i = 1; i <= ref.length; i++)
    for (let j = 1; j <= hyp.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1));
  return d[ref.length][hyp.length] / Math.max(1, ref.length);
};
const rows = [];
for (const s of SCENES)
  for (const l of s.lines) {
    const v = byId.get(l.id);
    const spoken = (l.say ?? l.text).replace(/́/g, "");
    const w = v?.asr ? wer(norm(spoken), norm(v.asr.text)) : null;
    rows.push({ id: l.id, matched: v?.asr?.matched ?? null, wer: w === null ? null : +w.toFixed(3), duration: v?.duration, said: spoken, heard: v?.asr?.text ?? "" });
  }
const ok = rows.filter((r) => r.wer !== null);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/voice-asr.json`, JSON.stringify({ engine: m.engine, voice: m.voice, lines: rows }, null, 1));
let md = `# BM-038 · проверка речи (распознавание GigaAM v2)\n\nДвижок озвучки: ${m.engine} (${m.voice}). Реплик: ${rows.length}, распознано: ${ok.length}.\n\n`;
md += `- Среднее совпадение букв: **${mean(ok.map((r) => r.matched)).toFixed(3)}**\n- Средний WER: **${(mean(ok.map((r) => r.wer)) * 100).toFixed(1)} %** (WER считает и ошибки распознавателя на именах/латинице)\n- Речь: ${(mean(ok.map((r) => r.duration)) * ok.length / 60).toFixed(1)} мин\n\n`;
md += `## Реплики с WER > 15 % (прослушать)\n\n| Реплика | WER | Сказано | Распознано |\n|---|---|---|---|\n`;
for (const r of ok.filter((x) => x.wer > 0.15)) md += `| ${r.id} | ${(r.wer * 100).toFixed(0)} % | ${r.said.replace(/\|/g, "/")} | ${r.heard} |\n`;
writeFileSync(`${OUT}/voice-asr.md`, md);
console.log(`✓ ${OUT}: ${ok.length} реплик, совпадение ${mean(ok.map((r) => r.matched)).toFixed(3)}, WER ${(mean(ok.map((r) => r.wer)) * 100).toFixed(1)} %, проблемных ${ok.filter((x) => x.wer > 0.15).length}`);

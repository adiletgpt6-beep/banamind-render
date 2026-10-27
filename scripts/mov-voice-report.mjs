// Отчёт о озвучке фильма №33 (Markdown, для лога CI и сводки прогона).
// По каждой реплике: голос, длительность речи, темп (букв/с), разборчивость
// (CER по распознаванию Meta MMS и что распознано), основной тон, пик, запас
// тишины до первого и после последнего слова. Предупреждения:
//   • CER > 0,12 — слово могло исказиться, реплику стоит перегенерировать;
//   • темп вне 9,5–16 букв/с — речь скомкана или растянута;
//   • основной тон вне диапазона роли — голос «съехал» (скачок тембра);
//   • меньше 40 мс тишины перед речью — риск обрезанного начала слова;
//   • пик выше −1 дБFS — риск перегруза.
// Это технический замер, а не прослушивание: интонацию он не оценивает.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MOV_LINES, MOV_VIDEO } from "../src/moms-old-video/script.ts";
import { decodeMono, SAMPLE_RATE as SR } from "./lib/audio.mjs";

const DIR = join("public", MOV_VIDEO.voiceDir);
const MANIFEST = join(DIR, "manifest.json");
if (!existsSync(MANIFEST)) {
  console.log("Озвучки фильма №33 ещё нет.");
  process.exit(0);
}
const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
const F0 = { son: [230, 420], mother: [160, 270], father: [85, 160], narrator: [170, 290] };
const letters = (s) => [...s].filter((c) => /\p{L}/u.test(c)).length;
const warn = [];
const rows = [];
for (const line of MOV_LINES) {
  const ml = m.lines.find((x) => x.id === line.id);
  if (!ml) {
    rows.push(`| ${line.id} | ${line.role} | — | — | — | — | — | — | нет файла |`);
    continue;
  }
  const speech = ml.speechEnd - ml.speechStart;
  const pace = letters(ml.spoken ?? ml.text) / Math.max(0.2, speech);
  // тишина до первого слова и после последнего по самому файлу
  let lead = null;
  let tail = null;
  const path = join(DIR, ml.file);
  if (existsSync(path)) {
    const pcm = decodeMono(path);
    const thr = Math.pow(10, -40 / 20);
    let a = 0;
    while (a < pcm.length && Math.abs(pcm[a]) < thr) a++;
    let b = pcm.length - 1;
    while (b > a && Math.abs(pcm[b]) < thr) b--;
    lead = a / SR;
    tail = (pcm.length - 1 - b) / SR;
  }
  const laugh = line.subtitle === false;
  const [lo, hi] = F0[line.role];
  if (!laugh && ml.asrCer !== null && ml.asrCer > 0.12) warn.push(`${line.id}: CER ${ml.asrCer} — «${ml.asrHeard}»`);
  if (!laugh && (pace < 9.5 || pace > 16)) warn.push(`${line.id}: темп ${pace.toFixed(1)} букв/с`);
  if (ml.f0 && (ml.f0 < lo || ml.f0 > hi)) warn.push(`${line.id}: основной тон ${ml.f0} Гц вне ${lo}–${hi} Гц (${line.role})`);
  // начало первого слова по таймингам озвучки: без запаса — риск обрезанного начала
  if (ml.speechStart < 0.03) warn.push(`${line.id}: первое слово начинается через ${(ml.speechStart * 1000).toFixed(0)} мс от начала файла`);
  if (ml.peakDb > -1) warn.push(`${line.id}: пик ${ml.peakDb} дБFS`);
  if (line.tag && !ml.tag) warn.push(`${line.id}: тег ${line.tag} снят (звучал вслух) — интонация без тега`);
  rows.push(
    `| ${line.id} | ${line.role} (${ml.voiceName}) | ${speech.toFixed(2)} с | ${pace.toFixed(1)} | ${ml.asrCer ?? "—"} | ${ml.f0 ?? "—"} | ${ml.peakDb} | ${lead === null ? "—" : (lead * 1000).toFixed(0)}/${tail === null ? "—" : (tail * 1000).toFixed(0)} мс | ${ml.asrHeard ?? ""} |`,
  );
}
console.log(`### Озвучка №33: ${m.lines.length}/${MOV_LINES.length} реплик${m.partial ? " (частично)" : ""}\n`);
console.log("| Реплика | Роль | Речь | Букв/с | CER | F0, Гц | Пик, дБFS | Звук до/после речи (−40 дБ) | Распознано (MMS) |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const r of rows) console.log(r);
console.log(warn.length ? `\n**Предупреждения:**\n${warn.map((w) => `- ${w}`).join("\n")}` : "\nПредупреждений нет.");

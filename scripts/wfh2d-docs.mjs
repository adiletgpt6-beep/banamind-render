// Таблица реплик и окончательный тайминг BalaGoWorkFromHome2D из
// manifest.json и шкалы script.ts:
//   public/audio/work-from-home-2d/timeline.json — по реплике: роль, режим,
//     текст субтитров и TTS, файл, голос, модель, параметры, seed,
//     измеренная длительность, начало и конец речи в монтаже;
//   docs/work-from-home-2d/lines.md — то же таблицей.
// Запуск: node scripts/wfh2d-docs.mjs (после озвучки и правки шкалы).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { WFH_CARD_FROM, WFH_DURATION, WFH_FRAMES, WFH_LINES, WFH_SCENES, WFH_VIDEO } from "../src/work-from-home-2d/script.ts";
import { buildWfhCues } from "../src/work-from-home-2d/timing.ts";

const manifest = JSON.parse(readFileSync(`public/${WFH_VIDEO.voiceDir}/manifest.json`, "utf8"));
const cues = buildWfhCues(manifest);
const r2 = (x) => Number(x.toFixed(2));
const rows = WFH_LINES.map((l) => {
  const m = manifest.lines.find((x) => x.id === l.id);
  const c = cues.find((x) => x.id === l.id);
  return {
    id: l.id,
    role: l.role,
    mode: l.mode,
    scene: l.scene,
    text: l.text,
    spoken: l.spoken ?? l.text,
    file: `public/${WFH_VIDEO.voiceDir}/${m.file}`,
    voiceName: m.voiceName,
    voiceId: m.voiceId,
    modelId: m.modelId,
    languageCode: m.languageCode,
    voiceSettings: m.voiceSettings,
    tag: m.tag,
    seed: m.seed,
    durationSec: m.durationSec,
    speechSec: r2(m.speechEnd - m.speechStart),
    montageFrom: r2(c.from),
    montageTo: r2(c.to),
    asrCer: m.asrCer,
  };
});
const timeline = {
  video: WFH_VIDEO.id,
  durationSec: WFH_DURATION,
  frames: WFH_FRAMES,
  cardFrom: WFH_CARD_FROM,
  scenes: WFH_SCENES.map((s) => ({ id: s.id, title: s.title, from: s.from, to: s.to })),
  lines: rows,
};
writeFileSync(`public/${WFH_VIDEO.voiceDir}/timeline.json`, JSON.stringify(timeline, null, 2) + "\n");
mkdirSync("docs/work-from-home-2d", { recursive: true });
const t = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const md = [
  "# BalaGoWorkFromHome2D — реплики и тайминг",
  "",
  `Файл создаётся скриптом \`scripts/wfh2d-docs.mjs\`. Длительность: ${t(WFH_DURATION)} (${WFH_FRAMES} кадров, 30 fps); контактная карточка — кадры ${WFH_CARD_FROM}–${WFH_FRAMES - 1}.`,
  "",
  "## Сцены",
  "",
  "| Сцена | Начало | Конец |",
  "| --- | --- | --- |",
  ...WFH_SCENES.map((s) => `| ${s.title} | ${t(s.from)} | ${t(s.to)} |`),
  "",
  "## Реплики (19)",
  "",
  "| ID | Роль | Режим | Текст (субтитры) | Голос | seed | Речь, с | В монтаже | MMS CER |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map((r) => `| ${r.id} | ${r.role} | ${r.mode} | ${r.text}${r.spoken !== r.text ? ` (TTS: ${r.spoken})` : ""} | ${r.voiceName} \`${r.voiceId}\` | ${r.seed} | ${r.speechSec} | ${t(r.montageFrom)}–${t(r.montageTo)} | ${r.asrCer ?? "—"} |`),
  "",
  `Модель: \`${rows[0].modelId}\`, язык \`${rows[0].languageCode}\`, настройки \`${JSON.stringify(rows[0].voiceSettings)}\`. Аудиотеги: ${rows.filter((r) => r.tag).map((r) => `${r.id} ${r.tag}`).join(", ") || "нет"}.`,
  "",
].join("\n");
writeFileSync("docs/work-from-home-2d/lines.md", md);
console.log(`✓ timeline.json и docs/work-from-home-2d/lines.md (${rows.length} реплик, ${t(WFH_DURATION)})`);

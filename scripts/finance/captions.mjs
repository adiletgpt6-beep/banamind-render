// Субтитры SRT/VTT из того же хронометража, что и ролик.
// Запуск: node scripts/finance/captions.mjs [en|ru] → finance/episode-01/subtitles.<lang>.{srt,vtt}
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { buildTimeline } from "../../src/finance/timeline.ts";
import { buildCaptions, toSrt, toVtt } from "../../src/finance/captions.ts";
import { langOf } from "./lang.mjs";

const L = langOf(process.argv[2]);
const manifest = JSON.parse(readFileSync(`${L.voiceDir}/manifest.json`, "utf8"));
const tl = buildTimeline(L.scenes, manifest);
const caps = buildCaptions(tl);
mkdirSync("finance/episode-01", { recursive: true });
writeFileSync(`finance/episode-01/${L.subs}.srt`, toSrt(caps));
writeFileSync(`finance/episode-01/${L.subs}.vtt`, toVtt(caps));
console.log(`Субтитров: ${caps.length}; длительность ${tl.duration.toFixed(2)} с`);

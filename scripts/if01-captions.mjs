// Caption files for IslamicFinanceShort01 from the narration manifest:
//   out/islamic-finance-short-01.srt   — chunked captions (≤ 4 words), SRT
//   out/islamic-finance-short-01.words.json — every word with start/end (s)
//   out/islamic-finance-short-01.script.txt — the voiceover script
// Run: npm run captions:if01
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { IF01_LINES, IF01_PRONUNCIATION, IF01_VIDEO } from "../src/islamic-finance-01/script.ts";
import { buildChunks } from "../src/islamic-finance-01/captions.ts";

const manifestPath = join("public", IF01_VIDEO.voiceDir, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`No narration manifest (${manifestPath}). Run: npm run audio:voice:if01`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const outDir = process.argv[2] ?? "out";
mkdirSync(outDir, { recursive: true });
const base = join(outDir, IF01_VIDEO.output.replace(/\.mp4$/, ""));

const ts = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

// SRT: same chunks as on screen, but every line is captioned (incl. the ones
// the video shows as headlines), so the file is complete on its own.
const chunks = buildChunks(manifest, new Set());
const srt = chunks.map((c, i) => `${i + 1}\n${ts(c.from)} --> ${ts(Math.max(c.to, c.from + 0.3))}\n${c.words.map((w) => w.text).join(" ")}\n`).join("\n");
writeFileSync(`${base}.srt`, srt);

writeFileSync(
  `${base}.words.json`,
  JSON.stringify(
    {
      video: IF01_VIDEO.id,
      provider: manifest.provider,
      draft: manifest.draft,
      lines: manifest.lines.map((l) => ({ id: l.id, text: l.text, start: l.start, end: l.end, words: l.words })),
    },
    null,
    2,
  ) + "\n",
);

const script = [
  `${IF01_VIDEO.id} — voiceover script (American English)`,
  "",
  ...IF01_LINES.map((l) => `[${l.id} · ${l.scene}] ${l.text}`),
  "",
  `Pronunciation: riba = ${IF01_PRONUNCIATION.riba}; murabaha = ${IF01_PRONUNCIATION.murabaha}; $20,000 = twenty thousand dollars; $22,000 = twenty-two thousand dollars.`,
  `Narration: ${manifest.provider}${manifest.draft ? " (DRAFT — replace with the premium voice via ELEVENLABS_API_KEY)" : ""}, voice ${manifest.voice ?? "?"}.`,
  "",
].join("\n");
writeFileSync(`${base}.script.txt`, script);
console.log(`+ ${base}.srt (${chunks.length} cues)\n+ ${base}.words.json\n+ ${base}.script.txt`);

// Loads lipsync.json (scripts/if01_phones.py) inside Remotion; without it the
// mouth is driven by word timings only (one open vowel per word).
import { getStaticFiles, staticFile } from "remotion";
import type { If01Manifest } from "../narration";
import { IF01_VIDEO } from "../script";
import type { LipsyncData } from "./lipsync";

export const estimateLipsync = (m: If01Manifest): LipsyncData => ({
  version: 1,
  fps: IF01_VIDEO.fps,
  env: Array.from({ length: IF01_VIDEO.durationSec * IF01_VIDEO.fps }, (_, i) => (m.lines.some((l) => i / IF01_VIDEO.fps >= l.start && i / IF01_VIDEO.fps <= l.end) ? 0.7 : 0)),
  lines: m.lines.map((l) => ({ id: l.id, words: l.words.map((w) => ({ text: w.text, start: w.start, end: w.end, phones: [{ p: "AH", start: w.start, end: w.end }] })) })),
});

export const loadLipsync = async (m: If01Manifest): Promise<LipsyncData> => {
  const path = `${IF01_VIDEO.voiceDir}/lipsync.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateLipsync(m);
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateLipsync(m);
  if (!res.ok) throw new Error(`Could not load lipsync data: HTTP ${res.status}`);
  const data = (await res.json()) as LipsyncData;
  if (data.version !== 1 || !Array.isArray(data.lines)) throw new Error("Unexpected lipsync.json. Re-run: npm run lipsync:if01");
  return data;
};

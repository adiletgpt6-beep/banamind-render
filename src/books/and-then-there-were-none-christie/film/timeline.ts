// Хронометраж фильма BM-017 по фактической озвучке (как у «Трактата»), но без
// принудительной растяжки до 30:00: цель передаётся явно (пилот — без цели).
// Речь никогда не ускоряется; запас до цели раскладывается по паузам с потолком.
import { estimate, type TimedLine, type TimedScene, type Timeline, type VoiceManifest } from "../../../lesson-traktat/timeline.ts";
import type { Scene } from "../../../lesson-traktat/types";

export { FPS } from "../../../lesson-traktat/timeline.ts";
export type { Timeline, VoiceManifest };

const LEAD_IN = 0.6;
const LINE_GAP = 0.55;
const SCENE_GAP = 1.2;
const SCENE_LEAD = 0.6;
const TAIL = 1.8;
const MAX_SCENE_EXTRA = 4;
const MAX_LINE_EXTRA = 0.7;

const layout = (scenes: Scene[], manifest: VoiceManifest | null, extraScene: number, extraLine: number) => {
  const byId = new Map(manifest?.lines.map((l) => [l.id, l]) ?? []);
  const out: TimedScene[] = [];
  const all: TimedLine[] = [];
  let t = LEAD_IN;
  scenes.forEach((sc, si) => {
    if (si > 0) t += sc.gap ?? SCENE_GAP + extraScene;
    const sceneFrom = si === 0 ? 0 : Math.max(0, t - SCENE_LEAD);
    const lines: TimedLine[] = [];
    sc.lines.forEach((ln, li) => {
      const v = byId.get(ln.id);
      const est = v ? null : estimate(ln.text);
      const speechStart = v ? v.speechStart : 0;
      const from = t - speechStart;
      const shift = (x: number) => +(x + from).toFixed(3);
      const tl: TimedLine = {
        id: ln.id,
        sceneId: sc.id,
        index: li,
        text: ln.text,
        from,
        speechFrom: shift(speechStart),
        speechTo: shift(v ? v.speechEnd : est!.dur),
        file: v?.file ?? null,
        duration: v?.duration ?? est!.dur,
        words: (v ? v.words : est!.words).map((w) => ({ text: w.text, start: shift(w.start), end: shift(w.end) })),
        chars: (v?.chars ?? []).map((c) => ({ c: c.c, start: shift(c.start), end: shift(c.end) })),
        env: v?.env ?? [],
      };
      t = tl.speechTo;
      if (ln.wait) {
        tl.waitFrom = t + 0.35;
        tl.waitTo = tl.waitFrom + ln.wait;
        t = tl.waitTo + 0.2;
      }
      t += (ln.pause ?? 0) + (li < sc.lines.length - 1 ? LINE_GAP + extraLine : 0);
      lines.push(tl);
      all.push(tl);
    });
    out.push({ id: sc.id, index: si, from: sceneFrom, to: 0, lines });
  });
  const duration = t + TAIL;
  out.forEach((s, i) => (s.to = i + 1 < out.length ? out[i + 1].from : duration));
  return { scenes: out, lines: all, duration };
};

export const buildTimeline = (scenes: Scene[], manifest: VoiceManifest | null, target?: number): Timeline => {
  const base = layout(scenes, manifest, 0, 0);
  if (!target || base.duration >= target) return { ...base, natural: base.duration };
  let missing = target - base.duration;
  const nScene = scenes.filter((s, i) => i > 0 && s.gap === undefined).length;
  const nLine = scenes.reduce((a, s) => a + s.lines.length - 1, 0);
  const scene = Math.min(MAX_SCENE_EXTRA, missing / Math.max(1, nScene));
  missing -= scene * nScene;
  const line = Math.min(MAX_LINE_EXTRA, Math.max(0, missing) / Math.max(1, nLine));
  return { ...layout(scenes, manifest, scene, line), natural: base.duration };
};

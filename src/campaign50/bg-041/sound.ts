// Эффекты BG-041. Плёнка — по состоянию пульта (edit.ts → hudAtFrame):
// каждый отрезок ◀◀ получает шелест перемотки (rewind.mp3, цепочкой по
// 2,5 с), переходы в ❚❚ и ▶ — щелчок кнопки, ▶▶ — быструю прокрутку.
// Склейки сцен — мягкий «вжух». Плюс события сцен (sceneSfx): кубик,
// крышка ноутбука, касания телефона, отправка сообщения и т. п.
// Общие файлы проекта public/audio/sfx-*.mp3 — только чтение.
import { hudAtFrame } from "./edit";
import { BG41_VIDEO } from "./script";
import { eveningSfx } from "./shots/Evening";
import { sceneSfx } from "./shots/sfx";
import type { Bg41Timeline } from "./timing";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

const FPS = BG41_VIDEO.fps;
const TAPE = BG41_VIDEO.sfxDir;

export const bg41Sfx = (tl: Bg41Timeline): Sfx[] => {
  const out: Sfx[] = [];
  const modes = Array.from({ length: tl.frames }, (_, f) => hudAtFrame(tl, f)?.mode ?? null);
  let f = 0;
  while (f < tl.frames) {
    const m = modes[f];
    let e = f;
    while (e < tl.frames && modes[e] === m) e++;
    const a = f / FPS;
    const b = e / FPS;
    if (m === "rew") {
      for (let x = a; x < b - 0.15; x += 2.5) out.push({ src: `${TAPE}/rewind.mp3`, at: x, volume: 0.32, dur: Math.min(2.69, b - x + 0.1), fade: 0.12 });
    }
    if (m === "ff") out.push({ src: `${TAPE}/ff.mp3`, at: a, volume: 0.28, dur: Math.min(2.1, b - a + 0.1), fade: 0.12 });
    if ((m === "pause" || m === "play") && f > 0 && modes[f - 1] !== null && modes[f - 1] !== m) out.push({ src: `${TAPE}/clunk.mp3`, at: a, volume: 0.5 });
    f = e;
  }
  // склейки сцен
  for (const sc of tl.scenes.slice(1)) out.push({ src: "audio/sfx-whoosh.mp3", at: sc.from - 0.25, volume: 0.12 });
  out.push(...eveningSfx(tl), ...sceneSfx(tl));
  return out;
};

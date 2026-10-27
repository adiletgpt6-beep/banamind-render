// Звук BalaGoBG040: голоса, тихая музыка (стемы проекта 92 BPM —
// «pulse» с тиканьем на проблеме, «warm» на решении; приглушается под
// речью) и тактовые эффекты: часы, принтер, перо, крышка ноутбука,
// телефон. Моменты эффектов берутся из тех же функций, что и анимация
// сцен (…Beats), поэтому звук совпадает с действием.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG40_VIDEO, type Bg40SceneId } from "./script";
import { sceneFrames, sceneOf, type Bg40Timeline } from "./timing";
import { hookHit, hookTickFrames } from "./scenes/Hook";
import { flowBeats } from "./scenes/Flow";
import { refocusBeats, refocusPrinterSteps } from "./scenes/Refocus";
import { searchBeats } from "./scenes/Search";
import { planBeats } from "./scenes/Plan";
import { CTA_HAND_BACK } from "./scenes/Cta";

const FPS = BG40_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OWN = (n: string) => `${BG40_VIDEO.sfxDir}/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.15;
const MUSIC_UNDER_VOICE = 0.045;

export type Bg40Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg40Sfx = (tl: Bg40Timeline): Bg40Sfx[] => {
  const S = (id: Bg40SceneId) => Math.round(sceneOf(tl, id).from * FPS);
  const out: Bg40Sfx[] = [];
  const push = (at: number, src: string, volume: number, dur?: number) => out.push({ at: Math.max(0, Math.round(at)), src, volume, dur });

  // 1. хук: такты стрелки, штамп заголовка, перо, удар
  const h = S("hook");
  const hit = hookHit(tl);
  hookTickFrames(hit, sceneFrames(tl, "hook")).forEach((t, i) => push(h + t, OWN(`tick-${i % 2}`), 0.34));
  push(h + 3, OWN("stamp"), 0.42);
  push(h + 15, OWN("stamp"), 0.5);
  push(h + 2, OWN("pen-write"), 0.24, Math.max(0.3, (hit - 2) / FPS));
  push(h + hit, OWN("hand-hit"), 0.55);

  // 2. офис: печать, напоминание, крышка, «складывание», полосы
  const fl = S("flow");
  const fb = flowBeats(tl);
  push(fl, COMMON("whoosh"), 0.08);
  push(fl + 6, COMMON("typing"), 0.11, Math.max(0.4, (fb.remind - 6) / FPS));
  push(fl + fb.remind, COMMON("vibrate"), 0.3);
  push(fl + fb.remind + 2, COMMON("notify"), 0.18);
  push(fl + fb.closeTo - 3, OWN("lid"), 0.45);
  push(fl + fb.fold + 6, OWN("fold"), 0.4);
  [fb.mont, fb.b2, fb.b3].forEach((t, i) => {
    push(fl + t, COMMON("whoosh"), 0.12);
    push(fl + t + 8, OWN(`tick-${i % 2}`), 0.4);
  });
  push(fl + fb.b3 + 6, OWN("lid"), 0.18);

  // 3. принтер и листы: такты принтера, отметки разрыва, вопрос
  const r = S("refocus");
  const rb = refocusBeats(tl);
  refocusPrinterSteps().forEach((t) => push(r + t, OWN("printer-step"), 0.36));
  push(r + rb.shotB, COMMON("paper"), 0.28);
  rb.marks.forEach((t) => push(r + t, OWN("pen-zig"), 0.36));
  push(r + rb.focus - 4, COMMON("pop"), 0.16);
  push(r + rb.question, COMMON("paper"), 0.26);
  push(r + rb.question + 10, OWN("pen-write"), 0.22, 1.35);

  // 4. телефон: поиск, поля, кнопка, отправка
  const s = S("search");
  const sb = searchBeats(tl);
  push(s + sb.aEnd, COMMON("whoosh"), 0.1);
  push(s + sb.typeFrom, COMMON("typing"), 0.12, Math.max(0.4, (sb.typeTo - sb.typeFrom) / FPS));
  push(s + sb.tapResult, COMMON("tap"), 0.36);
  sb.fill.forEach((t) => {
    push(s + t - 4, COMMON("tap"), 0.3);
    push(s + t, COMMON("typing"), 0.1, 0.5);
  });
  push(s + sb.button, COMMON("tap"), 0.38);
  push(s + sb.wa, COMMON("whoosh"), 0.08);
  push(s + sb.send, COMMON("tap"), 0.38);
  push(s + sb.send + 3, OWN("send"), 0.32);
  push(s + sb.chip, COMMON("pop"), 0.16);

  // 5. разделённый лист: шаги, галочка, фраза мамы
  const p = S("plan");
  const pb = planBeats(tl);
  push(p, COMMON("paper"), 0.26);
  [pb.s1, pb.s2, pb.s3].forEach((t) => push(p + t, COMMON("pop"), 0.15));
  push(p + pb.check, OWN("pen-zig"), 0.26);
  push(p + pb.write, OWN("pen-write"), 0.22, Math.max(0.4, (pb.writeTo - pb.write) / FPS));
  push(p + pb.honest, COMMON("pop"), 0.12);

  // 6. финал: стрелка возвращается тактами, звук логотипа
  const c = S("cta");
  [2, 9, 16].forEach((t, i) => push(c + t, OWN(`tick-${i % 2}`), 0.28));
  push(c + CTA_HAND_BACK, COMMON("chime"), 0.42);
  return out;
};

export const Bg40Audio: React.FC<{ readonly tl: Bg40Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const s = (sec: number) => Math.round(sec * FPS);
  const cues: readonly Ts2Cue[] = tl.cues;
  // интервалы речи: музыка мягко уходит под голос
  const spans: [number, number][] = [];
  for (const c of cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.5 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const search = s(sceneOf(tl, "search").from);
  const music = [
    { src: "audio/music-story-pulse.mp3", from: 0, to: search + FPS, gain: 0.9 },
    { src: "audio/music-story-warm.mp3", from: search, to: total, gain: 1 },
  ];
  const sfx = useMemo(() => bg40Sfx(tl), [tl]);
  return (
    <>
      {music.map((m) => (
        <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={m.from} durationInFrames={m.to - m.from}>
          <Audio
            src={staticFile(m.src)}
            trimBefore={m.from}
            volume={(f) => duck(f + m.from) * m.gain * interpolate(f + m.from, [m.from, m.from + FPS, m.to - FPS, m.to], [m.from === 0 ? 1 : 0, 1, 1, m.to >= total ? 1 : 0], clamp)}
          />
        </Sequence>
      ))}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.max(4, s(x.dur)) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur ? interpolate(f, [0, 2, dur - 5, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG40_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

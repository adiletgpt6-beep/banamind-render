// Звук BalaGoBG019: голоса, очень тихая музыка (приглушается под речью)
// и звуковой мост — школьный колокольчик: живые удары в начале, мягкий
// звон на разрезе миров, ритм дней недели (возрастающие ноты, не таймер),
// и в финале колокольчик становится мягким звуком логотипа.
// Моменты событий берутся из тех же констант и шкалы, что и анимация.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG19_VIDEO } from "./script";
import { lineFramesIn, sceneOf, wordFrameIn, type Bg19Timeline } from "./timing";
import { BELL_HITS, bellSplitAt } from "./scenes/Worlds";
import { CALL } from "./scenes/Call";
import { PLAN } from "./scenes/Plan";
import { CTA_CHIME } from "./scenes/Cta";

const FPS = BG19_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OWN = (n: string) => `${BG19_VIDEO.sfxDir}/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.1;
const MUSIC_UNDER_VOICE = 0.035;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg19Sfx = (tl: Bg19Timeline): Sfx[] => {
  const S = (id: Parameters<typeof sceneOf>[1]) => Math.round(sceneOf(tl, id).from * FPS);
  const b = S("bell");
  const c = S("call");
  const p = S("plan");
  const r = S("route");
  const e = S("cta");
  const n1 = lineFramesIn(tl, "n1");
  const split = bellSplitAt(n1.from, wordFrameIn(tl, "n1", 2));
  const out: Sfx[] = [];
  BELL_HITS.forEach((h, i) => out.push({ at: b + h, src: OWN(`bell-hand-${i % 2}`), volume: 0.5 - i * 0.03 }));
  out.push({ at: b + split, src: COMMON("whoosh"), volume: 0.1 });
  out.push({ at: b + split + 2, src: OWN("bell-soft-3"), volume: 0.32 });
  // звонок → офис: телефон, неделя в ритм колокольчика, звонок сына
  out.push({ at: c, src: COMMON("whoosh"), volume: 0.08 });
  out.push({ at: c + CALL.glow, src: COMMON("notify"), volume: 0.28 });
  CALL.lit.forEach((at, i) => out.push({ at: c + at, src: OWN(`bell-soft-${i}`), volume: 0.26 }));
  out.push({ at: c + CALL.ring, src: COMMON("vibrate"), volume: 0.3 });
  out.push({ at: c + CALL.answer, src: COMMON("tap"), volume: 0.35 });
  // план: поля, сохранение, поиск, открытие страницы
  PLAN.fills.forEach((at) => {
    out.push({ at: p + at - 3, src: COMMON("tap"), volume: 0.28 });
    out.push({ at: p + at, src: COMMON("typing"), volume: 0.1, dur: 0.6 });
  });
  out.push({ at: p + PLAN.save, src: COMMON("tap"), volume: 0.32 });
  out.push({ at: p + PLAN.week, src: OWN("bell-soft-4"), volume: 0.22 });
  out.push({ at: p + PLAN.search + 6, src: COMMON("typing"), volume: 0.1, dur: 1.2 });
  out.push({ at: p + PLAN.tap, src: COMMON("tap"), volume: 0.32 });
  out.push({ at: p + PLAN.page, src: COMMON("whoosh"), volume: 0.09 });
  // маршрут: прибытие к школе и домой
  out.push({ at: r + wordFrameIn(tl, "n4", 7), src: OWN("bell-soft-2"), volume: 0.16 });
  out.push({ at: r + wordFrameIn(tl, "n4", 9), src: OWN("bell-soft-0"), volume: 0.16 });
  // финал: колокольчик становится звуком логотипа
  out.push({ at: e + CTA_CHIME, src: OWN("chime-logo"), volume: 0.42 });
  return out;
};

export const Bg19Audio: React.FC<{ readonly tl: Bg19Timeline }> = ({ tl }) => {
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
    return v * interpolate(f, [0, 0.8 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const plan = s(sceneOf(tl, "plan").from);
  const music = [
    { src: "audio/music-story-morning.mp3", from: 0, to: plan + FPS, gain: 0.9 },
    { src: "audio/music-story-warm.mp3", from: plan, to: total, gain: 1 },
  ];
  const sfx = useMemo(() => bg19Sfx(tl), [tl]);
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
        const dur = x.dur ? s(x.dur) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur ? interpolate(f, [0, 3, dur - 6, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG19_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

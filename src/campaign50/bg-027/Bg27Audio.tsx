// Звук BalaGoBG027: голоса, тихая тёплая музыка (приглушается под речью)
// и немногие смысловые эффекты: уведомление телефона, бумага и галочка на
// карточке встречи, появление строк карточки, подъезд машины, мягкие
// переходы и звук логотипа в финале. Без шагов и случайных шумов.
// Моменты событий берутся из той же шкалы и констант, что и анимация.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG27_VIDEO } from "./script";
import { lineFramesIn, sceneOf, wordFrameIn, type Bg27Timeline } from "./timing";
import { HOOK } from "./scenes/Hook";
import { CALM } from "./scenes/Calm";
import { CTA_CHIME } from "./scenes/Cta";

const FPS = BG27_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.1;
const MUSIC_UNDER_VOICE = 0.035;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg27Sfx = (tl: Bg27Timeline): Sfx[] => {
  const S = (id: Parameters<typeof sceneOf>[1]) => Math.round(sceneOf(tl, id).from * FPS);
  const h = S("hook");
  const m = S("mom");
  const c = S("card");
  const ho = S("handover");
  const ca = S("calm");
  const e = S("cta");
  const m1 = lineFramesIn(tl, "m1");
  const n4 = lineFramesIn(tl, "n4");
  const out: Sfx[] = [];
  // стоп-кадр
  out.push({ at: h + HOOK.freeze, src: COMMON("whoosh"), volume: 0.12 });
  out.push({ at: h + HOOK.freeze + 4, src: COMMON("pop"), volume: 0.18 });
  // мама: уведомление, телефон в руке, карточка и галочка (моменты как в Mom.tsx)
  out.push({ at: m + 16, src: COMMON("notify"), volume: 0.28 });
  out.push({ at: m + 50, src: COMMON("whoosh"), volume: 0.07 });
  out.push({ at: m + m1.to + 34, src: COMMON("paper"), volume: 0.3 });
  out.push({ at: m + m1.to + 60, src: COMMON("tap"), volume: 0.3 });
  // карточка: строки и рамка
  out.push({ at: c, src: COMMON("whoosh"), volume: 0.08 });
  out.push({ at: c + wordFrameIn(tl, "n2", 2) - 4, src: COMMON("pop"), volume: 0.2 });
  out.push({ at: c + wordFrameIn(tl, "n2", 6) - 8, src: COMMON("pop"), volume: 0.2 });
  out.push({ at: c + wordFrameIn(tl, "n2", 8), src: COMMON("chime"), volume: 0.16 });
  // подъезд машины и надпись
  out.push({ at: ho, src: COMMON("car"), volume: 0.22, dur: 2.6 });
  out.push({ at: ho + 84, src: COMMON("whoosh"), volume: 0.07 });
  out.push({ at: ho + n4.from, src: COMMON("pop"), volume: 0.16 });
  // переход к воротам
  out.push({ at: ca + CALM.wipe, src: COMMON("whoosh"), volume: 0.1 });
  // финал
  out.push({ at: e + CTA_CHIME, src: COMMON("chime"), volume: 0.38 });
  return out;
};

export const Bg27Audio: React.FC<{ readonly tl: Bg27Timeline }> = ({ tl }) => {
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
  const sfx = useMemo(() => bg27Sfx(tl), [tl]);
  return (
    <>
      <Sequence name="Музыка: music-story-warm.mp3" durationInFrames={total}>
        <Audio src={staticFile("audio/music-story-warm.mp3")} volume={(f) => duck(f)} />
      </Sequence>
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
            <Audio src={staticFile(`${BG27_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

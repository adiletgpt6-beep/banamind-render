// Звук BalaGoBG039: голоса, очень тихая музыка (приглушается под речью)
// и бумажные звуки билета: опускается на стол, отметка, удар штампа,
// переворот, ячейки блока, печать билета компенсации, конверт, папка.
// Моменты событий берутся из тех же констант и слов озвучки, что и
// анимация (один источник времени).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG39_VIDEO } from "./script";
import { lineFramesIn, sceneOf, wordFrameAt, type Bg39Timeline } from "./timing";
import { HOOK } from "./scenes/Hook";
import { FATHER } from "./scenes/Father";
import { RULE } from "./scenes/Rule";
import { SPLIT } from "./scenes/Split";
import { CTA_LOGO } from "./scenes/Cta";

const FPS = BG39_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OWN = (n: string) => `${BG39_VIDEO.sfxDir}/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.09;
const MUSIC_UNDER_VOICE = 0.03;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg39Sfx = (tl: Bg39Timeline): Sfx[] => {
  const S = (id: Parameters<typeof sceneOf>[1]) => Math.round(sceneOf(tl, id).from * FPS);
  const W = (id: string, p: string, fb: number) => wordFrameAt(tl, id, p, fb);
  const h = S("hook");
  const fa = S("father");
  const ha = S("halves");
  const r = S("rule");
  const sp = S("split");
  const c = S("cta");
  const out: Sfx[] = [];
  // 1. хук: билет на стол, отметка, штамп
  out.push({ at: h + HOOK.drop + 4, src: COMMON("paper"), volume: 0.35 });
  out.push({ at: h + HOOK.done + 6, src: OWN("click"), volume: 0.3 });
  out.push({ at: h + HOOK.stamp + 6, src: OWN("stamp"), volume: 0.6 });
  out.push({ at: h + HOOK.title, src: COMMON("whoosh"), volume: 0.07 });
  // 2. отец: отъезд камеры, переворот билета туда и обратно
  out.push({ at: fa - 6, src: COMMON("whoosh"), volume: 0.08 });
  out.push({ at: fa + FATHER.flip[0] + 4, src: COMMON("paper"), volume: 0.3 });
  out.push({ at: fa + W("f1", "анда", 0.55) - 2, src: COMMON("paper"), volume: 0.24 });
  // 3. половины: расходятся, подсветка частей, соединение
  const n2 = lineFramesIn(tl, "n2");
  out.push({ at: ha + W("n2", "эки", 0.35), src: OWN("slide"), volume: 0.3 });
  out.push({ at: ha + W("n2", "эртең", 0.55), src: OWN("click"), volume: 0.22 });
  out.push({ at: ha + W("n2", "сабактан", 0.8), src: OWN("click"), volume: 0.22 });
  out.push({ at: ha + n2.to + 10, src: COMMON("pop"), volume: 0.18 });
  // 4. правило: штамп, полёт в ячейку, ячейки, печать, конверт, строки шкалы
  const blockAt = W("n3", "он", 0.3);
  const oneAt = W("n3", "бирден", 0.45);
  const packAt = W("n3", "пакетиңизге", 0.55);
  const fourAt = W("n3", "төрт", 0.7);
  const scaleAt = W("n3", "шкала", 0.85);
  out.push({ at: r + W("n3", "себебинен", 0.12) + 6, src: OWN("stamp"), volume: 0.55 });
  out.push({ at: r + blockAt + 4, src: COMMON("whoosh"), volume: 0.08 });
  for (let i = 0; i < 3; i++) out.push({ at: r + blockAt + i * 3 + 2, src: OWN("click"), volume: 0.16 });
  out.push({ at: r + blockAt + RULE.flyDur + 6, src: OWN("click"), volume: 0.3 });
  out.push({ at: r + oneAt + 4, src: OWN("print"), volume: 0.28 });
  out.push({ at: r + oneAt + 12, src: COMMON("chime"), volume: 0.14 });
  out.push({ at: r + packAt + 20, src: COMMON("paper"), volume: 0.3 });
  out.push({ at: r + fourAt, src: COMMON("whoosh"), volume: 0.07 });
  [fourAt + 4, fourAt + 9, scaleAt, scaleAt + 5, scaleAt + 10].forEach((at) => out.push({ at: r + at, src: OWN("click"), volume: 0.16 }));
  // 5. папки: билет складывается, ложится в папку, папка закрывается, «≠»
  out.push({ at: sp + SPLIT.fold[0] + 2, src: COMMON("paper"), volume: 0.28 });
  out.push({ at: sp + SPLIT.insert[0], src: OWN("slide"), volume: 0.32 });
  out.push({ at: sp + SPLIT.close + 6, src: COMMON("tap"), volume: 0.3 });
  out.push({ at: sp + W("n4", "башка", 0.5), src: COMMON("pop"), volume: 0.16 });
  // 6. финал: мягкий звук логотипа
  out.push({ at: c + CTA_LOGO, src: COMMON("chime"), volume: 0.3 });
  return out.filter((x) => x.at >= 0 && x.at < tl.frames - 2);
};

export const Bg39Audio: React.FC<{ readonly tl: Bg39Timeline }> = ({ tl }) => {
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
    return v * interpolate(f, [0, 0.6 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const rule = s(sceneOf(tl, "rule").from);
  const music = [
    { src: "audio/music-story-low.mp3", from: 0, to: rule + FPS, gain: 0.95 },
    { src: "audio/music-story-warm.mp3", from: rule, to: total, gain: 1 },
  ];
  const sfx = useMemo(() => bg39Sfx(tl), [tl]);
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
            <Audio src={staticFile(`${BG39_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

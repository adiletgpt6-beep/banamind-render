// Звук BalaGoBG038: голоса, очень тихая музыка (приглушается под речью)
// и сдержанные эффекты на событиях анимации — отправка сообщения, шорох
// карточек, мягкие «щелчки» процентов, звонкий потолок 20 %, папки и
// звук логотипа. Моменты берутся из тех же констант и шкалы, что и
// анимация. Без резких и громких звуков.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG38_VIDEO } from "./script";
import { sceneOf, wordFrameIn, wordIndexOf, type Bg38Timeline } from "./timing";
import { RULES } from "./scenes/Rules";
import { SCALE1 } from "./scenes/Scale";
import { DOOR } from "./scenes/Door";
import { CTA_CHIME } from "./scenes/Cta";

const FPS = BG38_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const MUSIC_VOLUME = 0.1;
const MUSIC_UNDER_VOICE = 0.035;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number };

export const bg38Sfx = (tl: Bg38Timeline): Sfx[] => {
  const S = (id: Parameters<typeof sceneOf>[1]) => Math.round(sceneOf(tl, id).from * FPS);
  const W = (id: string, needle: string) => wordFrameIn(tl, id, wordIndexOf(id, needle));
  const h = S("hook");
  const r = S("rules");
  const s1 = S("scale1");
  const s2 = S("scale2");
  const fo = S("folders");
  const d = S("door");
  const e = S("cta");
  const hookEnd = r;
  const out: Sfx[] = [];
  // хук: черновик сообщения, «ныряние» в телефон
  out.push({ at: h + 14, src: COMMON("pop"), volume: 0.16 });
  out.push({ at: hookEnd - 10, src: COMMON("whoosh"), volume: 0.12 });
  // телефон: отправка, «доставлено», переход в браузер, прокрутка
  out.push({ at: r + RULES.send - 2, src: COMMON("tap"), volume: 0.32 });
  out.push({ at: r + RULES.send + 2, src: COMMON("notify"), volume: 0.2 });
  out.push({ at: r + RULES.swipe, src: COMMON("whoosh"), volume: 0.08 });
  out.push({ at: r + RULES.swipe + 20, src: COMMON("tap"), volume: 0.26 });
  out.push({ at: r + W("n1", "каттамдан калган"), src: COMMON("pop"), volume: 0.14 });
  out.push({ at: r + W("n1", "кийинки төлөм"), src: COMMON("pop"), volume: 0.14 });
  // рюкзак открывается, карточки вылетают
  out.push({ at: s1 + SCALE1.open, src: COMMON("paper"), volume: 0.22 });
  out.push({ at: s1 + SCALE1.burst, src: COMMON("whoosh"), volume: 0.12 });
  out.push({ at: s1 + SCALE1.card, src: COMMON("paper"), volume: 0.2 });
  // ряды шкалы: шорох карточек и мягкий «щелчок» процента
  const row = (base: number, id: string, rowWord: string, pctWord: string) => {
    out.push({ at: base + W(id, rowWord) + 4, src: COMMON("paper"), volume: 0.16 });
    out.push({ at: base + W(id, pctWord), src: COMMON("pop"), volume: 0.2 });
  };
  row(s1, "n2", "эки-үч", "беш пайыз");
  row(s1, "n2", "төрт-беш", "он пайыз");
  row(s2, "n3", "Алты-жети", "он беш");
  row(s2, "n3", "Сегиз", "жыйырма пайыз. Эң");
  out.push({ at: s2 + W("n3", "Эң жогорку"), src: COMMON("chime"), volume: 0.16 });
  // папки: карточки складываются, процент переходит, знак сервиса
  out.push({ at: fo + 4, src: COMMON("paper"), volume: 0.2 });
  out.push({ at: fo + W("n4", "кийинки төлөнүүчү"), src: COMMON("whoosh"), volume: 0.08 });
  out.push({ at: fo + W("n4", "бир айга"), src: COMMON("pop"), volume: 0.18 });
  out.push({ at: fo + W("n4", "кызматтын катасы"), src: COMMON("tap"), volume: 0.22 });
  // рюкзак ставят на полку
  out.push({ at: d + DOOR.place - 2, src: COMMON("tap"), volume: 0.18 });
  // финал: мягкий звук логотипа
  out.push({ at: e + CTA_CHIME, src: COMMON("chime"), volume: 0.3 });
  return out;
};

export const Bg38Audio: React.FC<{ readonly tl: Bg38Timeline }> = ({ tl }) => {
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
  const scale = s(sceneOf(tl, "scale1").from);
  const music = [
    { src: "audio/music-story-low.mp3", from: 0, to: scale + FPS, gain: 0.9 },
    { src: "audio/music-story-warm.mp3", from: scale, to: total, gain: 1 },
  ];
  const sfx = useMemo(() => bg38Sfx(tl), [tl]);
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
            <Audio src={staticFile(`${BG38_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

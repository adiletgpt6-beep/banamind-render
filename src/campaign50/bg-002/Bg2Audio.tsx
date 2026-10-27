// Звук BG-002: голоса, тихая музыка (приглушается под речью), тиканье
// таймера, вибрация и уведомление телефона, клики календаря, набор
// эскертме, касания планшета, шаги папы к переговорной, мягкий звон
// финала. Моменты — из тех же констант, что и анимация сцен.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { BG2_SCENES, BG2_TIMER, BG2_VIDEO, type Bg2SceneId } from "./script";
import type { Bg2Cue } from "./timing";
import { timerTicks } from "./Timer";
import { HOOK } from "./scenes/Hook";
import { CALL } from "./scenes/Call";
import { CALENDAR } from "./scenes/Calendar";
import { APP } from "./scenes/App";
import { dadWalk, TERMS, TERMS_STOP } from "./scenes/Terms";
import { CTA } from "./scenes/Cta";
import { CAL } from "./screens";
import { sentenceFrames } from "./scenes/common";
import { lineById } from "./script";

const FPS = BG2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);
const S = (id: Bg2SceneId) => s(BG2_SCENES.find((x) => x.id === id)!.from);
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };

const MUSIC_VOLUME = 0.22;
const MUSIC_UNDER_VOICE = 0.06;

export const Bg2Audio: React.FC<{ readonly cues: readonly Bg2Cue[] }> = ({ cues }) => {
  const { durationInFrames: total } = useVideoConfig();
  // музыка: напряжённый пульс до решения, затем тёплая тема до конца
  const music = [
    { src: "audio/music-story-pulse.mp3", from: 0, to: S("app") + 15, gain: 0.8 },
    { src: "audio/music-story-warm.mp3", from: S("app") - 15, to: total, gain: 1 },
  ];
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
  const { sfx, steps } = useMemo(() => {
    const h = S("hook");
    const c = S("call");
    const cal = S("calendar");
    const app = S("app");
    const t = S("terms");
    const cta = S("cta");
    const stepsAt = sentenceFrames(cues, "n05", "terms", lineById("n05").text);
    const list: Sfx[] = [
      // таймер: тиканье в начале и на последних секундах у двери
      ...timerTicks(0, 6.2).map((at) => ({ at, src: COMMON("tick"), volume: 0.2 })),
      ...timerTicks(BG2_TIMER.stopAt - 3.2, BG2_TIMER.stopAt).map((at) => ({ at, src: COMMON("tick"), volume: 0.14 })),
      { at: h + HOOK.buzz, src: COMMON("vibrate"), volume: 0.4 },
      { at: h + HOOK.phone + 6, src: COMMON("notify"), volume: 0.3 },
      { at: h + 30, src: COMMON("paper"), volume: 0.16 },
      // звонок: вибрация, ответ
      { at: c, src: COMMON("vibrate"), volume: 0.35 },
      { at: c + CALL.pick + 6, src: COMMON("tap"), volume: 0.22 },
      { at: c + 2, src: COMMON("whoosh"), volume: 0.1 },
      // календарь: захват, конфликт, неделя, набор эскертме
      { at: cal + CAL.grab, src: COMMON("tap"), volume: 0.25 },
      { at: cal + CAL.drop, src: COMMON("pop"), volume: 0.22 },
      { at: cal + CAL.back + 16, src: COMMON("tap"), volume: 0.2 },
      { at: cal + CAL.week, src: COMMON("whoosh"), volume: 0.12 },
      { at: cal + CAL.note, src: COMMON("tap"), volume: 0.22 },
      { at: cal + CAL.note + 10, src: COMMON("typing"), volume: 0.14, dur: 2.2, fade: 0.2 },
      { at: cal + CALENDAR.back, src: COMMON("paper"), volume: 0.12 },
      // планшет: касание, раскрытие схемы, машина в пути
      { at: app + APP.tap, src: COMMON("tap"), volume: 0.3 },
      { at: app + APP.morph, src: COMMON("whoosh"), volume: 0.14 },
      { at: app + APP.morningFrom, src: COMMON("car"), volume: 0.08 },
      { at: app + APP.afterFrom, src: COMMON("car"), volume: 0.08 },
      // условия: мягкие отметки пунктов, сообщение сыну, таймер остановлен
      ...stepsAt.map((at) => ({ at: t + at, src: COMMON("pop"), volume: 0.14 })),
      { at: t + TERMS.office + 12, src: COMMON("notify"), volume: 0.2 },
      { at: t + TERMS_STOP, src: COMMON("chime"), volume: 0.18 },
      // финал: линия курсора, фирменный экран
      { at: cta + CTA.wipeFrom, src: COMMON("whoosh"), volume: 0.16 },
      { at: cta + CTA.wipeTo, src: COMMON("chime"), volume: 0.16 },
    ];
    const tr = trackOf(dadWalk, TERMS.walkFrom, s(BG2_SCENES.find((x) => x.id === "terms")!.to) - t, LOOKS.dad.build.stride);
    const st = contactFrames(tr)
      .filter((x) => x >= TERMS.office && x <= TERMS_STOP + 10)
      .map((x, i) => ({ at: t + x, i }));
    return { sfx: list, steps: st };
  }, [cues]);
  return (
    <>
      {music.map((m) => (
        <Sequence key={m.src} name={`Музыка: ${m.src}`} from={m.from} durationInFrames={m.to - m.from}>
          <Audio
            src={staticFile(m.src)}
            trimBefore={m.from}
            volume={(f) => duck(f + m.from) * m.gain * interpolate(f + m.from, [m.from, m.from + FPS, m.to - FPS, m.to], [m.from === 0 ? 1 : 0, 1, 1, m.to >= total ? 1 : 0], clamp)}
          />
        </Sequence>
      ))}
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {steps.map(({ at, i }) => (
        <Sequence key={`step-${at}`} name="Шаг" from={at} durationInFrames={9} premountFor={FPS}>
          <Audio src={staticFile(`${BG2_VIDEO.voiceDir}/sfx/step-soft-${i % 4}.mp3`)} volume={0.12} />
        </Sequence>
      ))}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG2_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

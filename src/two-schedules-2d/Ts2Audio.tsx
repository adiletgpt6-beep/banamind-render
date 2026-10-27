// Звук ролика: голоса, тихая музыка (мягко приглушается под репликами),
// сдержанные звуки быта: шаги, посуда, ноутбук, вибрация телефона, улица.
// Шаги звучат в моменты касания стопы — по тому же расчёту походки,
// что и анимация (rig/gait.ts).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { TS2_FRAMES, TS2_SCENES, TS2_VIDEO } from "./script";
import { ts2Sound, type Ts2Walk } from "./sound";
import type { Ts2Cue } from "./timing";

const FPS = TS2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

// Музыка: слои одной гармонии и темпа (общие файлы проекта), сменяются
// плавно по настроению: утро и первая поездка — легко, звонок и вторая
// поездка — напряжённее, вечер и решение — тепло.
const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 42, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 41, to: 70, gain: 0.75 },
  { src: "audio/music-story-tense.mp3", from: 69, to: 83, gain: 0.7 },
  { src: "audio/music-story-low.mp3", from: 82, to: 103, gain: 0.9 },
  { src: "audio/music-story-warm.mp3", from: 102, to: 121, gain: 0.95 },
];
const MUSIC_VOLUME = 0.24;
const MUSIC_UNDER_VOICE = 0.065;

const stepFrames = (w: Ts2Walk): number[] => {
  const stride = LOOKS[w.look].build.stride;
  const scene = TS2_SCENES.find((x) => s(x.from) === w.start)!;
  const tr = trackOf(w.place, w.gaitFrom, s(scene.to - scene.from), stride);
  return contactFrames(tr).filter((f) => f >= w.from && f <= w.to).map((f) => w.start + f);
};

export const Ts2Audio: React.FC<{ readonly cues: readonly Ts2Cue[] }> = ({ cues }) => {
  // интервалы речи (только реплики с файлом озвучки); близкие реплики
  // объединяются — музыка между ними не поднимается
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
    for (const [a, b] of spans) {
      v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    }
    return v * interpolate(f, [0, 0.8 * FPS, TS2_FRAMES - 2.5 * FPS, TS2_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  const { sfx, steps } = useMemo(() => {
    const snd = ts2Sound(cues);
    return { sfx: snd.sfx, steps: snd.walks.flatMap((w) => stepFrames(w).map((at, i) => ({ at, w, i }))) };
  }, [cues]);
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(TS2_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= TS2_FRAMES ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio
              src={staticFile(x.src)}
              volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)}
            />
          </Sequence>
        );
      })}
      {steps.map(({ at, w, i }) => (
        <Sequence key={`step-${w.start}-${w.from}-${i}-${at}`} name="Шаг" from={at} durationInFrames={9} premountFor={FPS}>
          <Audio
            src={staticFile(`audio/two-schedules-2d/sfx/step-soft${w.child ? "-child" : ""}-${i % 4}.mp3`)}
            volume={(f) => w.volume * (0.9 + (i % 3) * 0.05) * (cues.some((c) => c.file && at + f >= s(c.from) && at + f <= s(c.to)) ? 0.65 : 1)}
          />
        </Sequence>
      ))}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${TS2_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

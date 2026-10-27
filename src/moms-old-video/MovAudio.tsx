// Звук фильма №33: голоса (файл на реплику), тихая тёплая музыка — слои
// одной гармонии и темпа, которые плавно сменяются по сценам (под танцем —
// чуть более ясный пульс, на старой записи — звук «из телефона»), музыка
// мягко приглушается под речью; сдержанные звуки быта по действию сцен
// (sound.ts) и тихие шаги в моменты касания стоп.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { MOV_FRAMES, MOV_VIDEO, sceneById, type MovSceneId } from "./script";
import { movSound } from "./sound";
import type { MovCue } from "./timing";

const FPS = MOV_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);
const at = (id: MovSceneId, sec = 0) => sceneById(id).from + sec;

// Громкость слоёв музыки по времени фильма (с): [время, громкость].
type Env = readonly (readonly [number, number])[];
const MUSIC: readonly { readonly name: string; readonly env: () => Env }[] = [
  {
    // старая запись «из динамика телефона»: громче в полноэкранном начале,
    // тише, когда запись оказывается в телефоне; снова — в повторе поклона
    name: "oldphone",
    env: () => [
      [0, 3.0],
      [2.3, 3.0],
      [3.7, 0.7],
      [at("hook", 7.2), 0.3],
      [at("hook", 8.6), 0],
      [at("remember", 1.2), 0],
      [at("remember", 1.8), 0.5],
      [at("remember", 3.3), 0.5],
      [at("remember", 3.8), 0],
      // 6: запись в телефоне — пока не растворилась в воспоминание
      [at("wish", 2.0), 0],
      [at("wish", 2.4), 0.45],
      [at("wish", 3.4), 0.45],
      [at("wish", 3.9), 0],
    ],
  },
  {
    name: "memory",
    env: () => [
      [0, 0],
      [2.4, 0],
      [3.8, 0.55],
      [at("hook", 8.4), 0.4],
      [at("workday", 1.0), 0],
      [at("remember", 0), 0],
      [at("remember", 1.0), 0.6],
      [at("remember", 8.6), 0.5],
      [at("moves", 0.6), 0],
      // мост на стыке 5 → 6: «шкатулка» входит раньше, чем гаснет пульс
      [at("moves", 16.2), 0],
      [at("wish", 0), 0.5],
      [at("wish", 1.0), 0.6],
      // воспоминание о студии — полнее (до реплики мамы)
      [at("wish", 3.4), 0.65],
      [at("wish", 3.9), 0.95],
      [at("wish", 7.2), 0.95],
      [at("wish", 7.8), 0.6],
      [at("wish", 10.0), 0.55],
      [at("schedule", 0.8), 0],
    ],
  },
  {
    name: "warm",
    env: () => [
      [0, 0],
      [at("hook", 7.6), 0],
      [at("workday", 0.4), 0.85],
      [at("evening", 10.6), 0.75],
      [at("remember", 1.0), 0.25],
      [at("remember", 8.8), 0.25],
      [at("moves", 1.0), 0],
      [at("wish", 9.5), 0],
      [at("schedule", 0.6), 0.8],
      [at("packing", 0), 0.85],
      [at("packing", 9.0), 0.8],
      [at("studio", 0.8), 0],
      [at("newVideo", 8.0), 0],
      [at("cta", 0.8), 0.9],
      [MOV_FRAMES / FPS, 0.9],
    ],
  },
  {
    name: "pulse",
    env: () => [
      [0, 0],
      [at("moves", 0.2), 0],
      [at("moves", 2.6), 1.0],
      [at("moves", 12.2), 0.7],
      [at("moves", 16.6), 0.45],
      [at("wish", 0.8), 0],
      [at("studio", 0), 0],
      [at("studio", 0.8), 0.85],
      [at("newVideo", 0), 1.15],
      [at("newVideo", 8.6), 1.2],
      [at("cta", 1.0), 0.35],
      [at("cta", 18.0), 0.3],
      [MOV_FRAMES / FPS, 0.3],
    ],
  },
];
const MUSIC_VOLUME = 0.42;
const UNDER_VOICE = 0.2; // доля громкости под речью (≈ −14 дБ): речь разборчива и в динамике телефона

const envAt = (env: Env, sec: number) => {
  if (sec <= env[0][0]) return env[0][1];
  for (let i = 1; i < env.length; i++) {
    const [t1, v1] = env[i];
    const [t0, v0] = env[i - 1];
    if (sec <= t1) return t1 <= t0 ? v1 : v0 + ((v1 - v0) * (sec - t0)) / (t1 - t0);
  }
  return env[env.length - 1][1];
};

export const MovAudio: React.FC<{ readonly cues: readonly MovCue[] }> = ({ cues }) => {
  // интервалы речи; близкие реплики объединяются — музыка между ними не поднимается
  const spans: [number, number][] = [];
  for (const c of cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.2)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = 1;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [1, UNDER_VOICE, UNDER_VOICE, 1], clamp));
    return v;
  };
  const master = (f: number) => interpolate(f, [0, 6, MOV_FRAMES - 40, MOV_FRAMES - 2], [0, 1, 1, 0], clamp);
  const { sfx, steps } = useMemo(() => movSound(cues), [cues]);
  return (
    <>
      {MUSIC.map((m) => {
        const env = m.env();
        return (
          <Sequence key={m.name} name={`Музыка: ${m.name}`} durationInFrames={MOV_FRAMES}>
            <Audio src={staticFile(`audio/moms-old-video/music/${m.name}.mp3`)} volume={(f) => MUSIC_VOLUME * envAt(env, f / FPS) * duck(f) * master(f)} />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {steps.map((st, i) => (
        <Sequence key={`step-${i}-${st.at}`} name="Шаг" from={st.at} durationInFrames={10} premountFor={FPS}>
          <Audio src={staticFile(`audio/two-schedules-2d/sfx/step-soft${st.child ? "-child" : ""}-${i % 4}.mp3`)} volume={st.volume * (0.9 + (i % 3) * 0.05)} />
        </Sequence>
      ))}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`audio/moms-old-video/${c.file}`)} volume={c.volume} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

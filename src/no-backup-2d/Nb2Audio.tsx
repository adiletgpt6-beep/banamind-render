// Звук ролика: голоса, музыка (тихо под речью, плавно возвращается в
// паузах) и немного естественных звуков в моменты действий. Моменты
// берутся из тех же констант и реплик, по которым движутся персонажи;
// шаги — в кадры касания стопы (gait.stepFrames). Записи фоли —
// public/audio/no-backup-2d/foley/ (источники и лицензии — SOURCES.json).
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { NB2_CALLS, NB2_FRAMES, NB2_SCENES, NB2_VIDEO, type Nb2SceneId } from "./script";
import type { Nb2Cue } from "./timing";
import { BELT, DRIVE_SHOTS, KEYS } from "./scenes/Drive";
import { SCHOOL_EVENTS, SCHOOL_SHOTS } from "./scenes/School";
import { DECISION } from "./scenes/Evening";
import { FORM } from "./screens";
import { GIRL_TO_SCHOOL, GIRL_YARD, MOM_OFFICE, MOM_YARD, OFFICE_WALK, SCHOOL_WALK, YARD_FROM, YARD_TO } from "./paths";
import { stepFrames } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { FOLEY } from "./foley";

const FPS = NB2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);
const scene = (id: Nb2SceneId) => NB2_SCENES.find((x) => x.id === id)!;

// Музыка по сценам (одна пьеса в разных слоях; файлы 205 с, trimBefore =
// кадр ролика). Соседние сцены с тем же слоем звучат одним отрезком;
// смена слоя — перекрёстный переход 1 с. Границы берутся из NB2_SCENES.
const LAYER: Record<Nb2SceneId, { src: string; gain: number }> = {
  prologue: { src: "low", gain: 0.75 },
  search: { src: "pulse", gain: 0.6 },
  reassure: { src: "warm", gain: 0.8 },
  drive: { src: "morning", gain: 0.8 },
  school: { src: "low", gain: 0.8 },
  evening: { src: "low", gain: 0.75 },
  decision: { src: "warm", gain: 0.85 },
  cta: { src: "warm", gain: 0.85 },
};
export const MUSIC = NB2_SCENES.reduce<{ src: string; from: number; to: number; gain: number }[]>((acc, sc) => {
  const l = LAYER[sc.id];
  const last = acc[acc.length - 1];
  if (last && last.src === `audio/music-story-${l.src}.mp3`) last.to = sc.to;
  else acc.push({ src: `audio/music-story-${l.src}.mp3`, from: sc.from, to: sc.to, gain: l.gain });
  return acc;
}, []).map((m, i, all) => ({ ...m, to: i < all.length - 1 ? m.to + 0.5 : m.to, from: i > 0 ? m.from - 0.5 : m.from }));

export const MUSIC_VOLUME = 0.8;
const MUSIC_UNDER_VOICE = 0.085;
// Общий запас громкости речи.
const VOICE_GAIN = 1.08;
// Удалённые собеседники по телефону — немного тише и «дальше».
const PHONE_GAIN = 0.92;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number; readonly trimBefore?: number; readonly rate?: number };
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

// Шаги: 2–3 варианта записи по очереди, разная масса у мамы и дочки.
const steps = (frames: readonly { frame: number }[], base: number, kind: "adult" | "child", volume: number): Sfx[] => {
  const set = kind === "adult" ? FOLEY.stepAdult : FOLEY.stepChild;
  if (!set.length) return [];
  return frames.map((st, i) => ({ at: base + st.frame, src: set[i % set.length], volume: volume * (0.85 + 0.15 * ((i * 7) % 3) / 2), rate: kind === "child" ? 1.12 : 1 }));
};

export const nb2Sfx = (cues: readonly Nb2Cue[]): Sfx[] => {
  const cue = (id: string) => cues.find((c) => c.id === id)!;
  const P = s(scene("prologue").from);
  const R = s(scene("reassure").from);
  const D = s(scene("drive").from);
  const S = s(scene("school").from);
  const E = s(scene("evening").from);
  const X = s(scene("decision").from);
  const C = s(scene("cta").from);
  const endCall = s(cue("m03").to) + 8;
  const keysAt = s(cue("m02").to) + KEYS.grab;
  const form = FORM(DECISION.toForm);
  const mom = LOOKS.mom.build.stride;
  const girl = LOOKS.girl.build.stride;
  const list: (Sfx | null)[] = [
    // пролог: вибрация и уведомление на телефоне папы
    { at: P, src: COMMON("vibrate"), volume: 0.24 },
    { at: P + 3, src: COMMON("notify"), volume: 0.12 },
    // три звонка: нажатие вызова, гудок; нажатие отбоя
    ...NB2_CALLS.flatMap((c) => [
      { at: s(c.from) + 9, src: "audio/no-backup-2d/sfx/call.mp3", volume: 0.2 },
      { at: s(c.to) - 22 + 11, src: COMMON("tap"), volume: 0.08 },
    ]),
    // дочка опускает тетрадь в рюкзак
    FOLEY.rustle ? { at: R + 26, src: FOLEY.rustle, volume: 0.16, dur: 0.6, fade: 0.1 } : null,
    // утро: отбой, телефон в сумку, ключи с крючка
    { at: endCall, src: COMMON("tap"), volume: 0.07 },
    FOLEY.rustle ? { at: endCall + 20, src: FOLEY.rustle, volume: 0.18, dur: 0.6, fade: 0.1 } : null,
    FOLEY.keys ? { at: keysAt - 2, src: FOLEY.keys, volume: 0.22, dur: 1.0, fade: 0.15 } : null,
    // двор: дверь подъезда закрывается за ними, шаги, спокойный фон
    FOLEY.doorClose ? { at: D + YARD_FROM + 2, src: FOLEY.doorClose, volume: 0.18 } : null,
    FOLEY.ambYard ? { at: D + YARD_FROM, src: FOLEY.ambYard, volume: 0.22, dur: (YARD_TO - YARD_FROM) / FPS + 0.3, fade: 0.4 } : null,
    ...steps(stepFrames(MOM_YARD, YARD_FROM, YARD_TO, mom), D, "adult", 0.16),
    ...steps(stepFrames(GIRL_YARD, YARD_FROM, YARD_TO, girl), D, "child", 0.1),
    // ремень: протяжка ленты, мягкий щелчок в момент соединения
    FOLEY.beltPull ? { at: D + BELT.grab + 4, src: FOLEY.beltPull, volume: 0.16, dur: 0.9, fade: 0.15 } : null,
    FOLEY.beltClick ? { at: D + BELT.click, src: FOLEY.beltClick, volume: 0.2 } : null,
    FOLEY.carDoor ? { at: D + DRIVE_SHOTS.belt[1] - 8, src: FOLEY.carDoor, volume: 0.16 } : null,
    // салон и улица: ровный фон поездки
    FOLEY.ambCar ? { at: D + DRIVE_SHOTS.cabin[0], src: FOLEY.ambCar, volume: 0.3, dur: (DRIVE_SHOTS.light[1] - DRIVE_SHOTS.cabin[0]) / FPS, fade: 0.4 } : null,
    FOLEY.ambStreet ? { at: D + DRIVE_SHOTS.light[0], src: FOLEY.ambStreet, volume: 0.2, dur: (DRIVE_SHOTS.light[1] - DRIVE_SHOTS.light[0]) / FPS, fade: 0.3 } : null,
    // школа: двор, шаги дочки к двери, вибрация в сумке, шорох
    FOLEY.ambYard ? { at: S, src: FOLEY.ambYard, volume: 0.2, dur: SCHOOL_SHOTS.message[1] / FPS, fade: 0.5 } : null,
    ...steps(stepFrames(GIRL_TO_SCHOOL, SCHOOL_WALK.from - 10, SCHOOL_WALK.to + 20, girl), S, "child", 0.08),
    { at: S + SCHOOL_EVENTS.vibrate, src: COMMON("vibrate"), volume: 0.22 },
    FOLEY.rustle ? { at: S + SCHOOL_EVENTS.phoneOut - 10, src: FOLEY.rustle, volume: 0.18, dur: 0.6, fade: 0.1 } : null,
    // офис: дверь, шаги по полу, сумка на стол, тихий фон комнаты
    FOLEY.doorOpen ? { at: S + SCHOOL_EVENTS.doorOpen, src: FOLEY.doorOpen, volume: 0.18 } : null,
    ...steps(stepFrames(MOM_OFFICE, OFFICE_WALK.from - 4, OFFICE_WALK.to + 20, mom), S, "adult", 0.13),
    FOLEY.bagDown ? { at: S + SCHOOL_EVENTS.bagDown, src: FOLEY.bagDown, volume: 0.2 } : null,
    FOLEY.ambRoom ? { at: S + SCHOOL_SHOTS.office[0], src: FOLEY.ambRoom, volume: 0.3, dur: (SCHOOL_SHOTS.office[1] - SCHOOL_SHOTS.office[0]) / FPS, fade: 0.4 } : null,
    // вечер: тихая комната
    FOLEY.ambRoom ? { at: E, src: FOLEY.ambRoom, volume: 0.22, dur: (X - E) / FPS, fade: 0.6 } : null,
    // заявка: касание кнопки, проверка полей, отправка
    { at: X + DECISION.toForm - 8, src: COMMON("tap"), volume: 0.1 },
    ...form.checks.map((at) => ({ at: X + at, src: COMMON("tap"), volume: 0.08 })),
    { at: X + form.send, src: COMMON("tap"), volume: 0.12 },
    { at: X + form.sent, src: COMMON("notify"), volume: 0.12 },
    // финал
    { at: C + 3, src: COMMON("chime"), volume: 0.12 },
  ];
  return list.filter((x): x is Sfx => Boolean(x && x.src));
};

const PHONE_ROLES = new Set(["grandmother", "brother", "friend"]);

export const Nb2Audio: React.FC<{ readonly cues: readonly Nb2Cue[] }> = ({ cues }) => {
  // интервалы речи; близкие реплики объединяются — музыка между ними не поднимается
  const spans: [number, number][] = [];
  for (const c of cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(2.2)) last[1] = b;
    else spans.push([a, b]);
  }
  // плавно: 0,4 с вниз перед речью, 1,2 с обратно после неё
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) {
      v = Math.min(v, interpolate(f, [a - 12, a, b + 6, b + 42], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    }
    // начало и финальное затухание (последние 2 с)
    return v * interpolate(f, [0, 0.6 * FPS, NB2_FRAMES - 2 * FPS, NB2_FRAMES - 1], [0.4, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(NB2_FRAMES, s(m.to));
        return (
          <Sequence key={`${m.src}-${m.from}`} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= NB2_FRAMES ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {nb2Sfx(cues).map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio
              src={staticFile(x.src)}
              trimBefore={x.trimBefore}
              playbackRate={x.rate}
              loop={Boolean(dur && dur > 7.5 * FPS)}
              volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)}
            />
          </Sequence>
        );
      })}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${NB2_VIDEO.voiceDir}/${c.file}`)} volume={VOICE_GAIN * (PHONE_ROLES.has(c.role) ? PHONE_GAIN : 1)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

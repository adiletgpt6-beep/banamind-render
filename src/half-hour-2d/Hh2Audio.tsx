import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { HH2_FRAMES, HH2_VIDEO } from "./script";
import type { Hh2Cue } from "./timing";

const FPS = HH2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

// Музыка: слои одной гармонии и темпа (из «Бир таң»), сменяются плавно.
// Музыка заметно тише речи и приглушается под репликами.
const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 15, gain: 0.9 },
  { src: "audio/music-story-pulse.mp3", from: 14, to: 44, gain: 0.85 },
  { src: "audio/music-story-tense.mp3", from: 43, to: 64, gain: 0.8 },
  { src: "audio/music-story-low.mp3", from: 63, to: 96, gain: 0.95 },
  { src: "audio/music-story-warm.mp3", from: 95, to: 121, gain: 0.95 },
];
const MUSIC_VOLUME = 0.32;
const MUSIC_UNDER_VOICE = 0.08;
const VOICE_VOLUME = 1.0;

export type Hh2Sfx = {
  readonly at: number; // секунды ролика
  readonly sound: "vibrate" | "tap" | "tick" | "car" | "traffic" | "bell" | "typing" | "notify" | "whoosh" | "pop" | "paper";
  readonly volume: number;
};

export const HH2_SFX: readonly Hh2Sfx[] = [
  { at: 0.3, sound: "typing", volume: 0.18 },
  { at: 12.3, sound: "paper", volume: 0.3 },
  { at: 21.6, sound: "typing", volume: 0.2 },
  { at: 24.2, sound: "tick", volume: 0.3 },
  { at: 30.4, sound: "bell", volume: 0.3 },
  { at: 36.9, sound: "vibrate", volume: 0.45 },
  { at: 41.1, sound: "notify", volume: 0.3 },
  { at: 44.3, sound: "whoosh", volume: 0.15 },
  { at: 47.6, sound: "traffic", volume: 0.3 },
  { at: 55.6, sound: "traffic", volume: 0.25 },
  { at: 59.4, sound: "car", volume: 0.3 },
  { at: 86.2, sound: "vibrate", volume: 0.3 },
  { at: 110.9, sound: "tap", volume: 0.5 },
  { at: 111.6, sound: "notify", volume: 0.35 },
  { at: 114.2, sound: "pop", volume: 0.25 },
];

const SFX_FILES: Record<Hh2Sfx["sound"], string> = {
  vibrate: "audio/sfx-vibrate.mp3",
  tap: "audio/sfx-tap.mp3",
  tick: "audio/sfx-tick.mp3",
  car: "audio/sfx-car.mp3",
  traffic: "audio/sfx-traffic.mp3",
  bell: "audio/sfx-bell.mp3",
  typing: "audio/sfx-typing.mp3",
  notify: "audio/sfx-notify.mp3",
  whoosh: "audio/sfx-whoosh.mp3",
  pop: "audio/sfx-pop.mp3",
  paper: "audio/sfx-paper.mp3",
};

export const Hh2Audio: React.FC<{ readonly cues: readonly Hh2Cue[] }> = ({ cues }) => {
  // интервалы речи (кадры); близкие реплики объединяются — музыка не
  // поднимается между ними
  const spans: [number, number][] = [];
  for (const c of cues) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.6)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) {
      v = Math.min(
        v,
        interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp),
      );
    }
    return v * interpolate(f, [0, 0.6 * FPS, HH2_FRAMES - 2.5 * FPS, HH2_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(HH2_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) =>
                duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= HH2_FRAMES ? 1 : 0], clamp)
              }
            />
          </Sequence>
        );
      })}
      {HH2_SFX.map((cue, i) => (
        <Sequence key={`${cue.sound}-${i}`} name={`Эффект: ${cue.sound}`} from={s(cue.at)} premountFor={FPS}>
          <Audio src={staticFile(SFX_FILES[cue.sound])} volume={cue.volume} />
        </Sequence>
      ))}
      {cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id} (${c.role})`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio src={staticFile(`${HH2_VIDEO.voiceDir}/${c.file}`)} volume={VOICE_VOLUME} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

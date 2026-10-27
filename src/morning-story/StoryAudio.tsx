import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { MS_VIDEO, type StorySceneId } from "./script";
import { sceneFrom } from "./StoryContext";
import type { StoryTimeline } from "./storyTimeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Музыкальная драматургия: какой слой звучит от какой сцены до какой.
// Слои одной длины, темпа и гармонии — переходят друг в друга плавно.
const MUSIC: readonly {
  src: string;
  from: StorySceneId;
  to?: StorySceneId;
  gain: number;
}[] = [
  { src: "audio/music-story-morning.mp3", from: "s01Morning", to: "s03Order", gain: 1 },
  { src: "audio/music-story-pulse.mp3", from: "s03Order", to: "s09Office", gain: 0.9 },
  { src: "audio/music-story-tense.mp3", from: "s06Traffic", to: "s07Ride", gain: 1 },
  { src: "audio/music-story-low.mp3", from: "s09Office", to: "s10Idea", gain: 1 },
  { src: "audio/music-story-warm.mp3", from: "s10Idea", gain: 0.95 },
];

const MUSIC_VOLUME = 0.4;
const MUSIC_UNDER_VOICE = 0.11;
const VOICE_VOLUME = 1.1;

export type StorySfx = {
  readonly scene: StorySceneId;
  readonly at: number; // кадр относительно начала сцены
  readonly sound:
    | "alarm"
    | "vibrate"
    | "tap"
    | "ringback"
    | "tick"
    | "car"
    | "traffic"
    | "bell"
    | "typing"
    | "notify"
    | "whoosh"
    | "pop";
  readonly volume: number;
};

const SFX_FILES: Record<StorySfx["sound"], string> = {
  alarm: "audio/sfx-alarm.mp3",
  vibrate: "audio/sfx-vibrate.mp3",
  tap: "audio/sfx-tap.mp3",
  ringback: "audio/sfx-ringback.mp3",
  tick: "audio/sfx-tick.mp3",
  car: "audio/sfx-car.mp3",
  traffic: "audio/sfx-traffic.mp3",
  bell: "audio/sfx-bell.mp3",
  typing: "audio/sfx-typing.mp3",
  notify: "audio/sfx-notify.mp3",
  whoosh: "audio/sfx-whoosh.mp3",
  pop: "audio/sfx-pop.mp3",
};

// Интервалы речи (кадры ролика) — для приглушения музыки под голосом.
const speechSpans = (tl: StoryTimeline, fps: number) => {
  const out: [number, number][] = [];
  for (const l of tl.lines) {
    const last = out[out.length - 1];
    if (last && l.speechFrom - last[1] < Math.round(0.9 * fps))
      last[1] = l.speechTo;
    else out.push([l.speechFrom, l.speechTo]);
  }
  return out;
};

export const StoryAudio: React.FC<{
  readonly timeline: StoryTimeline;
  readonly sfx: readonly StorySfx[];
}> = ({ timeline, sfx }) => {
  const { fps } = useVideoConfig();
  const total = timeline.durationInFrames;
  const speech = speechSpans(timeline, fps);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of speech) {
      v = Math.min(
        v,
        interpolate(
          f,
          [a - 8, a, b, b + 14],
          [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME],
          clamp,
        ),
      );
    }
    // мягкое начало и финальное затухание музыки
    return (
      v *
      interpolate(
        f,
        [0, 0.6 * fps, total - 3 * fps, total - 3],
        [0, 1, 1, 0],
        clamp,
      )
    );
  };

  return (
    <>
      {MUSIC.map((m) => {
        const start = sceneFrom(timeline, m.from);
        const end = m.to ? sceneFrom(timeline, m.to) : total + fps;
        return (
          <Audio
            key={m.src}
            name={`Музыка: ${m.src.replace("audio/music-story-", "")}`}
            src={staticFile(m.src)}
            volume={(f) =>
              duck(f) *
              m.gain *
              interpolate(
                f,
                [start - 0.6 * fps, start + 0.9 * fps, end - 0.5 * fps, end + 1.2 * fps],
                [start <= 0 ? 1 : 0, 1, 1, 0],
                clamp,
              )
            }
          />
        );
      })}
      {sfx.map((cue, i) => {
        const at = sceneFrom(timeline, cue.scene) + cue.at;
        return (
          <Sequence
            key={`${cue.sound}-${i}`}
            name={`Эффект: ${cue.sound}`}
            from={Math.max(0, at)}
            premountFor={fps}
          >
            <Audio src={staticFile(SFX_FILES[cue.sound])} volume={cue.volume} />
          </Sequence>
        );
      })}
      {timeline.lines.map((l) =>
        l.file ? (
          <Sequence
            key={l.id}
            name={`Голос: ${l.id} (${l.role})`}
            from={l.from}
            durationInFrames={l.durationInFrames + 2}
            premountFor={fps}
          >
            <Audio
              src={staticFile(`${MS_VIDEO.voiceDir}/${l.file}`)}
              volume={VOICE_VOLUME}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

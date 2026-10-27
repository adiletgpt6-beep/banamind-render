// Звук «Жооп берилбеген кат»: голоса, музыка (спокойное любопытство →
// лёгкое рабочее движение повседневности → умеренное напряжение календаря
// → теплее и тише в эпизоде с рисунком → спокойная решимость ответа и
// финала; во время речи заметно ниже голоса) и редкие эффекты по событию.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { sceneById } from "./layout";
import { UL2_FRAMES, UL2_VIDEO } from "./script";
import { ul2Sfx } from "./sound";
import type { Ul2Cue } from "./timing";

const FPS = UL2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

export const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 21, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 20, to: 47, gain: 0.6 },
  { src: "audio/music-story-tense.mp3", from: 46, to: 80, gain: 0.5 },
  { src: "audio/music-story-warm.mp3", from: 79, to: 121, gain: 0.9 },
];
// Эпизод с рисунком: музыка ещё тише (эмоции нужно место).
const DRAWING = sceneById("drawing");
const MUSIC_VOLUME = 0.3;
const MUSIC_UNDER_VOICE = 0.06;

export const Ul2Audio: React.FC<{ readonly cues: readonly Ul2Cue[] }> = ({ cues }) => {
  const spans = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of cues.filter((x) => x.file)) {
      const a = s(c.from);
      const b = s(c.to);
      const last = out[out.length - 1];
      if (last && a - last[1] < s(1.2)) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [cues]);
  const sfx = useMemo(() => ul2Sfx(cues), [cues]);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    const dip = interpolate(f, [s(DRAWING.from), s(DRAWING.from) + 20, s(DRAWING.to) - 20, s(DRAWING.to)], [1, 0.7, 0.7, 1], clamp);
    return v * dip * interpolate(f, [0, 0.6 * FPS, UL2_FRAMES - 1.6 * FPS, UL2_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(UL2_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio src={staticFile(m.src)} trimBefore={a} volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= UL2_FRAMES ? 1 : 0], clamp)} />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={s(x.at)} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role}, ${c.mode})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${UL2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

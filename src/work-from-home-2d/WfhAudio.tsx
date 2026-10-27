// Звук фильма: голоса (каждая из 19 реплик — свой файл, ровно один раз),
// мягкая музыка из слоёв проекта (без вокала, собственная генерация) с
// приглушением под речь — особенно тихо под ответом мамы M02 и просьбой
// сына B01 — и очень тихие бытовые звуки. Музыка и голос заканчиваются
// внутри файла.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { WFH_FRAMES, WFH_VIDEO } from "./script";
import { wfhSfx } from "./sound";
import type { WfhCue } from "./timing";

const FPS = WFH_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

// Слои одной гармонии: начало — лёгкое любопытство, обычный день —
// сдержанный ритм, поздний вечер — тише, после помощи папы — тепло.
const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-low.mp3", from: 0, to: 21.5, gain: 0.9 },
  { src: "audio/music-story-pulse.mp3", from: 20.5, to: 55.5, gain: 0.62 },
  { src: "audio/music-story-low.mp3", from: 54.5, to: 69.5, gain: 0.8 },
  { src: "audio/music-story-warm.mp3", from: 68.5, to: WFH_FRAMES / FPS, gain: 0.9 },
];
export const MUSIC_VOLUME = 0.2;
const UNDER_VOICE = 0.055;
const QUIET_LINES = new Set(["M02", "B01"]); // под ними музыка почти не слышна
const UNDER_QUIET = 0.022;

export const WfhAudio: React.FC<{ readonly cues: readonly WfhCue[] }> = ({ cues }) => {
  const spans = useMemo(() => {
    const out: { a: number; b: number; v: number }[] = [];
    for (const c of cues.filter((x) => x.file)) {
      const v = QUIET_LINES.has(c.id) ? UNDER_QUIET : UNDER_VOICE;
      out.push({ a: s(c.from), b: s(c.to), v });
    }
    return out;
  }, [cues]);
  const end = WFH_FRAMES;
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const { a, b, v: low } of spans) {
      const pre = low === UNDER_QUIET ? 30 : 12;
      const post = low === UNDER_QUIET ? 40 : 20;
      v = Math.min(v, interpolate(f, [a - pre, a, b, b + post], [MUSIC_VOLUME, low, low, MUSIC_VOLUME], clamp));
    }
    // мягкое начало и завершение внутри файла
    return v * interpolate(f, [0, 0.6 * FPS, end - 2.6 * FPS, end - 0.4 * FPS], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => wfhSfx(cues), [cues]);
  return (
    <>
      {MUSIC.map((m, i) => {
        const a = s(m.from);
        const b = Math.min(end, s(m.to));
        return (
          <Sequence key={`${m.src}-${i}`} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= end ? 1 : 0], clamp)}
            />
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
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${WFH_VIDEO.voiceDir}/${c.file}`)} volume={c.role === "son" ? 1.06 : 1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

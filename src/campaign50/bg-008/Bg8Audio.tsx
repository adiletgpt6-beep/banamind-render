// Звук ролика: голоса; негромкая музыка (общие файлы проекта, только
// чтение): до решения мамы — сдержанная низкая тема (звук телефона на
// первом плане), с её поиска — спокойная тёплая тема; под речью музыка
// почти уходит. Саунд-дизайн телефона (вибрация, пропущенный, гудки,
// касания) и улицы — по тем же моментам, что и анимация (sound.ts).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG8_FRAMES, BG8_VIDEO } from "./script";
import { bg8Sfx } from "./sound";
import type { Bg8Cue } from "./timing";

const FPS = BG8_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-low.mp3", from: 0, to: 33.5, gain: 0.75 },
  { src: "audio/music-story-warm.mp3", from: 32.5, to: 73, gain: 0.95 },
];
const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.05;

export const Bg8Audio: React.FC<{ readonly cues: readonly Bg8Cue[] }> = ({ cues }) => {
  const spans: [number, number][] = [];
  for (const c of cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.2)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) {
      v = Math.min(v, interpolate(f, [a - 10, a, b, b + 15], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    }
    return v * interpolate(f, [0, 0.5 * FPS, BG8_FRAMES - 2.5 * FPS, BG8_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => bg8Sfx(cues), [cues]);
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(BG8_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= BG8_FRAMES ? 1 : 0], clamp)}
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
      {cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG8_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

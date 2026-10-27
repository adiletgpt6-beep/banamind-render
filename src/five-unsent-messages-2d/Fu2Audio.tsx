// Звук «Беш жөнөтүлбөгөн үн билдирүү»: голоса, музыка (мягкое любопытство →
// лёгкая занятость будней → тише в субботу, совсем тихо после «Сага.» →
// тёплая основа прослушивания, ужина и финала; заметно ниже голоса) и
// редкие эффекты по событию. В субботу запись сначала звучит чуть дальше
// (отец в коридоре), затем ближе — речь остаётся разборчивой.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { FU2_FRAMES, FU2_VIDEO } from "./script";
import { fu2Sfx } from "./sound";
import type { Fu2Cue } from "./timing";

const FPS = FU2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 15, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 14, to: 42.5, gain: 0.62 },
  { src: "audio/music-story-low.mp3", from: 41.5, to: 67, gain: 0.8 },
  { src: "audio/music-story-warm.mp3", from: 66, to: 121, gain: 0.9 },
];
// После «Сага.» музыка становится ещё тише (пауза значима).
const SAGA_DIP: readonly [number, number] = [54.6, 57.6];
const MUSIC_VOLUME = 0.3;
const MUSIC_UNDER_VOICE = 0.06;

export const Fu2Audio: React.FC<{ readonly cues: readonly Fu2Cue[] }> = ({ cues }) => {
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
  const sfx = useMemo(() => fu2Sfx(cues), [cues]);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    const dip = interpolate(f, [s(SAGA_DIP[0]), s(SAGA_DIP[0]) + 12, s(SAGA_DIP[1]) - 12, s(SAGA_DIP[1])], [1, 0.45, 0.45, 1], clamp);
    return v * dip * interpolate(f, [0, 0.6 * FPS, FU2_FRAMES - 1.6 * FPS, FU2_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(FU2_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio src={staticFile(m.src)} trimBefore={a} volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= FU2_FRAMES ? 1 : 0], clamp)} />
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
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${FU2_VIDEO.voiceDir}/${c.file}`)} volume={c.id === "sat-monday" ? (f) => interpolate(f, [0, 0.9 * FPS, 1.6 * FPS], [0.62, 0.75, 1], clamp) : 1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

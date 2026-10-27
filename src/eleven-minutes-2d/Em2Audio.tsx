// Звук «Он бир мүнөт»: голоса, музыка (любопытство → умеренное напряжение
// → тёплый финал; заметно тише под речью) и редкие эффекты по событию:
// мягкий щелчок календаря, короткая отметка новой задержки, дверь,
// школьный фон, улица. Без шагов, тиканья и резких сигналов.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { EM2_FRAMES, EM2_STAGES, EM2_VIDEO } from "./script";
import { em2Sfx } from "./sound";
import { STAGE_AT } from "./story";
import type { Em2Cue } from "./timing";

const FPS = EM2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC: readonly { src: string; from: number; to: number; gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: 0, to: 27, gain: 0.85 },
  { src: "audio/music-story-pulse.mp3", from: 26, to: 68, gain: 0.8 },
  { src: "audio/music-story-tense.mp3", from: 67, to: 83, gain: 0.75 },
  { src: "audio/music-story-low.mp3", from: 82, to: 101, gain: 0.85 },
  { src: "audio/music-story-warm.mp3", from: 100, to: 121, gain: 1 },
];
const MUSIC_VOLUME = 0.3;
const MUSIC_UNDER_VOICE = 0.06;

export const Em2Audio: React.FC<{ readonly cues: readonly Em2Cue[] }> = ({ cues }) => {
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
  const sfx = useMemo(() => em2Sfx(cues), [cues]);
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.6 * FPS, EM2_FRAMES - 2 * FPS, EM2_FRAMES - 2], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      {MUSIC.map((m) => {
        const a = s(m.from);
        const b = Math.min(EM2_FRAMES, s(m.to));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.replace("audio/music-story-", "")}`} from={a} durationInFrames={b - a}>
            <Audio src={staticFile(m.src)} trimBefore={a} volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= EM2_FRAMES ? 1 : 0], clamp)} />
          </Sequence>
        );
      })}
      {/* отметка каждой новой задержки (по тем же моментам, что журнал) */}
      {EM2_STAGES.map((st) => (
        <Sequence key={`mark-${st.id}`} name={`Отметка: ${st.label}`} from={s(STAGE_AT[st.id])} durationInFrames={s(0.6)} premountFor={FPS}>
          <Audio src={staticFile("audio/eleven-minutes-2d/sfx/mark.mp3")} volume={st.id === "drive" ? 0.35 : 0.28} />
        </Sequence>
      ))}
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
            <Audio src={staticFile(`${EM2_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

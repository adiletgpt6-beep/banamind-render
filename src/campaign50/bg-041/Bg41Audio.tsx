// Звук ролика:
//   • голос диктора (реплики по шкале озвучки);
//   • музыка — тёплая тема проекта (общий файл, только чтение): под речью
//     почти уходит, во время перемотки приглушается ещё сильнее — звучит
//     мягкий шелест «плёнки»; в финале — чуть громче, к концу затухает;
//   • эффекты плёнки по состоянию пульта: ◀◀ шелест перемотки, ❚❚/▶
//     щелчок кнопки, ▶▶ быстрая прокрутка вперёд (sound.ts + сцены).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { hudAtFrame } from "./edit";
import { BG41_VIDEO } from "./script";
import { bg41Sfx } from "./sound";
import { sceneOf, type Bg41Timeline } from "./timing";

const FPS = BG41_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.16;
const MUSIC_UNDER_VOICE = 0.055;
const MUSIC_REW = 0.03;

export const Bg41Audio: React.FC<{ readonly tl: Bg41Timeline }> = ({ tl }) => {
  const total = tl.frames;
  // маска перемотки по кадрам (сглажена ±5 кадров)
  const rew = useMemo(() => {
    const raw = Array.from({ length: total }, (_, f) => (hudAtFrame(tl, f)?.mode === "rew" ? 1 : 0));
    return raw.map((_, f) => {
      let a = 0;
      for (let k = -5; k <= 5; k++) a += raw[Math.max(0, Math.min(total - 1, f + k))];
      return a / 11;
    });
  }, [tl, total]);
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const e = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(0.8)) last[1] = e;
    else spans.push([a, e]);
  }
  const ctaFrom = s(sceneOf(tl, "cta").from);
  const music = (f: number) => {
    let v = f >= ctaFrom ? MUSIC_VOLUME * 1.15 : MUSIC_VOLUME;
    for (const [a, e] of spans) v = Math.min(v, interpolate(f, [a - 8, a, e, e + 12], [v, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, v], clamp));
    v = v + (MUSIC_REW - v) * (rew[f] ?? 0) * 0.85;
    return v * interpolate(f, [0, 0.4 * FPS, total - 2.6 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => bg41Sfx(tl), [tl]);
  return (
    <>
      <Sequence name="Музыка" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={music} />
      </Sequence>
      {sfx.map((e, i) => {
        const dur = e.dur ? Math.max(2, s(e.dur)) : undefined;
        const fade = e.fade ? s(e.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${e.src.split("/").pop()}`} from={Math.max(0, s(e.at))} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(e.src)} volume={(f) => e.volume * (dur && fade ? interpolate(f, [0, fade, Math.max(fade + 1, dur - fade), dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG41_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

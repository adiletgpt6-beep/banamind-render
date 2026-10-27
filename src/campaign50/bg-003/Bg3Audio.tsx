// Звук ролика: голоса (диктор и мысль мамы); музыка — общие файлы проекта
// (только чтение): «спешка» (тиканье, пульс) до момента поиска, затем
// плавный переход в тёплую тему BalaGo; под речью музыка почти уходит.
// Эффекты — по моментам анимации (sound.ts).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Bg3Beats } from "./beats";
import { BG3_VIDEO } from "./script";
import { bg3Sfx } from "./sound";
import type { Bg3Timeline } from "./timing";

const FPS = BG3_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_RUSH = "audio/music-story-pulse.mp3";
const MUSIC_WARM = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.2;
const MUSIC_UNDER_VOICE = 0.06;

export const Bg3Audio: React.FC<{ readonly tl: Bg3Timeline; readonly b: Bg3Beats }> = ({ tl, b }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const e = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.0)) last[1] = e;
    else spans.push([a, e]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, e] of spans) v = Math.min(v, interpolate(f, [a - 8, a, e, e + 12], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.4 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const xf = s(b.search.from - 0.6); // переход: спешка → тёплая тема
  const xlen = s(1.6);
  const sfx = useMemo(() => bg3Sfx(b), [b]);
  return (
    <>
      <Sequence name="Музыка: спешка" durationInFrames={xf + xlen}>
        <Audio src={staticFile(MUSIC_RUSH)} volume={(f) => duck(f) * interpolate(f, [xf, xf + xlen], [1, 0], clamp)} />
      </Sequence>
      <Sequence name="Музыка: BalaGo" from={xf} durationInFrames={total - xf}>
        <Audio src={staticFile(MUSIC_WARM)} volume={(f) => duck(f + xf) * interpolate(f, [0, xlen], [0, 1], clamp)} />
      </Sequence>
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={Math.max(0, s(x.at))} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG3_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

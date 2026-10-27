// Звук ролика: голоса (сын, мама, диктор); музыка (общие файлы проекта,
// только чтение): тихая «тягучая» тема длинного дня → тёплая тема с момента,
// когда сын показывает рисунок и семья находит мысль о маршруте; под речью
// музыка почти уходит; мягкие эффекты по моментам анимации (sound.ts).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { BG13_VIDEO } from "./script";
import { bg13Sfx } from "./sound";
import { sceneOf, type Bg13Timeline } from "./timing";

const FPS = BG13_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const DAY = "audio/music-story-low.mp3";
const WARM = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.18;
const MUSIC_UNDER_VOICE = 0.05;

export const Bg13Audio: React.FC<{ readonly tl: Bg13Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
    const a = s(c.from);
    const e = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(0.8)) last[1] = e;
    else spans.push([a, e]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, e] of spans) v = Math.min(v, interpolate(f, [a - 8, a, e, e + 12], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.4 * FPS, total - 2.5 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const x = s(sceneOf(tl, "drawing").from);
  const sfx = useMemo(() => bg13Sfx(tl), [tl]);
  return (
    <>
      <Sequence name="Музыка: длинный день" durationInFrames={x + s(1.6)}>
        <Audio src={staticFile(DAY)} volume={(f) => duck(f) * interpolate(f, [x - s(0.4), x + s(1.5)], [1, 0], clamp)} />
      </Sequence>
      <Sequence name="Музыка: решение" from={x - s(0.4)} durationInFrames={total - x + s(0.4)}>
        <Audio src={staticFile(WARM)} volume={(f) => duck(f + x - s(0.4)) * interpolate(f, [0, s(1.6)], [0, 1], clamp)} />
      </Sequence>
      {sfx.map((e, i) => {
        const dur = e.dur ? s(e.dur) : undefined;
        const fade = e.fade ? s(e.fade) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${e.src.split("/").pop()}`} from={Math.max(0, s(e.at))} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(e.src)} volume={(f) => e.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id}`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG13_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

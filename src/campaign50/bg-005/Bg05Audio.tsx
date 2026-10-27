// Звук ролика: голоса диктора и мамы; негромкая ритмичная музыка (общий файл
// проекта, только чтение, 205 с — без шва петли), под речью почти уходит; мягкие эффекты
// карты, телефона и заявки по моментам анимации (sound.ts).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import type { Bg05Beats } from "./beats";
import { BG05_VIDEO } from "./script";
import { bg05Sfx } from "./sound";
import type { Bg05Timeline } from "./timing";

const FPS = BG05_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-pulse.mp3";
const MUSIC_VOLUME = 0.18;
const MUSIC_UNDER_VOICE = 0.055;

export const Bg05Audio: React.FC<{
  readonly tl: Bg05Timeline;
  readonly b: Bg05Beats;
}> = ({ tl, b }) => {
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
    for (const [a, e] of spans)
      v = Math.min(
        v,
        interpolate(
          f,
          [a - 8, a, e, e + 12],
          [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME],
          clamp,
        ),
      );
    return (
      v *
      interpolate(
        f,
        [0, 0.4 * FPS, total - 2.5 * FPS, total - 2],
        [0, 1, 1, 0],
        clamp,
      )
    );
  };
  const sfx = useMemo(() => bg05Sfx(b), [b]);
  return (
    <>
      <Sequence name="Музыка" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} loop volume={(f) => duck(f)} />
      </Sequence>
      {sfx.map((x, i) => {
        const dur = x.dur ? s(x.dur) : undefined;
        const fade = x.fade ? s(x.fade) : 0;
        return (
          <Sequence
            key={`sfx-${i}`}
            name={`Эффект: ${x.src.split("/").pop()}`}
            from={Math.max(0, s(x.at))}
            durationInFrames={dur}
            premountFor={FPS}
          >
            <Audio
              src={staticFile(x.src)}
              volume={(f) =>
                x.volume *
                (dur && fade
                  ? interpolate(
                      f,
                      [0, fade, dur - fade, dur],
                      [0, 1, 1, 0],
                      clamp,
                    )
                  : 1)
              }
            />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id}`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio
              src={staticFile(`${BG05_VIDEO.voiceDir}/${c.file}`)}
              volume={1}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

// Звук ролика: голоса мамы и диктора, очень тихая тёплая музыка проекта
// (общий файл public/audio/music-story-warm.mp3, только чтение) с
// приглушением под речью и сдержанные эффекты из общих файлов проекта
// (каждая сцена задаёт свои по фактическим таймингам речи).
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { choiceSfx } from "./scenes/Choice";
import { ctaSfx } from "./scenes/Cta";
import { hookSfx } from "./scenes/Hook";
import { ruleSfx } from "./scenes/Rule";
import { trialSfx } from "./scenes/Trial";
import { waitSfx } from "./scenes/Wait";
import { BG33_VIDEO, type Bg33SceneId } from "./script";
import type { Bg33Scene, Bg33Sfx, Bg33Timeline } from "./timing";

const FPS = BG33_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.16;
const MUSIC_UNDER_VOICE = 0.055;

const SFX: Record<
  Bg33SceneId,
  (tl: Bg33Timeline, sc: Bg33Scene) => readonly Bg33Sfx[]
> = {
  hook: hookSfx,
  rule: ruleSfx,
  wait: waitSfx,
  trial: trialSfx,
  choice: choiceSfx,
  cta: ctaSfx,
};

export const Bg33Audio: React.FC<{ readonly tl: Bg33Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues.filter((x) => x.file)) {
    const a = s(c.from);
    const b = s(c.to);
    const last = spans[spans.length - 1];
    if (last && a - last[1] < s(1.5)) last[1] = b;
    else spans.push([a, b]);
  }
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans)
      v = Math.min(
        v,
        interpolate(
          f,
          [a - 12, a, b, b + 18],
          [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME],
          clamp,
        ),
      );
    return (
      v *
      interpolate(
        f,
        [0, 0.8 * FPS, total - 2.4 * FPS, total - 2],
        [0, 1, 1, 0],
        clamp,
      )
    );
  };
  const sfx = useMemo(
    () =>
      tl.scenes
        .flatMap((sc) =>
          SFX[sc.id](tl, sc).map((x) => ({ ...x, at: sc.from + x.at })),
        )
        .filter((x) => x.at >= 0 && x.at < total - 6),
    [tl, total],
  );
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={(f) => duck(f)} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence
          key={`sfx-${i}`}
          name={`Эффект: ${x.src}`}
          from={x.at}
          premountFor={FPS}
        >
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id} (${c.role})`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio
              src={staticFile(`${BG33_VIDEO.voiceDir}/${c.file}`)}
              volume={1}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

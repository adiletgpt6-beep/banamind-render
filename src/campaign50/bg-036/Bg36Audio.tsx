// Звук ролика: голос диктора, очень тихая тёплая музыка проекта (общий
// файл public/audio/music-story-warm.mp3, только чтение) с приглушением
// под речью и сдержанные бумажные эффекты из общих файлов проекта:
// шорох при каждом развороте секции ленты, «поп» лишних пяти делений,
// касание пальцем, мягкий колокольчик на итогах и в финале.
// Моменты эффектов задают сцены (SFX_*), здесь — только сведение.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { SFX_APPLY } from "./scenes/Apply";
import { SFX_BONUS } from "./scenes/Bonus";
import { SFX_CTA } from "./scenes/Cta";
import { SFX_HOOK } from "./scenes/Hook";
import { SFX_TRIAL } from "./scenes/Trial";
import { SFX_TRIP } from "./scenes/Trip";
import type { ScenePlanArgs } from "./scenes/common";
import { BG36_VIDEO, type Bg36SceneId } from "./script";
import { sceneOf, type Bg36Timeline } from "./timing";

const FPS = BG36_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC = "audio/music-story-warm.mp3";
const MUSIC_VOLUME = 0.15;
const MUSIC_UNDER_VOICE = 0.05;

// Эффект сцены: кадр от начала сцены, файл (public/), громкость.
export type Sfx = { readonly at: number; readonly src: string; readonly volume: number };
export type SfxPlan = (args: ScenePlanArgs) => readonly Sfx[];

const PLANS: Record<Bg36SceneId, SfxPlan> = {
  hook: SFX_HOOK,
  trip: SFX_TRIP,
  bonus: SFX_BONUS,
  trial: SFX_TRIAL,
  apply: SFX_APPLY,
  cta: SFX_CTA,
};

export const Bg36Audio: React.FC<{ readonly tl: Bg36Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const spans: [number, number][] = [];
  for (const c of tl.cues) {
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
        interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp),
      );
    return v * interpolate(f, [0, 0.6 * FPS, total - 2.4 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    for (const sc of tl.scenes) {
      const base = sceneOf(tl, sc.id).from;
      for (const x of PLANS[sc.id]({ tl, sc })) out.push({ ...x, at: base + x.at });
    }
    return out.filter((x) => x.at >= 0 && x.at < total - 6);
  }, [tl, total]);
  return (
    <>
      <Sequence name="Музыка (тихо)" durationInFrames={total}>
        <Audio src={staticFile(MUSIC)} volume={(f) => duck(f)} />
      </Sequence>
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(x.src)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence
            key={c.id}
            name={`Голос: ${c.id}`}
            from={s(c.audioFrom)}
            durationInFrames={Math.ceil(c.durationSec * FPS) + 2}
            premountFor={FPS}
          >
            <Audio src={staticFile(`${BG36_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

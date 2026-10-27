// Звук фильма №35: реплики (каждая — отдельный файл на своём месте шкалы),
// спокойная инструментальная музыка проекта (собственные слои одной
// гармонии, scripts/generate-music.mjs) с приглушением под речью — на
// вопросе сына ещё тише, — и сдержанные эффекты сцен.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { PHT_VIDEO, type PhtSceneId } from "./script";
import { collectSfx, type SceneSound } from "./sound";
import type { PhtPlan } from "./timing";

const FPS = PHT_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Слои музыки по сценам (вход/выход — мягкий наплыв ≈ 1 с):
//   morning — лёгкий пэд и «капли»: начало, воскресенье, будни;
//   low     — редкие ноты: пятница и вопрос сына (тише всего);
//   warm    — тёплый пэд и арпеджио: решение, рисунок, игра, финал.
const MUSIC: readonly { readonly src: string; readonly from: PhtSceneId; readonly to: PhtSceneId; readonly gain: number }[] = [
  { src: "audio/music-story-morning.mp3", from: "hook", to: "load", gain: 0.9 },
  { src: "audio/music-story-low.mp3", from: "friday", to: "nextStep", gain: 0.85 },
  { src: "audio/music-story-warm.mp3", from: "balago", to: "cta", gain: 0.8 },
];
export const MUSIC_VOLUME = 0.21;
export const MUSIC_UNDER_VOICE = 0.14;
// Сцены, где музыка тише обычного (вопрос сына — главный акцент).
const QUIET: Partial<Record<PhtSceneId, number>> = { friday: 0.7, question: 0.45 };

export const PhtAudio: React.FC<{ readonly plan: PhtPlan; readonly sounds: Partial<Record<PhtSceneId, SceneSound>> }> = ({ plan, sounds }) => {
  const total = plan.totalFrames;
  const sceneOf = (id: PhtSceneId) => plan.scenes.find((s) => s.id === id)!;
  // интервалы речи; близкие реплики объединяются — музыка между ними не поднимается
  const spans = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of plan.cues.filter((x) => x.file)) {
      const a = Math.floor(c.from * FPS);
      const b = Math.ceil(c.to * FPS);
      const last = out[out.length - 1];
      if (last && a - last[1] < 1.4 * FPS) last[1] = b;
      else out.push([a, b]);
    }
    return out;
  }, [plan]);
  const quietAt = (f: number) => {
    let q = 1;
    for (const [id, k] of Object.entries(QUIET) as [PhtSceneId, number][]) {
      const s = sceneOf(id);
      q = Math.min(q, interpolate(f, [s.from - 20, s.from, s.to, s.to + 20], [1, k, k, 1], clamp));
    }
    return q;
  };
  const duck = (f: number) => {
    let v = MUSIC_VOLUME;
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 10, a, b, b + 16], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * quietAt(f) * interpolate(f, [0, 0.6 * FPS, total - 1.6 * FPS, total - 1], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => collectSfx(plan, sounds, FPS), [plan, sounds]);
  return (
    <>
      {MUSIC.map((m) => {
        const a = Math.max(0, sceneOf(m.from).from - Math.round(0.5 * FPS));
        const b = Math.min(total, sceneOf(m.to).to + Math.round(0.5 * FPS));
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + FPS, b - FPS, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        const fade = x.fade ? Math.round(x.fade * FPS) : 0;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.at} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={(f) => x.volume * (dur && fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp) : 1)} />
          </Sequence>
        );
      })}
      {plan.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={c.audioFromFrame} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${PHT_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

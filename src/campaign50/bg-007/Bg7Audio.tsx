// Звук ролика: голоса, спокойная музыка проекта (три слоя одной гармонии
// и темпа: лёгкий пульс — перестановки, тише — пауза, тепло — решение и
// финал), приглушение музыки под речью, сдержанные эффекты: мягкие
// удары блоков, бумага, шаги сына, переход, колокольчик.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { HOOK, LANE, SHUFFLE } from "./calendar";
import { contactFrames, trackOf } from "./rig/gait";
import { LOOKS } from "./rig/looks";
import { LANE_SHOT, LANE_TAP } from "./scenes/Lane";
import { PA, PA_SON } from "./scenes/Pause";
import { BG7_VIDEO } from "./script";
import { sceneOf, type Bg7Timeline } from "./timing";

const FPS = BG7_VIDEO.fps;
const DIR = BG7_VIDEO.audioDir;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (sec: number) => Math.round(sec * FPS);

const MUSIC_VOLUME = 0.22;
const MUSIC_UNDER_VOICE = 0.07;

type Sfx = { readonly at: number; readonly src: string; readonly volume: number };

export const Bg7Audio: React.FC<{ readonly tl: Bg7Timeline }> = ({ tl }) => {
  const total = tl.frames;
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id).from;
  const music = [
    { src: `${DIR}/music-pulse.mp3`, from: 0, to: at("pause") + 10, gain: 0.85 },
    { src: `${DIR}/music-low.mp3`, from: at("pause") - 10, to: at("lane") + 10, gain: 1 },
    { src: `${DIR}/music-warm.mp3`, from: at("lane") - 10, to: total, gain: 1 },
  ];
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
    for (const [a, b] of spans) v = Math.min(v, interpolate(f, [a - 12, a, b, b + 18], [MUSIC_VOLUME, MUSIC_UNDER_VOICE, MUSIC_UNDER_VOICE, MUSIC_VOLUME], clamp));
    return v * interpolate(f, [0, 0.6 * FPS, total - 2.2 * FPS, total - 2], [0, 1, 1, 0], clamp);
  };
  const sfx = useMemo(() => {
    const out: Sfx[] = [];
    const h = at("hook");
    for (let i = 0; i < 20; i += 3) out.push({ at: h + 10 + i * 2, src: "sfx/tap.mp3", volume: 0.18 });
    out.push({ at: h + HOOK.spawn, src: "sfx/pop.mp3", volume: 0.3 });
    out.push({ at: h + HOOK.bump, src: "sfx/tap.mp3", volume: 0.45 });
    out.push({ at: h + HOOK.rotate + 6, src: "sfx/tap.mp3", volume: 0.35 });
    const sh = at("shuffle");
    out.push({ at: sh + SHUFFLE.grab, src: "sfx/paper.mp3", volume: 0.35 });
    out.push({ at: sh + SHUFFLE.am4 + 6, src: "sfx/tap.mp3", volume: 0.4 });
    out.push({ at: sh + SHUFFLE.pm4 + 6, src: "sfx/tap.mp3", volume: 0.45 });
    out.push({ at: sh + SHUFFLE.fall + 2, src: "sfx/paper.mp3", volume: 0.4 });
    for (let d = 0; d < 4; d++) {
      const t0 = sh + SHUFFLE.close + 8 + d * SHUFFLE.dayStep;
      out.push({ at: t0 + 10, src: "sfx/tap.mp3", volume: 0.32 });
      out.push({ at: t0 + 18, src: "sfx/tap.mp3", volume: 0.28 });
    }
    const pa = at("pause");
    out.push({ at: pa + 12, src: "sfx/pop.mp3", volume: 0.18 });
    const ln = at("lane");
    out.push({ at: ln + LANE_TAP, src: "sfx/tap.mp3", volume: 0.4 });
    out.push({ at: ln + LANE_SHOT + LANE.fly, src: "sfx/whoosh.mp3", volume: 0.25 });
    out.push({ at: ln + LANE_SHOT + LANE.sparkle, src: "sfx/chime.mp3", volume: 0.22 });
    const ct = at("cta");
    out.push({ at: ct, src: "sfx/whoosh.mp3", volume: 0.25 });
    out.push({ at: ct + 16, src: "sfx/chime.mp3", volume: 0.25 });
    // шаги сына (по расчёту походки, как в анимации)
    const tr = trackOf(PA_SON, PA.walk - 2, sceneOf(tl, "pause").frames, LOOKS.son.build.stride);
    contactFrames(tr)
      .filter((f) => f >= PA.walk && f <= PA.arrive + 4)
      .forEach((f, i) => out.push({ at: pa + f, src: `sfx/step-soft-child-${i % 4}.mp3`, volume: 0.35 }));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl]);
  return (
    <>
      {music.map((m) => {
        const a = Math.max(0, m.from);
        const b = Math.min(total, m.to);
        return (
          <Sequence key={m.src} name={`Музыка: ${m.src.split("/").pop()}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(m.src)}
              trimBefore={a}
              volume={(f) => duck(f + a) * m.gain * interpolate(f + a, [a, a + 20, b - 20, b], [a === 0 ? 1 : 0, 1, 1, b >= total ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => (
        <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src}`} from={x.at} premountFor={FPS}>
          <Audio src={staticFile(`${DIR}/${x.src}`)} volume={x.volume} />
        </Sequence>
      ))}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={s(c.audioFrom)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${BG7_VIDEO.voiceDir}/${c.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

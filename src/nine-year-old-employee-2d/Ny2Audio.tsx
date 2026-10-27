// Звук «Тогуз жаштагы кызматкердин арызы»: голоса (по шкале фактической
// речи), своя музыка по настроению сцен (scripts/ny2d-music.mjs — без бочки
// и щелчков) и немногие тихие эффекты, у каждого из которых есть видимое
// действие (лист, фото, дверь машины, крышка ноутбука, одно касание
// отправки, тихий салон). Шагов нет ни в одном пути звука.
// Музыка: под речью заметно ниже голоса (особенно под голосом сына), в
// признании — тише, в последние 2,5 с плавно затихает к последнему кадру.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { NY2_VIDEO, type Ny2SceneId } from "./script";
import type { Ny2Timeline } from "./timing";
import { letterPlan } from "./scenes/Letter";
import { routePlan } from "./scenes/Route";
import { shipPlan } from "./scenes/Ship";
import { earlyPlan } from "./scenes/Early";
import { yardPlan } from "./scenes/Yard";
import { balagoPlan } from "./scenes/Balago";

const FPS = NY2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/nine-year-old-employee-2d";

// Музыка по сценам: дорожка → сцены.
const MOOD: Record<Ny2SceneId, string> = {
  letter: "ny2d-curious",
  parents: "ny2d-curious",
  route: "ny2d-curious",
  helper: "ny2d-office",
  quit: "ny2d-office",
  ship: "ny2d-warm",
  badge: "ny2d-quiet",
  early: "ny2d-warm",
  yard: "ny2d-warm",
  evening: "ny2d-focus",
  balago: "ny2d-focus",
  drawing: "ny2d-end",
  contact: "ny2d-end",
};
const MOOD_GAIN: Record<string, number> = { "ny2d-quiet": 0.7, "ny2d-curious": 1, "ny2d-office": 0.9, "ny2d-warm": 1, "ny2d-focus": 0.85, "ny2d-end": 1 };

export type Ny2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const NY2_SFX_FILES = ["paper", "photo", "car-door", "laptop-close", "tap", "car-cabin"] as const;

// Эффекты по действиям (кадр ролика).
export const ny2Sfx = (tl: Ny2Timeline): Ny2Sfx[] => {
  const at = (id: Ny2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const L = letterPlan(tl);
  const R = routePlan(tl);
  const S = shipPlan(tl);
  const E = earlyPlan(tl);
  const Y = yardPlan(tl);
  const B = balagoPlan(tl);
  const sfx = (n: string) => `${DIR}/sfx/${n}.mp3`;
  const early = tl.scenes.find((s) => s.id === "early")!;
  return [
    { frame: at("letter", L.land - 8), src: sfx("paper"), volume: 0.5 },
    { frame: at("route", R.close[1] - 2), src: sfx("car-door"), volume: 0.45 },
    { frame: at("route", R.cabin), src: sfx("car-cabin"), volume: 0.16, dur: (R.arrive - R.cabin) / FPS },
    { frame: at("ship", S.take - 2), src: sfx("photo"), volume: 0.45 },
    { frame: at("early", E.close[1] - 1), src: sfx("laptop-close"), volume: 0.5 },
    { frame: at("early", E.cabin), src: sfx("car-cabin"), volume: 0.16, dur: (early.to - early.from - E.cabin) / FPS },
    { frame: at("yard", Y.close[1] - 2), src: sfx("car-door"), volume: 0.45 },
    { frame: at("balago", B.send), src: sfx("tap"), volume: 0.5 },
  ];
};

export const Ny2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи (кадры) для приглушения музыки; под голосом сына — сильнее
  const spans = useMemo(() => tl.cues.map((c) => ({ a: Math.round(c.from * FPS), b: Math.round(c.to * FPS), son: c.role === "son" })), [tl]);
  const music = useMemo(() => {
    const out: { src: string; from: number; to: number }[] = [];
    for (const sc of tl.scenes) {
      const src = MOOD[sc.id];
      const last = out[out.length - 1];
      if (last && last.src === src) last.to = sc.to;
      else out.push({ src, from: sc.from, to: sc.to });
    }
    return out;
  }, [tl]);
  const sfx = useMemo(() => ny2Sfx(tl), [tl]);
  const BASE = 0.32;
  const duck = (f: number) => {
    let v = BASE;
    for (const s of spans) {
      const low = s.son ? 0.06 : 0.085;
      v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [BASE, low, low, BASE], clamp));
    }
    return v * interpolate(f, [0, 12, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  const XF = 30; // перекрёстное затухание 1 с
  return (
    <>
      {music.map((m, i) => {
        const a = Math.max(0, m.from - (i > 0 ? XF / 2 : 0));
        const b = Math.min(total, m.to + (i < music.length - 1 ? XF / 2 : 0));
        const g = MOOD_GAIN[m.src] ?? 1;
        return (
          <Sequence key={`${m.src}-${i}`} name={`Музыка: ${m.src}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(`${DIR}/music/${m.src}.mp3`)}
              trimBefore={(i * 17 * FPS) % (120 * FPS)}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${NY2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

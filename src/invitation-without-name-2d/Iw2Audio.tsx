// Звук «Аты жок чакыруу»: голоса (по шкале фактической речи), своя музыка
// по настроению сцен (scripts/iw2d-music.mjs — без бочки и щелчков) и
// немногие тихие эффекты, у каждого из которых есть видимое действие:
// молния рюкзака, лист, карандаш, сгиб бумаги, касание машинки, короткие
// аплодисменты, касание «Жөнөтүү», тихий салон машины. Шагов нет ни в
// одном пути звука.
// Музыка: под речью заметно ниже голоса (под голосом сына — сильнее), в
// признании сына и во время имени — тише; в последние 2,5 с плавно
// затихает к последнему кадру.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { IW2_VIDEO, type Iw2SceneId } from "./script";
import type { Iw2Timeline } from "./timing";
import { backpackPlan } from "./scenes/Backpack";
import { careersPlan } from "./scenes/Careers";
import { namePlan } from "./scenes/Name";
import { testPlan } from "./scenes/Test";
import { demoPlan } from "./scenes/Demo";
import { routePlan } from "./scenes/Route";
import { balagoPlan, balagoTaps } from "./scenes/Balago";
import { LIST_PENCIL } from "./scenes/List";

const FPS = IW2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/invitation-without-name-2d";

const MOOD: Record<Iw2SceneId, string> = {
  hook: "iw2d-curious",
  blank: "iw2d-curious",
  careers: "iw2d-curious",
  proud: "iw2d-family",
  route: "iw2d-family",
  backpack: "iw2d-quiet",
  ask: "iw2d-quiet",
  why: "iw2d-quiet",
  name: "iw2d-quiet",
  idea: "iw2d-warm",
  test: "iw2d-warm",
  list: "iw2d-warm",
  class: "iw2d-warm",
  demo: "iw2d-warm",
  photo: "iw2d-warm",
  parents: "iw2d-focus",
  balago: "iw2d-focus",
  bedtime: "iw2d-end",
  contact: "iw2d-end",
};
const MOOD_GAIN: Record<string, number> = { "iw2d-curious": 0.9, "iw2d-family": 0.9, "iw2d-quiet": 0.6, "iw2d-warm": 1, "iw2d-focus": 0.85, "iw2d-end": 1 };

export type Iw2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const IW2_SFX_FILES = ["applause", "car-cabin", "fold", "paper", "pencil", "tap", "toy", "zipper"] as const;

// Эффекты по действиям (кадр ролика).
export const iw2Sfx = (tl: Iw2Timeline): Iw2Sfx[] => {
  const at = (id: Iw2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const sfx = (n: (typeof IW2_SFX_FILES)[number]) => `${DIR}/sfx/${n}.mp3`;
  const B = backpackPlan(tl);
  const Cr = careersPlan(tl);
  const N = namePlan(tl);
  const T = testPlan(tl);
  const D = demoPlan(tl);
  const R = routePlan(tl);
  const G = balagoPlan(tl);
  return [
    { frame: at("careers", Cr.take - 4), src: sfx("paper"), volume: 0.3 },
    { frame: at("route", R.car), src: sfx("car-cabin"), volume: 0.14, dur: (R.back - R.car) / FPS },
    { frame: at("backpack", B.zip[0]), src: sfx("zipper"), volume: 0.45 },
    { frame: at("backpack", B.pull[0]), src: sfx("paper"), volume: 0.4 },
    { frame: at("backpack", B.land - 6), src: sfx("paper"), volume: 0.45 },
    { frame: at("name", N.write[0]), src: sfx("pencil"), volume: 0.4, dur: (N.write[1] - N.write[0]) / FPS },
    { frame: at("test", T.place[1] - 8), src: sfx("paper"), volume: 0.4 },
    { frame: at("test", T.catchAt), src: sfx("toy"), volume: 0.45 },
    { frame: at("test", T.back), src: sfx("toy"), volume: 0.4 },
    { frame: at("test", T.fold[0] + 6), src: sfx("fold"), volume: 0.45 },
    { frame: at("list", LIST_PENCIL[0][0]), src: sfx("pencil"), volume: 0.3, dur: (LIST_PENCIL[0][1] - LIST_PENCIL[0][0]) / FPS },
    { frame: at("list", LIST_PENCIL[1][0]), src: sfx("pencil"), volume: 0.3, dur: (LIST_PENCIL[1][1] - LIST_PENCIL[1][0]) / FPS },
    { frame: at("demo", D.place[1]), src: sfx("toy"), volume: 0.45 },
    { frame: at("demo", D.clap[0] + 4), src: sfx("applause"), volume: 0.3 },
    ...balagoTaps(G).map((f) => ({ frame: at("balago", f), src: sfx("tap"), volume: 0.4 })),
  ];
};

export const Iw2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
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
  const sfx = useMemo(() => iw2Sfx(tl), [tl]);
  const BASE = 0.3;
  const duck = (f: number) => {
    let v = BASE;
    for (const s of spans) {
      const low = s.son ? 0.05 : 0.08;
      v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [BASE, low, low, BASE], clamp));
    }
    return v * interpolate(f, [0, 12, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  const XF = 30;
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
              trimBefore={((i * 11) % 40) * FPS}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 6, dur - 8, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${IW2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneContext, TimelineContext } from "./dad-driver/context";
import { DdAudio } from "./dad-driver/DdAudio";
import { C } from "./dad-driver/kit";
import { clamp, easeInOut, easeOut } from "./dad-driver/rig/motion";
import { SCENES } from "./dad-driver/scenes";
import { DD_SCENES, type DdTransition } from "./dad-driver/script";
import { SUB_DEFAULT, Subtitles } from "./dad-driver/Subtitles";
import { buildDdTimeline, type DdManifest } from "./dad-driver/timing";

export type BalaGo32DadDriverProps = {
  // Заполняется в calculateMetadata из public/audio/dad-driver/manifest.json.
  readonly manifest: DdManifest;
  // Только для разработки: оценочные тайминги без озвучки.
  readonly allowEstimate?: boolean;
};

const transFrames = (tr: DdTransition) => (tr.kind === "cut" ? 0 : tr.frames);

// Стиль входящей (in) или уходящей (out) сцены во время перехода; u — 0…1.
const transStyle = (tr: DdTransition, u: number, role: "in" | "out"): React.CSSProperties => {
  const e = easeInOut(u);
  switch (tr.kind) {
    case "push": {
      const d = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[tr.dir];
      // dir — куда уезжает кадр: входящая сцена приходит с противоположной стороны
      const k = role === "in" ? 1 - e : -e;
      return { transform: `translate(${-d[0] * 1080 * k}px, ${-d[1] * 1920 * k}px)` };
    }
    case "zoom":
      return role === "in"
        ? { opacity: easeOut(u * 1.3), transform: `scale(${1.06 - 0.06 * e})`, transformOrigin: `${tr.ox}px ${tr.oy}px` }
        : { transform: `scale(${1 + 0.35 * e})`, transformOrigin: `${tr.ox}px ${tr.oy}px` };
    case "iris":
      return role === "in" ? { clipPath: `circle(${Math.max(0.1, 2300 * e)}px at ${tr.ox}px ${tr.oy}px)` } : {};
    case "fade":
      return role === "in" ? { opacity: e } : {};
    default:
      return {};
  }
};

// Ролик №32 «Атам — айдоочу». Сцены идут подряд по шкале из озвучки;
// каждая получает своё локальное время. Входной переход сцены длится
// несколько кадров ДО её начала поверх уходящей сцены.
export const BalaGo32DadDriver: React.FC<BalaGo32DadDriverProps> = ({ manifest }) => {
  const tl = useMemo(() => buildDdTimeline(manifest), [manifest]);
  const frame = useCurrentFrame();
  const placeSub = useMemo(
    () => (id: (typeof DD_SCENES)[number]["id"], t: number) => SCENES[id].sub?.(t, tl) ?? SUB_DEFAULT,
    [tl],
  );
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.navy, overflow: "hidden" }}>
        {tl.scenes.map((sc, i) => {
          const def = DD_SCENES[i];
          const T = transFrames(def.enter);
          const next = DD_SCENES[i + 1];
          const Tn = next ? transFrames(next.enter) : 0;
          if (frame < sc.from - T || frame >= sc.to) return null;
          let style: React.CSSProperties = {};
          if (T && frame < sc.from) style = transStyle(def.enter, clamp((frame - (sc.from - T) + 1) / T), "in");
          else if (next && Tn && frame >= sc.to - Tn) style = transStyle(next.enter, clamp((frame - (sc.to - Tn) + 1) / Tn), "out");
          const Scene = SCENES[sc.id].C;
          return (
            <SceneContext.Provider key={sc.id} value={sc}>
              <AbsoluteFill style={{ overflow: "hidden", ...style }}>
                <Scene />
              </AbsoluteFill>
            </SceneContext.Provider>
          );
        })}
        <Subtitles place={placeSub} />
        <DdAudio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};

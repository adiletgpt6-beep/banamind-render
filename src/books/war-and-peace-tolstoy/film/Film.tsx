// Фильм целиком: фон слоя карты, сцены (по тайм-лайну озвучки), банан-ведущий поверх,
// карточки вопросов (без таймеров), значок слоя и анимированные титры BanaMind.
// Устройство то же, что у src/lesson-traktat/Lesson.tsx; визуальный мир — свой: «Масштаб выбора».
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import "../../../banamind/fonts";
import { BanaMindAnimatedCaptions } from "../../../banamind/captions";
import { WP_CAPTIONS, type Cue } from "./captions";
import { Background } from "./components/Background";
import { Host } from "./components/Host";
import { LayerBar } from "./components/LayerBar";
import { QuestionOverlay } from "./components/QuestionOverlay";
import { actLayer, FPS } from "./theme";
import type { Timeline, TimedScene } from "./timeline";
import type { HostSpot, Scene } from "./types";
import { VISUALS } from "./visuals";
import { ToneContext } from "./visuals/figures";
import { clamp01, ease } from "./visuals/kit";

// куда сдвигать субтитры, чтобы не закрывать банана
const SUB_SHIFT: Record<HostSpot, number> = { center: 0, close: 0, left: 170, right: -170, corner: 110, off: 0, peek: -260 };

const sceneOfLine = (tl: Timeline, lineId: string) => tl.scenes.find((s) => s.lines.some((l) => l.id === lineId))?.id ?? "";

const PUSH = 0.45; // длительность «толкающего» перехода, с

const SceneView: React.FC<{ sc: Scene; ts: TimedScene; nextSlide: boolean }> = ({ sc, ts, nextSlide }) => {
  const t = useCurrentFrame() / FPS;
  const dur = ts.to - ts.from;
  const V = VISUALS[sc.visual.kind];
  if (!V) throw new Error(`Нет визуала ${sc.visual.kind}`);
  const inK = interpolate(t, [0, 0.55], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const outK = nextSlide ? 1 : interpolate(t, [dur - 0.4, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const pushOut = nextSlide ? interpolate(t, [dur, dur + PUSH], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : 0;
  const k = clamp01(Math.min(inK, outK));
  const beats = ts.lines.map((l) => l.speechFrom - ts.from);
  const ends = ts.lines.map((l) => l.speechTo - ts.from);
  const slide = sc.visual.enter === "slide" ? interpolate(t, [0, PUSH], [1, 0], { extrapolateRight: "clamp", easing: ease }) : 0;
  const shiftX = (slide - pushOut) * 1920;
  // медленный «наезд камеры» — кадр не стоит на месте
  const drift = 1 + 0.03 * clamp01(t / Math.max(1, dur));
  const style =
    sc.visual.enter === "slide" || nextSlide
      ? { opacity: sc.visual.enter === "slide" ? outK : Math.min(inK, outK), transform: `translateX(${shiftX}px) scale(${drift})` }
      : { opacity: k, transform: `translateY(${(1 - k) * 26}px) scale(${(0.97 + 0.03 * k) * drift})` };
  return (
    <AbsoluteFill style={style}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {/* схема чуть выше и меньше: низ кадра остаётся под титры */}
        <g transform="translate(38 -46) scale(0.96)">
          <ToneContext.Provider value={actLayer(sc.act) === "l3"}>
            <V t={t} dur={dur} beats={beats} ends={ends} p={{ ...sc.visual, host: sc.host, layer: actLayer(sc.act) }} />
          </ToneContext.Provider>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ tl: Timeline; scenes: Scene[]; cues: Cue[] }> = ({ tl, scenes, cues }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const act = scenes[si].act;
  let actStart = si;
  while (actStart > 0 && scenes[actStart - 1].act === act) actStart--;
  const prevAct = actStart > 0 ? scenes[actStart - 1].act : act;
  const bgK = clamp01((t - tl.scenes[actStart].from) / 1.2);
  const hostSpot = scenes[si].host;
  const isCard = scenes[si].visual.kind === "actCard" || scenes[si].visual.kind === "endCard";
  const barOp = interpolate(t, [2, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (isCard ? 0 : 1);
  return (
    <AbsoluteFill>
      <Background layer={actLayer(act)} prev={actLayer(prevAct)} k={bgK} />
      {tl.scenes.map((ts, i) => {
        const nextSlide = scenes[i + 1]?.visual.enter === "slide";
        return (
          <Sequence key={ts.id} from={Math.round(ts.from * FPS)} durationInFrames={Math.max(1, Math.round((ts.to - ts.from + (nextSlide ? PUSH : 0)) * FPS))} layout="none">
            <SceneView sc={scenes[i]} ts={ts} nextSlide={nextSlide} />
          </Sequence>
        );
      })}
      <Host tl={tl} scenes={scenes} />
      <QuestionOverlay lines={tl.lines} />
      <LayerBar act={act} opacity={barOp} />
      <BanaMindAnimatedCaptions cues={cues} shift={SUB_SHIFT[hostSpot]} bottom={(c) => WP_CAPTIONS.lowScenes?.[sceneOfLine(tl, c.lineId)]} accent={WP_CAPTIONS.accent} />
    </AbsoluteFill>
  );
};

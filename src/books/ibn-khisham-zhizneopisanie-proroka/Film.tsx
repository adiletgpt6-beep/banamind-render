// Фильм целиком: фон части, иллюстрации сцен (по тайм-лайну озвучки), банан-ведущий,
// карточки вопросов (без таймеров), подпись главы и анимированные титры BanaMind.
// Религиозное правило: ни в одной сцене нет изображения Пророка, других пророков,
// их силуэтов или «заменителей»; людей в иллюстрациях нет вовсе.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import "../../banamind/fonts";
import { BanaMindAnimatedCaptions } from "../../banamind/captions";
import { BOOK_CAPTIONS, type Cue } from "./captions";
import { Background } from "./components/Background";
import { ChapterBar } from "./components/ChapterBar";
import { Host } from "./components/Host";
import { QuestionOverlay } from "./components/QuestionOverlay";
import { FPS } from "./theme";
import type { Timeline, TimedScene } from "./timeline";
import type { HostSpot, Scene } from "./types";
import { VISUALS } from "./visuals";
import { clamp01, ease } from "./visuals/kit";

// титры сдвигаются в сторону от банана
const SUB_SHIFT: Record<HostSpot, number> = { center: 0, close: 0, left: 190, right: -190, corner: 110, cornerRight: -110, off: 0 };

const sceneOfLine = (tl: Timeline, lineId: string) => tl.scenes.find((s) => s.lines.some((l) => l.id === lineId))?.id ?? "";

const PUSH = 0.45;

const SceneView: React.FC<{ sc: Scene; ts: TimedScene; nextSlide: boolean }> = ({ sc, ts, nextSlide }) => {
  const t = useCurrentFrame() / FPS;
  const dur = ts.to - ts.from;
  const V = VISUALS[sc.visual.kind];
  if (!V) throw new Error(`Нет визуала ${sc.visual.kind}`);
  const inK = interpolate(t, [0, 0.6], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const outK = nextSlide ? 1 : interpolate(t, [dur - 0.45, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const pushOut = nextSlide ? interpolate(t, [dur, dur + PUSH], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : 0;
  const k = clamp01(Math.min(inK, outK));
  const beats = ts.lines.map((l) => l.speechFrom - ts.from);
  const ends = ts.lines.map((l) => l.speechTo - ts.from);
  const slide = sc.visual.enter === "slide" ? interpolate(t, [0, PUSH], [1, 0], { extrapolateRight: "clamp", easing: ease }) : 0;
  const shiftX = (slide - pushOut) * 1920;
  const style =
    sc.visual.enter === "slide" || nextSlide
      ? { opacity: sc.visual.enter === "slide" ? outK : Math.min(inK, outK), transform: `translateX(${shiftX}px)` }
      : { opacity: k, transform: `scale(${1.03 - 0.03 * k})` };
  return (
    <AbsoluteFill style={style}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <V t={t} dur={dur} beats={beats} ends={ends} p={{ ...sc.visual, host: sc.host }} />
      </svg>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ tl: Timeline; scenes: Scene[]; cues: Cue[] }> = ({ tl, scenes, cues }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const part = scenes[si].part;
  let partStart = si;
  while (partStart > 0 && scenes[partStart - 1].part === part) partStart--;
  const prevPart = partStart > 0 ? scenes[partStart - 1].part : part;
  const bgK = clamp01((t - tl.scenes[partStart].from) / 1.2);
  const hostSpot = scenes[si].host;
  const barOp = interpolate(t, [2, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (scenes[si].visual.kind === "chapter" ? 0 : 1);
  return (
    <AbsoluteFill>
      <Background part={part} prev={prevPart} k={bgK} />
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
      <ChapterBar part={part} opacity={barOp} />
      <BanaMindAnimatedCaptions cues={cues} shift={SUB_SHIFT[hostSpot]} bottom={(c) => BOOK_CAPTIONS.lowScenes?.[sceneOfLine(tl, c.lineId)]} accent={BOOK_CAPTIONS.accent} />
    </AbsoluteFill>
  );
};

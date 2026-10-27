// Фильм целиком: ночной фон части, единое поле цветных точек (фигуры сцен
// перетекают друг в друга), надписи сцен, банан-ведущий, карточки вопросов,
// полоска книг и анимированные титры BanaMind. Всё — по тайм-лайну озвучки.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import "../banamind/fonts";
import { BanaMindAnimatedCaptions } from "../banamind/captions";
import { REPUBLIC_CAPTIONS, type Cue } from "./captions";
import { Background } from "./components/Background";
import { Host } from "./components/Host";
import { Overlays, type OverlayAbs } from "./components/Overlays";
import { PartBar } from "./components/PartBar";
import { QuestionOverlay } from "./components/QuestionOverlay";
import { DotField, type DotKeyAbs } from "./dots/DotField";
import { FPS } from "./theme";
import type { Timeline, TimedScene } from "./timeline";
import type { HostSpot, Scene } from "./types";

// куда сдвигать субтитры, чтобы не закрывать банана
const SUB_SHIFT: Record<HostSpot, number> = { center: 0, close: 0, left: 170, right: -170, corner: 110, off: 0, peek: -260 };

// время «такта» сцены: номер реплики + доля её речи; −1 — начало сцены
export const beatTime = (ts: TimedScene, beat: number) => {
  if (beat < 0) return ts.from + 0.15;
  const i = Math.min(Math.floor(beat), ts.lines.length - 1);
  const l = ts.lines[i];
  const frac = Math.min(1, beat - Math.floor(beat));
  return l.speechFrom + (l.speechTo - l.speechFrom) * frac;
};

export const buildDotKeys = (tl: Timeline, scenes: Scene[]): DotKeyAbs[] =>
  scenes
    .flatMap((sc, i) => sc.visual.dots.map((k) => ({ t: beatTime(tl.scenes[i], k.at), shape: k.shape })))
    .sort((a, b) => a.t - b.t);

export const buildOverlays = (tl: Timeline, scenes: Scene[]): OverlayAbs[] =>
  scenes.flatMap((sc, i) => {
    const ts = tl.scenes[i];
    return (sc.visual.ov ?? []).map(({ at, until, ...rest }) => {
      const o = { ...rest } as Record<string, unknown>;
      // времена пунктов списка — тоже такты сцены
      if (Array.isArray(o.beats)) o.times = (o.beats as number[]).map((b) => beatTime(ts, b));
      if (typeof o.strikeAt === "number") o.strike = beatTime(ts, o.strikeAt as number);
      return { ...o, from: beatTime(ts, at), to: until !== undefined ? beatTime(ts, until) : ts.to - 0.1 } as OverlayAbs;
    });
  });

const sceneOfLine = (tl: Timeline, lineId: string) => tl.scenes.find((s) => s.lines.some((l) => l.id === lineId))?.id ?? "";

export const Lesson: React.FC<{ tl: Timeline; scenes: Scene[]; cues: Cue[] }> = ({ tl, scenes, cues }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const keys = useMemo(() => buildDotKeys(tl, scenes), [tl, scenes]);
  const overlays = useMemo(() => buildOverlays(tl, scenes), [tl, scenes]);
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const part = scenes[si].part;
  let partStart = si;
  while (partStart > 0 && scenes[partStart - 1].part === part) partStart--;
  const prevPart = partStart > 0 ? scenes[partStart - 1].part : part;
  const bgK = Math.max(0, Math.min(1, (t - tl.scenes[partStart].from) / 1.5));
  const hostSpot = scenes[si].host;
  const barOp = interpolate(t, [3, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (hostSpot === "close" ? 0.5 : 0.95);
  return (
    <AbsoluteFill>
      <Background part={part} prev={prevPart} k={bgK} />
      <DotField keys={keys} t={t} />
      <Overlays list={overlays} t={t} />
      <Host tl={tl} scenes={scenes} />
      <QuestionOverlay lines={tl.lines} />
      <PartBar part={part} opacity={barOp} />
      <BanaMindAnimatedCaptions
        cues={cues}
        shift={SUB_SHIFT[hostSpot]}
        bottom={(c) => REPUBLIC_CAPTIONS.lowScenes?.[sceneOfLine(tl, c.lineId)]}
        accent={REPUBLIC_CAPTIONS.accent}
      />
    </AbsoluteFill>
  );
};

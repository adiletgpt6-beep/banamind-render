import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { DotMorphEngine, Keyframe } from "../engines/DotMorphEngine";
import { ColorDotRenderer, BgKey } from "../engines/ColorDotEngine";
import { CamKey } from "../engines/CameraController";
import { loadFonts } from "./fonts";

const engines = new Map<string, DotMorphEngine>();

/** Полноэкранный Canvas с пулом цветных точек. Все расчёты зависят только от номера кадра. */
export const ColorDotField: React.FC<{ id: string; pool: number; keyframes: Keyframe[]; backgrounds: BgKey[]; camera: CamKey[] }> = ({ id, pool, keyframes, backgrounds, camera }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ColorDotRenderer | null>(null);
  const [engine, setEngine] = useState<DotMorphEngine | null>(() => engines.get(id) ?? null);
  const [handle] = useState(() => (engines.has(id) ? null : delayRender(`dot-engine-${id}`, { timeoutInMilliseconds: 120000 })));

  useEffect(() => {
    if (engine) return;
    loadFonts().then(() => {
      let e = engines.get(id);
      if (!e) {
        e = new DotMorphEngine(pool, keyframes);
        engines.set(id, e);
      }
      setEngine(e);
      if (handle !== null) continueRender(handle);
    });
  }, [engine, handle, id, pool, keyframes]);

  useLayoutEffect(() => {
    if (!engine || !ref.current) return;
    if (!renderer.current) renderer.current = new ColorDotRenderer(width, height);
    const ctx = ref.current.getContext("2d")!;
    renderer.current.draw(ctx, engine, frame, fps, backgrounds, camera);
  }, [engine, frame, fps, width, height, backgrounds, camera]);

  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

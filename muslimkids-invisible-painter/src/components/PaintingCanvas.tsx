import { useEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { renderFrame } from "../engines/InvisiblePainterEngine";
import { H, W } from "../engines/PainterlyCameraController";
import { PARTS } from "../scenes";

/** Холст, на котором краска рисует сама: кадр — чистая функция номера кадра. */
export const PaintingCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) renderFrame(ctx, frame, PARTS);
  }, [frame]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

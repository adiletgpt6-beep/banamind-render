import React, { useLayoutEffect, useRef } from "react";
import { EarthParams, renderEarth } from "../engines/EarthRenderer";

/** Canvas host for the CPU globe shader. Full resolution while the limb is visible,
 *  half resolution (smoothly upscaled) once the surface fills the frame. */
export const EarthCanvas: React.FC<{ p: EarthParams; opacity: number }> = ({ p, opacity }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const half = p.J > 3.0;
  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (opacity <= 0) return;
    const w = half ? 540 : 1080, h = half ? 960 : 1920;
    const img = new ImageData(w, h);
    renderEarth(img, p);
    if (!half) {
      ctx.putImageData(img, 0, 0);
    } else {
      const tmp = document.createElement("canvas");
      tmp.width = w; tmp.height = h;
      tmp.getContext("2d")!.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(tmp, 0, 0, 1080, 1920);
    }
  });
  return <canvas ref={ref} width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }} />;
};

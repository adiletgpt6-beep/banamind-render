// Оригинальная живая съёмка — основа кадра. Видео без звука (голос идёт
// отдельной очищенной дорожкой), камера — синтетические движения поверх
// оригинала: мягкий наезд, «толчок» на склейках, отъезд в 2.5D-карточку.
// После конца исходника — стоп-кадр последнего кадра (для финала).
import { Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type Camera = {
  readonly scale: number;
  readonly x: number; // сдвиг в px кадра
  readonly y: number;
  readonly blur?: number; // px
  readonly radius?: number; // скругление углов, когда кадр уменьшен
  readonly rotateY?: number; // градусы (2.5D)
  readonly rotateX?: number;
  readonly brightness?: number;
};

export const LiveFootage: React.FC<{
  readonly src: string; // путь в public/
  readonly sourceDuration: number; // секунды исходника
  readonly camera: (t: number) => Camera;
}> = ({ src, sourceDuration, camera }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const lastFrame = Math.floor(sourceDuration * fps) - 2;
  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      muted
      style={{ width, height, objectFit: "cover", display: "block" }}
    />
  );
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2400, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotateY(${cam.rotateY ?? 0}deg) rotateX(${cam.rotateX ?? 0}deg)`,
          transformOrigin: "50% 45%",
          borderRadius: cam.radius ?? 0,
          overflow: "hidden",
          filter: `${cam.blur ? `blur(${cam.blur}px)` : ""} ${cam.brightness !== undefined ? `brightness(${cam.brightness})` : ""}`.trim() || undefined,
          boxShadow: (cam.radius ?? 0) > 0 ? "0 40px 120px rgba(0,0,0,0.55)" : undefined,
        }}
      >
        {frame >= lastFrame ? <Freeze frame={lastFrame}>{video}</Freeze> : video}
      </div>
    </div>
  );
};

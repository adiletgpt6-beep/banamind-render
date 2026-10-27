// Технический лист: состояние комнаты в заданные моменты времени при
// неподвижной камере (раскадровки действий для проверки движения).
// props: times — секунды фильма для кадров 0…n−1, cam — окно камеры в мире.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { buildDirection, type Cam, smoothRoomState } from "./direction";
import type { A4Lang } from "./lang";
import { buildTimeline, type Manifest } from "./timeline";
import { RoomWorld } from "./world";

export type ProbeProps = { manifest: Manifest | null; times: number[]; cam: Cam; lang?: A4Lang };

export const Probe: React.FC<ProbeProps> = ({ manifest, times, cam, lang = "ru" }) => {
  const frame = useCurrentFrame();
  const T = useMemo(() => buildTimeline(manifest, 30, lang), [manifest, lang]);
  const D = useMemo(() => buildDirection(T), [T]);
  const t = times[Math.min(frame, times.length - 1)] ?? 0;
  const s = smoothRoomState(T, D, t);
  const h = (cam.w * 9) / 16;
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`}>
        <RoomWorld s={s} />
      </svg>
    </AbsoluteFill>
  );
};

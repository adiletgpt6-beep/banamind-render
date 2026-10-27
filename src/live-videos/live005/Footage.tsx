// Живая съёмка LIVE-005: цветокоррекция «по лицу» (grade.ts) и камера.
// Кривые каналов пересчитываются в каждом кадре по реальному цвету лица под
// подсветкой фонтанов; тени неба не поднимаются, белая куртка остаётся белой.
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { curve, gradeAt } from "./grade";
import { LIVE005 } from "./timing";

export type Camera = {
  readonly s: number; // масштаб (1 — исходный кадр)
  readonly ox: number; // точка приближения, px кадра 1080×1920
  readonly oy: number;
  readonly blur?: number; // px — только на мягком переходе
};

export const Footage: React.FC<{ readonly t: number; readonly cam: Camera; readonly id?: string }> = ({ t, cam, id = "l5grade" }) => {
  const { width, height } = useVideoConfig();
  const g = gradeAt(t);
  const [r, gc, b] = g.exponents.map((e) => curve(e).join(" "));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#05070f" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={r} />
            <feFuncG type="table" tableValues={gc} />
            <feFuncB type="table" tableValues={b} />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values={String(g.sat)} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cam.s})`,
          transformOrigin: `${cam.ox}px ${cam.oy}px`,
          filter: cam.blur ? `blur(${cam.blur}px)` : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile(LIVE005.source)}
          muted
          style={{ width, height, objectFit: "cover", filter: `url(#${id})` }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Карточка с настоящим фото товара: 3D-наклон (perspective), медленный
// Ken Burns внутри рамки, мягкая тень-«отражение» и блик.
// Без файла (технический прогон) — честная заглушка с подписью.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { CONTENT, type Photo } from "../content";
import { LightSweep } from "./LightSweep";

const P = CONTENT.brand.palette;

export const ProductFrame: React.FC<{
  photo: Photo;
  w: number;
  h: number;
  /** наклон в градусах */
  rotY?: number;
  rotX?: number;
  /** масштаб Ken Burns (1 → zoom) за длительность */
  zoom?: number;
  dur?: number;
  sweepAt?: number | null;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ photo, w, h, rotY = 0, rotX = 0, zoom = 1.08, dur = 150, sweepAt = null, radius = 34, style }) => {
  const f = useCurrentFrame();
  const kb = 1 + (zoom - 1) * Math.min(1, f / dur);
  const [fx, fy] = photo.focus ?? [0.5, 0.5];
  return (
    <div style={{ width: w, height: h, perspective: 1600, ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: "preserve-3d",
          borderRadius: radius,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 50px 90px rgba(40,28,15,0.28), 0 12px 24px rgba(40,28,15,0.18)",
          border: `2px solid ${P.accentSoft}`,
          background: P.bgDeep,
        }}
      >
        {photo.file ? (
          <Img
            src={staticFile(`products/${photo.file}`)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${fx * 100}% ${fy * 100}%`,
              transform: `scale(${kb})`,
              transformOrigin: `${fx * 100}% ${fy * 100}%`,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              background: `repeating-linear-gradient(45deg, ${P.bgDeep}, ${P.bgDeep} 22px, ${P.bg} 22px, ${P.bg} 44px)`,
              color: P.ink,
              fontFamily: "Montserrat",
              fontWeight: 600,
              fontSize: 34,
              textAlign: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 26, letterSpacing: 6, opacity: 0.6 }}>ЗАГЛУШКА</div>
            <div>{photo.label}</div>
          </div>
        )}
        {sweepAt !== null ? <LightSweep start={sweepAt} /> : null}
      </div>
    </div>
  );
};

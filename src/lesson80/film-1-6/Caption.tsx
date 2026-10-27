// Финальная надпись: последние ≈ 4,6 с фильма, аккуратное появление,
// полупрозрачная плашка для читаемости, не перекрывает лица и гнездо
// (нижняя часть кадра, по центру).
import { fontFamily } from "../../fonts";
import { FILM } from "./script";
import { easeOut } from "../rig/motion";
import { FPS } from "../core/video";

export const FinalCaption: React.FC<{ readonly f: number; readonly total: number }> = ({ f, total }) => {
  const start = total - Math.round(FILM.captionSec * FPS);
  if (f < start) return null;
  const a = easeOut((f - start) / (0.7 * FPS));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 72, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
      <div style={{ padding: "22px 54px", borderRadius: 30, backgroundColor: "rgba(38, 30, 22, 0.62)", color: "#FFF8EA", fontFamily, fontSize: 54, fontWeight: 700, letterSpacing: 0.4, textAlign: "center", maxWidth: 1040, lineHeight: 1.25, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>
        {FILM.caption}
      </div>
    </div>
  );
};

import type { CSSProperties, ReactNode } from "react";
import { computeBookState } from "../engines/LivingBookEngine";
import { projectToScreen } from "../engines/BookCameraController";
import { cameraAt } from "../scenes";
import { TL } from "../story/timeline";
import { FONTS, PALETTE as C } from "../styles/palette";
import { clamp, ease, type Range } from "../utils/math";
import { earthAnchors } from "./PopUpEarth";
import { frameWindow } from "./PageDecoration";

const W = TL.width;
const H = TL.height;

/** Плавное появление/исчезновение текстового слоя (без вспышек). */
const fade = (t: number, r: Range, inDur = 0.6, outDur = 0.5) => {
  const a = ease.outCubic(clamp((t - r[0]) / inDur));
  const b = 1 - ease.inOutSine(clamp((t - (r[1] - outDur)) / outDur));
  return Math.min(a, b);
};

const Layer = ({ style, children }: { style: CSSProperties; children: ReactNode }) => (
  <div style={{ position: "absolute", pointerEvents: "none", ...style }}>{children}</div>
);

/** Подпись-«ярлычок» у глобуса, привязанная к 3D-точке. */
const Tag = ({
  x,
  y,
  o,
  text,
  dark,
  align,
}: {
  x: number;
  y: number;
  o: number;
  text: string;
  dark: boolean;
  align: "left" | "right";
}) => (
  <Layer
    style={{
      left: x,
      top: y,
      opacity: o,
      transform: `translate(${align === "left" ? "-100%" : "0"}, -50%) translateY(${(1 - o) * 18}px) scale(${0.9 + 0.1 * o})`,
      transformOrigin: align === "left" ? "right center" : "left center",
    }}
  >
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: 54,
        letterSpacing: 6,
        padding: "14px 30px 12px",
        borderRadius: 40,
        color: dark ? C.milk : C.navy,
        background: dark ? "rgba(16,36,58,0.92)" : "rgba(248,226,170,0.96)",
        border: `3px solid ${dark ? "rgba(116,187,220,0.85)" : C.gold}`,
        boxShadow: "0 8px 22px rgba(30,20,10,0.28)",
        whiteSpace: "nowrap",
      }}
    >
      {dark ? "☾ " : "☀ "}
      {text}
    </div>
  </Layer>
);

/**
 * Текстовые слои поверх 3D: подписи «ДЕНЬ/НОЧЬ», «РАЗМЫШЛЯЙ», перевод
 * смысла аята (отдельный чёткий блок — не на сгибаемых страницах) и финал.
 */
export const Overlays = ({ t }: { t: number }) => {
  const O = TL.overlays;
  const pose = cameraAt(t);
  const book = computeBookState(t);
  const items: ReactNode[] = [];

  const oDay = fade(t, O.day, 0.5, 0.5);
  const oNight = fade(t, O.night, 0.5, 0.5);
  if (oDay > 0 || oNight > 0) {
    const a = earthAnchors(t, book);
    const d = projectToScreen(pose, a.day, W, H);
    const n = projectToScreen(pose, a.night, W, H);
    items.push(<Tag key="day" x={d.x + 10} y={d.y - 40} o={oDay} text="ДЕНЬ" dark={false} align="right" />);
    items.push(<Tag key="night" x={n.x - 10} y={n.y - 40} o={oNight} text="НОЧЬ" dark align="left" />);
  }

  const oRef = fade(t, O.reflect, 0.9, 0.7);
  if (oRef > 0) {
    items.push(
      <Layer key="reflect" style={{ left: 0, width: W, top: 250, textAlign: "center", opacity: oRef }}>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontWeight: 700,
            fontSize: 118,
            letterSpacing: 14 + 10 * (1 - oRef),
            color: C.goldLight,
            textShadow: "0 4px 18px rgba(8,18,30,0.55), 0 1px 0 rgba(120,80,30,0.6)",
            transform: `translateY(${(1 - oRef) * 24}px)`,
          }}
        >
          РАЗМЫШЛЯЙ
        </div>
        <div
          style={{
            marginTop: 6,
            display: "inline-block",
            fontFamily: FONTS.sans,
            fontWeight: 600,
            fontSize: 38,
            color: C.milk,
            padding: "8px 26px",
            borderRadius: 30,
            background: "rgba(16,36,58,0.72)",
            opacity: clamp((t - O.reflect[0] - 0.4) / 0.6),
          }}
        >
          Сура Аль-Имран, 3:190
        </div>
      </Layer>,
    );
  }

  const oAyah = fade(t, O.ayah, 1.0, 0.8);
  if (oAyah > 0) {
    const fw = frameWindow(book);
    const c = projectToScreen(pose, fw.center, W, H);
    const l = projectToScreen(pose, fw.left, W, H);
    const r = projectToScreen(pose, fw.right, W, H);
    const width = Math.max(540, (r.x - l.x) * 0.9);
    items.push(
      <Layer
        key="ayah"
        style={{
          left: c.x - width / 2,
          top: c.y,
          width,
          opacity: oAyah,
          transform: `translateY(-50%) translateY(${(1 - oAyah) * 14}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(248,242,232,0.97)",
            borderRadius: 26,
            border: `3px solid ${C.gold}`,
            boxShadow: "0 14px 34px rgba(10,20,35,0.35)",
            padding: "28px 22px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: 58, lineHeight: 1.08, color: C.navy, letterSpacing: 1 }}>
            ГОСПОДЬ НАШ!
            <br />
            ТЫ НЕ СОТВОРИЛ
            <br />
            ЭТО ПОНАПРАСНУ.
          </div>
          <div style={{ width: 120, height: 3, background: C.gold, margin: "20px auto 16px", borderRadius: 2 }} />
          <div style={{ fontFamily: FONTS.sans, fontWeight: 800, fontSize: 31, color: C.emerald }}>
            Сура «Аль-Имран», 3:191
          </div>
          <div style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: 27, color: C.ink, marginTop: 6 }}>
            Часть аята. Перевод смысла.
          </div>
        </div>
      </Layer>,
    );
  }

  const oQ = fade(t, O.question, 1.0, 0.01);
  if (oQ > 0) {
    items.push(
      <Layer key="q" style={{ left: 60, width: W - 120, top: 300, textAlign: "center", opacity: oQ }}>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.05,
            color: C.milk,
            textShadow: "0 4px 20px rgba(40,20,5,0.55), 0 2px 2px rgba(40,20,5,0.5)",
            transform: `translateY(${(1 - oQ) * 20}px)`,
          }}
        >
          А ЧТО УДИВИЛО
          <br />
          ТЕБЯ?
        </div>
      </Layer>,
    );
  }
  const oB = fade(t, O.brand, 0.9, 0.01);
  if (oB > 0) {
    items.push(
      <Layer key="b" style={{ left: 0, width: W, top: 1430, textAlign: "center", opacity: oB }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 50,
            letterSpacing: 12,
            color: C.navy,
            background: "rgba(248,242,232,0.94)",
            border: `3px solid ${C.gold}`,
            padding: "14px 40px 12px 52px",
            borderRadius: 50,
            boxShadow: "0 10px 26px rgba(30,15,5,0.3)",
          }}
        >
          MUSLIM KIDS
        </div>
      </Layer>,
    );
  }
  return <>{items}</>;
};

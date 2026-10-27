// Зеркальный split-screen: две вертикальные половины кадра, линия-зеркало
// между ними и подписи. Левая половина — «АЗЫР» (как есть), правая —
// условное зеркало «ЭГЕР КАТТАМ УЮШУЛСА • шарттуу мисал»: холодный
// стеклянный оттенок, полупрозрачность, пунктирная рамка и блик. Подпись
// правой половины видна ВСЁ время, пока видна сама половина
// (RightPanel рисует её сам — забыть подпись невозможно).
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { clamp, easeInOut, easeOut } from "./rig/motion";
import { BG45_TEXT } from "./script";
import { View, type Cam } from "./shots";

export const DIV_X = 540;
export const GAP = 12;
export const HALF = DIV_X - GAP / 2; // ширина половины, 534

// Левая половина: обычный мир. width — ширина окна (при «склейке»
// зеркал растёт до 1080).
export const LeftPanel: React.FC<{ readonly cam: Cam; readonly base?: Cam; readonly width?: number; readonly children: React.ReactNode }> = ({ cam, base, width = HALF, children }) => (
  <View left={0} width={width} cam={cam} base={base}>
    {children}
  </View>
);

// Правая половина: отражённый мир (ось mirror, px мира) за «стеклом».
// open 0…1 — зеркальная створка раскрывается от линии (поворот вокруг
// левого края), 0 — сложена/не видна.
export const RightPanel: React.FC<{
  readonly cam: Cam;
  readonly base?: Cam;
  readonly mirror?: number;
  readonly open: number;
  readonly f: number;
  readonly children: React.ReactNode;
  readonly label?: boolean;
}> = ({ cam, base, mirror, open, f, children, label = true }) => {
  if (open <= 0.001) return null;
  const e = easeInOut(open);
  const sheen = ((f % 150) / 150) * 1.6 - 0.3;
  return (
    <>
      {/* стеклянная подложка: пока створка разворачивается, половина не пустая */}
      <div style={{ position: "absolute", left: DIV_X + GAP / 2, top: 0, width: HALF, height: 1920, background: "linear-gradient(180deg, #E4EFFB, #F3F8FD 55%, #E4EFFB)", opacity: clamp(open * 4) }} />
      <div
        style={{
          position: "absolute",
          left: DIV_X + GAP / 2,
          top: 0,
          width: HALF,
          height: 1920,
          transformOrigin: "0% 50%",
          transform: `perspective(1600px) rotateY(${-88 * (1 - e)}deg)`,
          opacity: clamp(open * 3),
          overflow: "hidden",
        }}
      >
        <View left={0} width={HALF} cam={cam} base={base} mirror={mirror} bg="#EEF5FC" style={{ filter: "saturate(0.82) brightness(1.04)" }}>
          {children}
        </View>
        {/* стекло: холодный оттенок, блик, пунктирная рамка */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(214,232,250,0.34), rgba(232,242,252,0.22) 55%, rgba(214,232,250,0.34))" }} />
        <div
          style={{
            position: "absolute",
            left: `${sheen * 100}%`,
            top: -200,
            width: 160,
            height: 2400,
            transform: "rotate(14deg)",
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))",
          }}
        />
        <div style={{ position: "absolute", inset: 14, borderRadius: 26, border: `5px dashed ${C.glassLine}`, opacity: 0.85 }} />
        {/* затемнение створки при повороте — объём */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#7C93B8", opacity: 0.3 * (1 - e) }} />
      </div>
      {label ? <MaybeLabel a={clamp(open * 4)} /> : null}
    </>
  );
};

// Линия-зеркало между половинами: белая полоса с жёлтой сердцевиной.
// draw 0…1 — линия прорастает от центра к краям.
export const MirrorLine: React.FC<{ readonly draw: number; readonly glow?: number; readonly x?: number }> = ({ draw, glow = 0, x = DIV_X }) => {
  if (draw <= 0.001) return null;
  const h = 1920 * easeOut(draw);
  return (
    <div style={{ position: "absolute", left: x - GAP / 2, top: 960 - h / 2, width: GAP, height: h, backgroundColor: "#FFFFFF", boxShadow: `0 0 ${18 + 30 * glow}px rgba(255,201,14,${0.35 + 0.4 * glow})` }}>
      <div style={{ position: "absolute", left: GAP / 2 - 2, top: 0, width: 4, height: "100%", backgroundColor: C.yellow }} />
    </div>
  );
};

const pill = (a: number): React.CSSProperties => ({
  opacity: a,
  transform: `translateY(${(1 - a) * -24}px) scale(${0.9 + 0.1 * a})`,
  fontFamily,
  fontWeight: 900,
  borderRadius: 999,
  whiteSpace: "nowrap",
});

// «АЗЫР» — над левой половиной.
export const NowLabel: React.FC<{ readonly a: number }> = ({ a }) =>
  a > 0.01 ? (
    <div style={{ position: "absolute", left: 0, width: HALF, top: 252, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ ...pill(a), padding: "12px 40px 14px", backgroundColor: C.navy, color: "#FFFFFF", fontSize: 46, letterSpacing: 2, boxShadow: "0 10px 24px rgba(20,40,90,0.25)" }}>{BG45_TEXT.mirror.now}</div>
    </div>
  ) : null;

// «ЭГЕР КАТТАМ УЮШУЛСА • шарттуу мисал» — над правой половиной.
export const MaybeLabel: React.FC<{ readonly a: number }> = ({ a }) =>
  a > 0.01 ? (
    <div style={{ position: "absolute", left: DIV_X + GAP / 2, width: HALF, top: 252, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none" }}>
      <div style={{ ...pill(a), padding: "12px 26px 14px", backgroundColor: "#FFFFFF", color: C.glassInk, fontSize: 33, letterSpacing: 0.5, border: `4px solid ${C.glassLine}`, boxShadow: "0 10px 24px rgba(40,80,140,0.18)" }}>
        {BG45_TEXT.mirror.maybe}
      </div>
      <div style={{ ...pill(a), padding: "6px 24px 8px", backgroundColor: C.glass, color: C.navy, fontSize: 32, fontWeight: 900, letterSpacing: 1, border: `3px dashed ${C.glassInk}` }}>{BG45_TEXT.mirror.example}</div>
    </div>
  ) : null;

// Небольшая плашка по центру над линией (например, «Шарттуу салыштыруу»).
export const CenterChip: React.FC<{ readonly a: number; readonly text: string; readonly y?: number }> = ({ a, text, y = 430 }) =>
  a > 0.01 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ ...pill(a), padding: "8px 26px 10px", backgroundColor: C.yellow, color: C.navy, fontSize: 32, boxShadow: "0 8px 0 #E0A800, 0 14px 26px rgba(20,40,90,0.18)" }}>{text}</div>
    </div>
  ) : null;

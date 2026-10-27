// Пиксельный мир аркады BG-044: светлое дневное небо (полосы с
// дизерингом), плывущие облака, Ала-Тоо со снежными вершинами, дальние
// панельные дома, тополя, дорога и тротуар. Всё светлое — кадр не темнеет.
//
//   <GameWorld px={10} groundY={1180} camera={{ x: 540, y: 960, zoom: 1 }}>
//     <Sprite rows={MOM.walk[i]} px={10} x={…} y={1180 - MOM.h * 10} />   ← мировые координаты
//   </GameWorld>
//
// Камера: camera.x / camera.y — точка мира, которая видна в центре кадра
// (по умолчанию 540, 960 — мир совпадает с кадром), zoom — увеличение.
// Небо неподвижно, облака/горы/дома — параллакс, земля и дети (children) —
// полностью с камерой. overlay — слой поверх мира в координатах КАДРА
// (HUD, плашки), камера на него не влияет.
//
// Высоты мира (worldLayout): ноги персонажей стоят на groundY (тротуар);
// дорога — позади, выше: машина ставится колёсами на laneY.
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CLOUD, POPLAR, BUSH } from "./sprites";
import { SpriteG, spriteSize } from "./Sprite";
import { PixelTextG, pixelTextSize } from "./PixelText";
import { pixelTextWidth } from "./pixelFont";
import { pop, easeOut, clamp } from "../anim";
import { C } from "../palette";

const W = 1080;
const H = 1920;

export type GameCamera = { readonly x?: number; readonly y?: number; readonly zoom?: number };

// Ключевые высоты мира (в мировых координатах) для данного px и groundY.
export const worldLayout = (px = 10, groundY = 1180) => ({
  feetY: groundY, // низ подошв персонажей
  sidewalkTop: groundY - 3 * px,
  sidewalkBottom: groundY + 3 * px,
  roadTop: groundY - 17 * px,
  roadBottom: groundY - 4 * px,
  laneY: groundY - 5 * px, // низ колёс машины на ближней полосе
  farLaneY: groundY - 11 * px, // дальняя полоса
  lawnY: groundY - 17 * px, // линия, где стоят тополя и кусты
});

// Точка мира → точка кадра (для HUD над персонажем и т. п.).
export const worldToScreen = (camera: GameCamera | undefined, x: number, y: number) => {
  const cx = camera?.x ?? W / 2;
  const cy = camera?.y ?? H / 2;
  const z = camera?.zoom ?? 1;
  return { x: (x - cx) * z + W / 2, y: (y - cy) * z + H / 2 };
};

// детерминированный «шум» 0…1
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

// ---------- небо ----------
const SKY = ["#BFE3FF", "#CBE8FF", "#D8EEFF", "#E5F4FF", "#F2F9FF"] as const;
const SKY_STOPS = [0, 430, 700, 900, 1060] as const;

const skyPaths = (px: number) => {
  // полосы + 2 строки шахматного дизеринга на каждой границе
  const out: { fill: string; d: string }[] = [];
  SKY.forEach((col, i) => {
    const y0 = SKY_STOPS[i];
    const y1 = i < SKY.length - 1 ? SKY_STOPS[i + 1] : H;
    out.push({ fill: col, d: rect(0, y0, W, y1 - y0) });
  });
  for (let i = 1; i < SKY.length; i++) {
    const y = SKY_STOPS[i];
    let up = ""; // цвет нижней полосы, выступающий вверх
    let down = ""; // цвет верхней полосы, выступающий вниз
    for (let x = 0, k = 0; x < W; x += px, k++) {
      if (k % 2 === 0) up += rect(x, y - px, px, px);
      if (k % 4 === 1) up += rect(x, y - 2 * px, px, px);
      if (k % 2 === 1) down += rect(x, y, px, px);
      if (k % 4 === 3) down += rect(x, y + px, px, px);
    }
    out.push({ fill: SKY[i], d: up });
    out.push({ fill: SKY[i - 1], d: down });
  }
  return out;
};

// ---------- горы Ала-Тоо ----------
type Range = { body: string; shade: string; snow: string; base: number; top: number; seed: number; snowLine: number };

const mountainPaths = (px: number, groundY: number, r: Range, from: number, to: number) => {
  let body = "";
  let shade = "";
  let snow = "";
  const step = px;
  for (let x = from; x < to; x += step) {
    const t = x / 1000;
    const v =
      0.55 +
      0.22 * Math.sin(t * 4.1 + r.seed) +
      0.16 * Math.sin(t * 9.3 + r.seed * 2.1) +
      0.07 * Math.sin(t * 21.7 + r.seed * 0.7);
    const hgt = Math.round(((r.base - r.top) * clamp(v, 0.05, 1)) / step) * step;
    const y = groundY - r.base + (r.base - r.top) - hgt;
    const yTop = Math.round((groundY - r.base - hgt + (r.base - r.top)) / step) * step;
    void y;
    body += rect(x, yTop, step, groundY - yTop);
    // теневая сторона: склон, уходящий вниз вправо
    const t2 = (x + step) / 1000;
    const v2 =
      0.55 +
      0.22 * Math.sin(t2 * 4.1 + r.seed) +
      0.16 * Math.sin(t2 * 9.3 + r.seed * 2.1) +
      0.07 * Math.sin(t2 * 21.7 + r.seed * 0.7);
    if (v2 < v) shade += rect(x, yTop + step, step, Math.round(((groundY - yTop) * 0.35) / step) * step);
    // снег: выше снеговой линии — белая шапка с рваным краем
    const height = groundY - yTop;
    if (height > r.snowLine) {
      const depth = Math.min(height - r.snowLine, 7 * step) + Math.floor(hash(x * 0.37 + r.seed) * 3) * step;
      snow += rect(x, yTop, step, Math.max(step, Math.round(depth / step) * step));
    }
  }
  return { body, shade, snow };
};

// ---------- дальние дома (светлые силуэты пятиэтажек) ----------
const skylinePaths = (px: number, baseY: number, from: number, to: number) => {
  let walls = "";
  let wins = "";
  let x = from;
  let i = 0;
  while (x < to) {
    const wB = (10 + Math.floor(hash(i * 3.1) * 8)) * px;
    const hB = (12 + Math.floor(hash(i * 7.7) * 14)) * px;
    walls += rect(x, baseY - hB, wB, hB);
    for (let yy = baseY - hB + 2 * px; yy < baseY - 2 * px; yy += 3 * px) {
      for (let xx = x + 2 * px; xx < x + wB - 2 * px; xx += 3 * px) wins += rect(xx, yy, px, px);
    }
    x += wB + (1 + Math.floor(hash(i * 5.3) * 5)) * px;
    i++;
  }
  return { walls, wins };
};

// ---------- земля ----------
const groundPaths = (px: number, groundY: number, from: number, to: number, road: boolean) => {
  const L = worldLayout(px, groundY);
  const p: Record<string, string> = {};
  const add = (fill: string, d: string) => {
    p[fill] = (p[fill] ?? "") + d;
  };
  const w = to - from;
  // газон позади дороги
  add("#8BD46E", rect(from, L.lawnY - 2 * px, w, 2 * px));
  add("#58B368", rect(from, L.lawnY, w, px));
  if (road) {
    add("#C3CCDC", rect(from, L.roadTop, w, L.roadBottom - L.roadTop)); // асфальт (светлый)
    add("#D5DCE8", rect(from, L.roadTop, w, px)); // дальний бордюр
    for (let x = from; x < to; x += 12 * px) add("#FFFFFF", rect(x, L.roadTop + 6 * px, 5 * px, px)); // разметка
    add("#A9B6CC", rect(from, L.roadBottom - px, w, px));
  } else {
    add("#8BD46E", rect(from, L.roadTop, w, L.roadBottom - L.roadTop));
  }
  // бордюр и тротуар
  add("#14285A", rect(from, L.roadBottom, w, px));
  add("#FFFFFF", rect(from, L.roadBottom + px, w, px));
  add("#EEF2F8", rect(from, L.sidewalkTop - px, w, L.sidewalkBottom - L.sidewalkTop + px));
  for (let x = from; x < to; x += 8 * px) add("#D3DBE8", rect(x, L.sidewalkTop - px, px, L.sidewalkBottom - L.sidewalkTop + px));
  add("#D3DBE8", rect(from, groundY, w, px / 2));
  // трава впереди до низа кадра
  add("#14285A", rect(from, L.sidewalkBottom, w, px));
  add("#58B368", rect(from, L.sidewalkBottom + px, w, 2400));
  // «подстриженный газон»: мягкие полосы, как в старых играх
  for (let y = L.sidewalkBottom + 6 * px, b = 0; y < L.sidewalkBottom + 1200; y += 6 * px, b++) if (b % 2 === 0) add("#62BC6C", rect(from, y, w, 6 * px));
  add("#8BD46E", rect(from, L.sidewalkBottom + px, w, px));
  // кустики травы и цветы на газоне
  for (let k = 0; k < Math.floor(w / (9 * px)); k++) {
    const gx = from + k * 9 * px + Math.floor(hash(k * 4.1) * 6) * px;
    const gy = L.sidewalkBottom + (8 + Math.floor(hash(k * 2.7) * 70)) * px;
    const r = hash(k * 5.3);
    if (r < 0.55) {
      add("#3F9A55", rect(gx, gy, px, 2 * px) + rect(gx + 2 * px, gy - px, px, 3 * px) + rect(gx + 4 * px, gy, px, 2 * px));
    } else if (r < 0.75) {
      const col = r < 0.65 ? "#FFE27A" : "#FFFFFF";
      add("#3F9A55", rect(gx + px, gy + px, px, 2 * px));
      add(col, rect(gx, gy - px, 3 * px, px) + rect(gx + px, gy - 2 * px, px, 3 * px));
      add("#E0A800", rect(gx + px, gy - px, px, px));
    }
  }
  for (let x = from, k = 0; x < to; x += px, k++) {
    const r = hash(k * 1.7);
    if (r < 0.35) add("#8BD46E", rect(x, L.sidewalkBottom + 2 * px, px, px));
    const r2 = hash(k * 2.9 + 4);
    if (r2 < 0.12) add("#8BD46E", rect(x, L.sidewalkBottom + (5 + Math.floor(r2 * 60)) * px, px, px));
    if (r2 > 0.965) add(r2 > 0.985 ? "#FFE27A" : "#FFFFFF", rect(x, L.sidewalkBottom + (4 + Math.floor(hash(k) * 8)) * px, px, px));
    // кромка газона позади (травинки)
    if (hash(k * 0.91 + 9) < 0.3) add("#8BD46E", rect(x, L.lawnY - 3 * px, px, px));
  }
  return Object.keys(p).map((fill) => ({ fill, d: p[fill] }));
};

type WorldProps = {
  readonly px?: number;
  readonly groundY?: number;
  readonly frame?: number;
  readonly camera?: GameCamera;
  readonly poplars?: boolean;
  readonly skyline?: boolean;
  readonly mountains?: boolean;
  readonly sun?: boolean;
  readonly road?: boolean;
  readonly clouds?: number; // сколько облаков (0…6), по умолчанию 5
  readonly cloudSpeed?: number; // пикселей кадра за кадр, по умолчанию 0.6
  readonly scanlines?: boolean;
  readonly children?: React.ReactNode;
  readonly overlay?: React.ReactNode;
};

const FROM = -2160;
const TO = 4320;

export const GameWorld: React.FC<WorldProps> = ({
  px = 10,
  groundY = 1180,
  frame,
  camera,
  poplars = true,
  skyline = true,
  mountains = true,
  sun = true,
  road = true,
  clouds = 5,
  cloudSpeed = 0.6,
  scanlines = false,
  children,
  overlay,
}) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  const cx = camera?.x ?? W / 2;
  const cy = camera?.y ?? H / 2;
  const zoom = camera?.zoom ?? 1;
  const L = worldLayout(px, groundY);

  const sky = useMemo(() => skyPaths(px), [px]);
  const far = useMemo(
    () =>
      mountainPaths(px, L.lawnY - 4 * px, { body: "#CFDCF3", shade: "#C2D1EE", snow: "#FFFFFF", base: 0, top: -560, seed: 1.3, snowLine: 330 }, FROM, TO),
    [px, L.lawnY],
  );
  const near = useMemo(
    () =>
      mountainPaths(px, L.lawnY - 4 * px, { body: "#A9C1EE", shade: "#97B2E6", snow: "#FFFFFF", base: 0, top: -380, seed: 4.2, snowLine: 270 }, FROM, TO),
    [px, L.lawnY],
  );
  const town = useMemo(() => skylinePaths(px, L.lawnY - 2 * px, FROM, TO), [px, L.lawnY]);
  const ground = useMemo(() => groundPaths(px, groundY, FROM, TO, road), [px, groundY, road]);
  const trees = useMemo(() => {
    const out: { x: number; kind: "poplar" | "bush"; s: number }[] = [];
    for (let i = 0, x = FROM; x < TO; i++) {
      out.push({ x, kind: "poplar", s: 1.5 + hash(i * 3.3) * 0.5 });
      if (hash(i * 1.9) > 0.45) out.push({ x: x + 90 + hash(i) * 60, kind: "bush", s: 1.2 });
      x += 210 + Math.floor(hash(i * 2.3) * 140);
    }
    return out;
  }, []);

  // параллакс: слой со сдвигом k (0 — неподвижен, 1 — как земля)
  const layer = (k: number): React.CSSProperties => {
    const z = 1 + (zoom - 1) * k;
    return {
      position: "absolute",
      left: 0,
      top: 0,
      width: W,
      height: H,
      transformOrigin: "0 0",
      transform: `translate(${W / 2}px, ${H / 2}px) scale(${z}) translate(${-(W / 2 + (cx - W / 2) * k)}px, ${-(H / 2 + (cy - H / 2) * k)}px)`,
      overflow: "visible",
    };
  };

  const cloudList = [
    { x: 80, y: 300, s: 1.4 },
    { x: 620, y: 470, s: 1 },
    { x: 330, y: 640, s: 0.8 },
    { x: 900, y: 250, s: 1.2 },
    { x: -260, y: 560, s: 1.1 },
    { x: 1200, y: 720, s: 0.7 },
  ].slice(0, Math.max(0, Math.min(6, clouds)));
  const span = W + 600;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden", backgroundColor: SKY[0] }}>
      {/* небо — неподвижно */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} shapeRendering="crispEdges">
        {sky.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} />
        ))}
        {sun ? <PixelSun cx={880} cy={560} px={px} /> : null}
      </svg>
      {/* облака: медленный дрейф вправо + лёгкий параллакс */}
      <div style={layer(0.12)}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
          {cloudList.map((c, i) => {
            const cpx = Math.max(2, Math.round(px * c.s));
            const x = ((((c.x + f * cloudSpeed * (0.6 + c.s * 0.4) + 300) % span) + span) % span) - 300;
            return <SpriteG key={i} rows={CLOUD} px={cpx} x={Math.round(x / cpx) * cpx} y={c.y} />;
          })}
        </svg>
      </div>
      {/* горы */}
      {mountains ? (
        <div style={layer(0.25)}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
            <path d={far.body} fill="#CFDCF3" />
            <path d={far.shade} fill="#C3D2EF" />
            <path d={far.snow} fill="#FFFFFF" />
          </svg>
        </div>
      ) : null}
      {mountains ? (
        <div style={layer(0.4)}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
            <path d={near.body} fill="#AFC6EF" />
            <path d={near.shade} fill="#9DB8EA" />
            <path d={near.snow} fill="#FFFFFF" />
          </svg>
        </div>
      ) : null}
      {/* дальние дома */}
      {skyline ? (
        <div style={layer(0.6)}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
            <path d={town.walls} fill="#E3EBF7" />
            <path d={town.wins} fill="#C9D8EE" />
          </svg>
        </div>
      ) : null}
      {/* земля, деревья и всё, что в мире */}
      <div style={layer(1)}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
          {ground.map((g) => (
            <path key={g.fill} d={g.d} fill={g.fill} />
          ))}
          {poplars
            ? trees.map((t, i) => {
                const tpx = Math.round(px * t.s);
                const rows = t.kind === "poplar" ? POPLAR : BUSH;
                const sz = spriteSize(rows, tpx);
                return <SpriteG key={i} rows={rows} px={tpx} x={t.x} y={L.lawnY - sz.height + tpx} />;
              })
            : null}
        </svg>
        {children}
      </div>
      {scanlines ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(20,40,90,0.05) 0px, rgba(20,40,90,0.05) 1px, transparent 1px, transparent 4px)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      {overlay}
    </div>
  );
};

// Пиксельное солнце (кружок y с мягким ореолом-дизерингом).
const PixelSun: React.FC<{ readonly cx: number; readonly cy: number; readonly px: number }> = ({ cx, cy, px }) => {
  const r = 5;
  let core = "";
  let halo = "";
  for (let j = -r - 3; j <= r + 3; j++) {
    for (let i = -r - 3; i <= r + 3; i++) {
      const d = Math.sqrt(i * i + j * j);
      const x = cx + i * px;
      const y = cy + j * px;
      if (d <= r) core += rect(x, y, px, px);
      else if (d <= r + 2.4 && (i + j) % 2 === 0) halo += rect(x, y, px, px);
    }
  }
  return (
    <g>
      <path d={halo} fill="#FFF4C2" />
      <path d={core} fill="#FFE27A" />
    </g>
  );
};

// ======================================================================
// HUD
// ======================================================================

// Ступенчатые («пиксельные») углы: clip-path для прямоугольника с шагом s.
export const steppedClip = (s: number) =>
  `polygon(0 ${2 * s}px, ${s}px ${2 * s}px, ${s}px ${s}px, ${2 * s}px ${s}px, ${2 * s}px 0, calc(100% - ${2 * s}px) 0, calc(100% - ${2 * s}px) ${s}px, calc(100% - ${s}px) ${s}px, calc(100% - ${s}px) ${2 * s}px, 100% ${2 * s}px, 100% calc(100% - ${2 * s}px), calc(100% - ${s}px) calc(100% - ${2 * s}px), calc(100% - ${s}px) calc(100% - ${s}px), calc(100% - ${2 * s}px) calc(100% - ${s}px), calc(100% - ${2 * s}px) 100%, ${2 * s}px 100%, ${2 * s}px calc(100% - ${s}px), ${s}px calc(100% - ${s}px), ${s}px calc(100% - ${2 * s}px), 0 calc(100% - ${2 * s}px))`;

// Плашка уровня: «ДЕҢГЭЭЛ 1:» (белым, мельче) над названием (жёлтым,
// крупно). Если двоеточия нет — одна жёлтая строка. Ширина подстраивается
// (поля ≥ 40 px), px названия подбирается, чтобы влезло: ≤ maxPx.
//   appear — прогресс появления 0…1 (например appear(f, 6, 16) из anim.ts):
//   плашка выезжает сверху с пружинкой, название «печатается».
export const LEVEL_BANNER = { top: 332, maxWidth: 1000 } as const;

export const LevelBanner: React.FC<{
  readonly title: string;
  readonly appear?: number;
  readonly y?: number;
  readonly maxPx?: number;
  readonly opacity?: number;
}> = ({ title, appear: t = 1, y = LEVEL_BANNER.top, maxPx = 8, opacity = 1 }) => {
  const colon = title.indexOf(":");
  const label = colon >= 0 ? title.slice(0, colon + 1).trim() : "";
  const name = colon >= 0 ? title.slice(colon + 1).trim() : title.trim();
  const padX = 40;
  const labelPx = 4;
  const namePx = Math.max(4, Math.min(maxPx, Math.floor((LEVEL_BANNER.maxWidth - 2 * padX) / pixelTextWidth(name))));
  const nameW = pixelTextWidth(name) * namePx;
  const labelW = label ? pixelTextWidth(label) * labelPx : 0;
  const starPx = 4;
  const innerW = Math.max(nameW, labelW + 2 * (9 * starPx + 18));
  const w = Math.min(LEVEL_BANNER.maxWidth, Math.max(560, innerW + 2 * padX));
  const padTop = 16;
  const labelH = label ? 8 * labelPx + 10 : 0; // строка + отступ
  const nameTop = padTop + labelH + 2 * namePx; // место под «шапку» Й
  const h = nameTop + 8 * namePx + 16;
  const k = clamp(t);
  const s = 0.7 + 0.3 * pop(k);
  const slide = (1 - easeOut(k * 1.4)) * -50;
  const reveal = Math.floor([...name].length * clamp((k - 0.2) / 0.55));
  if (k <= 0) return null;
  const left = Math.round(540 - w / 2);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y,
        width: w,
        height: h,
        opacity: opacity * clamp(k * 4),
        transform: `translateY(${slide}px) scale(${s})`,
        transformOrigin: "50% 0",
        zIndex: 40,
      }}
    >
      <div style={{ position: "absolute", left: 10, top: 10, width: w, height: h, backgroundColor: "rgba(20,40,90,0.22)", clipPath: steppedClip(6) }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: C.navy, clipPath: steppedClip(6) }} />
      <div style={{ position: "absolute", left: 8, top: 8, right: 8, bottom: 8, border: `3px solid ${C.yellow}`, opacity: 0.55, clipPath: steppedClip(4) }} />
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} shapeRendering="crispEdges">
        {label ? (
          <>
            <PixelTextG text={label} px={labelPx} x={w / 2} y={padTop + 2} align="center" color={C.white} />
            <SpriteG rows={STAR_SMALL} px={starPx} x={w / 2 - labelW / 2 - 18 - 7 * starPx} y={padTop + 2} />
            <SpriteG rows={STAR_SMALL} px={starPx} x={w / 2 + labelW / 2 + 18} y={padTop + 2} />
          </>
        ) : null}
        <PixelTextG text={name} px={namePx} x={w / 2} y={nameTop} align="center" color={C.yellow} shadow="#0B1A40" reveal={reveal} />
      </svg>
    </div>
  );
};

const STAR_SMALL = ["...K...", "..KYK..", "KKKYKKK", ".KYYYK.", "..KYK..", ".KK.KK.", "......."];

// Шаги «1 2 3 4»: пройденные — с галочкой, текущий — жёлтый и чуть крупнее.
export const StepDots: React.FC<{
  readonly current: number; // 1…total
  readonly total?: number;
  readonly done?: number; // сколько пройдено (по умолчанию current - 1)
  readonly x?: number; // центр по x
  readonly y?: number; // верх
  readonly size?: number;
  readonly appear?: number;
  readonly opacity?: number;
}> = ({ current, total = 4, done, x = 540, y = 486, size = 64, appear: t = 1, opacity = 1 }) => {
  const nDone = done ?? current - 1;
  const gap = 40;
  const totalW = total * size + (total - 1) * gap;
  const k = clamp(t);
  if (k <= 0) return null;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const isDone = i < nDone;
    const isCur = i === current - 1;
    const local = clamp(k * (total + 1) - i);
    const sc = (isCur ? 1.14 : 1) * (0.5 + 0.5 * pop(local));
    const cxi = -totalW / 2 + i * (size + gap) + size / 2;
    const fill = isCur ? C.yellow : isDone ? C.white : "#F3F6FB";
    const txt = isCur ? C.navy : isDone ? C.green : C.muted;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: cxi - size / 2,
          top: 0,
          width: size,
          height: size,
          transform: `scale(${sc})`,
          opacity: clamp(local * 3),
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundColor: C.navy, clipPath: steppedClip(5) }} />
        <div style={{ position: "absolute", inset: 6, backgroundColor: fill, clipPath: steppedClip(3) }} />
        <svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0 }} shapeRendering="crispEdges">
          {isDone && !isCur ? (
            <PixelTextG text="✓" px={6} x={size / 2 + 1} y={size / 2 - 3.5 * 6 + 2} align="center" color={txt} />
          ) : (
            <PixelTextG text={String(i + 1)} px={5} x={size / 2} y={size / 2 - 3.5 * 5} align="center" color={txt} />
          )}
        </svg>
      </div>,
    );
    if (i < total - 1) {
      const lineDone = i < nDone;
      items.push(
        <div
          key={`l${i}`}
          style={{
            position: "absolute",
            left: cxi + size / 2 + 6,
            top: size / 2 - 4,
            width: gap - 12,
            height: 8,
            backgroundColor: lineDone ? C.navy : "rgba(20,40,90,0.25)",
            opacity: clamp(local * 3),
          }}
        />,
      );
    }
  }
  return <div style={{ position: "absolute", left: x, top: y, width: 0, height: size, opacity, zIndex: 40 }}>{items}</div>;
};

// размер строки пиксельного текста — реэкспорт для удобства сцен
export { pixelTextSize };

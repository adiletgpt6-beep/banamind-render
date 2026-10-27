// Обычный школьный двор днём (сцена 5): трёхэтажное здание тёплого
// кремового цвета с терракотовыми поясами, вход с козырьком и табличкой
// «Мектеп» (без названия реальной школы), ступени, двустворчатая дверь,
// деревья (тополя и карагачи Бишкека), клумбы, скамейка; двор вымощен
// светлой плиткой. Камера стоит высоко (горизонт выше середины кадра) —
// машина на переднем плане не закрывает вход.
//
// Перспектива с одной точкой схода: глубина — масштаб s (1 — у камеры,
// 0,4 — фасад). Линия земли на глубине s: syY(s); рост героя — H × s
// (syPlace); мировая X (px при s = 1) → кадр: syX(X, s).
import { box } from "../kit";
import { clamp, easeInOut, hash01 } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import { ink, mix } from "./Office31";

export const SY = { horizon: 560, floorF: 1900, vpx: 540, facadeS: 0.4 } as const;
export const syY = (s: number) => SY.horizon + (SY.floorF - SY.horizon) * s;
export const syS = (y: number) => (y - SY.horizon) / (SY.floorF - SY.horizon);
export const syX = (X: number, s: number) => SY.vpx + (X - SY.vpx) * s;
export const syPt = (X: number, s: number, up = 0) => ({ x: syX(X, s), y: syY(s) - up * s });
export const syPlace = (x: number, y: number, h: number) => ({ x, y, h: h * syS(y) });

const FS = SY.facadeS;
const STEP = { n: 3, rise: 36, depthS: 0.02 }; // ступень: высота (px при s = 1), шаг по глубине
// вход: X центра двери, ширина и высота проёма (px при s = 1)
const ENT = { X: 900, w: 820, h: 1080 };
const baseY = syY(FS); // линия фасада (верх ступеней — на STEP.n * rise выше)

export const SY_POS = {
  // порог двери (верхняя площадка ступеней): здесь появляется сын
  door: { x: syX(ENT.X, FS), y: baseY + 4, s: FS + 0.01 },
  // низ ступеней
  stepsBottom: { x: syX(ENT.X, FS + STEP.n * STEP.depthS + 0.02), y: syY(FS + STEP.n * STEP.depthS + 0.02), s: FS + STEP.n * STEP.depthS + 0.02 },
  // машина семьи: центр по земле, нос вправо (виден пассажирский бок)
  car: { x: syX(330, 0.8), y: syY(0.8), s: 0.8 },
  // отец ждёт у края двора (между машиной и входом, лицом ко входу)
  fatherWait: { x: syX(1330, 0.62), y: syY(0.62), s: 0.62 },
  // место встречи (сын подбегает к отцу)
  meet: { x: syX(1180, 0.66), y: syY(0.66), s: 0.66 },
  // дети на заднем плане (у ступеней, идут к воротам справа)
  kids: [
    { from: syPt(1040, 0.43), to: syPt(1900, 0.5) },
    { from: syPt(760, 0.43), to: syPt(-300, 0.52) },
  ],
} as const;

// Стандартные камеры (cam для Shot).
export const SY_CAM = {
  wide: { x: 640, y: 1180, zoom: 0.82 }, // вход, двор, машина и отец
  door: { x: syX(ENT.X, FS), y: baseY - 210, zoom: 2.0 }, // сын в двери
  father: { x: syX(1330, 0.62), y: syY(0.62) - 470 * 0.62, zoom: 3.1 }, // лицо отца
  meet: { x: syX(1230, 0.66), y: syY(0.66) - 300, zoom: 1.55 }, // двое у ступеней
} as const;

const Svg: React.FC<{ readonly children: React.ReactNode; readonly blur?: number }> = ({ children, blur = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", filter: blur ? `blur(${blur}px)` : undefined })}>
    {children}
  </svg>
);

const WALL = C.schoolWall;
const TRIM = C.schoolTrim;
const LINE = "#7A6450";

// Дерево (крона из нескольких кругов), x, y — основание ствола, k — масштаб.
export const YardTree: React.FC<{ readonly x: number; readonly y: number; readonly k: number; readonly seed?: number; readonly tall?: boolean; readonly sway?: number }> = ({ x, y, k, seed = 1, tall = false, sway = 0 }) => {
  const h = (tall ? 1050 : 780) * k;
  const g1 = mix(C.tree, "#FFFFFF", 0.08);
  const g2 = C.treeDeep;
  const blobs = Array.from({ length: tall ? 7 : 6 }).map((_, i) => {
    const a = hash01(seed * 7 + i * 3.1);
    const b = hash01(seed * 11 + i * 1.7);
    const cx = x + (a - 0.5) * (tall ? 200 : 330) * k + sway * k * (i / 6);
    const cy = y - h * (tall ? 0.45 + 0.5 * (i / 6) : 0.55 + 0.35 * b);
    const r = (tall ? 120 : 150 + 60 * b) * k;
    return { cx, cy, r, i };
  });
  return (
    <g>
      <ellipse cx={x} cy={y + 4 * k} rx={140 * k} ry={22 * k} fill="rgba(40,50,40,0.16)" />
      <path d={`M ${x - 18 * k} ${y} L ${x - 10 * k} ${y - h * 0.6} L ${x + 10 * k} ${y - h * 0.6} L ${x + 18 * k} ${y} Z`} fill="#7A5A44" stroke="#5A4232" strokeWidth={3 * k} />
      {blobs.map((b) => (
        <circle key={`d${b.i}`} cx={b.cx + 10 * k} cy={b.cy + 12 * k} r={b.r} fill={g2} />
      ))}
      {blobs.map((b) => (
        <circle key={`l${b.i}`} cx={b.cx} cy={b.cy} r={b.r * 0.92} fill={b.i % 2 ? g1 : C.tree} stroke={ink(C.tree, 0.7)} strokeWidth={2.4 * k} />
      ))}
    </g>
  );
};

// Окно фасада (рама, стекло с отражением неба), x, y — левый верх.
const Win: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly k: number }> = ({ x, y, w, h, k }) => (
  <g>
    <rect x={x - 6 * k} y={y - 6 * k} width={w + 12 * k} height={h + 12 * k} fill="#FFFFFF" stroke={LINE} strokeWidth={2.4 * k} />
    <rect x={x} y={y} width={w} height={h} fill="#BCD6EA" />
    <path d={`M ${x} ${y + h * 0.65} L ${x + w * 0.55} ${y} L ${x + w * 0.8} ${y} L ${x} ${y + h}`} fill="#FFFFFF" opacity={0.28} />
    <rect x={x + w / 2 - 3 * k} y={y} width={6 * k} height={h} fill="#FFFFFF" />
    <rect x={x} y={y + h * 0.42} width={w} height={6 * k} fill="#FFFFFF" />
    <rect x={x - 12 * k} y={y + h + 6 * k} width={w + 24 * k} height={12 * k} fill={mix(WALL, "#000000", 0.08)} />
  </g>
);

export const SchoolYard: React.FC<{
  readonly door?: number; // 0…1 — створки двери открыты
  readonly sway?: number; // лёгкое движение крон (px)
  readonly mid?: React.ReactNode; // дети и герои между фасадом и машиной
}> = ({ door = 0, sway = 0, mid }) => {
  const k = FS;
  const top = -2400;
  const fx0 = syX(-1600, FS);
  const fx1 = syX(3000, FS);
  const floorH = 360 * k * 2.5; // высота этажа
  const ex = syX(ENT.X, FS);
  const ew = ENT.w * FS;
  const eh = ENT.h * FS;
  const ey = baseY - STEP.n * STEP.rise * FS; // порог (верх ступеней)
  const dOpen = easeInOut(clamp(door));
  return (
    <>
      <Svg>
        {/* небо (видно над деревьями по краям) */}
        <rect x={-2000} y={top} width={6000} height={baseY - top} fill={C.sky} />
        {/* фасад */}
        <rect x={fx0} y={top} width={fx1 - fx0} height={baseY - top} fill={WALL} stroke={LINE} strokeWidth={2.6 * k} />
        {[0, 1, 2].map((fl) => {
          const y1 = baseY - (fl + 1) * floorH;
          return <rect key={`b${fl}`} x={fx0} y={y1 - 18 * k} width={fx1 - fx0} height={22 * k} fill={TRIM} opacity={0.85} />;
        })}
        {/* цоколь */}
        <rect x={fx0} y={baseY - 120 * k} width={fx1 - fx0} height={120 * k} fill={mix(TRIM, "#FFFFFF", 0.35)} stroke={LINE} strokeWidth={2 * k} />
        {/* окна трёх этажей (не перекрывают вход) */}
        {[0, 1, 2].map((fl) =>
          Array.from({ length: 14 }).map((_, i) => {
            const wx = fx0 + 120 * k + i * 520 * k;
            const wy = baseY - (fl + 1) * floorH + 120 * k;
            if (fl === 0 && Math.abs(wx + 150 * k - ex) < ew * 0.85) return null;
            return <Win key={`w${fl}-${i}`} x={wx} y={wy} w={300 * k} h={floorH * 0.55} k={k} />;
          }),
        )}
        {/* портал входа */}
        <rect x={ex - ew / 2 - 70 * k} y={ey - eh - 60 * k} width={ew + 140 * k} height={eh + 60 * k} fill={mix(WALL, "#FFFFFF", 0.35)} stroke={LINE} strokeWidth={2.4 * k} />
        {/* проём и двери: створки открываются наружу (сужаются) */}
        <rect x={ex - ew / 2} y={ey - eh} width={ew} height={eh} fill="#3B3A3F" />
        <rect x={ex - ew / 2 + 30 * k} y={ey - eh + 30 * k} width={ew - 60 * k} height={eh - 30 * k} fill="#5B4E46" opacity={0.6} />
        {[-1, 1].map((side) => {
          const leafW = (ew / 2) * (1 - 0.72 * dOpen);
          const lx = side < 0 ? ex - ew / 2 : ex + ew / 2 - leafW;
          const grow = 1 + 0.08 * dOpen;
          return (
            <g key={side}>
              <rect x={lx} y={ey - eh * grow} width={leafW} height={eh * grow} fill="#8FB4CC" stroke={LINE} strokeWidth={2.4 * k} />
              <rect x={lx + leafW * 0.14} y={ey - eh * grow + eh * 0.1} width={leafW * 0.72} height={eh * 0.5} fill="#CFE2F0" opacity={0.85} />
              <rect x={side < 0 ? lx + leafW - 26 * k : lx + 14 * k} y={ey - eh * 0.5} width={12 * k} height={90 * k} rx={6 * k} fill="#D9DEE5" stroke={LINE} strokeWidth={1.6 * k} />
            </g>
          );
        })}
        {/* козырёк */}
        <path d={`M ${ex - ew / 2 - 170 * k} ${ey - eh - 70 * k} L ${ex + ew / 2 + 170 * k} ${ey - eh - 70 * k} L ${ex + ew / 2 + 240 * k} ${ey - eh - 10 * k} L ${ex - ew / 2 - 240 * k} ${ey - eh - 10 * k} Z`} fill={C.navy} stroke={ink(C.navy, 0.6)} strokeWidth={2.4 * k} />
        <rect x={ex - ew / 2 - 240 * k} y={ey - eh - 10 * k} width={ew + 480 * k} height={34 * k} fill={mix(C.navy, "#000000", 0.25)} />
        {/* ступени */}
        {Array.from({ length: STEP.n }).map((_, i) => {
          const sw = ew + 260 * k + i * 90 * k;
          const yy = ey + i * STEP.rise * FS;
          return (
            <g key={`s${i}`}>
              <rect x={ex - sw / 2} y={yy} width={sw} height={STEP.rise * FS + 2} fill={mix("#D7D2C8", "#FFFFFF", 0.25 - i * 0.06)} stroke={LINE} strokeWidth={1.6 * k} />
            </g>
          );
        })}
        {/* земля двора: плитка в перспективе */}
        <rect x={-3000} y={baseY} width={7000} height={2400} fill={C.sidewalk} />
        {Array.from({ length: 16 }).map((_, i) => {
          const s = FS + (i + 1) * 0.05;
          return <line key={`h${i}`} x1={-3000} y1={syY(s)} x2={4000} y2={syY(s)} stroke="#C4BEB3" strokeWidth={2 * s} />;
        })}
        {Array.from({ length: 30 }).map((_, i) => {
          const X = -2400 + i * 220;
          return <line key={`v${i}`} x1={syX(X, FS)} y1={baseY} x2={syX(X, 1.4)} y2={syY(1.4)} stroke="#C4BEB3" strokeWidth={2} />;
        })}
        {/* клумбы у фасада */}
        {[-1, 1].map((side) => {
          const cx = ex + side * (ew / 2 + 330 * k);
          return (
            <g key={`f${side}`}>
              <rect x={cx - 170 * k} y={baseY - 30 * k} width={340 * k} height={46 * k} rx={10 * k} fill="#9A8C7A" stroke={LINE} strokeWidth={2 * k} />
              {[0, 1, 2, 3, 4].map((j) => (
                <circle key={j} cx={cx - 130 * k + j * 65 * k} cy={baseY - 52 * k} r={34 * k} fill={j % 2 ? C.tree : C.treeDeep} stroke={ink(C.tree, 0.7)} strokeWidth={1.6 * k} />
              ))}
              {[0, 1, 2].map((j) => (
                <circle key={`fl${j}`} cx={cx - 90 * k + j * 90 * k} cy={baseY - 74 * k} r={10 * k} fill={j === 1 ? "#F2C14E" : "#E8776A"} />
              ))}
            </g>
          );
        })}
        {/* деревья двора */}
        <YardTree x={syX(-260, 0.47)} y={syY(0.47)} k={0.47 * 1.1} seed={3} tall sway={sway} />
        <YardTree x={syX(2150, 0.46)} y={syY(0.46)} k={0.46 * 1.1} seed={5} sway={-sway} />
        <YardTree x={syX(2700, 0.55)} y={syY(0.55)} k={0.55 * 1.1} seed={9} tall sway={sway} />
        {/* скамейка справа от входа */}
        <g>
          <rect x={syX(1720, 0.5) - 90} y={syY(0.5) - 70} width={180} height={18} rx={6} fill={C.wood} stroke={LINE} strokeWidth={2} />
          <rect x={syX(1720, 0.5) - 90} y={syY(0.5) - 104} width={180} height={14} rx={6} fill={C.wood} stroke={LINE} strokeWidth={2} />
          <rect x={syX(1720, 0.5) - 80} y={syY(0.5) - 52} width={10} height={52} fill="#5C6470" />
          <rect x={syX(1720, 0.5) + 70} y={syY(0.5) - 52} width={10} height={52} fill="#5C6470" />
        </g>
      </Svg>
      {/* табличка «Мектеп» на козырьке */}
      <div
        style={box({
          left: ex - 180,
          top: ey - eh - 66 * k - 2,
          width: 360,
          height: 56 * k + 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 92 * k,
          letterSpacing: -1,
          color: "#FFFFFF",
        })}
      >
        {M13_TEXT.school}
      </div>
      {mid}
    </>
  );
};

// Передний план двора: размытые кусты у нижних углов (глубина).
export const SchoolYardFront: React.FC<{ readonly blur?: number }> = ({ blur = 5 }) => (
  <Svg blur={blur}>
    {[
      [-80, 1990, 1.4],
      [1230, 2010, 1.5],
    ].map(([x, y, k], i) => (
      <g key={i}>
        {[0, 1, 2, 3].map((j) => (
          <circle key={j} cx={x + (j - 1.5) * 90 * k} cy={y - (j % 2 ? 90 : 40) * k} r={110 * k} fill={j % 2 ? C.treeDeep : C.tree} />
        ))}
      </g>
    ))}
  </Svg>
);

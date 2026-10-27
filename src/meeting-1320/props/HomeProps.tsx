// Домашний реквизит №31 (сцены 9–11): бумаги отца, рисунок сына (магнит и
// скрепки), стол крупно сверху, значок маршрута «ҮЙ → МЕКТЕП → ҮЙ»,
// белый седан BalaGo (Volkswagen Polo) — только для финальной карточки.
import { box } from "../kit";
import { clamp, hash01, lerp } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import type { CarPaint } from "./Car";

// Белый Volkswagen Polo BalaGo — тот же силуэт седана, белая окраска,
// без шашечек и жёлтой «такси»-раскраски.
export const POLO_PAINT: CarPaint = { body: "#FBFBF8", shade: "#E3E7EC", line: "#8E99A8" };

// ------------------------------------------------------------- рисунок
// Рисунок сына: магнит-подкова (красный, серые полюса), цепочка скрепок,
// штрихи «притяжения», солнце, заголовок «Тажрыйба» детским почерком.
// (0,0) — центр листа, w × h ≈ А4.
export const DrawingArt: React.FC<{ readonly w: number; readonly line?: number }> = ({ w, line = 4 }) => {
  const h = w * 1.36;
  const mx = 0;
  const my = -h * 0.02;
  const r = w * 0.22;
  const mw = r * 0.55;
  const tipY = my + r * 1.1;
  const clip = (x: number, y: number, a: number, k: number, c: string = C.kidBlue) => (
    <g key={k} transform={`rotate(${a} ${x} ${y})`}>
      <rect x={x - w * 0.034} y={y} width={w * 0.068} height={h * 0.085} rx={w * 0.034} fill="none" stroke={c} strokeWidth={line * 1.1} />
      <rect x={x - w * 0.016} y={y + h * 0.014} width={w * 0.032} height={h * 0.05} rx={w * 0.016} fill="none" stroke={c} strokeWidth={line * 0.8} />
    </g>
  );
  // неровная «карандашная» линия
  const wob = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const n = 6;
    let d = `M ${x0} ${y0}`;
    for (let i = 1; i <= n; i++) d += ` L ${lerp(x0, x1, i / n) + (hash01(k + i) - 0.5) * line} ${lerp(y0, y1, i / n) + (hash01(k * 3 + i) - 0.5) * line}`;
    return d;
  };
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.012} fill="#FFFEF8" stroke="#C9C1B2" strokeWidth={line * 0.6} />
      <text x={-w * 0.36} y={-h * 0.36} fontFamily={F.kid} fontWeight={900} fontSize={w * 0.12} fill={C.kidBlue} transform={`rotate(-4 ${-w * 0.36} ${-h * 0.36})`}>
        {M13_TEXT.drawing.title}
      </text>
      {/* солнце */}
      <circle cx={w * 0.34} cy={-h * 0.37} r={w * 0.06} fill="#FFD43B" stroke="#F2B705" strokeWidth={line * 0.6} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={w * 0.34 + Math.cos(a) * w * 0.08} y1={-h * 0.37 + Math.sin(a) * w * 0.08} x2={w * 0.34 + Math.cos(a) * w * 0.11} y2={-h * 0.37 + Math.sin(a) * w * 0.11} stroke="#F2B705" strokeWidth={line * 0.7} strokeLinecap="round" />;
      })}
      {/* магнит-подкова */}
      <path d={`M ${mx - r} ${my + r * 0.9} L ${mx - r} ${my} A ${r} ${r} 0 0 1 ${mx + r} ${my} L ${mx + r} ${my + r * 0.9}`} stroke={C.kidRed} strokeWidth={mw} fill="none" strokeLinejoin="round" />
      <path d={`M ${mx - r} ${my + r * 0.62} L ${mx - r} ${my + r * 1.06} M ${mx + r} ${my + r * 0.62} L ${mx + r} ${my + r * 1.06}`} stroke="#8E96A3" strokeWidth={mw} fill="none" />
      <path d={`M ${mx - r - mw / 2} ${my + r * 0.9} L ${mx - r - mw / 2} ${my} A ${r + mw / 2} ${r + mw / 2} 0 0 1 ${mx + r + mw / 2} ${my} L ${mx + r + mw / 2} ${my + r * 1.06}`} stroke="#B53A33" strokeWidth={line * 0.7} fill="none" opacity={0.8} />
      {/* скрепки: цепочка у левого полюса, одна у правого, две лежат внизу */}
      {clip(mx - r, tipY + h * 0.01, 6, 1)}
      {clip(mx - r + w * 0.012, tipY + h * 0.095, -8, 2)}
      {clip(mx - r + w * 0.006, tipY + h * 0.18, 5, 3, C.kidGreen)}
      {clip(mx + r, tipY + h * 0.01, -10, 4)}
      {clip(-w * 0.28, h * 0.36, 72, 5, C.kidPurple)}
      {clip(w * 0.16, h * 0.38, 104, 6)}
      {/* штрихи «притяжения» */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`${wob(mx + sd * (r + mw * 0.9), tipY - h * 0.01, mx + sd * (r + mw * 0.9 + w * 0.08), tipY + h * 0.01, 3 + sd)} ${wob(mx + sd * (r + mw * 0.9), tipY + h * 0.05, mx + sd * (r + mw * 0.9 + w * 0.08), tipY + h * 0.05, 9 + sd)}`} stroke={C.kidOrange} strokeWidth={line} fill="none" strokeLinecap="round" />
      ))}
      {/* стол-линия опыта */}
      <path d={wob(-w * 0.4, h * 0.44, w * 0.4, h * 0.44, 21)} stroke={C.kidGrey} strokeWidth={line} fill="none" strokeLinecap="round" />
    </g>
  );
};

// Рисунок лежит на столе в перспективе HomeRoom (вид спереди-сверху).
export const DrawingFront: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly angle?: number }> = ({ x, y, w, angle = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(1 0.32) rotate(${angle})`}>
      <DrawingArt w={w} line={3} />
    </g>
  </svg>
);

// ------------------------------------------------------------- бумаги
// Стопка рабочих бумаг (листы чуть вразнобой, строки, скрепка-зажим).
const Sheet: React.FC<{ readonly w: number; readonly i: number; readonly line: number }> = ({ w, i, line }) => {
  const h = w * 1.38;
  return (
    <g transform={`translate(${(hash01(i * 2.7) - 0.5) * w * 0.06} ${(hash01(i * 5.3) - 0.5) * w * 0.05}) rotate(${(hash01(i * 3.1) - 0.5) * 7})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.01} fill={i === 0 ? "#FFFFFF" : "#F4F1EA"} stroke="#BFC5CE" strokeWidth={line} />
      {i === 0
        ? Array.from({ length: 9 }).map((_, j) => <rect key={j} x={-w * 0.38} y={-h * 0.36 + j * h * 0.075} width={w * (j === 0 ? 0.42 : 0.5 + 0.26 * hash01(j * 1.9))} height={h * (j === 0 ? 0.03 : 0.018)} rx={2} fill={j === 0 ? "#6E7B90" : "#B8C0CC"} />)
        : null}
      {i === 0 ? <rect x={-w * 0.38} y={h * 0.3} width={w * 0.3} height={h * 0.06} rx={3} fill="none" stroke="#9AA6B6" strokeWidth={line} /> : null}
    </g>
  );
};

// Вид сверху (крупно): n листов, центр (x, y), ширина листа w.
export const PapersTop: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly angle?: number; readonly n?: number }> = ({ x, y, w, angle = 0, n = 5 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <rect x={-w * 0.52} y={-w * 0.68} width={w * 1.04} height={w * 1.42} rx={6} fill="#000000" opacity={0.08} transform={`translate(${w * 0.03} ${w * 0.04})`} />
    {Array.from({ length: n }).map((_, k) => (
      <Sheet key={k} w={w} i={n - 1 - k} line={Math.max(1.5, w * 0.006)} />
    ))}
    {/* зажим */}
    <rect x={-w * 0.12} y={-w * 0.72} width={w * 0.24} height={w * 0.08} rx={w * 0.02} fill="#3A4254" />
  </g>
);

// Стопка на столе в перспективе HomeRoom.
export const PapersFront: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly angle?: number }> = ({ x, y, w, angle = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <rect x={x - w * 0.5} y={y + 2} width={w} height={8} rx={2} fill="#E9E4DA" stroke="#BFC5CE" strokeWidth={2} />
    <g transform={`translate(${x} ${y}) scale(1 0.32)`}>
      <PapersTop x={0} y={0} w={w} angle={angle} n={4} />
    </g>
  </svg>
);

// Стол крупно сверху: тёплое дерево, доски; свет лампы (late — поздно).
export const TableTop: React.FC<{ readonly late?: number; readonly children?: React.ReactNode }> = ({ late = 0, children }) => (
  <>
    <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
      <defs>
        <radialGradient id="tt-lamp" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#FFE9BF" stopOpacity={0.12} />
          <stop offset="1" stopColor="#3A2410" stopOpacity={0.25 + 0.25 * clamp(late)} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1920} fill={C.woodLight} />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={i * 190 - 40} y={0} width={4} height={1920} fill={C.wood} opacity={0.6} />
          <path d={`M ${i * 190 + 40} 0 Q ${i * 190 + 70} 600 ${i * 190 + 30} 1200 T ${i * 190 + 60} 1920`} stroke={C.wood} strokeWidth={2.5} fill="none" opacity={0.35} />
        </g>
      ))}
    </svg>
    {children}
    <svg width={1080} height={1920} style={box({ left: 0, top: 0, pointerEvents: "none" })}>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#tt-lamp)" />
    </svg>
  </>
);

// ------------------------------------------------------------- маршрут
// Значок «ҮЙ → МЕКТЕП → ҮЙ»: дом — школа — дом, линия маршрута
// прорисовывается (draw 0…1). (x, y) — центр, k — масштаб.
const House: React.FC<{ readonly x: number; readonly y: number; readonly k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M -34 -6 L 0 -38 L 34 -6 L 34 32 L -34 32 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -44 0 L 0 -44 L 44 0" stroke={C.navy} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-10} y={8} width={20} height={24} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
  </g>
);
const School: React.FC<{ readonly x: number; readonly y: number; readonly k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-48} y={-14} width={96} height={46} fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -56 -12 L 0 -44 L 56 -12 Z" fill={C.yellow} stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-10} y={6} width={20} height={26} fill={C.navy} />
    <rect x={-36} y={-2} width={14} height={14} fill="#BFD6EE" stroke={C.navy} strokeWidth={3} />
    <rect x={22} y={-2} width={14} height={14} fill="#BFD6EE" stroke={C.navy} strokeWidth={3} />
  </g>
);

export const RouteBadge: React.FC<{ readonly x: number; readonly y: number; readonly k?: number; readonly draw?: number; readonly label?: boolean }> = ({ x, y, k = 1, draw = 1, label = true }) => {
  const u = clamp(draw);
  const W = 640;
  const xs = [-W / 2 + 70, 0, W / 2 - 70];
  const seg = (a: number, b: number, t: number) => (t > 0 ? <line x1={a + 56} y1={0} x2={lerp(a + 56, b - 56, clamp(t))} y2={0} stroke={C.navy} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" /> : null);
  return (
    <div style={box({ left: x - (W * k) / 2, top: y - 120 * k, width: W * k, height: 240 * k })}>
      <svg width={W * k} height={240 * k} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`scale(${k}) translate(${W / 2} 92)`}>
          {seg(xs[0], xs[1], u * 2)}
          {seg(xs[1], xs[2], u * 2 - 1)}
          <House x={xs[0]} y={0} k={1} />
          <g opacity={clamp(u * 3 - 0.5)}>
            <School x={xs[1]} y={0} k={1} />
          </g>
          <g opacity={clamp(u * 3 - 1.8)}>
            <House x={xs[2]} y={0} k={1} />
          </g>
        </g>
      </svg>
      {label ? <div style={box({ left: 0, top: 160 * k, width: W * k, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 46 * k, color: C.navy, letterSpacing: 1 * k, opacity: clamp(u * 2 - 0.4) })}>{M13_TEXT.page.route}</div> : null}
    </div>
  );
};

// ------------------------------------------------------------- планер
// Бумажный планер недели на столе (вид сверху): пять дней, в каждом —
// жёлтая метка «13:20» и серые строки рабочих дел. lit 0…5 — сколько
// меток уже «отмечено» пальцем (подсветка). (x, y) — центр, w — ширина.
export const PLANNER = { w: 960, h: 620 } as const;
export const plannerChip = (x: number, y: number, i: number) => ({ x: x - PLANNER.w / 2 + 40 + (i + 0.5) * ((PLANNER.w - 80) / 5), y: y + 90 });
export const PlannerTop: React.FC<{ readonly x: number; readonly y: number; readonly lit?: number }> = ({ x, y, lit = 0 }) => {
  const W = PLANNER.w;
  const Hh = PLANNER.h;
  const cw = (W - 80) / 5;
  const days = M13_TEXT.calendar.days;
  return (
    <g>
      <rect x={x - W / 2 + 10} y={y - Hh / 2 + 14} width={W} height={Hh} rx={14} fill="#000000" opacity={0.1} />
      <rect x={x - W / 2} y={y - Hh / 2} width={W} height={Hh} rx={14} fill="#FFFDF7" stroke="#C9C1B2" strokeWidth={3} />
      <text x={x - W / 2 + 40} y={y - Hh / 2 + 64} fontFamily={F.text} fontWeight={800} fontSize={38} fill={C.navy}>
        {M13_TEXT.week.title}
      </text>
      {days.map((d, i) => {
        const cx = x - W / 2 + 40 + i * cw;
        const chip = plannerChip(x, y, i);
        const on = clamp(lit - i);
        return (
          <g key={d}>
            {i > 0 ? <line x1={cx} y1={y - Hh / 2 + 96} x2={cx} y2={y + Hh / 2 - 30} stroke="#E4DDD0" strokeWidth={2} /> : null}
            <text x={cx + cw / 2} y={y - Hh / 2 + 130} textAnchor="middle" fontFamily={F.text} fontWeight={700} fontSize={25} fill="#5A6577">
              {d}
            </text>
            {[0, 1].map((j) => (
              <rect key={j} x={cx + 18} y={y - Hh / 2 + 160 + j * 44} width={cw - 36 - 20 * hash01(i * 3 + j)} height={14} rx={7} fill="#D5DBE4" />
            ))}
            <rect x={chip.x - cw / 2 + 12} y={chip.y - 30} width={cw - 24} height={60} rx={14} fill={C.yellow} stroke={on > 0 ? C.navy : "#E2B92C"} strokeWidth={on > 0 ? 4 : 2} />
            <text x={chip.x} y={chip.y + 11} textAnchor="middle" fontFamily={F.text} fontWeight={800} fontSize={34} fill={C.navy}>
              {M13_TEXT.clock}
            </text>
            {[0, 1].map((j) => (
              <rect key={j} x={cx + 18} y={chip.y + 60 + j * 44} width={cw - 40 - 24 * hash01(i * 5 + j + 2)} height={14} rx={7} fill="#E4E8EE" />
            ))}
          </g>
        );
      })}
    </g>
  );
};

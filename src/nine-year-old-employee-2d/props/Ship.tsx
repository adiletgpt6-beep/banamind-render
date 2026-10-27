// Г. Картонный корабль во дворе — одна геометрия для фотографии,
// воспоминания, двора и детского рисунка. Узнаваемые признаки: коричневые
// панели корпуса со швами и скотчем, рубка с круглым иллюминатором,
// мачта-труба с жёлтым флажком. Нос — справа.
// Единицы: ширина корпуса ≈ 1000, (0, 0) — середина днища на земле.
import { C } from "../theme";

export const SHIP = {
  deckY: -260,
  hull: [
    [-500, -260],
    [430, -260],
    [520, -345],
    [380, 0],
    [-400, 0],
  ] as const,
  seams: [-250, 0, 250],
  cabin: { x0: -330, x1: -60, top: -540 },
  porthole: { x: -195, y: -420, r: 46 },
  mast: { x: 150, top: -900, w: 34 },
  bow: { x: 430, y: -260 }, // место на носу
} as const;

export type ShipStage = {
  readonly cabin: boolean; // рубка собрана
  readonly mast: "none" | "lying" | "up";
  readonly mastLift?: number; // 0…1 мачта поднимается (двор)
  readonly brace?: number; // 0…1 опора у основания мачты
  readonly flagWave?: number; // фаза колыхания флажка
};

// Флажок: треугольник с колыханием (мир, от верха мачты).
const flagPath = (x: number, y: number, wave: number, scale = 1) => {
  const a = Math.sin(wave) * 10 * scale;
  const b = Math.sin(wave + 1.3) * 14 * scale;
  return `M ${x} ${y} Q ${x + 90 * scale} ${y + 10 * scale + a} ${x + 180 * scale} ${y + 44 * scale + b} Q ${x + 90 * scale} ${y + 70 * scale + a} ${x} ${y + 100 * scale} Z`;
};

// Настоящий корабль (плоская заливка, швы, скотч, тени).
export const ShipReal: React.FC<{ readonly stage: ShipStage }> = ({ stage }) => {
  const hull = SHIP.hull.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ") + " Z";
  const lift = stage.mast === "up" ? (stage.mastLift ?? 1) : 0;
  const m = SHIP.mast;
  // мачта поднимается вокруг основания (на палубе)
  const mastAng = (1 - lift) * 78;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={560} ry={34} fill="rgba(40,30,20,0.18)" />
      {/* мачта (за рубкой нет — стоит перед ней, на палубе) */}
      {stage.mast === "up" ? (
        <g transform={`rotate(${mastAng} ${m.x} ${SHIP.deckY})`}>
          <rect x={m.x - m.w / 2} y={m.top} width={m.w} height={SHIP.deckY - m.top + 10} rx={10} fill={C.cardboardLight} stroke={C.cardboardDark} strokeWidth={5} />
          {[0.25, 0.5, 0.75].map((k) => (
            <rect key={k} x={m.x - m.w / 2} y={m.top + (SHIP.deckY - m.top) * k} width={m.w} height={12} fill="#E9D9B9" opacity={0.8} />
          ))}
          <path d={flagPath(m.x + m.w / 2, m.top + 6, stage.flagWave ?? 0)} fill={C.yellow} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ) : null}
      {/* корпус */}
      <path d={hull} fill={C.cardboard} stroke={C.cardboardDark} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -500 -260 L 430 -260 L 520 -345 L 505 -300 L 420 -228 L -480 -228 Z`} fill={C.cardboardLight} opacity={0.75} />
      {SHIP.seams.map((x) => (
        <g key={x}>
          <line x1={x} y1={-252} x2={x * 0.82} y2={-6} stroke={C.cardboardDark} strokeWidth={4} />
          <rect x={x - 16} y={-200} width={32} height={60} fill="#E9D9B9" opacity={0.85} transform={`rotate(${x * 0.01} ${x} -170)`} />
        </g>
      ))}
      {/* волнистые края картона снизу */}
      <path d="M -390 -40 Q -340 -60 -290 -40 T -190 -40 T -90 -40 T 10 -40 T 110 -40 T 210 -40 T 310 -40" stroke={C.cardboardDark} strokeWidth={4} fill="none" opacity={0.6} />
      {/* рубка */}
      {stage.cabin ? (
        <g>
          <rect x={SHIP.cabin.x0} y={SHIP.cabin.top} width={SHIP.cabin.x1 - SHIP.cabin.x0} height={SHIP.deckY - SHIP.cabin.top + 4} fill={C.cardboardLight} stroke={C.cardboardDark} strokeWidth={6} />
          <rect x={SHIP.cabin.x0 - 26} y={SHIP.cabin.top - 30} width={SHIP.cabin.x1 - SHIP.cabin.x0 + 52} height={36} rx={6} fill={C.cardboard} stroke={C.cardboardDark} strokeWidth={6} />
          <circle cx={SHIP.porthole.x} cy={SHIP.porthole.y} r={SHIP.porthole.r + 10} fill="#E9D9B9" stroke={C.cardboardDark} strokeWidth={5} />
          <circle cx={SHIP.porthole.x} cy={SHIP.porthole.y} r={SHIP.porthole.r} fill="#7FA3C9" />
          <path d={`M ${SHIP.porthole.x - 20} ${SHIP.porthole.y - 18} Q ${SHIP.porthole.x} ${SHIP.porthole.y - 30} ${SHIP.porthole.x + 18} ${SHIP.porthole.y - 16}`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      ) : null}
      {/* опора мачты: картонная косынка у основания */}
      {stage.mast === "up" && (stage.brace ?? 0) > 0 ? (
        <path d={`M ${m.x + m.w / 2} ${SHIP.deckY - 120} L ${m.x + m.w / 2} ${SHIP.deckY} L ${m.x + m.w / 2 + 120} ${SHIP.deckY} Z`} fill={C.cardboard} stroke={C.cardboardDark} strokeWidth={5} strokeLinejoin="round" opacity={stage.brace} />
      ) : null}
      {/* мачта ещё лежит на земле перед корпусом (стадия фотографии) */}
      {stage.mast === "lying" ? (
        <g>
          <rect x={-120} y={-34} width={620} height={m.w} rx={12} fill={C.cardboardLight} stroke={C.cardboardDark} strokeWidth={5} />
          <rect x={60} y={-34} width={14} height={m.w} fill="#E9D9B9" />
          <rect x={260} y={-34} width={14} height={m.w} fill="#E9D9B9" />
        </g>
      ) : null}
    </g>
  );
};

// Детский рисунок того же корабля: неровные линии фломастером, штриховка,
// флажок того же жёлтого цвета. Детерминированное «дрожание» линий.
const wob = (x: number, y: number, k: number, amt = 7) => [x + Math.sin(k * 12.9898 + y * 0.01) * amt, y + Math.cos(k * 78.233 + x * 0.01) * amt] as const;
const wobbly = (pts: readonly (readonly [number, number])[], closed: boolean, seed: number) => {
  const out: string[] = [];
  const all = closed ? [...pts, pts[0]] : pts;
  all.forEach(([x, y], i) => {
    if (i === 0) {
      const [a, b] = wob(x, y, seed + i);
      out.push(`M ${a} ${b}`);
      return;
    }
    const [px, py] = all[i - 1];
    // промежуточная точка с отклонением — линия «от руки»
    const [mx, my] = wob((px + x) / 2, (py + y) / 2, seed + i * 3.1, 10);
    const [a, b] = wob(x, y, seed + i);
    out.push(`Q ${mx} ${my} ${a} ${b}`);
  });
  return out.join(" ");
};

export const ShipDrawn: React.FC<{ readonly withBoy?: boolean }> = ({ withBoy = true }) => {
  const m = SHIP.mast;
  const c = SHIP.cabin;
  const pen = { stroke: "#2A2420", strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g>
      {/* волны-черточки под кораблём (на земле во дворе — травка) */}
      <path d={wobbly([[-560, 30], [-420, 10], [-300, 34], [-160, 12], [-20, 34], [140, 12], [300, 34], [460, 12], [580, 30]], false, 3)} {...pen} stroke="#5FA35A" fill="none" />
      {/* корпус: штриховка коричневым и контур */}
      <path d={wobbly(SHIP.hull, true, 1)} fill={C.cardboard} opacity={0.9} />
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={wobbly([[-430 + i * 55, -240], [-470 + i * 55 + 60, -30]], false, 20 + i)} stroke={C.cardboardDark} strokeWidth={6} opacity={0.35} fill="none" strokeLinecap="round" />
      ))}
      <path d={wobbly(SHIP.hull, true, 1)} {...pen} fill="none" />
      {SHIP.seams.map((x, i) => (
        <path key={x} d={wobbly([[x, -250], [x * 0.82, -10]], false, 40 + i)} {...pen} strokeWidth={6} fill="none" />
      ))}
      {/* рубка с иллюминатором */}
      <path d={wobbly([[c.x0, SHIP.deckY], [c.x0, c.top], [c.x1, c.top], [c.x1, SHIP.deckY]], false, 7)} {...pen} fill={C.cardboardLight} />
      <circle cx={SHIP.porthole.x} cy={SHIP.porthole.y} r={SHIP.porthole.r} fill="#7FA3C9" {...pen} />
      {/* мачта и флажок */}
      <path d={wobbly([[m.x, SHIP.deckY], [m.x + 6, m.top]], false, 9)} {...pen} strokeWidth={14} fill="none" />
      <path d={wobbly([[m.x + 6, m.top], [m.x + 190, m.top + 46], [m.x + 6, m.top + 100]], true, 11)} fill={C.yellow} {...pen} />
      {/* Бектур на носу: тёмные волосы, жёлтая рубашка, синие брюки */}
      {withBoy ? <BoyDrawn x={SHIP.bow.x - 20} y={SHIP.bow.y} /> : null}
    </g>
  );
};

// Маленький Бектур в рисунке (стоит на палубе у носа, рука поднята).
export const BoyDrawn: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const pen = { stroke: "#2A2420", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* ноги */}
      <path d="M -18 -4 L -22 -70 M 18 -4 L 20 -70" {...pen} stroke="#2B3A67" strokeWidth={14} />
      {/* рубашка */}
      <path d={wobbly([[-38, -70], [-34, -170], [34, -170], [38, -70]], true, 61)} fill="#F2B632" {...pen} />
      {/* руки: одна поднята к флажку */}
      <path d="M -34 -160 L -70 -110 M 34 -160 L 78 -232" {...pen} strokeWidth={10} />
      {/* голова и волосы */}
      <circle cx={0} cy={-212} r={44} fill="#F0C29A" {...pen} />
      <path d={wobbly([[-44, -218], [-34, -258], [0, -268], [34, -258], [44, -222], [10, -236], [-20, -234]], true, 71)} fill="#221B19" stroke="#221B19" strokeWidth={5} />
      <circle cx={-15} cy={-210} r={5} fill="#2A2420" />
      <circle cx={15} cy={-210} r={5} fill="#2A2420" />
      <path d="M -16 -188 Q 0 -174 16 -188" {...pen} strokeWidth={5} fill="none" />
    </g>
  );
};

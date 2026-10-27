// Ожившая бумажная точка: жёлтый кружок из бумаги (кромка, толщина листа,
// блик), глаза с бликами и морганием, рот по громкости речи, тонкие
// ножки и ручки. Рисунок 160 × 200, опорная точка — середина стоп (80, 196).
import { C, DOT_COLORS, type DotColor } from "./palette";

export const DOT_W = 160;
export const DOT_H = 200;

export type DotPose = {
  readonly color?: DotColor;
  readonly look?: { readonly x: number; readonly y: number }; // −1…1
  readonly blink?: number; // 0 открыт … 1 закрыт
  readonly mouth?: number; // 0 закрыт … 1 широко открыт (речь)
  readonly mood?: "smile" | "curious" | "thoughtful" | "happy";
  readonly face?: number; // 0 — напечатанный кружок без лица, 1 — живой
  readonly legs?: number; // 0 — ножек нет, 1 — выросли
  readonly walk?: number; // фаза шага (рад)
  readonly stride?: number; // 0 стоит … 1 шагает
  readonly armL?: number; // угол руки, градусы: 0 — вниз, 90 — в сторону, 160 — вверх
  readonly armR?: number;
  readonly belt?: boolean; // ремень безопасности по диагонали
  readonly glow?: number; // светящееся кольцо «смысла»
  readonly blush?: number;
};

export const Dot: React.FC<DotPose> = ({
  color = "yellow",
  look = { x: 0, y: 0 },
  blink = 0,
  mouth = 0,
  mood = "smile",
  face = 1,
  legs = 1,
  walk = 0,
  stride = 0,
  armL = 20,
  armR = 20,
  belt = false,
  glow = 0,
  blush = 0.55,
}) => {
  const col = DOT_COLORS[color];
  const cx = 80;
  const cy = 86;
  const r = 56;
  const legLen = 46 * legs;
  const hipY = cy + r - 8;
  const footL = { x: cx - 18 + Math.sin(walk) * 12 * stride, y: hipY + legLen - Math.max(0, Math.cos(walk)) * 10 * stride };
  const footR = { x: cx + 18 - Math.sin(walk) * 12 * stride, y: hipY + legLen - Math.max(0, -Math.cos(walk)) * 10 * stride };
  const arm = (side: -1 | 1, deg: number) => {
    const a = (deg * Math.PI) / 180;
    const sx = cx + side * (r - 6);
    const sy = cy + 8;
    const len = 40;
    const ex = sx + side * Math.sin(a) * len;
    const ey = sy + Math.cos(a) * len;
    const mx = sx + side * Math.sin(a) * len * 0.55 + side * 4;
    const my = sy + Math.cos(a) * len * 0.55 + 6;
    return { sx, sy, ex, ey, mx, my };
  };
  const aL = arm(-1, armL);
  const aR = arm(1, armR);
  const eyeOpen = Math.max(0.08, 1 - blink) * face;
  const px = look.x * 6;
  const py = look.y * 5;
  const mOpen = Math.max(0, Math.min(1, mouth));
  return (
    <svg width={DOT_W} height={DOT_H} viewBox={`0 0 ${DOT_W} ${DOT_H}`} style={{ overflow: "visible" }}>
      {glow > 0 ? (
        <circle cx={cx} cy={cy} r={r + 16 + 6 * glow} fill="none" stroke={C.yellow} strokeWidth={8} opacity={0.55 * glow} strokeDasharray="4 10" strokeLinecap="round" />
      ) : null}
      {/* ножки */}
      {legs > 0.02 ? (
        <g stroke={C.navy} strokeWidth={7} strokeLinecap="round" fill="none">
          <path d={`M${cx - 16} ${hipY} Q ${cx - 20} ${(hipY + footL.y) / 2} ${footL.x} ${footL.y}`} />
          <path d={`M${cx + 16} ${hipY} Q ${cx + 20} ${(hipY + footR.y) / 2} ${footR.x} ${footR.y}`} />
          <ellipse cx={footL.x - 5} cy={footL.y + 1} rx={12 * legs} ry={6 * legs} fill={C.navy} stroke="none" />
          <ellipse cx={footR.x + 5} cy={footR.y + 1} rx={12 * legs} ry={6 * legs} fill={C.navy} stroke="none" />
        </g>
      ) : null}
      {/* ручки */}
      {legs > 0.02 ? (
        <g stroke={C.navy} strokeWidth={6} strokeLinecap="round" fill="none" opacity={Math.min(1, legs * 1.5)}>
          <path d={`M${aL.sx} ${aL.sy} Q ${aL.mx} ${aL.my} ${aL.ex} ${aL.ey}`} />
          <path d={`M${aR.sx} ${aR.sy} Q ${aR.mx} ${aR.my} ${aR.ex} ${aR.ey}`} />
          <circle cx={aL.ex} cy={aL.ey} r={7} fill={C.navy} stroke="none" />
          <circle cx={aR.ex} cy={aR.ey} r={7} fill={C.navy} stroke="none" />
        </g>
      ) : null}
      {/* толщина бумаги + тело */}
      <circle cx={cx + 3} cy={cy + 5} r={r} fill={col.edge} />
      <circle cx={cx} cy={cy} r={r} fill={col.fill} stroke="#FFFFFF" strokeWidth={5} />
      <path d={`M${cx - 36} ${cy - 30} A ${r - 14} ${r - 14} 0 0 1 ${cx + 6} ${cy - 44}`} fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.55} />
      {belt ? (
        <g>
          <path d={`M${cx - 44} ${cy - 30} L ${cx + 40} ${cy + 40}`} stroke="#2B3E6E" strokeWidth={13} strokeLinecap="round" />
          <path d={`M${cx - 44} ${cy - 30} L ${cx + 40} ${cy + 40}`} stroke="#4E6AA8" strokeWidth={5} strokeLinecap="round" strokeDasharray="2 8" />
          <rect x={cx + 26} y={cy + 24} width={18} height={14} rx={3} fill="#C9D3E6" stroke="#2B3E6E" strokeWidth={3} />
        </g>
      ) : null}
      {/* лицо */}
      {face > 0.01 ? (
        <g opacity={Math.min(1, face * 1.3)}>
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={cx + s * 20} cy={cy - 10} rx={13} ry={16 * eyeOpen} fill="#FFFFFF" stroke={C.navy} strokeWidth={3} />
              {eyeOpen > 0.3 ? (
                <>
                  <circle cx={cx + s * 20 + px} cy={cy - 8 + py} r={7.5} fill={C.navy} />
                  <circle cx={cx + s * 20 + px + 2.5} cy={cy - 11 + py} r={2.6} fill="#FFFFFF" />
                </>
              ) : null}
            </g>
          ))}
          {/* брови по настроению */}
          {mood === "curious" ? (
            <g stroke={C.navy} strokeWidth={4} strokeLinecap="round" fill="none">
              <path d={`M${cx - 30} ${cy - 36} Q ${cx - 20} ${cy - 44} ${cx - 10} ${cy - 38}`} />
              <path d={`M${cx + 10} ${cy - 33} Q ${cx + 20} ${cy - 36} ${cx + 30} ${cy - 33}`} />
            </g>
          ) : mood === "thoughtful" ? (
            <g stroke={C.navy} strokeWidth={4} strokeLinecap="round" fill="none">
              <path d={`M${cx - 30} ${cy - 32} L ${cx - 10} ${cy - 36}`} />
              <path d={`M${cx + 10} ${cy - 36} L ${cx + 30} ${cy - 32}`} />
            </g>
          ) : null}
          <circle cx={cx - 36} cy={cy + 14} r={8} fill="#FF8FA3" opacity={blush * 0.6} />
          <circle cx={cx + 36} cy={cy + 14} r={8} fill="#FF8FA3" opacity={blush * 0.6} />
          {/* рот */}
          {mOpen > 0.06 ? (
            <g>
              <ellipse cx={cx} cy={cy + 22} rx={10 + 5 * mOpen} ry={3 + 11 * mOpen} fill={C.navy} />
              <ellipse cx={cx} cy={cy + 24 + 6 * mOpen} rx={6 + 2 * mOpen} ry={2 + 4 * mOpen} fill="#FF8FA3" opacity={mOpen > 0.3 ? 1 : 0} />
            </g>
          ) : mood === "thoughtful" ? (
            <path d={`M${cx - 10} ${cy + 22} Q ${cx} ${cy + 19} ${cx + 10} ${cy + 23}`} fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
          ) : (
            <path
              d={`M${cx - (mood === "happy" ? 16 : 12)} ${cy + 18} Q ${cx} ${cy + (mood === "happy" ? 34 : 29)} ${cx + (mood === "happy" ? 16 : 12)} ${cy + 18}`}
              fill={mood === "happy" ? C.navy : "none"}
              stroke={C.navy}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
        </g>
      ) : null}
    </svg>
  );
};

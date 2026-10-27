// Зал выступления (S10, фото зала в S11): спокойная светлая стена со
// звукопоглощающими панелями, экран слева, сцена с кафедрой, синие кулисы
// по краям, ряды зрителей со спины на переднем плане. Тот же зал, что на
// схеме в приглашении (сцена с кафедрой, ряды полукругом).
import { C } from "../theme";
import { roughPath, roughRect, Grain } from "../kit";

export const HALL = {
  stageTop: 1196, // верх настила
  stageFront: 1250, // кромка сцены
  stageBottom: 1340,
  screen: { x: 120, y: 430, w: 440, h: 280 },
  lectern: { x: 724, w: 176, top: 1004 },
  mom: { x: 560 }, // где стоит выступающая
  wall: "#E3E7EC",
  curtain: "#3E5274",
  curtainShade: "#33465F",
} as const;

// Задник: стена, панели, экран со слайдом, кулисы, сцена.
// Стена, экран, кулисы, сцена и пол — чистый SVG (для кадра и для фото).
export const HallG: React.FC<{ readonly ink: number; readonly slide?: number }> = ({ ink, slide = 1 }) => {
  const S = HALL.screen;
  return (
    <g>
        {/* вертикальные панели стены */}
        {Array.from({ length: 14 }, (_, i) => -260 + i * 120).map((x) => (
          <path key={x} d={`M ${x} 250 L ${x} ${HALL.stageTop}`} stroke="#CBD2DA" strokeWidth={ink * 0.6} />
        ))}
        <path d={`M -500 250 L 1580 250`} stroke="#CBD2DA" strokeWidth={ink * 0.8} />
        {/* светильники на потолке — тёплые пятна */}
        {[200, 540, 880].map((x) => (
          <ellipse key={x} cx={x} cy={200} rx={70} ry={14} fill="#FFF3D6" stroke={C.ink} strokeWidth={ink * 0.5} />
        ))}
        {/* экран со слайдом: заголовок, три простые иконки, линия-маршрут */}
        <rect x={S.x + 10} y={S.y + 14} width={S.w} height={S.h} rx={6} fill={C.shadow} />
        <path d={roughRect(S.x, S.y, S.w, S.h, 6, 141, ink * 0.3)} fill="#F8FAFC" stroke={C.ink} strokeWidth={ink} />
        <g opacity={slide}>
          <rect x={S.x + 34} y={S.y + 34} width={S.w * 0.5} height={20} rx={10} fill="#9DB0C6" />
          <rect x={S.x + 34} y={S.y + 66} width={S.w * 0.32} height={12} rx={6} fill="#C9D4E0" />
          {[0, 1, 2].map((i) => {
            const cx = S.x + 90 + i * 130;
            const cy = S.y + 170;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={38} fill={i === 1 ? C.yellowSoft : "#E3EAF2"} stroke={C.ink} strokeWidth={ink * 0.6} />
                {i === 0 ? <path d={`M ${cx - 16} ${cy + 14} L ${cx - 16} ${cy - 6} L ${cx} ${cy - 20} L ${cx + 16} ${cy - 6} L ${cx + 16} ${cy + 14} Z`} fill="none" stroke={C.ink} strokeWidth={ink * 0.5} /> : null}
                {i === 1 ? <path d={`M ${cx - 18} ${cy + 10} L ${cx - 4} ${cy - 12} L ${cx + 6} ${cy + 2} L ${cx + 18} ${cy - 14}`} fill="none" stroke={C.ink} strokeWidth={ink * 0.6} strokeLinecap="round" strokeLinejoin="round" /> : null}
                {i === 2 ? (
                  <g>
                    <circle cx={cx - 8} cy={cy - 6} r={9} fill="none" stroke={C.ink} strokeWidth={ink * 0.5} />
                    <circle cx={cx + 10} cy={cy - 2} r={8} fill="none" stroke={C.ink} strokeWidth={ink * 0.5} />
                    <path d={`M ${cx - 22} ${cy + 18} Q ${cx - 8} ${cy + 2} ${cx + 4} ${cy + 18} M ${cx - 2} ${cy + 18} Q ${cx + 10} ${cy + 6} ${cx + 22} ${cy + 18}`} fill="none" stroke={C.ink} strokeWidth={ink * 0.5} />
                  </g>
                ) : null}
                {i < 2 ? <path d={`M ${cx + 46} ${cy} L ${cx + 84} ${cy}`} stroke="#9DB0C6" strokeWidth={ink * 0.8} strokeDasharray={`${ink * 2} ${ink * 2}`} /> : null}
              </g>
            );
          })}
        </g>
        <rect x={S.x + S.w / 2 - 14} y={S.y - 30} width={28} height={30} fill="#9AA6B4" stroke={C.ink} strokeWidth={ink * 0.5} />
        {/* кулисы */}
        {[
          [-260, 120, 1],
          [960, 1340, -1],
        ].map(([x0, x1, side]) => (
          <g key={x0}>
            <path d={`M ${x0} 160 L ${x1} 160 Q ${x1 - side * 30} 700 ${x1 + side * 10} ${HALL.stageTop} L ${x0} ${HALL.stageTop} Z`} fill={HALL.curtain} stroke={C.ink} strokeWidth={ink} />
            {[0.25, 0.5, 0.75].map((u) => {
              const xx = x0 + (x1 - x0) * u;
              return <path key={u} d={`M ${xx} 170 Q ${xx - side * 16} 700 ${xx + side * 6} ${HALL.stageTop - 6}`} fill="none" stroke={HALL.curtainShade} strokeWidth={ink * 2.4} />;
            })}
          </g>
        ))}
        <path d={`M -500 150 L 1580 150 L 1580 196 Q 540 222 -500 196 Z`} fill={HALL.curtain} stroke={C.ink} strokeWidth={ink} />
        {/* сцена */}
        <path d={`M -500 ${HALL.stageTop} L 1580 ${HALL.stageTop} L 1580 ${HALL.stageFront} L -500 ${HALL.stageFront} Z`} fill={C.woodLight} stroke={C.ink} strokeWidth={ink} />
        {Array.from({ length: 12 }, (_, i) => -400 + i * 190).map((x) => (
          <path key={x} d={`M ${x} ${HALL.stageTop + 4} L ${x - 30} ${HALL.stageFront - 2}`} stroke={C.wood} strokeWidth={ink * 0.6} />
        ))}
        <path d={`M -500 ${HALL.stageFront} L 1580 ${HALL.stageFront} L 1580 ${HALL.stageBottom} L -500 ${HALL.stageBottom} Z`} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} />
        {/* пол зала (под рядами зрителей) */}
        <rect x={-500} y={HALL.stageBottom} width={2080} height={1200} fill="#B9B3C2" />
        {/* мягкое пятно света на сцене */}
        <ellipse cx={HALL.mom.x + 40} cy={HALL.stageTop + 26} rx={300} ry={26} fill="#FFF6DE" opacity={0.7} />
    </g>
  );
};

// Задник зала в кадре: стена с фактурой бумаги + HallG.
export const HallBack: React.FC<{ readonly ink: number; readonly uid?: string; readonly slide?: number }> = ({ ink, slide = 1 }) => (
  <>
    <div style={{ position: "absolute", left: -500, top: -500, width: 2080, height: HALL.stageTop + 500, backgroundColor: HALL.wall, overflow: "hidden" }}>
      <Grain opacity={0.45} w={2080} h={HALL.stageTop + 500} />
    </div>
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <HallG ink={ink} slide={slide} />
    </svg>
  </>
);

// Кафедра (поверх выступающей): деревянная, со скошенной столешницей и
// раскрытой жёлтой папкой.
export const LecternG: React.FC<{ readonly ink: number; readonly folder?: boolean }> = ({ ink, folder = true }) => {
  const L = HALL.lectern;
  const x0 = L.x - L.w / 2;
  const bottom = HALL.stageTop + 30;
  return (
    <g>
      <path d={roughPath([[x0 + 14, L.top + 30], [x0 + L.w - 14, L.top + 30], [x0 + L.w - 26, bottom], [x0 + 26, bottom]], 151, 1.4, true)} fill={C.wood} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${x0 + 40} ${L.top + 70} L ${x0 + L.w - 40} ${L.top + 70} L ${x0 + L.w - 46} ${bottom - 30} L ${x0 + 46} ${bottom - 30} Z`} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.8} />
      {/* столешница с наклоном к выступающей */}
      <path d={`M ${x0 - 8} ${L.top + 34} L ${x0 + L.w + 8} ${L.top + 34} L ${x0 + L.w - 4} ${L.top} L ${x0 + 4} ${L.top} Z`} fill={C.woodDark} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      {folder ? (
        <g>
          <path d={`M ${x0 + 22} ${L.top + 2} L ${L.x - 2} ${L.top + 6} L ${L.x - 6} ${L.top - 16} L ${x0 + 30} ${L.top - 20} Z`} fill={C.folderInside} stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
          <path d={`M ${L.x + 2} ${L.top + 6} L ${x0 + L.w - 22} ${L.top + 2} L ${x0 + L.w - 30} ${L.top - 20} L ${L.x + 6} ${L.top - 16} Z`} fill="#FFFDF5" stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
          <path d={`M ${x0 + 18} ${L.top + 6} L ${x0 + L.w - 18} ${L.top + 6}`} stroke={C.folder} strokeWidth={ink * 2} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};
export const Lectern: React.FC<{ readonly ink: number; readonly folder?: boolean }> = (p) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <LecternG {...p} />
  </svg>
);

// Зрители со спины (передний план): головы и плечи двумя рядами.
const HAIR = ["#2B2420", "#3B2E28", "#1F1B1A", "#5A4636", "#2E2A2E", "#4A3A30"];
const CLOTH = ["#6E7F96", "#9C8670", "#7E8C77", "#B07F6A", "#5C6880", "#8E7C9A", "#A3A9B0"];
export const AudienceG: React.FC<{ readonly ink: number; readonly y: number; readonly s?: number; readonly t?: number }> = ({ ink, y, s = 1, t = 0 }) => {
  const rows = [
    { y: y, n: 6, r: 52, dx: 0 },
    { y: y + 180, n: 5, r: 66, dx: 90 },
  ];
  return (
    <g>
      {rows.map((row, ri) => {
        const step = 1260 / row.n;
        return Array.from({ length: row.n }, (_, i) => {
          const j = ri * 7 + i;
          const cx = -90 + row.dx + i * step + ((j * 37) % 23) - 11;
          const r = row.r * s * (0.94 + ((j * 13) % 9) / 60);
          const cy = row.y + ((j * 29) % 17) - 8;
          const sway = Math.sin((t + j * 11) / 40) * 2.5;
          return (
            <g key={j} transform={`translate(${sway} 0)`}>
              {/* плечи */}
              <path d={`M ${cx - r * 1.9} ${cy + r * 3.2} Q ${cx - r * 1.8} ${cy + r * 1.05} ${cx} ${cy + r * 1.0} Q ${cx + r * 1.8} ${cy + r * 1.05} ${cx + r * 1.9} ${cy + r * 3.2} Z`} fill={CLOTH[j % CLOTH.length]} stroke={C.ink} strokeWidth={ink} />
              {/* шея и голова (затылок) */}
              <rect x={cx - r * 0.36} y={cy + r * 0.5} width={r * 0.72} height={r * 0.6} fill="#D9A983" stroke={C.ink} strokeWidth={ink * 0.8} />
              <ellipse cx={cx} cy={cy} rx={r * 0.86} ry={r} fill={HAIR[j % HAIR.length]} stroke={C.ink} strokeWidth={ink} />
              {j % 4 === 1 ? <circle cx={cx + r * 0.1} cy={cy - r * 0.92} r={r * 0.34} fill={HAIR[j % HAIR.length]} stroke={C.ink} strokeWidth={ink * 0.8} /> : null}
            </g>
          );
        });
      })}
    </g>
  );
};
export const Audience: React.FC<{ readonly ink: number; readonly y: number; readonly s?: number; readonly t?: number }> = (p) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <AudienceG {...p} />
  </svg>
);

// Фото зала (для видеозвонка в S11): тот же зал из зрительного ряда, без
// людей на сцене. Рисуется в прямоугольник (x, y, w, h) с обрезкой;
// hallPt переводит точку зала в точку фото.
export const HALL_PHOTO_VIEW = { x: 40, y: 330, w: 1000, h: 1380 } as const;
export const hallPt = (box: { readonly x: number; readonly y: number; readonly w: number; readonly h: number }, hx: number, hy: number) => {
  const V = HALL_PHOTO_VIEW;
  const k = Math.max(box.w / V.w, box.h / V.h);
  return { x: box.x + box.w / 2 + (hx - (V.x + V.w / 2)) * k, y: box.y + box.h / 2 + (hy - (V.y + V.h / 2)) * k };
};
export const HallPicture: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly ink: number }> = ({ x, y, w, h, ink }) => {
  const V = HALL_PHOTO_VIEW;
  return (
    <svg x={x} y={y} width={w} height={h} viewBox={`${V.x} ${V.y} ${V.w} ${V.h}`} preserveAspectRatio="xMidYMid slice" overflow="hidden">
      <rect x={-500} y={-500} width={2080} height={HALL.stageTop + 500} fill={HALL.wall} />
      <HallG ink={ink} />
      <LecternG ink={ink} />
      <AudienceG ink={ink} y={1520} s={0.8} />
    </svg>
  );
};

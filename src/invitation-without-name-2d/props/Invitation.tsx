// Приглашение «КЕСИПТЕР КҮНҮ» — один и тот же лист во всех кадрах: тёплый
// белый лист с помятыми краями и небольшой складкой в верхнем правом углу,
// строки по порядку (день, время, кабинет), внизу — строка гостя. До сцены
// 9 строка пустая; затем на ней карандашом написано «Азамат» — те же
// векторные штрихи, что рисует рука (NAME_STROKES), без смены почерка.
// InvitationArt: (0, 0) — центр листа, ширина w, высота w · INVITE_RATIO.
// Координаты внутри листа — единицы u = w / 100 (лист 100 × 132).
import { getLength, getPointAtLength } from "@remotion/paths";
import { IW2_TEXT } from "../script";
import { C, F } from "../theme";

export const INVITE_RATIO = 1.32;

// Помятый контур (единицы листа): небольшие неровности по краям, верхний
// правый угол загнут (складка — отдельный треугольник).
const EDGE: readonly (readonly [number, number])[] = [
  [0.4, 0.6], [22, 0.0], [47, 0.9], [70, 0.2], [88, 0.5],
  [99.6, 12.2], [99.1, 34], [100, 58], [99.3, 83], [99.8, 108], [99.2, 131.4],
  [76, 132], [51, 131.2], [27, 132], [0.6, 131.5],
  [0.0, 106], [0.9, 80], [0.2, 54], [0.8, 29],
];
const FOLD = "M 88 0.5 L 99.6 12.2 L 90.6 10.4 Z";
// Следы смятия: тонкие светлые линии (лист неделю лежал в рюкзаке).
const CREASES = ["M 4 63 L 31 58 L 58 66 L 96 60", "M 38 3 L 42 40 L 36 88", "M 70 98 L 84 118 L 97 121"];

// Рукописное «Азамат» (почерк папы): штрихи в порядке письма, система
// 0…141 × 0…40 (база строки y = 40). На листе — масштаб NAME_SCALE от
// точки NAME_AT (единицы листа).
export const NAME_STROKES: readonly string[] = [
  "M 2 40 L 13 3 L 24 40", // А
  "M 7.5 26 L 19 26",
  "M 30 20 Q 37 13 43 18 Q 46 24 38 27 Q 47 30 44 36 Q 38 43 30 38", // з
  "M 63 21 Q 55 15 51 25 Q 48 37 55 39 Q 61 41 64 33", // а
  "M 64 18 L 64 36 Q 65 41 69 39",
  "M 74 40 L 76.5 18 L 85 35 L 93.5 18 L 96 40", // м
  "M 114 21 Q 106 15 102 25 Q 99 37 106 39 Q 112 41 115 33", // а
  "M 115 18 L 115 36 Q 116 41 120 39",
  "M 124 18.5 L 141 18", // т
  "M 132.5 18 L 132.5 40",
];
export const NAME_AT = { x: 24, y: 111 } as const;
export const NAME_SCALE = 0.42;
const LENS = NAME_STROKES.map((d) => getLength(d));
// Переходы между штрихами (карандаш поднят) — доля длины пути.
const LIFT = 14;
export const NAME_TOTAL = LENS.reduce((a, b) => a + b, 0) + LIFT * (NAME_STROKES.length - 1);

// Точка кончика карандаша (единицы листа) при прогрессе письма p (0…1) и
// признак касания бумаги.
export const nameTip = (p: number): { x: number; y: number; down: boolean } => {
  let d = Math.max(0, Math.min(1, p)) * NAME_TOTAL;
  const toSheet = (q: { x: number; y: number } | null) => {
    const pt = q ?? { x: 0, y: 40 };
    return { x: NAME_AT.x + pt.x * NAME_SCALE, y: NAME_AT.y - 40 * NAME_SCALE + pt.y * NAME_SCALE };
  };
  for (let i = 0; i < NAME_STROKES.length; i++) {
    if (d <= LENS[i]) return { ...toSheet(getPointAtLength(NAME_STROKES[i], d)), down: true };
    d -= LENS[i];
    if (i < NAME_STROKES.length - 1) {
      if (d <= LIFT) {
        const a = toSheet(getPointAtLength(NAME_STROKES[i], LENS[i]));
        const b = toSheet(getPointAtLength(NAME_STROKES[i + 1], 0));
        const u = d / LIFT;
        return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * 2.2, down: false };
      }
      d -= LIFT;
    }
  }
  const last = NAME_STROKES.length - 1;
  return { ...toSheet(getPointAtLength(NAME_STROKES[last], LENS[last])), down: false };
};

// Видимая часть каждого штриха при прогрессе p.
const strokeShown = (p: number) => {
  let d = Math.max(0, Math.min(1, p)) * NAME_TOTAL;
  return LENS.map((len, i) => {
    const shown = Math.max(0, Math.min(len, d));
    d -= len + (i < LENS.length - 1 ? LIFT : 0);
    return shown;
  });
};

export const NameStrokes: React.FC<{ readonly p: number; readonly u: number }> = ({ p, u }) => {
  if (p <= 0) return null;
  const shown = strokeShown(p);
  return (
    <g transform={`translate(${NAME_AT.x * u} ${(NAME_AT.y - 40 * NAME_SCALE) * u}) scale(${NAME_SCALE * u})`}>
      {NAME_STROKES.map((d, i) =>
        shown[i] > 0 ? (
          <path key={i} d={d} fill="none" stroke={C.pencil} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${shown[i]} ${LENS[i] + 1}`} />
        ) : null,
      )}
    </g>
  );
};

// reveal — сколько строк уже показано (0…5): заголовок, день, время,
// кабинет, строка гостя (дробная часть — проявление строки).
export const InvitationArt: React.FC<{
  readonly w: number;
  readonly name?: number; // 0 — строка пустая; 1 — «Азамат» написано
  readonly reveal?: number;
  readonly detail?: boolean;
  readonly shadow?: boolean;
}> = ({ w, name = 0, reveal = 5, detail = true, shadow = true }) => {
  const u = w / 100;
  const h = w * INVITE_RATIO;
  const pts = EDGE.map(([x, y]) => `${x * u},${y * u}`).join(" ");
  const row = (k: number) => Math.max(0, Math.min(1, reveal - k));
  const t = IW2_TEXT.invitation;
  const lines = [t.day, t.time, t.room];
  return (
    <g transform={`translate(${-w / 2} ${-h / 2})`}>
      {shadow ? <polygon points={pts} fill="rgba(23,23,23,0.13)" transform={`translate(${u * 1.1} ${u * 1.5})`} /> : null}
      <polygon points={pts} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={Math.max(0.8, u * 0.35)} strokeLinejoin="round" />
      {CREASES.map((d, i) => (
        <path key={i} d={d} transform={`scale(${u})`} fill="none" stroke="#E6E0D2" strokeWidth={0.5} />
      ))}
      <path d={FOLD} transform={`scale(${u})`} fill="#ECE6D7" stroke={C.sheetEdge} strokeWidth={0.35} strokeLinejoin="round" />
      {detail ? (
        <>
          <g opacity={row(0)}>
            <text x={50 * u} y={19 * u} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={9.6 * u} fill={C.ink} letterSpacing={0.2 * u}>
              {t.title}
            </text>
            <path d={`M ${22 * u} ${24 * u} Q ${36 * u} ${26.5 * u} ${50 * u} ${24.6 * u} T ${78 * u} ${25 * u}`} stroke={C.coral} strokeWidth={1.3 * u} fill="none" strokeLinecap="round" />
          </g>
          {lines.map((txt, i) => (
            <text key={txt} x={10 * u} y={(44 + i * 15) * u} fontFamily={F.text} fontWeight={800} fontSize={7.6 * u} fill={C.navy} opacity={row(1 + i)}>
              {txt}
            </text>
          ))}
          <g opacity={row(4)}>
            <text x={10 * u} y={92 * u} fontFamily={F.text} fontWeight={800} fontSize={7.6 * u} fill={C.navy}>
              {t.guest}
            </text>
            <line x1={10 * u} y1={113 * u} x2={90 * u} y2={113 * u} stroke={C.navy} strokeWidth={0.7 * u} strokeLinecap="round" />
          </g>
          <NameStrokes p={name} u={u} />
        </>
      ) : (
        <>
          <rect x={20 * u} y={14 * u} width={60 * u} height={6 * u} fill={C.ink} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={10 * u} y={(39 + i * 15) * u} width={[34, 46, 38][i] * u} height={4 * u} fill={C.navy} opacity={0.75} />
          ))}
          <rect x={10 * u} y={87 * u} width={50 * u} height={4 * u} fill={C.navy} opacity={0.75} />
          <rect x={10 * u} y={112.6 * u} width={80 * u} height={0.9 * u} fill={C.navy} />
          {name > 0.5 ? <rect x={26 * u} y={103 * u} width={30 * u} height={3.4 * u} rx={1.5 * u} fill={C.pencil} opacity={0.8} /> : null}
        </>
      )}
    </g>
  );
};

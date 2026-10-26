// Школьная анкета «Ата-энемдин кесиби» — один и тот же лист во всех
// сценах (крючок, проверка мамой, новая строка, последнее предложение).
// Рукописные ответы — ровным детским печатным почерком (Nunito: точно
// есть ү, ө, ң), карандашом; запись проявляется слева направо, а кончик
// карандаша (formTip) идёт по той же точке, где появляется штрих.
// Единицы листа: 720 × 1000.
import { C, fontFamily } from "../kit";
import { clamp, easeInOut } from "../rig/motion";
import { DD_TEXT } from "../script";

export const FORM = { w: 720, h: 1000 } as const;

const F = DD_TEXT.form;
const HAND = 44; // кегль «почерка»
const VALUE_X = 72; // начало ответа в строке
// подпись строки — над ответом; ответы пишутся на линованных строках
const ROWS = { momLabel: 300, mom: 366, dadLabel: 456, dad: 522, dadNew: 598, extraLabel: 688, s1: 754, s2: 830, s3: 906 } as const;

// Ширина рукописной строки (единицы листа): ≈ 0,55 кегля на знак.
const handWidth = (text: string, size = HAND) => text.length * size * 0.53;

type Written = { readonly text: string; readonly x: number; readonly y: number; readonly size?: number };
export const FORM_LINES = {
  mom: { text: F.momValue, x: VALUE_X, y: ROWS.mom },
  dad: { text: F.dadValue, x: VALUE_X, y: ROWS.dad },
  dadNew: { text: F.dadNew, x: VALUE_X, y: ROWS.dadNew },
  // «Атам машинаны жакшы айдайт. Татаал нерселерди да түшүнүктүү айтып берет.»
  s1: { text: F.extra[0], x: VALUE_X, y: ROWS.s1, size: 40 },
  s2: { text: F.extraWrap[0], x: VALUE_X, y: ROWS.s2, size: 40 },
  s3: { text: F.extraWrap[1], x: VALUE_X, y: ROWS.s3, size: 40 },
} as const satisfies Record<string, Written>;
export type FormLineId = keyof typeof FORM_LINES;

// Точка кончика карандаша (единицы листа) при записи строки id с
// прогрессом p: идёт по краю проявления, чуть «прыгает» по буквам.
export const formTip = (id: FormLineId, p: number) => {
  const l = FORM_LINES[id];
  const size = "size" in l ? l.size : HAND;
  const w = handWidth(l.text, size);
  const u = clamp(p);
  const letters = l.text.length;
  const wob = Math.sin(u * letters * Math.PI * 1.15) * size * 0.16;
  return { x: l.x + w * u, y: l.y - size * 0.18 + wob };
};

export type FormState = {
  readonly mom?: number; // 0…1 — записано
  readonly dad?: number;
  readonly dadHl?: number; // жёлтый маркер на «айдоочу»
  readonly dadNew?: number;
  readonly dadNewHl?: number; // бирюзовый акцент на «инженер»
  readonly s1?: number;
  readonly s2?: number;
  readonly s3?: number;
  readonly momPoint?: number; // мама показывает пальцем строку (подсветка строки)
  readonly fade?: number; // приглушить жёлтый (когда появляется бирюзовый)
};

const HandLine: React.FC<{ readonly id: FormLineId; readonly p: number }> = ({ id, p }) => {
  const l = FORM_LINES[id];
  const size = "size" in l ? l.size : HAND;
  const w = handWidth(l.text, size);
  if (p <= 0) return null;
  const cid = `form-clip-${id}`;
  return (
    <g>
      <clipPath id={cid}>
        <rect x={l.x - 10} y={l.y - size * 1.2} width={10 + w * clamp(p) + 2} height={size * 1.8} />
      </clipPath>
      <text
        x={l.x}
        y={l.y}
        textLength={w}
        lengthAdjust="spacingAndGlyphs"
        fontFamily={fontFamily}
        fontWeight={700}
        fontSize={size}
        fill={C.pencil}
        clipPath={`url(#${cid})`}
        transform={`rotate(-0.8 ${l.x} ${l.y})`}
      >
        {l.text}
      </text>
    </g>
  );
};

// Маркер-выделение (под текстом), наливается слева направо.
const Marker: React.FC<{ readonly id: FormLineId; readonly p: number; readonly color: string }> = ({ id, p, color }) => {
  const l = FORM_LINES[id];
  const size = "size" in l ? l.size : HAND;
  const w = handWidth(l.text, size);
  const u = easeInOut(p);
  if (u <= 0) return null;
  return <rect x={l.x - 12} y={l.y - size * 0.82} width={(w + 24) * u} height={size * 1.08} rx={12} fill={color} opacity={0.85} />;
};

export const Form: React.FC<{ readonly s: FormState; readonly width?: number; readonly shadow?: boolean }> = ({ s, width = FORM.w, shadow = true }) => {
  const k = width / FORM.w;
  return (
    <svg width={width} height={FORM.h * k} viewBox={`0 0 ${FORM.w} ${FORM.h}`} style={{ overflow: "visible", display: "block" }}>
      {shadow ? <rect x={14} y={18} width={FORM.w} height={FORM.h} rx={14} fill="rgba(60,40,20,0.22)" /> : null}
      <rect x={0} y={0} width={FORM.w} height={FORM.h} rx={14} fill={C.paper} />
      {/* шапка */}
      <rect x={0} y={0} width={FORM.w} height={150} rx={14} fill="#EAF2F6" />
      <rect x={0} y={136} width={FORM.w} height={14} fill="#EAF2F6" />
      <text x={56} y={98} fontFamily={fontFamily} fontWeight={900} fontSize={64} fill={C.deep} letterSpacing={2}>
        {F.title}
      </text>
      <rect x={520} y={52} width={150} height={58} rx={29} fill={C.tealDeep} />
      <text x={595} y={92} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={32} fill="#FFFFFF">
        {F.klass}
      </text>
      <text x={56} y={226} fontFamily={fontFamily} fontWeight={800} fontSize={38} fill={C.inkSoft}>
        {F.heading}
      </text>
      <rect x={56} y={244} width={300} height={6} rx={3} fill={C.yellow} />
      {/* строки */}
      {[ROWS.mom, ROWS.dad, ROWS.dadNew, ROWS.s1, ROWS.s2, ROWS.s3].map((y) => (
        <line key={y} x1={56} y1={y + 12} x2={FORM.w - 56} y2={y + 12} stroke="#B9C9D6" strokeWidth={2.5} />
      ))}
      <text x={56} y={ROWS.momLabel} fontFamily={fontFamily} fontWeight={800} fontSize={32} fill={C.inkSoft}>
        {F.momLabel}
      </text>
      <text x={56} y={ROWS.dadLabel} fontFamily={fontFamily} fontWeight={800} fontSize={32} fill={C.inkSoft}>
        {F.dadLabel}
      </text>
      <text x={56} y={ROWS.extraLabel} fontFamily={fontFamily} fontWeight={800} fontSize={32} fill={C.inkSoft}>
        {F.extraLabel}
      </text>
      {/* подсветка строки, на которую показывает мама */}
      {s.momPoint ? <rect x={VALUE_X - 22} y={ROWS.dadNew - 54} width={FORM.w - VALUE_X - 34} height={74} rx={14} fill={C.cyan} opacity={0.18 * s.momPoint} /> : null}
      <Marker id="dad" p={s.dadHl ?? 0} color={`rgba(255,211,78,${1 - 0.55 * (s.fade ?? 0)})`} />
      <Marker id="dadNew" p={s.dadNewHl ?? 0} color="rgba(115,220,232,0.75)" />
      <HandLine id="mom" p={s.mom ?? 1} />
      <HandLine id="dad" p={s.dad ?? 0} />
      <HandLine id="dadNew" p={s.dadNew ?? 0} />
      <HandLine id="s1" p={s.s1 ?? 0} />
      <HandLine id="s2" p={s.s2 ?? 0} />
      <HandLine id="s3" p={s.s3 ?? 0} />
      {/* детский рисунок рядом со строкой папы: домик и машинка */}
      <g transform="translate(560 438)" opacity={0.75}>
        <path d="M -60 20 L -60 -20 L -35 -45 L -10 -20 L -10 20 Z" fill="none" stroke={C.pencil} strokeWidth={3} strokeLinejoin="round" />
        <rect x={10} y={-2} width={70} height={22} rx={8} fill="none" stroke={C.pencil} strokeWidth={3} />
        <path d="M 22 -2 L 30 -18 L 60 -18 L 68 -2" fill="none" stroke={C.pencil} strokeWidth={3} />
        <circle cx={26} cy={24} r={7} fill="none" stroke={C.pencil} strokeWidth={3} />
        <circle cx={64} cy={24} r={7} fill="none" stroke={C.pencil} strokeWidth={3} />
      </g>
    </svg>
  );
};

// Карандаш (крупный план) — кончик в точке (0, 0), наклон angle (градусы).
export const Pencil: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly len?: number }> = ({ x, y, angle = -32, len = 300 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d={`M 0 0 L ${-len * 0.035} ${-len * 0.09} L ${len * 0.035} ${-len * 0.09} Z`} fill="#3B3F4C" />
    <path d={`M ${-len * 0.035} ${-len * 0.09} L ${-len * 0.06} ${-len * 0.17} L ${len * 0.06} ${-len * 0.17} L ${len * 0.035} ${-len * 0.09} Z`} fill="#E9C9A0" />
    <rect x={-len * 0.06} y={-len * 0.92} width={len * 0.12} height={len * 0.75} fill={C.yellow} />
    <rect x={-len * 0.06} y={-len * 0.92} width={len * 0.04} height={len * 0.75} fill="#FFE38A" />
    <rect x={len * 0.02} y={-len * 0.92} width={len * 0.04} height={len * 0.75} fill={C.yellowDeep} />
    <rect x={-len * 0.062} y={-len * 1.0} width={len * 0.124} height={len * 0.09} fill="#B9C2CC" />
    <rect x={-len * 0.06} y={-len * 1.08} width={len * 0.12} height={len * 0.09} rx={len * 0.03} fill="#E58A8A" />
  </g>
);

// Тот же лист, лежащий на домашнем столе (средний план): вид сверху под
// углом — CSS-перспектива; (x, y) — центр листа на столешнице, w — ширина.
export const FormOnTable: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly s: FormState; readonly rot?: number; readonly tilt?: number }> = ({ x, y, w, s, rot = -4, tilt = 62 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - (w * FORM.h) / FORM.w / 2, width: w, perspective: 900, pointerEvents: "none" }}>
    <div style={{ transform: `rotateX(${tilt}deg) rotateZ(${rot}deg)`, transformOrigin: "50% 50%" }}>
      <Form s={s} width={w} />
    </div>
  </div>
);

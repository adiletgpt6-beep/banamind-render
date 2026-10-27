// Детские рисунки. Один и тот же SVG во всех планах: в руках дочери, в
// веб-камере, в окне у клиента — узор, положение мальчика и цвет карандаша
// не меняются. Лист всегда лицевой стороной к зрителю/камере (текст не
// зеркалится).
//   ClassDrawing — вывеска класса: крупное «3 Б», мальчик с карандашом
//                  размером с него самого, звёздочки.
//   SignDrawing  — новый лист: «АЙКЫН», простой узор и подпись
//                  «Дизайнер — 3 Б»; строки проявляются под кончиком
//                  карандаша (signPencilTip).
// Координаты листа: 600 × 430 (единицы листа).
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { clamp } from "../rig/motion";

export const SHEET = { w: 600, h: 430 } as const;
const CRAYON_BLUE = "#2D4C8F";
const PENCIL = C.amber;

const Paper: React.FC<{ readonly id: string }> = ({ id }) => (
  <g>
    <rect x={4} y={6} width={SHEET.w} height={SHEET.h} rx={6} fill="rgba(24,38,56,0.18)" />
    <rect x={0} y={0} width={SHEET.w} height={SHEET.h} rx={6} fill="#FFFDF7" stroke="#D9D2C3" strokeWidth={2} />
    <clipPath id={`${id}-paper`}>
      <rect x={0} y={0} width={SHEET.w} height={SHEET.h} rx={6} />
    </clipPath>
  </g>
);

const Star: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly rot?: number }> = ({ x, y, r, rot = 0 }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + (rot * Math.PI) / 180;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={C.yellow} stroke="#D9A91F" strokeWidth={3} strokeLinejoin="round" />;
};

// Мальчик с огромным карандашом (детский рисунок): карандаш выше мальчика.
const PencilBoy: React.FC = () => (
  <g transform="translate(420 70)">
    {/* огромный янтарный карандаш: от макушки мальчика вверх и до земли */}
    <g transform="rotate(8 70 160)">
      <rect x={52} y={-30} width={42} height={300} rx={6} fill={PENCIL} stroke={C.amberDeep} strokeWidth={4} />
      <line x1={66} y1={-26} x2={66} y2={266} stroke="#F4B57A" strokeWidth={4} />
      <rect x={52} y={-48} width={42} height={22} rx={6} fill="#F08FA4" stroke="#C86E82" strokeWidth={4} />
      <rect x={52} y={-30} width={42} height={10} fill="#BFC3C9" />
      <path d="M 52 270 L 73 318 L 94 270 Z" fill="#F2D7B0" stroke={C.amberDeep} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 66 302 L 73 318 L 80 302 Z" fill={C.navy} />
    </g>
    {/* мальчик: голова, туловище, руки обнимают карандаш, ноги */}
    <circle cx={10} cy={130} r={34} fill="#F3C9A3" stroke="#8C5E3C" strokeWidth={4} />
    <path d="M -22 118 Q 10 84 42 118" fill="#3A2A22" stroke="#3A2A22" strokeWidth={4} />
    <circle cx={0} cy={132} r={4} fill={C.navy} />
    <circle cx={22} cy={132} r={4} fill={C.navy} />
    <path d="M -2 148 Q 11 158 24 148" stroke="#B5524A" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M -20 166 L 40 166 L 46 262 L -26 262 Z" fill={C.green} stroke="#4E6656" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 36 184 Q 62 196 70 210" stroke="#F3C9A3" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M -16 186 Q -30 214 -20 236" stroke="#F3C9A3" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M -10 262 L -14 318 M 30 262 L 34 318" stroke={C.navy} strokeWidth={14} strokeLinecap="round" />
  </g>
);

export const ClassDrawing: React.FC<{ readonly id: string }> = ({ id }) => (
  <g>
    <Paper id={id} />
    <g clipPath={`url(#${id}-paper)`}>
      {/* рамка вывески, нарисованная от руки */}
      <path d="M 26 30 Q 200 18 380 28 Q 386 150 378 262 Q 200 272 30 264 Q 22 150 26 30 Z" fill="#F4EFE3" stroke={CRAYON_BLUE} strokeWidth={8} strokeLinejoin="round" />
      <text x={200} y={222} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={190} fill={CRAYON_BLUE} letterSpacing={-4}>
        {T3B_TEXT.drawingClass}
      </text>
      <Star x={70} y={330} r={26} rot={8} />
      <Star x={170} y={372} r={18} rot={-12} />
      <Star x={270} y={334} r={22} rot={20} />
      <path d="M 40 404 Q 110 384 180 404 T 330 404" stroke={C.green} strokeWidth={7} fill="none" strokeLinecap="round" />
      <PencilBoy />
    </g>
  </g>
);

// Вывеска для маминого кабинета. title — 0…1: стадии букв «АЙКЫН» (контур
// карандашом → заливка); deco — 0…1 узор; credit — 0…1 доля подписи,
// проявленной слева направо (под кончиком карандаша).
export const CREDIT = { x: 300, y: 386, len: 268, size: 40 } as const;
export const TITLE = { x: 300, y: 214, len: 470, size: 150 } as const;

export const SignDrawing: React.FC<{ readonly id: string; readonly title: number; readonly deco: number; readonly credit: number; readonly titleFill: number }> = ({ id, title, deco, credit, titleFill }) => {
  const cw = CREDIT.len * clamp(credit);
  const tw = (TITLE.len + 40) * clamp(title);
  return (
    <g>
      <Paper id={id} />
      <g clipPath={`url(#${id}-paper)`}>
        <clipPath id={`${id}-title`}>
          <rect x={TITLE.x - TITLE.len / 2 - 20} y={0} width={tw} height={SHEET.h} />
        </clipPath>
        <clipPath id={`${id}-credit`}>
          <rect x={CREDIT.x - CREDIT.len / 2 + 30} y={CREDIT.y - 60} width={cw} height={90} />
        </clipPath>
        {/* узор: янтарная волна и солнце-круг над названием */}
        <g opacity={clamp(deco * 3)}>
          <path d="M 70 280 Q 150 250 230 280 T 390 280 T 530 280" stroke={PENCIL} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${600 * clamp(deco)} 600`} />
          <circle cx={530} cy={62} r={28} fill={C.yellow} stroke="#D9A91F" strokeWidth={4} opacity={clamp(deco * 2 - 0.6)} />
        </g>
        <g clipPath={`url(#${id}-title)`}>
          <text x={TITLE.x} y={TITLE.y} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={TITLE.size} textLength={TITLE.len} lengthAdjust="spacingAndGlyphs" fill={`rgba(45,76,143,${0.15 + 0.85 * clamp(titleFill)})`} stroke={CRAYON_BLUE} strokeWidth={5} strokeLinejoin="round">
            {T3B_TEXT.signTitle}
          </text>
        </g>
        <g clipPath={`url(#${id}-credit)`}>
          <text x={CREDIT.x + 30} y={CREDIT.y} textAnchor="middle" fontFamily={F.text} fontWeight={800} fontSize={CREDIT.size} textLength={CREDIT.len} lengthAdjust="spacingAndGlyphs" fill={C.amberDeep}>
            {T3B_TEXT.signCredit}
          </text>
        </g>
      </g>
    </g>
  );
};

// Кончик карандаша при подписи (единицы листа): у правого края проявленной
// части, с лёгким ходом вверх-вниз по буквам.
export const signPencilTip = (credit: number, frame: number) => {
  const x = CREDIT.x - CREDIT.len / 2 + 30 + CREDIT.len * clamp(credit);
  const y = CREDIT.y - 14 + Math.sin(frame * 1.3) * 9;
  return { x, y };
};
export const titlePencilTip = (title: number, frame: number) => {
  const x = TITLE.x - TITLE.len / 2 - 20 + (TITLE.len + 40) * clamp(title);
  const y = TITLE.y - 60 + Math.sin(frame * 0.9) * 50;
  return { x, y };
};

// Карандаш в руке крупным планом: тот же янтарный карандаш. (x, y) —
// кончик грифеля, angle — наклон (градусы, 0 — грифель вниз).
export const Pencil: React.FC<{ readonly x: number; readonly y: number; readonly angle: number; readonly len?: number }> = ({ x, y, angle, len = 260 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M 0 0 L -11 -30 L 11 -30 Z" fill="#F2D7B0" stroke={C.amberDeep} strokeWidth={2} />
    <path d="M 0 0 L -4 -11 L 4 -11 Z" fill={C.navy} />
    <rect x={-11} y={-30 - len} width={22} height={len} fill={PENCIL} stroke={C.amberDeep} strokeWidth={2} />
    <rect x={-11} y={-30 - len} width={22} height={14} fill="#BFC3C9" />
    <rect x={-11} y={-48 - len} width={22} height={20} rx={5} fill="#F08FA4" />
  </g>
);

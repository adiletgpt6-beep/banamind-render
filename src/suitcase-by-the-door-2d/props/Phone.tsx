// Телефон крупным планом и его экраны (S09; корпус — и для видеозвонка S11).
//
//  • PhoneFrame — корпус телефона (вид спереди): тёмный чехол, тонкая рамка,
//    кнопки сбоку, «островок» камеры. Экран — children в СВОИХ единицах:
//    (0, 0) — левый верхний угол экрана, ширина SCREEN.w = 360, высота
//    SCREEN.h = 740 (как css-px телефона). Масштаб и обрезка по скруглённому
//    экрану — внутри. Высота корпуса выводится из ширины (phoneGeom).
//    Толщину контура для содержимого экрана считай в единицах экрана:
//    inkScreen = ink / phoneGeom(w).s.
//  • phonePt — мировая точка для точки экрана (куда ставить палец).
//  • PhoneGrip — левая кисть держит телефон снизу: ладонь за корпусом,
//    большой палец на левой рамке, кончики пальцев обхватывают правый край.
//    Рисуется в два слоя: part="back" до корпуса, part="front" после.
//  • BalaGoScreen — мини-страница BalaGo в стиле фильма (иллюстрация, не
//    реальный интерфейс): шапка «BalaGo», картинка, слоган, город, маршрут;
//    ниже (после прокрутки) — форма «Алдын ала өтүнмө» с полями «Дарек»,
//    «Мектеп», «Убакыт», кнопка «Өтүнмө калтыруу» и спокойное сообщение
//    после отправки. Части экспортируются и по отдельности.
import { C } from "../theme";
import { FONT, roughRect } from "../kit";
import { clamp, easeOut, lerp, type Vec } from "../rig/motion";
import { SD2_TEXT } from "../script";
import type { Skin } from "./CloseHand";

export const SCREEN = { w: 360, h: 740 } as const;

// Заголовок формы (кыргызча): «предварительная заявка».
export const FORM_TITLE = "Алдын ала өтүнмө";

export const PHONE_CASE = "#2E3446";

// Размеры корпуса по ширине: рамка, масштаб экрана s, высота h.
export const phoneGeom = (w: number) => {
  const bezel = w * 0.045;
  const s = (w - bezel * 2) / SCREEN.w;
  const top = bezel * 1.25; // рамка сверху/снизу чуть толще
  const h = SCREEN.h * s + top * 2;
  return { w, h, bezel, top, s };
};

export type PhonePlace = { readonly x: number; readonly y: number; readonly w: number; readonly rot?: number };

// Точка экрана (единицы экрана) → мир. x, y — центр корпуса.
export const phonePt = (p: PhonePlace, sx: number, sy: number): Vec => {
  const g = phoneGeom(p.w);
  const lx = -p.w / 2 + g.bezel + sx * g.s;
  const ly = -g.h / 2 + g.top + sy * g.s;
  const r = ((p.rot ?? 0) * Math.PI) / 180;
  return { x: p.x + lx * Math.cos(r) - ly * Math.sin(r), y: p.y + lx * Math.sin(r) + ly * Math.cos(r) };
};

export const PhoneFrame: React.FC<
  PhonePlace & {
    readonly ink: number;
    readonly uid: string;
    readonly caseColor?: string;
    readonly screenColor?: string;
    readonly glare?: number; // 0…1 мягкий блик на стекле
    readonly children?: React.ReactNode;
  }
> = ({ x, y, w, rot = 0, ink, uid, caseColor = PHONE_CASE, screenColor = C.paper, glare = 1, children }) => {
  const g = phoneGeom(w);
  const R = w * 0.13;
  const sw = SCREEN.w * g.s;
  const sh = SCREEN.h * g.s;
  const clip = `${uid}-screen`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* мягкая тень под телефоном */}
      <rect x={-w / 2 + 14} y={-g.h / 2 + 22} width={w} height={g.h} rx={R} fill="rgba(36,50,74,0.22)" />
      {/* кнопки на торцах */}
      <rect x={w / 2 - 4} y={-g.h * 0.26} width={12} height={g.h * 0.12} rx={5} fill={caseColor} stroke={C.ink} strokeWidth={ink * 0.8} />
      <rect x={-w / 2 - 8} y={-g.h * 0.3} width={12} height={g.h * 0.07} rx={5} fill={caseColor} stroke={C.ink} strokeWidth={ink * 0.8} />
      <rect x={-w / 2 - 8} y={-g.h * 0.2} width={12} height={g.h * 0.07} rx={5} fill={caseColor} stroke={C.ink} strokeWidth={ink * 0.8} />
      {/* корпус */}
      <path d={roughRect(-w / 2, -g.h / 2, w, g.h, R, 91, ink * 0.4)} fill={caseColor} stroke={C.ink} strokeWidth={ink} />
      <path d={roughRect(-w / 2 + g.bezel * 0.35, -g.h / 2 + g.bezel * 0.35, w - g.bezel * 0.7, g.h - g.bezel * 0.7, R * 0.9, 92, 0)} fill="none" stroke="#4A5470" strokeWidth={ink * 0.8} />
      {/* экран */}
      <g transform={`translate(${-w / 2 + g.bezel} ${-g.h / 2 + g.top}) scale(${g.s})`}>
        <clipPath id={clip}>
          <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} rx={28} />
        </clipPath>
        <g clipPath={`url(#${clip})`}>
          <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} fill={screenColor} />
          {children}
          {/* блик на стекле */}
          {glare > 0 ? <path d={`M ${SCREEN.w * 0.62} 0 L ${SCREEN.w} 0 L ${SCREEN.w} ${SCREEN.h * 0.22} Z`} fill="#FFFFFF" opacity={0.1 * glare} /> : null}
        </g>
        {/* островок камеры */}
        <rect x={SCREEN.w / 2 - 34} y={10} width={68} height={18} rx={9} fill="#1C2233" />
        <circle cx={SCREEN.w / 2 + 20} cy={19} r={4} fill="#3A4766" />
      </g>
      <rect x={-w / 2 + g.bezel} y={-g.h / 2 + g.top} width={sw} height={sh} rx={28 * g.s} fill="none" stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.6} />
    </g>
  );
};

// Левая кисть держит телефон (вид спереди). Те же x, y, w, rot, что у
// PhoneFrame. part: "back" — рукав и ладонь за корпусом (рисовать ДО
// PhoneFrame), "front" — большой палец и кончики пальцев (ПОСЛЕ).
export const PhoneGrip: React.FC<PhonePlace & { readonly look: Skin; readonly ink: number; readonly part: "back" | "front" }> = ({ x, y, w, rot = 0, look, ink, part }) => {
  const g = phoneGeom(w);
  const L = -w / 2;
  const Rt = w / 2;
  const B = g.h / 2;
  const st = { stroke: C.ink, strokeWidth: ink, strokeLinejoin: "round" as const };
  const fw = w * 0.13; // толщина пальца
  if (part === "back") {
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {/* рукав уходит вниз-влево за край кадра */}
        <path d={`M ${L - w * 0.62} ${B + w * 1.1} L ${L - w * 0.05} ${B - w * 0.1} L ${L + w * 0.42} ${B + w * 0.08} L ${L - w * 0.05} ${B + w * 1.3} Z`} fill={look.sleeve} {...st} />
        {look.cuff ? <path d={`M ${L - w * 0.12} ${B + w * 0.06} L ${L + w * 0.04} ${B - w * 0.16} L ${L + w * 0.46} ${B + w * 0.02} L ${L + w * 0.36} ${B + w * 0.22} Z`} fill={look.cuff} {...st} /> : null}
        {/* ладонь за корпусом: видна снизу и слева */}
        <path d={`M ${L - w * 0.06} ${B - w * 0.42} Q ${L - w * 0.12} ${B - w * 0.06} ${L + w * 0.08} ${B + w * 0.1} L ${L + w * 0.62} ${B + w * 0.08} Q ${L + w * 0.74} ${B - w * 0.08} ${L + w * 0.6} ${B - w * 0.3} Z`} fill={look.skin} {...st} />
        {/* пальцы идут за корпусом к правому краю (видны справа) */}
        {[0.52, 0.4, 0.29].map((k, i) => (
          <rect key={k} x={Rt - fw * 0.9} y={B - g.h * k - fw * 0.5} width={fw * 1.6 - i * fw * 0.12} height={fw} rx={fw * 0.5} fill={look.skin} {...st} />
        ))}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* кончики пальцев обхватывают правую рамку */}
      {[0.52, 0.4, 0.29].map((k) => (
        <rect key={k} x={Rt - fw * 0.62} y={B - g.h * k - fw * 0.46} width={fw * 0.78} height={fw * 0.92} rx={fw * 0.42} fill={look.skin} {...st} />
      ))}
      {/* большой палец на левой рамке */}
      <g transform={`rotate(-24 ${L} ${B - g.h * 0.2})`}>
        <rect x={L - fw * 0.55} y={B - g.h * 0.2 - fw * 2.3} width={fw * 1.05} height={fw * 2.6} rx={fw * 0.52} fill={look.skin} {...st} />
        <rect x={L - fw * 0.28} y={B - g.h * 0.2 - fw * 2.2} width={fw * 0.55} height={fw * 0.6} rx={fw * 0.25} fill="#FFFFFF" opacity={0.35} />
      </g>
    </g>
  );
};

// ---------- экраны (единицы экрана 360 × 740) ----------
const P = SD2_TEXT.page;
export const SCROLL_MAX = 430; // прокрутка от страницы к форме
const FORM_Y = 500; // начало формы в ленте страницы
const HEADER_H = 64;

const t = (x: number, y: number, size: number, weight: number, fill: string, text: string, anchor: "start" | "middle" = "start") => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={fill} textAnchor={anchor}>
    {text}
  </text>
);

// Иконки (центр x, y; размер s).
export const PinIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M 0 ${s * 0.55} C ${-s * 0.5} ${0} ${-s * 0.42} ${-s * 0.5} 0 ${-s * 0.5} C ${s * 0.42} ${-s * 0.5} ${s * 0.5} 0 0 ${s * 0.55} Z`} fill={C.yellow} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <circle cx={0} cy={-s * 0.14} r={s * 0.14} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.7} />
  </g>
);
export const HouseIcon: React.FC<{ x: number; y: number; s: number; ink: number; fill?: string }> = ({ x, y, s, ink, fill = "#F1D9B5" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-s * 0.42} ${-s * 0.02} L 0 ${-s * 0.42} L ${s * 0.42} ${-s * 0.02}`} fill="#C98B6B" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <rect x={-s * 0.32} y={-s * 0.06} width={s * 0.64} height={s * 0.46} fill={fill} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <rect x={-s * 0.08} y={s * 0.14} width={s * 0.16} height={s * 0.26} fill="#8C6A4E" stroke={C.ink} strokeWidth={ink * 0.6} />
  </g>
);
export const SchoolIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M 0 ${-s * 0.58} L 0 ${-s * 0.36}`} stroke={C.ink} strokeWidth={ink * 0.8} />
    <path d={`M 0 ${-s * 0.58} L ${s * 0.18} ${-s * 0.52} L 0 ${-s * 0.46} Z`} fill={C.yellow} stroke={C.ink} strokeWidth={ink * 0.5} />
    <path d={`M ${-s * 0.5} ${-s * 0.1} L 0 ${-s * 0.36} L ${s * 0.5} ${-s * 0.1} Z`} fill="#7FA3B5" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <rect x={-s * 0.44} y={-s * 0.1} width={s * 0.88} height={s * 0.5} fill="#E6EEF2" stroke={C.ink} strokeWidth={ink} />
    {[-0.28, 0.28].map((k) => (
      <rect key={k} x={s * k - s * 0.08} y={s * 0.02} width={s * 0.16} height={s * 0.13} fill="#B7CFDC" stroke={C.ink} strokeWidth={ink * 0.5} />
    ))}
    <rect x={-s * 0.09} y={s * 0.14} width={s * 0.18} height={s * 0.26} fill="#8C6A4E" stroke={C.ink} strokeWidth={ink * 0.6} />
  </g>
);
export const ClockIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={s * 0.42} fill={C.paper} stroke={C.ink} strokeWidth={ink} />
    <path d={`M 0 ${-s * 0.26} L 0 0 L ${s * 0.18} ${s * 0.1}`} fill="none" stroke={C.ink} strokeWidth={ink} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
// Две реплики-облачка: «обсудим».
export const TalkIcon: React.FC<{ x: number; y: number; s: number; ink: number }> = ({ x, y, s, ink }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-s * 0.5} ${-s * 0.42} L ${s * 0.12} ${-s * 0.42} Q ${s * 0.22} ${-s * 0.42} ${s * 0.22} ${-s * 0.32} L ${s * 0.22} ${-s * 0.04} Q ${s * 0.22} ${s * 0.06} ${s * 0.12} ${s * 0.06} L ${-s * 0.24} ${s * 0.06} L ${-s * 0.4} ${s * 0.2} L ${-s * 0.38} ${s * 0.06} L ${-s * 0.5} ${s * 0.06} Q ${-s * 0.6} ${s * 0.06} ${-s * 0.6} ${-s * 0.04} L ${-s * 0.6} ${-s * 0.32} Q ${-s * 0.6} ${-s * 0.42} ${-s * 0.5} ${-s * 0.42} Z`} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    <path d={`M ${-s * 0.02} ${s * 0.1} L ${s * 0.5} ${s * 0.1} Q ${s * 0.6} ${s * 0.1} ${s * 0.6} ${s * 0.2} L ${s * 0.6} ${s * 0.44} Q ${s * 0.6} ${s * 0.54} ${s * 0.5} ${s * 0.54} L ${s * 0.44} ${s * 0.54} L ${s * 0.46} ${s * 0.66} L ${s * 0.3} ${s * 0.54} L ${-s * 0.02} ${s * 0.54} Q ${-s * 0.12} ${s * 0.54} ${-s * 0.12} ${s * 0.44} L ${-s * 0.12} ${s * 0.2} Q ${-s * 0.12} ${s * 0.1} ${-s * 0.02} ${s * 0.1} Z`} fill="#DCE6EE" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
    {[-0.42, -0.2, 0.02].map((k) => (
      <circle key={k} cx={s * k} cy={-s * 0.18} r={s * 0.04} fill={C.ink} />
    ))}
  </g>
);

// Шапка страницы: «BalaGo» на жёлтой плашке и меню.
export const PageHeader: React.FC<{ readonly ink: number }> = ({ ink }) => (
  <g>
    <rect x={0} y={0} width={SCREEN.w} height={HEADER_H} fill={C.paper} />
    <rect x={18} y={30} width={124} height={30} rx={15} fill={C.yellow} stroke={C.ink} strokeWidth={ink} />
    {t(80, 53, 23, 900, C.ink, SD2_TEXT.brand, "middle")}
    {[0, 1, 2].map((k) => (
      <rect key={k} x={312} y={36 + k * 8} width={28} height={3.5} rx={1.75} fill={C.ink} />
    ))}
    <path d={`M 0 ${HEADER_H} L ${SCREEN.w} ${HEADER_H}`} stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.35} />
  </g>
);

// Картинка страницы: горы, холмы, дорога и маленькая жёлтая машина.
const Hero: React.FC<{ x: number; y: number; w: number; h: number; ink: number }> = ({ x, y, w, h, ink }) => (
  <g>
    <path d={roughRect(x, y, w, h, 22, 93, 1)} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink} />
    <circle cx={x + w * 0.8} cy={y + h * 0.26} r={h * 0.1} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.7} />
    <path d={`M ${x + 4} ${y + h * 0.66} L ${x + w * 0.2} ${y + h * 0.34} L ${x + w * 0.34} ${y + h * 0.5} L ${x + w * 0.52} ${y + h * 0.24} L ${x + w * 0.72} ${y + h * 0.52} L ${x + w - 4} ${y + h * 0.4} L ${x + w - 4} ${y + h * 0.8} L ${x + 4} ${y + h * 0.8} Z`} fill={C.mountain} stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
    <path d={`M ${x + w * 0.46} ${y + h * 0.33} L ${x + w * 0.52} ${y + h * 0.24} L ${x + w * 0.58} ${y + h * 0.33}`} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.6} strokeLinejoin="round" />
    <path d={`M ${x + 4} ${y + h * 0.72} Q ${x + w * 0.3} ${y + h * 0.58} ${x + w * 0.6} ${y + h * 0.7} Q ${x + w * 0.8} ${y + h * 0.76} ${x + w - 4} ${y + h * 0.66} L ${x + w - 4} ${y + h - 4} L ${x + 4} ${y + h - 4} Z`} fill={C.tree} stroke={C.ink} strokeWidth={ink * 0.7} />
    {/* дорога */}
    <path d={`M ${x + 4} ${y + h * 0.9} Q ${x + w * 0.5} ${y + h * 0.78} ${x + w - 4} ${y + h * 0.86}`} fill="none" stroke={C.road} strokeWidth={h * 0.12} />
    <path d={`M ${x + 4} ${y + h * 0.9} Q ${x + w * 0.5} ${y + h * 0.78} ${x + w - 4} ${y + h * 0.86}`} fill="none" stroke={C.paper} strokeWidth={ink * 0.9} strokeDasharray={`${ink * 4} ${ink * 4}`} />
    {/* машина */}
    <g transform={`translate(${x + w * 0.42} ${y + h * 0.8})`}>
      <path d={`M -34 -4 L -30 -18 Q -26 -24 -18 -24 L -10 -36 Q -6 -40 2 -40 L 16 -40 Q 22 -40 26 -34 L 32 -24 Q 40 -22 40 -14 L 40 -4 Z`} fill={C.yellow} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M -6 -24 L 0 -34 L 12 -34 L 12 -24 Z M 16 -24 L 16 -34 Q 21 -34 24 -28 L 26 -24 Z`} fill={C.glass} stroke={C.ink} strokeWidth={ink * 0.6} strokeLinejoin="round" />
      <circle cx={-18} cy={-3} r={7} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
      <circle cx={26} cy={-3} r={7} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
    </g>
  </g>
);

// Мини-страница BalaGo (лента от y0). appear — кадры с начала показа
// (элементы проявляются по очереди), route 0…1 — линия маршрута.
export const BalaGoPage: React.FC<{ readonly ink: number; readonly y0?: number; readonly appear?: number; readonly route?: number }> = ({ ink, y0 = 0, appear = 100, route = 1 }) => {
  const a = (k: number) => easeOut(clamp((appear - k * 4) / 8));
  const up = (k: number) => (1 - a(k)) * 14;
  const icons = [66, 180, 294];
  return (
    <g transform={`translate(0 ${y0})`}>
      <g opacity={a(0)} transform={`translate(0 ${up(0)})`}>
        <Hero x={18} y={80} w={324} h={172} ink={ink} />
      </g>
      <g opacity={a(1)} transform={`translate(0 ${up(1)})`}>
        {t(22, 298, 29, 900, C.ink, P.tagline)}
      </g>
      <g opacity={a(2)} transform={`translate(0 ${up(2)})`}>
        <PinIcon x={34} y={331} s={24} ink={ink * 0.8} />
        {t(54, 340, 23, 800, C.inkSoft, P.city)}
      </g>
      <g opacity={a(3)} transform={`translate(0 ${up(3)})`}>
        <path d={roughRect(18, 360, 324, 118, 18, 95, 0.8)} fill={C.paper} stroke={C.ink} strokeWidth={ink} />
        {/* пунктир маршрута между иконками */}
        {[0, 1].map((k) => {
          const p = clamp(route * 2 - k);
          const xa = icons[k] + 28;
          const xb = icons[k + 1] - 28;
          return p > 0 ? (
            <g key={k}>
              <path d={`M ${xa} 402 L ${lerp(xa, xb, p)} 402`} stroke={C.yellowDeep} strokeWidth={ink * 1.6} strokeDasharray={`${ink * 2.4} ${ink * 2.2}`} strokeLinecap="round" />
              {p > 0.95 ? <path d={`M ${xb - 8} 395 L ${xb} 402 L ${xb - 8} 409`} fill="none" stroke={C.yellowDeep} strokeWidth={ink * 1.4} strokeLinecap="round" strokeLinejoin="round" /> : null}
            </g>
          ) : null;
        })}
        <HouseIcon x={icons[0]} y={404} s={44} ink={ink * 0.8} />
        <SchoolIcon x={icons[1]} y={406} s={46} ink={ink * 0.8} />
        <HouseIcon x={icons[2]} y={404} s={44} ink={ink * 0.8} />
        {t(180, 462, 23, 900, C.ink, P.route, "middle")}
      </g>
    </g>
  );
};

// Форма заявки (лента от y0). fill[i] 0…1 — значение поля напечатано;
// press 0…1 — кнопка нажата.
export const RequestForm: React.FC<{ readonly ink: number; readonly y0?: number; readonly fill?: readonly number[]; readonly press?: number }> = ({ ink, y0 = 0, fill = [1, 1, 1], press = 0 }) => {
  const icons = [PinIcon, SchoolIcon, ClockIcon];
  return (
    <g transform={`translate(0 ${y0})`}>
      {t(22, 44, 26, 900, C.ink, FORM_TITLE)}
      <rect x={22} y={56} width={64} height={5} rx={2.5} fill={C.yellow} />
      {P.fields.map((fl, i) => {
        const by = 100 + i * 108;
        const k = clamp(fill[i] ?? 0);
        const n = Math.round(fl.value.length * k);
        const Icon = icons[i];
        const typing = k > 0 && k < 1;
        return (
          <g key={fl.label}>
            {t(26, by - 10, 19, 800, C.inkSoft, fl.label)}
            <path d={roughRect(18, by, 324, 62, 14, 96 + i, 0.6)} fill={k > 0 ? "#FFFDF5" : C.paper} stroke={C.ink} strokeWidth={ink} />
            <Icon x={46} y={by + 31} s={30} ink={ink * 0.75} />
            {n > 0 ? t(74, by + 39, 22, 800, C.ink, fl.value.slice(0, n)) : null}
            {typing ? <rect x={76 + n * 11.6} y={by + 18} width={2.5} height={26} fill={C.ink} /> : null}
          </g>
        );
      })}
      {/* кнопка */}
      <g transform={`translate(0 ${press * 2})`}>
        {press < 0.5 ? <rect x={34} y={440 + 6} width={292} height={64} rx={32} fill="rgba(36,50,74,0.18)" /> : null}
        <path d={roughRect(30, 436, 300, 64, 32, 99, 0.6)} fill={press > 0.01 ? C.yellowDeep : C.yellow} stroke={C.ink} strokeWidth={ink * 1.1} />
        {t(180, 477, 24, 900, C.ink, P.button, "middle")}
      </g>
    </g>
  );
};

// Спокойное сообщение после отправки: «Маршрут жана убакыт талкууланат».
// k 0…1 — появление. Только это сообщение: без статусов и подтверждений.
export const SentNote: React.FC<{ readonly ink: number; readonly k: number; readonly y?: number }> = ({ ink, k, y = 210 }) => {
  if (k <= 0) return null;
  const e = easeOut(k);
  const [l1, ...rest] = P.sent.split(" ");
  // перенос: «Маршрут жана убакыт» / «талкууланат»
  const words = [l1, ...rest];
  const line1 = words.slice(0, 3).join(" ");
  const line2 = words.slice(3).join(" ");
  return (
    <g opacity={e} transform={`translate(0 ${(1 - e) * 18})`}>
      <path d={roughRect(26, y, 308, 232, 24, 101, 0.8)} fill={C.paper} stroke={C.ink} strokeWidth={ink * 1.1} />
      <rect x={26} y={y} width={308} height={10} rx={5} fill={C.yellow} opacity={0.9} />
      <TalkIcon x={180} y={y + 72} s={78} ink={ink * 0.9} />
      {t(180, y + 158, 25, 900, C.ink, line1, "middle")}
      {t(180, y + 194, 25, 900, C.ink, line2, "middle")}
    </g>
  );
};

// Экран целиком: шапка, лента (страница → форма) с прокруткой scroll
// (0…1 от SCROLL_MAX), затемнение формы и сообщение после отправки.
export const BalaGoScreen: React.FC<{
  readonly ink: number;
  readonly appear?: number;
  readonly route?: number;
  readonly scroll?: number;
  readonly fill?: readonly number[];
  readonly press?: number;
  readonly sent?: number;
}> = ({ ink, appear = 100, route = 1, scroll = 0, fill = [0, 0, 0], press = 0, sent = 0 }) => {
  const off = -scroll * SCROLL_MAX;
  const dim = clamp(sent * 1.4);
  return (
    <g>
      <g transform={`translate(0 ${off})`}>
        <BalaGoPage ink={ink} appear={appear} route={route} />
        <RequestForm ink={ink} y0={FORM_Y} fill={fill} press={press} />
      </g>
      {dim > 0 ? <rect x={0} y={HEADER_H} width={SCREEN.w} height={SCREEN.h - HEADER_H} fill={C.bg} opacity={0.78 * dim} /> : null}
      <PageHeader ink={ink} />
      <SentNote ink={ink} k={sent} />
    </g>
  );
};

// Где кнопка «Өтүнмө калтыруу» на экране при полной прокрутке (центр,
// единицы экрана) — для точного касания пальцем.
export const BUTTON_AT = { x: 180, y: FORM_Y - SCROLL_MAX + 468 } as const;

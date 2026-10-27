// Рисованный реквизит BalaGoBG039: двусторонний бумажный билет одного
// полного сапара, штампы, плашка «Шарттуу мисал», папки, печать нового
// билета компенсации, конверт пакета, мелкие иконки.
//
// Билет — вертикальный лист с перфорацией посередине: верх «ҮЙ → МЕКТЕП»
// (утро), низ «МЕКТЕП → ҮЙ» (после уроков). Цвет каждой половины задаётся
// отдельно (0 — серый, 1 — полный цвет): при сбое половина блекнет, затем
// блекнет весь билет — сапар один целый. Обратная сторона (flip) — схема
// «1 толук сапар = эки бөлүк».
import { fontFamily } from "../../fonts";
import { box } from "./context";
import { BG39_TEXT } from "./script";

export const NAVY = "#14285A";
export const NAVY_SOFT = "#3A4F80";
export const YELLOW = "#FFC90E";
export const YELLOW_SOFT = "#FFF4C2";
export const PAPER = "#FFFDF6";
export const INK_RED = "#C8473B";
export const GREEN = "#2E9E5B";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- Иконки ----------
export const SunIcon: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = "#F2A900" }) => (
  <svg width={56 * s} height={56 * s} viewBox="-28 -28 56 56">
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-3} y={-26} width={6} height={10} rx={3} fill={color} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={12} fill={color} />
  </svg>
);

// Школьная сумка/книга — «после уроков».
export const BookIcon: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = NAVY_SOFT }) => (
  <svg width={56 * s} height={56 * s} viewBox="0 0 56 56">
    <path d="M 6 12 Q 18 6 28 12 Q 38 6 50 12 L 50 46 Q 38 40 28 46 Q 18 40 6 46 Z" fill={color} />
    <path d="M 28 12 L 28 46" stroke="#FFFFFF" strokeWidth={3} />
  </svg>
);

export const HouseIcon: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = NAVY }) => (
  <svg width={60 * s} height={56 * s} viewBox="0 0 60 56">
    <path d="M 6 26 L 30 6 L 54 26" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={12} y={24} width={36} height={28} rx={3} fill={color} />
    <rect x={25} y={34} width={10} height={18} rx={2} fill="#FFFFFF" />
  </svg>
);

export const SchoolIcon: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = NAVY }) => (
  <svg width={64 * s} height={56 * s} viewBox="0 0 64 56">
    <rect x={6} y={20} width={52} height={32} rx={3} fill={color} />
    <path d="M 18 20 L 32 8 L 46 20 Z" fill={color} />
    <rect x={30} y={0} width={3} height={10} fill={color} />
    <path d="M 33 1 L 42 4 L 33 7 Z" fill="#E2433A" />
    {[12, 22, 38, 48].map((x) => (
      <rect key={x} x={x - 3} y={27} width={7} height={8} rx={1} fill="#FFFFFF" />
    ))}
    <rect x={28} y={38} width={8} height={14} rx={1} fill="#FFFFFF" />
  </svg>
);

// Маленькая белая машина BalaGo (вид сбоку) с жёлтой полосой.
export const MiniCar: React.FC<{ s?: number; dir?: 1 | -1 }> = ({ s = 1, dir = 1 }) => (
  <svg width={110 * s} height={56 * s} viewBox="0 0 110 56" style={{ transform: `scaleX(${dir})` }}>
    <path d="M 8 38 L 10 26 Q 14 20 24 19 L 38 8 Q 44 4 56 4 L 72 4 Q 82 4 88 12 L 96 20 Q 104 22 104 30 L 104 38 Z" fill="#FFFFFF" stroke="#C9D3E3" strokeWidth={2.5} />
    <path d="M 40 10 L 54 9 L 54 20 L 30 20 Z" fill="#BFD9F0" />
    <path d="M 60 9 L 72 9 Q 80 10 84 18 L 60 20 Z" fill="#BFD9F0" />
    <rect x={10} y={27} width={94} height={5} fill={YELLOW} />
    <circle cx={30} cy={40} r={10} fill="#2B2F38" />
    <circle cx={30} cy={40} r={4} fill="#C9CED6" />
    <circle cx={84} cy={40} r={10} fill="#2B2F38" />
    <circle cx={84} cy={40} r={4} fill="#C9CED6" />
  </svg>
);

export const CheckMark: React.FC<{ s?: number; color?: string; draw?: number }> = ({ s = 1, color = GREEN, draw = 1 }) => (
  <svg width={48 * s} height={48 * s} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={22} fill={color} opacity={0.14 + 0.86 * clamp(draw * 2)} />
    <path d="M 13 25 L 21 33 L 36 16" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - clamp(draw))} />
  </svg>
);

// ---------- Штамп ----------
// Чернильный штамп: падает с увеличением и «впечатывается» (p 0…1).
export const Stamp: React.FC<{
  readonly p: number;
  readonly text: string;
  readonly color?: string;
  readonly rot?: number;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ p, text, color = INK_RED, rot = -8, size = 40, style }) => {
  if (p <= 0) return null;
  const k = clamp(p / 0.55);
  const scale = 1.9 - 0.9 * (1 - Math.pow(1 - k, 3)) + (p > 0.55 && p < 0.75 ? -0.04 * Math.sin(((p - 0.55) / 0.2) * Math.PI) : 0);
  return (
    <div
      style={{
        ...style,
        opacity: clamp(k * 1.6) * 0.92,
        transform: `rotate(${rot}deg) scale(${scale})`,
        padding: `${size * 0.3}px ${size * 0.6}px`,
        border: `${Math.max(4, size * 0.14)}px solid ${color}`,
        borderRadius: size * 0.35,
        color,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 1,
        lineHeight: 1.05,
        textAlign: "center",
        whiteSpace: "nowrap",
        mixBlendMode: "multiply",
        boxShadow: `inset 0 0 0 ${size * 0.06}px rgba(255,255,255,0.35)`,
      }}
    >
      {text}
    </div>
  );
};

// ---------- «Шарттуу мисал» ----------
export const ExampleBadge: React.FC<{ readonly opacity?: number; readonly top?: number; readonly left?: number }> = ({ opacity = 1, top = 262, left = 90 }) =>
  opacity <= 0.01 ? null : (
    <div
      style={box({
        left,
        top,
        opacity,
        padding: "12px 26px 13px",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.94)",
        border: `4px solid ${NAVY_SOFT}`,
        color: NAVY,
        fontFamily,
        fontSize: 34,
        fontWeight: 900,
        letterSpacing: 0.5,
        boxShadow: "0 8px 22px rgba(20,40,90,0.14)",
      })}
    >
      {BG39_TEXT.example}
    </div>
  );

// ---------- Билет ----------
export const TICKET_W = 560;
export const TICKET_H = 880;
const HALF = TICKET_H / 2;

export type TicketState = {
  readonly topColor?: number; // 0 — серый … 1 — цвет
  readonly bottomColor?: number;
  readonly whole?: number; // 0…1 — весь билет блекнет (поверх половин)
  readonly done?: number; // 0…1 — отметка «Аткарылды» на верхней половине
  readonly failed?: number; // 0…1 — штамп «Кызмат аткарган жок» на нижней
  readonly service?: number; // 0…1 — большой штамп «КЫЗМАТТЫН СЕБЕБИ»
  readonly flip?: number; // 0…1 — переворот (0 — лицо, 1 — оборот)
  readonly split?: number; // 0…1 — половины расходятся
  readonly glowTop?: number; // 0…1 — жёлтая подсветка верхней половины
  readonly glowBottom?: number;
  readonly join?: number; // 0…1 — подсветка перфорации «бир толук сапар»
  readonly car?: number; // 0…1 — машинка едет по маршруту половины (верх → низ)
  readonly fold?: number; // 0…1 — верхняя половина складывается по перфорации на нижнюю («закрыть билет»)
};

const HalfFace: React.FC<{
  readonly part: "top" | "bottom";
  readonly color: number;
  readonly glow: number;
  readonly mark: number;
  readonly failed: number;
  readonly car: number;
}> = ({ part, color, glow, mark, failed, car }) => {
  const t = BG39_TEXT.ticket;
  const top = part === "top";
  const gray = 1 - clamp(color);
  return (
    <div style={box({ left: 0, top: top ? 0 : HALF, width: TICKET_W, height: HALF, overflow: "hidden" })}>
      <div style={box({ inset: 0, filter: `grayscale(${gray}) contrast(${1 - 0.25 * gray}) brightness(${1 + 0.06 * gray})`, opacity: 1 - 0.35 * gray })}>
        {/* полоса части */}
        <div
          style={box({
            left: 0,
            top: top ? 64 : 34,
            width: TICKET_W,
            height: 78,
            backgroundColor: top ? YELLOW : "#BFD9F0",
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingLeft: 34,
            boxSizing: "border-box",
          })}
        >
          {top ? <SunIcon s={0.9} color="#E08A00" /> : <BookIcon s={0.9} />}
          <span style={{ fontFamily, fontSize: 40, fontWeight: 900, color: NAVY }}>{top ? t.morning : t.afternoon}</span>
        </div>
        {/* маршрут */}
        <div style={box({ left: 0, top: top ? 170 : 140, width: TICKET_W, textAlign: "center", fontFamily, fontSize: 62, fontWeight: 900, color: NAVY, letterSpacing: 1 })}>
          {top ? t.morningRoute : t.afternoonRoute}
        </div>
        {/* иконки: дом — школа и машинка между ними */}
        <div style={box({ left: 50, top: top ? 268 : 238, width: TICKET_W - 100, height: 80 })}>
          <div style={box({ left: 0, top: 6 })}>{top ? <HouseIcon /> : <SchoolIcon />}</div>
          <div style={box({ right: 0, top: 6 })}>{top ? <SchoolIcon /> : <HouseIcon />}</div>
          <div style={box({ left: 78, right: 82, top: 40, height: 0, borderTop: `5px dashed ${NAVY_SOFT}`, opacity: 0.5 })} />
          <div style={box({ left: 70 + (TICKET_W - 100 - 70 - 82 - 100) * clamp(car), top: 4 })}>
            <MiniCar s={0.9} />
          </div>
        </div>
        {/* подсветка */}
        {glow > 0.01 ? <div style={box({ inset: 8, borderRadius: 18, boxShadow: `0 0 0 ${8 * glow}px rgba(255,201,14,${0.85 * glow}) inset` })} /> : null}
      </div>
      {/* отметка «Аткарылды» */}
      {top && mark > 0.01 ? (
        <div style={box({ right: 36, top: 362, display: "flex", alignItems: "center", gap: 10, opacity: clamp(mark * 2), fontFamily, fontSize: 34, fontWeight: 900, color: GREEN })}>
          <CheckMark s={0.9} draw={mark} />
          {t.done}
        </div>
      ) : null}
      {/* штамп «Кызмат аткарган жок» */}
      {!top && failed > 0.01 ? (
        <div style={box({ left: 0, width: TICKET_W, top: 318, display: "flex", justifyContent: "center" })}>
          <Stamp p={failed} text={t.failed} size={38} rot={-6} />
        </div>
      ) : null}
    </div>
  );
};

// Оборот билета: «1 толук сапар = эки бөлүк».
const BackFace: React.FC = () => (
  <div style={box({ inset: 0, backgroundColor: PAPER, borderRadius: 30, overflow: "hidden" })}>
    <div style={box({ left: 0, top: 0, width: TICKET_W, height: 120, backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 52, fontWeight: 900, color: "#FFFFFF" })}>
      {BG39_TEXT.ticket.brand}
    </div>
    <div style={box({ left: 30, right: 30, top: 170, textAlign: "center", fontFamily, fontSize: 66, fontWeight: 900, color: NAVY, lineHeight: 1.08 })}>{BG39_TEXT.ticket.kind}</div>
    <div style={box({ left: 0, right: 0, top: 270, textAlign: "center", fontFamily, fontSize: 96, fontWeight: 900, color: NAVY })}>=</div>
    {[0, 1].map((i) => (
      <div
        key={i}
        style={box({
          left: 60,
          right: 60,
          top: 410 + i * 170,
          height: 140,
          borderRadius: 24,
          backgroundColor: i ? "#BFD9F0" : YELLOW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          color: NAVY,
        })}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>{i ? BG39_TEXT.ticket.afternoon : BG39_TEXT.ticket.morning}</div>
        <div style={{ fontSize: 46, fontWeight: 900 }}>{i ? BG39_TEXT.ticket.afternoonRoute : BG39_TEXT.ticket.morningRoute}</div>
      </div>
    ))}
    <div style={box({ left: 0, right: 0, top: 772, textAlign: "center", fontFamily, fontSize: 34, fontWeight: 800, color: NAVY_SOFT })}>{BG39_TEXT.father.equation}</div>
  </div>
);

// Перфорация: пунктир и вырезы по краям.
const Perforation: React.FC<{ readonly join: number; readonly bg: string }> = ({ join, bg }) => (
  <>
    <div style={box({ left: 34, right: 34, top: HALF - 3, height: 0, borderTop: `6px dashed ${join > 0.01 ? `rgba(242,169,0,${0.45 + 0.55 * join})` : "#C9CFDA"}` })} />
    <div style={box({ left: -26, top: HALF - 26, width: 52, height: 52, borderRadius: 26, backgroundColor: bg })} />
    <div style={box({ right: -26, top: HALF - 26, width: 52, height: 52, borderRadius: 26, backgroundColor: bg })} />
  </>
);

// Билет. (x, y) — центр билета в координатах родителя, s — масштаб,
// rot — наклон (°). bg — цвет фона под вырезами перфорации.
export const Ticket: React.FC<TicketState & { readonly x: number; readonly y: number; readonly s?: number; readonly rot?: number; readonly bg?: string; readonly shadow?: number }> = (p) => {
  const {
    x,
    y,
    s = 1,
    rot = 0,
    bg = "#FBF3E2",
    shadow = 1,
    topColor = 1,
    bottomColor = 1,
    whole = 0,
    done = 0,
    failed = 0,
    service = 0,
    flip = 0,
    split = 0,
    glowTop = 0,
    glowBottom = 0,
    join = 0,
    car = 0,
    fold = 0,
  } = p;
  const angle = 180 * clamp(flip);
  const showBack = angle > 90;
  const gap = 60 * clamp(split);
  const t = BG39_TEXT.ticket;
  const wholeGray = clamp(whole);
  const face = (
    <div style={box({ left: 0, top: 0, width: TICKET_W, height: TICKET_H })}>
      {/* верхняя половина (при fold складывается вниз по перфорации) */}
      <div
        style={box({
          left: 0,
          top: -gap / 2,
          width: TICKET_W,
          height: HALF,
          transformOrigin: "50% 100%",
          transform: fold > 0 ? `perspective(1800px) rotateX(${-180 * clamp(fold)}deg)` : undefined,
          transformStyle: "preserve-3d",
          zIndex: 2,
        })}
      >
        <div style={box({ inset: 0, borderRadius: "30px 30px 0 0", overflow: "hidden", backgroundColor: PAPER, boxShadow: shadow ? "0 18px 40px rgba(20,40,90,0.16)" : undefined, backfaceVisibility: "hidden" })}>
          <div style={box({ left: 0, top: 0, width: TICKET_W, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", fontFamily, color: NAVY })}>
            <span style={{ fontSize: 34, fontWeight: 900 }}>{t.brand}</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: NAVY_SOFT }}>{t.kind}</span>
          </div>
          <HalfFace part="top" color={topColor * (1 - wholeGray)} glow={glowTop} mark={done} failed={0} car={clamp(car * 2)} />
          {wholeGray > 0.01 ? <div style={box({ inset: 0, backgroundColor: `rgba(236,238,242,${0.38 * wholeGray})` })} /> : null}
        </div>
        {/* изнанка верхней половины — видна, когда билет сложен */}
        {fold > 0 ? (
          <div style={box({ inset: 0, borderRadius: "0 0 30px 30px", backgroundColor: "#F4F1E8", transform: "rotateX(180deg)", backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 64, fontWeight: 900, color: "#C9CFDA" })}>
            {t.brand}
          </div>
        ) : null}
      </div>
      {/* нижняя половина */}
      <div style={box({ left: 0, top: HALF + gap / 2, width: TICKET_W, height: HALF, borderRadius: "0 0 30px 30px", overflow: "hidden", backgroundColor: PAPER, boxShadow: shadow ? "0 18px 40px rgba(20,40,90,0.16)" : undefined })}>
        <div style={box({ left: 0, top: -HALF, width: TICKET_W, height: TICKET_H })}>
          <HalfFace part="bottom" color={bottomColor * (1 - wholeGray)} glow={glowBottom} mark={0} failed={failed} car={clamp(car * 2 - 1)} />
        </div>
      </div>
      {split < 0.5 ? <Perforation join={join} bg={bg} /> : null}
      {/* общий серый налёт на нижней половине — сапар целиком не выполнен */}
      {wholeGray > 0.01 ? <div style={box({ left: 0, top: HALF + gap / 2, width: TICKET_W, height: HALF, borderRadius: "0 0 30px 30px", backgroundColor: `rgba(236,238,242,${0.38 * wholeGray})` })} /> : null}
      {/* большой штамп «КЫЗМАТТЫН СЕБЕБИ» */}
      {service > 0.01 ? (
        <div style={box({ left: 0, width: TICKET_W, top: HALF + 150, display: "flex", justifyContent: "center", zIndex: 3 })}>
          <Stamp p={service} text={t.stamp} size={50} rot={-14} color={INK_RED} />
        </div>
      ) : null}
    </div>
  );
  return (
    <div style={box({ left: x - (TICKET_W * s) / 2, top: y - (TICKET_H * s) / 2, width: TICKET_W * s, height: TICKET_H * s, perspective: 2400 })}>
      <div
        style={box({
          left: 0,
          top: 0,
          width: TICKET_W,
          height: TICKET_H,
          transformOrigin: "0 0",
          transform: `scale(${s})`,
        })}
      >
        <div style={box({ left: 0, top: 0, width: TICKET_W, height: TICKET_H, transform: `rotate(${rot}deg) rotateY(${angle}deg)`, transformStyle: "preserve-3d" })}>
          <div style={box({ inset: 0, backfaceVisibility: "hidden" })}>{face}</div>
          <div style={box({ inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 18px 40px rgba(20,40,90,0.16)", borderRadius: 30, opacity: showBack ? 1 : 0 })}>
            <BackFace />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Билет компенсации «+1 сапар акысыз» ----------
export const BonusTicket: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rot?: number; readonly shine?: number }> = ({ x, y, s = 1, rot = 0, shine = 0 }) => (
  <div style={box({ left: x - 190 * s, top: y - 110 * s, width: 380 * s, height: 220 * s, rotate: `${rot}deg` })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 380,
        height: 220,
        transformOrigin: "0 0",
        scale: `${s}`,
        borderRadius: 26,
        background: `linear-gradient(135deg, #FFE27A, ${YELLOW} 55%, #FFB800)`,
        boxShadow: "0 16px 34px rgba(160,110,0,0.28)",
        overflow: "hidden",
        fontFamily,
        color: NAVY,
      })}
    >
      <div style={box({ left: 0, top: 18, width: 380, textAlign: "center", fontSize: 30, fontWeight: 900, opacity: 0.85 })}>{BG39_TEXT.ticket.brand}</div>
      <div style={box({ left: 0, top: 62, width: 380, textAlign: "center", fontSize: 66, fontWeight: 900, lineHeight: 1 })}>{BG39_TEXT.rule.printed.big}</div>
      <div style={box({ left: 0, top: 140, width: 380, textAlign: "center", fontSize: 38, fontWeight: 900 })}>{BG39_TEXT.rule.printed.small}</div>
      <div style={box({ left: -26, top: 84, width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.65)" })} />
      <div style={box({ right: -26, top: 84, width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.65)" })} />
      {shine > 0 ? (
        <div style={box({ left: -200 + 780 * shine, top: -60, width: 90, height: 340, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)", rotate: "20deg" })} />
      ) : null}
    </div>
  </div>
);

// ---------- Папка ----------
export const Folder: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly color: string;
  readonly tab: string;
  readonly open?: number; // 0…1 — клапан приоткрыт
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, color, tab, open = 0, children }) => (
  <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h })}>
    <div style={box({ left: 0, top: 0, width: w * 0.46, height: 70, borderRadius: "22px 22px 0 0", backgroundColor: color })} />
    <div style={box({ left: 0, top: 50, width: w, height: h - 50, borderRadius: 26, backgroundColor: color, filter: "brightness(0.93)" })} />
    {children}
    <div
      style={box({
        left: 0,
        top: 50 + 30 * open,
        width: w,
        height: h - 50 - 30 * open,
        borderRadius: 26,
        backgroundColor: color,
        boxShadow: "0 18px 36px rgba(20,40,90,0.16)",
        transformOrigin: "50% 100%",
        transform: `perspective(1400px) rotateX(${-28 * open}deg)`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 36,
        boxSizing: "border-box",
        fontFamily,
        fontWeight: 900,
        fontSize: 40,
        color: NAVY,
        textAlign: "center",
        lineHeight: 1.1,
      })}
    >
      <span style={{ padding: "0 24px" }}>{tab}</span>
    </div>
  </div>
);

// Термометр — день, когда ребёнок заболел.
export const ThermometerIcon: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={40 * s} height={110 * s} viewBox="0 0 40 110">
    <rect x={12} y={4} width={16} height={78} rx={8} fill="#FFFFFF" stroke={NAVY_SOFT} strokeWidth={4} />
    <rect x={17} y={40} width={6} height={50} rx={3} fill="#E2433A" />
    <circle cx={20} cy={90} r={15} fill="#E2433A" stroke={NAVY_SOFT} strokeWidth={4} />
  </svg>
);

// Конверт пакета сапаров (вид спереди) со стопкой билетов внутри.
export const PackEnvelope: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly label: string; readonly count: number; readonly bump?: number }> = ({ x, y, w = 420, label, count, bump = 0 }) => {
  const h = w * 0.66;
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, scale: `${1 + 0.06 * bump}` })}>
      {/* билеты торчат из конверта */}
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={box({
            left: w * 0.16 + i * 10,
            top: -h * 0.18 - i * 8,
            width: w * 0.62,
            height: h * 0.6,
            borderRadius: 16,
            backgroundColor: i === count - 1 && bump > 0 ? YELLOW : PAPER,
            border: `3px solid ${i === count - 1 && bump > 0 ? "#E0A800" : "#D9DEE8"}`,
            rotate: `${-4 + i * 3}deg`,
          })}
        />
      ))}
      <div style={box({ left: 0, top: h * 0.12, width: w, height: h * 0.88, borderRadius: 24, backgroundColor: "#E9EEF7", boxShadow: "0 16px 32px rgba(20,40,90,0.16)" })} />
      <svg width={w} height={h * 0.5} viewBox={`0 0 ${w} ${h * 0.5}`} style={box({ left: 0, top: h * 0.12 })}>
        <path d={`M 0 0 L ${w / 2} ${h * 0.34} L ${w} 0`} fill="none" stroke="#C9D3E3" strokeWidth={6} />
      </svg>
      <div style={box({ left: 0, top: h * 0.62, width: w, textAlign: "center", fontFamily, fontSize: 38, fontWeight: 900, color: NAVY })}>{label}</div>
    </div>
  );
};

// Светлый «бумажный» фон графических сцен: тёплый белый, мягкие круги.
export const PaperBg: React.FC<{ readonly f: number; readonly tint?: string }> = ({ f, tint = YELLOW_SOFT }) => (
  <div style={box({ inset: 0, backgroundColor: "#FFFCF5", overflow: "hidden" })}>
    <div style={box({ left: -320 + Math.sin(f / 90) * 20, top: -260, width: 900, height: 900, borderRadius: 450, backgroundColor: tint, opacity: 0.85 })} />
    <div style={box({ right: -300, bottom: -220 + Math.cos(f / 80) * 18, width: 820, height: 820, borderRadius: 410, backgroundColor: "#EAF3FC" })} />
    <div style={box({ inset: 0, backgroundImage: "radial-gradient(rgba(20,40,90,0.06) 2px, transparent 2px)", backgroundSize: "44px 44px" })} />
  </div>
);

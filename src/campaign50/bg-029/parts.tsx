// Общие элементы рисовки BG-029: стол у окна с видом на Бишкек, три
// «майда нерсе» (ремень с пряжкой, бутылка воды 0,5 л, карточка
// «Ким тосот?»), маленькая рука ребёнка, салон с обычным задним сиденьем
// (без детских кресел), дети, взрослый, белая машина, логотип, плашки.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { BG29_VIDEO } from "./script";

// Моргание: раз в ~3 с на 4 кадра, у каждого персонажа свой сдвиг.
export const blink = (f: number, shift = 0) => ((f + shift) % 96 < 4 ? 0.15 : 1);

// ---------- Вид на Бишкек: Ала-Тоо со снежными вершинами и дома ----------
export const Skyline: React.FC<{ readonly w?: number; readonly h?: number; readonly drift?: number; readonly warm?: boolean }> = ({ w = 1080, h = 420, drift = 0, warm }) => (
  <svg width={w} height={h} viewBox={`0 0 1080 420`} preserveAspectRatio="xMidYMax slice" style={{ display: "block" }}>
    <defs>
      <linearGradient id="bg29sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={warm ? "#FFE9B8" : C.skyDeep} />
        <stop offset="1" stopColor={warm ? "#FFF7E4" : "#F4F9FE"} />
      </linearGradient>
    </defs>
    <rect width={1080} height={420} fill="url(#bg29sky)" />
    <g transform={`translate(${-drift * 0.15} 0)`}>
      <path d="M -40 300 L 90 170 L 160 220 L 280 110 L 380 200 L 470 140 L 600 230 L 720 120 L 830 210 L 930 150 L 1120 290 L 1120 420 L -40 420 Z" fill={C.mountain} />
      <path d="M 250 140 L 280 110 L 312 140 L 296 150 L 280 138 L 264 152 Z M 690 150 L 720 120 L 752 150 L 735 158 L 720 146 L 704 160 Z M 450 160 L 470 140 L 492 162 L 470 156 Z M 905 172 L 930 150 L 956 172 L 930 166 Z" fill={C.snow} />
    </g>
    <g transform={`translate(${-drift * 0.35} 0)`}>
      {[
        [20, 250, 150],
        [190, 280, 120],
        [330, 230, 170],
        [520, 300, 110],
        [650, 260, 150],
        [820, 290, 130],
        [970, 240, 160],
      ].map(([x, y, bw]) => (
        <g key={x}>
          <rect x={x} y={y} width={bw} height={420 - y} fill={C.block} />
          {Array.from({ length: Math.floor((420 - y - 20) / 34) }, (_, r) =>
            Array.from({ length: Math.floor((bw - 16) / 30) }, (_, c) => (
              <rect key={`${r}-${c}`} x={x + 12 + c * 30} y={y + 16 + r * 34} width={16} height={18} rx={2} fill={C.blockWin} />
            )),
          )}
        </g>
      ))}
    </g>
  </svg>
);

// ---------- Стол у окна (сцены-«предметный театр») ----------
export const Table: React.FC<{ readonly drift?: number; readonly windowH?: number }> = ({ drift = 0, windowH = 560 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: C.table, overflow: "hidden" }}>
    {/* окно с видом на город */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: windowH, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Skyline drift={drift} h={windowH} />
      </div>
      {/* рама окна */}
      <div style={{ position: "absolute", left: 536, top: 0, width: 8, bottom: 0, backgroundColor: "#FFFFFF" }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 -26px 0 #FFFFFF" }} />
    </div>
    {/* столешница */}
    <div style={{ position: "absolute", left: 0, right: 0, top: windowH, height: 24, backgroundColor: C.tableEdge }} />
    <div
      style={{
        position: "absolute",
        left: -200,
        right: -200,
        top: windowH + 24,
        bottom: 0,
        background: `radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, ${C.table} 60%, #F3EEE2 100%)`,
      }}
    />
  </div>
);

// ---------- Плашка ----------
export const Pill: React.FC<{
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, bg = C.navy, color = "#FFFFFF", size = 40, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.28}px ${size * 0.75}px`,
      borderRadius: 999,
      backgroundColor: bg,
      color,
      fontFamily,
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// Заголовок сцены: жёлтая плашка с номером детали.
export const SceneTitle: React.FC<{ readonly text: string; readonly a: number; readonly top?: number }> = ({ text, a, top = 270 }) => (
  <div style={{ position: "absolute", left: 60, right: 150, top, display: "flex", justifyContent: "center", opacity: a, translate: `0 ${(1 - a) * 24}px` }}>
    <div
      style={{
        padding: "16px 34px",
        borderRadius: 30,
        backgroundColor: C.yellow,
        color: C.navy,
        fontFamily,
        fontSize: 48,
        fontWeight: 900,
        lineHeight: 1.1,
        textAlign: "center",
        boxShadow: "0 12px 28px rgba(20,40,90,0.14)",
      }}
    >
      {text}
    </div>
  </div>
);

// Отметка «готово».
export const Check: React.FC<{ readonly s?: number }> = ({ s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <circle cx={24} cy={24} r={22} fill={C.green} />
    <path d="M 13 25 L 21 33 L 35 16" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Ремень безопасности: лента, язычок и пряжка ----------
// Рисуется в системе координат 300×220: лента приходит сверху слева,
// язычок входит в пряжку справа снизу. click 0…1 — язычок вошёл.
export const Belt: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rotate?: number; readonly click?: number; readonly opacity?: number }> = ({
  x,
  y,
  s = 1,
  rotate = 0,
  click = 1,
  opacity = 1,
}) => {
  const gap = (1 - click) * 46;
  return (
    <svg
      width={300 * s}
      height={220 * s}
      viewBox="0 0 300 220"
      style={{ position: "absolute", left: x - 150 * s, top: y - 110 * s, opacity, transform: `rotate(${rotate}deg)`, overflow: "visible" }}
    >
      <ellipse cx={160} cy={200} rx={140} ry={14} fill="rgba(20,40,90,0.10)" />
      {/* лента */}
      <path d={`M 0 30 Q 70 40 ${120 - gap} 120`} fill="none" stroke={C.strap} strokeWidth={46} strokeLinecap="butt" />
      <path d={`M 0 30 Q 70 40 ${120 - gap} 120`} fill="none" stroke={C.strapEdge} strokeWidth={46} strokeDasharray="2 14" opacity={0.35} />
      {/* язычок */}
      <g transform={`translate(${-gap} ${-gap * 0.55})`}>
        <path d="M 104 96 L 150 122 L 168 152 L 142 166 L 108 146 Z" fill={C.metal} stroke={C.metalDark} strokeWidth={4} />
        <rect x={124} y={124} width={24} height={10} rx={4} transform="rotate(30 136 129)" fill={C.metalDark} />
      </g>
      {/* пряжка */}
      <g>
        <rect x={150} y={128} width={120} height={66} rx={20} transform="rotate(30 210 161)" fill="#2B3142" />
        <rect x={190} y={142} width={46} height={30} rx={8} transform="rotate(30 213 157)" fill="#D8433A" />
        <path d="M 270 196 L 300 216" stroke={C.strap} strokeWidth={30} />
      </g>
    </svg>
  );
};

// ---------- Бутылка воды 0,5 л (газсыз) ----------
// Система координат 120×300; tint — лёгкий оттенок воды со вкусом.
export const Bottle: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly rotate?: number;
  readonly label?: string;
  readonly tint?: string;
  readonly opacity?: number;
  readonly squash?: number;
}> = ({ x, y, s = 1, rotate = 0, label = "0,5 л", tint = C.water, opacity = 1, squash = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x - 60 * s,
      top: y - 150 * s,
      width: 120 * s,
      height: 300 * s,
      opacity,
      transform: `rotate(${rotate}deg) scale(${1 + squash * 0.08}, ${1 - squash * 0.08})`,
      transformOrigin: "50% 100%",
    }}
  >
    <svg width={120 * s} height={300 * s} viewBox="0 0 120 300" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <ellipse cx={60} cy={296} rx={50} ry={7} fill="rgba(20,40,90,0.12)" />
      <rect x={38} y={0} width={44} height={30} rx={8} fill={C.cap} />
      <rect x={34} y={26} width={52} height={10} rx={4} fill="#2468BA" />
      <path d="M 40 36 L 80 36 Q 82 62 104 82 Q 112 92 112 110 L 112 276 Q 112 294 94 294 L 26 294 Q 8 294 8 276 L 8 110 Q 8 92 16 82 Q 38 62 40 36 Z" fill="rgba(235,246,254,0.9)" stroke="#9DC3E3" strokeWidth={4} />
      <path d="M 12 128 L 108 128 L 108 276 Q 108 290 94 290 L 26 290 Q 12 290 12 276 Z" fill={tint} opacity={0.9} />
      <path d="M 24 96 Q 22 160 26 260" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
      <rect x={8} y={150} width={104} height={80} fill="#FFFFFF" stroke="#BFD6EC" strokeWidth={3} />
      <rect x={8} y={150} width={104} height={14} fill={C.yellow} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 8 * s,
        width: 104 * s,
        top: 164 * s,
        height: 66 * s,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 26 * s,
        color: C.navy,
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      {label}
    </div>
  </div>
);

// ---------- Карточка «Ким тосот?» ----------
// 260×180; flip 0…1 — карточка поворачивается (scaleX) для раскрытия.
export const PickupCard: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rotate?: number; readonly text: string; readonly opacity?: number }> = ({
  x,
  y,
  s = 1,
  rotate = 0,
  text,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 130 * s,
      top: y - 90 * s,
      width: 260 * s,
      height: 180 * s,
      opacity,
      transform: `rotate(${rotate}deg)`,
      borderRadius: 26 * s,
      backgroundColor: "#FFFFFF",
      border: `${5 * s}px solid ${C.navy}`,
      boxShadow: "0 14px 22px rgba(20,40,90,0.16)",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily,
    }}
  >
    <div style={{ height: 30 * s, backgroundColor: C.yellow }} />
    <div style={{ display: "flex", alignItems: "center", gap: 14 * s, padding: `${14 * s}px ${18 * s}px 0` }}>
      <svg width={70 * s} height={70 * s} viewBox="0 0 70 70">
        <circle cx={35} cy={35} r={34} fill={C.sky} />
        <circle cx={35} cy={27} r={13} fill={C.skin} />
        <path d="M 12 62 Q 35 34 58 62 Z" fill={C.navy} />
      </svg>
      <div style={{ fontSize: 34 * s, fontWeight: 900, color: C.navy, lineHeight: 1.05 }}>{text}</div>
    </div>
    <div style={{ margin: `${12 * s}px ${18 * s}px 0`, height: 10 * s, borderRadius: 5 * s, backgroundColor: C.line }} />
  </div>
);

// ---------- Маленькая рука ребёнка (держит предмет снизу) ----------
// (x, y) — точка между пальцами; рука приходит снизу, angle — наклон.
export const KidHand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly opacity?: number }> = ({ x, y, angle = 0, opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity, pointerEvents: "none", overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(0.82)`}>
      <path d="M -60 120 L 60 120 L 84 700 L -84 700 Z" fill={C.kidSleeve} />
      <path d="M -64 112 Q 0 98 64 112 L 66 148 Q 0 136 -66 148 Z" fill="#FFFFFF" opacity={0.9} />
      <path d="M -54 20 Q -64 70 -54 120 L 56 120 Q 68 70 56 22 Q 44 4 20 6 L -24 6 Q -46 6 -54 20 Z" fill={C.skin} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-44 + i * 26} 14 q 2 -26 13 -26 q 11 0 11 26 Z`} fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
      ))}
      <path d="M 54 60 Q 84 40 84 14 Q 82 2 70 6 Q 60 30 46 44 Z" fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
    </g>
  </svg>
);

// ---------- Ребёнок (сидит), вид спереди-сбоку ----------
// belt 0…1 — диагональная лента от плеча к бедру протягивается и
// защёлкивается; smile 0…1; look — поворот взгляда.
export const SeatedKid: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly hair?: string;
  readonly shirt?: string;
  readonly belt?: number;
  readonly f: number;
  readonly shift?: number;
  readonly look?: number;
  readonly girl?: boolean;
}> = ({ x, y, s = 1, hair = "#3B2A20", shirt = "#5B7FC7", belt = 1, f, shift = 0, look = 0, girl }) => {
  const breathe = Math.sin((f + shift) / 22) * 2;
  const eye = blink(f, shift);
  const L = 300;
  return (
    <svg width={320 * s} height={460 * s} viewBox="0 0 320 460" style={{ position: "absolute", left: x - 160 * s, top: y - 460 * s, overflow: "visible" }}>
      {/* ноги */}
      <path d="M 96 360 L 96 440 L 140 440 L 146 360 Z M 176 360 L 182 440 L 226 440 L 226 360 Z" fill="#2F3E66" />
      <rect x={86} y={432} width={64} height={26} rx={12} fill="#20294A" />
      <rect x={172} y={432} width={64} height={26} rx={12} fill="#20294A" />
      {/* корпус */}
      <g transform={`translate(0 ${breathe * 0.5})`}>
        <path d="M 78 210 Q 160 182 242 210 L 252 370 L 68 370 Z" fill={shirt} />
        {/* руки на коленях */}
        <path d="M 80 220 Q 52 290 92 350 L 130 352" fill="none" stroke={shirt} strokeWidth={40} strokeLinecap="round" />
        <path d="M 240 220 Q 268 290 228 350 L 190 352" fill="none" stroke={shirt} strokeWidth={40} strokeLinecap="round" />
        <circle cx={136} cy={352} r={19} fill={C.skin} />
        <circle cx={184} cy={352} r={19} fill={C.skin} />
        {/* ремень: плечо → бедро и поясная часть */}
        <path d="M 226 200 L 104 366" fill="none" stroke={C.strap} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${L * belt} ${L}`} />
        <path d="M 72 362 L 248 362" fill="none" stroke={C.strap} strokeWidth={22} strokeDasharray={`${180 * belt} 180`} opacity={belt > 0.02 ? 1 : 0} />
        {belt >= 1 ? <rect x={86} y={348} width={42} height={28} rx={8} fill="#2B3142" /> : null}
      </g>
      {/* голова */}
      <g transform={`translate(${look * 6} ${breathe})`}>
        <rect x={146} y={176} width={28} height={30} fill={C.skinShade} />
        <circle cx={160} cy={130} r={62} fill={C.skin} />
        <path d={girl ? "M 96 130 Q 92 54 160 58 Q 228 54 224 130 Q 214 92 160 90 Q 106 92 96 130 Z" : "M 98 120 Q 104 60 160 62 Q 216 60 222 120 Q 196 92 160 94 Q 124 92 98 120 Z"} fill={hair} />
        {girl ? <path d="M 96 128 Q 84 190 104 210 L 110 140 Z M 224 128 Q 236 190 216 210 L 210 140 Z" fill={hair} /> : null}
        <ellipse cx={138 + look * 4} cy={134} rx={7} ry={9 * eye} fill="#1E2438" />
        <ellipse cx={182 + look * 4} cy={134} rx={7} ry={9 * eye} fill="#1E2438" />
        <path d="M 140 160 Q 160 176 180 160" fill="none" stroke="#9A4B3B" strokeWidth={6} strokeLinecap="round" />
        <circle cx={120} cy={156} r={10} fill="#F2A08F" opacity={0.5} />
        <circle cx={200} cy={156} r={10} fill="#F2A08F" opacity={0.5} />
      </g>
    </svg>
  );
};

// ---------- Обычное заднее сиденье (место для одного ребёнка) ----------
export const Seat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={300 * s} height={520 * s} viewBox="0 0 300 520" style={{ position: "absolute", left: x - 150 * s, top: y - 520 * s, overflow: "visible" }}>
    <rect x={80} y={0} width={140} height={70} rx={26} fill={C.seatDark} />
    <rect x={30} y={60} width={240} height={330} rx={40} fill={C.seat} />
    <rect x={56} y={86} width={188} height={280} rx={30} fill="#6B7894" />
    <rect x={10} y={360} width={280} height={110} rx={36} fill={C.seatDark} />
    {/* точка крепления ремня у плеча */}
    <rect x={238} y={70} width={30} height={40} rx={8} fill="#2B3142" />
  </svg>
);

// ---------- Взрослый (ждёт у дома) ----------
export const Adult: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly wave?: number; readonly open?: number }> = ({
  x,
  y,
  s = 1,
  f,
  wave = 0,
  open = 0,
}) => {
  const eye = blink(f, 37);
  const arm = -20 - wave * 110 + Math.sin(f / 5) * 12 * wave;
  return (
    <svg width={260 * s} height={620 * s} viewBox="0 0 260 620" style={{ position: "absolute", left: x - 130 * s, top: y - 620 * s, overflow: "visible" }}>
      <ellipse cx={130} cy={612} rx={90} ry={10} fill="rgba(20,40,90,0.12)" />
      <path d="M 92 400 L 86 600 L 122 600 L 128 420 L 134 600 L 170 600 L 166 400 Z" fill="#2F3E66" />
      <path d="M 70 230 Q 130 200 190 230 L 204 420 L 56 420 Z" fill="#E8735A" />
      {/* левая рука — к ребёнку (open), правая — машет (wave) */}
      <g transform={`rotate(${-10 - open * 40} 80 240)`}>
        <path d="M 80 240 L 66 380" stroke="#E8735A" strokeWidth={34} strokeLinecap="round" />
        <circle cx={66} cy={392} r={17} fill={C.skin} />
      </g>
      <g transform={`rotate(${arm} 180 240)`}>
        <path d="M 180 240 L 194 380" stroke="#E8735A" strokeWidth={34} strokeLinecap="round" />
        <circle cx={194} cy={392} r={17} fill={C.skin} />
      </g>
      <rect x={116} y={186} width={28} height={30} fill={C.skinShade} />
      <circle cx={130} cy={140} r={56} fill={C.skin} />
      <path d="M 72 146 Q 66 70 130 74 Q 194 70 188 146 Q 196 210 176 226 L 172 132 Q 130 108 88 132 L 84 226 Q 64 210 72 146 Z" fill="#3B2A20" />
      <ellipse cx={110} cy={146} rx={6} ry={8 * eye} fill="#1E2438" />
      <ellipse cx={150} cy={146} rx={6} ry={8 * eye} fill="#1E2438" />
      <path d="M 112 170 Q 130 184 148 170" fill="none" stroke="#9A4B3B" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
};

// ---------- Ребёнок с рюкзаком (идёт, вид сбоку) ----------
// phase — фаза шага (радианы); step 0…1 — амплитуда (0 — стоит).
export const WalkingKid: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly phase: number; readonly step?: number; readonly f: number; readonly dir?: 1 | -1 }> = ({
  x,
  y,
  s = 1,
  phase,
  step = 1,
  f,
  dir = 1,
}) => {
  const a = Math.sin(phase) * 18 * step;
  const bob = Math.abs(Math.sin(phase)) * 5 * step;
  const eye = blink(f, 11);
  return (
    <svg width={200 * s} height={420 * s} viewBox="0 0 200 420" style={{ position: "absolute", left: x - 100 * s, top: y - 420 * s - bob * s, overflow: "visible" }}>
      <g transform={dir === -1 ? "translate(200 0) scale(-1 1)" : undefined}>
        <ellipse cx={100} cy={416} rx={60} ry={8} fill="rgba(20,40,90,0.12)" />
        <g transform={`rotate(${a} 100 290)`}>
          <path d="M 92 290 L 92 400" stroke="#2F3E66" strokeWidth={28} strokeLinecap="round" />
          <rect x={80} y={392} width={44} height={18} rx={8} fill="#20294A" />
        </g>
        <g transform={`rotate(${-a} 100 290)`}>
          <path d="M 108 290 L 108 400" stroke="#2F3E66" strokeWidth={28} strokeLinecap="round" />
          <rect x={96} y={392} width={44} height={18} rx={8} fill="#20294A" />
        </g>
        {/* рюкзак */}
        <rect x={34} y={170} width={56} height={110} rx={18} fill={C.yellow} />
        <path d="M 66 170 Q 150 150 134 300 L 70 300 Z" fill="#5B7FC7" />
        <g transform={`rotate(${-a * 0.8} 112 186)`}>
          <path d="M 112 186 L 126 270" stroke="#5B7FC7" strokeWidth={24} strokeLinecap="round" />
          <circle cx={128} cy={280} r={13} fill={C.skin} />
        </g>
        <rect x={94} y={128} width={22} height={24} fill={C.skinShade} />
        <circle cx={108} cy={96} r={46} fill={C.skin} />
        <path d="M 62 92 Q 66 44 110 46 Q 152 48 154 90 Q 132 72 108 74 Q 80 74 62 92 Z" fill="#3B2A20" />
        <ellipse cx={130} cy={98} rx={6} ry={8 * eye} fill="#1E2438" />
        <path d="M 122 118 Q 134 126 146 116" fill="none" stroke="#9A4B3B" strokeWidth={5} strokeLinecap="round" />
        <circle cx={140} cy={110} r={8} fill="#F2A08F" opacity={0.5} />
      </g>
    </svg>
  );
};

// ---------- Белая легковая машина (вид сбоку, стоит у дома) ----------
export const Car: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly dir?: 1 | -1; readonly door?: number }> = ({ x, y, s = 1, dir = 1, door = 0 }) => {
  const W = 440;
  return (
    <svg width={W * s} height={190 * s} viewBox={`0 0 ${W} 190`} style={{ position: "absolute", left: x - (W * s) / 2, top: y - 190 * s, overflow: "visible" }}>
      <g transform={dir === -1 ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <ellipse cx={W / 2} cy={182} rx={200} ry={10} fill="rgba(20,40,90,0.12)" />
        <path
          d="M 6 128 Q 4 96 34 90 L 104 82 L 156 34 Q 168 22 188 22 L 298 22 Q 318 22 332 36 L 382 84 L 418 92 Q 438 98 438 122 L 438 146 Q 438 158 424 158 L 18 158 Q 6 158 6 146 Z"
          fill="#FFFFFF"
          stroke="#BCC8DA"
          strokeWidth={4}
        />
        <path d="M 120 84 L 164 40 Q 172 34 184 34 L 246 34 L 246 84 Z" fill="#CFE6F7" />
        <path d="M 256 34 L 296 34 Q 312 34 322 44 L 362 84 L 256 84 Z" fill="#CFE6F7" />
        {/* водитель на своём месте, руки на руле, без телефона */}
        <circle cx={302} cy={56} r={15} fill={C.skin} />
        <path d="M 287 52 Q 302 36 317 52 Q 306 46 287 52 Z" fill="#2B2B2B" />
        <path d="M 282 84 Q 302 70 322 84 L 322 90 L 282 90 Z" fill={C.navy} />
        <path d="M 250 30 L 250 156" stroke="#E2E8F2" strokeWidth={4} />
        {/* открытая задняя дверь */}
        {door > 0 ? <path d={`M 130 86 L 246 86 L 246 156 L 130 156 Z`} fill="#F4F7FB" stroke="#BCC8DA" strokeWidth={3} opacity={door} /> : null}
        <path d="M 20 112 L 430 112" stroke="#EEF2F8" strokeWidth={3} />
        <rect x={404} y={104} width={26} height={12} rx={5} fill="#FFE27A" />
        <rect x={8} y={106} width={18} height={12} rx={5} fill="#F2A08F" />
        {[96, 344].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={158} r={30} fill="#2B3550" />
            <circle cx={cx} cy={158} r={14} fill="#DCE3EE" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// ---------- Логотип ----------
export const Logo: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly opacity?: number; readonly scale?: number }> = ({ x, y, r, opacity = 1, scale = 1 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity, transform: `scale(${scale})` }}>
    <Img
      src={staticFile(BG29_VIDEO.logo)}
      style={{ width: r * 2, height: r * 2, borderRadius: r, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.16)" }}
    />
  </div>
);

// ---------- Салон: задний ряд, боковые окна с видом на Бишкек ----------
// Машина стоит (вид за окном неподвижен).
export const Cabin: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: C.cabin, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 200, backgroundColor: "#E3E9F2" }} />
    {[
      { left: 70, width: 420 },
      { left: 590, width: 420 },
    ].map((w) => (
      <div key={w.left} style={{ position: "absolute", left: w.left, top: 380, width: w.width, height: 380, borderRadius: "90px 90px 26px 26px", overflow: "hidden", border: "14px solid #DCE3EE" }}>
        <div style={{ position: "absolute", left: -w.left, top: -40, width: 1080 }}>
          <Skyline h={420} />
        </div>
      </div>
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1360, bottom: 0, backgroundColor: "#D5DCE8" }} />
  </div>
);

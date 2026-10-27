// Предметы истории: детский рисунок «наша семья» (фломастеры и мелки),
// альбом сына, телефон мамы с экранами (календарь, профиль BalaGo,
// страница BalaGo). Всё в локальных координатах, центр — (0, 0).
import { Img, staticFile } from "remotion";
import { fontFamily } from "./fonts";
import { B12_TEXT } from "./script";

export const NAVY = "#1E3A6E";
export const YELLOW = "#F7C531";
export const PAPER = "#FFFDF6";

// Неровная «мелковая» линия: фильтр с лёгким дрожанием контура.
export const CrayonDefs: React.FC<{ readonly id: string; readonly seed?: number; readonly amount?: number }> = ({ id, seed = 3, amount = 3.2 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={amount} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

// Человечек из детского рисунка.
const Stick: React.FC<{ x: number; y: number; s: number; color: string; hair: string; skirt?: boolean; label: string; wave?: number }> = ({
  x,
  y,
  s,
  color,
  hair,
  skirt,
  label,
  wave = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-120} r={30} fill="#FBD9B5" stroke="#C77B4A" strokeWidth={4} />
    <path d="M -30 -128 Q -28 -160 0 -158 Q 28 -160 30 -128 Q 16 -140 0 -138 Q -16 -140 -30 -128 Z" fill={hair} />
    <circle cx={-10} cy={-122} r={3.5} fill="#2A1F24" />
    <circle cx={10} cy={-122} r={3.5} fill="#2A1F24" />
    <path d="M -12 -108 Q 0 -96 12 -108" stroke="#D84343" strokeWidth={4} fill="none" strokeLinecap="round" />
    {skirt ? <path d="M -22 -88 L 22 -88 L 36 -10 L -36 -10 Z" fill={color} /> : <rect x={-24} y={-88} width={48} height={78} rx={12} fill={color} />}
    <path d="M -12 -10 L -16 40 M 12 -10 L 16 40" stroke="#3B4A6B" strokeWidth={8} strokeLinecap="round" />
    <path d={`M -24 -76 L -58 ${-40 - wave}`} stroke="#C77B4A" strokeWidth={7} strokeLinecap="round" />
    <path d="M 24 -76 L 58 -40" stroke="#C77B4A" strokeWidth={7} strokeLinecap="round" />
    <text x={0} y={80} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={30} fill={NAVY} transform="rotate(-3)">
      {label}
    </text>
  </g>
);

// Рисунок сына: семья держится за руки у дома, солнце, сердечко.
// w × h = 620 × 460.
export const ChildDrawing: React.FC<{ readonly uid: string; readonly glow?: number }> = ({ uid, glow = 0 }) => (
  <g>
    <defs>
      <CrayonDefs id={`${uid}-cr`} seed={7} amount={3.5} />
    </defs>
    <rect x={-316} y={-236} width={632} height={472} rx={10} fill="#000" opacity={0.1} transform="translate(6 8)" />
    <rect x={-310} y={-230} width={620} height={460} rx={8} fill={PAPER} />
    <rect x={-310} y={-230} width={620} height={460} rx={8} fill="#FFE9A8" opacity={0.35 * glow} />
    <g filter={`url(#${uid}-cr)`}>
      {/* солнце */}
      <circle cx={-222} cy={-150} r={44} fill={YELLOW} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        return <line key={i} x1={-222 + Math.cos(a) * 58} y1={-150 + Math.sin(a) * 58} x2={-222 + Math.cos(a) * 80} y2={-150 + Math.sin(a) * 80} stroke="#F2A900" strokeWidth={7} strokeLinecap="round" />;
      })}
      {/* дом */}
      <path d="M 150 30 L 150 -80 L 225 -150 L 300 -80 L 300 30" fill="#FF9A76" stroke="#D9572B" strokeWidth={5} strokeLinejoin="round" />
      <path d="M 135 -70 L 225 -158 L 312 -70" stroke="#B5432A" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={202} y={-30} width={44} height={60} fill="#FFE07A" stroke="#D9572B" strokeWidth={4} />
      <rect x={166} y={-68} width={34} height={30} fill="#BFE3FF" stroke="#D9572B" strokeWidth={4} />
      {/* трава */}
      <path d="M -300 150 Q -150 120 0 150 Q 150 175 300 140" stroke="#5DB36A" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* сердечко */}
      <path d="M 40 -170 C 40 -192 70 -192 70 -170 C 70 -192 100 -192 100 -170 C 100 -150 70 -132 70 -126 C 70 -132 40 -150 40 -170 Z" fill="#F0617A" />
      <Stick x={-170} y={60} s={1.05} color="#2F5DA8" hair="#2A1F24" label="АТА" />
      <Stick x={-50} y={68} s={0.98} color={YELLOW} hair="#5A3A30" skirt label="АПА" />
      <Stick x={58} y={92} s={0.72} color="#7CB8E8" hair="#2E201B" label="МЕН" wave={14} />
    </g>
  </g>
);

// Альбом (скетчбук на пружине) с рисунком на странице: 680 × 560.
export const Album: React.FC<{ readonly uid: string; readonly glow?: number }> = ({ uid, glow }) => (
  <g>
    <rect x={-346} y={-286} width={692} height={572} rx={18} fill="#000" opacity={0.14} transform="translate(8 10)" />
    <rect x={-340} y={-280} width={680} height={560} rx={16} fill="#2F5DA8" />
    <rect x={-326} y={-250} width={652} height={516} rx={10} fill={PAPER} />
    <g transform="translate(0 12) scale(1.02)">
      <ChildDrawing uid={uid} glow={glow} />
    </g>
    {Array.from({ length: 13 }, (_, i) => (
      <rect key={i} x={-300 + i * 50} y={-298} width={14} height={40} rx={7} fill="#C9CED8" stroke="#8D95A3" strokeWidth={3} />
    ))}
  </g>
);

// ---------- Телефон ----------
// Экран 360 × 740 (локальные координаты экрана: 0…360, 0…740).
export const SCREEN_W = 360;
export const SCREEN_H = 740;

export const Phone: React.FC<{ readonly children?: React.ReactNode; readonly dark?: number }> = ({ children, dark = 0 }) => (
  <g>
    <rect x={-196} y={-392} width={392} height={784} rx={52} fill="#1C1E26" />
    <g transform={`translate(${-SCREEN_W / 2} ${-SCREEN_H / 2})`}>
      <clipPath id="b12-phone-clip">
        <rect width={SCREEN_W} height={SCREEN_H} rx={36} />
      </clipPath>
      <g clipPath="url(#b12-phone-clip)">
        <rect width={SCREEN_W} height={SCREEN_H} fill="#FFFFFF" />
        {children}
        <rect width={SCREEN_W} height={SCREEN_H} fill="#0B0C10" opacity={dark} />
      </g>
    </g>
    <rect x={-50} y={-378} width={100} height={22} rx={11} fill="#1C1E26" />
  </g>
);

const T: React.FC<{ x: number; y: number; size: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end"; children: React.ReactNode; opacity?: number }> = ({
  x,
  y,
  size,
  color = NAVY,
  weight = 800,
  anchor = "start",
  children,
  opacity,
}) => (
  <text x={x} y={y} fontFamily={fontFamily} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} opacity={opacity}>
    {children}
  </text>
);

// Календарь на завтра: две дороги без ответа «кто?» и два рабочих графика.
// highlight — подсветка строки (0…3), scroll — сдвиг списка.
export const CalendarScreen: React.FC<{ readonly highlight?: number; readonly mark?: number }> = ({ highlight = -1, mark = 0 }) => {
  const C = B12_TEXT.calendar;
  return (
    <g>
      <rect width={SCREEN_W} height={SCREEN_H} fill="#F6F7FB" />
      <T x={28} y={86} size={20} color="#8A93A6" weight={700}>
        {C.day}
      </T>
      <T x={28} y={132} size={44} weight={900}>
        {C.title}
      </T>
      {C.rows.map((r, i) => {
        const y = 186 + i * 128;
        const road = r.kind !== "work";
        const col = r.kind === "school" ? YELLOW : r.kind === "home" ? "#7CB8E8" : "#C9CED8";
        return (
          <g key={i} transform={`translate(20 ${y})`}>
            <rect width={320} height={110} rx={20} fill="#FFFFFF" stroke={highlight === i ? "#F0A800" : "#E3E6EE"} strokeWidth={highlight === i ? 4 : 2} />
            <rect x={0} y={0} width={10} height={110} rx={5} fill={col} />
            <T x={28} y={42} size={22} color="#8A93A6" weight={800}>
              {r.time}
            </T>
            <T x={28} y={80} size={23} weight={900}>
              {road ? `${r.kind === "school" ? "→ " : "← "}${r.label}` : r.label}
            </T>
            <g transform="translate(286 34)">
              <circle r={22} fill={r.who === "?" ? "#FFF3CC" : "#EEF1F7"} />
              <T x={0} y={9} size={r.who === "?" ? 26 : 15} anchor="middle" weight={900} color={r.who === "?" ? "#E09A00" : NAVY}>
                {r.who}
              </T>
            </g>
          </g>
        );
      })}
      {/* мама прикидывает: стрелка между дорогой и графиком */}
      <path d={`M 300 ${186 + 55} C 352 ${186 + 120} 352 ${186 + 128 * 2 + 20} 300 ${186 + 128 * 2 + 55}`} stroke="#F0A800" strokeWidth={5} fill="none" strokeDasharray="10 9" opacity={mark} />
    </g>
  );
};

// Профиль BalaGo: шапка профиля и ссылка (как в финальном призыве).
export const ProfileScreen: React.FC<{ readonly tap?: number }> = ({ tap = 0 }) => {
  const P = B12_TEXT.profile;
  return (
    <g>
      <rect width={SCREEN_W} height={SCREEN_H} fill="#FFFFFF" />
      <T x={180} y={84} size={22} anchor="middle" weight={800}>
        {P.name}
      </T>
      <circle cx={84} cy={190} r={62} fill={YELLOW} />
      <foreignObject x={26} y={132} width={116} height={116}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 116, height: 116, borderRadius: 58 }} />
      </foreignObject>
      <T x={166} y={176} size={34} weight={900}>
        {P.title}
      </T>
      <T x={166} y={210} size={13.5} color="#55607A" weight={800}>
        {P.bio}
      </T>
      <g transform="translate(24 290)">
        <rect width={312} height={70} rx={18} fill={tap > 0.5 ? "#FFE58A" : "#FFF3CC"} stroke={YELLOW} strokeWidth={3} />
        <path d="M 32 35 m -10 0 a 10 10 0 0 1 10 -10 h 10 M 52 35 m 10 0 a 10 10 0 0 1 -10 10 h -10 M 38 35 h 18" stroke={NAVY} strokeWidth={5} fill="none" strokeLinecap="round" />
        <T x={80} y={45} size={22} weight={900}>
          {P.link}
        </T>
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={24 + (i % 3) * 106} y={400 + Math.floor(i / 3) * 106} width={98} height={98} rx={10} fill={i % 2 ? "#EEF3FB" : "#FFF6D6"} />
      ))}
    </g>
  );
};

// Страница BalaGo: маршрут ҮЙ → МЕКТЕП → ҮЙ, город, кнопка предварительной записи.
export const PageScreen: React.FC<{ readonly reveal?: number }> = ({ reveal = 1 }) => {
  const P = B12_TEXT.page;
  return (
    <g>
      <rect width={SCREEN_W} height={SCREEN_H} fill="#FFFFFF" />
      <rect width={SCREEN_W} height={300} fill="#FFF6D6" />
      <foreignObject x={110} y={50} width={140} height={140}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 140, height: 140, borderRadius: 70 }} />
      </foreignObject>
      <T x={180} y={238} size={40} anchor="middle" weight={900}>
        {P.brand}
      </T>
      <T x={180} y={276} size={22} anchor="middle" weight={800} color="#55607A">
        {P.tagline}
      </T>
      <g opacity={reveal}>
        <g transform="translate(180 344)">
          <rect x={-70} y={-24} width={140} height={44} rx={22} fill={NAVY} />
          <T x={0} y={7} size={22} anchor="middle" color="#FFFFFF" weight={900}>
            {P.city}
          </T>
        </g>
        <g transform="translate(180 440)">
          {[
            [-128, 70, P.route[0]],
            [0, 128, P.route[1]],
            [128, 70, P.route[2]],
          ].map(([x, w, r], i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <rect x={-Number(w) / 2} y={-30} width={Number(w)} height={60} rx={30} fill={i === 1 ? YELLOW : "#EEF3FB"} />
              <T x={0} y={8} size={22} anchor="middle" weight={900}>
                {r}
              </T>
            </g>
          ))}
          <path d="M -88 0 L -70 0 M 70 0 L 88 0" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g transform="translate(30 560)">
          <rect width={300} height={78} rx={39} fill={YELLOW} />
          <T x={150} y={50} size={26} anchor="middle" weight={900}>
            {P.button}
          </T>
        </g>
      </g>
    </g>
  );
};

export const LockScreen: React.FC = () => (
  <g>
    <rect width={SCREEN_W} height={SCREEN_H} fill="#20263A" />
    <T x={180} y={200} size={72} anchor="middle" color="#FFFFFF" weight={700}>
      20:47
    </T>
  </g>
);

// Блокнот папы с делами на завтра: 170 × 120.
export const Planner: React.FC = () => (
  <g>
    <rect x={-88} y={-58} width={176} height={124} rx={8} fill="#000" opacity={0.12} transform="translate(4 5)" />
    <rect x={-88} y={-58} width={176} height={124} rx={8} fill="#2F7D6B" />
    <rect x={-80} y={-52} width={160} height={112} rx={4} fill="#FFFDF6" />
    <T x={-68} y={-28} size={16} weight={900}>
      {B12_TEXT.planner.title}
    </T>
    {B12_TEXT.planner.lines.map((l, i) => (
      <T key={l} x={-68} y={-2 + i * 22} size={14} weight={800} color="#55607A">
        {l}
      </T>
    ))}
  </g>
);

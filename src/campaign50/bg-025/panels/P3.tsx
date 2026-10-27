// Печать панели 3/6 бумажной ленты (координаты панели RIB.w × RIB.h):
// условие «Топ түзүлгөндө» вверху, под ним — плоская напечатанная
// картинка «условный Бишкек»: хребет Ала-Тоо со снегом, тополя, панельный
// дом слева, школа справа, между ними улица с пунктиром и белая машина;
// внизу печатная строка «ҮЙ → МЕКТЕП → ҮЙ» с жёлтым маркером.
// В сцене шага 3 эта картинка встаёт pop-up диорамой (scenes/step3-diorama)
// и в конце снова ложится плашмя — итог (DONE) неподвижен и аккуратен.
// Дом и школа нарисованы в «игрушечном» масштабе: дверь подъезда — в рост
// человека, чтобы фигурки мамы и детей рядом с ними смотрелись верно.
// t — кадры с момента, когда панель легла плашмя (большое t — итог).
import { Car, IconPath, Mountains, Poplar } from "../art";
import { box, settle } from "../kit";
import { clamp, easeOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

const T = BG25_TEXT.step3;

// ---------- Геометрия панели (общая для печати и диорамы) ----------
export const P3G = {
  label: { x: 384, y: 54, w: 380, h: 58 }, // плашка условия (центр)
  pic: { x: 28, y: 100, w: 764, h: 456 }, // рамка картинки
  horizon: 298, // низ гор / начало земли
  base: 440, // низ дома и школы
  walk: { y0: 440, y1: 466 }, // тротуар
  road: { y0: 466, y1: 530, mid: 498 }, // улица
  house: { x: 56, w: 210 }, // панельный дом (подъезд по центру)
  school: { x: 520, w: 242 }, // школа (двери по центру)
  routeY: 588, // печатная строка маршрута (центр)
} as const;
export const P3_HOUSE_DOOR = P3G.house.x + P3G.house.w / 2;
export const P3_SCHOOL_DOOR = P3G.school.x + P3G.school.w / 2;

export const P3_GROUND = "#E5EEDA";
export const P3_WALK = "#F3F1EA";
export const P3_ROAD = "#D9DFE9";

// ---------- Панельный дом (низ — y = 0, ширина w) ----------
// Первый этаж выше (подъезд с козырьком), три жилых этажа с балконами.
export const HOUSE_H = 244;
export const ToyHouse: React.FC<{ readonly w: number; readonly lit?: number }> = ({ w, lit = 0 }) => {
  const g = 102; // первый этаж
  const fh = 46;
  const cols = 3;
  const cw = w / cols;
  const win = (x: number, y: number, ww: number, hh: number, on: boolean, key: string) => (
    <g key={key}>
      <rect x={x - 3} y={y - 3} width={ww + 6} height={hh + 6} rx={4} fill="#FFFFFF" opacity={0.8} />
      <rect x={x} y={y} width={ww} height={hh} rx={3} fill={on ? "#FFE7A3" : "#CFE3F6"} />
      <path d={`M ${x + ww / 2} ${y} V ${y + hh}`} stroke="#FFFFFF" strokeWidth={2.5} />
    </g>
  );
  return (
    <g>
      <rect x={0} y={-HOUSE_H} width={w} height={HOUSE_H} fill={C.brick} />
      {/* швы панелей */}
      {[1, 2, 3].map((r) => (
        <path key={r} d={`M 0 ${-g - fh * (r - 1) - 0.5} H ${w}`} stroke="#D8C2A3" strokeWidth={2} />
      ))}
      <rect x={-7} y={-HOUSE_H - 10} width={w + 14} height={14} rx={3} fill="#CDB89A" />
      {/* жилые этажи */}
      {[0, 1, 2].map((r) =>
        Array.from({ length: cols }, (_, c) => {
          const y = -g - fh * (r + 1) + 9;
          return win(c * cw + cw * 0.24, y, cw * 0.52, 26, (r * 5 + c * 3) % 4 < lit * 4, `${r}-${c}`);
        }),
      )}
      {/* балконы на среднем столбце */}
      {[0, 1, 2].map((r) => (
        <g key={`b${r}`}>
          <rect x={cw + cw * 0.12} y={-g - fh * r - 14} width={cw * 0.76} height={14} rx={2} fill="#F3E7D4" stroke="#C9B08C" strokeWidth={2} />
        </g>
      ))}
      {/* первый этаж: окна и подъезд */}
      {win(cw * 0.2, -g + 26, cw * 0.56, 34, lit > 0.5, "g0")}
      {win(2 * cw + cw * 0.24, -g + 26, cw * 0.56, 34, lit > 0.2, "g2")}
      <rect x={w / 2 - 28} y={-92} width={56} height={92} rx={4} fill="#8A6A4C" />
      <rect x={w / 2 - 20} y={-84} width={40} height={26} rx={3} fill="#CFE3F6" opacity={0.85} />
      <circle cx={w / 2 + 18} cy={-42} r={3} fill="#E9D7B8" />
      <rect x={w / 2 - 42} y={-100} width={84} height={10} rx={3} fill="#9DB0CB" />
      <rect x={w / 2 - 34} y={-2} width={68} height={6} rx={2} fill="#D2C3AA" />
    </g>
  );
};

// ---------- Школа (низ — y = 0, ширина w) ----------
// Два этажа, высокие двери по центру, тёмно-синяя табличка «Мектеп».
export const SCHOOL_H = 230;
export const ToySchool: React.FC<{ readonly w: number; readonly label: string }> = ({ w, label }) => {
  const g = 104;
  const h = 166;
  const win = (x: number, y: number, ww: number, hh: number, key: string) => (
    <g key={key}>
      <rect x={x - 3} y={y - 3} width={ww + 6} height={hh + 6} rx={4} fill="#FFFFFF" opacity={0.85} />
      <rect x={x} y={y} width={ww} height={hh} rx={3} fill="#CFE3F6" />
      <path d={`M ${x} ${y + hh * 0.42} H ${x + ww}`} stroke="#FFFFFF" strokeWidth={2.5} />
    </g>
  );
  const sw = Math.min(w * 0.66, 168);
  return (
    <g>
      <rect x={0} y={-h} width={w} height={h} fill="#F4E3C8" />
      <rect x={-8} y={-h - 12} width={w + 16} height={16} rx={3} fill="#D9B98F" />
      <path d={`M 0 ${-g} H ${w}`} stroke="#E2CCA8" strokeWidth={3} />
      {/* второй этаж: пять окон */}
      {Array.from({ length: 5 }, (_, c) => win(w * 0.06 + c * w * 0.19, -h + 14, w * 0.12, 36, `u${c}`))}
      {/* первый этаж: по два окна слева и справа от дверей */}
      {[0, 1].map((c) => win(w * 0.05 + c * w * 0.16, -g + 22, w * 0.11, 44, `l${c}`))}
      {[0, 1].map((c) => win(w * 0.68 + c * w * 0.16, -g + 22, w * 0.11, 44, `r${c}`))}
      {/* двери */}
      <rect x={w / 2 - 34} y={-96} width={68} height={96} rx={5} fill="#8A6A4C" />
      <path d={`M ${w / 2} -96 V 0`} stroke="#6E5238" strokeWidth={3} />
      <rect x={w / 2 - 27} y={-88} width={20} height={32} rx={3} fill="#CFE3F6" opacity={0.85} />
      <rect x={w / 2 + 7} y={-88} width={20} height={32} rx={3} fill="#CFE3F6" opacity={0.85} />
      <rect x={w / 2 - 48} y={-104} width={96} height={10} rx={3} fill="#D9B98F" />
      <rect x={w / 2 - 40} y={-3} width={80} height={7} rx={2} fill="#D8C4A2" />
      {/* табличка */}
      <rect x={w / 2 - sw / 2} y={-SCHOOL_H} width={sw} height={46} rx={12} fill={C.navy} />
      <rect x={w / 2 - 3} y={-SCHOOL_H + 46} width={6} height={SCHOOL_H - h - 58} fill={C.navy} />
      <text x={w / 2} y={-SCHOOL_H + 33} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={30} fill={C.white}>
        {label}
      </text>
    </g>
  );
};

// Тополя печати: [x, низ, высота]
const BACK_POPLARS: readonly (readonly [number, number, number])[] = [
  [300, 334, 132],
  [330, 338, 108],
  [500, 334, 120],
  [770, 330, 116],
];
const FRONT_POPLARS: readonly (readonly [number, number, number])[] = [
  [292, 452, 118],
  [318, 455, 96],
  [494, 452, 108],
];

export type P3Show = {
  readonly label?: number; // кадры от «штампа» плашки условия
  readonly pic?: number; // 0…1 — видимость плоской картинки
  readonly route?: number; // кадры от появления строки маршрута
};

// Плашка условия: значок «люди» и «Топ түзүлгөндө».
export const P3Label: React.FC<{ readonly t: number }> = ({ t }) => {
  if (t < 0) return null;
  const k = settle(t, 12);
  const up = 1 - easeOut(t / 10);
  const { x, y, w, h } = P3G.label;
  return (
    <div
      style={box({
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        backgroundColor: C.yellowSoft,
        border: `4px solid ${C.navy}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        opacity: clamp(t / 4),
        transform: `scale(${lerp(1.28, 1, k)}) rotate(${-3 * up}deg)`,
        boxShadow: `0 ${4 + 18 * up}px ${8 + 22 * up}px rgba(20,40,90,${0.1 + 0.14 * up})`,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: 32,
        lineHeight: 1,
        color: C.navy,
        whiteSpace: "nowrap",
      })}
    >
      <svg width={40} height={40} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <IconPath kind="people" color={C.navy} w={5} />
      </svg>
      {T.when}
    </div>
  );
};

// Видимость отдельных элементов печати (0…1): в сцене шага 3 каждый
// напечатанный элемент гаснет, когда встаёт его pop-up слой, и снова
// проявляется, когда слой ложится, — без двойного изображения.
// frame — небо, солнце, земля и рамка картинки; road — тротуар и улица.
export type P3Vis = {
  readonly frame?: number;
  readonly road?: number;
  readonly far?: number;
  readonly near?: number;
  readonly back?: number;
  readonly house?: number;
  readonly school?: number;
  readonly front?: number;
  readonly car?: number;
};

const Part: React.FC<{ readonly v?: number; readonly children: React.ReactNode }> = ({ v = 1, children }) => (v <= 0.002 ? null : <g opacity={clamp(v)}>{children}</g>);

// Плоская картинка (координаты панели).
export const P3Picture: React.FC<{ readonly opacity?: number; readonly vis?: P3Vis }> = ({ opacity = 1, vis = {} }) => {
  if (opacity <= 0.001) return null;
  const { pic, horizon, base, walk, road, house, school } = P3G;
  return (
    <svg width={820} height={620} style={box({ left: 0, top: 0, overflow: "visible", opacity })}>
      <defs>
        <clipPath id="bg25-p3-pic">
          <rect x={pic.x} y={pic.y} width={pic.w} height={pic.h} rx={22} />
        </clipPath>
        <linearGradient id="bg25-p3-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9E8F8" />
          <stop offset="1" stopColor="#F5F1E4" />
        </linearGradient>
      </defs>
      <g clipPath="url(#bg25-p3-pic)">
        <Part v={vis.frame}>
          <rect x={pic.x} y={pic.y} width={pic.w} height={horizon - pic.y + 4} fill="url(#bg25-p3-sky)" />
          <circle cx={128} cy={150} r={40} fill="#FFE8A3" opacity={0.35} />
          <circle cx={128} cy={150} r={26} fill="#FFE8A3" />
        </Part>
        <Part v={vis.far}>
          <Mountains w={pic.w + 40} h={140} x={pic.x - 20} y={horizon + 2} far />
        </Part>
        <Part v={vis.near}>
          <Mountains w={440} h={88} x={370} y={horizon + 6} />
        </Part>
        <Part v={vis.frame}>
          <rect x={pic.x} y={horizon} width={pic.w} height={pic.y + pic.h - horizon} fill={P3_GROUND} />
        </Part>
        <Part v={vis.back}>
          {BACK_POPLARS.map(([x, y, h]) => (
            <Poplar key={x} x={x} y={y} h={h} />
          ))}
        </Part>
        <Part v={vis.house}>
          <g transform={`translate(${house.x} ${base})`}>
            <ToyHouse w={house.w} />
          </g>
        </Part>
        <Part v={vis.school}>
          <g transform={`translate(${school.x} ${base})`}>
            <ToySchool w={school.w} label={T.school} />
          </g>
        </Part>
        <Part v={vis.front}>
          {FRONT_POPLARS.map(([x, y, h]) => (
            <Poplar key={x} x={x} y={y} h={h} />
          ))}
        </Part>
        <Part v={vis.road}>
          <rect x={pic.x} y={walk.y0} width={pic.w} height={walk.y1 - walk.y0} fill={P3_WALK} />
          <rect x={pic.x} y={road.y0} width={pic.w} height={road.y1 - road.y0} fill={P3_ROAD} />
          <line x1={pic.x} y1={road.mid} x2={pic.x + pic.w} y2={road.mid} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="22 18" />
        </Part>
        <Part v={vis.car}>
          <Car x={402} y={road.mid + 4} s={0.42} />
        </Part>
      </g>
      <Part v={vis.frame}>
        <rect x={pic.x} y={pic.y} width={pic.w} height={pic.h} rx={22} fill="none" stroke="#CBD5E3" strokeWidth={3} />
      </Part>
    </svg>
  );
};

// Печатная строка «ҮЙ → МЕКТЕП → ҮЙ» с жёлтым маркером.
export const P3Route: React.FC<{ readonly t: number }> = ({ t }) => {
  if (t < 0) return null;
  const k = easeOut(t / 12);
  const mark = easeOut((t - 4) / 14);
  return (
    <div style={box({ left: 0, right: 0, top: P3G.routeY - 24, display: "flex", justifyContent: "center", opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * 10}px)` })}>
      <div style={{ position: "relative", padding: "0 16px 2px" }}>
        <div style={box({ left: 0, bottom: 3, height: 17, width: `${mark * 100}%`, borderRadius: 9, backgroundColor: C.yellow, opacity: 0.85 })} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, fontFamily: F.text, fontWeight: 900, fontSize: 36, lineHeight: 1.1, letterSpacing: 1, color: C.navy, whiteSpace: "nowrap" }}>
          {T.route.split("→").map((part, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i > 0 ? (
                <svg width={34} height={22} viewBox="0 0 40 26">
                  <path d="M 3 13 H 33 M 24 4 L 35 13 L 24 22" fill="none" stroke={C.navy} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {part.trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Вся печать панели: сцена передаёт свои моменты (по умолчанию — итог).
export const P3Flat: React.FC<{ readonly show?: P3Show }> = ({ show }) => (
  <div style={box({ inset: 0 })}>
    <P3Picture opacity={show?.pic ?? 1} />
    <P3Label t={show?.label ?? 9999} />
    <P3Route t={show?.route ?? 9999} />
  </div>
);

export const P3Art: React.FC<{ readonly t: number }> = () => <P3Flat />;

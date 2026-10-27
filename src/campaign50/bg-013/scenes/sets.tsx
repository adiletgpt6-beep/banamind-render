// Декорации BG-013 «Самый длинный вторник». Мир = кадр (px).
// Камера всегда на высоте глаз ребёнка: линия пола низко (FLOOR_Y),
// взрослые высокие, столешницы видны почти «в ребро».
// Главный мотив — часы: «тянущиеся» стрелки (StretchClock) в каждой сцене.
import { Mountains, NAVY, NAVY_SOFT, Poplar, YELLOW } from "../art";

export const FLOOR_Y = 1640;
export const ADULT_H = 1150;
export const CHILD_H = 800;

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Часы со «стрелками-резинками»: stretch 0…1 вытягивает минутную стрелку
// и мягко изгибает её; wobble — едва заметное «плывущее» дыхание циферблата.
export const StretchClock: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly minutes: number; // минут от 0:00
  readonly stretch?: number;
  readonly wobble?: number;
  readonly face?: string;
  readonly rim?: string;
  readonly sun?: number; // 0…1 — нарисованное солнце (финал)
}> = ({ x, y, r, minutes, stretch = 0, wobble = 0, face = "#FFFFFF", rim = NAVY, sun = 0 }) => {
  const ma = ((minutes % 60) / 60) * 360;
  const ha = (((minutes / 60) % 12) / 12) * 360;
  const len = 38 + stretch * 22;
  const bend = stretch * 10;
  const sx = 1 + wobble * 0.025;
  const sy = 1 - wobble * 0.02;
  return (
    <svg
      width={2 * r}
      height={2 * r}
      viewBox="-50 -50 100 100"
      style={{ position: "absolute", left: x - r, top: y - r, overflow: "visible", transform: `scale(${sx}, ${sy})` }}
    >
      {sun > 0
        ? Array.from({ length: 12 }, (_, i) => {
            const u = Math.max(0, Math.min(1, sun * 12 - i));
            return (
              <path
                key={i}
                d={`M 0 -56 L 0 ${-56 - 16 * u}`}
                stroke="#F5B400"
                strokeWidth={5}
                strokeLinecap="round"
                transform={`rotate(${i * 30 + 15})`}
                opacity={u > 0 ? 1 : 0}
              />
            );
          })
        : null}
      <circle r={46} fill={sun > 0 ? `rgb(${255}, ${255 - 24 * sun}, ${255 - 140 * sun})` : face} stroke={rim} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1.5} y={-41} width={3} height={i % 3 === 0 ? 9 : 5} rx={1.2} fill={rim} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-3.2} y={-25} width={6.4} height={27} rx={3.2} fill={rim} transform={`rotate(${ha})`} />
      <path
        d={`M -1.8 2 Q ${-1.8 + bend} ${-len / 2} 0 ${-len} Q ${1.8 + bend} ${-len / 2} 1.8 2 Z`}
        fill="#E8463A"
        transform={`rotate(${ma})`}
      />
      <circle r={4.5} fill={YELLOW} stroke={rim} strokeWidth={1.8} />
    </svg>
  );
};

// Стол спереди (закрывает ноги сидящих): столешница и передняя панель.
export const DeskFront: React.FC<{ readonly x: number; readonly w: number; readonly top: number; readonly color?: string; readonly edge?: string }> = ({
  x,
  w,
  top,
  color = "#F3EEE6",
  edge = "#DCCFBE",
}) => (
  <div style={box({ left: x, top, width: w, height: FLOOR_Y + 300 - top })}>
    <div style={box({ left: -8, top: -6, width: w + 16, height: 26, borderRadius: 10, backgroundColor: color, boxShadow: "0 3px 0 rgba(0,0,0,0.06)" })} />
    <div style={box({ left: 6, top: 20, width: w - 12, height: FLOOR_Y + 280 - top, backgroundColor: edge })} />
  </div>
);

// Ноутбук сбоку (экран к персонажу слева): open 0…1 — крышка.
export const LaptopSide: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly glow?: number; readonly s?: number }> = ({
  x,
  y,
  open,
  glow = 1,
  s = 1,
}) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform={`scale(${s})`}>
      <rect x={-90} y={-12} width={180} height={12} rx={4} fill="#8F98A8" />
      <g transform={`rotate(${-8 - 82 * open} 86 -6)`}>
        <rect x={-88} y={-16} width={176} height={10} rx={4} fill="#B7C0CE" />
        <rect x={-80} y={-14} width={160} height={6} rx={2} fill={`rgba(170,210,255,${0.9 * glow * open})`} />
      </g>
    </g>
  </svg>
);

// Ноутбук задней крышкой к зрителю (стоит на столе, x — центр, y — стол).
export const LaptopBack: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly open?: number }> = ({ x, y, w = 260, open = 1 }) => (
  <div style={box({ left: x - w / 2, top: y - w * 0.62, width: w, height: w * 0.62 })}>
    <div
      style={box({
        inset: 0,
        borderRadius: 14,
        backgroundColor: "#B7C0CE",
        boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.08)",
        transform: `scaleY(${0.08 + 0.92 * open})`,
        transformOrigin: "50% 100%",
      })}
    />
    <div
      style={box({
        left: w / 2 - 16,
        top: w * 0.26,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.55)",
        opacity: open > 0.6 ? 1 : 0,
      })}
    />
    <div style={box({ left: -12, top: w * 0.62 - 6, width: w + 24, height: 12, borderRadius: 6, backgroundColor: "#8F98A8" })} />
  </div>
);

// Окно с видом на горы Ала-Тоо и тополя (Бишкек); evening 0…1 — вечер.
export const CityWindow: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly drift?: number;
  readonly evening?: number;
}> = ({ x, y, w, h, drift = 0, evening = 0 }) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: evening > 0.5 ? "#40508A" : "#DCEBFA",
      boxShadow: "inset 0 0 0 12px #FFFFFF, 0 6px 18px rgba(20,40,75,0.10)",
    })}
  >
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #3B4C86 0%, #F2A766 100%)", opacity: evening })} />
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0 })}>
      <g opacity={1 - evening * 0.35}>
        <Mountains width={w} y={h * 0.38} shift={drift} />
      </g>
      <rect x={0} y={h * 0.72} width={w} height={h * 0.3} fill={evening > 0.5 ? "#5C7A6A" : "#CFE3C8"} />
      {[0.12, 0.3, 0.55, 0.78, 0.92].map((k, i) => (
        <Poplar key={i} x={w * k + drift * 0.6} y={h * 0.78} s={1.4 + (i % 2) * 0.3} />
      ))}
    </svg>
    <div style={box({ left: w / 2 - 6, top: 0, width: 12, height: h, backgroundColor: "#FFFFFF" })} />
  </div>
);

// Машина мамы (её собственная, серо-голубая, не BalaGo), вид сбоку.
// openDoor 0…1 — задняя дверь; kid — сын виден в окне.
export const MomCar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly wheel?: number; readonly kid?: number; readonly bounce?: number }> = ({
  x,
  y,
  s = 1,
  wheel = 0,
  kid = 0,
  bounce = 0,
}) => {
  const wh = (cx: number) => (
    <g transform={`translate(${cx} 108)`}>
      <circle r={22} fill="#1E2B42" />
      <circle r={11} fill="#C9D2E0" />
      <g transform={`rotate(${wheel})`}>
        <rect x={-1.6} y={-11} width={3.2} height={22} fill="#7F8BA0" />
        <rect x={-11} y={-1.6} width={22} height={3.2} fill="#7F8BA0" />
      </g>
    </g>
  );
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <g transform={`scale(${s}) translate(-150 -130)`}>
        <ellipse cx={150} cy={128} rx={134} ry={8} fill="rgba(20,40,75,0.16)" />
        <g transform={`translate(0 ${bounce})`}>
          <path
            d="M 18 104 Q 10 104 10 92 L 12 74 Q 14 62 28 60 L 74 56 L 106 28 Q 114 20 128 20 L 198 20 Q 212 20 222 30 L 250 58 L 278 64 Q 292 68 292 82 L 292 96 Q 292 104 282 104 Z"
            fill="#8FA6C2"
            stroke={NAVY}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path d="M 86 58 L 112 34 Q 118 29 128 29 L 156 29 L 156 58 Z" fill="#CFE2F5" stroke={NAVY} strokeWidth={3} />
          <path d="M 166 29 L 196 29 Q 206 29 214 37 L 236 58 L 166 58 Z" fill="#CFE2F5" stroke={NAVY} strokeWidth={3} />
          {kid > 0 ? (
            <g opacity={kid}>
              <circle cx={136} cy={48} r={12} fill="#E8B48D" />
              <path d="M 124 44 Q 136 30 148 44 Z" fill="#221B19" />
              <path d="M 128 58 L 146 38" stroke="#7F8BA0" strokeWidth={3} />
            </g>
          ) : null}
          <circle cx={196} cy={46} r={12} fill="#E4B28C" />
          <path d="M 184 44 Q 196 28 208 44 L 208 40 Q 214 36 210 32 Q 202 30 200 34 Z" fill="#2B201C" />
          <path d="M 160 60 L 160 102" stroke="#6F86A4" strokeWidth={3} />
          <rect x={276} y={66} width={12} height={8} rx={3} fill="#FFE58A" stroke={NAVY} strokeWidth={2} />
          <rect x={12} y={66} width={8} height={8} rx={2} fill="#FF8A80" stroke={NAVY} strokeWidth={2} />
          <rect x={128} y={72} width={20} height={4} rx={2} fill={NAVY_SOFT} />
          <rect x={200} y={72} width={20} height={4} rx={2} fill={NAVY_SOFT} />
        </g>
        {wh(72)}
        {wh(232)}
      </g>
    </svg>
  );
};

// Фасад школы снизу (детский ракурс): высокий, с часами над входом.
export const SchoolFacade: React.FC<{ readonly minutes: number; readonly stretch?: number }> = ({ minutes, stretch = 0 }) => (
  <>
    <div style={box({ left: 90, top: 140, width: 900, height: 1260, backgroundColor: "#FFFFFF", borderRadius: "18px 18px 0 0", boxShadow: "0 0 0 6px #E1E8F2" })} />
    {[0, 1, 2].map((row) =>
      [0, 1, 2, 3].map((col) =>
        row === 2 && (col === 1 || col === 2) ? null : (
          <div
            key={`${row}-${col}`}
            style={box({ left: 150 + col * 210, top: 520 + row * 260, width: 130, height: 160, borderRadius: 10, backgroundColor: "#A9C8EE", boxShadow: "inset 0 0 0 8px #FFFFFF, 0 0 0 4px #D4DEEB" })}
          />
        ),
      ),
    )}
    <div style={box({ left: 380, top: 1060, width: 320, height: 340, borderRadius: "160px 160px 0 0", backgroundColor: YELLOW, boxShadow: `inset 0 0 0 8px ${NAVY}` })} />
    <div style={box({ left: 536, top: 1090, width: 8, height: 310, backgroundColor: NAVY })} />
    <div style={box({ left: 250, top: 360, width: 580, height: 92, borderRadius: 20, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 58, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 4 })}>
      МЕКТЕП
    </div>
    <StretchClock x={540} y={250} r={92} minutes={minutes} stretch={stretch} />
  </>
);

// Полоса тротуара и дороги у школы.
export const Street: React.FC<{ readonly offset?: number }> = ({ offset = 0 }) => (
  <>
    <div style={box({ left: 0, right: 0, top: 1360, height: 70, backgroundColor: "#E6EAF0" })} />
    <div style={box({ left: 0, right: 0, top: 1430, height: 600, backgroundColor: "#C7CFDB" })} />
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} style={box({ left: ((i * 220 - offset) % 1760) - 220, top: 1600, width: 120, height: 14, borderRadius: 7, backgroundColor: "#FFFFFF" })} />
    ))}
  </>
);

// Тёплая лампа (вечер).
export const WarmLamp: React.FC<{ readonly x: number; readonly on: number }> = ({ x, on }) => (
  <>
    <div style={box({ left: x - 260, top: 120, width: 520, height: 520, borderRadius: 260, background: "radial-gradient(circle, rgba(255,210,120,0.55) 0%, rgba(255,210,120,0) 70%)", opacity: on })} />
    <div style={box({ left: x - 2, top: 0, width: 4, height: 260, backgroundColor: "#6B5A4A" })} />
    <div style={box({ left: x - 90, top: 250, width: 180, height: 90, borderRadius: "90px 90px 12px 12px", backgroundColor: "#F2C46D", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.08)" })} />
  </>
);

// Бумажный лист с детским рисунком (вид сверху на стол). Координаты внутри
// листа: 0…900 × 0…1100.
export const PAPER = { x: 90, y: 330, w: 900, h: 1100 } as const;

// Мягкая камера: точка (cx, cy) мира в центре кадра, увеличение z.
export const Cam: React.FC<{ readonly cx: number; readonly cy: number; readonly z: number; readonly children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <div style={box({ inset: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` })}>{children}</div>
);

// Рука сверху (вид на стол): кисть с пальцами и рукав. angle — куда
// направлены пальцы (градусы, 0 — вверх); crayon — держит мелок.
export const TopHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly sleeve: string;
  readonly skin?: string;
  readonly point?: boolean;
  readonly crayon?: string;
  readonly s?: number;
}> = ({ x, y, angle, sleeve, skin = "#E8B48D", point, crayon, s = 1 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform={`translate(0 0) rotate(${angle}) scale(${s})`}>
      <rect x={-46} y={70} width={92} height={420} rx={40} fill={sleeve} />
      <rect x={-48} y={64} width={96} height={30} rx={14} fill="rgba(0,0,0,0.12)" />
      <ellipse cx={0} cy={30} rx={46} ry={56} fill={skin} />
      {point ? (
        <>
          <rect x={-10} y={-82} width={22} height={96} rx={11} fill={skin} />
          <path d="M -40 0 Q -46 -24 -30 -26 Q -18 -24 -18 0 Z" fill={skin} />
          <path d="M 18 4 Q 20 -20 34 -18 Q 46 -14 40 10 Z" fill={skin} />
        </>
      ) : (
        <>
          {[-30, -10, 10, 30].map((fx, i) => (
            <rect key={i} x={fx - 9} y={-40 + Math.abs(fx) * 0.5} width={18} height={70} rx={9} fill={skin} />
          ))}
        </>
      )}
      <path d="M -46 40 Q -70 20 -64 -6 Q -56 -14 -44 0 Z" fill={skin} />
      {crayon ? (
        <g transform="rotate(-18)">
          <rect x={-7} y={-120} width={14} height={110} rx={4} fill={crayon} />
          <path d="M -7 -120 L 0 -142 L 7 -120 Z" fill={crayon} />
          <rect x={-7} y={-60} width={14} height={20} fill="rgba(255,255,255,0.45)" />
        </g>
      ) : null}
    </g>
  </svg>
);

// Кухня-гостиная семьи (дом): стена, окно на горы, полка, часы над столом.
// evening 0…1 — вечерний свет, lamp — тёплая лампа.
export const KITCHEN = { tableX: 70, tableW: 800, laptopX: 560, phoneX: 730, clock: { x: 840, y: 360, r: 112 } } as const;
export const tableTop = (h = ADULT_H) => FLOOR_Y - 0.4 * h;

export const Kitchen: React.FC<{ readonly minutes: number; readonly stretch?: number; readonly evening?: number; readonly lamp?: number; readonly drift?: number }> = ({
  minutes,
  stretch = 0,
  evening = 0,
  lamp = 0,
  drift = 0,
}) => (
  <>
    <div style={box({ inset: 0, backgroundColor: "#FBF3E6" })} />
    <div style={box({ inset: 0, backgroundColor: "#2B3566", opacity: 0.22 * evening })} />
    <CityWindow x={120} y={250} w={460} h={560} evening={evening} drift={drift} />
    {/* шырдак-узор на стене */}
    <div style={box({ left: 640, top: 560, width: 300, height: 200, borderRadius: 14, backgroundColor: "#D9644F", boxShadow: "inset 0 0 0 10px #F2C46D" })}>
      <div style={box({ left: 110, top: 60, width: 80, height: 80, transform: "rotate(45deg)", backgroundColor: "#F2C46D" })} />
    </div>
    <div style={box({ left: 0, right: 0, top: FLOOR_Y - 230, height: 600, backgroundColor: "#EADBC4" })} />
    <div style={box({ left: 0, right: 0, top: FLOOR_Y - 236, height: 10, backgroundColor: "#D8C3A3" })} />
    <StretchClock x={KITCHEN.clock.x} y={KITCHEN.clock.y} r={KITCHEN.clock.r} minutes={minutes} stretch={stretch} />
    {lamp > 0 ? <WarmLamp x={430} on={lamp} /> : null}
  </>
);

// Телефон, лежащий на столе (вибрирует при звонке).
export const PhoneFlat: React.FC<{ readonly x: number; readonly y: number; readonly glow?: number; readonly shake?: number }> = ({ x, y, glow = 0, shake = 0 }) => (
  <div
    style={box({
      left: x - 46 + shake,
      top: y - 14,
      width: 92,
      height: 20,
      borderRadius: 7,
      backgroundColor: "#1E2235",
      transform: "skewX(-25deg)",
      boxShadow: glow ? `0 -6px 18px rgba(120,190,255,${0.8 * glow})` : undefined,
    })}
  />
);

// Стопка бумаг на столе (растёт по ходу работы).
export const Papers: React.FC<{ readonly x: number; readonly y: number; readonly n: number }> = ({ x, y, n }) => (
  <>
    {Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => (
      <div key={i} style={box({ left: x + ((i * 7) % 13) - 6, top: y - 10 - i * 7, width: 150, height: 10, borderRadius: 3, backgroundColor: i % 2 ? "#FFFFFF" : "#F1F4F9", border: "2px solid #D6DCE6", transform: "skewX(-24deg)" })} />
    ))}
  </>
);

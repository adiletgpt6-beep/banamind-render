// Помощники сцен 3–4: тыльная сторона телефона, телефон в повороте (лежит
// на диване → в руках экраном к сыну → экраном к маме), геометрия экрана
// телефона во вставках, рука с указательным пальцем (тап), размытый фон
// вставки, кубик в руке, отсвет экрана на лице.
import { INK, Phone, SCREEN_H, SCREEN_W } from "../screens";
import { box } from "../shots";

// Высота корпуса телефона по ширине (как в Phone).
export const phoneH = (w: number) => w * (SCREEN_H / SCREEN_W) + w * 0.08;

// Экран телефона в координатах кадра/мира: точка содержимого 540 × 1170 →
// точка на корпусе (для тапа и совпадения по лицу на записи).
export const phoneGeom = (x: number, y: number, w: number) => {
  const h = phoneH(w);
  const k = (w * 0.92) / SCREEN_W;
  const left = x - w / 2 + w * 0.04;
  const top = y - h / 2 + w * 0.04 + (h - w * 0.08 - SCREEN_H * k) / 2;
  return { h, k, left, top, at: (cx: number, cy: number) => ({ x: left + cx * k, y: top + cy * k }) };
};
// Видео в плеере (VideoPlayer): область 540 × 960 по центру экрана.
export const VIDEO_TOP = (SCREEN_H - SCREEN_W * (16 / 9)) / 2;

// Тыльная сторона телефона: корпус, блок камеры (экран — к держащему).
export const PhoneBack: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly rotX?: number; readonly rotY?: number; readonly rot?: number }> = ({ x, y, w, rotX = 0, rotY = 0, rot = 0 }) => {
  const h = phoneH(w);
  return (
    <div
      style={box({
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: rotX || rotY ? `perspective(${w * 6}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotate(${rot}deg)` : rot ? `rotate(${rot}deg)` : undefined,
        transformOrigin: "50% 50%",
      })}
    >
      <div style={box({ inset: 0, borderRadius: w * 0.12, background: "linear-gradient(160deg, #3A4260, #262C42 55%, #1E2335)" })} />
      <div style={box({ inset: w * 0.03, borderRadius: w * 0.1, border: `${Math.max(1, w * 0.012)}px solid rgba(255,255,255,0.08)` })} />
      {/* блок камеры */}
      <div style={box({ left: w * 0.1, top: w * 0.1, width: w * 0.34, height: w * 0.34, borderRadius: w * 0.09, backgroundColor: "#323A55" })} />
      {[0.19, 0.35].map((k) => (
        <div key={k} style={box({ left: w * 0.15, top: w * k - w * 0.05, width: w * 0.12, height: w * 0.12, borderRadius: w * 0.06, backgroundColor: "#11141F", boxShadow: `inset 0 0 0 ${w * 0.018}px #5A6380` })} />
      ))}
      <div style={box({ left: w * 0.31, top: w * 0.16, width: w * 0.07, height: w * 0.07, borderRadius: w * 0.035, backgroundColor: "#F1E3B5" })} />
    </div>
  );
};

// Телефон, поворачивающийся вокруг вертикальной оси: a = 0 — к зрителю
// тыльной стороной, 180 — экраном (экран остаётся в рамке).
export const PhoneTurn: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly a: number; readonly rot?: number; readonly children?: React.ReactNode }> = ({ x, y, w, a, rot = 0, children }) =>
  a < 90 ? (
    <PhoneBack x={x} y={y} w={w} rotY={a} rot={rot} />
  ) : (
    <Phone x={x} y={y} w={w} rotY={a >= 179.5 ? 0 : a - 180} rot={rot} shadow={false}>
      {children}
    </Phone>
  );

// Телефон, поднимаемый с сиденья: b = 78 — лежит экраном вверх (виден
// сверху-спереди), 180 — стоит экраном к держащему (к зрителю тыльная сторона).
export const PhoneTilt: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly b: number }> = ({ x, y, w, b }) =>
  b < 90 ? <Phone x={x} y={y} w={w} rotX={b} shadow={false} /> : <PhoneBack x={x} y={y} w={w} rotX={b >= 179.5 ? 0 : b - 180} />;

// Рука с вытянутым указательным пальцем (вставка, координаты кадра):
// кончик пальца в (x, y), кисть и предплечье уходят под углом ang
// (градусы от вертикали вниз, по часовой — вправо).
export const PointingHand: React.FC<{ readonly x: number; readonly y: number; readonly ang: number; readonly s?: number; readonly skin: string; readonly shade: string; readonly sleeve?: string }> = ({ x, y, ang, s = 1, skin, shade, sleeve }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {/* правая кисть с тыльной стороны: указательный вытянут, остальные
        пальцы согнуты (костяшки справа), большой палец слева */}
    <g transform={`translate(${x} ${y}) rotate(${-ang}) scale(${s})`}>
      {/* предплечье: к камере шире */}
      <path d="M -62 250 L 70 250 L 110 1100 L -100 1100 Z" fill={skin} />
      {sleeve ? <path d="M -86 700 L 96 700 L 130 1150 L -120 1150 Z" fill={sleeve} /> : null}
      <path d="M 40 270 L 70 270 L 106 1080 L 66 1080 Z" fill={shade} opacity={0.3} />
      {/* тыльная сторона кисти */}
      <path d="M -50 150 Q -64 214 -56 262 L 74 262 Q 104 214 100 150 Q 96 112 40 110 L -28 112 Q -48 118 -50 150 Z" fill={skin} stroke={shade} strokeWidth={3} />
      {/* согнутые пальцы: костяшки */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={34 + i * 26} cy={128 + i * 8} rx={17} ry={22} fill={skin} stroke={shade} strokeWidth={3} />
      ))}
      {/* большой палец */}
      <rect x={-72} y={118} width={34} height={104} rx={17} fill={skin} stroke={shade} strokeWidth={3} transform="rotate(14 -55 200)" />
      {/* указательный палец */}
      <rect x={-22} y={0} width={44} height={150} rx={22} fill={skin} stroke={shade} strokeWidth={3} />
      <path d="M -14 70 Q 0 76 14 70" stroke={shade} strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={-13} y={8} width={26} height={26} rx={11} fill="#F6D2BC" />
    </g>
  </svg>
);

// Размытый фон вставки (то, что за телефоном, не в фокусе).
export const InsertBack: React.FC<{ readonly wall: string; readonly low: string; readonly blobs: readonly { x: number; y: number; r: number; c: string; o?: number }[] }> = ({ wall, low, blobs }) => (
  <div style={box({ inset: 0, overflow: "hidden", background: `linear-gradient(180deg, ${wall}, ${low})` })}>
    {blobs.map((b, i) => (
      <div key={i} style={box({ left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: b.r, background: `radial-gradient(circle, ${b.c} 0%, ${b.c} 45%, transparent 72%)`, opacity: b.o ?? 1 })} />
    ))}
  </div>
);

// Кубик (мир сцены): центр, размер, цвет.
export const Block: React.FC<{ readonly x: number; readonly y: number; readonly c: string; readonly w?: number; readonly h?: number }> = ({ x, y, c, w = 36, h = 30 }) => (
  <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 5, backgroundColor: c, boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.12)" })} />
);

// Отсвет экрана на лице (мир сцены).
export const ScreenGlow: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly a: number }> = ({ x, y, r, a }) =>
  a > 0.01 ? <div style={box({ left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, rgba(190,220,255,${0.26 * a}), transparent 70%)`, mixBlendMode: "screen", pointerEvents: "none" })} /> : null;

export { INK };

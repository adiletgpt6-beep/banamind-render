// Декорации BG-041. Мир = кадр (px), камера Cam сдвигает и приближает мир.
//   • Room — квартира семьи в Бишкеке: окно на горы Ала-Тоо, часы,
//     лампа, панель-шырдак, крючок с жёлтым рюкзаком сына.
//   • Street — бишкекская улица: тополя, пятиэтажка (ҮЙ), школа (МЕКТЕП),
//     тротуар за машиной (дети садятся со стороны тротуара), дорога.
import { fontFamily } from "../../fonts";
import { box, mix, mixColor, Mountains, NAVY, NAVY_SOFT, Poplar, YELLOW, YELLOW_DEEP } from "./art";

export const FLOOR_Y = 1640;
export const ADULT_H = 1150;
export const CHILD_H = 900;
export const tableTop = (h = ADULT_H) => FLOOR_Y - 0.4 * h;

// Мягкая камера: точка (cx, cy) мира в центре кадра, увеличение z.
export const Cam: React.FC<{ readonly cx: number; readonly cy: number; readonly z: number; readonly children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <div style={box({ inset: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` })}>{children}</div>
);

// Стол спереди (закрывает ноги сидящих): столешница и передняя панель.
export const DeskFront: React.FC<{ readonly x: number; readonly w: number; readonly top: number; readonly color?: string; readonly edge?: string }> = ({
  x,
  w,
  top,
  color = "#F7F1E8",
  edge = "#E1CFB6",
}) => (
  <div style={box({ left: x, top, width: w, height: FLOOR_Y + 300 - top })}>
    <div style={box({ left: -8, top: -6, width: w + 16, height: 26, borderRadius: 10, backgroundColor: color, boxShadow: "0 3px 0 rgba(0,0,0,0.06)" })} />
    <div style={box({ left: 6, top: 20, width: w - 12, height: FLOOR_Y + 280 - top, backgroundColor: edge })} />
    {/* скатерть: мягкие складки и полосы кыргызского орнамента */}
    <div style={box({ left: 6, top: 20, width: w - 12, height: FLOOR_Y + 280 - top, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 70px, rgba(255,255,255,0.18) 70px 92px, rgba(0,0,0,0.035) 92px 120px)" })} />
    <div style={box({ left: 6, top: 20, width: w - 12, height: 26, backgroundImage: `repeating-linear-gradient(90deg, ${YELLOW_DEEP} 0 18px, #D9644F 18px 36px)`, opacity: 0.55 })} />
    <div style={box({ left: 6, top: 300, width: w - 12, height: 54, backgroundColor: "#D9644F", opacity: 0.85 })}>
      {Array.from({ length: Math.ceil(w / 90) }, (_, i) => (
        <div key={i} style={box({ left: i * 90 + 27, top: 9, width: 36, height: 36, transform: "rotate(45deg)", backgroundColor: "#F2C46D" })} />
      ))}
    </div>
  </div>
);

// Настенные часы. minutes — минут от 0:00.
export const WallClock: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly minutes: number; readonly blur?: number }> = ({ x, y, r, minutes, blur = 0 }) => {
  const ma = ((minutes % 60) / 60) * 360;
  const ha = (((minutes / 60) % 12) / 12) * 360;
  return (
    <svg width={2 * r} height={2 * r} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - r, top: y - r, overflow: "visible" }}>
      <circle r={46} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1.5} y={-41} width={3} height={i % 3 === 0 ? 9 : 5} rx={1.2} fill={NAVY} transform={`rotate(${i * 30})`} />
      ))}
      {blur > 0 ? <circle r={34} fill="none" stroke="rgba(232,70,58,0.25)" strokeWidth={6 * blur} /> : null}
      <rect x={-3.2} y={-25} width={6.4} height={27} rx={3.2} fill={NAVY} transform={`rotate(${ha})`} />
      <rect x={-1.8} y={-38} width={3.6} height={40} rx={1.8} fill="#E8463A" transform={`rotate(${ma})`} />
      <circle r={4.5} fill={YELLOW} stroke={NAVY} strokeWidth={1.8} />
    </svg>
  );
};

// Окно с видом на горы Ала-Тоо и тополя (Бишкек); evening 0…1 — вечер.
export const CityWindow: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly evening?: number; readonly drift?: number }> = ({
  x,
  y,
  w,
  h,
  evening = 0,
  drift = 0,
}) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: "#DCEBFA",
      boxShadow: "inset 0 0 0 14px #FFFFFF, 0 6px 18px rgba(20,40,75,0.10)",
    })}
  >
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #5162A0 0%, #C98DA6 55%, #F6B07A 100%)", opacity: evening })} />
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0 })}>
      <Mountains width={w} y={h * 0.36} shift={-200 + drift} far={mixColor("#D5E0F0", "#8E8FBF", evening)} near={mixColor("#BCCDE6", "#6F78A8", evening)} />
      {/* дома с огнями в окнах */}
      {[0.04, 0.3, 0.62].map((k, i) => (
        <g key={i}>
          <rect x={w * k} y={h * (0.58 - 0.04 * (i % 2))} width={w * 0.24} height={h * 0.5} fill={mixColor("#F1E6D6", "#59628F", evening)} />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 3 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={w * k + 10 + c * (w * 0.07)}
                y={h * (0.62 - 0.04 * (i % 2)) + r * 30}
                width={w * 0.045}
                height={16}
                fill={(r * 3 + c + i) % 3 === 0 ? mixColor("#9CC0EA", "#FFD98A", evening) : mixColor("#9CC0EA", "#3D4670", evening)}
              />
            )),
          )}
        </g>
      ))}
      {[0.16, 0.5, 0.86].map((k, i) => (
        <Poplar key={i} x={w * k} y={h * 0.98} s={1.9 + (i % 2) * 0.4} tone={mixColor("#7CC48B", "#4D6E66", evening)} />
      ))}
    </svg>
    <div style={box({ left: w / 2 - 7, top: 0, width: 14, height: h, backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: 0, top: h * 0.42, width: w, height: 12, backgroundColor: "#FFFFFF" })} />
  </div>
);

// Тёплая лампа (вечер).
export const WarmLamp: React.FC<{ readonly x: number; readonly on: number; readonly top?: number }> = ({ x, on, top = 0 }) => (
  <>
    <div style={box({ left: x - 300, top: top + 120, width: 600, height: 600, borderRadius: 300, background: "radial-gradient(circle, rgba(255,210,120,0.5) 0%, rgba(255,210,120,0) 70%)", opacity: on })} />
    <div style={box({ left: x - 2, top, width: 4, height: 250, backgroundColor: "#6B5A4A" })} />
    <div style={box({ left: x - 90, top: top + 240, width: 180, height: 90, borderRadius: "90px 90px 12px 12px", backgroundColor: "#F2C46D", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.08)" })} />
  </>
);

// Школьный рюкзак сына (жёлтый), висит на крючке; (x, y) — крючок.
export const HangingBackpack: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly swing?: number; readonly hook?: boolean; readonly opacity?: number }> = ({
  x,
  y,
  s = 1,
  swing = 0,
  hook = true,
  opacity = 1,
}) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity }}>
    {hook ? <circle cx={0} cy={0} r={9} fill="#8A6A4F" /> : null}
    <g transform={`rotate(${swing}) scale(${s})`}>
      <path d="M -30 10 Q 0 -14 30 10" stroke="#C99A1E" strokeWidth={8} fill="none" />
      <rect x={-62} y={8} width={124} height={150} rx={30} fill={YELLOW_DEEP} stroke={NAVY} strokeWidth={5} />
      <rect x={-44} y={78} width={88} height={64} rx={16} fill="#FFD25A" stroke={NAVY} strokeWidth={4} />
      <rect x={-20} y={96} width={40} height={8} rx={4} fill={NAVY} opacity={0.7} />
      <path d="M -62 40 Q 0 54 62 40" stroke={NAVY} strokeWidth={4} fill="none" />
    </g>
  </svg>
);

// Квартира семьи. evening 0…1 — вечерний свет; lamp — лампа; clockMin —
// время на часах; backpack — рюкзак на крючке.
export const ROOM = { window: { x: 60, y: 520, w: 450, h: 520 }, clock: { x: 728, y: 795, r: 78 }, hook: { x: 905, y: 560 }, lampX: 560 } as const;

export const Room: React.FC<{ readonly evening?: number; readonly lamp?: number; readonly clockMin: number; readonly clockBlur?: number; readonly backpack?: boolean; readonly drift?: number }> = ({
  evening = 0,
  lamp = 0,
  clockMin,
  clockBlur = 0,
  backpack = true,
  drift = 0,
}) => (
  <>
    <div style={box({ inset: 0, backgroundColor: "#FBF3E6" })} />
    <div style={box({ inset: 0, backgroundColor: "#2B3566", opacity: 0.16 * evening })} />
    <CityWindow x={ROOM.window.x} y={ROOM.window.y} w={ROOM.window.w} h={ROOM.window.h} evening={evening} drift={drift} />
    {/* полочка с цветком */}
    <div style={box({ left: 560, top: 640, width: 150, height: 14, borderRadius: 6, backgroundColor: "#B08A65" })} />
    <div style={box({ left: 600, top: 588, width: 46, height: 52, borderRadius: "8px 8px 14px 14px", backgroundColor: "#D9644F" })} />
    <div style={box({ left: 596, top: 540, width: 54, height: 54, borderRadius: "50% 50% 40% 40%", backgroundColor: "#7CC48B" })} />
    <WallClock x={ROOM.clock.x} y={ROOM.clock.y} r={ROOM.clock.r} minutes={clockMin} blur={clockBlur} />
    {/* крючок для одежды и рюкзак */}
    <div style={box({ left: ROOM.hook.x - 70, top: ROOM.hook.y - 18, width: 140, height: 18, borderRadius: 8, backgroundColor: "#B08A65" })} />
    {backpack ? <HangingBackpack x={ROOM.hook.x} y={ROOM.hook.y} /> : null}
    <div style={box({ left: 0, right: 0, top: FLOOR_Y - 230, height: 600, backgroundColor: "#EADBC4" })} />
    <div style={box({ left: 0, right: 0, top: FLOOR_Y - 236, height: 10, backgroundColor: "#D8C3A3" })} />
    {lamp > 0 ? <WarmLamp x={ROOM.lampX} on={lamp} top={-60} /> : null}
  </>
);

// Ноутбук в профиль на столе. (x, y) — шарнир крышки на столе; side —
// где сидит хозяин (+1 справа: крышка откидывается влево, экран к нему).
// open 0…1: 0 — закрыт (крышка лежит на корпусе), 1 — открыт.
export const LaptopProfile: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly side?: 1 | -1; readonly s?: number }> = ({ x, y, open, side = 1, s = 1 }) => {
  const ang = 108 * open;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <g transform={`scale(${side * s} ${s})`}>
        <rect x={0} y={-14} width={190} height={14} rx={4} fill="#9AA3B2" />
        <rect x={10} y={-17} width={170} height={4} rx={2} fill="#7E8798" />
        <g transform={`rotate(${-ang} 2 -14)`}>
          <rect x={0} y={-24} width={190} height={11} rx={4} fill="#C3CBD8" />
          {/* свечение экрана к хозяину */}
          <rect x={6} y={-14} width={178} height={4} rx={2} fill="#AFD3FF" opacity={0.9 * Math.min(1, open * 1.4)} />
        </g>
      </g>
    </svg>
  );
};

// Кубики конструктора: башня из n кубиков на столе (x — центр, y — стол).
export const CUBE = 64;
const CUBE_COLORS = ["#5B8DEF", "#E86F5A", "#7CC48B", "#9B7BE0", YELLOW_DEEP];
export const Cube: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly rot?: number; readonly s?: number }> = ({ x, y, color, rot = 0, s = 1 }) => (
  <div
    style={box({
      left: x - (CUBE * s) / 2,
      top: y - CUBE * s,
      width: CUBE * s,
      height: CUBE * s,
      borderRadius: 10 * s,
      backgroundColor: color,
      boxShadow: `inset 0 -${8 * s}px 0 rgba(0,0,0,0.14), 0 0 0 ${4 * s}px ${NAVY}`,
      transform: `rotate(${rot}deg)`,
      transformOrigin: "50% 100%",
    })}
  >
    <div style={box({ left: CUBE * s * 0.3, top: -10 * s, width: CUBE * s * 0.4, height: 12 * s, borderRadius: 6 * s, backgroundColor: color, boxShadow: `0 0 0 ${3 * s}px ${NAVY}` })} />
  </div>
);
// Башня: пластина-основание, два кубика внизу и один сверху по центру.
// Место для последнего (жёлтого) кубика — TOWER_TOP(x, y).
export const BlockTower: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <>
    <div style={box({ left: x - 150, top: y - 22, width: 300, height: 22, borderRadius: 8, backgroundColor: "#7CC48B", boxShadow: `0 0 0 4px ${NAVY}` })} />
    <Cube x={x - 36} y={y - 22} color={CUBE_COLORS[0]} />
    <Cube x={x + 36} y={y - 22} color={CUBE_COLORS[1]} />
    <Cube x={x} y={y - 22 - CUBE - 8} color={CUBE_COLORS[2]} />
  </>
);
export const TOWER_TOP = (x: number, y: number) => ({ x, y: y - 22 - 2 * (CUBE + 8) });
export const TOP_CUBE_COLOR = YELLOW_DEEP;

// ---------- Улица ----------
// Земля и дорога (мировые y): тротуар — линия ступней SIDEWALK_Y; машина
// стоит у бордюра (низ колёс CAR_Y), закрывает ноги идущих за ней детей.
export const SIDEWALK_Y = 1250;
export const CAR_Y = 1392;
export const STREET_ADULT_H = 560;
export const STREET_CHILD_H = 420;
export const CAR_W = 700;

// Время суток улицы: 0 — утро (розово-голубое небо), 1 — день после уроков.
const sky = (tod: number) => ({
  top: mixColor("#9FC3EE", "#7FB7F0", tod),
  bottom: mixColor("#FFD9C2", "#E3F1FF", tod),
  sun: mixColor("#FFC98A", "#FFF1B0", tod),
});

export const ApartmentBlock: React.FC<{ readonly x: number; readonly w?: number; readonly floors?: number; readonly tone?: string }> = ({ x, w = 820, floors = 5, tone = "#F3E3CF" }) => {
  const fh = 138;
  const h = floors * fh + 40;
  const cols = 6;
  return (
    <div style={box({ left: x, top: SIDEWALK_Y - h, width: w, height: h })}>
      <div style={box({ inset: 0, backgroundColor: tone, borderRadius: "10px 10px 0 0", boxShadow: "inset 0 0 0 6px #E2CFB7" })} />
      <div style={box({ left: -12, top: -18, width: w + 24, height: 24, borderRadius: 6, backgroundColor: "#C9B49A" })} />
      {Array.from({ length: floors }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const door = r === floors - 1 && (c === 2 || c === 3);
          if (door) return null;
          return (
            <div
              key={`${r}-${c}`}
              style={box({
                left: 40 + c * ((w - 80) / cols) + 14,
                top: 40 + r * fh,
                width: (w - 80) / cols - 28,
                height: 84,
                borderRadius: 6,
                backgroundColor: "#A9C8EE",
                boxShadow: "inset 0 0 0 6px #FFFFFF, 0 0 0 3px #D9C6AE",
              })}
            />
          );
        }),
      )}
      {/* подъезд */}
      <div style={box({ left: w / 2 - 90, top: h - 170, width: 180, height: 170, borderRadius: "16px 16px 0 0", backgroundColor: "#8C6A52", boxShadow: `inset 0 0 0 8px #6F5240` })} />
      <div style={box({ left: w / 2 - 120, top: h - 196, width: 240, height: 30, borderRadius: 8, backgroundColor: "#C9B49A" })} />
      <div style={box({ left: w / 2 + 40, top: h - 96, width: 14, height: 14, borderRadius: 7, backgroundColor: YELLOW })} />
    </div>
  );
};

export const SchoolBuilding: React.FC<{ readonly x: number; readonly w?: number }> = ({ x, w = 900 }) => {
  const h = 560;
  return (
    <div style={box({ left: x, top: SIDEWALK_Y - h, width: w, height: h })}>
      <div style={box({ inset: 0, backgroundColor: "#FFFFFF", borderRadius: "12px 12px 0 0", boxShadow: "inset 0 0 0 6px #E1E8F2" })} />
      <div style={box({ left: -14, top: -20, width: w + 28, height: 26, borderRadius: 6, backgroundColor: "#5B8DEF" })} />
      {[0, 1, 2].map((r) =>
        Array.from({ length: 6 }, (_, c) =>
          r === 2 && (c === 2 || c === 3) ? null : (
            <div key={`${r}-${c}`} style={box({ left: 46 + c * 140, top: 150 + r * 130, width: 92, height: 92, borderRadius: 8, backgroundColor: "#A9C8EE", boxShadow: "inset 0 0 0 6px #FFFFFF, 0 0 0 3px #D4DEEB" })} />
          ),
        ),
      )}
      <div style={box({ left: w / 2 - 230, top: 46, width: 460, height: 80, borderRadius: 18, backgroundColor: NAVY, color: "#FFFFFF", fontFamily, fontSize: 52, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 4 })}>
        МЕКТЕП
      </div>
      <div style={box({ left: w / 2 - 110, top: h - 210, width: 220, height: 210, borderRadius: "110px 110px 0 0", backgroundColor: YELLOW, boxShadow: `inset 0 0 0 8px ${NAVY}` })} />
      <div style={box({ left: w / 2 - 4, top: h - 196, width: 8, height: 196, backgroundColor: NAVY })} />
    </div>
  );
};

// Метка-булавка над зданием (ҮЙ / МЕКТЕП).
export const PinLabel: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly dark?: boolean; readonly opacity?: number }> = ({ x, y, label, dark = true, opacity = 1 }) => (
  <div style={box({ left: x - 200, top: y - 80, width: 400, display: "flex", flexDirection: "column", alignItems: "center", opacity, fontFamily })}>
    <div style={{ padding: "10px 30px", borderRadius: 34, backgroundColor: dark ? NAVY : YELLOW, color: dark ? "#FFFFFF" : NAVY, fontSize: 44, fontWeight: 1000, letterSpacing: 3, boxShadow: "0 6px 14px rgba(20,40,75,0.25)" }}>{label}</div>
    <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `16px solid ${dark ? NAVY : YELLOW}` }} />
  </div>
);

// Улица целиком (мировые координаты): небо, горы с параллаксом, дом и
// школа в заданных местах, тополя, тротуар, бордюр, дорога.
export const Street: React.FC<{
  readonly tod: number;
  readonly camX: number; // для параллакса гор
  readonly homeX: number; // левый край пятиэтажки
  readonly schoolX: number; // левый край школы
  readonly from: number; // левый край мира
  readonly to: number; // правый край мира
}> = ({ tod, camX, homeX, schoolX, from, to }) => {
  const sk = sky(tod);
  const w = to - from;
  return (
    <>
      <div style={box({ left: from, top: -400, width: w, height: SIDEWALK_Y + 400, background: `linear-gradient(180deg, ${sk.top} 0%, ${sk.bottom} 100%)` })} />
      <div style={box({ left: camX + 160 + (1 - tod) * 120, top: 360 + (1 - tod) * 140, width: 160, height: 160, borderRadius: 80, backgroundColor: sk.sun, opacity: 0.85, boxShadow: `0 0 80px ${sk.sun}` })} />
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* горы далеко — сдвигаются медленнее улицы */}
        <g transform={`translate(${camX * 0.75} 0)`}>
          <Mountains width={2400} y={560} shift={-1700 - (camX * 0.75) % 1100} far={mixColor("#F0D7E2", "#D5E0F0", tod)} near={mixColor("#D9C7DE", "#BCCDE6", tod)} />
        </g>
      </svg>
      <div style={box({ left: from, top: 860, width: w, height: SIDEWALK_Y - 860, backgroundColor: mixColor("#CFE0C4", "#CFE3C8", tod) })} />
      {Array.from({ length: Math.ceil(w / 260) }, (_, i) => (
        <svg key={i} width={1} height={1} style={{ position: "absolute", left: from + i * 260 + 60, top: 880, overflow: "visible" }}>
          <Poplar x={0} y={0} s={2.3 + (i % 3) * 0.3} tone={i % 2 ? "#7CC48B" : "#6DB57D"} />
        </svg>
      ))}
      <ApartmentBlock x={homeX} />
      <SchoolBuilding x={schoolX} />
      {/* ограда школы */}
      <div style={box({ left: schoolX - 300, top: SIDEWALK_Y - 120, width: 300, height: 8, backgroundColor: NAVY_SOFT })} />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={box({ left: schoolX - 300 + i * 40, top: SIDEWALK_Y - 130, width: 8, height: 130, backgroundColor: NAVY_SOFT })} />
      ))}
      {/* тополя у тротуара — перед домами */}
      {Array.from({ length: Math.ceil(w / 700) }, (_, i) => (
        <svg key={`p${i}`} width={1} height={1} style={{ position: "absolute", left: from + i * 700 + 330, top: SIDEWALK_Y - 40, overflow: "visible" }}>
          <Poplar x={0} y={0} s={4.6} tone="#78BF86" />
        </svg>
      ))}
      <div style={box({ left: from, top: SIDEWALK_Y - 40, width: w, height: 80, backgroundColor: "#E7EAF0" })} />
      <div style={box({ left: from, top: SIDEWALK_Y + 40, width: w, height: 16, backgroundColor: "#B9C1CE" })} />
      <div style={box({ left: from, top: SIDEWALK_Y + 56, width: w, height: 1000, backgroundColor: "#8E99AC" })} />
      {Array.from({ length: Math.ceil(w / 300) }, (_, i) => (
        <div key={`d${i}`} style={box({ left: from + i * 300, top: CAR_Y + 120, width: 150, height: 14, borderRadius: 7, backgroundColor: "#FFFFFF", opacity: 0.85 })} />
      ))}
      <div style={box({ left: from, top: CAR_Y + 330, width: w, height: 600, backgroundColor: "#CFE0C4" })} />
    </>
  );
};

// Положение (мировое) для «бумажной» карточки поверх стола — общий тип.
export const lerpN = mix;

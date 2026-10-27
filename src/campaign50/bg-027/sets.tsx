// Декорации и предметы BalaGoBG027.
//   • Улица у дома в Бишкеке: частный дом за оштукатуренным забором с
//     синими металлическими воротами (орнамент «кочкор мүйүз»), тополя,
//     горы Ала-Тоо, тротуар с арыком, дорога; белая машина без марки.
//   • Офис мамы: окно на город и горы, часы, стол, ноутбук.
//   • Карточка встречи — главный предмет ролика: «Ата-эне» /
//     «Макулдашылган ишенимдүү адам», без личных данных.
// Координаты мира — px; линия тротуара (стопы) — GATE.footY.
import { Mountains, Ornament, WallClock } from "../../two-schedules-2d/sets/Apartment";
import { Car, Sky, Tree, PanelHouse, Sidewalk } from "../../two-schedules-2d/sets/Outdoor";
import { Depth, box } from "../../two-schedules-2d/shots";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../fonts";
import { BG27_TEXT } from "./script";

export const NAVY = "#14285A";
export const YELLOW = "#FFC90E";
export const SOFT_YELLOW = "#FFF4C2";
export const WHITE_CAR = "#F7F8FA";

// ---------- Улица у ворот ----------
export const GATE = {
  w: 2200,
  fenceTop: 820,
  footY: 1430, // стопы людей на тротуаре
  gate: { x: 1130, w: 480 }, // левый край и ширина ворот
  roadY: 1600,
  carY: 1880, // низ колёс машины на дороге
  carStop: 820, // где останавливается машина (центр)
  driver: 640,
  kid: 860,
  adult: 1240, // взрослый у ворот (неизвестный в хуке, Эже — в сцене 4)
} as const;

export const H = { adult: 790, kid: 560 } as const;

// Синие металлические ворота с орнаментом и калиткой.
const Gate: React.FC<{ x: number; y: number; w: number; h: number; wicketOpen?: number }> = ({ x, y, w, h, wicketOpen = 0 }) => {
  const ww = w * 0.32; // калитка
  return (
    <div style={box({ left: x, top: y, width: w, height: h })}>
      <div style={box({ left: -18, top: -30, width: 22, height: h + 30, backgroundColor: "#B9AE9E" })} />
      <div style={box({ left: w - 4, top: -30, width: 22, height: h + 30, backgroundColor: "#B9AE9E" })} />
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0 })}>
        <rect x={0} y={0} width={w - ww} height={h} fill="#3C6FA8" />
        <rect x={0} y={0} width={w - ww} height={h} fill="url(#bg27-gate-ribs)" />
        <defs>
          <pattern id="bg27-gate-ribs" width={36} height={10} patternUnits="userSpaceOnUse">
            <rect x={0} y={0} width={4} height={10} fill="rgba(0,0,0,0.10)" />
          </pattern>
        </defs>
        <rect x={10} y={10} width={w - ww - 20} height={h - 20} fill="none" stroke="#2F5C8F" strokeWidth={8} />
        <Ornament x={(w - ww) / 2} y={h * 0.42} s={1.7} color="#F1E2C6" />
        {/* калитка */}
        <g transform={`translate(${w - ww} 0)`}>
          <rect x={0} y={0} width={ww} height={h} fill="#2A2F3A" />
          <g transform={`scale(${1 - 0.8 * clamp(wicketOpen)} 1)`}>
            <rect x={0} y={0} width={ww} height={h} fill="#3C6FA8" stroke="#2F5C8F" strokeWidth={8} />
            <circle cx={ww - 26} cy={h * 0.55} r={9} fill="#E8D9A8" />
          </g>
        </g>
      </svg>
      <div style={box({ left: w - ww - 96, top: 60, width: 78, height: 50, borderRadius: 8, backgroundColor: "#FFFFFF", border: "4px solid #3C6FA8", color: "#3C6FA8", fontFamily, fontSize: 30, fontWeight: 900, textAlign: "center", lineHeight: "42px" })}>27</div>
    </div>
  );
};

export const GateStreet: React.FC<{ readonly f: number; readonly wicketOpen?: number; readonly children?: React.ReactNode; readonly front?: React.ReactNode }> = ({ f, wicketOpen = 0, children, front }) => {
  const W = GATE.w;
  return (
    <div style={box({ left: 0, top: 0, width: W, height: 2400 })}>
      <Sky w={W} h={1100} />
      <Depth depth={0.15}>
        <Mountains x={-300} y={360} w={W + 600} h={420} />
      </Depth>
      <Depth depth={0.45}>
        <PanelHouse x={-260} y={980} w={700} floors={5} color="#E6D8C6" seed={3} />
        <Tree x={520} y={900} s={1.2} kind="poplar" tone={1} />
        <Tree x={1900} y={900} s={1.25} kind="poplar" tone={1} />
      </Depth>
      {/* частный дом за забором: крыша и окна */}
      <div style={box({ left: 1050, top: 600, width: 760, height: 300, backgroundColor: "#F2E6D3" })} />
      <div style={box({ left: 1010, top: 520, width: 840, height: 100, backgroundColor: "#9C5B45", clipPath: "polygon(6% 0, 94% 0, 100% 100%, 0 100%)" })} />
      {[1120, 1420].map((x) => (
        <div key={x} style={box({ left: x, top: 650, width: 180, height: 140, borderRadius: 6, backgroundColor: "#A8C3DA", border: "8px solid #FFFFFF", boxSizing: "border-box" })} />
      ))}
      <Tree x={880} y={980} s={0.95} />
      {/* забор */}
      <div style={box({ left: -100, top: GATE.fenceTop, width: W + 200, height: GATE.footY - GATE.fenceTop - 60, backgroundColor: "#EFE3CF" })} />
      <div style={box({ left: -100, top: GATE.fenceTop - 26, width: W + 200, height: 30, backgroundColor: "#C9B79E" })} />
      <div style={box({ left: -100, top: GATE.fenceTop, width: W + 200, height: GATE.footY - GATE.fenceTop - 60, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 4px, transparent 4px 260px)" })} />
      <Gate x={GATE.gate.x} y={GATE.fenceTop + 20} w={GATE.gate.w} h={GATE.footY - GATE.fenceTop - 80} wicketOpen={wicketOpen} />
      {/* тротуар, арык, бордюр, дорога */}
      <div style={box({ left: -100, top: GATE.footY - 70, width: W + 200, height: 130, backgroundColor: "#DAD3C7" })} />
      <Sidewalk x={-100} y={GATE.footY + 40} w={W + 200} />
      <div style={box({ left: -100, top: GATE.roadY + 40, width: W + 200, height: 900, backgroundColor: "#8C919B" })} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={box({ left: i * 260 - 60, top: GATE.roadY + 420, width: 140, height: 14, backgroundColor: "#ECE9E2" })} />
      ))}
      {children}
      {front}
      {/* мягкий дневной свет; листва чуть колышется */}
      <div style={box({ left: 0, top: 0, width: W, height: 2400, background: `linear-gradient(${200 + Math.sin(f / 50) * 4}deg, rgba(255,240,205,0.22), transparent 55%)`, pointerEvents: "none" })} />
    </div>
  );
};

// Белая машина без марки; тонкий контур, чтобы читалась на светлом фоне.
export const WhiteCar: React.FC<{ x: number; y: number; s?: number; wheel?: number; dir?: 1 | -1; withDriver?: boolean }> = ({ x, y, s = 1.6, wheel = 0, dir = -1, withDriver = false }) => (
  <div style={{ filter: "drop-shadow(0 0 2px rgba(20,40,90,0.45))" }}>
    <Car x={x} y={y} s={s} color={WHITE_CAR} wheel={wheel} dir={dir} driver={withDriver} />
  </div>
);

// ---------- Офис ----------
export const OFFICE = {
  deskTop: 1240,
  seatY: 1540,
  mom: 560,
  laptop: 760,
  phone: { x: 330, y: 1252 },
  card: { x: 200, y: 1252 },
} as const;

export const OfficeBack: React.FC<{ readonly minutes: number }> = ({ minutes }) => (
  <div style={box({ left: 0, top: 0, width: 1400, height: 2200 })}>
    <div style={box({ left: -200, top: -200, width: 1800, height: 2600, backgroundColor: "#F4EFE7" })} />
    {/* окно: город и горы */}
    <div style={box({ left: 90, top: 330, width: 560, height: 620, borderRadius: 10, overflow: "hidden", border: "16px solid #FFFFFF", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(20,30,60,0.10)" })}>
      <div style={box({ left: 0, top: 0, width: 560, height: 620, background: "linear-gradient(180deg, #BFDDF3, #E7F0F6)" })} />
      <Mountains x={-40} y={150} w={640} h={220} />
      <PanelHouse x={-20} y={620} w={300} floors={2} color="#E8D9C6" seed={6} />
      <PanelHouse x={300} y={620} w={300} floors={3} color="#DCCFC0" seed={2} />
      <div style={box({ left: 264, top: 0, width: 16, height: 620, backgroundColor: "#FFFFFF" })} />
    </div>
    <WallClock x={900} y={470} r={92} minutes={minutes} />
    {/* полка с папками */}
    <div style={box({ left: 760, top: 720, width: 420, height: 18, backgroundColor: "#C9B79E" })} />
    {["#5E9A93", "#F2C14E", "#6D7FA3", "#E5677A"].map((c, i) => (
      <div key={c} style={box({ left: 790 + i * 70, top: 600, width: 54, height: 120, borderRadius: 4, backgroundColor: c })} />
    ))}
    <div style={box({ left: 1100, top: 820, width: 90, height: 200, borderRadius: 12, backgroundColor: "#7FAF63" })} />
    <div style={box({ left: 1085, top: 990, width: 120, height: 120, borderRadius: 10, backgroundColor: "#C77C5A" })} />
  </div>
);

export const OfficeChairBack: React.FC<{ x: number }> = ({ x }) => (
  <div style={box({ left: x - 150, top: 850, width: 300, height: 460, borderRadius: 54, backgroundColor: "#56627E" })} />
);

export const OfficeDeskFront: React.FC<{ readonly phoneGlow?: number; readonly phoneOnDesk?: boolean; readonly cardOnDesk?: boolean }> = ({ phoneGlow = 0, phoneOnDesk = true, cardOnDesk = true }) => (
  <>
    {/* ноутбук: вид на крышку (экран к маме) */}
    <div style={box({ left: OFFICE.laptop - 170, top: OFFICE.deskTop - 230, width: 340, height: 230, borderRadius: "16px 16px 4px 4px", backgroundColor: "#C9CED8", border: "4px solid #AEB4C0", boxSizing: "border-box" })} />
    <div style={box({ left: OFFICE.laptop - 22, top: OFFICE.deskTop - 140, width: 44, height: 44, borderRadius: 22, backgroundColor: "#E3E6EC" })} />
    {/* столешница */}
    <div style={box({ left: -100, top: OFFICE.deskTop, width: 1600, height: 34, backgroundColor: "#D9B98F" })} />
    <div style={box({ left: -100, top: OFFICE.deskTop + 34, width: 1600, height: 900, backgroundColor: "#C49E73" })} />
    <div style={box({ left: -100, top: OFFICE.deskTop + 34, width: 1600, height: 900, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 3px, transparent 3px 240px)" })} />
    {/* карточка встречи и телефон на столе */}
    {cardOnDesk ? <div style={box({ left: OFFICE.card.x - 80, top: OFFICE.card.y - 14, width: 160, height: 22, borderRadius: 4, backgroundColor: "#FFFFFF", border: `4px solid ${YELLOW}`, boxSizing: "border-box", rotate: "-4deg" })} /> : null}
    {phoneOnDesk ? (
      <div style={box({ left: OFFICE.phone.x + 40, top: OFFICE.phone.y - 16, width: 120, height: 22, borderRadius: 6, backgroundColor: "#1E2235", boxShadow: phoneGlow > 0 ? `0 -6px ${24 * phoneGlow}px rgba(120,190,255,${0.9 * phoneGlow})` : undefined })} />
    ) : null}
    <div style={box({ left: 1040, top: OFFICE.deskTop - 120, width: 100, height: 120, borderRadius: "8px 8px 18px 18px", backgroundColor: "#FFFFFF", border: "4px solid #D5DCE6", boxSizing: "border-box" })} />
  </>
);

// ---------- Карточка встречи ----------
// Нейтральная иконка взрослого (без лица и личных данных).
export const AdultIcon: React.FC<{ size: number; color: string; child?: boolean; unknown?: boolean }> = ({ size, color, child, unknown }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={unknown ? "#ECEEF2" : "#FFFFFF"} stroke={unknown ? "#C5CBD6" : color} strokeWidth={4} strokeDasharray={unknown ? "8 6" : undefined} />
    <circle cx={child ? 40 : 50} cy={38} r={14} fill={unknown ? "#B9C0CC" : color} />
    <path d={child ? "M 18 82 Q 20 58 40 56 Q 60 58 62 82 Z" : "M 24 84 Q 26 58 50 56 Q 74 58 76 84 Z"} fill={unknown ? "#B9C0CC" : color} />
    {child ? (
      <>
        <circle cx={70} cy={52} r={9} fill={color} opacity={0.75} />
        <path d="M 56 84 Q 58 66 70 64 Q 82 66 84 84 Z" fill={color} opacity={0.75} />
      </>
    ) : null}
    {unknown ? (
      <text x={50} y={46} textAnchor="middle" fontSize={34} fontWeight={900} fill="#FFFFFF" fontFamily="Nunito">?</text>
    ) : null}
  </svg>
);

// Галочка, которая «рисуется» (draw 0…1).
export const Tick: React.FC<{ size: number; draw: number; color?: string }> = ({ size, draw, color = "#1F9A55" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M 8 21 L 17 30 L 33 11" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(draw)} />
  </svg>
);

// Карточка: заголовок, две строки (ата-эне и согласованный взрослый),
// примечание. tick — галочка у «Эже» (0…1), frame — яркая рамка (0…1).
export const MeetingCard: React.FC<{
  readonly w: number;
  readonly tick: number;
  readonly frame: number;
  readonly rowA?: number;
  readonly rowB?: number;
  readonly note?: number;
  readonly showName?: boolean;
}> = ({ w, tick, frame, rowA = 1, rowB = 1, note = 1, showName = true }) => {
  const t = BG27_TEXT.card;
  const k = w / 900;
  const row = (on: number, icon: React.ReactNode, label: React.ReactNode, mark: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 26 * k, padding: `${22 * k}px ${30 * k}px`, borderRadius: 26 * k, backgroundColor: "#F6F8FC", opacity: on, translate: `0 ${(1 - on) * 30 * k}px` }}>
      {icon}
      <div style={{ flex: 1, fontSize: 50 * k, fontWeight: 900, lineHeight: 1.12, color: NAVY }}>{label}</div>
      {mark}
    </div>
  );
  const box2 = (child: React.ReactNode) => (
    <div style={{ width: 84 * k, height: 84 * k, borderRadius: 18 * k, border: `5px solid ${NAVY}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>{child}</div>
  );
  return (
    <div style={{ position: "relative", width: w, height: CARD_H * k, padding: 40 * k, boxSizing: "border-box", borderRadius: 44 * k, backgroundColor: "#FFFFFF", boxShadow: "0 30px 70px rgba(20,40,90,0.16)", fontFamily }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginBottom: 28 * k }}>
        <div style={{ width: 22 * k, height: 22 * k, borderRadius: 11 * k, backgroundColor: YELLOW }} />
        <div style={{ fontSize: 60 * k, fontWeight: 900, color: NAVY }}>{t.title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 * k }}>
        {row(rowA, <AdultIcon size={110 * k} color="#3A6EA5" child />, t.parent, box2(null))}
        {row(
          rowB,
          <AdultIcon size={110 * k} color="#8E3B46" />,
          <>
            {t.trusted}
            {showName ? <span style={{ color: "#8E3B46" }}>{`: ${t.trustedName}`}</span> : null}
          </>,
          box2(<Tick size={70 * k} draw={tick} />),
        )}
      </div>
      <div style={{ marginTop: 24 * k, fontSize: 36 * k, fontWeight: 800, color: "#5A6A8C", textAlign: "center", opacity: note }}>{t.note}</div>
      <FrameDraw w={w} h={CARD_H * k} k={k} frame={frame} />
    </div>
  );
};

// Высота карточки (при ширине 900).
export const CARD_H = 660;

// Яркая жёлтая рамка вокруг карточки — рисуется по периметру.
export const FrameDraw: React.FC<{ w: number; h: number; k: number; frame: number }> = ({ w, h, k, frame }) =>
  frame > 0 ? (
    <svg width={w + 28 * k} height={h + 28 * k} style={{ position: "absolute", left: -14 * k, top: -14 * k, overflow: "visible", pointerEvents: "none" }}>
      <rect x={7 * k} y={7 * k} width={w + 14 * k} height={h + 14 * k} rx={52 * k} fill="none" stroke={YELLOW} strokeWidth={14 * k} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(frame)} />
    </svg>
  ) : null;

// Метка условного примера: всё время условной сцены.
export const Marker: React.FC<{ readonly text: string; readonly f: number; readonly big?: boolean }> = ({ text, f, big }) => {
  const a = easeOut(f / 8);
  return (
    <div style={box({ left: 60, top: 268, maxWidth: big ? 760 : 520, padding: big ? "14px 26px" : "10px 22px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.94)", border: `4px solid ${YELLOW}`, fontFamily, fontSize: big ? 36 : 32, fontWeight: 900, color: NAVY, opacity: a, boxShadow: "0 8px 22px rgba(20,40,90,0.14)", lineHeight: 1.15 })}>
      {text}
    </div>
  );
};

// Плашка над согласованным взрослым: та же иконка, что на карточке, и галочка.
// side — плашка слева от головы (стрелка вправо), чтобы не закрывать надписи сверху.
export const AgreedBadge: React.FC<{ readonly x: number; readonly y: number; readonly a: number; readonly s?: number; readonly side?: boolean }> = ({ x, y, a, s = 1, side }) => (
  <div style={box({ left: x - 150 * s, top: y - 130 * s, width: 300 * s, height: 120 * s, opacity: a, scale: `${0.8 + 0.2 * a}`, transformOrigin: side ? "100% 50%" : "50% 100%" })}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 * s, padding: `${12 * s}px ${20 * s}px`, borderRadius: 999, backgroundColor: "#FFFFFF", border: `5px solid ${YELLOW}`, boxShadow: "0 10px 26px rgba(20,40,90,0.18)", fontFamily, fontSize: 40 * s, fontWeight: 900, color: NAVY, justifyContent: "center" }}>
      <AdultIcon size={64 * s} color="#8E3B46" />
      {BG27_TEXT.card.trustedName}
      <Tick size={52 * s} draw={1} />
    </div>
    {side ? (
      <div style={box({ right: -16 * s, top: 36 * s, width: 0, height: 0, borderTop: `${16 * s}px solid transparent`, borderBottom: `${16 * s}px solid transparent`, borderLeft: `${18 * s}px solid ${YELLOW}` })} />
    ) : (
      <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: `${16 * s}px solid transparent`, borderRight: `${16 * s}px solid transparent`, borderTop: `${18 * s}px solid ${YELLOW}` }} />
    )}
  </div>
);

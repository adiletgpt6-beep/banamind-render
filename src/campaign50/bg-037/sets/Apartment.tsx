// Квартира семьи: прихожая (входная дверь, часы, вешалка с ключами,
// тумба, зеркало, ширдак у двери) и вид на кухню (окно с горами, чай на
// столе). Координаты мира — px; пол прихожей (низ стены) — y = 1560.
import { box } from "../shots";

export const HALL = {
  floorY: 1560,
  door: { x: 760, y: 640, w: 290, h: 920 },
  handle: { x: 1018, y: 1120 },
  hook: { x: 1262, y: 846 }, // ключи от машины на крючке
  console: { x: 1140, y: 1300, w: 330 },
  phone: { x: 1350, y: 1292 }, // телефон мамы на тумбе
  clock: { x: 600, y: 470, r: 70 },
  kitchen: { x: 1720, y: 600, w: 380 },
} as const;

// Орнамент «кочкор мүйүз» (рога барана) — небольшой акцент на ширдаке.
export const Ornament: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round">
    <path d="M 0 -30 C -18 -30 -26 -48 -14 -58 C -4 -66 8 -58 4 -48" />
    <path d="M 0 -30 C 18 -30 26 -48 14 -58 C 4 -66 -8 -58 -4 -48" />
    <path d="M 0 30 C -18 30 -26 48 -14 58 C -4 66 8 58 4 48" />
    <path d="M 0 30 C 18 30 26 48 14 58 C 4 66 -8 58 -4 48" />
    <path d="M -30 0 L 0 -30 L 30 0 L 0 30 Z" />
  </g>
);

export const Shyrdak: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: x, top: y, overflow: "visible" })}>
    <rect x={4} y={10} width={w - 8} height={h - 4} rx={18} fill="rgba(40,30,30,0.16)" />
    <rect x={0} y={0} width={w} height={h} rx={18} fill="#B13C34" />
    <rect x={12} y={12} width={w - 24} height={h - 24} rx={12} fill="none" stroke="#F1E2C6" strokeWidth={6} strokeDasharray="22 10" />
    <Ornament x={w / 2} y={h / 2} s={h / 190} color="#F1E2C6" />
    <Ornament x={w * 0.2} y={h / 2} s={h / 330} color="#2E2A40" />
    <Ornament x={w * 0.8} y={h / 2} s={h / 330} color="#2E2A40" />
  </svg>
);

export const WallClock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => {
  const h = ((minutes / 60) % 12) * 30;
  const m = (minutes % 60) * 6;
  return (
    <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={box({ left: x - r, top: y - r })}>
      <circle r={96} fill="#FFFFFF" stroke="#2E2A40" strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-80} x2={0} y2={i % 3 === 0 ? -64 : -71} stroke="#2E2A40" strokeWidth={i % 3 === 0 ? 7 : 4} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={8} x2={0} y2={-44} stroke="#2E2A40" strokeWidth={9} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={10} x2={0} y2={-68} stroke="#2E2A40" strokeWidth={6} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={7} fill="#E3A21A" />
    </svg>
  );
};

// Горы Ала-Тоо на дальнем плане (утро — светлые, вечер — тёмные).
export const Mountains: React.FC<{ x: number; y: number; w: number; h: number; evening?: number }> = ({ x, y, w, h, evening = 0 }) => {
  const far = evening > 0.5 ? "#3B4468" : "#B9C9DE";
  const near = evening > 0.5 ? "#2C3456" : "#9DB2CC";
  return (
    <svg width={w} height={h} viewBox="0 0 1000 300" preserveAspectRatio="none" style={box({ left: x, top: y })}>
      <path d="M 0 300 L 0 170 L 90 110 L 160 150 L 260 60 L 330 120 L 420 40 L 520 130 L 600 80 L 700 140 L 800 50 L 900 120 L 1000 90 L 1000 300 Z" fill={far} />
      {evening <= 0.5 ? (
        <path d="M 245 74 L 260 60 L 280 80 L 268 78 L 258 88 Z M 405 54 L 420 40 L 445 66 L 430 62 L 418 72 Z M 785 64 L 800 50 L 822 72 L 808 70 L 798 80 Z" fill="#FFFFFF" opacity={0.9} />
      ) : null}
      <path d="M 0 300 L 0 220 L 120 170 L 240 210 L 380 150 L 520 200 L 660 160 L 800 205 L 1000 170 L 1000 300 Z" fill={near} />
    </svg>
  );
};

// Прихожая. doorOpen 0…1 — дверь открывается наружу (лист сужается к петлям).
export const Hallway: React.FC<{
  readonly minutes: number;
  readonly doorOpen?: number;
  readonly keysOnHook?: boolean;
  readonly phoneOnConsole?: boolean;
  readonly phoneGlow?: number;
  readonly inDoor?: React.ReactNode;
}> = ({ minutes, doorOpen = 0, keysOnHook = true, phoneOnConsole = false, phoneGlow = 0, inDoor }) => {
  const d = HALL.door;
  const leaf = 1 - 0.86 * doorOpen;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      {/* стена с мягким узором */}
      <div style={box({ left: 0, top: 0, width: 2200, height: HALL.floorY, background: "linear-gradient(180deg, #EFE2CF 0%, #F4E9DA 60%, #EADCC6 100%)" })} />
      <div
        style={box({
          left: 0,
          top: 0,
          width: 2200,
          height: HALL.floorY,
          backgroundImage: "repeating-linear-gradient(90deg, rgba(190,160,120,0.07) 0 3px, transparent 3px 46px)",
        })}
      />
      {/* кухня за проёмом: окно с горами, утренний свет, чай на столе */}
      <div style={box({ left: HALL.kitchen.x, top: HALL.kitchen.y, width: HALL.kitchen.w, height: HALL.floorY - HALL.kitchen.y, backgroundColor: "#F7EDDC", overflow: "hidden" })}>
        <div style={box({ left: 60, top: 70, width: 260, height: 330, borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #CFE3F4, #F6E7D2)" })}>
          <Mountains x={-20} y={120} w={300} h={140} />
          <div style={box({ left: 0, top: 230, width: 260, height: 100, backgroundColor: "#D7CFC0" })} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={box({ left: 20 + i * 80, top: 190, width: 56, height: 90, backgroundColor: "#E6D9C4", borderRadius: 4 })} />
          ))}
          <div style={box({ left: 126, top: 0, width: 8, height: 330, backgroundColor: "#FFFFFF" })} />
          <div style={box({ left: 0, top: 160, width: 260, height: 8, backgroundColor: "#FFFFFF" })} />
        </div>
        <div style={box({ left: 0, top: 560, width: 380, height: 30, backgroundColor: "#C79A6E", borderRadius: 8 })} />
        <div style={box({ left: 40, top: 590, width: 20, height: 400, backgroundColor: "#A97D55" })} />
        <div style={box({ left: 320, top: 590, width: 20, height: 400, backgroundColor: "#A97D55" })} />
        <TeaSet x={60} y={470} />
        <div style={box({ left: 0, top: 0, width: 380, height: 960, background: "linear-gradient(120deg, rgba(255,236,190,0.35), transparent 60%)" })} />
      </div>
      {/* наличник кухни */}
      <div style={box({ left: HALL.kitchen.x - 20, top: HALL.kitchen.y - 20, width: HALL.kitchen.w + 40, height: 22, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: HALL.kitchen.x - 20, top: HALL.kitchen.y - 20, width: 22, height: HALL.floorY - HALL.kitchen.y + 20, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: HALL.kitchen.x + HALL.kitchen.w - 2, top: HALL.kitchen.y - 20, width: 22, height: HALL.floorY - HALL.kitchen.y + 20, backgroundColor: "#FFFFFF" })} />

      {/* входная дверь: проём (подъезд за дверью), лист, наличник */}
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#6E7A74", overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: d.w, height: d.h, background: "linear-gradient(180deg, #8C9690, #5E6862)" })} />
        <div style={box({ left: 30, top: 420, width: 260, height: 14, backgroundColor: "#4A524E", transform: "rotate(-24deg)" })} />
        <div style={box({ left: -d.x, top: -d.y, width: 2200, height: 1920 })}>{inDoor}</div>
        <div
          style={box({
            left: 0,
            top: 0,
            width: d.w * leaf,
            height: d.h,
            background: "linear-gradient(90deg, #845639, #6F4630)",
            boxShadow: doorOpen > 0.01 ? "8px 0 18px rgba(0,0,0,0.25)" : "none",
          })}
        >
          <div style={box({ left: 26 * leaf, top: 60, width: (d.w - 52) * leaf, height: 360, border: "6px solid rgba(60,35,22,0.35)", borderRadius: 8, boxSizing: "border-box" })} />
          <div style={box({ left: 26 * leaf, top: 470, width: (d.w - 52) * leaf, height: 380, border: "6px solid rgba(60,35,22,0.35)", borderRadius: 8, boxSizing: "border-box" })} />
          <div style={box({ left: d.w * leaf * 0.5 - 7, top: 300, width: 14, height: 14, borderRadius: 7, backgroundColor: "#2A1C14" })} />
        </div>
      </div>
      <div style={box({ left: d.x - 26, top: d.y - 26, width: d.w + 52, height: 26, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x - 26, top: d.y - 26, width: 26, height: d.h + 26, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x + d.w, top: d.y - 26, width: 26, height: d.h + 26, backgroundColor: "#FBF7F0" })} />

      <WallClock x={HALL.clock.x} y={HALL.clock.y} r={HALL.clock.r} minutes={minutes} />

      {/* вешалка: крючки, куртки, ключи от машины */}
      <div style={box({ left: 1170, top: 790, width: 270, height: 22, backgroundColor: "#8C6A4E", borderRadius: 6 })} />
      {[1205, 1262, 1330, 1400].map((x) => (
        <div key={x} style={box({ left: x - 6, top: 800, width: 12, height: 34, backgroundColor: "#5A4636", borderRadius: 6 })} />
      ))}
      <div style={box({ left: 1300, top: 820, width: 96, height: 320, borderRadius: "30px 30px 16px 16px", backgroundColor: "#C9B38F" })} />
      <div style={box({ left: 1376, top: 822, width: 70, height: 280, borderRadius: "26px 26px 12px 12px", backgroundColor: "#4C5568" })} />
      {keysOnHook ? <CarKeys x={HALL.hook.x} y={HALL.hook.y} /> : null}

      {/* зеркало */}
      <div style={box({ left: 1500, top: 720, width: 150, height: 420, borderRadius: 75, backgroundColor: "#D9E6EE", border: "10px solid #B89A74", boxSizing: "border-box" })} />
      <div style={box({ left: 1530, top: 760, width: 26, height: 300, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.55)", transform: "rotate(8deg)" })} />

      {/* тумба для обуви */}
      <div style={box({ left: HALL.console.x, top: HALL.console.y, width: HALL.console.w, height: HALL.floorY - HALL.console.y, backgroundColor: "#D9C3A5", borderRadius: "8px 8px 0 0" })} />
      <div style={box({ left: HALL.console.x - 10, top: HALL.console.y - 16, width: HALL.console.w + 20, height: 20, backgroundColor: "#B88E64", borderRadius: 6 })} />
      <div style={box({ left: HALL.console.x + 20, top: HALL.console.y + 40, width: HALL.console.w - 40, height: 6, backgroundColor: "#BFA582" })} />
      <div style={box({ left: HALL.console.x + 30, top: HALL.console.y - 60, width: 70, height: 46, borderRadius: "0 0 35px 35px", backgroundColor: "#4F7FB8" })} />
      {phoneOnConsole ? <PhoneFlat x={HALL.phone.x} y={HALL.phone.y} glow={phoneGlow} scale={0.82} /> : null}

      {/* школьные вещи у двери: мешок для сменной обуви, кроссовки */}
      <div style={box({ left: 420, top: 1400, width: 110, height: 150, borderRadius: "18px 18px 24px 24px", backgroundColor: "#3E7CC0" })} />
      <div style={box({ left: 456, top: 1380, width: 38, height: 34, borderRadius: 17, border: "6px solid #2E5E96", boxSizing: "border-box" })} />
      <div style={box({ left: 1110, top: 1530, width: 70, height: 26, borderRadius: "14px 18px 6px 6px", backgroundColor: "#F2F2F2" })} />
      <div style={box({ left: 1186, top: 1532, width: 66, height: 24, borderRadius: "14px 18px 6px 6px", backgroundColor: "#E85D75" })} />

      {/* плинтус и пол */}
      <div style={box({ left: 0, top: HALL.floorY - 18, width: 2200, height: 18, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: 0, top: HALL.floorY, width: 2200, height: 2600 - HALL.floorY, background: "linear-gradient(180deg, #C29B76, #B38A64)" })} />
      <div style={box({ left: 0, top: HALL.floorY, width: 2200, height: 2600 - HALL.floorY, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.10) 0 2px, transparent 2px 160px)" })} />
      <Shyrdak x={720} y={1610} w={380} h={120} />
      {/* утренний свет из кухни */}
      <div style={box({ left: 1300, top: 0, width: 900, height: 1920, background: "linear-gradient(270deg, rgba(255,233,190,0.28), transparent 70%)" })} />
    </div>
  );
};

export const TeaSet: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={260} height={100} viewBox="0 0 260 100" style={box({ left: x, top: y })}>
    {/* чайник с синим узором, пиалы, нан и боорсок */}
    <ellipse cx={60} cy={62} rx={42} ry={34} fill="#FFFFFF" stroke="#D8DEE8" strokeWidth={2} />
    <path d="M 26 58 Q 60 44 94 58" stroke="#2F62A8" strokeWidth={5} fill="none" />
    <path d="M 100 52 Q 122 40 126 30" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
    <ellipse cx={60} cy={28} rx={16} ry={6} fill="#FFFFFF" stroke="#D8DEE8" strokeWidth={2} />
    <circle cx={60} cy={21} r={5} fill="#2F62A8" />
    {[150, 200].map((cx) => (
      <g key={cx}>
        <path d={`M ${cx - 20} 74 Q ${cx} 100 ${cx + 20} 74 Z`} fill="#FFFFFF" stroke="#D8DEE8" strokeWidth={2} />
        <path d={`M ${cx - 16} 80 Q ${cx} 86 ${cx + 16} 80`} stroke="#2F62A8" strokeWidth={3} fill="none" />
      </g>
    ))}
    <ellipse cx={228} cy={90} rx={30} ry={9} fill="#D9A15C" />
  </svg>
);

// Ключи от машины на крючке.
export const CarKeys: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={60} height={90} viewBox="-30 0 60 90" style={box({ left: x - 30, top: y - 6 })}>
    <circle cx={0} cy={10} r={9} fill="none" stroke="#B9BEC8" strokeWidth={4} />
    <rect x={-4} y={18} width={8} height={36} rx={4} fill="#AFB5BF" />
    <rect x={-12} y={46} width={24} height={30} rx={8} fill="#2E3550" />
  </svg>
);

// Телефон, лежащий на поверхности (вид чуть сверху).
export const PhoneFlat: React.FC<{ x: number; y: number; glow?: number; shake?: number; scale?: number }> = ({ x, y, glow = 0, shake = 0, scale = 1 }) => (
  <div style={box({ left: x - 39 * scale + shake, top: y - 13 * scale, width: 78 * scale, height: 26 * scale })}>
    <div style={box({ left: 0, top: 0, width: 78 * scale, height: 26 * scale, borderRadius: 7 * scale, backgroundColor: "#1E2235" })} />
    <div style={box({ left: 4 * scale, top: 3 * scale, width: 70 * scale, height: 18 * scale, borderRadius: 5 * scale, backgroundColor: glow > 0 ? `rgba(200,225,250,${0.4 + 0.6 * glow})` : "#2C3B5C" })} />
  </div>
);

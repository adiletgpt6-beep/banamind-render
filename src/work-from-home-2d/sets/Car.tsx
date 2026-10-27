// Легковая машина в натуральном масштабе относительно людей: рост
// взрослого 760 px ≈ 1,65 м → 460 px на метр. Седан ≈ 4,4 × 1,47 м →
// 2020 × 680 px, колесо ≈ 0,63 м. Вид сбоку; dir = 1 — капотом вправо.
// Семейная машина мамы — серебристо-голубая, у папы — тёмно-синяя; обе
// без надписей и брендинга.
import { box } from "../shots";

export const CAR = { len: 2020, h: 680, wheelR: 145 } as const;

export const MOM_CAR = "#A9B8C8";
export const DAD_CAR = "#2F4A73";

// x — центр машины, y — земля (низ колёс). wheel — угол колёс (градусы).
// rearDoor 0…1 — задняя дверь открыта (лист поворачивается к камере).
// heads — силуэты в салоне (водитель, ребёнок сзади), если видны.
export const Car: React.FC<{
  x: number;
  y: number;
  color: string;
  wheel?: number;
  dir?: 1 | -1;
  rearDoor?: number;
  driver?: string; // цвет волос водителя
  kid?: boolean;
  s?: number;
}> = ({ x, y, color, wheel = 0, dir = 1, rearDoor = 0, driver, kid, s = 1 }) => {
  const W = CAR.len;
  const dark = shade(color, 0.82);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={0} cy={4} rx={W * 0.48} ry={26} fill="rgba(20,25,40,0.22)" />
        {/* кузов */}
        <path
          d={`M ${-W / 2} -150 Q ${-W / 2 - 6} -330 ${-W / 2 + 90} -350 L ${-W * 0.3} -380 Q ${-W * 0.18} -640 ${W * 0.0} -650 L ${W * 0.16} -648 Q ${W * 0.26} -636 ${W * 0.33} -400 L ${W * 0.44} -370 Q ${W / 2 + 6} -350 ${W / 2} -170 L ${W / 2 - 10} -90 L ${-W / 2 + 10} -90 Z`}
          fill={color}
        />
        {/* стёкла: заднее и переднее боковые окна */}
        <path d={`M ${-W * 0.27} -400 Q ${-W * 0.16} -610 ${-W * 0.02} -616 L ${-W * 0.02} -400 Z`} fill="#9FC1DD" />
        <path d={`M ${W * 0.0} -400 L ${W * 0.0} -616 L ${W * 0.15} -614 Q ${W * 0.23} -604 ${W * 0.3} -400 Z`} fill="#9FC1DD" />
        {/* силуэты в салоне */}
        {driver ? <circle cx={W * 0.11} cy={-520} r={58} fill={driver} /> : null}
        {kid ? <circle cx={-W * 0.12} cy={-500} r={50} fill="#221B19" /> : null}
        {/* стойка и линии дверей */}
        <rect x={-W * 0.02} y={-616} width={26} height={216} fill={dark} />
        <path d={`M ${-W * 0.3} -400 L ${-W * 0.3} -110 M ${-W * 0.01} -400 L ${-W * 0.01} -110 M ${W * 0.3} -400 L ${W * 0.3} -120`} stroke={dark} strokeWidth={6} />
        <path d={`M ${-W / 2} -250 L ${W / 2} -250`} stroke="rgba(0,0,0,0.10)" strokeWidth={10} />
        <rect x={-W * 0.2} y={-330} width={70} height={16} rx={8} fill={dark} />
        <rect x={W * 0.08} y={-330} width={70} height={16} rx={8} fill={dark} />
        {/* фары */}
        <rect x={W / 2 - 50} y={-300} width={44} height={50} rx={12} fill="#FFE7A8" />
        <rect x={-W / 2 + 4} y={-300} width={30} height={50} rx={10} fill="#E25B4E" />
        {/* зеркало */}
        <path d={`M ${W * 0.27} -420 L ${W * 0.31} -460 L ${W * 0.34} -440 Z`} fill={dark} />
        {/* колёса */}
        {[-W * 0.32, W * 0.31].map((wx) => (
          <g key={wx}>
            <circle cx={wx} cy={-CAR.wheelR - 6} r={CAR.wheelR + 26} fill="#2B2E36" opacity={0.35} />
            <g transform={`translate(${wx} ${-CAR.wheelR}) rotate(${wheel})`}>
              <circle r={CAR.wheelR} fill="#23262E" />
              <circle r={CAR.wheelR * 0.55} fill="#B8BEC8" />
              {[0, 72, 144, 216, 288].map((a) => (
                <rect key={a} x={-8} y={-CAR.wheelR * 0.55} width={16} height={CAR.wheelR * 0.55} fill="#8C929C" transform={`rotate(${a})`} />
              ))}
              <circle r={18} fill="#6B717B" />
            </g>
          </g>
        ))}
        {/* задняя дверь: открывается к камере на петлях у стойки */}
        {rearDoor > 0.01 ? (
          <g>
            {/* проём: тёмный салон и спинка заднего сиденья */}
            <path d={`M ${-W * 0.29} -396 Q ${-W * 0.17} -604 ${-W * 0.03} -610 L ${-W * 0.015} -110 L ${-W * 0.29} -110 Z`} fill="#3A3F4C" />
            <rect x={-W * 0.27} y={-330} width={W * 0.22} height={150} rx={30} fill="#5A6070" />
            {/* лист двери: повернут к камере на петлях у стойки, со стеклом */}
            <g transform={`translate(${-W * 0.015} 0) scale(${1 - 0.55 * rearDoor} 1) translate(${W * 0.015} 0)`}>
              <path d={`M ${-W * 0.015} -400 L ${-W * 0.3} -400 L ${-W * 0.3} -112 Q ${-W * 0.3} -96 ${-W * 0.28} -96 L ${-W * 0.015} -96 Z`} fill={color} stroke={dark} strokeWidth={6} />
              <path d={`M ${-W * 0.29} -404 Q ${-W * 0.17} -600 ${-W * 0.03} -606 L ${-W * 0.03} -404 Z`} fill="#B7D0E6" stroke={dark} strokeWidth={6} />
              <rect x={-W * 0.27} y={-330} width={60} height={14} rx={7} fill={dark} />
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  );
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * k);
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
};

// Салон сзади (вид из открытой задней двери): спинка сиденья, окно, ремень.
// Ребёнок сидит; belt 0…1 — ремень вытянут и застёгнут.
export const RearSeat: React.FC<{ evening?: boolean }> = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: "#3A3F4C" })} />
    {/* окно напротив */}
    <div style={box({ left: 160, top: 360, width: 760, height: 380, borderRadius: "120px 60px 20px 20px", background: "linear-gradient(180deg, #CFE4F4, #E9EEF2)" })} />
    {/* спинка и подушка сиденья */}
    <div style={box({ left: 60, top: 760, width: 960, height: 520, borderRadius: 60, backgroundColor: "#5A6070" })} />
    <div style={box({ left: 100, top: 1180, width: 900, height: 260, borderRadius: 40, backgroundColor: "#666C7C" })} />
    <div style={box({ left: 60, top: 1440, width: 960, height: 600, backgroundColor: "#2E323D" })} />
    {/* крепление ремня у плеча и замок у бедра */}
    <div style={box({ left: 820, top: 690, width: 60, height: 90, borderRadius: 14, backgroundColor: "#23262E" })} />
    <div style={box({ left: 300, top: 1170, width: 54, height: 90, borderRadius: 12, backgroundColor: "#23262E" })} />
  </div>
);

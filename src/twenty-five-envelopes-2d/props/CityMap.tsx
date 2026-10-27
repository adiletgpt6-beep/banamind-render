// Рисованная схема города для объяснения дороги (не точная карта Бишкека,
// без минут и километров). Положение дома и нынешней школы постоянное;
// прежний офис — тонким контуром рядом со школой, новый — заметно дальше.
// Маршрут рисуется линией: дом → школа → новый офис (утро) и та же линия
// обратно — путь становится длиннее. t — кадры от начала вставки.
import { TE2_TEXT } from "../script";
import { C, F } from "../theme";
import { clamp, easeInOut } from "../rig/motion";

export const MAP = {
  home: { x: 230, y: 1250 },
  school: { x: 420, y: 920 },
  oldOffice: { x: 600, y: 1000 },
  office: { x: 860, y: 520 },
} as const;

// маршрут новой дороги: дом → школа → новый офис (по улицам)
const ROUTE = [MAP.home, { x: 230, y: 1080 }, { x: 420, y: 1080 }, MAP.school, { x: 420, y: 760 }, { x: 860, y: 760 }, MAP.office];
const OLD = [MAP.school, { x: 600, y: 920 }, MAP.oldOffice];
const pathOf = (pts: readonly { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
const lenOf = (pts: readonly { x: number; y: number }[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

const Pin: React.FC<{ x: number; y: number; label: string; color: string; icon: "home" | "school" | "office"; ghost?: boolean; a?: number }> = ({ x, y, label, color, icon, ghost = false, a = 1 }) => (
  <g opacity={a} transform={`translate(${x} ${y})`}>
    <circle r={58} fill={ghost ? "none" : "#FFFFFF"} stroke={color} strokeWidth={ghost ? 4 : 8} strokeDasharray={ghost ? "10 10" : undefined} />
    {icon === "home" ? <path d="M -26 8 L 0 -20 L 26 8 L 26 28 L -26 28 Z" fill={color} /> : null}
    {icon === "school" ? (
      <g fill={color}>
        <rect x={-28} y={-10} width={56} height={38} />
        <path d="M -34 -10 L 0 -32 L 34 -10 Z" />
        <rect x={-2} y={-46} width={4} height={18} />
      </g>
    ) : null}
    {icon === "office" ? (
      <g fill={ghost ? "none" : color} stroke={color} strokeWidth={ghost ? 3 : 0}>
        <rect x={-20} y={-32} width={40} height={62} />
      </g>
    ) : null}
    {icon === "office" && !ghost
      ? [0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={-12 + c * 14} y={-24 + r * 18} width={10} height={10} fill="#FFFFFF" />))
      : null}
    <text x={0} y={96} textAnchor="middle" fontFamily={F.text} fontWeight={800} fontSize={ghost ? 30 : 40} fill={ghost ? C.inkSoft : C.ink}>
      {label}
    </text>
  </g>
);

export const CityMap: React.FC<{ readonly t: number; readonly dur: number }> = ({ t, dur }) => {
  const routeLen = lenOf(ROUTE);
  const draw = easeInOut(clamp((t - 18) / Math.max(20, dur * 0.45)));
  const back = easeInOut(clamp((t - 18 - dur * 0.5) / Math.max(20, dur * 0.35)));
  const oldA = 1 - 0.55 * clamp((t - 10) / 20);
  const newA = clamp((t - 10) / 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={1080} height={1920} fill="#F4EEDF" />
      {/* лёгкая бумажная фактура и кварталы */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`h${i}`} x1={60} x2={1020} y1={420 + i * 170} y2={420 + i * 170} stroke="#E4D9C2" strokeWidth={18} strokeLinecap="round" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`v${i}`} x1={60 + i * 190} x2={60 + i * 190} y1={360} y2={1520} stroke="#E4D9C2" strokeWidth={18} strokeLinecap="round" />
      ))}
      <path d="M 40 640 C 260 600 420 700 640 640 S 960 560 1060 600" stroke="#BFD9EE" strokeWidth={34} fill="none" strokeLinecap="round" />
      <rect x={640} y={1180} width={260} height={180} rx={30} fill="#CFE6BE" />
      {/* прежняя дорога (школа → старый офис): тонко */}
      <path d={pathOf(OLD)} stroke={C.inkSoft} strokeWidth={8} strokeDasharray="14 14" fill="none" opacity={oldA * 0.7} strokeLinecap="round" />
      {/* новая дорога: туда и обратно (вторая линия чуть смещена) */}
      <path d={pathOf(ROUTE)} stroke={C.blue} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${routeLen}`} strokeDashoffset={routeLen * (1 - draw)} />
      <g transform="translate(16 16)">
        <path d={pathOf([...ROUTE].reverse())} stroke={C.coral} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${routeLen}`} strokeDashoffset={routeLen * (1 - back)} opacity={0.9} />
      </g>
      <Pin {...MAP.oldOffice} label={TE2_TEXT.map.oldOffice} color={C.inkSoft} icon="office" ghost a={oldA} />
      <Pin {...MAP.home} label={TE2_TEXT.map.home} color={C.coral} icon="home" />
      <Pin {...MAP.school} label={TE2_TEXT.map.school} color={C.green} icon="school" />
      <Pin {...MAP.office} label={TE2_TEXT.map.office} color={C.blue} icon="office" a={newA} />
    </svg>
  );
};

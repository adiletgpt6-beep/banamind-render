// Две дорожки одного дня (сцены 2–3): работа и школьная дорога на шкале
// 16:00–17:40. «Кардар чалат» 16:40–17:05 ложится на «Жолго чыгуу».
import { type Lane } from "../lanes";
import { GREEN, PURPLE, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";

const L = BG8_TEXT.lanes;
export const CALL = { from: 40, to: 65 } as const;
export const ROAD = { from: 36, to: 58 } as const;

export const WorkIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={40} height={40} viewBox="0 0 24 24"><rect x={3} y={7} width={18} height={13} rx={2.5} fill={color} /><path d="M9 7 L9 4.5 L15 4.5 L15 7" fill="none" stroke={color} strokeWidth={2.2} /></svg>
);
export const SchoolIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={40} height={40} viewBox="0 0 24 24"><path d="M3 21 L3 10 L12 4 L21 10 L21 21 Z" fill={color} /><rect x={10} y={14} width={4} height={7} fill="#FFFFFF" /></svg>
);

export const dayLanes = (o: { readonly at: number; readonly pulse?: number; readonly callDim?: number }): Lane[] => [
  {
    label: L.work,
    color: PURPLE,
    badge: <WorkIcon color={PURPLE} />,
    blocks: [
      { from: 0, to: 36, label: L.doc, color: GREEN, at: o.at },
      { from: CALL.from, to: CALL.to, label: L.call, color: PURPLE, at: o.at + 8, pulse: o.pulse, dim: o.callDim },
    ],
  },
  {
    label: L.school,
    color: "#2E6FD0",
    badge: <SchoolIcon color="#2E6FD0" />,
    blocks: [
      { from: ROAD.from, to: ROAD.to, label: L.go, color: "#4C7BD9", at: o.at + 14 },
      { from: 58, to: 72, label: L.pick, color: YELLOW, ink: "#14285A", at: o.at + 18 },
      { from: 72, to: 95, label: L.home, color: "#4C7BD9", at: o.at + 22 },
    ],
  },
];

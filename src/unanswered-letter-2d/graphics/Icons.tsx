// Простые линейные иконки истории: письмо, школа, календарь, рисунок,
// ответ (самолётик), машина, дом, часы, карандаш. viewBox 0 0 48 48.
import type { Ul2Topic } from "../script";

export type IconId = Ul2Topic | "car" | "home" | "clock" | "pencil" | "check" | "keys" | "folder";

const paths: Record<IconId, React.ReactNode> = {
  letter: (
    <>
      <rect x={6} y={11} width={36} height={26} rx={5} />
      <path d="M 8 14 L 24 26 L 40 14" />
    </>
  ),
  school: (
    <>
      <path d="M 6 20 L 24 9 L 42 20" />
      <rect x={10} y={20} width={28} height={19} rx={2} />
      <rect x={20} y={28} width={8} height={11} />
      <path d="M 24 9 L 24 4 L 31 6 L 24 8" />
    </>
  ),
  calendar: (
    <>
      <rect x={7} y={10} width={34} height={30} rx={5} />
      <path d="M 7 19 L 41 19 M 16 6 L 16 13 M 32 6 L 32 13" />
      <path d="M 14 26 L 20 26 M 28 26 L 34 26 M 14 33 L 20 33" />
    </>
  ),
  drawing: (
    <>
      <rect x={7} y={8} width={30} height={34} rx={3} transform="rotate(-6 22 25)" />
      <circle cx={20} cy={21} r={4} />
      <path d="M 13 34 Q 20 26 27 34" />
      <path d="M 34 30 L 44 14" strokeWidth={5} />
    </>
  ),
  reply: (
    <>
      <path d="M 6 23 L 42 8 L 34 40 L 23 28 Z" />
      <path d="M 23 28 L 42 8" />
    </>
  ),
  car: (
    <>
      <path d="M 6 30 L 9 20 Q 11 15 16 15 L 32 15 Q 37 15 39 20 L 42 30 Z" />
      <rect x={5} y={29} width={38} height={8} rx={3} />
      <circle cx={14} cy={38} r={4} />
      <circle cx={34} cy={38} r={4} />
    </>
  ),
  home: (
    <>
      <path d="M 7 23 L 24 9 L 41 23" />
      <path d="M 12 20 L 12 40 L 36 40 L 36 20" />
      <rect x={20} y={28} width={8} height={12} />
    </>
  ),
  clock: (
    <>
      <circle cx={24} cy={24} r={17} />
      <path d="M 24 13 L 24 24 L 32 29" />
    </>
  ),
  pencil: (
    <>
      <path d="M 10 38 L 13 29 L 33 9 L 39 15 L 19 35 Z" />
      <path d="M 29 13 L 35 19" />
    </>
  ),
  check: <path d="M 10 25 L 20 35 L 39 13" />,
  keys: (
    <>
      <circle cx={16} cy={18} r={8} />
      <path d="M 21 24 L 38 41 M 31 34 L 35 30 M 35 38 L 39 34" />
    </>
  ),
  folder: (
    <>
      <path d="M 6 14 L 6 38 L 42 38 L 42 18 L 23 18 L 19 13 L 6 13 Z" />
    </>
  ),
};

export const Icon: React.FC<{ readonly id: IconId; readonly size: number; readonly color: string; readonly stroke?: number; readonly style?: React.CSSProperties }> = ({
  id,
  size,
  color,
  stroke = 3.6,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={style}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[id]}
    </g>
  </svg>
);

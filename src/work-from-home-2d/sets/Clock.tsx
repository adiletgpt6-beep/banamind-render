import { box } from "../shots";

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

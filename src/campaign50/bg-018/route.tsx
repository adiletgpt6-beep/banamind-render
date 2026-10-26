// Схема полного маршрута: ҮЙ → МЕКТЕП утром и МЕКТЕП → ҮЙ после уроков
// (одна полная поездка). Условная схема без реальных адресов.
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { CarTopView } from "../../components/CarTopView";
import { abs, C, font } from "./ui";

const W = 900;
const H = 460;
// утро — верхняя дуга, после уроков — нижняя
const MORNING = "M 140 260 C 260 90, 620 90, 760 230";
const AFTER = "M 760 260 C 620 420, 260 420, 140 290";

const House: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    <path d="M 10 48 L 50 12 L 90 48" fill="none" stroke={C.navy} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
    <rect x={22} y={44} width={56} height={46} rx={6} fill={C.white} stroke={C.navy} strokeWidth={6} />
    <rect x={42} y={62} width={16} height={28} rx={3} fill={C.yellow} />
  </svg>
);
const School: React.FC = () => (
  <svg width={170} height={150} viewBox="0 0 120 100">
    <rect x={10} y={36} width={100} height={56} rx={6} fill={C.white} stroke={C.navy} strokeWidth={6} />
    <path d="M 4 40 L 60 8 L 116 40" fill={C.yellow} stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
    {[26, 50, 74].map((x) => (
      <rect key={x} x={x} y={52} width={16} height={14} rx={2} fill="#9FC1DD" />
    ))}
    <rect x={52} y={72} width={16} height={20} rx={2} fill={C.navy} />
  </svg>
);

// progress: 0…1 — машина проходит утро (0…0,5) и обратный путь (0,5…1).
export const RouteMap: React.FC<{ progress: number; scale?: number; labels?: number }> = ({ progress, scale = 1, labels = 1 }) => {
  const leg = progress < 0.5 ? MORNING : AFTER;
  const u = progress < 0.5 ? progress / 0.5 : (progress - 0.5) / 0.5;
  const len = getLength(leg);
  const p = getPointAtLength(leg, Math.max(0.01, Math.min(len - 0.01, u * len))) ?? { x: 140, y: 260 };
  const tg = getTangentAtLength(leg, Math.max(0.01, Math.min(len - 0.01, u * len))) ?? { x: 1, y: 0 };
  const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI + 90;
  const dash = (d: string, done: number) => {
    const l = getLength(d);
    return { strokeDasharray: `${l * done} ${l}` };
  };
  const mDone = Math.min(1, progress / 0.5);
  const aDone = Math.max(0, (progress - 0.5) / 0.5);
  return (
    <div style={{ position: "relative", width: W * scale, height: H * scale }}>
      <div style={abs({ left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" })}>
        <div style={abs({ inset: 0, borderRadius: 36, background: "#EAF2FB", backgroundImage: "linear-gradient(rgba(22,52,107,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(22,52,107,0.05) 2px, transparent 2px)", backgroundSize: "60px 60px" })} />
        <svg width={W} height={H} style={abs({ left: 0, top: 0 })}>
          <path d={MORNING} fill="none" stroke="rgba(22,52,107,0.15)" strokeWidth={14} strokeLinecap="round" />
          <path d={AFTER} fill="none" stroke="rgba(22,52,107,0.15)" strokeWidth={14} strokeLinecap="round" />
          <path d={MORNING} fill="none" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" style={dash(MORNING, mDone)} />
          <path d={AFTER} fill="none" stroke={C.navySoft} strokeWidth={14} strokeLinecap="round" style={dash(AFTER, aDone)} />
        </svg>
        <div style={abs({ left: 40, top: 200 })}>
          <House />
        </div>
        <div style={abs({ left: 700, top: 170 })}>
          <School />
        </div>
        <div style={abs({ left: 40, top: 350, opacity: labels, ...font(34, 1000, C.navy) })}>ҮЙ</div>
        <div style={abs({ left: 700, top: 322, opacity: labels, ...font(34, 1000, C.navy) })}>МЕКТЕП</div>
        <div style={abs({ left: 380, top: 66, opacity: labels, ...font(28, 900, "#B98400") })}>эртең менен</div>
        <div style={abs({ left: 360, top: 372, opacity: labels, ...font(28, 900, C.navySoft) })}>сабактан кийин</div>
        <div style={abs({ left: p.x - 22, top: p.y - 40, transform: `rotate(${ang}deg)` })}>
          <CarTopView size={80} />
        </div>
      </div>
    </div>
  );
};

// Подпись «ҮЙ → МЕКТЕП → ҮЙ».
export const RouteLine: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3, ...font(size, 1000, C.navy) }}>
    <span>ҮЙ</span>
    <span style={{ color: C.yellow }}>→</span>
    <span>МЕКТЕП</span>
    <span style={{ color: C.yellow }}>→</span>
    <span>ҮЙ</span>
  </div>
);

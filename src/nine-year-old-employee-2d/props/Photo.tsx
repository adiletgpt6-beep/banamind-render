// В. Фотография друзей: напечатанный снимок с белой рамкой. Во дворе трое
// друзей у картонного корабля, рубка уже собрана, мачта ещё лежит на земле.
// Бектура на снимке нет. Лицевая сторона и положение деталей одинаковы во
// всех кадрах. PhotoArt: (0, 0) — центр, ширина w, высота w · PHOTO_RATIO.
import { C } from "../theme";
import { ShipReal } from "./Ship";

export const PHOTO_RATIO = 0.8;

// Друзья (те же цвета, что у персонажей двора: розовая кофта и косички,
// зелёная футболка и кепка, оранжевая толстовка).
export const FRIEND_COLORS = { a: "#F0ACC5", b: "#5FA35A", c: "#F08A3C" } as const;

const Kid: React.FC<{ x: number; y: number; s: number; top: string; hair: "braids" | "cap" | "short"; arm?: number }> = ({ x, y, s, top, hair, arm = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-90} width={16} height={92} rx={8} fill="#2E3550" />
    <rect x={6} y={-90} width={16} height={92} rx={8} fill="#2E3550" />
    <rect x={-40} y={-210} width={80} height={130} rx={30} fill={top} />
    <path d={`M 34 -190 L ${70 + arm * 10} ${-150 - arm * 70}`} stroke={top} strokeWidth={22} strokeLinecap="round" />
    <path d="M -34 -190 L -54 -120" stroke={top} strokeWidth={22} strokeLinecap="round" />
    <circle cx={0} cy={-250} r={46} fill="#E8B48D" />
    {hair === "braids" ? (
      <g fill="#2A1F1C">
        <path d="M -48 -250 Q -50 -306 0 -304 Q 50 -306 48 -250 Q 30 -278 0 -276 Q -30 -278 -48 -250 Z" />
        <ellipse cx={-50} cy={-220} rx={12} ry={30} />
        <ellipse cx={50} cy={-220} rx={12} ry={30} />
      </g>
    ) : hair === "cap" ? (
      <g>
        <path d="M -48 -258 Q -46 -308 0 -306 Q 46 -308 48 -258 Z" fill="#2439F5" />
        <rect x={0} y={-266} width={66} height={14} rx={7} fill="#2439F5" />
      </g>
    ) : (
      <path d="M -48 -246 Q -50 -306 0 -304 Q 50 -306 48 -246 Q 26 -270 -10 -268 Q -36 -266 -48 -246 Z" fill="#3B2B24" />
    )}
    <circle cx={-15} cy={-248} r={5} fill="#1E1B26" />
    <circle cx={15} cy={-248} r={5} fill="#1E1B26" />
    <path d="M -14 -226 Q 0 -214 14 -226" stroke="#B86A62" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// Сцена на снимке (без рамки): ширина 1000, высота 800 (координаты снимка).
export const PhotoScene: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1000} height={800} fill="#CFE3F2" />
    <rect x={0} y={0} width={1000} height={260} fill="#BFD7EC" />
    {/* жилой дом на дальнем плане */}
    <rect x={40} y={90} width={360} height={360} fill="#E9DCC7" />
    {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={66 + c * 82} y={120 + r * 100} width={52} height={60} fill="#9FB6CE" />))}
    <rect x={0} y={520} width={1000} height={280} fill="#B9C98C" />
    <rect x={0} y={500} width={1000} height={40} fill="#A9BB7C" />
    <g transform="translate(520 690) scale(0.62)">
      <ShipReal stage={{ cabin: true, mast: "lying" }} />
    </g>
    <Kid x={170} y={700} s={0.92} top={FRIEND_COLORS.a} hair="braids" arm={1} />
    <Kid x={830} y={706} s={0.98} top={FRIEND_COLORS.c} hair="short" />
    <Kid x={690} y={720} s={0.86} top={FRIEND_COLORS.b} hair="cap" arm={0.6} />
  </g>
);

export const PhotoArt: React.FC<{ readonly w: number; readonly detail?: boolean }> = ({ w, detail = true }) => {
  const h = w * PHOTO_RATIO;
  const m = w * 0.05; // белая рамка
  const iw = w - 2 * m;
  const ih = h - 2 * m - w * 0.04;
  return (
    <g>
      <rect x={-w / 2 + w * 0.015} y={-h / 2 + w * 0.02} width={w} height={h} fill="rgba(0,0,0,0.16)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.008} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={Math.max(1, w * 0.004)} />
      {detail ? (
        <svg x={-w / 2 + m} y={-h / 2 + m} width={iw} height={ih} viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
          <PhotoScene />
        </svg>
      ) : (
        <g>
          <rect x={-w / 2 + m} y={-h / 2 + m} width={iw} height={ih} fill="#CFE3F2" />
          <rect x={-w / 2 + m} y={-h / 2 + m + ih * 0.62} width={iw} height={ih * 0.38} fill="#B9C98C" />
          <path d={`M ${-iw * 0.25} ${-h / 2 + m + ih * 0.66} L ${iw * 0.3} ${-h / 2 + m + ih * 0.66} L ${iw * 0.24} ${-h / 2 + m + ih * 0.86} L ${-iw * 0.2} ${-h / 2 + m + ih * 0.86} Z`} fill={C.cardboard} />
          <rect x={-iw * 0.18} y={-h / 2 + m + ih * 0.46} width={iw * 0.14} height={ih * 0.2} fill={C.cardboardLight} />
          <circle cx={-iw * 0.38} cy={-h / 2 + m + ih * 0.5} r={iw * 0.05} fill={FRIEND_COLORS.a} />
          <circle cx={iw * 0.38} cy={-h / 2 + m + ih * 0.5} r={iw * 0.05} fill={FRIEND_COLORS.c} />
        </g>
      )}
    </g>
  );
};

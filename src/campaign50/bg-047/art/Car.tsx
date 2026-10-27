// Белая легковая машина BalaGo (вид сбоку, бумажная аппликация) с
// жёлтыми акцентами: водитель держит руль обеими руками, дети-точки сзади
// на своих местах, у каждого — ремень безопасности по диагонали.
// Рисунок 460 × 230, смотрит вправо; опорная точка — середина низа колёс.
import { Img, staticFile } from "remotion";
import { ASSETS } from "../../../config";
import { C, DOT_COLORS, type DotColor } from "./palette";

export const CAR_W = 460;
export const CAR_H = 230;

const Wheel: React.FC<{ readonly x: number; readonly spin: number }> = ({ x, spin }) => (
  <g transform={`translate(${x} 188)`}>
    <circle r={38} fill="#2B3448" stroke="#FFFFFF" strokeWidth={5} />
    <circle r={20} fill="#C9D3E6" />
    <g transform={`rotate(${spin})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={-3} y={-18} width={6} height={14} rx={2} fill="#7C89A6" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={6} fill="#2B3448" />
  </g>
);

export const Car: React.FC<{
  readonly spin?: number; // угол колёс, градусы
  readonly kids?: readonly DotColor[]; // дети на заднем сиденье
  readonly kidsIn?: readonly number[]; // 0…1 — ребёнок сел (появился в окне)
  readonly bounce?: number;
  readonly dir?: number; // 1 — вправо, −1 — машина отражена (логотип не зеркалится)
}> = ({ spin = 0, kids = [], kidsIn = [], bounce = 0, dir = 1 }) => (
  <svg width={CAR_W} height={CAR_H} viewBox={`0 0 ${CAR_W} ${CAR_H}`} style={{ overflow: "visible" }}>
    <g transform={`translate(0 ${bounce})`}>
      {/* кузов */}
      <path
        d="M24 170 L24 128 Q 26 106 52 100 L 112 92 L 160 44 Q 172 32 192 32 L 318 32 Q 338 32 352 46 L 398 96 L 424 102 Q 446 108 446 132 L 446 170 Q 446 178 438 178 L 30 178 Q 24 178 24 170 Z"
        fill="#FFFFFF"
        stroke={C.navy}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* окна */}
      <path d="M128 98 L 170 54 Q 176 48 186 48 L 250 48 L 250 98 Z" fill="#CFE3F6" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
      <path d="M262 98 L 262 48 L 314 48 Q 326 48 334 56 L 376 98 Z" fill="#CFE3F6" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
      {/* водитель (переднее окно справа): голова, плечи, руки на руле */}
      <g>
        <circle cx={318} cy={70} r={15} fill={C.skin} stroke={C.navy} strokeWidth={3} />
        <path d="M303 66 Q 318 48 333 66 L 333 60 Q 318 46 303 60 Z" fill={C.navy} />
        <path d="M296 98 Q 300 82 318 82 Q 336 82 340 98 Z" fill={C.navySoft} />
        <path d="M346 70 A 18 18 0 0 1 352 98" fill="none" stroke="#2B3448" strokeWidth={6} strokeLinecap="round" />
        <path d="M330 88 L 348 80" stroke={C.skin} strokeWidth={7} strokeLinecap="round" />
      </g>
      {/* дети сзади, каждый на своём сиденье, ремень — ниже лица */}
      {kids.map((k, i) => {
        const p = kidsIn[i] ?? 1;
        const cx = 150 + i * 38;
        const cy = 82;
        const col = DOT_COLORS[k];
        return (
          <g key={i}>
            <rect x={cx - 16} y={cy - 22} width={32} height={40} rx={10} fill="#9DB4D6" opacity={0.7} />
            {p > 0.01 ? (
              <g opacity={Math.min(1, p * 1.5)} transform={`translate(0 ${(1 - p) * 20})`}>
                <circle cx={cx} cy={cy} r={16} fill={col.fill} stroke="#FFFFFF" strokeWidth={3} />
                <circle cx={cx - 5} cy={cy - 6} r={3.1} fill={C.navy} />
                <circle cx={cx + 5} cy={cy - 6} r={3.1} fill={C.navy} />
                <path d={`M${cx - 5} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 5} ${cy + 1}`} fill="none" stroke={C.navy} strokeWidth={2.4} strokeLinecap="round" />
                <path d={`M${cx + 12} ${cy + 3} L ${cx - 14} ${cy + 13}`} stroke="#5D6F94" strokeWidth={5} strokeLinecap="round" />
                <circle cx={cx - 9} cy={cy + 11} r={2.6} fill="#C9D3E6" />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* стойка и жёлтая полоса бренда */}
      <rect x={250} y={46} width={12} height={54} fill="#FFFFFF" stroke={C.navy} strokeWidth={3} />
      <path d="M30 132 L 440 132 L 440 148 L 30 148 Z" fill={C.yellow} />
      <line x1={256} y1={104} x2={256} y2={172} stroke="#C9D3E6" strokeWidth={4} />
      <rect x={210} y={112} width={26} height={6} rx={3} fill="#9AA6C2" />
      <rect x={300} y={112} width={26} height={6} rx={3} fill="#9AA6C2" />
      {/* фары */}
      <path d="M432 112 L 446 114 L 446 128 L 432 126 Z" fill={C.yellow} stroke={C.navy} strokeWidth={3} />
      <rect x={24} y={112} width={12} height={16} rx={3} fill="#FF8C7A" stroke={C.navy} strokeWidth={3} />
      {/* наклейка-логотип на двери */}
      <circle cx={192} cy={156} r={20} fill="#FFFFFF" stroke={C.navy} strokeWidth={3} />
      <g transform={`translate(192 156) scale(${dir < 0 ? -1 : 1} 1) translate(-192 -156)`}>
        <foreignObject x={174} y={138} width={36} height={36}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 36, height: 36, borderRadius: 18 }} />
        </foreignObject>
      </g>
    </g>
    <Wheel x={110} spin={spin} />
    <Wheel x={362} spin={spin} />
  </svg>
);

// Бумажная мама у дома: платье цвета рукава (те же руки, что в кадре).
export const PaperMom: React.FC<{ readonly wave?: number; readonly arms?: number }> = ({ wave = 0, arms = 0 }) => (
  <svg width={130} height={260} viewBox="0 0 130 260" style={{ overflow: "visible" }}>
    <path d="M40 120 L 22 252 L 108 252 L 90 120 Z" fill={C.sleeve} stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
    <rect x={44} y={96} width={42} height={40} rx={14} fill={C.sleeve} stroke="#FFFFFF" strokeWidth={4} />
    <path d={`M46 112 Q 20 ${132 - 40 * arms} ${12 - 4 * arms} ${150 - 70 * arms}`} fill="none" stroke={C.skin} strokeWidth={10} strokeLinecap="round" />
    <path d={`M84 112 Q 110 ${100 - 10 * wave} ${118 + 6 * Math.sin(wave * 6)} ${70 - 6 * wave}`} fill="none" stroke={C.skin} strokeWidth={10} strokeLinecap="round" />
    <circle cx={65} cy={66} r={28} fill={C.skin} stroke="#FFFFFF" strokeWidth={4} />
    <path d="M37 66 Q 38 34 65 34 Q 92 34 93 64 Q 80 50 60 50 Q 46 52 37 66 Z" fill="#3B2A22" />
    <circle cx={65} cy={30} r={13} fill="#3B2A22" />
    <circle cx={55} cy={68} r={3.4} fill={C.navy} />
    <circle cx={75} cy={68} r={3.4} fill={C.navy} />
    <path d="M56 80 Q 65 88 74 80" fill="none" stroke={C.navy} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

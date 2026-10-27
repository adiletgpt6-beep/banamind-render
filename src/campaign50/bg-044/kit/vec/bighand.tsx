// Крупная рука мамы для вставок с телефоном: правая кисть с тыльной
// стороны и мягко-голубой манжетой рукава.
//  • "tap" / "point": указательный палец вытянут, остальные согнуты;
//    опора (x, y) — точка касания кончиком пальца; press 0…1 — палец
//    опускается к экрану (0 — висит над точкой, 1 — касается).
//  • "hold": левая (по умолчанию) рука держит телефон снизу; опора —
//    середина нижнего края телефона; ширина телефона в единицах руки —
//    holdWidth (по умолчанию 200): scale = ширина телефона на экране / holdWidth.
//    Телефон (HTML) кладётся МЕЖДУ слоями layer="back" и layer="front".
// Рука уходит рукавом за нижний край кадра; angle поворачивает её вокруг опоры.
import { C } from "../../palette";
import { INK, capsulePath, smoothPath, pt, type Pt } from "./core";

export type HandProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly variant: "tap" | "point" | "hold";
  readonly press?: number;
  readonly angle?: number; // градусы; 0 — палец вверх, рукав вниз-вправо
  readonly flip?: boolean; // зеркально (левая и правая)
  readonly layer?: "all" | "back" | "front";
  readonly holdWidth?: number;
  readonly ripple?: boolean; // мягкий круг касания при press ≈ 1
  readonly opacity?: number;
};

const SKIN = C.skin;
const SHADE = C.skinShade;
const NAIL = "#F5D3BF";
const SLEEVE = C.momTop;
const SLEEVE_SHADE = C.momTopShade;
const CUFF = "#86A3DD";
const OW = 4.5;

const Out: React.FC<{ d: string; fill: string; w?: number }> = ({ d, fill, w = OW }) => <path d={d} fill={fill} stroke={INK} strokeWidth={w} strokeLinejoin="round" />;

// Указательный жест (тыльная сторона правой руки). Кончик пальца в (0,0).
const PointHand: React.FC = () => {
  const index = capsulePath(pt(0, 22), pt(8, 168), 21, 25);
  const back = smoothPath([pt(-20, 150), pt(-30, 214), pt(-14, 286), pt(14, 330), pt(108, 334), pt(136, 270), pt(138, 206), pt(112, 168), pt(60, 150), pt(20, 140)], true, 0.9);
  const fingers: { a: Pt; b: Pt; ra: number; rb: number }[] = [
    { a: pt(52, 168), b: pt(58, 226), ra: 23, rb: 22 },
    { a: pt(88, 180), b: pt(94, 234), ra: 21, rb: 20 },
    { a: pt(118, 198), b: pt(122, 244), ra: 18, rb: 17 },
  ];
  const thumb1 = capsulePath(pt(-14, 268), pt(-36, 206), 27, 22);
  const thumb2 = capsulePath(pt(-36, 206), pt(-20, 166), 22, 18);
  return (
    <g>
      {/* рукав и манжета */}
      <Out d={`M 0 340 L 128 340 L 190 900 L -40 900 Z`} fill={SLEEVE} />
      <path d={`M 90 360 L 128 352 L 186 900 L 120 900 Z`} fill={SLEEVE_SHADE} opacity={0.8} />
      <Out d={smoothPath([pt(-8, 318), pt(132, 314), pt(140, 372), pt(-14, 378)], true, 0.5)} fill={CUFF} />
      <path d="M 2 356 Q 64 350 128 346" stroke={SLEEVE_SHADE} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* тыльная сторона кисти */}
      <Out d={back} fill={SKIN} />
      <path d={smoothPath([pt(96, 300), pt(130, 262), pt(134, 214), pt(118, 236), pt(104, 284)], true, 0.8)} fill={SHADE} opacity={0.55} />
      {/* согнутые пальцы (видны костяшки) */}
      {fingers
        .slice()
        .reverse()
        .map((g, i) => (
          <g key={i}>
            <Out d={capsulePath(g.a, g.b, g.ra, g.rb)} fill={SKIN} />
            <path d={`M ${g.b.x - g.rb * 0.6} ${g.b.y + g.rb * 0.15} Q ${g.b.x} ${g.b.y + g.rb * 0.55} ${g.b.x + g.rb * 0.6} ${g.b.y + g.rb * 0.15}`} stroke={SHADE} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <path d={`M ${g.a.x - g.ra * 0.4} ${g.a.y - 2} Q ${g.a.x} ${g.a.y + 5} ${g.a.x + g.ra * 0.4} ${g.a.y - 2}`} stroke={SHADE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
          </g>
        ))}
      {/* указательный */}
      <Out d={index} fill={SKIN} />
      <path d={capsulePath(pt(12, 40), pt(18, 160), 6, 8)} fill={SHADE} opacity={0.45} />
      {/* ноготь */}
      <path d={`M -12 30 C -12 10 12 10 12 30 L 11 48 C 4 52 -4 52 -11 48 Z`} fill={NAIL} stroke={SHADE} strokeWidth={2.5} />
      <path d={`M -9 22 C -6 13 6 13 9 22`} stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* складки суставов */}
      <path d="M -10 72 Q 2 77 14 72" stroke={SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -12 116 Q 2 123 16 116" stroke={SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -6 124 Q 2 127 10 124" stroke={SHADE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {/* большой палец */}
      <Out d={thumb1} fill={SKIN} />
      <Out d={thumb2} fill={SKIN} />
      <path d={capsulePath(pt(-14, 268), pt(-36, 206), 27, 22)} fill="none" />
      <path d="M -38 176 C -36 164 -26 160 -20 164" stroke={NAIL} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M -54 214 Q -40 222 -24 214" stroke={SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

// Левая рука держит телефон шириной W снизу (середина нижнего края в (0,0)).
const HoldBack: React.FC<{ readonly W: number }> = ({ W }) => {
  const L = -W / 2;
  const R = W / 2;
  // пальцы за телефоном выходят за правый край
  const fingerYs = [-250, -196, -142];
  return (
    <g>
      <Out d={`M ${L - 70} 120 L ${L + 120} 150 L ${L + 160} 900 L ${L - 200} 900 Z`} fill={SLEEVE} />
      <path d={`M ${L + 60} 170 L ${L + 120} 160 L ${L + 158} 900 L ${L + 70} 900 Z`} fill={SLEEVE_SHADE} opacity={0.8} />
      <Out d={smoothPath([pt(L - 76, 96), pt(L + 124, 128), pt(L + 120, 186), pt(L - 86, 156)], true, 0.5)} fill={CUFF} />
      {/* ладонь за телефоном */}
      <Out d={smoothPath([pt(L - 34, -150), pt(L + 40, -230), pt(R - 10, -270), pt(R + 20, -120), pt(R - 30, 30), pt(L + 110, 112), pt(L - 40, 96), pt(L - 52, -40)], true, 0.9)} fill={SKIN} />
      <path d={smoothPath([pt(L - 40, 60), pt(L + 100, 100), pt(L + 40, 70), pt(L - 30, 30)], true, 0.8)} fill={SHADE} opacity={0.5} />
      {fingerYs.map((fy, i) => (
        <Out key={i} d={capsulePath(pt(R - 30, fy + 6), pt(R + 14, fy), 19 - i, 18 - i)} fill={SKIN} />
      ))}
      <Out d={capsulePath(pt(R - 40, -86), pt(R + 6, -92), 16, 15)} fill={SKIN} />
    </g>
  );
};
const HoldFront: React.FC<{ readonly W: number }> = ({ W }) => {
  const L = -W / 2;
  const R = W / 2;
  const fingerYs = [-250, -196, -142];
  return (
    <g>
      {/* кончики пальцев заходят на правый край */}
      {fingerYs.map((fy, i) => (
        <g key={i}>
          <Out d={capsulePath(pt(R + 12, fy), pt(R - 8, fy + 3), 17 - i, 15 - i)} fill={SKIN} />
          <path d={`M ${R - 14 - (15 - i) * 0.4} ${fy - 6} Q ${R - 18 - (15 - i)} ${fy + 3} ${R - 14 - (15 - i) * 0.4} ${fy + 12}`} stroke={NAIL} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* большой палец через левый край */}
      <Out d={capsulePath(pt(L - 46, 40), pt(L - 12, -96), 30, 23)} fill={SKIN} />
      <Out d={capsulePath(pt(L - 12, -96), pt(L + 22, -150), 23, 19)} fill={SKIN} />
      <path d={`M ${L + 10} ${-160} C ${L + 22} ${-170} ${L + 34} ${-160} ${L + 34} ${-148}`} stroke={NAIL} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M ${L - 40} ${-74} Q ${L - 22} ${-66} ${L - 6} ${-78}`} stroke={SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Hand: React.FC<HandProps> = ({ x, y, scale = 1, variant, press = 1, angle = 0, flip, layer = "all", holdWidth = 200, ripple, opacity }) => {
  if (variant === "hold") {
    const sx = flip ? -scale : scale;
    return (
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${sx} ${scale})`} opacity={opacity}>
        {layer !== "front" ? <HoldBack W={holdWidth} /> : null}
        {layer !== "back" ? <HoldFront W={holdWidth} /> : null}
      </g>
    );
  }
  const p = variant === "point" ? 0 : Math.max(0, Math.min(1, press));
  // палец над экраном: чуть ниже-правее и «ближе к камере» (крупнее)
  const lift = 1 - p;
  const k = 1 + 0.05 * lift;
  const dx = 10 * lift;
  const dy = 26 * lift;
  const sx = flip ? -scale : scale;
  if (layer === "back") return null;
  return (
    <g opacity={opacity}>
      {ripple && p > 0.85 ? (
        <g transform={`translate(${x} ${y})`}>
          <circle r={34 * scale} fill="#FFFFFF" opacity={0.45} />
          <circle r={50 * scale} fill="none" stroke="#FFFFFF" strokeWidth={4 * scale} opacity={0.5} />
        </g>
      ) : null}
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${sx} ${scale}) translate(${dx} ${dy}) scale(${k})`}>
        <PointHand />
      </g>
    </g>
  );
};

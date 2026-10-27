// Руки мамы держат бумажную ленту за боковые края, как держат лист:
// большой палец лежит на лицевой стороне бумаги, остальные пальцы — за
// листом, видна внешняя сторона кисти, манжета светлой блузки и рукав
// синего жакета, уходящий вниз за край кадра.
// Рисуется в два слоя: layer="back" (рукав и кисть — до ленты в DOM) и
// layer="front" (большие пальцы — после ленты).
// Мировые координаты ленты; spec.y — высота, где большой палец держит
// край ленты.
import { RIB, RIB_X } from "../ribbon";
import { clamp, lerp } from "../rig/motion";

const SKIN = "#E6B590";
const SKIN_SHADE = "#C99470";
const SKIN_DARK = "#D6A27C";
const NAIL = "#F4D6BF";
const SLEEVE = "#2F4C86";
const SLEEVE_SHADE = "#263F72";
const CUFF = "#FFE9A6";

export type HoldSpec = {
  readonly y: number; // высота хвата (мир)
  readonly show: number; // 0…1 — руки в кадре (уходят вниз)
  readonly lift?: number; // 0…1 — большой палец отпустил бумагу (перехват)
  readonly spread?: number; // px — кисти чуть разведены наружу
  readonly size?: number; // масштаб кисти
  readonly tilt?: number; // градусы — кисти чуть повёрнуты (тянут к себе)
};

// Одна кисть в своей системе: (0, 0) — точка хвата на краю листа,
// +x — внутрь листа, +y — вниз.
const HandBack: React.FC<{ readonly open: number }> = ({ open }) => (
  <g>
    {/* рукав жакета и манжета блузки */}
    <path d="M -96 118 Q -230 420 -420 860 L -150 900 Q -20 470 24 140 Z" fill={SLEEVE} />
    <path d="M -40 150 Q -130 460 -270 880 L -200 890 Q -76 470 -6 156 Z" fill={SLEEVE_SHADE} opacity={0.5} />
    <path d="M -100 96 Q -34 70 34 104 L 28 152 Q -36 120 -108 142 Z" fill={CUFF} />
    {/* внешняя сторона кисти; пальцы — за листом */}
    <path
      d={`M -92 106 C -122 52 -124 -18 -104 -62 C -90 -96 -56 ${-118 - open * 8} -14 -118 L 40 -116 L 40 112 C 4 130 -48 132 -92 106 Z`}
      fill={SKIN}
      stroke={SKIN_SHADE}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    <path d="M -104 -56 C -92 -86 -64 -104 -30 -108 C -60 -94 -84 -78 -96 -48 Z" fill={SKIN_DARK} opacity={0.6} />
    {/* складки у основания пальцев */}
    <path d="M -96 -20 Q -80 -40 -54 -46" stroke={SKIN_SHADE} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <path d="M -100 22 Q -86 6 -64 2" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

// Большой палец на лицевой стороне бумаги (тянется вверх и внутрь).
const Thumb: React.FC<{ readonly open: number }> = ({ open }) => (
  <g transform={`rotate(${-open * 24} -40 50)`}>
    <path
      d="M -46 70 C -62 28 -40 -4 -6 -24 L 52 -62 C 74 -76 96 -66 98 -46 C 100 -30 88 -20 74 -12 L 22 26 C 2 46 -14 78 -46 70 Z"
      fill={SKIN}
      stroke={SKIN_SHADE}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    <path d="M 62 -56 C 76 -66 92 -60 92 -48 C 92 -38 82 -32 72 -30 C 62 -30 56 -46 62 -56 Z" fill={NAIL} />
    <path d="M 14 -6 Q 22 4 20 16" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

export const HoldHands: React.FC<{ readonly f: number; readonly spec: HoldSpec; readonly layer: "back" | "front" }> = ({ f, spec, layer }) => {
  if (spec.show <= 0.001) return null;
  const s = spec.size ?? 1;
  const drop = (1 - clamp(spec.show)) * 900;
  const open = clamp(spec.lift ?? 0);
  const spread = spec.spread ?? 0;
  const hands = ([-1, 1] as const).map((side) => {
    // лёгкое дыхание, у каждой руки своя фаза
    const breathe = Math.sin(f / 26 + (side > 0 ? 1.1 : 0)) * 3;
    const x = side < 0 ? RIB_X - spread : RIB_X + RIB.w + spread;
    const y = spec.y + drop + breathe + lerp(0, 8, open);
    return (
      <g key={side} transform={`translate(${x} ${y}) scale(${side < 0 ? s : -s} ${s}) rotate(${spec.tilt ?? 0})`}>
        {layer === "back" ? <HandBack open={open} /> : <Thumb open={open} />}
      </g>
    );
  });
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {hands}
    </svg>
  );
};

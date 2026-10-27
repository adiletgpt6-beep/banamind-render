// Рука мамы, вид сверху (ладонь вниз, пальцы «вперёд» = вверх кадра,
// рукав уходит за нижний край). Поза задаётся параметрами (вытянутость
// пальцев, положение большого пальца), поэтому позы плавно смешиваются:
// mixPose(a, b, t). Правая рука — большой палец слева; левая — зеркально.
//
// Якорь: anchor = "tip" — кончик указательного пальца в точке (x, y)
// (удобно «нажимать» на ячейку), "wrist" — запястье в точке (x, y).
// angle — поворот всей руки, градусы (0 — рука снизу, пальцы вверх).
// lift 0…1 — рука приподнята над столом (тень дальше и мягче).
import type React from "react";
import { useId } from "react";
import { C } from "../palette";
import { lerp } from "./motion";

export type HandPose = {
  readonly ext: readonly [number, number, number, number]; // указ., средн., безым., мизинец: 1 — вытянут
  readonly spread: number; // веер пальцев 0…1
  readonly thumb: number; // угол большого пальца (−55 отведён … +20 к указательному)
  readonly thumbExt: number; // 0…1
  readonly indexBend: number; // наклон указательного внутрь (щипок), градусы
};

export const POSES = {
  rest: { ext: [0.94, 0.95, 0.93, 0.9], spread: 0.55, thumb: -40, thumbExt: 1, indexBend: 0 },
  point: { ext: [1, 0.06, 0.05, 0.05], spread: 0.15, thumb: -12, thumbExt: 0.75, indexBend: 0 },
  flat: { ext: [1, 1, 1, 1], spread: 0.04, thumb: -16, thumbExt: 0.95, indexBend: 0 },
  pinch: { ext: [0.78, 0.22, 0.18, 0.16], spread: 0.1, thumb: 22, thumbExt: 1, indexBend: 16 },
} as const satisfies Record<string, HandPose>;

export type PoseName = keyof typeof POSES;

const asPose = (p: PoseName | HandPose): HandPose => (typeof p === "string" ? POSES[p] : p);

export const mixPose = (a: PoseName | HandPose, b: PoseName | HandPose, t: number): HandPose => {
  const A = asPose(a);
  const B = asPose(b);
  const u = Math.max(0, Math.min(1, t));
  return {
    ext: [0, 1, 2, 3].map((i) => lerp(A.ext[i], B.ext[i], u)) as unknown as HandPose["ext"],
    spread: lerp(A.spread, B.spread, u),
    thumb: lerp(A.thumb, B.thumb, u),
    thumbExt: lerp(A.thumbExt, B.thumbExt, u),
    indexBend: lerp(A.indexBend, B.indexBend, u),
  };
};

// Геометрия пальцев (локально: запястье (0, 0), пальцы к −y).
const KNUCKLE_Y = -122;
const FINGERS = [
  { x: -40, w: 26, len: 92, base: -7 }, // указательный
  { x: -13, w: 27.5, len: 102, base: -1 }, // средний
  { x: 14, w: 25.5, len: 94, base: 5 }, // безымянный
  { x: 39, w: 21.5, len: 74, base: 12 }, // мизинец
] as const;
const CURLED = 30;

const fingerLen = (i: number, ext: number) => lerp(CURLED, FINGERS[i].len, Math.max(0, Math.min(1, ext)));
const fingerAngle = (i: number, p: HandPose) => FINGERS[i].base * (0.35 + p.spread) + (i === 0 ? p.indexBend : 0);

// Кончик указательного пальца в локальных координатах руки.
export const indexTip = (p: HandPose) => {
  const a = (fingerAngle(0, p) * Math.PI) / 180;
  const l = fingerLen(0, p.ext[0]) - 4;
  return { x: FINGERS[0].x + Math.sin(a) * l, y: KNUCKLE_Y - Math.cos(a) * l };
};

const Finger: React.FC<{ i: number; p: HandPose; skinId: string }> = ({ i, p, skinId }) => {
  const f = FINGERS[i];
  const ext = p.ext[i];
  const L = fingerLen(i, ext);
  const a = fingerAngle(i, p);
  const w = f.w * (0.9 + 0.1 * ext);
  const nail = Math.max(0, Math.min(1, (ext - 0.45) / 0.4));
  return (
    <g transform={`translate(${f.x} ${KNUCKLE_Y + 8}) rotate(${a})`}>
      <rect x={-w / 2} y={-L - 8} width={w} height={L + 18} rx={w / 2} fill={`url(#${skinId})`} />
      {/* поджатый палец темнее: видна согнутая фаланга */}
      <rect x={-w / 2} y={-L - 8} width={w} height={L + 18} rx={w / 2} fill={C.skinShade} opacity={0.55 * (1 - ext)} />
      {nail > 0 ? (
        <rect
          x={-w * 0.31}
          y={-L - 4}
          width={w * 0.62}
          height={w * 0.72}
          rx={w * 0.28}
          fill={C.nail}
          stroke="rgba(170,110,80,0.25)"
          strokeWidth={1}
          opacity={nail}
        />
      ) : null}
      {ext > 0.6 ? (
        <g stroke="rgba(150,90,60,0.28)" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={(ext - 0.6) / 0.4}>
          <path d={`M ${-w * 0.22} ${-L * 0.42} q ${w * 0.22} 3 ${w * 0.44} 0`} />
          <path d={`M ${-w * 0.2} ${-L * 0.7} q ${w * 0.2} 2.5 ${w * 0.4} 0`} />
        </g>
      ) : null}
    </g>
  );
};

export const TopHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly pose: PoseName | HandPose;
  readonly angle?: number;
  readonly side?: "right" | "left";
  readonly anchor?: "tip" | "wrist";
  readonly s?: number;
  readonly lift?: number;
  readonly opacity?: number;
  readonly sleeve?: string;
}> = ({ x, y, pose, angle = 0, side = "right", anchor = "tip", s = 1, lift = 0, opacity = 1, sleeve = C.sleeve }) => {
  const uid = useId().replace(/:/g, "");
  const p = asPose(pose);
  const tip = indexTip(p);
  const mx = side === "left" ? -1 : 1;
  // смещение якоря в локальных координатах (до зеркала и поворота)
  const ax = anchor === "tip" ? tip.x * mx : 0;
  const ay = anchor === "tip" ? tip.y : 0;
  const k = s * (1 + 0.05 * lift);
  const skinId = `skin-${uid}`;
  const shadowId = `sh-${uid}`;
  return (
    <svg
      width={10}
      height={10}
      style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity }}
    >
      <defs>
        <linearGradient id={skinId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="1" stopColor="#F0C3A2" />
        </linearGradient>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx={8 + 22 * lift}
            dy={12 + 30 * lift}
            stdDeviation={6 + 10 * lift}
            floodColor="#283046"
            floodOpacity={0.26 - 0.08 * lift}
          />
        </filter>
      </defs>
      <g transform={`rotate(${angle}) scale(${k}) translate(${-ax} ${-ay})`}>
        <g transform={`scale(${mx} 1)`} filter={`url(#${shadowId})`}>
          {/* рукав и предплечье */}
          <path d="M -50 -6 L 50 -6 L 56 70 L -56 70 Z" fill={`url(#${skinId})`} />
          <path d="M -78 52 Q -76 34 -56 32 L 56 32 Q 76 34 78 52 L 92 1200 L -92 1200 Z" fill={sleeve} />
          <path d="M -78 52 Q -76 34 -56 32 L 56 32 Q 76 34 78 52 L 79 74 L -79 74 Z" fill={C.sleeveShade} />
          {[-60, -40, -20, 0, 20, 40, 60].map((rx) => (
            <rect key={rx} x={rx - 2} y={38} width={4} height={34} rx={2} fill="rgba(255,255,255,0.14)" />
          ))}
          {/* большой палец */}
          <g transform={`translate(-44 -50) rotate(${p.thumb})`}>
            <rect x={-15} y={-(20 + 60 * p.thumbExt) - 8} width={30} height={20 + 60 * p.thumbExt + 26} rx={15} fill={`url(#${skinId})`} />
            <rect
              x={-9}
              y={-(20 + 60 * p.thumbExt) - 4}
              width={18}
              height={20}
              rx={8}
              fill={C.nail}
              stroke="rgba(170,110,80,0.25)"
              strokeWidth={1}
            />
          </g>
          {/* пальцы */}
          {[3, 2, 1, 0].map((i) => (
            <Finger key={i} i={i} p={p} skinId={skinId} />
          ))}
          {/* ладонь (тыльная сторона) */}
          <path
            d="M -46 0 C -52 -36 -62 -84 -58 -112 Q -55 -130 -40 -132 L 42 -132 Q 57 -129 58 -112 C 60 -82 54 -36 48 0 Z"
            fill={`url(#${skinId})`}
          />
          <path d="M -52 -122 Q -40 -134 -26 -126 Q -13 -136 0 -127 Q 14 -136 27 -126 Q 40 -133 52 -120" fill="none" stroke="rgba(150,90,60,0.22)" strokeWidth={2} />
          <path d="M -30 -40 Q -18 -60 -26 -96 M 2 -36 Q 6 -62 -2 -100 M 26 -38 Q 30 -60 26 -96" fill="none" stroke="rgba(150,90,60,0.12)" strokeWidth={3} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};

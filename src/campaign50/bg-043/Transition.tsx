// Стыки сцен в «часовом» стиле:
//   gear — крупная шестерёнка прокатывается через кадр (22 кадра, середина
//          на склейке, полностью закрывает кадр в момент стыка);
//   iris — жёлтый круг вырастает из центра и сжимается к логотипу финала
//          (шестерёнки «замирают» и превращаются в фирменный жёлтый акцент).
// Без вспышек и резких скачков масштаба.
import { useCurrentFrame } from "remotion";
import { clamp, easeIn, easeInOut, easeOut } from "./anim";
import { gearPath } from "./chars/Clock";
import { C } from "./palette";

export const GEAR_FRAMES = 22;
export const IRIS_IN = 12;
export const IRIS_OUT = 16;

export const GearWipe: React.FC<{ readonly dir?: 1 | -1; readonly fill?: string; readonly ring?: string }> = ({ dir = -1, fill = C.yellow, ring = C.yellowDeep }) => {
  const f = useCurrentFrame();
  const p = easeInOut(f / (GEAR_FRAMES - 1));
  // центр шестерёнки: из-за края → центр кадра (склейка) → за другой край
  // (dir = 1 — слева направо, −1 — справа налево)
  const cx = 540 + dir * (p - 0.5) * 5200;
  const rot = p * 160 * dir;
  const k = 1380 / 41;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g transform={`translate(${cx} 960) rotate(${rot}) scale(${k})`}>
        <path d={gearPath(16, 34, 41)} fill={fill} stroke={C.navy} strokeWidth={0.35} strokeLinejoin="round" />
        <circle r={27} fill="none" stroke={ring} strokeWidth={1.2} />
        <circle r={20} fill="none" stroke={ring} strokeWidth={0.6} opacity={0.6} />
      </g>
    </svg>
  );
};

export const Iris: React.FC<{ readonly toX?: number; readonly toY?: number; readonly toR?: number }> = ({ toX = 540, toY = 600, toR = 230 }) => {
  const f = useCurrentFrame();
  const grow = easeIn(clamp(f / IRIS_IN));
  const shrink = easeOut(clamp((f - IRIS_IN) / IRIS_OUT));
  const big = 1150;
  const r = f <= IRIS_IN ? 40 + grow * (big - 40) : big + (toR - big) * shrink;
  const x = f <= IRIS_IN ? 540 : 540 + (toX - 540) * shrink;
  const y = f <= IRIS_IN ? 960 : 960 + (toY - 960) * shrink;
  const o = f <= IRIS_IN ? 1 : 1 - clamp((f - IRIS_IN - IRIS_OUT + 5) / 5);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <circle cx={x} cy={y} r={r} fill={C.yellow} opacity={o} />
    </svg>
  );
};

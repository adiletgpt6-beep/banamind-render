// Стык сцен: большой лист той же бумаги ленты мягко проходит через кадр
// снизу вверх с тенью сгиба (18 кадров, середина — на склейке), без
// вспышек и скачков масштаба. Склейка спрятана за бумагой.
import { useCurrentFrame } from "remotion";
import { easeInOut } from "./rig/motion";
import { C } from "./theme";

export const Transition: React.FC = () => {
  const f = useCurrentFrame();
  const p = easeInOut(f / 17);
  const y = 2100 - p * 4400;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="bg25-tr-fold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.paperFold} />
          <stop offset="0.12" stopColor={C.paper} />
          <stop offset="0.88" stopColor={C.paper} />
          <stop offset="1" stopColor={C.paperShade} />
        </linearGradient>
      </defs>
      <g transform={`translate(-80 ${y}) rotate(-4 620 1100)`}>
        <rect x={0} y={0} width={1240} height={2200} fill="url(#bg25-tr-fold)" />
        <rect x={0} y={0} width={1240} height={26} fill="rgba(20,40,90,0.10)" />
        <rect x={0} y={1100} width={1240} height={6} fill={C.paperFold} opacity={0.8} />
        <rect x={0} y={2174} width={1240} height={26} fill="rgba(20,40,90,0.08)" />
      </g>
    </svg>
  );
};

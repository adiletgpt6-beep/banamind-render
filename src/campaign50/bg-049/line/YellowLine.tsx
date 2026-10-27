// Слой «одной жёлтой линии» поверх сцен (под субтитрами). Линия никогда не
// пропадает между сценами: на стыке она перетекает из формы прошлой сцены в
// форму следующей, пока сами сцены мягко сменяют друг друга.
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../palette";
import { useTimeline } from "../context";
import { headOf, toPath } from "./morph";
import { buildLineTrack, lineState } from "./track";

export const YellowLine: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const keys = useMemo(() => buildLineTrack(tl), [tl]);
  const st = lineState(keys, f);
  if (!st || st.b - st.a < 0.001) return null;
  const d = toPath(st.pts, st.a, st.b);
  const dy = st.bob * Math.sin((f / 26) * Math.PI);
  const head = headOf(st.pts, st.b);
  const closedFill = st.fill > 0.01 ? `${toPath(st.pts, 0, 1)} Z` : null;
  return (
    <svg
      width={1080}
      height={1920}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <filter
          id="bg49-glow"
          filterUnits="userSpaceOnUse"
          x={-200}
          y={-200}
          width={1480}
          height={2320}
        >
          <feGaussianBlur stdDeviation={18} />
        </filter>
        <filter
          id="bg49-soft"
          filterUnits="userSpaceOnUse"
          x={-200}
          y={-200}
          width={1480}
          height={2320}
        >
          <feGaussianBlur stdDeviation={5} />
        </filter>
      </defs>
      <g transform={`translate(0 ${dy.toFixed(2)})`}>
        {st.glow > 0.01 ? (
          <>
            <path
              d={d}
              fill="none"
              stroke={C.yellowGlow}
              strokeWidth={st.w * 5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.55 * st.glow}
              filter="url(#bg49-glow)"
            />
            <path
              d={d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={st.w * 0.45}
              strokeLinecap="round"
              opacity={0.8 * st.glow}
            />
          </>
        ) : null}
        {/* мягкая тень даёт линии объём над бумагой */}
        <path
          d={d}
          fill="none"
          stroke="rgba(20,40,90,0.13)"
          strokeWidth={st.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0 5)"
          filter="url(#bg49-soft)"
        />
        {closedFill ? (
          <path d={closedFill} fill={C.navy} opacity={st.fill} />
        ) : null}
        <path
          d={d}
          fill="none"
          stroke={C.yellow}
          strokeWidth={st.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* блик по центру линии */}
        <path
          d={d}
          fill="none"
          stroke="#FFE37C"
          strokeWidth={Math.max(2, st.w * 0.28)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
          transform="translate(-1 -1.5)"
        />
        {st.dot[2] > 0.3 ? (
          <>
            <circle
              cx={st.dot[0]}
              cy={st.dot[1] + 5}
              r={st.dot[2]}
              fill="rgba(20,40,90,0.13)"
              filter="url(#bg49-soft)"
            />
            <circle
              cx={st.dot[0]}
              cy={st.dot[1]}
              r={st.dot[2]}
              fill={C.yellow}
            />
          </>
        ) : null}
        {st.drawing ? (
          <>
            <circle
              cx={head[0]}
              cy={head[1]}
              r={st.w * 1.4}
              fill={C.yellowGlow}
              opacity={0.6}
              filter="url(#bg49-soft)"
            />
            <circle cx={head[0]} cy={head[1]} r={st.w * 0.42} fill="#FFFFFF" />
          </>
        ) : null}
      </g>
    </svg>
  );
};

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { CarTopView } from "../components/CarTopView";
import { easeInOut, easeOut, pop } from "../components/anim";
import { CalendarIcon, MorningIcon } from "../morning-rush/icons";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid, Paper, Tape, drop } from "./paper";
import { Road } from "./Road";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.format;
const ROAD_Y = SAFE.top + 400;
const NODE_X = [210, 540, 870];
const ICONS = ["home", "school", "home"] as const;

// 39–47 с: планируемый формат. Дорога соединяет «Үй → Мектеп → Үй»,
// условная машинка проезжает схему, календарь — «Убакытты алдын ала
// макулдашуу». Это схема планируемого порядка, а не реальная поездка.
export const FormatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const drawEnd = 38;
  const schoolAt = Math.max(
    drawEnd,
    wordCue(timeline, "format", "мектепке", 30),
  );
  const homeAt = Math.max(
    schoolAt + 20,
    wordCue(timeline, "format", "үйгө", schoolAt + 40),
  );
  const nodeAt = [14, schoolAt - 6, homeAt - 6];
  const calAt = Math.max(
    homeAt + 10,
    segmentCue(timeline, "format", "route2") - 4,
  );
  // машинка: от первого дома к школе, затем к правому дому
  const carX = interpolate(
    frame,
    [16, schoolAt, schoolAt + 8, homeAt],
    [NODE_X[0] + 110, NODE_X[1], NODE_X[1], NODE_X[2] - 120],
    { ...clamp, easing: easeInOut },
  );
  const check = interpolate(frame, [calAt + 14, calAt + 30], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const titleParts = [T.route[0], "→", T.route[1], "→", T.route[2]];

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      {/* «Үй → Мектеп → Үй» крупно */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 30,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          justifyContent: "center",
          gap: 20,
          fontSize: 84,
          fontWeight: 900,
        }}
      >
        {titleParts.map((p, i) => {
          const at =
            i < 2
              ? 14 + i * 4
              : i < 4
                ? schoolAt - 8 + (i - 2) * 4
                : homeAt - 8;
          return (
            <span
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                ...drop(frame, at, 0, 30),
              }}
            >
              {p === "→" ? (
                <svg width="70" height="50" viewBox="0 0 60 44">
                  <path
                    d="M4 22 H52 M36 6 L54 22 L36 38"
                    fill="none"
                    stroke={COLORS.yellow}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                p
              )}
            </span>
          );
        })}
      </div>

      {/* дорога рисуется слева направо */}
      <Road
        y={ROAD_Y}
        morph={1}
        draw={interpolate(frame, [12, drawEnd], [0.05, 1], {
          ...clamp,
          easing: easeOut,
        })}
        dashShift={frame * 2}
        x0={NODE_X[0]}
        x1={NODE_X[2]}
      />

      {/* узлы схемы */}
      {T.route.map((label, i) => {
        const p = pop(frame, fps, nodeAt[i]);
        return (
          <div
            key={`${label}-${i}`}
            style={{
              position: "absolute",
              left: NODE_X[i] - 100,
              top: ROAD_Y - 85,
              width: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              opacity: interpolate(
                frame,
                [nodeAt[i], nodeAt[i] + 5],
                [0, 1],
                clamp,
              ),
              scale: `${interpolate(p, [0, 1], [0.6, 1])}`,
            }}
          >
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                backgroundColor: i === 1 ? COLORS.yellow : COLORS.white,
                border: `7px solid ${COLORS.navy}`,
                boxSizing: "border-box",
                boxShadow: "0 16px 36px rgba(20, 40, 90, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MorningIcon kind={ICONS[i]} size={96} />
            </div>
            <div style={{ fontSize: 56, fontWeight: 900 }}>{label}</div>
          </div>
        );
      })}

      {/* условная машинка на схеме */}
      <div
        style={{
          position: "absolute",
          left: carX - 24,
          top: ROAD_Y - 42,
          rotate: "90deg",
          opacity: interpolate(frame, [16, 22], [0, 1], clamp),
        }}
      >
        <CarTopView size={84} />
      </div>

      {/* календарь: время согласуется заранее */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 720,
          padding: "30px 30px",
          display: "flex",
          alignItems: "center",
          gap: 28,
          ...drop(frame, calAt, -1.5, 50),
        }}
      >
        <Tape width={130} rotate={-6} style={{ top: -20, left: 300 }} />
        <CalendarIcon size={170} check={check} />
        <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.12 }}>
          {T.caption}
        </div>
      </Paper>
    </AbsoluteFill>
  );
};

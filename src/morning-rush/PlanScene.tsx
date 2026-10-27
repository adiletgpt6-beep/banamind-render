import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, MORNING_TEXT, PHOTO_CROP, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Photo } from "../components/Photo";
import { easeOut, fadeUp, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { CalendarIcon, MorningIcon } from "./icons";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = MORNING_TEXT.plan;
const ICONS = ["home", "school", "home"] as const;
const NODE = 150;
const NODE_X = [230, 540, 850];

// Стрелка схемы: рисуется слева направо (progress 0…1).
const SchemeArrow: React.FC<{
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
  readonly progress: number;
}> = ({ x0, x1, y, progress }) => {
  const x = x0 + (x1 - x0) * progress;
  return (
    <svg
      width={1080}
      height={80}
      viewBox={`0 0 1080 80`}
      style={{ position: "absolute", left: 0, top: y - 40 }}
    >
      <path
        d={`M ${x0} 40 H ${x}`}
        stroke={COLORS.yellow}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {progress > 0.6 ? (
        <path
          d={`M ${x - 20} 22 L ${x} 40 L ${x - 20} 58`}
          fill="none"
          stroke={COLORS.yellow}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};

// 16–21 с: фото Адилета и планируемый формат поездок:
// «Үй → Мектеп → Үй», «Алдын ала макулдашылган убакта».
export const PlanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const planAt = segmentCue(timeline, "plan", "plan");
  // Узлы и стрелки — вместе со словами «мектепке» и «үйгө»; между узлами
  // не меньше 12 кадров, чтобы стрелка успела прорисоваться.
  const node0 = Math.max(4, planAt - 2);
  const node1 = Math.max(
    node0 + 12,
    wordCue(timeline, "plan", "мектепке", planAt + 14) - 4,
  );
  const node2 = Math.max(
    node1 + 12,
    wordCue(timeline, "plan", "үйгө", planAt + 34) - 4,
  );
  const nodeAt = [node0, node1, node2];
  const arrow1 = interpolate(frame, [node0 + 4, node1 + 2], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const arrow2 = interpolate(frame, [node1 + 4, node2 + 2], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const captionAt = Math.max(
    node2 + 6,
    wordCue(timeline, "plan", "алдын", node2 + 16) - 6,
  );
  const check = interpolate(frame, [captionAt + 12, captionAt + 26], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const photoPop = pop(frame, fps, 0);
  const schemeY = SAFE.top + 660;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {/* фото Адилета */}
      <div
        style={{
          position: "absolute",
          left: 540 - 250,
          top: SAFE.top + 90,
          width: 500,
          height: 500,
          scale: `${interpolate(photoPop, [0, 1], [0.85, 1])}`,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: 76,
            backgroundColor: COLORS.yellow,
            rotate: "-3deg",
          }}
        />
        <Photo
          src={ASSETS.portrait}
          crop={PHOTO_CROP.portraitClose}
          width={500}
          height={500}
          radius={64}
          border={10}
          zoomStart={0}
          zoomEnd={durationInFrames}
          style={{ left: 0, top: 0 }}
        />
      </div>

      {/* схема Үй → Мектеп → Үй */}
      <SchemeArrow
        x0={NODE_X[0] + NODE / 2 + 12}
        x1={NODE_X[1] - NODE / 2 - 14}
        y={schemeY + NODE / 2}
        progress={arrow1}
      />
      <SchemeArrow
        x0={NODE_X[1] + NODE / 2 + 12}
        x1={NODE_X[2] - NODE / 2 - 14}
        y={schemeY + NODE / 2}
        progress={arrow2}
      />
      {T.route.map((label, i) => {
        const p = pop(frame, fps, nodeAt[i]);
        return (
          <div
            key={`${label}-${i}`}
            style={{
              position: "absolute",
              left: NODE_X[i] - 110,
              top: schemeY,
              width: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
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
                width: NODE,
                height: NODE,
                borderRadius: "50%",
                backgroundColor: i === 1 ? COLORS.yellow : COLORS.white,
                border: `6px solid ${i === 1 ? COLORS.yellow : COLORS.navy}`,
                boxSizing: "border-box",
                boxShadow: `0 16px 36px ${COLORS.shadow}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MorningIcon kind={ICONS[i]} size={84} />
            </div>
            <div style={{ fontSize: 54, fontWeight: 900 }}>{label}</div>
          </div>
        );
      })}

      {/* «Алдын ала макулдашылган убакта» */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 950,
          left: SAFE.left,
          right: SAFE.right,
          boxSizing: "border-box",
          padding: "24px 30px",
          borderRadius: 40,
          backgroundColor: COLORS.white,
          border: `5px solid ${COLORS.yellow}`,
          boxShadow: `0 20px 48px ${COLORS.shadow}`,
          display: "flex",
          alignItems: "center",
          gap: 26,
          ...fadeUp(frame, captionAt, 12, 40),
        }}
      >
        <CalendarIcon size={116} check={check} />
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.12 }}>
          {T.caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

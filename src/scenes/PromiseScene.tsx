import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { Logo } from "../components/Logo";
import { pop } from "../components/anim";

const HeartIcon: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width="96" height="96" viewBox="0 0 56 56">
    <path
      d="M28 48 C10 36 4 26 4 18 A12 12 0 0 1 28 12 A12 12 0 0 1 52 18 C52 26 46 36 28 48 Z"
      fill={color}
    />
  </svg>
);

const SmileIcon: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width="96" height="96" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="20" cy="23" r="3.5" fill={color} />
    <circle cx="36" cy="23" r="3.5" fill={color} />
    <path
      d="M17 33 Q28 43 39 33"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

const Card: React.FC<{
  readonly lead: string;
  readonly word: string;
  readonly at: number;
  readonly dark: boolean;
  readonly icon: React.ReactNode;
  readonly fromX: number;
}> = ({ lead, word, at, dark, icon, fromX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  return (
    <div
      style={{
        width: 900,
        padding: "44px 56px",
        borderRadius: 48,
        backgroundColor: dark ? COLORS.navy : COLORS.yellow,
        color: dark ? COLORS.white : COLORS.navy,
        boxShadow: `0 24px 60px ${COLORS.shadow}`,
        display: "flex",
        alignItems: "center",
        gap: 36,
        opacity: interpolate(frame, [at, at + 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `${interpolate(p, [0, 1], [fromX, 0])}px 0px`,
        scale: interpolate(p, [0, 1], [0.92, 1]),
      }}
    >
      {icon}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 58, fontWeight: 800, opacity: 0.85 }}>
          {lead} —
        </div>
        <div style={{ fontSize: 108, fontWeight: 900, lineHeight: 1.05 }}>
          {word}
        </div>
      </div>
    </div>
  );
};

// Главная мысль: родителю — спокойствие, ребёнку — забота.
export const PromiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const timeline = useTimeline();
  const parentAt = Math.max(0, wordCue(timeline, "promise", "Сизге", 6) - 4);
  const childAt = Math.max(
    parentAt + 10,
    wordCue(timeline, "promise", "балаңызга", parentAt + 30) - 4,
  );

  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center" }}>
      <Logo
        size={190}
        style={{
          position: "absolute",
          top: SAFE.top + 10,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 290,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
        }}
      >
        <Card
          lead={TEXT.promise.parent.lead}
          word={TEXT.promise.parent.word}
          at={parentAt}
          dark={false}
          icon={<SmileIcon color={COLORS.navy} />}
          fromX={-160}
        />
        <Card
          lead={TEXT.promise.child.lead}
          word={TEXT.promise.child.word}
          at={childAt}
          dark
          icon={<HeartIcon color={COLORS.yellow} />}
          fromX={160}
        />
      </div>
    </AbsoluteFill>
  );
};

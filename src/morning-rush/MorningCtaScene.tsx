import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, MORNING_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeOut, fadeUp, pop } from "../components/anim";
import { LinkIcon } from "../how-it-works/parts";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = MORNING_TEXT.cta;

// Финал: логотип, «Балдар үчүн такси», «Алдын ала каттоо», большая
// жёлтая кнопка «Баланы каттоо» и «Шилтеме — профилде».
// После последнего слова кадр держится MORNING_TIMING.ctaHoldSec секунд.
export const MorningCtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const logoPop = pop(frame, fps, 0);
  const titleAt = Math.max(
    8,
    wordCue(timeline, "cta", "алдын", segmentCue(timeline, "cta", "register")) -
      4,
  );
  const marker = interpolate(frame, [titleAt + 8, titleAt + 18], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const buttonAt = Math.max(
    titleAt + 10,
    wordCue(timeline, "cta", "каттаңыз", titleAt + 24) - 2,
  );
  const buttonPop = pop(frame, fps, buttonAt);
  const pulse =
    frame > buttonAt + 20
      ? 1 + Math.sin(((frame - buttonAt - 20) / fps) * Math.PI * 2 * 0.8) * 0.03
      : 1;
  const linkAt = Math.max(
    buttonAt + 8,
    wordCue(timeline, "cta", "шилтеме", buttonAt + 30) - 4,
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 90,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Logo
          size={330}
          style={{
            scale: `${interpolate(logoPop, [0, 1], [0.6, 1])}`,
            opacity: interpolate(frame, [0, 6], [0, 1], clamp),
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontSize: 60,
            fontWeight: 800,
            color: COLORS.navySoft,
            ...fadeUp(frame, 6, 12, 24),
          }}
        >
          {T.tagline}
        </div>
        <div
          style={{
            marginTop: 40,
            position: "relative",
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.1,
            ...fadeUp(frame, titleAt, 14, 40),
          }}
        >
          <span
            style={{
              position: "absolute",
              left: -14,
              right: -14,
              bottom: 8,
              height: 36,
              borderRadius: 14,
              backgroundColor: COLORS.yellow,
              transformOrigin: "left center",
              scale: `${marker} 1`,
            }}
          />
          <span style={{ position: "relative" }}>{T.title}</span>
        </div>
        <div
          style={{
            marginTop: 50,
            width: 780,
            padding: "36px 0",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 72,
            fontWeight: 900,
            boxShadow: `0 22px 50px rgba(255, 180, 0, 0.45)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            opacity: interpolate(
              frame,
              [buttonAt, buttonAt + 6],
              [0, 1],
              clamp,
            ),
            scale: `${interpolate(buttonPop, [0, 1], [0.7, 1]) * pulse}`,
          }}
        >
          {T.button}
          <svg width="60" height="44" viewBox="0 0 60 44">
            <path
              d="M4 22 H52 M36 6 L54 22 L36 38"
              fill="none"
              stroke={COLORS.navy}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 34px",
            borderRadius: 999,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 54,
            fontWeight: 800,
            ...fadeUp(frame, linkAt, 12, 30),
          }}
        >
          <LinkIcon size={52} />
          {T.link}
        </div>
      </div>
    </AbsoluteFill>
  );
};

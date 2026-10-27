import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, MORNING_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeInOut, easeOut, fadeUp, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { MorningCard } from "./BusyScene";
import { Gear } from "./icons";
import { BUSY_CARDS, ROW_CARD, rowX } from "./layout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = MORNING_TEXT;

// 9–16 с: появляется BalaGo, разбросанные карточки спокойно складываются
// в ровный маршрут, крупно — статус «Ишке киргизүүгө даярданып жатабыз».
export const LaunchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  // Карточки складываются в ряд в первые ~0,9 с сцены.
  const fold = interpolate(frame, [4, 30], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const logoAt = Math.max(6, wordCue(timeline, "launch", "БалаГо", 10) - 4);
  const logoPop = pop(frame, fps, logoAt);
  const lineDraw = interpolate(frame, [26, 44], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const statusAt = Math.max(
    logoAt + 8,
    wordCue(timeline, "launch", "ишке", logoAt + 20) - 6,
  );
  const lineY = ROW_CARD.y + ROW_CARD.h / 2;
  const lineX0 = rowX(0) + ROW_CARD.w / 2;
  const lineX1 = rowX(2) + ROW_CARD.w / 2;
  // «Бегущая» точка по линии маршрута — спокойный ритм.
  const dot = ((frame - 44) / (2.2 * fps)) % 1;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          size={300}
          style={{
            opacity: interpolate(frame, [logoAt, logoAt + 6], [0, 1], clamp),
            scale: `${interpolate(logoPop, [0, 1], [0.6, 1])}`,
          }}
        />
      </div>

      {/* линия маршрута за карточками */}
      <div
        style={{
          position: "absolute",
          left: lineX0,
          top: lineY - 6,
          width: (lineX1 - lineX0) * lineDraw,
          height: 12,
          borderRadius: 6,
          backgroundColor: COLORS.yellow,
        }}
      />
      {frame >= 44 ? (
        <div
          style={{
            position: "absolute",
            left: lineX0 + (lineX1 - lineX0) * dot - 14,
            top: lineY - 14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: COLORS.navy,
            border: `5px solid ${COLORS.white}`,
            boxSizing: "border-box",
          }}
        />
      ) : null}

      {T.busy.cards.map((card, i) => {
        const from = BUSY_CARDS[i];
        const to = { x: rowX(i), y: ROW_CARD.y, w: ROW_CARD.w, h: ROW_CARD.h };
        const lerp = (a: number, b: number) => a + (b - a) * fold;
        return (
          <MorningCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            vertical={fold > 0.5}
            style={{
              left: lerp(from.x, to.x),
              top: lerp(from.y, to.y),
              width: lerp(from.w, to.w),
              height: lerp(from.h, to.h),
              rotate: `${from.rotate * (1 - fold)}deg`,
              borderColor: fold > 0.9 ? COLORS.yellow : COLORS.block,
            }}
          />
        );
      })}

      {/* статус подготовки — крупно и заметно */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 740,
          left: 150,
          right: 150,
          boxSizing: "border-box",
          padding: "34px 30px 40px",
          borderRadius: 48,
          backgroundColor: COLORS.yellowSoft,
          border: `6px solid ${COLORS.yellow}`,
          boxShadow: `0 24px 56px ${COLORS.shadow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          ...fadeUp(frame, statusAt, 14, 50),
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: COLORS.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Gear size={88} angle={(frame / fps) * 40} />
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.12,
            textAlign: "center",
          }}
        >
          {T.launch.status}
        </div>
        {/* полоса «идёт подготовка» — без процентов и дат */}
        <div
          style={{
            width: 560,
            height: 24,
            borderRadius: 12,
            backgroundColor: COLORS.white,
            border: `4px solid ${COLORS.navy}`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 200,
              left: -200 + (((frame - statusAt) / (1.6 * fps)) % 1) * 760,
              borderRadius: 12,
              backgroundColor: COLORS.yellow,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

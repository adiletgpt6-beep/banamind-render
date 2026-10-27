import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, MORNING_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeOut, fadeUp, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { AlarmClock, MorningIcon } from "./icons";
import { BUSY_CARDS } from "./layout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = MORNING_TEXT.busy;
// «Ар бир мүнөт маанилүү»: «мүнөт» — жёлтым, последнее слово — второй строкой.
const minuteWords = T.minute.split(" ");
const lead = minuteWords.slice(0, -2).join(" ");
const accent = minuteWords[minuteWords.length - 2];
const tail = minuteWords[minuteWords.length - 1];

// Карточка «Жумуш / Мектеп / Жол»: иконка в жёлтом круге и подпись.
export const MorningCard: React.FC<{
  readonly label: string;
  readonly icon: "work" | "school" | "road" | "home";
  readonly vertical?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ label, icon, vertical = false, style }) => (
  <div
    style={{
      position: "absolute",
      boxSizing: "border-box",
      borderRadius: 40,
      backgroundColor: COLORS.white,
      boxShadow: `0 18px 44px ${COLORS.shadow}`,
      border: `5px solid ${COLORS.block}`,
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      justifyContent: vertical ? "center" : "flex-start",
      gap: vertical ? 10 : 30,
      padding: vertical ? 0 : "0 30px",
      ...style,
    }}
  >
    <div
      style={{
        width: vertical ? 104 : 108,
        height: vertical ? 104 : 108,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: COLORS.yellow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MorningIcon kind={icon} size={vertical ? 64 : 68} />
    </div>
    <div style={{ fontSize: vertical ? 46 : 66, fontWeight: 900 }}>{label}</div>
  </div>
);

// 3–9 с: карточки «Жумуш», «Мектеп», «Жол» появляются по словам озвучки,
// рядом тикают часы; затем «Ар бир мүнөт маанилүү».
export const BusyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const minuteAt = segmentCue(timeline, "busy", "minute");
  const minuteWordAt = wordCue(timeline, "busy", "мүнөт", minuteAt + 10);
  // Секундная стрелка тикает раз в полсекунды (живой ритм, без тревоги).
  const ticks = Math.floor(frame / 15);
  const tickEase = interpolate(frame % 15, [0, 4], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const second = (ticks + tickEase) * 30;
  const minute = 258 + (ticks + tickEase) * 3;
  const clockPulse =
    1 +
    0.06 *
      Math.sin(
        Math.PI *
          interpolate(frame, [minuteWordAt, minuteWordAt + 12], [0, 1], clamp),
      );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {T.cards.map((card, i) => {
        const pos = BUSY_CARDS[i];
        const at = Math.max(
          i * 8,
          wordCue(timeline, "busy", card.word, 6 + i * 24) - 3,
        );
        const p = pop(frame, fps, at);
        return (
          <MorningCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            style={{
              left: pos.x,
              top: pos.y,
              width: pos.w,
              height: pos.h,
              rotate: `${pos.rotate}deg`,
              opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
              scale: `${interpolate(p, [0, 1], [0.6, 1])}`,
              translate: `${interpolate(p, [0, 1], [-60, 0])}px 0px`,
            }}
          />
        );
      })}

      {/* часы рядом с карточками */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: SAFE.top + 260,
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: COLORS.yellowSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: `${clockPulse * interpolate(frame, [0, 10], [0.85, 1], { ...clamp, easing: easeOut })}`,
        }}
      >
        <AlarmClock
          size={270}
          hour={7 * 30 + 21}
          minute={minute}
          second={second}
          bells={false}
        />
      </div>

      {/* «Ар бир мүнөт маанилүү» */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 790,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, minuteAt - 4, 12, 40),
        }}
      >
        <div
          style={{
            padding: "26px 48px",
            borderRadius: 48,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 1.12,
            textAlign: "center",
            boxShadow: `0 22px 50px ${COLORS.shadow}`,
          }}
        >
          {lead} <span style={{ color: COLORS.yellow }}>{accent}</span>
          <br />
          {tail}
        </div>
      </div>
    </AbsoluteFill>
  );
};

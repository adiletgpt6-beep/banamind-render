import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, DRIVER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeOut, fadeUp, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = DRIVER_TEXT.kids;

const formatNumber = (n: number) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Открытая книга — «учил детей».
const BookIcon: React.FC = () => (
  <svg width="110" height="110" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="32" fill={COLORS.yellow} />
    <path
      d="M14 20 Q23 16 32 21 Q41 16 50 20 V46 Q41 42 32 47 Q23 42 14 46 Z M32 21 V47"
      fill="none"
      stroke={COLORS.navy}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

// 8–16 с: опыт с детьми — уроки арабского и детская страница 120 000+.
export const KidsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const arabicAt = Math.max(0, segmentCue(timeline, "kids", "arabic") - 4);
  const pageAt = Math.max(
    arabicAt + 20,
    segmentCue(timeline, "kids", "page") - 4,
  );
  // Счётчик растёт вместе с фразой о странице и доходит до 120 000
  // к слову «катталуучу».
  const countStart = pageAt + 6;
  const countEnd = Math.max(
    countStart + 20,
    wordCue(timeline, "kids", "катталуучу", countStart + 40),
  );
  const followers = Math.round(
    interpolate(frame, [countStart, countEnd], [0, T.followers], {
      ...clamp,
      easing: easeOut,
    }),
  );
  const cardPop = pop(frame, fps, pageAt);
  const statsAt = countEnd + 4;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {/* Уроки арабского */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          top: SAFE.top + 10,
          display: "flex",
          alignItems: "center",
          gap: 32,
          padding: "36px 40px",
          borderRadius: 44,
          backgroundColor: COLORS.navy,
          color: COLORS.white,
          boxShadow: `0 24px 60px ${COLORS.shadow}`,
          ...fadeUp(frame, arabicAt, 14, 40),
        }}
      >
        <BookIcon />
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1 }}>
          {T.arabic}
        </div>
      </div>

      {/* Карточка детской страницы */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          top: SAFE.top + 400,
          padding: "40px 40px 36px",
          borderRadius: 44,
          backgroundColor: COLORS.white,
          border: `6px solid ${COLORS.yellow}`,
          boxShadow: `0 24px 60px ${COLORS.shadow}`,
          opacity: interpolate(frame, [pageAt, pageAt + 6], [0, 1], clamp),
          scale: interpolate(cardPop, [0, 1], [0.9, 1]),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div
            style={{
              width: 230,
              height: 230,
              flexShrink: 0,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: COLORS.white,
              boxShadow: `0 10px 30px ${COLORS.shadow}`,
            }}
          >
            <Img
              src={staticFile(ASSETS.channelLogo)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 118,
                fontWeight: 900,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatNumber(followers)}
              <span style={{ color: COLORS.yellow }}>{T.followersSuffix}</span>
            </div>
            <div style={{ fontSize: 62, fontWeight: 900, marginTop: 6 }}>
              {T.followersCaption}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            padding: "14px 28px",
            borderRadius: 999,
            backgroundColor: COLORS.yellowSoft,
            fontSize: 52,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {T.pageCaption}
        </div>
      </div>

      {/* Настоящий фрагмент профиля: имя и число подписчиков */}
      <div
        style={{
          position: "absolute",
          left: (1080 - 860) / 2,
          top: SAFE.top + 960,
          width: 860,
          padding: "18px 22px",
          borderRadius: 32,
          backgroundColor: COLORS.white,
          boxShadow: `0 16px 40px ${COLORS.shadow}`,
          ...fadeUp(frame, statsAt, 14, 30),
        }}
      >
        <Img
          src={staticFile(ASSETS.channelStats)}
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};

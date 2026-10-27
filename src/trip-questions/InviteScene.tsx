import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_CONTACT, SAFE, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeOut, fadeUp, pop } from "../components/anim";
import { LinkIcon } from "../how-it-works/parts";
import { WhatsAppIcon } from "../founder-story/icons";
import { DotGrid, Marker, Paper } from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { ENTER } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.invite;

// 48–60 с: финальный экран собирается по словам; блок WhatsApp с номером
// сразу появляется в окончательном положении (только прозрачность,
// без сдвига и масштаба) и дальше неподвижен.
export const InviteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const titleAt = Math.max(
    ENTER + 10,
    wordCue(timeline, "tqInvite", "алдын", ENTER + 14) - 4,
  );
  const buttonAt = Math.max(
    titleAt + 10,
    wordCue(timeline, "tqInvite", "каттоо", titleAt + 16) - 4,
  );
  const contact = segmentCue(timeline, "tqInvite", "contact");
  const linkAt = Math.max(
    buttonAt + 10,
    wordCue(timeline, "tqInvite", "шилтеме", contact + 10) - 4,
  );
  const waAt = Math.max(
    linkAt + 12,
    wordCue(timeline, "tqInvite", "же", linkAt + 24) - 2,
  );
  const marker = interpolate(frame, [titleAt + 6, titleAt + 16], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const buttonPop = pop(frame, fps, buttonAt);
  const wa = interpolate(frame, [waAt, waAt + 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <div
        style={{
          position: "absolute",
          top: SAFE.top - 10,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* логотип — на месте с первого кадра (им заканчивается
            предыдущая сцена) */}
        <Logo size={220} />
        <div
          style={{
            marginTop: 16,
            fontSize: 52,
            fontWeight: 800,
            color: COLORS.navySoft,
            ...fadeUp(frame, 4, 12, 20),
          }}
        >
          {T.tagline}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.1,
            ...fadeUp(frame, titleAt, 12, 24),
          }}
        >
          <Marker progress={marker} height="38%">
            {T.title}
          </Marker>
        </div>
        <div
          style={{
            marginTop: 30,
            width: 760,
            padding: "28px 0",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 64,
            fontWeight: 900,
            boxShadow: "0 22px 50px rgba(255, 180, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            opacity: interpolate(
              frame,
              [buttonAt, buttonAt + 6],
              [0, 1],
              clamp,
            ),
            scale: `${interpolate(buttonPop, [0, 1], [0.7, 1])}`,
          }}
        >
          {T.button}
          <svg width="54" height="40" viewBox="0 0 60 44">
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
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 30px",
            borderRadius: 999,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 48,
            fontWeight: 800,
            ...fadeUp(frame, linkAt, 12, 24),
          }}
        >
          <LinkIcon size={46} />
          {T.link}
        </div>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.navySoft,
            opacity: wa,
          }}
        >
          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 2,
              backgroundColor: COLORS.block,
            }}
          />
          {T.or}
          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 2,
              backgroundColor: COLORS.block,
            }}
          />
        </div>
      </div>

      {/* WhatsApp: сразу в окончательном положении, только проявляется */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 760,
          padding: "22px 20px 26px",
          border: "5px solid #25D366",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: wa,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <WhatsAppIcon size={74} />
          <div style={{ fontSize: 44, fontWeight: 900 }}>{T.whatsapp}</div>
        </div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: 2,
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {FOUNDER_CONTACT.phone}
        </div>
      </Paper>
    </AbsoluteFill>
  );
};

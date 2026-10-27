import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_CONTACT, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeOut, fadeUp, pop } from "../components/anim";
import { LinkIcon } from "../how-it-works/parts";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { WhatsAppIcon } from "./icons";
import { DotGrid, Marker, Paper } from "./paper";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.contact;
// Элементы появляются после перехода (12 кадров) — без наложения текста.
const ENTER = 12;

// 53–60 с: финальный экран — два способа связи. После последнего слова
// экран полностью собран и неподвижен (номер не двигается) ≥ 5 с.
export const ContactScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const buttonAt = Math.max(
    ENTER + 16,
    wordCue(
      timeline,
      "contact",
      "каттоо",
      segmentCue(timeline, "contact", "link"),
    ) - 4,
  );
  const linkAt = Math.max(
    buttonAt + 8,
    wordCue(timeline, "contact", "шилтеме", buttonAt + 24) - 4,
  );
  const waAt = Math.max(
    linkAt + 10,
    segmentCue(timeline, "contact", "whatsapp") - 4,
  );
  const marker = interpolate(frame, [buttonAt - 10, buttonAt], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const buttonPop = pop(frame, fps, buttonAt);
  const waPop = interpolate(frame, [waAt, waAt + 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

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
        <Logo
          size={220}
          style={{
            scale: `${interpolate(pop(frame, fps, ENTER), [0, 1], [0.6, 1])}`,
            opacity: interpolate(frame, [ENTER, ENTER + 6], [0, 1], clamp),
          }}
        />
        <div
          style={{
            marginTop: 16,
            fontSize: 52,
            fontWeight: 800,
            color: COLORS.navySoft,
            ...fadeUp(frame, ENTER + 4, 12, 20),
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
            ...fadeUp(frame, ENTER + 8, 12, 24),
          }}
        >
          <Marker progress={marker} height="38%">
            {T.title}
          </Marker>
        </div>
        {/* кнопка */}
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

        {/* «же» — второй способ */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.navySoft,
            opacity: interpolate(frame, [waAt - 4, waAt + 6], [0, 1], clamp),
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

      {/* WhatsApp: значок, подпись и крупный неподвижный номер */}
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
          opacity: waPop,
          translate: `0px ${(1 - waPop) * 40}px`,
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

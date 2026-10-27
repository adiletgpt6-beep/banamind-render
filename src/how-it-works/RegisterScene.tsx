import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, HOW_TEXT, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeOut, fadeUp, pop } from "../components/anim";
import { Logo } from "../components/Logo";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { Caption, LinkIcon, StepTitle } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = HOW_TEXT.register;

// Шаг 1: карточка регистрации. Поля появляются по очереди, пока звучит
// фраза, чтобы родитель успел понять, какие сведения нужны.
export const RegisterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const stepAt = Math.max(0, segmentCue(timeline, "register", "step1") - 4);
  const linkAt = wordCue(timeline, "register", "шилтеме", stepAt + 40);
  const doneAt = wordCue(timeline, "register", "каттаңыз", linkAt + 30);
  // Поля — равномерно от начала фразы до слова «каттаңыз».
  const fieldsFrom = stepAt + 10;
  const fieldsTo = Math.max(
    fieldsFrom + 40,
    Math.min(doneAt, durationInFrames - 30),
  );
  const fieldStep = (fieldsTo - fieldsFrom) / T.fields.length;
  const buttonAt = Math.round(fieldsTo);
  const tap = interpolate(
    frame,
    [buttonAt + 10, buttonAt + 16, buttonAt + 24],
    [1, 0.94, 1],
    clamp,
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <StepTitle
        n={1}
        title={T.title}
        style={{
          position: "absolute",
          top: SAFE.top + 10,
          left: SAFE.left - 10,
          right: SAFE.left - 10,
          ...fadeUp(frame, 0, 12, 30),
        }}
      />

      {/* Карточка регистрации */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 170,
          left: (1080 - 900) / 2,
          width: 900,
          padding: "30px 44px 36px",
          boxSizing: "border-box",
          borderRadius: 48,
          backgroundColor: COLORS.white,
          border: `6px solid ${COLORS.yellow}`,
          boxShadow: `0 26px 64px ${COLORS.shadow}`,
          opacity: interpolate(frame, [2, 10], [0, 1], clamp),
          scale: interpolate(pop(frame, fps, 2), [0, 1], [0.94, 1]),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Logo size={86} style={{ boxShadow: "none" }} />
          <div style={{ fontSize: 50, fontWeight: 900 }}>{TEXT.cta.button}</div>
        </div>

        {T.fields.map((label, i) => {
          const at = Math.round(fieldsFrom + i * fieldStep);
          const typed = interpolate(frame, [at + 6, at + 18], [0, 1], {
            ...clamp,
            easing: easeOut,
          });
          return (
            <div
              key={label}
              style={{ marginTop: 18, ...fadeUp(frame, at, 10, 24) }}
            >
              <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 8 }}>
                {label}
              </div>
              <div
                style={{
                  height: 74,
                  borderRadius: 22,
                  backgroundColor: COLORS.sky,
                  border: `4px solid ${frame >= at && frame < at + 24 ? COLORS.yellow : COLORS.block}`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 26px",
                }}
              >
                {/* «заполнение» поля — нейтральная полоса без выдуманных данных */}
                <div
                  style={{
                    height: 18,
                    width: `${typed * (55 + ((i * 13) % 25))}%`,
                    borderRadius: 9,
                    backgroundColor: COLORS.block,
                  }}
                />
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 28,
            height: 96,
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 54,
            fontWeight: 900,
            boxShadow: `0 16px 36px rgba(255, 180, 0, 0.4)`,
            scale: tap,
            ...fadeUp(frame, buttonAt, 10, 20),
          }}
        >
          {TEXT.cta.button}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: SAFE.top + 1125,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, linkAt - 3, 12, 30),
        }}
      >
        <Caption style={{ fontSize: 52 }}>
          <LinkIcon />
          {T.link}
        </Caption>
      </div>
    </AbsoluteFill>
  );
};

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, DRIVER_TEXT, PHOTO_CROP, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Photo } from "../components/Photo";
import { easeInOut, easeOut, fadeUp } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = DRIVER_TEXT.intro;

// Число с пробелами между тысячами: 5000 → «5 000».
const formatNumber = (n: number) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// 0–8 с: крупный портрет и вопрос родителю → «Мен Адилетмин» → 5000+.
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  // Фаза 2 (знакомство) начинается вместе с фразой «Менин атым Адилет».
  const nameAt = segmentCue(timeline, "intro", "name");
  const morph = interpolate(frame, [nameAt - 8, nameAt + 10], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const nameWordAt = wordCue(timeline, "intro", "Адилет", nameAt + 12);
  const tripsAt = segmentCue(timeline, "intro", "trips");
  const countEnd = Math.max(
    tripsAt + 20,
    wordCue(timeline, "intro", "сапар", tripsAt + 36),
  );
  const trips = Math.round(
    interpolate(frame, [tripsAt, countEnd], [0, T.trips], {
      ...clamp,
      easing: easeOut,
    }),
  );
  const bump = interpolate(frame, [countEnd, countEnd + 10], [0, 1], clamp);

  // Портрет: большая карточка → круг поменьше вверху.
  const size = interpolate(morph, [0, 1], [820, 540]);
  const top = interpolate(morph, [0, 1], [SAFE.top - 10, SAFE.top + 10]);
  const radius = interpolate(morph, [0, 1], [64, 270]);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {/* жёлтая подложка-кольцо */}
      <div
        style={{
          position: "absolute",
          left: (1080 - size) / 2 - 18,
          top: top - 18,
          width: size + 36,
          height: size + 36,
          borderRadius: radius + 18,
          backgroundColor: COLORS.yellow,
        }}
      />
      <Photo
        src={ASSETS.portrait}
        crop={PHOTO_CROP.portraitClose}
        width={size}
        height={size}
        radius={radius}
        border={10}
        zoomStart={0}
        zoomEnd={durationInFrames}
        style={{
          left: (1080 - size) / 2,
          top,
          // Сразу видно лицо; лёгкий «наезд» в первые кадры.
          scale: interpolate(frame, [0, 12], [1.04, 1], {
            ...clamp,
            easing: easeOut,
          }),
        }}
      />

      {/* Фаза 1: вопрос родителю — виден с первого кадра */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          top: SAFE.top + 870,
          padding: "34px 36px",
          borderRadius: 44,
          backgroundColor: COLORS.navy,
          color: COLORS.white,
          fontSize: 74,
          fontWeight: 900,
          lineHeight: 1.12,
          textAlign: "center",
          boxShadow: `0 24px 60px ${COLORS.shadow}`,
          opacity: 1 - morph,
          translate: `0px ${interpolate(frame, [0, 10], [24, 0], {
            ...clamp,
            easing: easeOut,
          })}px`,
        }}
      >
        {T.question}
      </div>

      {/* Фаза 2: знакомство и опыт */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.left,
          top: SAFE.top + 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1.1,
            ...fadeUp(frame, nameAt, 14, 40),
          }}
        >
          Мен{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                position: "absolute",
                left: -10,
                right: -10,
                bottom: -4,
                height: 26,
                borderRadius: 12,
                backgroundColor: COLORS.yellow,
                transformOrigin: "0% 50%",
                scale: `${interpolate(frame, [nameWordAt, nameWordAt + 10], [0, 1], { ...clamp, easing: easeOut })} 1`,
              }}
            />
            <span style={{ position: "relative" }}>{T.nameHighlight}</span>
          </span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 190,
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            // короткий «толчок», когда счётчик дошёл до 5000
            scale: 1 + 0.07 * Math.sin(Math.PI * bump),
            ...fadeUp(frame, tripsAt - 4, 12, 40),
          }}
        >
          {formatNumber(trips)}
          <span style={{ color: COLORS.yellow }}>{T.tripsSuffix}</span>
        </div>
        <div
          style={{
            marginTop: 8,
            padding: "12px 36px",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 62,
            fontWeight: 900,
            ...fadeUp(frame, tripsAt + 4, 14, 30),
          }}
        >
          {T.tripsCaption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

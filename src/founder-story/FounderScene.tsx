import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, FOUNDER_TEXT, PHOTO_CROP, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Photo } from "../components/Photo";
import { easeOut } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { BookIcon, WheelIcon } from "./icons";
import { DotGrid, Paper, Paperclip, Scribble, Tape, drop } from "./paper";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.founder;
const PHOTO_W = 470;
const PHOTO_H = 520;

// 20–29 с: фото Адилета — карточка на столе с жёлтым скотчем.
// Подписи раскрываются по очереди: имя, опыт в такси, уроки с детьми.
export const FounderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const nameAt = Math.max(24, wordCue(timeline, "founder", "Адилет", 14) - 4);
  const factAt = [
    Math.max(
      nameAt + 14,
      wordCue(timeline, "founder", T.facts[0].word, nameAt + 40) - 6,
    ),
  ];
  factAt.push(
    Math.max(
      factAt[0] + 14,
      wordCue(timeline, "founder", T.facts[1].word, factAt[0] + 50) - 6,
    ),
  );
  const underline = interpolate(frame, [nameAt + 6, nameAt + 22], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  // Медленный «наезд» на фото на протяжении сцены.
  const photoScale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.04],
    clamp,
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      {/* полароид с фото */}
      <Paper
        style={{
          left: 540 - (PHOTO_W + 44) / 2,
          top: SAFE.top + 10,
          width: PHOTO_W + 44,
          height: PHOTO_H + 22 + 120,
          borderRadius: 10,
          ...drop(frame, 12, -2.5, 70),
          scale: `${photoScale}`,
        }}
      >
        <Photo
          src={ASSETS.portrait}
          crop={PHOTO_CROP.portraitClose}
          width={PHOTO_W}
          height={PHOTO_H}
          radius={6}
          border={0}
          zoomStart={0}
          zoomEnd={durationInFrames}
          style={{ left: 22, top: 22, boxShadow: "none" }}
        />
        <Tape
          width={170}
          rotate={-3}
          style={{ top: -24, left: (PHOTO_W + 44) / 2 - 85 }}
        />
        {/* подпись на полароиде */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: PHOTO_H + 30,
            textAlign: "center",
            fontSize: 64,
            fontWeight: 900,
            opacity: interpolate(frame, [nameAt, nameAt + 8], [0, 1], clamp),
          }}
        >
          {T.name}
        </div>
        <Scribble
          width={340}
          progress={underline}
          style={{ left: (PHOTO_W + 44) / 2 - 170, top: PHOTO_H + 100 }}
        />
      </Paper>

      {/* факты — бумажные карточки */}
      {T.facts.map((f, i) => (
        <Paper
          key={f.text}
          style={{
            left: 120,
            right: 150,
            top: SAFE.top + 720 + i * 190,
            height: 160,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "0 28px",
            ...drop(frame, factAt[i], i ? 1.5 : -1.5, 50),
          }}
        >
          {i === 0 ? (
            <Paperclip
              size={96}
              style={{ top: -40, left: 36, rotate: "-12deg" }}
            />
          ) : (
            <Tape width={110} rotate={-8} style={{ top: -18, left: -20 }} />
          )}
          <div
            style={{
              width: 112,
              height: 112,
              flexShrink: 0,
              borderRadius: "50%",
              backgroundColor: COLORS.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {f.icon === "wheel" ? (
              <WheelIcon size={72} />
            ) : (
              <BookIcon size={72} />
            )}
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.12 }}>
            {f.text}
          </div>
        </Paper>
      ))}
    </AbsoluteFill>
  );
};

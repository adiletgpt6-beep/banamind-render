import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ASSETS,
  COLORS,
  PHOTO_CROP,
  SAFE,
  TEXT,
  type SceneId,
} from "../config";
import { fontFamily } from "../fonts";
import { Photo } from "../components/Photo";
import { easeOut, fadeUp } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";

const CheckIcon: React.FC = () => (
  <svg width="54" height="54" viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="27" fill={COLORS.yellow} />
    <path
      d="M15 28 L24 37 L40 19"
      fill="none"
      stroke={COLORS.navy}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const slideIn = (frame: number, start: number, fromX: number) => {
  const p = interpolate(frame, [start, start + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  return { opacity: p, translate: `${(1 - p) * fromX}px 0px` };
};

// Комфорт: фото машины и салона; плашки появляются вместе со словами
// «таза», «ыңгайлуу», «камкор».
const PROMO_FEATURES = [
  { label: TEXT.car.features[0], word: "таза" },
  { label: TEXT.car.features[1], word: "ыңгайлуу" },
  { label: TEXT.car.features[2], word: "камкор" },
];

// Плашки и слова озвучки, с которыми они появляются, задаются пропсами —
// сцену используют оба ролика.
export const CarScene: React.FC<{
  readonly sceneId?: SceneId;
  readonly features?: readonly { label: string; word: string }[];
}> = ({ sceneId = "car", features = PROMO_FEATURES }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const timeline = useTimeline();
  const cues = features.map((f, i) =>
    wordCue(timeline, sceneId, f.word, 24 + i * 16),
  );
  const width = 900;
  const left = (1080 - width) / 2;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <Photo
        src={ASSETS.carExterior}
        crop={PHOTO_CROP.carExterior}
        width={width}
        height={520}
        zoomStart={0}
        zoomEnd={durationInFrames}
        style={{ left, top: SAFE.top, ...slideIn(frame, 0, -120) }}
      />
      <Photo
        src={ASSETS.carInterior}
        crop={PHOTO_CROP.carInterior}
        width={width}
        height={380}
        zoomStart={0}
        zoomEnd={durationInFrames}
        style={{ left, top: SAFE.top + 545, ...slideIn(frame, 10, 120) }}
      />

      <div
        style={{
          position: "absolute",
          top: SAFE.top + 960,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {features.map(({ label }, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              minWidth: 560,
              padding: "12px 32px 12px 16px",
              borderRadius: 999,
              backgroundColor: COLORS.white,
              boxShadow: `0 12px 30px ${COLORS.shadow}`,
              fontSize: 50,
              fontWeight: 900,
              ...fadeUp(frame, cues[i] - 3, 12, 30),
            }}
          >
            <CheckIcon />
            {label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

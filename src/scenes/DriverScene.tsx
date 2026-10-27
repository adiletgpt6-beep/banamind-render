import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, PHOTO_CROP, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { Photo } from "../components/Photo";
import { easeOut, fadeUp, pop } from "../components/anim";

const PORTRAIT = 600;

// 10–15 с: портрет водителя и опыт.
export const DriverScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const countStart = Math.round(0.6 * fps);
  const countEnd = countStart + Math.round(1.4 * fps);
  const trips = Math.round(
    interpolate(frame, [countStart, countEnd], [0, TEXT.driver.tripsNumber], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    }),
  );
  const kidsStart = countEnd + 6;
  const photoPop = pop(frame, fps, 0);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {/* жёлтое кольцо за портретом */}
      <div
        style={{
          position: "absolute",
          left: (1080 - PORTRAIT) / 2 - 22,
          top: SAFE.top - 2,
          width: PORTRAIT + 44,
          height: PORTRAIT + 44,
          borderRadius: "50%",
          backgroundColor: COLORS.yellow,
          scale: interpolate(photoPop, [0, 1], [0.7, 1]),
        }}
      />
      <Photo
        src={ASSETS.portrait}
        crop={PHOTO_CROP.portrait}
        width={PORTRAIT}
        height={PORTRAIT}
        radius={PORTRAIT / 2}
        border={12}
        zoomStart={0}
        zoomEnd={durationInFrames}
        style={{
          left: (1080 - PORTRAIT) / 2,
          top: SAFE.top + 20,
          scale: interpolate(photoPop, [0, 1], [0.8, 1]),
          opacity: interpolate(frame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.left,
          top: SAFE.top + PORTRAIT + 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 170,
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            ...fadeUp(frame, countStart - 6, 14, 30),
          }}
        >
          {trips}
          <span style={{ color: COLORS.yellow }}>
            {TEXT.driver.tripsSuffix}
          </span>
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 800,
            marginTop: 6,
            ...fadeUp(frame, countStart + 6, 16, 30),
          }}
        >
          {TEXT.driver.tripsCaption}
        </div>
        <div
          style={{
            marginTop: 48,
            padding: "22px 40px",
            borderRadius: 32,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 50,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 22,
            ...fadeUp(frame, kidsStart, 18, 40),
          }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56">
            <path
              d="M28 48 C10 36 4 26 4 18 A12 12 0 0 1 28 12 A12 12 0 0 1 52 18 C52 26 46 36 28 48 Z"
              fill={COLORS.yellow}
            />
          </svg>
          {TEXT.driver.kidsExperience}
        </div>
      </div>
    </AbsoluteFill>
  );
};

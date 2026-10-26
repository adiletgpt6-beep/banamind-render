// Живое видео: куски исходника встык (jump-cuts на паузах) и
// виртуальная камера (edit.ts → cameraAt): мягкие наезды, отъезды,
// лёгкие панорамы. Кадр всегда заполнен, без вращений и тряски.
import { Video } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cameraAt, LIVE_FILES, LIVE_VIDEO, SEGMENT_STARTS, SEGMENTS } from "./edit";

const Shot: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame() + SEGMENT_STARTS[index];
  const { s, cx, cy } = cameraAt(frame);
  const seg = SEGMENTS[index];
  const tx = LIVE_VIDEO.width / 2 - cx * s;
  const ty = LIVE_VIDEO.height / 2 - cy * s;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        transformOrigin: "0 0",
      }}
    >
      <Video
        src={staticFile(LIVE_FILES.video)}
        trimBefore={seg.from}
        muted
        style={{ width: LIVE_VIDEO.width, height: LIVE_VIDEO.height }}
      />
    </AbsoluteFill>
  );
};

export const ARoll: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SEGMENTS.map((s, i) => (
      <Sequence
        key={s.from}
        from={SEGMENT_STARTS[i]}
        durationInFrames={s.to - s.from}
        name={`Кусок ${i + 1}`}
      >
        <Shot index={i} />
      </Sequence>
    ))}
    {/* лёгкое затемнение низа кадра — для читаемости надписей */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(6,10,24,0) 56%, rgba(6,10,24,0.16) 72%, rgba(6,10,24,0.34) 100%)",
      }}
    />
  </AbsoluteFill>
);

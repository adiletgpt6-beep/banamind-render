// Живое видео: куски исходника встык и виртуальная камера (edit.ts →
// cameraAt). Кадр всегда заполнен (масштаб ≥ 1), без вращений и тряски.
// Экспозиция ракурсов выравнивается лёгким фильтром (Segment.look).
import { Video } from "@remotion/media";
import { AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cameraAt, END_CARD_FRAMES, LIVE3, LIVE3_FILES, LIVE_END, SEGMENT_STARTS, SEGMENTS } from "./edit";

const Shot: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame() + SEGMENT_STARTS[index];
  const { s, ox, oy } = cameraAt(frame);
  const seg = SEGMENTS[index];
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${ox * (1 - s)}px, ${oy * (1 - s)}px) scale(${s})`,
        transformOrigin: "0 0",
        filter: `brightness(${seg.look.b}) contrast(${seg.look.c}) saturate(${seg.look.sat})`,
      }}
    >
      <Video
        src={staticFile(LIVE3_FILES.video)}
        trimBefore={seg.from}
        muted
        style={{ width: LIVE3.width, height: LIVE3.height }}
      />
    </AbsoluteFill>
  );
};

const last = SEGMENTS[SEGMENTS.length - 1];

export const ARoll: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SEGMENTS.map((s, i) => (
      <Sequence key={s.from} from={SEGMENT_STARTS[i]} durationInFrames={s.to - s.from} name={`План ${i + 1}: ${s.name}`}>
        <Shot index={i} />
      </Sequence>
    ))}
    {/* концовка: спокойный последний кадр под брендовой карточкой */}
    <Sequence from={LIVE_END} durationInFrames={END_CARD_FRAMES} name="Последний кадр">
      <Freeze frame={0}>
        <AbsoluteFill
          style={{
            filter: `brightness(${last.look.b}) contrast(${last.look.c}) saturate(${last.look.sat})`,
          }}
        >
          <Video
            src={staticFile(LIVE3_FILES.video)}
            trimBefore={last.to - 1}
            muted
            style={{ width: LIVE3.width, height: LIVE3.height }}
          />
        </AbsoluteFill>
      </Freeze>
    </Sequence>
    {/* лёгкое затемнение низа — для читаемости субтитров */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(4,8,22,0) 62%, rgba(4,8,22,0.14) 76%, rgba(4,8,22,0.3) 100%)",
      }}
    />
  </AbsoluteFill>
);

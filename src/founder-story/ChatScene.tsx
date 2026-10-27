import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FOUNDER_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid } from "./paper";
import { ScheduleBoard } from "./ScheduleBoard";

const T = FOUNDER_TEXT.chat;

// Кадры, когда появляются реплики и раскрывается расписание (общие для
// сцен chat и trust — во второй сцене расписание уже раскрыто).
export const useChatCues = () => {
  const timeline = useTimeline();
  const first = Math.max(
    20,
    wordCue(timeline, "chat", T.messages[0].word, 10) - 6,
  );
  const second = Math.max(
    first + 12,
    wordCue(timeline, "chat", T.messages[1].word, first + 24) - 6,
  );
  const third = Math.max(
    second + 12,
    wordCue(timeline, "chat", T.messages[2].word, second + 24) - 6,
  );
  // Расписание раскрывается сразу после третьей реплики и успевает
  // полностью раскрыться до перехода к сцене trust.
  const sceneLen =
    timeline.scenes.find((sc) => sc.id === "chat")?.durationInFrames ?? 300;
  const unfoldAt = Math.max(
    third + 10,
    Math.min(
      wordCue(timeline, "chat", "өз", third + 14),
      sceneLen - timeline.timing.transitionFrames - 30,
    ),
  );
  return {
    messageAt: [first, second, third],
    unfoldAt,
    busy2: segmentCue(timeline, "chat", "busy2"),
  };
};

// 7–14 с: «Бирөө жумушта, бирөө жолдо. Баарынын өз иши бар.»
// Реплики семейного чата раскрываются в расписания с занятыми отрезками.
export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { messageAt, unfoldAt } = useChatCues();
  const unfold = interpolate(frame, [unfoldAt, unfoldAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <ScheduleBoard
        frame={frame}
        messageAt={messageAt}
        unfold={unfold}
        headerAt={12}
      />
    </AbsoluteFill>
  );
};

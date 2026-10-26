import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FOUNDER_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { DotGrid } from "./paper";
import { FamilyChat } from "./FamilyChat";

const T = FOUNDER_TEXT.chat;

// Ответы приходят вместе с фразами диктора. Окно переписки остаётся
// чатом до конца сцены; расписание появляется в следующей сцене trust.
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
  return [first, second, third] as const;
};

// «Бирөө жумушта, бирөө жолдо. Баарынын өз иши бар.»
// Иллюстрация семейной переписки: вопрос справа, ответы слева.
export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const messageAt = useChatCues();

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <FamilyChat frame={frame} messageAt={messageAt} />
    </AbsoluteFill>
  );
};

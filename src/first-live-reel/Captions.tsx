// Короткие кыргызские субтитры: 2–5 слов, крупно, белым, ключевые слова
// жёлтые. Стоят под подбородком (или у нижней границы зоны) и выше
// интерфейса Instagram.
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CAPTIONS, outFrame, STAGE_BOTTOM, stageTop } from "./edit";
import { enter, leave } from "./motion";
import { baseText, Highlighted, TEXT_SHADOW, WHITE } from "./ui";

const LEAD = 2; // субтитр появляется чуть раньше слова

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = useMemo(
    () =>
      CAPTIONS.map((c) => {
        const from = outFrame(c.from) - LEAD;
        const to = outFrame(c.to);
        return { ...c, f0: from, f1: to, top: stageTop(from, to + 4, 22) };
      }),
    [],
  );
  const cue = cues.find((c) => frame >= c.f0 && frame < c.f1 + 4);
  if (!cue) return null;
  const next = cues.find((c) => c.f0 >= cue.f1 - 1 && c.f0 <= cue.f1 + 6);
  const a = enter(frame, cue.f0);
  // смежные субтитры меняются сразу, последний — короткий уход
  const out = next ? (frame >= cue.f1 ? 0 : 1) : leave(frame, cue.f1, 5);
  const bottomSlot = cue.slot === "bottom";
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        ...(bottomSlot ? { bottom: 1920 - STAGE_BOTTOM + 6 } : { top: cue.top }),
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...baseText,
          fontSize: 66,
          color: WHITE,
          textAlign: "center",
          textShadow: TEXT_SHADOW,
          opacity: Math.min(1, a * 1.4) * out,
          transform: `translateY(${(1 - a) * 18}px) scale(${0.94 + 0.06 * a})`,
        }}
      >
        <Highlighted text={cue.text} />
      </div>
    </div>
  );
};

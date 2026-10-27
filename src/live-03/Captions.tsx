// Кыргызские субтитры: короткие смысловые фрагменты, мягкий вход строкой,
// ключевые слова жёлтым. Нижний слот — над интерфейсом Reels (низ 1600 px),
// поля по бокам 110 px.
import { useCurrentFrame } from "remotion";
import { CAPTIONS, F, LIVE_END, SAFE } from "./edit";
import { enter, leave } from "./motion";
import { baseText, Highlighted, TEXT_SHADOW, WHITE, YELLOW } from "./ui";

const LEAD = 2; // субтитр появляется чуть раньше слова

const CUES = CAPTIONS.map((c) => ({ ...c, f0: F(c.from) - LEAD, f1: F(c.to) }));

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= LIVE_END - 8) return null; // концовка без субтитров
  // последний начавшийся субтитр; он держится до своего конца (+5 кадров на уход)
  let i = -1;
  for (let k = 0; k < CUES.length; k++) if (CUES[k].f0 <= frame) i = k;
  if (i < 0 || frame >= CUES[i].f1 + 5) return null;
  const cue = CUES[i];
  const next = CUES[i + 1];
  // встык со следующим субтитром — смена сразу; последний в фразе — короткий уход
  const chained = next !== undefined && next.f0 <= cue.f1 + 4;
  const a = enter(frame, cue.f0);
  const out = chained ? 1 : leave(frame, cue.f1, 5);
  const mid = cue.slot === "mid";
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left - 20,
        right: SAFE.left - 20,
        ...(mid ? { top: 1180 } : { bottom: 1920 - SAFE.bottom + 18 }),
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...baseText,
          fontSize: cue.accent ? 78 : 64,
          color: WHITE,
          textAlign: "center",
          textShadow: TEXT_SHADOW,
          maxWidth: 840,
          opacity: Math.min(1, a * 1.5) * out,
          transform: `translateY(${(1 - a) * 22}px) scale(${0.95 + 0.05 * a})`,
        }}
      >
        <Highlighted text={cue.text} accent={YELLOW} />
        {cue.accent ? (
          // единственный выразительный акцент: жёлтая черта прочерчивается
          <div
            style={{
              height: 9,
              borderRadius: 5,
              marginTop: 10,
              background: YELLOW,
              boxShadow: "0 0 24px rgba(255,201,14,0.7)",
              transformOrigin: "left center",
              transform: `scaleX(${Math.min(1, Math.max(0, (frame - cue.f0 - 6) / 14))})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

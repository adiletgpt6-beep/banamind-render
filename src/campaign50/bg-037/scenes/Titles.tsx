// Кинетические заголовки кухонных сцен (кыргызча, вверху кадра).
//   1. «КАТТАЛГАНДА ЭЛЕ ТӨЛӨЙМБҮ?» — слова появляются вместе с вопросом мамы.
//   2. «Адегенде шарттарды түшүнөбүз» — записка, пока папа читает условия.
import { fontFamily } from "../../../fonts";
import { easeOut, NAVY, popScale, prog, YELLOW } from "../art";
import type { Bg37Beats } from "../beats";
import { BG37_TEXT } from "../script";
import { wordTime } from "../timing";

export const HookTitle: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const h = b.hook;
  if (t >= h.to + 0.2) return null;
  const words = BG37_TEXT.hook.title.split(" ");
  const at = [wordTime(h.line, "катталганда", 0.2), wordTime(h.line, "эле", 0.45), wordTime(h.line, "төлөш", 0.6)];
  const out = 1 - prog(t, h.to - 0.15, 0.3);
  return (
    <div style={{ position: "absolute", left: 50, right: 110, top: 150, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 18px", fontFamily, opacity: out }}>
      {words.map((w, i) => {
        const u = prog(t, at[i] - 0.05, 0.3);
        const last = i === words.length - 1;
        return (
          <div
            key={i}
            style={{
              padding: "10px 24px",
              borderRadius: 24,
              backgroundColor: last ? YELLOW : "rgba(255,255,255,0.95)",
              color: NAVY,
              fontWeight: 1000,
              fontSize: last ? 86 : 70,
              lineHeight: 1.05,
              boxShadow: "0 10px 26px rgba(20,40,75,0.18)",
              transform: `translateY(${(1 - easeOut(u)) * 40}px) scale(${popScale(u)}) rotate(${last ? -2 : 0}deg)`,
              opacity: Math.min(1, u * 3),
            }}
          >
            {w}
          </div>
        );
      })}
    </div>
  );
};

export const RulesNote: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const r = b.rules;
  const u = prog(t, r.read - 0.2, 0.45);
  const out = 1 - prog(t, r.push + 0.4, 0.4);
  if (u <= 0 || out <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 120, top: 170, display: "flex", justifyContent: "center", fontFamily, opacity: Math.min(u * 2, out) }}>
      <div
        style={{
          padding: "22px 34px",
          borderRadius: 18,
          backgroundColor: "#FFF8DC",
          borderLeft: `14px solid ${YELLOW}`,
          color: NAVY,
          fontWeight: 1000,
          fontSize: 58,
          lineHeight: 1.1,
          boxShadow: "0 14px 30px rgba(110,70,20,0.2)",
          transform: `rotate(${-2 + 2 * easeOut(u)}deg) scale(${popScale(u)})`,
          textAlign: "center",
        }}
      >
        {BG37_TEXT.rules.title}
      </div>
    </div>
  );
};

// Субтитры (текст сценария): у мамы — подпись «Апа:», у сына — «Бала:»;
// фраза до знака препинания или ≈ 34 знаков; текущее слово выделено. Ролик
// понятен и без звука. На финальном экране субтитров нет — там крупно все
// надписи.
import { fontFamily } from "../../../fonts";
import { NAVY, NAVY_SOFT, YELLOW } from "../art";
import type { Bg13Cue, Bg13Word } from "../timing";

const MAX = 34;

const chunksOf = (words: readonly Bg13Word[]) => {
  const out: Bg13Word[][] = [];
  let cur: Bg13Word[] = [];
  let len = 0;
  for (const w of words) {
    if (cur.length && len + w.text.length + 1 > MAX) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.text.length + 1;
    if (/[.,!?:]$/.test(w.text) || w.text === "—") {
      out.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur);
  // висячее короткое «—» присоединяется к следующей фразе
  return out.filter((c) => c.length);
};

export const Subtitles: React.FC<{ readonly t: number; readonly cues: readonly Bg13Cue[] }> = ({ t, cues }) => {
  const cue = cues.find((c) => c.scene !== "cta" && t >= c.from - 0.1 && t <= c.to + 0.35);
  if (!cue) return null;
  const chunks = chunksOf(cue.words);
  let idx = 0;
  chunks.forEach((c, i) => {
    if (t >= c[0].start - 0.08) idx = i;
  });
  const chunk = chunks[idx];
  const fadeIn = Math.min(1, (t - (cue.from - 0.1)) / 0.15);
  const fadeOut = Math.min(1, (cue.to + 0.35 - t) / 0.2);
  return (
    <div style={{ position: "absolute", left: 70, right: 130, top: 1560, display: "flex", justifyContent: "center", opacity: Math.max(0, Math.min(fadeIn, fadeOut)), fontFamily }}>
      <div
        style={{
          padding: "14px 28px",
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 8px 24px rgba(20,40,75,0.16)",
          border: cue.role === "narrator" ? undefined : `4px solid ${cue.role === "mother" ? YELLOW : "#8DB3DE"}`,
          fontSize: 44,
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {cue.role === "mother" ? <span style={{ color: "#C4614F", marginRight: 12 }}>Апа:</span> : null}
        {cue.role === "son" ? <span style={{ color: "#2F4A7A", marginRight: 12 }}>Бала:</span> : null}
        {chunk.map((w, i) => {
          const on = t >= w.start - 0.05;
          const now = on && t < w.end + 0.05;
          return (
            <span key={i} style={{ color: on ? NAVY : NAVY_SOFT, opacity: on ? 1 : 0.55, boxShadow: now ? `inset 0 -10px 0 ${YELLOW}` : undefined }}>
              {w.text}
              {i < chunk.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Субтитры диктора (текст сценария): смысловые фразы из script.ts (sub),
// иначе — до знака препинания или ≈ 32 знаков; текущее слово подчёркнуто жёлтым. Ролик понятен и без
// звука. В финале субтитров нет — там крупно все надписи и контакты.
// Позиция — над нижним интерфейсом Reels, левее кнопок справа.
import { fontFamily } from "../../fonts";
import { NAVY, NAVY_SOFT, YELLOW } from "./art";
import type { Bg41Cue, Bg41Word } from "./timing";

const MAX = 32;
export const SUB_TOP = 1450;

const chunksOf = (words: readonly Bg41Word[]) => {
  // фразы заданы в сценарии (sub с « | ») — режем только по ним
  if (words.some((w) => w.br)) {
    const out: Bg41Word[][] = [[]];
    for (const w of words) {
      out[out.length - 1].push(w);
      if (w.br) out.push([]);
    }
    return out.filter((c) => c.length);
  }
  const out: Bg41Word[][] = [];
  let cur: Bg41Word[] = [];
  let len = 0;
  for (const w of words) {
    if (cur.length && len + w.text.length + 1 > MAX) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.text.length + 1;
    if (/[.,!?:]$/.test(w.text)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur);
  // фраза не заканчивается одиноким «—»/союзом: переносим его вперёд
  for (let i = 0; i < out.length - 1; i++) {
    const last = out[i][out[i].length - 1];
    if (out[i].length > 1 && /^(—|же|жана|а)$/i.test(last.text)) {
      out[i + 1] = [last, ...out[i + 1]];
      out[i] = out[i].slice(0, -1);
    }
  }
  return out.filter((c) => c.length);
};

export const Subtitles: React.FC<{ readonly t: number; readonly cues: readonly Bg41Cue[] }> = ({ t, cues }) => {
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
  // фраза мягко «всплывает» при смене
  const since = t - (chunk[0].start - 0.08);
  const pop = Math.min(1, Math.max(0, since / 0.14));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 120,
        top: SUB_TOP,
        display: "flex",
        justifyContent: "center",
        opacity: Math.max(0, Math.min(fadeIn, fadeOut)),
        fontFamily,
        transform: `translateY(${(1 - pop) * 10}px)`,
      }}
    >
      <div
        style={{
          padding: "14px 28px 16px",
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 8px 24px rgba(20,40,75,0.18)",
          fontSize: 46,
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {chunk.map((w, i) => {
          const on = t >= w.start - 0.05;
          const now = on && t < w.end + 0.05;
          return (
            <span key={i} style={{ color: on ? NAVY : NAVY_SOFT, opacity: on ? 1 : 0.55, boxShadow: now ? `inset 0 -11px 0 ${YELLOW}` : undefined }}>
              {w.text}
              {i < chunk.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

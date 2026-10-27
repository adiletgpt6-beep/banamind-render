// Субтитры (кыргызча) — точно по звучащей речи, короткими смысловыми
// фразами в одну-две строки; фраза сменяется по фактическим таймингам слов.
// Важные слова (accent в script.ts) выделены жёлтым. Положение — снизу над
// зоной интерфейса (≈ 300 px от низа) или сверху (≈ 170 px), если внизу
// кадра важное действие: руки на клавиатуре, тетрадь, кнопка, книга.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { wfhLine, WFH_VIDEO } from "./script";
import { SUB_TOP } from "./subtitlePlacement";

const FPS = WFH_VIDEO.fps;
const MAX = 40; // символов в фразе (две строки по ≈ 20–26)

// Деление на фразы: по предложениям, затем по запятым/тире, затем по словам.
export const phrases = (text: string): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= MAX) {
      out.push(s);
      continue;
    }
    const parts = s.split(/(?<=[,—])\s+/);
    let cur = "";
    for (const p of parts) {
      const next = cur ? `${cur} ${p}` : p;
      if (next.length <= MAX) cur = next;
      else {
        if (cur) out.push(cur);
        if (p.length <= MAX) cur = p;
        else {
          // длинная часть — по словам
          let w = "";
          for (const word of p.split(/\s+/)) {
            const n = w ? `${w} ${word}` : word;
            if (n.length <= MAX) w = n;
            else {
              out.push(w);
              w = word;
            }
          }
          cur = w;
        }
      }
    }
    if (cur) out.push(cur);
  }
  // короткий хвост («бар.») присоединяется к предыдущей фразе
  for (let i = out.length - 1; i > 0; i--) {
    if (out[i].length < 14 && out[i - 1].length + out[i].length + 1 <= MAX + 14 && !/[.!?…]$/.test(out[i - 1])) {
      out[i - 1] = `${out[i - 1]} ${out[i]}`;
      out.splice(i, 1);
    }
  }
  return out;
};

const Accented: React.FC<{ text: string; accent: readonly string[] }> = ({ text, accent }) => {
  if (!accent.length) return <>{text}</>;
  const re = new RegExp(`(${accent.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(re).map((p, i) =>
        accent.includes(p) ? (
          <span key={i} style={{ color: "#FFD43B" }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const frame = useCurrentFrame();
  const t = (frame + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.4);
  if (!cue) return null;
  const line = wfhLine(cue.id);
  const parts = phrases(line.text);
  const nWords = line.text.split(/\s+/).filter(Boolean).length;
  let idx = 0;
  let wi = 0;
  const startOf = parts.map((p) => {
    const s = wi;
    wi += p.split(/\s+/).filter(Boolean).length;
    return s;
  });
  const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / nWords;
  for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.08) idx = k;
  const partFrom = idx === 0 ? cue.from - 0.1 : wt(startOf[idx]) - 0.08;
  const a = easeOut((t - (cue.from - 0.1)) / 0.15) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
  const pop = easeOut((t - partFrom) / 0.12);
  const top = SUB_TOP(frame); // на склейке субтитр переходит вместе с планом
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        ...(top ? { top: 150 } : { bottom: 300 }),
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          padding: "14px 30px 16px",
          borderRadius: 24,
          backgroundColor: "rgba(23,42,70,0.82)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          opacity: a,
          transform: `translateY(${(1 - pop) * 8}px)`,
          boxShadow: "0 10px 30px rgba(10,15,30,0.22)",
        }}
      >
        <Accented text={parts[idx]} accent={line.accent ?? []} />
      </div>
    </div>
  );
};

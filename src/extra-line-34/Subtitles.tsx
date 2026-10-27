// Субтитры (кыргызча) совпадают с тем, что звучит. Длинная реплика делится
// на короткие смысловые части (не больше двух строк); части сменяются по
// фактическим таймингам слов озвучки — без пословного «караоке». Чтение
// книги вслух — курсивом в «ёлочках». Обычно субтитры внизу (нижняя
// граница — y = 1548, над интерфейсом Reels); на планах, где внизу важное
// действие, — вверху (TOP).
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { clamp, easeOut } from "./rig/motion";
import { EL_VIDEO, lineById, modeOf } from "./script";
import { C, F, SUB } from "./theme";

const FPS = EL_VIDEO.fps;
const MAX = 50; // символов в части (≈ 2 строки по 52 px в 840 px)
// Пары слов, которые не разрываются между частями субтитров.
const KEEP = ["алдын ала", "бала багуучу", "бала бакчада", "бир сабы", "жардам берүү", "тил табышты", "ал эмнеге", "мектеп окуучулары", "сыноо күнүн", "жолго чыгалы"];
// Реплики над финальным экраном: светлая плашка, чтобы субтитр не спорил с
// тёмной плашкой «Шилтеме — профилдин башында».
const SUB_LIGHT: ReadonlySet<string> = new Set(["N10"]);
// Пары KEEP склеиваются неразрывным пробелом: браузер не переносит внутри них.
const glue = (text: string) => KEEP.reduce((acc, k) => acc.replace(new RegExp(k, "gi"), (m) => m.replace(" ", "\u00a0")), text);
// Слова для тайминга — только токены с буквами («—» словом не считается).
const wc = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

// Реплики, во время которых субтитры уходят наверх (внизу кадра — важное
// действие или читаемая карточка).
export const SUB_TOP: ReadonlySet<string> = new Set([]);
// Реплики без субтитров: текст и так целиком на экране.
export const SUB_HIDDEN: ReadonlySet<string> = new Set([]);

// Длинная часть без знаков препинания делится по словам на равные куски
// (каждый ≤ MAX символов, обычно две строки).
const splitWords = (part: string): string[] => {
  if (part.length <= MAX) return [part];
  const words = part.split(/ +/);
  const n = Math.ceil(part.length / MAX);
  const target = part.length / n;
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && next.length > target + 4 && out.length < n - 1) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

export const chunksOf = (text: string): string[] => {
  const glued = glue(text);
  const parts = (glued.match(/[^.!?…,:]+[.!?…,:»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [glued]).flatMap(splitWords);
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    const next = cur ? `${cur} ${p}` : p;
    if (next.length <= MAX || (cur && cur.length <= 10 && next.length <= MAX + 8)) cur = next;
    else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
};

// Слова через дефис («кайра-кайра») не разрываются переносом.
const noBreakHyphens = (text: string) =>
  text.split(/(\S+-\S+)/).map((p, i) => (i % 2 ? <span key={i} style={{ whiteSpace: "nowrap" }}>{p}</span> : p));

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const started = tl.cues.filter((c) => t >= c.from - 0.1);
  const cue = started[started.length - 1];
  if (!cue || t > cue.to + 0.35 || SUB_HIDDEN.has(cue.id)) return null;
  const line = lineById(cue.line);
  const parts = line.subs ? line.subs.map(glue) : chunksOf(line.text);
  // начало каждой части — по слову озвучки (слова файла = слова spoken)
  const words = cue.words;
  const counts = parts.map(wc);
  const spokenWords = wc(line.spoken ?? line.text);
  const textWords = wc(line.text);
  const scale = spokenWords / Math.max(1, textWords);
  let idx = 0;
  let wi = 0;
  const startAt = counts.map((n) => {
    const s = Math.round(wi * scale);
    wi += n;
    return words[s]?.start ?? cue.from;
  });
  for (let k = 1; k < parts.length; k++) if (t >= startAt[k] - 0.08) idx = k;
  const partStart = idx === 0 ? cue.from - 0.1 : startAt[idx] - 0.08;
  const a = easeOut((t - partStart) / 0.14) * (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
  const card = easeOut((t - (cue.from - 0.1)) / 0.16) * (1 - easeOut((t - (cue.to + 0.2)) / 0.15));
  const top = SUB_TOP.has(cue.id);
  const reading = modeOf(cue.id) === "reading";
  // чтение вслух: одна фраза в «ёлочках» на все части
  const text = reading ? `${idx === 0 ? "«" : ""}${parts[idx]}${idx === parts.length - 1 ? "»" : ""}` : parts[idx];
  const light = SUB_LIGHT.has(cue.id);
  return (
    <div
      style={{
        position: "absolute",
        left: SUB.x,
        width: SUB.w,
        ...(top ? { top: SUB.topY } : { bottom: 1920 - SUB.bottomY }),
        display: "flex",
        justifyContent: "center",
        opacity: clamp(card),
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: light ? "rgba(255,255,255,0.94)" : "rgba(23,38,61,0.88)",
          color: light ? C.ink : C.white,
          fontFamily: F.text,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.2,
          padding: "14px 32px 18px",
          borderRadius: 22,
          textAlign: "center",
          maxWidth: SUB.w,
          boxSizing: "border-box",
          fontStyle: reading ? "italic" : "normal",
          boxShadow: light ? "0 10px 26px rgba(23,38,61,0.12), 0 0 0 1.5px rgba(23,38,61,0.06)" : "0 10px 26px rgba(23,38,61,0.18)",
          textWrap: "balance",
        }}
      >
        <span style={{ opacity: a, display: "inline-block", transform: `translateY(${(1 - a) * 6}px)` }}>{noBreakHyphens(text)}</span>
      </div>
    </div>
  );
};

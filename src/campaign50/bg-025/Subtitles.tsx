// Субтитры реплик (кыргызча): одна реплика за раз, крупно и контрастно,
// над нижней зоной интерфейса Reels (400 px снизу), правее кнопок не
// заходят. Длинная реплика делится на части ≤ 2 строк; части сменяются по
// фактическим таймингам слов озвучки, звучащее слово подсвечено жёлтым.
// Реплика мамы — на белой плашке (говорит героиня в кадре), диктора — на
// тёмно-синей. На финальном экране субтитров нет: там те же слова
// написаны крупно (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { easeOut } from "./rig/motion";
import { BG25_VIDEO, lineById } from "./script";
import { C, F, SAFE } from "./theme";

const FPS = BG25_VIDEO.fps;
const MAX_CHARS = 30;

// Деление на части ≤ 2 строк: сначала по границам предложений (если
// предложение помещается в 2 строки), длинное предложение — у запятой или
// у слова, ближайшего к равной доле (не рвём «туура келген» и т. п.).
const LIMIT = MAX_CHARS * 2 + 2; // целое предложение — до ~62 знаков
const PIECE = 52; // длинное предложение режется на части ≤ ~52 знаков
const splitLong = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.ceil(text.length / PIECE);
  if (n <= 1) return [text];
  const out: string[] = [];
  let from = 0;
  for (let k = 1; k < n; k++) {
    const target = (text.length * k) / n;
    let best = from + 1;
    let bestCost = Infinity;
    let pos = 0;
    for (let i = 0; i < words.length; i++) {
      pos += words[i].length + 1;
      if (i < from || i >= words.length - 1) continue;
      const cost = Math.abs(pos - target) - (/[,:—]$/.test(words[i]) ? 18 : 0) + (words[i + 1] === "—" ? 40 : 0);
      if (cost < bestCost) {
        bestCost = cost;
        best = i + 1;
      }
    }
    out.push(words.slice(from, best).join(" "));
    from = best;
  }
  out.push(words.slice(from).join(" "));
  return out;
};

export const chunks = (text: string): string[] => {
  if (text.length <= LIMIT) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((x) => x.trim()) ?? [text];
  const out: string[] = [];
  for (const sn of sentences) {
    const last = out[out.length - 1];
    // короткое предложение присоединяем к предыдущему, если вместе ≤ 2 строк
    if (last && last.length + 1 + sn.length <= LIMIT) out[out.length - 1] = `${last} ${sn}`;
    else if (sn.length <= LIMIT) out.push(sn);
    else out.push(...splitLong(sn));
  }
  return out;
};

// Токены без букв и цифр (тире «—») не являются словами озвучки.
const isWord = (w: string) => /[\p{L}\p{N}]/u.test(w);

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  // номер слова озвучки для каждого токена текста (тире — к предыдущему слову)
  const wi: number[] = [];
  {
    let k = -1;
    for (const w of words) {
      if (isWord(w)) k++;
      wi.push(Math.max(0, k));
    }
  }
  const nWords = words.filter(isWord).length;
  const exact = cue.words.length === nWords;
  const wt = (i: number) => (exact ? cue.words[wi[i]].start : cue.from + ((cue.to - cue.from) * wi[i]) / nWords);
  const we = (i: number) => (exact ? cue.words[wi[i]].end : cue.from + ((cue.to - cue.from) * (wi[i] + 1)) / nWords);
  let idx = 0;
  const startOf: number[] = [];
  {
    let wi = 0;
    for (const p of parts) {
      startOf.push(wi);
      wi += p.split(/\s+/).filter(Boolean).length;
    }
  }
  for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  const mom = cue.role === "mother";
  const partWords = parts[idx].split(" ");
  return (
    <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, bottom: SAFE.bottom + 6, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 860,
          padding: "16px 30px 18px",
          borderRadius: 28,
          backgroundColor: mom ? "rgba(255,255,255,0.96)" : "rgba(20,40,90,0.88)",
          border: mom ? `4px solid ${C.yellow}` : undefined,
          color: mom ? C.navy : C.white,
          fontFamily: F.text,
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 12px 30px rgba(10,15,30,0.22)",
        }}
      >
        {partWords.map((w, i) => {
          const gi = startOf[idx] + i;
          const on = isWord(w) && t >= wt(gi) - 0.02 && t <= we(gi) + 0.08;
          return (
            <span key={i}>
              {i ? " " : ""}
              <span style={{ whiteSpace: "nowrap", color: on ? (mom ? C.yellowDeep : C.yellow) : undefined }}>{w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

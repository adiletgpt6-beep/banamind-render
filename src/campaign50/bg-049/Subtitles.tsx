// Субтитры реплик (кыргызча): одна часть реплики за раз (≤ 2 строк),
// крупно и контрастно, над нижней зоной интерфейса Reels (низ блока —
// 400 px от низа кадра). Слово, которое звучит сейчас, подсвечено жёлтым
// (по фактическим таймингам озвучки). Реплика мамы подписана «Апа».
// На финальном экране субтитров нет: там те же слова написаны крупно
// (Бишкек, профиль, WhatsApp и номер).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useTimeline } from "./context";
import { clamp, easeOut } from "./anim";
import { C } from "./palette";
import { BG49_SPEAKER, BG49_VIDEO, lineById } from "./script";

const FPS = BG49_VIDEO.fps;
const MAX_CHARS = 30;

// Деление на части ≤ 2 строк: сначала по предложениям, длинное
// предложение — на равные доли по словам (граница предпочтительно после
// запятой или тире). Так в кадре не остаётся «хвоста» чужого предложения.
const MAX_PART = MAX_CHARS * 2;

const splitEven = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.ceil(text.length / MAX_PART);
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
      const cost = Math.abs(pos - target) - (/[,—]$/.test(words[i]) ? 10 : 0);
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

// Длинное предложение сначала делится после запятой (если обе части не
// слишком короткие), затем — на равные доли.
const splitSentence = (text: string): string[] => {
  if (text.length <= MAX_PART) return [text];
  const m = /^(.{12,}?,)\s+(.{12,})$/u.exec(text);
  if (m) return [...splitSentence(m[1]), ...splitSentence(m[2])];
  return splitEven(text);
};

export const chunks = (text: string): string[] => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const out: string[] = [];
  for (const sn of sentences) {
    const prev = out[out.length - 1];
    if (prev && prev.length + sn.length + 1 <= 36)
      out[out.length - 1] = `${prev} ${sn}`;
    else out.push(...splitSentence(sn));
  }
  return out;
};

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = line.sub ?? chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  const aligned = cue.words.length === words.length;
  const wStart = (i: number) =>
    aligned
      ? cue.words[i].start
      : cue.from + ((cue.to - cue.from) * i) / words.length;
  const wEnd = (i: number) =>
    aligned
      ? cue.words[i].end
      : cue.from + ((cue.to - cue.from) * (i + 1)) / words.length;
  let idx = 0;
  const startOf: number[] = [];
  {
    let wi = 0;
    for (const p of parts) {
      startOf.push(wi);
      wi += p.split(/\s+/).filter(Boolean).length;
    }
  }
  for (let k = 1; k < parts.length; k++)
    if (t >= wStart(startOf[k]) - 0.08) idx = k;
  const a =
    easeOut((t - (cue.from - 0.12)) / 0.18) *
    (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  const partIn =
    idx > 0 ? easeOut((t - (wStart(startOf[idx]) - 0.08)) / 0.16) : 1;
  const speaker = BG49_SPEAKER[cue.role];
  const partWords = parts[idx].split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 150,
        bottom: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
        opacity: a,
      }}
    >
      {speaker ? (
        <div
          style={{
            marginBottom: -8,
            zIndex: 1,
            padding: "6px 22px",
            borderRadius: 999,
            backgroundColor: C.yellow,
            color: C.navy,
            fontFamily,
            fontSize: 32,
            fontWeight: 900,
            alignSelf: "center",
            boxShadow: "0 6px 16px rgba(20,40,90,0.18)",
          }}
        >
          {speaker}
        </div>
      ) : null}
      <div
        style={{
          maxWidth: 880,
          padding: "18px 32px 20px",
          borderRadius: 30,
          backgroundColor: "rgba(20,40,90,0.9)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 47,
          fontWeight: 800,
          lineHeight: 1.24,
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(10,15,30,0.25)",
          transform: `translateY(${(1 - partIn) * 10}px)`,
          opacity: 0.4 + 0.6 * partIn,
        }}
      >
        {partWords.map((w, i) => {
          const gi = startOf[idx] + i;
          const on = t >= wStart(gi) - 0.04 && t <= wEnd(gi) + 0.06;
          const said = t > wEnd(gi);
          const k = clamp((t - (wStart(gi) - 0.04)) / 0.08);
          return (
            <span key={i}>
              {i ? " " : ""}
              <span
                style={{
                  whiteSpace: "nowrap",
                  color: on
                    ? C.yellow
                    : said
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.78)",
                  display: "inline-block",
                  transform: on ? `translateY(${-3 * k}px)` : undefined,
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

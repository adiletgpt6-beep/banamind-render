// Субтитры реплик (кыргызча): одна фраза за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Reels (≈ 400 px снизу) и левее
// колонки иконок (≈ 150 px справа). Длинная реплика делится на части
// ≤ 2 строк (смысловые фразы subs из script.ts, иначе автоматически);
// части сменяются по фактическим таймингам слов озвучки.
// У реплики мамы — метка «Апа» (голоса мамы и диктора оба женские).
// На финальном экране субтитров нет: там те же слова написаны крупно.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { useTimeline } from "./context";
import { C } from "./palette";
import { BG35_TEXT, BG35_VIDEO, lineById } from "./script";

const FPS = BG35_VIDEO.fps;
const MAX_CHARS = 28;

const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    const endsSentence = /[.!?:]$/.test(cur);
    if (
      next.length <= MAX_CHARS * 2 &&
      !(endsSentence && cur.length > MAX_CHARS * 0.7)
    )
      cur = next;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const t = (useCurrentFrame() + 0.5) / FPS;
  // у реплики мамы хвост короче: сразу после неё камера уходит в телефон
  // (у диктора 0,3 с — короче паузы 0,45 с между фразами: следующая реплика
  // плавно проявляется, а не «выскакивает»)
  const tail = (role: string) => (role === "mother" ? 0.2 : 0.3);
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + tail(c.role));
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const parts = line.subs ? [...line.subs] : chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) =>
      cue.words.length === words.length
        ? cue.words[i].start
        : cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++)
      if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a =
    easeOut((t - (cue.from - 0.12)) / 0.18) *
    (1 - easeOut((t - (cue.to + tail(cue.role) - 0.15)) / 0.15));
  const mom = line.role === "mother";
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 150,
        bottom: 400,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 870,
          padding: "14px 28px",
          borderRadius: 24,
          backgroundColor: "rgba(16,28,64,0.84)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.25)",
        }}
      >
        {mom ? (
          <span
            style={{
              display: "inline-block",
              marginRight: 14,
              padding: "0 14px",
              borderRadius: 999,
              backgroundColor: C.yellow,
              color: C.navy,
              fontSize: 36,
              fontWeight: 900,
              verticalAlign: "0.12em",
            }}
          >
            {BG35_TEXT.ask.speaker}
          </span>
        ) : null}
        {parts[idx]}
      </div>
    </div>
  );
};

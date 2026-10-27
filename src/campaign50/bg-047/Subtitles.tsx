// Кыргызские титры: короткие кинетические фрагменты по фактическим
// таймингам слов озвучки. Белый текст с тёмно-синим контуром и мягкой
// тенью, ключевые слова — фирменным жёлтым. Позиция меняется по сценам
// (не по слогам): сверху, когда снизу работают руки мамы (поля, заявка),
// иначе — над нижней зоной интерфейса Reels (≤ 1520 px), ниже героев.
// Финальная реплика не дублируется: её текст уже на финальном экране.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "./art/motion";
import { captionGroups, captionWords } from "./captions";
import { useTimeline } from "./context";
import { BG47_VIDEO, bg47LineById, type Bg47SceneId } from "./script";

const FPS = BG47_VIDEO.fps;
const ACCENT = /^(BalaGo'го|үйү|мектеби|убактысы|туура|ылайыктуу|топту|акысыз|толук|сыноо|чечет|ата-эне|бир|жолуна)$/i;
const TOP: Record<Bg47SceneId, number> = { hook: 1420, fields: 456, mismatch: 1420, apply: 470, trial: 1410, cta: 1420 };

type Chunk = { readonly words: readonly string[]; readonly from: number };
const clean = (w: string) => w.replace(/[.,!?:—«»\u00A0]/g, "");

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.4);
  if (!cue || cue.id === "n5") return null;
  const line = bg47LineById(cue.id);
  // показываемые слова — из сценария; тире не отдельное слово
  const words = captionWords(line.text);
  const spokenCount = cue.words.length;
  const startOf = (i: number) => {
    const k = spokenCount === words.length ? i : Math.round((i * spokenCount) / words.length);
    return cue.words[k]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
  };
  const groups = captionGroups(line.text, line.captions);
  const chunks: Chunk[] = groups.map((g) => ({ words: g.map((i) => words[i]), from: startOf(g[0]) }));
  let idx = 0;
  for (let k = 1; k < chunks.length; k++) if (t >= chunks[k].from - 0.08) idx = k;
  const ch = chunks[idx];
  const shownAt = Math.max(cue.from - 0.1, ch.from - 0.08);
  const a = easeOut((t - shownAt) / 0.16) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));
  const scene = tl.scenes.find((s) => t >= s.from && t < s.to)?.id ?? line.scene;
  const top = TOP[scene];
  // реплики точки помечены жёлтым кружком, диктор — без него
  const isDot = cue.who === "dot";
  // длинный фрагмент — чуть меньше кегль, чтобы оставался в одну строку
  const chars = ch.words.join(" ").length + (isDot ? 3 : 0);
  const fontSize = chars > 22 ? 50 : chars > 18 ? 54 : 58;
  return (
    <div style={{ position: "absolute", left: 90, right: 150, top: top - 70, height: 140, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        key={`${cue.id}-${idx}`}
        style={{
          maxWidth: 840,
          textAlign: "center",
          fontFamily,
          fontSize,
          fontWeight: 900,
          lineHeight: 1.12,
          color: "#FFFFFF",
          WebkitTextStroke: `${Math.round(fontSize * 0.19)}px #14285A`,
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(10,20,50,0.35)",
          opacity: a,
          scale: `${0.9 + 0.1 * a}`,
          translate: `0 ${(1 - a) * 14}px`,
        }}
      >
        {isDot ? (
          <span style={{ display: "inline-block", width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFC90E", border: "5px solid #14285A", marginRight: 14, verticalAlign: "-2px" }} />
        ) : null}
        {ch.words.map((w, i) => (
          <span key={i} style={{ color: ACCENT.test(clean(w)) ? "#FFC90E" : "#FFFFFF" }}>
            {i ? " " : ""}
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

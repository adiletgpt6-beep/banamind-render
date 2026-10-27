// Кыргызские титры: короткие кинетические фрагменты по фактическим
// таймингам слов озвучки. Белый текст с тёмно-синим контуром и мягкой
// тенью, ключевые слова — фирменным жёлтым. Позиция меняется по сценам
// (не по слогам): в разделённом экране — на волне между мирами, в
// остальных — над нижней зоной интерфейса Reels (≥ 400 px снизу), ниже
// лиц. Финальная реплика не дублируется: её текст уже на финальном экране.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { captionWords, chunksOf } from "./captions";
import { useTimeline } from "./context";
import { BG19_VIDEO, bg19LineById } from "./script";
import { sceneOf, wordFrameIn } from "./timing";

const FPS = BG19_VIDEO.fps;
const ACCENT = /^(BalaGo|Бишкектеги|коңгуроо|график|сиз|алдын|ала|үйдөн|мектепке|үйгө|топ|акысыз|толук)$/i;

type Chunk = { readonly words: readonly string[]; readonly from: number };
const clean = (w: string) => w.replace(/[.,!?:—«»\u00A0]/g, "");

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const cue = tl.cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.4);
  if (!cue || cue.id === "n5") return null;
  const line = bg19LineById(cue.id);
  // показываемые слова — из сценария; тире не отдельное слово
  const words = captionWords(line.text);
  const spokenCount = cue.words.length;
  const startOf = (i: number) => {
    const k = spokenCount === words.length ? i : Math.round((i * spokenCount) / words.length);
    return cue.words[k]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
  };
  const groups = chunksOf(words);
  const chunks: Chunk[] = groups.map((g) => ({ words: g.map((i) => words[i]), from: startOf(g[0]) }));
  let idx = 0;
  for (let k = 1; k < chunks.length; k++) if (t >= chunks[k].from - 0.08) idx = k;
  const ch = chunks[idx];
  const shownAt = Math.max(cue.from - 0.1, ch.from - 0.08);
  const a = easeOut((t - shownAt) / 0.16) * (1 - easeOut((t - (cue.to + 0.25)) / 0.15));

  // позиция по сцене
  const scene = tl.scenes.find((s) => t >= s.from && t < s.to)?.id ?? line.scene;
  const bell = sceneOf(tl, "bell");
  const splitAt = bell.from + wordFrameIn(tl, "n1", 2) / FPS;
  const onWave = scene === "worlds" || scene === "call" || (scene === "bell" && t >= splitAt - 0.1);
  const top = onWave ? 960 : 1440;

  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: top - 70, height: 140, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        key={`${cue.id}-${idx}`}
        style={{
          maxWidth: 900,
          textAlign: "center",
          fontFamily,
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.12,
          color: "#FFFFFF",
          WebkitTextStroke: "11px #14285A",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(10,20,50,0.35)",
          opacity: a,
          scale: `${0.9 + 0.1 * a}`,
          translate: `0 ${(1 - a) * 14}px`,
        }}
      >
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

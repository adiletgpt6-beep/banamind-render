// Субтитры фильма №35: точная речь (не редакционные акценты). Белый текст
// на тёмной скруглённой плашке, короткие смысловые фрагменты (обычно 2–5
// слов, не больше двух строк), смена фрагментов — по фактическим таймингам
// слов озвучки; следующая реплика заранее не показывается. Одно ключевое
// слово реплики (line.accent) — жёлтым, без мигания. Положение одинаково
// в пределах сцены (SUB_Y), в безопасной зоне y 200–1540.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { usePlan } from "./context";
import { lineById, PHT_VIDEO, type PhtSceneId } from "./script";
import { chunkLine } from "./subtitleChunks";

const FPS = PHT_VIDEO.fps;

// Центр плашки по вертикали (px кадра) для сцены. По умолчанию — нижняя
// средняя часть кадра; выше, где внизу руки, форма или рисунок.
export const SUB_Y: Partial<Record<PhtSceneId, number>> = { wednesday: 1490 };
export const SUB_Y_DEFAULT = 1450;

const Accented: React.FC<{ readonly words: readonly string[]; readonly accent?: string }> = ({ words, accent }) => {
  const text = words.join(" ");
  if (!accent) return <>{text}</>;
  const i = text.toLowerCase().indexOf(accent.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: "#FFD34D" }}>{text.slice(i, i + accent.length)}</span>
      {text.slice(i + accent.length)}
    </>
  );
};

export const Subtitles: React.FC = () => {
  const plan = usePlan();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const cue = plan.cues.find((c) => t >= c.from - 0.1 && t <= c.to + 0.35);
  if (!cue) return null;
  const chunk = chunkLine(cue).find((c) => t >= c.from && t < c.to);
  if (!chunk) return null;
  const line = lineById(cue.id);
  const scene = plan.scenes.find((s) => f >= s.from && f < s.to);
  const y = (scene && SUB_Y[scene.id]) ?? SUB_Y_DEFAULT;
  // мягкое появление в начале реплики и уход в конце (3–4 кадра)
  const a = Math.min(1, (t - (cue.from - 0.1)) * 8, (cue.to + 0.35 - t) * 8);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y, height: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "14px 30px 16px",
          borderRadius: 30,
          backgroundColor: "rgba(12,20,34,0.86)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.18,
          textAlign: "center",
          opacity: Math.max(0, a),
          boxShadow: "0 10px 30px rgba(10,15,30,0.22)",
        }}
      >
        <Accented words={chunk.words} accent={line.accent} />
      </div>
    </div>
  );
};

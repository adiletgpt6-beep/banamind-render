// Субтитры (кыргызча) по итоговой озвучке: белая скруглённая плашка,
// тёмный текст, одно значимое слово выделено жёлтым маркером или
// бирюзой. Реплика делится на смысловые части (предложения, затем по
// запятой/тире) — не больше двух строк; часть появляется по фактическому
// времени своего первого слова (тайминги ElevenLabs), а не по числу букв.
import { useCurrentFrame } from "remotion";
import { C, fontFamily } from "./kit";
import { useTimeline } from "./context";
import { easeInOut, easeOut } from "./rig/motion";
import { DD_VIDEO, type DdSceneId } from "./script";
import { SUB_HIGHLIGHT, subtitleWindows } from "./subs";

const FPS = DD_VIDEO.fps;
export const SUB_FONT = 52;

// Положение плашки: нижний край (px кадра). Сцены с крупным планом листа
// поднимают субтитры в свободную часть кадра.
export type SubPlace = { readonly bottom: number };
export const SUB_DEFAULT: SubPlace = { bottom: 1550 };

const Words: React.FC<{ readonly text: string; readonly id: string }> = ({ text, id }) => {
  const hl = SUB_HIGHLIGHT[id] ?? [];
  let used = false;
  const toks = text.split(" ");
  return (
    <>
      {toks.map((tk, i) => {
        const bare = tk.toLowerCase().replace(/[«»„“"(),.!?:;—]/g, "");
        const m = !used ? hl.find(([w]) => bare.startsWith(w.toLowerCase())) : undefined;
        if (m) used = true;
        return (
          <span key={i}>
            {i > 0 ? " " : ""}
            {m ? (
              <span
                style={{
                  background: m[1] === "yellow" ? C.yellow : "rgba(115,220,232,0.55)",
                  borderRadius: 10,
                  padding: "0 8px",
                  margin: "0 -2px",
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                {tk}
              </span>
            ) : (
              tk
            )}
          </span>
        );
      })}
    </>
  );
};

export const Subtitles: React.FC<{ readonly place: (scene: DdSceneId, t: number) => SubPlace }> = ({ place }) => {
  const tl = useTimeline();
  const frame = useCurrentFrame();
  const t = (frame + 0.5) / FPS;
  const wins = subtitleWindows(tl.cues);
  const w = wins.find((x) => t >= x.from && t < x.to);
  if (!w) return null;
  const scene = tl.scenes.find((s) => frame >= s.from && frame < s.to) ?? tl.scenes[tl.scenes.length - 1];
  const p = place(scene.id, frame - scene.from);
  const prev = wins[wins.indexOf(w) - 1];
  // смена частей одной реплики — без мигания плашки
  const contiguous = prev && prev.id === w.id && Math.abs(prev.to - w.from) < 0.05;
  const a = contiguous ? 1 : easeOut((t - w.from) / 0.14);
  const z = 1 - easeInOut((t - (w.to - 0.12)) / 0.12);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 0,
        height: p.bottom,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          padding: "14px 30px 16px",
          borderRadius: 28,
          backgroundColor: "rgba(255,255,255,0.97)",
          color: C.ink,
          fontFamily,
          fontSize: SUB_FONT,
          fontWeight: 800,
          lineHeight: 1.24,
          textAlign: "center",
          opacity: Math.min(a, z),
          transform: `translateY(${(1 - a) * 10}px)`,
          boxShadow: "0 10px 30px rgba(10,15,30,0.28)",
        }}
      >
        <Words text={w.text} id={w.id} />
      </div>
    </div>
  );
};

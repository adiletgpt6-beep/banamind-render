// Общие помощники сцен: время сцены, слова реплик, содержимое карточки.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext, SceneContext } from "../context";
import { cardRectAt, type Rect } from "../layout";
import { UL2_SCENES, UL2_VIDEO, type Ul2SceneId } from "../script";
import { type Cam, PanelShot } from "../shots";
import { LAYOUT } from "../theme";

export const FPS = UL2_VIDEO.fps;
export const sceneStart = (id: Ul2SceneId) => UL2_SCENES.find((s) => s.id === id)!.from;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Кадр сцены, время ролика (с) и помощники по репликам.
export const useScene = (id: Ul2SceneId) => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const t0 = sceneStart(id);
  const t = t0 + f / FPS;
  const cue = (lineId: string) => {
    const c = cues.find((x) => x.id === lineId);
    if (!c) throw new Error(`Нет реплики ${lineId}`);
    return c;
  };
  // кадр сцены начала/конца реплики и начала слова i
  const from = (lineId: string) => Math.round((cue(lineId).from - t0) * FPS);
  const to = (lineId: string) => Math.round((cue(lineId).to - t0) * FPS);
  const word = (lineId: string, i: number) => {
    const c = cue(lineId);
    const w = c.words[i];
    return Math.round(((w ? w.start : c.from + ((c.to - c.from) * i) / Math.max(1, c.words.length || 8)) - t0) * FPS);
  };
  // кадр сцены для абсолютного времени ролика (с)
  const at = (sec: number) => Math.round((sec - t0) * FPS);
  return { f, t, t0, from, to, word, cue, at };
};

// Содержимое основной карточки: локальные координаты 0…w × 0…h, края
// скруглены; положение и размер — по времени ролика (layout.ts).
export const usePanel = () => {
  const base = useContext(SceneContext);
  const f = useCurrentFrame();
  return cardRectAt((base + f) / FPS);
};

export const PanelArea: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number }> = ({ children, opacity = 1 }) => {
  const r = usePanel();
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 36, overflow: "hidden", opacity: opacity * r.opacity, scale: `${r.scale}` }}>
      <PanelSize.Provider value={r}>{children}</PanelSize.Provider>
    </div>
  );
};
export const PanelSize = createContext<Rect>(LAYOUT.card);

// Мир сцены внутри карточки: камера — точка мира в центре области и масштаб.
export const Stage: React.FC<{
  readonly cam: Cam;
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly opacity?: number;
  readonly inset?: { x: number; y: number; w: number; h: number };
  readonly radius?: number;
}> = ({ cam, children, bg, opacity = 1, inset, radius }) => {
  const r = useContext(PanelSize);
  const w = inset?.w ?? r.w;
  const h = inset?.h ?? r.h;
  return (
    <PanelShot f={0} from={0} to={1} x={inset?.x ?? 0} y={inset?.y ?? 0} w={w} h={h} cam={cam} bg={bg} opacity={opacity} radius={radius ?? (inset ? 26 : 0)} border="none">
      {children}
    </PanelShot>
  );
};

// Плавная смена планов внутри карточки: a — до кадра cut, b — после.
export const crossfade = (f: number, cut: number, d = 6) => Math.max(0, Math.min(1, (f - cut + d / 2) / d));

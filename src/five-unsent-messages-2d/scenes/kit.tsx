// Общие помощники сцен: время сцены, слова реплик, раскладка.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { panelAt, type Rect } from "../layout";
import { FU2_SCENES, FU2_VIDEO, type Fu2SceneId } from "../script";
import { type Cam, PanelShot } from "../shots";
import { LAYOUT } from "../theme";

export const FPS = FU2_VIDEO.fps;
export const sceneStart = (id: Fu2SceneId) => FU2_SCENES.find((s) => s.id === id)!.from;

// Кадр сцены, время ролика (с) и помощники по репликам.
export const useScene = (id: Fu2SceneId) => {
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
  return { f, t, t0, from, to, word, cue };
};

// Содержимое основной панели: локальные координаты 0…w × 0…h, края
// скруглены; размер панели — по времени ролика (layout.ts).
export const usePanel = () => panelAt();

export const PanelArea: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number }> = ({ children, opacity = 1 }) => {
  const r = usePanel();
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 34, overflow: "hidden", opacity }}>
      <PanelSize.Provider value={r}>{children}</PanelSize.Provider>
    </div>
  );
};
export const PanelSize = createContext<Rect>(LAYOUT.panel);

// Мир сцены внутри панели: камера — точка мира в центре панели и масштаб.
export const Stage: React.FC<{ readonly cam: Cam; readonly children: React.ReactNode; readonly bg?: string; readonly opacity?: number; readonly inset?: { x: number; y: number; w: number; h: number } }> = ({ cam, children, bg, opacity = 1, inset }) => {
  const r = useContext(PanelSize);
  const w = inset?.w ?? r.w;
  const h = inset?.h ?? r.h;
  return (
    <PanelShot f={0} from={0} to={1} x={inset?.x ?? 0} y={inset?.y ?? 0} w={w} h={h} cam={cam} bg={bg} opacity={opacity} radius={inset ? 24 : 0} border={inset ? undefined : "none"}>
      {children}
    </PanelShot>
  );
};

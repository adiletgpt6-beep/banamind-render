// Камера и параллакс. Мир сцены рисуется в своих координатах (px); камера —
// точка мира в центре кадра и масштаб. Слой глубины depth: 1 — движется
// вместе с миром, < 1 — дальше (смещается и приближается меньше), > 1 —
// ближе к зрителю. Слои рисуются так, как они выглядят при базовой камере.
import { createContext, useContext } from "react";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

const CamCtx = createContext<{ cam: Cam; base: Cam }>({ cam: { x: 540, y: 960, zoom: 1 }, base: { x: 540, y: 960, zoom: 1 } });

export const World: React.FC<{ readonly cam: Cam; readonly base?: Cam; readonly children: React.ReactNode; readonly bg?: string }> = ({ cam, base, children, bg }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, backgroundColor: bg ?? "transparent" }}>
    <CamCtx.Provider value={{ cam, base: base ?? cam }}>
      <g transform={`translate(${540 - cam.x * cam.zoom} ${960 - cam.y * cam.zoom}) scale(${cam.zoom})`}>{children}</g>
    </CamCtx.Provider>
  </svg>
);

export const Layer: React.FC<{ readonly depth: number; readonly children: React.ReactNode }> = ({ depth, children }) => {
  const { cam, base } = useContext(CamCtx);
  const rel = cam.zoom / base.zoom;
  const s = (1 + (rel - 1) * depth) / rel;
  const dx = (cam.x - base.x) * (1 - depth);
  const dy = (cam.y - base.y) * (1 - depth) * 0.6;
  return <g transform={`translate(${cam.x} ${cam.y}) scale(${s}) translate(${-cam.x + dx} ${-cam.y + dy})`}>{children}</g>;
};

// Неподвижный относительно кадра слой (небо): рисуется в координатах кадра.
export const Screen: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const { cam } = useContext(CamCtx);
  return <g transform={`translate(${cam.x} ${cam.y}) scale(${1 / cam.zoom}) translate(-540 -960)`}>{children}</g>;
};

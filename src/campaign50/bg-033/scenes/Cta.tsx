// ЗАГОТОВКА: сцена «cta» (будет заменена реализацией).
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import type { Bg33Scene, Bg33Sfx, Bg33Timeline } from "../timing";

export const ctaSfx: (
  tl: Bg33Timeline,
  sc: Bg33Scene,
) => readonly Bg33Sfx[] = () => [];

export const CtaScene: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: C.paper, fontFamily, color: C.navy, fontSize: 80, display: "grid", placeItems: "center" }}>
    cta
  </div>
);

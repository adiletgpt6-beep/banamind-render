// Рабочие листы для проверки ассетов №34 вне фильма (персонажи, декорации,
// карточки, экран BalaGo, книга). Каждый лист — своя композиция
// (папка «Extra-line-34-dev» в Studio). В фильм не входят.
import { AbsoluteFill } from "remotion";
import "../../fonts";
import { SceneContext } from "../context";
import { C } from "../theme";

export const DEV_FRAMES = 300;

export const DevSheet: React.FC<{ readonly children: React.ReactNode; readonly bg?: string }> = ({ children, bg = C.bg }) => (
  <SceneContext.Provider value={{ from: 0, to: DEV_FRAMES }}>
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>{children}</AbsoluteFill>
  </SceneContext.Provider>
);

// Временная заглушка сцены (до реализации): название сцены на бумажном фоне.
import { M13_SCENE_SPECS, type M13SceneId } from "../script";
import { C, F } from "../theme";

export const Placeholder: React.FC<{ readonly id: M13SceneId }> = ({ id }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: C.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 72, color: C.navy, textAlign: "center", padding: 80 }}>{M13_SCENE_SPECS.find((s) => s.id === id)?.title}</div>
  </div>
);

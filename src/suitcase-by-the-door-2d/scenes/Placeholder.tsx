// Временная заглушка сцены (только до реализации).
import { SD2_SCENE_SPECS, type Sd2SceneId } from "../script";
import { box, FONT, Paper, Shot, useScene } from "../kit";
import { C } from "../theme";

export const Placeholder: React.FC<{ readonly id: Sd2SceneId }> = ({ id }) => {
  const { f } = useScene(id);
  const spec = SD2_SCENE_SPECS.find((s) => s.id === id)!;
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }}>
      <Paper />
      <div style={box({ left: 90, top: 700, width: 900, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.ink })}>{spec.title}</div>
    </Shot>
  );
};

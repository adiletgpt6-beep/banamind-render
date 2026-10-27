// Сцена 1 (хук, 0–≈6 с): на белом листе жёлтая линия медленно рисует
// большой «?» (слой YellowLine). Из света знака проявляется лицо мамы —
// задумчивое, рука у подбородка; знак уменьшается и становится её мыслью.
// В конце камера мягко отъезжает к столу (стык со сценой «Блокнот»).
import { useCurrentFrame } from "remotion";
import { appear, blink, breathe, easeInOut, lerp } from "../anim";
import { useScene } from "../context";
import { MOM_DESK, MOM_HOOK } from "../layout";
import { C } from "../palette";
import { Mom } from "../parts/Mom";
import { KineticTitle, Paper } from "../parts/ui";
import { BG49_TEXT } from "../script";

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const k = appear(f, 66, 24);
  const glow = appear(f, 50, 30);
  const pull = easeInOut((f - (frames - 22)) / 22);
  const x = lerp(MOM_HOOK.x, MOM_DESK.x, pull);
  const y = lerp(MOM_HOOK.y, MOM_DESK.y, pull) + (1 - k) * 70;
  const s = lerp(MOM_HOOK.s, MOM_DESK.s, pull) * (0.94 + 0.06 * k);
  const lookUp = appear(f, 84, 16);
  return (
    <>
      <Paper />
      {/* мягкое световое пятно: лицо «проявляется» из знака */}
      <div
        style={{
          position: "absolute",
          left: x - 330 * glow,
          top: y - 330 * glow,
          width: 660 * glow,
          height: 660 * glow,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.yellowSoft} 0%, rgba(255,244,194,0.55) 45%, rgba(255,244,194,0) 72%)`,
          opacity: 1 - pull * 0.6,
        }}
      />
      <KineticTitle
        text={BG49_TEXT.hook.title}
        y={262}
        f={f}
        at={6}
        size={96}
        spacing={10}
      />
      <Mom
        uid="hook"
        x={x}
        y={y}
        s={s}
        opacity={k}
        pose="chin"
        tilt={-5 + breathe(f, 110, 1.2)}
        look={[lerp(0.1, 0.75, lookUp), lerp(0, -0.85, lookUp)]}
        brow={0.8}
        smile={0.12}
        eyes={blink(f, 40)}
        lean={breathe(f, 140, 2)}
      />
    </>
  );
};

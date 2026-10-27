// 0–5 с. Товар вылетает из глубины с поворотом, вспышка золотой пыли,
// блик по поверхности, затем заголовок по словам.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { KineticTitle } from "../components/KineticTitle";
import { Particles } from "../components/Particles";
import { ProductFrame } from "../components/ProductFrame";
import { easeOut, range } from "../components/anim";
import { CONTENT } from "../content";
import { sans } from "../fonts";

const P = CONTENT.brand.palette;

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const fly = easeOut(f / 26);
  const push = range(f, 26, 160, 1, 1.06, (x) => x);
  return (
    <AbsoluteFill>
      <Backdrop seed={3} />
      <Particles count={54} seed="hook" burst={Math.max(0, 1 - Math.abs(f - 22) / 14)} />
      <AbsoluteFill style={{ alignItems: "center", top: 200 }}>
        <div
          style={{
            transform: `translateZ(0) scale(${(0.55 + fly * 0.45) * push}) translateY(${(1 - fly) * 160}px)`,
            filter: `blur(${(1 - fly) * 14}px)`,
            opacity: fly,
          }}
        >
          <ProductFrame photo={CONTENT.photos[0]} w={680} h={810} rotY={(1 - fly) * 38 - 4 + Math.sin(f / 30) * 2} rotX={(1 - fly) * -12} zoom={1.1} dur={150} sweepAt={30} />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 600,
          letterSpacing: range(f, 4, 40, 2, 14),
          fontSize: 30,
          color: P.accent,
          opacity: range(f, 4, 24),
          textTransform: "uppercase",
        }}
      >
        {CONTENT.hook.kicker}
      </div>
      <AbsoluteFill style={{ top: 1045, alignItems: "center" }}>
        <KineticTitle lines={CONTENT.hook.title} accent={CONTENT.hook.accent} start={34} size={100} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

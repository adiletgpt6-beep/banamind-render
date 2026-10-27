// 35–50 с. Эмоциональная витрина: тёмная сцена, фото товара на
// вращающемся 3D-кольце, лучи света сверху, крупный заголовок.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { KineticTitle } from "../components/KineticTitle";
import { Particles } from "../components/Particles";
import { ProductFrame } from "../components/ProductFrame";
import { range } from "../components/anim";
import { CONTENT } from "../content";

const P = CONTENT.brand.palette;
const RING = CONTENT.photos.slice(0, 6);
const R = 470;

export const Showcase: React.FC = () => {
  const f = useCurrentFrame();
  const rot = range(f, 0, 450, 20, -250, (x) => x);
  const rays = 0.35 + 0.15 * Math.sin(f / 25);
  return (
    <AbsoluteFill>
      <Backdrop tone="deep" seed={11} />
      <AbsoluteFill style={{ background: `conic-gradient(from 180deg at 50% -10%, transparent 40%, rgba(233,216,184,${rays * 0.4}) 47%, transparent 50%, rgba(233,216,184,${rays * 0.3}) 53%, transparent 60%)` }} />
      <Particles count={60} seed="show" color={P.accentSoft} />
      <AbsoluteFill style={{ perspective: 2200, alignItems: "center", justifyContent: "center", top: -300 }}>
        <div style={{ position: "relative", width: 440, height: 580, transformStyle: "preserve-3d", transform: `rotateX(-6deg) rotateY(${rot}deg)` }}>
          {RING.map((ph, i) => {
            const a = (360 / RING.length) * i;
            const facing = Math.cos(((a + rot) * Math.PI) / 180);
            return (
              <div key={i} style={{ position: "absolute", inset: 0, transform: `rotateY(${a}deg) translateZ(${R}px)`, backfaceVisibility: "hidden", opacity: 0.35 + 0.65 * Math.max(0, facing), filter: `brightness(${0.6 + 0.4 * Math.max(0, facing)})` }}>
                <ProductFrame photo={ph} w={440} h={580} zoom={1.05} dur={450} radius={28} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1110, alignItems: "center" }}>
        <KineticTitle lines={CONTENT.showcase.title} accent={CONTENT.showcase.accent} start={20} size={100} color="#FFFFFF" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 15–35 с. Три подтверждённых преимущества: крупное фото с медленным
// 3D-поворотом, номер «01» контуром, заголовок и пояснение.
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Particles } from "../components/Particles";
import { ProductFrame } from "../components/ProductFrame";
import { easeOut, inOut, range } from "../components/anim";
import { CONTENT, FPS, SCENES, type Feature } from "../content";
import { sans, serif } from "../fonts";

const P = CONTENT.brand.palette;
const EACH = Math.round((SCENES.features.dur * FPS) / CONTENT.features.length);

const One: React.FC<{ feat: Feature; i: number }> = ({ feat, i }) => {
  const f = useCurrentFrame();
  const side = i % 2 === 0 ? 1 : -1;
  const vis = inOut(f, EACH, 18, 14);
  const t = easeOut((f - 14) / 20);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: 230, left: side > 0 ? 190 : 150, transform: `translateX(${(1 - vis) * side * 120}px)` }}>
        <ProductFrame photo={CONTENT.photos[feat.photo]} w={740} h={770} rotY={side * range(f, 0, EACH, 14, -6, (x) => x)} zoom={1.14} dur={EACH} sweepAt={24} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 130,
          [side > 0 ? "left" : "right"]: 70,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 210,
          color: "transparent",
          WebkitTextStroke: `3px ${P.accent}`,
          opacity: 0.9 * t,
          transform: `translateY(${(1 - t) * 40}px)`,
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", top: 1035, left: 80, right: 80, textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 84, color: P.ink, lineHeight: 1.04, transform: `translateY(${(1 - t) * 50}px)`, opacity: t }}>{feat.title}</div>
        <div style={{ width: 150 * t, height: 3, background: P.accent, margin: "22px auto" }} />
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 40, color: P.ink, opacity: easeOut((f - 26) / 18) * 0.8 }}>{feat.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Features: React.FC = () => (
  <AbsoluteFill>
    <Backdrop seed={9} />
    <Particles count={26} seed="feat" />
    {CONTENT.features.map((feat, i) => (
      <Sequence key={i} from={i * EACH} durationInFrames={EACH} layout="none">
        <One feat={feat} i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// 5–15 с. Зачем это зрителю: заголовок сверху, две карточки фото
// с параллаксом на разной глубине, золотая линия «связывает» их.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { KineticTitle } from "../components/KineticTitle";
import { Particles } from "../components/Particles";
import { ProductFrame } from "../components/ProductFrame";
import { easeOut, range } from "../components/anim";
import { CONTENT } from "../content";

const P = CONTENT.brand.palette;

export const Need: React.FC = () => {
  const f = useCurrentFrame();
  const a = easeOut((f - 8) / 30);
  const b = easeOut((f - 40) / 30);
  const drift = f * 0.12;
  const line = range(f, 60, 110);
  return (
    <AbsoluteFill>
      <Backdrop seed={5} />
      <Particles count={30} seed="need" />
      <AbsoluteFill style={{ top: 170, alignItems: "center" }}>
        <KineticTitle lines={CONTENT.need.title} accent={CONTENT.need.accent} start={6} size={92} exitAt={null} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M 300 1080 C 420 1150, 640 1120, 820 1250" stroke={P.accent} strokeWidth={3} fill="none" strokeDasharray={700} strokeDashoffset={700 * (1 - line)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 70, top: 540 - drift * 0.4, transform: `translateX(${(1 - a) * -300}px)`, opacity: a }}>
        <ProductFrame photo={CONTENT.photos[1]} w={460} h={520} rotY={10} zoom={1.12} dur={300} sweepAt={50} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 720 - drift * 0.6, transform: `translateX(${(1 - b) * 300}px)`, opacity: b }}>
        <ProductFrame photo={CONTENT.photos[2]} w={460} h={520} rotY={-10} zoom={1.12} dur={300} sweepAt={90} />
      </div>
    </AbsoluteFill>
  );
};

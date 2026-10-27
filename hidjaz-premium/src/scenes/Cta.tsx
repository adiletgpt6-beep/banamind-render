// 50–60 с. Бренд и подтверждённый способ заказа: логотип (или handle)
// с золотым бликом, кнопка действия с мягкой пульсацией, стрелка
// к шапке профиля. Финальный экран держится до конца ролика.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, Grain } from "../components/Backdrop";
import { LightSweep } from "../components/LightSweep";
import { Particles } from "../components/Particles";
import { ProductFrame } from "../components/ProductFrame";
import { easeOut, range } from "../components/anim";
import { CONTENT } from "../content";
import { sans, serif } from "../fonts";

const P = CONTENT.brand.palette;

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const logo = easeOut((f - 6) / 24);
  const btn = easeOut((f - 34) / 18);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((f - 50) / 9));
  const name = CONTENT.brand.name ?? CONTENT.brand.handle.replace("@", "");
  return (
    <AbsoluteFill>
      <Backdrop seed={13} />
      <Particles count={40} seed="cta" />
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: range(f, 0, 20) }}>
        <ProductFrame photo={CONTENT.photos[0]} w={500} h={560} rotY={Math.sin(f / 40) * 4} zoom={1.06} dur={300} radius={300} sweepAt={70} />
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", transform: `scale(${0.9 + logo * 0.1})`, opacity: logo }}>
        {CONTENT.brand.logo ? (
          <Img src={staticFile(`brand/${CONTENT.brand.logo}`)} style={{ height: 180 }} />
        ) : (
          <div style={{ position: "relative", display: "inline-block", fontFamily: serif, fontWeight: 600, fontSize: 104, color: P.ink, letterSpacing: 2 }}>
            {name}
            <LightSweep start={30} dur={34} strength={0.8} />
          </div>
        )}
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, color: P.accent, letterSpacing: 6, marginTop: 10 }}>{CONTENT.brand.handle}</div>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: btn, transform: `translateY(${(1 - btn) * 40}px)` }}>
        <div style={{ padding: "26px 64px", borderRadius: 999, background: P.deep, color: "#fff", fontFamily: sans, fontWeight: 800, fontSize: 52, transform: `scale(${pulse})`, boxShadow: `0 18px 40px ${P.deep}55` }}>
          {CONTENT.cta.action}
        </div>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 38, color: P.ink }}>{CONTENT.cta.sub}</div>
        {CONTENT.cta.note ? <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 34, color: P.ink, opacity: 0.75 }}>{CONTENT.cta.note}</div> : null}
      </div>
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

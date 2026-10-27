import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { HH_TEXT } from "../script";
import { BRAND } from "../three/props";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Финальный экран (114–120 с): логотип, слоган, маршрут, статус, кнопка и
// подсказка о ссылке в профиле. Элементы проявляются за ~0,6 с, затем экран
// статичен (держится 6 с).
export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const show = (k: number) => interpolate(f, [k * 3, k * 3 + 10], [0, 1], clamp);
  const rise = (k: number) => interpolate(f, [k * 3, k * 3 + 12], [24, 0], clamp);
  const T = HH_TEXT.cta;
  const item = (k: number): React.CSSProperties => ({ opacity: show(k), transform: `translateY(${rise(k)}px)` });
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily, color: BRAND.navy }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 250, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ ...item(0) }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 460, height: 460, objectFit: "contain" }} />
        </div>
        <div style={{ marginTop: 26, fontWeight: 900, fontSize: 70, lineHeight: 1.1, ...item(1) }}>{T.tagline}</div>
        <div style={{ marginTop: 26, fontWeight: 900, fontSize: 60, letterSpacing: 2, ...item(2) }}>
          <span style={{ backgroundImage: `linear-gradient(${BRAND.yellow}, ${BRAND.yellow})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 34%", backgroundPosition: "0 88%" }}>{T.route}</span>
        </div>
        <div style={{ marginTop: 36, padding: "14px 34px", borderRadius: 999, backgroundColor: "#EEF2FA", fontWeight: 800, fontSize: 42, ...item(3) }}>{T.status}</div>
        <div style={{ marginTop: 46, width: 760, padding: "30px 0", borderRadius: 999, backgroundColor: BRAND.yellow, fontWeight: 900, fontSize: 66, boxShadow: "0 20px 46px rgba(255,180,0,0.42)", ...item(4) }}>{T.button}</div>
        <div style={{ marginTop: 34, fontWeight: 800, fontSize: 46, color: "#3B4E7A", ...item(5) }}>{T.link}</div>
      </div>
    </AbsoluteFill>
  );
};

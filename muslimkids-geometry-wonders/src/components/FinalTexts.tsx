// Финальные текстовые слои: перевод смысла аята и знак бренда.
// Текст — отдельный неподвижный слой, геометрия его не деформирует.
import { AbsoluteFill } from "remotion";
import { ramp, window01 } from "../engines/GeometryWondersEngine";
import { Divider, textShadow } from "../systems/TypographySystem";
import { FONT_FAMILY, PALETTE } from "../styles/palette";
import { T } from "../timeline";

export const OrnamentBackground: React.FC<{ t: number }> = ({ t }) => {
  const calm = ramp(t, T.open[0], T.open[1]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 50% at 50% 50%, rgba(32,90,145,${0.5 + 0.2 * calm}) 0%, #0f2744 52%, ${PALETTE.night} 100%)`,
      }}
    />
  );
};

export const Quote: React.FC<{ t: number }> = ({ t }) => {
  const k = window01(t, T.quote[0], T.quote[1], 0.7, 0.55);
  if (k <= 0) return null;
  const lines = ["ГОСПОДЬ НАШ!", "ТЫ НЕ СОТВОРИЛ", "ЭТО ПОНАПРАСНУ"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: k }}>
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 760,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(8,21,37,0.78) 0%, rgba(8,21,37,0.55) 45%, rgba(8,21,37,0) 72%)",
        }}
      />
      <div style={{ position: "relative", textAlign: "center", fontFamily: FONT_FAMILY, transform: `translateY(${(1 - k) * 18}px)` }}>
        {lines.map((l, i) => (
          <div
            key={l}
            style={{
              fontWeight: 900,
              fontSize: 82,
              lineHeight: 1.16,
              letterSpacing: "0.03em",
              color: i === 0 ? PALETTE.gold : PALETTE.milk,
              textShadow,
              opacity: ramp(t, T.quote[0] + i * 0.35, T.quote[0] + 0.6 + i * 0.35),
            }}
          >
            {l}
          </div>
        ))}
        <Divider k={ramp(t, T.quote[0] + 0.8, T.quote[0] + 1.6)} width={380} />
        <div style={{ fontWeight: 800, fontSize: 38, color: PALETTE.sky, textShadow }}>Сура «Аль-Имран», 3:191</div>
        <div style={{ fontWeight: 600, fontSize: 32, color: PALETTE.milk, opacity: 0.85, marginTop: 6, textShadow }}>
          Часть аята. Перевод смысла.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Brand: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, T.logo[0] + 0.7, T.logo[1] + 0.3, "inOut");
  if (k <= 0) return null;
  const tag = ramp(t, T.logo[1] - 0.1, T.logo[1] + 0.7, "inOut");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1070, textAlign: "center", fontFamily: FONT_FAMILY }}>
      <div
        style={{
          fontWeight: 1000,
          fontSize: 118,
          letterSpacing: "0.06em",
          color: PALETTE.milk,
          textShadow,
          opacity: k,
          transform: `translateY(${(1 - k) * 22}px)`,
        }}
      >
        MUSLIM <span style={{ color: PALETTE.gold }}>KIDS</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: "0.16em", color: PALETTE.turquoise, marginTop: 14, opacity: tag, textShadow }}>
        ОТКРЫВАЙ. ИЗУЧАЙ. РАЗМЫШЛЯЙ.
      </div>
    </div>
  );
};

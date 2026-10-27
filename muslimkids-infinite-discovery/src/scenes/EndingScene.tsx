import React from "react";
import { NightHill } from "../components/BoyOnHill";
import { COLORS, FONT } from "../styles/theme";
import { easeOutCubic } from "../engines/math";

// Scene 7 — the Earth's limb settles into a night hill; a boy looks up at the Moon.
export const EndingScene: React.FC<{ t: number }> = ({ t }) => {
  if (t < 54.5) return null;
  const logo = easeOutCubic(Math.min(1, Math.max(0, (t - 58.0) / 0.8)));
  return (
    <>
      <NightHill t={t} />
      <div style={{
        position: "absolute", top: 1395, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 900,
        fontSize: 64, letterSpacing: `${0.14 + (1 - logo) * 0.1}em`, color: COLORS.gold, opacity: logo,
        textShadow: "0 3px 22px rgba(8,20,38,0.9)",
      }}>MUSLIM KIDS</div>
    </>
  );
};

// Scenes 1 + 2 (0–6.5 s): "NO INTEREST?" with the bank, then the bank morphs
// into the RIBA card. One component so the morph is continuous.
import { AbsoluteFill } from "remotion";
import { AnimatedBank, DollarCoin, InterestIcon, LoanInterestIcon } from "../components/illustrations";
import { Camera, Card, KineticText, Pill } from "../components/ui";
import { fontFamily } from "../fonts";
import { type If01Manifest, wordStart } from "../manifest";
import { cameraScale, easeIn, easeInOut, floatY, mixColor, prog, sec, springFirm, springPop, springSoft } from "../motion";
import { PALETTE } from "../theme";

export const HookRule: React.FC<{ readonly frame: number; readonly manifest: If01Manifest }> = ({ frame: f, manifest }) => {
  const morphAt = 86; // bank → card
  const cam = f < morphAt ? cameraScale(f, 0, morphAt, 1, 1.07) : cameraScale(f, morphAt, morphAt + 30, 1.07, 1);

  // --- scene 1
  const headOut = prog(f, 82, 94, easeIn);
  const bankRise = springFirm(f, 4, 34);
  const bankBuild = prog(f, 4, 44, easeInOut);
  const coin = springPop(f, 24);
  const pct = springPop(f, 30);
  const pctGrow = 1 + 0.15 * prog(f, 40, 50) - 0.15 * prog(f, 56, 70);
  const cross = prog(f, 44, 58, easeInOut);
  const bounce = f > 60 ? Math.abs(Math.sin(((f - 60) / 22) * Math.PI)) * Math.exp(-(f - 60) / 28) * -22 : 0;
  const bankFade = 1 - prog(f, morphAt, morphAt + 18, easeInOut);
  const bankShrink = 1 - 0.35 * prog(f, morphAt, morphAt + 22, easeInOut);
  const sideOut = 1 - prog(f, morphAt - 4, morphAt + 10);

  // --- scene 2
  const cardIn = springFirm(f, morphAt + 6, 26);
  const ribaAt = sec(wordStart(manifest, "l2", "riba", 4.8));
  const prohibitedAt = sec(wordStart(manifest, "l2", "prohibited", 5.35));
  const ban = prog(f, prohibitedAt - 6, prohibitedAt + 14, easeInOut);
  const greenAt = prohibitedAt + 16;
  const toGreen = prog(f, greenAt, greenAt + 16, easeInOut);
  const accent = mixColor(PALETTE.coral, PALETTE.green, toGreen);
  const tint = mixColor("#FFFFFF", PALETTE.greenSoft, toGreen);
  const sceneOut = prog(f, 186, 195, easeIn);

  return (
    <Camera scale={cam}>
      {/* scene 1 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, opacity: 1 - headOut, transform: `translateY(${-headOut * 60}px)` }}>
        <KineticText text={"NO\nINTEREST?"} frame={f} start={-5} size={168} stagger={3} />
      </div>
      <div style={{ position: "absolute", left: 540 - 280, top: 760, width: 560, opacity: bankFade, transform: `translateY(${(1 - bankRise) * 320}px) scale(${bankShrink})`, transformOrigin: "50% 60%" }}>
        <AnimatedBank build={bankBuild} width={560} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 980, opacity: Math.min(coin, sideOut), transform: `scale(${coin}) translateY(${floatY(f, 5, 80)}px)`, transformOrigin: "50% 50%" }}>
        <DollarCoin size={150} />
      </div>
      <div style={{ position: "absolute", left: 790, top: 700 + bounce, opacity: Math.min(pct, sideOut), transform: `scale(${pct * pctGrow})`, transformOrigin: "50% 50%" }}>
        <InterestIcon size={210} cross={cross} />
      </div>

      {/* scene 2: finance card */}
      {f >= morphAt + 4 ? (
        <AbsoluteFill style={{ opacity: Math.min(1, cardIn * 1.3) * (1 - sceneOut), transform: `translateY(${-sceneOut * 80}px)` }}>
          <Card accent={accent} bg={tint} style={{ left: 120, top: 640, width: 840, height: 720, transform: `scale(${0.62 + 0.38 * cardIn})`, transformOrigin: "50% 45%" }}>
            <div style={{ position: "absolute", left: 48, top: 44 }}>
              <Pill frame={f} start={morphAt + 20} tone="green" size={30} firm>
                ISLAMIC FINANCE
              </Pill>
            </div>
            <div style={{ position: "absolute", left: 44, top: 150 }}>
              <KineticText text="RIBA" frame={f} start={Math.max(morphAt + 14, ribaAt - 34)} size={210} mode="letters" stagger={3} align="left" letterSpacing={-0.03} />
            </div>
            <div style={{ position: "absolute", left: 52, top: 384, fontFamily, fontSize: 46, fontWeight: 600, color: PALETTE.inkSoft, opacity: prog(f, morphAt + 36, morphAt + 48), transform: `translateY(${(1 - prog(f, morphAt + 36, morphAt + 48)) * 20}px)` }}>
              Interest on loans
            </div>
            <div style={{ position: "absolute", left: 536, top: 408, opacity: springSoft(f, morphAt + 30), transform: `scale(${springSoft(f, morphAt + 30)})`, transformOrigin: "50% 50%" }}>
              <LoanInterestIcon size={250} ban={ban} />
            </div>
            <div style={{ position: "absolute", left: 52, top: 540, fontFamily, fontSize: 34, fontWeight: 800, letterSpacing: "0.08em", color: toGreen > 0.5 ? PALETTE.greenDark : "#B23A3A", opacity: prog(f, prohibitedAt, prohibitedAt + 10) }}>
              {toGreen > 0.5 ? "NOT ALLOWED" : "PROHIBITED"}
            </div>
            <div style={{ position: "absolute", left: 52, top: 596, width: 380 * toGreen, height: 10, borderRadius: 5, backgroundColor: PALETTE.green }} />
          </Card>
        </AbsoluteFill>
      ) : null}
    </Camera>
  );
};

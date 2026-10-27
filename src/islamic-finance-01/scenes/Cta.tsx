// Scene 8 (27.5–30 s): "MONEY, EXPLAINED." / FOLLOW FOR MORE with a coin stack.
import { AbsoluteFill } from "remotion";
import { CoinStack } from "../components/illustrations";
import { KineticText, Pill, TransactionArrow } from "../components/ui";
import { easeInOut, prog, springFirm } from "../motion";
import { PALETTE } from "../theme";

export const Cta: React.FC<{ readonly frame: number }> = ({ frame: f }) => {
  const drops = [0, 1, 2, 3, 4].map((i) => springFirm(f, 10 + i * 5, 18));
  const arrow = prog(f, 34, 48, easeInOut);
  const pulse = 1 + 0.03 * Math.sin((f / 18) * Math.PI) * (1 - prog(f, 44, 60));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560 }}>
        <KineticText text={"MONEY,\nEXPLAINED."} frame={f} start={0} size={130} stagger={4} accent={{ "EXPLAINED.": PALETTE.greenDark }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", transform: `scale(${pulse})` }}>
        <Pill frame={f} start={14} tone="green" size={50} firm>
          FOLLOW FOR MORE
        </Pill>
      </div>
      <TransactionArrow x1={540} y1={1320} x2={540} y2={1080} progress={arrow} color={PALETTE.ink} width={6} curve={0} opacity={0.5} />
      <div style={{ position: "absolute", left: 540 - 140, top: 1300 }}>
        <CoinStack count={5} size={280} drop={drops} />
      </div>
    </AbsoluteFill>
  );
};

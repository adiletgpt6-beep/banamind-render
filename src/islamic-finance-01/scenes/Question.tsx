// Scene 3 (6.5–9 s): "THEN HOW?" and the empty transaction diagram.
import { InstitutionIcon, PersonIcon } from "../components/illustrations";
import { Camera, KineticText, TransactionArrow as Arrow } from "../components/ui";
import { fontFamily } from "../fonts";
import { cameraScale, easeIn, easeInOut, prog, springPop } from "../motion";
import { PALETTE } from "../theme";

const Label: React.FC<{ readonly text: string; readonly x: number; readonly y: number; readonly op: number }> = ({ text, x, y, op }) => (
  <div style={{ position: "absolute", left: x - 150, top: y, width: 300, textAlign: "center", fontFamily, fontSize: 32, fontWeight: 800, letterSpacing: "0.1em", color: PALETTE.inkSoft, opacity: op }}>{text}</div>
);

export const Question: React.FC<{ readonly frame: number }> = ({ frame: f }) => {
  const out = prog(f, 66, 75, easeIn);
  const cam = cameraScale(f, 0, 75, 1, 1.04);
  const buyer = springPop(f, 10);
  const inst = springPop(f, 16);
  const box = prog(f, 22, 36);
  const a1 = prog(f, 38, 56, easeInOut);
  const a2 = prog(f, 54, 72, easeInOut);
  return (
    <Camera scale={cam}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-out * 70}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330 }}>
          <KineticText text="THEN HOW?" frame={f} start={0} size={160} />
        </div>
        <div style={{ position: "absolute", left: 90, top: 900, transform: `scale(${buyer})`, opacity: buyer, transformOrigin: "50% 50%" }}>
          <PersonIcon size={210} />
        </div>
        <Label text="BUYER" x={195} y={1130} op={buyer} />
        <div style={{ position: "absolute", left: 780, top: 900, transform: `scale(${inst})`, opacity: inst, transformOrigin: "50% 50%" }}>
          <InstitutionIcon size={210} />
        </div>
        <Label text="FINANCIER" x={885} y={1130} op={inst} />
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 900,
            width: 280,
            height: 210,
            borderRadius: 36,
            border: `6px dashed ${PALETTE.inkSoft}`,
            opacity: box * 0.9,
            transform: `scale(${0.9 + 0.1 * box})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontSize: 120,
            fontWeight: 900,
            color: PALETTE.inkSoft,
          }}
        >
          ?
        </div>
        <Label text="ASSET" x={540} y={1130} op={box} />
        <Arrow x1={770} y1={1005} x2={692} y2={1005} progress={a1} dashed color={PALETTE.ink} width={6} opacity={0.55} />
        <Arrow x1={388} y1={1005} x2={312} y2={1005} progress={a2} dashed color={PALETTE.ink} width={6} opacity={0.55} />
      </div>
    </Camera>
  );
};

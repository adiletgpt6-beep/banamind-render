// Телефон мамы крупным планом: один корпус, экран к зрителю. Левая рука
// держит корпус снизу, указательный палец правой касается экрана в
// заданные моменты (taps). Содержимое экрана задаёт сцена (children).
// (Основа — проверенный телефон крупного плана из 2D-ролика №29.)
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { box, Svg } from "../kit";
import { clamp, easeInOut, lerp, type Vec } from "../rig/motion";
import { CloseHand } from "./CloseHand";

// Корпус в кадре и экран.
export const PH = { x: 250, y: 160, w: 580, h: 1190 } as const;
export const SCR = { x: PH.x + 24, y: PH.y + 70, w: PH.w - 48, h: PH.h - 130 } as const;

// ---------- Телефон в руке крупно ----------
// Левая рука держит корпус снизу; указательный палец правой подходит к
// точке касания (за lead кадров), касается (press) и отходит.
export type Tap = { readonly at: number; readonly tip: Vec };
const L = 210;
const ANG = 150;
const wristFor = (tip: Vec) => {
  const r = (ANG * Math.PI) / 180;
  const lx = 0.78 * L * 0.22;
  const ly = L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

export const fingerAt = (f: number, taps: readonly Tap[]) => {
  const home = { x: PH.x + PH.w + 140, y: PH.y + PH.h * 0.9 };
  let tip = home;
  let press = false;
  for (let i = 0; i < taps.length; i++) {
    const a = taps[i];
    const prev = taps[i - 1];
    const from = prev && a.at - prev.at < 40 ? { x: prev.tip.x + 30, y: prev.tip.y + 24 } : home;
    const lead = prev ? Math.min(12, Math.max(3, a.at - prev.at - 3)) : 12;
    if (f >= a.at - lead && f <= a.at + 2) {
      const u = easeInOut(clamp((f - (a.at - lead)) / lead));
      tip = { x: lerp(from.x, a.tip.x, u), y: lerp(from.y, a.tip.y, u) - (1 - u) * 24 };
      press = f >= a.at && f <= a.at + 2;
      break;
    }
    const next = taps[i + 1];
    if (f > a.at + 2 && (!next || f < next.at - Math.min(12, Math.max(3, next.at - a.at - 3)))) {
      const away = next && next.at - a.at < 40 ? 0 : easeInOut(clamp((f - a.at - 2) / 12));
      const rest = { x: a.tip.x + 30, y: a.tip.y + 24 };
      tip = { x: lerp(rest.x, home.x, away), y: lerp(rest.y, home.y, away) };
    }
  }
  return { tip, press };
};

export const PhoneClose: React.FC<{
  readonly f: number;
  readonly taps: readonly Tap[];
  readonly skin: { skin: string; shade: string; sleeve: string; cuff?: string };
  readonly caseColor?: string;
  readonly bg?: string;
  readonly children: React.ReactNode;
}> = ({ f, taps, skin, caseColor = C.coral, bg = "#EFDDBD", children }) => {
  const { tip, press } = fingerAt(f, taps);
  const w = wristFor(tip);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <div style={box({ inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${C.amberGlow}, rgba(0,0,0,0) 70%)` })} />
      <div style={box({ left: PH.x + 18, top: PH.y + 24, width: PH.w, height: PH.h, backgroundColor: "rgba(23,42,70,0.18)", borderRadius: 64 })} />
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: caseColor, borderRadius: 64 })} />
      <div style={box({ left: PH.x + 12, top: PH.y + 12, width: PH.w - 24, height: PH.h - 24, backgroundColor: "#1E2235", borderRadius: 54 })} />
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, overflow: "hidden", borderRadius: 26 })}>{children}</div>
      <Svg>
        <CloseHand x={PH.x + 110} y={PH.y + PH.h + 160} angle={-170} size={250} {...skin} shape="grip" mirror armLen={3} />
        <CloseHand x={w.x} y={w.y + (press ? 4 : 0)} angle={ANG} size={L} {...skin} shape="point" armLen={4} />
        {press ? <circle cx={tip.x} cy={tip.y} r={30} fill="none" stroke={C.blue} strokeWidth={6} opacity={0.6} /> : null}
      </Svg>
    </AbsoluteFill>
  );
};

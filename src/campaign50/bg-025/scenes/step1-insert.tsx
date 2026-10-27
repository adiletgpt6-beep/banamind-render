// Шаг 1, короткая врезка в паузе после «…билдиресиз.»: мама средним
// планом в том же светлом кабинете держит развёрнутую ленту перед собой
// за верхние углы и с лёгкой улыбкой смотрит на неё (на бумаге — та же
// печать панели 1). Она молчит: рот закрыт.
// Слои: персонаж целиком → лента (закрывает предплечья, как настоящий
// лист перед грудью) → кончики пальцев на лицевой стороне у верхних углов.
import { box, Shot, span } from "../kit";
import { P1Art } from "../panels/P1";
import { RIB } from "../ribbon";
import { Actor, type PoseIn } from "../rig/Actor";
import { OfficeBack, OfficeFront } from "../sets/Office";
import { C, F } from "../theme";

const MOM = { x: 575, y: 1500, h: 1000 } as const;
// лента в руках (мир): панель 1 и край ещё сложенных листов под ней
const PW = 240;
const PS = PW / RIB.w;
const PH = RIB.h * PS;
const TOP = MOM.y - 742;
const SKIN = "#E6B590";
const SKIN_SHADE = "#C99470";

// Кончики пальцев на лицевой стороне листа у верхнего угла.
const Tips: React.FC<{ readonly x: number; readonly y: number; readonly side: -1 | 1 }> = ({ x, y, side }) => (
  <g transform={`translate(${x} ${y}) scale(${side} 1)`}>
    {[0, 1].map((i) => (
      <rect key={i} x={2 + i * 13} y={-6 + i * 3} width={12} height={22 - i * 3} rx={6} fill={SKIN} stroke={SKIN_SHADE} strokeWidth={1.5} transform={`rotate(${-8 + i * 6} ${8 + i * 13} 0)`} />
    ))}
  </g>
);

export const MomWithRibbon: React.FC<{ readonly f: number; readonly opacity: number; readonly t: number }> = ({ f, opacity, t }) => {
  if (opacity <= 0.001) return null;
  const cam = { x: 572, y: 788 - 6 * span(t, 0, 40), zoom: 1.78 + 0.07 * span(t, 0, 40) };
  const sway = Math.sin(f / 23) * 1.2;
  const x0 = MOM.x - PW / 2;
  const pose = (): PoseIn => ({
    expr: "softSmile",
    lookY: 0.66,
    lookX: -0.04,
    nod: 7,
    headTilt: -4 + Math.sin(f / 31) * 1.2,
    armL: { target: { x: x0 + 4, y: TOP + 40 + sway }, shape: "pinch", elbow: "hang" },
    armR: { target: { x: x0 + PW - 4, y: TOP + 40 - sway }, shape: "pinch", elbow: "hang" },
  });
  return (
    <div style={box({ inset: 0, opacity })}>
      <Shot f={f} cam={cam} bg="#F8F2E7">
        <OfficeBack f={f} />
        <Actor uid="apa-insert" look="apa" f={f} seed={3} place={() => MOM} pose={pose} />
        <div style={box({ left: x0, top: TOP, width: PW, height: PH + 26, transform: `rotate(${sway * 0.35}deg)`, transformOrigin: "50% 0%" })}>
          {/* край ещё сложенных листов */}
          <div style={box({ left: 4, right: 4, top: PH - 2, height: 9, borderRadius: "0 0 4px 4px", backgroundColor: C.paperShade, boxShadow: "0 3px 5px rgba(20,40,90,0.14)" })} />
          <div style={box({ left: 2, right: 2, top: PH - 4, height: 7, borderRadius: "0 0 4px 4px", backgroundColor: C.paperWarm })} />
          {/* панель 1 с той же печатью */}
          <div style={box({ left: 0, top: 0, width: RIB.w, height: RIB.h, transformOrigin: "0 0", transform: `scale(${PS})`, backgroundColor: C.paper, boxShadow: "0 22px 44px rgba(20,40,90,0.2)", overflow: "hidden", borderRadius: 6 })}>
            <P1Art t={9999} show={{ path: -1 }} />
            <div style={box({ right: 22, top: 20, padding: "6px 16px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontWeight: 900, fontSize: 30, lineHeight: 1.1, fontFamily: F.text })}>1/6</div>
          </div>
          <svg width={PW} height={PH} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <Tips x={2} y={10} side={1} />
            <Tips x={PW - 2} y={10} side={-1} />
          </svg>
        </div>
        <OfficeFront />
      </Shot>
    </div>
  );
};

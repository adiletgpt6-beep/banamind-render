// S13 · Бейдж мамы.
//
// 13A — крупно: детские ладони держат карточку за края, шнурок свисает за
//       ней. Сын переворачивает карточку оборотом к себе — к камере лицевой
//       стороной: «Айжан» и жёлтая плашка «Спикер». На «аты» под именем
//       прорисовывается тонкая линия, на «Спикер» — мягкое кольцо.
// 13B — лицо сына крупно: он смотрит на карточку, потом поднимает взгляд
//       на маму (за кадром) — тихое уважение, лёгкая улыбка.
import { useScene, usePlan, Shot, Svg, useInk, Ring, DrawArrow, Grain } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { BADGE_RATIO, BadgeCard } from "../props/Badge";
import { LanyardDrape } from "../props/Things";
import { CloseHand, SKIN } from "../props/CloseHand";
import type { Sd2SfxPlan } from "../sfx";

export const badgePlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "badge");
  return {
    len: T.len,
    flip: 2,
    name: T.word("N13", "аты"),
    role: T.word("N13", "спикер"),
    face: Math.min(T.word("N13", "жазылган") - 4, T.len - 50),
  };
};
type Plan = ReturnType<typeof badgePlan>;

const CW = 440; // ширина карточки крупно
const CX = 540;
const CY = 880;

const CardClose: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const ch = CW * BADGE_RATIO;
  // переворот: ширина по cos, на середине — смена стороны
  const u = easeInOut((f - p.flip) / 14);
  const sx = Math.abs(Math.cos(u * Math.PI));
  const front = u >= 0.5;
  const sway = Math.sin(f / 9) * 6 * (1 - clamp((f - 20) / 30));
  const top = CY - ch / 2;
  const bottom = CY + ch / 2;
  const hole = { x: CX, y: top + ch * 0.085 };
  const nameY = top + ch * 0.66 + 16;
  const roleC = { x: CX, y: top + ch * 0.81 };
  return (
    <>
      <div style={{ position: "absolute", left: -200, top: -200, width: 1480, height: 2400, backgroundColor: "#EFE4CF", overflow: "hidden" }}>
        <Grain opacity={0.5} w={1480} h={2400} />
      </div>
      <Svg>
        {/* размытые очертания прихожей */}
        <circle cx={160} cy={360} r={170} fill="#E6D3B2" opacity={0.7} />
        <circle cx={950} cy={1580} r={260} fill="#E3CDA4" opacity={0.6} />
        <rect x={-100} y={1500} width={1300} height={600} fill="#E1CBA3" opacity={0.5} />
        <LanyardDrape hole={hole} top={top} bottom={bottom} cx={CX} loop={150} sway={sway} width={22} ink={ink} part="back" />
        <g transform={`translate(${CX} 0) scale(${Math.max(0.02, sx)} 1) translate(${-CX} 0)`}>
          {front ? (
            <BadgeCard cx={CX} cy={CY} w={CW} ink={ink} />
          ) : (
            <g>
              <path d={`M ${CX - CW / 2} ${top} h ${CW} v ${ch} h ${-CW} Z`} fill={C.badge} stroke={C.ink} strokeWidth={ink} />
              <rect x={CX - CW / 2 + ink} y={top + ink} width={CW - ink * 2} height={ch * 0.2} fill={C.lanyard} />
            </g>
          )}
        </g>
        <LanyardDrape hole={hole} top={top} bottom={bottom} cx={CX} loop={150} sway={sway} width={22} ink={ink} part="front" />
        {/* подчёркивание имени и кольцо вокруг «Спикер» */}
        {f >= p.name ? <DrawArrow pts={[[CX - CW * 0.3, nameY], [CX + CW * 0.3, nameY]]} t={f - p.name} dur={12} color={C.yellowDeep} width={ink * 1.4} head={false} /> : null}
        {f >= p.role ? <Ring x={roleC.x} y={roleC.y} r={CW * 0.42} t={f - p.role} color={C.yellow} width={ink * 1.4} dur={14} /> : null}
        {/* детские ладони держат карточку за края */}
        <CloseHand x={CX - CW / 2 - 4} y={CY - 96} angle={-146} size={170} look={SKIN.sonHome} shape="grip" armLen={5} ink={ink} mirror />
        <CloseHand x={CX + CW / 2 + 4} y={CY - 96} angle={146} size={170} look={SKIN.sonHome} shape="grip" armLen={5} ink={ink} />
      </Svg>
    </>
  );
};

const Face: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t0 = p.face;
  const up = easeInOut((f - t0 - 18) / 12);
  const pose = (t: number): PoseIn => {
    const u = easeInOut((t - t0 - 18) / 12);
    return {
      expr: mixExpr(EXPR.calm, { browIn: 3, browOut: 2, lid: 0.04, smile: 0.55 }, u),
      lookY: 0.55 - 0.62 * u,
      nod: 6 * (1 - u),
      headTilt: 3 * u,
      armL: { target: { x: 390, y: 1720 }, shape: "fist", elbow: "hang" },
      armR: { target: { x: 690, y: 1720 }, shape: "fist", elbow: "hang" },
    };
  };
  const cam = { x: 540, y: 980 - up * 10, zoom: 1 + (f - t0) * 0.0008 };
  const son = (layer: "body" | "arms") => (
    <Actor uid="s13-son" look="sonHome" f={f} place={() => ({ x: 540, y: 3460, h: 3200 })} face={(t) => keys(t, [[t0, 0.05], [t0 + 30, 0.3]])} pose={pose} seed={3} inkPx={5} layer={layer} />
  );
  return (
    <Shot f={f} cam={cam} bg="#EFE4CF">
      <div style={{ position: "absolute", left: -200, top: -200, width: 1480, height: 2400, backgroundColor: "#EFE4CF", overflow: "hidden" }}>
        <Grain opacity={0.5} w={1480} h={2400} />
      </div>
      <Svg>
        <rect x={60} y={300} width={300} height={22} rx={6} fill="#D9B98E" opacity={0.6} />
        <circle cx={900} cy={420} r={150} fill="#E6D3B2" opacity={0.6} />
      </Svg>
      {son("body")}
      <Svg>
        {/* бейдж в руках оборотом к камере (лицевая сторона — к сыну) */}
        <rect x={380} y={1640} width={320} height={420} rx={18} fill={C.badge} stroke={C.ink} strokeWidth={5} />
        <rect x={384} y={1644} width={312} height={80} rx={14} fill={C.lanyard} />
      </Svg>
      {son("arms")}
    </Shot>
  );
};

export const S13Badge: React.FC = () => {
  const { f } = useScene("badge");
  const p = usePlan(badgePlan);
  if (f >= p.face) return <Face f={f} p={p} />;
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 + f * 0.0006 }}>
      <CardClose f={f} p={p} />
    </Shot>
  );
};

// Звук: тихий шорох карточки при перевороте.
export const sfxS13Badge: Sd2SfxPlan = (tl) => {
  const p = badgePlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.flip + 4, kind: "paper", volume: 0.1 },
  ];
};

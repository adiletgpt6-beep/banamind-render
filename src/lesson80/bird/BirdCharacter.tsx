// Самка обыкновенного чёрного дрозда (Turdus merula) в 2D: коричневое
// оперение, светлее и пестрее на груди и горле, неяркий желтовато-бурый клюв,
// тёмный глаз со светлым ободком. Рисуется в своей системе: центр корпуса в
// (0, 0), смотрит вправо; facing = −1 зеркалит. Части: хвост, дальнее крыло,
// лапы, корпус, ближнее крыло, шея и голова (клюв из двух частей, глаз),
// травинка в клюве. Все соединения — общие точки вращения, крыло из двух
// сегментов (плечо и кисть с маховыми перьями).
import type { BirdPose, Wing } from "./birdPose";
import { clamp, lerp } from "../rig/motion";

const C = {
  back: "#4A3A2E",
  backLight: "#5C4A3B",
  wing: "#3E3128",
  wingEdge: "#6A5543",
  breast: "#8C6E52",
  breastLight: "#A58868",
  streak: "#6B5038",
  throat: "#B39A7B",
  beak: "#9A8650",
  beakDark: "#7A6838",
  eye: "#1A1410",
  eyeRing: "#C9B797",
  leg: "#6E5A40",
  outline: "#2A2018",
  grass: "#CDB474",
  grassDark: "#A48E57",
};

// Травинка: лёгкая дуга длиной ≈ 170 единиц, держится ближе к середине.
export const GrassBlade: React.FC<{ readonly x: number; readonly y: number; readonly angle: number; readonly len?: number; readonly hold?: number; readonly bend?: number }> = ({ x, y, angle, len = 170, hold = 0.42, bend = 22 }) => {
  const a = -len * hold;
  const b = len * (1 - hold);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M ${a} 0 Q ${(a + b) / 2} ${-bend} ${b} 0`} stroke={C.grass} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M ${a} 0 Q ${(a + b) / 2} ${-bend} ${b} 0`} stroke={C.grassDark} strokeWidth={1.6} fill="none" strokeLinecap="round" transform="translate(0 1.6)" />
    </g>
  );
};

// Крыло: плечо (от лопатки до локтя) и кисть (до кончика) с веером маховых
// перьев по задней кромке. Сложенное крыло лежит вдоль корпуса каплей;
// раскрытое — поднимается и опускается взмахом (flap), кисть отстаёт от
// плеча. Между состояниями — поточечная интерполяция одного контура.
const WingEl: React.FC<{ readonly w: Wing; readonly near: boolean; readonly bodyRx: number }> = ({ w, near, bodyRx }) => {
  const s = clamp(w.spread);
  const rad = (d: number) => (d * Math.PI) / 180;
  const S = { x: 8, y: -26 };
  // ---- раскрытое крыло ----
  const a1 = -16 + 56 * w.flap; // плечо: −72° (вверх) … 40° (вниз)
  const a2 = a1 - 26 * w.flap; // кисть отстаёт
  const L1 = 112;
  const L2 = 136;
  const E = { x: S.x + Math.cos(rad(a1)) * L1, y: S.y + Math.sin(rad(a1)) * L1 };
  const T = { x: E.x + Math.cos(rad(a2)) * L2, y: E.y + Math.sin(rad(a2)) * L2 };
  const normal = (a: number) => {
    let nx = -Math.sin(rad(a));
    let ny = Math.cos(rad(a));
    if (nx > 0.05) {
      nx = -nx;
      ny = -ny;
    }
    return { nx, ny };
  };
  const n1 = normal(a1);
  const n2 = normal(a2);
  // задняя кромка: от кончика к локтю (маховые), затем к корпусу (второстепенные)
  const open: { x: number; y: number }[] = [S, E, T];
  const primaries = [0.12, 0.3, 0.5, 0.72, 0.92];
  for (const k of primaries) {
    const px = lerp(T.x, E.x, k);
    const py = lerp(T.y, E.y, k);
    const chord = 64 * Math.sin(Math.PI * (0.25 + 0.75 * k)) + 18 * k;
    open.push({ x: px + n2.nx * chord, y: py + n2.ny * chord });
  }
  for (const k of [0.25, 0.55, 0.85]) {
    const px = lerp(E.x, S.x, k);
    const py = lerp(E.y, S.y, k);
    const chord = 70 - 24 * k;
    open.push({ x: px + n1.nx * chord, y: py + n1.ny * chord });
  }
  // ---- сложенное крыло: капля вдоль корпуса от плеча к хвосту ----
  const tailEnd = { x: -bodyRx * 0.98, y: 4 };
  const folded: { x: number; y: number }[] = [];
  const nF = open.length;
  for (let i = 0; i < nF; i++) {
    const k = i / (nF - 1);
    // по верхнему краю к концу и обратно по нижнему
    const along = k < 0.5 ? k * 2 : (1 - k) * 2;
    const side = k < 0.5 ? -1 : 1;
    const x = lerp(S.x + 10, tailEnd.x, along);
    const y = lerp(S.y - 4, tailEnd.y, along) + side * 17 * Math.sin(Math.PI * along) + 8 * along;
    folded.push({ x, y });
  }
  const pts = open.map((o, i) => ({ x: lerp(folded[i].x, o.x, s), y: lerp(folded[i].y, o.y, s) }));
  const d = `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
  const fill = near ? C.wing : "#352A22";
  return (
    <g opacity={near ? 1 : 0.92}>
      <path d={d} fill={fill} stroke={C.outline} strokeWidth={2} strokeLinejoin="round" />
      {/* кроющие перья: светлая полоса вдоль передней кромки */}
      <path d={`M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`} stroke={C.wingEdge} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55 + 0.3 * s} />
      {/* маховые перья: линии от кисти к задней кромке */}
      {s > 0.25
        ? primaries.map((k, i) => (
            <line key={i} x1={lerp(T.x, E.x, k)} y1={lerp(T.y, E.y, k)} x2={pts[3 + i].x} y2={pts[3 + i].y} stroke="#2A211B" strokeWidth={1.4} opacity={0.55 * ((s - 0.25) / 0.75)} />
          ))
        : null}
      {s < 0.6 ? (
        <path d={`M ${lerp(S.x, tailEnd.x, 0.25)} ${lerp(S.y, tailEnd.y, 0.25) + 6} L ${lerp(S.x, tailEnd.x, 0.9)} ${lerp(S.y, tailEnd.y, 0.9) + 8} M ${lerp(S.x, tailEnd.x, 0.35)} ${lerp(S.y, tailEnd.y, 0.35) + 14} L ${lerp(S.x, tailEnd.x, 0.85)} ${lerp(S.y, tailEnd.y, 0.85) + 14}`} stroke="#2A211B" strokeWidth={1.3} opacity={0.45 * (1 - s / 0.6)} fill="none" />
      ) : null}
    </g>
  );
};

export const BirdCharacter: React.FC<{ readonly pose: BirdPose; readonly scale?: number; readonly uid?: string }> = ({ pose, scale = 1, uid = "bird" }) => {
  if (!pose.visible) return null;
  const rx = 78;
  const ry = 50;
  const rad = (d: number) => (d * Math.PI) / 180;
  // голова на шее: основание шеи у переднего верха корпуса
  const neckBase = { x: 56, y: -30 };
  const neckLen = 26 + 30 * pose.neck;
  const neckAng = -62 + pose.headPitch * 0.9; // вверх-вперёд, с наклоном
  const headC = { x: neckBase.x + Math.cos(rad(neckAng)) * neckLen, y: neckBase.y + Math.sin(rad(neckAng)) * neckLen };
  const hr = 33;
  const yaw = pose.headYaw; // смещение черт к зрителю
  const hp = pose.headPitch;
  // клюв: от передней точки головы, две половины
  const beakRoot = { x: headC.x + hr * 0.78 * (1 - 0.2 * Math.abs(yaw)), y: headC.y + hr * 0.08 };
  const beakLen = 40 * (1 - 0.35 * Math.abs(yaw));
  const beakAng = hp * 0.8 + 6;
  const bx = (d: number, up: number) => ({ x: beakRoot.x + Math.cos(rad(beakAng + up)) * d, y: beakRoot.y + Math.sin(rad(beakAng + up)) * d });
  const tipU = bx(beakLen, -pose.beakOpen * 9);
  const tipL = bx(beakLen * 0.96, pose.beakOpen * 11);
  const eye = { x: headC.x + hr * 0.3 + yaw * hr * 0.25, y: headC.y - hr * 0.22 + hp * 0.1 };
  // лапы: от низа корпуса к опоре
  const legs = pose.legs;
  const hip = { x: 14, y: ry - 12 };
  const perchDy = pose.perchY === null ? 0 : pose.perchY - pose.y; // в локальных (без наклона корпуса)
  const footY = lerp(hip.y + 22, Math.max(hip.y + 30, perchDy), legs);
  const legEl = (side: number) => {
    const fx = hip.x + side * 14 + 6;
    const kx = hip.x + side * 10 + lerp(-18, 4, legs);
    const ky = hip.y + lerp(8, (footY - hip.y) * 0.55, legs);
    const grip = pose.grip;
    const toe = (ang: number, len: number, k: string) => (
      <path key={k} d={`M ${fx} ${footY} q ${Math.cos(rad(ang)) * len * 0.6} ${Math.sin(rad(ang)) * len * 0.3 * (1 - grip) + len * 0.35 * grip} ${Math.cos(rad(ang)) * len} ${Math.sin(rad(ang)) * len * 0.45 + len * 0.9 * grip}`} stroke={C.leg} strokeWidth={3.2} fill="none" strokeLinecap="round" />
    );
    return (
      <g key={`leg${side}`} opacity={side < 0 ? 0.85 : 1} transform={side < 0 ? "translate(-10 0)" : undefined}>
        <path d={`M ${hip.x} ${hip.y} Q ${kx} ${ky} ${fx} ${footY}`} stroke={C.leg} strokeWidth={5} fill="none" strokeLinecap="round" />
        {legs > 0.35 ? (
          <g opacity={(legs - 0.35) / 0.65}>
            {toe(-14, 20, "t1")}
            {toe(8, 22, "t2")}
            {toe(30, 18, "t3")}
            {toe(190, 14, "t4")}
          </g>
        ) : null}
      </g>
    );
  };
  // хвост
  const tailRoot = { x: -rx + 14, y: -6 };
  const tailLen = 118;
  const tAng = 180 + pose.tailPitch;
  const tx = tailRoot.x + Math.cos(rad(tAng)) * tailLen;
  const ty = tailRoot.y + Math.sin(rad(tAng)) * tailLen;
  const fan = 14 + 22 * pose.tailFan;
  const tail = `M ${tailRoot.x} ${tailRoot.y - 12} L ${tx + Math.sin(rad(tAng)) * fan} ${ty - Math.cos(rad(tAng)) * fan} Q ${tx - 6} ${ty} ${tx - Math.sin(rad(tAng)) * fan} ${ty + Math.cos(rad(tAng)) * fan} L ${tailRoot.x} ${tailRoot.y + 16} Z`;
  const flip = pose.facing < 0 ? -1 : 1;
  const grassAng = beakAng * 0.6 + pose.grassSway - 8;
  return (
    <g transform={`translate(${pose.x} ${pose.y}) scale(${flip * scale} ${scale}) rotate(${pose.bodyPitch})`}>
      {/* хвост */}
      <path d={tail} fill={C.back} stroke={C.outline} strokeWidth={2} strokeLinejoin="round" />
      <line x1={tailRoot.x} y1={tailRoot.y + 2} x2={tx} y2={ty} stroke="#2E241D" strokeWidth={1.3} opacity={0.5} />
      {/* дальнее крыло и дальняя лапа */}
      <WingEl w={pose.wingFar} near={false} bodyRx={rx} />
      {legEl(-1)}
      {/* корпус */}
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={C.back} stroke={C.outline} strokeWidth={2} />
      <clipPath id={`${uid}-body`}>
        <ellipse cx={0} cy={0} rx={rx - 1} ry={ry - 1} />
      </clipPath>
      <g clipPath={`url(#${uid}-body)`}>
        {/* грудь и брюшко светлее, с пестринами */}
        <ellipse cx={22} cy={16} rx={62} ry={38} fill={C.breast} />
        <ellipse cx={34} cy={22} rx={44} ry={26} fill={C.breastLight} opacity={0.7} />
        {[-6, 10, 26, 42, 56].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={8 + (i % 2) * 10} rx={4} ry={7} fill={C.streak} opacity={0.6} />
            <ellipse cx={x + 8} cy={24 + (i % 2) * 6} rx={3.5} ry={6} fill={C.streak} opacity={0.5} />
          </g>
        ))}
        {/* блик света на спине */}
        <ellipse cx={-14} cy={-30} rx={56} ry={16} fill={C.backLight} opacity={0.55} />
      </g>
      {/* ближняя лапа */}
      {legEl(1)}
      {/* ближнее крыло */}
      <WingEl w={pose.wingNear} near bodyRx={rx} />
      {/* шея */}
      <path d={`M ${neckBase.x - 18} ${neckBase.y + 14} Q ${(neckBase.x + headC.x) / 2 - 10} ${(neckBase.y + headC.y) / 2} ${headC.x - hr * 0.6} ${headC.y + hr * 0.75} L ${headC.x + hr * 0.4} ${headC.y + hr * 0.9} Q ${(neckBase.x + headC.x) / 2 + 26} ${(neckBase.y + headC.y) / 2 + 24} ${neckBase.x + 26} ${neckBase.y + 24} Z`} fill={C.breast} stroke={C.outline} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M ${neckBase.x - 18} ${neckBase.y + 14} Q ${(neckBase.x + headC.x) / 2 - 10} ${(neckBase.y + headC.y) / 2} ${headC.x - hr * 0.6} ${headC.y + hr * 0.75}`} stroke={C.back} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* голова */}
      <g transform={`rotate(${hp * 0.5} ${headC.x} ${headC.y})`}>
        <ellipse cx={headC.x} cy={headC.y} rx={hr * (1 + 0.08 * Math.abs(yaw))} ry={hr * 0.92} fill={C.back} stroke={C.outline} strokeWidth={2} />
        <ellipse cx={headC.x + hr * 0.25} cy={headC.y + hr * 0.45} rx={hr * 0.62} ry={hr * 0.42} fill={C.throat} opacity={0.85} />
        <ellipse cx={headC.x + hr * 0.3} cy={headC.y + hr * 0.6} rx={hr * 0.3} ry={hr * 0.12} fill={C.streak} opacity={0.35} />
        {/* клюв: нижняя и верхняя половины */}
        <path d={`M ${beakRoot.x - 4} ${beakRoot.y + 2} L ${tipL.x} ${tipL.y} L ${beakRoot.x + 2} ${beakRoot.y + 12} Z`} fill={C.beakDark} stroke={C.outline} strokeWidth={1.5} strokeLinejoin="round" />
        <path d={`M ${beakRoot.x - 6} ${beakRoot.y - 10} Q ${beakRoot.x + beakLen * 0.5} ${beakRoot.y - 9 + beakAng * 0.3} ${tipU.x} ${tipU.y} L ${beakRoot.x - 2} ${beakRoot.y + 3} Z`} fill={C.beak} stroke={C.outline} strokeWidth={1.5} strokeLinejoin="round" />
        {/* глаз со светлым ободком */}
        <circle cx={eye.x} cy={eye.y} r={hr * 0.2} fill={C.eyeRing} opacity={0.75} />
        <circle cx={eye.x} cy={eye.y} r={hr * 0.15} fill={C.eye} />
        <circle cx={eye.x + 1.5} cy={eye.y - 1.5} r={hr * 0.05} fill="#FFFFFF" opacity={0.9} />
        {yaw < -0.3 ? <circle cx={eye.x - hr * 0.9} cy={eye.y + 2} r={hr * 0.13} fill={C.eye} opacity={(-yaw - 0.3) / 0.7} /> : null}
        {/* травинка в клюве: зажата у кончика, движется вместе с головой */}
        {pose.grass ? <GrassBlade x={(tipU.x + tipL.x) / 2 - 4} y={(tipU.y + tipL.y) / 2 + 1} angle={grassAng} /> : null}
      </g>
    </g>
  );
};

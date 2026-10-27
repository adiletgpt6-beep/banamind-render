// Универсальный «скелет» персонажа: таз → корпус (наклон lean, разворот
// yaw 0 — профиль вправо … 90 — анфас) → шея → голова; руки и ноги —
// двухзвенная ИК к целям кистей/стоп. Одежда — плоские заливки с одной
// тенью и тонким тёмно-синим контуром. Ноль координат — точка опоры
// (стопы на земле или точка сиденья — её задаёт поза).
import { Head, type Expr, type HeadLook } from "./head";
import { MiniHand, type HandShape } from "./hands";
import { INK, Limb, add, angleOf, ik2, mix, mixPt, pt, rot, smoothPath, sub, type Pt } from "./core";

export const BELT = "#4A5266";
export const BELT_HI = "#C3CBD8";
export const SEAT = "#D3DCE9";
export const SEAT_SHADE = "#B4C0D3";

export type Build = {
  readonly head: HeadLook;
  readonly neck: number;
  readonly neckW: number;
  readonly torso: number; // таз → плечи
  readonly sh: number; // полуширина плеч анфас
  readonly depth: number; // полутолщина корпуса в профиль
  readonly upper: number;
  readonly fore: number;
  readonly armW: readonly [number, number];
  readonly thigh: number;
  readonly shin: number;
  readonly legW: readonly [number, number];
  readonly ankle: number; // высота голеностопа над подошвой
  readonly foot: number; // длина стопы
  readonly hand: number; // масштаб кисти
};

export type Outfit = {
  readonly top: string;
  readonly topShade: string;
  readonly sleeve: string;
  readonly sleeveShade: string;
  readonly cuff?: string;
  readonly pants: string;
  readonly pantsShade: string;
  readonly shoe: string;
  readonly shoeShade: string;
  readonly hem: number; // низ верхней одежды ниже таза
  readonly vest?: { readonly color: string; readonly shade: string };
  readonly collar?: string;
  readonly pack?: { readonly color: string; readonly shade: string };
  readonly neckline?: "round" | "collar";
};

export type ArmSpec = {
  readonly to: Pt; // цель запястья (абсолютно в системе фигуры) или от плеча (rel)
  readonly rel?: boolean;
  readonly bend?: 1 | -1;
  readonly hand: HandShape;
  readonly handDir?: number; // поворот кисти относительно предплечья
  readonly absDir?: number; // абсолютное направление кисти (градусы), если задано
  readonly thumb?: 1 | -1;
  readonly front?: boolean; // дальняя рука: предплечье и кисть перед корпусом
};
export type LegSpec = { readonly to: Pt; readonly footRot?: number; readonly bend?: 1 | -1 };

export type Pose = {
  readonly hip: Pt;
  readonly lean: number;
  readonly yaw: number;
  readonly headTilt: number;
  readonly headTurn?: number;
  readonly gaze: Pt;
  readonly armN: ArmSpec;
  readonly armF: ArmSpec;
  readonly legN: LegSpec;
  readonly legF: LegSpec;
  readonly seated?: boolean;
  readonly breathe?: number; // −1…1
  readonly phone?: { readonly at: Pt; readonly angle: number; readonly size: number };
  readonly book?: { readonly at: Pt; readonly w: number };
  readonly belt?: boolean;
  readonly carSeat?: boolean;
  readonly noPack?: boolean;
  readonly sway?: number;
};

export type Layer = "all" | "back" | "front";

// Опорные точки скелета для позы (нужны позам, чтобы ставить цели от плеч).
export const skeleton = (b: Build, pose: Pick<Pose, "hip" | "lean" | "yaw" | "breathe">) => {
  const u = Math.max(0, Math.min(1, pose.yaw / 90));
  const T = b.torso;
  const br = (pose.breathe ?? 0) * 1.6;
  const H = pose.hip;
  const tor = (p: Pt) => add(H, rot(p, pose.lean));
  const shN = tor(mixPt(pt(-b.depth * 0.18, -T * 0.86 - br), pt(-b.sh * 0.74, -T * 0.88 - br), u));
  const shF = tor(mixPt(pt(b.depth * 0.12, -T * 0.88 - br), pt(b.sh * 0.74, -T * 0.88 - br), u));
  const neckBase = tor(pt(mix(b.depth * 0.08, 0, u), -T - 2 - br));
  const hipN = add(H, rot(mixPt(pt(-b.depth * 0.2, -4), pt(-b.sh * 0.42, -4), u), pose.lean * 0.3));
  const hipF = add(H, rot(mixPt(pt(b.depth * 0.15, -6), pt(b.sh * 0.42, -6), u), pose.lean * 0.3));
  return { u, shN, shF, neckBase, hipN, hipF, tor };
};

// Контур корпуса (12 точек) — смесь профиля и анфаса.
const torsoPts = (b: Build, u: number, hem: number, seated: boolean, neckDrop = 0): Pt[] => {
  const T = b.torso;
  const D = b.depth;
  const S = b.sh;
  const prof: Pt[] = [
    pt(-0.36 * D, -T - 2 + neckDrop),
    pt(-0.95 * D, -0.92 * T),
    pt(-1.02 * D, -0.66 * T),
    pt(-0.82 * D, -0.3 * T),
    pt(-1.0 * D, -0.02 * T),
    pt(-1.04 * D, hem),
    pt((seated ? 1.9 : 1.1) * D, seated ? hem * 0.45 : hem),
    pt(1.02 * D, -0.04 * T),
    pt(0.84 * D, -0.33 * T),
    pt(1.06 * D, -0.6 * T),
    pt(0.86 * D, -0.88 * T),
    pt(0.4 * D, -T - 2 + neckDrop * 0.6),
  ];
  const front: Pt[] = [
    pt(-0.3 * S, -T - 2 + neckDrop),
    pt(-1.0 * S, -0.92 * T),
    pt(-0.93 * S, -0.64 * T),
    pt(-0.76 * S, -0.3 * T),
    pt(-0.9 * S, -0.02 * T),
    pt(-0.95 * S, hem),
    pt(0.95 * S, hem),
    pt(0.9 * S, -0.02 * T),
    pt(0.76 * S, -0.3 * T),
    pt(0.93 * S, -0.64 * T),
    pt(1.0 * S, -0.92 * T),
    pt(0.3 * S, -T - 2 + neckDrop),
  ];
  return prof.map((p, i) => mixPt(p, front[i], u));
};

// Обувь: голеностоп в (0,0), подошва на y = a.
const shoePath = (F: number, a: number) =>
  `M ${-0.22 * F} ${-0.3 * a} C ${-0.34 * F} ${0.3 * a} ${-0.34 * F} ${a} ${-0.16 * F} ${a} L ${0.6 * F} ${a} C ${0.84 * F} ${a} ${0.86 * F} ${0.2 * a} ${0.6 * F} ${-0.05 * a} C ${0.42 * F} ${-0.25 * a} ${0.22 * F} ${-0.55 * a} ${0.08 * F} ${-0.6 * a} L ${-0.16 * F} ${-0.62 * a} Z`;

export type FigureProps = {
  readonly build: Build;
  readonly outfit: Outfit;
  readonly pose: Pose;
  readonly expr: Expr;
  readonly mouth: number;
  readonly blink: number;
  readonly layer?: Layer;
};

export const Figure: React.FC<FigureProps> = ({ build: b, outfit: o, pose, expr, mouth, blink, layer = "all" }) => {
  const sk = skeleton(b, pose);
  const { u, shN, shF, neckBase, hipN, hipF } = sk;
  const T = b.torso;

  // руки
  const armTarget = (sh: Pt, a: ArmSpec) => (a.rel ? add(sh, a.to) : a.to);
  const arm = (sh: Pt, a: ArmSpec) => {
    const { j, e } = ik2(sh, armTarget(sh, a), b.upper, b.fore, a.bend ?? 1);
    return { s: sh, j, e, dir: a.absDir ?? angleOf(j, e) + (a.handDir ?? 0) };
  };
  const aN = arm(shN, pose.armN);
  const aF = arm(shF, pose.armF);
  // ноги (колено вперёд)
  const leg = (hp: Pt, l: LegSpec) => {
    const ankle = sub(l.to, pt(0, b.ankle));
    const { j, e } = ik2(hp, ankle, b.thigh, b.shin, l.bend ?? -1);
    return { h: hp, j, e, rot: l.footRot ?? 0 };
  };
  const lN = leg(hipN, pose.legN);
  const lF = leg(hipF, pose.legF);

  const footK = 1 - 0.3 * u;
  const drawLeg = (l: ReturnType<typeof leg>, near: boolean, key: string) => (
    <g key={key}>
      <Limb pts={[l.h, l.j, l.e]} widths={b.legW} fill={near ? o.pants : o.pantsShade} />
      <g transform={`translate(${l.e.x} ${l.e.y}) rotate(${l.rot}) scale(${footK} 1)`}>
        <path d={shoePath(b.foot, b.ankle)} fill={near ? o.shoe : o.shoeShade} stroke={INK} strokeWidth={3 / footK} strokeLinejoin="round" />
        <path d={`M ${-0.12 * b.foot} ${b.ankle * 0.72} L ${0.66 * b.foot} ${b.ankle * 0.72}`} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    </g>
  );
  const handK = b.hand;
  const drawArm = (a: ReturnType<typeof arm>, spec: ArmSpec, near: boolean, part: "all" | "upper" | "lower", key: string) => {
    const col = near ? o.sleeve : o.sleeveShade;
    const pts = part === "upper" ? [a.s, a.j] : part === "lower" ? [a.j, a.e] : [a.s, a.j, a.e];
    const ws = part === "lower" ? [b.armW[1]] : b.armW;
    // манжета: короткая полоса у запястья
    const cuffA = mixPt(a.j, a.e, 0.86);
    return (
      <g key={key}>
        <Limb pts={pts} widths={ws} fill={col} />
        {part !== "upper" && o.cuff ? <line x1={cuffA.x} y1={cuffA.y} x2={a.e.x} y2={a.e.y} stroke={near ? o.cuff : o.sleeveShade} strokeWidth={b.armW[1] - 1} strokeLinecap="round" /> : null}
        {part !== "upper" ? <MiniHand w={a.e} dir={a.dir} k={handK} shape={spec.hand} thumb={spec.thumb ?? 1} skin={near ? b.head.skin : b.head.skin} shade={b.head.skinShade} /> : null}
      </g>
    );
  };

  // корпус
  const hem = o.hem;
  const tPts = torsoPts(b, u, hem, !!pose.seated).map(sk.tor);
  const torsoD = smoothPath(tPts, true, 0.9);
  const shadePts = [tPts[1], tPts[2], tPts[3], tPts[4], tPts[5], add(tPts[5], rot(pt(b.depth * 0.42, 0), pose.lean)), add(tPts[4], rot(pt(b.depth * 0.36, 0), pose.lean)), add(tPts[3], rot(pt(b.depth * 0.3, 0), pose.lean)), add(tPts[2], rot(pt(b.depth * 0.34, 0), pose.lean)), add(tPts[1], rot(pt(b.depth * 0.36, b.torso * 0.05), pose.lean))];
  const vestPts = o.vest ? torsoPts(b, u, hem - 2, !!pose.seated, T * 0.36).map(sk.tor) : null;

  // голова
  const headAng = pose.lean * 0.45 + pose.headTilt;
  const neckTop = add(neckBase, rot(pt(0, -b.neck), headAng));
  const turn = Math.max(-0.75, Math.min(0.75, mix(0.62, 0.04, u) + (pose.headTurn ?? 0)));
  const hc = add(neckTop, rot(pt(turn * b.head.rx * 0.12, -b.head.ry * 0.72), headAng));
  const headG = (part: "back" | "front") => (
    <g transform={`translate(${hc.x} ${hc.y}) rotate(${headAng})`}>
      <Head look={b.head} turn={turn} gaze={pose.gaze} expr={expr} mouth={mouth} blink={blink} sway={pose.sway ?? 0} part={part} />
    </g>
  );
  // шея: тень под подбородком
  const neck = (
    <g>
      <Limb pts={[neckBase, add(neckTop, rot(pt(0, -b.head.ry * 0.25), headAng))]} widths={[b.neckW]} fill={b.head.skin} />
      <line x1={neckTop.x} y1={neckTop.y} x2={neckTop.x + (neckBase.x - neckTop.x) * 0.3} y2={neckTop.y + (neckBase.y - neckTop.y) * 0.3} stroke={b.head.skinShade} strokeWidth={b.neckW * 0.9} strokeLinecap="round" />
    </g>
  );

  // таз (штаны) под верхней одеждой
  const pelvis = (
    <path
      d={smoothPath([add(hipN, pt(-b.legW[0] * 0.55, -T * 0.12)), add(hipF, pt(b.legW[0] * 0.55, -T * 0.12)), add(hipF, pt(b.legW[0] * 0.5, b.legW[0] * 0.35)), add(hipN, pt(-b.legW[0] * 0.5, b.legW[0] * 0.35))], true)}
      fill={o.pants}
      stroke={INK}
      strokeWidth={3}
    />
  );

  // рюкзак (за спиной) и лямка
  const showPack = o.pack && !pose.noPack && !pose.seated;
  const packC = sk.tor(mixPt(pt(-b.depth * 1.45, -T * 0.55), pt(-b.sh * 0.15, -T * 0.55), u));
  const pack = showPack ? (
    <g>
      <rect x={packC.x - b.depth * 0.9} y={packC.y - T * 0.42} width={b.depth * 1.6} height={T * 0.86} rx={b.depth * 0.5} fill={o.pack!.color} stroke={INK} strokeWidth={3} transform={`rotate(${pose.lean} ${packC.x} ${packC.y})`} />
      <rect x={packC.x - b.depth * 1.05} y={packC.y + T * 0.02} width={b.depth * 0.9} height={T * 0.32} rx={b.depth * 0.3} fill={o.pack!.shade} stroke={INK} strokeWidth={3} transform={`rotate(${pose.lean} ${packC.x} ${packC.y})`} />
    </g>
  ) : null;
  const strap = showPack ? (
    <path
      d={`M ${shN.x - 4} ${shN.y - b.armW[0] * 0.45} Q ${mix(shN.x, tPts[9].x, 0.5) + 6} ${sk.tor(pt(0, -T * 0.6)).y} ${mix(shN.x, tPts[8].x, 0.45)} ${sk.tor(pt(0, -T * 0.3)).y}`}
      stroke={o.pack!.shade}
      strokeWidth={b.depth * 0.32}
      fill="none"
      strokeLinecap="round"
    />
  ) : null;

  // ремень безопасности (3 точки): над ближним плечом → через грудь → замок у дальнего бедра; поясная часть
  const beltEls = pose.belt
    ? (() => {
        const anchor = add(shN, rot(pt(-b.depth * 0.75, -T * 0.32), pose.lean));
        const over = add(shN, rot(pt(b.depth * 0.08, -b.armW[0] * 0.42), pose.lean));
        const buckle = sk.tor(mixPt(pt(b.depth * 0.95, -T * 0.05), pt(b.sh * 0.55, -T * 0.05), u));
        const lap0 = sk.tor(mixPt(pt(-b.depth * 1.15, -T * 0.02), pt(-b.sh * 0.95, -T * 0.02), u));
        const bw = T * 0.115;
        const strapD = `M ${anchor.x} ${anchor.y} Q ${over.x - 2} ${over.y - 6} ${over.x + 3} ${over.y + 2} L ${buckle.x} ${buckle.y}`;
        const lapD = `M ${lap0.x} ${lap0.y} Q ${mix(lap0.x, buckle.x, 0.5)} ${mix(lap0.y, buckle.y, 0.5) + T * 0.06} ${buckle.x} ${buckle.y}`;
        const ang = angleOf(lap0, buckle);
        return (
          <g>
            <path d={lapD} stroke={INK} strokeWidth={bw + 6} fill="none" strokeLinecap="round" />
            <path d={lapD} stroke={BELT} strokeWidth={bw} fill="none" strokeLinecap="round" />
            <path d={lapD} stroke={BELT_HI} strokeWidth={1.8} fill="none" strokeDasharray="5 4" opacity={0.85} />
            <path d={strapD} stroke={INK} strokeWidth={bw + 6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={strapD} stroke={BELT} strokeWidth={bw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={strapD} stroke={BELT_HI} strokeWidth={1.8} fill="none" strokeDasharray="5 4" opacity={0.85} strokeLinejoin="round" />
            <g transform={`translate(${buckle.x} ${buckle.y}) rotate(${ang})`}>
              <rect x={-bw * 1.1} y={-bw * 0.85} width={bw * 2.4} height={bw * 1.7} rx={bw * 0.35} fill="#D5DCE6" stroke={INK} strokeWidth={3} />
              <rect x={bw * 0.25} y={-bw * 0.45} width={bw * 0.8} height={bw * 0.9} rx={bw * 0.2} fill="#E8735A" stroke={INK} strokeWidth={2} />
            </g>
          </g>
        );
      })()
    : null;

  // автомобильное кресло (для отдельной сцены): спинка, подголовник, подушка
  const seatEls = pose.carSeat
    ? (() => {
        const H = pose.hip;
        const back = add(H, pt(-b.depth * 1.35, 0));
        const top = add(back, rot(pt(0, -T * 1.05), -8));
        const hr = add(hc, pt(-b.head.rx * 1.05, b.head.ry * 0.05));
        return (
          <g>
            <line x1={hr.x + 6} y1={hr.y + b.head.ry * 0.5} x2={top.x + 6} y2={top.y + 4} stroke="#8F9BB2" strokeWidth={5} />
            <rect x={hr.x - b.head.rx * 0.45} y={hr.y - b.head.ry * 0.62} width={b.head.rx * 0.9} height={b.head.ry * 1.15} rx={b.head.rx * 0.32} fill={SEAT} stroke={INK} strokeWidth={3} />
            <path
              d={smoothPath([add(back, pt(-b.depth * 0.55, 8)), add(top, pt(-b.depth * 0.5, 0)), add(top, pt(b.depth * 0.4, -2)), add(back, pt(b.depth * 0.75, 6))], true, 0.6)}
              fill={SEAT}
              stroke={INK}
              strokeWidth={3}
            />
            <path d={smoothPath([add(back, pt(-b.depth * 0.2, -4)), add(top, pt(-b.depth * 0.1, 10)), add(top, pt(b.depth * 0.15, 10)), add(back, pt(b.depth * 0.3, -4))], true, 0.6)} fill={SEAT_SHADE} opacity={0.6} />
            <rect x={H.x - b.depth * 1.9} y={H.y + b.legW[0] * 0.3} width={b.thigh + b.depth * 2.2} height={b.legW[0] * 0.9} rx={b.legW[0] * 0.35} fill={SEAT} stroke={INK} strokeWidth={3} />
          </g>
        );
      })()
    : null;

  // телефон в руке (маленький, экраном к зрителю — условность)
  const phoneEl = pose.phone ? (
    <g transform={`translate(${pose.phone.at.x} ${pose.phone.at.y}) rotate(${pose.phone.angle}) scale(${pose.phone.size})`}>
      <rect x={-17} y={-31} width={34} height={62} rx={7} fill="#1E2A44" stroke={INK} strokeWidth={2.5} />
      <rect x={-14} y={-27} width={28} height={54} rx={4.5} fill="#F4F8FD" />
      <rect x={-14} y={-27} width={28} height={9} rx={3} fill="#FFC90E" />
      <rect x={-10} y={-13} width={20} height={4} rx={2} fill="#C9D4E4" />
      <rect x={-10} y={-5} width={20} height={4} rx={2} fill="#C9D4E4" />
      <rect x={-10} y={3} width={14} height={4} rx={2} fill="#C9D4E4" />
      <rect x={-10} y={13} width={20} height={7} rx={3.5} fill="#25D366" />
    </g>
  ) : null;

  // тетрадь на столе (поза «уроки»)
  const bk = pose.book;
  const bookEl = bk ? (
    <g transform={`translate(${bk.at.x} ${bk.at.y})`}>
      <path d={`M ${-bk.w * 0.5} 0 L ${bk.w * 0.5} 0 L ${bk.w * 0.42} ${-bk.w * 0.16} L ${-bk.w * 0.42} ${-bk.w * 0.16} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M 0 0 L 0 ${-bk.w * 0.16}`} stroke="#A9B6CC" strokeWidth={2} />
      <path d={`M ${-bk.w * 0.5} 0 L ${bk.w * 0.5} 0 L ${bk.w * 0.5} 5 L ${-bk.w * 0.5} 5 Z`} fill="#5B7FC7" stroke={INK} strokeWidth={2} />
      {[0.35, 0.65].map((k) => (
        <g key={k}>
          <line x1={-bk.w * 0.44 + k * 3} y1={-bk.w * 0.16 * k} x2={-bk.w * 0.06} y2={-bk.w * 0.16 * k} stroke="#9DB8EE" strokeWidth={1.6} />
          <line x1={bk.w * 0.06} y1={-bk.w * 0.16 * k} x2={bk.w * 0.44 - k * 3} y2={-bk.w * 0.16 * k} stroke="#9DB8EE" strokeWidth={1.6} />
        </g>
      ))}
    </g>
  ) : null;

  const back = (
    <g>
      {seatEls}
      {pack}
      {drawArm(aF, pose.armF, false, pose.armF.front ? "upper" : "all", "armF")}
      {drawLeg(lF, false, "legF")}
      {drawLeg(lN, true, "legN")}
      {pelvis}
      {neck}
      {headG("back")}
      <path d={torsoD} fill={o.top} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={smoothPath(shadePts, true, 0.8)} fill={o.topShade} opacity={0.85} />
      {vestPts ? (
        <>
          <path d={smoothPath(vestPts, true, 0.9)} fill={o.vest!.color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d={smoothPath([vestPts[1], vestPts[2], vestPts[3], vestPts[4], vestPts[5], add(vestPts[5], pt(b.depth * 0.38, 0)), add(vestPts[3], pt(b.depth * 0.28, 0)), add(vestPts[1], pt(b.depth * 0.32, T * 0.05))], true, 0.8)} fill={o.vest!.shade} opacity={0.75} />
          {[0.42, 0.62, 0.82].map((k) => {
            const c = sk.tor(pt(mix(b.depth * 0.62, 0, u), -T * (1 - k) + T * 0.0));
            return <circle key={k} cx={c.x} cy={c.y} r={b.torso * 0.022} fill="#FFFFFF" opacity={0.85} />;
          })}
        </>
      ) : null}
      {o.collar
        ? (() => {
            const nb = neckBase;
            const s = b.neckW * 0.62;
            const c = o.collar!;
            const dl = rot(pt(-s * 1.1, T * 0.1), pose.lean);
            const dr = rot(pt(s * 1.2, T * 0.12), pose.lean);
            return (
              <g>
                <path d={`M ${nb.x - s * 0.9} ${nb.y - 2} L ${nb.x + dl.x} ${nb.y + dl.y} L ${nb.x} ${nb.y + T * 0.06} Z`} fill={c} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
                <path d={`M ${nb.x + s * 0.9} ${nb.y - 2} L ${nb.x + dr.x} ${nb.y + dr.y} L ${nb.x + s * 0.1} ${nb.y + T * 0.06} Z`} fill={c} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
              </g>
            );
          })()
        : o.neckline === "round"
          ? (() => {
              const a = tPts[0];
              const c = tPts[11];
              return <path d={`M ${a.x} ${a.y + 1} Q ${(a.x + c.x) / 2} ${(a.y + c.y) / 2 + T * 0.07} ${c.x} ${c.y + 1}`} stroke={o.topShade} strokeWidth={4} fill="none" strokeLinecap="round" />;
            })()
          : null}
      {strap}
      {headG("front")}
      {bookEl}
      {beltEls}
      {pose.armF.front ? drawArm(aF, pose.armF, false, "lower", "armF2") : null}
      {phoneEl}
    </g>
  );
  const front = drawArm(aN, pose.armN, true, "all", "armN");
  if (layer === "back") return back;
  if (layer === "front") return front;
  return (
    <>
      {back}
      {front}
    </>
  );
};


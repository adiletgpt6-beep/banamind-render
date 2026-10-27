// Персонаж целиком по рассчитанной позе (единицы рисунка, ступни в y = 0).
// Части: ноги (бедро, голень, стопа) с коленом, корпус с одеждой, шея,
// голова, руки (плечо, предплечье, кисть) с предметами, рюкзак/сумка.
// Поворот корпуса сужает силуэт, дальняя рука уходит за корпус.
//
// Стиль (№31): у каждой части аккуратный контур — тёмный оттенок её же
// заливки, одна толщина `line` (Actor задаёт ≈ 2,9 px на экране). Руки и
// ноги — сужающиеся «капсулы» (плечо шире запястья, бедро шире щиколотки):
// сначала проход контура (заливка цветом линии + обводка 2·line), затем
// заливка — суставы сливаются в один силуэт без швов. Плечевой сустав
// совпадает с закруглением плеча корпуса: рука не отрывается ни в какой
// позе. Объём — мягкий свет слева сверху, тень на дальней стороне,
// контактная тень у стоп; без тяжёлых SVG-фильтров.
import { Head } from "./Head";
import { Hand } from "./Hand";
import { lightOf, lineOf, mixHex, scaleHex, type Look } from "./looks";
import { clamp, deg, lerp, smoothstep, type Vec } from "./motion";
import { REST, type ArmState, type Pose } from "./pose";

// Две кости (плечо–предплечье, бедро–голень) до цели. Сторона сгиба
// выбирается непрерывно: у границы выбора сустав проходит «к зрителю»
// (кость в проекции короче), а не перескакивает. Кисть/стопа всегда в цели.
export const twoBone = (root: Vec, target: Vec, l1: number, l2: number, pref: Vec, width = 0.14) => {
  let dx = target.x - root.x;
  let dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 1;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const ux = d > 1e-6 ? dx / d : 0;
  const uy = d > 1e-6 ? dy / d : 1;
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const bias = pref.x * uy - pref.y * ux;
  const bend = clamp(bias / width, -1, 1);
  const mid = {
    x: root.x + l1 * cosA * ux + bend * l1 * sinA * uy,
    y: root.y + l1 * cosA * uy - bend * l1 * sinA * ux,
  };
  return { mid, end: { x: root.x + ux * d, y: root.y + uy * d } };
};

const mixV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const poly = (pts: readonly Vec[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
const circleD = (c: Vec, r: number) => `M ${c.x - r} ${c.y} A ${r} ${r} 0 1 0 ${c.x + r} ${c.y} A ${r} ${r} 0 1 0 ${c.x - r} ${c.y} Z`;

// Сужающаяся капсула: окружность (a, ra) → окружность (b, rb) с общими
// касательными. Основа рук и ног.
export const capsule = (a: Vec, ra: number, b: Vec, rb: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d < Math.abs(ra - rb) + 0.05) return ra >= rb ? circleD(a, ra) : circleD(b, rb);
  const phi = Math.atan2(dy, dx);
  const al = Math.acos(clamp((ra - rb) / d, -1, 1));
  const P = (c: Vec, r: number, t: number) => `${c.x + r * Math.cos(t)} ${c.y + r * Math.sin(t)}`;
  return `M ${P(a, ra, phi + al)} L ${P(b, rb, phi + al)} A ${rb} ${rb} 0 ${al > Math.PI / 2 ? 1 : 0} 0 ${P(b, rb, phi - al)} L ${P(a, ra, phi - al)} A ${ra} ${ra} 0 ${al < Math.PI / 2 ? 1 : 0} 0 ${P(a, ra, phi + al)} Z`;
};

// Полилиния, сдвинутая к теневой стороне штриха (вправо/вниз: свет слева
// сверху) — полоса объёма вдоль рукава или штанины.
const shadeSide = (pts: readonly Vec[], off: number) =>
  poly(
    pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const c = pts[Math.min(pts.length - 1, i + 1)];
      const len = Math.hypot(c.x - a.x, c.y - a.y) || 1;
      let nx = -(c.y - a.y) / len;
      let ny = (c.x - a.x) / len;
      if (nx + 0.6 * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      return { x: p.x + nx * off, y: p.y + ny * off };
    }),
  );

const INK = "#1E2235";

// Слой рисования: "all" — целиком; "body" — без передних рук (за столом:
// тело рисуется до столешницы); "arms" — только передние руки (поверх
// столешницы и предметов на ней).
export type FigureLayer = "all" | "body" | "arms";

type FigureProps = {
  readonly uid: string;
  readonly look: Look;
  readonly pose: Pose;
  readonly layer?: FigureLayer;
  // толщина контура в единицах рисунка (Actor: lineFor(h) ≈ 2,9 px)
  readonly line?: number;
};

// Плоские предметы перед корпусом: рука с ними рисуется после второй руки.
const FLAT_ITEMS = new Set<string>(["drawing", "tablet", "sheets", "notebook", "card", "note", "craft", "calendar"]);

// Середина шеи по повороту корпуса (одна формула для шеи и одежды).
const neckXOf = (ox: number, bt: number) => ox + bt * 8;

export const Figure: React.FC<FigureProps> = ({ uid, look, pose, layer = "all", line = 3.6 }) => {
  const ol = line;
  const b = look.build;
  const bt = pose.bodyTurn;
  const at = Math.abs(bt);
  const sgn = bt >= 0 ? 1 : -1;
  const ws = 1 - 0.36 * at;
  const skinLine = lineOf(look.skin);

  // ---------- шаг ----------
  const amt = pose.walkAmt;
  const ph = pose.walkPhase;
  const TAU = Math.PI * 2;
  const bob = amt * b.stride * 0.018 * Math.cos(2 * TAU * ph);
  const sway = amt * 3 * Math.sin(TAU * ph) * (1 - at);
  const ox = sway;

  // ---------- посадка / присед ----------
  const sitE = smoothstep(pose.sit);
  const hipSitY = -pose.seat + 6;
  const crouchDrop = pose.crouch * b.thigh * 1.05;
  // Перенос веса опускает таз ровно настолько, чтобы обе стопы были
  // достижимы почти прямой ногой (колено стоя чуть мягкое, не согнуто).
  const legReach = b.thigh + b.shin - 1.5;
  const stanceDrop = Math.max(
    2,
    ...([-1, 1] as const).map((side) => {
      const foot = pose.feet?.[side < 0 ? 0 : 1];
      const fy = foot ? foot.y : -14;
      const hipX = ox + side * b.hipJointX * (1 - 0.55 * at);
      const fx = foot ? foot.x : side * (b.hipJointX + 8) * (1 - 0.5 * at);
      const dx = Math.min(legReach - 1, Math.abs(fx - hipX));
      return fy - Math.sqrt(legReach * legReach - dx * dx) - b.hipJointY;
    }),
  );
  const drop = (hipSitY - b.hipJointY) * sitE + (stanceDrop + crouchDrop) * (1 - sitE);
  const leanY = (1 - at) * pose.lean * 1.6;
  const dy = drop + bob;

  // ---------- ноги ----------
  const hipY = b.hipJointY + dy;
  const legs = ([-1, 1] as const).map((side) => {
    const hip = { x: ox + side * b.hipJointX * (1 - 0.55 * at), y: hipY };
    // стоя: стопы под бёдрами; в профиль — чуть вразнобой
    const stand = { x: side * (b.hipJointX + 8) * (1 - 0.5 * at) + side * sgn * 10 * at, y: -14 };
    // шаг: стопы из расчёта походки (опорная стоит в мире на месте)
    const ft = pose.feet?.[side < 0 ? 0 : 1];
    const ankleStand = ft ? { x: ft.x, y: ft.y } : stand;
    const roll = ft ? ft.roll : 0;
    // сидя: бедро к зрителю (в анфас — коротко), голень вниз
    const kneeSit = { x: hip.x + sgn * at * b.thigh * 0.92 + side * 6 * (1 - at), y: hip.y + lerp(34, 6, at) };
    const ankleSit = { x: kneeSit.x + sgn * at * 10, y: -14 };
    const ankle = mixV(ankleStand, ankleSit, sitE);
    const pref = { x: sgn * at + side * 0.08 * (1 - at), y: 0.15 };
    const ik = twoBone(hip, ankle, b.thigh, b.shin, pref, 0.3);
    const knee = mixV(ik.mid, kneeSit, sitE);
    return { side, hip, knee, ankle: mixV(ik.end, ankle, sitE), roll: roll * (1 - sitE) };
  });
  type Leg = (typeof legs)[number];
  const bare = !!look.skirt; // под юбкой — колготки/ноги: тоньше брюк
  const legColor = bare ? look.legColor ?? look.skin : look.bottom;
  const legLine = lineOf(legColor);
  const farLegSide = at > 0.12 ? sgn : 0;
  const rHip = b.leg * (bare ? 0.44 : 0.6);
  const rKnee = b.leg * (bare ? 0.34 : 0.47);
  const rAnkle = b.leg * (bare ? 0.27 : 0.44);
  const legParts = (l: Leg) => [capsule(l.hip, rHip, l.knee, rKnee), capsule(l.knee, rKnee, l.ankle, rAnkle)];
  const legOutline = (l: Leg) => (
    <g key={`lo${l.side}`}>
      {legParts(l).map((d, i) => (
        <path key={i} d={d} fill={legLine} stroke={legLine} strokeWidth={2 * ol} strokeLinejoin="round" />
      ))}
    </g>
  );
  const legFill = (l: Leg, far: boolean) => {
    const col = far ? scaleHex(legColor, 0.86) : legColor;
    return (
      <g key={`lf${l.side}`}>
        {legParts(l).map((d, i) => (
          <path key={i} d={d} fill={col} />
        ))}
        {/* полоса тени вдоль штанины и складка под коленом */}
        <path d={shadeSide([l.hip, l.knee, l.ankle], rKnee * 0.5)} stroke={scaleHex(legColor, 0.78)} strokeWidth={rKnee * 0.62} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.42} />
        {!bare ? <path d={shadeSide([mixV(l.knee, l.hip, 0.12), l.knee, mixV(l.knee, l.ankle, 0.14)], -rKnee * 0.15)} stroke={legLine} strokeWidth={ol * 0.6} strokeLinecap="round" fill="none" opacity={0.3} /> : null}
      </g>
    );
  };
  const shoeLine = lineOf(look.shoes);
  const shoe = (l: Leg, far: boolean) => {
    const len = lerp(b.leg * 1.05, b.foot, at);
    const toe = sgn * at * b.foot * 0.45;
    const cx = l.ankle.x + toe * 0.5 + l.side * 4 * (1 - at);
    const cy = l.ankle.y + 6;
    const rx = len * 0.55 + ol * 0.3;
    const ry = b.leg * 0.34;
    // носок ботинка ниже и круглее, пятка — выше (в профиль)
    const tx = cx + sgn * at * rx * 0.25;
    const d = `M ${cx - rx} ${cy + ry * 0.4} C ${cx - rx} ${cy - ry * 1.15} ${tx + rx * 0.2} ${cy - ry * 1.25} ${cx + rx} ${cy + ry * 0.3} Q ${cx + rx * 1.02} ${cy + ry * 0.95} ${cx + rx * 0.7} ${cy + ry * 0.95} L ${cx - rx * 0.7} ${cy + ry * 0.95} Q ${cx - rx * 1.02} ${cy + ry * 0.95} ${cx - rx} ${cy + ry * 0.4} Z`;
    return (
      <g key={`sh${l.side}`} transform={`rotate(${l.roll} ${l.ankle.x} ${l.ankle.y})`}>
        <path d={d} fill={far ? scaleHex(look.shoes, 0.9) : look.shoes} stroke={shoeLine} strokeWidth={ol} strokeLinejoin="round" />
        <path d={`M ${cx - rx * 0.78} ${cy + ry * 0.62} L ${cx + rx * 0.78} ${cy + ry * 0.62}`} stroke={shoeLine} strokeWidth={ol * 0.7} strokeLinecap="round" opacity={0.55} />
        <ellipse cx={cx - rx * 0.25 + toe * 0.3} cy={cy - ry * 0.35} rx={rx * 0.32} ry={ry * 0.2} fill="#FFFFFF" opacity={0.18} />
      </g>
    );
  };

  // ---------- корпус ----------
  const shy = -pose.shoulders * 12 + pose.exhale * 7 - pose.breath * 1.5;
  const sy = b.shoulderY + dy + leanY + shy;
  const wy = b.waistY + dy + leanY * 0.5;
  const hy = b.hipY + dy;
  const sw = b.shoulderHalf * ws;
  const waw = b.waistHalf * ws;
  const hw = b.hipHalf * ws;
  const cxl = ox + bt * b.shoulderHalf * ws * 0.45; // середина груди (пуговицы, воротник)
  // Наклон корпуса в повороте — вращение вокруг таза. Одно и то же
  // вращение применяется к корпусу, шее, голове и плечевым суставам рук:
  // голова и руки остаются соединены с корпусом при любом наклоне.
  const torsoRot = pose.lean && at > 0.05 ? sgn * at * pose.lean : 0;
  const torsoT = torsoRot ? `rotate(${torsoRot} ${ox} ${hy})` : undefined;
  const rotP = (p: Vec): Vec => {
    if (!torsoRot) return p;
    const r = (torsoRot * Math.PI) / 180;
    const dx = p.x - ox;
    const dy0 = p.y - hy;
    return { x: ox + dx * Math.cos(r) - dy0 * Math.sin(r), y: hy + dx * Math.sin(r) + dy0 * Math.cos(r) };
  };
  // Плечо: закругление корпуса радиусом ra — та же окружность, что у
  // верха рукава (плечевой сустав S в её центре).
  const lw = b.limb;
  const ra = lw * 0.5;
  const neckX = neckXOf(ox, bt);
  const nb = b.headRx * 0.32;
  const side2 = (s: -1 | 1) => {
    const top = { x: ox + s * (sw - ra), y: sy + 1 };
    return { top, out: { x: ox + s * sw, y: sy + ra + 1 } };
  };
  const SL = side2(-1);
  const SR = side2(1);
  // контур корпуса: открытый путь (без отрезка поперёк шеи) и замкнутый
  const torsoOpen = [
    `M ${neckX - nb} ${sy - 3}`,
    `Q ${ox - (sw - ra) * 0.62} ${sy - 3} ${SL.top.x} ${SL.top.y}`,
    `A ${ra} ${ra} 0 0 0 ${SL.out.x} ${SL.out.y}`,
    `Q ${ox - sw - 2} ${sy + 70} ${ox - sw * 0.93} ${sy + 112}`,
    `L ${ox - waw} ${wy}`,
    `Q ${ox - hw * 1.04} ${(wy + hy) / 2} ${ox - hw} ${hy + 6}`,
    `L ${ox + hw} ${hy + 6}`,
    `Q ${ox + hw * 1.04} ${(wy + hy) / 2} ${ox + waw} ${wy}`,
    `L ${ox + sw * 0.93} ${sy + 112}`,
    `Q ${ox + sw + 2} ${sy + 70} ${SR.out.x} ${SR.out.y}`,
    `A ${ra} ${ra} 0 0 0 ${SR.top.x} ${SR.top.y}`,
    `Q ${ox + (sw - ra) * 0.62} ${sy - 3} ${neckX + nb} ${sy - 3}`,
  ].join(" ");
  const torso = `${torsoOpen} Z`;
  const tid = `${uid}-torso`;
  const topLine = lineOf(look.topColor);
  const bottomLine = lineOf(look.bottom);
  const pelvisD = `M ${ox - hw} ${hy - 4} L ${ox + hw} ${hy - 4} L ${ox + hw * 0.95} ${hipY + 30} Q ${ox} ${hipY + 46} ${ox - hw * 0.95} ${hipY + 30} Z`;
  const skirt = look.skirt
    ? (() => {
        const len = look.skirtLen ?? 0.52;
        const hemY = b.hipJointY + dy + b.thigh * len * (1 - 0.4 * sitE);
        const flare = hw * (1.42 - 0.07 * (len - 0.52)) + 8 * amt * Math.sin(TAU * ph);
        const swingX = -sgn * at * 6 * amt;
        const d = `M ${ox - hw} ${hy - 6} L ${ox + hw} ${hy - 6} L ${ox + flare + swingX} ${hemY} Q ${ox + swingX} ${hemY + 12} ${ox - flare + swingX} ${hemY} Z`;
        const sid = `${uid}-skirt`;
        return (
          <g>
            <defs>
              <clipPath id={sid}>
                <path d={d} />
              </clipPath>
            </defs>
            <path d={d} fill={look.bottom} />
            <g clipPath={`url(#${sid})`}>
              <path d={`M ${ox + flare * 0.3 + swingX} ${hy - 10} L ${ox + flare * 1.05 + swingX} ${hemY + 14} L ${ox + flare * 1.6} ${hemY + 14} L ${ox + flare * 1.6} ${hy - 10} Z`} fill={scaleHex(look.bottom, 0.8)} opacity={0.4} />
              <path d={`M ${ox - flare * 1.6} ${hy - 10} L ${ox - flare * 1.6} ${hemY + 14} L ${ox - flare * 0.95 + swingX} ${hemY + 14} L ${ox - hw * 0.55} ${hy - 10} Z`} fill="#FFFFFF" opacity={0.07} />
            </g>
            {/* мягкие складки */}
            {[-0.4, 0.35].map((k) => (
              <path key={k} d={`M ${ox + k * hw * 0.8} ${hy + 30} L ${ox + swingX + k * flare * 0.9} ${hemY + 4}`} stroke={bottomLine} strokeWidth={ol * 0.6} opacity={0.45} strokeLinecap="round" />
            ))}
            <path d={d} fill="none" stroke={bottomLine} strokeWidth={ol} strokeLinejoin="round" />
          </g>
        );
      })()
    : null;

  // ---------- одежда ----------
  const collarPoint = (side: -1 | 1, w: number, h: number, fill: string, key: string) => {
    const k = side * (1 - 0.35 * Math.max(0, side * bt));
    return (
      <path
        key={key}
        d={`M ${cxl + k * (w * 0.92)} ${sy - 8} L ${cxl + k * 3} ${sy + h} L ${cxl + k * (w * 1.18)} ${sy + h * 0.72} Z`}
        fill={fill}
        stroke={lineOf(fill)}
        strokeWidth={ol * 0.8}
        strokeLinejoin="round"
      />
    );
  };
  const clothes = (() => {
    const els: React.ReactNode[] = [];
    if (look.top === "cardigan") {
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const gapX = 16 * (1 - 0.3 * at);
      const pl = `M ${ox - sw - 20} ${sy - 30} L ${cxl - gapX} ${sy - 4} L ${cxl - gapX * 0.7} ${hy + 40} L ${ox - sw - 20} ${hy + 40} Z`;
      const pr = `M ${ox + sw + 20} ${sy - 30} L ${cxl + gapX} ${sy - 4} L ${cxl + gapX * 0.7} ${hy + 40} L ${ox + sw + 20} ${hy + 40} Z`;
      els.push(
        <g key="card" clipPath={`url(#${tid})`}>
          <path d={pl} fill={look.topColor} stroke={topLine} strokeWidth={ol} strokeLinejoin="round" />
          <path d={pr} fill={look.topColor} stroke={topLine} strokeWidth={ol} strokeLinejoin="round" />
          {/* вязаная планка по краю и низ */}
          <path d={`M ${cxl - gapX - 5} ${sy - 2} L ${cxl - gapX * 0.7 - 5} ${hy + 40}`} stroke={look.topShade} strokeWidth={8} />
          <path d={`M ${cxl + gapX + 5} ${sy - 2} L ${cxl + gapX * 0.7 + 5} ${hy + 40}`} stroke={look.topShade} strokeWidth={8} />
          <rect x={ox - sw - 20} y={hy - 10} width={sw * 2 + 40} height={18} fill={look.topShade} />
          <path d={`M ${ox - sw - 20} ${hy - 10} L ${ox + sw + 20} ${hy - 10}`} stroke={topLine} strokeWidth={ol * 0.6} opacity={0.6} />
        </g>,
      );
    } else if (look.top === "pinafore") {
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const bibY = sy + 46;
      const bw = sw * 0.62;
      els.push(
        <g key="pin" clipPath={`url(#${tid})`}>
          <path d={`M ${cxl - bw} ${bibY} L ${cxl + bw} ${bibY} L ${ox + waw + 4} ${wy} L ${ox + hw + 6} ${hy + 10} L ${ox - hw - 6} ${hy + 10} L ${ox - waw - 4} ${wy} Z`} fill={look.topColor} stroke={topLine} strokeWidth={ol} />
          <rect x={cxl - bw} y={sy} width={14} height={bibY - sy + 2} fill={look.topColor} />
          <rect x={cxl + bw - 14} y={sy} width={14} height={bibY - sy + 2} fill={look.topColor} />
        </g>,
      );
    } else if (look.top === "blazer") {
      // рубашка/блузка в вырезе, полы пиджака с лацканами
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const btnY = sy + (wy - sy) * 0.7;
      const vw = 22 * (1 - 0.25 * at);
      const panel = (side: -1 | 1) => {
        const far = Math.max(0, side * bt); // дальняя пола уже
        const v = vw * (1 - 0.3 * far);
        return `M ${ox + side * (sw + 20)} ${sy - 30} L ${cxl + side * v} ${sy - 30} L ${cxl + side * v} ${sy - 6} L ${cxl - side * 2} ${btnY} L ${cxl + side * 12} ${hy + 8} L ${cxl + side * 16} ${hy + 40} L ${ox + side * (sw + 20)} ${hy + 40} Z`;
      };
      const lapel = (side: -1 | 1) => {
        const far = Math.max(0, side * bt);
        const v = vw * (1 - 0.3 * far);
        const lw2 = 26 * (1 - 0.45 * far) * (1 - 0.2 * at);
        return `M ${cxl + side * v} ${sy - 7} L ${cxl - side * 2} ${btnY} L ${cxl + side * (lw2 * 0.25)} ${btnY - 34} L ${cxl + side * (v + lw2)} ${sy + 46} L ${cxl + side * (v + lw2 * 0.62)} ${sy + 36} L ${cxl + side * (v + lw2 * 0.78)} ${sy + 20} L ${cxl + side * (v + 9)} ${sy - 8} Z`;
      };
      // открытый ворот (без галстука) — кожа в вырезе; с галстуком — узел
      if (!look.tie) els.push(<path key="skinV" d={`M ${cxl - 10} ${sy - 8} L ${cxl} ${sy + 16} L ${cxl + 10} ${sy - 8} Z`} fill={look.skin} />);
      els.push(<ellipse key="vshade" cx={neckX} cy={sy + 6} rx={vw * 1.1} ry={14} fill={INK} opacity={0.1} clipPath={`url(#${tid})`} />);
      if (look.tie) {
        const tl = lineOf(look.tie);
        els.push(
          <g key="tie">
            <path d={`M ${cxl - 9} ${sy + 8} L ${cxl + 9} ${sy + 8} L ${cxl + 6} ${sy + 22} L ${cxl - 6} ${sy + 22} Z`} fill={look.tie} stroke={tl} strokeWidth={ol * 0.7} strokeLinejoin="round" />
            <path d={`M ${cxl - 6} ${sy + 22} L ${cxl + 6} ${sy + 22} L ${cxl + 12 - bt * 4} ${btnY - 4} L ${cxl - bt * 4} ${btnY + 12} L ${cxl - 12 - bt * 4} ${btnY - 4} Z`} fill={look.tie} stroke={tl} strokeWidth={ol * 0.7} strokeLinejoin="round" />
          </g>,
        );
      }
      els.push(collarPoint(-1, 20, 18, look.inner, "cl"), collarPoint(1, 20, 18, look.inner, "cr"));
      els.push(
        <g key="panels" clipPath={`url(#${tid})`}>
          {([-1, 1] as const).map((side) => (
            <path key={side} d={panel(side)} fill={look.topColor} stroke={topLine} strokeWidth={ol} strokeLinejoin="round" />
          ))}
          {([-1, 1] as const).map((side) => (
            <path key={`l${side}`} d={lapel(side)} fill={mixHex(look.topColor, look.topShade, 0.55)} stroke={topLine} strokeWidth={ol * 0.85} strokeLinejoin="round" />
          ))}
          {/* нагрудный карман и клапаны карманов */}
          <path d={`M ${cxl + sw * 0.32} ${sy + 70} L ${cxl + sw * 0.32 + 26 * ws} ${sy + 68}`} stroke={topLine} strokeWidth={ol * 0.8} strokeLinecap="round" />
          {([-1, 1] as const).map((side) => (
            <path key={`p${side}`} d={`M ${cxl + side * sw * 0.3} ${hy - 22} L ${cxl + side * (sw * 0.3 + 30 * ws)} ${hy - 22}`} stroke={topLine} strokeWidth={ol * 0.8} strokeLinecap="round" />
          ))}
          <circle cx={cxl - 2} cy={btnY + 6} r={4.5} fill={scaleHex(look.topColor, 0.75)} stroke={topLine} strokeWidth={ol * 0.5} />
        </g>,
      );
    } else {
      els.push(<path key="base" d={torso} fill={look.topColor} />);
    }
    // объём: мягкий свет слева, тень справа (свет слева сверху)
    els.push(
      <g key="vol" clipPath={`url(#${tid})`}>
        <path d={`M ${ox + sw * 0.46 + bt * 10} ${sy - 40} Q ${ox + sw * 0.62 + bt * 10} ${(sy + hy) / 2} ${ox + sw * 0.4 + bt * 10} ${hy + 40} L ${ox + sw + 40} ${hy + 40} L ${ox + sw + 40} ${sy - 40} Z`} fill={look.topShade} opacity={0.3} />
        <rect x={ox - sw - 12} y={sy - 40} width={sw * 2 + 24} height={hy - sy + 80} fill={`url(#${uid}-vol)`} />
        {/* складки у талии и подмышек */}
        <path d={`M ${ox - sw * 0.86} ${sy + 92} Q ${ox - sw * 0.7} ${sy + 110} ${ox - sw * 0.74} ${sy + 132}`} stroke={topLine} strokeWidth={ol * 0.6} fill="none" opacity={0.35} strokeLinecap="round" />
        <path d={`M ${ox + sw * 0.86} ${sy + 92} Q ${ox + sw * 0.7} ${sy + 110} ${ox + sw * 0.74} ${sy + 132}`} stroke={topLine} strokeWidth={ol * 0.6} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>,
    );
    // воротник/детали
    if (look.top === "shirt") {
      els.push(
        <g key="collar">
          <path d={`M ${cxl - 11} ${sy - 8} L ${cxl - 1} ${sy + 18} L ${cxl + 11} ${sy - 8} Z`} fill={look.skin} />
          <path d={`M ${cxl} ${sy + 18} L ${cxl - bt * 6} ${hy}`} stroke={topLine} strokeWidth={ol * 0.6} opacity={0.7} />
          {[0.3, 0.55, 0.8].map((k) => (
            <circle key={k} cx={cxl - bt * 6 * k + 4} cy={sy + 18 + (hy - sy - 18) * k} r={3.2} fill={lightOf(look.topColor, 0.5)} stroke={topLine} strokeWidth={1.2} />
          ))}
          {collarPoint(-1, 24, 24, lightOf(look.topColor, 0.25), "cl")}
          {collarPoint(1, 24, 24, lightOf(look.topColor, 0.25), "cr")}
          {/* ремень с пряжкой */}
          <rect x={ox - hw} y={hy - 8} width={hw * 2} height={12} fill="#2E2A2A" clipPath={`url(#${tid})`} />
          <rect x={cxl - 8 - bt * 6} y={hy - 9} width={16} height={13} rx={2} fill="#B9B2A6" stroke="#5E574E" strokeWidth={1.5} />
        </g>,
      );
    } else if (look.top === "pinafore") {
      // круглый белый воротничок
      els.push(
        <g key="collar">
          <ellipse cx={cxl - 15} cy={sy + 6} rx={20} ry={12} fill="#FFFFFF" stroke={lineOf("#FFFFFF")} strokeWidth={ol * 0.7} />
          <ellipse cx={cxl + 15} cy={sy + 6} rx={20} ry={12} fill="#FFFFFF" stroke={lineOf("#FFFFFF")} strokeWidth={ol * 0.7} />
        </g>,
      );
    } else if (look.top === "cardigan") {
      els.push(
        <g key="buttons">
          {[0.35, 0.6].map((k) => (
            <circle key={k} cx={cxl - 14 * (1 - 0.3 * at) - 6} cy={sy + (hy - sy) * k} r={4.5} fill={lightOf(look.topShade, 0.25)} stroke={topLine} strokeWidth={1.4} />
          ))}
        </g>,
      );
    } else if (look.top === "jacket") {
      els.push(<line key="zip" x1={cxl} y1={sy + 4} x2={cxl - bt * 6} y2={hy + 20} stroke={topLine} strokeWidth={ol} clipPath={`url(#${tid})`} />);
      els.push(<path key="col" d={`M ${cxl - 26} ${sy - 6} Q ${cxl} ${sy + 18} ${cxl + 26} ${sy - 6}`} stroke={look.topShade} strokeWidth={8} fill="none" />);
    } else if (look.top === "tee") {
      els.push(<path key="neck" d={`M ${cxl - 22} ${sy - 4} Q ${cxl} ${sy + 16} ${cxl + 22} ${sy - 4}`} stroke={look.topShade} strokeWidth={6} fill="none" />);
    } else if (look.top === "sweater") {
      // вырез-резинка, воротник рубашки (джемпер сына), резинка по низу
      const nk = `M ${cxl - 25} ${sy - 5} Q ${cxl} ${sy + 20} ${cxl + 25} ${sy - 5}`;
      els.push(<path key="neckO" d={nk} stroke={topLine} strokeWidth={9 + ol * 1.4} fill="none" strokeLinecap="round" />);
      els.push(<path key="neck" d={nk} stroke={look.topShade} strokeWidth={9} fill="none" strokeLinecap="round" />);
      if (look.collar) els.push(collarPoint(-1, 18, 16, look.collar, "cl"), collarPoint(1, 18, 16, look.collar, "cr"));
      els.push(
        <g key="rib" clipPath={`url(#${tid})`}>
          <rect x={ox - hw - 10} y={hy - 12} width={hw * 2 + 20} height={20} fill={look.topShade} />
          <path d={`M ${ox - hw - 10} ${hy - 12} L ${ox + hw + 10} ${hy - 12}`} stroke={topLine} strokeWidth={ol * 0.6} opacity={0.6} />
        </g>,
      );
    }
    // небольшой цветной акцент на груди (полоска на футболке мальчика)
    if (look.accent) {
      els.push(<rect key="accent" x={cxl - sw * 0.62 - bt * 8} y={sy + (hy - sy) * 0.3} width={sw * 1.24} height={(hy - sy) * 0.09} rx={4} fill={look.accent} clipPath={`url(#${tid})`} />);
    }
    // тень под подбородком на груди
    els.push(<ellipse key="chin" cx={neckX} cy={sy - 2} rx={sw * 0.42} ry={12} fill={INK} opacity={0.08} clipPath={`url(#${tid})`} />);
    // контур корпуса — поверх одежды
    els.push(<path key="ol" d={torsoOpen} fill="none" stroke={topLine} strokeWidth={ol} strokeLinejoin="round" strokeLinecap="round" />);
    return els;
  })();

  // ---------- рюкзак ----------
  const pack = pose.packOff ? undefined : look.backpack;
  const packX = ox - sgn * at * sw * 0.9;
  const packLine = pack ? lineOf(pack) : "";
  const strapColor = pack ? scaleHex(pack, 0.72) : "";
  const packEl = pack
    ? (() => {
        const pw = sw * 0.9;
        const top = sy - 20;
        const ht = (hy - sy) * 1.02 + 12;
        const back = -sgn * at * pw * 0.35; // карман смещён к спине
        return (
          <g transform={`rotate(${pose.packSway} ${packX} ${sy})`}>
            <path d={`M ${packX - pw * 0.3} ${top + 4} Q ${packX} ${top - 26} ${packX + pw * 0.3} ${top + 4}`} stroke={packLine} strokeWidth={10 + 2 * ol} fill="none" strokeLinecap="round" />
            <path d={`M ${packX - pw * 0.3} ${top + 4} Q ${packX} ${top - 26} ${packX + pw * 0.3} ${top + 4}`} stroke={strapColor} strokeWidth={10} fill="none" strokeLinecap="round" />
            <rect x={packX - pw} y={top} width={pw * 2} height={ht} rx={pw * 0.42} fill={pack} stroke={packLine} strokeWidth={ol} />
            <rect x={packX - pw * 0.66 + back} y={top + ht * 0.52} width={pw * 1.32} height={ht * 0.38} rx={pw * 0.22} fill={scaleHex(pack, 0.88)} stroke={packLine} strokeWidth={ol * 0.8} />
            <path d={`M ${packX - pw * 0.5 + back} ${top + ht * 0.6} L ${packX + pw * 0.5 + back} ${top + ht * 0.6}`} stroke={packLine} strokeWidth={ol * 0.6} strokeDasharray="5 5" opacity={0.6} />
            <rect x={packX - pw * 0.78} y={top + 10} width={pw * 0.3} height={ht * 0.5} rx={pw * 0.15} fill="#FFFFFF" opacity={0.18} />
            <rect x={packX + pw * 0.45} y={top + 14} width={pw * 0.32} height={ht * 0.7} rx={pw * 0.15} fill={INK} opacity={0.1} />
          </g>
        );
      })()
    : null;
  const straps = pack ? (
    <g>
      {([-1, 1] as const).map((side) => {
        const tug = side === 1 ? pose.strapTug * 10 : 0;
        const top = { x: ox + side * sw * 0.55, y: sy - 4 };
        const bot = { x: ox + side * sw * 0.72, y: wy + 6 + tug };
        const visible = 1 - smoothstep((side * -sgn * at - 0.35) / 0.3);
        const d = `M ${top.x} ${top.y} Q ${top.x + side * 4} ${(top.y + bot.y) / 2} ${bot.x} ${bot.y}`;
        return visible > 0.01 ? (
          <g key={side} opacity={visible}>
            <path d={d} stroke={packLine} strokeWidth={13 + 2 * ol} fill="none" strokeLinecap="round" />
            <path d={d} stroke={strapColor} strokeWidth={13} fill="none" strokeLinecap="round" />
          </g>
        ) : null;
      })}
    </g>
  ) : null;

  // ---------- сумка на плече (мама №30) ----------
  const bag =
    pose.bagOnShoulder > 0.01 ? (
      <g opacity={smoothstep(pose.bagOnShoulder * 1.5)}>
        <path d={`M ${ox + sw * 0.62} ${sy + 2} Q ${ox + sw * 1.12} ${(sy + hy) / 2} ${ox + sw * 1.02} ${hy + 6}`} stroke="#5E3F31" strokeWidth={7} fill="none" />
        <rect x={ox + sw * 0.72} y={hy - 4} width={b.shoulderHalf * 0.82} height={b.shoulderHalf * 0.64} rx={16} fill="#8A5A44" stroke={lineOf("#8A5A44")} strokeWidth={ol} />
        <rect x={ox + sw * 0.72} y={hy - 4} width={b.shoulderHalf * 0.82} height={16} rx={8} fill="#7A4E3B" />
      </g>
    ) : null;

  // ---------- руки ----------
  const swing = (side: -1 | 1) => {
    const q = Math.cos(TAU * ph) * (side < 0 ? 1 : -1);
    return { x: q * amt * 34 * pose.walkDir * Math.max(0.4, at), y: -Math.abs(q) * amt * 6 };
  };
  const sleeve = look.top === "pinafore" ? look.inner : look.top === "shirt" ? look.topColor : look.topColor;
  const arm = (side: -1 | 1, st: ArmState) => {
    const S = rotP({ x: ox + side * (sw - ra), y: sy + ra + 1 });
    const sw0 = swing(side);
    // свободная рука: почти прямая, кисть сбоку от бедра
    const target = st.target ?? {
      x: S.x + side * 12 * (1 - at) + sw0.x,
      y: S.y + b.upperArm + b.forearm - 4 + sw0.y,
    };
    const pref =
      // «вниз» — вниз и чуть наружу: устойчиво и для кисти прямо под плечом
      st.elbow === "down" ? { x: side * 0.5, y: 1 } : st.elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
    // "hang": плечо вдоль тела, предплечье к цели (в проекции короче);
    // "front": локоть к зрителю — предплечье полной длины от точки чуть
    // ниже плеча, плечо укорочено; если цель недостижима — обычный сгиб
    const frontElbow = (): { mid: Vec; end: Vec } | null => {
      const P0 = { x: S.x + side * lw * 0.25, y: S.y + lw * 1.2 };
      const dW = Math.hypot(P0.x - target.x, P0.y - target.y) || 1;
      const E0 = { x: target.x + ((P0.x - target.x) / dW) * b.forearm, y: target.y + ((P0.y - target.y) / dW) * b.forearm };
      const dS = Math.hypot(E0.x - S.x, E0.y - S.y);
      return dS <= b.upperArm && E0.y >= S.y + lw * 0.3 ? { mid: E0, end: target } : null;
    };
    const { mid: E, end: W } =
      st.elbow === "hang"
        ? { mid: { x: S.x + side * lw * 0.35, y: S.y + b.upperArm * 0.92 }, end: target }
        : (st.elbow === "front" ? frontElbow() : null) ?? twoBone(S, target, b.upperArm, b.forearm, pref);
    const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
    // рукав до манжеты; подвернутый — до середины предплечья
    const cuffK = look.rolled ? 0.46 : look.top === "tee" ? 0.12 : 0.8;
    const cuff = mixV(E, W, cuffK);
    const watch = look.watch && side === 1;
    const wp = mixV(E, W, 0.9);
    const shape = st.shape ?? "relax";
    // радиусы: плечо (= закругление корпуса), локоть, манжета, кожа
    const rU = ra;
    const rE = lw * 0.44;
    const rC = lw * 0.42;
    const rS = lw * 0.3;
    const rW = lw * 0.26;
    const rCuff = lerp(rE, rC, cuffK);
    const upperD = capsule(S, rU, E, rE);
    const foreD = capsule(E, rE, cuff, rCuff);
    const skinD = capsule(mixV(E, W, Math.max(0, cuffK - 0.15)), rS, W, rW);
    const shirtCuffD = look.top === "blazer" ? capsule(mixV(E, W, 0.76), rS * 1.18, mixV(E, W, 0.87), rS * 1.12) : null;
    const rollD = look.rolled ? capsule(mixV(E, W, cuffK - 0.1), rCuff * 1.06, cuff, rCuff * 1.04) : null;
    const ribD = look.top === "sweater" || look.top === "cardigan" ? capsule(mixV(E, W, 0.7), rC * 0.98, cuff, rCuff * 0.96) : null;
    const hand = (part: "back" | "front", dark: boolean) => (
      <Hand
        x={W.x}
        y={W.y}
        angle={foreAng + (st.wrist ?? 0)}
        side={side}
        len={b.hand}
        skin={dark ? scaleHex(look.skin, 0.93) : look.skin}
        shade={look.skinShade}
        shape={shape}
        item={st.item ?? "none"}
        itemColor={st.itemColor}
        flat={st.flat ?? 0}
        itemTilt={st.itemTilt ?? 0}
        glow={part === "back" ? st.glow ?? 0 : 0}
        shake={st.shake ?? 0}
        facing={st.facing}
        line={ol}
        part={part}
      />
    );
    // dark — рука за корпусом: чуть темнее (глубина)
    const el = (dark: boolean) => {
      const sl = dark ? scaleHex(sleeve, 0.86) : sleeve;
      const sLine = lineOf(sleeve);
      const sk = dark ? scaleHex(look.skin, 0.93) : look.skin;
      const shirt = look.inner;
      return (
        <g key={`arm${side}${dark ? "d" : ""}`}>
          {/* кожа предплечья */}
          <path d={skinD} fill={skinLine} stroke={skinLine} strokeWidth={2 * ol} strokeLinejoin="round" />
          <path d={skinD} fill={sk} />
          {shirtCuffD ? (
            <>
              <path d={shirtCuffD} fill={lineOf(shirt)} stroke={lineOf(shirt)} strokeWidth={2 * ol} />
              <path d={shirtCuffD} fill={dark ? scaleHex(shirt, 0.9) : shirt} />
            </>
          ) : null}
          {/* рукав: контур одним силуэтом, затем заливка */}
          <path d={upperD} fill={sLine} stroke={sLine} strokeWidth={2 * ol} strokeLinejoin="round" />
          <path d={foreD} fill={sLine} stroke={sLine} strokeWidth={2 * ol} strokeLinejoin="round" />
          <path d={upperD} fill={sl} />
          <path d={foreD} fill={sl} />
          <path d={shadeSide([S, E, cuff], lw * 0.24)} stroke={scaleHex(sleeve, 0.78)} strokeWidth={lw * 0.3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.3} />
          {ribD ? <path d={ribD} fill={dark ? scaleHex(look.topShade, 0.88) : look.topShade} /> : null}
          {rollD ? (
            <>
              <path d={rollD} fill={sLine} stroke={sLine} strokeWidth={2 * ol} />
              <path d={rollD} fill={lightOf(sl, 0.2)} />
            </>
          ) : null}
          {watch ? (
            <g transform={`rotate(${foreAng} ${wp.x} ${wp.y})`}>
              <rect x={wp.x - rS * 1.1} y={wp.y - 5} width={rS * 2.2} height={10} rx={3} fill="#2A2A34" />
              <rect x={wp.x - 7.5} y={wp.y - 7.5} width={15} height={15} rx={4} fill="#D9DDE4" stroke="#2A2A34" strokeWidth={2.5} />
            </g>
          ) : null}
          {hand("back", dark)}
        </g>
      );
    };
    // пальцы — отдельным проходом поверх обеих рук (кисть второй руки
    // держит край листа/планшета поверх него)
    const fingers = (dark: boolean) => <g key={`fing${side}${dark ? "d" : ""}`}>{hand("front", dark)}</g>;
    const big = FLAT_ITEMS.has(st.item ?? "none");
    return { side, S, E, W, el, fingers, big };
  };
  const arms = [arm(-1, pose.armL ?? REST), arm(1, pose.armR ?? REST)];
  // дальняя рука за корпусом при повороте (плавно, через прозрачность)
  const behindK = smoothstep((at - 0.38) / 0.18);
  const isBehind = (side: -1 | 1, st: ArmState) => (st.behind !== undefined ? (st.behind ? 1 : 0) : side === sgn ? behindK : 0);
  const behindL = isBehind(-1, pose.armL ?? REST);
  const behindR = isBehind(1, pose.armR ?? REST);
  // тень передних рук на корпусе (мягкая, со сдвигом от света)
  const armShadows = (
    <g clipPath={`url(#${tid})`} opacity={0.1}>
      {arms.map((a) => {
        const k = 1 - (a.side < 0 ? behindL : behindR);
        return k > 0.05 ? <path key={a.side} d={poly([a.S, a.E, a.W].map((p) => ({ x: p.x + 8, y: p.y + 6 })))} stroke={INK} strokeWidth={lw} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={k} /> : null;
      })}
    </g>
  );

  // ---------- голова ----------
  const headCx = neckX + bt * 4;
  const headCy = b.headY + dy + leanY * 1.15 + shy * 0.8 + pose.nod * 0.6;
  // голова частично компенсирует наклон корпуса (остаётся ближе к вертикали)
  const headRot = pose.headTilt - torsoRot * 0.5;
  const neckTop = b.neckTop + dy + leanY + shy * 0.8;
  const neckW = b.headRx * 0.6;
  const headProps = {
    uid,
    look,
    cx: headCx,
    cy: headCy,
    turn: pose.headTurn,
    lookX: pose.lookX,
    lookY: pose.lookY,
    nod: pose.nod,
    expr: pose.expr,
    mouth: pose.mouth,
    blink: pose.blink,
    hairSway: pose.hairSway,
    line: ol,
  };
  // шея: от середины головы (её верх всегда под лицом/затылком при любом
  // наклоне и кивке) до воротника, слегка расширяется книзу
  const nTop = Math.min(neckTop - 18, headCy + b.headRy * 0.35);
  const nl = neckW * 0.42;
  const nbw = neckW * 0.5;
  const neckD = `M ${neckX - nl} ${nTop} L ${neckX + nl} ${nTop} L ${neckX + nbw} ${sy + 12} L ${neckX - nbw} ${sy + 12} Z`;

  // Порядок: сначала рука без крупного плоского предмета, затем рука с
  // листом/планшетом (рукав второй руки — за ним), затем пальцы обеих.
  const armPass = (behind: boolean) => {
    const vis = arms
      .map((a) => ({ a, k: a.side < 0 ? behindL : behindR }))
      .map(({ a, k }) => ({ a, o: behind ? k : 1 - k }))
      .filter(({ o }) => (behind ? o > 0.01 : o > 0.01));
    const ordered = [...vis].sort((x, y) => Number(x.a.big) - Number(y.a.big));
    return (
      <g>
        {ordered.map(({ a, o }) => (
          <g key={`a${a.side}`} opacity={o}>
            {a.el(behind)}
          </g>
        ))}
        {vis.map(({ a, o }) => (
          <g key={`h${a.side}`} opacity={o}>
            {a.fingers(behind)}
          </g>
        ))}
      </g>
    );
  };
  const frontArms = armPass(false);
  if (layer === "arms") return <g>{frontArms}</g>;
  const nearLegs = legs.filter((l) => l.side !== farLegSide);
  const farLeg = legs.find((l) => l.side === farLegSide);
  return (
    <g>
      <defs>
        <clipPath id={tid}>
          <path d={torso} />
        </clipPath>
        <clipPath id={`${uid}-neck`}>
          <path d={neckD} />
        </clipPath>
        <linearGradient id={`${uid}-vol`} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.18} />
          <stop offset="0.38" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.62" stopColor={INK} stopOpacity={0} />
          <stop offset="1" stopColor={INK} stopOpacity={0.16} />
        </linearGradient>
        <radialGradient id={`${uid}-floor`}>
          <stop offset="0" stopColor="#191E3C" stopOpacity={0.26} />
          <stop offset="0.6" stopColor="#191E3C" stopOpacity={0.14} />
          <stop offset="1" stopColor="#191E3C" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* контактная тень на полу */}
      <ellipse cx={ox * 0.5} cy={2} rx={b.shoulderHalf * (1.45 - 0.2 * sitE)} ry={24} fill={`url(#${uid}-floor)`} />
      {packEl}
      <g transform={torsoT}>
        <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
          <Head {...headProps} part="back" />
        </g>
      </g>
      {armPass(true)}
      {/* дальняя нога отдельно (со своим контуром), ближние — одним силуэтом с тазом */}
      {farLeg ? (
        <g>
          {legOutline(farLeg)}
          {legFill(farLeg, true)}
          {shoe(farLeg, true)}
        </g>
      ) : null}
      <g>
        <path d={pelvisD} fill={bottomLine} stroke={bottomLine} strokeWidth={2 * ol} strokeLinejoin="round" />
        {nearLegs.map(legOutline)}
        <path d={pelvisD} fill={look.bottom} />
        {nearLegs.map((l) => legFill(l, false))}
        {nearLegs.map((l) => shoe(l, false))}
      </g>
      {skirt}
      <g transform={torsoT}>
        {/* шея: рисуется под одеждой у воротника, чтобы не торчать */}
        <path d={neckD} fill={look.skin} />
        <g clipPath={`url(#${uid}-neck)`}>
          <ellipse cx={headCx + pose.headTurn * b.headRx * 0.2} cy={headCy + b.headRy * 0.95} rx={neckW * 0.9} ry={18} fill={look.skinShade} opacity={0.9} />
        </g>
        <path d={`M ${neckX - nl} ${nTop} L ${neckX - nbw} ${sy + 12} M ${neckX + nl} ${nTop} L ${neckX + nbw} ${sy + 12}`} stroke={skinLine} strokeWidth={ol} fill="none" />
        {clothes}
        {layer === "all" ? armShadows : null}
        {straps}
        {bag}
        <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
          <Head {...headProps} part="front" />
        </g>
      </g>
      {layer === "all" ? frontArms : null}
    </g>
  );
};

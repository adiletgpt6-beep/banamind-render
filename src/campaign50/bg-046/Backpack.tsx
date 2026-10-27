// Герой ролика — говорящий школьный рюкзак (вид спереди).
//
// • Тело — мягкая «ткань»: каждая точка рисунка проходит через деформацию
//   (сжатие/растяжение с сохранением объёма, наклон верха, дыхание), поэтому
//   глаза, рот, карман и швы мнутся вместе с тканью.
// • Рот — молния: две ленты с зубчиками. Раскрытие, ширина и округлость
//   берутся из формы рта по буквам озвучки (Viseme). Бегунок молнии может
//   «застегнуть» рот слева направо (closed 0…1).
// • Глаза с веками (моргание, прищур улыбки, подмигивание), зрачки
//   смотрят по направлению lookX/lookY, брови-нашивки поднимаются и
//   хмурятся.
// • Ручка, лямки, бегунок и брелок качаются с запаздыванием (swing).
// Локальные единицы: низ рюкзака в (0, 0), высота ≈ 580, вверх — минус.
import type { Viseme } from "./context";
import { C } from "./palette";
import { clamp, lerp } from "./rig/motion";

export type BagFace = {
  readonly lidL: number; // 0 — открыт, 1 — закрыт (левый на экране)
  readonly lidR: number;
  readonly squint: number; // 0…1 — нижнее веко поднимается (улыбка глазами)
  readonly browL: number; // −1…1 подъём брови
  readonly browR: number;
  readonly browTilt: number; // + внутренние края вверх (тревога), − хмурится
  readonly lookX: number; // −1…1
  readonly lookY: number; // −1 вверх … 1 вниз
  readonly pupil: number; // размер зрачка (1 — обычный)
  readonly smile: number; // −1…1
};

export const FACE = {
  sleep: { lidL: 1, lidR: 1, squint: 0, browL: -0.2, browR: -0.2, browTilt: 0, lookX: 0, lookY: 0.2, pupil: 1, smile: 0.15 },
  neutral: { lidL: 0, lidR: 0, squint: 0, browL: 0, browR: 0, browTilt: 0, lookX: 0, lookY: 0, pupil: 1, smile: 0.2 },
  happy: { lidL: 0.05, lidR: 0.05, squint: 0.55, browL: 0.5, browR: 0.5, browTilt: 0, lookX: 0, lookY: 0, pupil: 1.05, smile: 0.85 },
  whisper: { lidL: 0.1, lidR: 0.1, squint: 0.3, browL: 0.25, browR: -0.1, browTilt: 0.2, lookX: 0, lookY: 0, pupil: 1, smile: 0.25 },
  curious: { lidL: 0, lidR: 0, squint: 0, browL: 0.85, browR: 0.15, browTilt: 0.15, lookX: 0, lookY: 0, pupil: 1.1, smile: 0.3 },
  wonder: { lidL: 0, lidR: 0, squint: 0, browL: 0.9, browR: 0.9, browTilt: 0.35, lookX: 0, lookY: -0.2, pupil: 1.18, smile: 0.1 },
  worried: { lidL: 0, lidR: 0, squint: 0, browL: 0.35, browR: 0.35, browTilt: 0.9, lookX: 0, lookY: 0, pupil: 0.95, smile: -0.25 },
  proud: { lidL: 0, lidR: 0, squint: 0.32, browL: 0.75, browR: 0.75, browTilt: 0.05, lookX: 0, lookY: 0, pupil: 1, smile: 0.7 },
  thinking: { lidL: 0.14, lidR: 0, squint: 0, browL: 0.65, browR: -0.15, browTilt: 0.1, lookX: 0.5, lookY: -0.5, pupil: 1, smile: 0.05 },
  tired: { lidL: 0.4, lidR: 0.4, squint: 0, browL: -0.1, browR: -0.1, browTilt: 0.45, lookX: 0, lookY: 0.3, pupil: 0.95, smile: -0.05 },
} as const satisfies Record<string, BagFace>;

export type BagFaceId = keyof typeof FACE;

export const mixFace = (a: BagFace, b: BagFace, t: number): BagFace => {
  const m = (k: keyof BagFace) => lerp(a[k], b[k], t);
  return {
    lidL: m("lidL"),
    lidR: m("lidR"),
    squint: m("squint"),
    browL: m("browL"),
    browR: m("browR"),
    browTilt: m("browTilt"),
    lookX: m("lookX"),
    lookY: m("lookY"),
    pupil: m("pupil"),
    smile: m("smile"),
  };
};

export type BackpackProps = {
  readonly uid: string;
  readonly x: number; // мировые px: точка низа рюкзака
  readonly y: number;
  readonly s: number; // масштаб (1 — высота ≈ 580 px)
  readonly f: number;
  readonly face: BagFace;
  readonly blink?: number; // 0…1 поверх век
  readonly mouth: Viseme;
  readonly squash?: number; // + сжат, − вытянут (−1…1)
  readonly lean?: number; // смещение верха, локальные единицы (+ вправо)
  readonly rot?: number; // поворот вокруг низа, градусы
  readonly swing?: number; // градусы качания ручки, лямок, брелока
  readonly straps?: "hang" | "none";
  readonly pocket?: number; // 0…1 клапан кармана открыт
  readonly closed?: number; // 0…1 молния застёгнута бегунком слева направо
  readonly shadow?: boolean;
  readonly opacity?: number;
};

const TOP = 578;

// Точка рисунка с учётом деформации ткани.
const deformer = (squash: number, lean: number, f: number) => {
  const breath = Math.sin(f / 22) * 0.012;
  const sy = 1 - squash * 0.11 + breath;
  const sx = 1 / Math.sqrt(Math.max(0.6, sy)); // объём сохраняется
  return (x: number, y: number) => {
    const t = clamp(-y / TOP, 0, 1.25);
    // ткань полнее в середине при сжатии
    const belly = 1 + Math.max(0, squash) * 0.06 * Math.sin(Math.PI * clamp(t));
    const xx = x * lerp(1, sx, 0.4 + 0.6 * t) * belly;
    const yy = y * sy;
    return { x: xx + lean * Math.pow(t, 1.5), y: yy };
  };
};

type Pt = { x: number; y: number };
const pathOf = (pts: readonly Pt[], close = false) => {
  // сглаженная ломаная: квадратичные кривые через середины отрезков
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return close ? `${d} Z` : d;
};

// Контур тела (точки в покое, по часовой стрелке от низа слева).
const BODY: readonly Pt[] = (() => {
  const pts: Pt[] = [];
  const add = (x: number, y: number) => pts.push({ x, y });
  add(-150, 0);
  add(-205, -8);
  add(-216, -70);
  add(-212, -200);
  add(-207, -330);
  add(-198, -440);
  add(-168, -520);
  add(-100, -568);
  add(0, -TOP);
  add(100, -568);
  add(168, -520);
  add(198, -440);
  add(207, -330);
  add(212, -200);
  add(216, -70);
  add(205, -8);
  add(150, 0);
  add(0, 4);
  add(-150, 0);
  return pts;
})();

export const Backpack: React.FC<BackpackProps> = (p) => {
  const { uid, face, mouth } = p;
  const squash = p.squash ?? 0;
  const lean = p.lean ?? 0;
  const swing = p.swing ?? 0;
  const D = deformer(squash, lean, p.f);
  const T = (pts: readonly Pt[]) => pts.map((q) => D(q.x, q.y));
  const body = pathOf(T(BODY), true);
  const clipId = `${uid}-body`;
  const pocketOpen = clamp(p.pocket ?? 0);
  const closed = clamp(p.closed ?? 0);
  const blink = p.blink ?? 0;

  // ---------- ручка сверху ----------
  const hTop = D(0, -TOP);
  const handle = (() => {
    const a = D(-62, -TOP + 8);
    const b = D(62, -TOP + 8);
    const ang = (swing * 0.6 * Math.PI) / 180;
    const up = { x: hTop.x + Math.sin(ang) * 86, y: hTop.y - Math.cos(ang) * 86 };
    return `M ${a.x} ${a.y} C ${a.x - 6} ${up.y - 10} ${up.x - 40} ${up.y - 34} ${up.x} ${up.y - 34} C ${up.x + 40} ${up.y - 34} ${b.x + 6} ${up.y - 10} ${b.x} ${b.y}`;
  })();

  // ---------- лямки (видны по бокам, свисают за рюкзаком) ----------
  const strap = (side: -1 | 1) => {
    const top = D(side * 130, -520);
    const ang = ((swing * 0.8 + side * 3) * Math.PI) / 180;
    const len = 470;
    const mid = D(side * 236, -300);
    const end = { x: top.x + side * 70 + Math.sin(ang) * len * 0.9, y: top.y + Math.cos(ang) * len };
    return `M ${top.x} ${top.y} C ${mid.x + side * 20} ${mid.y - 120} ${mid.x + side * 12 + Math.sin(ang) * 60} ${mid.y + 60} ${end.x} ${end.y}`;
  };

  // ---------- глаза ----------
  const eyeR = { x: 60, y: 68 };
  const eye = (side: -1 | 1) => {
    const c = D(side * 88, -410);
    const lidOwn = side < 0 ? face.lidL : face.lidR;
    const lid = clamp(Math.max(lidOwn, blink));
    const sq = clamp(face.squint);
    const id = `${uid}-eye${side}`;
    const rx = eyeR.x * (1 + squash * 0.05);
    const ry = eyeR.y * (1 - squash * 0.08);
    const px = c.x + face.lookX * rx * 0.36;
    const py = c.y + face.lookY * ry * 0.3;
    const pr = 29 * face.pupil;
    // верхнее веко — ткань сверху; нижнее (прищур) — снизу дугой
    const lidY = c.y - ry - 4 + (2 * ry + 8) * lid;
    const lowY = c.y + ry + 4 - ry * 1.15 * sq;
    const browRaise = side < 0 ? face.browL : face.browR;
    const bIn = c.x - side * rx * 0.55;
    const bOut = c.x + side * rx * 0.75;
    const by = c.y - ry - 30 - browRaise * 20;
    const tilt = face.browTilt * 16;
    const shut = lid > 0.94;
    // полуширина глаза на высоте y (линия века не выходит за контур)
    const halfAt = (y: number) => rx * Math.sqrt(Math.max(0, 1 - ((y - c.y) / ry) ** 2)) * 0.96;
    return (
      <g key={side}>
        <clipPath id={id}>
          <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} />
        </clipPath>
        {shut ? (
          // закрытый глаз — стёжка-дуга ресниц
          <path
            d={`M ${c.x - rx * 0.9} ${c.y + 4} Q ${c.x} ${c.y + 34 - sq * 20} ${c.x + rx * 0.9} ${c.y + 4}`}
            stroke={C.bagTrim}
            strokeWidth={11}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <>
            <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} fill="#FFFFFF" />
            <g clipPath={`url(#${id})`}>
              <circle cx={px} cy={py} r={pr} fill={C.bagTrim} />
              <circle cx={px} cy={py} r={pr * 0.52} fill="#0C1430" />
              <circle cx={px + pr * 0.38} cy={py - pr * 0.42} r={pr * 0.3} fill="#FFFFFF" />
              <circle cx={px - pr * 0.35} cy={py + pr * 0.38} r={pr * 0.13} fill="#FFFFFF" opacity={0.8} />
              {/* верхнее веко */}
              <rect x={c.x - rx - 4} y={c.y - ry - 60} width={rx * 2 + 8} height={lidY - (c.y - ry - 60)} fill={C.bag} />
              {/* нижнее веко (прищур улыбки) */}
              {sq > 0.01 ? <ellipse cx={c.x} cy={lowY + ry * 0.95} rx={rx * 1.25} ry={ry} fill={C.bag} /> : null}
            </g>
            <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} fill="none" stroke={C.bagTrim} strokeWidth={7} />
            {/* край века */}
            {lid > 0.12 ? (
              <path d={`M ${c.x - halfAt(lidY + 2)} ${lidY + 2} Q ${c.x} ${lidY + 10} ${c.x + halfAt(lidY + 2)} ${lidY + 2}`} stroke={C.bagTrim} strokeWidth={8} strokeLinecap="round" fill="none" />
            ) : null}
            {sq > 0.05 ? (
              <path d={`M ${c.x - halfAt(lowY + 4)} ${lowY + 6} Q ${c.x} ${lowY - 10} ${c.x + halfAt(lowY + 4)} ${lowY + 6}`} stroke={C.bagTrim} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8} />
            ) : null}
          </>
        )}
        {/* бровь-нашивка */}
        <path
          d={`M ${bIn} ${by - tilt * 0.5} Q ${(bIn + bOut) / 2} ${by - 16 - browRaise * 6} ${bOut} ${by + tilt * 0.6}`}
          stroke={C.bagTrim}
          strokeWidth={17}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  };

  // ---------- рот-молния ----------
  const open = clamp(mouth.open) * (1 - closed);
  const round = clamp(mouth.round);
  const wide = clamp(mouth.wide);
  const hw = 128 * (1 - 0.33 * round * clamp(open * 3) + 0.1 * wide);
  const cy = -292;
  const smile = face.smile;
  const N = 22;
  const boundary = -hw + 2 * hw * closed; // слева от бегунка застёгнуто
  const lipPts = (sign: -1 | 1) => {
    const out: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const u = -1 + (2 * i) / N;
      const x = u * hw;
      const sh = Math.sqrt(Math.max(0, 1 - u * u));
      const mid = cy + smile * 26 * (1 - u * u) - smile * 8;
      const local = clamp((x - boundary) / 40);
      const amp = sign < 0 ? 62 * (1 - 0.25 * round) + 10 * smile : 84 * (1 - 0.1 * round);
      const y = mid + sign * open * amp * Math.pow(sh, round > 0.5 ? 0.7 : 0.9) * local;
      out.push(D(x, y));
    }
    return out;
  };
  const upper = lipPts(-1);
  const lower = lipPts(1);
  const inside = pathOf([...upper, ...[...lower].reverse()], true);
  const insideId = `${uid}-mouth`;
  const slider = D(boundary, cy + smile * 26 * (1 - (boundary / hw) ** 2) - smile * 8);
  const tabAng = 8 + swing * 1.4;

  // ---------- карман ----------
  const pocket = pathOf(
    T([
      { x: -150, y: -46 },
      { x: -160, y: -110 },
      { x: -156, y: -176 },
      { x: -120, y: -196 },
      { x: 0, y: -200 },
      { x: 120, y: -196 },
      { x: 156, y: -176 },
      { x: 160, y: -110 },
      { x: 150, y: -46 },
      { x: 0, y: -40 },
      { x: -150, y: -46 },
    ]),
    true,
  );
  const flapLift = pocketOpen * 64;
  const flap = pathOf(
    T([
      { x: -158, y: -170 },
      { x: -150, y: -204 + flapLift * 0.2 },
      { x: 0, y: -210 - flapLift * 0.15 },
      { x: 150, y: -204 + flapLift * 0.2 },
      { x: 158, y: -170 },
      { x: 120, y: -130 - flapLift },
      { x: 0, y: -122 - flapLift * 1.15 },
      { x: -120, y: -130 - flapLift },
      { x: -158, y: -170 },
    ]),
    true,
  );
  const btn = D(0, -132 - flapLift * 1.15);

  // ---------- брелок (снежный барс-звёздочка на цепочке) ----------
  const ring = D(196, -470);
  const cAng = ((swing * 1.8 + 6) * Math.PI) / 180;
  const charm = { x: ring.x + Math.sin(cAng) * 92, y: ring.y + Math.cos(cAng) * 92 };

  const k = p.s;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: p.opacity ?? 1 }}>
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${k})`}>
        {p.shadow !== false ? <ellipse cx={lean * 0.1} cy={6} rx={250 * (1 + squash * 0.05)} ry={26} fill="rgba(40,30,20,0.18)" /> : null}
        {/* лямки за телом */}
        {p.straps !== "none"
          ? ([-1, 1] as const).map((side) => (
              <g key={side}>
                <path d={strap(side)} stroke={C.bagTrim} strokeWidth={48} strokeLinecap="round" fill="none" />
                <path d={strap(side)} stroke={C.bagTrimLight} strokeWidth={8} strokeDasharray="14 12" strokeLinecap="round" fill="none" opacity={0.6} />
              </g>
            ))
          : null}
        <path d={handle} stroke={C.bagTrim} strokeWidth={24} strokeLinecap="round" fill="none" />
        {/* тело */}
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
        <path d={body} fill={C.bag} />
        <g clipPath={`url(#${clipId})`}>
          {/* объём: тень слева/справа, блик на куполе, тёмное дно */}
          <ellipse cx={D(-230, -260).x} cy={D(-230, -260).y} rx={90} ry={360} fill={C.bagShade} opacity={0.55} />
          <ellipse cx={D(240, -260).x} cy={D(240, -260).y} rx={70} ry={360} fill={C.bagShade} opacity={0.35} />
          <ellipse cx={D(-60, -520).x} cy={D(-60, -520).y} rx={110} ry={40} fill={C.bagLight} opacity={0.7} transform={`rotate(-12 ${D(-60, -520).x} ${D(-60, -520).y})`} />
          <path d={pathOf(T([{ x: -260, y: -48 }, { x: 0, y: -60 }, { x: 260, y: -48 }, { x: 260, y: 40 }, { x: -260, y: 40 }]), true)} fill={C.bagTrim} />
          {/* шов купола (главное отделение) */}
          <path
            d={pathOf(T([{ x: -196, y: -330 }, { x: -186, y: -460 }, { x: -120, y: -540 }, { x: 0, y: -556 }, { x: 120, y: -540 }, { x: 186, y: -460 }, { x: 196, y: -330 }]))}
            stroke={C.bagTrim}
            strokeWidth={9}
            fill="none"
            opacity={0.55}
          />
          <path
            d={pathOf(T([{ x: -196, y: -330 }, { x: -186, y: -460 }, { x: -120, y: -540 }, { x: 0, y: -556 }, { x: 120, y: -540 }, { x: 186, y: -460 }, { x: 196, y: -330 }]))}
            stroke={C.teeth}
            strokeWidth={4}
            strokeDasharray="4 5"
            fill="none"
            opacity={0.7}
          />
        </g>
        {/* карман с клапаном */}
        <path d={pocket} fill={C.bagPocket} stroke={C.bagTrim} strokeWidth={8} />
        {pocketOpen > 0.02 ? <path d={pathOf(T([{ x: -140, y: -168 }, { x: 0, y: -176 }, { x: 140, y: -168 }]))} stroke="#5A3D10" strokeWidth={16} strokeLinecap="round" opacity={0.55} fill="none" /> : null}
        <path d={flap} fill={C.bag} stroke={C.bagTrim} strokeWidth={8} />
        {/* орнамент «кочкор мүйүз» на клапане */}
        <g transform={`translate(${D(0, -168 - flapLift * 0.6).x} ${D(0, -168 - flapLift * 0.6).y}) scale(${0.62 * (1 - pocketOpen * 0.2)})`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.9}>
          <path d="M 0 0 C -16 0 -30 -12 -22 -26 C -16 -36 -2 -32 -4 -22" />
          <path d="M 0 0 C 16 0 30 -12 22 -26 C 16 -36 2 -32 4 -22" />
          <path d="M -40 8 L 40 8" />
        </g>
        <circle cx={btn.x} cy={btn.y} r={13} fill="#FFFFFF" stroke={C.bagTrim} strokeWidth={5} />
        {/* рот: внутренность, ленты молнии, зубчики */}
        {open > 0.015 ? (
          <>
            <clipPath id={insideId}>
              <path d={inside} />
            </clipPath>
            <path d={inside} fill={C.bagInside} />
            <g clipPath={`url(#${insideId})`}>
              {/* внутри видны тетрадь и карандаш */}
              <rect x={D(-90, cy + 40).x} y={D(-90, cy + 40).y - 30} width={120} height={90} rx={8} fill="#5B8BD6" transform={`rotate(-6 ${D(-90, cy + 40).x} ${D(-90, cy + 40).y})`} />
              <path d={`M ${D(30, cy + 70).x} ${D(30, cy + 70).y} L ${D(70, cy + 8).x} ${D(70, cy + 8).y} L ${D(92, cy + 20).x} ${D(92, cy + 20).y} L ${D(52, cy + 82).x} ${D(52, cy + 82).y} Z`} fill="#E5484D" />
              <path d={`M ${D(70, cy + 8).x} ${D(70, cy + 8).y} L ${D(86, cy - 12).x} ${D(86, cy - 12).y} L ${D(92, cy + 20).x} ${D(92, cy + 20).y} Z`} fill="#F3D3A6" />
            </g>
          </>
        ) : null}
        {[upper, lower].map((lip, i) => (
          <g key={i}>
            <path d={pathOf(lip)} stroke={C.bagTrim} strokeWidth={20} strokeLinecap="round" fill="none" />
            <path d={pathOf(lip)} stroke={C.teeth} strokeWidth={9} strokeDasharray="6 6" fill="none" />
          </g>
        ))}
        {/* бегунок молнии и язычок (качается) */}
        <g transform={`translate(${slider.x} ${slider.y})`}>
          <rect x={-16} y={-14} width={32} height={28} rx={8} fill={C.metal} stroke={C.bagTrim} strokeWidth={5} />
          <g transform={`rotate(${tabAng})`}>
            <rect x={-6} y={10} width={12} height={22} rx={4} fill={C.metal} stroke={C.bagTrim} strokeWidth={3} />
            <path d="M -20 30 L 20 30 L 14 96 Q 0 108 -14 96 Z" fill={C.yellow} stroke={C.bagTrim} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={0} cy={58} r={8} fill={C.bagTrim} />
          </g>
        </g>
        {/* румянец при улыбке */}
        {face.squint > 0.2 || face.smile > 0.6
          ? ([-1, 1] as const).map((side) => {
              const c = D(side * 150, -330);
              return <ellipse key={side} cx={c.x} cy={c.y} rx={34} ry={18} fill="#FF8A7A" opacity={0.45 * clamp(Math.max(face.squint * 1.6, (face.smile - 0.5) * 2))} />;
            })
          : null}
        {/* глаза и брови */}
        {eye(-1)}
        {eye(1)}
        {/* брелок */}
        <circle cx={ring.x} cy={ring.y} r={12} fill="none" stroke={C.metal} strokeWidth={6} />
        <path d={`M ${ring.x} ${ring.y + 10} L ${charm.x} ${charm.y - 26}`} stroke={C.metal} strokeWidth={5} strokeDasharray="8 4" />
        <g transform={`translate(${charm.x} ${charm.y}) rotate(${-swing * 1.2})`}>
          <circle r={30} fill="#FFFFFF" stroke={C.bagTrim} strokeWidth={6} />
          <path d="M 0 -17 L 5 -5 L 18 -5 L 8 3 L 12 16 L 0 8 L -12 16 L -8 3 L -18 -5 L -5 -5 Z" fill={C.yellow} stroke={C.bagTrim} strokeWidth={3} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

// Домашний кот BG-048 (серый полосатый): SVG-группа в мировых координатах.
// Точка (x, y) — середина лап на поверхности; сидя ≈ 230 px при scale 1.
// Позы: sit — сидит; crouch — готовится прыгнуть (k — покачивание);
// jump — в прыжке (вид сбоку, мордой по +x или по −x при flip); startled —
// испуг (выгнутая спина, шерсть дыбом puff, хвост «ёршиком»); loaf —
// «буханка», лапы поджаты. look — взгляд −1…1, blink — веки 0…1,
// tail — взмах хвоста −1…1, earTwitch — подёргивание уха, paw — лапа вверх.
const BODY = "#9AA3AE";
const SHADE = "#848D99";
const STRIPE = "#6F7884";
const WHITE = "#F7F4EE";
const NOSE = "#F29AA6";
const EYE = "#C9DB6A";
const INK = "#2A2F3A";

export type CatPose = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly flip?: boolean;
  readonly pose: "sit" | "crouch" | "jump" | "startled" | "loaf";
  readonly k?: number;
  readonly look?: number;
  readonly blink?: number;
  readonly tail?: number;
  readonly earTwitch?: number;
  readonly puff?: number;
  readonly paw?: number;
};

const f1 = (n: number) => n.toFixed(1);

// Голова анфас: центр (0, 0), радиус r.
const Head: React.FC<{ uid: string; r: number; look: number; blink: number; wide: number; earTwitch: number; earsBack: number }> = ({ uid, r, look, blink, wide, earTwitch, earsBack }) => {
  const eyeR = r * (0.2 + 0.07 * wide);
  const L = Math.max(0, Math.min(1, blink));
  return (
    <g>
      {/* уши */}
      {([-1, 1] as const).map((s) => {
        const tw = s === 1 ? earTwitch * 12 : 0;
        const back = earsBack * 25 * s;
        return (
          <g key={s} transform={`rotate(${f1(s * 8 + tw + back)} ${f1(s * r * 0.55)} ${f1(-r * 0.6)})`}>
            <path d={`M ${f1(s * r * 0.2)} ${f1(-r * 0.75)} L ${f1(s * r * 0.78)} ${f1(-r * 1.32)} L ${f1(s * r * 0.92)} ${f1(-r * 0.45)} Z`} fill={BODY} />
            <path d={`M ${f1(s * r * 0.38)} ${f1(-r * 0.76)} L ${f1(s * r * 0.75)} ${f1(-r * 1.12)} L ${f1(s * r * 0.82)} ${f1(-r * 0.58)} Z`} fill={NOSE} opacity={0.6} />
          </g>
        );
      })}
      <ellipse cx={0} cy={0} rx={r * 1.08} ry={r * 0.95} fill={BODY} />
      {/* полоски на лбу */}
      {[-0.32, 0, 0.32].map((dx) => (
        <path key={dx} d={`M ${f1(dx * r)} ${f1(-r * 0.9)} q ${f1(-dx * r * 0.2)} ${f1(r * 0.25)} 0 ${f1(r * 0.42)}`} stroke={STRIPE} strokeWidth={r * 0.1} strokeLinecap="round" fill="none" />
      ))}
      {/* щёки-полоски */}
      {([-1, 1] as const).map((s) => (
        <path key={s} d={`M ${f1(s * r * 1.02)} ${f1(r * 0.05)} l ${f1(-s * r * 0.22)} ${f1(r * 0.06)} M ${f1(s * r * 1.0)} ${f1(r * 0.25)} l ${f1(-s * r * 0.2)} ${f1(-r * 0.02)}`} stroke={STRIPE} strokeWidth={r * 0.08} strokeLinecap="round" />
      ))}
      {/* мордочка */}
      <ellipse cx={0} cy={r * 0.42} rx={r * 0.55} ry={r * 0.36} fill={WHITE} />
      {/* глаза */}
      {([-1, 1] as const).map((s) => {
        const ex = s * r * 0.42;
        const ey = -r * 0.05;
        const id = `${uid}-ce${s}`;
        if (L > 0.85) return <path key={s} d={`M ${f1(ex - eyeR)} ${f1(ey)} q ${f1(eyeR)} ${f1(eyeR * 0.7)} ${f1(eyeR * 2)} 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
        return (
          <g key={s}>
            <defs>
              <clipPath id={id}>
                <ellipse cx={ex} cy={ey} rx={eyeR} ry={eyeR * 1.05} />
              </clipPath>
            </defs>
            <ellipse cx={ex} cy={ey} rx={eyeR} ry={eyeR * 1.05} fill={EYE} />
            <g clipPath={`url(#${id})`}>
              <ellipse cx={ex + look * eyeR * 0.4} cy={ey} rx={eyeR * (0.28 + 0.5 * wide)} ry={eyeR * 0.85} fill={INK} />
              <circle cx={ex + look * eyeR * 0.4 - eyeR * 0.25} cy={ey - eyeR * 0.35} r={eyeR * 0.2} fill="#FFFFFF" />
              <rect x={ex - eyeR - 2} y={ey - eyeR * 1.1} width={eyeR * 2 + 4} height={eyeR * 2.2 * L} fill={BODY} />
            </g>
            <ellipse cx={ex} cy={ey} rx={eyeR} ry={eyeR * 1.05} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.6} />
          </g>
        );
      })}
      {/* нос, рот, усы */}
      <path d={`M ${f1(-r * 0.1)} ${f1(r * 0.24)} L ${f1(r * 0.1)} ${f1(r * 0.24)} L 0 ${f1(r * 0.36)} Z`} fill={NOSE} />
      <path d={`M 0 ${f1(r * 0.36)} q ${f1(-r * 0.1)} ${f1(r * 0.14)} ${f1(-r * 0.2)} ${f1(r * 0.04)} M 0 ${f1(r * 0.36)} q ${f1(r * 0.1)} ${f1(r * 0.14)} ${f1(r * 0.2)} ${f1(r * 0.04)}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      {wide > 0.4 ? <ellipse cx={0} cy={r * 0.58} rx={r * 0.1} ry={r * 0.08} fill="#7A3440" /> : null}
      {([-1, 1] as const).map((s) => (
        <g key={s} stroke="#E8E4DC" strokeWidth={2.5} strokeLinecap="round">
          <line x1={s * r * 0.35} y1={r * 0.4} x2={s * r * 1.15} y2={r * 0.28} />
          <line x1={s * r * 0.35} y1={r * 0.48} x2={s * r * 1.18} y2={r * 0.5} />
        </g>
      ))}
    </g>
  );
};

// Хвост от точки (bx, by): мягкая кривая с качанием; brush — «ёршик».
const Tail: React.FC<{ bx: number; by: number; dir: number; sway: number; up: number; brush: number; len: number }> = ({ bx, by, dir, sway, up, brush, len }) => {
  const ex = bx + dir * len * (0.55 + 0.15 * sway);
  const ey = by - len * (0.5 + 0.6 * up) + len * 0.1 * sway;
  const d = `M ${f1(bx)} ${f1(by)} C ${f1(bx + dir * len * 0.55)} ${f1(by + len * 0.05)} ${f1(bx + dir * len * (0.75 + 0.2 * sway))} ${f1(by - len * 0.3)} ${f1(ex)} ${f1(ey)}`;
  return (
    <g>
      <path d={d} stroke={BODY} strokeWidth={22 + 22 * brush} fill="none" strokeLinecap="round" />
      <path d={d} stroke={STRIPE} strokeWidth={22 + 22 * brush} fill="none" strokeLinecap="round" strokeDasharray="10 22" opacity={0.6} />
    </g>
  );
};

// Пушистый контур (шерсть дыбом): зигзаг вокруг эллипса.
const fuzz = (cx: number, cy: number, rx: number, ry: number, amp: number, n = 28) => {
  const pts: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? 1 : 1 + amp;
    pts.push(`${i === 0 ? "M" : "L"} ${f1(cx + Math.cos(a) * rx * rr)} ${f1(cy + Math.sin(a) * ry * rr)}`);
  }
  return `${pts.join(" ")} Z`;
};

export const Cat: React.FC<CatPose & { readonly uid: string }> = ({ uid, x, y, scale = 1, flip = false, pose, k = 0, look = 0, blink = 0, tail = 0, earTwitch = 0, puff = 0, paw = 0 }) => {
  const sx = flip ? -scale : scale;
  let body: React.ReactNode;
  if (pose === "jump") {
    // вид сбоку в прыжке: мордой по +x (flip — по −x)
    const stretch = Math.sin(Math.PI * Math.max(0, Math.min(1, k)));
    body = (
      <g transform={`rotate(${f1(-12 + 24 * k)} 0 -90)`}>
        <Tail bx={-80} by={-95} dir={-1} sway={tail} up={0.2} brush={0} len={90} />
        <path d={`M -70 -80 L ${f1(-120 - 30 * stretch)} ${f1(-40 + 10 * stretch)}`} stroke={BODY} strokeWidth={22} strokeLinecap="round" />
        <path d={`M 50 -90 L ${f1(105 + 35 * stretch)} ${f1(-55 - 10 * stretch)}`} stroke={BODY} strokeWidth={20} strokeLinecap="round" />
        <ellipse cx={0} cy={-95} rx={95 + 15 * stretch} ry={44} fill={BODY} />
        {[-40, -10, 20].map((dx) => (
          <path key={dx} d={`M ${dx} -136 q 8 14 0 26`} stroke={STRIPE} strokeWidth={8} fill="none" strokeLinecap="round" />
        ))}
        <ellipse cx={20} cy={-72} rx={50} ry={16} fill={WHITE} opacity={0.8} />
        <g transform="translate(108 -128)">
          <Head uid={uid} r={46} look={0.8} blink={0} wide={0.5} earTwitch={0} earsBack={0.6} />
        </g>
      </g>
    );
  } else if (pose === "startled") {
    const p = Math.max(0, Math.min(1, puff));
    body = (
      <g>
        <Tail bx={52} by={-120} dir={1} sway={0.3 * tail} up={1} brush={p} len={110} />
        {/* выгнутая спина */}
        <path d={fuzz(0, -120, 78, 70, 0.12 * p)} fill={BODY} />
        <path d="M -40 -40 L -46 -6 M -14 -40 L -16 -6 M 16 -40 L 16 -6 M 42 -40 L 46 -6" stroke={BODY} strokeWidth={22} strokeLinecap="round" />
        {[-34, -10, 14, 38].map((px) => (
          <ellipse key={px} cx={px + (px < 0 ? -6 : 4)} cy={-4} rx={14} ry={8} fill={WHITE} />
        ))}
        <ellipse cx={0} cy={-100} rx={40} ry={34} fill={WHITE} opacity={0.85} />
        <g transform="translate(0 -205)">
          <Head uid={uid} r={52} look={look} blink={0} wide={1} earTwitch={0} earsBack={1} />
        </g>
      </g>
    );
  } else if (pose === "loaf") {
    body = (
      <g>
        <Tail bx={70} by={-25} dir={-1} sway={0.25 * tail} up={-0.35} brush={0} len={120} />
        <rect x={-92} y={-100} width={184} height={100} rx={50} fill={BODY} />
        {[-50, -20, 10, 40].map((dx) => (
          <path key={dx} d={`M ${dx} -100 q 8 18 0 34`} stroke={STRIPE} strokeWidth={9} fill="none" strokeLinecap="round" />
        ))}
        <ellipse cx={-26} cy={-6} rx={22} ry={10} fill={WHITE} />
        <ellipse cx={26} cy={-6} rx={22} ry={10} fill={WHITE} />
        <g transform="translate(-30 -125)">
          <Head uid={uid} r={48} look={look} blink={blink} wide={0} earTwitch={earTwitch} earsBack={0} />
        </g>
      </g>
    );
  } else {
    // sit / crouch (анфас)
    const cr = pose === "crouch" ? 1 : 0;
    const wig = cr * 10 * Math.sin(k * Math.PI * 2);
    const bodyH = 78 - 24 * cr;
    const headY = -175 + 55 * cr;
    body = (
      <g>
        <Tail bx={48 + wig} by={-30} dir={1} sway={tail} up={0.35 - 0.3 * cr} brush={0} len={100} />
        <ellipse cx={wig * 0.5} cy={-bodyH} rx={62 + 10 * cr} ry={bodyH} fill={BODY} />
        <ellipse cx={-40 + wig * 0.5} cy={-30} rx={28} ry={34} fill={SHADE} opacity={0.5} />
        <ellipse cx={40 + wig * 0.5} cy={-30} rx={28} ry={34} fill={SHADE} opacity={0.5} />
        <ellipse cx={0} cy={-bodyH - 10} rx={34} ry={bodyH * 0.6} fill={WHITE} opacity={0.9} />
        {/* передние лапы (правая может подниматься) */}
        <ellipse cx={-22} cy={-8} rx={17} ry={10} fill={WHITE} />
        <g transform={`translate(0 ${f1(-paw * 60)}) rotate(${f1(-paw * 30)} 22 -8)`}>
          <ellipse cx={22} cy={-8} rx={17} ry={10} fill={WHITE} />
        </g>
        <g transform={`translate(0 ${f1(headY)})`}>
          <Head uid={uid} r={52} look={look} blink={blink} wide={0} earTwitch={earTwitch} earsBack={cr * 0.3} />
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${sx.toFixed(3)} ${scale.toFixed(3)})`}>
      <ellipse cx={0} cy={2} rx={80} ry={10} fill="#000000" opacity={0.12} />
      {body}
    </g>
  );
};

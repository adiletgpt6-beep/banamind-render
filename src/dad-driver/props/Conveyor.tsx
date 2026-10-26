// Роликовый конвейер — одна и та же конструкция во всех стадиях:
//   blueprint — чертёж: бирюзовые линии проявляются по частям (progress);
//   model     — настольный макет: светлые детали на деревянной подставке;
//   equipment — оборудование в цеху/на экране: та же геометрия крупнее,
//               по роликам едет коробка, ролики вращаются со скоростью
//               коробки (окружная скорость = скорость груза).
// extrude 0…1 — переход «линии → объём»: заливка граней проявляется,
// контур чертежа гаснет. Проекция — косоугольная (кабинетная): x вправо,
// y вверх, глубина z уходит вправо-вверх. Начало координат — передняя
// левая опора на полу; компонент рисуется от точки (0, 0) своего блока.
import { C } from "../kit";
import { clamp, easeInOut } from "../rig/motion";

export type ConveyorMode = "blueprint" | "model" | "equipment";

// Размеры (единицы модели).
export const CV = {
  L: 600, // длина
  W: 170, // ширина (глубина)
  H: 190, // высота верха роликов
  r: 17, // радиус ролика
  n: 7, // число роликов
  rail: 26, // высота боковины
  legs: [36, 300, 564] as readonly number[],
  motor: { x: 600, w: 70, h: 64 },
} as const;

const KX = 0.55;
const KY = 0.32;
const P = (x: number, y: number, z: number) => [x + KX * z, -y - KY * z] as const;
const pt = (x: number, y: number, z: number) => P(x, y, z).join(" ");
const poly = (pts: readonly (readonly [number, number, number])[]) => `M ${pts.map(([x, y, z]) => pt(x, y, z)).join(" L ")} Z`;

export const rollerX = (i: number) => 40 + (i * (CV.L - 80)) / (CV.n - 1);

// Габариты рисунка в единицах модели (для размещения).
export const CONVEYOR_BOX = { left: -30, right: CV.L + CV.motor.w + KX * CV.W + 30, top: -(CV.H + 120 + KY * CV.W), bottom: 40 };

type Props = {
  readonly mode: ConveyorMode;
  readonly scale?: number;
  readonly t?: number; // кадр (вращение роликов, груз)
  readonly progress?: number; // чертёж: 0…1 проявление частей
  readonly extrude?: number; // 0 — линии, 1 — объём
  readonly speed?: number; // скорость груза, ед./кадр (equipment)
  readonly box?: boolean; // груз на роликах
  readonly highlight?: "roller" | "frame" | "motor" | null; // подсветка детали
  readonly labels?: { readonly roller?: string; readonly frame?: string; readonly motor?: string; readonly at?: number };
  readonly glow?: number; // светящийся контур поверх (стиль референса)
};

export const Conveyor: React.FC<Props> = ({
  mode,
  scale = 1,
  t = 0,
  progress = 1,
  extrude,
  speed = 2.2,
  box = mode === "equipment",
  highlight = null,
  labels,
  glow = 0,
}) => {
  const ex = extrude ?? (mode === "blueprint" ? 0 : 1);
  const line = mode === "blueprint" ? 1 - ex : 0;
  const pal =
    mode === "equipment"
      ? { rail: "#8FA3B8", railTop: "#B9C8D6", railSide: "#6E8298", leg: "#2E4A66", legSide: "#22384F", roller: "#C7D2DC", rollerEnd: "#9FB0C0", motor: C.yellow, motorSide: C.yellowDeep, base: null }
      : { rail: "#E9EEF3", railTop: "#FFFFFF", railSide: "#C9D3DD", leg: "#3F8FA0", legSide: "#2F7484", roller: "#CBD5DF", rollerEnd: "#A9B7C5", motor: C.yellow, motorSide: C.yellowDeep, base: mode === "model" ? C.woodLight : null };
  // проявление частей чертежа по порядку
  const ORDER = { base: 0, legs: 1, rails: 2, rollers: 3, motor: 4, dims: 5 } as const;
  const part = (k: keyof typeof ORDER) => clamp(progress * 6 - ORDER[k]);
  const stroke = (k: keyof typeof ORDER, w = 3.2) =>
    line > 0
      ? { stroke: C.cyan, strokeWidth: w / scale, strokeOpacity: line, fill: "none", pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - easeInOut(part(k)), strokeLinejoin: "round" as const, strokeLinecap: "round" as const }
      : null;
  const fillOp = (k: keyof typeof ORDER) => ex * (mode === "blueprint" ? easeInOut(part(k)) : 1);
  const { L, W, H, r, rail } = CV;
  const travel = ((t * speed) % (L + 140)) - 120; // груз въезжает слева и уезжает вправо
  const rot = (t * speed * 180) / (Math.PI * r); // угол ролика (градусы)

  const legEls = (z: number) =>
    CV.legs.map((x) => (
      <g key={`${x}-${z}`}>
        <path d={poly([[x - 9, 0, z], [x + 9, 0, z], [x + 9, H - rail, z], [x - 9, H - rail, z]])} fill={z === 0 ? pal.leg : pal.legSide} opacity={fillOp("legs")} />
        {line ? <path d={poly([[x - 9, 0, z], [x + 9, 0, z], [x + 9, H - rail, z], [x - 9, H - rail, z]])} {...stroke("legs")} /> : null}
        {/* ножка-опора */}
        <path d={poly([[x - 18, 0, z], [x + 18, 0, z], [x + 18, 8, z], [x - 18, 8, z]])} fill={pal.legSide} opacity={fillOp("legs")} />
      </g>
    ));
  // раскосы между опорами (передняя сторона) — как ферма
  const braces = (z: number) =>
    [0, 1].map((i) => {
      const a = CV.legs[i];
      const b = CV.legs[i + 1];
      const d = `M ${pt(a + 9, 30, z)} L ${pt(b - 9, H - rail - 14, z)} M ${pt(a + 9, H - rail - 14, z)} L ${pt(b - 9, 30, z)}`;
      return (
        <g key={`br${i}${z}`}>
          <path d={d} stroke={z === 0 ? pal.leg : pal.legSide} strokeWidth={7} opacity={fillOp("legs")} fill="none" />
          {line ? <path d={d} {...stroke("legs", 2.6)} /> : null}
        </g>
      );
    });
  const railEl = (z: number, front: boolean) => {
    const d = poly([[0, H - rail, z], [L, H - rail, z], [L, H, z], [0, H, z]]);
    const top = poly([[0, H, z], [L, H, z], [L, H, z + 10], [0, H, z + 10]]);
    return (
      <g key={`rail${z}`}>
        <path d={d} fill={front ? pal.rail : pal.railSide} opacity={fillOp("rails")} />
        <path d={top} fill={pal.railTop} opacity={fillOp("rails")} />
        {highlight === "frame" && front ? <path d={d} fill="none" stroke={C.yellow} strokeWidth={6 / scale} /> : null}
        {line ? <path d={d} {...stroke("rails")} /> : null}
      </g>
    );
  };
  const rollers = Array.from({ length: CV.n }, (_, i) => {
    const x = rollerX(i);
    const y = H - 6;
    const [fx, fy] = P(x, y, 8);
    const [bx, by] = P(x, y, W - 8);
    // цилиндр вдоль z: тело — полоса между торцами, передний торец — эллипс
    const ang = Math.atan2(by - fy, bx - fx);
    const nx = -Math.sin(ang) * r;
    const ny = Math.cos(ang) * r;
    const body = `M ${fx + nx} ${fy + ny} L ${bx + nx} ${by + ny} L ${bx - nx} ${by - ny} L ${fx - nx} ${fy - ny} Z`;
    const hl = highlight === "roller" && i === 3;
    return (
      <g key={`roller${i}`}>
        <path d={body} fill={pal.roller} opacity={fillOp("rollers")} />
        <path d={`M ${fx - nx * 0.4} ${fy - ny * 0.4} L ${bx - nx * 0.4} ${by - ny * 0.4}`} stroke="#FFFFFF" strokeWidth={r * 0.35} strokeOpacity={0.55 * fillOp("rollers")} />
        <ellipse cx={fx} cy={fy} rx={r * 0.62} ry={r} fill={pal.rollerEnd} opacity={fillOp("rollers")} transform={`rotate(${(ang * 180) / Math.PI - 90} ${fx} ${fy})`} />
        {/* метка на торце — видно вращение */}
        <g transform={`translate(${fx} ${fy}) rotate(${(ang * 180) / Math.PI - 90}) scale(0.62 1) rotate(${rot})`} opacity={fillOp("rollers")}>
          <line x1={0} y1={0} x2={0} y2={-r * 0.85} stroke="#5A6B7D" strokeWidth={3.5} strokeLinecap="round" />
          <circle r={r * 0.22} fill="#5A6B7D" />
        </g>
        {hl ? <path d={body} fill="none" stroke={C.yellow} strokeWidth={6 / scale} /> : null}
        {line ? <path d={body} {...stroke("rollers", 2.6)} /> : null}
      </g>
    );
  });
  const motor = (() => {
    const m = CV.motor;
    const x0 = m.x;
    const front = poly([[x0, H - rail - 30, 0], [x0 + m.w, H - rail - 30, 0], [x0 + m.w, H - rail - 30 + m.h, 0], [x0, H - rail - 30 + m.h, 0]]);
    const side = poly([[x0 + m.w, H - rail - 30, 0], [x0 + m.w, H - rail - 30, 70], [x0 + m.w, H - rail - 30 + m.h, 70], [x0 + m.w, H - rail - 30 + m.h, 0]]);
    const top = poly([[x0, H - rail - 30 + m.h, 0], [x0 + m.w, H - rail - 30 + m.h, 0], [x0 + m.w, H - rail - 30 + m.h, 70], [x0, H - rail - 30 + m.h, 70]]);
    const [cx, cy] = P(x0 + m.w / 2, H - rail - 30 + m.h / 2, 0);
    return (
      <g>
        <path d={side} fill={pal.motorSide} opacity={fillOp("motor")} />
        <path d={front} fill={pal.motor} opacity={fillOp("motor")} />
        <path d={top} fill="#FFE38A" opacity={fillOp("motor")} />
        <circle cx={cx} cy={cy} r={14} fill="none" stroke="#7A5A1A" strokeWidth={4} opacity={fillOp("motor") * 0.8} />
        <g transform={`translate(${cx} ${cy}) rotate(${rot * 1.6})`} opacity={fillOp("motor") * 0.8}>
          <line x1={-10} y1={0} x2={10} y2={0} stroke="#7A5A1A" strokeWidth={4} />
        </g>
        {highlight === "motor" ? <path d={front} fill="none" stroke={C.cyan} strokeWidth={6 / scale} /> : null}
        {line ? (
          <>
            <path d={front} {...stroke("motor")} />
            <path d={side} {...stroke("motor")} />
          </>
        ) : null}
      </g>
    );
  })();
  // подставка макета
  const base = pal.base ? (
    <g opacity={fillOp("base")}>
      <path d={poly([[-30, -18, -20], [L + 110, -18, -20], [L + 110, 0, -20], [-30, 0, -20]])} fill={C.woodDark} />
      <path d={poly([[-30, 0, -20], [L + 110, 0, -20], [L + 110, 0, W + 30], [-30, 0, W + 30]])} fill={pal.base} />
    </g>
  ) : null;
  // размерные линии чертежа
  const dims =
    mode === "blueprint" && line > 0 ? (
      <g opacity={line * easeInOut(part("dims"))}>
        <path d={`M ${pt(0, -40, 0)} L ${pt(L, -40, 0)} M ${pt(0, -30, 0)} L ${pt(0, -50, 0)} M ${pt(L, -30, 0)} L ${pt(L, -50, 0)}`} stroke={C.cyan} strokeWidth={2 / scale} strokeDasharray={`${8 / scale} ${6 / scale}`} />
        <path d={`M ${pt(-40, 0, 0)} L ${pt(-40, H, 0)} M ${pt(-30, 0, 0)} L ${pt(-50, 0, 0)} M ${pt(-30, H, 0)} L ${pt(-50, H, 0)}`} stroke={C.cyan} strokeWidth={2 / scale} strokeDasharray={`${8 / scale} ${6 / scale}`} />
      </g>
    ) : null;
  // груз (коробка) едет по роликам
  const cargo =
    box && fillOp("rollers") > 0.5 ? (
      (() => {
        const x0 = travel;
        if (x0 < -120 || x0 > L + 20) return null;
        const bw = 110;
        const bh = 70;
        const y0 = H + r - 4;
        const front = poly([[x0, y0, 30], [x0 + bw, y0, 30], [x0 + bw, y0 + bh, 30], [x0, y0 + bh, 30]]);
        const top = poly([[x0, y0 + bh, 30], [x0 + bw, y0 + bh, 30], [x0 + bw, y0 + bh, 130], [x0, y0 + bh, 130]]);
        const side = poly([[x0 + bw, y0, 30], [x0 + bw, y0, 130], [x0 + bw, y0 + bh, 130], [x0 + bw, y0 + bh, 30]]);
        const clip = clamp((x0 + 120) / 40) * clamp((L + 20 - x0) / 40);
        return (
          <g opacity={clip}>
            <path d={side} fill="#B5835A" />
            <path d={front} fill="#D6A574" />
            <path d={top} fill="#E7BE8E" />
            <path d={`M ${pt(x0 + bw / 2, y0 + bh, 30)} L ${pt(x0 + bw / 2, y0 + bh, 130)}`} stroke="#B5835A" strokeWidth={6} />
          </g>
        );
      })()
    ) : null;
  const [lx, ly] = P(rollerX(3), H + 40, W / 2);
  const s = scale;
  const bw = CONVEYOR_BOX.right - CONVEYOR_BOX.left;
  const bh = CONVEYOR_BOX.bottom - CONVEYOR_BOX.top;
  return (
    <svg
      width={bw * s}
      height={bh * s}
      viewBox={`${CONVEYOR_BOX.left} ${CONVEYOR_BOX.top} ${bw} ${bh}`}
      style={{ position: "absolute", left: CONVEYOR_BOX.left * s, top: CONVEYOR_BOX.top * s, overflow: "visible" }}
    >
      {mode !== "blueprint" ? <ellipse cx={P(L / 2, 0, W / 2)[0]} cy={P(L / 2, 0, W / 2)[1] + 10} rx={L * 0.62} ry={60} fill="rgba(20,20,40,0.16)" /> : null}
      {base}
      {legEls(W)}
      {braces(W)}
      {railEl(W, false)}
      {rollers}
      {cargo}
      {legEls(0)}
      {braces(0)}
      {railEl(0, true)}
      {motor}
      {dims}
      {glow > 0 ? (
        <path
          d={poly([[0, H - rail, 0], [L, H - rail, 0], [L, H, 0], [L, H, W], [0, H, W], [0, H, 0]])}
          fill="none"
          stroke={C.cyan}
          strokeWidth={4 / s}
          strokeOpacity={glow}
          style={{ filter: `drop-shadow(0 0 ${8 / s}px ${C.cyan})` }}
        />
      ) : null}
      {labels ? <Labels labels={labels} lx={lx} ly={ly} scale={s} t={t} /> : null}
    </svg>
  );
};

// Подписи деталей (кыргызча) с выносными линиями.
const Labels: React.FC<{ labels: NonNullable<Props["labels"]>; lx: number; ly: number; scale: number; t: number }> = ({ labels, scale, t }) => {
  const at = labels.at ?? 0;
  const items: { text?: string; x: number; y: number; z: number; dx: number; dy: number }[] = [
    { text: labels.roller, x: rollerX(1), y: CV.H, z: CV.W * 0.6, dx: -70, dy: -150 },
    { text: labels.frame, x: CV.L * 0.55, y: CV.H - CV.rail / 2, z: 0, dx: 40, dy: 150 },
    { text: labels.motor, x: CV.motor.x + CV.motor.w / 2, y: CV.H - 30, z: 0, dx: 60, dy: -170 },
  ];
  return (
    <g>
      {items.map((it, i) => {
        if (!it.text) return null;
        const u = easeInOut((t - at - i * 8) / 10);
        if (u <= 0) return null;
        const [x, y] = P(it.x, it.y, it.z);
        const tx = x + it.dx;
        const ty = y + it.dy;
        const fs = 34 / scale;
        return (
          <g key={i} opacity={u}>
            <circle cx={x} cy={y} r={6 / scale} fill={C.yellow} />
            <path d={`M ${x} ${y} L ${tx} ${ty}`} stroke={C.yellow} strokeWidth={3 / scale} />
            <rect x={tx - (it.text.length * fs * 0.3 + 16 / scale)} y={ty - fs * 0.8} width={it.text.length * fs * 0.6 + 32 / scale} height={fs * 1.5} rx={fs * 0.4} fill="rgba(16,24,39,0.92)" stroke={C.yellow} strokeWidth={2.5 / scale} />
            <text x={tx} y={ty + fs * 0.25} textAnchor="middle" fontFamily="Nunito" fontWeight={900} fontSize={fs} fill={C.light}>
              {it.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

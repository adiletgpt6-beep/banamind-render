// Сцена 5 BG-048 «Шарттуу мисал»: тёплая доска-планер на фоне кухни.
// (a) условие, а не факт: плашка «Эгер топ түзүлсө» + «Топто — 3–4 бала»;
// (b) иллюстрированный маршрут на фоне Бишкека (Ала-Тоо, тополя,
//     многоэтажки): белая легковая машина везёт ровно троих детей (все на
//     заднем сиденье, у каждого диагональный ремень; переднее пассажирское
//     пустое) ҮЙ → МЕКТЕП утром и МЕКТЕП → ҮЙ после уроков. Дома дочь
//     встречает ПАПА (мама в этой истории на работе — встреча в 13:00):
//     он уже стоит у калитки, когда машина останавливается, дочь идёт к нему,
//     объятие — ребёнок ни секунды не один. После полной поездки — значок
//     «Биринчи толук сыноо сапары — акысыз»;
// (c) «Сыноодон кийин чечим»: палец мамы нажимает «Улантуу», и только
//     после этого — «Төлөм — чечимден кийин гана».
// Картонный пульт дочери (тот же CardboardBox, что во всём фильме) стоит
// в стороне на столе и не работает. Плашка «Шарттуу мисал» видна всю сцену.
// Всё движение — функция времени t.
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import { fontFamily } from "../fonts";
import { INK_SOFT, MARKER, NAVY, WALL, WALL_SHADE, WHITE, WOOD, WOOD_DARK, YELLOW, YELLOW_DEEP } from "../palette";
import { keys2 } from "../rig/motion";
import { B48_TEXT } from "../script";
import { backOut, clamp, ease, easeOut, prog } from "../scenes/common";
import { BOX, CardboardBox } from "../sets/Console";

export type ExampleTimes = {
  readonly dur: number;
  readonly n03: { readonly from: number; readonly to: number };
  readonly n04: { readonly from: number; readonly to: number };
  readonly freeWord: number;
  readonly decideWord: number;
};

const EX = B48_TEXT.example;
const [TRIAL_A, TRIAL_B] = EX.trial.split(" — ");

const SKIN = "#F2C9A4";
const SKIN_SHADE = "#DFA983";
const SLEEVE = "#F4C430";
const SLEEVE_SHADE = "#D9A91E";
const INK = "#2A1F24";
const SHADOW = "rgba(70,45,15,0.16)";

const f1 = (n: number) => n.toFixed(1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// 0 → 1 → 0 между a и b (синус)
const bump = (t: number, a: number, b: number) => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)));

// ---------- Тайминг сцены ----------
type Plan = ReturnType<typeof makePlan>;

const makePlan = (tm: ExampleTimes) => {
  const U0 = Math.max(1.05, tm.n03.from - 0.05); // группа уходит наверх, раскрывается картинка
  const B = Math.max(U0 + 2.4, tm.freeWord); // полная поездка завершена → «акысыз»
  const P0 = U0 + 0.85;
  const P1 = B - 0.05;
  const W = P1 - P0;
  const X0 = Math.max(B + 0.9, tm.n04.from - 0.5); // переход к выбору
  const X1 = X0 + 0.75;
  const D = Math.max(tm.decideWord, X1 + 1.5); // нажатие «Улантуу»
  return {
    U0,
    B,
    P0,
    P1,
    l1a: P0,
    l1b: P0 + 0.25 * W,
    l2a: P0 + 0.33 * W,
    l2b: P0 + 0.56 * W, // машина остановилась у дома, папа уже у калитки
    out: P0 + 0.6 * W, // девочка выходит из машины
    run0: P0 + 0.64 * W, // и идёт к папе
    hug: P1 + 0.1,
    go: P1 + 0.3, // только потом машина разворачивается и уезжает
    X0,
    X1,
    D,
    H0: Math.min(D - 0.9, Math.max(X1 + 0.6, D - 2.1)),
  };
};

// ---------- Дети: головы для аватаров и окон машины ----------
type KidV = "girl" | "boy" | "bun" | "curly";
const KIDS: Record<KidV, { readonly skin: string; readonly hair: string; readonly shirt: string; readonly bg: string }> = {
  girl: { skin: "#F4CDA8", hair: "#2E201B", shirt: "#FFFFFF", bg: "#FFE49A" },
  boy: { skin: "#EDC09A", hair: "#6B4426", shirt: "#7CB8E8", bg: "#D3E8FF" },
  bun: { skin: "#F2C9A4", hair: "#5A3A30", shirt: "#F59AB0", bg: "#FFD9E2" },
  curly: { skin: "#E3B28A", hair: "#3B2A22", shirt: "#8FD19E", bg: "#DDF2D6" },
};

const hairPath = (v: KidV, r: number): string => {
  const p = (x: number, y: number) => `${f1(x * r)} ${f1(y * r)}`;
  if (v === "boy") {
    return `M ${p(-1.02, -0.05)} C ${p(-1.05, -1.25)} ${p(1.05, -1.25)} ${p(1.02, -0.05)} C ${p(0.8, -0.5)} ${p(0.2, -0.62)} ${p(-0.2, -0.5)} L ${p(-0.1, -0.72)} C ${p(-0.45, -0.55)} ${p(-0.8, -0.45)} ${p(-1.02, -0.05)} Z`;
  }
  // девочки: чёлка с пробором
  return `M ${p(-1.04, 0.1)} C ${p(-1.08, -1.22)} ${p(1.08, -1.22)} ${p(1.04, 0.1)} C ${p(0.85, -0.38)} ${p(0.35, -0.55)} ${p(0.02, -0.46)} C ${p(-0.35, -0.58)} ${p(-0.85, -0.38)} ${p(-1.04, 0.1)} Z`;
};

const KidHead: React.FC<{ readonly v: KidV; readonly r: number; readonly look?: number }> = ({ v, r, look = 0 }) => {
  const k = KIDS[v];
  const ex = look * r * 0.12;
  return (
    <g>
      {v === "girl" ? (
        <>
          <ellipse cx={-r * 1.08} cy={r * 0.05} rx={r * 0.32} ry={r * 0.42} fill={k.hair} />
          <ellipse cx={r * 1.08} cy={r * 0.05} rx={r * 0.32} ry={r * 0.42} fill={k.hair} />
          <circle cx={-r * 0.92} cy={-r * 0.32} r={r * 0.16} fill={YELLOW} />
          <circle cx={r * 0.92} cy={-r * 0.32} r={r * 0.16} fill={YELLOW} />
        </>
      ) : null}
      {v === "bun" ? <circle cx={0} cy={-r * 1.05} r={r * 0.42} fill={k.hair} /> : null}
      <circle r={r} fill={k.skin} />
      {v === "curly" ? (
        Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI * (1.08 + (i / 6) * 0.84);
          return <circle key={i} cx={Math.cos(a) * r * 0.86} cy={Math.sin(a) * r * 0.86} r={r * 0.36} fill={k.hair} />;
        })
      ) : (
        <path d={hairPath(v, r)} fill={k.hair} />
      )}
      <circle cx={-r * 0.36 + ex} cy={r * 0.06} r={Math.max(1.6, r * 0.12)} fill={INK} />
      <circle cx={r * 0.36 + ex} cy={r * 0.06} r={Math.max(1.6, r * 0.12)} fill={INK} />
      <circle cx={-r * 0.32 + ex} cy={r * 0.01} r={Math.max(0.6, r * 0.04)} fill={WHITE} />
      <circle cx={r * 0.4 + ex} cy={r * 0.01} r={Math.max(0.6, r * 0.04)} fill={WHITE} />
      <circle cx={-r * 0.62} cy={r * 0.36} r={r * 0.17} fill="#F39A8A" opacity={0.55} />
      <circle cx={r * 0.62} cy={r * 0.36} r={r * 0.17} fill="#F39A8A" opacity={0.55} />
      <path d={`M ${f1(-r * 0.26 + ex)} ${f1(r * 0.34)} Q ${f1(ex)} ${f1(r * 0.68)} ${f1(r * 0.26 + ex)} ${f1(r * 0.34)} Z`} fill="#C0574D" />
    </g>
  );
};

// Ребёнок в окне машины: голова, плечи и диагональный ремень безопасности.
const KidBust: React.FC<{ readonly v: KidV; readonly x: number; readonly y: number; readonly r: number; readonly bob: number }> = ({ v, x, y, r, bob }) => {
  const k = KIDS[v];
  return (
    <g transform={`translate(${f1(x)} ${f1(y + bob)})`}>
      <rect x={-r * 1.2} y={r * 0.8} width={r * 2.4} height={r * 2.2} rx={r * 0.7} fill={k.shirt} stroke="#D7DEE8" strokeWidth={1} />
      {v === "girl" ? (
        <>
          <rect x={-r * 0.78} y={r * 0.9} width={r * 0.3} height={r * 2} fill="#2A3F73" />
          <rect x={r * 0.48} y={r * 0.9} width={r * 0.3} height={r * 2} fill="#2A3F73" />
        </>
      ) : null}
      <rect x={-r * 0.3} y={r * 0.6} width={r * 0.6} height={r * 0.4} fill={k.skin} />
      <KidHead v={v} r={r} />
      {/* ремень безопасности: крепление у плеча, через грудь к бедру */}
      <path d={`M ${f1(r * 1.05)} ${f1(r * 0.86)} L ${f1(-r * 0.95)} ${f1(r * 2.9)}`} stroke="#2F3542" strokeWidth={r * 0.36} strokeLinecap="round" />
      <path d={`M ${f1(r * 1.05)} ${f1(r * 0.86)} L ${f1(-r * 0.95)} ${f1(r * 2.9)}`} stroke="#8C96A8" strokeWidth={r * 0.08} strokeLinecap="round" />
      <circle cx={r * 1.08} cy={r * 0.84} r={r * 0.2} fill="#8C96A8" stroke="#2F3542" strokeWidth={r * 0.06} />
    </g>
  );
};

// Аватар ребёнка для группы (круг с головой и плечами).
const Avatar: React.FC<{ readonly v: KidV; readonly id: string; readonly r: number; readonly maybe?: boolean }> = ({ v, id, r, maybe }) => {
  const k = KIDS[v];
  return (
    <g opacity={maybe ? 0.72 : 1}>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r + 5} fill={WHITE} />
      <circle r={r} fill={k.bg} />
      <g clipPath={`url(#${id})`}>
        <rect x={-r * 0.75} y={r * 0.45} width={r * 1.5} height={r} rx={r * 0.45} fill={k.shirt} stroke="#D7DEE8" strokeWidth={1.5} />
        <g transform={`translate(0 ${f1(-r * 0.08)})`}>
          <KidHead v={v} r={r * 0.52} />
        </g>
      </g>
      {maybe ? <circle r={r + 5} fill="none" stroke={NAVY} strokeWidth={2.5} strokeDasharray="6 6" opacity={0.7} /> : null}
    </g>
  );
};

// ---------- Белая легковая машина (вид сбоку, морда вправо) ----------
// Начало координат — точка касания дороги под центром машины.
const CAR_BODY =
  "M -158 -24 L -162 -56 Q -164 -80 -150 -86 L -128 -150 Q -122 -162 -108 -162 L 28 -162 Q 42 -162 52 -152 L 104 -88 L 150 -82 Q 170 -78 170 -56 L 170 -36 Q 170 -22 156 -22 L -148 -22 Q -158 -22 -158 -24 Z";
const WIN_REAR = "M -140 -82 L -120 -144 Q -117 -150 -110 -150 L -24 -150 L -24 -82 Z";
const WIN_FRONT = "M -12 -82 L -12 -150 L 34 -150 Q 40 -150 44 -146 L 92 -88 L 92 -82 Z";
const WHEELS = [-100, 104];

const Wheel: React.FC<{ readonly x: number; readonly roll: number }> = ({ x, roll }) => (
  <g transform={`translate(${x} -28)`}>
    <circle r={28} fill="#2F3542" />
    <circle r={15} fill="#D3DAE5" />
    <g transform={`rotate(${f1(roll)})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={-2} y={-14} width={4} height={10} rx={2} fill="#8C96A8" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={5} fill="#8C96A8" />
  </g>
);

const Car: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly dir: number;
  readonly roll: number;
  readonly tilt: number;
  readonly hop: number;
  readonly girl: number;
  readonly t: number;
}> = ({ x, y, s, dir, roll, tilt, hop, girl, t }) => {
  const bob = (i: number) => 0.9 * Math.sin(t * 7.5 + i * 1.7);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${(dir * s).toFixed(3)} ${s})`}>
      <ellipse cx={0} cy={2} rx={160} ry={10} fill="#000" opacity={0.16 * (1 - Math.min(1, hop / 30))} />
      <g transform={`translate(0 ${f1(-hop)})`}>
        <g transform={`rotate(${tilt.toFixed(2)} 0 -40)`}>
          <defs>
            <clipPath id="bg48-example-car-win">
              <path d={WIN_REAR} />
              <path d={WIN_FRONT} />
            </clipPath>
            <clipPath id="bg48-example-car-well">
              <rect x={-200} y={-200} width={400} height={178} />
            </clipPath>
          </defs>
          <path d={CAR_BODY} fill={WHITE} stroke="#C5CFDD" strokeWidth={3} strokeLinejoin="round" />
          {/* нижняя тень кузова и жёлтая полоса BalaGo */}
          <path d="M -158 -40 L 170 -40 L 170 -36 Q 170 -22 156 -22 L -148 -22 Q -158 -22 -158 -24 Z" fill="#E8EDF4" />
          <rect x={-160} y={-62} width={330} height={7} rx={3} fill={YELLOW} />
          <g clipPath="url(#bg48-example-car-well)">
            {WHEELS.map((wx) => (
              <g key={wx}>
                <circle cx={wx} cy={-28} r={36} fill="#DCE2EB" />
                <circle cx={wx} cy={-28} r={33} fill="#3B4252" />
              </g>
            ))}
          </g>
          {/* салон: стекло, пассажиры */}
          <path d={WIN_REAR} fill="#D9EEFB" />
          <path d={WIN_FRONT} fill="#D9EEFB" />
          <g clipPath="url(#bg48-example-car-win)">
            {/* заднее сиденье: ровно трое детей, каждый пристёгнут */}
            <rect x={-150} y={-104} width={140} height={24} fill="#B7C7DB" />
            <KidBust v="boy" x={-111} y={-126} r={15} bob={bob(1)} />
            <KidBust v="bun" x={-77} y={-123} r={14.5} bob={bob(2)} />
            <g opacity={girl}>
              <KidBust v="girl" x={-43} y={-126} r={15} bob={bob(3)} />
            </g>
            {/* спереди только водитель (обе руки на руле); пассажирское место пустое */}
            <rect x={-4} y={-104} width={48} height={40} rx={14} fill="#4E6FA8" />
            <rect x={14} y={-112} width={10} height={10} fill="#EDC09A" />
            <circle cx={19} cy={-126} r={17} fill="#EDC09A" />
            <path d="M 2 -128 C 2 -150 36 -150 36 -128 C 30 -138 12 -140 2 -128 Z" fill="#2A211E" />
            <circle cx={25} cy={-126} r={2.2} fill={INK} />
            <circle cx={33} cy={-126} r={2.2} fill={INK} />
            <path d="M 24 -116 Q 30 -112 35 -117" stroke="#9C5A4E" strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <ellipse cx={58} cy={-106} rx={5} ry={19} fill="none" stroke="#2F3542" strokeWidth={5} transform="rotate(-18 58 -106)" />
            <path d="M 26 -98 L 50 -122" stroke="#4E6FA8" strokeWidth={9} strokeLinecap="round" />
            <path d="M 30 -90 L 60 -90" stroke="#4E6FA8" strokeWidth={9} strokeLinecap="round" />
            <circle cx={52} cy={-123} r={5.5} fill="#EDC09A" />
            <circle cx={63} cy={-90} r={5.5} fill="#EDC09A" />
          </g>
          {/* блики стекла по краям, не на лицах */}
          <path d="M -134 -88 L -128 -104 L -122 -104 L -128 -88 Z" fill={WHITE} opacity={0.55} />
          <path d="M 70 -110 L 78 -110 L 88 -98 L 80 -98 Z" fill={WHITE} opacity={0.55} />
          <path d={WIN_REAR} fill="none" stroke="#9FB0C6" strokeWidth={3} />
          <path d={WIN_FRONT} fill="none" stroke="#9FB0C6" strokeWidth={3} />
          {/* двери, ручки, фары, зеркало */}
          <path d="M -18 -82 L -18 -30 M 94 -82 Q 100 -60 96 -36 M -132 -80 L -136 -34" stroke="#C5CFDD" strokeWidth={2.5} fill="none" />
          <rect x={-46} y={-76} width={18} height={6} rx={3} fill="#AEB9C9" />
          <rect x={62} y={-76} width={18} height={6} rx={3} fill="#AEB9C9" />
          <rect x={-163} y={-74} width={9} height={22} rx={4} fill="#FF8A7A" />
          <ellipse cx={164} cy={-66} rx={7} ry={9} fill="#FFE9A8" stroke="#E0C77E" strokeWidth={2} />
          <path d="M 86 -92 L 100 -98 L 104 -88 Z" fill="#E8EDF4" stroke="#C5CFDD" strokeWidth={2} />
        </g>
        {WHEELS.map((wx) => (
          <Wheel key={wx} x={wx} roll={roll} />
        ))}
      </g>
    </g>
  );
};

// ---------- Папа и дочь (иллюстрация доски) ----------
type Arm = { readonly a1: number; readonly a2: number };
const lerpArm = (a: Arm, b: Arm, k: number): Arm => ({ a1: lerp(a.a1, b.a1, k), a2: lerp(a.a2, b.a2, k) });
const armPath = (sx: number, sy: number, arm: Arm, l1: number, l2: number) => {
  const r1 = (arm.a1 * Math.PI) / 180;
  const r2 = (arm.a2 * Math.PI) / 180;
  const ex = sx + l1 * Math.cos(r1);
  const ey = sy + l1 * Math.sin(r1);
  const hx = ex + l2 * Math.cos(r2);
  const hy = ey + l2 * Math.sin(r2);
  return { d: `M ${f1(sx)} ${f1(sy)} L ${f1(ex)} ${f1(ey)} L ${f1(hx)} ${f1(hy)}`, ex, ey, hx, hy };
};

// Папа — тот же образ, что в фильме (rig/looks.ts → dad): тёмно-синий
// джемпер с белым воротником рубашки, тёмные брюки, короткие чёрные волосы.
const DAD = {
  top: "#24407A",
  topShade: "#1B3263",
  collar: "#F4F7FC",
  pants: "#3B3F4A",
  shoe: "#2B2B2E",
  skin: "#EDC09A",
  skinShade: "#D49F79",
  hair: "#221A18",
  hairHi: "#3A2C28",
} as const;
const DAD_HEAD_Y = -172;
const dadP = (x: number, y: number) => `${f1(x * 20)} ${f1(DAD_HEAD_Y + y * 23)}`;
// короткая стрижка, аккуратная линия роста волос (как в rig/Head.tsx)
const DAD_HAIR = `M ${dadP(-1.04, 0.02)} C ${dadP(-1.12, -1.08)} ${dadP(-0.2, -1.32)} ${dadP(0.3, -1.22)} C ${dadP(0.92, -1.12)} ${dadP(1.12, -0.75)} ${dadP(1.04, 0.02)} L ${dadP(0.9, -0.24)} C ${dadP(0.82, -0.52)} ${dadP(0.5, -0.62)} ${dadP(0.1, -0.62)} C ${dadP(-0.4, -0.64)} ${dadP(-0.8, -0.52)} ${dadP(-0.9, -0.24)} Z`;

const Dad: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly l: Arm;
  readonly r: Arm;
  readonly lean: number;
  readonly look: number;
  readonly walk: number;
  readonly phase: number;
  // "hand" — только кисть ближней руки поверх дочери (объятие: рука
  // проходит за её головой, ладонь ложится на плечо спереди)
  readonly layer?: "body" | "hand";
}> = ({ x, y, l, r, lean, look, walk, phase, layer = "body" }) => {
  const sw = Math.sin(phase) * walk;
  const lift = Math.abs(Math.sin(phase)) * 2.5 * walk;
  const la = armPath(-24, -136, l, 36, 34);
  const ra = armPath(24, -136, r, 36, 34);
  const ex = look * 2.2;
  const frame = `translate(${f1(x)} ${f1(y)}) scale(0.9)`;
  const body = `rotate(${lean.toFixed(2)}) translate(0 ${f1(-lift)})`;
  if (layer === "hand") {
    const cx = lerp(ra.ex, ra.hx, 0.55);
    const cy = lerp(ra.ey, ra.hy, 0.55);
    return (
      <g transform={frame}>
        <g transform={body}>
          <path d={`M ${f1(cx)} ${f1(cy)} L ${f1(ra.hx)} ${f1(ra.hy)}`} stroke={DAD.top} strokeWidth={13} strokeLinecap="round" />
          <circle cx={ra.hx} cy={ra.hy} r={7.5} fill={DAD.skin} />
          <path d={`M ${f1(ra.hx - 4)} ${f1(ra.hy + 5)} L ${f1(ra.hx - 6)} ${f1(ra.hy + 9)}`} stroke={DAD.skinShade} strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
    );
  }
  const leg = (side: number, ang: number) => (
    <g transform={`rotate(${f1(ang)} ${side * 8} -84)`}>
      <rect x={side < 0 ? -17 : 2} y={-90} width={15} height={84} rx={6} fill={DAD.pants} />
      <ellipse cx={side * 9 + 3} cy={-5} rx={12} ry={6} fill={DAD.shoe} />
    </g>
  );
  return (
    <g transform={frame}>
      <ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={0.12} />
      <g transform={body}>
        {leg(-1, 20 * sw)}
        {leg(1, -20 * sw)}
        {/* дальняя рука — за корпусом */}
        <path d={la.d} stroke={DAD.topShade} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={la.hx} cy={la.hy} r={7.5} fill={DAD.skin} />
        {/* джемпер с резинкой, V-вырез, белый воротник рубашки */}
        <rect x={-25} y={-146} width={50} height={68} rx={15} fill={DAD.top} />
        <rect x={-24} y={-88} width={48} height={9} rx={4} fill={DAD.topShade} />
        <rect x={-6.5} y={-156} width={13} height={14} fill={DAD.skinShade} />
        <path d="M -12 -146 L 0 -124 L 12 -146 Z" fill={DAD.collar} />
        <path d="M -13 -147 L -3 -133 L 0 -139 L 3 -133 L 13 -147 Z" fill={DAD.collar} stroke="#D5DBE8" strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M -15 -145 L 0 -121 L 15 -145" stroke={DAD.topShade} strokeWidth={4} fill="none" strokeLinejoin="round" />
        {/* голова */}
        <ellipse cx={-20} cy={DAD_HEAD_Y + 2} rx={4.5} ry={6} fill={DAD.skinShade} />
        <ellipse cx={20} cy={DAD_HEAD_Y + 2} rx={4.5} ry={6} fill={DAD.skinShade} />
        <ellipse cx={0} cy={DAD_HEAD_Y} rx={20} ry={23} fill={DAD.skin} />
        <path d={DAD_HAIR} fill={DAD.hair} />
        <path d={`M ${dadP(-0.25, -0.98)} C ${dadP(0.1, -1.07)} ${dadP(0.45, -1.02)} ${dadP(0.68, -0.86)}`} stroke={DAD.hairHi} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d={`M ${f1(-11 + ex)} ${DAD_HEAD_Y - 7} L ${f1(-3 + ex)} ${DAD_HEAD_Y - 8} M ${f1(3 + ex)} ${DAD_HEAD_Y - 8} L ${f1(11 + ex)} ${DAD_HEAD_Y - 7}`} stroke={DAD.hair} strokeWidth={3} strokeLinecap="round" />
        <circle cx={-7 + ex} cy={DAD_HEAD_Y} r={2.7} fill={INK} />
        <circle cx={7 + ex} cy={DAD_HEAD_Y} r={2.7} fill={INK} />
        <circle cx={-12} cy={DAD_HEAD_Y + 8} r={4} fill="#E59684" opacity={0.4} />
        <circle cx={12} cy={DAD_HEAD_Y + 8} r={4} fill="#E59684" opacity={0.4} />
        <path d={`M ${f1(-6 + ex)} ${DAD_HEAD_Y + 10} Q ${f1(ex)} ${DAD_HEAD_Y + 16} ${f1(6 + ex)} ${DAD_HEAD_Y + 10}`} stroke="#B8695F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* ближняя рука */}
        <path d={ra.d} stroke={DAD.top} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={ra.hx} cy={ra.hy} r={7.5} fill={DAD.skin} />
      </g>
    </g>
  );
};

const Girl: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly phase: number;
  readonly run: number;
  readonly reach: number;
  readonly wave: number;
  readonly t: number;
}> = ({ x, y, phase, run, reach, wave, t }) => {
  const sw = Math.sin(phase) * run;
  const hop = Math.abs(Math.sin(phase)) * 3 * run;
  const legL = 24 * sw;
  const legR = -24 * sw;
  // руки: при ходьбе качаются, потом тянутся к папе (влево);
  // правой она машет вслед уезжающей машине
  const al = lerp(100 + 30 * sw, 188, reach);
  const ar = lerp(lerp(80 - 30 * sw, 172, reach), -64 + 18 * Math.sin(t * 11), wave);
  const arm = (sx: number, a: number) => {
    const r = (a * Math.PI) / 180;
    return { d: `M ${sx} -70 L ${f1(sx + 28 * Math.cos(r))} ${f1(-70 + 28 * Math.sin(r))}`, hx: sx + 30 * Math.cos(r), hy: -70 + 30 * Math.sin(r) };
  };
  const L = arm(-12, al);
  const R = arm(12, ar);
  return (
    <g transform={`translate(${f1(x)} ${f1(y - hop)})`}>
      <ellipse cx={0} cy={2 + hop} rx={20} ry={4} fill="#000" opacity={0.12} />
      <g transform={`rotate(${f1(legL)} -5 -38)`}>
        <rect x={-9} y={-40} width={8} height={36} rx={4} fill={SKIN} />
        <rect x={-9} y={-22} width={8} height={16} fill={WHITE} />
        <ellipse cx={-6} cy={-4} rx={7} ry={4.5} fill="#2B2B2E" />
      </g>
      <g transform={`rotate(${f1(legR)} 5 -38)`}>
        <rect x={1} y={-40} width={8} height={36} rx={4} fill={SKIN} />
        <rect x={1} y={-22} width={8} height={16} fill={WHITE} />
        <ellipse cx={6} cy={-4} rx={7} ry={4.5} fill="#2B2B2E" />
      </g>
      {/* жёлтый рюкзак за спиной */}
      <rect x={-22} y={-80} width={44} height={40} rx={12} fill={YELLOW} stroke={YELLOW_DEEP} strokeWidth={2} />
      <path d={R.d} stroke={WHITE} strokeWidth={8} strokeLinecap="round" />
      <circle cx={R.hx} cy={R.hy} r={5} fill={SKIN} />
      <path d="M -14 -76 L 14 -76 L 24 -36 L -24 -36 Z" fill="#2A3F73" />
      <rect x={-13} y={-80} width={26} height={12} rx={5} fill={WHITE} />
      <path d="M -12 -78 L -9 -60 M 12 -78 L 9 -60" stroke={YELLOW_DEEP} strokeWidth={3} strokeLinecap="round" />
      <path d={L.d} stroke={WHITE} strokeWidth={8} strokeLinecap="round" />
      <circle cx={L.hx} cy={L.hy} r={5} fill={SKIN} />
      <g transform="translate(0 -100)">
        <KidHead v="girl" r={21} look={lerp(-1 * Math.max(run, reach), 1, wave)} />
      </g>
    </g>
  );
};

// ---------- Бишкек на доске: горы, тополя, многоэтажки, дом, школа ----------
const PW = 900;
const PH = 600;
const BASE = 428; // основание зданий
const ROAD0 = 450;
const ROAD1 = 530;
const CAR_Y = 516;
const CAR_S = 0.9;
const HOME_X = 404; // остановка машины у дома
const SCHOOL_X = 726;
const DAD_X0 = 212; // утром папа у двери/калитки
const DAD_X1 = 250; // к приезду машины — у калитки на тротуаре
const GIRL_STOP = DAD_X1 + 38;
const FEET = 442;

const Poplar: React.FC<{ readonly x: number; readonly h: number; readonly w: number; readonly t: number; readonly i: number }> = ({ x, h, w, t, i }) => (
  <g transform={`translate(${x} ${BASE + 6}) rotate(${f1(1.2 * Math.sin(t * 1.1 + i * 1.9))})`}>
    <rect x={-3} y={-24} width={6} height={24} fill="#8A6A4A" />
    <path d={`M 0 ${-h} C ${w * 0.7} ${-h * 0.75} ${w * 0.62} ${-h * 0.2} 0 -18 C ${-w * 0.62} ${-h * 0.2} ${-w * 0.7} ${-h * 0.75} 0 ${-h} Z`} fill="#6DAA66" />
    <path d={`M 0 ${-h} C ${w * 0.7} ${-h * 0.75} ${w * 0.62} ${-h * 0.2} 0 -18 Z`} fill="#5A9556" />
  </g>
);

const Block: React.FC<{ readonly x: number; readonly w: number; readonly floors: number; readonly color: string; readonly seed: number }> = ({ x, w, floors, color, seed }) => {
  const fh = 21;
  const h = floors * fh + 12;
  const cols = Math.max(3, Math.floor((w - 12) / 20));
  return (
    <g transform={`translate(${x} ${BASE - h})`}>
      <rect width={w} height={h} fill={color} />
      <rect width={w} height={7} fill="#000" opacity={0.08} />
      {Array.from({ length: floors }, (_, r) =>
        Array.from({ length: cols }, (__, c) => {
          const lit = (r * 7 + c * 3 + seed) % 9 === 0;
          return <rect key={`${r}-${c}`} x={8 + c * ((w - 16) / cols) + 2} y={12 + r * fh} width={(w - 16) / cols - 6} height={11} rx={2} fill={lit ? "#FFE7A8" : "#C9D7E8"} />;
        }),
      )}
    </g>
  );
};

const House: React.FC = () => (
  <g>
    <rect x={176} y={222} width={24} height={50} fill="#C4603D" />
    <rect x={34} y={292} width={196} height={136} fill="#FFF7EA" stroke="#E5CFAF" strokeWidth={3} />
    <path d="M 14 302 L 132 206 L 250 302 Z" fill="#E07B54" stroke="#C4603D" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 14 302 L 250 302" stroke="#C4603D" strokeWidth={8} strokeLinecap="round" />
    <rect x={54} y={322} width={66} height={56} rx={5} fill="#BFE3FF" stroke={WHITE} strokeWidth={6} />
    <path d="M 87 322 L 87 378 M 54 350 L 120 350" stroke={WHITE} strokeWidth={5} />
    <rect x={52} y={378} width={70} height={8} rx={3} fill="#E5CFAF" />
    <rect x={150} y={344} width={50} height={84} rx={5} fill="#3E6DB5" />
    <rect x={158} y={354} width={34} height={26} rx={3} fill="#5C89CF" />
    <circle cx={190} cy={392} r={3.5} fill={YELLOW} />
    {/* низкий белый заборчик; калитка напротив двери */}
    {[
      [14, 136],
      [214, 266],
    ].map(([a, b]) => (
      <g key={a}>
        <rect x={a} y={408} width={b - a} height={6} rx={2} fill={WHITE} stroke="#E2D3B8" strokeWidth={1.5} />
        {Array.from({ length: Math.floor((b - a) / 13) + 1 }, (_, i) => {
          const px = a + i * ((b - a - 8) / Math.floor((b - a) / 13));
          return <path key={i} d={`M ${f1(px)} 428 L ${f1(px)} 402 L ${f1(px + 4)} 396 L ${f1(px + 8)} 402 L ${f1(px + 8)} 428 Z`} fill={WHITE} stroke="#E2D3B8" strokeWidth={1.5} strokeLinejoin="round" />;
        })}
      </g>
    ))}
    {[136, 206].map((gx) => (
      <g key={gx}>
        <rect x={gx} y={390} width={9} height={38} rx={2} fill={WHITE} stroke="#E2D3B8" strokeWidth={1.5} />
        <circle cx={gx + 4.5} cy={389} r={5} fill={YELLOW} />
      </g>
    ))}
  </g>
);

const School: React.FC = () => (
  <g>
    <rect x={604} y={292} width={272} height={136} fill="#F6E7C8" stroke="#DCC59A" strokeWidth={3} />
    <rect x={596} y={280} width={288} height={18} rx={4} fill="#7CB8E8" />
    <path d="M 690 282 L 740 236 L 790 282 Z" fill="#7CB8E8" stroke="#5B9BD0" strokeWidth={3} strokeLinejoin="round" />
    <circle cx={740} cy={264} r={14} fill={WHITE} stroke={NAVY} strokeWidth={3} />
    <path d="M 740 264 L 740 255 M 740 264 L 747 267" stroke={NAVY} strokeWidth={2.5} strokeLinecap="round" />
    {[0, 1].map((r) =>
      [0, 1, 2, 4, 5, 6].map((c) => <rect key={`${r}-${c}`} x={618 + c * 37} y={310 + r * 50} width={26} height={30} rx={3} fill="#BFE3FF" stroke={WHITE} strokeWidth={3} />),
    )}
    <rect x={720} y={370} width={40} height={58} rx={4} fill="#3E6DB5" />
    <path d="M 740 370 L 740 428" stroke="#2F5895" strokeWidth={2} />
  </g>
);

const Sun: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly t: number }> = ({ x, y, color, t }) => (
  <g transform={`translate(${f1(x)} ${f1(y)})`}>
    <circle r={68} fill={color} opacity={0.2} />
    <g transform={`rotate(${f1(t * 14)})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-4} y={-62} width={8} height={16} rx={4} fill={color} transform={`rotate(${i * 36})`} />
      ))}
    </g>
    <circle r={38} fill={color} />
    <circle cx={-10} cy={-12} r={12} fill={WHITE} opacity={0.35} />
  </g>
);

const Cloud: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s})`} opacity={0.92}>
    <ellipse cx={0} cy={0} rx={46} ry={18} fill={WHITE} />
    <circle cx={-16} cy={-10} r={18} fill={WHITE} />
    <circle cx={10} cy={-16} r={22} fill={WHITE} />
  </g>
);

const MOUNT_BACK = "M 0 300 L 60 262 L 130 284 L 220 214 L 300 262 L 390 200 L 470 250 L 560 196 L 650 248 L 740 208 L 820 252 L 900 222 L 900 440 L 0 440 Z";
const SNOW: readonly (readonly [number, number])[] = [
  [220, 214],
  [390, 200],
  [560, 196],
  [740, 208],
];
const MOUNT_FRONT = "M 0 352 L 110 306 L 210 336 L 320 300 L 440 342 L 560 310 L 690 344 L 810 314 L 900 336 L 900 440 L 0 440 Z";

type RouteState = {
  readonly carX: number;
  readonly carDir: number;
  readonly roll: number;
  readonly tilt: number;
  readonly hop: number;
  readonly girlInCar: number;
  readonly girlX: number;
  readonly girlOn: number;
  readonly girlRun: number;
  readonly girlReach: number;
  readonly girlWave: number;
  readonly dadX: number;
  readonly dadWalk: number;
  readonly dadL: Arm;
  readonly dadR: Arm;
  readonly dadLean: number;
  readonly dadHand: number;
  readonly day: number;
};

const routeState = (t: number, p: Plan): RouteState => {
  const k1 = prog(t, p.l1a, p.l1b, ease);
  const k2 = prog(t, p.l2a, p.l2b, ease);
  // после встречи машина разворачивается и уезжает вправо (за кадр),
  // не заслоняя папу с дочкой
  const k3 = interpolate(t, [p.go + 0.3, p.go + 1.05], [0, 1], { ...clamp, easing: (x) => x * x });
  const legD = SCHOOL_X - HOME_X;
  const outD = 1120 - HOME_X;
  let carX = HOME_X + legD * k1;
  if (t > p.l1b) carX = SCHOOL_X - legD * k2;
  if (t > p.go) carX = HOME_X + outD * k3;
  // развороты у школы и у дома — мультяшный «переворот» с подскоком
  const turnA = p.l1b + 0.04;
  const turnB = p.l2a - 0.02;
  const kt = prog(t, turnA, turnB, ease) - prog(t, p.go, p.go + 0.3, ease);
  const carDir = Math.cos(Math.PI * kt);
  const hop = 16 * bump(t, turnA, turnB) + 14 * bump(t, p.go, p.go + 0.3);
  const dist = legD * k1 + legD * k2 + outD * k3;
  const roll = (dist / (28 * CAR_S)) * (180 / Math.PI);
  // нос приподнимается при разгоне и кивает при остановке
  const tiltLeg = (a: number, b: number) => {
    const d = b - a;
    return -1.8 * bump(t, a, a + 0.35 * d) + 1.6 * bump(t, b - 0.3 * d, b + 0.12);
  };
  const tilt = tiltLeg(p.l1a, p.l1b) + tiltLeg(p.l2a, p.l2b) - 1.6 * bump(t, p.go + 0.3, p.go + 0.7);
  // папа выходит к калитке, пока машина едет обратно, — и уже ждёт,
  // когда она останавливается
  const dw0 = p.l2a - 0.08;
  const dw1 = p.l2b - 0.1;
  const dadX = lerp(DAD_X0, DAD_X1, prog(t, dw0, dw1, ease));
  const dadWalk = Math.min(1, 3 * bump(t, dw0, dw1));
  // дочь выходит у дома и идёт к папе (он рядом всё время)
  const girlInCar = 1 - prog(t, p.out - 0.05, p.out + 0.15);
  const girlOn = prog(t, p.out - 0.05, p.out + 0.15);
  const gk = prog(t, p.run0, p.hug, ease);
  const girlX = lerp(HOME_X + 44, GIRL_STOP, gk);
  const girlRun = Math.min(1, 3 * bump(t, p.run0 - 0.05, p.hug + 0.08));
  const girlReach = prog(t, p.hug - 0.25, p.hug + 0.1);
  // и машет вслед машине, которая уезжает только после встречи
  const girlWave = prog(t, p.go + 0.2, p.go + 0.45) * (1 - prog(t, p.go + 1.3, p.go + 1.6));
  // папа: машет утром, при ходьбе качает руками, раскрывает руки, обнимает
  const s = Math.sin(t * 12) * dadWalk;
  const IDLE_L: Arm = { a1: 100 + 16 * s, a2: 94 + 10 * s };
  const IDLE_R: Arm = { a1: 80 - 16 * s, a2: 86 - 10 * s };
  const WAVE_R: Arm = { a1: -52, a2: -96 + 20 * Math.sin(t * 11) };
  const OPEN_L: Arm = { a1: 150, a2: 168 };
  const OPEN_R: Arm = { a1: 28, a2: 6 };
  // локоть за головой дочери, ладонь — на её плече (слой "hand")
  const HUG_R: Arm = { a1: 28, a2: 101 };
  const HUG_L: Arm = { a1: 104, a2: 70 };
  // утром машет вслед машине — и опускает руку до того, как выйти к калитке
  const waveEnd = Math.min(p.l1a + 0.7, p.l2a - 0.35);
  const wave = prog(t, p.l1a - 0.5, p.l1a - 0.2) * (1 - prog(t, waveEnd, waveEnd + 0.25));
  const open = prog(t, p.out - 0.1, p.out + 0.25) * (1 - prog(t, p.hug - 0.1, p.hug + 0.2));
  const hug = prog(t, p.hug - 0.1, p.hug + 0.2);
  let dadR = lerpArm(IDLE_R, WAVE_R, wave);
  dadR = lerpArm(dadR, OPEN_R, open);
  dadR = lerpArm(dadR, HUG_R, hug);
  let dadL = lerpArm(IDLE_L, OPEN_L, open);
  dadL = lerpArm(dadL, HUG_L, hug);
  const day = prog(t, p.l1b - 0.05, p.l2a + 0.2, ease);
  return { carX, carDir, roll, tilt, hop, girlInCar, girlX, girlOn, girlRun, girlReach, girlWave, dadX, dadWalk, dadL, dadR, dadLean: 6 * hug, dadHand: prog(t, p.hug + 0.05, p.hug + 0.2), day };
};

const RouteBoard: React.FC<{ readonly t: number; readonly p: Plan }> = ({ t, p }) => {
  const st = routeState(t, p);
  const d = st.day;
  const skyTop = interpolateColors(d, [0, 1], ["#BFE2F8", "#C9DEF2"]);
  const skyBot = interpolateColors(d, [0, 1], ["#FFF4DA", "#FFE0B2"]);
  const sunC = interpolateColors(d, [0, 1], ["#FFE066", "#FFB347"]);
  const rise = prog(t, p.U0, p.l1a + 0.3, easeOut);
  const sunX = lerp(300, 704, d);
  const sunY = lerp(lerp(196, 128, rise), 206, d) - 64 * Math.sin(Math.PI * d);
  const drift = t * 9;
  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} style={{ display: "block" }}>
      <defs>
        <clipPath id="bg48-example-board-clip">
          <rect width={PW} height={PH} rx={28} />
        </clipPath>
        <linearGradient id="bg48-example-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
      </defs>
      <g clipPath="url(#bg48-example-board-clip)">
        <rect width={PW} height={PH} fill="url(#bg48-example-sky)" />
        <Sun x={sunX} y={sunY} color={sunC} t={t} />
        <Cloud x={120 + drift} y={196} s={0.9} />
        <Cloud x={560 + drift * 0.7} y={150} s={0.75} />
        <path d={MOUNT_BACK} fill="#B4C4DD" />
        {SNOW.map(([sx, sy]) => (
          <path key={sx} d={`M ${sx} ${sy} L ${sx + 26} ${sy + 22} L ${sx + 12} ${sy + 18} L ${sx} ${sy + 28} L ${sx - 12} ${sy + 18} L ${sx - 28} ${sy + 22} Z`} fill={WHITE} />
        ))}
        <path d={MOUNT_FRONT} fill="#9DB2CF" />
        <rect x={0} y={392} width={PW} height={50} fill="#CFDDB4" />
        <Block x={278} w={86} floors={9} color="#EDE3D3" seed={1} />
        <Block x={372} w={82} floors={6} color="#E2EAF3" seed={4} />
        <Block x={462} w={92} floors={8} color="#F1E5CC" seed={2} />
        <Block x={556} w={70} floors={5} color="#E6DED2" seed={6} />
        <Block x={0} w={56} floors={7} color="#E2EAF3" seed={3} />
        <Poplar x={22} h={190} w={40} t={t} i={0} />
        <Poplar x={268} h={200} w={38} t={t} i={1} />
        <Poplar x={456} h={170} w={34} t={t} i={2} />
        <Poplar x={596} h={210} w={40} t={t} i={3} />
        <Poplar x={888} h={196} w={40} t={t} i={4} />
        <House />
        <School />
        {/* тротуар, дорога, газон */}
        <rect x={0} y={BASE} width={PW} height={ROAD0 - BASE} fill="#EADBC2" />
        {Array.from({ length: 19 }, (_, i) => (
          <rect key={i} x={i * 50} y={BASE} width={2} height={ROAD0 - BASE} fill="#D9C7A8" />
        ))}
        <rect x={0} y={ROAD0} width={PW} height={ROAD1 - ROAD0} fill="#8C95A5" />
        <rect x={0} y={ROAD0} width={PW} height={6} fill="#D7DDE6" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 84 + 10} y={488} width={44} height={6} rx={3} fill={WHITE} opacity={0.85} />
        ))}
        <rect x={0} y={ROAD1} width={PW} height={PH - ROAD1} fill="#BFDBA0" />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${i * 58 + 20} ${ROAD1 + 22 + (i % 3) * 12} l 5 -10 l 5 10`} stroke="#9CC47C" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
        <Dad x={st.dadX} y={FEET} l={st.dadL} r={st.dadR} lean={st.dadLean} look={st.girlOn > 0.5 ? 1 : 0.6} walk={st.dadWalk} phase={t * 12} />
        {st.girlOn > 0.01 ? (
          <g opacity={st.girlOn}>
            <Girl x={st.girlX} y={FEET + 2} phase={t * 13} run={st.girlRun} reach={st.girlReach} wave={st.girlWave} t={t} />
          </g>
        ) : null}
        {st.dadHand > 0 ? (
          <g opacity={st.dadHand}>
            <Dad x={st.dadX} y={FEET} l={st.dadL} r={st.dadR} lean={st.dadLean} look={1} walk={0} phase={0} layer="hand" />
          </g>
        ) : null}
        {st.carX < 1080 ? <Car x={st.carX} y={CAR_Y} s={CAR_S} dir={st.carDir} roll={st.roll} tilt={st.tilt} hop={st.hop} girl={st.girlInCar} t={t} /> : null}
      </g>
    </svg>
  );
};

// ---------- Картонный пульт дочери (неактивный, в стороне) ----------
// Тот же CardboardBox, что во всём фильме: из мировых координат кухни
// (BOX.x…BOX.x+BOX.w, BOX.y…BOX.y+BOX.h; клапаны и антенна до ≈BOX.y−128)
// переносится в левый нижний угол стола в масштабе 0,75. Не работает:
// кнопки не горят, антенна лишь чуть покачивается.
const CONSOLE_S = 0.75;
const CONSOLE_LEFT = 96; // левый край коробки на экране
const CONSOLE_BOTTOM = 1640; // дно коробки на столе
const CONSOLE_TX = CONSOLE_LEFT - BOX.x * CONSOLE_S;
const CONSOLE_TY = CONSOLE_BOTTOM - (BOX.y + BOX.h) * CONSOLE_S;

const IdleConsole: React.FC<{ readonly t: number }> = ({ t }) => (
  <g transform={`translate(${f1(CONSOLE_TX)} ${f1(CONSOLE_TY)}) scale(${CONSOLE_S})`}>
    <CardboardBox appear={1} t={t * 0.4} />
  </g>
);

// ---------- Фон: кухня + доска-планер ----------
const Backdrop: React.FC<{ readonly t: number }> = ({ t }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="bg48-example-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FDF5E6" />
        <stop offset="0.7" stopColor={WALL} />
        <stop offset="1" stopColor={WALL_SHADE} />
      </linearGradient>
      <pattern id="bg48-example-dots" width={36} height={36} patternUnits="userSpaceOnUse">
        <circle cx={18} cy={18} r={2.2} fill="#EADBC0" />
      </pattern>
      <linearGradient id="bg48-example-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D69A63" />
        <stop offset="1" stopColor={WOOD} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#bg48-example-wall)" />
    {/* кафельный фартук кухни */}
    <g opacity={0.55}>
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 10 }, (__, c) => (
          <rect key={`${r}-${c}`} x={c * 112 - (r % 2) * 56 + 4} y={1372 + r * 54} width={104} height={46} rx={6} fill={WHITE} stroke="#EBDCC2" strokeWidth={2} />
        )),
      )}
    </g>
    {/* доска-планер */}
    <rect x={56} y={362} width={976} height={996} rx={46} fill="#000" opacity={0.07} />
    <rect x={50} y={352} width={980} height={992} rx={46} fill="#FFFAF0" stroke="#EAD8B6" strokeWidth={3} />
    <rect x={50} y={352} width={980} height={992} rx={46} fill="url(#bg48-example-dots)" opacity={0.7} />
    <rect x={60} y={334} width={120} height={36} rx={4} fill={YELLOW} opacity={0.75} transform="rotate(-8 120 352)" />
    <rect x={900} y={334} width={120} height={36} rx={4} fill={YELLOW} opacity={0.75} transform="rotate(8 960 352)" />
    {/* стол */}
    <rect x={0} y={1586} width={1080} height={334} fill="url(#bg48-example-wood)" />
    <rect x={0} y={1586} width={1080} height={10} fill="#E3B07C" />
    {[1640, 1700, 1790, 1860].map((gy, i) => (
      <path key={gy} d={`M ${i * 60} ${gy} C 300 ${gy - 14} 640 ${gy + 14} 1080 ${gy - 6}`} stroke={WOOD_DARK} strokeWidth={3} fill="none" opacity={0.22} />
    ))}
    {/* стакан с фломастерами дочери */}
    <g transform="translate(860 1520)">
      <rect x={-8} y={-40} width={10} height={60} rx={4} fill={YELLOW} transform="rotate(-10)" />
      <rect x={10} y={-50} width={10} height={70} rx={4} fill="#E8574A" />
      <rect x={26} y={-38} width={10} height={60} rx={4} fill={MARKER} transform="rotate(9 30 0)" />
      <path d="M -24 0 L 50 0 L 44 110 L -18 110 Z" fill="#7CB8E8" stroke="#5B9BD0" strokeWidth={3} strokeLinejoin="round" />
    </g>
    <IdleConsole t={t} />
  </svg>
);

// ---------- Мелкие иконки ----------
const SunIcon: React.FC<{ readonly color: string; readonly low?: boolean }> = ({ color, low }) => (
  <svg width={46} height={46} viewBox="0 0 46 46">
    {low ? <rect x={2} y={34} width={42} height={5} rx={2.5} fill="#9DB2CF" /> : null}
    <g transform={`translate(23 ${low ? 30 : 23})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-2} y={-21} width={4} height={7} rx={2} fill={color} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={11} fill={color} />
    </g>
  </svg>
);

const Arrow: React.FC<{ readonly k: number }> = ({ k }) => (
  <svg width={64} height={30} viewBox="0 0 64 30">
    <path d="M 4 15 H 54 M 42 5 L 56 15 L 42 25" stroke="#C3CAD8" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 4 15 H 54" stroke={YELLOW_DEEP} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="50 60" strokeDashoffset={f1(50 * (1 - k))} />
    <path d="M 42 5 L 56 15 L 42 25" stroke={YELLOW_DEEP} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.97 ? 1 : 0} />
  </svg>
);

const Wallet: React.FC = () => (
  <svg width={64} height={56} viewBox="0 0 64 56">
    <rect x={4} y={12} width={50} height={38} rx={9} fill={NAVY} />
    <rect x={8} y={6} width={38} height={12} rx={5} fill="#3A5A96" />
    <rect x={36} y={24} width={22} height={16} rx={6} fill="#3A5A96" />
    <circle cx={45} cy={32} r={3.5} fill={YELLOW} />
    <circle cx={50} cy={14} r={11} fill={YELLOW} stroke={YELLOW_DEEP} strokeWidth={2.5} />
    <path d="M 50 8 V 20" stroke={YELLOW_DEEP} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

const Sparkle: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly o: number; readonly color?: string }> = ({ x, y, s, o, color = YELLOW }) => (
  <path
    d="M 0 -14 C 2 -4 4 -2 14 0 C 4 2 2 4 0 14 C -2 4 -4 2 -14 0 C -4 -2 -2 -4 0 -14 Z"
    transform={`translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(2)})`}
    fill={color}
    opacity={o}
  />
);

// ---------- Рука мамы (жёлтый рукав кардигана) ----------
// Кончик пальца — в начале координат, рука уходит вниз-вправо.
const Finger: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(-24) scale(${s.toFixed(3)})`}>
    <rect x={-26} y={168} width={112} height={900} rx={40} fill={SLEEVE} />
    <rect x={56} y={180} width={30} height={880} rx={14} fill={SLEEVE_SHADE} opacity={0.55} />
    {[0, 26, 52].map((dx) => (
      <rect key={dx} x={-6 + dx} y={230} width={4} height={600} rx={2} fill={SLEEVE_SHADE} opacity={0.35} />
    ))}
    <rect x={-30} y={146} width={120} height={46} rx={18} fill="#E8B523" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={-20 + i * 16} y={150} width={4} height={38} rx={2} fill={SLEEVE_SHADE} opacity={0.6} />
    ))}
    <rect x={-18} y={64} width={92} height={96} rx={34} fill={SKIN} />
    <circle cx={30} cy={70} r={15} fill={SKIN} />
    <circle cx={52} cy={74} r={14} fill={SKIN} />
    <circle cx={68} cy={84} r={12} fill={SKIN} />
    <path d="M 18 82 Q 30 92 42 84 M 44 88 Q 54 96 62 92" stroke={SKIN_SHADE} strokeWidth={3} fill="none" strokeLinecap="round" />
    <rect x={-13} y={0} width={26} height={100} rx={13} fill={SKIN} />
    <rect x={-7} y={5} width={14} height={16} rx={6} fill="#F8DCC4" />
    <path d="M -2 58 Q 4 62 10 58" stroke={SKIN_SHADE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    <path d="M -26 104 Q -34 128 -14 140 L 4 132 Q -8 120 -4 104 Z" fill="#EBBB95" />
  </g>
);

// ---------- Сцена ----------
const pill: React.CSSProperties = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  fontFamily,
  color: NAVY,
};

export const ExampleStory: React.FC<{ readonly t: number; readonly times: ExampleTimes }> = ({ t, times }) => {
  const p = makePlan(times);

  // (a) группа детей
  const AV = [
    { v: "girl" as const, fx: -340, fy: -300 },
    { v: "boy" as const, fx: -150, fy: 330 },
    { v: "bun" as const, fx: 170, fy: -320 },
    { v: "curly" as const, fx: 380, fy: 260 },
  ];
  // с первого кадра: аватарки детей уже видны и слетаются в «группу»
  const chipBg = prog(t, 0.15, 0.5, easeOut);
  const chipTxt = prog(t, 0.3, 0.7, easeOut);
  const up = prog(t, p.U0, p.U0 + 0.5, ease);
  const chipOut = prog(t, p.X0, p.X0 + 0.35);
  const chipY = lerp(800, 412, up) - 30 * chipOut;
  const chipS = lerp(1.2, 1, up);

  // (b) картинка маршрута
  const boardIn = prog(t, p.U0 + 0.25, p.U0 + 0.85, easeOut);
  const sh = prog(t, p.X0, p.X1, ease);
  const boardS = lerp(0.9 + 0.1 * boardIn, 0.58, sh);
  const boardY = lerp(40 * (1 - boardIn), -234, sh);
  const labelsO = boardIn * (1 - sh);
  const amIn = prog(t, p.U0 + 0.55, p.U0 + 0.95, easeOut);
  const sw = prog(t, p.l1b, p.l1b + 0.35);
  const stripO = prog(t, p.U0 + 0.6, p.U0 + 1.0, easeOut) * (1 - prog(t, p.X0, p.X0 + 0.35));
  const leg1 = prog(t, p.l1a, p.l1b, ease);
  const leg2 = prog(t, p.l2a, p.l2b, ease);

  // значок «акысыз»
  const pop = interpolate(t, [p.B, p.B + 0.45], [0, 1], { ...clamp, easing: backOut });
  const badgeO = prog(t, p.B, p.B + 0.2);
  const bm = prog(t, p.X0 + 0.05, p.X1 - 0.05, ease);
  const badgeY = lerp(1252, 780, bm);
  const badgeS = (0.55 + 0.45 * pop) * lerp(1, 0.88, bm);
  const spark = prog(t, p.B + 0.1, p.B + 1.1, easeOut);

  // (c) решение
  const capIn = prog(t, p.X1 - 0.1, p.X1 + 0.35, easeOut);
  const swoosh = prog(t, p.X1 + 0.1, p.X1 + 0.6, ease);
  const b1 = interpolate(t, [p.X1 + 0.1, p.X1 + 0.55], [0, 1], { ...clamp, easing: backOut });
  const b2 = interpolate(t, [p.X1 + 0.22, p.X1 + 0.67], [0, 1], { ...clamp, easing: backOut });
  const D = p.D;
  const press = bump(t, D - 0.1, D + 0.18);
  const chosen = prog(t, D, D + 0.3);
  const breatheYes = t < D ? 1 + 0.018 * Math.sin((t - p.X1) * 4.2) * prog(t, p.X1 + 0.7, p.X1 + 1.1) : 1;
  // рука входит, «раздумывает» между кнопками (если есть время) и нажимает
  const arrive = p.H0 + 0.6;
  const think: readonly (readonly [number, number, number])[] =
    D - 0.16 - arrive >= 0.9
      ? [
          [arrive + 0.4, 690, 1160],
          [D - 0.5, 560, 1175],
        ]
      : [];
  const [fx, fy] = keys2(
    t,
    [
      [p.H0, 760, 2160],
      [arrive, 600, 1190],
      ...think,
      [D - 0.16, 476, 1064],
      [D, 464, 1044],
      [D + 0.28, 478, 1072],
      [D + 1.05, 700, 2200],
    ],
    ease,
  );
  const handOn = t > p.H0 && t < D + 1.1;
  const ripple = prog(t, D, D + 0.6, easeOut);
  const payIn = prog(t, D + 0.45, D + 0.9, easeOut);

  const BTN_Y = 965;
  const BTN_H = 140;

  return (
    <AbsoluteFill style={{ background: WALL, overflow: "hidden" }}>
      <Backdrop t={t} />

      {/* картинка маршрута на доске */}
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 478,
          width: 924,
          height: 624,
          boxSizing: "border-box",
          padding: 12,
          borderRadius: 40,
          background: WHITE,
          boxShadow: "0 18px 44px rgba(90,60,20,0.18)",
          opacity: boardIn,
          transform: `translateY(${f1(boardY)}px) scale(${boardS.toFixed(4)}) rotate(${f1(-2 * (1 - boardIn))}deg)`,
          transformOrigin: "50% 50%",
        }}
      >
        <RouteBoard t={t} p={p} />
        {/* подписи ҮЙ / МЕКТЕП */}
        {[
          { x: 138, text: EX.route[0] },
          { x: 738, text: EX.route[1] },
        ].map((l) => (
          <div
            key={l.x}
            style={{
              ...pill,
              left: 12 + l.x,
              top: 12 + 538,
              transform: "translate(-50%, -50%)",
              height: 56,
              padding: "0 26px",
              borderRadius: 28,
              background: WHITE,
              fontSize: 38,
              fontWeight: 1000,
              boxShadow: `0 6px 14px ${SHADOW}`,
              opacity: labelsO,
            }}
          >
            {l.text}
          </div>
        ))}
        {/* утро / после уроков */}
        {[
          { text: EX.am, o: (1 - sw) * amIn, icon: <SunIcon color="#F2B705" />, dy: -14 * sw },
          { text: EX.pm, o: sw * amIn, icon: <SunIcon color="#F59A2E" low />, dy: 14 * (1 - sw) },
        ].map((c) => (
          <div
            key={c.text}
            style={{
              ...pill,
              left: 36,
              top: 30,
              height: 64,
              gap: 10,
              padding: "0 26px 0 14px",
              borderRadius: 32,
              background: "rgba(255,255,255,0.95)",
              fontSize: 38,
              fontWeight: 900,
              boxShadow: `0 6px 16px ${SHADOW}`,
              opacity: c.o * (1 - sh),
              transform: `translateY(${f1(c.dy)}px)`,
            }}
          >
            {c.icon}
            {c.text}
          </div>
        ))}
        <div
          style={{
            ...pill,
            right: 36,
            top: 30,
            height: 58,
            gap: 8,
            padding: "0 22px 0 14px",
            borderRadius: 29,
            background: "rgba(255,255,255,0.9)",
            fontSize: 34,
            fontWeight: 900,
            color: INK_SOFT,
            boxShadow: `0 6px 16px ${SHADOW}`,
            opacity: amIn * (1 - sh),
          }}
        >
          <svg width={34} height={26} viewBox="0 0 34 26">
            <path d="M 1 25 L 11 9 L 16 15 L 22 4 L 33 25 Z" fill="#9DB2CF" />
            <path d="M 22 4 L 26 11 L 22 9 L 19 10 Z" fill={WHITE} />
          </svg>
          {B48_TEXT.magnet}
        </div>
      </div>

      {/* маршрут одной полной поездки: ҮЙ → МЕКТЕП → ҮЙ */}
      <div style={{ ...pill, left: 0, right: 0, top: 1112, height: 62, gap: 12, opacity: stripO, transform: `translateY(${f1(16 * (1 - stripO))}px)` }}>
        {EX.route.map((r, i) => {
          const reached = i === 0 ? 1 : i === 1 ? (leg1 > 0.98 ? 1 : 0) : leg2 > 0.98 ? 1 : 0;
          const here = i === 0 ? t < p.l1a + 0.1 || leg2 > 0.98 : i === 1 ? leg1 > 0.98 && t < p.l2a + 0.1 : leg2 > 0.98;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {i > 0 ? <Arrow k={i === 1 ? leg1 : leg2} /> : null}
              <div
                style={{
                  height: 62,
                  padding: "0 26px",
                  borderRadius: 31,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 36,
                  fontWeight: 1000,
                  background: here ? YELLOW : reached ? "#FFF1C2" : WHITE,
                  border: `3px solid ${here || reached ? YELLOW_DEEP : "#E3E7EF"}`,
                  boxShadow: `0 5px 12px ${SHADOW}`,
                }}
              >
                {r}
              </div>
            </div>
          );
        })}
      </div>

      {/* (a) группа детей */}
      <div
        style={{
          ...pill,
          left: 540,
          top: chipY,
          height: 100,
          transform: `translate(-50%, -50%) scale(${chipS.toFixed(4)})`,
          opacity: 1 - chipOut,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 50,
            background: WHITE,
            border: `4px solid ${YELLOW}`,
            boxShadow: `0 10px 24px ${SHADOW}`,
            opacity: chipBg,
            transform: `scale(${(0.85 + 0.15 * chipBg).toFixed(3)})`,
          }}
        />
        <svg width={236} height={88} viewBox="0 0 236 88" style={{ position: "relative", overflow: "visible", marginLeft: 10 }}>
          {AV.map((a, i) => {
            const k = prog(t, 0 + 0.06 * i, 0.55 + 0.06 * i, easeOut);
            const sc = 1 + 0.5 * (1 - k);
            return (
              <g key={a.v} transform={`translate(${f1(42 + i * 52 + a.fx * (1 - k))} ${f1(44 + a.fy * (1 - k))}) scale(${sc.toFixed(3)})`}>
                <Avatar v={a.v} id={`bg48-example-av-${i}`} r={30} maybe={i === 3} />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.08,
            paddingLeft: 8,
            paddingRight: 38,
            maxWidth: 560 * chipTxt,
            overflow: "hidden",
            opacity: chipTxt,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 900 }}>{EX.group}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: INK_SOFT }}>{EX.groupNote}</div>
        </div>
      </div>

      {/* значок «Биринчи толук сыноо сапары — акысыз» */}
      {badgeO > 0 ? (
        <div
          style={{
            ...pill,
            left: 540,
            top: badgeY,
            width: 800,
            height: 132,
            flexDirection: "column",
            borderRadius: 34,
            background: YELLOW,
            border: `4px solid ${YELLOW_DEEP}`,
            boxShadow: "0 14px 30px rgba(140,90,0,0.25)",
            opacity: badgeO,
            transform: `translate(-50%, -50%) scale(${badgeS.toFixed(4)}) rotate(-1.5deg)`,
            lineHeight: 1.05,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 900 }}>{`${TRIAL_A} —`}</div>
          <div style={{ fontSize: 64, fontWeight: 1000, letterSpacing: 1 }}>{TRIAL_B}</div>
          <svg width={800} height={132} viewBox="0 0 800 132" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <Sparkle x={-6 - 26 * spark} y={10 - 14 * spark} s={1.3} o={bump(spark, 0, 1)} />
            <Sparkle x={806 + 24 * spark} y={24 - 16 * spark} s={1.1} o={bump(spark, 0, 1)} />
            <Sparkle x={70 - 10 * spark} y={140 + 18 * spark} s={0.9} o={bump(spark, 0.1, 1)} color={WHITE} />
            <Sparkle x={730 + 12 * spark} y={142 + 16 * spark} s={0.9} o={bump(spark, 0.1, 1)} color={WHITE} />
          </svg>
        </div>
      ) : null}

      {/* (c) «Сыноодон кийин чечим» */}
      {capIn > 0 ? (
        <div style={{ ...pill, left: 0, right: 0, top: 866, height: 76, opacity: capIn, transform: `translateY(${f1(20 * (1 - capIn))}px)` }}>
          <div style={{ position: "relative", padding: "0 18px" }}>
            <div
              style={{
                position: "absolute",
                left: 4,
                bottom: 6,
                height: 24,
                width: `${f1(100 * swoosh)}%`,
                borderRadius: 12,
                background: YELLOW,
                opacity: 0.75,
              }}
            />
            <div style={{ position: "relative", fontSize: 58, fontWeight: 1000 }}>{B48_TEXT.captions.example}</div>
          </div>
        </div>
      ) : null}

      {/* кнопки выбора */}
      {b1 > 0 ? (
        <>
          <div
            style={{
              ...pill,
              left: 160,
              top: BTN_Y,
              width: 360,
              height: BTN_H,
              gap: 14,
              borderRadius: 40,
              background: YELLOW,
              fontSize: 56,
              fontWeight: 1000,
              boxShadow: `0 ${f1(12 - 9 * press)}px 0 ${YELLOW_DEEP}, 0 ${f1(20 - 10 * press)}px 30px rgba(140,90,0,${(0.28 - 0.1 * press).toFixed(2)})${
                chosen > 0 ? `, 0 0 0 ${f1(8 * chosen)}px rgba(255,255,255,0.95), 0 0 0 ${f1(16 * chosen)}px rgba(247,197,49,0.45)` : ""
              }`,
              opacity: Math.min(1, b1 * 2),
              transform: `translateY(${f1(9 * press)}px) scale(${(b1 * breatheYes * (1 - 0.03 * press)).toFixed(4)})`,
            }}
          >
            {EX.yes}
            <svg width={40} height={40} viewBox="0 0 40 40">
              <path d="M 6 20 H 32 M 22 9 L 33 20 L 22 31" stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div
            style={{
              ...pill,
              left: 560,
              top: BTN_Y,
              width: 360,
              height: BTN_H,
              borderRadius: 40,
              background: WHITE,
              border: `4px solid #D3DAE6`,
              boxSizing: "border-box",
              fontSize: 54,
              fontWeight: 900,
              boxShadow: `0 12px 0 #D3DAE6, 0 20px 30px ${SHADOW}`,
              opacity: Math.min(1, b2 * 2) * (1 - 0.35 * chosen),
              transform: `scale(${b2.toFixed(4)})`,
            }}
          >
            {EX.no}
          </div>
        </>
      ) : null}

      {/* только после выбора: «Төлөм — чечимден кийин гана» */}
      {payIn > 0 ? (
        <div style={{ ...pill, left: 0, right: 0, top: 1164, height: 96, opacity: payIn, transform: `translateY(${f1(24 * (1 - payIn))}px)` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              height: 96,
              padding: "0 34px 0 22px",
              borderRadius: 48,
              background: WHITE,
              border: "3px solid #EADCC2",
              boxShadow: `0 10px 24px ${SHADOW}`,
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            <Wallet />
            {EX.pay}
          </div>
        </div>
      ) : null}

      {/* палец мамы и мягкая волна нажатия */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {t > D && ripple < 1 ? (
          <>
            <circle cx={464} cy={BTN_Y + BTN_H / 2} r={30 + 120 * ripple} fill="none" stroke={WHITE} strokeWidth={8} opacity={0.85 * (1 - ripple)} />
            <circle cx={464} cy={BTN_Y + BTN_H / 2} r={20 + 80 * ripple} fill="none" stroke={YELLOW_DEEP} strokeWidth={5} opacity={0.6 * (1 - ripple)} />
          </>
        ) : null}
        {handOn ? <Finger x={fx} y={fy} s={1 - 0.05 * press} /> : null}
      </svg>

      {/* «Шарттуу мисал» — вся сцена */}
      <div
        style={{
          ...pill,
          left: 540,
          top: 290,
          height: 80,
          gap: 14,
          padding: "0 38px 0 26px",
          borderRadius: 40,
          background: NAVY,
          color: WHITE,
          fontSize: 44,
          fontWeight: 900,
          transform: "translate(-50%, -50%)",
          boxShadow: "0 10px 24px rgba(19,42,85,0.28)",
          border: `3px dashed rgba(255,255,255,0.55)`,
          outline: `4px solid ${NAVY}`,
        }}
      >
        <svg width={44} height={34} viewBox="0 0 44 34">
          <path d="M 22 7 C 15 2 7 2 2 4 L 2 29 C 7 27 15 27 22 32 Z" fill={YELLOW} />
          <path d="M 22 7 C 29 2 37 2 42 4 L 42 29 C 37 27 29 27 22 32 Z" fill="#FFE08A" />
          <path d="M 22 7 V 31" stroke={NAVY} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M 8 11 C 12 10 15 10 18 12 M 8 17 C 12 16 15 16 18 18 M 26 12 C 29 10 32 10 36 11 M 26 18 C 29 16 32 16 36 17" stroke={YELLOW_DEEP} strokeWidth={2} strokeLinecap="round" fill="none" />
        </svg>
        {EX.label}
      </div>
    </AbsoluteFill>
  );
};


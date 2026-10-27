// Сад ролика 80-1-2: отдельные объясняющие планы, связанные с доской.
// Одна и та же яблоня (A) на одном месте во всех планах; рядом — вторая
// яблоня (B) для опыления. Мир сада 3840×2160, камера — окно на него
// (как в комнате). Поверх — условные графические акценты: разрез почвы,
// дождь, синие стрелки воды, полив из лейки. Ничего не «возникает из
// пустоты»: дерево меняется только возрастом и сезоном.
import React from "react";
import { OUTLINE } from "../../lesson01/rig/looks";
import { hash01 } from "../../lesson01/rig/geom";
import { AppleTree, LEAF, Roots, rootPathsToTrunk, type Season, SoilSeed, Sprout, type TreeState, YoungPlant } from "./tree";

const f = (n: number) => n.toFixed(1);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const GARDEN = { w: 3840, h: 2160, ground: 1300 } as const;
export const TREE_A = { x: 1600, y: 1300 } as const;
export const TREE_B = { x: 2980, y: 1285 } as const;
export const ROOT_S = 1.35; // масштаб корней в разрезе
export const CUT = { x0: 1000, x1: 2200, y0: 1300, y1: 1960 } as const;

export type GardenCam = { cx: number; cy: number; w: number };

export type Growth =
  | { stage: "seed"; crack: number }
  | { stage: "sprout"; g: number }
  | { stage: "young"; g: number }
  | { stage: "tree"; s: number };

export type GardenState = {
  t: number;
  season: Season;
  treeA: TreeState;
  treeAScale?: number;
  growth?: Growth; // ранние стадии вместо взрослого дерева A
  treeB?: TreeState | null;
  cut?: number; // разрез почвы 0…1
  roots?: number; // видимость корней 0…1
  rain?: number; // сила дождя 0…1
  wet?: number; // влажность почвы 0…1
  soilWater?: number; // капельки воды в почве 0…1
  arrows?: number; // стрелки «вода → корни → ствол» 0…1 (видимость)
  arrowT?: number; // время движения стрелок
  watering?: number; // полив из лейки 0…1 (0 — нет)
  snow?: number;
  dim?: number; // лёгкое затемнение (смена времени)
  warmth?: number; // тёплый вечерний оттенок (смена времени)
  seedCut?: number; // маленький разрез почвы у семечка (стадии роста)
};

const SKY: Record<Season, [string, string]> = {
  summer: ["#8ec3e6", "#d9eef7"],
  spring: ["#9fcdea", "#e4f3f8"],
  autumn: ["#9fbdd6", "#efe4cf"],
  winter: ["#b9c9d6", "#eef2f5"],
};
const MEADOW: Record<Season, [string, string]> = {
  summer: ["#9cc47e", "#86b56b"],
  spring: ["#a9d38c", "#93c477"],
  autumn: ["#bdb56e", "#a8a35c"],
  winter: ["#eef2f4", "#e2e8ec"],
};

const Mountains: React.FC<{ base: number; season: Season }> = ({ base, season }) => {
  const w = GARDEN.w;
  const snowy = season === "winter";
  return (
    <g>
      <path
        d={`M 0 ${base} L 0 ${base - 260} L ${w * 0.12} ${base - 400} L ${w * 0.22} ${base - 320} L ${w * 0.36} ${base - 500} L ${w * 0.5} ${base - 350} L ${w * 0.62} ${base - 430} L ${w * 0.78} ${base - 300} L ${w * 0.9} ${base - 380} L ${w} ${base - 280} L ${w} ${base} Z`}
        fill={snowy ? "#c3cfd9" : "#a9bdcf"}
      />
      <path d={`M ${w * 0.33} ${base - 466} L ${w * 0.36} ${base - 500} L ${w * 0.395} ${base - 460} L ${w * 0.375} ${base - 452} L ${w * 0.36} ${base - 466} L ${w * 0.345} ${base - 450} Z M ${w * 0.6} ${base - 412} L ${w * 0.62} ${base - 430} L ${w * 0.645} ${base - 408} L ${w * 0.62} ${base - 402} Z`} fill="#f4f6f8" />
      <path
        d={`M 0 ${base} L 0 ${base - 150} L ${w * 0.18} ${base - 230} L ${w * 0.32} ${base - 170} L ${w * 0.47} ${base - 250} L ${w * 0.66} ${base - 160} L ${w * 0.82} ${base - 215} L ${w} ${base - 150} L ${w} ${base} Z`}
        fill={snowy ? "#a9b8c6" : "#8aa7bc"}
      />
    </g>
  );
};

const FarTree: React.FC<{ x: number; y: number; s: number; season: Season }> = ({ x, y, s, season }) => {
  const c = season === "autumn" ? ["#c99a45", "#d9b05a"] : season === "winter" ? null : season === "spring" ? ["#7fb57a", "#9ccb8b"] : ["#5f9466", "#79b47d"];
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <rect x={-8} y={-90} width={16} height={90} fill="#7a5238" />
      {c ? (
        <g>
          <circle cx={0} cy={-120} r={62} fill={c[0]} />
          <circle cx={-34} cy={-100} r={40} fill={c[0]} />
          <circle cx={30} cy={-104} r={44} fill={c[1]} opacity={0.8} />
        </g>
      ) : (
        <path d="M 0 -90 L -30 -150 M 0 -110 L 28 -160 M 0 -90 L 0 -170" stroke="#7a5238" strokeWidth={6} strokeLinecap="round" />
      )}
    </g>
  );
};

// Низкий деревянный забор сада.
const Fence: React.FC<{ y: number; season: Season }> = ({ y, season }) => (
  <g opacity={0.9}>
    <rect x={0} y={y - 70} width={GARDEN.w} height={10} fill="#b98d5e" />
    <rect x={0} y={y - 36} width={GARDEN.w} height={10} fill="#b98d5e" />
    {Array.from({ length: 40 }, (_, i) => (
      <path key={i} d={`M ${i * 100 + 20} ${y} L ${i * 100 + 20} ${y - 92} L ${i * 100 + 34} ${y - 104} L ${i * 100 + 48} ${y - 92} L ${i * 100 + 48} ${y} Z`} fill="#caa271" stroke="#9c7650" strokeWidth={2} />
    ))}
    {season === "winter" ? <rect x={0} y={y - 74} width={GARDEN.w} height={5} fill="#ffffff" /> : null}
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
    <ellipse cx={0} cy={0} rx={130} ry={42} fill="#ffffff" />
    <ellipse cx={-60} cy={-20} rx={70} ry={45} fill="#ffffff" />
    <ellipse cx={50} cy={-28} rx={80} ry={50} fill="#ffffff" />
  </g>
);

// Разрез почвы: слои, камешки, влага; корни дерева A — под тем же стволом.
const SoilCut: React.FC<{ s: GardenState }> = ({ s }) => {
  const cut = clamp(s.cut ?? 0);
  if (cut <= 0.001) return null;
  const { x0, x1, y0, y1 } = CUT;
  const yy = y0 + (y1 - y0) * cut;
  const wet = clamp(s.wet ?? 0);
  // верхняя кромка — неровная линия травы; нижняя и боковые — мягкий край
  const edge = Array.from({ length: 25 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 24;
    return `${f(x)} ${f(y0 + 4 + Math.sin(i * 1.7) * 4)}`;
  }).join(" L ");
  const shape = `M ${f(x0)} ${f(y0 + 6)} L ${edge} L ${f(x1)} ${f(yy - 30)} Q ${f(x1)} ${f(yy)} ${f(x1 - 40)} ${f(yy)} L ${f(x0 + 40)} ${f(yy)} Q ${f(x0)} ${f(yy)} ${f(x0)} ${f(yy - 30)} Z`;
  const pebbles = Array.from({ length: 34 }, (_, i) => ({ x: x0 + 40 + hash01(i * 3 + 1) * (x1 - x0 - 80), y: y0 + 60 + hash01(i * 5 + 2) * (y1 - y0 - 100), r: 6 + hash01(i * 7 + 3) * 10 }));
  const drops = Array.from({ length: 40 }, (_, i) => ({ x: x0 + 50 + hash01(i * 11 + 4) * (x1 - x0 - 100), y: y0 + 30 + hash01(i * 13 + 5) * 330 }));
  return (
    <g>
      <defs>
        <clipPath id="soil-cut">
          <path d={shape} />
        </clipPath>
        <linearGradient id="soil-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b6b43" />
          <stop offset="0.35" stopColor="#8a5c38" />
          <stop offset="1" stopColor="#6f4729" />
        </linearGradient>
        <linearGradient id="wet-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d2414" stopOpacity={0.42} />
          <stop offset={f(clamp(0.15 + wet * 0.5))} stopColor="#3d2414" stopOpacity={0.3} />
          <stop offset={f(clamp(0.3 + wet * 0.55))} stopColor="#3d2414" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#soil-cut)">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0 + 40} fill="url(#soil-g)" />
        {/* слои */}
        <path d={`M ${x0} ${y0 + 150} Q ${(x0 + x1) / 2} ${y0 + 130} ${x1} ${y0 + 160}`} fill="none" stroke="#a97a4f" strokeWidth={10} opacity={0.5} />
        <path d={`M ${x0} ${y0 + 400} Q ${(x0 + x1) / 2} ${y0 + 430} ${x1} ${y0 + 390}`} fill="none" stroke="#5f3c22" strokeWidth={14} opacity={0.35} />
        {pebbles.map((p, i) => (
          <ellipse key={i} cx={f(p.x)} cy={f(p.y)} rx={f(p.r)} ry={f(p.r * 0.7)} fill={i % 2 ? "#b9a58a" : "#a18c72"} stroke="#5a3d26" strokeWidth={1.5} />
        ))}
        {wet > 0 ? <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0 + 40} fill="url(#wet-g)" opacity={wet} /> : null}
        {/* вода в почве — маленькие капельки между частицами */}
        {(s.soilWater ?? 0) > 0
          ? drops.map((d, i) => {
              const k = clamp((s.soilWater ?? 0) * 1.6 - hash01(i * 17) * 0.6);
              if (k <= 0) return null;
              return <path key={`d${i}`} d={`M ${f(d.x)} ${f(d.y - 9)} q 6 9 0 13 q -6 -4 0 -13 Z`} fill="#5fa4d6" stroke="#2f6f9f" strokeWidth={1.2} opacity={k * 0.85} />;
            })
          : null}
        {/* корни */}
        {s.growth && s.growth.stage !== "tree" ? null : (
          <g transform={`translate(${TREE_A.x} ${TREE_A.y}) scale(${ROOT_S})`}>
            <Roots reveal={clamp(s.roots ?? 1)} />
          </g>
        )}
      </g>
      <path d={shape} fill="none" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" opacity={clamp(cut * 8)} />
    </g>
  );
};

// Синие условные стрелки: вода из почвы → кончики корней → корни → ствол.
const WaterArrows: React.FC<{ vis: number; t: number }> = ({ vis, t }) => {
  if (vis <= 0.001) return null;
  const paths = rootPathsToTrunk().map((p) => p.map((q) => ({ x: TREE_A.x + q.x * ROOT_S, y: TREE_A.y + q.y * (q.y < 0 ? 1 : ROOT_S) })));
  const at = (pts: { x: number; y: number }[], u: number) => {
    const L: number[] = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const d = u * L[L.length - 1];
    let i = 1;
    while (i < pts.length - 1 && L[i] < d) i++;
    const k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    const p = { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k) };
    const ang = (Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x) * 180) / Math.PI;
    return { p, ang };
  };
  return (
    <g opacity={vis}>
      {paths.map((pts, i) =>
        [0, 1].map((k) => {
          const u = ((t * 0.16 + i * 0.13 + k * 0.5) % 1 + 1) % 1;
          const fade = Math.min(1, u * 6, (1 - u) * 6);
          const { p, ang } = at(pts, u);
          return (
            <g key={`${i}-${k}`} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(ang)})`} opacity={fade}>
              <path d="M -16 -11 L 4 0 L -16 11" fill="none" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -16 -11 L 4 0 L -16 11" fill="none" stroke="#2f86d0" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        }),
      )}
    </g>
  );
};

// Дождь: короткие косые штрихи в видимой области, брызги у земли.
const Rain: React.FC<{ k: number; t: number; cam: GardenCam }> = ({ k, t, cam }) => {
  if (k <= 0.001) return null;
  const h = (cam.w * 9) / 16;
  const left = cam.cx - cam.w / 2;
  const top = cam.cy - h / 2;
  const n = Math.round(150 * k);
  const len = cam.w * 0.028;
  const fall = h * 1.25;
  const drops: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = left + hash01(i * 7 + 1) * cam.w * 1.1;
    const y = top - len + ((t * h * 1.1 + hash01(i * 13 + 2) * fall) % fall);
    if (y > GARDEN.ground - 4) {
      // брызги у земли
      const sy = GARDEN.ground + (hash01(i * 3) - 0.5) * 20;
      if (y - GARDEN.ground < h * 0.06) drops.push(<path key={`s${i}`} d={`M ${f(x - 10)} ${f(sy)} q 10 -12 20 0`} fill="none" stroke="#dbeefa" strokeWidth={cam.w * 0.0016} opacity={0.8} />);
      continue;
    }
    drops.push(<line key={i} x1={f(x)} y1={f(y)} x2={f(x - len * 0.18)} y2={f(y + len)} stroke="#dcecf7" strokeWidth={f(cam.w * 0.0018)} strokeLinecap="round" opacity={0.85} />);
  }
  return (
    <g>
      <rect x={left} y={top} width={cam.w} height={h} fill="#58708a" opacity={0.16 * k} />
      {drops}
    </g>
  );
};

// Лейка с водой; держит рука (без лица и без реплик — просто полив).
const WateringCan: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0.001) return null;
  const x = TREE_A.x - 330;
  const y = TREE_A.y - 260;
  const tilt = lerp(0, 32, clamp(k * 2));
  const flow = clamp((k - 0.35) / 0.2);
  return (
    <g opacity={clamp(k * 5)}>
      {/* струя воды к основанию ствола */}
      {flow > 0 ? (
        <g>
          <path d={`M ${x + 205} ${y + 40} Q ${x + 270} ${y + 110} ${x + 285} ${f(lerp(y + 60, TREE_A.y - 6, flow))}`} fill="none" stroke="#7fc0ee" strokeWidth={14} strokeLinecap="round" opacity={0.85} />
          {Array.from({ length: 6 }, (_, i) => {
            const u = (t * 1.8 + i / 6) % 1;
            return <circle key={i} cx={f(x + 205 + 80 * u)} cy={f(y + 40 + (TREE_A.y - y - 40) * u * u)} r={5} fill="#cfe9fb" opacity={flow} />;
          })}
          <ellipse cx={x + 290} cy={TREE_A.y + 4} rx={f(70 * flow)} ry={f(10 * flow)} fill="#5b7fa0" opacity={0.35} />
        </g>
      ) : null}
      <g transform={`translate(${x} ${y}) rotate(${f(tilt)} 60 40)`}>
        <path d="M 120 20 L 215 -40 L 228 -26 L 132 44 Z" fill="#5f9e6e" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={222} cy={-34} rx={14} ry={20} transform="rotate(-40 222 -34)" fill="#4b8459" stroke={OUTLINE} strokeWidth={4} />
        <path d="M 0 0 L 140 0 L 130 110 L 10 110 Z" fill="#6fae7e" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 30 0 C 30 -70 110 -70 110 0" fill="none" stroke={OUTLINE} strokeWidth={14} />
        <path d="M 30 0 C 30 -70 110 -70 110 0" fill="none" stroke="#5f9e6e" strokeWidth={8} />
        <rect x={6} y={30} width={128} height={10} fill="#5f9e6e" />
      </g>
      {/* рука взрослого: рукав из-за края кадра, кисть обхватывает ручку */}
      <g transform={`translate(${x} ${y}) rotate(${f(tilt)} 60 40)`}>
        <path d="M -360 -460 C -250 -360 -100 -230 20 -128 L 78 -58 C -80 -130 -260 -250 -440 -360 Z" fill="#8a7f72" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -330 -380 C -230 -300 -120 -210 -10 -130" fill="none" stroke="#9c9285" strokeWidth={10} strokeLinecap="round" />
        <path d="M 16 -124 L 76 -58 L 60 -44 L 0 -108 Z" fill="#e8e2d6" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 40 -110 C 64 -132 108 -110 112 -76 C 116 -46 98 -26 74 -28 C 56 -30 42 -48 38 -66 C 34 -84 30 -98 40 -110 Z" fill="#cf9a72" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 70 -96 Q 92 -94 102 -80 M 64 -76 Q 88 -72 100 -58 M 60 -56 Q 80 -50 92 -40" fill="none" stroke="#b7825d" strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// Ранние стадии на месте дерева A.
const GrowthStage: React.FC<{ g: Growth; t: number; season: Season }> = ({ g, t, season }) => {
  if (g.stage === "seed")
    return (
      <g transform={`translate(${TREE_A.x} ${TREE_A.y}) scale(2.4)`}>
        <SoilSeed crack={g.crack} />
      </g>
    );
  if (g.stage === "sprout")
    return (
      <g transform={`translate(${TREE_A.x} ${TREE_A.y}) scale(2.4)`}>
        <SoilSeed crack={1} s={Math.max(0, 1 - g.g * 0.8)} />
        <Sprout g={g.g} t={t} />
      </g>
    );
  if (g.stage === "young")
    return (
      <g transform={`translate(${TREE_A.x} ${TREE_A.y}) scale(${f(lerp(1.4, 1.7, g.g))})`}>
        <YoungPlant g={g.g} t={t} season={season} />
      </g>
    );
  return null;
};

export const GardenWorld: React.FC<{ s: GardenState; cam: GardenCam }> = ({ s, cam }) => {
  const { t, season } = s;
  const [sk0, sk1] = SKY[season];
  const [m0, m1] = MEADOW[season];
  const horizon = 1080;
  const cloudX = ((t * 12) % 4400) - 600;
  const treeScale = s.growth?.stage === "tree" ? s.growth.s : (s.treeAScale ?? 1);
  const showTreeA = !s.growth || s.growth.stage === "tree";
  return (
    <g>
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sk0} />
          <stop offset="1" stopColor={sk1} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={GARDEN.w} height={GARDEN.h} fill="url(#g-sky)" />
      {season !== "winter" ? (
        <g opacity={0.95}>
          <Cloud x={cloudX} y={260} s={1.4} />
          <Cloud x={cloudX + 1900} y={420} s={1.1} />
          <Cloud x={cloudX - 1500} y={330} s={1.2} />
        </g>
      ) : null}
      <Mountains base={horizon} season={season} />
      <path d={`M 0 ${horizon - 40} Q ${GARDEN.w * 0.4} ${horizon - 90} ${GARDEN.w} ${horizon - 30} L ${GARDEN.w} ${GARDEN.h} L 0 ${GARDEN.h} Z`} fill={m0} />
      {[300, 700, 2300, 3500].map((x, i) => (
        <FarTree key={i} x={x} y={horizon + 20 + (i % 2) * 15} s={0.9 + (i % 3) * 0.15} season={season} />
      ))}
      <path d={`M 0 ${horizon + 120} Q ${GARDEN.w * 0.5} ${horizon + 60} ${GARDEN.w} ${horizon + 130} L ${GARDEN.w} ${GARDEN.h} L 0 ${GARDEN.h} Z`} fill={m1} />
      <Fence y={horizon + 170} season={season} />
      {/* земля у деревьев — та же трава вниз до края */}
      <rect x={0} y={GARDEN.ground - 20} width={GARDEN.w} height={GARDEN.h - GARDEN.ground + 20} fill={m1} />
      <path d={`M 0 ${GARDEN.ground - 20} Q ${GARDEN.w / 2} ${GARDEN.ground - 50} ${GARDEN.w} ${GARDEN.ground - 20}`} fill={m1} />
      {/* пучки травы */}
      {Array.from({ length: 70 }, (_, i) => {
        const x = hash01(i * 3 + 7) * GARDEN.w;
        const y = GARDEN.ground + 40 + hash01(i * 5 + 1) * 780;
        return <path key={i} d={`M ${f(x - 12)} ${f(y)} q 4 -20 10 -28 M ${f(x)} ${f(y)} q 0 -22 2 -34 M ${f(x + 10)} ${f(y)} q 2 -18 12 -26`} stroke={season === "winter" ? "#d5dde3" : LEAF.dark} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55} />;
      })}
      {/* тени деревьев */}
      <ellipse cx={TREE_A.x + 40} cy={TREE_A.y + 6} rx={f(380 * treeScale)} ry={f(46 * treeScale)} fill="#2f4a2a" opacity={showTreeA ? 0.2 : 0} />
      {s.treeB ? <ellipse cx={TREE_B.x - 30} cy={TREE_B.y + 6} rx={300} ry={38} fill="#2f4a2a" opacity={0.2} /> : null}
      {s.treeB ? <AppleTree x={TREE_B.x} y={TREE_B.y} s={0.8} t={t} st={s.treeB} seed={3} mirror /> : null}
      <SoilCut s={s} />
      {showTreeA ? <AppleTree x={TREE_A.x} y={TREE_A.y} s={treeScale} t={t} st={{ ...s.treeA, snow: s.snow }} /> : null}
      {s.growth ? <GrowthStage g={s.growth} t={t} season={season} /> : null}
      <WaterArrows vis={clamp(s.arrows ?? 0)} t={s.arrowT ?? t} />
      <WateringCan k={s.watering ?? 0} t={t} />
      {season === "winter" && (s.snow ?? 0) > 0 ? <rect x={0} y={GARDEN.ground - 12} width={GARDEN.w} height={30} fill="#ffffff" opacity={(s.snow ?? 0) * 0.9} /> : null}
      {season === "autumn"
        ? Array.from({ length: 14 }, (_, i) => {
            const u = (t * 0.12 + hash01(i * 9)) % 1;
            const x = TREE_A.x - 380 * treeScale + hash01(i * 4 + 1) * 760 * treeScale + Math.sin(t * 2 + i) * 30;
            const y = TREE_A.y - 760 * treeScale + u * 780 * treeScale;
            return showTreeA ? <ellipse key={i} cx={f(x)} cy={f(y)} rx={12} ry={7} transform={`rotate(${f(u * 300 + i * 40)} ${f(x)} ${f(y)})`} fill={i % 2 ? "#e0a63c" : "#c98a2e"} stroke={OUTLINE} strokeWidth={1.5} /> : null;
          })
        : null}
      <Rain k={clamp(s.rain ?? 0)} t={t} cam={cam} />
      {(s.dim ?? 0) > 0 ? <rect x={0} y={0} width={GARDEN.w} height={GARDEN.h} fill="#1d2a40" opacity={(s.dim ?? 0) * 0.35} /> : null}
      {(s.warmth ?? 0) > 0 ? <rect x={0} y={0} width={GARDEN.w} height={GARDEN.h} fill="#ffb36b" opacity={(s.warmth ?? 0) * 0.15} /> : null}
    </g>
  );
};

export const GardenView: React.FC<{ s: GardenState; cam: GardenCam }> = ({ s, cam }) => {
  const h = (cam.w * 9) / 16;
  return (
    <svg width={1920} height={1080} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`}>
      <GardenWorld s={s} cam={cam} />
    </svg>
  );
};

export const seasonLeaf = (season: Season) => (season === "winter" ? 0 : 1);

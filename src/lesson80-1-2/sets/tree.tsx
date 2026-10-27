// Одна и та же яблоня ролика 80-1-2 во всех возрастах и сезонах: росток,
// молодое растение, саженец, взрослое дерево; лето, осень, зима, весна;
// цветение, завязи, зрелые яблоки. Стиль — как у дерева за окном первого
// фильма (кроны из кругов с контуром), но форма кроны — округлая, раскидистая
// крона яблони. Движение — только спокойный ветер. Никакого «возникновения»:
// изменения задаются возрастом и сезоном, которые меняются постепенно.
//
// Координаты: (0,0) — основание ствола на уровне земли; взрослое дерево
// ≈ 900 ед. высотой при s = 1.
import React from "react";
import { OUTLINE } from "../../lesson01/rig/looks";
import { hash01 } from "../../lesson01/rig/geom";

const f = (n: number) => n.toFixed(1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(lerp(v, pb[i], Math.max(0, Math.min(1, t)))).toString(16).padStart(2, "0")).join("")}`;
};

export const LEAF = { dark: "#4f8a5b", mid: "#62a06b", light: "#79b47d" } as const;
const AUTUMN = { dark: "#c98a2e", mid: "#e0a63c", light: "#efc463" } as const;
const SPRING = { dark: "#6aa56a", mid: "#80b97a", light: "#9fd08f" } as const;
export const BARK = "#7a5238";
export const BLOSSOM = { petal: "#fbf2f4", blush: "#f2b9c6", center: "#e9c64a" } as const;
export const APPLE_RED = { base: "#c8352e", light: "#e2584a", dark: "#9e2723", green: "#9cc157", greenDark: "#78a040" } as const;

// ---------- Скелет взрослой яблони ----------
// Ветви: [x0, y0, x1, y1, w0, w1] — от основания к концу.
const BRANCHES: [number, number, number, number, number, number][] = [
  [0, 0, -6, -300, 64, 46], // ствол
  [-6, -300, -230, -540, 34, 18],
  [-6, -300, -70, -640, 30, 16],
  [-6, -300, 120, -610, 30, 16],
  [-6, -300, 270, -480, 32, 16],
  [-230, -540, -330, -660, 16, 7],
  [-230, -540, -170, -720, 14, 6],
  [-70, -640, -20, -800, 14, 6],
  [-70, -640, -150, -760, 12, 5],
  [120, -610, 70, -770, 13, 5],
  [120, -610, 230, -730, 13, 5],
  [270, -480, 370, -600, 14, 6],
  [270, -480, 330, -400, 10, 4],
  [-230, -540, -320, -470, 10, 4],
];

// Кроны-облака (круги) вокруг концов ветвей.
const CROWN: [number, number, number][] = [
  [-20, -720, 150],
  [-200, -640, 140],
  [190, -650, 145],
  [-330, -540, 110],
  [330, -540, 115],
  [-120, -540, 130],
  [100, -540, 130],
  [-260, -440, 95],
  [270, -430, 100],
  [0, -450, 120],
  [-90, -800, 95],
  [110, -790, 100],
  [-380, -620, 80],
  [390, -640, 80],
];

// Яблоки: на передней стороне кроны (стабильные места).
export const TREE_APPLES: [number, number][] = [
  [-250, -470],
  [-110, -520],
  [40, -470],
  [170, -560],
  [300, -470],
  [-320, -590],
  [-40, -640],
  [230, -680],
  [110, -420],
  [-180, -400],
  [360, -580],
  [-60, -760],
];

const tapered = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bend = 0.12) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const mx = (x0 + x1) / 2 + nx * L * bend;
  const my = (y0 + y1) / 2 + ny * L * bend;
  return `M ${f(x0 + (nx * w0) / 2)} ${f(y0 + (ny * w0) / 2)} Q ${f(mx + (nx * (w0 + w1)) / 4)} ${f(my + (ny * (w0 + w1)) / 4)} ${f(x1 + (nx * w1) / 2)} ${f(y1 + (ny * w1) / 2)} L ${f(x1 - (nx * w1) / 2)} ${f(y1 - (ny * w1) / 2)} Q ${f(mx - (nx * (w0 + w1)) / 4)} ${f(my - (ny * (w0 + w1)) / 4)} ${f(x0 - (nx * w0) / 2)} ${f(y0 - (ny * w0) / 2)} Z`;
};

export type Season = "summer" | "autumn" | "winter" | "spring";

export type TreeState = {
  season: Season;
  leaf?: number; // густота листвы 0…1 (осенью/зимой убывает)
  bloom?: number; // цветение 0…1
  fruit?: number; // 0 — нет, 0…0.5 — завязи растут, 0.5…1 — созревают
  fruitCount?: number; // сколько яблок (из TREE_APPLES)
  snow?: number;
};

export const crownColors = (st: TreeState) => {
  if (st.season === "autumn") return AUTUMN;
  if (st.season === "spring") return SPRING;
  return LEAF;
};

// Яблоко на ветке (с плодоножкой). r — радиус; ripe 0 — зелёная завязь, 1 — красное.
export const BranchApple: React.FC<{ x: number; y: number; r: number; ripe: number; sway?: number }> = ({ x, y, r, ripe, sway = 0 }) => {
  const base = ripe < 0.5 ? mixHex(APPLE_RED.green, "#d6c45a", ripe * 2) : mixHex("#d6c45a", APPLE_RED.base, (ripe - 0.5) * 2);
  const dark = ripe < 0.5 ? APPLE_RED.greenDark : mixHex(APPLE_RED.greenDark, APPLE_RED.dark, (ripe - 0.5) * 2);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(sway)} 0 ${f(-r * 1.4)})`}>
      <path d={`M 0 ${f(-r * 0.85)} Q ${f(r * 0.12)} ${f(-r * 1.25)} ${f(-r * 0.05)} ${f(-r * 1.5)}`} fill="none" stroke={OUTLINE} strokeWidth={Math.max(2, r * 0.22)} strokeLinecap="round" />
      <path d={`M 0 ${f(-r * 0.85)} Q ${f(r * 0.12)} ${f(-r * 1.25)} ${f(-r * 0.05)} ${f(-r * 1.5)}`} fill="none" stroke="#6e4a2c" strokeWidth={Math.max(1, r * 0.12)} strokeLinecap="round" />
      <path d={`M ${f(-r)} ${f(-r * 0.05)} C ${f(-r * 1.05)} ${f(-r * 0.95)} ${f(-r * 0.25)} ${f(-r * 1.05)} 0 ${f(-r * 0.78)} C ${f(r * 0.25)} ${f(-r * 1.05)} ${f(r * 1.05)} ${f(-r * 0.95)} ${f(r)} ${f(-r * 0.05)} C ${f(r * 0.95)} ${f(r * 0.85)} ${f(-r * 0.95)} ${f(r * 0.85)} ${f(-r)} ${f(-r * 0.05)} Z`} fill={base} stroke={OUTLINE} strokeWidth={Math.max(1.6, r * 0.13)} strokeLinejoin="round" />
      <path d={`M ${f(r * 0.35)} ${f(-r * 0.7)} C ${f(r * 1.0)} ${f(-r * 0.3)} ${f(r * 0.7)} ${f(r * 0.6)} ${f(-r * 0.1)} ${f(r * 0.65)} C ${f(r * 0.5)} ${f(r * 0.3)} ${f(r * 0.6)} ${f(-r * 0.2)} ${f(r * 0.35)} ${f(-r * 0.7)} Z`} fill={dark} opacity={0.4} />
      <ellipse cx={f(-r * 0.4)} cy={f(-r * 0.35)} rx={f(r * 0.2)} ry={f(r * 0.3)} fill="#fff6ea" opacity={0.55} transform={`rotate(-25 ${f(-r * 0.4)} ${f(-r * 0.35)})`} />
    </g>
  );
};

// Цветок яблони (вид спереди): 5 бело-розовых лепестков и серединка
// с тычинками. open — раскрытие 0…1, fall — лепестки опадают 0…1.
export const AppleFlower: React.FC<{ x: number; y: number; r: number; open?: number; fall?: number; rot?: number; pollen?: number }> = ({ x, y, r, open = 1, fall = 0, rot = 0, pollen = 1 }) => {
  const petals = [0, 1, 2, 3, 4].map((i) => {
    const a = rot + i * 72 - 90;
    const gone = Math.max(0, Math.min(1, fall * 1.6 - i * 0.15));
    if (gone >= 1) return null;
    const pr = r * (0.42 + 0.58 * open);
    const cx = Math.cos((a * Math.PI) / 180) * pr * 0.55;
    const cy = Math.sin((a * Math.PI) / 180) * pr * 0.55 + gone * r * 1.2;
    return (
      <g key={i} transform={`translate(${f(cx)} ${f(cy)}) rotate(${f(a + 90 + gone * 40)})`} opacity={1 - gone}>
        <ellipse cx={0} cy={0} rx={f(pr * 0.42)} ry={f(pr * 0.55)} fill={BLOSSOM.petal} stroke={OUTLINE} strokeWidth={Math.max(1, r * 0.04)} />
        <ellipse cx={0} cy={f(pr * 0.3)} rx={f(pr * 0.22)} ry={f(pr * 0.2)} fill={BLOSSOM.blush} opacity={0.75} />
      </g>
    );
  });
  const stamens = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const L = r * 0.3 * open;
    const ex = Math.cos(a) * L;
    const ey = Math.sin(a) * L;
    return (
      <g key={i}>
        <line x1={0} y1={0} x2={f(ex)} y2={f(ey)} stroke="#d8d39a" strokeWidth={Math.max(0.8, r * 0.025)} />
        <circle cx={f(ex)} cy={f(ey)} r={f(r * 0.045)} fill={BLOSSOM.center} stroke="#a8862a" strokeWidth={Math.max(0.5, r * 0.012)} opacity={pollen} />
      </g>
    );
  });
  return (
    <g transform={`translate(${f(x)} ${f(y)})`}>
      {petals}
      <circle cx={0} cy={0} r={f(r * 0.16)} fill="#b9c96a" stroke={OUTLINE} strokeWidth={Math.max(0.8, r * 0.03)} />
      {fall < 0.9 ? stamens : null}
      <circle cx={0} cy={0} r={f(r * 0.05)} fill="#9db04e" />
    </g>
  );
};

// Взрослая яблоня. s — общий масштаб (рост саженца → дерева), t — время.
export const AppleTree: React.FC<{ x: number; y: number; s: number; t: number; st: TreeState; seed?: number; mirror?: boolean }> = ({ x, y, s, t, st, seed = 0, mirror = false }) => {
  const sway = Math.sin(t * 0.9 + seed) * 2.2 + Math.sin(t * 2.1 + 1 + seed) * 0.8;
  const leaf = st.leaf ?? (st.season === "winter" ? 0 : 1);
  const col = crownColors(st);
  const bloom = st.bloom ?? 0;
  const fruit = st.fruit ?? 0;
  const nFruit = st.fruitCount ?? 8;
  const crownScale = 0.35 + 0.65 * leaf;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(mirror ? -s : s)} ${f(s)})`}>
      {/* ствол и ветви */}
      <g transform={`rotate(${f(sway * 0.25)} 0 -200)`}>
        {BRANCHES.map(([x0, y0, x1, y1, w0, w1], i) => (
          <path key={`b${i}`} d={tapered(x0, y0, x1, y1, w0, w1, i === 0 ? 0.02 : 0.1 * (i % 2 ? 1 : -1))} fill={BARK} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
        ))}
        {/* кора: пара светлых штрихов */}
        <path d="M -16 -40 Q -10 -140 -18 -240" fill="none" stroke="#956a4b" strokeWidth={6} strokeLinecap="round" />
        <path d="M 12 -70 Q 16 -150 10 -210" fill="none" stroke="#694530" strokeWidth={4} strokeLinecap="round" />
        {/* зимой — снег на ветвях */}
        {st.snow
          ? BRANCHES.slice(1).map(([x0, y0, x1, y1, , w1], i) => (
              <path key={`sn${i}`} d={`M ${f(lerp(x0, x1, 0.35))} ${f(lerp(y0, y1, 0.35) - 8)} L ${f(x1)} ${f(y1 - w1)}`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={st.snow} />
            ))
          : null}
        {/* крона */}
        {leaf > 0.01 ? (
          <g opacity={Math.min(1, leaf * 1.5)}>
            {CROWN.map(([bx, by, r], i) => (
              <circle key={`o${i}`} cx={bx} cy={by} r={f(r * crownScale + 3)} fill={OUTLINE} />
            ))}
            {CROWN.map(([bx, by, r], i) => (
              <circle key={`a${i}`} cx={bx} cy={by} r={f(r * crownScale)} fill={i % 3 === 0 ? col.dark : col.mid} />
            ))}
            {CROWN.slice(0, 10).map(([bx, by, r], i) => (
              <circle key={`h${i}`} cx={f(bx - r * 0.25 + Math.sin(t * 1.3 + i + seed) * 2)} cy={f(by - r * 0.3)} r={f(r * 0.5 * crownScale)} fill={col.light} opacity={0.75} />
            ))}
            {/* мелкие листочки по краю — фактура */}
            {CROWN.map(([bx, by, r], i) =>
              [0, 1, 2].map((k) => {
                const a = hash01(i * 7 + k + seed * 31) * Math.PI * 2;
                const lx = bx + Math.cos(a) * r * crownScale * 0.95;
                const ly = by + Math.sin(a) * r * crownScale * 0.95;
                return <ellipse key={`l${i}-${k}`} cx={f(lx)} cy={f(ly)} rx={14} ry={8} transform={`rotate(${f((a * 180) / Math.PI)} ${f(lx)} ${f(ly)})`} fill={col.dark} stroke={OUTLINE} strokeWidth={2} />;
              }),
            )}
          </g>
        ) : null}
        {/* цветение: россыпь соцветий */}
        {bloom > 0.01
          ? Array.from({ length: 46 }, (_, i) => {
              const c = CROWN[i % CROWN.length];
              const a = hash01(i * 13 + 5 + seed) * Math.PI * 2;
              const d = Math.sqrt(hash01(i * 17 + 9 + seed)) * c[2] * 0.85;
              const bx = c[0] + Math.cos(a) * d;
              const by = c[1] + Math.sin(a) * d;
              const k = Math.max(0, Math.min(1, bloom * 1.6 - hash01(i * 3 + seed) * 0.6));
              if (k <= 0) return null;
              return (
                <g key={`fl${i}`} transform={`translate(${f(bx)} ${f(by)}) scale(${f(k)})`}>
                  {[0, 1, 2, 3, 4].map((p) => (
                    <circle key={p} cx={f(Math.cos(p * 1.2566) * 9)} cy={f(Math.sin(p * 1.2566) * 9)} r={8} fill={p % 2 ? BLOSSOM.petal : "#f8dfe5"} stroke="#c9a3ab" strokeWidth={1.2} />
                  ))}
                  <circle cx={0} cy={0} r={4.5} fill={BLOSSOM.center} />
                </g>
              );
            })
          : null}
        {/* плоды: от маленьких зелёных завязей до красных яблок */}
        {fruit > 0.01
          ? TREE_APPLES.slice(0, nFruit).map(([ax, ay], i) => {
              const grow = Math.min(1, fruit * 2);
              const ripe = Math.max(0, (fruit - 0.5) * 2);
              const r = lerp(6, 26, grow);
              return <BranchApple key={`ap${i}`} x={ax} y={ay} r={r} ripe={ripe} sway={Math.sin(t * 1.4 + i) * 2} />;
            })
          : null}
      </g>
    </g>
  );
};

// ---------- Ранние стадии ----------
// Семечко в почве (k — набухание), росток с семядолями, молодое растение.
// (0,0) — уровень земли над семечком; семечко — на глубине 40 ед.
export const SEED_DEPTH = 40;

export const SoilSeed: React.FC<{ s?: number; crack?: number }> = ({ s = 1, crack = 0 }) => (
  <g transform={`translate(0 ${SEED_DEPTH}) scale(${f(s)})`}>
    <path d="M 9 0 C 4 -6 -9 -7 -9 0 C -9 7 4 6 9 0 Z" fill="#6b3f22" stroke="#2f1b10" strokeWidth={1.4} />
    <path d="M -5 -2.5 Q 0 -4.5 5 -2" fill="none" stroke="#9a6440" strokeWidth={1.2} strokeLinecap="round" />
    {crack > 0 ? <path d={`M 7 0 L ${f(7 - 6 * crack)} 0`} stroke="#f2e2b8" strokeWidth={1.4} strokeLinecap="round" /> : null}
  </g>
);

// Корешок и росток из семечка. g: 0…1 — от первого корешка до ростка с
// двумя семядолями и первым настоящим листом.
export const Sprout: React.FC<{ g: number; t: number }> = ({ g, t }) => {
  const root = Math.min(1, g * 2.2);
  const up = Math.max(0, Math.min(1, (g - 0.3) / 0.45));
  const coty = Math.max(0, Math.min(1, (g - 0.55) / 0.3));
  const leafK = Math.max(0, Math.min(1, (g - 0.8) / 0.2));
  const h = up * 52;
  const sway = Math.sin(t * 1.6) * 2 * up;
  return (
    <g>
      {/* корешок вниз от семечка, с тонкими волосками */}
      {root > 0 ? (
        <g>
          <path d={`M 4 ${SEED_DEPTH + 3} Q 8 ${f(SEED_DEPTH + 20 * root)} 2 ${f(SEED_DEPTH + 46 * root)}`} fill="none" stroke="#efe1c2" strokeWidth={4} strokeLinecap="round" />
          <path d={`M 4 ${SEED_DEPTH + 3} Q 8 ${f(SEED_DEPTH + 20 * root)} 2 ${f(SEED_DEPTH + 46 * root)}`} fill="none" stroke="#a88d68" strokeWidth={1} strokeLinecap="round" />
          {root > 0.6
            ? [0.5, 0.7, 0.85].map((k, i) => (
                <path key={i} d={`M ${f(5 + 2 * k)} ${f(SEED_DEPTH + 46 * k * root)} l ${f(i % 2 ? 9 : -9)} ${f(5)}`} stroke="#d9c7a0" strokeWidth={1.2} strokeLinecap="round" />
              ))
            : null}
        </g>
      ) : null}
      {/* стебелёк вверх */}
      {up > 0 ? (
        <g transform={`rotate(${f(sway)} 0 0)`}>
          <path d={`M 0 ${SEED_DEPTH - 4} C 5 ${f(SEED_DEPTH * 0.45)} -6 ${f(-h * 0.35)} ${f(2 * (1 - coty))} ${f(-h)}`} fill="none" stroke={OUTLINE} strokeWidth={4.4} strokeLinecap="round" />
          <path d={`M 0 ${SEED_DEPTH - 4} C 5 ${f(SEED_DEPTH * 0.45)} -6 ${f(-h * 0.35)} ${f(2 * (1 - coty))} ${f(-h)}`} fill="none" stroke="#8fbf6a" strokeWidth={2.4} strokeLinecap="round" />
          {/* пока семядоли не раскрылись — верхушка изогнута крючком */}
          {coty < 0.5 && up > 0.05 ? <path d={`M ${f(2 * (1 - coty))} ${f(-h)} q 5 -6 9 1`} fill="none" stroke="#6f9f52" strokeWidth={3} strokeLinecap="round" /> : null}
          {coty > 0
            ? [-1, 1].map((sd) => (
                <ellipse key={sd} cx={f(sd * 13 * coty)} cy={f(-h - 4 * coty)} rx={f(14 * coty)} ry={f(7 * coty)} transform={`rotate(${f(sd * -18)} ${f(sd * 13 * coty)} ${f(-h - 4 * coty)})`} fill="#8cc06f" stroke={OUTLINE} strokeWidth={2} />
              ))
            : null}
          {leafK > 0 ? <path d={`M 0 ${f(-h)} q ${f(6 * leafK)} ${f(-14 * leafK)} 0 ${f(-26 * leafK)} q ${f(-6 * leafK)} ${f(12 * leafK)} 0 ${f(26 * leafK)} Z`} fill={LEAF.mid} stroke={OUTLINE} strokeWidth={1.8} /> : null}
        </g>
      ) : null}
    </g>
  );
};

// Молодое растение (первый год): тонкий стебель и несколько листьев —
// не уменьшенная копия дерева. g: 0…1 — рост.
export const YoungPlant: React.FC<{ g: number; t: number; season?: Season }> = ({ g, t, season = "summer" }) => {
  const h = lerp(80, 230, g);
  const sway = Math.sin(t * 1.3) * 2.5;
  const col = season === "autumn" ? AUTUMN : LEAF;
  const leaves = [0.32, 0.48, 0.6, 0.72, 0.82, 0.9, 0.97];
  const nLeaves = Math.round(lerp(3, 7, g));
  return (
    <g transform={`rotate(${f(sway)} 0 0)`}>
      <path d={`M 0 0 C 3 ${f(-h * 0.35)} -4 ${f(-h * 0.7)} 0 ${f(-h)}`} fill="none" stroke={OUTLINE} strokeWidth={9} strokeLinecap="round" />
      <path d={`M 0 0 C 3 ${f(-h * 0.35)} -4 ${f(-h * 0.7)} 0 ${f(-h)}`} fill="none" stroke="#8a6448" strokeWidth={6} strokeLinecap="round" />
      {leaves.slice(0, nLeaves).map((k, i) => {
        const sd = i % 2 ? 1 : -1;
        const y = -h * k;
        const L = lerp(30, 42, g) * (1 - k * 0.3);
        return (
          <g key={i} transform={`translate(0 ${f(y)}) rotate(${f(sd * (55 + i * 4))})`}>
            <path d={`M 0 0 q ${f(L * 0.35)} ${f(-L * 0.4)} 0 ${f(-L)} q ${f(-L * 0.35)} ${f(L * 0.4)} 0 ${f(L)} Z`} fill={i % 2 ? col.mid : col.dark} stroke={OUTLINE} strokeWidth={2} />
            <path d={`M 0 0 L 0 ${f(-L * 0.85)}`} stroke={col.light} strokeWidth={1.2} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- Корни ----------
// Разветвлённые корни под стволом: толстые у основания, тоньше к концам,
// с мелкими корешками. Детерминированное построение (без Math.random).
export type RootSeg = { x0: number; y0: number; x1: number; y1: number; w0: number; w1: number; depth: number; cx: number; cy: number };
export const buildRoots = (seed = 7): RootSeg[] => {
  const out: RootSeg[] = [];
  const grow = (x: number, y: number, ang: number, len: number, w: number, depth: number, k: number) => {
    const a = (ang * Math.PI) / 180;
    const x1 = x + Math.sin(a) * len;
    const y1 = y + Math.cos(a) * len;
    const bend = (hash01(seed + k * 11) - 0.5) * 0.5;
    const cx = (x + x1) / 2 + Math.cos(a) * len * bend;
    const cy = (y + y1) / 2 - Math.sin(a) * len * bend;
    const w1 = Math.max(1.5, w * 0.55);
    out.push({ x0: x, y0: y, x1, y1, w0: w, w1, depth, cx, cy });
    if (depth >= 3) return;
    const n = depth === 0 ? 2 : 2;
    for (let i = 0; i < n; i++) {
      const sp = (i === 0 ? -1 : 1) * (18 + hash01(seed + k * 5 + i) * 22);
      grow(x1, y1, ang + sp, len * (0.58 + hash01(seed + k * 3 + i * 7) * 0.18), w1, depth + 1, k * 4 + i + 1);
    }
  };
  // главные корни: широко в стороны у поверхности и вглубь под стволом
  const mains: [number, number, number][] = [
    [-84, 175, 20],
    [-62, 150, 19],
    [-36, 150, 22],
    [-10, 170, 24],
    [14, 165, 23],
    [40, 145, 21],
    [64, 150, 19],
    [86, 170, 18],
  ];
  mains.forEach(([ang, len, w], i) => grow((i - 3.5) * 6, 4, ang, len, w, 0, i * 101 + 3));
  return out;
};
export const ROOTS = buildRoots();

const rootPath = (r: RootSeg, k: number) => {
  const x1 = lerp(r.x0, r.x1, k);
  const y1 = lerp(r.y0, r.y1, k);
  const dx = x1 - r.x0;
  const dy = y1 - r.y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const w1 = lerp(r.w0, r.w1, k);
  const cx = lerp(r.x0, r.cx, k);
  const cy = lerp(r.y0, r.cy, k);
  return `M ${f(r.x0 + (nx * r.w0) / 2)} ${f(r.y0 + (ny * r.w0) / 2)} Q ${f(cx + (nx * (r.w0 + w1)) / 4)} ${f(cy + (ny * (r.w0 + w1)) / 4)} ${f(x1 + (nx * w1) / 2)} ${f(y1 + (ny * w1) / 2)} Q ${f(x1 + (dx / L) * w1 * 0.6)} ${f(y1 + (dy / L) * w1 * 0.6)} ${f(x1 - (nx * w1) / 2)} ${f(y1 - (ny * w1) / 2)} Q ${f(cx - (nx * (r.w0 + w1)) / 4)} ${f(cy - (ny * (r.w0 + w1)) / 4)} ${f(r.x0 - (nx * r.w0) / 2)} ${f(r.y0 - (ny * r.w0) / 2)} Z`;
};

// Корни рисуются в два прохода (контур, затем заливка) — развилки сливаются
// в одно целое, без «сегментов».
export const Roots: React.FC<{ reveal?: number; tint?: string }> = ({ reveal = 1, tint = "#c9a27a" }) => {
  const vis = ROOTS.map((r) => ({ r, k: Math.max(0, Math.min(1, reveal * 4 - r.depth * 0.9)) })).filter((x) => x.k > 0);
  return (
    <g>
      {vis.map(({ r, k }, i) => (
        <path key={`o${i}`} d={rootPath(r, k)} fill={OUTLINE} stroke={OUTLINE} strokeWidth={r.depth >= 2 ? 3 : 5} strokeLinejoin="round" />
      ))}
      {vis.map(({ r, k }, i) => (
        <path key={`f${i}`} d={rootPath(r, k)} fill={r.depth >= 3 ? "#d8b58c" : tint} />
      ))}
      {/* светлая прожилка вдоль толстых корней */}
      {vis
        .filter(({ r }) => r.depth <= 1)
        .map(({ r, k }, i) => (
          <path key={`l${i}`} d={`M ${f(r.x0)} ${f(r.y0)} Q ${f(lerp(r.x0, r.cx, k))} ${f(lerp(r.y0, r.cy, k))} ${f(lerp(r.x0, r.x1, k * 0.9))} ${f(lerp(r.y0, r.y1, k * 0.9))}`} fill="none" stroke="#dfc19c" strokeWidth={r.w0 * 0.18} strokeLinecap="round" opacity={0.7} />
        ))}
      {/* корневые волоски на концах */}
      {reveal > 0.85
        ? ROOTS.filter((r) => r.depth === 3).map((r, i) => (
            <g key={`h${i}`} opacity={Math.min(1, (reveal - 0.85) / 0.15)}>
              <path d={`M ${f(r.x1)} ${f(r.y1)} l ${f(5 + (i % 3))} ${f(7)} M ${f(r.x1)} ${f(r.y1)} l ${f(-6)} ${f(6 + (i % 2) * 3)}`} stroke="#d8b58c" strokeWidth={1.4} strokeLinecap="round" />
            </g>
          ))
        : null}
    </g>
  );
};

// Ветка «внутрь корня»: путь воды от кончика корня к стволу (для стрелок).
export const rootPathsToTrunk = (): { x: number; y: number }[][] => {
  const tips = ROOTS.filter((r) => r.depth === 3);
  const pick = [2, 9, 17, 25, 33, 41, 49, 57].map((i) => tips[i % tips.length]);
  return pick.map((tip) => {
    // поднимаемся по родителям: ищем сегмент, конец которого — начало текущего
    const chain = [tip];
    let cur = tip;
    for (let d = 3; d > 0; d--) {
      const parent = ROOTS.find((r) => Math.abs(r.x1 - cur.x0) < 0.01 && Math.abs(r.y1 - cur.y0) < 0.01);
      if (!parent) break;
      chain.push(parent);
      cur = parent;
    }
    const pts = [{ x: tip.x1, y: tip.y1 }];
    for (const s of chain) pts.push({ x: s.x0, y: s.y0 });
    pts.push({ x: 0, y: -60 }, { x: -4, y: -220 });
    return pts;
  });
};

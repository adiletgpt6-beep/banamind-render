// Сцена 4: изометрический городок на тёмной доске — проекция, дорожные
// пути с закруглёнными поворотами, блоки-здания с мягкими тенями,
// графитовая машина с прозрачным салоном (видны водитель и ребёнок
// сзади), маленькие фигурки. Свет сверху слева: тени ложатся вправо-вниз.
// Мир — плоскость (u, v) и высота z; экран — координаты доски (px).
import { clamp, lerp } from "../rig/motion";

export const BW = 1000;
export const BH = 890;
const CY = 440; // центр «камеры» доски по вертикали
const K30 = 0.866;

export type Pt = { readonly x: number; readonly y: number };
export type UV = { readonly u: number; readonly v: number };
export type IsoCam = { readonly x: number; readonly y: number; readonly zoom: number };
export type Proj = { readonly p: (u: number, v: number, z?: number) => Pt; readonly zoom: number };

export const isoXY = (u: number, v: number, z = 0) => ({ x: (u - v) * K30, y: (u + v) * 0.5 - z });

export const makeProj = (cam: IsoCam): Proj => ({
  zoom: cam.zoom,
  p: (u, v, z = 0) => ({ x: BW / 2 + ((u - v) * K30 - cam.x) * cam.zoom, y: CY + ((u + v) * 0.5 - z - cam.y) * cam.zoom }),
});

export const ptsD = (pts: readonly Pt[], close = false) =>
  pts.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ") + (close ? " Z" : "");

const quad = (P: Proj, c: readonly (readonly [number, number, number])[]) => ptsD(c.map(([u, v, z]) => P.p(u, v, z)), true);

// ---------- Пути ----------
export type IsoPath = { readonly pts: readonly UV[]; readonly cum: readonly number[]; readonly len: number };

// Ломаная с закруглёнными углами (квадратичная кривая в каждом углу).
export const mkPath = (raw: readonly UV[], r = 26): IsoPath => {
  const pts: UV[] = [raw[0]];
  for (let i = 1; i < raw.length - 1; i++) {
    const a = raw[i - 1];
    const b = raw[i];
    const c = raw[i + 1];
    const d1 = Math.hypot(b.u - a.u, b.v - a.v);
    const d2 = Math.hypot(c.u - b.u, c.v - b.v);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const p = { u: b.u + ((a.u - b.u) * rr) / d1, v: b.v + ((a.v - b.v) * rr) / d1 };
    const q = { u: b.u + ((c.u - b.u) * rr) / d2, v: b.v + ((c.v - b.v) * rr) / d2 };
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      pts.push({
        u: (1 - t) * (1 - t) * p.u + 2 * (1 - t) * t * b.u + t * t * q.u,
        v: (1 - t) * (1 - t) * p.v + 2 * (1 - t) * t * b.v + t * t * q.v,
      });
    }
  }
  pts.push(raw[raw.length - 1]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].u - pts[i - 1].u, pts[i].v - pts[i - 1].v));
  return { pts, cum, len: cum[cum.length - 1] };
};

// Точка и направление пути на длине s.
export const pathAt = (path: IsoPath, s: number): { pos: UV; heading: number } => {
  const d = clamp(s, 0, path.len);
  let i = 1;
  while (i < path.pts.length - 1 && path.cum[i] < d) i++;
  const a = path.pts[i - 1];
  const b = path.pts[i];
  const seg = path.cum[i] - path.cum[i - 1] || 1;
  const t = clamp((d - path.cum[i - 1]) / seg);
  // направление сглажено по соседним отрезкам (без рывков на изломах)
  const h0 = headingAt(path, Math.max(0, d - 6));
  const h1 = headingAt(path, Math.min(path.len, d + 6));
  return { pos: { u: lerp(a.u, b.u, t), v: lerp(a.v, b.v, t) }, heading: Math.atan2(h0.v + h1.v, h0.u + h1.u) };
};
const headingAt = (path: IsoPath, d: number): UV => {
  let i = 1;
  while (i < path.pts.length - 1 && path.cum[i] < d) i++;
  const a = path.pts[i - 1];
  const b = path.pts[i];
  const l = Math.hypot(b.u - a.u, b.v - a.v) || 1;
  return { u: (b.u - a.u) / l, v: (b.v - a.v) / l };
};

// Часть пути [s0, s1] в экранных точках и её экранная длина.
export const pathScreen = (P: Proj, path: IsoPath, s0: number, s1: number) => {
  const out: Pt[] = [];
  const a = clamp(s0, 0, path.len);
  const b = clamp(s1, 0, path.len);
  if (b <= a) return { d: "", len: 0 };
  out.push(P.p(pathAt(path, a).pos.u, pathAt(path, a).pos.v));
  for (let i = 0; i < path.pts.length; i++) if (path.cum[i] > a && path.cum[i] < b) out.push(P.p(path.pts[i].u, path.pts[i].v));
  const e = pathAt(path, b).pos;
  out.push(P.p(e.u, e.v));
  let len = 0;
  for (let i = 1; i < out.length; i++) len += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y);
  return { d: ptsD(out), len: Math.max(1, len) };
};

// ---------- Блок (параллелепипед) ----------
export type BoxColors = { readonly top: string; readonly left: string; readonly right: string; readonly edge?: string };

// Видимые грани: верх, +v (слева внизу, освещена), +u (справа, в тени).
export const IsoBox: React.FC<{
  readonly P: Proj;
  readonly u: number;
  readonly v: number;
  readonly du: number;
  readonly dv: number;
  readonly z?: number;
  readonly h: number;
  readonly c: BoxColors;
  readonly topFill?: string;
}> = ({ P, u, v, du, dv, z = 0, h, c, topFill }) => {
  const z1 = z + h;
  const sw = Math.max(1, 1.2 * Math.min(P.zoom, 2));
  return (
    <g strokeLinejoin="round">
      <path d={quad(P, [[u, v + dv, z], [u + du, v + dv, z], [u + du, v + dv, z1], [u, v + dv, z1]])} fill={c.left} stroke={c.edge ?? "none"} strokeWidth={sw} />
      <path d={quad(P, [[u + du, v, z], [u + du, v + dv, z], [u + du, v + dv, z1], [u + du, v, z1]])} fill={c.right} stroke={c.edge ?? "none"} strokeWidth={sw} />
      <path d={quad(P, [[u, v, z1], [u + du, v, z1], [u + du, v + dv, z1], [u, v + dv, z1]])} fill={topFill ?? c.top} stroke={c.edge ?? "none"} strokeWidth={sw} />
    </g>
  );
};

// Мягкая тень блока на земле: отбрасывается вправо-вниз (по +u).
export const boxShadow = (P: Proj, u: number, v: number, du: number, dv: number, h: number) => {
  const su = h * 0.55;
  const sv = h * 0.12;
  return quad(P, [
    [u, v, 0],
    [u + du, v, 0],
    [u + du + su, v + sv, 0],
    [u + du + su, v + dv + sv, 0],
    [u + su, v + dv + sv, 0],
    [u, v + dv, 0],
  ]);
};

// Прямоугольник на грани +v (x вдоль u, высота z) или +u (вдоль v).
export const faceV = (P: Proj, v: number, u0: number, u1: number, z0: number, z1: number) => quad(P, [[u0, v, z0], [u1, v, z0], [u1, v, z1], [u0, v, z1]]);
export const faceU = (P: Proj, u: number, v0: number, v1: number, z0: number, z1: number) => quad(P, [[u, v0, z0], [u, v1, z0], [u, v1, z1], [u, v0, z1]]);
export const flat = (P: Proj, u0: number, v0: number, u1: number, v1: number, z = 0) => quad(P, [[u0, v0, z], [u1, v0, z], [u1, v1, z], [u0, v1, z]]);

// ---------- Машина ----------
export const CAR = { l: 78, w: 36 } as const;

export type CarPaint = { readonly top: string; readonly side: string; readonly shade: string; readonly front?: string };
export const GRAPHITE: CarPaint = { top: "#6E7581", side: "#525965", shade: "#3E444E" };
export const SAND: CarPaint = { top: "#E4D6B8", side: "#CBBA97", shade: "#A99878" };

// Пассажиры: бюст в салоне (затылок/лицо — простой силуэт).
export type Rider = { readonly f: number; readonly r: number; readonly kind: "dad" | "boy" | "mom"; readonly o: number };

const RIDER = {
  dad: { head: 6.2, sh: 7.2, hair: "#1F1A19", skin: "#DCAA84", cloth: "#3F6FA6" },
  mom: { head: 5.8, sh: 6.6, hair: "#2A201D", skin: "#E6B590", cloth: "#E07A5F" },
  boy: { head: 4.8, sh: 5.2, hair: "#221B19", skin: "#E8B48D", cloth: "#2F4A7A" },
} as const;

// Машина с курсом heading (радианы в плоскости u-v). Кузов, колёса на
// видимых бортах, фары/фонари, прозрачный салон с пассажирами.
export const IsoCar: React.FC<{
  readonly P: Proj;
  readonly pos: UV;
  readonly heading: number;
  readonly paint: CarPaint;
  readonly riders?: readonly Rider[];
  readonly z?: number; // приподнята (подъёмник)
  readonly roll?: number; // 0…1 — вращение колёс (по пройденному пути)
}> = ({ P, pos, heading, paint, riders = [], z: lift = 0, roll = 0 }) => {
  const hu = Math.cos(heading);
  const hv = Math.sin(heading);
  // правый борт: h × z = (hv, −hu)
  const ru = hv;
  const rv = -hu;
  const W = (f: number, r: number, z: number) => P.p(pos.u + f * hu + r * ru, pos.v + f * hv + r * rv, z + lift);
  const L2 = CAR.l / 2;
  const W2 = CAR.w / 2;
  const zb0 = 5;
  const zb1 = 18;
  const vis = (nu: number, nv: number) => nu + nv > 0.02;
  const face = (pts: readonly (readonly [number, number, number])[]) => ptsD(pts.map(([f, r, z]) => W(f, r, z)), true);
  const sw = Math.max(1, 1.1 * Math.min(P.zoom, 2.2));
  // колесо: круг в плоскости борта
  const wheel = (f: number, side: -1 | 1, key: string) => {
    const pts: Pt[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      pts.push(W(f + Math.cos(a) * 6.2, side * (W2 + 0.6), 6.2 + Math.sin(a) * 6.2));
    }
    const hub: Pt[] = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      hub.push(W(f + Math.cos(a) * 2.6, side * (W2 + 1), 6.2 + Math.sin(a) * 2.6));
    }
    const sa = roll * Math.PI * 2;
    const spoke = [W(f + Math.cos(sa) * 2.4, side * (W2 + 1.1), 6.2 + Math.sin(sa) * 2.4), W(f - Math.cos(sa) * 2.4, side * (W2 + 1.1), 6.2 - Math.sin(sa) * 2.4)];
    return (
      <g key={key}>
        <path d={ptsD(pts, true)} fill="#171A21" />
        <path d={ptsD(hub, true)} fill="#9BA3AF" />
        <path d={ptsD(spoke)} stroke="#5B636F" strokeWidth={sw} />
      </g>
    );
  };
  const sides = [
    { n: [hu, hv], pts: [[L2, -W2, zb0], [L2, W2, zb0], [L2, W2, zb1], [L2, -W2, zb1]], kind: "front" },
    { n: [-hu, -hv], pts: [[-L2, -W2, zb0], [-L2, W2, zb0], [-L2, W2, zb1], [-L2, -W2, zb1]], kind: "rear" },
    { n: [ru, rv], pts: [[-L2, W2, zb0], [L2, W2, zb0], [L2, W2, zb1], [-L2, W2, zb1]], kind: "right" },
    { n: [-ru, -rv], pts: [[-L2, -W2, zb0], [L2, -W2, zb0], [L2, -W2, zb1], [-L2, -W2, zb1]], kind: "left" },
  ] as const;
  // свет слева-сверху: грани, смотрящие на −u (влево), светлее
  const shadeOf = (nu: number) => (nu > 0.35 ? paint.shade : paint.side);
  // салон: усечённая пирамида над кузовом, смещена назад
  const c0 = -L2 + 13;
  const c1 = L2 - 22;
  const zc = 31;
  const cab = {
    b: [[c0, -W2 + 2], [c1, -W2 + 2], [c1, W2 - 2], [c0, W2 - 2]] as const,
    t: [[c0 + 6, -W2 + 5], [c1 - 8, -W2 + 5], [c1 - 8, W2 - 5], [c0 + 6, W2 - 5]] as const,
  };
  const cabFaces = [0, 1, 2, 3].map((i) => {
    const j = (i + 1) % 4;
    const b0 = cab.b[i];
    const b1 = cab.b[j];
    // наружная нормаль грани (по нижнему ребру)
    const ef = b1[0] - b0[0];
    const er = b1[1] - b0[1];
    // для обхода против часовой (f вправо, r вниз) нормаль = (er, −ef)
    const nf = er;
    const nr = -ef;
    const nu = nf * hu + nr * ru;
    const nv = nf * hv + nr * rv;
    return { i, nu, nv, d: face([[b0[0], b0[1], zb1], [b1[0], b1[1], zb1], [cab.t[j][0], cab.t[j][1], zc], [cab.t[i][0], cab.t[i][1], zc]]) };
  });
  // пассажиры: от дальних к ближним
  const rs = [...riders].filter((r) => r.o > 0.01).sort((a, b) => depthOf(a) - depthOf(b));
  function depthOf(r: Rider) {
    return r.f * (hu + hv) + r.r * (ru + rv);
  }
  const visibleSides = sides.filter((s) => vis(s.n[0], s.n[1]));
  const farWheelSide: -1 | 1 = vis(ru, rv) ? -1 : 1;
  return (
    <g strokeLinejoin="round">
      {/* дальние колёса чуть видны под кузовом */}
      {wheel(CAR.l * 0.3, farWheelSide, "fw1")}
      {wheel(-CAR.l * 0.3, farWheelSide, "fw2")}
      {visibleSides.map((s) => (
        <path key={s.kind} d={face(s.pts)} fill={shadeOf(s.n[0])} stroke="rgba(10,16,28,0.35)" strokeWidth={sw * 0.8} />
      ))}
      {/* фары и фонари */}
      {visibleSides.some((s) => s.kind === "front")
        ? ([-1, 1] as const).map((k) => <path key={`hl${k}`} d={face([[L2 + 0.2, k * (W2 - 4), 11], [L2 + 0.2, k * (W2 - 10), 11], [L2 + 0.2, k * (W2 - 10), 15], [L2 + 0.2, k * (W2 - 4), 15]])} fill="#FFF0B3" />)
        : null}
      {visibleSides.some((s) => s.kind === "rear")
        ? ([-1, 1] as const).map((k) => <path key={`tl${k}`} d={face([[-L2 - 0.2, k * (W2 - 4), 11], [-L2 - 0.2, k * (W2 - 10), 11], [-L2 - 0.2, k * (W2 - 10), 15], [-L2 - 0.2, k * (W2 - 4), 15]])} fill="#D98A6E" />)
        : null}
      {/* ближние колёса */}
      {vis(ru, rv) ? [wheel(CAR.l * 0.3, 1, "rw1"), wheel(-CAR.l * 0.3, 1, "rw2")] : null}
      {vis(-ru, -rv) ? [wheel(CAR.l * 0.3, -1, "lw1"), wheel(-CAR.l * 0.3, -1, "lw2")] : null}
      {/* крыша кузова (капот, багажник) */}
      <path d={face([[-L2, -W2, zb1], [L2, -W2, zb1], [L2, W2, zb1], [-L2, W2, zb1]])} fill={paint.top} stroke="rgba(10,16,28,0.35)" strokeWidth={sw * 0.8} />
      {/* пол салона */}
      <path d={face([[c0, -W2 + 2, zb1], [c1, -W2 + 2, zb1], [c1, W2 - 2, zb1], [c0, W2 - 2, zb1]])} fill="#2A3140" />
      {/* пассажиры */}
      {rs.map((r, i) => {
        const st = RIDER[r.kind];
        const base = W(r.f, r.r, zb1 - 1);
        const k = P.zoom;
        return (
          <g key={i} opacity={r.o} transform={`translate(${base.x} ${base.y})`}>
            <rect x={-st.sh * k} y={-st.sh * 1.25 * k} width={st.sh * 2 * k} height={st.sh * 1.25 * k} rx={st.sh * 0.7 * k} fill={st.cloth} />
            <circle cx={0} cy={-(st.sh * 1.2 + st.head * 0.95) * k} r={st.head * k} fill={st.skin} />
            <path
              d={`M ${-st.head * k} ${-(st.sh * 1.2 + st.head * 0.95) * k} a ${st.head * k} ${st.head * k} 0 0 1 ${st.head * 2 * k} 0 Z`}
              fill={st.hair}
            />
          </g>
        );
      })}
      {/* стёкла салона и крыша (прозрачные) */}
      {cabFaces
        .filter((cf) => vis(cf.nu, cf.nv))
        .map((cf) => (
          <path key={`g${cf.i}`} d={cf.d} fill="rgba(150,215,235,0.26)" stroke="rgba(205,245,252,0.75)" strokeWidth={sw * 0.9} />
        ))}
      <path d={face([[cab.t[0][0], cab.t[0][1], zc], [cab.t[1][0], cab.t[1][1], zc], [cab.t[2][0], cab.t[2][1], zc], [cab.t[3][0], cab.t[3][1], zc]])} fill="rgba(170,225,240,0.18)" stroke="rgba(205,245,252,0.85)" strokeWidth={sw * 0.9} />
    </g>
  );
};

// Тень машины на земле.
export const carShadow = (P: Proj, pos: UV, heading: number, lift = 0) => {
  const hu = Math.cos(heading);
  const hv = Math.sin(heading);
  const ru = hv;
  const rv = -hu;
  const o = { u: pos.u + 7 + lift * 0.6, v: pos.v + 2 };
  const L2 = CAR.l / 2 + 2;
  const W2 = CAR.w / 2 + 2;
  return ptsD(
    [
      [L2, -W2],
      [L2, W2],
      [-L2, W2],
      [-L2, -W2],
    ].map(([f, r]) => P.p(o.u + f * hu + r * ru, o.v + f * hv + r * rv)),
    true,
  );
};

// ---------- Фигурки ----------
// Маленькие люди (вид 3/4): ступни в точке (u, v); dir — куда идёт по
// экрану (−1 влево, 1 вправо); phase — фаза шага, amt — размах шага.
export const IsoPerson: React.FC<{
  readonly P: Proj;
  readonly at: UV;
  readonly kind: "boy" | "mom";
  readonly dir: number;
  readonly phase: number;
  readonly amt: number;
  readonly o?: number;
}> = ({ P, at, kind, dir, phase, amt, o = 1 }) => {
  if (o <= 0.01) return null;
  const q = P.p(at.u, at.v);
  const k = P.zoom;
  const sw = Math.sin(phase * Math.PI * 2) * 24 * amt;
  const bob = Math.abs(Math.cos(phase * Math.PI * 2)) * 0.8 * amt;
  const boy = kind === "boy";
  const Hh = boy ? 30 : 40;
  const legH = boy ? 9 : 15;
  const body = boy ? { w: 11, h: 12, c: "#2F4A7A" } : { w: 11, h: 16, c: "#F1DCC6" };
  const head = boy ? 5.6 : 5.2;
  const legC = boy ? "#4A5163" : "#2F3B57";
  const skin = boy ? "#E8B48D" : "#E6B590";
  const hair = boy ? "#221B19" : "#2A201D";
  const s = dir >= 0 ? 1 : -1;
  return (
    <g opacity={o} transform={`translate(${q.x} ${q.y}) scale(${k})`}>
      <ellipse cx={2} cy={0.5} rx={boy ? 6 : 6.5} ry={2} fill="rgba(5,10,25,0.35)" />
      <g transform={`translate(0 ${-bob})`}>
        {/* ноги */}
        <rect x={-3.6} y={-legH} width={3.4} height={legH} rx={1.6} fill={legC} transform={`rotate(${sw} -1.9 ${-legH})`} />
        <rect x={0.2} y={-legH} width={3.4} height={legH} rx={1.6} fill={legC} transform={`rotate(${-sw} 1.9 ${-legH})`} />
        {/* рюкзак (у мальчика, на спине) */}
        {boy ? <rect x={s > 0 ? -body.w / 2 - 3.2 : body.w / 2 - 2.3} y={-legH - body.h + 1} width={5.5} height={9} rx={2} fill="#3E9C6B" /> : null}
        {/* корпус */}
        <rect x={-body.w / 2} y={-legH - body.h} width={body.w} height={body.h + 1} rx={4} fill={body.c} />
        {boy ? <path d={`M -2 ${-legH - body.h} L 0 ${-legH - body.h + 4} L 2 ${-legH - body.h} Z`} fill="#FFFFFF" /> : <rect x={-2} y={-legH - body.h + 1} width={4} height={body.h - 3} rx={1} fill="#E07A5F" />}
        {/* руки */}
        <rect x={-body.w / 2 - 2.2} y={-legH - body.h + 1.5} width={3} height={body.h * 0.8} rx={1.5} fill={body.c} transform={`rotate(${-sw * 0.7} ${-body.w / 2 - 0.7} ${-legH - body.h + 2})`} />
        <rect x={body.w / 2 - 0.8} y={-legH - body.h + 1.5} width={3} height={body.h * 0.8} rx={1.5} fill={body.c} transform={`rotate(${sw * 0.7} ${body.w / 2 + 0.7} ${-legH - body.h + 2})`} />
        {/* голова */}
        <circle cx={s * 0.6} cy={-Hh + head} r={head} fill={skin} />
        {boy ? (
          <path d={`M ${-head + s * 0.6} ${-Hh + head} a ${head} ${head} 0 0 1 ${head * 2} 0 Q ${s * 0.6} ${-Hh + head - 1.5} ${-head + s * 0.6} ${-Hh + head} Z`} fill={hair} />
        ) : (
          <path
            d={`M ${-head - 0.8} ${-Hh + head + 4} Q ${-head - 1.2} ${-Hh - 1} ${0} ${-Hh - 0.5} Q ${head + 1.2} ${-Hh - 1} ${head + 0.8} ${-Hh + head + 4} L ${head * 0.3 + s * 1.5} ${-Hh + head - 2} L ${-head * 0.3 + s * 1.5} ${-Hh + head - 2} Z`}
            fill={hair}
          />
        )}
      </g>
    </g>
  );
};

// Дерево (крона-шар на стволе).
export const IsoTree: React.FC<{ readonly P: Proj; readonly at: UV; readonly s?: number; readonly g?: number }> = ({ P, at, s = 1, g = 1 }) => {
  if (g <= 0.01) return null;
  const q = P.p(at.u, at.v);
  const k = P.zoom * s * g;
  return (
    <g transform={`translate(${q.x} ${q.y}) scale(${k})`}>
      <rect x={-2} y={-16} width={4} height={16} rx={2} fill="#6B4E3A" />
      <circle cx={0} cy={-27} r={14} fill="#2F7A63" />
      <circle cx={-4} cy={-31} r={8} fill="#45A07E" opacity={0.85} />
    </g>
  );
};
export const treeShadow = (P: Proj, at: UV, s = 1) => {
  const q = P.p(at.u + 10 * s, at.v + 2 * s);
  return { cx: q.x, cy: q.y, rx: 15 * s * P.zoom, ry: 7 * s * P.zoom };
};

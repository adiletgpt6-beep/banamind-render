// Ломаные маршрутов: длина, точка на заданной доле, отрезок ломаной.
export type P = { readonly x: number; readonly y: number };
export type Poly = readonly P[];

const seg = (a: P, b: P) => Math.hypot(b.x - a.x, b.y - a.y);
export const polyLength = (p: Poly) => p.slice(1).reduce((s, q, i) => s + seg(p[i], q), 0);

export const pointAt = (p: Poly, u: number): P => {
  let d = Math.max(0, Math.min(1, u)) * polyLength(p);
  for (let i = 1; i < p.length; i++) {
    const l = seg(p[i - 1], p[i]);
    if (d <= l || i === p.length - 1) {
      const t = l ? Math.min(1, d / l) : 1;
      return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * t, y: p[i - 1].y + (p[i].y - p[i - 1].y) * t };
    }
    d -= l;
  }
  return p[p.length - 1];
};

// Начальная часть ломаной до доли u (для прорисовки линии).
export const partial = (p: Poly, u: number): P[] => {
  const total = polyLength(p);
  let d = Math.max(0, Math.min(1, u)) * total;
  const out: P[] = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const l = seg(p[i - 1], p[i]);
    if (d >= l) {
      out.push(p[i]);
      d -= l;
    } else {
      const t = l ? d / l : 0;
      out.push({ x: p[i - 1].x + (p[i].x - p[i - 1].x) * t, y: p[i - 1].y + (p[i].y - p[i - 1].y) * t });
      break;
    }
  }
  return out;
};

export const toPath = (p: readonly P[]) => p.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");

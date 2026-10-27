// LayerGeometryEngine — closed, thick, procedurally generated layer solids.
// Every layer is a real volume (outer surface, inner surface, cut faces /
// side walls), so separated layers show their thickness and section faces.
import * as THREE from "three";

type RGB = [number, number, number];

class Builder {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  col: number[] = [];
  idx: number[] = [];
  groups: { start: number; count: number; mat: number }[] = [];
  private gStart = 0;

  vertex(p: THREE.Vector3, n: THREE.Vector3, u: number, v: number, c: RGB) {
    this.pos.push(p.x, p.y, p.z);
    this.nor.push(n.x, n.y, n.z);
    this.uv.push(u, v);
    this.col.push(c[0], c[1], c[2]);
    return this.pos.length / 3 - 1;
  }
  /** Grid of (nu+1)×(nv+1) vertices from f(i,j); quads → triangles. */
  grid(
    nu: number,
    nv: number,
    f: (i: number, j: number) => { p: THREE.Vector3; n?: THREE.Vector3; u: number; v: number; c: RGB },
    flip = false,
  ) {
    const base = this.pos.length / 3;
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const s = f(i, j);
        this.vertex(s.p, s.n ?? new THREE.Vector3(), s.u, s.v, s.c);
      }
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const a = base + j * (nu + 1) + i;
        const b = a + 1, c = a + nu + 1, d = c + 1;
        if (flip) this.idx.push(a, b, c, b, d, c);
        else this.idx.push(a, c, b, b, c, d);
      }
  }
  endGroup(mat: number) {
    const count = this.idx.length - this.gStart;
    if (count > 0) this.groups.push({ start: this.gStart, count, mat });
    this.gStart = this.idx.length;
  }
  build(computeNormals = false) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    for (const gr of this.groups) g.addGroup(gr.start, gr.count, gr.mat);
    if (computeNormals) g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

const WHITE: RGB = [1, 1, 1];
const sph = (r: number, phi: number, theta: number) =>
  new THREE.Vector3(
    -r * Math.cos(phi) * Math.sin(theta),
    r * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
  );

export interface SectorOptions {
  r0: number;
  r1: number;
  phiStart: number;
  phiLength: number;
  thetaStart: number;
  thetaLength: number;
  segments?: number;
  /** Colour of the section faces as a function of radius. */
  cutColor?: (r: number, a: number) => RGB;
}

/** Spherical shell sector: material groups 0 = outer surface, 1 = inner
 *  surface, 2 = flat section faces (meridian half-planes, equatorial plane). */
export const sphericalSector = (o: SectorOptions) => {
  const b = new Builder();
  const seg = o.segments ?? 64;
  const nu = Math.max(4, Math.round((seg * o.phiLength) / Math.PI));
  const nv = Math.max(4, Math.round((seg * o.thetaLength) / Math.PI));
  const cc = o.cutColor ?? (() => WHITE);
  // outer surface (equirectangular UVs identical to THREE.SphereGeometry)
  b.grid(nu, nv, (i, j) => {
    const phi = o.phiStart + (o.phiLength * i) / nu;
    const th = o.thetaStart + (o.thetaLength * j) / nv;
    const p = sph(o.r1, phi, th);
    return { p, n: p.clone().normalize(), u: phi / (Math.PI * 2), v: 1 - th / Math.PI, c: WHITE };
  });
  b.endGroup(0);
  if (o.r0 > 0) {
    b.grid(nu, nv, (i, j) => {
      const phi = o.phiStart + (o.phiLength * i) / nu;
      const th = o.thetaStart + (o.thetaLength * j) / nv;
      const p = sph(o.r0, phi, th);
      return { p, n: p.clone().normalize().negate(), u: phi / (Math.PI * 2), v: 1 - th / Math.PI, c: cc(o.r0, 0) };
    }, true);
  }
  b.endGroup(1);
  const nr = 10;
  // meridian section faces
  if (o.phiLength < Math.PI * 2 - 1e-4) {
    for (const [phi, sign] of [
      [o.phiStart, -1],
      [o.phiStart + o.phiLength, 1],
    ] as const) {
      const n = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(sign);
      b.grid(nv, nr, (i, j) => {
        const th = o.thetaStart + (o.thetaLength * i) / nv;
        const r = o.r0 + ((o.r1 - o.r0) * j) / nr;
        const p = sph(r, phi, th);
        return { p, n, u: (p.x + 1) / 2, v: (p.y + 1) / 2, c: cc(r, th) };
      }, sign < 0);
    }
  }
  // equatorial section face
  const eqTop = Math.abs(o.thetaStart - Math.PI / 2) < 1e-4; // lower hemisphere → face looks up
  const eqBottom = Math.abs(o.thetaStart + o.thetaLength - Math.PI / 2) < 1e-4;
  if (eqTop || eqBottom) {
    const n = new THREE.Vector3(0, eqTop ? 1 : -1, 0);
    b.grid(nu, nr, (i, j) => {
      const phi = o.phiStart + (o.phiLength * i) / nu;
      const r = o.r0 + ((o.r1 - o.r0) * j) / nr;
      const p = sph(r, phi, Math.PI / 2);
      return { p, n, u: (p.x + 1) / 2, v: (p.z + 1) / 2, c: cc(r, phi) };
    }, eqBottom);
  }
  b.endGroup(2);
  return b.build();
};

/** Closed slab between two height fields over a rectangle (geological strata,
 *  terrain skin). Groups: 0 = top, 1 = bottom, 2 = side walls. */
export const heightSlab = (o: {
  x0: number; x1: number; z0: number; z1: number; nx: number; nz: number;
  bottom: (x: number, z: number) => number;
  top: (x: number, z: number) => number;
  topColor: (x: number, z: number, y: number) => RGB;
  sideColor: (x: number, y: number, z: number) => RGB;
  wallRows?: number;
}) => {
  const b = new Builder();
  const X = (i: number) => o.x0 + ((o.x1 - o.x0) * i) / o.nx;
  const Z = (j: number) => o.z0 + ((o.z1 - o.z0) * j) / o.nz;
  const top = (x: number, z: number) => Math.max(o.top(x, z), o.bottom(x, z));
  b.grid(o.nx, o.nz, (i, j) => {
    const x = X(i), z = Z(j), y = top(x, z);
    return { p: new THREE.Vector3(x, y, z), u: i / o.nx, v: j / o.nz, c: o.topColor(x, z, y) };
  });
  b.endGroup(0);
  b.grid(o.nx, o.nz, (i, j) => {
    const x = X(i), z = Z(j), y = o.bottom(x, z);
    return { p: new THREE.Vector3(x, y, z), u: i / o.nx, v: j / o.nz, c: o.sideColor(x, y, z) };
  }, true);
  b.endGroup(1);
  const rows = o.wallRows ?? 12;
  const wall = (n: number, at: (k: number) => [number, number], flip: boolean) =>
    b.grid(n, rows, (k, r) => {
      const [x, z] = at(k);
      const y0 = o.bottom(x, z), y1 = top(x, z);
      const y = y0 + ((y1 - y0) * r) / rows;
      return { p: new THREE.Vector3(x, y, z), u: k / n, v: r / rows, c: o.sideColor(x, y, z) };
    }, flip);
  wall(o.nx, (k) => [X(k), o.z1], true); // front (+z)
  wall(o.nx, (k) => [X(k), o.z0], false); // back
  wall(o.nz, (k) => [o.x1, Z(k)], false); // right
  wall(o.nz, (k) => [o.x0, Z(k)], true); // left
  b.endGroup(2);
  return b.build(true);
};

/** Thick slab following a parametric surface S(u,v) with half-thickness t
 *  along its normal (leaf layers). Groups: 0 = top, 1 = bottom, 2 = rim. */
export const surfaceSlab = (o: {
  nu: number; nv: number;
  surface: (u: number, v: number) => THREE.Vector3;
  thickness: (u: number, v: number) => number;
  color?: (u: number, v: number, side: number) => RGB;
}) => {
  const b = new Builder();
  const eps = 1e-3;
  const normal = (u: number, v: number) => {
    const p = o.surface(u, v);
    const du = o.surface(Math.min(u + eps, 1), v).sub(o.surface(Math.max(u - eps, 0), v));
    const dv = o.surface(u, Math.min(v + eps, 1)).sub(o.surface(u, Math.max(v - eps, 0)));
    const n = new THREE.Vector3().crossVectors(du, dv);
    if (n.lengthSq() < 1e-12) n.set(0, 0, 1);
    return { p, n: n.normalize() };
  };
  const col = o.color ?? (() => WHITE);
  const at = (u: number, v: number, side: number) => {
    const { p, n } = normal(u, v);
    return p.addScaledVector(n, (side * o.thickness(u, v)) / 2);
  };
  b.grid(o.nu, o.nv, (i, j) => {
    const u = i / o.nu, v = j / o.nv;
    return { p: at(u, v, 1), u, v, c: col(u, v, 1) };
  }, true);
  b.endGroup(0);
  b.grid(o.nu, o.nv, (i, j) => {
    const u = i / o.nu, v = j / o.nv;
    return { p: at(u, v, -1), u, v, c: col(u, v, -1) };
  });
  b.endGroup(1);
  const rim = (n: number, uv: (k: number) => [number, number], flip: boolean) =>
    b.grid(n, 1, (k, s) => {
      const [u, v] = uv(k);
      return { p: at(u, v, s === 0 ? -1 : 1), u, v, c: col(u, v, 0) };
    }, flip);
  rim(o.nu, (k) => [k / o.nu, 0], true);
  rim(o.nu, (k) => [k / o.nu, 1], false);
  rim(o.nv, (k) => [0, k / o.nv], false);
  rim(o.nv, (k) => [1, k / o.nv], true);
  b.endGroup(2);
  return b.build(true);
};

export const hexToRgb = (hex: string): RGB => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
};

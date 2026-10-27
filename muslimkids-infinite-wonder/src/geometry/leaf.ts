// Геометрия листа: настоящая трёхмерная пластинка с изгибом вдоль
// главной жилки и прогибом к верхушке. UV совпадают с текстурой leaf.png
// (scripts/make_textures.py): u — от черешка к верхушке, v — поперёк.
import { BufferAttribute, BufferGeometry } from "three";

/** Полуширина пластинки в долях — та же формула, что в make_textures.py. */
export function leafHalfWidth(u: number) {
  const c = Math.min(1, Math.max(0, u));
  return 0.92 * Math.pow(Math.sin(Math.PI * Math.pow(c, 0.78)), 0.9) * (1 - 0.35 * c * c * c);
}

/**
 * Лист длиной len вдоль +X, ширина вдоль Z, лицевая сторона смотрит в +Y.
 * fold — «лодочка» по главной жилке, arch — прогиб к верхушке.
 */
export function buildLeafGeometry(len: number, width: number, segU: number, segV: number, fold = 0.12, arch = 0.08) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segU; i++) {
    const u = i / segU;
    const hw = Math.max(leafHalfWidth(u), 0.002) * 0.985;
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1;
      const z = v * hw * width * 0.5;
      const y = fold * width * 0.5 * (v * hw) * (v * hw) - arch * len * u * u + 0.02 * len * Math.sin(u * 9 + v * 2) * hw;
      pos.push(u * len, y, z);
      uv.push(u, (v * hw + 1) / 2);
    }
  }
  const row = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j;
      idx.push(a, a + 1, a + row, a + 1, a + row + 1, a + row);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

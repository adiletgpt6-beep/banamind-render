// Процедурная геометрия: рама зеркала с настоящей толщиной и фаской.
import * as THREE from "three";

const roundedRect = (shape: THREE.Shape | THREE.Path, w: number, h: number, r: number) => {
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
};

/** Кольцо-рама: внешний и внутренний скруглённые прямоугольники, выдавливание с фаской. */
export const createFrameGeometry = (w: number, h: number, border: number, radius: number, depth: number) => {
  const outer = new THREE.Shape();
  roundedRect(outer, w + border * 2, h + border * 2, radius + border);
  const hole = new THREE.Path();
  roundedRect(hole, w, h, radius);
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: true,
    bevelThickness: border * 0.35,
    bevelSize: border * 0.3,
    bevelSegments: 5,
    curveSegments: 16,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
};

/** Задняя панель (тёмное стекло) — скруглённый прямоугольник с толщиной. */
export const createBackPanelGeometry = (w: number, h: number, radius: number, depth: number) => {
  const s = new THREE.Shape();
  roundedRect(s, w, h, radius);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 });
  g.translate(0, 0, -depth);
  return g;
};

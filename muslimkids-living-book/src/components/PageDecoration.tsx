import { useMemo } from "react";
import * as THREE from "three";
import { BOOK, type BookState } from "../engines/LivingBookEngine";
import { elementState, tuckIntoGutter, worldVisible } from "../engines/PopUpWorldEngine";
import { starShape } from "../engines/PaperFoldEngine";
import { paper } from "../materials/PaperMaterial";
import { TL } from "../story/timeline";
import { PALETTE as C } from "../styles/palette";
import { clamp, ease } from "../utils/math";

const P = TL.popups.frame;
export const FRAME_Z = -0.3;
const W = 1.4; // ширина рамки
const SIDE = 0.62; // высота прямых сторон
const TOP = 0.98; // вершина стрельчатой арки
const BAND = 0.13; // ширина рамки

/** Контур стрельчатой арки (вдохновлено традиционной архитектурой). */
const archPath = (path: THREE.Path | THREE.Shape, w: number, side: number, top: number, y0: number, ccw = true) => {
  const hw = w / 2;
  // стрельчатая арка из двух дуг с центрами, смещёнными внутрь
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(-hw, y0), new THREE.Vector2(hw, y0), new THREE.Vector2(hw, side));
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const a = (u * Math.PI) / 2;
    pts.push(new THREE.Vector2(hw * Math.cos(a) ** 1.25, side + (top - side) * Math.sin(a) ** 0.85));
  }
  for (let i = steps - 1; i >= 0; i--) {
    const u = i / steps;
    const a = (u * Math.PI) / 2;
    pts.push(new THREE.Vector2(-hw * Math.cos(a) ** 1.25, side + (top - side) * Math.sin(a) ** 0.85));
  }
  pts.push(new THREE.Vector2(-hw, y0));
  const list = ccw ? pts : [...pts].reverse();
  list.forEach((p, i) => (i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y)));
  return list;
};

const frameShape = (inset: number, band: number) => {
  const s = new THREE.Shape();
  archPath(s, W - inset * 2, SIDE, TOP - inset, inset, true);
  const hole = new THREE.Path();
  archPath(hole, W - (inset + band) * 2, SIDE, TOP - inset - band * 1.15, inset + band, false);
  s.holes.push(hole);
  return s;
};

/** Средняя линия рамки — по ней расставлены восьмиконечные звёзды. */
const bandStars = () => {
  const inset = BAND / 2 + 0.005;
  const pts = archPath(new THREE.Path(), W - inset * 2, SIDE, TOP - inset * 1.07, inset, true);
  const out: THREE.Vector2[] = [];
  let acc = 0;
  const step = 0.105;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = a.distanceTo(b);
    while (acc <= d) {
      out.push(a.clone().lerp(b, acc / d));
      acc += step;
    }
    acc -= d;
  }
  return out;
};

/**
 * Декоративная рамка из слоёв бумаги в стиле исламской геометрии:
 * основа, золотой кант, изумрудная лента с восьмиконечными звёздами.
 * Поднимается из центрального сгиба (FOLD UP). Внутри — пустое окно:
 * перевод смысла аята выводится поверх отдельным текстовым блоком,
 * рамка его не пересекает и не деформирует.
 */
export const PageDecoration = ({ t, book }: { t: number; book: BookState }) => {
  const g = useMemo(() => {
    const ex = (s: THREE.Shape, d: number) =>
      new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, -d);
    return {
      base: ex(frameShape(0, BAND), 0.012),
      gold: ex(frameShape(0.012, BAND - 0.024), 0.006),
      emerald: ex(frameShape(0.03, BAND - 0.06), 0.005),
      inner: ex(frameShape(BAND - 0.006, 0.014), 0.006),
      star: new THREE.ExtrudeGeometry(starShape(1, 0.62, 8, Math.PI / 8), { depth: 0.004, bevelEnabled: false }),
      star2: new THREE.ExtrudeGeometry(starShape(0.55, 0.36, 8), { depth: 0.004, bevelEnabled: false }),
      brace: new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.22, 0), new THREE.Vector2(0, 0.5)])),
      stars: bandStars(),
    };
  }, []);
  if (!worldVisible(t, P.rise[0], P.collapse)) return null;
  const up = elementState(t, P.rise, P.collapse, 0, 2, (x) => ease.outBack(x, 0.6));
  const layers = elementState(t, [P.rise[0] + 0.5, P.rise[1] + 0.3], P.collapse, 1, 2);
  const tuck = tuckIntoGutter(t, P.collapse);
  const gy = book.gutterY;
  const sq = 1 - 0.5 * tuck;
  return (
    <group position={[0, gy + 0.001, FRAME_Z]} scale={[sq, 1, sq]} rotation={[(Math.PI / 2) * (1 - up), 0, 0]}>
      <mesh geometry={g.base} material={paper(C.milk)} castShadow receiveShadow />
      <mesh geometry={g.gold} material={paper(C.gold, { metalness: 0.35, roughness: 0.45 })} position={[0, 0, 0.012 * layers + 0.0005]} castShadow />
      <mesh geometry={g.emerald} material={paper(C.emerald)} position={[0, 0, 0.022 * layers + 0.001]} castShadow />
      <mesh geometry={g.inner} material={paper(C.goldLight, { metalness: 0.2, roughness: 0.5 })} position={[0, 0, 0.016 * layers + 0.0008]} castShadow />
      {g.stars.map((p, i) => {
        const s = ease.outBack(clamp(layers * 1.6 - (i / g.stars.length) * 0.6), 1.2);
        if (s <= 0.01) return null;
        return (
          <group key={i} position={[p.x, p.y, 0.03 * layers + 0.0015]} scale={s * 0.042}>
            <mesh geometry={g.star} material={paper(i % 2 ? C.goldLight : C.gold, { metalness: 0.3, roughness: 0.5 })} castShadow />
            <mesh geometry={g.star2} material={paper(C.milk)} position={[0, 0, 0.12]} />
          </group>
        );
      })}
      {/* опоры-треугольники за рамкой (V-сгиб к странице) */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} geometry={g.brace} material={paper(C.paperShadow)} position={[x, 0, -0.012]} rotation={[0, Math.PI / 2, 0]} scale={[up, up, 1]} />
      ))}
    </group>
  );
};

/** Центр окна рамки в мировых координатах (для текстового блока). */
export const frameWindow = (book: BookState) => {
  const ox = -(BOOK.W / 2) * (1 - book.openness);
  const gy = book.gutterY;
  return {
    center: new THREE.Vector3(ox, gy + (BAND + SIDE) / 2 + 0.07, FRAME_Z + 0.03),
    left: new THREE.Vector3(ox - W / 2 + BAND, gy + 0.4, FRAME_Z + 0.03),
    right: new THREE.Vector3(ox + W / 2 - BAND, gy + 0.4, FRAME_Z + 0.03),
    bottom: new THREE.Vector3(ox, gy + BAND, FRAME_Z + 0.03),
    top: new THREE.Vector3(ox, gy + TOP - BAND * 1.15, FRAME_Z + 0.03),
  };
};

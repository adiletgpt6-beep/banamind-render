import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { BOOK, type BookState } from "../engines/LivingBookEngine";
import { coverClothMaterial } from "../materials/PaperMaterial";
import { CoverBoard } from "./BookCover";
import { PageStack, TurningPage } from "./BookPage";

/** Гибкий тканевый корешок между задней обложкой и шарниром створки. */
const Spine = ({ hinge }: { hinge: [number, number] }) => {
  const geom = useMemo(() => new THREE.BufferGeometry(), []);
  const top = 2 * BOOK.cover + BOOK.pages;
  const [hx, hy] = hinge;
  if (hy < 0.012) return null;
  const k = hy / top;
  const p0 = new THREE.Vector2(0, 0.002);
  const p2 = new THREE.Vector2(hx, hy);
  const p1 = new THREE.Vector2(Math.min(0, hx) - 0.05 * k, hy / 2);
  const n = 16;
  const Dc = BOOK.D + BOOK.overhang * 2 - 0.01;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = (1 - u) * (1 - u);
    const b = 2 * (1 - u) * u;
    const c = u * u;
    const x = a * p0.x + b * p1.x + c * p2.x;
    const y = a * p0.y + b * p1.y + c * p2.y;
    pos.push(x, y, -Dc / 2, x, y, Dc / 2);
    if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((n + 1) * 4).fill(0), 2));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return <mesh geometry={geom} material={coverClothMaterial()} castShadow />;
};

/**
 * Объёмная книга: задняя обложка, правый блок, створка (передняя обложка +
 * левый блок), корешок, летящие листы. Дети (pop-up миры) крепятся к
 * системе координат книги: корешок — ось Z при x = 0.
 */
export const Book3D = ({ state, children }: { state: BookState; children?: ReactNode }) => {
  const [hx, hy] = state.hinge;
  return (
    <group position={[-(BOOK.W / 2) * (1 - state.openness), 0, 0]}>
      {/* задняя обложка */}
      <group position={[0, BOOK.cover, 0]}>
        <CoverBoard outer="cloth" inner="cloth" />
      </group>
      <PageStack side="right" thickness={state.right} topKey={state.rightTop} />
      {/* створка: передняя обложка + левый блок страниц */}
      <group position={[hx, hy, 0]} rotation={[0, 0, state.coverAngle]}>
        <CoverBoard outer="art" inner="endpaper" />
        <PageStack side="left" thickness={state.left} topKey={state.leftTop} />
      </group>
      <Spine hinge={state.hinge} />
      {state.turning.map((s) => (
        <TurningPage key={s.id} sheet={s} />
      ))}
      {children}
    </group>
  );
};

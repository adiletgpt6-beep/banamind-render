import { useMemo } from "react";
import * as THREE from "three";
import { BOOK } from "../engines/LivingBookEngine";
import { planarUV, roundedRect } from "../engines/PaperFoldEngine";
import { coverClothMaterial, coverOuterMaterial, endpaperMaterial } from "../materials/PaperMaterial";

const Wc = BOOK.W + BOOK.overhang;
const Dc = BOOK.D + BOOK.overhang * 2;

/**
 * Плита обложки со скруглёнными углами и фаской. Локальная система:
 * x ∈ [0, Wc] от корешка, y ∈ [−c, 0], z — вдоль корешка.
 * outer — лицевая сторона (вверх, пока книга закрыта); inner — форзац.
 */
export const CoverBoard = ({ outer, inner }: { outer: "art" | "cloth"; inner: "endpaper" | "cloth" }) => {
  const { board, top, bottom } = useMemo(() => {
    const c = BOOK.cover;
    const r = 0.045;
    const shape = roundedRect(0, -Dc / 2, Wc, Dc, r);
    const board = new THREE.ExtrudeGeometry(shape, {
      depth: c - 0.008,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 6,
    });
    // Форма в плоскости XY → поворот: выдавливание идёт вниз по y, форма лежит в XZ.
    board.rotateX(Math.PI / 2);
    board.translate(0, -0.004, 0);
    const faceShape = roundedRect(0.006, -Dc / 2 + 0.006, Wc - 0.012, Dc - 0.012, r * 0.8);
    // Лицевая сторона: нормаль вверх (+y). Форзац: нормаль вниз (−y).
    const top = new THREE.ShapeGeometry(faceShape, 6).rotateX(-Math.PI / 2);
    planarUV(top, "x", "z", false, true);
    top.translate(0, 0.0012, 0);
    const bottom = new THREE.ShapeGeometry(faceShape, 6).rotateX(Math.PI / 2);
    planarUV(bottom, "x", "z", true, true);
    bottom.translate(0, -c - 0.0012, 0);
    return { board, top, bottom };
  }, []);
  return (
    <group>
      <mesh geometry={board} material={coverClothMaterial()} castShadow receiveShadow />
      <mesh geometry={top} material={outer === "art" ? coverOuterMaterial() : coverClothMaterial()} receiveShadow />
      <mesh geometry={bottom} material={inner === "endpaper" ? endpaperMaterial() : coverClothMaterial()} receiveShadow />
    </group>
  );
};

import { useMemo } from "react";
import * as THREE from "three";
import { BOOK, type TurningSheet } from "../engines/LivingBookEngine";
import { createSheetGeometry, updateSheetGeometry } from "../engines/PageTurnEngine";
import { pageEdgeMaterial, pageMaterial } from "../materials/PaperMaterial";

/** Перелистываемый лист с толщиной — геометрия обновляется каждый кадр. */
export const TurningPage = ({ sheet }: { sheet: TurningSheet }) => {
  const geom = useMemo(() => createSheetGeometry(), []);
  const thick = sheet.thickness > 0.01;
  updateSheetGeometry(geom, {
    width: BOOK.W - 0.004,
    depth: BOOK.D - 0.004,
    thickness: sheet.thickness,
    progress: sheet.progress,
    yRight: sheet.yRight,
    yLeft: sheet.yLeft,
    // Толстая пачка страниц гнётся меньше одиночного листа.
    bend: thick ? 0.32 : 0.95,
    curl: thick ? 0.25 : 0.6,
  });
  const mats = useMemo(
    () => [pageMaterial(sheet.front), pageMaterial(sheet.back), pageEdgeMaterial()],
    [sheet.front, sheet.back],
  );
  return <mesh geometry={geom} material={mats} castShadow receiveShadow />;
};

/** Блок страниц: срез + верхняя страница с иллюстрацией. */
export const PageStack = ({
  thickness,
  topKey,
  side,
}: {
  thickness: number;
  topKey: string;
  side: "right" | "left";
}) => {
  const top = useMemo(() => {
    const g = new THREE.PlaneGeometry(BOOK.W - 0.006, BOOK.D, 1, 1);
    if (side === "right") {
      g.rotateX(-Math.PI / 2);
    } else {
      // Левый блок живёт в повёрнутой на π створке: верх смотрит в −y локально.
      g.rotateX(Math.PI / 2);
      const uv = g.getAttribute("uv") as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - uv.getX(i), 1 - uv.getY(i));
    }
    g.translate((BOOK.W - 0.006) / 2 + 0.003, 0, 0);
    return g;
  }, [side]);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0), []);
  if (thickness < 0.0005) return null;
  const mat = topKey === "endpaper" ? null : pageMaterial(topKey);
  const y0 = side === "right" ? BOOK.cover : -BOOK.cover - thickness + 0.0006;
  return (
    <group>
      <mesh
        geometry={box}
        material={pageEdgeMaterial()}
        position={[0.003, y0, 0]}
        scale={[BOOK.W - 0.006, thickness - 0.0006, BOOK.D]}
        castShadow
        receiveShadow
      />
      {mat ? (
        <mesh
          geometry={top}
          material={mat}
          position={[0, side === "right" ? BOOK.cover + thickness : -BOOK.cover - thickness, 0]}
          receiveShadow
        />
      ) : null}
    </group>
  );
};

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { fontFamily } from "../../fonts";

// Предметы: телефон (экран — текстура canvas с кыргызским интерфейсом),
// часы, сумка, портфель и др. Размеры в метрах.

export const BRAND = { navy: "#14285A", yellow: "#FFC90E", white: "#FFFFFF" } as const;

// Шрифт для canvas должен быть загружен до первого рисования. Через
// Suspense (внутри ThreeCanvas): рендер кадра ждёт загрузки.
let fontsLoaded = false;
let fontPromise: Promise<void> | null = null;
export const useFontReady = () => {
  if (fontsLoaded) return true;
  if (!fontPromise)
    fontPromise = Promise.all([document.fonts.load(`900 40px ${fontFamily}`), document.fonts.load(`800 40px ${fontFamily}`), document.fonts.load(`700 40px ${fontFamily}`)]).then(() => {
      fontsLoaded = true;
    });
  throw fontPromise;
};

export type ScreenDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// Текстура экрана: перерисовывается, когда меняется key (состояние UI).
export const useScreenTexture = (draw: ScreenDraw, key: string, w = 540, h = 1140) => {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }, [w, h]);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);
  useMemo(() => {
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, canvas, tex]);
  return tex;
};

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Перенос строк по ширине.
export const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxW: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
};

const phoneBody = new RoundedBoxGeometry(0.074, 0.156, 0.0085, 4, 0.009);

// Телефон: корпус + экран. Начало координат — центр, экран смотрит в +Z.
export const Phone: React.FC<{
  readonly screen: THREE.Texture | null;
  readonly glow?: number;
  readonly matrix?: THREE.Matrix4;
}> = ({ screen, glow = 1, matrix }) => {
  const group = useMemo(() => new THREE.Group(), []);
  if (matrix) {
    group.matrixAutoUpdate = false;
    group.matrix.copy(matrix);
  }
  return (
    <primitive object={group}>
      <mesh geometry={phoneBody} castShadow>
        <meshStandardMaterial color="#1B1F2A" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.00436]}>
        <planeGeometry args={[0.0675, 0.146]} />
        {screen ? (
          <meshBasicMaterial map={screen} toneMapped={false} color={new THREE.Color(glow, glow, glow)} />
        ) : (
          <meshStandardMaterial color="#0B0E14" roughness={0.2} metalness={0.1} />
        )}
      </mesh>
    </primitive>
  );
};

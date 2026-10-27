// InvisiblePainterEngine — сборка кадра «Невидимого художника».
//
// Конвейер кадра (чистая функция номера кадра, без накопления состояния):
//   1. слой краски (прозрачный холст): сцены кладут пигмент в мировых
//      координатах с камерой; multiply — акварель, source-over — гуашь,
//      destination-out — «резерв» бумаги и светлые размывы;
//   2. Pigment Granulation — зерно, привязанное к миру, выбирает часть пигмента;
//   3. бумага: тёплый тон + фактура волокон (Paper Absorption);
//   4. краска ложится на бумагу в режиме multiply;
//   5. свет (PainterlyLightingSystem) — мягкие сияния режимом screen.

import { applyCamera, cameraAt, H, W, type Cam, type CamKey } from "./PainterlyCameraController";
import { LightQueue, PALETTE } from "./PainterlyLightingSystem";
import { grainTexture, paperTexture } from "./WatercolorSimulationEngine";

export type PaintCtx = {
  p: CanvasRenderingContext2D;
  cam: Cam;
  lights: LightQueue;
  /** вернуть мировую трансформацию (с параллаксом depth) */
  world: (depth?: number) => void;
};

export type ScenePart = {
  from: number;
  to: number;
  camera: CamKey[];
  draw: (pc: PaintCtx, f: number) => void;
};

let paintCanvas: HTMLCanvasElement | null = null;

export function renderFrame(main: CanvasRenderingContext2D, f: number, parts: ScenePart[]) {
  const part = parts.find((s) => f >= s.from && f < s.to) ?? parts[parts.length - 1];
  const cam = cameraAt(part.camera, f);
  if (!paintCanvas) {
    paintCanvas = document.createElement("canvas");
    paintCanvas.width = W;
    paintCanvas.height = H;
  }
  const p = paintCanvas.getContext("2d")!;
  // полный сброс состояния холста: кадр не должен зависеть от предыдущего кадра вкладки
  p.reset();
  main.reset();
  p.setTransform(1, 0, 0, 1, 0, 0);
  p.globalCompositeOperation = "source-over";
  p.globalAlpha = 1;
  p.clearRect(0, 0, W, H);
  const lights = new LightQueue();
  const pc: PaintCtx = { p, cam, lights, world: (d = 1) => applyCamera(p, cam, d) };
  pc.world();
  part.draw(pc, f);

  // мировая матрица для текстур (бумага и зерно движутся вместе с холстом);
  // при сильном приближении масштаб текстуры ограничен, чтобы не было «пикселей»
  applyCamera(p, { ...cam, zoom: Math.min(cam.zoom, 1.6) });
  const m = p.getTransform();
  p.setTransform(1, 0, 0, 1, 0, 0);
  const grain = p.createPattern(grainTexture(), "repeat")!;
  grain.setTransform(m);
  p.globalCompositeOperation = "destination-out";
  p.globalAlpha = 0.13;
  p.fillStyle = grain;
  p.fillRect(0, 0, W, H);

  main.setTransform(1, 0, 0, 1, 0, 0);
  main.globalCompositeOperation = "source-over";
  main.globalAlpha = 1;
  main.fillStyle = PALETTE.paper;
  main.fillRect(0, 0, W, H);
  const paper = main.createPattern(paperTexture(), "repeat")!;
  paper.setTransform(m.scale(1.3));
  main.globalCompositeOperation = "multiply";
  main.globalAlpha = 0.55;
  main.fillStyle = paper;
  main.fillRect(0, 0, W, H);
  main.globalAlpha = 1;
  main.drawImage(paintCanvas, 0, 0);
  // фактура бумаги проступает и сквозь краску
  main.globalAlpha = 0.25;
  main.fillStyle = paper;
  main.fillRect(0, 0, W, H);
  main.globalAlpha = 1;
  lights.apply(main, W, H);
}

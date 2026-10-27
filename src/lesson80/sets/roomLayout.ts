// Планировка учебной комнаты (px мира) — без зависимостей от React, чтобы
// её читали и Node-скрипты (тесты, хореография). Рисунок — Classroom.tsx.
import { TREE } from "./treeLayout.ts";

export const ROOM = {
  w: 2600,
  h: 1500,
  floorY: 1000,
  window: { x: 1930, y: 140, w: 470, h: 520, sill: 28 },
  board: { x: 300, y: 210, w: 760, h: 420 },
  shelf: { x: 1240, y: 250, w: 420, h: 380 },
  // низкий столик у окна (бумага на нём)
  table: { x: 1660, top: 1110, w: 300, h: 60, legH: 70 },
  plant: { x: 2180, y: 640 },
  // ряды на ковре: y ступней по рядам (0 — ближний к камере)
  rowY: [1270, 1170, 1085, 1020] as const,
  // учитель
  teacher: { x: 560, y: 1250 },
  // масштаб вида из окна (мир дерева → окно)
  windowScale: 0.205,
} as const;

// Положение вида дерева в окне: развилка с гнездом — в правой части окна.
export const windowOrigin = () => {
  const w = ROOM.window;
  const k = ROOM.windowScale;
  return { x: w.x + w.w * 0.6 - TREE.fork.x * k, y: w.y + w.h * 0.42 - TREE.fork.y * k, k };
};

// Масштаб глубины: ближе к камере — крупнее.
export const depth = (y: number) => 1 + (y - ROOM.rowY[3]) * 0.00062;


// Пресеты камеры. Комната: координаты мира комнаты (px) и масштаб кадра
// 1920×1080. Дерево: координаты мира дерева.
import type { Cam } from "../core/shots";
import { ROOM } from "../sets/Classroom";
import { TREE } from "../sets/treeLayout";

export const ROOM_CAM = {
  wide: { x: 1300, y: 790, zoom: 0.74 },
  wideRight: { x: 1500, y: 800, zoom: 0.8 },
  group: { x: 1250, y: 960, zoom: 1.05 }, // учитель + главные мальчики + окно
  kids: { x: 1240, y: 1010, zoom: 1.4 }, // три главных мальчика
  kidsWindow: { x: 1500, y: 880, zoom: 1.15 }, // мальчики и окно
  yusuf: { x: 1232, y: 1005, zoom: 3.1 },
  amir: { x: 1034, y: 960, zoom: 2.8 },
  bilal: { x: 1444, y: 935, zoom: 2.6 },
  amirBilal: { x: 1240, y: 990, zoom: 1.7 },
  teacherMed: { x: 830, y: 790, zoom: 1.3 }, // учитель ближе к группе, присев
  teacherCU: { x: 790, y: 650, zoom: 1.65 },
  teacherStandCU: { x: 600, y: 560, zoom: 2.0 },
  teacherKids: { x: 900, y: 940, zoom: 1.0 }, // учитель и дети вместе
  teacherWindow: { x: 1250, y: 700, zoom: 0.9 }, // учитель и окно в одном кадре
  window: { x: ROOM.window.x + ROOM.window.w / 2, y: ROOM.window.y + ROOM.window.h / 2 + 40, zoom: 1.5 },
  board: { x: ROOM.board.x + ROOM.board.w / 2, y: ROOM.board.y + ROOM.board.h / 2 + 20, zoom: 1.6 },
  table: { x: ROOM.table.x, y: ROOM.table.top - 20, zoom: 2.6 },
  paper: { x: 1250, y: 1150, zoom: 3.0 },
  crowd: { x: 1150, y: 980, zoom: 0.95 }, // спокойный общий план детей
} as const satisfies Record<string, Cam>;

export const TREE_CAM = {
  wide: { x: 1240, y: 760, zoom: 0.78 },
  nest: { x: TREE.nest.x - 60, y: TREE.nest.y + 10, zoom: 1.9 },
  nestDetail: { x: TREE.nest.x, y: TREE.nest.y - 10, zoom: 2.8 },
  nestWide: { x: 1350, y: 740, zoom: 1.25 },
  lowPerch: { x: TREE.perchLow.x + 60, y: TREE.perchLow.y - 70, zoom: 1.9 },
  ground: { x: TREE.grassSpot.x + 110, y: TREE.groundY - 70, zoom: 2.0 },
  flight: { x: 1150, y: 820, zoom: 0.95 },
  flightUp: { x: 1000, y: 950, zoom: 0.8 },
} as const satisfies Record<string, Cam>;

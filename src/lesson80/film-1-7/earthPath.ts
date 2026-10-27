// Итоговый рисунок Земли: пути карандаша по порядку (круг → суша → штриховка
// ночной половины → лучи лампы → точка города на светлой стороне → стрелка
// вращения против часовой стрелки, как во вставке «вид сверху»). Чистый
// модуль: его читают хореография (кончик карандаша) и тесты.
import { getLength, getPointAtLength } from "@remotion/paths";

export const SHEET_W = 300;
export const SHEET_H = 220;
const PENCIL = "#3B3A44";

export const EARTH_CENTER = { x: 150, y: 118 };
export const EARTH_R = 70;
export const EARTH_STROKES: readonly { readonly id: string; readonly d: string; readonly color: string; readonly w: number; readonly fill?: string }[] = [
  // слегка неровный круг (две дуги)
  { id: "circle", d: "M 150 48 C 192 46 222 82 220 120 C 218 160 186 190 148 188 C 108 186 78 156 80 116 C 82 78 110 50 150 48 Z", color: PENCIL, w: 3 },
  // условные пятна суши
  { id: "land1", d: "M 112 84 C 128 76 146 80 150 92 C 154 104 138 112 126 110 C 114 108 104 94 112 84 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  { id: "land2", d: "M 168 110 C 182 102 198 112 196 128 C 194 142 178 150 166 142 C 156 134 158 116 168 110 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  { id: "land3", d: "M 120 140 C 132 136 144 146 140 158 C 136 168 120 166 114 156 C 110 148 112 142 120 140 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  // штриховка ночной (левой) половины
  { id: "shade1", d: "M 86 100 L 118 64 M 82 122 L 134 58 M 84 144 L 148 70 M 92 164 L 150 96 M 104 180 L 150 128 M 122 188 L 150 158", color: "#5A6A95", w: 2 },
  // жёлтые лучи света справа (лампа) — коротко
  { id: "rays", d: "M 252 100 L 270 94 M 254 118 L 274 118 M 252 136 L 270 142", color: "#E0B22C", w: 3 },
  // точка города на светлой стороне
  { id: "dot", d: "M 186 88 a 5 5 0 1 0 0.1 0 Z", color: "#C8372D", w: 3, fill: "#E8553D" },
  // стрелка вращения против часовой стрелки (дуга справа-сверху влево)
  { id: "arrow", d: "M 214 66 C 232 92 232 146 210 172", color: "#2F4A7A", w: 3 },
  { id: "arrowHead", d: "M 222 160 L 210 172 L 196 164", color: "#2F4A7A", w: 3 },
];
export const EARTH_TOTAL = EARTH_STROKES.reduce((a, s) => a + getLength(s.d), 0);

// Длина пути, пройденная карандашом к моменту reveal (0…EARTH_TOTAL).
export const pencilTip = (len: number): { x: number; y: number; stroke: string } => {
  let acc = 0;
  for (const s of EARTH_STROKES) {
    const L = getLength(s.d);
    if (len <= acc + L) {
      const p = getPointAtLength(s.d, Math.max(0, len - acc)) ?? { x: EARTH_CENTER.x, y: EARTH_CENTER.y };
      return { x: p.x, y: p.y, stroke: s.id };
    }
    acc += L;
  }
  const last = EARTH_STROKES[EARTH_STROKES.length - 1];
  const p = getPointAtLength(last.d, getLength(last.d)) ?? { x: EARTH_CENTER.x, y: EARTH_CENTER.y };
  return { x: p.x, y: p.y, stroke: last.id };
};
// Начало штриха (длина от начала рисунка) — для синхронизации с репликами.
export const strokeStart = (id: string) => {
  let acc = 0;
  for (const s of EARTH_STROKES) {
    if (s.id === id) return acc;
    acc += getLength(s.d);
  }
  return acc;
};


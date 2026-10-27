import { TL, type SheetSpec } from "../story/timeline";
import { clamp, ease, prog } from "../utils/math";

/**
 * LivingBookEngine — состояние книги в момент времени t (секунды).
 *
 * Книга: задняя обложка + правый блок страниц лежат неподвижно; передняя
 * обложка вместе с «левым» блоком — одна створка, которая поворачивается
 * вокруг корешка. Отдельные листы перелистывает PageTurnEngine. Толщины
 * блоков пересчитываются по уже перевёрнутым листам, а верхняя страница
 * каждого блока — это лицо следующего листа справа и оборот последнего
 * перевёрнутого листа слева. Тот же механизм закрывает книгу в финале.
 */

export const BOOK = {
  W: 1.0, // ширина страницы (от корешка)
  D: 1.4, // высота страницы (вдоль корешка)
  cover: 0.03, // толщина обложки
  overhang: 0.035, // выступ обложки над блоком
  pages: TL.book.totalPages,
};

export type TurningSheet = {
  id: string;
  index: number;
  progress: number;
  thickness: number;
  front: string;
  back: string;
  yRight: number;
  yLeft: number;
};

export type BookState = {
  coverAngle: number;
  hinge: [number, number];
  left: number;
  right: number;
  leftTop: string;
  rightTop: string;
  turning: TurningSheet[];
  /** 0 — закрыта, 1 — раскрыта (для сдвига книги к центру кадра). */
  openness: number;
  /** Высота поверхности страницы над столом: слева/справа от корешка. */
  surfaceY: (x: number) => number;
  gutterY: number;
};

const sheetProgress = (s: SheetSpec, t: number) => {
  let p = 0;
  for (const [a, b, dir] of s.turns) {
    if (t < a) break;
    const e = ease.inOutSine(clamp((t - a) / (b - a)));
    p = dir > 0 ? e : 1 - e;
  }
  return p;
};

export const coverAngleAt = (t: number) => {
  const open = prog(t, TL.book.coverOpen, ease.inOutCubic);
  const close = prog(t, TL.book.coverClose, ease.inOutCubic);
  return Math.PI * (open - close);
};

export const computeBookState = (t: number): BookState => {
  const sheets = TL.book.sheets;
  const total = sheets.reduce((a, s) => a + s.thickness, 0);
  const base = BOOK.pages - total;
  const c = BOOK.cover;
  let left = 0;
  let right = base;
  let leftTop = "endpaper";
  let rightTop = TL.book.baseTop;
  const turning: TurningSheet[] = [];
  const progresses = sheets.map((s) => sheetProgress(s, t));
  sheets.forEach((s, i) => {
    const p = progresses[i];
    if (p >= 1) {
      left += s.thickness;
      leftTop = s.back;
    }
  });
  for (let i = sheets.length - 1; i >= 0; i--) {
    if (progresses[i] <= 0) {
      right += sheets[i].thickness;
      rightTop = sheets[i].front;
    }
  }
  sheets.forEach((s, i) => {
    const p = progresses[i];
    if (p > 0 && p < 1) {
      turning.push({
        id: s.id,
        index: i,
        progress: p,
        thickness: s.thickness,
        front: s.front,
        back: s.back,
        yRight: c + right,
        yLeft: c + left,
      });
    }
  });
  // Порядок наслоения нескольких одновременно летящих листов.
  turning.forEach((tr, k) => {
    tr.yLeft += k * 0.0012;
    tr.yRight += (turning.length - 1 - k) * 0.0012;
  });

  const alpha = coverAngleAt(t);
  const top = 2 * c + BOOK.pages;
  // Корешок гибкий: шарнир опускается и уходит влево, чтобы створка
  // не задевала блок страниц.
  const hinge: [number, number] = [-(c + left) * Math.sin(alpha) * 1.05, top * Math.cos(alpha / 2) ** 2];
  const openness = alpha / Math.PI;
  const surfaceY = (x: number) => (x < 0 ? c + left : c + right);
  return {
    coverAngle: alpha,
    hinge,
    left,
    right,
    leftTop,
    rightTop,
    turning,
    openness,
    surfaceY,
    gutterY: c + Math.max(left, right),
  };
};

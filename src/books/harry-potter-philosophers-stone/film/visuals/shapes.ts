// Предметные формы для точечной сборки BM-031 (локальные координаты, центр 0,0,
// размер ≈ 300 по большей стороне). Только собственные нейтральные предметы фильма:
// компас, конверт, домик, щит, маска и т. п. — никаких гербов, шляп, замков,
// мётел или узнаваемых предметов франшизы.
import { SH } from "./dots";

type Inside = (x: number, y: number) => boolean;

const rectAt = (x: number, y: number, w: number, h: number, r = 0): Inside => SH.move(SH.rect(w, h, r), x, y);
const tri = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): Inside => (x, y) => {
  const s = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
  const d1 = s(x, y, ax, ay, bx, by);
  const d2 = s(x, y, bx, by, cx, cy);
  const d3 = s(x, y, cx, cy, ax, ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};

// компас: кольцо, ромб-стрелка, центр
export const compass: Inside = SH.union(SH.ring(120, 150), tri(0, -110, 26, 0, -26, 0), tri(0, 110, 26, 0, -26, 0), SH.circle(18));

// конверт
export const envelope: Inside = SH.union(SH.minus(rectAt(0, 0, 300, 200, 16), rectAt(0, 0, 260, 160, 8)), SH.strokes([[-130, -80, 0, 20, 130, -80]], 22));

// домик
export const house: Inside = SH.union(tri(-170, -10, 170, -10, 0, -150), SH.minus(rectAt(0, 80, 260, 180, 8), rectAt(-60, 110, 60, 120, 6)), rectAt(70, 50, 60, 50, 6));

// щит
export const shield: Inside = SH.shield(150);

// маска с двумя «лицами»: две половины со сдвигом
export const mask: Inside = SH.union(
  SH.minus(SH.move(SH.circle(110), -60, 0), SH.union(SH.move(SH.circle(16), -95, -25), SH.move(SH.circle(16), -35, -25), SH.strokes([[-100, 45, -60, 60, -20, 45]], 12))),
  SH.minus(SH.move(SH.ring(80, 110), 70, 0), rectAt(150, 0, 60, 300)),
  SH.move(SH.circle(14), 45, -25),
  SH.move(SH.circle(14), 105, -25),
  SH.strokes([[40, 65, 75, 50, 110, 65]], 12),
);

// ступени
export const steps: Inside = SH.union(rectAt(-120, 90, 100, 60, 6), rectAt(-20, 40, 100, 160, 6), rectAt(80, -10, 100, 260, 6));

// два сцепленных кольца — «мы»
export const link: Inside = SH.union(SH.move(SH.ring(70, 110), -70, 0), SH.move(SH.ring(70, 110), 70, 0));

// сердце
export const heart: Inside = SH.heart(150);

// звезда
export const star: Inside = (x, y) => {
  const a = Math.atan2(y, x) + Math.PI / 2;
  const r = Math.hypot(x, y);
  const k = (Math.cos(5 * a) + 1) / 2;
  return r <= 70 + 90 * k;
};

// вопросительный знак
export const question: Inside = SH.union(SH.strokes([[-80, -80, -60, -140, 0, -160, 60, -140, 80, -90, 60, -40, 0, 0, 0, 60]], 50), SH.move(SH.circle(30), 0, 130));

// глаз
export const eye: Inside = (x, y) => {
  const outer = Math.abs(x) <= 170 && Math.abs(y) <= 90 * (1 - (x / 170) ** 2);
  const inner = Math.abs(x) <= 146 && Math.abs(y) <= 66 * (1 - (x / 146) ** 2);
  const d = Math.hypot(x, y);
  return (outer && !inner) || (d >= 34 && d <= 60) || d <= 16;
};

// ухо
export const ear: Inside = SH.union(
  SH.minus(SH.move(SH.circle(130), 0, -40), SH.move(SH.circle(78), 18, -40)),
  SH.minus(rectAt(-40, 90, 100, 120, 40), SH.move(SH.circle(60), 30, 120)),
  SH.strokes([[-10, -60, 30, -80, 60, -40, 30, 0, 20, 40]], 26),
);

// ключ
export const key: Inside = SH.union(SH.minus(SH.circle(70), SH.circle(30)), rectAt(120, 0, 180, 30, 8), rectAt(170, 30, 22, 40, 4), rectAt(205, 26, 22, 32, 4));

// книга (раскрытая)
export const book: Inside = SH.union(
  SH.minus(rectAt(-80, 0, 150, 220, 10), rectAt(-80, 0, 116, 186, 6)),
  SH.minus(rectAt(80, 0, 150, 220, 10), rectAt(80, 0, 116, 186, 6)),
  rectAt(-80, -50, 90, 14, 4),
  rectAt(-80, -10, 90, 14, 4),
  rectAt(-80, 30, 90, 14, 4),
  rectAt(80, -50, 90, 14, 4),
  rectAt(80, -10, 90, 14, 4),
  rectAt(80, 30, 90, 14, 4),
);

// стекло-рамка (террариум)
export const glass: Inside = SH.union(SH.minus(rectAt(0, 0, 320, 210, 14), rectAt(0, 0, 280, 170, 8)), SH.strokes([[-110, 40, -60, 10, -10, 40, 40, 10, 90, 40]], 20));

// колокол тревоги
export const alarm: Inside = SH.union(SH.minus(SH.move(SH.circle(120), 0, 10), rectAt(0, 120, 300, 120)), rectAt(0, 60, 280, 30, 12), SH.move(SH.circle(26), 0, 100), SH.move(SH.circle(16), 0, -120));

// подарок
export const gift: Inside = SH.union(SH.minus(rectAt(0, 40, 260, 200, 10), SH.union(rectAt(0, 40, 30, 220), rectAt(0, 40, 280, 30))), rectAt(0, -80, 290, 50, 10), SH.move(SH.ring(16, 40), -36, -130), SH.move(SH.ring(16, 40), 36, -130));

// камень-кристалл
export const gem: Inside = SH.union(tri(-120, -40, 120, -40, 0, 140), tri(-120, -40, -60, -110, 0, -40), tri(-60, -110, 60, -110, 0, -40), tri(60, -110, 120, -40, 0, -40));

// пешка
export const pawn: Inside = SH.union(SH.move(SH.circle(44), 0, -110), rectAt(0, -30, 70, 90, 20), tri(-80, 110, 80, 110, 0, -10), rectAt(0, 120, 200, 40, 12));

// пара носков
const sock = (dx: number): Inside => SH.union(rectAt(dx, -40, 70, 170, 14), SH.move(SH.rect(130, 66, 30), dx + 30, 70));
export const socks: Inside = SH.union(sock(-70), sock(60));

// галочка
export const check: Inside = SH.strokes([[-140, 0, -40, 100, 150, -110]], 60);

export const SHAPES = { compass, envelope, house, shield, mask, steps, link, heart, star, question, eye, ear, key, book, glass, alarm, gift, gem, pawn, socks, check };
export type ShapeName = keyof typeof SHAPES;

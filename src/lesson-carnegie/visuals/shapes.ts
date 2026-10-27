// Предметные формы для точечной сборки BM-025 (локальные координаты, центр 0,0,
// размер ≈ 300 по большей стороне). Из точек фразы собираются эти силуэты, затем
// на их месте остаются устойчивые векторные схемы.
import { SH } from "./dots";

type Inside = (x: number, y: number) => boolean;

const rectAt = (x: number, y: number, w: number, h: number, r = 0): Inside => SH.move(SH.rect(w, h, r), x, y);

// кирпичная стена (обвинение «строит стену»)
export const wall: Inside = (() => {
  const bricks: Inside[] = [];
  for (let row = 0; row < 5; row++)
    for (let i = -2; i <= 2; i++) {
      const off = row % 2 ? 40 : 0;
      const x = i * 82 + off - (row % 2 ? 40 : 0);
      if (Math.abs(x) > 180) continue;
      bricks.push(rectAt(x, -120 + row * 60, 72, 48, 6));
    }
  return SH.union(...bricks);
})();

// доска моста (признанная ошибка / вопрос кладут доску)
export const plank: Inside = SH.union(rectAt(0, 0, 320, 60, 12), rectAt(-130, 44, 22, 40, 4), rectAt(130, 44, 22, 40, 4));

// ключ (вопрос открывает)
export const key: Inside = SH.union(SH.minus(SH.circle(70), SH.circle(30)), SH.move(SH.circle(0.001), 0, 0), rectAt(120, 0, 180, 30, 8), rectAt(170, 30, 22, 40, 4), rectAt(205, 26, 22, 32, 4));

// открытая дверь
export const door: Inside = SH.union(SH.minus(rectAt(0, 0, 220, 300, 18), rectAt(10, 10, 170, 260, 10)), rectAt(-40, 10, 70, 250, 6));

// сердце (искренняя оценка)
export const heart: Inside = SH.heart(150);

// ухо (слушание)
export const ear: Inside = SH.union(
  SH.minus(SH.move(SH.circle(130), 0, -40), SH.move(SH.circle(78), 18, -40)),
  SH.minus(rectAt(-40, 90, 100, 120, 40), SH.move(SH.circle(60), 30, 120)),
  SH.strokes([[-10, -60, 30, -80, 60, -40, 30, 0, 20, 40]], 26),
);

// вопросительный знак
export const question: Inside = SH.union(SH.strokes([[-80, -80, -60, -140, 0, -160, 60, -140, 80, -90, 60, -40, 0, 0, 0, 60]], 50), SH.move(SH.circle(30), 0, 130));

// галочка
export const check: Inside = SH.strokes([[-140, 0, -40, 100, 150, -110]], 60);

// кубок (выигранный спор)
export const trophy: Inside = SH.union(
  SH.minus(SH.move(SH.circle(120), 0, -70), rectAt(0, -170, 300, 110)),
  rectAt(0, -110, 240, 20),
  rectAt(0, 40, 40, 90, 6),
  rectAt(0, 110, 180, 40, 10),
  SH.minus(SH.move(SH.ring(36, 58), -128, -60), rectAt(-90, -60, 40, 160)),
  SH.minus(SH.move(SH.ring(36, 58), 128, -60), rectAt(90, -60, 40, 160)),
);

// рыболовный крючок с наживкой-точкой
export const hook: Inside = SH.union(SH.strokes([[0, -160, 0, 60, -10, 110, -60, 130, -100, 100, -100, 60]], 34), SH.move(SH.circle(26), 0, -170));

// табличка с именем
export const nameTag: Inside = SH.minus(rectAt(0, 0, 340, 200, 30), rectAt(0, 30, 280, 90, 14));

// лампочка (идея)
export const bulb: Inside = SH.union(SH.move(SH.circle(110), 0, -50), rectAt(0, 80, 110, 50, 10), rectAt(0, 130, 90, 30, 10));

// ступени (шаг за шагом)
export const steps: Inside = SH.union(rectAt(-120, 90, 100, 60, 6), rectAt(-20, 40, 100, 160, 6), rectAt(80, -10, 100, 260, 6));

// рука, протянутая вперёд (простой силуэт ладони)
export const hand: Inside = SH.union(rectAt(0, 40, 150, 170, 40), rectAt(-60, -80, 36, 120, 18), rectAt(-18, -100, 36, 150, 18), rectAt(24, -90, 36, 140, 18), rectAt(64, -60, 34, 100, 17), SH.strokes([[-75, 60, -130, 0]], 40));

// звезда (достоинство / успех)
export const star: Inside = (x, y) => {
  const a = Math.atan2(y, x) + Math.PI / 2;
  const r = Math.hypot(x, y);
  const k = (Math.cos(5 * a) + 1) / 2;
  return r <= 70 + 90 * k;
};

// щит (защитная реакция)
export const shield: Inside = SH.shield(150);

// два круга, сцепленные — «мы»
export const link: Inside = SH.union(SH.move(SH.ring(70, 110), -70, 0), SH.move(SH.ring(70, 110), 70, 0));

export const SHAPES = { wall, plank, key, door, heart, ear, question, check, trophy, hook, nameTag, bulb, steps, hand, star, shield, link };
export type ShapeName = keyof typeof SHAPES;

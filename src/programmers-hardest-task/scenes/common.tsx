// Общие размеры и позы персонажей фильма №35: рост на разной глубине,
// посадка за столом (дом и офис — одна высота столешницы), руки на
// столешнице, посадка и вставание.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import type { Place, WorldArm } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { LIVING, seatH } from "../sets/Living";
import { PHT_LINES, PHT_SCENES, type PhtSceneId } from "../script";
import { abs, C, font } from "../ui/kit";

// Рост персонажей (px мира) на линии y = 1540 (за столом).
export const H = { mom: 760, dad: 790, son: 540, colleague: 770, teacher: 770, kid: 520 } as const;

// Масштаб глубины: ближе к камере (больше y) — крупнее.
export const depth = (y: number) => 1 + (y - LIVING.seatY) * 0.0005;
export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h: h * depth(y) });

// Сидящий за столом (дом/офис).
export const seated = (who: keyof typeof H, x: number): Place => ({ x, y: LIVING.seatY, h: H[who] });
export const seatOf = (p: Place) => seatH(p.h);

// Точка на столешнице (для кисти).
export const TABLE_TOP = LIVING.table.top;
export const onTable = (x: number, dy = 0) => ({ x, y: TABLE_TOP + 6 + dy });

// Рука, свободно лежащая на столе перед сидящим.
export const restOnTable = (p: Place, side: -1 | 1): WorldArm => ({ target: onTable(p.x + side * 0.15 * p.h, -4), shape: "relax", elbow: "down" });
// Опущенная рука стоящего.
export const hang: WorldArm = { target: null, shape: "relax" };

// Посадка: корпус вперёд, затем таз на сиденье. Вставание — обратно.
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 14 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};

// Рукава/кожа персонажей для крупных вставок (палец на экране и т. п.).
export const SKIN = {
  dad: { sleeve: LOOKS.dad.topColor, skin: LOOKS.dad.skin, shade: LOOKS.dad.skinShade },
  mom: { sleeve: LOOKS.mom.topColor, skin: LOOKS.mom.skin, shade: LOOKS.mom.skinShade },
  son: { sleeve: LOOKS.son.topColor, skin: LOOKS.son.skin, shade: LOOKS.son.skinShade },
} as const;

// Кадры реплики в кадрах текущей сцены.
export { useLine };

// Заглушка сцены (пока сцена не нарисована): заголовок и реплики.
export const Placeholder: React.FC<{ readonly id: PhtSceneId }> = ({ id }) => {
  const f = useCurrentFrame();
  const sc = PHT_SCENES.find((s) => s.id === id)!;
  const lines = PHT_LINES.filter((l) => l.scene === id);
  return (
    <div style={abs({ inset: 0, backgroundColor: C.bg, fontFamily: font, color: C.navy, padding: 120, boxSizing: "border-box" })}>
      <div style={{ fontSize: 64, fontWeight: 900, marginTop: 300 }}>{sc.title}</div>
      <div style={{ fontSize: 34, marginTop: 30, color: C.grey }}>кадр {f}</div>
      {lines.map((l) => (
        <LineInfo key={l.id} id={l.id} />
      ))}
    </div>
  );
};
const LineInfo: React.FC<{ readonly id: string }> = ({ id }) => {
  const l = useLine(id);
  return <div style={{ fontSize: 30, marginTop: 14 }}>{`${id}: ${l.from}–${l.to}`}</div>;
};

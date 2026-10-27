// Мир карты: лист + стандартные pop-up фигурки (горы, тополя проспекта,
// пятиэтажки). pop — общая волна раскрытия 0…1: фигурки встают по очереди
// от дальнего края к ближнему. Дополнительные фигурки сцены — children.
import { clamp, springy } from "./motion";
import { MapSheet, STREETS } from "./MapSheet";
import { Block, Mountains, Poplar } from "./popups";
import { project, Stage, Standee, type Cam } from "./Stage";

const BLOCKS: readonly { x: number; y: number; w: number; h: number; color: string; floors: number }[] = [
  { x: 230, y: 360, w: 150, h: 112, color: "#F4EEDF", floors: 5 },
  { x: 455, y: 350, w: 170, h: 100, color: "#EAF1FA", floors: 4 },
  { x: 900, y: 600, w: 150, h: 112, color: "#F4EEDF", floors: 5 },
  { x: 120, y: 600, w: 150, h: 100, color: "#EAF1FA", floors: 4 },
  { x: 900, y: 1090, w: 140, h: 100, color: "#EAF1FA", floors: 4 },
  { x: 680, y: 1095, w: 150, h: 112, color: "#F4EEDF", floors: 5 },
];

const POPLARS: readonly { x: number; y: number }[] = [];
for (let x = 40; x <= 980; x += 78) {
  if (Math.abs(x - 330) < 30 || Math.abs(x - 560) < 30 || Math.abs(x - 790) < 30 || Math.abs(x - 110) < 30) continue;
  // дальний ряд не закрывает школу героя (x ≈ 600–770)
  if (x < 590 || x > 780) (POPLARS as { x: number; y: number }[]).push({ x, y: STREETS.avenue - 32 });
  if (x + 18 < 580 || x + 18 > 800) (POPLARS as { x: number; y: number }[]).push({ x: x + 18, y: STREETS.avenue + 36 });
}

// Задержка фигурки в общей волне: дальние встают раньше.
const delayOf = (y: number) => clamp(y / 1300) * 0.55;
const upOf = (pop: number, y: number) => springy(clamp((pop - delayOf(y)) / 0.45));

export const World: React.FC<{
  readonly cam: Cam;
  readonly pop?: number;
  readonly printedDot?: number;
  readonly hole?: number;
  readonly label?: number;
  readonly hideBlocks?: readonly number[];
  readonly mountainLabel?: number;
  readonly children?: React.ReactNode;
  readonly background?: string;
  readonly flagPhase?: number;
}> = ({ cam, pop = 1, printedDot = 0, hole = 1, label = 1, hideBlocks = [], mountainLabel = 1, children, background }) => (
  <Stage cam={cam} background={background} backdrop={<Horizon cam={cam} up={upOf(pop, 0)} label={mountainLabel} />}>
    <MapSheet printedDot={printedDot} hole={hole} label={label} />
    {BLOCKS.map((b, i) =>
      hideBlocks.includes(i) ? null : (
        <Standee key={`b${i}`} x={b.x} y={b.y} w={b.w} h={b.h} up={upOf(pop, b.y)} angle={80} shadow={b.w * 0.55}>
          <Block w={b.w} h={b.h} color={b.color} floors={b.floors} />
        </Standee>
      ),
    )}
    {POPLARS.map((p, i) => (
      <Standee key={`p${i}`} x={p.x} y={p.y} w={40} h={150} up={upOf(pop, p.y + (i % 3) * 30)} angle={80} shadow={26}>
        <Poplar tone={i % 2} />
      </Standee>
    ))}
    {children}
  </Stage>
);

// Горы Ала-Тоо на горизонте: 2D-слой за листом, привязанный к дальнему
// краю карты (одна большая 3D-плоскость у края листа резалась при
// сортировке плоскостей в Chrome). Нижний край прячется за бумагой.
const Horizon: React.FC<{ readonly cam: Cam; readonly up: number; readonly label: number }> = ({ cam, up, label }) => {
  const far = project(cam, 500, 0);
  const w = 1700 * far.s;
  const h = w * 0.3;
  if (far.y < -40 || up <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: far.x - w / 2,
        top: far.y - h + 26 * far.s,
        width: w,
        height: h,
        transformOrigin: "50% 100%",
        transform: `scaleY(${up})`,
      }}
    >
      <Mountains label={label} width={w} height={h} />
    </div>
  );
};

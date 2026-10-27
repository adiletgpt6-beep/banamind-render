// Сцена 11. Обычный вечер как праздник — короткое воспоминание о прошлой
// среде (тот же стол, те же люди, мягкий тёплый свет; без торта, шаров и
// гостей).
// A. Дочка показывает маленький рисунок из школы.
// B. Родители улыбаются её истории.
// C. Сверху: настольная игра, три руки; папа делает простой ход, дочка
//    наклоняется к полю.
// D. Снова настоящее: тот же календарь в руках родителей.
import { CloseHand } from "../props/CloseHand";
import { CalendarArt } from "../props/Calendar";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { KITCHEN, KitchenBack } from "../sets/Home";
import { HANDS } from "./common";
import { SeatedThree } from "./Dinner";

const K = KITCHEN;

export const memoryPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "memory");
  const smile = T.word("N10", "Сабактагы") - 4;
  const game = T.word("N10", "Бир") - 4;
  const move: [number, number] = [game + 18, game + 38];
  const now = T.word("N10", "Кызы") - 6;
  return { smile, game, move, now, len: T.len };
};

// Тёплая виньетка воспоминания.
const Memory: React.FC = () => <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 45%, rgba(255,214,150,0) 55%, rgba(255,214,150,0.45) 100%)" })} />;

const Plates: React.FC = () => (
  <Svg>
    {[K.seats.mom, K.seats.girl, K.seats.dad].map((x) => (
      <ellipse key={x} cx={x} cy={K.table.top - 4} rx={70} ry={12} fill="#FFFFFF" stroke="#E2E6EC" strokeWidth={3} />
    ))}
  </Svg>
);

const Board: React.FC<{ f: number; p: ReturnType<typeof memoryPlan> }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.move[0]) / (p.move[1] - p.move[0])));
  const cells = Array.from({ length: 12 }, (_, i) => ({ x: 220 + (i % 6) * 120 + (Math.floor(i / 6) ? 60 : 0), y: 820 + Math.floor(i / 6) * 220 }));
  const from = cells[3];
  const to = cells[5];
  const piece = { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) - 40 * Math.sin(Math.PI * k) };
  return (
    <Shot f={f} cam={{ x: 540, y: 1000, zoom: 1 }} bg={C.woodLight}>
      <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: C.woodLight })} />
      <Svg>
        <rect x={120} y={660} width={840} height={600} rx={30} fill="#FFF6E6" stroke={C.woodDark} strokeWidth={8} />
        {cells.map((c, i) => (
          <rect key={i} x={c.x - 50} y={c.y - 50} width={100} height={100} rx={18} fill={[C.kidRed, C.yellow, C.kidBlue, C.kidGreen][i % 4]} opacity={0.85} />
        ))}
        <circle cx={cells[1].x} cy={cells[1].y - 10} r={30} fill={C.kidPink} stroke={C.ink} strokeWidth={4} />
        <circle cx={cells[7].x} cy={cells[7].y - 10} r={30} fill={C.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={piece.x} cy={piece.y} r={32} fill={C.navy} stroke={C.ink} strokeWidth={4} />
        {/* три руки: мама слева, дочка снизу, папа справа (ведёт фишку) */}
        <CloseHand x={60} y={1080} angle={-110} size={150} {...HANDS.momHome} shape="rest" />
        <CloseHand x={460} y={1500 - 40 * clamp((f - p.move[0]) / 12)} angle={180} size={130} {...HANDS.girl} shape="open" />
        <CloseHand x={piece.x + 150} y={piece.y - 70} angle={110} size={150} {...HANDS.dad} shape="pinch" />
      </Svg>
      <Memory />
    </Shot>
  );
};

export const MemoryScene: React.FC = () => {
  const { f } = useScene("memory");
  const p = usePlan(memoryPlan);
  if (f < p.game) {
    const show = clamp((f - 6) / 12);
    const girlPose = (t: number) => ({ expr: t > p.smile ? ("smile" as const) : ("softSmile" as const), armL: { target: { x: K.seats.girl - 70, y: K.table.top - 150 * show }, shape: "pinch" as const, item: "sheets" as const, elbow: "down" as const, behind: false }, armR: { target: { x: K.seats.girl + 70, y: K.table.top - 150 * show }, shape: "pinch" as const, elbow: "down" as const, behind: false } });
    const laugh = (t: number) => ({ expr: t > p.smile ? ("smile" as const) : ("softSmile" as const), nod: t > p.smile ? 3 * Math.sin((t - p.smile) / 3) * Math.exp(-(t - p.smile) / 30) : 0 });
    const cam = f < p.smile ? { x: 610, y: 1030, zoom: 1.35 } : { x: 610, y: 960, zoom: 1.2 };
    return (
      <Shot f={f} cam={cam} bg={C.wallKitchen}>
        <KitchenBack warm={1} />
        <SeatedThree f={f} items={<Plates />} girlPose={girlPose} momPose={laugh} dadPose={laugh} girlFace={(t) => (t > p.smile ? 0.3 : 0)} />
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
        <Memory />
      </Shot>
    );
  }
  if (f < p.now) return <Board f={f} p={p} />;
  // D. Настоящее: лист в руках родителей (сверху)
  const k = easeInOut(clamp((f - p.now) / 20));
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: lerp(1.08, 1.0, k) }} bg={C.woodLight}>
      <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: C.woodLight })} />
      <Svg>
        <g transform={`translate(${140} ${390}) rotate(${keys(f, [[p.now, -2], [p.len, 0]])} 400 528)`}>
          <CalendarArt w={800} />
        </g>
        <CloseHand x={80} y={1180} angle={-120} size={170} {...HANDS.momHome} shape="pinch" />
        <CloseHand x={1000} y={1180} angle={120} size={170} {...HANDS.dad} shape="pinch" mirror />
      </Svg>
      <div style={box({ left: -200, top: -200, width: 1500, height: 2400, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

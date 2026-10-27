// Сцена 7. Что он услышал (M03, C02).
// A. Мама кладёт рисунок на стол рядом с конвертом «Бекзат» и смотрит на
//    сына: «Сен азыркы мектебиңден кетем деп ойлодуңбу?» (M03).
// B. Аян крупно: ненадолго поднимает плечи, переводит взгляд с конвертов
//    на маму — «Башка мектеп жөнүндө сүйлөшкөнсүңөр да…» (C02). Камера
//    спокойна.
// C. Мама слушает: понимание, без слёз и морали.
// D. Мама возвращает рисунок в «Бекзат» (крупно в руках) и кладёт конверт
//    на место: оба просмотренных письма снова внутри своих конвертов.
import { clamp, easeInOut, keys } from "../rig/motion";
import { BEKZAT } from "../script";
import { Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { SKIN } from "../props/CloseHand";
import { HeldEnvelope } from "../props/Held";
import { gridLayout, TOP, toFront } from "../sets/Room";
import { ayanSeated, AYAN_SEAT, MOM_STAND, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";

export const heardPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "heard");
  const m03 = T.from("M03");
  const c02 = T.from("C02");
  const c02End = T.to("C02");
  return {
    put: Math.max(8, m03 - 22),
    m03,
    m03End: T.to("M03"),
    c02,
    c02End,
    listen: c02End + 4,
    back: [c02End + 40, c02End + 76] as const,
    place: c02End + 76,
    len: T.len,
  };
};
type P = ReturnType<typeof heardPlan>;

// Рисунок на столе (фронтальный план): белый лист с цветными пятнами.
export const DrawingOnDesk: React.FC = () => {
  const p = toFront(TOP.drawingSpot.x, TOP.drawingSpot.y);
  return (
    <Svg>
      <g transform={`translate(${p.x} ${p.y})`}>
        <rect x={-44 + 3} y={-10} width={88} height={24} rx={2} fill="rgba(60,40,20,0.22)" />
        <rect x={-44} y={-12} width={88} height={22} rx={2} fill="#FFFFFF" stroke="#DCD3C2" />
        <rect x={-40} y={4} width={80} height={5} fill="#8CCB6E" />
        <circle cx={-10} cy={-2} r={4} fill="#FFD43B" />
        <circle cx={8} cy={-2} r={4} fill="#4FA36B" />
      </g>
    </Svg>
  );
};

const momSpec = (p: P): ActorSpec => ({
  uid: "h-mom",
  look: "momHome",
  place: () => MOM_STAND,
  face: (t) => keys(t, [[p.put + 10, -0.45], [p.m03 - 4, -0.72]]),
  pose: (t) => {
    const placing = t < p.put + 6;
    const k = easeInOut(clamp((t - (p.put - 14)) / 14));
    const spot = onDesk(TOP.drawingSpot.x, TOP.drawingSpot.y, -8);
    return {
      expr: t < p.c02 ? ("calm" as const) : t < p.c02End + 6 ? { browIn: 5, browOut: 1, lid: 0.1, smile: 0 } : { browIn: 6, browOut: 0, lid: 0.18, smile: 0.12 },
      lookY: placing ? 0.7 : 0.3,
      nod: placing ? 9 : keys(t, [[p.c02End + 8, 3], [p.c02End + 18, 7], [p.c02End + 30, 4]]),
      lean: placing ? 12 : 4,
      headTilt: keys(t, [[p.c02, 0], [p.c02End, -5]]),
      armL: placing
        ? { target: { x: 838 + (spot.x - 838) * k, y: 1150 + (spot.y - 1150) * k }, shape: "pinch" as const, elbow: "down" as const, item: "drawing" as const, itemTilt: -10, behind: false }
        : { target: { x: MOM_STAND.x - 110, y: 1262 }, shape: "relax" as const, elbow: "down" as const },
      armR: { target: null },
    };
  },
  role: "mother",
  seed: 12,
});

const ayanSpec = (p: P): ActorSpec => ({
  uid: "h-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  // взгляд: конверты → мама (на середине ответа)
  face: (t) => keys(t, [[p.c02 + 20, 0.15], [p.c02 + 36, 0.55]]),
  pose: (t) =>
    ayanSeated({
      expr: t < p.c02 ? { browIn: 4, browOut: 1, lid: 0.1, smile: 0 } : { browIn: 6, browOut: -1, lid: 0.12, smile: 0.02 },
      lookY: keys(t, [[p.c02 + 20, 0.6], [p.c02 + 36, -0.1]]),
      nod: keys(t, [[p.c02 + 20, 6], [p.c02 + 36, 1]]),
      // плечи коротко поднимаются один раз, без петли
      shoulders: keys(t, [[p.c02 - 2, 0], [p.c02 + 8, 0.9], [p.c02 + 26, 0]]),
    }),
  role: "son",
  seed: 11,
});

export const HeardScene: React.FC = () => {
  const { f } = useScene("heard");
  const p = usePlan(heardPlan);
  const drawingOnDesk = f >= p.put && f < p.back[0];
  const bekHidden = f >= p.back[0] - 6 && f < p.place;
  if (f >= p.back[0] && f < p.back[1]) {
    const u = (a: number, b: number) => easeInOut(clamp((f - a) / (b - a)));
    const [a, b] = p.back;
    const d = b - a;
    return <HeldEnvelope name={BEKZAT.name} turn={1 - u(a + d * 0.72, b)} open={1 - u(a + d * 0.45, a + d * 0.7)} out={1 - u(a, a + d * 0.42)} content="drawing" skin={SKIN.mom} />;
  }
  const items = gridLayout().map((e) => (e.env.id === BEKZAT.id ? { ...e, hidden: bekHidden } : e));
  const mom = momSpec(p);
  const ayan = ayanSpec(p);
  const onTop = drawingOnDesk ? <DrawingOnDesk /> : null;
  if (f < p.c02 - 6) return <RoomFront f={f} cam={ROOM_CAM.two} items={items} ayan={ayan} mom={mom} onTop={onTop} />;
  if (f < p.listen) return <RoomFront f={f} cam={ROOM_CAM.ayan} items={items} ayan={ayan} mom={mom} onTop={onTop} />;
  if (f < p.back[0]) return <RoomFront f={f} cam={ROOM_CAM.mom} items={items} ayan={ayan} mom={mom} onTop={onTop} />;
  return <RoomFront f={f} cam={ROOM_CAM.two} items={items} ayan={ayan} mom={mom} />;
};

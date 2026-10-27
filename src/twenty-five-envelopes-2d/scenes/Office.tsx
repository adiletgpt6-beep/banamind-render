// Сцена 3. Офис переехал (N02). «Бир нече жума мурун».
// A. Крупно: картонная коробка с рабочими вещами в руках папы — на месте и
//    в размер прямоугольника конверта из предыдущего кадра (монтажная
//    рифма, не превращение). Камера отходит: светлый новый офис, коллеги в
//    глубине; папа ставит коробку на стол (переезд, а не увольнение).
// B. Вставка-схема: Үй и Мектеп на своих местах, прежний офис — тонкий
//    контур рядом со школой, новый — дальше; линия дороги туда и обратно.
// C. Папа у рабочего стола смотрит на обычный список встреч на мониторе.
import { keys, keysV } from "../rig/motion";
import { TE2_TEXT } from "../script";
import { camMove, Shot, TimeCaption, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C } from "../theme";
import { CityMap } from "../props/CityMap";
import { MeetingsScreen, MovingBox, OFFICE, OfficeBack, OfficeDesk } from "../sets/Office";
import { Act, type ActorSpec } from "./room";
import { H } from "./common";

export const officePlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "office");
  const mapFrom = T.word("N02", "Ошондон") - 6;
  return {
    pull: [10, 64] as const,
    put: [34, 62] as const,
    mapFrom,
    mapTo: T.to("N02") + 8,
    screen: T.to("N02") + 8,
    face: T.len - 30,
    len: T.len,
  };
};
type P = ReturnType<typeof officePlan>;

const DAD = { x: OFFICE.personX, y: OFFICE.floor, h: H.dad };
const HELD = { x: 540, y: 1180 };
const ON_DESK = { x: 400, y: OFFICE.desk.top + 4 };

const boxAt = (t: number, p: P) => keysV(t, [[p.put[0], HELD], [p.put[1], ON_DESK]]);

const dadSpec = (p: P): ActorSpec => ({
  uid: "o-dad",
  look: "dad",
  place: () => DAD,
  face: (t) => keys(t, [[p.put[1], -0.25], [p.put[1] + 20, 0.05], [p.screen, 0.35]]),
  pose: (t) => {
    const b = boxAt(t, p);
    const holding = t < p.put[1] + 4;
    const w = 150;
    return {
      expr: t < p.screen ? ("calm" as const) : ("thinking" as const),
      lookY: t < p.put[1] ? 0.55 : 0.2,
      nod: t < p.put[1] ? 6 : 2,
      lean: keys(t, [[p.put[0], 2], [p.put[1], 10], [p.put[1] + 18, 3]]),
      armL: holding ? { target: { x: b.x - w + 6, y: b.y - 70 }, shape: "open" as const, elbow: "down" as const, wrist: 10, behind: false } : { target: { x: 470, y: OFFICE.desk.top + 2 }, shape: "relax" as const, elbow: "down" as const },
      armR: holding ? { target: { x: b.x + w - 6, y: b.y - 70 }, shape: "open" as const, elbow: "down" as const, wrist: -10, behind: false } : { target: { x: 640, y: OFFICE.desk.top + 2 }, shape: "relax" as const, elbow: "down" as const },
    };
  },
  seed: 21,
});

const colleagues: ActorSpec[] = [
  { uid: "o-c1", look: "colleagueW", place: () => ({ x: 960, y: 1400, h: 470 }), face: () => 0.6, pose: () => ({ expr: "calm", lookY: 0.4, armL: { target: { x: 1010, y: 1180 }, shape: "pinch", elbow: "down", item: "card" } }), seed: 31 },
  { uid: "o-c2", look: "colleagueM", place: () => ({ x: 1070, y: 1400, h: 480 }), face: () => -0.6, pose: () => ({ expr: "softSmile", lookY: 0.3 }), seed: 32 },
];

const OfficeWorld: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const dad = dadSpec(p);
  const b = boxAt(f, p);
  return (
    <>
      <OfficeBack tone="dad" />
      {colleagues.map((c) => (
        <Act key={c.uid} s={c} f={f} layer="all" />
      ))}
      <Act s={dad} f={f} layer="body" />
      <OfficeDesk>
        <MovingBox x={b.x} y={b.y} />
      </OfficeDesk>
      <Act s={dad} f={f} layer="arms" />
    </>
  );
};

export const OfficeScene: React.FC = () => {
  const { f } = useScene("office");
  const p = usePlan(officePlan);
  if (f >= p.mapFrom && f < p.mapTo) {
    return (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#F4EEDF">
        <CityMap t={f - p.mapFrom} dur={p.mapTo - p.mapFrom} />
      </Shot>
    );
  }
  if (f >= p.screen && f < p.face) {
    return (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg={C.blueDay} overlay={<MeetingsScreen title={TE2_TEXT.office.meetings} items={TE2_TEXT.office.items} hi={-1} />}>
        {null}
      </Shot>
    );
  }
  const cam =
    f >= p.face
      ? { x: 560, y: 920, zoom: 2.2 }
      : camMove(f, p.pull[0], p.pull[1], { x: 540, y: 1100, zoom: 2.9 }, { x: 600, y: 1080, zoom: 1.3 });
  return (
    <Shot f={f} cam={cam} bg={C.blueDay} overlay={<TimeCaption text={TE2_TEXT.before} t={f - 6} dur={84} />}>
      <OfficeWorld f={f} p={p} />
    </Shot>
  );
};

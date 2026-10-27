// Сцена 8. Мама садится рядом (M04).
// A. Мама кладёт руку на спинку второго стула у стены и подвигает его к
//    столу рядом с Аяном (стул едет по полу, стопы мамы не скользят — она
//    переступает вместе с ним).
// B. Склейка на уже завершённую посадку: мама сидит рядом, корпус чуть
//    вперёд, глаза примерно на уровне сына. Камера неподвижна, музыка тихая.
//    «Биз азырынча кандай кылсак болорун карап жатабыз…» (M04).
// C. Аян сначала думает (взгляд вниз), затем поднимает глаза — начало ответа
//    не перекрыто.
import { cruise, clamp, keys, lerp } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { gridLayout } from "../sets/Room";
import { ayanSeated, AYAN_SEAT, MOM_SEAT, MOM_SEAT_H, MOM_STAND, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";

export const sitPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "sit");
  const m04 = T.from("M04");
  return { grab: 8, pull: [16, 52] as const, cut: 60, m04, m04End: T.to("M04"), len: T.len };
};
type P = ReturnType<typeof sitPlan>;

const CHAIR_FROM = 1090;

export const chairX = (t: number, p: P) => (t >= p.cut ? MOM_SEAT.x : lerp(CHAIR_FROM, 1000, cruise(clamp((t - p.pull[0]) / (p.pull[1] - p.pull[0])))));

const momSpec = (p: P): ActorSpec => ({
  uid: "s-mom",
  look: "momHome",
  place: (t) => (t >= p.cut ? MOM_SEAT : { ...MOM_STAND, x: lerp(MOM_STAND.x, 960, cruise(clamp((t - p.pull[0]) / (p.pull[1] - p.pull[0])))) }),
  face: (t) => (t < p.cut ? 0.6 : -0.62),
  pose: (t) =>
    t < p.cut
      ? {
          expr: "calm" as const,
          lookY: 0.5,
          nod: 4,
          lean: 6,
          armR: { target: { x: chairX(t, p) - 20, y: 1095 }, shape: "fist" as const, elbow: "down" as const },
          armL: { target: null },
        }
      : {
          sit: 1,
          seat: MOM_SEAT_H,
          lean: 14,
          nod: 6,
          expr: t < p.m04End ? ("softSmile" as const) : { browIn: 3, browOut: 2, lid: 0.1, smile: 0.25 },
          lookY: 0.15,
          armL: { target: onDesk(450, 1500), shape: "relax" as const, elbow: "down" as const },
          armR: { target: onDesk(150, 1450), shape: "relax" as const, elbow: "down" as const },
        },
  role: "mother",
  seed: 12,
  walkFrom: p.pull[0] - 2,
});

const ayanSpec = (p: P): ActorSpec => ({
  uid: "s-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  face: (t) => keys(t, [[p.cut, 0.5], [p.m04End + 6, 0.35], [p.m04End + 20, 0.5]]),
  pose: (t) =>
    ayanSeated({
      expr: t < p.m04End ? { browIn: 4, browOut: 1, lid: 0.1, smile: 0 } : "thinking",
      lookY: keys(t, [[p.m04End + 2, 0], [p.m04End + 12, 0.55], [p.len - 8, 0.55], [p.len, 0.1]]),
      nod: keys(t, [[p.m04End + 2, 0], [p.m04End + 12, 6]]),
    }),
  role: "son",
  seed: 11,
});

export const SitScene: React.FC = () => {
  const { f } = useScene("sit");
  const p = usePlan(sitPlan);
  const items = gridLayout();
  const mom = momSpec(p);
  const ayan = ayanSpec(p);
  if (f < p.cut) {
    return <RoomFront f={f} cam={{ ...ROOM_CAM.two, x: 780 }} items={items} ayan={ayan} mom={mom} momChairX={chairX(f, p)} />;
  }
  return <RoomFront f={f} cam={ROOM_CAM.twoSeated} items={items} ayan={ayan} momSeated={mom} momChairX={MOM_SEAT.x} />;
};

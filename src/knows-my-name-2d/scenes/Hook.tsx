// Сцена 1. Вопрос, которого не было в списке (вечер; предвосхищение).
// A. Сверху: на столе телефон мамы со схемой «Мектеп → Үй» и блокнот папы
//    со словами «Дарек», «Убакыт»; ручка дописывает «Каттам» (кончик ведёт
//    проявление строки).
// B. Средний план стола: мама с телефоном, папа с ручкой, сын у свободного
//    торца; камера спокойно подходит к сыну на уровне его глаз. K01.
// C. Мама поднимает взгляд от телефона на сына (сначала глаза, затем
//    голова). Короткая живая пауза.
import { CloseHand } from "../props/CloseHand";
import { NotebookTop, NB, nbPenTip, penHand, PenInHand } from "../props/Notebook30";
import { Phone30 } from "../props/Phone30";
import { clamp, easeInOut, keys } from "../rig/motion";
import type { PoseIn } from "../rig/Actor";
import { box, camMove, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { KM2_TEXT } from "../script";
import { FLAT } from "../sets/Flat";
import { HANDS } from "./common";
import { DAD_SEAT, DiningRoom, momPhoneHand, MOM_SEAT, seated } from "./Room";

export const hookPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "hook");
  const write: [number, number] = [30, 64];
  const room = Math.max(write[1] + 16, T.word("N01", "Уулунун") - 6);
  const k01 = T.from("K01");
  const k01End = T.to("K01");
  const momUp = k01End + 8; // взгляд мамы поднимается после вопроса
  const momShot = k01End + 4;
  return { write, room, k01, k01End, momUp, momShot, len: T.len };
};
type P = ReturnType<typeof hookPlan>;

// Лист на столе — общий для сцен 1, 6, 8, 9.
export const TableTop: React.FC<{ readonly f: number; readonly cam?: { x: number; y: number; zoom: number }; readonly children: React.ReactNode; readonly phone?: React.ReactNode }> = ({ f, cam = { x: 540, y: 1000, zoom: 1 }, children, phone }) => (
  <Shot f={f} cam={cam} bg={C.woodLight}>
    <div style={box({ left: -1200, top: -600, width: 3400, height: 3400, backgroundColor: C.woodLight, backgroundImage: "repeating-linear-gradient(90deg, rgba(150,105,60,0.10) 0 3px, transparent 3px 130px)" })} />
    {phone}
    {children}
    <div style={box({ left: -1200, top: -600, width: 3400, height: 3400, backgroundColor: TINT.warm })} />
  </Shot>
);

// Рука папы с ручкой, кончик в (x, y).
export const DadPen: React.FC<{ readonly x: number; readonly y: number; readonly lift?: number }> = ({ x, y, lift = 0 }) => {
  const h = penHand(x, y);
  return <PenInHand x={x} y={y} lift={lift} hand={<CloseHand x={h.x} y={h.y} angle={h.angle} size={150} {...HANDS.dad} shape="pinch" />} />;
};

const T = KM2_TEXT;
const R = NB.rows;

const TopInsert: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = clamp((f - p.write[0]) / (p.write[1] - p.write[0]));
  const tip = nbPenTip(T.notePlan[2], R.route, easeInOut(u));
  // между буквами ручка чуть приподнимается; после строки — отходит
  const lift = f > p.write[1] ? clamp((f - p.write[1]) / 8) : 0.15 * Math.abs(Math.sin(f / 2.3));
  return (
    <TableTop f={f} cam={camMove(f, 0, p.write[0] - 2, { x: -60, y: 900, zoom: 1.05 }, { x: 560, y: 760, zoom: 1.2 })} phone={<Phone30 x={-200} y={960} scale={0.75} tilt={-6} s={{ view: "route" }} />}>
      <NotebookTop
        lines={[
          { text: T.notePlan[0], y: R.address, u: 1 },
          { text: T.notePlan[1], y: R.time, u: 1 },
          { text: T.notePlan[2], y: R.route, u },
        ]}
      >
        <DadPen x={tip.x + (f > p.write[1] ? 30 * clamp((f - p.write[1]) / 10) : 0)} y={tip.y} lift={lift} />
      </NotebookTop>
    </TableTop>
  );
};

// Позы участников вечерней сцены (используются и в сцене 5 — тот же момент).
export const hookCast = (p: { momUp: number; k01: number; k01End: number }) => ({
  momPose: (t: number): PoseIn => ({
    ...seated(MOM_SEAT),
    expr: t > p.momUp + 6 ? "calm" : "neutral",
    lookY: keys(t, [[p.momUp, 0.55], [p.momUp + 5, 0.05]]),
    armR: momPhoneHand(),
    armL: { target: { x: MOM_SEAT.x - 20, y: FLAT.table.top - 120 }, shape: "relax", elbow: "down", behind: false },
  }),
  momFace: (t: number) => keys(t, [[p.momUp + 3, 0.12], [p.momUp + 16, 0.62]]),
  dadPose: (t: number): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: "thinking",
    lookY: 0.62,
    armR: { target: { x: FLAT.notebook.x + 30 + 6 * Math.sin(Math.min(t, p.k01) / 3), y: FLAT.table.top - 14 }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 70, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: () => 0.05,
  boyPose: (t: number): PoseIn => ({
    expr: t >= p.k01 - 10 ? { browIn: 4, browOut: 2, lid: 0.06, smile: 0 } : "calm",
    lookY: 0.1,
    nod: t > p.k01 - 8 && t < p.k01End ? -2 : 0,
    armL: { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false },
    armR: { target: null, shape: "relax" },
  }),
  boyFace: () => -0.55,
});

export const HookScene: React.FC = () => {
  const { f } = useScene("hook");
  const p = usePlan(hookPlan);
  if (f < p.room) return <TopInsert f={f} p={p} />;
  const cast = hookCast(p);
  const props = { phone: "hand" as const, car: "cabinet" as const, notebookRows: 3 };
  if (f < p.momShot) {
    // B. стол → сын (камера останавливается до вопроса и держится на нём)
    const cam = camMove(f, p.room, Math.max(p.room + 30, p.k01 - 12), { x: 680, y: 1040, zoom: 1.2 }, { x: 930, y: 930, zoom: 1.85 });
    return <DiningRoom f={f} cam={cam} cast={cast} props={props} />;
  }
  // C. мама поднимает глаза от телефона
  return <DiningRoom f={f} cam={{ x: MOM_SEAT.x + 60, y: 930, zoom: 1.9 }} cast={cast} props={props} />;
};

// Сцена 2: отъезд камеры от билета — его держит отец за столом в светлой
// гостиной (за окном Ала-Тоо). Сын рядом делает уроки: ребёнок дома, со
// взрослым, никого не оставили ждать одного. Отец сам переворачивает
// билет — на обороте «1 толук сапар = эки бөлүк» — и спрашивает:
// «Барып-келүү бир толук сапар болуп эсептелет го. Анда бүтүндөй сапар
// үчүн эмне болот?» На вопросе сын поднимает глаза на отца. В конце камера
// наезжает на билет — переход к графике.
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, lerp, type Vec } from "../../../two-schedules-2d/rig/motion";
import { EXPR, mixExpr } from "../../../two-schedules-2d/rig/pose";
import { seatH } from "../../../two-schedules-2d/sets/Home";
import { fontFamily } from "../../../fonts";
import { NAVY, Ticket, YELLOW } from "../art";
import { box, useLine, useSceneFrame, useSceneFrames, useWordAt, World, type Cam } from "../context";
import { BG39_TEXT } from "../script";
import { CupOnTable, NotebookOnTable, onRoomTable, ROOM, RoomBack, RoomChair, RoomTable } from "../sets";

export const DAD: Place = { x: ROOM.seat.dad, y: ROOM.seatY, h: 790 };
export const SON: Place = { x: ROOM.seat.son, y: ROOM.seatY, h: 540 };
const DAD_AT = () => DAD;
const SON_AT = () => SON;

// Билет в руках отца (центр в мире, масштаб).
export const HELD = { x: DAD.x - 140, y: 1078, s: 0.25 } as const;
// Захват: обе руки за нижние углы, кулаки чуть ниже края — текст билета
// открыт. При перевороте (поворот вокруг вертикальной оси) кисти идут
// за видимыми углами: билет поворачивается в пальцах, руки не отрываются.
const HALF_W = (560 * HELD.s) / 2 - 8;
const GRIP_Y = HELD.y + (880 * HELD.s) / 2 + 8;
const grip = (side: -1 | 1, flip: number, lift: number): Vec => ({
  x: HELD.x + side * Math.max(18, HALF_W * Math.abs(Math.cos(Math.PI * flip))),
  y: GRIP_Y - 14 * lift,
});

export const CAM_ROOM: Cam = { x: 680, y: 1118, zoom: 1.45 };
// Начало: крупнее, на билете в руках (наплыв из хука), затем отъезд.
const CAM_TICKET: Cam = { x: HELD.x + 40, y: HELD.y - 10, zoom: 2.3 };

export const FATHER = {
  pull: [0, 40], // отъезд камеры
  look: 34, // отец смотрит на билет
  flip: [46, 70], // переворачивает: оборот «1 толук сапар = эки бөлүк»
  caption: 64, // крупная надпись
} as const;

const camLerp = (a: Cam, b: Cam, u: number): Cam => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), u)) });

export const FatherScene: React.FC = () => {
  const f = useSceneFrame();
  const len = useSceneFrames("father");
  const f1 = useLine("f1");
  const q = useWordAt("f1", "анда", 0.55); // вторая фраза — вопрос
  const flipBack = q - 4;
  const pushAt = len - 22;

  // ---------- камера ----------
  const pull = anticipate(clamp((f - FATHER.pull[0]) / (FATHER.pull[1] - FATHER.pull[0])));
  const drift = easeInOut((f - FATHER.pull[1]) / Math.max(1, pushAt - FATHER.pull[1]));
  const roomCam: Cam = { x: CAM_ROOM.x - 10 * drift, y: CAM_ROOM.y + 6 * drift, zoom: CAM_ROOM.zoom * (1 + 0.05 * drift) };
  const push = easeInOut((f - pushAt) / 22);
  const cam = push > 0 ? camLerp(roomCam, { x: HELD.x, y: HELD.y, zoom: 3.4 }, push) : camLerp(CAM_TICKET, roomCam, pull);

  // ---------- билет ----------
  const flip = easeInOut((f - FATHER.flip[0]) / (FATHER.flip[1] - FATHER.flip[0])) * (1 - easeInOut((f - flipBack) / 20));
  const lift = keys(f, [[FATHER.flip[0] - 6, 0], [FATHER.flip[0] + 6, 1], [FATHER.flip[1], 1], [FATHER.flip[1] + 10, 0], [flipBack - 4, 0], [flipBack + 4, 1], [flipBack + 20, 1], [flipBack + 28, 0]]);
  const tk = { x: HELD.x, y: HELD.y - 14 * lift, s: HELD.s };

  // ---------- отец ----------
  const dadPose = (t: number): PoseIn => {
    const fl = easeInOut((t - FATHER.flip[0]) / (FATHER.flip[1] - FATHER.flip[0])) * (1 - easeInOut((t - flipBack) / 20));
    const li = keys(t, [[FATHER.flip[0] - 6, 0], [FATHER.flip[0] + 6, 1], [FATHER.flip[1], 1], [FATHER.flip[1] + 10, 0], [flipBack - 4, 0], [flipBack + 4, 1], [flipBack + 20, 1], [flipBack + 28, 0]]);
    return {
      sit: 1,
      seat: seatH(DAD.h),
      lean: keys(t, [[0, 6], [FATHER.look, 9], [f1.from, 7], [q, 4], [q + 20, 6]]),
      // спокойный интерес: слегка приподнятые брови на вопросе, без «сонных» век
      expr: t < q - 4 ? "calm" : mixExpr(EXPR.calm, EXPR.surprised, keys(t, [[q - 4, 0], [q + 8, 0.35], [f1.to + 10, 0.35], [f1.to + 30, 0.1]])),
      lookY: keys(t, [[0, 0.5], [q - 6, 0.55], [q + 6, 0.05], [len - 30, 0.1], [len - 18, 0.5]]),
      lookX: keys(t, [[q - 6, 0], [q + 6, 0.25], [len - 30, 0.2], [len - 18, 0]]),
      nod: keys(t, [[f1.from - 4, 0], [f1.from + 6, 4], [f1.from + 16, 1], [q + 2, 0], [q + 10, -2], [q + 22, 0]]),
      headTilt: keys(t, [[q, 0], [q + 12, -4], [f1.to + 6, -4], [f1.to + 20, 0]]),
      armR: { target: grip(1, fl, li), shape: "fist", elbow: "down", behind: false },
      armL: {
        target: grip(-1, fl, li),
        shape: "fist",
        elbow: "down",
        behind: false,
      },
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.42], [q - 4, -0.42], [q + 8, -0.12], [len - 30, -0.14], [len - 16, -0.4]]);

  // ---------- сын ----------
  const sonPose = (t: number): PoseIn => {
    const up = keys(t, [[q - 4, 0], [q + 6, 1], [f1.to + 24, 1], [f1.to + 40, 0]]);
    const stroke = Math.sin(t / 3.2) * 10 * (1 - up);
    return {
      sit: 1,
      // подушка на стуле: ребёнок сидит выше, локти над столешницей
      seat: seatH(SON.h) + 78,
      lean: lerp(10, 3, up),
      expr: up > 0.5 ? "calm" : "softSmile",
      lookY: lerp(0.7, 0.05, up),
      armR: { target: onRoomTable(SON.x + 70 + stroke, -10 - Math.abs(stroke) * 0.2), shape: "fist", item: "pencil", itemColor: "#F2A900", elbow: "down", behind: false },
      armL: { target: onRoomTable(SON.x - 30, -14), shape: "relax", elbow: "down", behind: false },
    };
  };
  const sonFace = (t: number) => keys(t, [[q - 4, 0.25], [q + 6, 0.7], [f1.to + 24, 0.7], [f1.to + 40, 0.25]]);

  const world = (
    <>
      <RoomBack f={f} />
      <RoomChair x={SON.x} h={SON.h + 120} />
      <RoomChair x={DAD.x} h={DAD.h} />
      <Actor uid="b39-son" look="son" f={f} place={SON_AT} face={sonFace} pose={(t) => ({ ...sonPose(t), packOff: true })} seed={4} layer="body" />
      <Actor uid="b39-dad" look="dad" f={f} place={DAD_AT} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <RoomTable />
      <NotebookOnTable x={ROOM.notebook.x + 40} y={ROOM.notebook.y} lines={2 + Math.floor(clamp(f / 200) * 3)} />
      <CupOnTable x={ROOM.notebook.x + 300} y={ROOM.table.top + 14} />
      <Ticket x={tk.x} y={tk.y} s={tk.s} rot={-2} bg="#EAF1F4" topColor={1} bottomColor={0} done={1} failed={1} flip={flip} />
      <Actor uid="b39-son" look="son" f={f} place={SON_AT} face={sonFace} pose={(t) => ({ ...sonPose(t), packOff: true })} seed={4} layer="arms" />
      <Actor uid="b39-dad" look="dad" f={f} place={DAD_AT} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );

  const [eqL, eqR] = BG39_TEXT.father.equation.split(" = ");
  const cap = easeOut((f - FATHER.caption) / 10) * (1 - easeOut((f - (pushAt - 6)) / 10));
  return (
    <div style={box({ inset: 0 })}>
      <World cam={cam} bg="#EAF1F4">
        {world}
      </World>
      {/* надпись крупно: оборот билета */}
      {cap > 0.01 ? (
        <div style={box({ left: 90, right: 150, top: 400, display: "flex", justifyContent: "center", opacity: cap, translate: `0 ${(1 - cap) * 20}px` })}>
          <div style={{ padding: "18px 36px 20px", borderRadius: 30, backgroundColor: "#FFFFFF", boxShadow: "0 14px 36px rgba(20,40,90,0.16)", fontFamily, fontWeight: 900, fontSize: 50, color: NAVY, display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap" }}>
            <span style={{ backgroundColor: YELLOW, borderRadius: 14, padding: "0 14px" }}>{eqL}</span>
            <span>= {eqR}</span>
          </div>
        </div>
      ) : null}
      {/* блик при наезде — переход к графике */}
      {push > 0.6 ? <div style={box({ inset: 0, backgroundColor: "#FFFCF5", opacity: clamp((push - 0.6) / 0.4) * 0.9 })} /> : null}
    </div>
  );
};

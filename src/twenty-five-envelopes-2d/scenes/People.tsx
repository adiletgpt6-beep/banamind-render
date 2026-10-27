// Сцена 9. Школа — это люди (C03, C04, C05). Голос Аяна звучит за кадром;
// внутри воспоминаний дети и учительница не двигают ртами — только
// действуют.
// 1. «Бир партада отурган досум…» — Аян и Эмир за партой. Эмир поворачивает
//    тетрадь и показывает строку задачи, Аян понимает, благодарно смотрит
//    на друга и дописывает решение.
// 2. «Алгачкы жолу эл алдына чыкканымда…» — первое небольшое выступление:
//    Аян с листком волнуется; учительница замечает, тихо кивает; он
//    расправляет плечи и начинает.
// 3. «Анан чогуу мектеп долбоорун…» — команда собирает макет «Биздин
//    шаар»: девочка держит основу, Аян передаёт домик, высокий мальчик
//    берёт его (обе руки на одном предмете) и ставит на место.
// 4. Коротко дома: мама внимательно слушает.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C } from "../theme";
import { CityModel, ClassBack, NotebookFlat, SCHOOL, SchoolDesk } from "../sets/School";
import { gridLayout } from "../sets/Room";
import { Act, ayanSeated, AYAN_SEAT, MOM_SEAT, MOM_SEAT_H, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";
import { H, seatOf } from "./common";

export const peoplePlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "people");
  const c03 = T.from("C03");
  const c04 = T.from("C04");
  const c05 = T.from("C05");
  const m2 = c04 - 14;
  const m3 = c05 - 14;
  const home = Math.min(T.len - 30, T.to("C05") + 14);
  return {
    c03,
    m1: { turn: [6, 26] as const, point: 30, nod: 46, write: [56, m2 - 6] as const },
    m2,
    s2: { notice: m2 + 24, nod: m2 + 36, brave: m2 + 52 },
    m3,
    s3: { give: m3 + 22, hand: m3 + 40, place: m3 + 64 },
    home,
    len: T.len,
  };
};
type P = ReturnType<typeof peoplePlan>;

const sitAt = (x: number, h: number) => ({ x, y: SCHOOL.floor, h });

// ---------- 1. За партой ----------
const Desk: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.m1.turn[0]) / (p.m1.turn[1] - p.m1.turn[0])));
  const nb = { x: lerp(650, 560, k), y: SCHOOL.desk.top + 12, rot: lerp(0, -14, k) };
  const written = clamp((f - p.m1.write[0]) / (p.m1.write[1] - p.m1.write[0]));
  const ayan: ActorSpec = {
    uid: "p-ayan",
    look: "ayanSchool",
    place: () => sitAt(390, H.ayan),
    face: (t) => keys(t, [[p.m1.point, 0.15], [p.m1.nod - 4, 0.5], [p.m1.nod + 10, 0.1]]),
    pose: (t) => ({
      sit: 1,
      seat: seatOf(H.ayan, true) + 50,
      lean: 10,
      expr: t < p.m1.nod ? "thinking" : "softSmile",
      lookY: t < p.m1.nod - 4 || t > p.m1.nod + 10 ? 0.65 : 0.1,
      nod: keys(t, [[p.m1.nod, 4], [p.m1.nod + 6, 10], [p.m1.nod + 12, 5]]),
      armR: { target: { x: nb.x - 30 + Math.sin(t * 0.8) * (t > p.m1.write[0] && t < p.m1.write[1] ? 8 : 0), y: SCHOOL.desk.top + 4 }, shape: "fist", elbow: "down", item: "pencil", itemColor: C.yellow },
      armL: { target: { x: 330, y: SCHOOL.desk.top + 6 }, shape: "relax", elbow: "down" },
    }),
    seed: 61,
  };
  const emir: ActorSpec = {
    uid: "p-emir",
    look: "emir",
    place: () => sitAt(700, H.emir),
    face: (t) => keys(t, [[p.m1.nod - 6, -0.3], [p.m1.nod + 2, -0.55]]),
    pose: (t) => ({
      sit: 1,
      seat: seatOf(H.emir, true) + 50,
      lean: 10,
      expr: "softSmile",
      lookY: t < p.m1.nod - 6 ? 0.6 : 0.15,
      armL: t < p.m1.write[0]
        ? { target: { x: nb.x + 30, y: SCHOOL.desk.top + 8 - (t >= p.m1.point ? 6 : 0) }, shape: t >= p.m1.point ? "point" : "open", elbow: "down" }
        : { target: { x: 650, y: SCHOOL.desk.top + 6 }, shape: "relax", elbow: "down" },
      armR: { target: { x: 760, y: SCHOOL.desk.top + 6 }, shape: "relax", elbow: "down" },
    }),
    seed: 62,
  };
  return (
    <Shot f={f} cam={{ x: 545, y: 1210, zoom: keys(f, [[0, 1.85], [p.m2, 1.95]]) }} bg="#E6EFDF">
      <ClassBack />
      <Act s={ayan} f={f} layer="body" />
      <Act s={emir} f={f} layer="body" />
      <SchoolDesk />
      <NotebookFlat x={nb.x} y={nb.y} rot={nb.rot} written={written} />
      <Act s={ayan} f={f} layer="arms" />
      <Act s={emir} f={f} layer="arms" />
    </Shot>
  );
};

// ---------- 2. Первое выступление ----------
const Stage: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const s = p.s2;
  const brave = easeInOut(clamp((f - s.brave) / 16));
  const ayan: ActorSpec = {
    uid: "p2-ayan",
    look: "ayanSchool",
    place: () => ({ x: 430, y: 1560, h: H.ayan }),
    face: (t) => keys(t, [[s.notice + 4, 0.1], [s.notice + 14, 0.55], [s.brave, 0.55], [s.brave + 12, 0]]),
    pose: () => ({
      expr: brave > 0.5 ? "softSmile" : { browIn: 7, browOut: -2, lid: 0.12, smile: -0.15 },
      lookY: lerp(0.65, 0, brave),
      nod: lerp(8, 0, brave),
      shoulders: lerp(0.8, 0, brave),
      lean: lerp(4, -2, brave),
      armL: { target: { x: 400, y: lerp(1180, 1140, brave) }, shape: "pinch", elbow: "down", item: "card", itemColor: "#FFFDF7", itemTilt: -4 },
      armR: { target: { x: 470, y: lerp(1190, 1150, brave) }, shape: "pinch", elbow: "down" },
    }),
    seed: 61,
  };
  const teacher: ActorSpec = {
    uid: "p2-teacher",
    look: "teacher",
    place: () => ({ x: 800, y: 1500, h: H.teacher * 0.86 }),
    // замечает волнение → тихий поддерживающий кивок
    face: (t) => keys(t, [[s.notice - 10, -0.1], [s.notice, -0.6]]),
    pose: (t) => ({
      expr: t < s.notice ? "calm" : "softSmile",
      lookY: 0.25,
      nod: keys(t, [[s.nod, 2], [s.nod + 6, 10], [s.nod + 14, 3], [s.nod + 18, 7], [s.nod + 26, 2]]),
      armL: { target: { x: 760, y: 1190 }, shape: "relax", elbow: "down" },
      armR: { target: { x: 840, y: 1200 }, shape: "relax", elbow: "down" },
    }),
    seed: 63,
  };
  return (
    <Shot f={f} cam={{ x: 600, y: 1150, zoom: 1.7 }} bg="#E6EFDF">
      <ClassBack />
      <Act s={teacher} f={f} layer="all" />
      <Act s={ayan} f={f} layer="all" />
      {/* одноклассники спиной на первом плане */}
      <Svg>
        {[220, 560, 900].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={1560} rx={120} ry={90} fill={i === 1 ? "#2E4A7A" : "#26386A"} />
            <circle cx={x} cy={1450} r={62} fill={["#3B2B24", "#2A2420", "#4A332A"][i]} />
          </g>
        ))}
      </Svg>
    </Shot>
  );
};

// ---------- 3. Командный проект ----------
const Project: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const s = p.s3;
  const top = 1300;
  const model = { x: 560, y: top + 10 };
  const handoff = { x: 690, y: 1180 };
  const slot = { x: model.x + 130, y: model.y - 50 };
  const ayanHand = keysV(f, [[p.m3, { x: 600, y: 1200 }], [s.give, { x: 610, y: 1170 }], [s.hand, handoff], [s.hand + 14, handoff], [s.hand + 28, { x: 600, y: 1230 }]]);
  const tallHand = keysV(f, [[s.give, { x: 860, y: 1230 }], [s.hand, handoff], [s.hand + 10, handoff], [s.place, slot], [s.place + 16, { x: 860, y: 1240 }]]);
  const withAyan = f < s.hand + 6;
  const ayan: ActorSpec = {
    uid: "p3-ayan",
    look: "ayanSchool",
    place: () => ({ x: 560, y: 1540, h: H.ayan }),
    face: (t) => keys(t, [[s.give, 0.2], [s.give + 10, 0.55], [s.place, 0.3]]),
    pose: () => ({
      expr: "smile",
      lookY: 0.45,
      lean: 8,
      armR: { target: ayanHand, shape: "pinch", elbow: "down", item: withAyan ? "block" : "none", itemColor: C.green, behind: false },
      armL: { target: { x: 520, y: top + 4 }, shape: "relax", elbow: "down" },
    }),
    seed: 61,
  };
  const tall: ActorSpec = {
    uid: "p3-tall",
    look: "kidTall",
    place: () => ({ x: 860, y: 1540, h: H.kidTall }),
    face: () => -0.55,
    pose: (t) => ({
      expr: "softSmile",
      lookY: 0.5,
      lean: 10,
      armL: { target: tallHand, shape: t >= s.hand ? "pinch" : "open", elbow: "down", item: !withAyan && t < s.place + 2 ? "block" : "none", itemColor: C.green, behind: false },
      armR: { target: { x: 900, y: top + 4 }, shape: "relax", elbow: "down" },
    }),
    seed: 64,
  };
  const braids: ActorSpec = {
    uid: "p3-braids",
    look: "kidBraids",
    place: () => ({ x: 280, y: 1540, h: H.kid }),
    face: () => 0.5,
    pose: () => ({
      expr: "smile",
      lookY: 0.45,
      lean: 8,
      armR: { target: { x: model.x - 210, y: model.y + 6 }, shape: "open", elbow: "down" },
      armL: { target: { x: model.x - 240, y: model.y + 14 }, shape: "open", elbow: "down" },
    }),
    seed: 65,
  };
  return (
    <Shot f={f} cam={{ x: 620, y: 1170, zoom: 2.0 }} bg="#E6EFDF">
      <ClassBack board={false} />
      {[braids, ayan, tall].map((a) => (
        <Act key={a.uid} s={a} f={f} layer="body" />
      ))}
      <SchoolDesk x0={150} x1={980} top={top} />
      <CityModel x={model.x} y={model.y} placed={f >= s.place + 2 ? 4 : 3} />
      {[braids, ayan, tall].map((a) => (
        <Act key={`${a.uid}-a`} s={a} f={f} layer="arms" />
      ))}
    </Shot>
  );
};

export const PeopleScene: React.FC = () => {
  const { f } = useScene("people");
  const p = usePlan(peoplePlan);
  if (f < p.m2) return <Desk f={f} p={p} />;
  if (f < p.m3) return <Stage f={f} p={p} />;
  if (f < p.home) return <Project f={f} p={p} />;
  // 4. дома: мама слушает
  const mom: ActorSpec = {
    uid: "p-mom",
    look: "momHome",
    place: () => MOM_SEAT,
    face: () => -0.62,
    pose: () => ({ sit: 1, seat: MOM_SEAT_H, lean: 14, nod: 6, expr: { browIn: 4, browOut: 2, lid: 0.1, smile: 0.3 }, lookY: 0.15, armL: { target: onDesk(450, 1500), shape: "relax", elbow: "down" }, armR: { target: onDesk(150, 1450), shape: "relax", elbow: "down" } }),
    seed: 12,
  };
  const ayan: ActorSpec = { uid: "p-ayan-h", look: "ayanHome", place: () => AYAN_SEAT, face: () => 0.45, pose: () => ayanSeated({ expr: "softSmile", lookY: 0.1 }), seed: 11 };
  return (
    <AbsoluteFill>
      <RoomFront f={f} cam={ROOM_CAM.twoSeated} items={gridLayout()} ayan={ayan} momSeated={mom} momChairX={MOM_SEAT.x} />
    </AbsoluteFill>
  );
};

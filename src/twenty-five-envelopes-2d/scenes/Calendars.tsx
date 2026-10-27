// Сцена 10. Сначала проверить варианты дороги (N05). Вечер.
// A. Кухонный стол, лампа: папа открывает свой рабочий планер, мама — свой.
// B. Сверху: мама кладёт между ними расписание уроков нынешней школы.
// C. Два пальца: мама отмечает строку «Сабак бүтөт: 13:00», папа —
//    встречу «13:00 · Жолугушуу» в своём планере. Встречи не исчезают:
//    календари остаются обычными рабочими календарями.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { TE2_TEXT } from "../script";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C } from "../theme";
import { CloseHand, SKIN } from "../props/CloseHand";
import { cellAt, PLAN, Planner } from "../props/Planner";
import { ScheduleArt, SCHEDULE_RATIO, SCHEDULE_ROWS } from "../props/Schedule";
import { KitchenBack } from "./Dinner";
import { Act, type ActorSpec } from "./room";
import { H, seatOf } from "./common";

export const calendarsPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "calendars");
  const L = T.len;
  const b = T.word("N05", "Жанына") - 6;
  const c = T.word("N05", "Адегенде") - 4;
  return { open: [12, 34] as const, b, place: [b + 4, b + 30] as const, c, mark: c + 12, len: L };
};
type P = ReturnType<typeof calendarsPlan>;

const FLOOR = 1540;
const TOPY = 1300;
const DAD = { x: 360, y: FLOOR, h: H.dad };
const MOM = { x: 720, y: FLOOR, h: H.mom };

// Планер на столе во фронтальном плане: обложка открывается (сжимается
// к корешку), под ней — разворот с цветными строками.
const PlannerFlat: React.FC<{ x: number; open: number; color: string }> = ({ x, open, color }) => (
  <Svg>
    <g transform={`translate(${x} ${TOPY + 14})`}>
      <rect x={-100} y={-14} width={200} height={26} rx={4} fill="#FFFDF7" stroke="#D8D0C0" strokeWidth={2} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={-88 + k * 60} y={-8} width={50} height={6} rx={3} fill={k === 1 ? C.blue : "#9AA6BC"} opacity={open} />
      ))}
      <rect x={-100 + 200 * open} y={-16} width={200 * (1 - open)} height={28} rx={4} fill={color} />
    </g>
  </Svg>
);

const Table: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const o = easeInOut(clamp((f - p.open[0]) / (p.open[1] - p.open[0])));
  const o2 = easeInOut(clamp((f - p.open[0] - 8) / (p.open[1] - p.open[0])));
  const parents: ActorSpec[] = [
    {
      uid: "c-dad",
      look: "dadHome",
      place: () => DAD,
      face: (t) => (t < p.open[1] + 10 ? 0 : 0.4),
      pose: () => ({ sit: 1, seat: seatOf(H.dad), lean: 10, expr: "thinking", lookY: 0.6, nod: 6, armL: { target: { x: 300, y: TOPY - 6 }, shape: "relax", elbow: "down" }, armR: { target: { x: lerp(330, 470, o), y: TOPY - 2 - Math.sin(Math.PI * o) * 30 }, shape: "open", elbow: "down" } }),
      seed: 51,
    },
    {
      uid: "c-mom",
      look: "momHome",
      place: () => MOM,
      face: (t) => (t < p.open[1] + 10 ? 0 : -0.4),
      pose: () => ({ sit: 1, seat: seatOf(H.mom), lean: 10, expr: "thinking", lookY: 0.6, nod: 6, armR: { target: { x: 780, y: TOPY - 6 }, shape: "relax", elbow: "down" }, armL: { target: { x: lerp(650, 810, o2), y: TOPY - 2 - Math.sin(Math.PI * o2) * 30 }, shape: "open", elbow: "down" } }),
      seed: 12,
    },
  ];
  return (
    <Shot f={f} cam={{ x: 560, y: 1120, zoom: keys(f, [[0, 1.5], [p.b, 1.6]]) }} bg="#E3C9A2">
      <KitchenBack />
      <div style={box({ left: -200, top: 600, width: 1500, height: 900, background: "radial-gradient(ellipse at 50% 50%, rgba(255,200,110,0.25), rgba(255,200,110,0) 70%)" })} />
      {parents.map((a) => (
        <Act key={a.uid} s={a} f={f} layer="body" />
      ))}
      <Svg>
        <rect x={120} y={TOPY} width={840} height={34} fill="#F4EEE2" />
        <rect x={120} y={TOPY + 34} width={840} height={FLOOR + 40 - TOPY} fill="#E5D8C2" />
      </Svg>
      <PlannerFlat x={420} open={o} color={C.blue} />
      <PlannerFlat x={700} open={o2} color={C.green} />
      {parents.map((a) => (
        <Act key={`${a.uid}-a`} s={a} f={f} layer="arms" />
      ))}
    </Shot>
  );
};

// B: сверху — расписание ложится между двумя планерами
const Place: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.place[0]) / (p.place[1] - p.place[0])));
  const sx = lerp(900, 540, k);
  const sy = lerp(1700, 1260, k);
  return (
    <AbsoluteFill style={{ backgroundColor: "#CFA77A" }}>
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 35%, rgba(255,214,140,0.45), rgba(0,0,0,0) 70%)" })} />
      <div style={box({ left: -560, top: 260 })}>
        <Planner title={TE2_TEXT.calendar.dad} cards={[{ day: 2, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue }, { day: 3, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue }, { day: 4, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue }]} />
      </div>
      <div style={box({ left: 720, top: 300 })}>
        <Planner title={TE2_TEXT.calendar.mom} tint={C.green} cards={[{ day: 0, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue }, { day: 1, hour: 1, text: "Кеңешме", color: "#7C8BA3" }]} />
      </div>
      <Svg>
        <g transform={`translate(${sx} ${sy}) rotate(${lerp(12, -2, k)})`}>
          <ScheduleArt w={480} />
        </g>
        {k < 1 ? <CloseHand x={sx + 210} y={sy + 380} angle={160} size={230} {...SKIN.mom} shape="pinch" armLen={5} /> : null}
      </Svg>
    </AbsoluteFill>
  );
};

// C: два пальца на совпадающих строках (верх — расписание, низ — планер)
const Fingers: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const mark = easeInOut(clamp((f - p.mark) / 14));
  const w = 860;
  const h = w * SCHEDULE_RATIO;
  const endY = -h / 2 + h * SCHEDULE_ROWS.end;
  const card = cellAt(2, 2);
  const tip1 = { x: 840, y: 520 };
  const tip2 = { x: 70 + (card.x + PLAN.colW / 2) * 1.15, y: 1100 + (card.y + PLAN.rowH / 2) * 1.15 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#CFA77A" }}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 940, overflow: "hidden" })}>
        <svg width={1080} height={940}>
          <g transform={`translate(540 ${520 - endY})`}>
            <ScheduleArt w={w} mark={mark} />
          </g>
          <CloseHand x={tip1.x + 150} y={tip1.y + 200} angle={145} size={250} {...SKIN.mom} shape="point" armLen={5} />
        </svg>
      </div>
      <div style={box({ left: 0, top: 940, width: 1080, height: 12, backgroundColor: "#F7F4EE" })} />
      <div style={box({ left: 0, top: 952, width: 1080, height: 968, overflow: "hidden", backgroundColor: "#C49A6C" })}>
        <div style={box({ left: 70, top: 148, transform: "scale(1.15)", transformOrigin: "0 0" })}>
          <Planner title={TE2_TEXT.calendar.dad} dayHi={2} cards={[{ day: 2, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue, hi: mark }, { day: 3, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue }, { day: 0, hour: 0, text: "Пландоо", color: "#7C8BA3" }]} />
        </div>
        <svg width={1080} height={968} style={{ position: "absolute", left: 0, top: 0 }}>
          <CloseHand x={tip2.x - 170} y={tip2.y - 952 + 230} angle={-145} size={250} {...SKIN.dadHome} shape="point" mirror armLen={5} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const CalendarsScene: React.FC = () => {
  const { f } = useScene("calendars");
  const p = usePlan(calendarsPlan);
  if (f < p.b) return <Table f={f} p={p} />;
  if (f < p.c) return <Place f={f} p={p} />;
  return <Fingers f={f} p={p} />;
};

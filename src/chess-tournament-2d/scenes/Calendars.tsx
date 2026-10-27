// Сцена 11. Два календаря и одно расписание (M02, F05).
// A. Кухня. Мама за столом с телефоном. Папа (тот же лист в руке —
//    монтажный пропуск пути из комнаты) подходит, кладёт лист на стол
//    между ними и садится рядом. Это их общее решение.
// B. M02 — мама; затем два календаря по очереди, каждый в своём плане:
//    мамин («Бөлүм кеңешмеси» в 15:00) и папин («Жолугушуу» в 15:00).
// C. F05 — папа; мама открывает поиск, папа наклоняется к экрану.
import { AbsoluteFill } from "remotion";
import { clamp, cruise, easeInOut, keys, lerp, type Vec } from "../rig/motion";
import { CH2_TEXT } from "../script";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { KITCHEN } from "../sets/Home";
import { SKIN } from "../props/CloseHand";
import { CalendarScreen, PhoneClose } from "../props/Phone";
import { ScheduleArt } from "../props/Schedule";
import { K_SEAT_H, K_TABLE_Y, KitchenShot, seatPlace } from "./kitchen";
import type { ActorSpec } from "./shots";
import { H, sitDown } from "./common";

export const calendarsPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "calendars");
  const walk: [number, number] = [0, 34];
  const place: [number, number] = [walk[1] + 2, walk[1] + 20];
  const sit = place[1] + 4;
  const m02End = T.to("M02");
  const f05 = T.from("F05");
  const calMom: [number, number] = [m02End + 6, m02End + 6 + Math.round((f05 - m02End - 10) / 2)];
  const calDad: [number, number] = [calMom[1], f05 - 4];
  const f05End = T.to("F05");
  return { walk, place, sit, m02: T.from("M02"), m02End, calMom, calDad, f05, f05End, tap: f05End + 10, len: T.len };
};
type P = ReturnType<typeof calendarsPlan>;

const MOM = seatPlace(420, H.mom);
const DAD_SEAT = seatPlace(690, H.dad);
const SHEET_ON_TABLE: Vec = { x: 556, y: K_TABLE_Y - 8 };
const SW = 76;

const sheetOf = (t: number, p: P) => {
  if (t >= p.place[1]) return { c: SHEET_ON_TABLE, flat: 1 };
  const carry = { x: lerp(820, 740, cruise(clamp(t / p.walk[1]), 0.3)), y: 1130 };
  if (t < p.place[0]) return { c: carry, flat: 0 };
  const u = easeInOut((t - p.place[0]) / (p.place[1] - p.place[0]));
  return { c: { x: lerp(carry.x, SHEET_ON_TABLE.x, u), y: lerp(carry.y, SHEET_ON_TABLE.y, u) }, flat: u };
};

const Medium: React.FC<{ f: number; p: P; cam: { x: number; y: number; zoom: number } }> = ({ f, p, cam }) => {
  const dadPlace = (t: number) => ({ x: lerp(820, DAD_SEAT.x, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: KITCHEN.floorY, h: H.dad });
  const dad: ActorSpec = {
    uid: "c-dad",
    look: "dadSuit",
    place: dadPlace,
    face: (t) => (t < p.sit + 30 ? -0.35 : t < p.f05End + 6 ? -0.45 : -0.3),
    pose: (t) => {
      const s = sitDown(t, p.sit, 34);
      const sh = sheetOf(t, p);
      const leanIn = keys(t, [[p.tap - 4, 0], [p.tap + 14, 1]]);
      return {
        sit: s.sit,
        seat: K_SEAT_H.adult,
        lean: s.lean + leanIn * 10,
        expr: t < p.f05 ? ("calm" as const) : ({ browIn: 3, browOut: 1, lid: 0.12, smile: 0.2 } as const),
        lookX: -0.5,
        lookY: t < p.place[1] ? 0.4 : t >= p.tap ? 0.6 : 0.1,
        armL:
          t < p.place[1] + 4
            ? { target: { x: sh.c.x + SW * 0.4, y: sh.c.y + SW * 0.3 }, shape: "pinch", elbow: "down", behind: false }
            : { target: { x: 640, y: K_TABLE_Y }, shape: "relax", elbow: "hang", behind: false },
        armR: t >= p.sit ? { target: { x: 740, y: K_TABLE_Y }, shape: "relax", elbow: "hang" } : { target: null },
      };
    },
    role: "father",
    seed: 2,
    walkFrom: 0,
  };
  const mom: ActorSpec = {
    uid: "c-mom",
    look: "momHome",
    place: () => MOM,
    face: (t) => (t < p.m02End + 4 ? 0.4 : t < p.tap - 6 ? 0.45 : 0.1),
    pose: (t) => ({
      sit: 1,
      seat: K_SEAT_H.adult,
      expr: t < p.m02 ? ("calm" as const) : ("softSmile" as const),
      lookX: t >= p.tap - 6 ? 0 : 0.45,
      lookY: t >= p.tap - 6 ? 0.6 : 0.15,
      armR: { target: { x: 470, y: 1150 }, shape: "phone", item: "phone", itemColor: "#C9786A", glow: 1, elbow: "hang", behind: false },
      armL: t >= p.tap && t < p.tap + 14 ? { target: { x: 470, y: 1130 }, shape: "point", elbow: "hang" } : { target: { x: 380, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
    }),
    role: "mother",
    seed: 5,
    blinkShift: 19,
  };
  const sh = sheetOf(f, p);
  return (
    <KitchenShot
      f={f}
      cam={cam}
      seated={[mom, dad]}
      chairs={[MOM.x, DAD_SEAT.x]}
      onTable={
        <Svg>
          <g transform={`translate(${sh.c.x} ${sh.c.y}) rotate(${-6 * sh.flat}) scale(1 ${1 - 0.74 * sh.flat})`}>
            <ScheduleArt w={SW} detail={false} />
          </g>
        </Svg>
      }
    />
  );
};

// Календарь крупно; рядом на столе — тот же лист расписания.
const Cal: React.FC<{ f: number; mom: boolean }> = ({ f, mom }) => (
  <AbsoluteFill>
    <PhoneClose f={f} taps={[]} skin={mom ? SKIN.mom : SKIN.dad} caseColor={mom ? "#C9786A" : "#2B2F38"}>
      <CalendarScreen item={mom ? CH2_TEXT.calendar.momItem : CH2_TEXT.calendar.dadItem} early={mom ? "Эсеп" : "Чийме"} accent={mom ? "#5E9A93" : undefined} mark={easeInOut(clamp((f - 8) / 10))} />
    </PhoneClose>
    <div style={box({ inset: 0, pointerEvents: "none" })}>
      <Svg>
        <g transform={`translate(${mom ? 930 : 150} 1640) rotate(${mom ? -10 : 9})`}>
          <ScheduleArt w={300} mark={1} />
        </g>
      </Svg>
    </div>
  </AbsoluteFill>
);

export const CalendarsScene: React.FC = () => {
  const { f } = useScene("calendars");
  const p = usePlan(calendarsPlan);
  if (f >= p.calMom[0] && f < p.calMom[1]) return <Cal f={f - p.calMom[0]} mom />;
  if (f >= p.calDad[0] && f < p.calDad[1]) return <Cal f={f - p.calDad[0]} mom={false} />;
  const cam = f < p.m02 - 6 ? { x: 600, y: 1090, zoom: 1.7 } : f < p.calMom[0] ? { x: 470, y: 1030, zoom: 2.2 } : { x: 560, y: 1050, zoom: 2.0 };
  return <Medium f={f} p={p} cam={cam} />;
};

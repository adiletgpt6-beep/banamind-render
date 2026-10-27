// Сцена 5. Новое время (D01, F01). Дома, вечер.
// A. Папа (в пиджаке) сидит у кухонного стола, телефон лежит рядом.
//    Дочка стоит за столом рядом и держит лист расписания двумя руками;
//    она поднимает его к папе.
// B. Крупно: тот же лист, её палец приходит к строке «Аяктоо: 15:00».
// C. Папа сначала смотрит на неё, потом берёт телефон со стола.
// D. Экран телефона крупно (с правильной стороны): календарь, в 15:00
//    почти каждый день встречи.
// E. Вторую фразу папа говорит, глядя на дочку, спокойно и без
//    раздражения; потом взгляд возвращается к календарю.
// F. Дочка видит занятые часы, опускает взгляд на свой лист и складывает
//    его. Пауза без поясняющего текста.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp, type Vec } from "../rig/motion";
import { CH2_TEXT } from "../script";
import { C } from "../theme";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { KITCHEN } from "../sets/Home";
import { CloseHand, SKIN } from "../props/CloseHand";
import { CalendarScreen, PhoneClose } from "../props/Phone";
import { SCHEDULE_ROWS, SCHEDULE_RATIO, ScheduleArt } from "../props/Schedule";
import { K_SEAT_H, K_TABLE_Y, KitchenShot, seatPlace } from "./kitchen";
import type { ActorSpec } from "./shots";
import { H } from "./common";

export const timePlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "time");
  const d01End = T.to("D01");
  const f01 = T.from("F01");
  const f01End = T.to("F01");
  return {
    raise: [10, 30] as const,
    d01: T.from("D01"),
    point: T.word("D01", "үчтө") - 6,
    d01End,
    phone: d01End + 14, // берёт телефон
    cal: f01 - 2,
    f01,
    face: T.word("F01", "Сени") - 4,
    f01End,
    girl: f01End + 16,
    fold: [f01End + 44, f01End + 66] as const,
    len: T.len,
  };
};
type P = ReturnType<typeof timePlan>;

const DAD = seatPlace(380, H.dad);
const GIRL = { x: 650, y: KITCHEN.floorY - 8, h: H.girl };
const PHONE_ON_TABLE: Vec = { x: 470, y: K_TABLE_Y - 2 };
const SW = 76;

// Лист в руках дочки (центр).
const sheetC = (t: number, p: P): Vec => {
  const low = { x: 618, y: 1150 };
  const up = { x: 560, y: 1110 };
  const u = easeInOut(clamp((t - p.raise[0]) / (p.raise[1] - p.raise[0]))) * (1 - easeInOut(clamp((t - p.girl) / 20)));
  return { x: lerp(low.x, up.x, u), y: lerp(low.y, up.y, u) };
};
const foldOf = (t: number, p: P) => easeInOut(clamp((t - p.fold[0]) / (p.fold[1] - p.fold[0])));

const Medium: React.FC<{ f: number; p: P; cam: { x: number; y: number; zoom: number } }> = ({ f, p, cam }) => {
  const dad: ActorSpec = {
    uid: "t-dad",
    look: "dadSuit",
    place: () => DAD,
    face: () => 0.5,
    pose: (t) => {
      const lift = easeInOut(clamp((t - p.phone) / 16));
      const toPhone = t >= p.phone - 14 && t < p.phone ? easeInOut(clamp((t - (p.phone - 14)) / 14)) : t >= p.phone ? 1 : 0;
      const handPhone = { x: lerp(PHONE_ON_TABLE.x, 440, lift), y: lerp(PHONE_ON_TABLE.y, 1130, lift) };
      const lookPhone = (t >= p.phone + 8 && t < p.face) || t > p.f01End + 6;
      return {
        sit: 1,
        seat: K_SEAT_H.adult,
        expr: t < p.d01End ? ("softSmile" as const) : t < p.f01End ? ({ browIn: 4, browOut: 1, lid: 0.15, smile: 0.12 } as const) : ({ browIn: 4, browOut: 0, lid: 0.15, smile: 0.05 } as const),
        lookX: lookPhone ? 0.1 : 0.55,
        lookY: lookPhone ? 0.6 : -0.15,
        armL: { target: { x: 330, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
        armR:
          t >= p.phone
            ? { target: handPhone, shape: "phone", item: "phone", itemColor: "#2B2F38", glow: 1, flat: 1 - lift, elbow: "hang", behind: false }
            : { target: { x: lerp(430, PHONE_ON_TABLE.x + 10, toPhone), y: K_TABLE_Y }, shape: "relax", elbow: "hang", behind: false },
      };
    },
    role: "father",
    seed: 2,
  };
  const girl: ActorSpec = {
    uid: "t-girl",
    look: "girlHome",
    place: () => GIRL,
    face: () => -0.5,
    pose: (t) => {
      const c = sheetC(t, p);
      const fold = foldOf(t, p);
      const atPhone = t >= p.phone + 4 && t < p.girl + 20;
      return {
        expr: t < p.f01 ? ({ browIn: 3, browOut: 3, lid: 0.08, smile: 0.3 } as const) : t < p.girl ? ("calm" as const) : ({ browIn: 6, browOut: -2, lid: 0.32, smile: -0.05 } as const),
        lookX: -0.5,
        lookY: atPhone ? 0.35 : t >= p.girl + 20 ? 0.8 : -0.1,
        nod: keys(t, [[p.girl + 14, 0], [p.girl + 30, 9]]),
        shoulders: keys(t, [[p.girl + 30, 0], [p.girl + 50, 0.35]]),
        armL: { target: { x: c.x - SW * 0.42, y: c.y + SW * (0.55 - 0.3 * fold) }, shape: "pinch", elbow: "down", behind: false },
        armR: { target: { x: c.x + SW * 0.42, y: c.y + SW * (0.55 - 0.3 * fold) }, shape: "pinch", elbow: "down", behind: false },
      };
    },
    role: "daughter",
    seed: 4,
    blinkShift: 37,
  };
  const c = sheetC(f, p);
  return (
    <KitchenShot
      f={f}
      cam={cam}
      seated={[dad, girl]}
      chairs={[DAD.x]}
      onTable={
        <Svg>
          {f < p.phone ? (
            <g transform={`translate(${PHONE_ON_TABLE.x} ${PHONE_ON_TABLE.y}) scale(1 0.3)`}>
              <rect x={-34} y={-60} width={68} height={120} rx={12} fill="#2B2F38" />
            </g>
          ) : null}
          <g transform={`translate(${c.x} ${c.y})`}>
            <ScheduleArt w={SW} detail={false} fold={foldOf(f, p)} />
          </g>
        </Svg>
      }
    />
  );
};

// B. Лист крупно: палец к строке «Аяктоо: 15:00».
const SheetClose: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const W = 760;
  const cx = 540;
  const cy = 900;
  const rowY = cy - (W * SCHEDULE_RATIO) / 2 + W * SCHEDULE_RATIO * SCHEDULE_ROWS.end;
  const u = easeInOut(clamp((f - p.point - 4) / 14));
  const tip = { x: lerp(cx + 380, cx + 210, u), y: lerp(rowY + 260, rowY + 6, u) };
  const L = 230;
  return (
    <AbsoluteFill style={{ backgroundColor: "#EFDDBD" }}>
      <div style={box({ inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${C.amberGlow}, rgba(0,0,0,0) 70%)` })} />
      <Svg>
        <g transform={`translate(${cx} ${cy}) rotate(-2)`}>
          <ScheduleArt w={W} mark={easeInOut(clamp((f - p.point - 12) / 10))} />
        </g>
        {/* левая рука держит лист снизу */}
        <CloseHand x={cx - 300} y={cy + 640} angle={-176} size={220} {...SKIN.girl} shape="pinch" mirror armLen={3} />
        <CloseHand x={tip.x + 0.4 * L} y={tip.y + 1.02 * L} angle={158} size={L} {...SKIN.girl} shape="point" armLen={4} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TimeScene: React.FC = () => {
  const { f } = useScene("time");
  const p = usePlan(timePlan);
  if (f >= p.point && f < p.d01End + 6) return <SheetClose f={f} p={p} />;
  if (f >= p.cal && f < p.face) {
    return (
      <PhoneClose f={f - p.cal} taps={[]} skin={SKIN.dad} caseColor="#2B2F38">
        <CalendarScreen item={CH2_TEXT.calendar.dadItem} early="Чийме" mark={easeInOut(clamp((f - p.cal - 20) / 12))} />
      </PhoneClose>
    );
  }
  const cam = f < p.cal ? { x: 520, y: 1070, zoom: 1.95 } : f < p.girl ? { x: 470, y: 1030, zoom: 2.0 } : { x: 640, y: 1060, zoom: 2.4 };
  return <Medium f={f} p={p} cam={cam} />;
};

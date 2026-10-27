// Сцена 12. Родители сами находят BalaGo.
// A. Вечер, кухонный стол: мама берёт телефон, папа наклоняется к ней.
// B. Телефон крупно (рука мамы держит, палец другой руки касается реальных
//    кнопок; рядом мягко размыт папа, он смотрит тот же экран):
//    поиск «BalaGo» → результат → страница → «Мектеп каттамын талкуулоо».
// C. F01: папа говорит до отправки («Шаршемби менде калсын…»).
// D. Мама отмечает дни: Дүйшөмбү, Шейшемби, Бейшемби, Жума; среда —
//    «Шаршембиде атасы алып келет». Касание «Өтүнмө жөнөтүү» → кнопка
//    меняется → «Өтүнмө жөнөтүлдү», «Каттамды тактоо үчүн байланышабыз».
//    Это предварительная заявка: ни водителя, ни подтверждённых поездок.
// E. Мама кладёт телефон, супруги ещё раз смотрят на календарь.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { PhoneScreen, type PhoneState } from "../props/PhoneScreen";
import { clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { SU2_TEXT } from "../script";
import { C, TINT } from "../theme";
import { KITCHEN, KitchenBack, KitchenChairs, KitchenTable } from "../sets/Home";
import { H, HANDS, seatOf } from "./common";

const K = KITCHEN;
const MOM: Place = { x: K.seats.girl, y: K.floorY - 30, h: H.mom };
const DAD: Place = { x: K.seats.dad, y: K.floorY - 30, h: H.dad };
const PHONE_TABLE = { x: 700, y: K.table.top - 4 };

export const searchPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "search");
  const grab: [number, number] = [T.from("N11") + 6, T.from("N11") + 26];
  const phone = grab[1] + 10;
  const tapSearch = phone + 8;
  const typeFrom = phone + 14;
  const q = SU2_TEXT.search.query.length;
  const typeTo = typeFrom + q * 4;
  const tapResult = Math.max(typeTo + 12, T.word("N11", "BalaGo") + 4);
  const page = tapResult + 6;
  const tapCta = Math.max(page + 40, T.word("N11", "сүйлөшүү") - 4);
  const form = tapCta + 6;
  const f01: [number, number] = [T.from("F01") - 8, T.to("F01") + 6];
  const note = f01[1] + 6;
  const days = [note + 10, note + 20, note + 30, note + 40];
  const summary = days[3] + 6;
  const send = summary + 18;
  const sent = send + 6;
  const down: [number, number] = [sent + 66, sent + 90];
  return { grab, phone, tapSearch, typeFrom, typeTo, tapResult, page, tapCta, form, f01, note, days, summary, send, sent, down, len: T.len };
};
type P = ReturnType<typeof searchPlan>;

const stateAt = (f: number, p: P): PhoneState => {
  const q = SU2_TEXT.search.query;
  const n = Math.max(0, Math.min(q.length, Math.floor((f - p.typeFrom) / 4) + 1));
  const view = f < p.typeTo + 6 ? "search" : f < p.page ? "results" : f < p.form ? "page" : f < p.sent ? "form" : "sent";
  return {
    view,
    typed: f >= p.typeFrom ? q.slice(0, n) : "",
    searchOn: f >= p.tapSearch,
    resultTap: f >= p.tapResult,
    ctaTap: f >= p.tapCta,
    days: [0, 1, 2, 3, 4].map((i) => {
      const k = [0, 1, 3, 4].indexOf(i);
      return k >= 0 && f >= p.days[k];
    }),
    dadNote: clamp((f - p.note) / 8),
    summary: clamp((f - p.summary) / 8),
    sendTap: f >= p.send,
    sent: clamp((f - p.sent) / 10),
  };
};

// Экран в кадре.
const PH = { x: 250, y: 200, w: 580, h: 1180 };
const SCR = { x: PH.x + 26, y: PH.y + 80, w: 528, h: PH.h - 160 };
// Точки касаний (кадр) — центры реальных элементов PhoneScreen.
const TAPS = {
  search: { x: SCR.x + 264, y: SCR.y + 136 },
  result: { x: SCR.x + 264, y: SCR.y + 300 },
  cta: { x: SCR.x + 264, y: SCR.y + 895 },
  day: (i: number) => ({ x: SCR.x + 24 + i * 98 + 44, y: SCR.y + 305 }),
  send: { x: SCR.x + 264, y: SCR.y + 765 },
  key: (k: number) => ({ x: SCR.x + 40 + ((k * 3) % 9) * 50, y: SCR.y + SCR.h - 330 + (k % 3) * 86 }),
};
// Кончик указательного пальца (CloseHand point) → запястье.
const L = 160;
const ANG = 150;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (ANG * Math.PI) / 180;
  const lx = 0.78 * L * 0.22;
  const ly = L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

const PhoneShot: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const s = stateAt(f, p);
  const q = SU2_TEXT.search.query.length;
  // цели пальца по времени: перед касанием подлетает, касается, отходит
  const taps: [number, { x: number; y: number }][] = [
    [p.tapSearch, TAPS.search],
    ...Array.from({ length: q }, (_, k) => [p.typeFrom + k * 4, TAPS.key(k)] as [number, { x: number; y: number }]),
    [p.tapResult, TAPS.result],
    [p.tapCta, TAPS.cta],
    ...p.days.map((d, k) => [d, TAPS.day([0, 1, 3, 4][k])] as [number, { x: number; y: number }]),
    [p.send, TAPS.send],
  ];
  const rest = { x: SCR.x + SCR.w + 120, y: SCR.y + SCR.h - 120 };
  const pts: [number, { x: number; y: number }][] = [[p.phone, rest]];
  for (const [t, pt] of taps) {
    pts.push([t - 4, { x: pt.x + 14, y: pt.y + 26 }]);
    pts.push([t, pt]);
    pts.push([t + 3, { x: pt.x + 10, y: pt.y + 22 }]);
  }
  pts.push([p.send + 14, rest]);
  pts.sort((a, b) => a[0] - b[0]);
  const tip = keysV(f, pts);
  const wrist = wristFor(tip);
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A3046">
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #F2DDBD, #E6C9A0)" })} />
      {/* папа рядом — мягко размыт справа сверху, смотрит на экран */}
      <div style={box({ left: 760, top: 40, width: 420, height: 700, filter: "blur(12px)", opacity: 0.9 })}>
        <Svg>
          <ellipse cx={230} cy={250} rx={140} ry={170} fill="#DCAA84" />
          <path d="M 90 190 Q 230 40 370 190 L 370 120 Q 230 20 90 120 Z" fill="#1F1A19" />
          <path d="M 0 700 Q 40 430 230 420 Q 420 430 440 700 Z" fill="#8FAFC8" />
        </Svg>
      </div>
      {/* рука мамы держит телефон снизу */}
      <Svg>
        <CloseHand x={PH.x + 120} y={PH.y + PH.h + 160} angle={170} size={230} {...HANDS.momHome} shape="grip" />
      </Svg>
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: "#1E2235", borderRadius: 64, boxShadow: `0 30px 60px rgba(0,0,0,0.25)` })} />
      <div style={box({ left: PH.x + PH.w / 2 - 60, top: PH.y + 28, width: 120, height: 24, borderRadius: 12, backgroundColor: "#0E1020" })} />
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h })}>
        <PhoneScreen s={s} h={SCR.h} />
      </div>
      {/* большой палец держащей руки поверх края корпуса */}
      <div style={box({ left: PH.x - 18, top: PH.y + PH.h - 260, width: 70, height: 170, borderRadius: 35, backgroundColor: HANDS.momHome.skin, border: `3px solid ${HANDS.momHome.shade}`, transform: "rotate(14deg)" })} />
      <Svg>
        <CloseHand x={wrist.x} y={wrist.y} angle={ANG} size={L} {...HANDS.momHome} shape="point" />
      </Svg>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

const TwoShot: React.FC<{ f: number; p: P; cam: { x: number; y: number; zoom: number } }> = ({ f, p, cam }) => {
  const holdPhone = f >= p.grab[0] + 8 && f < p.down[0] + 12;
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: seatOf(H.mom) + 30,
    expr: t > p.sent ? "softSmile" : "calm",
    lookY: holdPhone ? 0.45 : 0.4,
    lean: 4,
    armR: {
      target: keysV(t, [[p.grab[0], { x: 690, y: K.table.top + 6 }], [p.grab[0] + 8, PHONE_TABLE], [p.grab[1], { x: 680, y: K.table.top - 150 }], [p.down[0], { x: 680, y: K.table.top - 150 }], [p.down[0] + 12, PHONE_TABLE], [p.down[1], { x: 690, y: K.table.top + 6 }]]),
      shape: holdPhone ? "phone" : "relax",
      item: holdPhone ? "phone" : "none",
      itemColor: C.navy,
      glow: holdPhone ? 1 : 0,
      elbow: "down",
      behind: false,
    },
    armL: { target: { x: 540, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false },
  });
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad) + 30,
    expr: t >= p.f01[0] ? "softSmile" : "calm",
    lean: t > p.grab[1] && t < p.down[1] ? 10 : 2,
    lookY: t >= p.f01[0] && t < p.f01[1] ? 0.15 : 0.45,
    armR: { target: { x: 900, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false },
    armL: { target: t >= p.f01[0] + 10 && t < p.f01[1] - 6 ? { x: 740, y: K.table.top - 110 } : { x: 770, y: K.table.top + 6 }, shape: t >= p.f01[0] + 10 && t < p.f01[1] - 6 ? "point" : "relax", elbow: "down", behind: false },
  });
  const dadFace = (t: number) => (t >= p.f01[0] && t < p.f01[1] ? -0.7 : -0.5);
  return (
    <Shot f={f} cam={cam} bg={C.wallKitchen}>
      <KitchenBack warm={1} />
      <KitchenChairs seats={[K.seats.girl, K.seats.dad]} />
      <Actor uid="s12-mom" look="su2MomHome" f={f} place={() => MOM} face={() => 0.45} pose={momPose} role="mother" seed={5} layer="body" />
      <Actor uid="s12-dad" look="su2Dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <KitchenTable />
      {/* календарь на столе рядом */}
      <div style={box({ left: 820, top: K.table.top - 6, width: 200, height: 10, backgroundColor: "#FFFEFA", borderRadius: 3, boxShadow: "0 2px 0 #D8D2C4" })} />
      {!holdPhone ? (
        <Svg>
          <g transform={`translate(${PHONE_TABLE.x} ${PHONE_TABLE.y}) scale(1 0.3)`}>
            <rect x={-38} y={-70} width={76} height={140} rx={12} fill={C.navy} />
          </g>
        </Svg>
      ) : null}
      <Actor uid="s12-mom" look="su2MomHome" f={f} place={() => MOM} face={() => 0.45} pose={momPose} role="mother" seed={5} layer="arms" />
      <Actor uid="s12-dad" look="su2Dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

export const SearchScene: React.FC = () => {
  const { f } = useScene("search");
  const p = usePlan(searchPlan);
  const two = { x: 725, y: 1010, zoom: 1.75 };
  if (f < p.phone) return <TwoShot f={f} p={p} cam={{ x: 725, y: 1040, zoom: keys(f, [[0, 1.45], [p.phone, 1.6]]) }} />;
  if (f >= p.f01[0] && f < p.f01[1]) return <TwoShot f={f} p={p} cam={two} />;
  if (f < p.down[0]) return <PhoneShot f={f} p={p} />;
  return <TwoShot f={f} p={p} cam={{ x: 760, y: 1040, zoom: lerp(1.6, 1.5, easeInOut(clamp((f - p.down[0]) / 40))) }} />;
};

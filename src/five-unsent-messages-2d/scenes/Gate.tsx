// Сцены 3–4.
// 3. Школьные ворота. Машина припаркована. Отец заканчивает рабочий звонок,
//    убирает телефон и встречает сына: «Салам, уулум! Бүгүн кандай өттү?»
//    Сын с живым интересом: «Ата, билесиңби, бүгүн биз…» — на «бүгүн»
//    в кармане отца вибрирует телефон (вибрирует телефон, не тело): взгляд
//    вниз → голова → рука достаёт телефон. Уведомление «Жумуш» — «Санды
//    тактап коюңуз.» Сын сам замолкает на «биз…». Отец мягко: «Азыр,
//    уулум. Бир мүнөт күтө турчу.» — коротко отвечает и убирает телефон
//    до начала движения.
// 4. Машина уже едет (белая семейная машина, сын сзади пристёгнут, смотрит
//    в окно; отец следит за дорогой): «Анан, бүгүн эмне болду?» —
//    «Өзгөчө деле эч нерсе.» Без слёз и демонстративного отворачивания.
import { fontFamily } from "../../fonts";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { FU2_TEXT } from "../script";
import { C } from "../theme";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { Car } from "../sets/Outdoor";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { box as wbox } from "../shots";
import { H, placeAt } from "./common";
import { PanelArea, Stage, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const WORK_PHONE = "#1E2235"; // рабочий телефон отца — тёмный чехол
export const BOY_PHONE = "#3FA7A0"; // телефон сына — бирюзовый чехол

// Путь сына от двери школы через ворота к отцу.
const BOY_PATH: readonly Vec[] = [
  { x: 600, y: 1530 },
  { x: 930, y: 1770 },
  { x: 960, y: 1895 },
];
const along = (u: number): Vec => {
  const seg = BOY_PATH.slice(1).map((p, i) => Math.hypot(p.x - BOY_PATH[i].x, p.y - BOY_PATH[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = clamp(d / seg[i]);
      return { x: lerp(BOY_PATH[i].x, BOY_PATH[i + 1].x, k), y: lerp(BOY_PATH[i].y, BOY_PATH[i + 1].y, k) };
    }
    d -= seg[i];
  }
  return BOY_PATH[BOY_PATH.length - 1];
};
const BOY_WALK: readonly [number, number] = [4, 66];
const gateBoy = (tt: number): Place => {
  const p = along(cruise((tt - BOY_WALK[0]) / (BOY_WALK[1] - BOY_WALK[0]), 0.22));
  return placeAt(p.x, p.y, H.boy);
};
const GATE_DAD = placeAt(1190, 1880, H.dad);

// Уведомление на экране рабочего телефона (крупно, в углу панели).
const WorkNote: React.FC<{ a: number }> = ({ a }) => (
  <div style={box({ right: 28, top: 28, width: 470, padding: "20px 24px", borderRadius: 24, backgroundColor: "rgba(5,11,23,0.94)", border: `3px solid ${C.coral}`, fontFamily, opacity: a, translate: `0 ${(1 - a) * -16}px`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" })}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 800, color: C.coral }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.coral }} />
      {FU2_TEXT.work}
    </div>
    <div style={{ fontSize: 40, fontWeight: 900, color: C.text, marginTop: 10, lineHeight: 1.15 }}>{FU2_TEXT.workMsg}</div>
  </div>
);

export const GateScene: React.FC = () => {
  const { f, from, to, word } = useScene("gate");
  const f01 = from("f01");
  const s01 = from("s01");
  const f02 = from("f02");
  const callEnd = Math.min(36, f01 - 12);
  const buzz = word("s01", 2) + 2; // «бүгүн»
  const eyes = buzz + 4;
  const reach = buzz + 12;
  const out = buzz + 22;
  const stored = to("f02") + 26; // телефон снова в кармане
  const D = GATE_DAD;
  const ear = { x: D.x + 0.05 * D.h, y: D.y - 0.86 * D.h };
  const pocket = { x: D.x + 0.13 * D.h, y: D.y - 0.43 * D.h };
  const hold = { x: D.x + 0.02 * D.h, y: D.y - 0.6 * D.h };
  const hasPhone = (tt: number) => tt < callEnd + 14 || (tt >= out - 4 && tt < stored);
  const dadPose = (tt: number) => {
    const typing = tt > to("f02") - 10 && tt < stored - 12;
    return {
      expr: tt < f01 - 4 ? ("calm" as const) : tt < buzz ? ("smile" as const) : tt < f02 ? ("thinking" as const) : tt < to("f02") ? ("apologetic" as const) : ("calm" as const),
      armR: {
        target: keysV(
          tt,
          [
            [0, ear],
            [callEnd, ear],
            [callEnd + 14, pocket],
            [reach, pocket],
            [out, hold],
            [stored - 14, hold],
            [stored, pocket],
            [stored + 10, { x: D.x + 0.14 * D.h, y: D.y - 0.42 * D.h }],
          ],
          anticipate,
        ),
        shape: hasPhone(tt) ? ("phone" as const) : ("relax" as const),
        item: hasPhone(tt) ? ("phone" as const) : ("none" as const),
        itemColor: WORK_PHONE,
        glow: tt < callEnd || (tt > out && tt < stored - 10) ? 1 : 0,
        wrist: typing ? Math.sin(tt * 0.9) * 4 : 0,
        elbow: "down" as const,
        behind: false,
      },
      // приветствие: левая рука открыта к сыну
      armL: { target: keysV(tt, [[f01 - 6, { x: D.x - 0.14 * D.h, y: D.y - 0.44 * D.h }], [f01 + 6, { x: D.x - 0.24 * D.h, y: D.y - 0.56 * D.h }], [f01 + 40, { x: D.x - 0.24 * D.h, y: D.y - 0.56 * D.h }], [f01 + 56, { x: D.x - 0.14 * D.h, y: D.y - 0.44 * D.h }]], anticipate), shape: tt > f01 && tt < f01 + 50 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      // взгляд: на сына → (вибрация) глаза вниз → экран; на «Азыр» — коротко на сына
      lookY: keys(tt, [[0, 0], [callEnd + 4, 0.25], [eyes - 1, 0.25], [eyes + 3, 0.7], [f02 - 2, 0.7], [f02 + 4, 0.2], [f02 + 34, 0.2], [f02 + 42, 0.7], [stored, 0.7], [stored + 8, 0.25]]),
      lookX: keys(tt, [[eyes - 1, 0], [eyes + 3, 0.3], [f02 - 2, 0.3], [f02 + 4, 0], [f02 + 34, 0], [f02 + 42, 0.3], [stored, 0.3], [stored + 8, 0]]),
      nod: keys(tt, [[f02 + 6, 0], [f02 + 12, 3], [f02 + 20, 0]]),
    };
  };
  // лицо: к сыну; после вибрации голова за глазами — к телефону
  const dadFace = (tt: number) => keys(tt, [[0, -0.3], [callEnd, -0.3], [callEnd + 10, -0.55], [eyes + 2, -0.55], [eyes + 10, -0.15], [f02 - 2, -0.15], [f02 + 6, -0.55], [f02 + 34, -0.55], [f02 + 44, -0.15], [stored + 4, -0.15], [stored + 14, -0.5]]);
  const stopped = to("s01");
  const boyPose = (tt: number) => {
    const p = gateBoy(tt);
    return {
      expr: tt < stopped + 4 ? ("smile" as const) : tt < stored ? ("calm" as const) : ("neutral" as const),
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.47 * p.h }, shape: "fist" as const, elbow: "down" as const, behind: false },
      armR: { target: keysV(tt, [[s01, { x: p.x + 0.14 * p.h, y: p.y - 0.42 * p.h }], [s01 + 10, { x: p.x + 0.2 * p.h, y: p.y - 0.55 * p.h }], [stopped - 4, { x: p.x + 0.2 * p.h, y: p.y - 0.55 * p.h }], [stopped + 10, { x: p.x + 0.14 * p.h, y: p.y - 0.42 * p.h }]], anticipate), shape: tt > s01 && tt < stopped ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      // заметил телефон → глаза на экран отца → вниз
      lookY: keys(tt, [[0, 0], [BOY_WALK[1], -0.35], [stopped - 6, -0.35], [stopped + 2, 0.1], [f02 + 30, 0.1], [f02 + 40, 0.45]]),
      lookX: keys(tt, [[stopped - 6, 0], [stopped + 2, 0.4], [f02 + 30, 0.4], [f02 + 40, 0]]),
      shoulders: keys(tt, [[stopped, 0], [stopped + 10, 0.4], [stopped + 40, 0]]),
    };
  };
  const boyFace = (tt: number) => keys(tt, [[0, 0.2], [BOY_WALK[1] - 10, 0.45], [stopped + 20, 0.45], [f02 + 36, 0.2]]);
  const note = easeOut((f - out) / 8) * (1 - easeOut((f - (stored - 10)) / 8));
  // вибрация: короткие дуги у кармана
  const vib = f >= buzz && f < buzz + 14 ? 1 : 0;
  return (
    <PanelArea>
      <Stage cam={{ x: 1060, y: 1520, zoom: 0.64 }}>
        <SchoolBack minutes={13 * 60 + 5 + f / 120} />
        <SchoolFence />
        <Car x={1560} y={2150} s={1.25} color="#F4F5F7" dir={-1} />
        <Actor uid="g3-dad" look="salesDad" f={f} place={() => GATE_DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
        <Actor uid="g3-boy" look="boy" f={f} place={gateBoy} face={boyFace} pose={boyPose} role="son" seed={4} />
        {vib ? (
          <svg width={1} height={1} style={wbox({ left: 0, top: 0, overflow: "visible" })}>
            {[0, 1].map((i) => (
              <path key={i} d={`M ${pocket.x + 40 + i * 16} ${pocket.y - 24} q 10 24 0 48`} stroke="#3B4660" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f * 2.2)} />
            ))}
          </svg>
        ) : null}
        <SidewalkTrees />
      </Stage>
      <WorkNote a={note} />
    </PanelArea>
  );
};

// ---------- 4. В машине ----------
// Ремень безопасности: плечевая часть и поясная (мир кадра, px).
const Belt: React.FC<{ anchor: Vec; buckle: Vec; lap: Vec; w?: number }> = ({ anchor, buckle, lap, w = 18 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#3A3F4A" strokeWidth={w * 0.45} strokeLinecap="round" />
    <path d={`M ${lap.x} ${lap.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <rect x={buckle.x - 12} y={buckle.y - 8} width={24} height={16} rx={4} fill="#9AA3B2" />
  </svg>
);

export const CarScene: React.FC = () => {
  const { f, from, to } = useScene("car");
  const f03 = from("f03");
  const s02 = from("s02");
  const pass = f * 1.4;
  const dad: Place = { x: 830, y: 1980, h: 1180 };
  const boy: Place = { x: 470, y: 1360, h: 780 };
  const dadPose = (tt: number) => ({
    expr: tt < to("s02") + 10 ? ("calm" as const) : ("thinking" as const),
    sit: 1,
    seat: 780,
    armL: { target: { x: 660, y: 1258 }, shape: "fist" as const, elbow: "down" as const },
    armR: { target: { x: 982, y: 1258 }, shape: "fist" as const, elbow: "down" as const },
    // спрашивает: короткий взгляд в зеркало, затем снова дорога
    lookX: keys(tt, [[f03 - 8, 0], [f03, -0.45], [f03 + 30, -0.45], [f03 + 40, 0], [s02, 0], [s02 + 6, -0.3], [to("s02") + 10, -0.3], [to("s02") + 20, 0]]),
    nod: keys(tt, [[to("s02") + 8, 0], [to("s02") + 16, 3], [to("s02") + 26, 0]]),
  });
  const dadFace = (tt: number) => keys(tt, [[0, 0], [f03 - 6, 0], [f03 + 2, -0.15], [f03 + 34, -0.15], [f03 + 44, 0]]);
  const boyPose = (tt: number) => ({
    expr: tt < s02 - 6 ? ("calm" as const) : ("neutral" as const),
    sit: 1,
    seat: 330,
    packOff: true,
    armL: { target: { x: 430, y: 1030 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: 515, y: 1034 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    // смотрит в окно; на вопрос — короткий взгляд вперёд, ответ — снова к окну
    lookX: keys(tt, [[0, -0.7], [f03 + 6, -0.7], [f03 + 14, -0.1], [s02 - 4, -0.1], [s02 + 8, -0.6]]),
    lookY: keys(tt, [[s02 - 10, 0], [s02, 0.15]]),
    shoulders: keys(tt, [[s02 - 8, 0], [s02, 0.3], [s02 + 24, 0]]),
  });
  const boyFace = (tt: number) => keys(tt, [[0, -0.55], [f03 + 8, -0.55], [f03 + 18, -0.15], [s02 - 2, -0.15], [s02 + 12, -0.45]]);
  return (
    <PanelArea>
      <Stage cam={{ x: 560, y: 1040 + Math.sin(f * 0.3) * 1.5, zoom: 0.8 }} bg="#3B414D">
        <CabinBack />
        {/* в заднем окне проплывает улица — машина едет */}
        <div style={wbox({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = (((i * 260 - pass * 10) % 1300) + 1300) % 1300 - 200;
            return <div key={i} style={wbox({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
          })}
        </div>
        <Actor uid="c4-boy" look="boy" f={f} place={() => boy} face={boyFace} pose={boyPose} role="son" seed={4} />
        {/* ремень сына: от крепления у плеча через грудь к замку, поясная часть по бёдрам */}
        <Belt anchor={{ x: 392, y: 790 }} buckle={{ x: 548, y: 1036 }} lap={{ x: 398, y: 1034 }} />
        {/* рюкзак рядом на сиденье */}
        <div style={wbox({ left: 620, top: 930, width: 140, height: 180, borderRadius: "40px 40px 20px 20px", backgroundColor: "#3E9C6B" })} />
        <div style={wbox({ left: 642, top: 1030, width: 96, height: 56, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.15)" })} />
        <div style={wbox({ left: 360, top: 1056, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
        <FrontSeats />
        <Actor uid="c4-dad" look="salesDad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} />
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d="M 905 1000 L 745 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
        </svg>
        <CabinFront pass={pass} wheel={Math.sin(f * 0.05) * 3} />
        {/* телефон в держателе — тёмный, не используется в дороге */}
        <div style={wbox({ left: 254, top: 1390, width: 92, height: 160, borderRadius: 14, backgroundColor: WORK_PHONE, border: "4px solid #11131A" })}>
          <div style={wbox({ left: 5, top: 6, right: 5, bottom: 6, borderRadius: 9, backgroundColor: "#151B2A" })} />
        </div>
        <div style={wbox({ left: 286, top: 1546, width: 28, height: 60, backgroundColor: "#11131A" })} />
      </Stage>
    </PanelArea>
  );
};

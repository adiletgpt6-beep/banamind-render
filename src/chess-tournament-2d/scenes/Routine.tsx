// Сцена 4. Как семья ездит сейчас (N04). Последовательный монтаж дня,
// каждый план — по смыслу слов рассказчика:
//   a) «Атасы инженер» — папа в офисе рассматривает чертёж здания на стене;
//   b) «апасы бөлүм жетекчиси» — мама обсуждает документы с двумя
//      коллегами на коротком совещании;
//   c) «түшкү тыныгууда» — папа смотрит на часы и закрывает рабочую папку;
//   d) «кызын мектептен алып» — салон семейной машины (без логотипов):
//      папа за рулём, дочка сзади пристёгнута, ремень поверх корпуса;
//   e) «чоң энесине жеткирип» — бабушка открывает дверь и встречает внучку;
//   f) «кайра кеңсеге кайтчу» — папа снова садится за рабочий стол.
// Дневные рабочие планы — прохладнее (голубой); дом бабушки — теплее.
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { LaptopFront } from "../props/Laptop";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { H, sitDown } from "./common";

export const routinePlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "routine");
  const cut = [0, T.word("N04", "апасы") - 3, T.word("N04", "түшкү") - 6, T.word("N04", "кызын") - 3, T.word("N04", "чоң") - 3, T.word("N04", "кайра") - 3, T.len];
  return { cut, len: T.len };
};

const FLOOR = 1560;

// ---------- Офис папы ----------
const OfficeBack: React.FC = () => (
  <div style={box({ left: -400, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2000, height: FLOOR + 300, backgroundColor: C.wallDay })} />
    {/* окно офиса */}
    <div style={box({ left: 1180, top: 840, width: 360, height: 470, backgroundColor: "#D3E4F3", border: `14px solid ${C.white}`, boxSizing: "border-box" })} />
    {/* чертёж здания на стене: фасад и размерная линия */}
    <div style={box({ left: 520, top: 860, width: 520, height: 380, backgroundColor: "#2F5E9E", border: "10px solid #E9EEF4", boxSizing: "border-box" })}>
      <svg width={500} height={360}>
        <g stroke="#E6F0FA" strokeWidth={3} fill="none">
          <rect x={90} y={80} width={300} height={220} />
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={110 + c * 70} y={100 + r * 62} width={40} height={36} />))}
          <path d="M 70 80 L 240 30 L 410 80" />
          <path d="M 90 320 L 390 320 M 90 312 L 90 328 M 390 312 L 390 328" strokeWidth={2} />
        </g>
      </svg>
    </div>
    <div style={box({ left: 0, top: FLOOR + 300, width: 2000, height: 900, backgroundColor: "#C6CFD8" })} />
  </div>
);
const Desk: React.FC<{ folderOpen: number }> = ({ folderOpen }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: 260, top: 1270, width: 600, height: 34, backgroundColor: "#E9EEF2", borderTop: "4px solid #CBD3DB" })} />
    <div style={box({ left: 280, top: 1304, width: 560, height: FLOOR - 1304, backgroundColor: "#8FA4BA" })} />
    {/* рабочая папка: открыта (белые листы) или закрыта (синяя обложка) */}
    <div style={box({ left: 640, top: 1252, width: 170 * (0.55 + 0.45 * folderOpen), height: 18, backgroundColor: folderOpen > 0.5 ? "#FFFFFF" : "#3D63C8", borderRadius: 3 })} />
  </div>
);

const DadOffice: React.FC<{ f: number; mode: "study" | "watch" | "return"; from: number }> = ({ f, mode, from }) => {
  const k = f - from;
  if (mode === "study") {
    const place: Place = { x: 420, y: FLOOR, h: H.dad };
    return (
      <Shot f={f} cam={{ x: 640, y: 1100, zoom: 1.35 }} bg={C.wallDay}>
        <OfficeBack />
        <Actor
          uid="o-dad"
          look="dadSuit"
          f={f}
          place={() => place}
          face={() => 0.7}
          pose={() => ({ expr: "thinking", lookY: -0.2, lookX: 0.4, armR: { target: { x: 600 + 10 * easeInOut(clamp(k / 30)), y: 1040 }, shape: "point", elbow: "down", behind: false }, armL: { target: null } })}
          role="father"
          seed={2}
        />
      </Shot>
    );
  }
  // за столом: смотрит на часы и закрывает папку / садится обратно и открывает
  const seated: Place = { x: 520, y: FLOOR, h: H.dad };
  const watchUp = mode === "watch" ? keys(k, [[2, 0], [10, 1], [20, 1], [27, 0]]) : 0;
  const closeK = mode === "watch" ? easeInOut(clamp((k - 28) / 9)) : 1 - easeInOut(clamp((k - 40) / 12));
  const s = mode === "return" ? sitDown(k, 4, 32) : { sit: 1, lean: 0 };
  return (
    <Shot f={f} cam={{ x: 560, y: 1080, zoom: 1.75 }} bg={C.wallDay}>
      <OfficeBack />
      <div style={box({ left: seated.x - 110, top: FLOOR - 560, width: 220, height: 330, backgroundColor: "#2B2F38", borderRadius: "36px 36px 10px 10px" })} />
      <Actor
        uid="o-dad"
        look="dadSuit"
        f={f}
        place={() => seated}
        face={() => 0.1}
        pose={() => ({
          sit: s.sit,
          seat: 216,
          lean: s.lean,
          expr: mode === "watch" && watchUp > 0.5 ? "thinking" : "calm",
          lookY: watchUp > 0.5 ? 0.45 : 0.5,
          lookX: watchUp > 0.5 ? 0.35 : 0.3,
          armR:
            watchUp > 0.01
              ? { target: { x: lerp(600, 560, watchUp), y: lerp(1262, 1130, watchUp) }, shape: "fist", elbow: "down", behind: false, wrist: -60 * watchUp }
              : { target: { x: 700, y: 1260 }, shape: "relax", elbow: "hang", behind: false },
          armL: { target: { x: 470, y: 1262 }, shape: "relax", elbow: "hang" },
        })}
        role="father"
        seed={2}
      />
      <LaptopFront x={410} y={1266} w={190} open={1} />
      <Desk folderOpen={1 - closeK} />
    </Shot>
  );
};

// ---------- Совещание мамы ----------
const MEET = [
  { uid: "w-col1", look: "colleagueW", x: 270, face: 0.4, nod: [20, 34], seed: 11 },
  { uid: "w-mom", look: "momWork", x: 540, face: 0, nod: [], seed: 5 },
  { uid: "w-col2", look: "colleagueM", x: 810, face: -0.4, nod: [30, 44], seed: 13 },
] as const;
const MT = 1250;
const MeetActor: React.FC<{ pp: (typeof MEET)[number]; f: number; k: number; layer: "body" | "arms" }> = ({ pp, f, k, layer }) => {
  const mom = pp.look === "momWork";
  return (
    <Actor
      uid={pp.uid}
      look={pp.look}
      f={f}
      place={() => ({ x: pp.x, y: 1520, h: mom ? H.mom : H.colleague })}
      face={() => (mom ? keys(k, [[0, -0.3], [30, 0.3]]) : pp.face)}
      pose={() => ({
        sit: 1,
        seat: 216,
        expr: mom ? "calm" : "softSmile",
        lookY: mom ? 0.35 : 0.2,
        nod: pp.nod.length ? keys(k, [[pp.nod[0], 0], [pp.nod[0] + 6, 6], [pp.nod[1], 0]]) : 0,
        armL: { target: { x: pp.x - 44, y: MT - 4 }, shape: "relax", elbow: "hang" },
        armR: mom ? { target: { x: pp.x + 70, y: MT - 14 }, shape: "point", elbow: "hang", behind: false } : { target: { x: pp.x + 44, y: MT - 4 }, shape: "relax", elbow: "hang", behind: false },
      })}
      role={mom ? "mother" : undefined}
      seed={pp.seed}
      layer={layer}
    />
  );
};
const Meeting: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const k = f - from;
  return (
    <Shot f={f} cam={{ x: 540, y: 1100, zoom: 1.6 }} bg={C.wallDay}>
      <div style={box({ left: -400, top: -300, width: 2000, height: 2200, backgroundColor: "#E1E9F1" })} />
      <div style={box({ left: 300, top: 760, width: 480, height: 260, backgroundColor: C.white, border: `8px solid ${C.navy}` })}>
        <div style={box({ left: 40, top: 40, width: 260, height: 18, backgroundColor: "#B9C7D6" })} />
        <div style={box({ left: 40, top: 90, width: 380, height: 18, backgroundColor: "#B9C7D6" })} />
        <div style={box({ left: 40, top: 140, width: 200, height: 70, backgroundColor: C.blue })} />
      </div>
      {MEET.map((pp) => (
        <div key={`ch-${pp.uid}`} style={box({ left: pp.x - 100, top: 960, width: 200, height: 330, backgroundColor: "#55627A", borderRadius: "30px 30px 8px 8px" })} />
      ))}
      {MEET.map((pp) => (
        <MeetActor key={pp.uid} pp={pp} f={f} k={k} layer="body" />
      ))}
      <div style={box({ left: 110, top: MT - 30, width: 860, height: 40, backgroundColor: "#F2F4F6" })} />
      <div style={box({ left: 110, top: MT + 10, width: 860, height: 50, backgroundColor: "#9AA8B8" })} />
      <Svg>
        {[300, 610, 780].map((x, i) => (
          <g key={x} transform={`translate(${x} ${MT - 18}) scale(1 0.3) rotate(${(i - 1) * 6})`}>
            <rect x={-60} y={-80} width={120} height={160} fill="#FFFFFF" stroke="#CBD3DB" strokeWidth={4} />
          </g>
        ))}
      </Svg>
      {MEET.map((pp) => (
        <MeetActor key={`${pp.uid}-a`} pp={pp} f={f} k={k} layer="arms" />
      ))}
    </Shot>
  );
};

// ---------- Салон машины ----------
const DAD_CAB: Place = { x: 830, y: 1980, h: 1180 };
const dadDriving = () => ({ sit: 1, seat: 780, expr: "calm" as const, armL: { target: { x: 664, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: -20 }, armR: { target: { x: 976, y: 1258 }, shape: "fist" as const, elbow: "down" as const, behind: false, wrist: 20 }, lookY: -0.05 });
const Cabin: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const pass = (f - from) * 1.2;
  const girl: Place = { x: 470, y: 1360, h: 800 };
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3B414D">
      <CabinBack />
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((((i * 260 - pass * 10) % 1300) + 1300) % 1300) - 200;
          return <div key={i} style={box({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
        })}
      </div>
      <Actor uid="cab-girl" look="girlSchool" f={f} place={() => girl} face={() => 0.2} pose={() => ({ sit: 1, seat: 330, packOff: true, expr: "calm", lookX: 0.3, armL: { target: { x: 430, y: 1030 }, elbow: "down" }, armR: { target: { x: 515, y: 1034 }, elbow: "down", behind: false } })} role="daughter" seed={4} blinkShift={37} />
      {/* ремень: от крепления у плеча через грудь к замку, поясная часть */}
      <Svg>
        <path d="M 392 790 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <path d="M 398 1034 L 548 1036" stroke="#1F2228" strokeWidth={18} strokeLinecap="round" />
        <rect x={536} y={1028} width={24} height={16} rx={4} fill="#9AA3B2" />
      </Svg>
      <div style={box({ left: 360, top: 1056, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
      <FrontSeats />
      <Actor uid="cab-dad" look="dadSuit" f={f} place={() => DAD_CAB} face={() => 0} pose={dadDriving} role="father" seed={2} layer="body" />
      <Svg>
        <path d="M 962 878 L 752 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
        <path d="M 962 878 L 752 1440" stroke="#3A3F4A" strokeWidth={9} strokeLinecap="round" />
      </Svg>
      <CabinFront pass={pass} wheel={0} />
      <Actor uid="cab-dad" look="dadSuit" f={f} place={() => DAD_CAB} face={() => 0} pose={dadDriving} role="father" seed={2} layer="arms" />
    </Shot>
  );
};

// ---------- Бабушка у двери ----------
const Grandma: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const k = f - from;
  const door = easeInOut(clamp(k / 14));
  const doorW = 300 * (1 - 0.82 * door); // створка поворачивается внутрь на петле справа
  const girlPlace = (t: number): Place => ({ x: lerp(400, 520, cruise(clamp((t - from - 6) / 56), 0.3)), y: 1560, h: H.girl });
  return (
    <Shot f={f} cam={{ x: 600, y: 1100, zoom: 1.5 }} bg="#F2E2C4">
      <div style={box({ left: -400, top: -300, width: 2000, height: 1860, backgroundColor: "#F1DDB8" })} />
      <div style={box({ left: -400, top: 1560, width: 2000, height: 700, backgroundColor: "#CDB894" })} />
      <div style={box({ left: 560, top: 760, width: 300, height: 800, backgroundColor: "#E9C894" })} />
      <div style={box({ left: 860 - doorW, top: 760, width: doorW, height: 800, backgroundColor: "#8A5A44" })} />
      <div style={box({ left: 544, top: 744, width: 332, height: 816, border: "16px solid #F7F1E6", borderBottom: "none", boxSizing: "border-box" })} />
      <Actor uid="gm" look="grandma" f={f} place={() => ({ x: 730, y: 1560, h: H.grandma })} face={() => -0.5} pose={() => ({ expr: "smile", lookY: 0.35, lookX: -0.3, armL: k > 46 ? { target: { x: 600, y: 1150 }, shape: "open", elbow: "down", behind: false } : { target: null }, armR: { target: null } })} seed={12} />
      <Actor uid="gm-girl" look="girlSchool" f={f} place={girlPlace} face={() => 0.6} pose={() => ({ expr: "softSmile", lookY: -0.2, lookX: 0.4, armL: { target: null }, armR: { target: null } })} role="daughter" seed={4} blinkShift={37} walkFrom={from} />
    </Shot>
  );
};

export const RoutineScene: React.FC = () => {
  const { f } = useScene("routine");
  const p = usePlan(routinePlan);
  const c = p.cut;
  if (f < c[1]) return <DadOffice f={f} mode="study" from={0} />;
  if (f < c[2]) return <Meeting f={f} from={c[1]} />;
  if (f < c[3]) return <DadOffice f={f} mode="watch" from={c[2]} />;
  if (f < c[4]) return <Cabin f={f} from={c[3]} />;
  if (f < c[5]) return <Grandma f={f} from={c[4]} />;
  return <DadOffice f={f} mode="return" from={c[5]} />;
};

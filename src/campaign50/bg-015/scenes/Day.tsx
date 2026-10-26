// Сцена 2: «тот же день» по шагам — каждый план снят одинаковым плавным
// проездом камеры вправо, сверху линия рабочего дня, где школьный отрезок
// подсвечен. 12:30 папа уходит из офиса раньше конца дня, 13:00 забирает
// сына у школы, 13:20 везёт домой (сын сзади пристёгнут), 14:00 снова
// открывает ноутбук; сын за столом рисует. Свет переходит в вечер (19:30).
// Диктор: «Кээде мектепке барып келүү жумуш күнүңүздү бөлүп, бүтпөгөн
// иштерди кечке калтырат.»
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, cruise, keys, keysV, lerp, type Vec } from "../../../two-schedules-2d/rig/motion";
import { CabinBack, CabinFront, FrontSeats } from "../../../two-schedules-2d/sets/CarViews";
import { ChairBack, HOME, HomeBack, LaptopSide, PaperOnTable, TableFront } from "../../../two-schedules-2d/sets/Home";
import { SchoolBack, SchoolFence } from "../../../two-schedules-2d/sets/School";
import { box, camMove, Shot, type Cam } from "../../../two-schedules-2d/shots";
import { H, onTable, placeAt, seated, seatOf } from "../../../two-schedules-2d/scenes/common";
import { useSceneInfo } from "../context";
import { BG15_TEXT } from "../script";
import { OFFICE, OfficeBack } from "../sets/Office";
import { Chip, DayLine, Dot } from "../ui";

const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Один и тот же проезд камеры для всех планов дня: вправо и чуть ближе.
const sameMove = (f: number, a: number, b: number, c: Cam): Cam =>
  camMove(f, a, b, { x: c.x - 45, y: c.y, zoom: c.zoom }, { x: c.x + 45, y: c.y, zoom: c.zoom * 1.06 }, (x) => x);

// Границы планов (кадры сцены).
export const dayCuts = (dur: number) => {
  const q = Math.round(dur / 4);
  return [0, q, 2 * q, 3 * q, dur] as const;
};

export const DayScene: React.FC = () => {
  const { f, dur } = useSceneInfo("day");
  const [a0, a1, a2, a3, a4] = dayCuts(dur);
  const q = a1 - a0;

  // ---------- 12:30, офис ----------
  const O_DAD = (t: number) => walk(t, 8, q - 6, { x: 510, y: OFFICE.floorY + 30 }, { x: 1010, y: OFFICE.floorY + 50 }, H.dad, 0.3);
  const oDadPose = (t: number): PoseIn => {
    const p = O_DAD(t);
    return {
      expr: "thinking",
      lookY: keys(t, [[0, 0.35], [q * 0.55, 0.35], [q * 0.7, 0]]),
      armL: { target: keysV(t, [[0, { x: p.x + 0.02 * p.h, y: p.y - 0.62 * p.h }], [q * 0.55, { x: p.x + 0.02 * p.h, y: p.y - 0.62 * p.h }], [q * 0.72, { x: p.x - 0.06 * p.h, y: p.y - 0.4 * p.h }]]), shape: "relax", elbow: "down", behind: false },
      armR: { target: { x: p.x + 0.11 * p.h, y: p.y - 0.4 * p.h }, shape: "fist", item: "handbag", itemColor: "#3B2E28", elbow: "down" },
    };
  };

  // ---------- 13:00, школа ----------
  const b = (t: number) => t - a1;
  const S_SON = (t: number) => walk(b(t), 4, q - 10, { x: 600, y: 1560 }, { x: 860, y: 1700 }, H.son, 0.3);
  const S_DAD = placeAt(1060, 1850, H.dad);
  const sDadPose = (t: number): PoseIn => ({
    expr: "softSmile",
    armR: { target: keysV(b(t), [[0, { x: S_DAD.x - 0.08 * S_DAD.h, y: S_DAD.y - 0.42 * S_DAD.h }], [q - 26, { x: S_DAD.x - 0.08 * S_DAD.h, y: S_DAD.y - 0.42 * S_DAD.h }], [q - 8, { x: S_DAD.x - 0.3 * S_DAD.h, y: S_DAD.y - 0.55 * S_DAD.h }]], anticipate), shape: "open", elbow: "down", behind: false },
  });

  // ---------- 13:20, в машине ----------
  const c = (t: number) => t - a2;
  const dadDrive: Place = { x: 830, y: 1980, h: 1180 };
  const sonBack: Place = { x: 520, y: 1330, h: 610 };
  const pass = c(f) * 2.2;
  const cDadPose = (): PoseIn => ({ expr: "thinking", sit: 1, seat: 780, armL: { target: { x: 660, y: 1258 }, shape: "fist", elbow: "down" }, armR: { target: { x: 982, y: 1258 }, shape: "fist", elbow: "down" } });
  const cSonPose = (t: number): PoseIn => ({
    expr: "calm",
    sit: 1,
    seat: 300,
    packOff: true,
    headTilt: keys(c(t), [[0, 0], [q, 4]]),
    armL: { target: { x: 470, y: 1110 }, shape: "relax" },
    armR: { target: { x: 575, y: 1112 }, shape: "relax" },
  });

  // ---------- 14:00 → вечер, дома ----------
  const d = (t: number) => t - a3;
  const dLen = a4 - a3;
  const hDad = seated("dad", HOME.seat.mom);
  const hSon = seated("son", HOME.seat.son);
  const eve = keys(d(f), [[dLen * 0.45, 0], [dLen * 0.95, 1]]);
  const hDadPose = (t: number): PoseIn => ({
    expr: d(t) < dLen * 0.5 ? "thinking" : "tired",
    sit: 1,
    seat: seatOf(hDad),
    lookY: 0.35,
    armR: { target: keysV(d(t), [[0, onTable(hDad.x + 0.14 * hDad.h, -4)], [6, onTable(HOME.laptop.x - 20, -40)], [20, onTable(HOME.laptop.x - 30, -4)]], anticipate), shape: "relax", elbow: "down", behind: false },
    armL: { target: onTable(hDad.x - 0.12 * hDad.h, -4), shape: "relax", elbow: "down" },
  });
  const hSonPose = (t: number): PoseIn => ({
    expr: "calm",
    sit: 1,
    seat: seatOf(hSon),
    packOff: true,
    lookY: 0.6,
    armR: { target: onTable(hSon.x + 0.16 * hSon.h + Math.sin(t / 5) * 7, -4), shape: "pinch", item: "pencil", itemColor: "#3E7CC0", elbow: "down", behind: false },
    armL: { target: onTable(HOME.table.x + 30, -2), shape: "open", elbow: "down" },
  });

  const times = BG15_TEXT.dayTimes;
  const labels = BG15_TEXT.dayLabels;
  const hourAt = keys(f, [[a0, 12.5], [a1, 13], [a2, 13.33], [a3, 14], [a3 + dLen * 0.45, 14.5], [a4, 19.5]], (x) => x);
  const idx = f < a1 ? 0 : f < a2 ? 1 : f < a3 ? 2 : 3;
  const late = d(f) > dLen * 0.7;
  const overlay = (
    <>
      <DayLine f={f} progress={(hourAt - 9) / 10} show={f / 10} />
      <Chip f={f} at={idx === 0 ? 4 : -100}>
        <Dot /> {late ? BG15_TEXT.evening : times[idx]} • {late ? "Иш дагы бүтө элек" : labels[idx]}
      </Chip>
    </>
  );
  return (
    <>
      <Shot f={f} from={a0} to={a1} cam={sameMove(f, a0, a1, { x: 760, y: 1300, zoom: 1.0 })} overlay={overlay}>
        <OfficeBack doorOpen={keys(f, [[0, 0.2], [8, 1], [q - 10, 1], [q, 0.4]])} />
        <Actor uid="d-o-dad" look="dad" f={f} place={O_DAD} face={() => 0.6} pose={oDadPose} seed={2} walkFrom={0} />
      </Shot>
      <Shot f={f} from={a1} to={a2} cam={sameMove(f, a1, a2, { x: 820, y: 1430, zoom: 0.98 })} overlay={overlay}>
        <SchoolBack minutes={13 * 60} />
        <Actor uid="d-s-son" look="son" f={f} place={S_SON} face={() => 0.5} pose={() => ({ expr: "smile" })} seed={4} walkFrom={a1} />
        <SchoolFence />
        <Actor uid="d-s-dad" look="dad" f={f} place={() => S_DAD} face={() => -0.5} pose={sDadPose} seed={2} />
      </Shot>
      <Shot f={f} from={a2} to={a3} cam={sameMove(f, a2, a3, { x: 560, y: 1000, zoom: 1.02 })} overlay={overlay}>
        <CabinBack />
        <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = i * 260 - pass * 10;
            return <div key={i} style={box({ left: (((x % 1300) + 1300) % 1300) - 200, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#E3D3C1", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
          })}
        </div>
        <Actor uid="d-c-son" look="son" f={f} place={() => sonBack} face={() => -0.5} pose={cSonPose} seed={4} />
        <SeatBelt />
        <div style={box({ left: 370, top: 1120, width: 340, height: 220, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
        <FrontSeats />
        <Actor uid="d-c-dad" look="dad" f={f} place={() => dadDrive} face={() => 0} pose={cDadPose} seed={2} />
        <CabinFront pass={pass} wheel={Math.sin(f * 0.05) * 3} />
      </Shot>
      <Shot f={f} from={a3} to={a4} cam={sameMove(f, a3, a4, { x: 900, y: 1120, zoom: 1.32 })} overlay={overlay} bg="#3B3149">
        <HomeBack minutes={14 * 60 + Math.round((hourAt - 14) * 60)} evening={eve > 0.5 ? 1 : 0} f={f} />
        <ChairBack x={hSon.x} evening={eve > 0.5 ? 1 : 0} />
        <ChairBack x={hDad.x} evening={eve > 0.5 ? 1 : 0} />
        <Actor uid="d-h-son" look="son" f={f} place={() => hSon} face={() => 0.3} pose={hSonPose} seed={4} layer="body" />
        <Actor uid="d-h-dad" look="dad" f={f} place={() => hDad} face={() => 0.4} pose={hDadPose} seed={2} layer="body" />
        <TableFront evening={eve > 0.5 ? 1 : 0} />
        <PaperOnTable x={hSon.x + 90} y={HOME.table.top + 14} rot={-4} />
        <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={keys(d(f), [[2, 0], [18, 1]])} />
        <Actor uid="d-h-son" look="son" f={f} place={() => hSon} face={() => 0.3} pose={hSonPose} seed={4} layer="arms" />
        <Actor uid="d-h-dad" look="dad" f={f} place={() => hDad} face={() => 0.4} pose={hDadPose} seed={2} layer="arms" />
        <div style={box({ left: -400, top: -400, width: 3000, height: 3000, backgroundColor: "rgba(40,30,80,1)", opacity: eve * 0.22, pointerEvents: "none" })} />
      </Shot>
    </>
  );
};

// Ремень безопасности сына на заднем сиденье: плечевая лямка и поясная.
export const SeatBelt: React.FC = () => (
  <svg width={1080} height={1920} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
    <path d="M 452 930 L 612 1120" stroke="#2A2E36" strokeWidth={22} strokeLinecap="round" />
    <path d="M 452 930 L 612 1120" stroke="#3B404A" strokeWidth={14} strokeLinecap="round" />
    <path d="M 450 1122 Q 530 1134 612 1120" stroke="#2A2E36" strokeWidth={20} fill="none" strokeLinecap="round" />
    <rect x={598} y={1104} width={34} height={30} rx={6} fill="#9AA1AC" />
  </svg>
);

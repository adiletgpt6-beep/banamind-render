// Сцена 4. Дни приходится менять (N03). Три связанных действия, каждое
// успевает прочитаться:
// A. Мама в своём офисе за ноутбуком (мы видим крышку — экран повернут к
//    ней), пальцы на клавиатуре; рядом настольный календарь.
// B. Вечером родители сравнивают рабочие записи: палец мамы на дне
//    «Шаршемби», рука папы переносит карточку встречи в свободное время.
// C. В другой день папа раньше закрывает рабочую папку и смотрит на часы.
// D. Мама в офисе видит совпадение: «13:00 · Сабак бүтөт» и
//    «13:00 · Жолугушуу» в одной клетке. Небольшая пауза и взгляд — без
//    красных тревожных значков.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { TE2_TEXT } from "../script";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C } from "../theme";
import { CloseHand, SKIN } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { cellAt, PLAN, Planner } from "../props/Planner";
import { OFFICE, OfficeBack, OfficeDesk } from "../sets/Office";
import { Act, type ActorSpec } from "./room";
import { H, seatOf } from "./common";

export const daysPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "days");
  const L = T.len;
  const cut = [Math.round(L * 0.27), Math.round(L * 0.56), Math.round(L * 0.73), Math.round(L * 0.9)];
  return { cut, len: L, drag: [cut[0] + 30, cut[0] + 62] as const, close: [cut[1] + 10, cut[1] + 30] as const };
};
type P = ReturnType<typeof daysPlan>;

const SEATED = (x: number, h: number) => ({ x, y: OFFICE.floor, h });
const MOM = SEATED(540, H.mom);
const DAD = SEATED(540, H.dad);

const momAtLaptop = (p: P, notice = false): ActorSpec => ({
  uid: "d-mom",
  look: "momWork",
  place: () => MOM,
  face: () => (notice ? 0.25 : 0.3),
  pose: (t) => {
    const tap = Math.sin(t * 0.9) * 4;
    return {
      sit: 1,
      seat: seatOf(H.mom),
      lean: 8,
      expr: notice ? { browIn: 6, browOut: 0, lid: 0.18, smile: -0.05 } : "calm",
      lookY: notice ? 0.15 : 0.55,
      nod: notice ? 2 : 6,
      armL: { target: { x: 470, y: OFFICE.desk.top - 6 + tap }, shape: "relax", elbow: "down" },
      armR: { target: { x: 650, y: OFFICE.desk.top - 6 - tap }, shape: "relax", elbow: "down" },
    };
  },
  seed: 41,
});

// A, D: мама в офисе
const MomOffice: React.FC<{ f: number; p: P; notice?: boolean; cam: { x: number; y: number; zoom: number } }> = ({ f, p, notice = false, cam }) => {
  const mom = momAtLaptop(p, notice);
  return (
    <Shot f={f} cam={cam} bg="#E8EEE6">
      <OfficeBack tone="mom" />
      <Act s={mom} f={f} layer="body" />
      <OfficeDesk monitor={false}>
        {/* настольный календарь-«домик» */}
        <div style={box({ left: 260, top: OFFICE.desk.top - 120, width: 150, height: 120, backgroundColor: "#FFFDF7", borderRadius: 6, boxShadow: "0 4px 8px rgba(40,40,60,0.18)" })}>
          <div style={box({ left: 0, top: 0, width: 150, height: 30, backgroundColor: C.blue, borderRadius: "6px 6px 0 0" })} />
          {[0, 1, 2].map((r) => (
            <div key={r} style={box({ left: 14, top: 44 + r * 24, width: 122, height: 10, borderRadius: 5, backgroundColor: r === 1 ? C.coral : "#C9D3DE" })} />
          ))}
        </div>
      </OfficeDesk>
      <Act s={mom} f={f} layer="arms" />
      <LaptopFront x={690} y={OFFICE.desk.top + 4} w={210} open={1} />
    </Shot>
  );
};

// C: папа закрывает рабочую папку раньше и смотрит на часы
const DadFolder: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.close[0]) / (p.close[1] - p.close[0])));
  const watch = easeInOut(clamp((f - p.close[1] - 6) / 12));
  const fx = 470;
  const fy = OFFICE.desk.top - 6;
  // обложка папки поворачивается вокруг корешка (слева) — ширина проекции
  const coverW = 150 * Math.cos(Math.PI * (1 - k));
  const dad: ActorSpec = {
    uid: "d-dad",
    look: "dad",
    place: () => DAD,
    face: () => (watch > 0.5 ? 0.25 : -0.1),
    pose: () => ({
      sit: 1,
      seat: seatOf(H.dad),
      lean: 6,
      expr: "calm",
      lookY: watch > 0.5 ? 0.4 : 0.6,
      nod: 5,
      armL: { target: { x: lerp(fx + 140, fx - 40, k), y: fy - 4 - Math.sin(Math.PI * k) * 40 }, shape: "open", elbow: "down", behind: false },
      armR: { target: { x: lerp(640, 600, watch), y: lerp(fy, fy - 170, watch) }, shape: "relax", elbow: "down", wrist: lerp(0, -60, watch) },
    }),
    seed: 21,
  };
  return (
    <Shot f={f} cam={{ x: 560, y: 1080, zoom: 1.9 }} bg={C.blueDay}>
      <OfficeBack tone="dad" />
      <Act s={dad} f={f} layer="body" />
      <OfficeDesk monitor>
        <Svg>
          <rect x={fx - 150} y={fy - 8} width={150} height={14} rx={3} fill="#3E6FA8" />
          <rect x={fx} y={fy - 8} width={150} height={14} rx={3} fill="#DCE7F3" />
          <rect x={Math.min(fx, fx + coverW)} y={fy - 14} width={Math.abs(coverW)} height={12} rx={3} fill={coverW < 0 ? "#5B8DD6" : "#4A7FC4"} />
        </Svg>
      </OfficeDesk>
      <Act s={dad} f={f} layer="arms" />
    </Shot>
  );
};

// B: вечером — два рабочих листа, перенос карточки встречи
const Compare: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.drag[0]) / (p.drag[1] - p.drag[0])));
  const dy = k * PLAN.rowH;
  const X = 90;
  const Y = 520;
  const card = cellAt(2, 2);
  const sc = (q: { x: number; y: number }) => ({ x: X - 40 + q.x * 1.12, y: Y - 60 + q.y * 1.12 });
  const grab = sc({ x: card.x + PLAN.colW / 2, y: card.y + PLAN.rowH / 2 + dy });
  const point = sc({ x: cellAt(2, 0).x + PLAN.colW / 2, y: 92 });
  return (
    <AbsoluteFill style={{ backgroundColor: "#D8B88E" }}>
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(255,214,140,0.5), rgba(0,0,0,0) 70%)" })} />
      <div style={box({ left: X - 40, top: Y - 60, transform: "scale(1.12)", transformOrigin: "0 0" })}>
        <Planner
          title={TE2_TEXT.calendar.dad}
          dayHi={f > p.drag[0] - 20 ? 2 : -1}
          cards={[
            { day: 0, hour: 0, text: "Пландоо", color: "#7C8BA3" },
            { day: 2, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue, dy, hi: k > 0 && k < 1 ? 1 : 0 },
            { day: 3, hour: 1, text: "Кеңешме", color: "#7C8BA3" },
            { day: 4, hour: 3, text: "Кеңешме", color: "#7C8BA3" },
          ]}
        />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* мама показывает день, папа переносит карточку */}
        <CloseHand x={point.x - 160} y={point.y - 120} angle={-125} size={220} {...SKIN.mom} shape="point" mirror armLen={5} />
        <CloseHand x={grab.x + 40} y={grab.y + 220} angle={190} size={230} {...SKIN.dadHome} shape={k > 0 && k < 1 ? "pinch" : "open"} armLen={6} />
      </svg>
    </AbsoluteFill>
  );
};

// D: совпадение в одной клетке
const Clash: React.FC<{ f: number; from: number }> = ({ f, from }) => {
  const hi = clamp((f - from - 8) / 10);
  return (
    <AbsoluteFill style={{ backgroundColor: "#E8EEE6" }}>
      <div style={box({ left: 50, top: 380, transform: "scale(1.12)", transformOrigin: "0 0" })}>
        <Planner
          title={TE2_TEXT.calendar.mom}
          tint={C.green}
          dayHi={3}
          cards={[
            { day: 0, hour: 1, text: "Эсеп", color: "#7C8BA3" },
            { day: 3, hour: 2, text: TE2_TEXT.days.lessonEnd, color: C.green, dy: -14, hi },
            { day: 3, hour: 2, text: TE2_TEXT.days.meeting, color: C.blue, dx: 12, dy: 34, hi },
            { day: 1, hour: 3, text: "Кеңешме", color: "#7C8BA3" },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const DaysScene: React.FC = () => {
  const { f } = useScene("days");
  const p = usePlan(daysPlan);
  if (f < p.cut[0]) return <MomOffice f={f} p={p} cam={{ x: 560, y: 1060, zoom: keys(f, [[0, 1.75], [p.cut[0], 1.85]]) }} />;
  if (f < p.cut[1]) return <Compare f={f} p={p} />;
  if (f < p.cut[2]) return <DadFolder f={f} p={p} />;
  if (f < p.cut[3]) return <Clash f={f} from={p.cut[2]} />;
  return <MomOffice f={f} p={p} notice cam={{ x: 545, y: 900, zoom: 2.6 }} />;
};

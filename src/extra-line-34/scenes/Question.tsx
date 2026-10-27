// Сцена 9 «question» (M01, C03). Мама в кресле смотрит на список в
// телефоне (вставка: экран — пункты объявления и янтарный пункт о
// вождении), поднимает глаза — небольшая пауза — «А сиз машина
// айдайсызбы?» Воспитатель спокойно: «Жок. Балдар менен тажрыйбам көп,
// бирок машина айдабайм.» Мама задумчиво опускает взгляд к телефону.
// Без затемнений и тревожных звуков: практическое несовпадение требований.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeOut, keys } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { OpenBook } from "../props/Book";
import { BunnyProp } from "../props/Bunny";
import { PhoneAdList, PhoneFrame, phoneHeight } from "../props/Phone";
import { LIVING } from "../sets/Living";
import { H, seatedAt } from "./common";
import { TODDLER_AT_KNEE } from "./Toy";
import { holdOpenBook, LAP_OPEN, SON_SEAT } from "./Reading";
import { Room } from "./Room";

const L = LIVING;
const PENSIVE = { browIn: 2, browOut: 1, lid: 0.3, smile: 0.12 } as const;

export const questionPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "question");
  const m01 = { a: T.from("M01"), b: T.to("M01") };
  const c03 = { a: T.from("C03"), b: T.to("C03") };
  const ins0 = 22; // мама опускает взгляд к телефону → экран телефона
  const ins1 = Math.max(ins0 + 30, m01.a - 8);
  const lookUp = ins1 + 2;
  const toCg = m01.b + 8;
  const back = c03.b + 6;
  return { m01, c03, ins0, ins1, lookUp, toCg, back, len: T.len, no: T.word("C03", "Жок") };
};

export const QuestionScene: React.FC = () => {
  const { f, tl } = useScene("question");
  const P = questionPlan(tl);
  const cg = seatedAt("caregiver", L.sofa.seats[0]);
  const son = seatedAt("son", SON_SEAT);
  const dad = seatedAt("dad", L.sofa.seats[2]);
  const mom = seatedAt("mom", L.armchair.seatX);
  const td = { x: TODDLER_AT_KNEE.x, y: TODDLER_AT_KNEE.y, h: H.toddler };
  const lap = (p: { x: number; y: number; h: number }, side: -1 | 1) => ({ x: p.x + side * 0.07 * p.h, y: p.y - 0.27 * p.h - 8 });
  const phone = { x: mom.x + 34, y: mom.y - 0.47 * mom.h };
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.armchair.seat,
    // после ответа — задумчиво (веки ниже, брови спокойные), без хмурости
    expr: t < P.lookUp ? "calm" : t < P.c03.b ? "neutral" : PENSIVE,
    lookY: keys(t, [[0, 0.62], [P.lookUp, 0.62], [P.lookUp + 8, 0.02], [P.back, 0.02], [P.back + 16, 0.55]]),
    nod: keys(t, [[P.c03.b - 6, 0], [P.c03.b + 4, 4], [P.c03.b + 16, 2]]),
    headTilt: keys(t, [[P.m01.a, 0], [P.m01.a + 8, -3], [P.m01.b + 10, 0]]),
    armL: { target: lap(mom, -1), shape: "relax", elbow: "down" },
    armR: { target: { x: phone.x, y: phone.y + keys(t, [[P.lookUp, 0], [P.lookUp + 10, 26], [P.back, 26], [P.back + 12, 10]]) }, shape: "phone", elbow: "hang", item: "phone", glow: 1, itemTilt: -8, itemScale: 1.2, behind: false },
  });
  // взгляд опускается к телефону с объявлением (он справа, в её руке)
  const momFace = (t: number) => keys(t, [[0, -0.15], [P.lookUp, -0.15], [P.lookUp + 8, -0.62], [P.back, -0.62], [P.back + 14, 0.12]]);
  const cgPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.sofa.seat,
    expr: t < P.c03.a ? "softSmile" : "calm",
    lookY: keys(t, [[0, 0.3], [P.m01.a - 4, 0.3], [P.m01.a + 6, 0]]),
    // спокойное «жок» — лёгкое покачивание головой
    headTilt: keys(t, [[P.no, 0], [P.no + 5, 3], [P.no + 10, -3], [P.no + 15, 0]]),
    nod: keys(t, [[P.c03.b - 12, 0], [P.c03.b - 4, 4], [P.c03.b + 8, 0]]),
    ...holdOpenBook(null),
  });
  const cgFace = (t: number) => keys(t, [[0, 0.45], [P.m01.a - 4, 0.45], [P.m01.a + 8, 0.8]]);
  const book = (
    <>
      <Svg>
        <OpenBook x={LAP_OPEN.x} y={LAP_OPEN.y} w={LAP_OPEN.w} spread={1} />
      </Svg>
      <BunnyProp x={LAP_OPEN.x + 92} y={LAP_OPEN.y + 8} s={0.95} rot={6} />
    </>
  );
  const care = (layer: "body" | "arms") => <Actor uid="s9-cg" look="caregiver" f={f} place={() => cg} face={cgFace} pose={cgPose} role="caregiver" seed={3} layer={layer} />;
  const seated = (
    <>
      {care("body")}
      <Actor uid="s9-son" look="son" f={f} place={() => son} face={(t) => keys(t, [[0, -0.5], [P.m01.a, -0.5], [P.m01.a + 10, 0.5], [P.c03.a + 6, -0.4]])} pose={() => ({ sit: 1, seat: L.sofa.seat, expr: "calm", legSwing: Math.sin(f / 12) * 0.3, armL: { target: lap(son, -1), shape: "relax", elbow: "down" }, armR: { target: lap(son, 1), shape: "relax", elbow: "down" } })} seed={4} />
      {book}
      {care("arms")}
      <Actor uid="s9-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[0, -0.45], [P.m01.a, -0.45], [P.m01.a + 10, 0.55], [P.c03.a + 6, -0.5]])} pose={() => ({ sit: 1, seat: L.sofa.seat, expr: "calm", armL: { target: lap(dad, -1), shape: "relax", elbow: "down" }, armR: { target: lap(dad, 1), shape: "relax", elbow: "down" } })} seed={2} />
      <Actor uid="s9-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} />
    </>
  );
  const front = <Actor uid="s9-td" look="toddler" f={f} place={() => td} face={() => -0.3} pose={() => ({ expr: "smile", lookY: -0.2, armL: { target: { x: td.x - 30, y: L.sofa.seatY + 82 }, shape: "open", elbow: "down" }, armR: { target: { x: td.x + 24, y: L.sofa.seatY + 86 }, shape: "open", elbow: "down" } })} seed={5} />;
  const world = <Room bag cushion={{ x: cg.x + 70, y: L.sofa.seatY - 128, rot: 12 }} seated={seated} front={front} />;
  const camMom = { x: 2250, y: 1165, zoom: 2.35 };
  const pw = 860;
  const insT = clamp((f - P.ins0) / 8);
  return (
    <>
      <Shot f={f} from={0} to={P.ins0 + 6} cam={camMom}>
        {world}
      </Shot>
      {f >= P.ins0 && f < P.ins1 ? (
        <div style={box({ inset: 0, opacity: clamp((f - P.ins0) / 5) })}>
          <div style={box({ inset: 0, filter: "blur(10px)" })}>
            <Shot f={f} cam={camMom}>
              {world}
            </Shot>
          </div>
          <div style={box({ inset: 0, backgroundColor: "rgba(247,245,239,0.35)" })} />
          <PhoneFrame w={pw} x={(1080 - pw) / 2} y={90 + (1 - easeOut(insT)) * 60} screen={<PhoneAdList highlight={1} />} style={{ opacity: insT }} />
          <div style={box({ left: 0, top: 90 + phoneHeight(pw) - 300, width: 1080, height: 300, background: "linear-gradient(180deg, rgba(247,245,239,0), rgba(247,245,239,0.0))" })} />
        </div>
      ) : null}
      <Shot f={f} from={P.ins1} to={P.toCg} cam={camMove(f, P.ins1, P.toCg, camMom, { ...camMom, zoom: 2.42 })}>
        {world}
      </Shot>
      <Shot f={f} from={P.toCg} to={P.back} cam={camMove(f, P.toCg, P.back, { x: 1530, y: 1245, zoom: 1.85 }, { x: 1530, y: 1240, zoom: 1.92 })}>
        {world}
      </Shot>
      <Shot f={f} from={P.back} to={P.len + 1} cam={camMove(f, P.back, P.len, { ...camMom, zoom: 2.42 }, { ...camMom, zoom: 2.5 })}>
        {world}
      </Shot>
    </>
  );
};

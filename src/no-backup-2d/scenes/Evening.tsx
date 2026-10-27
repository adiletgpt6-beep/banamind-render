// Вечерние сцены в гостиной.
//   Дочка кладёт тетрадь в рюкзак, поворачивается к маме и спрашивает,
//   пойдёт ли завтра в школу. Мама поворачивается к ней, отвечает и мягко
//   касается волос; дочка успокаивается. Родители переглядываются.
//   Решение: папа берёт телефон и показывает маме BalaGo; на крупной
//   вставке — тот же экран, что в его руке. Мама задаёт вопрос, папа
//   отвечает, мама заполняет предварительную заявку и отправляет её.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useCueFrames } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { bodyPoints, wristForGrip } from "../rig/body";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, easeInOut, keys, keysV, type Vec } from "../rig/motion";
import { BalaGoPage, FORM, HoldingHand, PhoneFrame, RegForm, TouchFinger } from "../screens";
import { CoffeeTable, LIVING, LivingRoom, PackFront, WarmLight } from "../sets/LivingRoom";
import { box, camMove, Shot } from "../shots";

const DAD_SOFA: Place = { x: 540, y: 1700, h: 760 };
const MOM_SOFA: Place = { x: 890, y: 1700, h: 740 };
const GIRL_EVE: Place = { x: 1105, y: 1790, h: 540 };
const SEAT = 1700 - 1420;

const restSit = (p: Place, side: -1 | 1) => ({ x: p.x + side * 0.1 * p.h, y: p.y - 0.33 * p.h });

export const EveningScene: React.FC = () => {
  const f = useCurrentFrame();
  const ask = useCueFrames("d02");
  const answer = useCueFrames("m04");
  // дочка: тетрадь в руке → через горловину в рюкзак (рука уходит за
  // переднюю стенку рюкзака, там тетрадь и остаётся)
  const drop = 30;
  const hold = { x: GIRL_EVE.x - 0.08 * GIRL_EVE.h, y: GIRL_EVE.y - 0.42 * GIRL_EVE.h };
  const over = { x: LIVING.pack.x + 40, y: LIVING.pack.y - 175 };
  const packIn = { x: LIVING.pack.x + 20, y: LIVING.pack.y - 80 };
  const turn = ask.from - 14; // поворачивается к маме до вопроса
  const touch = answer.to + 4; // касание волос после ответа
  const girlFace = (t: number) => keys(t, [[0, -0.7], [turn, -0.7], [turn + 10, -0.85]]);
  const girlPose = (t: number): PoseIn => ({
    expr: t < turn ? "calm" : t < answer.from + 8 ? "worried" : t < touch + 6 ? "softSmile" : "smile",
    packOff: true,
    lean: keys(t, [[0, 8], [drop + 6, 8], [turn, 0]]),
    armL: {
      target: keysV(t, [[0, hold], [8, over], [22, packIn], [drop + 2, packIn], [drop + 16, hold]], easeInOut),
      shape: t < drop ? "fist" : "relax",
      item: t < drop ? "notebook" : "none",
      itemTilt: -10,
    },
    armR: { target: { x: GIRL_EVE.x + 0.08 * GIRL_EVE.h, y: GIRL_EVE.y - 0.4 * GIRL_EVE.h }, shape: "relax" },
    lookY: keys(t, [[0, 0.6], [turn, 0.6], [turn + 10, -0.25], [touch + 30, -0.25], [touch + 44, 0]]),
    headTilt: keys(t, [[ask.from, 0], [ask.from + 10, -5], [answer.to, -5], [touch + 4, -2], [touch + 26, 3], [touch + 50, 0]]),
    nod: keys(t, [[touch + 26, 0], [touch + 34, 4], [touch + 44, 0]]),
  });
  // мама: после звонков смотрит вниз, на телефон; на вопрос поднимает
  // глаза, поворачивается к дочке, отвечает и касается волос
  const momFace = (t: number) => keys(t, [[0, 0.1], [ask.from + 6, 0.1], [ask.from + 18, 0.6], [touch + 40, 0.6], [touch + 54, -0.5], [touch + 76, -0.5]]);
  const head = bodyPoints(LOOKS.girl.build, GIRL_EVE, { turn: -0.85 * 0.8 }).head;
  const hairTouch = wristForGrip(LOOKS.mom.build, MOM_SOFA, { turn: 0.6 * 0.8, seat: SEAT }, 1, { x: head.x - 8, y: head.y - 0.95 * 0.102 * GIRL_EVE.h }, "down");
  const momPose = (t: number): PoseIn => ({
    expr: t < ask.from ? "thinking" : t < answer.from - 4 ? "worried" : t < touch + 40 ? "softSmile" : "calm",
    sit: 1,
    seat: SEAT,
    armL: {
      target: keysV(t, [[0, { x: 845, y: 1290 }], [ask.from + 4, { x: 845, y: 1290 }], [ask.from + 22, { x: LIVING.phone.x + 30, y: LIVING.phone.y - 22 }], [ask.from + 26, { x: LIVING.phone.x + 30, y: LIVING.phone.y - 22 }], [ask.from + 40, restSit(MOM_SOFA, -1)]], easeInOut),
      shape: t < ask.from + 22 ? "phone" : "relax",
      item: t < ask.from + 22 ? "phone" : "none",
      flat: keys(t, [[ask.from + 4, 0], [ask.from + 22, 1]]), itemTilt: keys(t, [[ask.from + 4, -6], [ask.from + 22, 0]]), glow: keys(t, [[ask.from + 6, 0.8], [ask.from + 18, 0]]), elbow: "down", behind: false,
    },
    // ладонь ложится на волосы сверху сбоку, без прохода через голову
    armR: {
      target: keysV(t, [[0, restSit(MOM_SOFA, 1)], [touch - 10, restSit(MOM_SOFA, 1)], [touch + 6, hairTouch], [touch + 14, { x: hairTouch.x + 4, y: hairTouch.y + 6 }], [touch + 22, hairTouch], [touch + 40, restSit(MOM_SOFA, 1)]], anticipate),
      shape: t > touch - 6 && t < touch + 30 ? "open" : "relax", elbow: "down", behind: false,
    },
    lean: keys(t, [[touch - 10, 0], [touch + 4, 8], [touch + 24, 8], [touch + 40, 0]]),
    nod: keys(t, [[answer.from + 2, 0], [answer.from + 10, 3], [answer.from + 22, 0]]),
    lookY: keys(t, [[0, 0.55], [ask.from + 6, 0.55], [ask.from + 14, 0.05]]),
    headTilt: keys(t, [[answer.from, 0], [answer.from + 14, 4], [touch + 30, 4], [touch + 44, 0]]),
  });
  const dadPose = (t: number): PoseIn => ({
    expr: t < touch + 40 ? "calm" : "softSmile",
    sit: 1,
    seat: SEAT,
    armL: { target: restSit(DAD_SOFA, -1), shape: "relax" },
    armR: { target: restSit(DAD_SOFA, 1), shape: "relax" },
    nod: keys(t, [[touch + 56, 0], [touch + 64, 4], [touch + 74, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[0, 0.5], [touch + 40, 0.5], [touch + 52, 0.7]]);
  const momArgs = { uid: "e6-mom", look: "mom" as const, f, place: () => MOM_SOFA, face: momFace, role: "mother" as const, seed: 1 };
  const world = (
    <>
      <LivingRoom phoneOnTable={f >= ask.from + 22} />
      <Actor uid="e6-dad" look="dad" f={f} place={() => DAD_SOFA} face={dadFace} pose={dadPose} role="father" seed={2} />
      <Actor {...momArgs} pose={(t) => ({ ...momPose(t), hideArm: "R" })} />
      <CoffeeTable />
      <Actor uid="e6-girl" look="girl" f={f} place={() => GIRL_EVE} face={girlFace} pose={girlPose} role="daughter" seed={3} />
      {/* рука мамы поверх дочки: касается волос, а не уходит за голову */}
      <Actor {...momArgs} uid="e6-mom-arm" pose={(t) => ({ ...momPose(t), armOnly: "R" })} />
      <PackFront />
      <WarmLight />
    </>
  );
  const A = turn - 4;
  const B = answer.from - 10;
  const C = touch + 46;
  return (
    <>
      {/* тетрадь в рюкзак */}
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 1010, y: 1380, zoom: 1.55 }, { x: 1016, y: 1384, zoom: 1.6 })}>{world}</Shot>
      {/* дочка смотрит на маму и спрашивает */}
      <Shot f={f} from={A} to={B} cam={camMove(f, A, B, { x: 1070, y: 1260, zoom: 1.95 }, { x: 1066, y: 1258, zoom: 2.02 })}>{world}</Shot>
      {/* мама отвечает, поворачивается и касается волос */}
      <Shot f={f} from={B} to={C} cam={camMove(f, B, C, { x: 990, y: 1250, zoom: 1.7 }, { x: 994, y: 1250, zoom: 1.76 })}>{world}</Shot>
      {/* родители переглядываются: завтра мама отвезёт сама */}
      <Shot f={f} from={C} to={400} cam={camMove(f, C, 400, { x: 790, y: 1250, zoom: 1.42 }, { x: 790, y: 1250, zoom: 1.46 })}>{world}</Shot>
    </>
  );
};

// Решение: тайминг жестов — в реальном времени речи (без растяжения шкалы).
export const DECISION = { pick: 12, page: 34, toForm: 200 } as const;

export const DecisionScene: React.FC = () => {
  const f = useCurrentFrame();
  const propose = useCueFrames("f02");
  const ask = useCueFrames("m05");
  const yes = useCueFrames("f03");
  const pick = DECISION.pick;
  const show = { x: DAD_SOFA.x + 0.2 * DAD_SOFA.h, y: DAD_SOFA.y - 0.58 * DAD_SOFA.h };
  const onForm = f >= DECISION.toForm;
  const dadPose = (t: number): PoseIn => {
    const phone = { x: LIVING.phone.x - 4, y: LIVING.phone.y - 22 };
    const has = t >= pick;
    return {
      expr: t < propose.from ? "thinking" : t < yes.to ? "calm" : "softSmile",
      sit: 1,
      seat: SEAT,
      lean: keys(t, [[0, 0], [8, 10], [22, 0]]),
      armR: {
        target: keysV(t, [[0, restSit(DAD_SOFA, 1)], [pick, phone], [30, show]], anticipate),
        shape: has ? "phone" : "open",
        item: has ? "phone" : "none",
        flat: has ? 1 - clamp((t - pick) / 12) : 0,
        glow: has ? clamp((t - pick - 6) / 6) : 0,
        screen: t >= DECISION.toForm ? "form" : "balago",
        itemTilt: 10,
        elbow: "down",
      },
      armL: { target: restSit(DAD_SOFA, -1), shape: "relax" },
      nod: keys(t, [[yes.from + 4, 0], [yes.from + 12, 5], [yes.from + 22, 0]]),
      lookY: keys(t, [[0, 0.5], [propose.from - 4, 0.5], [propose.from + 4, 0.1], [propose.to + 4, 0.1], [propose.to + 12, 0.5]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.3], [propose.from - 6, 0.3], [propose.from + 2, 0.7], [propose.to + 4, 0.7], [propose.to + 14, 0.45], [yes.from - 6, 0.45], [yes.from + 2, 0.75], [yes.to + 6, 0.75], [yes.to + 16, 0.45]]);
  const momPose = (t: number): PoseIn => ({
    expr: t < propose.from + 20 ? "calm" : t < yes.to ? "thinking" : "smile",
    sit: 1,
    seat: SEAT,
    lean: keys(t, [[propose.to - 10, 0], [propose.to + 10, 6]]),
    armL: { target: restSit(MOM_SOFA, -1), shape: "relax" },
    armR: { target: restSit(MOM_SOFA, 1), shape: "relax" },
    lookY: keys(t, [[0, 0.1], [propose.to, 0.1], [propose.to + 10, 0.45], [ask.from - 2, 0.45], [ask.from + 6, 0.1], [ask.to + 6, 0.1], [ask.to + 14, 0.45]]),
    nod: keys(t, [[yes.to - 4, 0], [yes.to + 4, 5], [yes.to + 14, 0]]),
  });
  const momFace = (t: number) => keys(t, [[0, -0.55], [ask.from - 6, -0.55], [ask.from + 2, -0.75], [ask.to + 2, -0.75], [ask.to + 12, -0.55]]);
  const world = (
    <>
      <LivingRoom phoneOnTable={f < pick} />
      <Actor uid="e7-dad" look="dad" f={f} place={() => DAD_SOFA} face={dadFace} pose={dadPose} role="father" seed={2} />
      <Actor uid="e7-mom" look="mom" f={f} place={() => MOM_SOFA} face={momFace} pose={momPose} role="mother" seed={1} />
      <CoffeeTable packOpen={false} />
      <WarmLight />
    </>
  );
  // Родители видны в верхней части кадра во время всех реплик; ниже —
  // крупно экран того же телефона, который папа держит в руке.
  const phone = { x: 272, y: 830, w: 535 };
  const ratio = (phone.w * 0.93) / 676;
  const screen = (x: number, y: number): Vec => ({ x: phone.x + phone.w * 0.035 + x * ratio, y: phone.y + phone.w * 0.035 + y * ratio });
  const form = FORM(DECISION.toForm);
  const tapPage = DECISION.toForm - 8;
  const away = { x: 360, y: 1980 };
  const tip = onForm
    ? keysV(f, [
        [DECISION.toForm, screen(338, 1240)],
        // проверка маршрута и времени: касание поля → отметка ✓
        ...form.checks.flatMap((at, k) => [
          [at - 8, screen(470, form.fieldY[form.checkFields[k]] + 40)],
          [at, screen(470, form.fieldY[form.checkFields[k]] + 46)],
          [at + 6, screen(470, form.fieldY[form.checkFields[k]] + 36)],
        ] as [number, Vec][]),
        [form.send - 6, screen(338, form.sendY + 20)],
        [form.send, screen(338, form.sendY + 30)],
        [form.send + 5, screen(338, form.sendY + 20)],
        [form.send + 16, away],
      ], easeInOut)
    : keysV(f, [[tapPage - 14, away], [tapPage - 3, screen(338, 1090)], [tapPage, screen(338, 1100)], [tapPage + 6, screen(338, 1088)], [DECISION.toForm, screen(338, 1240)]], easeInOut);
  const fingerOn = (f >= tapPage - 14 && f < DECISION.toForm) || (onForm && f < form.send + 16);
  const phoneVisible = f >= DECISION.page;
  return <>
    <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%,#F6E4CE,#D2B390)", fontFamily })} />
    <Shot f={f} from={0} to={500} cam={{ x: 715, y: phoneVisible ? 1190 : 1175, zoom: phoneVisible ? 1.62 : 1.84 }} viewport={phoneVisible ? { left: 0, top: 0, width: 1080, height: 800 } : undefined}>
      {world}
    </Shot>
    {phoneVisible ? <>
      <div style={box({ left: 0, right: 0, top: 778, height: 50, background: "linear-gradient(#E5CEB1,#F1DFCA)" })} />
      <PhoneFrame x={phone.x} y={phone.y} w={phone.w} tilt={0} contentWidth={676}>
        {onForm ? <RegForm f={f} at={DECISION.toForm} /> : <BalaGoPage f={f - DECISION.page} routeAt={ask.from - DECISION.page} tapAt={tapPage - DECISION.page} />}
      </PhoneFrame>
      <HoldingHand x={phone.x} y={phone.y} w={phone.w} sleeve={LOOKS.dad.topColor} skin={LOOKS.dad.skin} thumbAt={0.84} />
      {fingerOn ? <TouchFinger x={tip.x} y={tip.y} skin={LOOKS.mom.skin} sleeve={LOOKS.mom.topColor} /> : null}
    </> : null}
  </>;
};

// Вечер в гостиной.
//   Пролог: сразу — сообщение руководителя папе («Эртең саат 7:30да
//   келиңиз.»), папа говорит маме, мама спрашивает, кто отвезёт дочку,
//   берёт свой телефон: «Бирөөгө чалып көрөйүн.»
//   Итог дня (после утра): мама устала, папа слушает, поддерживает и
//   предлагает заранее распределить поездки.
// Моменты жестов привязаны к фактическому началу и концу реплик.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useCueFrames } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { wristForGrip } from "../rig/body";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { CoffeeTable, LIVING, LivingRoom, PackFront, WarmLight } from "../sets/LivingRoom";
import { HoldingHand, NotifyScreen, PhoneFrame } from "../screens";
import { box, camMove, Shot } from "../shots";

export const DAD: Place = { x: 540, y: 1700, h: 760 };
export const MOM: Place = { x: 890, y: 1700, h: 740 };
const GIRL: Place = { x: 1180, y: 1790, h: 540 };
const SEAT = 280;
const rest = (p: Place, side: number) => ({ x: p.x + side * 70, y: 1470 });

export const PrologueScene: React.FC = () => {
  const f = useCurrentFrame();
  const intro = useCueFrames("f_intro");
  const plan = useCueFrames("m_plan");
  const suggest = useCueFrames("f_suggest");
  const call = useCueFrames("m_call");
  const S1 = 60; // сообщение на экране до кадра S1
  const S3 = plan.from - 8; // крупно мама: вопрос и короткая пауза
  const S4 = suggest.from - 10; // папа предлагает позвонить близким
  const S5 = call.from - 6; // мама соглашается и берёт телефон
  const pick = call.from + 18;
  const dadPhone = { x: 655, y: 1290 };
  const sofaPhone = { x: LIVING.phone.x - 4, y: LIVING.phone.y - 22 };
  const putDown = intro.to + 22;
  const dadPose = (t: number): PoseIn => ({
    sit: 1, seat: SEAT,
    expr: t < intro.to ? "apologetic" : t < suggest.from - 4 ? "worried" : "softSmile",
    lean: keys(t, [[intro.from - 6, 0], [intro.from + 8, 6], [intro.to, 3], [suggest.from - 8, 3], [suggest.from + 6, 9], [suggest.to + 6, 9], [call.to + 10, 2]]),
    lookY: keys(t, [[0, 0.45], [intro.from - 8, 0.45], [intro.from, 0], [intro.to + 12, 0.35], [putDown + 4, 0.35], [putDown + 12, 0.05]]),
    armL: { target: rest(DAD, -1), shape: "relax" },
    // телефон кладёт на диван; на предложении — открытая ладонь к маме
    armR: {
      target: keysV(t, [[0, dadPhone], [intro.to + 4, dadPhone], [putDown, sofaPhone], [putDown + 4, sofaPhone], [putDown + 18, rest(DAD, 1)], [suggest.from, rest(DAD, 1)], [suggest.from + 14, { x: 700, y: 1335 }], [suggest.to - 4, { x: 706, y: 1330 }], [suggest.to + 14, rest(DAD, 1)]], anticipate),
      shape: t < putDown ? "phone" : t > suggest.from + 4 && t < suggest.to + 6 ? "open" : "relax",
      item: t < putDown ? "phone" : "none",
      flat: keys(t, [[intro.to + 4, 0], [putDown, 0.9]]),
      glow: keys(t, [[0, 1], [intro.to + 10, 1], [putDown, 0]]), itemTilt: 4, elbow: "down", behind: false,
    },
    headTilt: keys(t, [[suggest.from, 0], [suggest.from + 12, 3], [suggest.to, 3], [suggest.to + 14, 0]]),
    nod: keys(t, [[call.from + 4, 0], [call.from + 12, 4], [call.from + 22, 0]]),
  });
  // папа смотрит на маму, когда говорит и когда она отвечает
  const dadFace = (t: number) => keys(t, [[0, 0.25], [intro.from - 10, 0.25], [intro.from - 2, 0.7], [intro.to + 12, 0.4], [putDown + 8, 0.4], [plan.from - 4, 0.7]]);
  const momBody = { turn: 0, seat: SEAT };
  const momPhone = wristForGrip(LOOKS.mom.build, MOM, momBody, 1, { x: LIVING.momPhone.x, y: LIVING.momPhone.y - 4 }, "down");
  const momChest = { x: 950, y: 1300 };
  const momPose = (t: number): PoseIn => ({
    sit: 1, seat: SEAT,
    expr: t < intro.from + 20 ? "calm" : t < plan.to + 2 ? "worried" : t < suggest.from + 10 ? "thinking" : t < call.from ? "calm" : "softSmile",
    // после вопроса — короткая пауза, взгляд вниз (задумалась)
    lookY: keys(t, [[0, 0.15], [plan.to + 4, 0.15], [plan.to + 14, 0.5], [suggest.from + 4, 0.5], [suggest.from + 14, 0.05], [pick - 8, 0.05], [pick, 0.6], [pick + 16, 0.45]]),
    headTilt: keys(t, [[intro.to - 10, 0], [intro.to + 4, -3], [plan.to, -3], [plan.to + 14, 0], [suggest.from + 14, 0], [suggest.from + 26, -3], [call.from, -3], [call.from + 12, 0]]),
    shoulders: keys(t, [[intro.to - 4, 0], [intro.to + 6, 0.3], [plan.to + 10, 0.3], [suggest.to, 0]]),
    exhale: keys(t, [[plan.to + 8, 0], [plan.to + 16, 0.35], [plan.to + 30, 0]]),
    nod: keys(t, [[call.from - 2, 0], [call.from + 6, 5], [call.from + 16, 0]]),
    armL: { target: rest(MOM, -1), shape: "relax" },
    armR: {
      target: keysV(t, [[0, rest(MOM, 1)], [pick - 14, rest(MOM, 1)], [pick, momPhone], [pick + 3, momPhone], [pick + 20, momChest]], anticipate),
      shape: t >= pick ? "phone" : t > pick - 10 ? "open" : "relax",
      item: t >= pick ? "phone" : "none",
      flat: t >= pick ? 1 - clamp((t - pick) / 12) : 0,
      glow: clamp((t - pick - 8) / 6), itemTilt: -6, elbow: "down", behind: false,
    },
  });
  // мама: на папу → задумалась → снова на папу (его предложение) → телефон
  const momFace = (t: number) => keys(t, [[0, -0.5], [plan.to + 6, -0.5], [plan.to + 16, -0.2], [suggest.from + 2, -0.2], [suggest.from + 12, -0.6], [call.to, -0.6], [pick - 10, 0.3]]);
  const girlPose = (t: number): PoseIn => ({
    packOff: true, expr: "calm",
    lean: 8,
    armL: { target: { x: 1150, y: 1520 }, shape: "fist", item: "notebook", itemTilt: -8, elbow: "down" },
    armR: { target: keysV(t, [[0, { x: 1080, y: 1560 }], [40, { x: 1060, y: 1540 }], [80, { x: 1080, y: 1560 }], [120, { x: 1064, y: 1544 }], [160, { x: 1080, y: 1560 }]]), shape: "relax", elbow: "down" },
    lookY: keys(t, [[0, 0.6], [plan.from + 10, 0.6], [plan.from + 20, 0.2], [plan.to + 30, 0.2], [plan.to + 40, 0.6]]),
  });
  const girlFace = (t: number) => keys(t, [[0, -0.5], [plan.from + 8, -0.5], [plan.from + 18, -0.8], [plan.to + 30, -0.8], [plan.to + 44, -0.5]]);
  const world = <>
    <LivingRoom phoneOnTable={f >= putDown} momPhone={f < pick} />
    <Actor uid="nb-prologue-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
    <Actor uid="nb-prologue-mom" look="mom" f={f} place={() => MOM} face={momFace} pose={momPose} role="mother" seed={1} />
    <CoffeeTable />
    <Actor uid="nb-prologue-girl" look="girl" f={f} place={() => GIRL} face={girlFace} pose={girlPose} role="daughter" seed={3} />
    <PackFront /><WarmLight />
  </>;
  return <>
    {/* сразу: сообщение руководителя — изменение плана читается с первой секунды */}
    <Shot f={f} from={0} to={S1} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<>
      <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F8E4C7, #CFA67A)" })} />
      <PhoneFrame x={245} y={300} w={590} shake={f < 12 ? Math.sin(f * 2.6) * 4 : 0}><NotifyScreen f={f} at={3} /></PhoneFrame>
      <HoldingHand x={245} y={300} w={590} sleeve={LOOKS.dad.topColor} skin={LOOKS.dad.skin} />
      <div style={box({ left: 72, top: 200, padding: "10px 24px", borderRadius: 18, backgroundColor: "rgba(255,249,233,0.92)", fontFamily, fontSize: 38, color: "#57455C", fontWeight: 800 })}>Кечинде</div>
    </>}>{null}</Shot>
    {/* папа говорит маме */}
    <Shot f={f} from={S1} to={S3} cam={camMove(f, S1, S3, { x: 700, y: 1170, zoom: 1.58 }, { x: 706, y: 1170, zoom: 1.64 })}>{world}</Shot>
    {/* мама — крупно: вопрос и пауза */}
    <Shot f={f} from={S3} to={S4} cam={camMove(f, S3, S4, { x: 880, y: 1090, zoom: 2.05 }, { x: 884, y: 1094, zoom: 2.16 })}>{world}</Shot>
    {/* вдвоём: папа предлагает позвонить близким */}
    <Shot f={f} from={S4} to={S5} cam={camMove(f, S4, S5, { x: 725, y: 1160, zoom: 1.72 }, { x: 728, y: 1162, zoom: 1.78 })}>{world}</Shot>
    {/* мама соглашается и берёт телефон */}
    <Shot f={f} from={S5} to={600} cam={camMove(f, S5, 600, { x: 860, y: 1230, zoom: 1.5 }, { x: 870, y: 1240, zoom: 1.56 })}>{world}</Shot>
  </>;
};

// Итог дня: мама устала; папа слушает, берёт её за руку, поддерживает и
// предлагает распределить поездки заранее.
export const ReflectionScene: React.FC = () => {
  const f = useCurrentFrame();
  const recap = useCueFrames("m_recap");
  const support = useCueFrames("f_support");
  const plan = useCueFrames("f_recap");
  const momHand = rest(MOM, -1);
  const dadPose = (t: number): PoseIn => ({
    sit: 1, seat: SEAT,
    expr: t < recap.to ? "worried" : t < support.to + 10 ? "softSmile" : "calm",
    lean: keys(t, [[recap.to - 10, 0], [recap.to + 8, 6], [support.to + 20, 6], [plan.from, 2]]),
    armL: { target: rest(DAD, -1), shape: "relax" },
    armR: {
      // кладёт ладонь на руку мамы, потом небольшой открытый жест на «алдын ала»
      target: keysV(t, [[0, rest(DAD, 1)], [recap.to - 2, rest(DAD, 1)], [support.from + 4, { x: momHand.x - 22, y: momHand.y - 14 }], [support.to + 18, { x: momHand.x - 22, y: momHand.y - 14 }], [plan.from + 10, { x: 690, y: 1330 }], [plan.from + 40, { x: 700, y: 1320 }], [plan.to + 10, rest(DAD, 1)]], anticipate),
      shape: t > recap.to && t < support.to + 22 ? "relax" : t >= plan.from && t < plan.to ? "open" : "relax", elbow: "down", behind: false,
    },
    nod: keys(t, [[recap.from + 30, 0], [recap.from + 38, 3], [recap.from + 50, 0], [recap.to - 6, 0], [recap.to + 2, 4], [recap.to + 12, 0]]),
    lookY: keys(t, [[0, 0.1], [support.from, 0.15], [support.from + 10, 0.05]]),
  });
  const dadFace = (t: number) => keys(t, [[0, 0.65], [plan.to + 10, 0.65], [plan.to + 30, 0.5]]);
  const momPose = (t: number): PoseIn => ({
    sit: 1, seat: SEAT,
    expr: t < recap.to + 4 ? "tired" : t < support.to ? "sad" : t < plan.from ? "softSmile" : t < plan.to + 6 ? "thinking" : "calm",
    exhale: keys(t, [[0, 0], [12, 0.55], [34, 0.2], [recap.to - 4, 0.2], [recap.to + 8, 0.5], [recap.to + 26, 0]]),
    shoulders: keys(t, [[0, 0.1], [recap.to, 0.1], [support.to, 0]]),
    lookY: keys(t, [[0, 0.5], [recap.from - 4, 0.3], [recap.from + 20, 0.15], [recap.to, 0.4], [support.from + 6, 0.1]]),
    armL: { target: momHand, shape: "relax" },
    armR: { target: rest(MOM, 1), shape: "relax" },
    headTilt: keys(t, [[support.from, 0], [support.from + 14, 3], [plan.from, 3], [plan.from + 14, 0]]),
    nod: keys(t, [[plan.to + 4, 0], [plan.to + 12, 5], [plan.to + 22, 0], [plan.to + 30, 3], [plan.to + 38, 0]]),
  });
  // мама сначала смотрит перед собой (устала), потом на папу
  const momFace = (t: number) => keys(t, [[0, -0.15], [recap.from + 30, -0.15], [recap.from + 44, -0.6], [recap.to, -0.6], [recap.to + 8, -0.3], [support.from - 2, -0.65]]);
  const world = <>
    <LivingRoom phoneOnTable />
    <Actor uid="nb-reflect-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
    <Actor uid="nb-reflect-mom" look="mom" f={f} place={() => MOM} face={momFace} pose={momPose} role="mother" seed={1} />
    <CoffeeTable packOpen={false} /><WarmLight />
  </>;
  const A = recap.to + 6;
  const B = support.to + 14;
  return <>
    {/* общий план: вечер, мама устало выдыхает */}
    <Shot f={f} from={0} to={24} cam={{ x: 760, y: 1250, zoom: 1.28 }}>{world}</Shot>
    {/* мама — ближе, говорит о дне; папа слушает */}
    <Shot f={f} from={24} to={A} cam={camMove(f, 24, A, { x: 850, y: 1120, zoom: 1.85 }, { x: 856, y: 1120, zoom: 1.95 })}>{world}</Shot>
    {/* папа поддерживает — рука на её руке */}
    <Shot f={f} from={A} to={B} cam={camMove(f, A, B, { x: 640, y: 1170, zoom: 1.8 }, { x: 650, y: 1175, zoom: 1.86 })}>{world}</Shot>
    {/* вместе: предложение организовать заранее */}
    <Shot f={f} from={B} to={400} cam={camMove(f, B, 400, { x: 718, y: 1185, zoom: 1.62 }, { x: 722, y: 1190, zoom: 1.68 })}>{world}</Shot>
    {/* короткая подпись: снова вечер того же дня */}
    {f < 50 ? <div style={box({ left: 72, top: 200, padding: "10px 24px", borderRadius: 18, backgroundColor: "rgba(255,249,233,0.92)", fontFamily, fontSize: 38, color: "#57455C", fontWeight: 800, opacity: 1 - clamp((f - 38) / 12) })}>Кечинде</div> : null}
  </>;
};

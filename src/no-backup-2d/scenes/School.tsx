// Сцена «school»: у школы мама приседает, поправляет дочке воротник
// (кисти ниже подбородка), говорит «Сабагың жакшы өтсүн», встаёт; дочка
// идёт к двери, оборачивается и коротко машет. Вибрация в сумке → мама
// достаёт телефон и читает сообщение коллеги (07:58, собрание в 08:00).
// Офис 08:17: мама входит, извиняется, ставит сумку на стол, садится и
// выдыхает. Кадры — от начала сцены.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { useCueFrames } from "../context";
import { NB2_TEXT } from "../script";
import { LOOKS } from "../rig/looks";
import { HoldingHand, PhoneFrame, StatusBar } from "../screens";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { bodyPoints, wristForGrip } from "../rig/body";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { ChairBack, Desk, DeskBag, OFFICE, OfficeRoom, SchoolYard, SCHOOL } from "../sets/Places";
import { box, camMove, Shot } from "../shots";
import { GIRL_S, GIRL_TO_SCHOOL, MOM_OFFICE, MOM_S, OFFICE_WALK, SCHOOL_WALK } from "../paths";

const MOM = LOOKS.mom.build;
// пока стопы мамы не перешли порог — она в проёме двери (за стеной)
const MOM_IN_DOOR_Y = OFFICE.door.y + OFFICE.door.h + 2;

// Планы и события (кадры сцены); звуки берут их отсюда же.
// Сообщение: вибрация → телефон из сумки → крупный экран ~4,6 с (голос
// коллеги за кадром) → короткая реакция → офис.
export const SCHOOL_SHOTS = { yard: [0, 214], message: [214, 426], office: [426, 570] } as const;
export const SCHOOL_EVENTS = {
  vibrate: 222,
  phoneOut: 240,
  screen: [262, 400],
  doorOpen: 430,
  bagDown: 506,
  sit: 512,
  exhale: 552,
} as const;

export const SchoolScene: React.FC = () => {
  const f = useCurrentFrame();
  const bye = useCueFrames("m_bye");
  const sorry = useCueFrames("m_office");
  const E = SCHOOL_EVENTS;

  // ---------- A. прощание ----------
  // небольшой присед с наклоном к дочке (колени и стопы устойчивы)
  const crouchT = (t: number) => keys(t, [[4, 0], [26, 0.2], [bye.to - 2, 0.2], [bye.to + 20, 0]]);
  const leanT = (t: number) => keys(t, [[4, 0], [26, 10], [bye.to - 2, 10], [bye.to + 20, 0]]);
  const momFaceA = (t: number) => keys(t, [[0, -0.6], [SCHOOL_WALK.from + 10, -0.6], [SCHOOL_WALK.from + 26, -0.75]]);
  const momBodyA = (t: number) => ({ turn: momFaceA(t) * 0.8, crouch: crouchT(t), lean: leanT(t) });
  const girlFaceA = (t: number) => keys(t, [[0, 0.75], [SCHOOL_WALK.from - 8, 0.75], [SCHOOL_WALK.from + 4, -0.6], [SCHOOL_WALK.to - 6, -0.6], [SCHOOL_WALK.to + 4, 0.45], [SCHOOL_WALK.to + 26, 0.45], [SCHOOL_WALK.to + 34, 0]]);
  const gb = bodyPoints(LOOKS.girl.build, GIRL_S, { turn: 0.75 * 0.8 });
  const atCollar = (side: -1 | 1, t: number, p: Vec) => wristForGrip(MOM, MOM_S, momBodyA(t), side, p, "down");
  const knee = (side: -1 | 1, t: number): Vec => {
    const b = bodyPoints(MOM, MOM_S, momBodyA(t));
    return { x: b.hip(side).x - 70, y: b.hip(side).y + 30 };
  };
  const restA = (side: -1 | 1): Vec => ({ x: MOM_S.x + side * 0.1 * MOM_S.h, y: MOM_S.y - 0.36 * MOM_S.h });
  // ближняя рука поправляет край воротника, вторая лежит на плече дочки —
  // обе ниже подбородка
  // поправляет лямку сарафана на плече (ниже подбородка), вторая кисть — на плече
  const strap = { x: gb.shoulder(1).x - 8, y: gb.shoulder(1).y + 44 };
  const shoulderG = { x: gb.shoulder(1).x + 12, y: gb.shoulder(1).y + 70 };
  const handA = (side: -1 | 1, t: number): Vec => {
    const c = side < 0 ? strap : shoulderG;
    if (t < 14) return restA(side);
    if (t < 64) return side < 0
      ? keysV(t, [[14, restA(side)], [32, atCollar(side, t, { x: c.x + 12, y: c.y + 6 })], [40, atCollar(side, t, c)], [48, atCollar(side, t, { x: c.x - 3, y: c.y + 2 })], [54, atCollar(side, t, c)]], easeInOut)
      : keysV(t, [[14, restA(side)], [34, atCollar(side, t, c)], [60, atCollar(side, t, c)]], easeInOut);
    return keysV(t, [[64, atCollar(side, t, { x: c.x + 30, y: c.y + 26 })], [78, knee(side, t)], [bye.to - 2, knee(side, t)], [bye.to + 20, restA(side)]], easeInOut);
  };
  const waveFrom = SCHOOL_WALK.to + 6;
  const momPoseA = (t: number): PoseIn => ({
    expr: t < 60 ? "softSmile" : t < bye.to ? "smile" : "softSmile",
    bagOnShoulder: 1,
    crouch: crouchT(t),
    lean: leanT(t),
    armL: { target: t < 64 ? handA(-1, t) : keysV(t, [[64, handA(-1, 64)], [80, handA(-1, 80)]]), shape: t > 30 && t < 58 ? "pinch" : "relax", elbow: "down", behind: false },
    armR: {
      target: t < waveFrom ? handA(1, t) : keysV(t, [[waveFrom, restA(1)], [waveFrom + 10, { x: MOM_S.x + 0.14 * MOM_S.h, y: MOM_S.y - 0.86 * MOM_S.h }], [waveFrom + 34, { x: MOM_S.x + 0.14 * MOM_S.h, y: MOM_S.y - 0.86 * MOM_S.h }], [waveFrom + 46, restA(1)]], easeInOut),
      shape: t > waveFrom + 6 && t < waveFrom + 38 ? "wave" : t > 30 && t < 62 ? "open" : "relax",
      wrist: t > waveFrom + 8 && t < waveFrom + 36 ? Math.sin((t - waveFrom) * 0.42) * 10 : 0,
      elbow: "down",
      behind: false,
    },
    lookY: keys(t, [[4, 0], [24, 0.45], [60, 0.45], [70, 0.1]]),
    nod: keys(t, [[bye.from + 4, 0], [bye.from + 12, 3], [bye.from + 22, 0]]),
  });
  const girlPlace = GIRL_TO_SCHOOL;
  const enter = (t: number): Place => {
    const u = cruise((t - (SCHOOL_WALK.to + 36)) / 22);
    return { x: lerp(610, 600, u), y: lerp(SCHOOL.door.y + 6, SCHOOL.door.y - 24, u), h: lerp(540, 528, u) };
  };
  const girlPoseA = (t: number): PoseIn => {
    const p = girlPlace(t);
    return {
      expr: t < 30 ? "calm" : "smile",
      armL: { target: null, shape: "relax" },
      armR: {
        target: t < SCHOOL_WALK.to + 2 ? null : keysV(t, [[SCHOOL_WALK.to + 2, { x: p.x + 0.1 * p.h, y: p.y - 0.45 * p.h }], [SCHOOL_WALK.to + 10, { x: p.x + 0.14 * p.h, y: p.y - 0.98 * p.h }], [SCHOOL_WALK.to + 28, { x: p.x + 0.14 * p.h, y: p.y - 0.98 * p.h }], [SCHOOL_WALK.to + 36, { x: p.x + 0.1 * p.h, y: p.y - 0.45 * p.h }]], easeInOut),
        shape: t > SCHOOL_WALK.to + 8 && t < SCHOOL_WALK.to + 30 ? "wave" : "relax",
        wrist: t > SCHOOL_WALK.to + 10 && t < SCHOOL_WALK.to + 28 ? Math.sin(t * 0.5) * 12 : 0,
      },
      lookY: keys(t, [[0, -0.45], [60, -0.45], [72, -0.2]]),
      nod: keys(t, [[bye.to - 6, 0], [bye.to + 2, 5], [bye.to + 12, 0]]),
    };
  };
  // Школьник на заднем плане проходит раньше дочки — до её подхода к двери.
  const kidAPlace = (t: number): Place => {
    const u = cruise(t / 70, 0.25);
    const into = clamp((t - 70) / 20);
    return { x: lerp(160, 485, u), y: lerp(1484, SCHOOL.door.y + 4, u) - into * 32, h: lerp(430, 418, u) - into * 12 };
  };
  const parentB = (t: number): Place => {
    const u = cruise((t - 8) / 70, 0.25);
    return { x: lerp(-160, 170, u), y: 1510, h: 680 };
  };
  const inDoorway = (p: Place) => p.y < SCHOOL.door.y - 2;
  const girlInDoor = f >= SCHOOL_WALK.to + 36;
  const shade = (p: Place) => 1 - 0.5 * clamp((SCHOOL.door.y + 6 - p.y) / 60);
  const kid = (inDoor: boolean) => (inDoorway(kidAPlace(f)) === inDoor && f < 96 ? <Actor uid="s5-kidA" look="kidA" f={f} place={kidAPlace} seed={7} opacity={shade(kidAPlace(f)) * (1 - clamp((f - 88) / 8))} /> : null);
  const yard = (
    <>
      <SchoolYard
        minutes={7 * 60 + 55 + f / 1800}
        inDoor={<>
          {kid(true)}
          {girlInDoor ? <Actor uid="s5-girl" look="girl" f={f} place={enter} face={() => 0} pose={() => ({ expr: "calm" })} seed={3} walkFrom={SCHOOL_WALK.to + 36} opacity={shade(enter(f))} /> : null}
        </>}
      />
      {kid(false)}
      {f < 160 ? <Actor uid="s5-parentB" look="parentB" f={f} place={parentB} face={(t) => keys(t, [[90, 0.4], [106, -0.2]])} seed={9} /> : null}
      {girlInDoor ? null : <Actor uid="s5-girl" look="girl" f={f} place={girlPlace} face={girlFaceA} pose={girlPoseA} role="daughter" seed={3} walkFrom={SCHOOL_WALK.from - 10} />}
      <Actor uid="s5-mom" look="mom" f={f} place={() => MOM_S} face={momFaceA} pose={momPoseA} role="mother" seed={1} />
    </>
  );

  // ---------- B. сообщение коллеги: вибрация в сумке → достаёт → читает ----------
  const bag = bodyPoints(MOM, MOM_S, { turn: 0.1 * 0.8 });
  const bagW = { x: MOM_S.x + MOM.shoulderHalf * 1.15 * bag.k, y: bag.pelvis.y - 10 };
  const chest = { x: MOM_S.x + 0.07 * MOM_S.h, y: MOM_S.y - 0.62 * MOM_S.h };
  const restB = { x: MOM_S.x + 0.1 * MOM_S.h, y: MOM_S.y - 0.36 * MOM_S.h };
  const momFaceB = (t: number) => keys(t, [[214, -0.3], [E.vibrate + 2, -0.3], [E.vibrate + 10, 0.35], [E.phoneOut + 8, 0.1], [318, 0.1], [326, 0.5]]);
  const momPoseB = (t: number): PoseIn => {
    const has = t >= E.phoneOut;
    return {
      expr: t < E.vibrate + 4 ? "softSmile" : t < 262 ? "thinking" : "apologetic",
      bagOnShoulder: 1,
      armR: {
        target: keysV(t, [[214, restB], [E.vibrate + 8, restB], [E.phoneOut - 6, bagW], [E.phoneOut + 2, bagW], [E.phoneOut + 18, chest], [E.screen[1] + 16, chest], [SCHOOL_SHOTS.message[1], restB]], anticipate),
        shape: has ? "phone" : t > E.vibrate + 8 ? "open" : "relax",
        item: has ? "phone" : "none",
        itemTilt: -4,
        glow: 1,
        elbow: "down",
      },
      lookY: keys(t, [[214, 0], [E.vibrate + 4, 0], [E.vibrate + 12, 0.6], [E.phoneOut + 10, 0.6], [E.phoneOut + 18, 0.5], [318, 0.5], [326, 0]]),
      nod: keys(t, [[E.phoneOut + 14, 0], [E.phoneOut + 24, 4], [318, 4], [326, 0]]),
      exhale: keys(t, [[E.screen[1] + 2, 0], [E.screen[1] + 10, 0.45], [SCHOOL_SHOTS.message[1], 0.2]]),
    };
  };

  // ---------- C. офис ----------
  const momOffice = MOM_OFFICE;
  const seat = 250;
  const deskY = OFFICE.desk.y - 14;
  const ko = momOffice(OFFICE_WALK.to).h / 1000;
  const bagGrip = { x: OFFICE.desk.x + OFFICE.desk.w - 36, y: deskY - 1.42 * 47 * ko };
  const momFaceC = (t: number) => keys(t, [[SCHOOL_SHOTS.office[0], 0.6], [sorry.from - 4, 0.6], [sorry.from + 4, 0.75], [sorry.to, 0.75], [OFFICE_WALK.to - 6, 0.3], [OFFICE_WALK.to + 4, 0.25], [E.sit, 0.1], [E.sit + 20, 0]]);
  const momPoseC = (t: number): PoseIn => {
    const p = momOffice(t);
    const body = { turn: momFaceC(t) * 0.8 };
    const b = bodyPoints(MOM, p, body);
    const strap = { x: b.shoulder(1).x + 6, y: b.shoulder(1).y + 10 };
    const sitK = keys(t, [[E.sit, 0], [E.sit + 30, 1]], easeInOut);
    const holdingBag = t >= OFFICE_WALK.to + 6 && t < E.bagDown;
    return {
      expr: t < sorry.to + 6 ? "apologetic" : t < E.exhale + 10 ? "tired" : "calm",
      bagOnShoulder: t < OFFICE_WALK.to + 6 ? 1 : 0,
      armR: {
        target: keysV(t, [[OFFICE_WALK.to - 4, { x: p.x + 0.1 * p.h, y: p.y - 0.36 * p.h }], [OFFICE_WALK.to + 6, strap], [E.bagDown, bagGrip], [E.bagDown + 4, bagGrip], [E.sit + 22, { x: p.x + 0.12 * p.h, y: deskY - 4 }]], anticipate),
        shape: holdingBag ? "fist" : "relax",
        item: holdingBag ? "handbag" : "none",
        elbow: "down",
        behind: false,
      },
      armL: {
        target: keysV(t, [[E.sit - 4, { x: p.x - 0.1 * p.h, y: p.y - 0.36 * p.h }], [E.sit + 8, { x: p.x - 0.18 * p.h, y: deskY - 2 }], [E.sit + 26, { x: p.x - 0.15 * p.h, y: deskY - 4 }]], anticipate),
        shape: "relax",
        behind: false,
      },
      // сначала остановка у стула, затем наклон вперёд и опускание таза
      sit: sitK,
      seat,
      lean: keys(t, [[E.sit - 2, 0], [E.sit + 14, 14], [E.sit + 30, 4], [E.exhale, 4], [E.exhale + 10, 0]]),
      exhale: keys(t, [[E.exhale, 0], [E.exhale + 10, 0.9], [E.exhale + 30, 0.25]]),
      lookY: keys(t, [[OFFICE_WALK.to, 0], [OFFICE_WALK.to + 6, 0.3], [E.bagDown, 0.4], [E.sit + 10, 0.4], [E.sit + 30, 0.1], [E.exhale + 6, 0.35], [E.exhale + 24, 0.05]]),
      nod: keys(t, [[sorry.from, 0], [sorry.from + 8, 4], [sorry.from + 18, 0], [E.exhale, 0], [E.exhale + 10, 5], [E.exhale + 26, 0]]),
    };
  };
  const colleague = (t: number): PoseIn => ({
    expr: t < sorry.from + 6 ? "thinking" : t < sorry.to + 30 ? "softSmile" : "calm",
    sit: 1,
    seat: 240,
    armL: { target: { x: 1160 + (t < sorry.from ? Math.sin(t * 0.9) * 6 : 0), y: 1330 }, shape: "relax" },
    armR: { target: { x: 1290 + (t < sorry.from ? Math.sin(t * 0.8 + 1) * 6 : 0), y: 1332 }, shape: "relax" },
    nod: keys(t, [[sorry.to - 4, 0], [sorry.to + 4, 5], [sorry.to + 14, 0]]),
    lookY: keys(t, [[sorry.from - 4, 0.6], [sorry.from + 4, 0], [sorry.to + 24, 0], [sorry.to + 34, 0.6]]),
  });
  const momInDoor = momOffice(f).y < MOM_IN_DOOR_Y;
  const momC = <Actor uid="s5-mom-office" look="mom" f={f} place={momOffice} face={momFaceC} pose={momPoseC} role="mother" seed={1} walkFrom={OFFICE_WALK.from - 4} blinks={[E.exhale + 8]} />;
  const office = (
    <>
      <OfficeRoom minutes={8 * 60 + 17} doorOpen={keys(f, [[E.doorOpen, 0], [E.doorOpen + 10, 1], [OFFICE_WALK.from + 30, 1], [OFFICE_WALK.from + 44, 0]])} inDoor={momInDoor ? momC : null} />
      <ChairBack x={1220} y={1590} s={0.95} />
      <Actor uid="s5-col" look="colleagueA" f={f} place={() => ({ x: 1220, y: 1590, h: 760 })} face={(t) => keys(t, [[sorry.from - 6, 0], [sorry.from + 4, -0.55], [sorry.to + 24, -0.55], [sorry.to + 34, 0]])} pose={colleague} seed={11} />
      <Desk x={980} y={1330} w={480} laptop={0.5} />
      <ChairBack x={OFFICE.chair.x} y={1600} s={1} />
      {momInDoor ? null : momC}
      <Desk x={OFFICE.desk.x} y={OFFICE.desk.y} w={OFFICE.desk.w} laptop={0.55} />
      {f >= E.bagDown ? <DeskBag grip={bagGrip} k={ko} /> : null}
    </>
  );

  const [, A1] = SCHOOL_SHOTS.yard;
  return (
    <>
      {/* у двери школы: воротник, напутствие */}
      <Shot f={f} from={0} to={SCHOOL_WALK.from - 4} cam={camMove(f, 0, SCHOOL_WALK.from - 4, { x: 880, y: 1150, zoom: 1.5 }, { x: 884, y: 1150, zoom: 1.56 })}>
        {yard}
      </Shot>
      {/* дочка идёт к двери, машет; мама машет в ответ */}
      <Shot f={f} from={SCHOOL_WALK.from - 4} to={A1} cam={camMove(f, SCHOOL_WALK.from - 4, A1, { x: 780, y: 1130, zoom: 1.12 }, { x: 760, y: 1120, zoom: 1.14 })}>
        {yard}
      </Shot>
      {/* вибрация в сумке → телефон в руке */}
      <Shot f={f} from={214} to={E.screen[0]} cam={camMove(f, 214, E.screen[0], { x: 1000, y: 1100, zoom: 1.85 }, { x: 1000, y: 1080, zoom: 1.95 })}>
        <SchoolYard doorOpen={0.2} minutes={7 * 60 + 58} />
        <Actor uid="s5b-mom" look="mom" f={f} place={() => MOM_S} face={momFaceB} pose={momPoseB} role="mother" seed={1} />
      </Shot>
      {/* экран крупно: тот же наклон, что у телефона в руке */}
      <Shot f={f} from={E.screen[0]} to={E.screen[1]} cam={{ x: 540, y: 960, zoom: 1 }} overlay={
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#A5C0D3,#E7DED1)" }}>
          <PhoneFrame x={250} y={290} w={580} tilt={-4}>
            <StatusBar time="07:58" />
            <div style={box({ left: 26, right: 26, top: 300, padding: 28, borderRadius: 26, backgroundColor: "white", fontFamily, color: "#24354E" })}>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Кесиптешим · азыр</div>
              <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.28 }}>{NB2_TEXT.colleague}</div>
            </div>
          </PhoneFrame>
          <HoldingHand x={250} y={290} w={580} sleeve={LOOKS.mom.topColor} skin={LOOKS.mom.skin} />
        </div>
      }>{null}</Shot>
      {/* реакция: выдох, торопится на работу */}
      {/* реакция: короткая пауза, напряжённый взгляд, выдох */}
      <Shot f={f} from={E.screen[1]} to={SCHOOL_SHOTS.message[1]} cam={{ x: 1000, y: 1080, zoom: 1.95 }}>
        <SchoolYard doorOpen={0.2} minutes={7 * 60 + 58} />
        <Actor uid="s5b-mom" look="mom" f={f} place={() => MOM_S} face={momFaceB} pose={momPoseB} role="mother" seed={1} />
      </Shot>
      {/* офис 08:17: входит, извиняется, сумка на стол, садится */}
      <Shot f={f} from={SCHOOL_SHOTS.office[0]} to={E.sit - 6} cam={camMove(f, SCHOOL_SHOTS.office[0], E.sit - 6, { x: 720, y: 1180, zoom: 0.95 }, { x: 740, y: 1190, zoom: 1.0 })}>
        {office}
      </Shot>
      <Shot f={f} from={E.sit - 6} to={SCHOOL_SHOTS.office[1]} cam={camMove(f, E.sit - 6, SCHOOL_SHOTS.office[1], { x: 690, y: 1180, zoom: 1.6 }, { x: 688, y: 1185, zoom: 1.68 })}>
        {office}
      </Shot>
    </>
  );
};

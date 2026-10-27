import { useCurrentFrame } from "remotion";
import { ARM, armKeys, type Arm, exprKeys } from "../Character";
import { useMouth } from "../context";
import { Phone } from "../props";
import { Actor, reach, walkOf, type Placement } from "../rig";
import { HH2_TEXT } from "../script";
import { MissedCallsScreen } from "../screens";
import { BagOnDesk, DeskPhone, OfficeRoom, ReportScreen, WorkDesk } from "../sets2";
import { camMove, Shot } from "../shots";
import { Caption, keys } from "../ui";

// Офис: мама за столом, руководитель, коллега. Расположение одинаковое во
// всех офисных планах (сцены 1, 2, 6), чтобы монтаж читался.
export const MOM: Placement = { x: 300, y: 1700, h: 1100 };
export const BOSS: Placement = { x: 960, y: 1820, h: 1180 };
const COLLEAGUE_STOP = 930;
export const DESK = { x: 40, y: 1350 };
// Сумка на столе (точка ручки) и клавиатура.
export const BAG = { x: 455, y: 1255 };
export const BAG_K = 1.1;
const KEY_L = { x: 238, y: 1336 };
const KEY_R = { x: 368, y: 1336 };
export const PHONE_ON_DESK = { x: 96, y: 1316 };

// Время на часах: минуты от полуночи.
export const T_START = 12 * 60 + 14;

export const Keyboard: React.FC = () => (
  <div style={{ position: "absolute", left: 196 - DESK.x, top: -14, width: 214, height: 22, borderRadius: 6, backgroundColor: "#C3CCD8" }} />
);

export const Mug: React.FC<{ x: number }> = ({ x }) => (
  <svg width={60} height={64} viewBox="0 0 60 64" style={{ position: "absolute", left: x, top: -60 }}>
    <rect x={6} y={8} width={38} height={52} rx={8} fill="#FFC90E" />
    <path d="M 44 18 Q 58 20 56 34 Q 54 46 44 44" fill="none" stroke="#FFC90E" strokeWidth={6} />
  </svg>
);

// Кисть «на клавиатуре» (сидя): лёгкое попеременное касание клавиш, без
// раскачивания всей руки.
export const typing = (f: number, side: -1 | 1, on: number): Arm => {
  const base = reach(MOM, "mom", side, side === -1 ? KEY_L.x : KEY_R.x, side === -1 ? KEY_L.y : KEY_R.y, 1);
  const tap = on * Math.max(0, Math.sin((f + (side === 1 ? 5 : 0)) / 2.6)) * 6;
  return [base[0], base[1] - tap];
};

export const deskScreen = (progress: number, highlight = -1) => (
  <ReportScreen progress={progress} title={HH2_TEXT.task} highlight={highlight} />
);

// ---------- Сцена 1: офис (0–14 с) ----------
export const OfficeScene: React.FC = () => {
  const f = useCurrentFrame();
  const momMouth = useMouth("mother");
  const bossMouth = useMouth("boss");
  const clock = T_START + f / 30 / 60;
  // мама: печатает → смотрит на часы → поворачивается к руководителю
  const typeL = typing(f, -1, keys(f, [[0, 1], [16, 1], [22, 0]]));
  const typeR = typing(f, 1, keys(f, [[0, 1], [60, 1], [66, 0]]));
  const armL = armKeys(f, [
    [0, typeL],
    [18, typeL],
    [36, ARM.watch],
    [56, ARM.watch],
    [72, reach(MOM, "mom", -1, 200, 1334, 1)],
    [336, reach(MOM, "mom", -1, 200, 1334, 1)],
    [366, ARM.relaxed],
  ]);
  const sitUp = keys(f, [[0, 1], [336, 1], [368, 0]]);
  // правая рука: клавиатура → лёгкий жест на реплике → сумка
  const grabAt = 392;
  const bagHand = reach(MOM, "mom", 1, BAG.x, BAG.y - 6 * BAG_K, sitUp);
  const armR = armKeys(f, [
    [0, typeR],
    [62, typeR],
    [80, reach(MOM, "mom", 1, 400, 1334, 1)],
    [150, reach(MOM, "mom", 1, 400, 1334, 1)],
    [168, [-70, 420]],
    [210, [-70, 420]],
    [232, reach(MOM, "mom", 1, 400, 1334, 1)],
    [372, reach(MOM, "mom", 1, 400, 1334, 1) as Arm],
    [grabAt, bagHand],
    [412, [-40, 470]],
  ]);
  const holdingBag = f >= grabAt;
  const look = keys(f, [[0, 0], [30, 0], [36, -0.2], [58, -0.2], [70, 1], [300, 1], [330, 0.5], [396, 0.2], [410, -0.8]]);
  const lookY = keys(f, [[0, 0.8], [18, 0.8], [30, 0.6], [58, 0.6], [68, 0], [340, 0], [376, 0.6], [396, 0.6], [404, 0]]);
  const turn = keys(f, [[0, 0], [60, 0], [76, 0.45], [300, 0.45], [330, 0.2], [400, 0], [414, -0.4]]);
  const momExpr = exprKeys(f, [[0, "focused"], [56, "apologetic"], [221, "smile"], [296, "neutral"]]);
  const bossNod = keys(f, [[232, 0], [240, 4], [250, 0], [258, 3], [268, 0]]);
  const bossLook = keys(f, [[0, -0.3], [70, -0.3], [82, -1], [400, -1], [412, -0.6]]);

  const world = (
    <>
      <OfficeRoom clockMinutes={clock} />
      <Actor
        at={BOSS}
        kind="boss"
        expr={exprKeys(f, [[0, "calm"], [228, "smile"]])}
        mouth={bossMouth}
        look={bossLook}
        turn={-0.4}
        headTilt={bossNod}
        armL={[-60, 470]}
        itemL="cup"
        armR={ARM.relaxed}
        seed={3}
      />
      <Actor
        at={MOM}
        kind="mom"
        sit={sitUp}
        expr={momExpr}
        mouth={momMouth}
        look={look}
        lookY={lookY}
        turn={turn}
        armL={armL}
        armR={armR}
        itemR={holdingBag ? "handbag" : "none"}
        watchL
        seed={1}
      />
      <WorkDesk x={DESK.x} y={DESK.y} monitorX={480} screen={deskScreen(0.15)}>
        <Keyboard />
        <Mug x={60} />
        <DeskPhone x={PHONE_ON_DESK.x - DESK.x} y={PHONE_ON_DESK.y - DESK.y} />
      </WorkDesk>
      {!holdingBag ? <BagOnDesk x={BAG.x} y={BAG.y} k={BAG_K} /> : null}
    </>
  );
  return (
    <>
      {/* мама смотрит на часы на руке */}
      <Shot f={f} from={0} to={78} cam={camMove(f, 0, 78, { x: 360, y: 1130, scale: 1.75 }, { x: 360, y: 1120, scale: 1.82 })}>
        {world}
      </Shot>
      <Shot f={f} from={78} to={140} cam={camMove(f, 78, 140, { x: 590, y: 1080, scale: 1.15 }, { x: 580, y: 1085, scale: 1.2 })}>
        {world}
      </Shot>
      {/* мама говорит: средний план, руководитель слушает за кадром */}
      <Shot f={f} from={140} to={225} cam={camMove(f, 140, 225, { x: 360, y: 1130, scale: 1.95 }, { x: 370, y: 1125, scale: 2.05 })}>
        {world}
      </Shot>
      <Shot f={f} from={225} to={300} cam={camMove(f, 225, 300, { x: 940, y: 1000, scale: 1.75 }, { x: 940, y: 990, scale: 1.82 })}>
        {world}
      </Shot>
      <Shot f={f} from={300} to={420} cam={camMove(f, 300, 420, { x: 390, y: 1080, scale: 1.45 }, { x: 380, y: 1060, scale: 1.52 })}>
        {world}
      </Shot>
    </>
  );
};

// ---------- Сцена 2: задержка (14–30 с) ----------
const COL0: Placement = { x: 1300, y: 1820, h: 1150 };
export const DelayScene: React.FC = () => {
  const f = useCurrentFrame();
  const momMouth = useMouth("mother");
  const colMouth = useMouth("colleague");
  // часы: обычный ход, на плане D — быстрый (время уходит)
  const clock = keys(f, [[0, T_START + 6], [300, T_START + 8], [375, T_START + 33], [480, T_START + 36]]);
  const colPos = (t: number): Placement => ({ ...COL0, x: keys(t, [[0, 1300], [42, COLLEAGUE_STOP]]) });
  const col = colPos(f);
  const colWalk = walkOf(colPos, 0, f);
  // мама стоит с сумкой, ставит её на стол на своей реплике и садится
  const putAt = 186;
  const bagHand = reach(MOM, "mom", 1, BAG.x, BAG.y - 6 * BAG_K, 0);
  const sit = keys(f, [[0, 0], [196, 0], [228, 1]]);
  const armR = armKeys(f, [
    [0, [-40, 470]],
    [160, [-40, 470]],
    [putAt, bagHand],
    [200, bagHand],
    [226, typing(f, 1, 0)],
    [480, typing(f, 1, 0)],
  ]);
  const armRTyping = f >= 228 ? typing(f, 1, 1) : armR;
  const armL = f >= 228 ? typing(f, -1, 1) : armKeys(f, [[0, ARM.relaxed], [196, ARM.relaxed], [226, typing(f, -1, 0)]]);
  const holding = f < putAt;
  const look = keys(f, [[0, -0.6], [20, 0.6], [40, 1], [180, 1], [190, 0.3], [228, 0], [380, 0], [392, 0.9], [420, 0.9], [432, 0]]);
  const lookY = keys(f, [[0, 0], [176, 0], [186, 0.7], [204, 0], [228, 0.7], [376, 0.7], [386, -0.6], [418, -0.6], [430, 0.7]]);
  const turn = keys(f, [[0, -0.3], [30, 0.4], [190, 0.4], [228, 0], [380, 0], [392, 0.35], [420, 0.35], [432, 0]]);
  const colArmR = armKeys(f, [[0, [-40, 470]], [440, [-40, 470]]]);
  const colArmL = armKeys(f, [[0, ARM.down], [228, ARM.down], [250, reach(col, "colleague", -1, 700, 1150)], [480, reach(col, "colleague", -1, 700, 1150)]]);
  const progress = keys(f, [[0, 0.15], [228, 0.18], [300, 0.32], [480, 0.45]]);

  const world = (
    <>
      <OfficeRoom clockMinutes={clock} />
      <Actor
        at={MOM}
        kind="mom"
        sit={sit}
        expr={exprKeys(f, [[0, "neutral"], [146, "apologetic"], [224, "focused"], [376, "worried"]])}
        mouth={momMouth}
        look={look}
        lookY={lookY}
        turn={turn}
        armL={armL}
        armR={armRTyping}
        itemR={holding ? "handbag" : "none"}
        watchL
        seed={1}
      />
      <WorkDesk x={DESK.x} y={DESK.y} monitorX={480} screen={deskScreen(progress, f > 228 ? Math.floor(progress * 6) : -1)}>
        <Keyboard />
        <Mug x={60} />
        <DeskPhone x={PHONE_ON_DESK.x - DESK.x} y={PHONE_ON_DESK.y - DESK.y} />
      </WorkDesk>
      {!holding ? <BagOnDesk x={BAG.x} y={BAG.y} k={BAG_K} /> : null}
      <Actor
        at={col}
        kind="colleague"
        {...colWalk}
        expr={exprKeys(f, [[0, "smile"], [136, "focused"]])}
        mouth={colMouth}
        look={f < 228 ? -1 : -0.6}
        turn={-0.4}
        armL={colArmL}
        armR={colArmR}
        itemR="folder"
        seed={4}
      />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={135} cam={camMove(f, 0, 135, { x: 640, y: 1090, scale: 1.12 }, { x: 640, y: 1080, scale: 1.18 })}>
        {world}
      </Shot>
      <Shot f={f} from={135} to={228} cam={camMove(f, 135, 228, { x: 360, y: 1110, scale: 1.7 }, { x: 370, y: 1130, scale: 1.66 })}>
        {world}
      </Shot>
      {/* монитор крупно: работа затягивается */}
      <Shot f={f} from={228} to={300} cam={camMove(f, 228, 300, { x: 630, y: 1200, scale: 2.6 }, { x: 630, y: 1200, scale: 2.7 })}>
        {world}
      </Shot>
      {/* часы крупно: стрелки бегут */}
      <Shot f={f} from={300} to={375} cam={camMove(f, 300, 375, { x: 875, y: 380, scale: 3.1 }, { x: 875, y: 380, scale: 3.3 })}>
        {world}
      </Shot>
      {/* лицо мамы: беспокойный взгляд на часы */}
      <Shot f={f} from={375} to={435} cam={camMove(f, 375, 435, { x: 300, y: 1030, scale: 2.9 }, { x: 300, y: 1030, scale: 3.05 })}>
        {world}
      </Shot>
      <Shot f={f} from={435} to={480} cam={{ x: 600, y: 1080, scale: 1.15 }}>
        {world}
      </Shot>
    </>
  );
};

// ---------- Сцена 6: снова в офисе (82–95 с) ----------
export const T_BACK = 14 * 60 + 8;
export const BackScene: React.FC = () => {
  const f = useCurrentFrame();
  const clock = T_BACK + f / 30 / 60 * 2;
  // A: заходит с сумкой на плече (другой ракурс: стол справа)
  const enterPos = (t: number): Placement => ({ x: keys(t, [[0, -160], [96, 300]]), y: 1800, h: 1150 });
  const enterWalk = walkOf(enterPos, 0, f);
  const sit = keys(f, [[0, 0], [296, 0], [330, 1]]);
  const exhale = keys(f, [[330, 0], [352, 1], [390, 0.7]]);
  const eyes = keys(f, [[340, 0], [350, 1], [372, 1], [382, 0]]);
  const shake = f >= 126 && f < 150 ? Math.sin(f * 2.4) * 4 : 0;
  const armsDown: Arm = reach(MOM, "mom", -1, 200, 1334, 1);
  const enter = (
    <>
      <OfficeRoom clockMinutes={clock} />
      <WorkDesk x={560} y={DESK.y} w={600} monitorX={180} screen={deskScreen(0.45)}>
        <Mug x={40} />
      </WorkDesk>
      <Actor at={enterPos(f)} kind="mom" {...enterWalk} expr="tired" look={0.6} bag seed={1} />
    </>
  );
  const seated = (
    <>
      <OfficeRoom clockMinutes={clock} />
      <Actor
        at={MOM}
        kind="mom"
        sit={sit}
        expr="tired"
        look={keys(f, [[290, 0.6], [330, 0]])}
        lookY={keys(f, [[290, 0.4], [330, 0.2]])}
        shoulders={exhale}
        eyesClosed={eyes}
        headTilt={exhale * 3}
        armL={sit > 0.5 ? armKeys(f, [[300, ARM.relaxed], [330, armsDown]]) : ARM.relaxed}
        armR={sit > 0.5 ? armKeys(f, [[300, ARM.relaxed], [330, reach(MOM, "mom", 1, 400, 1334, 1)]]) : ARM.relaxed}
        watchL
        seed={1}
      />
      <WorkDesk x={DESK.x} y={DESK.y} monitorX={480} screen={deskScreen(0.45, 3)}>
        <Keyboard />
        <Mug x={60} />
        <DeskPhone x={PHONE_ON_DESK.x - DESK.x} y={PHONE_ON_DESK.y - DESK.y} lit={keys(f, [[109, 0], [113, 1], [207, 1], [213, 0]])} shake={shake} />
      </WorkDesk>
      <BagOnDesk x={BAG.x} y={BAG.y} k={BAG_K} />
    </>
  );
  const noMom = (
    <>
      <OfficeRoom clockMinutes={clock} />
      <WorkDesk x={DESK.x} y={DESK.y} monitorX={480} screen={deskScreen(0.45, 3)}>
        <Keyboard />
        <Mug x={60} />
        <DeskPhone x={PHONE_ON_DESK.x - DESK.x} y={PHONE_ON_DESK.y - DESK.y} />
      </WorkDesk>
      <BagOnDesk x={BAG.x} y={BAG.y} k={BAG_K} />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={110} cam={camMove(f, 0, 110, { x: 420, y: 1090, scale: 1.08 }, { x: 460, y: 1090, scale: 1.14 })}>
        {enter}
      </Shot>
      {/* пропущенные рабочие звонки */}
      <Shot
        f={f}
        from={110}
        to={200}
        cam={{ x: 540, y: 960, scale: 1 }}
        overlay={
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#DDE3EB" }}>
            <Phone w={700} shake={shake * 0.3} style={{ left: 190, top: 250 }}>
              <MissedCallsScreen appear={f - 112} />
            </Phone>
          </div>
        }
      >
        {seated}
      </Shot>
      {/* незаконченный отчёт и часы: «жарым саат» заняло почти два часа */}
      <Shot
        f={f}
        from={200}
        to={290}
        cam={camMove(f, 200, 290, { x: 760, y: 770, scale: 1.55 }, { x: 760, y: 760, scale: 1.6 })}
        overlay={<Caption text="«Жарым саат» — 1 саат 54 мүнөт" frame={f} at={214} out={276} size={56} top={1180} />}
      >
        {noMom}
      </Shot>
      <Shot f={f} from={290} to={390} cam={camMove(f, 290, 390, { x: 330, y: 1110, scale: 1.75 }, { x: 320, y: 1110, scale: 1.9 })}>
        {seated}
      </Shot>
    </>
  );
};

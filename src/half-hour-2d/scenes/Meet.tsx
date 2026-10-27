import { useCurrentFrame } from "remotion";
import { ARM, armKeys, CHILD_ARM, type Arm, exprKeys } from "../Character";
import { useMouth } from "../context";
import { Actor, reach, walkOf, type Placement } from "../rig";
import { HH2_TEXT } from "../script";
import { BenchBack, SchoolYard, Tree } from "../sets2";
import { camMove, Shot } from "../shots";
import { keys } from "../ui";
import { BENCH, SON_SIT, TEACHER_SIT } from "./Road";

// Мама садится на скамейку рядом с сыном (на место учительницы).
const MOM_SIT: Placement = { x: 400, y: 1800, h: 1000 };

// ---------- Сцена 5: встреча (63–82 с) ----------
export const MeetScene: React.FC = () => {
  const f = useCurrentFrame();
  const momMouth = useMouth("mother");
  const sonMouth = useMouth("son");
  // мама подходит; учительница встаёт и, кивнув, уходит
  const arrivePos = (t: number): Placement => ({ x: keys(t, [[0, -220], [52, 200]]), y: 1800, h: 1000 });
  const arriveWalk = walkOf(arrivePos, 0, f);
  const teacherSit = keys(f, [[24, 1], [52, 0]]);
  // учительница встаёт, прощается и уходит влево за маму — из кадра сына
  // она выходит сразу, не проходя между мамой и сыном
  const teacherPos = (t: number): Placement => ({
    ...TEACHER_SIT,
    x: keys(t, [[84, TEACHER_SIT.x], [200, -450]], (u) => u * u * 0.5 + u * 0.5),
  });
  const teacherWalk = walkOf(teacherPos, 84, f);
  const teacherNod = keys(f, [[70, 0], [78, 5], [88, 0]]);
  const momNod = keys(f, [[66, 0], [74, 5], [84, 0]]);
  // сын встаёт навстречу маме, потом снова садится (между планами)
  const sonSit = f < 360 ? keys(f, [[30, 1], [56, 0]]) : 1;
  const son: Placement = SON_SIT;
  // посадка мамы рядом и рука на плече
  const momSit = keys(f, [[372, 0], [402, 1]]);
  const shoulder = { x: son.x - 0.2 * son.h + 128 * (son.h / 1000), y: son.y - 0.975 * son.h + (330 + 150) * (son.h / 1000) };
  const onShoulder = reach({ ...MOM_SIT }, "mom", 1, shoulder.x, shoulder.y, 1);
  const lapR = reach(MOM_SIT, "mom", 1, MOM_SIT.x + 40, 1590, 1);
  const momArmR: Arm = armKeys(f, [
    [360, ARM.relaxed],
    [372, ARM.relaxed],
    [402, lapR],
    [418, lapR],
    [446, onShoulder],
    [570, onShoulder],
  ]);
  const momArmL: Arm = f >= 372 ? armKeys(f, [[372, ARM.relaxed], [402, reach(MOM_SIT, "mom", -1, MOM_SIT.x - 30, 1600, 1)]]) : ARM.relaxed;
  const sonLookD = keys(f, [[360, 0.5], [420, 0.5], [440, -0.9], [570, -0.9]]);
  const sonTilt = keys(f, [[500, 0], [530, -4]]);
  const world = (
    <>
      <SchoolYard label={HH2_TEXT.school} afternoon={0.45} />
      <Tree x={980} y={1420} s={1.05} />
      <BenchBack x={BENCH.x} y={BENCH.y} w={BENCH.w} />
      {f < 230 ? (
        <Actor
          at={teacherPos(f)}
          kind="teacher"
          sit={teacherSit}
          {...teacherWalk}
          legs={teacherSit === 0 ? teacherWalk.legs : "stand"}
          expr="smile"
          look={teacherWalk.walkAmount > 0.3 ? -0.6 : -0.8}
          headTilt={teacherNod}
          armL={[-40, 500]}
          armR={ARM.relaxed}
          seed={5}
        />
      ) : null}
      {f < 360 ? (
        <>
          <Actor
            at={son}
            kind="son"
            sit={sonSit}
            expr="sad"
            mouth={sonMouth}
            look={keys(f, [[0, 0], [20, -0.9], [240, -0.9], [254, -0.6]])}
            lookY={keys(f, [[100, 0], [130, 0.6], [150, 0.6], [176, -0.2]])}
            armL={CHILD_ARM.down}
            armR={CHILD_ARM.down}
            backpack
            seed={2}
          />
          <Actor
            at={arrivePos(f)}
            kind="mom"
            {...arriveWalk}
            expr={exprKeys(f, [[0, "worried"], [56, "apologetic"]])}
            mouth={momMouth}
            look={keys(f, [[0, 0.8], [60, 0.8], [64, 1], [92, 1], [100, 0.7]])}
            lookY={keys(f, [[240, 0.3], [280, 0.6], [330, 0.8]])}
            headTilt={momNod}
            bag
            seed={1}
          />
        </>
      ) : (
        <>
          <Actor
            at={son}
            kind="son"
            sit={1}
            expr={exprKeys(f, [[0, "sad"], [494, "calm"]], 12)}
            look={sonLookD}
            lookY={keys(f, [[360, 0.7], [430, 0.7], [446, 0]])}
            headTilt={sonTilt}
            armL={CHILD_ARM.lap}
            armR={CHILD_ARM.lap}
            backpack
            seed={2}
          />
          <Actor
            at={MOM_SIT}
            kind="mom"
            sit={momSit}
            expr={exprKeys(f, [[0, "apologetic"], [494, "calm"]], 12)}
            mouth={momMouth}
            look={0.9}
            turn={0.4}
            headTilt={keys(f, [[420, 0], [440, 3]])}
            armL={momArmL}
            armR={momArmR}
            elbowDownR={f >= 418}
            bag
            seed={1}
          />
        </>
      )}
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={100} cam={camMove(f, 0, 100, { x: 480, y: 1250, scale: 1.12 }, { x: 460, y: 1260, scale: 1.18 })}>
        {world}
      </Shot>
      {/* сын крупно: вопрос без истерики */}
      <Shot f={f} from={100} to={270} cam={camMove(f, 100, 270, { x: 610, y: 1300, scale: 2.4 }, { x: 610, y: 1300, scale: 2.55 })}>
        {world}
      </Shot>
      {/* мама крупно: пауза, взгляд вниз */}
      <Shot f={f} from={270} to={360} cam={camMove(f, 270, 360, { x: 200, y: 1060, scale: 2.4 }, { x: 200, y: 1070, scale: 2.5 })}>
        {world}
      </Shot>
      {/* садится рядом, рука на плече */}
      <Shot f={f} from={360} to={570} cam={camMove(f, 360, 570, { x: 500, y: 1360, scale: 1.6 }, { x: 510, y: 1390, scale: 1.85 })}>
        {world}
      </Shot>
    </>
  );
};

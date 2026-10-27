// S06 · Вопрос на три дня.
//
// 6A — тот же средний двухплан за ужином, что в конце S05 (папа слева,
//      мама справа). «Ооба.» — мама кивает папе; на «Ушул…» её правая
//      кисть берёт школьное расписание за край и подвигает его по
//      скатерти к папе, лист поворачивается к нему (контакт → перенос →
//      кисть отпускает и возвращается).
// 6B — вставка сверху: лист крупно на скатерти, три дня поездки выделены,
//      школьные отметки видны; под тремя столбцами прорисовывается скобка
//      и плашка «Үч күн» (один акцент). Палец мамы касается края листа.
// 6C — снова двухплан: папа смотрит на отметки, затем поднимает взгляд на
//      маму. Тёплый спокойный свет, без вздохов.
import { useScene, usePlan, Shot, Svg, camKeys, camMove, useInk, DrawArrow } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, keysV, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { Bowl, Cup, KitchenBack, KitchenChair, KitchenTable, KitchenTableTop, PhoneFlat, SheetOnTable, SpoonFlat, Teapot } from "../sets/Kitchen";
import { ScheduleSheet } from "../props/Calendar";
import { CloseHand, SKIN } from "../props/CloseHand";
import { Pill } from "../props/Cards";
import { SD2_TEXT } from "../script";
import { exprKeys, LIGHT_SURPRISE, restArm, SEAT_DAD, SEAT_MOM, TWO, WARM } from "./S05Dinner";
import type { Sd2SfxPlan } from "../sfx";

export const threePlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "three");
  const ushul = T.word("M03", "ушул");
  const uch = T.word("M03", "үч");
  return {
    len: T.len,
    ooba: T.from("M03"),
    grab: ushul - 4, // кисть у края листа
    slideEnd: ushul + 16, // лист у папы
    release: ushul + 22,
    insert: uch - 6, // вставка сверху
    back: Math.min(T.word("M03", "кетерин"), T.len - 46), // снова двухплан
    end: T.to("M03"),
  };
};
type Plan = ReturnType<typeof threePlan>;

// Лист расписания на скатерти: от мамы к папе.
const SHEET_FROM: Vec = { x: TWO.sheet0.x, y: TWO.sheet0.y };
const SHEET_TO: Vec = { x: 628, y: 1198 };

const TwoShot: React.FC<{ f: number; p: Plan; len: number }> = ({ f, p, len }) => {
  const slide = easeInOut((f - p.grab) / (p.slideEnd - p.grab));
  const sheet = { x: SHEET_FROM.x + (SHEET_TO.x - SHEET_FROM.x) * slide, y: SHEET_FROM.y + (SHEET_TO.y - SHEET_FROM.y) * slide };
  const rot = -6 + 16 * slide; // поворачивается к папе
  // правая кисть мамы (справа на экране): к листу → толкает → отпускает
  const momHand = (t: number): Vec =>
    keysV(t, [
      [0, restArm(TWO.mom, SEAT_MOM, 1).target],
      [p.grab, { x: SHEET_FROM.x + 30, y: SHEET_FROM.y - 6 }],
      [p.slideEnd, { x: SHEET_TO.x + 34, y: SHEET_TO.y - 6 }],
      [p.release + 14, restArm(TWO.mom, SEAT_MOM, 1, 30).target],
    ]);
  const momFace = (t: number) => keys(t, [[0, -0.5], [p.grab - 4, -0.42], [p.slideEnd, -0.5], [len, -0.52]]);
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_MOM,
    expr: exprKeys(t, [[0, EXPR.calm], [p.ooba + 12, EXPR.calm], [p.end, WARM]]),
    lookY: keys(t, [[0, 0.08], [p.grab - 6, 0.08], [p.grab + 2, 0.45], [p.slideEnd + 6, 0.4], [p.slideEnd + 18, 0.08]]),
    nod: keys(t, [[p.ooba, 0], [p.ooba + 6, 5], [p.ooba + 14, 0]]),
    lean: keys(t, [[p.grab - 8, 0], [p.grab + 6, 7], [p.release + 10, 0]]),
    armL: restArm(TWO.mom, SEAT_MOM, -1),
    armR: {
      target: momHand(t),
      shape: t >= p.grab - 2 && t < p.release ? "open" : "relax",
      elbow: t >= p.grab - 10 && t < p.release + 8 ? "down" : "hang",
      behind: false,
    },
  });
  // папа: слушает маму, взгляд следует за листом, потом — на маму
  const dadFace = (t: number) => keys(t, [[0, 0.5], [p.slideEnd - 6, 0.48], [p.slideEnd + 6, 0.3], [p.back + 10, 0.3], [p.back + 26, 0.52]]);
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_DAD,
    expr: exprKeys(t, [[0, LIGHT_SURPRISE], [p.ooba + 20, EXPR.calm], [p.back + 26, EXPR.calm], [p.end + 10, EXPR.softSmile]]),
    lookY: keys(t, [[0, 0.04], [p.slideEnd - 8, 0.08], [p.slideEnd + 4, 0.55], [p.back + 10, 0.55], [p.back + 24, 0.06]]),
    nod: keys(t, [[p.slideEnd, 0], [p.slideEnd + 8, 6], [p.back + 12, 6], [p.back + 24, 1]]),
    lean: keys(t, [[p.slideEnd, 0], [p.slideEnd + 12, 5], [p.back + 20, 2]]),
    armL: restArm(TWO.dad, SEAT_DAD, -1),
    armR: restArm(TWO.dad, SEAT_DAD, 1, 4),
  });
  const cam =
    f < p.insert
      ? camMove(f, 0, p.insert, { x: 646, y: 998, zoom: 1.84 }, { x: 644, y: 1004, zoom: 1.88 })
      : camKeys(f, [
          [p.back, { x: 620, y: 1004, zoom: 1.86 }],
          [len, { x: 612, y: 1000, zoom: 1.92 }],
        ]);
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="s06-dad" look="dadHome" f={f} place={() => TWO.dad} face={dadFace} pose={dadPose} role="father" seed={2} blinkShift={11} layer={layer} />
      <Actor uid="s06-mom" look="momHome" f={f} place={() => TWO.mom} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />
    </>
  );
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={C.warmLight}>
      <KitchenBack ink={ink} uid="s06-k" />
      <Svg>
        <KitchenChair x={TWO.dad.x} ink={ink} />
        <KitchenChair x={TWO.mom.x} ink={ink} />
      </Svg>
      {actors("body")}
      <KitchenTable ink={ink} uid="s06-kt" />
      <Svg>
        <Teapot cx={540} y={1158} s={56} ink={ink * 0.8} />
        <Cup cx={566} y={1214} w={34} ink={ink * 0.7} />
        <Bowl cx={TWO.dadBowl} y={1190} w={86} ink={ink * 0.8} />
        <Bowl cx={TWO.momBowl} y={1190} w={84} ink={ink * 0.8} />
        <SpoonFlat x={698} y={1209} len={44} ink={ink * 0.7} dir={1} />
        <PhoneFlat cx={890} y={1216} w={32} ink={ink * 0.8} color="#6B5A55" />
        <SheetOnTable cx={sheet.x} cy={sheet.y} w={110} rot={rot} ink={ink * 0.5} hi={[0, 1, 1, 1, 0]} />
      </Svg>
      {actors("arms")}
    </Shot>
  );
};

// Вставка сверху: тот же лист крупно.
const SH = { x: 150, y: 560, w: 780, h: 560 };
const Insert: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const t = f - p.insert;
  // три столбца поездки (1…3) — их общий низ и середина
  const colW = (SH.w - SH.w * 0.08) / 5;
  const gx = SH.x + SH.w * 0.04;
  const x1 = gx + colW * 1 + 8;
  const x2 = gx + colW * 4 - 8;
  const by = SH.y + SH.h + 34;
  const pill = clamp((t - 22) / 8);
  // палец мамы касается края листа справа (контакт, без движения листа)
  const hand = keysV(t, [
    [0, { x: 1040, y: 1240 }],
    [12, { x: 900, y: 1140 }],
    [200, { x: 896, y: 1138 }],
  ]);
  return (
    <>
      <KitchenTableTop ink={ink} uid="s06-tt" />
      <Svg>
        <g transform={`rotate(4 ${SH.x + SH.w / 2} ${SH.y + SH.h / 2})`}>
          <rect x={SH.x + 10} y={SH.y + 16} width={SH.w} height={SH.h} rx={12} fill={C.shadow} />
          <ScheduleSheet x={SH.x} y={SH.y} w={SH.w} h={SH.h} ink={ink} hi={[0, 1, 1, 1, 0]} />
          {/* скобка под тремя днями и плашка «Үч күн» */}
          <DrawArrow pts={[[x1, by - 22], [x1, by], [x2, by], [x2, by - 22]]} t={t - 8} dur={14} color={C.yellowDeep} width={ink * 1.3} head={false} />
          <g opacity={pill} transform={`translate(0 ${(1 - pill) * 12})`}>
            <Pill cx={(x1 + x2) / 2} cy={by + 58} text={SD2_TEXT.threeDays} size={52} ink={ink} />
          </g>
        </g>
        <CloseHand x={hand.x} y={hand.y} angle={128} size={150} look={SKIN.mom} shape="point" armLen={7} ink={ink} />
      </Svg>
    </>
  );
};

export const S06Three: React.FC = () => {
  const { f, len } = useScene("three");
  const p = usePlan(threePlan);
  if (f >= p.insert && f < p.back) {
    return (
      <Shot f={f} cam={{ x: 540, y: 930 + (f - p.insert) * 0.25, zoom: 1 + clamp((f - p.insert) / (p.back - p.insert)) * 0.04 }} tint={C.warmLight}>
        <Insert f={f} p={p} />
      </Shot>
    );
  }
  return <TwoShot f={f} p={p} len={len} />;
};

// Звук: лист скользит по скатерти.
export const sfxS06Three: Sd2SfxPlan = (tl) => {
  const p = threePlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.grab + 2, kind: "paper", volume: 0.2 },
  ];
};

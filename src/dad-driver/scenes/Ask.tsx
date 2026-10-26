// Сцена 3. Папин вопрос (VO03).
// Три четверти на уровне глаз ребёнка: папа сел рядом, наклонился к сыну,
// переводит взгляд с анкеты на сына и с улыбкой спрашивает; сын
// поворачивается к нему. Анкета на столе видна. Заголовков поверх лиц нет.
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame } from "../context";
import { C, Vignette } from "../kit";
import { easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { Bodies, FAM, SEAT, TableForm, TFORM, type ActorSpec, type FormPlace } from "./HomeKit";
import { restOnTable } from "./common";

// Лист — там же, где мама оставила его в сцене 2.
export const FORM_ON_TABLE: FormPlace = { ...TFORM, x: 690, y: 1258, rot: -4 };

export const AskScene: React.FC = () => {
  const t = useSceneFrame();
  const q = useCue("vo03");
  const look = q.from - 8; // взгляд с листа на сына перед вопросом
  const cast: ActorSpec[] = [
    {
      id: "ask-mom",
      look: "mom",
      f: t,
      place: () => FAM.mom,
      face: () => 0.45,
      seed: 81,
      pose: () => ({ expr: EXPR.softSmile, sit: 1, seat: SEAT.mom, lookY: 0.3, lookX: 0.4, armL: restOnTable(FAM.mom, -1), armR: restOnTable(FAM.mom, 1) }),
    },
    {
      id: "ask-son",
      look: "son",
      f: t,
      place: () => FAM.son,
      face: (f) => keys(f, [[q.from - 4, 0.2], [q.from + 8, 0.58]]),
      role: "son",
      seed: 82,
      pose: (f) => ({
        expr: mixExpr(EXPR.calm, { browIn: 3, browOut: 4, lid: 0.04, smile: 0.2 }, easeInOut((f - q.from) / 12)),
        sit: 1,
        seat: SEAT.son,
        lookY: keys(f, [[q.from - 4, 0.5], [q.from + 8, -0.35]]),
        lookX: 0.3,
        armL: restOnTable(FAM.son, -1, 0.08),
        armR: restOnTable(FAM.son, 1, 0.08),
      }),
    },
    {
      id: "ask-dad",
      look: "dad",
      f: t,
      place: () => FAM.dad,
      face: () => -0.5,
      role: "father",
      seed: 83,
      pose: (f) => ({
        expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - q.from) / 16) * 0.7),
        sit: 1,
        seat: SEAT.dad,
        lean: lerp(4, 10, easeInOut((f - (look - 6)) / 14)),
        lookY: keys(f, [[look, 0.65], [look + 8, 0.35]]),
        lookX: keys(f, [[look, -0.1], [look + 8, -0.35]]),
        nod: keys(f, [[q.to - 10, 0], [q.to - 2, 5], [q.to + 8, 0]]),
        headTilt: -3,
        armL: { ...restOnTable(FAM.dad, -1, 0.17) },
        armR: restOnTable(FAM.dad, 1),
      }),
    },
  ];
  const cam = { x: 860, y: 1085, zoom: lerp(1.95, 2.04, easeInOut(t / 90)) };
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <Shot f={t} from={-30} to={99999} cam={cam} bg={C.wall}>
        <HomeRoom t={t} />
        <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
        <Bodies cast={cast} layer="body" />
        <HomeTable />
        <TableForm s={{ dad: 1 }} f={FORM_ON_TABLE} />
        <Bodies cast={cast} layer="arms" />
        <Vignette strength={0.25} />
      </Shot>
    </AbsoluteFill>
  );
};

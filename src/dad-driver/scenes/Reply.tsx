// Сцена 5. Тёплый ответ и комплимент (VO05 папа, VO06 сын).
// План А — двое за столом: папа с короткой улыбкой соглашается (без
// оправданий). План Б — ближе к сыну: он смотрит на папу снизу вверх и
// искренне говорит, что любит ездить с ним. План В — реакция папы: улыбка
// теплеет, взгляд мягче, лёгкий наклон головы, медленное моргание.
// Графика спокойная: только субтитры и короткая плашка «СЕНИ МЕНЕН».
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame, wordAt } from "../context";
import { C, Chip, Vignette } from "../kit";
import { easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import { FORM_ON_TABLE } from "./Ask";
import { Bodies, FAM, SEAT, TableForm, type ActorSpec } from "./HomeKit";
import { restOnTable } from "./common";

export const ReplyScene: React.FC = () => {
  const t = useSceneFrame();
  const a = useCue("vo05");
  const s = useCue("vo06");
  const cutB = Math.round((a.to + s.from) / 2);
  const cutC = Math.round(s.to + 4);
  const warm = (f: number) => easeInOut((f - cutC) / 22);
  const cast: ActorSpec[] = [
    {
      id: "rp-mom",
      look: "mom",
      f: t,
      place: () => FAM.mom,
      face: () => 0.45,
      seed: 84,
      pose: () => ({ expr: EXPR.softSmile, sit: 1, seat: SEAT.mom, lookY: 0.25, lookX: 0.45, armL: restOnTable(FAM.mom, -1), armR: restOnTable(FAM.mom, 1) }),
    },
    {
      id: "rp-son",
      look: "son",
      f: t,
      place: () => FAM.son,
      face: () => 0.55,
      role: "son",
      seed: 85,
      pose: (f) => ({
        expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - wordAt(s, 7)) / 12)),
        sit: 1,
        seat: SEAT.son,
        lean: keys(f, [[s.from - 6, 2], [s.from + 8, 6]]),
        lookY: -0.45,
        lookX: 0.35,
        headTilt: keys(f, [[wordAt(s, 4), 0], [wordAt(s, 4) + 12, 4]]),
        armL: restOnTable(FAM.son, -1, 0.08),
        armR: restOnTable(FAM.son, 1, 0.08),
      }),
    },
    {
      id: "rp-dad",
      look: "dad",
      f: t,
      place: () => FAM.dad,
      face: () => -0.5,
      role: "father",
      seed: 86,
      blinks: [cutC + 18],
      pose: (f) => ({
        expr: mixExpr(mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - a.from) / 10) * 0.8), { browIn: 4, browOut: 2, lid: 0.22, smile: 0.95 }, warm(f)),
        sit: 1,
        seat: SEAT.dad,
        lean: 7,
        lookY: 0.4,
        lookX: -0.35,
        headTilt: lerp(-2, -7, warm(f)),
        nod: keys(f, [[a.to - 8, 0], [a.to, 4], [a.to + 10, 0]]),
        armL: restOnTable(FAM.dad, -1, 0.17),
        armR: restOnTable(FAM.dad, 1),
      }),
    },
  ];
  // планы: двое → сын ближе → реакция папы
  const cam =
    t < cutB
      ? { x: 860, y: 1080, zoom: lerp(1.9, 1.96, easeInOut(t / cutB)) }
      : t < cutC
        ? { x: 780, y: 1060, zoom: lerp(2.7, 2.8, easeInOut((t - cutB) / (cutC - cutB))) }
        : { x: 965, y: 990, zoom: lerp(2.75, 2.88, easeInOut((t - cutC) / 50)) };
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
      <Chip x={540} y={330} t={t} at={wordAt(s, 4) - 2} out={cutC + 30} accent={C.yellow} size={50} variant="light">
        <span>{DD_TEXT.reply.accent}</span>
      </Chip>
    </AbsoluteFill>
  );
};

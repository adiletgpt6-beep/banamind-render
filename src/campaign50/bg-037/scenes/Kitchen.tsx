// Кухня семьи (сцены 1, 2 и конец 5). Один и тот же мир и одни и те же
// координаты предметов во всех планах.
//   1. Мама стоит у своего стула и уже протягивает банковскую карту к
//      конверту «Төлөм»: «BalaGo'го катталганда эле төлөшүм керекпи?».
//      Камера плавно подъезжает к её нерешительному лицу.
//   2. Мама садится напротив папы. Папа откладывает «Арыз» и «Төлөм» на
//      край стола, раскладывает три конверта «Топ», «Сыноо», «Чечим» и
//      сам читает лист «Шарттар». Мама бережно убирает руку с картой и
//      кладёт карту на стол. Камера — к первому конверту «Топ».
//   5 (конец). Родители спокойно кивают: решение — после пробы.
import { useCurrentFrame } from "remotion";
import { BG37_TEXT, BG37_VIDEO } from "../script";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, keys, keysV, type Vec } from "../rig/motion";
import { ChairBack, HOME, HomeBack, TableFront, Teapot } from "../sets/Home";
import { camMove, Shot, type Cam } from "../shots";
import { BankCardOnTable, ENV, EnvelopeSide, LetterOnTable, PAPER } from "../props";
import { H, onTable, restOnTable, seated, seatOf, sitDown } from "./common";
import type { Bg37Beats } from "../beats";

const FPS = BG37_VIDEO.fps;
const F = (sec: number) => Math.round(sec * FPS);

// Места за столом: папа слева, мама справа — напротив друг друга.
const DAD_X = 760;
const MOM_X = 1250;
// Предметы на столешнице.
const ENV_X = [905, 1035, 1165]; // «Топ», «Сыноо», «Чечим»
const SIDE_STACK = { x: 1372 }; // «Арыз» и «Төлөм» отложены на край
const HOOK_ENV = { apply: 1010, pay: 1150 };
const LETTER_X = 700;
const CARD_SPOT = onTable(MOM_X + 70, 4);

export const kitchenLayout = { DAD_X, MOM_X, ENV_X } as const;

export const Kitchen: React.FC<{ readonly b: Bg37Beats; readonly part: "intro" | "outro" }> = ({ b, part }) => {
  const f = useCurrentFrame();
  const r = b.rules;
  const dad = seated("dad", DAD_X);
  const momSeat = seated("mom", MOM_X);

  // ---------- мама ----------
  const sitAt = F(r.sit);
  const momPlace = (): Place => momSeat;
  const cardDown = F(r.withdraw) + 14; // карта легла на стол
  const momPose = (t: number): PoseIn => {
    const sd = sitDown(t, sitAt, 30);
    const p = momSeat;
    const sitting = t >= sitAt;
    // протянутая к конверту «Төлөм» рука (слишком рано)
    const reachStand: Vec = { x: p.x - 0.36 * p.h, y: p.y - 0.62 * p.h };
    const reachSit: Vec = { x: p.x - 0.33 * p.h, y: p.y - 0.47 * p.h };
    const holdLow: Vec = { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h };
    const armR =
      t < cardDown
        ? {
            target: keysV(
              t,
              [
                [0, onTable(MOM_X + 70, -4)],
                [F(b.hook.reach), onTable(MOM_X + 70, -4)],
                [F(b.hook.reach) + 16, reachStand],
                [sitAt, reachStand],
                [sitAt + 30, reachSit],
                [F(r.withdraw) - 6, reachSit],
                [cardDown, CARD_SPOT],
              ],
              anticipate,
            ),
            shape: "pinch" as const,
            item: "bankcard" as const,
            elbow: "down" as const,
            behind: false,
          }
        : { ...restOnTable(momSeat, 1), behind: false };
    const outro = part === "outro";
    return {
      expr: outro ? "smile" : t < F(r.withdraw) ? (t < F(b.hook.line.to) ? "worried" : "thinking") : "softSmile",
      sit: outro ? 1 : sd.sit,
      seat: seatOf(momSeat),
      lean: outro ? 0 : sitting ? sd.lean : 6,
      armR: outro ? { ...restOnTable(momSeat, 1), behind: false } : armR,
      armL: outro ? { ...restOnTable(momSeat, -1), behind: false } : t >= sitAt + 24 ? { ...restOnTable(momSeat, -1), behind: false } : { target: holdLow, shape: "relax", elbow: "down" },
      lookY: outro ? 0.1 : keys(t, [[0, 0.35], [F(b.hook.line.from), 0.1], [F(b.hook.line.to), 0.25], [sitAt + 30, 0.4], [F(r.read), 0.1]]),
      nod: outro ? keys(t, [[F(b.decide.kitchen) + 6, 0], [F(b.decide.kitchen) + 16, 5], [F(b.decide.kitchen) + 28, 0]]) : keys(t, [[F(r.withdraw) + 4, 0], [F(r.withdraw) + 14, 4], [F(r.withdraw) + 26, 0]]),
      headTilt: outro ? 3 : t < F(b.hook.line.to) ? -4 : 0,
    };
  };
  // стоя она чуть дальше от стола — тот же стул, до посадки
  const momStand = (t: number): Place => (t < sitAt + 8 ? { x: MOM_X + 18 * (1 - clamp((t - sitAt) / 8)), y: 1540, h: H.mom } : momPlace());
  const momFace = (t: number) => (part === "outro" ? -0.45 : keys(t, [[0, -0.25], [F(b.hook.line.to), -0.45], [F(r.read), -0.55], [F(r.push), -0.4]]));

  // ---------- папа ----------
  const envT = r.envs.map(F);
  const dadPose = (t: number): PoseIn => {
    const p = dad;
    const rest = restOnTable(dad, 1).target!;
    // правая рука: «Арыз»/«Төлөм» на край, затем три конверта по очереди
    const put = (k: number): Vec => onTable(ENV_X[k] - 10, -10);
    const pick: Vec = { x: p.x + 0.16 * p.h, y: p.y - 0.47 * p.h };
    const armRPts: (readonly [number, Vec])[] = [
      [0, rest],
      [envT[0] - 14, pick],
    ];
    envT.forEach((e, k) => {
      armRPts.push([e, put(k)]);
      armRPts.push([e + 6, put(k)]);
      if (k < 2) armRPts.push([envT[k + 1] - 4, pick]);
    });
    armRPts.push([envT[2] + 16, rest]);
    // указывает на «Топ» перед переходом
    armRPts.push([F(r.push) - 2, rest]);
    armRPts.push([F(r.push) + 12, onTable(ENV_X[0] - 30, -40)]);
    const outro = part === "outro";
    const holding = t >= envT[0] - 14 && t < envT[2] + 4 && !outro;
    const readNow = t >= F(r.read) - 8 && !outro;
    const sheetAt: Vec = { x: p.x + 0.2 * p.h, y: p.y - 0.47 * p.h };
    return {
      expr: outro ? "smile" : t < F(b.hook.line.to) + 6 ? "neutral" : readNow ? "calm" : "softSmile",
      sit: 1,
      seat: seatOf(dad),
      armR: outro
        ? { ...restOnTable(dad, 1), behind: false }
        : {
            target: keysV(t, armRPts, anticipate),
            shape: t >= F(r.push) ? ("point" as const) : holding ? ("pinch" as const) : ("relax" as const),
            item: holding ? ("card" as const) : ("none" as const),
            itemColor: ENV,
            elbow: "down" as const,
            behind: false,
          },
      armL: outro
        ? { ...restOnTable(dad, -1), behind: false }
        : {
            target: keysV(t, [[0, restOnTable(dad, -1).target!], [F(r.read) - 8, restOnTable(dad, -1).target!], [F(r.read) + 8, sheetAt], [F(r.push) - 10, sheetAt], [F(r.push) + 6, restOnTable(dad, -1).target!]], anticipate),
            shape: "pinch" as const,
            item: t >= F(r.read) - 2 && t < F(r.push) ? ("card" as const) : ("none" as const),
            itemColor: PAPER,
            elbow: "down" as const,
            behind: false,
          },
      lookY: outro ? 0.05 : t < envT[2] + 10 ? keys(t, [[0, 0.1], [envT[0] - 20, 0.45]]) : readNow && t < F(r.push) ? 0.35 : 0.3,
      nod: outro ? keys(t, [[F(b.decide.kitchen) + 14, 0], [F(b.decide.kitchen) + 24, 5], [F(b.decide.kitchen) + 36, 0]]) : keys(t, [[F(r.notTaxi), 0], [F(r.notTaxi) + 8, 3], [F(r.notTaxi) + 18, 0]]),
    };
  };
  const dadFace = (t: number) => (part === "outro" ? 0.45 : keys(t, [[0, 0.5], [envT[0] - 20, 0.25], [F(r.read), 0.15], [F(r.line.from) + 10, 0.4], [F(r.push), 0.2]]));

  // ---------- предметы ----------
  const envOn = (k: number) => (part === "outro" ? 1 : clamp((f - envT[k] + 1) / 2));
  const aside = part === "outro" ? 1 : clamp((f - (envT[0] - 26)) / 14);
  const cardOnTable = part === "outro" || f >= cardDown;

  const world = (
    <>
      <HomeBack minutes={18 * 60 + 40 + f / 60} />
      <ChairBack x={DAD_X} />
      <ChairBack x={MOM_X} />
      <Actor uid="k-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <Actor uid="k-mom" look="mom" f={f} place={momStand} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <TableFront />
      <Teapot x={585} y={HOME.table.top + 14} s={0.8} />
      <LetterOnTable x={LETTER_X} y={HOME.table.top + 22} label={BG37_TEXT.hook.letter} />
      {/* «Арыз» и «Төлөм»: в хуке посередине, затем отложены на край стола */}
      <EnvelopeSide x={keys(f, [[0, HOOK_ENV.apply], [1, HOOK_ENV.apply]]) * (1 - aside) + SIDE_STACK.x * aside} y={HOME.table.top + 22 - 8 * aside} label={BG37_TEXT.hook.envApply} w={150} rot={-3 * aside} />
      <EnvelopeSide
        x={HOOK_ENV.pay * (1 - aside) + SIDE_STACK.x * aside}
        y={HOME.table.top + 22 - 2 * aside}
        label={BG37_TEXT.hook.envPay}
        w={150}
        rot={4 * aside}
        glow={part === "intro" && f < sitAt ? 0.6 + 0.4 * Math.sin(f / 6) : 0}
      />
      {BG37_TEXT.rules.envelopes.map((label, k) =>
        envOn(k) > 0 ? (
          <EnvelopeSide
            key={label}
            x={ENV_X[k]}
            y={HOME.table.top + 24}
            lift={(1 - envOn(k)) * 20}
            label={label}
            w={128}
            glow={part === "intro" && f >= F(r.push) && k === 0 ? clamp((f - F(r.push)) / 12) : 0}
            open={part === "outro" ? 1 : 0}
          />
        ) : null,
      )}
      {cardOnTable ? <BankCardOnTable x={CARD_SPOT.x} y={CARD_SPOT.y + 8} /> : null}
      <Actor uid="k-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      <Actor uid="k-mom" look="mom" f={f} place={momStand} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
    </>
  );

  if (part === "outro") {
    const a = F(b.decide.kitchen);
    const e = F(b.decide.to);
    return (
      <Shot f={f} from={a} to={e + 1} cam={camMove(f, a, e, { x: 1000, y: 1060, zoom: 1.12 }, { x: 1005, y: 1040, zoom: 1.2 })}>
        {world}
      </Shot>
    );
  }
  // план 1 (хук): подъезд к лицу мамы; план 2: два родителя; план 3: к «Топ»
  const h0 = F(b.hook.from);
  const h1 = F(b.hook.insert);
  const r0 = F(r.from);
  const rp = F(r.push);
  const r1 = F(r.to);
  const hookCam = (): Cam => camMove(f, h0, h1, { x: 1120, y: 1080, zoom: 1.12 }, { x: 1240, y: 900, zoom: 1.75 });
  const twoShot: Cam = { x: 1010, y: 1060, zoom: 1.1 };
  const rulesCam = (): Cam =>
    f < rp
      ? camMove(f, r0, r0 + 40, { x: 1180, y: 960, zoom: 1.45 }, twoShot)
      : camMove(f, rp, r1, { x: twoShot.x, y: twoShot.y, zoom: twoShot.zoom }, { x: ENV_X[0], y: HOME.table.top - 10, zoom: 3.4 });
  return (
    <>
      <Shot f={f} from={h0} to={h1} cam={hookCam()}>
        {world}
      </Shot>
      <Shot f={f} from={r0} to={r1} cam={rulesCam()}>
        {world}
      </Shot>
    </>
  );
};

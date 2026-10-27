// S12 · Мама вернулась.
//
// 12A — прихожая: дверь открывается, мама в дорожном синем жакете входит с
//       чемоданом на колёсах и ставит его у двери (ручка убирается). Сын
//       выходит из своей комнаты навстречу, мама кладёт ладонь ему на плечо.
// 12B — тот же стол, что в S01 (рифма): раскрытый чемодан. Мама вынимает
//       свитер и кладёт рядом, сын достаёт косметичку и ставит на край
//       стола; под ней — синий шнурок (мягкое кольцо). Сын тянет за шнурок,
//       карточка поднимается оборотом к камере.
// 12C — двухплан: сын держит бейдж оборотом к себе, смотрит на маму —
//       «Карап көрсөм болобу?»; мама улыбается и кивает.
import { useScene, usePlan, Shot, Svg, camMove, camKeys, Ring } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, keysV, lerpV, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { HOME, HomeBack, HomeTable } from "../sets/Home";
import { SuitcaseFront } from "../props/Suitcase";
import { BadgeBack, KnitHeld, KnitLying, LanyardLoop, Pouch } from "../props/Things";
import { BADGE_RATIO } from "../props/Badge";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const backPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "back");
  const unpack = T.word("N12", "уулу") - 6;
  const badge = T.word("N12", "бейджин");
  return {
    len: T.len,
    door: 0,
    stop: T.word("N12", "эшиктин") - 4, // мама остановилась у двери
    set: T.word("N12", "койду") - 2, // чемодан поставлен, ручка убирается
    unpack,
    knit: unpack + 6, // мама берёт свитер
    knitDown: unpack + 44,
    pouch: unpack + 22, // сын берёт косметичку
    pouchDown: unpack + 60,
    notice: badge - 14, // взгляд на шнурок
    pull: badge,
    lifted: badge + 22,
    ask: T.from("C03") - 12, // двухплан
    askEnd: T.to("C03"),
  };
};
type Plan = ReturnType<typeof backPlan>;

// ---------- 12A: прихожая ----------
const SUIT_UP_W = 150;
const Arrive: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const doorOpen = easeInOut(f / 14) * (1 - easeInOut((f - p.stop - 10) / 16));
  const momX = (t: number) => keys(t, [[6, 1180], [p.stop, 846]]);
  const mom = (t: number) => ({ x: momX(t), y: HOME.floor + 6, h: H.mom * 0.97 });
  const handle = 1 - easeInOut((f - p.set) / 12);
  const suitX = (t: number) => momX(t) + 70; // левый край чемодана справа от мамы
  const sx = suitX(f);
  const suitH = SUIT_UP_W * 1.45;
  const grip: Vec = { x: sx + SUIT_UP_W / 2, y: HOME.floor + 6 - suitH - SUIT_UP_W * 0.9 * handle - 6 };
  const holding = f < p.set + 4;
  const sonX = (t: number) => keys(t, [[p.stop - 40, 210], [p.set - 4, 680]]);
  const son = (t: number) => ({ x: sonX(t), y: HOME.floor + 10, h: H.son });
  const touch = clamp((f - p.set - 8) / 10);
  const momPose = (t: number): PoseIn => ({
    expr: t > p.stop ? EXPR.smile : EXPR.softSmile,
    lookY: 0.08,
    armR: holding ? { target: grip, shape: "fist", elbow: "down" } : { target: null },
    armL: touch > 0 ? { target: lerpV({ x: mom(t).x - 60, y: HOME.floor - 330 }, { x: son(t).x + 40, y: son(t).y - H.son * 0.78 }, touch), shape: "open", elbow: "down" } : { target: null },
    bagOnShoulder: 1,
  });
  const sonPose = (): PoseIn => ({ expr: EXPR.smile, lookY: -0.12, armL: { target: null }, armR: { target: null } });
  const cam = camMove(f, 0, p.unpack, { x: 720, y: 1090, zoom: 1.12 }, { x: 690, y: 1100, zoom: 1.2 });
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <HomeBack ink={ink} uid="s12-home" doorOpen={doorOpen} />
      <Actor uid="s12-son" look="sonHome" f={f} place={son} face={(t) => (t < p.set - 6 ? 0.4 : 0.6)} pose={sonPose} seed={3} />
      <Actor uid="s12-mom" look="momTalk" f={f} place={mom} face={(t) => (t < p.stop + 6 ? -0.5 : -0.62)} pose={momPose} seed={1} layer="body" />
      <Svg>
        <SuitcaseFront x={sx} y={HOME.floor + 6} w={SUIT_UP_W} mode="upright" handle={handle} ink={ink} />
      </Svg>
      <Actor uid="s12-mom" look="momTalk" f={f} place={mom} face={(t) => (t < p.stop + 6 ? -0.5 : -0.62)} pose={momPose} seed={1} layer="arms" />
    </Shot>
  );
};

// ---------- 12B, 12C: стол, раскрытый чемодан ----------
const T = HOME.table;
const SUIT = { x: 430, w: 300 };
const SY = T.top - 4;
const POUCH_IN: Vec = { x: 500, y: 1050 };
const POUCH_OUT: Vec = { x: 392, y: T.top - 14 };
const KNIT_IN = { cx: 632, y: 1072, w: 130 };
const KNIT_OUT = { cx: 836, y: T.top - 2, w: 130 };
const HOLE: Vec = { x: 506, y: 1058 }; // отверстие бейджа под косметичкой
const BW = 44; // ширина карточки

const Unpack: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const two = f >= p.ask;
  const cam = two
    ? camKeys(f, [
        [p.ask, { x: 526, y: 1040, zoom: 1.6 }],
        [p.len, { x: 520, y: 1036, zoom: 1.66 }],
      ])
    : camKeys(f, [
        [p.unpack, { x: 600, y: 1030, zoom: 1.3 }],
        [p.notice, { x: 560, y: 1040, zoom: 1.4 }],
        [p.lifted, { x: 500, y: 1050, zoom: 1.62 }],
        [p.ask, { x: 500, y: 1050, zoom: 1.64 }],
      ]); // как в кадре
  const mom = { x: 760, y: HOME.momBehind.y, h: H.mom * 0.97 };
  const son = { x: 292, y: HOME.floor - 4, h: H.son };

  // свитер: в чемодане → в руке мамы → на столе справа
  const knitHand = keysV(f, [
    [p.knit - 10, { x: 760, y: 1170 }],
    [p.knit + 8, { x: KNIT_IN.cx + 6, y: KNIT_IN.y - 46 }],
    [p.knit + 22, { x: 700, y: 900 }],
    [p.knitDown, { x: KNIT_OUT.cx + 4, y: KNIT_OUT.y - 44 }],
    [p.knitDown + 18, { x: 840, y: T.top - 10 }],
  ]);
  const knitHeld = f >= p.knit + 8 && f < p.knitDown;
  const knitOut = f >= p.knitDown;

  // косметичка: в чемодане → в руке сына → на край стола
  const pouchHand = keysV(f, [
    [p.pouch - 12, { x: son.x + 40, y: son.y - H.son * 0.4 }],
    [p.pouch, { x: POUCH_IN.x + 4, y: POUCH_IN.y - 26 }],
    [p.pouch + 18, { x: 430, y: 960 }],
    [p.pouchDown, { x: POUCH_OUT.x + 4, y: POUCH_OUT.y - 26 }],
    [p.pouchDown + 14, { x: son.x + 60, y: son.y - H.son * 0.45 }],
  ]);
  const pouchHeld = f >= p.pouch && f < p.pouchDown;
  const pouchOut = f >= p.pouchDown;

  // бейдж: лежит оборотом вверх → сын тянет за шнурок → держит у груди
  const lift = easeInOut((f - p.pull) / (p.lifted - p.pull));
  const held: Vec = { x: son.x + 74, y: son.y - H.son * 0.7 };
  const badgeTop = lerpV({ x: HOLE.x, y: HOLE.y - 2 }, held, lift);
  const sonHand =
    f < p.pull - 12
      ? pouchHand
      : keysV(f, [
          [p.pull - 12, { x: son.x + 60, y: son.y - H.son * 0.45 }],
          [p.pull, { x: HOLE.x - 4, y: HOLE.y - 16 }],
          [p.lifted, { x: held.x - 2, y: held.y - 14 }],
        ]);
  const sonPose = (t: number): PoseIn => ({
    expr: t < p.notice ? EXPR.smile : t < p.ask ? EXPR.neutral : EXPR.softSmile,
    lookY: t < p.ask ? 0.42 : -0.18,
    lean: t < p.ask ? 6 : 2,
    headTilt: t > p.ask && t < p.askEnd + 6 ? 4 : 0,
    armR: { target: sonHand, shape: (t >= p.pouch && t < p.pouchDown) || (t >= p.pull - 2 && t < p.lifted) ? "pinch" : t >= p.lifted ? "fist" : "relax", elbow: "down" },
    armL: t >= p.lifted ? { target: { x: held.x - 30, y: held.y + 40 }, shape: "relax", elbow: "down" } : { target: null },
  });
  const momPose = (t: number): PoseIn => ({
    expr: t < p.askEnd ? EXPR.softSmile : EXPR.smile,
    lookY: t < p.ask ? 0.36 : 0.12,
    lean: t < p.ask ? 8 : 3,
    nod: keys(t, [[p.askEnd + 2, 0], [p.askEnd + 9, 6], [p.askEnd + 18, 0]]),
    armL: { target: knitHand, shape: knitHeld ? "fist" : "relax", elbow: "down" },
    armR: { target: { x: 880, y: T.top - 10 }, shape: "relax", elbow: "down" },
  });
  const momFace = (t: number) => keys(t, [[p.unpack, -0.1], [p.knitDown + 10, -0.2], [p.notice, -0.4], [p.ask, -0.55]]);
  const sonFace = (t: number) => keys(t, [[p.unpack, 0.55], [p.ask - 4, 0.6], [p.ask + 6, 0.68]]);
  const lyingBadge = f < p.pull;
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <HomeBack ink={ink} uid="s12-home2" />
      <Actor uid="s12-mom2" look="momTalk" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <HomeTable ink={ink} uid="s12-table" />
      <Svg>
        <SuitcaseFront x={SUIT.x} y={SY} w={SUIT.w} mode="open" ink={ink}>
          {lyingBadge ? (
            <g>
              <g transform={`translate(0 ${HOLE.y}) scale(1 0.32) translate(0 ${-HOLE.y})`}>
                <BadgeBack cx={HOLE.x} cy={HOLE.y + BW * BADGE_RATIO * 0.45} w={BW} loop={0} width={6} ink={ink} />
              </g>
              <LanyardLoop hole={HOLE} ang={200} len={70} wide={22} sq={0.35} width={6} ink={ink} />
            </g>
          ) : null}
          {!pouchHeld && !pouchOut ? <Pouch cx={POUCH_IN.x} cy={POUCH_IN.y} w={66} flat={1} ink={ink} /> : null}
          {!knitHeld && !knitOut ? <KnitLying cx={KNIT_IN.cx} y={KNIT_IN.y} w={KNIT_IN.w} ink={ink} /> : null}
        </SuitcaseFront>
        {pouchOut ? <Pouch cx={POUCH_OUT.x} cy={POUCH_OUT.y} w={56} flat={1} ink={ink} /> : null}
        {knitOut ? <KnitLying cx={KNIT_OUT.cx} y={KNIT_OUT.y} w={KNIT_OUT.w} ink={ink} /> : null}
        {f >= p.notice && f < p.pull + 6 ? <Ring x={HOLE.x - 30} y={HOLE.y} r={56} t={f - p.notice} color={C.yellow} width={ink * 1.2} dur={12} out={p.pull - p.notice} /> : null}
      </Svg>
      <Actor uid="s12-son2" look="sonHome" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={3} />
      <Svg>
        {pouchHeld ? <Pouch cx={pouchHand.x + 2} cy={pouchHand.y + 26} w={60} ink={ink} /> : null}
        {knitHeld ? <KnitHeld p={{ x: knitHand.x - 4, y: knitHand.y + 30 }} w={120} h={110} sway={Math.sin(f / 5) * 3} ink={ink} /> : null}
        {!lyingBadge ? <BadgeBack cx={badgeTop.x} cy={badgeTop.y + BW * BADGE_RATIO * 0.5 + 6} w={BW * (1 + lift * 0.1)} loop={22 + lift * 30} sway={Math.sin(f / 6) * 4 * (1 - lift)} width={6} ink={ink} /> : null}
      </Svg>
      <Actor uid="s12-mom2" look="momTalk" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
    </Shot>
  );
};

export const S12Back: React.FC = () => {
  const { f } = useScene("back");
  const p = usePlan(backPlan);
  if (f < p.unpack) return <Arrive f={f} p={p} />;
  return <Unpack f={f} p={p} />;
};

// Звук: дверь, чемодан ставят на пол, шорох вещей.
export const sfxS12Back: Sd2SfxPlan = (tl) => {
  const p = backPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: 2, kind: "door", volume: 0.2 },
    { at: p.set + 2, kind: "suitcase-set" },
    { at: p.knit + 8, kind: "paper", volume: 0.12 },
    { at: p.pouchDown, kind: "folder-down", volume: 0.12 },
  ];
};

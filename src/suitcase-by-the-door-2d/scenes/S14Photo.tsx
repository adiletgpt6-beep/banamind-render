// S14 · Фото рядом с бейджем.
//
// 14A — гостиная, тот же вечер: бейдж лежит на журнальном столике, рядом
//       закрытая жёлтая папка. Мама сидит на диване. Сын входит слева со
//       своей школьной фотографией в рамке, наклоняется и ставит её рядом
//       с бейджем.
// 14B — вставка: на столике рядом — бейдж «Айжан · Спикер» и школьное фото.
// 14C — двухплан: сын поворачивается к маме — «Эми аларга эмне айтып
//       бергениңди мага да көрсөтчү»; мама отвечает взглядом: улыбается,
//       кивает и смотрит на папку.
import { useScene, usePlan, Shot, Svg, camKeys } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerpV, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { LIVING, LivingBack, LivingSofa, CoffeeTable, LampGlow, LIVING_TINT } from "../sets/Living";
import { SchoolPhoto } from "../sets/Home";
import { FolderFlat } from "../props/Folder";
import { BadgeTilted, LanyardLoop, tiltedHole } from "../props/Things";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const photoPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "photo");
  const place = T.word("N14", "койду");
  return {
    len: T.len,
    arrive: Math.min(T.word("N14", "алып") + 4, place - 34),
    bend: place - 18,
    place,
    insert: place + 4,
    two: T.from("C04") - 8,
    askEnd: T.to("C04"),
  };
};
type Plan = ReturnType<typeof photoPlan>;

// предметы на столике (мир)
const TB = LIVING.table;
const BADGE = { cx: 360, bottom: TB.front - 8, w: 58, s: 0.34 };
const PH = { w: 72, h: 94 };
const PHOTO_AT: Vec = { x: 404, y: TB.front - 10 - PH.h }; // левый верхний угол стоящей рамки
const FOLDER = { x: 596, y: TB.front - 6, w: 118 }; // корешок слева: обложка откроется влево, до рамки
export const S14_TABLE = { BADGE, PH, PHOTO_AT, FOLDER } as const;

export const TableThings: React.FC<{ ink: number; photo: boolean; uid: string; folder?: boolean }> = ({ ink, photo, uid, folder = true }) => (
  <g>
    {folder ? <FolderFlat x={FOLDER.x} y={FOLDER.y} w={FOLDER.w} ink={ink} /> : null}
    <LanyardLoop hole={tiltedHole(BADGE.cx, BADGE.bottom, BADGE.w, BADGE.s)} ang={200} len={60} wide={20} sq={0.35} width={5} ink={ink} />
    <BadgeTilted cx={BADGE.cx} bottom={BADGE.bottom} w={BADGE.w} s={BADGE.s} ink={ink} />
    {photo ? <SchoolPhoto x={PHOTO_AT.x} y={PHOTO_AT.y} w={PH.w} h={PH.h} ink={ink} uid={uid} /> : null}
  </g>
);

const MOM = { x: 660, y: LIVING.feetY, h: H.mom };
const lapL = (p: Vec): Vec => ({ x: p.x - 30, y: 1438 });
const lapR = (p: Vec): Vec => ({ x: p.x + 30, y: 1440 });

const Room: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const sonX = (t: number) => keys(t, [[4, -60], [p.arrive, 300]]);
  const son = (t: number) => ({ x: sonX(t), y: LIVING.feetY + 4, h: H.son });
  const crouch = (t: number) => keys(t, [[p.bend - 6, 0], [p.bend + 10, 0.32], [p.place + 6, 0.32], [p.place + 22, 0]]);
  // рамка: у груди → на столик
  const chest = (t: number): Vec => ({ x: son(t).x + 70, y: son(t).y - H.son * 0.62 + crouch(t) * 120 });
  const placed = f >= p.place;
  const frameTL = (t: number): Vec => lerpV({ x: chest(t).x - PH.w / 2, y: chest(t).y - PH.h / 2 }, PHOTO_AT, easeInOut((t - p.bend) / (p.place - p.bend)));
  const fr = frameTL(f);
  const sonPose = (t: number): PoseIn => {
    const holding = t < p.place + 2;
    const tl = frameTL(t);
    return {
      expr: t < p.two ? EXPR.softSmile : EXPR.smile,
      lookY: t > p.bend - 8 && t < p.place + 12 ? 0.5 : t >= p.two ? -0.2 : 0.1,
      crouch: crouch(t),
      lean: 8 * crouch(t) * 3,
      armL: holding ? { target: { x: tl.x + 4, y: tl.y + PH.h * 0.6 }, shape: "fist", elbow: "down" } : { target: null },
      armR: holding ? { target: { x: tl.x + PH.w - 4, y: tl.y + PH.h * 0.6 }, shape: "fist", elbow: "down" } : t >= p.two + 20 && t < p.askEnd ? { target: { x: son(t).x + 110, y: son(t).y - H.son * 0.62 }, shape: "open", elbow: "down" } : { target: null },
    };
  };
  const sonFace = (t: number) => keys(t, [[0, 0.7], [p.arrive, 0.5], [p.bend, 0.35], [p.place + 14, 0.4], [p.two, 0.62]]);
  const momFace = (t: number) => keys(t, [[0, -0.15], [p.arrive - 10, -0.45], [p.askEnd + 10, -0.5], [p.askEnd + 22, -0.2], [p.askEnd + 40, -0.45]]);
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: LIVING.seat,
    expr: t < p.askEnd ? EXPR.softSmile : EXPR.smile,
    lookY: keys(t, [[p.askEnd + 4, 0.08], [p.askEnd + 14, 0.45], [p.askEnd + 30, 0.45], [p.askEnd + 40, 0.08]]),
    nod: keys(t, [[p.askEnd + 2, 0], [p.askEnd + 9, 6], [p.askEnd + 18, 0]]),
    armL: { target: lapL(MOM), shape: "relax", elbow: "hang" },
    armR: { target: lapR(MOM), shape: "relax", elbow: "hang" },
  });
  const two = f >= p.two;
  const cam = two
    ? camKeys(f, [
        [p.two, { x: 520, y: 1270, zoom: 1.62 }],
        [p.len, { x: 514, y: 1268, zoom: 1.7 }],
      ])
    : camKeys(f, [
        [0, { x: 540, y: 1250, zoom: 1.22 }],
        [p.place, { x: 520, y: 1270, zoom: 1.34 }],
      ]);
  const ink = 3.6 / cam.zoom;
  return (
    <Shot f={f} cam={cam} tint={LIVING_TINT}>
      <LivingBack ink={ink} uid="s14-liv" />
      <LivingSofa ink={ink} uid="s14-sofa" />
      <Actor uid="s14-mom" look="momTalk" f={f} place={() => MOM} face={momFace} pose={momPose} seed={1} blinkShift={7} />
      <CoffeeTable ink={ink} uid="s14-table" cups={false}>
        <TableThings ink={ink} photo={placed} uid="s14-ph" />
      </CoffeeTable>
      <Actor uid="s14-son" look="sonHome" f={f} place={son} face={sonFace} pose={sonPose} role="son" seed={3} layer="body" />
      <Svg>{!placed ? <SchoolPhoto x={fr.x} y={fr.y} w={PH.w} h={PH.h} ink={ink} uid="s14-ph-h" stand={false} /> : null}</Svg>
      <Actor uid="s14-son" look="sonHome" f={f} place={son} face={sonFace} pose={sonPose} role="son" seed={3} layer="arms" />
      <LampGlow uid="s14-glow" />
    </Shot>
  );
};

// 14B: вставка — бейдж и фото рядом на столике.
const Insert: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t = f - p.insert;
  const cam = { x: 500, y: 1500, zoom: 2.7 + clamp(t / 40) * 0.12 };
  const ink = 3.2 / cam.zoom;
  return (
    <Shot f={f} cam={cam} tint={LIVING_TINT}>
      <LivingBack ink={ink} uid="s14-liv-i" />
      <LivingSofa ink={ink} uid="s14-sofa-i" />
      <CoffeeTable ink={ink} uid="s14-table-i" cups={false}>
        <TableThings ink={ink} photo uid="s14-ph-i" />
      </CoffeeTable>
      <LampGlow uid="s14-glow-i" />
    </Shot>
  );
};

export const S14Photo: React.FC = () => {
  const { f } = useScene("photo");
  const p = usePlan(photoPlan);
  if (f >= p.insert && f < p.two) return <Insert f={f} p={p} />;
  return <Room f={f} p={p} />;
};

// Звук: рамку ставят на столик.
export const sfxS14Photo: Sd2SfxPlan = (tl) => {
  const p = photoPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.place - 1, kind: "folder-down", volume: 0.14 },
  ];
};


// S15 · Мама открывает папку и садится рядом с сыном.
//
// 15A — гостиная, двухплан: сын уже сидит на диване слева, мама — справа.
//       На «ачып» мама наклоняется к столику и открывает жёлтую папку
//       (обложка поворачивается вокруг корешка и ложится влево, к фото);
//       затем пересаживается ближе к сыну («жанына отурду»), сын подаётся
//       вперёд к папке.
// 15B — сверху: раскрытая папка на столике, рядом школьное фото и бейдж,
//       ладонь мамы на правом листе, палец сына на левом. Лёгкий наезд —
//       из этого кадра вырастает финальный экран BalaGo (S16).
import { useScene, usePlan, Shot, Svg, camKeys } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { LIVING, LivingBack, LivingSofa, CoffeeTable, LampGlow, LIVING_TINT } from "../sets/Living";
import { SchoolPhoto, TableTop } from "../sets/Home";
import { FolderTop } from "../props/Folder";
import { BadgeCard } from "../props/Badge";
import { FolderFlatOpen, folderCoverEdge, LanyardLoop } from "../props/Things";
import { CloseHand, SKIN } from "../props/CloseHand";
import { S14_TABLE, TableThings } from "./S14Photo";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const folderPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "folder");
  const open = T.word("N15", "ачып") - 8;
  return {
    len: T.len,
    open,
    opened: open + 22,
    slide: T.word("N15", "жанына") - 6,
    sat: T.word("N15", "отурду") + 4,
    top: Math.min(T.to("N15") + 2, T.len - 40),
  };
};
type Plan = ReturnType<typeof folderPlan>;

// Раскрытая папка сверху — тот же кадр, с которого начинается S16.
// FolderTop при open = 1 занимает 2w: корешок в cx − w/2, поэтому
// разворот по центру кадра — при cx = 540 + w/2.
export const FOLDER_TOP = { cx: 740, cy: 880, w: 400, h: 290 } as const;
export const FOLDER_SPREAD = { x: FOLDER_TOP.cx - FOLDER_TOP.w * 1.5, y: FOLDER_TOP.cy - FOLDER_TOP.h / 2, w: FOLDER_TOP.w * 2, h: FOLDER_TOP.h } as const;
export const FOLDER_TOP_CAM = { x: 540, y: 960, zoom: 1.06 } as const;

const SON_FEET = LIVING.feetY - 52;
const SON = { x: 410, y: SON_FEET, h: H.son, seat: SON_FEET - (LIVING.feetY - LIVING.seat) };
const F = S14_TABLE.FOLDER;

const Sofa: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const open = easeInOut((f - p.open) / (p.opened - p.open));
  const momX = keys(f, [[p.slide, 660], [p.sat, 548]]);
  const mom = { x: momX, y: LIVING.feetY, h: H.mom };
  const momPose = (t: number): PoseIn => {
    const r = clamp((t - p.open + 10) / 10) * (1 - clamp((t - p.opened - 4) / 10));
    const e = folderCoverEdge(F.x, F.y, F.w, easeInOut((t - p.open) / (p.opened - p.open)));
    const mx = keys(t, [[p.slide, 660], [p.sat, 548]]);
    return {
      sit: 1,
      seat: LIVING.seat,
      expr: t < p.sat ? EXPR.softSmile : EXPR.smile,
      lookY: t < p.opened + 6 ? 0.55 : 0.35,
      lean: 14 * r + (t > p.sat ? 6 : 0),
      armL: r > 0.02 ? { target: { x: lerp(mx - 40, e.x + 4, r), y: lerp(1438, e.y - 18, r) }, shape: r > 0.6 ? "pinch" : "relax", elbow: "down" } : { target: { x: mx - 30, y: 1438 }, shape: "relax", elbow: "hang" },
      armR: { target: { x: mx + 30, y: 1440 }, shape: "relax", elbow: "hang" },
    };
  };
  const sonPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SON.seat,
    expr: t < p.opened ? EXPR.calm : EXPR.smile,
    lookY: t < p.open - 6 ? 0.1 : 0.5,
    lean: keys(t, [[p.slide, 2], [p.sat + 4, 12]]),
    armL: { target: { x: SON.x - 14, y: 1424 }, shape: "relax", elbow: "hang" },
    armR: { target: { x: SON.x + 46, y: 1424 }, shape: "relax", elbow: "hang" },
  });
  const cam = camKeys(f, [
    [0, { x: 520, y: 1290, zoom: 1.5 }],
    [p.sat, { x: 500, y: 1300, zoom: 1.62 }],
    [p.top, { x: 520, y: 1380, zoom: 1.9 }],
  ]);
  const ink = 3.6 / cam.zoom;
  return (
    <Shot f={f} cam={cam} tint={LIVING_TINT}>
      <LivingBack ink={ink} uid="s15-liv" />
      <LivingSofa ink={ink} uid="s15-sofa" />
      <Actor uid="s15-son" look="sonHome" f={f} place={() => SON} face={() => 0.4} pose={sonPose} seed={3} blinkShift={9} />
      <Actor uid="s15-mom" look="momTalk" f={f} place={() => mom} face={(t) => (t < p.sat ? -0.3 : -0.42)} pose={momPose} seed={1} blinkShift={7} layer="body" />
      <CoffeeTable ink={ink} uid="s15-table" cups={false}>
        <TableThings ink={ink} photo={false} uid="s15-ph" folder={false} />
        <FolderFlatOpen x={F.x} y={F.y} w={F.w} open={open} ink={ink} />
        <SchoolPhoto x={S14_TABLE.PHOTO_AT.x} y={S14_TABLE.PHOTO_AT.y} w={S14_TABLE.PH.w} h={S14_TABLE.PH.h} ink={ink} uid="s15-ph2" />
      </CoffeeTable>
      <Actor uid="s15-mom" look="momTalk" f={f} place={() => mom} face={(t) => (t < p.sat ? -0.3 : -0.42)} pose={momPose} seed={1} blinkShift={7} layer="arms" />
      <LampGlow uid="s15-glow" />
    </Shot>
  );
};

// Вид сверху: папка, фото, бейдж, ладони.
export const FolderTopScene: React.FC<{ ink: number; t: number; hands?: number }> = ({ ink, t, hands = 1 }) => {
  const FT = FOLDER_TOP;
  const momHand: Vec = { x: FT.cx + FT.w * 0.3, y: FT.cy - FT.h * 0.12 + Math.sin(t / 20) * 2 };
  const sonHand: Vec = { x: FT.cx - FT.w * 1.12, y: FT.cy + FT.h * 0.2 };
  return (
    <>
      <TableTop ink={ink} uid="s15-tt" />
      <Svg>
        {/* школьное фото и бейдж лежат слева */}
        <g transform="rotate(-6 250 1250)">
          <rect x={186} y={1132} width={148} height={196} rx={6} fill={C.shadow} />
          <SchoolPhoto x={178} y={1120} w={148} h={196} ink={ink} uid="s15-top-ph" stand={false} />
        </g>
        <LanyardLoop hole={{ x: 800, y: 1150 }} ang={-60} len={150} wide={64} width={14} ink={ink} />
        <BadgeCard cx={812} cy={1240} w={116} rot={7} ink={ink} />
        <FolderTop cx={FT.cx} cy={FT.cy} w={FT.w} h={FT.h} open={1} ink={ink} />
        {hands > 0 ? (
          <g opacity={hands}>
            <CloseHand x={momHand.x} y={momHand.y} angle={40} size={150} look={SKIN.momTalk} shape="open" armLen={8} ink={ink} />
            <CloseHand x={sonHand.x} y={sonHand.y} angle={-150} size={128} look={SKIN.sonHome} shape="point" armLen={8} ink={ink} mirror />
          </g>
        ) : null}
      </Svg>
    </>
  );
};

export const S15Folder: React.FC = () => {
  const { f, len } = useScene("folder");
  const p = usePlan(folderPlan);
  if (f < p.top) return <Sofa f={f} p={p} />;
  const t = f - p.top;
  const k = clamp(t / Math.max(1, len - p.top));
  const cam = { x: FOLDER_TOP_CAM.x, y: FOLDER_TOP_CAM.y, zoom: lerp(1, FOLDER_TOP_CAM.zoom, k) };
  return (
    <Shot f={f} cam={cam}>
      <FolderTopScene ink={4 / cam.zoom} t={t} />
    </Shot>
  );
};

// Звук: обложка папки, шорох листа.
export const sfxS15Folder: Sd2SfxPlan = (tl) => {
  const p = folderPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.open + 4, kind: "paper", volume: 0.18 },
  ];
};

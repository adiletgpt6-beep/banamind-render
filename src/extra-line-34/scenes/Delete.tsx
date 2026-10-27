// Сцена 13 «delete» (N09, S03, M02). Вечер, тёплый свет; та же композиция
// объявления, что в начале. «Кечинде апасы жарыядагы акыркы сапты алып
// салды.» — мама выделяет пункт о вождении, он растворяется, место
// закрывается, остальные строки на месте. Сын подходит и заглядывает через
// плечо: «Ал эже дагы келеби?» Мама поворачивается к нему: «Ооба, эртең
// келет.» Без взрыва, конфетти и звука победы.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { camMove, Shot, type Cam, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { AdCard, adLayout } from "../ui/AdCard";
import { AdDesk, CARD, cardPoint, MOM_DESK, typingPose } from "./AdDesk";
import { H } from "./common";
import { Room } from "./Room";

export const CAM_DESK_EVE: Cam = { x: 1010, y: 800, zoom: 1.5 };
export const SON_SHOULDER = { x: 1300, y: 1532 } as const;
export const REMOVED_AD = { edit: 1, typed: 1, extraLines: 3, highlight: 0, remove: 1 } as const;

export const deletePlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "delete");
  const sel0 = T.word("N09", "акыркы") - 4;
  const sel1 = T.to("N09") - 6;
  const del0 = T.to("N09") + 2; // клавиша удаления
  const del1 = del0 + 22;
  const sonIn0 = del0 - 10;
  const sonIn1 = T.from("S03") - 6;
  const cut = T.from("S03") - 8; // двойной план для разговора
  const s03 = { a: T.from("S03"), b: T.to("S03") };
  const m02 = { a: T.from("M02"), b: T.to("M02") };
  return { sel0, sel1, del0, del1, sonIn0, sonIn1, cut, s03, m02, len: T.len };
};

export const DeleteScene: React.FC = () => {
  const { f, tl } = useScene("delete");
  const P = deletePlan(tl);
  const select = keys(f, [[P.sel0, 0], [P.sel1, 1]], (x) => x);
  const remove = keys(f, [[P.del0, 0], [P.del1, 1]], easeInOut);
  const ad = { edit: 1, typed: 1, extraLines: 3, highlight: 0, select, remove, caretFrame: f };
  const pt = cardPoint("block", { extraLines: 3 });
  const sonPlace = (t: number) => {
    const u = cruise((t - P.sonIn0) / (P.sonIn1 - P.sonIn0), 0.35);
    return { x: lerp(1560, SON_SHOULDER.x, u), y: SON_SHOULDER.y, h: H.son };
  };
  const turn = P.s03.b + 2; // мама поворачивается к сыну после вопроса
  const momFace = (t: number) => keys(t, [[0, -0.72], [P.s03.a - 4, -0.72], [P.s03.a + 6, -0.5], [turn, -0.5], [turn + 12, 0.62]]);
  // повернувшись к сыну, мама убирает руки с клавиатуры на колени
  const momPose = (t: number): PoseIn => {
    const base = typingPose(t, (t > P.sel0 && t < P.sel1) || (t > P.del0 - 4 && t < P.del0 + 6) ? 1 : 0, {
      lookY: keys(t, [[0, 0.3], [P.s03.a, 0.3], [turn, 0.2], [turn + 10, -0.05]]),
      expr: t < turn ? "calm" : "smile",
      nod: keys(t, [[P.m02.a, 0], [P.m02.a + 8, 4], [P.m02.a + 18, 0]]),
    });
    const k = keys(t, [[turn, 0], [turn + 12, 1]]);
    if (k <= 0) return base;
    const lap = (side: -1 | 1) => ({ x: MOM_DESK.x + side * 0.07 * H.mom + 20, y: MOM_DESK.y - 0.27 * H.mom - 8 });
    const mix = (a: { x: number; y: number } | null | undefined, b: { x: number; y: number }) => (a ? { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) } : b);
    return {
      ...base,
      armL: { ...base.armL!, target: mix(base.armL?.target, lap(-1)), behind: false },
      armR: { ...base.armR!, target: mix(base.armR?.target, lap(1)), behind: false },
    };
  };
  const sonPose = (t: number): PoseIn => ({
    expr: t < P.s03.a ? "calm" : "softSmile",
    lean: keys(t, [[P.sonIn1 - 10, 0], [P.sonIn1 + 6, 9], [turn + 20, 9], [turn + 34, 4]]),
    lookY: keys(t, [[P.sonIn1, 0.2], [P.s03.a, 0.25], [turn + 6, 0]]),
    armL: { target: t > P.sonIn1 - 4 ? { x: MOM_DESK.x + 36, y: 1540 - 0.62 * H.mom } : null, shape: "relax", elbow: "down" },
  });
  const sonFace = (t: number) => keys(t, [[0, -0.7], [P.sonIn1, -0.7], [P.sonIn1 + 6, -0.55], [turn + 8, -0.4]]);
  const son = <Actor uid="s13-son" look="son" f={f} place={sonPlace} face={sonFace} pose={sonPose} role="son" walkFrom={P.sonIn0} seed={4} />;
  const h = adLayout(CARD.w, { extraLines: 3, remove: 1 }).h;
  const mom = (layer: "body" | "arms") => <Actor uid="s13-mom" look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />;
  return (
    <>
      {f < P.cut ? (
        <AdDesk uidPrefix="s13" f={f} evening={1} ad={ad} cam={camMove(f, 0, P.cut, CAM_DESK_EVE, { ...CAM_DESK_EVE, zoom: 1.53 })} zoom={{ k: 1 + 0.08 * clamp(f / P.del0), ox: 540, oy: pt.y }} momFace={momFace} momPose={momPose} behindMom={f >= P.sonIn0 - 2 ? son : null} />
      ) : null}
      {/* двойной план: сын за плечом мамы, мама поворачивается к нему */}
      <Shot f={f} from={P.cut} to={P.len + 1} cam={camMove(f, P.cut, P.len, { x: 1230, y: 1090, zoom: 1.75 }, { x: 1235, y: 1085, zoom: 1.82 })}>
        <Room evening={1} laptop={{ screen: <LaptopAdEvening h={h} /> }} momBody={<>{son}{mom("body")}</>} momArms={mom("arms")} toys={false} />
      </Shot>
    </>
  );
};

export const LaptopAdEvening: React.FC<{ readonly h: number }> = ({ h }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: h, transformOrigin: "0 0", transform: `scale(${1600 / CARD.w}, ${1000 / h})` }}>
    <LaptopAdBody />
  </div>
);
// Экран ноутбука в двойном плане — то же объявление уже без пункта о вождении.
const LaptopAdBody: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F4ECDD" }} />
    <AdCard {...REMOVED_AD} w={CARD.w} x={0} y={0} compact evening={1} />
  </>
);

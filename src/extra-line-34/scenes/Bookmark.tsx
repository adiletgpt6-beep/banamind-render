// Сцена 14 «bookmark» (S04). Вечер. Сын бежит через гостиную к книжной
// полке (два плана), достаёт ту же книгу «Кичинекей каарман», прижимает к
// себе: «Эң кызыктуу жерине келгенде токтоп калганбыз.» Крупно: детская
// рука переворачивает страницу — тот самый разворот, — и вкладывает
// закладку. Секунда тишины: мама за столом улыбается. Финальный образ —
// рука ребёнка на закладке (с него начинается переход к финалу).
import { Actor, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, camMove, Shot, type Cam, useScene } from "../kit";
import { BookCloseUp, closeUpBookmarkTip, closeUpCorner } from "../props/Book";
import { CloseHand } from "../props/CloseHand";
import { LIVING } from "../sets/Living";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { CARD, MOM_DESK, typingPose } from "./AdDesk";
import { carryBook, HeldBook } from "./Arrival";
import { H } from "./common";
import { LaptopAdEvening, REMOVED_AD } from "./Delete";
import { adLayout } from "../ui/AdCard";
import { Room } from "./Room";

const L = LIVING;
const SON_LOOK = LOOKS.son;
// Сын у полки: стоит правее гнезда книги.
export const SON_SHELF = { x: 430, y: 1556 } as const;
const SON_START = { x: 1440, y: 1560 } as const; // правее маминого стула
const BOOK_GRAB = { x: L.bookSlot.x + 4, y: L.bookSlot.y - 80 } as const;

export const bookmarkPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "bookmark");
  const s04 = { a: T.from("S04"), b: T.to("S04") };
  const run1 = 50; // у полки
  const cutB = 26;
  const reach0 = run1 - 4;
  const take = run1 + 10; // книга в руке
  const hold = take + 16; // книга у груди
  const talk = s04.a - 4; // поясной план: сын говорит
  const close0 = T.word("S04", "келгенде"); // крупно: книга
  const turn0 = close0 + 2;
  const turn1 = turn0 + 20;
  const mark0 = turn1 + 2;
  const mark1 = mark0 + 20; // закладка на месте к концу реплики
  const mom = Math.max(mark1 + 4, s04.b + 4); // тишина: мама улыбается
  const final = mom + 26; // рука на закладке
  return { s04, run1, cutB, reach0, take, hold, talk, close0, turn0, turn1, mark0, mark1, mom, final, len: T.len };
};

// Крупный план книги в руках сына: страница, закладка и детская рука.
//   turnHand — рука у угла перелистываемого листа (turn 0..1),
//   markHand — рука держит верх закладки (bookmark 0..1).
export const SonBookCloseUp: React.FC<{ readonly turn: number; readonly bookmark: number; readonly turnHand: number; readonly markHand: number; readonly spread?: 0 | 1 }> = ({ turn, bookmark, turnHand, markHand, spread = 0 }) => {
  const corner = closeUpCorner(turn);
  const tip = closeUpBookmarkTip(Math.max(bookmark, 0.001));
  return (
    <div style={box({ inset: 0 })}>
      <BookCloseUp turn={turn} spread={spread} bookmark={bookmark} warm={1} surface={SON_LOOK.topColor} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0, overflow: "visible" })}>
        {turnHand > 0 ? <ChildHand at={{ x: corner.x + 30 * (1 - turnHand), y: corner.y + 340 * (1 - turnHand) }} angle={186} shape="pinch" /> : null}
        {markHand > 0 ? <ChildHand at={{ x: tip.x + 4, y: tip.y - 380 * (1 - markHand) }} angle={-14} shape={bookmark >= 1 ? "relax" : "pinch"} /> : null}
      </svg>
    </div>
  );
};

// Детская кисть с предплечьем и белым рукавом рубашки; at — точка хвата.
const ChildHand: React.FC<{ readonly at: { x: number; y: number }; readonly angle: number; readonly shape: "pinch" | "relax" }> = ({ at, angle, shape }) => (
  <CloseHand at={at} angle={angle} shape={shape} skin={SON_LOOK.skin} shade={SON_LOOK.skinShade} sleeve="#F4F2EE" sleeveShade="#DDD8CF" />
);

export const BookmarkScene: React.FC = () => {
  const { f, tl } = useScene("bookmark");
  const P = bookmarkPlan(tl);
  const sonPlace = (t: number) => {
    const u = cruise(t / P.run1, 0.22);
    return { x: lerp(SON_START.x, SON_SHELF.x, u), y: lerp(SON_START.y, SON_SHELF.y, u), h: H.son };
  };
  const chest = carryBook(SON_SHELF.x, SON_SHELF.y, H.son, 1);
  // рука с книгой: к гнезду на полке → к груди
  const reachHand = (t: number) =>
    keysV(t, [
      [P.reach0, { x: SON_SHELF.x - 30, y: SON_SHELF.y - 0.4 * H.son }],
      [P.take, BOOK_GRAB],
      [P.take + 4, BOOK_GRAB],
      [P.hold, { x: SON_SHELF.x - 40, y: chest.book.y + 40 }],
    ]);
  const sonPose = (t: number): PoseIn => {
    if (t < P.reach0) return { expr: "smile", lean: 6 };
    if (t < P.hold) {
      const h = reachHand(t);
      return { expr: "smile", lookY: t < P.take + 4 ? -0.35 : 0.1, armL: { target: h, shape: "fist", elbow: "down", behind: false }, armR: { target: null, shape: "relax" } };
    }
    return {
      ...chest.pose,
      expr: t > P.talk ? "smile" : "softSmile",
      lookY: keys(t, [[P.hold, 0.2], [P.talk, 0.2], [P.talk + 8, -0.05]]),
      nod: keys(t, [[P.s04.a + 30, 0], [P.s04.a + 36, 3], [P.s04.a + 44, 0]]),
      armL: { ...chest.pose.armL!, behind: false },
      armR: { ...chest.pose.armR!, behind: false },
    };
  };
  const sonFace = (t: number) => keys(t, [[0, -0.85], [P.take + 4, -0.85], [P.hold, -0.2], [P.talk, -0.2], [P.talk + 10, 0.35]]);
  const book = (t: number) => {
    if (t < P.take) return null;
    if (t < P.hold) {
      const h = reachHand(t);
      return <HeldBook x={h.x} y={h.y - 34} w={lerp(70, 104, clamp((t - P.take) / 10))} tilt={lerp(-12, 0, clamp((t - P.take) / 14))} title />;
    }
    return <HeldBook x={chest.book.x} y={chest.book.y} title />;
  };
  const son = (layer: "body" | "arms") => <Actor uid="s14-son" look="son" f={f} place={sonPlace} face={sonFace} pose={sonPose} role="son" walkFrom={0} seed={4} layer={layer} />;
  const momPose = (t: number): PoseIn =>
    typingPose(t, 0, {
      expr: t < P.mom ? "softSmile" : "smile",
      lookY: keys(t, [[0, 0.3], [12, 0.1], [P.mom, 0.1], [P.mom + 10, 0.02]]),
      nod: keys(t, [[P.mom + 8, 0], [P.mom + 15, 3], [P.mom + 24, 0]]),
    });
  const momFace = (t: number) => keys(t, [[0, -0.72], [10, -0.62], [P.mom, -0.62], [P.mom + 10, -0.55]]);
  const mom = (layer: "body" | "arms") => <Actor uid="s14-mom" look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} seed={1} layer={layer} />;
  const world = (
    <Room
      evening={1}
      bookOnShelf={f < P.take}
      laptop={{ screen: <LaptopAdEvening h={adLayout(CARD.w, REMOVED_AD).h} /> }}
      momBody={mom("body")}
      momArms={mom("arms")}
      toys={false}
      front={
        <>
          {son("body")}
          {book(f)}
          {son("arms")}
        </>
      }
    />
  );
  const camB: Cam = camMove(f, P.cutB, P.talk, { x: 470, y: 1150, zoom: 1.62 }, { x: 440, y: 1160, zoom: 1.7 });
  const turn = easeInOut(clamp((f - P.turn0) / (P.turn1 - P.turn0)));
  const bookmark = clamp((f - P.mark0) / (P.mark1 - P.mark0));
  const turnHand = keys(f, [[P.close0, 0], [P.turn0, 1], [P.turn1, 1], [P.turn1 + 8, 0]]);
  const markHand = keys(f, [[P.turn1 - 2, 0], [P.mark0, 1]]);
  return (
    <>
      {/* сын бежит через гостиную к полке */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 1080, y: 1200, zoom: 1.05 }, { x: 900, y: 1200, zoom: 1.08 })}>
        {world}
      </Shot>
      {/* у полки: достаёт книгу */}
      <Shot f={f} from={P.cutB} to={P.talk} cam={camB}>
        {world}
      </Shot>
      {/* прижимает книгу: «Эң кызыктуу жерине…» */}
      <Shot f={f} from={P.talk} to={P.close0} cam={camMove(f, P.talk, P.close0, { x: 380, y: 1215, zoom: 2.45 }, { x: 382, y: 1212, zoom: 2.55 })}>
        {world}
      </Shot>
      {/* крупно: страница, закладка */}
      {f >= P.close0 && f < P.mom ? <SonBookCloseUp turn={turn} spread={0} bookmark={bookmark} turnHand={turnHand} markHand={markHand} /> : null}
      {/* секунда тишины: мама улыбается */}
      <Shot f={f} from={P.mom} to={P.final} cam={camMove(f, P.mom, P.final, { x: 1150, y: 1075, zoom: 2.3 }, { x: 1148, y: 1072, zoom: 2.36 })}>
        {world}
      </Shot>
      {/* финальный образ: рука ребёнка на закладке */}
      {f >= P.final ? (
        <FinalBook k={clamp((f - P.final) / (P.len - P.final))} />
      ) : null}
    </>
  );
};

// Финальный образ (и первый кадр сцены 15): рука на закладке, лёгкий наезд.
export const FINAL_PUSH = 0.02;
export const FinalBook: React.FC<{ readonly k: number }> = ({ k }) => (
  <div style={box({ inset: 0, transform: `scale(${1 + FINAL_PUSH * k})`, transformOrigin: "40% 40%" })}>
    <SonBookCloseUp turn={1} bookmark={1} turnHand={0} markHand={1} />
  </div>
);

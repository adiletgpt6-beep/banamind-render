// Сцена 13 «Бир бөлүм». Тот же удачный вечер. Сын приносит одну закрытую
// книгу и садится рядом с мамой на диван: «Бир бөлүм окуйбузбу?» Мама на
// мгновение смотрит на часы (19:10, меньше секунды) и мягко: «Кел,
// баштайлы.» Берёт книгу (руки встречаются на обложке), открывает её —
// обложка поворачивается вокруг корешка; оба смотрят на страницу. Ноутбук
// остаётся закрытым в рабочей комнате, телефон отложен.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { anticipate, easeInOut, keys, keysV } from "../rig/motion";
import { WallClock } from "../sets/Clock";
import { HOME } from "../sets/Home";
import { BOOK, BookFront } from "../sets/Props";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, sceneLen, sitDown } from "./common";
import { sofaPose, sofaSeat, SOFA } from "./Calendars";
import { walkLine } from "./Paradox";
import { KitchenWorld } from "./worlds";

export const BOOK_SHOTS = { arrive: [0, 104], clock: [104, 124], take: [124, 178], open: [178, 236] } as const;

export const BookScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("book");
  const S = BOOK_SHOTS;
  const B02 = lineFrames(cues, "B02", "book");
  const M03 = lineFrames(cues, "M03", "book");
  const mom = sofaSeat("mom");
  const sonSeat = sofaSeat("son");
  const sit0 = 22;
  const sonPlace = (t: number) => (t < sit0 ? walkLine(t, 0, sit0, { x: 480, y: 1660 }, { x: SOFA.son, y: HOME.sofaY }, H.son, 0.35) : sonSeat);
  // книга: в руке сына → передаёт → в руках мамы (на коленях) → открыта
  const give = S.take[0] + 6; // руки встречаются на книге
  const lapBook = { x: mom.x + 0.1 * mom.h, y: mom.y - 0.4 * mom.h };
  const openK = easeInOut((f - S.open[0] - 14) / 26);
  const bookOpen = f < S.open[0] ? 0 : openK;
  // крупный план: разворот по центру кадра
  const bx = 540 + 195 * openK;
  const cwk = Math.min(0, 390 * Math.cos(Math.PI * openK));
  const sonPose = (t: number) => {
    const sd = sitDown(t, sit0 - 8, 26);
    const p = sonPlace(t);
    const hold = { x: p.x - 0.12 * p.h, y: p.y - 0.48 * p.h };
    return {
      sit: t < sit0 ? 0 : sd.sit,
      seat: sofaPose(sonSeat).seat,
      packOff: true,
      expr: t < M03.to ? ("calm" as const) : ("smile" as const),
      lean: t < give + 10 ? Math.max(sd.lean, keys(t, [[give - 14, 0], [give, 10], [give + 10, 0]])) : keys(t, [[S.open[1] - 20, 0], [S.open[1], 8]]),
      armR: { target: { x: p.x + 0.1 * p.h, y: p.y - 0.32 * p.h }, shape: "relax" as const, elbow: "down" as const },
      armL: {
        target: t < give + 4 ? keysV(t, [[0, hold], [give - 16, hold], [give, { x: lapBook.x + 40, y: lapBook.y - 10 }]], anticipate) : keysV(t, [[give + 4, { x: lapBook.x + 40, y: lapBook.y - 10 }], [give + 20, { x: p.x - 0.1 * p.h, y: p.y - 0.32 * p.h }], [S.open[1] - 10, { x: p.x - 0.1 * p.h, y: p.y - 0.32 * p.h }], [S.open[1] + 10, { x: lapBook.x + 70, y: lapBook.y + 10 }]], anticipate),
        shape: t < give + 4 ? ("fist" as const) : ("relax" as const),
        item: t < give - 2 ? ("notebook" as const) : ("none" as const),
        itemColor: BOOK.cover,
        elbow: "down" as const,
        behind: false,
      },
      lookY: t > S.open[1] - 20 ? 0.55 : keys(t, [[B02.from - 4, 0], [give - 10, 0.3], [give + 10, 0]]),
    };
  };
  const sonFace = (t: number) => (t < sit0 ? 0.7 : keys(t, [[sit0, -0.4], [S.open[1] - 20, -0.4], [S.open[1], -0.25]]));
  const momPose = (t: number) => ({
    ...sofaPose(mom),
    expr: t < M03.from - 10 ? ("calm" as const) : ("softSmile" as const),
    lookY: t > S.open[1] - 20 ? 0.55 : keys(t, [[S.clock[0] - 8, 0], [S.clock[0], -0.5], [S.clock[1] - 4, -0.5], [S.clock[1] + 4, 0], [give - 10, 0.35], [give + 10, 0.1]]),
    lookX: keys(t, [[S.clock[0] - 8, 0], [S.clock[0], 0.6], [S.clock[1], 0.6], [S.clock[1] + 6, 0]]),
    armR: { target: t < give ? { x: mom.x + 0.04 * mom.h, y: mom.y - 0.37 * mom.h } : keysV(t, [[give - 8, { x: mom.x + 0.04 * mom.h, y: mom.y - 0.37 * mom.h }], [give, { x: lapBook.x + 30, y: lapBook.y - 10 }], [give + 14, { x: lapBook.x + 60, y: lapBook.y + 20 }]], anticipate), shape: "relax" as const, elbow: "down" as const, behind: false },
    armL: { target: t < give + 6 ? { x: mom.x - 0.03 * mom.h, y: mom.y - 0.37 * mom.h } : keysV(t, [[give + 6, { x: mom.x - 0.03 * mom.h, y: mom.y - 0.37 * mom.h }], [give + 20, { x: lapBook.x - 60, y: lapBook.y + 20 }]], anticipate), shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const momFace = (t: number) => keys(t, [[0, 0.15], [sit0, 0.45], [S.open[1] - 20, 0.45], [S.open[1], 0.3]]);
  const world = (
    <>
      <KitchenWorld
        minutes={19 * 60 + 10}
        evening={1}
        workLight={0}
        sofa={[
          { uid: "b13-mom", look: "mom", f, place: () => mom, face: momFace, pose: momPose, role: "mother", seed: 1 },
          ...(f >= sit0 ? [{ uid: "b13-son", look: "son" as const, f, place: sonPlace, face: sonFace, pose: sonPose, role: "son" as const, seed: 4 }] : []),
        ]}
        standing={f < sit0 ? [{ uid: "b13-son", look: "son", f, place: sonPlace, face: sonFace, pose: sonPose, role: "son", seed: 4, walkFrom: 0 }] : []}
      />
      {f >= give - 2 ? <div style={box({ left: 0, top: 0 })}><BookFront x={lapBook.x + 10} y={lapBook.y} open={bookOpen} s={0.7} /></div> : null}
      {/* телефон отложен на подлокотник */}
      <div style={box({ left: HOME.sofa.x + HOME.sofa.w - 96, top: 1218, width: 60, height: 22, borderRadius: 6, backgroundColor: "#172A46" })} />
    </>
  );
  return (
    <>
      <Shot f={f} from={S.arrive[0]} to={S.arrive[1]} cam={camMove(f, S.arrive[0], S.arrive[1], { x: 120, y: 1200, zoom: 1.05 }, { x: 60, y: 1180, zoom: 1.15 })}>
        {world}
      </Shot>
      <Shot f={f} from={S.clock[0]} to={S.clock[1]} cam={{ x: HOME.clock.x, y: HOME.clock.y + 40, zoom: 4.5 }} overlay={<div style={box({ left: 0, right: 0, top: 1260, textAlign: "center", fontSize: 110, fontWeight: 900, color: "#172A46", fontFamily: "Nunito" })}>19:10</div>}>
        <KitchenWorld minutes={19 * 60 + 10} evening={1} workLight={0} />
        <WallClock x={HOME.clock.x} y={HOME.clock.y} r={HOME.clock.r} minutes={19 * 60 + 10} />
      </Shot>
      <Shot f={f} from={S.take[0]} to={S.take[1]} cam={camMove(f, S.take[0], S.take[1], { x: 40, y: 1160, zoom: 1.45 }, { x: 40, y: 1160, zoom: 1.5 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={S.open[0]}
        to={S.open[1]}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #6E8FB6, #4C6A8F)" })}>
            <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(255,214,140,0.35), transparent 70%)" })} />
            <BookFront x={bx} y={1000} open={bookOpen} s={2.6} />
            {/* руки мамы держат книгу снизу: левая — левую половину, правая — правую */}
            {[-1, 1].map((side) => (
              <div key={side} style={box({ left: side < 0 ? bx - 195 + cwk - 60 : bx + 195 - 90, top: 1200, width: 160, height: 520 })}>
                <div style={box({ left: 20, top: 90, width: 120, height: 460, borderRadius: 60, backgroundColor: "#5E9A93" })} />
                <div style={box({ left: 0, top: 0, width: 150, height: 130, borderRadius: 60, backgroundColor: "#E6B590" })} />
              </div>
            ))}
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={S.open[1]} to={len} cam={camMove(f, S.open[1], len, { x: 40, y: 1150, zoom: 1.6 }, { x: 40, y: 1150, zoom: 1.66 })}>
        {world}
      </Shot>
    </>
  );
};


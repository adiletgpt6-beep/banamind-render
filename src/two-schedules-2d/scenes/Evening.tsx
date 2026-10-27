// Сцена 7 (82–102,5 с): вечерний разговор. Тёплый свет лампы, за окном
// темно; на ноутбуке всё ещё открыта незаконченная задача. Папа приносит
// чайник, ставит его на стол и садится рядом с мамой: «Бүгүн ишиңди
// бүтүрдүңбү?» Мама: «Бүтүрө алган жокмун. Бирин алып келсем, кайра
// экинчисине жөнөдүм. Күнүмдүн көбү жолдо өтүп кетти.» Дочь за столом с
// тетрадью тихо спрашивает: «Апа, мен сени шаштырдымбы?» — короткая пауза —
// мама мягко поворачивается к ней и протягивает руку: «Жок, кызым. Сен
// күнөөлүү эмессиң. Биз убакытты жакшыраак уюштурушубуз керек.»
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, cruise, keys, keysV, lerp } from "../rig/motion";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, ShoeBench, TableFront, Teapot, WarmLamp } from "../sets/Home";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, onTable, placeAt, seated, seatOf, sitDown } from "./common";

export const EVE = { put: 26, sit: 34 };
// папа: от кухни вдоль стола к своему стулу
export const E_DAD = (t: number): Place => {
  const u = cruise(t / 28, 0.3);
  return t < EVE.sit ? placeAt(lerp(1560, HOME.seat.dad, u), lerp(1556, 1540, u), H.dad) : seated("dad", HOME.seat.dad);
};
export const EVE_TEAPOT = { x: 1330, y: HOME.table.top + 18 };

export const EveningScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const f02 = lineFrames(cues, "f02", "evening");
  const m07 = lineFrames(cues, "m07", "evening");
  const d02 = lineFrames(cues, "d02", "evening");
  const m08 = lineFrames(cues, "m08", "evening");
  const mom = seated("mom", HOME.seat.mom);
  const girl = seated("daughter", 760);
  const son = seated("son", HOME.seat.son);
  const turnToGirl = m08.from - 14; // мама поворачивается после паузы
  const momPose = (t: number) => ({
    expr: t < m07.from ? ("tired" as const) : t < d02.from ? ("tired" as const) : t < turnToGirl ? ("sad" as const) : t < m08.from + 50 ? ("softSmile" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(mom),
    exhale: keys(t, [[m07.from - 10, 0], [m07.from + 10, 0.7], [m07.to, 0.7], [m07.to + 20, 0.3]]),
    armR: { target: keysV(t, [[0, onTable(HOME.laptop.x - 40, -4)], [f02.from + 10, onTable(HOME.laptop.x - 40, -4)], [f02.to + 6, onTable(mom.x + 0.12 * mom.h, -4)]]), shape: "relax" as const, elbow: "down" as const, behind: false },
    armL: {
      target: keysV(t, [[0, onTable(mom.x - 0.13 * mom.h, -4)], [m07.from + 40, onTable(mom.x - 0.13 * mom.h, -4)], [m07.from + 56, { x: mom.x - 0.18 * mom.h, y: HOME.table.top - 60 }], [m07.from + 90, { x: mom.x - 0.18 * mom.h, y: HOME.table.top - 60 }], [m07.from + 106, onTable(mom.x - 0.13 * mom.h, -4)], [m08.from + 4, onTable(mom.x - 0.13 * mom.h, -4)], [m08.from + 26, onTable(girl.x + 0.2 * girl.h, -2)]], anticipate),
      shape: t > m07.from + 50 && t < m07.from + 96 ? ("open" as const) : ("relax" as const),
      elbow: "down" as const,
      behind: false,
    },
    lookY: keys(t, [[0, 0.4], [f02.from, 0.4], [f02.from + 10, 0], [m07.from + 30, 0.2], [m07.to, 0.3], [turnToGirl, 0.3], [turnToGirl + 10, 0]]),
    nod: keys(t, [[m08.from + 2, 0], [m08.from + 10, 4], [m08.from + 22, 0]]),
    headTilt: keys(t, [[turnToGirl, 0], [turnToGirl + 16, -6]]),
  });
  // мама: экран → папа (на вопрос) → вниз → (пауза) → дочь
  const momFace = (t: number) => keys(t, [[0, 0.35], [f02.from + 2, 0.35], [f02.from + 12, 0.6], [m07.to, 0.5], [d02.from, 0.45], [turnToGirl, 0.45], [turnToGirl + 16, -0.55]]);
  const dadPose = (t: number) => {
    const p = E_DAD(t);
    const sd = sitDown(t, EVE.sit, 26);
    return {
      expr: t < m07.to ? ("calm" as const) : ("softSmile" as const),
      sit: sd.sit,
      seat: seatOf(seated("dad", HOME.seat.dad)),
      lean: t < EVE.sit ? keys(t, [[12, 0], [EVE.put, 10]]) : sd.lean,
      armR: {
        target: keysV(t, [[0, { x: p.x + 0.12 * p.h, y: p.y - 0.5 * p.h }], [EVE.put, { x: EVE_TEAPOT.x + 20, y: EVE_TEAPOT.y - 110 }], [EVE.put + 18, onTable(HOME.seat.dad + 0.13 * H.dad, -4)]], anticipate),
        shape: t < EVE.put ? ("fist" as const) : ("relax" as const),
        item: t < EVE.put ? ("teapot" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: keysV(t, [[EVE.sit + 10, { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }], [EVE.sit + 30, onTable(HOME.seat.dad - 0.14 * H.dad, -4)]]), shape: "relax" as const, elbow: "down" as const },
      nod: keys(t, [[m07.from + 60, 0], [m07.from + 68, 5], [m07.from + 80, 0], [m07.to - 10, 0], [m07.to, 4], [m07.to + 12, 0]]),
      lookY: keys(t, [[0, 0.3], [EVE.put + 10, 0.3], [EVE.put + 24, 0]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.5], [EVE.sit + 20, -0.5], [d02.from, -0.5], [d02.from + 10, -0.7]]);
  const girlPose = (t: number) => ({
    expr: t < d02.from - 10 ? ("calm" as const) : t < m08.from + 40 ? ("worried" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(girl),
    packOff: true,
    lean: keys(t, [[0, 8], [d02.from - 20, 8], [d02.from - 6, 0]]),
    armR: { target: keysV(t, [[0, onTable(girl.x + 0.06 * girl.h, -6)], [d02.from - 20, onTable(girl.x + 0.06 * girl.h, -6)], [d02.from - 4, onTable(girl.x + 0.16 * girl.h, -2)]]), shape: t < d02.from - 20 ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armL: { target: onTable(girl.x - 0.1 * girl.h, -2), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(t, [[0, 0.6], [d02.from - 24, 0.6], [d02.from - 8, 0.1], [d02.to + 10, 0.25], [m08.from + 20, 0.05]]),
    headTilt: keys(t, [[d02.from - 10, 0], [d02.from + 6, 5], [m08.from + 40, 5], [m08.from + 60, 0]]),
  });
  const girlFace = (t: number) => keys(t, [[0, 0], [d02.from - 24, 0], [d02.from - 8, 0.55]]);
  const sonPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(son),
    packOff: true,
    armR: { target: onTable(son.x + 0.16 * son.h + Math.sin(t / 6) * 6, -4), shape: "pinch" as const, item: "pencil" as const, itemColor: "#E5677A", elbow: "down" as const, behind: false },
    armL: { target: onTable(HOME.table.x + 30, -2), shape: "open" as const, elbow: "down" as const },
    lookY: 0.6,
  });
  const world = (
    <>
      <HomeBack minutes={19 * 60 + 40 + f / 300} evening={1} f={f} />
      <ShoeBench sonPack girlPack bag />
      <WarmLamp />
      <ChairBack x={son.x} evening={1} />
      <ChairBack x={girl.x} evening={1} />
      <ChairBack x={mom.x} evening={1} />
      <ChairBack x={HOME.seat.dad} evening={1} />
      <Actor uid="e7-son" look="son" f={f} place={() => son} face={() => 0.35} pose={sonPose} seed={4} layer="body" />
      <Actor uid="e7-girl" look="daughter" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={3} layer="body" />
      <Actor uid="e7-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <Actor uid="e7-dad" look="dad" f={f} place={E_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      {/* рисунок сына и тетрадь дочери на столе */}
      <div style={box({ left: 560, top: HOME.table.top + 4, width: 120, height: 26, backgroundColor: "#FFFDF6", borderRadius: 3, rotate: "-4deg" })}>
        <div style={box({ left: 18, top: 6, width: 30, height: 12, borderRadius: 6, backgroundColor: "#E5677A" })} />
        <div style={box({ left: 60, top: 8, width: 40, height: 10, borderRadius: 5, backgroundColor: "#7FAF63" })} />
      </div>
      <div style={box({ left: 740, top: HOME.table.top + 6, width: 120, height: 24, backgroundColor: "#3E7CC0", borderRadius: 3 })} />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <Piala x={1290} y={HOME.piala.y} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      {f >= EVE.put ? <Teapot x={EVE_TEAPOT.x} y={EVE_TEAPOT.y} s={0.85} /> : null}
      <Actor uid="e7-son" look="son" f={f} place={() => son} face={() => 0.35} pose={sonPose} seed={4} layer="arms" />
      <Actor uid="e7-girl" look="daughter" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={3} layer="arms" />
      <Actor uid="e7-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="e7-dad" look="dad" f={f} place={E_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );
  const bFrom = Math.max(100, f02.to + 10);
  const cFrom = d02.from - 30;
  const dFrom = turnToGirl - 6;
  return (
    <>
      <Shot f={f} from={0} to={bFrom} cam={camMove(f, 0, bFrom, { x: 1000, y: 1120, zoom: 1.05 }, { x: 1040, y: 1110, zoom: 1.15 })} bg="#3B3149">
        {world}
      </Shot>
      <Shot f={f} from={bFrom} to={cFrom} cam={camMove(f, bFrom, cFrom, { x: 1120, y: 1060, zoom: 1.6 }, { x: 1110, y: 1060, zoom: 1.7 })}>
        {world}
      </Shot>
      <Shot f={f} from={cFrom} to={dFrom} cam={camMove(f, cFrom, dFrom, { x: 790, y: 1080, zoom: 1.85 }, { x: 795, y: 1080, zoom: 1.92 })}>
        {world}
      </Shot>
      <Shot f={f} from={dFrom} to={615} cam={camMove(f, dFrom, 615, { x: 890, y: 1070, zoom: 1.5 }, { x: 885, y: 1070, zoom: 1.58 })}>
        {world}
      </Shot>
    </>
  );
};

// Сцена 07 «Бул жолу атасы алып келди». Другой день (подпись «Бир күнү»,
// более тёплый свет). Офис: в календаре папы последняя встреча закончилась,
// дальше свободно; он закрывает ежедневник и берёт ключи со стола. Та же
// школа и те же ворота: сын выходит, видит папу у его тёмно-синей машины,
// и они вместе идут к ней.
import { useCurrentFrame } from "remotion";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { WFH_TEXT } from "../script";
import { Car, DAD_CAR } from "../sets/Car";
import { DadCalendar, OFFICE, OfficeBack, OfficeDesk, Planner } from "../sets/Office";
import { SCHOOL } from "../sets/School";
import { KeysOnTable } from "../sets/WorkRoom";
import { box, camMove, Shot } from "../shots";
import { H, sceneLen, standUp } from "./common";
import { SchoolWorld } from "./Morning";
import { walkLine } from "./Paradox";

export const DAD_SHOTS = { cal: [0, 44], office: [44, 116] } as const;

export const SomeDay: React.FC<{ f: number }> = ({ f }) => (
  <div style={box({ left: 80, top: 170, padding: "12px 26px", borderRadius: 18, backgroundColor: "#FFD43B", color: "#172A46", fontFamily, fontSize: 46, fontWeight: 900, opacity: easeOut(f / 10) })}>{WFH_TEXT.someDay}</div>
);

export const DadPickupScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("dadPickup");
  const S = DAD_SHOTS;
  const dad = { x: OFFICE.dadX, y: OFFICE.seatY, h: H.dad };
  const close = S.office[0] + 8;
  const grab = S.office[0] + 34;
  const keysAt = { x: OFFICE.desk.x + 560, y: OFFICE.desk.top };
  const planner = { x: OFFICE.dadX - 60, y: OFFICE.desk.top + 4 };
  const stand0 = grab + 12;
  const dadPose = (t: number) => {
    const su = standUp(t, stand0, 28);
    return {
      sit: su.sit,
      seat: 0.27 * H.dad,
      lean: Math.max(su.lean, keys(t, [[grab - 12, 0], [grab, 8], [grab + 8, 0]])),
      expr: t > close + 10 ? ("softSmile" as const) : ("calm" as const),
      lookY: keys(t, [[S.office[0], 0.5], [grab + 6, 0.5], [grab + 16, 0]]),
      armL: {
        target: keysV(t, [[S.office[0], { x: planner.x - 60, y: planner.y - 20 }], [close, { x: planner.x - 70, y: planner.y - 30 }], [close + 14, { x: planner.x + 40, y: planner.y - 36 }], [close + 24, { x: dad.x - 0.16 * dad.h, y: dad.y - 0.4 * dad.h }]], anticipate),
        shape: "open" as const,
        elbow: "down" as const,
      },
      armR: {
        target: keysV(t, [[S.office[0], { x: dad.x + 0.15 * dad.h, y: OFFICE.desk.top - 6 }], [grab - 14, { x: dad.x + 0.15 * dad.h, y: OFFICE.desk.top - 6 }], [grab, { x: keysAt.x - 8, y: keysAt.y - 10 }], [grab + 4, { x: keysAt.x - 8, y: keysAt.y - 10 }], [grab + 22, { x: dad.x + 0.14 * dad.h, y: dad.y - 0.46 * dad.h }]], anticipate),
        shape: t >= grab ? ("fist" as const) : ("relax" as const),
        item: t >= grab ? ("keys" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
    };
  };
  // школа: сын выходит из ворот к папе, вместе — к машине
  const out = S.office[1] + 10;
  const meet = out + 54;
  const son = (t: number) =>
    t < meet + 16
      ? walkLine(t, out, meet, { x: SCHOOL.gate.x + 190, y: SCHOOL.fenceY + 10 }, { x: 1080, y: 1980 }, H.son, 0.3)
      : walkLine(t, meet + 16, meet + 70, { x: 1080, y: 1980 }, { x: 1320, y: 2000 }, H.son, 0.3);
  const dadS = (t: number) => walkLine(t, meet + 16, meet + 70, { x: 1250, y: 1990 }, { x: 1480, y: 2010 }, H.dad, 0.3);
  return (
    <>
      <Shot f={f} from={S.cal[0]} to={S.cal[1]} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<><DadCalendar done={clamp((f - 12) / 10)} /><SomeDay f={f} /></>}>
        {null}
      </Shot>
      <Shot f={f} from={S.office[0]} to={S.office[1]} cam={camMove(f, S.office[0], S.office[1], { x: 680, y: 1120, zoom: 1.12 }, { x: 680, y: 1110, zoom: 1.16 })} overlay={<SomeDay f={f + 20} />}>
        <OfficeBack />
        <Actor uid="d7-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[S.office[0], -0.2], [grab - 14, -0.2], [grab - 4, 0.3], [grab + 20, 0.4]])} pose={dadPose} seed={2} layer="body" />
        <OfficeDesk />
        <Planner x={planner.x} y={planner.y} open={1 - clamp((f - close - 2) / 12)} />
        {f < grab ? <KeysOnTable x={keysAt.x} y={keysAt.y} /> : null}
        <Actor uid="d7-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[S.office[0], -0.2], [grab - 14, -0.2], [grab - 4, 0.3], [grab + 20, 0.4]])} pose={dadPose} seed={2} layer="arms" />
      </Shot>
      <Shot f={f} from={S.office[1]} to={len} cam={camMove(f, S.office[1], len, { x: 1200, y: 1560, zoom: 0.72 }, { x: 1230, y: 1560, zoom: 0.75 })}>
        <div style={box({ left: -1200, top: -900, width: 4400, height: 4400, backgroundColor: "#FFE9C7" })} />
        <SchoolWorld
          minutes={12 * 60 + 5}
          onWalk={
            <>
              <Actor uid="d7-son" look="son" f={f} place={son} face={(t) => keys(t, [[out, 0.2], [meet - 10, 0.5], [meet + 16, 0.7]])} pose={(t) => ({ expr: t > meet - 30 ? ("smile" as const) : ("calm" as const) })} seed={4} walkFrom={out} />
              <Actor
                uid="d7-dadS"
                look="dad"
                f={f}
                place={dadS}
                face={(t) => keys(t, [[out, -0.6], [meet + 16, 0.7]])}
                pose={(t) => ({ expr: "smile" as const, armR: { target: { x: dadS(t).x + 0.12 * H.dad, y: dadS(t).y - 0.46 * H.dad }, shape: "fist" as const, item: "keys" as const, behind: false }, armL: t > meet - 4 && t < meet + 70 ? { target: { x: son(t).x + 0.02 * H.son, y: son(t).y - 0.6 * son(t).h }, shape: "open" as const, behind: false } : undefined })}
                seed={2}
                walkFrom={meet + 16}
              />
            </>
          }
          car={<Car x={2280} y={2440} color={DAD_CAR} s={1.25} />}
          front={<div style={box({ left: -1200, top: -900, width: 4400, height: 4400, background: "linear-gradient(180deg, rgba(255,214,150,0.18), rgba(255,214,150,0.06))" })} />}
        />
      </Shot>
    </>
  );
};


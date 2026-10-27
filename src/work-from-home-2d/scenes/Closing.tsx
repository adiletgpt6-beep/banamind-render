// Сцена 09 «17:30» — смысловой центр. Мама сохраняет документ, раздел
// отмечен завершённым; часы — 17:30. Рука ложится на верхний край крышки,
// крышка поворачивается вокруг петли и закрывается; мама встаёт и спокойно
// выходит через ту же дверь. На кухне папа занимается с сыном; он замечает
// маму, смотрит на часы: «Бүгүн ишиң азыраакпы?» Мама спокойно: «Жок, ошол
// эле. Болгону, алаксыбай отуруп, талдоону бүтүрүп алдым.» Камера стоит;
// после ответа — короткая тихая реакция папы (≈ 1 с без речи).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { LaptopCloseup } from "../screens";
import { HOME } from "../sets/Home";
import { NotebookOnTable } from "../sets/Props";
import { lidTop, WORK } from "../sets/WorkRoom";
import { box, camMove, Shot } from "../shots";
import { H, lineFrames, onTable, restOnTable, sceneLen, seated, seatOf, standUp } from "./common";
import { walkLine } from "./Paradox";
import { DESK_FACE, momAtDesk } from "./Work";
import { KitchenWorld, keyAt, WorkWorld } from "./worlds";

export const CLOSING_SHOTS = { screen: [0, 54], clock: [54, 98], lid: [98, 186] } as const;
export const LID = { from: 104, to: 126 } as const; // кадры закрытия крышки

export const lidOpen = (t: number) => 1 - clamp((t - LID.from) / (LID.to - LID.from)) ** 1.4;

export const ClosingScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("closing");
  const S = CLOSING_SHOTS;
  const F02 = lineFrames(cues, "F02", "closing");
  const M02 = lineFrames(cues, "M02", "closing");
  const p = { x: WORK.chairX, y: WORK.seatY, h: H.mom };
  const stand0 = LID.to + 14;
  const leave = stand0 + 30;
  // мама: закрывает крышку → встаёт → идёт к двери (влево)
  const momWalk = (t: number) => walkLine(t, leave, S.lid[1] + 4, { x: WORK.chairX - 30, y: WORK.seatY }, { x: WORK.door.x + 150, y: 1510 }, H.mom, 0.3);
  const momPose = (t: number) => {
    const base = momAtDesk(t, 0);
    const su = standUp(t, stand0, 28);
    const lt = lidTop(WORK.laptop.x, WORK.desk.top, lidOpen(t));
    return {
      ...base,
      expr: t < LID.to ? ("calm" as const) : ("softSmile" as const),
      sit: su.sit,
      lean: t < stand0 ? keys(t, [[S.lid[0], 12], [LID.from - 4, 22], [LID.to + 4, 22], [LID.to + 12, 10]]) : su.lean,
      armR: {
        target: keysV(t, [[S.lid[0], keyAt(2, t, 0)], [LID.from - 2, { x: lt.x + 4, y: lt.y - 4 }], [LID.to, { x: lt.x + 4, y: lt.y - 4 }], [LID.to + 16, { x: p.x + 0.12 * p.h, y: p.y - 0.4 * p.h }]], anticipate),
        shape: t >= LID.from - 2 && t <= LID.to + 2 ? ("open" as const) : ("relax" as const),
        elbow: "down" as const,
        behind: false,
      },
      armL: { ...base.armL, target: t < LID.from - 6 ? keyAt(0, t, 0) : null },
      lookY: keys(t, [[LID.from - 10, 0.3], [LID.to, 0.3], [LID.to + 10, 0]]),
    };
  };
  const momPlace = (t: number) => (t < leave ? { x: WORK.chairX, y: WORK.seatY, h: H.mom } : momWalk(t));
  const momFace = (t: number) => keys(t, [[LID.to, DESK_FACE], [stand0 + 10, 0.2], [leave, -0.6]]);
  // кухня: папа помогает сыну с уроками, мама выходит из комнаты
  const kitchen0 = S.lid[1];
  const son = seated("son", HOME.seat.son);
  const dad = seated("dad", HOME.seat.mom - 40);
  const momK = (t: number) => walkLine(t, kitchen0 + 2, kitchen0 + 50, { x: 2040, y: 1508 }, { x: 1890, y: 1606 }, H.mom, 0.3);
  const inside = momK(f).y < 1532;
  const glance = F02.from - 22; // папа смотрит на часы
  const dadFace = (t: number) => keys(t, [[kitchen0, -0.5], [kitchen0 + 10, 0.65], [glance - 4, 0.65], [glance + 4, 0.3], [glance + 14, 0.3], [glance + 22, 0.7]]);
  const dadPose = (t: number) => ({
    sit: 1,
    seat: seatOf(dad),
    expr: t < glance ? ("calm" as const) : t < M02.to + 4 ? ("surprised" as const) : ("softSmile" as const),
    lookY: keys(t, [[glance, 0], [glance + 6, -0.7], [glance + 14, -0.7], [glance + 20, 0]]),
    armL: { target: onTable(dad.x - 0.2 * dad.h, 2), shape: "point" as const, elbow: "down" as const },
    armR: restOnTable(dad, 1),
    nod: keys(t, [[M02.to + 6, 0], [M02.to + 14, 6], [M02.to + 24, 0]]),
    headTilt: keys(t, [[M02.from + 20, 0], [M02.from + 40, -3]]),
  });
  const momKPose = (t: number) => ({
    expr: t < M02.from ? ("softSmile" as const) : t < M02.to ? ("calm" as const) : ("softSmile" as const),
    armL: { target: { x: momK(t).x - 0.08 * H.mom, y: momK(t).y - 0.45 * H.mom }, shape: "relax" as const, behind: false },
  });
  const momKSpec = { uid: "c9-momK", look: "mom" as const, f, place: momK, face: (t: number) => keys(t, [[kitchen0 + 30, -0.4], [kitchen0 + 60, -0.6]]), pose: momKPose, role: "mother" as const, seed: 1, walkFrom: kitchen0 + 2 };
  const sonPose = () => ({ sit: 1, seat: seatOf(son), packOff: true, expr: "calm" as const, lookY: 0.4, armR: { target: onTable(son.x + 0.12 * son.h, 4), shape: "fist" as const, item: "pencil" as const, elbow: "down" as const, behind: false }, armL: restOnTable(son, -1) });
  // камера: двухплановый общий, на ответ мамы — небольшое приближение и покой
  const cam = f < M02.from - 10 ? camMove(f, kitchen0, M02.from - 10, { x: 1580, y: 1200, zoom: 0.98 }, { x: 1600, y: 1200, zoom: 1.0 }) : camMove(f, M02.from - 10, M02.from + 30, { x: 1600, y: 1200, zoom: 1.0 }, { x: 1680, y: 1180, zoom: 1.1 });
  return (
    <>
      <Shot f={f} from={S.screen[0]} to={S.screen[1]} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<LaptopCloseup f={f} view={{ doc: { filled: 2, saved: clamp((f - 30) / 8), done: clamp((f - 14) / 10) }, clock: f < 40 ? "17:29" : "17:30" }} hands={1} typing={f < 12 ? 0.6 : 0} />}>
        {null}
      </Shot>
      <Shot
        f={f}
        from={S.clock[0]}
        to={S.clock[1]}
        cam={camMove(f, S.clock[0], S.clock[1], { x: WORK.clock.x, y: WORK.clock.y + 60, zoom: 4.2 }, { x: WORK.clock.x, y: WORK.clock.y + 60, zoom: 4.4 })}
        overlay={<div style={box({ left: 0, right: 0, top: 1240, textAlign: "center", fontFamily, fontSize: 120, fontWeight: 900, color: "#172A46", opacity: easeOut((f - S.clock[0] - 4) / 10) })}>17:30</div>}
      >
        <WorkWorld minutes={17 * 60 + 30} />
      </Shot>
      <Shot f={f} from={S.lid[0]} to={S.lid[1]} cam={camMove(f, S.lid[0], S.lid[1], { x: 760, y: 1100, zoom: 1.12 }, { x: 640, y: 1100, zoom: 1.06 })}>
        <WorkWorld minutes={17 * 60 + 30} laptopOpen={lidOpen(f)} doorOpen={clamp((f - leave - 10) / 16)} chair mom={{ uid: "c9-mom", look: "mom", f, place: momPlace, face: momFace, pose: momPose, seed: 1, walkFrom: leave }} />
      </Shot>
      <Shot f={f} from={kitchen0} to={len} cam={cam}>
        <KitchenWorld
          minutes={17 * 60 + 31 + (f - kitchen0) / 1800}
          doorOpen={clamp((f - kitchen0 + 6) / 10) * (1 - clamp((f - kitchen0 - 70) / 20)) }
          inDoor={inside ? <Actor {...momKSpec} /> : null}
          chairs={[son.x, dad.x]}
          seated={[
            { uid: "c9-son", look: "son", f, place: () => son, face: (t) => keys(t, [[0, 0.3], [kitchen0 + 20, 0.3], [kitchen0 + 34, 0.6]]), pose: sonPose, seed: 4 },
            { uid: "c9-dad", look: "dad", f, place: () => dad, face: dadFace, pose: dadPose, role: "father", seed: 2 },
          ]}
          items={<NotebookOnTable x={son.x + 40} y={onTable(0).y + 14} />}
          standing={inside ? [] : [momKSpec]}
        />
        <div style={box({ left: -1400, top: -900, width: 4800, height: 3500, background: "linear-gradient(200deg, rgba(255,200,130,0.16), transparent 60%)" })} />
      </Shot>
    </>
  );
};

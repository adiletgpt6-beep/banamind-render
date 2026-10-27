// 4. Решение: мама гасит экран с календарём и откладывает телефон, папа
// берёт альбом со стола и передаёт маме, обнимает сына за плечи. Мама
// предлагает заранее спланировать дорогу в школу и обещает выслушать
// сына. Папа открывает в телефоне профиль BalaGo (вставка).
import { AbsoluteFill } from "remotion";
import { useScene, useTimeline, visemeAt } from "../context";
import { Album, CalendarScreen, LockScreen, Phone, Planner } from "../props";
import { Person, toLocal } from "../rig/Person";
import { keys, keys2, tw } from "../rig/motion";
import { ROOM, RoomBack, RoomFront, WarmGrade } from "../sets/LivingRoom";
import { lerpCam, World, type Cam } from "../shots";
import { breath, face, idleTilt, talkNod, wordAt } from "./common";
import { TABLE_ALBUM } from "./Drawing";
import { PhoneInsert } from "./PhoneInsert";
import { SON_SCALE, SON_X, SON_Y, StandingSon } from "./Son";

const MED: Cam = { cx: 990, cy: 1190, z: 1.32 };
const TWO: Cam = { cx: 850, cy: 1140, z: 1.6 };

export const TurnScene: React.FC = () => {
  const { t, dur, cue, abs } = useScene();
  const { cues } = useTimeline();
  const m02 = cue("m02");
  const m02cue = cues.find((c) => c.id === "m02");
  const anan = wordAt(m02cue, "анан", m02cue ? m02cue.from + (m02cue.to - m02cue.from) * 0.62 : 0) - (m02cue?.from ?? 0) + m02.from;
  const insertFrom = m02.to + 0.9;
  if (t >= insertFrom) return <PhoneInsert t={t - insertFrom} dur={dur - insertFrom} />;

  const mv = visemeAt(cues, "mother", abs);
  const dv = visemeAt(cues, "father", abs);
  // альбом: стол → руки папы → колени мамы
  const [ax, ay] = keys2(t, [
    [0.9, TABLE_ALBUM.x, TABLE_ALBUM.y],
    [1.6, 1010, 1330],
    [2.4, 770, 1322],
  ]);
  const aFlat = tw(t, 0.9, 1.5, 0.3, 1);
  const aS = 0.4 * SON_SCALE + tw(t, 1.6, 2.4, 0, -0.08);
  const momLean = keys(t, [
    [1.6, 0],
    [2.2, 6],
    [2.8, 2],
  ]);
  const dadLean = keys(t, [
    [0.6, 0],
    [1.1, 8],
    [1.6, -4],
    [2.3, 0],
    [2.9, 9],
  ]);
  const momX = ROOM.mom;
  const momY = ROOM.seatY - 220;
  const dadX = ROOM.dad;
  const dadY = ROOM.seatY - 236;
  const momHasAlbum = t >= 2.2;
  const dadHasAlbum = t >= 1.0 && t < 2.3;
  const aw = 128 * aS;
  const mL = toLocal(ax - aw, ay + 6, momX, momY, 1, momLean, "mom");
  const mR = toLocal(ax + aw, ay + 8, momX, momY, 1, momLean, "mom");
  const dL = toLocal(ax - aw * aFlat, ay + 4, dadX, dadY, 1, dadLean, "dad");
  const dR = toLocal(ax + aw * aFlat, ay + 6, dadX, dadY, 1, dadLean, "dad");
  // рука папы на плече сына
  const sh = toLocal(SON_X - 40 * SON_SCALE, SON_Y + 14 * SON_SCALE, dadX, dadY, 1, dadLean, "dad");
  const hug = tw(t, 2.4, 3.1, 0, 1);
  // телефон мамы: экран гаснет → кладёт на диван слева
  const pAway = tw(t, 0.6, 1.4, 0, 1);
  const dark = tw(t, 0.35, 0.6, 0, 1);
  // папа достаёт телефон (в конце сцены)
  const dadPhone = tw(t, m02.to + 0.1, m02.to + 0.7, 0, 1);
  const mLook = t < 2.2 ? (t < 0.8 ? { lookX: 0.1, lookY: 0.8 } : { lookX: 0.7, lookY: 0.5 }) : t < anan ? { lookX: 0.15, lookY: 0.75 } : { lookX: 0.95, lookY: -0.05 };
  const momTurn = t < 0.8 ? 0.1 : t < 2.2 ? 0.35 : t < m02.from + 1.0 ? 0.05 : t < anan ? 0.4 : 0.55;
  const cam = t < m02.from ? lerpCam(MED, { ...MED, z: 1.38 }, t / m02.from) : lerpCam(TWO, { ...TWO, z: 1.72, cx: 900 }, (t - m02.from) / (insertFrom - m02.from));
  const mC = toLocal(ax, ay, momX, momY, 1, momLean, "mom");
  return (
    <AbsoluteFill>
      <World cam={cam}>
        <RoomBack t={abs} />
        {/* телефон на диване */}
        {pAway >= 1 ? (
          <g transform={`translate(${momX - 120} 1352) rotate(-78) scale(0.22 0.12)`}>
            <Phone dark={1}>
              <LockScreen />
            </Phone>
          </g>
        ) : null}
        <Person
          uid="mom-turn"
          look="mom"
          x={momX}
          y={momY}
          pose={{
            lean: momLean,
            tilt: idleTilt(t, 1, 1.2) + (t > anan ? -4 : 2),
            nod: talkNod(mv, abs, 1),
            breathe: breath(t, 1),
            l: momHasAlbum ? { ...mL, kind: "hold" } : { x: tw(t, 0.6, 1.4, -34, -120), y: tw(t, 0.6, 1.4, 206, 214), kind: "hold" },
            r: momHasAlbum ? { ...mR, kind: "hold" } : { x: tw(t, 1.2, 2.0, 42, 120), y: tw(t, 1.2, 2.0, 210, 190), kind: t < 0.6 ? "hold" : "rest" },
          }}
          face={face(
            abs,
            1,
            mv,
            {
              turn: momTurn,
              ...mLook,
              raise: 0.15,
              worry: t < 2.2 ? 0.35 : 0.15,
              smile: tw(t, 1.8, 2.8, 0.2, 0.55),
            },
            [0.8, 2.25, anan - 0.1],
          )}
          propFront={
            momHasAlbum ? (
              <g transform={`translate(${mC.x} ${mC.y}) rotate(-2) scale(${aS})`}>
                <Album uid="album-mom" />
              </g>
            ) : null
          }
          prop={
            pAway < 1 ? (
              <g transform={`translate(${4 - pAway * 124} ${150 + pAway * 64}) rotate(${-4 - pAway * 74}) scale(0.22)`}>
                <Phone dark={dark}>
                  <CalendarScreen highlight={2} />
                </Phone>
              </g>
            ) : null
          }
        />
        <Person
          uid="dad-turn"
          look="dad"
          x={dadX}
          y={dadY}
          pose={{
            lean: dadLean,
            tilt: idleTilt(t, 2, 1.2) + hug * 4,
            nod: talkNod(dv, abs, 2),
            breathe: breath(t, 2),
            l: dadHasAlbum ? { ...dL, kind: "hold" } : dadPhone > 0 ? { x: tw(t, m02.to + 0.1, m02.to + 0.7, -60, -10), y: tw(t, m02.to + 0.1, m02.to + 0.7, 200, 140), kind: "hold" } : { x: -60, y: 200, kind: "rest" },
            r: dadHasAlbum ? { ...dR, kind: "hold" } : hug > 0 ? { x: tw(t, 2.4, 3.1, 60, sh.x), y: tw(t, 2.4, 3.1, 210, sh.y), kind: "flat" } : { x: 60, y: 210, kind: "rest" },
          }}
          face={face(abs, 2, dv, {
            turn: t < 2.4 ? -0.2 : t < m02.from ? 0.45 : -0.35,
            lookX: t < 1.0 ? 0.5 : t < 2.4 ? -0.5 : t < m02.from ? 0.9 : -0.8,
            lookY: t < 1.0 ? 0.7 : 0.2,
            raise: 0.1,
            worry: t < 2.4 ? 0.3 : 0.05,
            smile: tw(t, 2.4, 3.2, 0.05, 0.5),
          })}
          prop={
            dadPhone > 0 ? (
              <g transform={`translate(-10 ${140 - 12}) rotate(-6) scale(0.2)`}>
                <Phone>
                  <CalendarScreen />
                </Phone>
              </g>
            ) : t < 0.6 ? (
              <g transform={`translate(-4 186) rotate(4) scale(0.95)`}>
                <Planner />
              </g>
            ) : null
          }
        />
        <StandingSon
          t={t}
          abs={abs}
          cues={cues}
          album={null}
          pose={{ lean: -hug * 4 }}
          f={{
            turn: -0.45,
            lookX: t < 2.3 ? -0.85 : t < anan ? -0.6 : -0.95,
            lookY: t < 1.6 ? 0.4 : 0.0,
            raise: tw(t, 0.4, 1.0, 0, 0.35),
            worry: tw(t, 0.4, 2.6, 0.7, 0.1),
            smile: keys(t, [
              [0, -0.25],
              [1.0, 0.05],
              [2.8, 0.5],
              [anan + 0.4, 0.8],
            ]),
          }}
          blinks={[1.0, anan + 0.3]}
        />
        <RoomFront>
          {/* альбом лежит на столе, затем в руках папы */}
          {!momHasAlbum ? (
            <g transform={`translate(${ax} ${ay}) rotate(${tw(t, 0.9, 2.2, -4, -2)}) scale(${aS} ${aS * aFlat})`}>
              <Album uid="album-turn" />
            </g>
          ) : null}
        </RoomFront>
      </World>
      <WarmGrade />
    </AbsoluteFill>
  );
};

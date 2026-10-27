// Сцена 3 (14,5–24 с), параллельный экран. Сверху — сын в своей комнате
// собирает жёлтый рюкзак: тетрадь, потом пенал; телефон на подставке —
// видеозвонок маме. Он спокойно спрашивает: «Апа, бүгүн сиз алып
// кетесизби?» (вежливое «сиз»). Снизу — мама в офисе: печатает, слышит
// сына, поднимает руку и смотрит на часы, затем на экран: «Азыр графикти
// карап көрөйүн.» В конце нижняя половина раскрывается на весь кадр.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { bg1Beats } from "../beats";
import { CuesContext } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { NAVY, YELLOW } from "../screens";
import { OFFICE } from "../sets/Office";
import { KidDesk, PencilCase, OpenBackpack, PhoneStand, ROOM, RoomBack } from "../sets/KidRoom";
import { box, camMove, Panel } from "../shots";
import { fontFamily } from "../../../fonts";
import { H, keyAt, seatOf } from "./common";
import { MOM, OfficeWorld } from "./OfficeWorld";

const SON = { x: ROOM.son.x, y: ROOM.floorY, h: H.son };

export const ParallelScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { s01, m01, watch } = bg1Beats(cues);
  const slide = easeOut(f / 16);

  // ---------- сын ----------
  // тетрадь уже в руке → в рюкзак; затем пенал со стола → в рюкзак
  const pc = { x: ROOM.pencil.x, y: ROOM.pencil.y - 16 };
  const packIn = { x: ROOM.pack.x - 10, y: ROOM.pack.y - 180 };
  const drop1 = 22;
  const pick2 = Math.min(s01.from - 22, 40);
  const drop2 = pick2 + 16;
  const zip = Math.max(s01.to + 24, m01.to + 6);
  const sonPose = (t: number): PoseIn => {
    const hold = (a: number, b: number) => t >= a && t < b;
    return {
      expr: t >= s01.from - 6 && t < s01.to + 30 ? "calm" : t > m01.to ? "softSmile" : "neutral",
      packOff: true,
      lean: keys(t, [[0, 6], [drop1, 8], [pick2, 10], [drop2, 8], [s01.from - 4, 2], [zip, 6]]),
      lookY: keys(t, [[0, 0.45], [s01.from - 8, 0.45], [s01.from + 2, 0.1], [m01.to + 4, 0.1], [zip, 0.45]]),
      nod: keys(t, [[m01.to, 0], [m01.to + 8, 5], [m01.to + 18, 0]]),
      armR: {
        target: keysV(
          t,
          [
            [0, { x: packIn.x - 40, y: packIn.y + 20 }],
            [drop1, packIn],
            [drop1 + 8, { x: packIn.x - 20, y: packIn.y + 40 }],
            [pick2, pc],
            [drop2, packIn],
            [drop2 + 10, { x: packIn.x - 10, y: packIn.y + 50 }],
            [s01.from - 6, { x: packIn.x - 10, y: packIn.y + 50 }],
            [zip - 10, { x: packIn.x - 10, y: packIn.y + 50 }],
            [zip + 6, { x: ROOM.pack.x + 40, y: ROOM.pack.y - 150 }],
            [zip + 30, { x: ROOM.pack.x - 30, y: ROOM.pack.y - 160 }],
          ],
          anticipate,
        ),
        shape: hold(0, drop1) || hold(pick2, drop2) ? "fist" : "relax",
        item: hold(0, drop1) ? "notebook" : hold(pick2, drop2) ? "pencilcase" : "none",
        itemColor: hold(0, drop1) ? "#4C7BD9" : "#3FA27A",
        elbow: "down",
        behind: false,
      },
      // левая рука придерживает рюкзак, пока он говорит и слушает
      armL: { target: { x: ROOM.pack.x - 92, y: ROOM.pack.y - 70 }, shape: "open", elbow: "down", behind: false },
    };
  };
  // сын: к рюкзаку → к телефону (дальше вправо) → снова к рюкзаку
  const sonFace = (t: number) => keys(t, [[0, 0.55], [s01.from - 10, 0.55], [s01.from, 0.85], [m01.to + 10, 0.85], [zip - 6, 0.5]]);

  // ---------- мама ----------
  const wrist = { x: MOM.x + 30, y: MOM.y - 0.5 * MOM.h };
  const momPose = (t: number): PoseIn => {
    const typing = t < s01.from - 4;
    const watching = t >= watch && t < m01.from + 16;
    return {
      expr: t < s01.from ? "thinking" : t < m01.from ? "worried" : "thinking",
      sit: 1,
      seat: seatOf(MOM),
      lean: keys(t, [[0, 6], [s01.from, 6], [s01.from + 12, 2]]),
      lookY: keys(t, [[0, 0.35], [s01.from - 4, 0.35], [s01.from + 6, 0.5], [watch, 0.5], [watch + 10, 0.8], [m01.from + 6, 0.8], [m01.from + 20, 0.35]]),
      headTilt: keys(t, [[watch, 0], [watch + 10, 4], [m01.from + 10, 4], [m01.from + 24, 0]]),
      armL: { target: keyAt(0, t, typing), shape: "relax", elbow: "down", behind: false },
      armR: {
        target: keysV(t, [[s01.from - 4, keyAt(4, s01.from - 4, false)], [watch, keyAt(4, watch, false)], [watch + 14, wrist], [m01.from + 14, wrist], [m01.from + 32, keyAt(4, t, false)]], anticipate),
        shape: "relax",
        elbow: "down",
        wrist: watching ? -40 : 0,
        behind: false,
      },
    };
  };
  // мама: экран → телефон (вправо, на столе) → часы на руке → экран
  const momFace = (t: number) => keys(t, [[0, 0.45], [s01.from - 6, 0.45], [s01.from + 6, 0.8], [watch, 0.8], [watch + 10, 0.1], [m01.from + 14, 0.1], [m01.from + 28, 0.5]]);

  // в конце — мама на весь кадр
  const grow = easeInOut((f - (m01.to + 26)) / 20);
  const split = lerp(960, 0, clamp(grow));
  const callChip = (
    <div style={box({ left: OFFICE.phone.x - 150, top: OFFICE.phone.y - 120, width: 210, height: 70, borderRadius: 35, backgroundColor: "#FFFFFF", boxShadow: "0 6px 14px rgba(20,40,90,0.18)", display: "flex", alignItems: "center", gap: 10, paddingLeft: 12, boxSizing: "border-box", fontFamily, fontSize: 30, fontWeight: 900, color: NAVY, opacity: clamp((f - 4) / 8) * (1 - clamp((f - m01.to - 20) / 10)) })}>
      <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: "#3FA27A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={26} height={26} viewBox="0 0 24 24"><path d="M 6 3 L 10 3 L 11 8 L 8.5 9.5 Q 10 13.5 14.5 15.5 L 16 13 L 21 14 L 21 18 Q 21 21 18 21 Q 4 20 3 6 Q 3 3 6 3 Z" fill="#FFFFFF" /></svg>
      </div>
      Уулум
    </div>
  );
  return (
    <>
      <Panel top={split} height={1920 - split} cam={camMove(f, 0, 280, { x: 560, y: 1090, zoom: 1.5 + (1 - split / 960) * 0.2 }, { x: 560, y: 1080, zoom: 1.55 + (1 - split / 960) * 0.2 })} slide={1 - slide} bg="#F6F7F9">
        <OfficeWorld f={f} uid="p3-mom" minutes={16 * 60 + 40 + f / 600} face={momFace} pose={momPose} phoneGlow={0.8} />
        {callChip}
      </Panel>
      {split > 1 ? (
        <Panel top={0} height={split} cam={camMove(f, 0, 280, { x: 640, y: 1150, zoom: 1.6 }, { x: 650, y: 1140, zoom: 1.68 })} slide={-(1 - slide)} bg="#EEF4FB">
          <RoomBack />
          <KidDesk />
          <OpenBackpack x={ROOM.pack.x} y={ROOM.pack.y} fill={clamp((f - drop1 + 4) / 6) * 0.5 + clamp((f - drop2 + 2) / 6) * 0.5} zip={easeInOut((f - zip) / 24)} />
          {f < pick2 ? <PencilCase x={ROOM.pencil.x} y={ROOM.pencil.y} /> : null}
          <PhoneStand x={ROOM.phone.x} y={ROOM.phone.y} glow={1} />
          <Actor uid="p3-son" look="son" f={f} place={() => SON} face={sonFace} pose={sonPose} role="son" seed={4} />
        </Panel>
      ) : null}
      {split > 1 ? <div style={box({ left: 0, top: split - 6, width: 1080, height: 12, backgroundColor: YELLOW, transform: `scaleX(${slide})` })} /> : null}
    </>
  );
};

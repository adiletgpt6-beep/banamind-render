// Сцена 2 (6–12,5 с). Отмотка «20 мүнөт мурун»: 16:20, мама в офисе
// дописывает документ (печатает), сохраняет, смотрит на часы, встаёт и
// уходит к машине. Снизу появляются две дорожки дня: «Жумуш» и «Мектеп
// жолу»; на словах диктора «жумуштагы билдирүүлөр» видно, что звонок
// клиента (16:40) ложится прямо на дорогу к школе.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats } from "../beats";
import { CuesContext } from "../context";
import { Lanes } from "../lanes";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeOut, keys, keysV, lerp } from "../rig/motion";
import { NAVY, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { DeskFront, Folders, LaptopSide, Mug, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { box, Panel } from "../shots";
import { CALL, dayLanes, ROAD } from "./dayLanes";
import { H, keyAt, seatOf } from "./common";

export const SPLIT = 860; // низ верхней панели
export const LANES_TOP = 880;

export const OfficeScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { office: o } = bg8Beats(cues);
  const seat = OFFICE.seat.mom;
  // мама: сидит → встаёт (stand…stand+26) → идёт вправо из кадра
  const place = (t: number): Place => {
    const u = cruise((t - o.walk) / 60, 0.3);
    return { x: lerp(seat, seat + 900, clamp(u)), y: OFFICE.seatY, h: H.mom };
  };
  const sitAt = (t: number) => keys(t, [[o.stand, 1], [o.stand + 8, 1], [o.stand + 26, 0]]);
  const typing = (t: number) => t >= o.rewindTo && t < o.save - 4;
  const pose = (t: number): PoseIn => {
    const p = place(t);
    const sit = sitAt(t);
    return {
      expr: t < o.save ? "thinking" : t < o.stand ? "calm" : "worried",
      sit,
      seat: seatOf(p),
      lean: keys(t, [[0, 6], [o.save, 6], [o.save + 8, 2], [o.stand, 2], [o.stand + 8, 16], [o.stand + 26, 0]]),
      lookY: keys(t, [[0, 0.35], [o.save + 6, 0.35], [o.save + 14, -0.1], [o.stand, 0]]),
      nod: keys(t, [[o.save, 0], [o.save + 5, 5], [o.save + 12, 0]]),
      armL: sit > 0.5 ? { target: keyAt(0, t, typing(t)), shape: "relax", elbow: "down", behind: false } : { target: null, shape: "relax" },
      armR:
        sit > 0.5
          ? {
              target: keysV(t, [[o.save - 6, keyAt(4, o.save - 6, true)], [o.save - 2, keyAt(5, o.save, false)], [o.save + 4, { x: keyAt(5, 0, false).x, y: keyAt(5, 0, false).y - 16 }], [o.save + 10, keyAt(4, o.save, false)]], anticipate),
              shape: "relax",
              elbow: "down",
              behind: false,
            }
          : { target: null, shape: "relax" },
      bagOnShoulder: t > o.stand + 20 ? 1 : 0,
    };
  };
  // экран → часы на стене (справа) → к выходу
  const face = (t: number) => keys(t, [[0, 0.45], [o.save + 6, 0.45], [o.save + 14, 0.85], [o.stand, 0.85], [o.stand + 10, 0.5]]);
  const rewind = clamp(1 - f / o.rewindTo);
  const chip = easeOut((f - 2) / 8);
  const playhead = lerp(20, 36, clamp(f / 190));
  const lanesIn = easeOut((f - o.lanesIn) / 18);
  const clash = clamp((f - o.clash) / 10);
  return (
    <>
      <Panel top={0} height={SPLIT} cam={{ x: 600 + Math.max(0, place(f).x - seat) * 0.4, y: 1080, zoom: 1.5 }} bg="#F6F7F9">
        <OfficeBack minutes={16 * 60 + 20 + f / 300} />
        <OfficeChair x={seat} />
        <Actor uid="o2-mom" look="mom" f={f} place={place} face={face} pose={pose} role="mother" seed={1} layer="body" walkFrom={o.walk - 4} />
        <DeskFront />
        <Folders x={OFFICE.folders.x} y={OFFICE.folders.y} />
        <LaptopSide x={OFFICE.laptop.x} y={OFFICE.laptop.y} glow={f < o.stand + 20 ? 1 : 0.4} />
        <Mug x={OFFICE.mug.x} y={OFFICE.mug.y} />
        <Actor uid="o2-mom" look="mom" f={f} place={place} face={face} pose={pose} role="mother" seed={1} layer="arms" walkFrom={o.walk - 4} />
      </Panel>
      {/* документ сохранён и отправлен */}
      {f >= o.save ? (
        <div style={box({ left: 560, top: 140, padding: "14px 28px", borderRadius: 30, backgroundColor: "#FFFFFF", border: "4px solid #3FA27A", fontFamily, fontSize: 38, fontWeight: 900, color: "#2B7A55", boxShadow: "0 8px 20px rgba(20,40,90,0.12)", opacity: easeOut((f - o.save) / 8) * (1 - clamp((f - o.walk - 20) / 10)) })}>
          {BG8_TEXT.doc.send}
        </div>
      ) : null}
      {/* дорожки дня */}
      <div style={box({ left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: 0, top: SPLIT - 6, width: 1080, height: 12, backgroundColor: YELLOW })} />
      <Lanes f={f} lanes={dayLanes({ at: o.lanesIn })} intro={lanesIn} playhead={playhead} clash={{ from: CALL.from, to: ROAD.to, v: clash }} top={LANES_TOP} />
      {/* отмотка назад */}
      <div style={box({ left: 60, top: 220, display: "flex", gap: 14, fontFamily, opacity: chip })}>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 42, fontWeight: 900 }}>◀◀ {BG8_TEXT.rewind}</div>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: "#FFFFFF", color: NAVY, fontSize: 42, fontWeight: 900, border: `4px solid ${YELLOW}` }}>{BG8_TEXT.time.office}</div>
      </div>
      {rewind > 0 ? (
        <div style={box({ inset: 0, backgroundColor: `rgba(255,255,255,${0.75 * rewind})`, backgroundImage: `repeating-linear-gradient(180deg, rgba(20,40,90,${0.12 * rewind}) 0 3px, transparent 3px 22px)`, transform: `translateY(${(f % 4) * 6}px)` })} />
      ) : null}
    </>
  );
};

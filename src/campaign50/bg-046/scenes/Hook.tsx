// Сцена 1 (≈0–7 с): хук. Утро, тихая прихожая. На стуле у закрытой двери
// «спит» обычный жёлтый рюкзак (глаза — стёжки). Он открывает глаза,
// подпрыгивает, тянется к двери, оглядывается на зрителя и шепчет:
// «Мен мектепке күн сайын барам. Бирок мени ким менен алып барышат?»
// Сверху — «Ойдон чыгарылган жомок» и заголовок «МЕКТЕП СУМКАСЫ СҮЙЛӨЙТ».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { FACE, mixFace } from "../Backpack";
import { hookBeats, HK } from "../beats";
import { useScene, useTimeline } from "../context";
import { C } from "../palette";
import { clamp, easeOut, keys } from "../rig/motion";
import { BG46_TEXT } from "../script";
import { HALL, ChairBack, ChairSeat, HallBack, TearCalendar } from "../sets/Hall";
import { camMove, Shot } from "../shots";
import { BAG_S, faceKeys, hop, LiveBag, TaleLine } from "./common";

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const { b01, q } = hookBeats(useTimeline()); // q — «Бирок…»
  const X = HALL.chair.x;
  const seat = HALL.chair.seat;
  const bx = () => X;
  const by = (t: number) => seat - 14 - hop(t, HK.hop, 46, 14)[0];
  const sq = (t: number) => hop(t, HK.hop, 46, 14)[1] + keys(t, [[b01.from - 6, 0], [b01.from + 4, 0.1], [b01.to, 0.05], [b01.to + 10, 0]]);
  // тянется к двери (влево), потом наклоняется к зрителю
  const lean = (t: number) => keys(t, [[HK.reach, 0], [HK.reach + 10, -175], [HK.back, -160], [HK.back + 10, 18], [q, 22], [q + 10, -10], [frames, -6]]);
  const face = (t: number) => {
    const base = faceKeys(t, [
      [0, "sleep"],
      [HK.wake, "wonder"],
      [HK.reach, { ...FACE.curious, lookX: -1, lookY: 0.1 }],
      [HK.back + 4, { ...FACE.whisper, lookX: 0.1 }],
      [q, { ...FACE.worried, lookX: -0.3, lookY: -0.3 }],
      [b01.to + 2, { ...FACE.curious, lookX: 0, lookY: 0 }],
    ], 7);
    // зрачки бегают сразу после пробуждения
    const dart = t > HK.wake + 2 && t < HK.reach ? Math.sin((t - HK.wake) * 0.55) * 0.6 : 0;
    return mixFace(base, { ...base, lookX: base.lookX + dart }, 1);
  };
  const cam = camMove(f, 0, frames, { x: X - 40, y: seat - 190, zoom: 2.3 }, { x: X - 10, y: seat - 160, zoom: 2.6 });
  // сверху: строка «жомок» и заголовок
  const ta = easeOut((f - 6) / 10);
  const pop = 1 + 0.12 * Math.sin(Math.PI * clamp((f - 6) / 9));
  return (
    <>
      <Shot f={f} from={0} to={frames} cam={cam}>
        <HallBack minutes={BG46_TEXT.morning.clock - 5} calendar={<TearCalendar x={HALL.calendar.x} y={HALL.calendar.y} day={BG46_TEXT.repeat.days[0]} date={13} />} />
        <ChairBack x={X} seat={seat} />
        <ChairSeat x={X} seat={seat} floor={HALL.floorY} />
        <LiveBag uid="hk-bag" f={f} x={bx} y={by} s={BAG_S} face={face} lean={lean} squash={sq} seed={6} blinks={[q - 4]} />
      </Shot>
      <TaleLine f={f} text={BG46_TEXT.tale} at={2} top={196} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: ta, pointerEvents: "none" }}>
        <div
          style={{
            padding: "16px 40px 20px",
            borderRadius: 30,
            backgroundColor: C.yellow,
            color: C.navy,
            fontFamily,
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
            boxShadow: "0 12px 0 #E0A800, 0 22px 36px rgba(20,40,90,0.22)",
            transform: `scale(${ta * pop}) rotate(-2deg)`,
          }}
        >
          {BG46_TEXT.hook.title}
        </div>
        <div style={{ padding: "6px 22px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontSize: 34, fontWeight: 900 }}>{BG46_TEXT.hook.chip}</div>
      </div>
    </>
  );
};

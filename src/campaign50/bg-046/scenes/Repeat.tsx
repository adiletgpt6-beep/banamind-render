// Сцена 3 (≈21–34 с): «Күн сайын кайталанган жол».
// 1) Монтаж пяти дней: отрывной календарь листается (Дүйшөмбү → Жума),
//    стрелки часов прокручиваются, рядом с рюкзаком растёт стопка
//    тетрадей. Рюкзак каждый день у двери: радостно подпрыгивает,
//    зевает, нетерпеливо покачивается, смотрит на часы, вздыхает. Внизу —
//    карточка маршрута ҮЙ → МЕКТЕП / МЕКТЕП → ҮЙ с точками дней недели.
// 2) Мама у календаря с телефоном замечает повторение и сама спрашивает:
//    «Мектепке алып баруу менен кайра алып келүүнү алдын ала кантип
//    уюштурсам болот?» Рюкзак слушает с надеждой, карман шевелится.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { FACE } from "../Backpack";
import { repeatBeats } from "../beats";
import { useScene, useTimeline } from "../context";
import { C } from "../palette";
import { Icon } from "../parts";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, easeOut, keys } from "../rig/motion";
import { BG46_TEXT } from "../script";
import { HALL, ChairBack, ChairSeat, HallBack, TearCalendar } from "../sets/Hall";
import { camMove, Shot } from "../shots";
import { BAG_S, faceKeys, H, hop, LiveBag, SceneLabel } from "./common";

const DAY_COLORS = ["#5B8BD6", "#E5677A", "#3E9C6B", "#7A6BC4", "#F29E38"];

// Тетрадь в стопке (вид спереди-сбоку).
const Book: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly a: number; readonly rot: number }> = ({ x, y, color, a, rot }) => (
  <div style={{ position: "absolute", left: x - 90, top: y - 26 - (1 - a) * 120, width: 180, height: 30, opacity: a, transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 6, backgroundColor: color, boxShadow: "0 4px 0 rgba(0,0,0,0.12)" }} />
    <div style={{ position: "absolute", left: 8, right: 8, top: 8, height: 12, borderRadius: 3, backgroundColor: "#FFFFFF", opacity: 0.85 }} />
  </div>
);

export const RepeatScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const { m01, cut, day, d0, dayStart } = repeatBeats(useTimeline());
  const X = HALL.chair.x;
  const seat = HALL.chair.seat;
  const fy = HALL.floorY;
  const dayOf = (t: number) => Math.max(0, Math.min(4, Math.floor((t - d0) / day)));
  const di = dayOf(f);
  const inDay = f - d0 - di * day;
  const flip = di < 4 && f >= d0 ? clamp((inDay - (day - 9)) / 9) : 0;
  const days = BG46_TEXT.repeat.days;
  // часы: каждый день — полный оборот суток, утром снова 07:25
  const minutes = BG46_TEXT.morning.clock + 1440 * keys(f, [[d0, 0], [d0 + day * 5, 5]], (x) => x);

  // микродействия рюкзака по дням
  const by = (t: number) => seat - 12 - hop(t, dayStart(0) + 6, 50, 13)[0] - hop(t, dayStart(2) + 4, 18, 8)[0] - hop(t, dayStart(2) + 14, 18, 8)[0];
  const sq = (t: number) =>
    hop(t, dayStart(0) + 6, 50, 13)[1] + hop(t, dayStart(2) + 4, 18, 8)[1] + hop(t, dayStart(2) + 14, 18, 8)[1] + keys(t, [[dayStart(4) + 4, 0], [dayStart(4) + 14, 0.32], [dayStart(4) + 26, 0.12]]);
  const lean = (t: number) => keys(t, [[dayStart(2), 0], [dayStart(2) + 8, 40], [dayStart(2) + 16, -40], [dayStart(2) + 24, 0], [dayStart(3) + 2, 0], [dayStart(3) + 10, 20]]);
  const face = (t: number) =>
    faceKeys(t, [
      [0, FACE.happy],
      [dayStart(1), { ...FACE.tired, lidL: 0.55, lidR: 0.55 }],
      [dayStart(2), { ...FACE.curious, lookX: 0.4 }],
      [dayStart(3), { ...FACE.thinking, lookX: 0.1, lookY: -1 }],
      [dayStart(4), FACE.tired],
      [cut, { ...FACE.neutral, lookX: -0.7 }],
      [m01.from, { ...FACE.wonder, lookX: -0.9, lookY: -0.5 }],
      [m01.to, { ...FACE.happy, lookX: -0.7, lookY: -0.4 }],
    ], 7);
  // зевок во второй день (рот «о», без речи)
  const mouthFx = (t: number) => {
    const y = t - dayStart(1) - 4;
    if (y < 0 || y > 22) return null;
    const o = Math.sin((Math.PI * y) / 22);
    return { open: o * 1.1, round: 0.7, wide: 0 };
  };
  // карман шевелится после вопроса мамы (вот-вот выпадет записка)
  const pocket = f > m01.to + 4 ? 0.12 * Math.abs(Math.sin((f - m01.to) * 0.6)) : 0;

  // ---------- 2. мама у календаря ----------
  const mom = (): Place => ({ x: 650, y: fy + 12, h: H.mom });
  const momPose = (t: number): PoseIn => {
    const p = mom();
    const chin = t < m01.from + 24;
    const gesture = keys(t, [[m01.from + 30, 0], [m01.from + 44, 1], [m01.to - 4, 1], [m01.to + 10, 0.4]]);
    return {
      expr: t < m01.from ? "thinking" : t < m01.to ? "calm" : "softSmile",
      armL: { target: { x: p.x - 0.02 * p.h, y: p.y - 0.5 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: 0.7 },
      armR: chin
        ? { target: { x: p.x + 0.06 * p.h, y: p.y - 0.78 * p.h }, shape: "relax", elbow: "hang" }
        : { target: { x: p.x + (0.14 + 0.07 * gesture) * p.h, y: p.y - (0.5 + 0.05 * gesture) * p.h }, shape: "open", elbow: "down" },
      headTilt: keys(t, [[cut, 4], [m01.from, 4], [m01.from + 20, -3], [m01.to, -3], [m01.to + 10, 2]]),
      lookY: keys(t, [[cut, -0.4], [cut + 24, -0.4], [cut + 40, 0.2], [Math.max(cut + 52, m01.from + 10), 0.1]]),
      nod: keys(t, [[m01.to - 10, 0], [m01.to - 3, 4], [m01.to + 6, 0]]),
    };
  };
  // сначала смотрит на календарь (влево), потом на рюкзак (вправо)
  const momFace = (t: number) => keys(t, [[cut, -0.55], [cut + 26, -0.55], [cut + 44, 0.55], [frames, 0.6]]);

  const cardA = easeOut((f - 16) / 12) * (1 - easeOut((f - cut + 8) / 8));
  const calendar = <TearCalendar x={HALL.calendar.x} y={HALL.calendar.y} s={1.1} day={days[di]} date={13 + di} next={di < 4 ? { day: days[di + 1], date: 14 + di } : undefined} flip={flip} />;
  return (
    <>
      <Shot f={f} from={0} to={cut} cam={camMove(f, 0, cut, { x: 900, y: 900, zoom: 1.3 }, { x: 910, y: 905, zoom: 1.36 })}>
        <HallBack minutes={minutes} calendar={calendar} light={0.6 + 0.4 * Math.abs(Math.sin(f / 24))} />
        <ChairBack x={X} seat={seat} />
        <ChairSeat x={X} seat={seat} floor={fy} />
        {DAY_COLORS.map((c, i) => (
          <Book key={i} x={X + 250} y={fy + 30 - i * 30} color={c} a={easeOut((f - dayStart(i) - 4) / 8)} rot={(i % 2 ? 2 : -3) + (i === 4 ? 4 : 0)} />
        ))}
        <LiveBag uid="r-bag" f={f} x={() => X} y={by} s={BAG_S} face={face} lean={lean} squash={sq} seed={11} mouthFx={mouthFx} blinks={[dayStart(0) + 2, dayStart(3) + 20]} />
      </Shot>
      <Shot f={f} from={cut} to={frames} cam={camMove(f, cut, frames, { x: 840, y: 1010, zoom: 1.32 }, { x: 840, y: 1000, zoom: 1.42 })}>
        <HallBack minutes={BG46_TEXT.morning.clock} calendar={<TearCalendar x={HALL.calendar.x} y={HALL.calendar.y} s={1.1} day={days[4]} date={17} />} />
        <ChairBack x={X} seat={seat} />
        <ChairSeat x={X} seat={seat} floor={fy} />
        {DAY_COLORS.map((c, i) => (
          <Book key={i} x={X + 250} y={fy + 30 - i * 30} color={c} a={1} rot={(i % 2 ? 2 : -3) + (i === 4 ? 4 : 0)} />
        ))}
        <LiveBag uid="r-bag2" f={f} x={() => X} y={() => seat - 12} s={BAG_S} face={face} seed={11} pocket={pocket} lean={(t) => keys(t, [[m01.from, 0], [m01.from + 14, -24]])} />
        <Actor uid="r-mom" look="mom" f={f} place={mom} face={momFace} pose={momPose} role="mother" seed={8} />
      </Shot>
      {/* карточка маршрута и дни недели (только в монтаже) */}
      {cardA > 0.01 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 1300, opacity: cardA, transform: `translateY(${(1 - cardA) * 30}px)`, pointerEvents: "none" }}>
          <div style={{ padding: "22px 30px", borderRadius: 30, backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 14px 34px rgba(20,40,90,0.18)", fontFamily, color: C.navy }}>
            {[BG46_TEXT.repeat.am, BG46_TEXT.repeat.pm].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 38, fontWeight: 900, marginTop: i ? 10 : 0 }}>
                <Icon kind={i ? "school" : "home"} s={0.8} />
                {t}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              {days.map((d, i) => (
                <div key={d} style={{ padding: "6px 12px", borderRadius: 12, fontSize: 24, fontWeight: 900, backgroundColor: i <= di ? C.yellow : "#EEF2F8", color: C.navy, transform: `scale(${i === di ? 1.08 : 1})` }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <SceneLabel f={f} text={BG46_TEXT.repeat.label} at={4} out={cut - 6} />
    </>
  );
};

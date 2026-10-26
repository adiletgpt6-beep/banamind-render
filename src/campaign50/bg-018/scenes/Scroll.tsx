// Сцена 3: мама листает семейный чат на неделю назад. Лента быстро
// уходит вниз, палец мамы останавливает прокрутку — и видно: каждый день
// один и тот же вопрос. Лента отъезжает, все вопросы подсвечиваются
// жёлтым. Внизу — крупный план мамы: удивление, затем задумчивость.
import { interpolate, useCurrentFrame } from "remotion";
import { Actor, atBody, type Place } from "../../../two-schedules-2d/rig/Actor";
import { keys } from "../../../two-schedules-2d/rig/motion";
import { beatsOf } from "../beats";
import { useLine, useSceneFrames, useTimeline } from "../context";
import { ADULT_H, FLOOR, MomBack, Panel, seatHeight, WoodChair } from "../sets";
import { abs, Bubble, C, clamp, DayChip, font, pop, SoftBackdrop } from "../ui";
import { ChatHeader } from "./Hook";

type Day = { day: string; ask: "mom" | "dad"; askTime: string; reply: string; replyTime: string };

// Художественная переписка вымышленной семьи.
export const WEEK: readonly Day[] = [
  { day: "Дүйшөмбү, 5-октябрь", ask: "mom", askTime: "07:50", reply: "Мен алып келем.", replyTime: "07:56" },
  { day: "Шейшемби, 6-октябрь", ask: "dad", askTime: "08:02", reply: "Саат экиде бошоном.", replyTime: "08:10" },
  { day: "Шаршемби, 7-октябрь", ask: "mom", askTime: "07:45", reply: "Жолугушуум бар.", replyTime: "07:58" },
  { day: "Бейшемби, 8-октябрь", ask: "dad", askTime: "07:55", reply: "Мен кечигем.", replyTime: "08:04" },
  { day: "Жума, 9-октябрь", ask: "mom", askTime: "07:49", reply: "Бир аздан кийин тактайын.", replyTime: "08:15" },
  { day: "Дүйшөмбү, 12-октябрь", ask: "mom", askTime: "07:48", reply: "Мен алып келем.", replyTime: "07:53" },
  { day: "Шейшемби, 13-октябрь", ask: "dad", askTime: "08:05", reply: "Билбейм, азыр жыйындамын.", replyTime: "08:20" },
  { day: "Шаршемби, 14-октябрь", ask: "mom", askTime: "07:52", reply: "Бир аздан кийин тактайын.", replyTime: "08:12" },
];

const ROW = 400; // высота дня в ленте (px)
const MOM: Place = { x: 540, y: FLOOR, h: ADULT_H };

export const ScrollScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { len } = useSceneFrames("scroll");
  const b = beatsOf(tl).scroll;
  const n02a = useLine("n02a");
  const n02b = useLine("n02b");

  // прокрутка: от последнего дня к первому, плавная остановка пальцем
  const total = WEEK.length * ROW;
  const endOffset = 0; // показан первый день сверху
  const startOffset = total - 3 * ROW;
  const u = interpolate(f, [b.start, b.stop], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - u, 2.4);
  const offset = interpolate(eased, [0, 1], [startOffset, endOffset]);
  // после остановки лента отъезжает: видно сразу много дней
  const zoomOut = interpolate(f, [b.stop + 6, b.stop + 36], [1, 0.52], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });

  // палец: свайпы вверх-вниз, затем касание и удержание
  const swipe = f < b.stop ? ((f - b.start) % 18) / 18 : 0;
  const fingerY = f < b.stop ? interpolate(swipe, [0, 0.6, 1], [980, 620, 980]) : keys(f, [[b.stop, 760], [b.stop + 30, 760], [b.stop + 44, 1250]]);
  const fingerO = interpolate(f, [b.start - 4, b.start, b.stop + 32, b.stop + 44], [0, 1, 1, 0], clamp);
  const press = f >= b.stop && f < b.stop + 30 ? 1 : 0;

  // мама крупно
  const momPose = (t: number) => ({
    expr: t < b.stop ? ("calm" as const) : t < b.stop + 30 ? ("surprised" as const) : t < n02b.from ? ("thinking" as const) : ("worried" as const),
    sit: 1,
    seat: seatHeight(),
    lookY: t < b.stop + 24 ? 0.5 : keys(t, [[b.stop + 24, 0.5], [b.stop + 40, 0.1], [n02a.to, 0.1], [n02b.from + 10, 0.3]]),
    lookX: keys(t, [[n02b.from, 0], [n02b.from + 12, -0.3]]),
    headTilt: keys(t, [[b.stop + 30, 0], [b.stop + 46, -5]]),
    armL: { target: atBody(MOM, -40, -560), shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: 12, elbow: "hang" as const, behind: false },
    armR: { target: atBody(MOM, 50, -580), shape: "point" as const, elbow: "hang" as const, behind: false },
  });

  return (
    <>
      <SoftBackdrop f={f} tint="#F1F5FB" />
      {/* лента чата */}
      <div style={abs({ left: 50, right: 50, top: 70, height: 1060, borderRadius: 40, background: C.white, boxShadow: "0 14px 40px rgba(22,52,107,0.14)", overflow: "hidden" })}>
        <div style={abs({ left: 20, right: 20, top: 20, zIndex: 2 })}>
          <ChatHeader scale={0.85} />
        </div>
        <div style={abs({ left: 0, right: 0, top: 150, bottom: 0, overflow: "hidden" })}>
          <div style={abs({ left: 0, right: 0, top: 0, height: total, transform: `scale(${zoomOut}) translateY(${-offset}px)`, transformOrigin: "50% 0" })}>
            {WEEK.map((d, i) => {
              const hl = interpolate(f, [b.stop + 30 + i * 5, b.stop + 42 + i * 5], [0, 1], clamp);
              const askSide = d.ask === "mom" ? "right" : "left";
              const replyWho = d.ask === "mom" ? "dad" : "mom";
              return (
                <div key={d.day} style={abs({ left: 30, right: 30, top: i * ROW + 10, height: ROW })}>
                  <DayChip text={d.day} active={hl * 0.7} />
                  <div style={{ height: 18 }} />
                  <Bubble who={d.ask} side={askSide} text="Бүгүн ким алып кетет?" time={d.askTime} highlight={hl} scale={1.05} />
                  <div style={{ height: 18 }} />
                  <Bubble who={replyWho} side={askSide === "right" ? "left" : "right"} text={d.reply} time={d.replyTime} scale={0.92} />
                </div>
              );
            })}
          </div>
        </div>
        {/* палец мамы */}
        <div style={abs({ left: 700, top: fingerY - 150, opacity: fingerO, transform: `scale(${1 - press * 0.06})` })}>
          <svg width={150} height={320} viewBox="0 0 150 320">
            <path d="M 40 300 L 40 70 Q 40 30 75 30 Q 110 30 110 70 L 110 300 Z" fill="#E8B894" />
            <path d="M 52 74 Q 52 46 75 46 Q 98 46 98 74 L 98 96 Q 75 104 52 96 Z" fill="#F6D7C2" />
            {press ? <circle cx={75} cy={36} r={40} fill="none" stroke={C.yellow} strokeWidth={8} opacity={0.8} /> : null}
          </svg>
        </div>
      </div>
      {/* «каждый день — один и тот же вопрос» */}
      {(() => {
        const p = pop(f, b.stop + 52, 12);
        return (
          <div style={abs({ left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", transform: `scale(${p})`, opacity: Math.min(1, p) })}>
            <div style={{ padding: "16px 34px", borderRadius: 40, background: C.yellow, boxShadow: "0 10px 26px rgba(255,170,0,0.35)", ...font(46, 1000, C.navy) }}>Ар күнү — ошол эле суроо</div>
          </div>
        );
      })()}
      {/* мама крупно */}
      <Panel top={1170} height={310} left={50} width={980} radius={36} cam={{ x: MOM.x, y: 470, zoom: 1.35 + 0.05 * interpolate(f, [0, len], [0, 1], clamp) }} style={{ boxShadow: "0 12px 30px rgba(22,52,107,0.16)" }}>
        <MomBack f={f} />
        <WoodChair x={MOM.x} />
        <Actor uid="c3-mom" look="mom" f={f} place={() => MOM} face={() => 0} pose={momPose} role="mother" seed={1} />
      </Panel>
    </>
  );
};

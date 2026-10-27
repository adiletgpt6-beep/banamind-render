// Сцена 3. Два дела на одно время.
// A. Телефон в руке Айжан крупно: сообщение «БУЛАК кафеси» —
//    «Жолугушууну 13:30га жылдырсак болобу?». Сначала она читает (текст
//    держится ≈ 2,5 с), только потом —
// B. её лицо: спокойная собранность сменяется задумчивостью.
// C. Календарь дня: встреча «БУЛАК: жолугушуу» переезжает с 11:00 на 13:30
//    (на «жылдырышты»), рядом школьная запись «Сабактын бүтүшү — 13:30»
//    подсвечивается на «сабагы». Небольшой янтарный акцент на совпадении,
//    без сирены и красных крестов. Время в фильме везде одно: 13:30.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { T3bTimeline } from "../timing";
import { CloseHand } from "../props/CloseHand";
import { StudioBack } from "../sets/Studio";
import { MOM_HAND } from "./Studio";

export const calendarPlan = (tl: T3bTimeline) => {
  const T = sceneTools(tl, "calendar");
  const n02 = T.from("N02");
  const face = n02 - 18;
  const cal = n02 + 22;
  return { msg: 8, face, cal, move: T.word("N02", "жылдырышты"), school: T.word("N02", "сабагы") - 4, len: T.len };
};
type P = ReturnType<typeof calendarPlan>;

// Телефон с сообщением (крупно, в руке).
export const PhoneMessage: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const k = easeOut(clamp((f - at) / 10));
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E2D4" }}>
      <div style={box({ left: 250, top: 300, width: 580, height: 1180, backgroundColor: C.navy, borderRadius: 64 })} />
      <div style={box({ left: 272, top: 340, width: 536, height: 1100, backgroundColor: "#F3F0EA", borderRadius: 46, overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: 536, height: 150, backgroundColor: "#FFFFFF" })} />
        <div style={box({ left: 30, top: 60, width: 70, height: 70, borderRadius: 35, backgroundColor: C.bulakA })} />
        <div style={box({ left: 120, top: 72, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: C.navy })}>{T3B_TEXT.chatFrom}</div>
        <div style={box({ left: 30, top: 260, width: 440, padding: "26px 30px", backgroundColor: "#FFFFFF", borderRadius: "30px 30px 30px 8px", fontFamily: F.text, fontWeight: 800, fontSize: 44, lineHeight: 1.25, color: C.navy, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, boxSizing: "border-box" })}>
          {T3B_TEXT.message}
        </div>
      </div>
      <Svg>
        <CloseHand x={220} y={1700} angle={200} size={260} {...MOM_HAND} shape="grip" armLen={3} />
      </Svg>
    </AbsoluteFill>
  );
};

const MOM: Place = { x: 560, y: 2350, h: 1500 };
const Face: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.face;
  const think = easeInOut(clamp((t - 6) / 14));
  return (
    <Shot f={f} cam={{ x: 540, y: 1000, zoom: 1 }} bg={C.studioWall}>
      <div style={box({ left: 0, top: 0 })}>
        <div style={box({ left: -200, top: -200, width: 1500, height: 2400 })}>
          <StudioBack />
        </div>
      </div>
      <Actor
        uid="s3-mom"
        look="aizhan"
        f={f}
        place={() => MOM}
        face={(tt) => keys(tt, [[p.face, 0.1], [p.face + 14, 0.25]])}
        pose={() => ({
          expr: { browIn: lerp(1, 5, think), browOut: lerp(1, -1, think), lid: lerp(0.12, 0.2, think), smile: lerp(0.25, -0.05, think) },
          lookY: lerp(0.5, 0.15, think),
          lookX: lerp(0, 0.3, think),
          armL: { target: { x: 520, y: 1500 }, shape: "phone", item: "phone", glow: 1, elbow: "down", behind: false },
        })}
        seed={5}
      />
    </Shot>
  );
};

// Календарь дня: часы 10:00–15:00, шаг 1 ч = 220 px.
const HOUR = 220;
const yOf = (h: number) => 360 + (h - 10) * HOUR;
const Calendar: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const mv = easeInOut(clamp((f - p.move) / 22));
  const sc = easeOut(clamp((f - p.school) / 10));
  const meetY = lerp(yOf(11), yOf(13.5), mv);
  const glow = sc * (0.6 + 0.4 * Math.sin(Math.max(0, f - p.school) / 6));
  const appear = easeOut(clamp((f - p.cal) / 10));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <div style={box({ left: 80, top: 190, fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.navy, opacity: appear })}>{T3B_TEXT.calendar.title}</div>
      {[10, 11, 12, 13, 14, 15].map((h) => (
        <div key={h} style={box({ left: 80, top: yOf(h) - 24, width: 920, opacity: appear })}>
          <div style={box({ left: 0, top: 0, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.inkSoft })}>{`${h}:00`}</div>
          <div style={box({ left: 140, top: 24, width: 780, height: 3, backgroundColor: "#DDD5C6" })} />
        </div>
      ))}
      {/* школьная запись (зелёная) — справа */}
      <div style={box({ left: 610, top: yOf(13.5) - 6, width: 390, height: 230, borderRadius: 22, backgroundColor: C.green, color: C.white, padding: "22px 26px", boxSizing: "border-box", fontFamily: F.text, fontWeight: 800, fontSize: 40, lineHeight: 1.18, opacity: appear, boxShadow: glow > 0 ? `0 0 0 ${8 * glow}px ${C.amber}` : "none" })}>
        {T3B_TEXT.calendar.school}
      </div>
      {/* встреча: переезжает с 11:00 на 13:30 */}
      <div style={box({ left: 220, top: meetY - 6, width: 370, height: 230, borderRadius: 22, backgroundColor: C.navy, color: C.paper, padding: "22px 26px", boxSizing: "border-box", opacity: appear, boxShadow: glow > 0 ? `0 0 0 ${8 * glow}px ${C.amber}` : "none" })}>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40, lineHeight: 1.18 }}>{T3B_TEXT.calendar.meeting}</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 52, marginTop: 10, color: C.yellow }}>{mv < 0.5 ? T3B_TEXT.calendar.oldTime : T3B_TEXT.calendar.newTime}</div>
      </div>
      {/* след прежнего времени */}
      {mv > 0 ? <div style={box({ left: 220, top: yOf(11) - 6, width: 370, height: 230, borderRadius: 22, border: `4px dashed #B8B2A6`, boxSizing: "border-box", opacity: 0.8 * mv })} /> : null}
      {/* янтарная линия совпадения */}
      {sc > 0 ? <div style={box({ left: 120, top: yOf(13.5) - 22, width: 880 * sc, height: 8, borderRadius: 4, backgroundColor: C.amber })} /> : null}
    </AbsoluteFill>
  );
};

export const CalendarScene: React.FC = () => {
  const { f } = useScene("calendar");
  const p = usePlan(calendarPlan);
  if (f < p.face) return <PhoneMessage f={f} at={p.msg} />;
  if (f < p.cal) return <Face f={f} p={p} />;
  return <Calendar f={f} p={p} />;
};

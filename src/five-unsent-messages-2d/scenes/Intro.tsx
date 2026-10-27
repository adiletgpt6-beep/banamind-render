// Сцены 1–2.
// 1. Пять компактных карточек со звуковыми волнами проявляются одна за
//    другой; рядом простые «5» и «0». Названия дней и содержание записей
//    пока не раскрываются. В конце — короткий вопрос «Эмне үчүн?».
// 2. «Буга чейин»: отец в кабинете отдела продаж, календарь, входящие
//    задачи; карточка «Мектеп» встаёт между рабочими встречами; коротко
//    — путь «Кеңсе → Мектеп → Үй».
import { fontFamily } from "../../fonts";
import { Actor } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT } from "../script";
import { C } from "../theme";
import { idleView, MemoHeader, MemoRow } from "../graphics/Memo";
import { OfficeBack, OfficeDesk } from "../sets/Room";
import { onTable, seated, seatOf } from "./common";
import { PanelArea, Stage, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

export const IntroScene: React.FC = () => {
  const { f, word, to } = useScene("intro");
  const five = easeOut((f - (word("n01", 2) - 2)) / 8); // «беш»
  const zero = easeOut((f - (word("n01", 5) - 2)) / 8); // «Бирин да жөнөткөн эмес»
  const whyAt = Math.min(to("n01") - 6, 222);
  const why = easeOut((f - whyAt) / 9);
  return (
    <PanelArea>
      <div style={box({ left: 40, top: 34 })}>
        <MemoHeader w={600} />
      </div>
      {/* 5 записей · 0 отправленных */}
      <div style={box({ left: 40, right: 40, top: 100, height: 170, display: "flex", gap: 24, fontFamily })}>
        <div style={{ flex: 1, borderRadius: 24, border: `2px solid ${C.yellow}`, backgroundColor: "rgba(255,211,61,0.08)", display: "flex", alignItems: "center", gap: 20, padding: "0 28px", opacity: five, translate: `0 ${(1 - five) * 14}px` }}>
          <div style={{ fontSize: 120, fontWeight: 900, color: C.yellow, lineHeight: 1 }}>5</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.text, lineHeight: 1.15 }}>үн<br />билдирүү</div>
        </div>
        <div style={{ flex: 1, borderRadius: 24, border: `2px solid ${C.line}`, backgroundColor: "rgba(5,11,23,0.5)", display: "flex", alignItems: "center", gap: 20, padding: "0 28px", opacity: zero, translate: `0 ${(1 - zero) * 14}px` }}>
          <div style={{ fontSize: 120, fontWeight: 900, color: C.text, lineHeight: 1 }}>0</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.blue, lineHeight: 1.15 }}>жөнөтүлгөн</div>
        </div>
      </div>
      {/* пять карточек: волны проявляются одна за другой */}
      <div style={box({ left: 40, top: 300, display: "flex", flexDirection: "column", gap: 10 })}>
        {FU2_RECORDS.map((r, i) => {
          const a = easeOut((f - (10 + i * 11)) / 10);
          return (
            <div key={r.id} style={{ opacity: a * (1 - 0.55 * why), translate: `${(1 - a) * 40}px 0` }}>
              <MemoRow id={r.id} w={860} view={idleView} f={f} showDay={false} compact />
            </div>
          );
        })}
      </div>
      {/* «Эмне үчүн?» */}
      <div style={box({ left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", opacity: why })}>
        <div style={{ padding: "26px 60px", borderRadius: 30, backgroundColor: "rgba(5,11,23,0.92)", border: `3px solid ${C.blue}`, fontFamily, fontSize: 92, fontWeight: 900, color: C.text, scale: `${0.92 + 0.08 * why}`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>{FU2_TEXT.why}</div>
      </div>
    </PanelArea>
  );
};

// ---------- 2. Буга чейин ----------
const DAD = seated("dad", 960);
const CAL = [
  { time: "14:00", text: FU2_TEXT.calendar.meetingA, school: false },
  { time: "15:00", text: FU2_TEXT.calendar.school, school: true },
  { time: "16:00", text: FU2_TEXT.calendar.meetingB, school: false },
] as const;
const TASKS = ["Кардар чалды", "Келишимди карап чык", "Жаңы сунуш"] as const;

export const BeforeScene: React.FC = () => {
  const { f } = useScene("before");
  const pill = easeOut(f / 8) * (1 - easeInOut(clamp((f - 34) / 10)));
  const show = easeOut((f - 30) / 10);
  // отец печатает → смотрит на часы (школа) → снова к ноутбуку
  const watchAt = 92;
  const dadPose = (tt: number) => ({
    expr: tt < watchAt ? ("calm" as const) : ("thinking" as const),
    sit: 1,
    seat: seatOf(DAD),
    armL: { target: tt > watchAt - 4 && tt < watchAt + 34 ? { x: DAD.x - 0.02 * DAD.h, y: DAD.y - 0.66 * DAD.h } : onTable(DAD.x - 0.12 * DAD.h + Math.sin(tt * 0.9) * 4, -8), shape: "relax" as const, elbow: "down" as const, behind: false, wrist: tt > watchAt && tt < watchAt + 34 ? 70 : 0 },
    armR: { target: onTable(DAD.x + 0.12 * DAD.h + Math.sin(tt * 0.8 + 1) * 4, -8), shape: "relax" as const, elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.5], [watchAt - 4, 0.5], [watchAt + 4, 0.75], [watchAt + 30, 0.75], [watchAt + 40, 0.5]]),
    lookX: keys(tt, [[watchAt - 4, 0], [watchAt + 4, -0.4], [watchAt + 30, -0.4], [watchAt + 40, 0]]),
  });
  // маршрут: Кеңсе → Мектеп → Үй, маркер проходит один раз
  const route = cruise((f - 112) / 50, 0.3);
  const routeA = easeOut((f - 104) / 8);
  return (
    <PanelArea>
      {/* кабинет: отец за ноутбуком */}
      <Stage cam={{ x: 960, y: 1000, zoom: 0.95 }} inset={{ x: 24, y: 24, w: 470, h: 470 }} opacity={show}>
        <OfficeBack />
        <Actor uid="b2-dad" look="salesDad" f={f} place={() => DAD} face={() => 0} pose={dadPose} role="father" seed={2} />
        <OfficeDesk />
      </Stage>
      <div style={box({ left: 44, top: 430, padding: "8px 18px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.85)", border: `2px solid ${C.line}`, fontFamily, fontSize: 28, fontWeight: 800, color: C.blue, opacity: show })}>{FU2_TEXT.sales}</div>
      {/* календарь: «Мектеп» встаёт между встречами */}
      <div style={box({ left: 514, top: 24, width: 402, fontFamily, opacity: show })}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.dim, marginBottom: 12 }}>Календарь</div>
        {CAL.map((c, i) => {
          const at = c.school ? 66 : 38 + i * 6;
          const a = easeOut((f - at) / 9);
          const grow = c.school ? a : 1;
          return (
            <div key={c.time} style={{ height: 104 * grow, opacity: c.school ? a : 1, marginBottom: 10 * grow, overflow: "hidden" }}>
              <div style={{ height: 104, borderRadius: 18, padding: "12px 18px", boxSizing: "border-box", backgroundColor: c.school ? "rgba(169,208,236,0.16)" : "rgba(5,11,23,0.55)", border: `2px solid ${c.school ? C.blue : C.lineSoft}` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.dim }}>{c.time}</div>
                <div style={{ fontSize: 31, fontWeight: 900, color: c.school ? C.blue : C.text, whiteSpace: "nowrap" }}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* входящие задачи */}
      <div style={box({ left: 514, top: 400, width: 402, display: "flex", flexDirection: "column", gap: 10, fontFamily })}>
        {TASKS.map((s, i) => {
          const a = easeOut((f - (74 + i * 9)) / 8);
          return (
            <div key={s} style={{ padding: "10px 18px", borderRadius: 16, backgroundColor: "rgba(5,11,23,0.6)", border: `2px solid ${C.lineSoft}`, fontSize: 27, fontWeight: 800, color: C.text, opacity: a, translate: `${(1 - a) * 30}px 0`, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.blue }} />
              {s}
            </div>
          );
        })}
      </div>
      {/* Кеңсе → Мектеп → Үй */}
      <div style={box({ left: 40, right: 40, top: 560, height: 160, borderRadius: 24, backgroundColor: "rgba(5,11,23,0.5)", border: `2px solid ${C.lineSoft}`, opacity: routeA, fontFamily })}>
        <svg width={860} height={160} style={box({ left: 0, top: 0 })}>
          <line x1={90} y1={64} x2={770} y2={64} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
          <line x1={90} y1={64} x2={lerp(90, 770, route)} y2={64} stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
          {[90, 430, 770].map((x, i) => (
            <circle key={x} cx={x} cy={64} r={16} fill={route >= i / 2 - 0.01 ? C.blue : C.panel} stroke={C.blue} strokeWidth={4} />
          ))}
          <circle cx={lerp(90, 770, route)} cy={64} r={13} fill={C.yellow} />
        </svg>
        {[FU2_TEXT.office, FU2_TEXT.school, FU2_TEXT.home].map((s, i) => (
          <div key={s} style={box({ left: 90 + i * 340 - 110, width: 220, top: 96, textAlign: "center", fontSize: 32, fontWeight: 900, color: C.text })}>{s}</div>
        ))}
      </div>
      {/* метка «Буга чейин» */}
      <div style={box({ left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: pill })}>
        <div style={{ padding: "22px 54px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.95)", border: `3px solid ${C.blue}`, fontFamily, fontSize: 70, fontWeight: 900, color: C.blue }}>{FU2_TEXT.before}</div>
      </div>
    </PanelArea>
  );
};


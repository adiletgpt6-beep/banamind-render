// Сцены 1–2.
// 1. Телефон сына крупно: обычный диктофон, папка «Атама» («Атама» — «для
//    папы»). Пять записей появляются одна за другой, у каждой — «Жөнөтүлгөн
//    эмес». Это локальные записи на телефоне ребёнка, не приложение BalaGo
//    и не чат. Число «5 / 0» не дублируется отдельными счётчиками — его
//    несут заголовок и голос. Названия дней пока скрыты. В конце — короткий
//    вопрос «Эмне үчүн?».
// 2. «Буга чейин»: отец в кабинете отдела продаж. События идут по очереди,
//    по одной крупной карточке: «15:00 Мектеп» между встречами → путь
//    «Кеңсе → Мектеп → Үй» → снова за ноутбук, работа не закончена.
import { fontFamily } from "../../fonts";
import { Actor } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT } from "../script";
import { C } from "../theme";
import { idleView, MemoHeader, MemoRow } from "../graphics/Memo";
import { OfficeBack, OfficeDesk } from "../sets/Room";
import { onTable, seated, seatOf } from "./common";
import { BOY_PHONE } from "./Gate";
import { PanelArea, Stage, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

export const IntroScene: React.FC = () => {
  const { f, to } = useScene("intro");
  const whyAt = Math.min(to("n01") - 6, 222);
  const why = easeOut((f - whyAt) / 9);
  const phone = easeOut((f + 4) / 12);
  return (
    <PanelArea>
      {/* телефон сына (бирюзовый чехол), экран — диктофон, папка «Атама» */}
      <div style={box({ left: 60, top: 40, width: 820, height: 1000, borderRadius: 64, backgroundColor: "#071224", border: `12px solid ${BOY_PHONE}`, boxSizing: "border-box", opacity: phone, translate: `0 ${(1 - phone) * 30}px`, boxShadow: "0 30px 70px rgba(0,0,0,0.55)" })}>
        <div style={box({ left: 330, top: 18, width: 136, height: 14, borderRadius: 7, backgroundColor: "#1B2A40" })} />
        <div style={box({ left: 44, top: 60 })}>
          <MemoHeader w={700} size={0.9} />
        </div>
        <div style={box({ left: 44, top: 116, fontFamily, fontSize: 96, fontWeight: 900, color: C.text, lineHeight: 1 })}>{FU2_TEXT.folder}</div>
        <div style={box({ left: 30, top: 258, display: "flex", flexDirection: "column", gap: 14 })}>
          {FU2_RECORDS.map((r, i) => {
            const a = easeOut((f - (14 + i * 12)) / 10);
            return (
              <div key={r.id} style={{ opacity: a * (1 - 0.55 * why), translate: `${(1 - a) * 40}px 0` }}>
                <MemoRow id={r.id} w={736} view={idleView} f={f} showDay={false} />
              </div>
            );
          })}
        </div>
      </div>
      {/* «Эмне үчүн?» */}
      <div style={box({ left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: why })}>
        <div style={{ padding: "26px 60px", borderRadius: 30, backgroundColor: "rgba(5,11,23,0.92)", border: `3px solid ${C.blue}`, fontFamily, fontSize: 96, fontWeight: 900, color: C.text, scale: `${0.92 + 0.08 * why}`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>{FU2_TEXT.why}</div>
      </div>
    </PanelArea>
  );
};

// ---------- 2. Буга чейин ----------
// отец сидит сбоку от ноутбука — лицо не закрыто крышкой
const DAD = seated("dad", 1300);
const CAL = [
  { time: "14:00", text: FU2_TEXT.calendar.meetingA, school: false },
  { time: "15:00", text: FU2_TEXT.calendar.school, school: true },
  { time: "16:00", text: FU2_TEXT.calendar.meetingB, school: false },
] as const;

export const BeforeScene: React.FC = () => {
  const { f } = useScene("before");
  const show = easeOut((f + 2) / 10);
  // отец печатает → календарь: «Мектеп» между встречами → взгляд на часы
  // → путь «Кеңсе → Мектеп → Үй» → снова ноутбук: работа не закончена
  const CAL_IN = 40;
  const SCHOOL_IN = 58;
  const watchAt = 84;
  const ROUTE_IN = 110;
  const BACK = 152;
  const typing = (tt: number) => tt < watchAt - 6 || tt > BACK + 4;
  const dadPose = (tt: number) => ({
    expr: tt < watchAt ? ("calm" as const) : tt < BACK ? ("thinking" as const) : ("tired" as const),
    sit: 1,
    seat: seatOf(DAD),
    armL: { target: tt > watchAt - 4 && tt < watchAt + 34 ? { x: DAD.x - 0.02 * DAD.h, y: DAD.y - 0.66 * DAD.h } : onTable(DAD.x - 0.34 * DAD.h + (typing(tt) ? Math.sin(tt * 0.9) * 4 : 0), -8), shape: "relax" as const, elbow: "down" as const, behind: false, wrist: tt > watchAt && tt < watchAt + 34 ? 70 : 0 },
    armR: { target: onTable(DAD.x - 0.16 * DAD.h + (typing(tt) ? Math.sin(tt * 0.8 + 1) * 4 : 0), -8), shape: "relax" as const, elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.5], [watchAt - 4, 0.5], [watchAt + 4, 0.75], [watchAt + 30, 0.75], [watchAt + 40, 0.2], [BACK - 4, 0.2], [BACK + 4, 0.5]]),
    lookX: keys(tt, [[watchAt - 4, 0], [watchAt + 4, -0.4], [watchAt + 30, -0.4], [watchAt + 40, 0]]),
    exhale: keys(tt, [[BACK, 0], [BACK + 10, 0.6], [BACK + 26, 0.2]]),
  });
  const calA = easeOut((f - CAL_IN) / 9) * (1 - easeOut((f - (ROUTE_IN - 8)) / 8));
  const routeA = easeOut((f - ROUTE_IN) / 8) * (1 - easeOut((f - (BACK - 6)) / 8));
  const route = cruise((f - (ROUTE_IN + 4)) / 34, 0.3);
  const leftA = easeOut((f - (BACK + 2)) / 8);
  const salesA = easeOut((f - 6) / 8) * (1 - easeOut((f - (CAL_IN - 6)) / 8));
  return (
    <PanelArea>
      {/* кабинет: отец за ноутбуком — крупно, на всю панель */}
      <Stage cam={{ x: 1110, y: 1130 + 12 * easeInOut(clamp(f / 180)), zoom: 1.34 + 0.06 * easeInOut(clamp(f / 180)) }} opacity={show}>
        <OfficeBack />
        <Actor uid="b2-dad" look="salesDad" f={f} place={() => DAD} face={(tt) => keys(tt, [[0, -0.55], [watchAt - 6, -0.55], [watchAt + 2, -0.2], [BACK - 2, -0.2], [BACK + 8, -0.55]])} pose={dadPose} role="father" seed={2} />
        <OfficeDesk />
      </Stage>
      <div style={box({ left: 28, top: 28, padding: "10px 22px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.85)", border: `2px solid ${C.line}`, fontFamily, fontSize: 36, fontWeight: 800, color: C.blue, opacity: salesA })}>{FU2_TEXT.sales}</div>
      {/* 1) календарь: «Мектеп» встаёт между встречами */}
      <div style={box({ left: 40, right: 40, bottom: 34, padding: "22px 26px 12px", borderRadius: 30, backgroundColor: "rgba(5,11,23,0.92)", border: `2px solid ${C.line}`, fontFamily, opacity: calA, translate: `0 ${(1 - calA) * 30}px` })}>
        {CAL.map((c) => {
          const a = c.school ? easeOut((f - SCHOOL_IN) / 9) : 1;
          return (
            <div key={c.time} style={{ height: 96 * a, opacity: a, marginBottom: 12 * a, overflow: "hidden" }}>
              <div style={{ height: 96, borderRadius: 20, display: "flex", alignItems: "center", gap: 24, padding: "0 24px", boxSizing: "border-box", backgroundColor: c.school ? "rgba(169,208,236,0.18)" : "rgba(16,34,57,0.9)", border: `3px solid ${c.school ? C.blue : C.lineSoft}` }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.dim, width: 120 }}>{c.time}</div>
                <div style={{ fontSize: 46, fontWeight: 900, color: c.school ? C.blue : C.text, whiteSpace: "nowrap" }}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 2) Кеңсе → Мектеп → Үй */}
      <div style={box({ left: 40, right: 40, bottom: 34, height: 220, borderRadius: 30, backgroundColor: "rgba(5,11,23,0.92)", border: `2px solid ${C.line}`, opacity: routeA, translate: `0 ${(1 - routeA) * 30}px`, fontFamily })}>
        <svg width={860} height={220} style={box({ left: 0, top: 0 })}>
          <line x1={110} y1={84} x2={750} y2={84} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
          <line x1={110} y1={84} x2={lerp(110, 750, route)} y2={84} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
          {[110, 430, 750].map((x, i) => (
            <circle key={x} cx={x} cy={84} r={22} fill={route >= i / 2 - 0.01 ? C.blue : C.panel} stroke={C.blue} strokeWidth={5} />
          ))}
          <circle cx={lerp(110, 750, route)} cy={84} r={17} fill={C.yellow} />
        </svg>
        {[FU2_TEXT.office, FU2_TEXT.school, FU2_TEXT.home].map((s, i) => (
          <div key={s} style={box({ left: 110 + i * 320 - 130, width: 260, top: 128, textAlign: "center", fontSize: 46, fontWeight: 900, color: C.text })}>{s}</div>
        ))}
      </div>
      {/* 3) снова за ноутбуком: работа не закончена */}
      <div style={box({ left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", opacity: leftA, translate: `0 ${(1 - leftA) * 20}px` })}>
        <div style={{ padding: "18px 40px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.92)", border: `3px solid ${C.coral}`, fontFamily, fontSize: 50, fontWeight: 900, color: C.text }}>{FU2_TEXT.unfinished}</div>
      </div>
    </PanelArea>
  );
};

// Сцена 3: «Үзүлүү → кайра көңүл топтоо».
//
// Крупно принтер: в ровном ритме выходят пять листов рабочей недели
// (Дүйшөмбү … Жума). Затем вид сверху: листы лежат на столе, мама сама
// отмечает ручкой на каждом один и тот же разрыв — «мектеп жолу» в
// 12:30 (повторяется каждый день). На словах «кайра баштоо» строки после
// разрыва на всех листах бледнеют и идут пунктиром — работу приходится
// собирать заново. В конце мама кладёт чистый лист и пишет вопрос
// «Алдын ала уюштурулса?» — сравнение, без волшебной кнопки.
// Диктор: «Маселе бир гана жолдо эмес. Тапшырманы токтотуп, кайра баштоо
// да күч жана көңүл талап кылат.»
import { useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { box, Panel, useTimeline, type Cam } from "../context";
import { lineFramesIn, wordAt, type Bg40Timeline } from "../timing";
import { BG40_TEXT } from "../script";
import { BigClock, secondsAngle } from "../kit/Clock";
import { Chip } from "../kit/Labels";
import { Printer } from "../kit/Office";
import { DeskTop, HandLine, penTipAt, Sheet, Stroke, TextBars } from "../kit/Paper";
import { PenHand } from "../kit/PenHand";
import { C } from "../kit/theme";

const DAYS_FULL = BG40_TEXT.refocus.days;
const PAGE_EVERY = 12; // кадров на лист в принтере
const SHOT_B = 64; // кадр перехода к виду сверху

// Листы на столе (вид сверху): x, y, поворот.
const PAGE_W = 314;
const PAGE_H = 430;
const PAGES = [
  { x: 36, y: 420, r: -3 },
  { x: 383, y: 404, r: 1.5 },
  { x: 730, y: 428, r: 3.5 },
  { x: 36, y: 900, r: 2 },
  { x: 383, y: 890, r: -2.5 },
] as const;
const QUESTION = { x: 722, y: 900, r: -1.5 } as const;
const BREAK_Y = 196; // разрыв на листе (координаты листа)

// Точка листа i → мир.
const pageToWorld = (i: number, lx: number, ly: number) => {
  const p = PAGES[i];
  const r = (p.r * Math.PI) / 180;
  const dx = lx - PAGE_W / 2;
  const dy = ly - PAGE_H / 2;
  return { x: p.x + PAGE_W / 2 + dx * Math.cos(r) - dy * Math.sin(r), y: p.y + PAGE_H / 2 + dx * Math.sin(r) + dy * Math.cos(r) };
};

// Ключевые моменты: отметки разрыва (по одной на лист, в ритме речи),
// «кайра», «көңүл», вопрос.
export const refocusBeats = (tl: Bg40Timeline) => {
  const n2 = lineFramesIn(tl, "n2");
  const wStop = wordAt(tl, "n2", "токтотуп");
  const first = Math.max(SHOT_B + 16, n2.from + 4);
  // отметка рисуется 9 кадров, переход к следующему листу — не меньше
  // 7 кадров (+8 при переходе на нижний ряд): рука не прыгает
  const every = Math.max(16, Math.min(20, Math.floor((wStop - first) / 5)));
  const marks = DAYS_FULL.map((_, i) => first + i * every + (i >= 3 ? 8 : 0));
  return { n2, marks, restart: wordAt(tl, "n2", "кайра"), focus: wordAt(tl, "n2", "көңүл"), question: n2.to + 6, shotB: SHOT_B };
};

// Удар принтера (кадры сцены): три такта на лист.
export const refocusPrinterSteps = () => DAYS_FULL.flatMap((_, i) => [0, 4, 8].map((k) => 4 + i * PAGE_EVERY + k));

export const RefocusScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG40_TEXT.refocus;
  const rb = refocusBeats(useTimeline());
  const marks = rb.marks;
  const wRestart = rb.restart;
  const wFocus = rb.focus;
  const qAt = rb.question;

  if (f < SHOT_B) return <PrinterShot f={f} />;

  // ручка переходит от листа к листу и рисует зубчатый разрыв
  const cur = Math.max(0, marks.findIndex((m) => f < m + 9));
  const idx = marks.every((m) => f >= m + 9) ? -1 : cur;
  const markP = (i: number) => clamp((f - marks[i]) / 9);
  const fade = clamp((f - wRestart) / 10);
  const chip = clamp((f - wFocus + 4) / 10);
  const qP = clamp((f - qAt - 12) / 40);
  const qPage = easeOut(clamp((f - qAt) / 12));

  // острие пера
  let tip = { x: 980, y: 1500 };
  if (idx >= 0) {
    const i = idx;
    const startAt = i === 0 ? marks[0] - 16 : marks[i - 1] + 9;
    const prev = i === 0 ? { x: 980, y: 1500 } : pageToWorld(i - 1, 270, BREAK_Y);
    const a = pageToWorld(i, 22, BREAK_Y);
    const b = pageToWorld(i, 270, BREAK_Y);
    const move = easeInOut(clamp((f - startAt) / Math.max(1, marks[i] - startAt)));
    const zig = (u: number) => Math.sin(u * Math.PI * 7) * 10;
    if (f < marks[i]) tip = { x: lerp(prev.x, a.x, move), y: lerp(prev.y, a.y, move) - Math.sin(move * Math.PI) * 30 };
    else {
      const u = markP(i);
      tip = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) + zig(u) };
    }
  } else if (f >= qAt) {
    // перо подходит к строке вопроса, пока лист ложится на стол
    const lines = [t.question.split(" ").slice(0, 2).join(" "), t.question.split(" ").slice(2).join(" ")];
    const l1 = clamp(qP * 1.9);
    const l2 = clamp(qP * 1.9 - 0.9);
    const pt = l2 > 0 ? penTipAt(QUESTION.x + 26, QUESTION.y + 100, lines[1], l2, 52, -1) : penTipAt(QUESTION.x + 26, QUESTION.y + 28, lines[0], l1, 52, -1);
    const rest = { x: 1000, y: 1440 };
    const e = easeInOut(clamp((f - qAt) / 12));
    tip = { x: lerp(rest.x, pt.x, e), y: lerp(rest.y, pt.y, e) - Math.sin(e * Math.PI) * 30 };
  } else {
    const last = pageToWorld(4, 270, BREAK_Y);
    const e = easeInOut(clamp((f - marks[4] - 12) / 24));
    tip = { x: lerp(last.x, 1000, e), y: lerp(last.y, 1440, e) };
  }
  const writing = (idx >= 0 && f >= marks[idx]) || (f >= qAt + 12 && qP < 1);

  const cam: Cam = { x: 540, y: keys(f, [[SHOT_B, 900], [SHOT_B + 60, 930]]), zoom: keys(f, [[SHOT_B, 1.06], [SHOT_B + 200, 1.0]]) };
  return (
    <>
      <Panel cam={cam} bg={C.wood}>
        <DeskTop />
        {PAGES.map((p, i) => {
          const drop = easeOut(clamp((f - SHOT_B - i * 3) / 10));
          return (
            <div key={i} style={box({ left: 0, top: 0, translate: `0 ${(1 - drop) * -70}px`, opacity: drop })}>
              <Sheet x={p.x} y={p.y} w={PAGE_W} h={PAGE_H} rot={p.r} lines="none">
                <DayPage i={i} mark={markP(i)} fade={fade} />
              </Sheet>
            </div>
          );
        })}
        {/* чистый лист с вопросом */}
        {qPage > 0 ? (
          <div style={box({ left: 0, top: 0, translate: `${(1 - qPage) * 420}px ${(1 - qPage) * 260}px`, rotate: `${(1 - qPage) * 12}deg` })}>
            <Sheet x={QUESTION.x} y={QUESTION.y} w={PAGE_W + 10} h={PAGE_H} rot={QUESTION.r} lines="none" lift={1 - qPage}>
              <HandLine x={26} y={28} text={t.question.split(" ").slice(0, 2).join(" ")} p={clamp(qP * 1.9)} size={52} seed={21} color={C.navy} />
              <HandLine x={26} y={100} text={t.question.split(" ").slice(2).join(" ")} p={clamp(qP * 1.9 - 0.9)} size={52} seed={22} color={C.navy} />
              <TextBars x={26} y={196} w={250} rows={6} gap={34} seed={40} from={clamp((f - qAt - 6) / 16) * 6} color="#7C88A6" />
            </Sheet>
          </div>
        ) : null}
        <PenHand x={tip.x} y={tip.y} tilt={-8} s={0.82} lift={writing ? 0 : 0.8} />
      </Panel>
      <Chip x={540} y={262} text={t.chip} a={chip} size={44} center />
    </>
  );
};

// Лист рабочего дня: название дня, строки работы, разрыв (mark 0…1),
// бледный «перезапуск» после разрыва (fade 0…1).
const DayPage: React.FC<{ readonly i: number; readonly mark: number; readonly fade: number }> = ({ i, mark, fade }) => {
  const t = BG40_TEXT.refocus;
  const zig = `M 18 ${BREAK_Y} l 28 -12 l 26 22 l 28 -22 l 26 22 l 28 -22 l 26 22 l 28 -22 l 26 22 l 28 -14`;
  return (
    <>
      <div style={box({ left: 22, top: 18, fontFamily, fontWeight: 900, fontSize: 34, color: C.navy })}>{DAYS_FULL[i]}</div>
      <div style={box({ left: 22, top: 64, width: 256, height: 4, borderRadius: 2, backgroundColor: C.yellow })} />
      {/* работа до перерыва */}
      <TextBars x={22} y={88} w={250} rows={3} gap={32} seed={i * 7 + 1} />
      {/* после перерыва: сначала бледно и пунктиром, потом снова ровно */}
      <TextBars x={22} y={226} w={250} rows={3} gap={32} seed={i * 7 + 4} fadeFrom={fade > 0 ? 0 : 99} fadeTo={fade > 0 ? 2 : -1} />
      <TextBars x={22} y={322} w={250} rows={2} gap={32} seed={i * 7 + 9} />
      {fade > 0 ? (
        <div style={box({ left: 12, top: 216, width: 272, height: 100, borderRadius: 10, backgroundColor: `rgba(232,105,95,${0.14 * fade})`, border: `3px dashed rgba(232,105,95,${0.7 * fade})`, boxSizing: "border-box" })} />
      ) : null}
      <svg width={PAGE_W} height={PAGE_H} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <Stroke d={zig} p={mark} color={C.coral} width={7} />
      </svg>
      {mark > 0.6 ? (
        <div style={box({ right: 14, top: BREAK_Y - 52, padding: "3px 12px", borderRadius: 12, backgroundColor: C.coral, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 24, opacity: clamp((mark - 0.6) / 0.3), whiteSpace: "nowrap" })}>
          12:30 · {t.gap}
        </div>
      ) : null}
    </>
  );
};

// Крупно: принтер в ритме выдаёт пять листов недели.
const PrinterShot: React.FC<{ readonly f: number }> = ({ f }) => {
  const page = Math.min(4, Math.floor((f - 4) / PAGE_EVERY));
  const local = f - 4 - page * PAGE_EVERY;
  const step = (k: number) => clamp((local - k * 4) / 3);
  const feed = f < 4 ? 0 : clamp((step(0) + step(1) + step(2)) / 3) * 0.92;
  const stacked = Math.max(0, page);
  const cam: Cam = { x: 540, y: 1000, zoom: keys(f, [[0, 1.0], [SHOT_B, 1.08]]) };
  return (
    <Panel cam={cam} bg={C.wall}>
      <div style={box({ left: -400, top: -400, width: 1900, height: 2800, background: `linear-gradient(180deg, #F4F7FB 0%, ${C.wall} 55%, ${C.wallLow} 100%)` })} />
      <div style={box({ left: -300, top: 380, width: 520, height: 700, borderRadius: 16, background: "linear-gradient(180deg, #DCEBF7, #F3EBDD)", opacity: 0.8, filter: "blur(10px)" })} />
      <BigClock x={860} y={420} r={130} minutes={810} sec={secondsAngle(f)} />
      {/* тумба */}
      <div style={box({ left: 40, top: 1330, width: 1000, height: 700, borderRadius: 20, backgroundColor: "#E9DCC8", boxShadow: "0 -6px 0 #DCCBB2" })} />
      {/* стопка напечатанных листов в лотке */}
      {Array.from({ length: stacked }).map((_, k) => (
        <div key={k} style={box({ left: 300 + (k % 2) * 6, top: 1330 - 10 - k * 7, width: 480, height: 18, borderRadius: 3, backgroundColor: C.paper, boxShadow: "0 2px 3px rgba(20,30,60,0.12)" })} />
      ))}
      <Printer
        x={150}
        y={1240}
        s={3.1}
        feed={feed}
        led={f % 16 < 8 ? 1 : 0.4}
        sheet={
          <div style={box({ inset: 0, padding: "40px 14px 0" })}>
            <div style={{ fontFamily, fontWeight: 900, fontSize: 18, color: C.navy, textAlign: "center", marginTop: 92 }}>{DAYS_FULL[Math.max(0, page)]}</div>
          </div>
        }
      />
    </Panel>
  );
};

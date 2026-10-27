// Сцены 10–12 («Эртеси» и финал).
// 10. Родители вместе заполняют ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo: «Үй дареги»,
//     «Мектеп», «Сабактын убактысы» (14:30 — сабак бүтөт), направление
//     «Мектеп → Үй», кнопка «Алдын ала арыз», статус «Арыз жөнөтүлдү».
//     Без подтверждённого маршрута, машины, оплаты и водителя.
// 11. Айжан возвращается к тому же письму: черновик становится законченным
//     ответом (смысловыми порциями под её внутреннее чтение, рты закрыты),
//     указатель попадает в «Жөнөтүү» → «Жөнөтүлдү». Затем она достаёт тот
//     же рисунок из папки, принесённой из дома, и ставит его у монитора.
//     Последний человеческий кадр — рисунок у монитора, спокойная Айжан,
//     завершённое письмо (≥ 2 с).
// 12. Контактная карточка BalaGo — ровно 150 кадров.
import { Logo } from "../../components/Logo";
import { fontFamily } from "../../fonts";
import { ChildDrawing, DRAWING_H, DRAWING_W } from "../graphics/Drawing";
import { BalaGoPage, FormPage, FORM_GEOM, PAGE_BUTTON, SEARCH_RESULT, SearchPage } from "../graphics/Form";
import { Pointer } from "../graphics/Letter";
import { Icon } from "../graphics/Icons";
import { Actor, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, type Vec } from "../rig/motion";
import { UL2_SCENES } from "../script";
import { UL2_LETTER, UL2_TEXT } from "../script";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront } from "../sets/Home";
import { FolderOnDesk, OFFICE } from "../sets/Office";
import { box as wbox } from "../shots";
import { C } from "../theme";
import type { Ul2Cue } from "../timing";
import { onTable, seated, seatOf, typingAt } from "./common";
import { box, PanelArea, Stage, usePanel, useScene } from "./kit";

const sceneDur = (id: string) => {
  const sc = UL2_SCENES.find((x) => x.id === id)!;
  return sc.to - sc.from;
};
import { OFFICE_MOM, OfficeStage, Screen, typingArms } from "./Office";
import { LaptopOver, type HandsState } from "../graphics/LaptopOver";
import { PAPER_BACK } from "./Drawing";
import { requestBeats } from "./beats";

// ---------- 10. Следующий день и заявка ----------
// Сверху — родители утром вместе за ноутбуком; ниже — та же заявка крупно.
// Поля заполняются по ходу фразы рассказчика, затем появляется направление
// «Мектеп → Үй», кнопка становится активной, нажатие на «арыз» и понятное
// подтверждение принятой предварительной заявки (держится ≈ 2,5 с).
export const RequestScene: React.FC = () => {
  const { f, word } = useScene("request");
  const r = usePanel();
  const { qFrom, qTo, resultsAt, resClick, pageAt, routeHL, pageClick, formAt, fill, routeAt, chooseAt, readyAt, tap, sent } = requestBeats(word);
  const v = {
    fills: [0, 1, 2].map((i) => clamp((f - fill[i]) / 8)) as unknown as [number, number, number],
    route: clamp((f - routeAt) / 8),
    choose: clamp((f - chooseAt) / 4),
    ready: clamp((f - readyAt) / 6),
    hover: clamp((f - tap + 12) / 6),
    press: keys(f, [[tap - 3, 0], [tap, 1], [tap + 6, 0]]),
    sent: clamp((f - sent) / 10),
  };
  const W = 892;
  const phase = f < pageAt ? "search" : f < formAt ? "page" : "form";
  const page = phase !== "form";
  const STRIP = page ? 300 : 196;
  const top = STRIP + 30;
  const ptr =
    phase === "search"
      ? keysV(f, [
          [0, { x: 640, y: 120 }],
          [resultsAt + 4, { x: 640, y: 120 }],
          [resClick - 4, { x: SEARCH_RESULT.x + 60, y: SEARCH_RESULT.y + 10 }],
        ], anticipate)
      : phase === "page"
        ? keysV(f, [
            [pageAt, { x: 560, y: 260 }],
            [routeHL + 6, { x: 520, y: 360 }],
            [routeHL + 20, { x: 520, y: 490 }],
            [pageClick - 10, { x: 520, y: 490 }],
            [pageClick - 3, { x: PAGE_BUTTON.x + 40, y: PAGE_BUTTON.y + 10 }],
          ], anticipate)
        : keysV(f, [
            [formAt, { x: 560, y: FORM_GEOM.fieldY(0) }],
            [fill[2] + 4, { x: 600, y: FORM_GEOM.fieldY(2) }],
            [chooseAt - 3, { x: FORM_GEOM.chipX(1) + 30, y: FORM_GEOM.chipY + 10 }],
            [chooseAt + 4, { x: FORM_GEOM.chipX(1) + 30, y: FORM_GEOM.chipY + 10 }],
            [tap - 6, { x: FORM_GEOM.buttonX + 40, y: FORM_GEOM.buttonY + 56 }],
          ], anticipate);
  const resPress = keys(f, [[resClick - 3, 0], [resClick, 1], [resClick + 5, 0]]);
  const pagePress = keys(f, [[pageClick - 3, 0], [pageClick, 1], [pageClick + 5, 0]]);
  const choosePress = keys(f, [[chooseAt - 3, 0], [chooseAt, 1], [chooseAt + 5, 0]]);
  const sentHold = sent;
  // родители утром вместе за ноутбуком (экран к маме и к зрителю); мама
  // ведёт по тачпаду, папа смотрит на экран
  const mom = seated("mom", 1010);
  const dad = seated("dad", 1250);
  const L = HOME.laptop;
  const momPose = (tt: number): PoseIn => ({
    expr: tt > sent ? "smile" : "calm",
    sit: 1,
    seat: seatOf(mom),
    lean: 6,
    armL: { target: onTable(mom.x - 0.02 * mom.h, -4), shape: "relax", elbow: "hang" },
    armR: { target: { x: L.x - 26 + Math.sin(tt * 0.2) * 3, y: L.y - 4 }, shape: "point", elbow: "hang" },
    lookY: tt > sent + 10 && tt < sent + 40 ? 0.05 : 0.35,
    nod: keys(tt, [[sent + 4, 0], [sent + 12, 3], [sent + 22, 0]]),
  });
  const dadPose = (tt: number): PoseIn => ({
    expr: tt > sent ? "smile" : "calm",
    sit: 1,
    seat: seatOf(dad),
    lean: 8,
    armL: { target: onTable(dad.x - 0.04 * dad.h, -4), shape: "relax", elbow: "hang" },
    armR: { target: onTable(dad.x + 0.06 * dad.h, -4), shape: "relax", elbow: "hang" },
    lookY: tt > sent + 10 && tt < sent + 40 ? 0.05 : 0.35,
    // на «маршрут» кивает: «да, это наш»
    nod: keys(tt, [[chooseAt - 2, 0], [chooseAt + 6, 4], [chooseAt + 16, 0], [sent + 4, 0], [sent + 12, 3], [sent + 22, 0]]),
  });
  return (
    <PanelArea>
      <Stage cam={{ x: 1125, y: 1020, zoom: page ? 0.92 : 0.72 }} bg="#EFE3D0" inset={{ x: 24, y: 16, w: W, h: STRIP }}>
        <HomeBack minutes={8 * 60 + 10} />
        <ChairBack x={mom.x} />
        <ChairBack x={dad.x} />
        <Actor uid="r10-mom" look="aizhan" f={f} place={() => mom} face={(tt) => (tt > sent + 10 && tt < sent + 40 ? 0.7 : 0.45)} pose={momPose} seed={11} layer="body" />
        <Actor uid="r10-dad" look="dad" f={f} place={() => dad} face={(tt) => (tt > sent + 10 && tt < sent + 40 ? -0.7 : -0.5)} pose={dadPose} seed={2} layer="body" />
        <TableFront />
        <LaptopSide x={L.x} y={L.y} open={1} />
        <Actor uid="r10-mom-a" look="aizhan" f={f} place={() => mom} face={(tt) => (tt > sent + 10 && tt < sent + 40 ? 0.7 : 0.45)} pose={momPose} seed={11} layer="arms" />
        <Actor uid="r10-dad-a" look="dad" f={f} place={() => dad} face={(tt) => (tt > sent + 10 && tt < sent + 40 ? -0.7 : -0.5)} pose={dadPose} seed={2} layer="arms" />
      </Stage>
      {/* экран того же ноутбука крупно (рамка экрана) */}
      <div style={box({ left: 14, top: top - 14, width: W + 20, height: r.h - top - 2, borderRadius: 30, backgroundColor: "#1E2430" })} />
      <div style={box({ left: 24, top, width: W, height: r.h - top - 12, borderRadius: 20, overflow: "hidden" })}>
        {phase === "search" ? (
          <SearchPage w={W} h={r.h - top - 12} typed={clamp((f - qFrom) / Math.max(1, qTo - qFrom))} results={clamp((f - resultsAt) / 12)} hl={clamp((f - resClick + 8) / 6)} press={resPress} />
        ) : phase === "page" ? (
          <BalaGoPage w={W} h={r.h - top - 12} route={clamp((f - routeHL) / 24)} hover={clamp((f - pageClick + 10) / 6)} press={pagePress} />
        ) : (
          <FormPage w={W} h={r.h - top - 12} v={v} />
        )}
        <Pointer x={ptr.x} y={ptr.y} press={phase === "search" ? resPress : phase === "page" ? pagePress : Math.max(v.press, choosePress)} opacity={easeOut((f - 4) / 8) * (1 - clamp((f - sentHold - 16) / 8))} />
      </div>
    </PanelArea>
  );
};

// ---------- 11. Ответ и рисунок рядом ----------
// Спереди: Айжан кладёт папку на стол и поднимает крышку ноутбука. Через
// плечо: ответ допечатывается по словам вместе с её внутренним голосом
// (серии нажатий — пока появляются буквы), затем правая рука на тачпаде:
// курсор к «Жөнөтүү», щелчок, «Жөнөтүлдү» (держится ≈ 1,3 с). Спереди:
// достаёт из папки рисунок, смотрит на него и улыбается (лист ниже лица),
// ставит его к подставке у ноутбука и спокойно возвращается к работе.
export const REPLY = { pressAfter: 0.5, sentAfter: 0.7, hold: 1.35 } as const;
// Сколько букв ответа напечатано к моменту t: каждое слово набирается, пока
// звучит (по фактическим таймингам слов озвучки).
const typedAt = (cue: Ul2Cue, t: number) => {
  const text = UL2_LETTER.reply;
  const words = text.split(" ");
  let pos = 0;
  let n = 0;
  words.forEach((w, i) => {
    const start = pos;
    const end = pos + w.length;
    pos = end + 1;
    const cw = cue.words[i];
    if (!cw) return;
    const u = clamp((t - cw.start + 0.05) / Math.max(0.08, cw.end - cw.start));
    if (u > 0) n = Math.max(n, start + (end - start) * u + (u >= 1 ? 1 : 0));
  });
  return Math.min(n, [...text].length);
};
export const ReplyScene: React.FC = () => {
  const { f, from, to, t0, cue } = useScene("reply");
  const m06 = from("m06");
  const press = to("m06") + Math.round(REPLY.pressAfter * 30);
  const sent = to("m06") + Math.round(REPLY.sentAfter * 30);
  const overFrom = m06 - 12;
  const toDesk = sent + Math.round(REPLY.hold * 30);
  const t = t0 + f / 30;
  const typed = typedAt(cue("m06"), t);
  const typedPrev = typedAt(cue("m06"), t - 3 / 30);
  const typingNow = typed > typedPrev + 0.01;
  const L = OFFICE.laptop;
  // спереди в начале: папка на стол, крышка вверх
  const lidUp = [8, 22] as const;
  // кабинет после отправки: папка → рисунок → у подставки
  const fold = OFFICE.folder;
  const open = toDesk + 6;
  const grab = open + 12;
  const lift = grab + 10;
  const look = lift + 10;
  const place = look + 26;
  const release = place + 6;
  const back = release + 12;
  const ph = (OFFICE.drawing.w * DRAWING_H) / DRAWING_W;
  const spot: Vec = { x: OFFICE.drawing.x, y: OFFICE.top - 4 - ph / 2 };
  const view: Vec = { x: OFFICE_MOM.x + 120, y: 1150 }; // перед собой справа, ниже лица
  const paperAt = (tt: number): Vec =>
    keysV(tt, [
      [grab, { x: fold.x - 20, y: fold.y - 20 }],
      [lift, { x: fold.x - 40, y: 1190 }],
      [look, view],
      [place - 12, view],
      [place, spot],
    ], anticipate);
  const holding = f >= grab && f < release;
  const lidEdgeY = (o: number) => OFFICE.top - 4 - 14 - (L.h - 14) * Math.sin((o * Math.PI) / 2);
  const lidOpen = keys(f, [[lidUp[0], 0], [lidUp[1], 1]]);
  const momPose = (tt: number): PoseIn => {
    const base = typingArms(tt, tt > back + 10, back + 10);
    const p = paperAt(tt);
    const inHand = tt >= grab - 6 && tt < release + 4;
    const lifting = tt >= lidUp[0] - 6 && tt < lidUp[1] + 4;
    const lo = keys(tt, [[lidUp[0], 0], [lidUp[1], 1]]);
    return {
      expr: tt < toDesk ? "calm" : tt < look + 6 ? "softSmile" : tt < place + 30 ? "smile" : "softSmile",
      sit: 1,
      seat: seatOf(OFFICE_MOM),
      // в начале — кладёт папку; затем обе руки поднимают крышку за край
      armR: tt < 8
        ? { target: keysV(tt, [[0, { x: fold.x + 10, y: fold.y - 70 }], [6, { x: fold.x + 10, y: fold.y - 14 }]], anticipate), shape: "fist", elbow: "down", behind: false }
        : lifting
          ? { target: { x: L.cx + 70, y: lidEdgeY(lo) + 8 }, shape: "open", elbow: "down", behind: false }
          : inHand
            ? { target: { x: p.x + 66, y: p.y + 30 }, shape: "pinch", elbow: "down", behind: false }
            : tt >= open - 10 && tt < grab - 6
              ? { target: keysV(tt, [[open - 10, base.armR!.target!], [open, { x: fold.x + 50, y: fold.y - 16 }]], anticipate), shape: "open", elbow: "down", behind: false }
              : base.armR,
      armL: lifting ? { target: { x: L.cx - 70, y: lidEdgeY(lo) + 8 }, shape: "open", elbow: "down", behind: false } : inHand && tt > lift - 4 ? { target: { x: p.x - 66, y: p.y + 30 }, shape: "pinch", elbow: "down", behind: false } : base.armL,
      lookY: keys(tt, [[0, 0.35], [toDesk, 0.35], [open, 0.5], [lift, 0.4], [look, 0.35], [place, 0.35], [release + 20, 0.3], [back + 10, 0.35]]),
      lookX: keys(tt, [[toDesk, 0], [open, 0.6], [lift, 0.45], [look, 0.3], [place, 0.5], [release + 24, 0.3], [back + 10, 0]]),
      headTilt: keys(tt, [[look, 0], [look + 12, 4], [place, 4], [place + 14, 0]]),
      nod: keys(tt, [[release + 6, 0], [release + 14, 3], [release + 24, 0]]),
      lean: keys(tt, [[toDesk, 0], [toDesk + 12, -3], [open, 2]]),
    };
  };
  const momFace = (tt: number) => keys(tt, [[toDesk, 0], [open, 0.3], [look, 0.15], [place, 0.3], [release + 30, 0]]);
  const placed = f >= release;
  const paper = paperAt(f);
  const paperW = OFFICE.drawing.w;
  const over = f >= overFrom && f < toDesk;
  // экран: курсор к «Жөнөтүү» и щелчок
  const ptr = keysV(f, [[to("m06") + 2, { x: 640, y: 700 }], [press - 3, { x: 800, y: 732 }]], anticipate);
  const click = keys(f, [[press - 3, 0], [press, 1], [press + 5, 0]]);
  const padMode = f >= to("m06") + 2;
  const hands: HandsState = padMode
    ? { mode: "pad", px: 0.35 + 0.4 * clamp((ptr.x - 640) / 160), py: 0.25 + 0.5 * clamp((ptr.y - 560) / 172), press: click }
    : typingNow
      ? { mode: "type", tapL: typingAt(f, overFrom, -1, 12, 10).tap, tapR: typingAt(f, overFrom, 1, 12, 10).tap, shift: 0 }
      : { mode: "type", tapL: -1, tapR: -1 };
  return (
    <PanelArea>
      {over ? (
        <LaptopOver
          screen={
            <>
              <Screen v={{ f, draft: 1, typed, typing: typingNow, sendHover: clamp((f - press + 10) / 6), press: click, sent: clamp((f - sent) / 6), caret: true }} />
              {padMode ? <Pointer x={ptr.x} y={ptr.y} press={click} opacity={easeOut((f - to("m06") - 2) / 6) * (1 - easeOut((f - sent - 10) / 6))} /> : null}
              {/* крупное подтверждение отправки */}
              <div style={box({ left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: easeOut((f - sent - 2) / 6), scale: `${0.9 + 0.1 * easeOut((f - sent - 2) / 6)}` })}>
                <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 56px", borderRadius: 999, backgroundColor: "#E7F5EC", border: `6px solid ${C.green}`, boxShadow: "0 18px 40px rgba(0,0,0,0.25)", fontFamily, fontSize: 80, fontWeight: 900, color: C.ink }}>
                  <Icon id="check" size={84} color={C.green} stroke={6} />
                  {UL2_LETTER.sent}
                </div>
              </div>
            </>
          }
          hands={hands}
        />
      ) : (
        <OfficeStage
          f={f}
          uid="r11"
          cam={f < overFrom ? { x: 900, y: 1020, zoom: 1.45 } : { x: keys(f, [[toDesk, 900], [release + 10, 940]]), y: 1030, zoom: keys(f, [[toDesk, 1.45], [release + 60, 1.55]], easeInOut) }}
          momFace={momFace}
          momPose={momPose}
          lid={f < overFrom ? lidOpen : 1}
          onDesk={
            <>
              <FolderOnDesk open={clamp((f - open) / 8) * (1 - clamp((f - release - 10) / 10))} />
              {/* тот же рисунок: в папке → в руке → у подставки */}
              {f >= grab - 2 ? (
                holding && f < lift - 6 ? (
                  <div style={wbox({ left: paper.x - paperW / 2, top: paper.y - 20, width: paperW, height: 30, backgroundColor: PAPER_BACK, borderRadius: 4 })} />
                ) : (
                  <ChildDrawing width={paperW} style={{ position: "absolute", left: paper.x - paperW / 2, top: paper.y - ph / 2, rotate: placed ? "-4deg" : `${keys(f, [[lift, 6], [look, 0], [place, -4]])}deg`, transformOrigin: "50% 100%" }} shadow />
                )
              ) : null}
              {placed ? <div style={wbox({ left: spot.x - paperW / 2 + 10, top: OFFICE.top - 8, width: paperW - 20, height: 8, borderRadius: 4, backgroundColor: "rgba(60,40,20,0.18)" })} /> : null}
            </>
          }
        />
      )}
    </PanelArea>
  );
};

// ---------- 12. Рекламное объяснение ----------
// Та же светлая карточка. Сверху — BalaGo и «Бишкек · Балдар үчүн такси»,
// в центре — простая схема: дом слева, школа справа. На «үйдөн мектепке»
// машина BalaGo едет по верхней дуге (подпись «Эртең менен · Үй → Мектеп»),
// на «мектептен үйгө» — обратно по нижней («Сабактан кийин · Мектеп → Үй»).
// Внизу — итог «Үй → Мектеп → Үй». В последние 0,3 с содержимое мягко
// уходит, карточка остаётся — на ней проявляются контакты.
const HOUSE = { x: 170, y: 600 };
const SCHOOL = { x: 770, y: 600 };
const ARC_UP = { x: 470, y: 400 };
const ARC_DOWN = { x: 470, y: 800 };
const qb = (a: Vec, c: Vec, b: Vec, t: number): Vec => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
const MiniCar: React.FC<{ p: Vec; dir: 1 | -1; a: number }> = ({ p, dir, a }) => (
  <svg width={150} height={90} viewBox="-75 -60 150 90" style={box({ left: p.x - 75, top: p.y - 60, opacity: a, overflow: "visible" })}>
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={24} rx={66} ry={7} fill="rgba(20,30,50,0.18)" />
      <path d="M -66 14 Q -68 -6 -50 -10 L -30 -14 Q -18 -38 6 -40 L 24 -40 Q 44 -38 54 -14 L 62 -10 Q 70 -4 68 14 Z" fill={C.yellow} stroke="#C79A12" strokeWidth={3} />
      <path d="M -24 -14 Q -14 -32 4 -33 L 4 -14 Z M 12 -33 L 22 -33 Q 38 -31 46 -14 L 12 -14 Z" fill="#CFE3F2" />
      <circle cx={-38} cy={16} r={12} fill="#23262E" />
      <circle cx={40} cy={16} r={12} fill="#23262E" />
      <circle cx={-38} cy={16} r={5} fill="#B8BEC8" />
      <circle cx={40} cy={16} r={5} fill="#B8BEC8" />
    </g>
  </svg>
);
const Place: React.FC<{ p: Vec; icon: "home" | "school"; label: string; color: string; hl: number }> = ({ p, icon, label, color, hl }) => (
  <div style={box({ left: p.x - 95, top: p.y - 95, width: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 })}>
    <div style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 ${8 + 10 * hl}px rgba(255,211,61,${0.25 * hl})` }}>
      <Icon id={icon} size={84} color={C.ink} stroke={4} />
    </div>
    <div style={{ fontFamily, fontSize: 44, fontWeight: 900, color: C.ink }}>{label}</div>
  </div>
);
export const ServiceScene: React.FC = () => {
  const { f, word, to } = useScene("service");
  const sv = UL2_TEXT.service;
  const intro = easeOut(f / 10);
  // утро: «үйдөн мектепке»; после уроков: «мектептен үйгө»
  const am = [word("n05", 3) - 2, word("n05", 5)] as const;
  const pm = [word("n05", 6) - 2, word("n05", 8)] as const;
  const uAm = easeInOut(clamp((f - am[0]) / (am[1] - am[0])));
  const uPm = easeInOut(clamp((f - pm[0]) / (pm[1] - pm[0])));
  const onPm = f >= pm[0];
  const car = onPm ? qb(SCHOOL, ARC_DOWN, HOUSE, uPm) : qb(HOUSE, ARC_UP, SCHOOL, uAm);
  const carA = clamp((f - am[0] + 6) / 6);
  const amA = easeOut((f - am[0]) / 8);
  const pmA = easeOut((f - pm[0]) / 8);
  const sumA = easeOut((f - to("n05") + 6) / 10);
  const end = 1 - easeOut((f - (Math.round(sceneDur("service") * 30) - 6)) / 6);
  const dashUp = `M ${HOUSE.x} ${HOUSE.y} Q ${ARC_UP.x} ${ARC_UP.y} ${SCHOOL.x} ${SCHOOL.y}`;
  const dashDown = `M ${SCHOOL.x} ${SCHOOL.y} Q ${ARC_DOWN.x} ${ARC_DOWN.y} ${HOUSE.x} ${HOUSE.y}`;
  return (
    <PanelArea>
      <div style={box({ inset: 0, backgroundColor: C.card, fontFamily, color: C.ink })}>
        <div style={box({ inset: 0, opacity: end })}>
          {/* бренд и город */}
          <div style={box({ left: 0, right: 0, top: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, opacity: intro, translate: `0 ${(1 - intro) * 12}px` })}>
            <Logo size={120} style={{ boxShadow: "0 0 0 8px #FFD33D" }} />
            <div>
              <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1 }}>BalaGo</div>
            </div>
          </div>
          <div style={box({ left: 0, right: 0, top: 200, textAlign: "center", fontSize: 50, fontWeight: 900, color: C.inkSoft, opacity: easeOut((f - 6) / 10) })}>{sv.city}</div>
          {/* схема поездок */}
          <svg width={940} height={1060} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <path d={dashUp} stroke={amA > 0 ? "#C79A12" : "#DCE3EE"} strokeWidth={10} strokeDasharray="26 18" fill="none" strokeLinecap="round" opacity={0.35 + 0.65 * amA} />
            <path d={dashDown} stroke={pmA > 0 ? "#3E9E6A" : "#DCE3EE"} strokeWidth={10} strokeDasharray="26 18" fill="none" strokeLinecap="round" opacity={0.35 + 0.65 * pmA} />
          </svg>
          <Place p={HOUSE} icon="home" label={UL2_TEXT.home} color="#FFC46B" hl={onPm ? uPm : 1 - uAm} />
          <Place p={SCHOOL} icon="school" label={UL2_TEXT.school} color="#8FD3A6" hl={onPm ? 1 - uPm : uAm} />
          {/* подписи направлений */}
          <div style={box({ left: 0, right: 0, top: 316, display: "flex", justifyContent: "center", opacity: amA, translate: `0 ${(1 - amA) * 10}px` })}>
            <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: "#FFF6D6", border: `4px solid ${C.yellow}`, fontSize: 38, fontWeight: 900, whiteSpace: "nowrap" }}>
              {sv.morning} · {sv.morningRoute}
            </div>
          </div>
          <div style={box({ left: 0, right: 0, top: 812, display: "flex", justifyContent: "center", opacity: pmA, translate: `0 ${(1 - pmA) * 10}px` })}>
            <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: "#E6F5EC", border: "4px solid #3E9E6A", fontSize: 38, fontWeight: 900, whiteSpace: "nowrap" }}>
              {sv.after} · {sv.afterRoute}
            </div>
          </div>
          <MiniCar p={car} dir={onPm ? -1 : 1} a={carA} />
          {/* итог: оба направления */}
          <div style={box({ left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", opacity: sumA, scale: `${0.96 + 0.04 * sumA}` })}>
            <div style={{ padding: "16px 44px", borderRadius: 999, backgroundColor: C.dark, color: C.text, fontSize: 52, fontWeight: 900, whiteSpace: "nowrap" }}>{sv.route}</div>
          </div>
        </div>
      </div>
    </PanelArea>
  );
};

// ---------- 13. Контакты ----------
// Та же карточка (без затемнения между сценами): бренд, город и маршрут,
// призыв «Алдын ала арыз калтырыңыз» и два способа обращения — ссылка в
// профиле и WhatsApp с номером. Номер виден до последнего кадра (≥ 10 с),
// призыв звучит голосом рассказчика (n06) с субтитрами под карточкой.
export const ContactScene: React.FC = () => {
  const { f } = useScene("contact");
  const t = UL2_TEXT.cta;
  // мягкое проявление по очереди (≤ 0,6 с), дальше карточка неподвижна
  const a = (k: number) => easeOut((f + 3 - k * 3) / 6);
  const item = (k: number): React.CSSProperties => ({ opacity: a(k), translate: `0 ${(1 - a(k)) * 12}px` });
  return (
    <PanelArea>
      <div style={box({ inset: 0, backgroundColor: C.card, fontFamily, color: C.ink, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 44, gap: 14, textAlign: "center" })}>
        <div style={item(0)}>
          <Logo size={190} style={{ boxShadow: "0 0 0 10px #FFD33D" }} />
        </div>
        <div style={{ ...item(0), fontSize: 124, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>{t.brand}</div>
        <div style={{ ...item(1), fontSize: 50, fontWeight: 800, color: C.inkSoft }}>{t.tagline}</div>
        <div style={{ ...item(1), display: "flex", alignItems: "center", gap: 12, fontSize: 44, fontWeight: 900 }}>
          <Icon id="home" size={46} color={C.ink} stroke={4} />
          {t.route.split(" → ").map((w, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {w}
              {i < arr.length - 1 ? <span style={{ color: "#C79A12" }}>→</span> : null}
            </span>
          ))}
        </div>
        <div style={{ ...item(2), marginTop: 10, padding: "22px 44px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 50, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(255,211,61,0.4)" }}>{t.call}</div>
        {/* два способа обращения */}
        <div style={{ ...item(3), marginTop: 12, width: 820, display: "flex", alignItems: "center", gap: 20, padding: "20px 30px", borderRadius: 30, backgroundColor: "#EEF2F7", border: "4px solid #DCE3EE", fontSize: 42, fontWeight: 900, boxSizing: "border-box", whiteSpace: "nowrap" }}>
          <svg width={58} height={58} viewBox="0 0 24 24" style={{ flex: "none" }}>
            <circle cx={12} cy={12} r={11.5} fill={C.ink} />
            <path d="M 10.2 13.8 L 13.8 10.2 M 9 11 L 7.4 12.6 A 2.6 2.6 0 0 0 11.4 16.6 L 13 15 M 11 9 L 12.6 7.4 A 2.6 2.6 0 0 1 16.6 11.4 L 15 13" stroke="#FFFFFF" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </svg>
          {t.link}
        </div>
        <div style={{ ...item(4), width: 820, display: "flex", alignItems: "center", gap: 20, padding: "20px 30px", borderRadius: 30, backgroundColor: "#E9F8EE", border: "4px solid #2FB463", fontSize: 52, fontWeight: 900, whiteSpace: "nowrap", letterSpacing: 0.5, boxSizing: "border-box" }}>
          <svg width={64} height={64} viewBox="0 0 32 32" style={{ flex: "none" }}>
            <circle cx={16} cy={16} r={15} fill="#2FB463" />
            <path d="M 9 23 L 10.5 18.6 A 7 7 0 1 1 13.4 21.6 Z" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinejoin="round" />
          </svg>
          {t.whatsapp}
        </div>
      </div>
    </PanelArea>
  );
};

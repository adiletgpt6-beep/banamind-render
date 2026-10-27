// 3. Мама сама ищет. Мини-репортёр из монитора спрашивает «Анда кандай
// жолду караштырасыз?» — микрофон снова «вылезает» из рамки монитора к маме.
// Мама отвечает и действует сама: берёт мышь, закрывает окно шуточных
// новостей крестиком (репортёр машет на прощание), камера наезжает на
// монитор, мама набирает «Бишкекте мектепке жеткирүү», открывает результат
// BalaGo — страницу с формой (дарек, мектеп, убакыт). Только информация:
// никакой «заявки принято». Конец сцены закрывает телевизионная шторка.
import React from "react";
import { AbsoluteFill } from "remotion";
import { glide, lerpV, type Vec } from "../../../two-schedules-2d/rig/motion";
import { EXPR, mixExpr, type ExprId, type Expression } from "../../../two-schedules-2d/rig/pose";
import type { PoseIn } from "../Actor";
import { beats } from "../beats";
import { Camera, mixCam, type Cam } from "../Camera";
import { useScene } from "../context";
import { BG42_TEXT } from "../script";
import { BrowserScreen, Cursor, ReporterWindow } from "../sets/Screens";
import { C, drift, easeIn, easeInOut, keys, pop, ramp } from "../theme";
import { LowerThird, NewsTopBar } from "../ui";
import { MugStudio, OfficeWorld, momKeys } from "./common";
import { MONITOR_CLOSE, OFFICE_WIDE, officeMinutes } from "./shots";
import { PageWipe, PokeMic, SoftGlow, WavingReporterWindow } from "./SearchParts";

/** Ширина строки поиска и карточек результатов (как в BrowserScreen). */
const SW_FIELD = 388;

/** Левый край нижней плашки: правее мыши (экран ≈ 416 px в OFFICE_WIDE). */
const LT_X = 484;

/** Мышь на столе (мир) — сюда ложится правая кисть мамы. */
const MOUSE_HAND: Vec = { x: 596, y: 1214 };

/** Плавная смена выражений: [кадр начала, выражение], переход fade кадров. */
const exprTrack = (t: number, track: readonly (readonly [number, ExprId])[], fade = 7): Expression => {
  let e: Expression = EXPR[track[0][1]];
  for (let i = 1; i < track.length; i++) {
    const k = easeInOut((t - track[i][0]) / fade);
    if (k <= 0) break;
    e = mixExpr(e, EXPR[track[i][1]], k);
  }
  return e;
};

/** Короткий «кивок»-импульс 0→1→0 вокруг кадра at. */
const bump = (t: number, at: number, up = 5, down = 10) =>
  keys(t, [
    [at - up, 0],
    [at, 1],
    [at + down, 0],
  ]);

// Точки курсора (локальные px монитора 420×285).
const CUR_IN: Vec = { x: 318, y: 236 }; // появляется, когда мама берёт мышь
const CUR_X: Vec = { x: 401, y: 19 }; // кнопка «×» окна новостей
const CUR_FIELD: Vec = { x: 372, y: 59 }; // правая часть строки поиска
const CUR_CARD: Vec = { x: 150, y: 112 }; // заголовок результата BalaGo
const CUR_PARK: Vec = { x: 330, y: 263 }; // под карточкой маршрута, в стороне от формы

export const SearchScene: React.FC = () => {
  const { f, abs, at, word, tl } = useScene("search");
  const b = beats(tl).search;
  const MO = at(b.micOut);
  const MB = at(b.micBack);
  const LO = at(b.lower);
  const TS = at(b.momToScreen);
  const CL = at(b.closeNews);
  const Z0 = at(b.zoomStart);
  const Z1 = at(b.zoomEnd);
  const T0 = at(b.typeStart);
  const T1 = at(b.typeEnd);
  const RS = at(b.results);
  const OS = at(b.openSite);
  const FL = at(b.fields);
  // слова ответа мамы
  const w2 = word("m2", 2); // «кайталанган»
  const w3 = word("m2", 3); // «каттамды»
  const w4 = word("m2", 4); // «алдын ала»

  // ---------- камера ----------
  // первые 10 кадров — ровно OFFICE_WIDE (стык с интервью), затем мягкое
  // «дыхание»; смещение влево держит край кадра внутри мира (x ≤ 688,7)
  const dk = ramp(f, 10, 40);
  const d1 = drift(f, 3, 4);
  const wide: Cam = { x: OFFICE_WIDE.x + dk * (d1.x - 4.6), y: OFFICE_WIDE.y + dk * d1.y, zoom: OFFICE_WIDE.zoom };
  const d2 = drift(f, 2.4, 6);
  const dk2 = ramp(f, Z1, Z1 + 24);
  const close: Cam = { x: MONITOR_CLOSE.x + dk2 * d2.x, y: MONITOR_CLOSE.y + dk2 * d2.y, zoom: MONITOR_CLOSE.zoom };
  const zoomT = easeInOut(ramp(f, Z0, Z1, (x) => x));
  const cam = mixCam(wide, close, zoomT);

  // ---------- репортёр и микрофон ----------
  const micIn = keys(f, [
    [MO, 0],
    [MO + 12, 1],
    [MB + 4, 1],
    [MB + 16, 0],
  ]);
  // «телескоп» из рамки: выстрел пружиной, обратно — быстро и плавно
  const poke = pop(f, MO + 7, 11, 170) * (1 - easeIn(ramp(f, MB - 2, MB + 8, (x) => x)));
  const wave = keys(f, [
    [CL - 16, 0],
    [CL - 8, 1],
  ]);
  const shut = easeInOut(ramp(f, CL + 1, CL + 15, (x) => x));
  const repFace = (t: number) =>
    keys(t, [
      [MO, -0.3],
      [MO + 10, -0.42],
      [MB, -0.42],
      [MB + 10, -0.3],
      [CL - 22, -0.3],
      [CL - 14, -0.12],
    ]);
  const repExpr = exprTrack(f, [
    [0, "smile"],
    [CL - 24, "surprised"],
    [CL - 14, "smile"],
  ]);

  // ---------- курсор ----------
  const curShow = ramp(f, TS + 7, TS + 12);
  let cur: Vec = CUR_IN;
  if (f >= TS + 9 && f < CL + 10) cur = glide(f, TS + 9, CL - 3, [CUR_IN, { x: 382, y: 120 }, CUR_X]);
  else if (f >= CL + 10 && f < RS + 3) cur = glide(f, CL + 10, Z1 - 3, [CUR_X, { x: 404, y: 40 }, CUR_FIELD]);
  else if (f >= RS + 3 && f < OS + 8) cur = glide(f, RS + 3, OS - 3, [CUR_FIELD, { x: 230, y: 92 }, CUR_CARD]);
  else if (f >= OS + 8) cur = glide(f, OS + 8, OS + 26, [CUR_CARD, { x: 300, y: 240 }, CUR_PARK]);
  const click = (c: number) =>
    keys(f, [
      [c - 2, 0],
      [c, 1],
      [c + 6, 0],
    ]);
  const press = Math.max(click(CL), click(Z1 - 1), click(OS));

  // ---------- браузер ----------
  const typed = keys(f, [
    [T0, 0],
    [T1, BG42_TEXT.query.length],
  ], (x) => x);
  const res = ramp(f, RS, RS + 9);
  const site = ramp(f, OS + 2, OS + 11);
  const load = ramp(f, OS, OS + 10, (x) => x) * (1 - ramp(f, OS + 11, OS + 17));
  const field = f < FL ? -1 : Math.min(2, Math.floor((f - FL) / 12));
  const focus = ramp(f, Z1 - 1, Z1 + 5) * (1 - res);
  const caret = f >= Z1 && site < 0.5 && (f <= T1 + 2 || Math.floor((f - T1) / 8) % 2 === 1);
  const hover = keys(f, [
    [OS - 6, 0],
    [OS - 1, 1],
    [OS + 4, 1],
    [OS + 10, 0],
  ]);

  const monitor = (
    <>
      {f >= CL && site < 1 ? <BrowserScreen typed={typed} results={res} site={0} field={field} caret={caret} /> : null}
      <SoftGlow x={16} y={40} w={SW_FIELD} h={34} r={17} amount={focus} />
      <SoftGlow x={16} y={86} w={SW_FIELD} h={58} r={12} amount={hover * (1 - site)} />
      {/* страница BalaGo загружается сверху вниз (чёткая шторка вместо
          полупрозрачного наложения на результаты) + жёлтая полоска загрузки */}
      {site > 0 ? <PageWipe progress={site} load={load}>{<BrowserScreen typed={typed} results={1} site={1} field={field} />}</PageWipe> : null}
      {shut < 1 ? (
        wave > 0 ? (
          <WavingReporterWindow f={f} abs={abs} micOut={micIn} close={shut} face={repFace} expr={repExpr} wave={wave} />
        ) : (
          <ReporterWindow f={f} abs={abs} micOut={micIn} close={shut} face={repFace} expr={repExpr} />
        )
      ) : null}
      {curShow > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: curShow }}>
          <Cursor x={cur.x} y={cur.y} press={press} />
        </div>
      ) : null}
    </>
  );

  // ---------- мама ----------
  const momFace = (t: number) =>
    keys(t, [
      [MO + 12, 0.45],
      [MO + 20, 0.36],
      [MB - 4, 0.36],
      [MB + 6, 0.45],
      [LO + 4, 0.45],
      [LO + 16, 0.22],
      [w4 - 6, 0.22],
      [w4 + 6, 0.38],
      [TS - 6, 0.38],
      [TS + 5, 0.55],
    ]);
  const momPose = (t: number): PoseIn => {
    // правая кисть: клавиатура → мышь → клавиатура (набор) → мышь
    const toMouse = keys(t, [
      [TS - 2, 0],
      [TS + 10, 1],
      [Z0 + 6, 1],
      [Z0 + 20, 0],
      [T1 + 1, 0],
      [T1 + 13, 1],
    ]);
    const typing = keys(t, [
      [T0 - 3, 0],
      [T0, 1],
      [T1, 1],
      [T1 + 3, 0],
    ]);
    const tapL = typing * 3 * Math.abs(Math.sin(t * 0.9));
    const tapR = typing * 3 * Math.abs(Math.sin(t * 0.9 + 1.3));
    const tPress = Math.max(
      keys(t, [
        [CL - 2, 0],
        [CL, 1],
        [CL + 5, 0],
      ]),
      keys(t, [
        [OS - 2, 0],
        [OS, 1],
        [OS + 5, 0],
      ]),
    );
    const rKeys = { x: momKeys.r.x, y: momKeys.r.y + tapR };
    const rHand = lerpV(rKeys, { x: MOUSE_HAND.x, y: MOUSE_HAND.y + 2 * tPress }, toMouse);
    // «каждый день повторяется»: левая кисть делает маленький круг
    const roll = keys(t, [
      [w2 - 6, 0],
      [w2 + 4, 1],
      [w3 + 2, 1],
      [w3 + 12, 0],
    ]);
    const ph = (t - w2) * 0.32;
    const lHand = {
      x: momKeys.l.x - 14 * roll + Math.cos(ph) * 12 * roll,
      y: momKeys.l.y + tapL - 58 * roll + Math.sin(ph) * 9 * roll,
    };
    const listen = keys(t, [
      [MO + 14, 0],
      [MO + 28, 1],
      [MB - 2, 1],
      [MB + 10, 0],
    ]);
    const think = keys(t, [
      [LO + 2, 0],
      [LO + 14, 1],
      [w4 - 6, 1],
      [w4 + 4, 0],
    ]);
    const decided = keys(t, [
      [TS - 6, 0],
      [TS + 6, 1],
    ]);
    const recoil = keys(t, [
      [MO + 10, 0],
      [MO + 18, 1],
      [MB, 1],
      [MB + 12, 0],
    ]);
    return {
      expr: exprTrack(t, [
        [0, "neutral"],
        [MO + 13, "surprised"],
        [MO + 26, "softSmile"],
        [LO - 3, "thinking"],
        [w4 - 3, "calm"],
        [TS, "softSmile"],
      ]),
      armR: { target: rHand, shape: "relax", elbow: "hang" },
      armL: { target: lHand, shape: roll > 0.4 ? "open" : "relax", elbow: "hang" },
      headTilt: 3 * listen - 2.5 * think,
      lookY: -0.35 * think + 0.15 * decided,
      nod: 3 * bump(t, w4 + 2) + 2.5 * bump(t, CL + 1, 4, 9) + 1.5 * decided,
      lean: -2.5 * recoil + 3 * decided,
    };
  };

  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <Camera cam={cam}>
        <OfficeWorld
          f={f}
          abs={abs}
          uid="search-of"
          minutes={officeMinutes(abs / 30)}
          monitor={monitor}
          mug={<MugStudio f={f} abs={abs} uid="search-mug" />}
          face={momFace}
          pose={momPose}
          overMonitor={<PokeMic out={poke} uid="search-mic" />}
        />
      </Camera>
      {/* телевизионная графика: шапка весь выпуск; нижняя плашка — справа, чтобы
          не закрывать руки мамы на клавиатуре и мыши, и уходит до наезда */}
      <NewsTopBar f={f} at={-30} plate={BG42_TEXT.jokePlate} />
      <LowerThird f={f} at={LO} out={Z0} tag={BG42_TEXT.channel} text={BG42_TEXT.search} x={LT_X} y={1262} size={38} />
    </AbsoluteFill>
  );
};

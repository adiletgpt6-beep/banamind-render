// Шаг 2/6 «Ылайыктуу топ изделет». Мама тянет ленту — сгиб 2 разворачивается
// в бумажную карту Бишкека с ползунком времени. Под речь диктора на карте
// по очереди печатаются метки семей («дареги»), школа («мектеби») и бирки
// времени («убактысы»); на «издейт» ручка ползунка едет к утреннему окну,
// мягкое жёлтое кольцо поиска расходится от школы и подсвечивает три
// соседние метки с тем же временем — они соединяются со школой пунктиром.
// Остальные метки остаются серыми, отдельно, без крестов. Плашки «2 жумага
// чейин» и «кепил эмес» — спокойные. Короткая врезка: мама задумчиво
// смотрит на ленту. В конце камера уезжает к сгибу 3, руки перехватывают.
import { useCurrentFrame } from "remotion";
import { Icon } from "../art";
import { useLine, useScene, useWordMatch } from "../context";
import { box, camKeys, Chip, StepHead, type Cam } from "../kit";
import { p2Dist, P2_HOMES, P2_KNOB_END, P2_KNOB_START, P2_MATCH, P2Map, type P2State } from "../panels/P2";
import { FoldedEdge, panelTop, RIB, RIB_X } from "../ribbon";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { camOnFold, camOnPanel, RibbonStage } from "../stage";
import { C } from "../theme";
import { lineIn, sceneOf, wordMatchIn } from "../timing";
import { Step2Mom } from "./step2-mom";

const T = BG25_TEXT.step2;

// ---------- План сцены (кадры сцены) по фактической речи ----------
type Beats = {
  readonly F: number; // длина сцены
  readonly from: number; // начало реплики n02
  readonly addr: number; // «дареги»
  readonly school: number; // «мектеби»
  readonly time: number; // «убактысы»
  readonly search: number; // «издейт»
  readonly two: number; // «эки жумага»
  readonly last: number; // «созулушу»
  readonly top: number; // «Топ сөзсүз…»
  readonly guar: number; // «кепилдик»
};

const RING_DUR = 66;
const plan = (b: Beats) => {
  const u0 = Math.max(5, b.from - 22); // лента разворачивается
  const ringAt = b.search + 10;
  // метка загорается, когда кольцо поиска до неё дошло
  const matchAt = P2_MATCH.map((hi) => Math.round(ringAt + ((p2Dist(P2_HOMES[hi]) - 30) / 440) * RING_DUR));
  const insA = b.last - 10; // врезка с мамой
  const insB = Math.max(insA + 40, b.top - 2);
  const endA = b.F - 32; // камера уходит к сгибу 3
  return { u0, uDur: 19, ringAt, matchAt, insA, insB, endA, endB: b.F - 8 };
};

const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));

export const Step2Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames: F } = useScene();
  const n02 = useLine("n02");
  const b: Beats = {
    F,
    from: n02.from,
    addr: useWordMatch("n02", "дарег"),
    school: useWordMatch("n02", "мектеб"),
    time: useWordMatch("n02", "убакт"),
    search: useWordMatch("n02", "издейт"),
    two: useWordMatch("n02", "эки"),
    last: useWordMatch("n02", "созул"),
    top: useWordMatch("n02", "топ"),
    guar: useWordMatch("n02", "кепил"),
  };
  const P = plan(b);

  // ---------- лента ----------
  const unfold = clamp((f - P.u0) / P.uDur);
  const ue = easeInOut(unfold);

  // ---------- карта ----------
  const knobK = clamp((f - b.search) / 28);
  const knobE = easeInOut(knobK) + 0.035 * Math.sin(Math.PI * clamp((knobK - 0.6) / 0.4)) * (1 - knobK) * 4;
  const ringP = (f - P.ringAt) / RING_DUR;
  const allLit = P.matchAt[P.matchAt.length - 1] + 22;
  const s: P2State = {
    homes: clamp((f - b.addr + 3) / 18),
    school: clamp((f - b.school + 1) / 12),
    times: clamp((f - b.time + 1) / 18),
    slider: bump(f, b.time, b.time + 34),
    knob: lerp(P2_KNOB_START, P2_KNOB_END, knobE),
    ring: ringP > 0 && ringP < 1 ? ringP : 0,
    match: P.matchAt.map((m) => clamp((f - m) / 10)),
    lines: P.matchAt.map((m) => clamp((f - m - 3) / 16)),
    glow: Math.sin((f - allLit) / 11) * clamp((f - allLit) / 20) * (1 - clamp((f - P.endA) / 24)),
  };

  // ---------- камера ----------
  // макет с плашками: панель ниже, над ней — заголовок и две плашки
  const lay = (zoom: number, dx = 0): Cam => ({ x: 540 + dx, y: panelTop(2) + 360 / zoom - 13, zoom });
  const near = camOnPanel(2);
  const cam = camKeys(f, [
    [2, camOnFold(2)],
    [Math.max(P.u0 + P.uDur + 2, b.from + 4), near],
    [b.search, { x: 546, y: near.y - 8, zoom: 1.21 }],
    [b.search + 40, { x: 552, y: near.y - 14, zoom: 1.23 }],
    [b.two + 10, lay(1.1)],
    [P.insA + 5, lay(1.15, 6)],
    [P.insB - 6, lay(1.1)],
    [P.endA, lay(1.12, -4)],
    [P.endB, camOnFold(3)],
  ]);

  // ---------- руки мамы ----------
  // во время карты руки держат нижние углы панели (не закрывают карту),
  // в конце перехватывают ниже — у сложенных листов под сгибом 3
  // (щепоть пальцев — примерно на 187 px выше запястья)
  const holdY = panelTop(3) + 160;
  const lowY = panelTop(3) + 230;
  const edgeY = panelTop(2) + RIB.h * Math.sin((Math.PI / 2) * ue) + 177; // тянут нижний край
  const regrip = easeInOut(clamp((f - P.endA) / (P.endB - P.endA)));
  const hands = {
    y: lerp(lerp(edgeY, holdY, ue), lowY, regrip),
    show: 1 - 0.12 * bump(f, P.endA, P.endB),
    lift: 0.7 * bump(f, P.u0 - 6, P.u0 + 8) + 0.9 * bump(f, P.endA - 2, P.endA + 14),
  };
  const wobK = clamp((f - (P.endB - 26)) / 8);
  const wobble = wobK * (0.5 - 0.5 * Math.cos((2 * Math.PI * (f - (P.endB - 26))) / 16));

  // Язычок под лентой: пока сгиб 2 только начинает раскрываться, «2/6»
  // мягко сменяется на «3/6» (вместо мгновенной подмены подписи).
  const swapEnd = P.u0 + Math.round(P.uDur * 0.6);
  const swap = f >= P.u0 && f < swapEnd;
  const swapK = easeInOut(clamp((f - P.u0) / (swapEnd - P.u0)));
  const edgeAt = panelTop(2) + RIB.h * Math.sin((Math.PI / 2) * ue) + 2;
  const edge = swap ? (
    <>
      <div style={box({ left: 0, top: 0, opacity: 1 - swapK })}>
        <FoldedEdge x={RIB_X} y={edgeAt} rest={5} next={2} />
      </div>
      <div style={box({ left: 0, top: 0, opacity: swapK })}>
        <FoldedEdge x={RIB_X} y={edgeAt} rest={4} next={3} />
      </div>
    </>
  ) : null;

  // ---------- врезка ----------
  // мягкая короткая склейка-растворение (5 кадров) в обе стороны
  const insO = easeInOut(clamp((f - P.insA) / 5)) * (1 - easeInOut(clamp((f - (P.insB - 5)) / 5)));

  return (
    <div style={box({ inset: 0 })}>
      {insO < 0.999 ? <RibbonStage f={f} n={2} unfold={unfold} art={<P2Map s={s} />} cam={cam} hands={hands} wobble={wobble} showEdge={!swap}>
          {edge}
        </RibbonStage> : null}
      <Step2Mom f={f} t={f - P.insA} dur={P.insB - P.insA} opacity={insO} />
      {/* слой кадра: заголовок шага и спокойные плашки */}
      <StepHead n={2} text={T.head} t={f - (P.u0 + 6)} />
      <Chip text={T.period} x={520} y={428} t={f - b.two} bg={C.yellow} color={C.navy} size={36} icon={<Icon kind="clock" s={42} color={C.navy} />} />
      <Chip text={T.noGuarantee} x={520} y={516} t={f - b.guar} bg={C.white} color={C.navy} size={36} border={C.navy} />
    </div>
  );
};

export const step2Sfx: SceneSfx = (tl) => {
  const sc = sceneOf(tl, "step2");
  const w = (p: string) => wordMatchIn(tl, "step2", "n02", p);
  const b: Beats = {
    F: sc.frames,
    from: lineIn(tl, "step2", "n02").from,
    addr: w("дарег"),
    school: w("мектеб"),
    time: w("убакт"),
    search: w("издейт"),
    two: w("эки"),
    last: w("созул"),
    top: w("топ"),
    guar: w("кепил"),
  };
  const P = plan(b);
  return [
    { at: P.u0, src: SFX.unfold, volume: 0.36 },
    { at: b.addr, src: SFX.pop, volume: 0.12 },
    { at: b.school, src: SFX.pop, volume: 0.16 },
    { at: b.search, src: SFX.slide, volume: 0.3 },
    ...P.matchAt.map((m, i) => ({ at: m, src: SFX.tick, volume: 0.18 + i * 0.02 })),
    { at: b.two, src: SFX.pop, volume: 0.2 },
    { at: P.insA + 2, src: SFX.rustle, volume: 0.12 },
    { at: b.guar, src: SFX.pop, volume: 0.16 },
    { at: P.endA + 2, src: SFX.rustle, volume: 0.2 },
  ];
};

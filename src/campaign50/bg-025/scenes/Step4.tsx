// Шаг 4/6 «Чечим сиздики». Мама тянет ленту — сгиб 4 разворачивается.
// Короткая врезка: мама задумалась, над ней бумажное облачко с её вопросом
// «Улантамбы?» (вопрос остаётся напечатанным вверху панели). На панели два
// равноправных язычка-выбора. Палец мамы медленно водит между ними
// («чечим өзүңүздө»), останавливается и на «улантууну кааласаңыз» касается
// «Улантам» — язычок желтеет, галочка; второй вариант не перечёркнут.
// На «топтомун» появляется карточка «Топтом», рисуется стрелка, и только на
// «андан кийин гана төлөйсүз» — «Төлөм». Никаких цен и автосписания.
// В конце камера уезжает к сгибу 5, руки перехватывают.
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useWordMatch } from "../context";
import { box, camKeys, Chip, StepHead, Svg, type Cam } from "../kit";
import { P4Board, p4NoCenter, p4YesCenter, type P4State } from "../panels/P4";
import { SKIN, CloseHand } from "../props/CloseHand";
import { FoldedEdge, panelTop, RIB, RIB_X } from "../ribbon";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { camOnFold, camOnPanel, RibbonStage } from "../stage";
import { C } from "../theme";
import { lineIn, sceneOf, wordMatchIn } from "../timing";
import { Step4Mom } from "./step4-mom";

const T = BG25_TEXT.step4;

type Beats = {
  readonly F: number;
  readonly from: number; // начало n04
  readonly choice: number; // «чечим»
  readonly yours: number; // «өзүңүздө»
  readonly want: number; // «кааласаңыз»
  readonly pack: number; // «топтомун»
  readonly pick: number; // «тандап»
  readonly only: number; // «гана»
  readonly pay: number; // «төлөйсүз»
};

const plan = (b: Beats) => {
  const u0 = 3;
  const uDur = 19;
  // врезка «Улантамбы?» — сразу после разворота, до «чечим»
  const insA = u0 + uDur + 1;
  const insB = Math.max(insA + 34, Math.min(b.choice - 4, insA + 52));
  const tap = b.want + 2; // касание «Улантам»
  const endA = b.F - 32;
  return { u0, uDur, insA, insB, tap, endA, endB: b.F - 8 };
};

const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));

// Кончик указательного пальца (CloseHand "point", рука снизу справа,
// angle 152°): запястье = кончик + 1,1·L по направлению к руке.
const L = 250;
const ANG = 152;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (ANG * Math.PI) / 180;
  return { x: tip.x + L * 1.1 * Math.sin(r) - 0.78 * L * 0.22, y: tip.y - L * 1.1 * Math.cos(r) };
};

export const Step4Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames: F } = useScene();
  const n04 = useLine("n04");
  const b: Beats = {
    F,
    from: n04.from,
    choice: useWordMatch("n04", "чечим"),
    yours: useWordMatch("n04", "өзүңүз"),
    want: useWordMatch("n04", "кааласа"),
    pack: useWordMatch("n04", "топтом"),
    pick: useWordMatch("n04", "тандап"),
    only: useWordMatch("n04", "гана"),
    pay: useWordMatch("n04", "төлөй"),
  };
  const P = plan(b);

  // ---------- лента ----------
  const unfold = clamp((f - P.u0) / P.uDur);
  const ue = easeInOut(unfold);

  // ---------- палец мамы ----------
  const top4 = panelTop(4);
  // кончик пальца — у нижней кромки язычка (под словом), текст остаётся открытым
  const yes = { x: RIB_X + p4YesCenter().x - 40, y: top4 + p4YesCenter().y + 118 };
  const no = { x: RIB_X + p4NoCenter().x - 40, y: top4 + p4NoCenter().y + 118 };
  const home = { x: RIB_X + RIB.w + 120, y: top4 + RIB.h + 360 };
  const handIn = easeInOut(clamp((f - (b.choice - 6)) / 16));
  const handOut = easeInOut(clamp((f - (P.tap + 14)) / 18));
  // колебание: к «Азырынча…», обратно к «Улантам», ещё раз — и выбор
  const swing = (() => {
    const a = b.choice + 10;
    const z = P.tap - 6;
    const q = clamp((f - a) / Math.max(1, z - a));
    // 0 → yes, 1 → no: yes → no → yes(середина) → no(чуть) → yes
    const path = [0, 1, 0.15, 0.7, 0];
    const seg = q * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(seg));
    return lerp(path[i], path[i + 1], easeInOut(seg - i));
  })();
  const over = { x: lerp(yes.x, no.x, swing), y: lerp(yes.y, no.y, swing) + 24 + 8 * Math.sin(f / 7) * (1 - clamp((f - (P.tap - 8)) / 6)) };
  const press = bump(f, P.tap - 2, P.tap + 7);
  const tipBase = { x: lerp(home.x, over.x, handIn), y: lerp(home.y, over.y, handIn) };
  const tip = { x: tipBase.x + (yes.x - tipBase.x) * press * 0.9, y: tipBase.y + (yes.y - 6 - tipBase.y) * press };
  const tipNow = { x: lerp(tip.x, home.x + 60, handOut), y: lerp(tip.y, home.y + 120, handOut) };
  const wr = wristFor(tipNow);
  const showHand = handIn > 0.001 && handOut < 0.999;

  // ---------- панель ----------
  const near = (p: { x: number; y: number }) => clamp(1 - Math.hypot(tipNow.x - p.x, tipNow.y - p.y) / 140);
  const s: P4State = {
    question: clamp((f - (P.u0 + P.uDur - 6)) / 12),
    tabs: clamp((f - (P.u0 + 8)) / 16),
    hoverYes: showHand ? near(yes) : 0,
    hoverNo: showHand ? near(no) : 0,
    press,
    yes: clamp((f - P.tap) / 4),
    pack: f - b.pack,
    arrow: clamp((f - (b.pick + 4)) / 18),
    pay: f - b.only,
  };

  // ---------- камера ----------
  const near4 = camOnPanel(4);
  const lay = (zoom: number, dy = 0): Cam => ({ x: 540, y: near4.y + dy, zoom });
  const cam = camKeys(f, [
    [2, camOnFold(4)],
    [P.u0 + P.uDur + 4, near4],
    [b.choice, lay(1.2, -10)],
    [P.tap, lay(1.24, -30)],
    [b.pack, lay(1.18, 10)],
    [P.endA, lay(1.16, 20)],
    [P.endB, camOnFold(5)],
  ]);

  // ---------- руки мамы на ленте ----------
  const holdY = panelTop(5) + 160;
  const lowY = panelTop(5) + 172;
  const edgeY = top4 + RIB.h * Math.sin((Math.PI / 2) * ue) + 177;
  const regrip = easeInOut(clamp((f - P.endA) / (P.endB - P.endA)));
  // пока работает палец, правая рука уходит с ленты — держит левая (обе
  // руки рисует MomHands; во время касания они опускаются чуть ниже)
  const fingerBusy = handIn * (1 - handOut);
  // руки держат ленту за нижние углы; пока работает палец, правая рука
  // уходит вниз за кадр (палец — это она), левая продолжает держать
  const handsY = lerp(lerp(edgeY, holdY, ue), lowY, regrip) - (0.7 * bump(f, P.u0 - 6, P.u0 + 8) + 0.9 * bump(f, P.endA - 2, P.endA + 14)) * 18;
  const rightAway = fingerBusy;
  const wobK = clamp((f - (P.endB - 26)) / 8);
  const wobble = wobK * (0.5 - 0.5 * Math.cos((2 * Math.PI * (f - (P.endB - 26))) / 16));

  // язычок под лентой: «4/6» мягко сменяется на «5/6»
  const swapEnd = P.u0 + Math.round(P.uDur * 0.6);
  const swap = f >= P.u0 && f < swapEnd;
  const swapK = easeInOut(clamp((f - P.u0) / (swapEnd - P.u0)));
  const edgeAt = top4 + RIB.h * Math.sin((Math.PI / 2) * ue) + 2;
  const edge = swap ? (
    <>
      <div style={box({ left: 0, top: 0, opacity: 1 - swapK })}>
        <FoldedEdge x={RIB_X} y={edgeAt} rest={3} next={4} />
      </div>
      <div style={box({ left: 0, top: 0, opacity: swapK })}>
        <FoldedEdge x={RIB_X} y={edgeAt} rest={2} next={5} />
      </div>
    </>
  ) : null;

  const headOut = easeInOut(clamp((f - P.endA) / 14));
  // врезка «через фон»: лента → цвет фона → мама (и обратно); смена планов
  // под полностью непрозрачной вуалью — без двойной экспозиции
  const insO = f >= P.insA + 3 && f < P.insB - 3 ? 1 : 0;
  const veil = Math.max(1 - Math.abs(f - (P.insA + 3)) / 3, 1 - Math.abs(f - (P.insB - 3)) / 3, 0);

  return (
    <div style={box({ inset: 0 })}>
      {insO < 0.999 ? (
        <RibbonStage f={f} n={4} unfold={unfold} art={<P4Board s={s} />} cam={cam} hands={null} wobble={wobble} showEdge={!swap}>
          {edge}
          <Svg>
            <CloseHand x={RIB_X - 18} y={handsY + Math.sin(f / 26) * 4} angle={-150} size={240} {...SKIN.apa} shape="pinch" mirror armLen={5} />
            {rightAway < 0.999 ? (
              <CloseHand x={RIB_X + RIB.w + 18} y={handsY + Math.sin(f / 31 + 1) * 3 + 560 * rightAway} angle={150} size={240} {...SKIN.apa} shape="pinch" armLen={5} />
            ) : null}
          </Svg>
          {showHand ? (
            <Svg>
              <CloseHand x={wr.x} y={wr.y} angle={ANG} size={L} {...SKIN.apa} shape="point" armLen={5} />
              {press > 0.2 ? <circle cx={yes.x} cy={yes.y - 10} r={22 + 26 * press} fill="none" stroke={C.yellowDeep} strokeWidth={6} opacity={0.7 * press} /> : null}
            </Svg>
          ) : null}
        </RibbonStage>
      ) : null}
      <Step4Mom f={f} t={f - P.insA} dur={P.insB - P.insA} opacity={insO} />
      {veil > 0.001 ? <div style={box({ inset: 0, backgroundColor: C.bg, opacity: veil })} /> : null}
      <StepHead n={4} text={T.head} t={f - Math.min(b.choice - 4, P.insB)} out={headOut} />
      <Chip text={T.after} x={520} y={1236} t={f - b.pick} bg={C.white} color={C.navy} size={38} border={C.yellow} out={headOut} />
    </div>
  );
};

export const step4Sfx: SceneSfx = (tl) => {
  const sc = sceneOf(tl, "step4");
  const w = (p: string) => wordMatchIn(tl, "step4", "n04", p);
  const b: Beats = {
    F: sc.frames,
    from: lineIn(tl, "step4", "n04").from,
    choice: w("чечим"),
    yours: w("өзүңүз"),
    want: w("кааласа"),
    pack: w("топтом"),
    pick: w("тандап"),
    only: w("гана"),
    pay: w("төлөй"),
  };
  const P = plan(b);
  return [
    { at: P.u0, src: SFX.unfold, volume: 0.36 },
    { at: P.insA + 8, src: SFX.pop, volume: 0.14 },
    { at: P.tap, src: SFX.tap, volume: 0.42 },
    { at: P.tap + 3, src: SFX.chime, volume: 0.16 },
    { at: b.pack, src: SFX.pop, volume: 0.2 },
    { at: b.pick + 4, src: SFX.slide, volume: 0.14 },
    { at: b.only, src: SFX.pop, volume: 0.2 },
    { at: P.endA + 2, src: SFX.rustle, volume: 0.2 },
  ];
};

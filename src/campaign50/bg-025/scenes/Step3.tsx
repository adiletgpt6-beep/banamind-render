// Шаг 3/6 «Биринчи толук сыноо сапары — акысыз» (условный пример).
// Руки мамы тянут ленту — панель 3 разворачивается на сгибе; на «топ
// түзүлгөндө» на бумаге штампом печатается условие. Мама наклоняет лист к
// себе, и плоская картинка встаёт pop-up диорамой: небо с плашкой условия,
// хребет Ала-Тоо со снегом, тополя, панельный дом, школа, улица, белая
// машина, мама и дочь. На «эртең менен мектепке» — золотистое утро: дочь
// садится в машину (дети пристёгнуты), машина едет к школе, дети идут к
// дверям. На «сабактан кийин» солнце проходит по небу, становится теплее,
// машина везёт детей обратно, мама встречает дочь у подъезда (рука на
// плече). Плашка маршрута «ҮЙ → МЕКТЕП → ҮЙ» заполняется по половинам.
// В конце диорама складывается в плоскую печать, камера уходит к сгибу 4.
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useWordMatch } from "../context";
import { box, ExampleBadge, settle } from "../kit";
import { P3G, P3Label } from "../panels/P3";
import { panelTop, RIB, RIB_X } from "../ribbon";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { RibbonStage } from "../stage";
import { C, F, SAFE } from "../theme";
import { lineIn, sceneOf, wordMatchIn } from "../timing";
import { camAt } from "./step3-camera";
import { Diorama, ORIGIN_FLAT, projPanel, TILT } from "./step3-diorama";
import { step3Plan, type Step3Words } from "./step3-plan";

const T = BG25_TEXT.step3;
const TOP = panelTop(3);

const span = (f: number, a: number, b: number) => easeInOut((f - a) / Math.max(1, b - a));
const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));

// ---------- Заголовок шага (как StepHead, но в две строки и с маркером) ----------
const Head3: React.FC<{ readonly t: number; readonly out: number; readonly mark: number }> = ({ t, out, mark }) => {
  if (t < 0) return null;
  const size = 44;
  const k = settle(t, 16);
  const body = T.head.replace(/^\d\.\s*/, "");
  const n = T.head.match(/^(\d)\./)?.[1] ?? "3";
  const words = body.split(" ");
  // две строки примерно равной длины; последнее слово — под маркером
  let cut = 1;
  let best = 1e9;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    if (Math.max(a, b) < best) {
      best = Math.max(a, b);
      cut = i;
    }
  }
  const l1 = words.slice(0, cut).join(" ");
  const rest = words.slice(cut);
  const last = rest.pop() ?? "";
  const l2 = rest.join(" ");
  return (
    <div
      style={box({
        left: SAFE.left,
        right: SAFE.right - 40,
        top: SAFE.top + 10,
        display: "flex",
        justifyContent: "center",
        opacity: clamp(k * 1.4) * (1 - out),
        transform: `translateY(${(1 - k) * -40 - out * 30}px)`,
      })}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          padding: "14px 34px 14px 16px",
          borderRadius: 999,
          backgroundColor: C.white,
          boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
          fontFamily: F.text,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          color: C.navy,
          maxWidth: 880,
        }}
      >
        <div
          style={{
            width: size * 1.55,
            height: size * 1.55,
            borderRadius: 999,
            backgroundColor: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: size * 0.9,
          }}
        >
          {n}
        </div>
        <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          {l1}
          <br />
          {l2}{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            {mark > 0.001 ? <span style={box({ left: -6, bottom: 3, height: 20, width: `calc((100% + 12px) * ${mark.toFixed(4)})`, borderRadius: 10, backgroundColor: C.yellow, opacity: 0.9 })} /> : null}
            <span style={{ position: "relative" }}>{last}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// ---------- Плашка маршрута: «ҮЙ → МЕКТЕП → ҮЙ», половины заполняются ----------
const RouteArrow: React.FC = () => (
  <svg width={40} height={26} viewBox="0 0 40 26">
    <path d="M 3 13 H 33 M 24 4 L 35 13 L 24 22" fill="none" stroke={C.navy} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const RW = [96, 62, 214, 62, 96] as const; // ячейки: ҮЙ, →, МЕКТЕП, →, ҮЙ
const R_W = RW.reduce((a, b) => a + b, 0);
const R_MID = RW[0] + RW[1] + RW[2] / 2;
const RouteCard: React.FC<{ readonly t: number; readonly out: number; readonly am: number; readonly pm: number; readonly amT: number; readonly pmT: number }> = ({ t, out, am, pm, amT, pmT }) => {
  if (t < 0) return null;
  const k = settle(t, 14);
  const parts = T.route.split("→").map((s) => s.trim());
  const cells = [parts[0], "→", parts[1], "→", parts[2]];
  const fill = am * R_MID + pm * (R_W - R_MID);
  const lab = (text: string, tt: number, active: number, cx: number) => {
    const kk = settle(tt, 12);
    return (
      <div
        style={box({
          left: cx - 140,
          width: 280,
          top: 0,
          textAlign: "center",
          fontFamily: F.text,
          fontWeight: 900,
          fontSize: 28,
          lineHeight: 1.1,
          color: active > 0.5 ? C.navy : C.inkSoft,
          opacity: tt < 0 ? 0 : clamp(kk * 1.5),
          transform: `translateY(${(1 - kk) * 8}px)`,
        })}
      >
        {text}
      </div>
    );
  };
  const amOn = am > 0.001 && pm < 0.001 ? 1 : 0;
  const pmOn = pm > 0.001 ? 1 : 0;
  return (
    <div
      style={box({
        left: 540 - 40 - (R_W + 40) / 2,
        top: 462,
        width: R_W + 40,
        height: 112,
        borderRadius: 26,
        backgroundColor: C.white,
        boxShadow: "0 12px 30px rgba(20,40,90,0.15)",
        opacity: clamp(k * 1.5) * (1 - out),
        transform: `translateY(${(1 - k) * -18 - out * 16}px) scale(${0.92 + 0.08 * k})`,
      })}
    >
      <div style={box({ left: 20, top: 12, width: R_W, height: 30 })}>
        {lab(T.am, amT, amOn, R_MID / 2)}
        {lab(T.pm, pmT, pmOn, R_MID + (R_W - R_MID) / 2)}
      </div>
      <div style={box({ left: 20, top: 48, width: R_W, height: 50 })}>
        <div style={box({ left: 0, top: 0, height: 50, width: R_W, borderRadius: 25, backgroundColor: C.yellowSoft })} />
        {fill > 1 ? <div style={box({ left: 0, top: 0, height: 50, width: fill, borderRadius: 25, backgroundColor: C.yellow })} /> : null}
        <div style={box({ left: 0, top: 0, width: R_W, height: 50, display: "flex" })}>
          {cells.map((c, i) => (
            <div
              key={i}
              style={{
                width: RW[i],
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.text,
                fontWeight: 900,
                fontSize: i % 2 ? 34 : 38,
                lineHeight: 1,
                color: C.navy,
              }}
            >
              {i % 2 ? <RouteArrow /> : c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Сцена ----------
const useWords = (): Step3Words => {
  const { frames } = useScene();
  const n03 = useLine("n03");
  return {
    F: frames,
    from: n03.from,
    top: useWordMatch("n03", "топ"),
    tuz: useWordMatch("n03", "түзүл"),
    bir: useWordMatch("n03", "биринчи"),
    tol: useWordMatch("n03", "толук"),
    syn: useWordMatch("n03", "сыноо"),
    sap: useWordMatch("n03", "сапары"),
    aky: useWordMatch("n03", "акысыз"),
    otot: useWordMatch("n03", "өтөт"),
    ert: useWordMatch("n03", "эртең"),
    sab: useWordMatch("n03", "сабактан"),
    kai: useWordMatch("n03", "кайра"),
  };
};

export const Step3Scene: React.FC = () => {
  const f = useCurrentFrame();
  const P = step3Plan(useWords());

  // ---------- лист: разворот → наклон «полом» → обратно плашмя ----------
  const ue = easeInOut(clamp((f - P.u0) / (P.u1 - P.u0)));
  const tilt = span(f, P.tiltA, P.tiltB) - span(f, P.flatA, P.flatB);
  const ang = -90 * (1 - ue) + TILT * tilt;
  const cam = camAt(f, P);
  const camLocal = { x: cam.x - RIB_X, y: cam.y - TOP };
  const o = { x: lerp(ORIGIN_FLAT.x, camLocal.x, tilt), y: lerp(ORIGIN_FLAT.y, camLocal.y, tilt) };

  // ---------- руки мамы ----------
  const fc = projPanel(RIB.w / 2, RIB.h, ang, o);
  const regrip = span(f, P.camA, P.camB);
  const hands = {
    y: lerp(fc.y + lerp(230, 160, ue), panelTop(4) + 230, regrip),
    // на близких планах камера «внутри» диорамы — руки уходят из кадра
    show: (1 - 0.12 * bump(f, P.camA, P.camB)) * (1 - easeInOut((cam.zoom - 1.2) / 0.3)),
    lift: 0.7 * bump(f, P.u0 - 6, P.u0 + 8) + 0.5 * bump(f, P.tiltA - 4, P.tiltA + 12) + 0.9 * bump(f, P.camA - 2, P.camA + 14),
    tilt,
  };
  const wobT = f - (P.camB - 26);
  const wobble = clamp(wobT / 8) * (0.5 - 0.5 * Math.cos((2 * Math.PI * wobT) / 16));
  const edge = { swap: easeInOut(clamp((f - P.u0) / (0.6 * (P.u1 - P.u0)))), wobble };

  // ---------- плашка условия: снимается с бумаги и висит над диорамой ----------
  // возвращается на бумагу, пока небо ещё закрывает панель 2 (дальние
  // горы уже легли и не заслоняют место печати)
  const flyUp = span(f, P.tiltA + 2, P.tiltA + 22);
  const flyBack = span(f, P.chipA, P.chipB);
  const fly = flyUp - flyBack;
  const chipOn = f >= P.tiltA + 2 && f < P.chipB;
  const lw = projPanel(P3G.label.x, P3G.label.y, ang, o);
  const paper = { x: 540 + (lw.x - cam.x) * cam.zoom, y: 960 + (lw.y - cam.y) * cam.zoom, sx: cam.zoom * lw.s, sy: cam.zoom * lw.s * Math.cos((ang * Math.PI) / 180) };
  const ROW = { x: 530, y: 420, s: 0.9 };
  const chip = {
    x: lerp(paper.x, ROW.x, fly),
    y: lerp(paper.y, ROW.y, fly) - 46 * Math.sin(Math.PI * clamp(fly)),
    sx: lerp(paper.sx, ROW.s, fly),
    sy: lerp(paper.sy, ROW.s, fly),
  };
  const labelT = chipOn ? -1 : f - P.label;

  // ---------- слой кадра ----------
  const am = span(f, P.d1A, P.d1B);
  const pm = span(f, P.d2A, P.d2B);
  // плашки поездки уходят до того, как плашка условия полетит на бумагу
  const tripOut = span(f, P.downA - 6, P.downA + 4);
  // заголовок гаснет быстро и до того, как небо откроет панель 2
  const headOut = span(f, P.headA, P.headB);
  return (
    <div style={box({ inset: 0 })}>
      <RibbonStage f={f} n={3} unfold={0} art={null} cam={cam} hands={null} showEdge={false}>
        <Diorama f={f} P={P} ang={ang} o={o} labelT={labelT} routeT={f - (P.flatB - 8)} hands={hands} edge={edge} />
      </RibbonStage>
      <Head3 t={f - P.head} out={headOut} mark={span(f, P.aky, P.aky + 12)} />
      <ExampleBadge text={T.example} t={f - P.badge} out={tripOut} top={392} />
      {chipOn ? (
        <div style={box({ left: chip.x - P3G.label.x, top: chip.y - P3G.label.y, width: 1, height: 1, transformOrigin: `${P3G.label.x}px ${P3G.label.y}px`, transform: `scale(${chip.sx.toFixed(4)}, ${chip.sy.toFixed(4)})` })}>
          <P3Label t={999} />
        </div>
      ) : null}
      <RouteCard t={f - P.route} out={tripOut} am={am} pm={pm} amT={f - P.am} pmT={f - P.pm} />
    </div>
  );
};

// ---------- Звуки: разворот, штамп условия, слои pop-up, «акысыз», складывание ----------
export const step3Sfx: SceneSfx = (tl) => {
  const sc = sceneOf(tl, "step3");
  const w = (p: string) => wordMatchIn(tl, "step3", "n03", p);
  const P = step3Plan({
    F: sc.frames,
    from: lineIn(tl, "step3", "n03").from,
    top: w("топ"),
    tuz: w("түзүл"),
    bir: w("биринчи"),
    tol: w("толук"),
    syn: w("сыноо"),
    sap: w("сапары"),
    aky: w("акысыз"),
    otot: w("өтөт"),
    ert: w("эртең"),
    sab: w("сабактан"),
    kai: w("кайра"),
  });
  return [
    { at: P.u0, src: SFX.unfold, volume: 0.36 },
    { at: P.label + 3, src: SFX.pop, volume: 0.2 },
    { at: P.tiltA, src: SFX.rustle, volume: 0.22 },
    { at: P.pop.sky + 4, src: SFX.pop, volume: 0.14 },
    { at: P.pop.far + 4, src: SFX.pop, volume: 0.12 },
    { at: P.pop.house + 4, src: SFX.pop, volume: 0.2 },
    { at: P.pop.school + 4, src: SFX.pop, volume: 0.2 },
    { at: P.pop.road, src: SFX.slide, volume: 0.1 },
    { at: P.pop.car + 4, src: SFX.pop, volume: 0.16 },
    { at: P.aky + 2, src: SFX.tick, volume: 0.24 },
    { at: P.route, src: SFX.pop, volume: 0.12 },
    { at: P.noonA + 3, src: SFX.rustle, volume: 0.12 },
    { at: P.mtB - 2, src: SFX.chime, volume: 0.14 },
    { at: P.downA, src: SFX.fold, volume: 0.3 },
    { at: P.camA + 2, src: SFX.rustle, volume: 0.18 },
  ];
};

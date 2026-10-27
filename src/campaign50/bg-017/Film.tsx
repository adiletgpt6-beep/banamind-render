// BG-017 «Рисунок нашей недели»: весь фильм — один непрерывный живой
// рисунок на листе альбома, камера над столом. Никаких сменяющихся
// слайдов: те же линии клубка расправляются в строки недели и затем
// сходятся в маршрут; лист в финале складывается в открытку с контактами.
import { interpolate, useCurrentFrame } from "remotion";
import { useClock } from "./context";
import { CtaCard } from "./CtaCard";
import { fontFamily } from "./fonts";
import {
  angleAt,
  CAR_SPOT,
  DAD_WORK,
  DAY_LOOPS,
  DAY_ROWS,
  HOME,
  lerpPt,
  MOM_WORK,
  morph,
  pointAt,
  type Pt,
  ROUTE,
  ROUTE_LOOP,
  ROW_X,
  ROW_Y,
  SCHOOL,
  SHEET,
  smoothPath,
  TAB_BOTTOM,
  TAB_ROW,
  WORK_COLORS,
  WORK_LINES,
} from "./geometry";
import { Phone, PHONE } from "./Phone";
import {
  AdultHand,
  ArrowHead,
  ChildHand,
  CRAYON_YELLOW,
  Defs,
  DrawnCar,
  House,
  NAVY,
  Office,
  PAPER,
  RED_PENCIL,
  RouteCar,
  School,
  Scrawl,
  StickFamily,
  YELLOW,
  type HandPose,
} from "./props";
import { B17_TEXT } from "./script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (x: number) => x * x * (3 - 2 * x);
// плавный переход 0 → 1 на отрезке [a, b]
const ease = (t: number, a: number, b: number) => smooth(interpolate(t, [a, b], [0, 1], clamp));
const pop = (t: number, a: number, d = 0.45) => {
  const k = interpolate(t, [a, a + d], [0, 1], clamp);
  return k <= 0 ? 0 : 1 + 0.18 * Math.sin(Math.PI * k) * (1 - k) + (smooth(k) - 1);
};

type Key = { readonly at: number; readonly v: readonly number[] };
// значения по ключам с плавными переходами между соседними
const keys = (t: number, ks: readonly Key[]): number[] => {
  if (t <= ks[0].at) return [...ks[0].v];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (t <= b.at) {
      const k = smooth((t - a.at) / Math.max(1e-6, b.at - a.at));
      return a.v.map((x, j) => x + (b.v[j] - x) * k);
    }
  }
  return [...ks[ks.length - 1].v];
};

// мировые координаты точки листа
const W = (p: Pt): Pt => [SHEET.x + p[0], SHEET.y + p[1]];

export const Film: React.FC = () => {
  const { t, scene, cue } = useClock();
  const frame = useCurrentFrame();
  const H = scene("hook");
  const Wk = scene("week");
  const No = scene("notice");
  const Se = scene("search");
  const Ro = scene("route");
  const Ct = scene("cta");
  const m01 = cue("m01");
  const n01 = cue("n01");
  const n01b = cue("n01b");
  const m02 = cue("m02");
  const n03 = cue("n03");
  const n03b = cue("n03b");
  const n06 = cue("n06");

  // «живой» мелок: штрихи чуть дрожат (смена зерна каждые 5 кадров)
  const crayon = Math.floor(frame / 5) % 2 ? "url(#crayonB)" : "url(#crayon)";

  // ---------- Моменты ----------
  const dayAt = (i: number) => Wk.from + 0.5 + i * 2.25;
  const unweave = (i: number) => ease(t, No.from + 1.2 + i * 0.12, No.from + 3.0 + i * 0.12);
  const tapT = m02.to + 0.25;
  const merge = (i: number) => ease(t, tapT + 0.15 + i * 0.07, tapT + 1.45 + i * 0.07);
  const fold = ease(t, Ct.from, Ct.from + 0.75);
  const sheetFade = 1 - ease(t, Ct.from, Ct.from + 0.4);
  // третий шаг — на словах «улантууну ата-эне чечет»
  const w3 = n03b.words.find((w) => w.text.toLowerCase().startsWith("улантуу"));
  const step3At = w3 ? w3.start : n03b.from + (n03b.to - n03b.from) * 0.6;

  // ---------- Камера ----------
  const cam = keys(t, [
    { at: H.from, v: [540, 975, 1.75] },
    { at: H.from + 3.6, v: [540, 960, 1.0] },
    { at: Wk.from + 1.0, v: [540, 950, 1.07] },
    { at: Wk.to - 0.5, v: [548, 960, 1.04] },
    { at: No.from + 1.2, v: [540, 940, 1.0] },
    { at: No.from + 3.6, v: [540, 900, 1.08] },
    { at: Se.from + 0.2, v: [540, 900, 1.08] },
    { at: Se.from + 1.4, v: [560, 1080, 0.93] },
    { at: tapT + 0.4, v: [560, 1080, 0.93] },
    { at: tapT + 1.6, v: [540, 1010, 0.96] },
    { at: Ro.from + 1.2, v: [540, 960, 1.0] },
    { at: Ct.from, v: [540, 960, 1.0] },
  ]);
  const [cx, cy, z] = cam;

  // ---------- Лист ----------
  const sheetRot = interpolate(t, [No.from, No.from + 1.4], [-2.2, 0], clamp) + (t < No.from ? 0.25 * Math.sin(t * 0.7) : 0);
  const crease = 1 - ease(t, No.from + 0.2, No.from + 1.4);
  const card = { x: 96, y: 760, w: 868, h: 680 };
  const sx = interpolate(fold, [0, 1], [SHEET.x, card.x]);
  const sy = interpolate(fold, [0, 1], [SHEET.y, card.y]);
  const sw = interpolate(fold, [0, 1], [SHEET.w, card.w]);
  const sh = interpolate(fold, [0, 1], [SHEET.h, card.h]);

  // ---------- Линии ----------
  const loopPts = (i: number) => morph(morph(DAY_LOOPS[i], DAY_ROWS[i], unweave(i)), ROUTE_LOOP, merge(i));
  const drawStart = (i: number) => H.from + 0.2 + i * 0.42;
  const yellowDraw = (i: number) => interpolate(t, [drawStart(i), drawStart(i) + 0.5], [0, 1], clamp);
  const workStart = (i: number) => H.from + 1.5 + i * 0.26;
  const workDraw = (i: number) => interpolate(t, [workStart(i), workStart(i) + 0.32], [0, 1], clamp);
  const activeDay = t >= dayAt(0) && t < dayAt(4) + 2.25 ? Math.floor((t - dayAt(0)) / 2.25) : -1;
  const dayGlow = (i: number) => {
    if (activeDay < 0) return 1;
    return i === activeDay ? 1 : 0.32;
  };
  const workOpacity = (i: number) =>
    (activeDay < 0 ? 1 : i === activeDay ? 1 : 0.28) * (1 - 0.82 * ease(t, No.from + 1.0, No.from + 2.6)) * (1 - ease(t, tapT + 0.1, tapT + 0.9));
  const routeLook = merge(4);

  // ---------- Иконки ----------
  const bigIcons = 1 - ease(t, No.from + 0.9, No.from + 2.0);
  const headers = ease(t, No.from + 2.2, No.from + 3.0) * (1 - ease(t, tapT + 0.1, tapT + 0.7));
  const routeIcons = ease(t, tapT + 0.9, tapT + 1.6);
  const destBounce = (i: number) => {
    const a = dayAt(i);
    return t > a && t < a + 2.25 ? Math.abs(Math.sin((t - a) * Math.PI * 2.2)) * 10 : 0;
  };

  // ---------- Руки ----------
  // мама (розовый кардиган) — справа снизу, папа (джинсовая рубашка) — слева снизу
  const momRest: Pt = [930, 1430];
  const dadRest: Pt = [160, 1440];
  const phoneIn = ease(t, Se.from, Se.from + 1.2);
  const phoneOut = ease(t, Ro.from, Ro.from + 1.0);
  const phonePos: Pt = [interpolate(phoneIn, [0, 1], [1450, 600]) + phoneOut * 900, 1040];
  const phoneRot = interpolate(phoneIn, [0, 1], [10, 3]);
  const resultPt: Pt = [phonePos[0] + 200, phonePos[1] + 240];
  const writeQ = interpolate(t, [n01b.from, n01b.to + 0.2], [0, 1], clamp);
  const qStart: Pt = W([190, 1000]);
  const qEnd: Pt = W([760, 1000]);
  const circleRow = (i: number) => {
    const a = n01.from + 0.15 + i * 0.5;
    return interpolate(t, [a, a + 0.48], [0, 1], clamp);
  };
  const ellipsePt = (i: number, k: number): Pt => {
    const c = W([545, ROW_Y[i] - 10]);
    const a = -Math.PI * 0.95 + k * Math.PI * 2;
    return [c[0] + 380 * Math.cos(a), c[1] + 52 * Math.sin(a)];
  };
  const timesAt = n01.from + 0.15 + 5 * 0.5;
  const timesK = interpolate(t, [timesAt, timesAt + 0.5], [0, 1], clamp);

  let momAt: Pt = [1350, 2100];
  let momPose: HandPose = "flat";
  let momAngle = -35;
  {
    const enter = ease(t, Wk.from + 0.2, Wk.from + 1.3);
    momAt = lerpPt([1350, 2150], momRest, enter);
    // на словах «Канча жол тартыпсың» мама показывает на клубок
    const pt = ease(t, m01.from - 0.3, m01.from + 0.4) * (1 - ease(t, m01.to + 0.3, m01.to + 1.0));
    if (pt > 0.01) {
      momPose = "point";
      momAt = lerpPt(momAt, [640 + 30 * Math.sin(t * 2.2), 1020 + 20 * Math.cos(t * 1.7)], pt);
    }
    // расправляет лист
    const smoothK = ease(t, No.from, No.from + 0.7) * (1 - ease(t, No.from + 1.3, No.from + 1.9));
    if (smoothK > 0.01) momAt = lerpPt(momAt, lerpPt([760, 1420], [990, 1440], ease(t, No.from + 0.4, No.from + 1.4)), smoothK);
    // пишет вопрос
    const wr = ease(t, n01b.from - 0.6, n01b.from) * (1 - ease(t, n01b.to + 0.4, n01b.to + 1.0));
    if (wr > 0.01) {
      momPose = "pencil";
      momAt = lerpPt(momAt, lerpPt(qStart, qEnd, writeQ), wr);
      momAngle = -35 + 10 * wr;
    }
    // кладёт телефон, затем касается результата BalaGo
    if (t >= Se.from - 0.3) {
      const hold: Pt = [phonePos[0] + 330, phonePos[1] + 560];
      const away = ease(t, Se.from + 3.0, Se.from + 3.7);
      momPose = "flat";
      momAt = lerpPt(momRest, hold, ease(t, Se.from - 0.3, Se.from + 0.1));
      // набирает запрос на телефоне
      const typing = ease(t, Se.from + 1.0, Se.from + 1.4) * (1 - away);
      if (typing > 0.01) {
        momPose = "point";
        const field: Pt = [phonePos[0] + 250 + 14 * Math.sin(t * 9), phonePos[1] + 120 + 6 * Math.cos(t * 13)];
        momAt = lerpPt(momAt, field, typing);
      }
      momAt = lerpPt(momAt, [1300, 1900], away);
      const tap = ease(t, tapT - 0.9, tapT - 0.15) * (1 - ease(t, tapT + 0.5, tapT + 1.3));
      if (tap > 0.01) {
        momPose = "point";
        const press = t > tapT - 0.15 && t < tapT + 0.15 ? 6 : 0;
        momAt = lerpPt([1300, 1900], [resultPt[0], resultPt[1] + press], tap);
      }
    }
  }

  let dadAt: Pt = [-300, 2150];
  let dadPose: HandPose = "flat";
  {
    const enter = ease(t, Wk.from + 0.6, Wk.from + 1.7);
    dadAt = lerpPt([-300, 2150], dadRest, enter);
    const smoothK = ease(t, No.from, No.from + 0.7) * (1 - ease(t, No.from + 1.3, No.from + 1.9));
    if (smoothK > 0.01) dadAt = lerpPt(dadAt, lerpPt([330, 1430], [90, 1440], ease(t, No.from + 0.4, No.from + 1.4)), smoothK);
    // красный карандаш обводит повтор в каждой строке, пишет «× 5»
    const pen = ease(t, n01.from - 0.5, n01.from + 0.1) * (1 - ease(t, timesAt + 0.7, timesAt + 1.4));
    if (pen > 0.01) {
      dadPose = "pencil";
      let target: Pt = ellipsePt(0, 0);
      for (let i = 0; i < 5; i++) if (t >= n01.from + 0.15 + i * 0.5) target = ellipsePt(i, circleRow(i));
      if (t >= timesAt) target = lerpPt(W([700, 900]), W([840, 900]), timesK);
      dadAt = lerpPt(dadAt, target, pen);
    }
    dadAt = lerpPt(dadAt, [-300, 2150], ease(t, Se.from, Se.from + 1.0));
  }

  // ребёнок рисует клубок и подписывает «Биздин апта»
  const childHand = (() => {
    const out = ease(t, H.from + 4.6, H.from + 5.8);
    if (t > H.from + 6) return null;
    let at: Pt = W(pointAt(DAY_LOOPS[0], 0));
    for (let i = 0; i < 5; i++) if (t >= drawStart(i)) at = W(pointAt(DAY_LOOPS[i], yellowDraw(i)));
    for (let i = 0; i < 5; i++) if (t >= workStart(i)) at = W(pointAt(WORK_LINES[i], workDraw(i)));
    const title = interpolate(t, [H.from + 3.0, H.from + 4.4], [0, 1], clamp);
    if (t >= H.from + 2.9) at = lerpPt(W([270, 95]), W([670, 95]), title);
    at = lerpPt(at, [700, 2200], out);
    return <ChildHand at={at} angle={18} />;
  })();
  const titleReveal = interpolate(t, [H.from + 3.0, H.from + 4.4], [0, 1], clamp);
  const family = pop(t, H.from + 2.5);

  // ---------- Шаги условий ----------
  const steps = [n03.from - 0.2, n03b.from - 0.2, step3At - 0.2];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#B98A5E" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: "0 0",
          transform: `translate(540px, 960px) scale(${z}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", overflow: "visible" }}>
          <Defs />
          {/* стол */}
          <rect x={-700} y={-700} width={2480} height={3320} fill="#C89A6A" />
          <rect x={-700} y={-700} width={2480} height={3320} filter="url(#wood)" />
          {[-200, 140, 520, 900, 1290, 1680, 2060].map((y) => (
            <rect key={y} x={-700} y={y} width={2480} height={3} fill="rgba(90,55,25,0.18)" />
          ))}
          {/* карандаши на столе — спокойный реквизит */}
          <g opacity={sheetFade}>
            <g transform="translate(40 1630) rotate(-14)">
              <rect width={260} height={18} rx={4} fill="#2F6BD8" />
              <path d="M 260 0 L 290 9 L 260 18 Z" fill="#F2D2A6" />
            </g>
            <g transform="translate(70 1690) rotate(-8)">
              <rect width={240} height={18} rx={4} fill="#2EA05A" />
              <path d="M 240 0 L 270 9 L 240 18 Z" fill="#F2D2A6" />
            </g>
            <g transform="translate(820 260) rotate(22)">
              <rect width={200} height={22} rx={6} fill={CRAYON_YELLOW} />
              <rect x={60} width={70} height={22} fill="#FFFFFF" opacity={0.8} />
            </g>
          </g>

          {/* лист альбома */}
          <g transform={`rotate(${sheetRot * (1 - fold)} ${sx + sw / 2} ${sy + sh / 2})`}>
            <rect x={sx + 10} y={sy + 16} width={sw} height={sh} rx={18 + fold * 26} fill="rgba(60,30,10,0.22)" filter="url(#soft)" />
            <rect x={sx} y={sy} width={sw} height={sh} rx={10 + fold * 34} fill={PAPER} />
            <rect x={sx} y={sy} width={sw} height={sh} rx={10 + fold * 34} filter="url(#paper)" opacity={sheetFade} />
            {/* складка расправляется */}
            <path
              d={`M ${sx + sw * 0.62} ${sy} L ${sx + sw} ${sy + sh * 0.3} L ${sx + sw} ${sy}`}
              fill="rgba(120,90,60,0.10)"
              opacity={crease * sheetFade}
            />
            <path d={`M ${sx} ${sy + sh * 0.78} L ${sx + sw * 0.3} ${sy + sh}`} stroke="rgba(120,90,60,0.18)" strokeWidth={3} opacity={crease * sheetFade} />
            {/* пружина альбома */}
            <g opacity={sheetFade}>
              {Array.from({ length: 15 }, (_, i) => (
                <g key={i}>
                  <circle cx={sx + 50 + i * 60} cy={sy + 24} r={9} fill="#7A6A58" />
                  <rect x={sx + 45 + i * 60} y={sy - 18} width={10} height={44} rx={5} fill="#9AA0AA" />
                </g>
              ))}
            </g>

            <g transform={`translate(${SHEET.x} ${SHEET.y})`} opacity={sheetFade}>
              {/* заголовок «Биздин апта» */}
              <Scrawl x={470} y={110} text={B17_TEXT.title} size={70} color="#E2533A" rot={-2} reveal={titleReveal} />

              {/* иконки рисунка */}
              <g opacity={bigIcons}>
                <g opacity={ease(t, dayAt(0), dayAt(0) + 0.4)}>
                  <Office p={[MOM_WORK[0], MOM_WORK[1] - destBounce(0)]} color="#2F6BD8" s={pop(t, dayAt(0)) || 0.001} />
                </g>
                <g opacity={ease(t, dayAt(1), dayAt(1) + 0.4)}>
                  <School p={[SCHOOL[0], SCHOOL[1] - destBounce(1) - destBounce(4)]} s={pop(t, dayAt(1)) || 0.001} flag={Math.sin(t * 5)} />
                </g>
                <g opacity={ease(t, dayAt(3), dayAt(3) + 0.4)}>
                  <Office p={[DAD_WORK[0], DAD_WORK[1] - destBounce(3)]} color="#2EA05A" s={pop(t, dayAt(3)) || 0.001} />
                </g>
                <g opacity={ease(t, H.from + 0.1, H.from + 0.5)}>
                  <House p={HOME} />
                </g>
                {family > 0 ? (
                  <g transform={`translate(${HOME[0] + 130} ${HOME[1] + 70}) scale(${family})`}>
                    <StickFamily p={[0, 0]} bob={activeDay >= 0 ? t * 0.8 : 0} />
                  </g>
                ) : null}
              </g>

              {/* заголовки строк недели */}
              <g opacity={headers}>
                <House p={[ROW_X.home, 150]} s={0.42} label="" />
                <School p={[ROW_X.school, 165]} s={0.4} />
                <House p={[ROW_X.back, 150]} s={0.42} label="" />
                <Scrawl x={ROW_X.home} y={205} text="ҮЙ" size={30} />
                <Scrawl x={ROW_X.back} y={205} text="ҮЙ" size={30} />
              </g>

              {/* линии работы родителей */}
              {WORK_LINES.map((pts, i) => (
                <path
                  key={`w${i}`}
                  d={smoothPath(morph(pts, DAY_ROWS[i], unweave(i) * 0.25))}
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - workDraw(i)}
                  stroke={WORK_COLORS[i]}
                  strokeWidth={activeDay === i ? 11 : 8}
                  fill="none"
                  strokeLinecap="round"
                  opacity={workOpacity(i)}
                  filter={crayon}
                />
              ))}
              {/* жёлтые петли дней: клубок → строки → маршрут */}
              {[0, 1, 2, 3, 4].map((i) => {
                const pts = loopPts(i);
                const w = interpolate(routeLook, [0, 1], [activeDay === i ? 15 : 11, 22]);
                return (
                  <path
                    key={`y${i}`}
                    d={smoothPath(pts)}
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - yellowDraw(i)}
                    stroke={routeLook > 0.5 ? YELLOW : CRAYON_YELLOW}
                    strokeWidth={w}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={dayGlow(i) * (routeLook > 0.9 && i > 0 ? 0 : 1)}
                    filter={routeLook > 0.95 ? undefined : crayon}
                  />
                );
              })}
              {/* точки ҮЙ / МЕКТЕП / ҮЙ на строках */}
              <g opacity={headers}>
                {ROW_Y.map((y) =>
                  [ROW_X.home, ROW_X.school, ROW_X.back].map((x) => <circle key={`${x}-${y}`} cx={x} cy={x === ROW_X.school ? y - 26 : y} r={9} fill={NAVY} />),
                )}
              </g>

              {/* путешественники дня (живой рисунок) */}
              {activeDay >= 0 && activeDay < 5
                ? (() => {
                    const i = activeDay;
                    const k = interpolate(t, [dayAt(i) + 0.2, dayAt(i) + 2.1], [0, 1], clamp);
                    const p = pointAt(DAY_LOOPS[i], k);
                    const wp = pointAt(WORK_LINES[i], k);
                    const isCar = B17_TEXT.days[i].dest === "car";
                    return (
                      <g>
                        {isCar ? (
                          <DrawnCar p={p} s={0.9} rot={Math.max(-25, Math.min(25, angleAt(DAY_LOOPS[i], k) * 0.2))} />
                        ) : (
                          <g transform={`translate(${p[0]} ${p[1] + 22}) scale(0.62)`}>
                            <StickFamily p={[0, 0]} bob={t * 2} />
                          </g>
                        )}
                        <circle cx={wp[0]} cy={wp[1]} r={13} fill={WORK_COLORS[i]} stroke="#FFFFFF" strokeWidth={4} />
                      </g>
                    );
                  })()
                : null}
              {/* машинка среды стоит на рисунке */}
              <g opacity={bigIcons * ease(t, dayAt(2), dayAt(2) + 0.4) * (activeDay === 2 ? 0 : 1)}>
                <DrawnCar p={CAR_SPOT} s={0.8} />
              </g>

              {/* ярлыки дней */}
              {B17_TEXT.days.map((d, i) => {
                const p = lerpPt(TAB_BOTTOM(i), TAB_ROW(i), unweave(i));
                const on = activeDay === i;
                const o = ease(t, H.from + 3.4 + i * 0.12, H.from + 3.8 + i * 0.12) * (1 - ease(t, tapT + 0.1, tapT + 0.7));
                return (
                  <g key={d.short} transform={`translate(${p[0]} ${p[1]}) scale(${on ? 1.18 : 1})`} opacity={o}>
                    <rect x={-58} y={-34} width={116} height={64} rx={20} fill={on ? YELLOW : "#FFFFFF"} stroke={NAVY} strokeWidth={4} transform={`rotate(${(i % 2 ? 2 : -2) * 1})`} />
                    <text x={0} y={12} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={34} fill={NAVY}>
                      {d.short}
                    </text>
                  </g>
                );
              })}

              {/* красный карандаш: обводка повтора и «× 5» */}
              <g opacity={1 - ease(t, tapT + 0.05, tapT + 0.6)}>
                {ROW_Y.map((y, i) => (
                  <ellipse
                    key={`c${i}`}
                    cx={545}
                    cy={y - 10}
                    rx={380}
                    ry={52}
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - circleRow(i)}
                    transform={`rotate(-1 545 ${y})`}
                    stroke={RED_PENCIL}
                    strokeWidth={6}
                    fill="none"
                    filter="url(#pencil)"
                  />
                ))}
                <Scrawl x={770} y={920} text={B17_TEXT.times} size={86} color={RED_PENCIL} reveal={timesK} anchor="middle" />
                <Scrawl x={470} y={1010} text={B17_TEXT.question} size={52} color="#2F4F9A" rot={-1.5} reveal={writeQ} />
              </g>

              {/* маршрут BalaGo: ҮЙ → МЕКТЕП → ҮЙ */}
              <g opacity={routeIcons}>
                <House p={[110, 480]} s={0.72} label="ҮЙ" />
                <School p={[858, 500]} s={0.64} />
              </g>
              <g opacity={ease(t, Ro.from + 0.2, Ro.from + 0.8)}>
                <ArrowHead p={[ROUTE.right - 40, ROUTE.top]} angle={0} color={NAVY} />
                <ArrowHead p={[ROUTE.left + 40, ROUTE.bottom]} angle={180} color={NAVY} />
                <Scrawl x={465} y={262} text={B17_TEXT.route.morning} size={34} />
                <Scrawl x={465} y={652} text={B17_TEXT.route.afternoon} size={34} />
                <g transform={`translate(465 475) scale(${pop(t, Ro.from + 0.9)})`}>
                  <rect x={-150} y={-30} width={300} height={60} rx={30} fill={NAVY} />
                  <text x={0} y={12} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={32} fill="#FFFFFF">
                    {B17_TEXT.route.trip}
                  </text>
                </g>
                <g transform="translate(790 215) rotate(3)">
                  <rect x={-112} y={-26} width={224} height={46} rx={10} fill="#FFFFFF" stroke="#8A93A8" strokeWidth={3} strokeDasharray="8 6" />
                  <text x={0} y={7} textAnchor="middle" fontFamily="Nunito" fontWeight={800} fontSize={24} fill="#5A6480">
                    {B17_TEXT.route.example}
                  </text>
                </g>
              </g>
              {t > Ro.from + 0.6 && t < Ct.from + 0.2
                ? (() => {
                    const k = ((t - Ro.from - 0.6) / 5.5) % 1;
                    const p = pointAt(ROUTE_LOOP, k);
                    let ang = angleAt(ROUTE_LOOP, k);
                    // едет влево (после уроков) — машина разворачивается, не переворачивается
                    const back = Math.cos((ang * Math.PI) / 180) < -0.01;
                    if (back) ang -= 180;
                    return (
                      <g opacity={ease(t, Ro.from + 0.6, Ro.from + 1.0)} transform={`translate(${p[0]} ${p[1]}) rotate(${ang})`}>
                        <RouteCar p={[0, -30]} flip={back} s={0.78} bounce={Math.sin(t * 18) * 1.2} />
                      </g>
                    );
                  })()
                : null}

              {/* условия — заметки на листе */}
              {B17_TEXT.steps.map((s, i) => {
                const k = pop(t, steps[i], 0.5);
                const y = 770 + i * 122;
                return (
                  <g key={s.n} opacity={Math.min(1, k)} transform={`translate(470 ${y}) scale(${k || 0.001}) rotate(${i % 2 ? 0.8 : -0.8})`}>
                    <rect x={-400} y={-52} width={800} height={108} rx={22} fill="#FFFFFF" stroke={i === 1 ? YELLOW : "#C9D3E6"} strokeWidth={i === 1 ? 7 : 4} />
                    <circle cx={-342} cy={2} r={34} fill={YELLOW} stroke={NAVY} strokeWidth={4} />
                    <text x={-342} y={15} textAnchor="middle" fontFamily="Nunito" fontWeight={1000} fontSize={38} fill={NAVY}>
                      {s.n}
                    </text>
                    <text x={-290} y={-4} fontFamily="Nunito" fontWeight={900} fontSize={i === 1 ? 33 : 35} fill={NAVY}>
                      {s.text}
                    </text>
                    <text x={-290} y={34} fontFamily="Nunito" fontWeight={700} fontSize={26} fill="#5A6480">
                      {s.sub}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* телефон мамы */}
        {t > Se.from - 0.2 && t < Ro.from + 1.1 ? (
          <div
            style={{
              position: "absolute",
              left: phonePos[0],
              top: phonePos[1],
              width: PHONE.w,
              height: PHONE.h,
              transform: `rotate(${phoneRot}deg)`,
              transformOrigin: "50% 50%",
            }}
          >
            <Phone
              typed={interpolate(t, [Se.from + 1.4, Se.from + 2.9], [0, 1], clamp)}
              results={ease(t, Se.from + 3.0, Se.from + 3.4)}
              press={interpolate(t, [tapT - 0.1, tapT + 0.1], [0, 1], clamp) * (1 - ease(t, tapT + 0.3, tapT + 0.5))}
              page={ease(t, tapT + 0.2, tapT + 0.6)}
            />
          </div>
        ) : null}

        {/* руки поверх листа и телефона */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }}>
          <Defs />
          <g opacity={sheetFade}>
            <AdultHand at={dadAt} angle={35} pose={dadPose} sleeve="#4A6E9E" cuff="#5C82B4" pencil={RED_PENCIL} />
            <AdultHand at={momAt} angle={momAngle} pose={momPose} sleeve="#C8607F" cuff="#D97C97" pencil="#2F4F9A" skin="#EBBC98" />
            {childHand}
          </g>
        </svg>
      </div>

      {/* финальная открытка — в экранных координатах */}
      {t >= Ct.from + 0.3 ? <CtaCard t={t - (Ct.from + 0.3)} /> : null}
      {/* «BalaGo менен жолго чыгалы!» — над открыткой, с последней фразой */}
      {t >= n06.from - 0.2 ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 560,
            textAlign: "center",
            fontFamily,
            fontWeight: 1000,
            fontSize: 64,
            lineHeight: 1.15,
            color: NAVY,
            textShadow: "0 3px 0 #FFFFFF, 0 0 18px rgba(255,255,255,0.9)",
            opacity: ease(t, n06.from - 0.2, n06.from + 0.3),
            transform: `scale(${0.9 + 0.1 * ease(t, n06.from - 0.2, n06.from + 0.4)}) rotate(-1.5deg)`,
          }}
        >
          {B17_TEXT.cta.slogan}
        </div>
      ) : null}
    </div>
  );
};

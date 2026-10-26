// Сцена 2. Тапшырма (VO02).
// Часть 1 — графическая вставка на тёмной доске: карточка задания с
// объёмом (толщина, тень, лёгкий наклон): «1-КЛАСС» на «Биринчи
// класстын», зелёный рюкзак на «окуучуларына», заголовок карточки
// загорается на «ата-энесинин кесиби», строки анкеты, тетрадь на «айтып»,
// ярлык «ТАПШЫРМА» на «тапшырмасы», светящийся контур на «берилген».
// Часть 2 — дом, день: мама рядом с сыном проверяет анкету — ведёт
// пальцем по строкам; на «атасын» задерживается на строке папы (бровь,
// мягкая улыбка), на «чакырды» поворачивается к двери и зовёт жестом.
// Часть 3 — общий план: дверь открывается, папа входит справа, кладёт
// руку на спинку своего стула, садится (с подготовкой) и смотрит на сына и
// лист. Камера чуть уходит вправо к двери и возвращается за папой.
import { AbsoluteFill } from "remotion";
import { localCue, useCue, useSceneFrame, wordFrame, type LocalCue } from "../context";
import { appear, Board, C, fontFamily, GlowPath, Headline, pushIn, Vignette } from "../kit";
import { type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, glide, keys, keysV, lerp, lerpV, type Vec } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import { sceneSpan, type DdTimeline } from "../timing";
import { H, restOnTable, sitDown } from "./common";
import { Bodies, bodyTurnAt, FAM, formPt, hangW, SEAT, tableArm, TableForm, TFORM, wristFor, type ActorSpec, type FormPlace } from "./HomeKit";

const T = DD_TEXT.task;
const F = DD_TEXT.form;
const SIT_DUR = 24;

// ---------- Моменты (кадры сцены) по словам VO02 ----------
const beatsOf = (cue: LocalCue) => {
  // кадры — целые: от них считается шаг (gait) и звук
  const w = (p: string) => Math.round(wordFrame(cue, p));
  const dadWord = w("атасын");
  const call = w("чакырды");
  const walk0 = dadWord + 12; // папа выходит из двери
  const walkA = walk0 + 34; // справа от своего стула, рука на спинку
  const step0 = walkA + 12; // шаг влево — к сиденью
  const sit0 = step0 + 10;
  return {
    first: w("биринчи"),
    pupils: w("окуучулар"),
    parents: w("ата-эне"),
    prof: w("кесиби"),
    about: w("жөнүндө"),
    tell: w("айтып"),
    task: w("тапшырма"),
    given: w("берилген"),
    cut1: w("апасы") - 3,
    dadWord,
    call,
    cut2: call + 4,
    door: dadWord + 8,
    walk0,
    walkA,
    step0,
    step1: step0 + 12,
    sit0,
    sat: sit0 + Math.round(0.92 * SIT_DUR),
    end: Math.round(cue.to),
  };
};
type Beats = ReturnType<typeof beatsOf>;

// Для звукового слоя: карточка ложится, папа садится (кадры сцены).
export const taskBeats = (tl: DdTimeline) => {
  const s = sceneSpan(tl, "task");
  const b = beatsOf(localCue(tl, s.from, "vo02"));
  return { card: 6, dadSit: b.sat };
};

export const TaskScene: React.FC = () => {
  const t = useSceneFrame();
  const b = beatsOf(useCue("vo02"));
  if (t < b.cut1) return <BoardInsert t={t} b={b} />;
  return <HomeShots t={t} b={b} />;
};

// =====================================================================
// Часть 1: карточка задания на тёмной доске
// =====================================================================
const CARD = { cx: 540, cy: 858, w: 600, h: 660 } as const;

const BoardInsert: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const zoom = pushIn(t, 0, b.cut1, 1, 1.045);
  const [h1, h2] = T.card.split(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <Board x={44} y={118} w={992} h={1272} t={t} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 860px" }}>
        <TaskCard t={t} b={b} />
        <Backpack t={t} at={b.pupils} />
        <Notebook t={t} at={b.tell} />
      </AbsoluteFill>
      <Headline t={t} at={2} hlAt={b.prof - 2} lines={[[{ text: h1 }], [{ text: h2, hl: "yellow" }]]} tone="onDark" y={168} size={94} />
    </AbsoluteFill>
  );
};

// Карточка задания: объём — слои толщины уходят вправо-вниз (свет слева
// сверху), мягкая тень; содержимое проявляется по словам.
const TaskCard: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const u = appear(t, -2, 16);
  const settle = easeInOut((t - 2) / 26);
  const rx = lerp(14, 8, settle);
  const ry = lerp(-20, -12, settle);
  const dy = (1 - u) * 70;
  const chip = appear(t, b.first + 2, 9);
  const chipPop = 1 + 0.12 * Math.sin(Math.PI * clamp((t - b.first - 2) / 12));
  const lit1 = easeInOut((t - b.parents + 2) / 14);
  const lit2 = easeInOut((t - b.prof + 1) / 10);
  const row1 = appear(t, b.about - 2, 10);
  const row2 = appear(t, b.about + 7, 10);
  const tab = appear(t, b.task, 10);
  const outline = (t - b.given) / 20;
  const glowFade = 1 - 0.55 * easeInOut((t - b.given - 26) / 20);
  const dim = "#CBD0DA";
  const ink = (k: number) => mixHex(dim, C.ink, k);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.cx - CARD.w / 2,
        top: CARD.cy - CARD.h / 2,
        width: CARD.w,
        height: CARD.h,
        opacity: clamp(u * 3),
        transformStyle: "preserve-3d",
        transform: `translateY(${dy}px) perspective(1700px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(-2deg)`,
      }}
    >
      {/* тень на доске */}
      <div style={{ position: "absolute", left: 34, top: 58, width: CARD.w, height: CARD.h, borderRadius: 30, background: "rgba(2,6,16,0.55)", filter: "blur(26px)", transform: "translateZ(-40px)" }} />
      {/* толщина карточки */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            backgroundColor: mixHex("#8E8472", "#D9D0BE", i / 9),
            transform: `translate3d(${(10 - i) * 1.3}px, ${(10 - i) * 1.7}px, ${-(10 - i) * 1.5}px)`,
          }}
        />
      ))}
      {/* лицевая сторона */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", background: "linear-gradient(155deg, #FFFFFF 0%, #FBF8F1 55%, #F1EBDF 100%)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: 104, background: "linear-gradient(180deg, #E6F1F6, #DCEBF2)" }} />
        {/* заголовок карточки: загорается по словам */}
        <div style={{ position: "absolute", left: 44, top: 132, fontFamily, fontWeight: 900, fontSize: 56, lineHeight: 1.08, letterSpacing: -0.5 }}>
          <div style={{ color: ink(lit1), textShadow: lit1 > 0.5 ? `0 0 ${18 * (1 - lit1) + 2}px rgba(255,211,78,${0.6 * (1 - lit2 * 0.5)})` : "none" }}>{T.card.split(" ")[0]}</div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
            <div style={{ position: "absolute", left: -10, right: -10, top: 4, bottom: 0, borderRadius: 12, background: C.yellow, transformOrigin: "left center", transform: `scaleX(${lit2})`, boxShadow: `0 0 26px rgba(255,211,78,${0.55 * lit2})` }} />
            <span style={{ position: "relative", color: ink(Math.max(lit1 * 0.4, lit2)) }}>{T.card.split(" ")[1]}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 44, top: 302, width: CARD.w - 88, height: 5, borderRadius: 3, backgroundColor: "#E3DCCD" }} />
        {/* строки анкеты: мама и папа */}
        <FormRow y={346} k={row1} label={F.momLabel} color={C.coral} hair="#2A201D" />
        <FormRow y={486} k={row2} label={F.dadLabel} color="#3F6FA6" hair="#1F1A19" />
      </div>
      {/* «1-КЛАСС» */}
      <div
        style={{
          position: "absolute",
          right: 26,
          top: 30,
          padding: "8px 24px",
          borderRadius: 40,
          backgroundColor: C.tealDeep,
          color: C.white,
          fontFamily,
          fontWeight: 900,
          fontSize: 38,
          opacity: chip,
          transform: `translateZ(6px) scale(${(0.7 + 0.3 * chip) * chipPop})`,
          boxShadow: "0 6px 14px rgba(10,40,60,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        {T.klass}
      </div>
      {/* ярлык «ТАПШЫРМА» над карточкой */}
      <div
        style={{
          position: "absolute",
          left: 26,
          top: -46,
          padding: "8px 26px",
          borderRadius: 40,
          background: "rgba(16,24,39,0.96)",
          border: `4px solid ${C.cyan}`,
          boxShadow: `0 0 26px ${C.cyan}88, 0 10px 22px rgba(5,10,25,0.4)`,
          color: C.light,
          fontFamily,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: 1,
          opacity: tab,
          transform: `translateZ(12px) translateY(${(1 - tab) * 26}px) scale(${0.86 + 0.14 * tab})`,
          whiteSpace: "nowrap",
        }}
      >
        {T.label}
      </div>
      {/* светящийся контур — «тапшырма берилген» */}
      <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: "translateZ(2px)", opacity: glowFade }}>
        <GlowPath d={roundRectPath(-6, -6, CARD.w + 12, CARD.h + 12, 34)} len={2 * (CARD.w + CARD.h) + 30} progress={outline} />
      </svg>
    </div>
  );
};

const FormRow: React.FC<{ y: number; k: number; label: string; color: string; hair: string }> = ({ y, k, label, color, hair }) => (
  <div style={{ position: "absolute", left: 44, top: y, width: CARD.w - 88, height: 120, opacity: k, transform: `translateX(${(1 - k) * -24}px)` }}>
    <svg width={74} height={74} viewBox="-37 -37 74 74" style={{ position: "absolute", left: 0, top: 0 }}>
      <circle r={36} fill="#EEF3F6" />
      <path d="M -24 30 Q -24 6 0 6 Q 24 6 24 30 Z" fill={color} />
      <circle cy={-10} r={14} fill="#E3B08C" />
      <path d="M -15 -12 Q -14 -28 0 -27 Q 14 -28 15 -12 Q 8 -20 0 -19 Q -8 -20 -15 -12 Z" fill={hair} />
    </svg>
    <div style={{ position: "absolute", left: 92, top: 10, fontFamily, fontWeight: 800, fontSize: 40, color: C.inkSoft, whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ position: "absolute", left: 92, top: 96, width: CARD.w - 88 - 92, height: 0, borderTop: "4px dashed #B9C9D6" }} />
  </div>
);

const roundRectPath = (x: number, y: number, w: number, h: number, r: number) =>
  `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const k = clamp(t);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * k);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

// Зелёный школьный рюкзак (объём: боковая стенка, клапан, карман).
const Backpack: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const u = easeOut((t - at) / 14);
  if (u <= 0) return null;
  const land = Math.sin(Math.PI * clamp((t - at - 8) / 12)) * 10;
  const G = "#3E9C6B";
  return (
    <svg
      width={280}
      height={360}
      viewBox="0 0 280 360"
      style={{ position: "absolute", left: 70 - (1 - u) * 140, top: 968 - land, opacity: clamp(u * 1.6), transform: `rotate(${-6 + (1 - u) * -10}deg)`, transformOrigin: "140px 340px", overflow: "visible" }}
    >
      <ellipse cx={150} cy={342} rx={118} ry={16} fill="rgba(2,6,16,0.45)" />
      {/* боковая стенка (глубина) */}
      <path d="M 208 70 Q 246 74 248 120 L 250 300 Q 248 334 214 336 L 196 336 L 196 70 Z" fill="#2C7A52" />
      {/* корпус */}
      <rect x={24} y={58} width={196} height={280} rx={64} fill={G} />
      <path d="M 40 110 Q 44 70 96 62 L 120 62 Q 60 76 54 130 Z" fill="#FFFFFF" opacity={0.16} />
      {/* ручка */}
      <path d="M 92 64 Q 92 22 122 22 Q 152 22 152 64" fill="none" stroke="#235E40" strokeWidth={13} strokeLinecap="round" />
      {/* клапан */}
      <path d="M 30 112 Q 30 60 122 60 Q 214 60 214 112 L 214 150 Q 122 176 30 150 Z" fill="#368C60" />
      <rect x={106} y={146} width={32} height={22} rx={6} fill="#235E40" />
      {/* карман */}
      <rect x={58} y={206} width={130} height={104} rx={30} fill="#358A5E" />
      <path d="M 70 232 L 176 232" stroke="#E8F3EC" strokeWidth={4} strokeDasharray="8 7" strokeLinecap="round" />
      <rect x={96} y={262} width={54} height={14} rx={7} fill={C.yellow} />
      {/* лямка сбоку */}
      <path d="M 218 92 Q 236 190 226 316" fill="none" stroke="#1F3B5A" strokeWidth={14} strokeLinecap="round" />
    </svg>
  );
};

// Тетрадь (дептер) с объёмом страниц.
const Notebook: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const u = easeOut((t - at) / 14);
  if (u <= 0) return null;
  return (
    <svg
      width={260}
      height={330}
      viewBox="0 0 260 330"
      style={{ position: "absolute", left: 742 + (1 - u) * 160, top: 1004, opacity: clamp(u * 1.6), transform: `rotate(${9 + (1 - u) * 12}deg)`, transformOrigin: "130px 300px", overflow: "visible" }}
    >
      <rect x={22} y={26} width={226} height={292} rx={14} fill="rgba(2,6,16,0.45)" />
      {/* страницы (толщина справа и снизу) */}
      <rect x={14} y={14} width={222} height={292} rx={12} fill="#E9E4D8" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={10 - i * 2} y={10 - i * 2} width={222} height={292} rx={12} fill={i === 2 ? "#FFFFFF" : "#F4F1EA"} />
      ))}
      {/* обложка */}
      <rect x={4} y={4} width={222} height={292} rx={12} fill="#3E7CC0" />
      <rect x={4} y={4} width={34} height={292} rx={10} fill="#2F67A6" />
      <path d="M 40 10 L 120 10 Q 70 40 60 120 L 40 140 Z" fill="#FFFFFF" opacity={0.12} />
      <rect x={62} y={70} width={140} height={84} rx={12} fill="#FBF8F1" />
      {[94, 116, 138].map((y, i) => (
        <rect key={y} x={78} y={y - 4} width={i === 2 ? 70 : 108} height={6} rx={3} fill="#B9C9D6" />
      ))}
      <circle cx={132} cy={226} r={26} fill={C.yellow} opacity={0.9} />
      <path d="M 120 226 L 129 236 L 146 216" fill="none" stroke="#3E7CC0" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};


// =====================================================================
// Части 2–3: дом
// =====================================================================
const MOM = FAM.mom;
const SON = FAM.son;
const DADSEAT = FAM.dad;
// лист пододвинут к маме (между мамой и сыном), чуть повёрнут к ней
const FORM_AT: FormPlace = { ...TFORM, x: 690, y: 1258, rot: -4 };
const TABLE_Y_DAD = 1196;

// Путь пальца мамы по листу (единицы листа): строка мамы, затем строка папы.
const traceUV = (t: number, b: Beats): Vec =>
  keysV(
    t,
    [
      [b.cut1 - 4, { x: 80, y: 372 }],
      [b.cut1 + 26, { x: 470, y: 372 }],
      [b.cut1 + 36, { x: 120, y: 462 }],
      [b.cut1 + 54, { x: 420, y: 462 }],
      [b.dadWord - 10, { x: 110, y: 528 }],
      [b.dadWord - 2, { x: 190, y: 528 }],
    ],
    easeInOut,
  );

const momFace = (b: Beats) => (t: number) =>
  keys(t, [[b.cut1, 0.42], [b.dadWord + 3, 0.42], [b.dadWord + 11, 0.82], [b.walk0 + 16, 0.82], [b.walkA, 0.6], [b.sat, 0.4]]);

const momPose = (b: Beats) => {
  const face = momFace(b);
  const place = () => MOM;
  const beck0 = b.dadWord + 6;
  return (t: number): PoseIn => {
    const lean = keys(t, [[b.cut1, 8], [b.dadWord, 10], [b.dadWord + 10, 3], [b.walkA, 2]]);
    const bodyTurn = bodyTurnAt(place, face, t, 0.5);
    const o = { sit: 1, seat: SEAT.mom, lean, bodyTurn };
    const uv = traceUV(t, b);
    // кончик пальца касается листа; на строке папы — останавливается
    const pointW = wristFor("mom", MOM, 1, formPt(uv.x, uv.y, FORM_AT), o, "down");
    // жест «иди сюда»: ладонь поднята в сторону двери, пальцы мягко зовут
    const beckonW = { x: MOM.x + 136, y: 1040 };
    // после жеста — ладонь на краю листа
    const restW = wristFor("mom", MOM, 1, formPt(30, 930, FORM_AT), o, "down", 0.6, 0);
    const toBeckon = easeInOut((t - beck0) / 10);
    const toRest = easeInOut((t - (b.call + 22)) / 14);
    const target = lerpV(lerpV(pointW, beckonW, toBeckon), restW, toRest);
    const waving = clamp((t - beck0 - 8) / 4) * (1 - clamp((t - b.call - 18) / 5));
    const wave = -30 * Math.max(0, Math.sin(((t - beck0 - 8) / 12) * Math.PI * 2)) * waving;
    const brow = easeOut((t - b.dadWord) / 7) * (1 - easeInOut((t - b.call - 16) / 16));
    const smile = easeInOut((t - b.dadWord - 2) / 12);
    return {
      expr: mixExpr(mixExpr(EXPR.calm, EXPR.softSmile, smile), { browIn: 6, browOut: 8, lid: 0, smile: 0.55 }, brow * 0.85),
      sit: 1,
      seat: SEAT.mom,
      lean,
      turnBody: 0.5,
      nod: keys(t, [[b.cut1, 7], [b.dadWord, 6], [b.dadWord + 10, 0]]),
      lookY: keys(t, [[b.cut1, 0.55], [b.dadWord + 2, 0.5], [b.dadWord + 10, -0.05], [b.walkA, 0.05], [b.sat, 0.2]]),
      headTilt: keys(t, [[b.dadWord, 0], [b.dadWord + 8, 4], [b.call + 8, 2]]),
      armR: { target, shape: toBeckon > 0.5 && toRest < 0.5 ? "open" : toRest >= 0.5 ? "relax" : "point", elbow: "down", wrist: wave },
      armL: tableArm(MOM, -1, 0.06),
    };
  };
};

const sonFace = (b: Beats) => (t: number) =>
  keys(t, [[b.cut1, -0.32], [b.dadWord + 2, -0.32], [b.dadWord + 8, -0.5], [b.call + 2, 0.35], [b.walk0 + 14, 0.62], [b.walkA, 0.55], [b.sat, 0.45]]);

const sonPose = (b: Beats) => (t: number): PoseIn => ({
  expr: t < b.walk0 ? "calm" : mixExpr(EXPR.calm, EXPR.softSmile, easeInOut((t - b.walk0 - 6) / 16)),
  sit: 1,
  seat: SEAT.son,
  lean: keys(t, [[b.cut1, 5], [b.dadWord, 5], [b.call + 6, 1]]),
  lookY: keys(t, [[b.cut1, 0.6], [b.dadWord + 2, 0.55], [b.dadWord + 10, 0.05], [b.walk0 + 8, -0.2], [b.sat, 0.05]]),
  nod: keys(t, [[b.cut1, 5], [b.dadWord + 2, 5], [b.dadWord + 10, 0]]),
  // руки на столе по сторонам листа
  armL: restOnTable(SON, -1, 0.08),
  armR: restOnTable(SON, 1, 0.08),
});

// Папа: из двери справа — к своему стулу (встаёт справа от спинки), шаг
// влево к сиденью, садится.
const STAND_A = { x: 1112, y: DADSEAT.y };
const dadPlace = (b: Beats) => (t: number): Place => {
  if (t >= b.walkA) {
    const x = lerp(STAND_A.x, DADSEAT.x, cruise((t - b.step0) / (b.step1 - b.step0), 0.4));
    return { x, y: DADSEAT.y, h: H.dad };
  }
  const p = glide(t, b.walk0, b.walkA, [{ x: 1720, y: 1506 }, { x: 1460, y: 1528 }, STAND_A], (x) => cruise(x, 0.24));
  return { x: p.x, y: p.y, h: H.dad * (1 + (p.y - DADSEAT.y) * 0.0005) };
};
const dadFace = (b: Beats) => (t: number) => keys(t, [[b.walkA, -0.45], [b.step1, -0.45], [b.sit0 + 8, -0.3], [b.sat + 2, -0.42]]);

// Спинка стула папы: он чуть выдвигает её, садится и придвигается.
const chairX = (t: number, b: Beats) => DADSEAT.x + keys(t, [[b.walkA + 8, 0], [b.walkA + 16, 16], [b.sit0 + 8, 16], [b.sat + 4, 0]]);

// Пока папа идёт, он целиком за столом; когда обе кисти над краем стола —
// корпус до столешницы, руки поверх.
const dadSplit = (b: Beats) => b.step0 + 11;

const dadPose = (b: Beats) => {
  const place = dadPlace(b);
  const face = dadFace(b);
  return (t: number): PoseIn => {
    const sd = sitDown(t, b.sit0, SIT_DUR);
    const sitting = t >= b.sit0;
    const lean = sitting ? sd.lean : 0;
    const P = place(t);
    const o = { sit: sitting ? sd.sit : 0, seat: SEAT.dad, lean, bodyTurn: bodyTurnAt(place, face, t) };
    const base: PoseIn = {
      expr: t < b.sat ? mixExpr(EXPR.calm, EXPR.softSmile, 0.5) : mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((t - b.sat) / 16) * 0.5),
      sit: o.sit,
      seat: SEAT.dad,
      lean,
      lookY: keys(t, [[b.walk0, 0], [b.walkA, 0.25], [b.step1, 0.2], [b.sat - 4, 0.3], [b.sat + 6, 0.55]]),
      nod: keys(t, [[b.sat - 2, 0], [b.sat + 8, 5]]),
    };
    if (t < b.walkA + 2) return base;
    // левая — на верх спинки стула, выдвигает его; на шаге отпускает
    const grab = easeInOut((t - (b.walkA + 2)) / 9);
    const chairTop = { x: chairX(t, b) + 40, y: 992 };
    const aboveL = { x: DADSEAT.x - 42, y: 1106 };
    const tableL = { x: DADSEAT.x - 54, y: TABLE_Y_DAD };
    const letGo = easeInOut((t - (b.step0 + 1)) / 9);
    const downL = easeInOut((t - (b.sit0 + 6)) / (b.sat - b.sit0 - 2));
    const lT = lerpV(lerpV(lerpV(hangW("dad", P, -1, o), chairTop, grab), aboveL, letGo), tableL, downL);
    // правая — вперёд над краем стола и на стол
    const upR = easeInOut((t - b.step0) / 10);
    const aboveR = { x: DADSEAT.x + 46, y: 1110 };
    const tableR = { x: DADSEAT.x + 56, y: TABLE_Y_DAD };
    const downR = easeInOut((t - (b.sit0 + 8)) / (b.sat - b.sit0 - 2));
    const rT = lerpV(lerpV(hangW("dad", P, 1, o), aboveR, upR), tableR, downR);
    return {
      ...base,
      armL: { target: lT, shape: grab > 0.5 && letGo < 0.5 ? "fist" : "relax", elbow: "down" },
      armR: { target: rT, shape: "relax", elbow: "down" },
    };
  };
};

const HomeShots: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const mom: ActorSpec = { id: "t2-mom", look: "mom", f: t, place: () => MOM, face: momFace(b), pose: momPose(b), seed: 21 };
  const son: ActorSpec = { id: "t2-son", look: "son", f: t, place: () => SON, face: sonFace(b), pose: sonPose(b), seed: 22 };
  const dadVisible = t >= b.walk0 - 2;
  const dad: ActorSpec = { id: "t2-dad", look: "dad", f: t, place: dadPlace(b), face: dadFace(b), pose: dadPose(b), seed: 23, walkFrom: b.walk0 - 4 };
  const split = t >= dadSplit(b);
  const doorOpen = easeInOut((t - b.door) / 12) * (1 - easeInOut((t - b.walkA) / 20) * 0.75);
  const world = (
    <>
      <HomeRoom t={t} doorOpen={doorOpen} />
      <ChairBacks xs={[HOME.seat.mom, HOME.seat.son]} />
      <ChairBacks xs={[chairX(t, b)]} />
      <Bodies cast={[mom, son]} layer="body" />
      {dadVisible ? <Bodies cast={[dad]} layer={split ? "body" : "all"} /> : null}
      <HomeTable />
      <TableForm s={{ dad: 1 }} f={FORM_AT} />
      <Bodies cast={[mom, son]} layer="arms" />
      {dadVisible && split ? <Bodies cast={[dad]} layer="arms" /> : null}
    </>
  );
  // План 2: мама и сын крупнее, анкета; лёгкий наезд.
  const camA = { x: lerp(582, 594, easeInOut((t - b.cut1) / (b.cut2 - b.cut1))), y: 1116, zoom: pushIn(t, b.cut1, b.cut2, 1.98, 2.06) };
  // План 3: общий; камера за взглядом мамы — к двери, затем за папой.
  const camB = {
    x: keys(t, [[b.cut2, 880], [b.walk0 + 14, 1010], [b.walk0 + 20, 1010], [b.sit0, 930]]),
    y: 1092,
    zoom: lerp(0.86, 0.88, easeInOut((t - b.cut2) / 80)),
  };
  return (
    <AbsoluteFill>
      <Shot f={t} from={b.cut1} to={b.cut2} cam={camA} bg={C.wall}>
        {world}
      </Shot>
      <Shot f={t} from={b.cut2} to={99999} cam={camB} bg={C.wall}>
        {world}
      </Shot>
      <Vignette strength={0.2} />
    </AbsoluteFill>
  );
};

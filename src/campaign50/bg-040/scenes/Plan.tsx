// Сцена 5: разделённый лист — «Азыр» и «Шарттуу мисал».
//
// Сверху — сегодняшний день: строка работы с разрывом «мектеп» и
// бледным перезапуском. Сгиб листа. Снизу, под постоянной меткой
// «Шарттуу мисал», по словам диктора появляются честные шаги: подходящая
// группа (3–4 ребёнка, поиск до 2 недель), бесплатная первая полная
// проба после формирования группы (ҮЙ → МЕКТЕП → ҮЙ, белая машина), и
// решение родителя продолжать — мама сама ставит галочку. Ниже — ровная
// строка дня без разрыва, мама дописывает «Алдын ала пландоо». На словах
// «убада эмес» — честная сноска: точные минуты не обещаются.
// Диктор: «Эгер ылайыктуу топ түзүлсө, толук сыноо сапарынан кийин
// ата-эне улантууну тандай алат. Бул убакытты так мүнөт менен үнөмдөөгө
// убада эмес, күндү ыңгайлуураак пландоонун жолу.»
import { useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { box, Panel, useTimeline, type Cam } from "../context";
import { lineFramesIn, wordAt, type Bg40Timeline } from "../timing";
import { BG40_TEXT } from "../script";
import { ExampleTag } from "../kit/Labels";
import { Check, DeskTop, HandLine, penTipAt, Sheet, Stroke, TextBars } from "../kit/Paper";
import { PenHand } from "../kit/PenHand";
import { C } from "../kit/theme";

const SH = { x: 60, y: 300, w: 960, h: 1110, rot: -1 } as const;
const FOLD = 300; // сгиб (координаты листа)
const CHECK = { x: 266, y: 782 } as const; // центр галочки шага 3 (координаты листа)
const WRITE = { x: 470, y: 962, size: 60 } as const; // «Алдын ала пландоо»

const toWorld = (lx: number, ly: number) => {
  const r = (SH.rot * Math.PI) / 180;
  const dx = lx - SH.w / 2;
  const dy = ly - SH.h / 2;
  return { x: SH.x + SH.w / 2 + dx * Math.cos(r) - dy * Math.sin(r), y: SH.y + SH.h / 2 + dx * Math.sin(r) + dy * Math.cos(r) };
};

export const planBeats = (tl: Bg40Timeline) => {
  const n4 = lineFramesIn(tl, "n4");
  const s1 = wordAt(tl, "n4", "ылайыктуу");
  const s2 = wordAt(tl, "n4", "толук");
  const s3 = wordAt(tl, "n4", "ата");
  const honest = wordAt(tl, "n4", "убада");
  const write = wordAt(tl, "n4", "ыңгайлуураак") - 6;
  return { n4, s1, s2, s3, check: s3 + 14, honest, write, writeTo: Math.max(write + 30, n4.to - 4) };
};

// Белая легковая машина (сбоку), едет вправо (dir 1) или влево (-1).
const WhiteCar: React.FC<{ readonly x: number; readonly y: number; readonly dir: 1 | -1; readonly wheel: number }> = ({ x, y, dir, wheel }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
      <ellipse cx={0} cy={6} rx={82} ry={8} fill="rgba(20,30,60,0.15)" />
      <path d="M -78 -8 L -76 -34 Q -70 -46 -52 -48 L -34 -48 L -16 -74 Q -10 -80 2 -80 L 34 -80 Q 46 -80 54 -70 L 70 -48 Q 82 -46 84 -34 L 84 -8 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -10 -70 L 2 -74 L 30 -74 Q 40 -74 46 -66 L 58 -50 L -22 -50 Z" fill="#CFE6F7" stroke={C.navy} strokeWidth={3} />
      <line x1={18} y1={-74} x2={16} y2={-50} stroke={C.navy} strokeWidth={3} />
      <rect x={-76} y={-30} width={160} height={8} rx={4} fill={C.yellow} />
      {[-46, 52].map((cx) => (
        <g key={cx} transform={`rotate(${wheel} ${cx} -6)`}>
          <circle cx={cx} cy={-6} r={17} fill={C.navy} />
          <circle cx={cx} cy={-6} r={7} fill="#C9D3E0" />
          <line x1={cx} y1={-20} x2={cx} y2={8} stroke="#C9D3E0" strokeWidth={3} />
        </g>
      ))}
      <circle cx={80} cy={-22} r={4} fill={C.yellow} />
    </g>
  </svg>
);

// Шаг условного примера: номер, иконка, заголовок, пояснение.
const Step: React.FC<{ readonly y: number; readonly n: number; readonly title: string; readonly sub: string; readonly a: number; readonly icon: React.ReactNode }> = ({ y, n, title, sub, a, icon }) => (
  <div style={box({ left: 40, top: y, width: 880, height: 150, opacity: clamp(a * 2), translate: `${(1 - easeOut(a)) * 40}px 0` })}>
    <div style={box({ left: 0, top: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" })}>{n}</div>
    <div style={box({ left: 90, top: 8, width: 270, height: 130 })}>{icon}</div>
    <div style={box({ left: 380, top: 6, width: 510, height: 150, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, fontFamily })}>
      <div style={{ fontWeight: 900, fontSize: 38, lineHeight: 1.08, color: C.navy }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 29, lineHeight: 1.15, color: C.inkSoft }}>{sub}</div>
    </div>
  </div>
);

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG40_TEXT.plan;
  const b = planBeats(useTimeline());
  const a1 = clamp((f - b.s1 + 2) / 12);
  const a2 = clamp((f - b.s2 + 2) / 12);
  const a3 = clamp((f - b.s3 + 2) / 12);
  const honest = clamp((f - b.honest) / 12);
  const checkP = clamp((f - b.check) / 10);
  const lineP = easeInOut(clamp((f - b.write + 12) / 20));
  const writeP = clamp((f - b.write) / (b.writeTo - b.write));
  // группа: места заполняются по одному
  const seats = [0, 1, 2, 3].map((i) => clamp((f - b.s1 - 4 - i * 6) / 6));
  // маршрут: утром дом → школа, после уроков школа → дом
  const routeU = clamp((f - b.s2 - 4) / 70);
  const carX = routeU < 0.5 ? lerp(70, 200, easeInOut(routeU * 2)) : lerp(200, 70, easeInOut(routeU * 2 - 1));
  const carDir: 1 | -1 = routeU < 0.5 ? 1 : -1;

  // перо: галочка шага 3, затем фраза
  // перо: в покое за краем листа справа внизу; подходит к галочке шага 3,
  // ставит её и уходит; затем подходит к строке и пишет фразу (рука не
  // закрывает шаги и сноску дольше, чем нужно для действия)
  const REST = { x: 1050, y: 1640 };
  const toward = (a: { x: number; y: number }, c: { x: number; y: number }, u: number) => {
    const e = easeInOut(u);
    return { x: lerp(a.x, c.x, e), y: lerp(a.y, c.y, e) - Math.sin(e * Math.PI) * 36 };
  };
  const c0 = toWorld(CHECK.x - 24, CHECK.y + 4);
  const w0 = toWorld(WRITE.x, WRITE.y + WRITE.size * 0.86);
  let tip = REST;
  let writing = false;
  if (f >= b.check - 14 && f < b.check) tip = toward(REST, c0, (f - b.check + 14) / 14);
  else if (f >= b.check && f < b.check + 10) {
    const u = clamp((f - b.check) / 10);
    tip = { x: c0.x + 40 * u, y: c0.y + (u < 0.4 ? u * 30 : 12 - (u - 0.4) * 60) };
    writing = true;
  } else if (f >= b.check + 10 && f < b.check + 30) tip = toward({ x: c0.x + 40, y: c0.y - 24 }, REST, (f - b.check - 10) / 20);
  else if (f >= b.write - 22 && f < b.write) tip = toward(REST, w0, (f - b.write + 22) / 22);
  else if (f >= b.write) {
    const p = penTipAt(WRITE.x, WRITE.y, t.write, writeP, WRITE.size, -1.5);
    tip = toWorld(p.x, p.y);
    writing = writeP < 1;
    if (writeP >= 1) tip = toward(tip, REST, (f - b.writeTo) / 20);
  }

  const cam: Cam = { x: 540, y: keys(f, [[0, 900], [b.s1, 900], [b.s3 + 30, 930]]), zoom: keys(f, [[0, 1.0], [b.n4.to, 1.03]]) };
  return (
    <Panel cam={cam} bg={C.wood}>
      <DeskTop />
      <Sheet x={SH.x} y={SH.y} w={SH.w} h={SH.h} rot={SH.rot} lines="none">
        {/* «Азыр»: день с разрывом */}
        <HandLine x={40} y={18} text={t.now} p={1} size={66} seed={31} color={C.navy} />
        <div style={box({ left: 40, top: 112, width: 880, height: 130, borderRadius: 18, backgroundColor: "#F6F2EA" })}>
          <TextBars x={24} y={24} w={360} rows={3} gap={32} seed={51} />
          <TextBars x={520} y={24} w={340} rows={3} gap={32} seed={52} fadeFrom={0} fadeTo={1} />
          <svg width={880} height={130} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <path d="M 420 6 l -14 20 l 20 18 l -20 18 l 20 18 l -20 18 l 20 18 l -10 12" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={box({ left: 430, top: -24, padding: "4px 14px", borderRadius: 12, backgroundColor: C.coral, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 26, whiteSpace: "nowrap" })}>12:30 · {BG40_TEXT.refocus.gap}</div>
        </div>
        {/* сгиб */}
        <div style={box({ left: 0, right: 0, top: FOLD - 8, height: 16, background: "linear-gradient(180deg, rgba(120,100,70,0) 0%, rgba(120,100,70,0.16) 50%, rgba(255,255,255,0.6) 52%, rgba(120,100,70,0) 100%)" })} />
        <div style={box({ left: 0, right: 0, top: FOLD, height: 2, backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.3) 0 14px, transparent 14px 26px)" })} />
        {/* «Шарттуу мисал» — видна всё время, пока виден пример */}
        <ExampleTag x={40} y={FOLD + 28} text={t.example} size={38} />
        <Step
          y={FOLD + 110}
          n={1}
          title={t.steps[0][0]}
          sub={t.steps[0][1]}
          a={a1}
          icon={
            <svg width={270} height={130}>
              <rect x={6} y={30} width={250} height={86} rx={22} fill="#EEF3FA" stroke={C.navy} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => (
                <g key={i} opacity={0.25 + 0.75 * seats[i]}>
                  <circle cx={46 + i * 58} cy={64} r={14} fill={i === 3 ? "#9AA6BC" : C.navy} />
                  <path d={`M ${28 + i * 58} 104 q 18 -30 36 0 Z`} fill={i === 3 ? "#9AA6BC" : C.navy} />
                  {/* ремень безопасности: каждый на своём месте, пристёгнут */}
                  <line x1={33 + i * 58} y1={84} x2={60 + i * 58} y2={104} stroke={C.yellow} strokeWidth={5} strokeLinecap="round" />
                </g>
              ))}
            </svg>
          }
        />
        <Step
          y={FOLD + 258}
          n={2}
          title={t.steps[1][0]}
          sub={t.steps[1][1]}
          a={a2}
          icon={
            <div style={box({ inset: 0 })}>
              <svg width={270} height={130} style={box({ left: 0, top: 0, overflow: "visible" })}>
                <line x1={40} y1={104} x2={226} y2={104} stroke={C.navy} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />
                <circle cx={40} cy={104} r={12} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
                <circle cx={226} cy={104} r={12} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
              </svg>
              <div style={box({ left: 40, top: 120, translate: "-50% 0", fontFamily, fontWeight: 900, fontSize: 22, color: C.navy })}>{t.route[0]}</div>
              <div style={box({ left: 226, top: 120, translate: "-50% 0", fontFamily, fontWeight: 900, fontSize: 22, color: C.navy })}>{t.route[1]}</div>
              <div style={box({ left: 0, top: 0 })}>
                <div style={box({ left: 0, top: 0, scale: "0.78", transformOrigin: `${carX}px 96px` })}>
                  <WhiteCar x={carX} y={96} dir={carDir} wheel={f * 14} />
                </div>
              </div>
            </div>
          }
        />
        <Step
          y={FOLD + 410}
          n={3}
          title={t.steps[2][0]}
          sub={t.steps[2][1]}
          a={a3}
          icon={<div />}
        />
        {a3 > 0 ? (
          <div style={box({ left: 0, top: 0, opacity: clamp(a3 * 2) })}>
            <Check x={CHECK.x} y={CHECK.y} r={40} p={checkP} />
          </div>
        ) : null}
        {/* ровный день без разрыва + фраза мамы */}
        <div style={box({ left: 40, top: 962, width: 400, height: 70, opacity: clamp(lineP * 2) })}>
          <svg width={400} height={70} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <Stroke d="M 6 40 L 390 40" p={lineP} color={C.navy} width={10} />
            <Stroke d="M 6 40 L 390 40" p={lineP} color={C.yellow} width={4} />
          </svg>
        </div>
        <HandLine x={WRITE.x} y={WRITE.y} text={t.write} p={writeP} size={WRITE.size} seed={33} color={C.ink} rot={-1.5} />
        {writeP >= 1 ? (
          <svg width={SH.w} height={SH.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <Stroke d={`M ${WRITE.x} ${WRITE.y + 78} q 200 -10 ${penTipAt(0, 0, t.write, 1, WRITE.size).x} -6`} p={clamp((f - b.writeTo) / 10)} color={C.yellow} width={8} />
          </svg>
        ) : null}
        {/* честная сноска */}
        <div style={box({ left: 24, right: 24, top: 846, padding: "12px 10px", borderRadius: 16, backgroundColor: "#EEF3FA", fontFamily, fontWeight: 900, fontSize: 30, lineHeight: 1.22, color: C.navy, opacity: honest, textAlign: "center", whiteSpace: "nowrap" })}>
          {t.honest[0]}
          <br />
          {t.honest[1]}
        </div>
      </Sheet>
      {/* при письме нижней строки ручка наклонена вправо — не закрывает сноску */}
      <PenHand x={tip.x} y={tip.y} tilt={f >= b.write - 22 ? 24 : -8} s={0.86} lift={writing ? 0 : 0.8} />
    </Panel>
  );
};

// Сцены середины фильма BM-019: бал, улица Меритона, рассказ Уикхема,
// доска «сообщение / подтверждено», разговоры двоих (Коллинз, Дарси, леди
// Кэтрин, прогулка), выбор Шарлотты, тишина Джейн.
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { Carriage, Label, LetterSheet, Manor, OL, Person, Tree, type FigMood, type FigPose, type Who } from "./draw";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { LensCards, LensFrame } from "./lens";
import { Particles } from "./particles";

type P = { mode?: string; host?: string; [k: string]: unknown };

// Речевой «пузырь» с хвостиком.
export const Bubble: React.FC<{ x: number; y: number; w: number; lines: string[]; k: number; tail?: "left" | "right" | "down"; fill?: string; size?: number; serif?: boolean }> = ({ x, y, w, lines, k, tail = "down", fill = C.white, size = 34, serif = false }) => {
  if (k <= 0.001) return null;
  const h = lines.length * size * 1.25 + size * 1.1;
  const tx = tail === "left" ? -w / 2 + 50 : tail === "right" ? w / 2 - 50 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={28} fill="#000" opacity={0.12} />
      <path d={`M ${tx - 24} ${h / 2 - 4} L ${tx + (tail === "left" ? -40 : tail === "right" ? 40 : 0)} ${h / 2 + 46} L ${tx + 24} ${h / 2 - 4} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={OL} strokeWidth={4} />
      <rect x={tx - 22} y={h / 2 - 8} width={44} height={12} fill={fill} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h / 2 + size * 1.25 * (i + 1) + size * 0.1} fontFamily={serif ? SERIF : FONT} fontWeight={800} fontSize={size} fill={C.ink} textAnchor="middle">
          {l}
        </text>
      ))}
    </g>
  );
};

// Зал ассамблеи: люстры, пары в танце (вариант arrive / overhear / dance).
const Hall: React.FC<{ t: number; cx: number; dim?: number }> = ({ t, cx, dim = 0 }) => (
  <g>
    <rect x={cx - 900} y={120} width={1800} height={760} rx={30} fill="#f9e9d6" stroke={OL} strokeWidth={4} opacity={0.9} />
    {[-600, -200, 200, 600].map((dx, i) => (
      <g key={i}>
        <rect x={cx + dx - 70} y={210} width={140} height={300} rx={70} fill={C.sky} stroke={OL} strokeWidth={4} opacity={0.75} />
        <line x1={cx + dx} y1={210} x2={cx + dx} y2={510} stroke={OL} strokeWidth={3} opacity={0.4} />
      </g>
    ))}
    {[-400, 0, 400].map((dx, i) => (
      <g key={i} transform={`translate(${cx + dx} 130) rotate(${Math.sin(t * 0.9 + i) * 2})`}>
        <line x1={0} y1={0} x2={0} y2={60} stroke={OL} strokeWidth={4} />
        <path d="M -70 60 Q 0 120 70 60 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
        {[-50, -17, 17, 50].map((x, j) => (
          <g key={j}>
            <circle cx={x} cy={52} r={14} fill={C.yellow} opacity={0.35} />
            <path d={`M ${x} 56 Q ${x - 5} 44 ${x} 36 Q ${x + 5} 44 ${x} 56 Z`} fill={C.yellow} stroke={C.goldDeep} strokeWidth={2} />
          </g>
        ))}
      </g>
    ))}
    <rect x={cx - 900} y={800} width={1800} height={80} fill="#d8b48a" opacity={0.6} />
    {dim > 0 && <rect x={cx - 900} y={120} width={1800} height={760} rx={30} fill="#fff" opacity={dim} />}
  </g>
);

export const Ballroom: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "overhear") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Hall t={t} cx={cx} dim={0.35} />
        <Person who="bingley" x={cx - 120} y={880} s={0.78} t={t} mood="smile" pose="point" flip />
        <Person who="darcy" x={cx - 340} y={880} s={0.82} t={t} mood="proud" pose="cross" />
        <Person who="liz" x={cx + 360} y={880} s={0.78} t={t} mood={t > b(1) ? "tense" : "neutral"} look={-1} flip />
        <Bubble x={cx - 260} y={250} w={720} k={ramp(t, b(0) + 1.6, 0.5)} lines={["«она мила, но недостаточно", "красива, чтобы привлечь", "мое внимание»"]} size={34} serif />
        {/* «слышимость»: волны к Элизабет */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${cx + 160 + i * 40} 520 Q ${cx + 190 + i * 40} 560 ${cx + 160 + i * 40} 600`} stroke={C.rose} strokeWidth={6} fill="none" strokeLinecap="round" opacity={ramp(t, b(0) + 2 + i * 0.2, 0.3) * (0.6 + 0.4 * Math.sin(t * 5 + i))} />
        ))}
        <Appear t={t} at={b(2)} x={cx + 360} y={260}>
          <Person who="charlotte" x={-120} y={360} s={0.5} t={t} mood="smile" />
          <Person who="jane" x={120} y={360} s={0.5} t={t} mood="smile" />
          <Bubble x={0} y={-30} w={420} k={1} lines={["…и представьте,", "«недостаточно красива»!"]} size={30} fill={C.roseSoft} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "dance") {
    const sway = Math.sin(t * 1.4) * 30;
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Hall t={t} cx={cx} dim={0.25} />
        <Person who="darcy" x={cx - 160 + sway} y={880} s={0.84} t={t} pose="dance" mood="neutral" />
        <Person who="liz" x={cx + 160 + sway} y={880} s={0.8} t={t} pose="dance" mood={t > b(1) ? "smile" : "tense"} flip />
        <Bubble x={cx + 330} y={250} w={560} k={ramp(t, b(0) + 1.2, 0.5)} lines={["не бывает ли он", "«ослепленным предубеждениями»?"]} size={32} fill={C.roseSoft} tail="left" />
        <Appear t={t} at={b(1) + 0.4} x={cx + 250} y={420}>
          <Label x={0} y={0} text="а сама?" size={32} bg={C.yellow} rot={-6} />
        </Appear>
        <Appear t={t} at={b(2)} x={cx - 380} y={300}>
          <Panel x={-250} y={-90} w={500} h={170} fill={C.tealSoft} />
          <Txt x={0} y={-22} size={28} color={C.inkSoft}>повествователь:</Txt>
          <Txt x={0} y={24} size={30}>{"«…довольно сильное"}</Txt>
          <Txt x={0} y={62} size={30}>{"чувство к ней»"}</Txt>
        </Appear>
      </Drift>
    );
  }
  // arrive
  const verdict = ramp(t, b(2), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Hall t={t} cx={cx} />
      {[-560, -380].map((dx, i) => (
        <Person key={i} who={i ? "lady" : "guest"} x={cx + dx + Math.sin(t * 1.5 + i) * 20} y={880} s={0.6} t={t} pose="dance" seed={i} mood="smile" flip={i === 1} />
      ))}
      <Appear t={t} at={0.3} x={0} y={0}>
        <Person who="bingley" x={cx - 60} y={880} s={0.78} t={t} mood="smile" pose="walk" />
        <Person who="caroline" x={cx + 110} y={880} s={0.74} t={t} mood="proud" />
        <Person who="darcy" x={cx + 340} y={880} s={0.82} t={t} mood={t > b(2) ? "proud" : "neutral"} pose={t > b(2) ? "cross" : "stand"} />
      </Appear>
      <Appear t={t} at={b(1)} x={cx + 340} y={250}>
        <Label x={0} y={0} text="10 000 фунтов в год" size={34} bg={C.yellow} />
      </Appear>
      {/* шёпот зала: ярлыки летят к Дарси */}
      {["гордый", "неприятный"].map((w, i) => (
        <g key={w} opacity={verdict} transform={`translate(${cx - 400 + (740 - i * 40) * verdict} ${380 + i * 90})`}>
          <Label x={0} y={0} text={w} size={32} bg={C.roseSoft} rot={wob(t, i, 3)} />
        </g>
      ))}
    </Drift>
  );
};

// Улица Меритона: встреча — «один побледнел, другой покраснел».
export const Street: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* дома улицы */}
      {[-560, -280, 0, 280, 560].map((dx, i) => (
        <g key={i}>
          <rect x={cx + dx - 130} y={230 + (i % 2) * 40} width={260} height={600 - (i % 2) * 40} fill={["#e8c9a0", "#d9b48c", "#efd9b4", "#d8b8a0", "#e4cfa6"][i]} stroke={OL} strokeWidth={4} />
          <path d={`M ${cx + dx - 145} ${230 + (i % 2) * 40} L ${cx + dx} ${150 + (i % 2) * 40} L ${cx + dx + 145} ${230 + (i % 2) * 40} Z`} fill={C.brick} stroke={OL} strokeWidth={4} />
          {[0, 1].map((r) => <rect key={r} x={cx + dx - 70} y={320 + r * 170} width={140} height={100} rx={6} fill={C.sky} stroke={OL} strokeWidth={3} opacity={0.8} />)}
        </g>
      ))}
      <rect x={cx - 760} y={820} width={1520} height={70} fill="#cbb48e" />
      <Appear t={t} at={0.2} x={0} y={0}>
        <Person who="wickham" x={cx - 120} y={900} s={0.82} t={t} mood="smile" pose={t < b(1) ? "bow" : "stand"} />
        <Person who="liz" x={cx - 360} y={900} s={0.76} t={t} mood="smile" />
      </Appear>
      <Appear t={t} at={b(1)} x={0} y={0}>
        <Person who="darcy" x={cx + 300} y={900} s={0.84} t={t} mood="tense" flip />
        <Person who="bingley" x={cx + 500} y={900} s={0.76} t={t} mood="neutral" flip />
      </Appear>
      <Appear t={t} at={b(1) + 1.2} x={cx + 90} y={230}>
        <Panel x={-360} y={-80} w={720} h={140} fill={C.white} />
        <Txt x={0} y={-10} size={34}>{"«один явно побледнел,"}</Txt>
        <Txt x={0} y={36} size={34}>{"а другой покраснел»"}</Txt>
      </Appear>
      <Appear t={t} at={b(2)} x={cx + 90} y={430}>
        <Label x={-130} y={0} text="кто?" size={36} bg={C.yellow} rot={-6} />
        <Label x={130} y={0} text="почему?" size={36} bg={C.yellow} rot={6} />
      </Appear>
    </Drift>
  );
};

// Рассказ Уикхема: пузыри-утверждения собираются из точек (приятная версия).
export const Storyteller: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  const claims = [
    { text: "место отдали другому", at: b(1) },
    { text: "Дарси — из ревности", at: b(1) + 1.6 },
    { text: "мой отец — управляющий", at: b(1) + 3.2 },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* гостиная: камин, свечи */}
      <rect x={cx - 640} y={180} width={1280} height={700} rx={30} fill="#f6e2cf" stroke={OL} strokeWidth={4} />
      <rect x={cx - 140} y={560} width={280} height={240} fill="#c9a27a" stroke={OL} strokeWidth={4} />
      <rect x={cx - 90} y={640} width={180} height={160} rx={10} fill="#5a3a2a" />
      <path d={`M ${cx - 50} 790 Q ${cx} ${700 + Math.sin(t * 7) * 10} ${cx + 50} 790 Z`} fill={C.gold} />
      <Person who="wickham" x={cx - 300} y={900} s={0.8} t={t} mood="smile" pose={t > b(1) ? "point" : "sit"} />
      <Person who="liz" x={cx + 300} y={900} s={0.76} t={t} mood={t > b(1) ? "shock" : "smile"} pose="sit" flip />
      {claims.map((c, i) => (
        <Bubble key={i} x={cx - 360 + i * 360} y={260 + (i % 2) * 120} w={400} k={ramp(t, c.at, 0.5)} lines={[c.text]} size={30} fill={C.white} tail={i === 0 ? "down" : "left"} />
      ))}
      <Appear t={t} at={b(2)} x={cx} y={520}>
        <Label x={0} y={0} text="«никогда не… изобличить»" size={28} bg={C.yellow} rot={-5} />
      </Appear>
      {/* метка источника: слова персонажа */}
      <Appear t={t} at={b(3)} x={cx} y={120}>
        <Label x={0} y={0} text="ЭТО СЛОВА ПЕРСОНАЖА" size={34} bg={C.roseSoft} />
      </Appear>
    </Drift>
  );
};

// Доска: «Сообщение персонажа» | «Подтверждено» (Уикхем 1, 2; Пемберли).
export const Evidence: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const x0 = A.x0 + 30;
  const w = A.x1 - A.x0 - 60;
  const col = w / 2;
  const Board = ({ left, right }: { left: string; right: string }) => (
    <g>
      <rect x={x0 + 8} y={170} width={w} height={700} rx={30} fill="#000" opacity={0.1} />
      <rect x={x0} y={160} width={w} height={700} rx={30} fill={C.white} stroke={OL} strokeWidth={5} />
      <line x1={x0 + col} y1={190} x2={x0 + col} y2={830} stroke={OL} strokeWidth={3} strokeDasharray="12 10" opacity={0.5} />
      <Txt x={x0 + col / 2} y={225} size={34} weight={900} color={C.rose}>{left}</Txt>
      <Txt x={x0 + col * 1.5} y={225} size={34} weight={900} color={C.green}>{right}</Txt>
    </g>
  );
  if (p.mode === "pemberley") {
    const items = [
      { t: "свидетельство экономки", at: b(1) },
      { t: "своё наблюдение", at: b(1) + 1.6 },
      { t: "поступки", at: b(1) + 3.2 },
    ];
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <Board left="Слухи и рассказ" right="Три слоя проверки" />
        <Appear t={t} at={0.3} x={x0 + col / 2} y={380}>
          <Label x={0} y={0} text="«Джорджиана горда»" size={30} bg={C.roseSoft} />
          <Cross x={0} y={0} s={90} k={ramp(t, b(0) + 2.2, 0.5)} />
          <Label x={0} y={110} text="очень застенчива" size={30} bg={C.white} opacity={ramp(t, b(0) + 2.6, 0.4)} />
        </Appear>
        {items.map((it, i) => (
          <Appear key={i} t={t} at={it.at} x={x0 + col * 1.5} y={350 + i * 150}>
            <Label x={0} y={0} text={it.t} size={32} bg={C.sageSoft} />
            <Check x={-col / 2 + 60} y={0} s={30} k={ramp(t, it.at + 0.4, 0.4)} />
          </Appear>
        ))}
        <Appear t={t} at={b(2)} x={x0 + col / 2} y={700}>
          <Label x={0} y={0} text="ненависть → уважение" size={30} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  const rows =
    p.mode === "wickham2"
      ? [
          { l: "«не стану избегать Дарси»", r: "не пришёл на бал", at: b(0) + 1, rAt: b(0) + 2.5 },
          { l: "«абсолютная ложь» (мисс Бингли)", r: "свидетель не беспристрастен", at: b(1), rAt: b(2) },
          { l: "«лишь условно» (Бингли)", r: "не проверено", at: b(1) + 2, rAt: b(2) + 1 },
        ]
      : [
          { l: "обаяние рассказчика", r: "—", at: b(0) + 1.4, rAt: 999 },
          { l: "злодей — тот, кто задел", r: "—", at: b(1), rAt: 999 },
          { l: "«по глазам… правду»", r: "впечатление", at: b(2), rAt: b(3) },
        ];
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      <Board left="Сообщение персонажа" right="Что подтверждено" />
      {rows.map((r, i) => (
        <g key={i}>
          <Appear t={t} at={r.at} x={x0 + col / 2} y={350 + i * 170}>
            <Label x={0} y={0} text={r.l} size={r.l.length > 24 ? 24 : 28} bg={C.roseSoft} />
          </Appear>
          <Appear t={t} at={r.rAt} x={x0 + col * 1.5} y={350 + i * 170}>
            <Label x={0} y={0} text={r.r} size={r.r.length > 22 ? 24 : 28} bg={r.r === "не пришёл на бал" ? C.sageSoft : C.white} />
          </Appear>
        </g>
      ))}
      {p.mode !== "wickham2" && (
        <Appear t={t} at={b(3)} x={x0 + col * 1.5} y={700}>
          <Label x={0} y={0} text="доказательств: 0" size={32} bg={C.yellow} rot={-4} />
        </Appear>
      )}
      {p.mode === "wickham2" && (
        <Appear t={t} at={b(3)} x={A.cx} y={790}>
          <Particles shape="question" t={t} at={b(3)} dur={1.6} x={0} y={-40} s={0.28} r={4.2} step={12} spread={300} />
        </Appear>
      )}
    </Drift>
  );
};

// Разговор двоих: Коллинз, отказ, первое предложение, отказ, леди Кэтрин, обещание, прогулка, семья.
type Card = { text: string[]; at: number; side: "l" | "r"; fill?: string };
export const Duo: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  const m = p.mode;
  let left: { who: Who; mood: FigMood; pose?: FigPose } = { who: "collins", mood: "smile" };
  let right: { who: Who; mood: FigMood; pose?: FigPose } = { who: "liz", mood: "neutral" };
  let cards: Card[] = [];
  let bg: "parlor" | "lane" | "garden" = "parlor";
  let extra: React.ReactNode = null;
  if (m === "collins") {
    left = { who: "collins", mood: "smile", pose: t > b(1) ? "point" : "bow" };
    right = { who: "liz", mood: t > b(2) ? "shock" : "tense" };
    cards = [
      { text: ["1. пример прихожанам", "2. моё счастье", "3. совет леди Кэтрин"], at: b(1) + 0.3, side: "l", fill: C.white },
      { text: ["приданое: 1000 фунтов", "после смерти матери"], at: b(2) + 0.6, side: "l", fill: C.paperDark },
    ];
  } else if (m === "no") {
    left = { who: "collins", mood: t > b(1) ? "smile" : "shock" };
    right = { who: "liz", mood: "tense", pose: t > b(2) ? "point" : "stand" };
    cards = [
      { text: ["«…никак не могу", "принять их»"], at: b(0) + 0.8, side: "r", fill: C.roseSoft },
      { text: ["«в первый раз", "всегда отказывают»?"], at: b(1) + 0.3, side: "l", fill: C.white },
      { text: ["«как к разумному", "существу»"], at: b(2) + 0.3, side: "r", fill: C.roseSoft },
    ];
    extra = (
      <Appear t={t} at={b(2) + 1.6} x={cx} y={150}>
        <g transform={`scale(${pop(t, b(2) + 1.6)})`}>
          <rect x={-150} y={-62} width={300} height={124} rx={24} fill={C.rose} stroke={OL} strokeWidth={6} />
          <text y={30} fontFamily={HEAVY} fontWeight={900} fontSize={86} fill="#fff" textAnchor="middle">НЕТ</text>
        </g>
      </Appear>
    );
  } else if (m === "proposal1") {
    left = { who: "darcy", mood: t > b(2) ? "proud" : "tense", pose: t > b(1) ? "reach" : "walk" };
    right = { who: "liz", mood: t > b(2) ? "angry" : "shock", pose: "sit" };
    cards = [
      { text: ["«Я ничего не могу", "поделать с собой»"], at: b(1) + 0.3, side: "l", fill: C.tealSoft },
      { text: ["неравное положение", "семья · честь рода"], at: b(2) + 0.4, side: "l", fill: C.white },
    ];
    extra = (
      <Appear t={t} at={b(2) + 2.4} x={cx - 330} y={140}>
        <Label x={0} y={0} text="спокойная самоуверенность" size={28} bg={C.yellow} rot={-4} />
      </Appear>
    );
  } else if (m === "refusal") {
    left = { who: "darcy", mood: t > b(1) ? "angry" : "shock" };
    right = { who: "liz", mood: "angry", pose: t > b(2) ? "point" : "stand" };
    cards = [
      { text: ["1. Джейн", "2. Уикхем"], at: b(0) + 0.6, side: "r", fill: C.roseSoft },
      { text: ["«неблагородному", "происхождению…»"], at: b(1) + 1.5, side: "l", fill: C.tealSoft },
      { text: ["«…как джентльмен»"], at: b(2) + 0.6, side: "r", fill: C.roseSoft },
    ];
    extra = (
      <g opacity={ramp(t, b(3), 0.6)}>
        <rect x={cx - 900} y={120} width={1800} height={800} fill="#fff" opacity={0.25} />
      </g>
    );
  } else if (m === "catherine" || m === "promise") {
    left = { who: "catherine", mood: "angry", pose: t > b(1) ? "point" : "stand" };
    right = { who: "liz", mood: m === "promise" ? "proud" : "neutral" };
    bg = "garden";
    cards =
      m === "catherine"
        ? [
            { text: ["Опровергните слух!", "Ответьте прямо!"], at: b(1) - 0.4, side: "l", fill: C.plumSoft },
            { text: ["«Но вам не дано", "право знать мои»"], at: b(1) + 1.6, side: "r", fill: C.roseSoft },
          ]
        : [
            { text: ["«…я – дочь джентльмена,", "и в этом мы равны»"], at: b(0) + 2, side: "r", fill: C.roseSoft },
            { text: ["Обещайте никогда!"], at: b(1) + 1.6, side: "l", fill: C.plumSoft },
            { text: ["«Я не стану давать", "подобных обещаний»"], at: b(1) + 3.2, side: "r", fill: C.roseSoft },
          ];
    if (m === "promise")
      extra = (
        <Appear t={t} at={b(2) + 0.8} x={cx} y={430}>
          <Label x={0} y={0} text="давление" size={32} bg={C.plum} color="#fff" rot={-6} />
        </Appear>
      );
  } else if (m === "walk") {
    left = { who: "darcy", mood: t > b(2) ? "kind" : "tense", pose: "walk" };
    right = { who: "liz", mood: t > b(2) ? "smile" : "neutral", pose: "walk" };
    bg = "lane";
    cards = [
      { text: ["«…я думал", "только о вас»"], at: b(0) + 3, side: "l", fill: C.tealSoft },
      { text: ["«одно ваше слово заставит", "меня замолчать навсегда»"], at: b(1) + 2.6, side: "l", fill: C.white },
    ];
    extra = (
      <Appear t={t} at={b(2) + 1.6} x={cx} y={150}>
        <Label x={-170} y={0} text="«нет» — можно" size={34} bg={C.white} />
        <Label x={170} y={0} text="«да» — свободно" size={34} bg={C.sageSoft} />
      </Appear>
    );
  } else if (m === "piano") {
    left = { who: "darcy", mood: t > b(1) ? "kind" : "neutral" };
    right = { who: "liz", mood: "smile", pose: "sit" };
    cards = [
      { text: ["«Он станцевал", "всего четыре танца»"], at: b(0) + 2.4, side: "r", fill: C.roseSoft },
      { text: ["«А перед незнакомыми", "мы оба не выступаем»"], at: b(1) + 2.6, side: "l", fill: C.tealSoft },
    ];
    extra = (
      <g>
        <g transform={`translate(${cx + 180} 900)`}>
          <rect x={-170} y={-210} width={340} height={210} rx={10} fill="#5a3a2a" stroke={OL} strokeWidth={4} />
          <rect x={-150} y={-120} width={300} height={36} fill="#fff" stroke={OL} strokeWidth={3} />
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-140 + i * 30} y={-120} width={14} height={22} fill={OL} />)}
        </g>
        <Appear t={t} at={b(2) + 1} x={cx} y={150}>
          <Label x={0} y={0} text="похожи больше, чем думают" size={30} bg={C.yellow} />
        </Appear>
      </g>
    );
  } else if (m === "family") {
    left = { who: "jane", mood: "shock" };
    right = { who: "mrB", mood: t > b(2) ? "kind" : "shock" };
    cards = [
      { text: ["«не выходи замуж", "без любви»"], at: b(0) + 1, side: "l", fill: C.white },
      { text: ["«Разве ты не ненавидела", "его всегда?»"], at: b(1), side: "r", fill: C.white },
      { text: ["«…кому-нибудь", "менее достойному»"], at: b(2) + 2, side: "r", fill: C.sageSoft },
    ];
    extra = <Person who="liz" x={cx} y={910} s={0.8} t={t} mood={t > b(2) ? "smile" : "tense"} pose={t > b(2) ? "stand" : "hold"} />;
  }
  const lx = cx - 340;
  const rx = cx + 340;
  const walkX = m === "walk" ? Math.sin(t * 0.25) * 30 : 0;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {bg === "parlor" && (
        <g>
          <rect x={cx - 760} y={160} width={1520} height={720} rx={30} fill="#f7ead8" stroke={OL} strokeWidth={4} />
          <rect x={cx - 120} y={220} width={240} height={300} rx={14} fill={C.sky} stroke={OL} strokeWidth={4} opacity={0.8} />
          <line x1={cx} y1={220} x2={cx} y2={520} stroke={OL} strokeWidth={3} opacity={0.5} />
          <rect x={cx - 760} y={800} width={1520} height={80} fill="#d8b48a" opacity={0.6} />
        </g>
      )}
      {bg === "garden" && (
        <g>
          <Manor x={cx} y={790} s={0.62} t={t} />
          <Tree x={cx - 620} y={820} s={0.8} t={t} />
          <Tree x={cx + 640} y={820} s={0.7} t={t} />
          <rect x={cx - 780} y={800} width={1560} height={90} fill={C.sageSoft} />
        </g>
      )}
      {bg === "lane" && (
        <g>
          {[-700, -380, 380, 700].map((dx, i) => <Tree key={i} x={cx + dx + walkX * 0.5} y={830} s={0.8 + (i % 2) * 0.15} t={t} color={i % 2 ? "#e3a93a" : C.sage} />)}
          <path d={`M ${cx - 800} 900 Q ${cx} 820 ${cx + 800} 900`} stroke="#d9c39a" strokeWidth={60} fill="none" />
        </g>
      )}
      <Person who={left.who} x={lx + walkX} y={900} s={0.86} t={t} mood={left.mood} pose={left.pose ?? "stand"} />
      <Person who={right.who} x={rx + walkX} y={900} s={0.82} t={t} mood={right.mood} pose={right.pose ?? "stand"} flip />
      {cards.map((c, i) => {
        const k = ramp(t, c.at, 0.5);
        const sameSide = cards.slice(0, i).filter((d) => d.side === c.side).length;
        const x = c.side === "l" ? lx + 40 : rx - 40;
        const y = 270 + sameSide * 190;
        return <Bubble key={i} x={x} y={y} w={Math.max(...c.text.map((s) => s.length)) * 18 + 90} k={k} lines={c.text} size={32} fill={c.fill} tail={c.side === "l" ? "left" : "right"} />;
      })}
      {extra}
    </Drift>
  );
};

// Элизабет и Шарлотта: одно предложение — разные обстоятельства (charlotte) / приговор подруге (judge).
export const SplitChoice: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  const half = (A.x1 - A.x0) / 2;
  const L0 = A.x0 + half / 2;
  const R0 = A.x0 + half * 1.5;
  const judge = p.mode === "judge";
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={A.x0 + 10} y={150} width={half - 20} height={740} rx={30} fill={C.roseSoft} opacity={0.55} stroke={OL} strokeWidth={3} />
      <rect x={A.x0 + half + 10} y={150} width={half - 20} height={740} rx={30} fill={C.sageSoft} opacity={0.65} stroke={OL} strokeWidth={3} />
      {/* одно и то же предложение в центре */}
      <Appear t={t} at={0.2} x={cx} y={210}>
        <rect x={-150} y={-46} width={300} height={92} rx={16} fill={C.white} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={34} weight={900}>{"предложение"}</Txt>
      </Appear>
      <Person who="liz" x={L0} y={890} s={0.62} t={t} mood={judge && t < b(2) ? "shock" : "neutral"} />
      <Person who="charlotte" x={judge ? R0 + 130 : R0} y={890} s={0.62} t={t} mood={judge && t > b(1) ? "smile" : "kind"} />
      <Txt x={L0} y={300} size={34} weight={900} color={C.rose}>Элизабет</Txt>
      <Txt x={R0} y={300} size={34} weight={900} color={C.green}>Шарлотта</Txt>
      {!judge && (
        <g>
          <Appear t={t} at={0.6} x={L0} y={380}>
            <Label x={0} y={0} text="«нет»" size={40} bg={C.white} />
          </Appear>
          <Appear t={t} at={0.9} x={R0} y={380}>
            <Label x={0} y={0} text="«да»" size={40} bg={C.white} />
          </Appear>
          {["27 лет", "определённость", "защита от нужды"].map((s, i) => (
            <Appear key={s} t={t} at={b(1) + i * 1.3} x={R0 + (i % 2 ? 90 : -90)} y={470 + i * 66}>
              <Label x={0} y={0} text={s} size={28} bg={C.white} />
            </Appear>
          ))}
          <Appear t={t} at={b(2) + 1.2} x={R0} y={190}>
            <Label x={0} y={0} text="«уютный дом»" size={30} bg={C.yellow} rot={5} />
          </Appear>
        </g>
      )}
      {judge && (
        <g>
          <Appear t={t} at={b(0) + 0.6} x={L0} y={420}>
            <Label x={0} y={0} text="«ради мирской выгоды»" size={26} bg={C.white} />
          </Appear>
          {/* Хансфорд: дом Шарлотты, уют */}
          <Appear t={t} at={b(1)} x={R0 - 90} y={560}>
            <rect x={-160} y={-110} width={320} height={190} fill="#efd9b4" stroke={OL} strokeWidth={4} />
            <path d="M -180 -110 L 0 -200 L 180 -110 Z" fill={C.brick} stroke={OL} strokeWidth={4} />
            <rect x={-110} y={-70} width={80} height={70} fill={C.yellow} opacity={0.7} stroke={OL} strokeWidth={3} />
            <rect x={30} y={-70} width={80} height={70} fill={C.yellow} opacity={0.7} stroke={OL} strokeWidth={3} />
          </Appear>
          <Appear t={t} at={b(2)} x={cx} y={820}>
            <Panel x={-430} y={-60} w={860} h={110} fill={C.white} />
            <Txt x={0} y={10} size={30}>{"«…с полным пониманием и открытыми глазами»"}</Txt>
          </Appear>
          <Appear t={t} at={b(3)} x={cx} y={130}>
            <Label x={0} y={0} text="разные ценности · разные обстоятельства" size={26} bg={C.yellow} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// Джейн: calm (тишина) / dinner (громкий ужин) / leave (отъезд, письмо) / darcyLens (ошибка чтения).
export const JaneLens: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "dinner") {
    const loud = 1 + 0.06 * Math.sin(t * 9);
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <rect x={cx - 640} y={640} width={1280} height={40} rx={12} fill="#a8744a" stroke={OL} strokeWidth={4} />
        <rect x={cx - 640} y={600} width={1280} height={44} rx={10} fill={C.white} stroke={OL} strokeWidth={3} />
        <Person who="mrsB" x={cx - 380} y={900} s={0.8} t={t} mood="smile" pose="point" />
        <Person who="darcy" x={cx + 380} y={900} s={0.84} t={t} mood={t > b(1) ? "proud" : "neutral"} flip />
        <Person who="liz" x={cx - 100} y={900} s={0.74} t={t} mood={t > b(1) ? "shock" : "tense"} pose={t > b(1) ? "cover" : "stand"} />
        <g transform={`translate(${cx - 300} 260) scale(${loud})`}>
          <Bubble x={0} y={0} w={560} k={ramp(t, b(0) + 0.8, 0.4)} lines={["Джейн выйдет за Бингли!", "Какая удача!"]} size={36} fill={C.plumSoft} />
        </g>
        <Arrow x1={cx - 30} y1={280} x2={cx + 330} y2={400} k={ramp(t, b(1), 0.6)} color={C.teal} w={10} />
        <Appear t={t} at={b(1) + 0.6} x={cx + 380} y={250}>
          <Label x={0} y={0} text="он всё слышит" size={30} bg={C.tealSoft} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "leave") {
    const go = ramp(t, 0.3, 3);
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Manor x={cx - 380} y={760} s={0.7} t={t} />
        <rect x={cx - 760} y={760} width={1520} height={120} fill="#d9c39a" />
        <Carriage x={cx - 200 + go * 640} y={860} s={0.8} t={t} />
        <Label x={cx + 520} y={260} text="в Лондон" size={32} bg={C.white} opacity={ramp(t, 0.6, 0.4)} />
        <Appear t={t} at={b(0) + 2} x={cx + 300} y={430}>
          <LetterSheet x={0} y={0} s={0.42} k={ramp(t, b(0) + 2.2, 1.5)} title="Кэролайн → Джейн" lines={7} highlight={[3]} />
          <Label x={0} y={180} text="«…не вернется… этой зимой»" size={26} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={b(1)} x={cx - 420} y={340}>
          <Person who="jane" x={0} y={560} s={0.78} t={t} mood="sad" pose="hold" hold="letter" />
        </Appear>
        <Appear t={t} at={b(2)} x={cx - 420} y={220}>
          <Label x={0} y={0} text="тихая боль" size={32} bg={C.white} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "darcyLens") {
    const r = 300;
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Person who="jane" x={cx + 420} y={900} s={0.8} t={t} mood="kind" />
        <Particles shape="heart" t={t} at={0.4} dur={2} x={cx + 420} y={360} s={0.32} r={4.5} step={12} spread={300} />
        <LensFrame x={cx - 160} y={500} r={r} who="darcy" k={ramp(t, 0.1, 0.6)} sep={0.8} t={t} labels={0}>
          <LensCards who="darcy" r={r} t={t} size={28} decided={["Она равнодушна"]} known={["Улыбается всем ровно"]} dAt={[b(0) + 2]} kAt={[b(0) + 1]} crossAt={[b(1) + 2.5]} flagAt={[b(1)]} />
        </LensFrame>
        <Appear t={t} at={b(2)} x={cx + 300} y={150}>
          <Label x={0} y={0} text="+ скрыл её приезд в Лондон" size={28} bg={C.plumSoft} />
        </Appear>
      </Drift>
    );
  }
  // calm: Джейн спокойна снаружи, сердце из точек «внутри»
  const inner = ramp(t, b(1), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Person who="bingley" x={cx + 380} y={900} s={0.82} t={t} mood="smile" flip pose="reach" />
      <Person who="jane" x={cx - 140} y={900} s={0.82} t={t} mood="kind" />
      <Appear t={t} at={0.6} x={cx - 140} y={180}>
        <Label x={0} y={0} text="снаружи: спокойная улыбка" size={30} bg={C.white} />
      </Appear>
      <Particles shape="heart" t={t} at={b(1)} dur={2.2} x={cx - 140} y={430} s={0.36 + inner * 0.04} r={4.8} step={12} spread={420} />
      <Appear t={t} at={b(1) + 1.6} x={cx - 140} y={620}>
        <Label x={0} y={0} text="внутри: сильное чувство" size={28} bg={C.roseSoft} />
      </Appear>
      <Appear t={t} at={b(2)} x={cx + 380} y={250}>
        <Bubble x={0} y={0} w={420} k={1} lines={["Шарлотта:", "покажите больше!"]} size={30} fill={C.sageSoft} />
      </Appear>
    </Drift>
  );
};

export { wob };

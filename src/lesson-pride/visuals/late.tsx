// Сцены второй половины фильма BM-019: письмо Дарси и перечитывание,
// перестройка точек, Пемберли, семейный кризис и непоказная помощь,
// разные будущие, выводы и финал.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { Carriage, Coin, Label, LetterSheet, Manor, OL, Person, Tree, type Who } from "./draw";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Bubble } from "./middle";
import { Particles } from "./particles";

type P = { mode?: string; host?: string; step?: number; [k: string]: unknown };

// Письмо Дарси: arrive / jane / wickham.
export const Letter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "arrive") {
    const give = ramp(t, 0.6, 1.4);
    return (
      <Drift t={t} dur={dur} cx={cx}>
        {/* калитка парка */}
        <rect x={cx - 700} y={700} width={1400} height={170} fill={C.sageSoft} />
        {[-1, 1].map((d) => (
          <g key={d}>
            <rect x={cx + d * 90 - 18} y={420} width={36} height={420} fill="#7a5a3a" stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={cx + d * 90 + (d > 0 ? 18 : -18 - 140)} y={480 + i * 80} width={140} height={14} fill="#9a7a52" stroke={OL} strokeWidth={2} />)}
          </g>
        ))}
        <Tree x={cx - 520} y={780} s={0.9} t={t} />
        <Tree x={cx + 560} y={780} s={0.8} t={t} />
        <Person who="darcy" x={cx - 230} y={900} s={0.84} t={t} mood="closed" pose={give < 1 ? "reach" : "stand"} hold={give < 0.6 ? "letter" : undefined} />
        <Person who="liz" x={cx + 230} y={900} s={0.8} t={t} mood="shock" pose={give > 0.6 ? "hold" : "stand"} hold={give > 0.6 ? "letter" : undefined} flip />
        <Appear t={t} at={b(0) + 2} x={cx} y={220}>
          <Panel x={-380} y={-80} w={760} h={140} fill={C.cream} stroke={C.gold} />
          <Txt x={0} y={-10} size={30}>{"«написано в Розингсе не далее"}</Txt>
          <Txt x={0} y={34} size={30}>{"как в восемь часов утра»"}</Txt>
        </Appear>
        <Appear t={t} at={b(1) + 0.8} x={cx} y={360}>
          <Label x={-190} y={0} text="1 · Джейн" size={32} bg={C.white} />
          <Label x={190} y={0} text="2 · Уикхем" size={32} bg={C.white} />
        </Appear>
      </Drift>
    );
  }
  const jane = p.mode === "jane";
  const lines = jane
    ? [
        { at: b(0) + 0.6, t: "не заметил особой привязанности" },
        { at: b(0) + 2.4, t: "поведение её родных" },
        { at: b(1) + 0.4, t: "мать · сёстры · отец" },
      ]
    : [
        { at: b(0) + 0.6, t: "отказался от места" },
        { at: b(0) + 2.6, t: "«три тысячи фунтов»" },
        { at: b(1) + 0.6, t: "тайный побег сорван" },
        { at: b(2), t: "свидетель: полковник Фицуильям" },
      ];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <LetterSheet x={cx - 300} y={520} s={0.95} k={ramp(t, 0.2, Math.max(4, dur * 0.6))} title={jane ? "Часть 1 · Джейн" : "Часть 2 · Уикхем"} lines={10} highlight={jane ? [1, 4] : [2, 5, 8]} rot={-3} />
      {lines.map((l, i) => (
        <g key={i}>
          <Arrow x1={cx - 70} y1={360 + i * 130} x2={cx + 90} y2={360 + i * 130} k={ramp(t, l.at, 0.5)} color={jane ? C.teal : C.brick} w={8} />
          <Appear t={t} at={l.at + 0.3} x={cx + 340} y={360 + i * 130}>
            <Label x={0} y={0} text={l.t} size={l.t.length > 24 ? 24 : 28} bg={C.white} />
          </Appear>
        </g>
      ))}
      {jane && (
        <Appear t={t} at={b(1) + 2.2} x={cx + 340} y={780}>
          <Label x={0} y={0} text="тот самый ужин" size={30} bg={C.yellow} rot={-4} />
        </Appear>
      )}
      {!jane && (
        <Appear t={t} at={b(1) + 2} x={cx + 340} y={170}>
          <Label x={0} y={0} text="бережно: подробности не нужны" size={24} bg={C.sageSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// p33 — портрет «приятного» Уикхема из точек перестраивается в знак вопроса.
export const DotMorph: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={A.cx} amount={0.02}>
      <rect x={A.cx - 300} y={130} width={600} height={720} rx={26} fill={C.cream} stroke={OL} strokeWidth={6} />
      <Particles shape="man2" t={t} at={-3} dur={1} x={A.cx} y={480} s={0.85} r={5.2} step={12.5} morphTo="question" morphAt={b1 - 0.4} morphDur={2.6} spread={600} />
      <Appear t={t} at={0.3} x={A.cx} y={790}>
        <Label x={0} y={0} text={t < b1 ? "«Это не может быть правдой!»" : "картина перестраивается"} size={30} bg={t < b1 ? C.roseSoft : C.yellow} />
      </Appear>
    </Drift>
  );
};

// Перечитывание: check — вопросы к памяти; jane — второе прочтение.
export const Reread: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "jane") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Person who="liz" x={cx - 380} y={900} s={0.82} t={t} mood="sad" pose="read" />
        <LetterSheet x={cx + 200} y={470} s={0.75} k={1} title="Часть 1 · Джейн" lines={9} highlight={t > b(1) ? [2, 3] : []} />
        <Appear t={t} at={b(0) + 1.2} x={cx + 200} y={110}>
          <Label x={0} y={0} text="второе прочтение" size={32} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={b(1) + 0.4} x={cx + 200} y={790}>
          <Label x={0} y={0} text="неверно, но не выдумано" size={30} bg={C.white} />
        </Appear>
        <Appear t={t} at={b(2)} x={cx - 380} y={200}>
          <Label x={0} y={0} text="факты ≠ прощение" size={32} bg={C.roseSoft} rot={-4} />
        </Appear>
      </Drift>
    );
  }
  const qs = [
    { q: "Зачем всё рассказал почти незнакомке?", at: b(1) },
    { q: "Почему избежал бала?", at: b(1) + 3 },
    { q: "Почему рассказал всем после отъезда Дарси?", at: b(1) + 5 },
    { q: "Почему переключился на наследство?", at: b(2) },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Person who="liz" x={A.x0 + 200} y={900} s={0.82} t={t} mood="tense" pose="read" />
      {qs.map((q, i) => (
        <Appear key={i} t={t} at={q.at} x={cx + 120} y={230 + i * 150}>
          <rect x={-470} y={-50} width={940} height={96} rx={20} fill={C.white} stroke={OL} strokeWidth={4} />
          <text x={-420} y={12} fontFamily={FONT} fontWeight={800} fontSize={q.q.length > 34 ? 30 : 34} fill={C.ink}>
            {q.q}
          </text>
          <Check x={420} y={0} s={28} k={ramp(t, q.at + 1.2, 0.4)} color={C.brick} />
        </Appear>
      ))}
      <Appear t={t} at={b(0) + 1} x={cx + 120} y={120}>
        <Label x={0} y={0} text="сверка с памятью" size={32} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// Пемберли: house / keeper / meet.
export const Pemberley: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "keeper") {
    const said = [
      { s: "ни одного грубого слова", at: b(0) + 1.5 },
      { s: "«лучший землевладелец»", at: b(1) + 2.2 },
      { s: "заботливый брат", at: b(1) + 3.6 },
      { s: "просто немногословен", at: b(2) + 0.5 },
    ];
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <rect x={A.x0 + 20} y={140} width={A.x1 - A.x0 - 40} height={740} rx={30} fill="#f3ead4" stroke={OL} strokeWidth={4} />
        {/* портрет на стене */}
        <g transform={`translate(${cx - 260} 360)`}>
          <rect x={-130} y={-170} width={260} height={320} rx={10} fill={C.gold} stroke={OL} strokeWidth={6} />
          <rect x={-108} y={-148} width={216} height={276} fill={C.tealSoft} />
          <Person who="darcy" x={0} y={240} s={0.5} t={t} mood={t > b(3) ? "kind" : "neutral"} />
        </g>
        <Person who="keeper" x={cx - 520} y={900} s={0.8} t={t} mood="kind" pose={t > b(1) ? "point" : "stand"} />
        <Person who="mrG" x={cx + 470} y={900} s={0.74} t={t} mood="smile" flip />
        <Person who="liz" x={cx + 290} y={900} s={0.72} t={t} mood={t > b(1) ? "shock" : "neutral"} flip />
        {said.map((x, i) => (
          <Appear key={i} t={t} at={x.at} x={cx + 280} y={220 + i * 105}>
            <Label x={0} y={0} text={x.s} size={28} bg={C.white} />
          </Appear>
        ))}
        <Appear t={t} at={b(3) + 1.4} x={cx - 260} y={620}>
          <Label x={0} y={0} text="знает его с 4 лет" size={28} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "meet") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Manor x={cx} y={640} s={0.62} grand t={t} />
        <path d={`M ${A.x0} 820 Q ${cx} 760 ${A.x1} 820 L ${A.x1} 880 L ${A.x0} 880 Z`} fill={C.sageSoft} stroke={OL} strokeWidth={3} />
        <Person who="darcy" x={cx - 320} y={910} s={0.84} t={t} mood={t > b(1) ? "kind" : "shock"} pose={t > b(2) ? "point" : "bow"} />
        <Person who="liz" x={cx + 60} y={910} s={0.76} t={t} mood={t > b(1) ? "neutral" : "shock"} flip />
        <Appear t={t} at={b(1) + 1.6} x={0} y={0}>
          <Person who="mrG" x={cx + 290} y={910} s={0.78} t={t} mood="smile" flip />
          <Person who="mrsG" x={cx + 470} y={910} s={0.74} t={t} mood="smile" flip />
        </Appear>
        <Appear t={t} at={b(1) + 2.6} x={cx + 380} y={250}>
          <Label x={0} y={0} text="дядя «из торговли»" size={28} bg={C.white} />
        </Appear>
        <Appear t={t} at={b(2)} x={cx - 40} y={380}>
          <Bubble x={0} y={0} w={460} k={1} lines={["Приезжайте", "рыбачить в любое время!"]} size={28} fill={C.tealSoft} tail="left" />
        </Appear>
        <Appear t={t} at={b(3) + 0.4} x={cx} y={150}>
          <Label x={0} y={0} text="«…похвально скромен»" size={32} bg={C.sageSoft} />
        </Appear>
      </Drift>
    );
  }
  // house: въезд в парк, дом через долину, мысль Элизабет
  const ride = ramp(t, 0, 3);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.06}>
      <path d={`M ${A.x0} 520 Q ${cx} 380 ${A.x1} 520 L ${A.x1} 880 L ${A.x0} 880 Z`} fill={C.sageSoft} />
      <path d={`M ${A.x0} 640 Q ${cx} 560 ${A.x1} 650 L ${A.x1} 680 Q ${cx} 600 ${A.x0} 670 Z`} fill={C.sky} opacity={0.8} />
      <Manor x={cx + 120} y={560} s={0.72} grand t={t} />
      {[-560, -380, 520, 700].map((dx, i) => <Tree key={i} x={cx + dx} y={720 + (i % 2) * 40} s={0.7 + (i % 2) * 0.15} t={t} />)}
      <Carriage x={A.x0 + 120 + ride * 420} y={870} s={0.6} t={t} color="#6a5a3a" />
      <Appear t={t} at={b(1) + 0.8} x={cx + 120} y={180}>
        <Bubble x={0} y={0} w={640} k={1} lines={["«И я могла бы стать", "хозяйкой этого дома!»"]} size={34} fill={C.roseSoft} serif />
      </Appear>
      <Appear t={t} at={b(2)} x={cx + 120} y={350}>
        <Label x={0} y={0} text="не только стены" size={30} bg={C.yellow} rot={-4} />
      </Appear>
    </Drift>
  );
};

// Сеть «кто кому сообщил» и непоказная помощь.
const Node: React.FC<{ x: number; y: number; who: Who; label: string; k: number; t: number; hl?: boolean }> = ({ x, y, who, label, k, t, hl }) => {
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
      <circle r={86} fill={hl ? C.yellow : C.white} stroke={OL} strokeWidth={5} />
      <clipPath id={`clip-${who}-${x}`}>
        <circle r={80} />
      </clipPath>
      <g clipPath={`url(#clip-${who}-${x})`}>
        <Person who={who} x={0} y={300} s={0.62} t={t} mood="neutral" />
      </g>
      <rect x={-label.length * 9 - 20} y={92} width={label.length * 18 + 40} height={44} rx={22} fill={C.white} stroke={OL} strokeWidth={3} />
      <text y={124} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink} textAnchor="middle">
        {label}
      </text>
    </g>
  );
};

export const Crisis: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const cx = A.cx;
  if (p.mode === "brighton") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <Person who="lydia" x={cx + 380} y={900} s={0.8} t={t} mood="smile" pose="dance" />
        <Appear t={t} at={0.6} x={cx + 380} y={230}>
          <Label x={0} y={0} text="Брайтон · полк" size={32} bg={C.white} />
        </Appear>
        <Person who="liz" x={cx - 340} y={900} s={0.78} t={t} mood="tense" pose={t > b(1) ? "reach" : "stand"} />
        <Person who="mrB" x={cx - 60} y={900} s={0.8} t={t} mood="smile" flip pose={t > b(1) + 1.5 ? "hold" : "stand"} hold="book" />
        <Appear t={t} at={b(1) + 0.3} x={cx - 340} y={300}>
          <Bubble x={0} y={0} w={380} k={1} lines={["Не отпускайте её!"]} size={30} fill={C.roseSoft} />
        </Appear>
        <Appear t={t} at={b(1) + 2.6} x={cx - 40} y={460}>
          <Bubble x={0} y={0} w={560} k={1} lines={["«Нам не будет покоя", "в Лонгборне…»"]} size={30} fill={C.white} />
        </Appear>
        {/* цепочка решений */}
        {["отпустить", "промолчать об Уикхеме", "не следить"].map((s, i) => (
          <Appear key={s} t={t} at={b(2) + i * 1} x={cx - 340 + i * 330} y={130}>
            <Label x={0} y={0} text={s} size={26} bg={C.paperDark} />
          </Appear>
        ))}
      </Drift>
    );
  }
  if (p.mode === "letters") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <LetterSheet x={cx - 240} y={470} s={0.6} k={ramp(t, 0.3, 2)} title="Джейн → Элизабет" lines={8} highlight={[2]} rot={-5} />
        <LetterSheet x={cx + 240} y={500} s={0.6} k={ramp(t, b(1), 2)} title="Джейн → Элизабет" lines={8} highlight={[4]} rot={4} />
        <Appear t={t} at={b(0) + 3} x={cx - 240} y={790}>
          <Label x={0} y={0} text="уехала с Уикхемом" size={28} bg={C.roseSoft} />
        </Appear>
        <Appear t={t} at={b(1) + 1.4} x={cx + 240} y={790}>
          <Label x={0} y={0} text="не в Шотландию?" size={28} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={b(2)} x={cx} y={120}>
          <Label x={0} y={0} text="под угрозой — все сёстры" size={30} bg={C.plumSoft} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "tell") {
    return (
      <Drift t={t} dur={dur} cx={cx}>
        <rect x={A.x0 + 40} y={160} width={A.x1 - A.x0 - 80} height={720} rx={30} fill="#f5ebdc" stroke={OL} strokeWidth={4} />
        <Person who="liz" x={cx + 230} y={910} s={0.8} t={t} mood={t > b(2) ? "sad" : "shock"} pose={t > b(1) ? "cover" : "hold"} hold={t < b(1) ? "letter" : undefined} flip />
        <Person who="darcy" x={cx - 260} y={910} s={0.86} t={t} mood={t > b(2) ? "closed" : "tense"} pose={t > b(2) + 1 ? "walk" : "stand"} />
        <Appear t={t} at={b(1) + 1.8} x={cx + 230} y={250}>
          <Bubble x={0} y={0} w={500} k={1} lines={["«Роковая,", "непростительная ошибка!»"]} size={32} fill={C.roseSoft} />
        </Appear>
        <Appear t={t} at={b(2)} x={cx - 260} y={260}>
          <Label x={0} y={0} text="хранит тайну" size={30} bg={C.tealSoft} />
        </Appear>
        <Particles shape="heart" t={t} at={b(2) + 1.6} dur={2} x={cx + 230} y={470} s={0.24} r={4} step={12} spread={260} />
      </Drift>
    );
  }
  if (p.mode === "blame") {
    const nodes: { who: Who; label: string; x: number; y: number; at: number }[] = [
      { who: "lydia", label: "Лидия: выбор", x: cx, y: 260, at: b(0) },
      { who: "mrB", label: "отец: «потакание»", x: cx - 420, y: 540, at: b(1) },
      { who: "mrsB", label: "мать: баловала", x: cx - 140, y: 680, at: b(1) + 1.5 },
      { who: "liz", label: "сёстры: молчали", x: cx + 160, y: 680, at: b(1) + 2.5 },
      { who: "wickham", label: "Уикхем: умысел", x: cx + 440, y: 520, at: b(2) },
    ];
    return (
      <Drift t={t} dur={dur} cx={cx}>
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={cx} y1={260} x2={n.x} y2={n.y} stroke={OL} strokeWidth={4} strokeDasharray="10 8" opacity={ramp(t, n.at, 0.5) * 0.5} />
        ))}
        {nodes.map((n, i) => (
          <Node key={i} x={n.x} y={n.y} who={n.who} label={n.label} k={ramp(t, n.at, 0.5)} t={t} hl={n.who === "wickham" && t > b(2) + 1} />
        ))}
      </Drift>
    );
  }
  // help — путь помощи: найти → уговаривать → заплатить → молчать
  const steps = [
    { s: "нашёл пару", at: b(1) + 0.3 },
    { s: "говорил с Лидией", at: b(1) + 1.8 },
    { s: "оплатил долги", at: b(1) + 3.6 },
    { s: "настоял на тайне", at: b(1) + 5.2 },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={0.3} x={cx - 330} y={300}>
        <Bubble x={0} y={0} w={420} k={1} lines={["«…там был Дарси!»"]} size={32} fill={C.yellow} />
      </Appear>
      <Person who="lydia" x={cx - 330} y={900} s={0.74} t={t} mood="smile" pose={t < b(1) ? "cover" : "stand"} />
      {steps.map((s, i) => (
        <Appear key={i} t={t} at={s.at} x={cx + 260} y={210 + i * 120}>
          <rect x={-230} y={-42} width={460} height={84} rx={18} fill={C.white} stroke={OL} strokeWidth={4} />
          <text x={-190} y={12} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
            {`${i + 1}. ${s.s}`}
          </text>
        </Appear>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i} opacity={ramp(t, b(1) + 3.6 + i * 0.15, 0.3)}>
          <Coin x={cx + 560} y={450 + i * -16} r={26} spin={t * 3 + i} />
        </g>
      ))}
      {/* «без подписи»: конверт без имени */}
      <Appear t={t} at={b(3)} x={cx + 260} y={720}>
        <rect x={-210} y={-80} width={420} height={160} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
        <path d="M -210 -80 L 0 0 L 210 -80" fill="none" stroke={OL} strokeWidth={4} />
        <Txt x={0} y={54} size={28} color={C.green}>{"без имени · без условий"}</Txt>
      </Appear>
    </Drift>
  );
};

// Разные будущие: три пары на трёх дорогах.
export const Fates: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  const lanes = [
    { a: "jane" as Who, c: "bingley" as Who, label: "тихое доброе счастье", color: C.sky, at: b(1), mood: "smile" as const },
    { a: "lydia" as Who, c: "wickham" as Who, label: "долги и переезды", color: C.paperDark, at: b(2), mood: "tense" as const },
    { a: "mrsG" as Who, c: "mrG" as Who, label: "самые близкие друзья", color: C.sageSoft, at: b(3), mood: "smile" as const },
  ];
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      {lanes.map((l, i) => {
        const x = A.x0 + 260 + i * ((A.x1 - A.x0 - 520) / 2);
        return (
          <Appear key={i} t={t} at={l.at} x={x} y={0}>
            <rect x={-230} y={180} width={460} height={700} rx={30} fill={l.color} opacity={0.75} stroke={OL} strokeWidth={3} />
            <Person who={l.a} x={-70} y={860} s={0.6} t={t} mood={l.mood} />
            <Person who={l.c} x={80} y={860} s={0.62} t={t} mood={l.mood} flip={i === 1} />
            <Label x={0} y={250} text={l.label} size={26} bg={C.white} />
            {i === 1 && <Label x={0} y={340} text="не изменились" size={26} bg={C.roseSoft} opacity={ramp(t, l.at + 2, 0.4)} />}
            {i === 2 && <Label x={0} y={340} text="«из торговли»" size={26} bg={C.yellow} opacity={ramp(t, l.at + 2.2, 0.4)} />}
          </Appear>
        );
      })}
      <Appear t={t} at={0.2} x={A.cx} y={110}>
        <Label x={0} y={0} text="не только помолвка" size={32} bg={C.white} />
      </Appear>
    </Drift>
  );
};

const OBS = [
  { n: 1, t: "Сильное впечатление —\nещё не доказательство", c: C.rose },
  { n: 2, t: "Исправить суждение —\nне потерять достоинство", c: C.teal },
  { n: 3, t: "Чувства убеждают\nв уважении и поступках", c: C.gold },
];

// Три наблюдения: на шаге N показываются 1…N, текущее крупно.
export const Conclusions: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const step = p.step ?? 1;
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      {OBS.slice(0, step).map((o, i) => {
        const cur = i === step - 1;
        const k = cur ? ramp(t, step === 1 ? b1 : 0.2, 0.6) : 1;
        const y = 200 + i * 230;
        return (
          <g key={i} opacity={k} transform={`translate(${A.cx} ${y + (1 - k) * 30})`}>
            <rect x={-560} y={-90} width={1120} height={180} rx={30} fill={cur ? C.white : C.cream} stroke={o.c} strokeWidth={cur ? 9 : 5} />
            <circle cx={-470} cy={0} r={56} fill={o.c} stroke={OL} strokeWidth={5} />
            <text x={-470} y={22} fontFamily={HEAVY} fontWeight={900} fontSize={62} fill="#fff" textAnchor="middle">
              {o.n}
            </text>
            <Txt x={60} y={-12} size={cur ? 46 : 38} weight={900} color={C.ink}>
              {o.t}
            </Txt>
          </g>
        );
      })}
      {step === 1 && (
        <g>
          <g transform={`translate(${A.cx - 360} 760)`} opacity={1 - ramp(t, b1, 0.6) * 0.6}>
            <circle r={60} fill="none" stroke={C.rose} strokeWidth={14} />
          </g>
          <g transform={`translate(${A.cx + 360} 760)`} opacity={1 - ramp(t, b1, 0.6) * 0.6}>
            <circle r={60} fill="none" stroke={C.teal} strokeWidth={14} />
          </g>
          <Label x={A.cx} y={760} text="закрываем линзы" size={30} bg={C.white} opacity={1 - ramp(t, b1, 0.6)} />
        </g>
      )}
      {step === 2 && (
        <Appear t={t} at={b1 + 1.4} x={A.cx} y={700}>
          <Label x={0} y={0} text="«Я не стану давать подобных обещаний»" size={28} bg={C.roseSoft} />
        </Appear>
      )}
      {step === 3 && (
        <Appear t={t} at={b1} x={A.cx} y={830}>
          <Label x={-300} y={0} text="апрель: громкие слова" size={28} bg={C.white} />
          <Label x={300} y={0} text="потом: поступки + свобода" size={28} bg={C.sageSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// Финал: вопрос зрителю (линза зрителя) и знак BanaMind.
export const Finale: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const logo = ramp(t, b2, 0.8);
  return (
    <Drift t={t} dur={dur} cx={A.cx} amount={0.025}>
      <g opacity={1 - logo}>
        <Particles shape="ring" t={t} at={0.3} dur={2.2} x={A.cx} y={450} s={0.62} r={5} step={13} spread={700} />
        <Appear t={t} at={b1 + 0.6} x={A.cx} y={120}>
          <Label x={0} y={0} text="ваша линза" size={34} bg={C.yellow} />
        </Appear>
      </g>
      <g opacity={logo} transform={`translate(${A.cx} ${470 - (1 - logo) * 30})`}>
        <text y={0} fontFamily={HEAVY} fontWeight={900} fontSize={130} textAnchor="middle" fill={BRAND.ink}>
          <tspan>{BRAND.wordmark[0]}</tspan>
          <tspan fill={C.goldDeep}>{BRAND.wordmark[1]}</tspan>
        </text>
        <text y={80} fontFamily={FONT} fontWeight={800} fontSize={44} textAnchor="middle" fill={C.inkSoft}>
          {BRAND.slogan}
        </text>
      </g>
    </Drift>
  );
};

export { Carriage, Manor, SERIF, wob, pop, Cross };

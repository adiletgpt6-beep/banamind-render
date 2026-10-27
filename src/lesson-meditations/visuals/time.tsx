// Часть «Настоящее»: отложенный звонок (вымышленный эпизод; II, IV), у нас есть только
// настоящее (II, VI), река времени (IV, V) и вопрос-фильтр (VIII), каждое дело — с полным
// вниманием (II, VII), будущее встретим тем же разумом (VII), трещинки на хлебе (III),
// лампада и честная оговорка о смерти (XII). Без часов, таймеров и обратных отсчётов.
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Big, Bread, Heart, Hero, OL, OilLamp, Person, Phone, QuoteCard, SkyArc } from "./draw";

type VP = VisualProps<{ host?: string }>;

// ── t01: закат, банан идёт; стопка «завтра…»; звонок бабушке ──
export const EveningCall: React.FC<VP> = (c) => {
  const { t } = c;
  const later = ramp(t, at(c, 0.4), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const quote = ramp(t, at(c, 1.3), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const call = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#ffb37a" opacity={0.25} />
      <SkyArc x={1100} y={560} w={1200} phase={1.75 + call * 0.15} t={t} />
      <rect x={0} y={780} width={1920} height={300} fill="#e8c49a" opacity={0.5} />
      {[300, 520, 1500, 1720].map((x, i) => (
        <rect key={i} x={x} y={520 - (i % 2) * 80} width={160} height={260 + (i % 2) * 80} fill="#d98a5a" opacity={0.5} />
      ))}
      <Hero x={900 + (call > 0 ? 0 : ((t * 40) % 200) - 100)} y={800} s={0.4} t={t} pose={call > 0 ? "heart" : "think"} mood={call > 0 ? "happy" : "confused"} />
      {later > 0 &&
        ["завтра", "на выходных", "потом", "в следующий раз"].map((w, i) => (
          <g key={w} transform={`translate(${1260 + (i % 2) * 140} ${560 - i * 90}) scale(${pop(t, at(c, 0.5 + i * 0.12))})`} opacity={later}>
            <Tag x={0} y={0} text={w} size={30} color="#fff" />
          </g>
        ))}
      <QuoteCard x={1200} y={130} w={840} k={quote} text={"Не живи так, точно тебе\nпредстоит еще десять тысяч лет…"} refText="Книга IV" size={38} />
      {call > 0 && (
        <g opacity={call}>
          <g transform={`translate(1040 560) rotate(-10) scale(0.55)`}>
            <Phone x={0} y={0}>
              <circle cx={0} cy={-60} r={50} fill={R.oliveSoft} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={40} size={34} weight={900}>
                бабушка
              </Txt>
              <circle cx={0} cy={110} r={34} fill={C.green} />
            </Phone>
          </g>
          {[0, 1, 2].map((i) => {
            const r = 40 + ((t * 60 + i * 40) % 120);
            return <circle key={i} cx={1040} cy={480} r={r} fill="none" stroke={C.green} strokeWidth={5} opacity={1 - r / 160} />;
          })}
          <Tag x={900} y={360} text="прямо сейчас" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── t02: линия «прошлое — настоящее — будущее»: края тают, светится точка «сейчас» ──
export const PresentDot: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.2, 0.8);
  const fade = ramp(t, at(c, 0.4), 1.2);
  const equal = ramp(t, at(c, 1), 0.6);
  const pulse = 1 + 0.08 * Math.sin(t * 3);
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id="med-pres" x1="0" x2="1">
          <stop offset="0" stopColor={C.inkSoft} stopOpacity={1 - fade * 0.9} />
          <stop offset="0.45" stopColor={C.inkSoft} stopOpacity={1} />
          <stop offset="0.55" stopColor={C.inkSoft} stopOpacity={1} />
          <stop offset="1" stopColor={C.inkSoft} stopOpacity={1 - fade * 0.9} />
        </linearGradient>
      </defs>
      <rect x={cx - 520} y={440} width={1040} height={16} rx={8} fill="url(#med-pres)" />
      <Txt x={cx - 400} y={400} size={38} weight={900} color={C.inkSoft} opacity={1 - fade * 0.7}>
        прошлого уже нет
      </Txt>
      <Txt x={cx + 400} y={400} size={38} weight={900} color={C.inkSoft} opacity={1 - fade * 0.7}>
        будущего ещё нет
      </Txt>
      <circle cx={cx} cy={448} r={110 * pulse} fill={C.yellow} opacity={0.25} />
      <circle cx={cx} cy={448} r={64} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={8} />
      <Txt x={cx} y={460} size={34} weight={900}>
        сейчас
      </Txt>
      {equal > 0 && (
        <g opacity={equal}>
          <g transform={`translate(${cx - 260} 680)`}>
            <rect x={-200} y={-30} width={400} height={60} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <circle cx={0} cy={0} r={22} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={80} size={28} color={C.inkSoft}>
              долгая жизнь
            </Txt>
          </g>
          <g transform={`translate(${cx + 260} 680)`}>
            <rect x={-80} y={-30} width={160} height={60} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <circle cx={0} cy={0} r={22} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={80} size={28} color={C.inkSoft}>
              короткая
            </Txt>
          </g>
          <Txt x={cx} y={694} size={56} weight={900}>
            =
          </Txt>
          <Tag x={cx} y={190} text="у каждого — только это мгновение" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── t03: река уносит лодочки «гордость», «тревога»; фильтр «стоит ли это того?» ──
export const RiverTime: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const filt = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const calm = ramp(t, at(c, 2), 0.6) * (1 - ramp(t, at(c, 3), 0.5));
  const bird = clamp01((t - at(c, 3)) / 3.5);
  const words = ["гордость", "тревога", "обида", "чужое мнение", "спешка"];
  return (
    <g>
      <path d={`M ${cx - 560} 560 Q ${cx - 200} 480 ${cx} 560 T ${cx + 560} 540 L ${cx + 560} 700 Q ${cx + 200} 660 ${cx} 720 T ${cx - 560} 700 Z`} fill="#7cc0ec" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 8 }).map((_, i) => {
        const x = ((t * 80 + i * 150) % 1120) - 560;
        return <line key={i} x1={cx + x} x2={cx + x + 50} y1={600 + (i % 3) * 30} y2={600 + (i % 3) * 30} stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />;
      })}
      {words.map((w, i) => {
        const ph = ((t * 0.09 + i / words.length) % 1) * 1.2 - 0.1;
        const x = cx - 600 + ph * 1200;
        return (
          <g key={w} transform={`translate(${x} ${610 + Math.sin(t * 2 + i) * 8})`} opacity={clamp01(Math.min(ph * 6, (1.1 - ph) * 6))}>
            <path d="M -90 -10 L 90 -10 L 60 30 L -60 30 Z" fill="#c98b4a" stroke={OL} strokeWidth={4} />
            <Tag x={0} y={-50} text={w} size={24} color="#fff" />
          </g>
        );
      })}
      <Pop t={t} at={0.4} x={cx} y={180}>
        <Big x={0} y={0} text="время — река" size={56} serif />
      </Pop>
      {filt > 0 && (
        <g opacity={filt}>
          <g transform={`translate(${cx} 330)`}>
            <Panel x={-470} y={-60} w={940} h={120} r={60} fill={C.yellow} />
            <Txt x={0} y={-6} size={34} weight={900}>
              «Стоит ли это того, чтобы
            </Txt>
            <Txt x={0} y={36} size={34} weight={900}>
              из-за него болела моя душа?»
            </Txt>
          </g>
        </g>
      )}
      {bird > 0 && bird < 1 && (
        <g transform={`translate(${cx - 520 + bird * 1100} ${300 - Math.sin(bird * Math.PI) * 120})`} opacity={Math.min(1, (1 - bird) * 4)}>
          <path d={`M -40 0 Q -20 ${-24 * Math.sin(t * 12)} 0 0 Q 20 ${-24 * Math.sin(t * 12)} 40 0`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {bird > 0 && <Hero x={cx - 300} y={500} s={0.3} t={t} pose="pointUp" mood="wonder" />}
      {calm > 0 && (
        <g opacity={calm}>
          <Hero x={cx} y={500} s={0.3} t={t} pose="heart" mood="calm" />
          <Tag x={cx} y={300} text="не грусть — экономия сил" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── t04: «каждое дело — как последнее» = полное внимание: телефон убран, слушаю бабушку ──
export const FullAttention: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const focus = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <g opacity={1 - focus * 0.85}>
        <Hero x={cx - 220} y={760} s={0.38} t={t} pose="idle" mood="confused" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${cx + 120 + (i % 2) * 220} ${330 + Math.floor(i / 2) * 230}) rotate(${wob(t, i, 8)})`}>
            <rect x={-90} y={-70} width={180} height={140} rx={16} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={32} weight={900} color={C.inkSoft}>
              {["уведомл.", "лента", "мысли", "суета"][i]}
            </Txt>
          </g>
        ))}
      </g>
      {focus > 0 && (
        <g opacity={focus}>
          <circle cx={cx} cy={520} r={330} fill={C.yellow} opacity={0.18} />
          <Hero x={cx - 190} y={760} s={0.38} t={t} pose="heart" mood="happy" />
          <g transform={`translate(${cx + 200} 760)`}>
            <Person x={0} y={0} s={1.3} color={R.olive} t={t} />
            <path d="M -40 -190 q 40 -40 80 0" fill="#e8e8e8" stroke={OL} strokeWidth={3} />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${cx + 40 + i * 20} ${330 - i * 10} q 20 ${-20 - i * 6} 40 0`} stroke={R.olive} strokeWidth={6} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />
          ))}
          <Tag x={cx} y={200} text="без суеты, без притворства — с вниманием" size={30} color="#fff" />
        </g>
      )}
    </g>
  );
};

// ── t05: мост в туман будущего; банан несёт «тот же разум» — набор инструментов ──
export const FutureBridge: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.2, 0.8);
  const tools = ramp(t, at(c, 1), 0.6);
  const hx = cx - 400 + tools * 260;
  return (
    <g opacity={k}>
      <path d={`M ${cx - 520} 700 Q ${cx} 520 ${cx + 520} 700`} stroke={C.brown} strokeWidth={22} fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const x = cx - 480 + i * 88;
        const y = 700 - Math.sin(((x - cx + 520) / 1040) * Math.PI) * 180;
        return <line key={i} x1={x} y1={y} x2={x} y2={y - 60} stroke={C.brown} strokeWidth={8} />;
      })}
      <rect x={cx + 120} y={260} width={440} height={520} fill="#fff" opacity={0.8 - tools * 0.3} rx={60} />
      <Txt x={cx + 340} y={420} size={44} weight={900} color={C.inkSoft} opacity={0.7}>
        завтра?
      </Txt>
      <Hero x={hx} y={640} s={0.3} t={t} pose={tools > 0.5 ? "cheer" : "ask"} mood={tools > 0.5 ? "joy" : "wonder"} />
      {tools > 0 && (
        <g transform={`translate(${hx + 110} 560) scale(${tools})`}>
          <rect x={-70} y={-40} width={140} height={80} rx={10} fill={R.terracotta} stroke={OL} strokeWidth={4} />
          <path d="M -30 -40 Q -30 -70 0 -70 Q 30 -70 30 -40" fill="none" stroke={OL} strokeWidth={6} />
          <Txt x={0} y={14} size={24} weight={900} color="#fff">
            разум
          </Txt>
        </g>
      )}
      <QuoteCard x={cx - 120} y={110} w={700} k={pop(t, at(c, 0.4))} text={"Пусть не тревожит\nтебя будущее!"} refText="Книга VII" size={44} />
    </g>
  );
};

// ── t06: хлеб: трещинки появляются и «украшают»; тёплый пар ──
export const BreadCracks: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const cr = ramp(t, at(c, 1), 2);
  const age = ramp(t, at(c, 1.6), 0.8);
  return (
    <g>
      <g transform={`translate(${cx} ${560 - age * 80}) scale(${1.3 - age * 0.4})`}>
        <ellipse cx={0} cy={20} rx={260} ry={40} fill="#fff" stroke={OL} strokeWidth={5} />
        <Bread x={0} y={10} s={1} cracks={cr} />
        {[0, 1, 2].map((i) => {
          const ph = (t * 0.5 + i / 3) % 1;
          return <path key={i} d={`M ${-60 + i * 60} ${-170 - ph * 120} q 20 -20 0 -40 q -20 -20 0 -40`} fill="none" stroke="#fff" strokeWidth={6} opacity={(1 - ph) * 0.8} />;
        })}
      </g>
      {cr > 0.4 && <Tag x={cx} y={180} text="трещинки — не по плану, но вкусно" size={32} color={C.yellow} />}
      {age > 0 && (
        <g opacity={age}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${cx + sd * 330} 720)`}>
              <Person x={0} y={0} s={1.1} color={sd < 0 ? R.purple : R.olive} t={t} />
              <path d="M -30 -150 Q 0 -170 30 -150" stroke="#fff" strokeWidth={10} fill="none" />
              <Heart x={0} y={-230} s={0.3} color={C.coral} />
            </g>
          ))}
          <Txt x={cx} y={820} size={34} weight={900}>
            и у старости своя красота
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── t07: лампада горит; ярлыки «правда, справедливость, благоразумие» светятся; «поговорите с близкими» ──
export const LampShine: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const v = ramp(t, at(c, 1), 0.6);
  const help = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={1 - help * 0.8}>
        <OilLamp x={cx - 40} y={560} s={2.2} t={t} glow={1.2} />
        <Pop t={t} at={at(c, 0.6)} x={cx} y={170}>
          <Tag x={0} y={0} text="смысл — ценность каждого дня" size={34} color={C.yellow} />
        </Pop>
        {v > 0 &&
          ["правда", "справедливость", "благоразумие"].map((w, i) => (
            <g key={w} transform={`translate(${cx - 380 + i * 380} 760) scale(${pop(t, at(c, 1.2 + i * 0.2))})`}>
              <Tag x={0} y={0} text={w} size={32} color="#fff7c4" />
            </g>
          ))}
      </g>
      {help > 0 && (
        <g opacity={help}>
          <Hero x={cx - 240} y={780} s={0.38} t={t} pose="heart" mood="calm" />
          <Person x={cx + 60} y={760} s={1.2} color={R.olive} t={t} />
          <Person x={cx + 260} y={760} s={1.2} color={C.skyDeep} t={t + 1} />
          <path d={`M ${cx - 120} 420 Q ${cx} 360 ${cx + 160} 420`} stroke={C.coral} strokeWidth={6} fill="none" strokeDasharray="12 10" />
          <Panel x={cx - 400} y={180} w={800} h={110} r={55} fill="#fff" />
          <Txt x={cx} y={250} size={36} weight={900}>
            тяжело? — живой разговор и помощь
          </Txt>
          <Check x={cx + 300} y={420} s={40} k={ramp(t, at(c, 2.5), 0.4)} />
        </g>
      )}
    </g>
  );
};

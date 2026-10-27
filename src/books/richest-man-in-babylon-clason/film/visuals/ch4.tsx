// Глава 4 «Как не потерять»: карта тем (семь лекарств и пять законов), Номасир — мешок и
// табличка, две ловушки, пять законов, три мешка; Родан — награда, басня о воле и осле,
// вопросы и арифметика, надпись под крышкой сундука; стены — запас прочности.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Bubble, Card, Hero, Item } from "./common";
import { Dots } from "./dots";
import { Arrow, at, clamp01, Coin, cxOf, ease, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

const THEMES = [
  { s: "Оставить себе", col: C.keep },
  { s: "Тратить по плану", col: C.spend },
  { s: "Вкладывать в понятное", col: C.income },
  { s: "Беречь от потерь", col: C.lapis },
  { s: "Будущее и жильё", col: C.orange },
  { s: "Мастерство", col: C.debt },
];
// лекарство → тема; закон → темы (смысловая карта BanaMind)
const REMEDIES: [string, number][] = [
  ["1. Подкармливай кошелёк", 0],
  ["2. Следи за расходами", 1],
  ["3. Приумножай", 2],
  ["4. Береги от потерь", 3],
  ["5. Своё жильё", 4],
  ["6. Будущий доход", 4],
  ["7. Способность зарабатывать", 5],
];
const LAWS: [string, number[]][] = [
  ["I. Десятая часть — будущему", [0, 4]],
  ["II. Разумное применение", [2]],
  ["III. Совет знающих", [3]],
  ["IV. Незнакомое дело", [3, 2]],
  ["V. Непомерная прибыль", [3]],
];

export const RulesMap: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const lx = 300;
  const mx = 800;
  const rx = 1250;
  const ty = (i: number) => 250 + i * 104;
  const ly = (i: number) => 210 + i * 92;
  const gy = (i: number) => 240 + i * 128;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Txt x={lx} y={150} size={36} weight={900} color={C.clayDeep} opacity={ramp(t, 0.2, 0.4)}>
        {"7 лекарств"}
      </Txt>
      <Txt x={rx} y={150} size={36} weight={900} color={C.clayDeep} opacity={ramp(t, at(ctx, 0.4), 0.4)}>
        {"5 законов"}
      </Txt>
      {/* связи */}
      {REMEDIES.map(([, th], i) => (
        <Arrow key={`r${i}`} x1={lx + 170} y1={ly(i)} x2={mx - 165} y2={ty(th) - 10} k={ramp(t, k1 + i * 0.12, 0.5)} color={THEMES[th].col} w={5} />
      ))}
      {LAWS.flatMap(([, ths], i) => ths.map((th, j) => <Arrow key={`l${i}-${j}`} x1={rx - 170} y1={gy(i)} x2={mx + 165} y2={ty(th) - 10} k={ramp(t, k1 + 1 + i * 0.12, 0.5)} color={THEMES[th].col} w={5} />))}
      {REMEDIES.map(([s], i) => (
        <g key={s} opacity={ramp(t, 0.2 + i * 0.1, 0.4)}>
          <rect x={lx - 170} y={ly(i) - 32} width={340} height={58} rx={29} fill={C.white} />
          <Txt x={lx} y={ly(i) + 8} size={26} w={320}>
            {s}
          </Txt>
        </g>
      ))}
      {LAWS.map(([s], i) => (
        <g key={s} opacity={ramp(t, at(ctx, 0.4) + i * 0.1, 0.4)}>
          <rect x={rx - 170} y={gy(i) - 32} width={340} height={58} rx={29} fill={C.clayLight} />
          <Txt x={rx} y={gy(i) + 8} size={26} w={320}>
            {s}
          </Txt>
        </g>
      ))}
      {THEMES.map((th, i) => {
        const k = pop(t, k1 - 0.3 + i * 0.12);
        const hl = i === 3 ? ramp(t, k2, 0.5) : 0;
        return (
          <g key={th.s} transform={`translate(${mx} ${ty(i) - 10}) scale(${(0.9 + 0.1 * k) * (1 + 0.08 * hl)})`} opacity={clamp01(k * 1.5)}>
            {hl > 0 && <rect x={-182} y={-44} width={364} height={88} rx={44} fill={th.col} opacity={0.25 * hl} />}
            <rect x={-165} y={-34} width={330} height={68} rx={34} fill={th.col} />
            <Txt x={0} y={10} size={30} color={C.white} w={310}>
              {th.s}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

export const BagTablet: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  return (
    <g>
      <Hero t={t} at={0.1} kind="elder" x={760} y={400} size={240} a={C.debt} b={C.gold} name="Аркад" />
      <Hero t={t} at={0.3} x={1520} y={400} size={240} a={C.lapis} b={C.gold} name="Номасир" />
      <Dots shape="bag" x={1000} y={560} size={200} t={t} at={at(ctx, 0.5)} sp={8} />
      <Dots shape="tablet" x={1260} y={560} size={200} t={t} at={at(ctx, 0.7)} sp={8} />
      <Label x={1000} y={720} text="мешок золота" k={pop(t, at(ctx, 0.6))} color={C.goldDeep} bg={C.goldLight} size={30} />
      <Label x={1260} y={720} text="пять законов" k={pop(t, at(ctx, 0.8))} color={C.clayDeep} bg={C.clayLight} size={30} />
      <Label x={1130} y={170} text="десять лет в мире" k={pop(t, at(ctx, 0.9))} color={C.white} bg={C.ink} size={36} />
      {/* что ценнее? — весы */}
      <g opacity={ramp(t, k1, 0.4)} transform={`translate(1130 340) rotate(${Math.sin(t * 2) * 4})`}>
        <line x1={-190} y1={0} x2={190} y2={0} stroke={C.inkSoft} strokeWidth={10} strokeLinecap="round" />
        <circle r={14} fill={C.inkSoft} />
        <Txt x={0} y={-30} size={56} weight={900} color={C.goldDeep}>
          {"?"}
        </Txt>
      </g>
    </g>
  );
};

export const Traps: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k0 = at(ctx, 0.4);
  const k1 = at(ctx, 1.3);
  const k2 = at(ctx, 2);
  const traps = [
    { x: 360, text: "нечестное пари —\nзаранее обман", at: k0 },
    { x: 1180, text: "«партнёр» без\nсвоего золота", at: k1 },
  ];
  const bagSize = 300 - 120 * ramp(t, k0, 1.2) - 100 * ramp(t, k1, 1.2);
  return (
    <g>
      <Dots shape="bag" x={770} y={430} size={Math.round(bagSize / 10) * 10} t={t} at={0.1} sp={9} />
      {traps.map((tr, i) => (
        <g key={i}>
          <Card x={tr.x - 210} y={180} w={420} h={170} k={pop(t, tr.at)} fill={C.spendLight} stroke={C.spend}>
            <Txt x={tr.x} y={250} size={34} color={C.spendDeep}>
              {tr.text}
            </Txt>
          </Card>
          {[0, 1, 2, 3].map((j) => {
            const s = tr.at + 0.4 + j * 0.25;
            const kk = clamp01((t - s) / 0.8);
            return t > s && kk < 1 ? <Coin key={j} x={770 + (tr.x - 770) * ease(kk)} y={380 - 60 * ease(kk) - Math.sin(kk * Math.PI) * 60} r={20} op={1 - clamp01((kk - 0.8) * 5)} /> : null;
          })}
        </g>
      ))}
      <Hero t={t} at={k2} x={560} y={650} size={200} a={C.lapis} b={C.gold} />
      <Dots shape="tablet" x={760} y={680} size={130} t={t} at={k2 + 0.3} sp={6} />
      <Label x={1020} y={700} text="перечитал табличку" k={pop(t, k2 + 0.6)} color={C.clayDeep} bg={C.clayLight} size={32} />
    </g>
  );
};

export const FiveLaws: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const rows = [
    { n: "I", s: "Не меньше десятой части — будущему", beat: 0.2, warn: false },
    { n: "II", s: "Разумное, полезное применение", beat: 1.05, warn: false },
    { n: "III", s: "Совет тех, кто умеет обращаться с деньгами", beat: 1.45, warn: false },
    { n: "IV", s: "Не вкладывать в незнакомое дело", beat: 2.05, warn: true },
    { n: "V", s: "Бежать от непомерной прибыли и ловкачей", beat: 2.45, warn: true },
  ];
  return (
    <Card x={cx - 520} y={110} w={1040} h={700} k={pop(t, 0.1)} fill={C.clayLight} stroke={C.clay} title="Пять законов золота" titleColor={C.clayDeep}>
      {rows.map((r, i) => {
        const s = at(ctx, r.beat);
        const k = pop(t, s);
        const y = 250 + i * 110;
        const hl = ramp(t, s, 0.4) * (1 - 0.6 * ramp(t, s + 2.2, 0.6));
        return (
          <g key={r.n} opacity={clamp01(k * 1.5)}>
            <rect x={cx - 480} y={y - 48} width={960} height={92} rx={24} fill={r.warn ? C.spendLight : C.white} opacity={0.5 + 0.5 * hl} />
            <circle cx={cx - 420} cy={y - 2} r={34} fill={r.warn ? C.spend : C.clay} />
            <text x={cx - 420} y={y + 10} fontFamily={HEAVY} fontWeight={800} fontSize={32} fill={C.white} textAnchor="middle">
              {r.n}
            </text>
            <Txt x={cx - 360} y={y + 10} size={36} anchor="start" w={800}>
              {r.s}
            </Txt>
          </g>
        );
      })}
    </Card>
  );
};

export const ThreeBags: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const saved = t > 0.8 ? Math.min(8, Math.floor((t - 0.8) / 0.4)) : 0;
  return (
    <g>
      <g opacity={1 - 0.6 * ramp(t, k2, 0.5)}>
        <Dots shape="wall" x={420} y={360} size={330} t={t} at={0.1} sp={10} />
        <Label x={420} y={590} text="работа на стене" k={pop(t, 0.5)} color={C.clayDeep} size={30} />
        {Array.from({ length: saved }).map((_, i) => (
          <Coin key={i} x={330 + (i % 4) * 58} y={680 + Math.floor(i / 4) * 52} r={20} />
        ))}
        {/* общее дело: опытные люди обсуждают план */}
        {[0, 1, 2, 3].map((i) => (
          <Hero key={i} t={t} at={k1 + i * 0.15} x={820 + i * 130} y={360} size={170} a={[C.income, C.lapis, C.debt, C.orange][i]} b={C.gold} />
        ))}
        <Bubble x={1015} y={170} text="обсудим каждый план" k={pop(t, k1 + 0.6)} size={32} />
      </g>
      {/* три мешка */}
      {[0, 1, 2].map((i) => (
        <Dots key={i} shape="bag" x={640 + i * 250} y={600} size={220} t={t} at={k2 + 0.2 + i * 0.35} sp={8} />
      ))}
      <Label x={640} y={770} text="за золото" k={pop(t, k2 + 0.5)} color={C.goldDeep} bg={C.goldLight} size={32} />
      <Label x={1015} y={770} text="за мудрость" k={pop(t, at(ctx, 2.6))} color={C.white} bg={C.keepDeep} size={32} />
    </g>
  );
};

export const RodanGold: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const asks = ["Поделись!", "Одолжи!", "Нам тоже!"];
  return (
    <g>
      <Hero t={t} at={0.1} x={740} y={420} size={240} a={C.income} b={C.goldDeep} name="Родан" />
      {/* пятьдесят монет: сетка 10×5, считает код */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Coin key={i} x={1010 + (i % 10) * 52} y={380 + Math.floor(i / 10) * 48} r={20} op={ramp(t, 0.4 + i * 0.03, 0.2)} />
      ))}
      <Label x={1245} y={650} text="50 золотых" k={pop(t, 1.5)} color={C.goldDeep} bg={C.goldLight} size={36} />
      {asks.map((s, i) => (
        <Bubble key={s} x={760 + i * 330} y={160} text={s} k={pop(t, at(ctx, 0.6) + i * 0.2) * (1 - ramp(t, k1, 0.3))} size={32} bg={C.spendLight} />
      ))}
      <Hero t={t} at={k1} x={1580} y={430} size={200} a={C.rose} b={C.gold} name="сестра" />
      <Bubble x={1480} y={170} text={"одолжи всё мужу"} k={pop(t, k1 + 0.4)} tail="right" size={32} />
      <Label x={980} y={790} text="за советом к торговцу Матону" k={pop(t, at(ctx, 1.6))} color={C.white} bg={C.ink} size={34} />
    </g>
  );
};

export const OxDonkey: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const sick = at(ctx, 0.35);
  const swap = at(ctx, 0.75);
  const lie = ramp(t, sick, 0.6);
  const k1 = at(ctx, 1);
  // плуг переезжает от вола к ослу
  const sw = ease(clamp01((t - swap) / 1));
  const plowX = 590 + (1010 - 590) * sw;
  return (
    <g>
      <g transform={`translate(420 520) rotate(${lie * 8}) translate(-420 -520)`}>
        <Dots shape="ox" x={420} y={480} size={360} t={t} at={0.1} sp={10} />
      </g>
      <Label x={420} y={720} text={t < sick ? "вол" : "вол «болен»"} k={pop(t, 0.5)} size={32} />
      <Dots shape="donkey" x={1000} y={490} size={330} t={t} at={0.3} sp={10} />
      <Label x={1000} y={720} text={t < swap + 0.5 ? "осёл" : "осёл тянет плуг"} k={pop(t, 0.7)} size={32} />
      <g opacity={ramp(t, 0.6, 0.4)}>
        <path d={`M ${plowX - 30} 560 L ${plowX + 70} 560 L ${plowX + 40} 620 L ${plowX + 110} 640`} fill="none" stroke={C.woodDeep} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* пот осла */}
      {t > swap + 1 && [0, 1, 2].map((i) => <circle key={i} cx={1110 + i * 22} cy={360 + ((t * 60 + i * 20) % 50)} r={7} fill={C.sky} opacity={0.8} />)}
      <Label x={760} y={180} text={"помогайте, не взваливая\nна себя чужую ношу"} k={pop(t, k1)} color={C.white} bg={C.ink} size={40} />
    </g>
  );
};

export const RodanMath: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const qs = ["Что ты знаешь о торговле?", "Где купить дешевле?", "Где продать с выгодой?"];
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const years = t > k1 + 0.4 ? Math.min(50, Math.floor((t - k1 - 0.4) * 18)) : 0;
  return (
    <g>
      <g opacity={1 - 0.5 * ramp(t, k1, 0.5)}>
        {qs.map((q, i) => (
          <Item key={q} x={cx - 380} y={180 + i * 70} text={q} k={pop(t, 0.3 + i * 0.4)} mark={{ ok: false, k: ramp(t, at(ctx, 0.8) + i * 0.15, 0.4) }} size={36} w={700} />
        ))}
      </g>
      {/* одна монета в год → пятьдесят монет = пятьдесят лет */}
      {Array.from({ length: years }).map((_, i) => (
        <Coin key={i} x={cx - 360 + (i % 10) * 80} y={430 + Math.floor(i / 10) * 64} r={24} glow={i === 0 && t > k2 ? 0.8 : 0} op={t > k2 && i > 0 ? 0.35 : 1} />
      ))}
      <Label x={cx - 360} y={380} text="1 монета = 1 год" k={pop(t, k1 + 0.3)} color={C.keepDeep} bg={C.keepLight} size={30} />
      <Label x={cx + 260} y={380} text="50 монет = 50 лет" k={pop(t, at(ctx, 1.6))} color={C.white} bg={C.ink} size={34} />
      <Label x={cx} y={820} text="сбережения одного года — под проверенный план" k={pop(t, k2 + 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={34} />
    </g>
  );
};

export const ChestLid: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  return (
    <g>
      <Dots shape="heart" x={420} y={330} size={200} t={t} at={0.2} sp={8} />
      <Label x={420} y={500} text="помощь" k={pop(t, 0.6)} color={C.spendDeep} bg={C.spendLight} size={34} />
      <Txt x={640} y={350} size={72} weight={900} color={C.inkSoft} opacity={ramp(t, 0.9, 0.4)}>
        {"="}
      </Txt>
      <Dots shape="plan" x={860} y={330} size={200} t={t} at={0.9} sp={8} />
      <Label x={860} y={500} text="решение" k={pop(t, 1.2)} color={C.incomeDeep} bg={C.incomeLight} size={34} />
      <Dots shape="chest" x={760} y={700} size={260} t={t} at={k1 - 0.3} sp={9} />
      <Label x={760} y={180} text={"«Лучше маленькая осторожность,\nчем большие сожаления»"} k={pop(t, k1 + 0.3)} color={C.ink} bg={C.goldLight} size={42} />
    </g>
  );
};

export const Walls: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host) - 80;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const layers = [
    { s: "собственный запас", col: C.keep },
    { s: "осторожность", col: C.lapis },
    { s: "знание", col: C.debt },
  ];
  const wx = cx - 60;
  // «стрелы» отскакивают от правого края стены
  const arrows = t > at(ctx, 0.5)
    ? [0, 1, 2].map((i) => {
        const ph = ((t - at(ctx, 0.5) + i * 0.6) % 1.8) / 1.8;
        const hitAt = 0.7;
        const x = wx + 640 - 340 * Math.min(1, ph / hitAt) + (ph > hitAt ? (ph - hitAt) * 600 : 0);
        const y = 420 + i * 100 - (ph > hitAt ? (ph - hitAt) * 360 : 0);
        return <path key={i} d={`M ${x} ${y} l 60 0 m -60 0 l 18 -12 m -18 12 l 18 12`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - clamp01((ph - 0.85) * 7)} />;
      })
    : null;
  return (
    <g>
      <Dots shape="wall" x={wx} y={480} size={600} t={t} at={0.1} sp={13} />
      {arrows}
      {/* три слоя одной стены */}
      {layers.map((l, i) => {
        const k = pop(t, k1 + 0.6 + i * 0.35);
        return (
          <g key={l.s} opacity={clamp01(k * 1.5)} transform={`translate(${wx} ${430 + i * 96}) scale(${0.9 + 0.1 * k})`}>
            <rect x={-190} y={-36} width={380} height={66} rx={33} fill={l.col} stroke={C.white} strokeWidth={4} />
            <text y={10} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.white} textAnchor="middle">
              {l.s}
            </text>
          </g>
        );
      })}
      <Label x={wx} y={180} text="стену строят заранее" k={pop(t, k2 + 0.2)} color={C.white} bg={C.ink} size={38} />
    </g>
  );
};

// Глава 6 «План Дабасира»: Таркад и «злой рок», жёлтый камень, бегство и плен, долги — враги,
// кредиторы — друзья, обход кредиторов, табличка долгов (суммы — дословно из книги), доли
// 1/10 · 7/10 · 2/10 в три разных месяца (суммы считает код), долг тает ступеньками, письмо,
// оговорка про структуру.
import React from "react";
import { C, FONT, HEAVY, ZONES } from "../theme";
import { Bubble, Card, Fade, Hero, Item, Mark, ShareBar } from "./common";
import { Dots } from "./dots";
import { Arrow, at, clamp01, Coin, cxOf, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };
const num = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace(",0", "");

export const Tarkad: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  return (
    <g>
      <Hero t={t} at={0.1} x={520} y={440} size={240} a={C.grey} b={C.inkSoft} name="Таркад" />
      <Hero t={t} at={0.4} kind="traveler" x={1060} y={440} size={260} a={C.spend} b={C.goldDeep} c={C.clay} name="Дабасир" flip />
      <Label x={790} y={660} text="должен: 2 медяка + 1 серебряная" k={pop(t, at(ctx, 0.7))} color={C.debtDeep} bg={C.debtLight} size={30} />
      <Bubble x={500} y={170} text="злой рок!" k={pop(t, k1)} bg={C.greyLight} />
      <Mark x={630} y={150} ok={false} k={ramp(t, at(ctx, 1.5), 0.4)} s={36} />
      <Bubble x={1060} y={170} text={"думай, как вернуть,\nа не как занять"} k={pop(t, at(ctx, 1.45))} bg={C.goldLight} />
    </g>
  );
};

export const YellowStone: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const items = ["наряд", "украшение", "ещё наряд", "посуда", "ещё украшение", "ковёр"];
  return (
    <g>
      {items.map((s, i) => {
        const k = pop(t, at(ctx, 0.3) + i * 0.25);
        const y = 760 - i * 62 * ramp(t, k1 + 0.6, 1.2) - (1 - ramp(t, k1 + 0.6, 1.2)) * (i % 3) * 70;
        const x = cx + 300 + (1 - ramp(t, k1 + 0.6, 1.2)) * ((i % 3) - 1) * 150 + (i % 2 ? 14 : -14);
        return (
          <g key={s} opacity={clamp01(k * 1.5)} transform={`translate(${x} ${y})`}>
            <rect x={-170} y={-28} width={340} height={52} rx={12} fill={C.debtLight} stroke={C.debt} strokeWidth={4} />
            <text y={10} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.debtDeep} textAnchor="middle">
              {`${s} — в долг`}
            </text>
          </g>
        );
      })}
      <Dots shape="stone" x={cx - 250} y={420} size={360} t={t} at={0.1} sp={11} />
      <Label x={cx - 250} y={680} text="мир сквозь жёлтый камень" k={pop(t, k1 + 0.2)} color={C.goldDeep} bg={C.goldLight} size={32} />
      <Label x={cx + 330} y={170} text="мелочи → груда" k={pop(t, at(ctx, 1.6))} color={C.white} bg={C.debt} size={36} />
    </g>
  );
};

export const Desert: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const steps = ["бегство", "разбойники", "рабство"];
  return (
    <g>
      <Dots shape="sun" x={1200} y={170} size={170} t={t} at={0.1} sp={8} />
      <rect x={120} y={720} width={1300} height={60} rx={30} fill="#efc98a" opacity={ramp(t, 0.2, 0.5)} />
      {steps.map((s, i) => (
        <g key={s}>
          <Label x={300 + i * 380} y={250} text={s} k={pop(t, at(ctx, 0.2) + i * 0.3)} color={C.white} bg={[C.orange, C.spend, C.red][i]} size={36} />
          {i < 2 && <Arrow x1={445 + i * 380} y1={236} x2={530 + i * 380} y2={236} k={ramp(t, at(ctx, 0.35) + i * 0.3, 0.3)} color={C.inkSoft} w={8} />}
        </g>
      ))}
      <Dots shape="camel" x={560} y={560} size={330} t={t} at={k1} sp={10} />
      <Label x={560} y={820} text="выручило умение" k={pop(t, k1 + 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={32} />
      <Hero t={t} at={at(ctx, 1.5)} x={1050} y={520} size={230} a={C.debt} b={C.gold} name="Сира" />
      <Bubble x={1080} y={340} text="?" k={pop(t, at(ctx, 1.7))} size={44} />
    </g>
  );
};

export const EnemiesFriends: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Card x={cx - 560} y={130} w={520} h={430} k={pop(t, 0.1)} fill={C.debtLight} stroke={C.debt} title="Долги — враги" titleColor={C.debtDeep}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={cx - 480 + i * 130} y={260 + (i % 2) * 40} width={110} height={150} rx={18} fill={C.debt} opacity={ramp(t, 0.6 + i * 0.2, 0.3)} />
        ))}
      </Card>
      <Card x={cx + 40} y={130} w={520} h={430} k={pop(t, at(ctx, 0.6))} fill={C.incomeLight} stroke={C.income} title="Поверившие — друзья" titleColor={C.incomeDeep}>
        <g />
      </Card>
      {[0, 1, 2].map((i) => (
        <Hero key={i} t={t} at={at(ctx, 0.7) + i * 0.15} x={cx + 150 + i * 150} y={380} size={170} a={[C.income, C.lapis, C.orange][i]} b={C.gold} />
      ))}
      <Label x={cx} y={660} text="человек с долгами не хуже других" k={pop(t, k1 + 0.2)} color={C.white} bg={C.ink} size={36} />
      {/* решение вернуться */}
      <Fade k={pop(t, k2 + 0.6)}>
        <Label x={cx} y={790} text="решение: вернуться и расплатиться" k={1} color={C.keepDeep} bg={C.keepLight} size={36} />
      </Fade>
    </g>
  );
};

export const Creditors: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const who = [
    { col: C.red, s: "ругается" },
    { col: C.orange, s: "«мне первым»" },
    { col: C.debtDeep, s: "угрожает" },
    { col: C.income, s: "подождёт" },
    { col: C.income, s: "подождёт" },
    { col: C.income, s: "подождёт" },
  ];
  return (
    <g>
      <Hero t={t} at={0.1} kind="traveler" x={300} y={430} size={240} a={C.spend} b={C.goldDeep} c={C.clay} name="Дабасир" />
      {who.map((w, i) => {
        const x = 560 + i * 150;
        return (
          <g key={i}>
            <Hero t={t} at={at(ctx, 0.3) + i * 0.15} x={x} y={410} size={160} a={C.clayDeep} b={C.clay} />
            <Label x={x} y={i % 2 ? 610 : 560} text={w.s} k={pop(t, k1 + i * 0.25)} color={C.white} bg={w.col} size={24} />
          </g>
        );
      })}
      <Dots shape="camel" x={1100} y={780 - 40} size={150} t={t} at={at(ctx, 1.7)} sp={6} />
      <Label x={800} y={790} text="работа по умению: закупка верблюдов" k={pop(t, at(ctx, 1.75))} color={C.incomeDeep} bg={C.incomeLight} size={30} />
    </g>
  );
};

// суммы дословно из таблички II (p11:L34–L45)
const DEBTS: [string, string][] = [
  ["Фахру, ткач", "2 сер. 6 мед."],
  ["Синджар, мастер диванов", "1 сер."],
  ["Ахмар, друг", "3 сер. 1 мед."],
  ["Занкар, друг", "4 сер. 7 мед."],
  ["Аскамир, друг", "1 сер. 3 мед."],
  ["Харинсир, ювелир", "6 сер. 2 мед."],
  ["Диарбекер, друг отца", "4 сер. 1 мед."],
  ["Алкахад, домовладелец", "14 сер."],
  ["Матон", "9 сер."],
  ["Биреджик, земледелец", "1 сер. 7 мед."],
];

export const DebtTablet: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const fog = 1 - ramp(t, k2, 0.8);
  return (
    <g>
      <Card x={cx - 400} y={120} w={800} h={770} k={pop(t, 0.1)} fill={C.clayLight} stroke={C.clay}>
        {DEBTS.map(([n, s], i) => {
          const y = 190 + i * 54;
          const k = pop(t, at(ctx, 0.4) + i * 0.12 + (i > 3 ? 1 : 0) * 0.3);
          return (
            <g key={n} opacity={clamp01(k * 1.5)}>
              <text x={cx - 350} y={y} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>
                {n}
              </text>
              <text x={cx + 350} y={y} fontFamily={HEAVY} fontWeight={800} fontSize={30} fill={C.debtDeep} textAnchor="end">
                {s}
              </text>
            </g>
          );
        })}
        <text x={cx} y={746} fontFamily={FONT} fontWeight={700} fontSize={26} fill={C.inkSoft} textAnchor="middle" opacity={ramp(t, k1 + 0.8, 0.4)}>
          (далее неразборчиво)
        </text>
        <g opacity={ramp(t, k1 + 1.2, 0.5)}>
          <rect x={cx - 360} y={768} width={720} height={84} rx={20} fill={C.debt} />
          <text x={cx} y={824} fontFamily={HEAVY} fontWeight={800} fontSize={36} fill={C.white} textAnchor="middle">
            Всего: 119 серебряных и 141 медяк
          </text>
        </g>
      </Card>
      {/* туман рассеивается: долг становится задачей */}
      <rect x={cx - 420} y={110} width={840} height={790} rx={36} fill={C.white} opacity={0.55 * fog * ramp(t, 0.1, 0.3)} />
      <Fade k={pop(t, k2 + 0.4)}>
        <Label x={cx} y={60} text="туман → задача" k={1} color={C.white} bg={C.ink} size={34} />
      </Fade>
    </g>
  );
};

export const Months: React.FC<VisualProps<P & { months: number[] }>> = (ctx) => {
  const { t, p } = ctx;
  const notes = ["долг −почти 4, себе ≈ 2", "только овощи, без одежды", "сандалии и одежда"];
  return (
    <g>
      {p.months.map((m, i) => {
        const y = 210 + i * 200;
        const s = at(ctx, i);
        const k = ramp(t, s + 0.3, 0.9);
        return (
          <g key={i} opacity={ramp(t, s, 0.3)}>
            {/* сумма месяца — монеты пропорционально заработку */}
            <Txt x={600} y={y - 40} size={34} weight={900} color={C.inkSoft}>
              {`${m} серебряных`}
            </Txt>
            {Array.from({ length: Math.round(m / 3) }).map((_, j) => (
              <Coin key={j} x={490 + (j % 7) * 36} y={y + 10 + Math.floor(j / 7) * 34} r={15} op={ramp(t, s + j * 0.03, 0.2)} />
            ))}
            <ShareBar
              x={800}
              y={y - 30}
              w={840}
              h={76}
              k={k}
              parts={[
                { v: m * 0.1, color: ZONES.keep.color, label: num(m * 0.1) },
                { v: m * 0.7, color: ZONES.spend.color, label: num(m * 0.7) },
                { v: m * 0.2, color: ZONES.debt.color, label: num(m * 0.2) },
              ]}
            />
            <Txt x={1220} y={y + 90} size={28} color={C.inkSoft} opacity={ramp(t, s + 1, 0.4)}>
              {notes[i] ?? ""}
            </Txt>
          </g>
        );
      })}
      <g opacity={ramp(t, 0.3, 0.4)}>
        {[
          { s: "себе 1/10", col: ZONES.keep.color, x: 842 },
          { s: "жизнь 7/10", col: ZONES.spend.color, x: 1178 },
          { s: "долги 2/10", col: ZONES.debt.color, x: 1556 },
        ].map((l) => (
          <text key={l.s} x={l.x} y={130} fontFamily={FONT} fontWeight={900} fontSize={30} fill={l.col} textAnchor="middle">
            {l.s}
          </text>
        ))}
      </g>
      <Label x={1220} y={870} text="доли постоянны — суммы плавают" k={pop(t, at(ctx, 3))} color={C.white} bg={C.ink} size={38} />
    </g>
  );
};

export const DebtSteps: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const steps = 7;
  const last = at(ctx, 1.3);
  return (
    <g>
      {/* ступеньки долга вниз */}
      {Array.from({ length: steps }).map((_, i) => {
        const h = 420 - i * 60;
        const s = 0.3 + i * 0.45;
        return (
          <g key={i} opacity={ramp(t, s, 0.3)}>
            <rect x={200 + i * 100} y={780 - h} width={86} height={h} rx={12} fill={i === steps - 1 && t > last ? C.income : C.debt} opacity={0.9} />
          </g>
        );
      })}
      <Label x={550} y={250} text="долг тает ступеньками" k={pop(t, 0.6)} color={C.debtDeep} bg={C.debtLight} size={34} />
      {/* свой кошелёк растёт до 21 серебряной */}
      <Dots shape="walletFull" x={1110} y={420} size={220} t={t} at={at(ctx, 0.5)} sp={8} />
      <Label x={1110} y={590} text="21 серебряная — только мои" k={pop(t, at(ctx, 0.7))} color={C.keepDeep} bg={C.keepLight} size={30} />
      <Label x={880} y={140} text="последний долг заплачен" k={pop(t, last)} color={C.white} bg={C.income} size={36} />
      {/* мягкая глина → бронза */}
      <Dots shape="tablet" x={1110} y={760} size={150} t={t} at={k1 + 0.2} sp={7} morph={{ shape: "ingot", at: at(ctx, 1.7) }} />
      <Txt x={1110} y={870} size={30} weight={900} color={C.clayDeep} opacity={ramp(t, at(ctx, 1.7), 0.4)}>
        {"глина → бронза"}
      </Txt>
    </g>
  );
};

export const Letter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  return (
    <g>
      <Dots shape="scroll" x={cx - 330} y={400} size={360} t={t} at={0.1} sp={10} />
      <Label x={cx - 330} y={660} text="письма в книге, 1930-е" k={pop(t, 0.5)} color={C.inkSoft} size={30} />
      <ShareBar
        x={cx - 90}
        y={300}
        w={560}
        h={80}
        k={ramp(t, at(ctx, 0.5), 1)}
        parts={[
          { v: 20, color: ZONES.debt.color, label: "20%" },
          { v: 10, color: ZONES.keep.color, label: "10%" },
          { v: 70, color: ZONES.spend.color, label: "70%" },
        ]}
      />
      <g opacity={ramp(t, at(ctx, 0.7), 0.4)}>
        <text x={cx - 34} y={420} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.debtDeep}>кредиторам</text>
        <text x={cx + 90} y={455} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.keepDeep}>себе</text>
        <text x={cx + 260} y={420} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.spendDeep}>жить</text>
      </g>
      <Item x={cx - 60} y={560} text="заработок — прежний" k={pop(t, k1)} mark={{ ok: true, k: ramp(t, k1 + 0.2, 0.4) }} size={36} w={560} />
      <Item x={cx - 60} y={640} text="дела — в порядке" k={pop(t, k1 + 0.5)} mark={{ ok: true, k: ramp(t, k1 + 0.7, 0.4) }} size={36} w={560} />
      <Label x={cx + 170} y={780} text="литература, а не исследование" k={pop(t, at(ctx, 1.5))} color={C.white} bg={C.ink} size={32} />
    </g>
  );
};

export const Structure: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const steps = [
    { s: "Записать", col: C.clay },
    { s: "Договориться", col: C.lapis },
    { s: "Платить регулярно", col: C.debt },
    { s: "И жить", col: C.income },
  ];
  const k1 = at(ctx, 1);
  return (
    <g>
      <Label x={760} y={200} text="1 · 7 · 2 — пример, а не норма" k={pop(t, at(ctx, 0.3))} color={C.spendDeep} bg={C.spendLight} size={40} />
      {steps.map((st, i) => {
        const x = 250 + i * 340;
        const k = pop(t, k1 + i * 0.4);
        return (
          <g key={st.s}>
            <g opacity={clamp01(k * 1.5)} transform={`translate(${x} 480) scale(${0.85 + 0.15 * k})`}>
              <rect x={-140} y={-80} width={280} height={160} rx={36} fill={st.col} />
              <Txt x={0} y={12} size={34} color={C.white} w={250}>
                {st.s}
              </Txt>
            </g>
            {i < 3 && <Arrow x1={x + 150} y1={480} x2={x + 190} y2={480} k={ramp(t, k1 + i * 0.4 + 0.3, 0.3)} color={C.inkSoft} w={9} />}
          </g>
        );
      })}
      <Txt x={760} y={700} size={34} color={C.inkSoft} opacity={ramp(t, at(ctx, 1.6), 0.5)}>
        {"переносится структура, а не цифры"}
      </Txt>
    </g>
  );
};

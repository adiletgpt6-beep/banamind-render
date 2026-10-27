// «Инновации без потерь» и «Итог»: три условия внутреннего стартапа, песочница, визитка,
// фабрика ненужного, не ритуал, наука-искра; границы метода, тест → решение, комплименты против
// оплат, шаблон лаборатории, финальная заставка BanaMind.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, DISPLAY, FONT, HEAVY } from "../theme";
import { Balloon, Belt, Box, Capsule, Card, Drop, Flask, OL, Pill, Spark } from "./draw";
import { Arrow, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Header, Icon, IconCard, QuoteCard, cxOf, spread, type P } from "./parts";

// ── три условия внутреннего стартапа + «не гарантирует успеха» ──
export const ThreeConditions: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "lock" as const, label: "скромные, но\nдоступные ресурсы", color: C.gold },
    { icon: "flag" as const, label: "независимость", color: C.cyan },
    { icon: "heart" as const, label: "личная\nзаинтересованность", color: C.pink },
  ];
  const warn = pop(t, at(c, 1.3));
  return (
    <g>
      <Header x={cx} y={160} text="Внутренний стартап" t={t} size={56} />
      {items.map((it, i) => (
        <IconCard key={`c${i}`} x={cx - 370 + i * 370} y={440} w={330} h={290} icon={it.icon} label={it.label} k={pop(t, spread(c, 0, i, 3, 0.45, 0.95))} color={it.color} size={30} />
      ))}
      {warn > 0 && (
        <g transform={`translate(${cx} 780) scale(${warn})`}>
          <Card x={0} y={0} w={940} h={170} fill="#fff">
            <Icon name="warn" x={-390} y={0} s={0.9} />
            <Txt x={40} y={-10} size={38}>
              {"«структура — это просто предпосылка,\nона не гарантирует успеха»"}
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── песочница инноваций: огороженная зона опытов рядом с большой компанией ──
export const Sandbox: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const box = pop(t, at(c, 1.05));
  const report = pop(t, at(c, 1.45));
  const stop = pop(t, at(c, 1.8));
  return (
    <g>
      <Pop t={t} at={at(c, 0.5)} x={cx} y={170}>
        <Pill x={0} y={0} text="«как защитить головную организацию от стартапа?»" fill="#fff" size={34} />
      </Pop>
      {/* головная компания */}
      <Pop t={t} at={0.3} x={cx - 360} y={520}>
        <g>
          <rect x={-170} y={-200} width={340} height={360} rx={16} fill="#e4e9f2" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={-130 + (i % 3) * 95} y={-160 + Math.floor(i / 3) * 100} width={70} height={60} rx={6} fill="#fff" stroke="#b9c2d4" strokeWidth={3} />
          ))}
          <Txt x={0} y={200} size={28} color={C.inkSoft}>
            головная компания
          </Txt>
        </g>
      </Pop>
      {box > 0 && (
        <g transform={`translate(${cx + 220} 560) scale(${box})`}>
          <rect x={-300} y={-160} width={600} height={300} rx={26} fill="#f6e3b4" stroke={OL} strokeWidth={6} />
          <rect x={-300} y={-160} width={600} height={300} rx={26} fill="none" stroke={C.goldDeep} strokeWidth={8} strokeDasharray="22 14" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-160 + i * 160} ${-10 + Math.sin(t * 2 + i) * 8})`}>
              <Flask x={0} y={0} s={0.55} level={0.4 + i * 0.15} t={t + i} color={[C.teal, C.cyan, C.violet][i]} />
            </g>
          ))}
          <Txt x={0} y={-190} size={32}>
            «песочница» инноваций
          </Txt>
        </g>
      )}
      {report > 0 && (
        <g transform={`translate(${cx + 60} 860) scale(${report})`}>
          <Pill x={0} y={0} text="один отчёт: 5–10 действенных показателей" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={28} />
        </g>
      )}
      {stop > 0 && (
        <g transform={`translate(${cx - 360} 790) scale(${stop})`}>
          <circle r={64} fill={C.coral} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={12} size={30} color="#fff">
            стоп
          </Txt>
          <Txt x={130} y={10} size={26} color={C.coralDeep} anchor="start">
            резко негативно?
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── «Предприниматель — это должность»: визитка ──
export const BadgeCard: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.25));
  const flip = ramp(t, at(c, 0.55), 0.6);
  return (
    <g>
      <Pop t={t} at={0.15} x={cx} y={180}>
        <Pill x={0} y={0} text="«Предприниматель — это должность»" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={40} />
      </Pop>
      {k > 0 && (
        <g transform={`translate(${cx} 520) scale(${k}) rotate(${-4 + wob(t, 1, 1.5)})`}>
          <g transform={`scale(${Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))} 1)`}>
            <rect x={-360} y={-200} width={720} height={400} rx={26} fill="#fff" stroke={OL} strokeWidth={6} />
            {flip < 0.5 ? (
              <g>
                <Icon name="rocket" x={0} y={-20} s={2} color={C.coral} />
                <Txt x={0} y={150} size={34} color={C.inkSoft}>
                  бунтарь-одиночка?
                </Txt>
              </g>
            ) : (
              <g>
                <rect x={-360} y={-200} width={720} height={70} rx={26} fill={C.cyan} />
                <circle cx={-220} cy={30} r={80} fill={C.cyanLight} stroke={OL} strokeWidth={5} />
                <Icon name="person" x={-220} y={30} s={1.4} color={C.cyan} />
                <Txt x={110} y={10} size={44} anchor="middle">
                  Такой-то
                </Txt>
                <Txt x={110} y={80} size={40} anchor="middle" color={C.cyanDeep}>
                  Предприниматель
                </Txt>
              </g>
            )}
          </g>
        </g>
      )}
    </g>
  );
};

// ── эпилог: фабрика, которая эффективно делает ненужное ──
export const WasteFactory: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, at(c, 0.5));
  const pile = ramp(t, at(c, 1), 1.5);
  return (
    <g>
      <Belt x1={cx - 560} x2={cx + 300} y={720} t={t} speed={1.4} />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = cx - 520 + ((t * 120 + i * 150) % 820);
        return <Box key={i} x={x} y={720} s={0.9} color={C.greyLight} label="?" />;
      })}
      {/* гора ненужного */}
      <g transform={`translate(${cx + 450} 820)`}>
        {Array.from({ length: 10 }).map((_, i) => {
          const k = clamp01(pile * 10 - i);
          const row = Math.floor(i / 4);
          return <Box key={i} x={-120 + (i % 4) * 80 + row * 30} y={-row * 80} s={0.9 * k} color={C.greyLight} />;
        })}
        <Txt x={0} y={60} size={26} color={C.inkSoft}>
          не те товары
        </Txt>
      </g>
      {q > 0 && <QuoteCard x={cx} y={330} w={1100} h={300} text={"«Конечно же, нет ничего более бесполезного,\nчем эффективно делать то, что вообще\nделать не нужно»"} by="Питер Друкер, цит. по Э. Рису" k={q} size={40} accent={C.violet} />}
      <Pop t={t} at={at(c, 0.15)} x={cx - 420} y={150}>
        <Pill x={0} y={0} text="эпилог «Никаких потерь»" fill="#fff" size={30} />
      </Pop>
    </g>
  );
};

// ── не ритуал: ритуальные карточки рассыпаются, остаётся система ──
export const NoRitual: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const fall = ramp(t, at(c, 0.7), 1);
  const sys = pop(t, at(c, 1.2));
  const words = ["вираж ради виража", "MVP для галочки", "псевдонаука"];
  return (
    <g>
      {words.map((w, i) => {
        const k = pop(t, spread(c, 0, i, 3, 0.1, 0.55));
        const y = 330 + i * 120 + fall * fall * 600;
        return k > 0 ? (
          <g key={w} transform={`translate(${cx - 300 + i * 40} ${y}) rotate(${fall * (i - 1) * 40}) scale(${k})`} opacity={1 - fall}>
            <Pill x={0} y={0} text={w} fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={34} />
          </g>
        ) : null;
      })}
      {sys > 0 && (
        <g transform={`translate(${cx + 150} 520) scale(${sys})`}>
          <Card x={0} y={0} w={640} h={360} fill="#fff">
            <g transform={`rotate(${t * 30})`}>
              <circle r={90} fill="none" stroke={C.cyan} strokeWidth={22} strokeDasharray="120 40" />
            </g>
            <Txt x={0} y={-130} size={34}>
              «система, а не план,
            </Txt>
            <Txt x={0} y={150} size={34}>
              которому нужно следовать»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── наука — творчество: искра в колбе ──
export const ScienceSpark: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.3));
  const time = pop(t, at(c, 1.4));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 470) scale(${k})`}>
          <Flask x={0} y={60} s={2.1} level={0.45} t={t} color={C.cyan} />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + t * 0.8;
            const r = 220 + Math.sin(t * 3 + i) * 20;
            return <Spark key={i} x={Math.cos(a) * r} y={-40 + Math.sin(a) * r * 0.7} s={0.8} color={[C.gold, C.pink, C.teal][i % 3]} opacity={0.9} />;
          })}
          <Icon name="bulb" x={0} y={-90} s={1.4} color={C.yellow} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.6)} x={cx} y={170}>
        <Pill x={0} y={0} text="«Наука — одно из самых творческих занятий в мире»" fill="#fff" size={34} />
      </Pop>
      {time > 0 && (
        <g transform={`translate(${cx} 880) scale(${time})`}>
          <Pill x={0} y={0} text="меньше тратить впустую своё и чужое время" fill={C.yellow} size={32} />
        </g>
      )}
    </g>
  );
};

// ── честно о границах метода ──
export const Limits: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "money" as const, label: "не гарантирует\nприбыли", color: C.coral },
    { icon: "book" as const, label: "примеры книги —\nне 2026 год", color: C.gold },
    { icon: "clock" as const, label: "«экономичный»\n≠ «дешёвый»", color: C.cyan },
    { icon: "eye" as const, label: "видение и риск\nостаются", color: C.violet },
  ];
  const times = [at(c, 0.25), at(c, 0.65), at(c, 1.15), at(c, 1.6)];
  return (
    <g>
      <Header x={cx} y={160} text="Границы метода" t={t} size={58} under={C.coral} />
      {items.map((it, i) => (
        <IconCard key={i} x={cx - 465 + i * 310} y={500} w={290} h={300} icon={it.icon} label={it.label} k={pop(t, times[i])} color={it.color} size={27} />
      ))}
    </g>
  );
};

// ── тест должен вести к решению ──
export const TestToDecision: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const opts = [
    { label: "строить дальше", color: C.teal },
    { label: "менять курс", color: C.violet },
    { label: "остановиться", color: C.coral },
  ];
  const balloon = pop(t, at(c, 1.1));
  return (
    <g>
      <Pop t={t} at={at(c, 0.3)} x={cx - 380} y={480}>
        <Flask x={0} y={0} s={1.4} level={0.55} t={t} />
      </Pop>
      {opts.map((o, i) => {
        const k = pop(t, spread(c, 0, i, 3, 0.55, 0.95));
        return k > 0 ? (
          <g key={o.label}>
            <Arrow x1={cx - 250} y1={470} x2={cx - 30} y2={330 + i * 150} k={k} w={7} color={o.color} />
            <g transform={`translate(${cx + 170} ${330 + i * 150}) scale(${k})`}>
              <Pill x={0} y={0} text={o.label} fill="#fff" color={o.color} stroke={o.color} size={36} />
            </g>
          </g>
        ) : null;
      })}
      {balloon > 0 && (
        <g transform={`translate(${cx + 470} 330) scale(${balloon * 0.8})`}>
          <Balloon x={0} y={0} r={135} text={"опыт без\nрешения"} color={C.pink} t={t} size={34} />
        </g>
      )}
    </g>
  );
};

// ── тысяча комплиментов против десяти оплат ──
export const ComplimentsVsPay: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const words = ramp(t, 0.2, 1.4);
  const pays = pop(t, at(c, 0.7));
  const tilt = ramp(t, at(c, 0.8), 0.8);
  const quote = pop(t, at(c, 1.2));
  return (
    <g>
      {/* облако комплиментов */}
      <g transform={`translate(${cx - 300} 430)`}>
        {Array.from({ length: 14 }).map((_, i) => {
          const k = clamp01(words * 14 - i);
          const a = i * 2.4;
          return (
            <g key={i} transform={`translate(${Math.cos(a) * (60 + i * 12)} ${Math.sin(a) * (40 + i * 8) - tilt * 40}) scale(${0.5 * k})`} opacity={k * (1 - tilt * 0.4)}>
              <Icon name="heart" x={0} y={0} s={1} color={C.pink} />
            </g>
          );
        })}
        <Txt x={0} y={250} size={32} color={C.coralDeep}>
          1000 комплиментов = слова
        </Txt>
      </g>
      {pays > 0 && (
        <g transform={`translate(${cx + 300} ${430 + tilt * 30}) scale(${pays})`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i} transform={`translate(${-160 + (i % 5) * 80} ${-50 + Math.floor(i / 5) * 100})`}>
              <Icon name="person" x={0} y={0} s={0.7} color={C.teal} />
              <circle cx={24} cy={24} r={14} fill={C.gold} stroke={OL} strokeWidth={3} />
            </g>
          ))}
          <Txt x={0} y={220} size={32} color={C.tealDeep}>
            10 оплат = поведение
          </Txt>
        </g>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 860) scale(${quote})`}>
          <Pill x={0} y={0} text="«не то, что люди говорят, а то, что они делают»" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

// ── шаблон лаборатории: 1 гипотеза → 1 тест → 1 показатель → 1 решение ──
export const Template: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "bulb" as const, label: "1 гипотеза", color: C.cyan },
    { icon: "flask" as const, label: "1 тест", color: C.teal },
    { icon: "gear" as const, label: "1 показатель", color: C.gold },
    { icon: "flag" as const, label: "1 решение", color: C.violet },
  ];
  const write = ramp(t, at(c, 1), 1.2);
  return (
    <g>
      <Header x={cx} y={160} text="Шаблон лаборатории" t={t} size={56} />
      {items.map((it, i) => {
        const k = pop(t, spread(c, 0, i, 4, 0.3, 0.95));
        const x = cx - 465 + i * 310;
        return (
          <g key={i}>
            {i > 0 && <Arrow x1={x - 310 + 125} y1={420} x2={x - 140} y2={420} k={k} w={7} />}
            <IconCard x={x} y={420} w={250} h={230} icon={it.icon} label={it.label} k={k} color={it.color} size={30} />
          </g>
        );
      })}
      {write > 0 && (
        <g transform={`translate(${cx} 740)`} opacity={clamp01(write * 2)}>
          <rect x={-420} y={-90} width={840} height={180} rx={14} fill={C.cream} stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-370} y={-50 + i * 44} width={740 * clamp01(write * 3 - i)} height={14} rx={7} fill={C.inkSoft} opacity={0.6} />
          ))}
          <Txt x={0} y={140} size={28} color={C.inkSoft}>
            записать до начала эксперимента
          </Txt>
          <g transform={`translate(${-370 + 740 * clamp01(write)} ${-60 + 44 * Math.floor(clamp01(write) * 2.99)}) rotate(40)`}>
            <rect x={-8} y={-70} width={16} height={80} rx={4} fill={C.gold} stroke={OL} strokeWidth={3} />
          </g>
        </g>
      )}
    </g>
  );
};

// ── финальная заставка BanaMind ──
export const EndCard: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const back = pop(t, at(c, 0.2));
  const final = ramp(t, at(c, 1), 0.8);
  const logo = pop(t, at(c, 1.3));
  return (
    <g>
      {/* возврат к хуку: приложение → понимание клиента */}
      <g opacity={1 - final}>
        <Pop t={t} at={at(c, 0.2)} x={700} y={430}>
          <g>
            <rect x={-120} y={-220} width={240} height={440} rx={34} fill="#2b3550" stroke={OL} strokeWidth={6} />
            <rect x={-100} y={-190} width={200} height={380} rx={16} fill={C.cyanLight} />
            <Icon name="question" x={0} y={0} s={1.3} color={C.yellow} />
          </g>
        </Pop>
        {back > 0 && (
          <g transform={`translate(1420 430) scale(${back})`}>
            <Capsule x={0} y={0} w={460} h={140} text="проверить главное раньше" glow={0.6} color={C.teal} size={32} />
          </g>
        )}
      </g>
      {final > 0 && (
        <g opacity={final}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2 + t * 0.2;
            return <Drop key={i} x={1080 + Math.cos(a) * 640} y={420 + Math.sin(a) * 330} s={0.6} color={[C.teal, C.cyan, C.gold][i % 3]} />;
          })}
          <Txt x={1080} y={240} size={56}>
            не красивое приложение,
          </Txt>
          <text x={1080} y={330} textAnchor="middle" fontFamily={DISPLAY} fontSize={72} fill={C.tealDeep}>
            а понимание клиента
          </text>
        </g>
      )}
      {logo > 0 && (
        <g transform={`translate(1080 520) scale(${logo})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={OL}>
            {BRAND.wordmark[0]}
            <tspan fill={BRAND.yellow} stroke={OL} strokeWidth={3}>
              {BRAND.wordmark[1]}
            </tspan>
          </text>
          <text x={0} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.inkSoft}>
            Большие идеи. Простыми словами.
          </text>
        </g>
      )}
    </g>
  );
};


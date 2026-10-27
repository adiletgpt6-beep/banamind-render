// Препятствия, шаги и итог: пять препятствий на дороге, цыплёнок «Небо падает!»,
// лень-занятость, «сначала себе» в безопасной версии, две корзины знаний, лестница десяти
// шагов, сто человек, притча о печке, список дел, три типа дохода, три вопроса,
// три оговорки, монета-выбор и финальная заставка BanaMind.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, DISPLAY, HEAVY } from "../theme";
import { cxOf } from "./intro";
import { Bubble, Card, Coin, Flow, OL, Person, Pill, RiskMeter, Spark, Stamp } from "./draw";
import { Check, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── пять препятствий на дороге к колонке активов ──
const OBST = [
  { s: "страх", col: C.coral },
  { s: "пессимизм", col: C.grey },
  { s: "лень", col: C.violet },
  { s: "привычки", col: C.orange },
  { s: "высокомерие", col: C.skyDeep },
];
export const Obstacles: React.FC<VisualProps<P & { active: number }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const active = p.active;
  const road = ramp(t, 0.1, 0.8);
  const goal = pop(t, 0.5);
  const fearQ = active === 0 ? pop(t, at(c, 0.3)) : 0;
  const soft = active === 0 ? ramp(t, at(c, 1), 0.6) : 0;
  const ok = active === 0 ? ramp(t, at(c, 2), 0.5) : 0;
  return (
    <g>
      <path d={`M ${cx - 540} 640 L ${cx + 400} 640`} stroke="#d8c39a" strokeWidth={90 * road} strokeLinecap="round" />
      <path d={`M ${cx - 540} 640 L ${cx + 400} 640`} stroke="#fff" strokeWidth={6} strokeDasharray="26 22" opacity={road} />
      <g transform={`translate(${cx + 470} 600) scale(${goal})`}>
        <rect x={-70} y={-130} width={140} height={190} rx={14} fill={C.mintLight} stroke={C.mint} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <Coin key={i} x={0} y={20 - i * 40} r={30} />
        ))}
        <Txt x={0} y={100} size={26} weight={900} color={C.mintDeep}>
          активы
        </Txt>
      </g>
      {OBST.map((o, i) => {
        const k = active === -1 ? pop(t, at(c, 1) + i * 0.3) : 1;
        const on = active === -1 || active === i;
        const x = cx - 430 + i * 190;
        return (
          <g key={o.s} transform={`translate(${x} 640) scale(${k * (on && active >= 0 ? 1.12 : 1)})`} opacity={on ? 1 : 0.32}>
            <path d="M -70 30 L -50 -90 L 50 -90 L 70 30 Z" fill={o.col} stroke={OL} strokeWidth={5} />
            <rect x={-60} y={-60} width={120} height={22} fill="#fff" opacity={0.6} />
            <Pill x={0} y={-150 - (i % 2) * 60} text={o.s} fill="#fff" stroke={o.col} size={30} />
          </g>
        );
      })}
      {fearQ > 0 && (
        <g transform={`translate(${cx} 230) scale(${fearQ})`} opacity={1 - soft}>
          <Card x={0} y={0} w={1060} h={120} fill="#fff" stroke={C.coral}>
            <Txt x={0} y={-6} size={30} weight={900}>
              {"«Главная разница между богатыми и бедными\nсостоит в том, как они справляются со страхом»"}
            </Txt>
          </Card>
        </g>
      )}
      {soft > 0 && (
        <g opacity={soft}>
          <Card x={cx} y={300} w={1000} h={120} fill={C.mintLight} stroke={C.mint}>
            <Txt x={0} y={-6} size={30} weight={900} color={C.mintDeep}>
              {"если поражения сильно ранят:\nосторожно · сбалансированно · копить пораньше"}
            </Txt>
          </Card>
        </g>
      )}
      {ok > 0 && (
        <g transform={`translate(${cx} 820) scale(${ok})`}>
          <Pill x={0} y={0} text="«Бояться не стыдно»" fill={C.yellow} size={38} />
        </g>
      )}
    </g>
  );
};

// ── цыплёнок «Небо падает!» и шум против анализа ──
export const Chicken: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const sanders = ramp(t, at(c, 1), 0.6);
  const quote = pop(t, at(c, 2));
  const run = Math.sin(t * 6) * 40 * (1 - sanders);
  const no = Math.floor(clamp01(ramp(t, at(c, 1.2), Math.max(1, at(c, 1.9) - at(c, 1.2)))) * 1009);
  return (
    <g>
      {/* шумные облака-новости */}
      {["кризис!", "всё рухнет!", "а что, если…?"].map((s, i) => (
        <g key={s} transform={`translate(${cx - 380 + i * 320 + wob(t, i, 10)} ${190 + (i % 2) * 70})`} opacity={(1 - sanders * 0.8) * k}>
          <ellipse rx={150} ry={62} fill="#e3e6ee" stroke={C.grey} strokeWidth={4} />
          <Txt x={0} y={12} size={30} weight={900} color={C.inkSoft}>
            {s}
          </Txt>
        </g>
      ))}
      {/* цыплёнок */}
      <g transform={`translate(${cx - 200 + run} ${600 - Math.abs(Math.sin(t * 12)) * 18 * (1 - sanders)}) scale(${k})`} opacity={1 - sanders * 0.6}>
        <ellipse cx={0} cy={0} rx={80} ry={70} fill="#ffe066" stroke={OL} strokeWidth={6} />
        <circle cx={50} cy={-70} r={44} fill="#ffe066" stroke={OL} strokeWidth={6} />
        <path d="M 88 -72 L 116 -62 L 88 -54 Z" fill={C.orange} stroke={OL} strokeWidth={4} />
        <circle cx={62} cy={-80} r={8} fill={OL} />
        <path d="M 40 -112 q 6 -24 14 0 q 6 -24 14 0" fill={C.coral} stroke={OL} strokeWidth={4} />
        <path d="M -20 66 L -30 110 M 20 66 L 30 110" stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
        <path d={`M -60 -10 q -60 ${-30 + Math.sin(t * 20) * 20} -50 40`} fill="#ffd43b" stroke={OL} strokeWidth={5} />
      </g>
      <g transform={`translate(${cx - 10} 420) scale(${k})`} opacity={1 - sanders}>
        <Bubble x={0} y={0} w={330} h={100} text="Небо падает!" size={36} fill={C.coralLight} tail="left" />
      </g>
      {sanders > 0 && (
        <g opacity={sanders}>
          <Person kind="old" x={cx + 280} y={720} s={1} t={t} mood="happy" arm="hold" color="#f4f4f8" />
          <Pill x={cx + 280} y={790} text="полковник Сандерс" size={28} />
          <g transform={`translate(${cx + 280} 300)`}>
            <rect x={-150} y={-60} width={300} height={120} rx={16} fill="#fff" stroke={C.coral} strokeWidth={5} />
            <text x={0} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill={C.coralDeep}>
              {`${no} «нет»`}
            </text>
          </g>
          {no >= 1009 && <Pill x={cx + 280} y={420} text="и одно «да»" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={32} />}
        </g>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 870) scale(${quote})`}>
          <Card x={0} y={0} w={960} h={100} fill={C.yellow}>
            <Txt x={0} y={14} size={32} weight={900}>
              «Пессимисты критикуют, а победители анализируют»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── лень под видом занятости; две двери-фразы ──
export const BusyLazy: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const doors = ramp(t, at(c, 1), 0.6);
  const open = ramp(t, at(c, 1.5), 0.8);
  return (
    <g>
      <g opacity={1 - doors}>
        <Person kind="man" x={cx - 330} y={720} s={1} t={t * 3} mood="calm" arm="out" />
        {["отчёт", "почта", "звонок", "сериал", "покупки"].map((s, i) => {
          const a = t * 1.6 + (i / 5) * Math.PI * 2;
          return <Pill key={s} x={cx - 330 + Math.cos(a) * 260} y={480 + Math.sin(a) * 140} text={s} fill="#fff" stroke={C.violet} size={26} />;
        })}
        <g transform={`translate(${cx + 220} 240) scale(${k})`}>
          <Card x={0} y={0} w={640} h={120} fill="#fff" stroke={C.violet}>
            <Txt x={0} y={-6} size={30} weight={900}>
              {"«Самые занятые люди\nобычно самые ленивые»"}
            </Txt>
          </Card>
        </g>
      </g>
      {doors > 0 && (
        <g opacity={doors}>
          {[0, 1].map((i) => {
            const x = cx - 260 + i * 520;
            const op = i === 1 ? open : 0;
            return (
              <g key={i}>
                <rect x={x - 150} y={300} width={300} height={440} rx={14} fill={i ? C.mintLight : "#d9dde6"} stroke={OL} strokeWidth={6} />
                {i === 1 && op > 0 && (
                  <g opacity={op}>
                    {[0, 1, 2].map((j) => (
                      <Spark key={j} x={x - 60 + j * 60} y={420 + (j % 2) * 80} s={0.9} />
                    ))}
                  </g>
                )}
                <path d={`M ${x - 150} 300 L ${x - 150 + 300 * (1 - op * 0.7)} ${300 + op * 30} L ${x - 150 + 300 * (1 - op * 0.7)} ${740 - op * 30} L ${x - 150} 740 Z`} fill={i ? "#b97a45" : "#8d8d8d"} stroke={OL} strokeWidth={5} />
                <g transform={`translate(${x} 230)`}>
                  <Bubble x={0} y={0} w={460} h={110} text={i ? "«Как я могу это\nсебе позволить?»" : "«Я не могу этого\nсебе позволить»"} size={28} fill={i ? C.mintLight : "#eef0f5"} tail="none" />
                </g>
                {i === 0 && <Cross x={x} y={520} s={90} k={ramp(t, at(c, 1.3), 0.4)} />}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── «сначала заплатите себе» — безопасная версия ──
export const PayFirst: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, 0.2);
  const flow = ramp(t, at(c, 1), 1);
  const warn = ramp(t, at(c, 2), 0.5);
  const safe = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(${cx} 150) scale(${q})`} opacity={1 - safe * 0.6}>
          <Card x={0} y={0} w={1000} h={120} fill="#fff" stroke={C.orange}>
            <Txt x={0} y={-6} size={30} weight={900}>
              {"«Наша жизнь является отражением\nне столько образования, сколько привычек»"}
            </Txt>
          </Card>
        </g>
      )}
      {/* доход → сначала в активы, потом всё остальное */}
      <g transform={`translate(${cx - 430} 480)`}>
        <rect x={-110} y={-80} width={220} height={160} rx={18} fill={C.skyLight} stroke={C.sky} strokeWidth={6} />
        <Txt x={0} y={12} size={34} weight={900} color={C.skyDeep}>
          доход
        </Txt>
      </g>
      {flow > 0 && (
        <g>
          <Flow pts={[[cx - 320, 450], [cx - 40, 340]]} t={t} k={flow} color={C.mint} w={12} n={3} />
          <Flow pts={[[cx - 320, 510], [cx - 40, 620]]} t={t} k={ramp(t, at(c, 1.3), 0.8)} color={safe > 0 ? C.sky : C.coral} w={12} n={4} />
          <g transform={`translate(${cx + 120} 330)`}>
            <rect x={-150} y={-70} width={300} height={140} rx={18} fill={C.mintLight} stroke={C.mint} strokeWidth={6} />
            <Txt x={0} y={-10} size={30} weight={900} color={C.mintDeep}>
              {safe > 0 ? "1 · счета и налоги" : "1 · себе"}
            </Txt>
            <Txt x={0} y={34} size={24} color={C.inkSoft}>
              {safe > 0 ? "вовремя" : "колонка активов"}
            </Txt>
          </g>
          <g transform={`translate(${cx + 120} 630)`}>
            <rect x={-150} y={-70} width={300} height={140} rx={18} fill={safe > 0 ? C.goldLight : C.coralLight} stroke={safe > 0 ? C.gold : C.coral} strokeWidth={6} />
            <Txt x={0} y={-10} size={30} weight={900} color={OL}>
              {safe > 0 ? "2 · сразу часть" : "2 · остальным"}
            </Txt>
            <Txt x={0} y={34} size={24} color={C.inkSoft}>
              {safe > 0 ? "резерв или учёба" : "счета и платежи"}
            </Txt>
          </g>
        </g>
      )}
      {warn > 0 && safe <= 0 && (
        <g opacity={warn}>
          <Stamp x={cx + 420} y={480} text="СЧЕТА ПЛАТИТЬ!" k={warn} color={C.coralDeep} size={32} rot={-8} />
          <Pill x={cx + 420} y={600} text="правило № 1: без долгов" fill={C.yellow} size={28} />
        </g>
      )}
      {safe > 0 && (
        <g opacity={safe}>
          <Pill x={cx + 450} y={480} text="безопасная версия" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />
          <Check x={cx + 450} y={580} s={60} k={safe} />
          <Txt x={cx + 120} y={800} size={30} color={C.inkSoft} weight={900}>
            а не «что останется»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── высокомерие: две корзины «знаю / не знаю» ──
export const KnowBaskets: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const help = ramp(t, at(c, 1), 0.6);
  const Basket: React.FC<{ x: number; label: string; col: string; light: string; lose?: boolean }> = ({ x, label, col, light, lose }) => (
    <g transform={`translate(${x} 560) scale(${k})`}>
      <path d="M -150 -60 L 150 -60 L 120 110 L -120 110 Z" fill={light} stroke={col} strokeWidth={7} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-130 + i * 10} y1={-20 + i * 40} x2={130 - i * 10} y2={-20 + i * 40} stroke={col} strokeWidth={3} opacity={0.5} />
      ))}
      <Pill x={0} y={-130} text={label} fill="#fff" stroke={col} size={32} />
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.7 + i / 3) % 1;
        return lose ? <Coin key={i} x={-40 + i * 40} y={60 + ph * 220} r={24} dim /> : <Coin key={i} x={-60 + i * 60} y={-200 + ph * 200} r={26} spin={t * 3 + i} />;
      })}
    </g>
  );
  return (
    <g>
      <Basket x={cx - 260} label="знаю → деньги" col={C.mint} light={C.mintLight} />
      <Basket x={cx + 260} label="не знаю → потери" col={C.coral} light={C.coralLight} lose />
      {help > 0 && (
        <g opacity={help}>
          <Pill x={cx - 230} y={850} text="специалист" fill="#fff" stroke={C.sky} size={32} />
          <Pill x={cx + 170} y={850} text="хорошая книга" fill="#fff" stroke={C.sky} size={32} />
        </g>
      )}
    </g>
  );
};

// ── лестница десяти шагов; история о трёх тысячах ──
const STEPS = ["причина", "выбор", "окружение", "новые формулы", "самодисциплина", "советники", "возврат вложенного", "роскошь — на доход", "герои", "учить и отдавать"];
export const TenSteps: React.FC<VisualProps<P & { from: number; to: number; story?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const teen = p.story === "teen";
  const storyK = teen ? ramp(t, at(c, 1), 0.6) : 0;
  const x0 = cx - 520;
  return (
    <g>
      <g opacity={1 - storyK * 0.75}>
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < p.from;
          const cur = n >= p.from && n <= p.to;
          const k = cur ? pop(t, at(c, Math.min(c.beats.length - 1, Math.floor(((n - p.from) * (teen ? 1 : c.beats.length)) / (p.to - p.from + 1))))) : 1;
          const x = x0 + i * 112;
          const y = 820 - i * 52;
          return (
            <g key={s} opacity={done ? 0.55 : cur ? 1 : 0.25}>
              <rect x={x - 50} y={y} width={104} height={900 - y} fill={cur ? C.goldLight : done ? C.mintLight : "#fff"} stroke={OL} strokeWidth={4} />
              <g transform={`translate(${x + 2} ${y - 40}) scale(${cur ? 0.6 + 0.4 * k : 0.8})`}>
                <circle r={32} fill={cur ? C.gold : done ? C.mint : "#eef1f6"} stroke={OL} strokeWidth={4} />
                <text x={0} y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={OL}>
                  {n}
                </text>
              </g>
              {done && <Check x={x + 2} y={y + 40} s={22} k={1} />}
            </g>
          );
        })}
        {/* названия текущих шагов — крупным списком */}
        {STEPS.map((s, i) => {
          const n = i + 1;
          if (n < p.from || n > p.to) return null;
          const j = n - p.from;
          const k = pop(t, at(c, Math.min(c.beats.length - 1, teen ? 0 : j)));
          return (
            <g key={s} transform={`translate(${x0 + 40} ${250 + j * 95}) scale(${k})`}>
              <circle cx={0} cy={-10} r={34} fill={C.gold} stroke={OL} strokeWidth={4} />
              <text x={0} y={3} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={OL}>
                {n}
              </text>
              <Txt x={56} y={2} size={40} weight={900} anchor="start">
                {s}
              </Txt>
            </g>
          );
        })}
      </g>
      {teen && storyK > 0 && (
        <g opacity={storyK}>
          <Person kind="kid" x={cx - 380} y={720} s={1.1} t={t} mood={ramp(t, at(c, 2.3), 0.6) > 0.5 ? "happy" : "calm"} />
          {/* машина-мечта и газета с графиками */}
          <g transform={`translate(${cx - 380} 330)`}>
            <Bubble x={0} y={0} w={300} h={100} text="хочу машину!" size={30} fill="#fff" />
          </g>
          <g transform={`translate(${cx + 120} 420)`}>
            <Card x={0} y={0} w={420} h={300} fill="#fff">
              <Txt x={0} y={-100} size={28} weight={900}>
                фондовый рынок
              </Txt>
              <path d={`M -170 80 L -100 20 L -40 50 L 30 -40 L 90 30 L 160 ${60 - 20 * Math.sin(t)}`} fill="none" stroke={C.sky} strokeWidth={8} strokeLinejoin="round" />
            </Card>
          </g>
          {/* счётчик денег падает, интерес растёт */}
          {(() => {
            const loss = ramp(t, at(c, 2), 1.4);
            const money = Math.round(3000 - 2000 * loss);
            return (
              <g>
                <Pill x={cx + 450} y={330} text={`${money.toLocaleString("ru-RU")} $`} fill={loss > 0.5 ? C.coralLight : C.goldLight} size={34} />
                <g transform={`translate(${cx + 450} 470)`}>
                  <rect x={-40} y={-80} width={80} height={200} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
                  <rect x={-30} y={110 - 180 * (0.2 + loss * 0.8)} width={60} height={180 * (0.2 + loss * 0.8)} rx={8} fill={C.violet} transform="translate(0 0)" />
                  <Txt x={0} y={160} size={26} weight={900} color={C.violet}>
                    интерес
                  </Txt>
                </g>
              </g>
            );
          })()}
          <Stamp x={cx + 160} y={800} text="СПОРНЫЙ ЭКСПЕРИМЕНТ" k={ramp(t, at(c, 3), 0.4)} color={C.coralDeep} size={30} rot={-4} />
        </g>
      )}
    </g>
  );
};

// ── сто человек и десять тысяч: 80 / 16 / 4 (оценка автора) ──
export const Hundred: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const show = ramp(t, 0.2, 1.2);
  const split = ramp(t, at(c, 1), 1.4);
  const note = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <Pill x={cx} y={150} text="каждому — по 10 000 $" fill={C.goldLight} size={36} />
      {Array.from({ length: 100 }).map((_, i) => {
        const col = i < 80 ? C.grey : i < 96 ? C.yellow : C.gold;
        const on = i < show * 100;
        const x = cx - 470 + (i % 20) * 50;
        const y = 290 + Math.floor(i / 20) * 80;
        const c2 = split > (i < 80 ? 0.1 : i < 96 ? 0.5 : 0.85) ? col : C.sky;
        return on ? (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle cy={-22} r={13} fill={c2} stroke={OL} strokeWidth={3} />
            <rect x={-13} y={-8} width={26} height={30} rx={10} fill={c2} stroke={OL} strokeWidth={3} />
          </g>
        ) : null;
      })}
      {split > 0.2 && (
        <g opacity={split}>
          <Pill x={cx - 380} y={760} text="80 — ничего" fill={C.greyLight} color={C.inkSoft} stroke={C.grey} size={30} />
          <Pill x={cx + 20} y={760} text="16 — немного больше" fill={C.goldLight} size={30} />
          <Pill x={cx + 420} y={760} text="4 — гораздо больше" fill={C.gold} size={30} />
        </g>
      )}
      <Stamp x={cx} y={860} text="ОЦЕНКА АВТОРА, НЕ ИССЛЕДОВАНИЕ" k={note} color={C.skyDeep} size={28} rot={-2} />
    </g>
  );
};

// ── притча о печке ──
export const Stove: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = pop(t, at(c, 0.1));
  const night = ramp(t, at(c, 1), 0.8);
  const shout = pop(t, at(c, 2));
  const fire = ramp(t, at(c, 3.3), 1.2);
  const shiver = Math.sin(t * 30) * 3 * (1 - fire);
  return (
    <g>
      {steps > 0 && night < 1 && (
        <g opacity={1 - night}>
          <Pill x={cx - 200} y={300} text="9 · герои" fill="#fff" stroke={C.gold} size={34} />
          <Pill x={cx + 200} y={300} text="10 · учить и отдавать" fill="#fff" stroke={C.gold} size={34} />
        </g>
      )}
      {night > 0 && (
        <g opacity={night}>
          {/* морозная ночь — светлый, но холодный кадр */}
          <rect x={cx - 560} y={150} width={1120} height={720} rx={30} fill={fire > 0.3 ? "#fff1df" : "#e3eefb"} stroke={OL} strokeWidth={5} />
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={cx - 520 + ((i * 83 + t * 30) % 1040)} cy={190 + ((i * 47 + t * 60) % 300)} r={5} fill="#fff" stroke="#bcd" strokeWidth={2} opacity={1 - fire} />
          ))}
          {/* печка */}
          <g transform={`translate(${cx + 220} 760)`}>
            <rect x={-150} y={-260} width={300} height={260} rx={20} fill="#c4622d" stroke={OL} strokeWidth={6} />
            <rect x={-40} y={-460} width={80} height={200} fill="#9a4a22" stroke={OL} strokeWidth={6} />
            <rect x={-100} y={-180} width={200} height={130} rx={14} fill="#3b2a20" stroke={OL} strokeWidth={5} />
            {fire > 0 &&
              [0, 1, 2].map((i) => (
                <path key={i} d={`M ${-50 + i * 50} -60 q -20 -40 0 ${-70 - 15 * Math.sin(t * 8 + i)} q 20 30 0 70 z`} fill={i === 1 ? C.yellow : C.orange} opacity={fire} />
              ))}
          </g>
          {/* человек с охапкой хвороста */}
          <g transform={`translate(${cx - 220 + shiver} 0)`}>
            <Person kind="man" x={0} y={760} s={1} t={t} mood={fire > 0.5 ? "happy" : "angry"} arm={shout > 0 && fire < 0.3 ? "point" : "hold"} />
            <g transform={`translate(${fire > 0 ? 40 + fire * 300 : 40} ${600 - (fire > 0 ? fire * 40 : 0)})`} opacity={1 - clamp01((fire - 0.7) * 3)}>
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={-80} y={i * 12 - 20} width={160} height={14} rx={7} fill="#8a5a2b" stroke={OL} strokeWidth={3} transform={`rotate(${-8 + i * 5})`} />
              ))}
            </g>
          </g>
          {shout > 0 && fire < 0.5 && (
            <g transform={`translate(${cx - 120} 300) scale(${shout})`}>
              <Bubble x={0} y={0} w={680} h={130} text={"«Я положу в тебя дрова,\nкогда ты меня согреешь!»"} size={34} fill={C.coralLight} tail="left" />
            </g>
          )}
          {fire > 0.5 && <Pill x={cx} y={250} text="сначала вложить — потом тепло" fill={C.yellow} size={34} />}
        </g>
      )}
    </g>
  );
};

// ── список дел главы 9 + граница переноса ──
export const TodoList: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = ["остановиться и оценить", "искать новые идеи", "найти того, кто уже делал", "курсы и книги", "смотреть на рынок сам"];
  const beatOf = [0.2, 0.5, 0.8, 1.2, 1.5];
  const act = pop(t, at(c, 1.6));
  const usa = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <Card x={cx - 120} y={470} w={700} h={600} fill="#fffdf6">
        {items.map((s, i) => {
          const k = ramp(t, at(c, beatOf[i]), 0.4);
          return (
            <g key={s} opacity={0.3 + 0.7 * k}>
              <rect x={-300} y={-240 + i * 96} width={52} height={52} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
              <Check x={-274} y={-212 + i * 96} s={24} k={k} />
              <Txt x={-220} y={-200 + i * 96} size={32} weight={800} anchor="start">
                {s}
              </Txt>
            </g>
          );
        })}
      </Card>
      {act > 0 && (
        <g transform={`translate(${cx + 400} 300) scale(${act})`}>
          <Card x={0} y={0} w={380} h={170} fill={C.yellow}>
            <Txt x={0} y={-10} size={32} weight={900}>
              {"«Действие всегда\nлучше бездействия»"}
            </Txt>
          </Card>
        </g>
      )}
      {usa > 0 && (
        <g opacity={usa}>
          <Stamp x={cx + 400} y={620} text="США ПРОШЛЫХ ЛЕТ" k={usa} color={C.coralDeep} size={30} rot={-6} />
          <Txt x={cx + 400} y={720} size={28} weight={900} color={C.coralDeep}>
            {"сделки не переносить\nбуквально"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── три типа дохода ──
export const ThreeIncomes: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const types = [
    { s: "трудовой", d: "вы работаете за деньги", col: C.sky },
    { s: "портфельный", d: "ценные бумаги", col: C.violet },
    { s: "пассивный", d: "чаще — недвижимость", col: C.mint },
  ];
  const turn = ramp(t, at(c, 2), 1.2);
  const tax = ramp(t, at(c, 2.6), 0.5);
  return (
    <g>
      {types.map((ty, i) => {
        const k = pop(t, at(c, 0.25 + i * 0.25));
        const x = cx - 360 + i * 360;
        return (
          <g key={ty.s} transform={`translate(${x} 380) scale(${k})`}>
            <Card x={0} y={0} w={320} h={260} fill="#fff" stroke={ty.col}>
              <circle cx={0} cy={-60} r={46} fill={ty.col} />
              <Coin x={0} y={-60} r={26} spin={t * (i + 1)} />
              <Txt x={0} y={30} size={36} weight={900}>
                {ty.s}
              </Txt>
              <Txt x={0} y={80} size={24} color={C.inkSoft}>
                {ty.d}
              </Txt>
            </Card>
          </g>
        );
      })}
      {turn > 0 && (
        <g opacity={turn}>
          <Flow pts={[[cx - 360, 540], [cx - 360, 620], [cx + 360, 620], [cx + 360, 540]]} t={t} k={turn} color={C.gold} w={12} n={5} />
          <Flow pts={[[cx - 360, 620], [cx, 620], [cx, 540]]} t={t} k={turn} color={C.gold} w={12} n={3} />
          <Pill x={cx} y={700} text="постепенно превращать часть трудового дохода" fill={C.goldLight} size={28} />
        </g>
      )}
      {tax > 0 && <Stamp x={cx} y={820} text="НАЛОГИ — ПО ЗАКОНАМ ВАШЕЙ СТРАНЫ" k={tax} color={C.skyDeep} size={28} rot={-2} />}
    </g>
  );
};

// ── три безопасных вопроса ──
export const ThreeQuestions: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const qs = [
    { q: "Куда ушли мои деньги\nв этом месяце?", d: "записать доходы и расходы", col: C.sky, b: 1 },
    { q: "Какой навык я развиваю\nв этом году?", d: "продажи · общение · учёт · ремесло", col: C.violet, b: 2 },
    { q: "Какой риск я могу\nсебе позволить?", d: "не последние деньги · без долгов", col: C.coral, b: 3 },
  ];
  return (
    <g>
      <Pill x={cx} y={140} text="три безопасных вопроса" fill={C.yellow} size={38} />
      {qs.map((q, i) => {
        const k = pop(t, at(c, q.b));
        const y = 290 + i * 190;
        return (
          <g key={i} transform={`translate(${cx} ${y}) scale(${k})`}>
            <Card x={0} y={0} w={1000} h={160} fill="#fff" stroke={q.col}>
              <circle cx={-420} cy={0} r={48} fill={q.col} />
              <text x={-420} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#fff">
                {i + 1}
              </text>
              <Txt x={-340} y={-22} size={34} weight={900} anchor="start">
                {q.q}
              </Txt>
              <Txt x={460} y={50} size={24} color={C.inkSoft} anchor="end">
                {q.d}
              </Txt>
            </Card>
            {i === 2 && <RiskMeter x={380} y={-20} level={0.25} k={k} s={0.5} />}
          </g>
        );
      })}
    </g>
  );
};

// ── три честные оговорки ──
export const Caveats: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { s: "модель,\nне бухгалтерия", icon: "≈", col: C.sky },
    { s: "истории,\nне гарантии", icon: "!", col: C.orange },
    { s: "другие страны,\nдругие законы", icon: "§", col: C.violet },
  ];
  return (
    <g>
      <Pill x={cx} y={150} text="три честные оговорки" fill="#fff" stroke={C.skyDeep} color={C.skyDeep} size={38} />
      {items.map((it, i) => {
        const k = pop(t, at(c, i));
        const x = cx - 350 + i * 350;
        return (
          <g key={i} transform={`translate(${x} 470) scale(${k}) rotate(${(i - 1) * 2})`}>
            <Card x={0} y={0} w={320} h={400} fill="#fff" stroke={it.col}>
              <circle cx={0} cy={-90} r={70} fill={it.col} />
              <text x={0} y={-62} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill="#fff">
                {it.icon}
              </text>
              <Txt x={0} y={60} size={32} weight={900}>
                {it.s}
              </Txt>
            </Card>
          </g>
        );
      })}
      <Stamp x={cx} y={790} text="ОБЗОР КНИГИ, НЕ КОНСУЛЬТАЦИЯ" k={ramp(t, at(c, 2.4), 0.4)} color={C.coralDeep} size={30} rot={-2} />
    </g>
  );
};

// ── монета на ладони: каждый доллар — выбор ──
export const CoinChoice: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const coin = pop(t, 0.2);
  const frost = ramp(t, at(c, 1), 1);
  const paths = ramp(t, at(c, 0.6), 1.2);
  const final = ramp(t, at(c, 2), 0.6);
  const ends = [
    { x: 260, y: 300, s: "страхи", col: C.coral },
    { x: 1660, y: 300, s: "ваши цели", col: C.mint },
  ];
  return (
    <g>
      {/* две дороги от центра (банан в центре) */}
      {ends.map((e, i) => (
        <Flow key={i} pts={[[960 + (i ? 200 : -200), 860], [e.x + (i ? -120 : 120), 640], [e.x, e.y + 70]]} t={t} k={paths} color={e.col} w={14} n={5} dots={i === 1 || final < 0.5} />
      ))}
      {ends.map((e, i) => (
        <g key={e.s} opacity={paths}>
          <Pill x={e.x} y={e.y} text={e.s} fill={i ? C.mintLight : C.coralLight} color={i ? C.mintDeep : C.coralDeep} stroke={e.col} size={38} />
        </g>
      ))}
      {coin > 0 && (
        <g transform={`translate(960 150) scale(${coin})`}>
          <Coin x={0} y={0} r={70} spin={t * 1.5} face />
          {[0, 1, 2, 3].map((i) => (
            <Spark key={i} x={Math.cos(i * 1.6 + t) * 110} y={Math.sin(i * 1.6 + t) * 70} s={0.6} />
          ))}
        </g>
      )}
      {frost > 0 && (
        <g opacity={frost * (1 - final * 0.7)}>
          <Card x={420} y={520} w={540} h={130} fill="#fff">
            <Txt x={0} y={-6} size={28} weight={900}>
              {"«И это решило\nвсе остальное…»"}
            </Txt>
          </Card>
        </g>
      )}
      {final > 0 && (
        <g transform={`translate(1500 560) scale(${final})`}>
          <Card x={0} y={0} w={560} h={150} fill={C.yellow}>
            <Txt x={0} y={-6} size={30} weight={900}>
              {"каждая монета —\nна ваши цели"}
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── финальная заставка BanaMind ──
export const EndCard: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const k = pop(t, 0.2);
  const s2 = pop(t, 0.7);
  return (
    <g>
      <g transform={`translate(960 200) scale(${k})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={DISPLAY} fontSize={120} fill={OL}>
          {BRAND.wordmark[0]}
          <tspan fill={C.goldDeep}>{BRAND.wordmark[1]}</tspan>
        </text>
      </g>
      <g transform={`translate(960 285) scale(${s2})`}>
        <Txt x={0} y={0} size={44} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </g>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.35;
        return <Coin key={i} x={960 + Math.cos(a) * 620} y={640 + Math.sin(a) * 210} r={30} spin={t * 2 + i} />;
      })}
      <Pop t={t} at={1.2} x={420} y={760}>
        <Txt x={0} y={0} size={28} color={C.inkSoft}>
          по книге Р. Кийосаки
        </Txt>
      </Pop>
      <Pop t={t} at={1.4} x={1500} y={760}>
        <Txt x={0} y={0} size={28} color={C.inkSoft}>
          обзор, не консультация
        </Txt>
      </Pop>
    </g>
  );
};

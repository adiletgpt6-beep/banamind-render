// Итоги: наследие и эстафета, честное «сито», пять шагов на неделю, четыре принципа,
// прощание BanaMind.
import React from "react";
import { C, FONT } from "../theme";
import { zoneX } from "./hook";
import { ACRONYMS, WordTiles } from "./image";
import { Heart, OL, Sprout, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

export const Legacy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const calm = pop(t, 0.2);
  const gift = ramp(t, at(c, 1), 1);
  const q = pop(t, at(c, 2));
  const relay = ramp(t, at(c, 3), 3);
  const people = 5;
  return (
    <g>
      {/* мягкий закат: грустный, но тёплый финал */}
      <circle cx={cx} cy={760} r={280} fill={C.orange} opacity={0.18 * calm} />
      {Array.from({ length: people }).map((_, i) => {
        const x = cx - 500 + i * 250;
        const has = relay * (people - 1);
        return (
          <g key={i}>
            <Worker x={x} y={760} s={1.15} role="plain" color={[C.violet, C.teal, C.coral, C.sky, C.green][i]} t={t + i} arms={Math.abs(has - i) < 0.6 ? 0.7 : 0.1} />
            {i < people - 1 && relay > 0 && (
              <Sprout x={x + 125} y={800} s={0.9} grow={clamp01(has - i)} t={t} color={C.yellow} />
            )}
          </g>
        );
      })}
      {/* «семена» переходят из рук в руки */}
      {relay > 0 && (
        <g transform={`translate(${cx - 500 + relay * 4 * 250} ${640 - Math.abs(Math.sin(relay * 4 * Math.PI)) * 60})`}>
          <circle r={26} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <path d="M -8 -2 Q 0 -16 8 -2 Q 0 10 -8 -2 Z" fill={C.greenDeep} />
        </g>
      )}
      {gift > 0 && relay < 0.2 && (
        <g transform={`translate(${cx - 500} 560)`} opacity={gift * (1 - relay * 5)}>
          <Heart x={0} y={0} s={1.1} />
          <Tag x={0} y={-90} text="последние силы — на уроки" size={28} color="#fff" />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(${cx} 260) scale(${q})`}>
          <rect x={-420} y={-60} width={840} height={110} rx={40} fill={C.ink} />
          <Txt x={0} y={14} size={38} color="#fff">
            что останется после нас?
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 3.3)} x={cx} y={420}>
        <Tag x={0} y={0} text="получил идею — передай дальше" size={34} color={C.yellow} />
      </Pop>
    </g>
  );
};

export const Sieve: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sieve = pop(t, 0.2);
  const promises = ["успех гарантирован", "деньги придут сами", "мысль материальна", "всем в 5 утра", "советы о еде"];
  const keep = ["отвечать за свою часть", "делать работу хорошо", "уважать людей", "беречь себя"];
  const drop = ramp(t, at(c, 2.6), 2);
  const help = ramp(t, at(c, 3), 0.6);
  const core = ramp(t, at(c, 4), 1.2);
  const shake = Math.sin(t * 10) * 6 * (drop > 0 && drop < 1 ? 1 : 0);
  return (
    <g>
      <Pop t={t} at={0.3} x={cx} y={190}>
        <Tag x={0} y={0} text="мотивационная притча, не исследование" size={34} color="#fff" />
      </Pop>
      {/* сито */}
      <g transform={`translate(${cx + shake} 520) scale(${sieve})`}>
        <path d="M -340 -40 L 340 -40 L 260 120 L -260 120 Z" fill="#e9eef5" stroke={OL} strokeWidth={6} />
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={-230 + (i % 10) * 51} cy={20 + Math.floor(i / 10) * 32} r={8} fill="#b9c3d3" />
        ))}
        <rect x={340} y={-58} width={160} height={30} rx={14} fill={C.wood} stroke={OL} strokeWidth={4} />
      </g>
      {/* обещания сначала лежат на сите, потом проваливаются сквозь него */}
      {promises.map((p, i) => {
        const k = pop(t, at(c, 1.1) + i * 0.3);
        if (k <= 0.001) return null;
        const fall = ramp(t, at(c, 2.6) + i * 0.2, 1.3);
        const x = cx - 360 + (i % 3) * 360 + (i >= 3 ? 180 : 0);
        const y = (i >= 3 ? 330 : 400) + fall * 470;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${fall * (i % 2 ? 25 : -25)}) scale(${k})`} opacity={1 - clamp01((fall - 0.6) * 2.5)}>
            <rect x={-160} y={-30} width={320} height={56} rx={28} fill="#ffe3e3" stroke={C.red} strokeWidth={3} />
            <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.red}>
              {p}
            </text>
          </g>
        );
      })}
      {drop > 0.2 && core < 1 && (
        <g transform={`translate(${cx + 330} 760)`} opacity={drop * (1 - core)}>
          <Tag x={0} y={0} text="проверять, а не верить" size={30} color="#ffe2c7" />
        </g>
      )}
      {help > 0 && core < 1 && (
        <g transform={`translate(${cx - 330} 740)`} opacity={help * (1 - core)}>
          <Heart x={0} y={-20} s={0.8} />
          <Tag x={0} y={60} text="тяжело — к специалисту" size={28} color="#fff" />
        </g>
      )}
      {/* полезное остаётся сверху */}
      {core > 0 &&
        keep.map((k, i) => (
          <g key={i} transform={`translate(${cx - 330 + (i % 2) * 660} ${300 + Math.floor(i / 2) * 110 - (1 - core) * 40}) scale(${pop(t, at(c, 4.1) + i * 0.2)})`}>
            <rect x={-290} y={-40} width={580} height={78} rx={39} fill={C.yellow} stroke={OL} strokeWidth={3} />
            <Check x={-250} y={0} s={24} k={1} />
            <Txt x={20} y={12} size={32}>
              {k}
            </Txt>
          </g>
        ))}
    </g>
  );
};

const STEPS = [
  { label: "что улучшить сегодня?", color: C.skyDeep },
  { label: "пять маленьких целей", color: C.violet },
  { label: "разговор лично — больше слушать", color: C.green },
  { label: "спасибо + имя коллеги", color: C.coral },
  { label: "свой спокойный час", color: C.yellowDeep },
];

export const WeekPlan: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const head = pop(t, 0.2);
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const start = ramp(t, at(c, 6), 0.6);
  return (
    <g>
      <g transform={`translate(${cx} 170) scale(${head})`}>
        <Txt x={0} y={0} size={50} weight={900}>
          5 шагов на неделю
        </Txt>
      </g>
      {/* дни недели */}
      <g transform={`translate(${cx - 420} 250)`}>
        {days.map((d, i) => (
          <g key={i} transform={`translate(${i * 140} 0)`} opacity={head}>
            <rect x={-55} y={-30} width={110} height={56} rx={16} fill="#fff" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={8} size={26}>
              {d}
            </Txt>
          </g>
        ))}
      </g>
      {STEPS.map((s, i) => {
        const k = pop(t, at(c, i + 1));
        return (
          <g key={i} transform={`translate(${cx} ${350 + i * 102}) scale(${k})`} opacity={clamp01(k * 2)}>
            <rect x={-470} y={-40} width={940} height={84} rx={42} fill="#fff" stroke={s.color} strokeWidth={5} />
            <circle cx={-420} cy={2} r={30} fill={s.color} />
            <Txt x={-420} y={14} size={34} color="#fff" weight={900}>
              {String(i + 1)}
            </Txt>
            <text x={-370} y={14} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
              {s.label}
            </text>
            <Check x={420} y={0} s={26} k={ramp(t, at(c, i + 1.6), 0.4)} color={s.color} />
          </g>
        );
      })}
      {start > 0 && (
        <g transform={`translate(${cx} 860) scale(${start})`}>
          <Tag x={0} y={-20} text="начать с одного шага" size={30} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const Recap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const words = ["IMAGE", "SPARK", "HUMAN", "SHINE"];
  const titles = ["Титул не нужен", "Бурные времена\nрождают лидеров", "Глубже отношения —\nсильнее влияние", "Сначала —\nвеликая личность"];
  const beats = [1, 1.5, 2, 2.5];
  const last = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      {words.map((w, i) => {
        const k = pop(t, at(c, beats[i]));
        const x = cx - 465 + i * 310;
        const A = ACRONYMS[w];
        return (
          <g key={w} transform={`translate(${x} ${470 - last * 60}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-140} y={-230} w={280} h={420} fill="#fff" r={30} stroke={A.color} />
            <circle cx={0} cy={-150} r={50} fill={A.color} />
            <Txt x={0} y={-132} size={52} color="#fff" weight={900}>
              {String(i + 1)}
            </Txt>
            <text x={0} y={-40} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={46} fill={A.color}>
              {w}
            </text>
            {titles[i].split("\n").map((l, j) => (
              <text key={j} x={0} y={40 + j * 34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={23} fill={C.ink}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
      {last > 0 && (
        <g transform={`translate(${cx} 800) scale(${last})`}>
          <rect x={-520} y={-50} width={1040} height={90} rx={45} fill={C.ink} />
          <Txt x={0} y={10} size={32} color="#fff">
            влияние начинается со следующего поступка
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const mark = pop(t, 0.3);
  const thanks = pop(t, at(c, 1));
  return (
    <g>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + t * 0.15;
        return <path key={i} d={`M 960 420 L ${960 + Math.cos(a) * 1400} ${420 + Math.sin(a) * 1400} L ${960 + Math.cos(a + 0.12) * 1400} ${420 + Math.sin(a + 0.12) * 1400} Z`} fill="#fff" opacity={0.18 * mark} />;
      })}
      <g transform={`translate(960 160) scale(${mark})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={120}>
          <tspan fill={C.ink}>Bana</tspan>
          <tspan fill="#e09a00">Mind</tspan>
        </text>
        <Txt x={0} y={64} size={38} weight={800} color={C.inkSoft}>
          Big Ideas. Simply Explained.
        </Txt>
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <Sprout key={i} x={300 + i * 330} y={860} s={1.4} grow={clamp01((t - 0.5) / 2 - i * 0.1)} t={t} color={[C.pink, C.yellow, C.violet, C.coral, C.sky][i]} />
      ))}
      {thanks > 0 && (
        <g transform={`translate(1500 420) scale(${thanks}) rotate(${wob(t, 1, 2)})`}>
          <Tag x={0} y={0} text="Спасибо!" size={52} color={C.yellow} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.4)} x={420} y={420}>
        <Tag x={0} y={0} text="сделать свою часть мира лучше" size={32} color="#fff" />
      </Pop>
    </g>
  );
};

export { Arrow, Cross, WordTiles };

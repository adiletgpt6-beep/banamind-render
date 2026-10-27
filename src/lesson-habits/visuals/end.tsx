// Итоги: честный взгляд (сито), учебный план BanaMind на 7 дней, четыре закона
// и их обратные версии, финал с монетками.
import React from "react";
import { C } from "../theme";
import { Heart, OL, Sprout } from "./draw";
import { Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { LAW_INFO } from "./basics";
import { Icon, XMark, zoneX, type IconName } from "./parts";

export const Sieve: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sieve = pop(t, 0.2);
  const drop = ramp(t, at(c, 1), 2.2);
  const help = ramp(t, at(c, 2), 0.6);
  const keep = ramp(t, at(c, 3), 0.6);
  const bad = ["«×37 гарантировано»", "одна волшебная формула", "единичный случай = закон"];
  const good = ["менять систему", "маленькие шаги", "проверять на себе"];
  return (
    <g>
      <g transform={`translate(${cx} 380) scale(${sieve})`}>
        <path d="M -380 -40 L 380 -40 Q 360 160 0 170 Q -360 160 -380 -40 Z" fill="#fff" stroke={OL} strokeWidth={6} />
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={-300 + (i % 10) * 66} cy={10 + Math.floor(i / 10) * 44} r={6} fill="#c7cdd8" />
        ))}
        <rect x={380} y={-56} width={180} height={30} rx={14} fill={C.wood} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-80} size={34} weight={900}>
          практическое руководство, не учебник
        </Txt>
      </g>
      {/* проваливается вниз */}
      {bad.map((b, i) => {
        const k = clamp01(drop * 3 - i);
        if (k <= 0) return null;
        const y = 300 + k * 520;
        return (
          <g key={i} transform={`translate(${cx - 320 + i * 320} ${y}) rotate(${k * (i - 1) * 20})`} opacity={1 - clamp01(k * 1.4 - 0.4)}>
            <rect x={-150} y={-36} width={300} height={72} rx={20} fill="#ffe0d9" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={24} color={C.red}>
              {b}
            </Txt>
          </g>
        );
      })}
      {help > 0 && keep < 1 && (
        <g transform={`translate(${cx} 720) scale(${help})`} opacity={1 - keep}>
          <rect x={-420} y={-70} width={840} height={140} rx={40} fill="#fff" stroke={OL} strokeWidth={4} />
          <Heart x={-340} y={10} s={1.6} color={C.coral} />
          <Txt x={30} y={-6} size={32}>
            при настоящей зависимости —
          </Txt>
          <Txt x={30} y={38} size={32} weight={900} color={C.coral}>
            помощь специалиста
          </Txt>
        </g>
      )}
      {keep > 0 &&
        good.map((g, i) => (
          <g key={i} transform={`translate(${cx - 360 + i * 360} 680) scale(${pop(t, at(c, 3.1) + i * 0.4)})`}>
            <rect x={-160} y={-44} width={320} height={88} rx={44} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={30} color={C.greenDeep}>
              {g}
            </Txt>
          </g>
        ))}
    </g>
  );
};

const DAYS: { icon: IconName; text: string }[] = [
  { icon: "eye", text: "карточка привычек" },
  { icon: "pin", text: "кто я + когда и где" },
  { icon: "coffee", text: "привязать + сигнал" },
  { icon: "clock", text: "две минуты" },
  { icon: "heart", text: "добавить приятное" },
  { icon: "pen", text: "трекер" },
  { icon: "book", text: "обзор недели" },
];

export const WeekPlan: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  // день → реплика: 1 → b, 2 → c, 3 → d, 4–5 → e, 6–7 → f
  const dayAt = [1, 2, 3, 4, 4.5, 5, 5.5];
  const label = pop(t, 0.2);
  const resume = ramp(t, at(c, 6), 0.5);
  return (
    <g>
      <g transform={`translate(${cx} 190) scale(${label})`}>
        <rect x={-430} y={-50} width={860} height={100} rx={50} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={14} size={38} weight={900}>
          учебный план BanaMind · 7 дней
        </Txt>
      </g>
      <Txt x={cx} y={270} size={26} color={C.inkSoft} opacity={clamp01(label)}>
        не план из книги — способ попробовать её идеи
      </Txt>
      {DAYS.map((d, i) => {
        const k = clamp01((t - at(c, dayAt[i])) * 2.5);
        if (k <= 0) return null;
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = cx - 450 + col * 300 + (row ? 150 : 0);
        const y = 420 + row * 250;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * k})`} opacity={k}>
            <rect x={-130} y={-100} width={260} height={210} rx={26} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-130} y={-100} width={260} height={48} rx={22} fill={C.coral} />
            <rect x={-128} y={-70} width={256} height={18} fill={C.coral} />
            <Txt x={0} y={-66} size={28} color="#fff" weight={900}>
              {`день ${i + 1}`}
            </Txt>
            <Icon name={d.icon} x={0} y={10} s={1} />
            <Txt x={0} y={86} size={d.text.length > 18 ? 20 : 24}>
              {d.text}
            </Txt>
            <g transform="translate(100 -20)">
              <XMark x={0} y={0} s={0.8} k={clamp01((t - at(c, dayAt[i]) - 0.8) * 2)} />
            </g>
          </g>
        );
      })}
      {resume > 0 && (
        <g transform={`translate(${cx} 840) scale(${resume})`}>
          <Tag x={0} y={0} text="сорвалось — не пропускайте дважды" size={32} color="#fff" />
        </g>
      )}
    </g>
  );
};

export const Recap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const head = pop(t, 0.2);
  const end = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <g opacity={1 - end * 0.75}>
        {[0, 1].map((side) => (
          <g key={side} transform={`translate(${cx - 260 + side * 520} 0)`}>
            <g transform={`translate(0 230) scale(${head})`}>
              <rect x={-230} y={-48} width={460} height={96} rx={48} fill={side ? "#ffe0d9" : "#d9f5e5"} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={38} weight={900} color={side ? C.red : C.greenDeep}>
                {side ? "вредная" : "хорошая"}
              </Txt>
            </g>
            {LAW_INFO.map((l, i) => {
              const k = pop(t, at(c, 1 + side) + i * 0.35);
              return (
                <g key={i} transform={`translate(0 ${360 + i * 112}) scale(${k})`}>
                  <rect x={-220} y={-44} width={440} height={88} rx={22} fill={side ? "#eef0f4" : l.col} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={12} size={34} weight={900} color={side ? C.inkSoft : C.ink}>
                    {side ? l.bad : l.good}
                  </Txt>
                </g>
              );
            })}
          </g>
        ))}
      </g>
      {end > 0 && (
        <g transform={`translate(${cx} 500) scale(${end})`}>
          <rect x={-470} y={-110} width={940} height={220} rx={40} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-24} size={40} weight={900}>
            финишной черты нет
          </Txt>
          <Txt x={0} y={40} size={34} color={C.inkSoft}>
            есть система, которую можно улучшать
          </Txt>
          <g transform={`translate(380 -60) rotate(${t * 40})`}>
            <path d="M -30 -10 A 32 32 0 1 1 -34 14 M -34 14 L -46 0 M -34 14 L -16 8" stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}
    </g>
  );
};

export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const coins = ramp(t, 0.3, Math.max(1.5, at(c, 0.9)));
  const mark = pop(t, at(c, 2));
  const step = pop(t, at(c, 1));
  const N = 28;
  return (
    <g>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + t * 0.15;
        return <path key={i} d={`M 960 420 L ${960 + Math.cos(a) * 1400} ${420 + Math.sin(a) * 1400} L ${960 + Math.cos(a + 0.12) * 1400} ${420 + Math.sin(a + 0.12) * 1400} Z`} fill="#fff" opacity={0.18 * mark} />;
      })}
      {/* монетка за монеткой — горка */}
      {Array.from({ length: N }).map((_, i) => {
        const k = clamp01(coins * N - i);
        if (k <= 0) return null;
        // треугольная горка
        let row = 0;
        let left = i;
        while (left >= 7 - row && row < 6) {
          left -= 7 - row;
          row++;
        }
        const x = 400 + (left - (6 - row) / 2) * 70 + (row % 2) * 0;
        const y = 860 - row * 40 - (1 - k) * 300;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx={34} ry={14} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
            <ellipse cx={0} cy={-6} rx={34} ry={14} fill={C.yellow} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Sprout key={i} x={1350 + i * 180} y={860} s={1.3} grow={clamp01((t - at(c, 1)) / 2 - i * 0.15)} t={t} color={[C.pink, C.yellow, C.violet][i]} />
      ))}
      {step > 0 && (
        <g transform={`translate(1500 560) scale(${step}) rotate(${wob(t, 1, 2)})`}>
          <Tag x={0} y={0} text="один маленький шаг" size={40} color="#fff" />
        </g>
      )}
      {mark > 0 && (
        <g transform={`translate(960 190) scale(${mark})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={120}>
            <tspan fill={C.ink}>Bana</tspan>
            <tspan fill="#e09a00">Mind</tspan>
          </text>
          <Txt x={0} y={64} size={38} weight={800} color={C.inkSoft}>
            Big Ideas. Simply Explained.
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 2.5)} x={430} y={420}>
        <Tag x={0} y={0} text="Спасибо!" size={52} color={C.yellow} />
      </Pop>
    </g>
  );
};

// Финальные части: пузырь «чистых технологий», семь вопросов, Better Place и Tesla,
// основатель и команда, четыре сценария будущего, границы книги, итоги, финал.
import React from "react";
import { Arrow, Check, Cross, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Bulb, Car, Coin, Dot, OL, Rocket, ZeroBook } from "./draw";
import { AX, BigLabel, ListBoard } from "./parts";

type VP = VisualProps<{ host?: string }>;

const SolarPanel: React.FC<{ x: number; y: number; s?: number; broken?: number }> = ({ x, y, s = 1, broken = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${broken * 18})`}>
    <path d="M -90 -40 L 90 -40 L 110 40 L -110 40 Z" fill="#2f6fd0" stroke={OL} strokeWidth={4} opacity={1 - broken * 0.4} />
    {[-45, 0, 45].map((dx) => (
      <line key={dx} x1={dx} y1={-40} x2={dx * 1.2} y2={40} stroke="#fff" strokeWidth={2} opacity={0.5} />
    ))}
    <line x1={-100} y1={0} x2={100} y2={0} stroke="#fff" strokeWidth={2} opacity={0.5} />
    <rect x={-8} y={40} width={16} height={50} fill={Z.grey} stroke={OL} strokeWidth={3} />
  </g>
);

// ── Пузырь «чистых» технологий ──
export const Cleantech: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const money = ramp(t, 0.3, at(c, 0.9));
  const crash = ramp(t, at(c, 1), 0.8);
  const seven = pop(t, at(c, 2));
  return (
    <g>
      <Txt x={cx} y={190} size={44} weight={900}>
        бум «чистых» технологий, 2000-е
      </Txt>
      {[0, 1, 2, 3, 4].map((i) => (
        <SolarPanel key={i} x={cx - 440 + i * 220} y={560 + crash * (i % 2 ? 60 : 30)} s={0.9} broken={crash * (i === 2 ? 0.2 : 1)} />
      ))}
      {Array.from({ length: Math.round(money * 12) }).map((_, i) => (
        <Coin key={i} x={cx - 480 + ((i * 97) % 960)} y={300 + ((t * 80 + i * 40) % 160)} s={0.55} />
      ))}
      {crash > 0 && <Cross x={cx} y={560} s={220} k={crash} />}
      {seven > 0 && (
        <g transform={`translate(${cx} 790) scale(${seven})`}>
          <Tag x={0} y={0} text="не ответили на 7 вопросов" size={40} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Семь вопросов Тиля (формулировки главы 13) ──
export const SevenQuestions: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { text: "Технология: прорыв, а не мелочь?", at: at(c, 0) },
    { text: "Время: подходящий ли момент?", at: at(c, 1) },
    { text: "Монополия: большая доля маленького рынка?", at: at(c, 2) },
    { text: "Люди: достойная команда?", at: at(c, 3) },
    { text: "Продажи: сможете продать?", at: at(c, 3.5) },
    { text: "Долгожительство: через 10–20 лет?", at: at(c, 4) },
    { text: "Открытие: уникальный шанс?", at: at(c, 5) },
  ];
  const tick = ramp(t, at(c, 6), 1.2);
  return (
    <g>
      <ListBoard ctx={c} x={cx - 500} y={130} w={1000} items={items} rowH={96} size={32} />
      {tick > 0 &&
        items.map((_, i) => (i < 6 ? <Check key={i} x={cx + 450} y={130 + i * 96 + 38} s={30} k={clamp01(tick * 7 - i)} /> : null))}
    </g>
  );
};

// ── Better Place (непонятно покупателю) и Tesla (ответы на вопросы, 2014) ──
export const TwoCars: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const bp = ramp(t, 0.2, 0.6);
  const tes = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={bp * (1 - tes * 0.5)}>
        <Car x={cx - 280} y={520} s={1.1} color={Z.teal} t={0} plug />
        <Txt x={cx - 280} y={620} size={32} weight={900}>
          Better Place
        </Txt>
        {["?", "?", "?"].map((q, i) => (
          <g key={i} transform={`translate(${cx - 380 + i * 100} ${330 + wob(t, i, 8)})`}>
            <Txt x={0} y={0} size={60} weight={900} color={C.inkSoft}>
              {q}
            </Txt>
          </g>
        ))}
        <Tag x={cx - 280} y={710} text="непонятно покупателю" size={28} color="#ffd9d6" />
      </g>
      {tes > 0 && (
        <g opacity={tes}>
          <Car x={cx + 300} y={520 - 6 * Math.abs(Math.sin(t * 6))} s={1.1} color={C.coral} t={t} />
          <Txt x={cx + 300} y={620} size={32} weight={900}>
            Tesla (2014)
          </Txt>
          {["технология", "маленький рынок", "свои продажи"].map((s, i) => (
            <Pop key={s} t={t} at={at(c, 1.3 + i * 0.2)} x={cx + 300} y={230 + i * 66}>
              <Tag x={0} y={0} text={s} size={28} color={C.yellow} />
            </Pop>
          ))}
        </g>
      )}
    </g>
  );
};

// ── Основатель: вдохновляет команду, а не верит в миф о себе ──
export const Founder: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const lead = ramp(t, 0.2, 0.6);
  const team = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <g opacity={lead}>
        <Dot x={cx} y={430} s={2.2} color={C.coral} />
        <path d={`M ${cx} 350 L ${cx + 260} 230`} stroke={C.coral} strokeWidth={8} strokeDasharray="16 12" />
        <Rocket x={cx + 300} y={240} s={0.5} t={t} />
        <Txt x={cx} y={530} size={30} weight={900}>
          план на годы вперёд
        </Txt>
      </g>
      {team > 0 && (
        <g opacity={team}>
          {Array.from({ length: 6 }).map((_, i) => {
            const x = cx - 450 + i * 180;
            const glow = clamp01(team * 6 - i);
            return (
              <g key={i}>
                <circle cx={x} cy={700} r={60} fill={C.yellow} opacity={0.4 * glow} />
                <Dot x={x} y={720} s={1.3} color={[Z.teal, Z.purple, C.skyDeep][i % 3]} />
                <path d={`M ${cx} 470 Q ${(cx + x) / 2} 560 ${x} 660`} stroke={C.yellowDeep} strokeWidth={4} fill="none" opacity={glow * 0.8} />
              </g>
            );
          })}
          <Tag x={cx} y={200} text="помогает каждому проявить лучшее" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Четыре сценария будущего ──
export const Futures: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, at(c, 1), at(c, 1.95) - at(c, 1));
  const sing = ramp(t, at(c, 2), 0.6);
  const choose = pop(t, at(c, 3));
  const x0 = cx - 480;
  const y0 = 560;
  const curve = (f: (u: number) => number, key: number) => {
    const shown = clamp01(k * 4 - key);
    if (shown <= 0) return "";
    return Array.from({ length: 40 })
      .map((_, i) => {
        const u = (i / 39) * shown;
        return `${i ? "L" : "M"} ${x0 + u * 960} ${y0 - f(u)}`;
      })
      .join(" ");
  };
  const lines = [
    { f: (u: number) => 60 * Math.sin(u * 12), color: Z.grey, label: "взлёты и падения" },
    { f: (u: number) => Math.min(u, 0.3) * 300, color: C.skyDeep, label: "плато" },
    { f: (u: number) => (u < 0.6 ? u * 200 : 120 - (u - 0.6) * 1100), color: C.red, label: "катастрофа" },
    { f: (u: number) => 20 * u + 260 * Math.pow(u, 4), color: C.green, label: "рывок вперёд" },
  ];
  return (
    <g>
      <line x1={x0} y1={y0} x2={x0 + 980} y2={y0} stroke={C.ink} strokeWidth={4} opacity={0.4} />
      {lines.map((l, i) => (
        <g key={i}>
          <path d={curve(l.f, i)} stroke={l.color} strokeWidth={9} fill="none" strokeLinecap="round" opacity={choose > 0 && i !== 3 ? 0.35 : 1} />
          {clamp01(k * 4 - i) > 0.95 && (
            <Tag x={x0 + 960 + 10} y={y0 - Math.max(-200, Math.min(330, l.f(1))) + 10} text={l.label} size={24} color={C.white} />
          )}
        </g>
      ))}
      {sing > 0 && (
        <Pop t={t} at={at(c, 2.1)} x={cx - 160} y={210}>
          <Tag x={0} y={0} text="«сингулярность» — гипотеза" size={32} color="#e6e1ff" />
        </Pop>
      )}
      {choose > 0 && (
        <g transform={`translate(${cx} 780) scale(${choose})`}>
          <Tag x={0} y={0} text="будущее нужно создавать" size={42} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Честно о границах книги ──
export const Limits: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { text: "написана в 2014 году", at: at(c, 0.3) },
    { text: "опыт Кремниевой долины", at: at(c, 0.6) },
    { text: "тезисы — мнение автора", at: at(c, 1) },
    { text: "«монополия» ≠ нарушение закона", at: at(c, 2) },
  ];
  const value = pop(t, at(c, 3));
  return (
    <g>
      <ListBoard ctx={c} x={cx - 450} y={170} w={900} items={items} rowH={120} size={38} activeColor={Z.tealSoft} />
      {value > 0 && (
        <g transform={`translate(${cx} 760) scale(${value})`}>
          <Tag x={0} y={0} text="ценность — в сильных вопросах" size={40} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Итоги: главное за минуту ──
export const Recap: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const tiles = [
    { text: "создавать, а не копировать", at: at(c, 1) },
    { text: "не воевать с похожими", at: at(c, 1.5) },
    { text: "маленький рынок → круги", at: at(c, 2) },
    { text: "план, а не удача", at: at(c, 2.5) },
    { text: "искать секреты", at: at(c, 3) },
    { text: "команда с миссией", at: at(c, 3.35) },
    { text: "продажи — часть продукта", at: at(c, 3.7) },
  ];
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Txt x={0} y={0} size={52} weight={900}>
          главное
        </Txt>
      </Pop>
      {tiles.map((tl, i) => {
        const k = pop(t, tl.at);
        if (k <= 0) return null;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = cx - 270 + col * 540;
        const y = 270 + row * 125;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <rect x={-255} y={-48} width={510} height={96} rx={48} fill={[C.yellow, Z.tealSoft, "#ffe7c2", "#e6e1ff"][i % 4]} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={30} weight={900}>
              {tl.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── Финал: вопрос зрителю и прощание ──
export const Finale: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const step = ramp(t, at(c, 1), 0.8);
  const bye = pop(t, at(c, 2));
  return (
    <g>
      <g transform={`translate(${cx - 300} 520)`} opacity={ramp(t, 0.2, 0.6)}>
        <ZeroBook x={0} y={0} s={0.8} t={t} />
      </g>
      {step > 0 && (
        <g opacity={step}>
          <BigLabel x={cx + 280} y={420} text="0 → 1" color={C.coral} size={130} k={step} />
          <Bulb x={cx + 280} y={660} s={1} t={t} />
          <Arrow x1={cx - 120} y1={480} x2={cx + 60} y2={400} k={step} color={C.coral} w={10} />
        </g>
      )}
      {bye > 0 && (
        <g transform={`translate(${cx} 190) scale(${bye})`}>
          <text x={0} y={0} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={84} textAnchor="middle" fill={C.ink}>
            Bana<tspan fill={C.yellowDeep}>Mind</tspan>
          </text>
          <Txt x={0} y={56} size={34} color={C.inkSoft}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
    </g>
  );
};

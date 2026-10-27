// Итоги BM-011: эпилог (законы против эго), честные границы модели,
// «Рассвет» целиком и доска всех 22 законов, пять вопросов, финал.
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { OL } from "./draw";
import { LawsBook, LawsGrid } from "./intro";
import { Bakery, Balloon, Loaf } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

export const Epilogue: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const quote = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <g opacity={1 - quote}>
        <Balloon x={cx} y={760} r={170} color={Z.purple} label="эго" t={t} />
        {["«быть лучше»", "«всё для всех»", "«быстрые победы»"].map((w, i) => (
          <Pop key={w} t={t} at={at(c, 0.3 + i * 0.15)} x={cx - 380 + i * 380} y={210 + (i % 2) * 60}>
            <Tag x={0} y={0} text={w} size={30} color={Z.greySoft} />
          </Pop>
        ))}
      </g>
      {quote > 0 && (
        <g transform={`translate(${cx} 470) scale(${quote})`}>
          <rect x={-470} y={-160} width={940} height={320} rx={40} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-50} size={44} weight={900}>
            «Руководство изменчиво,
          </Txt>
          <Txt x={0} y={14} size={44} weight={900}>
            но законы маркетинга — нет»
          </Txt>
          <Txt x={0} y={100} size={34} color={C.inkSoft}>
            наберитесь терпения
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Limits: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const rows = [
    { a: "практические правила", b: "не научно доказанные законы", at: at(c, 0.2) },
    { a: "рынки изменились", b: "примеры — время книги", at: at(c, 0.7) },
    { a: "гонка двух лошадей", b: "скорее тенденция", at: at(c, 1.2) },
    { a: "место в сознании", b: "держится на реальной пользе", at: at(c, 1.6) },
  ];
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={180}>
        <Txt x={0} y={0} size={48} weight={900}>
          честно о границах
        </Txt>
      </Pop>
      {rows.map((r, i) => {
        const k = pop(t, r.at);
        if (k <= 0) return null;
        const y = 300 + i * 130;
        return (
          <g key={i} opacity={Math.min(1, k * 1.5)} transform={`translate(${(1 - k) * 60} 0)`}>
            <Panel x={cx - 540} y={y - 50} w={460} h={100} r={50} fill="#fff" />
            <Txt x={cx - 310} y={y + 13} size={32} weight={900}>
              {r.a}
            </Txt>
            <Panel x={cx - 50} y={y - 50} w={590} h={100} r={50} fill={i === 3 ? C.yellow : Z.tealSoft} />
            <Txt x={cx + 245} y={y + 13} size={32} weight={900}>
              {r.b}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

export const Recap: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  // законы загораются по мере перечисления
  const first = at(c, 0.1);
  const lit = (n: number) => {
    const order: Record<number, number> = { 2: 0.1, 1: 0.15, 5: 0.35, 7: 0.55, 14: 0.7, 9: 0.75, 12: 1.05, 13: 1.1, 15: 1.3, 4: 1.35, 19: 1.55, 21: 1.75, 20: 1.8, 22: 1.95 };
    const b = order[n];
    return b !== undefined && t >= at(c, b) ? 1 : t >= at(c, 1.98) ? 1 : 0;
  };
  return (
    <g>
      <LawsGrid cx={cx} t={t} start={first} step={0.03} lit={lit} y0={160} />
      <g transform={`translate(${cx - 300} 830) scale(0.55)`}>
        <Bakery x={0} y={0} t={t} glow={1} />
      </g>
      <Pop t={t} at={at(c, 1.9)} x={cx + 200} y={710}>
        <Tag x={0} y={0} text="22 закона — одна история «Рассвета»" size={30} color={C.white} />
      </Pop>
    </g>
  );
};

export const FiveQuestions: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const qs = [
    { q: "В какой категории мы первые?", at: at(c, 0.45) },
    { q: "Каким одним словом нас запомнят?", at: at(c, 0.75) },
    { q: "На какой мы ступеньке?", at: at(c, 1.05) },
    { q: "От чего готовы отказаться?", at: at(c, 1.35) },
    { q: "Тренд или просто волна?", at: at(c, 1.7) },
  ];
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Txt x={0} y={0} size={46} weight={900}>
          пять вопросов на завтра
        </Txt>
      </Pop>
      {qs.map((it, i) => {
        const k = pop(t, it.at);
        if (k <= 0) return null;
        const y = 270 + i * 112;
        const active = t >= it.at && (i === 4 || t < qs[i + 1].at);
        return (
          <g key={i} opacity={Math.min(1, k * 1.5)} transform={`translate(${(1 - k) * 60} 0)`}>
            <Panel x={cx - 500} y={y - 44} w={1000} h={88} r={44} fill={active ? C.yellow : "#ffffffdd"} />
            <circle cx={cx - 456} cy={y} r={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={cx - 456} y={y + 12} size={32} weight={900}>
              {String(i + 1)}
            </Txt>
            <Txt x={cx - 400} y={y + 13} size={36} weight={900} anchor="start">
              {it.q}
            </Txt>
            {!active && t > it.at + 0.5 && <Check x={cx + 450} y={y} s={26} k={1} />}
          </g>
        );
      })}
    </g>
  );
};

export const Finale: React.FC<VP> = (c) => {
  const { t } = c;
  const bye = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g transform={`translate(380 ${470 + wob(t, 1, 6)})`} opacity={1 - bye * 0.3}>
        <LawsBook x={0} y={0} s={0.85} t={t} />
      </g>
      <g transform="translate(1540 760) scale(0.7)">
        <Bakery x={0} y={0} t={t} glow={1} />
      </g>
      <Loaf x={1540 - 200} y={790} s={0.5} steam={1} t={t} />
      <g opacity={bye}>
        <text x={960} y={190} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={110} textAnchor="middle" fill={C.ink}>
          Bana<tspan fill={C.yellowDeep}>Mind</tspan>
        </text>
        <Txt x={960} y={250} size={38} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </g>
    </g>
  );
};

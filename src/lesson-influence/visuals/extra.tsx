// Дополнительные сцены: цена и ожидание (энергетик), короткая форма регистрации,
// признаки поддельного отзыва, официант Винсент, аукционная лихорадка.
import React from "react";
import { C, DISPLAY, FC, FONT } from "../theme";
import { Card, Label, OL, Person, PriceTag } from "./draw";
import { Appear, area, at, Check, clamp01, Cross, Drift, ease, ramp, Txt, wob, type VisualProps } from "./kit";

type PV = { host?: string; mode?: "drink" | "form" };

// банка напитка
const Can: React.FC<{ x: number; y: number; s?: number; color: string }> = ({ x, y, s = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-150} width={120} height={300} rx={26} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-60} y={-150} width={120} height={26} rx={12} fill="#c9d3e6" stroke={OL} strokeWidth={4} />
    <path d="M -30 -40 L 10 -40 L -10 10 L 24 10 L -16 80 L -2 26 L -30 26 Z" fill="#fff" stroke={OL} strokeWidth={3} />
    <rect x={-46} y={-110} width={14} height={200} rx={7} fill="#fff" opacity={0.35} />
  </g>
);

// поле формы
const Field: React.FC<{ x: number; y: number; w: number; k: number; label: string }> = ({ x, y, w, k, label }) => (
  <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 16})`}>
    <text x={0} y={-12} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.inkSoft}>
      {label}
    </text>
    <rect x={0} y={0} width={w} height={52} rx={12} fill="#fff" stroke="#b9c1da" strokeWidth={4} />
  </g>
);

export const Versus: React.FC<VisualProps<PV>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  if (p.mode === "form") {
    const right = ramp(t, at(ctx, 0.3), 0.6);
    const stat = ramp(t, at(ctx, 0.7), 0.6);
    const next = ramp(t, at(ctx, 1), 0.6);
    const form = (x: number, n: number, k: number, hi: boolean) => (
      <g opacity={k} transform={`translate(${x} 520)`}>
        <rect x={-220} y={-300} width={440} height={560} rx={30} fill={C.paper} stroke={hi ? C.yellow : OL} strokeWidth={hi ? 10 : 5} />
        <Txt x={0} y={-238} size={34}>
          {`Регистрация · ${n} поля`}
        </Txt>
        {Array.from({ length: n }).map((_, i) => (
          <Field key={i} x={-180} y={-180 + i * 100} w={360} k={1} label={["имя", "почта", "пароль", "телефон"][i]} />
        ))}
        <rect x={-120} y={200} width={240} height={50} rx={25} fill={hi ? C.green : "#9aa3c0"} />
        <Txt x={0} y={235} size={28} color="#fff">
          далее
        </Txt>
      </g>
    );
    return (
      <Drift t={t} dur={dur} cx={cx}>
        {form(cx - 280, 4, ramp(t, at(ctx, 0) - 0.2, 0.6), false)}
        {form(cx + 280, 3, right, true)}
        {stat > 0 && (
          <g opacity={stat}>
            <Txt x={cx + 280} y={170} size={56} color={C.yellow}>
              +50 % регистраций
            </Txt>
          </g>
        )}
        {next > 0 && (
          <g opacity={next} transform={`translate(${cx} 870)`}>
            <Card x={0} y={0} w={760} h={100} lines={["кто начал — хочет закончить"]} size={40} fill={FC.commit.light} edge={FC.commit.color} />
          </g>
        )}
      </Drift>
    );
  }
  // энергетик: 1,89 $ и 0,89 $ — решено больше / меньше головоломок
  const right = ramp(t, at(ctx, 1), 0.6);
  const solved = ramp(t, at(ctx, 1.5), 1.4);
  const sig = ramp(t, at(ctx, 2), 0.6);
  const puzzles = (x: number, n: number, k: number) =>
    Array.from({ length: 10 }).map((_, i) => {
      const on = clamp01(k * 10 - i) * (i < n ? 1 : 0);
      return (
        <g key={i} transform={`translate(${x - 120 + (i % 5) * 60} ${760 + Math.floor(i / 5) * 60})`}>
          <rect x={-24} y={-24} width={48} height={48} rx={10} fill="#fff" fillOpacity={0.15} stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
          {on > 0 && <path d="M -24 -6 L -6 -6 Q -6 -24 6 -24 L 24 -24 L 24 24 L -24 24 Z" fill={C.yellow} stroke={OL} strokeWidth={3} opacity={on} transform={`scale(${0.5 + 0.5 * on})`} />}
        </g>
      );
    });
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={at(ctx, 0.2)} x={cx - 300} y={430}>
        <Can x={0} y={0} s={1.1} color="#3d8bff" />
        <PriceTag x={0} y={-230} text="1,89 $" s={1.1} color={C.yellow} />
      </Appear>
      <g opacity={right} transform={`translate(${cx + 300} ${430 + (1 - right) * 30})`}>
        <Can x={0} y={0} s={1.1} color="#3d8bff" />
        <PriceTag x={0} y={-230} text="0,89 $" s={1.1} color="#ffd0c8" />
        <Label x={0} y={210} text="скидка" size={30} bg="#ffd0c8" />
      </g>
      {solved > 0 && (
        <g>
          {puzzles(cx - 300, 8, solved)}
          {puzzles(cx + 300, 5, solved)}
          <Txt x={cx} y={790} size={30} color="#fff">
            решено задач
          </Txt>
        </g>
      )}
      {sig > 0 && (
        <g opacity={sig} transform={`translate(${cx} 470)`}>
          <Card x={0} y={0} w={420} h={130} lines={["цена =", "сигнал ожидания"]} size={40} fill={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Поддельный отзыв: две карточки, три признака подсвечиваются ──
export const Reviews: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k1 = ramp(t, at(ctx, 1.05), 0.5);
  const k2 = ramp(t, at(ctx, 1.4), 0.5);
  const k3 = ramp(t, at(ctx, 1.75), 0.5);
  const verdict = ramp(t, at(ctx, 2), 0.6);
  const stars = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d="M 0 -16 L 5 -5 L 16 -5 L 7 2 L 10 14 L 0 7 L -10 14 L -7 2 L -16 -5 L -5 -5 Z" transform={`translate(${i * 36} 0)`} fill={C.gold} />
      ))}
    </g>
  );
  const card = (x: number, title: string, rows: { text: string; mark?: number }[], fake: boolean, k: number) => (
    <g opacity={k} transform={`translate(${x} ${520 + (1 - k) * 30})`}>
      <rect x={-300} y={-260} width={600} height={520} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
      <circle cx={-240} cy={-200} r={30} fill={fake ? "#c9a7ff" : "#8fd0ff"} stroke={OL} strokeWidth={3} />
      {stars(-190, -200)}
      <text x={-260} y={-130} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
        {title}
      </text>
      {rows.map((r, i) => {
        const hk = r.mark === 1 ? k1 : r.mark === 2 ? k2 : r.mark === 3 ? k3 : 0;
        return (
          <g key={i}>
            {hk > 0 && <rect x={-266} y={-92 + i * 62} width={532 * hk} height={50} rx={10} fill={fake ? "#ffe1dc" : "#d2f5d7"} />}
            <text x={-256} y={-58 + i * 62} fontFamily={FONT} fontWeight={700} fontSize={28} fill={C.ink}>
              {r.text}
            </text>
          </g>
        );
      })}
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {card(cx - 330, "Отель у моря", [{ text: "Чистая ванная комната,", mark: 1 }, { text: "быстрая регистрация,", mark: 1 }, { text: "цена как на сайте.", mark: 3 }, { text: "Завтрак до 10:30." }], false, ramp(t, at(ctx, 0.2), 0.6))}
      {card(cx + 330, "Лучший отпуск!", [{ text: "Я так счастлива! Мой муж", mark: 2 }, { text: "и я просто обожаем,", mark: 3 }, { text: "мы отдыхали, я в восторге,", mark: 2 }, { text: "я рекомендую всем!", mark: 2 }], true, ramp(t, at(ctx, 0.5), 0.6))}
      <g opacity={k1}>
        <Label x={cx} y={180} text="1 · детали  2 · много «я»  3 · глаголы вместо вещей" size={28} bg={C.yellow} />
      </g>
      {verdict > 0 && (
        <g opacity={verdict}>
          <Check x={cx - 330} y={840} s={44} k={verdict} />
          <Cross x={cx + 330} y={840} s={70} k={verdict} />
        </g>
      )}
    </Drift>
  );
};

// ── Официант Винсент: меню, «это блюдо не лучшее», затем вино ──
export const Waiter: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const advise = ramp(t, at(ctx, 1), 0.6);
  const trust = ramp(t, at(ctx, 2), 0.6);
  const wine = ramp(t, at(ctx, 2.4), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* стол и гости */}
      <ellipse cx={cx - 120} cy={800} rx={330} ry={60} fill="#fff" stroke={OL} strokeWidth={5} />
      <rect x={cx - 140} y={800} width={40} height={140} fill="#8a5a3c" />
      {[0, 1, 2].map((i) => (
        <Person key={i} who={(["anna", "neighbor", "grandma"] as const)[i]} x={cx - 360 + i * 160} y={760} s={0.42} mood={trust > 0.5 ? "happy" : "think"} pose="stand" t={t} seed={i} />
      ))}
      <Person who="seller" x={cx + 330} y={960} s={0.75} mood={advise > 0.5 ? "kind" : "smile"} pose={advise > 0.5 && wine < 0.5 ? "point" : wine > 0.5 ? "give" : "stand"} t={t} flip />
      {/* меню */}
      <g transform={`translate(${cx - 120} 330)`} opacity={1 - wine * 0.7}>
        <rect x={-210} y={-110} width={420} height={220} rx={16} fill={C.paper} stroke={OL} strokeWidth={4} />
        <text x={-180} y={-50} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
          Блюдо А
        </text>
        <text x={180} y={-50} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill={C.ink} textAnchor="end">
          $$$
        </text>
        <text x={-180} y={40} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
          Блюдо Б
        </text>
        <text x={180} y={40} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill={C.ink} textAnchor="end">
          $$
        </text>
        <line x1={-190} y1={-60} x2={-190 + 380 * advise} y2={-60} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
        {advise > 0.5 && <Check x={-215} y={30} s={30} k={ramp(t, at(ctx, 1.4))} />}
      </g>
      {advise > 0 && (
        <g opacity={advise * (1 - wine)}>
          <Label x={cx + 220} y={480} text="«возьмите лучше вот это»" size={30} bg="#fff" />
        </g>
      )}
      {trust > 0 && (
        <g opacity={trust * (1 - wine)}>
          <Label x={cx + 260} y={560} text="знающий + честный" size={30} bg={FC.authority.light} border={FC.authority.deep} />
        </g>
      )}
      {wine > 0 && (
        <g opacity={wine}>
          <g transform={`translate(${cx + 190} 600) rotate(${wob(t, 1, 4)})`}>
            <path d="M -16 -110 L 16 -110 L 16 -60 Q 40 -40 40 0 L 40 90 L -40 90 L -40 0 Q -40 -40 -16 -60 Z" fill="#6a2a4a" stroke={OL} strokeWidth={4} />
            <rect x={-30} y={10} width={60} height={46} rx={6} fill={C.paper} />
          </g>
          <Label x={cx + 190} y={400} text="«подобрать вино?»" size={30} bg={C.yellow} />
          <Check x={cx - 120} y={600} s={44} k={ramp(t, at(ctx, 2.7))} />
        </g>
      )}
    </Drift>
  );
};

// ── Аукцион: ставки растут, молоток, «никогда больше» ──
export const Auction: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const bids = ramp(t, at(ctx, 0.3), 2.5);
  const hammer = ramp(t, at(ctx, 1.1), 0.4);
  const after = ramp(t, at(ctx, 2), 0.6);
  const paddles = [0, 1, 2];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* киноплёнка-«лот» */}
      <g transform={`translate(${cx} 330)`}>
        <rect x={-180} y={-90} width={360} height={180} rx={16} fill="#22263a" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x={-170 + i * 60} y={-82} width={26} height={16} rx={3} fill="#fff" opacity={0.7} />
            <rect x={-170 + i * 60} y={66} width={26} height={16} rx={3} fill="#fff" opacity={0.7} />
          </g>
        ))}
        <rect x={-120} y={-50} width={240} height={100} rx={8} fill={FC.scarcity.light} />
        <Txt x={0} y={12} size={30}>
          показ фильма
        </Txt>
      </g>
      {paddles.map((i) => {
        const up = Math.max(0, Math.sin(t * 3 + i * 2)) * (1 - hammer);
        const x = cx - 420 + i * 420;
        return (
          <g key={i} transform={`translate(${x} 880)`}>
            <Person who={(["boss", "seller", "guest"] as const)[i]} x={0} y={0} s={0.55} mood={after > 0.5 ? (i === 1 ? "doubt" : "smile") : "tense"} pose="stand" t={t} seed={i} />
            <g transform={`translate(60 ${-300 - up * 60})`}>
              <rect x={-6} y={0} width={12} height={90} fill="#8a5a3c" />
              <circle cx={0} cy={-10} r={40} fill={FILTERS4[i]} stroke={OL} strokeWidth={4} />
              <text x={0} y={2} fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill="#fff" textAnchor="middle">
                {i + 1}
              </text>
            </g>
          </g>
        );
      })}
      {/* растущая цена */}
      <g transform={`translate(${cx} 520)`}>
        <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={64 + 20 * bids} fill={C.yellow} textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
          {bids < 1 ? `${(Math.floor(bids * 30) / 10 + 0.1).toFixed(1).replace(".", ",")} млн $…` : "> 3 млн $"}
        </text>
      </g>
      {hammer > 0 && (
        <g transform={`translate(${cx + 240} 420) rotate(${-40 + 40 * ease(hammer)})`}>
          <rect x={-10} y={0} width={20} height={130} rx={8} fill="#8a5a3c" stroke={OL} strokeWidth={3} />
          <rect x={-50} y={-30} width={100} height={46} rx={10} fill="#a8724c" stroke={OL} strokeWidth={4} />
        </g>
      )}
      {after > 0 && (
        <g opacity={after}>
          <Label x={cx} y={650} text="победитель: «никогда больше»" size={34} bg="#ffd0c8" />
          <Txt x={cx - 420} y={470} size={30} color="#fff">
            проиграл — улыбается
          </Txt>
        </g>
      )}
    </Drift>
  );
};

const FILTERS4 = [FC.scarcity.color, FC.authority.color, FC.social.color];


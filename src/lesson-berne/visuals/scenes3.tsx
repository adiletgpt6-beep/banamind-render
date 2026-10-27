// Сцены о споре из-за ошибки, неловком госте, помощи и хороших играх.
// Все персонажи — обобщённые герои фильма в собственном стиле BanaMind,
// не иллюстрации издания.
import React from "react";
import { C, DISPLAY, EGO, FONT } from "../theme";
import { Bubble, CloudIcon, EyeIcon, Plate, textW } from "./core";
import { dotsOf, SH, Swarm } from "./dots";
import { OL, Person } from "./draw";
import { area, at, Check, clamp01, Cross, Drift, ease, pop, ramp, type VisualProps } from "./kit";

type HostP = { host?: string };

// игральная карта (собственный рисунок)
const PlayCard: React.FC<{ x: number; y: number; rot?: number; suit: string; red?: boolean; s?: number; back?: boolean }> = ({ x, y, rot = 0, suit, red = false, s = 1, back = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-62} y={-88} width={124} height={176} rx={14} fill={back ? EGO.P.deep : "#ffffff"} stroke={OL} strokeWidth={5} />
    {back ? (
      <rect x={-46} y={-72} width={92} height={144} rx={8} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
    ) : (
      <g>
        <text x={-38} y={-46} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={red ? C.red : OL} textAnchor="middle">
          Т
        </text>
        <text x={0} y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={76} fill={red ? C.red : OL} textAnchor="middle">
          {suit}
        </text>
      </g>
    )}
  </g>
);

// ── Водопроводчик: договор, счёт с надбавкой, ярость ──
export const Bill: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const aces = 1 - ramp(t, at(ctx, 1) - 0.4, 0.4);
  const deal = ramp(t, at(ctx, 1), 0.6) * (1 - ramp(t, at(ctx, 2) - 0.3, 0.4));
  const bill = ramp(t, at(ctx, 2), 0.6);
  const extra = pop(t, at(ctx, 2.45));
  const fury = ramp(t, at(ctx, 3), 0.5);
  const letters = Math.floor(clamp01((t - at(ctx, 3.3)) / 2.5) * 5);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      {aces > 0 && (
        <g opacity={aces}>
          {["♠", "♥", "♦", "♣"].map((s, i) => (
            <PlayCard key={s} x={cx - 180 + i * 120} y={420 - Math.abs(i - 1.5) * 16} rot={(i - 1.5) * 10} suit={s} red={i === 1 || i === 2} s={1.3 * Math.min(1, pop(t, 0.2 + i * 0.2))} />
          ))}
          <Plate x={cx} y={700} text="соперник «в руках»" k={ramp(t, at(ctx, 0.5), 0.5)} bg="#ffffff" size={40} />
        </g>
      )}
      {deal > 0 && (
        <g opacity={deal}>
          <Person who="boss" x={cx - 300} y={830} s={0.85} mood="smile" pose="give" t={t} />
          <Person who="plumber" x={cx + 300} y={830} s={0.85} mood="smile" pose="give" t={t} flip />
          <Plate x={cx} y={260} text={"цена согласована\nдоплат не будет"} k={deal} bg="#e3fbef" size={42} />
        </g>
      )}
      {bill > 0 && (
        <g opacity={bill} transform={`translate(${cx - (fury > 0 ? 220 : 0)} ${440})`}>
          <rect x={-300} y={-280} width={600} height={500} rx={20} fill="#fffdf6" stroke={OL} strokeWidth={6} />
          <text x={0} y={-210} fontFamily={DISPLAY} fontWeight={800} fontSize={50} fill={C.ink} textAnchor="middle">
            СЧЁТ
          </text>
          <text x={-250} y={-110} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
            работы и материалы
          </text>
          <text x={250} y={-50} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.ink} textAnchor="end">
            400 $
          </text>
          {extra > 0 && (
            <g transform={`translate(0 ${60}) scale(${Math.min(1.1, extra)})`}>
              <rect x={-270} y={-50} width={540} height={90} rx={16} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <text x={-240} y={10} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>
                + лишний клапан
              </text>
              <text x={240} y={12} fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill={C.red} textAnchor="end">
                4 $
              </text>
            </g>
          )}
        </g>
      )}
      {fury > 0 && (
        <g opacity={fury}>
          <Person who="boss" x={A.x1 - 210} y={840} s={0.8} mood="tense" pose="phone" t={t} flip />
          {Array.from({ length: letters }).map((_, i) => (
            <g key={i} transform={`translate(${A.x1 - 420 + i * 18} ${300 - i * 22}) rotate(${-6 + i * 4})`}>
              <rect x={-90} y={-120} width={180} height={240} rx={10} fill="#ffffff" stroke={OL} strokeWidth={4} />
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <line key={r} x1={-64} y1={-80 + r * 32} x2={60 - (r % 2) * 30} y2={-80 + r * 32} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
              ))}
            </g>
          ))}
          <path d={`M ${A.x1 - 260} 330 q 14 -26 28 0 q 14 26 28 0 q 14 -26 28 0`} transform={`translate(0 ${Math.sin(t * 8) * 6})`} fill="none" stroke={C.outcome} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
    </Drift>
  );
};

// ── Название игры и вклад второй стороны ──
export const CaughtName: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const two = ramp(t, at(ctx, 1), 0.6);
  const ok = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <text x={cx - 330} y={170} fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke" opacity={ramp(t, 0.2, 0.5)}>
        название у Берна
      </text>
      <Plate x={cx - 330} y={240} text="«Ну что, попался, негодяй!»" k={ramp(t, 0.3, 0.5)} bg="#ffffff" size={38} />
      <text x={cx + 400} y={170} fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke" opacity={ramp(t, at(ctx, 0.6), 0.5)}>
        подпись на нашем столе
      </text>
      <Plate x={cx + 400} y={240} text="Поймал на ошибке" k={ramp(t, at(ctx, 0.65), 0.5)} bg={C.yellow} size={42} />
      {two > 0 && (
        <g opacity={two}>
          <Person who="plumber" x={cx - 380} y={840} s={0.72} mood="think" pose="give" t={t} />
          <Person who="boss" x={cx + 380} y={840} s={0.72} mood="tense" pose="point" t={t} flip />
          <Plate x={cx - 380} y={360} text="провокационный ход" k={two} bg="#ffe1d8" size={34} />
          <Plate x={cx + 380} y={360} text="обвинение" k={ramp(t, at(ctx, 1.4), 0.5)} bg="#ffe1d8" size={34} />
          <Plate x={cx} y={580} text="в игре — двое" k={ramp(t, at(ctx, 1.6), 0.5) * (1 - ok)} size={38} />
        </g>
      )}
      {ok > 0 && (
        <g opacity={ok} transform={`translate(${cx} 580)`}>
          <rect x={-230} y={-70} width={460} height={140} rx={34} fill="#e3fbef" stroke={OL} strokeWidth={4} />
          <Check x={-170} y={0} s={36} k={ok} />
          <text x={30} y={-8} fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink} textAnchor="middle">
            <tspan x={30}>спорить</tspan>
            <tspan x={30} dy={44}>по существу — можно</tspan>
          </text>
        </g>
      )}
    </Drift>
  );
};

// ── Ясные договорённости ──
export const Contract: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const items = ["цена", "сроки", "доплаты", "отмена"];
  const elegant = ramp(t, at(ctx, 1), 0.6);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <g transform={`translate(${cx - 120} 440) scale(${Math.min(1, pop(t, 0.2))})`}>
        <rect x={-260} y={-300} width={520} height={600} rx={24} fill="#fffdf6" stroke={OL} strokeWidth={6} />
        <text x={0} y={-220} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.ink} textAnchor="middle">
          ДОГОВОРИЛИСЬ
        </text>
        {items.map((it, i) => {
          const k = ramp(t, at(ctx, 0.35 + i * 0.13), 0.4);
          return (
            <g key={it} transform={`translate(-180 ${-120 + i * 110})`} opacity={0.3 + 0.7 * k}>
              <rect x={-30} y={-30} width={60} height={60} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
              <Check x={0} y={0} s={30} k={k} />
              <text x={60} y={14} fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
                {it}
              </text>
            </g>
          );
        })}
      </g>
      <Plate x={A.x1 - 260} y={360} text={"непредвиденное?\nуступить без спора"} k={elegant} bg="#ffffff" size={36} />
      <Plate x={A.x1 - 260} y={560} text="меньше поводов — меньше игры" k={ramp(t, at(ctx, 1.6), 0.5)} size={32} />
    </Drift>
  );
};

// ── Званый вечер: коктейль, извинения, новые неловкости ──
export const Party: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const spill = ramp(t, at(ctx, 0.35), 0.5);
  const sorry = at(ctx, 1);
  const mishaps = [
    { text: "скатерть", at: 2.3, x: cx - 330 },
    { text: "занавеска", at: 2.5, x: cx },
    { text: "соус на ковре", at: 2.7, x: cx + 330 },
  ];
  const hostMood = t < at(ctx, 0.6) ? "smile" : t < at(ctx, 0.8) ? "tense" : "kind";
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      {/* стол */}
      <rect x={cx - 420} y={640} width={840} height={30} rx={12} fill={C.deskTop} stroke={OL} strokeWidth={5} />
      <rect x={cx - 380} y={670} width={760} height={30} fill="#f3eadb" stroke={OL} strokeWidth={4} />
      <Person who="guest" x={cx - 300} y={860} s={0.8} mood={t > sorry ? "doubt" : "smile"} pose={t > sorry ? "shrug" : "give"} t={t} />
      <Person who="anna" x={cx + 60} y={860} s={0.8} mood={spill > 0.5 ? "shock" : "smile"} t={t} flip seed={2} />
      <Person who="timur" x={cx + 330} y={860} s={0.82} mood={hostMood} pose={t > sorry ? "stop" : "stand"} t={t} flip seed={4} />
      {/* бокал и брызги */}
      <g transform={`translate(${cx - 180 + spill * 120} ${470 + spill * 40}) rotate(${spill * 110})`}>
        <path d="M -30 -50 L 30 -50 L 6 0 L 6 40 L 22 50 L -22 50 L -6 40 L -6 0 Z" fill="#e8f4ff" stroke={OL} strokeWidth={4} />
        <path d="M -24 -40 L 24 -40 L 8 -10 L -8 -10 Z" fill="#ff6b9a" opacity={1 - spill} />
      </g>
      {spill > 0.3 && <ellipse cx={cx + 60} cy={590} rx={50 * spill} ry={34 * spill} fill="#ff6b9a" opacity={0.85} />}
      <Bubble x={cx - 300} y={250} text="Извините, пожалуйста" k={pop(t, sorry)} tail="b" maxW={560} />
      <Bubble x={cx + 330} y={330} text="Ничего-ничего…" k={pop(t, at(ctx, 1.5))} tail="b" tone="soft" maxW={460} />
      {mishaps.map((m, i) => (
        <Plate key={i} x={m.x} y={130} text={m.text} k={ramp(t, at(ctx, m.at), 0.4)} bg="#ffe1d8" size={36} />
      ))}
    </Drift>
  );
};

// ── Мысли не видны — видны повторения ──
export const NoMind: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const lx = A.x0 + 200;
  const rx = A.cx + 210;
  const fall = ramp(t, 0.3, 0.8);
  const right = ramp(t, at(ctx, 1), 0.6);
  const marks = Math.floor(clamp01((t - at(ctx, 1.4)) / 2) * 4);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <g transform={`translate(${lx} ${300 + fall * 260}) rotate(${fall * 140})`}>
        <path d="M -40 -70 L 40 -70 L 8 0 L 8 56 L 30 70 L -30 70 L -8 56 L -8 0 Z" fill="#e8f4ff" stroke={OL} strokeWidth={5} />
      </g>
      <Plate x={lx} y={720} text="бокалы правда падают" k={ramp(t, at(ctx, 0.5), 0.5)} bg="#ffffff" size={38} />
      {right > 0 && (
        <g opacity={right}>
          <CloudIcon x={rx - 180} y={260} s={1.4} />
          <Cross x={rx - 180} y={260} s={120} k={ramp(t, at(ctx, 1.3), 0.5)} />
          <text x={rx - 180} y={400} fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            мысли не видны
          </text>
          <EyeIcon x={rx + 180} y={260} s={1.3} />
          <text x={rx + 180} y={400} fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            видны повторения
          </text>
          {Array.from({ length: marks }).map((_, i) => (
            <rect key={i} x={rx + 100 + i * 40} y={460} width={18} height={110} rx={9} fill={C.yellow} stroke={OL} strokeWidth={3} />
          ))}
        </g>
      )}
    </Drift>
  );
};

// ── Покер: «я всего лишь пытаюсь помочь вам» ──
export const Poker: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const reveal = ramp(t, at(ctx, 1.4), 0.6);
  const push = ramp(t, at(ctx, 1.05), 0.8);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <ellipse cx={cx} cy={640} rx={560} ry={150} fill="#2f8a5a" stroke={OL} strokeWidth={6} />
      <ellipse cx={cx} cy={640} rx={520} ry={120} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} />
      <Person who="expert" x={cx - 420} y={860} s={0.8} mood="smile" pose="give" t={t} />
      <Person who="boss" x={cx + 420} y={860} s={0.8} mood={reveal > 0.5 ? "tense" : "doubt"} pose={reveal > 0.5 ? "shrug" : "think"} t={t} flip />
      {[0, 1, 2].map((i) => (
        <PlayCard key={i} x={cx - 160 + i * 60} y={620} rot={-10 + i * 10} suit={["♠", "♥", "♣"][i]} red={i === 1} s={0.7} back={reveal < 0.5} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${cx + 260 - push * 260 + i * 10} ${640 - i * 14})`}>
          <ellipse rx={44} ry={18} fill={i % 2 ? C.red : C.yellow} stroke={OL} strokeWidth={4} />
        </g>
      ))}
      <Bubble x={cx - 230} y={250} text={"Не расстраивайтесь, я всего лишь\nпытаюсь помочь вам"} k={pop(t, at(ctx, 0.55))} tail="b" maxW={760} size={36} />
      <Bubble x={cx + 300} y={330} text="Помогли, ничего не скажешь!" k={pop(t, at(ctx, 1.6))} tail="b" tone="hot" maxW={560} size={36} />
    </Drift>
  );
};

// ── Круг помощи ──
export const HelpLoop: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx - 40;
  const cy = 430;
  const R = 230;
  const nodes = [
    { text: "совет", a: -Math.PI / 2, c: EGO.P.light },
    { text: "не помогло", a: Math.PI / 6, c: "#ffe1d8" },
    { text: "ещё попытка", a: (5 * Math.PI) / 6, c: "#ffffff" },
  ];
  const spin = (t * 1.4) % (Math.PI * 2);
  const burst = pop(t, at(ctx, 1.3)) * (1 - ramp(t, at(ctx, 2) - 0.4, 0.4));
  const mirror = ramp(t, at(ctx, 2), 0.6);
  const cheap = ramp(t, at(ctx, 3), 0.5);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <g opacity={1 - mirror}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray="30 22" strokeDashoffset={-t * 60} opacity={0.8} />
        <circle cx={cx + Math.cos(spin - Math.PI / 2) * R} cy={cy + Math.sin(spin - Math.PI / 2) * R} r={20} fill={C.yellow} stroke={OL} strokeWidth={4} />
        {nodes.map((n, i) => (
          <g key={i} transform={`translate(${cx + Math.cos(n.a) * R} ${cy + Math.sin(n.a) * R}) scale(${Math.min(1, pop(t, 0.2 + i * 0.4))})`}>
            <rect x={-textW(n.text, 38) / 2 - 26} y={-44} width={textW(n.text, 38) + 52} height={86} rx={30} fill={n.c} stroke={OL} strokeWidth={5} />
            <text y={14} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink} textAnchor="middle">
              {n.text}
            </text>
          </g>
        ))}
        {burst > 0 && (
          <g transform={`translate(${cx} ${cy}) scale(${Math.min(1.05, burst)})`}>
            <circle r={150} fill={C.outcome} stroke={OL} strokeWidth={6} />
            <text y={-20} fontFamily={DISPLAY} fontWeight={800} fontSize={34} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
              <tspan x={0}>«Я же всего лишь</tspan>
              <tspan x={0} dy={42}>пытался помочь!»</tspan>
            </text>
          </g>
        )}
      </g>
      {mirror > 0 && (
        <g opacity={mirror}>
          {[
            { x: A.x0 + 230, title: "«Да, но»", one: "один просит", many: "много советчиков" },
            { x: A.x1 - 230, title: "«Пытаюсь помочь»", one: "один помощник", many: "много советов" },
          ].map((m, i) => (
            <g key={i} transform={`translate(${m.x} 360)`}>
              <rect x={-200} y={-130} width={400} height={300} rx={30} fill="#ffffff" stroke={OL} strokeWidth={5} />
              <text y={-70} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.ink} textAnchor="middle">
                {m.title}
              </text>
              <text y={10} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.inkSoft} textAnchor="middle">
                {m.one}
              </text>
              <text y={80} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.inkSoft} textAnchor="middle">
                {m.many}
              </text>
            </g>
          ))}
          <text x={A.cx} y={380} fontFamily={DISPLAY} fontWeight={800} fontSize={70} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
            ⇄
          </text>
        </g>
      )}
      <Bubble x={A.cx} y={700} text="«Могу вам это достать по дешёвой цене»" k={cheap} tail="none" maxW={900} size={36} />
    </Drift>
  );
};

// ── Помогать — нужно ──
export const CareHelp: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const heart = dotsOf("care-heart", SH.heart(150), cx, 400, ["#ff6b9a", "#ff9fb8", "#ffffff", C.yellow], 13, 260);
  const k = ramp(t, 0.1, 1.4);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <Swarm pts={heart} k={k} t={t} r={6.5} />
      <g transform={`translate(${cx} 400)`} opacity={ramp(t, 1.2, 0.6)}>
        <rect x={-22} y={-70} width={44} height={140} rx={10} fill="#ffffff" stroke={OL} strokeWidth={4} />
        <rect x={-70} y={-22} width={140} height={44} rx={10} fill="#ffffff" stroke={OL} strokeWidth={4} />
      </g>
      <Plate x={cx} y={150} text="помощь нужна — в том числе профессиональная" k={ramp(t, at(ctx, 0.5), 0.5)} bg="#e3fbef" size={38} />
      <Plate x={cx} y={700} text="наблюдение — не повод для грубости" k={ramp(t, at(ctx, 1.2), 0.5)} bg="#ffffff" size={38} />
    </Drift>
  );
};

// ── Хорошие игры: весы ──
export const GoodScale: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const tilt = ease(ramp(t, at(ctx, 1.3), 1.2)) * 14;
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <Plate x={cx} y={150} text="Хорошие игры" k={ramp(t, at(ctx, 0.6), 0.5)} bg={C.yellow} size={56} />
      <g transform={`translate(${cx} 420)`} opacity={ramp(t, at(ctx, 1), 0.6)}>
        <path d="M -40 330 L 0 0 L 40 330 Z" fill="#8a6a3a" stroke={OL} strokeWidth={5} />
        <g transform={`rotate(${-tilt})`}>
          <rect x={-380} y={-12} width={760} height={24} rx={12} fill="#c49a5a" stroke={OL} strokeWidth={5} />
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 340} 0) rotate(${tilt})`}>
              <line x1={-80} y1={130} x2={0} y2={0} stroke={OL} strokeWidth={4} />
              <line x1={80} y1={130} x2={0} y2={0} stroke={OL} strokeWidth={4} />
              <path d="M -120 130 L 120 130 Q 100 190 0 190 Q -100 190 -120 130 Z" fill={sd < 0 ? EGO.A.color : "#c8c8d8"} stroke={OL} strokeWidth={5} />
              <text y={260} fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
                {sd < 0 ? "польза другим" : "мотивы неоднозначны"}
              </text>
            </g>
          ))}
        </g>
      </g>
    </Drift>
  );
};

// ── Карточки (примеры хороших игр) ──
type PCards = HostP & { cards: { title: string; text: string; icon: string; at: number }[] };
const Icon: React.FC<{ kind: string; t: number }> = ({ kind, t }) => {
  if (kind === "mail")
    return (
      <g>
        <rect x={-60} y={-40} width={120} height={80} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
        <path d="M -60 -40 L 0 10 L 60 -40" fill="none" stroke={OL} strokeWidth={5} />
      </g>
    );
  if (kind === "lamp")
    return (
      <g>
        <circle r={44} fill={C.yellow} stroke={OL} strokeWidth={5} opacity={0.85 + 0.15 * Math.sin(t * 3)} />
        <rect x={-20} y={40} width={40} height={26} rx={6} fill="#c8c8d8" stroke={OL} strokeWidth={4} />
      </g>
    );
  if (kind === "hands")
    return (
      <g>
        <path d="M -60 20 Q -30 -30 0 0 Q 30 -30 60 20 L 30 50 L -30 50 Z" fill={C.skin} stroke={OL} strokeWidth={5} />
        <path d="M 0 -20 C -10 -40 -36 -30 -24 -12 L 0 8 L 24 -12 C 36 -30 10 -40 0 -20 Z" fill="#ff6b9a" stroke={OL} strokeWidth={3} />
      </g>
    );
  return <path d="M 0 -50 L 14 -16 L 50 -16 L 22 6 L 32 42 L 0 20 L -32 42 L -22 6 L -50 -16 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={5} transform={`rotate(${Math.sin(t) * 6})`} />;
};
export const CardsScene: React.FC<VisualProps<PCards>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const n = p.cards.length;
  const w = Math.min(420, (A.x1 - A.x0 - 40) / n - 20);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.025}>
      {p.cards.map((c, i) => {
        const k = pop(t, at(ctx, c.at));
        if (k <= 0.01) return null;
        const x = A.x0 + 20 + w / 2 + i * (w + 20) + ((A.x1 - A.x0 - 40) - n * (w + 20) + 20) / 2;
        const titleRows = c.title.split("\n");
        const textRows = c.text.split("\n");
        const tSize = Math.min(38, (w - 40) / (Math.max(...titleRows.map((r) => [...r].length)) * 0.56));
        const bSize = Math.min(30, (w - 40) / (Math.max(...textRows.map((r) => [...r].length)) * 0.56));
        return (
          <g key={i} transform={`translate(${x} 460) scale(${0.7 + 0.3 * Math.min(1, k)})`} opacity={clamp01(k * 1.5)}>
            <rect x={-w / 2 + 6} y={-300 + 10} width={w} height={600} rx={30} fill="#000" opacity={0.16} />
            <rect x={-w / 2} y={-300} width={w} height={600} rx={30} fill="#ffffff" stroke={OL} strokeWidth={5} />
            <g transform="translate(0 -170)">
              <circle r={90} fill={EGO.A.light} stroke={OL} strokeWidth={4} />
              <Icon kind={c.icon} t={t} />
            </g>
            <text y={-10} fontFamily={DISPLAY} fontWeight={800} fontSize={tSize} fill={C.ink} textAnchor="middle">
              {titleRows.map((r, j) => (
                <tspan key={j} x={0} dy={j === 0 ? 0 : tSize * 1.15}>
                  {r}
                </tspan>
              ))}
            </text>
            <text y={150} fontFamily={FONT} fontWeight={800} fontSize={bSize} fill={C.inkSoft} textAnchor="middle">
              {textRows.map((r, j) => (
                <tspan key={j} x={0} dy={j === 0 ? 0 : bSize * 1.2}>
                  {r}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

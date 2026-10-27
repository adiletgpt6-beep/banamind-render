// Мост «доверие» и Навык 4 «Думайте в духе Выиграл/Выиграл»: эмоциональный банковский
// счёт и шесть вкладов, пальто для сына, граница «вклад — не приём»; шесть парадигм и
// маятник, «скачки к Бермудам», мужество и чуткость, пирог достаточности,
// «Выиграл/Выиграл или Не Связываться», пять пунктов соглашения.
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, OL, Person, Tree } from "./draw";
import { Appear, area, at, Check, clamp01, Cross, Drift, Pop, ramp, Txt, type VisualProps } from "./kit";

const H4 = HABIT[4].color;

// банка «счёт доверия»: level 0…1
const Jar: React.FC<{ x: number; y: number; level: number; s?: number; t: number }> = ({ x, y, level, s = 1, t }) => {
  const h = 300;
  const lv = clamp01(level);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-130} y={-h} width={260} height={h} rx={40} fill="#ffffff" opacity={0.35} stroke={OL} strokeWidth={6} />
      <clipPath id="jarClip">
        <rect x={-124} y={-h + 6} width={248} height={h - 12} rx={34} />
      </clipPath>
      <g clipPath="url(#jarClip)">
        <rect x={-130} y={-h * lv} width={260} height={h * lv} fill={lv > 0.35 ? C.teal : C.coral} opacity={0.85} />
        <path d={`M -130 ${-h * lv} q 32 ${-10 + Math.sin(t * 3) * 6} 65 0 t 65 0 t 65 0 t 65 0`} fill="none" stroke="#fff" strokeWidth={5} opacity={0.6} />
      </g>
      <rect x={-150} y={-h - 30} width={300} height={40} rx={14} fill={C.gold} stroke={OL} strokeWidth={5} />
      <rect x={-50} y={-h - 22} width={100} height={12} rx={6} fill={OL} />
      <Txt x={0} y={60} size={32} color={C.white} weight={900}>
        счёт доверия
      </Txt>
    </g>
  );
};

type BankP = { host?: string; mode: "intro" | "deposits" | "limit" };
export const Bank: React.FC<VisualProps<BankP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  if (p.mode === "intro") {
    const ins = ["уважение", "доброта", "сдержанное слово"];
    const outs = ["грубость", "игнор", "нарушенное обещание"];
    const inK = ins.map((_, i) => ramp(t, b1 + i * 0.9, 0.6));
    const outK = outs.map((_, i) => ramp(t, b1 + 3 + i * 0.9, 0.6));
    const level = 0.45 + inK.reduce((a, b) => a + b, 0) * 0.15 - outK.reduce((a, b) => a + b, 0) * 0.27;
    const mines = clamp01((0.25 - level) * 6);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={480}>
        <Person who="marat" x={cx - 360} y={850} s={0.7} t={t} pose="open" mood={level > 0.35 ? "calm" : "sad"} accent={C.teal} />
        <Person who="leila" x={cx + 360} y={850} s={0.7} t={t} pose="stand" mood={level > 0.35 ? "happy" : "sad"} flip />
        <Jar x={cx} y={700} level={level} t={t} />
        {ins.map((s, i) => {
          const k = inK[i];
          if (k <= 0 || k >= 1) return null;
          return (
            <g key={s} transform={`translate(${cx - 40 + i * 40} ${200 + k * 260})`} opacity={1 - k * 0.3}>
              <Icon name="coin" x={0} y={0} s={0.9} />
              <Label x={0} y={-60} text={`+ ${s}`} size={24} bg={C.tealSoft} />
            </g>
          );
        })}
        {outs.map((s, i) => {
          const k = outK[i];
          if (k <= 0 || k >= 1) return null;
          return (
            <g key={s} transform={`translate(${cx + 200 + k * 160} ${480 - k * 260})`} opacity={1 - k * 0.5}>
              <Icon name="coin" x={0} y={0} s={0.9} />
              <Label x={0} y={-60} text={`− ${s}`} size={24} bg={C.coralSoft} />
            </g>
          );
        })}
        {mines > 0 &&
          [0, 1, 2, 3].map((i) => (
            <g key={i} opacity={mines} transform={`translate(${cx - 260 + i * 170} 880)`}>
              <ellipse rx={36} ry={14} fill="#5a6280" stroke={OL} strokeWidth={3} />
              <circle cx={0} cy={-12} r={8} fill={C.coral} />
            </g>
          ))}
        {mines > 0.5 && <Label x={cx} y={300} text="пусто — каждое слово как мина" size={28} bg={C.coralSoft} />}
      </Drift>
    );
  }
  if (p.mode === "deposits") {
    const six = ["понять человека", "мелочи", "обещания", "ясные ожидания", "цельность", "искренние извинения"];
    const coat = ramp(t, b1 - 0.2, 0.6) - ramp(t, b2 + 0.2, 0.5);
    const lab = ramp(t, b2, 0.5);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={480}>
        <g opacity={1 - coat}>
          <Jar x={cx} y={640} level={0.3 + ramp(t, 0.3, Math.max(1, b1 - 0.5)) * 0.55} t={t} s={0.85} />
          {six.map((s, i) => {
            const a = Math.PI + (i / 5) * Math.PI;
            const k = ramp(t, 0.4 + i * ((b1 - 0.8) / 6), 0.5);
            return (
              <g key={s} opacity={k} transform={`translate(${cx + Math.cos(a) * 430} ${470 + Math.sin(a) * 280})`}>
                <circle cx={0} cy={-44} r={22} fill={H4} stroke={OL} strokeWidth={3} />
                <text x={0} y={-35} fontFamily={DISPLAY} fontWeight={800} fontSize={24} fill={C.white} textAnchor="middle">
                  {i + 1}
                </text>
                <Label x={0} y={10} text={s} size={26} bg={C.white} />
              </g>
            );
          })}
        </g>
        {coat > 0 && (
          <g opacity={coat}>
            <rect x={cx - 420} y={560} width={560} height={130} rx={40} fill="#c98a6a" stroke={OL} strokeWidth={5} />
            <g transform={`translate(${cx - 140} 600)`}>
              <circle cx={-170} cy={-10} r={36} fill="#efcfb0" stroke={OL} strokeWidth={4} />
              <path d="M -190 -10 Q -170 -2 -150 -10" stroke={OL} strokeWidth={3} fill="none" />
              <path d="M -130 -40 Q 40 -70 150 -20 L 150 30 L -130 30 Z" fill="#33415f" stroke={OL} strokeWidth={5} />
              <Txt x={-170} y={-60} size={30} color={C.white}>
                z
              </Txt>
            </g>
            <Person who="kid" x={cx + 300} y={860} s={0.8} t={t} pose="stand" mood="sad" flip />
            <Pop t={t} at={b1 + 1.4} x={cx + 120} y={300}>
              <Bubble x={0} y={0} text={"а меня бы\nтоже укрыли?"} w={300} size={30} tail="right" think />
            </Pop>
          </g>
        )}
        {lab > 0 && (
          <g opacity={lab} transform={`translate(${cx} 470) scale(${0.85 + 0.15 * lab})`}>
            <Card x={0} y={0} w={760} h={200} color={H4} title="в отношениях" lines={["мелочи не являются мелочами"]} size={40} titleSize={40} />
          </g>
        )}
      </Drift>
    );
  }
  // limit
  const apol = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - apol}>
        <Jar x={cx - 250} y={700} level={0.5} t={t} s={0.8} />
        <Appear t={t} at={0.4} x={cx + 250} y={330}>
          <Label x={0} y={0} text="вклад определяет тот," size={30} bg={C.white} />
          <Label x={0} y={70} text="кому он адресован" size={30} bg={C.white} />
        </Appear>
        <Appear t={t} at={b1} x={cx + 250} y={600}>
          <g>
            <Icon name="coin" x={0} y={0} s={1.4} />
            <path d="M 0 -40 Q 40 -120 0 -180" stroke={OL} strokeWidth={5} fill="none" />
            <path d="M -20 -180 L 20 -180" stroke={OL} strokeWidth={5} />
            <Label x={0} y={90} text="«вклад» ради выгоды" size={26} bg={C.coralSoft} />
            <Cross x={0} y={0} s={130} k={ramp(t, b1 + 1.2, 0.6)} />
          </g>
        </Appear>
      </g>
      {apol > 0 && (
        <g opacity={apol}>
          <Person who="marat" x={cx - 200} y={860} s={0.8} t={t} pose="open" mood="sad" accent={C.teal} />
          <Person who="leila" x={cx + 200} y={860} s={0.8} t={t} pose="stand" mood={t > b2 + 2 ? "calm" : "neutral"} flip />
          <Bubble x={cx - 160} y={330} text={"Прости за утреннее\n«не сейчас»"} w={380} size={30} tail="down" bg={C.tealSoft} />
          <Pop t={t} at={b2 + 2} x={cx + 200} y={330}>
            <Icon name="heart" x={0} y={0} s={1.5} color={C.rose} />
          </Pop>
        </g>
      )}
    </Drift>
  );
};

// ───────────── шесть парадигм ─────────────
const PARA = [
  { a: "В", b: "П", label: "Выиграл/Проиграл", sub: "я — за ваш счёт" },
  { a: "П", b: "В", label: "Проиграл/Выиграл", sub: "уступаю, лишь бы не спорить" },
  { a: "П", b: "П", label: "Проиграл/Проиграл", sub: "плохо обоим" },
  { a: "В", b: "", label: "Выиграл", sub: "важно только моё" },
  { a: "В", b: "В", label: "Выиграл/Выиграл", sub: "выгода обоим" },
  { a: "В/В", b: "∅", label: "…или Не Связываться", sub: "честно без сделки" },
];

export const Paradigms: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const pend = ramp(t, b2, 0.6);
  const swing = Math.sin(t * 2.2) * 32;
  const cw = 360;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <g opacity={1 - pend}>
        {PARA.map((pp, i) => {
          const order = [0, 1, 2, 3, 4, 5][i];
          const at0 = i < 4 ? b1 + i * 1.6 : 0.4 + (i - 4) * 0.6;
          const k = ramp(t, at0, 0.5);
          const col = i % 3;
          const row = Math.floor(i / 3);
          const good = i >= 4;
          return (
            <g key={order} opacity={0.25 + 0.75 * k} transform={`translate(${cx + (col - 1) * (cw + 30)} ${300 + row * 260}) scale(${0.9 + 0.1 * k})`}>
              <rect x={-cw / 2} y={-105} width={cw} height={210} rx={28} fill={good ? HABIT[4].soft : C.white} stroke={OL} strokeWidth={5} />
              <g transform="translate(0 -38)">
                {[pp.a, pp.b].map((s, j) =>
                  s ? (
                    <g key={j} transform={`translate(${(j - 0.5) * 120} 0)`}>
                      <circle r={36} fill={s.startsWith("В") ? C.green : s === "∅" ? "#9aa6c4" : C.coral} stroke={OL} strokeWidth={4} />
                      <text y={12} fontFamily={DISPLAY} fontWeight={800} fontSize={s.length > 1 ? 24 : 34} fill={C.white} textAnchor="middle">
                        {s}
                      </text>
                    </g>
                  ) : null,
                )}
              </g>
              <text y={40} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink} textAnchor="middle">
                {pp.label}
              </text>
              <text y={78} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.inkSoft} textAnchor="middle">
                {pp.sub}
              </text>
            </g>
          );
        })}
      </g>
      {pend > 0 && (
        <g opacity={pend}>
          <g transform={`translate(${cx} 230) rotate(${swing})`}>
            <line x1={0} y1={0} x2={0} y2={380} stroke={OL} strokeWidth={8} />
            <circle cx={0} cy={400} r={46} fill={C.sun} stroke={OL} strokeWidth={6} />
          </g>
          <circle cx={cx} cy={230} r={14} fill={OL} />
          <Label x={cx - 380} y={600} text="давлю" size={36} bg={C.coralSoft} />
          <Label x={cx + 380} y={600} text="уступаю из чувства вины" size={30} bg={C.coralSoft} />
          <Appear t={t} at={b2 + 1.8} x={cx} y={820}>
            <Label x={0} y={0} text="в долгих отношениях победа за чужой счёт → общий проигрыш" size={26} bg={C.white} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ───────────── скачки к Бермудам ─────────────
export const Horses: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0;
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const tree = ramp(t, b1, 0.7);
  const colors = [C.coral, "#3d8bff", C.violet, C.sunDeep];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - tree}>
        <rect x={x0 + 40} y={420} width={A.x1 - x0 - 80} height={420} rx={30} fill="#7cc86b" stroke={OL} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={x0 + 60} y1={500 + i * 95} x2={A.x1 - 60} y2={500 + i * 95} stroke="#fff" strokeWidth={4} strokeDasharray="20 16" opacity={0.7} />)}
        <g transform={`translate(${A.x1 - 160} 470)`}>
          <rect x={-8} y={-60} width={16} height={380} fill="#fff" stroke={OL} strokeWidth={3} />
          <rect x={-130} y={-200} width={260} height={110} rx={20} fill={C.sun} stroke={OL} strokeWidth={5} />
          <text y={-158} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill={C.ink} textAnchor="middle">
            Бермуды
          </text>
          <text y={-114} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink} textAnchor="middle">
            приз — одному
          </text>
        </g>
        {colors.map((c, i) => {
          const hx = x0 + 160 + ((t * (60 + i * 14) + i * 70) % (A.x1 - x0 - 460));
          const hy = 520 + i * 95;
          const gallop = Math.sin(t * 10 + i) * 6;
          return (
            <g key={i} transform={`translate(${hx} ${hy + gallop})`}>
              <ellipse cx={0} cy={0} rx={70} ry={30} fill="#a86f52" stroke={OL} strokeWidth={4} />
              <path d="M 50 -10 L 90 -50 L 110 -40 L 80 0 Z" fill="#a86f52" stroke={OL} strokeWidth={4} />
              {[-40, -20, 20, 40].map((lx, j) => <line key={j} x1={lx} y1={20} x2={lx + Math.sin(t * 10 + j) * 10} y2={56} stroke={OL} strokeWidth={6} strokeLinecap="round" />)}
              <circle cx={-10} cy={-48} r={26} fill="#efcfb0" stroke={OL} strokeWidth={4} />
              <rect x={-30} y={-30} width={40} height={20} rx={6} fill={c} />
            </g>
          );
        })}
        <Person who="boss" x={x0 + 180} y={380} s={0.48} t={t} pose="open" mood="happy" />
        <Pop t={t} at={0.8} x={x0 + 430} y={200}>
          <Bubble x={0} y={0} text="Сотрудничайте!" w={320} size={32} tail="left" />
        </Pop>
      </g>
      {tree > 0 && (
        <g opacity={tree}>
          <Tree x={cx} y={620} s={1.3} t={t} color={C.grass} />
          {[-1, 0, 1].map((i) => <path key={i} d={`M ${cx} 620 q ${i * 60} 80 ${i * 160} 160`} stroke={C.wood} strokeWidth={14} fill="none" strokeLinecap="round" />)}
          <Label x={cx + 330} y={360} text="плод: поведение" size={30} bg={C.white} />
          <Label x={cx + 300} y={760} text="корень: система поощрения" size={30} bg={HABIT[4].soft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── мужество и чуткость; пирог ─────────────
export const Courage: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const pie = ramp(t, b2, 0.6);
  const gx = cx - 300;
  const gy = 160;
  const S = 560;
  const dotK = ramp(t, b1 + 1.6, 1.2);
  const phase = t < b1 ? 0 : t < b1 + 0.8 ? 1 : t < b1 + 1.6 ? 2 : 3;
  const dot = [
    [0.15, 0.15],
    [0.2, 0.85],
    [0.85, 0.2],
    [0.85, 0.85],
  ][phase];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <g opacity={1 - pie}>
        <rect x={gx} y={gy} width={S} height={S} rx={20} fill={C.white} opacity={0.94} stroke={OL} strokeWidth={5} />
        <line x1={gx + S / 2} y1={gy + 10} x2={gx + S / 2} y2={gy + S - 10} stroke="#dfe5f0" strokeWidth={4} />
        <line x1={gx + 10} y1={gy + S / 2} x2={gx + S - 10} y2={gy + S / 2} stroke="#dfe5f0" strokeWidth={4} />
        <Txt x={gx + S / 2} y={gy + S + 50} size={30} color={C.white} weight={900}>
          чуткость →
        </Txt>
        <g transform={`translate(${gx - 40} ${gy + S / 2}) rotate(-90)`}>
          <Txt x={0} y={0} size={30} color={C.white} weight={900}>
            мужество →
          </Txt>
        </g>
        <Txt x={gx + S * 0.25} y={gy + S * 0.22} size={30} weight={900} color={C.coralDeep}>
          давлю
        </Txt>
        <Txt x={gx + S * 0.75} y={gy + S * 0.8} size={30} weight={900} color={C.coralDeep}>
          сдаюсь
        </Txt>
        <Txt x={gx + S * 0.75} y={gy + S * 0.22} size={30} weight={900} color={C.grassDeep}>
          зрелость
        </Txt>
        <circle cx={gx + S * (phase === 1 ? 0.2 : dot[0])} cy={gy + S * (1 - (phase === 1 ? 0.85 : dot[1]))} r={26 + 4 * Math.sin(t * 4)} fill={phase === 3 ? C.green : C.coral} stroke={OL} strokeWidth={4} opacity={phase === 0 ? 0 : 1} />
        {phase === 3 && <circle cx={gx + S * 0.85} cy={gy + S * 0.15} r={60 * dotK} fill="none" stroke={C.green} strokeWidth={6} opacity={1 - dotK * 0.5} />}
        <Appear t={t} at={0.6} x={gx + S + 260} y={360}>
          <Card x={0} y={0} w={420} h={220} color={H4} title="зрелость =" lines={["мужество", "+ чуткость"]} size={34} titleSize={40} />
        </Appear>
      </g>
      {pie > 0 && (
        <g opacity={pie}>
          {[0, 1].map((side) => {
            const px = cx + (side ? 280 : -280);
            const r = side ? 120 + ramp(t, b2 + 1.6, 1.4) * 70 : 140;
            return (
              <g key={side} transform={`translate(${px} 470)`}>
                <circle r={r} fill="#f2c27a" stroke={OL} strokeWidth={6} />
                <circle r={r * 0.82} fill="#e8a956" />
                {Array.from({ length: side ? 8 : 4 }).map((_, i) => {
                  const a = (i / (side ? 8 : 4)) * Math.PI * 2;
                  return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke={OL} strokeWidth={4} />;
                })}
                <Label x={0} y={r + 70} text={side ? "можно испечь больше" : "один пирог на всех"} size={28} bg={side ? C.tealSoft : C.coralSoft} />
              </g>
            );
          })}
          <Txt x={cx} y={250} size={36} color={C.white} weight={900}>
            менталитет достаточности
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ───────────── Выиграл/Выиграл или не связываться ─────────────
export const NoDeal: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const lim = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <g opacity={1 - lim}>
        <rect x={cx - 420} y={620} width={840} height={40} rx={14} fill={C.wood} stroke={OL} strokeWidth={4} />
        <Person who="marat" x={cx - 330} y={860} s={0.7} t={t} pose="open" mood="calm" accent={C.teal} />
        <Person who="dina" x={cx + 330} y={860} s={0.7} t={t} pose="open" mood="calm" flip />
        <Appear t={t} at={0.5} x={cx} y={300}>
          <g>
            <rect x={-340} y={-80} width={680} height={160} rx={34} fill={C.white} stroke={OL} strokeWidth={5} />
            <text y={-10} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink} textAnchor="middle">
              Выиграл/Выиграл
            </text>
            <text y={44} fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.inkSoft} textAnchor="middle">
              или Не Связываться
            </text>
          </g>
        </Appear>
        <Appear t={t} at={b1} x={cx} y={520}>
          <Label x={-200} y={0} text="без давления" size={28} bg={C.tealSoft} />
          <Label x={200} y={0} text="без хитрости" size={28} bg={C.tealSoft} />
        </Appear>
        <Appear t={t} at={b1 + 2} x={cx} y={150}>
          <Label x={0} y={0} text="в семье — честный компромисс" size={28} bg={C.white} />
        </Appear>
      </g>
      {lim > 0 && (
        <g opacity={lim} transform={`translate(${cx} 460) scale(${0.85 + 0.15 * lim})`}>
          <Card x={0} y={0} w={880} h={280} color={H4} title="Граница инструмента" lines={["не каждый конфликт решается без потерь", "но сначала стоит искать решение для обоих"]} size={32} titleSize={42} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── пять пунктов договора ─────────────
export const Agreement: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const items = ["желаемый результат", "правила", "ресурсы", "отчётность", "последствия"];
  const doc = ramp(t, b1 + 1.2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <g opacity={1 - doc}>
        <Person who="marat" x={cx - 340} y={860} s={0.72} t={t} pose="open" mood="calm" accent={C.teal} />
        <Person who="dina" x={cx + 340} y={860} s={0.72} t={t} pose={t > b1 ? "open" : "cross"} mood={t > b1 ? "happy" : "tense"} flip />
        <Pop t={t} at={0.6} x={cx - 260} y={300}>
          <Bubble x={0} y={0} text={"Что вам на самом деле\nнужно от бюджета?"} w={420} size={28} tail="down" bg={C.tealSoft} />
        </Pop>
        <Appear t={t} at={b1} x={0} y={0}>
          <Label x={cx + 300} y={290} text="ей: сроки" size={30} bg={C.white} />
          <Label x={cx - 300} y={470} text="ему: люди" size={30} bg={C.white} />
        </Appear>
      </g>
      {doc > 0 && (
        <g opacity={doc} transform={`translate(${cx} 470) scale(${0.85 + 0.15 * doc})`}>
          <rect x={-300} y={-330} width={600} height={620} rx={22} fill={C.paper} stroke={OL} strokeWidth={6} />
          <text y={-262} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={H4} textAnchor="middle">
            договор
          </text>
          {items.map((s, i) => {
            const k = ramp(t, b1 + 1.8 + i * 0.7, 0.5);
            return (
              <g key={s} transform={`translate(-240 ${-180 + i * 98})`}>
                <rect x={0} y={-30} width={56} height={56} rx={12} fill={C.white} stroke={OL} strokeWidth={4} />
                <Check x={28} y={-4} s={26} k={k} />
                <text x={80} y={10} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} opacity={0.4 + 0.6 * k}>
                  {s}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </Drift>
  );
};


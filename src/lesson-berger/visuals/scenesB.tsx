// Сцены BM-038, часть B: камера 1 «Социальная валюта» и камера 2 «Триггеры».
import React from "react";
import { C, CELL, type CellId } from "../theme";
import { Bubble, Plate } from "./core";
import { Morph, Swarm } from "./dots";
import { OL, Person } from "./draw";
import { Appear, Arrow, area, at, Check, clamp01, Cross, Drift, ease, Pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Bars, BigNum, buildNet, Chamber, Lamp, Net, Spark } from "./lab";
import { pic, PICS } from "./pix";

type P = { host?: string; [k: string]: unknown };
const CUR = CELL.currency;
const TRG = CELL.triggers;

// ── Телефонная будка и тайный бар ──
export const Booth: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const bx = a.cx - 160;
  const pts = pic("booth", PICS.booth, bx, 460, 2.9, 12);
  const k = ramp(t, 0.2, 1.4);
  const dial = ramp(t, at(ctx, 1), 1.2);
  const open = ramp(t, at(ctx, 2), 1.2);
  const ring = at(ctx, 1.6) < t && t < at(ctx, 2.1);
  return (
    <Drift t={t} dur={ctx.dur} cx={bx} cy={460} amount={0.06}>
      {/* тёплый свет бара за дверью */}
      {open > 0 && (
        <g opacity={open}>
          <rect x={bx - 130} y={210} width={260} height={500} rx={12} fill="#ffcf7a" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={bx - 70 + i * 46} cy={330 + (i % 2) * 40} r={16} fill="#fff3cc" />
          ))}
          <Txt x={bx} y={560} size={30} weight={900} color="#7a3b1a">
            Please Don’t Tell
          </Txt>
        </g>
      )}
      <g transform={`translate(${-320 * open} 0)`} opacity={1 - open * 0.15}>
        <Swarm pts={pts.map((q) => ({ ...q, x: q.x }))} k={k} t={t} r={5.8} from="below" />
      </g>
      {/* телефонный диск */}
      <g transform={`translate(${a.cx + 300} 380)`} opacity={ramp(t, at(ctx, 0.9), 0.5) * (1 - open)}>
        <circle r={150} fill="#1d2340" stroke={OL} strokeWidth={6} />
        <g transform={`rotate(${dial * 200})`}>
          {Array.from({ length: 10 }, (_, i) => {
            const ang = ((i * 30 + 60) * Math.PI) / 180;
            return <circle key={i} cx={Math.cos(ang) * 104} cy={Math.sin(ang) * 104} r={26} fill={i === 1 ? C.yellow : "#fff"} stroke={OL} strokeWidth={3} />;
          })}
        </g>
        <circle r={46} fill="#c94a42" stroke={OL} strokeWidth={4} />
        <Txt x={0} y={18} size={54} weight={900} color="#fff">
          2
        </Txt>
      </g>
      {ring && <Bubble x={a.cx + 300} y={170} text="«У вас забронирован столик?»" k={1} size={34} />}
      <Plate x={a.cx + 280} y={330} text="без рекламы" k={ramp(t, at(ctx, 3), 0.4)} bg="#fff" />
      <Plate x={a.cx + 280} y={450} text="бронь в 15:00" k={ramp(t, at(ctx, 3.3), 0.4)} bg={CUR.light} edge={CUR.deep} />
      <Plate x={a.cx + 280} y={570} text="к 15:30 мест нет" k={ramp(t, at(ctx, 3.65), 0.4)} bg={C.yellow} />
    </Drift>
  );
};

// ── Маленький секрет о секретах ──
export const Secret: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const nodes = buildNet("secret", a.cx, 380, { gens: 3, fan: 2.3, step: 140, spread: Math.PI * 1.6, dir: Math.PI / 2, colors: [CUR.color, CUR.deep, C.spark, CELL.emotion.color] });
  const grow = clamp01((t - 0.8) / 3.5) * 3;
  const card = ramp(t, 0.2, 0.6);
  return (
    <g>
      <Net nodes={nodes} k={grow} t={t} r={16} />
      <g transform={`translate(${a.cx} ${320}) rotate(${-5 + wob(t, 1, 2)}) scale(${0.8 + 0.2 * card})`} opacity={card}>
        <rect x={-210} y={-110} width={420} height={220} rx={18} fill="#1d2340" stroke={OL} strokeWidth={6} />
        <Txt x={0} y={-24} size={34} weight={900} color="#fff">
          Пожалуйста,
        </Txt>
        <Txt x={0} y={22} size={34} weight={900} color="#fff">
          не говорите никому
        </Txt>
        <Txt x={0} y={78} size={30} weight={800} color={C.yellow}>
          ☎ · · · · · ·
        </Txt>
      </g>
      <Plate x={a.cx} y={820} text="«я в курсе» = социальная валюта" size={38} k={ramp(t, at(ctx, 1.3), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Почему нам приятно говорить о себе ──
export const SelfTalk: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const share = ramp(t, 0.3, 1.4);
  // кольцо «о себе» 40 %
  const R = 150;
  const cx = a.cx - 330;
  const cy = 360;
  const frac = 0.4 * share;
  const ang = -Math.PI / 2 + frac * Math.PI * 2;
  const brain = ramp(t, at(ctx, 1), 0.6);
  const glow = brain * (0.5 + 0.5 * Math.sin(t * 4));
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="#fff" stroke={OL} strokeWidth={5} />
      {frac > 0.005 && <path d={`M ${cx} ${cy} L ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx + Math.cos(ang) * R} ${cy + Math.sin(ang) * R} Z`} fill={CUR.color} stroke={OL} strokeWidth={4} />}
      <BigNum x={cx} y={cy + R + 90} text="40 %+" sub="разговоров — о себе" k={share} color={CUR.deep} size={84} />
      {/* мозг и центр вознаграждения */}
      <g transform={`translate(${a.cx + 300} 330)`} opacity={brain}>
        <path d="M -150 20 C -170 -80 -60 -140 10 -120 C 90 -150 170 -80 150 10 C 170 90 90 140 20 120 C -50 150 -150 110 -150 20 Z" fill="#ffd9e3" stroke={OL} strokeWidth={6} />
        <path d="M -90 -40 C -50 -70 -10 -20 30 -60 M -100 30 C -60 0 -20 50 30 10 C 60 -10 90 30 110 0 M -40 80 C 0 60 40 100 80 60" fill="none" stroke={CELL.emotion.deep} strokeWidth={5} strokeLinecap="round" />
        <circle cx={20} cy={10} r={30 + glow * 14} fill={C.yellow} opacity={0.35 + glow * 0.4} />
        <circle cx={20} cy={10} r={22} fill={C.yellow} stroke={OL} strokeWidth={4} />
      </g>
      <Plate x={a.cx + 300} y={540} text="как награда: еда, деньги" size={34} k={ramp(t, at(ctx, 1.4), 0.5)} bg="#fff" />
      <Appear t={t} at={at(ctx, 2)} x={a.cx + 300} y={720}>
        <rect x={-240} y={-62} width={480} height={124} rx={28} fill={CUR.light} stroke={CUR.deep} strokeWidth={5} />
        <Txt x={-110} y={20} size={56} weight={900} color={CUR.deep}>
          −25 % $
        </Txt>
        <Txt x={120} y={0} size={30} weight={900}>
          ради права
        </Txt>
        <Txt x={120} y={36} size={30} weight={900}>
          высказаться
        </Txt>
      </Appear>
    </g>
  );
};

// ── Тараканы и факты под крышечкой ──
export const Roaches: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const tell = ramp(t, at(ctx, 1), 1.5);
  const cap = ramp(t, at(ctx, 2), 0.8);
  // таракан — простой условный жучок (без натурализма)
  const bug = (x: number, y: number, s: number, i: number) => (
    <g key={i} transform={`translate(${x + Math.sin(t * 3 + i) * 6} ${y}) scale(${s}) rotate(${Math.sin(t * 2 + i) * 12})`}>
      <ellipse rx={22} ry={13} fill="#8a5a3c" stroke={OL} strokeWidth={3} />
      <circle cx={22} cy={0} r={8} fill="#6a4632" stroke={OL} strokeWidth={3} />
      <path d="M 28 -4 L 44 -14 M 28 4 L 44 14 M -6 -12 L -12 -24 M 6 -12 L 10 -24 M -6 12 L -12 24 M 6 12 L 10 24" stroke={OL} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
    <g opacity={1 - cap}>
      <g transform={`translate(0 ${-cap * 30})`}>
        <rect x={a.cx - 560} y={480} width={420} height={40} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
        {[0, 1, 2].map((i) => bug(a.cx - 470 + i * 110, 460, 0.8, i))}
        <Plate x={a.cx - 350} y={600} text="как было" size={34} k={ramp(t, 0.6, 0.4)} bg="#fff" />
        <Arrow x1={a.cx - 110} y1={470} x2={a.cx + 70} y2={470} k={tell} color={CUR.deep} />
        <g opacity={tell}>
          {[0, 1, 2, 3, 4].map((i) => bug(a.cx + 220 + (i % 3) * 120, 360 + Math.floor(i / 3) * 140, 1.5 + (i % 2) * 0.3, i + 3))}
        </g>
        <Plate x={a.cx + 340} y={640} text="как рассказали другу" size={34} k={tell} bg={C.yellow} />
      </g>
    </g>
    <RoachesCap {...ctx} />
    </g>
  );
};

// крышечка с фактом поверх сцены с тараканами
const RoachesCap: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const cap = ramp(t, at(ctx, 2), 0.8);
  if (cap <= 0) return null;
  const pts = pic("cap", PICS.cap, a.cx - 260, 440, 2.0, 11);
  return (
    <g>
      <Swarm pts={pts} k={cap} t={t} r={5} from="center" />
      <Appear t={t} at={at(ctx, 2.2)} x={a.cx + 260} y={430}>
        <rect x={-300} y={-120} width={600} height={240} rx={30} fill="#fff" stroke={CUR.deep} strokeWidth={6} />
        <Txt x={0} y={-40} size={36} weight={900} color={CUR.deep}>
          Факт под крышечкой:
        </Txt>
        <Txt x={0} y={14} size={34} weight={800}>
          стеклянный мячик
        </Txt>
        <Txt x={0} y={60} size={34} weight={800}>
          прыгает выше резинового
        </Txt>
      </Appear>
    </g>
  );
};

// ── Три способа дать социальную валюту ──
export const ThreeWays: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const items: [string, string, string][] = [
    ["star", "необычное", "обсуждают вдвое чаще"],
    ["coin", "игровые механизмы", "уровни · статусы · значки"],
    ["key", "причастность", "45 мест в баре"],
  ];
  return (
    <g>
      {items.map(([ic, name, sub], i) => {
        const x = a.cx - 400 + i * 400;
        const k = ramp(t, at(ctx, i) + 0.1, 0.7);
        const pts = pic(`three-${ic}`, PICS[ic], x, 380, 1.15, 9);
        return (
          <g key={ic}>
            <Appear t={t} at={at(ctx, i)} x={0} y={0}>
              <rect x={x - 180} y={190} width={360} height={520} rx={34} fill="#fff" stroke={CUR.deep} strokeWidth={5} />
              <circle cx={x - 130} cy={240} r={30} fill={CUR.color} stroke={OL} strokeWidth={4} />
              <Txt x={x - 130} y={254} size={36} weight={900} color="#fff">
                {`${i + 1}`}
              </Txt>
            </Appear>
            <Swarm pts={pts} k={k} t={t} r={4.4} from="center" />
            <Txt x={x} y={570} size={31} weight={900} color={CUR.deep} opacity={k}>
              {name}
            </Txt>
            <Txt x={x} y={630} size={22} weight={800} color={C.inkSoft} opacity={ramp(t, at(ctx, i + 0.5), 0.5)}>
              {sub}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── Распродажа для своих ──
export const Invite: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const same = ramp(t, at(ctx, 0.45), 0.6);
  const gate = ramp(t, at(ctx, 0.7), 0.6);
  const sold = clamp01((t - at(ctx, 1.3)) / 1.6);
  const rack = (x: number, label: string, vip: boolean) => (
    <g>
      <rect x={x - 230} y={200} width={460} height={420} rx={26} fill={vip ? CUR.light : "#eef0f6"} stroke={vip ? CUR.deep : "#8a93b8"} strokeWidth={5} />
      <Txt x={x} y={260} size={34} weight={900} color={vip ? CUR.deep : C.inkSoft}>
        {label}
      </Txt>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const gone = vip && sold * 6 > i;
        return (
          <g key={i} transform={`translate(${x - 150 + (i % 3) * 150} ${360 + Math.floor(i / 3) * 140})`} opacity={gone ? 0.25 : 1}>
            <path d="M -40 -40 L -16 -52 Q 0 -40 16 -52 L 40 -40 L 50 -10 L 30 -6 L 30 50 L -30 50 L -30 -6 L -50 -10 Z" fill={["#ff6f93", "#5b9cff", "#22b35e", "#f5a524", "#8b5cf6", "#17b3a3"][i]} stroke={OL} strokeWidth={3} />
            {gone && <Txt x={0} y={14} size={22} weight={900} color={C.red}>продано</Txt>}
          </g>
        );
      })}
    </g>
  );
  return (
    <g>
      {rack(a.cx - 290, "обычный сайт", false)}
      <g opacity={same}>{rack(a.cx + 290, "только по приглашению", true)}</g>
      <Plate x={a.cx} y={170} text="те же самые вещи" size={34} k={same} bg="#fff" />
      <Pop t={t} at={at(ctx, 0.75)} x={a.cx + 470} y={180}>
        <g opacity={gate}>
          <rect x={-70} y={-44} width={140} height={88} rx={14} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <path d="M -50 -30 L 0 6 L 50 -30" fill="none" stroke={OL} strokeWidth={5} />
        </g>
      </Pop>
      <Plate x={a.cx + 290} y={700} text="11:00 → к 11:03 всё раскуплено" size={32} k={ramp(t, at(ctx, 1.1), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Деньги или положение среди других ──
export const Status: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const ctxK = ramp(t, at(ctx, 1), 0.8);
  const pick = ramp(t, at(ctx, 2), 0.6);
  const col = (x: number, mine: number, others: number, label: string, chosen: boolean) => {
    const sc = 0.0021;
    return (
      <g>
        <rect x={x - 280} y={170} width={560} height={600} rx={30} fill={chosen && pick > 0 ? CUR.light : "#fff"} stroke={chosen && pick > 0 ? CUR.deep : "#a7aec6"} strokeWidth={chosen && pick > 0 ? 7 : 4} />
        <Txt x={x} y={230} size={36} weight={900}>
          {label}
        </Txt>
        <line x1={x - 220} y1={700} x2={x + 220} y2={700} stroke={OL} strokeWidth={4} />
        <rect x={x - 170} y={700 - mine * sc * ramp(t, 0.4, 0.8)} width={130} height={mine * sc * ramp(t, 0.4, 0.8)} rx={10} fill={CUR.color} stroke={OL} strokeWidth={4} />
        <Txt x={x - 105} y={740} size={26} weight={800} color={C.inkSoft}>
          вы
        </Txt>
        <Txt x={x - 105} y={690 - mine * sc} size={32} weight={900}>
          {`$${(mine / 1000).toFixed(0)} 000`}
        </Txt>
        <g opacity={ctxK}>
          <rect x={x + 40} y={700 - others * sc * ctxK} width={130} height={others * sc * ctxK} rx={10} fill="#c3cbe0" stroke={OL} strokeWidth={4} />
          <Txt x={x + 105} y={740} size={26} weight={800} color={C.inkSoft}>
            коллеги
          </Txt>
          <Txt x={x + 105} y={690 - others * sc * ctxK} size={32} weight={900}>
            {`$${(others / 1000).toFixed(0)} 000`}
          </Txt>
        </g>
        {chosen && <Check x={x + 200} y={240} s={50} k={pick} />}
      </g>
    );
  };
  return (
    <g>
      {col(a.cx - 300, 50000, 25000, "работа А", true)}
      {col(a.cx + 300, 100000, 200000, "работа Б", false)}
      <Plate x={a.cx} y={840} text="большинство выбрало А" size={36} k={pick} bg={C.yellow} />
    </g>
  );
};

// ── Не платите за рекомендации ──
export const Money: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const heart = pic("money-heart", PICS.heart, a.cx - 280, 420, 1.7, 11);
  const coin = pic("money-coin", PICS.coin, a.cx - 280, 420, 1.7, 11);
  const m = ramp(t, at(ctx, 0.5), 1.4);
  const fall = ramp(t, at(ctx, 1.3), 1.2);
  return (
    <g>
      <Morph a={heart} b={coin} k={m} t={t} r={5} />
      <Plate x={a.cx - 280} y={680} text={m < 0.5 ? "нравится — советую" : "платят — советую"} size={34} k={ramp(t, 0.3, 0.5)} bg="#fff" />
      {/* качество советов */}
      <g transform={`translate(${a.cx + 280} 0)`} opacity={ramp(t, at(ctx, 1), 0.5)}>
        <Txt x={0} y={220} size={34} weight={900}>
          качество советов
        </Txt>
        <line x1={-200} y1={640} x2={200} y2={640} stroke={OL} strokeWidth={4} />
        <path d={`M -180 ${330} Q 0 ${330 + 40 * fall} 180 ${330 + 260 * fall}`} fill="none" stroke={CELL.emotion.color} strokeWidth={14} strokeLinecap="round" />
        <circle cx={180} cy={330 + 260 * fall} r={18} fill={CELL.emotion.color} stroke={OL} strokeWidth={4} />
      </g>
      <Plate x={a.cx} y={820} text="деньги гасят внутреннюю мотивацию" size={36} k={ramp(t, at(ctx, 0.8), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Сбой гипотезы камеры (общий вид) ──
export const Limit: React.FC<VisualProps<P & { cell: CellId; ok: string; bad: string; note: string; warn?: boolean }>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const c = CELL[p.cell];
  const w = 640;
  const h = 560;
  const x = a.x0 + 10;
  const lamp = ramp(t, at(ctx, 0.3), 0.6);
  const nodes = buildNet(`limit-${p.cell}`, x + w / 2, 520, { gens: 3, fan: 2, step: 110, spread: Math.PI * 1.4, dir: -Math.PI / 2, dead: p.warn ? 0.1 : 0.45, colors: [c.color, c.deep, C.spark] });
  const grow = clamp01(t / 3) * 3;
  return (
    <g>
      <Chamber cell={p.cell} x={x} y={170} w={w} h={h} k={ramp(t, 0, 0.5)} glow={p.warn ? 0 : 0.3}>
        <Net nodes={nodes} k={grow} t={t} r={13} edge={p.warn ? undefined : undefined} />
        <Spark x={x + w / 2} y={520} r={26} t={t} color={c.color} />
        {p.warn && <rect x={x} y={170} width={w} height={h} fill={C.red} opacity={0.08 + 0.06 * Math.sin(t * 5)} />}
      </Chamber>
      <Lamp x={x + w - 40} y={130} t={t} k={lamp} color={p.warn ? C.red : C.gold} s={0.8} />
      <g transform={`translate(${x + w + 290} 0)`}>
        <Appear t={t} at={at(ctx, 0.6)} y={300}>
          <rect x={-250} y={-60} width={500} height={120} rx={26} fill="#fff" stroke={C.green} strokeWidth={5} />
          <Check x={-190} y={0} s={36} k={1} />
          <Txt x={30} y={12} size={34} weight={900}>
            {p.ok}
          </Txt>
        </Appear>
        <Appear t={t} at={at(ctx, 1)} y={460}>
          <rect x={-250} y={-60} width={500} height={120} rx={26} fill="#ffe1d8" stroke={C.red} strokeWidth={5} />
          <Cross x={-190} y={0} s={54} k={1} />
          <Txt x={30} y={12} size={34} weight={900}>
            {p.bad}
          </Txt>
        </Appear>
        <Plate x={0} y={630} text={p.note} size={32} k={ramp(t, at(ctx, 1.4), 0.5)} bg={C.yellow} />
      </g>
    </g>
  );
};

// ── Парк или хлопья: всплеск и долгий разговор ──
export const Curves: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const x0 = a.cx - 520;
  const x1 = a.cx + 520;
  const base = 700;
  const draw = clamp01((t - at(ctx, 1)) / 3);
  const spike = (u: number) => 340 * Math.exp(-u * 9) * (u > 0.02 ? 1 : u / 0.02);
  const steady = (u: number) => 110 + 26 * Math.sin(u * Math.PI * 14);
  const path = (f: (u: number) => number) => {
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n * draw; i++) {
      const u = i / n;
      pts.push(`${i === 0 ? "M" : "L"} ${x0 + u * (x1 - x0)} ${base - f(u)}`);
    }
    return pts.join(" ");
  };
  const castle = pic("castle", PICS.castle, a.cx - 300, 330, 1.25, 10);
  const bowl = pic("bowl", PICS.bowl, a.cx + 300, 330, 1.25, 10);
  const icons = 1 - ramp(t, at(ctx, 1), 0.6) * 0.9;
  const pirate = ramp(t, at(ctx, 3), 0.6);
  const boring = ramp(t, at(ctx, 4), 0.6);
  return (
    <g>
      <g opacity={icons}>
        <Swarm pts={castle} k={ramp(t, 0.6, 1)} t={t} r={4.4} />
        <Swarm pts={bowl} k={ramp(t, 1.0, 1)} t={t} r={4.4} />
        <Txt x={a.cx} y={350} size={70} weight={900} color={C.inkSoft}>
          или
        </Txt>
      </g>
      {draw > 0 && (
        <g>
          <line x1={x0} y1={base} x2={x1} y2={base} stroke={OL} strokeWidth={5} strokeLinecap="round" />
          <Txt x={x1 - 40} y={base + 50} size={28} weight={800} color={C.inkSoft}>
            недели →
          </Txt>
          <path d={path(spike)} fill="none" stroke={CELL.stories.color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d={path(steady)} fill="none" stroke={TRG.color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <Plate x={x0 + 250} y={300} text="интересное: всплеск" size={32} k={ramp(t, at(ctx, 1.4), 0.5)} bg={CELL.stories.light} edge={CELL.stories.deep} />
          <Plate x={x1 - 260} y={520} text="частый триггер: долго" size={32} k={ramp(t, at(ctx, 1.8), 0.5)} bg={TRG.light} edge={TRG.deep} />
        </g>
      )}
      <Pop t={t} at={at(ctx, 3)} x={x0 + 140} y={200}>
        <g opacity={pirate}>
          <path d="M -60 10 Q 0 -60 60 10 Z" fill="#1d2340" />
          <path d="M -70 10 L 70 10" stroke="#1d2340" strokeWidth={10} strokeLinecap="round" />
          <circle cx={0} cy={-14} r={10} fill="#fff" />
          <Txt x={0} y={60} size={26} weight={900}>
            костюм пирата
          </Txt>
        </g>
      </Pop>
      <Plate x={a.cx} y={820} text="+15 % рекомендаций у частых триггеров" size={34} k={boring} bg={C.yellow} />
    </g>
  );
};

// ── Песня о пятнице: пики каждую неделю ──
export const Weekly: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const x0 = a.cx - 540;
  const x1 = a.cx + 540;
  const base = 680;
  const draw = clamp01((t - at(ctx, 0.9)) / 2.8);
  const days = 24;
  const fri = [4, 11, 18];
  const pts: string[] = [];
  for (let i = 0; i <= days * 6 * draw; i++) {
    const d = i / 6;
    const near = Math.min(...fri.map((f) => Math.abs(d - f)));
    const v = 40 + 20 * Math.sin(d * 1.7) + 330 * Math.exp(-near * near * 3);
    pts.push(`${i === 0 ? "M" : "L"} ${x0 + (d / days) * (x1 - x0)} ${base - v}`);
  }
  const cal = pic("calendar", PICS.calendar, a.cx - 380, 320, 1.1, 10);
  return (
    <g>
      <g opacity={1 - ramp(t, at(ctx, 0.9), 0.5)}>
        <Swarm pts={cal} k={ramp(t, 0.3, 1)} t={t} r={4.4} />
        <Txt x={a.cx - 380} y={348} size={40} weight={900} color={TRG.deep}>
          ПТ
        </Txt>
        <BigNum x={a.cx + 250} y={360} text="300 млн+" sub="просмотров (2011)" k={ramp(t, at(ctx, 0.6), 0.6)} color={TRG.deep} size={100} />
      </g>
      {draw > 0 && (
        <g>
          <line x1={x0} y1={base} x2={x1} y2={base} stroke={OL} strokeWidth={5} strokeLinecap="round" />
          <path d={pts.join(" ")} fill="none" stroke={TRG.color} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
          {fri.map((f, i) => {
            const k = ramp(t, at(ctx, 1.4 + i * 0.12), 0.4);
            const x = x0 + (f / days) * (x1 - x0);
            return (
              <g key={f} opacity={k}>
                <line x1={x} y1={base} x2={x} y2={base - 380} stroke={TRG.deep} strokeWidth={3} strokeDasharray="10 8" />
                <Plate x={x} y={base + 60} text={["18 марта", "25 марта", "1 апреля"][i]} size={30} k={k} bg="#fff" />
                <Txt x={x} y={base - 400} size={30} weight={900} color={TRG.deep}>
                  пятница
                </Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── Батончик и планета ──
export const Mars: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const bar = pic("bar-mars", PICS.bar, a.cx - 330, 470, 1.7, 11);
  const planet = ramp(t, at(ctx, 1), 0.8);
  const up = ramp(t, at(ctx, 0.5), 1.4);
  return (
    <g>
      <Swarm pts={bar} k={ramp(t, 0.2, 1.2)} t={t} r={5} />
      <Plate x={a.cx - 330} y={660} text="1997 · продажи растут" size={32} k={ramp(t, at(ctx, 0.4), 0.5)} bg="#fff" />
      <Arrow x1={a.cx - 520} y1={330} x2={a.cx - 140} y2={210 - 60 * up} k={up} color={C.green} w={12} bend={-0.1} />
      <g transform={`translate(${a.cx + 340} ${400})`} opacity={planet}>
        <circle r={170} fill="#e0794a" stroke={OL} strokeWidth={6} />
        <circle cx={-50} cy={-40} r={30} fill="#c25e33" />
        <circle cx={60} cy={50} r={44} fill="#c25e33" />
        <circle cx={40} cy={-80} r={16} fill="#c25e33" />
        <g transform={`translate(${-20 + Math.sin(t) * 6} ${-150 - 30 * (1 - planet)})`}>
          <rect x={-30} y={-20} width={60} height={34} rx={6} fill="#dfe5f3" stroke={OL} strokeWidth={4} />
          <path d="M -30 14 L -48 34 M 30 14 L 48 34" stroke={OL} strokeWidth={4} />
        </g>
      </g>
      <Plate x={a.cx + 340} y={660} text="новости о Марсе = напоминание" size={32} k={ramp(t, at(ctx, 1.4), 0.5)} bg={TRG.light} edge={TRG.deep} />
    </g>
  );
};

// ── Батончик и кофе ──
export const Coffee: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const bar = pic("bar", PICS.bar, a.cx - 230, 440, 1.5, 10);
  const cup = pic("coffee", PICS.coffee, a.cx + 230, 430, 1.5, 10);
  const link = ramp(t, at(ctx, 1.3), 0.8);
  const pulse = link * (0.5 + 0.5 * Math.sin(t * 3.4));
  const fall = ramp(t, 0.4, 1.4) * (1 - ramp(t, at(ctx, 2), 1.2));
  return (
    <g>
      <Swarm pts={bar} k={ramp(t, 0.1, 1.2)} t={t} r={4.6} from="left" />
      <Swarm pts={cup} k={ramp(t, at(ctx, 1), 1.2)} t={t} r={4.6} from="right" />
      {link > 0 && (
        <g opacity={link}>
          <path d={`M ${a.cx - 90} 440 Q ${a.cx} ${380 - 30 * pulse} ${a.cx + 90} 440`} fill="none" stroke={TRG.color} strokeWidth={10 + 6 * pulse} strokeLinecap="round" />
          <Txt x={a.cx} y={350} size={54} weight={900} color={TRG.deep}>
            +
          </Txt>
        </g>
      )}
      <g transform={`translate(${a.cx - 480} 200)`} opacity={fall}>
        <Txt x={0} y={0} size={34} weight={900} color={C.red}>
          −5 % в год
        </Txt>
      </g>
      <BigNum x={a.cx - 230} y={740} text="+8 %" sub="за год" k={ramp(t, at(ctx, 2.05), 0.5)} color={C.green} size={90} />
      <BigNum x={a.cx + 230} y={740} text="+⅓" sub="ещё через год" k={ramp(t, at(ctx, 2.25), 0.5)} color={C.green} size={90} />
      <Plate x={a.cx} y={170} text="кофе — частый триггер" size={36} k={ramp(t, at(ctx, 2.6), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Поднос и избирательный участок ──
export const Tray: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const vote = ramp(t, at(ctx, 2), 0.7);
  const tr = 1 - vote;
  return (
    <g>
      <g opacity={tr} transform={`translate(0 ${-vote * 40})`}>
        <rect x={a.cx - 470} y={190} width={940} height={120} rx={26} fill="#fff" stroke={TRG.deep} strokeWidth={5} />
        <Txt x={a.cx} y={265} size={38} weight={900} color={TRG.deep}>
          «На каждый поднос – пять фруктов и овощей в день»
        </Txt>
        <g transform={`translate(${a.cx - 200} 520)`}>
          <rect x={-200} y={-80} width={400} height={160} rx={24} fill="#dfe5f3" stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={-140 + i * 70} cy={0} r={28 * ramp(t, at(ctx, 1) + i * 0.15, 0.4)} fill={["#e5484d", "#22b35e", "#f5a524", "#ff6f93", "#2fc46c"][i]} stroke={OL} strokeWidth={3} />
          ))}
        </g>
        <BigNum x={a.cx + 280} y={560} text="+25 %" sub="фруктов и овощей" k={ramp(t, at(ctx, 1.3), 0.5)} color={C.green} size={100} />
      </g>
      {vote > 0 && (
        <g opacity={vote}>
          <g transform={`translate(${a.cx - 260} 470)`}>
            <path d="M -170 0 L 0 -120 L 170 0 Z" fill="#e5484d" stroke={OL} strokeWidth={5} />
            <rect x={-150} y={0} width={300} height={200} fill="#ffeccc" stroke={OL} strokeWidth={5} />
            <rect x={-30} y={90} width={60} height={110} fill="#8a5a3c" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={60} size={30} weight={900}>
              ШКОЛА
            </Txt>
          </g>
          <g transform={`translate(${a.cx + 40} 560)`}>
            <rect x={-70} y={-60} width={140} height={120} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-40} y={-74} width={80} height={14} fill={OL} />
            <path d="M -20 -110 L 30 -110 L 30 -76 L -20 -76 Z" fill={C.yellow} stroke={OL} strokeWidth={3} transform={`translate(0 ${(Math.sin(t * 3) * 0.5 + 0.5) * 30})`} />
          </g>
          <BigNum x={a.cx + 380} y={460} text="+10 000" sub="голосов за школы" k={ramp(t, at(ctx, 2.3), 0.5)} color={TRG.deep} size={84} />
          <Plate x={a.cx + 380} y={620} text="Аризона, 2000" size={32} k={vote} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── Триггер в нужном месте: душ против банки ──
export const Fat: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const second = ramp(t, at(ctx, 1), 0.7);
  const pour = clamp01((t - at(ctx, 1.3)) / 2.5);
  return (
    <g>
      <g opacity={1 - second * 0.55}>
        <rect x={a.cx - 560} y={200} width={420} height={460} rx={26} fill="#eaf4ff" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={a.cx - 520 + (i % 7) * 56} y1={250 + ((t * 220 + i * 70) % 300)} x2={a.cx - 526 + (i % 7) * 56} y2={270 + ((t * 220 + i * 70) % 300)} stroke="#5b9cff" strokeWidth={5} strokeLinecap="round" />
        ))}
        <rect x={a.cx - 540} y={600} width={380} height={40} rx={8} fill="#c3cbe0" />
        <Txt x={a.cx - 350} y={720} size={30} weight={900} color={C.inkSoft}>
          реклама в душе
        </Txt>
        <Cross x={a.cx - 350} y={430} s={120} k={ramp(t, at(ctx, 0.8), 0.5)} />
      </g>
      {second > 0 && (
        <g opacity={second}>
          <g transform={`translate(${a.cx + 180} 380) rotate(${-40 * pour})`}>
            <rect x={-60} y={-110} width={120} height={220} rx={22} fill="#e5484d" stroke={OL} strokeWidth={5} />
            <rect x={-60} y={-40} width={120} height={60} fill="#fff" opacity={0.85} />
            <ellipse cx={0} cy={-110} rx={60} ry={14} fill="#c3cbe0" stroke={OL} strokeWidth={4} />
          </g>
          {pour > 0.2 &&
            Array.from({ length: 8 }, (_, i) => {
              const y = 330 + ((t * 160 + i * 40) % 300);
              return <circle key={i} cx={a.cx + 280 + Math.sin(i) * 6} cy={y} r={12} fill="#fff6dc" stroke="#d9c79a" strokeWidth={3} />;
            })}
          <g transform={`translate(${a.cx + 300} 680)`}>
            <path d="M -70 -90 L 70 -90 L 56 60 L -56 60 Z" fill="#ffffff" fillOpacity={0.7} stroke={OL} strokeWidth={5} />
            <rect x={-60} y={60 - 120 * pour} width={120} height={120 * pour} fill="#fff6dc" opacity={0.9} />
          </g>
          <Plate x={a.cx + 260} y={190} text="напоминание в момент выбора" size={34} k={ramp(t, at(ctx, 1.6), 0.5)} bg={TRG.light} edge={TRG.deep} />
        </g>
      )}
    </g>
  );
};

// ── Стаканчик с отверстиями ──
export const Holes: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const many = ramp(t, at(ctx, 1.5), 0.8);
  const cup = (x: number, holes: number, k: number) => (
    <g opacity={k}>
      <path d={`M ${x - 110} 250 L ${x + 110} 250 L ${x + 80} 600 L ${x - 80} 600 Z`} fill="#fff" stroke={OL} strokeWidth={6} />
      <path d={`M ${x - 104} 280 L ${x + 104} 280 L ${x + 79} 590 L ${x - 79} 590 Z`} fill="#94bce6" opacity={0.6} />
      {Array.from({ length: holes }, (_, i) => {
        const hx = x - (holes - 1) * 14 + i * 28;
        const w = holes === 1 ? 26 : 6;
        const len = holes === 1 ? 260 : 120;
        return (
          <g key={i}>
            <path d={`M ${hx} 600 Q ${hx + (i - holes / 2) * 8} ${600 + len * 0.5} ${hx + (i - holes / 2) * 14} ${600 + len}`} fill="none" stroke="#5b9cff" strokeWidth={w} strokeLinecap="round" strokeDasharray="30 14" strokeDashoffset={-t * 120} />
          </g>
        );
      })}
    </g>
  );
  return (
    <g>
      {cup(a.cx - 300, 1, ramp(t, 0.3, 0.6))}
      {cup(a.cx + 300, 9, many)}
      <Plate x={a.cx - 300} y={200} text="одна сильная связь" size={32} k={ramp(t, at(ctx, 1.2), 0.5)} bg={TRG.light} edge={TRG.deep} />
      <Plate x={a.cx + 300} y={200} text="слишком много связей" size={32} k={many} bg="#fff" />
      <Plate x={a.cx} y={840} text="валюта начинает разговор · триггеры его удерживают" size={34} k={ramp(t, at(ctx, 2), 0.5)} bg={C.yellow} />
    </g>
  );
};

export const _unused = { Bars, Spark, Person, Drift, ease, Cross };

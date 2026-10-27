// Сцены вступления и «города»: весы, большой вопрос, карта лаборатории,
// маршрут, Петербург, лестница, распивочная, письмо, бульвар, давление среды.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { BookObj, Candle, Coin, House, Label, OL, Person, Scales, Silhouette } from "./draw";
import { Appear, area, at, clamp01, Drift, ease, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; mode?: string; variant?: string; count?: number; stage?: number };

// ── Весы «идея / человек» (холодный старт, Соня, люди, финал) ──
export const ScalesScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const mode = p.mode ?? "hook";
  const a = area(p.host);
  const cx = a.cx;
  // числа на правой чаше: 100 маленьких фигурок-цифр
  const nums = Array.from({ length: 18 }).map((_, i) => ({ dx: ((i % 6) - 2.5) * 34, dy: -18 - Math.floor(i / 6) * 30 }));
  let tilt = 0;
  let numsK = 1;
  let personK = 1;
  if (mode === "hook") {
    tilt = interpolate(t, [at(ctx, 0), at(ctx, 1)], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    tilt += Math.sin(t * 1.3) * 0.05;
    personK = ramp(t, at(ctx, 0.2));
    numsK = ramp(t, at(ctx, 0.5));
  } else if (mode === "sonya") {
    tilt = 0.6 * (1 - ramp(t, at(ctx, 1.4), 1.5)) + Math.sin(t * 1.1) * 0.03 * (1 - ramp(t, at(ctx, 2)));
  } else if (mode === "people") {
    tilt = 0.7 - 1.0 * ramp(t, at(ctx, 1), 2.2) + Math.sin(t * 1.2) * 0.03;
  } else {
    tilt = 0.85 - 1.2 * ramp(t, at(ctx, 1), 2.4);
    numsK = 1 - ramp(t, at(ctx, 1), 1.8);
  }
  const left = (
    <g opacity={personK}>
      <Person who={mode === "people" ? "child" : "lizaveta"} x={0} y={-6} s={0.38} mood="kind" t={t} />
      <Label x={0} y={-210} text="человек" size={30} />
    </g>
  );
  const right = (
    <g>
      {nums.map((n, i) => (
        <g key={i} opacity={numsK * clamp01(numsK * 18 - i)} transform={`translate(${n.dx} ${n.dy + wob(t, i, 3)})`}>
          <text fontFamily={SERIF} fontWeight={700} fontSize={30} fill={C.ink} textAnchor="middle">
            {(i * 7) % 10}
          </text>
        </g>
      ))}
      <Label x={0} y={-150} text={mode === "people" ? "расчёт" : "идея · «сотни»"} size={30} opacity={Math.max(0.35, numsK)} />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} cy={540}>
      {mode === "hook" && (
        <g opacity={0.5}>
          {[0, 1, 2, 3, 4].map((i) => (
            <House key={i} x={a.x0 + i * 230 - 40} y={980} w={210} h={300 + ((i * 97) % 160)} color="#4a4f80" t={t} seed={i} />
          ))}
        </g>
      )}
      <Scales x={cx} y={300} s={mode === "final" ? 1.05 : 0.95} tilt={tilt} left={left} right={right} />
      {mode === "hook" && (
        <Appear t={t} at={at(ctx, 1)} x={cx} y={180}>
          <Txt x={0} y={0} size={58} color={C.paper}>
            1 → 100 ?
          </Txt>
        </Appear>
      )}
      {mode === "final" && ramp(t, at(ctx, 2.2)) < 1 && (
        <Appear t={t} at={at(ctx, 1.6)} x={cx} y={150}>
          <Txt x={0} y={0} size={56} color={C.paper}>
            человек — не цифра
          </Txt>
        </Appear>
      )}
      {mode === "final" && ramp(t, at(ctx, 2.2)) > 0 && (
        <g opacity={ramp(t, at(ctx, 2.2))}>
          <text x={cx} y={140} fontFamily={FONT} fontWeight={900} fontSize={64} textAnchor="middle" fill={C.paper}>
            <tspan>Bana</tspan>
            <tspan fill={C.yellow}>Mind</tspan>
          </text>
          <Txt x={cx} y={190} size={30} color={C.paper}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Два вопроса фильма ──
export const BigQuestion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const q1 = at(ctx, 0.55);
  const q2 = at(ctx, 1.35);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <Appear t={t} at={at(ctx, 0)} x={a.cx} y={250}>
        <BookObj x={0} y={0} s={1.3} label={"Преступление\nи наказание"} rot={wob(t, 1, 1.5)} />
      </Appear>
      <Appear t={t} at={q1} x={a.cx} y={530}>
        <rect x={-560} y={-50} width={1120} height={100} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={40}>
          1. Ошибка — только в преступлении?
        </Txt>
      </Appear>
      <Appear t={t} at={q2} x={a.cx} y={670}>
        <rect x={-560} y={-50} width={1120} height={100} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={40}>
          2. Почему теория рухнула до признания?
        </Txt>
      </Appear>
      <text x={a.cx + 520} y={330} fontFamily={FONT} fontWeight={900} fontSize={220} fill={C.yellow} opacity={0.25 + 0.1 * Math.sin(t * 2)} textAnchor="middle">
        ?
      </text>
    </Drift>
  );
};

// ── Карта лаборатории совести ──
const STATIONS = ["город", "теория", "расчёт", "дуэль", "Соня", "зеркала", "Сибирь"];
export const LabMap: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const span = a.x1 - a.x0 - 200;
  const path = STATIONS.map((_, i) => ({ x: a.x0 + 100 + (i * span) / (STATIONS.length - 1), y: 440 + Math.sin(i * 1.3) * 110 }));
  const draw = ramp(t, at(ctx, 0.3), 3.2);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* старая карта-план */}
      <rect x={a.x0} y={170} width={a.x1 - a.x0} height={540} rx={28} fill={C.paper} stroke={OL} strokeWidth={5} opacity={0.95} />
      <rect x={a.x0} y={170} width={a.x1 - a.x0} height={540} rx={28} fill="none" stroke={C.paperDark} strokeWidth={18} opacity={0.6} />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M ${a.x0 + 30 + i * 175} 190 Q ${a.x0 + 70 + i * 175} 430 ${a.x0 + 20 + i * 175} 690`} stroke={C.paperDark} strokeWidth={3} fill="none" />
      ))}
      <Txt x={a.cx} y={240} size={42} color={C.ink}>
        Лаборатория совести · учебная карта
      </Txt>
      <path
        d={path.map((q, i) => `${i ? "L" : "M"} ${q.x} ${q.y}`).join(" ")}
        stroke={C.goldDeep}
        strokeWidth={8}
        strokeDasharray="22 16"
        fill="none"
        opacity={0.9}
        strokeDashoffset={0}
        style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }}
      />
      {path.map((q, i) => {
        const k = ramp(t, at(ctx, 0.3) + i * 0.42, 0.5);
        return (
          <g key={i} opacity={k} transform={`translate(${q.x} ${q.y}) scale(${0.6 + 0.4 * k})`}>
            <circle r={44} fill={i === 6 ? C.dawn : C.dusk} stroke={OL} strokeWidth={4} />
            <circle r={16} fill={C.yellow} />
            <Txt x={0} y={86} size={30}>
              {STATIONS[i]}
            </Txt>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Маршрут: миниатюры будущих сцен по очереди ──
export const Trailer: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const cards: { label: string; draw: (tt: number) => React.ReactNode }[] = [
    { label: "город", draw: (tt) => <House x={-90} y={60} w={180} h={150} color="#5b6aa0" t={tt} seed={2} lit={0.5} /> },
    { label: "теория", draw: () => <BookObj x={0} y={0} s={0.42} label={"О\nпреступлении"} color="#4a4f86" /> },
    { label: "дуэль", draw: (tt) => <><Person who="rask" x={-50} y={70} s={0.32} t={tt} mood="tense" /><Person who="porfiry" x={50} y={70} s={0.32} t={tt} flip mood="smile" /></> },
    { label: "Соня", draw: (tt) => <><Candle x={0} y={70} s={0.7} t={tt} /></> },
    { label: "зеркала", draw: () => <><rect x={-60} y={-70} width={120} height={150} rx={60} fill="#cfd6ef" stroke={OL} strokeWidth={4} /><Silhouette x={0} y={70} s={0.5} color={C.dusk} /></> },
    { label: "Сибирь", draw: () => <><rect x={-90} y={0} width={180} height={70} fill="#9cc0e0" /><circle cx={40} cy={-20} r={30} fill={C.dawn} /></> },
  ];
  const total = Math.max(1, (ctx.ends[0] ?? dur) - (ctx.beats[0] ?? 0));
  return (
    <Drift t={t} dur={dur} cx={1100}>
      {cards.map((c, i) => {
        const a0 = (ctx.beats[0] ?? 0) + (total * i) / cards.length;
        const k = ramp(t, a0, 0.45);
        const x = 520 + (i % 3) * 470;
        const y = 300 + Math.floor(i / 3) * 330;
        return (
          <g key={i} opacity={k} transform={`translate(${x} ${y + (1 - k) * 40}) rotate(${(i % 2 ? 2 : -2) + wob(t, i, 0.6)})`}>
            <rect x={-190} y={-130} width={380} height={260} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <g transform="translate(0 -20)">{c.draw(t)}</g>
            <Txt x={0} y={108} size={34}>
              {c.label}
            </Txt>
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 1)} x={1110} y={960}>
        <Txt x={0} y={0} size={40} color={C.paper}>
          …и снова весы
        </Txt>
      </Appear>
    </Drift>
  );
};

// ── Петербург: жара (каморка) / мост ──
export const City: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const bridge = p.variant === "bridge";
  const pan = interpolate(t, [0, dur], [0, -120]);
  const heat = bridge ? 0 : 1;
  return (
    <g>
      <defs>
        <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bridge ? "#7d8fc4" : "#f2c47e"} />
          <stop offset="100%" stopColor={bridge ? "#c9cde6" : "#f7e2b0"} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#citySky)" opacity={0.85} />
      {heat > 0 && <circle cx={1500} cy={210} r={110 + Math.sin(t * 2) * 6} fill="#fff4cf" opacity={0.85} />}
      <g transform={`translate(${pan} 0)`}>
        {Array.from({ length: 11 }).map((_, i) => (
          <House key={i} x={-40 + i * 205} y={bridge ? 720 : 900} w={190} h={330 + ((i * 131) % 230)} color={["#c9a87a", "#b9a0b8", "#a7b3c9", "#d0b48a"][i % 4]} t={t} seed={i + 3} floors={5} lit={0.15} />
        ))}
      </g>
      {bridge ? (
        <g>
          <rect x={0} y={720} width={1920} height={360} fill="#6f86b8" />
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M ${((i * 190 + t * 30) % 2100) - 100} ${780 + (i % 4) * 60} q 40 -10 80 0`} stroke="#c9d7f0" strokeWidth={4} fill="none" opacity={0.6} />
          ))}
          <path d="M 300 760 Q 960 560 1620 760 L 1620 800 Q 960 610 300 800 Z" fill="#8f8aa8" stroke={OL} strokeWidth={4} />
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 340 + i * 95;
            const y = 760 - Math.sin(((x - 300) / 1320) * Math.PI) * 190;
            return <line key={i} x1={x} y1={y} x2={x} y2={y - 40} stroke={OL} strokeWidth={4} />;
          })}
          <Person who="rask" x={1240} y={640} s={0.62} t={t} mood="sad" />
          {/* монета, падающая в воду */}
          {ramp(t, at(ctx, 1.4)) > 0 && ramp(t, at(ctx, 1.4)) < 1 && <Coin x={1170} y={640 + ramp(t, at(ctx, 1.4), 1.2) * 200} r={14} spin={t * 8} />}
          <Appear t={t} at={at(ctx, 1.6)} x={1240} y={300}>
            <Label x={0} y={0} text="«отрезал себя сам от всех»" size={36} serif />
          </Appear>
        </g>
      ) : (
        <g>
          <rect x={0} y={900} width={1920} height={180} fill="#b8a07a" />
          {/* дрожащий горячий воздух */}
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M ${200 + i * 300} ${880 - ((t * 40 + i * 50) % 300)} q 20 -20 0 -40 q -20 -20 0 -40`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.3} />
          ))}
          <Person who="rask" x={1100 + Math.min(240, t * 10)} y={980} s={0.8} pose="walk" t={t} mood="tense" />
          {[0, 1, 2].map((i) => (
            <Person key={i} who="crowd" x={500 + i * 380 - Math.min(200, t * 8)} y={990} s={0.62} pose="walk" t={t + i} seed={i} flip opacity={0.75} />
          ))}
          <Appear t={t} at={at(ctx, 1)} x={700} y={240}>
            <Label x={0} y={0} text="каморка «более на шкаф»" size={36} />
          </Appear>
          <Appear t={t} at={at(ctx, 2)} x={700} y={330}>
            <Label x={0} y={0} text="голод · долг · жара" size={32} bg={C.dawn} />
          </Appear>
        </g>
      )}
    </g>
  );
};

// ── Лестница к процентщице: «проба» ──
export const Stairs: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const steps = 12;
  const prog = clamp01(t / Math.max(1, (ctx.ends[1] ?? dur) + 1));
  const ry = 950 - prog * steps * 52;
  const rx = 260 + prog * steps * 70;
  return (
    <Drift t={t} dur={dur} cx={600} cy={500} amount={0.06}>
      <rect x={60} y={120} width={1220} height={860} rx={20} fill="#c9b78f" opacity={0.6} />
      {Array.from({ length: steps }).map((_, i) => (
        <g key={i}>
          <rect x={200 + i * 70} y={960 - (i + 1) * 52} width={150} height={52} fill={i % 2 ? "#8c7a64" : "#9b8970"} stroke={OL} strokeWidth={3} />
        </g>
      ))}
      <path d="M 180 960 L 1060 330" stroke={OL} strokeWidth={8} />
      <Person who="rask" x={rx} y={ry} s={0.55} pose="walk" t={t} mood={t > (ctx.beats[2] ?? 99) ? "shock" : "tense"} />
      <Appear t={t} at={at(ctx, 0.3)} x={980} y={180}>
        <Label x={0} y={0} text={`${p.count ?? 730} шагов`} size={34} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={480} y={210}>
        <Label x={0} y={0} text="«игрушки!»" size={36} serif bg={C.fog} />
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={560} y={330}>
        <Label x={0} y={0} text="«На какую грязь способно…»" size={34} serif bg={C.rose} />
      </Appear>
    </Drift>
  );
};

// ── Распивочная: Мармеладов и рассказ о Соне ──
export const Tavern: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const sonyaK = ramp(t, at(ctx, 2), 0.9);
  const kneelK = ramp(t, at(ctx, 3), 0.9);
  return (
    <Drift t={t} dur={dur} cx={1250}>
      <rect x={700} y={140} width={1140} height={760} rx={26} fill="#8d6e55" stroke={OL} strokeWidth={5} />
      <rect x={740} y={180} width={300} height={200} rx={10} fill="#e9c97f" opacity={0.6 + 0.1 * Math.sin(t)} stroke={OL} strokeWidth={4} />
      <rect x={760} y={700} width={1060} height={40} fill="#5e4636" stroke={OL} strokeWidth={4} />
      <g opacity={1 - sonyaK * 0.75}>
        <Person who="marm" x={1080} y={840} s={0.72} pose="hold" t={t} mood="sad" />
        <Person who="rask" x={1420} y={840} s={0.72} t={t} mood="neutral" flip look={-1} />
      </g>
      {/* воспоминание: Соня и семья — светлое облако */}
      {sonyaK > 0 && (
        <g opacity={sonyaK}>
          <ellipse cx={1270} cy={500} rx={460} ry={300} fill={C.paper} opacity={0.92} stroke={OL} strokeWidth={4} />
          <Person who="sonya" x={1120} y={720} s={0.62} t={t} mood="sad" />
          {kneelK > 0 ? (
            <Person who="katerina" x={1330} y={720} s={0.62} t={t} pose="kneel" mood="sad" flip opacity={kneelK} />
          ) : (
            [0, 1, 2].map((i) => <Person key={i} who="child" x={1300 + i * 90} y={720} s={0.5} t={t + i} mood="sad" seed={i} />)
          )}
          <Appear t={t} at={at(ctx, 2.3)} x={1270} y={300}>
            <Label x={0} y={0} text="«куда-нибудь можно было пойти»" size={30} serif />
          </Appear>
        </g>
      )}
      {sonyaK === 0 && (
        <Appear t={t} at={at(ctx, 1)} x={1270} y={300}>
          <Label x={0} y={0} text="«некуда больше идти»" size={36} serif />
        </Appear>
      )}
    </Drift>
  );
};

// ── Письмо матери ──
export const Letter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const open = ramp(t, at(ctx, 0), 0.9);
  const lines = ["Дуня согласилась…", "господин Лужин,", "человек деловой…", "Это и для тебя, Родя…"];
  return (
    <Drift t={t} dur={dur} cx={620}>
      <g transform={`translate(620 520) rotate(${-3 + wob(t, 1, 0.8)}) scale(${0.6 + 0.4 * open})`} opacity={open}>
        <rect x={-380} y={-330} width={760} height={640} rx={10} fill={C.paper} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-250} size={38} color={C.inkSoft}>
          Письмо от матери
        </Txt>
        {lines.map((l, i) => (
          <g key={i} opacity={ramp(t, at(ctx, 0.3 + i * 0.25), 0.4)}>
            <text x={-320} y={-160 + i * 80} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink}>
              {l}
            </text>
          </g>
        ))}
        <path d={`M -330 ${190} L ${-330 + 660 * ramp(t, at(ctx, 1.4), 0.8)} 190`} stroke={C.red} strokeWidth={6} opacity={0.7} />
      </g>
      <Appear t={t} at={at(ctx, 1.2)} x={620} y={920}>
        <Label x={0} y={0} text="«Не хочу я вашей жертвы»" size={38} serif bg={C.rose} />
      </Appear>
      {ramp(t, at(ctx, 2)) > 0 && (
        <g opacity={ramp(t, at(ctx, 2))}>
          <Coin x={1100} y={300 + wob(t, 2, 6)} r={30} spin={t * 3} />
          <Coin x={1170} y={360 + wob(t, 3, 6)} r={24} spin={t * 3 + 1} />
          <Txt x={1140} y={460} size={30} color={C.paper}>
            их же деньги
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Бульвар: защитил девочку — и «процент» ──
export const Boulevard: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const cool = ramp(t, at(ctx, 2), 0.8);
  const stat = ramp(t, at(ctx, 3), 0.8);
  return (
    <Drift t={t} dur={dur} cx={1250}>
      <rect x={680} y={720} width={1200} height={22} fill="#7c6a52" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${780 + i * 420} 720)`}>
          <rect x={-8} y={-240} width={16} height={240} fill="#5c4a3a" />
          <circle cx={0} cy={-280} r={90} fill="#6f9a78" opacity={0.85} />
        </g>
      ))}
      <rect x={1040} y={650} width={300} height={22} rx={8} fill="#8a6a4a" stroke={OL} strokeWidth={3} />
      <Person who="girl" x={1190} y={720} s={0.55} pose="sit" t={t} mood="closed" opacity={1 - stat * 0.6} />
      <Person who="crowd" x={1560} y={760} s={0.62} t={t} mood="smile" flip opacity={1 - stat * 0.6} />
      <Person who="rask" x={900} y={760} s={0.66} pose={cool > 0.5 ? "stand" : "reach"} t={t} mood={cool > 0.5 ? "closed" : "angry"} />
      <Appear t={t} at={at(ctx, 1)} x={900} y={300}>
        <Label x={0} y={0} text="сострадание" size={36} bg={C.dawn} />
      </Appear>
      {stat > 0 && (
        <g opacity={stat}>
          <rect x={1260} y={180} width={500} height={300} rx={18} fill={C.paper} stroke={OL} strokeWidth={4} />
          <Txt x={1510} y={240} size={30} color={C.inkSoft}>
            «процент»
          </Txt>
          {Array.from({ length: 5 }).map((_, i) => {
            const h = 40 + ((i * 37) % 120);
            return <rect key={i} x={1310 + i * 85} y={450 - h * stat} width={52} height={h * stat} fill={C.steel} stroke={OL} strokeWidth={3} />;
          })}
        </g>
      )}
      <Appear t={t} at={at(ctx, 4)} x={1250} y={560}>
        <Label x={0} y={0} text="сострадание ↔ статистика" size={38} />
      </Appear>
    </Drift>
  );
};

// ── Среда давит, но решает человек ──
export const Pressure: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  // банан в углу слева — схема правее центра
  const squeeze = 0.5 + 0.5 * Math.sin(t * 0.8);
  const choice = ramp(t, at(ctx, 1.3), 0.9);
  return (
    <Drift t={t} dur={dur} cx={1130}>
      {/* стены сдвигаются */}
      <rect x={440 + squeeze * 40} y={160} width={180} height={700} fill="#7d6a98" stroke={OL} strokeWidth={4} />
      <rect x={1640 - squeeze * 40} y={160} width={180} height={700} fill="#7d6a98" stroke={OL} strokeWidth={4} />
      {["бедность", "долги", "письмо", "жара"].map((w, i) => (
        <Pop key={w} t={t} at={at(ctx, 0.3 + i * 0.15)} x={i < 2 ? 530 + squeeze * 40 : 1730 - squeeze * 40} y={330 + (i % 2) * 260}>
          <Label x={0} y={0} text={w} size={30} bg={C.fog} />
        </Pop>
      ))}
      {/* развилка выбора */}
      <g opacity={choice}>
        <path d="M 1130 820 L 1130 600 L 930 380 M 1130 600 L 1330 380" stroke={C.paper} strokeWidth={16} strokeLinecap="round" fill="none" />
        <Label x={930} y={330} text="решает человек" size={30} bg={C.dawn} />
        <Label x={1330} y={330} text="решает человек" size={30} bg={C.dawn} />
      </g>
      <Person who="rask" x={1130} y={880} s={0.5} t={t} mood="tense" opacity={0.4 + 0.6 * choice} />
    </Drift>
  );
};

// Сцены теории и расчёта: «арифметика», статья, два разряда, мост цель/средство,
// цитата, сон и отречение, план и его трещины (без изображения насилия), жертвы.
import React from "react";
import { C, SERIF } from "../theme";
import { Candle, Door, House, Label, OL, Person, Silhouette } from "./draw";
import { Appear, area, at, clamp01, Drift, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; stage?: number; text?: string; ref?: string; tone?: string };

// ── «Одна смерть и сто жизней взамен» ──
export const Arithmetic: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const eq = ramp(t, at(ctx, 1), 0.7);
  const no = ramp(t, at(ctx, 2.5), 0.6);
  const fate = ramp(t, at(ctx, 3.3), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* трактир: бильярдный стол и чай */}
      <rect x={a.x0 + 20} y={620} width={a.x1 - a.x0 - 40} height={60} rx={12} fill="#6b5240" stroke={OL} strokeWidth={4} />
      <Person who="student" x={a.x0 + 260} y={840} s={0.62} t={t} mood={no > 0.5 ? "smile" : "tense"} pose="point" />
      <Person who="officer" x={a.x0 + 560} y={840} s={0.62} t={t} mood="neutral" flip />
      <Person who="rask" x={a.x1 - 160} y={860} s={0.58} t={t} mood={fate > 0.3 ? "shock" : "closed"} flip opacity={0.9} />
      {/* формула на доске */}
      <g transform={`translate(${a.cx} 260)`} opacity={eq}>
        <rect x={-520} y={-120} width={1040} height={220} rx={18} fill="#2f3a3a" stroke={OL} strokeWidth={6} />
        <text x={0} y={10} fontFamily={SERIF} fontWeight={700} fontSize={70} fill="#f4f1e6" textAnchor="middle">
          1 смерть = 100 жизней
        </text>
        <Txt x={0} y={74} size={30} color="#d8d2bd">
          «да ведь тут арифметика!»
        </Txt>
      </g>
      <Appear t={t} at={at(ctx, 2.5)} x={a.x0 + 380} y={520}>
        <Label x={0} y={0} text="«Разумеется, нет!»" size={36} serif bg={C.fog} />
      </Appear>
      {fate > 0 && (
        <g opacity={fate}>
          <path d={`M ${a.x0 + 400} 520 Q ${a.cx + 200} 420 ${a.x1 - 160} 560`} stroke={C.gold} strokeWidth={6} strokeDasharray="14 12" fill="none" />
          <Label x={a.x1 - 200} y={480} text="«предопределение»?" size={30} bg={C.dawn} />
        </g>
      )}
    </Drift>
  );
};

// ── Статья «О преступлении» ──
export const Article: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const split = ramp(t, at(ctx, 1.3), 1);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <g transform={`translate(${a.cx} 470) rotate(${-2 + wob(t, 2, 0.6)})`}>
        <rect x={-470} y={-330} width={940} height={640} rx={8} fill="#f1ead6" stroke={OL} strokeWidth={5} />
        <text x={0} y={-262} fontFamily={SERIF} fontWeight={700} fontSize={30} fill={C.inkSoft} textAnchor="middle">
          «Периодическая речь»
        </text>
        <line x1={-430} y1={-236} x2={430} y2={-236} stroke={OL} strokeWidth={3} />
        <text x={0} y={-170} fontFamily={SERIF} fontWeight={700} fontSize={64} fill={C.ink} textAnchor="middle">
          О преступлении
        </text>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-420} y={-110 + i * 34} width={(i % 3 === 2 ? 600 : 840) * (1 - split * 0.0)} height={12} rx={6} fill={C.steel} opacity={0.5} />
        ))}
        {/* разрез на два разряда */}
        <g opacity={split}>
          <rect x={-420} y={180} width={400} height={100} rx={14} fill={C.fog} stroke={OL} strokeWidth={4} />
          <rect x={20} y={180} width={400} height={100} rx={14} fill={C.gold} stroke={OL} strokeWidth={4} />
          <Txt x={-220} y={244} size={34}>
            «обыкновенные»
          </Txt>
          <Txt x={220} y={244} size={34}>
            «необыкновенные»
          </Txt>
        </g>
      </g>
      <Appear t={t} at={at(ctx, 2)} x={a.cx - 220} y={130}>
        <Label x={0} y={0} text="«в послушании»" size={32} serif bg={C.fog} />
      </Appear>
    </Drift>
  );
};

// ── Два разряда и «разрешить своей совести» ──
export const TwoClasses: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const line = ramp(t, at(ctx, 0.4), 1.2);
  const step = ramp(t, at(ctx, 0.8), 1.4);
  const names = ramp(t, at(ctx, 1), 0.6);
  const self = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* толпа «обыкновенных» */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Silhouette key={i} x={a.x0 + 80 + (i % 7) * 70} y={760 + Math.floor(i / 7) * 70} s={0.5} color="#c9cde6" opacity={0.85} />
      ))}
      {/* черта */}
      <line x1={a.cx + 20} y1={180} x2={a.cx + 20} y2={180 + 680 * line} stroke={C.paper} strokeWidth={10} strokeDasharray="30 18" />
      <Txt x={a.cx + 20} y={160} size={30} color={C.paper}>
        черта закона
      </Txt>
      {/* фигура переступает */}
      <Person who="rask" x={a.cx - 140 + step * 300} y={880} s={0.6} pose={step > 0 && step < 1 ? "walk" : "stand"} t={t} mood="tense" />
      <g opacity={names}>
        {["Ньютон", "Ликург", "Наполеон"].map((n, i) => (
          <Label key={n} x={a.x1 - 220} y={260 + i * 100} text={n} size={34} bg={i === 2 ? C.gold : C.paper} serif />
        ))}
        <Label x={a.x1 - 220} y={570} text="«новое слово»" size={32} bg={C.dawn} />
      </g>
      <g opacity={self}>
        <rect x={a.x0 + 40} y={250} width={560} height={150} rx={20} fill={C.paper} stroke={OL} strokeWidth={4} />
        <Txt x={a.x0 + 320} y={312} size={34}>
          разрешает не закон,
        </Txt>
        <Txt x={a.x0 + 320} y={362} size={34} color={C.red}>
          а «я» — сам себе
        </Txt>
      </g>
    </Drift>
  );
};

// ── Качающийся мост «цель / средство» ──
export const Bridge: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const sway = Math.sin(t * 1.4) * (6 + 10 * ramp(t, at(ctx, 1), 1));
  const x0 = a.x0 + 60;
  const x1 = a.x1 - 60;
  const walker = clamp01((t - at(ctx, 1)) / Math.max(1, dur - at(ctx, 1)));
  const sag = (x: number) => 560 + Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * (90 + sway * 2);
  const logic = ramp(t, at(ctx, 3), 0.6);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={x0 - 60} y={560} width={220} height={420} fill="#6f6a92" stroke={OL} strokeWidth={4} />
      <rect x={x1 - 160} y={560} width={220} height={420} fill="#6f6a92" stroke={OL} strokeWidth={4} />
      <Label x={x0 + 50} y={520} text="средство" size={34} bg={C.fog} />
      <Label x={x1 - 50} y={520} text="цель" size={34} bg={C.gold} />
      <path d={`M ${x0 + 150} 560 ${Array.from({ length: 20 }).map((_, i) => { const x = x0 + 150 + ((x1 - x0 - 300) * (i + 1)) / 20; return `L ${x} ${sag(x)}`; }).join(" ")}`} stroke="#8a6a4a" strokeWidth={22} fill="none" strokeLinejoin="round" />
      <path d={`M ${x0 + 150} 470 Q ${(x0 + x1) / 2} ${600 + sway * 3} ${x1 - 150} 470`} stroke={OL} strokeWidth={5} fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const x = x0 + 170 + ((x1 - x0 - 340) * i) / 11;
        return <line key={i} x1={x} y1={sag(x)} x2={x} y2={sag(x) - 70} stroke={OL} strokeWidth={3} />;
      })}
      {walker > 0 && (() => {
        const x = x0 + 170 + (x1 - x0 - 340) * walker * 0.6;
        return <Person who="rask" x={x} y={sag(x) - 8} s={0.4} pose="walk" t={t} mood="tense" />;
      })()}
      {/* вода далеко внизу */}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${x0 + ((i * 160 + t * 25) % (x1 - x0))} ${900 + (i % 3) * 30} q 30 -10 60 0`} stroke={C.fog} strokeWidth={4} fill="none" opacity={0.6} />
      ))}
      <Appear t={t} at={at(ctx, 2)} x={a.cx} y={240}>
        <Label x={0} y={0} text="«успокоительные, научные» слова" size={34} serif />
      </Appear>
      {logic > 0 && (
        <g opacity={logic}>
          <Label x={a.cx} y={340} text="логика ≠ натура" size={38} bg={C.dawn} />
        </g>
      )}
    </Drift>
  );
};

// ── Цитата крупно (с указанием части и главы) ──
export const QuoteCard: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const dark = p.tone === "dark";
  const k = ramp(t, 0.2, 0.8);
  const words = (p.text ?? "").split(" ");
  // перенос строк
  const rows: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 26) {
      rows.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) rows.push(cur.trim());
  const H0 = 120 + rows.length * 78;
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.06}>
      <g transform={`translate(${a.cx} ${470 - H0 / 2 + 40})`} opacity={k}>
        <rect x={-520} y={-40} width={1040} height={H0 + 80} rx={26} fill={dark ? "#2f3358" : C.paper} stroke={C.gold} strokeWidth={6} />
        <text x={-470} y={70} fontFamily={SERIF} fontWeight={700} fontSize={150} fill={C.gold} opacity={0.5}>
          «
        </text>
        {rows.map((r, i) => {
          const rk = ramp(t, 0.4 + i * 0.35, 0.6);
          return (
            <text key={i} x={0} y={70 + i * 78} fontFamily={SERIF} fontWeight={700} fontSize={58} fill={dark ? C.paper : C.ink} textAnchor="middle" opacity={rk}>
              {r}
            </text>
          );
        })}
        <Txt x={0} y={H0 + 10} size={28} color={dark ? C.fog : C.inkSoft} weight={700}>
          {`— ${p.ref ?? ""}`}
        </Txt>
      </g>
    </Drift>
  );
};

// ── Сон и отречение (без сцены с лошадью: только мальчик и воспоминание) ──
export const Dream: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const pray = ramp(t, at(ctx, 1), 0.8);
  const square = ramp(t, at(ctx, 2), 0.8);
  const haze = 0.5 + 0.2 * Math.sin(t * 0.9);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* облако-воспоминание */}
      <g opacity={1 - square}>
        <ellipse cx={a.cx} cy={460} rx={560} ry={330} fill="#e9e3f4" opacity={0.85} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={a.cx - 520 + i * 260} cy={150 + (i % 2) * 40} r={70} fill="#e9e3f4" opacity={0.7 * haze} />
        ))}
        <path d={`M ${a.cx - 380} 700 L ${a.cx + 380} 700`} stroke="#b5aac8" strokeWidth={8} />
        <Person who="child" x={a.cx - 120} y={700} s={0.62} t={t} mood={pray > 0.5 ? "closed" : "sad"} pose={pray > 0.5 ? "stand" : "reach"} />
        {/* слёзы */}
        {pray < 0.5 && [0, 1].map((i) => <circle key={i} cx={a.cx - 140 + i * 40} cy={500 + ((t * 60 + i * 20) % 50)} r={5} fill={C.sky} />)}
        <Label x={a.cx + 210} y={360} text="сон из детства" size={32} bg={C.paper} />
      </g>
      {pray > 0 && square < 1 && (
        <g opacity={pray * (1 - square)}>
          <Label x={a.cx} y={240} text="«отрекаюсь от этой проклятой… мечты»" size={30} serif bg={C.dawn} />
        </g>
      )}
      {/* Сенная: шум, подслушанная фраза */}
      {square > 0 && (
        <g opacity={square}>
          {[0, 1, 2, 3, 4].map((i) => (
            <House key={i} x={a.x0 + i * 250} y={700} w={230} h={260 + (i % 2) * 80} color="#a68c78" t={t} seed={i + 9} />
          ))}
          <rect x={a.x0} y={700} width={a.x1 - a.x0} height={200} fill="#9a8a72" />
          <Person who="lizaveta" x={a.cx - 200} y={860} s={0.6} t={t} mood="kind" />
          <Person who="crowd" x={a.cx - 20} y={860} s={0.6} t={t} mood="smile" flip />
          <Person who="rask" x={a.cx + 260} y={870} s={0.6} t={t} mood={ramp(t, at(ctx, 2.6)) > 0.5 ? "shock" : "tense"} flip />
          <Label x={a.cx - 110} y={400} text="«в семом часу»" size={32} serif />
          <Appear t={t} at={at(ctx, 2.6)} x={a.cx + 200} y={300}>
            <Label x={0} y={0} text="«как приговоренный к смерти»" size={30} serif bg={C.fog} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── План и реальность: карточки плана трескаются ──
export const PlanBreak: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const stage = p.stage ?? 0;
  const cards = ["топор на кухне", "дверь — спокойно", "старуха одна", "уйти незаметно"];
  const brokenAt = [at(ctx, 0.2), at(ctx, 1.2), at(ctx, 2.3), at(ctx, 3)];
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* чертёж */}
      <rect x={a.x0 + 20} y={140} width={a.x1 - a.x0 - 40} height={720} rx={18} fill="#3c5a8a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={a.x0 + 20 + i * 110} y1={140} x2={a.x0 + 20 + i * 110} y2={860} stroke="#5b79a8" strokeWidth={2} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={a.x0 + 20} y1={140 + i * 110} x2={a.x1 - 20} y2={140 + i * 110} stroke="#5b79a8" strokeWidth={2} />
      ))}
      <Txt x={a.cx} y={210} size={44} color="#e6eefc">
        {stage === 0 ? "ПЛАН (по теории)" : "ПЛАН → РЕАЛЬНОСТЬ"}
      </Txt>
      {cards.map((c, i) => {
        const x = a.x0 + 200 + (i % 2) * ((a.x1 - a.x0) / 2);
        const y = 360 + Math.floor(i / 2) * 230;
        const k = ramp(t, at(ctx, 0) + i * 0.3, 0.5);
        const br = stage === 1 ? ramp(t, brokenAt[i], 0.5) : 0;
        return (
          <g key={c} opacity={k} transform={`translate(${x} ${y}) rotate(${br * (i % 2 ? 6 : -6)})`}>
            <rect x={-150} y={-70} width={460} height={140} rx={14} fill="#e6eefc" stroke={OL} strokeWidth={4} />
            <Txt x={80} y={14} size={38} color={C.ink}>
              {c}
            </Txt>
            {br > 0 && <path d={`M -120 ${-60} L 0 ${-10} L 60 30 L 200 -20 L 290 60`} stroke={C.red} strokeWidth={8} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - br)} />}
          </g>
        );
      })}
      {stage === 0 && (
        <Appear t={t} at={at(ctx, 1)} x={a.cx} y={830}>
          <Label x={0} y={0} text="«не преступление»?" size={36} serif bg={C.gold} />
        </Appear>
      )}
      {stage === 1 && (
        <g>
          <Appear t={t} at={at(ctx, 2.2)} x={a.x1 - 260} y={830}>
            <Label x={0} y={0} text="Лизавета — вне расчёта" size={34} bg={C.rose} />
          </Appear>
          <Appear t={t} at={at(ctx, 3)} x={a.x0 + 300} y={830}>
            <Door x={0} y={0} s={0.3} open={0.15 + 0.05 * Math.sin(t * 3)} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Жертвы — люди, а не «единицы» ──
export const Victims: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const numsOut = ramp(t, at(ctx, 0.5), 1.2);
  const shirt = ramp(t, at(ctx, 2), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.03}>
      <rect x={a.x0 + 40} y={160} width={a.x1 - a.x0 - 80} height={700} rx={30} fill="#efe6d2" opacity={0.92} stroke={OL} strokeWidth={4} />
      {/* цифры растворяются в людей */}
      {[0, 1].map((i) => (
        <text key={i} x={a.cx - 260 + i * 520} y={420} fontFamily={SERIF} fontWeight={700} fontSize={200} fill={C.steel} textAnchor="middle" opacity={1 - numsOut}>
          {i + 1}
        </text>
      ))}
      <g opacity={numsOut}>
        <Person who="alena" x={a.cx - 260} y={720} s={0.75} t={t} mood="neutral" />
        <Candle x={a.cx - 430} y={600} s={0.45} t={t} glow={0.6} />
        <Label x={a.cx - 260} y={790} text="Алёна Ивановна" size={30} />
        <Person who="lizaveta" x={a.cx + 260} y={720} s={0.75} t={t} mood="kind" />
        <Label x={a.cx + 260} y={790} text="Лизавета" size={30} />
      </g>
      {shirt > 0 && (
        <g opacity={shirt} transform={`translate(${a.cx + 470} 470) rotate(${wob(t, 3, 2)})`}>
          <path d="M -70 -60 L -30 -80 L 30 -80 L 70 -60 L 90 -10 L 60 0 L 60 80 L -60 80 L -60 0 L -90 -10 Z" fill="#f4f1e6" stroke={OL} strokeWidth={4} />
          <path d="M -20 30 l 10 10 l 10 -10 l 10 10 l 10 -10" stroke={C.dusk} strokeWidth={3} fill="none" />
          <Txt x={0} y={130} size={26}>
            чинила рубаху
          </Txt>
        </g>
      )}
    </Drift>
  );
};

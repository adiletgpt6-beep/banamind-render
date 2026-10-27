// Тематические сцены BM-026 «Мастерская внутренней свободы». Каждая — модель
// одного аргумента писем, собранная из чётких точек и простых контуров:
// коробка времени с тремя утечками (I), рассеянное чтение (II), фонарь,
// показывающий изъян (VI), толпа, перекрашивающая точки (VII), облако
// предположений и блоки фактов (XIII), лестница желаний и линия «довольно»
// (II, XVIII), мост доверия между друзьями (III, IX), ярлык положения и
// человек (XLVII), шум снаружи и внутри (LVI), вечерний разбор (LXXXIII),
// разрозненные советы и корни-основания (XCIV–XCV), обстоятельства вокруг
// и выбранный поступок (CVII), весы приятного и блага (CXXIV).
// Все образы — авторские метафоры фильма, не предметы писем.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, ease, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Particles, rnd } from "./particles";
import { Bead, Cloud, dotField, FactBlock, Figure, GlassBox, Label, Notebook, OL, Thread, Waves } from "./props";

type P = { mode?: string; host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);

// ── I: коробка времени. leak — три утечки; keep — выбранное дело остаётся;
//    debt — за мелочь считаем себя должниками, за время — нет ──
export const TimeBox: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "leak";
  const cx = mode === "debt" ? Ar.cx - 260 : Ar.cx;
  const b = (i: number) => at(ctx, i);
  const W0 = 520;
  const H0 = 420;
  const leaks = A(p.leaks).length ? A(p.leaks) : ["отнимают силой", "похищают", "утекает впустую"];
  const leakAt = [b(0) + 1, b(Math.min(1, ctx.beats.length - 1)) + 0.6, b(Math.min(1, ctx.beats.length - 1)) + 1.4];
  const keep = mode === "keep" ? ramp(t, b(1), 1.2) : 0;
  const dots = dotField(120, W0 - 60, H0 - 60, 3);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <GlassBox x={cx} y={780} w={W0} h={H0} label={S(p.label, "время")} k={ramp(t, 0.1, 0.6)} glow={keep}>
        {dots.map((d, i) => {
          // каждая точка относится к одной из трёх утечек или остаётся
          const g = i % 4;
          let x = d.x;
          let y = -H0 / 2 + d.y;
          let op = 1;
          let col = C.amber;
          if (mode === "leak" && g < 3) {
            const k = ease(clamp01((t - leakAt[g] - rnd(i, 4) * 1.5) / 2.2));
            const tx = [-W0 / 2 - 160, W0 / 2 + 160, (rnd(i, 5) - 0.5) * 200][g];
            const ty = [-H0 * 0.7, -H0 * 0.5, 120][g];
            x = x + (tx - x) * k;
            y = y + (ty - y) * k;
            op = 1 - k * 0.85;
            if (k > 0.2) col = [C.coral, C.plum, C.steel][g];
          }
          if (mode === "keep") {
            // точки собираются в ядро «выбранное дело»
            const k = ease(clamp01((t - b(1) - rnd(i, 6) * 1.2) / 1.6));
            const ang = rnd(i, 7) * Math.PI * 2;
            const rr = 30 + rnd(i, 8) * 110;
            x = x + (Math.cos(ang) * rr - x) * k;
            y = y + (-H0 / 2 + Math.sin(ang) * rr * 0.8 - y) * k;
            col = k > 0.5 ? C.teal : C.amber;
          }
          return <circle key={i} cx={x} cy={y} r={9} fill={col} stroke={OL} strokeWidth={1.4} strokeOpacity={0.4} opacity={op} />;
        })}
      </GlassBox>
      {mode === "leak" &&
        leaks.map((l, i) => (
          <Appear key={i} t={t} at={leakAt[i] + 0.6} x={cx + [-W0 / 2 - 170, W0 / 2 + 190, W0 / 2 + 190][i]} y={[300, 330, 640][i]}>
            <Label x={0} y={0} text={l} size={32} bg={[C.coralSoft, C.plumSoft, C.white][i]} />
          </Appear>
        ))}
      {mode === "keep" && (
        <Appear t={t} at={b(1) + 1.4} x={cx} y={250}>
          <Label x={0} y={0} text={S(p.caption, "выбранное дело")} size={36} bg={C.tealSoft} />
        </Appear>
      )}
      {mode === "debt" && (
        <g>
          <Appear t={t} at={b(0) + 0.6} x={Ar.cx + 330} y={360}>
            <circle r={60} fill={C.gold} stroke={OL} strokeWidth={5} />
            <circle r={42} fill="none" stroke={OL} strokeWidth={4} opacity={0.5} />
            <Label x={0} y={110} text="мелкая услуга → «я должен»" size={30} bg={C.white} />
          </Appear>
          <Appear t={t} at={b(1)} x={Ar.cx + 330} y={640}>
            <circle r={60} fill={C.amber} stroke={OL} strokeWidth={5} />
            <circle r={24} fill={C.cream} />
            <Label x={0} y={110} text="подаренный час → «ничего»" size={30} bg={C.white} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── II: рассеянное чтение — точка мечется между многими книгами; затем одна
//    книга, к которой возвращаются, и мысль «оседает» ──
export const Scatter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const calm = ramp(t, b1, 1.4);
  const books = 9;
  const pos = Array.from({ length: books }, (_, i) => ({ x: Ar.cx + Math.cos((i / books) * Math.PI * 2) * 380, y: 460 + Math.sin((i / books) * Math.PI * 2) * 250 }));
  const hop = Math.floor(t * 2.2) % books;
  const nxt = (hop + 4) % books;
  const f = (t * 2.2) % 1;
  const px = pos[hop].x + (pos[nxt].x - pos[hop].x) * ease(f);
  const py = pos[hop].y + (pos[nxt].y - pos[hop].y) * ease(f) - Math.sin(f * Math.PI) * 80;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {pos.map((q, i) => {
        const keep = i === 0;
        const x = keep ? q.x + (Ar.cx - q.x) * calm : q.x;
        const y = keep ? q.y + (460 - q.y) * calm : q.y;
        const op = keep ? 1 : 1 - calm * 0.75;
        return (
          <Appear key={i} t={t} at={0.1 + i * 0.12} x={x} y={y}>
            <g opacity={op} transform={`rotate(${wob(t, i, 3)}) scale(${keep ? 1 + calm * 0.6 : 1})`}>
              <rect x={-44} y={-58} width={88} height={116} rx={8} fill={[C.coral, C.amber, C.teal, C.plum, C.sage][i % 5]} stroke={OL} strokeWidth={4} />
              <rect x={-30} y={-40} width={60} height={10} rx={5} fill={C.cream} />
            </g>
          </Appear>
        );
      })}
      {/* «внимание» прыгает с книги на книгу, затем оседает на одной */}
      {calm < 1 && <circle cx={px + (Ar.cx - px) * calm} cy={py + (460 - py) * calm} r={22} fill={C.yellow} stroke={OL} strokeWidth={4} opacity={1 - calm} />}
      {calm > 0 &&
        Array.from({ length: 28 }, (_, i) => {
          const k = ease(clamp01((t - b1 - 0.6 - i * 0.07) / 0.8));
          const ang = rnd(i, 2) * Math.PI * 2;
          const r = 120 + rnd(i, 3) * 40;
          return <circle key={i} cx={Ar.cx + Math.cos(ang) * r * k} cy={460 + Math.sin(ang) * r * 0.8 * k + (1 - k) * -200} r={9} fill={C.teal} stroke={OL} strokeWidth={1.4} opacity={k} />;
        })}
      <Appear t={t} at={0.8} x={Ar.cx} y={130}>
        <Label x={0} y={0} text={S(p.top, "много книг — наспех")} size={36} bg={C.coralSoft} />
      </Appear>
      <Appear t={t} at={b1 + 1} x={Ar.cx} y={800}>
        <Label x={0} y={0} text={S(p.bottom, "одна мысль, усвоенная сегодня")} size={36} bg={C.tealSoft} />
      </Appear>
    </Drift>
  );
};

// ── VI: фонарь освещает фигуру — проявляются пятна-изъяны с подписями;
//    увидеть изъян = начать работу (не приговор) ──
export const FlawLamp: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, Math.min(2, ctx.beats.length - 1));
  const beam = ramp(t, 0.5, 1);
  const flaws = A(p.flaws).length ? A(p.flaws) : ["спешу", "хочу одобрения", "откладываю"];
  const fx = Ar.cx + 120;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* луч */}
      <path d={`M ${Ar.cx - 420} 260 L ${fx - 150} ${300} L ${fx - 150} ${820} Z`} fill={C.yellow} opacity={0.22 * beam} />
      <Appear t={t} at={0.2} x={Ar.cx - 440} y={260}>
        <g transform="rotate(20)">
          <rect x={-60} y={-34} width={110} height={68} rx={16} fill={C.amber} stroke={OL} strokeWidth={5} />
          <circle cx={56} cy={0} r={30} fill={C.yellow} stroke={OL} strokeWidth={5} />
        </g>
      </Appear>
      <Figure x={fx} y={840} s={1.3} color={C.sage} k={ramp(t, 0.1, 0.6)} />
      {flaws.map((f, i) => {
        const a = b1 + i * 0.8;
        const x = fx + [-40, 50, -10][i % 3];
        const y = [420, 560, 690][i % 3];
        const fixed = ramp(t, b2 + i * 0.6, 0.8);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={18 * pop(t, a)} fill={fixed > 0.5 ? C.teal : C.coral} stroke={OL} strokeWidth={3} />
            <Appear t={t} at={a + 0.3} x={x + 230} y={y}>
              <Label x={0} y={0} text={f} size={30} bg={fixed > 0.5 ? C.tealSoft : C.coralSoft} />
            </Appear>
            {fixed > 0 && <Check x={x + 400} y={y} s={32} k={fixed} />}
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={b2 + 1.2} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={38} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── VII: толпа вокруг человека перекрашивает его точки; затем «круг тех,
//    кто делает лучше», и взаимный обмен ──
export const CrowdPull: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "absorb";
  const b1 = at(ctx, 1);
  const cx = Ar.cx;
  const cy = 500;
  const crowd = dotField(90, Ar.x1 - Ar.x0 - 160, 640, 7);
  const tint = mode === "absorb" ? ramp(t, b1, 2.5) : 0;
  const choose = mode === "choose" ? ramp(t, b1, 1.2) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {crowd.map((d, i) => {
        const dist = Math.hypot(d.x, d.y * 1.4);
        if (dist < 200) return null;
        const k = ramp(t, 0.1 + rnd(i, 3) * 1.2, 0.5);
        const press = mode === "absorb" ? ramp(t, b1, 2.5) * 0.18 : 0;
        const away = choose * (1 - (i % 9 === 0 ? 1 : 0));
        return <circle key={i} cx={cx + d.x * (1 - press) * (1 + away * 0.25)} cy={cy + d.y * (1 - press)} r={12 + d.r * 6} fill={i % 9 === 0 && choose > 0 ? C.teal : C.coral} stroke={OL} strokeWidth={2} opacity={k * (1 - away * 0.7)} />;
      })}
      {/* человек в центре: его точки постепенно «перекрашиваются» */}
      <Particles shape="person" t={t} at={0.2} dur={1.6} x={cx} y={cy + 20} s={0.62} r={6} step={15} spread={300} />
      {tint > 0 &&
        Array.from({ length: 22 }, (_, i) => {
          const k = clamp01((tint - rnd(i, 4) * 0.5) * 2);
          const ang = rnd(i, 5) * Math.PI * 2;
          return <circle key={i} cx={cx + Math.cos(ang) * (300 - 230 * k)} cy={cy + Math.sin(ang) * (240 - 180 * k)} r={9} fill={C.coral} stroke={OL} strokeWidth={1.4} opacity={k} />;
        })}
      {mode === "choose" &&
        [0, 1, 2].map((i) => {
          const ang = -Math.PI / 2 + (i - 1) * 1.1;
          const x = cx + Math.cos(ang) * 330;
          const y = cy + Math.sin(ang) * 230 + 40;
          return (
            <g key={i}>
              <Figure x={x} y={y + 120} s={0.45} color={C.teal} k={ramp(t, b1 + 0.5 + i * 0.4, 0.6)} />
              <Arrow x1={x + (cx - x) * 0.25} y1={y} x2={cx + (x - cx) * 0.35} y2={cy - 20} k={ramp(t, b1 + 1.4 + i * 0.3, 0.6)} color={C.teal} w={6} bend={0.15} />
              <Arrow x1={cx + (x - cx) * 0.4} y1={cy + 10} x2={x + (cx - x) * 0.3} y2={y + 30} k={ramp(t, b1 + 2.2 + i * 0.3, 0.6)} color={C.amber} w={6} bend={0.15} />
            </g>
          );
        })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1)) + 0.8} x={cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={mode === "choose" ? C.tealSoft : C.coralSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── XIII: облако предположений и блоки фактов; ведущий разделяет ──
export const FogFacts: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, Math.min(2, ctx.beats.length - 1));
  const facts = A(p.facts);
  const guesses = A(p.guesses);
  const mode = p.mode ?? "split";
  const sep = mode === "mix" ? 0 : ramp(t, b1, 1.6);
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Cloud x={cx - sep * 260} y={440} s={1.15} k={ramp(t, 0.2, 0.8)} t={t} text={S(p.cloud, "а вдруг…")} />
      {guesses.map((g, i) => (
        <Appear key={i} t={t} at={0.8 + i * 0.5} x={cx - sep * 260 + [-160, 150, 0][i % 3]} y={[300, 320, 580][i % 3]}>
          <Label x={0} y={0} text={g} size={28} bg={C.plumSoft} color={C.plum} />
        </Appear>
      ))}
      {facts.map((f, i) => (
        <FactBlock key={i} x={cx + sep * 300} y={560 + i * 100} text={f} k={ramp(t, b1 + 0.8 + i * 0.5, 0.6)} />
      ))}
      {sep > 0 && <line x1={cx + 40} y1={180} x2={cx + 40} y2={860} stroke={C.ink} strokeWidth={5} strokeDasharray="14 14" opacity={0.35 * sep} />}
      {sep > 0 && (
        <g opacity={sep}>
          <Txt x={cx - 260} y={160} size={34} color={C.plum}>
            {S(p.leftTitle, "предполагаю")}
          </Txt>
          <Txt x={cx + 300} y={160} size={34} color={C.tealDeep}>
            {S(p.rightTitle, "знаю")}
          </Txt>
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={b2 + 0.8} x={cx + 300} y={820}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── II/XVIII: лестница желаний растёт без конца; линия «довольно» ──
export const EnoughLadder: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const cx = Ar.cx - 120;
  const grow = ramp(t, 0.3, Math.max(2, b1 - 0.3));
  const rungs = 3 + Math.floor(grow * 9);
  const steps = A(p.steps).length ? A(p.steps) : ["нужно", "удобнее", "лучше, чем у соседа", "ещё лучше", "самое новое"];
  const line = ramp(t, b1 + 0.4, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.025}>
      {Array.from({ length: rungs }, (_, i) => {
        const y = 840 - i * 70;
        const op = y < 120 ? 0.25 : 1;
        return (
          <g key={i} opacity={op * (line > 0 && i > 1 ? 1 - line * 0.5 : 1)}>
            <rect x={cx - 120} y={y} width={240} height={18} rx={9} fill={i > 1 ? C.coral : C.teal} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      <rect x={cx - 140} y={840 - rungs * 70} width={20} height={rungs * 70 + 30} fill={C.inkSoft} opacity={0.6} />
      <rect x={cx + 120} y={840 - rungs * 70} width={20} height={rungs * 70 + 30} fill={C.inkSoft} opacity={0.6} />
      {steps.map((s, i) => (
        <Appear key={i} t={t} at={0.6 + i * Math.max(0.5, (b1 - 1) / steps.length)} x={cx + 380} y={840 - i * 140}>
          <Label x={0} y={0} text={s} size={30} bg={i === 0 ? C.tealSoft : C.coralSoft} />
        </Appear>
      ))}
      {line > 0 && (
        <g opacity={line}>
          <line x1={cx - 320} y1={735} x2={cx - 320 + 640 * line} y2={735} stroke={C.teal} strokeWidth={10} strokeLinecap="round" />
          <Label x={cx - 330} y={680} text={S(p.lineText, "довольно")} size={34} bg={C.teal} color={C.white} />
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── III/IX: двое друзей; внутренняя опора каждого и мост доверия ──
export const FriendsBridge: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "bridge";
  const b1 = at(ctx, 1);
  const b2 = at(ctx, Math.min(2, ctx.beats.length - 1));
  const lx = Ar.cx - 300;
  const rx = Ar.cx + 300;
  const core = mode === "core" ? ramp(t, 0.6, 1) : ramp(t, b2, 1);
  const bridge = mode === "judge" ? ramp(t, b1 + 1.2, 1.6) : ramp(t, b1, 1.6);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Figure x={lx} y={800} s={1} color={C.teal} k={ramp(t, 0.1, 0.6)} arm={mode !== "judge" ? bridge * 40 : 0} />
      <Figure x={rx} y={800} s={1} color={C.amber} k={ramp(t, 0.3, 0.6)} armR={mode !== "judge" ? bridge * 40 : 0} />
      {/* внутренняя опора — светящееся ядро в каждом */}
      {[lx, rx].map((x, i) => (
        <g key={i} opacity={core}>
          <circle cx={x} cy={690} r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <circle cx={x} cy={690} r={52 + Math.sin(t * 2 + i) * 4} fill="none" stroke={C.yellow} strokeWidth={5} opacity={0.6} />
        </g>
      ))}
      {mode === "judge" && (
        <Appear t={t} at={0.6} x={Ar.cx} y={420}>
          <Label x={0} y={-60} text="1. сначала — разобраться" size={32} bg={C.white} />
          <Label x={0} y={30} text="2. потом — доверять" size={32} bg={C.tealSoft} />
        </Appear>
      )}
      <Thread x1={lx + 80} y1={600} x2={rx - 80} y2={600} k={bridge} t={t} color={C.teal} sag={70} n={40} />
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2)) + 0.6} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
      {A(p.tags).map((tg, i) => (
        <Appear key={i} t={t} at={at(ctx, i + 1) + 0.4} x={i % 2 ? rx : lx} y={270}>
          <Label x={0} y={0} text={tg} size={30} bg={i % 2 ? C.amberSoft : C.tealSoft} />
        </Appear>
      ))}
    </Drift>
  );
};

// ── XLVII: ярлык положения и человек под ним; ярлык снимается ──
export const Dignity: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const off = ramp(t, b1 + 0.5, 1.2);
  const tags = A(p.tags).length ? A(p.tags) : ["положение", "должность", "происхождение"];
  const people = [Ar.cx - 330, Ar.cx, Ar.cx + 330];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {people.map((x, i) => (
        <g key={i}>
          <Figure x={x} y={820} s={0.95} color={[C.sage, C.amber, C.sky][i]} k={ramp(t, 0.1 + i * 0.3, 0.6)} />
          {/* ярлык положения висит на фигуре, затем поднимается и бледнеет */}
          <g opacity={(1 - off) * ramp(t, 0.6 + i * 0.3, 0.5)} transform={`translate(${x} ${500 - off * 160}) rotate(${-6 + i * 6})`}>
            <rect x={-tags[i].length * 11 - 24} y={-28} width={tags[i].length * 22 + 48} height={56} rx={10} fill={C.steel} stroke={OL} strokeWidth={3} />
            <text y={10} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.white} textAnchor="middle">
              {tags[i]}
            </text>
          </g>
          <Appear t={t} at={b1 + 1.4 + i * 0.3} x={x} y={500}>
            <Label x={0} y={0} text={S(p.under, "человек")} size={32} bg={C.tealSoft} />
          </Appear>
        </g>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── LVI: шум снаружи (волны) и шум внутри (беспокойные точки в фигуре) ──
export const NoiseCalm: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, Math.min(2, ctx.beats.length - 1));
  const outer = 1 - ramp(t, b2, 1.5) * N(p.quietOuter, 0);
  const innerCalm = ramp(t, b2 + 0.4, 1.6);
  const cx = Ar.cx;
  const sources = A(p.sources).length ? A(p.sources) : ["улица", "соседи", "ремонт"];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {sources.map((s, i) => {
        const x = cx + [-430, 430, -380][i % 3];
        const y = [300, 330, 700][i % 3];
        return (
          <g key={i}>
            <Waves x={x + (x < cx ? 70 : -70)} y={y} t={t} amp={ramp(t, 0.2 + i * 0.4, 0.6) * outer} dir={x < cx ? 1 : -1} />
            <Appear t={t} at={0.2 + i * 0.4} x={x} y={y}>
              <Label x={0} y={0} text={s} size={30} bg={C.coralSoft} />
            </Appear>
          </g>
        );
      })}
      {/* фигура с «внутренним шумом»: беспокойные точки успокаиваются */}
      <Figure x={cx} y={860} s={1.15} color={C.teal} k={ramp(t, 0.1, 0.6)} />
      <g opacity={ramp(t, b1, 0.8)}>
        {Array.from({ length: 16 }, (_, i) => {
          const jit = (1 - innerCalm) * 26;
          const ang = (i / 16) * Math.PI * 2;
          const r = 60 + (1 - innerCalm) * 40;
          return <circle key={i} cx={cx + Math.cos(ang + t * (1 - innerCalm) * 2) * r + Math.sin(t * 9 + i) * jit} cy={640 + Math.sin(ang) * r * 0.7 + Math.cos(t * 8 + i * 2) * jit} r={9} fill={innerCalm > 0.6 ? C.teal : C.coral} stroke={OL} strokeWidth={1.4} />;
        })}
      </g>
      <Appear t={t} at={b1 + 0.4} x={cx + 300} y={600}>
        <Label x={0} y={0} text={S(p.innerText, "шум внутри")} size={30} bg={innerCalm > 0.6 ? C.tealSoft : C.white} />
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={b2 + 1.6} x={cx} y={140}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── LXXXIII: вечерний разбор дня — тетрадь с пометками ──
export const Review: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rows = (Array.isArray(p.rows) ? p.rows : []) as { text: string; mark?: "ok" | "q" | "fix" }[];
  const beats = (Array.isArray(p.beats) ? p.beats : rows.map((_, i) => i * 0.5)) as number[];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <Notebook x={Ar.cx} y={500} rows={rows} t={t} at={beats.map((b) => at(ctx, b) + 0.3)} k={ramp(t, 0.1, 0.6)} title={S(p.title, "Вечерний разбор")} />
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx} y={120}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── XCIV–XCV: разрозненные советы-карточки и дерево с корнями-основаниями ──
export const Precepts: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "cards";
  const b1 = at(ctx, 1);
  const cards = A(p.cards).length ? A(p.cards) : ["будь щедрым", "не завидуй", "держи слово", "береги друга", "не гонись за славой"];
  const roots = A(p.roots);
  const gather = mode === "roots" ? ramp(t, b1, 1.6) : 0;
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {mode === "roots" && <Particles shape="tree" t={t} at={b1 + 0.2} dur={2} x={cx} y={470} s={0.9} r={5.2} step={14} spread={700} />}
      {cards.map((c, i) => {
        const ang = (i / cards.length) * Math.PI * 2 + 0.3;
        const fx = cx + Math.cos(ang) * 470 + wob(t, i, 10);
        const fy = 460 + Math.sin(ang) * 270 + wob(t, i + 3, 8);
        // карточки «прикрепляются» к кроне дерева
        const row = i < 3 ? 0 : 1;
        const tx = cx + (row === 0 ? (i - 1) * 360 : (i - 3.5) * 360);
        const ty = 250 + row * 95;
        const x = fx + (tx - fx) * gather;
        const y = fy + (ty - fy) * gather;
        return (
          <Appear key={i} t={t} at={0.2 + i * 0.35} x={x} y={y}>
            <g transform={`rotate(${(1 - gather) * (rnd(i, 2) - 0.5) * 24}) scale(${1 - gather * 0.1})`}>
              <Label x={0} y={0} text={c} size={30} bg={C.white} />
            </g>
          </Appear>
        );
      })}
      {roots.map((r, i) => (
        <Appear key={i} t={t} at={at(ctx, 2) + i * 0.6} x={cx + (i - (roots.length - 1) / 2) * 460} y={800}>
          <Label x={0} y={0} text={r} size={32} bg={C.sageSoft} />
        </Appear>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1)) + 0.5} x={cx} y={120}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── CVII: обстоятельства движутся вокруг; в центре — выбранный поступок ──
export const Storm: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const things = A(p.things).length ? A(p.things) : ["болезнь", "потеря", "чужое решение", "непогода", "задержка"];
  const act = S(p.act, "мой следующий шаг");
  const chosen = ramp(t, b1 + 0.3, 1);
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {things.map((th, i) => {
        const ang = (i / things.length) * Math.PI * 2 + t * 0.25;
        const x = cx + Math.cos(ang) * 470;
        const y = 480 + Math.sin(ang) * 300;
        return (
          <Appear key={i} t={t} at={0.2 + i * 0.3} x={x} y={y}>
            <Label x={0} y={0} text={th} size={30} bg={C.white} color={C.inkSoft} />
          </Appear>
        );
      })}
      <ellipse cx={cx} cy={480} rx={250} ry={160} fill={C.tealSoft} stroke={C.teal} strokeWidth={6} opacity={chosen} />
      <Appear t={t} at={b1 + 0.6} x={cx} y={480}>
        {act.split("\n").map((ln, i, arr) => (
          <Txt key={i} x={0} y={12 + (i - (arr.length - 1) / 2) * 46} size={36} color={C.tealDeep} weight={900}>
            {ln}
          </Txt>
        ))}
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={cx} y={110}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── CXXIV: весы — «приятно» и «благо по разуму»; наклон меняется ──
export const GoodScale: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const tilt = -10 + 20 * ramp(t, b1 + 0.4, 1.4);
  const cx = Ar.cx;
  const left = S(p.left, "приятно сейчас");
  const right = S(p.right, "согласно разуму");
  const arm = 360;
  const ly = Math.sin((tilt * Math.PI) / 180) * -arm;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.1} x={cx} y={0}>
        <rect x={-14} y={330} width={28} height={480} fill={OL} />
        <rect x={-140} y={800} width={280} height={30} rx={10} fill={OL} />
        <g transform={`translate(0 330) rotate(${tilt})`}>
          <rect x={-arm - 20} y={-10} width={(arm + 20) * 2} height={20} rx={10} fill={OL} />
        </g>
        <circle cx={0} cy={330} r={24} fill={C.amber} stroke={OL} strokeWidth={4} />
      </Appear>
      {[
        { x: -arm, y: 330 + ly, text: left, col: C.coralSoft, at0: 0.5 },
        { x: arm, y: 330 - ly, text: right, col: C.tealSoft, at0: b1 },
      ].map((s, i) => (
        <Appear key={i} t={t} at={s.at0} x={cx + s.x * Math.cos((tilt * Math.PI) / 180)} y={s.y}>
          <line x1={0} y1={0} x2={0} y2={90} stroke={OL} strokeWidth={4} />
          <path d="M -120 90 L 120 90 L 80 150 L -80 150 Z" fill={i ? C.teal : C.coral} stroke={OL} strokeWidth={4} />
          <Label x={0} y={210} text={s.text} size={32} bg={s.col} />
        </Appear>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

export { Bead, Cross, HEAVY, Panel, Check };

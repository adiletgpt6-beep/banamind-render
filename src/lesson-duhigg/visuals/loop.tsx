// Петля привычки BM-035 — главный образ «Лаборатории невидимых кнопок»:
// яркая точка СИГНАЛ (оранжевая), плавная траектория ДЕЙСТВИЕ (лазурная),
// мягкое свечение НАГРАДА (золотое), в центре — фиолетовая ТЯГА (предвкушение).
// По петле бегут чёткие точки: чем «автоматичнее» привычка, тем быстрее и ровнее.
// Всё зависит только от времени сцены (без случайного шума).
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, at, clamp01, Cross, Drift, ramp, type VisualProps } from "./kit";
import { Label, OL } from "./props";

type P = { host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export const LOOP = { cue: C.cue, routine: C.routine, reward: C.reward, crave: C.crave };
export const LOOP_NAMES = { cue: "СИГНАЛ", routine: "ДЕЙСТВИЕ", reward: "НАГРАДА" };

// Точка-узел петли: цветной круг с контуром, пульс-кольца (сигнал), свечение (награда).
export const Node: React.FC<{ x: number; y: number; r?: number; color: string; k: number; t: number; pulse?: number; glow?: number; label?: string; sub?: string; dim?: number }> = ({ x, y, r = 62, color, k, t, pulse = 0, glow = 0, label, sub, dim = 0 }) => {
  if (k <= 0.001) return null;
  const kk = clamp01(k);
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * kk})`} opacity={clamp01(kk * 1.6) * (1 - dim * 0.7)}>
      {glow > 0 && (
        <>
          <circle r={r * (1.9 + 0.12 * Math.sin(t * 2.2))} fill={color} opacity={0.12 * glow} />
          <circle r={r * (1.45 + 0.08 * Math.sin(t * 2.2 + 1))} fill={color} opacity={0.18 * glow} />
        </>
      )}
      {pulse > 0 &&
        [0, 1].map((i) => {
          const ph = (((t * 0.8 + i * 0.5) % 1) + 1) % 1;
          return <circle key={i} r={r * (1 + ph * 0.9)} fill="none" stroke={color} strokeWidth={6} opacity={(1 - ph) * 0.55 * pulse} />;
        })}
      <circle r={r} fill={color} stroke={OL} strokeWidth={5} />
      <circle r={r * 0.42} cx={-r * 0.28} cy={-r * 0.3} fill="#fff" opacity={0.35} />
      {label && (
        <text y={r + 54} fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={C.ink} textAnchor="middle" letterSpacing={1}>
          {label}
        </text>
      )}
      {sub && (
        <text y={r + 100} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.inkSoft} textAnchor="middle">
          {sub.split("\n").map((l, i) => (
            <tspan key={i} x={0} dy={i === 0 ? 0 : 38}>
              {l}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
};

// точка на дуге окружности (угол в радианах)
const onCircle = (cx: number, cy: number, R: number, a: number): [number, number] => [cx + R * Math.cos(a), cy + R * Math.sin(a)];

// Дуга-траектория между узлами: рисуется штрихом, по ней бегут точки.
const Arc: React.FC<{ cx: number; cy: number; R: number; a0: number; a1: number; k: number; t: number; color: string; flow: number; speed: number; dots?: number }> = ({ cx, cy, R, a0, a1, k, t, color, flow, speed, dots = 5 }) => {
  if (k <= 0) return null;
  const n = 40;
  const pts: string[] = [];
  const m = Math.max(2, Math.round(n * clamp01(k)));
  for (let i = 0; i < m; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    const [x, y] = onCircle(cx, cy, R, a);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const last = onCircle(cx, cy, R, a0 + (a1 - a0) * ((m - 1) / (n - 1)));
  const ang = a0 + (a1 - a0) * ((m - 1) / (n - 1)) + Math.PI / 2 * Math.sign(a1 - a0);
  return (
    <g>
      <path d={pts.join(" ")} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
      {k > 0.97 && <path d={`M ${last[0] - 26 * Math.cos(ang - 0.5)} ${last[1] - 26 * Math.sin(ang - 0.5)} L ${last[0]} ${last[1]} L ${last[0] - 26 * Math.cos(ang + 0.5)} ${last[1] - 26 * Math.sin(ang + 0.5)}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
      {flow > 0 &&
        Array.from({ length: dots }, (_, i) => {
          const u = (((t * speed * 0.35 + i / dots) % 1) + 1) % 1;
          const [x, y] = onCircle(cx, cy, R, a0 + (a1 - a0) * u);
          return <circle key={i} cx={x} cy={y} r={11} fill="#fff" stroke={OL} strokeWidth={2.5} opacity={flow * Math.sin(u * Math.PI)} />;
        })}
    </g>
  );
};

// Петля целиком: три узла на окружности, три дуги, тяга в центре.
export type LoopState = {
  cue: number; routine: number; reward: number; // появление узлов 0…1
  arcs: number; // прорисовка дуг 0…1
  flow: number; // бегущие точки 0…1
  speed?: number;
  crave?: number; // свечение тяги в центре 0…1
  craveText?: string;
  pulse?: number;
  labels?: [string, string, string];
  subs?: [string, string, string];
  dimRoutine?: number;
};
export const HabitLoop: React.FC<{ cx: number; cy: number; R?: number; t: number; st: LoopState; r?: number }> = ({ cx, cy, R = 250, t, st, r = 62 }) => {
  // сигнал слева-сверху, действие справа-сверху, награда внизу
  const aCue = (-150 * Math.PI) / 180;
  const aRou = (-30 * Math.PI) / 180;
  const aRew = (90 * Math.PI) / 180;
  const gap = 0.36;
  const [x0, y0] = onCircle(cx, cy, R, aCue);
  const [x1, y1] = onCircle(cx, cy, R, aRou);
  const [x2, y2] = onCircle(cx, cy, R, aRew);
  const sp = st.speed ?? 1;
  const arcK = (i: number) => clamp01(st.arcs * 3 - i);
  const labels = st.labels ?? [LOOP_NAMES.cue, LOOP_NAMES.routine, LOOP_NAMES.reward];
  const subs = st.subs ?? ["", "", ""];
  return (
    <g>
      {(st.crave ?? 0) > 0 && (
        <g opacity={clamp01(st.crave ?? 0)}>
          <circle cx={cx} cy={cy} r={R * 0.55 + Math.sin(t * 2) * 6} fill={C.crave} opacity={0.12} />
          <circle cx={cx} cy={cy} r={R * 0.36 + Math.sin(t * 2 + 1) * 5} fill={C.crave} opacity={0.2} />
          <text x={cx} y={cy + 16} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={C.crave} textAnchor="middle">
            {st.craveText ?? "ТЯГА"}
          </text>
        </g>
      )}
      <Arc cx={cx} cy={cy} R={R} a0={aCue + gap} a1={aRou - gap} k={arcK(0)} t={t} color={C.routine} flow={st.flow} speed={sp} />
      <Arc cx={cx} cy={cy} R={R} a0={aRou + gap} a1={aRew - gap} k={arcK(1)} t={t + 0.3} color={C.reward} flow={st.flow} speed={sp} />
      <Arc cx={cx} cy={cy} R={R} a0={aRew + gap} a1={aCue + Math.PI * 2 - gap} k={arcK(2)} t={t + 0.6} color={C.cue} flow={st.flow} speed={sp} />
      <Node x={x0} y={y0} r={r} color={C.cue} k={st.cue} t={t} pulse={st.pulse ?? 1} label={labels[0]} sub={subs[0]} />
      <Node x={x1} y={y1} r={r} color={C.routine} k={st.routine} t={t} label={labels[1]} sub={subs[1]} dim={st.dimRoutine} />
      <Node x={x2} y={y2} r={r} color={C.reward} k={st.reward} t={t} glow={st.reward} label={labels[2]} sub={subs[2]} />
    </g>
  );
};

// ── Сцена «петля»: узлы появляются по репликам; можно включить тягу, ускорение,
// подмену действия (золотое правило: сигнал и награда те же, действие новое) ──
// p: cueBeat, routineBeat, rewardBeat, flowBeat, craveBeat, craveText, swapBeat, newRoutine,
//    subs [3], labels [3], title, caption, captionBeat, fast (автоматизм), side (пример рядом)
export const Loop: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx + N(p.dx, 0);
  const cy = 450;
  const bc = at(ctx, N(p.cueBeat, 0)) + 0.2;
  const br = at(ctx, N(p.routineBeat, 0.5)) + 0.2;
  const bw = at(ctx, N(p.rewardBeat, 1)) + 0.2;
  const bf = at(ctx, N(p.flowBeat, 2));
  const crave = p.craveBeat !== undefined ? ramp(t, at(ctx, N(p.craveBeat, 2)), 0.8) : 0;
  const swap = p.swapBeat !== undefined ? ramp(t, at(ctx, N(p.swapBeat, 2)), 0.7) : 0;
  const fastK = p.fastBeat !== undefined ? ramp(t, at(ctx, N(p.fastBeat, 2)), 1.2) : 0;
  const subs = A(p.subs);
  const labels = A(p.labels);
  const st: LoopState = {
    cue: ramp(t, bc, 0.5),
    routine: ramp(t, br, 0.5),
    reward: ramp(t, bw, 0.5),
    arcs: ramp(t, Math.min(br, bw) - 0.1, 1.6) * (t >= bw ? 1 : 0.67),
    flow: ramp(t, bf, 0.8),
    speed: 1 + fastK * 2.2,
    crave,
    craveText: S(p.craveText) || undefined,
    labels: labels.length === 3 ? (labels as [string, string, string]) : undefined,
    subs: subs.length === 3 ? ([subs[0], swap > 0.5 ? S(p.newSub, subs[1]) : subs[1], subs[2]] as [string, string, string]) : undefined,
    dimRoutine: 0,
  };
  const R = N(p.R, 210);
  const [rx, ry] = [cx + R * Math.cos(-Math.PI / 6), cy + R * Math.sin(-Math.PI / 6)];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.035}>
      {S(p.title) && (
        <Appear t={t} at={0.2} x={cx} y={130}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.white} />
        </Appear>
      )}
      <HabitLoop cx={cx} cy={cy} R={R} t={t} st={st} />
      {swap > 0 && (
        <g>
          <Cross x={rx} y={ry} s={110} k={clamp01(swap * 1.6)} />
          <g opacity={clamp01(swap * 2 - 1)} transform={`translate(${rx + 170} ${ry - 70})`}>
            <Label x={0} y={0} text={S(p.newRoutine, "новое действие")} size={34} bg={C.routineSoft} />
          </g>
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={cx} y={S(p.title) ? 205 : 135}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Холодный старт: крупный телефон на столе, всплывают уведомления, рука
// тянется сама — раз за разом; солнце за окном сдвигается (время уходит, без
// часов); затем прямо на стекле проступает прозрачная петля. ──
// p: cueBeat, reachBeat, layerBeat, rewardBeat
export const Phone: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const cue = at(ctx, N(p.cueBeat, 0)) + 0.3;
  const reach = at(ctx, N(p.reachBeat, 0.5));
  const layer = at(ctx, N(p.layerBeat, 2));
  const rew = at(ctx, N(p.rewardBeat, 2.5));
  const kLayer = ramp(t, layer, 0.9);
  const sun = clamp01(t / Math.max(1, dur));
  // рука тянется циклами: подъехала — «проверила» — отъехала (повтор привычки)
  const cyc = t < reach ? 0 : ((t - reach) % 3.4) / 3.4;
  const kReach = t < reach ? 0 : cyc < 0.35 ? ramp(cyc, 0, 0.35) : cyc < 0.7 ? 1 : 1 - ramp(cyc, 0.7, 0.3);
  const px = cx + 230;
  const py = 470;
  const notes = ["Новое сообщение", "Вам ответили", "+3 новых", "Посмотрите это"];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.06}>
      {/* окно: солнце уходит по дуге */}
      <g transform={`translate(${Ar.x0 + 60} 150)`} opacity={1 - kLayer * 0.7}>
        <rect x={0} y={0} width={360} height={260} rx={22} fill="#dff0fb" stroke={OL} strokeWidth={6} />
        <circle cx={50 + sun * 260} cy={150 - Math.sin(sun * Math.PI) * 80} r={34} fill={C.reward} stroke={OL} strokeWidth={4} />
        <line x1={180} y1={0} x2={180} y2={260} stroke={OL} strokeWidth={6} />
        <line x1={0} y1={130} x2={360} y2={130} stroke={OL} strokeWidth={6} />
      </g>
      {/* стол и забытая работа */}
      <rect x={Ar.x0 + 20} y={760} width={Ar.x1 - Ar.x0 - 40} height={36} rx={18} fill="#d9b88c" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${Ar.x0 + 330} 700)`}>
        <rect x={-150} y={-20} width={300} height={60} rx={10} fill={C.cream} stroke={OL} strokeWidth={4} transform="rotate(-4)" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-120} y={-6 + i * 14} width={i === 2 ? 120 : 220} height={6} rx={3} fill={C.inkSoft} opacity={0.35} transform="rotate(-4)" />
        ))}
      </g>
      {/* телефон стоит на подставке, крупно */}
      <g transform={`translate(${px} ${py}) rotate(${-4 + kReach * 3})`}>
        <rect x={-150} y={-250} width={300} height={500} rx={44} fill={OL} />
        <rect x={-128} y={-222} width={256} height={444} rx={26} fill={t > cue ? "#fff8ea" : "#33405c"} />
        {t > cue &&
          notes.map((n, i) => {
            const k = ramp(t, cue + i * 1.6, 0.4);
            if (k <= 0) return null;
            return (
              <g key={i} transform={`translate(0 ${-150 + i * 78 + (1 - k) * 20})`} opacity={k}>
                <rect x={-110} y={-30} width={220} height={60} rx={16} fill="#fff" stroke={OL} strokeWidth={3} />
                <circle cx={-82} cy={0} r={14} fill={[C.cue, C.routine, C.crave, C.reward][i]} />
                <text x={-58} y={8} fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.ink}>
                  {n}
                </text>
              </g>
            );
          })}
        {t > cue && kLayer <= 0 &&
          [0, 1].map((i) => {
            const ph = ((((t - cue) * 0.9 + i * 0.5) % 1) + 1) % 1;
            return <circle key={i} cx={110} cy={-215} r={14 + ph * 70} fill="none" stroke={C.cue} strokeWidth={6} opacity={(1 - ph) * 0.8} />;
          })}
        {t > cue && <circle cx={110} cy={-215} r={16} fill={C.cue} stroke="#fff" strokeWidth={4} />}
        {/* петля проступает прямо на стекле */}
        {kLayer > 0 && (
          <g opacity={kLayer}>
            <rect x={-128} y={-222} width={256} height={444} rx={26} fill="#ffffff" opacity={0.82} />
            <HabitLoop cx={0} cy={-30} R={88} r={30} t={t} st={{ cue: ramp(t, layer + 0.1, 0.5), routine: ramp(t, layer + 0.6, 0.5), reward: ramp(t, rew, 0.5), arcs: ramp(t, layer + 0.4, 1.4) * (t >= rew ? 1 : 0.67), flow: ramp(t, rew + 0.4, 0.8), labels: ["", "", ""] }} />
          </g>
        )}
        <rect x={-60} y={250} width={120} height={20} rx={8} fill="#9aa3b5" />
      </g>
      {kLayer > 0 &&
        [["СИГНАЛ", C.cueSoft, -300, -170, layer + 0.1], ["ДЕЙСТВИЕ", C.routineSoft, 300, -170, layer + 0.6], ["НАГРАДА", C.rewardSoft, 0, 330, rew]].map(([txt, bg, dx, dy, a], i) => (
          <Appear key={i} t={t} at={a as number} x={px + (dx as number)} y={py + (dy as number)}>
            <Label x={0} y={0} text={txt as string} size={36} bg={bg as string} />
          </Appear>
        ))}
      {/* рука в рукаве тянется к экрану */}
      <g transform={`translate(${px - 520 + kReach * 330} ${py + 160 - kReach * 60}) rotate(${-18 + kReach * 6})`}>
        <rect x={-420} y={-44} width={400} height={88} rx={44} fill={C.routineSoft} stroke={OL} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={60} ry={46} fill="#f1c9a5" stroke={OL} strokeWidth={5} />
        <rect x={34} y={-40} width={74} height={26} rx={13} fill="#f1c9a5" stroke={OL} strokeWidth={4} />
      </g>
    </Drift>
  );
};

// ── Город с невидимыми кнопками: над будничными действиями зажигаются маленькие петли ──
// p: revealBeat, tags [[text, beat]], caption, captionBeat
export const City: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const reveal = ramp(t, at(ctx, N(p.revealBeat, 1)), 1.2);
  const houses = [
    { x: -560, w: 190, h: 330, c: C.brickSoft },
    { x: -350, w: 230, h: 430, c: C.skySoft },
    { x: -100, w: 180, h: 290, c: C.rewardSoft },
    { x: 100, w: 250, h: 470, c: C.stoneSoft },
    { x: 370, w: 200, h: 350, c: C.sageSoft },
  ];
  const spots = [
    [-470, 560], [-240, 460], [-10, 600], [220, 420], [470, 540], [-360, 760], [330, 760],
  ];
  const tags = (Array.isArray(p.tags) ? p.tags : []) as [string, number][];
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.04}>
      <g transform={`translate(${cx} 0)`}>
        {houses.map((h, i) => (
          <g key={i}>
            <rect x={h.x} y={850 - h.h} width={h.w} height={h.h} rx={14} fill={h.c} stroke={OL} strokeWidth={5} />
            {Array.from({ length: Math.floor(h.h / 90) }, (_, r) =>
              [0, 1].map((c) => <rect key={`${r}-${c}`} x={h.x + 30 + c * (h.w / 2 - 10)} y={850 - h.h + 40 + r * 90} width={h.w / 2 - 50} height={46} rx={8} fill="#fff" stroke={OL} strokeWidth={3} opacity={0.9} />),
            )}
          </g>
        ))}
        <rect x={-680} y={850} width={1360} height={24} rx={12} fill={C.stone} />
        {/* прозрачный слой: петли над действиями */}
        {reveal > 0 && (
          <g opacity={reveal}>
            <rect x={-680} y={180} width={1360} height={700} rx={40} fill="#fff" opacity={0.35 * reveal} />
            {spots.map(([x, y], i) => {
              const k = ramp(t, at(ctx, N(p.revealBeat, 1)) + i * 0.25, 0.6);
              const R = 36;
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
                  <circle r={R + 18} fill="#fff" opacity={0.6} />
                  {[C.cue, C.routine, C.reward].map((c, j) => {
                    const a = -Math.PI / 2 + (j * 2 * Math.PI) / 3 + t * 0.9;
                    return <circle key={j} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={12} fill={c} stroke={OL} strokeWidth={2.5} />;
                  })}
                </g>
              );
            })}
          </g>
        )}
      </g>
      {tags.map(([text, beat], i) => (
        <Appear key={i} t={t} at={at(ctx, beat) + 0.2} x={cx + (i - (tags.length - 1) / 2) * 400} y={130}>
          <Label x={0} y={0} text={text} size={34} bg={[C.cueSoft, C.routineSoft, C.rewardSoft, C.craveSoft][i % 4]} />
        </Appear>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.2} x={cx} y={215}>
          <Label x={0} y={0} text={S(p.caption)} size={30} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Журнал эксперимента BanaMind: дни × замены награды, пометка «тяга осталась?» ──
// p: title, rows [[день, что попробовал, итог(«да»|«нет»|«?»)], …], beats [n]
export const Diary: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rows = (Array.isArray(p.rows) ? p.rows : []) as [string, string, string][];
  const beats = (Array.isArray(p.beats) ? p.beats : rows.map((_, i) => i)) as number[];
  const w = Math.min(1180, Ar.x1 - Ar.x0 - 60);
  const x0 = Ar.cx - w / 2;
  const head = A(p.head);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <Appear t={t} at={0.2} x={0} y={0}>
        <rect x={x0 + 8} y={150 + 12} width={w} height={130 + rows.length * 104} rx={30} fill="#24324a" opacity={0.1} />
        <rect x={x0} y={150} width={w} height={130 + rows.length * 104} rx={30} fill={C.cream} stroke={OL} strokeWidth={5} />
        <text x={x0 + 50} y={225} fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={C.ink}>
          {S(p.title, "Журнал эксперимента")}
        </text>
        {head.map((h, i) => (
          <text key={i} x={x0 + [50, 260, w - 70][i]} y={275} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.inkSoft} textAnchor={i === 2 ? "end" : "start"}>
            {h}
          </text>
        ))}
      </Appear>
      {rows.map(([d, what, res], i) => {
        const a = at(ctx, beats[i] ?? i) + 0.2;
        const k = ramp(t, a, 0.5);
        if (k <= 0) return null;
        const y = 340 + i * 104;
        const col = res === "нет" ? C.green : res === "да" ? C.coral : C.amber;
        return (
          <g key={i} opacity={k} transform={`translate(${(1 - k) * 24} 0)`}>
            <line x1={x0 + 40} y1={y + 38} x2={x0 + w - 40} y2={y + 38} stroke={C.inkSoft} strokeWidth={2} opacity={0.25} />
            <text x={x0 + 50} y={y + 12} fontFamily={HEAVY} fontWeight={800} fontSize={34} fill={C.routine}>
              {d}
            </text>
            <text x={x0 + 260} y={y + 12} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink}>
              {what}
            </text>
            <g transform={`translate(${x0 + w - 130} ${y})`}>
              <rect x={-70} y={-32} width={140} height={56} rx={28} fill={col} stroke={OL} strokeWidth={3} />
              <text y={10} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#fff" textAnchor="middle">
                {res}
              </text>
            </g>
          </g>
        );
      })}
    </Drift>
  );
};

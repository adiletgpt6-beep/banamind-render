// Сцены Лаборатории развилок истории BM-027 (часть 2): отбор растений,
// «воронка» одомашнивания, оси континентов, микробы, письменность,
// изобретения, лестница обществ, пять регионов, память о цене столкновений,
// раздробленность и единство, весы объяснения, финальная линза.
// Континенты — нарочно условные пятна-схемы с подписью «условная схема»;
// это не карта, не границы и не реконструкция маршрутов.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Germ, Icon, Lens, OL, Person, Plant, Wheat, Animal, City, House } from "./icons";
import { Label } from "./props";
import { rnd } from "./particles";

type P = { mode?: string; host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);

// ── Отбор: в ряду диких растений одно «другое»; люди сажают именно его ──
// p.wild / p.chosen / p.result — подписи; p.fruitWild / p.fruitGood — цвета плодов.
export const Selection: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, N(p.chooseBeat, 1));
  const b2 = at(ctx, N(p.fieldBeat, 2));
  const n = 7;
  const span = Math.min(1100, Ar.x1 - Ar.x0 - 120);
  const odd = 4;
  const fw = S(p.fruitWild, C.coral);
  const fg = S(p.fruitGood, C.amber);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.1} x={Ar.cx} y={150}>
        <Label x={0} y={0} text={S(p.title, "как появляется культурное растение")} size={38} bg={C.yellow} />
      </Appear>
      {Array.from({ length: n }, (_, i) => {
        const x = Ar.cx - span / 2 + (i * span) / (n - 1);
        const chosen = i === odd;
        const lift = chosen ? ramp(t, b1, 0.7) : 0;
        const fade = chosen ? 1 : 1 - 0.5 * ramp(t, b1, 0.7);
        return (
          <g key={i} opacity={fade} transform={`translate(0 ${-lift * 30})`}>
            <Plant x={x} y={430} s={0.85} big={chosen ? 0.8 * lift : 0} fruit={chosen && lift > 0.5 ? fg : fw} k={ramp(t, 0.3 + i * 0.12, 0.5)} />
            {chosen && lift > 0 && <circle cx={x} cy={400} r={110} fill="none" stroke={C.teal} strokeWidth={6} strokeDasharray="14 10" opacity={lift} />}
          </g>
        );
      })}
      <Appear t={t} at={0.9} x={Ar.cx - span / 3} y={560}>
        <Label x={0} y={0} text={S(p.wild, "дикие: мелкие, горькие")} size={30} bg={C.coralSoft} />
      </Appear>
      <Appear t={t} at={b1 + 0.4} x={Ar.cx + span / 2 - 120} y={250}>
        <Label x={0} y={0} text={S(p.chosen, "редкое удобное растение")} size={30} bg={C.tealSoft} />
      </Appear>
      <Arrow x1={Ar.cx + span / 6} y1={530} x2={Ar.cx + span / 6} y2={620} k={ramp(t, b2, 0.6)} color={C.tealDeep} w={8} />
      {Array.from({ length: 9 }, (_, i) => (
        <Plant key={i} x={Ar.cx - 360 + i * 90} y={720 + (i % 2) * 18} s={0.55} big={0.8} fruit={fg} k={ramp(t, b2 + 0.3 + i * 0.1, 0.4)} />
      ))}
      <Appear t={t} at={b2 + 1.3} x={Ar.cx} y={840}>
        <Label x={0} y={0} text={S(p.result, "поле из потомков удобного растения")} size={30} bg={C.sageSoft} />
      </Appear>
    </Drift>
  );
};

// ── Воронка одомашнивания: много кандидатов → фильтры → немногие ──
// p.top / p.bottom — подписи; p.filters — причины отсева; p.beats — реплика фильтра.
export const Funnel: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const filters = A(p.filters);
  const beats = (Array.isArray(p.beats) ? p.beats : filters.map(() => 1)) as number[];
  const cx = Ar.cx - 120;
  const top = 200;
  const bot = 780;
  const n = filters.length;
  const dots = Array.from({ length: 70 }, (_, i) => i);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.025}>
      <path d={`M ${cx - 330} ${top + 60} L ${cx + 330} ${top + 60} L ${cx + 70} ${bot - 40} L ${cx - 70} ${bot - 40} Z`} fill={C.glass} stroke={OL} strokeWidth={5} opacity={ramp(t, 0.1, 0.5)} />
      <Appear t={t} at={0.2} x={cx} y={top}>
        <Label x={0} y={0} text={S(p.top)} size={34} bg={C.white} />
      </Appear>
      {dots.map((i) => {
        // точка падает и останавливается на одном из фильтров (или проходит)
        const stopAt = i % 7 === 0 ? n : i % n;
        const yStop = stopAt >= n ? bot + 30 : top + 120 + (stopAt + 0.5) * ((bot - top - 160) / n);
        const start = 0.5 + rnd(i, 1) * 1.6;
        const k = clamp01((t - start) / 2.2);
        const filterOpen = stopAt >= n ? 1 : ramp(t, at(ctx, beats[stopAt] ?? 1), 0.6);
        const y = top + 70 + (yStop - top - 70) * k * (stopAt >= n ? 1 : Math.min(1, 0.4 + filterOpen));
        const half = 300 - ((y - top - 60) / (bot - top - 100)) * 230;
        const x = cx + (rnd(i, 2) - 0.5) * 2 * Math.max(40, half - 20);
        return <circle key={i} cx={x} cy={y} r={11} fill={stopAt >= n ? C.amber : C.earth} stroke={OL} strokeWidth={2} opacity={k > 0 ? (stopAt >= n ? 1 : 0.85) : 0} />;
      })}
      {filters.map((f, i) => {
        const y = top + 120 + (i + 0.5) * ((bot - top - 160) / n);
        const half = 300 - ((y - top - 60) / (bot - top - 100)) * 230;
        const k = ramp(t, at(ctx, beats[i] ?? 1), 0.6);
        return (
          <g key={i} opacity={k}>
            <line x1={cx - half} y1={y + 14} x2={cx + half} y2={y + 14} stroke={C.coral} strokeWidth={6} strokeDasharray="12 8" />
            <Label x={cx + 330 + 230} y={y} text={f} size={28} bg={C.coralSoft} />
            <line x1={cx + half + 10} y1={y + 6} x2={cx + 380} y2={y} stroke={C.coral} strokeWidth={3} />
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, N(p.bottomBeat, 2))} x={cx} y={bot + 50}>
        <Label x={0} y={0} text={S(p.bottom)} size={34} bg={C.amberSoft} />
      </Appear>
    </Drift>
  );
};

// ── Оси континентов: широкий «восток–запад» против вытянутого «север–юг» ──
// Климатические полосы — горизонтальные; культура распространяется точками.
const BLOB_EW = "M -420 -60 Q -380 -150 -160 -140 Q 60 -170 300 -130 Q 440 -110 430 -20 Q 420 80 220 100 Q -20 130 -240 100 Q -440 80 -420 -60 Z";
const BLOB_NS = "M -60 -330 Q 40 -350 80 -260 Q 120 -170 40 -80 Q -10 -20 30 60 Q 110 180 50 290 Q 0 350 -40 290 Q -90 190 -40 80 Q 0 0 -80 -90 Q -150 -200 -60 -330 Z";
export const Axes: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, N(p.spreadBeat, 1));
  const b2 = at(ctx, N(p.blockBeat, 2));
  const lx = Ar.x0 + (Ar.x1 - Ar.x0) * 0.36;
  const rx = Ar.x0 + (Ar.x1 - Ar.x0) * 0.82;
  const bands = [
    { y: 300, c: C.skySoft, n: "холоднее" },
    { y: 520, c: C.sageSoft, n: "умеренно" },
    { y: 740, c: C.amberSoft, n: "тропики" },
  ].map((b) => ({ ...b, y: b.y - 10 }));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
      {bands.map((b, i) => (
        <g key={i} opacity={ramp(t, 0.1 + i * 0.15, 0.5) * 0.9}>
          <rect x={Ar.x0} y={b.y - 110} width={Ar.x1 - Ar.x0} height={220} fill={b.c} opacity={0.55} />
          <Txt x={Ar.x0 + 20} y={b.y - 80} size={24} anchor="start" color={C.inkSoft} weight={800}>
            {b.n}
          </Txt>
        </g>
      ))}
      {/* «широкий» континент */}
      <g transform={`translate(${lx} 520) scale(${0.95})`} opacity={ramp(t, 0.4, 0.6)}>
        <path d={BLOB_EW} fill={C.earthSoft} stroke={OL} strokeWidth={6} />
      </g>
      <Appear t={t} at={0.7} x={lx} y={330}>
        <Label x={0} y={0} text={S(p.left, "ось восток–запад")} size={30} bg={C.white} />
      </Appear>
      {/* распространение вдоль одной широты */}
      {Array.from({ length: 12 }, (_, i) => {
        const k = ramp(t, b1 + i * 0.18, 0.4);
        return <Wheat key={i} x={lx - 360 + i * 64} y={520 + Math.sin(i) * 20} s={0.32} k={k} />;
      })}
      <Arrow x1={lx - 300} y1={640} x2={lx + 320} y2={640} k={ramp(t, b1, 1.6)} color={C.tealDeep} w={8} />
      <Arrow x1={lx + 300} y1={660} x2={lx - 320} y2={660} k={ramp(t, b1 + 0.5, 1.6)} color={C.tealDeep} w={8} />
      {/* «вытянутый» континент */}
      <g transform={`translate(${rx} 520) scale(0.95)`} opacity={ramp(t, 0.6, 0.6)}>
        <path d={BLOB_NS} fill={C.earthSoft} stroke={OL} strokeWidth={6} />
      </g>
      <Appear t={t} at={0.9} x={rx + 150} y={250}>
        <Label x={0} y={0} text={S(p.right, "ось север–юг")} size={30} bg={C.white} />
      </Appear>
      {Array.from({ length: 4 }, (_, i) => (
        <Wheat key={i} x={rx - 20 + (i % 2) * 40} y={770 - i * 26} s={0.32} k={ramp(t, b2 + i * 0.2, 0.4)} />
      ))}
      <Arrow x1={rx + 120} y1={760} x2={rx + 120} y2={600} k={ramp(t, b2 + 0.6, 0.8)} color={C.plum} w={8} />
      {ramp(t, b2 + 1.4, 0.4) > 0 && <Cross x={rx + 120} y={560} s={70} k={ramp(t, b2 + 1.4, 0.5)} />}
      <Appear t={t} at={b2 + 1.6} x={rx - 40} y={130}>
        <Label x={0} y={0} text={S(p.rightNote, "смена климата — барьер")} size={28} bg={C.plumSoft} />
      </Appear>
      <Appear t={t} at={1.2} x={Ar.x0 + 200} y={150}>
        <Txt x={0} y={0} size={24} color={C.inkSoft} weight={800}>
          условная схема, не карта
        </Txt>
      </Appear>
    </Drift>
  );
};

// ── Микробы: mode crowd (плотность), animals (от животных к людям), asym (асимметрия) ──
export const Germs: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "crowd";
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  if (mode === "animals") {
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
        <Animal x={Ar.cx - 360} y={560} s={1.5} k={ramp(t, 0.2, 0.5)} />
        <Germ x={Ar.cx - 360} y={380} s={0.6} k={ramp(t, 0.8, 0.5)} t={t} />
        <Arrow x1={Ar.cx - 180} y1={520} x2={Ar.cx + 160} y2={520} k={ramp(t, b1, 1)} color={C.coral} w={9} />
        <Germ x={Ar.cx + (ramp(t, b1, 1.4) - 0.5) * 340} y={460} s={0.45} k={ramp(t, b1 + 0.2, 0.4)} t={t} />
        {[0, 1, 2].map((i) => (
          <Person key={i} x={Ar.cx + 300 + i * 90} y={560} s={1.2} k={ramp(t, 0.4 + i * 0.15, 0.5)} color={C.teal} />
        ))}
        <Appear t={t} at={0.6} x={Ar.cx - 360} y={780}>
          <Label x={0} y={0} text={S(p.left, "стада рядом с людьми")} size={30} bg={C.white} />
        </Appear>
        <Appear t={t} at={b1 + 1} x={Ar.cx + 390} y={780}>
          <Label x={0} y={0} text={S(p.right, "болезнь меняет хозяина")} size={30} bg={C.coralSoft} />
        </Appear>
        {S(p.caption) && (
          <Appear t={t} at={b2} x={Ar.cx} y={200}>
            <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.yellow} />
          </Appear>
        )}
      </Drift>
    );
  }
  if (mode === "asym") {
    const lx = Ar.x0 + 300;
    const rx = Ar.x1 - 300;
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
        <g transform={`translate(${lx} 540) scale(0.6)`} opacity={ramp(t, 0.2, 0.5)}>
          <path d={BLOB_EW} fill={C.earthSoft} stroke={OL} strokeWidth={8} />
        </g>
        <g transform={`translate(${rx} 540) scale(0.6)`} opacity={ramp(t, 0.4, 0.5)}>
          <path d={BLOB_NS} fill={C.earthSoft} stroke={OL} strokeWidth={8} />
        </g>
        <Appear t={t} at={0.5} x={lx} y={330}>
          <Label x={0} y={0} text={S(p.left, "Старый Свет")} size={32} bg={C.white} />
        </Appear>
        <Appear t={t} at={0.7} x={rx} y={300}>
          <Label x={0} y={0} text={S(p.right, "Новый Свет")} size={32} bg={C.white} />
        </Appear>
        <Arrow x1={lx + 220} y1={500} x2={rx - 120} y2={500} k={ramp(t, b1, 1.2)} color={C.coral} w={16} />
        {[0, 1, 2].map((i) => (
          <Germ key={i} x={lx + 300 + i * 150} y={440} s={0.42} k={ramp(t, b1 + 0.6 + i * 0.25, 0.4)} t={t + i} />
        ))}
        <Arrow x1={rx - 120} y1={620} x2={lx + 220} y2={620} k={ramp(t, b2, 1.2)} color={C.plum} w={4} />
        <Appear t={t} at={b2 + 0.8} x={Ar.cx} y={700}>
          <Label x={0} y={0} text={S(p.back, "в обратную сторону — почти ничего")} size={28} bg={C.plumSoft} />
        </Appear>
        {S(p.caption) && (
          <Appear t={t} at={at(ctx, N(p.capBeat, 2)) + 1.5} x={Ar.cx} y={170}>
            <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.white} />
          </Appear>
        )}
      </Drift>
    );
  }
  // crowd: деревня → город; микробы удерживаются только при большой плотности
  const villageN = 6;
  const cityN = 48;
  const lx = Ar.cx - (Ar.x1 - Ar.x0) * 0.24;
  const rx = Ar.cx + (Ar.x1 - Ar.x0) * 0.22;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {Array.from({ length: villageN }, (_, i) => (
        <Person key={i} x={lx + (rnd(i, 1) - 0.5) * 300} y={560 + (rnd(i, 2) - 0.5) * 200} s={0.8} k={ramp(t, 0.3 + i * 0.1, 0.4)} color={C.teal} />
      ))}
      <Germ x={lx} y={380} s={0.5} k={ramp(t, 0.9, 0.4) * (1 - ramp(t, b1, 0.8))} t={t} />
      <Appear t={t} at={0.6} x={lx} y={800}>
        <Label x={0} y={0} text={S(p.left, "мало людей: болезнь угасает")} size={28} bg={C.white} />
      </Appear>
      <City x={rx} y={330} s={1} k={ramp(t, b1, 0.5)} />
      {Array.from({ length: cityN }, (_, i) => (
        <Person key={i} x={rx + (rnd(i, 4) - 0.5) * 420} y={590 + (rnd(i, 5) - 0.5) * 220} s={0.5} k={ramp(t, b1 + 0.2 + i * 0.03, 0.3)} color={C.amber} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Germ key={i} x={rx + (rnd(i, 6) - 0.5) * 380} y={520 + (rnd(i, 7) - 0.5) * 180 + wob(t, i, 8)} s={0.38} k={ramp(t, b2 + i * 0.25, 0.4)} t={t + i} />
      ))}
      <Appear t={t} at={b2 + 0.5} x={rx} y={830}>
        <Label x={0} y={0} text={S(p.right, "много людей: болезнь держится")} size={28} bg={C.coralSoft} />
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2)) + 1.2} x={Ar.cx} y={170}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Письменность: mode «few» (немного самостоятельных очагов, условные огоньки),
// «copy» (копия чертежа против диффузии идеи) ──
export const Writing: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "few";
  if (mode === "copy") {
    const w = (Ar.x1 - Ar.x0 - 80) / 2;
    const cols = [
      { x: Ar.x0 + 20, title: S(p.leftTitle, "копия чертежа"), items: A(p.left), c: C.teal, at: 0.4 },
      { x: Ar.x0 + 60 + w, title: S(p.rightTitle, "диффузия идеи"), items: A(p.right), c: C.amber, at: at(ctx, N(p.rightBeat, 1)) },
    ];
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
        {cols.map((c, ci) => (
          <g key={ci} opacity={ramp(t, c.at, 0.6)}>
            <Panel x={c.x} y={170} w={w} h={620} fill={C.white} />
            <rect x={c.x} y={170} width={w} height={90} rx={36} fill={c.c} />
            <rect x={c.x} y={220} width={w} height={40} fill={c.c} />
            <Txt x={c.x + w / 2} y={232} size={40} color={C.white} weight={900}>
              {c.title}
            </Txt>
            {/* схема: лист → лист (копия) или лампочка → новый лист (идея) */}
            <g transform={`translate(${c.x + w / 2} 400)`}>
              <rect x={-170} y={-60} width={110} height={130} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
              {[0, 1, 2].map((i) => (
                <line key={i} x1={-150} y1={-30 + i * 30} x2={-80} y2={-30 + i * 30} stroke={OL} strokeWidth={5} opacity={0.5} />
              ))}
              <Arrow x1={-40} y1={0} x2={40} y2={0} k={ramp(t, c.at + 0.6, 0.6)} color={c.c} w={8} />
              {ci === 0 ? (
                <g opacity={ramp(t, c.at + 1.1, 0.5)}>
                  <rect x={60} y={-60} width={110} height={130} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
                  {[0, 1, 2].map((i) => (
                    <line key={i} x1={80} y1={-30 + i * 30} x2={150} y2={-30 + i * 30} stroke={OL} strokeWidth={5} opacity={0.5} />
                  ))}
                </g>
              ) : (
                <g opacity={ramp(t, c.at + 1.1, 0.5)}>
                  <circle cx={115} cy={-10} r={44} fill={C.yellow} stroke={OL} strokeWidth={4} />
                  <rect x={98} y={34} width={34} height={24} rx={6} fill={C.steel} stroke={OL} strokeWidth={3} />
                  <Txt x={115} y={4} size={40} weight={900}>
                    ?
                  </Txt>
                </g>
              )}
            </g>
            {c.items.map((it, i) => (
              <Appear key={i} t={t} at={c.at + 1.3 + i * 0.6} x={c.x + 40} y={590 + i * 70}>
                <circle cx={10} cy={-10} r={10} fill={c.c} />
                <Txt x={36} y={0} size={30} anchor="start" weight={800}>
                  {it}
                </Txt>
              </Appear>
            ))}
          </g>
        ))}
      </Drift>
    );
  }
  // few: условная «карта» из пятен; немногие очаги загораются, затем от них — стрелки заимствований
  const places = (Array.isArray(p.places) ? p.places : []) as [string, number, number, number][];
  const borrowAt = at(ctx, N(p.borrowBeat, 2));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <g transform={`translate(${Ar.cx - 180} 520) scale(0.95)`} opacity={ramp(t, 0.1, 0.5)}>
        <path d={BLOB_EW} fill={C.earthSoft} stroke={OL} strokeWidth={6} />
      </g>
      <g transform={`translate(${Ar.x1 - 230} 560) scale(0.7)`} opacity={ramp(t, 0.2, 0.5)}>
        <path d={BLOB_NS} fill={C.earthSoft} stroke={OL} strokeWidth={8} />
      </g>
      {places.map(([name, x, y, beat], i) => {
        const px = Ar.x0 + x * (Ar.x1 - Ar.x0);
        const py = 260 + y * 600;
        const k = pop(t, at(ctx, beat));
        return (
          <g key={i}>
            <g transform={`translate(${px} ${py}) scale(${k})`}>
              <circle r={44} fill={C.yellow} opacity={0.35 + 0.15 * Math.sin(t * 3 + i)} />
              <circle r={24} fill={C.amber} stroke={OL} strokeWidth={4} />
            </g>
            <Appear t={t} at={at(ctx, beat) + 0.3} x={px} y={py + 70}>
              <Label x={0} y={0} text={name} size={26} bg={C.white} />
            </Appear>
            {i === 0 &&
              [0, 1, 2, 3, 4].map((j) => {
                const a = -0.6 + j * 0.45;
                return <Arrow key={j} x1={px + Math.cos(a) * 50} y1={py + Math.sin(a) * 50} x2={px + Math.cos(a) * 230} y2={py + Math.sin(a) * 190} k={ramp(t, borrowAt + j * 0.2, 0.6)} color={C.tealDeep} w={5} />;
              })}
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1))} x={Ar.cx} y={160}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.yellow} />
        </Appear>
      )}
      {S(p.note) && (
        <Appear t={t} at={borrowAt + 0.8} x={Ar.cx} y={850}>
          <Label x={0} y={0} text={S(p.note)} size={30} bg={C.tealSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Изобретения: «нужда → изобретение» зачёркнуто; «изобретение → поиск применения» ──
// p.factors — что помогает принять новинку (появляются по репликам p.factorBeat).
export const Invention: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, N(p.flipBeat, 1));
  const f = A(p.factors);
  const fb = at(ctx, N(p.factorBeat, 2));
  const row = (y: number, a: string, b: string, k: number, col: string) => (
    <g opacity={k} transform={`translate(${Ar.cx} ${y})`}>
      <Label x={-280} y={0} text={a} size={36} bg={C.white} />
      <Arrow x1={-110} y1={0} x2={110} y2={0} k={k} color={col} w={8} />
      <Label x={280} y={0} text={b} size={36} bg={C.white} />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {row(230, S(p.a1, "нужда"), S(p.b1, "изобретение"), ramp(t, 0.3, 0.6), C.inkSoft)}
      {ramp(t, b1, 0.5) > 0 && <line x1={Ar.cx - 470} y1={230} x2={Ar.cx - 470 + 940 * ramp(t, b1, 0.6)} y2={230} stroke={C.red} strokeWidth={8} strokeLinecap="round" />}
      {row(400, S(p.a2, "изобретение"), S(p.b2, "поиск применения"), ramp(t, b1 + 0.6, 0.6), C.tealDeep)}
      <Icon name="gear" x={Ar.cx - 560} y={400} s={0.6} k={ramp(t, b1 + 0.8, 0.5)} t={t} />
      {f.map((x, i) => (
        <Appear key={i} t={t} at={fb + i * 0.5} x={Ar.cx + ((i % 2) - 0.5) * 560} y={590 + Math.floor(i / 2) * 110}>
          <Label x={0} y={0} text={x} size={32} bg={[C.tealSoft, C.amberSoft, C.sageSoft, C.plumSoft][i % 4]} />
        </Appear>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2)) + 1.5} x={Ar.cx} y={830}>
          <Label x={0} y={0} text={S(p.caption)} size={30} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Лестница обществ: группа → племя → вождество → государство ──
// p.steps [[name, scale, beat]]; p.focus — выделенная ступень.
export const Ladder: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const steps = (Array.isArray(p.steps) ? p.steps : []) as [string, string, number][];
  const n = steps.length;
  const w = Math.min(1300, Ar.x1 - Ar.x0 - 60);
  const sw = w / n;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {S(p.title) && (
        <Appear t={t} at={0.1} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.title)} size={38} bg={C.yellow} />
        </Appear>
      )}
      {steps.map(([name, scale, beat], i) => {
        const x = Ar.cx - w / 2 + i * sw;
        const h = 110 + i * 110;
        const a = at(ctx, beat);
        const k = ramp(t, a, 0.6);
        const focus = p.focus === undefined || p.focus === i;
        const people = Math.min(40, 3 + i * i * 4);
        return (
          <g key={i} opacity={k * (focus ? 1 : 0.45)} transform={`translate(0 ${(1 - k) * 40})`}>
            <rect x={x + 8} y={760 - h} width={sw - 16} height={h} rx={18} fill={[C.sageSoft, C.tealSoft, C.amberSoft, C.plumSoft][i % 4]} stroke={OL} strokeWidth={4} />
            {Array.from({ length: people }, (_, j) => (
              <circle key={j} cx={x + 30 + rnd(j, i) * (sw - 60)} cy={760 - 25 - rnd(j, i + 9) * (h - 50)} r={7} fill={C.ink} opacity={0.55} />
            ))}
            {i === n - 1 && <Icon name="crown" x={x + sw / 2} y={760 - h - 60} s={0.6} k={ramp(t, a + 0.4, 0.5)} />}
            <Txt x={x + sw / 2} y={808} size={34} weight={900}>
              {name}
            </Txt>
            <Txt x={x + sw / 2} y={852} size={28} weight={800} color={C.inkSoft}>
              {scale}
            </Txt>
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx - w / 4} y={230}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Весы: «общее благо» против «забирают себе» (клептократия), или любые две чаши ──
export const Scales: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const L = A(p.left);
  const R = A(p.right);
  const tilt = (N(p.tilt, 0) * ramp(t, at(ctx, N(p.tiltBeat, 1)), 1.2) + Math.sin(t * 1.2) * 1.2) * (Math.PI / 180);
  const cx = Ar.cx;
  const arm = 360;
  const PY = 270;
  const ly = PY - Math.sin(tilt) * arm;
  const ry = PY + Math.sin(tilt) * arm;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.025}>
      <Appear t={t} at={0.1} x={0} y={0} dy={0}>
        <rect x={cx - 14} y={PY} width={28} height={480} fill={C.steel} stroke={OL} strokeWidth={4} />
        <rect x={cx - 140} y={PY + 470} width={280} height={36} rx={12} fill={C.steel} stroke={OL} strokeWidth={4} />
        <line x1={cx - arm * Math.cos(tilt)} y1={ly} x2={cx + arm * Math.cos(tilt)} y2={ry} stroke={OL} strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx} cy={PY} r={20} fill={C.yellow} stroke={OL} strokeWidth={4} />
      </Appear>
      {[
        { x: cx - arm * Math.cos(tilt), y: ly, items: L, title: S(p.leftTitle), c: C.tealSoft, a: 0.5 },
        { x: cx + arm * Math.cos(tilt), y: ry, items: R, title: S(p.rightTitle), c: C.coralSoft, a: at(ctx, N(p.rightBeat, 1)) },
      ].map((s, i) => (
        <g key={i} opacity={ramp(t, s.a, 0.5)}>
          <line x1={s.x} y1={s.y} x2={s.x - 110} y2={s.y + 170} stroke={OL} strokeWidth={4} />
          <line x1={s.x} y1={s.y} x2={s.x + 110} y2={s.y + 170} stroke={OL} strokeWidth={4} />
          <path d={`M ${s.x - 150} ${s.y + 170} Q ${s.x} ${s.y + 250} ${s.x + 150} ${s.y + 170} Z`} fill={s.c} stroke={OL} strokeWidth={5} />
          <Label x={s.x} y={s.y - 70} text={s.title} size={34} bg={C.white} />
          {s.items.map((it, j) => (
            <Appear key={j} t={t} at={s.a + 0.4 + j * 0.5} x={s.x} y={s.y + 290 + j * 60}>
              <Label x={0} y={0} text={it} size={28} bg={s.c} />
            </Appear>
          ))}
        </g>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Пять регионов: пять карточек-островков; выделенный — крупно с тезисом ──
// p.items [[title, icon, line]]; p.focus — индекс; без focus — все по очереди (p.beats).
export const Regions: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = (Array.isArray(p.items) ? p.items : []) as [string, string, string][];
  const beats = (Array.isArray(p.beats) ? p.beats : items.map((_, i) => i * 0.2)) as number[];
  const n = items.length;
  const focus = typeof p.focus === "number" ? (p.focus as number) : -1;
  const w = Ar.x1 - Ar.x0 - 60;
  const cw = Math.min(340, w / n - 16);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {items.map(([title, icon, line], i) => {
        const isF = i === focus;
        const k = ramp(t, focus >= 0 ? 0.1 + i * 0.08 : at(ctx, beats[i] ?? 0) + 0.1, 0.5);
        const x = Ar.cx + (i - (n - 1) / 2) * (cw + 16);
        const y = focus >= 0 ? 740 : 470;
        const s = focus >= 0 ? 0.5 : 1;
        return (
          <g key={i} opacity={k * (focus >= 0 && !isF ? 0.45 : 1)} transform={`translate(${x} ${y + (1 - k) * 30}) scale(${s})`}>
            <rect x={-cw / 2 + 6} y={-170} width={cw} height={340} rx={36} fill="#24324a" opacity={0.1} />
            <rect x={-cw / 2} y={-178} width={cw} height={340} rx={36} fill={isF ? C.yellow : C.white} stroke={OL} strokeWidth={4} />
            <Icon name={icon} x={0} y={-60} s={0.85} k={1} t={t} />
            <Txt x={0} y={title.includes("\n") ? 64 : 80} size={title.includes("\n") ? 28 : 32} weight={900}>
              {title}
            </Txt>
            {focus < 0 && (
              <Txt x={0} y={title.includes("\n") ? 140 : 124} size={22} weight={800} color={C.inkSoft}>
                {line}
              </Txt>
            )}
          </g>
        );
      })}
      {focus >= 0 && items[focus] && (
        <Appear t={t} at={0.4} x={Ar.cx} y={360}>
          <Panel x={-560} y={-170} w={1120} h={300} fill={C.white} />
          <Icon name={items[focus][1]} x={-430} y={-20} s={1.1} k={1} t={t} />
          <Txt x={-300} y={-60} size={48} anchor="start" weight={900}>
            {items[focus][0].replace("\n", " ")}
          </Txt>
          <Txt x={-300} y={10} size={32} anchor="start" weight={800} color={C.inkSoft}>
            {items[focus][2]}
          </Txt>
        </Appear>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1))} x={Ar.cx} y={focus >= 0 ? 580 : 790}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.tealSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Память: спокойное поле огоньков; «объяснить ≠ оправдать» ──
export const Memorial: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const lights = Array.from({ length: 160 }, (_, i) => ({ x: Ar.x0 + 80 + rnd(i, 1) * (Ar.x1 - Ar.x0 - 160), y: 560 + rnd(i, 2) * 300, a: rnd(i, 3) * 5 }));
  const b1 = at(ctx, N(p.textBeat, 1));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.015}>
      {lights.map((l, i) => {
        const k = ramp(t, 0.3 + l.a * 0.8, 1);
        if (k <= 0) return null;
        return (
          <g key={i} opacity={k}>
            <circle cx={l.x} cy={l.y} r={14} fill={C.yellow} opacity={0.22 + 0.08 * Math.sin(t * 1.5 + i)} />
            <circle cx={l.x} cy={l.y} r={5.5} fill={C.amber} />
          </g>
        );
      })}
      <Appear t={t} at={b1} x={Ar.cx} y={300}>
        <Panel x={-560} y={-130} w={1120} h={A(p.lines).length * 70 + 110} fill={C.white} />
        {A(p.lines).map((l, i) => (
          <Txt key={i} x={0} y={-50 + i * 70} size={48} weight={900} color={i === A(p.lines).length - 1 ? C.tealDeep : C.ink}>
            {l}
          </Txt>
        ))}
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx} y={480}>
          <Label x={0} y={0} text={S(p.caption)} size={28} bg={C.cream} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Раздробленность и единство: много соперничающих центров против одного решения ──
export const Fragment: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const w = (Ar.x1 - Ar.x0 - 80) / 2;
  const lx = Ar.x0 + 20 + w / 2;
  const rx = Ar.x0 + 60 + w * 1.5;
  const b1 = at(ctx, N(p.rightBeat, 1));
  const b2 = at(ctx, N(p.offBeat, 2));
  const cells = Array.from({ length: 9 }, (_, i) => ({ x: lx + ((i % 3) - 1) * 150 + (rnd(i, 1) - 0.5) * 30, y: 520 + (Math.floor(i / 3) - 1) * 150 + (rnd(i, 2) - 0.5) * 30 }));
  const off = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <Appear t={t} at={0.2} x={lx} y={220}>
        <Label x={0} y={0} text={S(p.leftTitle, "много центров")} size={34} bg={C.white} />
      </Appear>
      {cells.map((c, i) => (
        <g key={i} opacity={ramp(t, 0.4 + i * 0.1, 0.4)}>
          <circle cx={c.x} cy={c.y} r={54} fill={[C.tealSoft, C.amberSoft, C.sageSoft][i % 3]} stroke={OL} strokeWidth={4} />
          <circle cx={c.x} cy={c.y} r={12} fill={i === 4 ? C.yellow : C.ink} opacity={i === 4 ? 1 : 0.5} />
        </g>
      ))}
      {/* идея «перепрыгивает» к соседям, если один центр отказался */}
      {[0, 2, 6, 8].map((j, i) => (
        <Arrow key={j} x1={cells[4].x} y1={cells[4].y} x2={cells[j].x + (cells[4].x - cells[j].x) * 0.35} y2={cells[j].y + (cells[4].y - cells[j].y) * 0.35} k={ramp(t, b2 + 0.4 + i * 0.2, 0.5)} color={C.tealDeep} w={6} />
      ))}
      <Appear t={t} at={b1} x={rx} y={220}>
        <Label x={0} y={0} text={S(p.rightTitle, "один центр")} size={34} bg={C.white} />
      </Appear>
      <g opacity={ramp(t, b1, 0.5)}>
        <rect x={rx - 220} y={360} width={440} height={320} rx={50} fill={C.plumSoft} stroke={OL} strokeWidth={5} />
        <circle cx={rx} cy={520} r={30} fill={off > 0.5 ? C.steelSoft : C.yellow} stroke={OL} strokeWidth={4} />
        {/* «рубильник» одного решения */}
        <g transform={`translate(${rx + 140} 600)`}>
          <rect x={-40} y={-60} width={80} height={120} rx={16} fill={C.white} stroke={OL} strokeWidth={4} />
          <line x1={0} y1={0} x2={Math.sin((off * 2 - 1) * 0.8) * 46} y2={-Math.cos((off * 2 - 1) * 0.8) * 46} stroke={OL} strokeWidth={9} strokeLinecap="round" />
        </g>
      </g>
      <Appear t={t} at={b2 + 0.6} x={rx} y={760}>
        <Label x={0} y={0} text={S(p.rightNote, "одно решение — для всех")} size={28} bg={C.coralSoft} />
      </Appear>
      <Appear t={t} at={b2 + 1.2} x={lx} y={800}>
        <Label x={0} y={0} text={S(p.leftNote, "отказ одного — не конец идеи")} size={28} bg={C.tealSoft} />
      </Appear>
    </Drift>
  );
};

// ── Финальная линза: банан убирает слово «ПРЕДРЕШЕНО», остаётся вопрос ──
export const LensEnd: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const word = S(p.word, "ПРЕДРЕШЕНО");
  const b1 = at(ctx, N(p.removeBeat, 1));
  const b2 = at(ctx, N(p.qBeat, 2));
  const rm = ramp(t, b1, 1.2);
  const lensX = Ar.cx - 420 + rm * 840;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
      <g opacity={(1 - ramp(t, b1 + 1.2, 0.6)) * ramp(t, 0.2, 0.5)}>
        <text x={Ar.cx} y={500} fontFamily={HEAVY} fontWeight={900} fontSize={130} fill={C.ink} textAnchor="middle" opacity={1 - rm * 0.6}>
          {word}
        </text>
        {rm > 0 && <line x1={Ar.cx - 430} y1={460} x2={Ar.cx - 430 + 860 * rm} y2={460} stroke={C.red} strokeWidth={14} strokeLinecap="round" />}
      </g>
      <Lens x={lensX} y={460} r={120} k={ramp(t, b1 - 0.4, 0.5) * (1 - ramp(t, b2 + 1, 0.6))} glow={0.8} color={C.teal} />
      <Appear t={t} at={b2} x={Ar.cx} y={400}>
        <Panel x={-600} y={-150} w={1200} h={A(p.question).length * 76 + 130} fill={C.white} />
        {A(p.question).map((l, i) => (
          <Txt key={i} x={0} y={-60 + i * 76} size={60} weight={900} color={i === A(p.question).length - 1 ? C.tealDeep : C.ink}>
            {l}
          </Txt>
        ))}
      </Appear>
      {p.brand === true && (
        <Appear t={t} at={at(ctx, N(p.brandBeat, 2)) + 1} x={Ar.cx} y={730}>
          <text fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={C.ink} textAnchor="middle">
            {BRAND.name}
          </text>
          <Txt x={0} y={64} size={34} color={C.inkSoft} weight={800}>
            {BRAND.slogan}
          </Txt>
        </Appear>
      )}
    </Drift>
  );
};

// ── Пометка «верно / неверно» к двум утверждениям (что книга утверждает и что нет) ──
export const Verdict: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rows = (Array.isArray(p.rows) ? p.rows : []) as [string, "yes" | "no" | "q", number][];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.yellow} />
        </Appear>
      )}
      {rows.map(([text, mark, beat], i) => {
        const a = at(ctx, beat) + 0.2;
        const y = 290 + i * 140;
        const w = Math.min(1150, Ar.x1 - Ar.x0 - 60);
        const col = mark === "yes" ? C.green : mark === "no" ? C.red : C.plum;
        return (
          <Appear key={i} t={t} at={a} x={Ar.cx - w / 2} y={y}>
            <Panel x={0} y={-56} w={w} h={112} r={28} fill={C.white} />
            <circle cx={64} cy={0} r={36} fill={mark === "yes" ? "#d6efdc" : mark === "no" ? C.coralSoft : C.plumSoft} stroke={col} strokeWidth={4} />
            {mark === "yes" && <Check x={64} y={2} s={34} k={ramp(t, a + 0.3, 0.4)} />}
            {mark === "no" && <Cross x={64} y={0} s={40} k={ramp(t, a + 0.3, 0.4)} />}
            {mark === "q" && (
              <text x={64} y={14} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={col} textAnchor="middle">
                ?
              </text>
            )}
            <Txt x={124} y={12} size={34} anchor="start" weight={800}>
              {text}
            </Txt>
          </Appear>
        );
      })}
    </Drift>
  );
};

export { House, Lens, FONT };

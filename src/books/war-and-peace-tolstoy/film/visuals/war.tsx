// Слой 2 — война: аккуратный план против тумана поля, приказ, который опаздывает,
// небо Аустерлица, батарея на кургане, совет в избе, пустой «улей» Москвы, пожар города
// без хозяев, подводы для раненых. Всё — художественная реконструкция BanaMind, не военные
// схемы сражений: позиции условны, без крови и натурализма.
import React from "react";
import { interpolate } from "remotion";
import { rnd } from "../components/Background";
import { C, COND, SERIF } from "../theme";
import { Card, cxOf, dotsCloud, ink, Label, type P } from "./common";
import { NameTag, Person } from "./figures";
import { Arrow, at, clamp01, Cross, pop, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

// ── диспозиция на бумаге против поля в тумане ──
export const Plan: React.FC<VisualProps<P & { title?: string; lines?: string[] }>> = (c) => {
  const { t, p } = c;
  const fog = ramp(t, at(c, 1), 2);
  const drift = fog * 1;
  const cols = [C.skyDeep, C.skyDeep, C.skyDeep, C.red, C.red];
  return (
    <g>
      {/* левая половина: бумага плана */}
      <g transform="translate(120 140)">
        <Card x={0} y={0} w={760} h={700} fill="#fffaf0" />
        <Txt x={380} y={70} size={34} weight={900} color={C.inkSoft}>
          {p.title ?? "ПЛАН"}
        </Txt>
        {(p.lines ?? ["первая колонна марширует…", "вторая колонна марширует…", "третья колонна марширует…"]).map((l, i) => (
          <text key={i} x={60} y={160 + i * 64} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={34} fill={C.ink} opacity={ramp(t, 0.3 + i * 0.3)}>
            {l}
          </text>
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={100} y1={420 + i * 80} x2={640} y2={420 + i * 80 - 30} k={ramp(t, 0.6 + i * 0.3, 0.8)} color={C.skyDeep} w={10} />
        ))}
      </g>
      {/* правая половина: поле */}
      <g transform="translate(1000 140)">
        <defs>
          <clipPath id="fieldClip">
            <rect x={0} y={0} width={800} height={700} rx={28} />
          </clipPath>
        </defs>
        <Card x={0} y={0} w={800} h={700} fill="#dfe8d8" />
        <g clipPath="url(#fieldClip)">
        {[0, 1, 2, 3, 4].map((i) => {
          const sx = 80 + i * 20;
          const sy = 180 + i * 100;
          const wob1 = Math.sin(t * 0.9 + i * 1.7) * 120 * drift;
          return <Arrow key={i} x1={sx} y1={sy} x2={sx + 520 + wob1 * 0.5} y2={sy - 40 + wob1} k={ramp(t, at(c, 0.4) + i * 0.2, 1)} color={cols[i]} w={9} bend={0.15 * Math.sin(i + t * 0.3) * drift} />;
        })}
        {/* туман: чёткие белые овалы, без размытия */}
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx={((i * 160 + t * 26) % 960) - 80} cy={160 + (i % 4) * 140} rx={170} ry={60} fill="#ffffff" opacity={0.8 * fog} />
        ))}
        </g>
        <Txt x={400} y={660} size={34} weight={900} color={C.inkSoft} opacity={fog}>
          ПОЛЕ: туман, дым, неизвестность
        </Txt>
      </g>
    </g>
  );
};

// ── приказ идёт к полю, а положение уже изменилось ──
export const Courier: React.FC<VisualProps<P & { from?: string; to?: string; note?: string }>> = (c) => {
  const { t, p } = c;
  const ride = ramp(t, at(c, 0.3), Math.max(2.5, at(c, 1.5) - at(c, 0.3)));
  const change = ramp(t, at(c, 1), 1.5);
  const x = 300 + ride * 1180;
  return (
    <g>
      <line x1={300} y1={720} x2={1500} y2={720} stroke={C.steel} strokeWidth={6} strokeDasharray="20 16" />
      <g transform="translate(260 600)">
        <rect x={-100} y={-90} width={200} height={130} rx={18} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <Txt x={0} y={-10} size={32} weight={900}>
          {p.from ?? "ставка"}
        </Txt>
      </g>
      {/* всадник-конверт */}
      <g transform={`translate(${x} ${690 + Math.abs(Math.sin(t * 9)) * -14})`}>
        <ellipse cx={0} cy={0} rx={60} ry={30} fill="#7a5a3a" stroke={C.ink} strokeWidth={4} />
        <rect x={-24} y={-70} width={48} height={60} rx={10} fill="#2a3150" />
        <rect x={10} y={-110} width={70} height={46} rx={6} fill="#fffaf0" stroke={C.ink} strokeWidth={4} />
        <path d="M 10 -110 L 45 -86 L 80 -110" stroke={C.ink} strokeWidth={3} fill="none" />
      </g>
      {/* поле: точки двигаются, пока едет приказ */}
      <g transform="translate(1560 560)">
        <rect x={-200} y={-260} width={400} height={360} rx={24} fill="#dfe8d8" stroke={C.ink} strokeWidth={5} />
        {dotsCloud(40, 0, -80, 160, 140, 41).map((d, i) => (
          <circle key={i} cx={d.x + Math.sin(i + t) * 50 * change} cy={d.y + Math.cos(i * 2 + t * 0.7) * 40 * change} r={d.r * 0.9} fill={d.c} stroke={C.ink} strokeWidth={1.5} />
        ))}
        <Txt x={0} y={60} size={30} weight={900}>
          {p.to ?? "поле"}
        </Txt>
      </g>
      {p.note && (
        <Pop t={t} at={at(c, 1.4)} x={960} y={230}>
          <Label x={0} y={0} text={p.note} size={36} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

// ── небо Аустерлица: огромное небо, лежащий человек, маленький «великий» над ним ──
export const Sky: React.FC<VisualProps<P & { small?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const open = ramp(t, 0.2, 2.5);
  const nap = p.small ? ramp(t, at(c, 1), 1) : 0;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#bcdcf2" opacity={0.85 * open} />
      <rect x={0} y={0} width={1920} height={500} fill="#8ec4ea" opacity={0.7 * open} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={((i * 430 + t * (12 + i * 3)) % 2300) - 200} cy={120 + (i % 3) * 110} rx={200 + i * 30} ry={46 + (i % 2) * 14} fill="#fff" opacity={0.95 * open} />
      ))}
      <path d="M 0 860 Q 600 780 1920 870 L 1920 1080 L 0 1080 Z" fill="#c7d6a8" />
      <Person who="andrei" x={cx - 140} y={880} s={0.9} t={0} lie label="князь Андрей" />
      {/* знамя рядом */}
      <line x1={cx - 420} y1={890} x2={cx - 240} y2={760} stroke={C.ink} strokeWidth={6} />
      <path d={`M ${cx - 240} 760 l 70 30 l -60 30 Z`} fill={C.red} />
      {nap > 0 && (
        <g opacity={nap}>
          <Person who="napoleon" x={cx + 320} y={880} s={0.55} t={t} arm="coat" />
          <NameTag x={cx + 320} y={920} text="Наполеон" s={0.8} />
          <Label x={cx + 320} y={640} text="«маленький, ничтожный»" size={30} bg="#fff" />
        </g>
      )}
      <Pop t={t} at={at(c, 0.4)} x={cx} y={460}>
        <Label x={0} y={0} text="высокое небо" size={44} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── курган с батареей: штатский в белой шляпе среди солдат, дым, ядра-точки ──
export const Battery: React.FC<VisualProps<P & { note?: string; hero?: "pierre" | "tushin" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const smoke = ramp(t, at(c, 0.6), 1.5);
  return (
    <g>
      <path d={`M ${cx - 700} 900 Q ${cx} 480 ${cx + 700} 900 Z`} fill="#b9c79a" stroke={C.ink} strokeWidth={5} />
      {[-260, -80, 100, 280].map((x, i) => (
        <g key={i} transform={`translate(${cx + x} ${640 - Math.cos(x / 400) * 40})`}>
          <rect x={-60} y={-20} width={120} height={30} rx={14} fill="#3a3f55" transform={`rotate(-12)`} />
          <circle cx={-30} cy={18} r={20} fill="#7a5a3a" stroke={C.ink} strokeWidth={3} />
          {smoke > 0 && <circle cx={70 + ((t * 40 + i * 30) % 120)} cy={-40 - ((t * 30 + i * 20) % 80)} r={30 + ((t * 20 + i * 15) % 30)} fill="#fff" stroke="#c9d6e3" strokeWidth={2} opacity={smoke * 0.85} />}
        </g>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Person key={i} who="soldier" x={cx - 500 + i * 200} y={860 - Math.sin((i / 5) * Math.PI) * 120} s={0.5} t={t} />
      ))}
      {p.hero === "tushin" ? (
        <g>
          {/* маленький капитан без сапог у орудия */}
          <Person who="soldier" x={cx + 40} y={600} s={0.62} t={t} arm="point" label="капитан Тушин" labelColor={C.gold} glow={0.6} />
          <g opacity={ramp(t, at(c, 1), 1)}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${cx - 560 + i * 60} 520 q ${wob(t * 3, i, 10)} -70 20 -120 q 20 50 20 120 Z`} fill={i % 2 ? C.gold : C.ember} stroke={C.ink} strokeWidth={2} />
            ))}
            <Label x={cx - 500} y={360} text="деревня горит" size={28} bg="#fff" />
          </g>
        </g>
      ) : (
        <g>
          {/* белая шляпа штатского */}
          <Person who="pierre" x={cx + 40} y={600} s={0.7} t={t} label="Пьер" />
          <ellipse cx={cx + 40} cy={600 - 312 * 0.7 - 6} rx={34} ry={10} fill="#fff" stroke={C.ink} strokeWidth={3} />
          <rect x={cx + 22} y={600 - 312 * 0.7 - 30} width={36} height={24} rx={6} fill="#fff" stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      <Pop t={t} at={at(c, 1)} x={cx} y={250}>
        <Label x={0} y={0} text={p.note ?? "изнутри битва не похожа на схему"} size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── шахматы и поле: фигуры превращаются в людей-точки ──
export const Chess: React.FC<VisualProps<P & { label?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const melt = ramp(t, at(c, 1), 2);
  return (
    <g>
      <g transform={`translate(${cx} 520) skewX(-14) scale(1 0.62)`}>
        {Array.from({ length: 64 }).map((_, i) => (
          <rect key={i} x={-400 + (i % 8) * 100} y={-400 + Math.floor(i / 8) * 100} width={100} height={100} fill={(i + Math.floor(i / 8)) % 2 ? "#e9dcc0" : "#7a5a3a"} opacity={1 - melt * 0.6} />
        ))}
      </g>
      {Array.from({ length: 16 }).map((_, i) => {
        const x0 = cx - 340 + (i % 8) * 96;
        const y0 = 400 + Math.floor(i / 8) * 200;
        const d = dotsCloud(16, cx, 560, 700, 280, 51)[i];
        const x = interpolate(melt, [0, 1], [x0, d.x]);
        const y = interpolate(melt, [0, 1], [y0, d.y]);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g opacity={1 - melt}>
              <path d="M -22 30 L 22 30 L 14 -10 Q 0 -40 -14 -10 Z" fill={i < 8 ? "#fff" : C.ink} stroke={C.ink} strokeWidth={3} />
              <circle cy={-30} r={13} fill={i < 8 ? "#fff" : C.ink} stroke={C.ink} strokeWidth={3} />
            </g>
            {melt > 0 && Array.from({ length: 5 }).map((_, j) => <circle key={j} cx={Math.cos(j * 1.3 + t) * 26 * melt} cy={Math.sin(j * 1.7 + t) * 22 * melt} r={8} fill={C.dots[(i + j) % 8]} opacity={melt} />)}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.3)} x={cx} y={150}>
        <Label x={0} y={0} text={p.label ?? "война подобна шахматам?"} size={38} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── совет в избе: стол с картой, ребёнок с печи видит спор двух людей ──
export const Council: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const decide = ramp(t, at(c, 1.5), 0.8);
  return (
    <g>
      <rect x={cx - 720} y={160} width={1440} height={740} fill="#e9d6b0" stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={cx - 720} y1={200 + i * 80} x2={cx + 720} y2={200 + i * 80} stroke="#b08a5a" strokeWidth={4} />
      ))}
      {/* печь и ребёнок */}
      <rect x={cx - 700} y={360} width={300} height={540} fill="#f4efe6" stroke={C.ink} strokeWidth={5} />
      <Person who="child" x={cx - 560} y={360} s={0.7} t={t} />
      <g transform={`translate(${cx - 470} 300)`}>
        <ellipse rx={18} ry={10} fill="#fff" stroke={C.ink} strokeWidth={3} />
        <circle r={5} fill={C.ink} cx={Math.sin(t) * 6} />
      </g>
      {/* стол */}
      <rect x={cx - 280} y={620} width={800} height={36} rx={8} fill="#8a6a4a" stroke={C.ink} strokeWidth={4} />
      <rect x={cx - 220} y={590} width={600} height={40} rx={4} fill="#e3edf7" stroke={C.steel} strokeWidth={3} />
      <Person who="kutuzov" x={cx - 140} y={860} s={0.85} t={t} label="Кутузов" />
      {[0, 1, 2, 3].map((i) => (
        <Person key={i} who={i === 3 ? "man" : "soldier"} x={cx + 120 + i * 120} y={860} s={0.72} t={t} flip arm={i === 1 ? "point" : "down"} />
      ))}
      {decide > 0 && (
        <g opacity={decide}>
          <Label x={cx + 100} y={250} text="решение: оставить Москву" size={36} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── Москва как пустой улей: пчёлы-точки улетают, соты пустеют ──
export const Hive: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const leave = ramp(t, at(c, 0.6), 3);
  const cells = Array.from({ length: 37 }).map((_, i) => {
    const r = i === 0 ? 0 : i < 7 ? 1 : i < 19 ? 2 : 3;
    const k = i === 0 ? 0 : i < 7 ? i - 1 : i < 19 ? i - 7 : i - 19;
    const n = r === 0 ? 1 : r * 6;
    const a = (k / n) * Math.PI * 2;
    return { x: Math.cos(a) * r * 92, y: Math.sin(a) * r * 92, i };
  });
  return (
    <g>
      <g transform={`translate(${cx - 200} 520)`}>
        {cells.map((cl) => {
          const full = 1 - clamp01(leave * 1.4 - rnd(cl.i, 61) * 0.6);
          return <path key={cl.i} d="M 0 -48 L 42 -24 L 42 24 L 0 48 L -42 24 L -42 -24 Z" transform={`translate(${cl.x} ${cl.y})`} fill={interpolate(full, [0, 1], [0, 1]) > 0.5 ? C.gold : "#f6ecd2"} stroke={C.goldDeep} strokeWidth={5} />;
        })}
      </g>
      {Array.from({ length: 40 }).map((_, i) => {
        const k = clamp01(leave * 1.3 - rnd(i, 62) * 0.5);
        const x = cx - 200 + Math.cos(i) * 200 + k * (700 + rnd(i, 63) * 500);
        const y = 520 + Math.sin(i * 1.3) * 200 - k * (200 + rnd(i, 64) * 300) + Math.sin(t * 8 + i) * 6;
        return k > 0 ? (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx={14} ry={10} fill={C.gold} stroke={C.ink} strokeWidth={3} />
            <ellipse cx={-4} cy={-12} rx={9} ry={6} fill="#fff" stroke={C.ink} strokeWidth={2} opacity={0.8} />
          </g>
        ) : null;
      })}
      <Pop t={t} at={at(c, 1.2)} x={cx + 380} y={860}>
        <Label x={0} y={0} text="город без хозяев" size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── пожар: деревянный город, где некому тушить ──
export const Fire: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const burn = ramp(t, at(c, 0.8), 3);
  return (
    <g>
      {Array.from({ length: 11 }).map((_, i) => {
        const x = cx - 760 + i * 140;
        const h = 140 + (i % 3) * 50;
        const lit = clamp01(burn * 1.6 - rnd(i, 71) * 0.7);
        return (
          <g key={i}>
            <rect x={x} y={860 - h} width={120} height={h} fill="#c9a06a" stroke={C.ink} strokeWidth={4} />
            <path d={`M ${x - 10} ${860 - h} L ${x + 60} ${860 - h - 70} L ${x + 130} ${860 - h} Z`} fill="#8a5a3a" stroke={C.ink} strokeWidth={4} />
            <rect x={x + 40} y={860 - h + 40} width={40} height={40} fill={lit > 0.3 ? C.ember : "#4a5276"} />
            {lit > 0 &&
              [0, 1, 2].map((j) => (
                <path key={j} d={`M ${x + 20 + j * 40} ${860 - h - 30} q ${wob(t * 3, i + j, 10)} ${-60 * lit} 20 ${-110 * lit} q 20 60 20 ${110 * lit} Z`} fill={j % 2 ? C.gold : C.ember} stroke={C.ink} strokeWidth={2} />
              ))}
          </g>
        );
      })}
      <rect x={0} y={860} width={1920} height={60} fill="#8a7a5a" />
      <Pop t={t} at={at(c, 0.3)} x={cx} y={200}>
        <Label x={0} y={0} text="деревянный город, в котором некому тушить" size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── подводы: вещи или раненые ──
export const Carts: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const swap = ramp(t, at(c, 1), 2);
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const x = cx - 520 + i * 420;
        return (
          <g key={i}>
            <rect x={x - 150} y={650} width={300} height={90} rx={10} fill="#a07a4a" stroke={C.ink} strokeWidth={5} />
            <circle cx={x - 90} cy={760} r={40} fill="#fff" stroke={C.ink} strokeWidth={6} />
            <circle cx={x + 90} cy={760} r={40} fill="#fff" stroke={C.ink} strokeWidth={6} />
            {/* сундуки уезжают вниз */}
            <g opacity={1 - swap} transform={`translate(0 ${swap * 200})`}>
              <rect x={x - 120} y={560} width={110} height={90} rx={8} fill="#c97a3a" stroke={C.ink} strokeWidth={4} />
              <rect x={x + 10} y={580} width={100} height={70} rx={8} fill="#7a5a9a" stroke={C.ink} strokeWidth={4} />
              <rect x={x - 60} y={500} width={90} height={60} rx={8} fill="#5a8a6a" stroke={C.ink} strokeWidth={4} />
            </g>
            {/* раненые садятся */}
            <g opacity={swap}>
              <Person who="soldier" x={x - 50} y={660} s={0.42} t={t} />
              <Person who="soldier" x={x + 50} y={660} s={0.42} t={t} arm="out" />
            </g>
          </g>
        );
      })}
      <Person who="natasha" x={cx + 720} y={860} s={0.95} t={t} arm="point" flip label="Наташа" />
      <Pop t={t} at={at(c, 1.4)} x={cx} y={250}>
        <Label x={0} y={0} text="подводы — раненым" size={38} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── дубина народной войны: фехтовальщик по правилам и тот, кто правила отбросил ──
export const Club: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const swing = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <Person who="napoleon" x={cx - 300} y={860} s={1} t={t} arm="point" label="по правилам" />
      <line x1={cx - 230} y1={600} x2={cx - 30} y2={560} stroke="#c9d6e3" strokeWidth={8} strokeLinecap="round" />
      <g transform={`translate(${cx + 300} 860)`}>
        <Person who="peasant" x={0} y={0} s={1.05} t={t} flip label="без правил" />
        <g transform={`translate(-40 -230) rotate(${-60 + swing * 100})`}>
          <path d="M 0 0 L -10 -260 Q 0 -300 20 -260 L 14 0 Z" fill="#8a5a3a" stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
      <Pop t={t} at={at(c, 0.4)} x={cx} y={200}>
        <Label x={0} y={0} text="«дубина народной войны»" size={40} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── отступление: дорога, снег, колонны точек тают ──
export const Retreat: React.FC<VisualProps<P & { title?: string; armies?: boolean; prisoners?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = ramp(t, 0.2, Math.max(2, at(c, 1.5)));
  return (
    <g>
      <path d={`M 0 760 Q ${cx} 640 1920 700`} stroke="#d8c4a0" strokeWidth={90} fill="none" />
      {Array.from({ length: 120 }).map((_, i) => {
        const gone = rnd(i, 81) < k * 0.7;
        const x = ((i * 31 + t * 50) % 2000) - 40;
        const y = 720 - Math.sin((x / 1920) * Math.PI) * 60 + (rnd(i, 82) - 0.5) * 60;
        return gone ? null : <circle key={i} cx={x} cy={y} r={8} fill={C.dots[i % 8]} stroke={C.ink} strokeWidth={1.5} />;
      })}
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={`s${i}`} cx={rnd(i, 83) * 1920} cy={(rnd(i, 84) * 1080 + t * 60) % 1080} r={4} fill="#fff" stroke="#c9d6e3" strokeWidth={1} />
      ))}
      {p.armies && (
        <g>
          <Arrow x1={cx - 700} y1={330} x2={cx + 80} y2={420} k={ramp(t, at(c, 0.3), 2)} color={C.skyDeep} w={14} bend={0.1} />
          <Arrow x1={cx - 700} y1={560} x2={cx + 40} y2={500} k={ramp(t, at(c, 0.5), 2)} color={C.violet} w={14} bend={-0.1} />
          <Pop t={t} at={at(c, 0.4)} x={cx - 520} y={300}>
            <Label x={0} y={0} text="1-я армия" size={28} bg="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 0.6)} x={cx - 520} y={610}>
            <Label x={0} y={0} text="2-я армия" size={28} bg="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 1.3)} x={cx + 260} y={460}>
            <Label x={0} y={0} text="не могут соединиться" size={30} bg={C.goldLight} />
          </Pop>
        </g>
      )}
      {p.prisoners && (
        <g>
          <path d={`M ${cx + 520} 720 L ${cx + 520} 420 M ${cx + 520} 520 l 60 -50 M ${cx + 520} 580 l -50 -40`} stroke="#f4f1ea" strokeWidth={22} strokeLinecap="round" />
          <path d={`M ${cx + 520} 720 L ${cx + 520} 420`} stroke={C.ink} strokeWidth={4} strokeDasharray="10 30" />
          <Person who="karataev" x={cx + 470} y={730} s={0.6} t={t} label="Каратаев" />
          <Person who="pierre" x={cx - 120 + ramp(t, 0, Math.max(3, c.dur)) * 200} y={740} s={0.66} t={t} label="Пьер" />
          {[0, 1, 2, 3].map((i) => (
            <Person key={i} who="peasant" x={cx - 520 + i * 120 + ramp(t, 0, Math.max(3, c.dur)) * 200} y={745} s={0.55} t={t} />
          ))}
        </g>
      )}
      {p.title && (
        <Pop t={t} at={0.4} x={cx} y={220}>
          <Label x={0} y={0} text={p.title} size={38} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

// ── карта Европы условно: стрелы 1805 и 1812 ──
export const Campaign: React.FC<VisualProps<P & { year: string; arrows: { from: [number, number]; to: [number, number]; c?: string }[]; places: { x: number; y: number; t: string }[] }>> = (c) => {
  const { t, p } = c;
  return (
    <g>
      <g transform="translate(160 140)">
        <Card x={0} y={0} w={1600} h={760} fill="#eef3f8" stroke={C.steel} />
        <path d="M 80 520 Q 300 400 520 470 T 980 420 T 1500 380" stroke="#9fc0de" strokeWidth={16} fill="none" opacity={0.6} />
        <text x={60} y={90} fontFamily={COND} fontWeight={700} fontSize={64} fill={C.inkSoft}>
          {p.year}
        </text>
        <Txt x={1540} y={730} size={22} anchor="end" weight={800} color={C.inkSoft}>
          условная схема, не военная карта
        </Txt>
        {p.places.map((pl, i) => (
          <Pop key={i} t={t} at={0.3 + i * 0.2} x={pl.x} y={pl.y}>
            <g>
              <circle r={14} fill={C.ink} />
              <Txt x={0} y={-26} size={30} weight={900}>
                {pl.t}
              </Txt>
            </g>
          </Pop>
        ))}
        {p.arrows.map((a, i) => (
          <Arrow key={i} x1={a.from[0]} y1={a.from[1]} x2={a.to[0]} y2={a.to[1]} k={ramp(t, at(c, Math.min(0.4 + i * 0.6, c.beats.length - 0.2)), 1.4)} color={a.c ?? C.red} w={14} bend={0.12} />
        ))}
      </g>
    </g>
  );
};

export { Cross, ink, pop };

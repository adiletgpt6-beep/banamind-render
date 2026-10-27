// Общие схемы «Масштаба выбора»: три слоя карты, большая стрела полководца и её распад
// на сеть точек, карточки актов, цитаты, сравнения, хронология, выводы, финальная заставка.
// Всё — авторские схемы BanaMind (художественная реконструкция), не карты сражений.
import React from "react";
import { interpolate } from "remotion";
import { BRAND } from "../../../../banamind/brand";
import { rnd } from "../components/Background";
import { C, DISPLAY, FONT, HEAVY, LAYERS, SERIF } from "../theme";
import type { LayerId } from "../types";
import { NameTag, Person, type Who } from "./figures";
import { Arrow, at, Check, clamp01, Cross, pop, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

export type P = { host?: string; layer?: LayerId; [k: string]: unknown };

// центр свободной части кадра (банан стоит слева/справа)
export const cxOf = (p: P) => (p.host === "left" ? 1080 : p.host === "right" ? 820 : 960);
export const dark = (p: P) => p.layer === "l3";
export const ink = (p: P) => (dark(p) ? "#ffffff" : C.ink);
export const inkSoft = (p: P) => (dark(p) ? "#c9d1f5" : C.inkSoft);

export const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number }> = ({ x, y, w, h, fill = "#fffdf7", stroke = C.ink, r = 28 }) => (
  <g>
    <rect x={x + 8} y={y + 12} width={w} height={h} rx={r} fill="#000" opacity={0.12} />
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={5} />
  </g>
);

export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; stroke?: string }> = ({ x, y, text, size = 34, bg = C.goldLight, color = C.ink, stroke = C.ink }) => {
  const w = text.length * size * 0.54 + size * 1.3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill={bg} stroke={stroke} strokeWidth={3} />
      <Txt x={0} y={size * 0.12} size={size} color={color} weight={900}>
        {text}
      </Txt>
    </g>
  );
};

// ── точки-решения: плотное облако ярких чётких точек вокруг формы ──
export const dotsCloud = (n: number, cx: number, cy: number, rx: number, ry: number, salt = 0) =>
  Array.from({ length: n }).map((_, i) => {
    const a = rnd(i, salt) * Math.PI * 2;
    const r = Math.sqrt(rnd(i, salt + 1));
    return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r, c: C.dots[i % C.dots.length], r: 6 + Math.floor(rnd(i, salt + 2) * 5), d: rnd(i, salt + 3) };
  });

// ── три слоя карты в изометрии: подпись, содержимое каждого слоя ──
export const Layers: React.FC<VisualProps<P & { focus?: number; labels?: boolean; build?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const focus = p.focus ?? 0;
  const plane = (i: number) => {
    const k = p.build ? pop(t, at(c, i * 0.5)) : pop(t, 0.1 + i * 0.25);
    const y = 760 - i * 230 - (1 - k) * 80;
    const on = focus === i + 1 || focus === 0;
    const L = LAYERS[i];
    const fill = i === 0 ? "#fbf1dc" : i === 1 ? "#e3edf7" : "#1c2456";
    return (
      <g key={i} opacity={clamp01(k) * (on ? 1 : 0.42)} transform={`translate(${cx} ${y})`}>
        <path d="M -520 0 L 0 -150 L 520 0 L 0 150 Z" fill={fill} stroke={L.color} strokeWidth={on && focus ? 9 : 5} strokeLinejoin="round" />
        {/* содержимое слоя */}
        {i === 0 && (
          <g transform="scale(1 0.5)">
            {(["natasha", "pierre", "andrei", "marya", "nikolai"] as Who[]).map((w, j) => (
              <Person key={w} who={w} x={-260 + j * 130} y={60 + (j % 2) * 40} s={0.42} t={t} light={false} />
            ))}
          </g>
        )}
        {i === 1 && (
          <g>
            <path d="M -380 30 C -200 -60 -40 60 120 -30 S 330 -40 400 10" stroke={C.steel} strokeWidth={6} fill="none" strokeDasharray="18 12" />
            {[-260, -60, 160, 330].map((x, j) => (
              <path key={j} d={`M ${x} ${-10 + (j % 2) * 30} l 34 -22 l 0 44 Z`} fill={j % 2 ? C.red : C.skyDeep} transform={`rotate(${wob(t, j, 3)} ${x} 0)`} />
            ))}
          </g>
        )}
        {i === 2 &&
          dotsCloud(70, 0, 0, 420, 115, 7).map((d, j) => (
            <circle key={j} cx={d.x + Math.sin(t + j) * 3} cy={d.y} r={d.r * 0.8} fill={d.c} />
          ))}
        {p.labels !== false && (
          <g transform="translate(560 -10)">
            <rect x={0} y={-30} width={L.label.length * 21 + 120} height={60} rx={30} fill="#fff" stroke={L.color} strokeWidth={5} />
            <Txt x={20} y={12} size={30} anchor="start" color={L.color} weight={900}>
              {`${L.n}`}
            </Txt>
            <Txt x={56} y={12} size={30} anchor="start" weight={900}>
              {L.label}
            </Txt>
          </g>
        )}
      </g>
    );
  };
  return <g>{[0, 1, 2].map(plane)}</g>;
};

// ── большая стрела «гения» распадается на тысячи маленьких стрелок/точек ──
export const BigArrow: React.FC<VisualProps<P & { label?: string; split?: number; caption?: string; tag?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const grow = ramp(t, 0.2, 1.4);
  const splitAt = at(c, p.split ?? 1);
  const s = ramp(t, splitAt, 2.4);
  const n = 160;
  const pts = dotsCloud(n, cx, 520, 640, 250, 11);
  return (
    <g>
      {/* большая стрела */}
      <g opacity={1 - s} transform={`translate(${cx - 620} 520)`}>
        <path d={`M 0 -50 L ${1080 * grow} -50 L ${1080 * grow} -120 L ${1080 * grow + 170} 0 L ${1080 * grow} 120 L ${1080 * grow} 50 L 0 50 Z`} fill={C.red} stroke={C.ink} strokeWidth={6} />
        {p.label && (
          <Txt x={480} y={14} size={46} color="#fff" weight={900}>
            {p.label}
          </Txt>
        )}
      </g>
      {/* тысячи маленьких стрелок */}
      {s > 0 &&
        pts.map((d, i) => {
          const k = clamp01(s * 1.6 - d.d * 0.6);
          const sx = cx - 620 + (i / n) * 1080;
          const x = sx + (d.x - sx) * k + Math.sin(t * 1.2 + i) * 4 * k;
          const y = 520 + (d.y - 520) * k;
          const ang = Math.sin(i * 1.7 + t * 0.4) * 50;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${ang})`} opacity={0.4 + 0.6 * k}>
              <circle r={d.r} fill={d.c} />
              {i % 3 === 0 && k > 0.5 && <path d={`M ${d.r + 3} 0 l 14 0 m -6 -6 l 6 6 l -6 6`} stroke={d.c} strokeWidth={4} fill="none" strokeLinecap="round" />}
            </g>
          );
        })}
      {p.tag && (
        <Pop t={t} at={at(c, 0.4)} x={cx} y={190}>
          <Label x={0} y={0} text={p.tag} size={38} bg="#fff" />
        </Pop>
      )}
      {p.caption && (
        <Pop t={t} at={splitAt + 1.2} x={cx} y={880}>
          <Label x={0} y={0} text={p.caption} size={38} bg={C.goldLight} />
        </Pop>
      )}
    </g>
  );
};

// ── сеть решений: точки соединяются тонкими линиями, из них складывается поток ──
export const DotNet: React.FC<VisualProps<P & { words?: string[]; flow?: boolean; n?: number; title?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const n = p.n ?? 220;
  const build = ramp(t, 0.1, Math.max(2, at(c, 1) - 0.1));
  const flowK = p.flow ? ramp(t, at(c, 1), 3) : 0;
  const pts = dotsCloud(n, cx, 500, 700, 300, 21);
  const shown = Math.floor(build * n);
  return (
    <g>
      {pts.slice(0, shown).map((d, i) => {
        const j = (i * 7 + 3) % n;
        const e = pts[j];
        return i % 2 === 0 && j < shown ? <line key={`l${i}`} x1={d.x} y1={d.y} x2={e.x} y2={e.y} stroke={dark(p) ? "#8fa0e8" : C.steel} strokeOpacity={0.18} strokeWidth={2} /> : null;
      })}
      {pts.slice(0, shown).map((d, i) => {
        const fx = flowK * ((t * 60 + i * 9) % 260 - 130);
        return <circle key={i} cx={d.x + fx} cy={d.y + Math.sin(t * 1.5 + i) * 3 + flowK * Math.sin((d.x + t * 80) / 140) * 30} r={d.r} fill={d.c} stroke={dark(p) ? "none" : C.ink} strokeWidth={dark(p) ? 0 : 1.5} />;
      })}
      {p.title && (
        <Pop t={t} at={0.4} x={cx} y={150}>
          <Label x={0} y={0} text={p.title} size={42} bg="#fff" />
        </Pop>
      )}
      {(p.words ?? []).map((w, i) => (
        <Pop key={i} t={t} at={at(c, 0.5 + i * 0.6)} x={cx - 420 + (i % 3) * 420} y={330 + Math.floor(i / 3) * 360 + (i % 2) * 60}>
          <Label x={0} y={0} text={w} size={34} bg="#fff" />
        </Pop>
      ))}
    </g>
  );
};

// ── карточка акта: лист карты ложится на стопку, номер и название ──
export const ActCard: React.FC<VisualProps<P & { n: string; title: string; sub: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const L = LAYERS.find((l) => l.id === p.layer) ?? LAYERS[0];
  const drop = ramp(t, 0.1, 0.8);
  const txt = ramp(t, 0.6, 0.6);
  return (
    <g>
      {[2, 1, 0].map((i) => (
        <path key={i} d="M -460 0 L 0 -140 L 460 0 L 0 140 Z" transform={`translate(${cx} ${640 + i * 34})`} fill={i === 0 ? L.color : "#ffffff"} opacity={i === 0 ? drop : 0.5} stroke={C.ink} strokeWidth={4} />
      ))}
      <g transform={`translate(${cx} ${640 - (1 - drop) * 220})`} opacity={drop}>
        <Txt x={0} y={30} size={120} color="#fff" weight={900}>
          {p.n}
        </Txt>
      </g>
      <g opacity={txt} transform={`translate(0 ${(1 - txt) * 24})`}>
        <Txt x={cx} y={190} size={34} weight={900} color={L.color}>
          {`СЛОЙ ${L.n} · ${L.label.toUpperCase()}`}
        </Txt>
        <text x={cx} y={290} fontFamily={DISPLAY} fontSize={78} fill={ink(p)} textAnchor="middle">
          {p.title}
        </text>
        <Txt x={cx} y={360} size={36} weight={800} color={inkSoft(p)}>
          {p.sub}
        </Txt>
      </g>
    </g>
  );
};

// ── цитата: короткая, с указанием, чей это голос, и места в источнике ──
const VOICE_COL: Record<string, string> = { narrator: C.skyDeep, hero: C.rose, tolstoy: C.violet, history: C.goldDeep };
const VOICE_NAME: Record<string, string> = { narrator: "голос рассказчика", hero: "слова героя", tolstoy: "Толстой-историк, рассуждение", history: "исторический документ в романе" };
export const Quote: React.FC<VisualProps<P & { text: string; who: string; voice: string; ref: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const lines = p.text.split("\n");
  const k = pop(t, 0.1);
  const reveal = ramp(t, 0.3, 1.2);
  const col = VOICE_COL[p.voice] ?? C.ink;
  const w = Math.min(1240, Math.max(...lines.map((l) => l.length)) * 33 + 220);
  return (
    <g>
      <g transform={`translate(${cx} 430) scale(${k}) rotate(${wob(t * 0.3, 1, 0.5)})`}>
        <Card x={-w / 2} y={-220} w={w} h={420} />
        <rect x={-w / 2} y={-220} width={18} height={420} rx={9} fill={col} />
        <text x={-w / 2 + 50} y={-100} fontFamily={SERIF} fontWeight={700} fontSize={150} fill={col} opacity={0.35}>
          «
        </text>
        {lines.map((l, i) => (
          <text key={i} x={0} y={-30 + i * 74 - (lines.length - 1) * 30} fontFamily={SERIF} fontWeight={700} fontSize={58} fill={C.ink} textAnchor="middle" opacity={clamp01(reveal * lines.length - i)}>
            {l}
          </text>
        ))}
        <Txt x={0} y={150} size={32} weight={800} color={C.inkSoft} opacity={reveal}>
          {p.who}
        </Txt>
      </g>
      <g opacity={ramp(t, 0.9, 0.5)}>
        <Label x={cx - 250} y={760} text={VOICE_NAME[p.voice] ?? p.voice} size={26} bg="#fff" stroke={col} />
        <Label x={cx + 300} y={760} text={p.ref} size={26} bg={C.goldLight} />
      </g>
    </g>
  );
};

// ── честное предупреждение: что это за фильм ──
export const Notice: React.FC<VisualProps<P & { items: { icon: string; text: string }[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  return (
    <g>
      {p.items.map((it, i) => {
        const k = pop(t, at(c, i));
        return (
          <g key={i} transform={`translate(${cx} ${260 + i * 200}) scale(${k})`} opacity={clamp01(k)}>
            <Card x={-560} y={-75} w={1120} h={150} />
            <circle cx={-470} cy={0} r={46} fill={[C.gold, C.coral, C.sky][i % 3]} stroke={C.ink} strokeWidth={4} />
            <Txt x={-470} y={16} size={44} weight={900}>
              {it.icon}
            </Txt>
            <Txt x={-390} y={14} size={40} anchor="start" weight={800}>
              {it.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── карточки героев: силуэт, имя, 2–3 метки (мотив, перемена, итог) ──
export const Portraits: React.FC<VisualProps<P & { people: { who: Who; name: string; tags?: string[]; arm?: string }[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const n = p.people.length;
  const gap = Math.min(420, 1300 / Math.max(1, n));
  return (
    <g>
      {p.people.map((h, i) => {
        const x = cx + (i - (n - 1) / 2) * gap;
        const k = pop(t, at(c, Math.min(i * 0.6, c.beats.length - 0.2)));
        return (
          <g key={i} opacity={clamp01(k)} transform={`translate(0 ${(1 - clamp01(k)) * 40})`}>
            <circle cx={x} cy={500} r={210} fill={dark(p) ? "#26306a" : "#ffffff"} opacity={0.7} />
            <Person who={h.who} x={x} y={720} s={1.3} t={t} arm={(h.arm as never) ?? "down"} />
            <NameTag x={x} y={800} text={h.name} dark={dark(p)} />
            {(h.tags ?? []).map((tg, j) => (
              <Pop key={j} t={t} at={at(c, Math.min(i * 0.6 + 0.3 + j * 0.25, c.beats.length - 0.1))} x={x} y={190 + j * 62}>
                <Label x={0} y={0} text={tg} size={26} bg={j === 0 ? C.goldLight : "#fff"} />
              </Pop>
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ── два столбца: сравнение двух ответов/взглядов ──
export const Compare: React.FC<VisualProps<P & { left: { title: string; items: string[]; who?: Who; color?: string }; right: { title: string; items: string[]; who?: Who; color?: string }; mid?: string }>> = (c) => {
  const { t, p } = c;
  const split = ramp(t, 0.1, 0.7);
  const Side: React.FC<{ x: number; d: { title: string; items: string[]; who?: Who; color?: string }; k0: number }> = ({ x, d, k0 }) => {
    const col = d.color ?? C.skyDeep;
    return (
      <g>
        {d.who && <Person who={d.who} x={x - 250} y={860} s={0.9} t={t} />}
        <g opacity={pop(t, k0)}>
          <Card x={x - 240} y={170} w={560} h={110} fill={col} stroke={C.ink} />
          <Txt x={x + 40} y={243} size={46} weight={900} color="#fff">
            {d.title}
          </Txt>
        </g>
        {d.items.map((it, i) => (
          <Pop key={i} t={t} at={k0 + 0.5 + i * 0.45} x={x + 40} y={360 + i * 110}>
            <rect x={-260} y={-44} width={520} height={88} rx={22} fill="#fff" stroke={col} strokeWidth={4} />
            <Txt x={0} y={14} size={36} weight={800}>
              {it}
            </Txt>
          </Pop>
        ))}
      </g>
    );
  };
  return (
    <g>
      <rect x={60} y={130} width={880 * split} height={800} rx={30} fill={dark(p) ? "#26306a" : "#ffffff"} opacity={0.35} />
      <rect x={980 + 880 * (1 - split)} y={130} width={880 * split} height={800} rx={30} fill={dark(p) ? "#26306a" : "#ffffff"} opacity={0.35} />
      <Side x={500} d={p.left} k0={at(c, 0.2)} />
      <Side x={1420} d={p.right} k0={at(c, 1)} />
      {p.mid && (
        <Pop t={t} at={at(c, 1.6)} x={960} y={930}>
          <Label x={0} y={0} text={p.mid} size={36} />
        </Pop>
      )}
    </g>
  );
};

// ── хронология романа 1805 → 1820: точки событий на линии ──
export const Chrono: React.FC<VisualProps<P & { marks: { y: string; t: string }[]; hi?: number }>> = (c) => {
  const { t, p } = c;
  const n = p.marks.length;
  const line = ramp(t, 0.1, 1.2);
  const x0 = 200;
  const x1 = 1720;
  return (
    <g>
      <line x1={x0} y1={540} x2={x0 + (x1 - x0) * line} y2={540} stroke={ink(p)} strokeWidth={10} strokeLinecap="round" />
      {p.marks.map((m, i) => {
        const x = x0 + ((x1 - x0) * i) / Math.max(1, n - 1);
        const k = pop(t, at(c, (i / n) * Math.max(1, c.beats.length - 0.3)));
        const hi = p.hi === i;
        return (
          <g key={i} opacity={clamp01(k)}>
            <circle cx={x} cy={540} r={hi ? 30 : 22} fill={C.dots[i % C.dots.length]} stroke={C.ink} strokeWidth={4} />
            <Txt x={x} y={i % 2 ? 640 : 470} size={hi ? 44 : 38} weight={900} color={ink(p)}>
              {m.y}
            </Txt>
            <Txt x={x} y={i % 2 ? 690 : 420} size={28} weight={800} color={inkSoft(p)}>
              {m.t}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── большие цифры: объём романа ──
export const Stats: React.FC<VisualProps<P & { items: { n: string; t: string }[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const n = p.items.length;
  return (
    <g>
      {p.items.map((it, i) => {
        const x = cx + (i - (n - 1) / 2) * 330;
        const k = pop(t, at(c, (i / n) * Math.max(1, c.beats.length - 0.2)));
        return (
          <g key={i} transform={`translate(${x} 480) scale(${k})`} opacity={clamp01(k)}>
            <Card x={-150} y={-170} w={300} h={330} fill="#fff" />
            <text x={0} y={10} fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={C.dots[(i * 3) % 8]} stroke={C.ink} strokeWidth={3} textAnchor="middle">
              {it.n}
            </text>
            {it.t.split("\n").map((l, j) => (
              <Txt key={j} x={0} y={80 + j * 38} size={32} weight={800}>
                {l}
              </Txt>
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ── весы: два довода (например, свобода и необходимость) ──
export const Scales: React.FC<VisualProps<P & { left: string; right: string; tilt?: number; title?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const tiltK = ramp(t, at(c, 1.1), 1.4);
  const ang = (p.tilt ?? 0) * 12 * tiltK + wob(t, 2, 1.2);
  const L = 380;
  const rad = (ang * Math.PI) / 180;
  const pts = [
    [-Math.cos(rad) * L, -Math.sin(rad) * L],
    [Math.cos(rad) * L, Math.sin(rad) * L],
  ];
  return (
    <g transform={`translate(${cx} 240) scale(${k})`}>
      {p.title && (
        <Txt x={0} y={-60} size={44} weight={900} color={ink(p)}>
          {p.title}
        </Txt>
      )}
      <rect x={-14} y={0} width={28} height={560} fill="#b08a4a" stroke={C.ink} strokeWidth={4} />
      <path d="M -160 580 L 160 580 L 100 520 L -100 520 Z" fill="#b08a4a" stroke={C.ink} strokeWidth={4} />
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <circle r={26} fill={C.gold} stroke={C.ink} strokeWidth={4} />
      {[p.left, p.right].map((txt, i) => (
        <g key={i} transform={`translate(${pts[i][0]} ${pts[i][1]})`}>
          <line x1={-110} y1={140} x2={0} y2={0} stroke={C.ink} strokeWidth={4} />
          <line x1={110} y1={140} x2={0} y2={0} stroke={C.ink} strokeWidth={4} />
          <path d="M -160 140 Q 0 220 160 140 Z" fill={i ? C.goldLight : "#cfe0f5"} stroke={C.ink} strokeWidth={5} />
          <g opacity={ramp(t, at(c, i ? 0.8 : 0.2))}>
            <Label x={0} y={80} text={txt} size={36} bg="#fff" />
          </g>
        </g>
      ))}
    </g>
  );
};

// ── три вывода ──
export const Triad: React.FC<VisualProps<P & { items: string[]; title?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  return (
    <g>
      {p.title && (
        <Pop t={t} at={0.2} x={cx} y={170}>
          <Label x={0} y={0} text={p.title} size={40} bg="#fff" />
        </Pop>
      )}
      {p.items.map((it, i) => {
        const k = pop(t, at(c, i + 1));
        return (
          <g key={i} transform={`translate(${cx} ${320 + i * 190}) scale(${k})`} opacity={clamp01(k)}>
            <Card x={-600} y={-70} w={1200} h={140} />
            <circle cx={-520} cy={0} r={44} fill={C.dots[i * 2]} stroke={C.ink} strokeWidth={4} />
            <Txt x={-520} y={16} size={46} weight={900}>
              {String(i + 1)}
            </Txt>
            <Txt x={-450} y={14} size={40} anchor="start" weight={900}>
              {it}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── гипотеза зачёркивается: «простое объяснение» и поправка ──
export const Fix: React.FC<VisualProps<P & { claim: string; fix: string; ref?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const crossK = ramp(t, at(c, 1), 0.7);
  const fixK = pop(t, at(c, 1.3));
  return (
    <g>
      <g transform={`translate(${cx} 320) scale(${k})`}>
        <Card x={-520} y={-150} w={1040} h={280} fill="#2f3f6a" stroke={C.ink} />
        <Txt x={0} y={-80} size={30} weight={800} color="#c9d6f5">
          ПРОСТОЕ ОБЪЯСНЕНИЕ
        </Txt>
        <g opacity={1 - crossK * 0.45}>
          {p.claim.split("\n").map((l, i) => (
            <Txt key={i} x={0} y={0 + i * 64} size={54} weight={900} color="#fff">
              {l}
            </Txt>
          ))}
        </g>
        <Cross x={380} y={10} s={120} k={crossK} />
      </g>
      {fixK > 0 && (
        <g transform={`translate(${cx} 700) scale(${fixK})`}>
          <Card x={-520} y={-100} w={1040} h={200} fill="#fff" stroke={C.greenDeep} />
          {p.fix.split("\n").map((l, i) => (
            <Txt key={i} x={40} y={-10 + i * 58} size={46} weight={900} color={C.greenDeep}>
              {l}
            </Txt>
          ))}
          <Check x={-440} y={0} s={44} k={ramp(t, at(c, 1.4), 0.5)} />
          {p.ref && <Label x={360} y={-100} text={p.ref} size={24} />}
        </g>
      )}
    </g>
  );
};

// ── финальная заставка канала ──
export const EndCard: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.2);
  const pts = dotsCloud(120, cx, 470, 620, 260, 33);
  return (
    <g>
      {pts.map((d, i) => (
        <circle key={i} cx={d.x + Math.sin(t + i) * 4} cy={d.y} r={d.r * 0.8} fill={d.c} opacity={0.75} />
      ))}
      <g transform={`translate(${cx} 470) scale(${k})`}>
        <rect x={-430} y={-130} width={860} height={220} rx={40} fill={BRAND.ink} />
        <text x={0} y={20} fontFamily={DISPLAY} fontSize={120} textAnchor="middle">
          <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
          <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
        </text>
        <Txt x={0} y={72} size={34} weight={800} color="#dfe4f5">
          Большие идеи. Простыми словами.
        </Txt>
      </g>
    </g>
  );
};

// ── числовая полоса «сколько людей» — масштаб без таймера ──
export const Crowd: React.FC<VisualProps<P & { title?: string; n?: number; one?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const n = p.n ?? 600;
  const k = ramp(t, 0.2, Math.max(2, at(c, 1)));
  const cols = 50;
  return (
    <g>
      {Array.from({ length: Math.floor(n * k) }).map((_, i) => {
        const x = cx - 640 + (i % cols) * 26 + (Math.floor(i / cols) % 2) * 13;
        const y = 300 + Math.floor(i / cols) * 40;
        return <circle key={i} cx={x} cy={y + Math.sin(t * 2 + i * 0.3) * 2} r={9} fill={C.dots[(i * 5) % 8]} />;
      })}
      {p.one && (
        <g opacity={ramp(t, at(c, 0.4))}>
          <circle cx={cx - 640 + 25 * 26} cy={300} r={22} fill="none" stroke={ink(p)} strokeWidth={5} />
          <Label x={cx - 640 + 25 * 26} y={230} text={p.one} size={30} bg="#fff" />
        </g>
      )}
      {p.title && (
        <Pop t={t} at={at(c, 0.2)} x={cx} y={180}>
          <Label x={0} y={0} text={p.title} size={40} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

export { Arrow, interpolate, FONT };

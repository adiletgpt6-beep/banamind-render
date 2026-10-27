// Сцены BM-031 «Мастерская решений». Всё — собственная графика BanaMind:
// компас, фишки с именами, карточки ситуаций, доска улик, весы, рамка зеркала.
// Персонажи романа показаны только именами на фишках; никаких изображений героев,
// замка, гербов, шляпы, мётел или кадров экранизации.
import React from "react";
import { interpolate } from "remotion";
import { BRAND } from "../../../../banamind/brand";
import { accentOf, C, DIRS, DISPLAY, FONT, type Dir } from "../theme";
import { Bubble, Headline } from "./bridge";
import { angleOf, Compass, Envelope, FearCloud, OwnBook, Sticker, Token, turn } from "./common";
import { dotsOf, hash, Morph, SH, Swarm, type Pt } from "./dots";
import { Label, OL, Thread } from "./draw";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, ease, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { SHAPES, type ShapeName } from "./shapes";

type Base = { host?: string; part?: string };

// ── ярлыки на фишке ──
const SLOTS: [number, number, number][] = [
  [-280, -190, -7],
  [270, -140, 6],
  [-250, 110, 5],
  [280, 150, -5],
];
const FROM: [number, number][] = [
  [-900, -700],
  [900, -700],
  [-1100, 300],
  [1100, 400],
];
type LabelsP = Base & { name: string; labels: string[]; at?: number[]; peel?: number; peelIndex?: number; house?: boolean; color?: string };
export const Labels: React.FC<VisualProps<LabelsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 500;
  const acc = accentOf(p.part ?? "");
  const color = p.color ?? (p.name === "?" ? "#c9cbe0" : "#4f8df5");
  const tk = clamp01(t / 1.1);
  const houseDots = p.house ? dotsOf("lab-house", (x, y) => SHAPES.house(x / 1.25, y / 1.25), cx, cy + 20, [acc.color, acc.deep, "#fff", C.yellow], 13, 300) : null;
  const peelK = p.peel !== undefined ? ramp(t, at(ctx, p.peel), 0.9) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.04}>
      {houseDots ? <Swarm pts={houseDots} k={tk} t={t} r={5.6} from="below" /> : <Token x={cx} y={cy} name={p.name} color={color} t={t} k={tk} s={1.35} seed={3} />}
      {p.labels.map((text, i) => {
        const [sx, sy, rot] = SLOTS[i % SLOTS.length];
        const when = at(ctx, p.at?.[i] ?? i * 0.5 + 0.5);
        const k = clamp01((t - when) / 0.55);
        const peeling = p.peel !== undefined && (p.peelIndex ?? 0) === i ? peelK : 0;
        // новый ярлык после отклеивания — крупнее и ровнее
        const fresh = p.peel !== undefined && i === p.labels.length - 1 && i !== (p.peelIndex ?? 0);
        return (
          <Sticker
            key={i}
            x={cx + sx * (houseDots ? 1.2 : 1)}
            y={cy + sy}
            text={text}
            k={k}
            peel={peeling}
            rot={fresh ? 0 : rot}
            from={[cx + FROM[i % 4][0], cy + FROM[i % 4][1]]}
            color={fresh ? DIRS.act.light : i % 2 ? "#fff1c2" : C.yellow}
            size={fresh ? 46 : 40}
          />
        );
      })}
    </Drift>
  );
};

// ── компас ──
type CompassP = Base & { mode: "spin" | "intro" | "pull" | "choose" | "turn"; dir?: Dir; dirs?: Dir[]; dirAt?: number[]; tempt?: Dir };
const SPIN_LABELS = ["ненормальный", "знаменитый", "почти герой", "выскочка"];
export const CompassScene: React.FC<VisualProps<CompassP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 540;
  const r = 245;
  const k = ease(clamp01(t / 0.7));
  let angle = 0;
  let hi: Dir | null = null;
  let glow = 0;
  const extras: React.ReactNode[] = [];
  if (p.mode === "spin") {
    angle = t * 300 + Math.sin(t * 2.7) * 60;
    SPIN_LABELS.forEach((text, i) => {
      const ang = t * 0.45 + (i / 4) * Math.PI * 2;
      const kk = clamp01((t - 0.2 - i * 0.25) / 0.5);
      extras.push(<Sticker key={i} x={cx + Math.cos(ang) * 600} y={cy + Math.sin(ang) * 400} text={text} k={kk} rot={Math.sin(ang) * 10} from={[cx, cy]} size={34} />);
    });
  } else if (p.mode === "intro") {
    const dirs = p.dirs ?? [];
    angle = Math.sin(t * 1.3) * 25;
    dirs.forEach((d, i) => {
      const w = at(ctx, p.dirAt?.[i] ?? i + 1);
      if (t >= w) {
        hi = d;
        const prev = i === 0 ? 0 : angleOf(dirs[i - 1]);
        angle = turn(prev, angleOf(d), (t - w) / 0.6);
      }
    });
    const last = at(ctx, 3);
    if (t > last) {
      hi = null;
      angle = turn(angleOf(dirs[dirs.length - 1] ?? "act"), angleOf(dirs[dirs.length - 1] ?? "act") + 360, (t - last) / 1.2);
    }
  } else if (p.mode === "pull") {
    const d = p.dir ?? "expect";
    hi = d;
    angle = angleOf(d) + Math.sin(t * 2.2) * 22 * (1 - ramp(t, at(ctx, 2), 1));
    ["ждут великого", "сравнивают", "будь собой"].forEach((text, i) => {
      const w = at(ctx, i === 2 ? 2 : 0.3 + i * 0.4);
      const kk = ramp(t, w, 0.5);
      const ax = i === 2 ? cx - 520 : cx + 470;
      const ay = i === 2 ? cy + 200 : cy - 180 + i * 200;
      extras.push(
        <g key={i} opacity={kk}>
          <Arrow x1={ax + (i === 2 ? 110 : -110)} y1={ay} x2={i === 2 ? cx - r * 0.8 : cx + r * 0.95} y2={i === 2 ? cy + 60 : cy - 40 + i * 50} k={kk} color={i === 2 ? DIRS.act.deep : DIRS.expect.deep} w={8} bend={0.15} />
          <Label x={ax} y={ay} text={text} size={30} bg={i === 2 ? DIRS.act.light : DIRS.expect.light} />
        </g>,
      );
    });
  } else if (p.mode === "choose") {
    const d = p.dir ?? "act";
    const tempt = p.tempt ?? "fear";
    const b1 = at(ctx, 1);
    const b2 = at(ctx, 2);
    const b3 = at(ctx, 3);
    angle = Math.sin(t * 1.8) * 30;
    if (t > b1) angle = turn(Math.sin(b1 * 1.8) * 30, angleOf(tempt), (t - b1) / 0.8);
    if (t > b2) angle = angleOf(tempt) + Math.sin((t - b2) * 14) * 9 * (1 - clamp01((t - b2) / 2));
    if (t > b3) angle = turn(angleOf(tempt), angleOf(d), (t - b3) / 0.7);
    hi = t > b3 ? d : t > b1 ? tempt : null;
    glow = ramp(t, b3 + 0.4, 0.6);
    extras.push(
      <Appear key="a" t={t} at={at(ctx, 0.3)} x={cx + 480} y={cy - 230}>
        <Label x={0} y={0} text="задатки: отвага, ум" size={28} />
      </Appear>,
      <Appear key="b" t={t} at={b1 + 0.3} x={cx + 480} y={cy + 230}>
        <Label x={0} y={0} text="«мог бы стать великим»" size={28} bg={DIRS[tempt].light} />
      </Appear>,
      <Appear key="c" t={t} at={b2 + 0.2} x={cx - 470} y={cy - 220}>
        <Label x={0} y={0} text="«только не туда»" size={30} bg="#fff" />
      </Appear>,
      <Appear key="d" t={t} at={b3 + 0.5} x={cx - 470} y={cy + 230}>
        <Label x={0} y={0} text="просьба учтена" size={32} bg={DIRS.act.light} />
      </Appear>,
    );
  } else if (p.mode === "turn") {
    const d = p.dir ?? "act";
    const b = at(ctx, 1);
    angle = angleOf("fear") + Math.sin(t * 2) * 10;
    hi = "fear";
    if (t > b) {
      angle = turn(angleOf("fear"), angleOf(d), (t - b) / 1.1);
      hi = t > b + 0.6 ? d : "fear";
    }
    glow = ramp(t, at(ctx, 2), 0.8);
    extras.push(
      <Appear key="a" t={t} at={0.2} x={cx + 470} y={cy - 200}>
        <Label x={0} y={0} text="баллы, наказания" size={30} bg={DIRS.fear.light} />
      </Appear>,
      <Appear key="b" t={t} at={b + 0.4} x={cx - 470} y={cy + 220}>
        <Label x={0} y={0} text="что действительно важно" size={30} bg={DIRS.act.light} />
      </Appear>,
    );
  }
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.04}>
      <g opacity={k} transform={`translate(${cx} ${cy}) scale(${0.85 + 0.15 * k}) translate(${-cx} ${-cy})`}>
        <Compass x={cx} y={cy} r={r} angle={angle} t={t} hi={hi} glow={glow} />
      </g>
      {extras}
    </Drift>
  );
};

// ── своя «обложка» и паспорт разбора ──
export const BookIntro: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const bx = a.cx - 300;
  const chips = [
    { text: "Дж. К. Роулинг", at: 0.2, bg: C.paper },
    { text: "первый роман", at: 0.5, bg: "#fff1c2" },
    { text: "разбор, а не пересказ", at: 1, bg: DIRS.act.light },
    { text: "спойлеры!", at: 2, bg: "#ffd6c7" },
  ];
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.035}>
      <Appear t={t} at={0} x={0} y={0} dy={60}>
        <OwnBook x={bx} y={520} s={0.95} rot={-4 + wob(t, 1, 1.2)} title={["Гарри Поттер", "и философский", "камень"]} author="Дж. К. Роулинг" />
      </Appear>
      {chips.map((c, i) => (
        <Appear key={i} t={t} at={at(ctx, c.at)} x={a.cx + 230} y={290 + i * 140}>
          <Label x={0} y={0} text={c.text} size={38} bg={c.bg} />
        </Appear>
      ))}
    </Drift>
  );
};

// ── 17 глав: дорожка ──
const GROUPS = ["дом", "слава", "выбор", "дружба", "зеркало", "страх", "финал"];
type ChapP = Base & { hi?: [number, number][]; roadmap?: boolean };
export const Chapters: React.FC<VisualProps<ChapP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const x0 = a.x0 + 90;
  const x1 = a.x1 - 90;
  const pos = (i: number) => {
    const u = i / 16;
    return { x: x0 + (x1 - x0) * u, y: 560 + Math.sin(u * Math.PI * 2.2) * 120 };
  };
  const ranges = p.hi ?? [];
  const groupOf = (n: number) => ranges.findIndex(([f, l]) => n >= f && n <= l);
  const path = Array.from({ length: 17 }, (_, i) => pos(i));
  const d = path.map((q, i) => `${i ? "L" : "M"} ${q.x} ${q.y}`).join(" ");
  const len = 2400;
  const k = ramp(t, 0.1, 1.6);
  const palette = [DIRS.origin.color, DIRS.expect.color, DIRS.act.color, "#36b3a0", DIRS.fear.color, "#b07ac8", C.gold];
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.03}>
      <Appear t={t} at={0} x={a.cx} y={230}>
        <Headline x={0} y={0} text={p.roadmap ? "Маршрут разбора" : "17 глав · первый том"} size={56} />
      </Appear>
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      {path.map((q, i) => {
        const n = i + 1;
        const g = groupOf(n);
        const w = p.roadmap ? at(ctx, 1 + (Math.max(0, g) / GROUPS.length) * 0.9) : 0.2 + i * 0.08;
        const s = pop(t, w);
        const col = p.roadmap ? palette[Math.max(0, g)] : n === 1 || n === 17 ? C.yellow : C.paper;
        return (
          <g key={i} transform={`translate(${q.x} ${q.y}) scale(${0.4 + 0.6 * s})`} opacity={clamp01(s * 2)}>
            <circle r={40} fill={col} stroke={OL} strokeWidth={5} />
            <text y={13} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill={OL} textAnchor="middle">
              {n}
            </text>
          </g>
        );
      })}
      {p.roadmap &&
        ranges.map(([f, l], gi) => {
          const m = pos((f + l) / 2 - 1);
          const w = at(ctx, 1 + (gi / GROUPS.length) * 0.9);
          return (
            <Appear key={gi} t={t} at={w + 0.2} x={m.x} y={m.y + (gi % 2 ? 120 : -110)}>
              <Label x={0} y={0} text={GROUPS[gi]} size={30} bg={palette[gi]} color={OL} />
            </Appear>
          );
        })}
      {!p.roadmap && (
        <Appear t={t} at={at(ctx, 1)} x={a.cx} y={880}>
          <Label x={0} y={0} text="народный перевод · имена — как в нём" size={32} />
        </Appear>
      )}
    </Drift>
  );
};

// ── заставка части: компас слева, образ участка из точек справа ──
type PartP = Base & { n: number; dir: Dir; text: string; sub?: string };
const PART_SHAPE: Record<number, ShapeName> = { 1: "house", 2: "star", 3: "steps", 4: "link", 5: "eye", 6: "heart", 7: "shield", 8: "mask" };
export const PartTitle: React.FC<VisualProps<PartP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const d = DIRS[p.dir];
  const ang = turn(angleOf(p.dir) - 160, angleOf(p.dir), (t - 0.3) / 1.4);
  const shape = PART_SHAPE[p.n] ?? "compass";
  const dots = dotsOf(`pt-${p.n}`, (x, y) => SHAPES[shape](x / 1.05, y / 1.05), cx + 330, 640, [d.color, d.deep, "#fff", d.light, C.yellow], 12, 340);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.04}>
      <Swarm pts={dots} k={clamp01((t - 0.2) / 1.8)} t={t} r={5.4} />
      <Appear t={t} at={0.15} x={0} y={0} dy={40}>
        <Compass x={cx - 300} y={600} r={160} angle={ang} t={t} hi={p.dir} />
      </Appear>
      <Appear t={t} at={0} x={cx} y={150}>
        <rect x={-130} y={-44} width={260} height={70} rx={35} fill={d.color} stroke={OL} strokeWidth={5} />
        <text x={0} y={8} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
          {`Часть ${p.n}`}
        </text>
      </Appear>
      <Appear t={t} at={0.3} x={cx} y={255}>
        <Headline x={0} y={0} text={p.text} size={Math.min(66, 1500 / (p.text.length * 0.6))} />
      </Appear>
      {p.sub && (
        <Appear t={t} at={0.6} x={cx} y={318}>
          <Txt x={0} y={0} size={32} color="#fff">
            {p.sub}
          </Txt>
        </Appear>
      )}
    </Drift>
  );
};

// ── дом ──
type HouseP = Base & { mode: "normal" | "cupboard" | "return" };
export const House: React.FC<VisualProps<HouseP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 520;
  const acc = accentOf(p.part ?? "");
  const pts = dotsOf("house-big", (x, y) => SHAPES.house(x / 1.7, y / 1.7), cx, cy, [acc.color, acc.deep, "#ffffff", acc.light], 14, 420, "rows");
  const k = clamp01(t / 1.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.035}>
      <rect x={a.x0 + 40} y={cy + 240} width={a.x1 - a.x0 - 80} height={16} rx={8} fill="#fff" opacity={0.35} />
      <Swarm pts={pts} k={k} t={t} r={6} from="below" />
      {p.mode === "normal" && (
        <>
          <Appear t={t} at={at(ctx, 0.5)} x={cx} y={cy - 330}>
            <rect x={-230} y={-48} width={460} height={84} rx={14} fill={C.paper} stroke={OL} strokeWidth={5} />
            <text y={10} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={OL} textAnchor="middle">
              «Всё нормально»
            </text>
          </Appear>
          {[0, 1, 2].map((i) => (
            <Appear key={i} t={t} at={at(ctx, 1.2 + i * 0.25)} x={cx + (i - 1) * 300} y={cy + 330}>
              <circle r={44} fill="#fff" stroke={OL} strokeWidth={4} />
              <ellipse rx={30} ry={18} fill="none" stroke={OL} strokeWidth={4} />
              <circle r={10} fill={OL} />
            </Appear>
          ))}
          <Appear t={t} at={at(ctx, 1.4)} x={cx + 420} y={cy + 330}>
            <Label x={0} y={0} text="что скажут соседи?" size={28} />
          </Appear>
          <Appear t={t} at={at(ctx, 2.3)} x={cx} y={cy + 60}>
            <rect x={-80} y={-80} width={160} height={160} rx={16} fill={C.paper} stroke={OL} strokeWidth={5} />
            <path d="M -40 30 L 0 -40 L 40 30 Z" fill="none" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
            <Txt x={0} y={60} size={28}>
              тайна
            </Txt>
          </Appear>
        </>
      )}
      {p.mode === "cupboard" && (
        <>
          <Appear t={t} at={at(ctx, 0.3)}>
            <g transform={`translate(${cx - 230} ${cy + 230})`}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={i * 70} y={-i * 50 - 50} width={70} height={50 + i * 50} fill={C.woodLight} stroke={OL} strokeWidth={4} />
              ))}
              <rect x={20} y={-90} width={90} height={90} rx={8} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <circle cx={95} cy={-45} r={6} fill={OL} />
            </g>
          </Appear>
          <Appear t={t} at={at(ctx, 1.2)} x={cx - 165} y={cy + 30}>
            <Label x={0} y={0} text="чулан под лестницей" size={28} bg="#fff1c2" />
          </Appear>
          {[0, 1, 2].map((i) => {
            const w = at(ctx, 2 + i * 0.15);
            return (
              <g key={i} transform={`translate(${cx + 190 + i * 120} ${cy - 160 - (i % 2) * 70})`} opacity={ramp(t, w - 0.6, 0.4)}>
                <text y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={100} fill="#fff" stroke={OL} strokeWidth={8} paintOrder="stroke" textAnchor="middle">
                  ?
                </text>
                <Cross x={0} y={0} s={90} k={ramp(t, w, 0.5)} />
              </g>
            );
          })}
        </>
      )}
      {p.mode === "return" && (
        <>
          <Token x={cx + 330} y={cy + 110} name="Гарри" color="#4f8df5" t={t} k={clamp01((t - 0.4) / 1)} s={0.9} seed={2} />
          {[
            { name: "Рон", c: "#ff7a59" },
            { name: "Гермиона", c: "#9a6bff" },
            { name: "Хагрид", c: "#b97a4a" },
          ].map((f, i) => {
            const w = at(ctx, 1.2 + i * 0.25);
            const fx = a.x1 - 120;
            const fy = 220 + i * 210;
            return (
              <g key={i} opacity={ramp(t, w, 0.5)}>
                <Thread x1={cx + 330} y1={cy - 20} x2={fx - 40} y2={fy + 40} k={ramp(t, w, 0.9)} color={C.yellow} sag={-40} />
                <Token x={fx} y={fy} name={f.name} color={f.c} t={t} k={ramp(t, w, 0.8)} s={0.45} seed={5 + i} />
              </g>
            );
          })}
          <Appear t={t} at={at(ctx, 2)} x={cx} y={150}>
            <Headline x={0} y={0} text="тот же дом — другой мальчик" size={52} />
          </Appear>
        </>
      )}
    </Drift>
  );
};

// ── письма ──
export const Letters: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const hx = a.x0 + 300;
  const cy = 560;
  const acc = accentOf(p.part ?? "");
  const pts = dotsOf("house-small", (x, y) => SHAPES.house(x / 1.05, y / 1.05), hx, cy, [acc.color, acc.deep, "#fff"], 13, 280, "rows");
  const b2 = at(ctx, 2);
  const flood = clamp01((t - b2) / 3);
  const big = ramp(t, at(ctx, 0) - 0.2, 0.7) * (1 - ramp(t, b2 - 0.2, 0.6));
  const n = Math.round(4 + flood * 26);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.035}>
      <Swarm pts={pts} k={clamp01(t / 1.4)} t={t} r={5.4} from="below" />
      {/* заколоченная щель */}
      {[0, 1].map((i) => (
        <rect key={i} x={hx - 120} y={cy + 30 + i * 40} width={240} height={26} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} transform={`rotate(${i ? 8 : -8} ${hx} ${cy + 40})`} opacity={ramp(t, b2 + 0.4 + i * 0.3, 0.3)} />
      ))}
      {big > 0.01 && (
        <g opacity={big} transform={`translate(${a.cx + 220} 470) scale(${0.9 + 0.1 * big})`}>
          <Envelope x={0} y={0} s={1.7} rot={-3} />
          <text y={-10} fontFamily={FONT} fontWeight={900} fontSize={40} fill={OL} textAnchor="middle">
            мистеру Г. Поттеру
          </text>
          <rect x={-230} y={30} width={460} height={64} rx={14} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text y={74} fontFamily={FONT} fontWeight={900} fontSize={36} fill={OL} textAnchor="middle">
            Чулан под лестницей
          </text>
        </g>
      )}
      {Array.from({ length: n }).map((_, i) => {
        const h1 = hash(i, 11);
        const h2 = hash(i, 12);
        const start = b2 + i * 0.09;
        const u = clamp01((t - start) / 1.8);
        if (u <= 0) return null;
        // конверты облетают дом и ложатся вокруг него широким полукругом
        const ang = Math.PI * (0.95 + h1 * 1.1);
        const tx = hx + Math.cos(ang) * (260 + h2 * 220) + 260;
        const ty = cy - 60 + Math.sin(ang) * (220 + h2 * 120);
        const x = a.x1 + 120 + (tx - a.x1 - 120) * ease(u) + Math.sin(u * 6 + i) * 30 * (1 - u);
        const y = 120 + h1 * 300 + (ty - 120 - h1 * 300) * ease(u) + Math.cos(u * 5 + i) * 40 * (1 - u);
        return <Envelope key={i} x={x} y={y} s={0.32 + h2 * 0.12} rot={(h2 - 0.5) * 60 + u * 90} />;
      })}
      <Appear t={t} at={b2 + 1.2} x={hx + 260} y={150}>
        <Label x={0} y={0} text="письма не остановить" size={32} />
      </Appear>
    </Drift>
  );
};

// ── карточка ситуации из книги ──
type CardP = Base & { ch: string; title: string; lines: string[]; note?: string; noteAt?: number; icon?: ShapeName };
export const SceneCard: React.FC<VisualProps<CardP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx - 60;
  const acc = accentOf(p.part ?? "");
  const w = Math.min(820, a.x1 - a.x0 - 260);
  const h = 470;
  const k = ramp(t, 0.05, 0.7);
  const icon = p.icon ? dotsOf(`icon-${p.icon}`, (x, y) => SHAPES[p.icon!](x / 0.7, y / 0.7), cx + w / 2 - 90, 560 - h / 2 - 100, [acc.color, acc.deep, "#fff", C.yellow], 11, 200) : null;
  const flip = interpolate(k, [0, 1], [70, 0]);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <g opacity={k} transform={`translate(${cx} 560) rotate(${-2 + wob(t, 2, 0.6)}) scale(${0.9 + 0.1 * k}) translate(0 ${flip})`}>
        <rect x={-w / 2 + 8} y={-h / 2 + 14} width={w} height={h} rx={34} fill="#000" opacity={0.18} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={C.paper} stroke={OL} strokeWidth={5} />
        <rect x={-w / 2} y={-h / 2} width={w} height={96} rx={34} fill={acc.color} stroke={OL} strokeWidth={5} />
        <rect x={-w / 2 + 3} y={-h / 2 + 60} width={w - 6} height={34} fill={acc.color} />
        <text x={-w / 2 + 40} y={-h / 2 + 62} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff" stroke={OL} strokeWidth={5} paintOrder="stroke">
          {`Книга · ${p.ch}`}
        </text>
        <text x={0} y={-h / 2 + 160} fontFamily={DISPLAY} fontWeight={800} fontSize={52} fill={OL} textAnchor="middle">
          {p.title}
        </text>
        {p.lines.map((l, i) => {
          const lk = ramp(t, at(ctx, Math.min(i * 0.35, 1.6)), 0.5);
          return (
            <text key={i} x={-w / 2 + 70} y={-h / 2 + 240 + i * 56} fontFamily={FONT} fontWeight={800} fontSize={40} fill={OL} opacity={lk}>
              {l}
            </text>
          );
        })}
        {p.lines.map((_, i) => (
          <circle key={i} cx={-w / 2 + 46} cy={-h / 2 + 228 + i * 56} r={8} fill={acc.deep} opacity={ramp(t, at(ctx, Math.min(i * 0.35, 1.6)), 0.5)} />
        ))}
      </g>
      {icon && <Swarm pts={icon} k={clamp01((t - 0.4) / 1.4)} t={t} r={4.6} />}
      {p.note && (
        <Sticker x={cx + w / 2 - 80} y={560 + h / 2 + 30} text={`Наш анализ: ${p.note}`} k={clamp01((t - at(ctx, p.noteAt ?? 1)) / 0.55)} rot={-3} from={[cx + w / 2 + 600, 1200]} color={DIRS.act.light} size={32} />
      )}
    </Drift>
  );
};

// ── весы ──
type ScaleP = Base & { title?: string; left: string; right: string; tiltAt?: number; tiltTo?: "left" | "right"; wobble?: boolean };
const wrap = (s: string, n = 16) => {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if ((cur + " " + w).trim().length > n && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};
export const Scale: React.FC<VisualProps<ScaleP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const py = 380;
  const arm = Math.min(420, (a.x1 - a.x0) / 2 - 220);
  const tk = p.tiltAt !== undefined ? ramp(t, at(ctx, p.tiltAt), 1.1) : 0;
  const target = p.tiltTo === "left" ? -11 : 11;
  let ang = target * tk;
  if (p.wobble) ang += Math.sin(t * 1.4) * 7 * (1 - tk * 0.6);
  const rad = (ang * Math.PI) / 180;
  const lx = cx - Math.cos(rad) * arm;
  const ly = py - Math.sin(rad) * arm;
  const rx = cx + Math.cos(rad) * arm;
  const ry = py + Math.sin(rad) * arm;
  const k = ramp(t, 0, 0.7);
  const pan = (x: number, y: number, text: string, color: string, appear: number) => (
    <g>
      <line x1={x} y1={y} x2={x - 120} y2={y + 200} stroke={OL} strokeWidth={4} />
      <line x1={x} y1={y} x2={x + 120} y2={y + 200} stroke={OL} strokeWidth={4} />
      <path d={`M ${x - 160} ${y + 200} Q ${x} ${y + 290} ${x + 160} ${y + 200} Z`} fill={C.brass} stroke={OL} strokeWidth={5} />
      <g opacity={ramp(t, appear, 0.5)}>
        {wrap(text).map((l, i, arr) => (
          <g key={i}>
            <Label x={x} y={y + 160 - (arr.length - 1 - i) * 66} text={l} size={28} bg={color} />
          </g>
        ))}
      </g>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={180}>
          <Headline x={0} y={0} text={p.title} size={54} />
        </Appear>
      )}
      <g opacity={k}>
        <rect x={cx - 20} y={py} width={40} height={460} rx={12} fill={C.brassDark} stroke={OL} strokeWidth={5} />
        <rect x={cx - 140} y={py + 440} width={280} height={40} rx={14} fill={C.brass} stroke={OL} strokeWidth={5} />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={22} strokeLinecap="round" />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.brass} strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx} cy={py} r={26} fill={C.brass} stroke={OL} strokeWidth={5} />
        {pan(lx, ly, p.left, DIRS.expect.light, at(ctx, 0) + 0.3)}
        {pan(rx, ry, p.right, DIRS.act.light, at(ctx, Math.min(1, ctx.beats.length - 1)) + 0.3)}
      </g>
    </Drift>
  );
};

// ── фишки-участники и реплики ──
type Item = { name: string; c: string; ghost?: boolean; apart?: boolean };
type TokBeat = { at: number; who: number; text: string };
type TokensP = Base & { title?: string; items: Item[]; beats: TokBeat[]; crowd?: boolean; link?: { a: number; b: number; at: number }; cross?: { a: number; b: number; at: number }; freeze?: { who: number; at: number } };
export const Tokens: React.FC<VisualProps<TokensP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const n = p.items.length;
  const span = Math.min(a.x1 - a.x0 - 300, 300 * n + 100);
  const floor = 640;
  const xs = p.items.map((it, i) => (n === 1 ? a.cx : a.cx - span / 2 + (span * i) / (n - 1)) + (it.apart ? 90 : 0));
  const s = n >= 4 ? 0.82 : 1;
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={floor} amount={0.035}>
      {p.title && (
        <Appear t={t} at={0} x={a.cx} y={160}>
          <Headline x={0} y={0} text={p.title} size={50} />
        </Appear>
      )}
      {p.crowd &&
        Array.from({ length: 14 }).map((_, i) => {
          const ang = (i / 14) * Math.PI * 1.1 + Math.PI * 0.95;
          const rr = 380 + (i % 3) * 70;
          const x = a.cx + Math.cos(ang) * rr * 1.3;
          const y = floor + 40 + Math.sin(ang) * rr * 0.35 + (i % 2) * 30;
          const lean = Math.sin(t * 2 + i) * 4;
          return <Token key={i} x={x + lean} y={y} name="" color={["#9aa3b8", "#c9cbe0", "#7f88a8"][i % 3]} t={t} k={clamp01((t - 0.1 - i * 0.04) / 0.8)} s={0.48} hideName seed={10 + i} />;
        })}
      {p.link && (
        <g opacity={ramp(t, at(ctx, p.link.at), 0.6)}>
          <Thread x1={xs[p.link.a]} y1={floor - 40} x2={xs[p.link.b]} y2={floor - 40} k={ramp(t, at(ctx, p.link.at), 1)} color={C.yellow} w={10} sag={60} />
          <g transform={`translate(${(xs[p.link.a] + xs[p.link.b]) / 2} ${floor + 30}) scale(${pop(t, at(ctx, p.link.at) + 0.6)})`}>
            <path d="M 0 22 C -40 -6 -28 -40 0 -22 C 28 -40 40 -6 0 22 Z" fill={C.red} stroke={OL} strokeWidth={4} />
          </g>
        </g>
      )}
      {p.items.map((it, i) => (
        <Token
          key={i}
          x={xs[i]}
          y={floor}
          name={it.name}
          color={it.c}
          t={t}
          k={clamp01((t - 0.1 - i * 0.18) / 0.9)}
          s={s}
          ghost={it.ghost && t > at(ctx, 1.2)}
          seed={i + 1}
          frozen={p.freeze && p.freeze.who === i ? ramp(t, at(ctx, p.freeze.at), 0.5) : 0}
        />
      ))}
      {p.cross && <Cross x={(xs[p.cross.a] + xs[p.cross.b]) / 2} y={p.items.length > 2 ? floor - 380 : floor - 40} s={110} k={ramp(t, at(ctx, p.cross.at), 0.6)} />}
      {p.beats.map((b, i) => {
        const a0 = at(ctx, b.at);
        const nextSame = p.beats.slice(i + 1).find((x) => x.who === b.who);
        const a1 = nextSame ? at(ctx, nextSame.at) - 0.15 : dur + 1;
        const kk = ramp(t, a0, 0.35) * (1 - ramp(t, a1, 0.3));
        if (kk <= 0.01) return null;
        // облачко не выходит за край области и не наезжает на облачко соседа (чередование высоты)
        const bw = Math.max(220, b.text.length * 36 * 0.56 + 36 * 1.4);
        const x0 = b.who < 0 ? a.cx - 330 : xs[b.who];
        const x = Math.max(a.x0 + bw / 2 + 10, Math.min(a.x1 - bw / 2 - 10, x0));
        const y = b.who < 0 ? 330 : floor - 300 * s - 20 - (b.who % 2) * 110;
        return <Bubble key={i} x={x} y={y} text={b.text} size={36} tail={b.who < 0 ? 0 : 1} opacity={kk} scale={0.92 + 0.08 * kk} />;
      })}
    </Drift>
  );
};

// ── доска улик ──
type Clue = { text: string; at: number };
type BoardP = Base & { mode: "suspect" | "theory" | "edge" | "reveal"; clues: Clue[] };
const SPOTS: [number, number][] = [
  [-430, -190],
  [430, -170],
  [-420, 190],
  [430, 200],
];
export const Board: React.FC<VisualProps<BoardP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 540;
  const bw = Math.min(1260, a.x1 - a.x0 - 40);
  const bh = 760;
  const k = ramp(t, 0, 0.6);
  const reveal = p.mode === "reveal";
  const flip = reveal ? ramp(t, at(ctx, 0.5), 0.9) : 0;
  const center = p.mode === "edge" ? { x: cx - 120, y: cy - 30 } : { x: cx, y: cy - 20 };
  const edgeCard = { x: cx + bw / 2 - 170, y: cy + bh / 2 - 130 };
  const card = (x: number, y: number, title: string, sub: string, color: string, op = 1, rot = 0, s = 1) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <rect x={-150} y={-90} width={300} height={180} rx={12} fill="#000" opacity={0.2} transform="translate(6 8)" />
      <rect x={-150} y={-90} width={300} height={180} rx={12} fill={C.paper} stroke={OL} strokeWidth={5} />
      <rect x={-150} y={-90} width={300} height={44} rx={12} fill={color} />
      <circle cx={0} cy={-92} r={14} fill={C.red} stroke={OL} strokeWidth={3} />
      <text y={26} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={OL} textAnchor="middle">
        {title}
      </text>
      <text y={70} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.inkSoft} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
  const prevClues: Clue[] = p.mode === "theory" || p.mode === "edge" ? [
    { text: "холоден с первого урока", at: -1 },
    { text: "у третьего этажа", at: -1 },
  ] : [];
  const clues = p.mode === "suspect" || p.mode === "reveal" ? p.clues : prevClues;
  const snapeX = reveal ? center.x - 300 * flip : center.x;
  const quirX = reveal ? center.x + 300 * flip : edgeCard.x;
  const quirY = reveal ? center.y : edgeCard.y;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.03}>
      <g opacity={k}>
        <rect x={cx - bw / 2 + 10} y={cy - bh / 2 + 14} width={bw} height={bh} rx={26} fill="#000" opacity={0.2} />
        <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={26} fill="#c9925c" stroke={OL} strokeWidth={8} />
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={cx - bw / 2 + 30 + hash(i, 1) * (bw - 60)} cy={cy - bh / 2 + 30 + hash(i, 2) * (bh - 60)} r={3 + hash(i, 3) * 3} fill="#a87442" opacity={0.6} />
        ))}
      </g>
      {/* нити и улики против Снейпа */}
      {clues.map((c, i) => {
        const [sx, sy] = SPOTS[i % 4];
        const w = c.at < 0 ? 0 : at(ctx, c.at);
        const kk = c.at < 0 ? 1 : ramp(t, w, 0.5);
        const x = reveal ? cx + (i - (clues.length - 1) / 2) * 410 : cx + Math.sign(sx) * (bw / 2 - 215);
        const y = reveal ? cy + 230 : cy + sy;
        const target = reveal ? { x: quirX, y: quirY } : center;
        const dim = p.mode === "edge" ? 0.45 : 1;
        return (
          <g key={i} opacity={kk * dim}>
            <line x1={x} y1={y} x2={target.x} y2={target.y} stroke={reveal ? C.yellow : C.red} strokeWidth={6} />
            <g transform={`translate(${x} ${y}) rotate(${(hash(i, 5) - 0.5) * 8})`}>
              <rect x={-195} y={-62} width={390} height={124} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
              <circle cx={0} cy={-62} r={11} fill={C.red} stroke={OL} strokeWidth={3} />
              {wrap(c.text, 18).map((l, j, arr) => (
                <text key={j} y={12 + (j - (arr.length - 1) / 2) * 40} fontFamily={FONT} fontWeight={900} fontSize={32} fill={OL} textAnchor="middle">
                  {l}
                </text>
              ))}
            </g>
          </g>
        );
      })}
      {card(snapeX, center.y, "Снейп", reveal && flip > 0.5 ? "защищал" : "подозреваемый", reveal && flip > 0.5 ? DIRS.act.color : C.red, p.mode === "edge" ? 0.55 : 1, reveal ? -4 * flip : 2)}
      {(p.mode === "edge" || reveal) && (
        <g>
          {p.mode === "edge" &&
            p.clues.map((c, i) => {
              const kk = ramp(t, at(ctx, c.at), 0.5);
              const x = cx - bw / 2 + 200 + (i % 2) * 360;
              const y = cy + 340 + Math.floor(i / 2) * 130;
              return (
                <g key={i} opacity={kk}>
                  <line x1={x} y1={y - 210} x2={edgeCard.x} y2={edgeCard.y} stroke={C.yellow} strokeWidth={6} />
                  <g transform={`translate(${x} ${y - 230})`}>
                    <rect x={-150} y={-42} width={300} height={84} rx={10} fill="#fff8d0" stroke={OL} strokeWidth={4} />
                    <text y={10} fontFamily={FONT} fontWeight={900} fontSize={Math.min(26, 280 / (c.text.length * 0.55))} fill={OL} textAnchor="middle">
                      {c.text}
                    </text>
                  </g>
                </g>
              );
            })}
          {card(quirX, quirY, "Квиррелл", reveal ? (flip > 0.5 ? "виновник" : "") : "на краю доски", reveal ? C.red : "#c9cbe0", 1, reveal ? 3 * flip : -3, p.mode === "edge" ? 0.85 + 0.15 * ramp(t, at(ctx, 1), 0.6) : 1)}
        </g>
      )}
      {p.mode === "theory" &&
        p.clues.map((c, i) => {
          const kk = ramp(t, at(ctx, c.at), 0.5);
          return (
            <g key={i} opacity={kk} transform={`translate(${cx} ${cy + 220}) translate(${(i - 0.5) * 560} 0) rotate(${i ? 3 : -3})`}>
              <rect x={-260} y={-60} width={520} height={120} rx={18} fill="#fff1c2" stroke={OL} strokeWidth={5} strokeDasharray="18 10" />
              <text y={12} fontFamily={FONT} fontWeight={900} fontSize={Math.min(34, 470 / (c.text.length * 0.55))} fill={OL} textAnchor="middle">
                {c.text}
              </text>
            </g>
          );
        })}
      {p.mode === "theory" && (
        <g opacity={ramp(t, at(ctx, 1), 0.4)} transform={`translate(${cx + 330} ${cy - 250}) rotate(-12) scale(${pop(t, at(ctx, 1))})`}>
          <rect x={-150} y={-46} width={300} height={92} rx={14} fill="none" stroke={C.red} strokeWidth={8} />
          <text y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={52} fill={C.red} textAnchor="middle">
            ДОГАДКА
          </text>
        </g>
      )}
    </Drift>
  );
};

// ── зеркало желания (своя простая рамка) ──
type MirrorP = Base & { mode: "family" | "ron" | "pull" | "warn" | "socks" | "stone" };
const personAt = (cx: number, cy: number, s: number): ((x: number, y: number) => boolean) => SH.move((x, y) => SH.person(150 * s)(x, y), cx, cy);
export const Mirror: React.FC<VisualProps<MirrorP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mx = a.cx + 140;
  const my = 470;
  const mw = 300;
  const mh = 400;
  const acc = DIRS.fear;
  const k = ramp(t, 0, 0.7);
  const inside = (x: number, y: number) => (x / (mw - 30)) ** 2 + (y / (mh - 30)) ** 2 <= 1;
  let shape: ((x: number, y: number) => boolean) | null = null;
  let colors = [acc.color, acc.light, "#ffffff", C.yellow];
  if (p.mode === "family" || p.mode === "pull") {
    const fig = [-170, -60, 50, 160].map((x, i) => personAt(x, 40 + (i % 2) * 20, 0.62 + (i % 2) * 0.06));
    shape = SH.union(...fig);
    colors = [DIRS.origin.color, DIRS.origin.light, "#ffffff", C.yellow];
  } else if (p.mode === "ron") {
    shape = SH.union(personAt(0, 70, 1.15), SH.move((x, y) => SHAPES.star(x / 0.35, y / 0.35), 0, -230));
    colors = ["#ff7a59", "#ffd6c7", C.yellow, "#fff"];
  } else if (p.mode === "socks") {
    shape = (x, y) => SHAPES.socks(x / 0.9, y / 0.9);
    colors = ["#e5484d", "#ffffff", "#36b37e"];
  } else if (p.mode === "stone") {
    shape = SH.union(personAt(0, 60, 0.95), SH.move((x, y) => SHAPES.gem(x / 0.25, y / 0.25), 40, 40));
    colors = ["#4f8df5", "#cfe0ff", "#fff"];
  } else if (p.mode === "warn") {
    const fig = [-170, -60, 50, 160].map((x, i) => personAt(x, 40 + (i % 2) * 20, 0.62));
    shape = SH.union(...fig);
  }
  const pts: Pt[] = shape ? dotsOf(`mir-${p.mode}`, (x, y) => inside(x, y) && shape!(x, y), mx, my, colors, 12, 420) : [];
  const assemble = clamp01((t - 0.6) / 1.8);
  // «предупреждение»: отражение рассыпается
  const scatter = p.mode === "warn" ? ramp(t, at(ctx, 1), 2) : 0;
  const tokenX = a.cx - 360;
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={my} amount={0.035}>
      <g opacity={k}>
        <ellipse cx={mx} cy={my + mh + 70} rx={mw * 0.9} ry={24} fill="#000" opacity={0.16} />
        <rect x={mx - 30} y={my + mh - 20} width={60} height={100} fill={C.brassDark} stroke={OL} strokeWidth={5} />
        <rect x={mx - 180} y={my + mh + 60} width={360} height={30} rx={12} fill={C.brass} stroke={OL} strokeWidth={5} />
        <ellipse cx={mx} cy={my} rx={mw + 24} ry={mh + 24} fill={C.brass} stroke={OL} strokeWidth={7} />
        {Array.from({ length: 36 }).map((_, i) => {
          const ang = (i / 36) * Math.PI * 2;
          return <circle key={i} cx={mx + Math.cos(ang) * (mw + 12)} cy={my + Math.sin(ang) * (mh + 12)} r={6} fill={i % 2 ? C.yellow : "#fff3c2"} stroke={OL} strokeOpacity={0.4} strokeWidth={1.4} />;
        })}
        <ellipse cx={mx} cy={my} rx={mw} ry={mh} fill="#e8ecff" stroke={OL} strokeWidth={5} />
        <ellipse cx={mx} cy={my} rx={mw} ry={mh} fill={acc.light} opacity={0.5 + 0.15 * Math.sin(t * 1.3)} />
        <path d={`M ${mx - mw * 0.6} ${my - mh * 0.5} Q ${mx - mw * 0.2} ${my - mh * 0.85} ${mx + mw * 0.2} ${my - mh * 0.8}`} stroke="#fff" strokeWidth={14} strokeOpacity={0.6} fill="none" strokeLinecap="round" />
      </g>
      {scatter > 0 ? (
        <Morph a={pts} b={pts.map((q, i) => ({ x: q.x + (hash(i, 21) - 0.5) * 900, y: q.y + (hash(i, 22) - 0.5) * 700, c: "rgba(255,255,255,0.0)" }))} k={scatter} t={t} r={5} stagger={0.5} />
      ) : (
        <Swarm pts={pts} k={assemble} t={t} r={5} from="center" />
      )}
      <Token x={tokenX} y={760} name={p.mode === "ron" ? "Рон" : "Гарри"} color={p.mode === "ron" ? "#ff7a59" : "#4f8df5"} t={t} k={clamp01((t - 0.2) / 0.9)} s={0.85} seed={4} />
      {p.mode === "family" && (
        <Appear t={t} at={at(ctx, 1.5)} x={tokenX} y={430}>
          <Label x={0} y={0} text="семья, которой не знал" size={30} />
        </Appear>
      )}
      {p.mode === "ron" && (
        <Appear t={t} at={at(ctx, 1)} x={tokenX} y={430}>
          <Label x={0} y={0} text="выйти из тени братьев" size={30} />
        </Appear>
      )}
      {p.mode === "pull" &&
        [0, 1, 2].map((i) => (
          <Arrow key={i} x1={mx - mw - 30} y1={my - 80 + i * 80} x2={tokenX + 110} y2={640 + i * 30} k={ramp(t, 0.8 + i * 0.3, 0.8)} color={DIRS.fear.deep} w={7} bend={0.1} />
        ))}
      {p.mode === "pull" && (
        <g opacity={1 - ramp(t, at(ctx, 0.6), 1.2)} transform={`translate(${tokenX} 360)`}>
          <rect x={-150} y={-50} width={300} height={100} rx={14} fill={C.paper} stroke={OL} strokeWidth={4} />
          <text y={12} fontFamily={FONT} fontWeight={900} fontSize={30} fill={OL} textAnchor="middle">
            найти Фламеля
          </text>
        </g>
      )}
      {p.mode === "warn" &&
        ["не даёт знания", "не даёт правды"].map((s, i) => (
          <Appear key={i} t={t} at={at(ctx, 1 + i * 0.35)} x={tokenX} y={250 + i * 120}>
            <Label x={0} y={0} text={s} size={32} bg={i ? "#ffd6c7" : "#fff1c2"} />
          </Appear>
        ))}
      {p.mode === "warn" && (
        <Appear t={t} at={at(ctx, 2)} x={mx} y={my}>
          <Label x={0} y={0} text="жить, а не смотреть" size={36} bg={DIRS.act.light} />
        </Appear>
      )}
      {p.mode === "socks" && (
        <Appear t={t} at={at(ctx, 1)} x={tokenX} y={340}>
          <text fontFamily={DISPLAY} fontWeight={800} fontSize={150} fill="#fff" stroke={OL} strokeWidth={10} paintOrder="stroke" textAnchor="middle">
            ?
          </text>
        </Appear>
      )}
      {p.mode === "stone" && (() => {
        const w = at(ctx, 1.5);
        const u = ease(clamp01((t - w) / 1.4));
        const gx = mx + 40 + (tokenX + 30 - mx - 40) * u;
        const gy = my + 40 + (700 - my - 40) * u - Math.sin(u * Math.PI) * 160;
        return (
          <g>
            {u > 0 && (
              <g transform={`translate(${gx} ${gy}) scale(${0.32})`}>
                <path d="M -120 -40 L 120 -40 L 0 140 Z M -120 -40 L -60 -110 L 60 -110 L 120 -40 Z" fill={C.red} stroke={OL} strokeWidth={10} />
              </g>
            )}
            <Appear t={t} at={at(ctx, 2)} x={tokenX} y={430}>
              <Label x={0} y={0} text="найти, но не использовать" size={30} bg={DIRS.act.light} />
            </Appear>
          </g>
        );
      })()}
    </Drift>
  );
};

// ── подарки ──
const GIFTS = [
  { text: "монетка", c: "#9aa3b8" },
  { text: "флейта", c: "#b97a4a" },
  { text: "свитер", c: "#ff7a59" },
  { text: "плащ отца", c: "#4f8df5" },
];
export const Gifts: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const span = Math.min(1100, a.x1 - a.x0 - 200);
  const heart = dotsOf("gift-heart", (x, y) => SHAPES.heart(x / 0.6, y / 0.6), a.cx, 270, [C.red, "#ff9fb8", "#fff", C.yellow], 11, 200);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.035}>
      {GIFTS.map((g, i) => {
        const x = a.cx - span / 2 + (span * i) / 3;
        const appear = 0.2 + i * 0.2;
        const open = ramp(t, at(ctx, 1 + i * 0.22), 0.6);
        return (
          <Appear key={i} t={t} at={appear} x={x} y={690} dy={60}>
            <rect x={-110} y={-90} width={220} height={180} rx={14} fill={g.c} stroke={OL} strokeWidth={5} />
            <rect x={-18} y={-90} width={36} height={180} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <g transform={`translate(0 ${-90 - open * 90}) rotate(${-open * 18})`}>
              <rect x={-125} y={-40} width={250} height={44} rx={10} fill={g.c} stroke={OL} strokeWidth={5} />
              <rect x={-18} y={-40} width={36} height={44} fill={C.yellow} stroke={OL} strokeWidth={4} />
            </g>
            <g opacity={open} transform={`translate(0 ${-200 - open * 40})`}>
              <Label x={0} y={0} text={g.text} size={30} />
            </g>
          </Appear>
        );
      })}
      <Swarm pts={heart} k={clamp01((t - at(ctx, 2)) / 1.6)} t={t} r={4.8} />
    </Drift>
  );
};

// ── цепочка решений (домино) ──
export const Chain: React.FC<VisualProps<Base & { items: string[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const n = p.items.length;
  const span = a.x1 - a.x0 - 200;
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.03}>
      <rect x={a.x0 + 60} y={760} width={a.x1 - a.x0 - 120} height={18} rx={9} fill="#fff" opacity={0.4} />
      {p.items.map((s, i) => {
        const x = a.x0 + 100 + (span * i) / (n - 1);
        const appear = at(ctx, (i / n) * 2.2);
        const fall = i < n - 1 ? ramp(t, at(ctx, ((i + 1) / n) * 2.2) - 0.2, 0.5) : 0;
        const last = i === n - 1;
        return (
          <g key={i} opacity={ramp(t, appear, 0.4)} transform={`translate(${x} 760) rotate(${fall * 22})`}>
            <rect x={-80} y={-330} width={160} height={330} rx={16} fill={last ? C.red : C.paper} stroke={OL} strokeWidth={5} />
            <text transform="rotate(-90)" x={165} y={12} fontFamily={FONT} fontWeight={900} fontSize={Math.min(34, 290 / (s.length * 0.55))} fill={last ? "#fff" : OL} textAnchor="middle">
              {s}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── трое в испытаниях ──
const TRIO = [
  { name: "Гермиона", c: "#9a6bff", icon: "book" as ShapeName, text: "знание и логика", at: 1 },
  { name: "Рон", c: "#ff7a59", icon: "pawn" as ShapeName, text: "партия и жертва", at: 2 },
  { name: "Гарри", c: "#4f8df5", icon: "key" as ShapeName, text: "ключ и шаг дальше", at: 3 },
];
export const Trio: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const span = Math.min(900, a.x1 - a.x0 - 300);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.035}>
      {TRIO.map((m, i) => {
        const x = a.cx - span / 2 + (span * i) / 2;
        const w = at(ctx, m.at);
        const on = ramp(t, w, 0.5);
        const icon = dotsOf(`trio-${m.icon}`, (x0, y0) => SHAPES[m.icon](x0 / 0.55, y0 / 0.55), x, 260, [m.c, "#fff", C.yellow], 10, 180);
        return (
          <g key={i}>
            <Token x={x} y={650} name={m.name} color={m.c} t={t} k={clamp01((t - 0.1 - i * 0.15) / 0.9)} s={0.9} dim={1 - on} seed={i + 2} />
            <Swarm pts={icon} k={clamp01((t - w) / 1.2)} t={t} r={4.4} />
            <Appear t={t} at={w + 0.5} x={x} y={420}>
              <Label x={0} y={0} text={m.text} size={28} bg={DIRS.act.light} />
            </Appear>
          </g>
        );
      })}
      {[0, 1].map((i) => (
        <g key={i} opacity={ramp(t, at(ctx, 3) + 0.8, 0.6)}>
          <Thread x1={a.cx - span / 2 + (span * i) / 2 + 60} y1={610} x2={a.cx - span / 2 + (span * (i + 1)) / 2 - 60} y2={610} k={ramp(t, at(ctx, 3) + 0.8, 1)} color={C.yellow} w={9} sag={40} />
        </g>
      ))}
    </Drift>
  );
};

// ── лестница страха ──
export const Fear: React.FC<VisualProps<Base & { steps: string[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const n = p.steps.length;
  const sw = Math.min(260, (a.x1 - a.x0 - 200) / n);
  const x0 = a.cx - (sw * n) / 2;
  const base = 860;
  const sh = 95;
  // фишка поднимается по ступеням в ритме первой реплики
  const climb = clamp01((t - at(ctx, 0)) / Math.max(1, at(ctx, 1) - at(ctx, 0)));
  const stepI = Math.min(n - 1, Math.floor(climb * n));
  const sub = climb * n - stepI;
  const finalK = ramp(t, at(ctx, 2), 0.8);
  const tx = x0 + sw * (stepI + 0.5) + (stepI < n - 1 ? ease(clamp01((sub - 0.6) / 0.4)) * sw : 0);
  const ty = base - sh * (stepI + 1) - 150 - Math.sin(clamp01((sub - 0.6) / 0.4) * Math.PI) * 40;
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={600} amount={0.03}>
      {p.steps.map((s, i) => (
        <Appear key={i} t={t} at={0.1 + i * 0.15} dy={40}>
          <rect x={x0 + sw * i} y={base - sh * (i + 1)} width={sw} height={sh * (i + 1)} fill={i === n - 1 ? DIRS.act.light : DIRS.fear.light} stroke={OL} strokeWidth={5} />
          <text x={x0 + sw * (i + 0.5)} y={base - sh * (i + 1) + 60} fontFamily={FONT} fontWeight={900} fontSize={Math.min(32, (sw - 20) / (s.length * 0.55))} fill={OL} textAnchor="middle">
            {s}
          </text>
        </Appear>
      ))}
      <FearCloud x={tx} y={ty - 40} t={t} k={clamp01(t / 1)} r={140} />
      <Token x={tx} y={ty} name="Гарри" color="#4f8df5" t={t} k={clamp01(t / 0.9)} s={0.62} seed={7} />
      <Appear t={t} at={at(ctx, 1)} x={a.cx} y={110}>
        <Headline x={0} y={0} text="страх рядом — шаг всё равно" size={52} />
      </Appear>
      {finalK > 0 && <circle cx={tx} cy={ty - 40} r={200} fill={C.yellow} opacity={0.18 * finalK} />}
    </Drift>
  );
};

// ── баллы года: счёт без гербов и цветов факультетов ──
export const Points: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const adds = [
    { who: "Рон", n: 50, at: 0.45 },
    { who: "Гермиона", n: 50, at: 0.6 },
    { who: "Гарри", n: 60, at: 0.78 },
    { who: "Невилл", n: 10, at: 1.5 },
  ];
  let score = 312;
  adds.forEach((d) => (score += Math.round(d.n * ramp(t, at(ctx, d.at), 0.8))));
  const lead = 472;
  const H = 520;
  const hOf = (v: number) => (H * (v - 250)) / (490 - 250);
  const lx = a.cx - 180;
  const rx = a.cx + 180;
  const base = 760;
  const col = (x: number, v: number, color: string, label: string) => {
    const h = hOf(v);
    const rows = Math.floor(h / 22);
    return (
      <g>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={x - 75 + c * 30} cy={base - 14 - r * 22} r={9} fill={r % 4 === 0 ? "#fff" : color} stroke={OL} strokeOpacity={0.35} strokeWidth={1.2} />),
        )}
        <text x={x} y={base - h - 30} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill="#fff" stroke={OL} strokeWidth={8} paintOrder="stroke" textAnchor="middle">
          {v}
        </text>
        <Label x={x} y={base + 60} text={label} size={28} />
      </g>
    );
  };
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.03}>
      <Appear t={t} at={0} x={a.cx} y={160}>
        <Headline x={0} y={0} text="Конец года: баллы" size={52} />
      </Appear>
      <g opacity={ramp(t, 0.1, 0.6)}>
        {col(lx, score, "#4f8df5", "факультет Гарри")}
        {col(rx, lead, "#9aa3b8", "лидер года")}
      </g>
      {adds.map((d, i) => (
        <Appear key={i} t={t} at={at(ctx, d.at)} x={a.x0 + 170} y={300 + i * 120}>
          <Label x={0} y={0} text={`${d.who} +${d.n}`} size={34} bg={i === 3 ? DIRS.act.light : "#fff1c2"} />
        </Appear>
      ))}
      <Appear t={t} at={at(ctx, 2)} x={a.x0 + 170} y={790}>
        <Label x={0} y={0} text="храбрость бывает разной" size={30} bg={DIRS.act.light} />
      </Appear>
    </Drift>
  );
};

// ── выводы ──
type FinP = Base & { theses: string[]; at?: number[] };
export const Finale: React.FC<VisualProps<FinP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.x1 - 330;
  const ang = turn(Math.sin(t) * 40, angleOf("act"), (t - at(ctx, 0.5)) / 1.4);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.025}>
      <Appear t={t} at={0} x={0} y={0}>
        <Compass x={a.x0 + 240} y={560} r={175} angle={ang} t={t} hi="act" glow={ramp(t, at(ctx, 1), 1)} />
      </Appear>
      {p.theses.map((s, i) => {
        const w = at(ctx, p.at?.[i] ?? i + 1);
        return (
          <Appear key={i} t={t} at={w} x={cx} y={330 + i * 180}>
            <rect x={-300} y={-62} width={600} height={124} rx={26} fill={C.paper} stroke={OL} strokeWidth={5} />
            <circle cx={-250} cy={0} r={34} fill={DIRS.act.color} stroke={OL} strokeWidth={4} />
            <text x={-250} y={13} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill="#fff" textAnchor="middle">
              {i + 1}
            </text>
            <text x={30} y={14} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, 460 / (s.length * 0.55))} fill={OL} textAnchor="middle">
              {s}
            </text>
          </Appear>
        );
      })}
    </Drift>
  );
};

// ── финал канала ──
export const Outro: React.FC<VisualProps<Base>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ox = area(p.host).cx;
  const wk = ramp(t, at(ctx, 2) - 0.3, 0.8);
  const ang = t * 20;
  return (
    <Drift t={t} dur={dur} cx={ox} amount={0.03}>
      <g opacity={1 - 0.6 * wk}>
        <Compass x={ox} y={600} r={200} angle={angleOf("act") + Math.sin(ang * 0.05) * 6} t={t} hi="act" labels={false} />
      </g>
      <g opacity={wk} transform={`translate(${ox} ${230 - (1 - wk) * 20})`}>
        <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={110} textAnchor="middle" stroke={OL} strokeWidth={14} paintOrder="stroke">
          <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
          <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
        </text>
        <text x={0} y={70} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
          Большие идеи. Простыми словами.
        </text>
      </g>
    </Drift>
  );
};


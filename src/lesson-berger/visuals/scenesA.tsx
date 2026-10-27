// Сцены BM-038, часть A: холодный старт, вопрос «почему мы рассказываем»,
// лаборатория из шести камер и заставка каждой камеры.
import React from "react";
import { C, CELL, CELLS, type CellId } from "../theme";
import { Bubble, Plate } from "./core";
import { Swarm } from "./dots";
import { BookObj, OL, Person } from "./draw";
import { Appear, area, at, clamp01, Cross, Drift, ease, Pop, ramp, Txt, type VisualProps } from "./kit";
import { BigNum, buildNet, Chamber, Lamp, Motes, Net, Spark } from "./lab";
import { pic, PICS } from "./pix";

type P = { host?: string; [k: string]: unknown };

// стол лаборатории под предметами
export const Bench: React.FC<{ x0: number; x1: number; y: number }> = ({ x0, x1, y }) => (
  <g>
    <rect x={x0 + 8} y={y + 10} width={x1 - x0} height={26} rx={12} fill="#1d2340" opacity={0.12} />
    <rect x={x0} y={y} width={x1 - x0} height={26} rx={12} fill="#ffffff" stroke={OL} strokeWidth={4} />
    <rect x={x0 + 30} y={y + 26} width={18} height={60} fill="#c3cbe0" stroke={OL} strokeWidth={3} />
    <rect x={x1 - 48} y={y + 26} width={18} height={60} fill="#c3cbe0" stroke={OL} strokeWidth={3} />
  </g>
);

// ── Холодный старт: две искры ──
export const Hook: React.FC<VisualProps<P & { stage: number }>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  if (p.stage === 1) {
    const nodes = buildNet("hookA", cx - 200, 600, { gens: 4, fan: 2.2, step: 96, spread: Math.PI * 1.3, dir: -Math.PI / 2, colors: [C.spark, CELL.currency.color, CELL.emotion.color, CELL.public.color, CELL.value.color, CELL.stories.color, CELL.triggers.color] });
    const grow = clamp01((t - at(ctx, 1)) / 4) * 4;
    const dim = ramp(t, at(ctx, 1) + 0.6, 2.4);
    return (
      <g>
        <Bench x0={a.x0 + 20} x1={a.x1 - 40} y={720} />
        <Net nodes={nodes} k={grow} t={t} r={14} />
        <Spark x={cx - 200} y={600} t={t} k={ramp(t, 0.2, 0.7)} />
        <Spark x={cx + 330} y={600} t={t} k={ramp(t, 0.6, 0.7) * (1 - dim * 0.45)} dim={dim} />
        {dim > 0.2 && (
          <g opacity={dim}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={cx + 330 + (i - 1) * 26} cy={560 - dim * 60 - i * 16} r={7 - i} fill={C.grey} opacity={0.6 - i * 0.15} />
            ))}
          </g>
        )}
        <Plate x={cx - 200} y={800} text="пересказали тысячи" k={ramp(t, at(ctx, 1.45), 0.5)} bg={C.yellow} />
        <Plate x={cx + 330} y={800} text="тихо погасла" k={ramp(t, at(ctx, 1.6), 0.5)} bg="#e6e9f2" />
      </g>
    );
  }
  // гипотеза «качество = успех» и её сбой
  const cross = ramp(t, at(ctx, 1.25), 0.7);
  return (
    <g>
      <Bench x0={a.x0 + 80} x1={a.x1 - 80} y={720} />
      <Spark x={a.cx - 360} y={630} r={24} t={t} />
      <Spark x={a.cx + 360} y={630} r={24} t={t} dim={0.9} />
      <Appear t={t} at={0.2} x={a.cx} y={360}>
        <rect x={-560} y={-120} width={1120} height={210} rx={40} fill="#fff" stroke={OL} strokeWidth={6} />
        <Txt x={-300} y={20} size={78} weight={900} color={CELL.value.deep}>
          КАЧЕСТВО
        </Txt>
        <Txt x={20} y={24} size={110} weight={900}>
          =
        </Txt>
        <Txt x={290} y={20} size={78} weight={900} color={CELL.currency.deep}>
          УСПЕХ
        </Txt>
        <Cross x={20} y={-8} s={130} k={cross} />
      </Appear>
      <Lamp x={a.cx + 470} y={190} t={t} k={cross} s={0.8} />
      <Plate x={a.cx} y={560} text="гипотеза не подтвердилась" k={ramp(t, at(ctx, 1.45), 0.5)} bg="#ffe1d8" />
    </g>
  );
};

// ── Чизстейк за сто долларов ──
const STEAK_ITEMS = ["бриошь", "мраморная говядина", "трюфели", "хвост омара", "шампанское"];
export const Steak: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const pts = pic("steak", PICS.steak, a.cx, 470, 2.6, 12);
  const k = ramp(t, at(ctx, 0.2), 1.8);
  const talk = clamp01((t - at(ctx, 2)) / 3) * 3;
  const nodes = buildNet("steakTalk", a.cx, 470, { gens: 3, fan: 2.6, step: 150, spread: Math.PI * 2, colors: [C.spark, CELL.currency.color, CELL.emotion.color, CELL.public.color], dead: 0 });
  return (
    <Drift t={t} dur={ctx.dur}>
      <Net nodes={nodes} k={talk} t={t} r={16} />
      <Swarm pts={pts} k={k} t={t} r={5.6} from="scatter" spread={700} />
      <Pop t={t} at={at(ctx, 1.05)} x={a.cx + 250} y={250}>
        <g transform="rotate(-8)">
          <path d="M -110 -50 L 70 -50 L 120 0 L 70 50 L -110 50 Z" fill={C.yellow} stroke={OL} strokeWidth={6} />
          <circle cx={74} cy={0} r={11} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={-22} y={24} size={70} weight={900}>
            $100
          </Txt>
        </g>
      </Pop>
      {STEAK_ITEMS.map((s, i) => (
        <Plate key={s} x={a.cx - 420 + (i % 3) * 420} y={i < 3 ? 700 : 790} text={s} size={34} k={ramp(t, at(ctx, 1.15 + i * 0.13), 0.4)} bg="#fff" />
      ))}
      <Plate x={a.cx} y={150} text="о нём говорят даже те, кто не пробовал" size={38} k={ramp(t, at(ctx, 2.55), 0.5)} bg={C.yellow} />
    </Drift>
  );
};

// ── Качество, цена, реклама — и имена ──
export const Names: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const icons: [string, string, string][] = [
    ["star", "качество", CELL.value.color],
    ["tag", "цена", CELL.currency.color],
    ["horn", "реклама", CELL.emotion.color],
  ];
  const out = ramp(t, at(ctx, 1), 0.6);
  const bars = ramp(t, at(ctx, 1.15), 1.4);
  // столбики из точек: 17 000 и 492 (масштаб: точка ≈ 170 имён)
  const col = (n: number, x: number, color: string) => {
    const dots = [];
    const total = Math.round(n * bars);
    for (let i = 0; i < total; i++) dots.push(<circle key={i} cx={x + (i % 10) * 15 - 68} cy={760 - Math.floor(i / 10) * 15} r={6} fill={color} stroke={OL} strokeOpacity={0.35} strokeWidth={1.2} />);
    return dots;
  };
  return (
    <g>
      <g opacity={1 - out} transform={`translate(0 ${-out * 40})`}>
        {icons.map(([ic, name, c], i) => {
          const x = a.cx - 380 + i * 380;
          const pts = pic(`names-${ic}`, PICS[ic], x, 300, 0.95, 9);
          return (
            <g key={ic}>
              <Swarm pts={pts} k={ramp(t, 0.2 + i * 0.35, 1)} t={t} r={4.2} />
              <Plate x={x} y={450} text={name} k={ramp(t, 0.5 + i * 0.35, 0.4)} bg="#fff" edge={c} />
            </g>
          );
        })}
      </g>
      {bars > 0 && (
        <g>
          {col(100, a.cx - 230, "#ff6f93")}
          {col(3, a.cx + 230, "#7aa7d8")}
          <line x1={a.cx - 420} y1={776} x2={a.cx + 420} y2={776} stroke={OL} strokeWidth={5} strokeLinecap="round" />
          <Txt x={a.cx - 230} y={830} size={40} weight={900}>
            Оливия
          </Txt>
          <Txt x={a.cx + 230} y={830} size={40} weight={900}>
            Розали
          </Txt>
          <BigNum x={a.cx - 230} y={170} text="≈17 000" k={ramp(t, at(ctx, 1.5), 0.6)} size={74} />
          <BigNum x={a.cx + 230} y={690} text="492" k={ramp(t, at(ctx, 1.75), 0.6)} size={74} />
          <Plate x={a.cx + 230} y={250} text="США, 2010 год" size={34} k={ramp(t, at(ctx, 1.3), 0.5)} bg="#fff" />
        </g>
      )}
      <Pop t={t} at={at(ctx, 2.3)} x={a.cx + 30} y={420}>
        <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={30} size={84} weight={900}>
          ?
        </Txt>
      </Pop>
    </g>
  );
};

// ── Книга и честное предупреждение ──
export const BookIntro: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const k = ramp(t, 0.1, 0.8);
  return (
    <g>
      <g transform={`translate(${a.cx - 300} ${470 + (1 - k) * 40}) rotate(${-6 + Math.sin(t * 0.8) * 1.5})`} opacity={k}>
        <BookObj x={0} y={0} s={1.65} />
      </g>
      <Plate x={a.cx + 260} y={300} text={"Йона Бергер\nпрофессор маркетинга"} size={42} k={ramp(t, 0.6, 0.5)} bg="#fff" />
      <Plate x={a.cx + 260} y={450} text="Уортонская школа бизнеса" size={34} k={ramp(t, 0.9, 0.5)} bg={C.yellow} />
      <Plate x={a.cx + 260} y={560} text="русское издание · 2013" size={34} k={ramp(t, 1.2, 0.5)} bg="#e6e9f2" />
      <Appear t={t} at={at(ctx, 1.05)} x={a.cx} y={760}>
        <rect x={-560} y={-56} width={520} height={112} rx={28} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={-300} y={14} size={36} weight={900} color={C.inkSoft}>
          фокусы для накрутки
        </Txt>
        <Cross x={-300} y={2} s={90} k={ramp(t, at(ctx, 1.25), 0.5)} />
        <rect x={40} y={-56} width={520} height={112} rx={28} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={300} y={14} size={36} weight={900}>
          почему люди делятся
        </Txt>
      </Appear>
    </g>
  );
};

// ── Масштаб личных рекомендаций ──
export const TalkStats: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const k2 = ramp(t, at(ctx, 2), 0.8);
  return (
    <g>
      <g opacity={1 - ramp(t, at(ctx, 1), 0.5) * 0.75}>
        <BigNum x={a.cx - 300} y={300} text="16 000" sub="слов в день" k={ramp(t, 0.3, 0.6)} color={CELL.triggers.deep} />
        <BigNum x={a.cx + 300} y={300} text="100 млн" sub="разговоров о брендах в час" k={ramp(t, at(ctx, 0.5), 0.6)} color={CELL.stories.deep} />
      </g>
      <BigNum x={a.cx - 300} y={590} text="20–50 %" sub="решений о покупке" k={ramp(t, at(ctx, 1.05), 0.6)} color={CELL.emotion.deep} size={110} />
      <BigNum x={a.cx + 300} y={590} text="×10" sub="сильнее обычной рекламы" k={ramp(t, at(ctx, 1.5), 0.6)} color={CELL.value.deep} size={110} />
      {k2 > 0 && (
        <g opacity={k2}>
          <Person who="anna" x={a.cx - 120} y={860} s={0.42} mood="smile" pose="give" t={t} />
          <Person who="timur" x={a.cx + 60} y={860} s={0.42} mood="happy" pose="take" t={t} flip />
          <g transform={`translate(${a.cx - 30} ${640 + Math.sin(t * 2) * 6})`}>
            <path d="M 0 30 C -50 -6 -40 -44 -14 -44 C -4 -44 0 -36 0 -30 C 0 -36 4 -44 14 -44 C 40 -44 50 -6 0 30 Z" fill={CELL.emotion.color} stroke={OL} strokeWidth={4} />
          </g>
        </g>
      )}
    </g>
  );
};

// ── Угадайте долю: 50 % догадка против 7 % ──
export const Seven: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 420;
  const R = 230;
  const guess = ramp(t, 0.6, 1.2) * (1 - ramp(t, at(ctx, 1.4), 0.6));
  const real = ramp(t, at(ctx, 1.45), 0.9);
  const arc = (frac: number) => {
    const ang = -Math.PI / 2 + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${cx} ${cy - R} A ${R} ${R} 0 ${large} 1 ${cx + Math.cos(ang) * R} ${cy + Math.sin(ang) * R} Z`;
  };
  const off = ramp(t, at(ctx, 2), 0.8);
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="#fff" stroke={OL} strokeWidth={6} />
      {guess > 0.01 && <path d={arc(0.5 * guess)} fill={CELL.public.light} stroke={CELL.public.deep} strokeWidth={5} strokeDasharray="16 10" />}
      {real > 0.01 && <path d={arc(0.07 * real)} fill={CELL.emotion.color} stroke={OL} strokeWidth={5} />}
      <Plate x={cx - 360} y={cy - 120} text="догадка ≈ 50 %" size={36} k={guess} bg="#fff" dash />
      <BigNum x={cx + 380} y={cy + 30} text="7 %" sub="в интернете" k={real} color={CELL.emotion.deep} size={130} />
      <Plate x={cx - 360} y={cy + 160} text="данные до 2013 года" size={32} k={ramp(t, at(ctx, 2.05), 0.5)} bg="#e6e9f2" />
      {off > 0 && (
        <g opacity={off}>
          {["за ужином", "в очереди", "по дороге"].map((s, i) => (
            <g key={s}>
              <Person who={(["friend", "neighbor", "student"] as const)[i]} x={cx - 420 + i * 420} y={860} s={0.36} mood="smile" pose={i === 1 ? "point" : "give"} t={t + i} />
              <Bubble x={cx - 360 + i * 420} y={690} text={s} k={ramp(t, at(ctx, 2.25 + i * 0.12), 0.4)} size={32} tail="b" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ── Не кто, а что: шутка, которую перескажет кто угодно ──
export const Joke: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const myth = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(ctx, 1), 0.6) * 0.7);
  const nodes = buildNet("joke", a.cx + 40, 470, { gens: 3, fan: 2.4, step: 150, colors: [C.spark, CELL.currency.color, CELL.triggers.color, CELL.stories.color, CELL.public.color], dead: 0 });
  const grow = clamp01((t - at(ctx, 1.25)) / 3) * 3;
  return (
    <g>
      <g opacity={myth}>
        <Person who="boss" x={a.cx - 360} y={760} s={0.62} mood="smile" pose="point" t={t} />
        <path d="M -40 0 L -24 -36 L 0 -12 L 24 -36 L 40 0 Z" transform={`translate(${a.cx - 360} 418)`} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <Plate x={a.cx - 360} y={180} text="«горстка влиятельных»" size={34} k={myth} bg="#fff" dash />
        <Cross x={a.cx - 360} y={540} s={200} k={ramp(t, at(ctx, 1.05), 0.6)} />
      </g>
      <Net nodes={nodes} k={grow} t={t} r={18} />
      <Pop t={t} at={at(ctx, 1.2)} x={a.cx + 40} y={470}>
        <g transform="scale(0.9)">
          <path d="M -96 -40 C -96 -76 -60 -84 0 -84 C 60 -84 96 -76 96 -40 L 96 20 C 96 56 60 64 0 64 L -24 64 L -60 96 L -54 62 C -86 56 -96 44 -96 20 Z" fill={C.yellow} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={4} size={50} weight={900}>
            ха-ха!
          </Txt>
        </g>
      </Pop>
      <Plate x={a.cx + 40} y={850} text="важнее, ЧТО рассказывают" size={38} k={ramp(t, at(ctx, 1.5), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Блендер и формула введения ──
export const Blender: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const pts = pic("blender", PICS.blender, a.cx - 260, 470, 2.7, 12);
  const k = ramp(t, 0.2, 1.4);
  const spin = ramp(t, at(ctx, 1), 0.4);
  // шарики внутри блендера: кружатся, когда он работает
  const balls = Array.from({ length: 9 }, (_, i) => {
    const ang = i * 0.7 + t * 6 * spin;
    const r = 60 + (i % 3) * 22;
    return <circle key={i} cx={a.cx - 260 + Math.cos(ang) * r * 0.9} cy={380 + Math.sin(ang) * 40 + (i % 3) * 40} r={14} fill={CELL.public.light} stroke={CELL.public.deep} strokeWidth={3} opacity={k * (1 - ramp(t, at(ctx, 1.6), 1))} />;
  });
  return (
    <g>
      <Swarm pts={pts} k={k} t={t} r={5.6} from="below" />
      {balls}
      <BigNum x={a.cx + 330} y={300} text="$500" sub="бюджет на кампанию" k={ramp(t, at(ctx, 0.55), 0.6)} color={CELL.currency.deep} />
      <BigNum x={a.cx + 330} y={560} text="300 млн+" sub="просмотров роликов" k={ramp(t, at(ctx, 1.65), 0.6)} color={CELL.emotion.deep} size={100} />
      <Plate x={a.cx} y={820} text="«Виральность не рождается, ее создают»" size={40} k={ramp(t, at(ctx, 2.1), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Шесть камер лаборатории ──
export const Lab: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const w = 238;
  const h = 330;
  const gap = 22;
  const x0 = 960 - (w * 6 + gap * 5) / 2 + 120;
  const lit = clamp01((t - at(ctx, 1)) / Math.max(1, at(ctx, 1.95) - at(ctx, 1)));
  const sparks = ramp(t, at(ctx, 2), 0.8);
  const soft = ramp(t, at(ctx, 3.05), 0.6);
  return (
    <g>
      <g opacity={ramp(t, 0.2, 0.6)}>
        {"STEPPS".split("").map((ch, i) => (
          <Txt key={i} x={x0 + w / 2 + i * (w + gap)} y={230} size={96} weight={900} color={CELL[CELLS[i]].deep}>
            {ch}
          </Txt>
        ))}
      </g>
      {CELLS.map((cell, i) => {
        const on = clamp01(lit * 6 - i);
        const x = x0 + i * (w + gap);
        return (
          <Chamber key={cell} cell={cell} x={x} y={300} w={w} h={h} k={ramp(t, 0.3 + i * 0.12, 0.5)} glow={on} small>
            <Motes x={x} y={360} w={w} h={h - 60} t={t} color={CELL[cell].color} n={10} seed={i} />
            <Spark x={x + w / 2} y={480} r={28} t={t + i} k={sparks} color={CELL[cell].color} />
          </Chamber>
        );
      })}
      <Plate x={1080} y={760} text="не все шесть сразу · скорее соус, чем рецепт" size={36} k={soft} bg="#fff" />
    </g>
  );
};

// ── Заставка камеры: большая камера, предмет собирается из точек ──
export const ChamberScene: React.FC<VisualProps<P & { cell: CellId; icon: string }>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const c = CELL[p.cell];
  const w = 780;
  const h = 640;
  const x = a.cx - w / 2;
  const y = 130;
  const pts = pic(`icon-${p.icon}`, PICS[p.icon], a.cx, y + 360, 2.3, 12);
  const k = ramp(t, 0.6, 1.6);
  return (
    <g>
      <Chamber cell={p.cell} x={x} y={y} w={w} h={h} k={ramp(t, 0, 0.6)} glow={0.5 + 0.5 * Math.sin(t * 2)}>
        <Motes x={x} y={y + 70} w={w} h={h - 70} t={t} color={c.color} n={30} seed={c.n} />
        <Swarm pts={pts} k={k} t={t} r={5.4} from="center" />
      </Chamber>
      <Txt x={a.cx} y={y + h + 80} size={44} weight={900} color={c.deep} opacity={ramp(t, 1, 0.6)}>
        {`Камера ${c.n}`}
      </Txt>
    </g>
  );
};

// неиспользуемый в сценах помощник оставлен для обложек: кольцо камер
export const ringOf = (n: number, r: number) => Array.from({ length: n }, (_, i) => ({ x: Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * r, y: Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * r }));
export const easeIn = ease;

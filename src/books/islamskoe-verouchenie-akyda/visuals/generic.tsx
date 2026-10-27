// Общие схемы фильма: заставка части, карточки с иконками, колонки мнений школ,
// круги понятий, лестница ступеней, карточка цитаты. Без людей и без арабского текста.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { OL, Star8 } from "./draw";
import { Icon } from "./icons";
import { Panel, Pop, Tag, Txt, at, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// перенос строки по словам
export const wrap = (text: string, max: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out.join("\n");
};

// маленькая подпись страницы книги
export const PageTag: React.FC<{ x: number; y: number; text: string; dark?: boolean; k?: number }> = ({ x, y, text, dark, k = 1 }) => {
  if (k <= 0) return null;
  const w = text.length * 15 + 40;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp01(k)}>
      <rect x={-w / 2} y={-22} width={w} height={40} rx={20} fill={dark ? "rgba(255,255,255,0.14)" : "rgba(36,50,74,0.08)"} />
      <Txt x={0} y={7} size={24} weight={700} color={dark ? "#e8ecf8" : C.inkSoft}>
        {text}
      </Txt>
    </g>
  );
};

// карточка цитаты книги: текст, источник
export const QuoteCard: React.FC<{ x: number; y: number; w: number; text: string; by?: string; k: number; size?: number; dark?: boolean }> = ({ x, y, w, text, by, k, size = 40, dark }) => {
  if (k <= 0.001) return null;
  const lines = wrap(text, Math.round((w - 80) / (size * 0.54)));
  const n = lines.split("\n").length;
  const h = n * size * 1.18 + (by ? 110 : 70);
  return (
    <g transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * k})`} opacity={clamp01(k * 1.4)}>
      <Panel x={-w / 2} y={-h / 2} w={w} h={h} fill={dark ? "#1d2b52" : "#fffaf0"} stroke={C.gold} r={28} />
      <circle cx={-w / 2 + 6} cy={-h / 2 + 6} r={34} fill={C.gold} stroke={OL} strokeWidth={4} />
      <Txt x={-w / 2 + 6} y={-h / 2 + 34} size={64} weight={900} color={OL} family={SERIF}>
        «
      </Txt>
      <Txt x={0} y={-h / 2 + 35 + size} size={size} weight={700} family={SERIF} color={dark ? "#fff4d0" : C.ink}>
        {lines}
      </Txt>
      {by && (
        <Txt x={0} y={h / 2 - 32} size={26} weight={800} color={dark ? C.goldSoft : C.terracotta}>
          {by}
        </Txt>
      )}
    </g>
  );
};

// ─────────────── заставка части ───────────────
const NUM = ["", "ПЕРВАЯ", "ВТОРАЯ", "ТРЕТЬЯ", "ЧЕТВЁРТАЯ", "ПЯТАЯ", "ШЕСТАЯ", "СЕДЬМАЯ", "ВОСЬМАЯ", "ДЕВЯТАЯ", "ИТОГИ"];
export const Chapter: React.FC<VisualProps<{ n: number; label: string; sub?: string }>> = (c) => {
  const { t, p } = c;
  const k = pop(t, 0.1);
  const line = ramp(t, 0.35, 0.8);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#14213d" opacity={0.92} />
      <g transform={`translate(960 470) rotate(${t * 6})`} opacity={0.2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30}) translate(0 -330)`}>
            <Star8 x={0} y={0} r={60} fill="none" stroke={C.gold} />
          </g>
        ))}
        <Star8 x={0} y={0} r={250} fill="none" stroke={C.gold} />
      </g>
      <g transform={`translate(960 470) scale(${0.8 + 0.2 * k})`} opacity={clamp01(k * 1.5)}>
        <Star8 x={0} y={-190} r={42} fill={C.gold} rot={t * 30} />
        <Txt x={0} y={-90} size={40} weight={800} color={C.goldSoft} family={HEAVY}>
          {p.n >= 10 ? "В ЗАВЕРШЕНИЕ" : `ЧАСТЬ ${NUM[p.n] ?? p.n}`}
        </Txt>
        <Txt x={0} y={30} size={p.label.length > 18 ? 88 : 104} weight={700} family={SERIF} color="#fff4d0">
          {p.label}
        </Txt>
        <rect x={-360 * line} y={70} width={720 * line} height={6} rx={3} fill={C.gold} />
        {p.sub && (
          <Txt x={0} y={140} size={32} weight={700} color="#c9d3ee">
            {`«Исламское вероучение» · ${p.sub}`}
          </Txt>
        )}
      </g>
    </g>
  );
};

// ─────────────── карточки с иконками ───────────────
type CardItem = { icon: string; text: string; sub?: string; at: number };
const CARD_COLORS = [C.goldSoft, C.tealSoft, "#ffd0c2", "#d9f0c8", "#e6dcff"];
export const Cards: React.FC<VisualProps<{ title?: string; items: CardItem[]; footer?: string; page?: string; dark?: boolean }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const n = p.items.length;
  const w = n >= 5 ? 236 : n === 4 ? 280 : 330;
  const gap = n >= 5 ? 20 : 26;
  const total = n * w + (n - 1) * gap;
  const title = pop(t, 0.2);
  const ink = p.dark ? "#fff4d0" : C.ink;
  return (
    <g>
      {title > 0 && p.title && (
        <g transform={`translate(${x} 165) scale(${title})`}>
          <Txt x={0} y={0} size={58} weight={900} family={HEAVY} color={ink}>
            {p.title}
          </Txt>
        </g>
      )}
      {p.page && <PageTag x={x} y={p.title ? 222 : 170} text={p.page} dark={p.dark} k={ramp(t, 0.4, 0.5)} />}
      {p.items.map((it, i) => {
        const cx = x - total / 2 + w / 2 + i * (w + gap);
        const k = pop(t, at(c, it.at) + 0.05);
        const lines = wrap(it.text, n >= 5 ? 11 : n === 4 ? 13 : 16);
        const nl = lines.split("\n").length;
        // карточка «говорит», пока звучит её слово (после появления), — лёгкий подъём
        const lift = Math.sin(clamp01((t - at(c, it.at)) / 0.6) * Math.PI) * 14;
        return (
          <g key={i} transform={`translate(${cx} ${530 + wob(t, i, 4) - lift}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-w / 2} y={-200} w={w} h={400} fill={p.dark ? "#22325e" : "#fffaf0"} r={30} stroke={p.dark ? "#3e5596" : undefined} />
            <g transform="translate(0 -95)">
              <Icon name={it.icon} r={66} t={t} color={CARD_COLORS[i % 5]} />
            </g>
            <Txt x={0} y={nl > 1 ? 34 : 50} size={Math.min(n >= 5 ? 30 : 36, Math.round((w - 24) / (Math.max(...lines.split("\n").map((l) => l.length)) * 0.6)))} weight={900} color={ink}>
              {lines}
            </Txt>
            {it.sub && (
              <Txt x={0} y={160} size={n >= 5 ? 26 : 28} weight={800} color={p.dark ? C.goldSoft : C.terracotta}>
                {it.sub}
              </Txt>
            )}
          </g>
        );
      })}
      {p.footer && (
        <Pop t={t} at={at(c, Math.max(0, c.beats.length - 1))} x={x} y={800}>
          <Tag x={0} y={0} text={p.footer} size={30} color={C.goldSoft} />
        </Pop>
      )}
    </g>
  );
};

// ─────────────── колонки: мнения школ, два пути ───────────────
const TONE: Record<string, string> = { red: "#ffb4a8", gray: "#d7dbe6", green: "#b9e6c6", blue: "#bfe0f7", gold: C.goldSoft, teal: C.tealSoft };
type Col = { h: string; t: string; tone?: string };
export const Columns: React.FC<VisualProps<{ cols: Col[]; foot?: string; page?: string; title?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const n = p.cols.length;
  const w = n === 2 ? 520 : 380;
  const gap = 40;
  const total = n * w + (n - 1) * gap;
  // колонки появляются по ходу речи: первая с первой репликой, остальные — по долям речи
  const appear = (i: number) => {
    if (c.beats.length >= n) return at(c, i);
    const span = c.beats.length;
    return at(c, (i / n) * span + 0.15);
  };
  return (
    <g>
      {p.page && <PageTag x={x} y={170} text={p.page} k={ramp(t, 0.3, 0.5)} />}
      {p.title && (
        <Txt x={x} y={250} size={50} weight={900} family={HEAVY}>
          {p.title}
        </Txt>
      )}
      {p.cols.map((col, i) => {
        const cx = x - total / 2 + w / 2 + i * (w + gap);
        const k = pop(t, appear(i));
        const body = wrap(col.t, n === 2 ? 20 : 15);
        const nl = body.split("\n").length;
        return (
          <g key={i} transform={`translate(${cx} ${510 + wob(t, i, 3)}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-w / 2} y={-220} w={w} h={440} fill="#fffaf0" r={34} />
            <rect x={-w / 2} y={-220} width={w} height={110} rx={34} fill={TONE[col.tone ?? "gold"]} />
            <rect x={-w / 2} y={-150} width={w} height={40} fill={TONE[col.tone ?? "gold"]} />
            <Txt x={0} y={-150} size={Math.min(n === 2 ? 44 : 40, Math.round((w - 40) / (col.h.length * 0.62)))} weight={900} family={HEAVY}>
              {col.h}
            </Txt>
            <Txt x={0} y={40 - (nl - 1) * 26} size={n === 2 ? 42 : 38} weight={800} color={C.ink}>
              {body}
            </Txt>
          </g>
        );
      })}
      {p.foot && (
        <Pop t={t} at={at(c, Math.max(0, c.beats.length - 1)) + 0.4} x={x} y={800}>
          <Tag x={0} y={0} text={p.foot} size={34} color={C.goldSoft} />
        </Pop>
      )}
    </g>
  );
};

// ─────────────── круги понятий (рядом или вложенные) ───────────────
export const Circles: React.FC<VisualProps<{ items: string[]; subs?: string[]; nested?: boolean; page?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const fills = ["#bfe0f7", "#b9e6c6", "#ffe08a"];
  if (p.nested) {
    // внешний круг — первое понятие, внутренний — второе
    const k1 = pop(t, at(c, 2));
    const k2 = pop(t, at(c, 2.45));
    return (
      <g>
        {p.page && <PageTag x={x} y={170} text={p.page} k={ramp(t, 0.3, 0.5)} />}
        <g transform={`translate(${x} 540) scale(${k1})`} opacity={clamp01(k1 * 2)}>
          <circle r={290} fill={fills[0]} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-205} size={46} weight={900} family={HEAVY}>
            {p.items[0]}
          </Txt>
          {p.subs?.[0] && (
            <Txt x={0} y={-160} size={30} weight={700} color={C.inkSoft}>
              {p.subs[0]}
            </Txt>
          )}
        </g>
        <g transform={`translate(${x} 620) scale(${k2})`} opacity={clamp01(k2 * 2)}>
          <circle r={160} fill={fills[2]} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-20} size={44} weight={900} family={HEAVY}>
            {p.items[1]}
          </Txt>
          {p.subs?.[1] && (
            <Txt x={0} y={30} size={28} weight={700} color={C.inkSoft}>
              {wrap(p.subs[1], 18)}
            </Txt>
          )}
        </g>
        {/* число пророков — подпись над кругами в начале сцены */}
        <Pop t={t} at={at(c, 0.3)} x={x} y={200}>
          <Tag x={0} y={0} text="124 000 · в Коране по имени — 25" size={34} color="#fff4d0" />
        </Pop>
      </g>
    );
  }
  const n = p.items.length;
  const r = 205;
  const step = 330;
  return (
    <g>
      {p.page && <PageTag x={x} y={170} text={p.page} k={ramp(t, 0.3, 0.5)} />}
      {p.items.map((it, i) => {
        const cx = x + (i - (n - 1) / 2) * step;
        const k = pop(t, at(c, 1 + (i * 0.33)));
        return (
          <g key={i} transform={`translate(${cx} ${500 + wob(t, i, 4)}) scale(${k})`} opacity={clamp01(k * 2) * 0.96}>
            <circle r={r} fill={fills[i % 3]} stroke={OL} strokeWidth={6} opacity={0.92} />
            <Txt x={0} y={-10} size={58} weight={900} family={HEAVY}>
              {it}
            </Txt>
            {p.subs?.[i] && (
              <Txt x={0} y={52} size={28} weight={800} color={C.inkSoft}>
                {wrap(p.subs[i], 16)}
              </Txt>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── лестница ступеней ───────────────
export const Ladder: React.FC<VisualProps<{ steps: string[]; terms?: string[]; top?: string; page?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const n = p.steps.length;
  const base = at(c, Math.max(0, c.beats.length - 1));
  const topK = pop(t, at(c, 1));
  return (
    <g>
      {p.page && <PageTag x={x} y={170} text={p.page} k={ramp(t, 0.3, 0.5)} />}
      {p.top && (
        <g transform={`translate(${x} 260) scale(${topK})`} opacity={clamp01(topK * 2)}>
          <Tag x={0} y={0} text={p.top} size={44} color={C.goldSoft} />
        </g>
      )}
      {p.steps.map((s, i) => {
        const k = pop(t, base + 0.4 + i * 0.7);
        const sx = x - 420 + i * 420;
        const sy = 760 - i * 130;
        const glow = i === n - 1 ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
        return (
          <g key={i} transform={`translate(${sx} ${sy}) scale(${k})`} opacity={clamp01(k * 2)}>
            <rect x={-190} y={-20} width={380} height={80} rx={14} fill={["#d9f0c8", "#bfe0f7", "#ffe08a"][i % 3]} stroke={OL} strokeWidth={5} />
            {glow > 0 && <rect x={-200} y={-30} width={400} height={100} rx={18} fill="none" stroke={C.gold} strokeWidth={6} opacity={glow} />}
            <Txt x={0} y={33} size={30} weight={900}>
              {s}
            </Txt>
            {p.terms?.[i] && (
              <Txt x={0} y={-45} size={28} weight={800} color={C.terracotta}>
                {p.terms[i]}
              </Txt>
            )}
          </g>
        );
      })}
    </g>
  );
};

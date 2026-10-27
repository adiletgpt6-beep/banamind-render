// Кинетические субтитры живых роликов BalaGo (без сплошной плашки).
// Речь делится на короткие смысловые группы (2–5 слов, иногда одно ударное
// слово), каждая со своей зоной в кадре и своим входом. Слова внутри группы
// появляются в момент произнесения; ключевые — жёлтым. Читаемость — за счёт
// тёмной обводки, мягкой тени и размытого «ореола» за блоком, а не плашки.
// Раскладка задаётся вручную для каждого ролика (по кадрам и графике плана).
import { fontFamily } from "../fonts";
import type { LiveWord } from "./sync";
import { easeInOut, easeOut, ramp, useT } from "./sync";
import { LIVE_COLORS as C } from "./theme";

export type CaptionAnim = "pop" | "rise" | "slide-left" | "slide-right";

export type CaptionGroup = {
  readonly from: number; // индекс первого слова (в общем массиве слов)
  readonly to: number; // индекс последнего слова (включительно)
  readonly x: number; // опорная точка блока, px кадра 1080×1920
  readonly y: number; // центр блока по вертикали
  readonly align: "left" | "center" | "right"; // x — левый край / центр / правый край
  readonly anim: CaptionAnim;
  readonly accent?: readonly number[]; // индексы слов жёлтым
  readonly breakAfter?: readonly number[]; // перенос строки после слова
  readonly size?: number;
  readonly maxWidth?: number;
  readonly endAt?: number; // принудительный конец (сек), например под заголовок графики
};

// Окно группы: от её первого слова до первого слова следующей (предыдущая
// гаснет за 0,12 с до него) — без пустых пауз и без наложения двух групп.
const LEAD = 0.06;
const windowOf = (words: readonly LiveWord[], groups: readonly CaptionGroup[], i: number) => {
  const g = groups[i];
  const start = words[g.from].start - LEAD;
  const next = groups[i + 1] ? words[groups[i + 1].from].start - LEAD : Infinity;
  const end = Math.min(g.endAt ?? Infinity, next, words[g.to].end + 0.8);
  return { start, end };
};

export const KineticCaptions: React.FC<{
  readonly words: readonly LiveWord[];
  readonly groups: readonly CaptionGroup[];
}> = ({ words, groups }) => {
  const t = useT();
  const idx = groups.findIndex((_, i) => {
    const w = windowOf(words, groups, i);
    return t >= w.start && t < w.end;
  });
  if (idx < 0) return null;
  const g = groups[idx];
  const { start, end } = windowOf(words, groups, idx);
  const a = ramp(t, start, 0.2, easeOut);
  const out = ramp(t, end - 0.12, 0.12, easeInOut);
  const size = g.size ?? 64;
  const enter =
    g.anim === "pop"
      ? `scale(${0.82 + 0.18 * a})`
      : g.anim === "rise"
        ? `translateY(${(1 - a) * 28}px)`
        : g.anim === "slide-left"
          ? `translateX(${(1 - a) * -46}px)`
          : `translateX(${(1 - a) * 46}px)`;
  const anchor = g.align === "left" ? "0%" : g.align === "center" ? "-50%" : "-100%";
  const lines: number[][] = [[]];
  for (let i = g.from; i <= g.to; i++) {
    lines[lines.length - 1].push(i);
    if (g.breakAfter?.includes(i) && i < g.to) lines.push([]);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: g.x,
        top: g.y,
        transform: `translate(${anchor}, -50%) ${enter} translateY(${-out * 14}px)`,
        transformOrigin: g.align === "left" ? "0% 50%" : g.align === "right" ? "100% 50%" : "50% 50%",
        opacity: a * (1 - out),
        maxWidth: g.maxWidth ?? 860,
        textAlign: g.align,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: 0.2,
      }}
    >
      {/* мягкий тёмный ореол вместо плашки */}
      <div
        style={{
          position: "absolute",
          inset: `-${size * 0.55}px -${size * 0.7}px`,
          background: "radial-gradient(ellipse at center, rgba(6,14,38,0.42) 0%, rgba(6,14,38,0.22) 45%, rgba(6,14,38,0) 72%)",
          zIndex: -1,
        }}
      />
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap" }}>
          {line.map((wi, k) => {
            const w = words[wi];
            const on = ramp(t, w.start - 0.06, 0.14, easeOut);
            const accent = g.accent?.includes(wi);
            const now = t >= w.start - 0.06 && t <= w.end + 0.1;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: k < line.length - 1 ? size * 0.26 : 0,
                  color: accent ? C.yellow : C.white,
                  opacity: on, // слово видно только с момента произнесения (место зарезервировано)
                  transform: `translateY(${(1 - on) * 10}px) scale(${accent && now ? 1.06 : 1})`,
                  WebkitTextStroke: `${size * 0.18}px ${C.navyInk}`,
                  paintOrder: "stroke fill",
                  textShadow: "0 6px 22px rgba(0,0,0,0.45)",
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

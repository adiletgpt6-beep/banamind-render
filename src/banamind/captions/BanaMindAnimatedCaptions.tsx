// Анимированные титры BanaMind — один компонент для всех фильмов канала.
//
// Приёмы (все синхронны с реальными таймкодами слов, см. build.ts):
//  1. появление по словам — слово проявляется и чуть поднимается в момент произнесения;
//  2. мягкое увеличение — важное слово слегка растёт, пока звучит, и возвращается;
//  3. цветовое выделение — белый текст, важные слова жёлтым, особо значимые — акцентом;
//  4. slide + fade — плашка и короткие фразы мягко въезжают снизу;
//  5. кинетическая типографика — редкое смысловое слово крупно, с аккуратным «выстрелом».
// Читаемость важнее эффектов: ≤ 2 строк, место под слова зарезервировано заранее
// (текст не прыгает), титры не перекрываются, без мерцаний.
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionCue, CaptionWord } from "./build.ts";
import { CAPTION_STYLE, type CaptionStyle } from "./style.ts";

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const findCue = (cues: CaptionCue[], t: number): CaptionCue | null => {
  let lo = 0;
  let hi = cues.length - 1;
  if (hi < 0) return null;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cues[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  const c = cues[lo];
  return c && t >= c.start && t <= c.end ? c : null;
};

const Word: React.FC<{ w: CaptionWord; t: number; mode: CaptionCue["mode"]; st: CaptionStyle; accent: string }> = ({ w, t, mode, st, accent }) => {
  const s = w.start - st.lead;
  let opacity = 1;
  let y = 0;
  let scale = 1;
  if (w.emph === 3) {
    // кинетика: появляется из меньшего масштаба с лёгким перелётом
    opacity = interpolate(t, [s, s + 0.1], [0, 1], clamp);
    scale = interpolate(t, [s, s + st.kineticDur * 0.6, s + st.kineticDur], [st.kineticFrom, st.kineticOvershoot, 1], { ...clamp, easing: easeOut });
  } else if (mode === "words") {
    const k = interpolate(t, [s, s + st.wordIn], [0, 1], { ...clamp, easing: easeOut });
    opacity = k;
    y = (1 - k) * st.wordRise;
  }
  if (w.pop) {
    const peakEnd = Math.max(w.start + st.popIn + 0.05, w.end);
    const k = interpolate(t, [s, w.start + st.popIn, peakEnd, peakEnd + st.popOut], [0, 1, 1, 0], { ...clamp, easing: easeInOut });
    scale *= 1 + (st.pop - 1) * k;
  }
  // место под увеличение зарезервировано заранее: слово не наезжает на соседей
  const room = w.pop ? ((st.pop - 1) / 2) * w.text.length * 0.6 : 0;
  const color = w.emph === 1 || w.emph === 3 ? st.highlight : w.emph === 2 ? accent : st.text;
  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`,
        transformOrigin: "50% 70%",
        color,
        fontSize: w.emph === 3 ? `${st.kineticSize}em` : undefined,
        textTransform: w.emph === 3 ? "uppercase" : undefined,
        letterSpacing: w.emph === 3 ? "0.01em" : undefined,
        textShadow: w.emph === 3 ? `${st.textShadow}, 0 0 22px rgba(255,210,63,0.35)` : st.textShadow,
        marginLeft: room ? `${room.toFixed(3)}em` : undefined,
        marginRight: `${(st.wordGap + room).toFixed(3)}em`,
        willChange: "transform, opacity",
      }}
    >
      {w.text}
    </span>
  );
};

export const BanaMindAnimatedCaptions: React.FC<{
  cues: CaptionCue[];
  shift?: number; // сдвиг по горизонтали (px), чтобы не закрывать ведущего и схемы
  bottom?: number | ((c: CaptionCue) => number | undefined); // отступ снизу (px), можно для каждого титра
  accent?: string; // акцент книги
  style?: Partial<CaptionStyle>;
}> = ({ cues, shift = 0, bottom, accent, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = { ...CAPTION_STYLE, ...style };
  const t = frame / fps;
  const c = findCue(cues, t);
  if (!c) return null;
  // весь титр уходит вместе: прозрачность и лёгкий подъём
  const outK = interpolate(t, [c.end - st.out, c.end], [0, 1], { ...clamp, easing: easeInOut });
  const [pt, pr, pb, pl] = st.platePad;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: (typeof bottom === "function" ? bottom(c) : bottom) ?? st.bottom,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: st.rowGap,
        transform: `translate(${shift}px, ${(-outK * st.outRise).toFixed(2)}px)`,
        opacity: 1 - outK,
        pointerEvents: "none",
        fontFamily: st.font,
        fontWeight: st.weight,
        fontSize: st.size,
        lineHeight: st.lineHeight,
        color: st.text,
      }}
    >
      {c.rows.map((row, i) => {
        // у каждой строки своя плашка: въезжает снизу (slide + fade), когда звучит её первое слово;
        // место под строку зарезервировано заранее, поэтому текст не прыгает
        const rs = i === 0 ? c.start : Math.max(c.start, row[0].start - st.lead);
        const inK = interpolate(t, [rs, rs + st.plateIn], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div
            key={i}
            style={{
              maxWidth: st.maxWidth,
              whiteSpace: "nowrap",
              padding: `${pt}px ${pr}px ${pb}px ${pl}px`,
              borderRadius: st.plateRadius,
              background: st.plate,
              boxShadow: "0 8px 24px rgba(10,14,25,0.25)",
              opacity: inK,
              transform: `translateY(${((1 - inK) * st.plateRise).toFixed(2)}px)`,
            }}
          >
            {/* последний отступ компенсируем — строка остаётся по центру */}
            <div style={{ marginRight: `-${st.wordGap}em` }}>
              {row.map((w, j) => (
                <Word key={j} w={w} t={t} mode={c.mode} st={st} accent={accent ?? st.accent} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

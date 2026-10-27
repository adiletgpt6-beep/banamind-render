// Субтитры LIVE-005 — «ночная журнальная типографика» (свой стиль, не LIVE-004):
// • две степени шрифта в одной группе: связующие слова — Montserrat Medium,
//   смысловые — крупный Montserrat Black Italic (белый или фирменный жёлтый);
// • строка «выезжает» из-под невидимой маски в момент произнесения слова —
//   без всплывающих коробок и прыжков; уход — вверх за маску, быстро;
// • текущее слово отмечено тонкой жёлтой линией-прогрессом по длительности слова;
// • без плашки и без толстой обводки: мягкая тень + тонкий тёмный контур;
// • место — по сцене (своя зона на план: небо, бок, нижняя треть), а не по слову.
// Те же строки (EdLines) используют синхронные графические вставки ролика.
import { fontFamily } from "../../fonts";
import { easeInOut, easeOut, ramp } from "../../live/sync";
import type { LiveWord } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { display } from "./fonts";
import type { EdGroup } from "./layout";
import { BIG, EXIT, GAP, LEAD, LINE, SMALL, groupWindow, linesOf, sizeOf } from "./layout";

const shadow = "0 4px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.7)";

// Строки группы: каждое слово выезжает из-под маски строки в момент речи.
export const EdLines: React.FC<{
  readonly t: number;
  readonly words: readonly LiveWord[];
  readonly g: EdGroup;
  readonly end: number; // начало ухода всей группы
}> = ({ t, words, g, end }) => {
  const out = ramp(t, end - EXIT, EXIT, easeInOut);
  return (
    <>
      {linesOf(g).map((line, li) => {
        const size = Math.max(...line.map((i) => sizeOf(g, i)));
        const lineOut = ramp(t, end - EXIT + li * 0.03, EXIT - 0.03, easeInOut);
        const struck = g.strike && line.every((i) => g.strike?.words.includes(i)) ? ramp(t, g.strike.at, 0.3, easeOut) : 0;
        return (
          <div
            key={li}
            style={{
              position: "relative",
              // маска строки (с запасом под тень и наклон курсива)
              overflow: "hidden",
              padding: `${size * 0.1}px ${size * 0.2}px ${size * 0.16}px`,
              margin: `-${size * 0.1}px -${size * 0.2}px -${size * 0.16}px`,
              height: size * LINE + size * 0.26,
              display: "flex",
              alignItems: "baseline",
              justifyContent: g.align === "left" ? "flex-start" : g.align === "center" ? "center" : "flex-end",
              gap: GAP,
              whiteSpace: "nowrap",
            }}
          >
            {/* перечёркивание строки целиком (смысл «не один раз») */}
            {struck > 0 ? (
              <span
                style={{
                  position: "absolute",
                  zIndex: 2,
                  left: size * 0.12,
                  right: size * 0.12,
                  top: "50%",
                  height: Math.max(7, size * 0.1),
                  borderRadius: 6,
                  background: C.red,
                  transform: `translateY(${-size * 0.02 + lineOut * -size * 1.2}px) scaleX(${struck}) rotate(-3deg)`,
                  transformOrigin: "0% 50%",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
                }}
              />
            ) : null}
            {line.map((wi) => {
              const w = words[wi];
              const big = g.big?.includes(wi) ?? false;
              const fs = sizeOf(g, wi);
              const on = ramp(t, w.start - LEAD, 0.24, easeOut);
              const accent = g.accent?.includes(wi);
              const progress = ramp(t, w.start - 0.02, Math.max(0.12, w.end - w.start), (x) => x);
              const fade = 1 - ramp(t, w.end + 0.25, 0.25, easeInOut);
              const y = (1 - on) * 105 + lineOut * -150;
              return (
                <span
                  key={wi}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    transform: `translateY(${y}%)`,
                    opacity: on * (1 - out * 0.4),
                    fontFamily: big ? display : `${display}, ${fontFamily}`,
                    fontWeight: big ? 900 : 700,
                    fontStyle: big ? "italic" : "normal",
                    fontSize: fs,
                    lineHeight: 1,
                    letterSpacing: big ? -1 : 0.3,
                    textTransform: big && !g.keepCase?.includes(wi) ? "uppercase" : "none",
                    color: accent ? C.yellow : C.white,
                    WebkitTextStroke: `${big ? 2.5 : 1.6}px rgba(6,14,38,0.75)`,
                    paintOrder: "stroke fill",
                    textShadow: shadow,
                  }}
                >
                  {w.text}
                  {/* линия-прогресс под текущим словом */}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: -fs * 0.1,
                      height: Math.max(4, fs * 0.07),
                      width: "100%",
                      borderRadius: 4,
                      background: C.yellow,
                      transform: `scaleX(${progress})`,
                      transformOrigin: "0% 50%",
                      // при уходе строки линия гаснет первой (не висит без слова)
                      opacity: progress > 0 ? fade * 0.95 * Math.max(0, 1 - lineOut * 4) : 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
                    }}
                  />
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export const EditorialCaptions: React.FC<{
  readonly t: number;
  readonly words: readonly LiveWord[];
  readonly groups: readonly EdGroup[];
  readonly cuts: readonly number[];
}> = ({ t, words, groups, cuts }) => (
  <>
    {groups.map((g, i) => {
      const { start, end } = groupWindow(words, groups, i, cuts);
      if (t < start || t >= end) return null;
      const anchor = g.align === "left" ? "0%" : g.align === "center" ? "-50%" : "-100%";
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: g.x,
            top: g.y,
            transform: `translate(${anchor}, -50%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: g.align === "left" ? "flex-start" : g.align === "center" ? "center" : "flex-end",
          }}
        >
          {g.haze ? (
            <div
              style={{
                position: "absolute",
                inset: "-60px -90px",
                background: `radial-gradient(ellipse at center, rgba(6,14,38,${g.haze}) 0%, rgba(6,14,38,${g.haze * 0.6}) 45%, rgba(6,14,38,0) 72%)`,
                filter: "blur(14px)",
                opacity: ramp(t, start, 0.25) * (1 - ramp(t, end - EXIT, EXIT)),
              }}
            />
          ) : null}
          {g.brackets
            ? [-1, 1].map((side) => {
                const show = ramp(t, start, 0.25, easeOut) * (1 - ramp(t, end - EXIT, EXIT, easeInOut));
                const squeeze = ramp(t, g.brackets?.at ?? 0, 0.4, easeInOut);
                return (
                  <div
                    key={side}
                    style={{
                      position: "absolute",
                      top: "6%",
                      bottom: "6%",
                      width: 7,
                      borderRadius: 4,
                      background: C.yellow,
                      boxShadow: "0 0 14px rgba(255,201,14,0.5), 0 2px 6px rgba(0,0,0,0.5)",
                      [side < 0 ? "left" : "right"]: -46,
                      opacity: show,
                      transform: `translateX(${side * -(1 - show) * 60 + side * -squeeze * 24}px) scaleY(${0.4 + 0.6 * show})`,
                    }}
                  />
                );
              })
            : null}
          <EdLines t={t} words={words} g={g} end={end} />
        </div>
      );
    })}
  </>
);

export { BIG, SMALL };

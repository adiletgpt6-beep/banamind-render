// Экранные надписи в координатах кадра (1080×1920). Безопасные зоны
// Reels/Shorts: сверху ≥ 220 px, снизу ≥ 400 px, справа ≥ 150 px —
// надписи ролика стоят внутри них.
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut } from "../anim";
import { C } from "../palette";

// Стрелка «→» рисуется сама (в шрифте Nunito её нет — без подмены шрифта).
export const ArrowGlyph: React.FC<{ readonly color?: string }> = ({ color = "currentColor" }) => (
  <svg width="0.9em" height="0.6em" viewBox="0 0 30 20" style={{ display: "inline-block", verticalAlign: "0.05em", margin: "0 0.12em" }}>
    <path d="M2 10 H24 M17 3 L25 10 L17 17" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
export const Rich: React.FC<{ readonly text: string }> = ({ text }) => (
  <>
    {text.split("→").map((part, i) => (
      <span key={i}>
        {i ? <ArrowGlyph /> : null}
        {part}
      </span>
    ))}
  </>
);

const fadeOut = (f: number, out?: number, d = 10) => (out === undefined ? 1 : 1 - easeInOut((f - out) / d));

// Тёмно-синяя плашка-заголовок с жёлтой точкой: название, «Шарттуу мисал».
export const Badge: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly text: string;
  readonly top: number;
  readonly size?: number;
  readonly tone?: "navy" | "yellow" | "white";
  readonly instant?: boolean;
}> = ({ f, at, out, text, top, size = 46, tone = "navy", instant }) => {
  const a = instant ? (f >= at ? 1 : 0) * fadeOut(f, out) : appear(f, at, 10) * fadeOut(f, out);
  if (a <= 0.001) return null;
  const bg = tone === "navy" ? C.navy : tone === "yellow" ? C.yellow : C.white;
  const fg = tone === "navy" ? C.white : C.navy;
  const dot = tone === "yellow" ? C.navy : C.yellow;
  return (
    <div style={{ position: "absolute", left: 60, right: 150, top, display: "flex", justifyContent: "center", opacity: a }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: `${size * 0.32}px ${size * 0.7}px`,
          borderRadius: 999,
          backgroundColor: bg,
          color: fg,
          fontFamily,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: 1,
          boxShadow: "0 10px 30px rgba(20,40,90,0.22)",
          transform: instant ? undefined : `translateY(${(1 - appear(f, at, 10)) * -16}px)`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: size * 0.34, height: size * 0.34, borderRadius: 99, backgroundColor: dot, flex: "none" }} />
        <Rich text={text} />
      </div>
    </div>
  );
};

// Светлая карточка-подпись (тёмно-синий текст, жёлтая полоска слева).
export const Caption: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly text: string;
  readonly top: number;
  readonly size?: number;
  readonly accent?: string;
  readonly align?: "center" | "left";
  readonly sub?: string;
}> = ({ f, at, out, text, top, size = 50, accent = C.yellow, align = "center", sub }) => {
  const a = appear(f, at, 12) * fadeOut(f, out);
  if (a <= 0.001) return null;
  const rise = (1 - appear(f, at, 12)) * 22;
  return (
    <div style={{ position: "absolute", left: 60, right: 150, top, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", opacity: a }}>
      <div
        style={{
          maxWidth: 870,
          padding: `${size * 0.36}px ${size * 0.6}px ${size * 0.36}px ${size * 0.6 + 10}px`,
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderLeft: `12px solid ${accent}`,
          color: C.navy,
          fontFamily,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.18,
          textAlign: "center",
          boxShadow: "0 12px 34px rgba(20,40,90,0.18)",
          transform: `translateY(${rise}px)`,
        }}
      >
        <Rich text={text} />
        {sub ? <div style={{ fontSize: size * 0.62, fontWeight: 800, color: C.ink, marginTop: 8 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

// Подсветка «появления» для иконок: 0…1.
export const fadeIn = (f: number, at: number, d = 10) => clamp((f - at) / d);

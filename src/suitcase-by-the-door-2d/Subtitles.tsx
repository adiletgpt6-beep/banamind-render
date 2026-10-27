// Субтитры (кыргызча) — по всей слышимой речи и точно по фактическим
// таймингам слов озвучки. Стиль референса: светлый жирный текст с тёмной
// обводкой и минимальной тенью, без плашки. Порция — смысловой кусок
// (обычно 3–7 слов, не больше двух строк); служебное слово не остаётся
// одно на строке. Редкое цветовое выделение («үч күндө», «атасы өзү»,
// «алдын ала өтүнмө»). Обычно внизу (нижний край y = 1560); там, где
// снизу важный предмет, — выше (SUB_POS).
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { FONT } from "./kit";
import { clamp, easeOut } from "./rig/motion";
import { SD2_VIDEO, lineById } from "./script";
import type { Sd2Cue } from "./timing";
import { C, SUB } from "./theme";
import { chunkWords, spokenIndex, twoLines } from "./subtitleChunks";

const FPS = SD2_VIDEO.fps;

// Положение субтитров для отдельных реплик: "top" — у верхнего поля,
// число — нижний край блока (y кадра). По умолчанию — SUB.bottomY.
export const SUB_POS: Readonly<Record<string, "top" | number>> = {};

// Выделенные слова (по началу слова, нижний регистр): реплика → слова.
const HIGHLIGHT: Readonly<Record<string, readonly string[]>> = {
  M03: ["үч", "күндө"],
  N09: ["атасы", "өзү"],
  N08: ["алдын", "ала", "өтүнмө"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}-]/gu, "");

// Время начала каждой порции — по словам озвучки (слова файла = слова spoken
// с буквами; spokenIndex пропускает на экране токены без букв и цифр — «—»).
const chunkStarts = (cue: Sd2Cue, text: string, chunks: [number, number][]) => chunks.map(([a]) => cue.words[spokenIndex(text, a)]?.start ?? cue.from);

export const Subtitles: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const started = tl.cues.filter((c) => t >= c.from - 0.08);
  const cue = started[started.length - 1];
  if (!cue || t > cue.to + 0.3) return null;
  const line = lineById(cue.id);
  const words = line.text.split(/\s+/).filter(Boolean);
  const chunks = chunkWords(line.text);
  const starts = chunkStarts(cue, line.text, chunks);
  let idx = 0;
  for (let k = 1; k < chunks.length; k++) if (t >= starts[k] - 0.06) idx = k;
  const [a, b] = chunks[idx];
  const partStart = idx === 0 ? cue.from - 0.08 : starts[idx] - 0.06;
  const appear = easeOut((t - partStart) / 0.12);
  const leave = 1 - easeOut((t - (cue.to + 0.15)) / 0.15);
  const o = clamp(Math.min(appear, leave));
  const hi = HIGHLIGHT[cue.id] ?? [];
  const lines = twoLines(words.slice(a, b));
  const pos = SUB_POS[cue.id];
  const place: React.CSSProperties = pos === "top" ? { top: SUB.topY } : { bottom: 1920 - (typeof pos === "number" ? pos : SUB.bottomY) };
  const text = (stroke: boolean) =>
    lines.map((ln, li) => (
      <div key={li} style={{ whiteSpace: "nowrap" }}>
        {ln.map((w, wi) => {
          const isHi = hi.some((h) => norm(w).startsWith(h));
          return (
            <span key={wi} style={{ color: stroke ? C.ink : isHi ? C.yellow : C.paper }}>
              {wi > 0 ? " " : ""}
              {w}
            </span>
          );
        })}
      </div>
    ));
  const common: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: 54,
    lineHeight: 1.16,
    textAlign: "center",
    letterSpacing: 0.3,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: SUB.x,
        width: SUB.w,
        ...place,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - appear) * 6}px)`,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative" }}>
        {/* тёмная обводка (отдельный слой под текстом) и мягкая тень */}
        <div
          aria-hidden
          style={{
            ...common,
            position: "absolute",
            inset: 0,
            WebkitTextStroke: `10px ${C.ink}`,
            textShadow: "0 4px 8px rgba(23,39,68,0.35)",
          }}
        >
          {text(true)}
        </div>
        <div style={{ ...common, position: "relative" }}>{text(false)}</div>
      </div>
    </div>
  );
};

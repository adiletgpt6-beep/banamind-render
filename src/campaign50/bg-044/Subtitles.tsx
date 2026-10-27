// Субтитры — «игровое окно диалога» (кыргызча): белое окно с пиксельной
// рамкой и жёлтой табличкой говорящего (Оюн диктору / Апа / Диктор).
// Одна реплика за раз; длинная делится на части ≤ 2 строк, части
// сменяются по фактическим таймингам слов озвучки. Уже произнесённые
// слова — тёмно-синие, следующие — бледные (раскладка не прыгает).
// Окно стоит над нижней зоной интерфейса Reels (низ окна — 400 px от
// края кадра) и левее правой колонки кнопок (≥ 150 px справа).
// В финале субтитров нет: там те же слова написаны крупно.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "./anim";
import { useTimeline } from "./context";
import { pixelTextWidth } from "./kit/pixelFont";
import { PixelText } from "./kit/PixelText";
import { C } from "./palette";
import { BG44_SPEAKER, BG44_VIDEO, lineById } from "./script";

const FPS = BG44_VIDEO.fps;
const MAX_CHARS = 30;

// Геометрия окна — сцены держат важное вне этой области.
export const DIALOG = { left: 48, right: 150, bottom: 400, maxHeight: 250 } as const;

// Деление на части ≤ 2 строк: число частей по длине, границы — у конца
// предложения или у слова, ближайшего к равной доле.
const chunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.ceil(text.length / (MAX_CHARS * 2));
  if (n <= 1) return [text];
  const out: string[] = [];
  let from = 0;
  for (let k = 1; k < n; k++) {
    const target = (text.length * k) / n;
    let best = from + 1;
    let bestCost = Infinity;
    let pos = 0;
    for (let i = 0; i < words.length; i++) {
      pos += words[i].length + 1;
      if (i < from || i >= words.length - 1) continue;
      const cost = Math.abs(pos - target) - (/[.!?,:—]$/.test(words[i]) ? 14 : 0);
      if (cost < bestCost) {
        bestCost = cost;
        best = i + 1;
      }
    }
    out.push(words.slice(from, best).join(" "));
    from = best;
  }
  out.push(words.slice(from).join(" "));
  return out;
};

export const Subtitles: React.FC = () => {
  const { cues } = useTimeline();
  const frame = useCurrentFrame();
  const t = (frame + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.15 && t <= c.to + 0.5);
  if (!cue || cue.scene === "cta") return null;
  const line = lineById(cue.id);
  const words = line.text.split(/\s+/).filter(Boolean);
  // слова с буквами/цифрами сопоставляются с таймингами озвучки (тире «—» своего тайминга нет)
  const spoken: number[] = [];
  words.forEach((w, i) => {
    if (/[\p{L}\p{N}]/u.test(w)) spoken.push(i);
  });
  const slot = words.map((_, i) => {
    let k = spoken.findIndex((j) => j >= i);
    if (k < 0) k = spoken.length - 1;
    return k;
  });
  const wt = (i: number) =>
    cue.words.length === spoken.length ? cue.words[slot[i]].start : cue.from + ((cue.to - cue.from) * i) / Math.max(1, words.length);
  const parts = chunks(line.text);
  let wi = 0;
  const startOf = parts.map((p) => {
    const s = wi;
    wi += p.split(/\s+/).filter(Boolean).length;
    return s;
  });
  let idx = 0;
  for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.12) idx = k;
  const a = easeOut((t - (cue.from - 0.15)) / 0.18) * (1 - easeOut((t - (cue.to + 0.32)) / 0.18));
  const rise = (1 - easeOut((t - (cue.from - 0.15)) / 0.22)) * 24;
  const done = t > cue.to + 0.05;
  const name = BG44_SPEAKER[cue.role].toUpperCase();
  const partWords = parts[idx].split(/\s+/).filter(Boolean);
  return (
    <div
      style={{
        position: "absolute",
        left: DIALOG.left,
        right: DIALOG.right,
        bottom: DIALOG.bottom,
        opacity: a,
        translate: `0 ${rise}px`,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* пиксельная тень окна */}
      <div style={{ position: "absolute", left: 10, right: -10, top: 10, bottom: -10, backgroundColor: "rgba(20,40,90,0.22)", clipPath: CORNERS }} />
      <div style={{ position: "relative", backgroundColor: C.navy, padding: 6, clipPath: CORNERS }}>
        <div
          style={{
            backgroundColor: C.white,
            clipPath: CORNERS_IN,
            padding: "34px 34px 26px",
            fontFamily,
            fontSize: 46,
            fontWeight: 800,
            lineHeight: 1.22,
            color: C.navy,
            minHeight: 2 * 46 * 1.22,
          }}
        >
          {partWords.map((w, i) => {
            const gi = startOf[idx] + i;
            const said = t >= wt(gi) - 0.04;
            return (
              <span key={i}>
                {i ? " " : ""}
                <span style={{ whiteSpace: "nowrap", opacity: said ? 1 : 0.3 }}>{w}</span>
              </span>
            );
          })}
        </div>
      </div>
      {/* табличка говорящего */}
      <div style={{ position: "absolute", left: 26, top: -30, height: 56, padding: "0 18px", backgroundColor: C.yellow, border: `5px solid ${C.navy}`, display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", width: nameWidth(name), height: 30 }}>
          <PixelText text={name} px={4} x={0} y={1} color={C.navy} />
        </div>
      </div>
      {/* ▼ — реплика договорена */}
      {done ? (
        <svg width={28} height={20} viewBox="0 0 7 5" shapeRendering="crispEdges" style={{ position: "absolute", right: 30, bottom: 16, translate: `0 ${Math.round(Math.sin(frame / 4) * 2)}px` }}>
          <path d="M0 0h7v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z" fill={C.yellowDeep} />
        </svg>
      ) : null}
    </div>
  );
};

// Ступенчатые («пиксельные») углы окна.
const CORNERS = "polygon(0 12px, 6px 12px, 6px 6px, 12px 6px, 12px 0, calc(100% - 12px) 0, calc(100% - 12px) 6px, calc(100% - 6px) 6px, calc(100% - 6px) 12px, 100% 12px, 100% calc(100% - 12px), calc(100% - 6px) calc(100% - 12px), calc(100% - 6px) calc(100% - 6px), calc(100% - 12px) calc(100% - 6px), calc(100% - 12px) 100%, 12px 100%, 12px calc(100% - 6px), 6px calc(100% - 6px), 6px calc(100% - 12px), 0 calc(100% - 12px))";
const CORNERS_IN = "polygon(0 6px, 6px 6px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px))";

// ширина подписи пиксельным шрифтом (px = 4) с тенью
const nameWidth = (name: string) => pixelTextWidth(name) * 4 + 4;

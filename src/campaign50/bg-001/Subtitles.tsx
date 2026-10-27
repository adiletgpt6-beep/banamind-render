// Субтитры реплик (кыргызча), в том числе диктора — ролик часто смотрят
// без звука. Финальную реплику не дублируем: её смысл уже на экране
// (Бишкек, ссылка в профиле, WhatsApp). Одна реплика за раз, крупно, с хорошим
// контрастом, над нижней зоной интерфейса Instagram (≈ 400 px снизу) и
// ниже лиц в кадре. Длинная реплика делится на строки по словам; строки
// сменяются по фактическим таймингам слов озвучки.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext } from "./context";
import { easeOut } from "./rig/motion";
import { lineById, BG1_VIDEO } from "./script";

const FPS = BG1_VIDEO.fps;
const MAX_CHARS = 34; // символов в строке
const NO_SUBS = new Set(["n05"]);
// Диалог в параллельном экране — у линии раздела, чтобы не закрывать лицо мамы.
const AT_SPLIT = new Set(["s01", "m01"]);
// Мысль мамы (внутренний голос) — курсивом.
const THOUGHT = new Set(["m02"]);

// Деление текста на части ≤ 2 строк: по предложениям, затем по словам.
const chunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (next.length <= MAX_CHARS * 2) cur = next;
    else {
      if (cur) out.push(cur);
      cur = s;
    }
  }
  if (cur) out.push(cur);
  return out;
};

export const Subtitles: React.FC = () => {
  const cues = useContext(CuesContext);
  const t = (useCurrentFrame() + 0.5) / FPS;
  const cue = cues.find((c) => t >= c.from - 0.12 && t <= c.to + 0.45);
  if (!cue || NO_SUBS.has(cue.id)) return null;
  const line = lineById(cue.id);
  const parts = chunks(line.text);
  // какая часть звучит: по словам озвучки (или пропорционально длине)
  const words = line.text.split(/\s+/).filter(Boolean);
  let idx = 0;
  if (parts.length > 1) {
    let wi = 0;
    const startOf = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const wt = (i: number) => cue.words[i]?.start ?? cue.from + ((cue.to - cue.from) * i) / words.length;
    for (let k = 1; k < parts.length; k++) if (t >= wt(startOf[k]) - 0.1) idx = k;
  }
  const a = easeOut((t - (cue.from - 0.12)) / 0.18) * (1 - easeOut((t - (cue.to + 0.3)) / 0.15));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: AT_SPLIT.has(cue.id) ? 985 : 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "16px 30px",
          borderRadius: 26,
          backgroundColor: "rgba(16,24,48,0.78)",
          color: "#FFFFFF",
          fontFamily,
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          opacity: a,
          boxShadow: "0 10px 30px rgba(10,15,30,0.25)",
          fontStyle: THOUGHT.has(cue.id) ? "italic" : "normal",
          
        }}
      >
        {parts[idx]}
      </div>
    </div>
  );
};

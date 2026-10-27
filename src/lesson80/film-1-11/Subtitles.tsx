// Встроенные субтитры (стиль серии LESSON-80: тёмная плашка, Nunito, внизу
// по центру, не более двух строк). Одна реплика за раз; субтитр начинается
// вместе с речью; длинная реплика делится на части по предложениям и
// таймингам слов. Вопрос зрителю (08, 24, 31) остаётся на экране во время
// паузы и гаснет до первого звука ответа — следующий субтитр в паузе не
// появляется. Разбиение общее с SRT (subtitleEvents).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { FPS } from "../core/video";
import { subtitleEvents } from "./subtitleEvents";
import type { L80Timeline } from "./timeline";
import { useMemo } from "react";

export const Subtitles: React.FC<{ readonly tl: L80Timeline }> = ({ tl }) => {
  const t = (useCurrentFrame() + 0.5) / FPS;
  const events = useMemo(() => subtitleEvents(tl), [tl]);
  const e = events.find((x) => t >= x.from && t < x.to);
  if (!e) return null;
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 54, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ maxWidth: 1360, padding: "10px 28px", borderRadius: 16, backgroundColor: "rgba(16,24,48,0.72)", color: "#FFFFFF", fontFamily, fontSize: 42, fontWeight: 700, lineHeight: 1.24, textAlign: "center", whiteSpace: "pre-line" }}>{e.text}</div>
    </div>
  );
};

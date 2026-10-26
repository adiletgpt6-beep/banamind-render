// Вставка на доске: кадр целиком занимает доска с рисунками мелом (по
// порядку объяснения). Спокойное появление, без эффектов.
import { fontFamily } from "../../fonts";
import { clamp } from "../rig/motion";
import { box } from "../shots";

export const BoardInsert: React.FC<{ a: number; children: React.ReactNode; caption?: string }> = ({ a, children, caption }) => {
  const k = clamp(a);
  const scale = 2.45;
  const w = 588 * scale;
  const h = 248 * scale;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F1EADF", opacity: k })}>
      <div style={box({ left: (1920 - w) / 2 - 36, top: 190 - 36, width: w + 72, height: h + 72, borderRadius: 18, backgroundColor: "#C9A67A" })} />
      <div style={box({ left: (1920 - w) / 2 - 16, top: 190 - 16, width: w + 32, height: h + 32, borderRadius: 8, backgroundColor: "#3F6B5C" })} />
      <div style={box({ left: (1920 - w) / 2, top: 190, width: 588, height: 248, transform: `scale(${scale})`, transformOrigin: "0 0" })}>{children}</div>
      <div style={box({ left: (1920 - w) / 2 + 60, top: 190 + h + 44, width: w - 120, height: 16, borderRadius: 6, backgroundColor: "#A8865C" })} />
      {caption ? (
        <div style={box({ left: 0, right: 0, top: 190 + h + 90, textAlign: "center", fontFamily, fontSize: 40, fontWeight: 700, color: "#3A4A6A" })}>{caption}</div>
      ) : null}
    </div>
  );
};

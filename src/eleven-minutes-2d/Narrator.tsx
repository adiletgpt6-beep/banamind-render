// Маленький цифровой рассказчик: округлый дисплей с доброжелательным
// экранным лицом и жёлтым акцентом. Рот движется только во время реплик
// рассказчика (по фактическим таймингам букв и громкости файла) и закрыт,
// когда говорят члены семьи. Моргание нерегулярное; взгляд мягко следует
// за действием; в финале — тёплая улыбка.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext, lipAt } from "./context";
import { blinkAt, clamp, easeInOut, keys } from "./rig/motion";
import { EM2_VIDEO } from "./script";
import { C, LAYOUT } from "./theme";

export const Narrator: React.FC<{ readonly mood?: (t: number) => number; readonly lookX?: (t: number) => number }> = ({ mood, lookX }) => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const t = f / EM2_VIDEO.fps;
  const lip = lipAt(cues, "narrator", f);
  const speaking = cues.some((c) => c.role === "narrator" && t >= c.from - 0.1 && t <= c.to + 0.1);
  const familyTalks = cues.some((c) => c.role !== "narrator" && t >= c.from - 0.2 && t <= c.to + 0.2);
  const blink = blinkAt(f, 7);
  const smile = mood ? mood(t) : 0.3; // 0 — спокойно, 1 — тепло
  const lx = lookX ? lookX(t) : 0;
  const { cx, cy, w, h } = LAYOUT.narrator;
  // лёгкое «внимание», когда говорит семья: экран чуть приглушён
  const dim = keys(familyTalks ? 1 : 0, [[0, 1], [1, 0.72]]);
  const eyeH = 34 * (1 - blink) + 3;
  const mouthW = 30 + 18 * lip.wide - 8 * lip.round;
  const mouthH = 5 + 30 * lip.open;
  const glow = speaking ? 0.5 + 0.5 * clamp(lip.open * 1.6) : 0;
  return (
    <svg width={w + 80} height={h + 60} viewBox={`${-w / 2 - 40} ${-h / 2 - 30} ${w + 80} ${h + 60}`} style={{ position: "absolute", left: cx - w / 2 - 40, top: cy - h / 2 - 30, opacity: dim }}>
      {/* корпус */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.42} fill="#0F1824" stroke={C.line} strokeWidth={4} />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={h * 0.34} fill="#0A111B" />
      {/* жёлтый акцент: «бровка» сверху и индикатор речи */}
      <rect x={-26} y={-h / 2 - 9} width={52} height={12} rx={6} fill={C.yellow} />
      <circle cx={w / 2 - 26} cy={-h / 2 + 30} r={7} fill={C.yellow} opacity={0.35 + 0.65 * glow} />
      {/* глаза: смещаются со взглядом; в улыбке — дуги */}
      {[-1, 1].map((side) => {
        const ex = side * 40 + lx * 10;
        const ey = -16;
        return smile > 0.75 && blink < 0.5 ? (
          <path key={side} d={`M ${ex - 16} ${ey + 6} Q ${ex} ${ey - 16} ${ex + 16} ${ey + 6}`} stroke="#CFEBFF" strokeWidth={8} fill="none" strokeLinecap="round" />
        ) : (
          <rect key={side} x={ex - 13} y={ey - eyeH / 2} width={26} height={eyeH} rx={13} fill="#CFEBFF" />
        );
      })}
      {/* рот: по речи; в паузах — тонкая линия с лёгкой улыбкой */}
      {lip.open > 0.03 ? (
        <rect x={-mouthW / 2 + lx * 6} y={26 - mouthH / 2} width={mouthW} height={mouthH} rx={Math.min(mouthW, mouthH) / 2} fill="#CFEBFF" />
      ) : (
        <path d={`M ${-20 + lx * 6} 24 Q ${lx * 6} ${24 + 10 * easeInOut(smile)} ${20 + lx * 6} 24`} stroke="#CFEBFF" strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
};

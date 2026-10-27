// План 1 (0–4,03 с): «Баланы мектепке жеткирүү кээде 20 мүнөттүк эле иш эмес».
// Заголовок собирается по словам; на «кээде» появляется секундомер, на «20»
// кольцо заполняется до 20 минут, на «эмес» время «переливается» через край:
// кольцо краснеет, счёт уходит за 60 мин. Перед склейкой секундомер улетает
// в угол и становится часами следующего плана (match cut).
import { fontFamily } from "../../fonts";
import { KineticTitle } from "../../live/KineticTitle";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { Glow } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

const R = 120;
const CIRC = 2 * Math.PI * R;

export const Stopwatch: React.FC<{ readonly t: number }> = ({ t }) => {
  const appear = springy(t, CUE.keede, 0.55);
  // заполнение: 0 → 1/3 (20 мин) на «20», затем перелив после «эмес»
  const base = ramp(t, CUE.twenty, 0.55, easeOut) / 3;
  const over = ramp(t, CUE.emes, 0.85, easeInOut) * (2 / 3 + 0.25);
  const fill = base + over;
  const minutes = Math.round(fill * 60);
  const hot = ramp(t, CUE.emes, 0.35);
  // улёт в угол перед склейкой (становится часами плана 2)
  const fly = ramp(t, LIVE04.cuts[0] - 0.32, 0.32, easeInOut);
  if (t < CUE.keede - 0.05 || t > LIVE04.cuts[0] + 0.02) return null;
  const cx = mix(540, 540, fly);
  const cy = mix(1215, 790, fly);
  const s = (0.6 + 0.4 * appear) * mix(1, 0.42, fly);
  const ringColor = hot > 0.5 ? C.red : C.yellow;
  const pulse = hot > 0 ? 1 + 0.04 * Math.sin((t - CUE.emes) * 18) * (1 - ramp(t, CUE.emes + 0.7, 0.3)) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - 170,
        top: cy - 170,
        width: 340,
        height: 340,
        transform: `scale(${s * pulse})`,
        opacity: ramp(t, CUE.keede - 0.05, 0.2),
      }}
    >
      <Glow size={520} color={hot > 0.5 ? "rgba(255,77,94,0.7)" : "rgba(255,201,14,0.6)"} opacity={0.35 + 0.25 * hot} style={{ left: -90, top: -90 }} />
      <svg width={340} height={340} viewBox="-170 -170 340 340" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle r={R + 34} fill="rgba(10,22,54,0.86)" stroke="rgba(255,255,255,0.18)" strokeWidth={3} />
        {/* деления */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const long = i % 5 === 0;
          return (
            <line
              key={i}
              x1={Math.cos(a) * (R + 22)}
              y1={Math.sin(a) * (R + 22)}
              x2={Math.cos(a) * (R + (long ? 8 : 14))}
              y2={Math.sin(a) * (R + (long ? 8 : 14))}
              stroke={i / 60 < Math.min(1, fill) ? ringColor : "rgba(255,255,255,0.35)"}
              strokeWidth={long ? 4 : 2}
              strokeLinecap="round"
            />
          );
        })}
        <circle r={R - 6} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={16} />
        <circle
          r={R - 6}
          fill="none"
          stroke={ringColor}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${Math.min(1, fill) * CIRC * ((R - 6) / R)} ${CIRC}`}
          transform="rotate(-90)"
        />
        {fill > 1 ? (
          <circle
            r={R - 28}
            fill="none"
            stroke={C.red}
            strokeOpacity={0.8}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${(fill - 1) * 2 * Math.PI * (R - 28)} ${CIRC}`}
            transform="rotate(-90)"
          />
        ) : null}
        {/* стрелка */}
        <line x1={0} y1={0} x2={0} y2={-(R - 34)} stroke={C.white} strokeWidth={6} strokeLinecap="round" transform={`rotate(${fill * 360})`} />
        <circle r={10} fill={C.white} />
        {/* кнопка секундомера */}
        <rect x={-18} y={-R - 62} width={36} height={22} rx={6} fill={ringColor} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 196,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 54,
          color: C.white,
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}
      >
        {fill >= 1 ? "60+" : minutes}
        <span style={{ fontSize: 30, fontWeight: 800, marginLeft: 6, opacity: 0.85 }}>мүн</span>
      </div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const t = useT();
  if (t > LIVE04.cuts[0] + 0.1) return null;
  const tag = ramp(t, 0.15, 0.4) * (1 - ramp(t, LIVE04.cuts[0] - 0.4, 0.3, easeInOut));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: tag }}>
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 999,
            background: "rgba(10,22,54,0.72)",
            border: `2px solid ${C.yellow}`,
            fontFamily,
            fontWeight: 900,
            fontSize: 34,
            color: C.white,
            transform: `translateY(${(1 - tag) * -16}px)`,
          }}
        >
          Bala<span style={{ color: C.yellow }}>Go</span> • Бишкек
        </div>
      </div>
      <KineticTitle
        y={890}
        size={98}
        out={CUE.keede - 0.05}
        lines={[
          [
            { text: "Баланы", at: CUE.balany },
            { text: "мектепке", at: CUE.mektepke1 },
          ],
          [{ text: "жеткирүү", at: CUE.zhetkiruu, accent: "yellow" }],
        ]}
      />
      <KineticTitle
        y={890}
        size={94}
        out={LIVE04.cuts[0] - 0.4}
        lines={[
          [{ text: "20 мүнөттүк", at: CUE.twenty }],
          [
            { text: "эле", at: CUE.ele1 },
            { text: "иш", at: CUE.ish1 },
            { text: "эмес", at: CUE.emes, accent: "red" },
          ],
        ]}
      />
      <Stopwatch t={t} />
    </>
  );
};

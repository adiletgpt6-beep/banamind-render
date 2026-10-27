// Сцена 1 (хук): «12:30 → 13:30». Часы в таймлапсе прокручивают обеденный
// час, пустая тарелка (символ обеда, еды нет) переворачивается и
// превращается в жёлтые песочные часы; песок сыплется, и часы улетают
// в шкалу обеда наверху кадра (сцена 2).
import { fontFamily } from "../../../fonts";
import { ArrowText, easeInOut, easeOut, Hourglass, lerp, NAVY, NAVY_SOFT, popScale, prog, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

// сектор круга по часовой стрелке от угла a до b (градусы от «12 часов»)
const pt = (r: number, deg: number) => `${(r * Math.sin((deg * Math.PI) / 180)).toFixed(1)} ${(-r * Math.cos((deg * Math.PI) / 180)).toFixed(1)}`;
const sector = (r: number, a: number, b: number) => `M 0 0 L ${pt(r, a)} A ${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${pt(r, b)} Z`;

const Clock: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const u = easeInOut(prog(t, b.hook.clock + 0.3, b.hook.toBar - b.hook.clock - 0.3));
  const minDeg = 180 + u * 360; // 12:30 → 13:30
  const hourDeg = 15 + u * 30;
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg width={460} height={460} viewBox="-230 -230 460 460">
      <circle r={220} fill="#FFFFFF" stroke={NAVY} strokeWidth={14} />
      {/* закрашенный сектор прошедшего времени */}
      {u > 0.002 && u < 0.998 ? <path d={sector(190, 180, 180 + u * 360)} fill={YELLOW_SOFT} /> : null}
      {u >= 0.998 ? <circle r={190} fill={YELLOW_SOFT} /> : null}
      {ticks.map((i) => (
        <rect key={i} x={-5} y={-205} width={10} height={i % 3 === 0 ? 34 : 20} rx={4} fill={NAVY} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-9} y={-120} width={18} height={130} rx={9} fill={NAVY} transform={`rotate(${hourDeg})`} />
      <rect x={-6} y={-178} width={12} height={190} rx={6} fill={YELLOW} stroke={NAVY} strokeWidth={3} transform={`rotate(${minDeg})`} />
      <circle r={16} fill={NAVY} />
    </svg>
  );
};

const Plate: React.FC = () => (
  <svg width={420} height={260} viewBox="-210 -130 420 260">
    {/* вилка и ложка — пустая тарелка: обеда нет */}
    <g fill="#AFBBCF">
      <rect x={-196} y={-70} width={12} height={150} rx={6} />
      <rect x={-206} y={-110} width={6} height={50} rx={3} />
      <rect x={-193} y={-110} width={6} height={50} rx={3} />
      <rect x={-180} y={-110} width={6} height={50} rx={3} />
      <rect x={184} y={-50} width={12} height={130} rx={6} />
      <ellipse cx={190} cy={-80} rx={22} ry={34} />
    </g>
    <ellipse cx={0} cy={10} rx={160} ry={100} fill="#FFFFFF" stroke="#C9D3E3" strokeWidth={8} />
    <ellipse cx={0} cy={10} rx={104} ry={62} fill="#F3F6FB" stroke="#DCE3EE" strokeWidth={5} />
  </svg>
);

export const Hook: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const h = b.hook;
  const inTitle = easeOut(prog(t, h.from + 0.05, 0.4));
  const inClock = popScale(prog(t, h.clock, 0.45));
  const morph = easeInOut(prog(t, h.morph, 0.55));
  const fly = easeInOut(prog(t, h.toBar, 0.6));
  const fadeOut = 1 - easeOut(prog(t, h.toBar, 0.5));
  // тарелка: появляется, затем переворачивается ребром и исчезает
  const plateIn = popScale(prog(t, h.plate, 0.45));
  const plateScaleY = 1 - morph;
  // песочные часы: из ребра тарелки; затем летят в шкалу (≈ 137, 290)
  const glassIn = easeOut(prog(t, h.morph + 0.25, 0.4));
  const sand = prog(t, h.morph + 0.4, h.toBar - h.morph);
  const gx = lerp(540, 136, fly);
  const gy = lerp(1230, 284, fly);
  const gs = lerp(1, 0.2, fly);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: fadeOut }}>
        <div style={{ position: "absolute", left: -180, top: -160, width: 620, height: 620, borderRadius: 310, backgroundColor: YELLOW_SOFT }} />
        <div style={{ position: "absolute", right: -220, bottom: 200, width: 560, height: 560, borderRadius: 280, backgroundColor: "#EAF1FB" }} />
        <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: inTitle, transform: `translateY(${(1 - inTitle) * 30}px)` }}>
          <div style={{ fontSize: 104, fontWeight: 1000, color: NAVY, display: "inline-flex" }}>
            <ArrowText text={`${BG3_TEXT.from} → ${BG3_TEXT.to}`} size={104} />
          </div>
          <div style={{ marginTop: 6, fontSize: 52, fontWeight: 1000, color: NAVY_SOFT }}>
            {BG3_TEXT.lunch} • {BG3_TEXT.hour}
          </div>
        </div>
        <div style={{ position: "absolute", left: 310, top: 500, transform: `scale(${inClock})` }}>
          <Clock t={t} b={b} />
        </div>
        <div style={{ position: "absolute", left: 330, top: 1110, transform: `scale(${plateIn}, ${plateIn * Math.max(0.02, plateScaleY)}) rotate(${morph * 20}deg)`, opacity: morph < 0.98 ? 1 : 0 }}>
          <Plate />
        </div>
      </div>
      {glassIn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: gx - 120,
            top: gy - 156,
            width: 240,
            transform: `scale(${gs * (0.4 + 0.6 * glassIn)}) rotate(${(1 - glassIn) * -90}deg)`,
            opacity: Math.min(glassIn, 1 - prog(t, h.toBar + 0.45, 0.15)),
          }}
        >
          <Hourglass size={240} sand={sand} t={t} />
        </div>
      ) : null}
    </div>
  );
};

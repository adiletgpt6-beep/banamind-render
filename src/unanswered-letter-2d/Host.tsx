// Ведущая BalaGo: собственный рисованный портрет в жёлто-оранжевом круге.
// В первые секунды — крупно в центре, вокруг на мгновение оживает кольцо
// иконок истории (письмо, календарь, школа, машина, дом, часы, карандаш);
// затем круг уходит в компактное положение наверху. Рот двигается только
// во время реплик ведущей (по фактическим таймингам букв и громкости),
// при диалогах семьи и внутреннем чтении письма закрыт. В эпизоде с
// рисунком присутствие ведущей меньше, на контактной карточке её нет.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext, lipAt } from "./context";
import { Icon, type IconId } from "./graphics/Icons";
import { hostDockAt, hostPresence } from "./layout";
import { Head } from "./rig/Head";
import { LOOKS } from "./rig/looks";
import { blinkAt, clamp, easeOut, lerp } from "./rig/motion";
import { EXPR, mixExpr } from "./rig/pose";
import { UL2_VIDEO } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = UL2_VIDEO.fps;
const RING: readonly IconId[] = ["letter", "calendar", "school", "car", "home", "clock", "pencil"];
const RING_COLORS = ["#7FB8F0", "#B79CF2", "#8FD3A6", "#FFFFFF", "#FFC46B", "#7FB8F0", "#FFD33D"];

// Портрет: голова и плечи в единицах рисунка (центр круга — 0, 0; радиус 130).
const Portrait: React.FC<{ f: number; speaking: boolean; mouth: ReturnType<typeof lipAt>; look: number }> = ({ f, speaking, mouth, look }) => {
  const L = LOOKS.host;
  const blink = blinkAt(f, 31);
  const expr = mixExpr(EXPR.calm, EXPR.softSmile, speaking ? 0.4 : 0.7);
  const head = { cx: 0, cy: -8 };
  const sway = Math.sin(f / 46) * 0.6;
  return (
    <g transform={`rotate(${sway} 0 120)`}>
      <Head uid="host-b" part="back" look={L} cx={head.cx} cy={head.cy} turn={look * 0.12} lookX={look} lookY={0} nod={0} expr={expr} mouth={mouth} blink={blink} hairSway={0} />
      {/* шея и плечи */}
      <path d="M -22 40 L -24 78 L 24 78 L 22 40 Z" fill={L.skinShade} />
      <path d="M -132 170 Q -126 92 -60 80 L 60 80 Q 126 92 132 170 Z" fill={L.topColor} />
      <path d="M -30 80 L 0 112 L 30 80 Z" fill={L.inner} />
      {/* жёлтый значок BalaGo на груди */}
      <circle cx={58} cy={118} r={11} fill={C.yellow} />
      <Head uid="host-f" part="front" look={L} cx={head.cx} cy={head.cy} turn={look * 0.12} lookX={look} lookY={0} nod={0} expr={expr} mouth={mouth} blink={blink} hairSway={0} />
    </g>
  );
};

export const Host: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cues = useContext(CuesContext);
  const presence = hostPresence(t);
  if (presence < 0.01) return null;
  const dock = hostDockAt(t);
  const A = LAYOUT.hostBig;
  const B = LAYOUT.host;
  const cx = lerp(A.cx, B.cx, dock);
  const cy = lerp(A.cy, B.cy, dock);
  const r = lerp(A.r, B.r, dock) * (0.82 + 0.18 * presence);
  const mouth = lipAt(cues, "narrator", f);
  const speaking = cues.some((c) => c.role === "narrator" && t >= c.from - 0.1 && t <= c.to + 0.1);
  // когда говорит семья, ведущая чуть приглушена и смотрит в сторону карточки
  const family = cues.some((c) => c.role !== "narrator" && t >= c.from - 0.3 && t <= c.to + 0.3);
  const dim = family ? 0.78 : 1;
  const look = family ? 0.45 : 0;
  // кольцо иконок: появляется сразу и уходит, пока круг поднимается
  const ringA = (1 - easeOut((t - 0.55) / 0.5)) * easeOut((f + 2) / 8);
  return (
    <>
      {ringA > 0.01
        ? RING.map((id, i) => {
            const ang = (i / RING.length) * Math.PI * 2 - Math.PI / 2 + f * 0.006;
            const pop = easeOut((f - i * 1.5) / 7);
            const rr = r * (1.42 + 0.08 * (1 - pop));
            const s = 74;
            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  left: cx + Math.cos(ang) * rr - s / 2,
                  top: cy + Math.sin(ang) * rr - s / 2,
                  width: s,
                  height: s,
                  borderRadius: s / 2,
                  backgroundColor: C.dark,
                  border: `2px solid ${C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: ringA * pop,
                  scale: `${0.7 + 0.3 * pop}`,
                }}
              >
                <Icon id={id} size={42} color={RING_COLORS[i]} />
              </div>
            );
          })
        : null}
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, opacity: presence * dim }}>
        <svg width={r * 2} height={r * 2} viewBox="-130 -130 260 260">
          <defs>
            <linearGradient id="host-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.yellow} />
              <stop offset="1" stopColor={C.orange} />
            </linearGradient>
            <clipPath id="host-clip">
              <circle r={124} />
            </clipPath>
          </defs>
          <circle r={130} fill="url(#host-bg)" />
          <g clipPath="url(#host-clip)">
            <g transform="translate(0 14) scale(1.02)">
              <Portrait f={f} speaking={speaking} mouth={mouth} look={look} />
            </g>
          </g>
          {/* индикатор речи — тонкое кольцо */}
          <circle r={127} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={speaking ? 0.35 + 0.5 * clamp(mouth.open * 1.5) : 0} />
        </svg>
      </div>
    </>
  );
};

// Сцена 6 (≈ 29.1–31.9 с исходника): «BalaGo'ну биз дал ушундай
// ата-энелер үчүн баштап жатабыз».
// Конфликт разрешается: разбросанные дни недели спокойно выстраиваются в
// ровный ряд, световая линия очерчивает круг — внутри по маске и с
// поворотом в глубину собирается официальный логотип BalaGo; рядом —
// «Бишкек» и «Балдар үчүн такси». Движение заметно спокойнее, чем в
// проблемной части. Смысл «баштап жатабыз» (запускаем) несёт речь и
// субтитр — никаких заявлений о множестве обслуженных семей.
import { useCurrentFrame } from "remotion";
import { F, SEGMENT_STARTS, SPEECH } from "./edit";
import { PinIcon } from "./icons";
import { easeInOut, easeOut, enter, lerp, ramp, settle } from "./motion";
import { baseText, NAVY, NAVY_DEEP, OfficialLogo, TEXT_SHADOW, WHITE, YELLOW } from "./ui";

const T_START = SEGMENT_STARTS[6];
const T_LOGO = F(SPEECH.balaGo);
const T_CITY = F(30.0);
const T_TAG = F(SPEECH.ataEneler);
const T_END = SEGMENT_STARTS[7];

const LOGO = { cx: 262, cy: 330, size: 236 };
const DAYS = ["Дш", "Шш", "Шр", "Бш", "Жм"];
// разброс «до» (после перелистывания) → ровный ряд «после»
const SCATTER = [
  { x: -60, y: 70, r: -24 },
  { x: 40, y: -50, r: 18 },
  { x: -20, y: 90, r: -10 },
  { x: 70, y: -30, r: 28 },
  { x: -40, y: 40, r: -16 },
];

const DayRow: React.FC<{ readonly frame: number; readonly out: number }> = ({ frame, out }) => {
  const align = settle(frame, T_START + 2, 22);
  return (
    <div style={{ position: "absolute", left: 140, top: 478, width: 800, display: "flex", justifyContent: "space-between", opacity: out }}>
      {DAYS.map((d, i) => {
        const a = enter(frame, T_START + i * 2);
        const s = SCATTER[i];
        const ok = ramp(frame, T_LOGO + 6 + i * 2, T_LOGO + 12 + i * 2, easeOut);
        return (
          <div
            key={d}
            style={{
              width: 136,
              height: 54,
              borderRadius: 16,
              background: "linear-gradient(180deg, #FFFFFF, #EEF2F8)",
              boxShadow: "0 10px 24px rgba(3,7,20,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: Math.min(1, a * 1.5),
              transform: `translate(${s.x * (1 - align)}px, ${s.y * (1 - align)}px) rotate(${s.r * (1 - align)}deg) scale(${lerp(0.6, 1, a)})`,
            }}
          >
            <div style={{ ...baseText, fontSize: 26, color: NAVY_DEEP }}>{d}</div>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: YELLOW, boxShadow: `0 0 ${12 * ok}px rgba(255,201,14,0.9)`, transform: `scale(${lerp(0.6, 1, ok)})` }} />
          </div>
        );
      })}
    </div>
  );
};

const LogoBuild: React.FC<{ readonly frame: number; readonly out: number }> = ({ frame, out }) => {
  const ring = ramp(frame, T_LOGO - 4, T_LOGO + 8, easeOut);
  const a = settle(frame, T_LOGO + 2, 26);
  const wave = ramp(frame, T_LOGO + 8, T_LOGO + 30, easeOut);
  const shine = ramp(frame, T_LOGO + 12, T_LOGO + 30, easeInOut);
  const r = LOGO.size / 2;
  const C = 2 * Math.PI * (r + 10);
  return (
    <div style={{ position: "absolute", left: LOGO.cx - r - 40, top: LOGO.cy - r - 40, width: LOGO.size + 80, height: LOGO.size + 80, opacity: out, perspective: 900 }}>
      <svg width={LOGO.size + 80} height={LOGO.size + 80} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* световая линия очерчивает круг */}
        <circle
          cx={r + 40}
          cy={r + 40}
          r={r + 10}
          fill="none"
          stroke={YELLOW}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - ring)}
          transform={`rotate(-90 ${r + 40} ${r + 40})`}
          style={{ filter: "drop-shadow(0 0 12px rgba(255,201,14,0.95))" }}
        />
        {/* мягкая волна после сборки */}
        <circle cx={r + 40} cy={r + 40} r={(r + 10) * (1 + 0.35 * wave)} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.6 * (1 - wave) * (wave > 0 ? 1 : 0)} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 40,
          width: LOGO.size,
          height: LOGO.size,
          borderRadius: "50%",
          clipPath: `circle(${a * 52}% at 50% 50%)`,
          transform: `rotateY(${(1 - a) * 70}deg) scale(${lerp(0.7, 1, a)})`,
          boxShadow: "0 24px 50px rgba(3,7,20,0.55)",
          overflow: "hidden",
        }}
      >
        <OfficialLogo size={LOGO.size} />
        {/* блик проходит по логотипу */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 65%)",
            transform: `translateX(${lerp(-120, 120, shine)}%)`,
            opacity: shine > 0 && shine < 1 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

export const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T_START || frame > T_END) return null;
  const out = 1 - ramp(frame, T_END - 7, T_END, easeInOut);
  const city = enter(frame, T_CITY);
  const tag = enter(frame, T_TAG);
  return (
    <>
      <DayRow frame={frame} out={out} />
      <LogoBuild frame={frame} out={out} />
      <div style={{ position: "absolute", left: 420, top: 238, opacity: out }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: Math.min(1, city * 1.4),
            transform: `translateX(${(1 - city) * -30}px)`,
            clipPath: `inset(-20px ${(1 - ramp(frame, T_CITY, T_CITY + 10, easeOut)) * 100}% -20px -20px)`,
          }}
        >
          <PinIcon size={50} />
          <div style={{ ...baseText, fontSize: 58, color: WHITE, textShadow: TEXT_SHADOW }}>Бишкек</div>
        </div>
        <div
          style={{
            marginTop: 18,
            display: "inline-block",
            padding: "14px 26px",
            borderRadius: 40,
            background: YELLOW,
            boxShadow: "0 14px 30px rgba(3,7,20,0.45), 0 0 26px rgba(255,201,14,0.45)",
            ...baseText,
            fontSize: 40,
            color: NAVY,
            opacity: Math.min(1, tag * 1.4),
            transform: `translateY(${(1 - tag) * 24}px) scale(${lerp(0.8, 1, tag)})`,
            transformOrigin: "left center",
          }}
        >
          Балдар үчүн такси
        </div>
      </div>
    </>
  );
};

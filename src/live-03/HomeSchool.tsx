// Сцена 7 (≈ 32.6–37.2 с исходника): «Балаңызды мектепке жеткирүү жана
// сабактан кийин үйүнө алып келүү жагын биз уюштурабыз».
// Схема «ҮЙ → МЕКТЕП → ҮЙ»: объёмные дом и школа со светом и тенью,
// стрелки рисуются по очереди, белая машина BalaGo проходит обе части
// маршрута, конечные точки загораются в момент прибытия. Сцена стартует
// компактной панелью под лицом, на ≈ 2.4 с раскрывается почти на весь
// экран (голос продолжается за кадром), затем возвращается к Адилету.
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useCurrentFrame } from "remotion";
import { CarTopView } from "../components/CarTopView";
import { F, SEGMENT_STARTS, SPEECH } from "./edit";
import { PinIcon } from "./icons";
import { easeInOut, easeOut, enter, lerp, ramp, settle } from "./motion";
import { baseText, extrude, NAVY, OfficialLogo, SchemeArrow, WHITE, YELLOW } from "./ui";

const T_IN = F(SPEECH.balanyzdy);
const T_LEG_A = F(SPEECH.mektepke2);
const T_LEG_A_END = F(34.1);
const T_EXPAND = F(33.5);
const T_LEG_B = F(SPEECH.uyuno);
const T_LEG_B_END = F(SPEECH.jagyn);
const T_COLLAPSE = F(35.95);
const T_BADGE = F(SPEECH.uyushturabyz);
const T_END = SEGMENT_STARTS[8];

const STAGE = { w: 860, h: 620 };
const PATH_A = "M 228 318 C 340 176, 520 176, 628 300";
const PATH_B = "M 628 420 C 520 548, 340 548, 228 432";
const LEN_A = getLength(PATH_A);
const LEN_B = getLength(PATH_B);

// ---------- Дом ----------
const House: React.FC<{ readonly lit: number }> = ({ lit }) => (
  <svg width={220} height={230} viewBox="0 0 220 230" style={{ position: "absolute", left: 40, top: 236, overflow: "visible" }}>
    <ellipse cx={110} cy={214} rx={104} ry={16} fill="rgba(0,0,0,0.35)" />
    {/* боковая стена (в тени) */}
    <path d="M150 100 L196 76 L196 186 L150 210 Z" fill="#C7D0E0" />
    {/* фасад */}
    <rect x={24} y={100} width={126} height={110} fill="#F5F7FB" />
    {/* крыша: скат и торец */}
    <path d="M10 104 L87 34 L164 104 Z" fill={NAVY} />
    <path d="M87 34 L142 10 L208 78 L164 104 Z" fill="#2B4380" />
    {/* дверь и окна */}
    <rect x={70} y={146} width={34} height={64} rx={4} fill={YELLOW} />
    {[38, 116].map((x) => (
      <rect key={x} x={x - 10} y={124} width={30} height={30} rx={4} fill={lit > 0 ? `rgba(255,214,90,${0.35 + 0.65 * lit})` : "#9FB3D1"} style={{ filter: lit > 0 ? `drop-shadow(0 0 ${14 * lit}px rgba(255,201,14,0.9))` : undefined }} />
    ))}
    <path d="M160 120 L184 108 L184 134 L160 146 Z" fill={lit > 0 ? `rgba(255,214,90,${0.3 + 0.6 * lit})` : "#8EA2C2"} />
  </svg>
);

// ---------- Школа ----------
const School: React.FC<{ readonly lit: number }> = ({ lit }) => (
  <svg width={250} height={270} viewBox="0 0 250 270" style={{ position: "absolute", left: 582, top: 196, overflow: "visible" }}>
    <ellipse cx={122} cy={256} rx={124} ry={17} fill="rgba(0,0,0,0.35)" />
    <path d="M196 92 L240 70 L240 228 L196 250 Z" fill="#C7D0E0" />
    <rect x={20} y={92} width={176} height={158} fill="#F5F7FB" />
    <path d="M6 96 L108 40 L210 96 Z" fill={NAVY} />
    <path d="M108 40 L150 20 L250 74 L210 96 Z" fill="#2B4380" />
    {/* флажок */}
    <rect x={106} y={2} width={4} height={40} fill={NAVY} />
    <path d="M110 4 L140 12 L110 22 Z" fill={YELLOW} />
    {/* вывеска */}
    <rect x={44} y={104} width={128} height={30} rx={8} fill={NAVY} />
    <text x={108} y={126} textAnchor="middle" fontSize={20} fontWeight={900} fill={WHITE} fontFamily={baseText.fontFamily}>
      МЕКТЕП
    </text>
    {[0, 1, 2].map((c) =>
      [0, 1].map((r) => (
        <rect key={`${c}-${r}`} x={38 + c * 52} y={148 + r * 44} width={34} height={30} rx={4} fill={lit > 0 ? `rgba(255,214,90,${0.35 + 0.65 * lit})` : "#9FB3D1"} />
      )),
    )}
    <rect x={92} y={206} width={32} height={44} rx={4} fill={YELLOW} />
    <path d="M206 112 L230 100 L230 128 L206 140 Z M206 160 L230 148 L230 176 L206 188 Z" fill={lit > 0 ? `rgba(255,214,90,${0.3 + 0.6 * lit})` : "#8EA2C2"} />
  </svg>
);

const Leg: React.FC<{ readonly d: string; readonly len: number; readonly p: number }> = ({ d, len, p }) => (
  <>
    <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={38} strokeLinecap="round" />
    <path d={d} fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} style={{ filter: "drop-shadow(0 0 8px rgba(255,201,14,0.8))" }} />
  </>
);

const Arrowhead: React.FC<{ readonly d: string; readonly len: number; readonly show: number }> = ({ d, len, show }) => {
  const pt = getPointAtLength(d, len) ?? { x: 0, y: 0 };
  const tg = getTangentAtLength(d, len) ?? { x: 1, y: 0 };
  const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
  return (
    <path d="M -16 -14 L 4 0 L -16 14" transform={`translate(${pt.x} ${pt.y}) rotate(${ang})`} fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={show} />
  );
};

const Car: React.FC<{ readonly d: string; readonly len: number; readonly p: number }> = ({ d, len, p }) => {
  const at = Math.max(0.5, Math.min(len - 0.5, p * len));
  const pt = getPointAtLength(d, at) ?? { x: 0, y: 0 };
  const tg = getTangentAtLength(d, at) ?? { x: 1, y: 0 };
  const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI + 90; // машина нарисована носом вверх
  return (
    <div style={{ position: "absolute", left: pt.x - 20, top: pt.y - 36, width: 40, height: 72, transform: `rotate(${ang}deg)`, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.45))" }}>
      <CarTopView size={72} />
    </div>
  );
};

const Stage: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const pA = ramp(frame, T_LEG_A, T_LEG_A_END, easeInOut);
  const pB = ramp(frame, T_LEG_B, T_LEG_B_END, easeInOut);
  const drawA = ramp(frame, T_LEG_A - 4, T_LEG_A_END, easeOut);
  const drawB = ramp(frame, T_LEG_B - 4, T_LEG_B_END, easeOut);
  const schoolLit = ramp(frame, T_LEG_A_END - 2, T_LEG_A_END + 6);
  const homeLit = ramp(frame, T_LEG_B_END - 2, T_LEG_B_END + 6);
  const onA = frame < T_LEG_B - 3;
  const word = (t: number) => enter(frame, t);
  const w1 = word(T_IN);
  const w2 = word(T_LEG_A);
  const w3 = word(T_LEG_B - 2);
  const badge = enter(frame, T_BADGE);
  const pin = enter(frame, T_EXPAND + 8);
  const bounce = (lit: number, t: number) => 1 + 0.06 * lit * (1 - ramp(frame, t + 6, t + 18));
  return (
    <div style={{ position: "relative", width: STAGE.w, height: STAGE.h }}>
      {/* заголовок-схема: части появляются вместе со словами */}
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", ...baseText, fontSize: 70, color: WHITE, textShadow: extrude(6, "#8C9AB8"), whiteSpace: "nowrap" }}>
        <span style={{ opacity: w1, display: "inline-block", transform: `translateY(${(1 - w1) * 20}px)` }}>ҮЙ</span>
        <span style={{ opacity: w2, display: "inline-block", transform: `translateY(${(1 - w2) * 20}px)` }}>
          <SchemeArrow size={70} />МЕКТЕП
        </span>
        <span style={{ opacity: w3, display: "inline-block", transform: `translateY(${(1 - w3) * 20}px)` }}>
          <SchemeArrow size={70} />ҮЙ
        </span>
      </div>
      <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <Leg d={PATH_A} len={LEN_A} p={drawA} />
        <Leg d={PATH_B} len={LEN_B} p={drawB} />
        <Arrowhead d={PATH_A} len={LEN_A} show={ramp(frame, T_LEG_A_END - 3, T_LEG_A_END + 2)} />
        <Arrowhead d={PATH_B} len={LEN_B} show={ramp(frame, T_LEG_B_END - 3, T_LEG_B_END + 2)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${bounce(homeLit, T_LEG_B_END)})`, transformOrigin: "150px 450px" }}>
        <House lit={homeLit} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${bounce(schoolLit, T_LEG_A_END)})`, transformOrigin: "706px 450px" }}>
        <School lit={schoolLit} />
      </div>
      {frame >= T_LEG_A - 6 ? (onA ? <Car d={PATH_A} len={LEN_A} p={pA} /> : <Car d={PATH_B} len={LEN_B} p={pB} />) : null}
      {/* Бишкек */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, opacity: pin, transform: `translateY(${(1 - pin) * 16}px)` }}>
        <PinIcon size={40} />
        <div style={{ ...baseText, fontSize: 40, color: WHITE }}>Бишкек</div>
      </div>
      {/* «…жагын биз уюштурабыз» — знак BalaGo на схеме */}
      <div style={{ position: "absolute", left: 384, top: 300, opacity: badge, transform: `scale(${lerp(0.5, 1, badge)})` }}>
        <OfficialLogo size={92} style={{ boxShadow: "0 12px 26px rgba(0,0,0,0.5), 0 0 0 5px rgba(255,201,14,0.9)" }} />
      </div>
    </div>
  );
};

export const HomeSchool: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T_IN - 2 || frame > T_END) return null;
  const a = enter(frame, T_IN - 2);
  const ex = settle(frame, T_EXPAND, 16) * (1 - settle(frame, T_COLLAPSE, 14));
  const out = 1 - ramp(frame, T_END - 7, T_END, easeInOut);
  // компактно: 0.66 по центру x, низ панели над субтитрами; раскрыто: 1.1
  const scale = lerp(0.66, 1.1, ex);
  const cy = lerp(1196, 900, ex);
  const panelTop = lerp(1196 - STAGE.h * 0.66 / 2 - 24, 214, ex);
  const panelBottom = lerp(1196 + STAGE.h * 0.66 / 2 + 18, 1630, ex);
  const panelLeft = lerp(540 - STAGE.w * 0.66 / 2 - 22, 40, ex);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, a * 1.5) * out }}>
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          right: panelLeft,
          top: panelTop,
          height: panelBottom - panelTop,
          borderRadius: lerp(34, 46, ex),
          background: `radial-gradient(ellipse at 50% 38%, rgba(40,66,130,${0.9 + 0.08 * ex}) 0%, rgba(12,24,56,${0.92 + 0.06 * ex}) 70%)`,
          boxShadow: `0 30px 70px rgba(2,5,16,0.55), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 ${2 * ex}px rgba(255,201,14,0.35)`,
          transform: `translateY(${(1 - a) * 40}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - STAGE.w / 2,
          top: cy - STAGE.h / 2,
          width: STAGE.w,
          height: STAGE.h,
          transform: `translateY(${(1 - a) * 40}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Stage frame={frame} />
      </div>
    </div>
  );
};

export const HOME_SCHOOL_EXPANDED = { from: T_EXPAND, to: T_COLLAPSE + 14 };

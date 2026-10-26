// Решение: появление BalaGo (официальный логотип) и главная схема
// маршрута ҮЙ → BalaGo → МЕКТЕП → BalaGo → ҮЙ с белой машиной.
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { outFrame, SPEECH, STAGE_BOTTOM } from "./edit";
import { BellIcon, HouseIcon, SchoolIcon, WhiteCar } from "./icons";
import { clamp, easeInOut, easeOut, enter, leave, ramp } from "./motion";
import { baseText, CARD_SHADOW, NAVY, OfficialLogo, WHITE, YELLOW } from "./ui";

const bottom = 1920 - STAGE_BOTTOM;

export const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const from = outFrame(SPEECH.balaGo) - 3;
  const to = outFrame(SPEECH.bizBalanyzdy) - 2;
  if (frame < from - 2 || frame > to + 10) return null;
  const a = enter(frame, from);
  const logo = enter(frame, from + 2);
  const text = enter(frame, from + 6);
  const sub = enter(frame, from + 10);
  const line = ramp(frame, from + 8, from + 24, easeOut);
  const glow = interpolate(frame, [from, from + 12, from + 40], [0, 1, 0.55], clamp);
  const exit = leave(frame, to, 8);
  return (
    <div style={{ position: "absolute", bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "22px 52px 22px 22px",
          borderRadius: 999,
          backgroundColor: WHITE,
          boxShadow: `${CARD_SHADOW}, 0 0 ${70 * glow}px rgba(255,201,14,${0.55 * glow})`,
          opacity: Math.min(1, a * 1.6) * exit,
          transform: `translateY(${(1 - a) * 34 + (1 - exit) * 30}px) scale(${(0.86 + 0.14 * a) * (0.94 + 0.06 * exit)})`,
        }}
      >
        <OfficialLogo
          size={176}
          style={{
            transform: `scale(${0.6 + 0.4 * logo})`,
            boxShadow: `0 0 0 5px ${YELLOW}`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              ...baseText,
              fontSize: 104,
              color: NAVY,
              letterSpacing: 0,
              lineHeight: 1,
              opacity: Math.min(1, text * 1.5),
              transform: `translateX(${(1 - text) * 24}px)`,
            }}
          >
            Bala<span style={{ color: YELLOW, WebkitTextStroke: `2px ${NAVY}` }}>Go</span>
          </div>
          <div style={{ height: 6, width: `${line * 100}%`, borderRadius: 4, backgroundColor: YELLOW }} />
          <div
            style={{
              ...baseText,
              fontSize: 42,
              fontWeight: 800,
              color: NAVY,
              opacity: Math.min(1, sub * 1.5),
              transform: `translateX(${(1 - sub) * 18}px)`,
            }}
          >
            Балдар үчүн такси
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Маршрут ----------
const W = 1000;
const H = 300;
// верхняя дуга — из дома в школу, нижняя — обратно
const TOP_ARC = "M 170 160 C 380 92, 620 92, 830 160";
const BOTTOM_ARC = "M 830 214 C 620 282, 380 282, 170 214";
const HOUSE = { x: 92, y: 188 };
const SCHOOL = { x: 908, y: 188 };

const usePath = (d: string) =>
  useMemo(() => {
    const len = getLength(d);
    return {
      len,
      at: (p: number) => {
        const l = Math.min(len, Math.max(0, p * len));
        const pt = getPointAtLength(d, l);
        const tg = getTangentAtLength(d, l);
        if (!pt || !tg) return { x: 0, y: 0, angle: 0 };
        return { x: pt.x, y: pt.y, angle: (Math.atan2(tg.y, tg.x) * 180) / Math.PI };
      },
    };
  }, [d]);

const Step: React.FC<{
  readonly frame: number;
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
}> = ({ frame, from, to, children }) => {
  if (frame < from || frame > to + 6) return null;
  const a = enter(frame, from);
  const exit = to === Infinity ? 1 : leave(frame, to, 5);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 22,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        opacity: Math.min(1, a * 1.5) * exit,
        transform: `translateY(${(1 - a) * 14 - (1 - exit) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

const stepText: React.CSSProperties = { ...baseText, fontSize: 52, color: NAVY, letterSpacing: 1 };
const arrow = (
  <svg width={58} height={34} viewBox="0 0 58 34" style={{ margin: "0 4px", flexShrink: 0 }}>
    <path d="M4 17 H48 M36 5 L50 17 L36 29" fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RouteLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const top = usePath(TOP_ARC);
  const back = usePath(BOTTOM_ARC);
  const f = useMemo(
    () => ({
      in: outFrame(SPEECH.bizBalanyzdy) - 2,
      carIn: outFrame(SPEECH.uidon) - 4,
      legA0: outFrame(SPEECH.mektepke) - 4,
      legA1: outFrame(SPEECH.routeAEnd) - 2,
      bell: outFrame(SPEECH.sabakButkondo) - 2,
      legB0: outFrame(SPEECH.mekteptenAlyp) - 2,
      legB1: outFrame(SPEECH.routeBEnd) - 3,
      out: outFrame(SPEECH.aSizBolso) - 4,
    }),
    [],
  );
  if (frame < f.in || frame > f.out + 10) return null;

  const a = enter(frame, f.in);
  const exit = leave(frame, f.out, 8);
  const track = ramp(frame, f.in + 4, f.in + 22);
  const house = enter(frame, f.in + 3);
  const school = enter(frame, f.in + 8);
  const pA = ramp(frame, f.legA0, f.legA1, easeInOut);
  const pB = ramp(frame, f.legB0, f.legB1, easeInOut);
  const onBack = frame >= f.legB0;
  const car = onBack ? back.at(pB) : top.at(pA);
  const carIn = enter(frame, f.carIn);
  // пульс точки прибытия
  const arriveSchool = interpolate(frame, [f.legA1 - 2, f.legA1 + 6, f.legA1 + 18], [0, 1, 0], clamp);
  const arriveHouse = interpolate(frame, [f.legB1 - 2, f.legB1 + 6, f.legB1 + 18], [0, 1, 0], clamp);
  const bell = enter(frame, f.bell);
  const bellSwing = Math.sin((frame - f.bell) * 0.9) * 14 * Math.max(0, 1 - (frame - f.bell) / 24);

  const node = (x: number, y: number, s: number, pulse: number, children: React.ReactNode, label: string) => (
    <div
      style={{
        position: "absolute",
        left: x - 80,
        top: y - 92,
        width: 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        opacity: Math.min(1, s * 1.5),
        transform: `scale(${(0.7 + 0.3 * s) * (1 + 0.08 * pulse)})`,
      }}
    >
      <div
        style={{
          width: 116,
          height: 116,
          borderRadius: "50%",
          backgroundColor: "#FFF4C2",
          boxShadow: `0 0 0 ${6 * pulse}px rgba(255,201,14,0.45)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      <div style={{ ...baseText, fontSize: 32, color: NAVY, letterSpacing: 1 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position: "absolute", bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: CARD_SHADOW,
          opacity: Math.min(1, a * 1.6) * exit,
          transform: `translateY(${(1 - a) * 34 + (1 - exit) * 30}px) scale(${0.94 + 0.06 * a})`,
        }}
      >
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* основа маршрута — тонкий пунктир, затем жёлтая линия за машиной */}
          {[TOP_ARC, BOTTOM_ARC].map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#D3DCE9"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="2 16"
              opacity={track}
            />
          ))}
          <path
            d={TOP_ARC}
            fill="none"
            stroke={YELLOW}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${top.len * pA} ${top.len}`}
            opacity={pA > 0 ? 1 : 0}
          />
          <path
            d={BOTTOM_ARC}
            fill="none"
            stroke={YELLOW}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${back.len * pB} ${back.len}`}
            opacity={pB > 0 ? 1 : 0}
          />
        </svg>

        {node(HOUSE.x, HOUSE.y, house, arriveHouse, <HouseIcon size={84} />, "ҮЙ")}
        {node(SCHOOL.x, SCHOOL.y, school, arriveSchool, <SchoolIcon size={84} />, "МЕКТЕП")}

        {/* звонок «сабак бүттү» над школой */}
        {frame >= f.bell && frame < f.legB0 + 12 ? (
          <div
            style={{
              position: "absolute",
              left: SCHOOL.x + 26,
              top: SCHOOL.y - 120,
              opacity: Math.min(1, bell * 1.5) * leave(frame, f.legB0 + 4, 8),
              transform: `scale(${0.6 + 0.4 * bell}) rotate(${bellSwing}deg)`,
              transformOrigin: "50% 10%",
            }}
          >
            <BellIcon size={58} />
          </div>
        ) : null}

        {/* белая машина BalaGo */}
        <div
          style={{
            position: "absolute",
            left: car.x - 64,
            top: car.y - 46,
            opacity: Math.min(1, carIn * 1.5),
            transform: onBack
              ? `rotate(${car.angle - 180}deg) scaleX(-1) scale(${0.7 + 0.3 * carIn})`
              : `rotate(${car.angle}deg) scale(${0.7 + 0.3 * carIn})`,
          }}
        >
          <WhiteCar width={128} wheelTurn={(onBack ? pB * back.len : pA * top.len) * 4.5} />
        </div>

        <Step frame={frame} from={f.in + 4} to={f.bell - 4}>
          <div style={stepText}>ҮЙДӨН</div>
          {arrow}
          <div style={stepText}>МЕКТЕПКЕ</div>
        </Step>
        <Step frame={frame} from={f.bell} to={f.legB0 - 3}>
          <BellIcon size={44} />
          <div style={stepText}>САБАК БҮТКӨНДӨ</div>
        </Step>
        <Step frame={frame} from={f.legB0} to={Infinity}>
          <div style={stepText}>МЕКТЕПТЕН</div>
          {arrow}
          <div style={stepText}>ҮЙГӨ</div>
        </Step>
      </div>
    </div>
  );
};


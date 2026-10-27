import {
  evolvePath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
} from "@remotion/paths";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { CarTopView } from "../components/CarTopView";
import { easeInOut, fadeUp, pop, progress } from "../components/anim";

// Карта: 900×900 в координатах SVG.
const MAP_SIZE = 900;
const HOME = { x: 170, y: 730 };
const SCHOOL = { x: 730, y: 190 };

// Туда (дом → школа) и обратно (школа → дом) — разными улицами.
const OUTBOUND = `M ${HOME.x} ${HOME.y} C 170 520, 420 600, 450 450 S 730 400, ${SCHOOL.x} ${SCHOOL.y}`;
const RETURN = `M ${SCHOOL.x} ${SCHOOL.y} C 830 420, 700 720, 470 760 S 250 800, ${HOME.x} ${HOME.y}`;
const OUT_LEN = getLength(OUTBOUND);
const RET_LEN = getLength(RETURN);

// Кварталы-«дома» на фоне карты.
const BLOCKS = [
  [40, 40, 220, 140],
  [300, 40, 260, 120],
  [40, 230, 160, 200],
  [250, 200, 140, 170],
  [440, 230, 150, 110],
  [600, 300, 250, 100],
  [40, 480, 90, 160],
  [250, 640, 150, 70],
  [560, 520, 130, 150],
  [740, 520, 120, 120],
  [40, 810, 300, 60],
  [600, 820, 260, 50],
] as const;

const Pin: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly color: string;
  readonly icon: "home" | "school";
  readonly scale: number;
  readonly labelSide: "left" | "right";
}> = ({ x, y, label, color, icon, scale, labelSide }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
        scale,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: color,
          border: `8px solid ${COLORS.white}`,
          boxSizing: "border-box",
          boxShadow: `0 12px 30px ${COLORS.shadow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          {icon === "home" ? (
            <path
              d="M6 24 L24 8 L42 24 M12 20 V40 H20 V29 H28 V40 H36 V20"
              fill="none"
              stroke={COLORS.white}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M4 18 L24 8 L44 18 L24 28 Z M12 22 V34 Q24 42 36 34 V22 M44 18 V30"
              fill="none"
              stroke={COLORS.navy}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: 18,
          [labelSide === "left" ? "right" : "left"]: 112,
          padding: "6px 22px",
          borderRadius: 999,
          backgroundColor: COLORS.navy,
          color: COLORS.white,
          fontSize: 44,
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Arrow: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width="58" height="40" viewBox="0 0 58 40">
    <path
      d="M4 20 H50 M34 6 L52 20 L34 34"
      fill="none"
      stroke={color}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 5–10 с: анимированный маршрут ҮЙ → МЕКТЕП → ҮЙ.
export const RouteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outStart = Math.round(1.1 * fps);
  const outEnd = Math.round(2.6 * fps);
  const retStart = Math.round(3.0 * fps);
  const retEnd = Math.round(4.6 * fps);

  const outP = progress(frame, outStart, outEnd, easeInOut);
  const retP = progress(frame, retStart, retEnd, easeInOut);

  const onReturn = frame >= retStart;
  const path = onReturn ? RETURN : OUTBOUND;
  const len = onReturn ? RET_LEN : OUT_LEN;
  const at = Math.min(len - 0.01, Math.max(0, (onReturn ? retP : outP) * len));
  const point = getPointAtLength(path, at) ?? HOME;
  const tangent = getTangentAtLength(path, at) ?? { x: 0, y: -1 };
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI + 90;

  const outTrail = evolvePath(outP, OUTBOUND);
  const retTrail = evolvePath(retP, RETURN);

  // Какая остановка в заголовке сейчас активна.
  const activeStop = frame >= retEnd ? 2 : frame >= outEnd ? 1 : 0;
  const mapTop = 470;
  const mapLeft = (1080 - MAP_SIZE) / 2;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
          fontSize: 84,
          fontWeight: 900,
          ...fadeUp(frame, 6, 16, 30),
        }}
      >
        {TEXT.route.stops.map((stop, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 22 }}
          >
            {i > 0 ? (
              <Arrow color={i <= activeStop ? COLORS.yellow : COLORS.block} />
            ) : null}
            <span
              style={{
                padding: "4px 18px",
                borderRadius: 20,
                backgroundColor:
                  i === activeStop ? COLORS.yellow : "transparent",
              }}
            >
              {stop}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: mapLeft,
          top: mapTop,
          width: MAP_SIZE,
          height: MAP_SIZE,
          borderRadius: 56,
          overflow: "hidden",
          backgroundColor: COLORS.sky,
          boxShadow: `0 30px 70px ${COLORS.shadow}`,
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 20], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          }),
        }}
      >
        <svg
          width={MAP_SIZE}
          height={MAP_SIZE}
          viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
          style={{ position: "absolute", inset: 0 }}
        >
          {BLOCKS.map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={18}
              fill={COLORS.block}
            />
          ))}
          {/* весь маршрут — пунктиром */}
          {[OUTBOUND, RETURN].map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={COLORS.white}
              strokeWidth={34}
              strokeLinecap="round"
            />
          ))}
          {[OUTBOUND, RETURN].map((d) => (
            <path
              key={`dash-${d}`}
              d={d}
              fill="none"
              stroke={COLORS.navySoft}
              strokeOpacity={0.35}
              strokeWidth={6}
              strokeDasharray="4 18"
              strokeLinecap="round"
            />
          ))}
          {/* пройденная часть — жёлтым */}
          <path
            d={OUTBOUND}
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={outTrail.strokeDasharray}
            strokeDashoffset={outTrail.strokeDashoffset}
          />
          <path
            d={RETURN}
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={retTrail.strokeDasharray}
            strokeDashoffset={retTrail.strokeDashoffset}
            opacity={onReturn ? 1 : 0}
          />
        </svg>

        <Pin
          x={HOME.x}
          y={HOME.y}
          label={TEXT.route.homeLabel}
          color={COLORS.navy}
          icon="home"
          labelSide="right"
          scale={pop(frame, fps, 10)}
        />
        <Pin
          x={SCHOOL.x}
          y={SCHOOL.y}
          label={TEXT.route.schoolLabel}
          color={COLORS.yellow}
          icon="school"
          labelSide="left"
          scale={pop(frame, fps, 16)}
        />

        <div
          style={{
            position: "absolute",
            left: point.x - 25,
            top: point.y - 45,
            width: 50,
            height: 90,
            rotate: `${angle}deg`,
            opacity: interpolate(frame, [outStart - 10, outStart], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <CarTopView size={90} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

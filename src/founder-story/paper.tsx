import { AbsoluteFill, interpolate } from "remotion";
import { COLORS } from "../config";
import { easeOut } from "../components/anim";

// «Бумажный» набор пятого ролика: карточки с тенью и наклоном, жёлтый
// скотч, скрепки, маркер, рисованные подчёркивания и камера.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const PAPER_SHADOW = "0 18px 40px rgba(20, 40, 90, 0.16)";

// Полоска жёлтого скотча с «рваными» краями.
export const Tape: React.FC<{
  readonly width?: number;
  readonly rotate?: number;
  readonly style?: React.CSSProperties;
}> = ({ width = 150, rotate = -4, style }) => (
  <div
    style={{
      position: "absolute",
      width,
      height: 44,
      backgroundColor: "rgba(255, 201, 14, 0.82)",
      rotate: `${rotate}deg`,
      clipPath:
        "polygon(0 8%, 4% 0, 8% 10%, 12% 0, 88% 0, 92% 10%, 96% 0, 100% 8%, 100% 92%, 96% 100%, 92% 90%, 88% 100%, 12% 100%, 8% 90%, 4% 100%, 0 92%)",
      boxShadow: "0 2px 6px rgba(20, 40, 90, 0.12)",
      ...style,
    }}
  />
);

// Скрепка.
export const Paperclip: React.FC<{
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ size = 90, style }) => (
  <svg
    width={size * 0.45}
    height={size}
    viewBox="0 0 36 80"
    style={{ position: "absolute", ...style }}
  >
    <path
      d="M24 22 V60 A8 8 0 0 1 8 60 V14 A11 11 0 0 1 30 14 V58"
      fill="none"
      stroke={COLORS.navySoft}
      strokeWidth={4.5}
      strokeLinecap="round"
    />
  </svg>
);

// Бумажная карточка.
export const Paper: React.FC<{
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      boxSizing: "border-box",
      borderRadius: 20,
      backgroundColor: COLORS.white,
      border: "2px solid #EEF2F8",
      boxShadow: PAPER_SHADOW,
      ...style,
    }}
  >
    {children}
  </div>
);

// Слово с жёлтым маркером (progress 0…1 — маркер «прокрашивается»).
export const Marker: React.FC<{
  readonly children: React.ReactNode;
  readonly progress: number;
  readonly height?: string;
}> = ({ children, progress, height = "42%" }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span
      style={{
        position: "absolute",
        left: "-0.12em",
        right: "-0.12em",
        bottom: "0.08em",
        height,
        borderRadius: 10,
        backgroundColor: COLORS.yellow,
        transformOrigin: "left center",
        scale: `${progress} 1`,
      }}
    />
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

// Рисованное подчёркивание маркером (линия «пишется» слева направо).
export const Scribble: React.FC<{
  readonly width: number;
  readonly progress: number;
  readonly color?: string;
  readonly style?: React.CSSProperties;
}> = ({ width, progress, color = COLORS.yellow, style }) => (
  <svg
    width={width}
    height={30}
    viewBox={`0 0 ${width} 30`}
    style={{ position: "absolute", overflow: "visible", ...style }}
  >
    <path
      d={`M 4 18 C ${width * 0.25} 8, ${width * 0.5} 26, ${width * 0.75} 14 S ${width - 10} 16, ${width - 4} 12`}
      fill="none"
      stroke={color}
      strokeWidth={10}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);

// Еле заметная «бумажная» сетка точек — ощущение рабочего стола.
export const DotGrid: React.FC<{ readonly opacity?: number }> = ({
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage:
        "radial-gradient(rgba(20, 40, 90, 0.09) 2px, transparent 2.5px)",
      backgroundSize: "44px 44px",
    }}
  />
);

// Камера: плавное приближение к точке (focusX, focusY в пикселях кадра).
export const camera = (
  frame: number,
  keys: readonly [number, number][], // [кадр, масштаб]
  focusX = 540,
  focusY = 960,
): React.CSSProperties => {
  const frames = keys.map((k) => k[0]);
  const scales = keys.map((k) => k[1]);
  const scale =
    keys.length > 1
      ? interpolate(frame, frames, scales, { ...clamp, easing: easeOut })
      : scales[0];
  return {
    transformOrigin: `${focusX}px ${focusY}px`,
    scale: `${scale}`,
  };
};

// Появление «бумажки»: падает на стол с лёгким поворотом.
export const drop = (
  frame: number,
  start: number,
  rotate: number,
  distance = 60,
): React.CSSProperties => {
  const p = interpolate(frame, [start, start + 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  return {
    opacity: interpolate(frame, [start, start + 5], [0, 1], clamp),
    translate: `0px ${(1 - p) * -distance}px`,
    rotate: `${rotate + (1 - p) * 6}deg`,
    scale: `${1.08 - 0.08 * p}`,
  };
};

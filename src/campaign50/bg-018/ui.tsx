// Элементы художественного семейного чата и инфографики BG-018.
// Это иллюстрация переписки вымышленной семьи, а не интерфейс реального
// мессенджера или бота: без настоящих номеров, фото и адресов.
import { interpolate, spring } from "remotion";
import { fontFamily } from "../../fonts";
import { FPS } from "./context";

export const C = {
  navy: "#16346B",
  navySoft: "#2C4C86",
  yellow: "#FFC72C",
  yellowSoft: "#FFF1C2",
  white: "#FFFFFF",
  paper: "#F6F8FC",
  ink: "#1C2433",
  grey: "#7A8496",
  mom: "#E9F7EF", // пузырь мамы
  momInk: "#1F6B47",
  dad: "#EAF1FF",
  dadInk: "#2D5BB5",
  green: "#25A35A",
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const pop = (f: number, at: number, damping = 14) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 170, mass: 0.7 } });

export const fadeIn = (f: number, at: number, dur = 10) => interpolate(f, [at, at + dur], [0, 1], clamp);

export const font = (size: number, weight = 700, color: string = C.ink): React.CSSProperties => ({
  fontFamily,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.18,
});

export const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Нарисованный аватар-кружок с инициалом роли (без фото).
export const Avatar: React.FC<{ who: "mom" | "dad" | "son"; size?: number }> = ({ who, size = 64 }) => {
  const bg = who === "mom" ? "#5BB98B" : who === "dad" ? "#5C86D6" : "#F2A33A";
  const label = who === "mom" ? "А" : who === "dad" ? "Ат" : "Б";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(22,52,107,0.18)",
        flex: "none",
        ...font(size * 0.42, 900, C.white),
      }}
    >
      {label}
    </div>
  );
};

export const NAME = { mom: "Апа", dad: "Ата", son: "Бекжан" } as const;

// Пузырь сообщения. highlight — жёлтый маркер повторяющегося вопроса.
export const Bubble: React.FC<{
  who: "mom" | "dad";
  text: string;
  time?: string;
  side?: "left" | "right";
  highlight?: number;
  scale?: number;
  width?: number;
  showName?: boolean;
  children?: React.ReactNode;
}> = ({ who, text, time, side = who === "mom" ? "right" : "left", highlight = 0, scale = 1, width, showName = true, children }) => {
  const bg = who === "mom" ? C.mom : C.dad;
  const ink = who === "mom" ? C.momInk : C.dadInk;
  return (
    <div style={{ display: "flex", flexDirection: side === "right" ? "row-reverse" : "row", alignItems: "flex-end", gap: 16 * scale, transformOrigin: side === "right" ? "100% 100%" : "0 100%" }}>
      <Avatar who={who} size={62 * scale} />
      <div
        style={{
          position: "relative",
          maxWidth: width ?? 640 * scale,
          padding: `${18 * scale}px ${26 * scale}px ${16 * scale}px`,
          borderRadius: 30 * scale,
          borderBottomRightRadius: side === "right" ? 8 * scale : 30 * scale,
          borderBottomLeftRadius: side === "left" ? 8 * scale : 30 * scale,
          background: bg,
          boxShadow: `0 ${6 * scale}px ${18 * scale}px rgba(22,52,107,0.12)`,
          outline: highlight > 0 ? `${6 * scale}px solid rgba(255,199,44,${highlight})` : undefined,
        }}
      >
        {showName ? <div style={{ ...font(24 * scale, 800, ink), marginBottom: 4 * scale }}>{NAME[who]}</div> : null}
        <div style={{ ...font(36 * scale, 700, C.ink), position: "relative" }}>
          {highlight > 0 ? (
            <span
              style={{
                position: "absolute",
                left: -6 * scale,
                right: -6 * scale,
                top: "18%",
                height: "70%",
                borderRadius: 8 * scale,
                background: C.yellow,
                opacity: 0.55 * highlight,
                transformOrigin: "0 50%",
                transform: `scaleX(${highlight})`,
              }}
            />
          ) : null}
          <span style={{ position: "relative" }}>{text}</span>
        </div>
        {children}
        {time ? <div style={{ ...font(20 * scale, 600, C.grey), textAlign: "right", marginTop: 4 * scale }}>{time}</div> : null}
      </div>
    </div>
  );
};

// Метка дня в ленте.
export const DayChip: React.FC<{ text: string; scale?: number; active?: number }> = ({ text, scale = 1, active = 0 }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div
      style={{
        padding: `${8 * scale}px ${22 * scale}px`,
        borderRadius: 40 * scale,
        background: active > 0 ? `rgba(22,52,107,${0.85 * active + 0.08})` : "rgba(22,52,107,0.08)",
        ...font(24 * scale, 800, active > 0.5 ? C.white : C.navySoft),
      }}
    >
      {text}
    </div>
  </div>
);

// Голосовое сообщение: волна заполняется, пока звучит реплика.
export const VoiceBubble: React.FC<{ who: "mom" | "dad"; progress: number; seconds: string; scale?: number; side?: "left" | "right" }> = ({ who, progress, seconds, scale = 1, side }) => {
  const ink = who === "mom" ? C.momInk : C.dadInk;
  const bars = Array.from({ length: 26 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + (who === "mom" ? 0.4 : 1.3)) * Math.cos(i * 0.45)));
  return (
    <Bubble who={who} text="" side={side} scale={scale} showName>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * scale, marginTop: -30 * scale }}>
        <div style={{ width: 52 * scale, height: 52 * scale, borderRadius: 52, background: ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {progress > 0 && progress < 1 ? (
            <div style={{ display: "flex", gap: 6 * scale }}>
              <div style={{ width: 7 * scale, height: 20 * scale, background: C.white, borderRadius: 2 }} />
              <div style={{ width: 7 * scale, height: 20 * scale, background: C.white, borderRadius: 2 }} />
            </div>
          ) : (
            <div style={{ width: 0, height: 0, marginLeft: 5 * scale, borderTop: `${11 * scale}px solid transparent`, borderBottom: `${11 * scale}px solid transparent`, borderLeft: `${17 * scale}px solid ${C.white}` }} />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 * scale, height: 46 * scale }}>
          {bars.map((b, i) => (
            <div key={i} style={{ width: 6 * scale, height: 46 * scale * b, borderRadius: 3 * scale, background: i / bars.length <= progress ? ink : "rgba(28,36,51,0.22)" }} />
          ))}
        </div>
        <div style={{ ...font(22 * scale, 700, C.grey) }}>{seconds}</div>
      </div>
    </Bubble>
  );
};

// Значок «ссылка» (две скрепки-звена).
export const LinkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </svg>
);

// Значок WhatsApp (трубка в облачке) — нарисован, не логотип-картинка.
export const WaIcon: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={22} fill={C.green} />
    <path d="M10 39 L13 30 A14 14 0 1 1 18 35 Z" fill={C.white} />
    <path d="M10 39 L13 30 A14 14 0 1 1 18 35 Z" fill="none" stroke={C.white} strokeWidth={2} />
    <circle cx={24} cy={24} r={11.5} fill={C.green} />
    <path d="M19.5 19.5 q0.5 -1.5 2 -1 l1.3 2.6 q0.3 0.8 -0.5 1.4 l-0.6 0.5 q1 2.2 3.3 3.4 l0.6 -0.7 q0.6 -0.7 1.4 -0.4 l2.5 1.3 q0.5 1.5 -1 2.2 q-2.5 1.2 -6 -1.6 q-3.6 -3 -3 -7.7 Z" fill={C.white} />
  </svg>
);

// Мягкий фон с жёлтыми и голубыми пятнами.
export const SoftBackdrop: React.FC<{ f: number; tint?: string }> = ({ f, tint = C.paper }) => (
  <div style={abs({ inset: 0, background: tint, overflow: "hidden" })}>
    <div style={abs({ left: -220 + Math.sin(f / 70) * 30, top: -160, width: 760, height: 760, borderRadius: 760, background: "radial-gradient(circle, rgba(255,199,44,0.32), rgba(255,199,44,0) 70%)" })} />
    <div style={abs({ right: -260, top: 820 + Math.cos(f / 80) * 30, width: 820, height: 820, borderRadius: 820, background: "radial-gradient(circle, rgba(92,134,214,0.20), rgba(92,134,214,0) 70%)" })} />
    <div style={abs({ left: -200, bottom: -260, width: 700, height: 700, borderRadius: 700, background: "radial-gradient(circle, rgba(255,199,44,0.18), rgba(255,199,44,0) 70%)" })} />
  </div>
);

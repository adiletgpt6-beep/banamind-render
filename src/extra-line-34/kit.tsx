// Общие помощники сцен №34: время сцены и реплик, камера и планы со
// слоями глубины, тёплый фон с очень слабой фактурой, карточки и
// смысловой заголовок с выделенным словом (приёмы видеореференса).
import { createContext, useContext, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { sceneTools } from "./plan";
import type { ElTimeline } from "./timing";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { EL_VIDEO, type ElSceneId } from "./script";
import { C, F, RADIUS, SHADOW } from "./theme";

export const FPS = EL_VIDEO.fps;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Кадр сцены и инструменты времени (plan.ts) текущей сцены.
export const useScene = (id: ElSceneId) => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  return { f, tl, ...sceneTools(tl, id) };
};

// План сцены: чистая функция от шкалы (кадры действий), одна и та же для
// анимации и звука (эффекты звучат в моменты тех же действий).
export const usePlan = <T,>(fn: (tl: ElTimeline) => T): T => {
  const tl = useTimeline();
  return useMemo(() => fn(tl), [fn, tl]);
};

// ---------- Камера ----------
export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };
export const camMove = (f: number, a: number, b: number, c0: Cam, c1: Cam, ease = easeInOut): Cam => {
  const t = ease((f - a) / Math.max(1, b - a));
  return { x: lerp(c0.x, c1.x, t), y: lerp(c0.y, c1.y, t), zoom: lerp(c0.zoom, c1.zoom, t) };
};

const CamCtx = createContext<{ cam: Cam; base: Cam }>({ cam: { x: 540, y: 960, zoom: 1 }, base: { x: 540, y: 960, zoom: 1 } });
export const useCam = () => useContext(CamCtx).cam;

// План: мир сцены в своих координатах (px), камера — точка мира в центре
// кадра 1080×1920 и масштаб. Рисуется только в кадрах [from, to).
// base — положение камеры, относительно которого считается параллакс слоёв.
export const Shot: React.FC<{
  readonly f: number;
  readonly from?: number;
  readonly to?: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ f, from = -1e9, to = 1e9, cam, base, bg = C.bg, children, overlay }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: bg })}>
      <CamCtx.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          })}
        >
          {children}
        </div>
      </CamCtx.Provider>
      {overlay}
    </div>
  );
};

// Слой глубины: depth 1 — вместе с миром, < 1 — дальше (смещается меньше),
// > 1 — ближе к камере (смещается больше).
export const Depth: React.FC<{ readonly depth: number; readonly children: React.ReactNode }> = ({ depth, children }) => {
  const { cam, base } = useContext(CamCtx);
  const dx = (cam.x - base.x) * (1 - depth);
  const dy = (cam.y - base.y) * (1 - depth) * 0.7;
  return <div style={box({ left: 0, top: 0, transform: `translate(${dx}px, ${dy}px)` })}>{children}</div>;
};

// SVG-слой в координатах мира.
export const Svg: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity })}>
    {children}
  </svg>
);

// ---------- Тёплый фон графических эпизодов ----------
// Светлый фон с очень слабыми концентрическими «волнами» (как бумага с
// водяным знаком в референсе) и мягким светом сверху. Фактура едва
// заметна и не мешает тексту.
export const Backdrop: React.FC<{ readonly warm?: number; readonly glowX?: number; readonly glowY?: number }> = ({ warm = 0, glowX = 760, glowY = 520 }) => (
  <div style={box({ left: -400, top: -400, width: 1880, height: 2720, overflow: "hidden" })}>
    <div style={box({ inset: 0, backgroundColor: warm > 0.5 ? "#F4ECDD" : C.bg })} />
    <div
      style={box({
        inset: 0,
        backgroundImage: `repeating-radial-gradient(circle at ${glowX + 400}px ${glowY + 400}px, rgba(23,38,61,0.018) 0 2px, transparent 2px 26px)`,
      })}
    />
    <div style={box({ inset: 0, background: `radial-gradient(circle at ${glowX + 400}px ${glowY + 300}px, rgba(255,255,255,0.85), rgba(255,255,255,0) 900px)` })} />
    {warm > 0 ? <div style={box({ inset: 0, background: `radial-gradient(circle at 60% 35%, rgba(255,196,120,${0.22 * warm}), transparent 70%)` })} /> : null}
  </div>
);

// ---------- Карточка ----------
export const Card: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h?: number;
  readonly pad?: number;
  readonly radius?: number;
  readonly shadow?: string;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, pad = 44, radius = RADIUS.card, shadow = SHADOW.card, style, children }) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: h,
      padding: pad,
      boxSizing: "border-box",
      backgroundColor: C.card,
      borderRadius: radius,
      boxShadow: shadow,
      fontFamily: F.text,
      color: C.ink,
      ...style,
    })}
  >
    {children}
  </div>
);

// Мягкий вход панели: подъём снизу и проявление; остановка без отскоков.
export const enter = (t: number, dur = 16, dist = 60) => {
  const k = easeOut(clamp(t / dur));
  return { opacity: clamp(t / (dur * 0.6)), transform: `translateY(${(1 - k) * dist}px)` };
};

// ---------- Смысловой заголовок ----------
// Крупная тёмная строка вверху кадра. Слова проявляются по очереди
// (непрочитанные — бледные), выделенное слово получает рамку-подсветку,
// как в референсе. t — кадры от начала входа.
export const Headline: React.FC<{
  readonly text: string;
  readonly accent?: string;
  readonly t: number;
  readonly out?: number; // кадры: начало ухода
  readonly top?: number;
  readonly size?: number;
  readonly perWord?: number;
}> = ({ text, accent, t, out = 1e9, top = 200, size = 64, perWord = 5 }) => {
  if (t < 0) return null;
  const o = 1 - clamp((t - out) / 10);
  if (o <= 0) return null;
  const words = text.split(" ");
  const acc = accent ? accent.split(" ") : [];
  const accStart = accent ? words.findIndex((_, i) => acc.every((a, k) => words[i + k] === a)) : -1;
  const accEnd = accStart + acc.length - 1;
  return (
    <div style={box({ left: 96, width: 840, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.26, rowGap: size * 0.1, opacity: o, fontFamily: F.text, fontWeight: 900, fontSize: size, lineHeight: 1.12, letterSpacing: -size * 0.01 })}>
      {words.map((w, i) => {
        const wt = t - i * perWord;
        const shown = clamp(wt / 6);
        const isAcc = i >= accStart && i <= accEnd && accStart >= 0;
        const frame = isAcc ? easeOut(clamp((t - (accEnd + 1) * perWord - 4) / 10)) : 0;
        return (
          <span
            key={i}
            style={{
              position: "relative",
              color: shown > 0.99 ? C.ink : `rgba(23,38,61,${0.18 + 0.82 * shown})`,
              transform: `translateY(${(1 - easeOut(shown)) * 10}px)`,
              display: "inline-block",
              padding: isAcc ? "0 10px" : 0,
            }}
          >
            {isAcc ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: size * 0.06,
                  bottom: size * 0.02,
                  width: `${frame * 100}%`,
                  borderRadius: 10,
                  backgroundColor: C.yellowSoft,
                  boxShadow: `inset 0 0 0 3px ${C.yellow}`,
                  zIndex: -1,
                }}
              />
            ) : null}
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Стрелка маршрута (SVG — в Nunito нет глифа «→»).
export const Arrow: React.FC<{ readonly size?: number; readonly color?: string; readonly style?: React.CSSProperties }> = ({ size = 40, color = C.ink, style }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 40 24" style={{ display: "inline-block", ...style }}>
    <path d="M 2 12 L 34 12 M 24 3 L 35 12 L 24 21" stroke={color} strokeWidth={4.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Маршрут «ҮЙ → МЕКТЕП → ҮЙ» одной строкой (стрелки — SVG).
export const RouteLine: React.FC<{ readonly parts: readonly string[]; readonly size?: number; readonly color?: string; readonly arrow?: string; readonly reveal?: number }> = ({ parts, size = 44, color = C.ink, arrow = C.ink, reveal = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, fontFamily: F.text, fontWeight: 900, fontSize: size, color, letterSpacing: size * 0.02, whiteSpace: "nowrap" }}>
    {parts.map((p, i) => {
      const k = clamp(reveal * parts.length - i);
      return (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: size * 0.32, opacity: k }}>
          {i > 0 ? <Arrow size={size * 0.9} color={arrow} /> : null}
          <span>{p}</span>
        </span>
      );
    })}
  </div>
);

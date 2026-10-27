// Бумажная лента-маршрут — один непрерывный объект всего ролика.
// Шесть панелей сложены гармошкой. Каждая панель подвешена на верхнем
// сгибе (крае предыдущей) и разворачивается вниз: поворот вокруг сгиба
// (CSS 3D, перспектива) от «ребром к зрителю» (90°) до «плашмя» (0°);
// в сложенном виде она спрятана за предыдущей панелью. Под последней
// развёрнутой панелью видны края ещё сложенных листов.
// Координаты — мир сцены (px): (x, y) — левый верхний угол панели 1.
import { box } from "./kit";
import { clamp, easeInOut } from "./rig/motion";
import { C, F } from "./theme";

export const RIB = { w: 820, h: 620, count: 6 } as const;

// Мир ленты: панель n (1…6) — верх на y = RIB_Y0 + (n − 1)·h.
export const RIB_X = 540 - RIB.w / 2;
export const RIB_Y0 = 0;
export const panelTop = (n: number) => RIB_Y0 + (n - 1) * RIB.h;
export const panelCenter = (n: number) => ({ x: 540, y: panelTop(n) + RIB.h / 2 });

export type PanelSpec = {
  readonly n: number; // номер панели 1…6
  readonly unfold: number; // 0 — сложена (спрятана), 1 — плашмя
  readonly art?: React.ReactNode; // печать на бумаге (координаты панели)
};

// Лёгкая фактура бумаги и номер «n/6» в углу.
const PaperFace: React.FC<{ readonly n: number; readonly children?: React.ReactNode }> = ({ n, children }) => (
  <div
    style={box({
      inset: 0,
      backgroundColor: C.paper,
      backgroundImage: `radial-gradient(circle at 20% 15%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%), radial-gradient(circle, rgba(120,100,60,0.05) 1.4px, transparent 1.8px)`,
      backgroundSize: "100% 100%, 22px 22px",
      overflow: "hidden",
    })}
  >
    {children}
    <div
      style={box({
        right: 22,
        top: 20,
        padding: "6px 16px",
        borderRadius: 999,
        backgroundColor: C.yellow,
        color: C.navy,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: 30,
        lineHeight: 1.1,
      })}
    >
      {n}/6
    </div>
  </div>
);

// Одна панель на сгибе. Отрисовывается ПОД предыдущими (порядок DOM),
// поэтому, пока она сложена за предыдущей, её не видно.
const Panel: React.FC<{ readonly x: number; readonly y: number; readonly spec: PanelSpec }> = ({ x, y, spec }) => {
  const u = clamp(spec.unfold);
  if (u <= 0.001) return null;
  // видимая часть пути: 90° → 0°
  const ang = 90 * (1 - easeInOut(u));
  const shade = 0.22 * Math.sin((ang * Math.PI) / 180);
  return (
    <div style={box({ left: x, top: y, width: RIB.w, height: RIB.h, perspective: 2600, perspectiveOrigin: "50% 0%" })}>
      <div
        style={box({
          inset: 0,
          transformOrigin: "50% 0%",
          transform: `rotateX(${-ang}deg)`,
          boxShadow: `0 ${18 + 10 * (1 - u)}px 36px rgba(20,40,90,${0.16 * u})`,
        })}
      >
        <PaperFace n={spec.n}>{spec.art}</PaperFace>
        {/* свет на сгибе: панель темнее, пока стоит под углом */}
        <div style={box({ inset: 0, background: `linear-gradient(180deg, rgba(60,50,30,${shade * 0.6}), rgba(60,50,30,${shade}))` })} />
        {/* сгиб сверху (кроме первой панели) */}
        {spec.n > 1 ? <div style={box({ left: 0, right: 0, top: 0, height: 16, background: "linear-gradient(180deg, rgba(120,100,60,0.22), rgba(120,100,60,0))" })} /> : null}
      </div>
    </div>
  );
};

// Края ещё сложенных листов под панелью: тонкие полосы бумаги и язычок
// со следующим номером. wobble 0…1 — лёгкое «приглашение» потянуть.
export const FoldedEdge: React.FC<{ readonly x: number; readonly y: number; readonly rest: number; readonly wobble?: number; readonly next?: number }> = ({ x, y, rest, wobble = 0, next }) => {
  if (rest <= 0) return null;
  const layers = Math.min(rest, 4);
  return (
    <div style={box({ left: x, top: y, width: RIB.w, height: 40 })}>
      {Array.from({ length: layers }, (_, i) => (
        <div
          key={i}
          style={box({
            left: 6 + i * 3,
            right: 6 + i * 3,
            top: -2 + i * 7 + wobble * 3 * (i + 1),
            height: 12,
            borderRadius: "0 0 6px 6px",
            backgroundColor: i % 2 ? C.paperShade : C.paperWarm,
            boxShadow: "0 3px 6px rgba(20,40,90,0.12)",
            zIndex: -i,
          })}
        />
      ))}
      {next ? (
        <div
          style={box({
            left: RIB.w / 2 - 46,
            top: layers * 7 + 4 + wobble * 8,
            width: 92,
            height: 46,
            borderRadius: "0 0 18px 18px",
            backgroundColor: C.yellow,
            color: C.navy,
            fontFamily: F.text,
            fontWeight: 900,
            fontSize: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 12px rgba(20,40,90,0.16)",
          })}
        >
          {next}/6
        </div>
      ) : null}
    </div>
  );
};

// Вся лента: панели сверху вниз. rest — сколько панелей ещё сложено под
// последней развёрнутой (рисуются краями), wobble — «приглашение».
export const Ribbon: React.FC<{
  readonly panels: readonly PanelSpec[];
  readonly x?: number;
  readonly y?: number;
  readonly wobble?: number;
  readonly showEdge?: boolean;
}> = ({ panels, x = RIB_X, y = RIB_Y0, wobble = 0, showEdge = true }) => {
  const shown = panels.filter((p) => p.unfold > 0.001);
  const last = shown[shown.length - 1];
  const rest = last ? RIB.count - last.n : RIB.count;
  // край сложенных листов следует за низом последней панели
  const lastU = last ? easeInOut(clamp(last.unfold)) : 1;
  const lastBottom = last ? y + (last.n - 1) * RIB.h + RIB.h * Math.cos(((90 * (1 - lastU)) * Math.PI) / 180) : y;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      {showEdge ? <FoldedEdge x={x} y={lastBottom - 4} rest={rest} wobble={wobble} next={rest > 0 && last ? last.n + 1 : undefined} /> : null}
      {/* поздние панели — раньше в DOM (под ранними) */}
      {[...shown].reverse().map((p) => (
        <Panel key={p.n} x={x} y={y + (p.n - 1) * RIB.h} spec={p} />
      ))}
    </div>
  );
};

// Печатная подпись на бумаге (тёмно-синяя, жирная).
export const Print: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly color?: string;
  readonly weight?: number;
  readonly align?: "left" | "center" | "right";
  readonly width?: number;
  readonly opacity?: number;
  readonly children: React.ReactNode;
}> = ({ x, y, size = 40, color = C.navy, weight = 900, align = "center", width = 700, opacity = 1, children }) => (
  <div
    style={box({
      left: align === "center" ? x - width / 2 : align === "right" ? x - width : x,
      top: y,
      width,
      textAlign: align,
      fontFamily: F.text,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.12,
      color,
      opacity,
    })}
  >
    {children}
  </div>
);

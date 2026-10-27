// Ноутбук на столе в ракурсе ¾ (CSS 3D): основание с клавиатурой лежит на
// столешнице, крышка на шарнире. open 1 — открыт (крышка чуть откинута),
// 0 — закрыт (крышка лежит на основании, видна её спинка). Экран — слайд
// презентации, которая собирается по ходу работы (build 0…1).
import { box } from "../context";
import { fontFamily } from "../../../fonts";
import { BG40_TEXT } from "../script";
import { C } from "./theme";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const LW = 330; // ширина
const LH = 214; // высота крышки
const LD = 210; // глубина основания

// Слайд «Жаңы долбоор»: заголовок, три блока, стрелка, график-волна.
// build — доля собранного слайда; blank — слайд пустой (после перерыва,
// мысль потеряна); cursor — мигающий курсор.
export const SlideScreen: React.FC<{ readonly build: number; readonly f: number; readonly dim?: number }> = ({ build, f, dim = 0 }) => {
  const t = BG40_TEXT.flow;
  const a = (k: number) => clamp01((build - k) / 0.14);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F7F9FC", fontFamily, overflow: "hidden" })}>
      {/* панель приложения */}
      <div style={box({ left: 0, top: 0, right: 0, height: 22, backgroundColor: "#2F5DA8", display: "flex", alignItems: "center", gap: 6, paddingLeft: 8 })}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.7)" }} />
        ))}
      </div>
      {/* миниатюры слайдов */}
      <div style={box({ left: 0, top: 22, bottom: 0, width: 56, backgroundColor: "#E6ECF5" })}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={box({ left: 8, top: 10 + i * 38, width: 40, height: 28, borderRadius: 3, backgroundColor: i === 2 ? "#FFFFFF" : "#F4F6FA", border: i === 2 ? `2px solid ${C.yellow}` : "1px solid #CFD8E6", boxSizing: "border-box" })} />
        ))}
      </div>
      {/* слайд */}
      <div style={box({ left: 66, top: 32, right: 10, bottom: 10, backgroundColor: "#FFFFFF", borderRadius: 4, boxShadow: "0 2px 6px rgba(20,30,60,0.12)", overflow: "hidden" })}>
        <div style={box({ left: 12, top: 10, fontSize: 21, fontWeight: 900, color: C.navy, opacity: a(0), whiteSpace: "nowrap" })}>{t.slideTitle}</div>
        <div style={box({ left: 12, top: 36, fontSize: 12, fontWeight: 700, color: C.inkSoft, opacity: a(0.08), whiteSpace: "nowrap" })}>{t.slideSub}</div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={box({
              left: 12 + i * 78,
              top: 62,
              width: 66,
              height: 48,
              borderRadius: 6,
              backgroundColor: ["#DCEBFA", "#FFF1B8", "#DDF3E4"][i],
              border: `2px solid ${["#3A6EA5", C.yellow, C.green][i]}`,
              boxSizing: "border-box",
              opacity: a(0.2 + i * 0.14),
              scale: `${0.7 + 0.3 * a(0.2 + i * 0.14)}`,
            })}
          >
            <div style={box({ left: 8, top: 10, width: 36, height: 5, borderRadius: 3, backgroundColor: ["#3A6EA5", "#C99A00", C.green][i] })} />
            <div style={box({ left: 8, top: 22, width: 46, height: 4, borderRadius: 2, backgroundColor: "rgba(20,40,90,0.25)" })} />
            <div style={box({ left: 8, top: 31, width: 30, height: 4, borderRadius: 2, backgroundColor: "rgba(20,40,90,0.18)" })} />
          </div>
        ))}
        {/* стрелки между блоками */}
        {[0, 1].map((i) => (
          <div key={i} style={box({ left: 79 + i * 78, top: 82, width: 10, height: 4, backgroundColor: C.navy, opacity: a(0.36 + i * 0.14) })} />
        ))}
        {/* волна-график */}
        <svg width={230} height={60} style={box({ left: 12, top: 120 })}>
          <path
            d="M 2 50 C 40 48 50 20 90 24 S 150 44 180 18 S 220 8 228 6"
            stroke={C.navy}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - clamp01((build - 0.66) / 0.3)}
          />
          {build > 0.97 ? <circle cx={228} cy={6} r={5} fill={C.yellow} stroke={C.navy} strokeWidth={2} /> : null}
        </svg>
        {/* курсор */}
        <div style={box({ left: 12 + 230 * clamp01((build - 0.66) / 0.3), top: 120 + 6, width: 2, height: 16, backgroundColor: C.navy, opacity: build > 0 && build < 1 && Math.floor(f / 8) % 2 === 0 ? 0.9 : 0 })} />
      </div>
      {dim > 0 ? <div style={box({ inset: 0, backgroundColor: `rgba(20,30,60,${0.55 * dim})` })} /> : null}
    </div>
  );
};

// Ноутбук. (x, y) — середина шарнира на столе; ry — поворот вокруг
// вертикали (градусы; + экраном влево, к сидящей слева маме);
// open 0…1; screen — содержимое экрана; s — масштаб.
export const Laptop3D: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly open: number;
  readonly ry?: number;
  readonly s?: number;
  readonly screen?: React.ReactNode;
  readonly glow?: number;
}> = ({ x, y, open, ry = 34, s = 1, screen, glow = 1 }) => {
  // крышка: открыт — откинута назад на 14°, закрыт — лежит на основании
  const tilt = -90 + 104 * clamp01(open);
  return (
    <div style={box({ left: x - 400, top: y - 500, width: 800, height: 800, perspective: 1500, perspectiveOrigin: "50% -40%", pointerEvents: "none" })}>
      <div style={box({ left: 400, top: 500, width: 0, height: 0, transformStyle: "preserve-3d", transform: `scale(${s}) rotateY(${ry}deg)` })}>
        {/* тень на столе */}
        <div style={box({ left: -LW / 2 - 14, top: -4, width: LW + 28, height: LD + 18, borderRadius: 18, backgroundColor: "rgba(60,40,20,0.22)", filter: "blur(6px)", transformOrigin: "50% 0%", transform: "rotateX(90deg) translateZ(-2px)" })} />
        {/* основание с клавиатурой */}
        <div
          style={box({
            left: -LW / 2,
            top: 0,
            width: LW,
            height: LD,
            borderRadius: 12,
            background: "linear-gradient(180deg, #CBD2DC 0%, #DDE2EA 100%)",
            transformOrigin: "50% 0%",
            transform: "rotateX(90deg)",
            overflow: "hidden",
          })}
        >
          <div style={box({ left: 18, top: 14, width: LW - 36, height: 112, borderRadius: 6, backgroundColor: "#AEB7C5" })}>
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} style={box({ left: 6, top: 6 + r * 26, right: 6, height: 20, backgroundImage: "repeating-linear-gradient(90deg, #3A4256 0 18px, transparent 18px 22px)", borderRadius: 3, opacity: 0.85 })} />
            ))}
          </div>
          <div style={box({ left: LW / 2 - 56, top: 138, width: 112, height: 58, borderRadius: 8, backgroundColor: "#C3CAD5", border: "2px solid #B4BCC9", boxSizing: "border-box" })} />
        </div>
        {/* крышка */}
        <div
          style={box({
            left: -LW / 2,
            top: -LH,
            width: LW,
            height: LH,
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt}deg)`,
          })}
        >
          {/* экран */}
          <div style={box({ inset: 0, borderRadius: "12px 12px 4px 4px", backgroundColor: "#22283A", backfaceVisibility: "hidden", overflow: "hidden" })}>
            <div style={box({ left: 10, top: 10, right: 10, bottom: 14, borderRadius: 4, overflow: "hidden", backgroundColor: "#0E1424" })}>
              <div style={box({ inset: 0, opacity: glow })}>{screen}</div>
              <div style={box({ inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)" })} />
            </div>
          </div>
          {/* спинка крышки */}
          <div
            style={box({
              inset: 0,
              borderRadius: "12px 12px 4px 4px",
              background: "linear-gradient(160deg, #E4E8EE 0%, #C6CDD8 100%)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            })}
          >
            <div style={box({ left: LW / 2 - 18, top: LH / 2 - 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.55)" })} />
          </div>
        </div>
      </div>
    </div>
  );
};

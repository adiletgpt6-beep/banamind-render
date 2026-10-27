// Постоянная подача кадра — компактно, чтобы главным была сцена: тонкая
// строка метаданных (слева — день текущей сцены, справа — знак BalaGo) с
// линией прогресса, двухстрочный заголовок сцены (белая строка + светло-
// голубая), крупная основная панель со скруглёнными углами. Содержимое
// панели рисуют сцены (PanelArea).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { easeOut } from "./rig/motion";
import { dayLabelAt, panelAt, sceneOf, titleOf } from "./layout";
import { FU2_FRAMES, FU2_SCENES, FU2_TEXT, FU2_VIDEO } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = FU2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const CONTACT = FU2_SCENES.find((s) => s.id === "contact")!.from;

// Фон панели (под содержимым сцены).
export const PanelBack: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r = panelAt();
  const hide = easeOut((t - CONTACT + 0.4) / 0.4);
  return <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 34, background: `linear-gradient(160deg, ${C.panel2} 0%, ${C.panel} 55%, ${C.panelDeep} 100%)`, opacity: 1 - hide })} />;
};

// Рамка панели, строка метаданных, прогресс, заголовок (поверх сцены).
export const ChromeFront: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r = panelAt();
  const hide = easeOut((t - CONTACT + 0.4) / 0.4);
  const day = dayLabelAt(t);
  // смена метки дня — мягкое проявление
  const dayAge = (() => {
    let k = 0;
    while (k < 60 && dayLabelAt(t - (k + 1) / FPS) === day) k++;
    return k;
  })();
  const dayA = easeOut(dayAge / 8);
  const sc = sceneOf(t);
  const title = titleOf(sc.id);
  const tin = easeOut((t - sc.from + 0.05) / 0.3);
  const tout = 1 - easeOut((t - (sc.to - 0.15)) / 0.15);
  const ta = Math.min(tin, tout);
  return (
    <>
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 34, border: `2px solid ${C.line}`, boxShadow: "inset 0 0 0 1px rgba(169,208,236,0.06)", opacity: 1 - hide, pointerEvents: "none" })} />
      {/* строка метаданных: день сцены слева, знак BalaGo справа */}
      <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.meta.y, height: 32, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily, fontSize: 30, fontWeight: 800, letterSpacing: 0.5, opacity: 1 - hide })}>
        <div style={{ opacity: dayA, color: C.blue }}>{day}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.dim, fontSize: 26 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.yellow }} />
          {FU2_TEXT.brand}
        </div>
      </div>
      {/* прогресс фильма */}
      <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.meta.progressY, height: 3, borderRadius: 2, backgroundColor: C.lineSoft, overflow: "hidden" })}>
        <div style={{ width: `${(100 * f) / (FU2_FRAMES - 1)}%`, height: "100%", backgroundColor: C.blue }} />
      </div>
      {/* заголовок */}
      {title ? (
        <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.title.y, fontFamily, opacity: ta, translate: `0 ${(1 - tin) * 12}px` })}>
          <div style={{ fontSize: 58, fontWeight: 900, color: C.text, lineHeight: 1.08, whiteSpace: "nowrap" }}>{title[0]}</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: C.blue, lineHeight: 1.15, marginTop: 4, whiteSpace: "nowrap" }}>{title[1]}</div>
        </div>
      ) : null}
    </>
  );
};

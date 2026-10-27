// Постоянная карточная подача кадра: тонкая строка метаданных с линией
// прогресса фильма, двухстрочный заголовок сцены (белая строка + светло-
// голубая), основная панель со скруглёнными углами, тонкой рамкой и мягким
// внутренним градиентом. Содержимое панели рисуют сцены (PanelArea).
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
  const r = panelAt(t);
  const hide = easeOut((t - CONTACT + 0.4) / 0.4);
  return <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 34, background: `linear-gradient(160deg, ${C.panel2} 0%, ${C.panel} 55%, ${C.panelDeep} 100%)`, opacity: 1 - hide })} />;
};

// Рамка панели, строка метаданных, прогресс, заголовок (поверх сцены).
export const ChromeFront: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r = panelAt(t);
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
      {/* строка метаданных */}
      <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.meta.y, height: 34, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily, fontSize: 28, fontWeight: 800, color: C.dim, letterSpacing: 0.5, opacity: 1 - hide })}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: C.yellow }} />
          <span style={{ color: C.text }}>{FU2_TEXT.brand}</span>
          <span>· {FU2_TEXT.voiceMemos}</span>
        </div>
        <div style={{ opacity: dayA, color: C.blue }}>{day}</div>
      </div>
      {/* прогресс фильма */}
      <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.meta.progressY, height: 4, borderRadius: 2, backgroundColor: C.lineSoft, overflow: "hidden" })}>
        <div style={{ width: `${(100 * f) / (FU2_FRAMES - 1)}%`, height: "100%", backgroundColor: C.blue }} />
      </div>
      {/* заголовок */}
      {title ? (
        <div style={box({ left: LAYOUT.side, right: LAYOUT.side, top: LAYOUT.title.y, fontFamily, opacity: ta, translate: `0 ${(1 - tin) * 12}px` })}>
          <div style={{ fontSize: 70, fontWeight: 900, color: C.text, lineHeight: 1.08, whiteSpace: "nowrap" }}>{title[0]}</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: C.blue, lineHeight: 1.15, marginTop: 6, whiteSpace: "nowrap" }}>{title[1]}</div>
        </div>
      ) : null}
    </>
  );
};

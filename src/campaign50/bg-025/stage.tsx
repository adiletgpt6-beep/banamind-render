// Общая «сцена с лентой» для шагов 2–6: мир ленты под камерой, уже
// развёрнутые панели (итоговая печать), текущая панель на сгибе, руки
// мамы держат края ленты, поверх — объёмные pop-up элементы (children) и
// слой кадра (overlay: заголовок шага, плашки, пометки).
import { DONE, PANEL_ART } from "./panels";
import { box, Paper, Shot, Svg, type Cam } from "./kit";
import { SKIN, CloseHand } from "./props/CloseHand";
import { panelTop, Ribbon, RIB, RIB_X, type PanelSpec } from "./ribbon";
import { clamp, lerp } from "./rig/motion";
import { C } from "./theme";

export type HandsSpec = {
  readonly y: number; // мировая высота, где пальцы держат края ленты
  readonly show: number; // 0…1 — руки в кадре (уходят вниз за край)
  readonly lift?: number; // 0…1 — руки чуть приподнимают ленту к себе
};

// Руки мамы крупно: держат левый и правый край ленты щепотью (большой
// палец спереди), рукава синего жакета уходят вниз за кадр.
export const MomHands: React.FC<{ readonly f: number; readonly spec: HandsSpec }> = ({ f, spec }) => {
  if (spec.show <= 0.001) return null;
  const drop = (1 - spec.show) * 520;
  const breathe = Math.sin(f / 26) * 4;
  const y = spec.y + drop + breathe - (spec.lift ?? 0) * 18;
  return (
    <Svg>
      <CloseHand x={RIB_X - 18} y={y} angle={-150} size={240} {...SKIN.apa} shape="pinch" mirror armLen={5} />
      <CloseHand x={RIB_X + RIB.w + 18} y={y + Math.sin(f / 31 + 1) * 3} angle={150} size={240} {...SKIN.apa} shape="pinch" armLen={5} />
    </Svg>
  );
};

export const RibbonStage: React.FC<{
  readonly f: number;
  readonly n: number; // текущая панель
  readonly unfold: number; // 0…1 — текущая панель разворачивается
  readonly art: React.ReactNode; // печать текущей панели
  readonly cam: Cam;
  readonly hands?: HandsSpec | null;
  readonly wobble?: number; // приглашение потянуть следующий сгиб
  readonly showEdge?: boolean;
  readonly children?: React.ReactNode; // мировой слой над лентой (pop-up)
  readonly overlay?: React.ReactNode; // слой кадра
  readonly bg?: string;
  readonly topFade?: number; // 0…1 — полоса фона под надписями сверху
}> = ({ f, n, unfold, art, cam, hands, wobble = 0, showEdge = true, children, overlay, bg = C.bg, topFade = 1 }) => {
  const panels: PanelSpec[] = [];
  for (let k = 1; k < n; k++) {
    const A = PANEL_ART[k];
    panels.push({ n: k, unfold: 1, art: <A t={DONE} /> });
  }
  panels.push({ n, unfold, art });
  return (
    <Shot
      f={f}
      cam={cam}
      bg={bg}
      overlay={
        <>
          {topFade > 0 ? (
            // полоса цвета фона под заголовком шага и плашками: печать прошлых
            // панелей не читается под надписями слоя кадра
            <div style={box({ left: 0, right: 0, top: 0, height: 560, opacity: topFade, background: `linear-gradient(180deg, ${bg} 0%, ${bg} 40%, rgba(246,248,252,0.9) 62%, rgba(246,248,252,0) 100%)`, pointerEvents: "none" })} />
          ) : null}
          {overlay}
        </>
      }
    >
      <Paper color={bg} />
      {/* мягкая тень ленты на столе */}
      <div style={box({ left: RIB_X + 30, top: panelTop(1) + 40, width: RIB.w - 60, height: (n - 1 + clamp(unfold)) * RIB.h - 40, borderRadius: 30, backgroundColor: "rgba(20,40,90,0.05)", filter: "blur(18px)" })} />
      <Ribbon panels={panels} wobble={wobble} showEdge={showEdge} />
      {children}
      {hands ? <MomHands f={f} spec={hands} /> : null}
    </Shot>
  );
};

// Камера, смотрящая на панель n: центр панели, zoom; dy — сдвиг вниз.
export const camOnPanel = (n: number, zoom = 1.18, dy = 40): Cam => ({ x: 540, y: panelTop(n) + RIB.h / 2 + dy, zoom });
// Камера на сгибе между панелями n−1 и n (переход вниз по ленте).
export const camOnFold = (n: number, zoom = 1.0): Cam => ({ x: 540, y: panelTop(n) + 60, zoom });
export const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: lerp(a.x, b.x, clamp(t)), y: lerp(a.y, b.y, clamp(t)), zoom: lerp(a.zoom, b.zoom, clamp(t)) });

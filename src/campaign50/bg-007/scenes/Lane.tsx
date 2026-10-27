// Сцена 4 (≈30–43 с): папа открывает BalaGo. Крупно телефон: Бишкек,
// маршрут ҮЙ → МЕКТЕП → ҮЙ, «Маршрутту пландоо». Затем лист календаря:
// над рабочей сеткой открывается отдельная жёлтая линия «BalaGo каттамы»,
// школьные блоки перелетают на неё, встречи возвращаются на свои места
// (и выпавшие карточки тоже). Плашка «Маршрут пландалууда» — маршрут
// ещё только согласуется, ничего не обещано «на завтра».
// Диктор: «BalaGo — Бишкектеги балдар үчүн алдын ала пландалган мектеп
// каттамы.»
import { useCurrentFrame } from "remotion";
import { laneState } from "../calendar";
import { useLine, useScene } from "../context";
import { LOOKS } from "../rig/looks";
import { easeOut } from "../rig/motion";
import { BalaGoScreen, HoldingHand, PhoneFrame, TapFinger } from "../screens";
import { BoardClose } from "./common";

export const LANE_SHOT = 150; // кадр перехода от телефона к календарю
export const LANE_TAP = 112;

export const LaneScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  useLine("n03");
  const dad = LOOKS.dad;
  if (f < LANE_SHOT) {
    const rise = easeOut(f / 14);
    const y = 200 + (1 - rise) * 120;
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 35%, #F1E4CF 0%, #D9C2A0 80%)" }}>
        <div style={{ position: "absolute", left: 120, top: 260, width: 380, height: 520, borderRadius: 24, backgroundColor: "rgba(255,253,247,0.55)", filter: "blur(10px)" }} />
        <PhoneFrame x={230} y={y} w={620} tilt={-2}>
          <BalaGoScreen f={f} tapAt={LANE_TAP} />
        </PhoneFrame>
        <HoldingHand x={230} y={y} w={620} sleeve={dad.topColor} skin={dad.skin} />
        <TapFinger x={540} y={y + 1010} f={f} tapAt={LANE_TAP} skin={dad.skin} />
      </div>
    );
  }
  const t = f - LANE_SHOT;
  return <BoardClose s={laneState(t)} f={t} len={frames - LANE_SHOT} scale={0.8} x={110} y={250} push={0.03} />;
};

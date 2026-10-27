// Сцены 4–5. Выход из офиса: календарь — встречи по обе стороны свободного
// окна; отец с сумкой ноутбука выходит из кеңсе. Маркер проходит участок
// до школы, накопитель — 11. Парковка: места у входа заняты, маркер едет
// дальше и находит место; пунктир — пешком обратно к школе.
// «Токтотуучу жай: +6 мүнөт», «Жөө баруу: +5 мүнөт»; накопитель 17 → 22.
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { EM2_TEXT } from "../script";
import { STAGE_MOVE } from "../story";
import { C } from "../theme";
import { Accumulator, Calendar, Journal, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { box as worldBox, camMove, PanelShot } from "../shots";
import { H, placeAt } from "./common";
import { FPS, STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Коридор офиса: стена, стеклянные перегородки, дверь «Чыгуу», растение.
const OfficeHall: React.FC = () => (
  <div style={worldBox({ left: 0, top: 0, width: 2000, height: 2600 })}>
    <div style={worldBox({ left: -200, top: 0, width: 2400, height: 1500, background: "linear-gradient(180deg, #DDE4EC, #E9EDF2)" })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={worldBox({ left: 520 + i * 360, top: 560, width: 320, height: 940, backgroundColor: "rgba(170,200,225,0.45)", border: "10px solid #B6C2D0", boxSizing: "border-box" })}>
        <div style={worldBox({ left: 40, top: 520, width: 220, height: 30, backgroundColor: "#8C9AAD", opacity: 0.5 })} />
      </div>
    ))}
    {/* дверь с табличкой */}
    <div style={worldBox({ left: 120, top: 560, width: 300, height: 940, backgroundColor: "#7D8A9C" })} />
    <div style={worldBox({ left: 380, top: 1020, width: 20, height: 70, borderRadius: 8, backgroundColor: "#C9D3DE" })} />
    <div style={worldBox({ left: 160, top: 470, width: 220, height: 64, borderRadius: 10, backgroundColor: "#1E7A4E", color: "#FFFFFF", fontFamily, fontSize: 40, fontWeight: 900, textAlign: "center", lineHeight: "64px" })}>Чыгуу</div>
    <div style={worldBox({ left: 1640, top: 1260, width: 120, height: 240, borderRadius: "20px 20px 10px 10px", backgroundColor: "#C9784E" })} />
    <div style={worldBox({ left: 1590, top: 1080, width: 220, height: 220, borderRadius: 110, backgroundColor: "#5E9B63" })} />
    <div style={worldBox({ left: -200, top: 1500, width: 2400, height: 1100, backgroundColor: "#AEB8C4" })} />
  </div>
);

// Отец выходит: справа налево к двери (кадры сцены).
export const LEAVE_DAD = (t: number): Place => {
  const u = cruise((t - 6) / 74, 0.22);
  return placeAt(lerp(1420, 330, u), 1600, H.dad);
};

export const LeaveScene: React.FC = () => {
  const { f, t, t0 } = useScene("leave");
  const split = 92; // далее — карта
  const dadPose = (tt: number) => {
    const p = LEAVE_DAD(tt);
    return {
      expr: "calm" as const,
      armR: { target: { x: p.x + 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: "fist" as const, item: "laptopbag" as const, elbow: "down" as const, behind: false },
      lookY: keys(tt, [[0, 0.1]]),
    };
  };
  const startMove = Math.round((STAGE_MOVE.drive[0] - t0) * FPS);
  const cam = camMove(f, split, 210, { x: 380, y: 300, zoom: 1.35 }, { x: 520, y: 470, zoom: 1.3 });
  const bag = easeOut((f - startMove) / 10);
  return (
    <>
      {f < split ? (
        <>
          <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={520}>
            <Calendar w={STAGE.w} h={520} mode="dad" schoolMin={11} appear={1} highlight={0.6 + 0.4 * Math.sin(f / 8)} />
          </Panel>
          <PanelShot f={f} from={0} to={split} x={STAGE.x} y={STAGE.y + 540} w={STAGE.w} h={STAGE.h - 540} cam={{ x: lerp(1150, 520, cruise(f / 86, 0.3)), y: 1180, zoom: 0.9 }}>
            <OfficeHall />
            <Actor uid="l4-dad" look="dad" f={f} place={LEAVE_DAD} face={() => -0.6} pose={dadPose} role="father" seed={2} />
          </PanelShot>
        </>
      ) : (
        <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.route}>
          <MapView t={t} f={f} cam={cam} w={STAGE.w} h={STAGE.h} routes={["drive"]} glow="school" />
          <div style={box({ right: 22, top: 22 })}>
            <Accumulator t={t} x={-250} y={0} />
          </div>
          <Journal t={t} x={24} y={STAGE.h - 200} w={620} max={1} />
          {/* ноутбук — в закрытой сумке рядом */}
          <div style={box({ left: 24, top: 70, padding: "12px 20px", borderRadius: 18, backgroundColor: "rgba(8,12,19,0.9)", border: `2px solid ${C.line}`, fontFamily, fontSize: 32, fontWeight: 800, color: C.text, opacity: bag, display: "flex", gap: 12, alignItems: "center" })}>
            <svg width={40} height={30} viewBox="0 0 40 30">
              <rect x={2} y={8} width={36} height={20} rx={4} fill="#363D52" />
              <path d="M 13 8 Q 20 0 27 8" stroke="#9AA6BC" strokeWidth={3} fill="none" />
              <rect x={16} y={16} width={8} height={3} rx={1} fill={C.yellow} />
            </svg>
            Ноутбук — сумкада
          </div>
        </Panel>
      )}
    </>
  );
};

export const ParkingScene: React.FC = () => {
  const { f, t } = useScene("parking");
  // камера: к школе, затем чуть шире — видно путь пешком обратно
  const cam = camMove(f, 0, 240, { x: 690, y: 600, zoom: 1.75 }, { x: 730, y: 650, zoom: 1.6 });
  const busy = clamp((f - 4) / 30);
  return (
    <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.school}>
      <MapView t={t} f={f} cam={cam} w={STAGE.w} h={STAGE.h} routes={["drive", "park", "walk"]} dim={["drive"]} busy={busy} glow="school" />
      <Accumulator t={t} x={STAGE.w - 272} y={22} />
      <Journal t={t} x={24} y={STAGE.h - 300} w={640} max={2} />
      {/* подсветка: занятые места у входа */}
      <div style={box({ left: 360, top: 470, fontFamily, fontSize: 36, fontWeight: 900, color: C.coral, opacity: busy * (1 - easeInOut(clamp((f - 120) / 20))), textShadow: "0 4px 14px rgba(0,0,0,0.9)" })}>Бош орун жок</div>
    </Panel>
  );
};

// Сцена 5 (34,5–45,5 с). Карточка BalaGo, которую мама сама нашла и
// открыла в конце моста, раскрывается на весь экран и превращается в
// аккуратную схему маршрута Үй → Мектеп на сетке кварталов Бишкека. На словах «Үйдөн мектепке» — улица: белая машина
// BalaGo едет от панельного дома к школе (горы Ала-Тоо, тополя, арык), на
// «сабактан кийин кайра үйгө» — возвращается домой.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg1Beats } from "../beats";
import { CuesContext } from "../context";
import { clamp, cruise, easeInOut, easeOut, lerp } from "../rig/motion";
import { NAVY, RouteSchematic, SearchScreen, YELLOW } from "../screens";
import { BG1_TEXT } from "../script";
import { Mountains } from "../sets/Apartment";
import { PanelHouse, Tree } from "../sets/Outdoor";
import { box, Depth, Shot } from "../shots";

const ROAD_Y = 1400; // низ колёс
export const STREET = { home: 420, school: 2420 } as const;

// Белая машина (сбоку), на двери — жёлтая полоса с надписью BalaGo.
// Модель авто не указывается. dir: 1 — едет вправо.
export const WhiteCar: React.FC<{ x: number; y: number; s?: number; wheel: number; dir: 1 | -1; kid?: boolean }> = ({ x, y, s = 1, wheel, dir, kid }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={4} rx={250} ry={16} fill="rgba(20,25,40,0.22)" />
      <path d="M -240 -40 Q -244 -92 -200 -100 L -130 -108 Q -90 -170 -10 -172 L 70 -170 Q 130 -166 170 -110 L 220 -100 Q 250 -92 248 -48 L 246 -22 L -238 -22 Z" fill="#FFFFFF" stroke="#D7DCE4" strokeWidth={4} />
      <path d="M -112 -110 Q -78 -158 -12 -160 L 62 -158 Q 112 -154 146 -112 Z" fill="#A9C8E2" />
      <rect x={14} y={-160} width={10} height={50} fill="#FFFFFF" />
      <circle cx={-40} cy={-128} r={20} fill="#3A2E2A" />
      {kid ? <circle cx={74} cy={-124} r={16} fill="#2E2422" /> : null}
      <rect x={-200} y={-86} width={400} height={26} rx={6} fill={YELLOW} />
      <g transform={`scale(${dir} 1)`}>
        <text x={0} y={-66} textAnchor="middle" fontSize={24} fontWeight={900} fill={NAVY} fontFamily={fontFamily}>BalaGo</text>
      </g>
      <rect x={232} y={-80} width={14} height={18} rx={4} fill="#FFE7A8" />
      <rect x={-242} y={-80} width={10} height={18} rx={4} fill="#E25B4E" />
      {[-150, 150].map((wx) => (
        <g key={wx} transform={`translate(${wx} -22) rotate(${wheel})`}>
          <circle r={38} fill="#23262E" />
          <circle r={20} fill="#C7CCD4" />
          <rect x={-3} y={-20} width={6} height={40} fill="#8C929C" />
          <rect x={-20} y={-3} width={40} height={6} fill="#8C929C" />
        </g>
      ))}
    </g>
  </svg>
);

// Школа: трёхэтажное светлое здание с вывеской «Мектеп».
const SchoolBuilding: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x - 330, top: y - 560, width: 660, height: 560 })}>
    <div style={box({ left: 0, top: 60, width: 660, height: 500, backgroundColor: "#F2E6D6" })} />
    <div style={box({ left: -16, top: 44, width: 692, height: 26, backgroundColor: "#B9A58E" })} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 5 }).map((__, c) => (
        <div key={`${r}-${c}`} style={box({ left: 40 + c * 124, top: 110 + r * 120, width: 84, height: 80, borderRadius: 4, backgroundColor: "#9FB6CE", border: "5px solid #FFFFFF", boxSizing: "border-box" })} />
      )),
    )}
    <div style={box({ left: 250, top: 400, width: 160, height: 160, backgroundColor: "#6A5446", borderRadius: "10px 10px 0 0" })} />
    <div style={box({ left: 190, top: -10, width: 280, height: 70, borderRadius: 14, backgroundColor: NAVY, color: "#FFFFFF", fontFamily, fontSize: 44, fontWeight: 900, textAlign: "center", lineHeight: "70px" })}>{BG1_TEXT.route.school}</div>
  </div>
);

export const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { n03, street, drive, wAfter } = bg1Beats(cues);
  const toSchema = 30; // карточка раскрывается в схему
  const drawFrom = Math.max(toSchema + 12, n03.from + 8);
  const drawTo = Math.max(drawFrom + 50, street - 20);
  // машина: дом → школа, затем обратно (дорога в мире, px)
  const xAt = (t: number) => {
    if (t < drive.go) return STREET.home;
    if (t < drive.back) return lerp(STREET.home, STREET.school, cruise((t - drive.go) / Math.max(20, drive.arrive - drive.go), 0.3));
    return lerp(STREET.school, STREET.home, cruise((t - drive.back) / Math.max(30, drive.home - drive.back), 0.3));
  };
  const dir: 1 | -1 = f < drive.back - 2 ? 1 : -1;
  const carX = xAt(f);
  const wheel = (xAt(f) - STREET.home) * 0.9 * (dir === 1 ? 1 : 1);
  const camX = clamp(carX, 440, STREET.school - 120);
  const chip = f < wAfter ? BG1_TEXT.route.there : BG1_TEXT.route.back;
  const chipIn = easeOut((f - street - 6) / 10);
  const chipSwap = clamp((f - wAfter) / 8);
  const expand = easeInOut((f - 6) / (toSchema - 6));
  return (
    <>
      {/* вкладка «Мектепке каттам» раскрывается */}
      <Shot f={f} from={0} to={toSchema + 14} cam={{ x: 540, y: 960, zoom: 1 }}>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${1 + expand * 0.35})`, transformOrigin: "50% 32%" })}>
          {/* тот же кадр, на котором закончился мост: карточка уже открыта */}
          <SearchScreen f={1000} typeFrom={0} typeTo={1} found={0} click={0} />
        </div>
      </Shot>
      <Shot f={f} from={toSchema} to={street + 10} cam={{ x: 540, y: 960, zoom: 1 }} bg="transparent">
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: clamp((f - toSchema) / 12) })}>
          <RouteSchematic f={f} draw={easeInOut((f - drawFrom) / (drawTo - drawFrom))} back={0} intro={easeOut((f - toSchema) / 14)} />
        </div>
      </Shot>
      {/* улица Бишкека */}
      <Shot f={f} from={street} to={400} cam={{ x: camX, y: 1300, zoom: 1.3 }} base={{ x: 540, y: 1300, zoom: 1.3 }} bg="transparent">
        <div style={box({ left: -600, top: -200, width: 4000, height: 2400, opacity: clamp((f - street) / 10), backgroundColor: "#FFFFFF" })}>
          <div style={box({ left: 600, top: 200, width: 1, height: 1 })}>
            <Depth depth={0.15}>
              <div style={box({ left: -600, top: 0, width: 4000, height: ROAD_Y, background: "linear-gradient(180deg, #CFE5F6 0%, #EAF3F8 60%, #FFF4E2 100%)" })} />
              <Mountains x={-600} y={380} w={4000} h={420} />
            </Depth>
            <Depth depth={0.55}>
              <PanelHouse x={-200} y={ROAD_Y - 120} w={420} floors={5} color="#E6DACB" seed={11} />
              <PanelHouse x={1100} y={ROAD_Y - 130} w={360} floors={4} color="#DDE4EA" seed={12} />
              <PanelHouse x={1500} y={ROAD_Y - 120} w={330} floors={5} color="#EADFCF" seed={13} />
              <PanelHouse x={2900} y={ROAD_Y - 120} w={420} floors={4} color="#E0E6EC" seed={14} />
            </Depth>
            {/* дом семьи и школа */}
            <PanelHouse x={STREET.home - 360} y={ROAD_Y - 70} w={560} floors={5} color="#F1E7D8" seed={4} door={360} />
            <SchoolBuilding x={STREET.school + 120} y={ROAD_Y - 70} />
            {[200, 760, 1140, 1560, 1980, 2760].map((x, i) => (
              <Tree key={x} x={x} y={ROAD_Y - 60} s={0.85} kind={i % 2 ? "round" : "poplar"} tone={i % 2} />
            ))}
            {/* тротуар, арык, дорога */}
            <div style={box({ left: -600, top: ROAD_Y - 70, width: 4000, height: 40, backgroundColor: "#E4E1DC" })} />
            <div style={box({ left: -600, top: ROAD_Y - 32, width: 4000, height: 12, backgroundColor: "#9FC1DD" })} />
            <div style={box({ left: -600, top: ROAD_Y - 20, width: 4000, height: 260, backgroundColor: "#5C6270" })} />
            <div style={box({ left: -600, top: ROAD_Y + 110, width: 4000, height: 10, backgroundImage: "repeating-linear-gradient(90deg, #FFFFFF 0 90px, transparent 90px 180px)" })} />
            <div style={box({ left: -600, top: ROAD_Y + 240, width: 4000, height: 800, backgroundColor: "#E4E1DC" })} />
            <WhiteCar x={carX} y={ROAD_Y + 80} s={0.95} wheel={wheel} dir={dir} kid />
          </div>
        </div>
      </Shot>
      {f >= street ? (
        <div style={box({ left: 60, right: 60, top: 230, display: "flex", justifyContent: "center", opacity: chipIn })}>
          <div style={{ padding: "18px 36px", borderRadius: 50, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,90,0.18)", fontFamily, fontSize: 50, fontWeight: 900, color: NAVY, border: `6px solid ${YELLOW}`, transform: `translateY(${(1 - chipIn) * -30}px)` }}>
            <span style={{ opacity: chipSwap < 0.5 ? 1 - chipSwap * 2 : (chipSwap - 0.5) * 2 }}>{chipSwap < 0.5 ? BG1_TEXT.route.there : chip}</span>
          </div>
        </div>
      ) : null}
    </>
  );
};

// Утренняя улица Бишкека: горы Ала-Тоо, панельные дома, тополя с
// побелёнными стволами, тротуар с арыком, дорога. Слева — подъезд дома
// («ҮЙ»), дальше по улице — школа с табличкой «МЕКТЕП» и калиткой.
// Белая легковая машина (не жёлтое такси) с жёлтой полосой бренда;
// ребёнок на заднем сиденье, ремень безопасности через плечо и пояс,
// водитель держит руль обеими руками.
// Мир — px; верх тротуара — STREET.walkY.
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { box, Depth, Unflip } from "../shots";
import { Mountains } from "./Apartment";
import { PanelHouse, Sidewalk, Sky, Tree } from "./Outdoor";

export const STREET = {
  walkY: 1500, // линия ног на тротуаре
  curbY: 1640, // край дороги
  carY: 1830, // колёса машины на дороге
  homeDoor: 420,
  schoolX: 2900, // левый край школы
  gateX: 3060,
  len: 4200,
} as const;

export const StreetBack: React.FC<{ readonly offset?: number; readonly label: string; readonly school: string }> = ({ offset = 0, label, school }) => {
  const S = STREET;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <div style={box({ left: -1200, top: -600 })}>
        <Sky w={S.len + 2400} h={1800} />
      </div>
      <Depth depth={0.18}>
        <Mountains x={-1200} y={360} w={S.len + 2400} h={460} />
      </Depth>
      <Depth depth={0.5}>
        {[-600, 600, 1700, 2900, 4000].map((x, i) => (
          <PanelHouse key={x} x={x} y={1300} w={900} floors={6} color={i % 2 ? "#EDE4D6" : "#E6DAC8"} seed={i + 2} />
        ))}
        {[-200, 1720, 3300].map((x) => (
          <Tree key={x} x={x} y={1310} s={1.2} kind="poplar" tone={1} />
        ))}
      </Depth>
      {/* дом героев: подъезд с козырьком и табличкой */}
      <PanelHouse x={-300} y={S.walkY - 10} w={1300} floors={5} color="#EEE3D2" seed={1} door={S.homeDoor + 300} />
      <Unflip style={{ left: S.homeDoor - 64, top: S.walkY - 300, width: 128, height: 52, borderRadius: 12, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontSize: 34, fontWeight: 900, textAlign: "center", lineHeight: "52px" }}>{label}</Unflip>
      {/* школа */}
      <div style={box({ left: S.schoolX, top: S.walkY - 760, width: 1000, height: 750, backgroundColor: "#F4E7CF", borderRadius: "10px 10px 0 0" })}>
        <div style={box({ left: -20, top: -30, width: 1040, height: 40, borderRadius: 8, backgroundColor: "#C9705A" })} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <div key={`${r}${c}`} style={box({ left: 60 + c * 190, top: 70 + r * 200, width: 120, height: 130, borderRadius: 8, backgroundColor: "#AFC8E0", border: "6px solid #FFFFFF", boxSizing: "border-box" })} />
          )),
        )}
        <div style={box({ left: 400, top: 560, width: 200, height: 190, backgroundColor: "#6B4F3E", borderRadius: "10px 10px 0 0" })} />
      </div>
      <Unflip style={{ left: S.schoolX - 50, top: S.walkY - 1000, width: 340, height: 90, borderRadius: 18, backgroundColor: C.navy, border: `6px solid ${C.yellow}`, boxSizing: "border-box", color: "#FFFFFF", fontFamily, fontSize: 52, fontWeight: 900, textAlign: "center", lineHeight: "78px" }}>{school}</Unflip>
      {/* забор и калитка школы */}
      <div style={box({ left: S.schoolX - 200, top: S.walkY - 160, width: 1400, height: 160, backgroundImage: "repeating-linear-gradient(90deg, #6E7B8F 0 8px, transparent 8px 44px)" })} />
      <div style={box({ left: S.schoolX - 200, top: S.walkY - 160, width: 1400, height: 10, backgroundColor: "#6E7B8F" })} />
      <div style={box({ left: S.gateX - 110, top: S.walkY - 190, width: 220, height: 190, backgroundColor: "rgba(255,255,255,0.0)", borderLeft: "16px solid #4E5A6E", borderRight: "16px solid #4E5A6E" })} />
      {/* деревья вдоль арыка */}
      {[-260, 560, 1950, 2420, 3700].map((x) => (
        <Tree key={x} x={x} y={S.walkY + 40} s={1.05} kind={x % 2 ? "round" : "poplar"} />
      ))}
      {/* тротуар, арык, бордюр, дорога */}
      <div style={box({ left: -1200, top: S.walkY - 30, width: S.len + 2400, height: 40, backgroundColor: "#DAD3C7" })} />
      <Sidewalk x={-1200} y={S.walkY + 8} w={S.len + 2400} offset={offset} />
      <div style={box({ left: -1200, top: S.walkY + 226, width: S.len + 2400, height: 900, backgroundColor: "#8F949C" })} />
      <div style={box({ left: -1200, top: S.carY + 60, width: S.len + 2400, height: 14, backgroundImage: "repeating-linear-gradient(90deg, #F4F4F0 0 120px, transparent 120px 240px)" })} />
      {/* утренний свет */}
      <div style={box({ left: -1200, top: -600, width: S.len + 2400, height: 3200, background: "linear-gradient(200deg, rgba(255,236,200,0.25), transparent 60%)" })} />
    </div>
  );
};

// Белая легковая машина (вид сбоку, едет вправо в мире). x — центр,
// y — линия колёс, s — масштаб (единицы машины → px мира). Слои: салон →
// дети, ремни, водитель (children, px мира от точки машины) → кузов
// с вырезами окон → стекло → колёса. wheel — поворот колёс (градусы).
// Окно заднего ряда в единицах машины: x −118…146, y −272…−178.
export const WhiteCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly wheel?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, s = 2.6, wheel = 0, children }) => {
  // кузов с вырезами окон (evenodd)
  const windows = "M -118 -178 Q -78 -270 -12 -272 L 146 -272 L 146 -178 Z M 162 -272 Q 220 -268 252 -184 L 252 -178 L 162 -178 Z";
  const body =
    "M -310 -60 Q -316 -150 -250 -165 L -170 -176 Q -110 -292 -10 -296 L 150 -296 Q 230 -292 275 -186 L 290 -176 Q 330 -168 328 -110 L 326 -40 Q 324 -18 300 -18 L -296 -18 Q -312 -24 -310 -60 Z " + windows;
  const layer = (el: React.ReactNode) => (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`scale(${s})`}>{el}</g>
    </svg>
  );
  return (
    <div style={box({ left: x, top: y, width: 1, height: 1 })}>
      {layer(
        <>
          <ellipse cx={0} cy={6} rx={300} ry={16} fill="rgba(20,25,40,0.22)" />
          {/* салон: спинки сидений */}
          <path d={windows} fill="#E9EDF3" />
          {/* спинка заднего сиденья (дети сидят перед ней) и подголовники */}
          <rect x={-104} y={-250} width={124} height={110} rx={22} fill="#5A6478" />
          <rect x={-8} y={-286} width={30} height={40} rx={12} fill="#5A6478" />
          {/* спинка переднего сиденья (водитель) */}
          <rect x={150} y={-262} width={30} height={110} rx={14} fill="#5A6478" />
        </>,
      )}
      {/* салон обрезан по порогу кузова: ноги детей не видны под машиной */}
      <div style={box({ left: -2000, top: -2000, width: 4000, height: 2000 - 20 * s, overflow: "hidden" })}>
        <div style={box({ left: 2000, top: 2000, width: 1, height: 1 })}>{children}</div>
      </div>
      {layer(
        <>
          <path d={body} fill="#FBFCFD" fillRule="evenodd" stroke="#D5DBE4" strokeWidth={4} />
          {/* жёлтая полоса бренда и детали */}
          <path d="M -306 -96 L 326 -96" stroke={C.yellow} strokeWidth={16} />
          <path d="M 154 -176 L 154 -30" stroke="#D5DBE4" strokeWidth={4} />
          <path d="M -14 -176 L -14 -30" stroke="#D5DBE4" strokeWidth={4} />
          <rect x={80} y={-150} width={34} height={8} rx={4} fill="#AEB7C5" />
          <rect x={232} y={-150} width={34} height={8} rx={4} fill="#AEB7C5" />
          <rect x={306} y={-150} width={18} height={24} rx={6} fill="#FFE7A8" />
          <rect x={-312} y={-150} width={12} height={24} rx={5} fill="#E25B4E" />
          {/* стекло и блик */}
          <path d={windows} fill="rgba(170,205,235,0.22)" />
          <path d="M -70 -268 L -40 -268 L -96 -182 L -114 -182 Z" fill="rgba(255,255,255,0.32)" />
          {[-196, 196].map((wx) => (
            <g key={wx} transform={`translate(${wx} -22) rotate(${wheel})`}>
              <circle r={52} fill="#23262E" />
              <circle r={28} fill="#C3C9D2" />
              <rect x={-4} y={-26} width={8} height={52} fill="#8C929C" />
              <rect x={-26} y={-4} width={52} height={8} fill="#8C929C" />
            </g>
          ))}
        </>,
      )}
    </div>
  );
};

// Водитель (силуэт за рулём): обе руки на руле, взгляд на дорогу.
// Координаты — единицы машины, s — масштаб машины.
export const Driver: React.FC<{ readonly s?: number }> = ({ s = 2.6 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`scale(${s}) translate(-14 22)`}>
    <path d="M 168 -178 Q 170 -232 206 -236 Q 238 -232 240 -178 Z" fill="#4C5A78" />
    <circle cx={204} cy={-252} r={22} fill="#C99A78" />
    <path d="M 182 -262 Q 204 -284 226 -262 Q 222 -276 204 -278 Q 186 -276 182 -262 Z" fill="#2B2422" />
    <circle cx={218} cy={-254} r={3} fill="#2B2422" />
    <path d="M 182 -262 Q 180 -247 188 -239 L 191 -258 Z" fill="#2B2422" />
    <circle cx={194} cy={-251} r={4.5} fill="#B8876A" />
    <path d="M 213 -261 L 222 -260" stroke="#2B2422" strokeWidth={2} strokeLinecap="round" />
    <path d="M 225 -252 Q 229 -248 225 -245" stroke="#A97C5E" strokeWidth={2} fill="none" strokeLinecap="round" />
    <path d="M 213 -240 Q 218 -237 222 -241" stroke="#7A4A3A" strokeWidth={2} fill="none" strokeLinecap="round" />
    <ellipse cx={244} cy={-206} rx={8} ry={26} fill="none" stroke="#2B303C" strokeWidth={7} />
    <path d="M 206 -214 L 240 -214" stroke="#C99A78" strokeWidth={9} strokeLinecap="round" />
    </g>
  </svg>
);

// Ремень безопасности ребёнка: через плечо к бедру (координаты машины).
export const Belt: React.FC<{ readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number; readonly click?: number }> = ({ x0, y0, x1, y1, click = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <path d={`M ${x0} ${y0} L ${x0 + (x1 - x0) * click} ${y0 + (y1 - y0) * click}`} stroke="#2E3240" strokeWidth={14} strokeLinecap="round" />
    <path d={`M ${x0} ${y0} L ${x0 + (x1 - x0) * click} ${y0 + (y1 - y0) * click}`} stroke="#4A5064" strokeWidth={4} strokeLinecap="round" />
    {click >= 0.98 ? <rect x={x1 - 12} y={y1 - 10} width={24} height={18} rx={4} fill="#C3C9D2" stroke="#7D8594" strokeWidth={2} /> : null}
  </svg>
);

// Гостиная обычной бишкекской квартиры в пятницу вечером — единственный
// уютный ракурс ролика. Окно на закат: тёмные силуэты Ала-Тоо, панельные
// дома с огнями и тополь; лёгкие шторы, полка с книгами, торшер, круглое
// панно с кыргызским орнаментом. Стол у окна: сын с книгой, мама с
// блокнотом, папа с рабочим календарём. Еды на столе нет.
// Мир — px; пол (низ стены) — y = 1500, ступни сидящих — y = 1540
// (те же метрики, что у рига персонажей 2D-роликов проекта).
import { Mountains, Ornament } from "../../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { box } from "../../../two-schedules-2d/shots";

const TOP = 1240;

export const ROOM = {
  floorY: 1500,
  seatY: 1540,
  window: { x: 230, y: 330, w: 600, h: 660 },
  shelf: { x: 1470, y: 520, w: 330 },
  lamp: { x: 1560 },
  table: { x: 500, top: TOP, w: 940, front: TOP + 26, bottom: 1580 },
  seat: { son: 690, mom: 1000, dad: 1300 },
  book: { x: 730, y: TOP + 6 },
  notebook: { x: 915, y: TOP + 6 },
  planner: { x: 1175, y: TOP + 6 },
  phone: { x: 1075, y: TOP + 8 },
} as const;

const C = {
  wall: "#EAD3B6",
  wallLow: "#DDBF9C",
  rail: "#C9A47E",
  floor: "#B88A62",
  wood: "#8A5E43",
  woodDark: "#6E4935",
};

// Задний план: стена, окно с закатом, шторы, полка, панно, торшер.
export const RoomBack: React.FC<{ readonly f: number; readonly dusk?: number }> = ({ f, dusk = 0 }) => {
  const w = ROOM.window;
  // закат медленно темнеет за ролик (dusk 0…1)
  const glow = 1 - 0.35 * dusk;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -400, top: 0, width: 3000, height: ROOM.floorY, backgroundColor: C.wall })} />
      {/* лёгкий узор обоев */}
      <div style={box({ left: -400, top: 0, width: 3000, height: 1160, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 3px, transparent 3px 64px)" })} />
      <div style={box({ left: -400, top: 1160, width: 3000, height: ROOM.floorY - 1160, backgroundColor: C.wallLow })} />
      <div style={box({ left: -400, top: 1152, width: 3000, height: 12, backgroundColor: C.rail })} />
      {/* пол и ковёр */}
      <div style={box({ left: -400, top: ROOM.floorY, width: 3000, height: 1100, background: `linear-gradient(180deg, ${C.floor}, #A87B55)` })} />
      <div style={box({ left: 300, top: 1600, width: 1340, height: 420, borderRadius: 30, backgroundColor: "#B5503F", opacity: 0.9 })}>
        <div style={box({ left: 26, top: 26, right: 26, bottom: 26, border: "10px solid #F1C66A", borderRadius: 20, opacity: 0.8 })} />
      </div>

      {/* окно на закат */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 12,
          overflow: "hidden",
          background: `linear-gradient(180deg, #45507F, #8E6F8C 45%, rgba(242,166,110,${glow}) 78%, #F6C78E)`,
          border: "18px solid #FBF6EC",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          <div style={box({ left: w.x + 380, top: w.y + 300 + dusk * 30, width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFD9A0", opacity: 0.85 * glow, boxShadow: "0 0 60px 30px rgba(255,200,140,0.45)" })} />
          <Mountains x={w.x - 60} y={w.y + 250} w={w.w + 120} h={210} evening={1} />
          <PanelHouse x={w.x - 100} y={w.y + 600} w={360} floors={3} color="#3A3F62" seed={4} />
          <PanelHouse x={w.x + 300} y={w.y + 640} w={360} floors={3} color="#353A5C" seed={7} />
          <Tree x={w.x + 250} y={w.y + 660} s={0.72} kind="poplar" tone={1} />
        </div>
        {/* огни в окнах домов: загораются по одному */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={box({
              left: 24 + ((i * 83) % 520),
              top: 470 + (i % 3) * 52,
              width: 34,
              height: 28,
              backgroundColor: "#F6D48A",
              opacity: f > i * 40 ? 0.9 : 0.15,
            })}
          />
        ))}
        {/* переплёт */}
        <div style={box({ left: w.w / 2 - 26, top: 0, width: 16, height: w.h, backgroundColor: "#FBF6EC" })} />
        <div style={box({ left: 0, top: 230, width: w.w, height: 14, backgroundColor: "#FBF6EC" })} />
      </div>
      <div style={box({ left: w.x - 30, top: w.y + w.h - 8, width: w.w + 60, height: 26, borderRadius: 6, backgroundColor: "#F7F0E3" })} />
      {/* шторы */}
      <div style={box({ left: w.x - 120, top: w.y - 60, width: 150, height: w.h + 210, borderRadius: "0 0 40px 40px", background: "linear-gradient(90deg, #F2E6D2, #E5D3B8)" })} />
      <div style={box({ left: w.x + w.w - 30, top: w.y - 60, width: 150, height: w.h + 210, borderRadius: "0 0 40px 40px", background: "linear-gradient(90deg, #E5D3B8, #F2E6D2)" })} />
      <div style={box({ left: w.x - 160, top: w.y - 74, width: w.w + 320, height: 16, borderRadius: 8, backgroundColor: C.woodDark })} />

      {/* панно с орнаментом */}
      <div style={box({ left: 990, top: 520, width: 230, height: 230, borderRadius: 115, backgroundColor: "#C4513F", border: "10px solid #F3D9A6", boxSizing: "border-box" })}>
        <svg width={210} height={210} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <Ornament x={105} y={105} s={1.35} color="#F6E2B5" />
        </svg>
      </div>

      {/* полка с книгами и цветком */}
      <Shelf />

      {/* торшер */}
      <div style={box({ left: ROOM.lamp.x - 5, top: 760, width: 10, height: 740, backgroundColor: "#4E3C30" })} />
      <div style={box({ left: ROOM.lamp.x - 60, top: 1484, width: 120, height: 18, borderRadius: 9, backgroundColor: "#4E3C30" })} />
      <div style={box({ left: ROOM.lamp.x - 100, top: 640, width: 200, height: 150, borderRadius: "40px 40px 10px 10px", backgroundColor: "#F4CF8C", boxShadow: "0 0 80px 30px rgba(255,214,140,0.35)" })} />
    </div>
  );
};

const Shelf: React.FC = () => {
  const s = ROOM.shelf;
  const books = ["#2F4A7A", "#E2B33C", "#7FAF63", "#C4513F", "#5E9A93", "#F2E6D2", "#2F4A7A", "#E5677A"];
  return (
    <>
      {[0, 1].map((row) => (
        <div key={row}>
          <div style={box({ left: s.x, top: s.y + 150 + row * 190, width: s.w, height: 16, borderRadius: 4, backgroundColor: C.wood })} />
          {books.slice(row * 3, row * 3 + 5).map((c, i) => (
            <div
              key={i}
              style={box({
                left: s.x + 20 + i * 40 + (row ? 60 : 0),
                top: s.y + 150 + row * 190 - (110 + ((i * 13) % 30)),
                width: 32,
                height: 110 + ((i * 13) % 30),
                borderRadius: 4,
                backgroundColor: c,
                rotate: i === 4 ? "12deg" : "0deg",
                transformOrigin: "bottom left",
              })}
            />
          ))}
        </div>
      ))}
      {/* цветок в горшке */}
      <div style={box({ left: s.x + 250, top: s.y + 40, width: 60, height: 110 })}>
        <div style={box({ left: 0, top: 64, width: 60, height: 46, borderRadius: "6px 6px 16px 16px", backgroundColor: "#D9805E" })} />
        <div style={box({ left: 8, top: 0, width: 26, height: 70, borderRadius: "50% 50% 50% 50%", backgroundColor: "#6E9E5B", rotate: "-20deg" })} />
        <div style={box({ left: 26, top: 6, width: 26, height: 66, borderRadius: "50%", backgroundColor: "#7FAF63", rotate: "18deg" })} />
      </div>
      {/* семейное фото */}
      <div style={box({ left: s.x + 70, top: s.y + 340 - 130, width: 120, height: 100, borderRadius: 6, backgroundColor: "#FBF6EC", border: "8px solid #8A5E43", boxSizing: "border-box" })}>
        <div style={box({ left: 14, top: 30, width: 26, height: 26, borderRadius: 13, backgroundColor: "#D29B74" })} />
        <div style={box({ left: 44, top: 22, width: 30, height: 30, borderRadius: 15, backgroundColor: "#C5906B" })} />
        <div style={box({ left: 30, top: 50, width: 50, height: 30, borderRadius: 10, backgroundColor: "#5E9A93" })} />
      </div>
    </>
  );
};

// Спинка стула за сидящим (рисуется до персонажа).
export const ChairBack: React.FC<{ readonly x: number; readonly h?: number }> = ({ x, h = 760 }) => {
  const s = h / 760;
  return (
    <div style={box({ left: x - 100 * s, top: ROOM.seatY - 540 * s, width: 200 * s, height: 540 * s })}>
      <div style={box({ left: 8 * s, top: 0, width: 184 * s, height: 46 * s, borderRadius: 18 * s, backgroundColor: C.wood })} />
      <div style={box({ left: 18 * s, top: 34 * s, width: 22 * s, height: 506 * s, backgroundColor: C.wood })} />
      <div style={box({ left: 160 * s, top: 34 * s, width: 22 * s, height: 506 * s, backgroundColor: C.wood })} />
    </div>
  );
};

// Стол: белая скатерть почти до пола с жёлто-синей полосой
// (поверх тел сидящих; руки рисуются поверх).
export const TableFront: React.FC = () => {
  const t = ROOM.table;
  const drape = t.bottom - 60; // скатерть почти до пола
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x + 40, top: drape - 10, width: 30, height: ROOM.seatY + 10 - drape, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x + t.w - 70, top: drape - 10, width: 30, height: ROOM.seatY + 10 - drape, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x - 12, top: t.top - 4, width: t.w + 24, height: t.front - t.top + 8, borderRadius: 10, backgroundColor: "#F7F1E6" })} />
      <div style={box({ left: t.x - 12, top: t.front, width: t.w + 24, height: drape - t.front, backgroundColor: "#EFE5D3", borderRadius: "0 0 16px 16px" })} />
      <div style={box({ left: t.x - 12, top: drape - 34, width: t.w + 24, height: 12, backgroundColor: "#F2C230", opacity: 0.85 })} />
      <div style={box({ left: t.x - 12, top: drape - 16, width: t.w + 24, height: 5, backgroundColor: "#2F4A7A", opacity: 0.6 })} />
    </div>
  );
};

// Тёплый свет вечера поверх сцены (без затемнения кадра).
export const WarmLight: React.FC = () => (
  <div
    style={box({
      left: -400,
      top: 0,
      width: 3000,
      height: 2600,
      background: "radial-gradient(circle at 1560px 700px, rgba(255,205,130,0.30), transparent 900px), radial-gradient(circle at 520px 700px, rgba(255,190,140,0.18), transparent 700px)",
      pointerEvents: "none",
    })}
  />
);

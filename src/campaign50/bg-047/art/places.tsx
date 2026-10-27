// Дом и школа героя на карте + пунктирный маршрут между ними (по улицам).
// Используются в нескольких сценах, чтобы мир оставался одним и тем же.
import { SPOT } from "./MapSheet";
import { Home, School } from "./popups";
import { C } from "./palette";
import { Flat, Standee } from "./Stage";

// Маршрут дом → школа по улицам (координаты листа).
export const ROUTE_PTS: readonly (readonly [number, number])[] = [
  [SPOT.home.x, SPOT.home.y - 20],
  [SPOT.home.x, 900],
  [560, 900],
  [560, 640],
  [560, SPOT.school.y + 30],
  [SPOT.school.x - 40, SPOT.school.y + 30],
];

export const HeroPlaces: React.FC<{
  readonly home: number; // 0…1 раскрытие
  readonly school: number;
  readonly route?: number; // 0…1 прорисовка маршрута
  readonly flag?: number; // фаза флажка школы
  readonly angle?: number;
}> = ({ home, school, route = 0, flag = 0, angle = 72 }) => {
  const d = ROUTE_PTS.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <>
      {route > 0 ? (
        <Flat z={0.8}>
          <svg width={1000} height={1300} viewBox="0 0 1000 1300" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={d} fill="none" stroke={C.yellow} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${route} 1`} opacity={0.85} />
            <path
              d={d}
              fill="none"
              stroke={C.navy}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 14"
              style={{ clipPath: "none" }}
              opacity={route >= 0.98 ? 1 : 0}
            />
          </svg>
        </Flat>
      ) : null}
      {home > 0 ? (
        <Standee x={SPOT.home.x} y={SPOT.home.y} w={150} h={150} up={home} angle={angle} shadow={86}>
          <Home />
        </Standee>
      ) : null}
      {school > 0 ? (
        <Standee x={SPOT.school.x} y={SPOT.school.y} w={240} h={170} up={school} angle={angle} shadow={130}>
          <School flag={flag} />
        </Standee>
      ) : null}
    </>
  );
};

// Наклейка в руке (плоская, до того как раскрылась на карте).
export const Sticker: React.FC<{ readonly kind: "home" | "school"; readonly size?: number }> = ({ kind, size = 120 }) => (
  <div
    style={{
      position: "absolute",
      left: -size / 2,
      top: -size / 2,
      width: size,
      height: size,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      border: `4px solid ${C.navy}`,
      boxShadow: "0 8px 14px rgba(20,40,90,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}
  >
    <div style={{ transform: `scale(${(size / 150) * (kind === "school" ? 0.6 : 0.8)})`, transformOrigin: "50% 50%" }}>{kind === "home" ? <Home mark={false} /> : <School />}</div>
  </div>
);

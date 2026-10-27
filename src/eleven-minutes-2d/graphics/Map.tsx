// Карта Бишкека в тёмной подаче: кварталы, улицы, арык, сквер; узлы
// «Кеңсе», «Мектеп», «Үй»; маршруты этапов прорисовываются по мере
// событий, маркер движется по текущему этапу. Камера карты — точка и
// масштаб в координатах карты. Это повествовательная графика (навигатор
// отца), а не отслеживание поездок BalaGo.
import { fontFamily } from "../../fonts";
import { EM2_TEXT } from "../script";
import { BUSY_SPOTS, NODE, ON_FOOT, ROUTE, STAGE_MOVE } from "../story";
import { C } from "../theme";
import { clamp, easeInOut } from "../rig/motion";
import { partial, pointAt, polyLength, toPath, type P } from "./geom";

export type MapCam = { readonly x: number; readonly y: number; readonly zoom: number };

const STREETS_H = [70, 190, 320, 500, 650, 860, 1030];
const STREETS_V = [90, 250, 460, 650, 850, 960];

const NodePin: React.FC<{ p: P; label: string; kind: "office" | "school" | "home"; glow?: number; s: number }> = ({ p, label, kind, glow = 0, s }) => (
  <g transform={`translate(${p.x} ${p.y}) scale(${s})`}>
    {glow > 0 ? <circle r={46} fill={C.yellow} opacity={0.18 * glow} /> : null}
    <circle r={26} fill={C.panel} stroke={glow > 0.5 ? C.yellow : "#C9D6E8"} strokeWidth={4} />
    {kind === "office" ? (
      <g fill="#C9D6E8">
        <rect x={-11} y={-6} width={22} height={15} rx={3} />
        <rect x={-5} y={-11} width={10} height={6} rx={2} fill="none" stroke="#C9D6E8" strokeWidth={3} />
      </g>
    ) : kind === "school" ? (
      <g fill="#C9D6E8">
        <path d="M -13 -2 L 0 -12 L 13 -2 Z" />
        <rect x={-10} y={-2} width={20} height={12} />
        <rect x={-3} y={3} width={6} height={7} fill={C.panel} />
      </g>
    ) : (
      <path d="M -12 0 L 0 -11 L 12 0 L 9 0 L 9 11 L -9 11 L -9 0 Z" fill="#C9D6E8" />
    )}
    <text y={52} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={30} fill={C.text} paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {label}
    </text>
  </g>
);

// Прогресс прорисовки этапа в момент t (с).
export const routeProgress = (id: string, t: number) => {
  const m = STAGE_MOVE[id];
  if (!m) return 0;
  return easeInOut(clamp((t - m[0]) / Math.max(0.1, m[1] - m[0])));
};

export const MapView: React.FC<{
  readonly t: number; // секунды ролика
  readonly cam: MapCam;
  readonly w: number;
  readonly h: number;
  readonly routes?: readonly string[]; // какие этапы показывать (по умолчанию все)
  readonly dim?: readonly string[]; // приглушённые этапы
  readonly preview?: number; // 0…1: прорисовка маршрута «Кеңсе → Мектеп» (сцена 1, 3, 11)
  readonly busy?: number; // 0…1: занятые места у школы
  readonly traffic?: number; // 0…1: плотный поток на пути домой
  readonly glow?: "office" | "school" | "home";
  readonly f: number; // кадр (для мерцания маркера)
}> = ({ t, cam, w, h, routes, dim = [], preview = 0, busy = 0, traffic = 0, glow, f }) => {
  const s = 1 / cam.zoom; // толщина линий и подписей не растёт при приближении
  const shown = routes ?? Object.keys(ROUTE);
  const active = shown.filter((id) => routeProgress(id, t) > 0 && routeProgress(id, t) < 1);
  const cur = active[active.length - 1];
  const marker = cur ? pointAt(ROUTE[cur], routeProgress(cur, t)) : null;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={w} height={h} fill={C.panel2} />
      <g transform={`translate(${w / 2} ${h / 2}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>
        {/* кварталы */}
        {STREETS_H.slice(0, -1).map((y0, i) =>
          STREETS_V.slice(0, -1).map((x0, j) => (
            <rect key={`${i}-${j}`} x={x0 + 14} y={y0 + 14} width={STREETS_V[j + 1] - x0 - 28} height={STREETS_H[i + 1] - y0 - 28} rx={10} fill={(i + j) % 5 === 2 ? "#0F2420" : "#121C29"} stroke={C.lineSoft} strokeWidth={2 * s} />
          )),
        )}
        {/* арык вдоль улицы и сквер */}
        <path d="M 60 585 L 1000 585" stroke="#1E4157" strokeWidth={6 * s} strokeDasharray={`${14 * s} ${10 * s}`} opacity={0.7} />
        {/* улицы */}
        {STREETS_H.map((y) => (
          <line key={`h${y}`} x1={40} y1={y} x2={1010} y2={y} stroke={C.street} strokeWidth={5 * s} opacity={0.75} />
        ))}
        {STREETS_V.map((x) => (
          <line key={`v${x}`} x1={x} y1={20} x2={x} y2={1080} stroke={C.street} strokeWidth={5 * s} opacity={0.75} />
        ))}
        {/* декоративная сетка координат */}
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x={60} y={110 + i * 220} fontFamily={fontFamily} fontSize={14 * s} fill={C.dim} opacity={0.35}>
            {`${42 + i}.8° Т · 74.${58 + i}° Ч`}
          </text>
        ))}
        {/* занятые места у входа */}
        {busy > 0
          ? BUSY_SPOTS.map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y})`} opacity={clamp(busy * 3 - i)}>
                <rect x={-26} y={-16} width={52} height={32} rx={7} fill="#2A1A1A" stroke={C.coral} strokeWidth={3 * s} />
                <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={C.coral} strokeWidth={4 * s} strokeLinecap="round" />
              </g>
            ))
          : null}
        {/* плотный поток: машины-точки на перекрёстке по пути домой */}
        {traffic > 0
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={640 - 12 + Math.sin(i * 2.1) * 4} y={890 + i * 22 + Math.sin(f / 20 + i) * 3} width={24} height={14} rx={4} fill={C.coral} opacity={0.55 * traffic} />
            ))
          : null}
        {/* маршрут «Кеңсе → Мектеп» (тот же, что в сцене 1) */}
        {preview > 0 ? (
          <path d={toPath(partial(ROUTE.drive, preview))} stroke={C.yellow} strokeWidth={9 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {/* этапы поездки */}
        {shown.map((id) => {
          const u = routeProgress(id, t);
          if (u <= 0) return null;
          const foot = ON_FOOT.has(id);
          const color = id === "drive" ? C.yellow : C.coral;
          return (
            <path
              key={id}
              d={toPath(partial(ROUTE[id], u))}
              stroke={color}
              strokeWidth={(foot ? 6 : 9) * s}
              strokeDasharray={foot ? `${4 * s} ${16 * s}` : undefined}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={dim.includes(id) ? 0.3 : 1}
            />
          );
        })}
        <NodePin p={NODE.office} label={EM2_TEXT.office} kind="office" glow={glow === "office" ? 1 : 0} s={s} />
        <NodePin p={NODE.school} label={EM2_TEXT.school} kind="school" glow={glow === "school" ? 1 : 0} s={s} />
        <NodePin p={NODE.home} label={EM2_TEXT.home} kind="home" glow={glow === "home" ? 1 : 0} s={s} />
        {/* место парковки (если этап парковки уже начат) */}
        {routeProgress("park", t) > 0.95 && shown.includes("park") ? (
          <g transform={`translate(${NODE.park.x + 34 * s} ${NODE.park.y - 30 * s}) scale(${s})`}>
            <rect x={-18} y={-18} width={36} height={36} rx={8} fill="#2B5CC8" />
            <text y={11} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={28} fill="#FFFFFF">
              P
            </text>
          </g>
        ) : null}
        {marker ? (
          <g transform={`translate(${marker.x} ${marker.y}) scale(${s})`}>
            <circle r={20 + 4 * Math.sin(f / 5)} fill={ON_FOOT.has(cur!) ? C.coral : C.yellow} opacity={0.25} />
            <circle r={12} fill={ON_FOOT.has(cur!) ? C.coral : C.yellow} stroke={C.bg} strokeWidth={4} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

export const routeLen = (id: string) => polyLength(ROUTE[id]);

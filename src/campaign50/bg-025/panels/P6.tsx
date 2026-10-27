// Печать панели 6/6 бумажной ленты (координаты панели RIB.w × RIB.h):
// «Туруктуу каттам». Вверху — маленький маршрут дня значками
// үй → мектеп → үй и знак повтора; ниже — бумажная полоса недели: пять
// карточек дней (Дш Шш Шр Бш Жм), в каждой значок машины и кружок
// отметки; под ними — дорожка, по которой маленькая белая машина
// проезжает от дня к дню, и каждый день получает галочку (ритм
// повторяющегося маршрута). Итог: все пять дней отмечены, машина стоит
// в конце недели.
// t — кадры с момента, когда панель легла плашмя (большое t — итог).
// Сцена передаёт ход машины (show); по умолчанию — итог.
import { Car, Icon } from "../art";
import { box, settle } from "../kit";
import { clamp, easeInOut } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

const T = BG25_TEXT.step56;
const DONE = 9999;

export const P6_DAYS = { x0: 52, y: 150, w: 122, h: 272, gap: 21 } as const;
export const P6_ROAD = { x0: 34, x1: 786, y: 470, h: 70 } as const;
export const p6DayX = (i: number) => P6_DAYS.x0 + i * (P6_DAYS.w + P6_DAYS.gap) + P6_DAYS.w / 2;
const CAR_S = 0.3;
const CAR_START = P6_ROAD.x0 + 30;

// Ход машины по неделе: от начала дорожки к каждому дню по очереди
// (seg кадров на отрезок: движение, короткая остановка у дня).
// t — кадры от старта; возвращает положение, поворот колёс и подскок.
export const P6_SEG = 8;
export const p6Drive = (t: number, seg = P6_SEG) => {
  const stops = [CAR_START, ...[0, 1, 2, 3, 4].map(p6DayX)];
  if (t <= 0) return { x: stops[0], roll: 0, hop: 0 };
  const move = seg - 2;
  const i = Math.min(4, Math.floor(t / seg));
  const u = clamp((t - i * seg) / move);
  const e = easeInOut(u);
  const x = stops[i] + (stops[i + 1] - stops[i]) * e;
  const done = t >= 5 * seg;
  return { x: done ? stops[5] : x, roll: done ? 0 : (x - stops[0]) * 2.2, hop: done ? 0 : -6 * Math.sin(Math.PI * u) };
};
// Кадр (от старта) прибытия машины к дню i — тогда день отмечается.
export const p6TickAt = (i: number, seg = P6_SEG) => i * seg + (seg - 2);

export type P6Show = {
  readonly drive?: number; // кадры от старта машины
  readonly seg?: number;
};

// Маленький маршрут дня: үй → мектеп → үй и знак повтора.
const DayRoute: React.FC = () => {
  const dot = (kind: "home" | "school", key: string) => (
    <div key={key} style={{ width: 66, height: 66, borderRadius: 999, backgroundColor: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon kind={kind} s={44} color={C.navy} w={4.6} />
    </div>
  );
  const arrow = (key: string) => (
    <svg key={key} width={44} height={24} viewBox="0 0 44 24">
      <path d="M4 12 H36 M28 4 L38 12 L28 20" fill="none" stroke={C.inkSoft} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <div style={box({ left: 46, top: 40, display: "flex", alignItems: "center", gap: 10 })}>
      {dot("home", "h1")}
      {arrow("a1")}
      {dot("school", "s")}
      {arrow("a2")}
      {dot("home", "h2")}
      {/* повтор каждый день */}
      <svg width={64} height={64} viewBox="0 0 48 48" style={{ marginLeft: 14 }}>
        <path d="M38 22 A14 14 0 1 0 33 34" fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M31 21 L38.5 23 L41 15.5" fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Карточка дня: название, значок машины, кружок отметки.
const Day: React.FC<{ readonly i: number; readonly tick: number }> = ({ i, tick }) => {
  const on = tick >= 0;
  const k = on ? settle(tick, 12) : 0;
  const draw = on ? easeInOut(tick / 8) : 0;
  const ring = on && tick < 16 ? tick / 16 : -1;
  const { w, h, y } = P6_DAYS;
  const x = p6DayX(i) - w / 2;
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 26,
        backgroundColor: C.white,
        border: `${on ? 4 : 3}px solid ${on ? C.navy : "#CBD5E2"}`,
        boxSizing: "border-box",
        boxShadow: on ? "0 6px 0 rgba(20,40,90,0.06)" : "none",
      })}
    >
      <div style={box({ left: 0, right: 0, top: 18, textAlign: "center", fontFamily: F.text, fontWeight: 900, fontSize: 46, lineHeight: 1, color: C.navy })}>{T.days[i]}</div>
      <div style={box({ left: w / 2 - 34 - 4, top: 92, width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <Icon kind="car" s={66} color={on ? C.navy : "#B8C3D3"} w={4.4} />
      </div>
      {/* отметка */}
      <div style={box({ left: w / 2 - 34 - 4, top: 176, width: 68, height: 68 })}>
        {ring >= 0 ? <div style={box({ left: 34 - 34 * (1 + 0.6 * ring), top: 34 - 34 * (1 + 0.6 * ring), width: 68 * (1 + 0.6 * ring), height: 68 * (1 + 0.6 * ring), borderRadius: 999, border: `4px solid ${C.yellow}`, boxSizing: "border-box", opacity: 0.85 * (1 - ring) })} /> : null}
        <div style={box({ inset: 0, borderRadius: 999, border: `4px dashed #C3CEDC`, boxSizing: "border-box", opacity: 1 - clamp(k * 1.5) })} />
        {on ? (
          <div style={box({ inset: 0, borderRadius: 999, backgroundColor: C.yellow, transform: `scale(${0.4 + 0.6 * k})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
            <svg width={46} height={46} viewBox="0 0 48 48">
              <path d="M10 25 L20 35 L39 14" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const P6Art: React.FC<{ readonly t: number; readonly show?: P6Show }> = ({ show }) => {
  const seg = show?.seg ?? P6_SEG;
  const drive = show?.drive ?? DONE;
  const car = p6Drive(drive, seg);
  const { x0, x1, y, h } = P6_ROAD;
  return (
    <>
      <DayRoute />
      {[0, 1, 2, 3, 4].map((i) => (
        <Day key={i} i={i} tick={drive - p6TickAt(i, seg)} />
      ))}
      {/* дорожка недели */}
      <svg width={820} height={620} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <rect x={x0} y={y} width={x1 - x0} height={h} rx={h / 2} fill={C.road} />
        <path d={`M ${x0 + 40} ${y + h / 2} H ${x1 - 40}`} stroke={C.roadLine} strokeWidth={6} strokeDasharray="22 18" strokeLinecap="round" />
        {/* отметки дней на дорожке */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={p6DayX(i)} cy={y - 14} r={6} fill={drive >= p6TickAt(i, seg) ? C.yellowDeep : "#CBD5E2"} />
        ))}
        <Car x={car.x} y={y + h - 8} s={CAR_S} roll={car.roll} bounce={car.hop} kids={2} />
      </svg>
    </>
  );
};

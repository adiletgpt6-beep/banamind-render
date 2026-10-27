// Сцены 1, 2, 4, 5 — одна непрерывная кинематографичная карта Бишкека:
// наклонённая плоскость с сеткой кварталов, горы Ала-Тоо на горизонте,
// камера плавно двигается между планами.
//   1. Палец касается «Жумуш» и ведёт жёлтую извилистую дорогу к «Мектеп».
//   2. Машина мамы (голубая, без BalaGo): жумуш → мектеп (ребёнок садится)
//      → үй → снова жумуш; красный след показывает крюк, полоса рабочего
//      дня сверху рвётся на две части.
//   4. После заявки старый крюк гаснет, рисуется круг ҮЙ → МЕКТЕП → ҮЙ;
//      рабочий день снова целый.
//   5. Соседние дома сходятся в небольшую группу; после подбора — первая
//      полная пробная поездка (белая машина BalaGo по кругу группы).
import { fontFamily } from "../../../fonts";
import {
  CarTop,
  CheckIcon,
  easeInOut,
  easeOut,
  House,
  Mountains,
  NAVY,
  NAVY_SOFT,
  popScale,
  prog,
  School,
  WA_GREEN,
  YELLOW,
} from "../art";
import type { Bg05Beats } from "../beats";
import {
  camAt,
  DISTRICTS,
  headingAt,
  lengthOf,
  P,
  pathD,
  pointAt,
  project,
  ROUTE_DETOUR_1,
  ROUTE_DETOUR_2,
  ROUTE_DETOUR_3,
  ROUTE_GROUP,
  ROUTE_HOOK,
  ROUTE_LOOP,
  SCREEN,
  WORLD,
  type Cam,
  type Pt,
} from "../map";
import { BG05_TEXT } from "../script";

const T = BG05_TEXT;
// поля плоскости карты вокруг мира (мировые единицы)
const M = { x: 600, top: 900, bottom: 380 } as const;
const RED = "#E8603C";

// детерминированный «шум» для разнообразия кварталов
const h01 = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Кварталы, парки, проспекты и канал — статичная плоскость (мировые координаты)
const Blocks: React.FC = () => {
  const { step, off } = WORLD;
  const out: React.ReactNode[] = [];
  for (let i = -6; i < 17; i++) {
    for (let j = -8; j < 20; j++) {
      const x = off + i * step + 13;
      const y = off + j * step + 13;
      const r = h01(i, j);
      const park =
        r > 0.9 ||
        (i === 3 && j === 6) ||
        (i === 4 && j === 6) ||
        (i === 7 && j === 9);
      const fill = park
        ? "#CFEAD6"
        : r > 0.55
          ? "#FFFFFF"
          : r > 0.25
            ? "#F6F8FC"
            : "#EEF2F8";
      out.push(
        <rect
          key={`${i}-${j}`}
          x={x}
          y={y}
          width={step - 26}
          height={step - 26}
          rx={12}
          fill={fill}
        />,
      );
      // маленькие «дома» внутри квартала
      if (!park && r > 0.35) {
        out.push(
          <rect
            key={`b${i}-${j}`}
            x={x + 14}
            y={y + 14}
            width={30 + r * 30}
            height={22}
            rx={4}
            fill="#E1E7F0"
          />,
        );
        out.push(
          <rect
            key={`c${i}-${j}`}
            x={x + 52}
            y={y + 50}
            width={26}
            height={28 + r * 10}
            rx={4}
            fill="#E1E7F0"
          />,
        );
      }
      if (park) {
        out.push(
          <circle
            key={`t${i}-${j}`}
            cx={x + 32}
            cy={y + 34}
            r={13}
            fill="#A9D9B4"
          />,
        );
        out.push(
          <circle
            key={`u${i}-${j}`}
            cx={x + 66}
            cy={y + 60}
            r={16}
            fill="#A9D9B4"
          />,
        );
      }
    }
  }
  return <g>{out}</g>;
};

const Avenues: React.FC = () => {
  const { step, off } = WORLD;
  // широкие проспекты (условные, без названий)
  const ys = [off + 6 * step, off + 13 * step];
  const xs = [off + 5 * step];
  return (
    <g>
      {ys.map((y) => (
        <rect
          key={`y${y}`}
          x={-1200}
          y={y - 13}
          width={4000}
          height={26}
          fill="#D3DCE8"
        />
      ))}
      {xs.map((x) => (
        <rect
          key={`x${x}`}
          x={x - 13}
          y={-1800}
          width={26}
          height={4200}
          fill="#D3DCE8"
        />
      ))}
      {/* канал */}
      <path
        d={`M -1200 ${off + 16.5 * step} C -400 ${off + 16 * step}, 400 ${off + 17.2 * step}, 1400 ${off + 16.4 * step} S 2600 ${off + 16.8 * step}, 2800 ${off + 16.5 * step}`}
        fill="none"
        stroke="#A9CBEF"
        strokeWidth={34}
      />
    </g>
  );
};

// маршрут: тёмная обводка + цветная линия, дорисовывается до доли u
const Route: React.FC<{
  readonly pts: readonly Pt[];
  readonly u: number;
  readonly color: string;
  readonly width?: number;
  readonly opacity?: number;
}> = ({ pts, u, color, width = 16, opacity = 1 }) => {
  if (u <= 0 || opacity <= 0) return null;
  const L = lengthOf(pts);
  const d = pathD(pts);
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={NAVY}
        strokeWidth={width + 8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${L} ${L}`}
        strokeDashoffset={L * (1 - u)}
        opacity={0.85}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${L} ${L}`}
        strokeDashoffset={L * (1 - u)}
      />
    </g>
  );
};

// Пин над точкой карты (экран): значок + подпись, масштаб по перспективе
const MapPin: React.FC<{
  readonly cam: Cam;
  readonly at: Pt;
  readonly label: string;
  readonly kind: "work" | "school" | "home";
  readonly u: number;
  readonly glow?: number;
  readonly accent?: boolean;
}> = ({ cam, at, label, kind, u, glow = 0, accent = false }) => {
  if (u <= 0) return null;
  const p = project(cam, at);
  const s = Math.max(0.55, Math.min(1.5, p.s * cam.zoom)) * popScale(u);
  return (
    <g
      transform={`translate(${p.x} ${p.y}) scale(${s})`}
      opacity={Math.min(1, u * 2)}
    >
      <ellipse cx={0} cy={0} rx={30} ry={10} fill="rgba(20,40,75,0.22)" />
      {kind === "work" ? (
        <g>
          {glow > 0 ? (
            <circle cx={0} cy={-50} r={74} fill={RED} opacity={0.22 * glow} />
          ) : null}
          <rect
            x={-34}
            y={-104}
            width={68}
            height={104}
            rx={4}
            fill="#FFFFFF"
            stroke={NAVY}
            strokeWidth={3}
          />
          {[0, 1, 2, 3].map((r) =>
            [0, 1].map((c) => (
              <rect
                key={`${r}${c}`}
                x={-24 + c * 28}
                y={-94 + r * 22}
                width={20}
                height={14}
                rx={2}
                fill="#9CC0EA"
                stroke={NAVY}
                strokeWidth={1.6}
              />
            )),
          )}
          <rect
            x={-8}
            y={-18}
            width={16}
            height={18}
            fill={YELLOW}
            stroke={NAVY}
            strokeWidth={2}
          />
        </g>
      ) : kind === "school" ? (
        <g transform="scale(0.9)">
          <School glow={glow} />
        </g>
      ) : (
        <g transform="scale(1.05)">
          <House glow={glow} />
        </g>
      )}
      <g
        transform={`translate(0 ${kind === "work" ? -122 : kind === "school" ? -124 : -96})`}
      >
        <rect
          x={-(label.length * 14 + 34) / 2}
          y={-40}
          width={label.length * 14 + 34}
          height={40}
          rx={20}
          fill={accent ? YELLOW : NAVY}
        />
        <text
          x={0}
          y={-12}
          textAnchor="middle"
          fontSize={25}
          fontWeight={900}
          fill={accent ? NAVY : "#FFFFFF"}
          fontFamily={fontFamily}
        >
          {label}
        </text>
      </g>
    </g>
  );
};

// Палец (указательный жест) — касается карты
const Finger: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly press: number;
  readonly opacity: number;
}> = ({ x, y, press, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {press > 0 ? (
      <circle
        cx={0}
        cy={0}
        r={26 + press * 40}
        fill="none"
        stroke={YELLOW}
        strokeWidth={6}
        opacity={1 - press}
      />
    ) : null}
    <g transform={`translate(-14 ${-6 + press * 6}) rotate(-18)`}>
      <path
        d="M 10 0 Q 10 -6 16 -6 Q 22 -6 22 0 L 22 52 L 30 50 Q 38 48 40 56 L 54 54 Q 62 54 63 62 L 72 62 Q 82 63 82 74 L 82 118 Q 82 150 52 160 L 30 160 Q 12 150 6 126 L -6 92 Q -9 82 0 79 Q 8 77 12 86 L 12 0 Z"
        transform="translate(-14 4)"
        fill="#F0C4A0"
        stroke="#8A5A40"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M 26 46 L 28 66 M 40 52 L 41 70 M 54 58 L 55 74"
        transform="translate(-14 4)"
        stroke="#C58E6E"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  </g>
);

// Ребёнок у школы (иконка без конечностей — без «прыгающих» рук)
const Kid: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly opacity: number;
  readonly bag?: string;
}> = ({ x, y, s, opacity, bag = "#E8463A" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={18} ry={6} fill="rgba(20,40,75,0.2)" />
    <rect
      x={-14}
      y={-46}
      width={28}
      height={44}
      rx={12}
      fill="#5B8DEF"
      stroke={NAVY}
      strokeWidth={2.5}
    />
    <rect
      x={10}
      y={-42}
      width={10}
      height={26}
      rx={4}
      fill={bag}
      stroke={NAVY}
      strokeWidth={2}
    />
    <circle
      cx={0}
      cy={-62}
      r={16}
      fill="#F0C4A0"
      stroke={NAVY}
      strokeWidth={2.5}
    />
    <path
      d="M -16 -64 Q -14 -82 0 -80 Q 14 -82 16 -64 Q 8 -72 0 -70 Q -8 -72 -16 -64 Z"
      fill="#2B2136"
    />
    <circle cx={-5} cy={-61} r={1.8} fill={NAVY} />
    <circle cx={5} cy={-61} r={1.8} fill={NAVY} />
    <path
      d="M -4 -54 Q 0 -51 4 -54"
      fill="none"
      stroke="#8A4B3A"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </g>
);

// Полоса рабочего дня (иллюстрация, без часов): целая → рвётся на две части
const DayBar: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const d = b.detour;
  const showIn = easeOut(prog(t, d.from + 0.1, 0.5));
  const outU = easeInOut(prog(t, d.to - 0.4, 0.4));
  // разрыв растёт, пока машина в пути
  const travel =
    (prog(t, d.leg1[0], d.leg3[1] - d.leg1[0]) * 0.75 +
      prog(t, d.split - 0.2, 0.6) * 0.25) *
    0.36;
  const gap = Math.max(0, travel);
  const splitU = easeOut(prog(t, d.split, 0.5));
  const legs = [d.leg1, d.pickup, d.leg2, d.leg3];
  const active = legs.reduce((acc, l, i) => (t >= l[0] ? i : acc), -1);
  const stepActive = active < 0 ? 0 : active === 0 ? 1 : active <= 2 ? 2 : 3;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        opacity: showIn * (1 - outU),
        transform: `translateY(${(1 - showIn) * -30}px)`,
        fontFamily,
      }}
    >
      <div
        style={{
          padding: "22px 28px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 12px 30px rgba(20,40,75,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY }}>
            {T.detour.day}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 1000,
              color: RED,
              opacity: splitU,
              transform: `scale(${0.8 + 0.2 * splitU})`,
            }}
          >
            {T.detour.split}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 16, height: 40 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 40,
              width: `${50 - gap * 50}%`,
              borderRadius: 20,
              backgroundColor: "#3D6FD1",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: 40,
              width: `${50 - gap * 50}%`,
              borderRadius: 20,
              backgroundColor: "#3D6FD1",
            }}
          />
          {gap > 0.01 ? (
            <div
              style={{
                position: "absolute",
                left: `${50 - gap * 50 + 1}%`,
                width: `${gap * 100 - 2}%`,
                top: 4,
                height: 32,
                borderRadius: 16,
                backgroundImage: `repeating-linear-gradient(-45deg, ${RED} 0 10px, #F59A7E 10px 20px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 1000,
                fontSize: 26,
                overflow: "hidden",
              }}
            >
              {gap > 0.12 ? T.detour.road : ""}
            </div>
          ) : null}
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          {T.detour.steps.map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  padding: "4px 14px",
                  borderRadius: 16,
                  backgroundColor:
                    i <= stepActive && active >= 0
                      ? i === 0 || i === 3
                        ? NAVY
                        : YELLOW
                      : "#EEF2F8",
                  color:
                    i <= stepActive && active >= 0
                      ? i === 0 || i === 3
                        ? "#FFFFFF"
                        : NAVY
                      : NAVY_SOFT,
                }}
              >
                {s}
              </span>
              {i < 3 ? <span style={{ color: NAVY_SOFT }}>→</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// После заявки: «Жумуш күнү бүтүн» — полоса снова целая
const DayWhole: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const a = b.apply;
  const u = easeOut(prog(t, a.dayWhole, 0.5));
  const out = easeInOut(prog(t, a.to - 0.4, 0.4));
  if (u <= 0 || out >= 1) return null;
  const close = easeInOut(prog(t, a.dayWhole + 0.3, 0.8));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        opacity: u * (1 - out),
        transform: `translateY(${(1 - u) * -30}px)`,
        fontFamily,
      }}
    >
      <div
        style={{
          padding: "22px 28px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 12px 30px rgba(20,40,75,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#E7F7EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${popScale(close)})`,
            }}
          >
            <CheckIcon size={36} color={WA_GREEN} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY }}>
            {T.apply.dayWhole}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 16, height: 40 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 40,
              width: `${36 + 14 * close}%`,
              borderRadius: 20,
              backgroundColor: "#3D6FD1",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: 40,
              width: `${36 + 14 * close}%`,
              borderRadius: 20,
              backgroundColor: "#3D6FD1",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 32,
            fontWeight: 1000,
            color: NAVY_SOFT,
            letterSpacing: 1,
          }}
        >
          {T.apply.route}
        </div>
      </div>
    </div>
  );
};

// Сцена 5: группа и шаги
const GroupPanel: React.FC<{ readonly t: number; readonly b: Bg05Beats }> = ({
  t,
  b,
}) => {
  const g = b.group;
  const u = easeOut(prog(t, g.from + 0.15, 0.5));
  const out = easeInOut(prog(t, g.to - 0.35, 0.35));
  if (u <= 0 || out >= 1) return null;
  const s1 = easeOut(prog(t, g.step1, 0.45));
  const s2 = easeOut(prog(t, g.step2, 0.45));
  const free = easeOut(prog(t, g.free, 0.4));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 290,
        opacity: u * (1 - out),
        fontFamily,
      }}
    >
      <div
        style={{
          padding: "20px 26px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.97)",
          boxShadow: "0 12px 30px rgba(20,40,75,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY }}>
            {T.group.title}
          </div>
          <div
            style={{
              padding: "6px 18px",
              borderRadius: 20,
              backgroundColor: YELLOW,
              fontSize: 34,
              fontWeight: 1000,
              color: NAVY,
            }}
          >
            {T.group.size}
          </div>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 28,
            fontWeight: 800,
            color: NAVY_SOFT,
          }}
        >
          {T.group.sizeNote}
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {T.group.steps.map((st, i) => {
            const v = i === 0 ? s1 : s2;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: 0.25 + 0.75 * v,
                  transform: `translateX(${(1 - v) * 30}px)`,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    flexShrink: 0,
                    borderRadius: 27,
                    backgroundColor: v > 0.5 ? NAVY : "#EEF2F8",
                    color: "#FFFFFF",
                    fontSize: 30,
                    fontWeight: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 36, fontWeight: 1000, color: NAVY }}>
                  {st.title}
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    padding: "6px 16px",
                    borderRadius: 18,
                    fontSize: 28,
                    fontWeight: 1000,
                    whiteSpace: "nowrap",
                    backgroundColor:
                      i === 1 ? (free > 0 ? "#E7F7EC" : "#F3F6FB") : "#F3F6FB",
                    color: i === 1 ? "#1E7A44" : NAVY_SOFT,
                    transform:
                      i === 1
                        ? `scale(${0.85 + 0.15 * popScale(free)})`
                        : undefined,
                  }}
                >
                  {i === 0 ? T.group.search : st.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Камера карты: ключи по сценам (сцена 3 закрывает карту — камера стоит),
// плюс лёгкое «дыхание» ручной камеры. Экспортируется для финала: нить
// маршрута группы выпрямляется в линию под логотипом.
export const mapCamAt = (b: Bg05Beats, t: number): Cam => {
  const { hook, detour, apply, group, cta } = b;
  const overview: Cam = { cx: 660, cy: 1000, zoom: 0.86, tilt: 34 };
  const keys: [number, Cam][] = [
    [hook.from, { cx: 960, cy: 700, zoom: 1.3, tilt: 42 }],
    [hook.drawTo, { cx: 650, cy: 960, zoom: 0.92, tilt: 32 }],
    [detour.from + 0.3, { cx: 650, cy: 980, zoom: 0.9, tilt: 34 }],
    [detour.leg1[1], { cx: 520, cy: 1120, zoom: 0.98, tilt: 36 }],
    [detour.leg2[1], { cx: 620, cy: 1160, zoom: 0.95, tilt: 36 }],
    [detour.to, overview],
    [apply.mapBack, { cx: 560, cy: 1300, zoom: 1.2, tilt: 38 }],
    [apply.to, { cx: 540, cy: 1380, zoom: 1.32, tilt: 38 }],
    [group.from + 0.2, { cx: 460, cy: 1460, zoom: 1.12, tilt: 40 }],
    [group.to, { cx: 470, cy: 1480, zoom: 1.0, tilt: 36 }],
    [cta.from + 2, { cx: 470, cy: 1480, zoom: 0.9, tilt: 30 }],
  ];
  const cam = camAt(keys, t);
  return {
    ...cam,
    cx: cam.cx + Math.sin(t * 0.35) * 8,
    cy: cam.cy + Math.cos(t * 0.3) * 6,
  };
};

export const MapScene: React.FC<{
  readonly t: number;
  readonly b: Bg05Beats;
}> = ({ t, b }) => {
  const { hook, detour, apply, group, cta } = b;
  const cam = mapCamAt(b, t);
  const drift = cam;

  // 1. дорога-хук
  const hookU = easeInOut(prog(t, hook.drawFrom, hook.drawTo - hook.drawFrom));
  const hookFade = 1 - easeInOut(prog(t, detour.from, 0.6));
  // 2. крюк машины мамы
  const l1 = easeInOut(
    prog(t, detour.leg1[0], detour.leg1[1] - detour.leg1[0]),
  );
  const l2 = easeInOut(
    prog(t, detour.leg2[0], detour.leg2[1] - detour.leg2[0]),
  );
  const l3 = easeInOut(
    prog(t, detour.leg3[0], detour.leg3[1] - detour.leg3[0]),
  );
  // 4. крюк гаснет, рисуется круг
  const detourFade = 1 - 0.85 * easeInOut(prog(t, apply.mapBack, 0.7));
  const loopU = easeInOut(
    prog(t, apply.mapBack + 0.3, apply.loopTo - apply.mapBack - 0.3),
  );
  // 5. группа
  const groupU = easeInOut(prog(t, group.converge, 1.3));
  const loopFade = 1 - easeInOut(prog(t, group.converge, 0.8));
  const carG = prog(
    t,
    group.carFrom,
    Math.max(2.5, group.to - group.carFrom + 1.5),
  );

  // машина мамы
  let car: { x: number; y: number; angle: number } | null = null;
  if (t >= detour.leg1[0] - 0.2 && t < detour.to + 0.2) {
    if (t < detour.leg1[1])
      car = {
        ...pointAt(ROUTE_DETOUR_1, l1),
        angle: headingAt(ROUTE_DETOUR_1, l1),
      };
    else if (t < detour.leg2[0])
      car = { ...pointAt(ROUTE_DETOUR_1, 1), angle: 90 };
    else if (t < detour.leg3[0])
      car = {
        ...pointAt(ROUTE_DETOUR_2, l2),
        angle: headingAt(ROUTE_DETOUR_2, l2),
      };
    else
      car = {
        ...pointAt(ROUTE_DETOUR_3, l3),
        angle: headingAt(ROUTE_DETOUR_3, l3),
      };
  }
  // белая машина BalaGo — только на пробной поездке после подбора группы
  const trialCar =
    t >= group.carFrom && t < cta.from + 0.4
      ? {
          ...pointAt(ROUTE_GROUP, easeInOut(carG)),
          angle: headingAt(ROUTE_GROUP, easeInOut(carG)),
        }
      : null;

  // палец в хуке
  const head = pointAt(ROUTE_HOOK, hookU);
  const fingerAt = project(drift, t < hook.drawFrom ? P.work : head);
  const press = t < hook.drawFrom ? prog(t, hook.tap, 0.35) : 0;
  const fingerO =
    easeOut(prog(t, hook.from, 0.25)) *
    (1 - easeInOut(prog(t, hook.drawTo + 0.2, 0.5)));

  // ребёнок садится в машину у школы
  const sch = project(drift, { x: P.school.x - 70, y: P.school.y + 50 });
  const kidIn = easeOut(prog(t, detour.pickup[0] - 0.6, 0.4));
  const kidGo = easeInOut(prog(t, detour.pickup[1] - 0.45, 0.4));
  const bell =
    easeOut(prog(t, detour.pickup[0] - 0.8, 0.4)) *
    (1 - easeInOut(prog(t, detour.leg2[0] + 0.4, 0.4)));

  // соседи группы
  const homesU = b.group.homes.map((h) => easeOut(prog(t, h, 0.45)));
  const work =
    t < apply.from ? 1 : 1 - easeInOut(prog(t, apply.mapBack, 0.6)) * 0.6;

  const th = (drift.tilt * Math.PI) / 180;
  const planeTransform = `perspective(1700px) rotateX(${drift.tilt}deg)`;
  const mountainsO = Math.min(1, Math.max(0, (drift.tilt - 18) / 18));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#E4EAF2",
        isolation: "isolate",
      }}
    >
      {/* плоскость карты (свой слой, ниже всех экранных элементов) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: SCREEN.cx,
            top: SCREEN.cy,
            width: 0,
            height: 0,
            transform: planeTransform,
            transformOrigin: "0 0",
          }}
        >
          {/* плоскость ограничена полями M: ближний край не уходит за камеру */}
          <svg
            width={(WORLD.w + 2 * M.x) * drift.zoom}
            height={(WORLD.h + M.top + M.bottom) * drift.zoom}
            viewBox={`${-M.x} ${-M.top} ${WORLD.w + 2 * M.x} ${WORLD.h + M.top + M.bottom}`}
            style={{
              position: "absolute",
              left: (-M.x - drift.cx) * drift.zoom,
              top: (-M.top - drift.cy) * drift.zoom,
              overflow: "hidden",
            }}
          >
            <rect
              x={-M.x}
              y={-M.top}
              width={WORLD.w + 2 * M.x}
              height={WORLD.h + M.top + M.bottom}
              fill="#DCE3ED"
            />
            <Avenues />
            <Blocks />
            {/* районы */}
            {(
              [
                [
                  "a",
                  DISTRICTS.a,
                  "#3D6FD1",
                  easeOut(prog(t, hook.districtA, 0.5)),
                ],
                [
                  "b",
                  DISTRICTS.b,
                  "#F2A93B",
                  easeOut(prog(t, hook.districtB, 0.5)),
                ],
              ] as const
            ).map(([k, d, c, u]) => (
              <rect
                key={k}
                x={d.x}
                y={d.y}
                width={d.w}
                height={d.h}
                rx={40}
                fill={c}
                fillOpacity={0.1 * u}
                stroke={c}
                strokeOpacity={0.7 * u}
                strokeWidth={6}
                strokeDasharray="22 16"
              />
            ))}
            <Route
              pts={ROUTE_HOOK}
              u={hookU}
              color={YELLOW}
              opacity={hookFade}
            />
            {/* крюк мамы — красный след */}
            <Route
              pts={ROUTE_DETOUR_1}
              u={l1}
              color={RED}
              opacity={detourFade}
            />
            <Route
              pts={ROUTE_DETOUR_2}
              u={l2}
              color={RED}
              opacity={detourFade}
            />
            <Route
              pts={ROUTE_DETOUR_3}
              u={l3}
              color={RED}
              opacity={detourFade}
            />
            {/* отдельный круг ҮЙ → МЕКТЕП → ҮЙ */}
            <Route
              pts={ROUTE_LOOP}
              u={loopU}
              color={YELLOW}
              width={20}
              opacity={loopFade}
            />
            {/* круг группы */}
            <Route pts={ROUTE_GROUP} u={groupU} color={YELLOW} width={20} />
            {/* пунктиры «соседи сходятся» */}
            {[P.h2, P.h3, P.h4].map((h, i) => {
              const u =
                easeInOut(prog(t, group.homes[i] + 0.2, 0.7)) *
                (1 - easeInOut(prog(t, group.converge + 1.0, 0.6)));
              if (u <= 0) return null;
              return (
                <path
                  key={i}
                  d={`M ${h.x} ${h.y} Q ${(h.x + P.school.x) / 2 + 60} ${(h.y + P.school.y) / 2 + 40} ${P.school.x} ${P.school.y}`}
                  fill="none"
                  stroke={NAVY}
                  strokeWidth={7}
                  strokeDasharray="16 14"
                  strokeDashoffset={-t * 40}
                  opacity={u * 0.8}
                />
              );
            })}
            {car ? (
              <CarTop x={car.x} y={car.y} angle={car.angle} scale={1.9} plain />
            ) : null}
            {trialCar ? (
              <CarTop
                x={trialCar.x}
                y={trialCar.y}
                angle={trialCar.angle}
                scale={1.9}
              />
            ) : null}
          </svg>
        </div>
      </div>

      {/* горы Ала-Тоо на горизонте + дымка */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 420,
          opacity: mountainsO,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(#CFE0F5 0%, #E6EEF8 55%, rgba(228,234,242,0) 100%)",
          }}
        />
        <svg
          width={1080}
          height={420}
          viewBox="0 0 1080 420"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Mountains
            width={1080}
            y={60 + Math.sin(th) * 30}
            shift={-((drift.cx - 600) * 0.08)}
          />
          <rect x={0} y={200} width={1080} height={220} fill="url(#bg05haze)" />
          <defs>
            <linearGradient id="bg05haze" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#E4EAF2" stopOpacity={0} />
              <stop offset="0.45" stopColor="#E4EAF2" stopOpacity={0.9} />
              <stop offset="1" stopColor="#E4EAF2" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* пины, ребёнок, палец (экранные, не наклоняются) */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          zIndex: 2,
        }}
      >
        {/* подписи районов */}
        {(
          [
            [
              T.map.districtA,
              { x: DISTRICTS.a.x + DISTRICTS.a.w / 2, y: DISTRICTS.a.y + 30 },
              "#3D6FD1",
              easeOut(prog(t, hook.districtA, 0.5)),
            ],
            [
              T.map.districtB,
              {
                x: DISTRICTS.b.x + DISTRICTS.b.w / 2,
                y: DISTRICTS.b.y + DISTRICTS.b.h - 30,
              },
              "#C77D12",
              easeOut(prog(t, hook.districtB, 0.5)),
            ],
          ] as const
        ).map(([label, at, c, u]) => {
          if (u <= 0 || t > apply.from) return null;
          const p = project(drift, at);
          return (
            <g
              key={label}
              transform={`translate(${p.x} ${p.y}) scale(${Math.max(1.05, p.s * drift.zoom)})`}
              opacity={u}
            >
              <rect
                x={-(label.length * 13 + 30) / 2}
                y={-24}
                width={label.length * 13 + 30}
                height={46}
                rx={23}
                fill="#FFFFFF"
                stroke={c}
                strokeWidth={4}
              />
              <text
                x={0}
                y={9}
                textAnchor="middle"
                fontSize={26}
                fontWeight={1000}
                fill={c}
                fontFamily={fontFamily}
              >
                {label}
              </text>
            </g>
          );
        })}
        <MapPin
          cam={drift}
          at={P.work}
          label={T.map.work}
          kind="work"
          u={easeOut(prog(t, hook.from, 0.4)) * work}
          glow={prog(t, detour.leg3[0], 0.6) * (1 - prog(t, detour.to, 0.5))}
        />
        <MapPin
          cam={drift}
          at={P.school}
          label={T.map.school}
          kind="school"
          u={easeOut(prog(t, hook.drawTo - 0.5, 0.45))}
          accent={t > apply.mapBack}
        />
        <MapPin
          cam={drift}
          at={P.home}
          label={T.map.home}
          kind="home"
          u={easeOut(prog(t, detour.leg2[0], 0.45))}
          accent={t > apply.mapBack}
          glow={
            t > apply.mapBack
              ? prog(t, apply.mapBack, 0.6) * (1 - prog(t, group.from, 0.5))
              : 0
          }
        />
        {[P.h2, P.h3, P.h4].map((h, i) => (
          <MapPin
            key={i}
            cam={drift}
            at={h}
            label={T.map.home}
            kind="home"
            u={homesU[i]}
          />
        ))}
        {/* дети соседей у своих домов */}
        {[P.h2, P.h3, P.h4].map((h, i) => {
          const u =
            homesU[i] * (1 - easeInOut(prog(t, group.converge + 1.2, 0.5)));
          if (u <= 0) return null;
          const p = project(drift, { x: h.x + 60, y: h.y + 40 });
          return (
            <Kid
              key={i}
              x={p.x}
              y={p.y}
              s={Math.max(0.6, p.s * drift.zoom) * popScale(u)}
              opacity={u}
              bag={["#E8463A", "#3DAA6B", "#8E5BD9"][i]}
            />
          );
        })}
        {/* «Сабак бүттү» и ребёнок у школы */}
        {bell > 0 ? (
          <g
            transform={`translate(${sch.x + 110} ${sch.y - 200})`}
            opacity={bell}
          >
            <rect
              x={-130}
              y={-32}
              width={260}
              height={60}
              rx={30}
              fill={YELLOW}
              stroke={NAVY}
              strokeWidth={4}
            />
            <text
              x={0}
              y={10}
              textAnchor="middle"
              fontSize={30}
              fontWeight={1000}
              fill={NAVY}
              fontFamily={fontFamily}
            >
              {T.detour.pickup}
            </text>
          </g>
        ) : null}
        {kidIn > 0 && kidGo < 1 ? (
          <Kid
            x={sch.x + (project(drift, P.school).x - sch.x) * kidGo}
            y={sch.y + (project(drift, P.school).y - sch.y) * kidGo}
            s={
              Math.max(0.7, sch.s * drift.zoom) *
              popScale(kidIn) *
              (1 - 0.5 * kidGo)
            }
            opacity={kidIn * (1 - kidGo)}
          />
        ) : null}
        {fingerO > 0 ? (
          <Finger
            x={fingerAt.x}
            y={fingerAt.y}
            press={press}
            opacity={fingerO}
          />
        ) : null}
      </svg>

      <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
        {/* метка города */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 200,
            padding: "10px 24px",
            borderRadius: 26,
            backgroundColor: "rgba(255,255,255,0.92)",
            fontFamily,
            fontSize: 32,
            fontWeight: 1000,
            color: NAVY,
            display: "flex",
            gap: 12,
            alignItems: "center",
            opacity:
              easeOut(prog(t, hook.from + 0.2, 0.5)) *
              (1 - easeInOut(prog(t, detour.from + 0.1, 0.4))),
          }}
        >
          <span>{T.map.city}</span>
          <span style={{ color: NAVY_SOFT, fontSize: 26 }}>• {T.map.note}</span>
        </div>

        <DayBar t={t} b={b} />
        <DayWhole t={t} b={b} />
        <GroupPanel t={t} b={b} />
      </div>
      {/* лёгкая виньетка */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 60%, rgba(20,40,75,0.16) 100%)",
          zIndex: 4,
        }}
      />
    </div>
  );
};

// LIVE-004 v2: три смысловые вставки. Спокойные появления (прозрачность +
// небольшой подъём), без пружин, свечений, наклонов и «тряски».
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, CheckIcon, HouseIcon, PauseIcon, RoadIcon, SchoolIcon } from "../../live/icons";
import { easeInOut, ramp, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { V2_CUE, V2_INSERTS } from "./plan";

const insert = (id: string) => {
  const i = V2_INSERTS.find((x) => x.id === id);
  if (!i) throw new Error(id);
  return i;
};

// Общая «видимость» вставки: 0,3 с на появление и исчезновение.
const visible = (t: number, id: string) => {
  const i = insert(id);
  return ramp(t, i.from, 0.3) * (1 - ramp(t, i.to - 0.3, 0.3, easeInOut));
};

const label: React.CSSProperties = {
  fontFamily,
  fontWeight: 900,
  color: C.white,
  textShadow: "0 3px 14px rgba(0,0,0,0.6)",
  textAlign: "center",
};

const Tile: React.FC<{ readonly children: React.ReactNode; readonly size?: number; readonly dim?: number; readonly bg?: string }> = ({ children, size = 170, dim = 0, bg = C.white }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 16px 40px rgba(6,14,38,0.35)",
      filter: dim ? `grayscale(${dim * 0.85}) brightness(${1 - dim * 0.1})` : undefined,
    }}
  >
    {children}
  </div>
);

// 1) План 2 (лицо ниже центра, над головой небо): ИШ ⏸ → ЖОЛ → МЕКТЕП ✓.
export const StepsInsert: React.FC = () => {
  const t = useT();
  const v = visible(t, "steps");
  if (v <= 0) return null;
  const Y = 520;
  const nodes = [
    { x: 185, at: V2_CUE.ishinizdi, text: "ИШ", icon: <BriefcaseIcon size={100} /> },
    { x: 505, at: V2_CUE.zholgo, text: "ЖОЛ", icon: <RoadIcon size={100} /> },
    { x: 825, at: V2_CUE.mektepke2, text: "МЕКТЕП", icon: <SchoolIcon size={104} /> },
  ];
  const link = (a: number, b: number, from: number, dur: number) => {
    const p = ramp(t, from, dur, easeInOut);
    const x1 = nodes[a].x + 100;
    const x2 = nodes[b].x - 100;
    return p > 0 ? <line x1={x1} y1={Y} x2={x1 + (x2 - x1) * p} y2={Y} stroke={C.yellow} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 16" /> : null;
  };
  const paused = ramp(t, V2_CUE.toktotosuz, 0.25);
  const done = ramp(t, V2_CUE.zhetesiz, 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: v }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {link(0, 1, V2_CUE.anan, V2_CUE.zholgo - V2_CUE.anan)}
        {link(1, 2, V2_CUE.mektepke2 - 0.4, 0.4)}
      </svg>
      {nodes.map((n, i) => {
        const a = ramp(t, n.at, 0.3);
        if (a <= 0) return null;
        return (
          <div key={n.text} style={{ position: "absolute", left: n.x - 85, top: Y - 85, width: 170, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
            <Tile dim={i === 0 ? paused : 0}>{n.icon}</Tile>
            {i === 0 && paused > 0 ? (
              <div style={{ position: "absolute", right: -20, top: -20, opacity: paused }}>
                <PauseIcon size={72} />
              </div>
            ) : null}
            {i === 2 && done > 0 ? (
              <div style={{ position: "absolute", right: -20, top: -20, opacity: done }}>
                <CheckIcon size={72} />
              </div>
            ) : null}
            <div style={{ ...label, fontSize: 46, marginTop: 14, marginLeft: -40, marginRight: -40 }}>{n.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// 2) «Бирок мектеп — жумасына беш күн»: пять дней недели заполняются.
export const WeekInsert: React.FC = () => {
  const t = useT();
  const v = visible(t, "week");
  if (v <= 0) return null;
  const days = ["ДШ", "ШШ", "ШР", "БШ", "ЖМ"];
  const fills = [V2_CUE.mektep, V2_CUE.zhumasyna, V2_CUE.zhumasyna + 0.22, V2_CUE.zhumasyna + 0.44, V2_CUE.besh];
  const five = ramp(t, V2_CUE.besh, 0.3);
  return (
    <div style={{ position: "absolute", left: 70, top: 1120, width: 860, opacity: v, transform: `translateY(${(1 - v) * 20}px)` }}>
      <div style={{ ...label, fontSize: 56, marginBottom: 16, opacity: five, textAlign: "left" }}>
        ЖУМАСЫНА <span style={{ color: C.yellow }}>5 КҮН</span>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {days.map((d, i) => {
          const f = ramp(t, fills[i], 0.25);
          return (
            <div
              key={d}
              style={{
                flex: 1,
                height: 150,
                borderRadius: 26,
                background: f > 0.5 ? C.yellow : "rgba(10,22,54,0.72)",
                border: "2px solid rgba(255,255,255,0.18)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontFamily, fontWeight: 900, fontSize: 36, color: f > 0.5 ? C.navyInk : C.white }}>{d}</span>
              <div style={{ opacity: f }}>
                <SchoolIcon size={54} color={C.navy} accent={C.white} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3) «BalaGo … эртең менен үйдөн мектепке … кайра мектептен үйгө».
const HOME = { x: 190, y: 250 };
const SCHOOL = { x: 750, y: 250 };
const bez = (p: number, a: number[], b: number[], c: number[], d: number[]) => {
  const u = 1 - p;
  return [0, 1].map((i) => u * u * u * a[i] + 3 * u * u * p * b[i] + 3 * u * p * p * c[i] + p * p * p * d[i]);
};
const UP = [[HOME.x + 75, HOME.y - 35], [HOME.x + 200, HOME.y - 140], [SCHOOL.x - 200, HOME.y - 140], [SCHOOL.x - 75, SCHOOL.y - 35]];
const DOWN = [[SCHOOL.x - 75, SCHOOL.y + 35], [SCHOOL.x - 200, SCHOOL.y + 140], [HOME.x + 200, SCHOOL.y + 140], [HOME.x + 75, HOME.y + 35]];
const d = (q: number[][]) => `M ${q[0][0]} ${q[0][1]} C ${q[1][0]} ${q[1][1]}, ${q[2][0]} ${q[2][1]}, ${q[3][0]} ${q[3][1]}`;

export const RouteInsert: React.FC<{ readonly keepCity?: boolean; readonly from?: number }> = ({ keepCity = false, from }) => {
  const t = useT();
  // from — своё начало вставки (v4: после отдельного появления логотипа)
  const v = from === undefined ? visible(t, "route") : ramp(t, from, 0.35) * (1 - ramp(t, insert("route").to - 0.3, 0.3, easeInOut));
  if (v <= 0) return null;
  const up = ramp(t, V2_CUE.mektepke3 - 0.05, 0.7, easeInOut);
  const down = ramp(t, V2_CUE.kayra3, V2_CUE.uygo - V2_CUE.kayra3 + 0.15, easeInOut);
  const home = ramp(t, V2_CUE.uydon, 0.3);
  const school = ramp(t, V2_CUE.mektepke3, 0.3);
  const arrived = ramp(t, V2_CUE.uygo + 0.1, 0.3);
  const marker = down > 0 && down < 1 ? bez(down, ...(DOWN as [number[], number[], number[], number[]])) : up > 0 && up < 1 ? bez(up, ...(UP as [number[], number[], number[], number[]])) : null;
  const time = t >= V2_CUE.sabaktan - 0.1 ? "Сабактан кийин" : t >= V2_CUE.erteng - 0.1 ? "Эртең менен" : "";
  const formula = keepCity ? 0 : arrived;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 980,
        width: 880,
        height: 380,
        borderRadius: 36,
        background: "linear-gradient(165deg, rgba(20,40,90,0.9), rgba(8,18,46,0.92))",
        border: "2px solid rgba(255,255,255,0.14)",
        boxShadow: "0 30px 80px rgba(4,10,30,0.4)",
        opacity: v,
        transform: `translateY(${(1 - v) * 24}px)`,
        overflow: "hidden",
      }}
    >
      {/* шапка: логотип и город — на слове «BalaGo» */}
      <div style={{ position: "absolute", left: 24, top: 18, right: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: C.white, flexShrink: 0 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily, fontWeight: 1000, fontSize: 44, color: C.white }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 30, color: C.muted, opacity: 1 - formula }}>Бишкек • Балдар үчүн такси</div>
        <div style={{ position: "absolute", right: 0, fontFamily, fontWeight: 1000, fontSize: 38, color: C.yellow, opacity: formula }}>ҮЙ → МЕКТЕП → ҮЙ</div>
      </div>
      {time ? <div style={{ position: "absolute", left: 30, top: 104, fontFamily, fontWeight: 800, fontSize: 32, color: C.yellow, opacity: keepCity ? 1 - arrived : 1 }}>{time}</div> : null}
      {keepCity && arrived > 0 ? (
        <div style={{ position: "absolute", left: 30, top: 104, fontFamily, fontWeight: 1000, fontSize: 34, color: C.yellow, opacity: arrived }}>ҮЙ → МЕКТЕП → ҮЙ</div>
      ) : null}
      <svg width={880} height={380} style={{ position: "absolute", inset: 0 }}>
        <path d={d(UP)} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={8} strokeDasharray="3 14" strokeLinecap="round" />
        <path d={d(DOWN)} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={8} strokeDasharray="3 14" strokeLinecap="round" />
        <path d={d(UP)} fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${up} 1`} />
        <path d={d(DOWN)} fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${down} 1`} />
        {marker ? <circle cx={marker[0]} cy={marker[1]} r={15} fill={C.yellow} stroke={C.white} strokeWidth={4} /> : null}
      </svg>
      {[
        { p: HOME, a: home, icon: <HouseIcon size={96} />, text: "ҮЙ", check: arrived },
        { p: SCHOOL, a: school, icon: <SchoolIcon size={100} />, text: "МЕКТЕП", check: 0 },
      ].map((n) => (
        <div key={n.text} style={{ position: "absolute", left: n.p.x - 70, top: n.p.y - 70, width: 140, opacity: 0.35 + 0.65 * n.a }}>
          <Tile size={140}>{n.icon}</Tile>
          {n.check > 0 ? (
            <div style={{ position: "absolute", right: -16, top: -16, opacity: n.check }}>
              <CheckIcon size={60} />
            </div>
          ) : null}
          <div style={{ ...label, fontSize: 32, marginTop: 8, marginLeft: -40, marginRight: -40 }}>{n.text}</div>
        </div>
      ))}
    </div>
  );
};

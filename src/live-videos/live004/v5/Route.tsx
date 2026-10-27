// v5: маршрут ҮЙ → МЕКТЕП → ҮЙ — та же вставка, что в v4 (тот же размер
// и место), но:
// • метка движется плавнее (мягкий разгон и торможение, чуть дольше);
// • линии и пункты читаемее (толще, контрастнее, с подсветкой);
// • прохождение пункта подсвечивается кольцом; завершение поездки —
//   ✓ у дома и зелёная отметка «ҮЙ → МЕКТЕП → ҮЙ ✓».
import { Easing, Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { CheckIcon, HouseIcon, SchoolIcon } from "../../../live/icons";
import { easeInOut, ramp, useT } from "../../../live/sync";
import { LIVE_COLORS as C } from "../../../live/theme";
import { V5_CUE } from "./plan-v5";

const smooth = Easing.bezier(0.45, 0, 0.2, 1);
const HOME = { x: 190, y: 250 };
const SCHOOL = { x: 750, y: 250 };
type P = readonly [number, number];
const UP: readonly P[] = [[HOME.x + 80, HOME.y - 38], [HOME.x + 200, HOME.y - 145], [SCHOOL.x - 200, HOME.y - 145], [SCHOOL.x - 80, SCHOOL.y - 38]];
const DOWN: readonly P[] = [[SCHOOL.x - 80, SCHOOL.y + 38], [SCHOOL.x - 200, SCHOOL.y + 145], [HOME.x + 200, SCHOOL.y + 145], [HOME.x + 80, HOME.y + 38]];
const bez = (p: number, q: readonly P[]) => {
  const u = 1 - p;
  return [0, 1].map((i) => u * u * u * q[0][i] + 3 * u * u * p * q[1][i] + 3 * u * p * p * q[2][i] + p * p * p * q[3][i]);
};
const d = (q: readonly P[]) => `M ${q[0][0]} ${q[0][1]} C ${q[1][0]} ${q[1][1]}, ${q[2][0]} ${q[2][1]}, ${q[3][0]} ${q[3][1]}`;

// Кольцо «пройдено»: вспыхивает и мягко гаснет за 0,7 с.
const passRing = (t: number, at: number) => {
  const k = (t - at) / 0.7;
  return k < 0 || k > 1 ? 0 : Math.sin(k * Math.PI);
};

export const RouteV5: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const t = useT();
  const v = ramp(t, from, 0.35) * (1 - ramp(t, to - 0.3, 0.3, easeInOut));
  if (v <= 0) return null;
  const upFrom = V5_CUE.mektepke3 - 0.05;
  const upEnd = upFrom + 0.92;
  const downFrom = V5_CUE.kayra3;
  const downEnd = V5_CUE.uygo + 0.15;
  const up = ramp(t, upFrom, upEnd - upFrom, smooth);
  const down = ramp(t, downFrom, downEnd - downFrom, smooth);
  const home = ramp(t, V5_CUE.uydon, 0.3);
  const school = ramp(t, V5_CUE.mektepke3, 0.3);
  const arrived = ramp(t, downEnd, 0.3);
  const marker = down > 0 && down < 1 ? bez(down, DOWN) : up > 0 && up < 1 ? bez(up, UP) : null;
  const time = t >= V5_CUE.sabaktan - 0.1 ? "Сабактан кийин" : t >= V5_CUE.erteng - 0.1 ? "Эртең менен" : "";
  const nodes = [
    { p: HOME, a: home, icon: <HouseIcon size={100} />, text: "ҮЙ", ring: Math.max(passRing(t, upFrom), passRing(t, downEnd)), check: arrived },
    { p: SCHOOL, a: school, icon: <SchoolIcon size={104} />, text: "МЕКТЕП", ring: passRing(t, upEnd), check: 0 },
  ];
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
        border: "2px solid rgba(255,255,255,0.16)",
        boxShadow: "0 30px 80px rgba(4,10,30,0.4)",
        opacity: v,
        transform: `translateY(${(1 - v) * 24}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 18, right: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: C.white, flexShrink: 0 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily, fontWeight: 1000, fontSize: 44, color: C.white }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 30, color: C.muted }}>Бишкек • Балдар үчүн такси</div>
      </div>
      {time ? <div style={{ position: "absolute", left: 30, top: 104, fontFamily, fontWeight: 800, fontSize: 32, color: C.yellow, opacity: 1 - arrived }}>{time}</div> : null}
      {arrived > 0 ? (
        <div style={{ position: "absolute", left: 26, top: 98, display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 4px 8px", borderRadius: 999, background: `rgba(43,211,139,${0.22 * arrived})`, opacity: arrived, transform: `scale(${0.9 + 0.1 * arrived})`, transformOrigin: "0% 50%" }}>
          <CheckIcon size={38} />
          <span style={{ fontFamily, fontWeight: 1000, fontSize: 32, color: C.white }}>ҮЙ → МЕКТЕП → ҮЙ</span>
        </div>
      ) : null}
      <svg width={880} height={380} style={{ position: "absolute", inset: 0 }}>
        {/* «дорожки» маршрута */}
        <path d={d(UP)} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={9} strokeDasharray="3 13" strokeLinecap="round" />
        <path d={d(DOWN)} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={9} strokeDasharray="3 13" strokeLinecap="round" />
        {/* пройденный путь: мягкая подсветка + яркая линия */}
        <path d={d(UP)} fill="none" stroke={C.yellow} strokeOpacity={0.3} strokeWidth={24} strokeLinecap="round" pathLength={1} strokeDasharray={`${up} 1`} />
        <path d={d(DOWN)} fill="none" stroke={C.yellow} strokeOpacity={0.3} strokeWidth={24} strokeLinecap="round" pathLength={1} strokeDasharray={`${down} 1`} />
        <path d={d(UP)} fill="none" stroke={C.yellow} strokeWidth={13} strokeLinecap="round" pathLength={1} strokeDasharray={`${up} 1`} />
        <path d={d(DOWN)} fill="none" stroke={C.yellow} strokeWidth={13} strokeLinecap="round" pathLength={1} strokeDasharray={`${down} 1`} />
        {marker ? (
          <>
            <circle cx={marker[0]} cy={marker[1]} r={34} fill={C.yellow} opacity={0.22} />
            <circle cx={marker[0]} cy={marker[1]} r={18} fill={C.yellow} stroke={C.white} strokeWidth={5} />
          </>
        ) : null}
      </svg>
      {nodes.map((n) => (
        <div key={n.text} style={{ position: "absolute", left: n.p.x - 75, top: n.p.y - 75, width: 150, opacity: 0.4 + 0.6 * n.a, transform: `scale(${1 + 0.07 * n.ring})` }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 40,
              background: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 16px 40px rgba(6,14,38,0.35), 0 0 0 ${8 * n.ring}px rgba(255,201,14,${0.75 * n.ring})`,
            }}
          >
            {n.icon}
          </div>
          {n.check > 0 ? (
            <div style={{ position: "absolute", right: -16, top: -16, opacity: n.check, transform: `scale(${0.7 + 0.3 * n.check})` }}>
              <CheckIcon size={62} />
            </div>
          ) : null}
          <div style={{ fontFamily, fontWeight: 900, fontSize: 34, color: C.white, textAlign: "center", marginTop: 6, marginLeft: -40, marginRight: -40, textShadow: "0 3px 12px rgba(0,0,0,0.6)" }}>{n.text}</div>
        </div>
      ))}
    </div>
  );
};

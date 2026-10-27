// План 6 (21,70–27,10 с): «эртең менен үйдөн мектепке, сабактан кийин кайра
// мектептен үйгө». Главная схема ролика: ҮЙ → МЕКТЕП → ҮЙ.
//   • «эртең менен» — восход солнца в карте;
//   • «үйдөн» — дом; «мектепке» — путь сверху, жёлтая метка едет к школе;
//   • «сабактан кийин» — солнце сменяется звонком;
//   • «кайра мектептен» — путь снизу обратно; «үйгө» — дом с ✓.
// Формула «ҮЙ → МЕКТЕП → ҮЙ» собирается сверху по тем же словам.
import { fontFamily } from "../../fonts";
import { BellIcon, CheckIcon, HouseIcon, SchoolIcon, SunIcon } from "../../live/icons";
import { easeInOut, easeOut, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { GlassPanel, Glow } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

const PANEL = { left: 60, top: 1000, width: 960, height: 360 } as const;
const HOME = { x: 190, y: 200 };
const SCHOOL = { x: 770, y: 200 };
const UP = `M ${HOME.x + 70} ${HOME.y - 40} C ${HOME.x + 200} ${HOME.y - 175}, ${SCHOOL.x - 200} ${HOME.y - 175}, ${SCHOOL.x - 70} ${SCHOOL.y - 40}`;
const DOWN = `M ${SCHOOL.x - 70} ${SCHOOL.y + 40} C ${SCHOOL.x - 200} ${SCHOOL.y + 165}, ${HOME.x + 200} ${SCHOOL.y + 165}, ${HOME.x + 70} ${HOME.y + 40}`;

// Точка на кубической кривой Безье.
const bez = (p: number, a: number[], b: number[], c: number[], d: number[]) => {
  const u = 1 - p;
  return [0, 1].map((i) => u * u * u * a[i] + 3 * u * u * p * b[i] + 3 * u * p * p * c[i] + p * p * p * d[i]);
};
const upAt = (p: number) => bez(p, [HOME.x + 70, HOME.y - 40], [HOME.x + 200, HOME.y - 175], [SCHOOL.x - 200, HOME.y - 175], [SCHOOL.x - 70, SCHOOL.y - 40]);
const downAt = (p: number) => bez(p, [SCHOOL.x - 70, SCHOOL.y + 40], [SCHOOL.x - 200, SCHOOL.y + 165], [HOME.x + 200, SCHOOL.y + 165], [HOME.x + 70, HOME.y + 40]);

// Формула сверху.
const Formula: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const parts = [
    { text: "ҮЙ", at: CUE.uydon },
    { text: "→", at: CUE.mektepke3 - 0.08 },
    { text: "МЕКТЕП", at: CUE.mektepke3 },
    { text: "→", at: CUE.kayra3 },
    { text: "ҮЙ", at: CUE.uygo },
  ];
  const e = ramp(t, out, 0.3, easeInOut);
  const full = springy(t, CUE.uygo + 0.15, 0.5);
  const show = springy(t, CUE.uydon - 0.1, 0.45);
  if (show <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: (1 - e) * Math.min(1, show * 2), transform: `scale(${0.8 + 0.2 * show})` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "10px 34px 14px",
          borderRadius: 999,
          background: full > 0 ? `rgba(255,201,14,${0.95 * Math.min(1, full)})` : "rgba(10,22,54,0.78)",
          boxShadow: "0 16px 44px rgba(6,14,38,0.4)",
          fontFamily,
          fontWeight: 1000,
          fontSize: 70,
          color: full > 0.5 ? C.navyInk : C.white,
          transform: `scale(${1 + 0.06 * Math.sin(Math.min(1, full) * Math.PI)})`,
        }}
      >
        {parts.map((p, i) => {
          const k = springy(t, p.at, 0.45);
          const a = ramp(t, p.at, 0.18);
          return (
            <span key={i} style={{ opacity: a, transform: `translateY(${(1 - k) * 30}px)`, display: "inline-block", color: p.text === "→" && full < 0.5 ? C.yellow : undefined }}>
              {p.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Route: React.FC = () => {
  const t = useT();
  const [from, to] = [LIVE04.cuts[4], LIVE04.cuts[5]];
  if (t < from - 0.05 || t > to + 0.3) return null;
  const out = to - 0.2;
  const sun = springy(t, CUE.erteng, 0.6) * (1 - ramp(t, CUE.sabaktan - 0.1, 0.3));
  const bell = springy(t, CUE.sabaktan, 0.5);
  const home = springy(t, CUE.uydon, 0.5);
  const school = springy(t, CUE.mektepke3, 0.5);
  const up = ramp(t, CUE.mektepke3 - 0.05, 0.7, easeInOut);
  const down = ramp(t, CUE.kayra3, CUE.uygo - CUE.kayra3 + 0.15, easeInOut);
  const arrived = springy(t, CUE.uygo + 0.12, 0.5);
  const atSchool = ramp(t, CUE.mektepke3 + 0.6, 0.2);
  const ring = t > CUE.sabaktan ? Math.sin((t - CUE.sabaktan) * 30) * 10 * (1 - ramp(t, CUE.sabaktan + 0.6, 0.3)) : 0;
  const marker = down > 0 ? downAt(down) : up > 0 ? upAt(up) : null;
  const tod = t >= CUE.sabaktan - 0.1 ? "Сабактан кийин" : "Эртең менен";
  const todAt = t >= CUE.sabaktan - 0.1 ? CUE.sabaktan : CUE.erteng;
  return (
    <>
      <Formula t={t} out={out} />
      <GlassPanel t={t} at={CUE.erteng - 0.25} out={out} {...PANEL} tilt={6}>
        {/* «карта»: сетка улиц */}
        <svg width={PANEL.width} height={PANEL.height} style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={i * 88 + 20} y1={0} x2={i * 88 - 30} y2={PANEL.height} stroke="#8FB0FF" strokeWidth={i % 3 === 0 ? 5 : 2} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 90 + 30} x2={PANEL.width} y2={i * 90 + 10} stroke="#8FB0FF" strokeWidth={i % 2 === 0 ? 4 : 2} />
          ))}
        </svg>
        {/* время суток */}
        <div style={{ position: "absolute", left: 28, top: 22, display: "flex", alignItems: "center", gap: 12, opacity: ramp(t, todAt, 0.25), transform: `translateY(${(1 - ramp(t, todAt, 0.3, easeOut)) * -14}px)` }}>
          <div style={{ position: "relative", width: 64, height: 64 }}>
            {sun > 0.01 ? (
              <div style={{ position: "absolute", inset: 0, transform: `scale(${sun}) rotate(${(t - CUE.erteng) * 30}deg)` }}>
                <SunIcon size={64} />
              </div>
            ) : null}
            {bell > 0.01 ? (
              <div style={{ position: "absolute", inset: 0, transform: `scale(${bell}) rotate(${ring}deg)`, transformOrigin: "50% 15%" }}>
                <BellIcon size={64} />
              </div>
            ) : null}
          </div>
          <span style={{ fontFamily, fontWeight: 900, fontSize: 38, color: C.white }}>{tod}</span>
        </div>
        <svg width={PANEL.width} height={PANEL.height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={UP} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={10} strokeDasharray="3 16" strokeLinecap="round" />
          <path d={DOWN} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={10} strokeDasharray="3 16" strokeLinecap="round" />
          <path d={UP} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${up} 1`} />
          <path d={DOWN} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${down} 1`} />
          {marker ? (
            <>
              <circle cx={marker[0]} cy={marker[1]} r={34} fill={C.yellow} opacity={0.25} />
              <circle cx={marker[0]} cy={marker[1]} r={18} fill={C.yellow} stroke={C.white} strokeWidth={5} />
            </>
          ) : null}
        </svg>
        {/* дом */}
        <div style={{ position: "absolute", left: HOME.x - 85, top: HOME.y - 85, width: 170, height: 170, transform: `scale(${home})` }}>
          <Glow size={300} opacity={0.6 * arrived} style={{ left: -65, top: -65 }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }}>
            <HouseIcon size={112} />
          </div>
          <div style={{ position: "absolute", left: -20, right: -20, top: 176, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 36, color: C.white }}>ҮЙ</div>
          {arrived > 0 ? (
            <div style={{ position: "absolute", right: -22, top: -22, transform: `scale(${arrived})` }}>
              <CheckIcon size={70} />
            </div>
          ) : null}
        </div>
        {/* школа */}
        <div style={{ position: "absolute", left: SCHOOL.x - 85, top: SCHOOL.y - 85, width: 170, height: 170, transform: `scale(${school})` }}>
          <Glow size={300} opacity={0.6 * atSchool * (1 - down)} style={{ left: -65, top: -65 }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }}>
            <SchoolIcon size={116} />
          </div>
          <div style={{ position: "absolute", left: -40, right: -40, top: 176, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 36, color: C.white }}>МЕКТЕП</div>
        </div>
      </GlassPanel>
    </>
  );
};

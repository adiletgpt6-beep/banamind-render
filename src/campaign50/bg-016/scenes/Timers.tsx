// Сцена 3: крупнее. Мальчик ставит рядом два таймера «ЖУМУШ» и «МЕКТЕП» —
// оба на 8:00. «Апа, эртең мени сиз жеткиресизби?» Мама видит частые
// утренние совпадения и вместо «волшебного» решения открывает семейный
// календарь в телефоне: «Балам, каттамды алдын ала пландасак жакшы болот
// окшойт.» — и добавляет запись «Каттамды пландоо».
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../../fonts";
import { Actor, atBody, type Place } from "../Actor";
import { cueOf, useScene } from "../context";
import { KitchenBack, PAL, Timer } from "../Kitchen";
import { clamp, easeInOut, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { wordTime } from "../timeline";
import { pop } from "../ui";

const SON: Place = { x: 320, y: 1985, h: 1180 };
const MOM: Place = { x: 790, y: 2040, h: 1380 };
const TOP = 1262; // край стола (крупный план)
const T_WORK = { x: 468, y: 1352 };
const T_SCHOOL = { x: 628, y: 1352 };

const DAYS = ["Дш", "Шш", "Шр", "Бш", "Жм"];

// Семейный календарь в телефоне (крупно, выноской).
export const CalendarCard: React.FC<{ readonly f: number; readonly from: number; readonly noteAt: number; readonly scale?: number }> = ({ f, from, noteAt, scale = 1 }) => {
  const t = (f - from) / 14;
  if (t <= 0) return null;
  const s = pop(t) * scale;
  const typed = "Каттамды пландоо";
  const n = Math.round(clamp((f - noteAt) / 26) * typed.length);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 240,
        width: 920,
        transformOrigin: "820px 540px",
        transform: `scale(${s})`,
        opacity: clamp(t * 2),
        borderRadius: 40,
        background: "#FFFFFF",
        boxShadow: "0 24px 60px rgba(30,47,92,0.22)",
        padding: "30px 34px 34px",
        fontFamily,
        color: PAL.navy,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 900 }}>
        <svg width={52} height={52} viewBox="0 0 52 52">
          <rect x={3} y={8} width={46} height={41} rx={9} fill="#FFFFFF" stroke={PAL.navy} strokeWidth={4} />
          <rect x={3} y={8} width={46} height={13} rx={6} fill="#E5677A" />
          <rect x={13} y={2} width={6} height={14} rx={3} fill={PAL.navy} />
          <rect x={33} y={2} width={6} height={14} rx={3} fill={PAL.navy} />
        </svg>
        Үй-бүлө календары
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        {DAYS.map((d, i) => {
          const a = clamp((f - from - 8 - i * 4) / 8);
          return (
            <div key={d} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#7A86A6" }}>{d}</div>
              <div style={{ marginTop: 10, height: 150, borderRadius: 18, background: "#F4F6FA", position: "relative", opacity: a }}>
                <div style={{ position: "absolute", left: 8, right: 8, top: 14, height: 54, borderRadius: 12, background: "#FCE1E5", border: "3px solid #E5677A", fontSize: 20, fontWeight: 900, lineHeight: "50px" }}>
                  Мектеп
                </div>
                <div style={{ position: "absolute", left: 8, right: 8, top: 52, height: 54, borderRadius: 12, background: "#DCE8F8", border: "3px solid #3E6FB0", fontSize: 20, fontWeight: 900, lineHeight: "50px", opacity: 0.95 }}>
                  Жумуш
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, fontSize: 22, fontWeight: 900, color: "#D9473F" }}>8:00</div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 22,
          height: 74,
          borderRadius: 20,
          border: `4px dashed ${n > 0 ? PAL.yellow : "#C9D1DB"}`,
          background: n > 0 ? "#FFF6D6" : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 22px",
          fontSize: 36,
          fontWeight: 900,
        }}
      >
        <span style={{ fontSize: 40, color: "#F2A541" }}>+</span>
        {typed.slice(0, n)}
        {n > 0 && n < typed.length ? <span style={{ color: PAL.yellow }}>|</span> : null}
      </div>
    </div>
  );
};

export const TimersScene: React.FC = () => {
  const { f, abs, tl, at, len } = useScene("timers");
  const c02 = cueOf(tl, "c02");
  const m01 = cueOf(tl, "m01");
  const ask = at(c02.from);
  const ans = at(m01.from);
  const plan = at(wordTime(m01, 4));
  // таймеры: в руках → на стол (8–34), подсветка совпадения с 36
  const put = easeInOut((f - 8) / 26);
  const workPos = keysV(f, [[0, { x: 250, y: 1228 }], [8, { x: 250, y: 1228 }], [34, T_WORK]]);
  const schoolPos = keysV(f, [[0, { x: 410, y: 1238 }], [8, { x: 410, y: 1238 }], [34, T_SCHOOL]]);
  const alert = f > 36 ? 0.55 + 0.45 * Math.sin((f - 36) / 5) : 0;
  // камера: лёгкий наезд; в конце — в календарь (переход к телефону)
  const zoomOut = easeInOut((f - (len - 26)) / 26);
  const cam = 1 + 0.04 * clamp(f / len) + zoomOut * 0.9;

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF5E6" }}>
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "540px 560px" }}>
        <AbsoluteFill style={{ transform: "scale(1.55)", transformOrigin: "560px 420px", filter: "blur(2px)" }}>
          <KitchenBack clockMin={7 * 60 + 53} fridgeNote={1} />
        </AbsoluteFill>
        <Actor
          uid="t-son"
          look="son"
          f={f}
          abs={abs}
          place={SON}
          role="son"
          seed={3}
          face={(x) => keys(x, [[0, 0.2], [ask - 12, 0.2], [ask, 0.6], [ans + 40, 0.6], [ans + 60, 0.4]])}
          pose={(x) => ({
            expr: x < ask ? "thinking" : x < ans + 20 ? "worried" : "softSmile",
            lookY: keys(x, [[0, 0.7], [ask - 12, 0.7], [ask, -0.3], [plan, -0.3], [plan + 16, -0.6]]),
            headTilt: keys(x, [[0, 0], [ask, 6]]),
            armL: { target: { x: workPos.x - 6, y: workPos.y - 30 }, shape: put < 1 ? "fist" : "relax", elbow: "down" },
            armR: { target: { x: schoolPos.x - 6, y: schoolPos.y - 30 }, shape: put < 1 ? "fist" : "relax", elbow: "down" },
          })}
        />
        <Actor
          uid="t-mom"
          look="mom"
          f={f}
          abs={abs}
          place={MOM}
          role="mother"
          seed={5}
          face={(x) => keys(x, [[0, -0.5], [ans - 10, -0.5], [ans, -0.65], [ans + 34, -0.65], [ans + 48, -0.1]])}
          pose={(x) => ({
            expr: x < 40 ? "thinking" : x < ans ? "worried" : "softSmile",
            lookY: keys(x, [[0, 0.8], [ask, 0.8], [ask + 14, 0.3], [ans + 34, 0.3], [ans + 48, 0.65]]),
            lean: keys(x, [[0, 4], [ask, 9]]),
            headTilt: keys(x, [[0, 0], [ans, -5]]),
            armL: { target: keysV(x, [[0, { x: 690, y: TOP + 40 }], [ans + 26, { x: 690, y: TOP + 40 }], [ans + 44, atBody(MOM, -60, -640)], [plan - 4, atBody(MOM, -60, -640)], [plan + 6, atBody(MOM, 30, -690)], [plan + 40, atBody(MOM, 30, -690)]]), shape: x > plan - 4 && x < plan + 40 ? "point" : "relax", elbow: "down" },
            armR: { target: keysV(x, [[0, { x: 900, y: TOP + 60 }], [ans + 20, { x: 900, y: TOP + 60 }], [ans + 40, atBody(MOM, 40, -680)]]), shape: x > ans + 28 ? "phone" : "relax", item: x > ans + 28 ? "phone" : "none", elbow: "down", glow: 1 },
          })}
        />
        {/* стол крупно */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={`M-40 ${TOP} L1120 ${TOP} L1120 1920 L-40 1920 Z`} fill="#E8BE90" />
          <path d={`M-40 ${TOP} L1120 ${TOP} L1120 ${TOP + 14} L-40 ${TOP + 14} Z`} fill="#F2CFA6" />
          {[1420, 1600, 1820].map((y) => (
            <path key={y} d={`M-40 ${y} Q 540 ${y - 18} 1120 ${y}`} stroke="#D9A877" strokeWidth={4} fill="none" opacity={0.6} />
          ))}
          <Timer x={workPos.x} y={workPos.y} label="ЖУМУШ" color="#3E6FB0" rot={keys(f, [[0, -12], [34, -4]])} s={1.15} alert={alert} />
          <Timer x={schoolPos.x} y={schoolPos.y} label="МЕКТЕП" color="#E5677A" rot={keys(f, [[0, 10], [34, 4]])} s={1.15} alert={alert} />
          {f > 40 ? (
            <g transform={`translate(548 1150) scale(${pop((f - 40) / 10)})`}>
              <rect x={-150} y={-38} width={300} height={70} rx={35} fill="#FFB020" />
              <text y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={36} fill="#FFFFFF">
                Экөө тең 8:00
              </text>
            </g>
          ) : null}
        </svg>
        <CalendarCard f={f} from={ans + 40} noteAt={plan + 6} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: clamp((f - (len - 8)) / 8) }} />
    </AbsoluteFill>
  );
};

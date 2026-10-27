// Сцена 9: честная работа услуги. Сверху — маршрут ҮЙ → МЕКТЕП → ҮЙ на
// фоне Ала-Тоо: та же жёлтая (теперь непрерывная) линия, белая машина
// BalaGo едет утром к школе и после уроков обратно (схема, не «выполненная
// поездка» героев). Снизу по словам диктора появляются этапы: заявка →
// подбор подходящей группы (3–4 ребёнка, поиск до 2 недель) → первая
// полная пробная поездка бесплатно → решение семьи (оплата только после).
import { ArrowText, CarSide, CheckIcon, easeInOut, easeOut, House, Mountains, NAVY, NAVY_SOFT, Poplar, popScale, prog, School, WA_GREEN, YELLOW, YELLOW_SOFT } from "../art";
import { local, type SceneProps } from "../kit";
import { BG9_TEXT } from "../script";
import { cueOf, wordTime } from "../timing";

const T = BG9_TEXT.how;
const MAP = { x: 50, y: 430, w: 980, h: 500 };
const HOME_X = 170;
const SCHOOL_X = 820;
const ROAD_Y = 380; // в координатах карты

export const How: React.FC<SceneProps> = ({ t, tl }) => {
  const { s, lt } = local(tl, "how", t);
  const n09 = cueOf(tl, "n09");
  const go = wordTime(n09, "үйдөн", 0.02) - s.from;
  const back = wordTime(n09, "сабактан", 0.22) - s.from;
  const steps = [s.from + 0.5, wordTime(n09, "ылайыктуу", 0.5), wordTime(n09, "биринчи", 0.7), n09.to + 0.15].map((x) => x - s.from);
  const free = wordTime(n09, "акысыз", 0.92) - s.from;
  // вход: панель поднимается снизу поверх субботы
  const enter = easeInOut(prog(lt, -0.45, 0.5));
  // машина: утром үй → мектеп, после уроков обратно
  const leg = 1.5;
  const toSchool = easeInOut(prog(lt, go + 0.2, leg));
  const toHome = easeInOut(prog(lt, back + 0.1, leg));
  const carX = HOME_X + 70 + (SCHOOL_X - HOME_X - 160) * (toSchool - toHome);
  const returning = lt >= back + 0.1;
  const moving = (lt > go + 0.2 && lt < go + 0.2 + leg) || (lt > back + 0.1 && lt < back + 0.1 + leg);
  const label = returning ? T.afternoon : T.morning;
  const labelOn = easeOut(prog(lt, go + 0.1, 0.3));
  const routeDraw = easeInOut(prog(lt, 0.1, 0.8));
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - enter) * 1920}px)`, backgroundColor: "#FFFFFF" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "10px 34px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 56, fontWeight: 1000, color: NAVY, display: "flex", alignItems: "center", letterSpacing: 1 }}>
          <ArrowText text={T.route} size={52} />
        </div>
      </div>
      {/* карта */}
      <div style={{ position: "absolute", left: MAP.x, top: MAP.y, width: MAP.w, height: MAP.h, borderRadius: 36, overflow: "hidden", background: "linear-gradient(180deg, #E4F0FC 0%, #F4F8FD 60%, #E8F2E2 100%)" }}>
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", left: 0, top: 0 }}>
          <Mountains width={MAP.w} y={110} shift={-lt * 4} />
          {[90, 300, 470, 640, 930].map((x, i) => (
            <Poplar key={x} x={x} y={ROAD_Y - 40} s={1.5 + (i % 2) * 0.3} />
          ))}
          <rect x={0} y={ROAD_Y - 6} width={MAP.w} height={56} fill="#D9E0EA" />
          <path d={`M 0 ${ROAD_Y + 22} L ${MAP.w} ${ROAD_Y + 22}`} stroke="#FFFFFF" strokeWidth={5} strokeDasharray="26 22" />
          {/* непрерывная жёлтая линия маршрута */}
          <path d={`M ${HOME_X} ${ROAD_Y - 30} C ${HOME_X + 200} ${ROAD_Y - 90}, ${SCHOOL_X - 200} ${ROAD_Y - 90}, ${SCHOOL_X} ${ROAD_Y - 30}`} fill="none" stroke={YELLOW} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeDraw} />
          <g transform={`translate(${HOME_X} ${ROAD_Y - 6}) scale(1.7)`}>
            <House glow={returning ? prog(lt, back + 0.1 + leg - 0.2, 0.4) : 0} />
          </g>
          <g transform={`translate(${SCHOOL_X} ${ROAD_Y - 6}) scale(1.55)`}>
            <School glow={!returning ? prog(lt, go + leg, 0.4) : 0} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: HOME_X - 40, top: ROAD_Y + 60, fontSize: 32, fontWeight: 1000, color: NAVY }}>{T.home}</div>
        <div style={{ position: "absolute", left: SCHOOL_X - 80, top: ROAD_Y + 60, fontSize: 32, fontWeight: 1000, color: NAVY }}>{T.school}</div>
        <div style={{ position: "absolute", left: carX - 105, top: ROAD_Y - 80 + (moving ? Math.sin(lt * 26) * 1.5 : 0) }}>
          <CarSide width={210} flip={returning} wheelTurn={lt * (moving ? 900 : 0)} />
        </div>
        {labelOn > 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, display: "flex", justifyContent: "center", opacity: labelOn }}>
            <div key={label} style={{ padding: "8px 24px", borderRadius: 30, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 34, fontWeight: 1000, transform: `scale(${popScale(prog(lt, returning ? back + 0.1 : go + 0.1, 0.3))})` }}>
              {label}
            </div>
          </div>
        ) : null}
      </div>
      {/* этапы */}
      <div style={{ position: "absolute", left: 50, right: 50, top: 960, display: "flex", flexDirection: "column", gap: 14 }}>
        {T.steps.map((st, i) => {
          const u = easeOut(prog(lt, steps[i], 0.4));
          const isFree = i === 2;
          const stamp = isFree ? popScale(prog(lt, free, 0.35)) : 0;
          return (
            <div
              key={st.n}
              style={{
                opacity: u,
                transform: `translateX(${(1 - u) * 80}px)`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "12px 20px",
                borderRadius: 26,
                backgroundColor: isFree ? YELLOW_SOFT : "#F3F6FB",
                border: `3px solid ${isFree ? YELLOW : "#DCE3EE"}`,
                position: "relative",
              }}
            >
              <div style={{ width: 62, height: 62, flexShrink: 0, borderRadius: 31, backgroundColor: i === 0 ? WA_GREEN : NAVY, color: "#FFFFFF", fontSize: 34, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 0 ? <CheckIcon size={36} color="#FFFFFF" /> : st.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 1000, color: NAVY, lineHeight: 1.1 }}>{st.title}</div>
                <div style={{ fontSize: 27, fontWeight: 900, color: NAVY_SOFT, lineHeight: 1.15 }}>{st.note}</div>
              </div>
              {stamp > 0 ? (
                <div style={{ position: "absolute", right: 18, top: -18, padding: "6px 18px", borderRadius: 22, backgroundColor: WA_GREEN, color: "#FFFFFF", fontSize: 32, fontWeight: 1000, transform: `scale(${stamp}) rotate(-6deg)`, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckIcon size={28} color="#FFFFFF" /> АКЫСЫЗ
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

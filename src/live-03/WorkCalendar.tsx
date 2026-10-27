// Сцены 2–4 (≈ 6–22.7 с исходника).
// 2: «Жолугушууңуз барбы? Жумушуңуз бүтө элекпи? Же башка ишиңиз чыгып
//    калдыбы?» — единый рабочий календарь: карточки «Жолугушуу», «Жумуш»,
//    «Башка иштер» входят с поворотом в пространстве и складываются над
//    якорной строкой 15:00 «Мектеп». «…мектепке барчу убакыт жакындап
//    калат» — строка 15:00 подсвечивается, кольцо времени заполняется.
// 3: «Ошондо ишиңизди токтотосуз» — индикатор работы замирает (пауза),
//    остальное приглушается, школьная поездка выделяется.
// 4: на развороте календарь складывается, его жёлтая линия времени
//    становится линией маршрута «ЖУМУШ → МЕКТЕП → ЖУМУШ»: машина родителя
//    едет в школу под «Жолго чыгасыз, балаңызды алып келесиз» и обратно
//    под «Анан кайра өз ишиңизге кайтып келүүгө туура келет».
import { useCurrentFrame } from "remotion";
import { Sedan } from "../morning-story/props";
import { F, GESTURE, SEGMENT_STARTS, SPEECH } from "./edit";
import { BriefcaseIcon, CalendarIcon, MeetingIcon, PauseIcon, SchoolIcon, TasksIcon } from "./icons";
import { easeInOut, easeOut, enter, lerp, ramp } from "./motion";
import { baseText, Card, MUTED, NAVY, NAVY_DEEP, upper, WHITE, YELLOW, YELLOW_SOFT } from "./ui";

const T_START = SEGMENT_STARTS[1];
const T_PAUSE = F(SPEECH.toktotosuz);
const T_DIM = F(SPEECH.oshondo);
const T_FOLD = F(GESTURE.turn);
const T_ROUTE = T_FOLD + 6;
const T_ROUTE_END = SEGMENT_STARTS[5];

const CAL = { left: 548, top: 922, w: 430 };
const ROW_H = 74;
const GAP = 10;
const HEADER = 64;

type Row = {
  readonly time: string;
  readonly label: string;
  readonly icon: React.FC<{ size: number; color?: string }>;
  readonly at: number;
  readonly progress?: boolean;
  readonly school?: boolean;
};

const ROWS: readonly Row[] = [
  { time: "13:00", label: "Жолугушуу", icon: MeetingIcon, at: F(SPEECH.jolugushuu) },
  { time: "14:00", label: "Жумуш", icon: BriefcaseIcon, at: F(SPEECH.jumushunuz), progress: true },
  { time: "14:30", label: "Башка иштер", icon: TasksIcon, at: F(SPEECH.bashka) },
  { time: "15:00", label: "Мектеп", icon: SchoolIcon, at: T_START + 2, school: true },
];

const progressAt = (frame: number) => {
  const f = Math.min(frame, T_PAUSE);
  return Math.min(0.82, 0.12 + Math.max(0, f - ROWS[1].at) / 260);
};

const CalendarRow: React.FC<{ readonly row: Row; readonly i: number; readonly frame: number }> = ({ row, i, frame }) => {
  const a = enter(frame, row.at);
  const Icon = row.icon;
  const dim = row.school ? 1 : lerp(1, 0.42, ramp(frame, T_DIM, T_DIM + 10));
  const paused = frame >= T_PAUSE;
  // свёртывание на развороте: строки по очереди «ложатся» сверху вниз
  const fold = ramp(frame, T_FOLD + i * 2, T_FOLD + i * 2 + 8, easeInOut);
  const pulse = row.school ? ramp(frame, F(SPEECH.mektepke), F(SPEECH.mektepke) + 6) * (1 - ramp(frame, F(SPEECH.mektepke) + 6, F(SPEECH.mektepke) + 26)) : 0;
  const hl = row.school ? ramp(frame, F(SPEECH.mektepke), F(SPEECH.mektepke) + 8) : 0;
  const ring = row.school ? ramp(frame, F(SPEECH.ubakyt), F(SPEECH.line4End) + 6, easeInOut) : 0;
  const lift = row.school ? ramp(frame, T_PAUSE, T_PAUSE + 10, easeOut) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: HEADER + i * (ROW_H + GAP),
        height: ROW_H,
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 14px",
        boxSizing: "border-box",
        background: row.school ? `linear-gradient(90deg, ${YELLOW} 0%, #FFD84A ${100 - 60 * (1 - hl)}%, ${YELLOW_SOFT} 100%)` : "#EEF2F8",
        boxShadow: row.school
          ? `0 ${8 + 10 * lift}px ${18 + 20 * lift}px rgba(255,170,0,${0.25 + 0.3 * lift}), 0 0 ${30 * pulse}px rgba(255,201,14,0.9)`
          : "0 4px 10px rgba(10,20,50,0.08)",
        opacity: Math.min(1, a * 1.6) * dim * (1 - fold),
        transform: `rotateX(${(1 - a) * -75 + fold * 85}deg) translateY(${(1 - a) * -18}px) scale(${1 + 0.05 * lift + 0.04 * pulse})`,
        transformOrigin: "top center",
      }}
    >
      <div style={{ ...baseText, fontSize: 25, color: row.school ? NAVY_DEEP : MUTED, width: 74 }}>{row.time}</div>
      <div style={{ position: "relative", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {row.progress && paused ? <PauseIcon size={42} color={NAVY} /> : <Icon size={40} color={NAVY} />}
        {row.school && ring > 0 ? (
          <svg width={62} height={62} style={{ position: "absolute", left: -8, top: -8 }}>
            <circle cx={31} cy={31} r={28} fill="none" stroke={NAVY} strokeWidth={4} strokeLinecap="round" strokeDasharray={176} strokeDashoffset={176 * (1 - ring)} transform="rotate(-90 31 31)" />
          </svg>
        ) : null}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...baseText, fontSize: 29, color: NAVY_DEEP }}>{row.label}</div>
        {row.progress ? (
          <div style={{ marginTop: 6, height: 9, borderRadius: 5, background: "#D6DDEA", overflow: "hidden" }}>
            <div style={{ width: `${progressAt(frame) * 100}%`, height: "100%", borderRadius: 5, background: paused ? "#9AA6BC" : NAVY }} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Calendar: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T_START);
  const fold = ramp(frame, T_FOLD + 4, T_FOLD + 16, easeInOut);
  const height = HEADER + 4 * (ROW_H + GAP) + 8;
  return (
    <div
      style={{
        position: "absolute",
        left: CAL.left,
        top: CAL.top,
        width: CAL.w,
        height,
        perspective: 1100,
        transform: `translateY(${fold * 260}px) scale(${lerp(0.88, 1, a) * lerp(1, 0.55, fold)})`,
        transformOrigin: "center bottom",
        opacity: Math.min(1, a * 1.5) * (1 - fold),
      }}
    >
      <Card radius={30} style={{ left: 0, top: 0, width: CAL.w, height }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px 0" }}>
          <CalendarIcon size={36} />
          <div style={{ ...baseText, fontSize: 30, color: NAVY }}>Бүгүн</div>
        </div>
      </Card>
      {ROWS.map((r, i) => (frame >= r.at - 1 ? <CalendarRow key={r.time} row={r} i={i} frame={frame} /> : null))}
    </div>
  );
};

// ---------- Маршрут родителя ----------
const STRIP = { left: 110, top: 1190, w: 860, h: 206 };
const LINE_Y = 84; // внутри панели
const NODES = [
  { x: 120, label: "Жумуш", icon: BriefcaseIcon },
  { x: 430, label: "Мектеп", icon: SchoolIcon },
  { x: 740, label: "Жумуш", icon: BriefcaseIcon },
];
const LEG1 = { from: F(SPEECH.jolgo), to: F(SPEECH.line6End) - 2 };
const LEG2 = { from: F(SPEECH.anan), to: F(SPEECH.line7End) - 4 };
const CAR_W = 128;

const carX = (frame: number) => {
  const p1 = ramp(frame, LEG1.from, LEG1.to, easeInOut);
  const p2 = ramp(frame, LEG2.from, LEG2.to, easeInOut);
  const x0 = NODES[0].x + 50;
  const x1 = NODES[1].x - 50 - CAR_W;
  const x2 = NODES[1].x + 50;
  const x3 = NODES[2].x - 50 - CAR_W;
  if (frame < LEG2.from - 6) return { x: lerp(x0 - 6, x1, p1), moving: p1 > 0 && p1 < 1, dist: p1 * (x1 - x0) };
  // пауза у школы: машина «переставляется» за школу перед второй частью
  return { x: lerp(x2, x3, p2), moving: p2 > 0 && p2 < 1, dist: (x1 - x0) + p2 * (x3 - x2) };
};

const RouteStrip: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T_ROUTE);
  const out = 1 - ramp(frame, T_ROUTE_END - 8, T_ROUTE_END);
  const draw1 = ramp(frame, T_ROUTE, T_ROUTE + 14, easeOut);
  const draw2 = ramp(frame, LEG1.to - 4, LEG1.to + 10, easeOut);
  const atSchool = ramp(frame, LEG1.to - 2, LEG1.to + 6);
  const atWork = ramp(frame, LEG2.to - 2, LEG2.to + 6);
  const car = carX(frame);
  const carIn = ramp(frame, LEG1.from - 8, LEG1.from, easeOut);
  // смена половины маршрута: машина мягко исчезает у школы и появляется за ней
  const swap = frame < LEG2.from - 6 ? 1 - ramp(frame, LEG2.from - 12, LEG2.from - 6) : ramp(frame, LEG2.from - 6, LEG2.from);
  const nodeLit = [1, atSchool, atWork];
  return (
    <div
      style={{
        position: "absolute",
        left: STRIP.left,
        top: STRIP.top,
        width: STRIP.w,
        height: STRIP.h,
        opacity: Math.min(1, a * 1.5) * out,
        transform: `translateY(${(1 - a) * 30}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 34,
          background: "linear-gradient(180deg, rgba(20,40,90,0.86) 0%, rgba(12,24,56,0.92) 100%)",
          boxShadow: "0 22px 50px rgba(3,7,20,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      />
      <svg width={STRIP.w} height={STRIP.h} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* жёлтая линия маршрута: продолжает линию времени календаря */}
        <line x1={NODES[0].x} y1={LINE_Y} x2={lerp(NODES[0].x, NODES[1].x, draw1)} y2={LINE_Y} stroke={YELLOW} strokeWidth={6} strokeLinecap="round" />
        <line x1={NODES[1].x} y1={LINE_Y} x2={lerp(NODES[1].x, NODES[2].x, draw2)} y2={LINE_Y} stroke={YELLOW} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 14" />
        {[0, 1].map((k) => {
          const mid = (NODES[k].x + NODES[k + 1].x) / 2;
          const shown = k === 0 ? draw1 : draw2;
          return <path key={k} d={`M ${mid - 12} ${LINE_Y - 14} L ${mid + 6} ${LINE_Y} L ${mid - 12} ${LINE_Y + 14}`} fill="none" stroke={YELLOW} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={shown > 0.6 ? 1 : 0} />;
        })}
      </svg>
      {NODES.map((n, i) => {
        const Icon = n.icon;
        const lit = nodeLit[i];
        return (
          <div key={i} style={{ position: "absolute", left: n.x - 46, top: LINE_Y - 46, width: 92, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 46,
                background: i === 1 ? (lit > 0.5 ? YELLOW : WHITE) : WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 22px rgba(3,7,20,0.4), 0 0 ${lit * (i === 0 ? 0 : 26)}px rgba(255,201,14,0.85)`,
                transform: `scale(${1 + 0.08 * lit * (1 - ramp(frame, (i === 1 ? LEG1.to : LEG2.to) + 6, (i === 1 ? LEG1.to : LEG2.to) + 16))})`,
              }}
            >
              <Icon size={52} color={NAVY} />
            </div>
            <div style={{ ...baseText, fontSize: 28, color: WHITE, marginTop: 10, letterSpacing: 1.5 }}>{upper(n.label)}</div>
          </div>
        );
      })}
      {/* машина родителя (нейтральная, не белая машина BalaGo) */}
      <div style={{ position: "absolute", left: car.x, top: LINE_Y - 66, opacity: carIn * swap }}>
        <Sedan kind="car" width={CAR_W} wheel={car.dist * 2.2} />
      </div>
    </div>
  );
};

// Переход: жёлтая полоса сходит из строки 15:00 вниз к маршруту.
const Bridge: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const p = ramp(frame, T_FOLD + 2, T_ROUTE + 8, easeInOut);
  const out = 1 - ramp(frame, T_ROUTE + 8, T_ROUTE + 16);
  if (p <= 0 || out <= 0) return null;
  const y0 = CAL.top + HEADER + 3 * (ROW_H + GAP) + ROW_H / 2;
  const y1 = STRIP.top + LINE_Y;
  const x0 = CAL.left + CAL.w / 2;
  const x1 = STRIP.left + NODES[0].x;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
      <path
        d={`M ${x0} ${y0} C ${x0} ${y1 - 40}, ${x1 + 160} ${y1}, ${x1} ${y1}`}
        fill="none"
        stroke={YELLOW}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={900}
        strokeDashoffset={900 * (1 - p)}
        style={{ filter: "drop-shadow(0 0 10px rgba(255,201,14,0.9))" }}
      />
    </svg>
  );
};

export const WorkCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T_START || frame > T_ROUTE_END + 1) return null;
  return (
    <>
      {frame < T_FOLD + 20 ? <Calendar frame={frame} /> : null}
      <Bridge frame={frame} />
      {frame >= T_ROUTE ? <RouteStrip frame={frame} /> : null}
    </>
  );
};

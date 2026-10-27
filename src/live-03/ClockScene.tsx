// Сцена 1 (≈ 0–4.7 с исходника): «Саат үчтө балаңыздын сабагы бүтсө,
// сиздин күнүңүз да саат үчкө байланып калат».
// Крупное объёмное 15:00 входит по маске вместе со словами «Саат үчтө»;
// объёмный циферблат — стрелки сходятся на трёх часах; карточка «Сабак
// бүттү»; тонкая жёлтая линия связывает школьное время с рабочим
// календарём родителя. На взгляде в телефон рядом с ним появляется
// карточка рабочего события и следует за телефоном.
import { useCurrentFrame } from "remotion";
import { F, GESTURE, PHONE_TRACK, SPEECH, toOut, track, segmentAt } from "./edit";
import { CalendarIcon, MeetingIcon, SchoolIcon } from "./icons";
import { easeOut, enter, lerp, ramp, visible } from "./motion";
import { baseText, Card, extrude, MUTED, NAVY, NAVY_DEEP, WHITE, YELLOW, YELLOW_SOFT } from "./ui";

const T0 = F(SPEECH.saat); // «Саат»
const T_SABAK = F(SPEECH.sabagy);
const T_SIZDIN = F(SPEECH.sizdin);
const T_BAYLANYP = F(SPEECH.baylanyp);
const T_PHONE = F(3.55);
const T_OUT = F(3.95); // главная графика уступает место телефону
const T_END = F(4.7);

// ---------- 15:00 ----------
const BigTime: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T0);
  const reveal = ramp(frame, T0, T0 + 12, easeOut); // маска снизу вверх
  const out = 1 - ramp(frame, T_OUT, T_OUT + 9);
  // двоеточие мягко «дышит», как у электронных часов
  const colon = 0.55 + 0.45 * Math.cos(((frame - T0) / 30) * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: 118,
        top: 196,
        ...baseText,
        fontSize: 196,
        letterSpacing: 2,
        color: WHITE,
        textShadow: extrude(9, "#B9C3D6"),
        clipPath: `inset(${(1 - reveal) * 100}% -40px -60px -40px)`,
        transform: `translateY(${(1 - a) * 46 + (1 - out) * -30}px) scale(${lerp(0.86, 1, a) * lerp(0.82, 1, out)})`,
        transformOrigin: "left bottom",
        opacity: out,
      }}
    >
      15<span style={{ color: YELLOW, opacity: colon, textShadow: extrude(9, "#C99A00") }}>:</span>00
    </div>
  );
};

// ---------- Объёмный циферблат ----------
const CLOCK = { cx: 868, cy: 318, r: 104 };

const Clock: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T0 + 4);
  const out = 1 - ramp(frame, T_OUT, T_OUT + 9);
  // стрелки: с 10:10 сходятся к 3:00 к концу «Саат үчтө»
  const p = ramp(frame, T0 + 4, T0 + 26, easeOut);
  const minute = lerp(-300, 0, p); // минутная → 12
  const hour = lerp(-50, 90, p); // часовая → 3
  const tilt = lerp(-38, -14, a); // лёгкий поворот в пространстве
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  const done = ramp(frame, T0 + 24, T0 + 30);
  return (
    <div
      style={{
        position: "absolute",
        left: CLOCK.cx - CLOCK.r - 20,
        top: CLOCK.cy - CLOCK.r - 20,
        width: CLOCK.r * 2 + 40,
        height: CLOCK.r * 2 + 40,
        perspective: 900,
        opacity: Math.min(1, a * 1.4) * out,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotateY(${tilt}deg) rotateX(8deg) scale(${lerp(0.6, 1, a) * lerp(0.8, 1, out)})`,
          filter: "drop-shadow(0 26px 30px rgba(3,7,20,0.5))",
        }}
      >
        <svg width="100%" height="100%" viewBox="-124 -124 248 248">
          <defs>
            <radialGradient id="l3face" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E4EAF4" />
            </radialGradient>
            <linearGradient id="l3rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE27A" />
              <stop offset="100%" stopColor="#D79E00" />
            </linearGradient>
          </defs>
          {/* толщина корпуса: смещённые слои */}
          {[10, 8, 6, 4, 2].map((d) => (
            <circle key={d} cx={d * 0.7} cy={d} r="112" fill="#B07F00" />
          ))}
          <circle r="112" fill="url(#l3rim)" />
          <circle r="98" fill="url(#l3face)" />
          {ticks.map((i) => (
            <rect
              key={i}
              x={-3}
              y={-92}
              width={6}
              height={i % 3 === 0 ? 18 : 10}
              rx={3}
              fill={i === 3 ? YELLOW : NAVY}
              transform={`rotate(${i * 30})`}
            />
          ))}
          <g transform={`rotate(${hour})`}>
            <rect x={-6} y={-56} width={12} height={64} rx={6} fill={NAVY} />
          </g>
          <g transform={`rotate(${minute})`}>
            <rect x={-4} y={-82} width={8} height={92} rx={4} fill={NAVY} />
          </g>
          <circle r="10" fill={YELLOW} stroke={NAVY} strokeWidth="4" />
          {/* блик стекла */}
          <path d="M-70 -50 A 86 86 0 0 1 30 -84" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* стрелки встали на 3:00 — мягкий жёлтый ободок */}
          <circle r="112" fill="none" stroke={YELLOW} strokeWidth={6} opacity={done * (1 - ramp(frame, T0 + 30, T0 + 50))} transform={`scale(${1 + 0.18 * ramp(frame, T0 + 26, T0 + 50)})`} />
        </svg>
      </div>
    </div>
  );
};

// ---------- Карточка «Сабак бүттү» ----------
const LESSON = { left: 764, top: 452, w: 222, h: 84 };

const LessonCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T_SABAK);
  const out = 1 - ramp(frame, T_OUT, T_OUT + 8);
  return (
    <Card
      radius={22}
      style={{
        left: LESSON.left,
        top: LESSON.top,
        width: LESSON.w,
        height: LESSON.h,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        boxSizing: "border-box",
        opacity: Math.min(1, a * 1.5) * out,
        transform: `perspective(700px) rotateX(${(1 - a) * -50}deg) translateY(${(1 - a) * -20}px)`,
        transformOrigin: "top center",
      }}
    >
      <SchoolIcon size={46} />
      <div style={{ ...baseText, fontSize: 31, color: NAVY, lineHeight: 1.0 }}>
        Сабак
        <br />
        бүттү
      </div>
    </Card>
  );
};

// ---------- Рабочий календарь родителя ----------
const WORK = { left: 112, top: 760, w: 318 };
const ROWS = ["13:00", "14:00", "15:00"];

const WorkDay: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const a = enter(frame, T_SIZDIN);
  const out = 1 - ramp(frame, T_OUT, T_OUT + 8);
  const lock = ramp(frame, T_BAYLANYP, T_BAYLANYP + 8, easeOut);
  return (
    <Card
      radius={26}
      style={{
        left: WORK.left,
        top: WORK.top,
        width: WORK.w,
        padding: "18px 20px 16px",
        boxSizing: "border-box",
        opacity: Math.min(1, a * 1.5) * out,
        transform: `perspective(800px) rotateY(${(1 - a) * 40}deg) scale(${lerp(0.8, 1, a)})`,
        transformOrigin: "left center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <CalendarIcon size={38} />
        <div style={{ ...baseText, fontSize: 30, color: NAVY }}>Жумуш күнү</div>
      </div>
      {ROWS.map((r, i) => {
        const key = i === 2;
        return (
          <div
            key={r}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 46,
              marginTop: 6,
              borderRadius: 14,
              padding: "0 12px",
              background: key ? `rgba(255,201,14,${0.25 + 0.75 * lock})` : "#EEF2F8",
              boxShadow: key ? `0 0 ${24 * lock}px rgba(255,201,14,0.65)` : "none",
            }}
          >
            <div style={{ ...baseText, fontSize: 26, color: key ? NAVY : MUTED, width: 84 }}>{r}</div>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: key ? NAVY : "#D6DDEA", opacity: key ? 0.85 : 1 }} />
          </div>
        );
      })}
    </Card>
  );
};

// ---------- Жёлтая линия: школа → календарь ----------
// Колено обходит лицо: вниз от карточки урока, затем влево к строке 15:00.
const ROW15_Y = WORK.top + 18 + 48 + 2 * 52 + 23; // центр строки 15:00
const LINE_PATH = `M ${LESSON.left + LESSON.w / 2} ${LESSON.top + LESSON.h} L ${LESSON.left + LESSON.w / 2} ${ROW15_Y - 24} Q ${LESSON.left + LESSON.w / 2} ${ROW15_Y} ${LESSON.left + LESSON.w / 2 - 24} ${ROW15_Y} L ${WORK.left + WORK.w + 4} ${ROW15_Y}`;
const LINE_LEN = ROW15_Y - 24 - (LESSON.top + LESSON.h) + 38 + (LESSON.left + LESSON.w / 2 - 24 - (WORK.left + WORK.w + 4));

const Link: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const draw = ramp(frame, T_SIZDIN + 4, F(SPEECH.saat2) + 8, easeOut);
  const out = 1 - ramp(frame, T_OUT, T_OUT + 8);
  const pulse = ramp(frame, T_BAYLANYP, T_BAYLANYP + 6) * (1 - ramp(frame, T_BAYLANYP + 6, T_BAYLANYP + 22));
  // световая «искра» бежит по линии
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
      <path
        d={LINE_PATH}
        fill="none"
        stroke={YELLOW}
        strokeWidth={5 + 3 * pulse}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={LINE_LEN}
        strokeDashoffset={LINE_LEN * (1 - draw)}
        style={{ filter: `drop-shadow(0 0 ${8 + 14 * pulse}px rgba(255,201,14,0.9))` }}
      />
      <circle
        cx={WORK.left + WORK.w + 4}
        cy={ROW15_Y}
        r={9 + 5 * pulse}
        fill={YELLOW}
        opacity={ramp(frame, F(SPEECH.saat2) + 4, F(SPEECH.saat2) + 10)}
      />
    </svg>
  );
};

// ---------- Карточка у телефона ----------
const PhoneCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const { srcSec } = segmentAt(frame);
  // карточка держится рядом с телефоном; позиция чуть сглажена (среднее
  // по трём соседним моментам), чтобы не дрожать вместе с рукой
  const pts = [-0.1, 0, 0.1].map((d) => track(PHONE_TRACK, srcSec + d));
  const p = { x: (pts[0].x + pts[1].x + pts[2].x) / 3, y: (pts[0].y + pts[1].y + pts[2].y) / 3 };
  const o = toOut(frame, p.x, p.y);
  const a = enter(frame, T_PHONE);
  const vis = visible(frame, T_PHONE, T_END - 6, 6, 6);
  return (
    <div style={{ position: "absolute", left: o.x + 92, top: o.y - 132, perspective: 700, opacity: Math.min(vis, a * 1.6) }}>
      <svg width={120} height={120} style={{ position: "absolute", left: -96, top: 60, overflow: "visible" }}>
        {/* короткий световой хвост от телефона к карточке */}
        <path d="M 8 66 Q 40 30 96 22" stroke={YELLOW} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={120} strokeDashoffset={120 * (1 - ramp(frame, T_PHONE, T_PHONE + 8))} />
      </svg>
      <Card
        radius={22}
        style={{
          position: "relative",
          width: 330,
          padding: "14px 18px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 14,
          transform: `rotateY(${(1 - a) * -45}deg) scale(${lerp(0.7, 1, a)})`,
          transformOrigin: "left center",
        }}
      >
        <div style={{ width: 62, height: 62, borderRadius: 16, background: YELLOW_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MeetingIcon size={42} />
        </div>
        <div>
          <div style={{ ...baseText, fontSize: 24, color: MUTED }}>Жумуш · 15:00</div>
          <div style={{ ...baseText, fontSize: 32, color: NAVY_DEEP }}>Жолугушуу</div>
        </div>
      </Card>
    </div>
  );
};

export const ClockScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > T_END + 2) return null;
  const phoneOn = frame >= F(GESTURE.phoneUp);
  return (
    <>
      <Link frame={frame} />
      <WorkDay frame={frame} />
      <Clock frame={frame} />
      <LessonCard frame={frame} />
      <BigTime frame={frame} />
      {phoneOn ? <PhoneCard frame={frame} /> : null}
    </>
  );
};

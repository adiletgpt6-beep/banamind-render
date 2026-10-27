// Сцена 5 (≈ 23.2–28.3 с исходника): «Бир күн болсо мейли, бирок ушундай
// график күн сайын кайталанса, көп убакыт жолго кетет».
// Отрывной календарь справа от лица: «бир күн» — одна страница с 15:00;
// «ушундай график» — короткий цикл Жолугушуу → Жол → Кайтуу → Эртеси;
// «күн сайын кайталанса» — страницы перелистываются день за днём, и на
// каждой та же отметка 15:00 «Мектеп». На «көп убакыт…» второстепенная
// графика уходит — внимание на лицо и слова (акцент — в субтитре).
import { useCurrentFrame } from "remotion";
import { F, SEGMENT_STARTS, SPEECH } from "./edit";
import { BriefcaseIcon, CarIcon, HouseIcon, MeetingIcon, SchoolIcon } from "./icons";
import { easeIn, easeInOut, easeOut, enter, lerp, ramp } from "./motion";
import { baseText, CARD_SHADOW, NAVY, NAVY_DEEP, WHITE, YELLOW, YELLOW_SOFT } from "./ui";

const T_START = SEGMENT_STARTS[5];
const T_ONE = F(SPEECH.birKun);
const T_CYCLE = F(SPEECH.birok);
const T_FLIP = F(SPEECH.kunSayin);
const T_OUT = F(SPEECH.kop) - 2;
const T_END = SEGMENT_STARTS[6];

const DAYS = ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"];
const FLIP_EVERY = 7; // кадров между страницами
const flipStart = (k: number) => T_FLIP + k * FLIP_EVERY; // k = 0..3: уходит страница k

// Слева под лицом: в этом плане голова смещается слева направо, а зона
// над курткой слева свободна весь кусок.
const PAGE = { left: 120, top: 880, w: 330, h: 330 };

const Page: React.FC<{ readonly day: string }> = ({ day }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 26,
      overflow: "hidden",
      background: "linear-gradient(180deg, #FFFFFF 0%, #F1F4FA 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
      fontFamily: baseText.fontFamily,
    }}
  >
    <div style={{ height: 78, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...baseText, fontSize: 36, color: WHITE }}>{day}</div>
    </div>
    <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", ...baseText, fontSize: 92, color: NAVY_DEEP, letterSpacing: 1 }}>
      15<span style={{ color: YELLOW }}>:</span>00
    </div>
    <div
      style={{
        position: "absolute",
        left: 34,
        right: 34,
        bottom: 34,
        height: 74,
        borderRadius: 18,
        background: YELLOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <SchoolIcon size={44} color={NAVY} />
      <div style={{ ...baseText, fontSize: 34, color: NAVY_DEEP }}>Мектеп</div>
    </div>
  </div>
);

const CYCLE = [
  { label: "Жолугушуу", icon: MeetingIcon },
  { label: "Жол", icon: CarIcon },
  { label: "Кайтуу", icon: BriefcaseIcon },
  { label: "Эртеси", icon: HouseIcon },
];

const Cycle: React.FC<{ readonly frame: number; readonly out: number }> = ({ frame, out }) => {
  // подсветка бежит по кругу: на прочтение — первый проход медленнее,
  // затем быстрее вместе с перелистыванием
  const t = frame - T_CYCLE;
  const step = t < 0 ? -1 : t < 24 ? Math.floor(t / 6) : Math.floor((t - 24) / (FLIP_EVERY / 2)) % 4;
  return (
    <div
      style={{
        position: "absolute",
        left: PAGE.left - 30,
        top: PAGE.top + PAGE.h + 26,
        width: PAGE.w + 60,
        display: "flex",
        justifyContent: "space-between",
        opacity: out,
      }}
    >
      {CYCLE.map((c, i) => {
        const a = enter(frame, T_CYCLE + i * 4);
        const on = step === i;
        const Icon = c.icon;
        return (
          <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96, opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * 16}px) scale(${lerp(0.7, 1, a)})` }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                background: on ? YELLOW : WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: on ? "0 0 26px rgba(255,201,14,0.85), 0 10px 20px rgba(3,7,20,0.4)" : "0 10px 20px rgba(3,7,20,0.4)",
                transform: `scale(${on ? 1.1 : 1})`,
              }}
            >
              <Icon size={40} color={NAVY} />
            </div>
            <div style={{ ...baseText, fontSize: 21, color: WHITE, marginTop: 8, textShadow: "0 2px 8px rgba(3,7,20,0.8)" }}>{c.label}</div>
          </div>
        );
      })}
      {/* стрелки цикла */}
      <svg width={PAGE.w + 60} height={40} style={{ position: "absolute", left: 0, top: 16, pointerEvents: "none" }}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${96 + i * 110} 20 l 12 0 m -6 -6 l 6 6 l -6 6`} stroke={YELLOW} strokeWidth={4} fill="none" strokeLinecap="round" opacity={ramp(frame, T_CYCLE + i * 4 + 4, T_CYCLE + i * 4 + 8)} />
        ))}
      </svg>
    </div>
  );
};

export const DailyFlip: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T_START || frame > T_END) return null;
  const a = enter(frame, T_ONE - 2);
  const out = 1 - ramp(frame, T_OUT, T_OUT + 10, easeIn);
  // текущая верхняя страница
  let top = 0;
  for (let k = 0; k < 4; k++) if (frame >= flipStart(k) + FLIP_EVERY) top = k + 1;
  const k = top < 4 ? top : -1; // страница, которая сейчас может уходить
  const flipP = k >= 0 ? ramp(frame, flipStart(k), flipStart(k) + FLIP_EVERY, easeInOut) : 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: PAGE.left,
          top: PAGE.top,
          width: PAGE.w,
          height: PAGE.h,
          perspective: 1200,
          opacity: Math.min(1, a * 1.5) * out,
          transform: `translateY(${(1 - a) * 40 - (1 - out) * 30}px) rotateZ(${lerp(-5, -2, a)}deg) scale(${lerp(0.8, 1, a) * lerp(0.85, 1, out)})`,
          transformOrigin: "center top",
        }}
      >
        {/* стопка страниц: толщина блока */}
        {[3, 2, 1].map((d) => (
          <div key={d} style={{ position: "absolute", left: d * 3, top: d * 5, right: -d * 3, bottom: -d * 5, borderRadius: 26, background: d === 3 ? "#C9D2E2" : "#E2E8F2", boxShadow: d === 3 ? CARD_SHADOW : "none" }} />
        ))}
        {/* следующая страница под текущей */}
        {top + 1 < DAYS.length ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <Page day={DAYS[top + 1]} />
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "center top",
            transform: `rotateX(${flipP * 100}deg)`,
            opacity: 1 - ramp(flipP, 0.75, 1, easeOut),
            backfaceVisibility: "hidden",
          }}
        >
          <Page day={DAYS[top]} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: `rgba(10,20,50,${flipP * 0.35})` }} />
        </div>
        {/* кольца отрывного календаря */}
        {[80, 250].map((x) => (
          <div key={x} style={{ position: "absolute", left: x - 9, top: -16, width: 18, height: 36, borderRadius: 9, background: YELLOW_SOFT, border: `4px solid ${NAVY}`, boxSizing: "border-box" }} />
        ))}
      </div>
      <Cycle frame={frame} out={Math.min(1, a) * out} />
    </>
  );
};

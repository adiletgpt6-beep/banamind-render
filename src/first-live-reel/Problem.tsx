// Проблема родителей: ежедневные поездки «үй ⇄ мектеп», часы
// «Убакыт жетпейби?» и список «Жумуш / Жолугушуу / Башка иштер».
import { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { outFrame, SPEECH, STAGE_BOTTOM } from "./edit";
import {
  BriefcaseIcon,
  CalendarIcon,
  ChecklistIcon,
  ClockIcon,
  HouseIcon,
  SchoolIcon,
  WhiteCar,
} from "./icons";
import { clamp, easeInOut, enter, leave, ramp } from "./motion";
import { baseText, CARD_SHADOW, NAVY, TEXT_SHADOW, WHITE, YELLOW } from "./ui";

const bottom = 1920 - STAGE_BOTTOM;

// Тёмная «стеклянная» подложка проблемы — контраст с белой графикой решения.
const glass: React.CSSProperties = {
  backgroundColor: "rgba(14,22,48,0.62)",
  border: "2px solid rgba(255,255,255,0.14)",
  borderRadius: 34,
  boxShadow: CARD_SHADOW,
};

export const DailyLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const from = outFrame(SPEECH.balanyzdy);
  const to = outFrame(SPEECH.ubakyt) - 2;
  if (frame < from || frame > to + 8) return null;
  const a = enter(frame, from + 2);
  const exit = leave(frame, to, 7);

  // машина снуёт туда-обратно: каждая поездка ≈ 0.75 с
  const LEG = 22;
  const t0 = from + 10;
  const legs = Math.max(0, (frame - t0) / LEG);
  const n = Math.floor(legs);
  const p = easeInOut(Math.min(1, legs - n));
  const forward = n % 2 === 0;
  const pos = frame < t0 ? 0 : forward ? p : 1 - p;
  const W = 840;
  const x0 = 150;
  const x1 = W - 150;
  const carX = x0 + (x1 - x0) * pos;
  const label = interpolate(frame, [from + 8, from + 16], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          ...glass,
          position: "relative",
          width: W,
          height: 196,
          opacity: Math.min(1, a * 1.5) * exit,
          transform: `translateY(${(1 - a) * 30 + (1 - exit) * 24}px)`,
        }}
      >
        {/* пунктир маршрута */}
        <div
          style={{
            position: "absolute",
            left: x0,
            right: W - x1,
            top: 82,
            borderTop: "5px dashed rgba(255,255,255,0.45)",
          }}
        />
        {[
          { x: 78, Icon: HouseIcon, text: "ҮЙ" },
          { x: W - 78, Icon: SchoolIcon, text: "МЕКТЕП" },
        ].map(({ x, Icon, text }) => (
          <div
            key={text}
            style={{
              position: "absolute",
              left: x - 80,
              width: 160,
              top: 18,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon size={104} color={WHITE} />
            <div style={{ ...baseText, fontSize: 34, color: WHITE, opacity: label }}>{text}</div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: carX - 62,
            top: 56,
            transform: `scaleX(${forward ? 1 : -1})`,
            opacity: interpolate(frame, [t0 - 6, t0], [0, 1], clamp),
          }}
        >
          <WhiteCar width={124} />
        </div>
      </div>
    </div>
  );
};

export const TimeClock: React.FC = () => {
  const frame = useCurrentFrame();
  const from = outFrame(SPEECH.ubakyt) - 3;
  const to = outFrame(SPEECH.jatabyEnd) + 3;
  if (frame < from || frame > to + 8) return null;
  const a = enter(frame, from);
  const exit = leave(frame, to, 6);
  // минутная стрелка делает один плавный оборот и «докручивается» тиком
  const spin = ramp(frame, from + 2, from + 26, easeInOut);
  const tick = interpolate(frame, [from + 26, from + 28, from + 31], [0, 1, 0], clamp);
  const minute = spin * Math.PI * 2 + tick * 0.12;
  const hour = Math.PI * 0.3 + spin * (Math.PI / 6);
  const word2 = enter(frame, from + 7);
  return (
    <div style={{ position: "absolute", bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          ...glass,
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "22px 46px 22px 28px",
          opacity: Math.min(1, a * 1.5) * exit,
          transform: `translateY(${(1 - a) * 30 + (1 - exit) * 24}px) scale(${0.92 + 0.08 * a})`,
        }}
      >
        <ClockIcon size={150} minuteAngle={minute} hourAngle={hour} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...baseText, fontSize: 72, color: WHITE, textShadow: TEXT_SHADOW }}>УБАКЫТ</div>
          <div
            style={{
              ...baseText,
              fontSize: 72,
              color: YELLOW,
              textShadow: TEXT_SHADOW,
              opacity: Math.min(1, word2 * 1.5),
              transform: `translateX(${(1 - word2) * 24}px)`,
            }}
          >
            ЖЕТПЕЙБИ?
          </div>
        </div>
      </div>
    </div>
  );
};

const TASKS = [
  { at: SPEECH.jumush, text: "ЖУМУШ", Icon: BriefcaseIcon },
  { at: SPEECH.jolugushuu, text: "ЖОЛУГУШУУ", Icon: CalendarIcon },
  { at: SPEECH.bashkaIshter, text: "БАШКА ИШТЕР", Icon: ChecklistIcon },
] as const;

export const TaskList: React.FC = () => {
  const frame = useCurrentFrame();
  const starts = useMemo(() => TASKS.map((t) => outFrame(t.at) - 2), []);
  const together = outFrame(SPEECH.listEnd) - 6;
  const out = outFrame(SPEECH.oshonUchun) - 2;
  if (frame < starts[0] || frame > out + 12) return null;
  // после третьего слова плитки собираются в одну композицию
  const join = ramp(frame, together, together + 10);
  const gap = 22 - 12 * join;
  return (
    <div style={{ position: "absolute", bottom, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          gap,
          padding: 14 * join,
          borderRadius: 40,
          border: `4px solid rgba(255,201,14,${join})`,
          boxShadow: join > 0 ? `0 0 ${30 * join}px rgba(255,201,14,${0.35 * join})` : "none",
        }}
      >
        {TASKS.map((t, i) => {
          const a = enter(frame, starts[i]);
          // уход по очереди, быстро
          const exit = leave(frame, out + i * 2, 7);
          return (
            <div
              key={t.text}
              style={{
                width: 296,
                height: 178,
                borderRadius: 30,
                backgroundColor: WHITE,
                boxShadow: CARD_SHADOW,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: frame < starts[i] ? 0 : Math.min(1, a * 1.6) * exit,
                transform: `translateY(${(1 - a) * 36 + (1 - exit) * 40}px) scale(${0.8 + 0.2 * a})`,
              }}
            >
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  backgroundColor: "#FFF4C2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <t.Icon size={66} />
              </div>
              <div style={{ ...baseText, fontSize: t.text.length > 6 ? 31 : 38, color: NAVY, letterSpacing: 0.5 }}>
                {t.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

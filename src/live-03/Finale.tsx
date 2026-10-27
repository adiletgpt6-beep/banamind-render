// Сцены 8–10 (≈ 37.6 с исходника → конец).
// 8: «Эгер сиздин күнүңүз балаңыздын убактысына байланып калса» — короткий
//    возврат календаря из начала: 15:00 теперь закрывает BalaGo, рабочие
//    дела продолжаются (индикатор снова движется).
// 9: жесты, привязанные покадрово: палец вверх (≈ 41.4–42.15 с) →
//    световая линия раскрывается в плашку «Шилтеме профилде», стрелка от
//    кончика пальца вверх; палец вниз (≈ 42.45–43.35 с) → световой след от
//    пальца к карточке «WhatsAppка жазыңыз» с номером BalaGo.
// 10: брендовая концовка на спокойном последнем кадре.
//
// Номер WhatsApp — подтверждённый номер BalaGo из проекта
// (FOUNDER_CONTACT в src/config.ts: 0998 08 38 28, wa.me/996998083828).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FOUNDER_CONTACT } from "../config";
import { F, FINGER_TRACK, GESTURE, LIVE_END, LIVE3_FRAMES, SPEECH, toOut, track, segmentAt } from "./edit";
import { ArrowUpIcon, BriefcaseIcon, CalendarIcon, CheckIcon, MeetingIcon, PinIcon, SchoolIcon, WhatsAppIcon } from "./icons";
import { easeIn, easeInOut, easeOut, enter, lerp, ramp, settle } from "./motion";
import { baseText, Card, extrude, MUTED, NAVY, NAVY_DEEP, OfficialLogo, SchemeArrow, TEXT_SHADOW, WA_GREEN, WHITE, YELLOW, YELLOW_SOFT } from "./ui";

export const PHONE = FOUNDER_CONTACT.phone;

const T_CAL = F(SPEECH.eger);
const T_BALAGO_ROW = F(SPEECH.ubaktysyna);
const T_CAL_OUT = F(40.8);
const T_UP = F(GESTURE.upRaise);
const T_UP_HOLD = F(GESTURE.upHold);
const T_UP_END = F(GESTURE.upEnd);
const T_DOWN = F(GESTURE.downStart);
const T_DOWN_END = F(GESTURE.downEnd);
const T_CTA_OUT = LIVE_END - 6;
const T_ENDCARD = LIVE_END - 8;

// ---------- 8. Календарь: 15:00 — BalaGo ----------
const ReturnCalendar: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < T_CAL - 2 || frame > T_CAL_OUT + 12) return null;
  const a = enter(frame, T_CAL);
  const out = ramp(frame, T_CAL_OUT, T_CAL_OUT + 10, easeIn);
  const stamp = enter(frame, T_BALAGO_ROW);
  const prog = 0.35 + Math.max(0, frame - T_CAL) / 200;
  const row = (children: React.ReactNode, key: string, extra?: React.CSSProperties) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, height: 66, marginTop: 8, padding: "0 16px", borderRadius: 18, background: "#EEF2F8", ...extra }}>
      {children}
    </div>
  );
  return (
    <Card
      radius={30}
      style={{
        left: 170,
        top: 212,
        width: 740,
        padding: "16px 18px 18px",
        boxSizing: "border-box",
        opacity: Math.min(1, a * 1.5) * (1 - out),
        transform: `perspective(1000px) rotateX(${(1 - a) * -60 + out * 70}deg) scale(${lerp(0.9, 1, a)})`,
        transformOrigin: "top center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CalendarIcon size={36} />
        <div style={{ ...baseText, fontSize: 30, color: NAVY }}>Бүгүн</div>
      </div>
      {row(
        <>
          <div style={{ ...baseText, fontSize: 26, color: MUTED, width: 80 }}>13:00</div>
          <MeetingIcon size={38} />
          <div style={{ ...baseText, fontSize: 29, color: NAVY_DEEP, flex: 1 }}>Жолугушуу</div>
          <CheckIcon size={38} color="#2F9E5B" />
        </>,
        "a",
      )}
      {row(
        <>
          <div style={{ ...baseText, fontSize: 26, color: MUTED, width: 80 }}>14:00</div>
          <BriefcaseIcon size={38} />
          <div style={{ ...baseText, fontSize: 29, color: NAVY_DEEP }}>Жумуш</div>
          <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#D6DDEA", overflow: "hidden", marginLeft: 8 }}>
            <div style={{ width: `${Math.min(0.95, prog) * 100}%`, height: "100%", background: NAVY, borderRadius: 5 }} />
          </div>
        </>,
        "b",
      )}
      {row(
        <>
          <div style={{ ...baseText, fontSize: 26, color: NAVY_DEEP, width: 80 }}>15:00</div>
          <SchoolIcon size={38} />
          <div style={{ ...baseText, fontSize: 29, color: NAVY_DEEP, flex: 1 }}>Мектеп → Үй</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px 4px 4px",
              borderRadius: 30,
              background: NAVY,
              opacity: Math.min(1, stamp * 1.5),
              transform: `scale(${lerp(1.6, 1, stamp)}) rotate(${(1 - stamp) * -12}deg)`,
            }}
          >
            <OfficialLogo size={44} />
            <div style={{ ...baseText, fontSize: 26, color: WHITE }}>BalaGo</div>
          </div>
        </>,
        "c",
        {
          background: `linear-gradient(90deg, ${YELLOW} 0%, ${YELLOW_SOFT} 100%)`,
          boxShadow: `0 0 ${24 * stamp}px rgba(255,201,14,0.7)`,
        },
      )}
    </Card>
  );
};

// ---------- 9a. Палец вверх → «Шилтеме профилде» ----------
const PILL = { left: 210, top: 248, w: 660, h: 108 };

const fingerOut = (frame: number) => {
  const { srcSec } = segmentAt(frame);
  const p = track(FINGER_TRACK, srcSec);
  return toOut(frame, p.x, p.y);
};

const ProfileCta: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < T_UP || frame > T_CTA_OUT + 8) return null;
  const line = ramp(frame, T_UP, T_UP + 7, easeOut); // световая линия раскрывается
  const morph = settle(frame, T_UP_HOLD, 12); // линия → плашка
  const text = enter(frame, T_UP_HOLD + 4);
  const out = 1 - ramp(frame, T_CTA_OUT, T_CTA_OUT + 8);
  const f = fingerOut(Math.min(frame, T_UP_END));
  const lineX0 = lerp(f.x, PILL.left, line);
  const lineX1 = lerp(f.x, PILL.left + PILL.w, line);
  const h = lerp(6, PILL.h, morph);
  // стрелка от пальца вверх — пока палец поднят
  const arrowVis = ramp(frame, T_UP_HOLD - 2, T_UP_HOLD + 4) * (1 - ramp(frame, T_UP_END, T_UP_END + 6));
  const tipY = f.y - 34;
  const topY = PILL.top + PILL.h + 14;
  const flow = (frame * 3) % 28;
  const bob = Math.sin(((frame - T_UP_HOLD) / 30) * Math.PI * 2 * 0.9) * 6;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {arrowVis > 0 && tipY > topY + 20 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: arrowVis }}>
          <line x1={f.x} y1={tipY} x2={f.x} y2={topY + 18} stroke={YELLOW} strokeWidth={6} strokeLinecap="round" strokeDasharray="14 14" strokeDashoffset={flow} style={{ filter: "drop-shadow(0 0 8px rgba(255,201,14,0.9))" }} />
          <path d={`M ${f.x - 22} ${topY + 30} L ${f.x} ${topY + 6} L ${f.x + 22} ${topY + 30}`} fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: lineX0,
          width: lineX1 - lineX0,
          top: PILL.top + (PILL.h - h) / 2,
          height: h,
          borderRadius: h / 2,
          background: morph < 0.5 ? YELLOW : `linear-gradient(180deg, #FFFFFF 0%, #F1F4FA 100%)`,
          boxShadow: morph < 0.5 ? "0 0 22px rgba(255,201,14,0.95)" : "0 22px 48px rgba(3,7,20,0.5), 0 0 0 4px rgba(255,201,14,0.85)",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 26px 0 14px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div style={{ width: 80, height: 80, borderRadius: 40, background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: text, transform: `translateY(${bob}px)` }}>
          <ArrowUpIcon size={50} color={NAVY} />
        </div>
        <div style={{ ...baseText, fontSize: 52, color: NAVY_DEEP, whiteSpace: "nowrap", opacity: text, transform: `translateY(${(1 - text) * 20}px)` }}>Шилтеме профилде</div>
      </div>
    </div>
  );
};

// ---------- 9b. Палец вниз → WhatsApp ----------
const WA = { left: 160, top: 1392, w: 760, h: 170 };

const WhatsAppCta: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < T_DOWN - 2 || frame > T_CTA_OUT + 8) return null;
  const f = fingerOut(Math.min(frame, T_DOWN_END));
  const trail = ramp(frame, T_DOWN, T_DOWN + 6, easeOut);
  const trailOut = 1 - ramp(frame, T_DOWN_END, T_DOWN_END + 8);
  const a = enter(frame, T_DOWN + 4);
  const out = 1 - ramp(frame, T_CTA_OUT, T_CTA_OUT + 8);
  const tipY = f.y + 30;
  const endY = WA.top - 10;
  const targetX = Math.min(WA.left + WA.w - 60, Math.max(WA.left + 60, f.x));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {endY > tipY ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: trailOut }}>
          <path
            d={`M ${f.x} ${tipY} Q ${f.x} ${(tipY + endY) / 2} ${targetX} ${endY}`}
            fill="none"
            stroke={YELLOW}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={400}
            strokeDashoffset={400 * (1 - trail)}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,201,14,0.95))" }}
          />
          <circle cx={targetX} cy={endY} r={8 * trail} fill={YELLOW} />
        </svg>
      ) : null}
      <Card
        radius={34}
        style={{
          left: WA.left,
          top: WA.top,
          width: WA.w,
          height: WA.h,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 30px",
          boxSizing: "border-box",
          borderLeft: `12px solid ${WA_GREEN}`,
          opacity: Math.min(1, a * 1.6),
          transform: `perspective(900px) rotateX(${(1 - a) * 55}deg) translateY(${(1 - a) * -24}px) scale(${lerp(0.85, 1, a)})`,
          transformOrigin: "top center",
        }}
      >
        <WhatsAppIcon size={104} />
        <div>
          <div style={{ ...baseText, fontSize: 42, color: NAVY_DEEP }}>WhatsAppка жазыңыз</div>
          <div style={{ ...baseText, fontSize: 56, color: NAVY, letterSpacing: 1.5, marginTop: 6 }}>{PHONE}</div>
        </div>
      </Card>
    </div>
  );
};

// ---------- 10. Брендовая концовка ----------
const EndCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < T_ENDCARD) return null;
  const bg = ramp(frame, T_ENDCARD, T_ENDCARD + 14, easeInOut);
  const item = (i: number) => enter(frame, T_ENDCARD + 4 + i * 3);
  const st = (i: number): React.CSSProperties => {
    const a = item(i);
    return { opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * 26}px) scale(${lerp(0.9, 1, a)})` };
  };
  // последние кадры мягко уходят в чёрный вместе со звуком
  const toBlack = ramp(frame, LIVE3_FRAMES - 10, LIVE3_FRAMES - 1, easeIn);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(20,40,90,${0.86 * bg}) 0%, rgba(6,12,32,${0.94 * bg}) 75%)` }} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={st(0)}>
          <OfficialLogo size={300} style={{ boxShadow: "0 26px 60px rgba(0,0,0,0.55), 0 0 0 6px rgba(255,201,14,0.9)" }} />
        </div>
        <div style={{ ...st(1), display: "flex", alignItems: "center", gap: 10 }}>
          <PinIcon size={48} />
          <div style={{ ...baseText, fontSize: 54, color: WHITE, textShadow: TEXT_SHADOW }}>Бишкек</div>
        </div>
        <div style={{ ...st(2), ...baseText, fontSize: 72, color: WHITE, textShadow: extrude(6, "#8C9AB8"), whiteSpace: "nowrap" }}>
          ҮЙ<SchemeArrow size={72} />МЕКТЕП<SchemeArrow size={72} />ҮЙ
        </div>
        <div style={{ ...st(3), padding: "24px 64px", borderRadius: 60, background: YELLOW, ...baseText, fontSize: 56, color: NAVY, boxShadow: "0 18px 40px rgba(0,0,0,0.45), 0 0 34px rgba(255,201,14,0.5)" }}>Баланы каттоо</div>
        <div style={{ ...st(4), display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          <ArrowUpIcon size={40} color={YELLOW} />
          <div style={{ ...baseText, fontSize: 40, color: WHITE }}>Шилтеме профилде</div>
        </div>
        <div style={{ ...st(5), display: "flex", alignItems: "center", gap: 16 }}>
          <WhatsAppIcon size={64} />
          <div style={{ ...baseText, fontSize: 52, color: WHITE, letterSpacing: 1.5 }}>{PHONE}</div>
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: toBlack }} />
    </AbsoluteFill>
  );
};

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <ReturnCalendar frame={frame} />
      <ProfileCta frame={frame} />
      <WhatsAppCta frame={frame} />
      <EndCard frame={frame} />
    </>
  );
};

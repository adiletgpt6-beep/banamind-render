// Финал, связанный с жестами рукой:
//  • на «BalaGo» — плашка с официальным логотипом;
//  • палец вверх («…профилдеги шилтемеге өтүңүз») — от кончика пальца
//    тянется тонкая жёлтая линия, и в направлении жеста раскрывается
//    карточка «Профилдеги шилтеме ↑»;
//  • палец вниз («же төмөнкү WhatsApp'ка») — верхняя карточка теряет
//    акцент, от пальца вниз уходит стрелка, снизу поднимается карточка
//    WhatsApp с номером 0998 08 38 28 и одним мягким акцентом.
// Всё остаётся поверх живого кадра до самого конца.
import { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fingerAt, GESTURE, outFrame, segmentAt, SPEECH, stageTop, toOut } from "./edit";
import { ArrowDownIcon, LinkIcon, WhatsAppIcon } from "./icons";
import { clamp, easeInOut, easeOut, enter, leave, ramp } from "./motion";
import { baseText, CARD_SHADOW, NAVY, OfficialLogo, WHITE, YELLOW } from "./ui";

// Номер WhatsApp — ровно в таком виде.
export const WHATSAPP_NUMBER = "0998 08 38 28";
const WA_GREEN = "#25D366";
const WA_GREEN_DARK = "#128C4A";

// Карточка «Профилдеги шилтеме» — в свободной колонке справа от головы
// (ствол дерева), над поднятым пальцем.
const UP_CARD = { left: 846, top: 462, width: 218 } as const;
// точка, куда «входит» линия от пальца (низ карточки)
const UP_ANCHOR = { x: 914, y: 676 } as const;
// низ карточки WhatsApp (выше интерфейса Instagram)
const WA_BOTTOM = 1920 - 1552;

const Wordmark: React.FC<{ readonly size: number }> = ({ size }) => (
  <div style={{ ...baseText, fontSize: size, color: NAVY, letterSpacing: 0, lineHeight: 1 }}>
    Bala<span style={{ color: YELLOW, WebkitTextStroke: `2px ${NAVY}` }}>Go</span>
  </div>
);

// кончик пальца в координатах готового кадра
const fingerOut = (frame: number) => {
  const { srcSec } = segmentAt(frame);
  const p = fingerAt(srcSec);
  return toOut(frame, p.x, p.y);
};

const BrandPill: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const from = outFrame(SPEECH.balaGo2) - 3;
  const to = outFrame(GESTURE.upStart) - 6;
  const top = useMemo(() => stageTop(from, to, 16), [from, to]);
  if (frame < from || frame > to + 8) return null;
  const a = enter(frame, from);
  // уходит вниз, пока поднимается рука, — не перекрывает жест
  const out = leave(frame, to, 7);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "10px 36px 10px 10px",
          borderRadius: 999,
          backgroundColor: WHITE,
          boxShadow: `${CARD_SHADOW}, 0 0 40px rgba(255,201,14,0.35)`,
          opacity: Math.min(1, a * 1.5) * out,
          transform: `translateY(${(1 - a) * 26 + (1 - out) * 40}px) scale(${0.88 + 0.12 * a})`,
        }}
      >
        <OfficialLogo size={96} />
        <Wordmark size={66} />
      </div>
    </div>
  );
};

const ProfileLink: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const f = useMemo(
    () => ({
      trail: outFrame(GESTURE.upStart) + 1,
      card: outFrame(GESTURE.upHold) - 1,
      retract: outFrame(GESTURE.upHold) + 4,
      calm: outFrame(GESTURE.downStart) - 2,
    }),
    [],
  );
  if (frame < f.trail) return null;

  // линия от пальца: прорисовка к карточке, затем втягивается в неё
  const draw = ramp(frame, f.trail, f.card + 1, easeOut);
  const retract = ramp(frame, f.retract, f.retract + 7, easeInOut);
  const tip = fingerOut(Math.min(frame, f.retract));
  const mid = { x: (tip.x + UP_ANCHOR.x) / 2 + 26, y: (tip.y + UP_ANCHOR.y) / 2 };
  const d = `M ${tip.x} ${tip.y} Q ${mid.x} ${mid.y} ${UP_ANCHOR.x} ${UP_ANCHOR.y}`;
  const len = Math.hypot(UP_ANCHOR.x - tip.x, UP_ANCHOR.y - tip.y) * 1.08;
  const shown = len * draw * (1 - retract);
  const dot = interpolate(frame, [f.trail, f.trail + 3, f.retract, f.retract + 6], [0, 1, 1, 0], clamp);

  const a = enter(frame, f.card);
  const glow = interpolate(frame, [f.card, f.card + 6, f.card + 26], [0, 1, 0.35], clamp);
  // после жеста вниз карточка остаётся, но уходит на второй план
  const calm = ramp(frame, f.calm, f.calm + 9);
  const arrowLift = interpolate(frame, [f.card + 4, f.card + 12, f.card + 22], [0, -9, 0], clamp);

  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        {shown > 1 ? (
          <path
            d={d}
            fill="none"
            stroke={YELLOW}
            strokeWidth={6}
            strokeLinecap="round"
            // рисуем «от карточки к пальцу» — при втягивании линия
            // короче со стороны пальца
            strokeDasharray={`${shown} ${len * 2}`}
            strokeDashoffset={-(len - shown) * (retract > 0 ? 1 : 0)}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,201,14,0.8))" }}
          />
        ) : null}
        {dot > 0 ? (
          <circle cx={tip.x} cy={tip.y} r={9 * dot} fill={YELLOW} style={{ filter: "drop-shadow(0 0 8px rgba(255,201,14,0.9))" }} />
        ) : null}
      </svg>
      {frame >= f.card ? (
        <div
          style={{
            position: "absolute",
            left: UP_CARD.left,
            top: UP_CARD.top,
            width: UP_CARD.width,
            padding: "16px 14px 18px",
            boxSizing: "border-box",
            borderRadius: 30,
            backgroundColor: WHITE,
            boxShadow: `${CARD_SHADOW}, 0 0 ${48 * glow}px rgba(255,201,14,${0.75 * glow})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: Math.min(1, a * 1.6) * (1 - 0.2 * calm),
            transform: `translateY(${(1 - a) * 40}px) scale(${(0.6 + 0.4 * a) * (1 - 0.1 * calm)})`,
            transformOrigin: "30% 100%",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: YELLOW,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
              transform: `translateY(${arrowLift}px)`,
            }}
          >
            <ArrowDownIcon size={34} color={NAVY} style={{ transform: "rotate(180deg)" }} />
          </div>
          <div style={{ ...baseText, fontSize: 21, fontWeight: 800, color: "#3A4F80" }}>Толук маалымат</div>
          <div style={{ ...baseText, fontSize: 30, color: NAVY }}>Профилдеги</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LinkIcon size={28} />
            <div
              style={{
                ...baseText,
                fontSize: 34,
                color: NAVY,
                backgroundImage: `linear-gradient(${YELLOW}, ${YELLOW})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0 92%",
                backgroundSize: `${100 * ramp(frame, f.card + 5, f.card + 15, easeOut)}% 9px`,
              }}
            >
              шилтеме
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

const WhatsAppCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const f = useMemo(
    () => ({
      arrow: outFrame(GESTURE.downStart),
      card: outFrame(GESTURE.downStart) + 6,
      pulse: outFrame(GESTURE.downStart) + 16,
    }),
    [],
  );
  if (frame < f.arrow) return null;

  // стрелка продолжает движение пальца вниз и «приводит» карточку
  const start = fingerOut(f.arrow + 2);
  const end = { x: 590, y: 1352 };
  const p = ramp(frame, f.arrow, f.card + 2, easeInOut);
  const arrowOpacity = interpolate(frame, [f.arrow, f.arrow + 3, f.card + 1, f.card + 5], [0, 1, 1, 0], clamp);
  const ax = start.x + (end.x - start.x) * p;
  const ay = start.y + 30 + (end.y - start.y - 30) * p;

  const a = enter(frame, f.card);
  // один мягкий акцент на номере
  const pulse = interpolate(frame, [f.pulse, f.pulse + 6, f.pulse + 16], [0, 1, 0], clamp);
  const ring = interpolate(frame, [f.pulse, f.pulse + 18], [0, 1], { ...clamp, easing: easeOut });

  return (
    <>
      {arrowOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: ax - 31,
            top: ay - 31,
            width: 62,
            height: 62,
            borderRadius: "50%",
            backgroundColor: YELLOW,
            boxShadow: "0 0 18px rgba(255,201,14,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: arrowOpacity,
          }}
        >
          <ArrowDownIcon size={38} color={NAVY} />
        </div>
      ) : null}
      {frame >= f.card ? (
        <div style={{ position: "absolute", bottom: WA_BOTTOM, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "16px 40px 16px 18px",
              borderRadius: 40,
              backgroundColor: WHITE,
              boxShadow: CARD_SHADOW,
              opacity: Math.min(1, a * 1.6),
              transform: `translateY(${(1 - a) * 70}px) scale(${0.9 + 0.1 * a})`,
            }}
          >
            <OfficialLogo size={128} style={{ boxShadow: `0 0 0 4px ${YELLOW}` }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Wordmark size={46} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <WhatsAppIcon size={40} color={WA_GREEN} />
                <div style={{ ...baseText, fontSize: 30, color: WA_GREEN_DARK }}>WhatsApp</div>
              </div>
              <div style={{ position: "relative", alignSelf: "flex-start" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px -12px",
                    borderRadius: 14,
                    border: `3px solid rgba(37,211,102,${0.9 * (1 - ring)})`,
                    transform: `scale(${1 + 0.12 * ring})`,
                    opacity: ring > 0 ? 1 : 0,
                  }}
                />
                <div
                  style={{
                    ...baseText,
                    fontSize: 56,
                    color: NAVY,
                    letterSpacing: 1,
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                    transform: `scale(${1 + 0.06 * pulse})`,
                    transformOrigin: "0% 50%",
                  }}
                >
                  {WHATSAPP_NUMBER}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <BrandPill frame={frame} />
      <ProfileLink frame={frame} />
      <WhatsAppCard frame={frame} />
    </>
  );
};

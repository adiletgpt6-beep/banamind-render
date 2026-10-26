// Хук и обращение: геометка «БИШКЕК» + «ЖАҢЫ КЫЗМАТ», знак вопроса
// у головы на «Кызыкпы?», плашка «АТА-ЭНЕЛЕР ҮЧҮН».
import { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { faceRightOut, outFrame, SPEECH, stageTop } from "./edit";
import { FamilyIcon, PinIcon } from "./icons";
import { clamp, easeOut, enter, leave, ramp } from "./motion";
import { baseText, CARD_SHADOW, NAVY, TEXT_SHADOW, WHITE, YELLOW } from "./ui";

export const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const f = useMemo(
    () => ({
      pin: outFrame(SPEECH.bishkek) - 2,
      jany: outFrame(SPEECH.jany) - 1,
      kyzmat: outFrame(SPEECH.jany) + 4,
      line: outFrame(SPEECH.paidaBoldu),
      out: outFrame(SPEECH.hookEnd) + 3,
    }),
    [],
  );
  const top = useMemo(() => stageTop(f.pin, f.out + 8, 18), [f]);
  if (frame < f.pin || frame > f.out + 10) return null;

  const exit = leave(frame, f.out, 9);
  const pin = enter(frame, f.pin);
  const pinDrop = enter(frame, f.pin + 2);
  const jany = enter(frame, f.jany);
  const kyz = enter(frame, f.kyzmat);
  const line = ramp(frame, f.line, f.line + 10, easeOut);
  const pulse = interpolate((frame - f.pin) % 36, [0, 36], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: exit,
        transform: `translateY(${(1 - exit) * 40}px)`,
      }}
    >
      {/* геометка */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 34px 12px 18px",
          borderRadius: 999,
          backgroundColor: WHITE,
          boxShadow: CARD_SHADOW,
          opacity: Math.min(1, pin * 1.5),
          transform: `translateY(${(1 - pin) * 26}px) scale(${0.9 + 0.1 * pin})`,
        }}
      >
        <div style={{ position: "relative", width: 62, height: 62 }}>
          <div
            style={{
              position: "absolute",
              left: 31 - 26 * (0.4 + pulse),
              top: 52 - 9 * (0.4 + pulse),
              width: 52 * (0.4 + pulse),
              height: 18 * (0.4 + pulse),
              borderRadius: "50%",
              border: `3px solid ${YELLOW}`,
              opacity: 1 - pulse,
            }}
          />
          <PinIcon size={62} style={{ transform: `translateY(${(1 - pinDrop) * -34}px)` }} />
        </div>
        <div style={{ ...baseText, fontSize: 50, color: NAVY, letterSpacing: 4 }}>БИШКЕК</div>
      </div>

      {/* ЖАҢЫ КЫЗМАТ */}
      <div style={{ display: "flex", gap: 28, alignItems: "baseline" }}>
        <div
          style={{
            ...baseText,
            fontSize: 108,
            color: YELLOW,
            textShadow: TEXT_SHADOW,
            opacity: Math.min(1, jany * 1.6),
            transform: `translateY(${(1 - jany) * 34}px) scale(${0.82 + 0.18 * jany})`,
          }}
        >
          ЖАҢЫ
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              ...baseText,
              fontSize: 108,
              color: WHITE,
              textShadow: TEXT_SHADOW,
              opacity: Math.min(1, kyz * 1.6),
              transform: `translateY(${(1 - kyz) * 34}px) scale(${0.82 + 0.18 * kyz})`,
            }}
          >
            КЫЗМАТ
          </div>
          <div
            style={{
              position: "absolute",
              left: 4,
              bottom: -10,
              height: 10,
              width: `${line * 100}%`,
              borderRadius: 6,
              backgroundColor: YELLOW,
              boxShadow: "0 0 18px rgba(255,201,14,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// «?» сбоку от головы на «Кызыкпы?».
export const CuriousBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const from = outFrame(SPEECH.kyzykpy) - 1;
  const to = outFrame(SPEECH.bulVideonu) + 6;
  const x = useMemo(() => {
    let r = 0;
    for (let i = from; i <= to; i++) r = Math.max(r, faceRightOut(i));
    return Math.min(1080 - 168, r + 18);
  }, [from, to]);
  if (frame < from || frame > to + 8) return null;
  const a = enter(frame, from);
  const exit = leave(frame, to, 7);
  const tilt = interpolate(frame - from, [0, 8, 16, 24], [-14, 6, -3, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 330,
        width: 132,
        height: 132,
        borderRadius: "50%",
        backgroundColor: YELLOW,
        boxShadow: CARD_SHADOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(1, a * 1.5) * exit,
        transform: `scale(${(0.5 + 0.5 * a) * (0.85 + 0.15 * exit)}) rotate(${tilt}deg)`,
      }}
    >
      <div style={{ ...baseText, fontSize: 98, color: NAVY, lineHeight: 1, marginTop: -6 }}>?</div>
    </div>
  );
};

export const ParentsTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const from = outFrame(SPEECH.urmattuu) - 2;
  const to = outFrame(SPEECH.balanyzdy) - 3;
  const top = useMemo(() => stageTop(from, to + 8, 30), [from, to]);
  if (frame < from || frame > to + 8) return null;
  const a = enter(frame, from);
  const exit = leave(frame, to, 6);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "16px 36px 16px 22px",
          borderRadius: 999,
          backgroundColor: WHITE,
          boxShadow: CARD_SHADOW,
          opacity: Math.min(1, a * 1.5) * exit,
          transform: `translateY(${(1 - a) * 30 + (1 - exit) * 20}px) scale(${0.92 + 0.08 * a})`,
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            backgroundColor: "#FFF4C2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FamilyIcon size={58} />
        </div>
        <div style={{ ...baseText, fontSize: 52, color: NAVY, letterSpacing: 1.5 }}>АТА-ЭНЕЛЕР ҮЧҮН</div>
      </div>
    </div>
  );
};

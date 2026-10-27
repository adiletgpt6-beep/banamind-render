// Сцена 6: календарь переворачивается и складывается в фирменную карточку.
// Одновременно и неподвижно до конца ролика: «Бишкек • Балдар үчүн такси»,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и номер
// 0998 08 38 28. Слоган — со словами диктора. Кадр держится ≥ 3 с после
// последнего слова (проверяется в тестах по шкале).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { cueOf, FPS, useScene } from "../context";
import { PAL } from "../Kitchen";
import { BG016_CTA } from "../script";
import { CTA_REVEAL, wordTime } from "../timeline";
import { clamp, easeInOut, easeOut } from "../../../two-schedules-2d/rig/motion";
import { CarSide } from "./Search";

const WaIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={22} fill="#25D366" />
    <path d="M14 35 L16 28 Q13 23 15 18 Q19 10 28 11 Q37 13 38 22 Q38 31 29 35 Q23 37 18 34 Z" fill="#FFFFFF" />
    <path d="M20 18 Q19 22 23 27 Q27 31 31 30 L32 27 L28 25 L26 27 Q22 25 21 21 L23 19 L21 16 Z" fill="#25D366" />
  </svg>
);

const LinkIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={22} fill={PAL.navy} />
    <path d="M20 28 L28 20 M18 22 L15 25 Q11 29 15 33 Q19 37 23 33 L26 30 M30 26 L33 23 Q37 19 33 15 Q29 11 25 15 L22 18" stroke="#FFFFFF" strokeWidth={3.6} fill="none" strokeLinecap="round" />
  </svg>
);

export const CtaScene: React.FC = () => {
  const { f, tl, at } = useScene("cta");
  const n06 = cueOf(tl, "n06");
  const n07 = cueOf(tl, "n07");
  const reveal = Math.round(CTA_REVEAL * FPS);
  // переворот: календарь 0–10, карточка 10–20 (полностью видна к reveal)
  const flipA = easeInOut(f / 10);
  const flipB = easeOut((f - 10) / 10);
  const showCard = f >= 10;
  const profileAt = at(n06.from);
  const waAt = at(wordTime(n06, 5));
  const sloganAt = at(n07.from) - 4;
  const pulse = (from: number) => {
    const x = (f - from) / 16;
    return x > 0 && x < 1 ? Math.sin(x * Math.PI) * 0.05 : 0;
  };
  const carX = -200 + ((f * 6) % 1500);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF6D6 0%, #FFFFFF 55%, #EAF3FF 100%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={120} cy={300} r={140} fill={PAL.yellow} opacity={0.18} />
        <circle cx={980} cy={1350} r={180} fill="#9FD3F7" opacity={0.2} />
      </svg>
      {!showCard ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 360,
            width: 840,
            height: 900,
            borderRadius: 44,
            background: "#FFFFFF",
            boxShadow: "0 24px 60px rgba(30,47,92,0.18)",
            transform: `scaleX(${1 - flipA})`,
            fontFamily,
            fontWeight: 900,
            fontSize: 48,
            color: PAL.navy,
            padding: 40,
          }}
        >
          Үй-бүлө календары
          <div style={{ marginTop: 30, height: 74, borderRadius: 20, background: "#FFF6D6", border: `4px dashed ${PAL.yellow}`, fontSize: 36, lineHeight: "66px", paddingLeft: 24 }}>+ Каттамды пландоо</div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 300,
            width: 940,
            borderRadius: 48,
            background: "#FFFFFF",
            boxShadow: "0 28px 70px rgba(30,47,92,0.2)",
            transform: `scaleX(${flipB})`,
            padding: "36px 40px 44px",
            fontFamily,
            color: PAL.navy,
            textAlign: "center",
          }}
        >
          <Img src={staticFile("assets/logo.png")} style={{ width: 300, height: 300, margin: "0 auto", display: "block" }} />
          <div style={{ marginTop: 16, fontSize: 60, fontWeight: 900 }}>{BG016_CTA.city}</div>
          <div style={{ marginTop: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 48, fontWeight: 900, transform: `scale(${1 + pulse(profileAt)})` }}>
            <LinkIcon size={62} />
            {BG016_CTA.profile}
          </div>
          <div style={{ marginTop: 18, fontSize: 44, fontWeight: 800, color: "#3B4A70" }}>{BG016_CTA.or}</div>
          <div
            style={{
              margin: "26px auto 0",
              display: "inline-flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 40px",
              borderRadius: 999,
              background: PAL.yellow,
              boxShadow: "0 10px 26px rgba(242,165,65,0.35)",
              transform: `scale(${1 + pulse(waAt) * 1.2})`,
            }}
          >
            <WaIcon size={84} />
            <div style={{ textAlign: "left", lineHeight: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 900 }}>WhatsApp:</div>
              <div style={{ fontSize: 92, fontWeight: 1000, letterSpacing: 1 }}>{BG016_CTA.phone}</div>
            </div>
          </div>
          <div style={{ marginTop: 30, height: 64, fontSize: 50, fontWeight: 900, color: "#E08A00", opacity: clamp((f - sloganAt) / 10), transform: `translateY(${(1 - easeOut((f - sloganAt) / 12)) * 20}px)` }}>
            {BG016_CTA.slogan}
          </div>
        </div>
      )}
      {/* белая машина проезжает под карточкой (декор) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: f > reveal ? 1 : 0 }}>
        <rect x={0} y={1400} width={1080} height={8} rx={4} fill="#DDE3EA" />
        <CarSide x={carX} y={1376} s={0.9} />
      </svg>
    </AbsoluteFill>
  );
};

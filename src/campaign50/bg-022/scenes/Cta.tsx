// Сцена 6 (≈57 с – конец): жёлтая петля (одна поездка) сворачивается в
// кольцо вокруг логотипа BalaGo. Затем неподвижный финальный экран:
// «Бишкек • Балдар үчүн такси», «1 сапар = ҮЙ → МЕКТЕП → ҮЙ»,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно
// «WhatsApp: 0998 08 38 28». Оба способа связи и номер видны одновременно
// с BG22_CONTACTS_IN до последнего кадра (≥ 5 с), после последнего слова
// экран держится ≥ 3 с. Всё в безопасной зоне Reels: сверху ≥ 250 px,
// снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  clamp,
  easeInOut,
  easeOut,
} from "../../../two-schedules-2d/rig/motion";
import { C } from "../palette";
import { BG22_CONTACTS_IN, BG22_TEXT, BG22_VIDEO } from "../script";
import { Txt } from "../ui";

const LOGO = { x: 540, y: 410, r: 130 };

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG22_TEXT.cta;
  const contactAt = Math.round(BG22_CONTACTS_IN * BG22_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({
    opacity: a(at),
    translate: `0 ${(1 - a(at)) * 22}px`,
  });
  // большая «1» из прошлой сцены сжимается в кольцо логотипа
  const shrink = easeInOut(f / 16);
  const ring = clamp((f - 6) / 14);
  const logo = easeOut((f - 12) / 10);
  const circ = 2 * Math.PI * (LOGO.r + 14);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        fontFamily,
        color: C.navy,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -220,
          top: -240,
          width: 760,
          height: 760,
          borderRadius: 380,
          backgroundColor: C.yellowSoft,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -200,
          bottom: -180,
          width: 620,
          height: 620,
          borderRadius: 310,
          backgroundColor: C.sky,
        }}
      />
      {shrink < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 470 - 400 * shrink,
            textAlign: "center",
            fontSize: 600 * (1 - 0.8 * shrink),
            fontWeight: 1000,
            lineHeight: 1,
            color: C.yellow,
            WebkitTextStroke: `${14 * (1 - shrink)}px ${C.navy}`,
            paintOrder: "stroke fill",
            opacity: 1 - shrink,
          }}
        >
          1
        </div>
      ) : null}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <circle
          cx={LOGO.x}
          cy={LOGO.y}
          r={LOGO.r + 14}
          fill="none"
          stroke={C.yellow}
          strokeWidth={16}
          strokeDasharray={`${circ * ring} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${LOGO.x} ${LOGO.y})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: LOGO.x - LOGO.r,
          top: LOGO.y - LOGO.r,
          width: LOGO.r * 2,
          height: LOGO.r * 2,
          opacity: logo,
          transform: `scale(${0.6 + 0.4 * logo})`,
        }}
      >
        <Img
          src={staticFile(BG22_VIDEO.logo)}
          style={{
            width: LOGO.r * 2,
            height: LOGO.r * 2,
            borderRadius: LOGO.r,
            objectFit: "cover",
            boxShadow: "0 24px 50px rgba(20,40,90,0.18)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 150,
          top: 572,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...item(14),
            fontSize: 104,
            fontWeight: 1000,
            lineHeight: 1,
          }}
        >
          {t.brand}
        </div>
        <div
          style={{
            ...item(18),
            padding: "12px 34px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 46,
            fontWeight: 900,
          }}
        >
          {t.city}
        </div>
        <div
          style={{
            ...item(20),
            padding: "8px 28px",
            borderRadius: 999,
            backgroundColor: C.yellow,
            fontSize: 38,
            fontWeight: 900,
          }}
        >
          <Txt>{t.route}</Txt>
        </div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div
          style={{
            opacity: a(contactAt, 8),
            marginTop: 12,
            width: "100%",
            padding: "26px 20px",
            borderRadius: 32,
            border: "4px solid #DCE3EE",
            backgroundColor: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 46,
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path
                d="M10 14 a4 4 0 0 0 5.6 0 l3-3 a4 4 0 0 0 -5.6 -5.6 l-1 1 M14 10 a4 4 0 0 0 -5.6 0 l-3 3 a4 4 0 0 0 5.6 5.6 l1 -1"
                fill="none"
                stroke={C.navy}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </svg>
            {t.link}
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#3A4F80",
              lineHeight: 1.1,
            }}
          >
            {t.or}
          </div>
          <div
            style={{
              marginTop: 8,
              width: "100%",
              padding: "16px 0 18px",
              borderRadius: 24,
              backgroundColor: C.greenSoft,
              border: "3px solid #BFE3CB",
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>
              {t.whatsappLabel}
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 1000,
                letterSpacing: 1,
                lineHeight: 1.05,
                color: C.navy,
              }}
            >
              {t.whatsappNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

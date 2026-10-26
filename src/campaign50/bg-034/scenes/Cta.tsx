// Сцена 6 (≈58 с – конец): билет из стопки разворачивается в финальную
// карточку. Финальный экран: логотип BalaGo, «Бишкек • Балдар
// үчүн такси», «10 толук сапар • ҮЙ → МЕКТЕП → ҮЙ», «Профилдеги шилтемеге
// өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28».
// Город, оба способа связи и номер видны одновременно с BG34_CONTACTS_IN
// до последнего кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Всё в безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
// Надписи и номер стоят на месте; живым кадр делают только нетекстовые
// детали: плавающий логотип, медленный дрейф фоновых пятен, мягкая
// подсветка строки «профиль» и рамки WhatsApp на соответствующих словах.
import { Img, staticFile, useCurrentFrame } from "remotion";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { useWordAt } from "../context";
import { C } from "../palette";
import { BG34_CONTACTS_IN, BG34_TEXT, BG34_VIDEO } from "../script";
import { TICKET_RATIO, TicketBody, Txt } from "../ui";

const LOGO = { x: 495, y: 448, r: 140 };
const CARD = { left: 60, width: 870, top: 262, bottom: 1352 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG34_TEXT.cta;
  const contactAt = Math.round(BG34_CONTACTS_IN * BG34_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({
    opacity: a(at),
    translate: `0 ${(1 - a(at)) * 20}px`,
  });

  // билет из сцены 5 (центр 495, 760, ширина 480) разворачивается в карточку
  const morph = easeInOut(f / 16);
  const tw = 480;
  const ticketOp = 1 - clamp((f - 6) / 10);

  // мягкие акценты на словах диктора (без движения текста)
  const linkAt = useWordAt("n11", 3); // «профилдеги»
  const waAt = useWordAt("n11", 8); // «номерге»
  const pulse = (at: number, d = 26) => {
    const u = (f - at) / d;
    return u < 0 || u > 1 ? 0 : Math.sin(Math.PI * u);
  };
  const linkGlow = pulse(linkAt - 2, 34);
  const waGlow = pulse(waAt - 2, 34);
  const floatY = 6 * Math.sin(f / 22);
  const drift = (k: number) => 18 * Math.sin(f / 70 + k);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        fontFamily,
        color: C.navy,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -240 + drift(0),
          top: -260 + drift(1.3),
          width: 780,
          height: 780,
          borderRadius: 390,
          backgroundColor: C.yellowSoft,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -220 + drift(2.1),
          bottom: -200 + drift(3.4),
          width: 660,
          height: 660,
          borderRadius: 330,
          backgroundColor: C.sky,
        }}
      />

      {/* карточка (бывший билет): белая с жёлтой кромкой */}
      <div
        style={{
          position: "absolute",
          left: lerp(495 - tw / 2, CARD.left, morph),
          top: lerp(760 - (tw * TICKET_RATIO) / 2, CARD.top, morph),
          width: lerp(tw, CARD.width, morph),
          height: lerp(tw * TICKET_RATIO, CARD.bottom - CARD.top, morph),
          borderRadius: lerp(14, 44, morph),
          backgroundColor: "#FFFFFF",
          border: `6px solid ${C.yellow}`,
          boxShadow: "0 24px 60px rgba(20,40,90,0.14)",
          boxSizing: "border-box",
        }}
      />
      {ticketOp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 495 - tw / 2,
            top: 760 - (tw * TICKET_RATIO) / 2,
            width: tw,
            height: tw * TICKET_RATIO,
            opacity: ticketOp,
            transform: `scale(${1 + 0.3 * morph})`,
          }}
        >
          <TicketBody w={tw} glow={1} />
        </div>
      ) : null}

      {/* логотип */}
      <div
        style={{
          position: "absolute",
          left: LOGO.x - LOGO.r,
          top: LOGO.y - LOGO.r,
          width: LOGO.r * 2,
          height: LOGO.r * 2,
          opacity: a(10),
          transform: `translateY(${floatY * a(30, 20)}px) scale(${0.6 + 0.4 * a(10)})`,
        }}
      >
        <Img
          src={staticFile(BG34_VIDEO.logo)}
          style={{
            width: LOGO.r * 2,
            height: LOGO.r * 2,
            borderRadius: LOGO.r,
            objectFit: "cover",
            boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: CARD.left + 30,
          width: CARD.width - 60,
          top: 616,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          textAlign: "center",
        }}
      >
        {/* город — вместе с контактами всё время показа */}
        <div
          style={{
            ...item(contactAt - 8),
            padding: "12px 34px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 48,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {t.city}
        </div>
        <div
          style={{
            ...item(contactAt - 4),
            padding: "8px 28px",
            borderRadius: 999,
            backgroundColor: C.yellow,
            fontSize: 36,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          <Txt>{t.pack}</Txt>
        </div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div
          style={{
            opacity: a(contactAt, 8),
            marginTop: 10,
            width: "100%",
            padding: "28px 16px 26px",
            borderRadius: 32,
            border: "4px solid #DCE3EE",
            backgroundColor: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "4px 14px",
              borderRadius: 16,
              backgroundColor: `rgba(255,201,14,${0.35 * linkGlow})`,
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            <svg width={42} height={42} viewBox="0 0 24 24">
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
              fontSize: 40,
              fontWeight: 800,
              color: "#3A4F80",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            {t.or}
          </div>
          <div
            style={{
              marginTop: 8,
              width: "100%",
              padding: "16px 0 20px",
              borderRadius: 24,
              backgroundColor: C.greenSoft,
              border: "3px solid #BFE3CB",
              boxShadow: `0 0 0 ${8 * waGlow}px rgba(46,139,87,${0.25 * waGlow})`,
            }}
          >
            <div style={{ fontSize: 46, fontWeight: 900, color: "#1F7A45" }}>
              {t.whatsappLabel}
            </div>
            <div
              style={{
                fontSize: 104,
                fontWeight: 1000,
                letterSpacing: 1,
                lineHeight: 1.05,
                color: C.navy,
                whiteSpace: "nowrap",
              }}
            >
              {t.whatsappNumber}
            </div>
          </div>
        </div>
        <div
          style={{
            ...item(contactAt + 10),
            marginTop: 18,
            fontSize: 40,
            fontWeight: 1000,
            color: C.navy,
            whiteSpace: "nowrap",
          }}
        >
          {t.slogan}
        </div>
      </div>
    </div>
  );
};

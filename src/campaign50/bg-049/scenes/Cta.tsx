// Сцена 6 (финал): горизонт стягивается в жёлтое подчёркивание слова
// «BalaGo» и застывает (слой YellowLine). Неподвижная карточка: «Бишкек •
// Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба способа связи и номер
// видны одновременно с BG49_CONTACTS_IN до последнего кадра (≥ 5 с), после
// последнего слова экран держится ≥ 3 с. Безопасная зона Reels: сверху
// ≥ 250 px, справа ≥ 150 px, снизу ≥ 400 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, easeBack, clamp, span } from "../anim";
import { useScene, useTimeline } from "../context";
import { WORDMARK_Y } from "../layout";
import { C } from "../palette";
import { LinkIcon, ProfileIcon, WhatsAppIcon } from "../parts/ui";
import { BG49_CONTACTS_IN, BG49_TEXT, BG49_VIDEO } from "../script";
import { cueOf, wordTime } from "../timing";

// Подсветка синхронно со словами диктора: город — на «Бишкектеги…», строка
// профиля — на «профилдеги шилтемеге өтүңүз», блок WhatsApp — на «экрандагы
// номерге WhatsApp аркылуу жазыңыз». Сам номер не двигается; после
// последнего слова подсветки гаснут и экран полностью неподвижен.
const useEmphasis = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const tl = useTimeline();
  const fps = BG49_VIDEO.fps;
  const lf = (sec: number) => Math.round(sec * fps) - from;
  const n05 = cueOf(tl, "n05");
  const n06 = cueOf(tl, "n06");
  const n07 = cueOf(tl, "n07");
  return {
    city: span(f, lf(n05.from) - 2, lf(n05.to) + 4, 8),
    profile: span(
      f,
      lf(wordTime(tl, "n06", 5)) - 3,
      lf(wordTime(tl, "n06", 8)),
      7,
    ),
    whatsapp: span(f, lf(wordTime(tl, "n06", 9)) - 3, lf(n06.to) + 6, 7),
    go: span(f, lf(n07.from) - 2, lf(n07.to), 6),
  };
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG49_TEXT.cta;
  const em = useEmphasis();
  const contactAt = Math.round(BG49_CONTACTS_IN * BG49_VIDEO.fps);
  const logo = easeBack(clamp((f - 4) / 16));
  const word = appear(f, 8, 12);
  // контакты появляются один раз и дальше неподвижны до конца ролика
  const c = appear(f, contactAt - 8, 8);
  const item = (d: number): React.CSSProperties => ({
    opacity: appear(f, contactAt - 8 + d, 8),
    transform: `translateY(${(1 - appear(f, contactAt - 8 + d, 8)) * 16}px)`,
  });
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
          left: -240,
          top: -260,
          width: 760,
          height: 760,
          borderRadius: 380,
          backgroundColor: C.yellowSoft,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -220,
          bottom: -200,
          width: 660,
          height: 660,
          borderRadius: 330,
          backgroundColor: C.sky,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 104,
          top: 262,
          width: 208,
          height: 208,
          transform: `scale(${(0.5 + 0.5 * logo) * (1 + 0.05 * em.go)})`,
          opacity: clamp(logo * 1.5),
        }}
      >
        <Img
          src={staticFile(BG49_VIDEO.logo)}
          style={{
            width: 208,
            height: 208,
            borderRadius: 104,
            objectFit: "cover",
            boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: WORDMARK_Y - 116,
          textAlign: "center",
          fontSize: 128,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1,
          opacity: word,
          transform: `translateY(${(1 - word) * 20}px)`,
        }}
      >
        {t.brand}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 690,
          display: "flex",
          justifyContent: "center",
          ...item(0),
        }}
      >
        <div
          style={{
            padding: "12px 34px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 46,
            fontWeight: 900,
            whiteSpace: "nowrap",
            boxShadow: `0 0 0 ${7 * em.city}px rgba(255,201,14,${0.85 * em.city})`,
          }}
        >
          {t.city}
        </div>
      </div>
      {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          top: 800,
          padding: "26px 24px 24px",
          borderRadius: 36,
          border: "4px solid #DCE3EE",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 18px 44px rgba(20,40,90,0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: c,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 41,
            fontWeight: 900,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: `rgba(255,244,194,${em.profile})`,
            ...item(2),
          }}
        >
          <ProfileIcon size={58} />
          {t.link}
          <LinkIcon size={44} />
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#3A4F80",
            lineHeight: 1.1,
            ...item(4),
          }}
        >
          {t.or}
        </div>
        <div
          style={{
            marginTop: 8,
            width: "100%",
            padding: "14px 0 18px",
            borderRadius: 28,
            backgroundColor: "#E8F6EC",
            border: "3px solid #BFE3CB",
            boxShadow: `0 0 0 ${6 * em.whatsapp}px rgba(31,168,85,${0.55 * em.whatsapp})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...item(6),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 44,
              fontWeight: 900,
              color: "#1F7A45",
            }}
          >
            <WhatsAppIcon size={54} />
            {t.whatsappLabel}
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: 1,
              lineHeight: 1.05,
              color: C.navy,
              whiteSpace: "nowrap",
            }}
          >
            {t.whatsappNumber}
          </div>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 32,
            fontWeight: 800,
            color: C.muted,
            ...item(8),
          }}
        >
          {t.early}
        </div>
      </div>
    </div>
  );
};

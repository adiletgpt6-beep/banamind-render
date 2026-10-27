// Сцена 6 «cta» — финал. Кадр 0 совпадает с последним кадром «start»
// (мама, телефон с отправленным сообщением). Телефон выходит к центру и
// поворачивается к зрителю (переворот), обратная сторона раскрывается в
// белую финальную карточку на весь кадр:
//   логотип BalaGo, крупно «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП → ҮЙ,
//   1) «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз»,
//   2) «WhatsApp: 0998 08 38 28» — полный номер крупно.
// Все надписи появляются к ≈1,5 с сцены и дальше стоят неподвижно до
// конца ролика (≥ 5 с вместе, ≥ 3 с после последнего слова) — в безопасной
// зоне: x 66…960, y 320…1260 (выше нижнего интерфейса Reels, левее кнопок).
// Плашки «Шарттуу мисал» здесь нет: финальная карточка — не условный пример.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { ArrowText, box, easeInOut, easeOut, LinkIcon, mix, NAVY, NAVY_SOFT, prog, WA_GREEN, WhatsAppIcon, YELLOW, YELLOW_SOFT } from "../art";
import { local, type SceneProps } from "../kit";
import { BG41_TEXT } from "../script";
import type { HudState } from "../tape";
import type { Bg41Timeline } from "../timing";
import { PHONE, PhoneScreen, SCREEN_INSET } from "./phone";
import { phoneStateAt, StartStage, startKeys } from "./Start";

const T = BG41_TEXT.cta;

export const CTA_KEYS = { flip: [2, 24] as const, bgOut: [10, 24] as const, content: [24, 48] as const } as const;

// Пока за переворачивающимся телефоном ещё видна сцена с мамой (условный
// пример), плашка «Шарттуу мисал» и пульт остаются и гаснут вместе с ней.
export const ctaHud = (tl: Bg41Timeline, f: number): HudState | null =>
  tl && f < CTA_KEYS.bgOut[1] ? { mode: "play", pos: 1, lit: 1, opacity: 1 - easeInOut(prog(f, CTA_KEYS.bgOut[0], CTA_KEYS.bgOut[1] - CTA_KEYS.bgOut[0])) } : null;

const Card: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = (i: number) => {
    const u = easeOut(prog(f, CTA_KEYS.content[0] + i * 3, 10));
    return { opacity: Math.min(1, u * 1.4), transform: `translateY(${(1 - u) * 22}px)` };
  };
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden", fontFamily })}>
      {/* мягкие пятна фона — неподвижны */}
      <div style={box({ left: -240, top: -220, width: 660, height: 660, borderRadius: 330, backgroundColor: YELLOW_SOFT })} />
      <div style={box({ right: -280, bottom: -160, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF1FB" })} />
      <div style={box({ left: 66, right: 120, top: 318, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" })}>
        <div style={{ ...a(0), display: "flex", alignItems: "center", gap: 22 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 160, height: 160, borderRadius: 80, boxShadow: "0 12px 30px rgba(20,40,90,0.18)" }} />
          <div style={{ fontSize: 108, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{T.brand}</div>
        </div>
        <div style={{ ...a(1), marginTop: 28, padding: "16px 32px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 50, fontWeight: 1000, color: NAVY, whiteSpace: "nowrap", boxShadow: `inset 0 0 0 4px ${NAVY}` }}>
          {T.city}
        </div>
        <div style={{ ...a(2), marginTop: 22, fontSize: 42, fontWeight: 1000, color: NAVY_SOFT, letterSpacing: 2, display: "flex", alignItems: "center" }}>
          <ArrowText text={T.route} size={42} />
        </div>
        {/* 1: ссылка в профиле */}
        <div style={{ ...a(3), marginTop: 64, width: "100%", padding: "26px 24px", boxSizing: "border-box", borderRadius: 32, backgroundColor: "#F3F6FB", border: "4px solid #DCE3EE", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 84, height: 84, flexShrink: 0, borderRadius: 42, backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LinkIcon size={50} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 1000, color: NAVY, textAlign: "left", lineHeight: 1.12 }}>{T.link}</div>
        </div>
        <div style={{ ...a(4), marginTop: 30, fontSize: 46, fontWeight: 900, color: "#33415E" }}>{T.or}</div>
        {/* 2: WhatsApp — полный номер крупно */}
        <div style={{ ...a(5), marginTop: 28, width: "100%", padding: "24px 22px", boxSizing: "border-box", borderRadius: 36, backgroundColor: "#E7F7EC", border: `5px solid ${WA_GREEN}`, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 48, backgroundColor: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WhatsAppIcon size={58} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 48, fontWeight: 1000, color: "#1E7A44", lineHeight: 1 }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 90, fontWeight: 1000, color: NAVY, lineHeight: 1.08, whiteSpace: "nowrap", letterSpacing: 1 }}>{T.whatsappNumber}</div>
          </div>
        </div>
        <div style={{ ...a(6), marginTop: 44, padding: "12px 30px", borderRadius: 30, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 40, fontWeight: 1000 }}>{T.tagline}</div>
      </div>
    </div>
  );
};

export const Cta: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "cta", t);
  const sk = startKeys(tl);
  const lastStart = sk.len - 1;
  const u = easeInOut(prog(f, CTA_KEYS.flip[0], CTA_KEYS.flip[1] - CTA_KEYS.flip[0]));
  const bgOut = easeInOut(prog(f, CTA_KEYS.bgOut[0], CTA_KEYS.bgOut[1] - CTA_KEYS.bgOut[0]));
  if (u >= 1) return <Card f={f} />;
  // переворот: 0…0,5 — лицевая сторона (телефон) сжимается по ширине,
  // 0,5…1 — обратная сторона (карточка) раскрывается до полного кадра
  const front = u < 0.5;
  const ang = front ? u * 180 : (1 - u) * 180;
  const sx = Math.max(0.001, Math.cos((ang * Math.PI) / 180));
  const grow = easeInOut(prog(u, 0.5, 0.5));
  const lift = easeInOut(Math.min(1, u * 2));
  const ph = { x: mix(PHONE.x, 540 - PHONE.w / 2, lift), y: mix(PHONE.y, 960 - PHONE.h / 2, lift) };
  const rect = front
    ? { x: ph.x, y: ph.y, w: PHONE.w, h: PHONE.h, r: 56 }
    : { x: mix(ph.x, 0, grow), y: mix(ph.y, 0, grow), w: mix(PHONE.w, 1080, grow), h: mix(PHONE.h, 1920, grow), r: mix(56, 0, grow) };
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#FFFFFF" })}>
      <div style={box({ inset: 0, opacity: 1 - bgOut })}>
        <StartStage tl={tl} f={lastStart} hidePhone hideOverlays />
      </div>
      <div
        style={box({
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          borderRadius: rect.r,
          overflow: "hidden",
          transform: `scaleX(${sx})`,
          backgroundColor: front ? "#1E2235" : "#FFFFFF",
          boxShadow: "0 24px 50px rgba(20,40,75,0.3)",
        })}
      >
        {front ? (
          <div style={box({ left: SCREEN_INSET, top: SCREEN_INSET })}>
            <PhoneScreen s={phoneStateAt(sk, lastStart)} />
          </div>
        ) : (
          <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${rect.w / 1080}, ${rect.h / 1920})` })}>
            <Card f={f} />
          </div>
        )}
      </div>
    </div>
  );
};

export const ctaSfx = (tl: Bg41Timeline) => {
  const s0 = tl.scenes.find((x) => x.id === "cta")!.from;
  return [
    { src: "audio/sfx-whoosh.mp3", at: s0 + CTA_KEYS.flip[0] / 30, volume: 0.2 },
    { src: "audio/sfx-chime.mp3", at: s0 + CTA_KEYS.content[0] / 30, volume: 0.22 },
  ];
};

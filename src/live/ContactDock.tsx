// Контактный блок финала живых роликов BalaGo (AGENTS.md):
// «Бишкек • Балдар үчүн такси», ссылка в профиле И WhatsApp с полным номером.
// Стоит неподвижно в безопасной зоне (над нижними 400 px интерфейса Reels,
// левее правой колонки кнопок) и не исчезает до конца ролика, в том числе
// во время перехода от живого кадра к фирменной карточке.
import { fontFamily } from "../fonts";
import { ChatPhoneIcon, LinkIcon } from "./icons";
import { ramp, springy } from "./sync";
import { LIVE_COLORS as C } from "./theme";

export type ContactTexts = {
  readonly city: string;
  readonly profile: string;
  readonly or: string;
  readonly whatsappLabel: string;
  readonly phone: string;
};

export const DOCK = { left: 60, top: 930, width: 870, height: 410 } as const;

export const ContactDock: React.FC<{
  readonly t: number;
  readonly texts: ContactTexts;
  readonly cityAt: number;
  readonly profileAt: number;
  readonly orAt: number;
  readonly phoneAt: number;
  readonly pulseAt?: number;
}> = ({ t, texts, cityAt, profileAt, orAt, phoneAt, pulseAt }) => {
  const panel = springy(t, cityAt, 0.6);
  if (panel <= 0) return null;
  const row = (at: number) => ({ k: springy(t, at, 0.5), a: ramp(t, at, 0.2) });
  const city = row(cityAt + 0.1);
  const prof = row(profileAt);
  const or = row(orAt);
  const ph = row(phoneAt);
  const glow = pulseAt !== undefined && t > pulseAt ? 0.5 + 0.5 * Math.sin((t - pulseAt) * 3.2) : 0;
  return (
    <div style={{ position: "absolute", ...DOCK, perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 42,
          background: "linear-gradient(165deg, rgba(20,40,90,0.94) 0%, rgba(8,18,46,0.96) 100%)",
          border: `3px solid rgba(255,201,14,${0.35 + 0.35 * glow})`,
          boxShadow: `0 40px 100px rgba(4,10,30,0.55), 0 0 ${40 + 30 * glow}px rgba(255,201,14,${0.12 + 0.15 * glow})`,
          transform: `translateY(${(1 - panel) * 120}px) rotateX(${(1 - panel) * 24}deg)`,
          transformOrigin: "50% 100%",
          opacity: Math.min(1, panel * 1.6),
          overflow: "hidden",
        }}
      >
        {/* город */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 78,
            background: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontWeight: 1000,
            fontSize: 44,
            color: C.navyInk,
            opacity: city.a,
          }}
        >
          <span style={{ transform: `translateY(${(1 - city.k) * 20}px)` }}>{texts.city}</span>
        </div>
        {/* ссылка в профиле */}
        <div style={{ position: "absolute", left: 34, right: 34, top: 104, display: "flex", alignItems: "center", gap: 22, opacity: prof.a, transform: `translateX(${(1 - prof.k) * -50}px)` }}>
          <div style={{ width: 84, height: 84, borderRadius: 24, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LinkIcon size={58} />
          </div>
          <span style={{ fontFamily, fontWeight: 900, fontSize: 41, color: C.white, lineHeight: 1.05, whiteSpace: "nowrap" }}>{texts.profile}</span>
        </div>
        {/* «же …» */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 204, textAlign: "center", fontFamily, fontWeight: 800, fontSize: 34, color: C.muted, opacity: or.a, transform: `translateY(${(1 - or.k) * 12}px)` }}>
          {texts.or}
        </div>
        {/* WhatsApp: номер крупно */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 258,
            height: 128,
            borderRadius: 30,
            background: C.white,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 22px",
            opacity: ph.a,
            transform: `scale(${0.85 + 0.15 * ph.k})`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
          }}
        >
          <ChatPhoneIcon size={88} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily, fontWeight: 900, fontSize: 32, color: C.navy, lineHeight: 1 }}>{texts.whatsappLabel}</span>
            <span style={{ fontFamily, fontWeight: 1000, fontSize: 72, color: C.navyInk, lineHeight: 1.02, fontVariantNumeric: "tabular-nums", letterSpacing: 0.5 }}>
              {texts.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Сцена 16. Финал BalaGo (VO32–VO36, диктор).
// Светлый экран с фирменной графикой. Рисунок сына (тот же лист) мягко
// переходит в иллюстрацию белого Volkswagen Polo — это образ услуги, а не
// поездка этой семьи. Надписи появляются по порядку вместе с речью:
// логотип + BalaGo → «Балдар үчүн такси» → «БИШКЕК» → «ҮЙ → МЕКТЕП → ҮЙ» →
// кнопка «Баланы каттоо» → «BalaGo менен жолго чыгалы!» (кнопка пульсирует)
// → последняя реплика (по просьбе заказчика): «Шилтеме профилдин башында»
// (стрелка вверх — к шапке профиля) и плашка WhatsApp с номером
// 0998 08 38 28; группы цифр загораются, когда диктор их называет. После
// номера композиция держится ≈1,8 с.
// Важное — в безопасной зоне (x 90–990, y 200–1540); полоса субтитров
// (y 1400–1510) свободна. Без цен и гарантий.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { WhatsAppIcon } from "../../founder-story/icons";
import { useLine, useSceneLength } from "../context";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { PHT_TEXT } from "../script";
import type { SceneSound } from "../sound";
import { COMMON } from "../sound";
import { spokenStarts } from "../subtitleChunks";
import { ChildDrawing, Polo } from "../ui/car";
import { abs, C, font, Paper } from "../ui/kit";
import { RouteIcon } from "../ui/screens";

const T = PHT_TEXT.cta;
// слоган, затем последняя реплика — ссылка и WhatsApp (номер цифрами в
// субтитрах, словами в озвучке)
const SIGNOFF = "vo35";
const CONTACT = "vo36";

type L = { from: number; to: number; word: (i: number) => number };
// номер слова озвучки для слова субтитра реплики CONTACT
const contactWords = () => {
  const { first, groups } = spokenStarts(CONTACT);
  const at = (test: (g: readonly string[]) => boolean) => groups.map((g, i) => (test(g) ? first[i] : -1)).filter((i) => i >= 0);
  return { whatsapp: at((g) => g[0].startsWith(T.whatsapp))[0] ?? 0, digits: at((g) => /^\d/.test(g[0])) };
};

export const ctaBeats = (vo32: L, vo33: L, vo34: L, contact: L, signoff: L) => {
  const W = contactWords();
  return {
    morph: [4, 34] as const, // рисунок → Polo
    logo: vo32.from - 2,
    tagline: vo32.word(1) + 4,
    city: vo32.word(1) + 10, // «Бишкектеги»
    route: vo33.from - 2,
    routeSteps: [vo33.word(0), vo33.word(1), vo33.word(3)] as const,
    button: vo34.from - 2,
    link: contact.from - 2, // «Профилдин башындагы шилтемеге…»
    whatsapp: contact.word(W.whatsapp) - 3, // «…Ватсап аркылуу…»
    digits: W.digits.map((i) => contact.word(i) - 1), // группы цифр по мере чтения
    number: contact.to + 2, // номер прочитан — мягкий пульс плашки, колёса машины трогаются
    final: signoff.from - 4, // слоган — пульс кнопки
  };
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo32 = useLine("vo32");
  const vo33 = useLine("vo33");
  const vo34 = useLine("vo34");
  const contact = useLine(CONTACT);
  const signoff = useLine(SIGNOFF);
  const B = ctaBeats(vo32, vo33, vo34, contact, signoff);
  const k = (at: number, n = 9) => easeOut((f - at) / n);
  const morph = easeInOut((f - B.morph[0]) / (B.morph[1] - B.morph[0]));
  // Polo: появляется на месте рисунка, затем плавно поднимается на своё место
  const carY = 456 + 70 * (1 - k(B.logo, 24));
  const wheel = f > B.number ? (f - B.number) * 6 : 0;
  const pulse = 1 + 0.035 * Math.sin(Math.PI * clamp((f - B.final) / 18));
  // медленный наезд на всю композицию (≤ 2 %), чтобы финал не стоял мёртво
  const push = 1 + 0.02 * easeInOut(f / useSceneLength());
  return (
    <Paper>
      <div style={abs({ inset: 0, transform: `scale(${push})`, transformOrigin: "50% 45%" })}>
      {/* мягкая дорога под машиной */}
      <div style={abs({ left: 100, top: carY + 304, width: 880, height: 14, borderRadius: 7, backgroundColor: "#E7E2D6", opacity: morph })} />
      {/* рисунок сына → белый Polo */}
      <div style={abs({ left: 180, top: carY - 30, width: 720, opacity: 1 - morph, transform: `scale(${1 - 0.08 * morph}) rotate(${-3 * (1 - morph)}deg)` })}>
        <div style={{ boxShadow: "0 30px 60px rgba(20,36,59,0.18)" }}>
          <ChildDrawing w={720} morph={morph * 0.6} />
        </div>
      </div>
      <div style={abs({ left: 160, top: carY + 60, opacity: morph, transform: `translateX(${(1 - morph) * 30}px)` })}>
        <Polo w={760} wheel={wheel} />
      </div>
      {/* логотип и BalaGo */}
      <div style={abs({ left: 0, right: 0, top: 204, display: "flex", alignItems: "center", justifyContent: "center", gap: 28, opacity: k(B.logo), transform: `translateY(${(1 - k(B.logo)) * -30}px)` })}>
        <div style={{ width: 150, height: 150, borderRadius: 75, overflow: "hidden", backgroundColor: C.white, boxShadow: C.shadow, flexShrink: 0 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily: font, color: C.navy }}>
          <div style={{ fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{T.brand}</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 8, opacity: k(B.tagline) }}>{T.tagline}</div>
        </div>
      </div>
      {/* БИШКЕК */}
      <div style={abs({ left: 0, right: 0, top: 374, display: "flex", justifyContent: "center", opacity: k(B.city) })}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "10px 32px", borderRadius: 40, backgroundColor: C.navy, color: C.white, fontFamily: font, fontWeight: 900, fontSize: 44, letterSpacing: 4 }}>
          <svg width={30} height={40} viewBox="0 0 20 26">
            <path d="M 10 1 C 4 1 1 5.5 1 10 C 1 16 10 25 10 25 C 10 25 19 16 19 10 C 19 5.5 16 1 10 1 Z" fill={C.yellow} />
            <circle cx={10} cy={10} r={3.6} fill={C.navy} />
          </svg>
          {T.city}
        </div>
      </div>
      {/* ҮЙ → МЕКТЕП → ҮЙ */}
      <div style={abs({ left: 100, right: 100, top: 812, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderRadius: 40, backgroundColor: C.white, boxShadow: C.shadow, opacity: k(B.route), boxSizing: "border-box" })}>
        {["ҮЙ", "МЕКТЕП", "ҮЙ"].map((r, i) => (
          <div key={i} style={{ display: "contents" }}>
            {i > 0 ? <div style={{ fontFamily: font, fontSize: 64, fontWeight: 900, color: C.grey, opacity: k(B.routeSteps[i]) }}>→</div> : null}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: k(B.routeSteps[i]), transform: `translateY(${(1 - k(B.routeSteps[i])) * 20}px)` }}>
              <RouteIcon kind={r === "МЕКТЕП" ? "school" : "home"} size={84} />
              <div style={{ fontFamily: font, fontSize: 40, fontWeight: 900, color: C.navy }}>{r}</div>
            </div>
          </div>
        ))}
      </div>
      {/* кнопка и ссылка */}
      <div style={abs({ left: 0, right: 0, top: 1006, display: "flex", justifyContent: "center", opacity: k(B.button), transform: `translateY(${(1 - k(B.button)) * 24}px) scale(${pulse})` })}>
        <div style={{ padding: "22px 72px", borderRadius: 56, backgroundColor: C.yellow, color: C.navy, fontFamily: font, fontWeight: 900, fontSize: 56, boxShadow: "0 18px 40px rgba(224,160,30,0.35)" }}>{T.button}</div>
      </div>
      <div style={abs({ left: 0, right: 0, top: 1134, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: k(B.link), fontFamily: font, fontWeight: 900, fontSize: 42, color: C.navy })}>
        <svg width={32} height={40} viewBox="0 0 18 22" style={{ transform: `translateY(${-4 * Math.sin(Math.PI * clamp((f - B.link) / 16))}px)` }}>
          <path d="M 9 1 L 17 10 L 12 10 L 12 21 L 6 21 L 6 10 L 1 10 Z" fill={C.navy} />
        </svg>
        {T.link}
      </div>
      {/* WhatsApp и номер: группы цифр загораются по мере чтения */}
      <div style={abs({ left: 0, right: 0, top: 1206, display: "flex", justifyContent: "center", opacity: k(B.whatsapp), transform: `translateY(${(1 - k(B.whatsapp)) * 24}px) scale(${1 + 0.03 * Math.sin(Math.PI * clamp((f - B.number) / 18))})` })}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "14px 36px 14px 16px", borderRadius: 60, backgroundColor: C.navy, boxShadow: C.shadow, fontFamily: font }}>
          <WhatsAppIcon size={66} />
          <div style={{ fontSize: 38, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>{T.whatsapp}</div>
          <div style={{ display: "flex", gap: 16, fontSize: 66, fontWeight: 900, letterSpacing: 1, fontVariantNumeric: "tabular-nums" }}>
            {T.phone.split(" ").map((g, i) => {
              const on = k(B.digits[i] ?? B.whatsapp, 6);
              return (
                <span key={i} style={{ color: on > 0.5 ? C.yellow : "rgba(255,255,255,0.4)", transform: `translateY(${-6 * Math.sin(Math.PI * clamp(on))}px)`, display: "inline-block" }}>
                  {g}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </Paper>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = ctaBeats(ctx.line("vo32"), ctx.line("vo33"), ctx.line("vo34"), ctx.line(CONTACT), ctx.line(SIGNOFF));
  return [
    { at: B.logo, src: COMMON("chime"), volume: 0.18 },
    { at: B.button, src: COMMON("pop"), volume: 0.1 },
    { at: B.whatsapp, src: COMMON("pop"), volume: 0.08 },
  ];
};

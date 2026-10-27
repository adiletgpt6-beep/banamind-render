// Сцена 6: финал. Сложенный билет растворяется в фирменном белом фоне,
// на его месте — логотип. Все контакты появляются за ≈ 1 с и дальше
// неподвижны до конца ролика: «Бишкек • Балдар үчүн такси», маршрут
// «ҮЙ → МЕКТЕП → ҮЙ», «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз», «WhatsApp: 0998 08 38 28», «BalaGo менен жолго чыгалы!».
// Всё в безопасной зоне Reels (сверху 250, снизу 400, справа 150 px).
// Диктор: «BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала
// каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp
// аркылуу жазыңыз. BalaGo менен жолго чыгалы!»
import { Img, staticFile } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { MiniCar, NAVY, NAVY_SOFT, Ticket, YELLOW, YELLOW_SOFT } from "../art";
import { box, useSceneFrame, useWordAt } from "../context";
import { BG39_TEXT } from "../script";

export const CTA_LOGO = 6; // кадр появления логотипа (мягкий звук)

export const CtaScene: React.FC = () => {
  const f = useSceneFrame();
  const t = BG39_TEXT.cta;
  const a = (at: number) => easeOut((f - at) / 9);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  // билет растворяется: растёт и тает в белом
  const dissolve = easeInOut((f + 14) / 26);
  const logo = easeOut((f - CTA_LOGO) / 12);
  // машинка проезжает по маршруту под надписью и останавливается
  const drive = easeInOut((f - 14) / 40);
  // синхронно с голосом: подсветка карточки ссылки и блик по карточке
  // WhatsApp (сами надписи неподвижны)
  const linkAt = useWordAt("n5", "профилдеги", 0.45);
  const waAt = useWordAt("n5", "ватсап", 0.7);
  const linkGlow = keys(f, [[linkAt - 4, 0], [linkAt + 6, 1], [linkAt + 40, 1], [linkAt + 60, 0]]);
  const waShine = clamp((f - waAt) / 26);
  const waGlow = keys(f, [[waAt - 4, 0], [waAt + 6, 1], [waAt + 50, 1], [waAt + 70, 0.4]]);
  const breathe = Math.sin(f / 45);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: NAVY })}>
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: YELLOW_SOFT, scale: `${1 + 0.03 * breathe}` })} />
      <div style={box({ right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC", scale: `${1 - 0.03 * breathe}` })} />
      {dissolve < 1 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - dissolve, filter: `blur(${10 * dissolve}px)` })}>
          <Ticket x={540} y={560} s={0.5 + 0.5 * dissolve} rot={-4} bg="#FFFFFF" topColor={1} bottomColor={0} done={1} failed={1} whole={1} fold={1} />
        </div>
      ) : null}
      <div style={box({ left: 90, right: 150, top: 262, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 })}>
        <div style={{ opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(10), fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(12), padding: "14px 34px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 50, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(14), position: "relative", width: 620, height: 104 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: NAVY_SOFT }}>{t.route}</div>
          <div style={box({ left: 30, right: 30, top: 86, height: 0, borderTop: "4px dashed #C9D3E3" })} />
          <div style={box({ left: 20 + 500 * drive, top: 56 })}>
            <MiniCar s={0.62} />
          </div>
        </div>
        <div style={{ ...item(16), width: "100%", padding: "24px 20px", borderRadius: 30, backgroundColor: "#F2F6FC", border: `4px solid ${linkGlow > 0.05 ? `rgba(255,201,14,${0.4 + 0.6 * linkGlow})` : "#DCE5F2"}`, boxShadow: `0 0 0 ${8 * linkGlow}px rgba(255,201,14,${0.25 * linkGlow})`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 42, fontWeight: 900, whiteSpace: "nowrap" }}>
            <svg width={48} height={48} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: NAVY_SOFT }}>{t.or}</div>
        </div>
        <div style={{ ...item(18), position: "relative", overflow: "hidden", width: "100%", padding: "20px 20px 24px", borderRadius: 30, backgroundColor: "#EAF7EE", border: "4px solid #B9E2C6", boxShadow: `0 0 0 ${8 * waGlow}px rgba(37,163,90,${0.18 * waGlow})` }}>
          {waShine > 0 && waShine < 1 ? <div style={box({ left: -200 + 1100 * waShine, top: -60, width: 110, height: 360, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", rotate: "18deg" })} /> : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 44, fontWeight: 900, color: "#1F7A3E" }}>
            <svg width={50} height={50} viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#25A35A" />
              <path d="M9 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5a6 6 0 0 0 2.8 2.5c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4 0 .6-.3 1.4-1 1.7-.8.4-1.8.4-3.4-.3a9.3 9.3 0 0 1-4.1-3.8c-.6-1-.8-1.9-.5-2.7z" fill="#FFFFFF" />
            </svg>
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, marginTop: 6, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ ...item(20), marginTop: 6, fontSize: 44, fontWeight: 900 }}>{t.slogan}</div>
      </div>
    </div>
  );
};

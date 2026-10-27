// Сцена 6: финал. Бумажная точка прыгает на финальную карточку и
// становится жёлтой точкой в строке «Бишкек • Балдар үчүн такси».
// Все контакты появляются за ≈ 0,8 с и дальше неподвижны до конца ролика:
// «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз»,
// «же WhatsApp аркылуу жазыңыз», «WhatsApp: 0998 08 38 28»,
// «BalaGo менен жолго чыгалы!». Всё в безопасной зоне Reels
// (сверху 250, снизу 400, справа 150 px).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { CTA_LAND } from "../beats";
import { BG47_TEXT, BG47_VIDEO } from "../script";
import { Dot } from "../art/Dot";
import { blink, easeInOut, easeOut, lerp, prog } from "../art/motion";
import { useWord } from "../context";
import { C } from "../art/palette";
import { box } from "../art/ui";


// Где на экране оказывается точка-«•» (середина строки города).
const BULLET = { x: 371, y: 660 } as const;

// Мягкий блик по карточке (текст неподвижен, движется только отсвет).
const Sweep: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const p = prog(f, at, 20);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={box({ inset: 0, borderRadius: 30, overflow: "hidden", pointerEvents: "none" })}>
      <div
        style={box({
          top: -40,
          bottom: -40,
          width: 160,
          left: `${-30 + 140 * easeInOut(p)}%`,
          background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
          transform: "skewX(-18deg)",
        })}
      />
    </div>
  );
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const linkAt = useWord("n5", 10);
  // фон еле заметно «дышит», контакты неподвижны
  const drift = Math.sin(f / 70) * 14;
  const t = BG47_TEXT.cta;
  const a = (at: number) => easeOut((f - at) / 9);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  const logo = easeOut((f - 4) / 12);
  // полёт точки: снизу по дуге в строку города, уменьшаясь до «•»
  const fly = easeInOut(prog(f, 0, CTA_LAND));
  const dx = lerp(230, BULLET.x, fly);
  const dy = lerp(1500, BULLET.y, fly) - Math.sin(Math.PI * fly) * 360;
  const ds = lerp(1.25, 0.2, easeInOut(prog(f, 6, CTA_LAND - 6)));
  const landed = f >= CTA_LAND;
  const pulse = landed ? 1 + 0.25 * Math.sin(Math.PI * Math.min(1, (f - CTA_LAND) / 8)) : 1;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" })}>
      <Img src={staticFile(`${BG47_VIDEO.assetsDir}/paper.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", opacity: 0.55 }} />
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: "#FFF4C2", transform: `scale(${1 + 0.03 * Math.sin(f / 40)})` })} />
      <div style={box({ right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC", transform: `scale(${1 + 0.03 * Math.cos(f / 46)})` })} />
      {/* тонкие линии бумажной карты на фоне */}
      <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity: 0.35, transform: `translate(${drift}px, ${drift * 0.6}px)` })}>
        {[300, 620, 1040, 1380, 1700].map((y) => (
          <line key={y} x1={0} y1={y} x2={1080} y2={y + 40} stroke="#E3D9C2" strokeWidth={14} />
        ))}
        {[180, 520, 880].map((x) => (
          <line key={x} x1={x} y1={0} x2={x - 60} y2={1920} stroke="#E3D9C2" strokeWidth={14} />
        ))}
      </svg>
      <div style={box({ left: 90, right: 150, top: 258, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 })}>
        <div style={{ opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(6), fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        {/* «Бишкек • Балдар үчүн такси»: «•» — сама точка */}
        <div
          style={{
            ...item(8),
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "14px 34px",
            borderRadius: 999,
            backgroundColor: C.yellow,
            border: `4px solid ${C.navy}`,
            fontSize: 50,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
          aria-label={t.cityLine}
        >
          <span>{t.city[0]}</span>
          {/* «•» — сама точка: жёлтая, с глазками, иногда моргает */}
          <span
            style={{
              display: "inline-block",
              width: 34,
              height: 34,
              borderRadius: 17,
              boxSizing: "border-box",
              backgroundColor: landed ? C.yellow : "transparent",
              border: `4px ${landed ? "solid" : "dashed"} ${C.navy}`,
              transform: `scale(${pulse})`,
              position: "relative",
            }}
          >
            {landed
              ? [-1, 1].map((sd) => (
                  <span
                    key={sd}
                    style={{ position: "absolute", left: 13 + sd * 5 - 2, top: 9, width: 4, height: 7 * (1 - blink(f, 2) * 0.9), borderRadius: 2, backgroundColor: C.navy }}
                  />
                ))
              : null}
          </span>
          <span>{t.city[1]}</span>
        </div>
        <div style={{ ...item(10), fontSize: 40, fontWeight: 900, color: C.navySoft }}>{t.route}</div>
        <div style={{ ...item(12), position: "relative", width: "100%", marginTop: 6, padding: "24px 20px", borderRadius: 30, backgroundColor: "#F2F6FC", border: "4px solid #DCE5F2", display: "flex", flexDirection: "column", gap: 10 }}>
          <Sweep f={f} at={linkAt} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 41, fontWeight: 900, whiteSpace: "nowrap" }}>
            <svg width={52} height={52} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke={C.navy} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: C.navySoft }}>{t.or}</div>
        </div>
        <div style={{ ...item(14), position: "relative", width: "100%", padding: "20px 20px 24px", borderRadius: 30, backgroundColor: C.greenSoft, border: "4px solid #B9E2C6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 44, fontWeight: 900, color: "#1F7A3E" }}>
            <svg width={50} height={50} viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#25A35A" />
              <path d="M9 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5a6 6 0 0 0 2.8 2.5c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4 0 .6-.3 1.4-1 1.7-.8.4-1.8.4-3.4-.3a9.3 9.3 0 0 1-4.1-3.8c-.6-1-.8-1.9-.5-2.7z" fill="#FFFFFF" />
            </svg>
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, marginTop: 6, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ ...item(16), marginTop: 4, fontSize: 44, fontWeight: 900 }}>{t.slogan}</div>
      </div>
      {/* летящая точка (до того как стать «•») */}
      {!landed ? (
        <div style={box({ left: dx - 80, top: dy - 86, width: 160, height: 200, transformOrigin: "80px 86px", transform: `scale(${ds}) rotate(${fly * 360}deg)` })}>
          <Dot look={{ x: 0.5, y: -0.4 }} blink={blink(f, 1)} mood="happy" armL={150} armR={150} legs={1 - fly} />
        </div>
      ) : null}
    </div>
  );
};

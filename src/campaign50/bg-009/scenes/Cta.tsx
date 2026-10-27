// Сцена 10, финальный экран. Пять цветных створок-дверей недели
// съезжаются в центр и закрываются в круг логотипа BalaGo; дальше — логотип,
// «Бишкек • Балдар үчүн такси», маршрут ҮЙ → МЕКТЕП → ҮЙ и ОБА способа связи
// одновременно: «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Всё появляется за ≈ 0,5 с
// после начала сцены и дальше стоит неподвижно до конца ролика — в
// безопасной зоне (выше нижнего интерфейса Reels/Shorts, левее кнопок).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { ArrowText, easeInOut, easeOut, NAVY, NAVY_SOFT, prog, WA_GREEN, YELLOW, YELLOW_SOFT } from "../art";
import { local, type SceneProps } from "../kit";
import { BG9_DAYS, BG9_TEXT } from "../script";

const T = BG9_TEXT.cta;

export const Cta: React.FC<SceneProps> = ({ t, tl }) => {
  const { lt } = local(tl, "cta", t);
  // створки: съезжаются (−0,62…−0,08 с), затем круг раскрывает финал
  const r = easeInOut(prog(lt, -0.05, 0.6)) * 2300;
  const a = (k: number) => {
    const u = easeOut(prog(lt, 0.05 + k * 0.05, 0.35));
    return { opacity: Math.min(1, u * 1.4), transform: `translateY(${(1 - u) * 22}px)` };
  };
  const drift = Math.sin(lt * 0.8) * 10;
  return (
    <>
      {r < 2300 ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {BG9_DAYS.map((d, i) => {
            // створки съезжаются по очереди сверху и снизу
            const w = 1080 / 5;
            const u = easeInOut(prog(lt, -0.62 + Math.abs(i - 2) * 0.06, 0.42));
            return <div key={d.id} style={{ position: "absolute", left: i * w - 1, top: 0, width: w + 2, height: 1920, backgroundColor: d.color, transform: `translateY(${(1 - u) * (i % 2 ? 1 : -1) * 1920}px)` }} />;
          })}
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at 540px 330px)`, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220 + drift, top: -260, width: 640, height: 640, borderRadius: 320, backgroundColor: YELLOW_SOFT }} />
      <div style={{ position: "absolute", right: -260 - drift, bottom: -200, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF1FB" }} />
      <div style={{ position: "absolute", left: 66, right: 126, top: 300, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ ...a(0), display: "flex", alignItems: "center", gap: 22 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 170, height: 170, borderRadius: 85, boxShadow: "0 12px 30px rgba(20,40,90,0.18)" }} />
          <div style={{ fontSize: 112, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{T.brand}</div>
        </div>
        <div style={{ ...a(1), marginTop: 26, padding: "16px 34px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 50, fontWeight: 1000, color: NAVY, whiteSpace: "nowrap" }}>{T.city}</div>
        <div style={{ ...a(2), marginTop: 22, fontSize: 42, fontWeight: 1000, color: NAVY_SOFT, letterSpacing: 2, display: "flex", alignItems: "center" }}>
          <ArrowText text={T.route} size={42} />
        </div>
        {/* пять дней — одна непрерывная линия */}
        <div style={{ ...a(3), marginTop: 26, position: "relative", width: 640, height: 56 }}>
          <div style={{ position: "absolute", left: 28, right: 28, top: 22, height: 12, borderRadius: 6, backgroundColor: YELLOW }} />
          {BG9_DAYS.map((d, i) => (
            <div key={d.id} style={{ position: "absolute", left: i * 146, top: 0, width: 56, height: 56, borderRadius: 28, backgroundColor: d.color, color: "#FFFFFF", fontSize: 22, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {d.short}
            </div>
          ))}
        </div>
        {/* 1: ссылка в профиле */}
        <div style={{ ...a(4), marginTop: 54, width: "100%", padding: "28px 26px", boxSizing: "border-box", borderRadius: 32, backgroundColor: "#F3F6FB", border: "4px solid #DCE3EE", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 84, height: 84, flexShrink: 0, borderRadius: 42, backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round">
              <path d="M 10 14 L 14 10" />
              <path d="M 8.5 11.5 L 6.5 13.5 Q 4 16 6.5 18.5 Q 9 21 11.5 18.5 L 13.5 16.5" />
              <path d="M 15.5 12.5 L 17.5 10.5 Q 20 8 17.5 5.5 Q 15 3 12.5 5.5 L 10.5 7.5" />
            </svg>
          </div>
          <div style={{ fontSize: 54, fontWeight: 1000, color: NAVY, textAlign: "left", lineHeight: 1.12 }}>{T.link}</div>
        </div>
        <div style={{ ...a(5), marginTop: 24, fontSize: 48, fontWeight: 900, color: "#33415E" }}>{T.or}</div>
        {/* 2: WhatsApp — полный номер крупно */}
        <div style={{ ...a(6), marginTop: 22, width: "100%", padding: "26px 22px", boxSizing: "border-box", borderRadius: 36, backgroundColor: "#E7F7EC", border: `5px solid ${WA_GREEN}`, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 48, backgroundColor: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={58} height={58} viewBox="0 0 24 24">
              <path d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z" fill="#FFFFFF" />
              <path d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z" fill={WA_GREEN} />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 50, fontWeight: 1000, color: "#1E7A44", lineHeight: 1 }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 92, fontWeight: 1000, color: NAVY, lineHeight: 1.08, whiteSpace: "nowrap", letterSpacing: 1 }}>{T.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// Телефон мамы на столе: ручной поиск «Бишкек мектеп каттамы», результаты,
// касание по BalaGo → страница сервиса (Бишкек, ҮЙ → МЕКТЕП → ҮЙ).
// Без выдуманных функций: только поиск и страница с алдын ала каттоо.
import { Img, staticFile } from "remotion";
import { fontFamily } from "./fonts";
import { NAVY, YELLOW } from "./props";
import { B17_TEXT } from "./script";

export const PHONE = { w: 400, h: 800 } as const;

export const Phone: React.FC<{
  readonly typed: number; // 0…1 — набран текст запроса
  readonly results: number; // 0…1 — появление результатов
  readonly press: number; // 0…1 — нажатие на первый результат
  readonly page: number; // 0…1 — страница BalaGo открыта
}> = ({ typed, results, press, page }) => {
  const S = B17_TEXT.search;
  const P = B17_TEXT.page;
  const q = S.query.slice(0, Math.round(S.query.length * typed));
  return (
    <div
      style={{
        width: PHONE.w,
        height: PHONE.h,
        borderRadius: 58,
        background: "#1D2230",
        padding: 16,
        boxSizing: "border-box",
        boxShadow: "0 40px 70px rgba(50,25,8,0.38), inset 0 0 0 3px #3A4153",
        fontFamily,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: "#F6F8FC" }}>
        {/* статус-бар */}
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontSize: 20, fontWeight: 800, color: NAVY }}>
          <span>08:15</span>
          <span style={{ width: 90, height: 26, borderRadius: 13, background: "#1D2230" }} />
          <span>▮▮▮</span>
        </div>
        {/* поиск */}
        <div style={{ position: "absolute", inset: "52px 0 0 0", opacity: 1 - page }}>
          <div style={{ margin: "14px 20px", height: 64, borderRadius: 32, background: "#FFFFFF", boxShadow: "0 4px 14px rgba(30,58,110,0.14)", display: "flex", alignItems: "center", padding: "0 22px", gap: 12 }}>
            <svg width={28} height={28} viewBox="0 0 28 28">
              <circle cx={12} cy={12} r={8} stroke={NAVY} strokeWidth={3.5} fill="none" />
              <path d="M 18 18 L 25 25" stroke={NAVY} strokeWidth={3.5} strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 24, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>
              {q}
              <span style={{ opacity: typed < 1 ? 1 : 0, color: "#2F6BD8" }}>|</span>
            </span>
          </div>
          <div style={{ opacity: results, transform: `translateY(${(1 - results) * 24}px)` }}>
            {S.results.map((r, i) => (
              <div
                key={r.title}
                style={{
                  margin: "14px 20px",
                  padding: "18px 20px",
                  borderRadius: 24,
                  background: r.brand ? (press > 0 ? `rgba(255,201,40,${0.25 + press * 0.4})` : "#FFFFFF") : "#FFFFFF",
                  border: r.brand ? `3px solid ${YELLOW}` : "3px solid transparent",
                  boxShadow: "0 3px 10px rgba(30,58,110,0.08)",
                  transform: r.brand ? `scale(${1 - press * 0.03})` : undefined,
                  opacity: i === 0 ? 1 : 0.8,
                }}
              >
                <div style={{ fontSize: 25, fontWeight: 900, color: r.brand ? NAVY : "#46506A", lineHeight: 1.2 }}>{r.title}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#6A7590", marginTop: 6 }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </div>
        {/* страница BalaGo */}
        <div
          style={{
            position: "absolute",
            inset: "52px 0 0 0",
            opacity: page,
            transform: `translateY(${(1 - page) * 40}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 26px",
            gap: 18,
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF6D6 100%)",
          }}
        >
          <Img src={staticFile("assets/logo.png")} style={{ width: 150, height: 150, borderRadius: 75, boxShadow: "0 8px 22px rgba(0,0,0,0.14)" }} />
          <div style={{ fontSize: 60, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{P.brand}</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: NAVY }}>{P.tagline}</div>
          <div style={{ fontSize: 28, fontWeight: 900, background: YELLOW, color: NAVY, borderRadius: 24, padding: "6px 22px" }}>{P.city}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 26, fontWeight: 900, color: "#46506A", marginTop: 8 }}>
            {P.route.map((x, i) => (
              <span key={x + i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 ? (
                  <svg width={30} height={18} viewBox="0 0 30 18">
                    <path d="M 2 9 H 26 M 19 3 L 27 9 L 19 15" stroke="#E0A800" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                {x}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 18, fontSize: 28, fontWeight: 1000, color: "#FFFFFF", background: NAVY, borderRadius: 32, padding: "16px 34px" }}>{P.button}</div>
        </div>
      </div>
    </div>
  );
};

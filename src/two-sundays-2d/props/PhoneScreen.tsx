// Экран телефона родителей — постановочный нейтральный интерфейс
// предварительной заявки (без адреса сайта, чужого браузера, номеров,
// адресов и имён). Состояния: поиск → результаты → страница BalaGo →
// форма «Алдын ала өтүнмө» → отправлено. Крупные читаемые элементы.
import { Img, staticFile } from "remotion";
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";

export type PhoneState = {
  readonly view: "search" | "results" | "page" | "form" | "sent";
  readonly typed: string; // набранный запрос
  readonly searchOn: boolean;
  readonly resultTap: boolean;
  readonly ctaTap: boolean;
  readonly days: readonly boolean[]; // отмеченные дни (5: Дүй…Жума)
  readonly dadNote: number; // 0…1 «Шаршембиде атасы алып келет»
  readonly summary: number; // 0…1
  readonly sendTap: boolean;
  readonly sent: number; // 0…1 подтверждение
};

const W = 528;
const T = SU2_TEXT;

export const PhoneScreen: React.FC<{ readonly s: PhoneState; readonly h: number }> = ({ s, h }) => {
  const abs = (st: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...st });
  return (
    <div style={abs({ left: 0, top: 0, width: W, height: h, backgroundColor: "#FBFAF7", overflow: "hidden", borderRadius: 30 })}>
      {s.view === "search" || s.view === "results" ? (
        <>
          <div style={abs({ left: 26, top: 90, width: W - 52, height: 92, backgroundColor: C.white, border: `4px solid ${s.searchOn ? C.blue : "#D6D1C6"}`, borderRadius: 46, boxSizing: "border-box" })}>
            <div style={abs({ left: 30, top: 16, fontFamily: F.text, fontWeight: 800, fontSize: 44, color: s.typed ? C.ink : "#9A948A" })}>{s.typed || T.search.hint}</div>
          </div>
          {s.view === "search" ? (
            <div style={abs({ left: 0, top: h - 380, width: W, height: 380, backgroundColor: "#DCD8CF" })}>
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 10 }).map((__, c) => <div key={`${r}${c}`} style={abs({ left: 8 + c * ((W - 16) / 10), top: 22 + r * 86, width: (W - 16) / 10 - 8, height: 70, backgroundColor: C.white, borderRadius: 10 })} />),
              )}
            </div>
          ) : (
            [
              { t: "BalaGo", sub: T.tagline, main: true },
              { t: "Мектеп жаңылыктары", sub: "", main: false },
              { t: "Үй-бүлө календары", sub: "", main: false },
            ].map((r, i) => (
              <div key={r.t} style={abs({ left: 26, top: 230 + i * 180, width: W - 52, height: 156, backgroundColor: i === 0 && s.resultTap ? "#E3E9FF" : C.white, borderRadius: 20, border: "3px solid #E6E1D6", boxSizing: "border-box", padding: "22px 26px" })}>
                <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 42, color: r.main ? C.navy : C.inkSoft }}>{r.t}</div>
                {r.sub ? <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 32, color: C.inkSoft, marginTop: 6 }}>{r.sub}</div> : null}
              </div>
            ))
          )}
        </>
      ) : null}
      {s.view === "page" ? (
        <>
          <div style={abs({ left: 0, top: 0, width: W, height: 520, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={abs({ left: W / 2 - 200, top: 60, width: 400, height: 400 })} />
          <div style={abs({ left: 0, top: 560, width: W, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.navy })}>{T.page.tagline}</div>
          <div style={abs({ left: 40, top: 660, width: W - 80, height: 100, borderRadius: 50, border: `5px solid ${C.navy}`, boxSizing: "border-box", textAlign: "center", lineHeight: "90px", fontFamily: F.display, fontWeight: 900, fontSize: 38, color: C.navy })}>{T.page.route}</div>
          <div style={abs({ left: 30, top: 820, width: W - 60, height: 150, backgroundColor: s.ctaTap ? "#C9531A" : C.orange, borderRadius: 24, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 46, lineHeight: 1.05, color: C.white, padding: "0 20px", boxSizing: "border-box", transform: s.ctaTap ? "scale(0.97)" : "none" })}>{T.page.cta}</div>
        </>
      ) : null}
      {s.view === "form" || s.view === "sent" ? (
        <>
          <div style={abs({ left: 0, top: 0, width: W, height: 150, backgroundColor: C.yellow })} />
          <div style={abs({ left: 30, top: 52, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.navy })}>{T.form.title}</div>
          <div style={abs({ left: 30, top: 190, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: C.inkSoft })}>{T.form.daysLabel}</div>
          {T.form.days.map((d, i) => {
            const on = s.days[i];
            const wed = !d.on;
            return (
              <div
                key={d.short}
                style={abs({
                  left: 24 + i * 98,
                  top: 250,
                  width: 88,
                  height: 110,
                  borderRadius: 20,
                  backgroundColor: on ? C.navy : wed ? "#EFEAE0" : C.white,
                  border: `4px solid ${on ? C.navy : wed ? "#D8D1C2" : "#C9C3B6"}`,
                  boxSizing: "border-box",
                  textAlign: "center",
                  lineHeight: "102px",
                  fontFamily: F.text,
                  fontWeight: 800,
                  fontSize: d.short.length > 3 ? 30 : 34,
                  color: on ? C.white : wed ? "#A69F92" : C.navy,
                })}
              >
                {d.short}
              </div>
            );
          })}
          <div style={abs({ left: 24, top: 390, width: W - 48, padding: "18px 22px", boxSizing: "border-box", backgroundColor: "#FFF1E5", borderRadius: 18, border: `3px solid ${C.orangeSoft}`, opacity: s.dadNote, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.navy })}>
            {T.form.dadNote}
          </div>
          <div style={abs({ left: 30, top: 520, width: W - 60, fontFamily: F.text, fontWeight: 800, fontSize: 32, lineHeight: 1.3, color: C.inkSoft, opacity: s.summary })}>{T.form.chosen}</div>
          {s.view === "form" ? (
            <div style={abs({ left: 30, top: 700, width: W - 60, height: 130, backgroundColor: s.sendTap ? "#2B3A70" : C.navy, borderRadius: 24, textAlign: "center", lineHeight: "130px", fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.white, transform: s.sendTap ? "scale(0.97)" : "none", opacity: 0.5 + 0.5 * s.summary })}>{T.form.send}</div>
          ) : (
            <div style={abs({ left: 30, top: 650, width: W - 60, padding: "30px 26px", boxSizing: "border-box", backgroundColor: "#E6F5EC", borderRadius: 24, border: "4px solid #3FAE6A", opacity: s.sent, transform: `translateY(${(1 - s.sent) * 30}px)` })}>
              <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 44, color: "#1F7A45" }}>✓ {T.form.sent}</div>
              <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 36, color: C.inkSoft, marginTop: 14, lineHeight: 1.25 }}>{T.form.sentNote}</div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

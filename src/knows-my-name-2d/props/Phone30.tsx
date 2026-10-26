// Телефон мамы (№30): один и тот же телефон в светлом чехле во всех
// планах. Экран — постановочный нейтральный интерфейс без адресов сайтов,
// номеров, имён семьи и адреса школы. Состояния:
//   route   — простая схема «Мектеп → Үй» (начало фильма);
//   search  — запрос «Мектептен үйгө жеткирүү», общие результаты без бренда;
//   results — тот же запрос, среди результатов карточка BalaGo (касание);
//   page    — страница BalaGo: логотип, «Балдар үчүн такси», блок Адилета
//             (утверждённый портрет проекта, только известные сведения —
//             появляются по одному);
//   form    — «Алдын ала өтүнмө»: поля заполняются, касание кнопки;
//   sent    — «Алдын ала өтүнмө жөнөтүлдү» (обращение отправлено; ни
//             водителя, ни времени, ни ответа).
// Слои: корпус (светлый чехол) → экран внутри рамки → палец сверху
// (палец рисует сцена, CloseHand). Обратной стороны с экраном нет.
import { Img, staticFile } from "remotion";
import { KM2_TEXT } from "../script";
import { C, F } from "../theme";

export const PHONE = { w: 560, h: 1150, bezel: 26, caseColor: "#EDE5D8", caseShade: "#D9CFBF" } as const;
const SW = PHONE.w - PHONE.bezel * 2;
const SH = PHONE.h - PHONE.bezel * 2;

export type Phone30State = {
  readonly view: "route" | "search" | "results" | "page" | "form" | "sent";
  readonly typed?: number; // 0…1 — доля набранного запроса
  readonly tap?: boolean; // касание выделенного элемента (карточка/кнопка)
  readonly facts?: number; // page: сколько строк фактов видно (0…3), с дробной частью — появление
  readonly scroll?: number; // page: 0…1 прокрутка к блоку Адилета
  readonly fill?: number; // form: 0…3 заполненные поля
  readonly sent?: number; // sent: 0…1 появление подтверждения
};

const T = KM2_TEXT;
const abs = (st: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...st });
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Координаты (в системе экрана) кнопок — для попадания пальца.
export const PHONE_TARGETS = {
  balagoCard: { x: SW / 2, y: 370 },
  send: { x: SW / 2, y: 900 },
} as const;

const Screen: React.FC<{ readonly s: Phone30State }> = ({ s }) => {
  const head = (title: string) => (
    <div style={abs({ left: 0, top: 0, width: SW, height: 120, backgroundColor: "#F3EFE6", borderBottom: "3px solid #E3DDD0" })}>
      <div style={abs({ left: 30, top: 52, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.navy })}>{title}</div>
    </div>
  );
  if (s.view === "route") {
    return (
      <div style={abs({ left: 0, top: 0, width: SW, height: SH, backgroundColor: "#EEF3F6" })}>
        {/* условная карта: кварталы и дорога */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={abs({ left: 30 + (i % 2) * 250, top: 160 + Math.floor(i / 2) * 330, width: 200, height: 260, backgroundColor: "#DDE6EC", borderRadius: 18 })} />
        ))}
        <svg width={SW} height={SH} style={abs({ left: 0, top: 0 })}>
          <path d={`M 130 250 C 260 420, 120 620, 380 820`} stroke={C.blue} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="2 26" />
          <circle cx={130} cy={250} r={26} fill={C.navy} />
          <circle cx={380} cy={820} r={26} fill={C.yellow} stroke={C.navy} strokeWidth={6} />
        </svg>
        <div style={abs({ left: 30, top: 990, width: SW - 60, height: 96, backgroundColor: C.white, borderRadius: 48, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.navy })}>
          {T.route.from} → {T.route.to}
        </div>
      </div>
    );
  }
  if (s.view === "search" || s.view === "results") {
    const q = T.search.query;
    const n = Math.round(q.length * clamp01(s.typed ?? 1));
    const general = ["Мектеп каттамдары", "Ата-энелер үчүн кеңештер"];
    const cards = s.view === "results" ? [{ t: T.brand, sub: T.tagline, brand: true }, ...general.map((t) => ({ t, sub: "", brand: false }))] : general.map((t) => ({ t, sub: "", brand: false }));
    return (
      <div style={abs({ left: 0, top: 0, width: SW, height: SH, backgroundColor: "#FBFAF7" })}>
        <div style={abs({ left: 24, top: 80, width: SW - 48, height: 110, backgroundColor: C.white, border: `4px solid ${C.blue}`, borderRadius: 30, boxSizing: "border-box", padding: "14px 26px", fontFamily: F.text, fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: C.ink })}>
          {n ? q.slice(0, n) : <span style={{ color: "#9A948A" }}>{T.search.hint}</span>}
        </div>
        {(s.typed ?? 1) >= 1
          ? cards.map((c, i) => (
              <div key={c.t} style={abs({ left: 24, top: 250 + i * 200 + (c.brand ? 0 : s.view === "results" ? 60 : 0), width: SW - 48, height: c.brand ? 240 : 170, backgroundColor: c.brand ? (s.tap ? "#FFF0A8" : "#FFF7D1") : C.white, borderRadius: 22, border: `3px solid ${c.brand ? C.yellow : "#E6E1D6"}`, boxSizing: "border-box", padding: "26px 28px", transform: c.brand && s.tap ? "scale(0.98)" : "none" })}>
                <div style={{ fontFamily: c.brand ? F.display : F.text, fontWeight: c.brand ? 900 : 800, fontSize: c.brand ? 62 : 38, color: c.brand ? C.navy : C.inkSoft }}>{c.t}</div>
                {c.sub ? <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 36, color: C.navy, marginTop: 10 }}>{c.sub}</div> : null}
                {!c.brand ? <div style={{ marginTop: 18, width: "70%", height: 14, borderRadius: 7, backgroundColor: "#E6E1D6" }} /> : null}
              </div>
            ))
          : null}
      </div>
    );
  }
  if (s.view === "page") {
    const sc = clamp01(s.scroll ?? 0);
    const facts = s.facts ?? 0;
    return (
      <div style={abs({ left: 0, top: 0, width: SW, height: SH, backgroundColor: "#FBFAF7", overflow: "hidden" })}>
        <div style={abs({ left: 0, top: -340 * sc, width: SW, height: SH + 400 })}>
          <div style={abs({ left: 0, top: 0, width: SW, height: 400, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={abs({ left: SW / 2 - 140, top: 40, width: 280, height: 280, borderRadius: "50%" })} />
          <div style={abs({ left: 0, top: 330, width: SW, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.navy })}>{T.page.brand}</div>
          <div style={abs({ left: 0, top: 430, width: SW, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.navy })}>{T.page.tagline}</div>
          {/* блок Адилета */}
          <div style={abs({ left: 24, top: 520, width: SW - 48, height: 660, backgroundColor: C.white, borderRadius: 26, border: "3px solid #E6E1D6", boxSizing: "border-box" })}>
            <Img src={staticFile("assets/portrait.jpg")} style={abs({ left: 30, top: 30, width: 150, height: 150, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 30%" })} />
            <div style={abs({ left: 210, top: 70, fontFamily: F.display, fontWeight: 900, fontSize: 60, color: C.navy })}>{T.page.name}</div>
            {T.page.facts.map((t, i) => {
              const k = clamp01(facts - i);
              return (
                <div key={t} style={abs({ left: 30, top: 230 + i * 140, width: SW - 108, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, display: "flex", alignItems: "flex-start", gap: 18 })}>
                  <div style={{ flex: "0 0 22px", height: 22, borderRadius: 11, backgroundColor: C.yellow, marginTop: 12, border: `4px solid ${C.navy}`, boxSizing: "border-box" }} />
                  <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: i === 0 ? 48 : 38, lineHeight: 1.12, color: C.navy }}>{t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  if (s.view === "form") {
    const fill = s.fill ?? 0;
    return (
      <div style={abs({ left: 0, top: 0, width: SW, height: SH, backgroundColor: "#FBFAF7" })}>
        {head(T.brand)}
        <div style={abs({ left: 30, top: 160, fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.navy })}>{T.form.title}</div>
        {T.form.fields.map(([label, value], i) => {
          const k = clamp01(fill - i);
          return (
            <div key={label} style={abs({ left: 30, top: 270 + i * 175, width: SW - 60 })}>
              <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 30, color: C.inkSoft }}>{label}</div>
              <div style={{ marginTop: 8, height: 92, borderRadius: 18, border: `3px solid ${k > 0 ? C.blue : "#DDD7CA"}`, backgroundColor: C.white, boxSizing: "border-box", padding: "18px 22px", fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>
                {value.slice(0, Math.round(value.length * k))}
              </div>
            </div>
          );
        })}
        <div style={abs({ left: 30, top: PHONE_TARGETS.send.y - 60, width: SW - 60, height: 120, borderRadius: 60, backgroundColor: s.tap ? "#E2B700" : C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.navy, transform: s.tap ? "scale(0.97)" : "none" })}>{T.form.send}</div>
      </div>
    );
  }
  // sent
  const k = clamp01(s.sent ?? 1);
  return (
    <div style={abs({ left: 0, top: 0, width: SW, height: SH, backgroundColor: "#FBFAF7" })}>
      {head(T.brand)}
      <div style={abs({ left: SW / 2 - 90, top: 300, width: 180, height: 180, borderRadius: 90, backgroundColor: "#E5F2E8", opacity: k, transform: `scale(${0.8 + 0.2 * k})` })}>
        <svg width={180} height={180}>
          <path d="M 52 94 L 80 122 L 132 66" stroke="#2E8A55" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${130 * k} 200`} />
        </svg>
      </div>
      <div style={abs({ left: 30, top: 540, width: SW - 60, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 50, lineHeight: 1.1, color: C.navy, opacity: k })}>{T.form.sent}</div>
    </div>
  );
};

// Телефон целиком: корпус в светлом чехле, экран внутри рамки.
// (x, y) — центр телефона в мире, scale — масштаб, tilt — наклон (градусы).
export const Phone30: React.FC<{ readonly x: number; readonly y: number; readonly scale: number; readonly tilt?: number; readonly s: Phone30State }> = ({ x, y, scale, tilt = 0, s }) => (
  <div style={abs({ left: x - (PHONE.w / 2) * scale, top: y - (PHONE.h / 2) * scale, width: PHONE.w, height: PHONE.h, transform: `scale(${scale}) rotate(${tilt}deg)`, transformOrigin: "0 0" })}>
    <div style={abs({ left: 0, top: 0, width: PHONE.w, height: PHONE.h, borderRadius: 70, backgroundColor: PHONE.caseColor, border: `6px solid ${PHONE.caseShade}`, boxSizing: "border-box", boxShadow: "0 24px 50px rgba(20,20,30,0.18)" })} />
    <div style={abs({ left: PHONE.bezel - 6, top: PHONE.bezel - 6, width: SW + 12, height: SH + 12, borderRadius: 50, backgroundColor: "#1E2235" })} />
    <div style={abs({ left: PHONE.bezel, top: PHONE.bezel, width: SW, height: SH, borderRadius: 44, overflow: "hidden" })}>
      <Screen s={s} />
    </div>
  </div>
);

// Мировая точка элемента экрана (для кончика пальца).
export const phonePoint = (x: number, y: number, scale: number, pt: { x: number; y: number }) => ({
  x: x - (PHONE.w / 2) * scale + (PHONE.bezel + pt.x) * scale,
  y: y - (PHONE.h / 2) * scale + (PHONE.bezel + pt.y) * scale,
});

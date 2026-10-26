// Крупные планы предметов и экранов BG-015 (координаты кадра 1080×1920):
// детский рисунок, настольный календарь, экран ноутбука (поиск и страница
// BalaGo с полями заявки и схемой ҮЙ → МЕКТЕП → ҮЙ).
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { BG15_TEXT } from "./script";

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// ---------- рисунок сына ----------
export const Drawing: React.FC<{ f: number }> = ({ f }) => (
  <div style={abs({ inset: 0, background: "linear-gradient(180deg, #E8CFA8, #D7B78C)" })}>
    <div style={abs({ left: 110, top: 470, width: 860, height: 1000, backgroundColor: "#FFFDF6", borderRadius: 10, rotate: "-3deg", boxShadow: "0 30px 60px rgba(60,40,20,0.3)", overflow: "hidden" })}>
      <svg width={860} height={1000} viewBox="0 0 860 1000">
        {/* небо, солнце, трава — восковые мелки */}
        <circle cx={700} cy={150} r={80} fill="none" stroke="#FFC90E" strokeWidth={18} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={700 + Math.cos(a) * 110} y1={150 + Math.sin(a) * 110} x2={700 + Math.cos(a) * 150} y2={150 + Math.sin(a) * 150} stroke="#FFC90E" strokeWidth={12} strokeLinecap="round" />;
        })}
        <path d="M 30 800 Q 200 760 430 790 T 830 780" stroke="#6BB257" strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M 40 840 L 820 840" stroke="#8BC46F" strokeWidth={14} strokeDasharray="30 22" />
        {/* скамейка */}
        <path d="M 230 640 L 610 640 M 230 690 L 610 690 M 260 690 L 250 800 M 580 690 L 590 800" stroke="#9A7354" strokeWidth={16} strokeLinecap="round" />
        {/* папа */}
        <circle cx={350} cy={470} r={52} fill="none" stroke="#14285A" strokeWidth={12} />
        <path d="M 350 522 L 350 660 M 350 560 L 290 620 M 350 560 L 420 530 M 350 660 L 320 790 M 350 660 L 380 790" stroke="#3E6FB0" strokeWidth={14} strokeLinecap="round" />
        <path d="M 330 480 Q 350 500 370 480" stroke="#14285A" strokeWidth={6} fill="none" />
        {/* сын */}
        <circle cx={500} cy={540} r={42} fill="none" stroke="#14285A" strokeWidth={12} />
        <path d="M 500 582 L 500 680 M 500 610 L 430 545 M 500 610 L 560 470 M 500 680 L 480 780 M 500 680 L 525 780" stroke="#3E9C6B" strokeWidth={14} strokeLinecap="round" />
        <path d="M 484 550 Q 500 566 516 550" stroke="#14285A" strokeWidth={6} fill="none" />
        {/* змей */}
        <path d="M 560 470 Q 620 350 640 290" stroke="#14285A" strokeWidth={4} fill="none" />
        <path d="M 640 210 L 690 290 L 640 370 L 590 290 Z" fill="#FFC90E" stroke="#E5677A" strokeWidth={10} strokeLinejoin="round" />
      </svg>
      <div style={abs({ left: 60, top: 870, fontFamily, fontSize: 64, fontWeight: 900, color: "#E5677A", rotate: "-4deg", opacity: easeOut((f - 8) / 12) })}>{BG15_TEXT.drawing.caption}</div>
    </div>
  </div>
);

// ---------- настольный календарь ----------
// flip 0…1 — страница переворачивается на следующую неделю (те же отметки).
export const Calendar: React.FC<{ f: number; flip: number; highlight: number }> = ({ f, flip, highlight }) => {
  const c = BG15_TEXT.calendar;
  const page = (week: number, extra?: React.CSSProperties) => (
    <div style={abs({ left: 0, top: 0, width: 880, height: 820, backgroundColor: "#FFFFFF", borderRadius: 18, boxShadow: "0 20px 50px rgba(20,40,90,0.2)", padding: 40, boxSizing: "border-box", ...extra })}>
      <div style={{ fontFamily, fontSize: 52, fontWeight: 900, color: COLORS.navy }}>
        {c.title} • {week === 0 ? "13–17" : "20–24"}
      </div>
      <div style={{ fontFamily, fontSize: 30, fontWeight: 700, color: COLORS.navySoft, marginTop: 4, height: 40 }}>{week === 1 ? c.nextWeek : ""}</div>
      <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
        {c.days.map((d, i) => (
          <div key={d} style={{ flex: 1, height: 560, borderRadius: 16, backgroundColor: "#F2F5FA", padding: "16px 0", boxSizing: "border-box", textAlign: "center", fontFamily }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.navy }}>{d}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.navySoft }}>{(week === 0 ? 13 : 20) + i}</div>
            <div style={{ marginTop: 26, marginLeft: 8, marginRight: 8, padding: "14px 4px", borderRadius: 12, backgroundColor: COLORS.yellow, fontSize: 24, fontWeight: 900, color: COLORS.navy, lineHeight: 1.2, opacity: clamp(highlight * 5 - i * 0.8) * 0.75 + 0.25, scale: `${1 + 0.06 * Math.sin(clamp(highlight * 5 - i * 0.8) * Math.PI)}` }}>
              12:30
              <br />
              мектеп
            </div>
            <div style={{ marginTop: 18, marginLeft: 8, marginRight: 8, height: 120, borderRadius: 12, backgroundColor: "#DDE6F2", fontSize: 22, fontWeight: 800, color: COLORS.navySoft, paddingTop: 14, boxSizing: "border-box" }}>иш</div>
          </div>
        ))}
      </div>
    </div>
  );
  const fl = easeInOut(flip);
  return (
    <div style={abs({ inset: 0, background: "linear-gradient(180deg, #E3CBAE, #CDAE88)" })}>
      <div style={abs({ left: 100, top: 520, width: 880, height: 820, perspective: 2200 })}>
        {page(1)}
        {fl < 0.5 ? page(0, { transformOrigin: "50% 0%", transform: `rotateX(${fl * 180}deg)` }) : null}
        {/* кольца */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={abs({ left: 120 + i * 130, top: -24, width: 26, height: 56, borderRadius: 13, border: "6px solid #8C929C", boxSizing: "border-box", backgroundColor: "transparent" })} />
        ))}
      </div>
      <span style={{ display: "none" }}>{f}</span>
    </div>
  );
};

// ---------- экран ноутбука ----------
const Bezel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={abs({ inset: 0, background: "linear-gradient(180deg, #3B3149, #2A2433)" })}>
    <div style={abs({ left: 30, top: 230, width: 1020, height: 1330, borderRadius: 34, backgroundColor: "#1C1E24", padding: 22, boxSizing: "border-box" })}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", backgroundColor: "#FFFFFF" }}>{children}</div>
    </div>
    <div style={abs({ left: -20, top: 1560, width: 1120, height: 60, borderRadius: "0 0 30px 30px", background: "linear-gradient(180deg, #C9CED6, #9AA1AC)" })} />
  </div>
);

const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={60} height={70} viewBox="0 0 30 35" style={abs({ left: x - 6, top: y - 4, scale: `${1 - press * 0.15}`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))" })}>
    <path d="M 3 2 L 3 28 L 10 21 L 15 32 L 19 30 L 14 19 L 24 19 Z" fill="#FFFFFF" stroke="#111" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

// Начальный экран: строка поиска, курсор над ней (кадр «решение искать»).
export const SearchIdle: React.FC<{ f: number; cursor: { x: number; y: number } }> = ({ f, cursor }) => (
  <Bezel>
    <Browser url="izdoo.kg" />
    <SearchBox text="" caret={Math.floor(f / 15) % 2 === 0} />
    <Cursor x={cursor.x} y={cursor.y} />
  </Bezel>
);

const Browser: React.FC<{ url: string }> = ({ url }) => (
  <div style={abs({ left: 0, top: 0, right: 0, height: 86, backgroundColor: "#ECEFF4", borderBottom: "2px solid #D8DDE6" })}>
    {["#E5677A", "#FFC90E", "#6BB257"].map((c, i) => (
      <div key={c} style={abs({ left: 26 + i * 34, top: 32, width: 22, height: 22, borderRadius: 11, backgroundColor: c })} />
    ))}
    <div style={abs({ left: 140, top: 18, right: 30, height: 50, borderRadius: 25, backgroundColor: "#FFFFFF", fontFamily, fontSize: 28, fontWeight: 700, color: "#6A7590", lineHeight: "50px", paddingLeft: 26 })}>{url}</div>
  </div>
);

const SearchBox: React.FC<{ text: string; caret: boolean; top?: number }> = ({ text, caret, top = 300 }) => (
  <div style={abs({ left: 60, right: 60, top, height: 110, borderRadius: 55, border: "4px solid #C9D3E3", backgroundColor: "#FFFFFF", boxShadow: "0 8px 22px rgba(20,40,90,0.1)", fontFamily, fontSize: 40, fontWeight: 800, color: COLORS.navy, lineHeight: "102px", paddingLeft: 90, boxSizing: "border-box" })}>
    <svg width={40} height={40} viewBox="0 0 24 24" style={abs({ left: 30, top: 32 })}>
      <circle cx={10} cy={10} r={7} stroke="#6A7590" strokeWidth={3} fill="none" />
      <path d="M 15 15 L 22 22" stroke="#6A7590" strokeWidth={3} strokeLinecap="round" />
    </svg>
    {text}
    <span style={{ opacity: caret ? 1 : 0, color: COLORS.navySoft }}>|</span>
  </div>
);

// Поиск → результаты → клик → страница BalaGo (поля) → схема маршрута.
// Все моменты — кадры сцены.
export const SearchFlow: React.FC<{
  f: number;
  typeFrom: number;
  typeTo: number;
  resultsAt: number;
  clickAt: number;
  routeAt: number;
}> = ({ f, typeFrom, typeTo, resultsAt, clickAt, routeAt }) => {
  const q = BG15_TEXT.search.query;
  const typed = q.slice(0, Math.round(clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)) * q.length));
  const onPage = f >= clickAt + 4;
  const res = easeOut((f - resultsAt) / 10);
  const cur = onPage
    ? { x: 760, y: 1500 }
    : {
        x: 700 + (300 - 700) * easeInOut((f - resultsAt) / Math.max(1, clickAt - resultsAt - 2)),
        y: 640 + (560 - 640) * easeInOut((f - resultsAt) / Math.max(1, clickAt - resultsAt - 2)),
      };
  const press = f >= clickAt - 2 && f < clickAt + 4 ? 1 : 0;
  if (!onPage) {
    return (
      <Bezel>
        <Browser url="izdoo.kg" />
        <SearchBox text={typed} caret={f < resultsAt && Math.floor(f / 8) % 2 === 0} top={keysTop(f, resultsAt)} />
        <div style={abs({ left: 60, right: 60, top: 300, opacity: res, translate: `0 ${(1 - res) * 30}px` })}>
          {BG15_TEXT.search.results.map((r, i) => (
            <div key={r.title} style={{ marginTop: i ? 34 : 0, padding: "28px 30px", borderRadius: 22, backgroundColor: i === 0 ? (press ? "#FFF0B8" : "#FFF8DA") : "#F5F7FA", border: i === 0 ? `4px solid ${COLORS.yellow}` : "4px solid transparent", fontFamily }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#3E8E5B" }}>{r.url}</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: i === 0 ? COLORS.navy : "#4A5470", marginTop: 6 }}>{r.title}</div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#5A6684", marginTop: 8 }}>{r.text}</div>
            </div>
          ))}
        </div>
        <Cursor x={cur.x} y={cur.y} press={press} />
      </Bezel>
    );
  }
  return (
    <Bezel>
      <Browser url="balago.kg" />
      <BalaGoPage f={f - clickAt - 4} routeAt={routeAt - clickAt - 4} />
    </Bezel>
  );
};

// строка поиска поднимается вверх, когда появляются результаты
const keysTop = (f: number, resultsAt: number) => 300 - 190 * easeInOut((f - resultsAt + 6) / 10);

const BalaGoPage: React.FC<{ f: number; routeAt: number }> = ({ f, routeAt }) => {
  const p = BG15_TEXT.page;
  const a = (at: number) => easeOut((f - at) / 10);
  const r = (f - routeAt) / 30;
  const formOut = easeInOut(r * 1.4);
  return (
    <div style={abs({ left: 0, top: 86, right: 0, bottom: 0, background: "linear-gradient(180deg, #FFFFFF, #F4F8FD)", fontFamily, color: COLORS.navy })}>
      <div style={abs({ left: -120, top: -140, width: 520, height: 520, borderRadius: 260, backgroundColor: COLORS.yellowSoft })} />
      <div style={abs({ left: 50, top: 50, display: "flex", alignItems: "center", gap: 24, opacity: a(0) })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 130, height: 130, borderRadius: 65, objectFit: "cover", boxShadow: "0 10px 26px rgba(20,40,90,0.18)" }} />
        <div>
          <div style={{ fontSize: 70, fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#2E4377", marginTop: 6 }}>{p.tagline}</div>
        </div>
      </div>
      {/* поля заявки */}
      <div style={abs({ left: 50, right: 50, top: 250, opacity: 1 - formOut, translate: `0 ${-formOut * 40}px` })}>
        {p.fields.map(([k, v], i) => (
          <div key={k} style={{ marginTop: i ? 22 : 0, opacity: a(6 + i * 6), translate: `${(1 - a(6 + i * 6)) * 40}px 0` }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.navySoft, marginBottom: 8 }}>{k}</div>
            <div style={{ height: 92, borderRadius: 18, border: "3px solid #C9D3E3", backgroundColor: "#FFFFFF", fontSize: 32, fontWeight: 700, color: "#9AA6BC", lineHeight: "86px", paddingLeft: 26 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* схема маршрута: линия от полей → ҮЙ → МЕКТЕП → ҮЙ */}
      <RouteScheme t={r} top={330} />
      <div style={abs({ left: 50, right: 50, top: 230, textAlign: "center", opacity: easeOut((r - 0.2) * 3) })}>
        <span style={{ padding: "12px 34px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 46, fontWeight: 900 }}>{p.route.join(" → ")}</span>
      </div>
      <div style={abs({ left: 50, right: 50, top: 1010, textAlign: "center", fontSize: 36, fontWeight: 800, color: COLORS.navySoft, opacity: easeOut((r - 0.9) * 2), lineHeight: 1.3 })}>{p.routeNote}</div>
    </div>
  );
};

// Схема ҮЙ → МЕКТЕП → ҮЙ: круговой маршрут (утро — вперёд, после уроков —
// обратно). t: 0 — нет, 1 — нарисована.
export const RouteScheme: React.FC<{ t: number; top?: number }> = ({ t, top = 300 }) => {
  const draw = clamp(t);
  const len = 1400;
  const pts = [
    { x: 160, y: 500, label: "ҮЙ", c: COLORS.yellow },
    { x: 776, y: 260, label: "МЕКТЕП", c: "#DDE8F6" },
    { x: 160, y: 500, label: "", c: COLORS.yellow },
  ];
  return (
    <div style={abs({ left: 0, right: 0, top, height: 700, opacity: easeOut(t * 3) })}>
      <svg width={976} height={700} style={abs({ left: 0, top: 0 })}>
        <path d="M 200 450 C 360 200, 560 160, 720 240" stroke={COLORS.navy} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - clamp(draw * 2))} />
        <path d="M 760 320 C 640 520, 420 600, 220 540" stroke="#3E7CC0" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - clamp(draw * 2 - 1))} />
        <path d="M 700 214 l 34 26 l -40 14 z" fill={COLORS.navy} opacity={clamp(draw * 2 - 0.9) * 10} />
        <path d="M 236 520 l -36 22 l 40 14 z" fill="#3E7CC0" opacity={clamp(draw * 2 - 1.9) * 10} />
      </svg>
      {pts.slice(0, 2).map((p, i) => (
        <div key={i} style={abs({ left: p.x - 120, top: p.y - 70, width: 240, height: 140, borderRadius: 30, backgroundColor: p.c, border: `5px solid ${COLORS.navy}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 900, fontSize: i === 1 ? 40 : 54, color: COLORS.navy, scale: `${0.6 + 0.4 * easeOut(draw * 3 - i * 0.9)}`, opacity: easeOut(draw * 3 - i * 0.9) })}>
          {p.label}
        </div>
      ))}
      <div style={abs({ left: 300, top: 60, fontFamily, fontSize: 30, fontWeight: 800, color: COLORS.navy, opacity: clamp(draw * 2 - 0.6) })}>эртең менен</div>
      <div style={abs({ left: 420, top: 590, fontFamily, fontSize: 30, fontWeight: 800, color: "#3E7CC0", opacity: clamp(draw * 2 - 1.6) })}>сабактан кийин</div>
    </div>
  );
};

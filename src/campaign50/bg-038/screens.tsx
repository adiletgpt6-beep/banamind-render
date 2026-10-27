// Экраны телефона мамы (крупные вставки, тексты кыргызча):
//   • переписка с классным руководителем: «Бүгүн бара албайт» —
//     обычное уведомление школы, сервис ничего автоматически не отменяет;
//   • сайт BalaGo, раздел о пропущенных днях — заголовок, текст и сноска
//     дословно с сайта (translations.ts, ky).
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS } from "../../config";
import { fontFamily } from "../../fonts";
import { StatusBar } from "../../two-schedules-2d/screens";
import { clamp, easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { box } from "./context";
import { BG38_TEXT } from "./script";
import { NAVY, NAVY_SOFT, YELLOW, YELLOW_SOFT } from "./sets";

const INK = "#1E2235";
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Кончик пальца с кругами нажатия (координаты экрана телефона).
export const Fingertip: React.FC<{ x: number; y: number; tapAt: number; f: number; a?: number }> = ({ x, y, tapAt, f, a = 1 }) => {
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [1, 0.86, 1], CL);
  const ring = clamp((f - tapAt) / 14);
  return a <= 0.01 ? null : (
    <div style={box({ left: x - 60, top: y - 60, width: 120, height: 120, opacity: a, pointerEvents: "none" })}>
      {f >= tapAt && ring < 1 ? (
        <div style={box({ left: 60 - 70 * ring, top: 60 - 70 * ring, width: 140 * ring, height: 140 * ring, borderRadius: "50%", border: `5px solid rgba(255,201,14,${1 - ring})`, boxSizing: "border-box" })} />
      ) : null}
      <div style={box({ left: 30, top: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(230,181,144,0.92)", border: "4px solid rgba(255,255,255,0.9)", boxSizing: "border-box", scale: `${press}`, boxShadow: "0 6px 14px rgba(20,30,60,0.3)" })} />
    </div>
  );
};

const Ticks: React.FC<{ color: string }> = ({ color }) => (
  <svg width={36} height={22} viewBox="0 0 36 22">
    <path d="M2 12l6 6L20 4M14 16l2 2L32 4" stroke={color} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Переписка: черновик в поле ввода → отправка (sendAt) → сообщение в чате.
export const TeacherChat: React.FC<{ f: number; sendAt: number }> = ({ f, sendAt }) => {
  const c = BG38_TEXT.chat;
  const sent = easeOut((f - sendAt) / 9);
  const ticks = clamp((f - sendAt - 14) / 8);
  return (
    <div style={box({ inset: 0, backgroundColor: "#EEF1F5", fontFamily, color: INK })}>
      <StatusBar time="07:42" />
      {/* шапка чата */}
      <div style={box({ left: 0, right: 0, top: 74, height: 120, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 18, padding: "0 26px", boxSizing: "border-box", boxShadow: "0 2px 0 #E1E6EE" })}>
        <span style={{ fontSize: 44, fontWeight: 900, color: NAVY_SOFT }}>‹</span>
        <div style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: "#9EC5E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: NAVY }}>К</div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{c.contact}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3FA36A" }}>{c.status}</div>
        </div>
      </div>
      {/* отправленное сообщение */}
      {sent > 0.01 ? (
        <div style={box({ right: 26, top: 520 + (1 - sent) * 60, maxWidth: 380, padding: "20px 24px 14px", borderRadius: "28px 28px 8px 28px", backgroundColor: "#DDF5E3", opacity: sent, boxShadow: "0 4px 10px rgba(20,30,60,0.08)" })}>
          <div style={{ fontSize: 33, fontWeight: 700, lineHeight: 1.25 }}>{c.message}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 8, fontSize: 22, fontWeight: 700, color: "#5C6B80" }}>
            07:42
            <Ticks color={ticks > 0.5 ? "#2F9BE0" : "#8C99AB"} />
          </div>
        </div>
      ) : null}
      {sent > 0.5 ? (
        <div style={box({ left: 0, right: 0, top: 860, textAlign: "center", fontSize: 26, fontWeight: 800, color: "#5C6B80", opacity: ticks })}>✓ {c.sent}</div>
      ) : null}
      {/* поле ввода: черновик до отправки */}
      <div style={box({ left: 18, right: 18, bottom: 30, minHeight: 92, padding: "16px 110px 16px 26px", borderRadius: 46, backgroundColor: "#FFFFFF", boxSizing: "border-box", fontSize: 30, fontWeight: 700, lineHeight: 1.25, color: f < sendAt ? INK : "#9AA6B8" })}>
        {f < sendAt ? c.message : c.input}
      </div>
      <div style={box({ right: 30, bottom: 40, width: 74, height: 74, borderRadius: 37, backgroundColor: f < sendAt ? "#3FA36A" : "#B7C2D0", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width={40} height={40} viewBox="0 0 24 24">
          <path d="M3 20 21 12 3 4v6l12 2-12 2z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};

// Сайт BalaGo: адресная строка, шапка, прокрутка к разделу о пропусках
// (scrollFrom…scrollTo), жёлтый маркер по «кийинки төлөмдө эске алабыз»
// (markAt) и по сноске «эң көбү бир айга» (noteAt).
export const RulesPage: React.FC<{ f: number; scrollFrom: number; scrollTo: number; markAt: number; noteAt: number }> = ({ f, scrollFrom, scrollTo, markAt, noteAt }) => {
  const p = BG38_TEXT.page;
  const scroll = easeInOut((f - scrollFrom) / Math.max(1, scrollTo - scrollFrom)) * 640;
  const mark = clamp((f - markAt) / 16);
  const note = clamp((f - noteAt) / 14);
  const [before, after] = p.body.split(p.highlight);
  const Bar: React.FC<{ w: number; c?: string }> = ({ w, c = "#E3E8F0" }) => <div style={{ width: w, height: 22, borderRadius: 11, backgroundColor: c }} />;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: INK, overflow: "hidden" })}>
      <StatusBar time="07:43" />
      {/* адресная строка */}
      <div style={box({ left: 22, right: 22, top: 76, height: 66, borderRadius: 33, backgroundColor: "#EEF1F5", display: "flex", alignItems: "center", gap: 12, padding: "0 24px", boxSizing: "border-box", fontSize: 28, fontWeight: 800, color: "#4A566B", zIndex: 2 })}>
        <svg width={24} height={24} viewBox="0 0 24 24">
          <path d="M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10zm2 0h6V8a3 3 0 0 0-6 0z" fill="#4A566B" />
        </svg>
        {p.url}
      </div>
      <div style={box({ left: 0, right: 0, top: 160, bottom: 0, overflow: "hidden" })}>
        <div style={box({ left: 0, right: 0, top: -scroll })}>
          {/* шапка сайта */}
          <div style={box({ left: 30, right: 30, top: 10, height: 120, display: "flex", alignItems: "center", gap: 20 })}>
            <Img src={staticFile(ASSETS.logo)} style={{ width: 100, height: 100, borderRadius: 50, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 44, fontWeight: 900, color: NAVY }}>{p.brand}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: NAVY_SOFT }}>{p.tagline}</div>
            </div>
          </div>
          {/* верх страницы (проматывается) */}
          <div style={box({ left: 30, right: 30, top: 160, height: 380, borderRadius: 30, backgroundColor: YELLOW_SOFT, padding: 30, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18 })}>
            <Bar w={320} c="#F2D46B" />
            <Bar w={380} />
            <Bar w={260} />
            <div style={{ marginTop: 20, width: 220, height: 64, borderRadius: 32, backgroundColor: YELLOW }} />
          </div>
          <div style={box({ left: 30, right: 30, top: 570, display: "flex", flexDirection: "column", gap: 18 })}>
            <Bar w={300} />
            <Bar w={400} />
          </div>
          {/* раздел о пропущенных днях */}
          <div style={box({ left: 24, right: 24, top: 690, padding: "30px 28px 34px", borderRadius: 32, backgroundColor: "#F4F8FD", border: `4px solid ${mark > 0 ? YELLOW : "#DCE5F2"}`, boxSizing: "border-box" })}>
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15, color: NAVY }}>{p.title}</div>
            <div style={{ marginTop: 18, fontSize: 30, fontWeight: 700, lineHeight: 1.35, color: "#2C3550" }}>
              {before}
              <span style={{ backgroundImage: `linear-gradient(90deg, ${YELLOW} ${mark * 100}%, transparent ${mark * 100}%)`, backgroundSize: "100% 62%", backgroundPosition: "0 85%", backgroundRepeat: "no-repeat", fontWeight: 900 }}>
                {p.highlight}
              </span>
              {after}
            </div>
            <div style={{ marginTop: 18, fontSize: 27, fontWeight: 800, lineHeight: 1.3, color: NAVY_SOFT, padding: "12px 16px", borderRadius: 18, backgroundColor: `rgba(255,201,14,${0.28 * note})` }}>{p.footnote}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Рука мамы, держащая телефон снизу: ладонь и рукав за корпусом
// (part="back", рисуется до телефона), спереди — только кончики пальцев
// на левой кромке и большой палец на правой (part="front"): экран не
// закрывается.
export const PhoneHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string; part: "back" | "front" }> = ({ x, y, w, sleeve, skin, part }) => {
  const h = w * 2.05;
  if (part === "back") {
    return (
      <>
        <div style={box({ left: x + w * 0.42, top: y + h * 0.8, width: w * 0.6, height: h * 0.7, borderRadius: w * 0.22, backgroundColor: sleeve, rotate: "-24deg", transformOrigin: "50% 0%" })} />
        <div style={box({ left: x + w * 0.1, top: y + h * 0.62, width: w * 0.86, height: w * 0.62, borderRadius: w * 0.3, backgroundColor: skin })} />
      </>
    );
  }
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.035, top: y + h * (0.6 + i * 0.075), width: w * 0.075, height: w * 0.11, borderRadius: w * 0.04, backgroundColor: skin, boxShadow: "2px 3px 6px rgba(20,30,60,0.18)" })} />
      ))}
      <div style={box({ left: x + w * 0.955, top: y + h * 0.7, width: w * 0.08, height: w * 0.2, borderRadius: w * 0.04, backgroundColor: skin, rotate: "-14deg", boxShadow: "-2px 3px 6px rgba(20,30,60,0.18)" })} />
    </>
  );
};

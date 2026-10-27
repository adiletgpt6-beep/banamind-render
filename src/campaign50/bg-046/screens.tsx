// Экраны телефона мамы (сцена 4): поиск → страница BalaGo с полями
// «Үйдүн дареги / Мектеп / Убакыт» → WhatsApp с подготовленным
// сообщением, которое мама отправляет сама (серая галочка «отправлено»,
// без имитации ответа или подтверждения сервера). Тексты кыргызча.
import { Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { clamp, easeOut } from "./rig/motion";
import { box } from "./shots";

const INK = "#1E2235";
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.66, top: y + h * 0.95, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: "-18deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x + w * 0.7, top: y + h * 0.84, width: w * 0.46, height: w * 0.5, borderRadius: w * 0.2, backgroundColor: skin, rotate: "-14deg" })} />
      <div style={box({ left: x + w * 0.9, top: y + h * 0.8, width: w * 0.12, height: w * 0.26, borderRadius: w * 0.06, backgroundColor: skin, rotate: "-32deg", boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.05, top: y + h * (0.72 + i * 0.07), width: w * 0.1, height: w * 0.11, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, нажимающий на экран (тень и лёгкое касание в момент tapAt).
export const TapFinger: React.FC<{ x: number; y: number; f: number; tapAt: number; skin: string }> = ({ x, y, f, tapAt, skin }) => {
  const a = interpolate(f, [tapAt - 22, tapAt - 8, tapAt + 10, tapAt + 22], [0, 1, 1, 0], CL);
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [0, 1, 0], CL);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x - 50 + 60 * (1 - a), top: y - 30 + 80 * (1 - a) + 10 * press, width: 100, height: 300, opacity: a })}>
      <div style={box({ left: 0, top: 0, width: 92, height: 300, borderRadius: 46, backgroundColor: skin, boxShadow: "0 18px 30px rgba(20,30,60,0.25)" })} />
      <div style={box({ left: 18, top: 14, width: 56, height: 46, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.35)" })} />
    </div>
  );
};

// ---------- поиск ----------
export const SearchScreen: React.FC<{ readonly f: number; readonly query: string; readonly result: string; readonly typeFrom: number; readonly typeTo: number; readonly tapAt: number }> = ({ f, query, result, typeFrom, typeTo, tapAt }) => {
  const n = Math.round(query.length * clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)));
  const caret = Math.floor(f / 8) % 2 === 0 && f < typeTo + 6;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="07:52" />
      <div style={box({ left: 30, right: 30, top: 110, height: 96, borderRadius: 48, backgroundColor: "#F1F4F9", border: "3px solid #DCE3EE", display: "flex", alignItems: "center", gap: 16, padding: "0 30px", fontSize: 36, fontWeight: 800, color: INK })}>
        <span style={{ fontSize: 40 }}>🔍</span>
        <span>
          {query.slice(0, n)}
          {caret ? <span style={{ color: "#3B6FD8" }}>|</span> : null}
        </span>
      </div>
      {f > typeTo + 4
        ? [0, 1, 2].map((i) => (
            <div
              key={i}
              style={box({
                left: 30,
                right: 30,
                top: 250 + i * 190,
                height: 160,
                borderRadius: 24,
                backgroundColor: i === 0 ? C.yellowSoft : "#F6F8FB",
                border: i === 0 ? `4px solid ${C.yellow}` : "3px solid #EEF1F6",
                padding: "22px 26px",
                boxSizing: "border-box",
                opacity: appear(f, typeTo + 4 + i * 4, 8),
                scale: i === 0 ? `${press}` : "1",
              })}
            >
              {i === 0 ? (
                <>
                  <div style={{ fontSize: 38, fontWeight: 900, color: C.navy }}>{result}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#5A6B8C", marginTop: 8 }}>Бишкек • ҮЙ → МЕКТЕП → ҮЙ</div>
                </>
              ) : (
                <>
                  <div style={{ width: 360 - i * 60, height: 26, borderRadius: 13, backgroundColor: "#E3E8F0" }} />
                  <div style={{ width: 440, height: 20, borderRadius: 10, backgroundColor: "#EDF0F5", marginTop: 18 }} />
                </>
              )}
            </div>
          ))
        : null}
    </div>
  );
};

// ---------- страница BalaGo ----------
export const SiteScreen: React.FC<{
  readonly f: number;
  readonly logo: string;
  readonly brand: string;
  readonly city: string;
  readonly fields: readonly { readonly label: string; readonly value: string }[];
  readonly fill: readonly number[]; // кадры заполнения полей
  readonly button: string;
  readonly tapAt: number;
}> = ({ f, logo, brand, city, fields, fill, button, tapAt }) => {
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.94, 1], CL);
  const kinds = ["🏠", "🏫", "🕗"];
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="07:53" />
      <div style={box({ left: 0, right: 0, top: 84, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: appear(f, 0, 8) })}>
        <Img src={staticFile(logo)} style={{ width: 170, height: 170, borderRadius: 85, objectFit: "cover" }} />
        <div style={{ fontSize: 66, fontWeight: 900, color: C.navy, lineHeight: 1.05 }}>{brand}</div>
        <div style={{ padding: "6px 22px", borderRadius: 999, backgroundColor: "#EAF0FA", fontSize: 30, fontWeight: 900, color: C.navy }}>📍 {city}</div>
      </div>
      {fields.map((fd, i) => {
        const done = clamp((f - fill[i]) / 8);
        return (
          <div key={fd.label} style={box({ left: 30, right: 30, top: 470 + i * 150, height: 128, borderRadius: 24, backgroundColor: done > 0 ? "#FFFBEA" : "#F4F6FA", border: `4px solid ${done > 0 ? C.yellow : "#E3E8F0"}`, padding: "14px 24px", boxSizing: "border-box", opacity: appear(f, 6 + i * 3, 8) })}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#5A6B8C" }}>
              {kinds[i]} {fd.label}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 36, fontWeight: 900, color: C.navy, marginTop: 4 }}>
              <span style={{ opacity: done }}>{fd.value}</span>
              <span style={{ color: C.green, fontSize: 44, opacity: done, transform: `scale(${0.6 + 0.4 * done})` }}>✓</span>
            </div>
          </div>
        );
      })}
      <div style={box({ left: 30, right: 30, top: 950, padding: "28px 0", borderRadius: 999, backgroundColor: "#25D366", color: "#FFFFFF", fontSize: 38, fontWeight: 900, textAlign: "center", scale: `${press}`, boxShadow: "0 10px 24px rgba(37,211,102,0.35)", opacity: appear(f, fill[fill.length - 1] + 6, 8) })}>
        {button}
      </div>
    </div>
  );
};

// ---------- WhatsApp: подготовленное сообщение, отправляет мама ----------
export const ChatScreen: React.FC<{ readonly f: number; readonly title: string; readonly message: string; readonly sendAt: number; readonly hint: string }> = ({ f, title, message, sendAt, hint }) => {
  const sent = clamp((f - sendAt) / 8);
  const press = interpolate(f, [sendAt - 4, sendAt, sendAt + 6], [1, 0.88, 1], CL);
  const lines = message.split("\n");
  return (
    <div style={box({ inset: 0, backgroundColor: "#EFE7DD" })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 190, backgroundColor: "#0F6E5A" })} />
      <div style={{ ...box({ left: 0, right: 0, top: 26 }), display: "flex", justifyContent: "space-between", padding: "0 44px", fontSize: 28, fontWeight: 800, color: "#FFFFFF" }}>
        <span>07:54</span>
        <span>▮▮▮</span>
      </div>
      <div style={box({ left: 30, top: 92, display: "flex", alignItems: "center", gap: 18 })}>
        <div style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, color: C.navy }}>B</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#FFFFFF" }}>{title}</div>
      </div>
      {/* отправленное сообщение: одна серая галочка — только «отправлено» */}
      {sent > 0 ? (
        <div style={box({ right: 26, top: 250 + (1 - sent) * 600, width: 470, padding: "22px 24px 16px", borderRadius: "28px 28px 6px 28px", backgroundColor: "#DCF8C6", boxShadow: "0 3px 0 rgba(0,0,0,0.08)", opacity: sent, fontSize: 31, fontWeight: 800, color: INK, lineHeight: 1.3 })}>
          {lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
          <div style={{ textAlign: "right", fontSize: 24, color: "#7A8A80", marginTop: 6 }}>07:54 ✓</div>
        </div>
      ) : null}
      {/* поле ввода с готовым текстом и кнопка отправки */}
      <div style={box({ left: 20, right: 130, bottom: 30, minHeight: 100, borderRadius: 40, backgroundColor: "#FFFFFF", padding: "18px 26px", boxSizing: "border-box", fontSize: 29, fontWeight: 800, color: INK, lineHeight: 1.28 })}>
        {sent < 1 ? lines.map((l) => <div key={l}>{l}</div>) : <span style={{ color: "#9AA3AE" }}>…</span>}
      </div>
      <div style={box({ right: 20, bottom: 34, width: 96, height: 96, borderRadius: 48, backgroundColor: "#0F9D76", display: "flex", alignItems: "center", justifyContent: "center", scale: `${press}` })}>
        <svg width={44} height={44} viewBox="0 0 24 24">
          <path d="M3 20 L21 12 L3 4 L3 10 L15 12 L3 14 Z" fill="#FFFFFF" />
        </svg>
      </div>
      <div style={box({ left: 30, right: 30, top: 214, textAlign: "center", fontSize: 26, fontWeight: 800, color: "#5E6B66", opacity: appear(f, 0, 10) })}>
        <span style={{ padding: "8px 18px", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.8)" }}>{hint}</span>
      </div>
    </div>
  );
};

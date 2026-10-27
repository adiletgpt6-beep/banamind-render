// Устройства BG-044 (HTML, absolute): телефон, экран формы сайта BalaGo,
// чат WhatsApp с подготовленным сообщением, ноутбук и карточка порядка
// оплаты. Все тексты — из BG44_TEXT (кыргызча), без эмодзи (иконки — SVG).
//   <Phone x={300} y={400} w={480} h={980}><SiteForm typed={[...]} /></Phone>
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeOut } from "../anim";
import { C } from "../palette";
import { BG44_TEXT, BG44_VIDEO } from "../script";

export const Phone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly tilt?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, tilt = 0, scale = 1, opacity = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `rotate(${tilt}deg) scale(${scale})`,
      transformOrigin: "50% 60%",
      opacity,
      borderRadius: w * 0.13,
      backgroundColor: "#1B2340",
      boxShadow: "0 30px 60px rgba(20,40,90,0.25)",
      padding: w * 0.035,
      boxSizing: "border-box",
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.1, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      {children}
      {/* «чёлка» камеры */}
      <div style={{ position: "absolute", left: "50%", top: w * 0.025, width: w * 0.22, height: w * 0.055, marginLeft: -w * 0.11, borderRadius: 99, backgroundColor: "#1B2340" }} />
    </div>
  </div>
);

const Logo: React.FC<{ readonly size: number }> = ({ size }) => (
  <Img src={staticFile(BG44_VIDEO.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", backgroundColor: "#FFFFFF" }} />
);

// Форма сайта: typed[i] — сколько символов значения поля i уже набрано;
// active — поле с курсором; buttonPressed 0…1 — нажатие кнопки.
export const SiteForm: React.FC<{
  readonly typed: readonly number[];
  readonly active?: number;
  readonly f: number;
  readonly buttonPressed?: number;
  readonly highlight?: number; // поле, подсвеченное жёлтым (сюда «влетает» карточка)
}> = ({ typed, active = -1, f, buttonPressed = 0, highlight = -1 }) => {
  const form = BG44_TEXT.cards.form;
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, backgroundColor: "#F6F8FC" }}>
      <div style={{ height: 118, backgroundColor: C.yellow, display: "flex", alignItems: "flex-end", padding: "0 28px 16px", gap: 14 }}>
        <Logo size={58} />
        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>BalaGo</div>
      </div>
      <div style={{ padding: "26px 28px 0" }}>
        <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 18 }}>{form.title}</div>
        {form.fields.map((fl, i) => {
          const n = Math.max(0, Math.min(fl.v.length, Math.floor(typed[i] ?? 0)));
          const hl = highlight === i;
          return (
            <div key={fl.k} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, marginBottom: 6, whiteSpace: "nowrap" }}>{fl.k}</div>
              <div
                style={{
                  height: 70,
                  borderRadius: 16,
                  backgroundColor: hl ? C.yellowSoft : "#FFFFFF",
                  border: `3px solid ${active === i ? C.navy : hl ? C.yellow : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 18px",
                  fontSize: 32,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {fl.v.slice(0, n)}
                {active === i && caret ? <span style={{ display: "inline-block", width: 3, height: 36, backgroundColor: C.navy, marginLeft: 2 }} /> : null}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 10,
            height: 86,
            borderRadius: 20,
            backgroundColor: C.whatsapp,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 30,
            fontWeight: 900,
            transform: `scale(${1 - 0.05 * clamp(buttonPressed)})`,
            boxShadow: `0 ${8 * (1 - clamp(buttonPressed))}px 0 ${C.whatsappDeep}`,
          }}
        >
          <ChatIcon size={38} />
          {form.button}
        </div>
      </div>
    </div>
  );
};

const ChatIcon: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 4 C10.6 4 4 10.4 4 18.6 C4 22.4 5.4 25.6 7.8 28.2 L6 35.5 L13.4 33 C15.4 33.8 17.6 34.2 20 34.2 C29.4 34.2 36 27.8 36 19.4 C36 10.6 29.4 4 20 4 Z" fill="none" stroke={color} strokeWidth={3.4} strokeLinejoin="round" />
    <path d="M14 14 C14 21 19 26 26 26" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
  </svg>
);

const PlaneIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M6 20 L34 8 L26 34 L20 23 Z" fill="#FFFFFF" />
    <path d="M20 23 L34 8" stroke="#00A884" strokeWidth={2.4} />
  </svg>
);

const Ticks: React.FC = () => (
  <svg width={34} height={20} viewBox="0 0 34 20">
    <path d="M2 11 L8 17 L20 4" fill="none" stroke="#8696A0" strokeWidth={3} strokeLinecap="round" />
    <path d="M13 15 L15 17 L27 4" fill="none" stroke="#8696A0" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

// Чат WhatsApp: сообщение подготовлено в поле ввода (lines); sendPressed
// 0…1 — палец на кнопке; sent 0…1 — сообщение уходит в «пузырь» с двумя
// серыми галочками. prior — более раннее отправленное сообщение (сверху).
// Никаких «заявка принята» — только отправленные самим родителем сообщения.
const Bubble: React.FC<{ readonly lines: readonly string[]; readonly time: string; readonly style?: React.CSSProperties }> = ({ lines, time, style }) => (
  <div
    style={{
      alignSelf: "flex-end",
      maxWidth: "88%",
      backgroundColor: "#D9FDD3",
      borderRadius: 18,
      padding: "14px 18px 34px",
      fontSize: 23,
      fontWeight: 700,
      lineHeight: 1.28,
      color: "#111B21",
      boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
      position: "relative",
      minWidth: 170,
      ...style,
    }}
  >
    {lines.map((ln) => (
      <div key={ln}>{ln}</div>
    ))}
    <div style={{ position: "absolute", right: 14, bottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 18, color: "#667781" }}>
      {time} <Ticks />
    </div>
  </div>
);

export const WhatsAppChat: React.FC<{
  readonly sendPressed?: number;
  readonly sent?: number;
  readonly lines?: readonly string[];
  readonly prior?: readonly string[];
  readonly time?: string;
  readonly priorTime?: string;
  readonly draftSize?: number;
}> = ({ sendPressed = 0, sent = 0, lines = BG44_TEXT.cards.whatsapp.lines, prior, time = "08:15", priorTime = "08:15", draftSize = 22 }) => {
  const wa = BG44_TEXT.cards.whatsapp;
  const s = clamp(sent);
  const fly = easeOut(s);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, backgroundColor: "#EFE7DE" }}>
      {/* фон-узор */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={(i * 97) % 520} cy={(i * 151) % 1100} r={6} fill="#D9CFC3" />
        ))}
      </svg>
      <div style={{ position: "relative", height: 132, backgroundColor: "#008069", display: "flex", alignItems: "flex-end", gap: 16, padding: "0 22px 18px", color: "#FFFFFF" }}>
        <svg width={26} height={36} viewBox="0 0 26 36">
          <path d="M20 4 L6 18 L20 32" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Logo size={64} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1 }}>{wa.chat}</div>
          <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.85 }}>WhatsApp</div>
        </div>
      </div>
      {/* отправленные сообщения */}
      <div style={{ position: "absolute", left: 18, right: 18, top: 160, display: "flex", flexDirection: "column", gap: 14 }}>
        {prior ? <Bubble lines={prior} time={priorTime} /> : null}
        {s > 0 ? <Bubble lines={lines} time={time} style={{ opacity: clamp(s * 3), transform: `translateY(${(1 - fly) * 420}px)` }} /> : null}
      </div>
      {/* поле ввода с подготовленным сообщением */}
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 22, display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 26,
            padding: s > 0 ? "18px 20px" : "16px 20px",
            fontSize: draftSize,
            fontWeight: 700,
            lineHeight: 1.28,
            color: "#111B21",
            minHeight: 34,
          }}
        >
          {s > 0 ? <span style={{ color: "#8696A0" }}>…</span> : lines.map((ln) => <div key={ln}>{ln}</div>)}
        </div>
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 43,
            backgroundColor: "#00A884",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - 0.12 * clamp(sendPressed)})`,
            flexShrink: 0,
          }}
        >
          <PlaneIcon size={46} />
        </div>
      </div>
    </div>
  );
};

// Ноутбук: x, y — левый верх экрана; w — ширина экрана.
export const Laptop: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly children?: React.ReactNode }> = ({ x, y, w, children }) => {
  const h = w * 0.66;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + w * 0.08 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: 26, backgroundColor: "#1B2340", padding: 18, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", backgroundColor: "#FFFFFF" }}>{children}</div>
      </div>
      <div style={{ position: "absolute", left: -w * 0.06, top: h, width: w * 1.12, height: w * 0.045, borderRadius: "6px 6px 24px 24px", backgroundColor: "#C9D1DD" }} />
      <div style={{ position: "absolute", left: w * 0.4, top: h, width: w * 0.2, height: w * 0.014, borderRadius: "0 0 10px 10px", backgroundColor: "#AEB8C8" }} />
    </div>
  );
};

// Карточка «Төлөм тартиби» как на сайте: visible — сколько шагов видно
// (дробная часть — появление следующего), highlight — подсвеченные шаги.
// Над шагами — условие «Топ түзүлгөндөн кийин» (первая поездка — после
// формирования группы).
export const PaymentSteps: React.FC<{ readonly visible: number; readonly highlight?: readonly number[]; readonly fontSize?: number }> = ({ visible, highlight = [], fontSize = 30 }) => {
  const d = BG44_TEXT.decision;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, backgroundColor: "#F6F8FC" }}>
      <div style={{ height: 78, backgroundColor: C.yellow, display: "flex", alignItems: "center", gap: 14, padding: "0 26px" }}>
        <Logo size={52} />
        <div style={{ fontSize: 34, fontWeight: 900 }}>BalaGo</div>
      </div>
      <div style={{ padding: "18px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: fontSize * 1.2, fontWeight: 900 }}>{d.title}</div>
          <div style={{ padding: "6px 16px", borderRadius: 999, backgroundColor: C.navy, color: C.white, fontSize: fontSize * 0.8, fontWeight: 800 }}>{d.when}</div>
        </div>
        {d.steps.map((st, i) => {
          const a = clamp(visible - i);
          const hl = highlight.includes(i);
          return (
            <div
              key={st}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 10,
                padding: "8px 14px",
                borderRadius: 16,
                backgroundColor: hl ? C.yellowSoft : "#FFFFFF",
                border: `3px solid ${hl ? C.yellow : C.line}`,
                opacity: a,
                transform: `translateX(${(1 - easeOut(a)) * 40}px)`,
              }}
            >
              <div style={{ width: fontSize * 1.35, height: fontSize * 1.35, borderRadius: fontSize, backgroundColor: hl ? C.navy : C.yellow, color: hl ? C.yellow : C.navy, fontSize: fontSize * 0.8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ fontSize, fontWeight: 800, lineHeight: 1.12 }}>{st}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Телефон мамы крупным планом: экран сайта BalaGo с формой заявки и
// предзаполненный чат WhatsApp. Подписи — дословно с сайта (BG30_TEXT.site);
// значения условные (адрес скрыт точками). После «Арыз калтыруу» сайт лишь
// открывает чат — никакого «заявка принята»; сообщение отправляет мама.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "../anim";
import { C } from "../palette";
import { BG30_TEXT, BG30_VIDEO } from "../script";
import { ArrowGlyph } from "./ui";

export const PHONE = { x: 290, y: 300, w: 500, h: 1010, r: 64, bezel: 16 } as const;
const SW = PHONE.w - PHONE.bezel * 2;
const SH = PHONE.h - PHONE.bezel * 2;

// Значение с «●» — скрытые символы рисуются кружками (в шрифте их нет).
export const Masked: React.FC<{ readonly text: string; readonly size: number; readonly color?: string }> = ({ text, size, color = C.navy }) => (
  <>
    {text.split(/(●+)/).map((part, i) =>
      part.startsWith("●") ? (
        <span key={i} style={{ display: "inline-flex", gap: size * 0.12, margin: `0 ${size * 0.06}px`, verticalAlign: "middle" }}>
          {[...part].map((_, k) => (
            <span key={k} style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, backgroundColor: color, opacity: 0.85, display: "inline-block" }} />
          ))}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

// Часть значения, «набранная» к доле p (●-группы — по одному кружку).
const typed = (text: string, p: number) => {
  const chars = [...text];
  const n = Math.round(chars.length * clamp(p));
  return chars.slice(0, n).join("");
};

const Field: React.FC<{ readonly label: string; readonly value: string; readonly p: number; readonly focus: number; readonly placeholder?: string; readonly f: number }> = ({ label, value, p, focus, placeholder, f }) => {
  const shown = typed(value, p);
  const caret = focus > 0.5 && Math.floor(f / 12) % 2 === 0;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#38465C", marginBottom: 7 }}>{label}</div>
      <div
        style={{
          height: 54,
          borderRadius: 14,
          border: `2px solid ${focus > 0.5 ? "#267EF5" : "#CFD8E3"}`,
          boxShadow: focus > 0.5 ? "0 0 0 4px #D9ECFF" : "none",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontSize: 21,
          fontWeight: 700,
          color: "#16233A",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {shown ? <Masked text={shown} size={21} color="#16233A" /> : <span style={{ color: "#7C8FA8", fontWeight: 600 }}>{placeholder ?? ""}</span>}
        {caret ? <span style={{ width: 2.5, height: 26, backgroundColor: "#267EF5", marginLeft: 2 }} /> : null}
      </div>
    </div>
  );
};

export type SiteState = {
  readonly scroll: number; // 0 — начало страницы, 1 — форма
  readonly typed: readonly number[]; // доля набранного по 4 полям
  readonly focus: number; // индекс активного поля (−1 — нет)
  readonly consent: number; // 0…1
  readonly press: number; // 0…1 — нажатие кнопки
};

export const SiteScreen: React.FC<{ readonly f: number; readonly s: SiteState }> = ({ f, s }) => {
  const T = BG30_TEXT.site;
  const offset = lerp(0, -1390, easeInOut(s.scroll));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SW, transform: `translateY(${offset}px)` }}>
        {/* первый экран сайта */}
        <div style={{ height: 600, padding: "100px 26px 0", background: "linear-gradient(180deg, #EEF6FF, #FFFFFF)", boxSizing: "border-box" }}>
          <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 99, backgroundColor: "#FFF7B3", color: "#16233A", fontWeight: 800, fontSize: 18 }}>{T.heroBadge}</div>
          {[0.92, 0.78, 0.86].map((w, i) => (
            <div key={i} style={{ height: 30, width: `${w * 100}%`, borderRadius: 10, backgroundColor: "#16233A", opacity: 0.85, marginTop: i ? 12 : 26 }} />
          ))}
          {[0.95, 0.7].map((w, i) => (
            <div key={i} style={{ height: 16, width: `${w * 100}%`, borderRadius: 8, backgroundColor: "#A9B8CA", marginTop: i ? 10 : 24 }} />
          ))}
          <div style={{ marginTop: 30, display: "inline-block", padding: "16px 30px", borderRadius: 99, backgroundColor: C.blue, color: "#FFFFFF", fontWeight: 800, fontSize: 21 }}>{T.button}</div>
        </div>
        {/* следующие блоки сайта */}
        <div style={{ height: 300, padding: "20px 26px", boxSizing: "border-box" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ height: 116, borderRadius: 18, backgroundColor: "#F5F7FA", border: "1px solid #E8ECF2", marginBottom: 18 }} />
          ))}
        </div>
        {/* форма заявки */}
        <div style={{ padding: "0 22px" }}>
          <div style={{ color: "#1A63D6", fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>{T.eyebrow.toUpperCase()}</div>
          <div style={{ color: "#16233A", fontWeight: 900, fontSize: 30, lineHeight: 1.15, marginTop: 8 }}>{T.title}</div>
          {[0.96, 0.6].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, backgroundColor: "#CFD8E3", marginTop: i ? 9 : 16 }} />
          ))}
          <div style={{ marginTop: 22, padding: "20px 18px 24px", borderRadius: 22, border: "1px solid #E8ECF2", boxShadow: "0 8px 24px -8px rgba(22,35,58,0.12)", backgroundColor: "#FFFFFF" }}>
            {["Ата-эненин аты", "Телефон", "Баланын аты"].map((l) => (
              <Field key={l} label={l} value="●●●●" p={1} focus={0} f={f} />
            ))}
            <Field label={T.above.label} value={T.above.value} p={1} focus={0} f={f} />
            {T.fields.map((fd, i) => (
              <Field key={fd.label} label={fd.label} value={fd.value} p={s.typed[i] ?? 0} focus={s.focus === i ? 1 : 0} f={f} />
            ))}
            <Field label={`${T.comment.label} ${T.comment.optional}`} value="" p={0} focus={0} f={f} />
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, color: "#38465C", fontWeight: 600, lineHeight: 1.3, marginTop: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, flex: "none", border: `2px solid ${s.consent > 0.5 ? C.blue : "#A9B8CA"}`, backgroundColor: s.consent > 0.5 ? C.blue : "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.consent > 0.5 ? (
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <path d="M3 8.5 L6.5 12 L13 4.5" stroke="#FFF" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  </svg>
                ) : null}
              </div>
              {T.consent}
            </div>
            <div
              style={{
                marginTop: 22,
                height: 66,
                borderRadius: 99,
                backgroundColor: s.press > 0.5 ? "#164EA8" : C.blue,
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 23,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${1 - 0.04 * Math.sin(Math.PI * clamp(s.press))})`,
              }}
            >
              {T.button}
            </div>
          </div>
          <div style={{ height: 400 }} />
        </div>
      </div>
      {/* шапка сайта — закреплена */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 84, backgroundColor: "rgba(255,255,255,0.97)", borderBottom: "1px solid #E8ECF2", display: "flex", alignItems: "center", padding: "26px 22px 0", boxSizing: "border-box", gap: 12 }}>
        <Img src={staticFile(BG30_VIDEO.logo)} style={{ width: 46, height: 46, borderRadius: 99 }} />
        <div style={{ fontWeight: 900, fontSize: 25, color: "#16233A" }}>{T.brand}</div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 26, height: 3.5, borderRadius: 3, backgroundColor: "#16233A" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaneIcon: React.FC = () => (
  <svg width={28} height={28} viewBox="0 0 24 24">
    <path d="M3 20 L21 12 L3 4 L5.5 11 L14 12 L5.5 13 Z" fill="#FFFFFF" />
  </svg>
);

export const ChatScreen: React.FC<{ readonly f: number; readonly sent: number; readonly press: number }> = ({ sent, press }) => {
  const T = BG30_TEXT.site.chat;
  const lines = (
    <>
      <div>{T.greeting}</div>
      <div style={{ height: 8 }} />
      {T.rows.map(([k, v]) => (
        <div key={k}>
          <span style={{ fontWeight: 800 }}>{k}</span>{" "}
          {v.includes("→")
            ? v.split("→").map((p, i) => (
                <span key={i}>
                  {i ? <ArrowGlyph /> : null}
                  {p}
                </span>
              ))
            : <Masked text={v} size={18} color="#111B21" />}
        </div>
      ))}
    </>
  );
  const up = easeOut(sent);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#EFEAE2", fontFamily, overflow: "hidden" }}>
      {/* фон-узор чата */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 97) % SW, top: 120 + ((i * 61) % (SH - 200)), width: 18, height: 18, borderRadius: 6, border: "2px solid #DDD5C9", transform: `rotate(${i * 23}deg)` }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 112, backgroundColor: "#008069", display: "flex", alignItems: "flex-end", padding: "0 18px 16px", boxSizing: "border-box", gap: 12, color: "#FFFFFF" }}>
        <svg width={26} height={26} viewBox="0 0 24 24">
          <path d="M15 4 L7 12 L15 20" stroke="#FFF" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ width: 48, height: 48, borderRadius: 99, backgroundColor: "#DFE5E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={30} height={30} viewBox="0 0 24 24">
            <circle cx={12} cy={9} r={4.5} fill="#FFF" />
            <path d="M3.5 21 Q12 12 20.5 21 Z" fill="#FFF" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 23 }}>{T.phone}</div>
          <div style={{ fontSize: 15, opacity: 0.85 }}>WhatsApp</div>
        </div>
      </div>
      {/* отправленное сообщение (без отметок доставки и без ответа) */}
      {sent > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: lerp(SH - 520, 150, up),
            maxWidth: SW - 70,
            padding: "12px 14px 26px",
            borderRadius: 16,
            backgroundColor: C.bubble,
            fontSize: 18,
            lineHeight: 1.32,
            color: "#111B21",
            boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
            opacity: clamp(sent * 3),
          }}
        >
          {lines}
          <div style={{ position: "absolute", right: 12, bottom: 6, fontSize: 13, color: "#667781" }}>08:15</div>
        </div>
      ) : null}
      {/* поле ввода с предзаполненным текстом */}
      <div style={{ position: "absolute", left: 12, right: 82, bottom: 24, padding: "14px 16px", borderRadius: 26, backgroundColor: "#FFFFFF", fontSize: 18, lineHeight: 1.32, color: "#111B21", minHeight: 30 }}>
        {sent > 0 ? <span style={{ color: "#8696A0" }}> </span> : lines}
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 24,
          width: 62,
          height: 62,
          borderRadius: 99,
          backgroundColor: "#00A884",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 - 0.12 * Math.sin(Math.PI * clamp(press))})`,
        }}
      >
        <PlaneIcon />
      </div>
    </div>
  );
};

export const PhoneFrame: React.FC<{ readonly children: React.ReactNode; readonly dx?: number; readonly dy?: number; readonly rot?: number }> = ({ children, dx = 0, dy = 0, rot = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: PHONE.x + dx,
      top: PHONE.y + dy,
      width: PHONE.w,
      height: PHONE.h,
      borderRadius: PHONE.r,
      backgroundColor: "#1B2030",
      boxShadow: "0 30px 60px rgba(20,30,60,0.35)",
      transform: `rotate(${rot}deg)`,
    }}
  >
    <div style={{ position: "absolute", left: PHONE.bezel, top: PHONE.bezel, width: SW, height: SH, borderRadius: PHONE.r - 14, overflow: "hidden", backgroundColor: "#FFFFFF" }}>{children}</div>
    <div style={{ position: "absolute", left: PHONE.w / 2 - 14, top: PHONE.bezel + 12, width: 28, height: 28, borderRadius: 99, backgroundColor: "#0E121B" }} />
  </div>
);

// Точки экрана телефона в координатах кадра (для пальца).
export const screenPt = (x: number, y: number) => ({ x: PHONE.x + PHONE.bezel + x, y: PHONE.y + PHONE.bezel + y });
export const SCREEN = { w: SW, h: SH } as const;

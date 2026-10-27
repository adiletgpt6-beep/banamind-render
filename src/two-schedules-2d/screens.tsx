// Крупные вставки: экраны телефона и ноутбука, листок с планом дня,
// страница BalaGo и предварительная заявка. Тексты — кыргызча, крупные,
// короткими строками и на экране достаточно долго для чтения с телефона.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";
import { clamp, easeOut } from "./rig/motion";
import { TS2_TEXT } from "./script";
import { box } from "./shots";

const INK = "#1E2235";
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StatusBar: React.FC<{ time: string; dark?: boolean }> = ({ time, dark }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: dark ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Корпус телефона для крупного плана; дети — содержимое экрана.
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; shake?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, shake = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x + shake, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string; side?: 1 | -1 }> = ({ x, y, w, sleeve, skin, side = 1 }) => {
  const h = w * 2.05;
  const sx = side > 0 ? x + w * 0.62 : x - w * 0.2;
  return (
    <>
      <div style={box({ left: sx, top: y + h * 0.78, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: `${side * -18}deg`, transformOrigin: "50% 0%" })} />
      <div style={box({ left: side > 0 ? x + w * 0.66 : x - w * 0.12, top: y + h * 0.6, width: w * 0.46, height: w * 0.62, borderRadius: w * 0.2, backgroundColor: skin, rotate: `${side * -14}deg` })} />
      <div style={box({ left: side > 0 ? x + w * 0.84 : x - w * 0.04, top: y + h * 0.56, width: w * 0.13, height: w * 0.3, borderRadius: w * 0.07, backgroundColor: skin, rotate: `${side * -32}deg`, boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: side > 0 ? x - w * 0.05 : x + w * 0.96, top: y + h * (0.62 + i * 0.08), width: w * 0.1, height: w * 0.12, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Аватар контакта «Кызым»: круг с буквой (и расходящиеся кольца звонка).
const Avatar: React.FC<{ size: number; ring?: number }> = ({ size, ring = 0 }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {ring > 0
      ? [0, 1].map((i) => {
          const k = (ring + i * 0.5) % 1;
          return <div key={i} style={box({ left: -size * 0.45 * k, top: -size * 0.45 * k, width: size * (1 + 0.9 * k), height: size * (1 + 0.9 * k), borderRadius: "50%", border: "4px solid rgba(255,255,255,0.7)", opacity: 1 - k, boxSizing: "border-box" })} />;
        })
      : null}
    <div style={box({ inset: 0, borderRadius: "50%", backgroundColor: "#F2C14E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.48, fontWeight: 900, color: INK })}>{TS2_TEXT.call.contact[0]}</div>
  </div>
);

const PhoneGlyph: React.FC<{ rot?: number; size?: number }> = ({ rot = 0, size = 74 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ rotate: `${rot}deg` }}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="#FFFFFF" />
  </svg>
);

// Входящий звонок «Кызым» → разговор (после answerAt).
export const CallScreen: React.FC<{ f: number; answerAt: number }> = ({ f, answerAt }) => {
  const c = TS2_TEXT.call;
  const talking = f >= answerAt;
  const sec = Math.max(0, Math.floor((f - answerAt) / 30));
  const press = interpolate(f, [answerAt - 4, answerAt, answerAt + 6], [1, 0.9, 1], CL);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #3D5A80, #22324F)", color: "#FFFFFF" })}>
      <StatusBar time="12:47" dark />
      <div style={box({ left: 0, right: 0, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 })}>
        <Avatar size={190} ring={talking ? 0 : (f / 34) % 1} />
        <div style={{ fontSize: 92, fontWeight: 900, marginTop: 20 }}>{c.contact}</div>
        <div style={{ fontSize: 42, fontWeight: 700, opacity: 0.9 }}>{talking ? `${c.talking} · 00:${String(sec).padStart(2, "0")}` : c.status}</div>
      </div>
      {talking ? null : (
        <div style={box({ left: 50, right: 50, bottom: 120, display: "flex", justifyContent: "space-between" })}>
          {[
            { label: c.decline, color: "#E2433A", rot: 135 },
            { label: c.accept, color: "#3FB86A", rot: 0 },
          ].map((b, i) => (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, scale: i === 1 ? `${press}` : "1" }}>
              <div style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: b.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneGlyph rot={b.rot} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{b.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Переписка с дочерью: её сообщение, затем голосовой ответ мамы
// (запись с recFrom, отправлено в sentAt).
export const ChatScreen: React.FC<{ f: number; msgAt: number; recFrom: number; sentAt: number; voiceSec: number }> = ({ f, msgAt, recFrom, sentAt, voiceSec }) => {
  const t = TS2_TEXT.chat;
  const msg = appear(f, msgAt, 9);
  const recording = f >= recFrom && f < sentAt;
  const sent = appear(f, sentAt, 9);
  const recSec = Math.max(0, Math.floor((f - recFrom) / 30));
  const bars = (n: number, live: boolean) =>
    Array.from({ length: n }).map((_, i) => {
      const h = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + (live ? f / 3 : 0)) * Math.cos(i * 0.6));
      return <div key={i} style={{ width: 7, height: 10 + 44 * h, borderRadius: 4, backgroundColor: live ? "#E2433A" : "#3A4F80", opacity: live ? 0.8 : 0.75, flex: "none" }} />;
    });
  return (
    <div style={box({ inset: 0, backgroundColor: "#EEF1F6" })}>
      <StatusBar time={f >= sentAt ? t.voiceTime : t.msgTime} />
      <div style={box({ left: 0, right: 0, top: 80, height: 130, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, padding: "0 30px", boxShadow: "0 4px 12px rgba(20,30,60,0.06)" })}>
        <div style={{ fontSize: 40, color: "#5A6B8C" }}>‹</div>
        <Avatar size={76} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: INK }}>{t.contact}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3E8E5E" }}>{t.online}</div>
        </div>
      </div>
      <div style={box({ left: 26, right: 26, top: 270, display: "flex", flexDirection: "column", gap: 26 })}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "92%",
            padding: "26px 30px",
            borderRadius: "34px 34px 34px 10px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 6px 16px rgba(20,30,60,0.10)",
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.2,
            color: INK,
            opacity: msg,
            scale: `${0.94 + 0.06 * msg}`,
            transformOrigin: "0% 100%",
          }}
        >
          {t.msg}
          <div style={{ fontSize: 26, color: "#8A96AE", textAlign: "right", marginTop: 6 }}>{t.msgTime}</div>
        </div>
        {f >= sentAt ? (
          <div
            style={{
              alignSelf: "flex-end",
              width: "80%",
              padding: "22px 26px",
              borderRadius: "34px 34px 10px 34px",
              backgroundColor: "#D7ECFF",
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: sent,
              translate: `0 ${(1 - sent) * 30}px`,
            }}
          >
            <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.navy, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <div style={{ width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: "24px solid #FFFFFF", marginLeft: 6 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, overflow: "hidden" }}>{bars(20, false)}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#3A4F80" }}>0:{String(voiceSec).padStart(2, "0")}</div>
          </div>
        ) : null}
      </div>
      {/* нижняя панель: поле ввода или запись голосового */}
      <div style={box({ left: 26, right: 26, bottom: 30, height: 110, borderRadius: 55, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 18, padding: "0 30px" })}>
        {recording ? (
          <>
            <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#E2433A", opacity: 0.55 + 0.45 * Math.abs(Math.sin(f / 8)), flex: "none" }} />
            <div style={{ fontSize: 34, fontWeight: 800, color: INK }}>0:{String(recSec).padStart(2, "0")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, overflow: "hidden" }}>{bars(26, true)}</div>
          </>
        ) : (
          <div style={{ fontSize: 32, color: "#A3ADC2", flex: 1 }}>…</div>
        )}
        <div style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: recording ? "#E2433A" : COLORS.navy, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width={36} height={36} viewBox="0 0 24 24">
            <rect x={8} y={2} width={8} height={13} rx={4} fill="#FFFFFF" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Экран ноутбука: рабочий документ. Готовые абзацы — серые полосы (без
// мелкого псевдотекста); строка, которую мама печатает, — крупно, с курсором.
export const LaptopScreen: React.FC<{ f: number; typeFrom: number; typeTo: number; dim?: number }> = ({ f, typeFrom, typeTo, dim = 0 }) => {
  const t = TS2_TEXT.laptop;
  const typed = clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom));
  const shown = t.typed.slice(0, Math.round(t.typed.length * typed));
  const cursor = Math.floor(f / 16) % 2 === 0 || (f >= typeFrom && f < typeTo);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: INK })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 74, backgroundColor: "#2F5D9E", display: "flex", alignItems: "center", gap: 14, padding: "0 28px", color: "#FFFFFF", fontSize: 32, fontWeight: 800 })}>
        <div style={{ width: 34, height: 40, borderRadius: 6, backgroundColor: "#FFFFFF", opacity: 0.9 }} />
        {t.app}
        <div style={{ marginLeft: "auto", padding: "6px 18px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)", fontSize: 26 }}>{t.progress}</div>
      </div>
      <div style={box({ left: 60, right: 60, top: 120, display: "flex", flexDirection: "column", gap: 22 })}>
        <div style={{ fontSize: 56, fontWeight: 900 }}>{t.title}</div>
        {[0.95, 0.88, 0.92, 0.6].map((w, i) => (
          <div key={i} style={{ width: `${w * 100}%`, height: 18, borderRadius: 9, backgroundColor: "#D9DFE9" }} />
        ))}
        <div style={{ fontSize: 40, fontWeight: 900, color: "#2F5D9E", marginTop: 14 }}>{t.task}</div>
        <div style={{ fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", minHeight: 60 }}>
          {shown}
          <span style={{ display: "inline-block", width: 5, height: 52, marginLeft: 4, backgroundColor: INK, opacity: cursor ? 1 : 0 }} />
        </div>
      </div>
      <div style={box({ inset: 0, backgroundColor: "#0E1424", opacity: dim })} />
    </div>
  );
};

// Утренний листок с планом дня (бумага, крупно).
// rows — кадры появления строк (сын, иш, дочь); по умолчанию по очереди.
export const PlanCard: React.FC<{ f: number; at: number; rows?: readonly number[] }> = ({ f, at, rows }) => {
  const t = TS2_TEXT.plan;
  const row = (i: number): React.CSSProperties => {
    const a = appear(f, rows?.[i] ?? at + 8 + i * 9, 10);
    return { opacity: a, translate: `${(1 - a) * -24}px 0` };
  };
  const Icon: React.FC<{ kind: "son" | "laptop" | "daughter" }> = ({ kind }) => (
    <div style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: kind === "laptop" ? "#E7EDF6" : kind === "son" ? "#DDF0E5" : "#FBE1E5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <svg width={56} height={56} viewBox="0 0 40 40">
        {kind === "laptop" ? (
          <g>
            <rect x={7} y={9} width={26} height={17} rx={2} fill="#2F5D9E" />
            <rect x={4} y={27} width={32} height={4} rx={2} fill="#5A6B8C" />
          </g>
        ) : (
          <g fill={kind === "son" ? "#3E9C6B" : "#E5677A"}>
            <circle cx={20} cy={14} r={7} />
            <path d="M8 34 Q20 18 32 34 Z" />
          </g>
        )}
      </svg>
    </div>
  );
  return (
    <div style={box({ left: 0, top: 0, width: 780, padding: "46px 52px 56px", borderRadius: 18, backgroundColor: "#FFFDF6", boxShadow: "0 30px 60px rgba(60,40,20,0.28)", fontFamily, color: INK, display: "flex", flexDirection: "column", gap: 30 })}>
      <div style={{ fontSize: 60, fontWeight: 900, opacity: appear(f, at, 10) }}>{t.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 70, fontWeight: 900, ...row(0) }}>
        <Icon kind="son" />
        {t.son}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 54, fontWeight: 800, color: "#2F5D9E", ...row(1) }}>
        <Icon kind="laptop" />
        {t.work}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 70, fontWeight: 900, ...row(2) }}>
        <Icon kind="daughter" />
        {t.daughter}
      </div>
    </div>
  );
};

const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? COLORS.yellow : COLORS.navy} />
    {kind === "home" ? (
      <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={COLORS.navy} />
    ) : (
      <g fill="#FFFFFF">
        <path d="M 24 46 L 50 28 L 76 46 Z" />
        <rect x={30} y={46} width={40} height={28} />
        <rect x={45} y={58} width={10} height={16} fill={COLORS.navy} />
      </g>
    )}
  </svg>
);

// Информация о BalaGo: маршрут ҮЙ → МЕКТЕП → ҮЙ, статус предварительной
// регистрации, кнопка.
export const BalaGoPage: React.FC<{ f: number; tapAt?: number }> = ({ f, tapAt }) => {
  const p = TS2_TEXT.page;
  const route = clamp((f - 10) / 36);
  const press = tapAt !== undefined ? interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL) : 1;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="20:46" />
      <div style={box({ left: 0, right: 0, top: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 170, height: 170, borderRadius: 85, objectFit: "cover" }} />
        <div style={{ fontSize: 70, fontWeight: 900, color: COLORS.navy }}>{p.brand}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
      </div>
      <div style={box({ left: 40, right: 40, top: 480, height: 180, borderRadius: 30, backgroundColor: COLORS.yellowSoft })}>
        <svg width="100%" height="100%" viewBox="0 0 560 180" style={box({ inset: 0 })}>
          <path d="M 80 70 L 480 70" stroke={COLORS.navy} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.25} />
          <path d={`M 80 70 L ${80 + 400 * route} 70`} stroke={COLORS.navy} strokeWidth={6} fill="none" />
        </svg>
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={box({ left: 30 + i * 200, top: 18, width: 104, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 + 0.6 * clamp(route * 2.2 - i * 0.6 + 0.2) })}>
            <RouteIcon kind={k} size={96} />
            <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.navy }}>{p.route[i]}</div>
          </div>
        ))}
      </div>
      <div style={box({ left: 40, right: 40, top: 700, padding: "24px 0", borderRadius: 24, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 38, fontWeight: 900, textAlign: "center" })}>{p.status}</div>
      <div style={box({ left: 40, right: 40, top: 830, padding: "28px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 44, fontWeight: 900, textAlign: "center", scale: `${press}`, boxShadow: "0 10px 24px rgba(255,201,14,0.4)" })}>{TS2_TEXT.cta.button}</div>
    </div>
  );
};

// Предварительная заявка: поля заполняются, «Арыз калтыруу» →
// «Алдын ала арыз калтырылды» — для обсуждения маршрута и времени
// (без подтверждения поездок и бронирования).
export const RegForm: React.FC<{ f: number; fills: readonly number[]; tapAt: number; sentAt: number }> = ({ f, fills, tapAt, sentAt }) => {
  const t = TS2_TEXT.form;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL);
  const sent = appear(f, sentAt, 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA" })}>
      <StatusBar time="20:48" />
      <div style={box({ left: 40, right: 40, top: 100, display: "flex", alignItems: "center", gap: 18 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 90, height: 90, borderRadius: 45, objectFit: "cover" }} />
        <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.navy }}>{t.title}</div>
      </div>
      {t.fields.map(([label, value], i) => {
        const typed = clamp((f - fills[i]) / 14);
        const shown = value.slice(0, Math.round(value.length * typed));
        return (
          <div key={label} style={box({ left: 40, right: 40, top: 236 + i * 160, display: "flex", flexDirection: "column", gap: 8 })}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 90, borderRadius: 20, backgroundColor: "#FFFFFF", border: `3px solid ${f >= fills[i] && typed < 1 ? COLORS.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 40, fontWeight: 800, color: INK }}>{shown}</div>
          </div>
        );
      })}
      <div style={box({ left: 40, right: 40, top: 900, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 42, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - sent })}>{t.send}</div>
      <div style={box({ left: 40, right: 40, top: 870, padding: "30px 24px", borderRadius: 28, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: sent, scale: `${0.96 + 0.04 * sent}`, textAlign: "center" })}>
        <div style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 54, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: INK, lineHeight: 1.15 }}>{t.sent}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#3A4F80", lineHeight: 1.2 }}>{t.note}</div>
      </div>
    </div>
  );
};

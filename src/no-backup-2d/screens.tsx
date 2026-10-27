// Экраны телефона (крупные вставки): уведомление, исходящий звонок,
// страница BalaGo и предварительная регистрация. Тексты — кыргызча,
// крупные и на экране достаточно долго для чтения.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";
import { clamp, easeOut, keys } from "./rig/motion";
import { NB2_TEXT } from "./script";
import { box } from "./shots";

const INK = "#1E2235";
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);

export const StatusBar: React.FC<{ time: string; dark?: boolean }> = ({ time, dark }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: dark ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Корпус телефона для крупного плана; дети — содержимое экрана.
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; shake?: number; contentWidth?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, shake = 0, contentWidth, children }) => {
  const h = w * 2.05;
  return (
    // положение через translate: дробные пиксели, плавный медленный дрейф
    <div style={box({ left: 0, top: 0, translate: `${x + shake}px ${y}px`, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>
        {contentWidth ? <div style={box({ left: 0, top: 0, width: contentWidth, height: contentWidth * (1.98 / 0.93), transformOrigin: "0 0", transform: `scale(${w * 0.93 / contentWidth})` })}>{children}</div> : children}
      </div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string; side?: 1 | -1; thumbAt?: number }> = ({ x: px, y: py, w, sleeve, skin, side = 1, thumbAt = 0.56 }) => {
  const h = w * 2.05;
  // части руки — относительно телефона; общее смещение через translate
  const x = 0;
  const y = 0;
  const sx = side > 0 ? x + w * 0.62 : x - w * 0.2;
  return (
    <div style={box({ left: 0, top: 0, translate: `${px}px ${py}px` })}>
      <div style={box({ left: sx, top: y + h * (thumbAt + 0.22), width: w * 0.42, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: `${side * -18}deg`, transformOrigin: "50% 0%" })} />
      <div style={box({ left: side > 0 ? x + w * 0.66 : x - w * 0.12, top: y + h * (thumbAt + 0.04), width: w * 0.3, height: w * 0.45, borderRadius: w * 0.2, backgroundColor: skin, rotate: `${side * -14}deg` })} />
      {/* большой палец на краю экрана, пальцы с другой стороны */}
      <div style={box({ left: side > 0 ? x + w * 0.84 : x - w * 0.04, top: y + h * thumbAt, width: w * 0.13, height: w * 0.3, borderRadius: w * 0.07, backgroundColor: skin, rotate: `${side * -32}deg`, boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: side > 0 ? x - w * 0.05 : x + w * 0.96, top: y + h * (thumbAt + 0.06 + i * 0.08), width: w * 0.1, height: w * 0.12, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </div>
  );
};

// Экран блокировки с уведомлением (сообщение папе с работы).
export const NotifyScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const t = NB2_TEXT.work;
  const a = appear(f, at, 9);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #2B3A66, #4B5E8E)" })}>
      <StatusBar time={t.time} dark />
      <div style={box({ left: 0, right: 0, top: 150, textAlign: "center", color: "#FFFFFF", fontSize: 132, fontWeight: 300 })}>{t.time}</div>
      <div
        style={box({
          left: 30,
          right: 30,
          top: 420,
          padding: "26px 28px",
          borderRadius: 34,
          backgroundColor: "rgba(255,255,255,0.94)",
          opacity: a,
          translate: `0 ${(1 - a) * -40}px`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        })}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#3E8E5E" }} />
          <span>{t.from}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>азыр</span>
        </div>
        <div style={{ fontSize: 46, fontWeight: 800, color: INK, lineHeight: 1.22 }}>{t.body}</div>
      </div>
    </div>
  );
};

export const CallScreen: React.FC<{ f: number }> = ({ f }) => {
  const sec = Math.max(0, Math.floor(f / 30));
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #3D5A80, #253758)", color: "#FFFFFF" })}>
      <StatusBar time="08:21" dark />
      <div style={box({ left: 0, right: 0, top: 220, textAlign: "center", fontSize: 64, fontWeight: 900 })}>{NB2_TEXT.call.contact}</div>
      <div style={box({ left: 0, right: 0, top: 310, textAlign: "center", fontSize: 34, fontWeight: 700, opacity: 0.85 })}>
        {NB2_TEXT.call.status} · 00:{String(sec).padStart(2, "0")}
      </div>
    </div>
  );
};

export const PhoneIcon: React.FC<{ size?: number; end?: boolean }> = ({ size = 64, end = false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: end ? "rotate(135deg)" : undefined }}>
    <path d="M16 9 L25 21 L19 28 Q25 40 37 45 L44 39 L56 48 Q55 58 47 58 C26 56 8 37 7 17 Q8 10 16 9 Z" fill="currentColor" />
  </svg>
);

// Исходящий вызов: контакт → зелёная кнопка → соединение. В конце
// разговора — отдельное нажатие красной кнопки. Поля ввода и чат отсутствуют.
export const OutgoingCallScreen: React.FC<{ contact: string; f: number; ending?: boolean }> = ({ contact, f, ending = false }) => {
  const pressed = f >= 8;
  const connected = ending || f >= 24;
  const finished = ending && f >= 11;
  const buttonScale = keys(f, [[5, 1], [8, 0.9], [13, 1]]);
  return <div style={box({ inset: 0, background: "linear-gradient(160deg,#284D6B,#142442)", color: "#FFF", textAlign: "center" })}>
    <StatusBar time="19:45" dark />
    <div style={box({ left: 0, right: 0, top: 165, fontSize: 36, fontWeight: 700, opacity: 0.82 })}>{ending ? "Телефон аркылуу" : "Байланыштар"}</div>
    <div style={box({ top: 270, left: 221, width: 234, height: 234, borderRadius: "50%", background: "#54738D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 126, fontWeight: 800 })}>{contact[0]}</div>
    <div style={box({ left: 30, right: 30, top: 556, fontSize: 70, fontWeight: 900 })}>{contact}</div>
    <div style={box({ left: 0, right: 0, top: 654, fontSize: 38, fontWeight: 700, color: finished ? "#DCE5ED" : "#FFF" })}>
      {finished ? "Чалуу аяктады" : connected ? "Сүйлөшүү" : pressed ? "Чалып жатат…" : "Чалуу"}
    </div>
    <div style={box({ left: 263, top: 990, width: 150, height: 150, borderRadius: "50%", background: ending || connected ? "#D85D58" : "#4FAD73", display: "flex", alignItems: "center", justifyContent: "center", scale: String(ending ? keys(f, [[8,1],[11,0.9],[16,1]]) : buttonScale), boxShadow: "0 14px 30px #0003" })}>
      <PhoneIcon size={76} end={ending || connected} />
    </div>
    <div style={box({ left: 0, right: 0, top: 1180, fontSize: 32, fontWeight: 700, opacity: 0.86 })}>{ending || connected ? "Чалууну бүтүрүү" : "Чалуу"}</div>
  </div>;
};

// Указательный палец касается выбранной кнопки. Позиция задана в кадре,
// рукав и кожа принадлежат тому же персонажу, который держит телефон.
export const TouchFinger: React.FC<{ x: number; y: number; skin: string; sleeve: string; opacity?: number }> = ({ x, y, skin, sleeve, opacity = 1 }) => (
  <div style={box({ left: 0, top: 0, translate: `${x}px ${y}px`, opacity })}>
    <div style={box({ left: -150, top: 150, width: 120, height: 420, borderRadius: 60, backgroundColor: sleeve, rotate: "28deg", transformOrigin: "50% 0%" })} />
    <div style={box({ left: -96, top: 56, width: 92, height: 140, borderRadius: 44, backgroundColor: skin, rotate: "26deg" })} />
    <div style={box({ left: -16, top: -4, width: 32, height: 92, borderRadius: 16, backgroundColor: skin, rotate: "22deg", transformOrigin: "50% 0%", boxShadow: "3px 4px 8px #14244233" })} />
  </div>
);

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

// Страница BalaGo: один нарисованный маршрут «үй → мектеп → үй»
// (утром в школу, после уроков домой), статус предварительной регистрации
// и кнопка. Фото машины и личные фото не используются (правило бренда).
export const BalaGoPage: React.FC<{ f: number; routeAt?: number; tapAt?: number }> = ({ f, routeAt = 14, tapAt }) => {
  const p = NB2_TEXT.page;
  const go = clamp((f - routeAt) / 34);
  const back = clamp((f - routeAt - 30) / 34);
  const press = tapAt !== undefined ? interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  // путь утром и обратно (координаты svg 596×470)
  const fwd = "M 112 360 C 160 210 300 150 452 140";
  const ret = "M 470 196 C 420 330 300 400 150 400";
  const LEN = 420;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="20:47" />
      <div style={box({ left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 150, height: 150, borderRadius: 75, objectFit: "cover" }} />
        <div style={{ fontSize: 64, fontWeight: 900, color: COLORS.navy }}>{p.brand}</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
      </div>
      <div style={box({ left: 40, right: 40, top: 430, height: 470, borderRadius: 34, backgroundColor: COLORS.yellowSoft, overflow: "hidden" })}>
        <svg width="100%" height="100%" viewBox="0 0 596 470" style={box({ inset: 0 })}>
          <path d={fwd} stroke="#FFFFFF" strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={ret} stroke="#FFFFFF" strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={fwd} stroke={COLORS.navy} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={`${LEN * go} ${LEN}`} />
          <path d={ret} stroke={COLORS.navy} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="16 14" opacity={back} />
          <path d="M 440 120 L 466 140 L 438 158" stroke={COLORS.navy} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={go > 0.95 ? 1 : 0} />
          <path d="M 172 384 L 146 400 L 170 418" stroke={COLORS.navy} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={back > 0.95 ? 1 : 0} />
        </svg>
        <div style={box({ left: 40, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 })}>
          <RouteIcon kind="home" size={110} />
          <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.navy }}>{p.route[0]}</div>
        </div>
        <div style={box({ left: 430, top: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 })}>
          <RouteIcon kind="school" size={110} />
          <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.navy }}>{p.route[1]}</div>
        </div>
        <div style={box({ left: 210, top: 150, padding: "8px 18px", borderRadius: 999, backgroundColor: "#FFFFFF", fontSize: 28, fontWeight: 800, color: COLORS.navy, opacity: go })}>{p.trip[0]}</div>
        <div style={box({ left: 300, top: 380, padding: "8px 18px", borderRadius: 999, backgroundColor: "#FFFFFF", fontSize: 28, fontWeight: 800, color: COLORS.navy, opacity: back })}>{p.trip[1]}</div>
      </div>
      <div style={box({ left: 40, right: 40, top: 935, padding: "20px 0", borderRadius: 24, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 34, fontWeight: 900, textAlign: "center" })}>{p.status}</div>
      <div style={box({ left: 40, right: 40, top: 1080, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 40, fontWeight: 900, textAlign: "center", scale: `${press}`, boxShadow: "0 10px 24px rgba(255,201,14,0.4)" })}>{p.button}</div>
    </div>
  );
};

// Расписание проверки заявки (кадры сцены): форма уже заполнена; мама
// касается маршрута и времени — у каждого поля появляется отметка, — затем
// нажимает «Арызды жөнөтүү»; карточка «Арыз жөнөтүлдү» сменяет кнопку.
export const FORM = (at: number) => {
  const checks = [at + 18, at + 46];
  const send = at + 76;
  return { checks, checkFields: [2, 3], fieldY: [0, 1, 2, 3].map((i) => 266 + i * 158), send, sent: send + 8, sendY: 900 };
};

// Предварительная регистрация (без подтверждения поездок).
export const RegForm: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const t = NB2_TEXT.form;
  const plan = FORM(at);
  const press = interpolate(f, [plan.send - 2, plan.send, plan.send + 5], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buttonOut = clamp((f - plan.send - 2) / 6);
  const sent = appear(f, plan.sent, 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA" })}>
      <StatusBar time="20:48" />
      <div style={box({ left: 40, right: 40, top: 100, display: "flex", alignItems: "center", gap: 18 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover" }} />
        <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.navy }}>{t.title}</div>
      </div>
      {t.fields.map(([label, value], i) => {
        const k = plan.checkFields.indexOf(i);
        const checked = k >= 0 ? clamp((f - plan.checks[k] - 4) / 8) : 0;
        const focus = k >= 0 && f >= plan.checks[k] - 2 && f < plan.checks[k] + 22;
        return (
          <div key={label} style={box({ left: 40, right: 40, top: 230 + i * 158, display: "flex", flexDirection: "column", gap: 8 })}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 86, borderRadius: 20, backgroundColor: "#FFFFFF", border: `4px solid ${focus ? COLORS.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 38, fontWeight: 800, color: INK }}>
              <span style={{ flex: 1 }}>{value}</span>
              {checked > 0 ? <span style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", opacity: checked, scale: `${0.7 + 0.3 * checked}` }}>✓</span> : null}
            </div>
          </div>
        );
      })}
      {buttonOut < 1 ? <div style={box({ left: 40, right: 40, top: plan.sendY, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 40, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - buttonOut })}>{t.send}</div> : null}
      {sent > 0 ? (
        <div style={box({ left: 40, right: 40, top: plan.sendY - 20, padding: "30px 24px", borderRadius: 28, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: sent, scale: `${0.96 + 0.04 * sent}` })}>
          <div style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 58, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
          <div style={{ fontSize: 50, fontWeight: 900, color: INK }}>{t.sent}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3A4F80" }}>{t.contact}</div>
        </div>
      ) : null}
    </div>
  );
};

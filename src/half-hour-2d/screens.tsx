import { Img, interpolate, staticFile } from "remotion";
import { COLORS, ASSETS } from "../config";
import { easeOut } from "../components/anim";
import { INK } from "./props";
import { HH2_TEXT } from "./script";

// Экраны телефона (вёрстка 556 × 1186, см. Phone в props.tsx).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const appearAt = (f: number, at: number, d = 10) =>
  interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: easeOut });

const StatusBar: React.FC<{ time: string; dark?: boolean }> = ({ time, dark }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 22, display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 800, color: dark ? "#FFFFFF" : INK }}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Голосовое сообщение: волна и длительность.
const VoiceBubble: React.FC<{ mine?: boolean; play?: number; sec: string }> = ({ mine, play = 0, sec }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "18px 24px",
      borderRadius: 30,
      backgroundColor: mine ? "#FFF0B3" : "#FFFFFF",
      boxShadow: "0 6px 16px rgba(20,40,90,0.10)",
      alignSelf: mine ? "flex-end" : "flex-start",
    }}
  >
    <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: mine ? COLORS.yellow : INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 0, height: 0, borderLeft: `16px solid ${mine ? INK : "#FFFFFF"}`, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", marginLeft: 5 }} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {[10, 22, 14, 30, 18, 26, 12, 20, 28, 16, 10, 22].map((h, i) => (
        <div key={i} style={{ width: 6, height: h, borderRadius: 3, backgroundColor: i / 12 < play ? INK : "#AEB9CB" }} />
      ))}
    </div>
    <span style={{ fontSize: 24, fontWeight: 700, color: "#6B7890" }}>{sec}</span>
  </div>
);

// Переписка мамы с сыном: голосовое от сына (с расшифровкой) и её ответ.
export const ChatScreen: React.FC<{ readonly f: number; readonly incomingAt: number; readonly replyAt?: number; readonly time: string }> = ({
  f,
  incomingAt,
  replyAt,
  time,
}) => {
  const a = appearAt(f, incomingAt);
  const r = replyAt === undefined ? 0 : appearAt(f, replyAt);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#EEF2F7" }}>
      <StatusBar time={time} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 110, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, padding: "0 30px", boxSizing: "border-box", borderBottom: "2px solid #E2E8F0" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, color: INK }}>У</div>
        <div style={{ fontSize: 36, fontWeight: 900 }}>{HH2_TEXT.sonContact}</div>
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, top: 230, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ opacity: a, translate: `0 ${(1 - a) * 20}px`, display: "flex", flexDirection: "column", gap: 10 }}>
          <VoiceBubble play={interpolate(f, [incomingAt + 10, incomingAt + 50], [0, 1], clamp)} sec="0:02" />
          <div style={{ alignSelf: "flex-start", padding: "16px 24px", borderRadius: 26, backgroundColor: "#FFFFFF", fontSize: 32, fontWeight: 800, boxShadow: "0 6px 16px rgba(20,40,90,0.08)" }}>
            {HH2_TEXT.watchMessage}
          </div>
        </div>
        {replyAt !== undefined ? (
          <div style={{ opacity: r, translate: `0 ${(1 - r) * 20}px`, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <VoiceBubble mine sec="0:01" play={1} />
            <div style={{ padding: "16px 24px", borderRadius: 26, backgroundColor: "#FFF0B3", fontSize: 32, fontWeight: 800 }}>{HH2_TEXT.reply}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Пропущенные рабочие звонки.
export const MissedCallsScreen: React.FC<{ readonly appear: number }> = ({ appear }) => {
  const rows = [
    { name: "Жетекчи", time: "13:21" },
    { name: "Кеңсе", time: "13:34" },
    { name: "Жетекчи", time: "13:52" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F6F8FB" }}>
      <StatusBar time="14:08" />
      <div style={{ position: "absolute", left: 36, top: 110, fontSize: 40, fontWeight: 900 }}>Чалуулар</div>
      <div style={{ position: "absolute", left: 36, right: 36, top: 190, padding: "16px 22px", borderRadius: 22, backgroundColor: "#FDE3DC", color: "#B4432B", fontSize: 28, fontWeight: 900, opacity: appearAt(appear, 0) }}>
        3 {HH2_TEXT.missed.toLowerCase()}
      </div>
      {rows.map((r, i) => {
        const p = appearAt(appear, 8 + i * 8);
        return (
          <div key={i} style={{ position: "absolute", left: 36, right: 36, top: 290 + i * 120, height: 100, borderRadius: 22, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 24px", boxSizing: "border-box", gap: 20, opacity: p, translate: `${(1 - p) * 30}px 0`, boxShadow: "0 6px 16px rgba(20,40,90,0.06)" }}>
            <div style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: "#E6EBF2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={30} height={30} viewBox="0 0 24 24">
                <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.56 3.57a1 1 0 01-.25 1z" fill="#D9534F" />
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: 32, fontWeight: 800, color: "#C0392B" }}>{r.name}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#6B7890" }}>{r.time}</div>
          </div>
        );
      })}
    </div>
  );
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile(ASSETS.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }} />
);

// Страница BalaGo в профиле: предварительная регистрация.
export const BalaGoPage: React.FC<{ readonly f: number; readonly highlight?: number }> = ({ f, highlight = 0 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
    <StatusBar time="20:41" />
    <div style={{ position: "absolute", left: 0, right: 0, top: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Logo size={190} />
      <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.navy }}>BalaGo</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: "#5A6B8C" }}>{HH2_TEXT.page.tagline}</div>
      <div style={{ marginTop: 10, padding: "12px 26px", borderRadius: 999, backgroundColor: COLORS.yellowSoft, fontSize: 30, fontWeight: 900, color: COLORS.navy }}>{HH2_TEXT.page.route}</div>
    </div>
    <div style={{ position: "absolute", left: 36, right: 36, top: 600, padding: "26px 28px", borderRadius: 30, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 34, fontWeight: 900, textAlign: "center", opacity: appearAt(f, 8, 14) }}>
      {HH2_TEXT.page.status}
    </div>
    <div style={{ position: "absolute", left: 36, right: 36, top: 760, padding: "26px 0", borderRadius: 30, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 38, fontWeight: 900, textAlign: "center", boxShadow: `0 0 0 ${highlight * 10}px rgba(255,201,14,0.35)` }}>
      {HH2_TEXT.cta.button}
    </div>
    <div style={{ position: "absolute", left: 36, right: 36, top: 900, display: "flex", gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, height: 200, borderRadius: 22, backgroundColor: ["#EAF3FC", "#FFF4C2", "#EAF3FC"][i] }} />
      ))}
    </div>
  </div>
);

// Форма предварительной заявки. step: 0 — пусто, 1…3 — заполнены поля,
// 4 — нажата кнопка, 5 — заявка отправлена.
export const FormScreen: React.FC<{ readonly f: number; readonly fills: readonly number[]; readonly tapAt: number; readonly sentAt: number }> = ({
  f,
  fills,
  tapAt,
  sentAt,
}) => {
  const fields = [
    [HH2_TEXT.form.school, HH2_TEXT.form.schoolValue],
    [HH2_TEXT.form.address, HH2_TEXT.form.addressValue],
    [HH2_TEXT.form.time, HH2_TEXT.form.timeValue],
  ] as const;
  const press = interpolate(f, [tapAt - 2, tapAt + 2, tapAt + 8], [1, 0.95, 1], clamp);
  const sent = appearAt(f, sentAt, 12);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F6F8FB" }}>
      <StatusBar time="20:42" />
      <div style={{ position: "absolute", left: 36, right: 36, top: 100, display: "flex", alignItems: "center", gap: 18 }}>
        <Logo size={80} />
        <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.navy }}>{HH2_TEXT.form.title}</div>
      </div>
      {fields.map(([label, value], i) => {
        const shown = Math.round(interpolate(f, [fills[i], fills[i] + 18], [0, value.length], clamp));
        return (
          <div key={label} style={{ position: "absolute", left: 36, right: 36, top: 240 + i * 170 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#6B7890", marginBottom: 10 }}>{label}</div>
            <div style={{ height: 92, borderRadius: 22, backgroundColor: "#FFFFFF", border: `3px solid ${f >= fills[i] && f < fills[i] + 22 ? COLORS.yellow : "#DCE3EC"}`, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 32, fontWeight: 800, color: INK, boxSizing: "border-box" }}>
              {value.slice(0, shown)}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 36, right: 36, top: 790, padding: "28px 0", borderRadius: 30, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 40, fontWeight: 900, textAlign: "center", scale: String(press), opacity: 1 - sent * 0.4 }}>
        {HH2_TEXT.form.send}
      </div>
      {/* подтверждение: заявка отправлена, свяжутся (без «поездка подтверждена») */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 300, bottom: 260, borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 30px 60px rgba(20,40,90,0.18)", opacity: sent, scale: String(0.94 + 0.06 * sent), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, padding: 40, textAlign: "center" }}>
        <div style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: "#4CC27A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={80} height={80} viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 46, fontWeight: 900, color: COLORS.navy }}>{HH2_TEXT.form.sent}</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#5A6B8C" }}>{HH2_TEXT.form.contact}</div>
      </div>
    </div>
  );
};

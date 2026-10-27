// Экраны телефона мамы крупным планом (условный интерфейс, не копия
// реальных приложений): входящий звонок «Кардар», пропущенный звонок,
// исходящий «Чалып жатат…», календарь недели с повторяющимся событием,
// поиск и карточка BalaGo, схема маршрута; условный пример чата родителей.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { BG8_TEXT } from "./script";
import { box } from "./shots";

export const NAVY = "#14285A";
export const YELLOW = "#FFD23F";
export const YELLOW_DEEP = "#F2B705";
export const INK = "#33415E";
export const RED = "#E2433A";
export const GREEN = "#25A55A";
export const PURPLE = "#7A5CC9";

// Пружинящее появление 0…1 (небольшой перелёт).
export const pop = (x: number) => {
  const t = clamp(x);
  return t >= 1 ? 1 : 1 - Math.pow(1 - t, 3) * Math.cos(t * 4.2);
};

// Трубка телефона (белая).
export const PhoneGlyph: React.FC<{ rot?: number; size?: number; color?: string }> = ({ rot = 0, size = 74, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ rotate: `${rot}deg`, display: "block" }}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill={color} />
  </svg>
);

// Значок пропущенного звонка: трубка и стрелка «мимо».
export const MissedGlyph: React.FC<{ size?: number; color?: string }> = ({ size = 60, color = RED }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d="M3 5 L9 11 L13 7" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 7 L13 7 L13 10" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 18.5 Q12 11.5 21.5 18.5 L19.6 21 L16.4 19.4 L16.4 17.4 Q12 15.8 7.6 17.4 L7.6 19.4 L4.4 21 Z" fill={color} />
  </svg>
);

export const StatusBar: React.FC<{ time: string; dark?: boolean; s?: number }> = ({ time, dark, s = 1 }) => (
  <div style={box({ left: 44 * s, right: 44 * s, top: 24 * s, display: "flex", justifyContent: "space-between", fontSize: 30 * s, fontWeight: 800, color: dark ? "#FFFFFF" : NAVY })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Корпус телефона для крупного плана; дети — содержимое экрана
// (экран w×2.05w минус рамка). shake — смещение от вибрации.
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; shake?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, shake = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x + shake, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: "#1E2235", rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: "#1E2235" })} />
    </div>
  );
};

// Держатель на панели машины для крупного плана телефона.
export const DashHolder: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <>
    <div style={box({ left: x - w * 0.08, top: y + w * 0.6, width: w * 1.16, height: w * 0.16, borderRadius: w * 0.05, backgroundColor: "#11131A" })} />
    <div style={box({ left: x - w * 0.08, top: y + w * 1.5, width: w * 1.16, height: w * 0.16, borderRadius: w * 0.05, backgroundColor: "#11131A" })} />
    <div style={box({ left: x + w * 0.4, top: y + w * 2.05, width: w * 0.2, height: w * 0.6, backgroundColor: "#11131A" })} />
  </>
);

// Аватар контакта «Кардар» с расходящимися кольцами вызова.
const Avatar: React.FC<{ size: number; ring?: number; color?: string }> = ({ size, ring = 0, color = "#B9C7E6" }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {ring > 0
      ? [0, 1].map((i) => {
          const k = (ring + i * 0.5) % 1;
          return <div key={i} style={box({ left: -size * 0.45 * k, top: -size * 0.45 * k, width: size * (1 + 0.9 * k), height: size * (1 + 0.9 * k), borderRadius: "50%", border: "4px solid rgba(255,255,255,0.7)", opacity: 1 - k, boxSizing: "border-box" })} />;
        })
      : null}
    <div style={box({ inset: 0, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center" })}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <circle cx={12} cy={8} r={4.4} fill="#FFFFFF" />
        <path d="M3.5 21 Q12 10.5 20.5 21 Z" fill="#FFFFFF" />
        <path d="M10.6 14.2 L12 16.4 L13.4 14.2 L12.7 21 L11.3 21 Z" fill={NAVY} />
      </svg>
    </div>
  </div>
);

export type CallState = "incoming" | "calling" | "noanswer";

// Экран звонка с «Кардар»: входящий (кольца, кнопки) или исходящий
// (кайра чалуу: «Чалып жатат…» → «Жооп жок»). Текст крупный: читается
// на телефоне зрителя.
export const CallScreen: React.FC<{ f: number; state: CallState; time: string }> = ({ f, state, time }) => {
  const T = BG8_TEXT;
  const incoming = state === "incoming";
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #3D5A80, #22324F)", color: "#FFFFFF" })}>
      <StatusBar time={time} dark />
      <div style={box({ left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 })}>
        <Avatar size={200} ring={state === "noanswer" ? 0 : (f / 30) % 1} />
        <div style={{ fontSize: 100, fontWeight: 900, marginTop: 24 }}>{T.client}</div>
        <div style={{ fontSize: 46, fontWeight: 800, opacity: 0.92 }}>{incoming ? T.incoming : state === "calling" ? T.calling : "Жооп жок"}</div>
      </div>
      {incoming ? (
        <div style={box({ left: 60, right: 60, bottom: 130, display: "flex", justifyContent: "space-between" })}>
          {[RED, "#3FB86A"].map((c, i) => (
            <div key={c} style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: c, display: "flex", alignItems: "center", justifyContent: "center", scale: i === 1 ? `${1 + 0.06 * Math.sin(f / 4)}` : "1" }}>
              <PhoneGlyph rot={i === 0 ? 135 : 0} />
            </div>
          ))}
        </div>
      ) : (
        <div style={box({ left: 0, right: 0, bottom: 130, display: "flex", justifyContent: "center" })}>
          <div style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", opacity: state === "noanswer" ? 0.45 : 1 }}>
            <PhoneGlyph rot={135} />
          </div>
        </div>
      )}
    </div>
  );
};

// Экран блокировки с уведомлением о пропущенном звонке (появляется в at).
export const MissedScreen: React.FC<{ f: number; at: number; time: string }> = ({ f, at, time }) => {
  const u = easeOut((f - at) / 10);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #E9EEF7, #D6DEEC)" })}>
      <StatusBar time={time} />
      <div style={box({ left: 0, right: 0, top: 170, textAlign: "center", fontSize: 190, fontWeight: 900, color: NAVY, letterSpacing: -4 })}>{time}</div>
      <div style={box({ left: 34, right: 34, top: 520, padding: "34px 30px", borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 14px 34px rgba(20,40,90,0.16)", display: "flex", alignItems: "center", gap: 24, opacity: u, transform: `translateY(${(1 - u) * -60}px)` })}>
        <div style={{ width: 110, height: 110, flexShrink: 0, borderRadius: 55, backgroundColor: "#FDE7E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MissedGlyph size={70} />
        </div>
        <div>
          <div style={{ fontSize: 44, fontWeight: 900, color: RED }}>{BG8_TEXT.missed}</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: NAVY }}>{BG8_TEXT.client}</div>
        </div>
      </div>
    </div>
  );
};

// Календарь недели: в каждый день Дш–Жм одно и то же событие
// «Мектептен алуу 16:40–17:30» (появляются по очереди с dayAt[i]),
// рядом — «Кардарлар чалат» в то же время (красный контур — пересечение
// с clashAt); затем значок повтора «Ар күнү кайталанат» (repeatAt).
export const CalendarWeek: React.FC<{ f: number; dayAt: readonly number[]; clashAt: number; repeatAt: number; time: string }> = ({ f, dayAt, clashAt, repeatAt, time }) => {
  const C = BG8_TEXT.calendar;
  const clash = clamp((f - clashAt) / 10);
  const blink = 0.7 + 0.3 * Math.sin(f / 3.5);
  const rep = easeOut((f - repeatAt) / 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time={time} />
      <div style={box({ left: 40, top: 100, fontSize: 40, whiteSpace: "nowrap", fontWeight: 900, color: NAVY })}>{C.title}</div>
      {C.days.map((d, i) => {
        const u = pop(clamp((f - dayAt[i]) / 10));
        const top = 180 + i * 166;
        return (
          <div key={d} style={box({ left: 30, right: 30, top, height: 152, borderRadius: 26, backgroundColor: "#F3F6FB" })}>
            <div style={box({ left: 20, top: 44, width: 100, fontSize: 50, fontWeight: 900, color: "#6A7896" })}>{d}</div>
            {/* рабочие звонки в то же время */}
            <div style={box({ left: 124, top: 10, right: 16, height: 58, borderRadius: 16, backgroundColor: "#EEE7FB", border: `4px solid ${clash > 0 ? `rgba(226,67,58,${clash * blink})` : "#D4C8F2"}`, boxSizing: "border-box", padding: "6px 18px", fontSize: 34, fontWeight: 900, color: "#4E3A8C" })}>
              {C.work}
            </div>
            <div style={box({ left: 124, top: 76, right: 16, height: 66, borderRadius: 18, backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", boxSizing: "border-box", fontSize: 32, fontWeight: 900, color: NAVY, whiteSpace: "nowrap", opacity: clamp(u * 1.4), transform: `scale(${lerp(0.7, 1, u)})`, transformOrigin: "0% 50%" })}>
              <span>{C.event}</span>
              <span style={{ fontSize: 28, fontWeight: 800 }}>{C.eventTime}</span>
            </div>
          </div>
        );
      })}
      <div style={box({ left: 30, right: 30, top: 1020, padding: "18px 24px", borderRadius: 30, backgroundColor: NAVY, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 18, fontSize: 38, fontWeight: 900, whiteSpace: "nowrap", opacity: rep, transform: `translateY(${(1 - rep) * 30}px)` })}>
        <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, rotate: `${f * 2}deg` }}>
          <path d="M20 12a8 8 0 0 1-14 5.3" />
          <path d="M4 12a8 8 0 0 1 14-5.3" />
          <path d="M18 3 L18 7 L14 7" />
          <path d="M6 21 L6 17 L10 17" />
        </svg>
        {C.repeat}
      </div>
    </div>
  );
};

// Карточка BalaGo в результатах поиска (в экране телефона).
export const BalaGoCard: React.FC<{ press?: number }> = ({ press = 0 }) => {
  const S = BG8_TEXT.search;
  return (
    <div style={{ borderRadius: 34, backgroundColor: "#FFFFFF", border: `5px solid ${YELLOW}`, boxShadow: "0 20px 44px rgba(20,40,90,0.16)", padding: 30, fontFamily }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 130, height: 130, borderRadius: 65 }} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{S.title}</div>
          <div style={{ marginTop: 10, display: "inline-block", padding: "6px 20px", borderRadius: 24, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 30, fontWeight: 900 }}>{S.city}</div>
        </div>
      </div>
      <div style={{ marginTop: 22, fontSize: 42, fontWeight: 900, color: INK }}>{S.route}</div>
      <div style={{ marginTop: 22, display: "inline-block", padding: "14px 38px", borderRadius: 40, backgroundColor: press > 0.5 ? YELLOW_DEEP : YELLOW, color: NAVY, fontSize: 42, fontWeight: 900, transform: `scale(${1 - 0.06 * Math.sin(Math.PI * clamp(press))})` }}>{S.more}</div>
    </div>
  );
};

// Поиск в телефоне: запрос набирается (typeFrom…typeTo), появляется
// карточка BalaGo (found), палец нажимает «Толугураак» (click).
export const SearchPhone: React.FC<{ f: number; typeFrom: number; typeTo: number; found: number; click: number; time: string }> = ({ f, typeFrom, typeTo, found, click, time }) => {
  const q = BG8_TEXT.search.query;
  const n = Math.round(q.length * clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)));
  const caret = f < found && Math.floor(f / 8) % 2 === 0;
  const card = easeOut((f - found) / 12);
  const press = clamp((f - click + 4) / 10);
  const tap = easeInOut((f - (click - 14)) / 12);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #F3F6FB 0%, #E9EEF6 100%)" })}>
      <StatusBar time={time} />
      <div style={box({ left: 26, right: 26, top: 110, minHeight: 104, borderRadius: 52, backgroundColor: "#FFFFFF", border: `5px solid ${f >= typeFrom ? YELLOW : "#DCE3EE"}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "14px 26px", boxShadow: "0 10px 26px rgba(20,40,90,0.10)" })}>
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" style={{ flexShrink: 0 }}>
          <circle cx={10} cy={10} r={6.5} />
          <path d="M 15 15 L 21 21" />
        </svg>
        <div style={{ fontSize: 40, fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>
          {q.slice(0, n)}
          <span style={{ opacity: caret ? 1 : 0, color: YELLOW_DEEP }}>|</span>
        </div>
      </div>
      {f >= found ? (
        <div style={box({ left: 26, right: 26, top: 330, opacity: card, transform: `translateY(${(1 - card) * 40}px)` })}>
          <BalaGoCard press={press} />
        </div>
      ) : null}
      {/* касание пальцем: круг на кнопке «Толугураак» */}
      {f >= click - 14 && f < click + 16 ? (
        <div style={box({ left: lerp(560, 150, tap), top: lerp(1200, 680, tap), width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(20,40,90,0.18)", border: "4px solid rgba(20,40,90,0.35)", transform: `scale(${press > 0 && press < 1 ? 0.8 : 1})` })} />
      ) : null}
    </div>
  );
};

// ---------- Схема маршрута (экран телефона раскрывается на весь кадр) ----------
// draw 0…1 — линия маршрута Үй → Мектеп; back 0…1 — обратный путь.
export const RouteSchematic: React.FC<{ draw: number; back: number; intro: number }> = ({ draw, back, intro }) => {
  const R = BG8_TEXT.route;
  const H = { x: 230, y: 1180 };
  const S = { x: 850, y: 500 };
  const path = `M ${H.x} ${H.y} C ${H.x + 40} ${H.y - 320}, ${S.x - 420} ${S.y + 360}, ${S.x} ${S.y}`;
  const len = 1250;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" })}>
      {/* условные кварталы Бишкека: ровная сетка улиц */}
      <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity: 0.9 * intro })}>
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={60 + i * 120} y1={280} x2={60 + i * 120} y2={1460} stroke="#EEF1F6" strokeWidth={26} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={340 + i * 120} x2={1080} y2={340 + i * 120} stroke="#EEF1F6" strokeWidth={26} />
        ))}
        <path d={path} fill="none" stroke="#E3E8F0" strokeWidth={34} strokeLinecap="round" />
        <path d={path} fill="none" stroke={YELLOW_DEEP} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} />
        {back > 0 ? <path d={path} fill="none" stroke={NAVY} strokeWidth={9} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-len * (1 - back)} opacity={0.8} /> : null}
      </svg>
      <div style={box({ left: H.x - 90, top: H.y - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: NAVY, transform: `scale(${pop(intro)})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width={92} height={92} viewBox="0 0 40 40"><path d="M 6 20 L 20 8 L 34 20 L 30 20 L 30 33 L 10 33 L 10 20 Z" fill="#FFFFFF" /><rect x={17} y={24} width={6} height={9} fill={NAVY} /></svg>
      </div>
      <div style={box({ left: H.x - 110, top: H.y + 100, width: 220, textAlign: "center", fontSize: 50, fontWeight: 900, color: NAVY })}>{R.home}</div>
      <div style={box({ left: S.x - 90, top: S.y - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: YELLOW, transform: `scale(${pop(clamp((draw - 0.85) / 0.15))})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width={96} height={96} viewBox="0 0 40 40"><path d="M 5 34 L 5 16 L 20 7 L 35 16 L 35 34 Z" fill={NAVY} /><rect x={11} y={19} width={5} height={5} fill={YELLOW} /><rect x={24} y={19} width={5} height={5} fill={YELLOW} /><rect x={17} y={26} width={6} height={8} fill={YELLOW} /></svg>
      </div>
      <div style={box({ left: S.x - 130, top: S.y + 100, width: 260, textAlign: "center", fontSize: 50, fontWeight: 900, color: NAVY })}>{R.school}</div>
      <div style={box({ left: 60, top: 250, padding: "12px 30px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 46, fontWeight: 900, opacity: intro })}>{R.city}</div>
    </div>
  );
};

// ---------- Условный пример чата родителей маршрута ----------
// Водитель сам пишет сообщение и отправляет ссылку на текущую геолокацию
// (BRAND_FACTS: не автоматические push-уведомления).
export const ChatExample: React.FC<{ f: number; msgAt: number; locAt: number }> = ({ f, msgAt, locAt }) => {
  const C = BG8_TEXT.chat;
  const m = easeOut((f - msgAt) / 10);
  const l = easeOut((f - locAt) / 10);
  const typing = f >= msgAt - 26 && f < msgAt;
  return (
    <div style={{ width: "100%", borderRadius: 34, backgroundColor: "#EFEAE2", overflow: "hidden", fontFamily, boxShadow: "0 16px 36px rgba(20,40,90,0.16)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", backgroundColor: "#1F7A4D", color: "#FFFFFF" }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={40} height={40} viewBox="0 0 24 24">
            {[7, 12, 17].map((x) => <circle key={x} cx={x} cy={9} r={2.8} fill="#1F7A4D" />)}
            <path d="M2.5 20 Q12 10 21.5 20 Z" fill="#1F7A4D" />
          </svg>
        </div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{C.title}</div>
        <div style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", fontSize: 28, fontWeight: 800 }}>{C.note}</div>
      </div>
      <div style={{ padding: "22px 24px 26px", display: "flex", flexDirection: "column", gap: 14, minHeight: 300 }}>
        {typing ? <div style={{ alignSelf: "flex-start", padding: "12px 22px", borderRadius: 24, backgroundColor: "#FFFFFF", fontSize: 34, fontWeight: 900, color: "#7A879E" }}>{C.driver} {"• • •".slice(0, 1 + 2 * (Math.floor(f / 6) % 3))}</div> : null}
        <div style={{ alignSelf: "flex-start", maxWidth: "88%", padding: "16px 24px", borderRadius: "26px 26px 26px 8px", backgroundColor: "#FFFFFF", opacity: m, transform: `translateY(${(1 - m) * 20}px)` }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#1F7A4D" }}>{C.driver}</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>{C.msg}</div>
        </div>
        <div style={{ alignSelf: "flex-start", padding: "14px 24px", borderRadius: "26px 26px 26px 8px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 14, opacity: l, transform: `translateY(${(1 - l) * 20}px)` }}>
          <svg width={46} height={46} viewBox="0 0 24 24"><path d="M12 2 Q19 2 19 9 Q19 14 12 22 Q5 14 5 9 Q5 2 12 2 Z" fill={RED} /><circle cx={12} cy={9} r={3} fill="#FFFFFF" /></svg>
          <span style={{ fontSize: 38, fontWeight: 900, color: "#2E6FD0", textDecoration: "underline" }}>{C.location}</span>
        </div>
      </div>
    </div>
  );
};

// Экраны телефона мамы (кыргызча, крупно): напоминание, неделя
// в календаре, входящий звонок сына, новый повторяющийся пункт
// «Мектеп каттамы», поиск и страница BalaGo.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { StatusBar } from "../../two-schedules-2d/screens";
import { box } from "./context";
import { BG19_TEXT } from "./script";

const INK = "#1E2235";
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const press = (f: number, at: number) => interpolate(f, [at - 3, at, at + 6], [1, 0.93, 1], CL);

// Касание пальцем: круг расходится в точке нажатия.
export const Tap: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const u = (f - at + 4) / 14;
  if (u < 0 || u > 1) return null;
  return <div style={box({ left: x - 40 - 30 * u, top: y - 40 - 30 * u, width: 80 + 60 * u, height: 80 + 60 * u, borderRadius: "50%", backgroundColor: `rgba(20,40,90,${0.22 * (1 - u)})` })} />;
};

// Неделя: у каждого дня — рабочий блок и «13:00 Мектеп» внутри него.
// lit[i] — кадр, когда день подсвечивается (ритм колокольчика);
// planned — 0…1: вместо столкновения — спокойный пункт «Мектеп каттамы».
export const WeekScreen: React.FC<{ f: number; lit: readonly number[]; planned?: number; note?: boolean }> = ({ f, lit, planned = 0, note = true }) => {
  const c = BG19_TEXT.calendar;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="12:58" />
      <div style={box({ left: 36, top: 92, fontSize: 52, fontWeight: 900, color: INK })}>{c.title}</div>
      {/* часы слева */}
      {["9:00", "13:00", "18:00"].map((h, i) => (
        <div key={h} style={box({ left: 18, top: [250, 600, 1000][i], width: 90, textAlign: "right", fontSize: 26, fontWeight: 800, color: i === 1 ? "#C2410C" : "#8A94A8" })}>{h}</div>
      ))}
      <div style={box({ left: 118, right: 18, top: 612, height: 4, backgroundColor: "rgba(194,65,12,0.35)" })} />
      {c.days.map((d, i) => {
        const on = appear(f, lit[i] ?? 99999, 6);
        const x = 112 + i * 108;
        return (
          <div key={d}>
            <div style={box({ left: x, top: 180, width: 96, textAlign: "center", fontSize: 32, fontWeight: 900, color: on > 0.5 ? NAVYC : "#5A6B8C" })}>{d}</div>
            {/* рабочий день */}
            <div style={box({ left: x, top: 250, width: 96, height: 790, borderRadius: 18, backgroundColor: "#DCE5F2" })} />
            <div style={box({ left: x, top: 380, width: 96, height: 120, display: "flex", alignItems: "center", justifyContent: "center" })}>
              <div style={{ rotate: "-90deg", fontSize: 30, fontWeight: 900, color: "#3A4F80", whiteSpace: "nowrap" }}>{c.work}</div>
            </div>
            <div style={box({ left: x, top: 760, width: 96, height: 120, display: "flex", alignItems: "center", justifyContent: "center" })}>
              <div style={{ rotate: "-90deg", fontSize: 30, fontWeight: 900, color: "#3A4F80", whiteSpace: "nowrap" }}>{c.work}</div>
            </div>
            {/* 13:00 — забрать из школы: столкновение с работой */}
            <div
              style={box({
                left: x - 4 * on,
                top: 545 - 4 * on,
                width: 96 + 8 * on,
                height: 140 + 8 * on,
                borderRadius: 18,
                backgroundColor: planned > 0.5 ? "#FFF4C2" : on > 0.05 ? "#FFE08A" : "#FFF1C4",
                border: `5px solid ${planned > 0.5 ? COLORS.yellow : on > 0.05 ? "#E8892B" : "#F3D27A"}`,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 31,
                fontWeight: 900,
                color: INK,
                lineHeight: 1.05,
                boxShadow: on > 0.05 && planned < 0.5 ? `0 0 0 ${10 * on}px rgba(232,137,43,${0.18 * on})` : "none",
              })}
            >
              {planned > 0.5 ? <Repeat size={34} /> : <span>13:00</span>}
              <span style={{ fontSize: 20 }}>{planned > 0.5 ? "каттам" : "мектеп"}</span>
            </div>
          </div>
        );
      })}
      {note ? (
        <div style={box({ left: 36, right: 36, top: 1110, padding: "22px 26px", borderRadius: 24, backgroundColor: planned > 0.5 ? "#EAF6EE" : "#FFF4E8", fontSize: 38, fontWeight: 900, color: INK, textAlign: "center", opacity: appear(f, (lit[4] ?? 0) + 8, 10) })}>
          {planned > 0.5 ? <><Repeat size={36} /> Дүйшөмбү – Жума</> : c.note}
        </div>
      ) : null}
    </div>
  );
};
const NAVYC = COLORS.navy;

// Значок «повторяется».
export const Repeat: React.FC<{ size: number; color?: string }> = ({ size, color = INK }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    <path d="M18.5 2.5v4.4h-4.4M5.5 21.5v-4.4h4.4" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Напоминание поверх экрана блокировки.
export const ReminderScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const r = BG19_TEXT.reminder;
  const a = appear(f, at, 9);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #5C7FA8, #2F4568)" })}>
      <StatusBar time="12:58" dark />
      <div style={box({ left: 0, right: 0, top: 170, textAlign: "center", color: "#FFFFFF", fontSize: 150, fontWeight: 800 })}>12:58</div>
      <div style={box({ left: 30, right: 30, top: 470, padding: "26px 30px", borderRadius: 34, backgroundColor: "rgba(255,255,255,0.94)", opacity: a, translate: `0 ${(1 - a) * -30}px`, boxShadow: "0 16px 40px rgba(10,20,40,0.3)" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 800, color: "#5A6B8C" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0z" fill={INK} /></svg>
          </div>
          {r.app}
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: INK, marginTop: 12 }}>{r.time}</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: INK, lineHeight: 1.15 }}>{r.title}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#C2410C", marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}><Repeat size={32} color="#C2410C" /> {r.repeat}</div>
      </div>
    </div>
  );
};

// Входящий звонок «Уулум» → разговор.
export const SonCallScreen: React.FC<{ f: number; answerAt: number }> = ({ f, answerAt }) => {
  const c = BG19_TEXT.call;
  const talking = f >= answerAt;
  const ring = (f / 30) % 1;
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #3D5A80, #22324F)", color: "#FFFFFF" })}>
      <StatusBar time="13:01" dark />
      <div style={box({ left: 0, right: 0, top: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 })}>
        <div style={{ position: "relative", width: 200, height: 200 }}>
          {!talking
            ? [0, 0.5].map((d) => {
                const k = (ring + d) % 1;
                return <div key={d} style={box({ left: -90 * k, top: -90 * k, width: 200 + 180 * k, height: 200 + 180 * k, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.7)", opacity: 1 - k, boxSizing: "border-box" })} />;
              })
            : null}
          <div style={box({ inset: 0, borderRadius: "50%", backgroundColor: "#7FC8A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 900, color: INK })}>{c.contact[0]}</div>
        </div>
        <div style={{ fontSize: 92, fontWeight: 900, marginTop: 20 }}>{c.contact}</div>
        <div style={{ fontSize: 42, fontWeight: 700, opacity: 0.9 }}>{talking ? `${c.talking} · 00:0${Math.min(9, Math.floor((f - answerAt) / 30))}` : c.status}</div>
      </div>
      {talking ? null : (
        <div style={box({ left: 60, right: 60, bottom: 130, display: "flex", justifyContent: "space-between" })}>
          {[
            { label: c.decline, color: "#E2433A", r: 135 },
            { label: c.accept, color: "#3FB86A", r: 0 },
          ].map((b, i) => (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, scale: i === 1 ? `${press(f, answerAt)}` : "1" }}>
              <div style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: b.color, display: "flex", alignItems: "center", justifyContent: "center", rotate: `${b.r}deg` }}>
                <svg width={74} height={74} viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="#FFFFFF" /></svg>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{b.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Новый повторяющийся пункт календаря: поля заполняются по очереди
// (fills — кадры начала), «Сактоо» нажимается в saveAt.
export const NewEventScreen: React.FC<{ f: number; fills: readonly number[]; saveAt: number }> = ({ f, fills, saveAt }) => {
  const e = BG19_TEXT.event;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA" })}>
      <StatusBar time="13:03" />
      <div style={box({ left: 40, top: 100, fontSize: 56, fontWeight: 900, color: INK })}>{e.title}</div>
      {e.fields.map(([label, value], i) => {
        const typed = clamp((f - fills[i]) / 16);
        const shown = value.slice(0, Math.round(value.length * typed));
        const active = f >= fills[i] && typed < 1;
        return (
          <div key={label} style={box({ left: 40, right: 40, top: 230 + i * 190, display: "flex", flexDirection: "column", gap: 10 })}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 100, borderRadius: 22, backgroundColor: "#FFFFFF", border: `4px solid ${active ? COLORS.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 44, fontWeight: 900, color: INK }}>
              {i === 1 && typed > 0 ? <span style={{ marginRight: 10, display: "flex" }}><Repeat size={40} /></span> : null}
              {shown}
              {active ? <span style={{ width: 4, height: 50, backgroundColor: INK, marginLeft: 4, opacity: Math.floor(f / 8) % 2 }} /> : null}
            </div>
          </div>
        );
      })}
      <div style={box({ left: 40, right: 40, top: 860, padding: "30px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 48, fontWeight: 900, textAlign: "center", scale: `${press(f, saveAt)}`, boxShadow: "0 10px 24px rgba(255,201,14,0.4)" })}>{e.save}</div>
      <Tap f={f} at={saveAt} x={500} y={920} />
    </div>
  );
};

// Поиск: запрос печатается (typeFrom…typeTo), появляются результаты,
// касание первого (BalaGo) в tapAt.
export const SearchScreen: React.FC<{ f: number; typeFrom: number; typeTo: number; tapAt: number }> = ({ f, typeFrom, typeTo, tapAt }) => {
  const s = BG19_TEXT.search;
  const typed = clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom));
  const q = s.query.slice(0, Math.round(s.query.length * typed));
  const res = appear(f, typeTo + 4, 10);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="13:04" />
      <div style={box({ left: 30, right: 30, top: 100, height: 104, borderRadius: 52, backgroundColor: "#F0F3F8", border: "3px solid #DCE3EE", display: "flex", alignItems: "center", padding: "0 26px", gap: 14, fontSize: 34, fontWeight: 800, color: INK, whiteSpace: "nowrap", overflow: "hidden" })}>
        <svg width={40} height={40} viewBox="0 0 24 24"><circle cx={10} cy={10} r={6.5} fill="none" stroke="#5A6B8C" strokeWidth={2.6} /><path d="M15 15l5.5 5.5" stroke="#5A6B8C" strokeWidth={2.6} strokeLinecap="round" /></svg>
        <span>{q}</span>
        {typed < 1 ? <span style={{ width: 4, height: 46, backgroundColor: INK, opacity: Math.floor(f / 8) % 2 }} /> : null}
      </div>
      <div style={box({ left: 30, right: 30, top: 250, opacity: res, translate: `0 ${(1 - res) * 20}px`, display: "flex", flexDirection: "column", gap: 22 })}>
        <div style={{ padding: "26px 26px", borderRadius: 28, backgroundColor: "#FFFFFF", border: `4px solid ${f >= tapAt - 2 ? COLORS.yellow : "#E3E8F0"}`, boxShadow: "0 10px 26px rgba(20,30,60,0.10)", display: "flex", gap: 22, alignItems: "center", scale: `${press(f, tapAt)}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 120, height: 120, borderRadius: 60, objectFit: "cover", flex: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.navy, lineHeight: 1.1 }}>{s.title}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>{s.sub}</div>
          </div>
        </div>
        {s.other.map((o) => (
          <div key={o} style={{ padding: "24px 26px", borderRadius: 24, backgroundColor: "#F6F8FB", fontSize: 32, fontWeight: 800, color: "#8A94A8" }}>{o}</div>
        ))}
      </div>
      <Tap f={f} at={tapAt} x={500} y={330} />
    </div>
  );
};

// Значок пункта маршрута: дом или школа.
export const RouteIcon: React.FC<{ kind: "home" | "school"; size: number; color?: string }> = ({ kind, size, color = COLORS.navy }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {kind === "home" ? (
      <>
        <path d="M 14 50 L 50 18 L 86 50" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 24 46 L 24 86 L 76 86 L 76 46" fill="#FFFFFF" stroke={color} strokeWidth={9} strokeLinejoin="round" />
        <rect x={42} y={60} width={16} height={26} fill={color} />
      </>
    ) : (
      <>
        <rect x={14} y={40} width={72} height={46} fill="#FFFFFF" stroke={color} strokeWidth={8} />
        <path d="M 30 40 L 50 20 L 70 40" fill="#FFFFFF" stroke={color} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 50 20 L 50 6 L 64 10 L 50 14" fill="#E2433A" />
        <rect x={42} y={62} width={16} height={24} fill={color} />
        <rect x={22} y={50} width={12} height={10} fill={color} />
        <rect x={66} y={50} width={12} height={10} fill={color} />
      </>
    )}
  </svg>
);

// Страница BalaGo: логотип, город, полный маршрут ҮЙ → МЕКТЕП → ҮЙ.
export const BalaGoScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = BG19_TEXT.page;
  const route = clamp((f - at - 8) / 30);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="13:05" />
      <div style={box({ left: 0, right: 0, top: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 200, height: 200, borderRadius: 100, objectFit: "cover", boxShadow: "0 14px 30px rgba(20,40,90,0.18)" }} />
        <div style={{ fontSize: 84, fontWeight: 900, color: COLORS.navy }}>{p.brand}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#3A4F80" }}>{p.tagline}</div>
      </div>
      <div style={box({ left: 36, right: 36, top: 560, height: 220, borderRadius: 32, backgroundColor: COLORS.yellowSoft })}>
        <svg width="100%" height="100%" viewBox="0 0 580 220" style={box({ inset: 0 })}>
          <path d="M 90 80 L 490 80" stroke={COLORS.navy} strokeWidth={7} strokeDasharray="14 12" fill="none" opacity={0.25} />
          <path d={`M 90 80 L ${90 + 400 * route} 80`} stroke={COLORS.navy} strokeWidth={7} fill="none" />
        </svg>
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={box({ left: 34 + i * 200, top: 22, width: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 + 0.65 * clamp(route * 2.4 - i * 0.7 + 0.2) })}>
            <RouteIcon kind={k} size={104} />
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.navy }}>{p.route[i]}</div>
          </div>
        ))}
      </div>
      <div style={box({ left: 36, right: 36, top: 830, padding: "30px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 48, fontWeight: 900, textAlign: "center", boxShadow: "0 10px 24px rgba(255,201,14,0.4)" })}>{p.button}</div>
    </div>
  );
};

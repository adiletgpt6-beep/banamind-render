// Условный экран ноутбука мамы (не копия браузера): рабочие «вкладки» —
// окна-карточки задач. Каскад из восьми окон и жёлтое девятое (хук),
// список вкладок слева и содержимое справа (переключение задач), вкладка
// «Мектепке каттам», которая превращается в схему маршрута.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { BG1_TEXT } from "./script";
import { box } from "./shots";

export const NAVY = "#14285A";
export const YELLOW = "#FFD23F";
export const YELLOW_DEEP = "#F2B705";
export const INK = "#33415E";

// Пружинящее появление 0…1 (небольшой перелёт).
export const pop = (x: number) => {
  const t = clamp(x);
  return t >= 1 ? 1 : 1 - Math.pow(1 - t, 3) * Math.cos(t * 4.2);
};

const TAB_COLORS = ["#4C7BD9", "#3FA27A", "#E0884A", "#8A68C9", "#2E9DB8", "#D2577A", "#5E6E8C", "#4C9A5F"];

// Иконка задачи (простая пиктограмма по номеру вкладки).
const TabIcon: React.FC<{ i: number; s?: number; color?: string }> = ({ i, s = 1, color }) => {
  const c = color ?? TAB_COLORS[i % TAB_COLORS.length];
  return (
    <svg width={44 * s} height={44 * s} viewBox="0 0 44 44">
      <rect x={2} y={2} width={40} height={40} rx={11} fill={c} />
      {i === 0 ? <path d="M 12 30 L 12 22 M 20 30 L 20 15 M 28 30 L 28 19 M 34 30 L 10 30" stroke="#FFF" strokeWidth={4} strokeLinecap="round" /> : null}
      {i === 1 ? <><rect x={11} y={13} width={22} height={19} rx={3} fill="none" stroke="#FFF" strokeWidth={3.5} /><path d="M 11 19 L 33 19" stroke="#FFF" strokeWidth={3.5} /></> : null}
      {i === 2 ? <><rect x={10} y={14} width={24} height={17} rx={3} fill="none" stroke="#FFF" strokeWidth={3.5} /><path d="M 10 15 L 22 24 L 34 15" fill="none" stroke="#FFF" strokeWidth={3.5} /></> : null}
      {i === 3 ? <><circle cx={22} cy={17} r={5.5} fill="#FFF" /><path d="M 12 33 Q 22 20 32 33 Z" fill="#FFF" /></> : null}
      {i === 4 ? <><circle cx={22} cy={22} r={10} fill="none" stroke="#FFF" strokeWidth={3.5} /><path d="M 22 12 L 22 22 L 31 26" fill="none" stroke="#FFF" strokeWidth={3.5} /></> : null}
      {i === 5 ? <><rect x={13} y={10} width={18} height={24} rx={3} fill="none" stroke="#FFF" strokeWidth={3.5} /><path d="M 17 18 L 27 18 M 17 24 L 25 24" stroke="#FFF" strokeWidth={3} /></> : null}
      {i === 6 ? <><rect x={10} y={12} width={24} height={16} rx={2} fill="none" stroke="#FFF" strokeWidth={3.5} /><path d="M 22 28 L 22 33 M 16 33 L 28 33" stroke="#FFF" strokeWidth={3.5} /></> : null}
      {i === 7 ? <path d="M 13 22 L 19 28 L 31 15" fill="none" stroke="#FFF" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {i === 8 ? <><path d="M 10 30 L 10 21 Q 10 15 16 15 L 30 15 Q 34 15 35 20 L 36 30 Z" fill={NAVY} /><circle cx={16} cy={31} r={4} fill={NAVY} /><circle cx={30} cy={31} r={4} fill={NAVY} /></> : null}
    </svg>
  );
};

// Рабочий стол экрана: светлый фон и верхняя панель.
export const Desktop: React.FC<{ children?: React.ReactNode; clock?: string }> = ({ children, clock = BG1_TEXT.clock.now }) => (
  <div style={box({ inset: 0, background: "linear-gradient(180deg, #F3F6FB 0%, #E9EEF6 100%)", fontFamily, overflow: "hidden" })}>
    <div style={box({ left: 0, top: 0, right: 0, height: 120, backgroundColor: NAVY })}>
      <div style={box({ left: 56, top: 44, width: 18, height: 18, borderRadius: 9, backgroundColor: YELLOW })} />
      <div style={box({ left: 88, top: 44, width: 18, height: 18, borderRadius: 9, backgroundColor: "#8FA3C9" })} />
      <div style={box({ right: 56, top: 30, color: "#FFFFFF", fontSize: 44, fontWeight: 800 })}>{clock}</div>
    </div>
    {children}
  </div>
);

// Окно-карточка задачи.
const TaskWindow: React.FC<{ i: number; label: string; x: number; y: number; w: number; s: number; o: number; dim?: number }> = ({ i, label, x, y, w, s, o, dim = 0 }) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: 270,
      borderRadius: 26,
      backgroundColor: "#FFFFFF",
      boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
      transform: `scale(${s})`,
      transformOrigin: "30% 20%",
      opacity: o,
      overflow: "hidden",
      filter: dim ? `saturate(${1 - dim * 0.6})` : undefined,
    })}
  >
    <div style={box({ left: 0, top: 0, right: 0, height: 92, backgroundColor: "#F4F6FA", borderBottom: "2px solid #E3E8F0" })} />
    <div style={box({ left: 26, top: 22 })}>
      <TabIcon i={i} />
    </div>
    <div style={box({ left: 90, top: 18, fontSize: 44, fontWeight: 900, color: NAVY, whiteSpace: "nowrap" })}>{label}</div>
    <div style={box({ right: 28, top: 30, width: 30, height: 30, borderRadius: 8, border: "4px solid #C8D0DC", boxSizing: "border-box" })} />
    {[0, 1, 2].map((r) => (
      <div key={r} style={box({ left: 30, top: 122 + r * 44, width: [w * 0.7, w * 0.55, w * 0.62][r], height: 20, borderRadius: 10, backgroundColor: r === 0 ? "#D9E1EE" : "#E8EDF4" })} />
    ))}
  </div>
);

// Хук: восемь окон открываются по очереди (opens — кадры появления),
// затем выпрыгивает жёлтое девятое (ninthAt).
export const TabCascade: React.FC<{ f: number; opens: readonly number[]; ninthAt: number }> = ({ f, opens, ninthAt }) => {
  const n9 = clamp((f - ninthAt) / 14);
  const shown = opens.filter((o) => f >= o).length + (f >= ninthAt ? 1 : 0);
  return (
    <Desktop>
      {/* счётчик открытых вкладок */}
      <div style={box({ left: 56, top: 160, padding: "10px 26px", borderRadius: 40, backgroundColor: "#FFFFFF", color: NAVY, fontSize: 40, fontWeight: 900, boxShadow: "0 6px 16px rgba(20,40,90,0.10)" })}>
        Ачык: {shown}
      </div>
      {BG1_TEXT.tabs.map((label, i) => {
        const t = (f - opens[i]) / 10;
        if (t < 0) return null;
        const s = lerp(0.6, 1, pop(t));
        return <TaskWindow key={label} i={i} label={label} x={56 + i * 30} y={270 + i * 112} w={760} s={s} o={clamp(t * 2)} dim={n9 * 0.8} />;
      })}
      {f >= ninthAt ? (
        <div
          style={box({
            left: 90,
            top: 560,
            width: 900,
            height: 440,
            borderRadius: 40,
            backgroundColor: YELLOW,
            boxShadow: "0 30px 60px rgba(20,40,90,0.28)",
            transform: `scale(${lerp(0.3, 1, pop(n9))}) rotate(${lerp(-8, 0, easeOut(n9))}deg)`,
            opacity: clamp(n9 * 3),
            overflow: "hidden",
          })}
        >
          <div style={box({ left: 0, top: 0, right: 0, height: 110, backgroundColor: YELLOW_DEEP })} />
          <div style={box({ left: 34, top: 26 })}>
            <TabIcon i={8} s={1.4} color="#FFFFFF" />
          </div>
          <div style={box({ left: 124, top: 26, fontSize: 46, fontWeight: 900, color: NAVY })}>9</div>
          <div style={box({ left: 50, right: 50, top: 150, fontSize: 82, lineHeight: 1.08, fontWeight: 900, color: NAVY })}>{BG1_TEXT.ninth}</div>
        </div>
      ) : null}
    </Desktop>
  );
};

// ---------- Список вкладок и содержимое ----------
export type PageId = "meeting" | "report" | "mail" | "clients" | "school";
const PAGE_TAB: Record<PageId, number> = { report: 0, meeting: 1, mail: 2, clients: 3, school: 8 };

const SIDE = [...BG1_TEXT.tabs.map((label, i) => ({ label, i })), { label: BG1_TEXT.logistic, i: 8 }];

// Содержимое вкладки (правая часть экрана), t — время с открытия (кадры).
const Page: React.FC<{ id: PageId; t: number }> = ({ id, t }) => {
  const P = BG1_TEXT.pages;
  const head = (title: string, color = NAVY) => <div style={{ fontSize: 50, fontWeight: 900, color, marginBottom: 26 }}>{title}</div>;
  const appear = (k: number) => ({ opacity: clamp((t - k * 4) / 8), transform: `translateY(${(1 - easeOut((t - k * 4) / 10)) * 20}px)` });
  if (id === "report") {
    const bars = [0.55, 0.8, 0.42];
    return (
      <div>
        {head(P.report.title)}
        <div style={{ position: "relative", height: 420, display: "flex", alignItems: "flex-end", gap: 40, paddingLeft: 10 }}>
          {bars.map((b, k) => (
            <div key={k} style={{ width: 120, height: 380 * b * easeOut((t - k * 3) / 16), borderRadius: "16px 16px 0 0", backgroundColor: k === 1 ? YELLOW_DEEP : "#4C7BD9" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 40, paddingLeft: 10, marginTop: 14 }}>
          {P.report.rows.map((r) => (
            <div key={r} style={{ width: 120, textAlign: "center", fontSize: 30, fontWeight: 800, color: INK }}>{r}</div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "meeting") {
    return (
      <div>
        {head(P.meeting.title)}
        {P.meeting.rows.map((r, k) => (
          <div key={r} style={{ ...appear(k), display: "flex", alignItems: "center", gap: 20, marginBottom: 22, padding: "22px 24px", borderRadius: 20, backgroundColor: k === 0 ? "#E6EEFB" : "#F3F6FA" }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#3FA27A" }} />
            <div style={{ fontSize: 38, fontWeight: 800, color: NAVY }}>{r}</div>
          </div>
        ))}
      </div>
    );
  }
  if (id === "mail") {
    return (
      <div>
        {head(P.mail.title)}
        <div style={{ ...appear(0), fontSize: 32, fontWeight: 800, color: "#6A7891" }}>{P.mail.from}</div>
        <div style={{ ...appear(1), fontSize: 40, fontWeight: 900, color: NAVY, margin: "8px 0 22px" }}>{P.mail.subject}</div>
        <div style={{ ...appear(2), fontSize: 36, fontWeight: 600, color: INK, lineHeight: 1.3 }}>{P.mail.body}</div>
      </div>
    );
  }
  if (id === "clients") {
    return (
      <div>
        {head(P.clients.title)}
        {P.clients.rows.map((r, k) => (
          <div key={r} style={{ ...appear(k), display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: TAB_COLORS[(k + 3) % 8], color: "#FFF", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{r[0]}</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: NAVY }}>{r}</div>
          </div>
        ))}
      </div>
    );
  }
  // школьная логистика
  return (
    <div>
      {head(P.school.title)}
      {P.school.rows.map(([time, route], k) => (
        <div key={time} style={{ ...appear(k), display: "flex", alignItems: "center", gap: 22, marginBottom: 22, padding: "22px 24px", borderRadius: 22, backgroundColor: "#FFF4C7", border: `4px solid ${YELLOW}` }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: NAVY }}>{time}</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: INK }}>{route}</div>
        </div>
      ))}
    </div>
  );
};

// Экран: слева список вкладок, справа активная вкладка. pages — моменты
// переключения [кадр, вкладка]; курсор подлетает к пункту и щёлкает.
export const TabsScreen: React.FC<{
  f: number;
  pages: readonly (readonly [number, PageId])[];
  closeSchool?: number; // кадр, когда вкладку «Мектепке каттам» закрывают
  clock?: string;
}> = ({ f, pages, closeSchool, clock }) => {
  let cur = 0;
  for (let k = 0; k < pages.length; k++) if (f >= pages[k][0]) cur = k;
  const [at, id] = pages[cur];
  const active = PAGE_TAB[id];
  const rowY = (i: number) => 170 + i * 104;
  // курсор: летит к следующему пункту за 12 кадров до щелчка
  const next = pages[cur + 1];
  const target = next && f >= next[0] - 14 ? PAGE_TAB[next[1]] : active;
  const from = next && f >= next[0] - 14 ? active : cur > 0 ? PAGE_TAB[pages[cur - 1][1]] : active;
  const u = next && f >= next[0] - 14 ? easeInOut((f - (next[0] - 14)) / 12) : 1;
  const cy = lerp(rowY(SIDE.findIndex((x) => x.i === from)), rowY(SIDE.findIndex((x) => x.i === target)), u) + 52;
  const press = next && f >= next[0] - 2 && f < next[0] + 3 ? 0.85 : 1;
  const closed = closeSchool !== undefined ? clamp((f - closeSchool) / 10) : 0;
  return (
    <Desktop clock={clock}>
      <div style={box({ left: 30, top: 150, width: 360, bottom: 30, borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(20,40,90,0.08)" })} />
      {SIDE.map((s, k) => {
        const on = s.i === active && !(s.i === 8 && closed > 0);
        const school = s.i === 8;
        const gone = school ? closed : 0;
        return (
          <div
            key={s.label}
            style={box({
              left: 44,
              top: rowY(k),
              width: 332,
              height: 92,
              borderRadius: 20,
              backgroundColor: on ? (school ? YELLOW : "#E6EEFB") : school ? "#FFF4C7" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingLeft: 14,
              boxSizing: "border-box",
              opacity: 1 - gone,
              transform: `translateX(${-gone * 60}px) scale(${1 - gone * 0.2})`,
            })}
          >
            <TabIcon i={s.i} s={0.95} color={school ? YELLOW_DEEP : undefined} />
            <div style={{ fontSize: s.label.length > 12 ? 27 : 31, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>{s.label}</div>
          </div>
        );
      })}
      <div style={box({ left: 420, top: 150, right: 30, bottom: 30, borderRadius: 26, backgroundColor: "#FFFFFF", padding: 44, boxSizing: "border-box", boxShadow: "0 8px 20px rgba(20,40,90,0.08)", overflow: "hidden" })}>
        {closed < 1 ? (
          <div key={`${id}-${at}`} style={{ opacity: 1 - closed }}>
            <Page id={id} t={f - at} />
          </div>
        ) : null}
      </div>
      {/* курсор */}
      <svg width={60} height={70} viewBox="0 0 30 35" style={box({ left: 300, top: cy, transform: `scale(${press})`, transformOrigin: "0 0" })}>
        <path d="M 2 2 L 2 28 L 9 22 L 14 33 L 19 31 L 14 20 L 24 20 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
    </Desktop>
  );
};

// ---------- Схема маршрута на экране ----------
// draw 0…1 — линия маршрута прорисовывается; back 0…1 — обратный путь.
export const RouteSchematic: React.FC<{ f: number; draw: number; back: number; intro: number }> = ({ draw, back, intro }) => {
  const R = BG1_TEXT.route;
  const H = { x: 230, y: 1100 };
  const S = { x: 850, y: 420 };
  const path = `M ${H.x} ${H.y} C ${H.x + 40} ${H.y - 320}, ${S.x - 420} ${S.y + 360}, ${S.x} ${S.y}`;
  const len = 1250;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" })}>
      {/* условные кварталы Бишкека: ровная сетка улиц */}
      <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity: 0.9 * intro })}>
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={60 + i * 120} y1={200} x2={60 + i * 120} y2={1500} stroke="#EEF1F6" strokeWidth={26} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={260 + i * 120} x2={1080} y2={260 + i * 120} stroke="#EEF1F6" strokeWidth={26} />
        ))}
        <path d={path} fill="none" stroke="#E3E8F0" strokeWidth={34} strokeLinecap="round" />
        <path d={path} fill="none" stroke={YELLOW_DEEP} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} />
        {back > 0 ? <path d={path} fill="none" stroke={NAVY} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 26" strokeDashoffset={-len * (1 - back)} opacity={0.75} /> : null}
      </svg>
      {/* точки: Үй и Мектеп */}
      <div style={box({ left: H.x - 90, top: H.y - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: NAVY, transform: `scale(${pop(intro)})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width={92} height={92} viewBox="0 0 40 40"><path d="M 6 20 L 20 8 L 34 20 L 30 20 L 30 33 L 10 33 L 10 20 Z" fill="#FFFFFF" /><rect x={17} y={24} width={6} height={9} fill={NAVY} /></svg>
      </div>
      <div style={box({ left: H.x - 110, top: H.y + 100, width: 220, textAlign: "center", fontSize: 48, fontWeight: 900, color: NAVY })}>{R.home}</div>
      <div style={box({ left: S.x - 90, top: S.y - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: YELLOW, transform: `scale(${pop(clamp((draw - 0.85) / 0.15))})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <svg width={96} height={96} viewBox="0 0 40 40"><path d="M 5 34 L 5 16 L 20 7 L 35 16 L 35 34 Z" fill={NAVY} /><rect x={11} y={19} width={5} height={5} fill={YELLOW} /><rect x={24} y={19} width={5} height={5} fill={YELLOW} /><rect x={17} y={26} width={6} height={8} fill={YELLOW} /></svg>
      </div>
      <div style={box({ left: S.x - 130, top: S.y + 100, width: 260, textAlign: "center", fontSize: 48, fontWeight: 900, color: NAVY })}>{R.school}</div>
      <div style={box({ left: 60, top: 190, padding: "12px 30px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 44, fontWeight: 900, opacity: intro })}>{R.city}</div>
    </div>
  );
};

// ---------- Мост: календарь дня ----------
// Встреча стоит на 16:30–17:30 и перекрывает «Сабак бүтөт 17:00». Мама
// тянет встречу ниже (drag 0…1 — 17:30–18:30), но там уже встреча с
// клиентом — снова красный конфликт; встреча возвращается на место (back).
export const CalendarScreen: React.FC<{ f: number; clashAt: number; drag: number; back: number }> = ({ f, clashAt, drag, back }) => {
  const C = BG1_TEXT.calendar;
  const top = 290;
  const hour = 250; // px на час
  const y = (h: number) => top + (h - 15) * hour;
  const pos = drag * (1 - back); // 0 — 16:30, 1 — 17:30
  const meetY = y(16.5 + pos);
  const clashSchool = clamp((f - clashAt) / 8) * (1 - clamp(pos * 3));
  const clashClient = clamp((pos - 0.75) / 0.25);
  const red = Math.max(clashSchool, clashClient);
  const blink = 0.75 + 0.25 * Math.sin(f / 3);
  return (
    <Desktop clock="16:41">
      <div style={box({ left: 30, top: 150, right: 30, bottom: 30, borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(20,40,90,0.08)" })} />
      <div style={box({ left: 70, top: 180, fontSize: 50, fontWeight: 900, color: NAVY })}>{C.title}</div>
      {C.hours.map((h, i) => (
        <div key={h}>
          <div style={box({ left: 70, top: y(15 + i) - 22, width: 140, fontSize: 36, fontWeight: 800, color: "#7A879E" })}>{h}</div>
          <div style={box({ left: 210, top: y(15 + i), right: 70, height: 3, backgroundColor: "#E6EBF2" })} />
        </div>
      ))}
      {/* сабак бүтөт 17:00 — жёлтая метка на линии времени */}
      <div style={box({ left: 210, top: y(17) - 6, right: 70, height: 12, borderRadius: 6, backgroundColor: YELLOW_DEEP })} />
      <div style={box({ left: 680, top: y(17) - 64, padding: "8px 20px", borderRadius: 30, backgroundColor: YELLOW, fontSize: 32, fontWeight: 900, color: NAVY, display: "flex", alignItems: "center", gap: 10 })}>
        <TabIcon i={8} s={0.8} color="#FFFFFF" />
        {C.school} 17:00
      </div>
      {/* встреча с клиентом 17:45–18:45 */}
      <div style={box({ left: 240, top: y(17.75) + 4, width: 420, height: hour - 8, borderRadius: 22, backgroundColor: "#EEE7FB", border: `5px solid ${clashClient > 0 ? `rgba(226,75,75,${clashClient * blink})` : "#CBBDF0"}`, boxSizing: "border-box", padding: "18px 24px", fontSize: 38, fontWeight: 900, color: "#4E3A8C" })}>
        {C.client}
        <div style={{ fontSize: 30, fontWeight: 800, color: "#7A68B5" }}>17:45 – 18:45</div>
      </div>
      {/* встреча, которую мама пытается перенести */}
      <div style={box({ left: 240, top: meetY + 4, width: 420, height: hour - 8, borderRadius: 22, backgroundColor: "#E3ECFC", border: `5px solid ${red > 0 ? `rgba(226,75,75,${red * blink})` : "#A9C1EE"}`, boxSizing: "border-box", padding: "18px 24px", fontSize: 40, fontWeight: 900, color: NAVY, boxShadow: drag > 0 && back < 1 ? "0 18px 30px rgba(20,40,90,0.22)" : "none", transform: `scale(${1 + 0.03 * drag * (1 - back)})` })}>
        {C.meeting}
        <div style={{ fontSize: 30, fontWeight: 800, color: "#5A6E96" }}>{pos < 0.5 ? "16:30 – 17:30" : "17:30 – 18:30"}</div>
      </div>
      {red > 0.05 ? (
        <div style={box({ left: 690, top: meetY + 70, width: 96, height: 96, borderRadius: 48, backgroundColor: "#E24B4B", color: "#FFFFFF", fontSize: 66, fontWeight: 900, textAlign: "center", lineHeight: "96px", opacity: red, transform: `scale(${lerp(0.6, 1, pop(red))})` })}>!</div>
      ) : null}
      {red > 0.05 ? (
        <div style={box({ left: 70, right: 70, top: y(19) + 40, textAlign: "center", fontSize: 46, fontWeight: 900, color: "#C73636", opacity: red })}>{C.clash}</div>
      ) : null}
      {/* курсор держит встречу */}
      <svg width={60} height={70} viewBox="0 0 30 35" style={box({ left: 520, top: meetY + 120 + (drag > 0 ? 0 : 60 * (1 - clamp((f - clashAt - 10) / 12))) })}>
        <path d="M 2 2 L 2 28 L 9 22 L 14 33 L 19 31 L 14 20 L 24 20 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
    </Desktop>
  );
};

// ---------- Мост: поиск и карточка BalaGo ----------
// typed 0…1 — сколько запроса набрано; found — карточка результата
// появилась; click — щелчок по «Толугураак».
export const BalaGoCard: React.FC<{ press?: number }> = ({ press = 0 }) => {
  const S = BG1_TEXT.search;
  return (
    <div style={{ borderRadius: 36, backgroundColor: "#FFFFFF", border: `5px solid ${YELLOW}`, boxShadow: "0 20px 44px rgba(20,40,90,0.16)", padding: 36, fontFamily }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 150, height: 150, borderRadius: 75 }} />
        <div>
          <div style={{ fontSize: 50, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{S.title}</div>
          <div style={{ marginTop: 10, display: "inline-block", padding: "6px 20px", borderRadius: 24, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 32, fontWeight: 900 }}>{S.city}</div>
        </div>
      </div>
      <div style={{ marginTop: 26, fontSize: 44, fontWeight: 900, color: INK }}>{S.route}</div>
      <div style={{ marginTop: 26, display: "inline-block", padding: "16px 40px", borderRadius: 40, backgroundColor: press > 0.5 ? YELLOW_DEEP : YELLOW, color: NAVY, fontSize: 44, fontWeight: 900, transform: `scale(${1 - 0.06 * Math.sin(Math.PI * clamp(press))})` }}>{S.more}</div>
    </div>
  );
};

export const SearchScreen: React.FC<{ f: number; typeFrom: number; typeTo: number; found: number; click: number }> = ({ f, typeFrom, typeTo, found, click }) => {
  const q = BG1_TEXT.search.query;
  const n = Math.round(q.length * clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)));
  const shown = q.slice(0, n);
  const caret = f < found && Math.floor(f / 8) % 2 === 0;
  const card = easeOut((f - found) / 12);
  const press = clamp((f - click + 4) / 10);
  // курсор подлетает к кнопке «Толугураак»
  const cur = easeInOut((f - (click - 16)) / 12);
  return (
    <Desktop clock="16:42">
      <div style={box({ left: 60, top: 470, right: 60, height: 120, borderRadius: 60, backgroundColor: "#FFFFFF", border: `5px solid ${f >= typeFrom ? YELLOW : "#DCE3EE"}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, paddingLeft: 34, boxShadow: "0 10px 26px rgba(20,40,90,0.10)" })}>
        <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round"><circle cx={10} cy={10} r={6.5} /><path d="M 15 15 L 21 21" /></svg>
        <div style={{ fontSize: 46, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>
          {shown}
          <span style={{ opacity: caret ? 1 : 0, color: YELLOW_DEEP }}>|</span>
        </div>
      </div>
      {f >= found ? (
        <div style={box({ left: 60, right: 60, top: 660, opacity: card, transform: `translateY(${(1 - card) * 40}px)` })}>
          <BalaGoCard press={press} />
        </div>
      ) : null}
      {f >= found ? (
        <svg width={60} height={70} viewBox="0 0 30 35" style={box({ left: lerp(880, 250, cur), top: lerp(1450, 1040, cur), transform: `scale(${press > 0 && press < 1 ? 0.85 : 1})`, transformOrigin: "0 0" })}>
          <path d="M 2 2 L 2 28 L 9 22 L 14 33 L 19 31 L 14 20 L 24 20 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={2.4} strokeLinejoin="round" />
        </svg>
      ) : null}
    </Desktop>
  );
};

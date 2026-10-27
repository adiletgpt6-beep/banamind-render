// Экраны ролика: слайды презентации (проект → схема маршрута → порядок
// «топ түзүү → акысыз сыноо → чечим»), телефон мамы (напоминание,
// календарь, поиск, страница BalaGo). Тексты — кыргызча, крупно.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { B6_TEXT } from "./script";
import { box } from "./shots";

export const INK = "#1E2235";
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);

// ---------- Иконки маршрута ----------
export const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
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

// ---------- Слайд презентации ----------
// Базовый размер 1600×900, масштабируется под контейнер шириной w.
// route: 0 — слайд проекта, 1 — схема маршрута (элементы перестраиваются);
// terms: 0…1 — переход к порядку «топ → сыноо → чечим»; lit — подсветка
// шагов (0…3); reveal — раскрытие слайда проекта (0…1).
export type SlideState = {
  readonly reveal?: number;
  readonly route?: number;
  readonly terms?: number;
  readonly lit?: number;
  readonly dot?: { x: number; y: number; on: number } | null; // лазерная точка (база 1600×900)
};

export const Slide: React.FC<{ w: number; s: SlideState }> = ({ w, s }) => {
  const k = w / 1600;
  const reveal = s.reveal ?? 1;
  const route = easeInOut(s.route ?? 0);
  const terms = easeInOut(s.terms ?? 0);
  const lit = s.lit ?? 0;
  const t = B6_TEXT.slide;
  const r = B6_TEXT.routeSlide;
  const tm = B6_TEXT.terms;
  // столбики проекта сжимаются в точки маршрута
  const bars = [0.55, 0.8, 0.68];
  return (
    <div style={box({ left: 0, top: 0, width: 1600, height: 900, transform: `scale(${k})`, transformOrigin: "0 0", backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy, overflow: "hidden" })}>
      {/* шапка */}
      <div style={box({ left: 0, top: 0, width: 1600, height: 120, backgroundColor: route > 0.5 ? COLORS.yellow : "#2F4A7A" })} />
      <div style={box({ left: 70, top: 26, fontSize: 56, fontWeight: 900, color: route > 0.5 ? COLORS.navy : "#FFFFFF" })}>{route > 0.5 ? (terms > 0.5 ? tm.title : r.title) : t.project}</div>
      <div style={box({ right: 60, top: 36, fontSize: 40, fontWeight: 800, color: route > 0.5 ? COLORS.navy : "#C9D6EE" })}>{route > 0.5 ? "BalaGo" : t.page}</div>

      {/* слайд проекта */}
      <div style={box({ left: 0, top: 120, width: 1600, height: 780, opacity: 1 - route, translate: `0 ${(1 - reveal) * 40}px` })}>
        <div style={box({ left: 90, top: 70, fontSize: 92, fontWeight: 900, opacity: appear(reveal * 30, 0, 12) })}>{t.title}</div>
        {t.bullets.map((b, i) => (
          <div key={b} style={box({ left: 100, top: 230 + i * 110, display: "flex", alignItems: "center", gap: 26, fontSize: 54, fontWeight: 800, opacity: clamp(reveal * 3 - i * 0.6) })}>
            <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.yellow }} />
            {b}
          </div>
        ))}
        {bars.map((h, i) => (
          <div key={i} style={box({ left: 1000 + i * 170, top: 640 - 460 * h * clamp(reveal * 1.4 - i * 0.15), width: 120, height: 460 * h * clamp(reveal * 1.4 - i * 0.15), borderRadius: "14px 14px 0 0", backgroundColor: ["#9DB8E6", "#2F4A7A", COLORS.yellow][i] })} />
        ))}
        <div style={box({ left: 960, top: 640, width: 560, height: 6, backgroundColor: "#C9D3E3" })} />
      </div>

      {/* схема маршрута: ҮЙ → МЕКТЕП → ҮЙ */}
      <div style={box({ left: 0, top: 120, width: 1600, height: 780, opacity: route * (1 - terms) })}>
        <svg width={1600} height={780} viewBox="0 0 1600 780" style={box({ left: 0, top: 0 })}>
          <path d="M 300 330 L 1300 330" stroke={COLORS.navy} strokeWidth={12} strokeDasharray="26 20" fill="none" opacity={0.2} />
          <path d={`M 300 330 L ${300 + 1000 * clamp(route * 1.3 - 0.3)} 330`} stroke={COLORS.navy} strokeWidth={12} fill="none" />
        </svg>
        {(["home", "school", "home"] as const).map((kind, i) => {
          const from = { x: 1000 + i * 170 + 60, y: 480 };
          const to = { x: 300 + i * 500, y: 330 };
          const x = lerp(from.x, to.x, route);
          const y = lerp(from.y, to.y, route);
          const size = lerp(60, 190, route);
          return (
            <div key={i} style={box({ left: x - size / 2, top: y - size / 2, width: size, height: size })}>
              <RouteIcon kind={kind} size={size} />
              <div style={box({ left: -100, width: size + 200, top: size + 14, textAlign: "center", fontSize: 54, fontWeight: 900, opacity: clamp(route * 2 - 1) })}>{r.route[i]}</div>
            </div>
          );
        })}
        <div style={box({ left: 300 + 250 - 200, top: 560, width: 400, textAlign: "center", fontSize: 38, fontWeight: 800, color: "#5A6B8C", opacity: clamp(route * 2 - 1) })}>{r.morning}</div>
        <div style={box({ left: 800 + 250 - 200, top: 560, width: 400, textAlign: "center", fontSize: 38, fontWeight: 800, color: "#5A6B8C", opacity: clamp(route * 2 - 1) })}>{r.after}</div>
      </div>

      {/* порядок: топ түзүү → акысыз сыноо → чечим */}
      <div style={box({ left: 0, top: 120, width: 1600, height: 780, opacity: terms })}>
        {tm.steps.map((st, i) => {
          const on = clamp(lit - i);
          const x = 80 + i * 500;
          return (
            <div key={st}>
              <div style={box({ left: x, top: 120 + (1 - terms) * 40, width: 440, height: 400, borderRadius: 36, backgroundColor: on > 0 ? COLORS.yellowSoft : "#F3F5F9", border: `8px solid ${on > 0 ? COLORS.yellow : "#DDE3EE"}`, boxSizing: "border-box", scale: `${1 + 0.04 * on * (1 - clamp(lit - i - 1))}` })}>
                <div style={box({ left: 0, right: 0, top: 40, display: "flex", justifyContent: "center" })}>
                  <div style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: on > 0 ? COLORS.navy : "#B9C3D3", color: "#FFFFFF", fontSize: 64, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                </div>
                <div style={box({ left: 10, right: 10, top: 180, textAlign: "center", fontSize: 58, fontWeight: 900, lineHeight: 1.05 })}>{st}</div>
                <div style={box({ left: 20, right: 20, top: 290, textAlign: "center", fontSize: 34, fontWeight: 800, color: "#5A6B8C", lineHeight: 1.15 })}>{tm.notes[i]}</div>
              </div>
              {i < 2 ? <div style={box({ left: x + 446, top: 290, fontSize: 70, fontWeight: 900, color: clamp(lit - i - 0.6) > 0 ? COLORS.navy : "#C9D3E3" })}>→</div> : null}
            </div>
          );
        })}
        <div style={box({ left: 80, right: 80, top: 600, padding: "22px 0", borderRadius: 24, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 40, fontWeight: 900, textAlign: "center", opacity: clamp(lit - 2.4) })}>{tm.honest}</div>
      </div>

      {s.dot && s.dot.on > 0 ? (
        <div style={box({ left: s.dot.x - 16, top: s.dot.y - 16, width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF3B3B", opacity: s.dot.on, boxShadow: "0 0 24px 10px rgba(255,59,59,0.45)" })} />
      ) : null}
    </div>
  );
};

// ---------- Телефон ----------
export const StatusBar: React.FC<{ time: string; dark?: boolean }> = ({ time, dark }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: dark ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Содержимое экрана рисуется в базовой ширине 700 и масштабируется под w.
export const PHONE_BASE = 700;
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; shake?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, shake = 0, children }) => {
  const k = w / PHONE_BASE;
  const W = PHONE_BASE;
  const h = W * 2.05;
  return (
    <div style={box({ left: x + shake, top: y, width: W, height: h, transformOrigin: "0 0", scale: `${k}`, rotate: `${tilt}deg` })}>
      <div style={box({ inset: 0, borderRadius: W * 0.11, backgroundColor: INK, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })} />
      <div style={box({ left: W * 0.035, top: W * 0.035, right: W * 0.035, bottom: W * 0.035, borderRadius: W * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: W * 0.38, top: W * 0.05, width: W * 0.24, height: W * 0.05, borderRadius: W * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука мамы, держащая телефон снизу (субъективная камера). HoldBack —
// рукав и ладонь за корпусом (рисуется до телефона), HoldFront — большой
// палец и кончики пальцев на краях корпуса (после телефона): экран открыт.
export const HoldBack: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.05, top: y + h * 0.86, width: w * 0.7, height: h * 0.7, borderRadius: w * 0.25, backgroundColor: sleeve, rotate: "14deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x - w * 0.06, top: y + h * 0.62, width: w * 1.1, height: h * 0.34, borderRadius: w * 0.3, backgroundColor: skin })} />
    </>
  );
};
export const HoldFront: React.FC<{ x: number; y: number; w: number; skin: string }> = ({ x, y, w, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x - w * 0.07, top: y + h * 0.66, width: w * 0.12, height: w * 0.32, borderRadius: w * 0.06, backgroundColor: skin, rotate: "12deg", boxShadow: "3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x + w * 0.955, top: y + h * (0.6 + i * 0.075), width: w * 0.09, height: w * 0.12, borderRadius: w * 0.045, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, нажимающий на экран (кончик в точке x, y кадра).
export const TapFinger: React.FC<{ x: number; y: number; sleeve: string; skin: string; press?: number }> = ({ x, y, sleeve, skin, press = 0 }) => (
  <>
    <div style={box({ left: x - 40, top: y + 190, width: 130, height: 460, borderRadius: 65, backgroundColor: sleeve, rotate: "-24deg", transformOrigin: "50% 0%" })} />
    <div style={box({ left: x - 30, top: y + 70, width: 100, height: 150, borderRadius: 48, backgroundColor: skin, rotate: "-22deg" })} />
    <div style={box({ left: x - 16, top: y - 4 + press * 6, width: 34, height: 104, borderRadius: 17, backgroundColor: skin, rotate: "-18deg", transformOrigin: "50% 0%", boxShadow: "-3px 4px 8px rgba(20,30,60,0.2)" })} />
  </>
);

// Экран блокировки с напоминанием «14:30 — сабак бүтөт».
export const ReminderScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const r = B6_TEXT.reminder;
  const a = appear(f, at, 8);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #2F4A7A, #5C7BB0)" })}>
      <StatusBar time="13:55" dark />
      <div style={box({ left: 0, right: 0, top: 110, textAlign: "center", fontSize: 150, fontWeight: 300, color: "#FFFFFF" })}>13:55</div>
      <div style={box({ left: 30, right: 30, top: 380, padding: "28px 30px", borderRadius: 36, backgroundColor: "rgba(255,255,255,0.94)", opacity: a, translate: `0 ${(1 - a) * -40}px`, color: INK })}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>⏰</div>
          {r.app}
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, marginTop: 10 }}>{r.time}</div>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>{r.text}</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#B5482F", marginTop: 8 }}>{r.sub}</div>
      </div>
    </div>
  );
};

// Календарь недели: каждый день «Мектеп 14:30» пересекается с работой.
export const CalendarScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const c = B6_TEXT.calendar;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="14:02" />
      <div style={box({ left: 40, top: 90, fontSize: 52, fontWeight: 900, color: INK })}>{c.title}</div>
      {c.days.map((d, i) => {
        const a = appear(f, at + 4 + i * 5, 8);
        const y = 190 + i * 196;
        return (
          <div key={d} style={box({ left: 30, right: 30, top: y, height: 176, opacity: a, translate: `${(1 - a) * 40}px 0` })}>
            <div style={box({ left: 0, top: 0, width: 110, height: 176, fontSize: 36, fontWeight: 900, color: "#5A6B8C", display: "flex", alignItems: "center" })}>{d}</div>
            <div style={box({ left: 120, right: 0, top: 10, height: 70, borderRadius: 16, backgroundColor: "#DCE6F7", fontSize: 32, fontWeight: 800, color: INK, display: "flex", alignItems: "center", padding: "0 20px" })}>{c.work} 14:00</div>
            <div style={box({ left: 160, right: 0, top: 92, height: 72, borderRadius: 16, backgroundColor: COLORS.yellowSoft, border: `4px solid ${COLORS.yellow}`, boxSizing: "border-box", fontSize: 34, fontWeight: 900, color: INK, display: "flex", alignItems: "center", padding: "0 20px" })}>{c.school}</div>
            <div style={box({ left: 128, top: 30, width: 18, height: 120, borderRadius: 9, backgroundColor: "#E5533D", opacity: appear(f, at + 30 + i * 3, 6) })} />
          </div>
        );
      })}
      <div style={box({ left: 40, right: 40, top: 1180, padding: "18px 0", borderRadius: 20, backgroundColor: "#FCE4DF", color: "#B5482F", fontSize: 36, fontWeight: 900, textAlign: "center", opacity: appear(f, at + 44, 8) })}>{c.clash}</div>
    </div>
  );
};

// Поиск: запрос набирается, появляется результат BalaGo.
export const SearchScreen: React.FC<{ f: number; typeFrom: number; typeTo: number; resultAt: number; tapAt: number }> = ({ f, typeFrom, typeTo, resultAt, tapAt }) => {
  const q = B6_TEXT.search;
  const n = Math.round(q.query.length * clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)));
  const caret = Math.floor(f / 8) % 2 === 0 && f < resultAt;
  const res = appear(f, resultAt, 10);
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.96, 1], CL);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="14:04" />
      <div style={box({ left: 30, right: 30, top: 100, minHeight: 120, borderRadius: 30, border: "4px solid #DCE3EE", padding: "18px 26px", fontSize: 38, fontWeight: 800, color: INK, lineHeight: 1.25, boxSizing: "border-box" })}>
        🔍 {q.query.slice(0, n)}
        {caret ? <span style={{ color: COLORS.navy }}>|</span> : null}
      </div>
      <div style={box({ left: 30, right: 30, top: 300, padding: "28px 28px", borderRadius: 28, backgroundColor: COLORS.yellowSoft, border: `4px solid ${COLORS.yellow}`, opacity: res, translate: `0 ${(1 - res) * 30}px`, scale: `${press}`, display: "flex", gap: 22, alignItems: "center" })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 110, height: 110, borderRadius: 55, objectFit: "cover" }} />
        <div>
          <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.navy, lineHeight: 1.1 }}>{q.resultTitle}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#5A6B8C", marginTop: 6 }}>{q.resultSub}</div>
        </div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: 30, right: 30, top: 520 + i * 150, height: 120, borderRadius: 24, backgroundColor: "#F3F5F9", opacity: res * 0.8 })}>
          <div style={box({ left: 28, top: 30, width: 380, height: 22, borderRadius: 11, backgroundColor: "#DCE3EE" })} />
          <div style={box({ left: 28, top: 70, width: 240, height: 18, borderRadius: 9, backgroundColor: "#E7ECF3" })} />
        </div>
      ))}
    </div>
  );
};

// Страница BalaGo: маршрут ҮЙ → МЕКТЕП → ҮЙ, порядок «дарек → мектеп →
// убакыт», кнопка «Шилтемени сактоо» → «сакталды».
export const BalaGoPage: React.FC<{ f: number; at: number; stepsAt: number; tapAt?: number; savedAt?: number }> = ({ f, at, stepsAt, tapAt, savedAt }) => {
  const p = B6_TEXT.page;
  const route = clamp((f - at - 8) / 30);
  const press = tapAt !== undefined ? interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL) : 1;
  const saved = savedAt !== undefined ? appear(f, savedAt, 10) : 0;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="14:05" />
      <div style={box({ left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 150, height: 150, borderRadius: 75, objectFit: "cover" }} />
        <div style={{ fontSize: 66, fontWeight: 900, color: COLORS.navy }}>{p.brand}</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
      </div>
      <div style={box({ left: 36, right: 36, top: 440, height: 190, borderRadius: 30, backgroundColor: COLORS.yellowSoft })}>
        <svg width="100%" height="100%" viewBox="0 0 560 190" style={box({ inset: 0 })}>
          <path d="M 80 72 L 480 72" stroke={COLORS.navy} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.25} />
          <path d={`M 80 72 L ${80 + 400 * route} 72`} stroke={COLORS.navy} strokeWidth={6} fill="none" />
        </svg>
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={box({ left: 26 + i * 205, top: 18, width: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 + 0.6 * clamp(route * 2.2 - i * 0.6 + 0.2) })}>
            <RouteIcon kind={k} size={100} />
            <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.navy }}>{p.route[i]}</div>
          </div>
        ))}
      </div>
      {p.steps.map((st, i) => {
        const a = appear(f, stepsAt + i * 12, 8);
        return (
          <div key={st} style={box({ left: 36, right: 36, top: 670 + i * 112, height: 92, borderRadius: 22, border: `4px solid ${a > 0.5 ? COLORS.navy : "#DCE3EE"}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", opacity: 0.35 + 0.65 * a, fontSize: 40, fontWeight: 900, color: INK })}>
            <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: a > 0.5 ? COLORS.yellow : "#E7ECF3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{i + 1}</div>
            {st}
          </div>
        );
      })}
      <div style={box({ left: 36, right: 36, top: 1030, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 42, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - saved, boxShadow: "0 10px 24px rgba(255,201,14,0.4)" })}>{p.save}</div>
      <div style={box({ left: 36, right: 36, top: 1010, padding: "24px 20px", borderRadius: 28, backgroundColor: "#FFFFFF", border: "4px solid #3E8E5E", display: "flex", alignItems: "center", gap: 18, opacity: saved, scale: `${0.96 + 0.04 * saved}` })}>
        <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 44, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: INK, lineHeight: 1.15 }}>{p.saved}</div>
      </div>
    </div>
  );
};

// Крупные планы (кадр 1080×1920, вид сверху на стол или на экран телефона).
// Все надписи по-кыргызски, в безопасной зоне Reels (сверху ≥ 250 px,
// снизу ≥ 400 px — там субтитры, справа ≥ 150 px от кнопок).
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { BG020_TEXT } from "./script";

const T = BG020_TEXT;
const fade = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Стол сверху: тёплое дерево и мягкий свет лампы.
const TableTop: React.FC<{ readonly children: React.ReactNode; readonly drift?: number }> = ({ children, drift = 0 }) => (
  <div style={abs({ inset: 0, overflow: "hidden", backgroundColor: "#A9774F" })}>
    <div style={abs({ inset: -40, backgroundImage: "repeating-linear-gradient(8deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 46px), repeating-linear-gradient(8deg, rgba(80,40,20,0.06) 0 2px, transparent 2px 23px)", translate: `${drift}px 0` })} />
    {/* край белой скатерти с фирменной полосой */}
    <div style={abs({ left: -40, right: -40, bottom: -80, height: 300, backgroundColor: "#F7F1E6", rotate: "-3deg" })}>
      <div style={abs({ left: 0, right: 0, top: 26, height: 14, backgroundColor: "#F2C230" })} />
      <div style={abs({ left: 0, right: 0, top: 48, height: 6, backgroundColor: "#2F4A7A", opacity: 0.6 })} />
    </div>
    {children}
    <div style={abs({ inset: 0, background: "radial-gradient(circle at 70% 18%, rgba(255,214,150,0.32), transparent 60%)", pointerEvents: "none" })} />
  </div>
);

// Небольшая подпись места и времени (верх кадра).
export const PlaceTag: React.FC<{ readonly f: number; readonly from?: number; readonly to?: number }> = ({ f, from = 6, to = 1e9 }) => (
  <div
    style={abs({
      left: 90,
      top: 270,
      padding: "12px 26px",
      borderRadius: 999,
      backgroundColor: "rgba(255,253,246,0.92)",
      color: COLORS.navy,
      fontFamily,
      fontSize: 36,
      fontWeight: 800,
      opacity: fade(f, from, 14) * (1 - fade(f, to, 12)),
      boxShadow: "0 8px 22px rgba(60,40,20,0.18)",
      display: "flex",
      alignItems: "center",
      gap: 14,
    })}
  >
    <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.yellow }} />
    {T.place}
  </div>
);

// ---------- Книга сына (вид сверху, страница переворачивается) ----------
const PageLines: React.FC<{ readonly n: number; readonly w?: number }> = ({ n, w = 300 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ height: 10, width: w - ((i * 37) % 90), borderRadius: 5, backgroundColor: "#C9C2B2", marginBottom: 22 }} />
    ))}
  </>
);

const Illustration: React.FC = () => (
  <svg width={300} height={200} viewBox="0 0 300 200">
    <rect width={300} height={200} rx={16} fill="#EAF3FC" />
    <circle cx={226} cy={56} r={26} fill="#FFC90E" />
    <path d="M 0 170 L 60 90 L 110 140 L 170 70 L 240 150 L 300 110 L 300 200 L 0 200 Z" fill="#9DB2CC" />
    <path d="M 160 82 L 170 70 L 182 86 Z M 52 100 L 60 90 L 70 104 Z" fill="#FFFFFF" />
    <path d="M 0 185 Q 150 160 300 185 L 300 200 L 0 200 Z" fill="#7FAF63" />
  </svg>
);

export const BookInsert: React.FC<{ readonly f: number; readonly flipAt: number; readonly flipDur?: number; readonly zoom?: number }> = ({ f, flipAt, flipDur = 26, zoom = 1 }) => {
  const u = easeInOut((f - flipAt) / flipDur);
  const page = { width: 420, height: 600 };
  return (
    <TableTop drift={-f * 0.15}>
      <div style={abs({ left: 540, top: 820, scale: String(zoom), rotate: "-4deg" })}>
        {/* тень и обложка */}
        <div style={abs({ left: -462, top: -330, width: 924, height: 660, borderRadius: 18, backgroundColor: "#F2C230", boxShadow: "0 30px 60px rgba(50,30,15,0.35)" })} />
        {/* левая страница */}
        <div style={abs({ left: -440, top: -310, ...page, backgroundColor: "#FFFDF6", borderRadius: "14px 0 0 14px", padding: 50, boxSizing: "border-box", background: "linear-gradient(90deg, #FFFDF6 85%, #EDE6D6)" })}>
          {u < 0.5 ? <Illustration /> : <PageLines n={3} />}
          <div style={{ height: 30 }} />
          <PageLines n={u < 0.5 ? 6 : 10} />
        </div>
        {/* правая страница (следующая) */}
        <div style={abs({ left: 20, top: -310, ...page, backgroundColor: "#FFFDF6", borderRadius: "0 14px 14px 0", padding: 50, boxSizing: "border-box", background: "linear-gradient(270deg, #FFFDF6 85%, #EDE6D6)" })}>
          <PageLines n={u < 0.02 ? 13 : 5} />
          {u < 0.02 ? null : <Illustration />}
        </div>
        {/* переворачиваемая страница */}
        {u > 0 && u < 1 ? (
          <div style={abs({ left: 20, top: -310, ...page, perspective: 1600 })}>
            <div
              style={abs({
                inset: 0,
                transformOrigin: "-20px 50%",
                transform: `rotateY(${-180 * u}deg)`,
                backgroundColor: u < 0.5 ? "#FFFDF6" : "#F7F1E3",
                borderRadius: 14,
                boxShadow: `${-30 * Math.sin(Math.PI * u)}px 10px 40px rgba(60,40,20,${0.25 * Math.sin(Math.PI * u)})`,
                padding: 50,
                boxSizing: "border-box",
              })}
            >
              {u < 0.5 ? <PageLines n={13} /> : null}
            </div>
          </div>
        ) : null}
        <div style={abs({ left: -6, top: -310, width: 12, height: 600, background: "linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0))" })} />
      </div>
    </TableTop>
  );
};

// ---------- Блокнот мамы ----------
// До pageAt — страница «Жума»; затем лист переворачивается и рука выводит
// «Дүйшөмбү: ким жеткирет?» (writeFrom … writeFrom + writeDur).
export const NotebookInsert: React.FC<{ readonly f: number; readonly pageAt: number; readonly writeFrom: number; readonly writeDur: number }> = ({ f, pageAt, writeFrom, writeDur }) => {
  const flip = easeInOut((f - pageAt) / 18);
  const w = clamp((f - writeFrom) / writeDur);
  const line1 = clamp(w / 0.42);
  const line2 = clamp((w - 0.5) / 0.5);
  const hand = { fontFamily, color: "#1F3266", fontWeight: 800, fontStyle: "italic" as const };
  // кончик карандаша: следует за выводимой строкой
  const tipX = 170 + (w < 0.5 ? line1 * 470 : line2 * 600);
  const tipY = w < 0.5 ? 640 : 780;
  return (
    <TableTop drift={-f * 0.1}>
      <div style={abs({ left: 150, top: 300, width: 780, height: 1000, rotate: "2deg" })}>
        <div style={abs({ inset: 0, borderRadius: 22, backgroundColor: "#5E9A93", boxShadow: "0 30px 60px rgba(50,30,15,0.35)" })} />
        <div style={abs({ left: 24, top: 20, right: 24, bottom: 24, borderRadius: 14, backgroundColor: "#FFFDF6", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 68px, rgba(90,120,170,0.25) 68px 70px)", backgroundPositionY: 120 })}>
          {flip < 0.5 ? (
            <div style={{ padding: "110px 70px", opacity: 1 - flip * 2 }}>
              <div style={{ ...hand, fontSize: 96 }}>{T.notebook.friday}</div>
              <div style={{ ...hand, fontSize: 52, marginTop: 30, color: "#3A4F80" }}>{T.notebook.fridayNote}</div>
              <svg width={90} height={80} viewBox="0 0 90 80" style={{ marginTop: 26 }}>
                <path d="M 45 72 C 10 48 4 26 18 14 C 30 4 42 10 45 22 C 48 10 60 4 72 14 C 86 26 80 48 45 72 Z" fill="none" stroke="#E5677A" strokeWidth={6} />
              </svg>
            </div>
          ) : (
            <div style={{ padding: "250px 70px 0", opacity: (flip - 0.5) * 2 }}>
              <div style={{ ...hand, fontSize: 84, clipPath: `inset(0 ${100 - line1 * 100}% 0 0)`, whiteSpace: "nowrap" }}>{T.notebook.monday}</div>
              <div style={{ ...hand, fontSize: 84, marginTop: 30, clipPath: `inset(0 ${100 - line2 * 100}% 0 0)`, whiteSpace: "nowrap" }}>{T.notebook.question}</div>
            </div>
          )}
        </div>
        {/* перелистываемый лист */}
        {flip > 0 && flip < 1 ? (
          <div style={abs({ left: 24, top: 20, right: 24, bottom: 24, transformOrigin: "50% 0%", transform: `perspective(1800px) rotateX(${180 * flip}deg)`, backgroundColor: "#FFFDF6", borderRadius: 14, boxShadow: "0 20px 40px rgba(60,40,20,0.2)" })} />
        ) : null}
        {/* спираль */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={abs({ left: 70 + i * 76, top: -14, width: 22, height: 52, borderRadius: 11, border: "6px solid #B9C0CC", boxSizing: "border-box" })} />
        ))}
      </div>
      {/* карандаш мамы */}
      {f >= writeFrom - 12 && f < writeFrom + writeDur + 20 ? (
        <div style={abs({ left: 150 + tipX, top: 300 + tipY + Math.sin(f * 1.3) * 6, width: 26, height: 360, transformOrigin: "50% 0%", rotate: "-28deg", opacity: fade(f, writeFrom - 12, 8) * (1 - fade(f, writeFrom + writeDur + 6, 10)) })}>
          <div style={abs({ left: 0, top: 30, width: 26, height: 300, borderRadius: 6, backgroundColor: "#F2C230" })} />
          <div style={abs({ left: 4, top: 0, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "32px solid #E8C9A0" })} />
          <div style={abs({ left: 0, top: 320, width: 26, height: 40, borderRadius: "0 0 8px 8px", backgroundColor: "#E5677A" })} />
        </div>
      ) : null}
    </TableTop>
  );
};

// ---------- Рабочий календарь папы ----------
// Неделя: каждый день повторяются «Мектепке» и «Мектептен». В turnAt папа
// перелистывает на следующую неделю — там то же самое; маркер подчёркивает
// повтор (markFrom).
export const CalendarInsert: React.FC<{ readonly f: number; readonly turnAt?: number; readonly markFrom?: number }> = ({ f, turnAt = 1e9, markFrom = 1e9 }) => {
  const c = T.calendar;
  const turn = easeInOut((f - turnAt) / 22);
  const second = turn >= 0.5;
  const mark = clamp((f - markFrom) / 40);
  const col = 128;
  const Cell: React.FC<{ readonly i: number; readonly row: 0 | 1 | 2 }> = ({ i, row }) => {
    const school = row !== 1;
    const label = row === 0 ? c.morning : row === 1 ? c.work : c.afternoon;
    const hl = school ? clamp(mark * 5 - i) : 0;
    return (
      <div style={{ position: "relative", width: col - 12, height: row === 1 ? 210 : 150, borderRadius: 14, backgroundColor: school ? "#FFF4C2" : "#DCE8F5", padding: 10, boxSizing: "border-box", fontSize: 25, fontWeight: 800, color: COLORS.navy, lineHeight: 1.15, overflow: "hidden" }}>
        <div style={abs({ left: 0, top: 0, bottom: 0, width: `${hl * 100}%`, backgroundColor: "rgba(255,201,14,0.75)" })} />
        <div style={{ position: "relative" }}>{label}</div>
      </div>
    );
  };
  return (
    <TableTop drift={-f * 0.1}>
      <div style={abs({ left: 110, top: 300, width: 860, height: 1000, rotate: "-2deg" })}>
        <div style={abs({ inset: 0, borderRadius: 24, backgroundColor: "#2F4A7A", boxShadow: "0 30px 60px rgba(30,30,50,0.35)" })} />
        <div style={abs({ left: 22, top: 22, right: 22, bottom: 22, borderRadius: 16, backgroundColor: "#FFFFFF", padding: "40px 34px", boxSizing: "border-box", fontFamily })}>
          <div style={{ opacity: Math.abs(1 - turn * 2) }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.navy }}>{second ? c.next : c.title}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 34 }}>
              {c.days.map((d, i) => (
                <div key={d} style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#5A6B8C" }}>{d}</div>
                  <Cell i={i} row={0} />
                  <Cell i={i} row={1} />
                  <Cell i={i} row={2} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36, fontSize: 44, fontWeight: 900, color: COLORS.navy, opacity: second ? fade(f, markFrom + 30, 12) : 0, display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.yellow }} />
              {c.repeat}
            </div>
          </div>
        </div>
        {turn > 0 && turn < 1 ? (
          <div style={abs({ left: 22, top: 22, right: 22, bottom: 22, transformOrigin: "0% 50%", transform: `perspective(2000px) rotateY(${-180 * turn}deg)`, backgroundColor: "#F4F6FA", borderRadius: 16, boxShadow: "0 20px 40px rgba(30,30,50,0.25)" })} />
        ) : null}
      </div>
    </TableTop>
  );
};

// ---------- Телефон мамы: страница BalaGo ----------
const PhoneFrame: React.FC<{ readonly children: React.ReactNode; readonly tilt?: number }> = ({ children, tilt = 0 }) => (
  <div style={abs({ left: 225, top: 270, width: 600, height: 1060, borderRadius: 70, backgroundColor: "#1E2230", boxShadow: "0 40px 80px rgba(20,20,40,0.45)", rotate: `${tilt}deg` })}>
    <div style={abs({ left: 18, top: 18, right: 18, bottom: 18, borderRadius: 54, overflow: "hidden", backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy })}>{children}</div>
    <div style={abs({ left: 240, top: 30, width: 120, height: 30, borderRadius: 15, backgroundColor: "#1E2230" })} />
  </div>
);

const BrandHeader: React.FC<{ readonly compact?: boolean }> = ({ compact }) => (
  <div style={{ backgroundColor: COLORS.yellowSoft, padding: compact ? "80px 40px 26px" : "96px 40px 36px", display: "flex", alignItems: "center", gap: 22 }}>
    <Img src={staticFile(ASSETS.logo)} style={{ width: compact ? 84 : 110, height: compact ? 84 : 110, borderRadius: 60, objectFit: "cover" }} />
    <div>
      <div style={{ fontSize: compact ? 48 : 60, fontWeight: 900, lineHeight: 1 }}>{T.phone.brand}</div>
      <div style={{ fontSize: compact ? 26 : 30, fontWeight: 800, color: COLORS.navySoft, marginTop: 6 }}>
        {T.phone.tagline} • {T.phone.city}
      </div>
    </div>
  </div>
);

export const PhoneInsert: React.FC<{ readonly f: number; readonly lineFrom: number; readonly howAt: number }> = ({ f, lineFrom, howAt }) => {
  const line = clamp((f - lineFrom) / 40);
  const route = T.phone.route;
  return (
    <TableTop>
      <PhoneFrame tilt={-1.5}>
        <BrandHeader />
        <div style={{ padding: "40px 40px 0" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.navySoft, lineHeight: 1.3, opacity: fade(f, 4) }}>{T.phone.lead}</div>
          {/* маршрут: жёлтая линия проходит ҮЙ → МЕКТЕП → ҮЙ */}
          <div style={{ position: "relative", marginTop: 54, height: 150 }}>
            <div style={abs({ left: 40, right: 40, top: 46, height: 14, borderRadius: 7, backgroundColor: "#EEF1F6" })} />
            <div style={abs({ left: 40, top: 46, height: 14, borderRadius: 7, width: `${line * 84}%`, backgroundColor: COLORS.yellow })} />
            {route.map((r, i) => {
              const at = i / (route.length - 1);
              const on = line >= at - 0.02;
              return (
                <div key={i} style={abs({ left: `${6 + at * 76}%`, top: 0, width: 120, display: "flex", flexDirection: "column", alignItems: "center", translate: "-30% 0" })}>
                  <div style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: on ? COLORS.yellow : "#FFFFFF", border: `6px solid ${on ? COLORS.yellow : "#DDE3EC"}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={50} height={50} viewBox="0 0 50 50">
                      {i === 1 ? (
                        <path d="M 6 44 L 6 22 L 25 8 L 44 22 L 44 44 Z M 20 44 L 20 32 L 30 32 L 30 44" fill="none" stroke={COLORS.navy} strokeWidth={5} strokeLinejoin="round" />
                      ) : (
                        <path d="M 6 44 L 6 24 L 25 8 L 44 24 L 44 44 Z" fill="none" stroke={COLORS.navy} strokeWidth={5} strokeLinejoin="round" />
                      )}
                    </svg>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 900, marginTop: 10 }}>{r}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 110, padding: "26px 30px", borderRadius: 26, backgroundColor: "#F4F7FB", border: `4px solid ${f >= howAt ? COLORS.yellow : "#E3E8F0"}`, fontSize: 40, fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center", scale: String(f >= howAt && f < howAt + 8 ? 0.97 : 1) }}>
            {T.phone.howTitle}
            <span style={{ fontSize: 44 }}>›</span>
          </div>
          <div style={{ marginTop: 34, padding: "20px 26px", borderRadius: 20, backgroundColor: "#FFF8DD", fontSize: 30, fontWeight: 800, color: COLORS.navySoft, opacity: fade(f, howAt + 30, 14) }}>
            {T.planning}
          </div>
        </div>
      </PhoneFrame>
    </TableTop>
  );
};

// Порядок оформления: этапы появляются по ходу реплики диктора; мама
// сохраняет страницу (saveAt).
export const StepsInsert: React.FC<{ readonly f: number; readonly stepAt: readonly number[]; readonly noteAt: number; readonly saveAt: number }> = ({ f, stepAt, noteAt, saveAt }) => {
  const saved = f >= saveAt + 6;
  return (
    <TableTop>
      <PhoneFrame tilt={1}>
        <BrandHeader compact />
        <div style={{ padding: "18px 34px 0" }}>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{T.phone.howTitle}</div>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: "#8A5A00", opacity: fade(f, noteAt, 12) }}>⚠ {T.stepsNote}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            {T.steps.map((s, i) => {
              const a = fade(f, stepAt[i] ?? 1e9, 10);
              const hot = i === 2;
              return (
                <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 18px", borderRadius: 22, backgroundColor: hot ? COLORS.yellowSoft : "#F4F7FB", border: hot ? `4px solid ${COLORS.yellow}` : "4px solid transparent", opacity: a, translate: `0 ${(1 - a) * 24}px` }}>
                  <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 31, fontWeight: 900, lineHeight: 1.12 }}>{s.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navySoft, marginTop: 4 }}>{s.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* «Сактоо» → «Сакталды» */}
        <div style={abs({ left: 34, right: 34, bottom: 30, padding: "16px 0", borderRadius: 999, textAlign: "center", backgroundColor: saved ? "#E6F4EA" : COLORS.yellow, color: saved ? "#1F6B3A" : COLORS.navy, fontSize: 34, fontWeight: 900, scale: String(f >= saveAt && f < saveAt + 6 ? 0.95 : 1), opacity: fade(f, stepAt[3] ?? 0, 10) })}>
          {saved ? `✓ ${T.saved}` : T.save}
        </div>
      </PhoneFrame>
    </TableTop>
  );
};

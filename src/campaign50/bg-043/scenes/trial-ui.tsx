// Надписи сцены 5 «trial» поверх диорамы (координаты кадра, безопасная
// зона Reels: сверху ≥ 250 px, справа ≥ 150 px, ниже 1330 px — только
// субтитры): ярлык времени суток с солнцем на дуге, карточка «Топ
// уюшулгандан кийин» → «Акысыз толук сыноо» + маршрут, карточка выбора
// родителя «Улантуу чечими — сизде» (ни одна кнопка не нажимается), полка
// на переднем плане, на которой стоят будильники.
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, pop, squashPulse } from "../anim";
import { C } from "../palette";
import { Sparks } from "../parts";
import { BG43_TEXT } from "../script";

const T = BG43_TEXT.trial;

// ---------- Ярлык времени суток: солнце поднимается по дуге ----------
// day: 0 — утро, 1 — после уроков; flip — кадр смены надписи.
export const TimePill: React.FC<{ readonly f: number; readonly at: number; readonly day: number; readonly flip: number }> = ({ f, at, day, flip }) => {
  const e = pop(f, at, 14);
  const o = appear(f, at, 6);
  if (o <= 0) return null;
  // смена надписи «переворотом»: старая сжимается, новая раскрывается
  const t = clamp((f - flip) / 12);
  const first = t < 0.5;
  const sy = first ? 1 - easeInOut(t * 2) : easeInOut((t - 0.5) * 2);
  const text = first ? T.am : T.pm;
  // солнце на дуге: слева внизу → вверху справа
  const a = Math.PI * (1 - 0.15 - 0.55 * day);
  const sx = 34 + Math.cos(a) * 26;
  const syy = 36 - Math.sin(a) * 24;
  const pulse = squashPulse(f, flip + 6, 12, 1);
  return (
    <div
      style={{
        position: "absolute",
        right: 150,
        top: 262,
        width: 356,
        height: 62,
        opacity: o,
        transform: `translateY(${(1 - e) * -20}px) scale(${(0.9 + 0.1 * e) * (1 + 0.05 * pulse)})`,
        transformOrigin: "100% 50%",
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        border: `3px solid ${C.line}`,
        boxSizing: "border-box",
        boxShadow: "0 6px 16px rgba(20,40,90,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 16px 0 8px",
        fontFamily,
      }}
    >
      <svg width={68} height={48} viewBox="0 0 68 48" style={{ flexShrink: 0 }}>
        <path d="M 6 40 A 28 26 0 0 1 62 40" fill="none" stroke={C.line} strokeWidth={3} strokeDasharray="4 4" />
        <rect x={2} y={39} width={64} height={4} rx={2} fill={C.yellowSoft} />
        <g transform={`translate(${sx} ${syy}) rotate(${f * 2})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-1.6} y={-15} width={3.2} height={6} rx={1.6} fill={C.yellowDeep} transform={`rotate(${i * 45})`} />
          ))}
          <circle r={8.5} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={2} />
        </g>
      </svg>
      <div style={{ flex: 1, textAlign: "center", fontSize: 32, fontWeight: 900, color: C.navy, whiteSpace: "nowrap", lineHeight: 1, transform: `scaleY(${Math.max(0.02, sy)})` }}>{text}</div>
    </div>
  );
};

// ---------- Значок группы (4 точки-ребёнка в кругу) ----------
const GroupIcon: React.FC<{ readonly f: number }> = ({ f }) => (
  <svg width={46} height={46} viewBox="-23 -23 46 46" style={{ flexShrink: 0 }}>
    <circle r={20} fill={C.yellowSoft} stroke={C.yellow} strokeWidth={3} strokeDasharray="5 4" transform={`rotate(${f * 1.2})`} />
    {[C.yellow, "#7FB2E5", C.coral, "#FFFFFF"].map((col, i) => {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
      return <circle key={i} cx={Math.cos(a) * 9.5} cy={Math.sin(a) * 9.5} r={6} fill={col} stroke={C.navy} strokeWidth={2.4} />;
    })}
  </svg>
);

// Билет «акысыз»: жёлтый талон с галочкой.
const Ticket: React.FC = () => (
  <svg width={70} height={52} viewBox="0 0 70 52" style={{ flexShrink: 0 }}>
    <path d="M 6 6 L 64 6 L 64 18 Q 56 26 64 34 L 64 46 L 6 46 L 6 34 Q 14 26 6 18 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 22 27 L 31 35 L 48 17" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Карточка: «Топ уюшулгандан кийин» → «Акысыз толук сыноо» ----------
export const TRIAL_CARD = { left: 105, top: 336, width: 780 } as const;

export const TrialCard: React.FC<{ readonly f: number; readonly head: number; readonly badge: number; readonly route: number; readonly free: number }> = ({ f, head, badge, route, free }) => {
  const e = pop(f, head, 16);
  const o = appear(f, head, 6);
  if (o <= 0) return null;
  // карточка растёт в два шага: плашка, затем строка маршрута
  const grow = easeOut((f - badge + 2) / 12);
  const grow2 = easeOut((f - route + 2) / 10);
  const bk = pop(f, badge, 16);
  const h = 64 + 94 * grow + 56 * grow2;
  const routeIn = easeInOut((f - route) / 18);
  const shine = clamp((f - free) / 16);
  const freeK = 1 + 0.07 * squashPulse(f, free, 14, 1);
  return (
    <div
      style={{
        position: "absolute",
        left: TRIAL_CARD.left,
        top: TRIAL_CARD.top,
        width: TRIAL_CARD.width,
        height: h,
        opacity: o,
        transform: `translateY(${(1 - e) * -24}px) scale(${0.9 + 0.1 * e})`,
        transformOrigin: "50% 0%",
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.97)",
        boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
        borderBottom: `8px solid ${C.yellow}`,
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily,
        color: C.navy,
      }}
    >
      {/* шапка: топ уюшулгандан кийин */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <GroupIcon f={f} />
        <div style={{ fontSize: 32, fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1 }}>{T.after}</div>
      </div>
      {/* главная плашка */}
      {bk > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: 64,
            height: 84,
            borderRadius: 22,
            backgroundColor: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            transform: `scale(${(0.6 + 0.4 * bk) * freeK})`,
            opacity: clamp(bk * 2),
            overflow: "hidden",
          }}
        >
          <Ticket />
          <div style={{ fontSize: 54, fontWeight: 1000, whiteSpace: "nowrap", lineHeight: 1, letterSpacing: 0.5 }}>{T.badge}</div>
          {/* блик на «акысыз» */}
          {shine > 0 && shine < 1 ? (
            <div
              style={{
                position: "absolute",
                top: -20,
                left: -160 + shine * 980,
                width: 70,
                height: 130,
                background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))",
                transform: "rotate(18deg)",
              }}
            />
          ) : null}
        </div>
      ) : null}
      {/* маршрут: ҮЙ → МЕКТЕП → ҮЙ */}
      {routeIn > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 160,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 29,
            fontWeight: 800,
            whiteSpace: "nowrap",
            lineHeight: 1,
            clipPath: `inset(-10px ${(1 - routeIn) * 100}% -10px 0)`,
          }}
        >
          {T.route}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        <Sparks x={TRIAL_CARD.width - 70} y={100} f={f} at={free + 2} n={6} spread={60} />
        <Sparks x={70} y={100} f={f} at={free + 4} n={5} spread={50} />
      </div>
    </div>
  );
};

// ---------- Карточка выбора: «Улантуу чечими — сизде» ----------
export const CHOICE = { left: 60, top: 1030, width: 540 } as const;

const Wallet: React.FC = () => (
  <svg width={34} height={30} viewBox="0 0 34 30" style={{ flexShrink: 0 }}>
    <rect x={2} y={6} width={30} height={22} rx={5} fill={C.yellowSoft} stroke={C.navy} strokeWidth={3} />
    <path d="M 6 6 L 22 1 L 25 6" fill="none" stroke={C.navy} strokeWidth={3} strokeLinejoin="round" />
    <rect x={20} y={13} width={12} height={8} rx={3} fill="#FFFFFF" stroke={C.navy} strokeWidth={2.5} />
  </svg>
);

export const ChoiceCard: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const e = pop(f, at, 18);
  const o = appear(f, at, 7);
  if (o <= 0) return null;
  const b1 = pop(f, at + 7, 14);
  const b2 = pop(f, at + 11, 14);
  const note = appear(f, at + 16, 10);
  // кнопки только мягко «дышат» — нажатия нет, решение за родителем
  const br = (ph: number) => 1 + 0.012 * Math.sin((f - at) / 11 + ph);
  const btn = (k: number, ph: number): React.CSSProperties => ({
    flex: 1,
    height: 70,
    borderRadius: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: 900,
    whiteSpace: "nowrap",
    lineHeight: 1,
    transform: `scale(${(0.7 + 0.3 * k) * br(ph)})`,
    opacity: clamp(k * 2),
    boxSizing: "border-box",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: CHOICE.left,
        top: CHOICE.top,
        width: CHOICE.width,
        opacity: o,
        transform: `translateY(${(1 - e) * 60}px) scale(${0.92 + 0.08 * e})`,
        transformOrigin: "50% 100%",
        padding: "22px 26px 20px",
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
        borderBottom: `8px solid ${C.yellow}`,
        boxSizing: "border-box",
        fontFamily,
        color: C.navy,
      }}
    >
      <div style={{ fontSize: 37, fontWeight: 1000, whiteSpace: "nowrap", lineHeight: 1.1, textAlign: "center" }}>{T.choice}</div>
      <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
        <div style={{ ...btn(b1, 0), backgroundColor: C.yellow, boxShadow: `0 6px 0 ${C.yellowDeep}` }}>{T.yes}</div>
        <div style={{ ...btn(b2, 1.6), backgroundColor: "#FFFFFF", border: `4px solid ${C.navy}`, boxShadow: "0 6px 0 #DCE6F2" }}>{T.no}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, opacity: note, transform: `translateY(${(1 - note) * 10}px)` }}>
        <Wallet />
        <div style={{ fontSize: 25, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{T.pay}</div>
      </div>
    </div>
  );
};

// ---------- Полка переднего плана: на ней стоят будильники ----------
export const SHELF_Y = 1252;
export const Shelf: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: SHELF_Y - 26, width: 1080, height: 1920 - SHELF_Y + 26, pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "linear-gradient(180deg, rgba(20,40,90,0), rgba(20,40,90,0.08))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 26, bottom: 0, background: "linear-gradient(180deg, #FFFAF1 0%, #FBF3E6 45%, #F6EBDA 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 26, bottom: 0, backgroundImage: "radial-gradient(circle, rgba(20,40,90,0.07) 2.3px, transparent 2.8px)", backgroundSize: "40px 40px", backgroundPosition: "12px 20px" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 26, height: 6, backgroundColor: "#FFFFFF" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 32, height: 3, backgroundColor: "#E6D6BD" }} />
  </div>
);

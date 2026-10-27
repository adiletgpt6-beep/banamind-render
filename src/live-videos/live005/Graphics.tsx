// Графические вставки LIVE-005 — каждая привязана к словам или жесту (plan.ts).
// Стиль: тонкие линии, фирменный жёлтый, типографика Montserrat; без плашек-
// коробок под текст речи. Лицо и жестикулирующая рука не перекрываются
// (координаты сверены с треком лица face.ts и кадрами исходника).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, CalendarIcon, ChatPhoneIcon, HouseIcon, LinkIcon, SchoolIcon } from "../../live/icons";
import { easeBack, easeInOut, easeOut, mix, ramp, springy } from "../../live/sync";
import type { LiveWord } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { IG_ARROW_END, IG_CARD, WA_BUBBLE, igArrowPoint } from "./cta";
import { EdLines } from "./EditorialCaptions";
import { display } from "./fonts";
import { INSERTS } from "./plan";
import { GESTURE, at, end } from "./timing";

const ins = (id: string) => {
  const x = INSERTS.find((i) => i.id === id);
  if (!x) throw new Error(`нет вставки ${id}`);
  return x;
};
const life = (t: number, id: string, inDur = 0.3, outDur = 0.25) => {
  const x = ins(id);
  return Math.min(ramp(t, x.from, inDur, easeOut), 1 - ramp(t, x.to - outDur, outDur, easeInOut));
};
const visible = (t: number, id: string) => t >= ins(id).from - 0.05 && t <= ins(id).to + 0.05;

// ---------------------------------------------------------------- часы «Саат үчтө»
export const ClockMark: React.FC<{ readonly t: number }> = ({ t }) => {
  if (!visible(t, "clock")) return null;
  const a = life(t, "clock", 0.28, 0.22);
  const k = springy(t, ins("clock").from, 0.5);
  const turn = ramp(t, at(1) - 0.12, 0.42, easeBack); // стрелки встают на 3:00 на «үчтө»
  // «А жыйыныңыз бүтпөй калсачы?» — минутная шагает дальше: собрание затянулось
  const steps = [at(7), at(8), at(9)].reduce((s, a) => s + ramp(t, a, 0.14, easeOut), 0);
  const minute = mix(-50, 0, turn) + 30 * steps;
  const hour = mix(20, 90, turn) + 2.5 * steps;
  const ring = ramp(t, at(1) + 0.15, 0.6, easeOut);
  const late = steps / 3; // дуга «сверх времени» от 12 за минутной
  const R = 50;
  return (
    <div style={{ position: "absolute", left: 82, top: 258, width: 112, height: 112, opacity: a, transform: `scale(${0.7 + 0.3 * k})` }}>
      <svg width={112} height={112} viewBox="-56 -56 112 112" style={{ overflow: "visible", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55))" }}>
        <circle r={R} fill="rgba(6,14,38,0.35)" stroke={C.white} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-R + 8} x2={0} y2={-R + (i % 3 === 0 ? 17 : 13)} stroke={i === 3 ? C.yellow : C.white} strokeWidth={i % 3 === 0 ? 4 : 2.5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
        ))}
        {/* дуга 12 → 3: «до трёх» */}
        <circle r={R + 9} fill="none" stroke={C.yellow} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${ring * ((Math.PI * 2 * (R + 9)) / 4)} 999`} transform="rotate(-90)" />
        {late > 0 ? <circle r={R - 24} fill="none" stroke={C.yellowDeep} strokeWidth={14} opacity={0.8} strokeDasharray={`${late * 0.25 * Math.PI * 2 * (R - 24)} 999`} transform="rotate(-90)" /> : null}
        <line x1={0} y1={0} x2={0} y2={-R + 18} stroke={C.white} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minute})`} />
        <line x1={0} y1={0} x2={0} y2={-R + 28} stroke={C.yellow} strokeWidth={7} strokeLinecap="round" transform={`rotate(${hour})`} />
        <circle r={6} fill={C.yellow} />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- две колонки выбора
// Слева — «Жумушту таштап чыгыш керекпи,» (ладонь влево), справа — «же башка
// бирөөдөн жардам сураш керекпи?» (вторая ладонь). Между ними — жёлтая черта
// ровно над головой: автор стоит «эки нерсенин ортосунда».
export const DilemmaColumns: React.FC<{ readonly t: number; readonly words: readonly LiveWord[] }> = ({ t, words }) => {
  if (!visible(t, "dilemma")) return null;
  const x = ins("dilemma");
  const line = ramp(t, at(21) - 0.15, 0.45, easeOut);
  const fade = 1 - ramp(t, x.to - 0.22, 0.22, easeInOut);
  const dividerX = 484; // зазор между колонками ≈ 456–511 px, над головой
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <div style={{ position: "absolute", left: 80, top: 362, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <EdLines t={t} words={words} end={x.to + 1} g={{ from: 17, to: 20, x: 80, y: 362, align: "left", big: [17], bigSize: 58, size: 46, breakAfter: [17, 19] }} />
      </div>
      <div style={{ position: "absolute", left: 930, top: 360, transform: "translate(-100%, -50%)", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <EdLines t={t} words={words} end={x.to + 1} g={{ from: 21, to: 26, x: 930, y: 360, align: "right", big: [24], accent: [24], bigSize: 58, size: 46, breakAfter: [22, 23, 24] }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: dividerX - 3,
          top: 248,
          width: 6,
          height: 226,
          borderRadius: 3,
          background: `linear-gradient(${C.yellow}, ${C.yellowDeep})`,
          transform: `scaleY(${line})`,
          transformOrigin: "50% 0%",
          boxShadow: "0 0 18px rgba(255,201,14,0.55)",
        }}
      />
      <div style={{ position: "absolute", left: dividerX - 9, top: 466, width: 18, height: 18, borderRadius: 9, background: C.yellow, opacity: line, boxShadow: "0 0 14px rgba(255,201,14,0.8)" }} />
    </div>
  );
};

// ---------------------------------------------------------------- список причин
const PinIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 92 C50 92 18 58 18 38 A32 32 0 0 1 82 38 C82 58 50 92 50 92 Z" fill={C.yellow} stroke={C.navyInk} strokeWidth={5} />
    <circle cx={50} cy={38} r={12} fill={C.navyInk} />
  </svg>
);

const ROWS = [
  { from: 35, to: 36, big: [35], icon: "calendar", y: 266 },
  { from: 37, to: 39, big: [37], icon: "briefcase", y: 346 },
  { from: 40, to: 42, big: [40, 41], icon: "pin", y: 426 },
] as const;

export const ReasonsList: React.FC<{ readonly t: number; readonly words: readonly LiveWord[] }> = ({ t, words }) => {
  if (!visible(t, "reasons")) return null;
  const x = ins("reasons");
  const fade = 1 - ramp(t, x.to - 0.25, 0.25, easeInOut);
  const tag = ramp(t, at(40) - 0.05, 0.3, easeOut); // на «шаарда»
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      {ROWS.map((r, i) => {
        const on = springy(t, Math.max(at(r.from) - 0.12, x.from), 0.5);
        const next = ROWS[i + 1];
        const dim = next ? 1 - 0.3 * ramp(t, at(next.from) - 0.1, 0.3) : 1;
        if (on <= 0) return null;
        return (
          <div key={r.from} style={{ position: "absolute", left: 80, top: r.y, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 18, opacity: dim }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: "rgba(255,255,255,0.94)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
                transform: `scale(${0.5 + 0.5 * on}) rotate(${(1 - on) * -20}deg)`,
              }}
            >
              {r.icon === "calendar" ? <CalendarIcon size={44} /> : r.icon === "briefcase" ? <BriefcaseIcon size={44} /> : <PinIcon size={46} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <EdLines t={t} words={words} end={x.to + 1} g={{ from: r.from, to: r.to, x: 160, y: r.y, align: "left", big: r.big, bigSize: 58, size: 48 }} />
            </div>
          </div>
        );
      })}
      {/* «шаарда» → деликатная метка города */}
      <div
        style={{
          position: "absolute",
          left: 156,
          top: 482,
          transform: `translateY(-50%) translateX(${(1 - tag) * -16}px)`,
          opacity: tag * 0.95,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: 3,
          color: C.white,
          textShadow: "0 2px 10px rgba(0,0,0,0.75)",
          textTransform: "uppercase",
        }}
      >
        <PinIcon size={40} />
        Бишкек
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- бренд «BalaGo'нун максаты —»
export const BrandLine: React.FC<{ readonly t: number; readonly words: readonly LiveWord[] }> = ({ t, words }) => {
  if (!visible(t, "brand")) return null;
  const x = ins("brand");
  const k = springy(t, x.from, 0.55);
  const fade = 1 - ramp(t, x.to - 0.2, 0.2, easeInOut);
  return (
    <div style={{ position: "absolute", left: 90, top: 1394, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 22, opacity: fade }}>
      <div
        style={{
          width: 124,
          height: 124,
          borderRadius: 62,
          background: C.white,
          border: `5px solid ${C.yellow}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45), 0 0 30px rgba(255,201,14,0.35)",
          overflow: "hidden",
          transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - k) * -30}deg)`,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <EdLines t={t} words={words} end={x.to} g={{ from: 43, to: 44, x: 236, y: 1394, align: "left", big: [43], keepCase: [43], bigSize: 84, breakAfter: [43] }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- дорожка ҮЙ — МЕКТЕП
const CarIcon: React.FC<{ readonly size: number; readonly flip: boolean }> = ({ size, flip }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}>
    <path d="M12 62 L18 44 Q22 34 34 34 L62 34 Q72 34 78 44 L88 56 Q94 58 94 66 L94 72 L8 72 L8 66 Q8 62 12 62 Z" fill={C.yellow} stroke={C.navyInk} strokeWidth={5} strokeLinejoin="round" />
    <path d="M30 40 L60 40 Q66 40 70 46 L74 54 L24 54 Z" fill={C.navy} opacity={0.85} />
    <circle cx={28} cy={74} r={10} fill={C.navyInk} />
    <circle cx={74} cy={74} r={10} fill={C.navyInk} />
  </svg>
);

export const RouteTrack: React.FC<{ readonly t: number }> = ({ t }) => {
  if (!visible(t, "route")) return null;
  const a = life(t, "route", 0.35, 0.25);
  const L = 196;
  const Rr = 878;
  const Y = 330;
  const go = ramp(t, at(53), end(54) - at(53) + 0.15, easeInOut); // үйдөн → мектепке
  const back = ramp(t, at(57), end(58) - at(57) + 0.2, easeInOut); // кайра үйгө
  const A = L + 70; // машинка останавливается рядом с плиткой дома / школы
  const B = Rr - 76;
  const pos = back > 0 ? mix(B, A, back) : mix(A, B, go);
  const done = ramp(t, at(59) - 0.05, 0.35, easeBack); // жеткирүү ✓
  const school = springy(t, at(54) - 0.1, 0.5);
  const home = springy(t, at(52) - 0.15, 0.5);
  const tile = (x: number, k: number, child: React.ReactNode, check = 0) => (
    <div style={{ position: "absolute", left: x - 48, top: Y - 48, width: 96, height: 96, borderRadius: 28, background: "rgba(255,255,255,0.96)", boxShadow: "0 10px 26px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.55 + 0.45 * k})` }}>
      {child}
      {check > 0 ? (
        <div style={{ position: "absolute", right: -14, top: -14, width: 44, height: 44, borderRadius: 22, background: C.green, border: `4px solid ${C.white}`, transform: `scale(${check})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontFamily, fontWeight: 900, fontSize: 28 }}>✓</div>
      ) : null}
    </div>
  );
  const traveled = back > 0 ? [pos, B] : [A, pos];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={L} y1={Y} x2={Rr} y2={Y} stroke="rgba(6,14,38,0.55)" strokeWidth={16} strokeLinecap="round" />
        <line x1={L} y1={Y} x2={Rr} y2={Y} stroke="rgba(255,255,255,0.75)" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" />
        <line x1={traveled[0]} y1={Y} x2={traveled[1]} y2={Y} stroke={C.yellow} strokeWidth={8} strokeLinecap="round" opacity={go > 0 ? 1 : 0} />
      </svg>
      {tile(L - 52, home, <HouseIcon size={66} />, done)}
      {tile(Rr + 0, school, <SchoolIcon size={66} />)}
      <div style={{ position: "absolute", left: pos - 38, top: Y - 66, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))", opacity: home }}>
        <CarIcon size={76} flip={back > 0} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- шапка Instagram
// Тёмная «стеклянная» карточка (не белая, как в LIVE-004): аватар-логотип с
// тонким жёлтым кольцом, @balago.kg, строка «Бишкектеги балдар үчүн такси»,
// строка ссылки. Пунктирный след из точек идёт от поднятого пальца по дуге
// слева от лица к слову «шилтеме»; на ссылке — мягкий «тап». Метрик нет.
const CARD = IG_CARD;
const DOTS = 11; // точек в следе от пальца к ссылке

export const InstagramCard: React.FC<{ readonly t: number }> = ({ t }) => {
  if (!visible(t, "instagram")) return null;
  const x = ins("instagram");
  const k = springy(t, x.from, 0.5);
  const a = Math.min(ramp(t, x.from, 0.2), 1 - ramp(t, x.to - 0.2, 0.2, easeInOut));
  const draw = ramp(t, GESTURE.pointUp.from + 0.1, 0.45, easeOut);
  const tap = ramp(t, GESTURE.pointUp.from + 0.55, 0.6, easeOut);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <div
        style={{
          position: "absolute",
          ...CARD,
          borderRadius: 34,
          background: "linear-gradient(150deg, rgba(14,26,64,0.92), rgba(6,12,32,0.9))",
          border: "2px solid rgba(255,255,255,0.16)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - k) * -40}px) scale(${0.94 + 0.06 * k})`,
          transformOrigin: "50% 0%",
          display: "flex",
          alignItems: "center",
          padding: "0 34px",
          gap: 28,
        }}
      >
        <div style={{ width: 132, height: 132, borderRadius: 66, padding: 5, background: `linear-gradient(135deg, ${C.yellow}, ${C.yellowDeep})`, flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.white, border: `4px solid ${C.navyInk}`, overflow: "hidden" }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: display, fontWeight: 900, fontSize: 48, color: C.white, letterSpacing: -0.5 }}>@balago.kg</div>
          <div style={{ fontFamily, fontWeight: 700, fontSize: 29, color: "rgba(255,255,255,0.86)" }}>Бишкектеги балдар үчүн такси</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, color: C.yellow, fontFamily: display, fontWeight: 900, fontSize: 36, alignSelf: "flex-start" }}>
            <LinkIcon size={38} color={C.yellow} />
            <span style={{ position: "relative" }}>
              шилтеме
              <span style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 4, borderRadius: 2, background: C.yellow, transform: `scaleX(${tap})`, transformOrigin: "0% 50%" }} />
            </span>
          </div>
        </div>
      </div>
      {/* пунктирный след от пальца к ссылке (не сплошная стрелка, как в LIVE-004):
          точки появляются по очереди, последние — жёлтые и крупнее */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {Array.from({ length: DOTS }, (_, i) => {
          const u = (i + 1) / DOTS;
          if (draw < u - 0.02) return null;
          const p = igArrowPoint(t, u);
          const hot = i >= DOTS - 3;
          const r = hot ? 9 : 6.5;
          return <circle key={i} cx={p.x} cy={p.y} r={r} fill={hot ? C.yellow : C.white} stroke="rgba(6,14,38,0.7)" strokeWidth={3} />;
        })}
        {draw > 0.96 ? (
          <g transform={`translate(${IG_ARROW_END.x} ${IG_ARROW_END.y - 14})`}>
            <path d="M -16 22 L 0 0 L 16 22" fill="none" stroke="rgba(6,14,38,0.7)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M -16 22 L 0 0 L 16 22" fill="none" stroke={C.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {tap > 0 ? (
          <g transform={`translate(${IG_ARROW_END.x} ${IG_CARD.top + 176})`}>
            <circle r={16 + 34 * tap} fill="none" stroke={C.yellow} strokeWidth={4} opacity={1 - tap} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- пузырь WhatsApp
// Фирменный жёлтый «пузырь сообщения» с длинным хвостиком к пальцу, указывающему
// вниз («төмөнкү»); сам пузырь ниже рук — раскрытые ладони на «Биз дайыма» не
// перекрываются. Зелёный значок WhatsApp, подпись «WhatsApp · Бишкек». Номер
// тёмно-синий, крупный, контрастный с первого кадра и неподвижный до конца.
const BUBBLE = WA_BUBBLE;

export const WhatsAppBubble: React.FC<{ readonly t: number }> = ({ t }) => {
  const x = ins("whatsapp");
  if (t < x.from - 0.02) return null;
  const a = ramp(t, x.from, 0.15, easeOut);
  const glow = ramp(t, x.from, 0.7, easeOut);
  // хвостик тянется к пальцу, пока автор указывает вниз, затем втягивается в
  // короткий выступ — на «Биз дайыма» он не проходит по рукам
  const reach = 1 - ramp(t, GESTURE.pointDown.to + 0.05, 0.35, easeInOut);
  const tail = { x: GESTURE.pointDown.tip.x, y: mix(BUBBLE.top - 70, GESTURE.pointDown.tip.y, reach) };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${tail.x - 30} ${BUBBLE.top + 4} Q ${tail.x - 4} ${(BUBBLE.top + tail.y) / 2} ${tail.x + 4} ${tail.y + 30} Q ${tail.x + 12} ${(BUBBLE.top + tail.y) / 2} ${tail.x + 34} ${BUBBLE.top + 4} Z`} fill={C.yellow} />
      </svg>
      <div
        style={{
          position: "absolute",
          ...BUBBLE,
          borderRadius: 42,
          background: `linear-gradient(135deg, ${C.yellowHot}, ${C.yellow})`,
          border: "3px solid rgba(255,255,255,0.5)",
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 ${60 * (1 - glow)}px ${30 * (1 - glow)}px rgba(43,211,139,${0.55 * (1 - glow)})`,
          transform: `scale(${0.96 + 0.04 * a})`,
          display: "flex",
          alignItems: "center",
          padding: "0 34px",
          gap: 24,
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 48, background: "#1FAF5A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(6,14,38,0.3)" }}>
          <ChatPhoneIcon size={66} color="#1FAF5A" accent={C.white} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily, fontWeight: 900, fontSize: 30, color: C.navy, letterSpacing: 1 }}>WhatsApp · Бишкек</div>
          <div style={{ fontFamily: display, fontWeight: 900, fontSize: 64, color: C.navyInk, letterSpacing: 1, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>0998 08 38 28</div>
        </div>
      </div>
    </div>
  );
};

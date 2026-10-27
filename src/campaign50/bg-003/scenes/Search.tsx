// Сцена 4: экран телефона в руках мамы (продолжение наезда из сцены 3).
// Большой палец набирает «Бишкекте мектепке туруктуу каттам» → поиск →
// среди результатов карточка BalaGo → палец нажимает → открывается страница:
// на карте сначала прежняя линия таймлапса (Кеңсе → Мектеп → Үй → Кеңсе),
// она гаснет и превращается в один заранее спланированный маршрут
// ҮЙ → МЕКТЕП (эртең менен) → ҮЙ (сабактан кийин). Это план маршрута, не
// выполненная поездка.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { ArrowText, clamp01, easeInOut, easeOut, lerp, LOOKS, NAVY, NAVY_SOFT, popScale, prog, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

const PH = { x: 150, y: 196, w: 780, h: 1200 };
const SC = { x: PH.x + 26, y: PH.y + 26, w: PH.w - 52, h: PH.h - 52 };
const T = BG3_TEXT;

// квадратичная кривая Безье
const qb = (p0: [number, number], c: [number, number], p1: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
];

const HOME: [number, number] = [150, 830];
const SCHOOL: [number, number] = [560, 470];
const OFFICE: [number, number] = [610, 800];
const C_MORNING: [number, number] = [170, 470];
const C_AFTER: [number, number] = [560, 860];

const Pin: React.FC<{ readonly p: [number, number]; readonly label: string; readonly color: string; readonly a: number }> = ({ p, label, color, a }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${a})`} opacity={clamp01(a * 1.5)}>
    <path d="M 0 0 Q -34 -44 -34 -70 Q -34 -104 0 -104 Q 34 -104 34 -70 Q 34 -44 0 0 Z" fill={color} stroke="#FFFFFF" strokeWidth={5} />
    <circle cx={0} cy={-70} r={13} fill="#FFFFFF" />
    <rect x={-label.length * 12 - 16} y={10} width={label.length * 24 + 32} height={50} rx={16} fill="#FFFFFF" stroke={color} strokeWidth={4} />
    <text x={0} y={46} textAnchor="middle" fontSize={30} fontWeight={1000} fill={NAVY} fontFamily={fontFamily}>
      {label}
    </text>
  </g>
);

const CarDot: React.FC<{ readonly p: [number, number]; readonly ang: number }> = ({ p, ang }) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(${ang})`}>
    <rect x={-30} y={-16} width={60} height={32} rx={11} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
    <rect x={-26} y={-16} width={52} height={5} rx={2} fill={YELLOW} />
    <rect x={-26} y={11} width={52} height={5} rx={2} fill={YELLOW} />
    <path d="M 8 -11 Q 17 0 8 11 L 3 9 Q 8 0 3 -9 Z" fill="#3D5A8A" />
  </g>
);

const Keyboard: React.FC<{ readonly a: number; readonly hit: number }> = ({ a, hit }) => {
  const rows = [10, 10, 9, 5];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 430, backgroundColor: "#DCE2EC", transform: `translateY(${(1 - a) * 440}px)`, padding: "18px 10px", boxSizing: "border-box" }}>
      {rows.map((n, r) => (
        <div key={r} style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {Array.from({ length: n }, (_, i) => {
            const on = (r * 10 + i) % 23 === hit % 23;
            return <div key={i} style={{ width: r === 3 && i === 2 ? 300 : 60, height: 80, borderRadius: 12, backgroundColor: on ? YELLOW_SOFT : "#FFFFFF", boxShadow: "0 3px 0 #B9C2D2" }} />;
          })}
        </div>
      ))}
    </div>
  );
};

export const Search: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const s = b.search;
  const inPhone = easeOut(prog(t, s.from - 0.15, 0.5));
  const typed = Math.round(T.query.length * prog(t, s.type, s.typed - s.type));
  const kb = easeOut(prog(t, s.from + 0.05, 0.3)) * (1 - easeInOut(prog(t, s.submit, 0.35)));
  const results = easeOut(prog(t, s.results, 0.4));
  const open = easeInOut(prog(t, s.open, 0.5));
  const oldWay = easeOut(prog(t, s.open + 0.45, 0.5)) * (1 - easeInOut(prog(t, s.plan, 0.6)));
  const officeA = 1 - easeInOut(prog(t, s.plan + 0.1, 0.5));
  const pins = popScale(prog(t, s.open + 0.4, 0.4));
  const morning = easeInOut(prog(t, s.route, 1.1));
  const after = easeInOut(prog(t, s.back, 1.1));
  const planTitle = easeOut(prog(t, s.plan, 0.4));
  // большой палец: клавиатура → «издөө» → карточка BalaGo → в сторону
  const tapPulse = (at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.12);
  const typingK = t < s.typed ? Math.floor((t - s.type) * 9) : 0;
  const thumb = (() => {
    if (t < s.typed) return [520 + (typingK % 2 === 0 ? -90 : 60) + (typingK % 3) * 40, 1110 + (typingK % 2) * 90];
    if (t < s.submit + 0.1) return [lerp(560, 800, prog(t, s.typed, 0.2)), lerp(1150, 1290, prog(t, s.typed, 0.2))];
    if (t < s.tap + 0.25) return [lerp(800, 600, easeInOut(prog(t, s.results, s.tap - s.results))), lerp(1290, 790, easeInOut(prog(t, s.results, s.tap - s.results)))];
    return [lerp(600, 1000, easeInOut(prog(t, s.tap + 0.25, 0.6))), lerp(790, 1700, easeInOut(prog(t, s.tap + 0.25, 0.6)))];
  })();
  const press = Math.max(tapPulse(s.submit), tapPulse(s.tap), t < s.typed ? Math.abs(Math.sin((t - s.type) * 28)) * 0.6 : 0);
  // карточка BalaGo в списке → на весь экран
  const cardTop = lerp(470, 0, open);
  const cardH = lerp(200, SC.h, open);
  const cardR = lerp(28, 0, open);
  const cardX = lerp(24, 0, open);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#EEF3FA", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -200, top: -120, width: 640, height: 640, borderRadius: 320, backgroundColor: YELLOW_SOFT }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1.25, 1, inPhone)})`, transformOrigin: "540px 700px", opacity: inPhone }}>
        {/* телефон */}
        <div style={{ position: "absolute", left: PH.x, top: PH.y, width: PH.w, height: PH.h, borderRadius: 70, backgroundColor: "#1F2A3F", boxShadow: "0 30px 80px rgba(20,40,75,0.35)" }} />
        <div style={{ position: "absolute", left: SC.x, top: SC.y, width: SC.w, height: SC.h, borderRadius: 48, backgroundColor: "#FFFFFF", overflow: "hidden" }}>
          {/* строка поиска */}
          <div style={{ position: "absolute", left: 24, right: 24, top: 70, height: 96, borderRadius: 48, backgroundColor: "#F1F4F9", border: `4px solid ${t >= s.type && t < s.results ? YELLOW : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 26px", boxSizing: "border-box", gap: 16 }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={NAVY_SOFT} strokeWidth={2.6} strokeLinecap="round">
              <circle cx={10} cy={10} r={6.5} />
              <path d="M 15 15 L 21 21" />
            </svg>
            <div style={{ fontSize: 33, fontWeight: 900, color: NAVY, whiteSpace: "nowrap", overflow: "hidden" }}>
              {T.query.slice(0, typed)}
              {t < s.results && Math.floor(t * 3) % 2 === 0 ? <span style={{ color: NAVY_SOFT }}>|</span> : null}
            </div>
          </div>
          {/* результаты */}
          <div style={{ position: "absolute", left: 24, right: 24, top: 200, opacity: results * (1 - open) }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: NAVY_SOFT, marginBottom: 18 }}>{T.results}</div>
            {[0, 2].map((i) => (
              <div key={i} style={{ position: "absolute", top: 70 + i * 230, left: 0, right: 0, height: 200, borderRadius: 28, backgroundColor: "#F3F6FB", padding: 28, boxSizing: "border-box", transform: `translateY(${(1 - results) * 40}px)` }}>
                <div style={{ width: "62%", height: 30, borderRadius: 15, backgroundColor: "#D7DEEA" }} />
                <div style={{ width: "88%", height: 22, borderRadius: 11, backgroundColor: "#E3E8F1", marginTop: 22 }} />
                <div style={{ width: "74%", height: 22, borderRadius: 11, backgroundColor: "#E3E8F1", marginTop: 14 }} />
              </div>
            ))}
          </div>
          {/* карточка BalaGo */}
          {results > 0 ? (
            <div
              style={{
                position: "absolute",
                left: cardX,
                right: cardX,
                top: cardTop,
                height: cardH,
                borderRadius: cardR,
                backgroundColor: "#FFFFFF",
                border: `${lerp(5, 0, open)}px solid ${YELLOW}`,
                boxShadow: `0 ${lerp(10, 0, open)}px 30px rgba(20,40,75,${lerp(0.16, 0, open)})`,
                opacity: results,
                transform: `translateY(${(1 - results) * 40}px) scale(${1 - tapPulse(s.tap) * 0.03})`,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: lerp(26, 36, open), paddingTop: lerp(26, 70, open) }}>
                <Img src={staticFile("assets/logo.png")} style={{ width: lerp(110, 130, open), height: lerp(110, 130, open), borderRadius: 70, boxShadow: "0 6px 16px rgba(20,40,90,0.18)" }} />
                <div>
                  <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY, lineHeight: 1.1 }}>{T.card.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: NAVY_SOFT, marginTop: 6 }}>{T.card.sub}</div>
                </div>
              </div>
              {open > 0.6 ? (
                <div style={{ position: "absolute", left: 0, right: 0, top: 262, opacity: easeOut(prog(t, s.open + 0.3, 0.3)) }}>
                  <div style={{ textAlign: "center", fontSize: 34, fontWeight: 1000, color: NAVY, opacity: planTitle, height: 50 }}>{T.plan.title}</div>
                  <svg width={SC.w} height={820} viewBox={`0 0 ${SC.w} 820`} style={{ position: "absolute", top: 20, left: 0 }}>
                    {/* условная карта: кварталы и улицы */}
                    <rect x={20} y={300} width={SC.w - 40} height={660} rx={30} fill="#F1F5FA" transform="translate(0 -220)" />
                    {[200, 360, 520].map((y) => (
                      <rect key={y} x={30} y={y} width={SC.w - 60} height={14} fill="#E1E8F2" />
                    ))}
                    {[200, 420].map((x) => (
                      <rect key={x} x={x} y={90} width={14} height={640} fill="#E1E8F2" />
                    ))}
                    {/* прежняя линия таймлапса: Кеңсе → Мектеп → Үй → Кеңсе */}
                    <g opacity={oldWay}>
                      <path
                        d={`M ${OFFICE[0]} ${OFFICE[1] - 220} L ${SCHOOL[0]} ${SCHOOL[1] - 220} L ${HOME[0]} ${HOME[1] - 220} L ${OFFICE[0]} ${OFFICE[1] - 220}`}
                        stroke={NAVY}
                        strokeWidth={12}
                        fill="none"
                        strokeDasharray="22 16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text x={SC.w / 2} y={700} textAnchor="middle" fontSize={30} fontWeight={1000} fill={NAVY_SOFT} fontFamily={fontFamily}>
                        {T.plan.oldWay}
                      </text>
                    </g>
                    {/* один заранее спланированный маршрут */}
                    <g transform="translate(0 -220)">
                      <path
                        d={`M ${HOME[0]} ${HOME[1]} Q ${C_MORNING[0]} ${C_MORNING[1]} ${SCHOOL[0]} ${SCHOOL[1]}`}
                        stroke={YELLOW}
                        strokeWidth={16}
                        fill="none"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 1"
                        strokeDashoffset={1 - morning}
                      />
                      <path
                        d={`M ${SCHOOL[0]} ${SCHOOL[1]} Q ${C_AFTER[0]} ${C_AFTER[1]} ${HOME[0]} ${HOME[1]}`}
                        stroke={YELLOW}
                        strokeWidth={16}
                        fill="none"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 1"
                        strokeDashoffset={1 - after}
                      />
                      {morning > 0 ? (
                        <text x={210} y={500} fontSize={30} fontWeight={1000} fill={NAVY} fontFamily={fontFamily} opacity={morning}>
                          {T.plan.morning}
                        </text>
                      ) : null}
                      {after > 0 ? (
                        <text x={360} y={790} fontSize={30} fontWeight={1000} fill={NAVY} fontFamily={fontFamily} opacity={after}>
                          {T.plan.afternoon}
                        </text>
                      ) : null}
                      <Pin p={OFFICE} label={T.places.office} color="#8C99AE" a={pins * officeA} />
                      <Pin p={HOME} label={T.places.home.toUpperCase()} color={NAVY} a={pins} />
                      <Pin p={SCHOOL} label={T.places.school.toUpperCase()} color={NAVY} a={pins} />
                      {morning > 0 && after <= 0 ? (
                        <CarDot p={qb(HOME, C_MORNING, SCHOOL, morning)} ang={lerp(-80, 10, morning)} />
                      ) : null}
                      {after > 0 ? <CarDot p={qb(SCHOOL, C_AFTER, HOME, after)} ang={lerp(100, 175, after)} /> : null}
                    </g>
                  </svg>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", opacity: after }}>
                    <div style={{ padding: "12px 30px", borderRadius: 30, backgroundColor: YELLOW, fontSize: 42, fontWeight: 1000, color: NAVY }}>
                      <ArrowText text={T.plan.route} size={42} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <Keyboard a={kb} hit={typingK} />
        </div>
        {/* руки мамы держат телефон */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d="M 60 1920 L 120 1330 Q 130 1250 190 1250 L 210 1250 Q 250 1260 236 1330 L 220 1920 Z" fill={LOOKS.mom.top} />
          <ellipse cx={176} cy={1250} rx={60} ry={90} fill={LOOKS.mom.skin} />
          {/* указательный палец правой руки (рука входит из правого нижнего угла) */}
          <g transform={`translate(${thumb[0]} ${thumb[1]})`}>
            <path d={`M 150 ${240 - press * 10} L 520 820`} stroke={LOOKS.mom.top} strokeWidth={120} strokeLinecap="round" />
            <ellipse cx={150} cy={250 - press * 10} rx={76} ry={86} fill={LOOKS.mom.skin} transform={`rotate(-32 150 ${250 - press * 10})`} />
            <path d={`M 120 ${190 - press * 10} L 8 ${8 + press * 6}`} stroke={LOOKS.mom.skin} strokeWidth={42} strokeLinecap="round" />
            <ellipse cx={18} cy={20 + press * 6} rx={13} ry={17} fill="#F6D2BC" transform={`rotate(-32 18 ${20 + press * 6})`} />
            <path d="M 96 236 Q 70 250 92 272" stroke="#D49B74" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          {press > 0.3 && t >= s.submit - 0.1 ? <circle cx={thumb[0]} cy={thumb[1]} r={30 + press * 26} fill="none" stroke={YELLOW} strokeWidth={6} opacity={press} /> : null}
        </svg>
      </div>
    </div>
  );
};

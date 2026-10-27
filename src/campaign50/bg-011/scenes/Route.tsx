// Сцена 5: открытая страница BalaGo из телефона мамы разворачивается на
// весь кадр и становится графикой: один полный день — утром ҮЙ → МЕКТЕП,
// после уроков МЕКТЕП → ҮЙ (белая машина проезжает оба этапа). Ниже —
// внятная последовательность: заявка → подходящая группа (3–4 ребёнка) →
// первая полная пробная поездка бесплатно, только после формирования
// группы. Диктор: «BalaGo — Бишкектеги балдар үчүн алдын ала
// уюштурулган такси. Ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо
// сапары акысыз.»
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useScene, useTimeline } from "../context";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG11_TEXT, BG11_VIDEO } from "../script";
import { RouteIcon } from "../screens";
import { C } from "../sets/Kitchen";
import { box } from "../shots";

// Белая машина сбоку (без марки), жёлтая полоса и логотип на двери.
export const WhiteCar: React.FC<{ w: number; dir?: 1 | -1; wheel?: number }> = ({ w, dir = 1, wheel = 0 }) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 200 100" style={{ transform: `scaleX(${dir})`, overflow: "visible" }}>
    <ellipse cx={100} cy={92} rx={92} ry={6} fill="rgba(20,30,60,0.15)" />
    <path d="M 12 70 Q 10 52 26 48 L 56 44 L 80 22 Q 86 18 96 18 L 136 18 Q 146 18 152 24 L 170 44 Q 192 48 192 64 L 192 74 Q 192 78 186 78 L 16 78 Q 12 78 12 74 Z" fill="#FFFFFF" stroke="#C9D1DD" strokeWidth={2.5} />
    <path d="M 66 44 L 86 26 Q 89 24 94 24 L 112 24 L 112 44 Z" fill="#2C3B5C" />
    <path d="M 118 24 L 136 24 Q 142 24 146 28 L 160 44 L 118 44 Z" fill="#2C3B5C" />
    <rect x={14} y={56} width={176} height={7} fill={C.yellow} />
    <circle cx={186} cy={56} r={4} fill="#FFE9A6" />
    {[52, 152].map((cx) => (
      <g key={cx} transform={`rotate(${wheel} ${cx} 78)`}>
        <circle cx={cx} cy={78} r={15} fill="#2B2F3A" />
        <circle cx={cx} cy={78} r={7} fill="#B8BFCA" />
        <rect x={cx - 1.5} y={66} width={3} height={8} fill="#2B2F3A" />
      </g>
    ))}
  </svg>
);

const useWordFrame = (id: string, word: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id)!;
  const w = c.words.find((x) => x.text.toLowerCase().startsWith(word.toLowerCase()));
  return Math.round((w ? w.start : c.from) * BG11_VIDEO.fps) - from;
};

// Путь маршрута: верхняя дуга (утро) и нижняя (после уроков).
const HOME = { x: 190, y: 700 };
const SCHOOL = { x: 860, y: 700 };
const amPt = (u: number) => {
  const x = lerp(HOME.x, SCHOOL.x, u);
  return { x, y: HOME.y - 150 * Math.sin(Math.PI * u) };
};
const pmPt = (u: number) => {
  const x = lerp(SCHOOL.x, HOME.x, u);
  return { x, y: HOME.y + 150 * Math.sin(Math.PI * u) };
};
const pathOf = (pt: (u: number) => { x: number; y: number }) =>
  Array.from({ length: 41 }, (_, i) => pt(i / 40))
    .map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

export const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const r = BG11_TEXT.route;
  const s1 = Math.max(40, useWordFrame("n03", "уюштурулган") - 4);
  const s2 = Math.max(s1 + 20, useWordFrame("n03", "Ылайыктуу") - 4);
  const s3 = Math.max(s2 + 20, useWordFrame("n03", "биринчи") - 4);
  // переход: экран телефона (как в сцене 4) раскрывается на весь кадр
  const open = easeInOut(f / 18);
  const phone = { x: lerp(170 + 26, 0, open), y: lerp(140 + 26, 0, open), w: lerp(688, 1080, open), h: lerp(1465, 1920, open), r: lerp(60, 0, open) };
  const am = easeInOut((f - 20) / 40);
  const pm = easeInOut((f - 64) / 40);
  const carAm = easeInOut((f - 26) / 46);
  const carPm = easeInOut((f - 76) / 46);
  const onPm = f >= 74;
  const car = onPm ? pmPt(lerp(0.13, 0.87, carPm)) : amPt(lerp(0.13, 0.87, carAm));
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const step = (at: number): React.CSSProperties => ({ opacity: a(at), transform: `translateY(${(1 - a(at)) * 40}px) scale(${0.9 + 0.1 * a(at)})` });
  return (
    <div style={box({ inset: 0, backgroundColor: "#B99973", overflow: "hidden" })}>
      <div style={box({ left: phone.x, top: phone.y, width: phone.w, height: phone.h, borderRadius: phone.r, overflow: "hidden", backgroundColor: "#FFFFFF", fontFamily, color: C.navy })}>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${phone.w / 1080})`, transformOrigin: "0 0" })}>
          <div style={box({ left: -200, top: -260, width: 700, height: 700, borderRadius: 350, backgroundColor: C.yellowSoft })} />
          {/* шапка */}
          <div style={box({ left: 80, top: 270, display: "flex", alignItems: "center", gap: 22, opacity: a(6) })}>
            <Img src={staticFile(BG11_VIDEO.logo)} style={{ width: 100, height: 100, borderRadius: 50, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1 }}>BalaGo</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#3A4F80" }}>Бишкек • {r.title}</div>
            </div>
          </div>
          {/* маршрут */}
          <svg width={1080} height={1100} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <path d={pathOf(amPt)} stroke="#EDF1F6" strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={pathOf(pmPt)} stroke="#EDF1F6" strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={pathOf(amPt)} stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - am} />
            <path d={pathOf(pmPt)} stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pm} />
          </svg>
          <div style={box({ left: 540 - 200, top: 470, width: 400, textAlign: "center", fontSize: 38, fontWeight: 900, opacity: a(26) })}>☀ {r.am}</div>
          <div style={box({ left: 540 - 220, top: 880, width: 440, textAlign: "center", fontSize: 38, fontWeight: 900, opacity: a(70) })}>{r.pm}</div>
          {[
            { p: HOME, kind: "home" as const, label: r.stops[0], at: 14 },
            { p: SCHOOL, kind: "school" as const, label: r.stops[1], at: 50 },
          ].map((s) => (
            <div key={s.label} style={box({ left: s.p.x - 80, top: s.p.y - 80, width: 160, display: "flex", flexDirection: "column", alignItems: "center", opacity: a(s.at), transform: `scale(${0.7 + 0.3 * a(s.at)})` })}>
              <RouteIcon kind={s.kind} size={160} />
            </div>
          ))}
          <div style={box({ left: HOME.x - 120, top: HOME.y + 86, width: 240, textAlign: "center", fontSize: 40, fontWeight: 900, opacity: a(14) })}>
            {r.stops[0]}
          </div>
          <div style={box({ left: SCHOOL.x - 140, top: SCHOOL.y + 86, width: 280, textAlign: "center", fontSize: 40, fontWeight: 900, opacity: a(50) })}>
            {r.stops[1]}
          </div>
          {/* белая машина на маршруте */}
          <div style={box({ left: car.x - 80, top: car.y - 70, opacity: a(24) * (1 - clamp((f - 124) / 10)) })}>
            <WhiteCar w={160} dir={onPm ? -1 : 1} wheel={f * 12} />
          </div>
          {/* шаги: заявка → группа → пробная поездка (после группы) */}
          <div style={box({ left: 60, top: 1050, width: 870, display: "flex", gap: 18 })}>
            {r.steps.map((t, i) => {
              const at = [s1, s2, s3][i];
              const free = i === 2;
              return (
                <div key={t} style={{ flex: 1, padding: "24px 16px 26px", borderRadius: 28, backgroundColor: free ? "#E8F6EC" : "#F4F6FA", border: `4px solid ${free ? "#BFE3CB" : "#DCE3EE"}`, textAlign: "center", ...step(at) }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, margin: "0 auto", backgroundColor: free ? "#1F7A45" : C.navy, color: "#FFFFFF", fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                  <div style={{ marginTop: 14, fontSize: 36, fontWeight: 900, lineHeight: 1.12 }}>{t}</div>
                  {i === 1 ? <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "#5A6B8C" }}>3–4 бала</div> : null}
                  {free ? <div style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: "#1F7A45" }}>{r.note}</div> : null}
                </div>
              );
            })}
          </div>
          {/* стрелки между шагами */}
          {[0, 1].map((i) => (
            <div key={i} style={box({ left: 60 + (i + 1) * 290 - 20, top: 1130, fontSize: 40, fontWeight: 900, color: C.yellow, opacity: a([s2, s3][i]) })}>›</div>
          ))}
        </div>
      </div>
    </div>
  );
};

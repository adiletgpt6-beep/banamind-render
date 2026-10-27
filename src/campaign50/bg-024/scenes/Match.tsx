// Сцена 4 (≈31–43 с): условная карта Бишкека (без реальных адресов).
// Пометка «Шарттуу мисал». Галочки проверки по одной гасят несовместимые
// точки (другая школа, другая смена, далёкий дом); остаются три
// совпадающих дома — и только тогда линия маршрута проходит через них к
// школе. Плашка «Топ түзүлдү: 3–4 бала», затем «Шарттарды тактоо →
// кийинки кадам». Никакого звонка «в конкретный день».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut } from "../anim";
import { useWordAt } from "../context";
import { C } from "../palette";
import { Backdrop, Icon, Pill } from "../parts";
import { BG24_TEXT } from "../script";

const MAP = { x: 90, y: 300, w: 840, h: 780 } as const;
const SCHOOL = { x: 640, y: 560 } as const;
// совпадающие дома (по порядку маршрута) и несовместимые точки
const MATCH_HOMES = [
  { x: 250, y: 900 },
  { x: 420, y: 780 },
  { x: 560, y: 940 },
] as const;
const OTHER = [
  { x: 230, y: 560, why: "Б мектеби", check: 1 },
  { x: 840, y: 760, why: "2-смена", check: 2 },
  { x: 800, y: 1010, why: "алыс", check: 0 },
  { x: 380, y: 1020, why: "2-смена", check: 2 },
] as const;

export const MatchScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG24_TEXT.match;
  const formed = useWordAt("n04", 1); // «түзүлгөндө»
  const terms = useWordAt("n04", 4); // «шарттарын»
  const checksAt = [8, 20, 32];
  const ticked = (k: number) => clamp((f - checksAt[k]) / 8);
  const route = easeInOut((f - Math.max(44, formed - 6)) / 34);
  const group = appear(f, Math.max(44, formed - 6) + 30, 12);
  const next = appear(f, terms - 2, 14);
  const pts = [...MATCH_HOMES, SCHOOL];
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const len = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <Backdrop tone="cool" drift={f * 0.3} />
      <div
        style={{
          position: "absolute",
          left: MAP.x,
          top: MAP.y,
          width: MAP.w,
          height: MAP.h,
          borderRadius: 44,
          backgroundColor: "#FFFFFF",
          border: `4px solid ${C.line}`,
          overflow: "hidden",
          opacity: appear(f, 0, 10),
          transform: `scale(${0.96 + 0.04 * appear(f, 0, 14)})`,
        }}
      >
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", left: 0, top: 0 }}>
          {/* силуэт Ала-Тоо на горизонте */}
          <path d="M 0 150 L 90 80 L 160 120 L 260 40 L 360 110 L 450 60 L 560 120 L 660 50 L 760 110 L 840 70 L 840 0 L 0 0 Z" fill="#EEF3FA" />
          <path d="M 0 150 L 90 80 L 160 120 L 260 40 L 360 110 L 450 60 L 560 120 L 660 50 L 760 110 L 840 70" fill="none" stroke="#D6E0EE" strokeWidth={4} />
          <path d="M 240 52 L 260 40 L 282 56 M 640 62 L 660 50 L 684 66" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
          {/* условные улицы */}
          {[230, 420, 610].map((y) => (
            <path key={y} d={`M -20 ${y} Q 420 ${y - 40} 860 ${y + 10}`} fill="none" stroke="#EDF1F7" strokeWidth={26} />
          ))}
          {[180, 420, 660].map((x) => (
            <path key={x} d={`M ${x} 140 Q ${x + 30} 460 ${x - 10} 800`} fill="none" stroke="#EDF1F7" strokeWidth={26} />
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", left: MAP.x + 26, top: MAP.y + 24, opacity: appear(f, 4, 10) }}>
        <Pill size={30}>📍 {t.city}</Pill>
      </div>
      <div style={{ position: "absolute", right: 150 + 26, top: MAP.y + 24, opacity: appear(f, 6, 10) }}>
        <Pill size={28} bg={C.yellow} color={C.navy}>
          {t.example}
        </Pill>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* линия маршрута — только через совпавшие точки */}
        <path d={d} fill="none" stroke={C.yellow} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * route} ${len + 10}`} />
        {OTHER.map((o, i) => {
          const off = ticked(o.check);
          return (
            <g key={i} opacity={appear(f, 2 + i * 2, 8) * (1 - 0.7 * off)}>
              <circle cx={o.x} cy={o.y} r={24} fill="#FFFFFF" stroke={off > 0.5 ? "#B8C3D6" : C.navy} strokeWidth={6} />
              <text x={o.x} y={o.y + 62} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={28} fill={C.muted} opacity={off}>
                {o.why}
              </text>
            </g>
          );
        })}
        {MATCH_HOMES.map((h, i) => {
          const glow = clamp((f - checksAt[2] - 4 - i * 3) / 8);
          return (
            <g key={i} opacity={appear(f, 2 + i * 2, 8)}>
              <circle cx={h.x} cy={h.y} r={34 + 10 * glow} fill={C.yellow} opacity={0.35 * glow} />
              <circle cx={h.x} cy={h.y} r={28} fill={glow > 0.5 ? C.yellow : "#FFFFFF"} stroke={C.navy} strokeWidth={6} />
            </g>
          );
        })}
      </svg>
      {MATCH_HOMES.map((h, i) => (
        <div key={i} style={{ position: "absolute", left: h.x - 15, top: h.y - 16, opacity: appear(f, 2 + i * 2, 8) }}>
          <Icon kind="home" s={30} />
        </div>
      ))}
      {/* школа */}
      <div
        style={{
          position: "absolute",
          left: SCHOOL.x - 52,
          top: SCHOOL.y - 52,
          width: 104,
          height: 104,
          borderRadius: 30,
          backgroundColor: C.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: appear(f, 2, 10),
        }}
      >
        <Icon kind="school" s={64} color="#FFFFFF" />
      </div>
      <div style={{ position: "absolute", left: SCHOOL.x - 100, top: SCHOOL.y + 58, width: 200, textAlign: "center", fontSize: 30, fontWeight: 900, opacity: appear(f, 4, 10) }}>
        {t.school}
      </div>
      {/* топ түзүлдү */}
      <div style={{ position: "absolute", left: 0, right: 150, top: MAP.y + MAP.h - 96, display: "flex", justifyContent: "center", opacity: group, transform: `scale(${0.9 + 0.1 * group})` }}>
        <Pill size={40} bg={C.green}>
          ✓ {t.group}
        </Pill>
      </div>
      {/* проверка совместимости → кийинки кадам */}
      <div style={{ position: "absolute", left: 120, right: 170, top: MAP.y + MAP.h + 34, display: "flex", flexDirection: "column", gap: 14, opacity: 1 - next }}>
        {t.checks.map((c, k) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 900, opacity: appear(f, checksAt[k] - 6, 8) }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: ticked(k) > 0.5 ? C.green : "#FFFFFF",
                border: `4px solid ${ticked(k) > 0.5 ? C.green : C.line}`,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}
            >
              {ticked(k) > 0.5 ? "✓" : ""}
            </div>
            {c}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: MAP.y + MAP.h + 60, display: "flex", justifyContent: "center", opacity: next, translate: `0 ${(1 - next) * 18}px` }}>
        <div style={{ padding: "26px 34px", borderRadius: 32, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 44, fontWeight: 900, textAlign: "center", lineHeight: 1.15 }}>{t.next}</div>
      </div>
    </div>
  );
};

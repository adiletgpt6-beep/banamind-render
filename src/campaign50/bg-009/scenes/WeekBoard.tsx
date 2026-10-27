// Сквозная линия недели — одна доска через сцены 2–8:
//   • дни: сверху пять ячеек; в начале каждого дня посреди кадра всплывает
//     одна и та же метка «07:40 • Мектеп / Ким жеткирет?» и улетает в ячейку
//     дня; под ней дорисовывается кусок жёлтой линии — каждый день свой,
//     ломаный и оторванный от соседних (каждый раз решают заново);
//   • повтор: ячейки вырастают в календарь недели (строка «07:40 Мектеп»
//     и строка задач), на «кайталанат» строка школы подсвечивается целиком;
//   • суббота: календарь переезжает на стену; мама обводит строку маркером;
//     после заявки пять кусков выпрямляются и соединяются в одну
//     непрерывную линию с меткой BalaGo, а «?» в ячейках сменяются на ✓.
import { Img, staticFile } from "remotion";
import { CheckIcon, easeInOut, easeOut, NAVY, NAVY_SOFT, popScale, prog, SchoolChip, SchoolIcon, YELLOW } from "../art";
import { DAY_IDS, type SceneProps } from "../kit";
import { BG9_DAYS, BG9_TEXT } from "../script";
import { cueOf, sceneOf, wordTime, type Bg9Timeline } from "../timing";

export const COL_W = 180;
export const COL_GAP = 16;
export const BX0 = (1080 - (5 * COL_W + 4 * COL_GAP)) / 2;
export const colX = (i: number) => BX0 + i * (COL_W + COL_GAP) + COL_W / 2;
const HEAD_Y = 255;
const HEAD_H = 72;
export const SLOT_Y = 382; // центр строки школы и линии
const BODY_BOTTOM = 700;

// Времена доски (абсолютные секунды).
export const boardBeats = (tl: Bg9Timeline) => {
  const days = DAY_IDS.map((id) => {
    const s = sceneOf(tl, id);
    return { id, from: s.from, to: s.to, chipIn: s.from + 0.75, fly: s.from + 1.85, land: s.from + 2.3 };
  });
  const rep = sceneOf(tl, "repeat");
  const n07 = cueOf(tl, "n07");
  const sat = sceneOf(tl, "sat");
  const m01 = cueOf(tl, "m01");
  const n08 = cueOf(tl, "n08");
  return {
    days,
    show: days[0].from + 0.45,
    rep: { from: rep.from, school: wordTime(n07, "мектепке", 0.3), every: wordTime(n07, "күн", 0.6), repeat: wordTime(n07, "кайталанат", 0.8) },
    sat: { from: sat.from, to: sat.to, circle: wordTime(m01, "алдын", 0.6), connect: n08.from - 0.25, n08 },
  };
};

// Кусок линии дня: волна (amp) или прямая; draw — доля прорисовки.
const segPath = (i: number, amp: number, join: number) => {
  const half = COL_W / 2 - 14 + join * (COL_GAP / 2 + 14);
  const a = colX(i) - half;
  const b = colX(i) + half;
  const n = 18;
  const pts: string[] = [];
  for (let k = 0; k <= n; k++) {
    const x = a + ((b - a) * k) / n;
    const y = SLOT_Y + Math.sin((k / n) * Math.PI * 3 + i * 1.3) * amp;
    pts.push(`${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

export const WeekBoard: React.FC<SceneProps & { readonly wall?: number }> = ({ t, tl, wall = 0 }) => {
  const b = boardBeats(tl);
  const show = easeOut(prog(t, b.show, 0.5));
  if (show <= 0) return null;
  const grow = easeInOut(prog(t, b.rep.from + 0.05, 0.6));
  const band = easeInOut(prog(t, b.rep.repeat - 0.1, 0.55));
  const every = easeOut(prog(t, b.rep.repeat + 0.25, 0.45));
  const circle = easeInOut(prog(t, b.sat.circle - 0.1, 0.9));
  const connect = easeInOut(prog(t, b.sat.connect, 1.0));
  const badge = easeOut(prog(t, b.sat.connect + 0.6, 0.5));
  const activeIdx = b.days.findIndex((d) => t >= d.from - 0.05 && t < d.to);
  // суббота: доска переезжает на стену (масштаб вокруг верха центра)
  const ws = 1 - 0.14 * wall;
  const wy = 205 * wall;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: show, transform: `translateY(${wy + (1 - show) * -40}px) scale(${ws})`, transformOrigin: `540px ${HEAD_Y}px` }}>
      {/* тело календаря (повтор и суббота) */}
      {grow > 0 ? (
        <div style={{ position: "absolute", left: BX0 - 18, top: HEAD_Y - 18, width: 5 * COL_W + 4 * COL_GAP + 36, height: (BODY_BOTTOM - HEAD_Y + 36) * grow + (1 - grow) * (SLOT_Y + 60 - HEAD_Y + 36), borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 18px 44px rgba(20,40,75,0.16)" }} />
      ) : null}
      {/* подсветка строки школы */}
      {band > 0 ? <div style={{ position: "absolute", left: BX0 - 6, top: SLOT_Y - 52, width: (5 * COL_W + 4 * COL_GAP + 12) * band, height: 104, borderRadius: 52, backgroundColor: "rgba(255,201,40,0.38)" }} /> : null}
      {BG9_DAYS.map((d, i) => {
        const day = b.days[i];
        const on = t >= day.from - 0.05;
        const active = i === activeIdx;
        const pop = popScale(prog(t, day.from - 0.05, 0.35));
        const landed = prog(t, day.land, 0.25);
        const repPulse = grow > 0 ? Math.max(0, Math.sin(Math.PI * prog(t, b.rep.school + i * 0.12, 0.45))) : 0;
        const x = colX(i);
        return (
          <div key={d.id}>
            {/* ячейка дня */}
            <div
              style={{
                position: "absolute",
                left: x - COL_W / 2,
                top: HEAD_Y,
                width: COL_W,
                height: HEAD_H,
                borderRadius: 22,
                backgroundColor: on ? d.color : "#EEF2F8",
                color: on ? "#FFFFFF" : NAVY_SOFT,
                fontSize: d.name.length > 6 ? 30 : 34,
                fontWeight: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${on ? pop * (active ? 1.06 : 1) : 1})`,
                boxShadow: active ? `0 10px 24px ${d.color}66` : undefined,
              }}
            >
              {d.name}
            </div>
            {/* слот школы */}
            <div
              style={{
                position: "absolute",
                left: x - 38,
                top: SLOT_Y - 38,
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: landed > 0 ? "#FFFFFF" : "rgba(238,242,248,0.9)",
                border: `4px ${landed > 0 ? "solid" : "dashed"} ${landed > 0 ? d.color : "#C9D3E2"}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                transform: `scale(${1 + 0.18 * repPulse})`,
              }}
            >
              {landed > 0 ? <div style={{ transform: `scale(${popScale(landed)})` }}><SchoolIcon size={46} /></div> : null}
              {/* «?» — каждый день вопрос заново; после заявки — ✓ */}
              {landed > 0.5 ? (
                <div style={{ position: "absolute", right: -16, top: -14, width: 36, height: 36, borderRadius: 18, backgroundColor: connect > 0.5 ? "#25A55A" : "#E8463A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: 26, fontWeight: 1000, transform: `scale(${connect > 0.5 ? popScale(prog(t, b.sat.connect + 0.5 + i * 0.08, 0.3)) : 1})` }}>
                  {connect > 0.5 ? <CheckIcon size={24} color="#FFFFFF" /> : "?"}
                </div>
              ) : null}
            </div>
            {/* задача дня (календарь) */}
            {grow > 0 ? (
              <div style={{ position: "absolute", left: x - COL_W / 2 + 6, top: 460, width: COL_W - 12, height: 210, opacity: easeOut(prog(t, b.rep.from + 0.35 + i * 0.07, 0.35)), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: NAVY_SOFT }}>{["08:00", "09:00", "08:30", "07:50", "18:00"][i]}</div>
                <div style={{ width: "100%", padding: "12px 6px", boxSizing: "border-box", borderRadius: 18, backgroundColor: d.tint, border: `3px solid ${d.color}`, color: NAVY, fontSize: 27, fontWeight: 1000, textAlign: "center", lineHeight: 1.12 }}>{d.task}</div>
              </div>
            ) : null}
          </div>
        );
      })}
      {/* куски жёлтой линии (под слотами) */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {b.days.map((day, i) => {
          const draw = easeInOut(prog(t, day.land + 0.05, 0.5));
          if (draw <= 0) return null;
          return (
            <path
              key={day.id}
              d={segPath(i, 12 * (1 - connect), connect)}
              fill="none"
              stroke={YELLOW}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          );
        })}
        {/* обводка маркером (суббота) */}
        {circle > 0 ? (
          <ellipse cx={540} cy={SLOT_Y} rx={520} ry={78} fill="none" stroke="#E8463A" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform={`rotate(-1.5 540 ${SLOT_Y})`} />
        ) : null}
      </svg>
      {/* «Күн сайын» */}
      {every > 0 && wall < 0.5 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 735, display: "flex", justifyContent: "center", opacity: every, transform: `scale(${popScale(every)})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 30px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 46, fontWeight: 1000, color: NAVY }}>
            <svg width={46} height={46} viewBox="0 0 24 24">
              <path d="M 19 12 A 7 7 0 1 1 15.5 5.9" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
              <path d="M 14 3 L 16.5 6 L 13 8" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {BG9_TEXT.repeat.every}: {BG9_TEXT.repeat.row}
          </div>
        </div>
      ) : null}
      {/* метка BalaGo на соединённой линии */}
      {badge > 0 ? (
        <div style={{ position: "absolute", left: 540 - 150, top: 636, width: 300, display: "flex", justifyContent: "center", opacity: badge, transform: `scale(${popScale(badge)})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 24px 10px 12px", borderRadius: 40, backgroundColor: NAVY, boxShadow: "0 10px 24px rgba(20,40,75,0.25)" }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: 58, height: 58, borderRadius: 29 }} />
            <div style={{ fontSize: 44, fontWeight: 1000, color: "#FFFFFF" }}>BalaGo</div>
          </div>
        </div>
      ) : null}
      {/* летящая метка дня */}
      {b.days.map((day, i) => {
        if (t < day.chipIn || t > day.land + 0.05) return null;
        const d = BG9_DAYS[i];
        const inn = popScale(prog(t, day.chipIn, 0.4));
        const fly = easeInOut(prog(t, day.fly, day.land - day.fly));
        const sx = 540;
        const sy = 590;
        const x = sx + (colX(i) - sx) * fly;
        const y = sy + (SLOT_Y - sy) * fly - Math.sin(Math.PI * fly) * 90;
        const sc = (1 - 0.72 * fly) * inn;
        const pulse = fly === 0 ? 0.5 + 0.5 * Math.sin((t - day.chipIn) * 9) : 0;
        return (
          <div key={`chip-${day.id}`} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${sc})`, zIndex: 5 }}>
            <SchoolChip color={d.color} question={fly < 0.3 ? BG9_TEXT.who : undefined} glow={pulse * (1 - fly)} />
          </div>
        );
      })}
    </div>
  );
};

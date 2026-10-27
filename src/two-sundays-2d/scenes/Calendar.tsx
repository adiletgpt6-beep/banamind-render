// Сцена 1. Два воскресенья.
// A. Предметный крупный план сверху: камера на обычной клетке «Жекшемби»
//    (на «Бири…» её обводит карандашный контур), затем скользит к
//    «Биздин жекшемби» в середине недели (контур на «Экинчиси»).
// B. Отъезд: строго сверху весь лист — семь клеток, рядом карандаши.
//    Детская рука с карандашом заканчивает маленький луч солнышка у
//    рисунка семьи. Вопрос «Эмне үчүн эки жекшемби?» — в свободной области
//    над листом, не поверх календаря.
import { CAL_CELLS, CAL_POINTS } from "../props/Calendar";
import { CloseHand } from "../props/CloseHand";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, camMove, settle, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { HANDS } from "./common";
import { Desk, onSheet, PencilTop, Pencils, SHEET_CENTER, SheetTop } from "./CalendarTop";

export const calendarPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "calendar");
  const ring7 = T.word("N01", "Бири");
  const glide = T.word("N01", "Экинчиси") - 6;
  const ring3 = glide + 18;
  const pull = T.word("N01", "аптанын") + 4;
  const handIn = pull + 10;
  const ray: [number, number] = [T.to("N01") - 4, T.to("N01") + 14];
  const question = T.to("N01") - 2;
  return { ring7, glide, ring3, pull, handIn, ray, question, len: T.len };
};

// Конец последнего луча солнышка (единицы листа).
const c3 = CAL_CELLS[2];
const SUN = { x: c3.x + c3.w / 2 + 112, y: c3.y + 400 - 205 };
const RAY_A = (7 / 8) * Math.PI * 2 - Math.PI / 2;
const rayTip = (k: number) => ({ x: SUN.x + Math.cos(RAY_A) * (36 + 22 * k), y: SUN.y + Math.sin(RAY_A) * (36 + 22 * k) });

// Запястье для кончика карандаша в щепоти (CloseHand pinch), угол руки ang.
const wristFor = (tip: { x: number; y: number }, ang: number, L: number) => {
  const r = (ang * Math.PI) / 180;
  const lx = 0.78 * L * 0.2;
  const ly = L * 1.02;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

export const CalendarScene: React.FC = () => {
  const { f } = useScene("calendar");
  const p = usePlan(calendarPlan);
  const sunday = onSheet(CAL_POINTS.sunday);
  const ours = onSheet(CAL_POINTS.ourSunday);
  const full = { x: SHEET_CENTER.x + 30, y: SHEET_CENTER.y - 130, zoom: 1.08 };
  const close7 = { x: sunday.x, y: sunday.y + 150, zoom: 1.95 };
  const close3 = { x: ours.x, y: ours.y + 170, zoom: 1.95 };
  const cam =
    f < p.glide
      ? { ...close7, zoom: lerp(2.1, 1.95, easeInOut(f / Math.max(1, p.glide))) }
      : f < p.pull
        ? camMove(f, p.glide, p.glide + 20, close7, close3)
        : camMove(f, p.pull, p.pull + 30, close3, full);
  const ring7 = clamp((f - p.ring7) / 16);
  const ring3 = clamp((f - p.ring3) / 16);
  const ray = clamp((f - p.ray[0]) / (p.ray[1] - p.ray[0]));
  // рука: входит снизу справа, кончик карандаша — у начала луча, затем ведёт штрих
  const L = 120;
  const ANG = 140;
  const tip = onSheet(rayTip(f < p.ray[0] ? 0 : ray));
  const away = { x: tip.x + 520, y: tip.y + 760 };
  const inK = easeInOut(clamp((f - p.handIn) / 26));
  const outK = easeInOut(clamp((f - p.ray[1] - 8) / 24));
  const tipW = { x: lerp(away.x, tip.x, inK - outK), y: lerp(away.y, tip.y, inK - outK) - (f < p.ray[0] ? 10 * (1 - clamp((f - p.ray[0] + 8) / 8)) : 0) };
  const wrist = wristFor(tipW, ANG, L);
  const showHand = f >= p.handIn && outK < 1;
  const q = f - p.question;
  return (
    <Shot f={f} cam={cam} bg={C.woodLight}>
      <Desk />
      <Pencils />
      <SheetTop ring3={ring3} ring7={ring7} ray={ray} />
      {showHand ? (
        <>
          <PencilTop tip={tipW} ang={ANG - 90 - 32} color={C.orange} />
          <Svg>
            <CloseHand x={wrist.x} y={wrist.y} angle={ANG} size={L} {...HANDS.girl} shape="pinch" armLen={2.2} />
          </Svg>
        </>
      ) : null}
      {q >= 0 ? (
        <div style={box({ left: full.x - 470, top: full.y - 960 / full.zoom + 120 / full.zoom, width: 940, textAlign: "center" })}>
          <div
            style={{
              display: "inline-block",
              padding: "18px 34px 22px",
              backgroundColor: C.white,
              borderRadius: 22,
              boxShadow: `0 14px 30px ${C.shadow}`,
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 76 / full.zoom,
              color: C.navy,
              opacity: clamp(q / 6),
              transform: `translateY(${(1 - settle(q, 14)) * 40}px)`,
            }}
          >
            {SU2_TEXT.question.split(" ").slice(0, 2).join(" ")} <span style={{ color: C.orange }}>{SU2_TEXT.question.split(" ").slice(2).join(" ")}</span>
          </div>
        </div>
      ) : null}
    </Shot>
  );
};

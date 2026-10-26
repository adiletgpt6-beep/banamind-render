// Сцена 5: условия по шагам — три карточки появляются по словам диктора
// («Адегенде ылайыктуу топ түзүлөт. Биринчи толук сыноо сапары акысыз.
// Андан кийин улантууну өзүңүз чечесиз.»). На словах «Андан кийин…»
// карточки уходят вверх строкой, и в рамке с пометкой «Каттам уюшулганда —
// мүмкүн болгон көрүнүш» повторяется проезд камеры из хука — днём.
import { COLORS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { camMove } from "../../../two-schedules-2d/shots";
import { easeInOut, easeOut } from "../../../two-schedules-2d/rig/motion";
import { useSceneInfo } from "../context";
import { BG15_TEXT } from "../script";
import { PARK_CAM_A, PARK_CAM_B } from "../sets/Park";
import { wordTime } from "../timeline";
import { PossibleTag } from "../ui";
import { PossibleWorld } from "./Possible";

export const POSSIBLE_GLIDE = 132;

export const StepsScene: React.FC = () => {
  const { f, dur, line, fr } = useSceneInfo("steps");
  const n03 = line("n03");
  const at = [n03.from - 6, fr(wordTime(n03.cue, "ылайыктуу", 0.12)) - 4, fr(wordTime(n03.cue, "биринчи", 0.35)) - 4];
  const after = fr(wordTime(n03.cue, "андан", 0.7)) - 8;
  const k = easeInOut((f - after) / 18); // 0 — карточки крупно, 1 — строкой сверху
  const panel = easeOut((f - after - 6) / 14);
  const glide = camMove(f, after + 10, Math.min(dur - 4, after + 10 + POSSIBLE_GLIDE), PARK_CAM_A, PARK_CAM_B);
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #FFFFFF, #EAF3FC)", fontFamily, color: COLORS.navy }}>
      <div style={{ position: "absolute", right: -200, top: -160, width: 620, height: 620, borderRadius: 310, backgroundColor: COLORS.yellowSoft }} />
      {/* «возможное после» в рамке */}
      {panel > 0 ? (
        <div style={{ position: "absolute", left: 540 - 470, top: 410, width: 1080, height: 1920, transformOrigin: "0 0", scale: `${940 / 1080}`, borderRadius: 50, overflow: "hidden", opacity: panel, boxShadow: "0 30px 70px rgba(20,40,90,0.3)" }}>
          <PossibleWorld f={f - after} cam={glide} />
          <div style={{ position: "absolute", inset: 0, border: "10px dashed rgba(255,255,255,0.9)", borderRadius: 50, boxSizing: "border-box" }} />
        </div>
      ) : null}
      <PossibleTag a={panel} text={BG15_TEXT.possible} sub={BG15_TEXT.possibleSub} />
      {/* карточки шагов */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 330 - k * 400, opacity: 1 - k }}>
        {BG15_TEXT.steps.map((s, i) => {
          const a = easeOut((f - at[i]) / 12);
          return (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 30, marginTop: i ? 44 : 0, padding: "44px 40px", borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 16px 40px rgba(20,40,90,0.14)", opacity: a, translate: `${(1 - a) * 80}px 0` }}>
              <div style={{ width: 120, height: 120, flex: "none", borderRadius: 60, backgroundColor: i === 2 ? COLORS.yellow : "#DDE8F6", fontSize: 64, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.1 }}>{s.title}</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.navySoft, marginTop: 10, lineHeight: 1.2 }}>{s.text}</div>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 40, fontWeight: 800, color: COLORS.navySoft, opacity: easeOut((f - after + 20) / 10) }}>{BG15_TEXT.stepsNote}</div>
      </div>
    </div>
  );
};

// План 2 (4,03–8,93 с): «Адегенде ишиңизди токтотосуз, анан жолго чыгасыз,
// мектепке жетесиз». В этом плане лицо ниже центра — над головой много неба
// и здания, поэтому цепочка шагов стоит сверху:
//   ИШ (на «ишиңизди») → пауза (на «токтотосуз») → ЖОЛ (на «жолго»)
//   → МЕКТЕП (на «мектепке») → ✓ (на «жетесиз»).
// Часы-чип (продолжение секундомера плана 1) отсчитывают время пути.
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, CheckIcon, PauseIcon, RoadIcon, SchoolIcon } from "../../live/icons";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { Glow } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

const Y = 560; // центр узлов
const NODES = [
  { x: 185, label: "ИШ", at: CUE.ishinizdi },
  { x: 505, label: "ЖОЛ", at: CUE.zholgo },
  { x: 825, label: "МЕКТЕП", at: CUE.mektepke2 },
] as const;

const Node: React.FC<{ readonly t: number; readonly i: number; readonly exit: number }> = ({ t, i, exit }) => {
  const n = NODES[i];
  const k = springy(t, n.at, 0.55);
  const a = ramp(t, n.at, 0.2);
  if (a <= 0) return null;
  const paused = i === 0 ? ramp(t, CUE.toktotosuz, 0.25) : 0;
  const done = i === 2 ? springy(t, CUE.zhetesiz, 0.5) : 0;
  const icon =
    i === 0 ? <BriefcaseIcon size={104} /> : i === 1 ? <RoadIcon size={104} /> : <SchoolIcon size={108} />;
  return (
    <div
      style={{
        position: "absolute",
        left: n.x - 100,
        top: Y - 100 - exit * 60 * (i + 1),
        width: 200,
        height: 200,
        opacity: a * (1 - exit),
        transform: `scale(${0.5 + 0.5 * k}) translateY(${(1 - k) * 50}px)`,
      }}
    >
      {i === 2 ? <Glow size={360} opacity={0.55 * done} style={{ left: -80, top: -80 }} /> : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 52,
          background: i === 2 && done > 0 ? `linear-gradient(160deg, ${C.white}, ${C.yellow})` : "rgba(255,255,255,0.96)",
          boxShadow: "0 26px 60px rgba(6,14,38,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: paused ? `grayscale(${paused * 0.85}) brightness(${1 - paused * 0.12})` : undefined,
        }}
      >
        {icon}
      </div>
      {i === 0 && paused > 0 ? (
        <div style={{ position: "absolute", right: -26, top: -26, transform: `scale(${mix(1.7, 1, springy(t, CUE.toktotosuz, 0.45))}) rotate(${(1 - paused) * -25}deg)`, opacity: paused }}>
          <PauseIcon size={86} />
        </div>
      ) : null}
      {i === 2 && done > 0 ? (
        <div style={{ position: "absolute", right: -24, top: -24, transform: `scale(${done})` }}>
          <CheckIcon size={84} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 214,
          left: -60,
          right: -60,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 50,
          color: C.white,
          letterSpacing: 1,
          textShadow: "0 4px 18px rgba(0,0,0,0.55)",
        }}
      >
        {n.label}
      </div>
    </div>
  );
};

// Соединительная линия с бегущей точкой.
const Link: React.FC<{ readonly t: number; readonly from: number; readonly to: number; readonly at: number; readonly dur: number; readonly exit: number }> = ({
  t,
  from,
  to,
  at,
  dur,
  exit,
}) => {
  const p = ramp(t, at, dur, easeInOut);
  if (p <= 0) return null;
  const x1 = NODES[from].x + 110;
  const x2 = NODES[to].x - 110;
  const len = x2 - x1;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - exit }}>
      <line x1={x1} y1={Y} x2={x1 + len * p} y2={Y} stroke={C.yellow} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 18" />
      <circle cx={x1 + len * p} cy={Y} r={14} fill={C.yellow} />
      <circle cx={x1 + len * p} cy={Y} r={26} fill={C.yellow} opacity={0.25} />
    </svg>
  );
};

// Часы-чип: продолжение секундомера; время идёт вместе с шагами.
const ClockChip: React.FC<{ readonly t: number; readonly exit: number }> = ({ t, exit }) => {
  const start = LIVE04.cuts[0];
  if (t < start) return null;
  // 14:40 на старте → 14:45 в пути → 15:00 у школы (иллюстрация времени)
  const minutes =
    40 + Math.round(ramp(t, CUE.zholgo, 1.4, easeInOut) * 8 + ramp(t, CUE.mektepke2 - 0.5, 0.6, easeOut) * 12);
  const hh = minutes >= 60 ? 15 : 14;
  const mm = minutes % 60;
  const school = ramp(t, CUE.mektepke2, 0.3);
  const k = springy(t, start, 0.45);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 150,
        top: 790 - 46,
        width: 300,
        height: 92,
        borderRadius: 46,
        background: school > 0.5 ? C.yellow : "rgba(10,22,54,0.88)",
        color: school > 0.5 ? C.navyInk : C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily,
        fontWeight: 900,
        fontSize: 54,
        fontVariantNumeric: "tabular-nums",
        boxShadow: "0 18px 40px rgba(6,14,38,0.4)",
        transform: `scale(${0.85 + 0.15 * k})`,
        opacity: 1 - exit,
      }}
    >
      <svg width={52} height={52} viewBox="-26 -26 52 52">
        <circle r={22} fill="none" stroke="currentColor" strokeWidth={5} />
        <line x1={0} y1={0} x2={0} y2={-14} stroke="currentColor" strokeWidth={5} strokeLinecap="round" transform={`rotate(${mm * 6})`} />
        <line x1={0} y1={0} x2={9} y2={0} stroke="currentColor" strokeWidth={5} strokeLinecap="round" transform={`rotate(${(hh % 12) * 30 + mm / 2 - 90})`} />
      </svg>
      {`${hh}:${String(mm).padStart(2, "0")}`}
    </div>
  );
};

// Подпись шага сверху: что сейчас происходит.
const StepTitle: React.FC<{ readonly t: number; readonly exit: number }> = ({ t, exit }) => {
  const steps = [
    { at: CUE.adegende, text: "1 • ИШТИ ТОКТОТУУ", color: C.red },
    { at: CUE.zholgo, text: "2 • ЖОЛГО ЧЫГУУ", color: C.white },
    { at: CUE.mektepke2, text: "3 • МЕКТЕПКЕ ЖЕТҮҮ", color: C.yellow },
  ];
  let cur = -1;
  for (let i = 0; i < steps.length; i++) if (t >= steps[i].at - 0.05) cur = i;
  if (cur < 0) return null;
  const s = steps[cur];
  const a = ramp(t, s.at - 0.05, 0.25, easeOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 270,
        display: "flex",
        justifyContent: "center",
        opacity: 1 - exit,
      }}
    >
      <div
        style={{
          padding: "12px 34px",
          borderRadius: 999,
          background: "rgba(10,22,54,0.82)",
          border: `3px solid ${s.color}`,
          color: s.color,
          fontFamily,
          fontWeight: 900,
          fontSize: 50,
          letterSpacing: 1,
          transform: `translateY(${(1 - a) * -30}px)`,
          opacity: a,
          boxShadow: "0 14px 40px rgba(6,14,38,0.4)",
        }}
      >
        {s.text}
      </div>
    </div>
  );
};

export const Steps: React.FC = () => {
  const t = useT();
  const [from, to] = [LIVE04.cuts[0], LIVE04.cuts[1]];
  if (t < from - 0.05 || t > to + 0.3) return null;
  const exit = ramp(t, to - 0.12, 0.35, easeInOut);
  return (
    <>
      {/* мягкое затемнение неба, чтобы белые узлы читались */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(6,14,38,0.5) 0%, rgba(6,14,38,0.25) 35%, rgba(6,14,38,0) 50%)",
          opacity: ramp(t, from, 0.3) * (1 - exit),
        }}
      />
      <StepTitle t={t} exit={exit} />
      <Link t={t} from={0} to={1} at={CUE.anan} dur={CUE.zholgo - CUE.anan + 0.05} exit={exit} />
      <Link t={t} from={1} to={2} at={CUE.mektepke2 - 0.45} dur={0.45} exit={exit} />
      {[0, 1, 2].map((i) => (
        <Node key={i} t={t} i={i} exit={exit} />
      ))}
      <ClockChip t={t} exit={exit} />
    </>
  );
};

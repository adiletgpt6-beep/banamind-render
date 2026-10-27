// Сцена 5 (≈42–56 с): шнурки становятся маршрутом. Красные кроссовки
// крупно; шнурки желтеют, бант покадрово развязывается, концы тянутся
// вверх и превращаются в две жёлтые линии: утром ҮЙ → МЕКТЕП, после
// уроков МЕКТЕП → ҮЙ. В центре — белая машина (стоит, ещё никого не
// везёт). Кроссовки «отпрыгивают» домой, к значку ҮЙ, и по словам
// диктора появляются условия: заявка → подбор группы (3–4 ребёнка,
// до 2 недель) → первая полная пробная поездка бесплатно — после того
// как группа сформирована. В конце сцены — склейка домой: сын поднимает
// взгляд на родителей, мама обнимает его за плечо, папа с телефоном.
// Диктор: «BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке, кайра
// үйгө каттам топ түзүлгөндөн кийин уюштурулат. Биринчи толук сыноо
// сапары акысыз.»
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useLine, useScene, useTimeline } from "../context";
import { C } from "../palette";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG14_TEXT, BG14_VIDEO } from "../script";
import { HomeBack } from "../sets/Home";
import { Car } from "../sets/Outdoor";
import { camMove, Shot } from "../shots";
import { laceTips, Sneakers, stopFrame, stopKeys } from "../sneakers";
import { FLOOR, H, SPOT, wordFrame } from "./common";

const HOME_P = { x: 200, y: 620 };
const SCHOOL_P = { x: 880, y: 620 };
const SN = { x: 230, y: 1340, s: 0.86 };
const SN_SMALL = { x: 36, y: 828, s: 0.3 };

export const LACE = { yellow: 8, pull0: 10, pull1: 34 } as const;

// Отрезок пути длиной len, нарисованный на долю p (штрих-пунктир по длине).
const Drawn: React.FC<{ d: string; p: number; len: number; w?: number; opacity?: number }> = ({ d, p, len, w = 16, opacity = 1 }) =>
  p <= 0 ? null : (
    <g opacity={opacity} fill="none" strokeLinecap="round">
      <path d={d} stroke="#E0A800" strokeWidth={w + 8} strokeDasharray={`${len * p} ${len}`} />
      <path d={d} stroke={C.yellow} strokeWidth={w} strokeDasharray={`${len * p} ${len}`} />
    </g>
  );

const Stop: React.FC<{ p: { x: number; y: number }; kind: "home" | "school"; label: string; a: number }> = ({ p, kind, label, a }) => (
  <div style={{ position: "absolute", left: p.x - 80, top: p.y - 74, width: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: a, transform: `scale(${0.7 + 0.3 * a})` }}>
    <svg width={140} height={140} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={47} fill={kind === "home" ? C.yellow : C.navy} stroke="#FFFFFF" strokeWidth={4} />
      {kind === "home" ? (
        <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={C.navy} />
      ) : (
        <g fill="#FFFFFF">
          <path d="M 24 46 L 50 28 L 76 46 Z" />
          <rect x={30} y={46} width={40} height={28} />
          <rect x={45} y={58} width={10} height={16} fill={C.navy} />
        </g>
      )}
    </svg>
    <div style={{ fontFamily, fontSize: 40, fontWeight: 900, color: C.navy, whiteSpace: "nowrap" }}>{label}</div>
  </div>
);

const StepRow: React.FC<{ y: number; n: number; title: string; note: string; a: number; badge?: string; tint?: string; children?: React.ReactNode }> = ({ y, n, title, note, a, badge, tint, children }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 150,
      top: y,
      height: 124,
      borderRadius: 28,
      backgroundColor: tint ?? "#FFFFFF",
      border: `4px solid ${badge ? C.yellow : "#DCE3EE"}`,
      boxShadow: "0 10px 26px rgba(20,40,90,0.10)",
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "0 22px",
      boxSizing: "border-box",
      opacity: a,
      translate: `${(1 - a) * 60}px 0`,
      fontFamily,
    }}
  >
    <div style={{ width: 62, height: 62, borderRadius: 31, flexShrink: 0, backgroundColor: badge ? C.yellow : C.navy, color: badge ? C.navy : "#FFFFFF", fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1.08 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#4A5D88", marginTop: 4 }}>{note}</div>
    </div>
    {badge ? <div style={{ padding: "8px 20px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: 34, fontWeight: 900 }}>{badge}</div> : null}
    {children}
  </div>
);

export const LacesScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames, from } = useScene();
  const n02 = useLine("n02");
  const cue = useTimeline().cues.find((c) => c.id === "n02")!;
  const wCity = wordFrame(cue, "бишкек", 0.15, from);
  const wHome = wordFrame(cue, "үйдөн", 0.3, from);
  const wSchool = wordFrame(cue, "мектепке", 0.38, from);
  const wBack = wordFrame(cue, "кайра", 0.44, from);
  const wTop = wordFrame(cue, "топ", 0.55, from);
  const wFirst = wordFrame(cue, "биринчи", 0.75, from);
  const family = n02.to + 10;

  const yellow = stopFrame(f) >= LACE.yellow;
  const pull = stopKeys(f, LACE.pull0, LACE.pull1);
  const tie = 1 - 0.6 * stopKeys(f, LACE.pull0 - 4, LACE.pull1 - 8);
  const rDone = wBack + 28;
  // кроссовки покадрово «переезжают» к значку ҮЙ
  const hopT = stopKeys(f, rDone, rDone + 18);
  const sn = { x: lerp(SN.x, SN_SMALL.x, hopT), y: lerp(SN.y, SN_SMALL.y, hopT) - Math.sin(Math.PI * hopT) * 120, s: lerp(SN.s, SN_SMALL.s, hopT) };
  const tips = laceTips(SN.x, SN.y, SN.s);
  const laceLine = (tip: { x: number; y: number }, to: { x: number; y: number }) => `M ${tip.x} ${tip.y} C ${tip.x} ${tip.y - 160}, ${to.x} ${to.y + 260}, ${to.x} ${to.y + 80}`;
  const pL = easeInOut((f - (wHome - 34)) / 26);
  const pR = easeInOut((f - (wHome - 22)) / 26);
  const laceFade = 1 - clamp((f - rDone) / 10);
  const am = easeInOut((f - wHome) / Math.max(12, wSchool + 10 - wHome));
  const pm = easeInOut((f - wBack) / 24);
  const amD = `M ${HOME_P.x + 60} ${HOME_P.y - 40} Q 540 300 ${SCHOOL_P.x - 60} ${SCHOOL_P.y - 40}`;
  const pmD = `M ${SCHOOL_P.x - 60} ${SCHOOL_P.y + 40} Q 540 940 ${HOME_P.x + 60} ${HOME_P.y + 40}`;
  const arrow = (x: number, y: number, rot: number, a: number) =>
    a > 0.95 ? <path d={`M ${x - 22} ${y - 18} L ${x + 6} ${y} L ${x - 22} ${y + 18}`} transform={`rotate(${rot} ${x} ${y})`} stroke={C.navy} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null;
  const appear = (at: number) => easeOut((f - at) / 10);
  const t = BG14_TEXT.route;

  const graphic = (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #FFFDF4 55%, #FFF3C9 100%)", fontFamily }}>
      {/* BalaGo • Бишкек */}
      <div style={{ position: "absolute", left: 60, right: 150, top: 262, display: "flex", justifyContent: "center", opacity: appear(wCity - 8) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 30px 10px 12px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 44, fontWeight: 900 }}>
          <Img src={staticFile(BG14_VIDEO.logo)} style={{ width: 70, height: 70, borderRadius: 35, objectFit: "cover" }} />
          BalaGo • 📍 {t.city}
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <Drawn d={laceLine(tips.l, HOME_P)} p={pL} len={900} opacity={laceFade} />
        <Drawn d={laceLine(tips.r, SCHOOL_P)} p={pR} len={900} opacity={laceFade} />
        <Drawn d={amD} p={am} len={820} />
        <Drawn d={pmD} p={pm} len={820} />
        {arrow(540, 460, 0, am)}
        {arrow(540, 780, 180, pm)}
      </svg>
      <div style={{ position: "absolute", left: 300, right: 300, top: 384, textAlign: "center", fontSize: 30, fontWeight: 900, color: C.navy, opacity: am }}>☀ {BG14_TEXT.schoolTimes.am}</div>
      <div style={{ position: "absolute", left: 300, right: 300, top: 800, textAlign: "center", fontSize: 30, fontWeight: 900, color: C.navy, opacity: pm }}>🏫 {BG14_TEXT.schoolTimes.pm}</div>
      <Stop p={HOME_P} kind="home" label="ҮЙ" a={easeOut((f - (wHome - 10)) / 8)} />
      <Stop p={SCHOOL_P} kind="school" label="МЕКТЕП" a={easeOut((f - (wHome + 2)) / 8)} />
      {/* белая машина ждёт в центре маршрута — пока никого не везёт */}
      <div style={{ opacity: appear(wTop - 4) }}>
        <Car x={540} y={662} s={0.42} color="#FFFFFF" />
      </div>
      <div style={{ position: "absolute", left: 300, right: 300, top: 676, textAlign: "center", fontSize: 26, fontWeight: 800, color: "#4A5D88", opacity: appear(wTop + 4) }}>{t.car}</div>
      {/* условия: заявка → группа → первая полная пробная поездка */}
      <StepRow y={900} n={1} title={t.steps[0].title} note={t.steps[0].note} a={appear(rDone + 8)} />
      <StepRow y={1040} n={2} title={t.steps[1].title} note={t.steps[1].note} a={appear(wTop - 4)} tint="#F3F6FC">
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2, 3].map((k) => {
            const on = clamp((f - wTop - 6 - k * 6) / 6);
            return <div key={k} style={{ width: 30, height: 30, borderRadius: 15, border: `4px ${k === 3 ? "dashed" : "solid"} ${C.navy}`, backgroundColor: k === 3 ? "transparent" : `rgba(255,201,14,${on})` }} />;
          })}
        </div>
      </StepRow>
      <StepRow y={1180} n={3} title={t.steps[2].title} note={`⏳ ${t.steps[2].note}`} a={appear(wFirst - 4)} badge={t.steps[2].badge} />
      <Sneakers x={sn.x} y={sn.y} s={sn.s} f={f} tie={hopT > 0 ? 1 : tie} pull={hopT > 0 ? 0 : pull} laceColor={yellow ? C.yellow : "#FFFFFF"} jitter={hopT > 0 && hopT < 1 ? 1 : 0.6} />
    </div>
  );

  // финальный семейный кадр: сын поднимает взгляд на родителей
  const son = (): Place => ({ x: SPOT.son + 40, y: FLOOR, h: H.son });
  const mom = (): Place => ({ x: SPOT.momNear, y: FLOOR + 10, h: H.mom });
  const dad = (): Place => ({ x: SPOT.dadNear, y: FLOOR + 20, h: H.dad });
  const sonPose = (q: number): PoseIn => ({
    expr: "smile",
    lookY: keys(q, [[family, 0.1], [family + 14, -0.6]]),
    headTilt: keys(q, [[family + 6, 0], [family + 20, 6]]),
    armL: { target: null, shape: "relax" },
    armR: { target: null, shape: "relax" },
  });
  const momPose = (): PoseIn => {
    const s = son();
    return {
      expr: "smile",
      armL: { target: { x: s.x + 0.1 * s.h, y: s.y - 0.7 * s.h }, shape: "open", elbow: "down", behind: false },
      armR: { target: { x: mom().x + 0.12 * H.mom, y: mom().y - 0.42 * H.mom }, shape: "relax", elbow: "out" },
      lookY: 0.35,
    };
  };
  const dadPose = (): PoseIn => ({
    expr: "smile",
    armR: { target: { x: dad().x + 0.06 * H.dad, y: dad().y - 0.56 * H.dad }, shape: "phone", item: "phone", elbow: "hang", glow: 1, behind: false },
    lookY: 0.4,
  });
  return (
    <>
      {f < family ? graphic : null}
      <Shot f={f} from={family} to={frames + 1} cam={camMove(f, family, frames, { x: 800, y: 1150, zoom: 1.08 }, { x: 790, y: 1140, zoom: 1.16 })}>
        <HomeBack minutes={7 * 60 + 47} />
        <Actor uid="l-son" look="son" f={f} place={son} face={(q) => keys(q, [[family, 0.3], [family + 12, 0.7]])} pose={sonPose} role="son" seed={4} />
        <Actor uid="l-mom" look="mom" f={f} place={mom} face={() => -0.55} pose={momPose} role="mother" seed={6} />
        <Actor uid="l-dad" look="dad" f={f} place={dad} face={() => -0.5} pose={dadPose} role="father" seed={2} />
      </Shot>
    </>
  );
};

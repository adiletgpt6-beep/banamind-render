// Сцена 4. Папа тоже занят.
// A. Зал обучения: флипчарт «Кызматкерлерди окутуу», двое сотрудников
//    готовятся за столом; папа отошёл к окну, телефон у уха (F01) —
//    спокойно, с сожалением, без раздражения.
// B. Студия: Айжан с телефоном у уха — «Түшүндүм.» (M01), кивок; опускает
//    телефон, смотрит на собранную папку и берёт ключи — решение принято
//    действием.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keys, keysV } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { T3bTimeline } from "../timing";
import { STUDIO, StudioBack, StudioDesk } from "../sets/Studio";

export const dadPlan = (tl: T3bTimeline) => {
  const T = sceneTools(tl, "dad");
  const mom = T.to("F01") + 6;
  const down = T.to("M01") + 10;
  const look = down + 14;
  const keysAt = look + 26;
  return { mom, down, look, keysAt, len: T.len };
};
type P = ReturnType<typeof dadPlan>;

const FLOOR = 1640;
const DAD: Place = { x: 760, y: FLOOR, h: 980 };
const EMP1: Place = { x: 200, y: FLOOR + 40, h: 900 };
const EMP2: Place = { x: 420, y: FLOOR + 40, h: 900 };

const Training: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} cam={{ x: 560, y: 1080, zoom: 1.05 }} bg="#E8EEF2">
    <div style={box({ left: -300, top: -200, width: 1800, height: FLOOR + 200, backgroundColor: "#E4EAEE" })} />
    <div style={box({ left: 820, top: 420, width: 360, height: 620, background: "linear-gradient(180deg, #DCEBF5, #F1EADB)", border: `16px solid ${C.white}`, boxSizing: "border-box" })} />
    {/* флипчарт */}
    <div style={box({ left: 120, top: 360, width: 500, height: 560, backgroundColor: C.white, border: `10px solid ${C.navySoft}`, boxSizing: "border-box" })}>
      <div style={box({ left: 30, top: 30, width: 420, fontFamily: F.display, fontWeight: 900, fontSize: 52, lineHeight: 1.05, color: C.navy })}>{T3B_TEXT.dadTraining}</div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 34, top: 230 + i * 80, width: 60, height: 14, borderRadius: 7, backgroundColor: C.green })} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={`l${i}`} style={box({ left: 120, top: 226 + i * 80, width: 300 - i * 50, height: 22, borderRadius: 11, backgroundColor: "#C9D1DC" })} />
      ))}
    </div>
    <div style={box({ left: 350, top: 920, width: 14, height: 500, backgroundColor: C.navySoft })} />
    <div style={box({ left: -300, top: FLOOR, width: 1800, height: 800, backgroundColor: "#C7CDD3" })} />
    {/* сотрудники за столом (спиной к камере, смотрят на флипчарт) */}
    <Actor uid="s4-e1" look="colleagueW" f={f} place={() => EMP1} face={() => -0.35} pose={() => ({ sit: 1, seat: 260, expr: "calm", lookY: -0.1, armL: { target: { x: 150, y: 1420 }, elbow: "down" }, armR: { target: { x: 250, y: 1420 }, elbow: "down" } })} seed={11} />
    <Actor uid="s4-e2" look="colleagueM" f={f} place={() => EMP2} face={() => -0.4} pose={(t) => ({ sit: 1, seat: 260, expr: "calm", lookY: 0.2, nod: 2 * Math.sin(t / 18), armL: { target: { x: 370, y: 1430 }, elbow: "down", shape: "pinch", item: "pencil" }, armR: { target: { x: 470, y: 1420 }, elbow: "down" } })} seed={12} blinkShift={31} />
    <div style={box({ left: 60, top: 1430, width: 520, height: 30, backgroundColor: C.wood })} />
    <div style={box({ left: 80, top: 1460, width: 480, height: 200, backgroundColor: C.woodDark })} />
    <Actor
      uid="s4-dad"
      look="ata"
      f={f}
      place={() => DAD}
      face={() => -0.25}
      pose={() => ({ expr: "apologetic", lookY: 0.1, armR: { target: { x: 830, y: 820 }, shape: "phone", item: "phone", elbow: "out", behind: false }, armL: { target: { x: 700, y: 1180 }, elbow: "down" } })}
      role="father"
      seed={2}
    />
  </Shot>
);

const MOM: Place = { x: 470, y: STUDIO.floorY, h: 900 };
const Mom: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const phoneDown = easeInOut(clamp((f - p.down) / 14));
  const pose = (t: number) => {
    return {
      expr: t < p.look ? ("thinking" as const) : ("calm" as const),
      lookY: t < p.look ? 0.1 : 0.55,
      nod: keys(t, [[p.down - 30, 0], [p.down - 22, 6], [p.down - 12, 0]]),
      armR: {
        target: keysV(t, [[p.down, { x: 540, y: 820 }], [p.down + 14, { x: 560, y: 1180 }]], anticipate),
        shape: "phone" as const,
        item: "phone" as const,
        elbow: (phoneDown < 0.5 ? "out" : "down") as "out" | "down",
        behind: false,
      },
      armL: {
        target: keysV(t, [[p.keysAt - 12, { x: 400, y: 1200 }], [p.keysAt, { x: 300, y: 1290 }], [p.keysAt + 22, { x: 380, y: 1180 }]], anticipate),
        shape: t >= p.keysAt ? ("fist" as const) : ("relax" as const),
        item: t >= p.keysAt ? ("keys" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
    };
  };
  const face = (t: number) => (t < p.look ? 0.1 : -0.25);
  return (
    <Shot f={f} cam={{ x: 520, y: 1060, zoom: 1.25 }} bg={C.studioWall}>
      <StudioBack />
      <Actor uid="s4-mom" look="aizhan" f={f} place={() => MOM} face={face} pose={pose} role="mother" seed={5} layer="body" />
      <StudioDesk />
      {/* собранная папка с образцами и ключи */}
      <div style={box({ left: 150, top: 1240, width: 240, height: 56, backgroundColor: C.navy, borderRadius: 8 })} />
      <div style={box({ left: 170, top: 1226, width: 200, height: 20, backgroundColor: C.bulakA, borderRadius: 4 })} />
      {f < p.keysAt ? <div style={box({ left: 286, top: 1282, width: 34, height: 18, borderRadius: 9, backgroundColor: "#8F96A0" })} /> : null}
      <Actor uid="s4-mom" look="aizhan" f={f} place={() => MOM} face={face} pose={pose} role="mother" seed={5} layer="arms" />
    </Shot>
  );
};

export const DadScene: React.FC = () => {
  const { f } = useScene("dad");
  const p = usePlan(dadPlan);
  return <AbsoluteFill>{f < p.mom ? <Training f={f} /> : <Mom f={f} p={p} />}</AbsoluteFill>;
};

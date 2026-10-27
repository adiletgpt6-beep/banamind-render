// Сцена 10. Идея моста. Папа ладонью придвигает заполненное приглашение к
// сыну и спрашивает (F04) — инициатива возвращается мальчику. Глаза Эмира
// оживляются, он выпрямляется: «Көпүрө!» — над столом на мгновение
// прорисовывается синяя линия будущего пролёта между двумя опорами (ниже
// лиц). Он берёт со стопки чистый лист.
import { clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { box, Svg, Tag, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { IW2_TEXT } from "../script";
import { OnTable } from "../sets/Home";
import { HomeShot, SHEET_AT, SON_AT } from "./HomeShot";
import { DAD_SEATED, dadSeated, SheetOnTable, sonSeated } from "./HomeCast";

export const ideaPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "idea");
  const s03 = T.from("S03");
  return { slide: [8, 30] as const, f04: T.from("F04"), f04End: T.to("F04"), brighten: T.to("F04") + 4, s03, bridge: s03 + 2, take: [T.word("S03", "Кагаздан") - 4, T.word("S03", "Кагаздан") + 14] as const, s03End: T.to("S03"), len: T.len };
};

// Линия пролёта над столом (координаты мира) — из неё рождается мост сцены 11.
export const IDEA_SPAN = { x0: 480, x1: 680, y: 1300 } as const;

const SpanLine: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0) return null;
  const k = easeOut(clamp(t / 14));
  const { x0, x1, y } = IDEA_SPAN;
  return (
    <Svg>
      <rect x={x0 - 34} y={y - 4} width={30} height={34} fill={C.blue} opacity={k} />
      <rect x={x1 + 4} y={y - 4} width={30} height={34} fill={C.blue} opacity={k} />
      <line x1={x0 - 6} y1={y - 6} x2={lerp(x0 - 6, x1 + 6, k)} y2={y - 6} stroke={C.blue} strokeWidth={8} strokeLinecap="round" />
    </Svg>
  );
};

const PaperStack: React.FC<{ taken: boolean }> = ({ taken }) => (
  <OnTable x={330} y={1272} rot={4}>
    {[2, 1, taken ? -1 : 0].filter((k) => k >= 0).map((k) => (
      <rect key={k} x={-80 + k * 4} y={-110 + k * 4} width={160} height={220} fill={k ? "#F4F1EA" : C.sheet} stroke={C.sheetEdge} strokeWidth={3} />
    ))}
  </OnTable>
);

export const IdeaScene: React.FC = () => {
  const { f } = useScene("idea");
  const p = usePlan(ideaPlan);
  const slide = easeInOut(clamp((f - p.slide[0]) / (p.slide[1] - p.slide[0])));
  const sheetX = lerp(SHEET_AT.x, 575, slide);
  const taken = f >= p.take[0] + 8;
  const dadPose = (tt: number) => {
    const sl = easeInOut(clamp((tt - p.slide[0]) / (p.slide[1] - p.slide[0])));
    const on = tt >= p.slide[0] - 6 && tt < p.slide[1] + 6;
    return dadSeated({
      expr: tt < p.f04 ? "softSmile" : "smile",
      lookY: on ? 0.5 : 0.1,
      lookX: -0.3,
      armL: on ? { target: { x: lerp(SHEET_AT.x + 40, 615, sl), y: 1262 }, shape: "open", elbow: "down", behind: false } : { target: { x: 735, y: 1262 }, shape: "relax", elbow: "down", behind: false },
    });
  };
  const sonPose = (tt: number) => {
    const b = clamp((tt - p.brighten) / 10);
    const reach = keysV(tt, [[p.take[0], { x: 440, y: 1266 }], [p.take[0] + 8, { x: 345, y: 1266 }], [p.take[1], { x: 430, y: 1190 }]]);
    return sonSeated({
      expr: b > 0.5 ? { browIn: 4, browOut: 5, lid: 0.02, smile: 0.75 } : { browIn: 5, browOut: 0, lid: 0.16, smile: 0 },
      lookY: tt < p.slide[1] + 4 ? 0.6 : lerp(0.3, -0.05, b),
      lookX: 0.5,
      lean: -4 * b,
      shoulders: 0.3 * (1 - b),
      armL: { target: tt < p.take[0] ? { x: 440, y: 1266 } : reach, shape: taken ? "pinch" : "relax", item: taken ? "paper" : "none", itemTilt: 0, elbow: "down", behind: false },
    });
  };
  const cam = { x: 640, y: 1090, zoom: keys(f, [[0, 2.15], [p.len, 2.05]]) };
  return (
    <HomeShot
      f={f}
      cam={cam}
      chairs={[{ x: SON_AT.x }, { x: DAD_SEATED.x }]}
      actors={[
        { uid: "i10-son", look: "emir", place: () => SON_AT, face: (tt) => (tt < p.brighten ? 0.42 : 0.3), pose: sonPose, role: "son", seed: 4, blinkShift: 37 },
        { uid: "i10-dad", look: "azamat", place: () => DAD_SEATED, face: () => -0.42, pose: dadPose, role: "father", seed: 2 },
      ]}
      onTable={
        <>
          <PaperStack taken={taken} />
          <SheetOnTable named x={sheetX} pencil={false} />
        </>
      }
      over={
        <>
          <SpanLine t={f - p.bridge} />
          {f >= p.bridge ? (
            <div style={box({ left: 0, top: 0 })}>
              <Tag text={IW2_TEXT.bridge} t={f - p.bridge - 6} x={IDEA_SPAN.x0 - 10} y={IDEA_SPAN.y - 150} bg={C.blue} color={C.white} size={44} out={p.s03End - p.bridge + 10} />
            </div>
          ) : null}
        </>
      }
    />
  );
};

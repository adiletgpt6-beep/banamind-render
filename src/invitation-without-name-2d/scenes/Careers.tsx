// Сцена 3. День профессий (неделю назад). Класс: на доске «КЕСИПТЕР КҮНҮ»,
// под надписью мелом по очереди появляются три профессии — силуэт родителя и
// предмет (стетоскоп, гаечный ключ, кисть). Учительница раздаёт приглашения:
// протягивает лист, Эмир берёт его и смотрит на строки. Ретроспектива
// отделена светлой рамкой кадра и чуть более тёплым тоном.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { CLASS, ClassroomBack } from "../sets/School";
import { H } from "./common";

export const careersPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "careers");
  const give = T.word("N02", "Ата-энелер") - 2;
  return { n02: T.from("N02"), icons: [T.from("N02") + 6, T.from("N02") + 20, T.from("N02") + 34] as const, give, take: give + 16, look: give + 30, len: T.len };
};
type P = ReturnType<typeof careersPlan>;

const TEACHER: Place = { x: 420, y: CLASS.floorY, h: H.mom };
const EMIR: Place = { x: 700, y: CLASS.floorY, h: H.boy };
const MEET = { x: 575, y: 1212 };

// Профессия мелом: силуэт (голова и плечи) и предмет рядом.
const Chalk: React.FC<{ x: number; y: number; t: number; kind: 0 | 1 | 2 }> = ({ x, y, t, kind }) => {
  if (t < 0) return null;
  const k = easeOut(clamp(t / 10));
  const st = { stroke: "#F4F1E8", strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 14})`} opacity={k}>
      <circle cx={-26} cy={-34} r={20} {...st} />
      <path d="M -62 30 Q -60 -6 -26 -8 Q 8 -6 10 30" {...st} />
      {kind === 0 ? <path d="M 30 -40 Q 30 0 46 4 Q 62 0 62 -40 M 46 4 L 46 22 Q 46 34 34 32" {...st} /> : null}
      {kind === 1 ? <path d="M 32 26 L 58 -14 M 50 -26 Q 66 -32 68 -14 L 60 -12 L 56 -22" {...st} /> : null}
      {kind === 2 ? <path d="M 32 28 L 60 -20 M 56 -26 Q 70 -36 66 -18 Q 62 -12 56 -14" {...st} /> : null}
    </g>
  );
};

export const CareersScene: React.FC = () => {
  const { f } = useScene("careers");
  const p = usePlan(careersPlan);
  const handed = f >= p.take;
  const teacherPose = (tt: number) => ({
    expr: "softSmile" as const,
    lookX: 0.3,
    lookY: 0.25,
    armR: {
      target: keysV(tt, [[p.give - 14, { x: 470, y: 1180 }], [p.give, MEET], [p.take + 2, MEET], [p.take + 18, { x: 470, y: 1190 }]], anticipate),
      shape: tt < p.take ? ("pinch" as const) : ("relax" as const),
      item: tt < p.take ? ("invitation" as const) : ("none" as const),
      itemTilt: -6,
      elbow: "down" as const,
      behind: false,
    },
    // стопка приглашений в левой руке
    armL: { target: { x: 445, y: 1125 }, shape: "fist" as const, item: "paper" as const, itemTilt: 6, elbow: "down" as const, behind: false },
  });
  const emirPose = (tt: number) => ({
    expr: tt < p.look ? ("calm" as const) : ("softSmile" as const),
    lookX: -0.1,
    lookY: tt < p.give - 10 ? -0.15 : tt < p.look ? 0.15 : 0.55,
    armL: {
      target: keysV(tt, [[p.give - 6, { x: 655, y: 1265 }], [p.take, { x: MEET.x + 18, y: MEET.y + 10 }], [p.look, { x: 650, y: 1215 }]], anticipate),
      shape: tt >= p.take ? ("pinch" as const) : ("relax" as const),
      item: tt >= p.take ? ("invitation" as const) : ("none" as const),
      itemTilt: 4,
      elbow: "down" as const,
      behind: false,
    },
    armR: { target: tt >= p.look ? { x: 690, y: 1225 } : null, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const cam = { x: 560, y: 1110, zoom: keys(f, [[0, 1.42], [p.len, 1.5]]) };
  return (
    <AbsoluteFill>
      <Shot f={f} cam={cam} bg="#EFEDE4">
        <ClassroomBack />
        <Svg>
          <Chalk x={330} y={790} t={f - p.icons[0]} kind={0} />
          <Chalk x={540} y={790} t={f - p.icons[1]} kind={1} />
          <Chalk x={750} y={790} t={f - p.icons[2]} kind={2} />
        </Svg>
        <Actor uid="c3-teacher" look="mugalim" f={f} place={() => TEACHER} face={() => 0.6} pose={teacherPose} seed={8} />
        <Actor uid="c3-emir" look="emir" f={f} place={() => EMIR} face={() => (handed ? -0.35 : -0.6)} pose={emirPose} seed={4} blinkShift={37} />
      </Shot>
      {/* ретроспектива: тёплый тон и светлая рамка */}
      <div style={box({ inset: 0, backgroundColor: "#F2D9A8", mixBlendMode: "multiply", opacity: 0.28 })} />
      <div style={box({ inset: 24, border: `14px solid ${C.paper}` })} />
    </AbsoluteFill>
  );
};
export type CareersPlan = P;

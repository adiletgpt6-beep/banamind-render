// Сцена 10. Вопрос сына (VO22 сын, VO23 папа) — главный поворот.
// Средний план сына: он смотрит в экран, затем на папу и серьёзно, просто
// спрашивает: «Ата, бул колдонмо өзү барып, мени алып келе алабы?»
// Пауза ≈ 1,3 с: крупно папа — перестаёт смотреть в экран, поднимает глаза,
// понимает мысль, улыбается и мягко смеётся (плечи), камера чуть ближе.
// Ответ «Азырынча... муну кыла албайт.» — тепло, с улыбкой, глядя на сына.
// В конце общий план: оба улыбаются, слева подходит мама.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { onTable, placeAt, seatOf } from "./common";
import { dadSeat, EVE, EveningRoom, sonStand } from "./evening";

// Мама подходит слева к своему стулу (продолжается в сцене 11).
export const MOM_WALK = { from: 560, to: EVE.mom - 4, frames: 64 };
export const momApproach = (t: number, start: number) => {
  const u = cruise((t - start) / MOM_WALK.frames, 0.3);
  return placeAt(lerp(MOM_WALK.from, MOM_WALK.to, u), 1540, 760);
};

export const questionBeats = (vo22: { from: number; to: number }, vo23: { from: number; to: number }) => ({
  toDad: Math.max(0, vo22.from - 4), // сын переводит взгляд на папу
  react: vo22.to + 2, // крупно папа
  lookUp: vo22.to + 6, // поднимает глаза
  smile: vo22.to + 12,
  laugh: [vo22.to + 14, Math.max(vo22.to + 24, vo23.from - 1)] as const, // мягкий смех плечами
  wide: vo23.to + 4, // общий план
  momIn: vo23.to - 34, // мама начинает подходить
});

export const QuestionScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo22 = useLine("vo22");
  const vo23 = useLine("vo23");
  const B = questionBeats(vo22, vo23);
  const dad = dadSeat();
  const son = sonStand();

  const laughK = (t: number) => (t < B.laugh[0] || t > B.laugh[1] ? 0 : Math.sin((Math.PI * (t - B.laugh[0])) / (B.laugh[1] - B.laugh[0])));
  const dadPose = (t: number) => ({
    expr: t < B.lookUp + 4 ? ("thinking" as const) : t < B.smile ? ("surprised" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(dad),
    lean: keys(t, [[0, 12], [B.lookUp, 12], [B.lookUp + 14, 4]]),
    // смех: плечи мягко поднимаются 3 раза
    shoulders: laughK(t) * (0.35 + 0.25 * Math.sin((t - B.laugh[0]) / 2.2)),
    nod: keys(t, [[B.laugh[0], 0], [B.laugh[0] + 8, 4], [B.laugh[1], 2], [vo23.from + 6, 0], [vo23.to - 10, 0], [vo23.to - 2, 3], [vo23.to + 10, 0]]),
    headTilt: keys(t, [[0, -5], [B.lookUp, -5], [B.lookUp + 16, 3], [vo23.to, 4]]),
    armL: { target: onTable(EVE.laptop.x - 42, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: {
      target: keysV(t, [[B.lookUp, { x: dad.x + 16, y: 1094 }], [B.lookUp + 18, onTable(EVE.laptop.x + 50, -12)]], anticipate),
      shape: t < B.lookUp + 6 ? ("fist" as const) : ("relax" as const),
      elbow: t < B.lookUp + 10 ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    lookY: keys(t, [[0, 0.3], [B.lookUp, 0.3], [B.lookUp + 8, -0.05]]),
  });
  // папа: в экран → на сына (слева)
  const dadFace = (t: number) => keys(t, [[0, 0], [vo22.from + 30, 0], [vo22.from + 40, -0.25], [B.lookUp, -0.25], [B.lookUp + 10, -0.6]]);

  const sonPose = (t: number) => ({
    expr: t < vo22.from ? ("calm" as const) : t < vo23.from + 10 ? ("neutral" as const) : ("smile" as const),
    lean: keys(t, [[0, 12], [B.toDad, 12], [B.toDad + 12, 3]]),
    lookY: keys(t, [[0, 0.55], [B.toDad, 0.55], [B.toDad + 10, -0.15]]),
    headTilt: keys(t, [[vo22.from + 40, 0], [vo22.from + 60, 6], [vo22.to + 20, 6], [vo23.to, 2]]),
    armL: { target: null, shape: "relax" as const },
    armR: { target: onTable(EVE.son + 34, 8), shape: "relax" as const, elbow: "hang" as const, behind: false },
  });
  const sonFace = (t: number) => keys(t, [[0, 0.75], [B.toDad, 0.75], [B.toDad + 8, 0.6], [vo22.from + 20, 0.62]]);

  const momPose = () => ({ expr: "softSmile" as const, lookY: 0.1, armL: { target: null, shape: "relax" as const }, armR: { target: null, shape: "relax" as const } });

  const room = (
    <EveningRoom
      state={{ f }}
      actors={[
        ...(f >= B.momIn ? [{ uid: "q10-mom", look: "mom" as const, place: (t: number) => momApproach(t, B.momIn), face: () => 0.6, pose: momPose, seed: 1, walkFrom: B.momIn }] : []),
        { uid: "q10-son", look: "son", place: () => son, face: sonFace, pose: sonPose, role: "son", seed: 4 },
        { uid: "q10-dad", look: "dad", place: () => dad, face: dadFace, pose: dadPose, role: "father", chair: EVE.dad, seed: 2, under: () => true },
      ]}
    />
  );

  // планы: сын (средний), папа (крупно, медленно ближе), общий
  const sonCam = camMove(f, 0, B.react, { x: 905, y: 1168, zoom: 2.55 }, { x: 902, y: 1166, zoom: 2.64 });
  const dadCam = camMove(f, B.react, B.wide, { x: 1060, y: 1105, zoom: 2.3 }, { x: 1062, y: 1100, zoom: 2.5 }, easeInOut);
  const wideCam = camMove(f, B.wide, B.wide + 40, { x: 940, y: 1110, zoom: 1.45 }, { x: 930, y: 1110, zoom: 1.42 }, easeOut);
  return (
    <>
      <Shot f={f} from={0} to={B.react} cam={sonCam} bg="#2A2E44">
        {room}
      </Shot>
      <Shot f={f} from={B.react} to={B.wide} cam={dadCam} bg="#2A2E44">
        {room}
      </Shot>
      <Shot f={f} from={B.wide} to={9999} cam={wideCam} bg="#2A2E44">
        {room}
      </Shot>
      {/* лёгкое затемнение краёв на вопросе — внимание к лицу */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 42%, transparent 46%, rgba(10,12,30,${0.22 * clamp((f - 4) / 20) * (1 - clamp((f - B.wide) / 10))}) 100%)` }} />
    </>
  );
};

export const sound: SceneSound = () => [];

// Сцена 12. Знакомство с BalaGo (VO25, диктор).
// Родители вместе смотрят варианты в ноутбуке (папа листает, мама
// показывает), сын тем временем убегает к себе — вернётся с рисунком в
// сцене 15. Затем крупно экран: окно браузера со страницей BalaGo — первой
// читается BalaGo, «Балдар үчүн такси», «Бишкек», «ҮЙ → МЕКТЕП → ҮЙ».
// Фирменный стиль страницы отличается от семейного приложения; адрес сайта
// не показывается.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { anticipate, cruise, keys, keysV, lerp } from "../rig/motion";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN } from "../sound";
import { abs, appear, Card, Cursor, Paper } from "../ui/kit";
import { BalaGoPage, Window } from "../ui/screens";
import { onTable, placeAt, seatOf } from "./common";
import { dadSeat, EVE, EveningRoom, momSeat } from "./evening";

export const balagoBeats = (vo25: { from: number; to: number; word: (i: number) => number }) => ({
  sonGo: 6, // сын отходит назад и убегает влево (за спиной мамы)
  page: vo25.word(4) - 8, // «BalaGo …» — крупно страница
});

// Сын: шаг назад от стола, затем влево за спиной мамы.
export const sonLeave = (t: number, from: number) => {
  const back = cruise((t - from) / 16, 0.4);
  const run = cruise((t - from - 14) / 40, 0.3);
  return placeAt(lerp(EVE.son, 330, run), lerp(1556, 1500, back), 540);
};

export const BalaGoPageScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo25 = useLine("vo25");
  const B = balagoBeats(vo25);
  const dad = dadSeat();
  const mom = momSeat();
  const momPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(mom),
    lean: keys(t, [[0, 6], [20, 12]]),
    armL: { target: onTable(mom.x - 0.1 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    // показывает в экран
    armR: { target: keysV(t, [[8, onTable(mom.x + 0.12 * mom.h, -4)], [26, { x: EVE.laptop.x - 62, y: 1138 }]], anticipate), shape: "point" as const, elbow: "down" as const, behind: false },
    lookY: 0.4,
  });
  const dadPose = (t: number) => ({
    expr: "calm" as const,
    sit: 1,
    seat: seatOf(dad),
    lean: 8,
    armL: { target: onTable(EVE.laptop.x - 42, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(EVE.laptop.x + 18 + Math.sin(t / 5) * 6, -14), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: 0.42,
    nod: keys(t, [[30, 0], [38, 3], [48, 0]]),
  });
  const room = (
    <EveningRoom
      state={{ f }}
      actors={[
        { uid: "b12-son", look: "son", place: (t) => sonLeave(t, B.sonGo), face: (t) => (t < B.sonGo + 12 ? 0.3 : -0.7), pose: () => ({ expr: "smile", armL: { target: null, shape: "relax" }, armR: { target: null, shape: "relax" } }), seed: 4, walkFrom: B.sonGo },
        { uid: "b12-mom", look: "mom", place: () => mom, face: () => 0.55, pose: momPose, chair: EVE.mom, seed: 1 },
        { uid: "b12-dad", look: "dad", place: () => dad, face: () => -0.1, pose: dadPose, chair: EVE.dad, seed: 2, under: () => true },
      ]}
    />
  );
  // экран: окно браузера с заголовком вкладки «BalaGo» (без адреса)
  const cx = keys(f, [[B.page, 820], [B.page + 30, 660]], anticipate);
  const cy = keys(f, [[B.page, 1500], [B.page + 30, 1230]], anticipate);
  const page = (
    <Paper tone="#E9E6F0">
      <Card style={abs({ left: 60, top: 210, width: 960, height: 1150, overflow: "hidden", padding: 0 })}>
        <Window w={960} h={1150} title="BalaGo" bar="#DCE0E8">
          <BalaGoPage w={960} f={f} from={B.page + 2} />
        </Window>
      </Card>
      <Cursor x={cx} y={cy} size={54} />
    </Paper>
  );
  return (
    <>
      <Shot f={f} from={0} to={B.page} cam={camMove(f, 0, B.page, { x: 900, y: 1100, zoom: 1.55 }, { x: 910, y: 1098, zoom: 1.62 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.page ? <div style={abs({ inset: 0, opacity: appear(f, B.page, 6) })}>{page}</div> : null}
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = balagoBeats(ctx.line("vo25"));
  const page = B.page;
  return [
    { at: 14, src: OWN("key"), volume: 0.1 },
    { at: page + 4, src: COMMON("tap"), volume: 0.14 },
  ];
};

// Сцена 1 (хук). Вечер, Бишкек. Камера плавно опускается от светящегося
// окна квартиры (там мальчик с воздушным змеем) к пустой скамейке в
// сквере; зажигается фонарь. Затем — в комнате: сын у окна со змеем
// спрашивает: «Ата, бүгүн сейилдөөгө чыгабызбы?»; папа за ноутбуком:
// «Көрөлү, балам, жумушумду бүтүрүп алайын.» Сын тихо опускает змея.
// Тот же проезд камеры повторится в сцене 5 как «возможное после».
import { Actor, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront, WarmLamp } from "../../../two-schedules-2d/sets/Home";
import { camMove, Shot } from "../../../two-schedules-2d/shots";
import { H, onTable, placeAt, seated, seatOf } from "../../../two-schedules-2d/scenes/common";
import { useSceneInfo } from "../context";
import { BG15_TEXT } from "../script";
import { BenchFront, FamilyWindow, Kite, PARK_CAM_A, PARK_CAM_B, ParkBack, ParkTint } from "../sets/Park";
import { Chip, Dot } from "../ui";

export const HOOK_GLIDE = 92; // кадры проезда окно → скамейка

// Маленькие фигуры в окне (вид с улицы): сын со змеем, папа за ноутбуком.
export const WindowFamily: React.FC<{ f: number }> = ({ f }) => {
  const son = { x: 120, y: 360, h: 250 };
  const dad = { x: 270, y: 330, h: 200 };
  return (
    <>
      <div style={{ position: "absolute", left: 225, top: 236, width: 120, height: 12, backgroundColor: "#8A6648" }} />
      <div style={{ position: "absolute", left: 280, top: 206, width: 44, height: 30, borderRadius: 4, backgroundColor: "#DDEBFA", boxShadow: "0 0 30px 10px rgba(200,225,255,0.6)" }} />
      <Actor uid="h-win-dad" look="dad" f={f} place={() => dad} face={() => 0.5} pose={() => ({ sit: 1, seat: 60, expr: "tired", lookY: 0.3 })} seed={2} />
      <Actor
        uid="h-win-son"
        look="son"
        f={f}
        place={() => son}
        face={() => 0.15}
        pose={() => ({ expr: "calm", packOff: true, armR: { target: { x: son.x + 40, y: son.y - 150 }, shape: "fist", elbow: "down", behind: false } })}
        seed={4}
      />
      <Kite x={son.x + 46} y={son.y - 186} s={0.32} rot={-8} />
    </>
  );
};

export const HookScene: React.FC = () => {
  const { f, dur, line } = useSceneInfo("hook");
  const s01 = line("s01");
  const f01 = line("f01");
  const glide = HOOK_GLIDE;
  const lampOn = keys(f, [[glide - 36, 0], [glide - 20, 1]]);

  // ---------- комната ----------
  const dadP = seated("dad", HOME.seat.mom);
  const sonP = placeAt(600, 1680, H.son);
  const turnToDad = s01.from - 10;
  const lower = f01.to - 4;
  const sonFace = (t: number) => keys(t, [[0, -0.45], [turnToDad, -0.45], [turnToDad + 12, 0.6], [lower + 6, 0.6], [lower + 26, -0.35]]);
  const sonPose = (t: number): PoseIn => {
    const grip = keysV(
      t,
      [
        [0, { x: sonP.x - 40, y: sonP.y - 0.5 * sonP.h }],
        [turnToDad, { x: sonP.x - 40, y: sonP.y - 0.5 * sonP.h }],
        [s01.from + 6, { x: sonP.x + 40, y: sonP.y - 0.64 * sonP.h }],
        [lower, { x: sonP.x + 40, y: sonP.y - 0.62 * sonP.h }],
        [lower + 24, { x: sonP.x + 6, y: sonP.y - 0.46 * sonP.h }],
      ],
      anticipate,
    );
    return {
      expr: t < f01.from + 10 ? "smile" : t < lower ? "worried" : "calm",
      packOff: true,
      headTilt: keys(t, [[s01.from, 0], [s01.from + 12, -5], [f01.from, -5], [f01.to, 3]]),
      lookY: keys(t, [[lower, 0], [lower + 20, 0.25]]),
      armR: { target: grip, shape: "fist", elbow: "down", behind: false },
      armL: { target: { x: sonP.x - 0.14 * sonP.h, y: sonP.y - 0.4 * sonP.h }, shape: "relax", elbow: "down" },
    };
  };
  const kiteAt = (t: number) => {
    const p = sonPose(t).armR!.target!;
    return { x: p.x - 90, y: p.y + 10 };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.4], [s01.to - 6, 0.4], [s01.to + 8, -0.55], [f01.to - 10, -0.55], [f01.to + 10, 0.4]]);
  const dadPose = (t: number): PoseIn => ({
    expr: t < s01.to ? "thinking" : t < f01.to + 10 ? "apologetic" : "tired",
    sit: 1,
    seat: seatOf(dadP),
    lookY: keys(t, [[0, 0.35], [s01.to, 0.35], [s01.to + 10, 0], [f01.to, 0], [f01.to + 12, 0.35]]),
    armR: { target: keysV(t, [[0, onTable(HOME.laptop.x - 30, -4)], [s01.to, onTable(HOME.laptop.x - 30, -4)], [s01.to + 10, onTable(dadP.x + 0.1 * dadP.h, -4)], [f01.to, onTable(dadP.x + 0.1 * dadP.h, -4)], [f01.to + 14, onTable(HOME.laptop.x - 30, -4)]]), shape: "relax", elbow: "down", behind: false },
    armL: { target: onTable(dadP.x - 0.12 * dadP.h, -4), shape: "relax", elbow: "down" },
    nod: keys(t, [[f01.from + 4, 0], [f01.from + 12, 4], [f01.from + 22, 0]]),
  });
  const kite = kiteAt(f);
  const room = (
    <>
      <HomeBack minutes={20 * 60 + 40 + f / 300} evening={1} f={f} />
      <WarmLamp />
      <ChairBack x={dadP.x} evening={1} />
      <Actor uid="h-dad" look="dad" f={f} place={() => dadP} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      <Actor uid="h-son" look="son" f={f} place={() => sonP} face={sonFace} pose={sonPose} role="son" seed={4} layer="body" />
      <Kite x={kite.x} y={kite.y} s={0.62} rot={keys(f, [[lower, -6], [lower + 24, 18]])} sway={Math.sin(f / 9)} />
      <Actor uid="h-son" look="son" f={f} place={() => sonP} face={sonFace} pose={sonPose} role="son" seed={4} layer="arms" />
      <Actor uid="h-dad" look="dad" f={f} place={() => dadP} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );
  const cut2 = f01.from - 6;
  const cut3 = lower + 2;
  return (
    <>
      <Shot f={f} from={0} to={glide} cam={camMove(f, 0, glide, PARK_CAM_A, PARK_CAM_B)} bg="#34406E" overlay={
        <Chip f={f} at={8}>
          <Dot /> {BG15_TEXT.city} • {BG15_TEXT.hookTime}
        </Chip>
      }>
        <ParkBack mode="evening" lamp={lampOn} />
        <FamilyWindow mode="evening" inside={<WindowFamily f={f} />} />
        <ParkTint mode="evening" />
        <BenchFront />
      </Shot>
      <Shot f={f} from={glide} to={cut2} cam={camMove(f, glide, cut2, { x: 840, y: 1230, zoom: 1.2 }, { x: 850, y: 1230, zoom: 1.28 })} bg="#3B3149">
        {room}
      </Shot>
      <Shot f={f} from={cut2} to={cut3} cam={camMove(f, cut2, cut3, { x: 1000, y: 1060, zoom: 1.75 }, { x: 990, y: 1060, zoom: 1.82 })}>
        {room}
      </Shot>
      <Shot f={f} from={cut3} to={dur} cam={camMove(f, cut3, dur, { x: 700, y: 1220, zoom: 1.5 }, { x: 690, y: 1210, zoom: 1.58 })}>
        {room}
      </Shot>
    </>
  );
};

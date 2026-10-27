// Сцена 09. Жума (VO21, диктор). Вечер, дома тихо. Папа один за столом
// смотрит в календарь: курсор задерживается возле записи о поездке. Папа
// слегка наклоняется, думает, перестаёт печатать (подпирает подбородок).
// В хвосте сцены слева входит сын, подходит и заглядывает в экран — сначала
// его взгляд, реплика начнётся в следующей сцене.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { PHT_TEXT, PHT_TIME } from "../script";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { OWN } from "../sound";
import { abs, appear, Card, Cursor, DayLabel, Paper } from "../ui/kit";
import { ScheduleApp, Window } from "../ui/screens";
import { onTable, placeAt, seatOf } from "./common";
import { dadSeat, EVE, EveningRoom } from "./evening";

const T = PHT_TEXT;

// Моменты сцены (кадры сцены) от реплики диктора.
export const fridayBeats = (vo21: { from: number; to: number; word: (i: number) => number }) => ({
  screen: vo21.word(3) + 6, // «календарды» → вставка экрана
  hover: vo21.word(4) + 8, // курсор останавливается у поездки
  back: vo21.word(7) - 4, // «жакшыртсам» → снова папа
  stop: vo21.word(8), // «деп ойлонду» — перестаёт печатать
  sonIn: vo21.to - 26, // сын входит слева
});

// Сын: от левого края к столу (x 900), шаги по пройденному пути.
export const sonEnter = (t: number, from: number) => {
  const u = cruise((t - from) / 46, 0.3);
  return placeAt(lerp(560, EVE.son, u), 1556, 540);
};

export const FridayScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo21 = useLine("vo21");
  const B = fridayBeats(vo21);
  const dad = dadSeat();
  const typing = (t: number) => t < B.stop - 6;
  const dadPose = (t: number) => {
    const tap = Math.sin(t / 2.3) * 4 * (typing(t) ? 1 : 0);
    return {
      expr: t < B.stop ? ("calm" as const) : ("thinking" as const),
      sit: 1,
      seat: seatOf(dad),
      lean: keys(t, [[0, 4], [B.stop - 10, 6], [B.stop + 14, 12]]),
      // руки на клавиатуре за крышкой; на «ойлонду» правая рука уходит к подбородку
      armL: { target: onTable(EVE.laptop.x - 42 + tap, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
      armR: {
        target: keysV(t, [[B.stop - 6, onTable(EVE.laptop.x + 44 - tap, -12)], [B.stop + 16, { x: dad.x + 16, y: 1094 }]], anticipate),
        shape: t > B.stop + 4 ? ("fist" as const) : ("relax" as const),
        elbow: t < B.stop - 2 ? ("hang" as const) : ("down" as const),
        behind: false,
      },
      lookY: keys(t, [[0, 0.45], [B.stop, 0.45], [B.stop + 16, 0.3]]),
      headTilt: keys(t, [[B.stop, 0], [B.stop + 18, -5]]),
      // сын подходит — папа замечает его краем глаза
      lookX: keys(t, [[B.sonIn + 30, 0], [B.sonIn + 44, -0.5]]),
    };
  };
  const sonPose = (t: number) => ({
    expr: "calm" as const,
    lean: keys(t, [[B.sonIn + 40, 0], [B.sonIn + 54, 12]]),
    lookY: keys(t, [[B.sonIn + 36, 0], [B.sonIn + 50, 0.55]]),
    armL: { target: null, shape: "relax" as const },
    // пока идёт — рука свободно опущена; у стола кладёт ладонь на край
    armR: t < B.sonIn + 44 ? { target: null, shape: "relax" as const } : { target: keysV(t, [[B.sonIn + 44, { x: EVE.son + 20, y: 1330 }], [B.sonIn + 58, onTable(EVE.son + 34, 8)]], anticipate), shape: "relax" as const, elbow: "hang" as const, behind: false },
  });
  const sonFace = (t: number) => keys(t, [[B.sonIn, 0.6], [B.sonIn + 40, 0.6], [B.sonIn + 52, 0.75]]);

  const room = (
    <EveningRoom
      state={{ f }}
      actors={[
        ...(f >= B.sonIn ? [{ uid: "f9-son", look: "son" as const, place: (t: number) => sonEnter(t, B.sonIn), face: sonFace, pose: sonPose, seed: 4, walkFrom: B.sonIn }] : []),
        { uid: "f9-dad", look: "dad", place: () => dad, face: () => 0, pose: dadPose, chair: EVE.dad, seed: 2, under: (t: number) => t < B.stop + 2 },
      ]}
    />
  );

  // экран: семейный календарь, курсор у записи о поездке
  const hoverK = clamp((f - B.hover) / 8);
  const cx = keys(f, [[B.screen, 860], [B.hover, 640]], easeInOut);
  const cy = keys(f, [[B.screen, 330], [B.hover, 646]], easeInOut);
  const screen = (
    <Paper tone="#E9E6F0">
      <Card style={abs({ left: 60, top: 230, width: 960, height: 760, overflow: "hidden", padding: 0 })}>
        <Window w={960} h={760} title={T.app.title} bar="#DCE0E8">
          <ScheduleApp
            w={960}
            day={4}
            header={false}
            rows={[
              { time: PHT_TIME.morning, title: T.app.toSchool, who: T.app.dad },
              { time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.mom, hi: hoverK },
            ]}
          />
        </Window>
      </Card>
      <Cursor x={cx} y={cy} size={58} />
    </Paper>
  );

  const wide = { x: 1050, y: 1110, zoom: 1.3 };
  return (
    <>
      <Shot f={f} from={0} to={B.screen} cam={camMove(f, 0, B.screen, wide, { x: 1070, y: 1100, zoom: 1.42 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.screen && f < B.back ? <div style={abs({ inset: 0, opacity: appear(f, B.screen, 6) })}>{screen}</div> : null}
      <Shot f={f} from={B.back} to={9999} cam={camMove(f, B.back, B.back + 60, { x: 1020, y: 1090, zoom: 1.75 }, { x: 1000, y: 1095, zoom: 1.66 })} bg="#2A2E44">
        {room}
      </Shot>
      <DayLabel text="ЖУМА" f={f} from={2} hold={B.screen - 12} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = fridayBeats(ctx.line("vo21"));
  return [
    { at: 4, src: OWN("keyboard"), volume: 0.1 },
    { at: 46, src: OWN("keyboard"), volume: 0.08 },
    { at: B.hover - 2, src: OWN("key"), volume: 0.1 },
  ];
};

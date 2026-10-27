// Сцена 13. Предварительная заявка (VO26, диктор).
// Крупно форма BalaGo в окне браузера: поля выделяются по словам —
// «Мектепти» → Мектеп, «даректи» → Дарек, «убакытты» → Убакыт (условные
// данные, без реальных адресов). Посередине — родители вдвоём заполняют
// (мама показывает, папа печатает и кивает). На «алдын ала өтүнмө» —
// нажатие кнопки «Алдын ала өтүнмө», затем «Өтүнмө жөнөтүлдү» и
// «Каттамды талкуулайбыз». Ни водителя, ни цены, ни «согласовано».
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { anticipate, keys, keysV } from "../rig/motion";
import { camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN } from "../sound";
import { abs, appear, Card, Cursor, Paper } from "../ui/kit";
import { RequestForm, Window } from "../ui/screens";
import { onTable, seatOf } from "./common";
import { dadSeat, EVE, EveningRoom, momSeat } from "./evening";

export const requestBeats = (vo26: { from: number; to: number; word: (i: number) => number }) => {
  const fills = [vo26.word(0) + 4, vo26.word(1) + 4, vo26.word(3) + 4] as const;
  return {
    fills,
    people: fills[2] + 30, // средний план: заполняют вдвоём
    form2: vo26.word(9) - 10, // «… алдын ала» — снова форма
    tap: vo26.word(10) + 2, // «ала өтүнмө» — нажатие
    sent: vo26.word(12) - 2, // «калтырышты» — отправлено
  };
};

// Центры полей и кнопки в кадре (окно формы 960 px, s = 9.6 px).
const FIELD_Y = [612, 830, 1048];
const BUTTON_Y = 1288;

export const RequestScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo26 = useLine("vo26");
  const B = requestBeats(vo26);
  const dad = dadSeat();
  const mom = momSeat();
  const form = (
    <Paper tone="#E9E6F0">
      <Card style={abs({ left: 60, top: 170, width: 960, height: 1230, overflow: "hidden", padding: 0 })}>
        <Window w={960} h={1230} title="BalaGo" bar="#DCE0E8">
          <RequestForm w={960} f={f} fills={B.fills} tapAt={B.tap} sentAt={B.sent} />
        </Window>
      </Card>
    </Paper>
  );
  // курсор: поле за полем, затем кнопка
  const cur = (t: number) =>
    keysV(
      t,
      [
        [0, { x: 760, y: FIELD_Y[0] + 30 }],
        [B.fills[0] - 2, { x: 700, y: FIELD_Y[0] + 10 }],
        [B.fills[1] - 6, { x: 700, y: FIELD_Y[0] + 10 }],
        [B.fills[1] - 2, { x: 700, y: FIELD_Y[1] + 10 }],
        [B.fills[2] - 6, { x: 700, y: FIELD_Y[1] + 10 }],
        [B.fills[2] - 2, { x: 700, y: FIELD_Y[2] + 10 }],
        [B.form2, { x: 760, y: FIELD_Y[2] + 60 }],
        [B.tap - 2, { x: 560, y: BUTTON_Y }],
        [B.sent + 10, { x: 600, y: BUTTON_Y + 40 }],
      ],
      anticipate,
    );
  const c = cur(f);
  const momPose = (t: number) => ({
    expr: "softSmile" as const,
    sit: 1,
    seat: seatOf(mom),
    lean: 10,
    armL: { target: onTable(mom.x - 0.1 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: keysV(t, [[B.people, { x: EVE.laptop.x - 80, y: 1176 }], [B.people + 20, { x: EVE.laptop.x - 58, y: 1140 }]], anticipate), shape: "point" as const, elbow: "down" as const, behind: false },
    lookY: 0.4,
    nod: keys(t, [[B.people + 26, 0], [B.people + 34, 3], [B.people + 44, 0]]),
  });
  const momFace = (t: number) => keys(t, [[B.people, 0.55], [B.people + 30, 0.55], [B.people + 38, 0.75], [B.form2 - 4, 0.75]]);
  const dadPose = (t: number) => ({
    expr: t > B.people + 30 ? ("softSmile" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(dad),
    lean: 8,
    armL: { target: onTable(EVE.laptop.x - 42 + Math.sin(t / 2.4) * 4, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(EVE.laptop.x + 44 - Math.sin(t / 2.1) * 4, -12), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: keys(t, [[B.people, 0.42], [B.people + 30, 0.42], [B.people + 38, 0.1]]),
    nod: keys(t, [[B.people + 40, 0], [B.people + 48, 4], [B.people + 58, 0]]),
  });
  const dadFace = (t: number) => keys(t, [[B.people, -0.05], [B.people + 32, -0.05], [B.people + 40, -0.45]]);
  const room = (
    <EveningRoom
      state={{ f }}
      actors={[
        { uid: "r13-mom", look: "mom", place: () => mom, face: momFace, pose: momPose, chair: EVE.mom, seed: 1 },
        { uid: "r13-dad", look: "dad", place: () => dad, face: dadFace, pose: dadPose, chair: EVE.dad, seed: 2, under: () => true },
      ]}
    />
  );
  return (
    <>
      {f < B.people ? form : null}
      {f < B.people ? <Cursor x={c.x} y={c.y} size={56} /> : null}
      <Shot f={f} from={B.people} to={B.form2} cam={camMove(f, B.people, B.form2, { x: 910, y: 1090, zoom: 1.8 }, { x: 915, y: 1088, zoom: 1.88 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.form2 ? (
        <div style={abs({ inset: 0, opacity: appear(f, B.form2, 5) })}>
          {form}
          {f < B.sent + 30 ? <Cursor x={c.x} y={c.y} size={56} /> : null}
        </div>
      ) : null}
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = requestBeats(ctx.line("vo26"));
  return [
    ...B.fills.map((at) => ({ at, src: OWN("keyboard"), volume: 0.08, dur: 0.6, fade: 0.08 })),
    { at: B.tap, src: COMMON("tap"), volume: 0.22 },
    { at: B.sent, src: COMMON("chime"), volume: 0.16 },
  ];
};

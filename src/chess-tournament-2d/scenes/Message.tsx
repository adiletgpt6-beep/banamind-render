// Сцена 6. Через несколько дней — сообщение тренера (N05).
// A. «Бир нече күндөн кийин». Телефон мамы в руке: в переписке
//    «Машыктыруучу» появляется короткое сообщение. Без сирены, без писка
//    уведомления, без красного креста.
// B. Кухня: мама за столом читает, затем спокойно переводит взгляд на
//    дочку, которая в другом конце стола делает уроки. Спокойное
//    удивление, не гнев.
import { clamp, keys } from "../rig/motion";
import { CH2_TEXT } from "../script";
import { TimeCaption, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { ChatScreen, PhoneClose } from "../props/Phone";
import { SKIN } from "../props/CloseHand";
import { NotebookFlat } from "../sets/Home";
import { K_SEAT_H, K_TABLE_Y, KitchenShot, seatPlace } from "./kitchen";
import type { ActorSpec } from "./shots";
import { H } from "./common";

export const messagePlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "message");
  const arrive = 18;
  const room = Math.max(arrive + 60, T.word("N05", "кызы") - 6);
  return { arrive, room, look: room + 26, len: T.len };
};
type P = ReturnType<typeof messagePlan>;

const MOM = seatPlace(780, H.mom);
const GIRL = seatPlace(320, H.girl);

const Room: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const mom: ActorSpec = {
    uid: "m-mom",
    look: "momHome",
    place: () => MOM,
    face: (t) => keys(t, [[p.look - 6, 0.05], [p.look + 10, -0.55]]),
    pose: (t) => ({
      sit: 1,
      seat: K_SEAT_H.adult,
      expr: t < p.look ? ("calm" as const) : ({ browIn: 6, browOut: 4, lid: 0.06, smile: 0.02 } as const),
      lookY: t < p.look ? 0.55 : 0.1,
      lookX: t < p.look ? 0 : -0.5,
      armR: { target: { x: 770, y: 1150 }, shape: "phone", item: "phone", itemColor: "#C9786A", glow: 1, elbow: "hang", behind: false },
      armL: { target: { x: 730, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
    }),
    role: "mother",
    seed: 5,
    blinkShift: 19,
  };
  const girl: ActorSpec = {
    uid: "m-girl",
    look: "girlHome",
    place: () => GIRL,
    face: () => 0.15,
    pose: () => ({
      sit: 1,
      seat: K_SEAT_H.girl,
      expr: { browIn: 1, browOut: 1, lid: 0.32, smile: 0 },
      lookY: 0.9,
      nod: 10,
      armL: { target: { x: 290, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
      armR: { target: { x: 352, y: K_TABLE_Y - 4 }, shape: "pinch", item: "pencil", elbow: "hang", behind: false },
    }),
    role: "daughter",
    seed: 4,
    blinkShift: 37,
  };
  return (
    <KitchenShot
      f={f}
      cam={{ x: 560, y: 1080, zoom: 1.7 + 0.04 * clamp((f - p.room) / 90) }}
      seated={[mom, girl]}
      chairs={[MOM.x, GIRL.x]}
      onTable={<NotebookFlat x={GIRL.x + 10} y={K_TABLE_Y - 8} />}
    />
  );
};

export const MessageScene: React.FC = () => {
  const { f } = useScene("message");
  const p = usePlan(messagePlan);
  if (f >= p.room) return <Room f={f} p={p} />;
  return (
    <>
      <PhoneClose f={f} taps={[]} skin={SKIN.mom} caseColor="#C9786A">
        <ChatScreen incoming={f >= p.arrive ? CH2_TEXT.coachMsg : undefined} pulse={f > p.arrive && f < p.arrive + 30} />
      </PhoneClose>
      <TimeCaption text={CH2_TEXT.after} t={f} dur={Math.min(p.room, 84)} top={1240} />
    </>
  );
};

// Сцена 12 «trial» (N08): «Бала багуучу менен эртеси сыноо күнүн өткөрүүгө
// макулдашышты.» Мама за столом с телефоном: короткое сообщение, улыбка.
// Затем над столом — карточка календаря «Эртең», на слове «сыноо» в неё
// садится событие «сыноо күнү». Спокойно, без уведомлений и звонков.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, keys } from "../rig/motion";
import { camMove, Shot, useScene } from "../kit";
import { CalendarCard } from "../ui/CalendarCard";
import { LIVING } from "../sets/Living";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { AdDesk, CAM_DESK, CARD, MOM_DESK } from "./AdDesk";
import { H } from "./common";
import { Room } from "./Room";
import { LaptopSiteSent } from "./Balago";

const L = LIVING;

export const trialPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "trial");
  const tap0 = 8;
  const tap1 = T.word("N08", "менен") + 2;
  const card = T.word("N08", "эртеси") - 6; // карточка календаря
  const add0 = T.word("N08", "сыноо");
  const add1 = add0 + 22;
  return { tap0, tap1, card, add0, add1, len: T.len };
};

// Телефон в руке мамы у стола (мир): перед грудью, лицо открыто.
const PHONE = { x: MOM_DESK.x - 74, y: MOM_DESK.y - 0.55 * H.mom } as const;
// План с карточкой: камера ниже обычной — мама с телефоном выше субтитров.
const CAM_TRIAL = { ...CAM_DESK, y: 870 } as const;

export const TrialScene: React.FC = () => {
  const { f, tl } = useScene("trial");
  const P = trialPlan(tl);
  const tap = (t: number) => (t > P.tap0 && t < P.tap1 ? Math.max(0, Math.sin((t - P.tap0) / 2.4)) : 0);
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.momSeat.seat,
    expr: t < P.tap1 - 6 ? "calm" : "smile",
    lookY: keys(t, [[0, 0.36], [P.add1, 0.36], [P.add1 + 10, 0.28]]),
    nod: keys(t, [[P.add0, 0], [P.add0 + 8, 3], [P.add0 + 18, 0]]),
    // телефон — в левой руке; правая (рисуется поверх) касается экрана
    armL: { target: PHONE, shape: "phone", elbow: "down", item: "phone", glow: 1, itemTilt: -10, itemScale: 1.2, behind: false },
    armR: { target: { x: PHONE.x + 10, y: PHONE.y + 4 - tap(t) * 8 }, shape: "point", elbow: "down", behind: false },
  });
  const momFace = () => -0.62;
  const mom = (layer: "body" | "arms") => <Actor uid="s12-mom" look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} seed={1} layer={layer} />;
  const reveal = clamp((f - P.card) / 16);
  const add = clamp((f - P.add0) / (P.add1 - P.add0));
  return (
    <>
      {/* мама пишет короткое сообщение */}
      <Shot f={f} from={0} to={P.card} cam={camMove(f, 0, P.card, { x: 1105, y: 1110, zoom: 2.15 }, { x: 1107, y: 1112, zoom: 2.24 })}>
        <Room laptop={{ screen: <LaptopSiteSent /> }} momBody={mom("body")} momArms={mom("arms")} />
      </Shot>
      {/* над столом — карточка календаря, событие садится на место */}
      {f >= P.card ? (
        <AdDesk uidPrefix="s12" f={f} ad={null} cam={CAM_TRIAL} zoom={{ k: 1 + 0.03 * clamp((f - P.card) / (P.len - P.card)), ox: 540, oy: 600 }} momFace={momFace} momPose={momPose}>
          <CalendarCard reveal={reveal} add={add} w={CARD.w} x={CARD.x} y={CARD.y + 40} />
        </AdDesk>
      ) : null}
    </>
  );
};

// Сцена 2: три окна одного дня. Папа в офисе печатает; мама дома между
// рабочими звонками — заканчивает звонок, берёт телефон и записывает
// голосовое: «Бүгүн мектептен сиз алып келесизби?». Пузырь голосового
// вылетает из её окна и прилетает к папе; папа слушает и отвечает
// голосовым: «Жолугушуум бар. Бир аздан кийин тактайын.» — ответ летит
// вниз к маме. Сын в своей комнате тем временем собирает рюкзак.
import { interpolate, useCurrentFrame } from "remotion";
import { Actor, atBody, type Place } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { LaptopSide } from "../../../two-schedules-2d/sets/Home";
import { PhoneFlat } from "../../../two-schedules-2d/sets/Apartment";
import { beatsOf } from "../beats";
import { useLine, useSceneFrames, useTimeline } from "../context";
import { ADULT_H, deskTop, FLOOR, MomBack, MomDesk, OfficeBack, OfficeChair, OfficeDesk, OpenBackpack, Panel, seatHeight, SonBack, WoodChair } from "../sets";
import { abs, C, clamp, font, pop, VoiceBubble } from "../ui";

const DAD: Place = { x: 330, y: FLOOR, h: ADULT_H };
const MOM: Place = { x: 720, y: FLOOR, h: ADULT_H };
const SON: Place = { x: 470, y: FLOOR, h: 540 };

// Рамки окон на экране.
export const PANELS = {
  dad: { top: 70, height: 600 },
  mom: { top: 690, height: 600 },
  son: { top: 1310, height: 320 },
} as const;

const Label: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div style={abs({ left: 28, top: 24, padding: "8px 20px", borderRadius: 30, background: "rgba(255,255,255,0.92)", ...font(28, 900, color), boxShadow: "0 4px 12px rgba(22,52,107,0.12)" })}>{text}</div>
);

export const ChatScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { len } = useSceneFrames("chat");
  const b = beatsOf(tl).chat;
  const m01 = useLine("m01");
  const f01 = useLine("f01");

  // ---------- папа ----------
  const dadKeys = (k: number) => ({ x: DAD.x - 70 + k * 40 + Math.sin(f * 1.6 + k) * 4, y: deskTop() - 4 - Math.abs(Math.sin(f * 1.2 + k * 2)) * 5 });
  const dadPhoneDesk = { x: DAD.x + 230, y: deskTop() - 2 };
  const dadHold = atBody(DAD, 60, -560);
  const dadMouth = atBody(DAD, 40, -610);
  const pick = b.dadSeen - 10;
  const dadPose = (t: number) => {
    const typing = t < pick;
    return {
      expr: t < pick ? ("calm" as const) : t < f01.from ? ("thinking" as const) : ("apologetic" as const),
      sit: 1,
      seat: seatHeight(),
      lean: typing ? 6 : 2,
      lookY: typing ? 0.35 : keys(t, [[pick, 0.35], [pick + 12, 0.45], [f01.from - 6, 0.45], [f01.from + 4, 0.2]]),
      armR: {
        target: typing ? dadKeys(3) : keysV(t, [[pick, dadPhoneDesk], [pick + 14, dadHold], [f01.from - 8, dadHold], [f01.from + 2, dadMouth], [f01.to + 4, dadMouth], [f01.to + 18, dadHold]], anticipate),
        shape: typing ? ("relax" as const) : ("phone" as const),
        item: t >= pick + 6 ? ("phone" as const) : ("none" as const),
        glow: 1,
        itemTilt: -8,
        elbow: t < pick + 8 ? ("down" as const) : ("hang" as const),
        behind: false,
      },
      armL: { target: typing ? dadKeys(0) : { x: DAD.x - 110, y: deskTop() - 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
      nod: keys(t, [[f01.from, 0], [f01.from + 8, 3], [f01.from + 18, 0]]),
    };
  };
  const dadFace = (t: number) => (t < pick ? 0.25 : keys(t, [[pick, 0.25], [pick + 10, 0.1]]));

  // ---------- мама ----------
  const callEnd = Math.max(8, b.momSend - 46);
  const momEar = atBody(MOM, -68, -690);
  const momHold = atBody(MOM, -60, -560);
  const momMouth = atBody(MOM, -40, -610);
  const momPose = (t: number) => ({
    expr: t < callEnd ? ("calm" as const) : t < m01.to ? ("thinking" as const) : t < f01.from ? ("calm" as const) : ("tired" as const),
    sit: 1,
    seat: seatHeight(),
    lean: 4,
    lookY: t < callEnd ? 0.1 : keys(t, [[callEnd, 0.1], [callEnd + 14, 0.4], [m01.from - 4, 0.25]]),
    armL: {
      target: keysV(t, [[0, momEar], [callEnd, momEar], [callEnd + 14, momHold], [m01.from - 6, momHold], [m01.from + 2, momMouth], [m01.to + 6, momMouth], [m01.to + 20, momHold]], anticipate),
      shape: "phone" as const,
      item: "phone" as const,
      glow: 1,
      itemTilt: t < callEnd ? -70 : 8,
      elbow: t < callEnd + 6 ? ("out" as const) : ("hang" as const),
      behind: false,
    },
    armR: { target: { x: MOM.x + 130, y: deskTop() - 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    headTilt: t < callEnd ? -6 : 0,
  });
  const momFace = (t: number) => (t < callEnd ? -0.15 : keys(t, [[callEnd, -0.15], [callEnd + 12, -0.05]]));

  // ---------- сын: книги в рюкзак ----------
  const bag = { x: SON.x + 200, y: FLOOR - 10 };
  const cycle = 70;
  const sonPose = (t: number) => {
    const ph = (t % cycle) / cycle;
    const into = { x: bag.x - 10, y: bag.y - 200 };
    const shelf = { x: SON.x - 120, y: SON.y - 330 };
    const target = ph < 0.4 ? keysV(ph, [[0, shelf], [0.4, into]], anticipate) : keysV(ph, [[0.4, into], [0.55, into], [1, shelf]], anticipate);
    return {
      expr: "calm" as const,
      lookY: 0.35,
      lean: keys(ph, [[0, 0], [0.4, 14], [0.6, 14], [1, 0]]),
      armR: { target, shape: ph < 0.5 ? ("fist" as const) : ("open" as const), item: ph < 0.5 ? ("notebook" as const) : ("none" as const), itemColor: ["#E07A5F", "#5C86D6", "#FFC72C"][Math.floor(t / cycle) % 3], behind: false },
      armL: { target: { x: SON.x + 90, y: SON.y - 300 }, shape: "relax" as const, behind: false },
      packOff: true,
    };
  };

  // ---------- пузыри голосовых ----------
  const momP = pop(f, b.momSend);
  const momFly = interpolate(f, [m01.to + 10, m01.to + 32], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const momProgress = interpolate(f, [m01.from, m01.to], [0, 1], clamp);
  const dadP = pop(f, b.dadSend);
  const dadFly = interpolate(f, [f01.to + 10, f01.to + 32], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const dadProgress = interpolate(f, [f01.from, f01.to], [0, 1], clamp);
  const camDrift = interpolate(f, [0, len], [0, 1], clamp);

  return (
    <>
      <div style={abs({ inset: 0, background: "#EEF3FA" })} />
      <Panel top={PANELS.dad.top} height={PANELS.dad.height} left={30} width={1020} radius={34} cam={{ x: 520 - 20 * camDrift, y: 520, zoom: 0.9 + 0.03 * camDrift }} style={{ boxShadow: "0 12px 30px rgba(22,52,107,0.16)" }}>
        <OfficeBack f={f} />
        <OfficeChair x={DAD.x} />
        <Actor uid="c2-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
        <OfficeDesk x={DAD.x + 40} />
        <LaptopSide x={DAD.x - 30} y={deskTop() + 4} open={1} />
        {f < pick + 6 ? <PhoneFlat x={dadPhoneDesk.x} y={dadPhoneDesk.y} glow={f >= b.momSend + 22 ? 1 : 0} shake={f >= b.momSend + 22 && f < pick ? Math.sin(f * 2.6) * 4 : 0} /> : null}
        <Actor uid="c2-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      </Panel>
      <Panel top={PANELS.mom.top} height={PANELS.mom.height} left={30} width={1020} radius={34} cam={{ x: 520 + 20 * camDrift, y: 520, zoom: 0.9 + 0.03 * camDrift }} style={{ boxShadow: "0 12px 30px rgba(22,52,107,0.16)" }}>
        <MomBack f={f} />
        <WoodChair x={MOM.x} />
        <Actor uid="c2-mom" look="mom" f={f} place={() => MOM} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
        <MomDesk x={MOM.x - 40} />
        <LaptopSide x={MOM.x + 60} y={deskTop() + 4} open={1} />
        <Actor uid="c2-mom" look="mom" f={f} place={() => MOM} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      </Panel>
      <Panel top={PANELS.son.top} height={PANELS.son.height} left={30} width={1020} radius={34} cam={{ x: 560, y: 760, zoom: 0.62 }} style={{ boxShadow: "0 12px 30px rgba(22,52,107,0.16)" }}>
        <SonBack />
        <Actor uid="c2-son" look="son" f={f} place={() => SON} face={() => 0.35} pose={sonPose} seed={4} />
        <OpenBackpack x={bag.x} y={bag.y} s={0.9} />
      </Panel>
      <div style={abs({ left: 30, top: PANELS.dad.top, width: 1020, height: PANELS.dad.height, pointerEvents: "none" })}>
        <Label text="Ата · жумушта" color={C.dadInk} />
      </div>
      <div style={abs({ left: 30, top: PANELS.mom.top, width: 1020, height: PANELS.mom.height })}>
        <Label text="Апа · үйдөн иштейт" color={C.momInk} />
      </div>
      <div style={abs({ left: 30, top: PANELS.son.top, width: 1020, height: PANELS.son.height })}>
        <Label text="Бекжан · рюкзак" color="#B7701A" />
      </div>
      {/* голосовое мамы: появляется рядом с ней, затем улетает к папе */}
      {f >= b.momSend ? (
        <div
          style={abs({
            left: interpolate(momFly, [0, 1], [70, 470]),
            top: interpolate(momFly, [0, 1], [PANELS.mom.top + 110, PANELS.dad.top + 90]),
            opacity: Math.min(1, momP * 1.5) * interpolate(f, [f01.from - 10, f01.from], [1, 0.55], clamp),
            transform: `scale(${(0.8 + 0.2 * momP) * interpolate(momFly, [0, 1], [1, 0.82])})`,
            transformOrigin: "0 0",
          })}
        >
          <VoiceBubble who="mom" side="left" progress={momProgress} seconds="0:03" scale={0.95} />
        </div>
      ) : null}
      {f >= b.dadSend ? (
        <div
          style={abs({
            left: interpolate(dadFly, [0, 1], [470, 70]),
            top: interpolate(dadFly, [0, 1], [PANELS.dad.top + 300, PANELS.mom.top + 300]),
            opacity: Math.min(1, dadP * 1.5),
            transform: `scale(${(0.8 + 0.2 * dadP) * interpolate(dadFly, [0, 1], [1, 0.82])})`,
            transformOrigin: "0 0",
          })}
        >
          <VoiceBubble who="dad" progress={dadProgress} seconds="0:04" scale={0.95} />
        </div>
      ) : null}
    </>
  );
};

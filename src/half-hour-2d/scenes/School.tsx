import { useCurrentFrame } from "remotion";
import { ARM, armKeys, CHILD_ARM, type Arm, exprKeys } from "../Character";
import { useMouth } from "../context";
import { hhmm, Phone } from "../props";
import { Actor, reach, walkOf, type Placement } from "../rig";
import { HH2_TEXT } from "../script";
import { ChatScreen } from "../screens";
import { DeskPhone, OfficeRoom, SchoolYard, Tree, WorkDesk } from "../sets2";
import { camMove, Shot } from "../shots";
import { keys } from "../ui";
import { deskScreen, DESK, Keyboard, MOM, Mug, PHONE_ON_DESK, T_START, typing, BAG, BAG_K } from "./Office";
import { BagOnDesk } from "../sets2";

// Мальчик и учительница — одинаковое расположение в школьных сценах.
export const SON_H = 640;
export const TEACHER_H = 930;
export const YARD_Y = 1720;

// ---------- Сцена 3: школа (30–44 с) ----------
export const SchoolScene: React.FC = () => {
  const f = useCurrentFrame();
  const sonMouth = useMouth("son");
  const momMouth = useMouth("mother");
  const bell = keys(f, [[6, 0], [12, 1], [50, 1], [60, 0]]);
  const door = keys(f, [[16, 0], [34, 1]]);
  // уход со двора: плавный разгон (без рывка с места), дальше ровный шаг
  const go = (t: number) => {
    const a = 0.3;
    const c = 1 / (1 - a / 2);
    return t < a ? (c * t * t) / (2 * a) : c * (t - a / 2);
  };
  // Дети выходят из глубины дверного проёма: сначала в тени (проявляются),
  // затем подходят к родителям и уходят вместе с ними. Шаги — по пройденному пути.
  const girlPos = (t: number): Placement =>
    t < 70
      ? { x: keys(t, [[24, 540], [70, 250]]), y: keys(t, [[24, 1318], [70, 1700]]), h: keys(t, [[24, 430], [70, 600]]) }
      : { x: keys(t, [[70, 250], [150, -300]], go), y: 1700, h: 600 };
  const dadPos = (t: number): Placement => ({ x: keys(t, [[72, 160], [150, -390]], go), y: 1700, h: 900 });
  const boyPos = (t: number): Placement =>
    t < 80
      ? { x: keys(t, [[38, 540], [80, 790]]), y: keys(t, [[38, 1318], [80, 1700]]), h: keys(t, [[38, 420], [80, 580]]) }
      : { x: keys(t, [[80, 790], [150, 1360]], go), y: 1700, h: 580 };
  const mom2Pos = (t: number): Placement => ({ x: keys(t, [[84, 930], [150, 1500]], go), y: 1700, h: 880 });
  // сын выходит последним, останавливается и оглядывается
  const sonPos = (t: number): Placement => ({
    x: keys(t, [[54, 540], [104, 610]]),
    y: keys(t, [[54, 1318], [104, YARD_Y]]),
    h: keys(t, [[54, SON_H * 0.74], [104, SON_H]]),
  });
  // проявление из тени проёма
  const emerge = (from: number): React.CSSProperties => ({ opacity: keys(f, [[from, 0], [from + 12, 1]]) });
  const son = sonPos(f);
  // часы ко рту и обратно — по дуге перед туловищем (локоть не уходит в
  // сторону), без остановки на полпути
  const arc = (t: number): Arm => {
    const [a, c, b] = [CHILD_ARM.down, [-24, 560] as const, CHILD_ARM.watchMouth];
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  };
  const sonArmL: Arm = arc(keys(f, [[112, 0], [132, 1], [182, 1], [200, 0]]));
  const sonLook = keys(f, [[104, 0], [110, -0.8], [116, 0.6], [124, 0], [196, 0], [204, -0.7]]);
  const teacher: Placement = { x: 790, y: 1640, h: TEACHER_H * 0.96 };
  // В проёме (ступни выше порога) персонаж рисуется внутри двери —
  // его закрывают створки и косяки, а не «появляется» перед дверью.
  const inDoorway = (p: Placement) => p.y < 1385;
  const walker = (
    key: string,
    kind: "kidGirl" | "kidBoy" | "extraDad" | "extraMom",
    pos: (t: number) => Placement,
    from: number,
    extra: Partial<React.ComponentProps<typeof Actor>> = {},
  ) => {
    const p = pos(f);
    const w = walkOf(pos, from, f);
    return <Actor key={key} at={p} kind={kind} {...w} {...extra} />;
  };
  const girl = f >= 24 ? walker("girl", "kidGirl", girlPos, 24, { expr: "smile", backpack: true, seed: 7, style: emerge(24) }) : null;
  const boy = f >= 38 ? walker("boy", "kidBoy", boyPos, 38, { expr: "smile", backpack: true, seed: 9, style: emerge(38) }) : null;
  const sonWalk = walkOf(sonPos, 54, f);
  const sonActor =
    f >= 54 ? (
      <Actor
        at={son}
        kind="son"
        {...sonWalk}
        expr={exprKeys(f, [[0, "neutral"], [116, "calm"], [196, "sad"]])}
        mouth={sonMouth}
        look={sonLook}
        lookY={f >= 128 && f < 182 ? 0.5 : 0}
        armL={sonArmL}
        watchL
        backpack
        style={emerge(54)}
        seed={2}
      />
    ) : null;
  const yard = (
    <>
      <SchoolYard
        label={HH2_TEXT.school}
        doorOpen={door}
        bell={bell}
        afternoon={0.15}
        inDoor={
          <>
            {f >= 24 && inDoorway(girlPos(f)) ? girl : null}
            {f >= 38 && inDoorway(boyPos(f)) ? boy : null}
            {f >= 54 && inDoorway(son) ? sonActor : null}
          </>
        }
      />
      <Tree x={980} y={1420} s={1.05} />
      <Actor at={teacher} kind="teacher" expr="calm" look={keys(f, [[0, -0.6], [60, -0.6], [100, -1]])} armL={[-40, 470]} armR={ARM.relaxed} seed={5} />
      {walker("dad", "extraDad", dadPos, 72, { look: 0.8, armR: f >= 64 ? [-60, 560] : undefined, seed: 6 })}
      {walker("mom2", "extraMom", mom2Pos, 84, { look: -0.8, expr: "smile", seed: 8 })}
      {f >= 24 && !inDoorway(girlPos(f)) ? girl : null}
      {f >= 38 && !inDoorway(boyPos(f)) ? boy : null}
      {f >= 54 && !inDoorway(son) ? sonActor : null}
    </>
  );

  // офис: телефон вибрирует на столе, мама берёт его и отвечает голосом
  const pickAt = 246;
  const phoneHand = reach(MOM, "mom", -1, PHONE_ON_DESK.x + 60, PHONE_ON_DESK.y + 4, 1);
  const vibr = f >= 207 && f < 232 ? Math.sin(f * 2.6) * 5 : 0;
  const momArmL: Arm = armKeys(f, [
    [200, typing(f, -1, 1)],
    [232, typing(f, -1, 0)],
    [pickAt, phoneHand],
    [264, ARM.phoneTalk],
    [312, ARM.phoneTalk],
    [326, ARM.phoneLook],
  ]);
  const holdingPhone = f >= pickAt;
  const clock = T_START + 38 + (f - 200) / 30 / 60;
  const office = (
    <>
      <OfficeRoom clockMinutes={clock} />
      {/* кружка за рукой: поднятый телефон проходит перед ней, как и лежал */}
      <div style={{ position: "absolute", left: DESK.x, top: DESK.y }}>
        <Mug x={60} />
      </div>
      <Actor
        at={{ x: 930, y: 1820, h: 1150 }}
        kind="colleague"
        expr="focused"
        look={-0.8}
        turn={-0.4}
        armL={reach({ x: 930, y: 1820, h: 1150 }, "colleague", -1, 700, 1150)}
        armR={[-40, 470]}
        itemR="folder"
        seed={4}
      />
      <Actor
        at={MOM}
        kind="mom"
        sit={1}
        expr={exprKeys(f, [[0, "focused"], [232, "worried"], [266, "apologetic"]])}
        mouth={momMouth}
        look={keys(f, [[200, 0], [212, -0.8], [250, -0.4], [264, 0], [330, 0], [340, 0.6]])}
        lookY={keys(f, [[200, 0.7], [212, 0.9], [250, 0.4], [264, 0.2], [312, 0.2], [326, 0.7]])}
        armL={momArmL}
        armR={f < 232 ? typing(f, 1, 1) : typing(f, 1, 0)}
        itemL={holdingPhone ? "phone" : "none"}
        itemFlatL={keys(f, [[pickAt, 1], [pickAt + 12, 0]])}
        watchL
        seed={1}
      />
      <WorkDesk x={DESK.x} y={DESK.y} monitorX={480} screen={deskScreen(0.4, 2)}>
        <Keyboard />
        {!holdingPhone ? (
          <DeskPhone x={PHONE_ON_DESK.x - DESK.x} y={PHONE_ON_DESK.y - DESK.y} lit={keys(f, [[206, 0], [210, 1]])} shake={vibr} />
        ) : null}
      </WorkDesk>
      <BagOnDesk x={BAG.x} y={BAG.y} k={BAG_K} />
    </>
  );
  const msgTime = hhmm(T_START + 38);
  return (
    <>
      <Shot f={f} from={0} to={112} cam={camMove(f, 0, 112, { x: 540, y: 1130, scale: 1.0 }, { x: 560, y: 1180, scale: 1.08 })}>
        {yard}
      </Shot>
      <Shot f={f} from={112} to={200} cam={camMove(f, 112, 200, { x: 650, y: 1340, scale: 2.5 }, { x: 650, y: 1335, scale: 2.6 })}>
        {yard}
      </Shot>
      <Shot f={f} from={200} to={330} cam={camMove(f, 200, 330, { x: 380, y: 1100, scale: 1.45 }, { x: 360, y: 1080, scale: 1.6 })}>
        {office}
      </Shot>
      <Shot
        f={f}
        from={330}
        to={384}
        cam={{ x: 540, y: 960, scale: 1 }}
        overlay={
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#DDE3EB" }}>
            <Phone w={700} style={{ left: 190, top: 250 }}>
              <ChatScreen f={f} incomingAt={250} replyAt={334} time={msgTime} />
            </Phone>
          </div>
        }
      >
        {office}
      </Shot>
      {/* она всё ещё на работе: телефон в руке, коллега ждёт */}
      <Shot f={f} from={384} to={420} cam={camMove(f, 384, 420, { x: 560, y: 1040, scale: 1.15 }, { x: 560, y: 1040, scale: 1.18 })}>
        {office}
      </Shot>
    </>
  );
};

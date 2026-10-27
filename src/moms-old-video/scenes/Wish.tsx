// Сцена 6 «Кайра бийлегиси келет» (≈ 11 с).
// Поздний вечер, родители на диване смотрят старую запись в телефоне мамы
// (к зрителю — тыльная сторона, свет экрана на лицах). Вставка: телефон в
// руках мамы, наезд в экран — молодая мама на сцене растворяется в
// воспоминание (то же место, размер и фаза движения): студия, подруги,
// новое движение, смех. В конце воспоминания — характерный жест «прядь за
// ухо»; тот же жест у настоящей мамы на диване (лицо в той же точке кадра) —
// возвращение в настоящее. «Кайра бийлеп көргүм келип жатат.» Пауза — взгляд
// мужа.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { LOOKS, type LookId } from "../rig/looks";
import { clamp, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { HoldingHands, OldVideo, Phone, VideoPlayer } from "../screens";
import { ChairBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { OldStudio } from "../sets/Places";
import { box, type Cam, camMove, Shot } from "../shots";
import { lineFrames, sceneLen, sofaPlace, sofaSeatH } from "./common";
import { dancePose, danceTurn } from "./danceKit";
import { InsertBack, PhoneBack, phoneGeom, phoneH, ScreenGlow, VIDEO_TOP } from "./EveningParts";
import { SON_PHONE_W } from "./Hook";

// ---------- планы ----------
export const WISH = { ins: 70, push: [84, 108] as const, mem: [102, 112] as const, wide: [112, 148] as const, near: 150, back: [192, 202] as const, dad: 288 };
// время воспоминания и записи (одна хореография: на сцене и в студии)
const tmOf = (f: number) => f - WISH.ins;
const MEM_SEGS: readonly DanceSeg[] = [
  { move: "B", from: 6, dur: 56 },
  { move: "tuck", from: 100, dur: 48 },
];
const FA_SEGS: readonly DanceSeg[] = [{ move: "B", from: 10, dur: 56 }];
const FB_SEGS: readonly DanceSeg[] = [{ move: "B", from: 3, dur: 56 }];

// ---------- гостиная ----------
const MOM = sofaPlace("mom");
const DAD = sofaPlace("dad");
const PHONE_W = SON_PHONE_W;
const PH_H = phoneH(PHONE_W);
const PH: Vec = { x: 1716, y: 1162 }; // телефон между ними, экраном к ним
const SKIN = { mom: "#E6B590", momShade: "#D29B74", sleeve: "#C47A62" };
// голова сидящей на диване (центр овала) — для совпадения по лицу
const headOf = (p: Place, look: LookId, face: number): Vec => {
  const b = LOOKS[look].build;
  const k = p.h / 1000;
  return { x: p.x + face * 0.8 * 12 * k, y: p.y + (b.headY + (-sofaSeatH() / k + 6 - b.hipJointY)) * k };
};

// ---------- воспоминание: студия ----------
const YM: Place = { x: 960, y: 1560, h: 860 };
const FA: Place = { x: 640, y: 1528, h: 830 };
const FB: Place = { x: 1290, y: 1532, h: 840 };

// склейка «экран → воспоминание»: молодая мама в той же точке и того же
// размера, что на записи, когда видео заполнило кадр
const INS = { x: 540, y: 930, w: 520 };
const G = phoneGeom(INS.x, INS.y, INS.w);
const VCAM: Cam = { x: 925, y: 1070, zoom: 0.62 };
const STAGE: Place = { x: 900, y: 1500, h: 900 };
const FILL = 1080 / (540 * G.k); // масштаб вставки, при котором видео = кадр
const VC = G.at(270, VIDEO_TOP + 480); // центр видео на экране вставки
const vidScreen = (wx: number, wy: number) => ({ x: 540 + (wx - VCAM.x) * VCAM.zoom * 2, y: 960 + (wy - VCAM.y) * VCAM.zoom * 2 });
const MZ0 = (STAGE.h * VCAM.zoom * 2) / YM.h;
const MC0: Cam = { x: YM.x - (vidScreen(STAGE.x, 0).x - 540) / MZ0, y: YM.y - (vidScreen(0, STAGE.y).y - 960) / MZ0, zoom: MZ0 };
const MC1: Cam = { x: 965, y: 1190, zoom: 0.8 };
// лицо на склейке «воспоминание → настоящее»
const FACE_AT: Vec = { x: 540, y: 760 };
const FACE_R = 150;
const TUCK_FACE = 0.12;
const YB = LOOKS.youngMomStudio.build;
const YM_HEAD: Vec = { x: YM.x + TUCK_FACE * 0.8 * 12 * (YM.h / 1000), y: YM.y + (YB.headY + 6) * (YM.h / 1000) };
const MZ2 = FACE_R / (YB.headRx * (YM.h / 1000));
const MC2: Cam = { x: YM_HEAD.x - (FACE_AT.x - 540) / MZ2, y: YM_HEAD.y - (FACE_AT.y - 960) / MZ2, zoom: MZ2 };
const MOM_HEAD = headOf(MOM, "momHome", TUCK_FACE);
const PZ = FACE_R / (LOOKS.momHome.build.headRx * (MOM.h / 1000));
const PC: Cam = { x: MOM_HEAD.x - (FACE_AT.x - 540) / PZ, y: MOM_HEAD.y - (FACE_AT.y - 960) / PZ, zoom: PZ };
const DAD_HEAD = headOf(DAD, "dad", -0.5);
const DZ = FACE_R / (LOOKS.dad.build.headRx * (DAD.h / 1000));
const DC: Cam = { x: DAD_HEAD.x + 20 / DZ, y: DAD_HEAD.y - (FACE_AT.y - 960) / DZ, zoom: DZ };

export const WishScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("wish");
  const m02 = lineFrames(cues, "m02");
  const tm = tmOf(f);

  // ---------- гостиная: мама ----------
  const corner = (side: -1 | 1): Vec => ({ x: PH.x + side * PHONE_W * 0.46, y: PH.y + PH_H * 0.47 });
  // одна рука держит телефон ниже (крупный план), другая — у уха → вниз
  const lowPhone: Vec = { x: MOM.x + 0.06 * MOM.h, y: MOM.y - 0.4 * MOM.h };
  const MB = LOOKS.momHome.build;
  const ear: Vec = { x: MOM_HEAD.x + MB.headRx * 1.32 * (MOM.h / 1000), y: MOM_HEAD.y + MB.headRy * 0.25 * (MOM.h / 1000) };
  const lap: Vec = { x: MOM.x + 0.03 * MOM.h, y: 1268 };
  const momPose = (t: number): PoseIn => {
    const closeUp = t >= WISH.back[0];
    const talk = t >= m02.from - 4 && t <= m02.to + 4;
    const expr: ExprId = !closeUp ? "softSmile" : t < m02.from ? "dreamy" : talk ? "calm" : "softSmile";
    return {
      expr,
      sit: 1,
      seat: sofaSeatH(),
      lookY: closeUp ? keys(t, [[WISH.back[1], 0.45], [m02.from - 10, 0.45], [m02.from + 4, 0.05]]) : 0.42,
      lookX: closeUp ? keys(t, [[m02.from - 8, 0], [m02.from + 6, 0.35]]) : 0.45,
      headTilt: closeUp ? keys(t, [[WISH.back[0], 6], [WISH.back[1] + 6, 6], [WISH.back[1] + 22, 2], [m02.to, 3]]) : 3,
      nod: talk ? 2 * Math.sin((t - m02.from) / 3.4) : 0,
      armL: closeUp ? { target: lowPhone, shape: "fist", item: "phoneSide", itemTilt: -10, elbow: "down", behind: false } : { target: corner(-1), shape: "fist", elbow: "down", behind: false },
      armR: closeUp
        ? { target: keysV(t, [[WISH.back[1] + 4, ear], [WISH.back[1] + 11, { x: ear.x + 34, y: ear.y + 110 }], [WISH.back[1] + 20, { x: MOM.x + 0.13 * MOM.h, y: 1215 }], [WISH.back[1] + 30, lap]], easeInOut), shape: "soft", elbow: "down", behind: t < WISH.back[1] + 9 }
        : { target: corner(1), shape: "fist", elbow: "down", behind: false },
    };
  };
  const momFace = (t: number) => (t < WISH.back[0] ? 0.26 : keys(t, [[WISH.back[1] + 6, TUCK_FACE], [m02.from - 8, TUCK_FACE + 0.06], [m02.from + 6, 0.42]]));

  // ---------- гостиная: папа ----------
  const dadPose = (t: number): PoseIn => ({
    expr: t < WISH.dad ? "softSmile" : t < WISH.dad + 18 ? "calm" : "softSmile",
    sit: 1,
    seat: sofaSeatH(),
    lean: t < WISH.dad ? 7 : keys(t, [[WISH.dad, 3], [len, 3]]),
    lookY: t < WISH.dad ? 0.4 : 0.06,
    lookX: t < WISH.dad ? -0.4 : -0.3,
    nod: t < WISH.dad ? 0 : keys(t, [[WISH.dad + 16, 0], [WISH.dad + 24, 5], [WISH.dad + 32, 0]]),
    headTilt: t < WISH.dad ? -3 : keys(t, [[WISH.dad, -2], [len, -5]]),
    armL: { target: { x: DAD.x - 0.08 * DAD.h, y: 1302 }, shape: "relax", elbow: "down" },
    armR: { target: { x: DAD.x + 0.1 * DAD.h, y: 1306 }, shape: "relax", elbow: "down" },
  });
  const dadFace = (t: number) => (t < WISH.dad ? -0.36 : keys(t, [[WISH.dad, -0.5], [len, -0.54]]));

  const mom = (layer: "body" | "armsNoHands" | "hands") => (
    <Actor uid="w6-mom" look="momHome" f={f} place={() => MOM} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />
  );
  const glow = f < WISH.ins ? 1 : 0.6;
  const living = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <ChairBack x={LIV.chair.x} light="evening" />
      <WorkTable light="evening" />
      <Actor uid="w6-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} seed={2} />
      {mom("body")}
      {mom("armsNoHands")}
      {f < WISH.back[0] ? <PhoneBack x={PH.x} y={PH.y} w={PHONE_W} rot={-10} /> : null}
      {mom("hands")}
      {/* свет экрана на лицах */}
      <ScreenGlow x={PH.x - 20} y={PH.y - 150} r={170} a={glow} />
      <div style={box({ left: -400, top: 0, width: 3400, height: 2600, backgroundColor: "rgba(40,36,80,0.16)", mixBlendMode: "multiply", pointerEvents: "none" })} />
    </>
  );

  // ---------- воспоминание ----------
  const laugh = (t: number) => keys(t, [[60, 0], [70, 1], [96, 1], [104, 0]]);
  const memActor = (uid: string, look: LookId, place: Place, segs: readonly DanceSeg[], turnTo: number, seed: number, exprAt: (t: number) => ExprId) => (
    <Actor
      uid={uid}
      look={look}
      f={tm}
      place={() => place}
      face={(t) => danceTurn(t, segs, look) + turnTo * laugh(t)}
      pose={(t) => ({ ...dancePose(t, segs, look, place), expr: exprAt(t) })}
      seed={seed}
      lead="body"
    />
  );
  const memory = (
    <>
      <OldStudio />
      {memActor("w6-fa", "friendA", FA, FA_SEGS, 0.3, 8, (t) => (laugh(t) > 0.3 ? "laugh" : "smile"))}
      {memActor("w6-fb", "friendB", FB, FB_SEGS, -0.4, 9, (t) => (laugh(t) > 0.3 ? "laugh" : "smile"))}
      {memActor("w6-ym", "youngMomStudio", YM, MEM_SEGS, 0.34, 7, (t) => (t < 56 ? "focused" : laugh(t) > 0.3 ? "laugh" : "smile"))}
    </>
  );
  // воспоминание — тёплый мягкий свет и светлые края (не зерно записи)
  const memoryLook = (
    <>
      <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(255,236,200,0.34), transparent 70%)", mixBlendMode: "screen" })} />
      <div style={box({ inset: 0, backgroundColor: "rgba(255,214,160,0.12)", mixBlendMode: "multiply" })} />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 48%, transparent 58%, rgba(255,246,232,0.6))" })} />
    </>
  );
  const memCam = (t: number): Cam => {
    if (t < WISH.wide[0]) return MC0;
    if (t < WISH.near) return camMove(t, WISH.wide[0], WISH.wide[1], MC0, MC1);
    return camMove(t, WISH.near, WISH.back[0] - 4, { x: 1080, y: 990, zoom: 1.45 }, MC2);
  };

  // ---------- вставка: телефон в руках мамы, наезд в экран ----------
  const pu = easeInOut((f - WISH.push[0]) / (WISH.push[1] - WISH.push[0]));
  const s = Math.exp(lerp(0, Math.log(FILL), pu)) * (1 + 0.04 * clamp((f - WISH.ins) / (WISH.push[0] - WISH.ins)));
  const w = (1 - 1 / Math.max(1, s)) / (1 - 1 / FILL);
  const insert = (
    <div style={box({ inset: 0 })}>
      <InsertBack wall="#3B4470" low="#2E3558" blobs={[{ x: 200, y: 400, r: 260, c: "#E7B76A", o: 0.35 }, { x: 900, y: 1500, r: 420, c: "#5B4C7C", o: 0.6 }]} />
      <div style={box({ inset: 0, transformOrigin: `${VC.x}px ${VC.y}px`, transform: `translate(${(540 - VC.x) * w}px, ${(960 - VC.y) * w}px) scale(${s})` })}>
        <HoldingHands x={INS.x} y={INS.y} w={INS.w} skin={SKIN.mom} shade={SKIN.momShade} sleeve={SKIN.sleeve} />
        <Phone x={INS.x} y={INS.y} w={INS.w}>
          <VideoPlayer progress={0.3 + tm / 900}>
            <OldVideo f={f} t={tm} segs={MEM_SEGS} cam={VCAM} w={540} h={960} id="w6-video" soft={false} exprAt={() => "softSmile"} />
          </VideoPlayer>
        </Phone>
      </div>
    </div>
  );

  // ---------- сборка ----------
  const memA = clamp((f - WISH.mem[0]) / (WISH.mem[1] - WISH.mem[0]));
  const backA = clamp((f - WISH.back[0]) / (WISH.back[1] - WISH.back[0]));
  return (
    <div style={box({ inset: 0, backgroundColor: "#2A2F45" })}>
      <Shot f={f} from={0} to={WISH.ins} cam={camMove(f, 0, WISH.ins, { x: 1775, y: 1135, zoom: 1.5 }, { x: 1772, y: 1128, zoom: 1.6 })} bg="#3B3149">
        {living}
      </Shot>
      {f >= WISH.ins && f < WISH.mem[1] ? insert : null}
      {f >= WISH.back[0] ? (
        <>
          <Shot f={f} from={WISH.back[0]} to={WISH.dad} cam={camMove(f, WISH.back[0], WISH.dad, PC, { ...PC, y: PC.y + 6, zoom: PC.zoom * 1.06 })} bg="#3B3149">
            {living}
          </Shot>
          <Shot f={f} from={WISH.dad} to={len} cam={camMove(f, WISH.dad, len, DC, { ...DC, zoom: DC.zoom * 1.04 })} bg="#3B3149">
            {living}
          </Shot>
        </>
      ) : null}
      {/* воспоминание поверх: проявляется из экрана, растворяется в лицо мамы */}
      {f >= WISH.mem[0] && f < WISH.back[1] ? (
        <div style={box({ inset: 0, opacity: memA * (1 - backA) })}>
          <Shot f={f} from={WISH.mem[0]} to={WISH.back[1]} cam={memCam(f)} bg="#F2DEC8" overlay={memoryLook}>
            {memory}
          </Shot>
        </div>
      ) : null}
    </div>
  );
};


// Сцены 1–2: «Бир коңгуроо — эки башка график.»
//
// 1. Крупно: учительница звонит в ручной колокольчик с красной лентой,
//    расходятся звуковые волны; камера отъезжает — это класс, сын
//    собирает рюкзак рядом с учительницей. На словах «эки башка» волна
//    разрезает кадр: снизу открывается офис, где у мамы те же 13:00.
// 2. Два мира одновременно: в классе урок закончился (учительница рядом,
//    одноклассница надевает рюкзак), в офисе мама заканчивает рабочий
//    разговор и возвращается к ноутбуку. Разделитель — волна звонка.
import { useCurrentFrame } from "remotion";
import { easeInOut, keys, keysV, lerp } from "../../../two-schedules-2d/rig/motion";
import { Panel, useLine, useSceneFrames, useWord, type Cam } from "../context";
import { BG19_TEXT } from "../script";
import { BellRings, WaveDivider, WorldTag } from "../sets";
import { appear } from "../screens";
import { bellHand, Classroom, handOnDesk, MOM_EAR, Office, onDesk, packing, phoneAtEar, sonRest, typing } from "./common";

// Удары колокольчика (кадры сцены 1): быстрые качания, затем пауза.
export const BELL_HITS = [4, 12, 20, 28, 36];
export const swingAt = (f: number, hits: readonly number[]) => {
  const last = hits[hits.length - 1];
  if (f < hits[0] - 4) return 0;
  if (f <= last) return 26 * Math.sin(((f - hits[0]) / 8) * Math.PI + Math.PI / 2);
  return 26 * Math.cos(((f - last) / 8) * Math.PI) * Math.exp(-(f - last) / 10);
};

export const CAM_CLASS_SPLIT: Cam = { x: 600, y: 1215, zoom: 1.12 };
export const CAM_OFFICE_SPLIT: Cam = { x: 640, y: 1090, zoom: 1.32 };
const CAM_BELL: Cam = { x: 735, y: 1010, zoom: 3.4 };
const CAM_CLASS_FULL: Cam = { x: 600, y: 1150, zoom: 1.0 };

// Отъезд камеры от колокольчика (кадры сцены 1); сборка рюкзака — сразу после.
export const bellZoom = (n1From: number) => {
  const zoomFrom = Math.max(BELL_HITS[4] + 6, n1From - 4);
  return { zoomFrom, zoomTo: zoomFrom + 40, packFrom: zoomFrom + 44 };
};

// Разрез на два мира — на слове «эки» (не раньше конца отъезда камеры).
export const bellSplitAt = (n1From: number, word2: number) => Math.max(bellZoom(n1From).zoomTo - 6, word2 - 8);

const camLerp = (a: Cam, b: Cam, u: number): Cam => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), u)) });

// Мама в офисе в начале (сцены 1–2): разговор по работе, затем ноутбук.
const momWork = (hangUp: number) => (t: number) => ({
  expr: t < hangUp ? ("thinking" as const) : ("calm" as const),
  nod: keys(t, [[hangUp - 30, 0], [hangUp - 24, 5], [hangUp - 16, 0], [hangUp - 10, 4], [hangUp - 2, 0]]),
  lookX: t < hangUp ? 0.2 : 0.6,
  lookY: t < hangUp ? 0 : 0.35,
  armR:
    t < hangUp
      ? phoneAtEar()
      : {
          ...phoneAtEar(),
          target: keysV(t, [[hangUp, MOM_EAR], [hangUp + 20, onDesk(430, -6)], [hangUp + 30, onDesk(470, -6)], [hangUp + 46, typing(3, t)]]),
          shape: t < hangUp + 22 ? ("phone" as const) : ("relax" as const),
          item: t < hangUp + 22 ? ("phone" as const) : ("none" as const),
          flat: Math.min(1, Math.max(0, (t - hangUp - 8) / 12)),
          itemTilt: keys(t, [[hangUp, -18], [hangUp + 16, 0]]),
        },
  armL: t < hangUp + 40 ? handOnDesk(-1) : { target: typing(0, t), shape: "relax" as const, elbow: "down" as const },
});

// Сцена 1: колокольчик → класс → разрез на два мира.
export const BellScene: React.FC = () => {
  const f = useCurrentFrame();
  const n1 = useLine("n1");
  const dur = useSceneFrames("bell");
  const { zoomFrom, zoomTo } = bellZoom(n1.from);
  const split = bellSplitAt(n1.from, useWord("n1", 2)); // «эки башка»
  const sp = easeInOut((f - split) / 22);
  const cam = f < zoomFrom ? CAM_BELL : f < zoomTo ? camLerp(CAM_BELL, CAM_CLASS_FULL, easeInOut((f - zoomFrom) / (zoomTo - zoomFrom))) : CAM_CLASS_FULL;
  const classCam = camLerp(cam, CAM_CLASS_SPLIT, sp);
  const topH = lerp(1920, 960, sp);
  const pack = packing(bellZoom(n1.from).packFrom);
  const hits = [...BELL_HITS, split + 2];
  const swing = swingAt(f, BELL_HITS) + (f > split ? 10 * Math.sin(((f - split) / 8) * Math.PI) * Math.exp(-(f - split) / 12) : 0);
  const bellUp = (t: number) => (t < zoomTo + 10 ? 1 : keys(t, [[zoomTo + 10, 1], [zoomTo + 40, 0]]));
  const hand = bellHand(bellUp(f));
  return (
    <>
      <Panel top={0} height={topH} cam={classCam} bg="#F4ECDF">
        <Classroom
          uid="b1"
          f={f}
          bellUp={bellUp}
          swing={swing}
          son={(t) => (t < zoomTo + 4 ? { ...sonRest(), lookY: -0.2 } : pack.pose(t))}
          sonFace={(t) => keys(t, [[0, 0.5], [zoomTo, 0.5], [zoomTo + 12, 0.1]])}
          packOpen={pack.open(f)}
          packFill={pack.fill(f)}
        />
        <BellRings x={hand.x} y={hand.y + 140} hits={hits} f={f} />
      </Panel>
      <Panel top={topH} height={1920 - topH} cam={CAM_OFFICE_SPLIT} bg="#E8EEF4">
        <Office uid="b1o" f={f} mom={momWork(dur + 200)} face={() => 0.35} phoneOnDesk={false} />
      </Panel>
      {sp > 0 ? <WaveDivider y={topH} f={f} amp={14 + 26 * (1 - sp)} /> : null}
      <WorldTag text={BG19_TEXT.bell.school} x={90} y={270} opacity={appear(f, 8, 10)} />
      <WorldTag text={BG19_TEXT.bell.work} x={90} y={topH + 100} opacity={appear(f, split + 10, 10)} dark />
    </>
  );
};

// Сцена 2: два мира одновременно.
export const WorldsScene: React.FC = () => {
  const f = useCurrentFrame();
  const dur = useSceneFrames("worlds");
  // продолжение сборки рюкзака из сцены 1 (та же шкала действия)
  const pack = packing(bellZoom(useLine("n1").from).packFrom - useSceneFrames("bell"));
  const hangUp = Math.round(dur * 0.45);
  const drift = (c: Cam, dx: number): Cam => ({ ...c, x: c.x + dx * (f / dur), zoom: c.zoom * (1 + 0.04 * (f / dur)) });
  const sonPose = (t: number) => {
    const p = pack.pose(t);
    return t < 40 ? p : { ...p, expr: "smile" as const, lookY: keys(t, [[40, 0.45], [52, 0]]), lean: 0 };
  };
  return (
    <>
      <Panel top={0} height={960} cam={drift(CAM_CLASS_SPLIT, -14)} bg="#F4ECDF">
        <Classroom
          uid="w2"
          f={f}
          bellUp={() => 0}
          swing={0}
          son={sonPose}
          sonFace={(t) => keys(t, [[30, 0.1], [46, 0.55]])}
          teacher={(t) => ({ nod: keys(t, [[50, 0], [58, 5], [68, 0]]) })}
          packOpen={pack.open(f)}
          packFill={pack.fill(f)}
        />
      </Panel>
      <Panel top={960} height={960} cam={drift(CAM_OFFICE_SPLIT, 12)} bg="#E8EEF4">
        <Office uid="w2o" f={f} mom={momWork(hangUp)} face={(t) => keys(t, [[hangUp, 0.35], [hangUp + 20, 0.55]])} phoneOnDesk={f >= hangUp + 22} />
      </Panel>
      <WaveDivider y={960} f={f} amp={12} />
      <WorldTag text={BG19_TEXT.bell.school} x={90} y={270} opacity={1} />
      <WorldTag text={BG19_TEXT.bell.work} x={90} y={1060} opacity={1} dark />
    </>
  );
};

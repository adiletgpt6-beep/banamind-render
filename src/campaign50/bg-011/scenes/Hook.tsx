// Сцена 1 (хук): макро яркой связки ключей на магнитном крючке сбоку
// холодильника — ключи чуть качаются. Камера плавно отъезжает: в другом
// углу кадра папа и мама перебирают пустые папки на комоде. Диктор
// (с улыбкой): «Ачкыч кайда? Кызыгы, ал дайыма эле көз алдында болот.» —
// на последнем слове комичный стоп-кадр с подписями и стрелками.
import { useCurrentFrame } from "remotion";
import { useLine, useScene } from "../context";
import { Actor, type PoseIn } from "../rig/Actor";
import { easeInOut, keys, keysV } from "../rig/motion";
import { BG11_TEXT } from "../script";
import { Folder, K, KitchenBack } from "../sets/Kitchen";
import { camKeys, FreezeLook, freezeFrame, View } from "../shots";
import { FreezeTag, onDresser, stand } from "./common";

// Папки на комоде: [x, цвет]
export const FOLDERS = [
  [690, "#4C7BD9"],
  [770, "#3E9C6B"],
  [850, "#F08A3C"],
  [930, "#7A6BC4"],
] as const;

// Покачивание ключей: затухающее колебание после толчка в кадре kick.
export const keySwing = (t: number, kicks: readonly number[] = [0]) => {
  let v = 1.2 * Math.sin(t / 22);
  for (const k of kicks) if (t >= k) v += 9 * Math.exp(-(t - k) / 28) * Math.sin((t - k) / 4.2);
  return v;
};

export const HOOK_CAM = { x: K.hook.x + 20, y: K.hook.y + 95, zoom: 2.9 };
export const WIDE_CAM = { x: 640, y: 1150, zoom: 1 };

// Поиск в папках: подъём папок по очереди (кадр начала, папка, кто).
const lifts = (t: number, i: number) => {
  const plan: Record<number, readonly (readonly [number, number])[]> = {
    0: [[10, 0], [22, 46], [46, 46], [58, 0], [120, 0], [132, 40], [150, 40], [160, 0]],
    1: [[40, 0], [52, 0], [64, 30], [84, 30], [96, 0]],
    2: [[24, 0], [36, 44], [60, 44], [72, 0], [140, 0], [152, 36], [170, 36], [180, 0]],
    3: [[70, 0], [82, 38], [104, 38], [116, 0]],
  };
  return keys(t, plan[i]);
};

export const HookScene: React.FC = () => {
  const fs = useCurrentFrame();
  const { frames } = useScene();
  const n01 = useLine("n01");
  const freezeAt = Math.min(frames - 30, n01.to + 2);
  const f = freezeFrame(fs, freezeAt);
  const dad = stand("dad", 600);
  const mom = stand("mom", 1030);
  // папа слева от комода, мама справа: руки в папках, папки поднимаются
  const dadPose = (t: number): PoseIn => ({
    expr: t < 90 ? "thinking" : "worried",
    lean: 14,
    lookY: 0.75,
    nod: 8,
    armR: { target: keysV(t, [[0, onDresser(700, -16)], [10, onDresser(700, -20)], [22, onDresser(712, -96)], [46, onDresser(712, -96)], [58, onDresser(705, -18)], [70, onDresser(760, -24)], [120, onDresser(705, -18)], [132, onDresser(712, -90)], [150, onDresser(712, -90)], [160, onDresser(720, -16)]], easeInOut), shape: "pinch", elbow: "down" },
    armL: { target: keysV(t, [[0, onDresser(650, -8)], [40, onDresser(650, -8)], [52, onDresser(760, -18)], [64, onDresser(780, -66)], [84, onDresser(780, -66)], [96, onDresser(650, -8)]]), shape: "open", elbow: "down", behind: false },
  });
  const momPose = (t: number): PoseIn => ({
    expr: t < 60 ? "thinking" : "worried",
    lean: 12,
    lookY: 0.7,
    nod: 6,
    armL: { target: keysV(t, [[0, onDresser(900, -12)], [24, onDresser(860, -16)], [36, onDresser(846, -92)], [60, onDresser(846, -92)], [72, onDresser(880, -14)], [140, onDresser(860, -16)], [152, onDresser(846, -82)], [170, onDresser(846, -82)], [180, onDresser(890, -12)]]), shape: "pinch", elbow: "down" },
    armR: { target: keysV(t, [[0, onDresser(960, -8)], [70, onDresser(960, -8)], [82, onDresser(925, -70)], [104, onDresser(925, -70)], [116, onDresser(960, -8)]]), shape: "open", elbow: "down", behind: false },
  });
  const world = (
    <>
      <KitchenBack
        minutes={7 * 60 + 38 + f / 60}
        swing={keySwing(f)}
        dresserTop={
          <>
            {FOLDERS.map(([x, c], i) => (
              <Folder key={x} x={x} y={K.dresser.top + 2 - i * 3} color={c} lift={lifts(f, i)} rot={-lifts(f, i) * 0.4} w={150} />
            ))}
          </>
        }
      />
      <Actor uid="h-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[0, 0.6], [100, 0.5], [130, 0.65]])} pose={dadPose} role="father" seed={2} />
      <Actor uid="h-mom" look="mom" f={f} place={() => mom} face={(t) => keys(t, [[0, -0.6], [80, -0.7], [120, -0.55]])} pose={momPose} role="mother" seed={1} />
    </>
  );
  const cam = camKeys(f, [
    [0, HOOK_CAM],
    [30, { ...HOOK_CAM, zoom: 3.15 }],
    [118, WIDE_CAM],
    [freezeAt, { ...WIDE_CAM, zoom: 1.03 }],
  ]);
  // экранные точки ключей и родителей (камера WIDE_CAM)
  const scr = (x: number, y: number) => ({ x: 540 + (x - cam.x) * cam.zoom, y: 960 + (y - cam.y) * cam.zoom });
  const t = BG11_TEXT.freeze1;
  return (
    <FreezeLook f={fs} at={freezeAt}>
      <View cam={cam}>{world}</View>
      <FreezeTag f={fs} at={freezeAt + 4} x={360} y={560} text={t.keys} to={scr(K.hook.x + 26, K.hook.y + 120)} rot={-4} />
      <FreezeTag f={fs} at={freezeAt + 12} x={600} y={1480} text={t.parents} to={scr(815, 1210)} rot={3} size={46} />
    </FreezeLook>
  );
};

// Переход «лента»: предыдущая сцена-плитка уходит вверх, следующая
// поднимается снизу (как прокрутка социальной ленты), обе слегка
// уменьшаются и скругляются в движении — без резкой склейки.
import { clamp, easeInOut } from "../rig/motion";
import { View, type Cam, type Rect } from "../shots";

export const SWIPE = 18;

export const FeedSwipe: React.FC<{
  readonly f: number;
  readonly prev: React.ReactNode;
  readonly prevCam: Cam;
  readonly prevBg: string;
  readonly cam: Cam;
  readonly bg: string;
  readonly children: React.ReactNode;
}> = ({ f, prev, prevCam, prevBg, cam, bg, children }) => {
  const p = easeInOut(f / SWIPE);
  const squeeze = Math.sin(Math.PI * clamp(f / SWIPE));
  const s = 1 - 0.08 * squeeze;
  const r = 60 * squeeze;
  const rect = (dy: number): Rect => ({ x: (1080 * (1 - s)) / 2, y: (1920 * (1 - s)) / 2 + dy, w: 1080 * s, h: 1920 * s, r });
  const gap = 40 * squeeze;
  if (f >= SWIPE) {
    return (
      <View cam={cam} bg={bg}>
        {children}
      </View>
    );
  }
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#EEF2F8" }} />
      <View rect={rect(-1920 * p - gap)} cam={{ ...prevCam, s: prevCam.s * s }} bg={prevBg} shadow>
        {prev}
      </View>
      <View rect={rect(1920 * (1 - p) + gap)} cam={{ ...cam, s: cam.s * s }} bg={bg} shadow>
        {children}
      </View>
    </>
  );
};

// Сцена 1 (0–≈7 с): крупный план редактора. Жёлтая нить мысли «от руки»
// ведётся через строки кода к закрывающей скобке; камера следует за
// кончиком нити. Когда до скобки остаётся совсем чуть-чуть, сверху
// выезжает уведомление школы — нить рвётся, как ленточка: один конец
// провисает, другой падает, строки на миг дрожат. Камера отъезжает: окно
// целиком, обрывок висит, курсор одиноко мигает у скобки.
import { useCurrentFrame } from "remotion";
import { BRACE, Caret, CodeView, EditorWindow, PenTip, SnapSparks, Thread, threadAt, Toast } from "../editor";
import { anticipate, clamp, easeInOut, easeOut, keys } from "../rig/motion";
import { BG10_TEXT } from "../script";
import { ScreenCam } from "./common";

// Ключевые кадры (кадры сцены).
export const HOOK = { drawTo: 96, toast: 84, snap: 100, settle: 150 };
export const CUT_U = 0.78;
const TIP_MAX = 0.955;

// Доля нарисованной нити: неравномерно, как от руки (ускорения/замедления).
const drawn = (f: number) => {
  const t = clamp(f / HOOK.drawTo);
  const e = 0.06 + 0.94 * (0.5 * t + 0.5 * easeInOut(t));
  return TIP_MAX * clamp(e + 0.05 * Math.sin(t * Math.PI * 6) * t * (1 - t));
};

// Затухающая пружина: 0 → 1 с колебанием.
const spring = (t: number, tau = 9, w = 0.45) => (t <= 0 ? 0 : 1 - Math.exp(-t / tau) * Math.cos(w * t));

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const d = Math.min(drawn(f), TIP_MAX);
  const tip = threadAt(d);
  const ts = f - HOOK.snap;
  const snapped = ts >= 0;
  // камера: сначала близко за кончиком, после обрыва — общий план окна
  const follow = { cx: 540 + (tip.x - 540) * 0.75, cy: tip.y - 40, z: keys(f, [[0, 2.1], [HOOK.drawTo, 1.55]]) };
  const wide = { cx: 540, cy: 860, z: 0.96 };
  const u = easeInOut((f - HOOK.snap - 6) / 40);
  const cam = { cx: follow.cx + (wide.cx - follow.cx) * u, cy: follow.cy + (wide.cy - follow.cy) * u, z: follow.z + (wide.z - follow.z) * u };
  const shake = snapped && ts < 10 ? Math.sin(ts * 2.4) * (10 - ts) * 1.6 : 0;
  const glitch = snapped ? clamp(1 - ts / 9) : 0;
  const pieces = !snapped
    ? [{ a: 0, b: d }]
    : [
        // конец у начала нити: провисает к месту обрыва и покачивается
        { a: 0, b: CUT_U, sag: 70 * spring(ts, 10, 0.5), rot: -2 * spring(ts, 12, 0.4), pivot: "a" as const },
        // хвост у скобки: отлетает вниз, поворачивается и гаснет
        { a: CUT_U + 0.008, b: TIP_MAX, dy: 10 * ts + 0.5 * ts * ts, dx: 3 * ts, rot: 2.4 * ts, pivot: "b" as const, o: clamp(1 - ts / 26), sagA: 40 * spring(ts) },
      ];
  const toastK = easeOut((f - HOOK.toast) / 10);
  const pulse = clamp(1 - Math.abs(f - HOOK.snap) / 8);
  const cutP = threadAt(CUT_U);
  return (
    <>
      <ScreenCam cx={cam.cx} cy={cam.cy} z={cam.z} shake={shake}>
        <EditorWindow tabs={BG10_TEXT.editor.tabs} active={0}>
          <CodeView glitch={glitch} seed={3} />
          <Thread pieces={pieces} />
          {!snapped ? <PenTip p={tip} a={0.9} /> : null}
          <SnapSparks p={cutP} t={ts} />
          {snapped ? <Caret x={BRACE.x + 16} y={BRACE.y + 22} f={f} /> : null}
        </EditorWindow>
      </ScreenCam>
      {/* лёгкое затемнение после обрыва — фокус на уведомлении */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(31,45,85,1)", opacity: 0.08 * anticipate(clamp(ts / 20)) }} />
      <Toast k={toastK} pulse={pulse} />
    </>
  );
};

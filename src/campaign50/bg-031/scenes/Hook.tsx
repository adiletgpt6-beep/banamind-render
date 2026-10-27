// Сцена 1 (≈0–6 с): светлая кухня бишкекской квартиры (за окном —
// панельные дома двора). Мама за столом держит сложенный чек «1000 сом /
// бала» и спрашивает: «Миң сом — эмнеге төлөйм?». У угла чека
// отпечатывается штамп «?», сверху — «1000 СОМ — ЭМНЕ ҮЧҮН?» (в первые
// 3 с). Цена не подана как цена для всех: на чеке «/ бала», дальше ролик
// объясняет условия.
// Переход: камера «въезжает» в чек — следующая сцена начинается с него
// крупным планом.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { anticipate, easeIn, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { box, camMove } from "../../../two-schedules-2d/shots";
import { useLine, useScene } from "../context";
import { HELD, KITCHEN_CAM, KitchenShot, holdArms } from "../kitchen";
import { C } from "../palette";
import { R, ReceiptFront } from "../receipt";
import { BG31_TEXT } from "../script";
import { QuestionStamp, rise } from "../ui";

export const HK = { stamp: 22, title: 4 } as const;
// масштаб чека в руках (мир): ширина HELD.w
export const HELD_K = HELD.w / R.w;

// Верх сложенного чека (мир): чек поднимается к глазам с подготовкой.
const topAt = (t: number) => HELD.top + 26 - 26 * anticipate((t - 2) / 22);

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const l01 = useLine("l01");
  const push = frames - 28; // начало «въезда» в чек
  const k = HELD_K;
  const h = R.crease * k; // высота сложенного чека (мир)
  const top = topAt(f);
  const held = (
    <div style={box({ left: HELD.x - HELD.w / 2, top, width: R.w, height: R.h, transform: `scale(${k})`, transformOrigin: "0 0" })}>
      <ReceiptFront fold={1} shadow={0.6} />
    </div>
  );
  const pose = (t: number) => ({
    ...holdArms(HELD.x, HELD.handY + (topAt(t) - HELD.top), HELD.w),
    expr: t > l01.from - 4 && t < l01.to + 10 ? ("thinking" as const) : ("calm" as const),
    lookY: 0.6,
    headTilt: keys(t, [
      [l01.from, 0],
      [l01.to, -6],
    ]),
    lean: 4,
  });
  // камера: средний план → медленный наезд → «въезд» в чек
  const base = camMove(f, 0, push, { ...KITCHEN_CAM, zoom: KITCHEN_CAM.zoom - 0.12 }, KITCHEN_CAM);
  const zin = easeIn((f - push) / 28);
  const cy = top + h / 2;
  const cam = {
    x: base.x,
    y: base.y + (cy - base.y) * easeInOut((f - push) / 28),
    zoom: base.zoom * (1 + 1.55 * zin),
  };
  const stampP = (f - HK.stamp) / 8;
  // штамп — у верхнего правого угла чека (в кадре), не на лице и руках
  const sx = 540 + (HELD.x + HELD.w / 2 + 34 - cam.x) * cam.zoom;
  const sy = 960 + (top - 4 - cam.y) * cam.zoom;
  const [hookA, hookB] = BG31_TEXT.hook.title.split(" — ");
  return (
    <KitchenShot
      f={f}
      from={0}
      to={frames}
      cam={cam}
      pose={pose}
      face={() => 0.04}
      held={held}
      overlay={
        <>
          <div style={{ opacity: 1 - easeOut((f - (push - 12)) / 10) }}>
            <QuestionStamp x={sx} y={sy} r={74} p={Math.max(0, Math.min(1, stampP))} text={BG31_TEXT.hook.stamp} />
          </div>
          {/* заголовок-хук в безопасной зоне */}
          <div
            style={{
              position: "absolute",
              left: 90,
              right: 150,
              top: 268,
              textAlign: "center",
              fontFamily,
              fontWeight: 1000,
              fontSize: 82,
              lineHeight: 1.08,
              color: C.navy,
              ...rise(f, HK.title, 10, 30),
              opacity: easeOut((f - HK.title) / 10) * (1 - easeOut((f - (push - 12)) / 10)),
            }}
          >
            <span style={{ display: "inline-block", padding: "14px 30px 18px", borderRadius: 30, backgroundColor: "rgba(255,255,255,0.93)", boxShadow: "0 14px 34px rgba(20,40,90,0.16)" }}>
              <span style={{ backgroundColor: C.yellow, borderRadius: 16, padding: "0 12px" }}>{hookA}</span> —<br />
              {hookB}
            </span>
          </div>
        </>
      }
    />
  );
};

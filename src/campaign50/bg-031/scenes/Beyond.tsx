// Сцена 4 (≈32–46 с): мама переворачивает чек (средний план на кухне).
// Крупно — оборот: линейка продолжается. «Эгер аралык жети чакырымдан
// ашса…» — бумага разматывается дальше 7 км, зона «7 кмден ашса — башка
// тариф» (без цифр других тарифов — их объясняет пилот BG-032); бумага
// обрывается на 20 км: «Максималдуу аралык — 20 км». «Ошондуктан даректи
// так көрсөтүү керек» — метка «үй» находит точное место на линейке, внизу
// строка сайта: «Так аралык жана баа дарек текшерилгенден кийин
// тастыкталат».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { box, Shot } from "../../../two-schedules-2d/shots";
import { useLine, useWordAt } from "../context";
import { HELD, KITCHEN_CAM, KitchenShot, holdArms } from "../kitchen";
import { C } from "../palette";
import { B, R, ReceiptBack, ReceiptFront } from "../receipt";
import { BG31_TEXT } from "../script";
import { Cut, Paper, rise, TableTop } from "../ui";

export const BY = { flip0: 14, flip1: 40, cut: 58 } as const;
const BACK = { x: 170, y: 286 } as const;

export const BeyondScene: React.FC = () => {
  const f = useCurrentFrame();
  const n04 = useLine("n04");
  const wSeven = useWordAt("n04", 2);
  const wOver = useWordAt("n04", 4);
  const wOther = useWordAt("n04", 6);
  const wCalc = useWordAt("n04", 9);
  const wSo = useWordAt("n04", 10);
  const wAddr = useWordAt("n04", 11);
  const wExact = useWordAt("n04", 12);
  const wShow = useWordAt("n04", 13);
  // переворот чека в руках вокруг горизонтальной оси (руки держат края
  // на одной высоте): 0 — лицом, 1 — оборотом
  const flip = easeInOut((f - BY.flip0) / (BY.flip1 - BY.flip0));
  const cosA = Math.cos(flip * Math.PI);
  const k = HELD.w / R.w;
  const top = HELD.top;
  const held = (
    <div style={box({ left: HELD.x - HELD.w / 2, top, width: HELD.w, height: R.h * k, transform: `scaleY(${Math.max(0.03, Math.abs(cosA))})`, transformOrigin: `50% ${HELD.handY - top}px` })}>
      <div style={box({ left: 0, top: 0, width: R.w, height: R.h, transform: `scale(${k})`, transformOrigin: "0 0" })}>
        {cosA > 0 ? (
          <ReceiptFront fold={0} shadow={0.6} top={{ note: 1 }} />
        ) : (
          <Paper w={R.w} h={R.h} color={C.paperBack} shadow={0.6}>
            <ReceiptBack unroll={0} over={0} max={0} />
          </Paper>
        )}
      </div>
    </div>
  );
  const pose = (t: number) => ({
    ...holdArms(HELD.x, HELD.handY, HELD.w),
    expr: t > BY.flip1 ? ("surprised" as const) : ("thinking" as const),
    lookY: 0.5,
    lean: 4,
  });
  // оборот крупно
  const unroll = easeInOut((f - wOver + 4) / 40);
  const over = easeOut((f - wOther) / 12);
  const max = easeOut((f - wCalc + 6) / 12);
  const pinKm = f < wSo ? null : keys(f, [
    [wSo, 2],
    [wAddr + 4, 13],
    [wExact + 2, 9.4],
  ]);
  const pinDrop = easeOut((f - wExact - 4) / 8);
  const zoomIn = easeInOut((f - wSeven) / 30) - easeInOut((f - wCalc) / 30);
  // после реплики: метка «үй» мягко пульсирует, камера медленно наезжает
  const tail = easeInOut((f - n04.to - 6) / 110);
  const pulse = f > n04.to ? 0.5 - 0.5 * Math.cos(((f - n04.to) / 26) * Math.PI * 2) : 0;
  return (
    <>
      <KitchenShot f={f} from={0} to={BY.cut + 10} cam={{ ...KITCHEN_CAM, y: KITCHEN_CAM.y + 40, zoom: KITCHEN_CAM.zoom - 0.1 }} pose={pose} held={held} />
      <Cut f={f} from={BY.cut} to={100000} fade={10}>
        <Shot f={f} from={0} to={100000} cam={{ x: 540 - 30 * tail, y: 960 + 40 * zoomIn - 40 * tail, zoom: 1 + 0.04 * zoomIn + 0.07 * tail }} bg="#F3ECE0">
          <div style={{ position: "absolute", left: -600, top: -400, width: 2280, height: 2720 }}>
            <TableTop />
          </div>
          <div style={{ position: "absolute", left: BACK.x, top: BACK.y }}>
            <ReceiptBack unroll={unroll} over={over} max={max} pinKm={pinKm} pinDrop={pinDrop} pinPulse={pulse} />
          </div>
        </Shot>
        {/* строка сайта о проверке адреса — над зоной субтитров */}
        <div
          style={{
            position: "absolute",
            left: 110,
            right: 170,
            top: BACK.y + B.h + 24,
            textAlign: "center",
            fontFamily,
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.22,
            color: C.ink,
            ...rise(f, wShow, 12, 18),
            opacity: clamp(easeOut((f - wShow) / 12)) * (f > n04.from ? 1 : 0),
          }}
        >
          {BG31_TEXT.beyond.address}
        </div>
      </Cut>
    </>
  );
};

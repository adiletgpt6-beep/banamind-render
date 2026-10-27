// Сцена 2 (≈6–19 с): крупный план чека на столе. Рука мамы вытягивает
// сложенную нижнюю половину — чек раскрывается по складке. По словам
// диктора («…мектептин аралыгы бир тарапка жети чакырымга чейин болгон
// сапардын баасы») на левом крае чека появляется линейка «мектеп → үй»:
// одна стрелка (в одну сторону), деления до 7 км, жёлтая зона 0–7 км;
// маркер выделяет «7 кмге чейин», цена «1000 сом / бала» подсвечивается.
import { useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { camMove, Shot } from "../../../two-schedules-2d/shots";
import { CarTopView } from "../../../components/CarTopView";
import { useLine, useWordAt } from "../context";
import { flapAngle, kmY, R, ReceiptFront } from "../receipt";
import { MacroHand, TableTop } from "../ui";

// Положение чека на столе (кадр при камере 1:1).
export const MACRO = { x: 170, y: 290 } as const;
// Камера макроплана: стол 1:1 с кадром (чек — в безопасной зоне над субтитрами).
export const MACRO_CAM = { x: 540, y: 960, zoom: 1 } as const;
export const UF = { handIn: 8, grip: 24, open0: 28, open1: 66, handOut: 70 } as const;

// Параметры появления линейки по словам реплики n02.
export const useRulerState = () => {
  const f = useCurrentFrame();
  const wSchool = useWordAt("n02", 3);
  const wOne = useWordAt("n02", 5);
  const wSeven = useWordAt("n02", 7);
  const wKm = useWordAt("n02", 8);
  const wPrice = useWordAt("n02", 11);
  return {
    ruler: easeOut((f - wSchool + 4) / 12),
    arrow: easeInOut((f - wOne) / 20),
    count: easeInOut((f - wSeven + 2) / 16),
    marker: easeOut((f - wKm) / 14),
    bracket: easeOut((f - wPrice + 2) / 14),
    glow: easeOut((f - wPrice) / 10),
    pulse: Math.sin(clamp((f - wPrice) / 14) * Math.PI),
  };
};

export const UnfoldScene: React.FC = () => {
  const f = useCurrentFrame();
  const st = useRulerState();
  const fold = 1 - easeInOut((f - UF.open0) / (UF.open1 - UF.open0));
  const a = flapAngle(fold);
  // свободный край нижней половины (кадр): пока она за верхом — у сгиба
  const crease = MACRO.y + R.crease;
  const edgeY = crease + (R.h - R.crease) * Math.max(0, Math.cos((a * Math.PI) / 180));
  // рука входит справа (предплечье горизонтально, выше зоны субтитров),
  // берёт край сложенной половины и тянет его вниз
  const handX = 690;
  const HAND_MAX_Y = 1290;
  const hand = keysV(f, [
    [UF.handIn, { x: 1240, y: crease + 6 }],
    [UF.grip, { x: handX, y: crease + 6 }],
  ]);
  const holding = f >= UF.grip && f <= UF.handOut;
  const tip =
    f < UF.grip
      ? hand
      : holding
        ? { x: handX, y: Math.min(HAND_MAX_Y, Math.max(crease + 6, edgeY - 14)) }
        : keysV(f, [
            [UF.handOut, { x: handX, y: HAND_MAX_Y }],
            [UF.handOut + 20, { x: 1300, y: HAND_MAX_Y }],
          ]);
  const grip = keys(f, [
    [UF.grip - 4, 0],
    [UF.grip + 2, 1],
    [UF.handOut - 2, 1],
    [UF.handOut + 6, 0],
  ]);
  // после реплики: маленькая белая машина проезжает по линейке от мектеп
  // до үй — одно направление, до 7 км; камера мягко приближается к линейке
  const n02 = useLine("n02");
  const drive0 = n02.to + 8;
  const drive1 = drive0 + 72;
  const drive = easeInOut((f - drive0) / (drive1 - drive0));
  const carOn = f >= drive0 - 6;
  const carY = MACRO.y + kmY(0) + (kmY(7) - kmY(0)) * drive;
  const arrived = easeOut((f - drive1) / 10) * (1 - easeOut((f - drive1 - 24) / 14));
  // камера: продолжение «въезда» из хука → общий план чека → наезд на линейку
  const cam =
    f < 26
      ? camMove(f, 0, 26, { x: 540, y: MACRO.y + 260, zoom: 1.32 }, MACRO_CAM)
      : f < drive0 - 10
        ? camMove(f, 70, 330, MACRO_CAM, { x: 540, y: 960, zoom: 1.02 })
        : camMove(f, drive0 - 10, drive1 + 20, { x: 540, y: 960, zoom: 1.02 }, { x: 520, y: 1010, zoom: 1.09 });
  return (
    <Shot f={f} from={0} to={100000} cam={cam} bg="#F3ECE0">
      <div style={{ position: "absolute", left: -600, top: -400, width: 2280, height: 2720 }}>
        <TableTop />
      </div>
      <div style={{ position: "absolute", left: MACRO.x, top: MACRO.y }}>
        <ReceiptFront
          fold={fold}
          top={{ glow: st.glow, pulse: st.pulse, note: st.marker }}
          bottom={{ ruler: st.ruler, arrow: st.arrow, count: st.count, marker: st.marker, bracket: st.bracket }}
        />
      </div>
      {carOn ? (
        <div style={{ position: "absolute", left: MACRO.x + R.rulerX - 21, top: carY - 37, width: 42, height: 74, opacity: easeOut((f - (drive0 - 6)) / 6), transform: "rotate(180deg)" }}>
          <CarTopView size={74} />
        </div>
      ) : null}
      {arrived > 0 ? <div style={{ position: "absolute", left: MACRO.x + R.rulerX - 46, top: MACRO.y + kmY(7) - 46, width: 92, height: 92, borderRadius: 46, border: `6px solid rgba(255,201,14,${0.9 * arrived})`, transform: `scale(${0.6 + 0.6 * arrived})` }} /> : null}
      {f < UF.handOut + 22 ? <MacroHand x={tip.x} y={tip.y} angle={-90} grip={grip} s={1.1} /> : null}
    </Shot>
  );
};

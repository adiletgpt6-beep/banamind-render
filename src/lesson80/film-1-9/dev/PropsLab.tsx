// Служебная композиция Lesson80-1-9-PropsLab (проверка рисунков до постановки).
// Весь реквизит стоит на местах из layout.ts в комнате; планы по кадрам:
//   0–59    общий план;
//   60–119  столик крупно: тарелки, салфетки, вода; Юсуф «берёт» дольку
//           (гнездо 0 пустеет, долька поднимается из того же места); в
//           воздухе — долька целая и надкушенная, салфетка в пальцах;
//   120–179 поднос очень крупно: стопка 2 → 1 → 0, верхняя салфетка
//           поднимается с trayTop и выпрямляется;
//   180–239 тарелки учеников на дастарханах;
//   240–299 полка с Кораном и подоконник.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { nestingBirdPose } from "../../bird/birdPose";
import { Shot, type Cam } from "../../core/shots";
import { GlobeOnFloor, LampAside, Table } from "../../film-1-8/set";
import { CurtainLayer } from "../../film-1-7/set";
import { RoomBack } from "../../sets/Classroom";
import {
  BG_NAPKIN_W,
  BG_PLATE_DY,
  BG_PLATE_W,
  CLOTHS,
  CUPS,
  JUG,
  NAPKIN_AT,
  NAPKIN_W,
  PLATE_W,
  PLATES,
  QURAN_SHELF,
  ROWS,
  SILL_ITEMS,
  SILL_Y,
  TRAY_ON_TABLE,
  TRAY_W,
} from "../layout";
import { AppleSlice, CupView, Dastarkhan, JugView, NapkinView, napkinGrip, PlateView, plateSlot, QuranOnShelf, SillDisplay, sliceW, TrayView, trayTop } from "../props";

const CAMS: readonly { from: number; to: number; cam: Cam; label: string }[] = [
  { from: 0, to: 60, cam: { x: 1700, y: 960, zoom: 0.95 }, label: "общий план" },
  { from: 60, to: 120, cam: { x: 2060, y: 1250, zoom: 2.6 }, label: "столик крупно" },
  { from: 120, to: 180, cam: { x: 2030, y: 1270, zoom: 4 }, label: "поднос: 2 → 1 → 0" },
  { from: 180, to: 240, cam: { x: 900, y: 1180, zoom: 1.4 }, label: "тарелки на дастарханах" },
  { from: 240, to: 300, cam: { x: 1900, y: 560, zoom: 1.4 }, label: "полка и подоконник" },
];

// Ученики по рядам (сколько тарелок на каждом дастархане).
const PER_ROW = { A: 7, B: 8, C: 7 } as const;

const FloorRow: React.FC<{ readonly row: "A" | "B" | "C" }> = ({ row }) => {
  const c = CLOTHS.find((k) => k.row === row)!;
  const n = PER_ROW[row];
  const step = (c.x2 - c.x1) / n;
  return (
    <>
      <Dastarkhan x1={c.x1} x2={c.x2} y={c.y} uid={`lab-dk-${row}`} />
      {Array.from({ length: n }, (_, i) => {
        const px = c.x1 + step * (i + 0.5);
        const py = ROWS[row] + BG_PLATE_DY;
        // часть уже съела по дольке; у части салфетка уже лежит рядом
        const slices = [i % 3 !== 1, true, i % 4 !== 2, i % 5 !== 3];
        return (
          <div key={i}>
            {i % 2 === 0 ? <NapkinView x={px + 46} y={py + 1} w={BG_NAPKIN_W} rot={(i % 3) * 6 - 6} flat={1} /> : null}
            <PlateView x={px} y={py} w={BG_PLATE_W} slices={slices} uid={`lab-${row}${i}`} />
          </div>
        );
      })}
    </>
  );
};

const World: React.FC<{ readonly f: number }> = ({ f }) => {
  // гнездо 0 у Юсуфа пустеет на кадре 75 — долька поднимается из того же места
  const pick = f >= 75 && f < 120;
  const ySlot = plateSlot(PLATES.yusuf.x, PLATES.yusuf.y, PLATE_W, 5, 0);
  const lift = pick ? Math.min(60, (f - 75) * 2.2) : 0;
  const trayCount = f < 120 ? 22 : f < 140 ? 2 : f < 160 ? 1 : 0;
  // верхняя салфетка (из стопки в 2) поднимается и выпрямляется
  const nTop = trayTop(TRAY_ON_TABLE.x, TRAY_ON_TABLE.y, TRAY_W, 2);
  const u = f >= 140 && f < 180 ? Math.min(1, (f - 140) / 24) : -1;
  const liftFlat = 1 - u;
  const grip0 = napkinGrip(NAPKIN_W, nTop.rot, 1);
  const gripPt = { x: nTop.x + grip0.x + 18 * u, y: nTop.y + grip0.y - 46 * u };
  const g1 = napkinGrip(NAPKIN_W, nTop.rot * liftFlat, liftFlat);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      <CurtainLayer curtain={0} />
      <LampAside />
      <QuranOnShelf x={QURAN_SHELF.x} y={QURAN_SHELF.y} w={QURAN_SHELF.w} />
      <SillDisplay boatX={SILL_ITEMS.boat.x} folderX={SILL_ITEMS.folder.x} folderW={SILL_ITEMS.folder.w} y={SILL_Y} />
      <FloorRow row="C" />
      <FloorRow row="B" />
      <FloorRow row="A" />
      <Table />
      {/* на столике: салфетки → поднос → тарелки → вода */}
      <NapkinView x={NAPKIN_AT.amir.x} y={NAPKIN_AT.amir.y} w={NAPKIN_W} rot={-4} flat={1} />
      <NapkinView x={NAPKIN_AT.bilal.x} y={NAPKIN_AT.bilal.y} w={NAPKIN_W} rot={3} flat={1} />
      <NapkinView x={NAPKIN_AT.yusuf.x} y={NAPKIN_AT.yusuf.y} w={NAPKIN_W} rot={6} flat={1} />
      <TrayView x={TRAY_ON_TABLE.x} y={TRAY_ON_TABLE.y} w={TRAY_W} count={trayCount} uid="lab-tray" />
      <PlateView x={PLATES.amir.x} y={PLATES.amir.y} w={PLATE_W} slices={[true, false, true, true]} uid="lab-amir" />
      <PlateView x={PLATES.bilal.x} y={PLATES.bilal.y} w={PLATE_W} slices={[true, true, true, true]} uid="lab-bilal" />
      <PlateView x={PLATES.yusuf.x} y={PLATES.yusuf.y} w={PLATE_W} slices={[!pick, true, true, true, true]} uid="lab-yusuf" />
      <JugView x={JUG.x} y={JUG.y} h={JUG.h} />
      {CUPS.map((c, i) => (
        <CupView key={i} x={c.x} y={c.y} h={c.h} />
      ))}
      <GlobeOnFloor />
      {/* «в руках»: поднятая долька из гнезда 0, демонстрация укуса и салфетки в пальцах */}
      {pick ? <AppleSlice x={ySlot.x} y={ySlot.y - lift} w={sliceW(PLATE_W)} rot={ySlot.rot * (1 - lift / 60)} bite={0} /> : null}
      {f >= 60 && f < 120 ? (
        <>
          <AppleSlice x={1880} y={1180} w={sliceW(PLATE_W)} rot={-12} bite={0} />
          <AppleSlice x={1930} y={1180} w={sliceW(PLATE_W)} rot={-12} bite={1} />
          <AppleSlice x={1980} y={1180} w={sliceW(PLATE_W)} rot={30} bite={1} biteEnd={-1} />
          <NapkinView x={2240} y={1170} w={NAPKIN_W} rot={0} flat={0} />
          <NapkinView x={2330} y={1180} w={NAPKIN_W} rot={-8} flat={0.5} />
        </>
      ) : null}
      {u >= 0 ? <NapkinView x={gripPt.x - g1.x} y={gripPt.y - g1.y} w={NAPKIN_W} rot={nTop.rot * liftFlat} flat={liftFlat} /> : null}
      {u >= 0 ? (
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <circle cx={gripPt.x} cy={gripPt.y} r={0.8} fill="#D9534F" />
        </svg>
      ) : null}
    </>
  );
};

export const PropsLab: React.FC = () => {
  const f = useCurrentFrame();
  const cur = CAMS.find((c) => f >= c.from && f < c.to) ?? CAMS[0];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F1E7D6" }}>
      {CAMS.map((c) => (
        <Shot key={c.from} f={f} from={c.from} to={c.to} cam={c.cam} bg="#F1E7D6">
          <World f={f} />
        </Shot>
      ))}
      <div style={{ position: "absolute", left: 24, top: 18, padding: "4px 12px", borderRadius: 8, backgroundColor: "rgba(30,42,68,0.7)", color: "#FFF", fontFamily, fontSize: 22, fontWeight: 700 }}>
        PropsLab · {cur.label} · кадр {f}
      </div>
    </div>
  );
};

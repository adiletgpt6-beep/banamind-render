// Проверка реквизита 80-1-11 (только для разработки): комната, дверь
// (открывается и закрывается, Амир стоит в проёме), плакат, полочка с
// Кораном, столик для ростка с поддоном, поднос с кувшином и чашкой, полив
// из чашки, столик с папкой и карточками, кувшин наливает в чашку, книги,
// тетрадь, сумка. Камера сменяет планы по диапазонам кадров.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { nestingBirdPose } from "../../bird/birdPose";
import { pupilById, heightForAge } from "../../characters/characterConfig";
import { SceneContext } from "../../core/context";
import { Shot, type Cam } from "../../core/shots";
import { PaperBoat } from "../../film-1-7/set";
import { Pencil } from "../../film-1-8/drawings";
import { Table } from "../../film-1-8/set";
import { Actor, type Place } from "../../rig/Actor";
import { clamp, easeInOut } from "../../rig/motion";
import { RoomBack, Sprout } from "../../sets/Classroom";
import { BAG_SPOT, BOAT, CARDS, CUP_HOME, CUP_ON_TABLE, DOOR_CX, FOLDER, JUG, PENCIL, POT, SAUCER, TEACHER_BOOK, TRAY } from "../layout";
import {
  Bag,
  CardStack,
  ClosedFolder,
  Cup,
  cupLip,
  DoorCasing,
  DoorOpening,
  DoorPanel,
  HeldBook,
  Jug,
  jugSpout,
  LyingBook,
  Notebook,
  OpenBook,
  PlantTable,
  Poster,
  QuranShelf,
  Saucer,
  Stream,
  Tray,
} from "../props";

const amir = pupilById("amir");

// Планы: общий → доска/плакат/дверь → столик с ростком → столик с папкой.
const camAt = (f: number): Cam =>
  f < 60 ? { x: 1300, y: 800, zoom: 0.74 } : f < 120 ? { x: 700, y: 560, zoom: 1.3 } : f < 220 ? { x: 2200, y: 760, zoom: 2.6 } : { x: 2080, y: 1290, zoom: 2.4 };

// Полив: край чашки при наибольшем наклоне — левее и выше земли, под листом.
const POUR_TILT = 75;
const POUR_LIP = { x: 2106, y: 700 };
const lip0 = cupLip({ x: 0, y: 0, tilt: POUR_TILT, scale: 1 });
const POUR_CUP = { x: POUR_LIP.x - lip0.x, y: POUR_LIP.y - lip0.y };

// Кувшин наливает в чашку на столике: носик — правее и выше устья чашки.
const JUG_POUR_TILT = -55;
const sp0 = jugSpout({ x: 0, y: 0, tilt: JUG_POUR_TILT, scale: 1 });
const JUG_AIR = { x: CUP_ON_TABLE.x + 24 - sp0.x, y: CUP_ON_TABLE.y - 46 - 30 - sp0.y };

export const PropsCheck: React.FC = () => {
  const f = useCurrentFrame();
  const door = easeInOut(clamp(f / 90)) * (1 - easeInOut(clamp((f - 200) / 80)));
  // полив ростка из чашки (кадры 120–220)
  const tilt = POUR_TILT * easeInOut(clamp((f - 120) / 100));
  const fill = 0.7 * (1 - clamp((f - 140) / 80));
  const pour = clamp((tilt - 25) / 8) * clamp(fill / 0.12);
  // чашка на подносе наполняется (проверка горизонтальной воды в устье)
  const homeFill = 0.95 * clamp((f - 125) / 85);
  // кувшин наливает в чашку на столике (кадры 220–299)
  const jt = JUG_POUR_TILT * easeInOut(clamp((f - 222) / 14));
  const tableFill = 0.85 * clamp((f - 236) / 55);
  const jugPour = clamp((-jt - 38) / 10) * (tableFill < 0.85 ? 1 : 0);
  const amirPlace = (): Place => ({ x: DOOR_CX + 14, y: 1004, h: heightForAge(8) * 0.99 });
  return (
    <SceneContext.Provider value={{ from: 0, len: 300 }}>
      <AbsoluteFill>
        <Shot f={f} from={0} to={10000} cam={camAt(f)} bg="#F1E7D6">
          <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} sprout={false} />
          {/* дверь: коридор → Амир в проёме → наличник → полотно */}
          <DoorOpening />
          <Actor uid="a" look={amir.look} f={f} place={amirPlace} face={() => 0.3} pose={() => ({})} seed={12} />
          <DoorCasing />
          <DoorPanel open={door} />
          <Poster />
          <QuranShelf />
          {/* столик с ростком, поднос, кувшин, чашка */}
          <PlantTable />
          <Saucer x={SAUCER.x} y={SAUCER.y} />
          <Sprout x={POT.x} y={POT.base} />
          <Tray x={TRAY.x} y={TRAY.y} w={TRAY.w} />
          <Jug x={JUG.x} y={JUG.y} />
          <Cup x={CUP_HOME.x} y={CUP_HOME.y} fill={homeFill} />
          {/* полив: чашка наклоняется, струйка от края к земле */}
          <Cup x={POUR_CUP.x} y={POUR_CUP.y} tilt={tilt} fill={fill} shadow={0} />
          {tilt > 25 && fill > 0 ? <Stream from={cupLip({ x: POUR_CUP.x, y: POUR_CUP.y, tilt, scale: 1 })} to={{ x: POT.x, y: POT.soilY }} amount={pour} t={f} /> : null}
          {/* вещи Амира на ковре и в руке у двери */}
          <Bag x={BAG_SPOT.x} y={BAG_SPOT.y} state="down" />
          <Bag x={DOOR_CX + 64} y={792} state="carried" swing={4 * Math.sin(f / 9)} />
          {/* столик учителя */}
          <Table />
          <ClosedFolder x={FOLDER.x} y={FOLDER.y} w={FOLDER.w} />
          <CardStack x={CARDS.x} y={CARDS.y} w={CARDS.w} count={4 - Math.floor(clamp((f - 230) / 60) * 3)} />
          <Pencil x={PENCIL.x} y={PENCIL.y} angle={PENCIL.angle} />
          <LyingBook x={TEACHER_BOOK.x} y={TEACHER_BOOK.y} w={TEACHER_BOOK.w} />
          <PaperBoat x={BOAT.x} y={BOAT.y} />
          <Cup x={CUP_ON_TABLE.x} y={CUP_ON_TABLE.y} fill={tableFill} />
          <Jug x={JUG_AIR.x} y={JUG_AIR.y} tilt={jt} shadow={0} />
          {jugPour > 0 ? <Stream from={jugSpout({ x: JUG_AIR.x, y: JUG_AIR.y, tilt: jt, scale: 1 })} to={{ x: CUP_ON_TABLE.x + 3, y: CUP_ON_TABLE.y - 44 }} amount={jugPour} t={f} width={3.4} /> : null}
          {/* книги, тетрадь и сумка на ковре перед столиком */}
          <OpenBook x={1800} y={1440} w={120} flip={clamp((f - 240) / 45)} color="#3F6E9E" />
          <Notebook x={1960} y={1452} w={92} progress={clamp((f - 225) / 70)} />
          <Bag x={2250} y={1470} state="down" />
          <Bag x={1730} y={1130} state="carried" />
          <HeldBook x={2390} y={1170} w={64} open={easeInOut(clamp((f - 230) / 30))} angle={-4} />
        </Shot>
        <div style={{ position: "absolute", left: 20, top: 20, fontSize: 40, color: "#000" }}>{f}</div>
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};

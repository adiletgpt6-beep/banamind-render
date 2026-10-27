// Сцена 15. Фотография на память. Учительница стоит сбоку и поднимает
// телефон (снимок делается с её стороны, не с невозможной точки). Папа и
// Эмир у модели улыбаются в камеру. Затем на светлой карточке появляется
// готовый снимок — тот же состав и одежда; позже он висит дома.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeOut, keys } from "../rig/motion";
import { box, Paper, Shot, Svg, useScene } from "../kit";
import { C } from "../theme";
import { PhotoArt } from "../props/ClassPhoto";
import { BridgeSide } from "../props/Bridge";
import { CLASS, ClassroomBack, DemoTable } from "../sets/School";
import { CLASS_BRIDGE } from "./Class";
import { H } from "./common";

export const PHOTO_CARD = { x: 540, y: 900, w: 860 } as const;
const CARD_AT = 50;

const DAD: Place = { x: 480, y: CLASS.floorY, h: H.dad };
const EMIR: Place = { x: 660, y: CLASS.floorY, h: H.boy };
const TEACHER: Place = { x: 1010, y: 1700, h: 880 };

export const PhotoScene: React.FC = () => {
  const { f } = useScene("photo");
  const k = easeOut(clamp((f - CARD_AT) / 12));
  const raise = keys(f, [[0, 0], [14, 1]]);
  return (
    <AbsoluteFill>
      <Shot f={f} cam={{ x: 640, y: 1150, zoom: 1.4 }} bg="#EFEDE4">
        <ClassroomBack />
        <Actor uid="p15-dad" look="azamat" f={f} place={() => DAD} face={() => 0.1} pose={() => ({ expr: { browIn: 2, browOut: 3, lid: 0.15, smile: 0.85 }, lookX: 0.5, armL: { target: { x: 420, y: 1250 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 540, y: 1252 }, shape: "relax", elbow: "down", behind: false } })} seed={2} layer="body" />
        <Actor uid="p15-emir" look="emir" f={f} place={() => EMIR} face={() => 0.15} pose={() => ({ expr: { browIn: 2, browOut: 3, lid: 0.1, smile: 0.95 }, lookX: 0.5, packOff: true, armL: { target: { x: 625, y: 1255 }, elbow: "down", behind: false }, armR: { target: { x: 700, y: 1255 }, elbow: "down", behind: false } })} seed={4} blinkShift={37} layer="body" />
        <DemoTable />
        <Svg>
          <BridgeSide g={CLASS_BRIDGE} mode="folded" sag={0} carX={CLASS_BRIDGE.cx} carLen={62} />
        </Svg>
        <Actor uid="p15-dad" look="azamat" f={f} place={() => DAD} face={() => 0.1} pose={() => ({ expr: "smile", armL: { target: { x: 420, y: 1250 }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 540, y: 1252 }, shape: "relax", elbow: "down", behind: false } })} seed={2} layer="arms" />
        <Actor uid="p15-emir" look="emir" f={f} place={() => EMIR} face={() => 0.15} pose={() => ({ expr: "smile", armL: { target: { x: 625, y: 1255 }, elbow: "down", behind: false }, armR: { target: { x: 700, y: 1255 }, elbow: "down", behind: false } })} seed={4} blinkShift={37} layer="arms" />
        <Actor
          uid="p15-teacher"
          look="mugalim"
          f={f}
          place={() => TEACHER}
          face={() => -0.7}
          pose={() => ({ expr: "softSmile", lookX: -0.2, armR: { target: { x: 960 - raise * 40, y: 1250 - raise * 300 }, shape: "phone", item: "phone", itemColor: "#2A2D36", glow: 0, elbow: "down", behind: false }, armL: { target: { x: 990 - raise * 40, y: 1260 - raise * 270 }, shape: "relax", elbow: "down" } })}
          seed={8}
        />
      </Shot>
      {f >= CARD_AT ? (
        <AbsoluteFill style={{ opacity: k }}>
          <Paper color={C.paper} />
          <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
            <g transform={`translate(${PHOTO_CARD.x} ${PHOTO_CARD.y + (1 - k) * 60}) rotate(${-2 * k})`}>
              <PhotoArt w={PHOTO_CARD.w} uid="p15" />
            </g>
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

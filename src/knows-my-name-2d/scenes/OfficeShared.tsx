// Офис мамы — общие планы сцен 4, 5, 7: обсуждение у экрана, стол мамы
// (ноутбук крышкой к зрителю, открытый блокнот, лампа), блокнот сверху.
import { Actor, type PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { box, Shot, Svg } from "../kit";
import { C, F, TINT } from "../theme";
import { GuestChair, GuestSeat, MOM_OFFICE, MomChairBack, MomDesk, MomOfficeBack, NotebookOnDesk } from "../sets/MomOffice";
import { H, HANDS, seatOf } from "./common";

const O = MOM_OFFICE;

// Обсуждение: мама у экрана, двое коллег сидят лицом к ней.
export const MeetingWide: React.FC<{
  readonly f: number;
  readonly cam: { x: number; y: number; zoom: number };
  readonly clock: [number, number];
  readonly mom: { x: number; pose: (t: number) => PoseIn; face: (t: number) => number; seated?: boolean };
  readonly colleagueTalk?: (t: number) => number; // 0…1 — коллега говорит (жест)
  readonly tint?: string;
}> = ({ f, cam, clock, mom, colleagueTalk, tint = TINT.cool }) => {
  const talk = colleagueTalk ?? (() => 0);
  return (
    <Shot f={f} cam={cam} bg={C.wallOffice}>
      <MomOfficeBack h={clock[0]} m={clock[1]} />
      {O.chairs.map((x, i) => (
        <GuestChair key={x} x={x} color={i ? C.orange : C.blue} />
      ))}
      <Actor uid="of-cw" look="colleagueW" f={f} place={() => ({ x: O.chairs[0], y: O.floorY, h: H.colleague * 0.97 })} face={() => -0.45} pose={(t) => ({ sit: 1, seat: seatOf(H.colleague) + 6, expr: "calm", lookY: 0.05, armL: { target: { x: O.chairs[0] - 40, y: O.floorY - 260 }, elbow: "down" }, armR: { target: { x: O.chairs[0] + 40, y: O.floorY - 262 }, elbow: "down", shape: "relax" }, nod: 2 * Math.sin(t / 26) })} seed={11} blinkShift={9} />
      <Actor
        uid="of-cm"
        look="colleagueM"
        f={f}
        place={() => ({ x: O.chairs[1], y: O.floorY, h: H.colleague })}
        face={() => -0.5}
        pose={(t) => {
          const k = talk(t);
          return { sit: 1, seat: seatOf(H.colleague) + 6, expr: k > 0.3 ? "smile" : "calm", armL: { target: { x: O.chairs[1] - 60 - 60 * k, y: O.floorY - 270 - 120 * k + 10 * Math.sin(t / 5) * k }, elbow: "down", shape: k > 0.3 ? "open" : "relax" }, armR: { target: { x: O.chairs[1] + 40, y: O.floorY - 262 }, elbow: "down" }, nod: 3 * k * Math.sin(t / 7) };
        }}
        seed={13}
        blinkShift={41}
      />
      {O.chairs.map((x, i) => (
        <GuestSeat key={x} x={x} color={i ? C.orange : C.blue} />
      ))}
      {mom.seated ? null : <Actor uid="of-mom" look="km2Mom" f={f} place={() => ({ x: mom.x, y: O.floorY + 6, h: H.mom })} face={mom.face} pose={mom.pose} seed={5} />}
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: tint })} />
    </Shot>
  );
};

// Стол мамы спереди: мама сидит, ноутбук крышкой к зрителю.
export const MomAtDesk: React.FC<{
  readonly f: number;
  readonly cam: { x: number; y: number; zoom: number };
  readonly lid: number; // 1 — открыт, 0 — закрыт
  readonly lamp?: number;
  readonly pose: (t: number) => PoseIn;
  readonly face?: (t: number) => number;
  readonly clock?: [number, number];
  readonly tint?: string;
  readonly notebook?: boolean;
  readonly momX?: (t: number) => number;
  readonly walkFrom?: number;
}> = ({ f, cam, lid, lamp = 1, pose, face = () => 0.1, clock = [13, 0], tint = TINT.cool, notebook = true, momX = () => O.momSeat, walkFrom }) => (
  <Shot f={f} cam={cam} bg={C.wallOffice}>
    <MomOfficeBack h={clock[0]} m={clock[1]} />
    <MomChairBack x={O.momSeat} />
    <Actor uid="od-mom" look="km2Mom" f={f} place={(t) => ({ x: momX(t), y: O.floorY - 30, h: H.mom })} face={face} pose={pose} seed={5} layer="body" walkFrom={walkFrom} />
    <MomDesk lamp={lamp} />
    {notebook ? <NotebookOnDesk x={O.notebook.x} y={O.notebook.y} /> : null}
    <LaptopFront x={O.laptop.x} y={O.laptop.y} w={O.laptop.w} open={lid} />
    <Actor uid="od-mom" look="km2Mom" f={f} place={(t) => ({ x: momX(t), y: O.floorY - 30, h: H.mom })} face={face} pose={pose} seed={5} layer="arms" walkFrom={walkFrom} />
    <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: tint })} />
  </Shot>
);

// Блокнот сверху: две страницы, записанные строки (штрихи), галочки у
// выполненных; finger — кончик пальца (строка), mark — новая отметка.
export const NotebookTop: React.FC<{ readonly f: number; readonly finger?: { x: number; y: number } | null; readonly mark?: number; readonly pen?: { x: number; y: number } | null; readonly tint?: string }> = ({ f, finger = null, mark = 0, pen = null, tint = TINT.cool }) => {
  const lines = [0.8, 0.62, 0.74, 0.55, 0.7, 0.5];
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#F1F2F4">
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: "#F4F5F7" })} />
      <Svg>
        <rect x={110} y={420} width={860} height={1040} rx={18} fill="#2A3768" />
        <rect x={130} y={440} width={410} height={1000} fill="#FFFDF6" />
        <rect x={540} y={440} width={410} height={1000} fill="#FFFEFA" />
        <line x1={540} y1={440} x2={540} y2={1440} stroke="#CFC8BA" strokeWidth={6} />
        {lines.map((w, i) => (
          <g key={i}>
            <rect x={210} y={540 + i * 130} width={300 * w} height={16} rx={8} fill={C.navy} opacity={0.75} />
            <rect x={210} y={570 + i * 130} width={240 * w} height={12} rx={6} fill={C.navy} opacity={0.4} />
            {i < 3 ? <path d={`M 160 ${548 + i * 130} l 14 14 l 22 -26`} stroke={C.kidGreen} strokeWidth={8} fill="none" strokeLinecap="round" /> : null}
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={600} y={540 + i * 130} width={280 * [0.7, 0.5, 0.62][i]} height={16} rx={8} fill={C.navy} opacity={0.6} />
        ))}
        {mark > 0 ? <path d={`M 600 ${940} l 18 18 l 30 -34`} stroke={C.orange} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${80 * mark} 80`} /> : null}
        {finger ? <CloseHand x={finger.x + 40} y={finger.y + 210} angle={170} size={150} {...HANDS.mom} shape="point" /> : null}
        {pen ? (
          <g>
            <g transform={`translate(${pen.x} ${pen.y}) rotate(-58)`}>
              <path d="M 0 0 L 26 -9 L 26 9 Z" fill={C.ink} />
              <rect x={26} y={-9} width={240} height={18} rx={4} fill={C.navy} />
            </g>
            <CloseHand x={pen.x + 120} y={pen.y + 150} angle={150} size={150} {...HANDS.mom} shape="pinch" />
          </g>
        ) : null}
      </Svg>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: tint })} />
      <div style={box({ left: 0, top: 0, width: 1, height: 1, fontFamily: F.text })} />
    </Shot>
  );
};

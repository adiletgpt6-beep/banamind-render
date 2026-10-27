// Стейдж фильма 80-1-8: комната со всеми 26 персонажами, столик с реквизитом;
// два вида — комната (с камерой) и «карточка сверху» (письмо Амира и готовая
// надпись). Планы собираются из шкалы (shots.ts). Порядок рисования за
// столиком: тела → столик и лежащие предметы → предметы в руках → кисти,
// касающиеся предметов → карандаш; глобус на полу — ближе всего к камере.
import { useContext, useMemo } from "react";
import { fontFamily } from "../../fonts";
import { nestingBirdPose } from "../bird/birdPose";
import { SceneContext, TimelineContext } from "../core/context";
import { box, Shot, type Cam } from "../core/shots";
import type { L80Role } from "../core/roles";
import { Actor } from "../rig/Actor";
import { RoomBack } from "../sets/Classroom";
import { CurtainLayer } from "../film-1-7/set";
import { CAST, TEACHER } from "./cast";
import { buildChoreo, type Choreo, type Ctl } from "./choreo";
import { CardContent } from "./drawings";
import { CARD_UNITS, cardTip } from "./card";
import { GLOBE_FLOOR, TABLE } from "./layout";
import { CarriedProps, GlobeOnFloor, LampAside, PencilProp, StackProp, Table, TableProps } from "./set";
import type { L80Timeline } from "./timeline";

export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl), [tl]);

const AT_TABLE_IDS = ["bilal", "amir", "yusuf"] as const;

// ---------- комната ----------
export const RoomView: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo }> = ({ f, ch }) => {
  type Item = { y: number; key: string; node: React.ReactNode };
  const items: Item[] = [];
  // ученики на ковре
  for (const p of CAST) {
    if (p.main) continue;
    const ctl = ch.bg(p);
    items.push({ y: ctl.place(f).y, key: p.id, node: <Actor key={p.id} uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} /> });
  }
  // за столиком: тела до столешницы, кисти поверх предметов только при касании
  const table: { key: string; ctl: Ctl; role: L80Role; look: (typeof TEACHER)["look"]; seed: number }[] = [
    ...AT_TABLE_IDS.map((id) => {
      const p = CAST.find((x) => x.id === id)!;
      return { key: id, ctl: ch[id], role: id as L80Role, look: p.look, seed: p.seed };
    }),
    { key: "teacher", ctl: ch.teacher, role: "muhammad", look: TEACHER.look, seed: 3 },
  ];
  for (const c of table) {
    const front = c.ctl.armsFront(f);
    items.push({ y: TABLE.top - 0.5, key: c.key, node: <Actor key={c.key} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer={front ? "body" : "all"} /> });
    if (front) items.push({ y: TABLE.top + 3, key: `${c.key}-arms`, node: <Actor key={`${c.key}-arms`} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer="arms" /> });
  }
  items.push({ y: TABLE.top - 0.8, key: "stack", node: <StackProp key="stack" f={f} ch={ch} /> });
  items.push({ y: TABLE.top + 1, key: "table", node: <Table key="table" /> });
  items.push({ y: TABLE.top + 1.5, key: "props", node: <TableProps key="props" f={f} ch={ch} /> });
  items.push({ y: TABLE.top + 2, key: "carried", node: <CarriedProps key="carried" f={f} ch={ch} /> });
  items.push({ y: TABLE.top + 4, key: "pencil", node: <PencilProp key="pencil" f={f} ch={ch} /> });
  items.push({ y: GLOBE_FLOOR.baseY, key: "globe", node: <GlobeOnFloor key="globe" /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      <CurtainLayer curtain={0} />
      <LampAside />
      {items.map((i) => i.node)}
    </>
  );
};

// ---------- карточка сверху ----------
// Вид на карточку сверху на столе: письмо Амира (карандаш в кисти, кончик у
// текущей точки, штрихи появляются только рядом с ним) и готовая надпись.
export const CardView: React.FC<{ readonly f: number; readonly ch: Choreo; readonly finished?: boolean }> = ({ f, ch, finished = false }) => {
  const prog = finished ? 1 : ch.progress(f);
  const pen = ch.pencil(f);
  const showHand = !finished && pen.inHand;
  const k = 3.9;
  const sx = 960 - (CARD_UNITS.w * k) / 2;
  const sy = 540 - (CARD_UNITS.h * k) / 2 - 30;
  const tip = cardTip(prog);
  const tipX = sx + tip.x * k;
  const tipY = sy + tip.y * k;
  const lift = 16 * pen.lift;
  const sleeve = "#3E6FB5";
  const skin = "#EBBE9A";
  const skinShade = "#D8A57F";
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#8F6A47" })}>
      <svg width={1920} height={1080}>
        <rect x={0} y={0} width={1920} height={1080} fill="#A3784F" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M 0 ${50 + i * 90} Q 960 ${30 + i * 90 + (i % 3) * 18} 1920 ${60 + i * 90}`} stroke="#6E4C31" strokeOpacity={0.16} strokeWidth={3} fill="none" />
        ))}
        {/* край отдельного листа и лодочка рядом — та же обстановка, что на столе */}
        <g transform="translate(60 120) rotate(-4) scale(1.1)">
          <rect x={0} y={0} width={300} height={220} rx={4} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={2} />
        </g>
        <g transform={`translate(${sx} ${sy}) rotate(1.5) scale(${k})`} style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.22))" }}>
          <CardContent progress={prog} uid="cardview" />
        </g>
        {showHand ? (
          <g transform={`translate(${tipX} ${tipY - lift})`}>
            <g transform="rotate(38)">
              <rect x={-9} y={-250} width={18} height={226} fill="#F2C53D" stroke="#B88A1C" strokeWidth={2} />
              <path d="M -9 -24 L 0 2 L 9 -24 Z" fill="#E6CFA3" />
              <path d="M -3 -8 L 0 2 L 3 -8 Z" fill="#2B2B2B" />
              <rect x={-9} y={-262} width={18} height={14} fill="#E88B8B" />
            </g>
            {/* кисть Амира, держащая карандаш (вид сверху): пальцы у кончика, запястье и рукав ниже справа */}
            <g transform="translate(70 120) rotate(38)">
              <ellipse cx={0} cy={0} rx={62} ry={78} fill={skin} stroke={skinShade} strokeWidth={2} />
              <ellipse cx={-42} cy={-52} rx={22} ry={44} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(-25 -42 -52)" />
              <ellipse cx={-12} cy={-70} rx={16} ry={40} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(-8 -12 -70)" />
              <ellipse cx={16} cy={-62} rx={15} ry={34} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(8 16 -62)" />
              <rect x={-70} y={60} width={140} height={260} rx={44} fill={sleeve} />
              <rect x={-70} y={56} width={140} height={28} rx={10} fill={skin} />
            </g>
          </g>
        ) : null}
        {finished || prog >= 1 ? (
          // карандаш отложен рядом с готовой карточкой
          <g transform={`translate(${sx + CARD_UNITS.w * k + 70} ${sy + 120}) rotate(-70)`}>
            <rect x={-9} y={-250} width={18} height={226} fill="#F2C53D" stroke="#B88A1C" strokeWidth={2} />
            <path d="M -9 -24 L 0 2 L 9 -24 Z" fill="#E6CFA3" />
            <path d="M -3 -8 L 0 2 L 3 -8 Z" fill="#2B2B2B" />
            <rect x={-9} y={-262} width={18} height={14} fill="#E88B8B" />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode }> = ({ f, tl, ch, cam, overlay }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} tl={tl} ch={ch} />
  </Shot>
);

export const useFilm = () => {
  const tl = useContext(TimelineContext) as L80Timeline;
  const sc = useContext(SceneContext);
  return { tl, sc };
};

// Подпись в кадре (одна строка, ненавязчиво внизу).
export const Caption: React.FC<{ readonly text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ padding: "8px 24px", borderRadius: 14, backgroundColor: "rgba(30,42,68,0.72)", color: "#FFFFFF", fontFamily, fontSize: 34, fontWeight: 700 }}>{text}</div>
  </div>
);

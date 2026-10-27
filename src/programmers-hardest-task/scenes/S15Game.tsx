// Сцена 15. Рисунок и игра (VO28 сын, VO29 мама, VO30 сын, VO31 диктор).
// 1. Сын возвращается (из-за спины мамы) с листом и показывает рисунок:
//    «Бул сенин колдонмоң үчүн.» — вставка крупно: рисунок в его руках.
// 2. Папа берёт лист за край (кисти встречаются, лист переходит из руки в
//    руку) и прикрепляет к левому краю монитора — скотч.
// 3. Мама с улыбкой, глядя на сына: «Тааныштыруу бүттүбү?» Сын: «Эми ойносок
//    болот.»
// 4. VO31: обратный план из-за плеча папы — его рука опускает крышку
//    ноутбука вокруг шарнира; слева монитор с приклеенным рисунком. Затем
//    папа снимает коробку игры с полки и ставит на стол.
// 5. Без речи: сверху поле игры (дорожка от дома к школе), руки кладут
//    фишки, сын делает первый ход; тёплый общий план — семья играет.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { LIVING } from "../sets/Living";
import { box, camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, OWN, TS2 } from "../sound";
import { ChildDrawing, ChildDrawingArt } from "../ui/car";
import { abs } from "../ui/kit";
import { RouteIcon, ScheduleApp } from "../ui/screens";
import { onTable, placeAt, seatOf } from "./common";
import { BoxOnTable, dadSeat, EVE, EveningRoom, momSeat } from "./evening";
import { PHT_TEXT, PHT_TIME } from "../script";

type L = { from: number; to: number; word: (i: number) => number };

export const gameBeats = (vo28: L, vo29: L, vo30: L, vo31: L, len: number) => ({
  arrive: 34, // сын у стола
  show: [vo28.from - 4, vo28.to] as const, // показывает рисунок
  insert: [vo28.word(2) - 2, vo28.to + 2] as const, // крупно рисунок
  meet: vo28.to + 14, // кисти встречаются на краю листа
  take: vo28.to + 18, // лист у папы (левая рука)
  pass: vo28.to + 32, // перекладывает в правую руку
  stick: vo29.from + 18, // лист у монитора (скотч)
  closeFrom: vo31.from - 2, // обратный план: крышка опускается
  closed: vo31.word(2) + 4, // «жаап» — крышка закрыта
  boxGrab: vo31.word(3) + 4, // тянется к полке («үстөл оюнун»)
  boxDown: vo31.word(5) + 8, // коробка на столе («алып чыкты»)
  board: vo31.to + 2, // вставка сверху: поле и фишки
  firstMove: vo31.to + 40, // сын делает первый ход
  wide: Math.max(vo31.to + 56, len - 34), // общий план
});

// Сын возвращается из-за спины мамы к столу.
const sonBack = (t: number) => {
  const u = cruise(t / 34, 0.28);
  const fwd = cruise((t - 20) / 16, 0.4);
  return placeAt(lerp(330, EVE.son, u), lerp(1500, 1556, fwd), 540);
};

export const GameScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo28 = useLine("vo28");
  const vo29 = useLine("vo29");
  const vo30 = useLine("vo30");
  const vo31 = useLine("vo31");
  const len = 344;
  const B = gameBeats(vo28, vo29, vo30, vo31, len);
  const dad = dadSeat();
  const mom = momSeat();
  const MEET = { x: 978, y: 1150 };
  const PAPER = EVE.paper;
  const PASS = { x: 1080, y: 1150 }; // перед грудью папы: лист из левой руки в правую
  const BOX_ON_TABLE_X = 990;
  const lid = keys(f, [[B.closeFrom + 6, 1], [B.closed, 0]], easeInOut);

  const sonPose = (t: number) => ({
    expr: t < vo28.from ? ("smile" as const) : t < vo29.from ? ("softSmile" as const) : ("smile" as const),
    lean: keys(t, [[B.arrive, 0], [B.show[0], 4], [B.meet, 8], [B.take + 10, 2]]),
    lookY: keys(t, [[B.show[0], 0], [B.show[1], 0.1], [B.take + 12, -0.1]]),
    armL: { target: null, shape: "relax" as const },
    armR:
      t < B.take
        ? {
            // лист держит за верхний край, поднимает и показывает, затем протягивает папе
            target: keysV(t, [[0, { x: 360, y: 1390 }], [B.arrive - 6, { x: EVE.son + 26, y: 1270 }], [B.show[0] + 6, { x: EVE.son + 30, y: 1172 }], [B.meet - 14, { x: EVE.son + 32, y: 1172 }], [B.meet, MEET]], anticipate),
            shape: "pinch" as const,
            item: "drawing" as const,
            elbow: "down" as const,
            behind: false,
          }
        : t < B.wide
          ? { target: keysV(t, [[B.take, MEET], [B.take + 16, onTable(EVE.son + 34, 8)]], anticipate), shape: "relax" as const, elbow: "hang" as const, behind: false }
          : { target: keysV(t, [[B.wide, onTable(EVE.son + 34, 8)], [B.wide + 10, { x: 958, y: LIVING.table.top - 30 }], [B.wide + 26, { x: 972, y: LIVING.table.top - 30 }], [B.wide + 40, onTable(EVE.son + 34, 8)]], anticipate), shape: "pinch" as const, elbow: "down" as const, behind: false },
  });
  // сын: на папу/родителей; на вопрос мамы — на маму; в конце — на поле
  const sonFace = (t: number) => keys(t, [[0, 0.7], [B.arrive, 0.5], [vo29.from, 0.5], [vo29.from + 8, -0.6], [vo30.to, -0.6], [vo30.to + 10, 0.4], [B.boxDown, 0.4], [B.boxDown + 10, 0.2]]);

  const dadPose = (t: number) => {
    const reachShelf = t >= B.closed && t < B.boxDown + 12;
    return {
      expr: t < B.meet - 10 ? ("softSmile" as const) : ("smile" as const),
      sit: 1,
      seat: seatOf(dad),
      lean: keys(t, [[0, 6], [B.meet - 10, 10], [B.stick + 8, 6], [B.boxGrab - 6, 2]]),
      armL:
        t < B.meet - 14 || t >= B.pass + 16
          ? { target: keysV(t, [[B.pass + 2, PASS], [B.pass + 16, onTable(EVE.laptop.x - 42, -12)]], anticipate), shape: "relax" as const, elbow: "hang" as const, behind: false }
          : {
              // левая рука: к краю листа у руки сына → лист к груди (передать правой)
              target: keysV(t, [[B.meet - 14, onTable(EVE.laptop.x - 42, -12)], [B.meet, { x: MEET.x + 18, y: MEET.y + 2 }], [B.take + 4, { x: MEET.x + 26, y: MEET.y - 4 }], [B.pass, { x: PASS.x - 20, y: PASS.y }]], anticipate),
              shape: "pinch" as const,
              item: t >= B.take && t < B.pass ? ("drawing" as const) : ("none" as const),
              elbow: "down" as const,
              behind: false,
            },
      armR: reachShelf
        ? {
            // крышку опустили — правая рука к полке за коробкой, коробку на стол
            target: keysV(t, [[B.closed, { x: EVE.laptop.x + 40, y: 1200 }], [B.boxGrab, { x: LIVING.box.x, y: LIVING.box.y - 40 }], [B.boxGrab + 8, { x: LIVING.box.x, y: LIVING.box.y - 40 }], [B.boxDown, { x: BOX_ON_TABLE_X + 4, y: LIVING.table.top - 46 }]], anticipate),
            shape: "fist" as const,
            item: t >= B.boxGrab + 4 && t < B.boxDown ? ("gamebox" as const) : ("none" as const),
            elbow: "out" as const,
            behind: false,
          }
        : t >= B.pass - 12 && t < B.stick + 16
          ? {
              // правая рука: берёт лист у груди → к левому краю монитора, прижимает скотч
              target: keysV(t, [[B.pass - 12, onTable(EVE.laptop.x + 44, -12)], [B.pass, { x: PASS.x + 20, y: PASS.y }], [B.stick, { x: PAPER.x, y: PAPER.y - 40 }], [B.stick + 8, { x: PAPER.x + 30, y: PAPER.y - 36 }]], anticipate),
              shape: t < B.stick ? ("pinch" as const) : ("open" as const),
              item: t >= B.pass && t < B.stick ? ("drawing" as const) : ("none" as const),
              elbow: "down" as const,
              behind: false,
            }
          : t < B.pass
            ? { target: onTable(EVE.laptop.x + 44, -12), shape: "relax" as const, elbow: "hang" as const, behind: false }
            : { target: keysV(t, [[B.stick + 16, { x: PAPER.x + 30, y: PAPER.y - 36 }], [B.stick + 30, onTable(t < B.boxGrab ? EVE.laptop.x + 44 : BOX_ON_TABLE_X + 60, t < B.boxGrab ? -12 : -4)]], anticipate), shape: "relax" as const, elbow: "hang" as const, behind: false },
      lookY: keys(t, [[0, 0.1], [B.meet, 0.1], [B.take, 0.05], [B.boxGrab - 8, 0.05], [B.boxGrab, -0.45], [B.boxGrab + 10, -0.45], [B.boxDown - 6, 0.4]]),
      nod: keys(t, [[vo28.to - 8, 0], [vo28.to, 4], [vo28.to + 12, 0]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.5], [B.take + 2, -0.5], [B.take + 10, 0.3], [B.pass, 0.55], [B.stick + 12, 0.55], [B.stick + 22, -0.45], [vo30.to, -0.45], [B.boxGrab - 6, 0.25], [B.boxGrab + 10, 0.3], [B.boxDown, -0.1]]);

  const momPose = (t: number) => ({
    expr: t < vo29.from - 6 ? ("softSmile" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(mom),
    lean: 4,
    headTilt: keys(t, [[vo29.from - 4, 0], [vo29.from + 10, 6], [vo29.to + 20, 2]]),
    armL: { target: onTable(mom.x - 0.1 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: onTable(mom.x + 0.12 * mom.h, -4), shape: "relax" as const, elbow: "hang" as const, behind: false },
    lookY: keys(t, [[0, 0], [B.boxDown, 0], [B.boxDown + 8, 0.35]]),
  });
  const momFace = (t: number) => keys(t, [[0, 0.35], [B.boxDown, 0.3], [B.boxDown + 8, 0.45]]);

  const room = (
    <EveningRoom
      state={{
        f,
        lid,
        paper: f >= B.stick ? 1 : 0,
        boxOnShelf: f < B.boxGrab + 4,
        extraBack: f >= B.boxDown ? <BoxOnTable x={BOX_ON_TABLE_X} lid={keys(f, [[B.boxDown + 6, 0], [B.boxDown + 16, 1]])} /> : null,
      }}
      actors={[
        { uid: "g15-son", look: "son", place: sonBack, face: sonFace, pose: sonPose, role: "son", seed: 4, walkFrom: 0 },
        { uid: "g15-mom", look: "mom", place: () => mom, face: momFace, pose: momPose, role: "mother", chair: EVE.mom, seed: 1 },
        { uid: "g15-dad", look: "dad", place: () => dad, face: dadFace, pose: dadPose, chair: EVE.dad, seed: 2, under: (t) => t < B.meet - 14 },
      ]}
    />
  );

  // --- вставки ---
  // рисунок в руках сына крупно
  const drawingInsert = (
    <div style={abs({ inset: 0, background: "radial-gradient(circle at 50% 40%, #4C4868, #2C2A40)" })}>
      <div style={abs({ left: 120, top: 360, rotate: `${keys(f, [[B.insert[0], -4], [B.insert[1], -2]])}deg`, transform: `translateY(${(1 - easeOut((f - B.insert[0]) / 10)) * 40}px)` })}>
        <div style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
          <ChildDrawing w={840} />
        </div>
        {/* детские пальцы держат лист за края */}
        {[-1, 1].map((s) => (
          <svg key={s} width={1} height={1} style={abs({ left: s < 0 ? 40 : 800, top: 600, overflow: "visible" })}>
            <rect x={-38} y={-10} width={76} height={150} rx={34} fill={LOOKS.son.topColor} />
            <ellipse cx={0} cy={-26} rx={36} ry={44} fill={LOOKS.son.skin} stroke={LOOKS.son.skinShade} strokeWidth={3} />
            <ellipse cx={s * -6} cy={-70} rx={14} ry={20} fill={LOOKS.son.skin} stroke={LOOKS.son.skinShade} strokeWidth={3} />
          </svg>
        ))}
      </div>
    </div>
  );

  // обратный план: из-за плеча папы — экран ноутбука и монитор с рисунком
  const theta = lerp(0, 105, lid) * (Math.PI / 180);
  const E = 0.42; // камера чуть выше
  const LW = 640;
  const LD = 420;
  const hingeY = 1180;
  const vis = Math.sin(theta) * Math.cos(E) - Math.cos(theta) * Math.sin(E); // >0 — виден экран
  const lidH = Math.abs(vis) * LD;
  const topY = vis > 0 ? hingeY - lidH : hingeY - lidH * 0.3;
  const handX = 540 + 150;
  const reverse = (
    <div style={abs({ inset: 0, background: "radial-gradient(circle at 70% 30%, #574E62, #26243A)" })}>
      {/* стол */}
      <div style={abs({ left: -40, top: 1120, width: 1160, height: 900, background: "linear-gradient(180deg, #CDAE84, #B6966C)" })} />
      {/* монитор слева, лист приклеен к его правому краю (к папе) */}
      <div style={abs({ left: 30, top: 470, width: 420, height: 290, borderRadius: 14, backgroundColor: "#1E2432", padding: 12, boxSizing: "border-box" })}>
        <div style={{ width: "100%", height: "100%", borderRadius: 8, backgroundColor: "#DCE3EC", overflow: "hidden", opacity: 0.75 }}>
          <div style={{ transform: "scale(0.42)", transformOrigin: "0 0", width: 940 }}>
            <ScheduleApp w={940} day={4} header rows={[{ time: PHT_TIME.morning, title: PHT_TEXT.app.toSchool, who: PHT_TEXT.app.dad }, { time: PHT_TIME.pickup, title: PHT_TEXT.app.fromSchool, who: PHT_TEXT.app.mom }]} />
          </div>
        </div>
      </div>
      <div style={abs({ left: 210, top: 760, width: 60, height: 200, backgroundColor: "#3C4252" })} />
      <div style={abs({ left: 150, top: 950, width: 180, height: 26, borderRadius: 12, backgroundColor: "#2C3240" })} />
      <div style={abs({ left: 392, top: 520, width: 330, height: 238, rotate: "3deg", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" })}>
        <svg width={330} height={238} viewBox="0 0 500 360">
          <ChildDrawingArt />
        </svg>
        <div style={abs({ left: -24, top: -10, width: 80, height: 26, backgroundColor: "rgba(255,255,255,0.75)", rotate: "-24deg" })} />
        <div style={abs({ left: -24, top: 210, width: 80, height: 26, backgroundColor: "rgba(255,255,255,0.75)", rotate: "24deg" })} />
      </div>
      {/* ноутбук: корпус и крышка на шарнире (к камере — экран, пока открыт) */}
      <svg width={1080} height={1920} style={abs({ left: 0, top: 0 })}>
        <path d={`M ${handX - LW / 2 - 80} ${hingeY + 160} L ${handX + LW / 2 + 80} ${hingeY + 160} L ${handX + LW / 2} ${hingeY} L ${handX - LW / 2} ${hingeY} Z`} fill="#AEB7C4" />
        {vis > 0 ? (
          <g>
            <path d={`M ${handX - LW / 2} ${hingeY} L ${handX + LW / 2} ${hingeY} L ${handX + LW / 2} ${topY} L ${handX - LW / 2} ${topY} Z`} fill="#2B3242" />
            <rect x={handX - LW / 2 + 16} y={topY + 14} width={LW - 32} height={Math.max(0, lidH - 28)} rx={6} fill="#EEF1F6" />
            <rect x={handX - LW / 2 + 50} y={topY + 14 + lidH * 0.18} width={(LW - 100) * 0.7} height={lidH * 0.08} rx={4} fill="#14243B" opacity={0.8} />
            <rect x={handX - LW / 2 + 50} y={topY + 14 + lidH * 0.4} width={LW - 100} height={lidH * 0.14} rx={8} fill="#FFFFFF" stroke="#FFD34D" strokeWidth={4} />
          </g>
        ) : (
          <path d={`M ${handX - LW / 2} ${hingeY} L ${handX + LW / 2} ${hingeY} L ${handX + LW / 2 + 40} ${topY + 160} L ${handX - LW / 2 - 40} ${topY + 160} Z`} fill="#C9D0DA" />
        )}
      </svg>
      {/* рука папы на верхнем крае крышки (тянет к себе) */}
      <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${handX + 120} ${vis > 0 ? topY : hingeY + 60})`}>
          <path d="M -70 30 L -110 700 L 140 700 L 110 30 Z" fill={LOOKS.dad.topColor} />
          <ellipse cx={20} cy={20} rx={78} ry={56} fill={LOOKS.dad.skin} stroke={LOOKS.dad.skinShade} strokeWidth={3} />
          {[-40, -12, 16, 44].map((x) => (
            <rect key={x} x={x - 12} y={-36} width={24} height={50} rx={12} fill={LOOKS.dad.skin} stroke={LOOKS.dad.skinShade} strokeWidth={3} />
          ))}
        </g>
      </svg>
      {/* плечо и затылок папы — передний план справа снизу */}
      <div style={abs({ left: 720, top: 1500, width: 520, height: 600, borderRadius: "260px 260px 0 0", backgroundColor: LOOKS.dad.topColor })} />
      <div style={abs({ left: 860, top: 1290, width: 250, height: 280, borderRadius: "125px 125px 110px 110px", backgroundColor: LOOKS.dad.hair })} />
    </div>
  );

  // сверху: поле игры — дорожка от дома к школе, фишки, руки
  const boardInsert = (() => {
    const u = easeOut((f - B.board + 5) / 12);
    const cells = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 13) * Math.PI;
      return { x: 540 - Math.cos(a) * 290, y: 820 - Math.sin(a) * 260 + i * 6 };
    });
    const step = clamp((f - B.firstMove) / 12);
    const pieceAt = (i: number) => cells[i];
    const sonPiece = { x: lerp(pieceAt(0).x, pieceAt(2).x, easeInOut(step)), y: lerp(pieceAt(0).y, pieceAt(2).y, easeInOut(step)) - Math.sin(Math.PI * step) * 30 };
    const placeK = (d: number) => clamp((f - B.board - d) / 8);
    // кисть сверху: рукав с манжетой, ладонь, пальцы держат фишку у кончиков
    const hand = (x: number, y: number, rot: number, sleeve: string, skin: string, shade: string, k: number) =>
      k <= 0 ? null : (
        <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={k}>
          <path d="M -62 70 L -84 640 L 84 640 L 62 70 Z" fill={sleeve} />
          <rect x={-66} y={58} width={132} height={34} rx={14} fill="rgba(0,0,0,0.14)" />
          <path d="M -48 66 Q -56 0 -30 -26 L 34 -26 Q 58 0 50 66 Z" fill={skin} stroke={shade} strokeWidth={3} />
          {[-30, -10, 10, 30].map((fx, i) => (
            <rect key={fx} x={fx - 10} y={-58 + Math.abs(i - 1.5) * 6} width={20} height={44} rx={10} fill={skin} stroke={shade} strokeWidth={3} />
          ))}
          <path d="M -46 20 Q -78 0 -70 -30 Q -60 -40 -48 -24 Z" fill={skin} stroke={shade} strokeWidth={3} />
        </g>
      );
    // мама и папа ставят фишки на старт и убирают руки; затем ход сына
    const reach = (d: number, len: number) => Math.sin(Math.PI * clamp((f - B.board - d) / len));
    const momHand = { x: lerp(-80, pieceAt(0).x - 40, reach(0, 30)), y: lerp(1500, pieceAt(0).y + 60, reach(0, 30)) };
    const dadHand = { x: lerp(1160, pieceAt(0).x + 40, reach(10, 30)), y: lerp(1560, pieceAt(0).y + 70, reach(10, 30)) };
    const sonReach = Math.sin(Math.PI * clamp((f - B.firstMove + 12) / 40));
    const sonHand = { x: lerp(560, sonPiece.x + 10, sonReach), y: lerp(1900, sonPiece.y + 70, sonReach) };
    return (
      <div style={abs({ inset: 0, background: "linear-gradient(180deg, #CDAE84, #BE9C72)" })}>
        <svg width={1080} height={1920} style={abs({ left: 0, top: 0 })}>
          <g transform={`translate(540 860) scale(${0.85 + 0.15 * u}) rotate(${-4 + 4 * u}) translate(-540 -860)`} opacity={u}>
            <rect x={150} y={420} width={780} height={820} rx={30} fill="#FFF7E6" stroke="#E0C690" strokeWidth={10} />
            <rect x={150} y={420} width={780} height={820} rx={30} fill="none" stroke="#2F5D8F" strokeWidth={16} strokeDasharray="40 22" opacity={0.25} />
            {cells.map((c, i) => (
              <rect key={i} x={c.x - 34} y={c.y - 34} width={68} height={68} rx={14} fill={["#FFD34D", "#AEBBCB", "#5E9E86", "#E5677A"][i % 4]} opacity={0.9} />
            ))}
            <g transform={`translate(${cells[0].x - 70} ${cells[0].y + 60})`}>
              <foreignObject width={140} height={140}>
                <RouteIcon kind="home" size={140} />
              </foreignObject>
            </g>
            <g transform={`translate(${cells[13].x - 70} ${cells[13].y + 60})`}>
              <foreignObject width={140} height={140}>
                <RouteIcon kind="school" size={140} />
              </foreignObject>
            </g>
            {/* фишки: мамы и папы — на старте, сына — делает первый ход */}
            {[
              { p: { x: pieceAt(0).x - 26, y: pieceAt(0).y + 10 }, c: "#7F90A8", k: placeK(12) },
              { p: { x: pieceAt(0).x + 24, y: pieceAt(0).y + 14 }, c: "#22385C", k: placeK(22) },
            ].map((pc, i) => (
              <g key={i} opacity={pc.k} transform={`translate(${pc.p.x} ${pc.p.y - (1 - pc.k) * 40})`}>
                <circle r={32} fill={pc.c} stroke="rgba(0,0,0,0.2)" strokeWidth={4} />
                <circle r={13} cx={-8} cy={-8} fill="#FFFFFF" opacity={0.35} />
              </g>
            ))}
            <g transform={`translate(${sonPiece.x} ${sonPiece.y})`}>
              <circle r={34} fill="#E0A73A" stroke="#B9831F" strokeWidth={4} />
              <circle r={14} cx={-8} cy={-8} fill="#FFFFFF" opacity={0.4} />
            </g>
          </g>
          {/* руки: мама и папа ставят фишки, сын делает первый ход */}
          {hand(momHand.x, momHand.y, 34, LOOKS.mom.topColor, LOOKS.mom.skin, LOOKS.mom.skinShade, reach(0, 30) > 0.02 ? 1 : 0)}
          {hand(dadHand.x, dadHand.y, -34, LOOKS.dad.topColor, LOOKS.dad.skin, LOOKS.dad.skinShade, reach(10, 30) > 0.02 ? 1 : 0)}
          {hand(sonHand.x, sonHand.y, -8, LOOKS.son.topColor, LOOKS.son.skin, LOOKS.son.skinShade, sonReach > 0.02 ? 1 : 0)}
        </svg>
      </div>
    );
  })();

  const wideCam = { x: 930, y: 1110, zoom: 1.45 };
  return (
    <>
      <Shot f={f} from={0} to={B.insert[0]} cam={camMove(f, 0, B.insert[0], wideCam, { x: 935, y: 1105, zoom: 1.6 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.insert[0] && f < B.insert[1] ? drawingInsert : null}
      <Shot f={f} from={B.insert[1]} to={B.closeFrom} cam={camMove(f, B.insert[1], B.closeFrom, { x: 1000, y: 1100, zoom: 1.7 }, { x: 960, y: 1100, zoom: 1.66 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.closeFrom && f < B.closed + 6 ? reverse : null}
      <Shot f={f} from={B.closed + 6} to={B.board} cam={camMove(f, B.closed + 6, B.board, { x: 1020, y: 1060, zoom: 1.55 }, { x: 1010, y: 1080, zoom: 1.6 })} bg="#2A2E44">
        {room}
      </Shot>
      {f >= B.board && f < B.wide ? boardInsert : null}
      <Shot
        f={f}
        from={B.wide}
        to={9999}
        cam={camMove(f, B.wide, B.wide + 60, { x: 930, y: 1120, zoom: 1.5 }, { x: 930, y: 1115, zoom: 1.56 })}
        bg="#2A2E44"
      >
        {room}
        <WideBoard f={f} from={B.wide} />
      </Shot>
    </>
  );
};

// Поле на столе в общем плане (вид спереди — тонкая пластина с фишками),
// сын тянется к своей фишке.
const WideBoard: React.FC<{ readonly f: number; readonly from: number }> = ({ f, from }) => {
  const y = LIVING.table.top + 2;
  const hop = Math.sin(Math.PI * clamp((f - from - 12) / 12)) * 12;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600, pointerEvents: "none" })}>
      <div style={box({ left: 820, top: y - 12, width: 240, height: 18, borderRadius: 6, backgroundColor: "#FFF7E6", border: "3px solid #E0C690", boxSizing: "border-box" })} />
      {[
        [860, "#7F90A8", 0],
        [900, "#22385C", 0],
        [960, "#E0A73A", hop],
      ].map(([x, c, h]) => (
        <div key={x as number} style={box({ left: (x as number) - 9, top: y - 34 - (h as number), width: 18, height: 26, borderRadius: "9px 9px 4px 4px", backgroundColor: c as string })} />
      ))}
    </div>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = gameBeats(ctx.line("vo28"), ctx.line("vo29"), ctx.line("vo30"), ctx.line("vo31"), ctx.len);
  return [
    { at: B.take, src: COMMON("paper"), volume: 0.18 },
    { at: B.stick - 4, src: OWN("tape"), volume: 0.2 },
    { at: B.closed - 2, src: TS2("laptop-close"), volume: 0.3 },
    { at: B.boxGrab + 2, src: OWN("box"), volume: 0.16 },
    { at: B.boxDown, src: OWN("box"), volume: 0.2 },
    { at: B.board + 2, src: OWN("board"), volume: 0.2 },
    { at: B.board + 14, src: OWN("piece-0"), volume: 0.2 },
    { at: B.board + 22, src: OWN("piece-1"), volume: 0.2 },
    { at: B.firstMove + 10, src: OWN("piece-2"), volume: 0.24 },
  ];
};

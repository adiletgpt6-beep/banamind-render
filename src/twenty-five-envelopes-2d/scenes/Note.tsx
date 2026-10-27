// Сцена 6. Благодарность вместо приглашения (M02). Снова тот же стол и
// тот же «Эмир».
// A. Сверху: «Эмир» на своём месте; пальцы мамы берут его за край, на
//    столе остаются 24.
// B. Конверт в руках крупно: мама переворачивает его, поднимает клапан
//    вокруг линии сгиба и вытягивает записку из горловины.
// C. Записка в руках, текст ориентирован к зрителю; мама тихо читает
//    (M02). Субтитр не дублирует — лист сам показывает цитату.
// D. Реакция мамы: она понимает, что это звучит как прощание.
// E. Записка уходит обратно в «Эмир», клапан закрыт, конверт перевёрнут и
//    положен на место. Затем мама берёт «Бекзат», открывает клапан и
//    достаёт детский рисунок: Аян и Эмир на школьной площадке (≈ 2 с).
// В каждый момент записка либо в руке, либо в конверте — не одновременно.
import { clamp, easeInOut, keys } from "../rig/motion";
import { BEKZAT, EMIR } from "../script";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { SKIN } from "../props/CloseHand";
import { HeldEnvelope, HeldSheet } from "../props/Held";
import { KidDrawing, NoteSheet } from "../props/Note";
import { gridLayout, TOP } from "../sets/Room";
import { DeskTop, reach, wristFor } from "./desk";
import { MOM_STAND, RoomFront, ROOM_CAM, type ActorSpec, ayanSeated, AYAN_SEAT } from "./room";

export const notePlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "note");
  const m02 = T.from("M02");
  const m02End = T.to("M02");
  const take = 16;
  const held = 26;
  const turn = [held + 2, held + 18] as const;
  const flap = [turn[1] + 4, turn[1] + 20] as const;
  const pull = [flap[1] + 4, Math.max(flap[1] + 20, m02 - 10)] as const;
  const read = m02 - 8;
  const react = m02End + 10;
  const back = react + 30;
  const bIn = [back + 2, back + 18] as const; // записка уходит в конверт
  const bClose = [bIn[1] + 2, bIn[1] + 12] as const;
  const bTurn = [bClose[1] + 2, bClose[1] + 14] as const;
  const desk2 = bTurn[1] + 2; // сверху: «Эмир» на месте, рука к «Бекзат»
  const held2 = desk2 + 16;
  const k = { turn: [held2 + 2, held2 + 14], flap: [held2 + 16, held2 + 28], pull: [held2 + 30, held2 + 46] } as const;
  const drawing = held2 + 48;
  return { take, held, turn, flap, pull, read, m02, m02End, react, back, bIn, bClose, bTurn, desk2, held2, k, drawing, len: T.len };
};
type P = ReturnType<typeof notePlan>;

const u = (f: number, ab: readonly [number, number]) => easeInOut(clamp((f - ab[0]) / Math.max(1, ab[1] - ab[0])));

export const NoteScene: React.FC = () => {
  const { f } = useScene("note");
  const p = usePlan(notePlan);
  const emir = TOP.grid(EMIR.row, EMIR.col);
  const bek = TOP.grid(BEKZAT.row, BEKZAT.col);

  // A: сверху, мама берёт «Эмир»
  if (f < p.held) {
    const tip = { x: emir.x - 150, y: emir.y + 20 };
    const at = wristFor(tip, 230, -96);
    const w = reach(f, { x: at.x - 360, y: at.y + 40 }, at, p.take, 1e9, 14);
    const lifted = f >= p.take + 4;
    const items = gridLayout().map((e) => (e.env.id === EMIR.id && lifted ? { ...e, hidden: true } : e));
    return <DeskTop f={f} cam={{ x: emir.x + 120, y: emir.y + 160, zoom: 1.55 }} items={items} hands={[{ x: w.x, y: w.y, angle: -96, skin: SKIN.mom, shape: lifted ? "pinch" : "open", mirror: true }]} />;
  }
  // B: в руках — переворот, клапан, записка выходит
  if (f < p.read) {
    return <HeldEnvelope name={EMIR.name} turn={u(f, p.turn)} open={u(f, p.flap)} out={u(f, p.pull)} content="note" skin={SKIN.mom} flapFinger={f >= p.flap[0] - 6 && f < p.flap[1] + 2 ? keys(f, [[p.flap[0] - 6, 0.2], [p.flap[1], 1]]) : 0} />;
  }
  // C: записка в руках (чтение M02)
  if (f < p.react) {
    const unfold = clamp((f - p.read) / 10);
    return (
      <HeldSheet skin={SKIN.mom}>
        <NoteSheet fold={unfold} />
      </HeldSheet>
    );
  }
  // D: реакция мамы
  if (f < p.back) {
    return <RoomFront f={f} cam={ROOM_CAM.mom} items={gridLayout().map((e) => (e.env.id === EMIR.id ? { ...e, hidden: true } : e))} ayan={ayanSpec()} mom={momSpec(p)} />;
  }
  // E1: записка обратно, клапан, переворот
  if (f < p.desk2) {
    return <HeldEnvelope name={EMIR.name} turn={1 - u(f, p.bTurn)} open={1 - u(f, p.bClose)} out={1 - u(f, p.bIn)} content="note" skin={SKIN.mom} />;
  }
  // E2: сверху — «Эмир» на месте, мама берёт «Бекзат»
  if (f < p.held2) {
    const tip = { x: bek.x - 150, y: bek.y + 20 };
    const at = wristFor(tip, 230, -96);
    const w = reach(f, { x: at.x - 360, y: at.y + 40 }, at, p.desk2 + 8, 1e9, 10);
    const lifted = f >= p.desk2 + 12;
    const items = gridLayout().map((e) => (e.env.id === BEKZAT.id && lifted ? { ...e, hidden: true } : e));
    return <DeskTop f={f} cam={{ x: (emir.x + bek.x) / 2 + 80, y: emir.y + 160, zoom: 1.4 }} items={items} hands={[{ x: w.x, y: w.y, angle: -96, skin: SKIN.mom, shape: lifted ? "pinch" : "open", mirror: true }]} />;
  }
  // E3: «Бекзат» в руках — рисунок выходит из горловины
  if (f < p.drawing) {
    return <HeldEnvelope name={BEKZAT.name} turn={u(f, p.k.turn)} open={u(f, p.k.flap)} out={u(f, p.k.pull)} content="drawing" skin={SKIN.mom} flapFinger={f >= p.k.flap[0] - 4 && f < p.k.flap[1] + 2 ? keys(f, [[p.k.flap[0] - 4, 0.2], [p.k.flap[1], 1]]) : 0} />;
  }
  // E4: рисунок
  return (
    <HeldSheet skin={SKIN.mom} top={600} h={640}>
      <KidDrawing />
    </HeldSheet>
  );
};

const momSpec = (p: P): ActorSpec => ({
  uid: "nt-mom",
  look: "momHome",
  place: () => MOM_STAND,
  face: (t) => keys(t, [[p.react + 8, -0.3], [p.react + 22, -0.65]]),
  pose: (t) => ({
    expr: { browIn: 7, browOut: -1, lid: 0.16, smile: -0.08 },
    lookY: keys(t, [[p.react + 8, 0.45], [p.react + 22, 0.2]]),
    nod: 4,
    lean: 4,
    armL: { target: { x: 838, y: 1150 }, shape: "pinch", elbow: "down", item: "envelopeBack", itemTilt: -8, behind: false },
    armR: { target: { x: 890, y: 1160 }, shape: "pinch", elbow: "down", item: "card", itemColor: "#FFFDF7", itemTilt: 4 },
  }),
  seed: 12,
});

const ayanSpec = (): ActorSpec => ({
  uid: "nt-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  face: () => 0.5,
  pose: () => ayanSeated({ expr: { browIn: 4, browOut: 0, lid: 0.12, smile: 0 }, lookY: 0.2 }),
  seed: 11,
});

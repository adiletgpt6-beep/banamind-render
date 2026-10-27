// Сцена 9. Имя появляется. Без речи. Настоящее молчание ≈ 1,8 с: папа смотрит
// на сына, затем на лист; выражение теплеет, лёгкий кивок. Он берёт со
// стола карандаш. Крупно сверху: кончик карандаша касается бумаги, рука
// опирается на стол, штрихи «Азамат» возникают по траектории кончика
// (NAME_STROKES) — имя не вспыхивает целиком. Короткая вставка: Эмир следит
// за рукой. Пустая строка впервые заполнена — пауза на имени.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV, anticipate } from "../rig/motion";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { INVITE_RATIO, InvitationArt, nameTip } from "../props/Invitation";
import { SKIN, WritingHand } from "../props/CloseHand";
import { HomeShot, SON_AT } from "./HomeShot";
import { DAD_SEATED, dadSeated, SheetOnTable, sonSeated } from "./HomeCast";

export const namePlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "name");
  const len = T.len;
  const close = 64;
  const write: [number, number] = [close + 12, close + 12 + 100];
  return { lookSheet: 24, warm: 30, take: [44, 58] as const, close, write, watch: [write[0] + 44, write[0] + 66] as const, lift: write[1] + 6, len };
};
type P = ReturnType<typeof namePlan>;

// Лист сверху (крупно): центр и ширина в кадре.
const SH = { x: 540, y: 900, w: 860 } as const;
const U = SH.w / 100;
const sheetToFrame = (pt: { x: number; y: number }) => ({ x: SH.x - SH.w / 2 + pt.x * U, y: SH.y - (SH.w * INVITE_RATIO) / 2 + pt.y * U });

const Writing: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const prog = easeInOut(clamp((f - p.write[0]) / (p.write[1] - p.write[0])) * 0.999);
  const raw = clamp((f - p.write[0]) / (p.write[1] - p.write[0]));
  const tipS = nameTip(raw >= 1 ? 1 : prog);
  const tip = sheetToFrame(tipS);
  // карандаш подходит к началу строки, пишет, затем поднимается и уходит
  const start = sheetToFrame(nameTip(0));
  const approach = keysV(f, [[p.close, { x: start.x + 260, y: start.y + 260 }], [p.write[0], start]], anticipate);
  const lift = f < p.write[0] ? keys(f, [[p.close, 40], [p.write[0], 0]]) : f > p.write[1] ? keys(f, [[p.write[1], 0], [p.lift + 10, 46]]) : tipS.down ? 0 : 10;
  const away = f > p.lift ? keysV(f, [[p.lift, tip], [p.lift + 24, { x: tip.x + 420, y: tip.y + 520 }]], easeInOut) : null;
  const at = f < p.write[0] ? approach : away ?? tip;
  const zoom = keys(f, [[p.write[1], 1], [p.len, 1.08]]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#D9B27F", transform: `scale(${zoom})`, transformOrigin: "50% 64%" }}>
      <Paper color="#D9B27F" dots="rgba(23,23,23,0.04)" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(${SH.x} ${SH.y})`}>
          <InvitationArt w={SH.w} name={raw >= 1 ? 1 : prog} />
        </g>
        <WritingHand tip={at} size={240} skin={SKIN.azamat} angle={152} lift={lift} />
      </svg>
    </AbsoluteFill>
  );
};

export const NameScene: React.FC = () => {
  const { f } = useScene("name");
  const p = usePlan(namePlan);
  const watching = f >= p.watch[0] && f < p.watch[1];
  if (f >= p.close && !watching) return <Writing f={f} p={p} />;
  const dadPose = (tt: number) =>
    dadSeated({
      expr: tt < p.warm ? { browIn: 5, browOut: 0, lid: 0.12, smile: 0.05 } : { browIn: 3, browOut: 2, lid: 0.15, smile: 0.4 },
      lookY: tt < p.lookSheet ? 0.12 : 0.55,
      lookX: tt < p.lookSheet ? -0.25 : -0.1,
      nod: keys(tt, [[p.warm, 0], [p.warm + 8, 4], [p.warm + 18, 2]]),
      armL: { target: tt < p.take[0] ? { x: 735, y: 1262 } : { x: 620, y: 1284 }, shape: tt >= p.take[1] - 4 ? "pinch" : "relax", item: tt >= p.take[1] - 4 ? "pencil" : "none", itemColor: "#F2C94C", elbow: "down", behind: false },
    });
  const sonPose = (tt: number) =>
    sonSeated({
      expr: watching ? { browIn: 4, browOut: 3, lid: 0.08, smile: 0.1 } : { browIn: 5, browOut: -1, lid: 0.16, smile: -0.05 },
      lookY: watching ? 0.7 : tt < p.lookSheet + 6 ? 0.1 : 0.55,
      lookX: 0.55,
      nod: watching ? 6 : 2,
    });
  const cam = watching ? { x: SON_AT.x + 30, y: 1050, zoom: 3.1 } : { x: 655, y: 1060, zoom: keys(f, [[0, 2.2], [p.close, 2.3]]) };
  return (
    <HomeShot
      f={f}
      cam={cam}
      chairs={[{ x: SON_AT.x }, { x: DAD_SEATED.x }]}
      actors={[
        { uid: "n9-son", look: "emir", place: () => SON_AT, face: () => 0.42, pose: sonPose, seed: 4, blinkShift: 37 },
        { uid: "n9-dad", look: "azamat", place: () => DAD_SEATED, face: () => -0.4, pose: dadPose, seed: 2 },
      ]}
      onTable={<SheetOnTable pencil={f < p.take[1] - 4} named={f >= p.write[0] + 50} />}
    />
  );
};

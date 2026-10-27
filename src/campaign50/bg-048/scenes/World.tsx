// Мир кухни BG-048 одной SVG-сценой с камерой (viewBox): стена кухни →
// стена кыялдагы пульта → кресла/стулья → тела героев → обычный стол и
// картонная коробка → стол-пульт → кот → руки героев → передний план
// (пружина, лента). Сцены задают состояние и камеру; слои не меняются,
// поэтому превращение «пульт → картон → обычный стол» непрерывно.
import type { ReactNode } from "react";
import { Cat, type CatPose } from "../props/Cat";
import { Headset, CardboardBox, ConsoleDesk, ConsoleWall, SwivelChair, type ConsoleState } from "../sets/Console";
import { KitchenBack, KitchenChair, KitchenTable } from "../sets/Kitchen";
import type { Face } from "../rig/Head";
import { LOOKS, type LookId } from "../rig/looks";
import { Person, type PersonPose } from "../rig/Person";
import { World as Camera, type Cam } from "../shots";

export type HeadsetSpec = { readonly paper: number; readonly lift?: number; readonly tilt?: number };

export type ActorSpec = {
  readonly look: LookId;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly pose: PersonPose;
  readonly face: Face;
  readonly headset?: HeadsetSpec | null;
  readonly prop?: ReactNode;
  readonly propFront?: ReactNode;
  // ширина корпуса (имитация поворота кресла: 1 — лицом к зрителю)
  readonly squash?: number;
  // руки за пультом/коробкой (спряталась дочь)
  readonly armsBehind?: boolean;
};

export type WorldSpec = {
  readonly t: number;
  readonly cam: Cam;
  readonly blur?: number;
  readonly console: ConsoleState;
  // 1 — кресла диспетчеров, 0 — обычные кухонные стулья
  readonly fantasy: number;
  readonly dad: ActorSpec;
  readonly mom: ActorSpec;
  readonly girl?: ActorSpec | null;
  readonly cat?: CatPose | null;
  readonly box?: { readonly appear: number; readonly pressMektep?: number; readonly hideMektep?: boolean };
  readonly onWall?: ReactNode; // поверх стены кухни (стикеры, лента)
  readonly behindTable?: ReactNode; // за столом, перед телами
  readonly onTable?: ReactNode; // на столе, перед телами (до рук)
  readonly over?: ReactNode; // поверх всего (FX)
};

const Actor: React.FC<{ readonly a: ActorSpec; readonly uid: string; readonly t: number; readonly layer: "body" | "arms" }> = ({ a, uid, t, layer }) => {
  const look = LOOKS[a.look];
  const sq = a.squash ?? 1;
  const person = (
    <Person
      uid={uid}
      look={a.look}
      x={0}
      y={0}
      scale={1}
      pose={a.pose}
      face={a.face}
      prop={layer === "body" ? a.prop : undefined}
      propFront={layer === "arms" ? a.propFront : undefined}
      layer={layer}
      headAccessory={a.headset ? <Headset rx={look.build.headRx} ry={look.build.headRy} paper={a.headset.paper} lift={a.headset.lift} tilt={a.headset.tilt} t={t} /> : undefined}
    />
  );
  return <g transform={`translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${((a.scale ?? 1) * sq).toFixed(3)} ${(a.scale ?? 1).toFixed(3)})`}>{person}</g>;
};

export const KitchenWorld: React.FC<{ readonly w: WorldSpec }> = ({ w }) => {
  const { t, console: cs } = w;
  const real = 1 - w.fantasy;
  return (
    <Camera cam={w.cam} blur={w.blur}>
      <KitchenBack t={t} />
      {w.onWall}
      <ConsoleWall s={cs} />
      {/* стулья / кресла */}
      {real > 0.01 ? (
        <g opacity={real}>
          <KitchenChair x={w.dad.x} />
          <KitchenChair x={w.mom.x} />
        </g>
      ) : null}
      {w.fantasy > 0.01 ? (
        <>
          <SwivelChair x={w.dad.x} y={w.dad.y - 130} paper={cs.paper} opacity={w.fantasy} />
          <SwivelChair x={w.mom.x} y={w.mom.y - 130} paper={cs.paper} opacity={w.fantasy} />
        </>
      ) : null}
      {w.behindTable}
      {w.girl ? <Actor a={w.girl} uid="girl" t={t} layer="body" /> : null}
      {w.girl?.armsBehind ? <Actor a={w.girl} uid="girl" t={t} layer="arms" /> : null}
      <Actor a={w.dad} uid="dad" t={t} layer="body" />
      <Actor a={w.mom} uid="mom" t={t} layer="body" />
      {real > 0.01 ? (
        <g opacity={Math.min(1, real * 1.5)}>
          <KitchenTable />
        </g>
      ) : null}
      {w.box ? <CardboardBox appear={w.box.appear} t={t} pressMektep={w.box.pressMektep} hideMektep={w.box.hideMektep} /> : null}
      {w.onTable}
      <ConsoleDesk s={cs} layer="desk" />
      {w.cat ? <Cat uid="cat" {...w.cat} /> : null}
      {w.girl && !w.girl.armsBehind ? <Actor a={w.girl} uid="girl" t={t} layer="arms" /> : null}
      <Actor a={w.dad} uid="dad" t={t} layer="arms" />
      <Actor a={w.mom} uid="mom" t={t} layer="arms" />
      <ConsoleDesk s={cs} layer="front" />
      {w.over}
    </Camera>
  );
};

// Положения героев в мире кухни (основание шеи).
export const SEATS = {
  dad: { x: 520, y: 1060 },
  mom: { x: 1090, y: 1078 },
  // дочь стоит за столом между родителями; hidden — спряталась за коробкой
  girl: { x: 800, y: 1000, hidden: 1262, hiddenFantasy: 1400 },
} as const;

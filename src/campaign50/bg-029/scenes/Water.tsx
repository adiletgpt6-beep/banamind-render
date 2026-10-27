// Сцена 3 (≈20–33 с): бутылка воды со стола перекатывается, встаёт и,
// вырастая, оказывается в салоне на свободном месте рядом с ребёнком.
// Этикетка «0,5 л», плашка «0,5 л • газсыз»; на словах «даамы бар же
// жөнөкөй» рядом появляется вторая бутылка с лёгким оттенком: «даамдуу»
// и «жөнөкөй». Только негазированная вода — ни еды, ни сока, ни газировки.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp } from "../anim";
import { useLine, useWordAt } from "../context";
import { C } from "../palette";
import { Bottle, Cabin, Pill, Seat, SeatedKid, SceneTitle, Table } from "../parts";
import { BG29_TEXT } from "../script";

export const WATER = { stand: 36, grow: 40 } as const;
const FLAVOR_TINT = "#FFEFB0";
const PLAIN_X = 630;
const FLAV_X = 840;

export const WaterScene: React.FC = () => {
  const f = useCurrentFrame();
  const n04 = useLine("n04");
  const n05 = useLine("n05");
  const t = BG29_TEXT.water;
  const roll = easeOut(f / WATER.stand);
  const g = easeInOut((f - WATER.grow) / 34);
  const label = appear(f, Math.max(WATER.grow + 30, useWordAt("n05", 2) - 4), 12);
  const flavAt = useWordAt("n05", 7);
  const plainAt = useWordAt("n05", 10);
  const split = easeInOut((f - (flavAt - 8)) / 18);
  const flav = appear(f, flavAt - 2, 12);
  const plain = appear(f, plainAt - 2, 12);
  // бутылка: катится по столу и встаёт → растёт и переходит на сиденье
  const tableX = lerp(170, 540, roll);
  const tableY = 1180 - Math.sin(roll * Math.PI) * 30;
  const rot = lerp(-90, 0, easeOut((f - 8) / (WATER.stand - 8)));
  const sx = lerp(lerp(tableX, 740, g), PLAIN_X, split);
  const s = lerp(lerp(1.05, 1.6, g), 1.35, split);
  const bottomY = lerp(tableY + 150 * 1.05, 1225, g);
  const squash = Math.max(0, Math.sin(clamp((f - WATER.stand) / 10) * Math.PI)) * (1 - clamp((f - WATER.stand) / 14));
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, backgroundColor: C.cabin }}>
      <div style={{ position: "absolute", inset: 0, opacity: g, transform: `scale(${lerp(1.25, 1, g)})`, transformOrigin: "740px 1000px" }}>
        <Cabin />
        <Seat x={330} y={1380} />
        <Seat x={750} y={1380} />
        <SeatedKid x={330} y={1350} f={f} hair="#3B2A20" shirt="#5B7FC7" look={clamp((f - n05.from) / 10)} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - g, transform: `scale(${lerp(1.3, 1.9, g)})`, transformOrigin: "540px 1180px" }}>
        <Table drift={0} />
      </div>
      {/* вторая бутылка — вода со вкусом */}
      <Bottle x={lerp(PLAIN_X, FLAV_X, flav)} y={1225 - 150 * 1.35} s={1.35} label="0,5 л" tint={FLAVOR_TINT} opacity={flav * split} />
      <Bottle x={sx} y={bottomY - 150 * s} s={s} rotate={rot} squash={squash} label="0,5 л" />
      <SceneTitle text={t.title} a={appear(f, Math.max(WATER.grow + 10, n04.from - 4), 12)} />
      <div style={{ position: "absolute", left: 60, right: 150, top: 450, display: "flex", justifyContent: "center", opacity: label, translate: `0 ${(1 - label) * 20}px` }}>
        <Pill bg={C.navy} size={46}>
          💧 {t.label}
        </Pill>
      </div>
      {/* подписи вариантов над бутылками */}
      <div style={{ position: "absolute", left: FLAV_X - 120, width: 240, top: 750, display: "flex", justifyContent: "center", opacity: flav * split }}>
        <Pill bg={C.yellow} color={C.navy} size={34}>
          {t.flavored}
        </Pill>
      </div>
      <div style={{ position: "absolute", left: PLAIN_X - 120, width: 240, top: 750, display: "flex", justifyContent: "center", opacity: plain * split }}>
        <Pill bg="#FFFFFF" color={C.navy} size={34} style={{ border: `3px solid ${C.waterDeep}` }}>
          {t.plain}
        </Pill>
      </div>
    </div>
  );
};

// Сцена 2 (≈6–20 с): переход через пряжку. Макроплан: язычок ремня
// входит в пряжку — щелчок. Камера отъезжает: ребёнок уже сидит на
// обычном заднем сиденье и пристёгнут; рядом второй ребёнок — на своём
// месте и тоже с ремнём. Машина стоит (вид за окном неподвижен).
// Без детских кресел и без обещаний «полной безопасности».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, lerp } from "../anim";
import { useLine } from "../context";
import { C } from "../palette";
import { Belt, Cabin, Check, Pill, Seat, SeatedKid, SceneTitle } from "../parts";
import { BG29_TEXT } from "../script";

export const BELT = { click: 28, reveal: 46 } as const;
const KIDS = [
  { x: 330, hair: "#3B2A20", shirt: "#5B7FC7", girl: false, shift: 0 },
  { x: 750, hair: "#5A3A28", shirt: "#E8735A", girl: true, shift: 41 },
] as const;
const Y = 1350;
const BUCKLE = { x: KIDS[0].x - 53, y: Y - 98 };

export const BeltScene: React.FC = () => {
  const f = useCurrentFrame();
  const n02 = useLine("n02");
  const n03 = useLine("n03");
  const t = BG29_TEXT.belt;
  const click = easeInOut((f - (BELT.click - 16)) / 16);
  const p = easeInOut((f - BELT.reveal) / 34);
  const cam = lerp(2.6, 1, p) * (1 + 0.04 * clamp((f - BELT.reveal - 34) / 300));
  const own = appear(f, n03.from + 6, 12);
  const ok = appear(f, n03.from + 30, 12);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, backgroundColor: C.cabin }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cam})`, transformOrigin: `${BUCKLE.x}px ${BUCKLE.y}px`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
        <Cabin />
        {KIDS.map((k) => (
          <Seat key={k.x} x={k.x} y={1380} />
        ))}
        {KIDS.map((k, i) => (
          <SeatedKid key={k.x} x={k.x} y={Y} hair={k.hair} shirt={k.shirt} girl={k.girl} f={f} shift={k.shift} look={i === 0 ? clamp((f - n03.from - 20) / 10) - clamp((f - n03.to) / 10) : 0} />
        ))}
        {KIDS.map((k) => (
          <div key={k.x} style={{ position: "absolute", left: k.x - 53 + 34, top: Y - 98 - 70, opacity: ok, transform: `scale(${0.6 + 0.4 * ok})` }}>
            <Check s={60} />
          </div>
        ))}
      </div>
      {/* макроплан пряжки */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - p, pointerEvents: "none" }}>
        <Belt x={540} y={960} s={2.6} rotate={-6} click={click} />
      </div>
      <SceneTitle text={t.title} a={appear(f, Math.max(BELT.reveal, n02.from - 4), 12)} />
      <div style={{ position: "absolute", left: 60, right: 150, top: 460, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ opacity: own, translate: `0 ${(1 - own) * 20}px` }}>
          <Pill bg={C.navy} size={42}>
            {t.own}
          </Pill>
        </div>
        <div style={{ opacity: ok, translate: `0 ${(1 - ok) * 20}px` }}>
          <Pill bg={C.greenSoft} color={C.green} size={40} style={{ border: `3px solid ${C.green}` }}>
            ✓ {t.buckled}
          </Pill>
        </div>
      </div>
    </div>
  );
};

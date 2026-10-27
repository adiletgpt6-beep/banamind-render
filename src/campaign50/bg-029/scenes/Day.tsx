// Сцена 5 (≈48–61 с): три предмета возвращаются и складываются в силуэт
// целого дня ҮЙ → МЕКТЕП → ҮЙ: ремень — утренний путь, бутылка — у школы,
// карточка «Ким тосот?» — у дома после уроков. Солнце идёт дугой от утра
// к дню, маленькая белая машина проходит оба этапа. Всё время сцены
// виден маркер «Шарттуу мисал»; на второй реплике — честная оговорка:
// первая полная проба бесплатна только после формирования группы,
// дальше решает родитель.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp } from "../anim";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { Belt, Bottle, Car, PickupCard, Skyline } from "../parts";
import { BG29_TEXT } from "../script";

const LINE_Y = 1040;
const NODES = [170, 540, 910] as const;

const NodeIcon: React.FC<{ readonly x: number; readonly kind: "home" | "school"; readonly label: string; readonly a: number }> = ({ x, kind, label, a }) => (
  <div style={{ position: "absolute", left: x - 90, top: LINE_Y - 64, width: 180, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `scale(${0.7 + 0.3 * a})` }}>
    <div style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: "#FFFFFF", border: `6px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
      <svg width={70} height={70} viewBox="0 0 48 48">
        {kind === "home" ? (
          <g fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
            <path d="M6 23 L24 8 L42 23" />
            <path d="M11 20 V41 H37 V20" />
            <path d="M20 41 V29 H28 V41" />
          </g>
        ) : (
          <g fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
            <path d="M5 41 H43" />
            <path d="M9 41 V19 H39 V41" />
            <path d="M5 19 L24 8 L43 19" />
            <path d="M20 41 V31 H28 V41" />
          </g>
        )}
      </svg>
    </div>
    <div style={{ marginTop: 10, fontSize: 40, fontWeight: 900, color: C.navy }}>{label}</div>
  </div>
);

export const DayScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n08 = useLine("n08");
  const n09 = useLine("n09");
  const t = BG29_TEXT.day;
  const fly = (i: number) => easeOut((f - (4 + i * 6)) / 22);
  const route = easeInOut((f - 28) / 30);
  const nodes = appear(f, 22, 12);
  const sun = clamp(f / (frames - 20));
  // машина: утренний отрезок на первой реплике, дневной — на второй
  const amFrom = Math.max(56, n08.from);
  const am = easeInOut((f - amFrom) / 70);
  const pmFrom = Math.max(amFrom + 80, n09.from);
  const pm = easeInOut((f - pmFrom) / 80);
  const carX = pm > 0 ? lerp(NODES[1], NODES[2], pm) : lerp(NODES[0], NODES[1], am);
  const trial = appear(f, n09.from - 4, 12);
  const choice = appear(f, useWordAt("n09", 8) - 4, 12);
  const sunX = lerp(120, 960, sun);
  const sunY = 760 - Math.sin(sun * Math.PI) * 170;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, background: `linear-gradient(180deg, ${C.sky} 0%, #FFFFFF 62%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, opacity: 0.55 }}>
        <Skyline h={420} drift={0} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, bottom: 0, backgroundColor: "#FFFFFF" }} />
      {/* солнце: утро → после уроков */}
      <div style={{ position: "absolute", left: sunX - 50, top: sunY - 50, width: 100, height: 100, borderRadius: 50, backgroundColor: C.yellow, boxShadow: `0 0 0 18px ${C.yellowSoft}` }} />
      {/* заголовок и маркер условного примера (всё время сцены) */}
      <div style={{ position: "absolute", left: 60, right: 150, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1, opacity: appear(f, 6, 12), whiteSpace: "nowrap" }}>{t.route.join(" → ")}</div>
        <div style={{ padding: "8px 26px", borderRadius: 999, border: `4px dashed ${C.navy}`, backgroundColor: "#FFFFFF", fontSize: 36, fontWeight: 900 }}>{t.example}</div>
      </div>
      {/* линия дня */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M ${NODES[0]} ${LINE_Y} H ${NODES[2]}`} stroke={C.line} strokeWidth={22} strokeLinecap="round" />
        <path d={`M ${NODES[0]} ${LINE_Y} H ${NODES[2]}`} stroke={C.yellow} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${740 * route} 740`} />
      </svg>
      <div style={{ position: "absolute", left: 255, width: 200, top: LINE_Y + 26, textAlign: "center", fontSize: 30, lineHeight: 1.1, fontWeight: 800, color: C.muted, opacity: appear(f, amFrom, 12) }}>{t.am}</div>
      <div style={{ position: "absolute", left: 625, width: 200, top: LINE_Y + 26, textAlign: "center", fontSize: 30, lineHeight: 1.1, fontWeight: 800, color: C.muted, opacity: appear(f, pmFrom - 6, 12) }}>{t.pm}</div>
      <Car x={carX} y={LINE_Y - 8} s={0.42} />
      <NodeIcon x={NODES[0]} kind="home" label={t.route[0]} a={nodes} />
      <NodeIcon x={NODES[1]} kind="school" label={t.route[1]} a={nodes} />
      <NodeIcon x={NODES[2]} kind="home" label={t.route[2]} a={nodes} />
      {/* три детали прилетают и встают над своими частями дня */}
      <Belt x={lerp(-200, 330, fly(0))} y={lerp(700, 880, fly(0))} s={0.5} rotate={lerp(-40, -6, fly(0))} />
      <Bottle x={lerp(540, 540, fly(1))} y={lerp(1700, 820, fly(1))} s={0.55} label="0,5 л" />
      <PickupCard x={lerp(1300, 760, fly(2))} y={lerp(700, 880, fly(2))} s={0.5} rotate={lerp(40, 4, fly(2))} text={BG29_TEXT.hook.card} />
      {/* честная оговорка */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 150,
          top: 1180,
          padding: "20px 26px",
          borderRadius: 30,
          backgroundColor: "#FFFFFF",
          border: `4px solid ${C.yellow}`,
          boxShadow: "0 12px 28px rgba(20,40,90,0.12)",
          opacity: trial,
          translate: `0 ${(1 - trial) * 24}px`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.15 }}>{t.trial}</div>
        <div style={{ marginTop: 10, fontSize: 36, fontWeight: 800, color: C.ink, opacity: choice }}>{t.choice}</div>
      </div>
    </div>
  );
};

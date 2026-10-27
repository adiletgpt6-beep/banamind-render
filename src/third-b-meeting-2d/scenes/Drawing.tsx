// Сцена 8. «3 Б» попадает в кадр.
// 1) Детские руки крупно (вид сверху, альбом на коленях): твёрдая обложка
//    открывается, внутри — рисунок вывески класса; дочка берёт лист за
//    края. Зритель успевает рассмотреть «3 Б» и мальчика с огромным
//    карандашом.
// 2) A: взгляд дочки на маму → короткое ожидание (мама слушает, кивает)
//    → она осторожно поднимает лист и держит его ровно.
// 3) B: край листа входит в окно Айжан на её экране.
// 4) D: монитор клиента — тот же лист в том же месте входящего потока.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { box, Svg, useAbs, useScene, usePlan } from "../kit";
import { C } from "../theme";
import { ClassDrawing, SHEET } from "../props/Drawing";
import { CloseHand } from "../props/CloseHand";
import { callPlan, liftAt } from "./callPlan";
import { CallA, kyzSeatPose, momCallPose } from "./callA";
import { ShotB, ShotD } from "./callShots";

const KYZ_HAND = { skin: "#EBBE9A", shade: "#D8A57F", sleeve: "#26365A", cuff: "#FFFFFF" } as const;

// 1. Альбом крупно: обложка поворачивается вокруг корешка (слева).
const AlbumClose: React.FC<{ f: number; open: readonly [number, number]; take: number }> = ({ f, open, take }) => {
  const u = easeInOut(clamp((f - open[0]) / (open[1] - open[0])));
  const lift = easeInOut(clamp((f - take) / 16));
  const W = 820;
  const H = (W * SHEET.h) / SHEET.w + 60;
  const x0 = 130;
  const y0 = 620;
  const coverW = W * Math.cos(u * Math.PI);
  return (
    <AbsoluteFill style={{ backgroundColor: "#4A505D" }}>
      {/* колени (юбка) под альбомом */}
      <div style={box({ left: 40, top: 520, width: 1000, height: 1100, borderRadius: 120, backgroundColor: "#26365A" })} />
      {/* задняя обложка и стопка страниц (толщина) */}
      <div style={box({ left: x0 - 6, top: y0 + 10, width: W + 20, height: H + 20, borderRadius: 14, backgroundColor: "#C9732F" })} />
      <div style={box({ left: x0, top: y0, width: W, height: H, borderRadius: 10, backgroundColor: "#F5EFE2", boxShadow: "0 6px 0 #E3DACA, 0 12px 0 #D6CCBA" })} />
      {/* рисунок «3 Б» на странице (берут за края и чуть приподнимают) */}
      <Svg>
        <g transform={`translate(${x0 + 10 - lift * 6} ${y0 + 30 - lift * 30}) scale(${(W - 20) / SHEET.w}) rotate(${-lift * 1.5})`}>
          <ClassDrawing id="s8-close" />
        </g>
      </Svg>
      {/* передняя обложка: проекция сжимается к корешку и уходит влево */}
      {coverW > 0 ? (
        <div style={box({ left: x0, top: y0, width: coverW, height: H, borderRadius: 10, backgroundColor: C.amber, borderRight: "10px solid #C9732F", boxSizing: "border-box" })}>
          <div style={box({ left: 60, top: 60, width: Math.max(0, coverW - 120), height: 120, borderRadius: 10, backgroundColor: "#F6D7B4" })} />
        </div>
      ) : (
        <div style={box({ left: x0 + coverW - 10, top: y0, width: -coverW + 10, height: H, borderRadius: 10, backgroundColor: "#D8843D" })} />
      )}
      <Svg>
        {/* пальцы: открывают обложку за правый край, затем держат лист */}
        {f < take ? (
          <CloseHand x={x0 + Math.max(coverW, -coverW * 0.3) + (u < 1 ? 0 : 60)} y={y0 + H + 180} angle={176} size={190} {...KYZ_HAND} shape="pinch" armLen={3} />
        ) : (
          <>
            <CloseHand x={x0 - 10} y={y0 + H * 0.55 + 240 - lift * 30} angle={160} size={190} {...KYZ_HAND} shape="pinch" mirror armLen={3} />
            <CloseHand x={x0 + W - 40} y={y0 + H + 200 - lift * 30} angle={192} size={190} {...KYZ_HAND} shape="pinch" armLen={3} />
          </>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

export const DrawingScene: React.FC = () => {
  const { f, start, len } = useScene("drawing");
  const c = usePlan(callPlan);
  const abs = useAbs();
  const rel = (t: number) => t - start;
  const open = [rel(c.d.open[0]), rel(c.d.open[1])] as const;
  const take = rel(c.d.take);
  const lookMom = rel(c.d.lookMom);
  const liftFrom = rel(c.d.lift[0]);
  const showB = len - 66;
  const showD = len - 32;
  if (f < lookMom - 6) return <AlbumClose f={f} open={open} take={take} />;
  if (f >= showD) return <ShotD f={f} c={c} uid="s8d" push={clamp((f - showD) / 30)} />;
  if (f >= showB) return <ShotB f={f} c={c} uid="s8b" zoom={1.08} tap={-1} />;
  const lift = liftAt(c, abs(f));
  // A: смотрит на маму, ждёт, поднимает лист
  const kyz = (t: number) => {
    const L = liftAt(c, abs(t));
    return kyzSeatPose(L > 0 ? L : 0.001, {
      expr: t < liftFrom ? "calm" : "softSmile",
      lookY: t < lookMom + 6 ? 0.4 : 0.05,
      lookX: t >= lookMom && t < liftFrom ? 0.5 : 0,
    });
  };
  const kyzFace = (t: number) => keys(t, [[lookMom - 6, 0.1], [lookMom + 6, 0.55], [liftFrom + 30, 0.45]]);
  const mom = (t: number) => momCallPose({ nod: t > lookMom && t < liftFrom ? 3 * Math.max(0, Math.sin((t - lookMom) / 9)) : 0, lookY: 0.32 });
  return (
    <AbsoluteFill>
      <CallA f={f} uid="s8a" lift={lift > 0 ? lift : 0.001} mom={mom} kyz={kyz} kyzFace={kyzFace} album={1} cam={{ x: lerp(500, 560, easeInOut(clamp((f - liftFrom) / 40))), y: 1040, zoom: 1.1 }} />
    </AbsoluteFill>
  );
};

// Типографический слой сцен: подписи привязаны к 3D-точкам через ту же
// позу камеры, что и WebGL-кадр, поэтому выноски точно «держатся» за объект.
import { Vector3 } from "three";
import { makeProjector } from "../engines/CameraTransitionEngine";
import { HEIGHT, WIDTH, type DirectorState } from "../engines/InfiniteWonderDirector";
import { blockTransform } from "../engines/InfiniteJourneyEngine";
import { BLOCK, FOCUS_INDEX, palisadeCells } from "../engines/LayerDiscoveryEngine";
import { SPACE_SUN } from "../engines/LightingSystem";
import { CELL_ANCHORS } from "../components/PlantCell";
import { Callout, EndingCard, QuranCard, ScaleBadge } from "../components/Typography";
import { posePosition } from "../engines/CameraTransitionEngine";

const FOCUS = palisadeCells()[FOCUS_INDEX];

export const SceneOverlays: React.FC<{ st: DirectorState }> = ({ st }) => {
  const project = makeProjector(st.pose, WIDTH, HEIGHT);
  const L = st.labels;
  const out: React.ReactNode[] = [];

  // Сцена 2: день и ночь.
  if (L.dayNight > 0.001) {
    const c = new Vector3(0, 0, st.earth.lift);
    const toCam = posePosition(st.pose).sub(c).normalize();
    const day = project(c.clone().add(SPACE_SUN.clone().multiplyScalar(0.62)).add(toCam.clone().multiplyScalar(0.5)));
    const night = project(c.clone().sub(SPACE_SUN.clone().multiplyScalar(0.62)).add(toCam.clone().multiplyScalar(0.5)));
    out.push(<Callout key="day" text="☀ ДЕНЬ" at={day} opacity={L.dayNight} align="center" size={44} />);
    out.push(<Callout key="night" text="☾ НОЧЬ" at={night} opacity={L.dayNight} align="center" size={44} />);
  }

  // Сцена 4: слои увеличенного среза.
  if (L.layers > 0.001) {
    const m = blockTransform(st.discovery.emerge).matrix;
    const e = st.discovery.explode;
    const ex = BLOCK.explode;
    const hx = BLOCK.sizeX / 2;
    const hz = BLOCK.sizeZ / 2;
    const w = (x: number, y: number, z: number) => project(new Vector3(x, y, z).applyMatrix4(m));
    const items = [
      { text: "ПОВЕРХНОСТЬ", a: w(hx * 0.8, 0.5 + ex.upper * e, hz * 0.5), y: 560, k: 0 },
      { text: "КЛЕТКИ", a: w(hx * 0.75, 0.36 + ex.palisade * e, hz), y: 820, k: 1 },
      { text: "ТКАНИ", a: w(hx * 0.8, 0.13 + ex.spongy * e, hz * 0.85), y: 1080, k: 2 },
    ];
    items.forEach((it) => {
      const op = Math.min(1, Math.max(0, L.layers * 3 - it.k * 0.6));
      out.push(<Callout key={it.text} text={it.text} at={{ x: 1000, y: it.y }} anchor={it.a} opacity={op} align="right" />);
    });
    const bundle = w(-hx, BLOCK.bundle.y + ex.spongy * e, BLOCK.bundle.z);
    out.push(
      <Callout
        key="vein"
        text="ПРОЖИЛКА"
        at={{ x: 70, y: 1300 }}
        anchor={bundle}
        opacity={Math.min(1, Math.max(0, L.layers * 3 - 1.6))}
      />,
    );
  }

  // Сцена 5: устройство клетки.
  if (L.cell > 0.001) {
    const m = blockTransform(st.discovery.emerge).matrix;
    const base = FOCUS.pos.clone().add(new Vector3(0, BLOCK.explode.palisade * st.discovery.explode, 0));
    const sx = FOCUS.size.x / 0.034;
    const sy = FOCUS.size.y / 0.1;
    const w = (a: Vector3) => project(new Vector3(a.x * sx, a.y * sy, a.z * sx).add(base).applyMatrix4(m));
    const cells = [
      { text: "КЛЕТОЧНАЯ СТЕНКА", a: w(CELL_ANCHORS.wall), at: { x: 1010, y: 520 }, align: "right" as const, k: 0 },
      { text: "ЯДРО", a: w(CELL_ANCHORS.nucleus), at: { x: 1010, y: 760 }, align: "right" as const, k: 1 },
      { text: "ХЛОРОПЛАСТЫ", a: w(CELL_ANCHORS.chloroplast), at: { x: 70, y: 1180 }, align: "left" as const, k: 2 },
      { text: "ВАКУОЛЬ", a: w(CELL_ANCHORS.vacuole), at: { x: 1010, y: 1420 }, align: "right" as const, k: 3 },
    ];
    cells.forEach((c) => {
      const op = Math.min(1, Math.max(0, L.cell * 3 - c.k * 0.5));
      out.push(<Callout key={c.text} text={c.text} at={c.at} anchor={c.a} opacity={op} align={c.align} size={34} />);
    });
  }

  return (
    <>
      {out}
      <ScaleBadge text="УВЕЛИЧЕННАЯ СХЕМА" opacity={L.schema} />
      <ScaleBadge text="УВЕЛИЧЕННАЯ МОДЕЛЬ" opacity={L.model} />
      <QuranCard opacity={st.quran} />
      <EndingCard opacity={st.ending} t={st.t} />
    </>
  );
};

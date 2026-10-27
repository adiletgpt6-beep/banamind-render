// Сцена 1 (≈0–6 с), хук. Камера выходит из окна офиса, одним непрерывным
// движением проходит через дневной Бишкек (Ала-Тоо, тополя, арык,
// провода, школа, панельные дома) и входит в окно дома. На словах
// «мектеби» и «үйү» на разных зданиях загораются метки «Мектеп» и «Үй»:
// у каждого ребёнка свои дом и школа. Надпись «БИШКЕК • БИР КАТТАМ» — с
// первых кадров (крючок до 3 с).
import { AbsoluteFill } from "remotion";
import { appear, easeInOutSine, keys, spline, zoomLerp } from "../anim";
import { Layer, Screen, World, type Cam } from "../art/camera";
import { Mountains, OfficeTower, PanelHouse, Pin, Poplar, School, Sky, Street, TrafficCar, Win, Wires, officeWindow, panelWindow, type PanelSpec } from "../art/city";
import { Badge, Caption } from "../art/ui";
import { useSceneFrame, useWordAt } from "../context";
import { C } from "../palette";
import { BG30_TEXT } from "../script";

const G = 1560; // уровень тротуара
const BASE: Cam = { x: 1900, y: 1130, zoom: 1.02 };

export const HOOK_PANEL_A: PanelSpec = { x: 2080, y: G, w: 520, floors: 5, cols: 4, color: C.panelC, seed: 2 };
export const HOOK_PANEL_B: PanelSpec = { x: 2840, y: G, w: 480, floors: 5, cols: 4, color: C.panelB, seed: 5 };
export const HOOK_HOME: PanelSpec = { x: 3420, y: G, w: 600, floors: 9, cols: 5, color: C.panelA, seed: 7 };
const OFFICE = { x: 60, w: 560, floors: 10 };
const OFFICE_WIN = officeWindow(OFFICE.x, G, OFFICE.w, 1, 5);
const HOME_WIN = panelWindow(HOOK_HOME, 2, 5);
const HOME_C = { x: HOME_WIN.x + HOME_WIN.w / 2, y: HOME_WIN.y + HOME_WIN.h / 2 };
const OFFICE_C = { x: OFFICE_WIN.x + OFFICE_WIN.w / 2, y: OFFICE_WIN.y + OFFICE_WIN.h / 2 };

// Камера: из окна офиса — общий план — в окно дома.
// Проход по улице привязан к словам озвучки: школа в центре кадра на
// «мектеби», жилые дома — на «үйү».
export const HOOK_END = 176;
const camAt = (f: number, wSchool: number, wHome: number): Cam => {
  const zoom =
    f < 44 ? zoomLerp(6.2, BASE.zoom, easeInOutSine(f / 44)) : f < 126 ? BASE.zoom : zoomLerp(BASE.zoom, 15, easeInOutSine((f - 126) / (HOOK_END - 126)));
  const a = Math.min(Math.max(wSchool + 4, 60), 100);
  const b = Math.min(Math.max(wHome + 8, a + 12), 118);
  const x = spline(f, [
    [0, OFFICE_C.x],
    [44, 980],
    [a, 1640],
    [b, 2420],
    [HOOK_END, HOME_C.x],
  ]);
  const y = keys(f, [
    [0, OFFICE_C.y],
    [44, BASE.y],
    [126, BASE.y],
    [HOOK_END, HOME_C.y],
  ]);
  return { x, y, zoom };
};

const FarBlocks: React.FC = () => {
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const x = 300 + i * 210;
    const h = 260 + ((i * 97) % 5) * 70;
    blocks.push(
      <g key={i}>
        <rect x={x} y={G - 40 - h} width={170} height={h} fill={i % 3 === 0 ? C.farDark : C.far} />
        {Array.from({ length: Math.floor(h / 60) }, (_, r) =>
          [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={x + 22 + c * 48} y={G - 40 - h + 24 + r * 60} width={26} height={22} fill="#E8F0F8" opacity={0.8} />),
        )}
      </g>,
    );
  }
  return <g>{blocks}</g>;
};

const OfficeInside: React.FC = () => (
  <g>
    <rect x={OFFICE_WIN.x} y={OFFICE_WIN.y} width={OFFICE_WIN.w} height={OFFICE_WIN.h} fill="#EAF1F8" />
    <rect x={OFFICE_WIN.x} y={OFFICE_WIN.y + OFFICE_WIN.h * 0.68} width={OFFICE_WIN.w} height={OFFICE_WIN.h * 0.1} fill="#C9B79E" />
    <rect x={OFFICE_WIN.x + OFFICE_WIN.w * 0.28} y={OFFICE_WIN.y + OFFICE_WIN.h * 0.46} width={OFFICE_WIN.w * 0.3} height={OFFICE_WIN.h * 0.22} rx={2} fill="#5A6B86" />
    <rect x={OFFICE_WIN.x + OFFICE_WIN.w * 0.3} y={OFFICE_WIN.y + OFFICE_WIN.h * 0.48} width={OFFICE_WIN.w * 0.26} height={OFFICE_WIN.h * 0.17} fill="#CFE3F6" />
    <ellipse cx={OFFICE_WIN.x + OFFICE_WIN.w * 0.78} cy={OFFICE_WIN.y + OFFICE_WIN.h * 0.58} rx={OFFICE_WIN.w * 0.07} ry={OFFICE_WIN.h * 0.12} fill={C.poplar} />
    <rect x={OFFICE_WIN.x + OFFICE_WIN.w * 0.75} y={OFFICE_WIN.y + OFFICE_WIN.h * 0.62} width={OFFICE_WIN.w * 0.06} height={OFFICE_WIN.h * 0.06} fill="#B07A52" />
  </g>
);

const HomeInside: React.FC = () => (
  <g>
    <rect x={HOME_WIN.x} y={HOME_WIN.y} width={HOME_WIN.w} height={HOME_WIN.h} fill="#FFE9B5" />
    <circle cx={HOME_WIN.x + HOME_WIN.w * 0.5} cy={HOME_WIN.y + HOME_WIN.h * 0.12} r={HOME_WIN.w * 0.09} fill="#FFF6D8" />
    {/* силуэт мамы за столом */}
    <circle cx={HOME_WIN.x + HOME_WIN.w * 0.56} cy={HOME_WIN.y + HOME_WIN.h * 0.48} r={HOME_WIN.w * 0.09} fill="#2A201D" />
    <path
      d={`M${HOME_WIN.x + HOME_WIN.w * 0.42} ${HOME_WIN.y + HOME_WIN.h} Q${HOME_WIN.x + HOME_WIN.w * 0.56} ${HOME_WIN.y + HOME_WIN.h * 0.52} ${HOME_WIN.x + HOME_WIN.w * 0.7} ${HOME_WIN.y + HOME_WIN.h} Z`}
      fill={C.momTop}
    />
    <rect x={HOME_WIN.x} y={HOME_WIN.y + HOME_WIN.h * 0.8} width={HOME_WIN.w} height={HOME_WIN.h * 0.2} fill={C.woodDark} />
  </g>
);

export const HookScene: React.FC = () => {
  const f = useSceneFrame();
  const wSchool = useWordAt("n01", 6); // «мектеби»
  const wHome = useWordAt("n01", 8); // «үйү»
  const cam = camAt(Math.max(0, f), wSchool, wHome);
  const traffic = (f: number) => (f * 9) % 5200;
  const homeGlow = appear(f, 120, 20);
  const T = BG30_TEXT.hook;
  return (
    <AbsoluteFill>
      <World cam={cam} base={BASE}>
        <Screen>
          <Sky id="hook" />
        </Screen>
        <Layer depth={0.12}>
          <Mountains x={600} y={560} w={2700} h={560} seed={4} color={C.mountainFar} snow={false} />
          <Mountains x={500} y={640} w={3000} h={520} seed={9} />
        </Layer>
        <Layer depth={0.4}>
          <FarBlocks />
          <School x={1900} y={G - 30} w={420} label="" fence={false} />
          <Pin x={2110} y={G - 520} label={T.school} icon="school" k={appear(f, wSchool + 5, 12)} s={0.85} />
          <Pin x={1185} y={G - 380} label={T.home} icon="home" k={appear(f, wHome + 8, 12)} s={0.8} />
        </Layer>
        <Layer depth={1}>
          <Wires x0={-300} x1={4400} y={720} ground={G} />
          <OfficeTower x={OFFICE.x} y={G} w={OFFICE.w} floors={OFFICE.floors} />
          <Win x={OFFICE_WIN.x} y={OFFICE_WIN.y} w={OFFICE_WIN.w} h={OFFICE_WIN.h} frame="#DDE5EE" clipId="hook-office">
            <OfficeInside />
          </Win>
          <Poplar x={720} y={G} h={640} />
          <Poplar x={860} y={G} h={700} tone={0.06} />
          <Poplar x={1000} y={G} h={600} />
          <Poplar x={1150} y={G} h={660} tone={-0.05} />
          <School x={1250} y={G} w={760} label={T.school} />
          <Poplar x={2030} y={G} h={620} />
          <PanelHouse p={HOOK_PANEL_A} />
          <Poplar x={2680} y={G} h={680} tone={0.05} />
          <Poplar x={2780} y={G} h={600} />
          <PanelHouse p={HOOK_PANEL_B} />
          <Poplar x={3360} y={G} h={640} />
          <PanelHouse p={HOOK_HOME} lit={[[2, 5]]} />
          <Win x={HOME_WIN.x} y={HOME_WIN.y} w={HOME_WIN.w} h={HOME_WIN.h} lit={1} curtains clipId="hook-home">
            <HomeInside />
          </Win>
          <rect x={HOME_WIN.x - 6} y={HOME_WIN.y - 6} width={HOME_WIN.w + 12} height={HOME_WIN.h + 12} rx={6} fill="none" stroke={C.yellow} strokeWidth={4} opacity={homeGlow} />
          <Poplar x={4080} y={G} h={660} />
          <Street x0={-600} x1={4600} y={G} dash={f * 6} />
          <TrafficCar x={-200 + traffic(f)} y={G + 330} color="#D8746A" />
          <TrafficCar x={2600 + traffic(f + 260) * 0.8} y={G + 330} color="#7E93B8" />
          <TrafficCar x={4300 - traffic(f + 120)} y={G + 470} color="#5FA39A" dir={-1} />
          <TrafficCar x={2200 - traffic(f + 40) * 0.7} y={G + 470} color="#C9A14A" dir={-1} />
          {/* метки: у каждого — свой дом и своя школа */}
          <Pin x={1630} y={G - 560} label={T.school} icon="school" k={appear(f, wSchool, 12)} />
          <Pin {...pinAt(HOOK_PANEL_A, 1, 3)} label={T.home} icon="home" k={appear(f, wHome, 12)} />
          <Pin {...pinAt(HOOK_PANEL_B, 2, 2)} label={T.home} icon="home" k={appear(f, wHome + 14, 12)} />
          <Pin x={HOME_C.x} y={HOME_WIN.y - 16} label={T.home} icon="home" k={appear(f, 112, 12) * (1 - appear(f, 146, 10))} s={0.75} />
        </Layer>
      </World>
      <Badge f={f} at={-8} out={150} text={T.badge} top={250} size={50} />
      <Caption f={f} at={92} out={150} text={T.line} top={372} size={42} />
    </AbsoluteFill>
  );
};

const pinAt = (p: PanelSpec, col: number, row: number) => {
  const w = panelWindow(p, col, row);
  return { x: w.x + w.w / 2, y: w.y - 14 };
};

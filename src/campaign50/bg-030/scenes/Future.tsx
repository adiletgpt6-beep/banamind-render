// Сцена 5 (≈47–60 с), только условное будущее: «Шарттуу мисал» виден всю
// сцену. Та же улица Бишкека в параллаксе. Утром (низкое солнце, тёплое
// небо) белая машина везёт троих пристёгнутых детей от дома к школе; после
// уроков (дневной свет) — обратно домой. Без карты, стрелок, кольца и
// часов. Затем камера возвращается к окну дома (вход в финал).
import { AbsoluteFill } from "remotion";
import { appear, easeInOut, lerp, spline } from "../anim";
import { Layer, Screen, World, type Cam } from "../art/camera";
import { WhiteCar } from "../art/car";
import { Mountains, PanelHouse, Poplar, School, Sky, Street, mix, panelWindow, type PanelSpec } from "../art/city";
import { Badge, Caption } from "../art/ui";
import { useLine, useSceneFrame, useWordAt } from "../context";
import { C } from "../palette";
import { BG30_TEXT } from "../script";

const G = 1500;
const BASE: Cam = { x: 1700, y: 1455, zoom: 1.2 };
export const FUT_HOME: PanelSpec = { x: 0, y: G, w: 600, floors: 9, cols: 5, color: C.panelA, seed: 7 };
const HOME_WIN = panelWindow(FUT_HOME, 2, 5);
const HOME_C = { x: HOME_WIN.x + HOME_WIN.w / 2, y: HOME_WIN.y + HOME_WIN.h / 2 };
const P1: PanelSpec = { x: 980, y: G, w: 520, floors: 5, cols: 4, color: C.panelC, seed: 2 };
const P2: PanelSpec = { x: 1760, y: G, w: 480, floors: 5, cols: 4, color: C.panelB, seed: 5 };
const SCHOOL_X = 2560;
const SCHOOL_W = 760;
const LANE = G + 230;
const HOME_STOP = 720;
const SCHOOL_STOP = SCHOOL_X + SCHOOL_W / 2 - 40;

export const FutureScene: React.FC = () => {
  const f = Math.max(0, useSceneFrame());
  const T = BG30_TEXT.future;
  const n05 = useLine("n05");
  const wFirst = useWordAt("n05", 2); // «биринчи»
  const wSchool = useWordAt("n05", 8); // «мектепке»
  const wAfter = useWordAt("n05", 10); // «сабактан»
  const wHome = useWordAt("n05", 13); // «үйгө»
  // утро → к школе (приезд к слову «мектепке»), затем смена времени дня,
  // после уроков → домой (приезд к слову «үйгө» или чуть позже)
  const arrive1 = Math.max(110, wSchool + 6);
  const shift0 = Math.max(arrive1 + 6, wAfter - 14);
  const shift1 = shift0 + 26;
  const arrive2 = Math.max(shift1 + 110, wHome + 30);
  const morning = f < shift1 - 13;
  const carX = spline(f, [
    [0, HOME_STOP],
    [16, HOME_STOP],
    [arrive1, SCHOOL_STOP],
    [shift1, SCHOOL_STOP],
    [arrive2, HOME_STOP + 60],
  ]);
  const dir: 1 | -1 = morning ? 1 : -1;
  const wheel = carX * 0.9 * dir;
  // время дня 0 — утро, 1 — день
  const day = easeInOut((f - shift0) / (shift1 - shift0));
  const skyTop = mix(C.morningTop, C.skyTop, day);
  const skyBottom = mix(C.morningBottom, C.skyBottom, day);
  const sun = { x: lerp(160, 900, day), y: lerp(560, 260, day) };
  // камера ведёт машину; в конце — к окну дома
  const follow = Math.max(450, Math.min(SCHOOL_X + SCHOOL_W / 2, carX + 60 * dir));
  const toWin = easeInOut((f - (arrive2 + 8)) / 40);
  const cam: Cam = {
    x: lerp(follow, HOME_C.x, toWin),
    y: lerp(BASE.y, HOME_C.y + 120, toWin),
    zoom: lerp(BASE.zoom, 1.6, toWin),
  };
  const pmLabel = appear(f, shift1 - 4, 10) * (1 - appear(f, arrive2 + 4, 8));
  const payAt = Math.max(arrive2 - 10, n05.to + 14);
  return (
    <AbsoluteFill>
      <World cam={cam} base={BASE}>
        <Screen>
          <Sky id={`fut-${Math.round(day * 20)}`} top={skyTop} bottom={skyBottom} />
          <circle cx={sun.x} cy={sun.y} r={70} fill="#FFF3C4" opacity={0.95} />
          <circle cx={sun.x} cy={sun.y} r={110} fill="#FFF3C4" opacity={0.25} />
        </Screen>
        <Layer depth={0.12}>
          <Mountains x={600} y={580} w={2400} h={560} seed={44} color={mix("#C8B7C9", C.mountain, day)} />
        </Layer>
        <Layer depth={0.45}>
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={500 + i * 200} y={G - 40 - (240 + ((i * 53) % 4) * 80)} width={160} height={240 + ((i * 53) % 4) * 80} fill={mix("#E6D6D3", C.far, day)} />
          ))}
        </Layer>
        <Layer depth={1}>
          <PanelHouse p={FUT_HOME} lit={[[2, 5]]} />
          <rect x={HOME_WIN.x - 5} y={HOME_WIN.y - 5} width={HOME_WIN.w + 10} height={HOME_WIN.h + 10} rx={5} fill="none" stroke={C.yellow} strokeWidth={4} opacity={appear(f, arrive2, 16)} />
          <Poplar x={700} y={G} h={680} />
          <Poplar x={860} y={G} h={600} tone={0.06} />
          <PanelHouse p={P1} />
          <Poplar x={1580} y={G} h={660} />
          <Poplar x={1690} y={G} h={620} tone={-0.04} />
          <PanelHouse p={P2} />
          <Poplar x={2360} y={G} h={680} />
          <Poplar x={2470} y={G} h={600} tone={0.05} />
          <School x={SCHOOL_X} y={G} w={SCHOOL_W} label={BG30_TEXT.hook.school} />
          <Poplar x={3420} y={G} h={660} />
          <Street x0={-800} x1={4200} y={G} />
          <WhiteCar x={carX} y={LANE} dir={dir} s={1.25} wheel={wheel} />
        </Layer>
      </World>
      <Badge f={f} at={0} text={T.example} top={240} size={40} tone="yellow" instant />
      <Caption f={f} at={wFirst} text={T.badge} top={330} size={38} />
      <Badge f={f} at={8} out={shift0} text={T.am} top={474} size={34} />
      {pmLabel > 0 ? <Badge f={f} at={shift1 - 4} out={arrive2 + 4} text={T.pm} top={474} size={34} /> : null}
      <Caption f={f} at={payAt} text={T.pay} top={460} size={34} accent={C.navy} />
    </AbsoluteFill>
  );
};


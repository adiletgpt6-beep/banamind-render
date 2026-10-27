// Площадка предпросмотра (не кадр фильма): персонажи №31 в движении.
// Композиция M13LabCast (папка Scenes в Studio, 600 кадров):
//   0–149   директор идёт слева направо и останавливается (стопы не
//           скользят — сверяйте по линейке пола), сын бежит и
//           останавливается;
//   150–299 помощница с планшетом поворачивается: глаза → голова → корпус
//           (с наклоном головы и кивком — шея, уши и волосы связаны),
//           затем смотрит в планшет;
//   300–449 директор подходит к столу и садится (слои body → столешница →
//           arms), кладёт руки на стол, берёт ручку;
//   450–599 губы по реальной озвучке F01 (role="father"), ниже — разные
//           моргания (у каждого свой seed/blinkShift) и предметы в руках:
//           рисунок, ключи, приветствие, телефон экраном к зрителю.
//   npx remotion still src/index.ts M13LabCast out.png --frame=N
import { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../fonts";
import { SceneContext, TimelineContext } from "../context";
import { Grain, Shot, Svg } from "../kit";
import { loadM13PreviewManifest } from "../loadManifest";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { cruise, easeInOut, keys, lerp } from "../rig/motion";
import { H, seatOf, sitDown } from "../scenes/common";
import { M13_VIDEO } from "../script";
import { C, F } from "../theme";
import { buildM13Timeline, estimateM13Manifest, type M13Timeline } from "../timing";

const FPS = M13_VIDEO.fps;

const Title: React.FC<{ text: string; y?: number }> = ({ text, y = 60 }) => (
  <div style={{ position: "absolute", left: 60, top: y, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.navy }}>{text}</div>
);

// Пол с линейкой (деления каждые 40 px): по ним видно, стоит ли опорная стопа.
const Floor: React.FC<{ y: number; color?: string }> = ({ y, color = C.paperDeep }) => (
  <Svg>
    <rect x={0} y={y} width={1080} height={1920 - y} fill={color} opacity={0.55} />
    <line x1={0} y1={y} x2={1080} y2={y} stroke="#C9C1B3" strokeWidth={3} />
    {Array.from({ length: 28 }, (_, i) => (
      <line key={i} x1={i * 40} y1={y + 6} x2={i * 40} y2={y + (i % 5 === 0 ? 26 : 16)} stroke="#B5AC9C" strokeWidth={2} />
    ))}
  </Svg>
);

// ---------- 1. Ходьба и бег ----------
const Walk: React.FC<{ f: number }> = ({ f }) => {
  const dadFloor = 860;
  const sonFloor = 1640;
  const dad = (t: number): Place => ({ x: lerp(130, 760, cruise((t - 12) / 96)), y: dadFloor, h: 660 });
  // бег: быстрее и шире шаг, лёгкий наклон корпуса вперёд
  const son = (t: number): Place => ({ x: lerp(150, 830, cruise((t - 24) / 54, 0.18)), y: sonFloor, h: 520 });
  const sonSpeed = (t: number) => Math.abs(son(t + 1).x - son(t - 1).x) / 2;
  return (
    <>
      <Title text="Жүрүү жана токтоо" />
      <Floor y={dadFloor} />
      <Floor y={sonFloor} color="#E2DBCF" />
      <Actor uid="w-dad" look="m13Director" f={f} place={dad} face={() => -0.25} pose={() => ({ expr: "calm" })} seed={2} blinkShift={11} />
      <Actor
        uid="w-son"
        look="m13Son"
        f={f}
        place={son}
        face={() => -0.3}
        pose={(t) => ({ expr: "smile", lean: Math.min(8, sonSpeed(t) * 0.6) })}
        seed={9}
        blinkShift={23}
      />
    </>
  );
};

// ---------- 2. Поворот помощницы ----------
// Средний план через зум камеры (как в сценах): рост 765, zoom 2,6.
const Turn: React.FC<{ f: number }> = ({ f }) => {
  const place: Place = { x: 540, y: 1500, h: H.assistant };
  const at = (dx: number, dy: number) => ({ x: place.x + (dx * place.h) / 1000, y: place.y + (dy * place.h) / 1000 });
  const face = (t: number) =>
    keys(t, [
      [8, 0],
      [16, 0.8],
      [60, 0.8],
      [70, -0.8],
      [112, -0.8],
      [124, 0],
    ]);
  const pose = (t: number): PoseIn => {
    const down = keys(t, [
      [124, 0],
      [134, 1],
    ]);
    // проверка связи шеи/ушей/волос: наклон головы в повороте вправо,
    // кивок в повороте влево
    const tilt = keys(t, [
      [22, 0],
      [30, 10],
      [44, 10],
      [52, -8],
      [60, 0],
    ]);
    const nod = keys(t, [
      [76, 0],
      [84, 12],
      [100, 12],
      [108, 0],
    ]);
    return {
      expr: down > 0.5 ? "softSmile" : "calm",
      lookY: down * 0.8 + nod * 0.04,
      nod: down * 6 + nod,
      headTilt: tilt,
      armL: { target: at(-10, lerp(-560, -600, down)), shape: "fist", item: "tablet", facing: "self", itemTilt: -6, elbow: "hang", behind: false },
      armR: { target: at(70, -470), shape: "relax", elbow: "down", behind: false },
    };
  };
  const head = at(0, -760);
  return (
    <Shot f={f} cam={{ x: head.x, y: head.y + 40, zoom: 2.6 }} bg="#DDE5EE">
      <Svg>
        <rect x={0} y={0} width={1080} height={1500} fill="url(#lc-wall)" />
        <defs>
          <linearGradient id="lc-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E3E9F0" />
            <stop offset="1" stopColor="#CDD7E3" />
          </linearGradient>
        </defs>
      </Svg>
      <Actor uid="t-ast" look="m13Assistant" f={f} place={() => place} face={face} pose={pose} seed={4} blinkShift={7} />
    </Shot>
  );
};

// ---------- 3. Посадка за стол ----------
const Sit: React.FC<{ f: number }> = ({ f }) => {
  const floor = 1480;
  const h = 760;
  const chairX = 560;
  const seat = seatOf(h) + 26;
  const tableTop = floor - h * 0.42;
  const place = (t: number): Place => ({ x: lerp(170, chairX, cruise((t - 6) / 52)), y: floor, h });
  const face = (t: number) => (t < 60 ? 0 : keys(t, [[60, 0], [70, 0.15]]));
  const t0 = 72;
  const pose = (t: number): PoseIn => {
    const s = sitDown(t, t0, 34);
    // руки на стол после посадки, затем правая берёт ручку
    const hands = easeInOut((t - t0 - 30) / 16);
    const pen = keys(t, [[118, 0], [126, 1]]);
    const restL = { x: chairX - 90, y: floor - h * 0.43 };
    return {
      sit: s.sit,
      lean: s.lean + hands * 4,
      seat,
      expr: "calm",
      lookY: hands * 0.6,
      nod: hands * 4,
      armL: hands > 0 ? { target: { x: lerp(chairX - 66, restL.x, hands), y: lerp(floor - 210, tableTop - 6, hands) }, shape: "relax", elbow: "hang", behind: false } : undefined,
      armR:
        hands > 0
          ? { target: { x: lerp(chairX + 66, chairX + 70 - pen * 14, hands), y: lerp(floor - 210, tableTop - 8 - pen * 10, hands) }, shape: pen > 0.5 ? "fist" : "relax", item: pen > 0.5 ? "pen" : "none", elbow: "hang", behind: false }
          : undefined,
    };
  };
  const body = { uid: "s-dad", look: "m13Director" as const, f, place, face, pose, seed: 2, blinkShift: 31 };
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(#E3E9F0 0%, #E3E9F0 70%, #C3CBD6 70%)" }} />
      <Title text="Отуруу" />
      {/* стул: спинка за героем */}
      <Svg>
        <rect x={chairX - 70} y={floor - seat - h * 0.36} width={140} height={h * 0.32} rx={22} fill="#5E6A7E" stroke="#3E485A" strokeWidth={3} />
        <rect x={chairX - 78} y={floor - seat - 6} width={156} height={20} rx={9} fill="#6E7A8E" stroke="#3E485A" strokeWidth={3} />
        <rect x={chairX - 6} y={floor - seat + 12} width={12} height={seat - 30} fill="#4A5468" />
        <path d={`M ${chairX - 60} ${floor - 4} L ${chairX} ${floor - 26} L ${chairX + 60} ${floor - 4}`} stroke="#4A5468" strokeWidth={8} fill="none" strokeLinecap="round" />
      </Svg>
      <Actor {...body} layer="body" />
      {/* столешница перед героем */}
      <Svg>
        <rect x={chairX - 300} y={tableTop + 20} width={22} height={floor - tableTop - 16} fill="#B89B76" stroke="#8E7556" strokeWidth={3} />
        <rect x={chairX + 278} y={tableTop + 20} width={22} height={floor - tableTop - 16} fill="#B89B76" stroke="#8E7556" strokeWidth={3} />
        <rect x={chairX - 330} y={tableTop} width={660} height={30} rx={8} fill="#D9C3A5" stroke="#A88E6C" strokeWidth={3} />
        <rect x={chairX - 326} y={tableTop + 22} width={652} height={8} fill="#C4AA86" />
        <rect x={chairX + 150} y={tableTop - 10} width={120} height={10} rx={3} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={2} />
      </Svg>
      <Actor {...body} layer="arms" />
    </>
  );
};

// ---------- 4. Губы и моргание ----------
// Окно с зумом (как камера Shot): мировая точка (wx, wy) — в точку экрана
// (sx, sy); линии масштабируются вместе с рисунком.
const Zoom: React.FC<{ sx: number; sy: number; wx: number; wy: number; z: number; children: React.ReactNode }> = ({ sx, sy, wx, wy, z, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1, transformOrigin: "0 0", transform: `translate(${sx}px, ${sy}px) scale(${z}) translate(${-wx}px, ${-wy}px)` }}>{children}</div>
);

const Lips: React.FC<{ f: number; tl: M13Timeline }> = ({ f, tl }) => {
  const cue = tl.cues.find((c) => c.line === "F01");
  const start = 6; // кадр сегмента, где начинается речь
  const cueFrame = cue ? Math.round(cue.from * FPS) : 0;
  const audioFrom = cue ? Math.round(cue.audioFrom * FPS) : 0;
  const blinkers: { look: "m13Son" | "m13Assistant" | "m13Grandma" | "m13Client"; h: number; seed: number; shift: number }[] = [
    { look: "m13Son", h: H.son, seed: 9, shift: 23 },
    { look: "m13Assistant", h: H.assistant, seed: 4, shift: 7 },
    { look: "m13Grandma", h: H.grandma, seed: 12, shift: 41 },
    { look: "m13Client", h: H.client, seed: 6, shift: 3 },
  ];
  const dad: Place = { x: 540, y: 1000, h: H.dad };
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(#F2DFC6, #E2C7A6)" }} />
      {/* сцена со сдвигом: кадр сегмента start = начало реплики F01 */}
      <Zoom sx={540} sy={640} wx={540} wy={1000 - 0.86 * H.dad} z={3}>
        <SceneContext.Provider value={{ from: cueFrame - start, to: cueFrame - start + 200 }}>
          <Actor uid="l-dad" look="m13Director" f={f} place={() => dad} face={() => -0.12} pose={() => ({ expr: "calm", lookX: 0.1 })} role="father" seed={2} blinkShift={31} />
        </SceneContext.Provider>
      </Zoom>
      {cue?.file ? (
        <Sequence from={450 + start - (cueFrame - audioFrom)} layout="none">
          <Audio src={staticFile(`${M13_VIDEO.voiceDir}/${cue.file}`)} />
        </Sequence>
      ) : null}
      <div style={{ position: "absolute", left: 0, top: 1240, width: 1080, height: 680, background: "#F6F3EE" }} />
      <Zoom sx={0} sy={1240} wx={0} wy={260} z={1.7}>
        {blinkers.map((b, i) => {
          const p: Place = { x: 95 + i * 155, y: 900, h: b.h };
          const at = (dx: number, dy: number) => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
          // предметы в руках крупнее: рисунок, ключи, телефон с экраном
          const arms: PoseIn[] = [
            { armL: { target: at(-64, -615), shape: "pinch", item: "drawing", facing: "camera", elbow: "hang", behind: false }, armR: { target: at(64, -615), shape: "pinch", elbow: "hang", behind: false } },
            { armR: { target: at(40, -590), shape: "fist", item: "keys", elbow: "hang", behind: false } },
            { armR: { target: at(70, -940), shape: "wave", elbow: "out", behind: false } },
            { armL: { target: at(-30, -600), shape: "phone", item: "phone", glow: 1, itemTilt: -4, elbow: "hang", behind: false } },
          ];
          return <Actor key={b.look} uid={`b-${b.look}`} look={b.look} f={f} place={() => p} face={() => (i % 2 ? -0.25 : 0.25)} pose={() => ({ expr: "calm", ...arms[i] })} seed={b.seed} blinkShift={b.shift} />;
        })}
      </Zoom>
      <Title text="Эрин жана көз ирмөө" />
    </>
  );
};

export const LabCast: React.FC = () => {
  const frame = useCurrentFrame();
  // реальная озвучка (если есть) — для губ; иначе оценочная шкала
  const [tl, setTl] = useState<M13Timeline | null>(null);
  const [handle] = useState(() => delayRender("M13LabCast: озвучка"));
  useEffect(() => {
    loadM13PreviewManifest()
      .then((m) => setTl(buildM13Timeline(m)))
      .catch(() => setTl(buildM13Timeline(estimateM13Manifest())))
      .finally(() => continueRender(handle));
  }, [handle]);
  if (!tl) return null;
  const seg = Math.min(3, Math.floor(frame / 150));
  const f = frame - seg * 150;
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: seg * 150, to: seg * 150 + 150 }}>
        <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
          {seg === 0 ? <Walk f={f} /> : seg === 1 ? <Turn f={f} /> : seg === 2 ? <Sit f={f} /> : <Lips f={f} tl={tl} />}
          {seg === 1 ? <Title text="Көз → баш → дене" /> : null}
          <Grain />
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};

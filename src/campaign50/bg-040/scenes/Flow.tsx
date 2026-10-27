// Сцена 2: «Жумуш — мектеп — жумуш».
//
// Офис в Бишкеке. Камера отъезжает от настенных часов (продолжение
// стрелки из хука) на общий план: мама увлечённо собирает слайд
// презентации, работа идёт. В 12:30 на столе загорается телефон —
// напоминание «Мектепке баруу». Мама смотрит на него, поворачивается и
// говорит: «Ишимдин эң кызык жерине келгенде, мектептен баламды алышым
// керек болот», — и сама закрывает крышку ноутбука. Камера повторяет
// движение крышки: кадр «складывается» сверху, короткая пауза, и три
// полосы по тактам: 12:30 жумуш (сумка на плече, взгляд на часы) →
// 13:10 мектеп (мама с сыном за руку выходят со двора школы) → 13:50
// жумуш (крышка снова открыта: «Кайда калдым эле?»).
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../../../two-schedules-2d/rig/motion";
import { SchoolBack, SchoolFence } from "../../../two-schedules-2d/sets/School";
import { fontFamily } from "../../../fonts";
import { box, Panel, useSceneFrames, useTimeline, type Cam } from "../context";
import { lineFramesIn, wordAt, type Bg40Timeline } from "../timing";
import { BG40_TEXT } from "../script";
import { secondsAngle, TimeChip } from "../kit/Clock";
import { Chip } from "../kit/Labels";
import { Laptop3D, SlideScreen } from "../kit/Laptop";
import { Desk, DeskProps, OFFICE, OfficeBack } from "../kit/Office";
import { handFamily } from "../kit/fonts";
import { C } from "../kit/theme";

const MOM = OFFICE.mom;
const SEAT = 0.27 * MOM.h; // высота сиденья (как seatH в риге)
export const momSeated = (): Place => ({ x: MOM.x, y: MOM.y, h: MOM.h });


// Клавиатура ноутбука (мировые px): кисти печатают.
const KEY_L = { x: 668, y: 1288 };
const KEY_R = { x: 774, y: 1296 };

// Верхний край крышки при раскрытии o (0…1) — куда тянется рука.
const lidTop = (o: number) => {
  const tilt = ((-90 + 104 * o) * Math.PI) / 180;
  return { x: OFFICE.laptop.x - 22 + 30 * (1 - o), y: OFFICE.laptop.y - 214 * Math.cos(tilt) * 0.97 + 64 * Math.max(0, -Math.sin(tilt)) };
};

// Офисное кресло за спиной.
const ChairBack: React.FC = () => (
  <>
    <div style={box({ left: MOM.x - 132, top: 1010, width: 264, height: 330, borderRadius: "70px 70px 30px 30px", background: "linear-gradient(180deg, #3B4766 0%, #2C3550 100%)" })} />
    <div style={box({ left: MOM.x - 112, top: 1030, width: 224, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)" })} />
  </>
);

// Сидящая мама за столом: тело — до столешницы, руки — поверх стола
// и ноутбука. lid — раскрытие крышки (0…1), build — сборка слайда.
export const OfficeShot: React.FC<{
  readonly uid: string;
  readonly f: number;
  readonly pose: (t: number) => PoseIn;
  readonly face: (t: number) => number;
  readonly lid: number;
  readonly build: number;
  readonly minutes: number;
  readonly phoneGlow?: number;
  readonly phoneShake?: number;
  readonly dim?: number;
  readonly role?: boolean;
  readonly extra?: React.ReactNode;
}> = ({ uid, f, pose, face, lid, build, minutes, phoneGlow = 0, phoneShake = 0, dim = 0, role, extra }) => (
  <>
    <OfficeBack minutes={minutes} sec={secondsAngle(f)} />
    <ChairBack />
    <Actor uid={uid} look="mom" f={f} place={momSeated} face={face} pose={(t) => ({ sit: 1, seat: SEAT, ...pose(t) })} role={role ? "mother" : undefined} seed={4} layer="body" />
    <Desk />
    <DeskProps phoneGlow={phoneGlow} phoneShake={phoneShake} />
    <Laptop3D x={OFFICE.laptop.x} y={OFFICE.laptop.y} open={lid} screen={<SlideScreen build={build} f={f} dim={dim} />} />
    <Actor uid={uid} look="mom" f={f} place={momSeated} face={face} pose={(t) => ({ sit: 1, seat: SEAT, ...pose(t) })} seed={4} layer="arms" />
    {extra}
  </>
);

// Печатает: кисти на клавиатуре с мелким ритмичным движением.
const typing = (t: number, k = 1) => ({
  armL: { target: { x: KEY_L.x + Math.sin(t * 0.9) * 4 * k, y: KEY_L.y - Math.abs(Math.sin(t * 1.7)) * 7 * k }, shape: "relax" as const, elbow: "down" as const },
  armR: { target: { x: KEY_R.x + Math.sin(t * 0.7 + 1) * 4 * k, y: KEY_R.y - Math.abs(Math.sin(t * 1.9 + 0.8)) * 7 * k }, shape: "relax" as const, elbow: "down" as const },
});

// Полосы монтажа «жумуш — мектеп — жумуш».
const BAND_H = 640;

// Ключевые моменты сцены (кадры сцены) — общие для анимации и звука.
export const flowBeats = (tl: Bg40Timeline) => {
  const m1 = lineFramesIn(tl, "m1");
  const remind = Math.max(24, m1.from - 32);
  const closeFrom = Math.min(wordAt(tl, "m1", "алышым"), m1.to - 30);
  const closeTo = m1.to + 4;
  const fold = closeTo + 4; // кадр «складывается» как крышка
  const mont = fold + 16; // начало полос монтажа
  return { m1, remind, closeFrom, closeTo, fold, mont, b2: mont + 26, b3: mont + 52 };
};

export const FlowScene: React.FC = () => {
  const f = useCurrentFrame();
  const total = useSceneFrames("flow");
  const fb = flowBeats(useTimeline());
  const m1 = fb.m1;
  const REMIND = fb.remind;
  const CLOSE_FROM = fb.closeFrom;
  const CLOSE_TO = fb.closeTo;
  const FOLD = fb.fold;
  const MONT = fb.mont;
  const B2 = fb.b2;
  const B3 = fb.b3;

  if (f >= MONT) return <Montage f={f} mont={MONT} b2={B2} b3={B3} total={total} />;

  const lid = 1 - easeInOut((f - CLOSE_FROM) / (CLOSE_TO - CLOSE_FROM));
  const build = lerp(0.3, 0.86, clamp(f / REMIND));
  const remind = clamp((f - REMIND) / 8);
  const glow = f >= REMIND ? 1 : 0;
  const shake = f >= REMIND && f < REMIND + 18 ? Math.sin(f * 2.6) * 3 : 0;

  // взгляд: ноутбук → телефон → в камеру → ноутбук (закрывает)
  const face = (tt: number) => keys(tt, [[0, 0.5], [REMIND + 2, 0.5], [REMIND + 10, -0.35], [m1.from - 4, -0.35], [m1.from + 8, 0.12], [CLOSE_FROM - 10, 0.12], [CLOSE_FROM + 2, 0.45]]);
  const pose = (tt: number): PoseIn => {
    const typingK = 1 - clamp((tt - REMIND) / 6);
    const base = typing(tt, typingK);
    const lookPhone = tt >= REMIND && tt < m1.from;
    const expr = tt < REMIND ? ("smile" as const) : tt < m1.from ? ("surprised" as const) : tt < CLOSE_FROM ? ("softSmile" as const) : ("tired" as const);
    // правая рука: жест к экрану на «ишимдин…», затем крышка
    const gesture = keysV(tt, [
      [m1.from + 2, KEY_R],
      [m1.from + 14, { x: 700, y: 1150 }],
      [CLOSE_FROM - 14, { x: 690, y: 1140 }],
      [CLOSE_FROM - 2, lidTop(1)],
    ], anticipate);
    const lidHand = lidTop(1 - easeInOut((tt - CLOSE_FROM) / (CLOSE_TO - CLOSE_FROM)));
    const armR =
      tt < m1.from
        ? base.armR
        : tt < CLOSE_FROM
          ? { target: gesture, shape: tt > m1.from + 10 && tt < CLOSE_FROM - 12 ? ("open" as const) : ("relax" as const), elbow: "down" as const, wrist: -20 }
          : { target: tt < CLOSE_TO ? lidHand : keysV(tt, [[CLOSE_TO, lidHand], [CLOSE_TO + 14, { x: 700, y: 1300 }]]), shape: "open" as const, elbow: "down" as const, wrist: -60 };
    const armL = tt < REMIND ? base.armL : { target: keysV(tt, [[REMIND, KEY_L], [REMIND + 10, { x: 600, y: 1296 }]]), shape: "relax" as const, elbow: "down" as const };
    return {
      expr,
      armL,
      armR,
      lookY: lookPhone ? 0.6 : tt < REMIND ? 0.25 : 0,
      lookX: lookPhone ? -0.3 : 0,
      nod: keys(tt, [[m1.to - 20, 0], [m1.to - 8, 4], [m1.to + 6, 2]]),
      headTilt: keys(tt, [[m1.from, 0], [m1.from + 20, -4], [CLOSE_FROM, -2]]),
      lean: keys(tt, [[CLOSE_FROM - 6, 0], [CLOSE_FROM + 10, 8], [CLOSE_TO + 10, 3]]),
      shoulders: keys(tt, [[CLOSE_TO - 6, 0], [CLOSE_TO + 4, 0.4], [CLOSE_TO + 20, 0]]),
    };
  };

  // камера: отъезд от часов → общий план → наезд на маму во время реплики
  const camWide: Cam = { x: 556, y: 1050, zoom: 1.16 };
  const camClock: Cam = { x: OFFICE.clock.x, y: OFFICE.clock.y, zoom: 4.2 };
  const camMid: Cam = { x: 590, y: 1110, zoom: 1.55 };
  const u0 = easeInOut(f / 26);
  const u1 = easeInOut((f - m1.from + 10) / 50);
  const cam: Cam =
    f < 26
      ? { x: lerp(camClock.x, camWide.x, u0), y: lerp(camClock.y, camWide.y, u0), zoom: Math.exp(lerp(Math.log(camClock.zoom), Math.log(camWide.zoom), u0)) }
      : { x: lerp(camWide.x, camMid.x, u1), y: lerp(camWide.y, camMid.y, u1), zoom: lerp(camWide.zoom, camMid.zoom, u1) };

  // «крышка» кадра: панель складывается сверху и снова поднимается
  const fold = easeInOut((f - FOLD) / 8);
  return (
    <>
      <Panel cam={cam} bg={C.wall}>
        <OfficeShot uid="flow-mom" f={f} pose={pose} face={face} lid={lid} build={build} minutes={748 + 2 * clamp(f / REMIND)} phoneGlow={glow} phoneShake={shake} role />
      </Panel>
      {/* напоминание на телефоне — крупно */}
      {remind > 0 && f < CLOSE_FROM ? <Reminder a={remind * (1 - clamp((f - m1.from - 30) / 10))} /> : null}
      {f >= FOLD ? <FoldPanel p={fold} /> : null}
    </>
  );
};

// Уведомление «Эскертме · 12:30 · Мектепке баруу» (как баннер телефона).
const Reminder: React.FC<{ readonly a: number }> = ({ a }) => {
  const t = BG40_TEXT.flow;
  return (
    <div
      style={box({
        left: 90,
        right: 90,
        top: 300,
        padding: "26px 30px",
        borderRadius: 34,
        backgroundColor: "rgba(255,255,255,0.97)",
        boxShadow: "0 24px 50px rgba(20,40,90,0.28)",
        display: "flex",
        alignItems: "center",
        gap: 26,
        fontFamily,
        opacity: clamp(a * 1.4),
        translate: `0 ${(1 - easeOut(a)) * -60}px`,
      })}
    >
      <div style={{ width: 96, height: 96, borderRadius: 26, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width={56} height={56} viewBox="0 0 24 24">
          <path d="M12 3a6 6 0 0 0-6 6v4l-1.6 2.6c-.3.5 0 1.1.6 1.1h14c.6 0 .9-.6.6-1.1L18 13V9a6 6 0 0 0-6-6zm0 18a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 21z" fill={C.navy} />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.inkSoft }}>
          {t.reminderApp} · {t.reminderTime}
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, color: C.navy, whiteSpace: "nowrap" }}>{t.reminderText}</div>
      </div>
    </div>
  );
};

// Кадр складывается сверху, как крышка ноутбука (p 0…1), и — пауза.
const FoldPanel: React.FC<{ readonly p: number }> = ({ p }) => (
  <div style={box({ inset: 0, perspective: 1800, perspectiveOrigin: "50% 100%" })}>
    <div
      style={box({
        inset: 0,
        transformOrigin: "50% 100%",
        transform: `rotateX(${-90 + 90 * p}deg)`,
        background: "linear-gradient(170deg, #E9EDF2 0%, #C9D0DA 55%, #AEB7C4 100%)",
        boxShadow: "inset 0 -40px 80px rgba(20,30,60,0.25)",
      })}
    >
      <div style={box({ left: 540 - 70, top: 960 - 70, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.6)" })} />
    </div>
  </div>
);

// ---------- Монтаж: три полосы ----------
const BandFrame: React.FC<{ readonly i: number; readonly f: number; readonly from: number; readonly children: React.ReactNode }> = ({ i, f, from, children }) => {
  const u = clamp((f - from) / 11);
  if (u <= 0) return null;
  const e = 1 + 1.4 * Math.pow(u - 1, 3) + 0.4 * Math.pow(u - 1, 2);
  return (
    <div style={box({ left: 0, top: i * BAND_H, width: 1080, height: BAND_H, overflow: "hidden", translate: `${(1 - e) * 1080}px 0`, boxShadow: "0 0 0 6px #FFFFFF" })}>
      {children}
    </div>
  );
};

const BandTags: React.FC<{ readonly i: number; readonly f: number; readonly from: number }> = ({ i, f, from }) => {
  const t = BG40_TEXT.flow;
  const a = clamp((f - from - 6) / 8);
  const top = i * BAND_H + (i === 0 ? 270 : i === 1 ? BAND_H - 110 : 34);
  const label = `${i > 0 ? "— " : ""}${t.chain[i]}`;
  return (
    <>
      <TimeChip x={60} y={top} text={t.times[i]} a={a} s={1.05} />
      <Chip x={268} y={top - 2} text={label} a={clamp((f - from - 10) / 8)} size={46} />
    </>
  );
};

// Мама стоит у стола с сумкой и смотрит на часы на руке.
const momStanding = (): Place => ({ x: 660, y: 1560, h: 760 });
// Мама с сыном выходят со двора школы (вправо).
const MonTag = "flow-band";

const Montage: React.FC<{ readonly f: number; readonly mont: number; readonly b2: number; readonly b3: number; readonly total: number }> = ({ f, mont, b2, b3 }) => {
  const t = BG40_TEXT.flow;
  // полоса 2: прогулка от двери к воротам
  const walk0 = b2 - 4;
  const walkDur = 150;
  const momWalk = (tt: number): Place => ({ x: lerp(560, 1010, cruise(clamp((tt - walk0) / walkDur))), y: 1700, h: 700 });
  const sonWalk = (tt: number): Place => ({ x: lerp(560, 1010, cruise(clamp((tt - walk0) / walkDur))) + 132, y: 1722, h: 500 });
  const holdPt = (tt: number) => ({ x: momWalk(tt).x + 70, y: 1700 - 0.53 * 700 });
  // полоса 3: снова за столом — крышка открывается, мысль потеряна
  const open3 = easeInOut((f - b3 - 4) / 16);
  const pose3 = (tt: number): PoseIn => ({
    expr: tt < b3 + 22 ? "calm" : "thinking",
    headTilt: keys(tt, [[b3 + 20, 0], [b3 + 34, 7]]),
    lookY: 0.15,
    armR: { target: tt < b3 + 22 ? lidTop(open3) : keysV(tt, [[b3 + 22, lidTop(1)], [b3 + 36, { x: MOM.x + 34, y: 1092 }]], anticipate), shape: tt < b3 + 22 ? "open" : "relax", elbow: "down", wrist: tt < b3 + 22 ? -60 : 30 },
    armL: { target: KEY_L, shape: "relax", elbow: "down" },
  });
  const bubble = clamp((f - b3 - 34) / 10);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #E9EDF2 0%, #D3D9E2 100%)" })}>
      {/* 1. 12:30 жумуш — сумка на плече, взгляд на часы */}
      <BandFrame i={0} f={f} from={mont}>
        <Panel top={0} height={BAND_H} cam={{ x: 560, y: 900, zoom: 0.82 }} bg={C.wall}>
          <OfficeBack minutes={750} sec={secondsAngle(f)} />
          <Actor
            uid={`${MonTag}-1`}
            look="mom"
            f={f}
            place={momStanding}
            face={() => 0.25}
            pose={(tt) => ({
              expr: "worried",
              bagOnShoulder: clamp((tt - mont) / 10),
              armR: { target: keysV(tt, [[mont, { x: 770, y: 1180 }], [mont + 14, { x: 740, y: 1030 }]], anticipate), shape: "relax", elbow: "down" },
              armL: { target: { x: 600, y: 1190 }, shape: "relax", elbow: "down" },
              lookY: keys(tt, [[mont + 10, 0.2], [mont + 18, 0.9]]),
              lookX: 0.2,
              nod: keys(tt, [[mont + 10, 0], [mont + 18, 8]]),
            })}
            seed={6}
          />
          <Desk />
          <DeskProps />
          <Laptop3D x={OFFICE.laptop.x} y={OFFICE.laptop.y} open={0} />
        </Panel>
      </BandFrame>
      {/* 2. 13:10 мектеп — мама с сыном за руку */}
      <BandFrame i={1} f={f} from={b2}>
        <Panel top={0} height={BAND_H} cam={{ x: 860, y: 1360, zoom: 0.6 }} bg="#E3EEF5">
          <SchoolBack minutes={790} />
          <Actor
            uid={`${MonTag}-2m`}
            look="mom"
            f={f}
            place={momWalk}
            walkFrom={walk0}
            pose={(tt) => ({ expr: "softSmile", bagOnShoulder: 1, armR: { target: holdPt(tt), shape: "relax", elbow: "down" } })}
            seed={7}
          />
          <Actor
            uid={`${MonTag}-2s`}
            look="son"
            f={f}
            place={sonWalk}
            walkFrom={walk0}
            face={() => -0.3}
            pose={(tt) => ({ expr: "smile", armL: { target: holdPt(tt), shape: "relax", elbow: "down" } })}
            seed={8}
          />
          <SchoolFence />
        </Panel>
      </BandFrame>
      {/* 3. 13:50 жумуш — снова за ноутбуком: «Кайда калдым эле?» */}
      <BandFrame i={2} f={f} from={b3}>
        <Panel top={0} height={BAND_H} cam={{ x: 600, y: 1170, zoom: 1.05 }} bg={C.wall}>
          <OfficeShot
            uid={`${MonTag}-3`}
            f={f}
            pose={pose3}
            face={() => 0.4}
            lid={open3}
            build={0.86}
            minutes={830}
            extra={
              bubble > 0 ? (
                <div
                  style={box({
                    left: 600,
                    top: 930,
                    padding: "18px 30px",
                    borderRadius: 46,
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 14px 30px rgba(20,40,90,0.2)",
                    fontFamily: handFamily,
                    fontWeight: 700,
                    fontSize: 64,
                    color: C.navy,
                    opacity: bubble,
                    scale: `${0.7 + 0.3 * easeOut(bubble)}`,
                    whiteSpace: "nowrap",
                  })}
                >
                  {t.where}
                </div>
              ) : null
            }
          />
        </Panel>
      </BandFrame>
      <BandTags i={0} f={f} from={mont} />
      <BandTags i={1} f={f} from={b2} />
      <BandTags i={2} f={f} from={b3} />
    </div>
  );
};

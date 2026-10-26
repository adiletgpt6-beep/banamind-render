// Сцена 7. Чертёж превращается в понятную конструкцию (VO09).
// План А — макет на столе крупно: палец папы показывает на ролик, глаза
// сына следят за пальцем.
// План Б — «чиймелерин көрсөтүп»: на стол ложится чертёж, линии того же
// конвейера проявляются по частям, подписи «ролик», «рама»,
// «кыймылдаткыч»; «кагаздагы сүрөт» — линии поднимаются с бумаги и
// обретают объём (макет).
// План В — «чыныгы жабдууга»: та же конструкция вырастает в оборудование,
// по роликам едет коробка, ролики вращаются со скоростью груза.
// Заголовок «ЧИЙМЕ → МАКЕТ → ЖАБДУУ» — активный шаг на плашке.
// План Г — тёплая реакция сына: интерес, улыбка, кивок; папа улыбается.
import { AbsoluteFill } from "remotion";
import { localCue, useCue, useSceneFrame, wordAt } from "../context";
import { C, fontFamily, GridDots, Vignette } from "../kit";
import { Conveyor, CV, rollerX } from "../props/Conveyor";
import { MomPointHand } from "../props/Hands";
import { Actor } from "../rig/Actor";
import { easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import type { DdTimeline } from "../timing";
import { restOnTable, seated, seatOf } from "./common";

const T = DD_TEXT.blueprint;

const beatsOf = (cue: ReturnType<typeof useCue>) => {
  const w = (i: number) => wordAt(cue, i);
  return {
    point: w(1) - 4, // «макетти»
    cutB: w(4) - 6, // «Атасы…»
    draw: w(5), // «чиймелерин»
    drawEnd: w(7) - 2,
    lift: w(7), // «кагаздагы сүрөт»
    extrude: w(8),
    cutC: w(10) - 6, // «чыныгы»
    equip: w(11), // «жабдууга»
    cutD: cue.to + 6,
  };
};

export const blueprintBeats = (tl: DdTimeline) => {
  const sc = tl.scenes.find((s) => s.id === "blueprint")!;
  const b = beatsOf(localCue(tl, sc.from, "vo09"));
  return { sheet: b.cutB + 2 };
};

export const BlueprintScene: React.FC = () => {
  const t = useSceneFrame();
  const cue = useCue("vo09");
  const b = beatsOf(cue);
  const step = t < b.extrude + 6 ? 0 : t < b.equip ? 1 : 2;
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      {t < b.cutB ? <ShotModel t={t} b={b} /> : t < b.cutD ? <ShotDraw t={t} b={b} /> : <ShotReaction t={t} b={b} />}
      {t >= b.cutB - 2 && t < b.cutD ? <Steps t={t} at={b.cutB} active={step} /> : null}
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof beatsOf>;

// «ЧИЙМЕ → МАКЕТ → ЖАБДУУ»: активный шаг на бирюзовой плашке.
const Steps: React.FC<{ t: number; at: number; active: number }> = ({ t, at, active }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 160, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
    {T.steps.map((s, i) => {
      const u = easeOut((t - at - i * 5) / 10);
      const on = i === active;
      const done = i < active;
      return (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, opacity: u, transform: `translateY(${(1 - u) * 20}px)` }}>
          {i > 0 ? <span style={{ fontFamily, fontWeight: 900, fontSize: 50, color: done || on ? C.cyan : "rgba(246,247,249,0.45)" }}>→</span> : null}
          <span
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 60,
              lineHeight: 1.1,
              padding: "2px 12px",
              borderRadius: 14,
              color: on ? C.ink : done ? C.light : "rgba(246,247,249,0.55)",
              background: on ? C.cyan : "transparent",
              boxShadow: on ? "0 0 30px rgba(115,220,232,0.5)" : "none",
              textShadow: on ? "none" : "0 4px 16px rgba(5,10,25,0.6)",
            }}
          >
            {s}
          </span>
        </div>
      );
    })}
  </div>
);

// Точка ролика №3 макета на экране для начала модели (ox, oy) и масштаба s.
const rollerPoint = (ox: number, oy: number, s: number) => ({ x: ox + (rollerX(3) + 0.55 * CV.W * 0.5) * s, y: oy - (CV.H + 0.32 * CV.W * 0.5) * s });

// План А: макет на столе, палец папы, взгляд сына.
const ShotModel: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const s = 1.08;
  const ox = 120;
  const oy = 1200;
  const rp = rollerPoint(ox, oy, s);
  const handIn = easeOut((t - (b.point - 10)) / 14);
  // сын — на переднем плане у левого края кадра, в профиль к макету
  const son = { x: 30, y: 2030, h: 1300 };
  const look = easeInOut((t - (b.point + 2)) / 10);
  const zoom = lerp(1, 1.04, easeInOut(t / Math.max(1, b.cutB)));
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 1000px" }}>
      {/* фон: комната вечером не нужна — дневная стена, мягко размыта */}
      <div style={{ position: "absolute", inset: 0, filter: "blur(7px)", transform: "scale(2.2)", transformOrigin: "60% 40%" }}>
        <HomeRoom t={t} />
      </div>
      {/* сын за столом у левого края, в профиль: глаза следят за пальцем */}
      <div style={{ position: "absolute", left: 0, top: 0, filter: "blur(2.5px)" }}>
        <Actor
          uid="bp-son"
          look="son"
          f={t}
          place={() => son}
          face={() => 0.78}
          seed={61}
          pose={() => ({ expr: mixExpr(EXPR.calm, EXPR.softSmile, look), lookX: lerp(0.2, 0.75, look), lookY: lerp(0.1, 0.35, look), nod: 3 })}
        />
      </div>
      {/* столешница */}
      <div style={{ position: "absolute", left: -40, top: 1080, width: 1160, height: 900, background: `linear-gradient(180deg, ${C.woodLight} 0%, ${C.wood} 60%)`, boxShadow: "0 -10px 30px rgba(60,40,20,0.15)" }} />
      {/* мягкий тёплый свет за макетом */}
      <div style={{ position: "absolute", left: 120, top: 700, width: 900, height: 560, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,226,150,0.55), rgba(255,226,150,0) 70%)" }} />
      <div style={{ position: "absolute", left: ox, top: oy }}>
        <Conveyor mode="model" scale={s} t={t} highlight={t > b.point + 6 ? "roller" : null} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {handIn > 0 ? <MomPointHand who="dad" x={lerp(rp.x + 260, rp.x + 8, handIn)} y={lerp(rp.y + 520, rp.y + 10, handIn)} angle={-24} s={1.25} /> : null}
      </svg>
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};

// План Б–В: чертёж → макет → оборудование на тёмной «инженерной» доске.
const ShotDraw: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const paperIn = easeOut((t - b.cutB) / 14);
  const progress = easeInOut((t - b.draw) / Math.max(12, b.drawEnd - b.draw));
  const lift = easeInOut((t - b.lift) / 14);
  const ext = easeInOut((t - b.extrude) / 18);
  const grow = easeInOut((t - b.cutC) / 18);
  const equip = t >= b.equip - 4;
  const paperFade = 1 - easeInOut((t - b.extrude - 6) / 14);
  // масштаб и положение конструкции: чертёж → макет → оборудование
  const s = lerp(lerp(0.95, 1.0, lift), 1.12, grow);
  const ox = lerp(140, 105, grow);
  const oy = lerp(lerp(1010, 980, lift), 1120, grow);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.navy} 70%)` }}>
      <GridDots w={1080} h={1920} t={t} n={30} />
      {/* пол цеха под оборудованием */}
      <div style={{ position: "absolute", left: 0, top: 1120, width: 1080, height: 300, opacity: grow, background: "linear-gradient(180deg, rgba(115,220,232,0.12), rgba(115,220,232,0))", borderTop: "3px solid rgba(115,220,232,0.35)" }} />
      {/* лист чертежа */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 420,
          width: 960,
          height: 760,
          borderRadius: 18,
          background: "#14567A",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)",
          backgroundSize: "40px 40px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          transform: `translateY(${(1 - paperIn) * 700}px) rotate(${(1 - paperIn) * -6}deg)`,
          opacity: paperFade,
        }}
      >
        <div style={{ position: "absolute", right: 24, bottom: 18, padding: "6px 16px", border: "3px solid rgba(255,255,255,0.6)", borderRadius: 8, fontFamily, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.85)" }}>{T.title}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: ox,
          top: oy - lift * 30 * (1 - grow),
          filter: lift > 0 && !equip ? `drop-shadow(0 ${24 * lift}px ${20 * lift}px rgba(0,0,0,0.35))` : undefined,
          opacity: paperIn,
        }}
      >
        <Conveyor
          mode={equip ? "equipment" : "blueprint"}
          scale={s}
          t={t}
          progress={progress}
          extrude={equip ? 1 : ext}
          box={equip}
          glow={equip ? 0.55 : 0}
          labels={t < b.extrude + 4 ? { roller: T.parts.roller, frame: T.parts.frame, motor: T.parts.motor, at: b.draw + 18 } : undefined}
        />
      </div>
      <Vignette strength={0.25} />
    </AbsoluteFill>
  );
};

// План Г: тёплая реакция сына за домашним столом.
const ShotReaction: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const son = seated("son", HOME.seat.son);
  const dad = seated("dad", HOME.seat.dad);
  const u = t - b.cutD;
  const sonPose = () => ({
    expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut(u / 14)),
    sit: 1,
    seat: seatOf(son),
    lean: 6,
    lookX: 0.4,
    lookY: -0.1,
    headTilt: lerp(0, 5, easeInOut(u / 16)),
    nod: keys(u, [[8, 0], [16, 5], [26, 0]]),
    armL: restOnTable(son, -1),
    armR: restOnTable(son, 1),
  });
  const dadPose = () => ({ expr: EXPR.smile, sit: 1, seat: seatOf(dad), lean: 6, lookX: -0.3, lookY: 0.2, armL: restOnTable(dad, -1), armR: restOnTable(dad, 1) });
  const cam = { x: 820, y: 1060, zoom: lerp(2.3, 2.38, easeInOut(u / 40)) };
  return (
    <Shot f={t} from={b.cutD} to={99999} cam={cam} bg={C.wall}>
      <HomeRoom t={t} modelOnShelf={false} />
      <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
      <Actor uid="bp-son2" look="son" f={t} place={() => son} face={() => 0.5} pose={sonPose} seed={62} layer="body" />
      <Actor uid="bp-dad2" look="dad" f={t} place={() => dad} face={() => -0.45} pose={dadPose} seed={63} layer="body" />
      <HomeTable />
      <div style={{ position: "absolute", left: 770, top: HOME.table.top - 22 }}>
        <Conveyor mode="model" scale={0.26} t={t} />
      </div>
      <Actor uid="bp-son2" look="son" f={t} place={() => son} face={() => 0.5} pose={sonPose} seed={62} layer="arms" />
      <Actor uid="bp-dad2" look="dad" f={t} place={() => dad} face={() => -0.45} pose={dadPose} seed={63} layer="arms" />
      <Vignette strength={0.25} />
    </Shot>
  );
};

// Сцена 5: «Топ түзүлсө, биринчи толук сыноо сапары акысыз. Андан кийин
// кызматты улантууну ата-эне өзү чечет.»
// Три точки с одной школой и одним временем собираются в группу
// (пунктирный круг «Топ: 3–4 бала»). Только тогда карта раскрывает
// условный мини-пейзаж: дорога, дом, школа, белая машина. Дети садятся
// на свои места — у каждого ремень, водитель держит руль. Утром
// үй → мектеп, после уроков мектеп → үй; дома точку встречает мама.
// Шаги «Алгач топ → сыноо → чечим»: решение продолжать — за родителем.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useSceneFrames, useTimeline } from "../context";
import { trialBeats } from "../beats";
import { BG47_TEXT } from "../script";
import { Car, CAR_H, CAR_W, PaperMom } from "../art/Car";
import { Dot } from "../art/Dot";
import { blink, clamp, easeIn, easeInOut, easeOut, hop, lerp, prog, springy } from "../art/motion";
import { C, type DotColor } from "../art/palette";
import { HeroPlaces } from "../art/places";
import { Check, Home, Poplar, School } from "../art/popups";
import { Chip, ExampleTag } from "../art/ui";
import { Flat, lerpCam, projectBillboard, Standee, type Cam } from "../art/Stage";
import { World } from "../art/World";
import { DotOnMap } from "./Hook";
import { APPLY_END_CAM } from "./Apply";

export const TRIAL_CAM: Cam = { cx: 490, cy: 1390, zoom: 1.12, tilt: 40, sy: 1010 };
// После решения камера мягко приближается к дому, маме и точке.
const TRIAL_END_CAM: Cam = { cx: 430, cy: 1420, zoom: 1.2, tilt: 40, sy: 1010 };

const ROAD_Y = 1450;
const HOME_X = 170;
const MOM_X = 268;
const SCHOOL_X = 780;
const CAR_HOME = 488;
const CAR_SCHOOL = 610;
const KIDS: readonly { color: DotColor; x: number; y: number; from: { x: number; y: number }; at: number }[] = [
  { color: "yellow", x: 330, y: 1530, from: { x: 520, y: 876 }, at: 4 },
  // мятная и фиолетовая — те, кого нашла лупа (стоят на карте с прошлой сцены)
  { color: "mint", x: 430, y: 1548, from: { x: 430, y: 1060 }, at: 8 },
  { color: "violet", x: 530, y: 1530, from: { x: 650, y: 700 }, at: 10 },
];


export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = trialBeats(useTimeline());
  const len = useSceneFrames("trial");
  const cam = lerpCam(lerpCam(APPLY_END_CAM, TRIAL_CAM, easeInOut(f / 32)), TRIAL_END_CAM, easeInOut(prog(f, b.decide, Math.max(20, len - b.decide))));

  const diorama = springy(prog(f, b.pop, 18));
  // машина: стоит у дома → едет в школу → разворот → едет домой
  const leg1 = easeInOut(prog(f, b.go, b.atSchool - b.go));
  const leg2 = easeInOut(prog(f, b.back, b.atHome - b.back));
  const carX = f < b.back ? lerp(CAR_HOME, CAR_SCHOOL, leg1) : lerp(CAR_SCHOOL, CAR_HOME, leg2);
  const turn = easeInOut(prog(f, b.atSchool + 12, 14));
  const carDir = lerp(1, -1, turn);
  const moving = (f > b.go && f < b.atSchool) || (f > b.back && f < b.atHome);
  const spin = (carX - CAR_HOME) * 1.4 * (f < b.back ? 1 : -1);
  const carUp = springy(prog(f, b.pop + 8, 16));
  // дети в машине: садятся по очереди; у школы выходят на уроки и возвращаются
  const seated = KIDS.map((_, i) => easeOut(prog(f, b.board + i * 5 + 10, 6)));
  const atLessons = easeInOut(prog(f, b.atSchool + 2, 6)) * (1 - easeInOut(prog(f, b.atSchool + 22, 6)));
  const yellowOut = easeOut(prog(f, b.meet + 4, 6));
  const kidsIn = seated.map((s, i) => s * (1 - atLessons) * (i === 0 ? 1 - yellowOut : 1));

  const sun = easeInOut(prog(f, b.atSchool, b.back - b.atSchool));
  const groupCircle = easeOut(prog(f, b.gather, 16));
  const groupPulse = Math.sin(Math.PI * prog(f, b.formed, 12));
  const stepsOn = [b.formed, b.board, b.decide];

  return (
    <>
      <World cam={cam} label={0} hole={0}>
        <HeroPlaces home={1 - diorama} school={1 - diorama} route={1 - Math.min(1, diorama)} flag={f / 6} angle={70} />
        {/* пунктирный круг группы */}
        {groupCircle > 0 ? (
          <Flat x={430} y={1536} z={0.9}>
            <svg width={420} height={220} viewBox="-210 -110 420 220" style={{ position: "absolute", left: -210, top: -110, overflow: "visible", opacity: 1 - easeIn(prog(f, b.board + 20, 12)) }}>
              <ellipse rx={196 + 8 * groupPulse} ry={92 + 4 * groupPulse} fill="rgba(255,201,14,0.18)" stroke={C.yellowEdge} strokeWidth={7} strokeDasharray="18 14" pathLength={1} strokeDashoffset={0} opacity={groupCircle} />
            </svg>
          </Flat>
        ) : null}
        {/* условный мини-пейзаж: фон, дорога, дом, школа */}
        {diorama > 0.01 ? (
          <>
            <Standee x={500} y={1262} w={1000} h={430} up={diorama} angle={82}>
              <Backdrop sun={sun} f={f} />
            </Standee>
            <Flat x={0} y={0} z={0.8}>
              <svg width={1000} height={1640} viewBox="0 0 1000 1640" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: Math.min(1, diorama * 1.5) }}>
                <rect x={60} y={ROAD_Y - 52} width={880} height={104} rx={20} fill="#E3E8F0" stroke="#FFFFFF" strokeWidth={6} />
                <line x1={90} y1={ROAD_Y} x2={910} y2={ROAD_Y} stroke={C.yellow} strokeWidth={7} strokeDasharray="34 26" />
              </svg>
            </Flat>
            <Standee x={HOME_X} y={1380} w={150} h={150} up={springy(prog(f, b.pop + 4, 16))} angle={74} shadow={80}>
              <Home />
            </Standee>
            <Standee x={SCHOOL_X} y={1300} w={240} h={170} up={springy(prog(f, b.pop + 6, 16))} angle={74} sx={1.15} sy={1.15} shadow={130}>
              <School flag={f / 5} />
            </Standee>
            <Standee x={MOM_X} y={1472} w={130} h={260} up={springy(prog(f, b.pop + 10, 16))} angle={cam.tilt} shadow={50}>
              <PaperMom wave={f > b.atHome - 10 ? easeInOut(prog(f, b.atHome - 10, 10)) * (Math.sin(f / 3) * 0.5 + 0.5) : 0} arms={easeInOut(prog(f, b.meet - 2, 8))} />
            </Standee>
            {/* машина: фигурка-открытка, смотрит в кадр */}
            <Standee x={carX} y={ROAD_Y + 6} w={CAR_W} h={CAR_H} up={carUp} angle={cam.tilt} sx={0.82 * carDir} sy={0.82} shadow={160}>
              <Car spin={spin} kids={KIDS.map((k) => k.color)} kidsIn={kidsIn} bounce={moving ? Math.sin(f * 1.3) * 1.6 : 0} dir={carDir} />
            </Standee>
          </>
        ) : null}
        {/* дети-точки: собираются, садятся в машину; жёлтая выходит к маме */}
        {KIDS.map((k, i) => {
          const arrive = easeInOut(prog(f, k.at, 34));
          const hopIn = Math.abs(Math.sin(Math.PI * arrive * 3)) * 60 * (1 - arrive);
          const drop = 0;
          const boardT = prog(f, b.board + i * 5, 12);
          const x0 = lerp(k.from.x, k.x, arrive);
          const y0 = lerp(k.from.y, k.y, arrive);
          const x = lerp(x0, CAR_HOME - 40 + i * 30, easeInOut(boardT));
          const y = lerp(y0, ROAD_Y + 4, easeInOut(boardT));
          const lift = hopIn + drop + hop(f, b.board + i * 5, 12, 45);
          const vis = 1 - easeIn(prog(f, b.board + i * 5 + 8, 4));
          // жёлтая точка выходит из машины к маме
          if (i === 0 && f >= b.meet) {
            const t = easeInOut(prog(f, b.meet, 14));
            return (
              <DotOnMap key={k.color} x={lerp(CAR_HOME - 40, MOM_X + 70, t)} y={lerp(ROAD_Y + 4, 1500, t)} angle={cam.tilt} lift={hop(f, b.meet, 14, 55)} opacity={easeOut(prog(f, b.meet, 4))} sx={0.8} sy={0.8}>
                <Dot look={{ x: -0.8, y: 0 }} blink={blink(f, 2)} mood="happy" armL={150} armR={60} />
              </DotOnMap>
            );
          }
          if (vis <= 0.01) return null;
          return (
            <DotOnMap key={k.color} x={x} y={y} angle={cam.tilt} lift={lift} opacity={vis} sx={0.8} sy={0.8}>
              <Dot color={k.color} look={{ x: i === 0 ? 0.6 : i === 1 ? 0.8 : -0.8, y: 0 }} blink={blink(f, 3 + i)} mood="happy" walk={f * 0.6} stride={arrive < 1 ? 1 : 0} armL={f > b.formed && f < b.board ? 150 : 24} armR={f > b.formed && f < b.board ? 150 : 24} />
            </DotOnMap>
          );
        })}
      </World>

      {/* галочки над детьми: одна школа и одно время */}
      {KIDS.map((k, i) => {
        const at = b.gather + 6 + i * 4;
        if (f < at || f > b.board) return null;
        const top = projectBillboard(cam, k.x, k.y, 180);
        return (
          <div key={i} style={{ position: "absolute", left: top.x - 25, top: top.y - 60, opacity: 1 - easeIn(prog(f, b.board - 6, 6)) }}>
            <Check size={50} p={easeOut(prog(f, at, 12))} />
          </div>
        );
      })}
      {f > b.gather + 4 && f < b.board + 14 ? (
        <GroupLabel cam={cam} p={springy(prog(f, b.gather + 4, 14))} fade={1 - easeIn(prog(f, b.board + 4, 10))} />
      ) : null}

      <ExampleTag text={BG47_TEXT.example} />
      <Chip f={f} at={b.gather + 14} out={b.pop} y={334} center size={34}>
        {BG47_TEXT.trial.same}
      </Chip>
      <Chip f={f} at={b.free} y={334} center size={35} bg="#FFF4C2">
        {BG47_TEXT.trial.free}
      </Chip>
      <Chip f={f} at={b.board + 14} out={b.atSchool + 10} y={518} center size={30} bg="#FFFFFF">
        {BG47_TEXT.trial.belts}
      </Chip>
      <Chip f={f} at={b.go - 4} out={b.atSchool + 10} y={428} center size={36} bg="#EAF3FC">
        {BG47_TEXT.trial.morning}
      </Chip>
      <Chip f={f} at={b.atSchool + 14} out={b.atHome + 4} y={428} center size={36} bg="#EAF3FC">
        {BG47_TEXT.trial.afternoon}
      </Chip>
      <Chip f={f} at={b.atHome + 6} y={428} center size={36}>
        {BG47_TEXT.trial.full}
      </Chip>
      <Steps f={f} on={stepsOn} at={b.formed - 4} />
    </>
  );
};

// Фон мини-пейзажа: небо, солнце (утро → после уроков), горы, тополя.
const Backdrop: React.FC<{ readonly sun: number; readonly f: number }> = ({ sun, f }) => (
  <div style={{ position: "relative", width: 1000, height: 430 }}>
    <svg width={1000} height={430} viewBox="0 0 1000 430" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="bg47sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#CFE6FA" />
          <stop offset="1" stopColor="#F3F9FF" />
        </linearGradient>
      </defs>
      <path d="M0 430 L0 40 Q 0 0 40 0 L 960 0 Q 1000 0 1000 40 L 1000 430 Z" fill="url(#bg47sky)" stroke="#FFFFFF" strokeWidth={8} />
      <circle cx={lerp(170, 820, sun)} cy={lerp(120, 90, sun) + Math.sin(sun * Math.PI) * -30} r={48} fill={C.yellow} stroke="#FFFFFF" strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${((i * 330 + f * 0.6) % 1100) - 80} ${60 + i * 34})`}>
          <ellipse cx={0} cy={0} rx={60} ry={20} fill="#FFFFFF" />
          <ellipse cx={30} cy={-12} rx={36} ry={20} fill="#FFFFFF" />
        </g>
      ))}
      <path d="M0 330 L 110 220 L 190 270 L 320 150 L 430 250 L 540 170 L 660 260 L 780 160 L 900 250 L 1000 200 L 1000 430 L 0 430 Z" fill="#B9CDE8" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
      <path d="M320 150 L 352 180 L 330 176 L 320 188 L 308 176 L 290 180 Z M780 160 L 810 186 L 790 182 L 780 194 L 768 182 L 750 186 Z M540 170 L 566 194 L 548 190 L 540 200 L 530 190 L 514 194 Z" fill="#FFFFFF" />
      <path d="M0 380 L 200 330 L 420 360 L 640 320 L 860 356 L 1000 330 L 1000 430 L 0 430 Z" fill="#9DBBE0" stroke="#FFFFFF" strokeWidth={5} />
    </svg>
    {[60, 140, 330, 410, 560, 640, 900, 960].map((x, i) => (
      <div key={x} style={{ position: "absolute", left: x - 20, top: 430 - 150 + (i % 2) * 8 }}>
        <Poplar tone={i % 2} />
      </div>
    ))}
  </div>
);

const GroupLabel: React.FC<{ readonly cam: Cam; readonly p: number; readonly fade: number }> = ({ cam, p, fade }) => {
  const at = projectBillboard(cam, 430, 1536, 250);
  return (
    <div
      style={{
        position: "absolute",
        left: at.x,
        top: at.y - 76,
        translate: "-50% 0",
        padding: "10px 22px",
        borderRadius: 999,
        backgroundColor: C.yellow,
        border: `4px solid ${C.navy}`,
        fontFamily,
        fontWeight: 900,
        fontSize: 36,
        color: C.navy,
        whiteSpace: "nowrap",
        transform: `scale(${p})`,
        transformOrigin: "50% 100%",
        opacity: fade,
        boxShadow: "0 8px 0 rgba(20,40,90,0.14)",
      }}
    >
      {BG47_TEXT.trial.group}
    </div>
  );
};

// Шаги «Алгач топ → сыноо → чечим»: каждый загорается по речи.
const Steps: React.FC<{ readonly f: number; readonly on: readonly number[]; readonly at: number }> = ({ f, on, at }) => {
  const show = easeOut(prog(f, at, 12));
  if (show <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 150, top: 1214, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: show, transform: `translateY(${(1 - show) * 30}px)` }}>
      {BG47_TEXT.trial.steps.map((s, i) => {
        const lit = easeOut(prog(f, on[i], 8));
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {i ? <div style={{ fontFamily, fontWeight: 900, fontSize: 40, color: C.navy }}>→</div> : null}
            <div
              style={{
                padding: "10px 20px",
                borderRadius: 18,
                backgroundColor: lit > 0.5 ? C.yellow : "#FFFFFF",
                border: `4px solid ${lit > 0.5 ? C.navy : "#A9B4CC"}`,
                fontFamily,
                fontWeight: 900,
                fontSize: 36,
                color: lit > 0.5 ? C.navy : "#7D89A6",
                transform: `scale(${1 + 0.12 * Math.sin(Math.PI * clamp(lit))})`,
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
};

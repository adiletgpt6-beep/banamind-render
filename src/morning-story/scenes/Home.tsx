import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ARM, Character, mixArm, type Arm, type Expr } from "../Character";
import { Apartment, Table } from "../sets";
import { Phone } from "../props";
import { TaxiApp } from "../screens";
import { MS_TEXT } from "../script";
import {
  sceneFrom,
  useLineCue,
  useMouth,
  useStory,
  useWordCue,
} from "../StoryContext";
import { Cam, Caption, clampCam, Feet, keys, project, ramp } from "../ui";

const C = MS_TEXT.captions;

// Расстановка в квартире (координаты мира 1080×1920).
export const HOME = {
  mom: { x: 270, y: 1730, h: 980 },
  dad: { x: 830, y: 1760, h: 1010 },
  girl: { x: 600, y: 1640, h: 640 },
  table: { x: 400, y: 1310, w: 440 },
} as const;

// Кисть персонажа в координатах мира (цель IK-позы руки).
export const handWorld = (
  f: { x: number; y: number; h: number },
  arm: Arm,
  side: -1 | 1,
) => {
  const k = f.h / 1000;
  const dx = side === -1 ? 200 + arm[0] : 200 - arm[0];
  return { x: f.x - 0.2 * f.h + dx * k, y: f.y - 0.975 * f.h + arm[1] * k };
};

// Камера в момент перехода к телефону (конец сцены 2 = начало сцены 3).
export const HOME_END_CAM = { x: 470, y: 1180, scale: 1.12 } as const;
export const PHONE_BIG = { w: 720, cx: 540, cy: 980 } as const;

// Сцены 1–2 — одна непрерывная квартира: t — кадры от начала сцены 1.
const ApartmentStory: React.FC<{ readonly t: number }> = ({ t }) => {
  const tl = useStory();
  const s2 = sceneFrom(tl, "s02Plan") - sceneFrom(tl, "s01Morning");
  const s2Len = tl.scenes.find((s) => s.id === "s02Plan")!.durationInFrames;
  const end = s2 + s2Len;
  // реплики (в кадрах от начала сцены 1)
  const n01 = useLineCue("s01Morning", "n01");
  const dadWord = useWordCue("s01Morning", "n01", "атасы");
  const f01 = useLineCue("s01Morning", "f01");
  const m01 = useLineCue("s01Morning", "m01");
  const f02 = useLineCue("s01Morning", "f02");
  const vib = s2 + 10;
  const exitAt = f02.end + 14;
  const phoneUp = Math.max(exitAt + 10, end - 52);
  const grow = end - 24;

  const mouthMom = useMouth("s01Morning", "mother");
  const mouthDad = useMouth("s01Morning", "father");

  // свет за окном: рассвет → утро
  const light = ramp(t, 0, Math.min(n01.end, 360));
  const clock = 6 * 60 + 58 + ramp(t, 0, end, 0, 4);

  // камера (не выходит за края квартиры)
  const cam = clampCam({
    x: keys(t, [
      [0, 570],
      [80, 540],
      [dadWord - 8, 560],
      [dadWord + 24, 760],
      [s2 - 10, 760],
      [s2 + 16, 600],
      [m01.start, 520],
      [f02.start, 600],
      [phoneUp, 520],
      [grow, HOME_END_CAM.x],
    ]),
    y: keys(t, [
      [0, 620],
      [80, 1060],
      [dadWord + 24, 1120],
      [s2 + 16, 1110],
      [phoneUp, 1150],
      [grow, HOME_END_CAM.y],
    ]),
    scale: keys(t, [
      [0, 1.6],
      [80, 1.1],
      [dadWord - 8, 1.1],
      [dadWord + 24, 1.28],
      [s2 - 10, 1.28],
      [s2 + 16, 1.12],
      [phoneUp, 1.12],
      [grow, HOME_END_CAM.scale],
    ]),
  });

  // мама: у зеркала поправляет волосы → смотрит на папу → берёт телефон
  const hair = Math.sin(t / 7) * 6;
  const momArmL: Arm =
    t < f01.start - 6
      ? [ARM.hair[0] + hair, ARM.hair[1] + hair]
      : t < phoneUp
        ? mixArm(ARM.hair, ARM.down, ramp(t, f01.start - 6, f01.start + 8))
        : mixArm(ARM.down, ARM.phoneLook, ramp(t, phoneUp, phoneUp + 12));
  const momExpr: Expr =
    t < s2
      ? "calm"
      : t < m01.start - 2
        ? "neutral"
        : t < m01.start + (m01.end - m01.start) * 0.5
          ? "surprised"
          : t < f02.end
            ? "worried"
            : t < f02.end + 34
              ? "tired"
              : "neutral";
  const momLook = t < s2 ? -1 : t < phoneUp ? 1 : 0.2;
  const sigh = ramp(t, f02.end + 2, f02.end + 14) - ramp(t, f02.end + 30, f02.end + 44);

  // папа: надевает куртку, ключи; вибрация; извиняется; уходит
  const dadExpr: Expr =
    t < vib
      ? "smile"
      : t < f01.start
        ? "surprised"
        : t < exitAt
          ? "apologetic"
          : "smile";
  const jacketPull = t < 60 ? Math.sin(t / 6) * 0.5 + 0.5 : 0;
  const dadArmR: Arm =
    t < 70
      ? mixArm(ARM.jacket, ARM.relaxed, 1 - jacketPull)
      : t < vib
        ? ARM.relaxed
        : t < f02.start
          ? mixArm(ARM.relaxed, ARM.phoneLook, ramp(t, vib, vib + 10))
          : mixArm(ARM.phoneLook, ARM.down, ramp(t, f02.start, f02.start + 10));
  const dadArmL: Arm =
    t >= f02.start && t < f02.end + 6
      ? mixArm(ARM.down, ARM.behindHead, ramp(t, f02.start + 2, f02.start + 12))
      : t >= dadWord - 4 && t < s2
        ? [ARM.phoneLook[0] - 20, ARM.phoneLook[1] - 20 + Math.sin(t / 2.5) * 6]
        : ARM.down;
  const dadWalk = ramp(t, exitAt, exitAt + 46, 0, 1);
  const dadX = HOME.dad.x + dadWalk * 420;
  const shake = t >= vib && t < vib + 24 ? Math.sin(t * 2.4) * 2 : 0;

  // дочь: собирает рюкзак, смотрит на говорящего
  const girlLook =
    t < s2
      ? 0
      : t < m01.start
        ? 1
        : t < f02.start
          ? -1
          : t < exitAt
            ? 1
            : -0.6;
  const pack = Math.sin(t / 9);
  const girlArm: Arm = t < s2 ? [-150 + pack * 20, 470 + pack * 30] : ARM.relaxed;

  // телефон «вырастает» до весь кадр (переход в сцену 3)
  const hand = handWorld(HOME.mom, ARM.phoneLook, -1);
  const handScreen = project({ x: hand.x, y: hand.y + 40 }, cam);
  const g = ramp(t, grow, end);
  const dim = ramp(t, grow, end, 0, 0.5);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Cam {...cam}>
        <Apartment light={light} clockMinutes={clock} />
        {/* рюкзак и тетрадь на столе */}
        <div style={{ position: "absolute", left: 650, top: 1150, width: 150, height: 160, borderRadius: 40, backgroundColor: "#FFC90E", boxShadow: "inset 0 -20px 0 #E5B300" }} />
        <div
          style={{
            position: "absolute",
            left: 560 + (t < s2 ? Math.max(0, pack) * 90 : 90),
            top: 1210 - (t < s2 ? Math.max(0, pack) * 40 : 40),
            width: 90,
            height: 110,
            borderRadius: 8,
            backgroundColor: "#4F8FCB",
            rotate: `${-12 + pack * 10}deg`,
            opacity: t < s2 ? 1 : 0,
          }}
        />
        <Feet {...HOME.girl} height={HOME.girl.h}>
          <Character kind="girl" height={HOME.girl.h} expr={t < s2 ? "smile" : "neutral"} look={girlLook} armR={girlArm} armL={ARM.relaxed} seed={3} />
        </Feet>
        <Table x={HOME.table.x} y={HOME.table.y} w={HOME.table.w} />
        <Feet x={HOME.mom.x} y={HOME.mom.y} height={HOME.mom.h}>
          <Character
            kind="mom"
            height={HOME.mom.h}
            expr={momExpr}
            mouth={mouthMom}
            look={momLook}
            armL={momArmL}
            armR={ARM.down}
            itemL={t >= phoneUp && g < 0.05 ? "phone" : "none"}
            headTilt={-6 * sigh}
            tilt={-1.5 * sigh}
            bag
            seed={1}
          />
        </Feet>
        <Feet x={dadX} y={HOME.dad.y} height={HOME.dad.h}>
          <Character
            kind="dad"
            height={HOME.dad.h}
            expr={dadExpr}
            mouth={mouthDad}
            look={t >= vib && t < exitAt ? -0.8 : 0}
            armL={dadArmL}
            armR={dadArmR}
            itemL={t < exitAt ? "keys" : "keys"}
            itemR={t >= vib && t < f02.start + 6 ? "phone" : "none"}
            legs={dadWalk > 0 && dadWalk < 1 ? "walk" : "stand"}
            walk={t}
            tilt={shake}
            seed={2}
          />
        </Feet>
        {/* вибрация телефона */}
        {t >= vib && t < vib + 26 ? (
          <svg width={200} height={200} viewBox="0 0 200 200" style={{ position: "absolute", left: 790, top: 1100 }}>
            {[0, 1].map((i) => (
              <path key={i} d={`M ${40 - i * 18} ${70 - i * 10} Q ${24 - i * 18} 100 ${40 - i * 18} ${130 + i * 10} M ${160 + i * 18} ${70 - i * 10} Q ${176 + i * 18} 100 ${160 + i * 18} ${130 + i * 10}`} stroke="#E07A5F" strokeWidth={8} fill="none" strokeLinecap="round" opacity={((t - vib) % 8) < 5 ? 1 : 0.3} />
            ))}
          </svg>
        ) : null}
        {/* блеск ключей на словах «…атасы жеткирет» */}
        {t >= dadWord && t < dadWord + 30 ? (
          <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "absolute", left: 640, top: 1000, scale: `${ramp(t, dadWord, dadWord + 8) - ramp(t, dadWord + 18, dadWord + 30)}` }}>
            <path d="M 60 10 L 68 52 L 110 60 L 68 68 L 60 110 L 52 68 L 10 60 L 52 52 Z" fill="#FFC90E" />
          </svg>
        ) : null}
      </Cam>
      {dim > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(20,30,55,${dim})` }} /> : null}
      {g > 0 ? (
        <Phone
          w={70 + (PHONE_BIG.w - 70) * g}
          style={{
            left: handScreen.x + (PHONE_BIG.cx - handScreen.x) * g - (70 + (PHONE_BIG.w - 70) * g) / 2,
            top: handScreen.y + (PHONE_BIG.cy - handScreen.y) * g - ((70 + (PHONE_BIG.w - 70) * g) * 2.05) / 2,
          }}
        >
          <TaxiApp state="order" />
        </Phone>
      ) : null}
      <Caption text={C.morning} frame={t} at={24} out={s2 - 16} />
      <Caption text={C.plan} frame={t} at={vib + 8} out={grow - 14} />
    </AbsoluteFill>
  );
};

export const MorningScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <ApartmentStory t={frame} />;
};

export const PlanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useStory();
  const offset = sceneFrom(tl, "s02Plan") - sceneFrom(tl, "s01Morning");
  return <ApartmentStory t={frame + offset} />;
};

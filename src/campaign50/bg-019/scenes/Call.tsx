// Сцена 3: напоминание и неделя в календаре → звонок сына.
//
// Волна сводит кадр в офис: на столе загорается телефон — «13:00 Баланы
// мектептен алуу, ар бир иш күнү». Неделя: в каждый будний день жёлтый
// пункт стоит внутри рабочего блока; дни подсвечиваются в ритм мягкого
// колокольчика (не таймер — повторение). Звонит сын: он в классе рядом
// с учительницей (её рука у него на плече), не один.
// Сын: «Апа, мени бүгүн сиз алып кетесизби?»
// Мама: «Ооба, балам. Ал эми кийинки күндөрдү алдын ала сүйлөшүп коёлу.»
import { useCurrentFrame } from "remotion";
import { HoldingHand, PhoneFrame } from "../../../two-schedules-2d/screens";
import { LOOKS } from "../../../two-schedules-2d/rig/looks";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../../../two-schedules-2d/rig/motion";
import { box, Panel, useLine, type Cam } from "../context";
import { BG19_TEXT } from "../script";
import { WaveDivider, WorldTag } from "../sets";
import { ReminderScreen, SonCallScreen, WeekScreen } from "../screens";
import { at, Classroom, handOnDesk, MOM, MOM_EAR, MOM_LOOK, Office, onDesk, SON, TEACHER } from "./common";
import { CAM_CLASS_SPLIT, CAM_OFFICE_SPLIT } from "./Worlds";

export const CALL = {
  toOffice: 0, // разделение схлопывается в офис
  glow: 16, // телефон на столе загорается
  reminder: 34, // крупно: напоминание
  week: 66, // неделя
  lit: [74, 84, 94, 104, 114], // дни подсвечиваются (удары колокольчика)
  ring: 128, // входящий звонок «Уулум»
  answer: 146,
} as const;

const CAM_OFFICE_DESK: Cam = { x: 520, y: 1150, zoom: 1.9 };
const CAM_SON_CALL: Cam = { x: 690, y: 1110, zoom: 1.55 };
const CAM_MOM_CALL: Cam = { x: 650, y: 1020, zoom: 1.6 };

export const CallScene: React.FC = () => {
  const f = useCurrentFrame();
  const s1 = useLine("s1");
  const m1 = useLine("m1");
  const splitAt = Math.min(CALL.answer + 4, s1.from - 12);
  const sp = easeInOut((f - splitAt) / 16);
  const hangUp = m1.to + 10;

  // ---------- офис: схлопывание разделения, телефон на столе ----------
  const collapse = easeInOut(f / 22);
  const officeCam: Cam = {
    x: lerp(CAM_OFFICE_SPLIT.x, CAM_OFFICE_DESK.x, easeInOut((f - 6) / 28)),
    y: lerp(CAM_OFFICE_SPLIT.y, CAM_OFFICE_DESK.y, easeInOut((f - 6) / 28)),
    zoom: lerp(CAM_OFFICE_SPLIT.zoom, CAM_OFFICE_DESK.zoom, easeInOut((f - 6) / 28)),
  };
  const momIntro = (t: number) => ({
    expr: t < CALL.glow + 6 ? ("calm" as const) : ("thinking" as const),
    lookX: keys(t, [[CALL.glow, 0.5], [CALL.glow + 6, -0.7]]),
    lookY: keys(t, [[CALL.glow, 0.3], [CALL.glow + 6, 0.6]]),
    armR: { target: onDesk(OFFICE_LAPTOP_X, -6), shape: "relax" as const, elbow: "down" as const },
    armL: { target: keysV(t, [[CALL.glow + 4, onDesk(MOM.x - 90, -4)], [CALL.glow + 18, onDesk(440, -8)]], anticipate), shape: t > CALL.glow + 14 ? ("open" as const) : ("relax" as const), elbow: "down" as const },
  });

  // ---------- разговор: мама в офисе ----------
  const momTalk = (t: number) => ({
    expr: t < s1.to ? ("softSmile" as const) : t < hangUp ? ("calm" as const) : ("thinking" as const),
    nod: keys(t, [[s1.to - 6, 0], [s1.to + 2, 5], [s1.to + 10, 0]]),
    lookX: keys(t, [[hangUp, 0.1], [hangUp + 16, 0.5]]),
    lookY: keys(t, [[hangUp, 0], [hangUp + 16, 0.4]]),
    armR: {
      target: keysV(t, [[0, MOM_EAR], [hangUp, MOM_EAR], [hangUp + 18, MOM_LOOK]], anticipate),
      shape: "phone" as const,
      item: "phone" as const,
      glow: 1,
      itemTilt: keys(t, [[hangUp, -18], [hangUp + 14, 0]]),
      elbow: "down" as const,
      behind: false,
    },
    armL: handOnDesk(-1),
  });
  const momFace = (t: number) => keys(t, [[hangUp, 0.25], [hangUp + 14, 0.45]]);

  // ---------- класс: сын с телефоном, учительница рядом ----------
  const sonPose = (t: number) => ({
    expr: t < s1.from ? ("calm" as const) : t < m1.from ? ("softSmile" as const) : ("smile" as const),
    armR: { target: at(SON, 0.1, -0.83), shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: -16, elbow: "down" as const, behind: false },
    armL: { target: at(SON, -0.2, -0.47), shape: "relax" as const, elbow: "down" as const },
    headTilt: keys(t, [[m1.from, 0], [m1.from + 12, -5]]),
    nod: keys(t, [[m1.to - 4, 0], [m1.to + 4, 5], [m1.to + 12, 0]]),
  });
  // учительница кладёт руку на плечо сына
  const shoulder = at(SON, 0.07, -0.71);
  const teacherPose = (t: number) => ({
    expr: "softSmile" as const,
    lean: 6,
    armL: { target: keysV(t, [[splitAt, at(TEACHER, -0.13, -0.45)], [splitAt + 20, shoulder]], anticipate), shape: "open" as const, elbow: "down" as const, behind: false },
  });

  const callScreen = f >= CALL.ring;
  const sleeve = LOOKS.mom.topColor;
  const skin = LOOKS.mom.skin;
  const topH = lerp(960, 0, collapse) * (1 - sp) + 960 * sp;
  // вставка телефона крупно (между reminder и разделением)
  const insert = f >= CALL.reminder && f < splitAt + 8;
  const insertA = clamp((f - CALL.reminder) / 8) * (1 - clamp((f - splitAt) / 8));
  return (
    <>
      {/* верх: класс (уходит в начале, возвращается при звонке) */}
      <Panel top={0} height={topH} cam={f < splitAt ? CAM_CLASS_SPLIT : CAM_SON_CALL} bg="#F4ECDF">
        <Classroom uid="c3" f={f} bellUp={() => 0} swing={0} son={sonPose} sonFace={() => 0.35} teacher={teacherPose} teacherFace={() => -0.45} packOpen={0} packFill={1} bellRight={f >= splitAt} packWorn={f >= splitAt} />
      </Panel>
      {/* низ: офис */}
      <Panel top={topH} height={1920 - topH} cam={f < splitAt ? officeCam : CAM_MOM_CALL} bg="#E8EEF4">
        {f < splitAt ? (
          <Office uid="c3o" f={f} mom={momIntro} face={(t) => keys(t, [[CALL.glow + 4, 0.35], [CALL.glow + 14, -0.15]])} phoneOnDesk phoneGlow={f >= CALL.glow ? 1 : 0} />
        ) : (
          <Office uid="c3m" f={f} mom={momTalk} face={momFace} phoneOnDesk={false} />
        )}
      </Panel>
      {topH > 2 && topH < 1918 ? <WaveDivider y={topH} f={f} amp={12} /> : null}
      {f >= splitAt ? (
        <>
          <WorldTag text={BG19_TEXT.call.contact} x={90} y={270} opacity={clamp((f - splitAt - 8) / 10)} />
          <WorldTag text={BG19_TEXT.call.mom} x={90} y={1060} opacity={clamp((f - splitAt - 8) / 10)} dark />
        </>
      ) : null}
      {/* телефон крупно */}
      {insert ? (
        <div style={box({ inset: 0, opacity: insertA, background: "radial-gradient(circle at 50% 40%, #EEF2F7, #C9D3DF)" })}>
          <div style={box({ left: 0, top: 0, width: 1080, height: 1920, translate: `0 ${(1 - insertA) * 60}px` })}>
            <PhoneFrame x={180} y={250} w={720} tilt={-1.5}>
              {callScreen ? <SonCallScreen f={f} answerAt={CALL.answer} /> : f >= CALL.week ? <WeekScreen f={f} lit={CALL.lit} /> : <ReminderScreen f={f} at={CALL.reminder + 4} />}
            </PhoneFrame>
            <HoldingHand x={180} y={250} w={720} sleeve={sleeve} skin={skin} />
          </div>
        </div>
      ) : null}
    </>
  );
};

const OFFICE_LAPTOP_X = 860;

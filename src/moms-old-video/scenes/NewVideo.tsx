// Сцена 13 «Новая семейная запись» (≈ 8,8 с, без речи).
// Мама и сын рядом делают те же два движения — шаг с переносом веса и
// плавное движение рук; сын уже увереннее, мама поддерживает его взглядом.
// Папа сбоку снимает на телефон (к зрителю — ребро корпуса, экран — к
// нему) и улыбается. Общий план семьи → кадр новой записи в телефоне
// папы: как в начале фильма, сначала крупно стопы в шаге, затем обе фигуры
// → крупно лица → снова телефон, уже по центру кадра: так он перейдёт в
// карточку финала. Надпись «Жаңы видео. Жаңы эскерүү.»
import { useCurrentFrame } from "remotion";
import { Actor, type PoseIn } from "../rig/Actor";
import { keys } from "../rig/motion";
import type { ExprId } from "../rig/pose";
import { CameraUI, HoldingHands, KineticWords, Phone } from "../screens";
import { MOV_TEXT } from "../script";
import { ChairBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { RecordingContent, REC_FROM } from "./Cta";
import { dancePose, danceTurn } from "./danceKit";
import { FAMILY_DAD, FAMILY_MOM, FAMILY_SEGS, FAMILY_SON, FAMILY_SON_SEGS, familyT13, REC_WIDE } from "./familyDance";

const NV = { pov1: 76, back: 150, pov2: 204, hands: [212, 240] as const };
const DAD_SKIN = { skin: "#DCAA84", shade: "#C5906B", sleeve: "#5E7396" };

export const NewVideoScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = familyT13(f);

  // мама смотрит на сына в паузах между движениями и на шаге «к нему»
  const momGlance = (tt: number) => keys(tt, [[0, 0.1], [40, 0.1], [60, 0.45], [96, 0.45], [116, 0.15], [170, 0.15], [190, 0.5], [230, 0.5], [250, 0.2]]);
  const momFace = (tt: number) => danceTurn(tt, FAMILY_SEGS, "momDance") + momGlance(tt);
  const momPose = (tt: number): PoseIn => ({
    ...dancePose(tt, FAMILY_SEGS, "momDance", FAMILY_MOM),
    expr: (momGlance(tt) > 0.3 ? "proud" : "smile") as ExprId,
  });
  const sonFace = (tt: number) => danceTurn(tt, FAMILY_SON_SEGS, "son") - keys(tt, [[0, 0.25], [30, 0.05], [200, 0.05], [220, 0.3]]);
  const sonPose = (tt: number): PoseIn => ({
    ...dancePose(tt, FAMILY_SON_SEGS, "son", FAMILY_SON),
    expr: (tt < 40 ? "focused" : "proud") as ExprId,
  });
  // папа в профиль держит телефон двумя руками перед собой (ребром к зрителю)
  const dadPose = (tt: number): PoseIn => {
    const ph = { x: FAMILY_DAD.x - 0.2 * FAMILY_DAD.h + Math.sin(tt / 22) * 3, y: FAMILY_DAD.y - 0.7 * FAMILY_DAD.h + Math.sin(tt / 17) * 2 };
    return {
      expr: "smile",
      lookY: 0.15,
      // ближняя к зрителю рука (правая на экране) держит телефон, дальняя — поддерживает
      armR: { target: ph, shape: "fist", item: "phoneSide", itemTilt: 0, elbow: "down", behind: false },
      armL: { target: { x: ph.x + 10, y: ph.y + 14 }, shape: "fist", elbow: "down", behind: true },
      headTilt: keys(tt, [[0, 0], [120, 3], [200, -2]]),
    };
  };
  const world = (
    <>
      <LivingBack light="day" f={f} />
      <Sofa light="day" />
      <Rug />
      <ChairBack x={LIV.chair.x - 90} light="day" />
      <WorkTable light="day" />
      <Actor uid="n13-dad" look="dad" f={f} place={() => FAMILY_DAD} face={() => -0.72} pose={dadPose} seed={2} />
      <Actor uid="n13-mom" look="momDance" f={t} place={() => FAMILY_MOM} face={momFace} pose={momPose} seed={1} lead="body" />
      <Actor uid="n13-son" look="son" f={t} place={() => FAMILY_SON} face={sonFace} pose={sonPose} seed={4} lead="body" />
    </>
  );
  // камера записи: как в начале фильма — стопы крупно, затем обе фигуры
  const recCam = (tt: number): Cam => {
    if (tt < NV.pov1 + 10) return { x: 1120, y: 1560, zoom: 2.3 };
    return camMove(tt, NV.pov1 + 10, NV.back - 4, { x: 1120, y: 1560, zoom: 2.3 }, REC_WIDE);
  };
  const pov = (fromF: number) => {
    const second = fromF >= NV.pov2;
    const ph = second ? { x: 540, y: 960, w: 520, rot: 0 } : { x: 540, y: 930, w: 560, rot: keys(f, [[NV.pov1, -3], [NV.back, -1.5]]) };
    // на втором плане руки папы опускаются за кадр — телефон становится рамкой фильма
    const handsA = second ? 1 - keys(f, [[NV.hands[0], 0], [NV.hands[1], 1]]) : 1;
    return (
      <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%, #F3E6D2, #D9C3A5 75%)" })}>
        {/* размытая комната за телефоном (мягкие пятна) */}
        <div style={box({ left: 640, top: 520, width: 520, height: 900, borderRadius: 260, backgroundColor: "#5269A0", opacity: 0.28 })} />
        <div style={box({ left: -120, top: 260, width: 420, height: 560, borderRadius: 40, backgroundColor: "#8CA9C8", opacity: 0.22 })} />
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, rotate: `${ph.rot}deg`, transformOrigin: `${ph.x}px ${ph.y}px` })}>
          <Phone x={ph.x} y={ph.y} w={ph.w}>
            <CameraUI f={t} recFrom={REC_FROM}>
              <RecordingContent f={f} t={t} cam={second ? REC_WIDE : recCam(f)} />
            </CameraUI>
          </Phone>
          {handsA > 0.01 ? (
            <div style={box({ inset: 0, translate: `0 ${(1 - handsA) * 900}px` })}>
              <HoldingHands x={ph.x} y={ph.y} w={ph.w} skin={DAD_SKIN.skin} shade={DAD_SKIN.shade} sleeve={DAD_SKIN.sleeve} />
            </div>
          ) : null}
        </div>
      </div>
    );
  };
  return (
    <>
      <Shot f={f} from={0} to={NV.pov1} cam={camMove(f, 0, NV.pov1, { x: 1300, y: 1185, zoom: 0.9 }, { x: 1280, y: 1180, zoom: 0.95 })} bg="#F1E4D1">
        {world}
      </Shot>
      {f >= NV.pov1 && f < NV.back ? pov(NV.pov1) : null}
      <Shot f={f} from={NV.back} to={NV.pov2} cam={camMove(f, NV.back, NV.pov2, { x: 1130, y: 1080, zoom: 1.42 }, { x: 1135, y: 1060, zoom: 1.5 })} bg="#F1E4D1">
        {world}
      </Shot>
      {f >= NV.pov2 ? pov(NV.pov2) : null}
      {/* «Жаңы видео. Жаңы эскерүү.» — две короткие фразы, по строке */}
      {f >= NV.pov2 + 4
        ? MOV_TEXT.memory
            .split(". ")
            .map((part, i, all) => <KineticWords key={i} f={f} at={NV.pov2 + 6 + i * 14} text={i < all.length - 1 ? `${part}.` : part} size={80} top={168 + i * 98} />)
        : null}
    </>
  );
};

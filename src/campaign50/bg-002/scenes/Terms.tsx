// Сцена 5 (39,2–51,4 с): честные условия на планшете в такт диктору:
// 1) ылайыктуу топ түзүлөт (3–4 бала, 2 жумага чейин), 2) биринчи толук
// сыноо сапары акысыз (ҮЙ → МЕКТЕП → ҮЙ), 3) андан соң — чечим ата-энеде.
// Ниже — заявка открыта, но не отправлена: «Сапар азырынча тастыктала
// элек». Затем офис: планшет со страницей заявки стоит на столе, папа с
// папкой идёт к переговорной; сыну ушло сообщение «Балам, бүгүн өзүм алып
// кетем». Таймер останавливается у открытой двери (00:10, «Убагында»).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { CuesContext } from "../context";
import { cruise, easeOut, keys } from "../rig/motion";
import { BG2_SCENES, BG2_TEXT, BG2_TIMER, BG2_VIDEO, lineById } from "../script";
import { StepsScreen, TabletFrame } from "../screens";
import { box, Shot } from "../shots";
import { H, placeAt, sentenceFrames } from "./common";
import { OfficeWorld } from "./OfficeWorld";

const FPS = BG2_VIDEO.fps;
const SC = BG2_SCENES.find((s) => s.id === "terms")!;
// кадр сцены, когда таймер останавливается (папа у двери)
export const TERMS_STOP = Math.round((BG2_TIMER.stopAt - SC.from) * FPS);
export const TERMS = { office: 290, walkFrom: 296 } as const;
export const DAD_DOOR = 1440;

// Папа идёт от стола к двери переговорной (мировые px).
export const dadWalk = (t: number) => placeAt(1240 + (DAD_DOOR - 1240) * cruise((t - TERMS.walkFrom) / (TERMS_STOP - TERMS.walkFrom - 4)), 1500, H.dad);

// Маленькая копия страницы заявки на планшете на столе.
export const MiniForm: React.FC = () => (
  <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, padding: 10, boxSizing: "border-box" })}>
    <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.navy }}>{BG2_TEXT.form.title}</div>
    <div style={{ marginTop: 6, height: 16, borderRadius: 6, backgroundColor: "#EAF3FC" }} />
    <div style={{ marginTop: 6, height: 16, borderRadius: 6, backgroundColor: "#EAF3FC" }} />
    <div style={{ marginTop: 10, height: 26, borderRadius: 13, backgroundColor: COLORS.yellow }} />
  </div>
);

export const dadStandingPose = (t: number, stopAt: number) => ({
  expr: t < stopAt ? ("calm" as const) : ("softSmile" as const),
  armR: { target: null, shape: "fist" as const, item: "notebook" as const },
  armL: { target: null, shape: "relax" as const },
});

export const TermsScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const shown = sentenceFrames(cues, "n05", "terms", lineById("n05").text).map((x) => x - 4);
  const formAt = Math.min(TERMS.office - 70, shown[2] + 40);
  const face = (t: number) => keys(t, [[TERMS.walkFrom, 0.6], [TERMS_STOP - 6, 0.6], [TERMS_STOP + 10, -0.2]]);
  const reply = easeOut((f - TERMS.office - 12) / 10);
  return (
    <>
      <Shot
        f={f}
        from={0}
        to={TERMS.office}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%, #FFFFFF, #DCE3EE)" })}>
            <TabletFrame x={120} y={430} w={840} h={1150}>
              <StepsScreen f={f} shown={shown} formAt={formAt} />
            </TabletFrame>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot
        f={f}
        from={TERMS.office}
        to={400}
        cam={{ x: 1240, y: 1060, zoom: 1.35 }}
        overlay={
          <div style={box({ left: 60, width: 600, top: 1170, padding: "20px 26px", borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 14px 34px rgba(20,30,60,0.25)", fontFamily, opacity: reply, translate: `0 ${(1 - reply) * -20}px` })}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#3E8E5E" }}>{`✓ ${BG2_TEXT.reply.to}`}</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#1E2235", marginTop: 4 }}>{BG2_TEXT.reply.text}</div>
          </div>
        }
      >
        <OfficeWorld
          f={f}
          dad={dadWalk}
          dadFace={face}
          dadPose={(t) => dadStandingPose(t, TERMS_STOP)}
          dadWalkFrom={TERMS.walkFrom}
          dadBehindDesk={false}
          sitters={2}
          doorOpen={1}
          phone={null}
          folder={false}
          chair
          tablet={<MiniForm />}
        />
      </Shot>
    </>
  );
};

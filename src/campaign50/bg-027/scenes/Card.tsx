// Сцена 3: карточка встречи крупно. Две нейтральные иконки взрослых —
// «Ата-эне» и «Макулдашылган ишенимдүү адам» — появляются на словах
// диктора; на «гана» вокруг них рисуется яркая жёлтая рамка, а серая
// иконка «?» неизвестного взрослого, подъехавшая сбоку, в рамку не
// попадает и исчезает. Никакого «каалаган адам».
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../../../config";
import { easeInOut, easeOut } from "../../../two-schedules-2d/rig/motion";
import { box } from "../../../two-schedules-2d/shots";
import { useSceneFrames, useWord } from "../context";
import { AdultIcon, MeetingCard, SOFT_YELLOW } from "../sets";

// Положение карточки в кадре (то же место, откуда финальная рамка
// начинает превращение в сцене 6).
export const CARD_POS = { x: 90, y: 500, w: 900 } as const;

export const CardScene: React.FC = () => {
  const f = useCurrentFrame();
  const end = useSceneFrames("card");
  const wParent = useWord("n2", 2); // «ата-энесине»
  const wTrusted = useWord("n2", 6); // «ишенимдүү»
  const wOnly = useWord("n2", 8); // «гана»
  const rowA = easeOut((f - (wParent - 4)) / 10);
  const rowB = easeOut((f - (wTrusted - 8)) / 10);
  const frame = easeInOut((f - (wOnly - 2)) / 22);
  const cardIn = easeOut(f / 14);
  const push = 1 + 0.035 * easeInOut(f / end);
  // «?» приезжает справа, упирается в рамку и исчезает
  const qIn = easeOut((f - (wTrusted + 6)) / 14);
  const qOut = easeOut((f - (wOnly + 14)) / 12);
  const qx = 1200 - 170 * qIn + 70 * qOut;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden" })}>
      <div style={box({ left: -240, top: -220, width: 720, height: 720, borderRadius: 360, backgroundColor: SOFT_YELLOW, translate: `${Math.sin(f / 40) * 10}px 0` })} />
      <div style={box({ right: -240, bottom: 120, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC" })} />
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, scale: `${push}`, transformOrigin: "50% 45%" })}>
        <div style={box({ left: 540 - 70, top: 290, opacity: cardIn })}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 140, height: 140, borderRadius: 70, objectFit: "cover", boxShadow: "0 12px 30px rgba(20,40,90,0.16)" }} />
        </div>
        <div style={box({ left: CARD_POS.x, top: CARD_POS.y + (1 - cardIn) * 80, opacity: cardIn })}>
          <MeetingCard w={CARD_POS.w} tick={1} frame={frame} rowA={rowA} rowB={rowB} showName={false} note={easeOut((f - (wOnly + 20)) / 12)} />
        </div>
        <div style={box({ left: qx - 80, top: CARD_POS.y + 300, opacity: qIn * (1 - qOut), scale: `${1 - 0.4 * qOut}` })}>
          <AdultIcon size={160} color="#B9C0CC" unknown />
        </div>
      </div>
    </div>
  );
};

// Сцена 1. 00:00–00:07. «Эки жыл жана үч күн» — хук через действие.
// Мягко освещённый кабинет, средний план спереди: Айжан у ноутбука (видна
// только наружная сторона крышки — письмо пока не раскрыто). Камера
// медленно приближается.
//   «Айжан бул сунушту эки жыл күткөн.» — читает с экрана, лёгкая улыбка;
//   кладёт пальцы на клавиатуру и начинает отвечать — короткая серия
//   нажатий; останавливается, кисти зависают над клавишами;
//   «Бирок үч күндөн бери жооп бере элек.» — правая рука уходит к
//   подбородку, взгляд в сторону, короткий выдох: сомнение.
// После второй фразы — небольшое «Эмне үчүн?» вверху карточки (не поверх
// лица и рук). Содержание письма раскрывается в следующей сцене планом
// через плечо.
import { fontFamily } from "../../fonts";
import { type PoseIn } from "../rig/Actor";
import { easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { KeysOnDesk, OFFICE } from "../sets/Office";
import { C } from "../theme";
import { seatOf } from "./common";
import { box, PanelArea, useScene } from "./kit";
import { OFFICE_MOM, OfficeStage, typingArms } from "./Office";

export const IntroScene: React.FC = () => {
  const { f, from, to } = useScene("intro");
  const s2 = from("n01b");
  const typeFrom = Math.max(30, to("n01") - 14); // начинает отвечать
  const typeTo = typeFrom + 26; // и останавливается
  const chin = [s2 - 8, s2 + 10] as const; // рука к подбородку
  const whyIn = to("n01b") + 8;
  const why = easeOut((f - whyIn) / 10);
  const M = OFFICE_MOM;
  const chinAt = { x: M.x + 32, y: M.y - 0.615 * M.h };
  const momPose = (tt: number): PoseIn => {
    const typing = typingArms(tt, tt >= typeFrom && tt < typeTo, typeFrom);
    const k = OFFICE.keyboard;
    // после остановки кисти чуть приподняты над клавишами (зависли)
    const hover = (side: -1 | 1) => ({ x: k.x + side * 46, y: k.y - 10 });
    return {
      expr: tt < typeFrom - 6 ? "softSmile" : tt < typeTo + 6 ? "calm" : tt < s2 + 4 ? "thinking" : "worried",
      sit: 1,
      seat: seatOf(M),
      armL: tt < typeTo ? typing.armL : { target: hover(-1), shape: "relax", elbow: "hang", behind: false },
      armR:
        tt < typeTo
          ? typing.armR
          : {
              target: keysV(tt, [[typeTo, hover(1)], [chin[0], hover(1)], [chin[1], chinAt]], easeInOut),
              shape: tt > chin[0] + 8 ? "fist" : "relax",
              elbow: tt > chin[0] + 9 ? "down" : "hang",
              behind: false,
              wrist: tt > chin[0] + 8 ? 60 : 0,
            },
      // читает (взгляд вниз на экран) → взгляд уходит в сторону и вниз
      lookY: keys(tt, [[0, 0.35], [typeTo + 4, 0.35], [s2, 0.15], [s2 + 14, 0.25]]),
      lookX: keys(tt, [[typeTo + 4, 0], [s2 + 2, 0.45], [whyIn + 10, 0.45], [whyIn + 30, 0.2]]),
      headTilt: keys(tt, [[chin[0], 0], [chin[1] + 6, -4]]),
      lean: keys(tt, [[typeTo, 0], [chin[1], -3]]),
      exhale: keys(tt, [[s2 + 4, 0], [s2 + 14, 0.6], [s2 + 30, 0]]),
      nod: keys(tt, [[0, 2], [typeFrom, 2], [typeFrom + 8, 4], [typeTo, 4], [typeTo + 10, 1]]),
    };
  };
  // камера: мягкое приближение к лицу (без резкого зума)
  const u = easeInOut(f / 200);
  const cam = { x: 850, y: keys(u, [[0, 990], [1, 972]]), zoom: keys(u, [[0, 1.5], [1, 1.9]]) };
  return (
    <PanelArea>
      <OfficeStage f={f} uid="i1" cam={cam} momFace={() => 0} momPose={momPose} onDesk={<KeysOnDesk />} />
      {/* лёгкий тёплый свет из окна */}
      <div style={box({ inset: 0, background: "radial-gradient(circle at 78% 18%, rgba(255,226,170,0.28), transparent 55%)", pointerEvents: "none" })} />
      <div style={box({ left: 0, right: 0, top: 56, display: "flex", justifyContent: "center", opacity: why, translate: `0 ${(1 - why) * 14}px` })}>
        <div style={{ padding: "14px 40px", borderRadius: 999, backgroundColor: "rgba(23,28,38,0.86)", fontFamily, fontSize: 60, fontWeight: 900, color: C.yellow, letterSpacing: 0.5 }}>{UL2_TEXT.why}</div>
      </div>
    </PanelArea>
  );
};

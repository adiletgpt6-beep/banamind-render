// Сцена 7: «Бирок баланын мектепке жолу күн сайын кайталанат.» Доска недели
// (WeekBoard) вырастает в календарь: пять разных задач, но одна и та же
// строка «07:40 • Мектеп» с вопросом в каждом дне. Внизу — сын с жёлтым
// рюкзаком входит к двери и ждёт: часы показывают 07:40 (каждое утро).
import { easeOut, NAVY, prog } from "../art";
import { Actor, type Place } from "../rig/Actor";
import { keys } from "../rig/motion";
import { local, type SceneProps } from "../kit";
import { FLOOR_Y, WallClock } from "./sets";

export const Repeat: React.FC<SceneProps> = ({ t, tl }) => {
  const { f, lt, len } = local(tl, "repeat", t);
  const fade = easeOut(prog(lt, -0.05, 0.45));
  const son = (t2: number): Place => ({ x: keys(t2, [[8, -120], [44, 470]]), y: FLOOR_Y, h: 470 });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F6F8FC 0%, #FFFFFF 46%, #FFF7DD 100%)" }} />
      {/* прихожая: дверь и часы */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, height: 540, backgroundColor: "#EFE6D6" }} />
      <div style={{ position: "absolute", left: 760, top: 960, width: 230, height: 422, borderRadius: "14px 14px 0 0", backgroundColor: "#B9875E", boxShadow: "inset 0 0 0 10px #A57550" }}>
        <div style={{ position: "absolute", left: 180, top: 210, width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFC928" }} />
      </div>
      <WallClock x={610} y={1010} r={56} h={7} m={40} />
      <div style={{ position: "absolute", left: 556, top: 1076, width: 108, textAlign: "center", fontSize: 26, fontWeight: 1000, color: NAVY }}>07:40</div>
      <Actor
        uid="rep-son"
        look="son"
        f={f}
        sceneLen={len}
        seed={11}
        walkFrom={0}
        place={son}
        face={(t2) => keys(t2, [[44, 0.6], [56, 0.35], [90, 0.35], [104, 0]])}
        pose={(t2) => ({
          expr: t2 < 60 ? ("calm" as const) : ("thinking" as const),
          lookY: keys(t2, [[46, 0], [56, -0.45], [96, -0.45], [106, 0]]),
          strapTug: keys(t2, [[50, 0], [60, 1]]),
          // держится за лямки рюкзака
          armL: { target: { x: son(t2).x - 0.09 * 470, y: FLOOR_Y - 0.6 * 470 }, shape: "fist" as const, elbow: "hang" as const },
          armR: { target: { x: son(t2).x + 0.09 * 470, y: FLOOR_Y - 0.6 * 470 }, shape: "fist" as const, elbow: "hang" as const },
        })}
      />
    </div>
  );
};

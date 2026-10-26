// Сцена 3: вечер. Папа за ноутбуком замечает на столе рисунок сына
// (папа и сын на скамейке со змеем), крупно — рисунок; затем настольный
// календарь: «12:30 • мектеп» в каждом дне, папа переворачивает страницу —
// на следующей неделе то же самое. Папа (тихо): «Жолду күн сайын өзүм
// уюштурбай, алдын ала башкача пландаштырсамчы?» — и подводит курсор
// к строке поиска (видимое решение героя).
import { Actor, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { anticipate, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { ChairBack, HOME, HomeBack, LaptopSide, TableFront, WarmLamp } from "../../../two-schedules-2d/sets/Home";
import { box, camMove, Shot } from "../../../two-schedules-2d/shots";
import { onTable, seated, seatOf } from "../../../two-schedules-2d/scenes/common";
import { useSceneInfo } from "../context";
import { Calendar, Drawing, SearchIdle } from "../screens";

// Монтаж сцены (кадры от начала сцены).
export const THINK = { drawing: 36, calendar: 76, flip: 96, speak: 118 };

export const ThinkScene: React.FC = () => {
  const { f, dur, line } = useSceneInfo("think");
  const f02 = line("f02");
  const speak = Math.min(THINK.speak, f02.from - 4);
  const toSearch = f02.to + 8;
  const dadP = seated("dad", HOME.seat.mom);
  const drawingAt = onTable(dadP.x - 0.28 * dadP.h, 6);
  const dadFace = (t: number) => keys(t, [[0, 0.4], [10, 0.4], [24, -0.25], [speak, -0.1], [f02.from + 20, 0.05], [f02.to, 0.35]]);
  const dadPose = (t: number): PoseIn => ({
    expr: t < speak ? "tired" : t < f02.to - 10 ? "thinking" : "calm",
    sit: 1,
    seat: seatOf(dadP),
    lookY: keys(t, [[0, 0.35], [10, 0.35], [24, 0.6], [speak, 0.2], [f02.to, 0.3]]),
    headTilt: keys(t, [[speak, 0], [speak + 20, 4], [f02.to, 0]]),
    armL: { target: keysV(t, [[0, onTable(dadP.x - 0.12 * dadP.h, -4)], [14, onTable(dadP.x - 0.12 * dadP.h, -4)], [30, { x: drawingAt.x + 20, y: drawingAt.y - 8 }]], anticipate), shape: "open", elbow: "down" },
    armR: { target: keysV(t, [[0, onTable(HOME.laptop.x - 30, -4)], [f02.to - 20, onTable(HOME.laptop.x - 30, -4)], [f02.to, onTable(HOME.laptop.x - 10, -10)]], anticipate), shape: t > f02.to - 20 ? "point" : "relax", elbow: "down", behind: false },
  });
  const room = (
    <>
      <HomeBack minutes={19 * 60 + 30 + f / 300} evening={1} f={f} />
      <WarmLamp />
      <ChairBack x={dadP.x} evening={1} />
      <Actor uid="t-dad" look="dad" f={f} place={() => dadP} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      {/* рисунок сына и настольный календарь */}
      <div style={box({ left: drawingAt.x - 80, top: drawingAt.y - 26, width: 150, height: 34, backgroundColor: "#FFFDF6", borderRadius: 3, rotate: "-5deg", boxShadow: "0 3px 6px rgba(60,40,20,0.15)" })}>
        <div style={box({ left: 16, top: 8, width: 26, height: 14, borderRadius: 7, backgroundColor: "#FFC90E" })} />
        <div style={box({ left: 56, top: 12, width: 70, height: 8, borderRadius: 4, backgroundColor: "#6BB257" })} />
      </div>
      <div style={box({ left: 820, top: HOME.table.top - 70, width: 110, height: 86, backgroundColor: "#FFFFFF", borderRadius: 6, border: "4px solid #C9CED6", boxSizing: "border-box" })}>
        <div style={box({ left: 8, top: 10, width: 86, height: 12, borderRadius: 3, backgroundColor: "#FFC90E" })} />
      </div>
      <LaptopSide x={HOME.laptop.x} y={HOME.laptop.y} open={1} />
      <Actor uid="t-dad" look="dad" f={f} place={() => dadP} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={THINK.drawing} cam={camMove(f, 0, THINK.drawing, { x: 930, y: 1110, zoom: 1.5 }, { x: 900, y: 1130, zoom: 1.62 })} bg="#3B3149">
        {room}
      </Shot>
      <Shot f={f} from={THINK.drawing} to={THINK.calendar} cam={camMove(f, THINK.drawing, THINK.calendar, { x: 540, y: 960, zoom: 1 }, { x: 540, y: 980, zoom: 1.05 })} overlay={<Drawing f={f - THINK.drawing} />}>
        {null}
      </Shot>
      <Shot f={f} from={THINK.calendar} to={speak} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<Calendar f={f} flip={(f - THINK.flip) / 16} highlight={(f - THINK.calendar) / 20} />}>
        {null}
      </Shot>
      <Shot f={f} from={speak} to={toSearch} cam={camMove(f, speak, toSearch, { x: 1010, y: 1040, zoom: 1.85 }, { x: 1030, y: 1050, zoom: 1.95 })} bg="#3B3149">
        {room}
      </Shot>
      <Shot f={f} from={toSearch} to={dur} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<SearchIdle f={f} cursor={{ x: keys(f, [[toSearch, 760], [dur - 6, 560]]), y: keys(f, [[toSearch, 900], [dur - 6, 360]]) }} />}>
        {null}
      </Shot>
    </>
  );
};

// Сцена 6. Третий «Б» и другая дверь.
// A. Средний план: мальчик оживляется — у него есть важная информация;
//    папа поднимает ручку над блокнотом и смотрит на сына. Начало K03.
// B1. Лист сверху: после слов «үчүнчү Б» папа пишет «3 «Б»»; на словах о
//    спортзале быстро рисует схему школы (основной вход в центре здания,
//    выход спортзала в правом крыле — как на фасаде).
// B2. Средний план: мальчик показывает на лист, папа смотрит туда же.
// B3. Лист: палец мальчика на выходе спортзала; папа обводит его и
//    записывает «Спорт залдын чыгышы» (после того как это прозвучало).
import type { PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { NB, nbPenTip, NotebookTop } from "../props/Notebook30";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { KM2_TEXT } from "../script";
import { FLAT } from "../sets/Flat";
import { HANDS } from "./common";
import { DadPen, TableTop } from "./Hook";
import { DAD_SEAT, DiningRoom, MOM_SEAT, seated } from "./Room";

const T = KM2_TEXT;
const R = NB.rows;
const M = NB.map;
const MK = M.w / 900;
export const GYM_EXIT_ON_MAP = { x: M.x + 792 * MK, y: M.y + 312 * MK };

export const thirdBPlan = (tl: Km2Timeline) => {
  const S = sceneTools(tl, "thirdB");
  const top1 = S.word("K03", "үчүнчү") - 4;
  const writeB: [number, number] = [S.wordEnd("K03", "бэ") + 2, S.wordEnd("K03", "бэ") + 18];
  const sketch: [number, number] = [Math.max(writeB[1] + 6, S.word("K03", "Спорт")), Math.max(writeB[1] + 6, S.word("K03", "Спорт")) + 30];
  const point = S.word("K03", "башка") - 2; // жест мальчика (средний план)
  const top2 = Math.max(point + 22, S.to("K03") + 2);
  const circle: [number, number] = [top2 + 8, top2 + 26];
  const writeExit: [number, number] = [circle[1] + 6, circle[1] + 52];
  return { top1, writeB, sketch, point, top2, circle, writeExit, k03: S.from("K03"), k03End: S.to("K03"), len: S.len };
};
type P = ReturnType<typeof thirdBPlan>;

const cast = (p: P) => ({
  momPose: (): PoseIn => ({ ...seated(MOM_SEAT), expr: "softSmile", lookY: 0.15 }),
  momFace: () => 0.62,
  dadPose: (t: number): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: "softSmile",
    lookY: t >= p.point + 4 ? 0.6 : 0.1,
    // ручка поднята над листом (готов писать), во время жеста — у листа
    armR: { target: { x: FLAT.notebook.x + 30, y: FLAT.table.top - (t >= p.point ? 14 : 34) }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 70, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: (t: number) => keys(t, [[p.point + 2, 0.7], [p.point + 12, 0.35]]),
  boyPose: (t: number): PoseIn => {
    const pt = keysV(t, [
      [p.point, { x: 960, y: FLAT.table.top - 60 }],
      [p.point + 10, { x: FLAT.notebook.x + 70, y: FLAT.table.top - 24 }],
    ]);
    return {
      expr: { browIn: 3, browOut: 4, lid: 0.04, smile: 0.45 },
      lookY: t >= p.point ? 0.55 : 0.05,
      armL: t >= p.point ? { target: pt, shape: "point", elbow: "down", behind: false } : { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false },
    };
  },
  boyFace: (t: number) => (t >= p.point ? -0.4 : -0.6),
});

const Sheet: React.FC<{ f: number; p: P; finger: boolean }> = ({ f, p, finger }) => {
  const uB = easeInOut(clamp((f - p.writeB[0]) / (p.writeB[1] - p.writeB[0])));
  const map = easeInOut(clamp((f - p.sketch[0]) / (p.sketch[1] - p.sketch[0])));
  const hi = easeInOut(clamp((f - p.circle[0]) / (p.circle[1] - p.circle[0])));
  const uE = clamp((f - p.writeExit[0]) / (p.writeExit[1] - p.writeExit[0]));
  // кончик ручки: строка «3 «Б»» → схема → обводка → строка выхода
  let tip = nbPenTip(T.noteSchool[0], R.classB, uB);
  if (f >= p.sketch[0] - 4 && f < p.circle[0]) tip = { x: M.x + M.w * map, y: M.y + 120 + 60 * Math.sin(map * 9) };
  if (f >= p.circle[0] && f < p.writeExit[0]) {
    const a = hi * Math.PI * 2 - Math.PI / 2;
    tip = { x: GYM_EXIT_ON_MAP.x + Math.cos(a) * 96 * MK, y: GYM_EXIT_ON_MAP.y + Math.sin(a) * 88 * MK };
  }
  if (f >= p.writeExit[0]) tip = nbPenTip(T.noteSchool[1], R.gymExit, uE);
  const lift = (f > p.writeB[1] && f < p.sketch[0] - 4) || f > p.writeExit[1] ? 1 : 0.15 * Math.abs(Math.sin(f / 2.3));
  const fingerAt = keysV(f, [
    [p.top2 - 4, { x: GYM_EXIT_ON_MAP.x + 20, y: GYM_EXIT_ON_MAP.y + 10 }],
    [p.writeExit[0] - 2, { x: GYM_EXIT_ON_MAP.x + 20, y: GYM_EXIT_ON_MAP.y + 10 }],
    [p.writeExit[0] + 14, { x: GYM_EXIT_ON_MAP.x + 260, y: GYM_EXIT_ON_MAP.y - 40 }],
  ]);
  return (
    <TableTop f={f} cam={{ x: 600, y: 730, zoom: 1.13 }}>
      <NotebookTop
        lines={[
          { text: T.notePlan[0], y: R.address, u: 1 },
          { text: T.notePlan[1], y: R.time, u: 1 },
          { text: T.notePlan[2], y: R.route, u: 1 },
          { text: T.noteSchool[0], y: R.classB, u: uB },
          { text: T.noteSchool[1], y: R.gymExit, u: uE },
        ]}
        map={map}
        mapHi={hi}
      >
        {finger ? <CloseHand x={fingerAt.x + 175} y={fingerAt.y - 6} angle={92} size={140} {...HANDS.boy} shape="point" /> : null}
        <DadPen x={tip.x} y={tip.y} lift={lift} />
      </NotebookTop>
    </TableTop>
  );
};

export const ThirdBScene: React.FC = () => {
  const { f } = useScene("thirdB");
  const p = usePlan(thirdBPlan);
  const props = { phone: "table" as const, car: "cabinet" as const, notebookRows: 3 };
  if (f < p.top1) return <DiningRoom f={f} cam={{ x: 840, y: 960, zoom: 1.6 }} cast={cast(p)} props={props} />;
  if (f < p.point) return <Sheet f={f} p={p} finger={false} />;
  if (f < p.top2) return <DiningRoom f={f} cam={{ x: 830, y: 1000, zoom: 1.7 }} cast={cast(p)} props={{ ...props, notebookRows: 5 }} />;
  return <Sheet f={f} p={p} finger={f < p.writeExit[0] + 16} />;
};

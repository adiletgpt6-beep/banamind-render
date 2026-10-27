// Сцена 4 (≈35–47 с): связующее действие. Папа откидывается, трёт лоб и
// смотрит на жёлтый стикер «Мектеп: күн сайын» на пробковой доске.
// Мысль про себя: «Мектепке каттамды өзүнчө алдын ала уюштурсакчы?»
// Он снимает стикер и подносит к ноутбуку. Крупно экран: стикер ложится
// на строку «12:30 Мектептен алып келүү» в рабочем плане, строка
// выделяется и уезжает в отдельную вкладку «Мектеп каттамы». В новой
// вкладке папа набирает «Бишкек балдар үчүн такси» — появляется карточка
// BalaGo, он нажимает на неё.
import { useCurrentFrame } from "remotion";
import { useLine } from "../context";
import { EditorWindow, WIN } from "../editor";
import { PlanRow, PlanView, planRowY, ResultCard, SearchBox } from "../browser";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { BG10_TEXT } from "../script";
import { CarKeys } from "../sets/Apartment";
import { Chair, Desk, Laptop, OFFICE, OfficeBack, ScreenGlow, StickyNote } from "../sets/Office";
import { camMove, Shot } from "../shots";
import { DAD_SEAT, ScreenCam, seated } from "./common";

// Кадры экранной части от её начала (g).
export const DEC = { fly: 14, sel: 26, lift: 34, toTab: 50, gap: 56, page: 60, type0: 64, type1: 104, result: 110, click: 128 };

// Курсор мыши (стрелка).
const Pointer: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg width={64} height={80} viewBox="0 0 32 40" style={{ position: "absolute", left: x - 6, top: y - 4, transform: `scale(${1 - 0.12 * press})`, filter: "drop-shadow(0 4px 6px rgba(31,45,85,0.3))" }}>
    <path d="M 3 2 L 3 30 L 10 23 L 15 35 L 20 33 L 15 21 L 25 21 Z" fill="#FFFFFF" stroke="#1F2D55" strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);

export const DecideScene: React.FC = () => {
  const f = useCurrentFrame();
  const f02 = useLine("f02");
  const peel = f02.to + 4;
  const S = peel + 36; // начало экранной части
  const g = f - S;
  const note = OFFICE.note;
  const front = { x: 1000, y: 1060 };
  const notePos = keysV(f, [
    [peel + 12, { x: note.x, y: note.y }],
    [peel + 34, front],
  ]);
  const holding = f >= peel + 12;
  const dadPose = (t: number): PoseIn => {
    const s = seated(t);
    const head = { x: DAD_SEAT.x + 40, y: 820 };
    return {
      ...s,
      expr: t < 40 ? "tired" : t < f02.to ? "thinking" : "softSmile",
      lean: keys(t, [[0, 6], [16, -6], [f02.to, -4], [peel + 10, 10]]),
      exhale: keys(t, [[0, 0], [16, 0.9], [44, 0.3]]),
      lookY: keys(t, [[0, 0.4], [14, 0.1], [40, -0.15], [peel + 20, -0.15], [peel + 32, 0.5]]),
      lookX: keys(t, [[34, 0], [44, -0.6], [peel + 20, -0.6], [peel + 32, 0]]),
      headTilt: keys(t, [[f02.from, 0], [f02.from + 20, -5], [f02.to, -5], [f02.to + 12, 0]]),
      armR: t < 46 ? { target: keysV(t, [[0, s.armR!.target!], [10, head], [30, { x: head.x - 20, y: head.y + 8 }], [46, s.armR!.target!]]), shape: "open", elbow: "down" } : s.armR!,
      armL:
        t >= peel - 4
          ? {
              target: keysV(t, [
                [peel - 4, s.armL!.target!],
                [peel + 12, { x: note.x + 20, y: note.y + 20 }],
                [peel + 34, { x: front.x + 20, y: front.y + 20 }],
              ]),
              shape: t > peel + 10 ? "pinch" : "open",
              elbow: "out",
            }
          : { target: null, shape: "relax" },
    };
  };
  const dadFace = (t: number) => keys(t, [[34, 0], [46, -0.55], [peel + 20, -0.55], [peel + 32, 0]]);
  const world = (
    <>
      <OfficeBack minutes={13 * 60 + 12} light={1} noteOn={!holding} />
      <Chair x={OFFICE.chair.x} />
      <ScreenGlow x={OFFICE.dadX} y={920} a={1} />
      <Actor uid="s4-dad" look="dad" f={f} place={() => DAD_SEAT} face={dadFace} pose={dadPose} seed={2} />
      <Desk />
      <Laptop open={1} />
      <CarKeys x={1420} y={1262} />
      {holding ? <StickyNote x={notePos.x} y={notePos.y} rot={lerp(4, -3, clamp((f - peel - 12) / 22))} lift={1} /> : null}
    </>
  );

  // ---- экран ----
  const tabs = [BG10_TEXT.editor.tabs[0], BG10_TEXT.plan.file, BG10_TEXT.plan.newTab];
  const flyK = easeInOut(g / DEC.fly);
  const sel = easeInOut((g - DEC.fly) / (DEC.sel - DEC.fly));
  const liftK = easeOut((g - DEC.sel) / (DEC.lift - DEC.sel));
  const toTab = easeInOut((g - DEC.lift) / (DEC.toTab - DEC.lift));
  const tabIn = easeOut((g - DEC.toTab + 6) / 10);
  const page = g >= DEC.page;
  const rowY = planRowY(2);
  const tabTarget = { x: 760 - 540, y: WIN.y + 44 - rowY };
  const typed = clamp((g - DEC.type0) / (DEC.type1 - DEC.type0));
  const resK = easeOut((g - DEC.result) / 10);
  const press = clamp(1 - Math.abs(g - DEC.click) / 5);
  const ptr = keysV(g, [
    [DEC.result + 4, { x: 900, y: 1300 }],
    [DEC.click - 4, { x: 560, y: 880 }],
  ]);
  return (
    <>
      <Shot f={f} from={0} to={f02.from - 6} cam={camMove(f, 0, f02.from - 6, { x: 1000, y: 1010, zoom: 1.5 }, { x: 960, y: 1000, zoom: 1.6 })}>
        {world}
      </Shot>
      <Shot f={f} from={f02.from - 6} to={S} cam={camMove(f, f02.from - 6, S, { x: 880, y: 980, zoom: 1.35 }, { x: 930, y: 1010, zoom: 1.5 })}>
        {world}
      </Shot>
      {f >= S ? (
        <ScreenCam cx={540} cy={page ? 900 : lerp(920, 900, easeInOut(g / 40))} z={page ? 1.02 : 1.06}>
          <EditorWindow tabs={tabs} active={page ? 2 : 1} tabIn={tabIn}>
            {!page ? (
              <>
                <PlanView hideSchool gap={easeInOut((g - DEC.toTab + 6) / 14)} />
                {toTab < 1 ? (
                  <PlanRow i={2} sel={sel} lift={liftK} dx={tabTarget.x * toTab} dy={tabTarget.y * toTab} scale={lerp(1 + 0.04 * liftK, 0.25, toTab)} o={1 - clamp((toTab - 0.7) / 0.3)} />
                ) : null}
              </>
            ) : (
              <>
                <div style={{ position: "absolute", left: 100, top: 420, fontFamily: "Nunito", fontSize: 50, fontWeight: 900, color: "#1F2D55" }}>{BG10_TEXT.plan.newTab}</div>
                <SearchBox typed={typed} f={f} />
                <ResultCard k={resK} press={press} />
                {resK > 0 ? <Pointer x={ptr.x} y={ptr.y} press={press} /> : null}
              </>
            )}
          </EditorWindow>
          {/* стикер влетает с нижнего края и ложится на строку «Мектеп» */}
          {flyK < 1 || sel < 1 ? (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - sel }}>
              <StickyNote x={lerp(560, 260, flyK)} y={lerp(1700, rowY, flyK)} rot={lerp(-12, 0, flyK)} scale={lerp(1.8, 0.8, flyK)} lift={1 - flyK} />
            </div>
          ) : null}
        </ScreenCam>
      ) : null}
    </>
  );
};

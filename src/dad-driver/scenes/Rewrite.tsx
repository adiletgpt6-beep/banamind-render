// Сцена 12. Новая строка (VO15 сын, VO16 рассказчик).
// План А — дома днём: сын кладёт на стол ту же анкету, поворачивается к
// маме и просит помочь написать «инженер»; мама улыбается, наклоняется и
// показывает на свободную строку.
// План Б — стол сверху: палец мамы на строке под «айдоочу», сын сам пишет
// «инженер»; жёлтое выделение «айдоочу» мягко уступает бирюзовому акценту
// «инженер» (без зачёркивания). На «дагы бир сүйлөм» карандаш переходит
// к строкам «Кошумча» и начинает предложение (продолжение — в сцене 13).
import { AbsoluteFill } from "remotion";
import { localCue, useCue, useSceneFrame, wordAt } from "../context";
import { appear, C, Headline, TopScrim, Vignette } from "../kit";
import { Form, FORM, FORM_LINES, formTip, FormOnTable } from "../props/Form";
import { DeskThings, KidWritingHand, MomPointHand } from "../props/Hands";
import { Actor } from "../rig/Actor";
import { easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { Desk } from "../sets/Desk";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import { restOnTable, seated, seatOf } from "./common";
import type { DdTimeline } from "../timing";

// Лист на столе сверху — те же координаты, что в сцене 1 (крючок).
export const SHEET = { x: 160, y: 470, w: 760 } as const;
export const SK = SHEET.w / FORM.w;
// Мировая точка строки листа (в координатах стола сверху).
export const rowY = (id: keyof typeof FORM_LINES) => SHEET.y + FORM_LINES[id].y * SK;

const beatsOf = (vo15: ReturnType<typeof useCue>, vo16: ReturnType<typeof useCue>) => {
  const cutB = Math.round(vo15.to + 4);
  return {
    lay: 18, // лист ложится на стол
    turn: vo15.from - 8, // сын поворачивается к маме
    momPoint: wordAt(vo15, 5) - 4, // «жардам» — мама показывает
    cutB,
    momIn: cutB,
    momOut: cutB + 26, // уходит, когда сын начинает писать
    writeWord: cutB + 22,
    writeWordEnd: cutB + 62,
    toLine: wordAt(vo16, 1), // «кайра» — карандаш к строкам «Кошумча»
    writeLine: wordAt(vo16, 3) - 4, // «дагы бир сүйлөм»
  };
};

// Моменты для звука (кадры сцены).
export const rewriteBeats = (tl: DdTimeline) => {
  const sc = tl.scenes.find((s) => s.id === "rewrite")!;
  const b = beatsOf(localCue(tl, sc.from, "vo15"), localCue(tl, sc.from, "vo16"));
  return { sheet: b.lay - 4, writeWord: b.writeWord, writeLine: b.writeLine };
};

export const RewriteScene: React.FC = () => {
  const t = useSceneFrame();
  const vo15 = useCue("vo15");
  const vo16 = useCue("vo16");
  const b = beatsOf(vo15, vo16);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wood }}>
      {t < b.cutB ? <ShotTable t={t} b={b} /> : <ShotSheet t={t} b={b} />}
      <TopScrim o={appear(t, b.writeWordEnd - 8, 10)} h={350} strong />
      <Headline t={t} at={b.writeWordEnd - 2} lines={[[{ text: DD_TEXT.rewrite.headline, hl: "teal" }]]} y={150} size={92} />
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof beatsOf>;

// План А: сын и мама за столом.
const ShotTable: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const son = seated("son", HOME.seat.son);
  const mom = seated("mom", HOME.seat.mom);
  const sheetAt = { x: HOME.seat.son + 30, y: HOME.table.top - 34 };
  const laid = t >= b.lay;
  const sonPose = (f: number) => ({
    expr: f < b.turn ? EXPR.calm : EXPR.softSmile,
    sit: 1,
    seat: seatOf(son),
    lean: keys(f, [[0, 6], [b.lay, 10], [b.lay + 16, 4]]),
    lookY: keys(f, [[0, 0.5], [b.turn, 0.5], [b.turn + 8, 0.05]]),
    armR: {
      // лист из руки — на стол
      target: keysV(f, [[-20, { x: son.x + 90, y: 1150 }], [0, { x: son.x + 90, y: 1150 }], [b.lay, { x: sheetAt.x + 50, y: sheetAt.y + 6 }], [b.lay + 16, { x: son.x + 0.11 * son.h, y: HOME.table.top + 14 }]]),
      shape: f < b.lay ? ("pinch" as const) : ("relax" as const),
      item: f < b.lay ? ("card" as const) : ("none" as const),
      itemTilt: -10,
      elbow: f < b.lay + 10 ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    armL: restOnTable(son, -1),
  });
  const sonFace = (f: number) => keys(f, [[0, 0.15], [b.turn, 0.15], [b.turn + 10, -0.55]]);
  const momPose = (f: number) => ({
    expr: f < b.turn + 10 ? EXPR.calm : EXPR.smile,
    sit: 1,
    seat: seatOf(mom),
    lean: keys(f, [[b.turn + 6, 0], [b.momPoint, 9]]),
    lookY: keys(f, [[b.turn, 0.2], [b.turn + 10, 0], [b.momPoint - 4, 0], [b.momPoint + 6, 0.55]]),
    armR: {
      target: keysV(f, [[0, { x: mom.x + 0.11 * mom.h, y: HOME.table.top + 14 }], [b.momPoint, { x: mom.x + 0.11 * mom.h, y: HOME.table.top + 14 }], [b.momPoint + 12, { x: sheetAt.x - 30, y: sheetAt.y + 4 }]]),
      shape: f > b.momPoint + 4 ? ("point" as const) : ("relax" as const),
      elbow: f > b.momPoint ? ("down" as const) : ("hang" as const),
      behind: false,
    },
    armL: restOnTable(mom, -1),
    nod: keys(f, [[b.cutB - 12, 0], [b.cutB - 6, 4], [b.cutB + 2, 0]]),
  });
  const momFace = (f: number) => keys(f, [[0, 0.45], [b.momPoint, 0.45], [b.momPoint + 10, 0.3]]);
  const cam = { x: 600, y: 1075, zoom: lerp(2.0, 2.06, easeInOut(t / Math.max(1, b.cutB))) };
  return (
    <Shot f={t} from={-30} to={b.cutB} cam={cam} bg={C.wall}>
      <HomeRoom t={t} />
      <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
      <Actor uid="rw-son" look="son" f={t} place={() => son} face={sonFace} pose={sonPose} role="son" seed={21} layer="body" />
      <Actor uid="rw-mom" look="mom" f={t} place={() => mom} face={momFace} pose={momPose} seed={22} layer="body" />
      <HomeTable />
      {laid ? <FormOnTable x={sheetAt.x} y={sheetAt.y} w={180} s={{ dad: 1, dadHl: 1, momPoint: easeOut((t - b.momPoint - 8) / 8) }} /> : null}
      <Actor uid="rw-son" look="son" f={t} place={() => son} face={sonFace} pose={sonPose} role="son" seed={21} layer="arms" />
      <Actor uid="rw-mom" look="mom" f={t} place={() => mom} face={momFace} pose={momPose} seed={22} layer="arms" />
    </Shot>
  );
};

// План Б: стол сверху, запись «инженер» и начало предложения.
const ShotSheet: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const word = Math.min(1, Math.max(0, (t - b.writeWord) / (b.writeWordEnd - b.writeWord)));
  const line = Math.max(0, (t - b.writeLine) / 80) * 0.95;
  // кончик карандаша: перед словом — у начала строки, после — переход к «Кошумча»
  const tipWord = formTip("dadNew", word);
  const tipLine = formTip("s1", Math.min(1, line));
  const toLine = easeInOut((t - b.toLine) / Math.max(8, b.writeLine - b.toLine));
  const lift = Math.max(easeInOut((t - b.writeWordEnd) / 6) * (1 - toLine * 0.99), t < b.writeWord ? 1 - easeInOut((t - (b.writeWord - 8)) / 8) : 0) * (t > b.writeLine ? 0 : 1);
  const tip = { x: lerp(tipWord.x, tipLine.x, toLine), y: lerp(tipWord.y, tipLine.y, toLine) };
  // рука ребёнка приходит справа-снизу к началу строки
  const handIn = easeOut((t - (b.cutB + 6)) / 16);
  const tipX = SHEET.x + tip.x * SK + (1 - handIn) * 320;
  const tipY = SHEET.y + tip.y * SK + (1 - handIn) * 360;
  // палец мамы (она сидит слева): на начало свободной строки, затем рука уходит
  const momIn = easeOut((t - b.momIn) / 12) * (1 - easeInOut((t - b.momOut) / 14));
  const momTipX = SHEET.x + (FORM_LINES.dadNew.x - 30) * SK;
  const momTipY = rowY("dadNew") - 18;
  const camY = lerp(rowY("dadNew") + 120, rowY("s1") + 40, easeInOut((t - b.toLine) / 30));
  const cam = { x: 540, y: camY, zoom: 1.25 };
  return (
    <Shot f={t} from={b.cutB} to={99999} cam={cam} bg={C.wood}>
      <Desk />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <DeskThings />
      </svg>
      <div style={{ position: "absolute", left: SHEET.x, top: SHEET.y }}>
        <Form
          width={SHEET.w}
          s={{
            dad: 1,
            dadHl: 1,
            fade: easeInOut((t - b.writeWordEnd) / 18),
            momPoint: momIn,
            dadNew: word,
            dadNewHl: easeInOut((t - b.writeWordEnd - 2) / 12),
            s1: Math.min(1, line),
          }}
        />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {momIn > 0 ? <MomPointHand x={lerp(momTipX - 380, momTipX, momIn)} y={lerp(momTipY + 300, momTipY, momIn)} angle={52} s={1.0} /> : null}
        <KidWritingHand x={tipX} y={tipY} lift={lift} s={0.95} />
      </svg>
      <Vignette strength={0.26} />
    </Shot>
  );
};

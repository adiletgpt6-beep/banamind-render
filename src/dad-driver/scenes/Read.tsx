// Сцена 13. Главный эмоциональный финал (VO17 сын, VO18 рассказчик).
// План А — лист сверху: карандаш ставит последнюю точку, рука уходит; сын
// читает вслух первую строку — мягкий маркер идёт по словам.
// План Б — за столом: сын читает вторую фразу, папа стоит за его плечом,
// наклонился и читает; на «жылмайды» папа улыбается, сын поднимает на него
// взгляд, тёплый ответный взгляд; мама рядом. Камера немного отъезжает —
// семья вместе. Рекламы здесь нет.
import { AbsoluteFill } from "remotion";
import { localCue, useCue, useSceneFrame, wordAt, wordEnd } from "../context";
import { C, Vignette } from "../kit";
import { Form, FORM_LINES, formTip, FormOnTable } from "../props/Form";
import { DeskThings, KidWritingHand } from "../props/Hands";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { Desk } from "../sets/Desk";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import type { DdTimeline } from "../timing";
import { H, restOnTable, seated, seatOf } from "./common";
import { rowY, SHEET, SK } from "./Rewrite";

const beatsOf = (a: ReturnType<typeof useCue>, b: ReturnType<typeof useCue>, n: ReturnType<typeof useCue>) => ({
  done: 20, // последняя точка поставлена
  cutB: Math.round((a.to + b.from) / 2) + 2,
  smile: wordAt(n, 2) - 6, // «жылмайды»
  glance: wordAt(n, 1), // сын поднимает взгляд
  pull: n.to + 4,
});

export const readBeats = (tl: DdTimeline) => {
  const sc = tl.scenes.find((s) => s.id === "read")!;
  return { writeEnd: 0, cutB: beatsOf(localCue(tl, sc.from, "vo17a"), localCue(tl, sc.from, "vo17b"), localCue(tl, sc.from, "vo18")).cutB };
};

export const ReadScene: React.FC = () => {
  const t = useSceneFrame();
  const a = useCue("vo17a");
  const bq = useCue("vo17b");
  const n = useCue("vo18");
  const b = beatsOf(a, bq, n);
  return <AbsoluteFill style={{ backgroundColor: C.wood }}>{t < b.cutB ? <ShotSheet t={t} b={b} a={a} /> : <ShotFamily t={t} b={b} />}</AbsoluteFill>;
};

type Beats = ReturnType<typeof beatsOf>;

// Мягкий маркер «читаемых» слов строки (доля строки по словам речи).
const readFrac = (cue: ReturnType<typeof useCue>, t: number, w0: number, w1: number) => {
  if (t < wordAt(cue, w0)) return 0;
  for (let i = w0; i <= w1; i++) {
    const s = wordAt(cue, i);
    const e = wordEnd(cue, i);
    if (t < e) return (i - w0 + clamp((t - s) / Math.max(1, e - s))) / (w1 - w0 + 1);
  }
  return 1;
};

const ShotSheet: React.FC<{ t: number; b: Beats; a: ReturnType<typeof useCue> }> = ({ t, b, a }) => {
  // последняя строка дописывается, рука поднимает карандаш и уходит
  const s3 = keys(t, [[-10, 0.72], [b.done, 1]], (x) => x);
  const tip = formTip("s3", s3);
  const away = easeInOut((t - (b.done + 8)) / 22);
  const tipX = SHEET.x + tip.x * SK + away * 380;
  const tipY = SHEET.y + tip.y * SK + away * 420;
  const lift = easeInOut((t - b.done) / 8);
  const read = readFrac(a, t, 0, 3);
  const l = FORM_LINES.s1;
  const w = l.text.length * l.size * 0.53;
  const cam = { x: 540, y: lerp(rowY("s2") + 10, rowY("s1") + 60, easeInOut((t - 10) / 40)), zoom: lerp(1.3, 1.36, easeInOut(t / b.cutB)) };
  return (
    <Shot f={t} from={-20} to={b.cutB} cam={cam} bg={C.wood}>
      <Desk />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <DeskThings />
      </svg>
      <div style={{ position: "absolute", left: SHEET.x, top: SHEET.y }}>
        <Form width={SHEET.w} s={{ dad: 1, dadHl: 1, fade: 1, dadNew: 1, dadNewHl: 1, s1: 1, s2: 1, s3 }} />
      </div>
      {/* мягкий маркер под читаемыми словами */}
      <div
        style={{
          position: "absolute",
          left: SHEET.x + (l.x - 10) * SK,
          top: rowY("s1") + 4,
          width: (w + 20) * SK * read,
          height: 10,
          borderRadius: 5,
          background: C.yellow,
          opacity: 0.85,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {away < 1 ? <KidWritingHand x={tipX} y={tipY} lift={lift} s={0.95} /> : null}
      </svg>
      <Vignette strength={0.26} />
    </Shot>
  );
};

const ShotFamily: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const son = seated("son", HOME.seat.son);
  const mom = seated("mom", HOME.seat.mom);
  // папа стоит за правым плечом сына, присел и наклонился к листу
  const dad = { x: HOME.seat.son + 182, y: HOME.seatY - 24, h: H.dad * 0.98 };
  const sheetAt = { x: HOME.seat.son + 6, y: HOME.table.top + 2 };
  const g = (f: number) => easeInOut((f - b.glance) / 10);
  const sm = (f: number) => easeInOut((f - b.smile) / 16);
  const sonPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.smile, easeInOut((f - b.smile - 4) / 16)),
    sit: 1,
    seat: seatOf(son),
    lean: lerp(9, 3, g(f)),
    nod: lerp(7, 0, g(f)),
    lookY: lerp(0.8, -0.8, g(f)),
    lookX: lerp(0, 0.55, g(f)),
    headTilt: lerp(0, 5, g(f)),
    // ладони у нижних углов листа
    armL: { target: { x: sheetAt.x - 56, y: HOME.table.top + 30 }, shape: "relax" as const, elbow: "hang" as const, behind: false },
    armR: { target: { x: sheetAt.x + 56, y: HOME.table.top + 30 }, shape: "relax" as const, elbow: "hang" as const, behind: false },
  });
  const sonFace = (f: number) => keys(f, [[b.glance - 4, 0.05], [b.glance + 8, 0.45]]);
  const dadPose = (f: number) => ({
    expr: mixExpr(EXPR.calm, EXPR.smile, sm(f)),
    crouch: 0.3,
    lean: lerp(22, 17, g(f)),
    nod: lerp(9, 5, g(f)),
    lookY: lerp(0.85, 0.6, g(f)),
    lookX: lerp(-0.2, -0.35, g(f)),
    headTilt: lerp(-4, -8, sm(f)),
    // опирается ладонями о стол рядом с листом — рука не проходит перед сыном
    armL: { target: { x: sheetAt.x + 128, y: HOME.table.top + 18 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: dad.x + 96, y: HOME.table.top + 22 }, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const momPose = (f: number) => ({
    expr: mixExpr(EXPR.softSmile, EXPR.smile, easeInOut((f - b.smile) / 20)),
    sit: 1,
    seat: seatOf(mom),
    lookY: 0.2,
    armL: restOnTable(mom, -1),
    armR: restOnTable(mom, 1),
  });
  const pull = easeInOut((t - b.pull) / 50);
  const cam = { x: lerp(800, 680, pull), y: lerp(1090, 1095, pull), zoom: lerp(2.0, 1.6, pull) };
  return (
    <Shot f={t} from={b.cutB} to={99999} cam={cam} bg={C.wall}>
      <HomeRoom t={t} />
      <ChairBacks xs={[HOME.seat.mom, HOME.seat.son, HOME.seat.dad]} />
      <Actor uid="rd-dad" look="dad" f={t} place={() => dad} face={() => -0.45} pose={dadPose} seed={31} layer="body" />
      <Actor uid="rd-mom" look="mom" f={t} place={() => mom} face={() => 0.45} pose={momPose} seed={32} layer="body" />
      <Actor uid="rd-son" look="son" f={t} place={() => son} face={sonFace} pose={sonPose} role="son" seed={33} layer="body" />
      <HomeTable />
      <FormOnTable x={sheetAt.x} y={sheetAt.y} w={200} s={{ dad: 1, dadHl: 1, fade: 1, dadNew: 1, dadNewHl: 1, s1: 1, s2: 1, s3: 1 }} />
      <Actor uid="rd-mom" look="mom" f={t} place={() => mom} face={() => 0.45} pose={momPose} seed={32} layer="arms" />
      <Actor uid="rd-son" look="son" f={t} place={() => son} face={sonFace} pose={sonPose} role="son" seed={33} layer="arms" />
      <Actor uid="rd-dad" look="dad" f={t} place={() => dad} face={() => -0.45} pose={dadPose} seed={31} layer="arms" />
    </Shot>
  );
};

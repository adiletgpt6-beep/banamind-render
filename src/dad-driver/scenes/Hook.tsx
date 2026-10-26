// Сцена 1. Анкета и крючок (VO01).
// План А — стол сверху: карандаш дописывает «айдоочу», крупно появляется
// «АТАМ — АЙДООЧУ»; на слове «айдоочу» строка подсвечивается жёлтым. На
// «деп жазды» рука папы берёт лист и поднимает его к себе.
// План Б — крупно лицо папы с листом: перевод фокуса с листа на лицо,
// короткая поднятая бровь, интерес, затем улыбка; рядом — «10 ЖЫЛ» и
// «ИНЖЕНЕР» как причина удивления (не оценка профессии).
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame, wordAt } from "../context";
import { C, Chip, Headline, Vignette, pushIn } from "../kit";
import { Form, FORM, formTip } from "../props/Form";
import { DadGripHand, DeskThings, KidWritingHand } from "../props/Hands";
import { Actor } from "../rig/Actor";
import { easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { Desk } from "../sets/Desk";
import { HomeRoom } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";

const T = DD_TEXT.hook;
const SHEET = { x: 160, y: 470, w: 760 } as const;
const K = SHEET.w / FORM.w;

// Моменты сцены (кадры) по словам VO01.
export const useHookBeats = () => {
  const cue = useCue("vo01");
  const w = (i: number) => wordAt(cue, i);
  return {
    cue,
    head: 8,
    ajdoochu: w(3),
    dep: w(4),
    grip: w(5) + 2,
    cutB: w(6) - 3, // «Атасы…» — уже лицо папы
    on: w(8),
    engineer: w(11),
    end: cue.to,
  };
};

export const HookScene: React.FC = () => {
  const t = useSceneFrame();
  const b = useHookBeats();
  return (
    <AbsoluteFill style={{ backgroundColor: C.wood }}>
      {t < b.cutB ? <ShotDesk t={t} b={b} /> : <ShotFace t={t} b={b} />}
      <Headline t={t} at={b.head} hlAt={b.ajdoochu - 4} lines={[[{ text: T.a }, { text: T.b, hl: "yellow" }]]} tone={t < b.cutB ? "onDark" : "onDark"} y={160} size={96} />
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof useHookBeats>;

// План А: стол сверху.
const ShotDesk: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  // карандаш дописывает последние буквы «айдоочу»
  const write = keys(t, [[-6, 0.42], [26, 1]], (x) => x);
  const lift = easeInOut((t - 26) / 10);
  const away = easeInOut((t - (b.grip - 14)) / 22);
  const tip = formTip("dad", write);
  const tipX = SHEET.x + tip.x * K + away * 260;
  const tipY = SHEET.y + tip.y * K + away * 240;
  // рука папы: приходит сверху справа, берёт лист за угол, поднимает
  const handIn = easeOut((t - (b.dep - 8)) / 14);
  const raise = easeInOut((t - b.grip) / Math.max(6, b.cutB - b.grip));
  const cornerX = SHEET.x + SHEET.w - 40;
  const cornerY = SHEET.y + 60;
  const hx = lerp(cornerX + 420, cornerX, handIn);
  const hy = lerp(cornerY - 520, cornerY, handIn);
  // лист поворачивается вокруг захваченного угла и уходит вверх к папе
  const sheetRot = 7 * raise;
  const sheetDx = 120 * raise;
  const sheetDy = -820 * raise * raise;
  const sheetScale = 1 + 0.12 * raise;
  const zoom = pushIn(t, 0, b.cutB, 1, 1.05);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 1000px" }}>
      <Desk />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <DeskThings />
      </svg>
      <div
        style={{
          position: "absolute",
          left: SHEET.x,
          top: SHEET.y,
          transformOrigin: `${cornerX - SHEET.x}px ${cornerY - SHEET.y}px`,
          transform: `translate(${sheetDx}px, ${sheetDy}px) rotate(${sheetRot}deg) scale(${sheetScale})`,
        }}
      >
        <Form width={SHEET.w} s={{ dad: write, dadHl: easeInOut((t - b.ajdoochu) / 10) }} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {away < 1 ? <KidWritingHand x={tipX} y={tipY} lift={Math.max(lift, away)} s={0.95} /> : null}
        {handIn > 0 ? (
          <g transform={`translate(${sheetDx} ${sheetDy})`}>
            <DadGripHand x={hx} y={hy} angle={38} s={1.1} />
          </g>
        ) : null}
      </svg>
      <Vignette strength={0.28} />
    </AbsoluteFill>
  );
};

// План Б: лицо папы с листом.
const ShotFace: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const u = t - b.cutB;
  // перевод фокуса: лист резкий → лицо резкое
  const focus = easeInOut((u - 4) / 12);
  const P = { x: 820, y: 1560, h: 790 };
  const brow = easeOut((t - (b.cutB + 6)) / 8) * (1 - easeInOut((t - (b.engineer + 10)) / 18));
  const smile = easeInOut((t - (b.engineer - 4)) / 22);
  const expr = mixExpr(mixExpr(EXPR.calm, { browIn: 4, browOut: 7, lid: 0.02, smile: 0.12 }, brow), EXPR.smile, smile * 0.85);
  const look = easeInOut((t - (b.engineer + 2)) / 14);
  const zoom = pushIn(t, b.cutB, b.end + 20, 3.0, 3.12);
  const cam = { x: 800, y: 930, zoom };
  // лист в руках: лёгкое покачивание
  const sway = Math.sin(u / 14) * 0.8;
  return (
    <AbsoluteFill>
      <Shot f={t} from={b.cutB} to={99999} cam={cam} bg={C.wall}>
        <div style={{ position: "absolute", left: 0, top: 0, filter: `blur(${6 - 2 * focus}px)` }}>
          <HomeRoom t={t} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, filter: `blur(${(1 - focus) * 4}px)` }}>
          <DadReading t={t} layer="body" P={P} expr={expr} look={look} smile={smile} sway={sway} b={b} />
        </div>
        {/* оборот листа в руках: сквозь бумагу едва видна запись */}
        <div
          style={{
            position: "absolute",
            left: 744,
            top: 1004,
            width: 150,
            height: 206,
            borderRadius: 5,
            background: "linear-gradient(170deg, #FFFFFF, #ECE6DA)",
            boxShadow: "0 5px 12px rgba(40,30,20,0.2)",
            transform: `rotate(${-5 + sway}deg)`,
            filter: `blur(${focus * 1.2}px)`,
            overflow: "hidden",
          }}
        >
          {[40, 70, 100, 130, 160].map((y) => (
            <div key={y} style={{ position: "absolute", right: 14, top: y, width: 70 + (y % 3) * 12, height: 4, borderRadius: 2, background: "rgba(80,90,110,0.12)" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, filter: `blur(${(1 - focus) * 4}px)` }}>
          <DadReading t={t} layer="arms" P={P} expr={expr} look={look} smile={smile} sway={sway} b={b} />
        </div>
      </Shot>
      {/* причина удивления: 10 лет инженером — над головой, не на лице */}
      <Chip x={330} y={440} t={t} at={b.on} accent={C.yellow} size={56}>
        <span style={{ color: C.yellow }}>{T.years}</span>
      </Chip>
      <Chip x={720} y={440} t={t} at={b.engineer - 2} accent={C.cyan} size={56}>
        <Gear />
        <span style={{ color: C.cyan }}>{T.engineer}</span>
      </Chip>
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};

const Gear: React.FC = () => (
  <svg width={46} height={46} viewBox="-24 -24 48 48">
    <g fill={C.cyan}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-4} y={-22} width={8} height={10} rx={2} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={14} />
    </g>
    <circle r={6} fill={C.navy} />
  </svg>
);

// Папа читает лист (слои: корпус — до листа, руки — поверх листа).
const DadReading: React.FC<{
  t: number;
  layer: "body" | "arms";
  P: { x: number; y: number; h: number };
  expr: ReturnType<typeof mixExpr>;
  look: number;
  smile: number;
  sway: number;
  b: Beats;
}> = ({ t, layer, P, expr, look, smile, sway, b }) => (
  <Actor
    uid={`hook-dad-${layer}`}
    look="dad"
    f={t}
    place={() => P}
    face={() => lerp(-0.28, -0.12, look)}
    seed={11}
    layer={layer}
    blinks={[b.cutB + 30]}
    pose={() => ({
      expr,
      lookY: lerp(0.55, 0.05, look),
      lookX: lerp(-0.2, 0.15, look),
      nod: lerp(4, 0, look),
      headTilt: lerp(-2, 1.5, smile),
      armL: { target: { x: 752, y: 1050 + sway }, shape: "pinch", elbow: "down" },
      armR: { target: { x: 884, y: 1040 - sway }, shape: "pinch", elbow: "down" },
    })}
  />
);

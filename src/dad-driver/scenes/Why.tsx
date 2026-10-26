// Сцена 4. «Эмне үчүн айдоочу» (VO04a–d) — сын перечисляет, когда он
// видит папу за рулём, и загибает пальцы на левой руке: по пальцу на
// каждую фразу; указательный палец правой руки прижимает загибаемый.
// Кадр разделён: сверху — тёмная доска-воспоминание (изометрический
// городок: дом, школа, офис; графитовая машина папы едет по маршруту,
// светится линия пути), снизу — сын за домашним столом, дневной свет.
import { AbsoluteFill } from "remotion";
import { useCue, useSceneFrame, useSceneLength, wordFrame } from "../context";
import { Board, C, Vignette, appear, pushIn } from "../kit";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { Form } from "../props/Form";
import { ChairBacks, HOME, HomeRoom, HomeTable, seatH } from "../sets/Home";
import { Shot } from "../shots";
import { H } from "./common";
import { countTip, countWrist, pointAt, type SitRig } from "./WhyArms";
import { WhyCity } from "./WhyCity";

// Моменты сцены (кадры) по словам VO04a–d.
export const useWhyBeats = () => {
  const a = useCue("vo04a");
  const b = useCue("vo04b");
  const c = useCue("vo04c");
  const d = useCue("vo04d");
  const end = useSceneLength();
  return {
    a: { from: a.from, meni: wordFrame(a, "мени"), mek: wordFrame(a, "мектеп"), jet: wordFrame(a, "жетк"), to: a.to },
    b: { from: b.from, jum: wordFrame(b, "жумуш"), ket: wordFrame(b, "кет"), to: b.to },
    c: {
      from: c.from,
      but: wordFrame(c, "бүт"),
      kayra: wordFrame(c, "кайра"),
      kel: wordFrame(c, "кел"),
      meni: wordFrame(c, "мени"),
      alyp: wordFrame(c, "алып"),
      ket: wordFrame(c, "кет"),
      to: c.to,
    },
    d: {
      from: d.from,
      mash: wordFrame(d, "машин"),
      ond: wordFrame(d, "оңдоо"),
      bol: wordFrame(d, "болгон"),
      any: wordFrame(d, "аны"),
      jet: wordFrame(d, "жетк"),
      to: d.to,
    },
    end,
  };
};

export type WhyBeats = ReturnType<typeof useWhyBeats>;

// Доска-воспоминание (координаты кадра).
export const WHY_BOARD = { x: 40, y: 150, w: 1000, h: 890 } as const;

export const WhyScene: React.FC = () => {
  const t = useSceneFrame();
  const b = useWhyBeats();
  // доска «разворачивается» из головы сына, как мысль
  const u = appear(t, 0, 16);
  const s = lerp(0.92, 1, easeInOut((t - 0) / 16));
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <SonShot t={t} b={b} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: u,
          transform: `scale(${s})`,
          transformOrigin: "500px 1120px",
        }}
      >
        <Board x={WHY_BOARD.x} y={WHY_BOARD.y} w={WHY_BOARD.w} h={WHY_BOARD.h} t={t}>
          <WhyCity t={t} b={b} />
        </Board>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Сын за столом ----------
const SON_SEAT = seatH(H.son); // подушка на стуле — как во всех домашних сценах
const SON_P = { x: 720, y: HOME.seatY, h: H.son } as const;
const KS = SON_P.h / 1000;
// точка в единицах рисунка сына → мир
const loc = (x: number, y: number) => ({ x: SON_P.x + x * KS, y: SON_P.y + y * KS });

// Начала четырёх фраз — на каждую загибается палец.
const startsOf = (b: WhyBeats) => [b.a.from, b.b.from, b.c.from, b.d.from] as const;

// Куда повёрнут сын: к папе (справа, за кадром); в начале «Сабак
// бүткөндө» — чуть к себе (вспоминает), к концу — снова к папе.
const sonFace = (b: WhyBeats) => (f: number) =>
  keys(f, [
    [-12, 0.3],
    [b.c.from - 4, 0.3],
    [b.c.from + 6, 0.14],
    [b.c.kel - 2, 0.14],
    [b.c.kel + 8, 0.32],
  ]);

// Сколько пальцев загнуто (по 8 кадров на палец, от начала фразы).
const foldAt = (t: number, b: WhyBeats) => {
  const S = startsOf(b);
  return keys(t, [
    [S[0], 0],
    [S[0] + 8, 1],
    [S[1], 1],
    [S[1] + 8, 2],
    [S[2], 2],
    [S[2] + 8, 3],
    [S[3], 3],
    [S[3] + 8, 4],
  ]);
};

// Жесты сына: левая рука (справа в кадре) поднята и считает, указательный
// палец правой руки подходит к пальцу, прижимает его на загибе и отходит.
const sonGesture = (t: number, b: WhyBeats, rig: SitRig) => {
  const S = startsOf(b);
  // подъём рук перед ответом
  const up = easeInOut((t + 8) / 16);
  // номер текущего пункта: окно начинается за 14 кадров до фразы
  let n = 0;
  for (let i = 0; i < 4; i++) if (t >= S[i] - 14) n = i;
  const s = S[n];
  // касание: подход, загиб, удержание, отход
  const touch = keys(t, [
    [s - 13, 0],
    [s - 2, 1],
    [s + 14, 1],
    [s + 26, 0],
  ]);
  // рука-«счёт» приподнимается к каждому пункту и чуть опускается в паузе
  const lift = keys(t, [
    [s - 10, 0],
    [s, 1],
    [s + 22, 0],
  ]);
  const fold = foldAt(t, b);
  const rest = { c: loc(118, -742), p: loc(-112, -742) };
  const raised = loc(170 - 4 * lift, -846 - 12 * lift);
  const Wc = { x: lerp(rest.c.x, raised.x, up), y: lerp(rest.c.y, raised.y, up) };
  const cw = countWrist(rig, t, 1, Wc, "down", lerp(-4, -12, up));
  const tip = countTip(rig, 1, Wc, cw.angle, fold, n);
  // ожидание рядом: ниже и левее пальца, у ладони
  const hover = { x: tip.x - 7, y: tip.y + 17 };
  const F = { x: lerp(hover.x, tip.x - 0.6, touch), y: lerp(hover.y, tip.y + 0.6, touch) };
  const pt = pointAt(rig, t, -1, F, "down", -122);
  const ptRest = { x: lerp(rest.p.x, pt.target.x, up), y: lerp(rest.p.y, pt.target.y, up) };
  return {
    fold,
    touch: touch * up,
    armR: { target: Wc, shape: (up > 0.4 ? "count" : "relax") as "count" | "relax", fold, elbow: "down" as const, wrist: lerp(0, cw.wrist, up) },
    armL: { target: ptRest, shape: (up > 0.4 ? "point" : "relax") as "point" | "relax", elbow: "down" as const, wrist: lerp(0, pt.wrist, up) },
  };
};

const SonShot: React.FC<{ t: number; b: WhyBeats }> = ({ t, b }) => {
  const rig: SitRig = { look: "son", P: SON_P, seat: SON_SEAT, seed: 41, face: sonFace(b) };
  const cam = { x: 737, y: 952, zoom: pushIn(t, -10, b.end, 2.3, 2.4) };
  const S = startsOf(b);
  const pose = (f: number) => {
    const g = sonGesture(f, b, rig);
    // взгляд: на папу, на пальцы при загибе, вверх-в сторону — вспоминает
    const remember = keys(f, [
      [b.c.from - 6, 0],
      [b.c.from + 2, 1],
      [b.c.kel - 6, 1],
      [b.c.kel + 4, 0],
    ]);
    const atHand = g.touch * (1 - remember);
    const smile = keys(f, [
      [b.d.from, 0],
      [b.d.any - 6, 0.35],
      [b.d.to + 4, 0.8],
    ]);
    const nod = S.reduce((acc, s) => acc + 3.5 * Math.max(0, Math.sin(clamp((f - s + 2) / 12) * Math.PI)), 0);
    const base = mixExpr(EXPR.calm, EXPR.softSmile, 0.35);
    return {
      sit: 1,
      seat: SON_SEAT,
      expr: mixExpr(mixExpr(base, EXPR.thinking, remember * 0.7), EXPR.smile, smile),
      lookX: lerp(0.3, 0.25, atHand) - 0.5 * remember,
      lookY: lerp(-0.1, 0.45, atHand) - 0.45 * remember,
      nod: nod + 3 * atHand,
      headTilt: 2.5 * atHand - 2 * remember,
      armR: g.armR,
      armL: g.armL,
    };
  };
  return (
    <Shot f={t} from={-30} to={99999} cam={cam} bg={C.wall}>
      <div style={{ position: "absolute", left: 0, top: 0, filter: "blur(4px)" }}>
        <HomeRoom t={t} />
        <ChairBacks xs={[HOME.seat.son]} />
      </div>
      <Actor uid="why-son-body" look="son" f={t} place={() => SON_P} face={rig.face} seed={rig.seed} role="son" layer="body" pose={pose} />
      <HomeTable />
      <TableForm />
      <Actor uid="why-son-arms" look="son" f={t} place={() => SON_P} face={rig.face} seed={rig.seed} role="son" layer="arms" pose={pose} />
      <Vignette strength={0.2} />
    </Shot>
  );
};

// Анкета лежит на столе перед сыном (в перспективе столешницы).
const TableForm: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 548,
      top: 1196,
      transformOrigin: "50% 50%",
      transform: "perspective(420px) rotateX(58deg) rotateZ(-9deg)",
      filter: "blur(0.6px)",
    }}
  >
    <Form width={150} s={{ dad: 1 }} />
  </div>
);

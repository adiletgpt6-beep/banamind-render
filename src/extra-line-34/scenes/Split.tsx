// Сцена 10 «split» (F01). После встречи родители вдвоём: мама у ноутбука,
// папа стоит у стола. «Балдар бул эже менен бат тил табышты.» — смотрит на
// маму; она коротко оглядывается на книгу, оставленную на диване (её взгляд —
// вставка). «Эми мектептен үйгө кантип жеткирүүнү өзүнчө чечели.» —
// показывает на пункт о дороге на экране. Камера входит в
// экран: объявление крупно, пункт о вождении подсвечен; карточка делится на
// две — «Балдарга кам көрүү» и «Мектептен үйгө жеткирүү». Мама кивает.
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { box, camMove, Shot, Svg, type Cam, useScene } from "../kit";
import { BookCover } from "../props/Book";
import { lerpQuad, laptopScreenQuad, LAPTOP_DESIGN, type Quad } from "../props/Laptop";
import { AdCard, adLayout } from "../ui/AdCard";
import { SplitCards, splitLayout } from "../ui/SplitCards";
import { LIVING } from "../sets/Living";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { AdDesk, CAM_DESK, CARD, cardQuad, MOM_DESK, toScreen, typingPose } from "./AdDesk";
import { H } from "./common";
import { LaptopAd } from "./Family";
import { Room } from "./Room";

const L = LIVING;
// Папа стоит за столом слева от ноутбука, лицом к маме.
export const DAD_TABLE = { x: 700, y: L.feetY, h: H.dad } as const;
export const SPLIT_AD = { edit: 1, typed: 1, extraLines: 3 } as const;
export const CAM_TWO: Cam = { x: 960, y: 1062, zoom: 1.34 };
export const CAM_SCREEN: Cam = { x: 905, y: 1110, zoom: 2.3 };

export const splitPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "split");
  const f01 = { a: T.from("F01"), b: T.to("F01") };
  const eye = f01.a + 8; // мама поднимает глаза на папу
  const glance = T.word("F01", "тил"); // короткий взгляд мамы на книгу на диване
  const book0 = glance + 8; // её взгляд: книга крупно
  const book1 = T.word("F01", "Эми") - 6;
  const turn = T.word("F01", "Эми") - 4; // папа поворачивается к экрану
  const point = turn + 6;
  const push0 = T.word("F01", "мектептен") + 4;
  const push1 = T.word("F01", "кантип") - 2; // камера у экрана
  const into1 = push1 + 14; // экран → крупная карточка
  const shell0 = T.word("F01", "өзүнчө") - 2; // оболочка разделения поверх объявления
  const morph0 = shell0 + 6;
  const morph1 = morph0 + 14;
  const split1 = morph1 + 20;
  const nod = Math.max(split1 + 26, T.len - 40); // обратно в двойной план
  return { f01, eye, glance, book0, book1, turn, point, push0, push1, into1, shell0, morph0, morph1, split1, nod, len: T.len };
};

export const SplitScene: React.FC = () => {
  const { f, tl } = useScene("split");
  const P = splitPlan(tl);
  const lq = laptopScreenQuad(L.laptop.x, L.laptop.y);
  // пункт о вождении на экране ноутбука: доля высоты экрана по раскладке объявления
  const lay = adLayout(CARD.w, SPLIT_AD);
  const v = (lay.block.y + lay.block.h * 0.55) / lay.h;
  const u = 0.32;
  const top = { x: lerp(lq[0].x, lq[1].x, u), y: lerp(lq[0].y, lq[1].y, u) };
  const bot = { x: lerp(lq[3].x, lq[2].x, u), y: lerp(lq[3].y, lq[2].y, u) };
  const screenPt = { x: lerp(top.x, bot.x, v), y: lerp(top.y, bot.y, v) };
  const highlight = keys(f, [[P.point + 4, 0], [P.point + 16, 1]]);
  const dadPose = (t: number): PoseIn => {
    const pt = keys(t, [[P.turn, 0], [P.point + 10, 1], [P.nod - 6, 1], [P.nod + 8, 0]]);
    const talk = keys(t, [[P.f01.a + 30, 0], [P.f01.a + 44, 1], [P.turn - 10, 1], [P.turn, 0]]);
    return {
      expr: "smile",
      lean: lerp(3, 8, pt),
      lookY: keys(t, [[0, 0.08], [P.turn, 0.08], [P.turn + 8, 0.34], [P.nod - 4, 0.34], [P.nod + 6, 0.1]]),
      nod: keys(t, [[P.f01.a + 52, 0], [P.f01.a + 60, 4], [P.f01.a + 70, 0]]),
      armL: { target: { x: DAD_TABLE.x + 40, y: L.table.top - 12 }, shape: "relax", elbow: "down" },
      armR:
        pt > 0.02
          ? { target: { x: lerp(DAD_TABLE.x + 90, screenPt.x - 30, pt), y: lerp(L.table.top - 110, screenPt.y + 8, pt) }, shape: pt > 0.5 ? "point" : "relax", elbow: "down", behind: false }
          : talk > 0.02
            ? { target: { x: DAD_TABLE.x + 104, y: L.table.top - 14 - 34 * talk + Math.sin(t / 6) * 4 * talk }, shape: talk > 0.5 ? "open" : "relax", elbow: "down", behind: false }
            : { target: { x: DAD_TABLE.x + 104, y: L.table.top - 14 }, shape: "relax", elbow: "down", behind: false },
    };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.5], [P.turn, 0.5], [P.turn + 10, 0.72], [P.nod - 4, 0.72], [P.nod + 6, 0.5]]);
  const momPose = (t: number): PoseIn =>
    typingPose(t, 0, {
      expr: t < P.eye ? "calm" : "smile",
      lookY: keys(t, [[0, 0.32], [P.eye, 0.32], [P.eye + 10, 0.02], [P.glance, 0.02], [P.glance + 8, 0.18], [P.book1, 0.18], [P.book1 + 8, 0.02], [P.turn + 6, 0.02], [P.turn + 16, 0.32], [P.nod, 0.32], [P.nod + 8, 0.04]]),
      nod: keys(t, [[P.nod + 8, 0], [P.nod + 15, 5], [P.nod + 22, 1], [P.nod + 28, 4], [P.nod + 36, 0]]),
      headTilt: keys(t, [[P.eye, 0], [P.eye + 10, -3], [P.turn, -3], [P.turn + 10, 0]]),
    });
  // к папе (влево) → короткий взгляд на диван с книгой (вправо) → снова к экрану
  const momFace = (t: number) => keys(t, [[P.glance, -0.74], [P.glance + 8, 0.42], [P.book1, 0.42], [P.book1 + 8, -0.74]]);
  // книга осталась на диване: прислонена к спинке, обложкой к камере
  const bookOnSofa = (
    <Svg>
      <BookCover x={L.sofa.seats[0] + 40} y={L.sofa.seatY - 92} w={128} tilt={-9} />
    </Svg>
  );
  const dad = (layer?: "body" | "arms") => <Actor uid="s10-dad" look="dad" f={f} place={() => DAD_TABLE} face={dadFace} pose={dadPose} role="father" seed={2} layer={layer} />;
  const mom = (layer: "body" | "arms") => <Actor uid="s10-mom" look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />;
  const { quad: cardQ, h: adH } = cardQuad(SPLIT_AD, { k: 1, ox: 540, oy: 700 });
  const room = (screen: React.ReactNode, cam: Cam) => (
    <Shot f={f} cam={cam}>
      <Room laptop={{ screen }} seated={dad("body")} momBody={mom("body")} seatedArms={dad("arms")} momArms={mom("arms")} overlay={bookOnSofa} />
    </Shot>
  );
  // вход в экран: камера к ноутбуку, затем экран раскрывается в карточку
  const into = easeInOut(clamp((f - P.push1) / (P.into1 - P.push1)));
  const camIn = f < P.push1 ? camMove(f, P.push0, P.push1, CAM_TWO, CAM_SCREEN) : camMove(f, P.push1, P.into1, CAM_SCREEN, CAM_DESK);
  const screenQ = lq.map((p) => toScreen(p, camIn)) as unknown as Quad;
  const shell = clamp((f - P.shell0) / 6);
  const morph = clamp((f - P.morph0) / (P.morph1 - P.morph0));
  const split = clamp((f - P.morph1) / (P.split1 - P.morph1));
  return (
    <>
      {/* после встречи — родители вдвоём: папа говорит маме, затем показывает на экран */}
      {f < P.push1 && (f < P.book0 || f >= P.book1) ? room(<ScreenAd h={adH} highlight={highlight} />, f < P.push0 ? camMove(f, 0, P.push0, CAM_TWO, { ...CAM_TWO, zoom: 1.4 }) : camMove(f, P.push0, P.push1, { ...CAM_TWO, zoom: 1.4 }, CAM_SCREEN)) : null}
      {/* её взгляд: книга осталась на диване */}
      <Shot f={f} from={P.book0} to={P.book1} cam={camMove(f, P.book0, P.book1, { x: 1585, y: 1245, zoom: 2.5 }, { x: 1582, y: 1248, zoom: 2.58 })}>
        <Room laptop={{ screen: null }} overlay={bookOnSofa} />
      </Shot>
      {/* экран → крупная карточка (комната размывается) */}
      {f >= P.push1 && f < P.into1 ? (
        <>
          <div style={box({ inset: 0, filter: `blur(${7 * into}px)` })}>{room(null, camIn)}</div>
          <div style={box({ inset: 0, backgroundColor: `rgba(247,245,239,${0.32 * into})` })} />
          <LaptopAd ad={{ ...SPLIT_AD, highlight: 1 }} quad={lerpQuad(screenQ, cardQ as unknown as Quad, into)} h={adH} />
        </>
      ) : null}
      {/* объявление крупно → две отдельные задачи */}
      {f >= P.into1 && f < P.nod ? (
        <AdDesk
          uidPrefix="s10"
          f={f}
          ad={shell < 1 ? { ...SPLIT_AD, highlight: 1, focus: keys(f, [[P.into1, 0], [P.into1 + 10, 1]]) } : null}
          zoom={{ k: 1 + 0.03 * clamp((f - P.into1) / (P.nod - P.into1)), ox: 540, oy: 700 }}
          momFace={momFace}
          momPose={momPose}
          roomSeated={dad()}
        >
          {f >= P.shell0 ? <SplitCards split={split} w={CARD.w} x={CARD.x} y={CARD.y} fromH={adH} morph={morph} style={{ opacity: shell }} /> : null}
        </AdDesk>
      ) : null}
      {/* мама кивает папе; на экране — две карточки */}
      {f >= P.nod ? room(<LaptopSplit />, camMove(f, P.nod, P.len, { ...CAM_TWO, x: 990, zoom: 1.5 }, { ...CAM_TWO, x: 995, zoom: 1.56 })) : null}
    </>
  );
};

// Экран ноутбука (LAPTOP_DESIGN): объявление во весь экран.
const ScreenAd: React.FC<{ readonly h: number; readonly highlight: number }> = ({ h, highlight }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: h, transformOrigin: "0 0", transform: `scale(${LAPTOP_DESIGN.w / CARD.w}, ${LAPTOP_DESIGN.h / h})` }}>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F7F5EF" }} />
    <AdCard {...SPLIT_AD} highlight={highlight} w={CARD.w} x={0} y={0} compact />
  </div>
);

// Экран ноутбука после разделения: две карточки по центру.
export const LaptopSplit: React.FC = () => {
  const w = 1080;
  const lay = splitLayout(w, 1);
  const h = lay.route.y + lay.route.h - lay.care.y;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: LAPTOP_DESIGN.w, height: LAPTOP_DESIGN.h, backgroundColor: "#F7F5EF" }}>
      <SplitCards split={1} w={w} x={(LAPTOP_DESIGN.w - w) / 2} y={(LAPTOP_DESIGN.h - h) / 2 - lay.care.y} />
    </div>
  );
};

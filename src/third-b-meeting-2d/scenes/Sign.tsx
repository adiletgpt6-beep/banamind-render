// Сцена 14. Новая вывеска.
// A. Кухня: телефон отложен. Дочка подходит с тем же альбомом — G03;
//    Айжан поворачивается к ней — M09.
// B. Альбом крупно (вид сверху, тёплый свет лампы): чистый новый лист.
//    Мама пальцем показывает место для названия; дочка карандашом
//    рисует «АЙКЫН» — контур под кончиком карандаша, затем короткая
//    монтажная смена стадии (заливка), узор. Затем самое важное: дочка
//    спокойно дописывает в углу «Дизайнер — 3 Б» — штрих появляется
//    непосредственно под грифелем, последние «3 Б» — заметно медленнее.
//    Готовая вывеска держится ≈ 2,5 с.
// C. Тёплая реакция мамы — без морали рассказчика.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene } from "../kit";
import { C } from "../theme";
import { CloseHand } from "../props/CloseHand";
import { Pencil, SHEET, SignDrawing, signPencilTip, titlePencilTip } from "../props/Drawing";
import { KITCHEN, KitchenBack, KitchenTable } from "../sets/Kitchen";

const KYZ_HAND = { skin: "#EBBE9A", shade: "#D8A57F", sleeve: "#8FB3D1", cuff: "#769AB8" } as const;
const MOM_HAND = { skin: "#E3B18C", shade: "#CD9870", sleeve: "#C98E5E", cuff: "#F7F1E6" } as const;

export const signPlan = (T: { from: (id: string) => number; to: (id: string) => number; len: number }) => {
  const m09End = T.to("M09");
  const close = m09End + 12;
  const point: [number, number] = [close + 8, close + 34];
  const title: [number, number] = [close + 36, close + 96];
  const fill: [number, number] = [title[1] + 2, title[1] + 16];
  const deco: [number, number] = [fill[1] + 2, fill[1] + 30];
  const credit: [number, number] = [deco[1] + 12, deco[1] + 132];
  const hold: [number, number] = [credit[1] + 6, credit[1] + 82];
  return { walk: [4, 46] as const, g03: T.from("G03"), m09: T.from("M09"), m09End, close, point, title, fill, deco, credit, hold, react: hold[1], len: T.len };
};
type P = ReturnType<typeof signPlan>;

// Доля проявленной подписи: «Дизайнер — » ровно, «3 Б» — медленнее.
const creditAt = (p: P, f: number) => {
  const u = clamp((f - p.credit[0]) / (p.credit[1] - p.credit[0]));
  const k = 0.72; // доля строки до «3 Б»
  return u < 0.55 ? (u / 0.55) * k : k + ((u - 0.55) / 0.45) * (1 - k);
};

const MOM: Place = { x: 520, y: KITCHEN.floorY, h: 770 };
const kyzPlace = (p: P) => (t: number): Place => ({ x: lerp(-150, 300, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: KITCHEN.floorY + 30, h: 590 });
const Kitchen: React.FC<{ f: number; p: P; react?: boolean }> = ({ f, p, react = false }) => {
  const turn = easeInOut(clamp((f - p.g03 - 10) / 14));
  const momPose = () => ({ sit: 1, seat: 0.27 * MOM.h, expr: react ? ("smile" as const) : f >= p.m09 - 4 ? ("smile" as const) : ("softSmile" as const), lookY: react ? 0.45 : 0.25, armL: { target: { x: 470, y: KITCHEN.tableTop - 6 }, shape: "relax" as const, elbow: "down" as const, behind: false }, armR: { target: { x: 600, y: KITCHEN.tableTop - 6 }, elbow: "down" as const } });
  const kp = kyzPlace(p);
  const kyzPose = () => ({ expr: react ? ("smile" as const) : ("softSmile" as const), lookY: react ? 0.4 : -0.1, armL: { target: { x: kp(f).x - 40, y: KITCHEN.floorY - 330 }, shape: "fist" as const, item: "notebook" as const, itemColor: C.amber, elbow: "in" as const, behind: false }, armR: { target: { x: kp(f).x + 60, y: KITCHEN.floorY - 300 }, elbow: "down" as const } });
  return (
    <Shot f={f} cam={react ? { x: 440, y: 1000, zoom: 1.7 } : { x: 470, y: 1080, zoom: 1.15 }} bg="#EFE2C9">
      <KitchenBack />
      <Actor uid="s14-mom" look="aizhanHome" f={f} place={() => MOM} face={() => lerp(0.2, -0.55, react ? 1 : turn)} pose={momPose} role="mother" seed={5} layer="body" />
      <KitchenTable />
      <Actor uid="s14-mom" look="aizhanHome" f={f} place={() => MOM} face={() => lerp(0.2, -0.55, react ? 1 : turn)} pose={momPose} role="mother" seed={5} layer="arms" />
      <Actor uid="s14-kyz" look="kyzHome" f={f} place={react ? () => ({ x: 300, y: KITCHEN.floorY + 30, h: 590 }) : kp} face={() => 0.55} pose={kyzPose} role="daughter" seed={4} blinkShift={37} walkFrom={p.walk[0] - 2} />
    </Shot>
  );
};

// Альбом крупно: лист 600×430 единиц → в кадре 920 px.
const SX = 80;
const SY = 620;
const K = 920 / SHEET.w;
const toFrame = (pt: { x: number; y: number }) => ({ x: SX + pt.x * K, y: SY + pt.y * K });
const AlbumTop: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const title = easeInOut(clamp((f - p.title[0]) / (p.title[1] - p.title[0])));
  const fill = clamp((f - p.fill[0]) / (p.fill[1] - p.fill[0])) >= 0.5 ? 1 : 0; // смена стадии — склейкой
  const deco = easeInOut(clamp((f - p.deco[0]) / (p.deco[1] - p.deco[0])));
  const credit = creditAt(p, f);
  const writingTitle = f >= p.title[0] && f < p.title[1];
  const writingCredit = f >= p.credit[0] && f < p.credit[1];
  const tip = writingTitle ? toFrame(titlePencilTip(title, f)) : writingCredit ? toFrame(signPencilTip(credit, f)) : f < p.title[0] ? { x: 860, y: 1500 } : { x: 900, y: 1430 };
  const lifted = !(writingTitle || writingCredit);
  const pointing = f >= p.point[0] && f < p.point[1] + 6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#B88A5E" }}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(circle at 80% 20%, rgba(255,212,71,0.45), rgba(255,212,71,0) 55%)" })} />
      {/* альбом: обложка, толщина, корешок сверху */}
      <div style={box({ left: SX - 30, top: SY - 70, width: 980, height: SHEET.h * K + 110, borderRadius: 14, backgroundColor: "#C9732F" })} />
      <div style={box({ left: SX - 14, top: SY - 50, width: 950, height: SHEET.h * K + 70, borderRadius: 10, backgroundColor: "#F5EFE2", boxShadow: "0 6px 0 #E3DACA, 0 12px 0 #D6CCBA" })} />
      <Svg>
        <g transform={`translate(${SX} ${SY}) scale(${K})`}>
          <SignDrawing id="s14" title={title} titleFill={fill} deco={deco} credit={credit} />
        </g>
        {pointing ? <CloseHand x={560} y={SY + 260 + 300 + keys(f, [[p.point[0], 80], [p.point[0] + 10, 0], [p.point[1], 0], [p.point[1] + 6, 120]])} angle={182} size={200} {...MOM_HAND} shape="point" armLen={3} /> : null}
        {/* карандаш и рука дочки: грифель касается бумаги только при письме */}
        <Pencil x={tip.x} y={tip.y - (lifted ? 26 : 0)} angle={28} len={250} />
        <CloseHand x={tip.x + 70} y={tip.y + 150 - (lifted ? 26 : 0)} angle={210} size={170} {...KYZ_HAND} shape="pinch" armLen={4} />
      </Svg>
    </AbsoluteFill>
  );
};

export const SignScene: React.FC = () => {
  const { f, from, to, len } = useScene("sign");
  const p = signPlan({ from, to, len });
  if (f < p.close) return <Kitchen f={f} p={p} />;
  if (f < p.react) return <AlbumTop f={f} p={p} />;
  return <Kitchen f={f} p={p} react />;
};
export { easeOut };

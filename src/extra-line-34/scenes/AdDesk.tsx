// Общая композиция сцен с объявлением (1, 3, 13): крупная карточка
// объявления «парит» над столовой — это содержимое экрана ноутбука; внизу
// справа — мама за столом (крупнее, чётко), комната за ней мягко размыта.
// Камера «приближается» к нужной строке масштабом карточки вокруг этой
// строки. В сцене 13 (вечер) за плечом мамы появляется сын.
import { Actor, type PoseIn } from "../rig/Actor";
import { box, Headline, Shot, type Cam } from "../kit";
import { AdCard, adLayout, type AdCardProps } from "../ui/AdCard";
import { LIVING } from "../sets/Living";
import { H, seatedAt } from "./common";
import { Room } from "./Room";
import { EL_TEXT } from "../script";

const L = LIVING;
// Камера на маму у торца стола: голова внизу справа кадра.
export const CAM_DESK: Cam = { x: 956, y: 800, zoom: 1.5 };
// Карточка в кадре (экранные px): левый край, верх, ширина.
export const CARD = { x: 100, y: 300, w: 880 } as const;

export const MOM_DESK = seatedAt("mom", L.momSeat.x);
// Кисти мамы на клавиатуре ноутбука; type — фаза набора (0 — руки спокойны).
export const typingPose = (t: number, type: number, extra: PoseIn = {}): PoseIn => {
  const tap = (ph: number) => (type > 0 ? Math.max(0, Math.sin(t / 2.1 + ph)) * 6 * type : 0);
  return {
    sit: 1,
    seat: L.momSeat.seat,
    expr: "calm",
    lookY: 0.32,
    armL: { target: { x: 968, y: L.table.top - 14 - tap(0) }, shape: "relax", elbow: "down" },
    armR: { target: { x: 1018, y: L.table.top - 18 - tap(1.7) }, shape: "relax", elbow: "down" },
    ...extra,
  };
};

// Точка карточки (экранные px) для строки/слова по раскладке adLayout.
export const cardPoint = (which: "extra0" | "block" | "focus" | "item2", ad: AdCardProps) => {
  const lay = adLayout(CARD.w, { extraLines: ad.extraLines, remove: ad.remove });
  const top = CARD.y;
  if (which === "extra0") return { x: CARD.x + lay.textX + 220, y: top + (lay.extra[0]?.y ?? lay.block.y) + 30 };
  if (which === "block") return { x: CARD.x + CARD.w / 2, y: top + lay.block.y + lay.block.h / 2 };
  if (which === "item2") return { x: CARD.x + lay.textX + 260, y: top + lay.items[2].y + lay.items[2].h / 2 };
  return { x: CARD.x + lay.focus.x + lay.focus.w / 2, y: top + lay.focus.y + lay.focus.h / 2 };
};

export const AdDesk: React.FC<{
  readonly f: number;
  readonly evening?: number;
  readonly ad?: AdCardProps | null; // null — вместо объявления свои карточки (children)
  readonly children?: React.ReactNode; // карточки поверх (кандидаты, календарь, разделение)
  // приближение карточки: k — масштаб вокруг экранной точки (ox, oy) и
  // сдвиг (tx, ty) — нужная строка выходит к центру внимания
  readonly zoom?: { readonly k: number; readonly ox: number; readonly oy: number; readonly tx?: number; readonly ty?: number };
  readonly cardOpacity?: number;
  readonly momFace: (t: number) => number;
  readonly momPose: (t: number) => PoseIn;
  readonly cam?: Cam;
  readonly behindMom?: React.ReactNode; // например, сын за плечом (вечер)
  readonly roomSeated?: React.ReactNode; // люди в размытой комнате (папа у стола)
  readonly headline?: { readonly t: number; readonly out?: number; readonly text?: string; readonly accent?: string };
  readonly uidPrefix: string;
}> = ({ f, evening = 0, ad, children, zoom = { k: 1, ox: 540, oy: 700 }, cardOpacity = 1, momFace, momPose, cam = CAM_DESK, behindMom, roomSeated, headline, uidPrefix }) => {
  const mom = (layer: "body" | "arms") => <Actor uid={`${uidPrefix}-mom`} look="mom" f={f} place={() => MOM_DESK} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />;
  return (
    <>
      {/* комната за мамой — мягко размыта (глубина резкости) */}
      <div style={box({ inset: 0, filter: "blur(7px)" })}>
        <Shot f={f} cam={cam}>
          <Room evening={evening} laptop={{ screen: null, glow: 1 }} toys={false} seated={roomSeated} />
        </Shot>
      </div>
      <div style={box({ inset: 0, backgroundColor: evening > 0.5 ? "rgba(244,232,214,0.28)" : "rgba(247,245,239,0.32)" })} />
      {/* мама (и сын) — чётко */}
      <Shot f={f} cam={cam} bg="transparent">
        {behindMom}
        {mom("body")}
        {mom("arms")}
      </Shot>
      {/* карточка объявления */}
      <div
        style={box({
          inset: 0,
          transformOrigin: `${zoom.ox}px ${zoom.oy}px`,
          transform: `translate(${zoom.tx ?? 0}px, ${zoom.ty ?? 0}px) scale(${zoom.k})`,
          opacity: cardOpacity,
        })}
      >
        {ad ? <AdCard {...ad} w={CARD.w} x={CARD.x} y={CARD.y} evening={evening} /> : null}
        {children}
      </div>
      {headline ? <Headline text={headline.text ?? EL_TEXT.headline.text} accent={headline.accent ?? EL_TEXT.headline.accent} t={headline.t} out={headline.out} top={168} size={62} /> : null}
    </>
  );
};

export { H };

// Четырёхугольник карточки в кадре (экранные px) при данном приближении —
// для монтажа «карточка → экран ноутбука».
export const cardQuad = (ad: AdCardProps, zoom: { k: number; ox: number; oy: number; tx?: number; ty?: number }) => {
  const h = adLayout(CARD.w, { extraLines: ad.extraLines, remove: ad.remove }).h;
  const T = (x: number, y: number) => ({ x: (x - zoom.ox) * zoom.k + zoom.ox + (zoom.tx ?? 0), y: (y - zoom.oy) * zoom.k + zoom.oy + (zoom.ty ?? 0) });
  return { quad: [T(CARD.x, CARD.y), T(CARD.x + CARD.w, CARD.y), T(CARD.x + CARD.w, CARD.y + h), T(CARD.x, CARD.y + h)] as const, h };
};

// Мировая точка → экранная для камеры cam.
export const toScreen = (p: { x: number; y: number }, cam: Cam) => ({ x: 540 + (p.x - cam.x) * cam.zoom, y: 960 + (p.y - cam.y) * cam.zoom });

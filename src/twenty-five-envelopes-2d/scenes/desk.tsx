// Вид на стол Аяна сверху (те же координаты TOP, что и во фронтальном
// плане): конверты, коробка, ручка, комикс и кисти крупно. Кисти рисуются
// поверх предметов; предмет в руке — между ладонью и пальцами не нужен:
// пальцы лежат на краю конверта/листа (контакт виден).
import { type Cam, Shot, Svg } from "../kit";
import { clamp, easeInOut, lerp, type Vec } from "../rig/motion";
import { CloseHand, type CloseShape } from "../props/CloseHand";
import { Pen } from "../props/Note";
import { BoxTop, ComicTop, DeskTopSurface, TOP, TopEnvelopes, type EnvState } from "../sets/Room";

export type HandSpec = {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly size?: number;
  readonly skin: { skin: string; shade: string; sleeve: string; cuff?: string };
  readonly shape: CloseShape;
  readonly mirror?: boolean;
  readonly armLen?: number;
};

export const DeskTop: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly items: readonly EnvState[];
  readonly boxInside?: number;
  readonly pen?: { x: number; y: number; angle?: number; lift?: number } | null;
  readonly comic?: { x: number; y: number; rot?: number } | null;
  readonly under?: React.ReactNode; // на столе под конвертами
  readonly above?: React.ReactNode; // на столе поверх конвертов (лист, рисунок)
  readonly hands?: readonly HandSpec[];
  readonly over?: React.ReactNode; // поверх кистей (мир)
  readonly overlay?: React.ReactNode; // поверх кадра (координаты экрана)
}> = ({ f, cam, items, boxInside = 0, pen = { x: TOP.pen.x, y: TOP.pen.y }, comic = { x: TOP.comic.x, y: TOP.comic.y }, under, above, hands = [], over, overlay }) => (
  <Shot f={f} cam={cam} bg="#C99A68" overlay={overlay}>
    <DeskTopSurface />
    {comic ? <ComicTop x={comic.x} y={comic.y} rot={comic.rot} /> : null}
    <BoxTop inside={boxInside} />
    {under}
    <TopEnvelopes items={items} />
    {pen ? (
      <Svg>
        <Pen x={pen.x} y={pen.y} angle={pen.angle ?? -70} len={260} lift={pen.lift ?? 0} />
      </Svg>
    ) : null}
    {above}
    <Svg>
      {hands.map((h, i) => (
        <CloseHand key={i} x={h.x} y={h.y} angle={h.angle} size={h.size ?? 230} {...h.skin} shape={h.shape} mirror={h.mirror} armLen={h.armLen ?? 5} />
      ))}
    </Svg>
    {over}
  </Shot>
);

// Запястье для кончика пальцев в точке tip (кисть длиной L под углом angle).
export const wristFor = (tip: Vec, L: number, angle: number): Vec => {
  const r = (angle * Math.PI) / 180;
  const d = 0.95 * L;
  return { x: tip.x + d * Math.sin(r), y: tip.y - d * Math.cos(r) };
};

// Подход кисти к точке и отход: rest → at за dur кадров, держится, затем
// обратно. Возвращает запястье.
export const reach = (f: number, rest: Vec, at: Vec, a: number, b: number, dur = 14): Vec => {
  const u = easeInOut(clamp((f - (a - dur)) / dur)) * (1 - easeInOut(clamp((f - b) / dur)));
  return { x: lerp(rest.x, at.x, u), y: lerp(rest.y, at.y, u) };
};

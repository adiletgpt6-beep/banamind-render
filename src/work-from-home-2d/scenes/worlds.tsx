// Общие «миры» сцен с правильным порядком слоёв.
// Кухня: стена и мебель → спинки стульев → сидящие (тело) → столешница →
// предметы на столе → руки сидящих → стоящие перед столом.
// Рабочая комната: стена → кресло → мама → стол → ноутбук и ключи.
import type { ComponentProps } from "react";
import { Actor } from "../rig/Actor";
import { ChairBack, HomeBack, HOME, SofaFront, TableFront, WarmLamp } from "../sets/Home";
import { Desk, KeysOnTable, LaptopSide, OfficeChair, WORK, WorkRoomBack } from "../sets/WorkRoom";

export type ActorSpec = Omit<ComponentProps<typeof Actor>, "layer">;

export const KitchenWorld: React.FC<{
  readonly minutes: number;
  readonly evening?: number;
  readonly doorOpen?: number;
  readonly workLight?: number;
  readonly inDoor?: React.ReactNode;
  readonly chairs?: readonly number[]; // x стульев со спинкой
  readonly seated?: readonly ActorSpec[];
  readonly standing?: readonly ActorSpec[]; // перед столом
  readonly behind?: readonly ActorSpec[]; // за столом стоя (рисуются до столешницы)
  readonly items?: React.ReactNode; // на столе
  readonly sofa?: readonly ActorSpec[]; // на диване (до переднего края сиденья)
  readonly lamp?: number;
}> = ({ minutes, evening = 0, doorOpen = 0, workLight = 1, inDoor, chairs = [HOME.seat.dad, HOME.seat.son, HOME.seat.mom], seated = [], standing = [], behind = [], items, sofa = [], lamp }) => (
  <>
    <HomeBack minutes={minutes} evening={evening} doorOpen={doorOpen} workLight={workLight} inDoor={inDoor} />
    {sofa.map((a) => (
      <Actor key={a.uid} {...a} />
    ))}
    {sofa.length ? <SofaFront evening={evening} /> : null}
    {chairs.map((x) => (
      <ChairBack key={x} x={x} evening={evening} />
    ))}
    {behind.map((a) => (
      <Actor key={a.uid} {...a} />
    ))}
    {seated.map((a) => (
      <Actor key={a.uid} {...a} layer="body" />
    ))}
    <TableFront evening={evening} />
    {items}
    {seated.map((a) => (
      <Actor key={`${a.uid}-arms`} {...a} layer="arms" />
    ))}
    {standing.map((a) => (
      <Actor key={a.uid} {...a} />
    ))}
    {lamp !== undefined ? <WarmLamp on={lamp} /> : null}
  </>
);

export const WorkWorld: React.FC<{
  readonly minutes: number;
  readonly evening?: number;
  readonly doorOpen?: number;
  readonly inDoor?: React.ReactNode;
  readonly mom?: ActorSpec;
  readonly front?: readonly ActorSpec[]; // стоящие перед столом
  readonly laptopOpen?: number;
  readonly keys?: boolean;
  readonly chair?: boolean;
}> = ({ minutes, evening = 0, doorOpen = 0, inDoor, mom, front = [], laptopOpen = 1, keys = false, chair = true }) => (
  <>
    <WorkRoomBack minutes={minutes} evening={evening} doorOpen={doorOpen} inDoor={inDoor} />
    {chair ? <OfficeChair x={WORK.chairX} /> : null}
    {mom ? <Actor {...mom} /> : null}
    <Desk />
    <LaptopSide x={WORK.laptop.x} y={WORK.desk.top} open={laptopOpen} glow={laptopOpen > 0.3 ? 1 : 0} />
    {keys ? <KeysOnTable x={WORK.keys.x} y={WORK.desk.top} /> : null}
    {front.map((a) => (
      <Actor key={a.uid} {...a} />
    ))}
  </>
);

// Мама за ноутбуком: поза сидя в профиль, кисти на клавиатуре; typing —
// короткие серии нажатий (0 — руки спокойно лежат на клавишах).
export const KEY_Y = WORK.desk.top - 13;
export const keyAt = (k: number, t: number, typing: number) => ({
  x: WORK.laptop.x - 62 + k * 30 + (typing ? Math.sin(t * 1.7 + k) * 3 : 0),
  y: KEY_Y - (typing ? Math.max(0, Math.sin(t * 1.3 + k * 2)) * 7 * typing : 0),
});

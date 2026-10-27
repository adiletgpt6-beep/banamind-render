// Гостиная со слоями для сцен №34. Порядок рисования:
//   фон (стена, окно, полка, панно, пол, ковёр) → растение, торшер → диван,
//   кресло, стул папы, сумка → seated (сидящие на диване/в кресле, стоящие
//   за мебелью) → momBody (мама у торца стола) → обеденный стол → ноутбук →
//   seatedArms (руки стоящего за столом — жест к экрану) → momArms (руки мамы
//   на клавиатуре) → журнальный столик → front
//   (передний план: малышка, идущий сын) → свет.
import { Laptop } from "../props/Laptop";
import { Armchair, CaregiverBag, CoffeeTable, DayLight, DiningTable, EveningLight, FloorLamp, LIVING, LivingBack, PlantStand, Sofa, SOFA_CUSHION, Toys, WoodChair } from "../sets/Living";

export const Room: React.FC<{
  readonly evening?: number;
  readonly bookOnShelf?: boolean;
  readonly cushion?: { readonly x: number; readonly y: number; readonly rot: number } | null;
  readonly sofaBook?: boolean;
  readonly bag?: boolean;
  readonly toys?: boolean;
  readonly phoneOnTable?: boolean;
  readonly dadChair?: boolean;
  readonly laptop?: { readonly screen?: React.ReactNode; readonly glow?: number } | null;
  readonly seated?: React.ReactNode;
  readonly momBody?: React.ReactNode;
  readonly seatedArms?: React.ReactNode; // руки стоящего за столом поверх ноутбука (жест к экрану)
  readonly momArms?: React.ReactNode;
  readonly front?: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ evening = 0, bookOnShelf = true, cushion = SOFA_CUSHION, sofaBook = false, bag = false, toys = true, phoneOnTable = false, dadChair = false, laptop = {}, seated, momBody, seatedArms, momArms, front, overlay }) => (
  <>
    <LivingBack evening={evening} bookOnShelf={bookOnShelf} />
    {evening < 0.5 ? <DayLight /> : null}
    <PlantStand evening={evening} />
    <FloorLamp on={evening} />
    <Sofa evening={evening} cushion={cushion} book={sofaBook} />
    <Armchair evening={evening} />
    {dadChair ? <WoodChair x={LIVING.dadChair.x} evening={evening} /> : null}
    <WoodChair x={LIVING.momSeat.x + 20} evening={evening} back="right" />
    {bag ? <CaregiverBag /> : null}
    {seated}
    {momBody}
    <DiningTable evening={evening} />
    {laptop ? <Laptop x={LIVING.laptop.x} y={LIVING.laptop.y} screen={laptop.screen} glow={laptop.glow ?? 1} /> : null}
    {seatedArms}
    {momArms}
    {toys ? <Toys /> : null}
    <CoffeeTable evening={evening} phone={phoneOnTable} />
    {front}
    {overlay}
    {evening > 0 ? <EveningLight on={evening} /> : null}
  </>
);

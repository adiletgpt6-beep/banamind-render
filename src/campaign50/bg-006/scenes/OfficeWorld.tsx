// Мир переговорной для офисных планов: стена с окном, экран со слайдом,
// коллеги за столом (тело → стол → руки), мама у экрана. Сцена задаёт
// позы как функции кадра; камера — в Shot.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import type { B6Role } from "../script";
import { Slide, type SlideState } from "../screens";
import { Notepad, OFFICE, OfficeBack, OfficeChair, OfficeTable, PhoneOnTable, WallScreen } from "../sets/Office";

export type Person = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: B6Role;
  readonly seed: number;
  readonly walkFrom?: number;
};

export const OfficeWorld: React.FC<{
  readonly f: number;
  readonly minutes: number;
  readonly slide: SlideState;
  readonly seated: readonly Person[]; // за столом
  readonly standing: readonly Person[]; // перед столом / у экрана
  readonly behind?: readonly Person[]; // стоят за столом (ноги скрыты столом)
  readonly emptyChairs?: readonly number[];
  readonly notepads?: readonly number[];
  readonly phone?: { x: number; glow?: number } | null;
}> = ({ f, minutes, slide, seated, standing, behind = [], emptyChairs = [], notepads = [], phone }) => (
  <>
    <OfficeBack minutes={minutes} />
    <WallScreen>
      <Slide w={OFFICE.screen.w} s={slide} />
    </WallScreen>
    {emptyChairs.map((x) => (
      <OfficeChair key={`e${x}`} x={x} />
    ))}
    {seated.map((p) => (
      <OfficeChair key={`c${p.uid}`} x={p.place(f).x} />
    ))}
    {seated.map((p) => (
      <Actor key={p.uid} uid={p.uid} look={p.look} f={f} place={p.place} face={p.face} pose={p.pose} role={p.role} seed={p.seed} layer="body" />
    ))}
    {behind.map((p) => (
      <Actor key={p.uid} uid={p.uid} look={p.look} f={f} place={p.place} face={p.face} pose={p.pose} role={p.role} seed={p.seed} layer="body" />
    ))}
    <OfficeTable />
    {notepads.map((x) => (
      <Notepad key={x} x={x} y={OFFICE.table.top + 14} />
    ))}
    {phone ? <PhoneOnTable x={phone.x} y={OFFICE.table.top + 14} glow={phone.glow ?? 0} /> : null}
    {seated.map((p) => (
      <Actor key={`${p.uid}-a`} uid={p.uid} look={p.look} f={f} place={p.place} face={p.face} pose={p.pose} role={p.role} seed={p.seed} layer="arms" />
    ))}
    {behind.map((p) => (
      <Actor key={`${p.uid}-a`} uid={p.uid} look={p.look} f={f} place={p.place} face={p.face} pose={p.pose} role={p.role} seed={p.seed} layer="arms" />
    ))}
    {standing.map((p) => (
      <Actor key={p.uid} uid={p.uid} look={p.look} f={f} place={p.place} face={p.face} pose={p.pose} role={p.role} seed={p.seed} walkFrom={p.walkFrom} />
    ))}
  </>
);

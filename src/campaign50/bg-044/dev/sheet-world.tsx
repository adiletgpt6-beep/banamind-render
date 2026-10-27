// Лист 2D-окружения и машины (проверка kit/city.tsx и kit/car.tsx).
import { AbsoluteFill, registerRoot, useCurrentFrame } from "remotion";
import { BeltCloseup, Car } from "../kit/car";
import { ApartmentBlock, Clouds, Mountains, Poplar, Road, Room, School, Sky, Stage, StreetSign, Table } from "../kit/city";
import { Kid, Mom } from "../kit/people";
import { makeSheetRoot } from "./harness";

const Street: React.FC<{ f: number; door: number }> = ({ f, door }) => (
  <Stage>
    <Sky tone="morning" />
    <Clouds offset={f} />
    <Mountains baseY={860} />
    <ApartmentBlock x={40} y={1180} w={600} floors={9} />
    <Poplar x={720} y={1180} h={460} />
    <StreetSign x={900} y={1180} text="Бишкек" scale={0.8} />
    <Road y={1180} offset={f * 4} />
    <Mom x={250} y={1250} scale={0.75} f={f} pose="stand" />
    <Kid x={360} y={1250} scale={0.75} f={f} pose="wave" />
    <Car x={680} y={1400} scale={0.55} f={f} spin={f * 10} passengers={["boy", "girl", "boy2"]} doorOpen={door} />
  </Stage>
);

const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 10) return <Street f={f} door={0} />;
  if (f < 20) return <Street f={f} door={0.8} />;
  if (f < 30)
    return (
      <AbsoluteFill>
        <Stage>
          <Sky tone="afternoon" />
          <Mountains baseY={860} />
          <School x={540} y={1180} />
          <Road y={1180} />
          <Car x={540} y={1450} scale={0.62} f={f} passengers={["boy", "girl", "boy2"]} />
        </Stage>
      </AbsoluteFill>
    );
  if (f < 40)
    return (
      <Stage>
        <Room tone="evening" />
        <Table x={180} y={1000} w={760} legs={260} />
      </Stage>
    );
  return (
    <Stage>
      <BeltCloseup progress={f < 45 ? 0.5 : 1} f={f} />
    </Stage>
  );
};

registerRoot(makeSheetRoot("world", Sheet, 50));

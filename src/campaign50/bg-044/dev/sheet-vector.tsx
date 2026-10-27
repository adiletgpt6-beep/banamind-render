// Лист деталей векторного 2D-набора (kit/people, car, city, devices).
// Каждая «страница» — 10 кадров; кадр f внутри страницы — анимация.
//   node scripts/campaign50/bg-044/dev-stills.mjs --entry src/campaign50/bg-044/dev/sheet-vector.tsx \
//        --comp Bg44Sheet-vector --frames 0,10,20 --scale 0.5 --out out/dev-vector
import { AbsoluteFill, registerRoot, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { Driver, Hand, Kid, Mom, MomKidHug, SIT } from "../kit/people";
import { makeSheetRoot } from "./harness";

const PER = 10;

const Label: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <text x={x} y={y} fontFamily={fontFamily} fontSize={26} fontWeight={800} fill={C.muted} textAnchor="middle">
    {children}
  </text>
);

const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#F6F9FD" }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
  </AbsoluteFill>
);

const Ground: React.FC<{ y: number }> = ({ y }) => <line x1={0} y1={y} x2={1080} y2={y} stroke="#D5DEEA" strokeWidth={3} />;

const PageMom: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    <Ground y={600} />
    <Mom x={150} y={600} scale={0.8} f={f} pose="stand" />
    <Label x={150} y={640}>stand</Label>
    <Mom x={410} y={600} scale={0.8} f={f} pose="walk" phase={0.1} />
    <Mom x={670} y={600} scale={0.8} f={f} pose="walk" phase={0.35} />
    <Label x={540} y={640}>walk 0.1 / 0.35</Label>
    <Mom x={920} y={600} scale={0.8} f={f} pose="wave" />
    <Label x={920} y={640}>wave</Label>
    <Ground y={1180} />
    <Mom x={150} y={1180} scale={0.8} f={f} pose="holdPhone" />
    <Label x={150} y={1220}>holdPhone</Label>
    <Mom x={410} y={1180} scale={0.8} f={f} pose="tapPhone" press={1} />
    <Label x={410} y={1220}>tapPhone</Label>
    <Mom x={670} y={1180} scale={0.8} f={f} pose="think" />
    <Label x={670} y={1220}>think</Label>
    <Mom x={900} y={1180} scale={0.8} f={f} pose="hug" hug={0} />
    <Label x={900} y={1220}>hug 0</Label>
    <Ground y={1760} />
    <g>
      <rect x={120} y={1760 - SIT.mom.seatH * 0.8 - 6} width={70} height={10} fill="#C9A27E" />
      <rect x={140 + SIT.mom.tableFromX * 0.8} y={1760 - SIT.mom.seatH * 0.8 + SIT.mom.tableTop * 0.8} width={260} height={14} fill="#C9A27E" />
    </g>
    <Mom x={150} y={1760 - SIT.mom.seatH * 0.8} scale={0.8} f={f} pose="sit" />
    <Label x={250} y={1800}>sit</Label>
    <rect x={620 + SIT.mom.tableFromX * 0.8} y={1760 - SIT.mom.seatH * 0.8 + SIT.mom.tableTop * 0.8} width={260} height={14} fill="#C9A27E" />
    <Mom x={620} y={1760 - SIT.mom.seatH * 0.8} scale={0.8} f={f} pose="sitPhone" />
    <Label x={720} y={1800}>sitPhone</Label>
  </Svg>
);

const PageKid: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    <Ground y={520} />
    <Kid x={130} y={520} f={f} pose="stand" />
    <Kid x={370} y={520} f={f} pose="walk" phase={0.1} />
    <Kid x={600} y={520} f={f} pose="walk" phase={0.35} />
    <Kid x={880} y={520} f={f} pose="wave" />
    <Ground y={1030} />
    <Kid x={130} y={1030} f={f} look="girl" pose="stand" />
    <Kid x={370} y={1030} f={f} look="boy2" pose="stand" />
    <Kid x={620} y={1030} f={f} look="girl" pose="wave" />
    <Kid x={880} y={1030} f={f} look="boy2" pose="walk" phase={0.6} />
    <Kid x={150} y={1450} f={f} pose="sitBelted" />
    <Kid x={460} y={1450} f={f} look="girl" pose="sitBelted" />
    <Kid x={770} y={1450} f={f} look="boy2" pose="sitBelted" />
    <rect x={160 + SIT.kid.tableFromX} y={1850 - SIT.kid.seatH + SIT.kid.tableTop} width={200} height={12} fill="#C9A27E" />
    <Kid x={160} y={1850 - SIT.kid.seatH} f={f} pose="homework" />
    <Ground y={1850} />
  </Svg>
);

const PageFaces: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    <Mom x={170} y={1500} scale={2.2} f={f} pose="stand" expression="smile" />
    <Mom x={560} y={1500} scale={2.2} f={f} pose="stand" expression="thoughtful" gaze="up" />
    <Mom x={940} y={1500} scale={2.2} f={f} pose="stand" mouth={0.7} />
    <Kid x={200} y={1900} scale={1.8} f={f} pose="stand" expression="happy" />
    <Kid x={560} y={1900} scale={1.8} f={f} look="girl" pose="stand" mouth={0.5} />
    <Kid x={900} y={1900} scale={1.8} f={f} look="boy2" pose="stand" />
  </Svg>
);

const PageHugDriver: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    <Ground y={760} />
    <MomKidHug x={160} y={760} scale={1} f={f} progress={1} />
    <MomKidHug x={640} y={760} scale={1} f={f} progress={0.4} />
    <Driver x={200} y={1500} scale={1.4} f={f} seat />
    <Driver x={760} y={1500} scale={1} f={f} mouth={0.5} />
  </Svg>
);

const PageHands: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    <rect x={100} y={300} width={400} height={800} rx={50} fill="#1E2A44" />
    <rect x={120} y={320} width={360} height={760} rx={36} fill="#FFFFFF" />
    <Hand x={300} y={620} scale={1} variant="tap" press={1} ripple />
    <circle cx={300} cy={620} r={6} fill="red" />
    <Hand x={800} y={520} scale={1} variant="point" angle={-20} />
    <g>
      <Hand x={540} y={1700} scale={1.2} variant="hold" layer="back" holdWidth={200} />
      <rect x={540 - 120} y={1700 - 560} width={240} height={560} rx={30} fill="#1E2A44" />
      <rect x={540 - 108} y={1700 - 548} width={216} height={536} rx={22} fill="#FFFFFF" />
      <Hand x={540} y={1700} scale={1.2} variant="hold" layer="front" holdWidth={200} />
    </g>
    <text x={20} y={40}>{f}</text>
  </Svg>
);

const PAGES: React.FC<{ f: number }>[] = [PageMom, PageKid, PageFaces, PageHugDriver, PageHands];

const Sheet: React.FC = () => {
  const frame = useCurrentFrame();
  const page = Math.min(PAGES.length - 1, Math.floor(frame / PER));
  const Page = PAGES[page];
  return <Page f={frame % PER} />;
};

registerRoot(makeSheetRoot("vector", Sheet, PAGES.length * PER));

// Сцена 4 (≈32–47 с). Камера отъезжает от окна мамы на улицу: в окнах
// разных домов — семьи со своими школами и временем уроков. Окна-карточки
// раскрываются; поиск идёт от окна к окну. Сближаются только окна с тем же
// направлением и временем (наша семья + ещё две = 3 ребёнка, правило 3–4),
// окно семьи со второй сменой (13:00) остаётся на месте — без креста и
// красного. Без пазлов, карты и стрелок. «Топ изделет», «2 жумага чейин»,
// «кепил эмес» — отдельными строками, синхронно с речью.
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp, zoomLerp } from "../anim";
import { Layer, World, type Cam } from "../art/camera";
import { Mountains, PanelHouse, Poplar, SchoolIcon, Sky, Street, panelWindow, type PanelSpec } from "../art/city";
import { Badge, Caption } from "../art/ui";
import { useLine, useSceneFrame, useWordAt } from "../context";
import { C } from "../palette";
import { BG30_TEXT } from "../script";

const G = 1500;
const B1: PanelSpec = { x: 10, y: G, w: 330, floors: 5, cols: 3, color: C.panelC, seed: 11, floorH: 130 };
const B0: PanelSpec = { x: 355, y: G, w: 350, floors: 9, cols: 3, color: C.panelA, seed: 7, floorH: 110 };
const B2: PanelSpec = { x: 720, y: G, w: 350, floors: 6, cols: 3, color: C.panelB, seed: 3, floorH: 120 };
const B3: PanelSpec = { x: 600, y: G - 10, w: 300, floors: 11, cols: 3, color: C.panelD, seed: 15, floorH: 106 };

type Fam = { readonly id: string; readonly win: { x: number; y: number; w: number; h: number }; readonly card: { x: number; y: number }; readonly row?: { x: number; y: number }; readonly time: string; readonly ok: boolean; readonly hair: string; readonly kid: string; readonly adult: string };

const FAMS: readonly Fam[] = [
  { id: "w0", win: panelWindow(B0, 1, 4), card: { x: 540, y: 660 }, row: { x: 495, y: 850 }, time: BG30_TEXT.windows.time1, ok: true, hair: "#231A17", kid: "#3E64B3", adult: C.momTop },
  { id: "w1", win: panelWindow(B1, 1, 2), card: { x: 205, y: 860 }, row: { x: 205, y: 850 }, time: BG30_TEXT.windows.time1, ok: true, hair: "#3A2A22", kid: "#E07A5F", adult: "#5E9A93" },
  { id: "w2", win: panelWindow(B2, 1, 3), card: { x: 870, y: 860 }, row: { x: 785, y: 850 }, time: BG30_TEXT.windows.time1, ok: true, hair: "#1F1A19", kid: "#6BAF6B", adult: "#8A6FB0" },
  { id: "w3", win: panelWindow(B3, 1, 9), card: { x: 770, y: 1180 }, time: BG30_TEXT.windows.time2, ok: false, hair: "#4A3428", kid: "#D6A43C", adult: "#C26A6A" },
];

const CW = 250;
const CH = 196;

// Семья в окне: взрослый и ребёнок, рюкзак ребёнка у окна.
const FamilyInside: React.FC<{ readonly fam: Fam; readonly w: number; readonly h: number }> = ({ fam, w, h }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.windowLit} />
    <rect x={-w / 2} y={h * 0.18} width={w} height={h * 0.32} fill="#F3D99A" />
    {/* взрослый */}
    <circle cx={-w * 0.14} cy={-h * 0.08} r={h * 0.13} fill="#E2B08C" />
    <path d={`M${-w * 0.14 - h * 0.13} ${-h * 0.12} Q${-w * 0.14} ${-h * 0.32} ${-w * 0.14 + h * 0.13} ${-h * 0.12} Q${-w * 0.14} ${-h * 0.2} ${-w * 0.14 - h * 0.13} ${-h * 0.12} Z`} fill={fam.hair} />
    <path d={`M${-w * 0.3} ${h / 2} Q${-w * 0.3} ${h * 0.08} ${-w * 0.14} ${h * 0.06} Q${w * 0.02} ${h * 0.08} ${w * 0.02} ${h / 2} Z`} fill={fam.adult} />
    {/* ребёнок */}
    <circle cx={w * 0.17} cy={h * 0.08} r={h * 0.105} fill="#E9BC96" />
    <path d={`M${w * 0.17 - h * 0.105} ${h * 0.05} Q${w * 0.17} ${-h * 0.1} ${w * 0.17 + h * 0.105} ${h * 0.05} Z`} fill={fam.hair} />
    <path d={`M${w * 0.04} ${h / 2} Q${w * 0.04} ${h * 0.2} ${w * 0.17} ${h * 0.19} Q${w * 0.3} ${h * 0.2} ${w * 0.3} ${h / 2} Z`} fill={fam.kid} />
    {/* рюкзак */}
    <rect x={w * 0.32} y={h * 0.2} width={w * 0.12} height={h * 0.22} rx={6} fill={fam.kid} opacity={0.85} />
  </g>
);

const FamilyCard: React.FC<{ readonly fam: Fam; readonly x: number; readonly y: number; readonly s: number; readonly hi: number; readonly dim: number }> = ({ fam, x, y, s, hi, dim }) => {
  if (s <= 0.01) return null;
  const t = 9;
  const clip = `fc-${fam.id}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim * 0.45}>
      <rect x={-CW / 2 + 8} y={-CH / 2 + 14} width={CW} height={CH} rx={18} fill="#000" opacity={0.12} />
      <rect x={-CW / 2 - t} y={-CH / 2 - t} width={CW + 2 * t} height={CH + 2 * t} rx={20} fill={hi > 0 ? C.yellow : C.white} stroke={C.white} strokeWidth={hi > 0 ? 6 : 0} />
      <defs>
        <clipPath id={clip}>
          <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <FamilyInside fam={fam} w={CW} h={CH} />
      </g>
      <rect x={-3} y={-CH / 2} width={6} height={CH} fill={C.white} opacity={0.9} />
      <rect x={-CW / 2} y={-CH * 0.14} width={CW} height={6} fill={C.white} opacity={0.9} />
      {/* метка: школа и время уроков */}
      <g transform={`translate(0 ${CH / 2 + 44})`}>
        <rect x={-92} y={-28} width={184} height={56} rx={28} fill={fam.ok ? C.navy : "#8C97AE"} />
        <g transform="translate(-52 0) scale(0.75)">
          <SchoolIcon color={fam.ok ? C.yellow : "#E1E6EF"} />
        </g>
        <text x={18} y={12} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill={C.white}>
          {fam.time}
        </text>
      </g>
    </g>
  );
};

// Поиск ведёт человек: лупу держит рука сотрудника BalaGo (тёмно-синий
// рукав), а не «автоматика».
const Magnifier: React.FC<{ readonly x: number; readonly y: number; readonly a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y})`} opacity={a}>
    <path d="M96 96 L250 300" stroke="#2D3646" strokeWidth={34} strokeLinecap="round" />
    <path d="M200 236 Q240 220 300 300 L380 520 L240 560 L180 330 Q170 270 200 236 Z" fill={C.navy} />
    <circle cx={226} cy={260} r={46} fill={C.skin} />
    <rect x={186} y={214} width={80} height={30} rx={15} fill={C.skin} transform="rotate(-40 226 229)" />
    <circle r={140} fill="#FFFFFF" opacity={0.18} />
    <circle r={140} fill="none" stroke={C.yellow} strokeWidth={18} />
    <circle r={140} fill="none" stroke={C.yellowDeep} strokeWidth={4} />
    <path d="M-80 -60 Q-60 -100 -10 -110" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.7} />
  </g>
);

export const WINDOWS = { open: 52, lens: 104, join: 176 } as const;

export const WindowsScene: React.FC = () => {
  const f = Math.max(0, useSceneFrame());
  const T = BG30_TEXT.windows;
  const n03 = useLine("n03");
  const n04 = useLine("n04");
  const wBut = useWordAt("n04", 7); // «бирок»
  const w0 = FAMS[0].win;
  const pull = easeInOut(f / 48);
  const cam: Cam = {
    x: lerp(w0.x + w0.w / 2, 540, pull),
    y: lerp(w0.y + w0.h / 2, 960, pull),
    zoom: zoomLerp(3, 1, pull),
  };
  const dimStreet = appear(f, WINDOWS.open, 20) * 0.55;
  // поиск: «линза» проходит по окнам 1 → 2 → 3, затем окна сближаются
  const lensPts = [FAMS[1].card, FAMS[2].card, FAMS[3].card];
  const lensT = (f - WINDOWS.lens) / 22;
  const li = Math.max(0, Math.min(2, Math.floor(lensT)));
  const lensP = easeInOut(lensT - li);
  const lensA = li < 2 ? lensPts[li] : lensPts[2];
  const lensB = li < 2 ? lensPts[li + 1] : lensPts[2];
  const lens = f < WINDOWS.lens ? lensPts[0] : { x: lerp(lensA.x, lensB.x, lensP), y: lerp(lensA.y, lensB.y, lensP) };
  const lensOn = appear(f, WINDOWS.lens - 8, 10) * (1 - appear(f, WINDOWS.lens + 70, 10));
  const visited = (i: number) => f >= WINDOWS.lens + (i - 1) * 22 + 6;
  const join = easeInOut((f - WINDOWS.join) / 40);
  const joined = f >= WINDOWS.join + 30;
  return (
    <AbsoluteFill style={{ backgroundColor: C.skyBottom }}>
      <World cam={cam} base={{ x: 540, y: 960, zoom: 1 }}>
        <Sky id="win-sky" x={-1200} y={-1200} w={3500} h={3000} />
        <Layer depth={0.15}>
          <Mountains x={-600} y={420} w={2300} h={520} seed={31} />
        </Layer>
        <Layer depth={0.7}>
          <PanelHouse p={B3} lit={[[1, 9]]} />
        </Layer>
        <PanelHouse p={B1} lit={[[1, 2]]} />
        <PanelHouse p={B2} lit={[[1, 3]]} />
        <Poplar x={345} y={G} h={620} />
        <PanelHouse p={B0} lit={[[1, 4]]} />
        <Poplar x={712} y={G} h={560} tone={0.05} />
        <Street x0={-1200} x1={2400} y={G} dash={f * 3} />
      </World>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: dimStreet }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {/* линия «одного каттама» под сблизившимися окнами */}
        {joined ? <rect x={80 + 830 * (1 - easeOut((f - WINDOWS.join - 30) / 20))} y={1046} width={830 * easeOut((f - WINDOWS.join - 30) / 20)} height={12} rx={6} fill={C.yellow} /> : null}
        {FAMS.map((fam, i) => {
          const s = easeOut((f - WINDOWS.open - i * 6) / 16);
          const from = fam.card;
          const to = fam.row ?? { x: 800, y: 1230 };
          const p = fam.ok ? join : easeInOut((f - WINDOWS.join) / 40);
          // лёгкое «дыхание» окон, пока камера стоит
          const bob = Math.sin((f + i * 23) / 22) * 4 * appear(f, WINDOWS.open + 20, 30);
          const x = lerp(from.x, to.x, p);
          const y = lerp(from.y, to.y, p) + bob;
          const hi = fam.ok ? (i === 0 || visited(i) ? 1 : 0) : 0;
          const dim = fam.ok ? 0 : clamp((f - (WINDOWS.lens + 50)) / 16);
          const sc = s * (fam.ok ? lerp(1, 1.0, p) : lerp(1, 0.86, p));
          return <FamilyCard key={fam.id} fam={fam} x={x} y={y} s={sc} hi={hi} dim={dim} />;
        })}
        {lensOn > 0 ? <Magnifier x={lens.x} y={lens.y} a={lensOn} /> : null}
        {joined ? (
          <g transform={`translate(495 1112)`} opacity={appear(f, WINDOWS.join + 40, 12)}>
            <rect x={-170} y={-36} width={340} height={72} rx={36} fill={C.white} stroke={C.yellow} strokeWidth={6} />
            <text x={0} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={38} fill={C.navy}>
              {T.group}
            </text>
          </g>
        ) : null}
      </svg>
      <Caption f={f} at={n03.from} out={n04.from - 6} text={T.search} top={250} size={54} />
      <Caption f={f} at={n04.from} text={T.period} top={250} size={40} />
      <Caption f={f} at={wBut} text={T.noGuarantee} top={358} size={40} accent={C.navy} />
      <Badge f={f} at={WINDOWS.join + 20} text={T.example} top={612} size={36} tone="yellow" />
    </AbsoluteFill>
  );
};


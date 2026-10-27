// Сцена 3 «group» — ДЕҢГЭЭЛ 2: ЫЛАЙЫКТУУ ТОП (≈ 13 с). Реплика g2:
// «Кийинки кадам — ылайыктуу топту издөө. Мында баарынын дареги менен
// убактысы туура келиши керек.»
// Пиксельная карта района: от дома нашего мальчика расходится жёлтый
// «радар» поиска (на «ылайыктуу топту издөө»); вокруг — другие дети со
// своим временем. На «дареги» дальние отпадают (крестик), на «убактысы» —
// ребёнок с 13:30 не подходит, совпавшие получают галочку. На «келиши
// керек» трое встают в ячейки «Топ: 3–4 бала» (четвёртая — пустая, поиск
// идёт), затем штамп «Кепил эмес». Песочные часы «2 жумага чейин» крутятся,
// полоса поиска не заполняется до конца: ни победы, ни кнопки пропуска.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, pop } from "../anim";
import { useWordAt } from "../context";
import { Badge } from "../kit/Badge";
import { GameWorld, LevelBanner, StepDots } from "../kit/GameWorld";
import { PixelPanel, PixelSlots } from "../kit/PixelUI";
import { PixelTextG } from "../kit/PixelText";
import { SpriteG, spriteSize } from "../kit/Sprite";
import { CHECK, CROSS, HOURGLASS, PIN, TOKENS } from "../kit/sprites";
import { C } from "../palette";
import { BG44_TEXT } from "../script";
import type { SceneSfxFn } from "../sound";

const BOARD = { x: 40, y: 690, w: 1000, h: 420 } as const;
const IN = { x: BOARD.x + 6, y: BOARD.y + 6, w: BOARD.w - 12, h: BOARD.h - 12 } as const;
const HOME = { x: 220, y: 200 } as const; // в координатах карты
type Cand = { readonly tok: number; readonly x: number; readonly y: number; readonly time: string; readonly near: boolean; readonly timeOk: boolean };
const CANDS: readonly Cand[] = [
  { tok: 1, x: 400, y: 112, time: "08:00", near: true, timeOk: true },
  { tok: 2, x: 370, y: 292, time: "08:00", near: true, timeOk: true },
  { tok: 3, x: 560, y: 212, time: "13:30", near: true, timeOk: false },
  { tok: 1, x: 840, y: 96, time: "08:00", near: false, timeOk: true },
  { tok: 2, x: 870, y: 292, time: "14:00", near: false, timeOk: false },
];
const TPX = 7; // жетоны на карте

export const groupSfx: SceneSfxFn = ({ wordAt }) => {
  const w = (i: number) => wordAt("g2", i);
  return [
    { at: Math.max(0, w(0) - 2), name: "start", volume: 0.38 },
    { at: w(2), name: "blip", volume: 0.3 },
    { at: w(3) + 6, name: "blip", volume: 0.22 },
    { at: w(7), name: "check", volume: 0.3 },
    { at: w(9), name: "check", volume: 0.3 },
    { at: w(11), name: "select", volume: 0.32 },
    { at: w(12) + 14, name: "stamp", volume: 0.5 },
  ];
};

// Карта района (пиксельная): парки, кварталы, дороги.
const MapArt: React.FC = () => {
  const px = 10;
  const blocks: React.ReactNode[] = [];
  const roadsX = [0, 300, 640, 900];
  const roadsY = [0, 190, 380];
  for (let i = 0; i < roadsX.length - 1; i++)
    for (let j = 0; j < roadsY.length - 1; j++) {
      const x0 = roadsX[i] + 30;
      const y0 = roadsY[j] + 30;
      const w = roadsX[i + 1] - roadsX[i] - 60;
      const h = roadsY[j + 1] - roadsY[j] - 60;
      const park = (i + j) % 3 === 1;
      blocks.push(<rect key={`b${i}${j}`} x={x0} y={y0} width={w} height={h} fill={park ? "#BFE6A8" : "#F3E9DA"} />);
      if (!park)
        for (let yy = y0 + 20; yy < y0 + h - 20; yy += 40)
          for (let xx = x0 + 20; xx < x0 + w - 20; xx += 50) blocks.push(<rect key={`w${i}${j}${xx}${yy}`} x={xx} y={yy} width={px * 2} height={px * 2} fill="#D9CBB6" />);
      else for (let k = 0; k < 4; k++) blocks.push(<rect key={`t${i}${j}${k}`} x={x0 + 20 + k * (w / 4)} y={y0 + h / 2 - 10} width={px * 2} height={px * 3} fill="#58B368" />);
    }
  return (
    <g shapeRendering="crispEdges">
      <rect x={0} y={0} width={IN.w} height={IN.h} fill="#D7DEEA" />
      {blocks}
      {roadsY.map((y, i) => (
        <rect key={`ry${i}`} x={0} y={y + 12} width={IN.w} height={6} fill="#FFFFFF" opacity={0.7} />
      ))}
    </g>
  );
};

export const GroupScene: React.FC = () => {
  const f = useCurrentFrame();
  const w0 = useWordAt("g2", 0);
  const w2 = useWordAt("g2", 2);
  const w4 = useWordAt("g2", 4);
  const w7 = useWordAt("g2", 7);
  const w9 = useWordAt("g2", 9);
  const w11 = useWordAt("g2", 11);
  const w12 = useWordAt("g2", 12);
  const t = BG44_TEXT.group;

  const radar = easeInOut((f - w2) / Math.max(12, w4 + 10 - w2));
  const R = 385 * radar;
  const addr = appear(f, w7, 8);
  const time = appear(f, w9, 8);
  const stampAt = w12 + 14;
  const stamp = clamp((f - stampAt) / 10);
  const searchBar = 0.08 + 0.34 * easeInOut(f / 380);
  const hgFlip = Math.floor(f / 40) % 2 === 1;

  const tokSize = spriteSize(TOKENS[0], TPX);
  const candidates = CANDS.map((c, i) => {
    const a = appear(f, w2 + 8 + i * 5, 10);
    const failed = (!c.near && addr > 0) || (c.near && !c.timeOk && time > 0);
    const fits = c.near && c.timeOk && time > 0;
    return { ...c, a, failed, fits, i };
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <GameWorld px={10} groundY={1236} frame={f + 400} />
      <LevelBanner title={t.level} appear={appear(f, w0 - 3, 16)} />
      <StepDots current={2} y={506} appear={appear(f, w0 + 4, 14)} />

      {/* поиск: песочные часы и полоса, которая не «выигрывает» */}
      <PixelPanel x={110} y={590} w={860} h={84} fill={C.white} border={C.navy} step={5} shadow={8} opacity={appear(f, 8, 10)}>
        <svg width={60} height={72} style={{ position: "absolute", left: 16, top: 2, transform: hgFlip ? "scaleY(-1)" : undefined }} shapeRendering="crispEdges">
          <SpriteG rows={HOURGLASS} px={6} />
        </svg>
        <div style={{ position: "absolute", left: 86, top: 12, fontFamily, fontSize: 36, fontWeight: 900, color: C.navy, whiteSpace: "nowrap" }}>{t.search}</div>
        <div style={{ position: "absolute", left: 560, top: 24, width: 260, height: 26, backgroundColor: "#E3E9F2", border: `4px solid ${C.navy}` }}>
          <div style={{ width: `${searchBar * 100}%`, height: "100%", backgroundColor: C.yellow }} />
        </div>
      </PixelPanel>

      {/* карта района */}
      <PixelPanel x={BOARD.x} y={BOARD.y} w={BOARD.w} h={BOARD.h} fill="#D7DEEA" border={C.navy} step={6} shadow={12} opacity={appear(f, 4, 10)}>
        <svg width={IN.w - 12} height={IN.h - 12} viewBox={`0 0 ${IN.w} ${IN.h}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <MapArt />
          {/* радар поиска */}
          {R > 0 ? (
            <g>
              <circle cx={HOME.x} cy={HOME.y} r={R} fill={C.yellow} opacity={0.12} />
              <circle cx={HOME.x} cy={HOME.y} r={R} fill="none" stroke={C.yellowDeep} strokeWidth={6} strokeDasharray="18 12" />
              <circle cx={HOME.x} cy={HOME.y} r={(R * ((f % 40) / 40)) % (R + 1)} fill="none" stroke={C.yellow} strokeWidth={4} opacity={0.6} />
            </g>
          ) : null}
          {/* наш дом и мальчик */}
          <g shapeRendering="crispEdges">
            <SpriteG rows={PIN} px={8} x={HOME.x - 36} y={HOME.y - 150} />
            <SpriteG rows={TOKENS[0]} px={TPX} x={HOME.x - tokSize.width / 2} y={HOME.y - tokSize.height / 2} />
          </g>
          {/* другие дети */}
          {candidates.map((c) =>
            c.a > 0 ? (
              <g key={c.i} transform={`translate(${c.x} ${c.y}) scale(${0.4 + 0.6 * pop(c.a)})`} opacity={c.failed ? 0.45 : 1}>
                <rect x={-tokSize.width / 2 - 8} y={-tokSize.height / 2 - 8} width={tokSize.width + 16} height={tokSize.height + 16} fill="#FFFFFF" stroke={C.navy} strokeWidth={5} />
                <SpriteG rows={TOKENS[c.tok]} px={TPX} x={-tokSize.width / 2} y={-tokSize.height / 2} />
                <rect x={-58} y={tokSize.height / 2 + 12} width={116} height={42} fill={C.navy} />
                <PixelTextG text={c.time} px={4} x={0} y={tokSize.height / 2 + 19} align="center" color={C.white} />
                {c.failed ? <SpriteG rows={CROSS} px={7} x={tokSize.width / 2 - 14} y={-tokSize.height / 2 - 34} /> : null}
                {c.near && addr > 0 && !c.failed ? <SpriteG rows={CHECK} px={6} x={tokSize.width / 2 - 10} y={-tokSize.height / 2 - 34} /> : null}
              </g>
            ) : null,
          )}
        </svg>
        {/* подписи проверок */}
        {candidates.map((c) => {
          const show = c.near && time > 0;
          if (!show) return null;
          const ok = c.timeOk;
          const k = pop(time);
          return (
            <div
              key={`l${c.i}`}
              style={{
                position: "absolute",
                left: c.x - 64,
                top: c.y - tokSize.height / 2 - 54,
                padding: "6px 14px",
                borderRadius: 12,
                backgroundColor: ok ? C.greenSoft : C.coralSoft,
                border: `3px solid ${ok ? C.green : C.coral}`,
                color: ok ? C.green : "#B5513B",
                fontFamily,
                fontSize: 26,
                fontWeight: 900,
                whiteSpace: "nowrap",
                transform: `scale(${k})`,
                transformOrigin: "50% 100%",
              }}
            >
              {ok ? t.fit : t.noFit}
            </div>
          );
        })}
        {/* метки «Дарек» / «Убакыт» у нашего дома */}
        <div style={{ position: "absolute", left: 14, top: HOME.y + 64, display: "flex", flexDirection: "column", gap: 8, fontFamily, fontSize: 26, fontWeight: 900 }}>
          {[{ k: t.checks.address, a: addr }, { k: t.checks.time, a: time }].map((x) => (
            <div key={x.k} style={{ display: "flex", alignItems: "center", padding: "5px 12px", borderRadius: 10, backgroundColor: C.white, border: `3px solid ${C.navy}`, color: C.navy, opacity: x.a, transform: `scale(${0.6 + 0.4 * pop(x.a)})` }}>
              {x.k}
              <Tick />
            </div>
          ))}
        </div>
      </PixelPanel>

      {/* группа: 3 ребёнка, 4-я ячейка пустая — поиск продолжается */}
      <div style={{ position: "absolute", left: 50, top: 1146, fontFamily, fontSize: 42, fontWeight: 900, color: C.navy, opacity: appear(f, w11 - 6, 10), textShadow: "0 3px 0 #FFFFFF" }}>
        {t.group}
      </div>
      <div style={{ opacity: appear(f, w11 - 6, 10) }}>
        <PixelSlots
          x={400}
          y={1126}
          slots={4}
          size={112}
          gap={18}
          filled={[TOKENS[0], TOKENS[1], TOKENS[2], null]}
          fillT={[(f - w11) / 10, (f - w11 - 5) / 10, (f - w11 - 10) / 10, 0]}
          tokenPx={8}
        />
      </div>
      {/* штамп «Кепил эмес» */}
      {stamp > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 596,
            top: 1012,
            padding: "10px 22px",
            border: `7px solid ${C.coral}`,
            borderRadius: 14,
            color: "#C8563E",
            backgroundColor: "rgba(255,255,255,0.9)",
            fontFamily,
            fontSize: 46,
            fontWeight: 900,
            transform: `rotate(-6deg) scale(${1.7 - 0.7 * easeInOut(stamp)})`,
            opacity: clamp(stamp * 2),
            zIndex: 30,
          }}
        >
          {t.notGuaranteed}
        </div>
      ) : null}
      <Badge kind="game" />
    </div>
  );
};

const Tick: React.FC = () => (
  <svg width={22} height={18} viewBox="0 0 22 18" style={{ marginLeft: 6 }}>
    <path d="M2 9 L8 15 L20 3" fill="none" stroke={C.green} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

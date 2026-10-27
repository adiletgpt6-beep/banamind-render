// Сцена 3: две другие бумажные точки пытаются присоединиться. У синей —
// другая школа, у коралловой — другое время: пунктирные связи между
// точками не сходятся (мягкий знак «≠», без тревожного красного). Точка:
// «Баарыбыз бир жакка барбайт экенбиз.» Неподходящие точки машут и
// вежливо уходят каждая своей дорожкой, не пересекая маршрут героя.
// Диктор: «Ошондуктан ылайыктуу топту алдын ала издешет.» — бумажная
// лупа проходит над картой, под ней отмечаются подходящие точки.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useSceneFrames, useSpeech, useTimeline } from "../context";
import { foundAtOf, mismatchBeats } from "../beats";
import { BG47_TEXT } from "../script";
import { Dot } from "../art/Dot";
import { CARD_H, CARD_W, FieldsCard } from "../art/FieldsCard";
import { along, blink, clamp, easeIn, easeInOut, easeOut, keyed, lerp, prog, springy } from "../art/motion";
import { C, DOT_COLORS, type DotColor } from "../art/palette";
import { HeroPlaces } from "../art/places";
import { Check, FieldIcon, Mismatch, School } from "../art/popups";
import { Chip, ExampleTag } from "../art/ui";
import { Flat, lerpCam, project, projectBillboard, Standee, type Cam } from "../art/Stage";
import { World } from "../art/World";
import { DotOnMap, HOOK_DOT_END } from "./Hook";
import { CARD_POS, DotBadge, FIELDS_END_CAM } from "./Fields";

export const MISMATCH_CAM: Cam = { cx: 520, cy: 850, zoom: 1.5, tilt: 44, sy: 1010 };
export const SEARCH_CAM: Cam = { cx: 520, cy: 820, zoom: 1.12, tilt: 46, sy: 960 };
// В конце сцены камера медленно приближается (сцена 4 начинается отсюда).
export const SEARCH_END_CAM: Cam = { cx: 515, cy: 845, zoom: 1.2, tilt: 46, sy: 970 };
// Школа синего гостя — другая школа, справа от маршрута героя.
const BLUE_SCHOOL = { x: 775, y: 800 } as const;

// Пути гостей: приход и уход по своим улицам (не по маршруту героя).
const BLUE_IN: readonly (readonly [number, number])[] = [
  [1080, 905],
  [668, 905],
];
const BLUE_OUT: readonly (readonly [number, number])[] = [
  [668, 905],
  [BLUE_SCHOOL.x, 905],
  [BLUE_SCHOOL.x, BLUE_SCHOOL.y + 30],
];
const CORAL_IN: readonly (readonly [number, number])[] = [
  [-90, 926],
  [384, 920],
];
const CORAL_OUT: readonly (readonly [number, number])[] = [
  [384, 920],
  [330, 980],
  [330, 1370],
  [-80, 1370],
];

// Подходящие точки, которые находит лупа (они же — группа в сцене 5).
export const CANDIDATES: readonly { x: number; y: number; color: DotColor }[] = [
  { x: 430, y: 1060, color: "mint" },
  { x: 650, y: 700, color: "violet" },
];


export const MismatchScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = mismatchBeats(useTimeline());
  const speech = useSpeech("dot", f);
  const len = useSceneFrames("mismatch");
  const toSearch = easeInOut(prog(f, b.lens - 10, 30));
  const settle = easeInOut(prog(f, b.lensEnd, Math.max(10, len - b.lensEnd)));
  const cam = lerpCam(lerpCam(lerpCam(FIELDS_END_CAM, MISMATCH_CAM, easeInOut(f / 34)), SEARCH_CAM, toSearch), SEARCH_END_CAM, settle);

  // гости
  const walkIn = (at: number) => easeInOut(prog(f, at, b.arrive - at));
  const walkOut = easeInOut(prog(f, b.leave, 70));
  const guest = (inPath: typeof BLUE_IN, outPath: typeof BLUE_OUT, at: number) => {
    const p = f < b.leave ? along(inPath, walkIn(at)) : along(outPath, walkOut);
    const moving = (f > at && f < b.arrive) || (f > b.leave && walkOut < 1);
    return { ...p, moving, fade: 1 - easeIn(prog(f, b.leave + 52, 16)) };
  };
  const blue = guest(BLUE_IN, BLUE_OUT, b.blueIn);
  const coral = guest(CORAL_IN, CORAL_OUT, b.coralIn);

  // связи «сходится ли?» — по земле, между ногами точек
  const link = easeOut(prog(f, b.link, 10)) * (1 - easeIn(prog(f, b.neq + 14, 10)));
  const mid = (g: { x: number; y: number }) => project(cam, (HOOK_DOT_END.x + g.x) / 2, (HOOK_DOT_END.y + g.y) / 2 + 30);

  const thoughtful = f > b.d2.from - 8;
  const cardOut = easeIn(prog(f, 0, 16));

  // лупа
  const lensT = easeInOut(prog(f, b.lens, b.lensEnd - b.lens));
  const lensPath: readonly (readonly [number, number])[] = [
    [1000, 560],
    [700, 640],
    [560, 820],
    [430, 1060],
    [300, 1180],
  ];
  const lp = along(lensPath, lensT);
  const lensScr = project(cam, lp.x, lp.y);
  const lensOn = easeOut(prog(f, b.lens, 10)) * (1 - easeIn(prog(f, b.lensEnd + 4, 12)));
  const found = CANDIDATES.map((c) => ({ ...c, pos: projectBillboard(cam, c.x, c.y, 200) }));
  const blueSchool = springy(prog(f, b.tags, 16)) * (1 - easeInOut(prog(f, b.leave + 74, 16)));
  const foundAt = (i: number) => foundAtOf(b, i);

  return (
    <>
      <World cam={cam} label={0} hole={0} mountainLabel={1 - easeOut(prog(f, b.n2.from, 8))}>
        <HeroPlaces home={1} school={1} route={1} flag={f / 6} angle={70} />
        {blueSchool > 0.01 ? (
          <Standee x={BLUE_SCHOOL.x} y={BLUE_SCHOOL.y} w={240} h={170} up={blueSchool} angle={70} sx={0.62} sy={0.62} shadow={80}>
            <School flag={f / 6} color="#EAF1FA" />
          </Standee>
        ) : null}
        {link > 0 ? (
          <Flat z={0.9}>
            <svg width={1000} height={1900} viewBox="0 0 1000 1900" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: link }}>
              {[blue, coral].map((g, i) => (
                <line
                  key={i}
                  x1={HOOK_DOT_END.x + (g.x > HOOK_DOT_END.x ? 40 : -40)}
                  y1={HOOK_DOT_END.y + 20}
                  x2={lerp(HOOK_DOT_END.x, g.x, link) + (g.x > HOOK_DOT_END.x ? -40 : 40)}
                  y2={lerp(HOOK_DOT_END.y, g.y, link) + 20}
                  stroke={C.navySoft}
                  strokeWidth={7}
                  strokeDasharray="14 12"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </Flat>
        ) : null}
        {/* дорожки уходящих гостей */}
        <GuestTrail path={BLUE_OUT} color={DOT_COLORS.blue.edge} p={easeOut(prog(f, b.leave - 6, 50))} fade={1 - easeIn(prog(f, b.leave + 60, 14))} />
        <GuestTrail path={CORAL_OUT} color={DOT_COLORS.coral.edge} p={easeOut(prog(f, b.leave - 6, 50))} fade={1 - easeIn(prog(f, b.leave + 60, 14))} />
        {/* найденные лупой точки — пока пунктирные контуры */}
        {found.map((c, i) =>
          f > foundAt(i) ? (
            <DotOnMap key={i} x={c.x} y={c.y} angle={cam.tilt} up={springy(prog(f, foundAt(i), 14))}>
              <Dot color={c.color} face={1} legs={1} blink={blink(f, 4 + i)} look={{ x: i ? -0.5 : 0.5, y: 0 }} mood="smile" />
            </DotOnMap>
          ) : null,
        )}
        <DotOnMap x={HOOK_DOT_END.x} y={HOOK_DOT_END.y} angle={cam.tilt}>
          <Dot
            look={f < b.leave ? { x: keyed(f, [[0, 0], [b.blueIn, 0.9], [b.coralIn + 20, 0.9], [b.coralIn + 28, -0.9], [b.link + 4, -0.9], [b.link + 12, 0.9], [b.neq, 0.9], [b.neq + 8, 0]]), y: 0.1 } : { x: keyed(f, [[b.leave, 0.8], [b.leave + 30, -0.8], [b.lens, 0.6], [b.lensEnd, -0.5]]), y: 0.2 }}
            blink={blink(f, 3)}
            mouth={clamp(speech * 1.35)}
            mood={f < 8 ? "happy" : thoughtful && f < b.d2.to + 10 ? "thoughtful" : "smile"}
            armL={thoughtful && f < b.d2.to ? 40 : f > b.wave && f < b.wave + 34 ? 140 + 14 * Math.sin(f / 3) : 22}
            armR={thoughtful && f < b.d2.to ? lerp(30, 100, easeInOut(prog(f, b.d2.from, 8))) : 22}
            glow={lerp(1, 0.5, easeInOut(prog(f, 0, 12)))}
          />
        </DotOnMap>
        {(
          [
            ["blue", blue] as const,
            ["coral", coral] as const,
          ]
        ).map(([color, g], i) =>
          g.fade > 0.01 ? (
            <DotOnMap key={color} x={g.x} y={g.y} angle={cam.tilt} opacity={g.fade} rot={g.moving ? Math.sign(g.dx) * 5 : 0}>
              <Dot
                color={color}
                look={g.moving ? { x: Math.sign(g.dx) * 0.9, y: Math.sign(g.dy) * 0.4 } : { x: i ? 0.9 : -0.9, y: 0 }}
                blink={blink(f, 6 + i)}
                walk={g.moving ? f * 0.55 : 0}
                stride={g.moving ? 1 : 0}
                mood="smile"
                armL={!g.moving && f > b.guestWave && f < b.leave ? 30 : 22}
                armR={!g.moving && f > b.guestWave && f < b.leave ? 140 + 16 * Math.sin(f / 2.6 + i) : 22}
              />
            </DotOnMap>
          ) : null,
        )}
      </World>

      {f > b.neq && f < b.neq + 26
        ? [mid(blue), mid(coral)].map((g, i) => (
            <div key={i} style={{ position: "absolute", left: g.x - 26, top: g.y - 26, opacity: 1 - easeIn(prog(f, b.neq + 16, 10)) }}>
              <Mismatch size={52} p={easeOut(prog(f, b.neq + i * 3, 10))} />
            </div>
          ))
        : null}
      {/* таблички гостей */}
      {f > b.tags && blue.fade > 0.01 ? <GuestTag scr={projectBillboard(cam, blue.x, blue.y, 226)} kind="school" text={BG47_TEXT.mismatch.otherSchool} p={springy(prog(f, b.tags, 14))} fade={blue.fade * (1 - easeIn(prog(f, b.leave + 10, 10)))} /> : null}
      {f > b.tags + 5 && coral.fade > 0.01 ? <GuestTag scr={projectBillboard(cam, coral.x, coral.y, 226)} kind="time" text={BG47_TEXT.mismatch.otherTime} p={springy(prog(f, b.tags + 5, 14))} fade={coral.fade * (1 - easeIn(prog(f, b.leave + 10, 10)))} /> : null}
      <DotBadge cam={cam} p={1 - easeIn(prog(f, b.lens - 10, 10))} f={f} />

      {/* лупа */}
      {lensOn > 0 ? <Lens x={lensScr.x} y={lensScr.y} s={lensOn} /> : null}
      {found.map((c, i) =>
        f > foundAt(i) + 4 ? (
          <div key={i} style={{ position: "absolute", left: c.pos.x - 25, top: c.pos.y - 56, opacity: 1 - easeIn(prog(f, len - 14, 10)) }}>
            <Check size={50} p={easeOut(prog(f, foundAt(i) + 4, 12))} />
          </div>
        ) : null,
      )}

      {/* карточка полей уезжает вниз */}
      {cardOut < 1 ? (
        <div style={{ position: "absolute", left: CARD_POS.x, top: CARD_POS.y + cardOut * 700, width: CARD_W, height: CARD_H, opacity: 1 - cardOut }}>
          <FieldsCard home={1} school={1} time={1} />
        </div>
      ) : null}

      <ExampleTag text={BG47_TEXT.example} />
      <Chip f={f} at={34} y={334} center size={46} bg="#FFF4C2" out={b.lens - 12}>
        {BG47_TEXT.mismatch.title}
      </Chip>
      <Chip f={f} at={b.n2.from + 6} out={len - 8} y={334} center size={34}>
        {BG47_TEXT.mismatch.search}
      </Chip>
    </>
  );
};

const GuestTrail: React.FC<{ readonly path: readonly (readonly [number, number])[]; readonly color: string; readonly p: number; readonly fade: number }> = ({ path, color, p, fade }) => {
  if (p <= 0 || fade <= 0) return null;
  const d = path.map((pt, i) => `${i ? "L" : "M"}${pt[0]} ${pt[1]}`).join(" ");
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform: "translateZ(0.7px)" }}>
      <svg width={1100} height={1640} viewBox="0 0 1100 1640" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: fade }}>
        <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} opacity={0.75} />
      </svg>
    </div>
  );
};

const GuestTag: React.FC<{ readonly scr: { x: number; y: number }; readonly kind: "school" | "time"; readonly text: string; readonly p: number; readonly fade: number }> = ({
  scr,
  kind,
  text,
  p,
  fade,
}) => (
  <div
    style={{
      position: "absolute",
      left: scr.x,
      top: scr.y - 64,
      opacity: fade,
      transform: `translateX(-50%) scale(${p})`,
      transformOrigin: "50% 100%",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px 6px 8px",
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        border: `4px solid ${C.navySoft}`,
        fontFamily,
        fontWeight: 900,
        fontSize: 28,
        color: C.navy,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 12px rgba(20,40,90,0.18)",
      }}
    >
      <FieldIcon kind={kind} filled={1} size={42} />
      {text}
    </div>
  </div>
);

// Бумажная лупа: кольцо, блик, ручка.
const Lens: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s})` }}>
    <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: "absolute", left: -210, top: -210, overflow: "visible", filter: "drop-shadow(0 16px 18px rgba(20,40,90,0.25))" }}>
      <line x1={100} y1={100} x2={190} y2={190} stroke={C.navy} strokeWidth={34} strokeLinecap="round" />
      <line x1={100} y1={100} x2={190} y2={190} stroke={C.yellow} strokeWidth={20} strokeLinecap="round" />
      <circle r={132} fill="rgba(234,243,252,0.28)" stroke={C.navy} strokeWidth={14} />
      <circle r={132} fill="none" stroke={C.yellow} strokeWidth={6} />
      <path d="M -88 -50 A 100 100 0 0 1 -30 -100" fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={0.8} />
    </svg>
  </div>
);


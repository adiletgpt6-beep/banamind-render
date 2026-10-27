// Сцена 4 «trial» — ДЕҢГЭЭЛ 3: АКЫСЫЗ ТОЛУК СЫНОО (≈ 14,5 с). Реплика n1:
// «Топ түзүлгөндө биринчи толук сыноо сапары акысыз өтөт: эртең менен
// мектепке, сабактан кийин үйгө.»
//  • Игра: собранная группа (трое детей) стоит под надписью «Топ
//    түзүлгөндөн кийин»; замок уровня открывается ровно на «түзүлгөндө».
//  • Пиксели → 2D (условный пример). Монтаж полной пробной поездки:
//    A утро у панельного дома (Бишкек, Ала-Тоо): мама подводит сына к белой
//      машине, задняя дверь открыта;
//    B крупный план: ремень защёлкнут;
//    C машина едет (дети пристёгнуты, водитель держит руль двумя руками);
//    D школа: мальчик идёт ко входу («мектепке»);
//    E после уроков: выходит к той же машине, едет обратно («сабактан кийин»);
//    F у подъезда его ждёт мама — объятие («үйгө»);
//    G итог: «Кошо = 1 толук сапар», ҮЙ → МЕКТЕП → ҮЙ.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp, pop } from "../anim";
import { useScene, useWordAt } from "../context";
import { Badge } from "../kit/Badge";
import { BeltCloseup, Car } from "../kit/car";
import { ApartmentBlock, blockDoor, Clouds, Mountains, Poplar, School, Sky, Stage, StreetFloor, streetCarY, streetFeet, StreetSign, type SkyTone } from "../kit/city";
import { GameWorld, LevelBanner, StepDots } from "../kit/GameWorld";
import { HUG_DX, Kid, Mom, MomKidHug, walkPhase } from "../kit/people";
import { PixelMorph } from "../kit/PixelMorph";
import { PixelPanel } from "../kit/PixelUI";
import { PixelText } from "../kit/PixelText";
import { SpriteG, spriteSize } from "../kit/Sprite";
import { KID, KIDS, LOCK_CLOSED, LOCK_OPEN, STAR } from "../kit/sprites";
import { C } from "../palette";
import { BG44_TEXT } from "../script";
import type { SceneSfxFn } from "../sound";

const S = 0.62; // масштаб людей и машины в уличных планах
const ROAD_TOP = 990; // верх асфальта; тротуар — ближе к зрителю
const SW = ROAD_TOP - 16; // линия, где стоят дома и тополя (за дорогой)
const FEET = streetFeet(ROAD_TOP); // где стоят люди (тротуар впереди)
const CAR_Y = streetCarY(ROAD_TOP); // земля под колёсами (ближняя полоса)
const PX = 10;
const GROUND = 1236;

const useBeats = () => {
  const { frames } = useScene();
  const w1 = useWordAt("n1", 1);
  const w2 = useWordAt("n1", 2);
  const w6 = useWordAt("n1", 6);
  const w10 = useWordAt("n1", 10);
  const w11 = useWordAt("n1", 11);
  const w13 = useWordAt("n1", 13);
  const morph0 = w2 - 6;
  const morph1 = morph0 + 22;
  const tB = Math.max(morph1 + 36, w6 - 4);
  const tC = tB + 24;
  const tD = Math.max(tC + 26, w10 - 6);
  const tE = Math.max(tD + 32, w11 + 2);
  const tE2 = tE + 30;
  const tF = Math.max(tE2 + 30, w13 - 8);
  const tG = Math.max(tF + 70, frames - 46);
  return { frames, w1, w2, morph0, morph1, tB, tC, tD, tE, tE2, tF, tG };
};

export const trialSfx: SceneSfxFn = ({ wordAt, frames }) => {
  const w2 = wordAt("n1", 2);
  const morph1 = w2 - 6 + 22;
  const tB = Math.max(morph1 + 36, wordAt("n1", 6) - 4);
  const tC = tB + 24;
  const tD = Math.max(tC + 26, wordAt("n1", 10) - 6);
  const tE = Math.max(tD + 32, wordAt("n1", 11) + 2);
  const tF = Math.max(tE + 60, wordAt("n1", 13) - 8);
  const tG = Math.max(tF + 70, frames - 46);
  return [
    { at: wordAt("n1", 1), name: "levelup", volume: 0.4 },
    { at: w2 - 6, name: "pixels", volume: 0.3 },
    { at: tB + 15, name: "belt", volume: 0.55 },
    { at: tC + 4, name: "door", volume: 0.4 },
    { at: tC + 8, name: "whoosh", volume: 0.14 },
    { at: tE + 26, name: "door", volume: 0.3 },
    { at: tF + 44, name: "chime", volume: 0.22 },
    { at: tG, name: "select", volume: 0.3 },
  ];
};

// ---------- игровое начало ----------
const GamePart: React.FC<{ readonly f: number; readonly b: ReturnType<typeof useBeats> }> = ({ f, b }) => {
  const t = BG44_TEXT.trial;
  const open = f >= b.w1;
  const lk = open ? LOCK_OPEN : LOCK_CLOSED;
  const lkPx = 14;
  const lkS = spriteSize(lk, lkPx);
  const lift = easeOut((f - b.w1 - 4) / 18);
  const kids = [KID.idle, KIDS.girl.idle, KIDS.glasses.idle];
  const jump = (i: number) => (open ? -Math.abs(Math.sin(((f - b.w1 + i * 5) / 9) * Math.PI)) * 24 * (1 - clamp((f - b.w1) / 40)) : 0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <GameWorld px={PX} groundY={GROUND} frame={f + 700}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {kids.map((rows, i) => (
            <SpriteG key={i} rows={open && i > 0 ? (i === 1 ? KIDS.girl.wave : KIDS.glasses.wave) : rows} px={PX} x={330 + i * 150} y={GROUND - KID.h * PX + jump(i)} />
          ))}
        </svg>
      </GameWorld>
      <LevelBanner title={t.level} appear={appear(f, 0, 14)} />
      <StepDots current={3} y={506} appear={appear(f, 4, 12)} />
      <PixelPanel x={210} y={600} w={660} h={88} fill={C.white} border={C.navy} step={5} shadow={8} opacity={appear(f, 8, 10)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 38, fontWeight: 900, color: C.navy }}>{t.after}</div>
      </PixelPanel>
      {/* замок уровня: открывается, только когда группа собрана */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} shapeRendering="crispEdges">
        <g transform={`translate(${540 - lkS.width / 2} ${760 - lift * 120}) `} opacity={1 - clamp((f - b.w1 - 14) / 10)}>
          <SpriteG rows={lk} px={lkPx} />
        </g>
        {open
          ? [0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              const r = 60 + 220 * easeOut((f - b.w1) / 16);
              return <SpriteG key={i} rows={STAR} px={5} x={540 + Math.cos(a) * r - 22} y={830 + Math.sin(a) * r * 0.7 - 22} opacity={1 - clamp((f - b.w1 - 8) / 14)} />;
            })
          : null}
      </svg>
    </div>
  );
};

// ---------- улица ----------
const Street: React.FC<{
  readonly tone: SkyTone;
  readonly offset?: number; // сдвиг фона при езде (px)
  readonly f: number;
  readonly sign?: boolean;
  readonly children?: React.ReactNode;
  readonly building?: "home" | "school" | "none";
}> = ({ tone, offset = 0, f, sign, children, building = "home" }) => (
  <Stage>
    <Sky tone={tone} id={`sky-${tone}`} />
    <Clouds offset={f * 0.6 + offset * 0.05} y={260} />
    <Mountains baseY={780} offset={offset * 0.15} />
    {building === "home" ? <ApartmentBlock x={60 + offset * 0.6} y={SW} w={600} floors={9} tone="beige" /> : null}
    {building === "home" ? <ApartmentBlock x={700 + offset * 0.6} y={SW} w={420} floors={5} tone="blue" seed={4} /> : null}
    {building === "school" ? <School x={620 + offset * 0.6} y={SW} w={760} /> : null}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const span = 1500;
      const x = ((((i * 270 + offset) % span) + span) % span) - 200;
      // у школы деревья не закрывают вывеску и вход
      if (building === "school" && x > 300 && x < 940) return null;
      return <Poplar key={i} x={x} y={SW + 4} h={380} sway={Math.sin((f + i * 13) / 30) * 1.2} tone={i % 2} />;
    })}
    {sign ? <StreetSign x={880 + offset * 0.6} y={SW + 6} text={BG44_TEXT.trial.city} scale={0.78} /> : null}
    <StreetFloor roadTop={ROAD_TOP} offset={offset} />
    {children}
  </Stage>
);

const Caption: React.FC<{ readonly text: string; readonly a: number }> = ({ text, a }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 336, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -24}px)` }}>
    <div style={{ padding: "14px 34px", borderRadius: 999, backgroundColor: C.navy, color: C.white, fontFamily, fontSize: 44, fontWeight: 900, boxShadow: "0 8px 0 rgba(20,40,90,0.15)", whiteSpace: "nowrap" }}>{text}</div>
  </div>
);

const KIDS_IN_CAR = ["boy", "girl", "boy2"] as const;

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = useBeats();
  const t = BG44_TEXT.trial;
  const door = blockDoor(60, 600);
  let real: React.ReactNode = null;
  let caption: { text: string; a: number } | null = null;

  if (f < b.tB) {
    // A: утро, мама подводит сына к машине
    const k = clamp((f - b.morph0) / (b.tB - b.morph0));
    const e = easeInOut(k);
    const kx = lerp(170, 520, e);
    const mx = lerp(60, 410, e);
    const walking = k > 0 && k < 1;
    real = (
      <Street tone="morning" f={f} sign>
        <Car x={700} y={CAR_Y} scale={S} f={f} passengers={["girl", "boy2"]} doorOpen={1} />
        <Mom x={mx} y={FEET} scale={S} f={f} pose={walking ? "walk" : "stand"} phase={walkPhase(mx, S, "mom")} gaze={[0.7, 0.3]} />
        <Kid x={kx} y={FEET + 4} scale={S} f={f} pose={walking ? "walk" : "stand"} phase={walkPhase(kx, S, "kid")} />
      </Street>
    );
    caption = { text: t.morning, a: appear(f, b.morph1, 10) };
  } else if (f < b.tC) {
    // B: ремень защёлкнут
    const p = easeInOut((f - b.tB - 2) / 13);
    real = (
      <Stage>
        <BeltCloseup progress={f >= b.tB + 15 ? 1 : p} f={f} />
      </Stage>
    );
    caption = { text: t.morning, a: 1 };
  } else if (f < b.tD) {
    // C: едем в школу
    const d = (f - b.tC) * 16;
    real = (
      <Street tone="morning" f={f} offset={-d} building={f - b.tC < 14 ? "home" : "none"}>
        <Car x={540} y={CAR_Y} scale={S} f={f} spin={d} passengers={KIDS_IN_CAR} bounce={1} />
      </Street>
    );
    caption = { text: t.morning, a: 1 };
  } else if (f < b.tE) {
    // D: школа, мальчик идёт ко входу
    const k = easeInOut((f - b.tD - 4) / (b.tE - b.tD - 6));
    const kx = lerp(330, 560, k);
    real = (
      <Street tone="morning" f={f} building="school">
        <Car x={250} y={CAR_Y} scale={S} f={f} passengers={["girl", "boy2"]} />
        <Kid x={kx} y={FEET + 4} scale={S} f={f} pose={k > 0 && k < 1 ? "walk" : "wave"} phase={walkPhase(kx, S, "kid")} />
      </Street>
    );
    caption = { text: t.morning, a: 1 };
  } else if (f < b.tE2) {
    // E1: после уроков — к той же машине
    const k = easeInOut((f - b.tE) / (b.tE2 - b.tE - 4));
    const kx = lerp(600, 330, k);
    real = (
      <Street tone="afternoon" f={f} building="school">
        <Car x={250} y={CAR_Y} scale={S} f={f} passengers={["girl", "boy2"]} doorOpen={1} />
        <Kid x={kx} y={FEET + 4} scale={S} f={f} pose="walk" flip phase={walkPhase(-kx, S, "kid")} />
      </Street>
    );
    caption = { text: t.afternoon, a: appear(f, b.tE, 10) };
  } else if (f < b.tF) {
    // E2: обратно домой (машина едет влево)
    const d = (f - b.tE2) * 16;
    real = (
      <Street tone="afternoon" f={f} offset={d} building={b.tF - f < 14 ? "home" : "none"}>
        <Car x={540} y={CAR_Y} scale={S} f={f} spin={d} passengers={KIDS_IN_CAR} bounce={1} flip />
      </Street>
    );
    caption = { text: t.afternoon, a: 1 };
  } else {
    // F: у подъезда мама встречает сына
    const walkK = easeInOut((f - b.tF) / 34);
    const momX = door - 40;
    const kx = lerp(760, momX + HUG_DX * S + 6, walkK);
    const hug = clamp((f - b.tF - 34) / 14);
    real = (
      <Street tone="afternoon" f={f} sign>
        <Car x={880} y={CAR_Y} scale={S} f={f} passengers={["girl", "boy2"]} flip />
        {hug > 0 ? (
          <MomKidHug x={momX} y={FEET} scale={S} f={f} progress={hug} />
        ) : (
          <>
            <Mom x={momX} y={FEET} scale={S} f={f} pose="wave" />
            <Kid x={kx} y={FEET + 4} scale={S} f={f} pose="walk" flip phase={walkPhase(-kx, S, "kid")} />
          </>
        )}
      </Street>
    );
    caption = f < b.tG ? { text: t.afternoon, a: 1 - clamp((f - b.tG + 8) / 8) } : null;
  }

  const morph = clamp((f - b.morph0) / (b.morph1 - b.morph0));
  const isGame = f < b.morph0 + 11;
  const sumA = appear(f, b.tG, 12);
  const k0 = BG44_TEXT.cards.cards[0].k;
  const k1 = BG44_TEXT.cards.cards[1].k;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {f < b.morph1 ? <PixelMorph id="bg44-trial-morph" progress={morph} from={<GamePart f={f} b={b} />} to={real} dir="diag" /> : real}
      {caption && !isGame ? <Caption text={caption.text} a={caption.a} /> : null}
      {sumA > 0 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 330, opacity: sumA, transform: `scale(${0.85 + 0.15 * pop(sumA)})`, transformOrigin: "50% 0" }}>
          <PixelPanel x={0} y={0} w={900} h={210} fill={C.white} border={C.navy} step={6} shadow={10}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily, fontSize: 52, fontWeight: 900, color: C.navy }}>{t.equals}</div>
            <PixelText text={`${k0} → ${k1} → ${k0}`} px={7} x={(900 - 12) / 2} y={118} align="center" color={C.yellowDeep} shadow={C.navy} />
          </PixelPanel>
        </div>
      ) : null}
      <Badge kind={f >= b.morph0 && f < b.morph1 ? "both" : isGame ? "game" : "example"} />
    </div>
  );
};

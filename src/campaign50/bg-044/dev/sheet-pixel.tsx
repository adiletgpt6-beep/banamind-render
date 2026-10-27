// Лист пиксельного набора: мир игры с HUD, все спрайты, шрифт.
//   node scripts/campaign50/bg-044/dev-stills.mjs --entry src/campaign50/bg-044/dev/sheet-pixel.tsx \
//        --comp Bg44Sheet-pixel --frames 0,10 --scale 0.5 --out out/dev-pixel
import { AbsoluteFill, registerRoot, useCurrentFrame } from "remotion";
import { GameWorld, LevelBanner, StepDots } from "../kit/GameWorld";
import { PixelText } from "../kit/PixelText";
import { Sprite } from "../kit/Sprite";
import * as S from "../kit/sprites";
import { makeSheetRoot } from "./harness";

const PageWorld: React.FC = () => (
  <AbsoluteFill>
    <GameWorld px={10} groundY={1180}>
      <Sprite rows={S.MOM.idle[0]} px={10} x={200 - S.MOM.cx * 10} y={1180 - S.MOM.h * 10} />
      <Sprite rows={S.KID.idle} px={10} x={420} y={1180 - S.KID.h * 10} />
      <Sprite rows={S.CAR.frames[0]} px={10} x={600} y={1130 - S.CAR.h * 10} />
    </GameWorld>
    <LevelBanner title="ДЕҢГЭЭЛ 1: МЕКТЕП ЖОЛУ" />
    <StepDots current={2} />
  </AbsoluteFill>
);

const PageSprites: React.FC = () => {
  const items: [string, readonly string[]][] = [
    ...S.MOM.idle.map((r, i) => [`idle${i}`, r] as [string, readonly string[]]),
    ...S.MOM.walk.map((r, i) => [`walk${i}`, r] as [string, readonly string[]]),
    ["talk", S.MOM.talk],
    ["shrug", S.MOM.shrug],
    ["point", S.MOM.point],
    ["think", S.MOM.think],
    ["happy", S.MOM.happy],
    ["kid", S.KID.idle],
    ["kidwave", S.KID.wave],
    ["girl", S.KIDS.girl.idle],
    ["glasses", S.KIDS.glasses.idle],
    ["bob", S.KIDS.bob.idle],
    ["house", S.HOUSE],
    ["school", S.SCHOOL],
    ["clock", S.CLOCK],
    ["pin", S.PIN],
    ["hour", S.HOURGLASS],
    ["lockC", S.LOCK_CLOSED],
    ["lockO", S.LOCK_OPEN],
    ["gift", S.GIFT],
    ["doc", S.DOC],
    ["check", S.CHECK],
    ["cross", S.CROSS],
    ["star", S.STAR],
    ["cursor", S.CURSOR],
    ["cursorP", S.CURSOR_PRESSED],
    ["poplar", S.POPLAR],
    ["car", S.CAR.frames[0]],
    ...S.TOKENS.map((r, i) => [`tok${i}`, r] as [string, readonly string[]]),
  ];
  let x = 20;
  let y = 20;
  let rowH = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6F9FD" }}>
      {items.map(([name, rows]) => {
        const px = 8;
        const w = Math.max(...rows.map((r) => r.length)) * px;
        const h = rows.length * px;
        if (x + w > 1060) {
          x = 20;
          y += rowH + 50;
          rowH = 0;
        }
        const el = (
          <div key={name}>
            <Sprite rows={rows} px={px} x={x} y={y} />
            <div style={{ position: "absolute", left: x, top: y + h + 4, fontSize: 18, color: "#6A7AA0" }}>{name}</div>
          </div>
        );
        x += w + 24;
        rowH = Math.max(rowH, h);
        return el;
      })}
      <PixelText text="АБВГДЕЖЗИЙКЛМНҢОӨПРСТ" px={7} x={20} y={1500} />
      <PixelText text="УҮФХЦЧШЩЪЫЬЭЮЯ 0123456789" px={7} x={20} y={1590} />
      <PixelText text=":.,!?•-–—→+/%()«»★✓" px={7} x={20} y={1680} />
      <PixelText text="ҮЙ • МЕКТЕП • УБАКЫТ" px={7} x={20} y={1770} />
    </AbsoluteFill>
  );
};

const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  return f < 10 ? <PageWorld /> : <PageSprites />;
};

registerRoot(makeSheetRoot("pixel", Sheet, 20));

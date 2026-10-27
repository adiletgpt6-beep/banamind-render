// Сцена 1 «hook» — ДЕҢГЭЭЛ 1: МЕКТЕП ЖОЛУ (≈ 6,6 с).
// С первого кадра — яркий пиксельный мир и большая кнопка «БИР БАСУУ МЕНЕН
// БҮТ» (видна в первую секунду). Плашка уровня — на слове «Жаңы», задание
// «МЕКТЕПКЕ ЖЕТКИРҮҮ» — на слове «мектеп». Курсор игрока трижды жмёт
// кнопку — она смешно пружинит, но ничего не происходит; затем честное
// окно «АЛДЫН АЛА УЮШТУРУУ КЕРЕК» (жёлтое «i», не красная ошибка), кнопка
// гаснет, мама-игрок разводит руками и задумывается. В конце — наезд
// камеры к маме и дорожке к школе.
import { useCurrentFrame } from "remotion";
import { appear, clamp, easeInOut, pulse, shake } from "../anim";
import { useScene, useWordAt } from "../context";
import { Badge } from "../kit/Badge";
import { GameWorld, LevelBanner, StepDots } from "../kit/GameWorld";
import { PixelPanel, PixelButton, PixelCursor, PixelPopup } from "../kit/PixelUI";
import { PixelText } from "../kit/PixelText";
import { SpriteG, spriteSize } from "../kit/Sprite";
import { HOUSE, MOM, SCHOOL, STAR } from "../kit/sprites";
import { C } from "../palette";
import { BG44_TEXT } from "../script";
import type { SceneSfxFn } from "../sound";

const PX = 10;
const GROUND = 1236;
// касания кнопки (кадры сцены) и появление честного окна
export const HOOK = { cursorIn: 36, taps: [52, 66, 80] as const, popup: 88 } as const;

// «i» — дружелюбный значок сообщения
const INFO = [
  "..KKKKK..",
  ".KYYYYYK.",
  "KYYYKYYYK",
  "KYYYYYYYK",
  "KYYKKYYYK",
  "KYYYKYYYK",
  "KYYYKYYYK",
  ".KYKKKYK.",
  "..KKKKK..",
];

const BTN = { x: 130, y: 760, w: 820, h: 156 } as const;

export const hookSfx: SceneSfxFn = ({ wordAt, frames }) => [
  { at: Math.max(1, wordAt("g1", 0) - 2), name: "start", volume: 0.4 },
  { at: HOOK.cursorIn, name: "blip", volume: 0.3 },
  ...HOOK.taps.map((t) => ({ at: t, name: "bonk" as const, volume: 0.42 })),
  { at: HOOK.popup, name: "blip", volume: 0.4 },
  { at: Math.max(HOOK.popup + 30, frames - 50), name: "whoosh", volume: 0.18 },
];

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const w0 = useWordAt("g1", 0);
  const w2 = useWordAt("g1", 2);
  const t = BG44_TEXT.hook;

  // нажатия
  const tapK = HOOK.taps.map((tp) => clamp(1 - Math.abs(f - (tp + 1)) / 3));
  const pressed = Math.max(...tapK);
  const wob = HOOK.taps.reduce((acc, tp) => acc + shake(f, tp + 2, 16, 4), 0);
  const off = clamp((f - (HOOK.popup - 2)) / 10);
  const popT = (f - HOOK.popup) / 14;

  // курсор: въезжает снизу справа, жмёт, после окна уходит
  const cIn = easeInOut((f - HOOK.cursorIn + 12) / 14);
  const cOut = easeInOut((f - (HOOK.popup - 4)) / 12);
  const cx = 1150 - (1150 - 600) * cIn + 520 * cOut;
  const cy = 1320 - (1320 - (BTN.y + 74)) * cIn + 520 * cOut + pressed * 10;
  const tapping = HOOK.taps.some((tp) => f >= tp && f <= tp + 3);

  // мама-игрок: стоит, на нажатиях смотрит/показывает, после окна — разводит руками, потом думает
  const momRows =
    f >= HOOK.popup + 6 && f < HOOK.popup + 40
      ? MOM.shrug
      : f >= HOOK.popup + 40
        ? MOM.think
        : f >= HOOK.taps[0] - 4
          ? MOM.point
          : MOM.idle[Math.floor(f / 18) % 2];
  const momX = 300;

  // наезд камеры в конце сцены
  const push = easeInOut((f - (frames - 54)) / 54);
  const camera = { x: 540 - 120 * push, y: 960 + 60 * push, zoom: 1 + 0.16 * push };

  const house = spriteSize(HOUSE, PX);
  const school = spriteSize(SCHOOL, PX);
  // точечная дорожка дом → школа (по тротуару)
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const x = 340 + i * 44;
    const on = f > 20 + i * 3;
    dots.push(<rect key={i} x={x} y={GROUND - 14} width={20} height={20} fill={on ? C.yellow : "#FFFFFF"} stroke={C.navy} strokeWidth={4} />);
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <GameWorld px={PX} groundY={GROUND} camera={camera} frame={f}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <SpriteG rows={HOUSE} px={PX} x={40} y={GROUND - house.height} />
          <SpriteG rows={SCHOOL} px={PX} x={1040 - school.width} y={GROUND - school.height - 10} />
          {dots}
          <SpriteG rows={momRows} px={PX} x={momX - MOM.cx * PX} y={GROUND - MOM.h * PX} />
        </svg>
        {/* подпись игрока над головой */}
        <PixelPanel x={momX + 70} y={GROUND - MOM.h * PX + 30} w={220} h={56} fill={C.navy} border={C.yellow} step={4} shadow={0} opacity={appear(f, 6, 10)}>
          <PixelText text={t.player} px={4} x={(220 - 8) / 2} y={14} align="center" color={C.white} />
        </PixelPanel>
      </GameWorld>

      <LevelBanner title={t.level} appear={appear(f, w0 - 3, 16)} />
      <StepDots current={1} y={506} appear={appear(f, w0 + 6, 14)} />
      {/* задание уровня */}
      <PixelPanel x={170} y={598} w={740} h={96} fill={C.white} border={C.navy} step={5} shadow={8} opacity={appear(f, w2 - 2, 10)} style={{ transform: `scale(${0.8 + 0.2 * appear(f, w2 - 2, 10)})` }}>
        <svg width={60} height={60} style={{ position: "absolute", left: 22, top: 15 }} shapeRendering="crispEdges">
          <SpriteG rows={STAR} px={6} />
        </svg>
        <PixelText text={t.quest} px={6} x={92} y={22} color={C.navy} />
      </PixelPanel>

      {/* «волшебная» кнопка */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${0.85 + 0.15 * appear(f, 0, 10)})`, transformOrigin: "50% 45%" }}>
        <PixelButton
          x={BTN.x}
          y={BTN.y}
          w={BTN.w}
          h={BTN.h}
          label={t.button}
          px={7}
          pressed={pressed}
          disabled={off}
          pulse={f < HOOK.taps[0] ? pulse(f, 22) : 0}
          rotate={wob}
        />
      </div>
      <PixelPopup cx={540} y={BTN.y - 30} w={860} t={popT} text={t.message} px={6} icon={INFO} iconPx={9} />
      {f >= HOOK.cursorIn - 12 && cOut < 1 ? <PixelCursor x={cx} y={cy} px={10} pressed={tapping} /> : null}

      <Badge kind="game" />
    </div>
  );
};

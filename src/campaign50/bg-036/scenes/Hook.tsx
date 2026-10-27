// Сцена 1 (≈0–6,5 с). Вид сверху: сложенная гармошкой бумажная лента.
// Рука мамы берёт свободный край и раскладывает секции одну за другой;
// счётчик в заголовке механически растёт 10 → 20 → 30 → 40 (оплаченные
// жёлтые ячейки со штампами). На слове «беш» край бумаги сам неожиданно
// выщёлкивает ещё 5 белых делений (41–45), заголовок: «40 + 5 = 45».
// Рука показывает на новые деления. Камера мягко отъезжает к всей ленте.
// Конечное состояние (для сцены trip): плоская лента в GRID, zoom ≈ 1.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import type { SfxPlan } from "../Bg36Audio";
import { Desk } from "../art/Desk";
import { TopHand, mixPose } from "../art/Hand";
import { clamp, easeInOut, easeOut, keys, lerp, spring } from "../art/motion";
import { CELL_W, FanTape, FOLDED, GRID, PANEL_H, cellCenter } from "../art/Tape";
import { Headline } from "../art/ui";
import { World, camKeys } from "../art/World";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { type ScenePlanArgs, useSceneArgs, wordF } from "./common";

// План сцены (кадры от начала сцены) — общий для движения и звука.
export const hookPlan = (a: ScenePlanArgs) => {
  const plus = wordF(a, "n01", 4); // «беш»
  const total = wordF(a, "n01", 6); // «сапар» — появляется «= 45»
  // три разворота секций равномерно и обязательно до «беш» (считаем от него
  // назад, чтобы при быстрой речи счётчик успел дойти до 40)
  const t1 = Math.max(24, plus - 10);
  const t0 = Math.max(0, Math.min(8, t1 - 48));
  const step = (t1 - t0) / 3;
  const flips = [0, 1, 2].map((k) => {
    const a0 = Math.round(t0 + k * step);
    return { from: a0, to: Math.round(a0 + step * 0.72) };
  });
  const tot = Math.max(total, plus + 14);
  // палец простукивает бонусные деления 41 → 45 («+1, +1, …»)
  const taps = [0, 1, 2, 3, 4].map((k) => tot + 10 + k * 7);
  return { flips, plus, total: tot, taps, frames: a.sc.frames };
};

export const SFX_HOOK: SfxPlan = (a) => {
  const p = hookPlan(a);
  return [
    ...p.flips.map((fl, i) => ({ at: fl.from, src: "audio/sfx-paper.mp3", volume: 0.32 + 0.04 * i })),
    { at: p.plus - 2, src: "audio/sfx-pop.mp3", volume: 0.42 },
    { at: p.plus + 2, src: "audio/sfx-paper.mp3", volume: 0.2 },
    { at: p.total, src: "audio/sfx-chime.mp3", volume: 0.16 },
    ...p.taps.map((t) => ({ at: t, src: "audio/sfx-tap.mp3", volume: 0.2 })),
  ];
};

// Угол секции k (0…2) и бонусной: сложено → 0.
const flipAngle = (f: number, from: number, to: number, folded: number) => lerp(folded, 0, easeInOut((f - from) / (to - from)));

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const p = hookPlan(useSceneArgs("hook"));
  const { flips, plus, total } = p;
  const a1 = flipAngle(f, flips[0].from, flips[0].to, FOLDED[0]);
  const a2 = flipAngle(f, flips[1].from, flips[1].to, FOLDED[1]);
  const a3 = flipAngle(f, flips[2].from, flips[2].to, FOLDED[2]);
  // бонусная половинка: неожиданно, с пружиной и лёгким перелётом
  const pop = spring((f - (plus - 4)) / 16, 5);
  const a4 = FOLDED[3] * (1 - pop);
  // сколько секций уже разложено (для счётчика)
  const opened = flips.filter((fl) => f >= fl.to - 2).length;
  const count = 10 * (1 + opened);

  // Правая рука: берёт свободный край пачки и переворачивает секцию вниз.
  // Край k-й секции: от верха (hinge − H) через ребро (hinge) к низу (hinge + H).
  const pinchX = GRID.x + CELL_W * 7.6;
  const hinge = (k: number) => GRID.y + (k + 1) * PANEL_H;
  let hand = { x: pinchX + 40, y: GRID.y + PANEL_H * 3.2, lift: 0.5, pose: 0 }; // pose: 0 щипок, 1 указательный
  for (let k = 0; k < 3; k++) {
    const fl = flips[k];
    const prevEnd = k === 0 ? 0 : flips[k - 1].to;
    const grabY = hinge(k) - PANEL_H + 10; // свободный край пачки
    if (f >= prevEnd && f < fl.from) {
      // подвести руку к краю
      const u = easeInOut((f - prevEnd) / Math.max(1, fl.from - prevEnd));
      const startY = k === 0 ? GRID.y + PANEL_H * 3.2 : hinge(k - 1) + PANEL_H - 10;
      hand = { x: lerp(k === 0 ? pinchX + 40 : pinchX, pinchX, u), y: lerp(startY, grabY, u), lift: 0.35 * Math.sin(Math.PI * u), pose: 0 };
    } else if (f >= fl.from && f < fl.to) {
      const u = easeInOut((f - fl.from) / (fl.to - fl.from));
      const th = Math.PI * (1 - u); // 180° → 0°
      // край: cos(180°) = −1 → наверху пачки, cos(0°) = 1 → внизу; щипок чуть внутрь
      hand = { x: pinchX, y: hinge(k) + PANEL_H * Math.cos(th) - 10 * Math.sign(Math.cos(th)), lift: Math.sin(th), pose: 0 };
    }
  }
  const lastEnd = flips[2].to;
  if (f >= lastEnd) {
    // отпустить край, показать на новые деления и простучать их 41 → 45
    const c = (k: number) => cellCenter(41 + k);
    const u = easeInOut((f - (plus + 6)) / 16);
    const away = easeOut((f - lastEnd) / 8);
    const tx = keys(f, [
      [plus + 6, pinchX + 30],
      [plus + 22, c(0).x + 8],
      ...p.taps.slice(1).flatMap((t, k) => [
        [t - 6, c(k).x + 8],
        [t - 1, c(k + 1).x + 8],
      ] as [number, number][]),
    ]);
    // перед каждым касанием палец чуть приподнят, в момент касания — на бумаге
    const tapDip = Math.max(0, ...p.taps.map((t) => (Math.abs(f - t) <= 3 ? Math.cos((Math.PI * (f - t)) / 6) : 0)));
    hand = {
      x: lerp(pinchX + 30 * away, tx, u),
      y: lerp(hinge(2) + PANEL_H + 26 * away, c(0).y + 44, u),
      lift: lerp(0.25 * away, 0.22 * (1 - tapDip) * clamp((f - p.taps[0] + 8) / 6), u),
      pose: u,
    };
  }
  // вспышка делений при касании
  const tapGlow = (n: number) => {
    const t = p.taps[n - 41];
    return t === undefined || f < t ? 0 : Math.exp(-(f - t) / 6);
  };

  // подсветка бонусных делений после выщелкивания
  const glowB = clamp((f - plus - 6) / 10) * (0.75 + 0.25 * Math.sin((f - plus) / 6));
  const stamp = (n: number) => (n > 40 ? clamp((f - plus - 2) / 8) : 1);
  const glow = (n: number) => (n > 40 ? Math.min(1, glowB + 0.6 * tapGlow(n)) : 0);

  const cam = camKeys(f, [
    [0, { x: 540, y: GRID.y + PANEL_H * 0.6 + 40, zoom: 1.18 }],
    [Math.round(lastEnd * 0.9), { x: 540, y: GRID.y + PANEL_H * 2.2, zoom: 1.04 }],
    [p.frames + 8, { x: 540, y: GRID.y + PANEL_H * 2.5, zoom: 1.0 }],
  ]);

  // искры вокруг выскочившей половинки
  const burst = clamp((f - plus + 2) / 14);
  const rays = Array.from({ length: 9 });
  const bx = GRID.x + CELL_W * 2.5;
  const by = GRID.y + PANEL_H * 4.5;

  const pulse = (at: number) => 1 + 0.12 * Math.sin(Math.PI * clamp((f - at) / 10));
  const plusIn = easeOut((f - plus) / 8);
  const totalIn = easeOut((f - total) / 9);
  const lastTap = p.taps[p.taps.length - 1];
  const totalPulse = 1 + 0.14 * Math.sin(Math.PI * clamp((f - lastTap) / 10));

  return (
    <>
      <World cam={cam}>
        <Desk />
        <FanTape fold={[a1, a2, a3, a4]} stamp={stamp} glow={glow} />
        {burst > 0 && burst < 1 ? (
          <svg width={10} height={10} style={{ position: "absolute", left: bx, top: by, overflow: "visible" }}>
            {rays.map((_, i) => {
              const ang = (i / rays.length) * Math.PI * 2 + 0.3;
              const r0 = 150 + 120 * burst;
              const r1 = r0 + 40 * (1 - burst);
              return (
                <path
                  key={i}
                  d={`M ${Math.cos(ang) * r0 * 1.6} ${Math.sin(ang) * r0 * 0.55} L ${Math.cos(ang) * r1 * 1.6} ${Math.sin(ang) * r1 * 0.55}`}
                  stroke={C.yellow}
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={1 - burst}
                />
              );
            })}
          </svg>
        ) : null}
        <TopHand
          x={hand.x}
          y={hand.y}
          pose={mixPose("pinch", "point", hand.pose)}
          angle={keys(f, [
            [0, -8],
            [lastEnd, -6],
            [plus + 20, -14],
          ])}
          lift={hand.lift}
          s={1.05}
        />
      </World>
      <Headline f={f} at={-12} top={290} size={96}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily }}>
          <span style={{ display: "inline-block", minWidth: 120, textAlign: "center", transform: `scale(${opened ? pulse(flips[opened - 1].to - 2) : 1})` }}>
            {count}
          </span>
          {f >= plus - 2 ? (
            <span
              style={{
                display: "inline-block",
                padding: "2px 22px 6px",
                borderRadius: 24,
                backgroundColor: C.yellow,
                opacity: plusIn,
                transform: `scale(${0.6 + 0.4 * spring((f - plus) / 14)})`,
              }}
            >
              {BG36_TEXT.hook.plus}
            </span>
          ) : null}
          {f >= total ? (
            <span style={{ display: "inline-block", opacity: totalIn, transform: `translateX(${(1 - totalIn) * 30}px) scale(${totalPulse})` }}>
              {BG36_TEXT.hook.total}
            </span>
          ) : null}
        </span>
      </Headline>
    </>
  );
};

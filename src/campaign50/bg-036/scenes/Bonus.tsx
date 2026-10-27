// Сцена 3 (≈ 18–31 с). «Кырк толук сапарга төлөсөңүз…»: каждая секция
// ленты из 10 ячеек складывается гармошкой (волна сгибов справа налево)
// и защёлкивается в аккуратный «десяток» — четыре десятка слева, над ними
// «40 төлөйсүз». «…беш кошумча толук сапар бонус катары берилет»: белая
// полоска 41–45 поднимается над столом, поворачивается вертикально и
// ложится отдельным светящимся столбиком справа, «+5 бонус». Ровная
// ладонь мамы снизу проводит между частями — остаётся пунктир, чтобы не
// спутать бесплатные бонусы с оплаченными. «Жалпысы — кырк беш сапар»:
// заголовок «40 төлөйсүз → 45 аласыз», вторая цифра крутится барабаном
// 0 → 5, бонусные ячейки по очереди вспыхивают, «45» — с толчком и звоном.
// Начало: плоская лента (как в конце trip). Конец (начало trial):
// <SeparatedTape labels={1} divider={1} glow={0.6} />, камера {540, 955, 1},
// заголовок (top 290) с BG36_TEXT.bonus.equation, руки нет.
import { useCurrentFrame } from "remotion";
import type { SfxPlan } from "../Bg36Audio";
import { AccordionRow, BonusChain, CellFlash, DigitWheel, DividerReveal, Glint } from "../art/bonus-fold";
import { Desk } from "../art/Desk";
import { TopHand } from "../art/Hand";
import { clamp, easeInOut, easeOut, keys, lerp, prog, spring } from "../art/motion";
import { BonusColumn, SEP, SeparatedTape, TenBlock, tenXY } from "../art/Separated";
import { CELL_H, CELL_W, GRID, PANEL_H, TICK_H, PanelFace, paperShadow } from "../art/Tape";
import { ArrowGlyph, Headline, Pill, Txt } from "../art/ui";
import { World, camKeys, type Cam } from "../art/World";
import { C } from "../palette";
import { BG36_TEXT } from "../script";
import { type ScenePlanArgs, useSceneArgs, wordF } from "./common";

const CAM_END: Cam = { x: 540, y: 955, zoom: 1 };
const GLOW = 0.6; // подсветка бонусных ячеек в покое (как в конце trip)
const SNAP = 8; // кадры «защёлкивания» гармошки в десяток
const NUDGE = 22; // гармошка последней секции подвигает бонусную полоску вниз
const HEAD_SIZE = 64; // заголовок — как по умолчанию у Headline

// План сцены (кадры от начала сцены) — общий для движения и звука.
export const bonusPlan = (a: ScenePlanArgs) => {
  const w = (i: number) => wordF(a, "n03", i);
  // а) «Кырк толук сапарга төлөсөңүз» — четыре секции складываются по очереди
  const a0 = Math.max(4, w(0) - 4);
  const a1 = Math.max(a0 + 44, w(4) - 4);
  const dur = Math.round(Math.max(22, (a1 - a0) * 0.52));
  const stagger = (a1 - a0 - dur) / 3;
  const rows = [0, 1, 2, 3].map((k) => {
    const from = Math.round(a0 + k * stagger);
    return { from, to: from + dur };
  });
  const label40 = Math.max(w(3), rows[0].to + SNAP);
  // б) «беш кошумча толук сапар бонус катары берилет»
  const lift = Math.max(rows[3].to + 2, w(4) - 4);
  const fly0 = lift + 7;
  const land = Math.max(fly0 + 30, w(8) - 8);
  const badge = Math.max(land + 4, w(8));
  const handIn = land - 12;
  const handTop = handIn + Math.max(30, Math.round((w(10) - handIn) * 0.55));
  const handOut0 = Math.max(handTop + 6, w(10) - 2);
  const handOut1 = handOut0 + 22;
  // в) «Жалпысы — кырк беш сапар»
  const head = Math.max(handOut0 + 4, w(11) - 6);
  const roll0 = head - 2; // барабан уже крутится, когда заголовок проявляется
  const roll1 = Math.max(roll0 + 22, w(13)); // барабан встаёт на «5» на слове «беш»
  // всё улеглось — дальше ровно SeparatedTape
  const settled = Math.max(handOut1 + 1, badge + 22, land + 14, rows[3].to + SNAP + 16, label40 + 20);
  return { rows, label40, lift, fly0, land, badge, handIn, handTop, handOut0, handOut1, head, roll0, roll1, settled, frames: a.sc.frames };
};

export const SFX_BONUS: SfxPlan = (a) => {
  const p = bonusPlan(a);
  return [
    ...p.rows.map((r, k) => ({ at: r.from + 2, src: "audio/sfx-paper.mp3", volume: 0.2 + 0.03 * k })),
    { at: p.lift, src: "audio/sfx-whoosh.mp3", volume: 0.14 },
    { at: p.badge, src: "audio/sfx-pop.mp3", volume: 0.3 },
    { at: p.handIn + 14, src: "audio/sfx-paper.mp3", volume: 0.14 },
    { at: p.roll1, src: "audio/sfx-chime.mp3", volume: 0.18 },
  ];
};

// Щелчки барабана: позиция 0…5 (с небольшим механическим перелётом).
const wheelAt = (f: number, from: number, to: number) => {
  const step = (to - from) / 5;
  let v = 0;
  for (let j = 0; j < 5; j++) v += spring((f - (from + j * step)) / Math.max(4, step * 0.9), 7);
  return v;
};
// Момент, когда барабан показывает j (1…5): ячейка 40 + j вспыхивает.
const tickAt = (from: number, to: number, j: number) => from + (j - 1) * ((to - from) / 5) + ((to - from) / 5) * 0.35;

export const BonusScene: React.FC = () => {
  const f = useCurrentFrame();
  const p = bonusPlan(useSceneArgs("bonus"));
  const { rows, lift, fly0, land, badge, handIn, handTop, handOut0, handOut1, head, roll0, roll1, settled, frames } = p;

  // ---- камера: лёгкий наезд на десятки, проводка за полоской, отъезд к общему плану
  const cam = camKeys(f, [
    [0, CAM_END],
    [rows[0].from, CAM_END],
    [rows[1].to, { x: 532, y: 945, zoom: 1.012 }],
    [lift, { x: 505, y: 930, zoom: 1.045 }],
    [land, { x: 580, y: 930, zoom: 1.04 }],
    [handOut1, { x: 555, y: 940, zoom: 1.03 }],
    [frames, CAM_END],
  ]);

  // ---- а) гармошка
  const rowU = rows.map((r) => prog(f, r.from, r.to, (x) => clamp(x)));
  const snapIn = rows.map((r) => clamp((f - r.to) / SNAP));
  const blockPop = rows.map((r) => spring((f - r.to + 2) / 16, 6));
  const nudge = NUDGE * prog(f, rows[3].from + 6, rows[3].to);

  // ---- б) бонусная полоска
  const air = keys(f, [
    [lift, 0],
    [lift + 9, 1],
    [land - 7, 1],
    [land + 1, 0],
  ]);
  const t = clamp((f - fly0) / (land - 2 - fly0));
  const bandVis = 1 - clamp((f - lift) / 10);
  const glowNow = (() => {
    // поднятая полоска светится ярче; в конце — дыхание, сходящееся к GLOW
    const up = keys(f, [
      [lift, GLOW],
      [lift + 10, 1],
      [land + 2, 1],
      [land + 24, 0.8],
      [roll1 + 20, 0.8],
      [roll1 + 50, GLOW],
    ]);
    const breathe = 0.12 * Math.sin((f - roll1) / 9) * clamp((f - roll1 - 40) / 20) * (1 - clamp((f - (frames - 70)) / 60));
    return f >= frames ? GLOW : up + breathe;
  })();
  const columnIn = clamp((f - (land - 2)) / 8);
  const chainOn = f >= lift && f < land + 7;

  // ---- рука: ровная ладонь снизу проходит вверх по линии раздела и уходит
  const tipLen = 224 * 1.05; // от запястья до кончика среднего пальца
  const wristLow = 2230;
  const wristTop = SEP.divider.y0 + 18 + tipLen;
  const upU = easeInOut(clamp((f - handIn) / (handTop - handIn)));
  const outU = easeInOut(clamp((f - handOut0) / (handOut1 - handOut0)));
  const wristY = f < handOut0 ? lerp(wristLow, wristTop, upU) : lerp(wristTop, wristLow, outU);
  const handOn = f >= handIn && f < handOut1;
  const fingerTop = wristY - tipLen;
  const dividerFront = f < handIn ? Infinity : f < handTop ? fingerTop - 16 : SEP.divider.y0 - 6;
  const handLift = f < handOut0 ? lerp(0.35, 0.08, upU) : lerp(0.08, 0.4, outU);

  // ---- подписи
  const pill40 = spring((f - p.label40) / 16, 6);
  const pillBonus = spring((f - badge) / 16, 5);

  // ---- в) заголовок и барабан
  const wheel = wheelAt(f, roll0, roll1);
  const pulse = keys(f, [
    [roll1 - 2, 1],
    [roll1 + 4, 1.16],
    [roll1 + 16, 1],
  ]);
  const marker = keys(f, [
    [roll1 - 2, 0],
    [roll1 + 4, 1],
    [roll1 + 14, 1],
    [roll1 + 30, 0],
  ]);
  const headPlain = f >= roll1 + 32;
  const [eqLeft, eqRight] = BG36_TEXT.bonus.equation.split("→").map((s) => s.trim());
  const m = /^(\d)(\d)(.*)$/.exec(eqRight) ?? ["", "4", "5", " аласыз"];
  const lineH = HEAD_SIZE * 1.08;

  const final = f >= settled;

  return (
    <>
      <World cam={cam}>
        <Desk />
        {final ? (
          <SeparatedTape labels={1} divider={1} glow={glowNow} />
        ) : (
          <>
            {/* секции 1–40: ровно → гармошка → десяток */}
            {rows.map((r, k) =>
              f < r.from ? (
                <div
                  key={k}
                  style={{ position: "absolute", left: GRID.x, top: GRID.y + k * PANEL_H, width: CELL_W * 10, height: PANEL_H, boxShadow: paperShadow }}
                >
                  <PanelFace from={k * 10 + 1} n={10} />
                </div>
              ) : (
                <div key={k}>
                  {snapIn[k] < 1 ? <AccordionRow k={k} u={rowU[k]} opacity={1 - snapIn[k] * snapIn[k]} /> : null}
                  {f >= r.to - 1 ? (
                    <TenBlock
                      k={k}
                      style={{
                        left: tenXY(k).x,
                        top: tenXY(k).y,
                        opacity: easeOut(snapIn[k] * 1.4),
                        transform: blockPop[k] < 1 ? `scale(${1 + 0.07 * (1 - blockPop[k])})` : undefined,
                      }}
                    />
                  ) : null}
                </div>
              ),
            )}
            {/* бонусная полоска 41–45: лежит → поднимается и поворачивается → столбик */}
            {f < lift ? (
              <div
                style={{
                  position: "absolute",
                  left: GRID.x,
                  top: GRID.y + 4 * PANEL_H + nudge,
                  width: CELL_W * 5,
                  height: PANEL_H,
                  boxShadow: paperShadow,
                }}
              >
                <PanelFace from={41} n={5} glow={(n) => (n > 40 ? GLOW : 0)} />
              </div>
            ) : null}
            {columnIn > 0 ? <BonusColumn glow={glowNow} style={{ left: SEP.bonus.x - TICK_H, top: GRID.y, opacity: columnIn }} /> : null}
            {chainOn ? <BonusChain t={t} air={air} band={bandVis} glow={glowNow} dy={NUDGE} /> : null}
            <DividerReveal front={dividerFront} />
            {/* подписи над частями */}
            {f >= p.label40 ? (
              <div
                style={{
                  position: "absolute",
                  left: SEP.ten.x,
                  width: SEP.ten.w,
                  top: SEP.labelY,
                  display: "flex",
                  justifyContent: "center",
                  opacity: clamp(pill40 * 1.6),
                }}
              >
                <Pill tone="navy" size={40} style={{ transform: `translateY(${(1 - pill40) * 16}px) scale(${0.7 + 0.3 * pill40})` }}>
                  {BG36_TEXT.bonus.paidLabel}
                </Pill>
              </div>
            ) : null}
            {f >= badge ? (
              <div
                style={{
                  position: "absolute",
                  left: SEP.bonus.x - 120,
                  width: CELL_W + 240,
                  top: SEP.labelY,
                  display: "flex",
                  justifyContent: "center",
                  opacity: clamp(pillBonus * 1.8),
                }}
              >
                <Pill tone="yellow" size={40} style={{ transform: `scale(${0.45 + 0.55 * pillBonus})` }}>
                  {BG36_TEXT.bonus.badge}
                </Pill>
              </div>
            ) : null}
          </>
        )}
        {/* бонусные ячейки вспыхивают по очереди, пока крутится барабан */}
        {[1, 2, 3, 4, 5].map((j) => {
          const at = tickAt(roll0, roll1, j);
          const a = f < at ? clamp(1 - (at - f) / 3) : clamp(1 - (f - at) / 16);
          return <CellFlash key={j} i={j - 1} a={a} />;
        })}
        <Glint x={SEP.bonus.x - TICK_H} y={GRID.y} w={CELL_W + TICK_H} h={5 * CELL_H} t={(f - Math.min(roll1 + 34, frames - 32)) / 30} />
        {[0, 1, 2, 3].map((k) => (
          <Glint
            key={k}
            x={tenXY(k).x}
            y={tenXY(k).y}
            w={SEP.ten.w}
            h={SEP.ten.h}
            t={(f - (Math.min(roll1 + 70, frames - 48) + k * 6)) / 24}
          />
        ))}
        {handOn ? (
          <TopHand
            x={SEP.divider.x + 6}
            y={wristY}
            anchor="wrist"
            pose="flat"
            angle={keys(f, [
              [handIn, -4],
              [handTop, 0],
              [handOut0, 0],
              [handOut1, 3],
            ])}
            lift={handLift}
            s={1.05}
          />
        ) : null}
      </World>
      {f >= head ? (
        <Headline f={f} at={head} top={290}>
          {headPlain ? (
            <Txt>{BG36_TEXT.bonus.equation}</Txt>
          ) : (
            <>
              <span>{eqLeft}</span>
              <ArrowGlyph />
              <span>
                <span style={{ position: "relative", display: "inline-block", transform: `scale(${pulse})` }}>
                  {marker > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        left: -4,
                        right: -4,
                        top: 8,
                        bottom: 4,
                        borderRadius: 16,
                        backgroundColor: C.yellow,
                        opacity: marker,
                        zIndex: -1,
                      }}
                    />
                  ) : null}
                  {m[1]}
                  <DigitWheel v={wheel} last={Number(m[2])} lineH={lineH} />
                </span>
                {m[3]}
              </span>
            </>
          )}
        </Headline>
      ) : null}
    </>
  );
};


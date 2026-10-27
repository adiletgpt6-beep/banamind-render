// Сцена 1 (хук): макро — лист «Бүгүнкү иштер» на рабочем столе. Мама
// пишет под строкой «Маанилүү иш» главную мысль презентации. Длинная
// минутная стрелка тактами входит в кадр и на слове «бөлөт» пересекает
// запись и отталкивает ручку: фраза обрывается на полуслове, перо
// оставляет росчерк. Заголовок «БИР КҮН • КАНЧА ҮЗҮЛҮШ?» — штампом в ритм
// тиканья. Диктор: «Бир эле мектеп жолу жумуш күнүн канча жолу бөлөт?»
import { useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { box, Panel, useTimeline, type Cam } from "../context";
import { wordAt, type Bg40Timeline } from "../timing";
import { BG40_TEXT } from "../script";
import { DialRim, LongHand, ticks } from "../kit/Clock";
import { DeskTop, HandLine, penTipAt, Sheet, Stroke } from "../kit/Paper";
import { PenHand } from "../kit/PenHand";
import { StampTitle } from "../kit/Labels";
import { C } from "../kit/theme";

// Лист (мировые px) и его поворот вокруг центра.
export const HOOK_SHEET = { x: 110, y: 530, w: 860, h: 1100, rot: -2.5 } as const;
// Ось длинной стрелки — в левом верхнем углу кадра; длина до острия.
export const HOOK_PIVOT = { x: 20, y: 150, len: 1380 } as const;
const TICK = 12; // кадров между тактами
const STEP = 3.4; // градусов за такт

// Фраза под «Маанилүү иш» (координаты листа) и где её обрывает стрелка.
const IDEA = { x: 126, y: 462, size: 64, rot: -1.2 } as const;
const IDEA_STOP = 0.86;

// Точка листа → мировая точка (поворот вокруг центра листа).
export const sheetToWorld = (lx: number, ly: number) => {
  const s = HOOK_SHEET;
  const r = (s.rot * Math.PI) / 180;
  const dx = lx - s.w / 2;
  const dy = ly - s.h / 2;
  return { x: s.x + s.w / 2 + dx * Math.cos(r) - dy * Math.sin(r), y: s.y + s.h / 2 + dx * Math.sin(r) + dy * Math.cos(r) };
};

const angleTo = (p: { x: number; y: number }) => (Math.atan2(p.x - HOOK_PIVOT.x, -(p.y - HOOK_PIVOT.y)) * 180) / Math.PI;

// Удар стрелки: кадр сцены (начало слова «бөлөт»).
export const hookHit = (tl: Bg40Timeline) => wordAt(tl, "n1", "бөлөт");

// Угол стрелки в кадре f (последний такт перед ударом приходит в hitAt).
export const hookHandAngle = (f: number, hitAt: number) => {
  const idea = BG40_TEXT.hook.idea;
  const t = penTipAt(IDEA.x, IDEA.y, idea, IDEA_STOP, IDEA.size, IDEA.rot);
  const aHit = angleTo(sheetToWorld(t.x, t.y)) + 0.8;
  const k = Math.max(1, Math.floor((hitAt - 2) / TICK));
  const from = hitAt - 2 - TICK * (k - 1);
  return aHit - k * STEP + ticks(f, from, TICK, STEP);
};

// Такты стрелки (кадры сцены) — для звука.
export const hookTickFrames = (hitAt: number, total: number) => {
  const k = Math.max(1, Math.floor((hitAt - 2) / TICK));
  const from = hitAt - 2 - TICK * (k - 1);
  const out: number[] = [];
  for (let t = from; t < total; t += TICK) out.push(t);
  return out;
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const hit = hookHit(useTimeline());
  const t = BG40_TEXT.hook;

  // перо пишет фразу до удара
  const writeP = IDEA_STOP * easeInOut(clamp((f - 2) / Math.max(10, hit - 2)) * 0.96 + 0.04 * clamp((f - 2) / Math.max(10, hit - 2)));
  const p = Math.min(writeP, IDEA_STOP);
  const tipLocal = penTipAt(IDEA.x, IDEA.y, t.idea, p, IDEA.size, IDEA.rot);
  const bob = Math.abs(Math.sin(f * 0.9)) * 3;
  const tipW = sheetToWorld(tipLocal.x, tipLocal.y - bob);
  // удар: ручку отбрасывает вниз-влево (росчерк), затем она оседает
  const kick = clamp((f - hit) / 5);
  const settle = easeOut((f - hit - 5) / 30);
  const broken = f >= hit;
  const kx = broken ? -170 * easeOut(kick) + 36 * settle : 0;
  const ky = broken ? 150 * easeOut(kick) - 26 * settle : 0;
  const kr = broken ? 28 * easeOut(kick) - 10 * settle : 0;
  const angle = hookHandAngle(f, hit);

  // камера: медленный наезд + толчок в момент удара
  const shake = broken && f < hit + 8 ? Math.sin((f - hit) * 2.4) * (8 - (f - hit)) * 1.6 : 0;
  const cam: Cam = { x: 540 + shake, y: 960, zoom: keys(f, [[0, 1.0], [hit, 1.05], [hit + 60, 1.085]]) };

  // росчерк пера от места удара (координаты листа)
  const hitTip = penTipAt(IDEA.x, IDEA.y, t.idea, IDEA_STOP, IDEA.size, IDEA.rot);
  const skid = `M ${hitTip.x} ${hitTip.y} q -40 30 -70 26 t -90 60 q -30 26 -80 36`;
  return (
    <>
      <Panel cam={cam} bg={C.wood}>
        <DeskTop />
        <Sheet x={HOOK_SHEET.x} y={HOOK_SHEET.y} w={HOOK_SHEET.w} h={HOOK_SHEET.h} rot={HOOK_SHEET.rot}>
          <HandLine x={120} y={26} text={t.sheet} p={1} size={90} seed={2} color={C.navy} />
          <HandLine x={500} y={120} text={t.date} p={1} size={44} seed={5} color={C.inkSoft} rot={0} />
          {t.tasks.map((task, i) => {
            const y = [190, 318, 600][i];
            const imp = i === t.important;
            return (
              <div key={task}>
                <div style={box({ left: 46, top: y + 26, width: 42, height: 42, borderRadius: 21, border: `5px solid ${imp ? C.navy : C.inkSoft}`, boxSizing: "border-box", opacity: imp ? 1 : 0.65 })} />
                {imp ? <div style={box({ left: 112, top: y + 34, width: 380, height: 50, borderRadius: 12, backgroundColor: C.marker, rotate: "-1.4deg" })} /> : null}
                <HandLine x={120} y={y} text={task} p={1} size={imp ? 84 : 68} seed={10 + i} color={imp ? C.navy : C.inkSoft} />
              </div>
            );
          })}
          {/* главная мысль презентации — пишется сейчас */}
          <HandLine x={IDEA.x} y={IDEA.y} text={t.idea} p={p} size={IDEA.size} seed={7} rot={IDEA.rot} color={C.ink} />
          <svg width={HOOK_SHEET.w} height={HOOK_SHEET.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
            {broken ? <Stroke d={skid} p={easeOut(kick)} color={C.ink} width={6} /> : null}
            {broken ? (
              <g opacity={clamp(kick * 2)}>
                <circle cx={hitTip.x + 14} cy={hitTip.y + 34} r={5} fill={C.ink} />
                <circle cx={hitTip.x - 6} cy={hitTip.y + 52} r={3.5} fill={C.ink} />
              </g>
            ) : null}
          </svg>
        </Sheet>
        {/* ручка в руке мамы */}
        <PenHand x={tipW.x + kx} y={tipW.y + ky} tilt={-6 + kr} s={1.1} lift={broken ? 1 : 0} />
        {/* край огромного циферблата в углу и минутная стрелка над листом */}
        <DialRim px={HOOK_PIVOT.x} py={HOOK_PIVOT.y} r={330} />
        <LongHand px={HOOK_PIVOT.x} py={HOOK_PIVOT.y} angle={angle} len={HOOK_PIVOT.len} w={74} />
      </Panel>
      {/* заголовок-штамп в ритм тиканья */}
      <StampTitle lines={[`${t.title.split("• ")[0]}•`, t.title.split("• ")[1]]} f={f} at={[3, 15]} y={262} sizes={[54, 82]} align="right" />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,25,10,0.16) 100%)", pointerEvents: "none" })} />
    </>
  );
};

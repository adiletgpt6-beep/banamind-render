// Сцена 2 «Жардамчы байкады».
// 2a. Общий план офиса: помощница печатает за своим столом, директор — за
//     стеклом своего кабинета; мягкий наезд к помощнице.
// 2b. N03 «Жаңы жардамчысы байкады»: средний план — она перестаёт
//     печатать, взгляд задерживается на мониторе, голова чуть наклоняется.
// 2c. Монитор: на «жылдырат» курсор переносит «Чейрек отчету» 11:00 →
//     16:00, на «онлайн» у другой встречи появляется «Онлайн», на «Муну
//     болсо өзгөртпөйт» курсор над 13:20 — пункт на месте во всех днях.
// 2d. N04: уведомление «Кардар» — крупно 13:30 («Кардар сунуштады»),
//     затем 13:30 ложится рядом с 13:20 (спокойная отметка совпадения).
// 2e. Помощница переводит взгляд на кабинет директора.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { H, seatOf } from "./common";
import { O31_CAM, O31_POS, OfficeWide } from "../sets/Office31";
import { CalendarBackdrop, CalendarWeek, NotifyCard, NOTIFY, ScreenInsert, WEEK_EVENTS, weekDragCursor, weekPoint } from "../props/CalendarUI";
import { sfxAt, type M13Sfx } from "./sfx";

const HOUR = 150; // высота часа недели на мониторе

export const noticePlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "notice");
  const wJyl = T.word("N03", "жылдырат");
  const wOnline = T.word("N03", "онлайн");
  const wMuny = T.word("N03", "Муну");
  const n4 = T.from("N04");
  const wSun = T.word("N04", "сунуштады");
  // склейки
  const cutB = Math.max(36, T.from("N03") + 18);
  const cutC = Math.max(cutB + 30, T.word("N03", "башка") - 4);
  const cutD = Math.max(T.to("N03") + 10, n4 - 8);
  const cutE = Math.max(cutD + 50, wSun - 10);
  const cutF = Math.min(T.len - 34, Math.max(cutE + 40, T.to("N04") + 8));
  return {
    len: T.len,
    cutB,
    cutC,
    cutD,
    cutE,
    cutF,
    // 2b: перестаёт печатать и вглядывается
    stopType: cutB + 6,
    notice: T.word("N03", "байкады"),
    // 2c: перенос встречи, «Онлайн», курсор над 13:20
    grab: wJyl - 14,
    dragA: wJyl - 8,
    dragB: wJyl + 22,
    online: wOnline,
    hover: wMuny,
    // 2d: уведомление 13:30
    notify: cutD + 2,
    pulse: T.word("N04", "саат"),
    // 2e: взгляд на кабинет
    look: cutF + 8,
  };
};

export const noticeSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = noticePlan(tl);
  return [sfxAt(tl, "notice", P.notify, "notify", 0.32)];
};

export const noticeSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const NoticeScene: React.FC = () => {
  const { f } = useScene("notice");
  const P = usePlan(noticePlan);
  const A = O31_POS.assistant;
  const kb = O31_POS.asstKeys;
  const D = O31_POS.director;
  const dk = O31_POS.dirDeskTop;

  // помощница: печатает (кисти чуть двигаются, разная фаза), потом
  // останавливается и вглядывается в монитор; в конце — взгляд на кабинет
  const typing = f < P.stopType ? 1 : 1 - ramp(f, P.stopType, P.stopType + 8);
  const peer = ramp(f, P.notice, P.notice + 16);
  const turn = ramp(f, P.look, P.look + 16);
  const tap = (ph: number) => typing * 3 * Math.max(0, Math.sin((f + ph) * 0.9));
  const asPose = (): PoseIn => ({
    sit: 1,
    seat: seatOf(H.assistant),
    expr: peer > 0.5 && turn < 0.5 ? "thinking" : "calm",
    lean: 4 * peer * (1 - turn) - 3 * turn,
    lookY: lerp(0.12 - 0.08 * peer, -0.42, turn),
    lookX: 0.15 * turn,
    headTilt: 5 * peer * (1 - turn),
    armL: { target: { x: kb.x - 24, y: kb.y + 2 - tap(0) }, elbow: "down" },
    armR: { target: { x: kb.x + 28, y: kb.y + 6 - tap(3) }, elbow: "down" },
  });
  const asFace = () => 0.8 + 0.12 * turn;
  const asst = (layer: "body" | "arms") => (
    <Actor uid="n-a" look="m13Assistant" f={f} place={() => ({ x: A.x, y: A.y, h: H.assistant })} face={asFace} pose={asPose} seed={7} blinkShift={11} layer={layer} />
  );
  // директор за стеклом: смотрит в ноутбук, иногда печатает
  const dirPose = (): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad) * D.s,
    expr: "calm",
    lookY: 0.4,
    armL: { target: { x: D.x - 70 * D.s, y: dk.back + 6 - 2 * Math.max(0, Math.sin(f * 0.7)) }, elbow: "down" },
    armR: { target: { x: D.x + 80 * D.s, y: dk.back + 6 }, elbow: "down" },
  });
  const dir = (layer: "body" | "arms") => (
    <Actor uid="n-d" look="m13Director" f={f} place={() => ({ x: D.x, y: D.y, h: H.dad * D.s })} face={() => -0.3} pose={dirPose} seed={3} blinkShift={5} layer={layer} />
  );
  const office = (monitorHi = 0) => (
    <OfficeWide monitorHi={monitorHi} director={dir("body")} directorArms={dir("arms")} assistant={asst("body")} assistantArms={asst("arms")} />
  );

  // неделя на мониторе
  const grab = ramp(f, P.grab, P.grab + 6) * (1 - ramp(f, P.dragB, P.dragB + 6));
  const drag = easeInOut(ramp(f, P.dragA, P.dragB));
  const dc = weekDragCursor(drag, HOUR);
  const hp = weekPoint(2, 13 * 60 + 40, HOUR);
  const toHover = ramp(f, P.hover - 18, P.hover);
  const cur = { x: lerp(dc.x, hp.x, toHover), y: lerp(dc.y, hp.y, toHover), down: grab };
  const week = (client: number) => (
    <CalendarWeek
      x={0}
      y={30}
      scale={0.82}
      hourH={HOUR}
      drag={client > 0 ? 1 : drag}
      grab={client > 0 ? 0 : grab}
      online={client > 0 ? 1 : ramp(f, P.online - 2, P.online + 10)}
      hover={client > 0 ? 0.6 : ramp(f, P.hover, P.hover + 10)}
      hoverCol={2}
      client={client}
      clientCol={WEEK_EVENTS.client.col}
      glowAll={client > 0 ? 0.35 : 0}
      cursor={client > 0 ? { x: hp.x + 60, y: hp.y + 40 } : cur}
      card={false}
    />
  );
  const notifyA = ramp(f, P.notify, P.notify + 14);
  const pulse = 1 + 0.035 * Math.sin(Math.PI * ramp(f, P.pulse, P.pulse + 16));

  return (
    <>
      {/* 2a: общий план офиса, мягкий наезд к помощнице */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB + 10, O31_CAM.wide, O31_CAM.wideTight)}>
        {office()}
      </Shot>
      {/* 2b: средний план — заметила */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={camMove(f, P.cutB, P.cutC, O31_CAM.assistant, O31_CAM.assistantClose)}>
        {office(peer)}
      </Shot>
      {/* 2c: экран — перенос, «Онлайн», 13:20 на месте */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={{ x: 540, y: 960, zoom: 1 }}>
        <ScreenInsert device="monitor" push={ramp(f, P.cutC, P.cutD)}>
          {week(0)}
        </ScreenInsert>
      </Shot>
      {/* 2d: уведомление заказчика — 13:30 */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={{ x: 540, y: 960, zoom: 1 }}>
        <CalendarBackdrop props={false} />
        <div style={box({ left: (1080 - NOTIFY.w) / 2 - 20, top: 640, width: NOTIFY.w, height: NOTIFY.h, transform: `scale(${pulse})`, transformOrigin: "50% 50%" })}>
          <NotifyCard x={0} y={0} appear={notifyA} />
        </div>
      </Shot>
      {/* 2e: 13:30 рядом с 13:20 */}
      <Shot f={f} from={P.cutE} to={P.cutF} cam={{ x: 540, y: 960, zoom: 1 }}>
        <ScreenInsert device="monitor" push={0.6 + 0.4 * ramp(f, P.cutE, P.cutF)}>
          {week(ramp(f, P.cutE + 2, P.cutE + 16))}
        </ScreenInsert>
      </Shot>
      {/* 2f: взгляд на кабинет директора */}
      <Shot f={f} from={P.cutF} to={P.len} cam={camMove(f, P.cutF, P.len, { x: 540, y: 1330, zoom: 1.3 }, { x: 610, y: 1290, zoom: 1.16 })}>
        {office(0)}
      </Shot>
    </>
  );
};

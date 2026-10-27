// Звуковые события ролика (кадры ролика) и маршруты шагов. Моменты берутся
// из тех же констант и траекторий, что и анимация сцен, поэтому шаги,
// стук посуды и вибрация совпадают с действием.
import type { GaitPlace } from "./rig/gait";
import type { LookId } from "./rig/looks";
import { TS2_SCENES, TS2_VIDEO, type Ts2SceneId } from "./script";
import type { Ts2Cue } from "./timing";
import { T1_MOM, T1_SON, T1_TEACHER } from "./scenes/Trip1";
import { L_MOM_IN, L_MOM_TABLE, L_SON_IN, LUNCH } from "./scenes/Lunch";
import { CALL } from "./scenes/Call";
import { R_MOM, R_SON, READY } from "./scenes/Ready";
import { T2, trip2Gate, T2_GIRL, T2_MOM } from "./scenes/Trip2";
import { E_DAD, EVE } from "./scenes/Evening";
import { PLAN } from "./scenes/Plan";

export type Ts2Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
export type Ts2Walk = {
  readonly start: number; // первый кадр сцены
  readonly place: (t: number) => GaitPlace;
  readonly from: number; // кадры сцены
  readonly to: number;
  readonly look: LookId;
  readonly child?: boolean;
  readonly volume: number;
};

const S = (id: Ts2SceneId) => Math.round(TS2_SCENES.find((s) => s.id === id)!.from * TS2_VIDEO.fps);
const OWN = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

export const ts2Sound = (cues: readonly Ts2Cue[]): { sfx: Ts2Sfx[]; walks: Ts2Walk[] } => {
  const m = S("morning");
  const t1 = S("trip1");
  const l = S("lunch");
  const c = S("call");
  const r = S("ready");
  const t2 = S("trip2");
  const e = S("evening");
  const p = S("plan");
  const cta = S("cta");
  const gate = trip2Gate(cues);
  const sfx: Ts2Sfx[] = [
    // утро: двор за окном, ноутбук придвигают, пиала
    { at: m, src: OWN("birds"), volume: 0.1, dur: 11.5, fade: 1 },
    { at: m + 20, src: COMMON("paper"), volume: 0.18 },
    { at: m + 120, src: OWN("cup"), volume: 0.18 },
    // первая поездка: школьный двор, звонок, улица, машина
    { at: t1, src: OWN("birds"), volume: 0.24, dur: 10.7, fade: 0.6 },
    { at: t1 + 4, src: COMMON("bell"), volume: 0.14 },
    { at: t1 + 318, src: COMMON("traffic"), volume: 0.26, dur: 2.4, fade: 0.4 },
    { at: t1 + 326, src: COMMON("car"), volume: 0.25 },
    // обед: дверь, рюкзак на полку, плита, ложка, тарелки, стул, ноутбук
    { at: l + 72, src: OWN("door-close"), volume: 0.3 },
    { at: l + 58, src: COMMON("paper"), volume: 0.2 },
    { at: l + 102, src: OWN("spoon"), volume: 0.22 },
    { at: l + 124, src: OWN("spoon"), volume: 0.18 },
    { at: l + 154, src: OWN("spoon"), volume: 0.2 },
    { at: l + 176, src: OWN("plate"), volume: 0.22 },
    { at: l + LUNCH.give, src: OWN("plate"), volume: 0.3 },
    { at: l + LUNCH.sit + 12, src: OWN("chair"), volume: 0.22 },
    { at: l + LUNCH.open + 6, src: OWN("laptop-open"), volume: 0.3 },
    { at: l + LUNCH.type, src: COMMON("typing"), volume: 0.12, dur: 0.3 },
    { at: l + 404, src: COMMON("typing"), volume: 0.16, dur: 1.4 },
    { at: l + 452, src: COMMON("typing"), volume: 0.1, dur: 0.9 },
    { at: l + 360, src: OWN("spoon"), volume: 0.14 },
    { at: l + 412, src: OWN("spoon"), volume: 0.12 },
    // звонок: печатает, вибрирует только телефон, ответ
    { at: c, src: COMMON("typing"), volume: 0.1, dur: 1.4 },
    { at: c + CALL.buzz, src: COMMON("vibrate"), volume: 0.45 },
    { at: c + CALL.buzz + 24, src: COMMON("vibrate"), volume: 0.4 },
    { at: c + CALL.answer, src: COMMON("tap"), volume: 0.25 },
    // сборы: телефон в сумку, ноутбук закрыт, стул, дверь
    { at: r + READY.inBag - 4, src: OWN("zip"), volume: 0.25 },
    { at: r + READY.close + 10, src: OWN("laptop-close"), volume: 0.35 },
    { at: r + READY.stand + 8, src: OWN("chair"), volume: 0.24 },
    { at: r + READY.pack, src: COMMON("paper"), volume: 0.18 },
    { at: r + READY.sonUp + 6, src: OWN("chair"), volume: 0.16 },
    { at: r + 392, src: OWN("door-open"), volume: 0.3 },
    // вторая поездка: салон (приглушённая улица), сообщение, ворота
    { at: t2, src: COMMON("traffic"), volume: 0.14, dur: 4.4, fade: 0.8 },
    { at: t2 + T2.buzz, src: COMMON("vibrate"), volume: 0.35 },
    { at: t2 + T2.buzz + 1, src: COMMON("notify"), volume: 0.25 },
    { at: t2 + T2.park - 8, src: OWN("belt"), volume: 0.18 },
    { at: t2 + gate - 8, src: COMMON("whoosh"), volume: 0.12 },
    { at: t2 + gate, src: OWN("birds"), volume: 0.22, dur: Math.max(0.5, (S("evening") - t2 - gate) / TS2_VIDEO.fps), fade: 0.4 },
    // вечер: чайник на столе, стул
    { at: e + EVE.put, src: OWN("cup"), volume: 0.25 },
    { at: e + EVE.sit + 6, src: OWN("chair"), volume: 0.2 },
    // решение: карточка, нажатия, заявка отправлена
    { at: p + PLAN.slide, src: COMMON("paper"), volume: 0.22 },
    { at: p + 166, src: COMMON("tap"), volume: 0.25 },
    { at: p + 174, src: COMMON("tap"), volume: 0.25 },
    { at: p + 182, src: COMMON("tap"), volume: 0.25 },
    { at: p + 190, src: COMMON("tap"), volume: 0.25 },
    { at: p + PLAN.tap, src: COMMON("tap"), volume: 0.35 },
    { at: p + PLAN.sent, src: COMMON("notify"), volume: 0.25 },
    { at: cta + 2, src: COMMON("chime"), volume: 0.2 },
  ];
  const walks: Ts2Walk[] = [
    { start: t1, place: T1_SON, from: 8, to: 120, look: "son", child: true, volume: 0.2 },
    { start: t1, place: T1_SON, from: 230, to: 322, look: "son", child: true, volume: 0.2 },
    { start: t1, place: T1_TEACHER, from: 4, to: 104, look: "teacher", volume: 0.22 },
    { start: t1, place: T1_MOM, from: 262, to: 322, look: "mom", volume: 0.28 },
    { start: l, place: L_MOM_IN, from: 4, to: 60, look: "mom", volume: 0.26 },
    { start: l, place: L_SON_IN, from: 0, to: 84, look: "son", child: true, volume: 0.2 },
    { start: l, place: L_MOM_TABLE, from: 196, to: 330, look: "mom", volume: 0.22 },
    { start: r, place: R_MOM, from: READY.walk - 2, to: 435, look: "mom", volume: 0.26 },
    { start: r, place: R_SON, from: READY.go, to: 435, look: "son", child: true, volume: 0.2 },
    { start: t2, place: T2_GIRL(gate), from: gate, to: Math.round(TS2_SCENES.find((s) => s.id === "trip2")!.to * TS2_VIDEO.fps) - t2, look: "daughter", child: true, volume: 0.2 },
    { start: t2, place: T2_MOM(gate), from: gate, to: Math.round(TS2_SCENES.find((s) => s.id === "trip2")!.to * TS2_VIDEO.fps) - t2, look: "mom", volume: 0.26 },
    { start: e, place: E_DAD, from: 0, to: EVE.sit, look: "dad", volume: 0.26 },
  ];
  return { sfx, walks };
};

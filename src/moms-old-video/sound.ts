// Звуковые события фильма №33 (кадры фильма). Моменты берутся из тех же
// констант и траекторий, что и анимация сцен, поэтому касания экрана,
// стул, молния, шаги и аплодисменты совпадают с действием.
import { contactFrames, trackOf, type GaitPlace } from "./rig/gait";
import { LOOKS, type LookId } from "./rig/looks";
import { MOV_VIDEO, sceneById, type MovSceneId } from "./script";
import type { MovCue } from "./timing";
import { danceContacts } from "./scenes/danceKit";
import { MOM_SEGS, MOVES, MOVES_MOM, MOVES_SON, SON_SEGS } from "./scenes/Moves";
import { sceneLen } from "./scenes/common";
import { workdayCuts } from "./scenes/Workday";
import { WISH } from "./scenes/Wish";
import { scheduleBeats } from "./scenes/Schedule";
import { balagoBeats } from "./scenes/Balago";
import { pickBeats } from "./scenes/Pick";
import { PACK, packSonPlace } from "./scenes/Packing";
import { COACH_SEGS, DAD_L, MOM_L, SON_L, ST, ST_MOM_SEGS } from "./scenes/Studio";
import { FAMILY_SEGS, FAMILY_SON_SEGS } from "./scenes/familyDance";
import { wordFrame } from "./scenes/common";

export type MovSfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
export type MovStep = { readonly at: number; readonly volume: number; readonly child?: boolean };

const FPS = MOV_VIDEO.fps;
const S = (id: MovSceneId) => Math.round(sceneById(id).from * FPS);
const OWN = (n: string) => `audio/moms-old-video/sfx/${n}.mp3`;
const TS2 = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

// шаги по походке (те же расчёты, что у Actor)
const walkSteps = (scene: MovSceneId, place: (t: number) => GaitPlace, look: LookId, from: number, to: number, volume: number): MovStep[] => {
  const tr = trackOf(place, 0, sceneLen(scene), LOOKS[look].build.stride);
  return contactFrames(tr)
    .filter((f) => f >= from && f <= to)
    .map((f) => ({ at: S(scene) + f, volume, child: look === "son" || look === "sonSchool" }));
};

export const movSound = (cues: readonly MovCue[]): { sfx: MovSfx[]; steps: MovStep[] } => {
  const h = S("hook");
  const m = S("moves");
  const c = S("cta");
  const st = S("studio");
  const nv = S("newVideo");
  const sfx: MovSfx[] = [
    // 1. старая запись: зал (тихо), касание стопы о сцену; сын держит телефон
    { at: h + 25, src: TS2("step-soft-1"), volume: 0.25 },
    { at: h + 60, src: OWN("applause"), volume: 0.1, dur: 1.6, fade: 0.5 },
    // мама печатает за ноутбуком, пока сын не спросил
    { at: h + 112, src: COMMON("typing"), volume: 0.07, dur: 1.2, fade: 0.2 },
    // 5. стул отодвигается, танец, смех
    { at: m + 10, src: OWN("chair"), volume: 0.35 },
    // 14. финал: деталь собирается, кнопка
    { at: c + 6, src: OWN("swoosh"), volume: 0.25 },
    { at: c + 30, src: OWN("chime"), volume: 0.22 },
    ...more(cues),
  ];
  const steps: MovStep[] = [
    ...walkSteps("moves", MOVES_MOM, "momHome", MOVES.walk[0], MOVES.walk[1] + 30, 0.13),
    ...walkSteps("moves", MOVES_SON, "son", 10, 70, 0.09),
    ...danceContacts(MOM_SEGS, "momHome", 90, 420).map((f) => ({ at: m + f, volume: 0.12 })),
    ...danceContacts(SON_SEGS, "son", 230, 420).map((f) => ({ at: m + f, volume: 0.09, child: true })),
    // 11. сын приносит вещи
    ...walkSteps("packing", packSonPlace, "son", PACK.walk[0], PACK.walk[1] + 20, 0.08),
    // 12. студия: шаг тренера и мамы; гостиная: шаг, сын, папа, мама
    ...danceContacts(COACH_SEGS, "coach", 0, ST.cut - 1).map((f) => ({ at: st + f, volume: 0.07 })),
    ...danceContacts(ST_MOM_SEGS, "momDance", 0, 176).map((f) => ({ at: st + f, volume: 0.1 })),
    ...walkSteps("studio", SON_L, "son", ST.give[0], sceneLen("studio"), 0.08),
    ...walkSteps("studio", DAD_L, "dad", ST.dadWalk[0], sceneLen("studio"), 0.11),
    ...walkSteps("studio", MOM_L, "momDance", 280, sceneLen("studio"), 0.1),
    // 13. семейный танец
    ...danceContacts(FAMILY_SEGS, "momDance", 0, sceneLen("newVideo") - 1).map((f) => ({ at: nv + f, volume: 0.11 })),
    ...danceContacts(FAMILY_SON_SEGS, "son", 0, sceneLen("newVideo") - 1).map((f) => ({ at: nv + f, volume: 0.08, child: true })),
  ];
  return { sfx, steps };
};

// Сцены 2–4 и 6–13: касания, ключи, дверь и ремень, молния, сумка.
const more = (cues: readonly MovCue[]): MovSfx[] => {
  const w2 = S("workday");
  const wd = workdayCuts(cues);
  const ev = S("evening");
  const evLen = sceneLen("evening");
  const rm = S("remember");
  const ws = S("wish");
  const sc = S("schedule");
  const sb = scheduleBeats(cues);
  const rt = S("route");
  const bl = S("balago");
  const bb = balagoBeats(cues);
  const pk = S("pick");
  const pb = pickBeats(cues);
  const pa = S("packing");
  const st = S("studio");
  const nv = S("newVideo");
  return [
    // 2. ключи со стола, дверь машины за кадром, щелчок ремня, машина трогается
    { at: w2 + wd.keys, src: TS2("keys"), volume: 0.3 },
    { at: w2 + wd.cutF - 2, src: TS2("car-door"), volume: 0.28 },
    { at: w2 + wd.click, src: TS2("belt"), volume: 0.4 },
    { at: w2 + wd.go, src: COMMON("car"), volume: 0.12, dur: 1.4, fade: 0.6 },
    // 3. клавиатура в офисе и дома, тап по видео в галерее
    { at: ev + 0, src: COMMON("typing"), volume: 0.12, dur: 1.0, fade: 0.2 },
    { at: ev + 52, src: COMMON("typing"), volume: 0.1, dur: 1.4, fade: 0.3 },
    { at: ev + evLen - 80, src: OWN("tap"), volume: 0.3 },
    // 4. крышка ноутбука, повторный запуск записи, аплодисменты в записи после поклона
    { at: rm + 22, src: TS2("laptop-close"), volume: 0.3 },
    { at: rm + 34, src: OWN("tap"), volume: 0.28 },
    { at: rm + 70, src: OWN("applause"), volume: 0.12, dur: 1.4, fade: 0.5 },
    // 6. наезд в экран — мягкий проход в воспоминание и обратно
    { at: ws + WISH.push[0], src: OWN("swoosh"), volume: 0.12 },
    { at: ws + WISH.back[0] - 4, src: OWN("swoosh"), volume: 0.08 },
    // 7. палец на 19:00, телефон уходит в схему, полосы ложатся на шкалу
    { at: sc + sb.glowAt, src: OWN("tap"), volume: 0.25 },
    { at: sc + sb.at.card - 8, src: OWN("swoosh"), volume: 0.12 },
    { at: sc + sb.at.bar1, src: COMMON("pop"), volume: 0.12 },
    { at: sc + sb.at.bar2, src: COMMON("pop"), volume: 0.12 },
    // 8. схема: бала багуучу, путь
    { at: rt + wordFrame(cues, "n07", 2), src: COMMON("pop"), volume: 0.12 },
    { at: rt + wordFrame(cues, "n08", 0), src: COMMON("whoosh"), volume: 0.08 },
    // 9. кнопка, поля, отправка
    { at: bl + bb.tap1, src: OWN("tap"), volume: 0.28 },
    { at: bl + bb.fills[0], src: COMMON("typing"), volume: 0.08, dur: 1.6, fade: 0.3 },
    { at: bl + bb.tap2, src: OWN("tap"), volume: 0.28 },
    { at: bl + bb.sentAt, src: OWN("chime"), volume: 0.14 },
    // 10. выбор пробного занятия, сумка ложится на диван
    { at: pk + pb.pickAt, src: OWN("tap"), volume: 0.28 },
    { at: pk + pb.dayAt, src: COMMON("pop"), volume: 0.1 },
    { at: pk + pb.move[1], src: TS2("step-soft-2"), volume: 0.3 },
    // 11. бутылка и полотенце в сумку, молния
    { at: pa + PACK.put1[1] - 4, src: TS2("step-soft-1"), volume: 0.22 },
    { at: pa + PACK.put2[1] - 4, src: TS2("step-soft-3"), volume: 0.16 },
    { at: pa + PACK.zip[0], src: OWN("zip"), volume: 0.35 },
    // 12. сын берёт телефон с дивана
    { at: st + ST.grab[1] - 2, src: OWN("tap"), volume: 0.15 },
    // 13. запись пошла
    { at: nv + 2, src: OWN("tap"), volume: 0.18 },
  ];
};

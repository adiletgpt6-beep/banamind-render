// План сцены шага 3 (кадры сцены) по фактической речи диктора n03.
// Один и тот же план используют сцена (Step3.tsx), диорама
// (step3-diorama.tsx) и звуковые эффекты — всё сдвигается вместе с
// озвучкой. Числа в комментариях — для текущей озвучки (30 fps).
import { clamp, cruise, lerp } from "../rig/motion";

export type Step3Words = {
  readonly F: number; // длина сцены
  readonly from: number; // начало n03 (≈30)
  readonly top: number; // «топ» (≈41)
  readonly tuz: number; // «түзүлгөндө» (≈46)
  readonly bir: number; // «биринчи» (≈74)
  readonly tol: number; // «толук» (≈94)
  readonly syn: number; // «сыноо» (≈104)
  readonly sap: number; // «сапары» (≈113)
  readonly aky: number; // «акысыз» (≈131)
  readonly otot: number; // «өтөт» (≈145)
  readonly ert: number; // «эртең» (≈172)
  readonly sab: number; // «сабактан» (≈216)
  readonly kai: number; // «кайра» (≈244)
};

export const step3Plan = (w: Step3Words) => {
  // панель 3 разворачивается до речи
  const u0 = Math.max(7, w.from - 22);
  const u1 = u0 + 19;
  // лист наклоняется к маме и становится «полом» книжки-раскладушки
  const tiltA = Math.max(u1 + 10, w.tuz + 8);
  const tiltB = tiltA + 26;
  // слои встают по очереди: небо и горы → дом и тополя → школа → улица
  // (вся диорама стоит до «акысыз», чтобы акцент пришёлся на готовую сцену)
  const school = Math.max(tiltA + 30, Math.min(w.tol, w.aky - 46));
  const pop = {
    sky: tiltA + 3,
    far: tiltA + 8,
    near: tiltA + 12,
    house: tiltA + 18,
    back: tiltA + 22,
    school,
    front: school + 7,
    road: school + 10,
    shrubs: school + 14,
    car: school + 18,
    mom: school + 25,
    girl: school + 28,
  };
  // утро: солнце встаёт, девочка идёт к машине, машина едет к школе
  const sunA = w.ert - 26;
  const sunB = w.ert - 4;
  const boardA = w.ert - 24;
  const boardB = w.ert - 4;
  const d1A = w.ert + 2;
  const d1B = d1A + 22;
  // дети идут к дверям школы
  const ulA = d1B + 1;
  const ulB = Math.max(ulA + 14, Math.min(w.sab, ulA + 22));
  // уроки идут: солнце проходит по небу, машина разворачивается
  const noonA = Math.max(ulB, w.sab);
  const noonB = noonA + 16;
  // после уроков: дети выходят из школы, пока солнце идёт по небу,
  // идут к машине, обратно домой, мама встречает
  const ldA = noonA + 6;
  const ldB = ldA + 20;
  const d2A = Math.max(w.kai, ldB + 3);
  const d2B = d2A + 24;
  const mtA = d2B + 1;
  const mtB = mtA + 22;
  // конец: диорама складывается (сзади вперёд), плашка условия
  // возвращается на бумагу, пока небо ещё закрывает панель 2, лист
  // ложится, камера к сгибу 4
  const downA = Math.max(mtB + 10, w.F - 56);
  const downB = downA + 30;
  const flatA = downA + 14;
  const flatB = flatA + 20;
  const chipA = downA + 4;
  const chipB = downA + 16;
  const headA = downA + 11;
  const headB = downA + 18;
  const camA = w.F - 34;
  const camB = w.F - 8;
  // камера: медленный наезд к подъезду (≈ 34 кадра), поездки — одним
  // ходом за машиной, отъезд сразу после встречи (≈ 54 кадра до сгиба 4)
  const zoomA = Math.max(w.aky + 3, w.otot - 12);
  const cam1A = d1A - 6;
  const cam1B = d1B + 6;
  const cam2A = d2A - 6;
  const cam2B = d2B + 6;
  const meetCam = mtB + 2;
  const awayCam = meetCam + 16;
  const backCam = Math.max(awayCam + 12, camB - 22);
  return {
    u0,
    u1,
    label: w.top,
    tiltA,
    tiltB,
    pop,
    head: w.bir,
    aky: w.aky,
    badge: pop.school,
    route: w.otot,
    am: w.ert,
    pm: w.sab,
    sunA,
    sunB,
    boardA,
    boardB,
    d1A,
    d1B,
    ulA,
    ulB,
    noonA,
    noonB,
    ldA,
    ldB,
    d2A,
    d2B,
    mtA,
    mtB,
    downA,
    downB,
    flatA,
    flatB,
    chipA,
    chipB,
    headA,
    headB,
    camA,
    camB,
    zoomA,
    cam1A,
    cam1B,
    cam2A,
    cam2B,
    meetCam,
    awayCam,
    backCam,
    F: w.F,
  };
};

export type Step3Plan = ReturnType<typeof step3Plan>;

// Машина (u — поперёк панели 3): у дома → у школы утром, обратно после
// уроков; разгон и торможение — cruise. Общая для диорамы и камеры.
export const CAR_HOME = 300;
export const CAR_SCHOOL = 456;
export const carTrip = (f: number, P: Step3Plan) => ({
  p1: cruise(clamp((f - P.d1A) / (P.d1B - P.d1A)), 0.3),
  p2: cruise(clamp((f - P.d2A) / (P.d2B - P.d2A)), 0.3),
});
export const carU = (f: number, P: Step3Plan) => {
  const { p1, p2 } = carTrip(f, P);
  return f < P.d2A ? lerp(CAR_HOME, CAR_SCHOOL, p1) : lerp(CAR_SCHOOL, CAR_HOME, p2);
};

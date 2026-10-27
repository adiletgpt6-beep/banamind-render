// Сцены 2–3 (1-й день, офис).
// 2. «Күтүлгөн сунуш»: письмо разворачивается, ключевая фраза в мягкой
//    рамке. Кабинет: коллега заглядывает в дверь. Разговор снят крупными
//    планами того, кто говорит: «Куттуктайм!» — общий план (Айжан
//    оборачивается, удивление → радость), «Сен ушуну каалап жүргөн эмес
//    белең?» — коллега крупно (искренняя радость за неё, один открытый жест
//    ладонью к ней), «Ооба. Бир нерсени ойлонуп алышым керек.» — Айжан
//    крупно: улыбка и кивок, затем улыбка гаснет, взгляд уходит в сторону
//    (задумчивость). Общий план: коллега кивает и уходит из кадра, Айжан
//    возвращается к монитору.
// 3. «Бүтө элек жооп»: Айжан печатает начало ответа (UL2_LETTER.draft) и
//    останавливается; приходит одно напоминание «Мектепке баруу» — она
//    смотрит на часы, сохраняет черновик («Кара нуска сакталды»),
//    блокирует экран, берёт ключи, встаёт и уходит. Набранный текст не
//    пропадает: черновик сохранён.
import { fontFamily } from "../../fonts";
import { Icon } from "../graphics/Icons";
import { LetterScreen, Pointer, type LetterView } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeOut, keys, keysV } from "../rig/motion";
import { UL2_LETTER, UL2_TEXT } from "../script";
import { DeskFront, DeskTop, KeysOnDesk, LaptopFront, OFFICE, OfficeBack, OfficeChair, Organizer } from "../sets/Office";
import { HOME } from "../sets/Home";
import { LaptopOver, SCREEN, type HandsState } from "../graphics/LaptopOver";
import { C } from "../theme";
import { seated, seatOf, standUp, typingAt } from "./common";
import { box, PanelArea, Stage, useScene } from "./kit";

export const OFFICE_MOM = seated("mom", OFFICE.mom);
// Кисти на клавиатуре за крышкой ноутбука (мировые координаты): при печати
// кисти чуть опускаются на нажатиях (видно по предплечьям), иначе лежат.
export const typingArms = (tt: number, typing: boolean, from = 0): Pick<PoseIn, "armL" | "armR"> => {
  const k = OFFICE.keyboard;
  const tl = typing ? typingAt(tt, from, -1) : { tap: -1, shift: 0 };
  const tr = typing ? typingAt(tt, from, 1) : { tap: -1, shift: 0 };
  return {
    armL: { target: { x: k.x - 48 + tl.shift * 6, y: k.y + (tl.tap >= 0 ? 4 : 0) }, shape: typing ? "type" : "relax", tap: tl.tap, elbow: "hang", behind: false },
    armR: { target: { x: k.x + 44 + tr.shift * 6, y: k.y + (tr.tap >= 0 ? 4 : 0) }, shape: typing ? "type" : "relax", tap: tr.tap, elbow: "hang", behind: false },
  };
};

// Кабинет: вид спереди на Айжан за столом. Порядок слоёв: стена, коллега у
// двери, кресло, Айжан (тело), стол, предметы на столе, её руки, ноутбук
// (крышка закрывает кисти на клавиатуре).
export const OfficeStage: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly cam: { x: number; y: number; zoom: number };
  readonly momPose: (tt: number) => PoseIn;
  readonly momFace: (tt: number) => number;
  readonly lid?: number; // крышка ноутбука 0…1
  readonly doorOpen?: number;
  readonly behindDesk?: React.ReactNode; // коллега у двери и т. п.
  readonly onDesk?: React.ReactNode; // предметы на столе (до рук)
  readonly blinks?: readonly number[];
  readonly momPlace?: (tt: number) => Place;
  readonly momFull?: boolean; // встала: рисуется целиком за столом
}> = ({ f, uid, cam, momPose, momFace, lid = 1, doorOpen = 0, behindDesk, onDesk, blinks, momPlace, momFull = false }) => (
  <Stage cam={cam} bg="#E4E9F0">
    <OfficeBack doorOpen={doorOpen} />
    {behindDesk}
    <OfficeChair />
    <Actor uid={`${uid}-b`} look="aizhan" f={f} place={momPlace ?? (() => OFFICE_MOM)} face={momFace} pose={momPose} role="mother" seed={11} blinks={blinks} layer={momFull ? undefined : "body"} walkFrom={0} />
    <DeskFront />
    <DeskTop />
    <Organizer />
    {onDesk}
    {momFull ? null : <Actor uid={`${uid}-a`} look="aizhan" f={f} place={momPlace ?? (() => OFFICE_MOM)} face={momFace} pose={momPose} role="mother" seed={11} blinks={blinks} layer="arms" walkFrom={0} />}
    <LaptopFront open={lid} />
  </Stage>
);

// Экран ноутбука — тот же экран почты (в плане через плечо).
export const Screen: React.FC<{ v: LetterView }> = ({ v }) => <LetterScreen w={SCREEN.w} h={SCREEN.h} v={v} />;

const TOP_Y = HOME.table.top;

// Число нажатий (серии typingAt обеих рук) от from до t — для набора текста.
export const tapsUntil = (t: number, from: number) => {
  let n = 0;
  for (let k = from; k <= t; k++) {
    for (const side of [-1, 1] as const) {
      const a = typingAt(k, from, side).tap;
      const b = typingAt(k - 1, from, side).tap;
      if (a >= 0 && b < 0) n++;
    }
  }
  return n;
};

// Указатель мыши на экране (координаты SCREEN).
const ScreenPointer: React.FC<{ x: number; y: number; press: number; a?: number }> = ({ x, y, press, a = 1 }) => <Pointer x={x} y={y} press={press} opacity={a} />;

// ---------- 2. Долгожданное предложение ----------
// Планы: через плечо (читает письмо) → спереди (реакция, стук) → общий
// (коллега в дверях) → коллега крупно → Айжан крупно → общий (коллега
// уходит, она возвращается к ноутбуку).
const CAM = {
  wide: { x: 600, y: 1000, zoom: 0.84 },
  front: { x: 850, y: 1010, zoom: 1.6 },
  momClose: { x: 850, y: 975, zoom: 2.0 },
  colClose: { x: 260, y: 1010, zoom: 1.45 },
} as const;
export const OfferScene: React.FC = () => {
  const { f, from, to, word } = useScene("offer");
  const c01 = from("c01");
  const m01 = from("m01");
  const read = 62; // через плечо (письмо раскрывается) → спереди
  const knock = 68; // дверь открывается
  const wideA = 82;
  const colClose = word("c01", 1) - 4; // «Сен ушуну…» — коллега крупно
  const momClose = to("c01") + 6; // ответ Айжан — она крупно
  const wideB = to("m01") + 14; // общий план: коллега уходит
  const leave = wideB + 8;
  const hl = easeOut((f - 22) / 14);
  const doorOpen = keys(f, [[knock, 0], [knock + 12, 1], [leave + 30, 1], [leave + 46, 0.05]]);
  // Айжан: читает → тихая радость (улыбка, выдох, откидывается) → стук,
  // поворот к двери (удивление → радость) → «Ооба» с улыбкой и кивком →
  // «Бир нерсени…» — улыбка гаснет, взгляд в сторону → снова к ноутбуку
  const turn = knock + 4;
  const fade = word("m01", 1);
  const momFace = (tt: number) => keys(tt, [[0, 0], [turn, 0], [turn + 12, -0.8], [wideB, -0.8], [wideB + 24, 0]]);
  const momPose = (tt: number): PoseIn => ({
    expr: tt < read - 6 ? "calm" : tt < turn + 4 ? "smile" : tt < c01 + 6 ? "surprised" : tt < fade + 4 ? "smile" : tt < wideB + 20 ? "softSmile" : "thinking",
    sit: 1,
    seat: seatOf(OFFICE_MOM),
    ...typingArms(tt, false),
    lookY: keys(tt, [[0, 0.35], [read, 0.35], [read + 8, 0.05], [fade + 6, 0.05], [fade + 16, 0.2], [to("m01"), 0.2], [wideB + 20, 0.35]]),
    // на «Бир нерсени ойлонуп…» взгляд уходит в сторону — задумалась
    lookX: keys(tt, [[fade, 0], [fade + 10, 0.5], [to("m01") + 4, 0.5], [to("m01") + 14, 0]]),
    nod: keys(tt, [[m01 - 2, 0], [m01 + 5, 5], [m01 + 14, 0]]),
    headTilt: keys(tt, [[c01, 0], [c01 + 12, -3], [fade, -3], [fade + 12, 2]]),
    // прочитав, на миг откидывается назад и выдыхает
    lean: keys(tt, [[read, 0], [read + 10, -4], [turn, -2], [turn + 14, -3], [wideB, -3], [wideB + 24, 3]]),
    exhale: keys(tt, [[read + 2, 0], [read + 10, 0.6], [read + 22, 0]]),
  });
  // коллега в дверях: рука на косяке; «Куттуктайм!» — ладонь поднимается
  // (рад за неё); «Сен ушуну…» — открытая ладонь к ней; слушает, кивает,
  // уходит из кадра
  const colPlace = (tt: number) => ({ x: keys(tt, [[0, 205], [leave, 205], [leave + 44, -160]], (x) => x), y: 1500, h: 800 });
  const sh = { x: 270, y: 1500 - 600 };
  const colPose = (tt: number): PoseIn => ({
    expr: tt < c01 - 8 ? "softSmile" : tt < to("c01") + 4 ? "smile" : tt < leave ? "softSmile" : "calm",
    armL: tt < leave - 4 ? { target: { x: 92, y: 1500 - 560 }, shape: "open", elbow: "out" } : { target: null, shape: "relax" },
    armR: tt < leave - 4
      ? {
          target: keysV(tt, [[0, { x: 250, y: 1500 - 400 }], [c01 - 6, { x: 250, y: 1500 - 400 }], [c01 + 6, { x: sh.x + 40, y: sh.y - 10 }], [colClose, { x: sh.x + 40, y: sh.y }], [colClose + 12, { x: sh.x + 120, y: sh.y + 80 }], [to("c01") - 2, { x: sh.x + 125, y: sh.y + 84 }], [to("c01") + 12, { x: 250, y: 1500 - 400 }]], anticipate),
          shape: tt > c01 - 4 && tt < to("c01") + 4 ? "open" : "relax",
          elbow: "down",
        }
      : { target: null, shape: "relax" },
    headTilt: keys(tt, [[colClose, 0], [colClose + 12, 4], [to("c01"), 4], [to("c01") + 14, 0]]),
    lookY: keys(tt, [[0, 0.1], [c01, 0.1]]),
    nod: keys(tt, [[m01 + 2, 0], [m01 + 10, 4], [m01 + 20, 0], [to("m01") + 2, 0], [to("m01") + 10, 3], [to("m01") + 20, 0]]),
  });
  const shot = f < read ? "over" : f < wideA ? "front" : f < colClose ? "wide" : f < momClose ? "colClose" : f < wideB ? "momClose" : "wide";
  return (
    <PanelArea>
      {shot === "over" ? (
        <LaptopOver screen={<Screen v={{ f, offerHL: hl, showReply: false }} />} hands={{ mode: "rest" }} />
      ) : (
        <OfficeStage
          f={f}
          uid="o2"
          cam={CAM[shot]}
          momFace={momFace}
          momPose={momPose}
          doorOpen={doorOpen}
          behindDesk={f > knock + 4 && f < leave + 50 ? <Actor uid="o2-col" look="colleague" f={f} place={colPlace} face={(tt) => (tt < leave ? 0.75 : -0.8)} pose={colPose} role="colleague" seed={21} walkFrom={leave - 2} /> : null}
          onDesk={<KeysOnDesk />}
        />
      )}
    </PanelArea>
  );
};

// ---------- 3. Незаконченный ответ ----------
// Через плечо: печатает начало ответа (каждая серия нажатий добавляет
// буквы), останавливается; на экране появляется напоминание «Мектепке
// баруу». Спереди: смотрит на напоминание, на часы. Через плечо: правая
// рука на тачпаде, курсор к «Кара нуска», щелчок — «Кара нуска сакталды».
// Спереди: закрывает крышку, берёт ключи, встаёт и уходит к двери.
const Toast: React.FC<{ a: number }> = ({ a }) => (
  <div style={box({ right: 40, top: 610, width: 560, height: 120, borderRadius: 24, backgroundColor: C.dark, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", fontFamily, opacity: a, translate: `${(1 - a) * 80}px 0`, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" })}>
    <div style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: "#8FD3A6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon id="school" size={48} color={C.ink} stroke={4} />
    </div>
    <div style={{ fontSize: 50, fontWeight: 900, color: C.text }}>{UL2_TEXT.reminder}</div>
  </div>
);

export const DraftScene: React.FC = () => {
  const { f, at } = useScene("draft");
  const typeFrom = 4;
  const draftLen = [...UL2_LETTER.draft].length;
  const typed = Math.min(draftLen, Math.round(tapsUntil(f, typeFrom) * 1.4));
  const typing = typed < draftLen;
  const stopAt = (() => {
    for (let k = typeFrom; k < 200; k++) if (Math.round(tapsUntil(k, typeFrom) * 1.4) >= draftLen) return k;
    return 60;
  })();
  const remind = at(MOMENTS.reminder);
  const frontCut = remind + 4;
  const watch = frontCut + 10;
  const saveCut = at(MOMENTS.saved) - 12;
  const savedAt = at(MOMENTS.saved);
  const backCut = savedAt + 12;
  const lidFrom = backCut + 2;
  const lidTo = lidFrom + 12;
  const grab = lidTo + 6;
  const lift = grab + 6;
  const rise = lift + 2;
  const walk = rise + 14;
  const remA = easeOut((f - remind) / 8);
  const k = OFFICE.keys;
  const L = OFFICE.laptop;
  const standAt = (tt: number) => standUp(tt, rise, 26);
  const momPlace = (tt: number): Place => ({ x: keys(tt, [[walk, OFFICE_MOM.x], [walk + 32, OFFICE_MOM.x - 540]], (x) => cruise(x, 0.3)), y: OFFICE_MOM.y, h: OFFICE_MOM.h });
  const lidEdge = (tt: number) => {
    const o = keys(tt, [[lidFrom, 1], [lidTo, 0]]);
    return TOP_Y - 4 - 14 - (L.h - 14) * Math.sin((o * Math.PI) / 2);
  };
  const momPose = (tt: number): PoseIn => {
    const base = typingArms(tt, tt >= typeFrom && tt < stopAt, typeFrom);
    const st = standAt(tt);
    const glance = tt > watch - 4 && tt < watch + 22;
    const closing = tt >= lidFrom - 6 && tt < lidTo + 4;
    return {
      expr: tt < remind ? "thinking" : tt < savedAt ? "apologetic" : "calm",
      sit: st.sit,
      lean: st.lean,
      seat: seatOf(OFFICE_MOM),
      // левая рука: часы → край крышки (закрывает) → вдоль тела
      armL:
        tt >= rise
          ? { target: null, shape: "relax" }
          : closing
            ? { target: { x: L.cx - 70, y: lidEdge(tt) + 6 }, shape: "open", elbow: "down", behind: false }
            : glance
              ? { target: { x: OFFICE_MOM.x - 50, y: OFFICE_MOM.y - 0.62 * OFFICE_MOM.h }, shape: "relax", elbow: "down", behind: false, wrist: 70 }
              : base.armL,
      // правая рука: край крышки → ключи → держит их
      armR:
        tt < lidFrom - 6
          ? base.armR
          : closing
            ? { target: { x: L.cx + 70, y: lidEdge(tt) + 6 }, shape: "open", elbow: "down", behind: false }
            : tt >= rise + 26
              ? { target: { x: momPlace(tt).x + 0.07 * OFFICE_MOM.h, y: OFFICE_MOM.y - 0.42 * OFFICE_MOM.h }, shape: "fist", item: "keys", elbow: "down", behind: false }
              : {
                  target: keysV(tt, [[lidTo + 4, { x: L.cx + 70, y: TOP_Y - 30 }], [grab, { x: k.x + 4, y: k.y - 14 }], [lift, { x: k.x + 4, y: k.y - 14 }], [lift + 12, { x: OFFICE_MOM.x + 70, y: OFFICE_MOM.y - 0.5 * OFFICE_MOM.h }], [rise + 26, { x: OFFICE_MOM.x + 50, y: OFFICE_MOM.y - 0.42 * OFFICE_MOM.h }]], anticipate),
                  shape: tt > grab - 4 ? "fist" : "open",
                  item: tt > lift - 2 ? "keys" : "none",
                  elbow: "down",
                  behind: false,
                },
      lookY: keys(tt, [[frontCut, 0.3], [watch - 4, 0.3], [watch + 2, 0.75], [watch + 20, 0.75], [watch + 26, 0.3], [grab - 6, 0.55], [lift + 8, 0.1]]),
      lookX: keys(tt, [[watch - 4, 0], [watch + 2, -0.2], [watch + 20, -0.2], [grab - 6, 0.55], [lift + 8, 0]]),
    };
  };
  // встав, поворачивается к двери (влево)
  const momFace = (tt: number) => keys(tt, [[0, 0], [rise + 12, 0], [walk, -0.8]]);
  const shot = f < frontCut ? "over" : f < saveCut ? "front" : f < backCut ? "over" : "go";
  // экран: печать → напоминание → курсор к «Кара нуска» и щелчок
  const padFrom = saveCut + 2;
  const chip = { x: 120, y: 470 }; // метка черновика (координаты SCREEN)
  const ptr = keysV(f, [[padFrom, { x: 640, y: 640 }], [savedAt - 3, chip]], anticipate);
  const press = keys(f, [[savedAt - 3, 0], [savedAt, 1], [savedAt + 5, 0]]);
  const hands: HandsState = f < saveCut ? (f < stopAt ? { mode: "type", tapL: typingAt(f, typeFrom, -1).tap, tapR: typingAt(f, typeFrom, 1).tap, shift: typingAt(f, typeFrom, -1).shift } : { mode: "type", tapL: -1, tapR: -1 }) : { mode: "pad", px: 0.3 + 0.4 * clamp((ptr.x - 120) / 520), py: 0.2 + 0.5 * clamp((ptr.y - 470) / 170), press };
  return (
    <PanelArea>
      {shot === "over" ? (
        <LaptopOver
          screen={
            <>
              <Screen v={{ f, draft: typed / draftLen, typing, saved: clamp((f - savedAt) / 6) }} />
              <Toast a={remA} />
              {f >= padFrom ? <ScreenPointer x={ptr.x} y={ptr.y} press={press} a={easeOut((f - padFrom) / 6)} /> : null}
            </>
          }
          hands={hands}
        />
      ) : (
        <OfficeStage
          f={f}
          uid="o3"
          cam={shot === "front" ? { x: 850, y: 1000, zoom: keys(f, [[frontCut, 1.75], [saveCut, 1.82]]) } : { x: keys(f, [[walk, 900], [walk + 32, 740]]), y: 1030, zoom: 1.25 }}
          momFace={momFace}
          momPose={momPose}
          momPlace={momPlace}
          momFull={f >= rise}
          lid={keys(f, [[lidFrom, 1], [lidTo, 0]])}
          onDesk={f < lift ? <KeysOnDesk /> : null}
        />
      )}
    </PanelArea>
  );
};

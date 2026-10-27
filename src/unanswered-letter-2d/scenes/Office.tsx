// Сцены 2–3 (1-й день, офис).
// 2. «Күтүлгөн сунуш»: письмо разворачивается, ключевая фраза в мягкой
//    рамке. Карточка становится живой сценой кабинета: коллега заглядывает
//    в дверь — «Куттуктайм! Сен ушуну каалап жүргөн эмес белең?» Айжан
//    с улыбкой и небольшой паузой: «Ооба. Бир нерсени ойлонуп алышым
//    керек.» Улыбка замедляется, взгляд возвращается к монитору. Коллега
//    не давит и уходит.
// 3. «Бош жооп»: крупный план того же черновика — Айжан печатает
//    начало ответа (UL2_LETTER.draft) и останавливается; 1–2 с пустого продолжения
//    и курсора. Одно напоминание «Мектепке баруу» (мягкий сигнал). Айжан
//    смотрит на часы, берёт ключи и блокирует рабочий экран; карточка
//    письма уходит вниз, активной становится тема «Мектеп».
import { fontFamily } from "../../fonts";
import { Icon } from "../graphics/Icons";
import { LetterScreen, type LetterView } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { DeskFront, DeskTop, Keyboard, KeysOnDesk, Monitor, OFFICE, OfficeBack, OfficeChair, SCREEN } from "../sets/Office";
import { C } from "../theme";
import { seated, seatOf } from "./common";
import { box, crossfade, PanelArea, Stage, usePanel, useScene } from "./kit";

export const OFFICE_MOM = seated("mom", OFFICE.mom);
// Кисти на клавиатуре (печатает) — мировые координаты.
export const typingArms = (tt: number, typing: boolean): Pick<PoseIn, "armL" | "armR"> => {
  const k = OFFICE.keyboard;
  const jig = (s: number) => (typing ? Math.sin(tt * 1.3 + s) * 5 : 0);
  return {
    armL: { target: { x: k.x - 70 + jig(0), y: k.y - 14 + Math.abs(jig(1)) * 0.6 }, shape: "relax", elbow: "down", behind: false },
    armR: { target: { x: k.x + 40 + jig(2), y: k.y - 14 + Math.abs(jig(3)) * 0.6 }, shape: "relax", elbow: "down", behind: false },
  };
};

// Кабинет целиком: фон, кресло, Айжан (тело — до столешницы, руки — после),
// монитор с экраном, предметы на столе.
export const OfficeStage: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly cam: { x: number; y: number; zoom: number };
  readonly momPose: (tt: number) => PoseIn;
  readonly momFace: (tt: number) => number;
  readonly screen: React.ReactNode;
  readonly lock?: number;
  readonly doorOpen?: number;
  readonly behindDesk?: React.ReactNode; // коллега у двери и т. п.
  readonly onDesk?: React.ReactNode; // предметы на столе (до рук)
  readonly blinks?: readonly number[];
  readonly opacity?: number;
}> = ({ f, uid, cam, momPose, momFace, screen, lock = 0, doorOpen = 0, behindDesk, onDesk, blinks, opacity = 1 }) => (
  <Stage cam={cam} bg="#E4E9F0" opacity={opacity}>
    <OfficeBack doorOpen={doorOpen} />
    {behindDesk}
    <OfficeChair />
    <Actor uid={`${uid}-b`} look="aizhan" f={f} place={() => OFFICE_MOM} face={momFace} pose={momPose} role="mother" seed={11} blinks={blinks} layer="body" />
    <DeskFront />
    <DeskTop />
    <Monitor screen={screen} lock={lock} />
    <Keyboard />
    {onDesk}
    <Actor uid={`${uid}-a`} look="aizhan" f={f} place={() => OFFICE_MOM} face={momFace} pose={momPose} role="mother" seed={11} blinks={blinks} layer="arms" />
  </Stage>
);

// Экран монитора — тот же экран почты.
export const Screen: React.FC<{ v: LetterView }> = ({ v }) => <LetterScreen w={SCREEN.w} h={SCREEN.h + 260} v={v} />;


// ---------- 2. Долгожданное предложение ----------
export const OfferScene: React.FC = () => {
  const { f, from, to } = useScene("offer");
  const r = usePanel();
  const c01 = from("c01");
  const m01 = from("m01");
  const cut = 54; // письмо → кабинет
  const knock = c01 - 16;
  const leave = to("m01") + 26;
  // письмо: разворачивается и выделяется ключевая фраза
  const open = easeOut((f + 2) / 14);
  const hl = easeOut((f - 16) / 12);
  const officeA = crossfade(f, cut, 10);
  const doorOpen = keys(f, [[knock - 10, 0], [knock, 1], [leave + 10, 1], [leave + 26, 0.05]]);
  // Айжан: смотрит на экран → поворачивается к двери с улыбкой → пауза →
  // улыбка замедляется, взгляд возвращается к монитору
  const momFace = (tt: number) => keys(tt, [[0, -0.45], [knock + 2, -0.45], [knock + 14, -0.85], [to("m01") + 6, -0.85], [to("m01") + 22, -0.45]]);
  const momPose = (tt: number): PoseIn => ({
    expr: tt < knock + 6 ? "softSmile" : tt < to("m01") + 4 ? "smile" : tt < to("m01") + 30 ? "softSmile" : "thinking",
    sit: 1,
    seat: seatOf(OFFICE_MOM),
    ...typingArms(tt, false),
    lookY: keys(tt, [[0, 0.15], [knock, 0.15], [knock + 10, -0.05], [to("m01") + 10, -0.05], [to("m01") + 24, 0.15]]),
    nod: keys(tt, [[m01 - 2, 0], [m01 + 6, 3], [m01 + 16, 0]]),
    lean: keys(tt, [[knock, 0], [knock + 14, -3], [to("m01") + 10, -3], [to("m01") + 26, 2]]),
  });
  // коллега в дверях: рука на косяке, говорит радостно, затем уходит
  const colPlace = (tt: number) => ({ x: keys(tt, [[0, 205], [leave, 205], [leave + 24, 120]]), y: 1500, h: 800 });
  const colPose = (tt: number): PoseIn => ({
    expr: tt < leave ? "smile" : "softSmile",
    armL: { target: { x: 92, y: 1500 - 560 }, shape: "open", elbow: "out" },
    armR: { target: keysV(tt, [[0, { x: 250, y: 1500 - 400 }], [c01 + 4, { x: 250, y: 1500 - 400 }], [c01 + 14, { x: 300, y: 1500 - 520 }], [to("c01"), { x: 300, y: 1500 - 520 }], [to("c01") + 12, { x: 250, y: 1500 - 400 }]], anticipate), shape: tt > c01 + 6 && tt < to("c01") ? "open" : "relax", elbow: "down" },
    nod: keys(tt, [[to("m01") + 2, 0], [to("m01") + 10, 4], [to("m01") + 20, 0]]),
  });
  const screen = <Screen v={{ f, offerHL: 1, showReply: false }} />;
  return (
    <PanelArea>
      {/* письмо получено один раз — разворачивается, фраза в рамке */}
      {officeA < 1 ? (
        <div style={box({ inset: 0, opacity: 1 - officeA, scale: `${0.94 + 0.06 * open}` })}>
          <LetterScreen w={r.w} h={r.h} v={{ f, offerHL: hl, showReply: false }} />
          <svg width={160} height={120} style={box({ left: 640, top: 360, opacity: hl })}>
            <path d="M 140 100 Q 90 96 60 30" stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M 42 46 L 58 24 L 80 40" stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
      {officeA > 0 ? (
        <OfficeStage
          f={f}
          uid="o2"
          cam={{ x: keys(f, [[cut, 650], [m01, 680]]), y: 1040, zoom: keys(f, [[cut, 0.8], [m01, 0.83]]) }}
          momFace={momFace}
          momPose={momPose}
          screen={screen}
          doorOpen={doorOpen}
          opacity={officeA}
          behindDesk={f > knock - 4 ? <Actor uid="o2-col" look="colleague" f={f} place={colPlace} face={(tt) => (tt < leave ? 0.75 : -0.6)} pose={colPose} role="colleague" seed={21} walkFrom={leave - 2} opacity={clamp((f - knock + 4) / 6) * (1 - clamp((f - leave - 20) / 6))} /> : null}
          onDesk={<KeysOnDesk />}
        />
      ) : null}
    </PanelArea>
  );
};

// ---------- 3. Пустой ответ ----------
const Reminder: React.FC<{ a: number }> = ({ a }) => (
  <div style={box({ left: 40, right: 40, top: 26, height: 116, borderRadius: 28, backgroundColor: C.dark, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", fontFamily, opacity: a, translate: `0 ${(1 - a) * -40}px`, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" })}>
    <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#8FD3A6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon id="school" size={44} color={C.ink} stroke={4} />
    </div>
    <div style={{ fontSize: 48, fontWeight: 900, color: C.text }}>{UL2_TEXT.reminder}</div>
  </div>
);

export const DraftScene: React.FC = () => {
  const { f, at } = useScene("draft");
  const r = usePanel();
  const typeFrom = 6;
  const typeTo = 46;
  const remind = at(MOMENTS.reminder);
  const cut = remind + 24; // крупный план → кабинет
  const draft = clamp((f - typeFrom) / (typeTo - typeFrom));
  const typing = f >= typeFrom && f < typeTo;
  const remA = easeOut((f - remind) / 8) * (1 - easeOut((f - (cut + 30)) / 8));
  const officeA = crossfade(f, cut, 8);
  // кабинет: взгляд на часы → берёт ключи → блокирует экран
  const watch = cut + 4;
  const grab = watch + 26;
  const lift = grab + 10;
  const lockAt = lift + 8;
  const k = OFFICE.keys;
  const momPose = (tt: number): PoseIn => {
    const base = typingArms(tt, tt < cut && tt >= typeFrom && tt < typeTo);
    return {
      expr: tt < remind ? "thinking" : "calm",
      sit: 1,
      seat: seatOf(OFFICE_MOM),
      // левая рука: к часам (поворот запястья) → на клавиатуру (блокировка)
      armL: tt > watch - 6 && tt < watch + 22 ? { target: { x: OFFICE_MOM.x - 50, y: OFFICE_MOM.y - 0.62 * OFFICE_MOM.h }, shape: "relax", elbow: "down", behind: false, wrist: 70 } : base.armL,
      // правая рука: к ключам → поднимает их
      armR: {
        target: keysV(tt, [[grab - 14, base.armR!.target!], [grab, { x: k.x + 4, y: k.y - 14 }], [lift, { x: k.x + 4, y: k.y - 14 }], [lift + 12, { x: OFFICE_MOM.x + 40, y: OFFICE_MOM.y - 0.6 * OFFICE_MOM.h }]], anticipate),
        shape: tt > grab - 4 ? "fist" : "relax",
        item: tt > lift - 2 ? "keys" : "none",
        elbow: "down",
        behind: false,
      },
      lookY: keys(tt, [[watch - 4, 0.2], [watch + 2, 0.75], [watch + 20, 0.75], [grab - 4, 0.55], [lift + 8, 0.2]]),
      lookX: keys(tt, [[watch - 4, 0], [watch + 2, 0.2], [watch + 20, 0.2], [grab - 4, 0.5], [lift + 8, 0]]),
    };
  };
  return (
    <PanelArea>
      {officeA < 1 ? (
        <div style={box({ inset: 0, opacity: 1 - officeA })}>
          <LetterScreen w={r.w} h={r.h} v={{ f, draft, typing }} />
          <Reminder a={remA} />
        </div>
      ) : null}
      {officeA > 0 ? (
        <>
          <OfficeStage
            f={f}
            uid="o3"
            cam={{ x: 860, y: 1060, zoom: keys(f, [[cut, 0.92], [lockAt + 20, 0.96]], easeInOut) }}
            momFace={() => -0.4}
            momPose={momPose}
            screen={<Screen v={{ f, draft: 1 }} />}
            lock={clamp((f - lockAt) / 8)}
            onDesk={f < lift ? <KeysOnDesk /> : null}
            opacity={officeA}
          />
          <Reminder a={remA} />
        </>
      ) : null}
    </PanelArea>
  );
};

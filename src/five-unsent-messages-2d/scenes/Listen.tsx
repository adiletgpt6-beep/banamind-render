// Сцена 8. Они слушают все пять. Тот же список из пяти файлов: активная
// строка крупнее, её волна идёт по настоящему звуку, остальные спокойны.
// После каждой дослушанной записи «Угулду» растёт 0/5 → 5/5, волна из
// холодной голубой становится тёплой жёлтой. Это прогресс прослушивания, не
// отправки: никаких отметок доставки. Отец рядом и дослушивает каждую
// запись; рот мальчика закрыт — говорит телефон; рассказчик молчит.
// Главное в кадре — крупно сверху: немые воспоминания (без речи; персонажи
// воспоминаний не открывают рот под запись) — у доски перед классом, помощь
// другу с задачей, название команды «Биримдик», дочитанная книга; на
// пятничной записи и в паузе после неё — нынешние отец и сын. Внизу —
// вспомогательно: список записей и крупная реакция отца со счётчиком.
import { useContext } from "react";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT, FU2_VIDEO } from "../script";
import { C } from "../theme";
import { HeardCounter, playView, type MemoView } from "../graphics/Memo";
import { BOY_BOOST, DeskFront, KidChair, PhoneOnDesk, ROOM, RoomBack, Stool } from "../sets/Room";
import { box as wbox } from "../shots";
import { placeAt, seatOf } from "./common";
import { BOY_PHONE, WORK_PHONE } from "./Gate";
import { PanelArea, Stage, useScene } from "./kit";
import { DAD_PHONE_S, PhoneList, SAT_BOY, SAT_DAD } from "./Saturday";

const FPS = FU2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const IDS = FU2_RECORDS.map((r) => r.id);

// ---------- Немые воспоминания ----------
const Classroom: React.FC<{ board?: boolean }> = ({ board = true }) => (
  <div style={wbox({ left: 0, top: 0, width: 2000, height: 2600 })}>
    <div style={wbox({ left: -300, top: 0, width: 2600, height: 1500, backgroundColor: "#E9E2CF" })} />
    {board ? <div style={wbox({ left: 300, top: 560, width: 1000, height: 460, borderRadius: 12, backgroundColor: "#2F5D4E", border: "18px solid #9A7353", boxSizing: "border-box" })} /> : null}
    <div style={wbox({ left: 1440, top: 560, width: 300, height: 400, borderRadius: 8, backgroundColor: "#CFE4F4", border: "14px solid #FBF7F0", boxSizing: "border-box" })} />
    <div style={wbox({ left: -300, top: 1500, width: 2600, height: 1100, backgroundColor: "#C7A983" })} />
  </div>
);
// Затылки одноклассников (передний план).
const Heads: React.FC<{ xs: readonly number[]; y: number }> = ({ xs, y }) => (
  <>
    {xs.map((x, i) => (
      <div key={x} style={wbox({ left: x - 70, top: y - 70 + (i % 2) * 18, width: 140, height: 160, borderRadius: "70px 70px 50px 50px", backgroundColor: ["#2A201D", "#3B2B24", "#1F1A19", "#2E2422"][i % 4] })}>
        <div style={wbox({ left: -10, top: 110, width: 160, height: 120, borderRadius: "60px 60px 0 0", backgroundColor: ["#2F4A7A", "#26386A", "#3E6FB0", "#2F4A7A"][i % 4] })} />
      </div>
    ))}
  </>
);
const Desk: React.FC<{ x: number; w: number; top: number }> = ({ x, w, top }) => (
  <>
    <div style={wbox({ left: x, top, width: w, height: 28, borderRadius: 6, backgroundColor: "#D9B488" })} />
    <div style={wbox({ left: x + 10, top: top + 28, width: w - 20, height: 300, backgroundColor: "#C9A276" })} />
  </>
);

const MemMonday: React.FC<{ f: number }> = ({ f }) => {
  const boy = placeAt(800, 1500, 620);
  return (
    <Stage cam={{ x: 820, y: 1180, zoom: 0.78 }} inset={{ x: 0, y: 0, w: 892, h: 520 }} bg="#E9E2CF">
      <Classroom />
      <Actor uid="m1-boy" look="boy" f={f} place={() => boy} face={() => 0.1} pose={(tt) => ({ expr: "smile" as const, armR: { target: { x: boy.x + 0.22 * boy.h, y: boy.y - 0.6 * boy.h + Math.sin(tt * 0.12) * 6 }, shape: "open" as const, elbow: "down" as const, behind: false }, armL: { target: { x: boy.x - 0.14 * boy.h, y: boy.y - 0.46 * boy.h }, shape: "relax" as const, elbow: "down" as const } })} seed={4} blinkShift={37} />
      <Heads xs={[420, 660, 940, 1200]} y={1500} />
    </Stage>
  );
};

const MemTuesday: React.FC<{ f: number }> = ({ f }) => {
  const boy = placeAt(700, 1540, 600);
  const friend = placeAt(980, 1540, 590);
  return (
    <Stage cam={{ x: 840, y: 1200, zoom: 1.0 }} inset={{ x: 0, y: 0, w: 892, h: 520 }} bg="#E9E2CF">
      <Classroom board={false} />
      <Actor uid="m2-boy" look="boy" f={f} place={() => boy} face={() => 0.5} pose={(tt) => ({ expr: "smile" as const, sit: 1, seat: seatOf(boy), armR: { target: { x: 850 + Math.sin(tt * 0.15) * 10, y: 1252 }, shape: "point" as const, elbow: "down" as const, behind: false }, armL: { target: { x: 640, y: 1250 }, shape: "relax" as const, elbow: "down" as const }, lookY: 0.5, lookX: 0.4 })} seed={4} blinkShift={37} />
      <Actor uid="m2-friend" look="kidA" f={f} place={() => friend} face={() => -0.4} pose={() => ({ expr: "softSmile" as const, sit: 1, seat: seatOf(friend), packOff: true, armL: { target: { x: 920, y: 1252 }, shape: "relax" as const, elbow: "down" as const }, armR: { target: { x: 1050, y: 1250 }, shape: "relax" as const, elbow: "down" as const }, lookY: 0.55 })} seed={8} />
      <Desk x={540} w={600} top={1240} />
      {/* тетрадь с аккуратными строками */}
      <div style={wbox({ left: 780, top: 1222, width: 170, height: 26, borderRadius: 4, backgroundColor: "#FFFDF6", transform: "skewX(-20deg)" })}>
        {[0, 1].map((i) => (
          <div key={i} style={wbox({ left: 16, top: 6 + i * 9, width: 110 - i * 30, height: 4, borderRadius: 2, backgroundColor: "#7FA7C9" })} />
        ))}
      </div>
    </Stage>
  );
};

const MemWednesday: React.FC<{ f: number }> = ({ f }) => {
  const kids: readonly [string, Place, number][] = [
    ["kidA", placeAt(560, 1520, 580), 0.3],
    ["boy", placeAt(820, 1530, 610), 0],
    ["son", placeAt(1080, 1520, 590), -0.3],
  ];
  const sign = easeOut((f - 8) / 10);
  return (
    <Stage cam={{ x: 820, y: 1010, zoom: 0.62 }} inset={{ x: 0, y: 0, w: 892, h: 520 }} bg="#E9E2CF">
      <Classroom board />
      {/* название команды на доске */}
      <div style={wbox({ left: 470, top: 690, width: 700, height: 180, borderRadius: 18, backgroundColor: "#FFFDF6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 118, fontWeight: 900, color: "#2F4A7A", opacity: sign, scale: `${0.9 + 0.1 * sign}` })}>{FU2_TEXT.team}</div>
      {kids.map(([look, p, face], i) => (
        <Actor key={i} uid={`m3-${i}`} look={look as "boy"} f={f} place={() => p} face={() => face} pose={() => ({ expr: "smile" as const, packOff: true, armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: "relax" as const, elbow: "down" as const }, armR: { target: i === 1 ? { x: p.x + 0.1 * p.h, y: p.y - 0.95 * p.h } : { x: p.x + 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: i === 1 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false } })} seed={4 + i} />
      ))}
    </Stage>
  );
};

const MemThursday: React.FC<{ f: number }> = ({ f }) => {
  const boy = placeAt(700, 1540, 600);
  const close = clamp((f - 10) / 14);
  return (
    <Stage cam={{ x: 760, y: 1170, zoom: 1.05 }} inset={{ x: 0, y: 0, w: 892, h: 520 }} bg="#DCE8EA">
      <RoomBack />
      <KidChair x={boy.x} />
      <Actor uid="m4-boy" look="boyHome" f={f} place={() => boy} face={() => 0.2} pose={() => ({ expr: close > 0.8 ? ("smile" as const) : ("calm" as const), sit: 1, seat: seatOf(boy) + BOY_BOOST, armL: { target: { x: 650, y: 1230 }, shape: "relax" as const, elbow: "down" as const, behind: false }, armR: { target: { x: 780, y: 1230 - 20 * (1 - close) }, shape: "relax" as const, elbow: "down" as const, behind: false }, lookY: 0.55 })} seed={4} blinkShift={37} />
      <DeskFront />
      {/* книга закрывается */}
      <svg width={1} height={1} style={wbox({ left: 0, top: 0, overflow: "visible" })}>
        <rect x={640} y={1222} width={140} height={18} rx={4} fill="#C2574A" />
        <path d={`M 710 1222 L ${710 + 70 * Math.cos(Math.PI * close)} ${1222 - 70 * Math.sin(Math.PI * close) * 0.4} L ${710 + 70 * Math.cos(Math.PI * close)} ${1240 - 70 * Math.sin(Math.PI * close) * 0.4} L 710 1240 Z`} fill="#E06A5A" />
        <rect x={706} y={1216} width={8} height={26} rx={3} fill="#9A3E33" />
      </svg>
    </Stage>
  );
};

// Нынешние отец и сын у стола (слушают вместе). Пока звучит запись, отец
// смотрит на телефон и слушает (рот закрыт); между записями — улыбка и
// кивок. После пятой — заметная реакция: поворачивается к сыну, наклоняется,
// открытая ладонь ложится на стол рядом с рукой сына; сын поднимает глаза.
const Present: React.FC<{ f: number; cam: { x: number; y: number; zoom: number }; inset: { x: number; y: number; w: number; h: number }; uid: string; react: (tt: number) => number; endHold: number }> = ({ f, cam, inset, uid, react, endHold }) => {
  const fin = (tt: number) => easeOut((tt - endHold) / 22);
  const dadPose = (tt: number) => ({
    expr: tt > endHold + 10 ? ("smile" as const) : react(tt) > 0.5 ? ("softSmile" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(SAT_DAD),
    lean: 9 + 3 * react(tt) + 7 * fin(tt),
    turnBody: 1,
    armL: { target: keysV(tt, [[endHold, { x: SAT_DAD.x - 0.15 * SAT_DAD.h, y: ROOM.desk.top + 4 }], [endHold + 24, { x: 880, y: ROOM.desk.top + 6 }]], anticipate), shape: tt > endHold + 8 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armR: { target: { x: SAT_DAD.x + 0.06 * SAT_DAD.h, y: SAT_DAD.y - 0.3 * SAT_DAD.h }, shape: "relax" as const, elbow: "down" as const, behind: false },
    lookY: 0.35 - 0.3 * react(tt) - 0.3 * fin(tt),
    headTilt: 4 * fin(tt),
    nod: 3 * react(tt) + keys(tt, [[endHold + 26, 0], [endHold + 34, 4], [endHold + 44, 0]]),
  });
  const boyPose = (tt: number) => ({
    expr: react(tt) > 0.3 || tt > endHold + 14 ? ("smile" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(SAT_BOY) + BOY_BOOST,
    armL: { target: { x: SAT_BOY.x - 0.04 * SAT_BOY.h, y: ROOM.desk.top + 2 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: ROOM.phone.x - 40, y: ROOM.desk.top + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    lookY: 0.55 - 0.5 * Math.max(react(tt), fin(tt)) - 0.2 * fin(tt),
    lookX: 0.2 + 0.3 * Math.max(react(tt), fin(tt)) + 0.2 * fin(tt),
  });
  return (
    <Stage cam={cam} inset={inset} bg="#DCE8EA">
      <RoomBack />
      <KidChair x={SAT_BOY.x} />
      <Stool x={ROOM.stool} />
      <Actor uid={`${uid}-dad`} look="dad" f={f} place={() => SAT_DAD} face={() => -0.75} pose={dadPose} role="father" seed={2} layer="body" />
      <Actor uid={`${uid}-boy`} look="boyHome" f={f} place={() => SAT_BOY} face={() => 0.45} pose={boyPose} role="son" seed={4} blinkShift={37} layer="body" />
      <DeskFront />
      <PhoneOnDesk x={ROOM.phone.x} y={ROOM.phone.y} caseColor={BOY_PHONE} screen={1} />
      <PhoneOnDesk x={ROOM.dadPhone.x} y={ROOM.dadPhone.y} caseColor={WORK_PHONE} faceDown s={DAD_PHONE_S} />
      <Actor uid={`${uid}-boy`} look="boyHome" f={f} place={() => SAT_BOY} face={() => 0.45} pose={boyPose} role="son" seed={4} blinkShift={37} layer="arms" />
      <Actor uid={`${uid}-dad`} look="dad" f={f} place={() => SAT_DAD} face={() => -0.75} pose={dadPose} role="father" seed={2} layer="arms" />
    </Stage>
  );
};

export const ListenScene: React.FC = () => {
  const { f, t } = useScene("listen");
  const cues = useContext(CuesContext);
  const segs = IDS.map((id) => cues.find((c) => c.id === id)!);
  const t0 = t - f / FPS;
  const fr = (sec: number) => Math.round((sec - t0) * FPS);
  const starts = segs.map((c) => fr(c.from));
  const ends = segs.map((c) => fr(c.to));
  const heardN = ends.filter((e) => f >= e + 6).length;
  const lastEnd = ends[Math.max(0, heardN - 1)];
  const pulse = heardN > 0 ? 1 - easeOut((f - lastEnd - 6) / 12) : 0;
  const views: MemoView[] = segs.map((c, i) => {
    const pv = playView(c, t);
    const heard = f >= ends[i] + 6;
    const warm = heard ? easeOut((f - ends[i] - 6) / 18) : 0;
    return { ...pv, state: pv.state === "done" && !heard ? "playing" : pv.state, warm, heard };
  });
  const scales = views.map((v) => (v.state === "playing" ? 1.04 : 1));
  // касание строки перед каждой записью
  const press = starts.map((s) => easeOut((f - (s - 10)) / 3) * (1 - easeOut((f - (s - 4)) / 4)));
  // реакции между записями: улыбка, кивок
  const react = (tt: number) => Math.max(0, ...ends.map((e, i) => (i < 4 ? keys(tt, [[e + 2, 0], [e + 12, 1], [starts[i + 1] - 14, 1], [starts[i + 1] - 2, 0]]) : 0)));
  const endHold = ends[4] + 10;
  // воспоминание текущей записи (кроссфейд); пятница и финальная пауза —
  // нынешние отец и сын крупно
  const memIdx = starts.filter((s) => f >= s - 10).length - 1;
  const memA = (i: number) => (i === memIdx ? easeOut((f - (starts[i] - 10)) / 10) * (1 - easeOut((f - (ends[i] + 14)) / 10)) : 0);
  const MEM = [MemMonday, MemTuesday, MemWednesday, MemThursday];
  const BIG = { x: 24, y: 20, w: 892, h: 520 };
  const finA = easeOut((f - endHold) / 20);
  // крупный кадр: в паузе после пятой записи камера ближе к отцу и сыну
  const bigCam = { x: 865 + 25 * finA, y: 1110 - 10 * finA, zoom: 1.0 + 0.22 * finA };
  return (
    <PanelArea>
      {/* крупно: воспоминание записи или нынешние отец и сын */}
      <div style={box({ left: BIG.x, top: BIG.y, width: BIG.w, height: BIG.h, borderRadius: 26, overflow: "hidden", border: `2px solid ${C.lineSoft}` })}>
        <Present f={f} cam={bigCam} inset={{ x: 0, y: 0, w: BIG.w, h: BIG.h }} uid="l8-big" react={react} endHold={endHold} />
        {MEM.map((M, i) => {
          const a = memA(i);
          return a > 0 ? (
            <div key={i} style={box({ inset: 0, opacity: a })}>
              <M f={f - (starts[i] - 10)} />
              <div style={box({ left: 20, top: 18, padding: "8px 20px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.85)", fontFamily, fontSize: 32, fontWeight: 900, color: C.yellow })}>{FU2_RECORDS[i].day} {FU2_TEXT.dayRecord}</div>
            </div>
          ) : null;
        })}
      </div>
      {/* вспомогательно: список записей (тот же, что в субботу) */}
      <PhoneList views={views} f={f} a={1} w={404} press={press} top={556} left={24} scales={scales} />
      {/* реакция отца крупным планом + счётчик «Угулду n/5» */}
      <div style={box({ left: 480, top: 556, width: 436, height: 500, borderRadius: 26, overflow: "hidden", border: `2px solid ${heardN === 5 ? C.yellow : C.lineSoft}` })}>
        <Present f={f} cam={{ x: 1060, y: 1050, zoom: 1.25 }} inset={{ x: 0, y: 0, w: 436, h: 500 }} uid="l8-dad" react={react} endHold={endHold} />
        <div style={box({ left: 0, right: 0, top: 14, display: "flex", justifyContent: "center" })}>
          <HeardCounter n={heardN} pulse={pulse} size={0.9} />
        </div>
      </div>
    </PanelArea>
  );
};

// Сцены 6–7.
// 6. «Ишемби». Отец идёт по коридору мимо детской, глядя в рабочий
//    телефон. Из открытой двери звучит голос (волны от двери, подпись
//    «Дүйшөмбү күнкү жазуу» у двери — это день ЗАПИСИ, сцена — суббота):
//    отец замедляет шаг, опускает телефон, останавливается и поворачивается
//    к двери. Он слушает — рот закрыт. В комнате мальчик сидит за
//    столом; его телефон воспроизводит СОХРАНЁННЫЙ файл «Дүйшөмбү» (кнопка
//    паузы активна, волна по настоящему звуку). Рот мальчика закрыт —
//    говорит запись. Запись заканчивается, кнопка снова «▶»; сын замечает
//    отца. Нового файла нет.
// 7. Отец спокойно входит и присаживается рядом. Мальчик сам показывает
//    список. «Буларды кимге жаздың?» — «Сага.» (тишина, реакция отца) —
//    «Анда эмнеге жөнөткөн жоксуң?» — «Өзүм айтып бергим келген. Унутуп
//    калбайын деп жазып койгом.» Отец кладёт рабочий телефон экраном вниз
//    и поворачивается к сыну; мальчик включает первую запись заново.
import { useContext } from "react";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { FU2_RECORDS, FU2_TEXT } from "../script";
import { C } from "../theme";
import { idleView, MemoHeader, MemoRow, playView, type MemoView } from "../graphics/Memo";
import { BOY_BOOST, Corridor, DeskFront, KidChair, PhoneOnDesk, ROOM, RoomBack, Stool } from "../sets/Room";
import { H, placeAt, seated, seatOf, sitDown } from "./common";
import { BOY_PHONE, WORK_PHONE } from "./Gate";
import { PanelArea, Stage, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const SAT_BOY = seated("boy", ROOM.boy);
export const SAT_DAD = seated("dad", ROOM.stool);
// Телефон отца на столе — того же размера, что в его руке плашмя.
export const DAD_PHONE_S = 0.62;

// Экран телефона сына крупно: «Үн жазуулары › Атама», пять файлов.
export const PhoneList: React.FC<{ views: readonly MemoView[]; f: number; a: number; w?: number; press?: readonly number[]; top?: number; left?: number; scales?: readonly number[] }> = ({ views, f, a, w = 600, press, top, left, scales }) => (
  <div style={box({ left: left ?? (940 - w - 36) / 2, ...(top === undefined ? { bottom: 20 } : { top }), width: w + 36, padding: "22px 18px 18px", borderRadius: 40, backgroundColor: "#071224", border: `8px solid ${BOY_PHONE}`, boxSizing: "border-box", opacity: a, translate: `0 ${(1 - a) * 40}px`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)" })}>
    <div style={{ paddingLeft: 6, marginBottom: 12 }}>
      <MemoHeader w={w - 20} size={0.85} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {FU2_RECORDS.map((r, i) => (
        <MemoRow key={r.id} id={r.id} w={w} view={views[i]} f={f} compact press={press?.[i] ?? 0} scale={scales?.[i] ?? 1} />
      ))}
    </div>
  </div>
);

export const SaturdayScene: React.FC = () => {
  const { f, t, from, to } = useScene("saturday");
  const cues = useContext(CuesContext);
  const rec = from("sat-monday");
  const recEnd = to("sat-monday");
  const cutB = rec + 30;
  // A: коридор — отец идёт мимо двери с телефоном в руке, слышит запись,
  // опускает телефон, останавливается и поворачивается к двери
  const stopAt = rec + 24;
  const corridorDad = (tt: number): Place => {
    const u = cruise((tt - 0) / stopAt, 0.3);
    return placeAt(lerp(1560, 1010, u), 1520, H.dad);
  };
  const lowerAt = rec + 8;
  const corridorPose = (tt: number) => {
    const p = corridorDad(tt);
    return {
      expr: tt < rec + 6 ? ("calm" as const) : ("surprised" as const),
      armL: { target: null, shape: "relax" as const },
      armR: { target: keysV(tt, [[lowerAt, { x: p.x + 0.02 * p.h, y: p.y - 0.62 * p.h }], [lowerAt + 14, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }]], anticipate), shape: "phone" as const, item: "phone" as const, itemColor: WORK_PHONE, glow: tt < lowerAt + 6 ? 1 : 0, elbow: "down" as const, behind: false },
      lookY: keys(tt, [[0, 0.7], [rec + 2, 0.7], [rec + 10, 0.05]]),
      lookX: keys(tt, [[0, 0.2], [rec + 2, 0.2], [rec + 8, -0.6], [rec + 20, -0.3]]),
    };
  };
  const corridorFace = (tt: number) => keys(tt, [[0, -0.5], [rec + 8, -0.5], [rec + 26, -0.95]]);
  const waves = (tt: number) => (tt >= rec && tt < recEnd + 4 ? 1 : 0);
  // B: комната. Отец у двери, после записи делает шаг внутрь.
  const stepIn: [number, number] = [recEnd + 26, recEnd + 74];
  const roomDad = (tt: number): Place => {
    const u = cruise((tt - stepIn[0]) / (stepIn[1] - stepIn[0]), 0.3);
    return placeAt(lerp(200, 330, u), 1505, H.dad);
  };
  const roomDadPose = (tt: number) => {
    const p = roomDad(tt);
    return {
      expr: tt < recEnd ? ("surprised" as const) : ("softSmile" as const),
      armL: { target: { x: p.x - 0.13 * p.h, y: p.y - 0.46 * p.h }, shape: "relax" as const, elbow: "down" as const },
      armR: { target: { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }, shape: "phone" as const, item: "phone" as const, itemColor: WORK_PHONE, glow: 0, elbow: "down" as const, behind: false },
      lookY: 0.3,
      headTilt: keys(tt, [[rec + 40, 0], [rec + 60, 4]]),
    };
  };
  const notice = recEnd + 12;
  const boyPose = (tt: number) => ({
    expr: tt < rec + 10 ? ("calm" as const) : tt < notice + 4 ? ("softSmile" as const) : ("surprised" as const),
    sit: 1,
    seat: seatOf(SAT_BOY) + BOY_BOOST,
    armL: { target: { x: SAT_BOY.x - 0.04 * SAT_BOY.h, y: ROOM.desk.top + 2 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: ROOM.phone.x - 40, y: ROOM.desk.top + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    // слушает запись (рот закрыт), смотрит на телефон; затем — на отца
    lookY: keys(tt, [[0, 0.6], [notice - 2, 0.6], [notice + 6, 0.05]]),
    lookX: keys(tt, [[0, 0.5], [notice - 2, 0.5], [notice + 6, -0.6]]),
  });
  const boyFace = (tt: number) => keys(tt, [[0, 0.35], [notice, 0.35], [notice + 12, -0.5]]);
  const sat = cues.find((c) => c.id === "sat-monday")!;
  const pv = playView(sat, t);
  const views: MemoView[] = FU2_RECORDS.map((_, i) => (i === 0 ? { ...pv, warm: 0, heard: false } : idleView));
  const card = easeOut((f - (cutB + 6)) / 10);
  const cam = { x: 700, y: 1250, zoom: 0.75 };
  return (
    <PanelArea>
      {f < cutB ? (
        <Stage cam={{ x: lerp(1160, 920, easeInOut(clamp(f / cutB))), y: 1130, zoom: 1.05 }}>
          <Corridor />
          {/* голос звучит из комнаты: мягкие волны из дверного проёма */}
          {waves(f) ? (
            <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              {[0, 1, 2].map((i) => {
                const k = ((f - rec) / 24 + i / 3) % 1;
                return <path key={i} d={`M ${700 + 90 * k} ${820 - 60 * k} q ${40 + 40 * k} ${70 + 60 * k} 0 ${140 + 120 * k}`} stroke="#3E6FB0" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.55 * (1 - k)} />;
              })}
            </svg>
          ) : null}
          <Actor uid="s6-dad-hall" look="dad" f={f} place={corridorDad} face={corridorFace} pose={corridorPose} role="father" seed={2} />
        </Stage>
      ) : (
        <Stage cam={cam}>
          <RoomBack />
          <KidChair x={SAT_BOY.x} />
          <Actor uid="s6-dad" look="dad" f={f} place={roomDad} face={() => 0.55} pose={roomDadPose} role="father" seed={2} walkFrom={stepIn[0] - 4} />
          <Actor uid="s6-boy" look="boyHome" f={f} place={() => SAT_BOY} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} layer="body" />
          <DeskFront />
          <PhoneOnDesk x={ROOM.phone.x} y={ROOM.phone.y} caseColor={BOY_PHONE} screen={1} />
          <Actor uid="s6-boy" look="boyHome" f={f} place={() => SAT_BOY} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} layer="arms" />
        </Stage>
      )}
      {f >= cutB ? <PhoneList views={views} f={f} a={card} w={430} left={450} /> : null}
      {f < cutB ? (
        <div style={box({ left: 40, top: 40, display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 999, backgroundColor: "rgba(5,11,23,0.86)", border: `2px solid ${C.yellow}`, fontFamily, fontSize: 38, fontWeight: 900, color: C.yellow, opacity: easeOut((f - rec) / 8) })}>
          <svg width={26} height={36} viewBox="0 0 30 40">
            <rect x={8} y={2} width={14} height={24} rx={7} fill={C.yellow} />
            <path d="M 4 18 Q 4 32 15 32 Q 26 32 26 18" stroke={C.yellow} strokeWidth={3} fill="none" />
          </svg>
          {FU2_RECORDS[0].day} {FU2_TEXT.dayRecord}
        </div>
      ) : null}
    </PanelArea>
  );
};

// ---------- 7. Почему не отправил ----------
export const WhyScene: React.FC = () => {
  const { f, from, to } = useScene("why");
  const f04 = from("f04");
  const s03 = from("s03");
  const f05 = from("f05");
  const s04 = from("s04");
  const endS04 = to("s04");
  // подход к табурету: замедление → остановка → сгибание коленей, таз
  // опускается на сиденье → устойчивая посадка
  const walk: [number, number] = [0, 34];
  const sitAt = 38;
  const dad = (tt: number): Place => {
    const u = cruise((tt - walk[0]) / (walk[1] - walk[0]), 0.35);
    return placeAt(lerp(330, ROOM.stool, u), lerp(1505, SAT_DAD.y, u), H.dad);
  };
  // рабочий телефон отец принёс в руке из коридора; после ответа сына
  // кладёт его экраном вниз на стол и отпускает
  const take = endS04 + 10;
  const place = take + 30;
  const DESK_PHONE = { x: ROOM.dadPhone.x, y: ROOM.dadPhone.y };
  const lapHold = { x: SAT_DAD.x - 0.02 * SAT_DAD.h, y: ROOM.desk.top - 26 };
  const dadPose = (tt: number) => {
    const s = sitDown(tt, sitAt, 30);
    const seatedNow = tt >= sitAt;
    const hasPhone = tt < place;
    const p = dad(Math.min(tt, walk[1]));
    return {
      expr: tt < s03 ? ("calm" as const) : tt < f05 - 6 ? ("surprised" as const) : tt < endS04 + 6 ? ("thinking" as const) : ("softSmile" as const),
      sit: seatedNow ? s.sit : 0,
      lean: (seatedNow ? s.lean : 0) + keys(tt, [[place + 6, 0], [place + 30, 8]]),
      seat: seatOf(SAT_DAD),
      armL: { target: tt < sitAt + 20 ? { x: p.x - 0.13 * H.dad, y: p.y - 0.46 * H.dad } : { x: SAT_DAD.x - 0.14 * SAT_DAD.h, y: SAT_DAD.y - 0.4 * SAT_DAD.h }, shape: "relax" as const, elbow: "down" as const, behind: false },
      armR: {
        target: keysV(tt, [[0, { x: p.x + 0.12 * H.dad, y: p.y - 0.44 * H.dad }], [walk[1], { x: p.x + 0.12 * H.dad, y: p.y - 0.44 * H.dad }], [sitAt + 26, lapHold], [take, lapHold], [take + 16, { x: DESK_PHONE.x + 6, y: DESK_PHONE.y - 70 }], [place, { x: DESK_PHONE.x, y: DESK_PHONE.y - 24 }], [place + 18, { x: SAT_DAD.x - 0.02 * SAT_DAD.h, y: ROOM.desk.top + 4 }]], anticipate),
        shape: hasPhone ? ("phone" as const) : ("relax" as const),
        item: hasPhone ? ("phone" as const) : ("none" as const),
        itemColor: WORK_PHONE,
        flat: hasPhone ? clamp((tt - take - 12) / 16) : 0,
        elbow: "down" as const,
        behind: false,
      },
      // «Сага.» — тишина: глаза к сыну, брови, лёгкий выдох
      exhale: keys(tt, [[s03 + 14, 0], [s03 + 30, 0.7], [f05 - 4, 0.2]]),
      lookY: keys(tt, [[0, 0.3], [f04 - 10, 0.45], [f04 + 20, 0.45], [s03 - 4, 0.2], [take + 4, 0.2], [take + 12, 0.55], [place + 6, 0.55], [place + 14, 0.25]]),
      lookX: keys(tt, [[take + 4, 0], [take + 12, 0.3], [place + 6, 0.3], [place + 14, 0]]),
      // внимание и понимание: наклон головы на «Сага.», кивок на ответ
      headTilt: keys(tt, [[s03 + 20, 0], [s03 + 40, 5], [f05, 2], [s04 + 30, 2], [s04 + 50, -3], [endS04 + 10, 0]]),
      nod: keys(tt, [[endS04 - 4, 0], [endS04 + 4, 4], [endS04 + 14, 0]]),
      turnBody: keys(tt, [[place, 0.7], [place + 24, 1]]),
    };
  };
  const dadFace = (tt: number) => keys(tt, [[0, 0.6], [walk[1] - 4, 0.3], [sitAt + 14, -0.55], [take + 4, -0.55], [take + 14, -0.2], [place + 8, -0.2], [place + 22, -0.75]]);
  // мальчик показывает список, затем смотрит на отца; на ответе — плечи
  const show: [number, number] = [f04 - 20, s03 - 2];
  const tap = 432; // включает первую запись заново (в конце сцены)
  const phoneHold = { x: SAT_BOY.x + 0.2 * SAT_BOY.h, y: SAT_BOY.y - 0.62 * SAT_BOY.h };
  const boyPose = (tt: number) => {
    const holding = tt >= show[0] - 10 && tt < show[1] + 14;
    return {
      expr: tt < s03 - 4 ? ("calm" as const) : tt < s04 ? ("softSmile" as const) : tt < endS04 + 20 ? ("calm" as const) : ("smile" as const),
      sit: 1,
      seat: seatOf(SAT_BOY) + BOY_BOOST,
      armR: {
        target: keysV(tt, [[show[0] - 10, { x: ROOM.phone.x - 6, y: ROOM.phone.y - 6 }], [show[0], phoneHold], [show[1], phoneHold], [show[1] + 14, { x: ROOM.phone.x - 6, y: ROOM.phone.y - 6 }], [tap - 10, { x: ROOM.phone.x - 40, y: ROOM.desk.top + 4 }], [tap, { x: ROOM.phone.x - 4, y: ROOM.phone.y - 10 }], [tap + 10, { x: ROOM.phone.x - 40, y: ROOM.desk.top + 4 }]], anticipate),
        shape: holding ? ("phone" as const) : tt > tap - 8 && tt < tap + 6 ? ("point" as const) : ("relax" as const),
        item: holding ? ("phone" as const) : ("none" as const),
        itemColor: BOY_PHONE,
        glow: 1,
        itemTilt: 20,
        elbow: "down" as const,
        behind: false,
      },
      armL: { target: { x: SAT_BOY.x - 0.04 * SAT_BOY.h, y: ROOM.desk.top + 2 }, shape: "relax" as const, elbow: "down" as const, behind: false },
      lookY: keys(tt, [[0, 0.1], [show[0], 0.4], [f04 - 4, 0.4], [f04 + 4, 0], [tap - 16, 0], [tap - 8, 0.55], [tap + 14, 0.55], [tap + 20, 0.1]]),
      shoulders: keys(tt, [[s04 + 4, 0], [s04 + 16, 0.5], [s04 + 50, 0.15], [endS04 + 10, 0]]),
    };
  };
  const boyFace = () => 0.45;
  const card = easeOut((f - (show[0] + 4)) / 9) * (1 - easeOut((f - show[1]) / 9));
  const cam = {
    x: keys(f, [[0, 820], [sitAt + 20, 870]]),
    y: keys(f, [[0, 1150], [show[0], 1150], [show[0] + 12, 1270], [show[1], 1270], [show[1] + 14, 1110], [take, 1110], [place + 30, 1120]]),
    zoom: keys(f, [[0, 1.0], [sitAt + 20, 1.22], [show[0], 1.22], [show[0] + 12, 1.12], [show[1], 1.12], [show[1] + 14, 1.42], [take, 1.42], [take + 20, 1.3], [place + 40, 1.38]]),
  };
  const press = [easeOut((f - (tap - 2)) / 3) * (1 - easeOut((f - tap - 4) / 4)), 0, 0, 0, 0];
  return (
    <PanelArea>
      <Stage cam={cam}>
        <RoomBack />
        <KidChair x={SAT_BOY.x} />
        <Stool x={ROOM.stool} />
        {/* пока идёт — целиком позади стола; сидя — тело до столешницы, руки поверх */}
        <Actor uid="w7-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={0} layer={f < sitAt ? undefined : "body"} />
        <Actor uid="w7-boy" look="boyHome" f={f} place={() => SAT_BOY} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} layer="body" />
        <DeskFront />
        {f < show[0] - 10 || f >= show[1] + 14 ? <PhoneOnDesk x={ROOM.phone.x} y={ROOM.phone.y} caseColor={BOY_PHONE} screen={f > tap ? 1 : 0.6} /> : null}
        {f >= place ? <PhoneOnDesk x={ROOM.dadPhone.x} y={ROOM.dadPhone.y} caseColor={WORK_PHONE} faceDown s={DAD_PHONE_S} /> : null}
        <Actor uid="w7-boy" look="boyHome" f={f} place={() => SAT_BOY} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} layer="arms" />
        {f < sitAt ? null : <Actor uid="w7-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={0} layer="arms" />}
      </Stage>
      {/* список — слева внизу, над передней частью стола: отец и табурет справа видны */}
      <PhoneList views={FU2_RECORDS.map(() => idleView)} f={f} a={card} press={press} w={404} left={24} />
      {f > tap - 20 ? <PhoneList views={FU2_RECORDS.map(() => idleView)} f={f} a={easeOut((f - (tap - 18)) / 8)} press={press} w={404} left={24} /> : null}
    </PanelArea>
  );
};


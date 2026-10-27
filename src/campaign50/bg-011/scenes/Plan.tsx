// Сцена 4: «Ошол эле кечте». Тёплая лампа, за окном огни. Мама за столом
// с листком; папа приносит с доски три записки «ким алып барат?»,
// кладёт их на стол и садится рядом. Мама: «Эртең менен шашылбай,
// каттамды алдын ала уюштуруунун жолун издейли.» Крупно: три записки
// съезжаются и превращаются в один отдельный план «Мектеп каттамы»
// (07:30 Үй → Мектеп, 13:00 Мектеп → Үй). Затем мама сама ищет решение
// в телефоне, находит BalaGo и читает «Кантип иштейт?» — без заявки.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useLine, useScene } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { BG11_TEXT } from "../script";
import { BalaGoPage, HoldingHand, PhoneFrame, SearchScreen, TapFinger } from "../screens";
import { C, ChairBack, K, KitchenBack, Note, NOTE_COLORS, NoteOnTable, PlanSheet, TableFront, WarmLamp } from "../sets/Kitchen";
import { box, View } from "../shots";
import { H, onTable, seated, seatOf, sitDown, stand } from "./common";

export const PLAN = { walk: 6, put: 44, sit: 54 };
export const P_DAD = (t: number): Place => (t < PLAN.sit ? stand("dad", lerp(2330, K.seat.dad, cruise((t - PLAN.walk) / (PLAN.sit - PLAN.walk), 0.3)), -8) : seated("dad", K.seat.dad));

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const m02 = useLine("m02");
  const aEnd = Math.min(m02.from - 6, 92);
  const bFrom = Math.min(m02.from + 70, m02.to - 30);
  const cFrom = m02.to + 14;
  const mom = seated("mom", K.seat.mom);
  const writeX = (t: number) => 1770 + Math.sin(t / 5) * 10 + clamp(t / 80) * 20;
  const momPose = (t: number): PoseIn => ({
    expr: t < PLAN.put ? "thinking" : t < m02.from ? "calm" : "softSmile",
    sit: 1,
    seat: seatOf(mom),
    lean: keys(t, [[0, 10], [PLAN.put - 6, 10], [PLAN.put + 6, 2], [m02.to, 2], [m02.to + 10, 8]]),
    lookY: keys(t, [[0, 0.6], [PLAN.put - 10, 0.6], [PLAN.put, 0.3], [m02.from, 0], [m02.to, 0.1], [m02.to + 10, 0.6]]),
    armR: { target: t < m02.to ? onTable(writeX(t), -4) : keysV(t, [[m02.to, onTable(writeX(m02.to), -4)], [m02.to + 12, { x: mom.x + 0.14 * mom.h, y: K.table.top - 70 }]]), shape: "pinch", item: t < m02.to ? "pencil" : "none", itemColor: C.navy, elbow: "down", behind: false },
    armL: {
      target: keysV(t, [[0, onTable(mom.x - 0.05 * mom.h, -4)], [m02.to, onTable(mom.x - 0.05 * mom.h, -4)], [m02.to + 12, { x: mom.x + 0.02 * mom.h, y: K.table.top - 80 }]]),
      shape: t > m02.to + 4 ? "fist" : "relax",
      item: t > m02.to + 4 ? "phone" : "none",
      glow: 1,
      elbow: "down",
      behind: false,
    },
  });
  const momFace = (t: number) => keys(t, [[0, 0.2], [PLAN.walk + 10, 0.5], [PLAN.put + 10, 0.55], [m02.to, 0.45], [m02.to + 10, 0.1]]);
  const dadPose = (t: number): PoseIn => {
    const p = P_DAD(t);
    const sd = sitDown(t, PLAN.sit - 2, 26);
    return {
      expr: t < m02.from ? "thinking" : "calm",
      sit: sd.sit,
      seat: seatOf(seated("dad", K.seat.dad)),
      lean: t < PLAN.sit ? keys(t, [[PLAN.put - 14, 0], [PLAN.put, 14]]) : sd.lean,
      lookY: keys(t, [[0, 0.3], [PLAN.put + 10, 0.4], [m02.from, 0.1], [cFrom, 0.4]]),
      nod: keys(t, [[m02.to - 30, 0], [m02.to - 22, 6], [m02.to - 10, 0]]),
      armL: {
        target: keysV(t, [[0, { x: p.x - 0.14 * H.dad, y: p.y - 0.55 * H.dad }], [PLAN.put - 8, onTable(1880, -40)], [PLAN.put, onTable(1860, -6)], [PLAN.put + 16, onTable(K.seat.dad - 0.14 * H.dad, -4)]], anticipate),
        shape: t < PLAN.put ? "pinch" : "relax",
        item: t < PLAN.put ? "card" : "none",
        itemColor: NOTE_COLORS[0],
        elbow: "down",
        behind: false,
      },
      armR: { target: keysV(t, [[PLAN.sit + 6, { x: p.x + 0.12 * H.dad, y: p.y - 0.46 * H.dad }], [PLAN.sit + 26, onTable(K.seat.dad + 0.13 * H.dad, -4)]]), shape: "relax", elbow: "down" },
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.8], [PLAN.sit, -0.6], [PLAN.sit + 20, -0.45]]);
  const world = (
    <>
      <KitchenBack minutes={19 * 60 + 35 + f / 60} evening={1} keys notes={0} />
      <WarmLamp />
      <ChairBack x={mom.x} evening={1} />
      <ChairBack x={K.seat.dad} evening={1} />
      <Actor uid="p-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <Actor uid="p-dad" look="dad" f={f} place={P_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" walkFrom={0} />
      <TableFront evening={1} />
      <PlanSheet x={1780} y={K.table.top + 14} lines={clamp((f - 10) / 120)} />
      {f >= PLAN.put
        ? [0, 1, 2].map((i) => <NoteOnTable key={i} x={1880 + i * 34} y={K.table.top + 12 - i * 2} color={NOTE_COLORS[i]} rot={[-8, 4, -3][i]} />)
        : null}
      <Actor uid="p-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="p-dad" look="dad" f={f} place={P_DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" walkFrom={0} />
    </>
  );
  const title = easeOut((f - 4) / 12) * (1 - easeOut((f - aEnd + 16) / 12));
  return (
    <>
      {f < aEnd ? (
        <View cam={{ x: lerp(1900, 1860, easeInOut(f / aEnd)), y: 1170, zoom: lerp(1.15, 1.22, easeInOut(f / aEnd)) }} bg="#3B3149">
          {world}
        </View>
      ) : null}
      {f >= aEnd && f < bFrom ? <View cam={{ x: lerp(1845, 1850, (f - aEnd) / 80), y: 1060, zoom: lerp(1.72, 1.8, (f - aEnd) / 90) }}>{world}</View> : null}
      {f >= bFrom && f < cFrom ? <PlanCloseUp f={f - bFrom} len={cFrom - bFrom} /> : null}
      {f >= cFrom ? <PhoneCloseUp f={f - cFrom} len={frames - cFrom} /> : null}
      {title > 0 ? (
        <div style={box({ left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: title })}>
          <div style={{ padding: "14px 40px", borderRadius: 999, backgroundColor: "rgba(20,40,90,0.85)", color: "#FFFFFF", fontFamily, fontSize: 54, fontWeight: 900, transform: `translateY(${(1 - title) * -20}px)` }}>{BG11_TEXT.evening}</div>
        </div>
      ) : null}
    </>
  );
};

// Крупно: три записки съезжаются под новый лист — «Мектеп каттамы».
const PlanCloseUp: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const p = BG11_TEXT.plan;
  const merge = easeInOut((f - 10) / 26);
  const sheet = easeOut((f - 22) / 14);
  const push = lerp(1, 1.05, easeInOut(f / Math.max(1, len)));
  const row = (i: number) => easeOut((f - 36 - i * 12) / 10);
  return (
    <div style={box({ inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #F1E3CC, #CDB592)" })}>
      <div style={box({ inset: 0, transform: `scale(${push})`, transformOrigin: "540px 900px" })}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: lerp([60, 400, 720][i], 390, merge), top: lerp([330, 280, 350][i], 560, merge), opacity: 1 - clamp((f - 34) / 10), rotate: `${lerp([-8, 4, 7][i], 0, merge)}deg` })}>
            <Note day={BG11_TEXT.notes[i].day} q={BG11_TEXT.notes[i].q} color={NOTE_COLORS[i]} w={300} />
          </div>
        ))}
        <div style={box({ left: 130, top: 470, width: 820, padding: "44px 48px 50px", borderRadius: 26, backgroundColor: "#FFFDF6", fontFamily, color: C.ink, opacity: sheet, transform: `translateY(${(1 - sheet) * 80}px) rotate(-2deg)`, boxShadow: "0 30px 60px rgba(60,40,20,0.3)" })}>
          <div style={{ display: "inline-block", padding: "6px 22px", borderRadius: 12, backgroundColor: C.yellow, fontSize: 64, fontWeight: 900 }}>{p.title}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#5A6B8C", marginTop: 14 }}>{p.days}</div>
          {p.rows.map((r, i) => (
            <div key={r.time} style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 22, opacity: row(i), transform: `translateX(${(1 - row(i)) * -30}px)` }}>
              <div style={{ fontSize: 70, fontWeight: 900 }}>{r.time}</div>
              <div style={{ fontSize: 50, fontWeight: 800 }}>{r.route}</div>
            </div>
          ))}
          <div style={{ marginTop: 28, fontSize: 44, fontWeight: 900, color: "#B5655F", opacity: row(2) }}>{p.question}</div>
        </div>
        {/* карандаш мамы дописывает строки */}
        <div style={box({ left: 640 + Math.sin(f / 4) * 14 + clamp((f - 36) / 36) * 120, top: 760 + clamp((f - 36) / 36) * 120, width: 26, height: 280, borderRadius: 13, backgroundColor: C.navy, rotate: "28deg", transformOrigin: "50% 0%", opacity: sheet * (1 - clamp((f - 80) / 10)) })} />
      </div>
    </div>
  );
};

// Телефон мамы: поиск → BalaGo → «Кантип иштейт?».
export const PHONE = { typeFrom: 10, resultsAt: 44, tapAt: 66, page: 74 };
const PhoneCloseUp: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const u = easeOut(f / 12);
  const scroll = easeInOut((f - PHONE.page - 50) / Math.max(30, len - PHONE.page - 60));
  return (
    <div style={box({ inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #F1DEC2, #B99973)" })}>
      <div style={box({ inset: 0, transform: `translateY(${(1 - u) * 300}px)` })}>
        <PhoneFrame x={170} y={140} w={740} tilt={-1}>
          <div style={box({ left: 0, top: 0, width: 688 / 1.22, height: 1465 / 1.22, transform: "scale(1.22)", transformOrigin: "0 0" })}>
            {f < PHONE.page ? <SearchScreen f={f} typeFrom={PHONE.typeFrom} resultsAt={PHONE.resultsAt} tapAt={PHONE.tapAt} /> : <BalaGoPage f={f} from={PHONE.page} scroll={scroll} />}
          </div>
        </PhoneFrame>
        <HoldingHand x={170} y={140} w={740} sleeve={LOOKS.mom.topColor} skin={LOOKS.mom.skin} />
        <TapFinger x={560} y={560} f={f} tapAt={PHONE.tapAt} skin={LOOKS.mom.skin} />
      </div>
    </div>
  );
};

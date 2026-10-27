// Сцена 2: мама на работе. Телефон на столе светится: рабочая встреча
// сдвинулась и теперь совпадает со временем, когда ребёнок приезжает домой.
// Мама не паникует: «Бүгүн баламды өзүм тосо албайм. Алдын ала ким тосорун
// макулдашайын.» Сама берёт карточку встречи и ставит галочку напротив
// «Эже» (без личных данных). Надпись «Алдын ала макулдашуу».
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { LOOKS } from "../../../two-schedules-2d/rig/looks";
import { easeOut, keys, keysV, type Vec } from "../../../two-schedules-2d/rig/motion";
import { seatH } from "../../../two-schedules-2d/sets/Home";
import { HoldingHand, PhoneFrame, StatusBar } from "../../../two-schedules-2d/screens";
import { camMove, Shot, box } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { useLine, useSceneFrames, useWord } from "../context";
import { BG27_TEXT } from "../script";
import { Marker, MeetingCard, NAVY, OFFICE, OfficeBack, OfficeChairBack, OfficeDeskFront, YELLOW } from "../sets";

export const MOM: Place = { x: OFFICE.mom, y: OFFICE.seatY, h: 760 };
const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });
const onDesk = (x: number, dy = 0): Vec => ({ x, y: OFFICE.deskTop + 6 + dy });
const typing = (k: number, t: number): Vec => onDesk(OFFICE.laptop - 150 + k * 40 + Math.sin(t * 1.7 + k) * 4, -6 - Math.abs(Math.sin(t * 1.3 + k * 2)) * 6);
const PHONE_DESK = onDesk(OFFICE.phone.x + 100, -4);
const CARD_DESK = onDesk(OFFICE.card.x, -4);
const CHEST: Vec = at(MOM, -0.06, -0.62);

// Моменты сцены (кадры). Реплика m1 — по фактической озвучке.
export const useMomBeats = () => {
  const m1 = useLine("m1");
  const plan = useWord("m1", 5); // «Алдын ала…»
  const end = useSceneFrames("mom");
  return {
    glow: 16,
    grab: 30,
    insertFrom: 50,
    insertTo: Math.max(96, m1.from + 4),
    plan,
    putDown: Math.max(plan + 6, m1.to - 30),
    takeCard: m1.to + 4,
    cardFrom: m1.to + 34,
    tick: m1.to + 60,
    end,
  };
};

const PhoneNotice: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const a = easeOut((f - at) / 10);
  const t = BG27_TEXT.mom;
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #EAF1FA, #F7F9FC)" })}>
      <StatusBar time="13:42" />
      <div style={box({ left: 40, right: 40, top: 120, padding: "28px 30px", borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 14px 34px rgba(20,40,90,0.14)", opacity: a, translate: `0 ${(1 - a) * -40}px` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, backgroundColor: "#E5677A", color: "#FFFFFF", fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>31</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{t.notice}</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 52, fontWeight: 900, color: "#C2394B" }}>{t.time}</div>
      </div>
      {/* день: встреча теперь перекрывает приезд ребёнка домой */}
      <div style={box({ left: 30, right: 120, top: 470, height: 560 })}>
        {["15:00", "16:00", "17:00"].map((h, i) => (
          <div key={h} style={box({ left: 0, right: 0, top: i * 180, borderTop: "3px solid #DCE3EE", fontSize: 30, fontWeight: 800, color: "#7A88A6", paddingTop: 6 })}>{h}</div>
        ))}
        <div style={box({ left: 100, right: 0, top: 90 + 180 * easeOut((f - at - 8) / 14), height: 270, borderRadius: 20, backgroundColor: "rgba(229,103,122,0.22)", border: "4px solid #E5677A", boxSizing: "border-box", padding: 14, fontSize: 32, fontWeight: 900, color: "#B03046" })}>Жолугушуу</div>
        <div style={box({ left: 100, right: 0, top: 180, height: 84, borderRadius: 18, backgroundColor: SOFT, border: `4px solid ${YELLOW}`, boxSizing: "border-box", padding: "10px 16px", fontSize: 30, fontWeight: 900, color: NAVY })}>16:00 · Бала үйгө келет</div>
      </div>
    </div>
  );
};
const SOFT = "#FFF4C2";

// Вид сверху: карточка на столе, рука мамы ставит галочку напротив «Эже».
const CardInsert: React.FC<{ f: number; from: number; tick: number }> = ({ f, from, tick }) => {
  const r = f - from;
  const draw = easeOut((f - tick) / 14);
  const pen = keysV(f, [[from, { x: 1240, y: 1500 }], [tick - 10, { x: 905, y: 1030 }], [tick, { x: 905, y: 1030 }], [tick + 7, { x: 925, y: 1060 }], [tick + 14, { x: 965, y: 990 }], [tick + 34, { x: 1180, y: 1420 }]]);
  const label = easeOut((f - (tick + 12)) / 12);
  const cam = camMove(f, from, from + 140, { x: 540, y: 980, zoom: 1.0 }, { x: 560, y: 990, zoom: 1.08 });
  const sleeve = LOOKS.mom.topColor;
  const skin = LOOKS.mom.skin;
  return (
    <Shot
      f={f}
      from={from}
      to={100000}
      cam={cam}
      bg="#C49E73"
      overlay={
        <div style={box({ left: 60, right: 60, top: 300, textAlign: "center", opacity: label, translate: `0 ${(1 - label) * 24}px`, fontFamily })}>
          <span style={{ display: "inline-block", padding: "16px 34px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 58, fontWeight: 900, color: NAVY, boxShadow: "0 12px 30px rgba(20,40,90,0.2)" }}>{BG27_TEXT.mom.agree}</span>
        </div>
      }
    >
      <div style={box({ left: -300, top: -300, width: 1700, height: 2600, backgroundColor: "#C49E73", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 4px, transparent 4px 220px)" })} />
      <div style={box({ left: 90, top: 560 + (1 - easeOut(r / 12)) * 60, rotate: "-3deg" })}>
        <MeetingCard w={900} tick={draw} frame={0} />
      </div>
      {/* ручка в руке */}
      <div style={box({ left: pen.x, top: pen.y, width: 1, height: 1 })}>
        <div style={box({ left: 40, top: 120, width: 200, height: 520, borderRadius: 90, backgroundColor: sleeve, rotate: "-32deg", transformOrigin: "50% 0" })} />
        <div style={box({ left: 18, top: 60, width: 130, height: 150, borderRadius: 60, backgroundColor: skin, rotate: "-32deg" })} />
        <div style={box({ left: -6, top: -20, width: 22, height: 190, borderRadius: 10, backgroundColor: NAVY, rotate: "-32deg", transformOrigin: "50% 100%" })} />
      </div>
    </Shot>
  );
};

export const MomScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = useMomBeats();
  const m1 = useLine("m1");

  const momPose = (t: number): PoseIn => {
    const phoneUp = t >= b.grab + 8 && t < b.putDown + 10;
    const cardUp = t >= b.takeCard + 10;
    return {
      sit: 1,
      seat: seatH(MOM.h),
      expr: t < b.glow + 10 ? "calm" : t < b.plan ? "worried" : "softSmile",
      lookY: t < b.grab ? 0.45 : 0.3,
      armL: {
        target: keysV(t, [
          [0, typing(0, t / 3)],
          [b.grab - 4, typing(0, t / 3)],
          [b.grab + 8, PHONE_DESK],
          [b.grab + 22, CHEST],
          [b.putDown, CHEST],
          [b.putDown + 10, PHONE_DESK],
          [b.takeCard, CARD_DESK],
          [b.takeCard + 10, CARD_DESK],
          [b.takeCard + 26, at(MOM, -0.1, -0.6)],
        ]),
        shape: phoneUp ? "phone" : cardUp ? "pinch" : "relax",
        item: phoneUp ? "phone" : cardUp ? "card" : "none",
        itemColor: cardUp ? "#FFFFFF" : undefined,
        glow: phoneUp ? 1 : 0,
        itemTilt: phoneUp ? -12 : 0,
        elbow: "down",
        behind: false,
      },
      armR: { target: t < b.grab + 20 ? typing(2, t / 3) : onDesk(MOM.x + 0.14 * MOM.h, -4), shape: "relax", elbow: "down" },
    };
  };
  const face = (t: number) => keys(t, [[0, 0.35], [b.glow + 4, 0.35], [b.glow + 12, -0.3], [b.grab + 20, -0.1], [m1.from, 0.05], [b.takeCard, -0.25], [b.takeCard + 20, 0]]);
  const minutes = 13 * 60 + 42 + f / 60;
  const office = (
    <>
      <OfficeBack minutes={minutes} />
      <OfficeChairBack x={MOM.x} />
      <Actor uid="m-mom" look="mom" f={f} place={() => MOM} face={face} pose={momPose} role="mother" seed={1} layer="body" />
      <OfficeDeskFront phoneGlow={f >= b.glow && f < b.grab + 8 ? 0.6 + 0.4 * Math.sin(f / 2) : 0} phoneOnDesk={f < b.grab + 8 || (f >= b.putDown + 10)} cardOnDesk={f < b.takeCard + 10} />
      <Actor uid="m-mom" look="mom" f={f} place={() => MOM} face={face} pose={momPose} role="mother" seed={1} layer="arms" />
    </>
  );
  const camA = camMove(f, 0, b.insertFrom, { x: 620, y: 1010, zoom: 0.98 }, { x: 600, y: 1000, zoom: 1.05 });
  const camC = camMove(f, b.insertTo, b.cardFrom, { x: 560, y: 960, zoom: 1.3 }, { x: 545, y: 980, zoom: 1.38 });
  const ins = f - b.insertFrom;
  return (
    <>
      <Shot f={f} from={0} to={b.insertFrom} cam={camA}>
        {office}
      </Shot>
      <Shot f={f} from={b.insertFrom} to={b.insertTo} cam={{ x: 540, y: 960, zoom: 1 }} bg="#DDE7F2">
        <div style={box({ left: 0, top: 0, translate: `0 ${(1 - easeOut(ins / 10)) * 90}px` })}>
          <PhoneFrame x={250} y={360} w={580}>
            <PhoneNotice f={f} at={b.insertFrom + 4} />
          </PhoneFrame>
          <HoldingHand x={250} y={360} w={580} sleeve={LOOKS.mom.topColor} skin={LOOKS.mom.skin} />
        </div>
      </Shot>
      <Shot f={f} from={b.insertTo} to={b.cardFrom} cam={camC}>
        {office}
      </Shot>
      <CardInsert f={f} from={b.cardFrom} tick={b.tick} />
      <Marker text={BG27_TEXT.marker} f={f} />
    </>
  );
};

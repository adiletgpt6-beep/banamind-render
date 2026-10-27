import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { clamp, keys, keysV } from "../rig/motion";
import { HoldingHand, OutgoingCallScreen, PhoneFrame, PhoneIcon, TouchFinger } from "../screens";
import { NB2_CALLS, NB2_SCENES } from "../script";
import { CoffeeTable, LivingRoom, WarmLight } from "../sets/LivingRoom";
import { box, Shot } from "../shots";

const MOM: Place = { x: 890, y: 1700, h: 740 };
// Соединение — на крупном плане экрана (OutgoingCallScreen, 24-й кадр звонка).
const CONNECT = 24;
const SEARCH = NB2_SCENES.find((s) => s.id === "search")!;
const FROM = SEARCH.from;
const SCENE_FRAMES = Math.round((SEARCH.to - SEARCH.from) * 30);
const OTHER: Place = { x: 630, y: 1750, h: 870 };
const CallerRoom: React.FC<{ kind: "grandmother" | "brother" | "friend" }> = ({ kind }) => <div style={box({ width: 1800, height: 2300 })}>
  <div style={box({ inset: 0, background: kind === "brother" ? "linear-gradient(120deg, #D2DEE9, #AEBCCD)" : "linear-gradient(120deg, #F6E9D7, #DFCFB8)" })} />
  <div style={box({ left: 1140, top: 550, width: 360, height: 610, border: "18px solid #FBF3E9", borderRadius: 22, background: "linear-gradient(#33456C,#665E80 65%,#B47E69)", boxShadow: "0 14px 45px #29334B22" })} />
  <div style={box({ left: 1130, top: 530, width: 70, height: 660, background: "#B98B74", borderRadius: 10 })} />
  <div style={box({ left: 1450, top: 530, width: 70, height: 660, background: "#B98B74", borderRadius: 10 })} />
  <div style={box({ left: 0, right: 0, top: 1710, height: 590, background: "linear-gradient(#AE8A6A,#88664F)" })} />
  <div style={box({ left: 220, top: 1510, width: 790, height: 38, borderRadius: 12, background: "#AB7F5D" })} />
  <div style={box({ left: 270, top: 1548, width: 25, height: 180, background: "#886548" })} />
  {kind === "grandmother" ? <>
    <div style={box({ left: 380, top: 670, width: 270, height: 210, borderRadius: 14, background: "#FFFDF5", rotate: "-3deg", boxShadow: "0 12px 25px #29213A11", fontFamily, padding: 30, boxSizing: "border-box", fontWeight: 800, color: "#50695B", fontSize: 35 })}>Дарыгерге<br /><span style={{ fontSize: 60 }}>08:00</span></div>
    <div style={box({ left: 780, top: 1390, width: 150, height: 130, background: "#855E4D", borderRadius: 30 })} />
    <div style={box({ left: 790, top: 1358, width: 95, height: 34, border: "8px solid #855E4D", borderRadius: 30 })} />
  </> : kind === "brother" ? <>
    {/* вечер перед ночной сменой: табличка смены, рабочая куртка со светоотражающими полосами */}
    <div style={box({ left: 380, top: 710, width: 300, height: 150, borderRadius: 16, background: "#435A77", color: "#FFF", fontFamily, padding: 26, boxSizing: "border-box", fontSize: 36, fontWeight: 800, lineHeight: 1.2 })}>Түнкү жумуш<br /><span style={{ fontSize: 30, opacity: 0.85 }}>20:00 – 08:00</span></div>
    <div style={box({ left: 820, top: 900, width: 170, height: 300, borderRadius: "40px 40px 18px 18px", background: "#E0702F" })} />
    <div style={box({ left: 820, top: 1010, width: 170, height: 22, background: "#E9EEF2" })} />
    <div style={box({ left: 820, top: 1080, width: 170, height: 22, background: "#E9EEF2" })} />
    <div style={box({ left: 890, top: 880, width: 30, height: 30, borderRadius: 15, background: "#5A4636" })} />
  </> : <>
    {/* подруга живёт в другой части города: карта с двумя метками далеко друг от друга */}
    <div style={box({ left: 300, top: 640, width: 380, height: 300, borderRadius: 18, border: "12px solid #B19076", background: "#E9E4CF", overflow: "hidden" })}>
      <svg width={356} height={276} viewBox="0 0 356 276">
        <path d="M 0 90 Q 120 70 200 120 T 356 110" stroke="#FFFFFF" strokeWidth={14} fill="none" />
        <path d="M 120 0 Q 140 140 100 276" stroke="#FFFFFF" strokeWidth={12} fill="none" />
        <path d="M 250 0 L 270 276" stroke="#FFFFFF" strokeWidth={10} fill="none" />
        <path d="M 52 222 Q 150 210 190 150 T 302 52" stroke="#3A4F80" strokeWidth={6} strokeDasharray="12 10" fill="none" />
        <circle cx={52} cy={222} r={20} fill="#FFC90E" stroke="#14285A" strokeWidth={4} />
        <path d="M 302 22 C 286 22 280 38 286 50 L 302 74 L 318 50 C 324 38 318 22 302 22 Z" fill="#E2433A" />
        <circle cx={302} cy={40} r={7} fill="#FFFFFF" />
      </svg>
    </div>
    <div style={box({ left: 790, top: 1360, width: 124, height: 156, borderRadius: "30px 30px 18px 18px", background: "#BD9556" })} />
  </>}
</div>;

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const abs = FROM + f / 30;
  const cues = useContext(CuesContext);
  const call = NB2_CALLS.find(c => abs >= c.from && abs < c.to) ?? NB2_CALLS[NB2_CALLS.length - 1];
  const idx = NB2_CALLS.indexOf(call);
  // реплики звонка по порядку: просьба мамы, ответ, (у подруги) ответ мамы
  const lines = call.lines.map(id => cues.find(c => c.id === id)!);
  const request = lines[0];
  const response = lines[1];
  const last = lines[lines.length - 1];
  const local = (abs - call.from) * 30;
  const duration = (call.to - call.from) * 30;
  const fr = (sec: number) => (sec - call.from) * 30;
  const replyEnd = fr(response.to);
  const lastEnd = fr(last.to);
  const otherSpeaking = lines.some(c => c.role !== "mother" && abs >= c.from - 0.18 && abs < c.to + 0.22);
  const after = abs > response.to;
  const ending = local >= duration - 22;
  const closeup = local < 32 || ending;
  const dialFrame = ending ? local - (duration - 22) : local;
  const low = { x: 845, y: 1255 };
  const earMom = { x: 815, y: 1190 };
  const askFrom = fr(request.from);
  const askTo = fr(request.to);
  const closing = lines[2];
  const knee = { x: 969, y: 1450 };
  // свободная рука: у каждого звонка свой небольшой жест по смыслу
  const freeHand = (cf: number) => {
    if (idx === 0) return keysV(cf, [[askFrom - 4, knee], [askFrom + 10, { x: 925, y: 1300 }], [askTo - 4, { x: 930, y: 1310 }], [askTo + 10, knee]]);
    if (idx === 1) return keysV(cf, [[askFrom - 4, knee], [askFrom + 12, { x: 900, y: 1395 }], [replyEnd + 4, { x: 900, y: 1395 }], [replyEnd + 18, knee]]);
    const c0 = closing ? fr(closing.from) : lastEnd;
    return keysV(cf, [[c0 - 4, knee], [c0 + 14, { x: 935, y: 1310 }], [c0 + 40, { x: 940, y: 1320 }], [lastEnd - 6, { x: 945, y: 1340 }], [lastEnd + 10, knee]]);
  };
  const motherPose = (t: number): PoseIn => {
    const cf = t - (call.from - FROM) * 30;
    const open = (idx === 0 && cf > askFrom + 4 && cf < askTo + 4) || (idx === 2 && closing && cf > fr(closing.from) + 8 && cf < lastEnd - 4);
    return {
      sit: 1, seat: 280, packOff: true,
      // надежда на просьбе → после ответа чуть собраннее и усталее
      expr: closing && abs >= closing.from - 0.1 ? (abs > last.to - 0.6 ? "calm" : "tired") : after ? (idx === 0 ? "softSmile" : idx === 1 ? "thinking" : "worried") : otherSpeaking ? "calm" : idx === 0 ? "softSmile" : "calm",
      lookY: keys(cf, [[0, 0.55], [30, 0.55], [43, 0.05], [lastEnd + 4, 0.05], [lastEnd + 24, 0.55]]) + (idx === 1 ? keys(cf, [[replyEnd + 4, 0], [replyEnd + 14, 0.3], [replyEnd + 34, 0.3], [replyEnd + 46, 0]]) : 0),
      headTilt: idx === 2 && after ? keys(cf, [[replyEnd, 0], [replyEnd + 12, -4], [lastEnd - 10, -4], [lastEnd + 6, 0]]) : otherSpeaking ? -2 : 0,
      // брат: небольшой перенос веса вперёд на просьбе
      lean: idx === 1 ? keys(cf, [[askFrom - 6, 0], [askFrom + 10, 6], [replyEnd, 6], [replyEnd + 20, 0]]) : 0,
      armL: { target: keysV(cf, [[0, low], [28, low], [42, earMom], [lastEnd + 5, earMom], [lastEnd + 22, low]]), shape: "phone", item: "phone", itemTilt: -6, elbow: "down", behind: false },
      armR: { target: freeHand(cf), shape: open ? "open" : "relax", elbow: "down" },
      nod: idx === 0 ? keys(cf, [[replyEnd + 1, 0], [replyEnd + 9, 4], [replyEnd + 19, 0]]) : idx === 2 ? keys(cf, [[lastEnd - 14, 0], [lastEnd - 6, 3], [lastEnd + 4, 0]]) : 0,
      exhale: keys(cf, [[replyEnd + 3, 0], [replyEnd + 12, idx === 0 ? 0.1 : idx === 1 ? 0.35 : 0.25], [replyEnd + 30, 0]]),
    };
  };
  // после ответа брата — короткий взгляд в сторону; у подруги — к ней
  const momFace = (t: number) => {
    const cf = t - (call.from - FROM) * 30;
    return idx === 1 ? keys(cf, [[replyEnd + 2, -0.25], [replyEnd + 12, 0.25], [replyEnd + 34, 0.25], [replyEnd + 46, -0.25]]) : -0.25;
  };
  const b = LOOKS[call.look].build;
  const ear = { x: OTHER.x + (b.headRx + 34) * OTHER.h / 1000, y: OTHER.y + (b.headY + 70) * OTHER.h / 1000 };
  const replyStart = (response.from - FROM) * 30;
  const otherPose = (t: number): PoseIn => ({
    expr: call.role === "friend" ? "softSmile" : "calm", lookY: 0.1, headTilt: call.role === "grandmother" ? 3 : 0,
    armR: { target: ear, shape: "phone", item: "phone", itemTilt: 5, elbow: "down", behind: false },
    armL: { target: keysV(t, [[replyStart - 4, { x: OTHER.x - 100, y: OTHER.y - 385 }], [replyStart + 25, { x: OTHER.x - 125, y: OTHER.y - 405 }], [replyStart + 50, { x: OTHER.x - 110, y: OTHER.y - 400 }], [replyStart + 88, { x: OTHER.x - 100, y: OTHER.y - 385 }]]), shape: "open", elbow: "down", behind: false },
    nod: keys(t, [[replyStart + 10, 0], [replyStart + 18, 3], [replyStart + 28, 0]]),
    lean: call.role === "grandmother" ? 2 : 0,
  });
  const momWorld = <>
    <LivingRoom phoneOnTable={false} />
    <Actor uid="calls-mother" look="mom" f={f} place={() => MOM} face={momFace} pose={motherPose} role="mother" seed={1} />
    <CoffeeTable packOpen={false} /><WarmLight />
  </>;
  const callerWorld = <>
    <CallerRoom kind={call.role} />
    <Actor uid={"caller-" + call.role} look={call.look} f={f} place={() => OTHER} face={() => 0.28} pose={otherPose} role={call.role} seed={call.role === "grandmother" ? 5 : call.role === "brother" ? 6 : 7} />
  </>;
  const scale = 620 * 0.93 / 676;
  const button = { x: 230 + 620 * 0.035 + 338 * scale, y: 245 + 620 * 0.035 + 1065 * scale };
  const tap = ending ? 11 : 8;
  const finger = keysV(dialFrame, [[0, { x: button.x - 70, y: button.y + 180 }], [tap, button], [tap + 4, button], [tap + 12, { x: button.x - 120, y: button.y + 310 }]]);
  return <>
    {closeup ? <>
      <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 36%, #F3DEC0, #BB9779)" })} />
      <PhoneFrame x={230} y={245} w={620} tilt={0} contentWidth={676}>
        <OutgoingCallScreen contact={call.contact} f={dialFrame} ending={ending} />
      </PhoneFrame>
      <HoldingHand x={230} y={245} w={620} sleeve={LOOKS.mom.topColor} skin={LOOKS.mom.skin} thumbAt={0.82} />
      <TouchFinger x={finger.x} y={finger.y} skin={LOOKS.mom.skin} sleeve={LOOKS.mom.topColor} opacity={1 - clamp((dialFrame - tap - 6) / 10)} />
      <div style={box({ left: 74, right: 74, top: 112, fontFamily, fontSize: 46, fontWeight: 900, color: "#263A58", textAlign: "center" })}>{ending ? (dialFrame < tap ? "Чалууну бүтүрүү" : "Сүйлөшүү аяктады") : call.title}</div>
    </> : <>
      <Shot f={f} from={0} to={SCENE_FRAMES} cam={otherSpeaking ? { x: 625, y: 1110, zoom: 1.58 } : { x: 875, y: 1175, zoom: 1.72 }}>
        {otherSpeaking ? callerWorld : momWorld}
      </Shot>
      {/* компактная плашка звонка: контакт и время разговора с момента соединения */}
      <div style={box({ left: 56, top: 150, padding: "12px 24px 12px 14px", borderRadius: 999, background: "rgba(33,59,89,0.86)", color: "#FFF", fontFamily, display: "flex", alignItems: "center", gap: 14 })}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#4FAD73", display: "flex", alignItems: "center", justifyContent: "center" }}><PhoneIcon size={28} /></div>
        <span style={{ fontSize: 36, fontWeight: 900 }}>{call.contact}</span>
        <span style={{ fontSize: 30, fontWeight: 700, opacity: 0.85 }}>00:{String(Math.floor(Math.max(0, local - CONNECT) / 30)).padStart(2, "0")}</span>
      </div>
    </>}
  </>;
};

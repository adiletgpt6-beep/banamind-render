// Сцена 13. Родители сами находят решение.
// A. Вечер, стол, тёплая лампа. Айжан и папа разговаривают (M07, F02);
//    дочка сидит на краю стола со своим альбомом и рисует — разговор не
//    об обвинении. Папа берёт телефон.
// B. Телефон крупно (его рука, касания пальцем — экран меняется только
//    после касания):
//    1) поиск «Бишкек балдар үчүн такси» (короткие касания клавиш);
//    2) результат BalaGo — без рейтингов и числа поездок;
//    3) страница BalaGo: логотип, «Балдар үчүн такси», приём
//       предварительных обращений; касание выделяет «Мектеп → Үй» (M08).
// C. Родители вдвоём смотрят на экран — сами решают обратиться (F03).
// D. Касание «WhatsApp аркылуу жазуу» → переписка с BalaGo (номер не
//    показан), короткий текст обращения, касание «отправить» →
//    «Жөнөтүлдү» — отправлено обращение, не одобрен маршрут.
// E. Телефон ложится на стол.
// Постановочный экран: внешние сервисы при работе над роликом не
//    получают сообщений.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Paper, Shot, Svg, useScene } from "../kit";
import { CloseHand } from "../props/CloseHand";
import { KITCHEN, KitchenBack, KitchenTable } from "../sets/Kitchen";

const DAD_HAND = { skin: "#DCAA84", shade: "#B9845F", sleeve: "#718B7A", cuff: "#5F7767" } as const;
const PH = { x: 250, y: 300, w: 580, h: 1160 };
const SCR = { x: PH.x + 24, y: PH.y + 66, w: PH.w - 48, h: PH.h - 132 };
export const PHONE_SCREEN = SCR;

export const searchPlan = (T: { to: (id: string) => number; from: (id: string) => number; word: (id: string, w: string) => number; len: number }) => {
  const f02End = T.to("F02");
  const phone = f02End + 8;
  const tapSearch = phone + 8;
  const typeFrom = phone + 16;
  const q = T3B_TEXT.search.query;
  const typeTo = typeFrom + q.length * 2;
  const m08 = T.from("M08");
  const tapResult = Math.min(m08 - 18, typeTo + 14);
  const pageAt = tapResult + 5;
  const route = T.word("M08", "Алдын");
  const two: [number, number] = [T.word("M08", "калтырсак") - 2, T.to("F03") + 6];
  const cta = two[1] + 10;
  const chatAt = cta + 6;
  const typeMsg: [number, number] = [chatAt + 10, chatAt + 52];
  const send = typeMsg[1] + 10;
  const sent = send + 4;
  const down = sent + 46;
  return { f02End, phone, tapSearch, typeFrom, typeTo, tapResult, pageAt, m08, route, two, cta, chatAt, typeMsg, send, sent, down, len: T.len, m07: T.from("M07") };
};
type P = ReturnType<typeof searchPlan>;

// ---------- Экран телефона ----------
const Screen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const q = T3B_TEXT.search.query;
  const typed = q.slice(0, Math.max(0, Math.min(q.length, Math.floor((f - p.typeFrom) / 2) + 1)));
  const state = f < p.typeTo + 6 ? "search" : f < p.pageAt ? "results" : f < p.chatAt ? "page" : "chat";
  const routeOn = f >= p.route;
  const msg = T3B_TEXT.chat.text;
  const words = msg.split(" ");
  const nWords = Math.round(words.length * clamp((f - p.typeMsg[0]) / (p.typeMsg[1] - p.typeMsg[0])));
  const inputText = f >= p.sent ? "" : words.slice(0, nWords).join(" ");
  return (
    <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, backgroundColor: "#FBF8F2", overflow: "hidden", borderRadius: 26 })}>
      {state === "search" || state === "results" ? (
        <>
          <div style={box({ left: 26, top: 90, width: SCR.w - 52, height: 92, backgroundColor: "#FFFFFF", border: `4px solid ${f >= p.tapSearch ? C.navy : "#CFC8BA"}`, borderRadius: 46, boxSizing: "border-box" })}>
            <div style={box({ left: 28, top: 20, width: SCR.w - 110, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: f >= p.typeFrom ? C.navy : "#9A948A", whiteSpace: "nowrap", overflow: "hidden" })}>{f >= p.typeFrom ? typed : T3B_TEXT.search.hint}</div>
          </div>
          {state === "search" ? (
            <div style={box({ left: 0, top: SCR.h - 360, width: SCR.w, height: 360, backgroundColor: "#D9D5CC" })}>
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 10 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 10 + c * ((SCR.w - 20) / 10), top: 20 + r * 82, width: (SCR.w - 20) / 10 - 8, height: 66, backgroundColor: "#FFFFFF", borderRadius: 10 })} />),
              )}
            </div>
          ) : (
            [
              { t: "BalaGo", s: "Балдар үчүн такси" },
              { t: "Мектеп жолу", s: "Макала" },
              { t: "Шаардык транспорт", s: "Маалымат" },
            ].map((r, i) => (
              <div key={r.t} style={box({ left: 26, top: 230 + i * 180, width: SCR.w - 52, height: 150, backgroundColor: i === 0 && f >= p.tapResult ? "#FFF3C4" : "#FFFFFF", borderRadius: 18, border: "3px solid #E2DDD2", boxSizing: "border-box", padding: "22px 26px" })}>
                <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 40, color: i === 0 ? C.navy : C.inkSoft }}>{r.t}</div>
                <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 30, color: C.inkSoft, marginTop: 6 }}>{r.s}</div>
              </div>
            ))
          )}
        </>
      ) : null}
      {state === "page" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 470, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={box({ left: SCR.w / 2 - 160, top: 40, width: 320, height: 320 })} />
          <div style={box({ left: 0, top: 380, width: SCR.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.navy })}>{T3B_TEXT.page.tagline}</div>
          <div style={box({ left: 26, top: 500, width: SCR.w - 52, padding: "18px 22px", boxSizing: "border-box", backgroundColor: "#FFFFFF", borderRadius: 18, fontFamily: F.text, fontWeight: 800, fontSize: 34, lineHeight: 1.2, color: C.navy })}>{T3B_TEXT.page.status}</div>
          <div style={box({ left: 26, top: 660, width: SCR.w - 52, height: 100, backgroundColor: routeOn ? C.navy : "#FFFFFF", border: `4px solid ${C.navy}`, borderRadius: 50, boxSizing: "border-box", textAlign: "center", lineHeight: "92px", fontFamily: F.display, fontWeight: 900, fontSize: 48, color: routeOn ? C.yellow : C.navy })}>{T3B_TEXT.page.route}</div>
          <div style={box({ left: 26, top: 800, width: SCR.w - 52, height: 110, backgroundColor: f >= p.cta && f < p.cta + 5 ? "#1E8F4E" : "#25A35A", borderRadius: 18, textAlign: "center", lineHeight: "110px", fontFamily: F.text, fontWeight: 800, fontSize: 33, color: C.white, whiteSpace: "nowrap" })}>{T3B_TEXT.page.cta}</div>
        </>
      ) : null}
      {state === "chat" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 140, backgroundColor: "#1F7A4C" })} />
          <div style={box({ left: 26, top: 46, width: 64, height: 64, borderRadius: 32, backgroundColor: C.yellow })} />
          <div style={box({ left: 110, top: 52, fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.white })}>{T3B_TEXT.chat.title}</div>
          <div style={box({ left: 0, top: 140, width: SCR.w, height: SCR.h - 140, backgroundColor: "#ECE5D8" })} />
          {f >= p.sent ? (
            <div style={box({ left: 70, top: 220, width: SCR.w - 100, padding: "22px 24px 50px", boxSizing: "border-box", backgroundColor: "#DCF4C9", borderRadius: "24px 24px 6px 24px", fontFamily: F.text, fontWeight: 800, fontSize: 34, lineHeight: 1.25, color: C.navy, opacity: easeOut(clamp((f - p.sent) / 6)), transform: `translateY(${(1 - easeOut(clamp((f - p.sent) / 8))) * 30}px)` })}>
              {msg}
              <div style={box({ right: 20, bottom: 12, fontSize: 26, color: "#2F7A4A" })}>{`✓ ${T3B_TEXT.chat.sent}`}</div>
            </div>
          ) : null}
          <div style={box({ left: 20, top: SCR.h - 260, width: SCR.w - 130, minHeight: 90, padding: "20px 24px", boxSizing: "border-box", backgroundColor: "#FFFFFF", borderRadius: 30, fontFamily: F.text, fontWeight: 800, fontSize: 28, lineHeight: 1.2, color: C.navy })}>{inputText}</div>
          <div style={box({ left: SCR.w - 100, top: SCR.h - 250, width: 80, height: 80, borderRadius: 40, backgroundColor: f >= p.send && f < p.send + 4 ? "#145C38" : "#1F7A4C" })}>
            <svg width={80} height={80}>
              <path d="M 24 22 L 60 40 L 24 58 L 30 40 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </>
      ) : null}
    </div>
  );
};

// Касания: палец подходит, касается (экран меняется), отходит.
const taps = (p: P) => {
  const out: { at: number; tip: { x: number; y: number } }[] = [{ at: p.tapSearch, tip: { x: SCR.x + SCR.w / 2, y: SCR.y + 136 } }];
  const q = T3B_TEXT.search.query;
  const KEYS_Y = SCR.y + SCR.h - 320;
  for (let i = 0; i < q.length; i += 2) out.push({ at: p.typeFrom + i * 2, tip: { x: SCR.x + 40 + ((i * 7) % 10) * ((SCR.w - 60) / 10), y: KEYS_Y + 40 + ((i * 3) % 4) * 82 } });
  out.push({ at: p.tapResult, tip: { x: SCR.x + SCR.w / 2, y: SCR.y + 300 } });
  out.push({ at: p.route, tip: { x: SCR.x + SCR.w / 2, y: SCR.y + 710 } });
  out.push({ at: p.cta, tip: { x: SCR.x + SCR.w / 2, y: SCR.y + 855 } });
  out.push({ at: p.send, tip: { x: SCR.x + SCR.w - 60, y: SCR.y + SCR.h - 210 } });
  return out;
};
const L = 200;
const ANG = 150;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (ANG * Math.PI) / 180;
  const lx = 0.78 * L * 0.22;
  const ly = L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

const PhoneClose: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const ts = taps(p);
  let tip = { x: PH.x + PH.w + 80, y: PH.y + PH.h * 0.8 };
  let press = 0;
  for (let i = 0; i < ts.length; i++) {
    const a = ts[i];
    const prev = ts[i - 1];
    const from = prev ? prev.tip : tip;
    const lead = prev ? Math.min(8, Math.max(2, a.at - prev.at - 1)) : 8;
    if (f >= a.at - lead && f <= a.at + 2) {
      const u = easeInOut(clamp((f - (a.at - lead)) / lead));
      tip = { x: lerp(from.x, a.tip.x, u), y: lerp(from.y, a.tip.y, u) - (1 - u) * 24 };
      press = f >= a.at && f <= a.at + 2 ? 1 : 0;
      break;
    }
    if (f > a.at + 2 && (!ts[i + 1] || f < ts[i + 1].at - 8)) tip = { x: a.tip.x + 60, y: a.tip.y + 60 };
  }
  const w = wristFor(tip);
  return (
    <AbsoluteFill style={{ backgroundColor: "#EFE2C9" }}>
      <Paper color="#EFE2C9" dots="rgba(24,38,56,0.06)" />
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: C.navy, borderRadius: 60 })} />
      <div style={box({ left: PH.x + 12, top: PH.y + 12, width: PH.w - 24, height: PH.h - 24, backgroundColor: "#1E2235", borderRadius: 50 })} />
      <Screen f={f} p={p} />
      <Svg>
        <CloseHand x={PH.x + 80} y={PH.y + PH.h + 170} angle={-172} size={240} {...DAD_HAND} shape="grip" mirror armLen={3} />
        <CloseHand x={w.x} y={w.y + press * 4} angle={ANG} size={L} {...DAD_HAND} shape="point" armLen={4} />
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- За столом ----------
const MOM: Place = { x: 380, y: KITCHEN.floorY, h: 770 };
const DAD: Place = { x: 690, y: KITCHEN.floorY, h: 800 };
const KYZ: Place = { x: 120, y: KITCHEN.floorY, h: 590 };
const Table: React.FC<{ f: number; p: P; close?: boolean }> = ({ f, p, close = false }) => {
  const takePhone = keys(f, [[p.f02End - 12, 0], [p.f02End, 1]], anticipate);
  const phoneDown = f >= p.down;
  const momPose = (t: number) => ({
    sit: 1,
    seat: 0.27 * MOM.h,
    expr: t < p.f02End ? ("calm" as const) : ("softSmile" as const),
    lookY: close ? 0.5 : 0.15,
    lookX: close ? 0.3 : 0.4,
    armL: { target: { x: 330, y: KITCHEN.tableTop - 6 }, elbow: "down" as const },
    armR: { target: close ? { x: 520, y: 1110 } : { x: 450, y: KITCHEN.tableTop - 6 }, shape: close ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
  });
  const dadPose = (t: number) => {
    const holding = t >= p.f02End && !(t >= p.down + 10);
    return {
      sit: 1,
      seat: 0.27 * DAD.h,
      lean: close ? 8 : 0,
      expr: "calm" as const,
      lookY: close || holding ? 0.5 : 0.15,
      lookX: close ? -0.3 : -0.4,
      armL: { target: holding ? (close ? { x: 560, y: 1100 } : keysV(t, [[p.down, { x: 600, y: 1150 }], [p.down + 10, { x: 600, y: KITCHEN.tableTop - 6 }]])) : keysV(t, [[p.f02End - 12, { x: 640, y: KITCHEN.tableTop - 6 }], [p.f02End, { x: 600, y: KITCHEN.tableTop - 4 }], [p.f02End + 12, { x: 600, y: 1150 }]], anticipate), shape: holding || takePhone > 0.8 ? ("phone" as const) : ("relax" as const), item: holding ? ("phone" as const) : ("none" as const), glow: holding ? 1 : 0, elbow: "down" as const, behind: false },
      armR: { target: { x: 760, y: KITCHEN.tableTop - 6 }, elbow: "down" as const },
    };
  };
  const kyzPose = (t: number) => ({ sit: 1, seat: 0.33 * KYZ.h, expr: "calm" as const, lookY: 0.7, armR: { target: { x: 220 + 8 * Math.sin(t / 5), y: KITCHEN.tableTop - 8 }, shape: "pinch" as const, item: "pencil" as const, elbow: "down" as const, behind: false }, armL: { target: { x: 170, y: KITCHEN.tableTop - 6 }, elbow: "down" as const } });
  const cam = close ? { x: 540, y: 1060, zoom: 1.6 } : { x: 470, y: 1080, zoom: 1.05 };
  return (
    <Shot f={f} cam={cam} bg="#EFE2C9">
      <KitchenBack />
      <Actor uid="s13-kyz" look="kyzHome" f={f} place={() => KYZ} face={() => 0.3} pose={kyzPose} seed={4} blinkShift={37} layer="body" />
      <Actor uid="s13-mom" look="aizhanHome" f={f} place={() => MOM} face={() => (close ? 0.3 : 0.35)} pose={momPose} role="mother" seed={5} layer="body" />
      <Actor uid="s13-dad" look="ataHome" f={f} place={() => DAD} face={() => (close ? -0.3 : -0.4)} pose={dadPose} role="father" seed={2} blinkShift={23} layer="body" />
      <KitchenTable />
      {/* телефон на столе до и после; альбом дочки */}
      {f < p.f02End || phoneDown ? <div style={box({ left: 585, top: KITCHEN.tableTop - 10, width: 90, height: 12, borderRadius: 4, backgroundColor: C.navy })} /> : null}
      <div style={box({ left: 140, top: KITCHEN.tableTop - 14, width: 170, height: 16, borderRadius: 3, backgroundColor: C.amber })} />
      <Actor uid="s13-kyz" look="kyzHome" f={f} place={() => KYZ} face={() => 0.3} pose={kyzPose} seed={4} blinkShift={37} layer="arms" />
      <Actor uid="s13-mom" look="aizhanHome" f={f} place={() => MOM} face={() => (close ? 0.3 : 0.35)} pose={momPose} role="mother" seed={5} layer="arms" />
      <Actor uid="s13-dad" look="ataHome" f={f} place={() => DAD} face={() => (close ? -0.3 : -0.4)} pose={dadPose} role="father" seed={2} blinkShift={23} layer="arms" />
    </Shot>
  );
};

export const SearchScene: React.FC = () => {
  const { f, to, from, word, len } = useScene("search");
  const p = searchPlan({ to, from, word, len });
  if (f < p.phone) return <Table f={f} p={p} />;
  if (f >= p.two[0] && f < p.two[1]) return <Table f={f} p={p} close />;
  if (f >= p.down - 6) return <Table f={f} p={p} />;
  return <PhoneClose f={f} p={p} />;
};

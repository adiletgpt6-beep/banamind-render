// Видеозвонок. Экран ноутбука и изображение веб-камеры — разные вещи:
//   • MomFeed — то, что видит веб-камера ноутбука мамы: Айжан на заднем
//     сиденье и (при lift > 0) поднятый дочкой лист «3 Б», входящий слева
//     (дочка сидит справа от мамы, камера смотрит маме в лицо — её правая
//     сторона в кадре слева). Изображение не зеркалится: тот же кадр и в
//     окошке «Айжан» у мамы, и на мониторе клиента.
//   • ClientFeed / PartnerFeed — камеры клиента и второго участника.
//   • DeckSlide — демонстрация экрана: презентация вывески кафе «БУЛАК»
//     (два варианта и образцы материалов). Бумажный рисунок в слайд не
//     попадает никогда.
//   • CallScreen — экран ноутбука мамы: слайд, плитки участников и её
//     собственное (крупное) окно; CallEnded — после завершения звонка.
//   • ClientMonitor — монитор клиента: тот же входящий поток мамы крупно и
//     слайд рядом.
// Все размеры — в единицах своего «мира»; Fit масштабирует мир в рамку.
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import type { ExprId, Expression } from "../rig/pose";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { CloseHand } from "./CloseHand";
import { ClassDrawing, SHEET } from "./Drawing";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

export const FEED = { w: 960, h: 540 } as const;

// Мир размера (w, h), вписанный в рамку (x, y, W) — высота по пропорции.
export const Fit: React.FC<{ readonly x: number; readonly y: number; readonly W: number; readonly w: number; readonly h: number; readonly radius?: number; readonly children: React.ReactNode; readonly border?: string }> = ({ x, y, W, w, h, radius = 0, children, border }) => {
  const k = W / w;
  return (
    <div style={box({ left: x, top: y, width: W, height: h * k, overflow: "hidden", borderRadius: radius, boxShadow: border ? `0 0 0 ${Math.max(2, 4 * k)}px ${border}` : undefined })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, transform: `scale(${k})`, transformOrigin: "0 0" })}>{children}</div>
    </div>
  );
};

// ---------- Камера мамы ----------
// Поднятый лист в кадре веб-камеры (единицы FEED): lift 0 — за кадром
// слева снизу, 1 — устойчиво рядом с лицом (лицо не закрыто).
export const sheetInFeed = (lift: number) => {
  const u = easeInOut(clamp(lift));
  return { x: lerp(-380, 70, u), y: lerp(560, 150, u), rot: lerp(-24, -5, u), s: 0.56 };
};

const MOM_FEED: Place = { x: 600, y: 1150, h: 1080 };
const momFeedPlace = () => MOM_FEED;

export type FeedFace = { readonly expr: ExprId | Expression; readonly face: number; readonly lookX?: number; readonly lookY?: number; readonly tilt?: number; readonly nod?: number };

export const MomFeed: React.FC<{ readonly f: number; readonly lift: number; readonly face: (t: number) => FeedFace; readonly uid: string; readonly hand?: number }> = ({ f, lift, face, uid, hand = 0 }) => {
  const sh = sheetInFeed(lift);
  return (
    <div style={box({ left: 0, top: 0, width: FEED.w, height: FEED.h, overflow: "hidden", backgroundColor: "#4A505D" })}>
      {/* салон за мамой: заднее стекло, левое боковое окно, спинка и подголовник */}
      <div style={box({ left: -40, top: -40, width: 1040, height: 190, background: "linear-gradient(180deg, #CFE2F0, #E9E1CF)", borderRadius: "0 0 60px 60px" })} />
      <div style={box({ left: 780, top: 60, width: 220, height: 300, background: "linear-gradient(180deg, #D5E6F2, #EFE6D3)", borderRadius: "40px 0 0 20px" })} />
      <div style={box({ left: 300, top: 170, width: 560, height: 420, backgroundColor: "#5B6270", borderRadius: "70px 70px 0 0" })} />
      <div style={box({ left: 490, top: 92, width: 200, height: 120, backgroundColor: "#666E7C", borderRadius: 34 })} />
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })} />
      <Actor
        uid={`${uid}-mom`}
        look="aizhan"
        f={f}
        place={momFeedPlace}
        face={(t) => face(t).face}
        pose={(t) => {
          const p = face(t);
          return { expr: p.expr, lookX: p.lookX ?? 0, lookY: p.lookY ?? 0, headTilt: p.tilt ?? 0, nod: p.nod ?? 0, armL: { target: { x: 470, y: 900 }, elbow: "down" }, armR: { target: { x: 730, y: 900 }, elbow: "down" } };
        }}
        role="mother"
        seed={5}
      />
      {/* жест к образцу материала: рука мамы поднимает образец в кадр */}
      {hand > 0 ? (
        <svg width={FEED.w} height={FEED.h} style={box({ left: 0, top: 0 })}>
          <g transform={`translate(${lerp(820, 760, easeOut(hand))} ${lerp(640, 380, easeOut(hand))})`}>
            <rect x={-70} y={-60} width={140} height={100} rx={8} fill={C.bulakA} stroke="#22706C" strokeWidth={4} />
            <rect x={-70} y={-60} width={140} height={34} rx={8} fill="#C9A47A" />
          </g>
          <CloseHand x={lerp(860, 800, easeOut(hand))} y={lerp(780, 520, easeOut(hand))} angle={200} size={120} skin="#E3B18C" shade="#CD9870" sleeve="#22334C" cuff="#F7F1E6" shape="grip" armLen={3} />
        </svg>
      ) : null}
      {/* поднятый лист и руки дочки */}
      {lift > 0.001 ? (
        <svg width={FEED.w} height={FEED.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
          <g transform={`translate(${sh.x} ${sh.y}) rotate(${sh.rot}) scale(${sh.s})`}>
            <ClassDrawing id={`${uid}-feed`} />
            {/* пальцы дочки держат нижний край и левый край листа */}
            <CloseHand x={250} y={SHEET.h + 70} angle={172} size={130} skin="#EBBE9A" shade="#D8A57F" sleeve="#26365A" cuff="#FFFFFF" shape="pinch" armLen={5} />
            <CloseHand x={-60} y={SHEET.h * 0.55} angle={-96} size={120} skin="#EBBE9A" shade="#D8A57F" sleeve="#26365A" cuff="#FFFFFF" shape="pinch" mirror armLen={5} />
          </g>
        </svg>
      ) : null}
    </div>
  );
};

// ---------- Камеры клиента и партнёра ----------
const CLIENT_FEED: Place = { x: 470, y: 1160, h: 1100 };
const clientPlace = () => CLIENT_FEED;
export const ClientFeed: React.FC<{ readonly f: number; readonly face: (t: number) => FeedFace; readonly uid: string }> = ({ f, face, uid }) => (
  <div style={box({ left: 0, top: 0, width: FEED.w, height: FEED.h, overflow: "hidden", backgroundColor: "#EFE3CF" })}>
    {/* кабинет кафе: окно, полка, растение, постер «БУЛАК» */}
    <div style={box({ left: 0, top: 0, width: 960, height: 540, background: "linear-gradient(180deg, #F3E7D2, #E7D5B9)" })} />
    <div style={box({ left: 600, top: 40, width: 240, height: 300, backgroundColor: C.glass, border: "14px solid #FFFFFF", boxSizing: "border-box" })} />
    <div style={box({ left: 120, top: 80, width: 200, height: 118, backgroundColor: C.bulakA, borderRadius: 14, color: "#FFFFFF", fontFamily: F.display, fontWeight: 900, fontSize: 50, textAlign: "center", lineHeight: "118px" })}>{T3B_TEXT.client}</div>
    <div style={box({ left: 190, top: 360, width: 70, height: 100, backgroundColor: "#B5714F", borderRadius: "0 0 20px 20px" })} />
    <div style={box({ left: 160, top: 260, width: 130, height: 115, backgroundColor: "#6E9A6A", borderRadius: "70px 70px 30px 30px" })} />
    <Actor
      uid={`${uid}-client`}
      look="client"
      f={f}
      place={clientPlace}
      face={(t) => face(t).face}
      pose={(t) => {
        const p = face(t);
        return { expr: p.expr, lookX: p.lookX ?? 0, lookY: p.lookY ?? 0, headTilt: p.tilt ?? 0, nod: p.nod ?? 0, armL: { target: { x: 360, y: 900 }, elbow: "down" }, armR: { target: { x: 580, y: 900 }, elbow: "down" } };
      }}
      role="client"
      seed={7}
      blinkShift={19}
    />
  </div>
);

const PARTNER: Place = { x: 480, y: 1170, h: 1100 };
const partnerPlace = () => PARTNER;
export const PartnerFeed: React.FC<{ readonly f: number; readonly uid: string; readonly smile?: number }> = ({ f, uid, smile = 0 }) => (
  <div style={box({ left: 0, top: 0, width: FEED.w, height: FEED.h, overflow: "hidden", backgroundColor: "#DDE5EA" })}>
    <div style={box({ left: 0, top: 0, width: 960, height: 540, background: "linear-gradient(180deg, #E4EBEF, #D2DCE2)" })} />
    <div style={box({ left: 90, top: 60, width: 300, height: 200, backgroundColor: "#F6F2EA", border: "10px solid #B9C9BD", boxSizing: "border-box" })} />
    <Actor uid={`${uid}-partner`} look="partner" f={f} place={partnerPlace} face={() => -0.05} pose={() => ({ expr: smile > 0.5 ? "softSmile" : "calm", lookY: 0.05, armL: { target: { x: 370, y: 900 }, elbow: "down" }, armR: { target: { x: 590, y: 900 }, elbow: "down" } })} seed={9} blinkShift={53} />
  </div>
);

// ---------- Вывеска «БУЛАК» (два варианта) ----------
export const BulakSign: React.FC<{ readonly variant: 1 | 2; readonly w: number; readonly h: number }> = ({ variant, w, h }) => {
  const a = variant === 1;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: h * 0.12, backgroundColor: a ? C.bulakA : "#F3E3CC", border: a ? "none" : `${Math.max(3, h * 0.05)}px solid ${C.bulakB}`, boxSizing: "border-box", overflow: "hidden" }}>
      <svg width={w} height={h} style={box({ left: 0, top: 0 })}>
        {a ? (
          <path d={`M ${w * 0.08} ${h * 0.78} q ${w * 0.07} ${-h * 0.12} ${w * 0.14} 0 t ${w * 0.14} 0 t ${w * 0.14} 0`} stroke="#BFE6E2" strokeWidth={Math.max(2, h * 0.06)} fill="none" strokeLinecap="round" />
        ) : (
          <circle cx={w * 0.14} cy={h * 0.5} r={h * 0.24} fill={C.bulakB} />
        )}
      </svg>
      <div style={box({ left: a ? 0 : w * 0.26, top: 0, width: a ? w : w * 0.72, height: h * (a ? 0.72 : 1), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: h * (a ? 0.46 : 0.42), color: a ? "#FFFFFF" : C.bulakB, letterSpacing: a ? h * 0.02 : 0 })}>{T3B_TEXT.client}</div>
    </div>
  );
};

// ---------- Слайд презентации ----------
export const DECK = { w: 1280, h: 720 } as const;
// pick — 0…1 выделение 2-го варианта (выбор клиента); point — 0…1 указка
// на образцы материалов.
export const DeckSlide: React.FC<{ readonly pick?: number; readonly point?: number }> = ({ pick = 0, point = 0 }) => (
  <div style={box({ left: 0, top: 0, width: DECK.w, height: DECK.h, backgroundColor: "#FBF9F4", overflow: "hidden" })}>
    <div style={box({ left: 60, top: 40, fontFamily: F.display, fontWeight: 900, fontSize: 60, color: C.navy })}>{T3B_TEXT.deck.title}</div>
    <div style={box({ left: 1000, top: 52, fontFamily: F.display, fontWeight: 900, fontSize: 40, color: C.green })}>{T3B_TEXT.studio}</div>
    {[1, 2].map((v) => {
      const sel = v === 2 ? pick : 0;
      return (
        <div key={v} style={box({ left: 60 + (v - 1) * 590, top: 150, width: 560, height: 380, backgroundColor: "#FFFFFF", borderRadius: 24, border: `${6 + sel * 4}px solid ${sel > 0.5 ? C.amber : "#E3DDD0"}`, boxSizing: "border-box" })}>
          {/* фасад кафе с вывеской */}
          <div style={box({ left: 30, top: 30, width: 490, height: 250, backgroundColor: "#E9DFCF", borderRadius: 12 })} />
          <div style={box({ left: 90, top: 60 })}>
            <BulakSign variant={v as 1 | 2} w={370} h={120} />
          </div>
          <div style={box({ left: 150, top: 200, width: 250, height: 80, backgroundColor: "#B8CBD8" })} />
          <div style={box({ left: 30, top: 300, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.navy })}>{v === 1 ? T3B_TEXT.deck.a : T3B_TEXT.deck.b}</div>
          {sel > 0 ? (
            <div style={box({ left: 450, top: 290, width: 70, height: 70, borderRadius: "50%", backgroundColor: C.amber, transform: `scale(${easeOut(sel)})` })}>
              <svg width={70} height={70}>
                <path d="M 18 36 l 12 12 l 22 -24" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null}
        </div>
      );
    })}
    {/* образцы материалов */}
    <div style={box({ left: 60, top: 570, fontFamily: F.text, fontWeight: 800, fontSize: 36, color: C.inkSoft })}>{T3B_TEXT.deck.samples}</div>
    {["#C9A47A", "#9FA7AE", C.bulakA, "#F1E7D6"].map((c, i) => (
      <div key={c} style={box({ left: 330 + i * 150, top: 560, width: 120, height: 120, backgroundColor: c, borderRadius: 14, border: "3px solid #D9D2C3", transform: point > 0 && i === 2 ? `scale(${1 + 0.08 * point})` : undefined })} />
    ))}
  </div>
);

// ---------- Экран ноутбука мамы ----------
export const SCREEN = { w: 1280, h: 800 } as const;
const TILE_W = 452;
const TILE_H = (TILE_W * FEED.h) / FEED.w;
const SMALL_W = 250;
export const CALL_TILES = {
  deck: { x: 24, y: 70, W: 780 },
  client: { x: 814, y: 70, W: TILE_W },
  self: { x: 814, y: 70 + TILE_H + 16, W: TILE_W },
  partner: { x: 24, y: 70 + (780 * 720) / 1280 + 12, W: SMALL_W },
} as const;

const Label: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly k?: number }> = ({ x, y, text, k = 1 }) => (
  <div style={box({ left: x + 10 * k, top: y - 44 * k, padding: `${4 * k}px ${12 * k}px`, backgroundColor: "rgba(24,38,56,0.75)", color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 24 * k, borderRadius: 8 * k })}>{text}</div>
);

export const CallScreen: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly lift: number;
  readonly mom: (t: number) => FeedFace;
  readonly client: (t: number) => FeedFace;
  readonly pick?: number;
  readonly point?: number;
  readonly hand?: number;
  readonly press?: number; // 0…1 нажатие «Бүтүрүү»
}> = ({ f, uid, lift, mom, client, pick = 0, point = 0, hand = 0, press = 0 }) => (
  <div style={box({ left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, backgroundColor: "#1E232D", overflow: "hidden" })}>
    <div style={box({ left: 24, top: 16, fontFamily: F.text, fontWeight: 800, fontSize: 28, color: "#C9D1DC" })}>{T3B_TEXT.deck.title}</div>
    <Fit x={CALL_TILES.deck.x} y={CALL_TILES.deck.y} W={CALL_TILES.deck.W} w={DECK.w} h={DECK.h} radius={10}>
      <DeckSlide pick={pick} point={point} />
    </Fit>
    <Fit x={CALL_TILES.client.x} y={CALL_TILES.client.y} W={TILE_W} w={FEED.w} h={FEED.h} radius={10}>
      <ClientFeed f={f} face={client} uid={`${uid}-c`} />
    </Fit>
    <Label x={CALL_TILES.client.x} y={CALL_TILES.client.y + TILE_H} text={T3B_TEXT.call.client} />
    <Fit x={CALL_TILES.partner.x} y={CALL_TILES.partner.y} W={SMALL_W} w={FEED.w} h={FEED.h} radius={10}>
      <PartnerFeed f={f} uid={`${uid}-p`} />
    </Fit>
    <Label x={CALL_TILES.partner.x} y={CALL_TILES.partner.y + (SMALL_W * FEED.h) / FEED.w} text={T3B_TEXT.call.second} k={0.8} />
    <Fit x={CALL_TILES.self.x} y={CALL_TILES.self.y} W={TILE_W} w={FEED.w} h={FEED.h} radius={10} border={C.yellow}>
      <MomFeed f={f} lift={lift} face={mom} uid={`${uid}-m`} hand={hand} />
    </Fit>
    <Label x={CALL_TILES.self.x} y={CALL_TILES.self.y + TILE_H} text={T3B_TEXT.call.you} />
    {/* нижняя панель: только нужные кнопки */}
    <div style={box({ left: 0, top: 690, width: SCREEN.w, height: 110, backgroundColor: "#171B23" })} />
    {[T3B_TEXT.call.mute, T3B_TEXT.call.cam].map((t, i) => (
      <div key={t} style={box({ left: 380 + i * 190, top: 704, width: 170, height: 76, borderRadius: 38, backgroundColor: "#323946", color: "#E6EBF2", fontFamily: F.text, fontWeight: 800, fontSize: 30, textAlign: "center", lineHeight: "76px" })}>
        {t}
      </div>
    ))}
    <div style={box({ left: 760, top: 704, width: 200, height: 76, borderRadius: 38, backgroundColor: press > 0.5 ? "#A92E25" : "#D9443A", color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 30, textAlign: "center", lineHeight: "76px", transform: `scale(${1 - 0.05 * press})` })}>
      {T3B_TEXT.call.end}
    </div>
  </div>
);

export const CallEnded: React.FC<{ readonly t: number }> = ({ t }) => (
  <div style={box({ left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, backgroundColor: "#1E232D" })}>
    <div style={box({ left: 0, top: 330, width: SCREEN.w, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 56, color: "#E6EBF2", opacity: clamp(t / 8) })}>{T3B_TEXT.call.ended}</div>
  </div>
);

// ---------- Монитор клиента ----------
// Входящий поток мамы — крупно (на нём и замечают рисунок), слайд — рядом.
export const MONITOR = { w: 1280, h: 800 } as const;
export const MONITOR_TILES = { mom: { x: 20, y: 60, W: 900 }, deck: { x: 940, y: 60, W: 320 } } as const;
export const ClientMonitor: React.FC<{ readonly f: number; readonly uid: string; readonly lift: number; readonly mom: (t: number) => FeedFace; readonly pick?: number }> = ({ f, uid, lift, mom, pick = 0 }) => (
  <div style={box({ left: 0, top: 0, width: MONITOR.w, height: MONITOR.h, backgroundColor: "#1E232D", overflow: "hidden" })}>
    <Fit x={MONITOR_TILES.mom.x} y={MONITOR_TILES.mom.y} W={MONITOR_TILES.mom.W} w={FEED.w} h={FEED.h} radius={12}>
      <MomFeed f={f} lift={lift} face={mom} uid={`${uid}-m`} />
    </Fit>
    <Label x={MONITOR_TILES.mom.x} y={MONITOR_TILES.mom.y + (MONITOR_TILES.mom.W * FEED.h) / FEED.w} text={T3B_TEXT.call.you} k={1.3} />
    <Fit x={MONITOR_TILES.deck.x} y={MONITOR_TILES.deck.y} W={MONITOR_TILES.deck.W} w={DECK.w} h={DECK.h} radius={8}>
      <DeckSlide pick={pick} />
    </Fit>
  </div>
);

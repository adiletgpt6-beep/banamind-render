// Хук BG-025: мама САМА заполняет схематичную форму сайта BalaGo, сайт
// открывает предзаполненный WhatsApp, и она САМА нажимает «жөнөтүү».
// Мягкий отъезд камеры от телефона к среднему плану: мама в светлом
// кабинете с окном на Ала-Тоо держит телефон, поднимает брови и
// спрашивает «Арызымды жөнөттүм. Эми эмне болот?». Заголовок вопроса
// появляется на «Эми…», в конце камера наезжает на телефон — переход к
// ленте шага 1, которая выйдет из отправленного сообщения.
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useWordMatch } from "../context";
import { box, settle, Shot, span } from "../kit";
import { SCR } from "../props/Phone";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, lerp, smoothstep, type Vec } from "../rig/motion";
import { EXPR, mixExpr, type Expression } from "../rig/pose";
import { BG25_TEXT } from "../script";
import { OfficeBack, OfficeFront } from "../sets/Office";
import { SFX, type SceneSfx } from "../sfx";
import { C, F } from "../theme";
import { lineIn, wordMatchIn } from "../timing";
import { CASE, fieldTip, FormScreen, PhoneInHands, sendTip, SentChat, submitTip } from "./hook-phone";

// ---------- Расписание крупного плана (кадры сцены) ----------
// До реплики мамы; от озвучки не зависит (реплика начинается в 5,2 с).
export const HOOK = {
  taps: [10, 28, 46] as const, // касания трёх полей
  typeLen: [12, 14, 10] as const, // впечатывание значения, кадры
  submit: 64, // касание жёлтой кнопки
  slide: 70, // форма уходит, открывается WhatsApp
  slideLen: 12,
  send: 102, // мама сама нажимает «жөнөтүү»
  pull: 116, // отъезд к среднему плану
  pullLen: 26,
  pushLen: 22, // наезд на телефон в конце сцены
} as const;

// ---------- Средний план ----------
const MOM = { x: 575, y: 1500, h: 1000 } as const;
const MOM_SEED = 1; // seed Actor по умолчанию (дыхание)
// Цель кисти, держащей телефон (единицы рисунка от точки персонажа).
const PHONE_HAND = { x: -6, y: -642 } as const;
// Экран телефона в руке (PhoneShape рига): 35 × 71 ед.
const RIG_SCR_W = 35;
const K = RIG_SCR_W / SCR.w; // мировых ед. на пиксель экрана крупного плана
const SCR_C = { x: SCR.x + SCR.w / 2, y: SCR.y + SCR.h / 2 }; // центр экрана крупного плана

// Центр телефона в руке (мировые px): как в риге (Figure → Hand) для
// руки слева на экране с локтем "hang" и стоящего прямо персонажа.
const phoneCenter = (f: number, lift: number): Vec => {
  const breath = Math.sin((f + MOM_SEED * 17) / (22 + (MOM_SEED % 5) * 3));
  const sy = -778 + 14 - breath * 1.5;
  const S = { x: -(88 - 40 * 0.45), y: sy + 40 * 0.45 };
  const E = { x: S.x - 40 * 0.35, y: S.y + 160 * 0.92 };
  const W = { x: PHONE_HAND.x, y: PHONE_HAND.y - lift };
  const a = Math.atan2(W.y - E.y, W.x - E.x) - Math.PI / 2;
  const g = 50 * 0.5;
  const k = MOM.h / 1000;
  return { x: MOM.x + (W.x - g * Math.sin(a)) * k, y: MOM.y + (W.y + g * Math.cos(a)) * k };
};
const liftAt = (f: number) => 8 * span(f, 128, 150);

const camMid = (f: number) => ({ x: 570 + 5 * Math.sin(f / 70), y: 744 + 4 * Math.sin(f / 53), zoom: 1.84 + 0.07 * span(f, 140, 250) });

// Камера-переход между крупным планом телефона (слой A, кадр) и средним
// планом (слой B, мир): экран телефона совпадает в обоих слоях.
const closeCam = (f: number) => {
  // лёгкий дрейф крупного плана: сначала ближе к полям, потом к кнопке
  const s = 1 + 0.03 * span(f, 0, HOOK.pull);
  const dy = lerp(26, -34, span(f, 40, 100));
  return { s, x: SCR_C.x, y: SCR_C.y + dy };
};

type Blend = { readonly sA: number; readonly ax: number; readonly ay: number; readonly cam: { x: number; y: number; zoom: number }; readonly oA: number; readonly oBg: number };
const blend = (f: number, q: number, from: { s: number; x: number; y: number }): Blend => {
  // q = 0 — крупный план (from), 1 — средний план
  const cm = camMid(f);
  const pc = phoneCenter(f, liftAt(f));
  const natural = { x: (pc.x - cm.x) * cm.zoom + 540, y: (pc.y - cm.y) * cm.zoom + 960 };
  const sA = Math.exp(lerp(Math.log(from.s), Math.log(cm.zoom * K), q));
  const ax = lerp(from.x, natural.x, q);
  const ay = lerp(from.y, natural.y, q);
  const zoom = sA / K;
  const cam = { x: pc.x - (ax - 540) / zoom, y: pc.y - (ay - 960) / zoom, zoom };
  return { sA, ax, ay, cam, oA: 1 - smoothstep((q - 0.1) / 0.22), oBg: 1 - smoothstep((q - 0.04) / 0.2) };
};

// ---------- Заголовок-вопрос ----------
const TitleWord: React.FC<{ readonly t: number; readonly children: React.ReactNode; readonly size: number }> = ({ t, children, size }) => {
  const k = settle(t, 13);
  if (t < 0) return null;
  return (
    <span
      style={{
        display: "inline-block",
        opacity: clamp(k * 1.6),
        transform: `translateY(${(1 - k) * 36}px) scale(${0.82 + 0.18 * k})`,
        transformOrigin: "50% 80%",
        fontSize: size,
      }}
    >
      {children}
    </span>
  );
};

const HookTitle: React.FC<{ readonly t: number; readonly tQ: number }> = ({ t, tQ }) => {
  if (t < 0) return null;
  // «АРЫЗДАН КИЙИН / ЭМНЕ БОЛОТ?» — слова из BG25_TEXT.hook.title
  const [l1a, l1b, l2a, l2b] = BG25_TEXT.hook.title.replace("?", "").split(" ");
  const band = easeOut((t - 7) / 12);
  const qk = settle(tQ, 12);
  const glow = "0 0 2px #FFFFFF, 0 0 10px rgba(255,255,255,0.95), 0 6px 18px rgba(20,40,90,0.18)";
  return (
    <div
      style={box({
        left: 110,
        width: 860,
        top: 262,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: F.text,
        fontWeight: 900,
        color: C.navy,
        lineHeight: 1.04,
        letterSpacing: 1,
        textShadow: glow,
      })}
    >
      <div style={{ display: "flex", gap: 22 }}>
        <TitleWord t={t} size={80}>
          {l1a}
        </TitleWord>
        <TitleWord t={t - 3} size={80}>
          {l1b}
        </TitleWord>
      </div>
      <div style={{ position: "relative", marginTop: 14, padding: "4px 30px 10px" }}>
        {/* жёлтая полоса-маркер под второй строкой */}
        <div
          style={box({
            left: 0,
            top: 8,
            bottom: 4,
            width: `${band * 100}%`,
            backgroundColor: C.yellow,
            borderRadius: 18,
            transform: "skewX(-6deg)",
            boxShadow: "0 10px 24px rgba(233,176,0,0.28)",
          })}
        />
        <div style={{ position: "relative", display: "flex", gap: 22, textShadow: "none", alignItems: "baseline" }}>
          <TitleWord t={t - 6} size={92}>
            {l2a}
          </TitleWord>
          <TitleWord t={t - 9} size={92}>
            {l2b}
          </TitleWord>
          <span
            style={{
              display: "inline-block",
              fontSize: 92,
              marginLeft: -16,
              opacity: clamp(qk * 1.6),
              transform: `translateY(${(1 - qk) * -40}px) rotate(${(1 - qk) * 18}deg)`,
              transformOrigin: "50% 90%",
            }}
          >
            ?
          </span>
        </div>
      </div>
    </div>
  );
};

// ---------- Сцена ----------
const SURPRISED_SOFT: Expression = { browIn: 5, browOut: 4, lid: 0.04, smile: 0.12 };
const CURIOUS: Expression = { browIn: 5, browOut: 5, lid: 0.06, smile: 0.05 };

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const m01 = useLine("m01");
  const wSent = useWordMatch("m01", "жөнөт");
  const wEmi = useWordMatch("m01", "эми");
  const wBolot = useWordMatch("m01", "болот");

  // --- крупный план: касания, впечатывание, отправка ---
  const taps = [...HOOK.taps.map((at, i) => ({ at, tip: fieldTip(i) })), { at: HOOK.submit, tip: submitTip() }, { at: HOOK.send, tip: sendTip() }];
  const typed = HOOK.taps.map((at, i) => Math.floor(clamp((f - at - 2) / HOOK.typeLen[i]) * BG25_TEXT.hook.fields[i].v.length + 1e-6));
  const focus = f < HOOK.taps[0] ? -1 : f < HOOK.taps[1] ? 0 : f < HOOK.taps[2] ? 1 : f < HOOK.submit ? 2 : -1;
  const press = clamp((f - HOOK.submit) / 8);
  const slide = easeInOut((f - HOOK.slide) / HOOK.slideLen);
  const sendPress = f >= HOOK.send ? clamp((f - HOOK.send) / 8) : 0;
  const sent = clamp((f - HOOK.send - 2) / 10);
  const draft = f < HOOK.send + 2;
  const screen = (
    <div style={box({ inset: 0 })}>
      {slide < 1 ? (
        <div style={box({ inset: 0, transform: `translateX(${-slide * SCR.w * 0.35}px)`, opacity: 1 - slide * 0.6 })}>
          <FormScreen f={f} typed={typed} focus={focus} press={press} />
        </div>
      ) : null}
      {slide > 0 ? (
        <div style={box({ inset: 0, transform: `translateX(${(1 - slide) * SCR.w}px)`, boxShadow: "-12px 0 30px rgba(20,40,90,0.18)" })}>
          <SentChat draft={draft} sent={sent} sendPress={sendPress} />
        </div>
      ) : null}
    </div>
  );

  // --- переходы между планами ---
  const pullQ = easeInOut((f - HOOK.pull) / HOOK.pullLen);
  const pushStart = frames - HOOK.pushLen - 6;
  const pushQ = easeInOut((f - pushStart) / HOOK.pushLen);
  const cc = closeCam(Math.min(f, HOOK.pull));
  let b: Blend | null = null;
  if (f >= HOOK.pull && f < HOOK.pull + HOOK.pullLen) b = blend(f, pullQ, cc);
  else if (f >= pushStart) b = blend(f, 1 - pushQ, { s: 1.0, x: SCR_C.x, y: SCR_C.y });
  const showA = f < HOOK.pull || (b !== null && b.oA > 0.001);
  const showB = f >= HOOK.pull;
  const camB = b ? b.cam : camMid(f);
  const aT = f < HOOK.pull ? { s: cc.s, x: cc.x, y: cc.y } : b ? { s: b.sA, x: b.ax, y: b.ay } : null;
  const oA = f < HOOK.pull ? 1 : b ? b.oA : 0;
  const oBg = f < HOOK.pull ? 1 : b ? b.oBg : 0;

  // --- мама: взгляд, брови, жест ---
  const pc = phoneCenter(f, liftAt(f));
  const tBrow = smoothstep((f - (m01.from - 12)) / 8);
  const tCur = smoothstep((f - (wEmi - 8)) / 10);
  const tAfter = smoothstep((f - (m01.to + 4)) / 14);
  let expr: Expression = mixExpr(EXPR.calm, EXPR.surprised, tBrow);
  expr = mixExpr(expr, SURPRISED_SOFT, smoothstep((f - (m01.from + 6)) / 10));
  expr = mixExpr(expr, EXPR.thinking, smoothstep((f - (wSent + 6)) / 12) * (1 - tCur));
  expr = mixExpr(expr, CURIOUS, tCur);
  expr = mixExpr(expr, mixExpr(EXPR.thinking, EXPR.softSmile, 0.35), tAfter);
  // взгляд: телефон → чуть вверх и в сторону на вопросе → снова телефон
  const lookUp = smoothstep((f - (wSent + 2)) / 12) * (1 - tAfter);
  const lookAside = tCur * (1 - tAfter);
  // жест свободной рукой на «Эми эмне болот?»: ладонь чуть раскрыта
  const g = smoothstep((f - (wEmi - 6)) / 12) * (1 - smoothstep((f - (m01.to + 2)) / 16));
  const restR = { x: 90, y: -458 };
  const gestR = { x: 128, y: -606 };
  const hR = { x: lerp(restR.x, gestR.x, g), y: lerp(restR.y, gestR.y, g) + Math.sin(f / 9) * 3 * g };
  const pose = (): PoseIn => ({
    expr,
    lookY: lerp(0.62, -0.32, lookUp),
    lookX: lerp(0, 0.38, lookAside),
    headTilt: lerp(0, 7, lookAside) + 2 * lookUp * (1 - lookAside),
    nod: lerp(5, 0, lookUp),
    armL: { target: { x: MOM.x + PHONE_HAND.x, y: MOM.y + PHONE_HAND.y - liftAt(f) }, shape: "phone", item: "phone", itemColor: CASE, elbow: "hang" },
    armR: { target: { x: MOM.x + hR.x, y: MOM.y + hR.y }, shape: g > 0.4 ? "open" : "relax", elbow: "hang", wrist: -14 * g },
  });

  const tTitle = f - wEmi;
  return (
    <div style={box({ inset: 0, backgroundColor: C.bg })}>
      {showB ? (
        <Shot f={f} cam={camB} bg="#F8F2E7">
          <OfficeBack f={f} />
          <Actor uid="apa-hook" look="apa" f={f} role="mother" seed={MOM_SEED} place={() => MOM} pose={pose} />
          {/* экран телефона в руке: тот же чат с отправленным арызом */}
          <div
            style={box({
              left: pc.x - (SCR.w * K) / 2,
              top: pc.y - (SCR.h * K) / 2,
              width: SCR.w,
              height: SCR.h,
              transform: `scale(${K})`,
              transformOrigin: "0 0",
              borderRadius: 60,
              overflow: "hidden",
            })}
          >
            <SentChat draft={false} sent={1} />
          </div>
          <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <ellipse cx={pc.x - 17} cy={pc.y + 19} rx={6} ry={10} fill="#E6B590" stroke="#D29B74" strokeWidth={1.5} transform={`rotate(25 ${pc.x - 17} ${pc.y + 19})`} />
          </svg>
          <OfficeFront />
        </Shot>
      ) : null}
      {showA && aT ? (
        <>
          <div style={box({ inset: 0, opacity: oBg, background: `radial-gradient(ellipse at 50% 32%, #FFF6E2, #F3E2C4 75%)` })} />
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              opacity: oA,
              transformOrigin: "0 0",
              transform: `translate(${aT.x}px, ${aT.y}px) scale(${aT.s}) translate(${-SCR_C.x}px, ${-SCR_C.y}px)`,
            })}
          >
            <PhoneInHands f={f} taps={taps} pointer={f < HOOK.pull + HOOK.pullLen}>
              {f >= pushStart ? <SentChat draft={false} sent={1} /> : screen}
            </PhoneInHands>
          </div>
        </>
      ) : null}
      <HookTitle t={tTitle} tQ={f - wBolot - 4} />
    </div>
  );
};

// Звуки хука: касания, впечатывание, отправка; мягкий отъезд/наезд.
export const hookSfx: SceneSfx = (tl) => {
  const sc = tl.scenes.find((s) => s.id === "hook")!;
  const emi = wordMatchIn(tl, "hook", "m01", "эми");
  const m = lineIn(tl, "hook", "m01");
  return [
    ...HOOK.taps.flatMap((at) => [
      { at, src: SFX.tap, volume: 0.32 },
      { at: at + 2, src: SFX.type, volume: 0.2 },
    ]),
    { at: HOOK.submit, src: SFX.tap, volume: 0.34 },
    { at: HOOK.slide + 2, src: SFX.whoosh, volume: 0.12 },
    { at: HOOK.send, src: SFX.tap, volume: 0.3 },
    { at: HOOK.send + 2, src: SFX.send, volume: 0.36 },
    { at: HOOK.pull + 2, src: SFX.whoosh, volume: 0.1 },
    { at: emi + 2, src: SFX.pop, volume: 0.22 },
    { at: Math.max(m.to + 6, sc.frames - HOOK.pushLen - 6), src: SFX.whoosh, volume: 0.14 },
  ];
};

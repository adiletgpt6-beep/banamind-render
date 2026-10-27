// Сцена 5 «start» — БАШЫ: так маалымат + өзү жөнөтүү. Плёнка дошла до
// начала и впервые играет ВПЕРЁД (▶).
//   кадр 0: белое поле экрана (склейка с пустой карточкой «Топ изделет…»)
//   → отъезд: вечер, мама за столом с телефоном (сосредоточена, кивает);
//   на «апасы так маалыматты киргизип» она сама вводит үй дареги, мектеп,
//   сабак убактысы (касание каждого поля, набор, каретка); на
//   «кайрылуусун» нажимает «WhatsApp аркылуу жөнөтүү» — открывается чат
//   BalaGo с подготовленным текстом; на «өзү жөнөткөн» мама САМА нажимает
//   «отправить», сообщение уходит в чат (одна серая галочка — отправлено,
//   без «подтверждения»). «Окуянын башы ушул жерден» → подпись главы →
//   ▶▶ цепочка звеньев загорается по порядку: Так маалымат → Топ изделет →
//   Акысыз сыноо → Чечим → Уюшулган каттам → Тынч кеч.
// Финальный кадр (телефон в PHONE) — первый кадр сцены «cta».
import { fontFamily } from "../../../fonts";
import { ArrowGlyph, box, CheckIcon, clamp01, easeInOut, easeOut, mix, NAVY, NAVY_SOFT, prog, YELLOW } from "../art";
import { cueFrames, local, wordFrame, type SceneProps } from "../kit";
import { Actor } from "../rig/Actor";
import { keys, keysV, type Vec } from "../rig/motion";
import { BG41_TEXT } from "../script";
import { Cam, Room } from "../sets";
import { ChapterLabel, CHAPTER_POS, type HudState } from "../tape";
import type { Bg41Timeline } from "../timing";
import { Phone, PHONE, SCREEN_INSET, SH, SW, TAP, TapRing, Thumb, type PhoneState } from "./phone";

const T = BG41_TEXT.start;
const CHAIN = BG41_TEXT.chain;

export const startKeys = (tl: Bg41Timeline) => {
  const s = tl.scenes.find((x) => x.id === "start")!;
  const len = Math.round((s.to - s.from) * 30);
  const n06 = cueFrames(tl, "n06");
  const n07 = cueFrames(tl, "n07");
  const wA = wordFrame(tl, "n06", "апасы", 0.4);
  const wKr = wordFrame(tl, "n06", "кайрылуусун", 0.75);
  const wJ = wordFrame(tl, "n06", "жөнөткөн", 0.92);
  const typeStart = wA - 14;
  const fields = [0, 1, 2].map((i) => typeStart + i * 26);
  const buttonTap = Math.max(typeStart + 82, wKr - 8);
  const slide = [buttonTap + 4, buttonTap + 20] as const;
  const sendTap = Math.max(slide[1] + 10, wJ);
  const chainStart = n07.from + 24;
  const chainEnd = Math.max(chainStart + 40, len - 16);
  return { len, n06, n07, typeStart, fields, buttonTap, slide, sendTap, label: n07.from, chainStart, chainEnd, zoomOut: 18 };
};

export const startHud = (tl: Bg41Timeline, f: number): HudState => {
  const k = startKeys(tl);
  if (f < 16) return { mode: "rew", speed: 2, pos: mix(CHAPTER_POS.group, CHAPTER_POS.start, easeInOut(f / 16)) };
  if (f < k.chainStart) return { mode: "play", pos: 0 };
  const u = easeInOut(prog(f, k.chainStart, k.chainEnd - k.chainStart));
  if (f < k.chainEnd) return { mode: "ff", pos: u, lit: u };
  return { mode: "play", pos: 1, lit: 1 };
};

// Состояние телефона в кадре f.
export const phoneStateAt = (k: ReturnType<typeof startKeys>, f: number): PhoneState => {
  const typed = k.fields.map((a) => prog(f, a + 3, 20)) as unknown as [number, number, number];
  let active = -1;
  k.fields.forEach((a, i) => {
    if (f >= a && f < (k.fields[i + 1] ?? k.buttonTap - 4)) active = i;
  });
  return {
    typed,
    active,
    button: prog(f, k.buttonTap - 2, 8),
    slide: prog(f, k.slide[0], k.slide[1] - k.slide[0]),
    sendPress: prog(f, k.sendTap - 2, 8),
    sent: prog(f, k.sendTap + 2, 12),
    caretOn: Math.floor(f / 8) % 2 === 0,
  };
};

const scr = (p: Vec): Vec => ({ x: PHONE.x + SCREEN_INSET + p.x, y: PHONE.y + SCREEN_INSET + p.y });
const REST = scr({ x: SW * 0.84, y: SH * 0.9 });
const thumbAt = (k: ReturnType<typeof startKeys>, f: number) => {
  const pts: [number, Vec][] = [
    [0, REST],
    [k.fields[0] - 10, REST],
    [k.fields[0] - 1, scr(TAP.field(0))],
    [k.fields[1] - 1, scr(TAP.field(1))],
    [k.fields[2] - 1, scr(TAP.field(2))],
    [k.fields[2] + 14, scr({ x: SW * 0.78, y: 640 })],
    [k.buttonTap - 1, scr(TAP.button)],
    [k.buttonTap + 12, REST],
    [k.sendTap - 12, scr({ x: TAP.send.x - 30, y: TAP.send.y - 60 })],
    [k.sendTap - 1, scr(TAP.send)],
    [k.sendTap + 14, REST],
  ];
  const p = keysV(f, pts);
  const taps = [...k.fields, k.buttonTap, k.sendTap];
  let press = 0;
  for (const a of taps) press = Math.max(press, Math.sin(Math.PI * prog(f, a - 1, 7)));
  return { p, press, taps };
};

// Цепочка звеньев (вперёд).
const Chain: React.FC<{ readonly lit: number; readonly show: number }> = ({ lit, show }) => {
  if (show <= 0) return null;
  const pos = (i: number) => ({ x: 28 + (i % 3) * 346, y: 410 + Math.floor(i / 3) * 100 });
  return (
    <div style={box({ inset: 0, opacity: show, fontFamily })}>
      {CHAIN.map((c, i) => {
        const p = pos(i);
        const on = clamp01(lit * CHAIN.length - i);
        return (
          <div key={c}>
            <div
              style={box({
                left: p.x,
                top: p.y,
                width: 314,
                height: 70,
                whiteSpace: "nowrap",
                borderRadius: 22,
                backgroundColor: on > 0.5 ? YELLOW : "rgba(255,255,255,0.95)",
                color: on > 0.5 ? NAVY : NAVY_SOFT,
                boxShadow: on > 0.5 ? `0 8px 18px rgba(20,40,75,0.22), inset 0 0 0 4px ${NAVY}` : "0 6px 14px rgba(20,40,75,0.14), inset 0 0 0 3px #D5DEEA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 28,
                fontWeight: 1000,
                transform: `scale(${1 + 0.08 * Math.sin(Math.PI * clamp01(on * 1.2))})`,
              })}
            >
              {on > 0.5 ? <CheckIcon size={30} draw={clamp01((on - 0.5) * 2)} /> : <span style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid #C3CEDF`, boxSizing: "border-box" }} />}
              {c}
            </div>
            {i % 3 !== 2 ? (
              <div style={box({ left: p.x + 314, top: p.y + 18, width: 32, display: "flex", justifyContent: "center", color: NAVY, opacity: on > 0.9 ? 1 : 0.35 })}>
                <ArrowGlyph size={30} />
              </div>
            ) : null}
          </div>
        );
      })}
      {/* перенос строки цепочки: дуга от 3-го звена к 4-му */}
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp01(lit * CHAIN.length - 2) > 0.9 ? 1 : 0.35 }}>
        <path d="M 877 483 L 877 487 Q 877 495 867 495 L 195 495 Q 185 495 185 503 L 185 507" fill="none" stroke={NAVY} strokeWidth={4} strokeDasharray="10 10" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Вся сцена в кадре f (без/с телефоном) — используется и финалом.
export const StartStage: React.FC<{ readonly tl: Bg41Timeline; readonly f: number; readonly hidePhone?: boolean; readonly hideOverlays?: boolean }> = ({
  tl,
  f,
  hidePhone,
  hideOverlays,
}) => {
  const k = startKeys(tl);
  const ps = phoneStateAt(k, f);
  const th = thumbAt(k, f);
  // отъезд от белого поля экрана
  const zo = 1 - easeOut(prog(f, 0, k.zoomOut));
  // белая полоса экрана под кнопкой — без крупного текста в кадре
  const focus = scr({ x: SW / 2, y: 786 });
  // мягкий наезд на телефон, пока мама вводит данные и отправляет
  const push = easeInOut(prog(f, 60, 40)) * (1 - easeInOut(prog(f, k.sendTap + 20, 26)));
  const pz = 1 + 0.12 * push;
  const pc = { x: mix(540, 650, push), y: mix(960, 1000, push) };
  const z = pz * (1 + 30 * Math.pow(zo, 1.7));
  // точка фокуса движется по экрану от центра к своему месту в кадре —
  // при любом масштабе в центре остаётся белая полоса экрана
  const s1 = { x: 540 + (focus.x - pc.x) * pz, y: 960 + (focus.y - pc.y) * pz };
  const cx = focus.x - (mix(s1.x, 540, zo) - 540) / z;
  const cy = focus.y - (mix(s1.y, 960, zo) - 960) / z;
  const nod = keys(f, [[40, 0], [52, 7], [62, 0]]);
  const chainShow = easeOut(prog(f, k.chainStart - 6, 10));
  const lit = easeInOut(prog(f, k.chainStart, k.chainEnd - k.chainStart));
  return (
    <div style={box({ inset: 0, overflow: "hidden", fontFamily })}>
      <div style={box({ inset: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` })}>
        {/* комната (мягко размыта — глубина) */}
        <div style={box({ inset: 0, filter: "blur(3px)" })}>
          <Cam cx={430} cy={820} z={1.45}>
            <Room evening={0.8} lamp={1} clockMin={20 * 60 + 12 + f * 0.02} backpack />
          </Cam>
        </div>
        <div style={box({ inset: 0, backgroundColor: "rgba(255,244,226,0.18)" })} />
        {/* мама крупно, смотрит в телефон */}
        <Actor
          uid="st-mom"
          look="momHome"
          f={f}
          sceneLen={k.len}
          seed={71}
          place={() => ({ x: 250, y: 2760, h: 2200 })}
          face={() => 0.52}
          pose={(t2) => ({
            expr: t2 >= k.sendTap + 6 ? ("smile" as const) : t2 >= 52 ? ("calm" as const) : ("thinking" as const),
            lookX: 0.25,
            lookY: 0.55,
            nod: nod + (t2 >= k.sendTap + 6 ? 0 : 3),
            headTilt: t2 >= k.sendTap + 6 ? 4 : 0,
            lean: 2,
            armL: { target: { x: PHONE.x + 30, y: PHONE.y + 520 }, shape: "fist" as const, elbow: "down" as const, behind: false },
            armR: { target: { x: PHONE.x + PHONE.w + 30, y: PHONE.y + PHONE.h + 60 }, shape: "relax" as const, elbow: "down" as const, behind: false },
          })}
        />
        {/* левая рука держит телефон: пальцы на кромке */}
        {!hidePhone ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} style={box({ left: PHONE.x - 18, top: PHONE.y + 470 + i * 40, width: 44, height: 32, borderRadius: 16, backgroundColor: "#E4B28C" })} />
            ))}
            <Phone s={ps} />
            {th.taps.map((a, i) => (
              <TapRing key={i} x={th.p.x} y={th.p.y} u={prog(f, a, 12)} />
            ))}
            <Thumb tx={th.p.x} ty={th.p.y} press={th.press} />
          </>
        ) : null}
      </div>
      {!hideOverlays ? (
        <>
          <ChapterLabel text={T.label} u={prog(f, k.label, 14)} out={prog(f, k.chainStart - 8, 8)} />
          <Chain lit={lit} show={chainShow} />
        </>
      ) : null}
    </div>
  );
};

export const Start: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "start", t);
  return <StartStage tl={tl} f={f} />;
};

// Эффекты сцены: касания, набор текста, переход в WhatsApp, отправка.
export const startSfx = (tl: Bg41Timeline) => {
  const k = startKeys(tl);
  const s0 = tl.scenes.find((x) => x.id === "start")!.from;
  const at = (fr: number) => s0 + fr / 30;
  return [
    ...k.fields.map((a) => ({ src: "audio/sfx-tap.mp3", at: at(a), volume: 0.35 })),
    { src: "audio/sfx-typing.mp3", at: at(k.fields[0] + 3), volume: 0.16, dur: (k.fields[2] + 22 - k.fields[0]) / 30, fade: 0.15 },
    { src: "audio/sfx-tap.mp3", at: at(k.buttonTap), volume: 0.4 },
    { src: "audio/sfx-whoosh.mp3", at: at(k.slide[0]), volume: 0.12 },
    { src: "audio/sfx-tap.mp3", at: at(k.sendTap), volume: 0.42 },
    { src: "audio/sfx-pop.mp3", at: at(k.sendTap + 4), volume: 0.3 },
    { src: "audio/sfx-chime.mp3", at: at(k.label + 4), volume: 0.12 },
  ];
};

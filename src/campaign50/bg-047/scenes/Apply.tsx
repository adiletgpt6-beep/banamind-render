// Сцена 4: «BalaGo'го ушул маалыматтарды жөнөтөсүз. Бул картанын жандуу
// GPS көзөмөлү эмес — маршрут тандоонун түшүндүрмөсү гана.»
// Камера отъезжает: карта лежит на столе. Левая рука мамы держит
// бумажный лист с тремя полями, правая — телефон с заявкой на сайте BalaGo.
// Мама сама вводит поля (искры летят от листа к полям), нажимает
// «Арыз калтыруу» — сайт открывает WhatsApp с подготовленным сообщением,
// и мама сама нажимает «отправить». Бумажная точка остаётся на столе (не
// становится функцией приложения) и показывает на наклейку
// «Бул GPS көзөмөлү эмес».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useSceneFrames, useSpeech, useTimeline } from "../context";
import { applyBeats } from "../beats";
import { BG47_TEXT } from "../script";
import { Dot } from "../art/Dot";
import { CARD_H, CARD_W, FieldsCard } from "../art/FieldsCard";
import { Hand } from "../art/Hand";
import { blink, clamp, easeIn, easeInOut, easeOut, hop, lerp, prog, springy } from "../art/motion";
import { C } from "../art/palette";
import { HeroPlaces } from "../art/places";
import { PHONE, PHONE_SCREEN, PhoneInHand, SiteForm, WhatsAppChat } from "../art/Phone";
import { Chip, ExampleTag } from "../art/ui";
import { lerpCam, projectBillboard, type Cam } from "../art/Stage";
import { World } from "../art/World";
import { DotOnMap, HOOK_DOT_END } from "./Hook";
import { CANDIDATES, SEARCH_END_CAM } from "./Mismatch";

export const APPLY_CAM: Cam = { cx: 500, cy: 820, zoom: 0.7, tilt: 26, sy: 760 };
// После ухода телефона камера уже движется к сцене 5 (начало сцены 5).
export const APPLY_END_CAM: Cam = { cx: 480, cy: 1120, zoom: 0.88, tilt: 34, sy: 900 };

const PHONE_AT = { x: 712, y: 968 } as const;
const CARD_AT = { x: 84, y: 1150, s: 0.5, rot: 5 } as const;
export const TABLE_DOT = { x: 300, y: 1060, s: 1.05 } as const;

// Центр поля формы i на экране телефона (координаты экрана телефона).
const fieldY = (i: number) => 404 + i * 78;
const BUTTON = { x: PHONE_SCREEN.w / 2 + 84, y: 726 } as const;
const SEND = { x: PHONE_SCREEN.w - 40, y: PHONE_SCREEN.h - 50 } as const;


export const ApplyScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = applyBeats(useTimeline());
  const speech = useSpeech("dot", f);
  // эта сцена начинается там, где лупа закончила поиск
  const len = useSceneFrames("apply");
  const cam = lerpCam(lerpCam(SEARCH_END_CAM, APPLY_CAM, easeInOut(f / 30)), APPLY_END_CAM, easeInOut(prog(f, b.back + 8, Math.max(12, len - b.back - 8))));
  // в конце сцены телефон, лист и руки уходят, карта снова резкая
  const exit = easeInOut(prog(f, b.back - 4, 16));

  const phoneIn = easeOut(prog(f, 4, 22));
  const cardIn = easeOut(prog(f, 10, 20));
  const tapAt = (at: number) => (f >= at && f < at + 8 ? Math.sin((Math.PI * (f - at)) / 8) : 0);

  // большой палец: поля → кнопка → отправить
  const stops: [number, { x: number; y: number }][] = [
    [0, { x: 300, y: 600 }],
    ...b.fills.map((at, i) => [at - 2, { x: 296, y: fieldY(i) }] as [number, { x: number; y: number }]),
    [b.submit - 2, BUTTON],
    [b.send - 2, SEND],
    [b.send + 20, { x: 300, y: 560 }],
  ];
  let thumb = stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [a, pa] = stops[i - 1];
    const [bb, pb] = stops[i];
    if (f >= a) thumb = { x: lerp(pa.x, pb.x, easeInOut(prog(f, Math.max(a, bb - 8), 8))), y: lerp(pa.y, pb.y, easeInOut(prog(f, Math.max(a, bb - 8), 8))) };
  }
  const tap = Math.max(...b.fills.map((at) => tapAt(at)), tapAt(b.submit), tapAt(b.send));
  const fill = b.fills.map((at) => easeOut(prog(f, at, 8)));
  const glowField = b.fills.findIndex((at) => f >= at - 6 && f < at + 10);
  const cardGlow = glowField < 0 ? -1 : [0, 1, 2, 2][glowField];
  const chatIn = easeInOut(prog(f, b.chat, 9));

  // точка: прыгает с карты на стол, смотрит на телефон, показывает на наклейку
  const fromScr = projectBillboard(cam, HOOK_DOT_END.x, HOOK_DOT_END.y, 0);
  const jumpT = easeInOut(prog(f, 8, 22));
  // в конце сцены точка прыгает обратно на карту (дальше — сцена 5)
  const backT = easeInOut(prog(f, b.back, 18));
  const dx = lerp(lerp(fromScr.x, TABLE_DOT.x, jumpT), 520, backT);
  const dy = lerp(lerp(fromScr.y, TABLE_DOT.y, jumpT), 1020, backT) - hop(f, 8, 22, 180) - hop(f, b.back, 18, 260);
  const ds = lerp(lerp(cam.zoom, TABLE_DOT.s, jumpT), 0.55, backT);
  const dOpacity = 1 - easeIn(prog(f, b.back + 12, 6));
  const point = easeInOut(prog(f, b.gps, 8)) * (1 - easeInOut(prog(f, b.n3.to + 14, 10)));
  const lookPhone = f > 30 && f < b.gps ? { x: 1, y: 0.1 } : point > 0.5 ? { x: -0.2, y: -1 } : { x: 0.3, y: 0 };

  const sticker = springy(prog(f, b.gps, 14));

  return (
    <>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${1.6 * easeOut(prog(f, 10, 20)) * (1 - exit)}px)` }}>
        <World cam={cam} label={0} hole={0}>
          <HeroPlaces home={1} school={1} route={1} flag={f / 6} angle={70} />
          {/* герой снова на карте после прыжка со стола */}
          <DotOnMap x={HOOK_DOT_END.x} y={HOOK_DOT_END.y} angle={cam.tilt} opacity={easeOut(prog(f, b.back + 14, 6))}>
            <Dot blink={blink(f, 5)} look={{ x: 0, y: 0.2 }} mood="happy" glow={0.4} />
          </DotOnMap>
          {CANDIDATES.map((c, i) => (
            <DotOnMap key={c.color} x={c.x} y={c.y} angle={cam.tilt}>
              <Dot color={c.color} blink={blink(f, 4 + i)} look={{ x: i ? -0.5 : 0.5, y: 0 }} mood="smile" />
            </DotOnMap>
          ))}
        </World>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.18)", opacity: easeOut(prog(f, 10, 20)) * (1 - exit) }} />
      </div>

      {/* лист с полями в левой руке */}
      <div
        style={{
          position: "absolute",
          left: lerp(-500, CARD_AT.x, cardIn) - exit * 720,
          top: lerp(1500, CARD_AT.y, cardIn),
          width: CARD_W,
          height: CARD_H,
          transformOrigin: "0 0",
          transform: `rotate(${CARD_AT.rot}deg) scale(${CARD_AT.s})`,
        }}
      >
        <FieldsCard home={1} school={1} time={1} highlight={cardGlow} />
      </div>
      <Hand x={lerp(-500, CARD_AT.x + 36, cardIn) - exit * 720} y={lerp(1500, CARD_AT.y + CARD_H * CARD_AT.s - 26, cardIn) + exit * 160} angle={30} flip pose="pinch" scale={0.8} />

      {/* телефон в правой руке */}
      <PhoneInHand
        x={lerp(1400, PHONE_AT.x, phoneIn) + exit * 760}
        y={lerp(1300, PHONE_AT.y, phoneIn) + exit * 260 + Math.sin(f / 16) * 4 * prog(f, b.sent, 20)}
        rot={-4 + exit * 10}
        thumb={thumb}
        tap={tap}
      >
        <SiteForm fill={fill} press={tapAt(b.submit)} glow={glowField} />
        {chatIn > 0 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - chatIn) * 100}%)` }}>
            <WhatsAppChat sent={easeOut(prog(f, b.sent, 10))} press={tapAt(b.send)} />
          </div>
        ) : null}
      </PhoneInHand>

      {/* искры: данные с бумажного листа в поля формы */}
      {b.fills.map((at, i) => {
        const p = prog(f, at - 9, 9);
        if (p <= 0 || p >= 1) return null;
        const tile = [0, 1, 2, 2][i];
        const sx = CARD_AT.x + (129 + tile * 241 + (tile === 2 ? 40 : 0)) * CARD_AT.s;
        const sy = CARD_AT.y + 100 * CARD_AT.s + tile * 10;
        const ex = PHONE_AT.x - PHONE.w / 2 + PHONE.bezel + 70;
        const ey = PHONE_AT.y - PHONE.h / 2 + PHONE.bezel + fieldY(i) + 6;
        const t = easeInOut(p);
        const x = lerp(sx, ex, t);
        const y = lerp(sy, ey, t) - Math.sin(Math.PI * t) * 160;
        return <div key={i} style={{ position: "absolute", left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: 14, backgroundColor: C.yellow, border: `4px solid ${C.navy}`, boxShadow: "0 0 0 8px rgba(255,201,14,0.35)" }} />;
      })}

      {/* точка на столе */}
      <div style={{ position: "absolute", left: dx - 80 * ds, top: dy - 196 * ds, width: 160, height: 200, transformOrigin: "0 0", transform: `scale(${ds})`, opacity: dOpacity }}>
        <div style={{ position: "absolute", left: 30, top: 186, width: 100, height: 24, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,40,90,0.3), rgba(20,40,90,0))", opacity: jumpT }} />
        <Dot look={lookPhone} blink={blink(f, 5)} mouth={clamp(speech * 1.35)} mood={point > 0.5 ? "happy" : "smile"} armL={lerp(24, 165, point)} armR={22} glow={0.4} />
      </div>

      {/* наклейка «Бул GPS көзөмөлү эмес» */}
      {sticker > 0 && exit < 1 ? <NotGpsSticker p={sticker} out={exit} /> : null}

      <ExampleTag text={BG47_TEXT.example} />
      <Chip f={f} at={16} out={b.back} y={334} center size={46} bg="#FFF4C2">
        {BG47_TEXT.apply.title}
      </Chip>
    </>
  );
};

// Бумажная наклейка: перечёркнутый спутник + «Бул GPS көзөмөлү эмес».
const NotGpsSticker: React.FC<{ readonly p: number; readonly out: number }> = ({ p, out }) => (
  <div
    style={{
      position: "absolute",
      left: 92,
      top: 528,
      width: 370,
      padding: "18px 20px",
      borderRadius: 24,
      backgroundColor: "#FFFFFF",
      border: `5px solid ${C.navy}`,
      boxShadow: "0 10px 0 rgba(20,40,90,0.14), 0 18px 30px rgba(20,40,90,0.2)",
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily,
      transform: `scale(${lerp(1.5, 1, p) * (1 - 0.4 * out)}) rotate(${lerp(-14, -4, p)}deg)`,
      opacity: Math.min(1, p * 2) * (1 - out),
    }}
  >
    <svg width={86} height={86} viewBox="0 0 64 64" style={{ flex: "none" }}>
      <circle cx={32} cy={32} r={29} fill="#FFF4C2" stroke={C.navy} strokeWidth={3} />
      <g transform="rotate(-35 32 32)">
        <rect x={26} y={24} width={12} height={16} rx={2} fill="#BFD6EE" stroke={C.navy} strokeWidth={3} />
        <rect x={10} y={28} width={14} height={8} fill="#6EA8FF" stroke={C.navy} strokeWidth={2.5} />
        <rect x={40} y={28} width={14} height={8} fill="#6EA8FF" stroke={C.navy} strokeWidth={2.5} />
      </g>
      <line x1={12} y1={52} x2={52} y2={12} stroke="#E0704F" strokeWidth={6} strokeLinecap="round" />
    </svg>
    <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.08, color: C.navy }}>{BG47_TEXT.apply.notGps}</div>
  </div>
);


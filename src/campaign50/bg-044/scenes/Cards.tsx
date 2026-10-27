// Сцена 2 «cards» — ҮЙ • МЕКТЕП • УБАКЫТ → настоящая форма → WhatsApp.
// Реплика мамы m1: «Бул оюндагыдай бир баскыч менен эле чечилбейт экен.
// Адегенде даректерди туура жазайын.»
//  • Игра: три карточки (дом, школа, время) выпадают как предметы; погасшая
//    «волшебная» кнопка лежит в стороне и на словах «бир баскыч…
//    чечилбейт» получает крестик; мама-игрок говорит и собирает карточки.
//  • На слове «Адегенде» игра рассыпается в обычную 2D-сцену: мама дома
//    с телефоном (губы по голосу) → крупный план рук: карточки влетают в
//    поля формы сайта, большой палец набирает данные.
//  • Кнопка «WhatsApp аркылуу жөнөтүү» → чат с ПОДГОТОВЛЕННЫМ сообщением;
//    мама САМА нажимает «отправить» → обычный пузырь с двумя галочками.
//    Никакого «заявка принята». В конце — мама улыбается, кладёт телефон.
import { useCurrentFrame } from "remotion";
import { appear, clamp, easeInOut, easeOut, lerp, pop, shake } from "../anim";
import { useLine, useMouth, useScene, useWordAt } from "../context";
import { Badge } from "../kit/Badge";
import { Room, Stage } from "../kit/city";
import { Phone, SiteForm, WhatsAppChat } from "../kit/devices";
import { GameWorld, LevelBanner } from "../kit/GameWorld";
import { Hand, Mom } from "../kit/people";
import { PixelMorph } from "../kit/PixelMorph";
import { PixelButton, PixelPanel } from "../kit/PixelUI";
import { PixelText } from "../kit/PixelText";
import { SpriteG, spriteSize, type SpriteRows } from "../kit/Sprite";
import { CHECK, CLOCK, CROSS, HOUSE, MOM, SCHOOL } from "../kit/sprites";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { BG44_TEXT } from "../script";
import type { SceneSfxFn } from "../sound";

const PX = 10;
const GROUND = 1236;
const ICONS: readonly { rows: SpriteRows; px: number }[] = [
  { rows: HOUSE, px: 5 },
  { rows: SCHOOL, px: 4 },
  { rows: CLOCK, px: 10 },
];
const CARD = { y: 560, w: 290, h: 330, xs: [52, 395, 738] as const } as const;
// крупный план телефона
const PH = { x: 270, y: 412, w: 540, h: 1080 } as const;
const FIELD_Y = [PH.y + 318, PH.y + 440, PH.y + 562, PH.y + 684]; // центр поля ввода i (кадр)
const BTN_Y = PH.y + 832;
const SEND = { x: PH.x + PH.w - 74, y: PH.y + PH.h - 88 };

// Ключевые моменты сцены по фактической озвучке.
const useBeats = () => {
  const { frames } = useScene();
  const w2 = useWordAt("m1", 2);
  const w6 = useWordAt("m1", 6);
  const w8 = useWordAt("m1", 8);
  const line = useLine("m1");
  const morph0 = w8 - 10;
  const morph1 = morph0 + 22;
  const cu = Math.max(morph1 + 26, w8 + 34); // крупный план рук
  const fly = [cu + 6, cu + 12, cu + 18]; // карточки влетают в поля
  const type0 = cu + 26;
  const types = [type0, type0 + 30, type0 + 42, type0 + 52];
  const typeEnd = type0 + 60;
  const btn = Math.max(typeEnd + 10, line.to + 16); // окно субтитров уже скрылось
  const chat = btn + 8;
  const note = chat + 18;
  const send = Math.min(frames - 70, chat + 40);
  const back = Math.min(frames - 34, send + 34); // мама улыбается
  return {
    w2,
    w6,
    w8,
    morph0,
    morph1,
    cu,
    fly,
    types,
    typeEnd,
    btn,
    chat,
    note,
    send,
    back,
    lineTo: line.to,
  };
};

export const cardsSfx: SceneSfxFn = ({ wordAt, lineAt, frames }) => {
  const w8 = wordAt("m1", 8);
  const morph0 = w8 - 10;
  const cu = Math.max(morph0 + 48, w8 + 34);
  const type0 = cu + 26;
  const btn = Math.max(type0 + 70, lineAt("m1").to + 16);
  const chat = btn + 8;
  const send = Math.min(frames - 70, chat + 40);
  const out: {
    at: number;
    name:
      | "coin"
      | "pixels"
      | "type"
      | "tap"
      | "send"
      | "select"
      | "chime"
      | "whoosh"
      | "blip";
    volume: number;
  }[] = [
    { at: 6, name: "blip", volume: 0.25 },
    { at: 12, name: "blip", volume: 0.25 },
    { at: 18, name: "blip", volume: 0.25 },
    { at: wordAt("m1", 6), name: "blip", volume: 0.3 },
    { at: w8 - 22, name: "coin", volume: 0.3 },
    { at: w8 - 16, name: "coin", volume: 0.3 },
    { at: morph0, name: "pixels", volume: 0.3 },
    { at: cu - 2, name: "whoosh", volume: 0.16 },
  ];
  for (let k = 0; k < 16; k++)
    out.push({ at: type0 + k * 4, name: "type", volume: 0.18 });
  out.push({ at: btn, name: "tap", volume: 0.4 });
  out.push({ at: chat + 2, name: "whoosh", volume: 0.14 });
  out.push({ at: send, name: "tap", volume: 0.35 });
  out.push({ at: send + 3, name: "send", volume: 0.4 });
  return out;
};

// ---------- игровая часть ----------
const GamePart: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const t = BG44_TEXT.cards;
  const mouth = useMouth("mother");
  const collected = (i: number) => clamp((f - (b.w8 - 24 + i * 6)) / 10);
  const momRows =
    mouth > 0.15
      ? Math.floor(f / 4) % 2
        ? MOM.talk
        : MOM.talkHalf
      : f > b.w6 - 6 && f < b.w8 - 24
        ? MOM.think
        : MOM.idle[Math.floor(f / 18) % 2];
  const momX = 300;
  const brokenX = 650;
  const cross = appear(f, b.w6, 8);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <GameWorld px={PX} groundY={GROUND} frame={f + 200}>
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          <SpriteG
            rows={momRows}
            px={PX}
            x={momX - MOM.cx * PX}
            y={GROUND - MOM.h * PX}
          />
        </svg>
      </GameWorld>
      <LevelBanner title={t.header} appear={appear(f, 0, 14)} />
      {/* погасшая «волшебная» кнопка лежит на тротуаре */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-6 + shake(f, b.w2, 20, 5)}deg)`,
          transformOrigin: `${brokenX + 150}px ${GROUND - 60}px`,
        }}
      >
        <PixelButton
          x={brokenX}
          y={GROUND - 120}
          w={330}
          h={86}
          label={BG44_TEXT.hook.button}
          px={3}
          disabled={1}
        />
      </div>
      {cross > 0 ? (
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", left: 0, top: 0 }}
          shapeRendering="crispEdges"
        >
          <g
            transform={`translate(${brokenX + 120} ${GROUND - 150}) scale(${0.5 + 0.5 * pop(cross)})`}
          >
            <SpriteG rows={CROSS} px={11} x={-44} y={-44} />
          </g>
        </svg>
      ) : null}
      {/* три карточки-предмета */}
      {t.cards.map((c, i) => {
        const a = appear(f, 4 + i * 6, 12);
        const got = collected(i);
        const bob = Math.sin((f + i * 20) / 14) * 6 * (1 - got);
        const x = CARD.xs[i];
        const y = CARD.y - (1 - pop(a)) * 300 + bob;
        const ic = ICONS[i];
        const sz = spriteSize(ic.rows, ic.px);
        const sel = got > 0;
        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: CARD.w,
              height: CARD.h,
              opacity: clamp(a * 3),
              transform: `scale(${1 + 0.06 * Math.sin(got * Math.PI)})`,
            }}
          >
            <PixelPanel
              x={0}
              y={0}
              w={CARD.w}
              h={CARD.h}
              fill={sel ? C.yellowSoft : C.white}
              border={sel ? C.yellowDeep : C.navy}
              step={6}
              shadow={10}
            >
              <svg
                width={CARD.w}
                height={170}
                style={{ position: "absolute", left: 0, top: 10 }}
                shapeRendering="crispEdges"
              >
                <SpriteG
                  rows={ic.rows}
                  px={ic.px}
                  x={(CARD.w - 12 - sz.width) / 2}
                  y={(160 - sz.height) / 2}
                />
              </svg>
              <PixelText
                text={c.k}
                px={7}
                x={(CARD.w - 12) / 2}
                y={192}
                align="center"
                color={C.navy}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 262,
                  textAlign: "center",
                  fontFamily,
                  fontSize: 27,
                  fontWeight: 800,
                  color: C.ink,
                }}
              >
                {c.v}
              </div>
              {sel ? (
                <svg
                  width={72}
                  height={64}
                  style={{
                    position: "absolute",
                    right: 6,
                    top: 6,
                    transform: `scale(${pop(got)})`,
                  }}
                  shapeRendering="crispEdges"
                >
                  <SpriteG rows={CHECK} px={8} />
                </svg>
              ) : null}
            </PixelPanel>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 2D: мама с телефоном (средний план) ----------
const MomShot: React.FC<{
  readonly f: number;
  readonly push: number;
  readonly smile?: boolean;
  readonly phoneDown?: number;
}> = ({ f, push, smile, phoneDown = 0 }) => {
  const mouth = useMouth("mother");
  const z = 1 + 0.5 * push;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${z})`,
        transformOrigin: "52% 50%",
      }}
    >
      <Stage>
        <Room tone="day" floorY={1500} windowX={600} />
        <Mom
          x={560}
          y={2060}
          scale={2.35}
          f={f}
          pose="holdPhone"
          mouth={mouth}
          expression={smile ? "happy" : mouth > 0 ? "smile" : "thoughtful"}
          gaze={phoneDown > 0.5 ? "camera" : "down"}
        />
      </Stage>
    </div>
  );
};

// ---------- 2D: крупный план рук с телефоном ----------
const PhoneShot: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const t = BG44_TEXT.cards;
  const form = t.form;
  const typed = form.fields.map((fl, i) => (f - b.types[i]) * 0.95);
  const active = typed.findIndex(
    (n, i) => n >= 0 && n < form.fields[i].v.length + 4,
  );
  const chat = easeInOut((f - b.chat) / 14);
  const sendP = clamp(1 - Math.abs(f - (b.send + 1)) / 4);
  const sent = clamp((f - (b.send + 3)) / 16);
  const btnP = clamp(1 - Math.abs(f - (b.btn + 1)) / 4);
  // кончик пальца: поле, кнопка, кнопка отправки
  let tip = { x: PH.x + 330, y: FIELD_Y[0] };
  const fieldX = (i: number) =>
    PH.x + 120 + Math.min(form.fields[i].v.length, Math.max(0, typed[i])) * 15;
  if (f < b.types[1]) tip = { x: fieldX(0), y: FIELD_Y[0] };
  else if (f < b.types[2]) tip = { x: fieldX(1), y: FIELD_Y[1] };
  else if (f < b.types[3]) tip = { x: fieldX(2), y: FIELD_Y[2] };
  else if (f < b.typeEnd + 4) tip = { x: fieldX(3), y: FIELD_Y[3] };
  else if (f < b.btn + 8) tip = { x: PH.x + PH.w / 2 + 40, y: BTN_Y };
  else tip = { x: SEND.x, y: SEND.y };
  const typingPress =
    f >= b.types[0] && f < b.typeEnd
      ? Math.floor(f / 2) % 2 === 0
        ? 1
        : 0.55
      : 0.2;
  const press =
    f >= b.btn - 2 && f <= b.btn + 6
      ? btnP
      : f >= b.send - 3 && f <= b.send + 6
        ? sendP
        : typingPress;
  const handIn = easeOut((f - b.cu) / 12);
  const handOut = easeInOut((f - (b.send + 14)) / 16);
  const flyCard = (i: number) => clamp((f - b.fly[i]) / 12);
  const highlight = b.fly.findIndex(
    (fl, i) => f >= fl + 10 && f < b.types[i] + 8,
  );
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#EAF3FC" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #EAF3FC 70%)",
        }}
      />
      {/* левая рука держит телефон снизу (задний слой) */}
      <Stage>
        <Hand
          x={PH.x + PH.w / 2 - 20}
          y={PH.y + PH.h + 70}
          variant="hold"
          scale={(PH.w / 200) * 0.74}
          holdWidth={200}
          layer="back"
        />
      </Stage>
      <Phone x={PH.x} y={PH.y} w={PH.w} h={PH.h} tilt={-2}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateX(${-100 * chat}%)`,
          }}
        >
          <SiteForm
            typed={typed}
            active={active}
            f={f}
            buttonPressed={btnP}
            highlight={highlight}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateX(${100 - 100 * chat}%)`,
          }}
        >
          <WhatsAppChat sendPressed={sendP} sent={sent} />
        </div>
      </Phone>
      {/* кончики пальцев на правом крае (большой палец — за телефоном, текст не закрыт) */}
      <Stage>
        <defs>
          <clipPath id="bg44-hold-tips">
            <rect x={PH.x + PH.w - 34} y={0} width={400} height={1920} />
          </clipPath>
        </defs>
        <g clipPath="url(#bg44-hold-tips)">
          <Hand
            x={PH.x + PH.w / 2 - 20}
            y={PH.y + PH.h + 70}
            variant="hold"
            scale={(PH.w / 200) * 0.74}
            holdWidth={200}
            layer="front"
          />
        </g>
      </Stage>
      {/* карточки влетают в поля формы */}
      {t.cards.map((c, i) => {
        const k = flyCard(i);
        if (k <= 0 || k >= 1) return null;
        const e = easeInOut(k);
        const x = lerp(CARD.xs[i] + 40, PH.x + 40, e);
        const y = lerp(1500, FIELD_Y[i] - 20, e);
        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `scale(${0.8 - 0.45 * e})`,
              transformOrigin: "0 0",
              opacity: 1 - clamp((k - 0.75) / 0.25),
            }}
          >
            <PixelPanel
              x={0}
              y={0}
              w={220}
              h={86}
              fill={C.yellowSoft}
              border={C.navy}
              step={5}
              shadow={0}
            >
              <PixelText
                text={c.k}
                px={6}
                x={(220 - 10) / 2}
                y={22}
                align="center"
                color={C.navy}
              />
            </PixelPanel>
          </div>
        );
      })}
      {/* правая рука: большой палец/указательный печатает и нажимает */}
      <Stage>
        <g
          transform={`translate(${(1 - handIn) * 300 + handOut * 400} ${(1 - handIn) * 500 + handOut * 600})`}
        >
          <Hand
            x={tip.x}
            y={tip.y}
            variant="tap"
            press={press}
            scale={0.92}
            angle={-20}
            ripple
          />
        </g>
      </Stage>
      {/* подпись: сообщение отправляет сам родитель */}
      {f >= b.note ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: 334,
            display: "flex",
            justifyContent: "center",
            opacity: appear(f, b.note, 10),
            transform: `translateY(${(1 - appear(f, b.note, 10)) * -20}px)`,
          }}
        >
          <div
            style={{
              padding: "14px 30px",
              borderRadius: 999,
              backgroundColor: C.yellow,
              color: C.navy,
              fontFamily,
              fontSize: 40,
              fontWeight: 900,
              boxShadow: "0 8px 0 rgba(20,40,90,0.15)",
            }}
          >
            {t.whatsapp.note}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const CardsScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = useBeats();
  const morph = clamp((f - b.morph0) / (b.morph1 - b.morph0));
  const game = <GamePart f={f} b={b} />;
  let real: React.ReactNode;
  if (f < b.cu) {
    const push = easeInOut((f - (b.cu - 22)) / 22);
    real = <MomShot f={f} push={push} />;
  } else if (f < b.back) {
    real = <PhoneShot f={f} b={b} />;
  } else {
    real = (
      <MomShot f={f} push={0} smile phoneDown={appear(f, b.back + 10, 12)} />
    );
  }
  const isGame = f < b.morph0 + (b.morph1 - b.morph0) / 2;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {f < b.morph1 ? (
        <PixelMorph
          id="bg44-cards-morph"
          progress={morph}
          from={game}
          to={real}
          dir="diag"
        />
      ) : (
        real
      )}
      <Badge
        kind={
          f >= b.morph0 && f < b.morph1 ? "both" : isGame ? "game" : "example"
        }
      />
    </div>
  );
};

// Сцена 5 «decision» — ДЕҢГЭЭЛ 4: ЧЕЧИМ СИЗДИКИ (≈ 14 с). Реплика n2:
// «Бул оюндагы белек эмес, чыныгы кызматтын тартиби. Сыноодон кийин гана
// улантууну тандап, төлөмгө өтөсүз.»
//  • Игра: вместо «ПОБЕДА!» подарок-приз качается — на «белек эмес»
//    спокойно превращается в лист с правилами. Две РАВНЫЕ кнопки
//    «УЛАНТАМ» / «УЛАНТПАЙМ», курсор думает между ними (без таймера).
//  • 2D (условный пример): вечер дома, мама за столом с телефоном, сын
//    делает уроки (книга и карандаш — без еды). Мама думает, смотрит на
//    сына, улыбается; на «улантууну тандап» спокойно нажимает «Улантам».
//  • На «төлөмгө» — обычный экран ноутбука: порядок оплаты дословно с
//    сайта BalaGo (без людей и без метки — это настоящие условия).
import { useCurrentFrame } from "remotion";
import { appear, clamp, easeInOut, pop, shake } from "../anim";
import { useScene, useWordAt } from "../context";
import { Badge } from "../kit/Badge";
import { Room, Stage, Table } from "../kit/city";
import { Laptop, PaymentSteps, Phone, WhatsAppChat } from "../kit/devices";
import { GameWorld, LevelBanner, StepDots } from "../kit/GameWorld";
import { Hand, Kid, Mom, SIT } from "../kit/people";
import { PixelMorph } from "../kit/PixelMorph";
import { PixelButton, PixelCursor } from "../kit/PixelUI";
import { SpriteG, spriteSize } from "../kit/Sprite";
import { DOC, GIFT, STAR } from "../kit/sprites";
import { C } from "../palette";
import { BG44_TEXT } from "../script";
import type { SceneSfxFn } from "../sound";

const PX = 10;
const GROUND = 1236;

const useBeats = () => {
  const { frames } = useScene();
  const w2 = useWordAt("n2", 2);
  const w3 = useWordAt("n2", 3);
  const w4 = useWordAt("n2", 4);
  const w7 = useWordAt("n2", 7);
  const w9 = useWordAt("n2", 9);
  const w11 = useWordAt("n2", 11);
  const w12 = useWordAt("n2", 12);
  const w13 = useWordAt("n2", 13);
  const morph0 = w4 - 4;
  const morph1 = morph0 + 22;
  const tPhone = Math.max(morph1 + 40, w9 - 2);
  const tap = Math.max(tPhone + 16, w11);
  const tDesk = Math.max(tap + 14, w12 - 6);
  return { frames, w2, w3, w7, w13, morph0, morph1, tPhone, tap, tDesk };
};

export const decisionSfx: SceneSfxFn = ({ wordAt }) => {
  const w = (i: number) => wordAt("n2", i);
  const morph0 = w(4) - 4;
  const tPhone = Math.max(morph0 + 62, w(9) - 2);
  const tap = Math.max(tPhone + 16, w(11));
  const tDesk = Math.max(tap + 14, w(12) - 6);
  return [
    { at: 2, name: "start", volume: 0.36 },
    { at: w(3), name: "blip", volume: 0.35 },
    { at: morph0, name: "pixels", volume: 0.3 },
    { at: tPhone - 2, name: "whoosh", volume: 0.14 },
    { at: tap, name: "tap", volume: 0.4 },
    { at: tap + 3, name: "chime", volume: 0.2 },
    { at: tDesk, name: "whoosh", volume: 0.14 },
    ...[0, 1, 2, 3].map((i) => ({
      at: tDesk + 8 + i * 9,
      name: "check" as const,
      volume: 0.22,
    })),
  ];
};

// ---------- игра ----------
const GamePart: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const d = BG44_TEXT.decision;
  const toDoc = clamp((f - b.w3) / 10);
  const giftPx = 16;
  const g = spriteSize(GIFT, giftPx);
  const doc = spriteSize(DOC, giftPx);
  const wob = toDoc < 1 ? Math.sin(f / 3) * 4 + shake(f, b.w2, 14, 10) : 0;
  // курсор раздумывает между двумя равными кнопками
  const cx = 540 + Math.sin((f - 20) / 22) * 250;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <GameWorld px={PX} groundY={GROUND} frame={f + 1000} />
      <LevelBanner title={d.level} appear={appear(f, 0, 14)} />
      <StepDots current={4} y={506} appear={appear(f, 4, 12)} />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
        shapeRendering="crispEdges"
      >
        <g transform={`translate(540 760) rotate(${wob})`} opacity={1 - toDoc}>
          <SpriteG rows={GIFT} px={giftPx} x={-g.width / 2} y={-g.height / 2} />
        </g>
        <g
          transform={`translate(540 760) scale(${0.5 + 0.5 * pop(toDoc)})`}
          opacity={toDoc}
        >
          <SpriteG
            rows={DOC}
            px={giftPx}
            x={-doc.width / 2}
            y={-doc.height / 2}
          />
        </g>
        {toDoc > 0 && toDoc < 1
          ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const a = (i / 8) * Math.PI * 2;
              const r = 90 + 150 * toDoc;
              return (
                <SpriteG
                  key={i}
                  rows={STAR}
                  px={4}
                  x={540 + Math.cos(a) * r - 18}
                  y={760 + Math.sin(a) * r - 18}
                  opacity={1 - toDoc}
                />
              );
            })
          : null}
      </svg>
      <PixelButton
        x={60}
        y={960}
        w={460}
        h={130}
        label={d.yes}
        px={7}
        fill={C.white}
        edge="#C9D3E2"
        opacity={appear(f, 16, 10)}
      />
      <PixelButton
        x={560}
        y={960}
        w={460}
        h={130}
        label={d.no}
        px={7}
        fill={C.white}
        edge="#C9D3E2"
        opacity={appear(f, 20, 10)}
      />
      {f > 26 ? (
        <PixelCursor
          x={cx}
          y={1040 + Math.abs(Math.cos((f - 20) / 22)) * 12}
          px={9}
        />
      ) : null}
    </div>
  );
};

// ---------- 2D: вечер дома ----------
const FLOOR = 1250;
const TABLE_TOP = 950;
const HomeShot: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const momSeatY = TABLE_TOP - SIT.mom.tableTop; // сиденье мамы
  const kidS = 1.3;
  const kidSeatY = TABLE_TOP - SIT.kid.tableTop * kidS;
  const look =
    f > b.w7 - 10
      ? f > b.w7 + 12
        ? "camera"
        : ([0.9, 0.2] as const)
      : ("down" as const);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "scale(1.28)",
        transformOrigin: "52% 50%",
      }}
    >
      <Stage>
        <Room tone="evening" floorY={FLOOR} windowX={600} />
        {/* стулья */}
        <rect
          x={150}
          y={momSeatY}
          width={190}
          height={18}
          rx={6}
          fill="#B98A62"
        />
        <rect
          x={160}
          y={momSeatY + 18}
          width={14}
          height={FLOOR - momSeatY - 18}
          fill="#A47852"
        />
        <rect
          x={316}
          y={momSeatY + 18}
          width={14}
          height={FLOOR - momSeatY - 18}
          fill="#A47852"
        />
        <rect
          x={700}
          y={kidSeatY}
          width={200}
          height={18}
          rx={6}
          fill="#B98A62"
        />
        <rect
          x={712}
          y={kidSeatY + 18}
          width={14}
          height={FLOOR - kidSeatY - 18}
          fill="#A47852"
        />
        <rect
          x={874}
          y={kidSeatY + 18}
          width={14}
          height={FLOOR - kidSeatY - 18}
          fill="#A47852"
        />
        <Mom
          x={250}
          y={momSeatY}
          scale={1}
          f={f}
          pose="sitPhone"
          press={0}
          expression={f > b.w7 ? "smile" : "thoughtful"}
          gaze={look}
        />
        <Kid x={800} y={kidSeatY} scale={kidS} f={f} pose="homework" flip />
        <Table x={330} y={TABLE_TOP} w={420} legs={FLOOR - TABLE_TOP - 26} />
      </Stage>
    </div>
  );
};

// ---------- 2D: телефон — мама сама пишет «Улантам» в WhatsApp ----------
const PHONE = { x: 270, y: 330, w: 540, h: 900 } as const;
const SEND = { x: PHONE.x + PHONE.w - 74, y: PHONE.y + PHONE.h - 74 } as const;
const PhoneShot: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const d = BG44_TEXT.decision;
  const wa = BG44_TEXT.cards.whatsapp;
  const press = clamp(1 - Math.abs(f - (b.tap + 1)) / 5);
  const sent = clamp((f - (b.tap + 3)) / 14);
  const handIn = easeInOut((f - b.tPhone) / 12);
  const handOut = easeInOut((f - (b.tap + 14)) / 14);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 40%, #FFF8EE 0%, #F6E7D5 75%)",
      }}
    >
      <Phone x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} tilt={2}>
        <WhatsAppChat
          lines={[d.yes]}
          prior={[wa.lines[0]]}
          priorTime="08:15"
          time="19:40"
          sendPressed={press}
          sent={sent}
          draftSize={30}
        />
      </Phone>
      <Stage>
        <g
          transform={`translate(${(1 - handIn) * 260 + handOut * 300} ${(1 - handIn) * 420 + handOut * 500})`}
        >
          <Hand
            x={SEND.x}
            y={SEND.y}
            variant="tap"
            press={f < b.tap - 6 ? 0.1 : press > 0 ? press : 0.3}
            scale={0.92}
            angle={-20}
            ripple
          />
        </g>
      </Stage>
    </div>
  );
};

// ---------- обычный рабочий стол: настоящий порядок оплаты ----------
const DeskShot: React.FC<{
  readonly f: number;
  readonly b: ReturnType<typeof useBeats>;
}> = ({ f, b }) => {
  const visible = (f - (b.tDesk + 4)) / 8;
  const hl = f >= b.w13 - 2 ? [2, 3] : [];
  const z = 1 + 0.03 * easeInOut((f - b.tDesk) / 120);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F7F2EA" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1160,
          bottom: 0,
          backgroundColor: "#E2C8A6",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1160,
          height: 14,
          backgroundColor: "#D3B48D",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${z})`,
          transformOrigin: "50% 45%",
        }}
      >
        <Laptop x={50} y={420} w={980}>
          <PaymentSteps visible={visible} highlight={hl} fontSize={31} />
        </Laptop>
      </div>
    </div>
  );
};

export const DecisionScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = useBeats();
  let real: React.ReactNode;
  if (f < b.tPhone) real = <HomeShot f={f} b={b} />;
  else if (f < b.tDesk) real = <PhoneShot f={f} b={b} />;
  else real = <DeskShot f={f} b={b} />;
  const deskIn = clamp((f - b.tDesk) / 7);
  const morph = clamp((f - b.morph0) / (b.morph1 - b.morph0));
  const isGame = f < b.morph0 + 11;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {f < b.morph1 ? (
        <PixelMorph
          id="bg44-decision-morph"
          progress={morph}
          from={<GamePart f={f} b={b} />}
          to={real}
          dir="diag"
        />
      ) : (
        real
      )}
      {f >= b.tDesk && deskIn < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - deskIn }}>
          <PhoneShot f={b.tDesk - 1} b={b} />
        </div>
      ) : null}
      {deskIn < 1 ? (
        <Badge
          kind={
            f >= b.morph0 && f < b.morph1 ? "both" : isGame ? "game" : "example"
          }
          opacity={1 - deskIn}
        />
      ) : null}
    </div>
  );
};

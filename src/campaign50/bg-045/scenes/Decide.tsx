// Сцена 3 (≈18–32 с): зеркала соединяются — остаётся реальная мама.
// 1) Условная створка складывается в линию, левая половина раскрывается
//    на весь кадр; часы быстро бегут к 15:10 — мама вернулась за стол.
// 2) Крупно ноутбук: неделя, где каждый день «12:40 Мектеп» среди встреч.
//    Мама закрывает календарь (курсор → ×).
// 3) Мама берёт телефон: «Мен да алдын ала каттам уюштурууга аракет
//    кылып көрөйүн. Үйдү, мектепти, убакытты так жазам.»
// 4) Телефон крупно: поиск → сайт BalaGo → поля формы заполняются ровно
//    на словах «үйдү», «мектепти», «убакытты» → «Арыз калтыруу» →
//    WhatsApp с подготовленным текстом → мама САМА нажимает «отправить».
//    Над телефоном: «Издөө → так маалымат → өзү жөнөтүү».
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useTimeline } from "../context";
import { HALF, LeftPanel, MirrorLine, NowLabel, RightPanel } from "../mirror";
import { LOOKS } from "../rig/looks";
import type { Place, PoseIn } from "../rig/Actor";
import { easeInOut, keys, keysV, lerp, vec } from "../rig/motion";
import { CONSENT_BOX, FORM_BUTTON, FormScreen, HoldingHand, PhoneFrame, SCREEN_W, SEND_BUTTON, SearchScreen, StepsBar, TapFinger, WeekCalendar, WhatsAppScreen } from "../screens";
import { OFFICE } from "../sets/Office";
import { camMove, mixCam, View, type Cam } from "../shots";
import { CAM_HALF, H, MOM_SEAT, OFFICE_AXIS, typePose, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";
import { decideBeats } from "../beats";
import { SPLIT_MIN0 } from "./Split";

const CAM_WIDE: Cam = { x: 90, y: 990, zoom: 1.08 };
const CAM_LAPTOP: Cam = { x: OFFICE.laptop.x - 40, y: OFFICE.laptop.y - 120, zoom: 1.6 };
const CAM_MOM: Cam = { x: 30, y: 950, zoom: 2.0 };

// Телефон крупным планом (px кадра) и пересчёт точки макета в кадр.
export const PH = { x: 290, y: 340, w: 500 } as const;
const inset = PH.w * 0.035;
const kScr = (PH.w - 2 * inset) / SCREEN_W;
export const phonePt = (sx: number, sy: number) => ({ x: PH.x + inset + sx * kScr, y: PH.y + inset + sy * kScr });

// склейка → мама за столом (короткое растворение, пауза) → календарь
// держится ≈ 1,4 с: клетки «12:40 Мектеп» вспыхивают по очереди, курсор → ×
export const DC = { fold1: 22, join1: 26, fade0: 30, fade1: 38, push0: 44, push1: 58, close: 86, medium: 94 } as const;

export { decideBeats };

// Крупный план экрана ноутбука: рамка и календарь недели во весь кадр.
const LaptopCloseUp: React.FC<{ readonly f: number; readonly a: number }> = ({ f, a }) => {
  const W = 900;
  const k = (W - 40) / 260;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(250,247,238,0.55)", backdropFilter: "blur(10px)" }} />
      <div style={{ position: "absolute", left: (1080 - W) / 2, top: 520, width: W, height: 166 * k + 40, borderRadius: 34, backgroundColor: "#2B2F3C", boxShadow: "0 40px 80px rgba(20,30,60,0.35)", transform: `scale(${0.88 + 0.12 * a})` }}>
        <div style={{ position: "absolute", left: 20, top: 20, width: 260, height: 166, transform: `scale(${k})`, transformOrigin: "0 0", borderRadius: 4, overflow: "hidden" }}>
          <WeekCalendar f={f} closeAt={DC.close} />
        </div>
      </div>
      <div style={{ position: "absolute", left: (1080 - W) / 2 - 40, top: 520 + 166 * k + 40, width: W + 80, height: 34, borderRadius: "6px 6px 22px 22px", backgroundColor: "#BCC3CF", transform: `scale(${0.88 + 0.12 * a})` }} />
    </div>
  );
};

export const DecideScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const tl = useTimeline();
  const m01 = useLine("m01");
  const cue = tl.cues.find((c) => c.id === "m01")!;
  const b = decideBeats(m01, (p, fb, nth = 0) => wordFrame(cue, p, fb, from, nth));
  const momL = LOOKS.mom;

  // 1. склейка зеркал: пустой офис, часы бегут к 15:10
  const joinT = easeInOut(f / DC.join1);
  const emptyMinutes = lerp(SPLIT_MIN0 + 9, 15 * 60 + 10, easeInOut(f / (DC.fade1 + 4)));
  const later = keys(f, [[DC.fade0, 0], [DC.fade1, 1]]);

  // 2–3. мама за столом
  const reach = DC.medium + 4;
  const lift = DC.medium + 18;
  const momPose = (t: number): PoseIn => {
    const p: Place = MOM_SEAT();
    const typing = typePose(t, t < DC.push0 ? 0.6 : 0, 0);
    // руки на клавиатуре и во время крупного плана календаря (без рывка)
    if (t < DC.medium) return { ...typing, lookY: 0.15, expr: "thinking" };
    const hold = vec(p.x + 70, p.y - 0.555 * H.mom);
    const hand = keysV(t, [
      [reach - 2, vec(OFFICE.laptop.x - 60, OFFICE.laptop.y - 12)],
      [reach + 10, vec(OFFICE.phone.x + 8, OFFICE.phone.y - 12)],
      [lift, hold],
    ]);
    const holding = t >= reach + 10;
    return {
      sit: 1,
      seat: OFFICE.mom.seat,
      lean: 3,
      armR: holding
        ? { target: vec(hand.x, hand.y + Math.sin(t / 9) * 3), shape: "phone", item: "phone", elbow: "down", glow: 1, behind: false }
        : { target: hand, shape: "open", elbow: "down", behind: false },
      armL: holding ? { target: vec(hand.x - 34, hand.y + 34), shape: "point", elbow: "down", behind: false } : { target: vec(OFFICE.desk.x + 40, OFFICE.desk.top - 4), shape: "relax", elbow: "down", behind: false },
      expr: t < m01.from ? "thinking" : t < m01.from + 40 ? "calm" : "softSmile",
      exhale: keys(t, [[DC.medium - 2, 0], [DC.medium + 6, 1], [DC.medium + 18, 0]]),
      lookY: keys(t, [[lift - 6, 0.1], [lift + 4, 0.55]]),
      headTilt: keys(t, [[m01.from, 0], [m01.from + 14, 4]]),
      nod: keys(t, [[m01.from + 30, 0], [m01.from + 36, 4], [m01.from + 42, 0]]),
    };
  };
  const momFace = (t: number) => keys(t, [[DC.medium, 0.55], [DC.medium + 12, 0.25]]);
  const phoneOnDesk = f < reach + 10;

  const office = (cam: Cam) => (
    <View cam={cam}>
      <OfficeWorld
        f={f}
        minutes={15 * 60 + 10 + f / 60}
        uid="d"
        pose={momPose}
        face={momFace}
        speaking
        phoneOnDesk={phoneOnDesk}
        screen={<WeekCalendar f={f} closeAt={DC.close} />}
        seed={8}
        blinks={[DC.close + 4]}
      />
    </View>
  );

  // 4. телефон крупно
  const inPhone = f >= b.phoneIn;
  const ph = keys(f, [[b.phoneIn, 0], [b.phoneIn + 10, 1]]);
  const float = Math.sin(f / 22) * 4;
  const scr = f < b.formIn ? (
    <SearchScreen f={f} typeFrom={b.phoneIn + 2} tapAt={b.searchTap} />
  ) : f < b.chatIn ? (
    <FormScreen f={f} fills={b.fills} checkAt={b.check} tapAt={b.formTap} />
  ) : (
    <WhatsAppScreen f={f} sendAt={b.sendAt} />
  );
  const tapS = phonePt(462, 300);
  const tapF = phonePt(FORM_BUTTON.x + 195, FORM_BUTTON.y + 10);
  const tapC = phonePt(CONSENT_BOX.x, CONSENT_BOX.y);
  const tapW = phonePt(SEND_BUTTON.x, SEND_BUTTON.y);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      {/* 1. склейка: условная створка складывается, левая раскрывается */}
      {f < DC.fade1 ? (
        <>
          <LeftPanel cam={mixCam({ ...CAM_HALF, zoom: CAM_HALF.zoom * 1.07, y: CAM_HALF.y + 40 }, CAM_WIDE, joinT)} width={lerp(HALF, 1080, joinT)}>
            <OfficeWorld f={f} minutes={emptyMinutes} uid="d-e" pose={() => ({})} hideMom phoneOnDesk={false} lid={0} chairSpin={0.1} />
          </LeftPanel>
          <RightPanel cam={CAM_HALF} mirror={OFFICE_AXIS} open={1 - f / DC.fold1} f={f}>
            <OfficeWorld f={f} minutes={emptyMinutes} uid="d-r" pose={(t) => typePose(t, 1, 3)} seed={6} />
          </RightPanel>
          <MirrorLine draw={1 - keys(f, [[4, 0], [DC.fold1 - 4, 1]])} />
          <NowLabel a={1 - keys(f, [[0, 0], [8, 1]])} />
        </>
      ) : null}
      {/* 2–3. реальная мама: позже, за тем же столом */}
      {f >= DC.fade0 && !inPhone ? (
        <div style={{ position: "absolute", inset: 0, opacity: later }}>
          {office(f < DC.medium ? camMove(f, DC.push0, DC.push1, CAM_WIDE, CAM_LAPTOP) : camMove(f, DC.medium, b.phoneIn, CAM_MOM, { ...CAM_MOM, zoom: 2.1, y: 955 }))}
        </div>
      ) : null}
      {/* экран ноутбука крупно (плоская вставка поверх размытого офиса): неделя,
          где каждый день «12:40 Мектеп» среди встреч; курсор закрывает календарь */}
      {f >= DC.push0 && f < DC.medium ? <LaptopCloseUp f={f} a={keys(f, [[DC.push0, 0], [DC.push0 + 10, 1], [DC.medium - 1, 1], [DC.medium, 0]])} /> : null}
      {/* 4. телефон крупно */}
      {inPhone ? (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #FFF6D8 85%)" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.35, filter: "blur(14px)" }}>{office({ ...CAM_MOM, zoom: 1.5 })}</div>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,250,236,0.7)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: ph, translate: `0 ${(1 - ph) * 60 + float}px` }}>
            <PhoneFrame x={PH.x} y={PH.y} w={PH.w}>
              {scr}
            </PhoneFrame>
            <HoldingHand x={PH.x} y={PH.y} w={PH.w} sleeve={momL.topColor} skin={momL.skin} />
            <TapFinger x={tapS.x} y={tapS.y} f={f} tapAt={b.searchTap} skin={momL.skin} />
            {/* согласие мама отмечает сама, затем «Арыз калтыруу» */}
            <TapFinger x={tapC.x} y={tapC.y} f={f} tapAt={b.check + 1} lead={12} tail={10} skin={momL.skin} />
            <TapFinger x={tapF.x} y={tapF.y} f={f} tapAt={b.formTap} lead={12} skin={momL.skin} />
            <TapFinger x={tapW.x} y={tapW.y} f={f} tapAt={b.sendAt} skin={momL.skin} />
          </div>
          <StepsBar f={f} at={[b.phoneIn + 6, b.fills[0], b.sendAt]} />
        </div>
      ) : null}
    </div>
  );
};

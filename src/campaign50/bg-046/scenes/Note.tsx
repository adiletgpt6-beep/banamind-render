// Сцена 4 (≈34–48 с): «Так маалымат → ылайыктуу топ издөө».
// 1) Крупно: клапан кармана рюкзака распахивается, оттуда выпрыгивает
//    записка, мама ловит её — «Үй • Мектеп • Убакыт».
// 2) Мама сама ищет в телефоне «Бишкек балдар такси мектеп» и открывает
//    BalaGo (бренд появляется как результат её поиска).
// 3) Диктор: «BalaGo үчүн үйдүн дареги, мектеп жана убакыт керек…» —
//    поля страницы заполняются ровно на этих словах; мама нажимает
//    «WhatsApp аркылуу жазуу», открывается подготовленное сообщение, и
//    мама САМА нажимает «отправить» (серые галочки — только отправлено).
// 4) «…Ошол маалымат боюнча ылайыктуу топ изделет.» — карточка правила
//    и факты: группа 3–4 ребёнка, поиск до 2 недель.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { FACE } from "../Backpack";
import { noteBeats } from "../beats";
import { useTimeline } from "../context";
import { C } from "../palette";
import { Icon, NotePaper, ReachArm } from "../parts";
import { LOOKS } from "../rig/looks";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { ChatScreen, HoldingHand, PhoneFrame, SearchScreen, SiteScreen, TapFinger } from "../screens";
import { BG46_TEXT } from "../script";
import { HALL, ChairBack, ChairSeat, HallBack } from "../sets/Hall";
import { camMove, Shot } from "../shots";
import { BAG_S, faceKeys, hop, LiveBag } from "./common";

const PW = 470; // ширина телефона в кадре
const DESIGN = 577; // ширина экрана, под которую свёрстан контент
const K = (PW * 0.93) / DESIGN;
const PX = 305;
const PY = 392;
// точка экрана (px макета) → кадр
const onScreen = (dx: number, dy: number) => ({ x: PX + PW * 0.035 + dx * K, y: PY + PW * 0.035 + dy * K });

export const NoteScene: React.FC = () => {
  const f = useCurrentFrame();
  const T = BG46_TEXT.note;
  const { pop, fly0, catchAt, unfold, S, typeFrom, typeTo, resTap, siteAt, wHome, wSchool, wTime, btnTap, chatAt, sendAt, cardAt } = noteBeats(useTimeline());

  // рюкзак: гордо «помогает»
  const face = (t: number) =>
    faceKeys(t, [
      [0, { ...FACE.thinking, lookX: 0, lookY: 0.6 }],
      [pop - 2, { ...FACE.wonder, lookY: 0.7 }],
      [fly0 + 4, { ...FACE.happy, lookX: 0.8, lookY: 0.4 }],
      [catchAt + 6, FACE.proud],
    ], 6);
  const sq = (t: number) => hop(t, pop, 26, 10)[1];
  const by = (t: number) => HALL.chair.seat - 12 - hop(t, pop, 26, 10)[0];
  // записка летит из кармана в руку мамы (кадр, px)
  const bagX = HALL.chair.x;
  const pocketW = { x: bagX, y: HALL.chair.seat - 12 - 170 * BAG_S };
  const cam1 = camMove(f, 0, S, { x: bagX + 60, y: HALL.chair.seat - 150, zoom: 2.15 }, { x: bagX + 120, y: HALL.chair.seat - 60, zoom: 2.3 });
  const toScreen = (p: { x: number; y: number }) => ({ x: 540 + (p.x - cam1.x) * cam1.zoom, y: 960 + (p.y - cam1.y) * cam1.zoom });
  const ps = toScreen(pocketW);
  const u = easeInOut((f - fly0) / (catchAt - fly0));
  const hand = { x: 760, y: 1180 };
  const noteP = {
    x: lerp(ps.x, hand.x, u),
    y: lerp(ps.y, hand.y, u) - Math.sin(Math.PI * clamp(u)) * 380,
  };
  const noteRot = lerp(-30, 6, u) + (f > catchAt ? Math.sin((f - catchAt) / 8) * 1.5 : 0);
  const noteS = lerp(0.22, 0.9, u);
  const open = clamp((f - unfold[0]) / (unfold[1] - unfold[0]));
  // мама держит записку за нижний правый угол
  const grip = { x: noteP.x + 170 * noteS, y: noteP.y - 260 * noteS + 520 * noteS * (0.25 + 0.75 * open) - 30 };
  const momL = LOOKS.mom;
  const armIn = easeOut((f - (catchAt - 12)) / 12);

  // 2–3. телефон
  const phone = f >= S;
  const screen = f < siteAt ? "search" : f < chatAt ? "site" : "chat";
  const tapAt = screen === "search" ? resTap : screen === "site" ? btnTap : sendAt;
  const tapPt = screen === "search" ? onScreen(290, 330) : screen === "site" ? onScreen(290, 1000) : onScreen(DESIGN - 70, 1180);
  const tf = screen === "search" ? f - S : screen === "site" ? f - siteAt : f - chatAt;
  const tAt = tapAt - (screen === "search" ? S : screen === "site" ? siteAt : chatAt);
  const noteMini = easeOut((f - S) / 10) * (1 - easeOut((f - cardAt + 4) / 8));
  const card = easeOut((f - cardAt) / 10);

  return (
    <>
      {/* 1. крупно: рюкзак и записка */}
      <Shot f={f} from={0} to={S} cam={cam1}>
        <HallBack minutes={BG46_TEXT.morning.clock + 30} />
        <ChairBack x={bagX} seat={HALL.chair.seat} />
        <ChairSeat x={bagX} seat={HALL.chair.seat} floor={HALL.floorY} />
        <LiveBag uid="n-bag" f={f} x={() => bagX} y={by} s={BAG_S} face={face} squash={sq} pocket={keys(f, [[pop, 0], [pop + 6, 1], [catchAt + 10, 1], [catchAt + 22, 0]])} seed={13} speaks={false} />
      </Shot>
      {f < S ? (
        <>
          {f >= fly0 - 2 ? <NotePaper x={noteP.x} y={noteP.y} rot={noteRot} s={noteS} open={open} words={T.paper} /> : null}
          {armIn > 0 ? <ReachArm from={{ x: 1250, y: 1950 }} to={{ x: lerp(1150, grip.x, armIn), y: lerp(1750, grip.y, armIn) }} sleeve={momL.topColor} skin={momL.skin} w={96} bend={-60} thumb={-1} /> : null}
        </>
      ) : null}

      {/* 2–3. телефон мамы */}
      {phone ? (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #EAF2FA 85%)" }}>
          {noteMini > 0.01 ? <NotePaper x={170} y={560} rot={-8} s={0.4 * noteMini} open={1} words={T.paper} checks={[clamp((f - wHome) / 6), clamp((f - wSchool) / 6), clamp((f - wTime) / 6)]} /> : null}
          <PhoneFrame x={PX} y={PY} w={PW} tilt={-1}>
            <div style={{ position: "absolute", left: 0, top: 0, width: DESIGN, height: 1229, transform: `scale(${K})`, transformOrigin: "0 0" }}>
              {screen === "search" ? (
                <SearchScreen f={f - S} query={T.search} result={T.result} typeFrom={typeFrom - S} typeTo={typeTo - S} tapAt={resTap - S} />
              ) : screen === "site" ? (
                <SiteScreen f={f - siteAt} logo="assets/campaign50/bg-046/logo.png" brand={T.site.brand} city={T.site.city} fields={T.site.fields} fill={[wHome - siteAt, wSchool - siteAt, wTime - siteAt]} button={T.site.button} tapAt={btnTap - siteAt} />
              ) : (
                <ChatScreen f={f - chatAt} title={T.chat.title} message={T.chat.message} sendAt={sendAt - chatAt} hint={T.chat.hint} />
              )}
            </div>
          </PhoneFrame>
          <HoldingHand x={PX} y={PY} w={PW} sleeve={momL.topColor} skin={momL.skin} />
          <TapFinger x={tapPt.x} y={tapPt.y} f={tf} tapAt={tAt} skin={momL.skin} />
        </div>
      ) : null}

      {/* 4. правило и факты */}
      {card > 0.01 ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 150, opacity: card, transform: `translateY(${(1 - card) * -30}px)`, pointerEvents: "none" }}>
          <div style={{ padding: "22px 28px", borderRadius: 30, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, boxShadow: "0 16px 36px rgba(20,40,90,0.3)" }}>
            <div style={{ fontSize: 44, fontWeight: 900, textAlign: "center" }}>
              {T.rule.split("→")[0]}
              <span style={{ color: C.yellow }}>→</span>
              {T.rule.split("→")[1]}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
              {T.facts.map((t, i) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", fontSize: 32, fontWeight: 900, opacity: easeOut((f - cardAt - 8 - i * 6) / 8) }}>
                  <Icon kind={i ? "clock" : "group"} s={0.62} color={C.yellow} />
                  {t}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 30, fontWeight: 800, color: "#DCE6F7", opacity: easeOut((f - cardAt - 22) / 8) }}>{T.start}</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

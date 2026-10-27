// Сцена 4 (продолжение условного примера, тот же телефон): лента чата
// прокручивается. Во время поездки водитель — снова стоя на месте — сам
// отправляет в группу ссылку на текущее местоположение. Отец вручную
// нажимает на неё: открывается статичная схема с меткой машины и временем
// отправки (ничего не движется, нет маршрута и «живой точки»). «Бул
// шилтеме — автоматтык кабарлама эмес». Схема закрывается, приходит
// «Мектепке жеттик», отец отвечает «Рахмат!».
import { interpolate, useCurrentFrame } from "remotion";
import { appear, easeInOut } from "../anim";
import { useLine, useScene, useWordStarting } from "../context";
import { C } from "../palette";
import { abs, Bubble, Chip, DeskTop, font, IconBellOff, IconPin, LinkBubble, MiniMap, SystemNote, TopHand } from "../parts";
import { BG26_TEXT } from "../script";
import { DriverVignette } from "../sets";
import { CHAT_Y, ChatPhone, Members, SCREEN_W, toFrame, VIGNETTE_H } from "./chat";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// прокрутка ленты в начале сцены: ссылка встаёт выше зоны субтитров
const SCROLL1 = CHAT_Y.link - 440;

export const locationBeats = (wLink: number, wSend: number, wBul: number, lineTo: number, frames: number) => {
  const send = wLink - 4;
  const linkAt = send + 8;
  const tap = Math.max(linkAt + 26, wSend + 6);
  const mapOpen = tap + 8;
  const close = Math.max(mapOpen + 60, Math.min(lineTo + 4, frames - 66));
  const arrive = close + 16;
  const reply = arrive + 22;
  return { send, linkAt, tap, mapOpen, notAuto: wBul, close, arrive, reply };
};

export const LocationScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const line = useLine("n04");
  const b = locationBeats(useWordStarting("n04", "шилтемени"), useWordStarting("n04", "жөнөтөт"), useWordStarting("n04", "бул"), line.to, frames);
  const t = BG26_TEXT.chat;
  const [mOut, mIn, mLoc, mSchool] = t.messages;

  const scroll =
    interpolate(f, [0, 22], [0, SCROLL1], { ...CL, easing: easeInOut }) + interpolate(f, [b.close + 2, b.close + 16], [0, 60], { ...CL, easing: easeInOut });
  const oldVig = 1 - appear(f, 0, 12);
  const vigIn = easeInOut((f - 16) / 14) * (1 - easeInOut((f - (b.send + 10)) / 5));
  const typing = interpolate(f, [24, b.send - 4], [0, 1], CL);
  const sent = interpolate(f, [b.send, b.send + 10], [0, 1], CL);
  const link = appear(f, b.linkAt + 8, 10);
  const linkFlash = interpolate(f, [b.linkAt, b.linkAt + 8, b.linkAt + 36], [0, 1, 0], CL);
  const sheet = easeInOut((f - b.mapOpen) / 14) * (1 - easeInOut((f - b.close) / 14));
  const arrive = appear(f, b.arrive, 8);
  const reply = appear(f, b.reply, 8);
  const clock = f < b.arrive ? "08:06" : f < b.reply ? "08:20" : "08:21";

  // палец отца нажимает на ссылку сам
  const linkCenter = toFrame(22 + 430, CHAT_Y.link - SCROLL1 + 170);
  const handY = interpolate(f, [b.tap - 16, b.tap - 2, b.tap + 10, b.tap + 22], [1760, linkCenter.y, linkCenter.y, 1800], { ...CL, easing: easeInOut });
  const handX = interpolate(f, [b.tap - 16, b.tap - 2, b.tap + 10, b.tap + 22], [1080, linkCenter.x, linkCenter.x, 1100], { ...CL, easing: easeInOut });
  const handVis = interpolate(f, [b.tap - 16, b.tap - 8, b.tap + 14, b.tap + 22], [0, 1, 1, 0], CL);
  const press = f >= b.tap - 3 && f <= b.tap + 6 ? 1 : 0;

  const caption = f >= b.linkAt + 10 && f < b.notAuto - 4 ? appear(f, b.linkAt + 10, 8) : 0;
  const notAuto = f >= b.notAuto - 4 && f < b.close + 6 ? appear(f, b.notAuto - 4, 10) : 0;

  return (
    <>
      <DeskTop light={0.45} />
      <ChatPhone clock={clock}>
        <div style={abs({ left: 0, right: 0, top: 0, bottom: 0, transform: `translateY(${-scroll}px)` })}>
          <div style={abs({ left: 0, width: SCREEN_W, top: CHAT_Y.sys, display: "flex", flexDirection: "column", gap: 6 })}>
            <SystemNote text={t.firstDay} scale={1.0} />
            <SystemNote text={t.created} scale={0.95} />
          </div>
          <div style={abs({ left: 0, width: SCREEN_W, top: CHAT_Y.members })}>
            <Members p={1} />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.msg1 })}>
            <Bubble name={t.driver} text={mOut.text} time={mOut.time} scale={1.05} />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.msg2 })}>
            <Bubble name={t.driver} text={mIn.text} time={mIn.time} scale={1.05} />
          </div>
          <div style={abs({ left: 22, top: CHAT_Y.link, opacity: link, transform: `translateY(${(1 - link) * 24}px) scale(1.15)`, transformOrigin: "0 0" })}>
            <LinkBubble time={mLoc.time} press={press} highlight={linkFlash} />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.msg3, opacity: arrive, transform: `translateY(${(1 - arrive) * 24}px)` })}>
            <Bubble name={t.driver} text={mSchool.text} time={mSchool.time} scale={1.05} highlight={interpolate(f, [b.arrive, b.arrive + 8, b.arrive + 36], [0, 1, 0], CL)} />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.reply, opacity: reply, transform: `translateY(${(1 - reply) * 24}px)` })}>
            <Bubble side="out" text={t.reply} time="08:21" scale={1.05} />
          </div>
        </div>
        {/* врезка из прошлой сцены уходит */}
        {oldVig > 0.01 ? (
          <div style={abs({ left: 22, top: CHAT_Y.vignette - scroll, opacity: oldVig })}>
            <DriverVignette w={SCREEN_W - 44} h={VIGNETTE_H} f={f} text={mIn.text} typing={1} sent={1} kid={1} label={t.selfNote} parkedLabel={t.parked} />
          </div>
        ) : null}
        {/* врезка: водитель на месте отправляет ссылку на местоположение */}
        {vigIn > 0.01 ? (
          <div style={abs({ left: 22, top: CHAT_Y.link - SCROLL1, opacity: vigIn, transform: `translateX(${(1 - vigIn) * 260}px)` })}>
            <DriverVignette w={SCREEN_W - 44} h={VIGNETTE_H} f={f} text={mLoc.text} typing={typing} sent={sent} kid={1} mode="location" label={t.selfNote} parkedLabel={t.parked} />
          </div>
        ) : null}
        {/* статичная схема: метка машины и время отправки, ничего не движется */}
        {sheet > 0.01 ? (
          <div style={abs({ left: 0, width: SCREEN_W, top: 170 + (1 - sheet) * 1300, height: 1260, background: "#FFFFFF", borderRadius: "28px 28px 0 0", overflow: "hidden", boxShadow: "0 -10px 30px rgba(0,0,0,0.18)" })}>
            <div style={abs({ left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", gap: 14, padding: "0 28px" })}>
              <IconPin s={44} color="#D9473A" />
              <div style={font(38, 900, "#1E2A3A")}>{t.linkTitle}</div>
            </div>
            <div style={abs({ left: 0, top: 96, width: SCREEN_W, height: 1164 })}>
              <MiniMap w={SCREEN_W} h={1164} pin={{ x: 420, y: 560 }} scale={2} />
              <div style={abs({ left: 0, right: 0, top: 30, display: "flex", justifyContent: "center" })}>
                <Chip size={32} bg="#FFFFFF" color={C.navy}>
                  {t.mapNote}
                </Chip>
              </div>
            </div>
          </div>
        ) : null}
      </ChatPhone>
      <TopHand x={handX + 18} y={handY} angle={-38} press={press} opacity={handVis} />
      {/* подписи (над зоной субтитров, вне правых 150 px) */}
      <div style={abs({ left: 70, right: 150, top: 1236, display: "flex", justifyContent: "center", opacity: caption, transform: `translateY(${(1 - caption) * 20}px)` })}>
        <Chip size={30}>
          <IconPin s={32} color={C.yellow} />
          {t.linkCaption}
        </Chip>
      </div>
      <div style={abs({ left: 70, right: 150, top: 1236, display: "flex", justifyContent: "center", opacity: notAuto, transform: `translateY(${(1 - notAuto) * 20}px)` })}>
        <Chip size={34} bg="#FFFFFF" color={C.navy} style={{ border: `4px solid ${C.navy}` }}>
          <IconBellOff s={40} />
          {t.notAuto}
        </Chip>
      </div>
    </>
  );
};

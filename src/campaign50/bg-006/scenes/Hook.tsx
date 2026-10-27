// Сцена 1 (0–6,5 с), субъективная камера: мы — мама у экрана. Слайд
// раскрывается, лазерная точка идёт по пунктам: «Демек, биздин негизги
// чечим...». Телефон в левой руке вздрагивает — напоминание «14:30 —
// сабак бүтөт». Точка замирает; стоп-кадр, цвет уходит, кольцо на
// напоминании, звук затихает.
import { useCurrentFrame } from "remotion";
import { COLORS } from "../../../config";
import { Freeze, frozenAt } from "../freeze";
import { LOOKS } from "../rig/looks";
import { easeInOut, easeOut, keys } from "../rig/motion";
import { B6_TEXT } from "../script";
import { HoldBack, HoldFront, PhoneFrame, ReminderScreen, Slide } from "../screens";
import { box } from "../shots";

export const HOOK = { buzz: 92, freeze: 128, end: 195 };

const SLIDE = { x: 40, y: 250, w: 1000 };

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const ff = frozenAt(f, HOOK.freeze, HOOK.end);
  const mom = LOOKS.mom;
  // лазерная точка (координаты слайда 1600×900): заголовок → пункты → стоп
  const dx = keys(ff, [[8, 160], [36, 640], [50, 160], [70, 560], [90, 600], [96, 610]]);
  const dy = keys(ff, [[8, 260], [36, 260], [50, 400], [70, 400], [90, 510], [96, 512]]);
  const dotOn = keys(ff, [[4, 0], [10, 1]]);
  // рука с телефоном поднимается в кадр после вибрации
  const lift = easeInOut((ff - HOOK.buzz) / 16);
  const shake = ff >= HOOK.buzz && ff < HOOK.buzz + 20 ? Math.sin(ff * 2.6) * 6 * (1 - (ff - HOOK.buzz) / 20) : 0;
  const phone = { x: 40, y: 2000 - 940 * lift, w: 520 };
  // лёгкое «дыхание» камеры — взгляд от первого лица
  const camX = Math.sin(ff / 40) * 6;
  const camY = Math.cos(ff / 50) * 5 + 30 * easeInOut((ff - HOOK.buzz) / 20);
  const reveal = easeOut(ff / 22);
  const world = (
    <div style={box({ inset: 0, backgroundColor: "#EEF0F2" })}>
      <div style={box({ left: camX, top: -camY, width: 1080, height: 1920 })}>
        <div style={box({ left: -100, top: 1300, width: 1300, height: 900, backgroundColor: "#DDE3EA" })} />
        <div style={box({ left: SLIDE.x - 26, top: SLIDE.y - 26, width: SLIDE.w + 52, height: (SLIDE.w * 9) / 16 + 52, borderRadius: 18, backgroundColor: "#2A2F3A", boxShadow: "0 30px 60px rgba(30,40,60,0.25)" })} />
        <div style={box({ left: SLIDE.x, top: SLIDE.y, width: SLIDE.w, height: (SLIDE.w * 9) / 16, overflow: "hidden" })}>
          <Slide w={SLIDE.w} s={{ reveal, dot: { x: dx, y: dy, on: dotOn } }} />
        </div>
        {/* край стола и головы коллег снизу (размыто) */}
        <div style={box({ left: -60, top: 1190, width: 1200, height: 60, borderRadius: 20, backgroundColor: "#F7F4EE", boxShadow: "0 10px 20px rgba(40,50,70,0.15)" })} />
        {[{ x: 150, c: LOOKS.colleagueB.hair }, { x: 520, c: LOOKS.colleague.hair }, { x: 890, c: LOOKS.colleagueC.hair }].map((h) => (
          <div key={h.x} style={box({ left: h.x - 120, top: 1060, width: 240, height: 200, borderRadius: "120px 120px 40px 40px", backgroundColor: h.c, filter: "blur(4px)", opacity: 0.9 })} />
        ))}
      </div>
      {/* правая рука с кликером */}
      <div style={box({ left: 760 + camX * 1.4, top: 1420 - camY * 1.2, width: 170, height: 620, borderRadius: 85, backgroundColor: mom.topColor, rotate: "-16deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: 770 + camX * 1.4, top: 1330 - camY * 1.2, width: 130, height: 150, borderRadius: 56, backgroundColor: mom.skin, rotate: "-12deg" })} />
      <div style={box({ left: 800 + camX * 1.4, top: 1260 - camY * 1.2, width: 54, height: 120, borderRadius: 14, backgroundColor: "#2A2F3A", rotate: "-12deg" })} />
      {/* левая рука с телефоном */}
      <HoldBack x={phone.x} y={phone.y} w={phone.w} sleeve={mom.topColor} skin={mom.skin} />
      <PhoneFrame x={phone.x} y={phone.y} w={phone.w} tilt={-4} shake={shake}>
        <ReminderScreen f={ff} at={HOOK.buzz + 2} />
      </PhoneFrame>
      <HoldFront x={phone.x} y={phone.y} w={phone.w} skin={mom.skin} />
    </div>
  );
  return (
    <Freeze f={f} from={HOOK.freeze} to={HOOK.end} ring={{ x: phone.x + phone.w / 2, y: phone.y + 420, r: 290 }} label={B6_TEXT.freeze1} labelY={230}>
      {world}
      {/* мигающая полоска «уведомление» у края кадра до стоп-кадра */}
      {f >= HOOK.buzz && f < HOOK.freeze ? <div style={box({ left: 0, top: 0, width: 1080, height: 14, backgroundColor: COLORS.yellow, opacity: 0.5 + 0.5 * Math.sin(f / 3) })} /> : null}
    </Freeze>
  );
};

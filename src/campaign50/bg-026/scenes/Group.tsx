// Сцена 3 (условный пример): мотивированный стык — телефон со стола
// становится крупным планом WhatsApp-группы каттама. Сначала группа
// создаётся (системная строка, участники: водитель и ата-энелер). Затем
// врезка: белая машина стоит во дворе у бордюра (знак P), водитель сам
// набирает «Жолго чыктым» и нажимает «отправить»; позже ребёнок сзади
// пристёгнут — «Бала унаада». Сообщения появляются в чате отца.
// «Шарттуу мисал» виден всю сцену.
import { interpolate, useCurrentFrame } from "remotion";
import { appear, easeInOut } from "../anim";
import { useWordStarting } from "../context";
import { abs, Bubble, DeskTop, Notebook, Plant, SystemNote } from "../parts";
import { BG26_TEXT } from "../script";
import { DriverVignette } from "../sets";
import { CHAT_Y, ChatPhone, Members, SCREEN_W, VIGNETTE_H } from "./chat";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Ключевые моменты сцены (кадры сцены) — общие для звука и картинки.
export const groupBeats = (made: number, s2: number) => {
  const typeA = s2 + 6;
  const sendA = typeA + 34;
  const kidIn = sendA + 18;
  const typeB = kidIn + 20;
  const sendB = typeB + 30;
  return { made, typeA, sendA, kidIn, typeB, sendB };
};

export const GroupScene: React.FC = () => {
  const f = useCurrentFrame();
  const made = useWordStarting("n03", "ата-энелер");
  const s2 = useWordStarting("n03", "айдоочу");
  const b = groupBeats(made, s2);
  const t = BG26_TEXT.chat;
  const [mOut, mIn] = t.messages;

  // стык (match-cut): телефон со стола того же размера и в том же месте
  // становится крупным планом чата; белый экран сайта растворяется в чат
  const grow = easeInOut(f / 18);
  const match = 0.886 + 0.114 * grow;
  const cover = 1 - appear(f, 4, 10);
  // пока группа создаётся — мягкий наезд на верх чата, к появлению водителя — отъезд
  const vigAt = Math.min(s2 - 10, 100);
  const push = easeInOut((f - 18) / 40) * (1 - easeInOut((f - (vigAt - 22)) / 22));
  const vigIn = easeInOut((f - vigAt) / 14);
  const typingA = interpolate(f, [b.typeA, b.sendA - 6], [0, 1], CL);
  const typingB = interpolate(f, [b.typeB, b.sendB - 6], [0, 1], CL);
  const textB = f >= b.sendA + 10;
  const sent = textB ? interpolate(f, [b.sendB, b.sendB + 10], [0, 1], CL) : interpolate(f, [b.sendA, b.sendA + 10], [0, 1], CL);
  const msgA = appear(f, b.sendA + 6, 8);
  const msgB = appear(f, b.sendB + 6, 8);
  const flashA = interpolate(f, [b.sendA + 6, b.sendA + 14, b.sendA + 40], [0, 1, 0], CL);
  const flashB = interpolate(f, [b.sendB + 6, b.sendB + 14, b.sendB + 40], [0, 1, 0], CL);
  const clock = f < b.sendB ? "07:52" : "08:01";

  return (
    <>
      {/* тот же стол под телефоном; предметы из прошлой сцены уходят */}
      <DeskTop light={0.3}>
        {grow < 1 ? (
          <div style={abs({ inset: 0, opacity: 1 - grow })}>
            <Plant x={960} y={420} s={0.95} />
            <Notebook x={-70} y={1240} rot={-10} />
          </div>
        ) : null}
      </DeskTop>
      <div style={abs({ inset: 0, transform: `scale(${1 + 0.12 * push})`, transformOrigin: "540px 560px" })}>
      <div style={abs({ inset: 0, transform: `scale(${match})`, transformOrigin: "540px 1618px" })}>
        <ChatPhone clock={clock} cover={cover}>
          <div style={abs({ left: 0, width: SCREEN_W, top: CHAT_Y.sys, opacity: appear(f, 10, 10), display: "flex", flexDirection: "column", gap: 6 })}>
            <SystemNote text={t.firstDay} scale={1.0} />
            <SystemNote text={t.created} scale={0.95} />
          </div>
          <div style={abs({ left: 0, width: SCREEN_W, top: CHAT_Y.members })}>
            <Members p={interpolate(f, [Math.min(made, s2 - 40) - 4, Math.min(made, s2 - 40) + 30], [0, 1], CL)} />
          </div>
          {/* врезка: водитель стоит на месте и пишет сам */}
          <div style={abs({ left: 22, top: CHAT_Y.vignette, opacity: vigIn, transform: `translateX(${(1 - vigIn) * 260}px)` })}>
            <DriverVignette
              w={SCREEN_W - 44}
              h={VIGNETTE_H}
              f={f}
              text={textB ? mIn.text : mOut.text}
              typing={textB ? typingB : typingA}
              sent={sent}
              kid={appear(f, b.kidIn, 14)}
              label={t.selfNote}
              parkedLabel={t.parked}
            />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.msg1, opacity: msgA, transform: `translateY(${(1 - msgA) * 24}px)` })}>
            <Bubble name={t.driver} text={mOut.text} time={mOut.time} scale={1.05} highlight={flashA} />
          </div>
          <div style={abs({ left: 22, right: 22, top: CHAT_Y.msg2, opacity: msgB, transform: `translateY(${(1 - msgB) * 24}px)` })}>
            <Bubble name={t.driver} text={mIn.text} time={mIn.time} scale={1.05} highlight={flashB} />
          </div>
        </ChatPhone>
      </div>
      </div>
    </>
  );
};

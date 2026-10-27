// Сцена 3 (≈21–35 с): возвращение. Часы быстро переходят с 12:06 на 13:10,
// папа входит с ключами, кладёт их на стол, садится и открывает ноутбук.
// Крупно экран: нить мысли лежит обрывками, код расплывается («сброс
// контекста»), папа листает файл вверх-вниз, пытаясь вспомнить начало;
// в конце строки появляется комментарий «...эмне кылмак элем?».
// На словах «Бул бир эле жолу эмес, кайра кайталанат» обрывки почти
// собираются — снова уведомление — снова рвутся; окно отъезжает, за ним
// стопка таких же окон-повторов (сюрреалистическая петля).
import { useCurrentFrame } from "remotion";
import { Caret, CodeView, EditorWindow, lineY, MONO, scattered, Thread, Toast } from "../editor";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { BG10_TEXT } from "../script";
import { CarKeys } from "../sets/Apartment";
import { Chair, Desk, Laptop, OFFICE, OfficeBack, ScreenGlow } from "../sets/Office";
import { camMove, Shot } from "../shots";
import { FloatingThread } from "./Call";
import { DAD_SEAT, ScreenCam, seated, useWordFrame } from "./common";

export const BACK = { enter: 18, arrive: 76, keys: 84, sit: 88, lid: 104, screen: 120 };
export const LOOP = { len: 24, n: 3 };

export const BackScene: React.FC = () => {
  const f = useCurrentFrame();
  const wB = Math.max(useWordFrame("n02", 9) - 4, BACK.screen + 40); // «Бул бир эле жолу эмес…»
  const P = (t: number): Place => ({ ...DAD_SEAT, x: lerp(1900, DAD_SEAT.x, cruise((t - BACK.enter) / (BACK.arrive - BACK.enter), 0.3)) });
  const lidOpenK = easeInOut((f - BACK.lid) / 14);
  const dadPose = (t: number): PoseIn => {
    const s = seated(t);
    const sit = keys(t, [[BACK.sit, 0], [BACK.sit + 18, 1]]);
    const keysHand = keysV(t, [
      [BACK.enter, { x: P(t).x + 110, y: 1180 }],
      [BACK.arrive - 6, { x: P(t).x + 110, y: 1180 }],
      [BACK.keys, { x: 1420, y: 1270 }],
      [BACK.keys + 12, { x: 1300, y: 1200 }],
      [BACK.lid - 6, { x: OFFICE.laptop.x + 40, y: OFFICE.laptop.y - 20 }],
      [BACK.lid + 12, { x: OFFICE.laptop.x + 40, y: OFFICE.laptop.y - 20 - OFFICE.laptop.h }],
      [BACK.lid + 26, s.armR!.target!],
    ]);
    return {
      ...s,
      sit,
      expr: t < BACK.lid ? "tired" : "thinking",
      lean: keys(t, [[BACK.sit, 0], [BACK.sit + 18, 8]]),
      lookY: keys(t, [[0, 0.1], [BACK.arrive, 0.1], [BACK.keys, 0.6], [BACK.lid + 10, 0.5]]),
      exhale: keys(t, [[BACK.sit + 10, 0], [BACK.sit + 24, 0.8], [BACK.lid + 20, 0.3]]),
      armR: t < BACK.lid + 26 ? { target: keysHand, shape: t < BACK.keys + 2 ? "fist" : "open", item: t < BACK.keys + 2 ? "keys" : "none", elbow: "down" } : s.armR!,
      armL: t < BACK.sit + 10 ? { target: null, shape: "relax" } : s.armL!,
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.8], [BACK.arrive - 10, -0.8], [BACK.arrive + 6, 0]]);
  const minutes = 12 * 60 + 6 + 64 * easeInOut(f / 26);
  const world = (
    <>
      <OfficeBack minutes={minutes} light={easeInOut(f / 26)} />
      <Chair x={OFFICE.chair.x} />
      <ScreenGlow x={OFFICE.dadX} y={920} a={lidOpenK} />
      <Actor uid="s3-dad" look="dad" f={f} place={P} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={BACK.enter - 2} />
      <Desk />
      <Laptop open={lidOpenK} />
      {f >= BACK.keys + 2 ? <CarKeys x={1420} y={1262} /> : null}
      <FloatingThread f={f} o={0.8 * lidOpenK} scatter={1} />
    </>
  );

  // ---- экран: обрывки, прокрутка, петля повторов ----
  const g = f - BACK.screen;
  const cyc = Math.floor((f - wB) / LOOP.len);
  const inLoop = f >= wB && cyc < LOOP.n;
  const lt = (f - wB) % LOOP.len;
  // сборка (0 → почти вместе) и новый обрыв
  let scatter = 1;
  if (inLoop) scatter = lt < 12 ? lerp(1, 0.12, easeInOut(lt / 12)) : lerp(0.12, 1, easeOut((lt - 14) / 6));
  const glitch = inLoop && lt >= 14 ? clamp(1 - (lt - 14) / 7) : 0;
  const toastK = inLoop ? easeOut((lt - 6) / 5) * (1 - easeOut((lt - 20) / 4)) : 0;
  const ghosts = clamp((f - wB) / (LOOP.len * LOOP.n));
  const scroll = keys(g, [[0, 0], [24, -260], [46, -90], [70, -330], [96, 0], [110, -120], [130, 0]]);
  const fade = keys(g, [[0, 0.75], [40, 0.45], [100, 0.3]]);
  const lost = BG10_TEXT.editor.lost;
  const typed = Math.round(lost.length * clamp((g - 70) / 40));
  const pull = easeInOut((f - wB) / 30);
  const win = { scale: lerp(1, 0.8, pull), y: lerp(0, 120, pull) };
  return (
    <>
      <Shot f={f} from={0} to={BACK.screen} cam={camMove(f, 0, BACK.screen, { x: 1220, y: 1060, zoom: 0.92 }, { x: 1110, y: 1020, zoom: 1.12 })}>
        {world}
      </Shot>
      {f >= BACK.screen ? (
        <ScreenCam cx={540} cy={lerp(900, 860, pull)} z={lerp(1.08, 1, easeInOut(g / 60))} shake={glitch * Math.sin(f * 2.3) * 8}>
          {/* петля: стопка окон-повторов за основным окном */}
          {[3, 2, 1].map((k) => {
            const a = clamp(ghosts * 3 - (k - 1));
            return a > 0 ? (
              <EditorWindow key={k} tabs={BG10_TEXT.editor.tabs} active={0} scale={win.scale * (1 - 0.07 * k)} y={win.y - 150 * k * a} opacity={0.5 * a}>
                <CodeView fade={0.5} seed={k} />
                <Thread pieces={scattered(1, f + k * 20, { seed: k * 3, o: 0.7 })} glow={0} />
              </EditorWindow>
            ) : null;
          })}
          <EditorWindow tabs={BG10_TEXT.editor.tabs} active={0} scale={win.scale} y={win.y}>
            <CodeView scroll={scroll} fade={fade} glitch={glitch} seed={cyc + 2} />
            {typed > 0 ? (
              <div style={{ position: "absolute", left: 150, top: lineY(11) + scroll - 38, fontFamily: MONO, fontSize: 36, color: "#8A93A8", whiteSpace: "pre" }}>
                {lost.slice(0, typed)}
              </div>
            ) : null}
            <Caret x={typed > 0 ? 150 + typed * 21.7 : 150} y={(typed > 0 ? lineY(11) : lineY(0)) + scroll} f={f} />
            <Thread pieces={scattered(scatter, f)} />
          </EditorWindow>
        </ScreenCam>
      ) : null}
      {f >= BACK.screen ? <Toast k={toastK} pulse={toastK} /> : null}
      {/* лёгкий «перемотанный» отблеск при каждом обрыве */}
      {glitch > 0 ? <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFC727", opacity: 0.06 * glitch }} /> : null}
    </>
  );
};

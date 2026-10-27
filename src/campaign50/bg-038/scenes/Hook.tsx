// Сцена 1 (хук, ≈ 6 с): крупно — школьный рюкзак висит на спинке стула.
// Камера отъезжает: мягкий утренний свет, мама с телефоном, в черновике
// «Бүгүн бара албайт». Мама смотрит на рюкзак:
// «Балам ооруп, мектепке барбай калсачы?» Заголовок «БАЛА ООРУП
// КАЛСАЧЫ?» падает по словам. В конце камера ныряет в телефон (переход).
// Никто не лежит в больнице и никуда не едет больным.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { anticipate, clamp, easeIn, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import type { PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { box, useLine, useSceneFrames, World, type Cam } from "../context";
import { BG38_TEXT } from "../script";
import { ExampleTag, NAVY, YELLOW } from "../sets";
import { at, HomeWorld, MOM_HOOK, phoneInHands } from "./home";

const CAM_PACK: Cam = { x: 700, y: 1215, zoom: 1.9 };
const CAM_WIDE: Cam = { x: 830, y: 1150, zoom: 1.2 };
// точка «ныряния» в телефон в конце сцены
export const PHONE_POINT = at(MOM_HOOK, 0.06, -0.71);

const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) });

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const total = useSceneFrames("hook");
  const m1 = useLine("m1");
  const dive = total - 12; // начало «ныряния» в телефон

  // камера: рюкзак крупно → общий план → медленный наезд → в телефон
  const pull = easeInOut((f - 6) / 34);
  let cam = mixCam(CAM_PACK, CAM_WIDE, pull);
  cam = { ...cam, zoom: cam.zoom + 0.06 * easeInOut((f - 40) / Math.max(1, dive - 40)) };
  const d = easeIn((f - dive) / 12);
  cam = mixCam(cam, { x: PHONE_POINT.x, y: PHONE_POINT.y, zoom: 4.2 }, d);

  const momFace = (t: number) => keys(t, [[m1.from - 10, 0.2], [m1.from, -0.55], [m1.to + 4, -0.55], [m1.to + 16, 0.1]]);
  const momPose = (t: number): PoseIn => ({
    expr: t < m1.from - 6 ? "thinking" : t < m1.to + 8 ? "worried" : "thinking",
    lookY: keys(t, [[m1.from - 10, 0.55], [m1.from, 0.12], [m1.to + 4, 0.12], [m1.to + 16, 0.55]]),
    nod: keys(t, [[m1.from - 10, 6], [m1.from, 0], [m1.to + 4, 0], [m1.to + 16, 5]]),
    headTilt: keys(t, [[m1.from, 0], [m1.from + 14, -4]]),
    ...phoneInHands(MOM_HOOK, keys(t, [[m1.from - 6, 0], [m1.from + 6, 0.05], [m1.to + 6, 0.05], [m1.to + 16, 0]], anticipate)),
    shoulders: keys(t, [[m1.from, 0], [m1.from + 10, 0.3], [m1.to, 0.3], [m1.to + 12, 0]]),
  });

  // черновик сообщения рядом с телефоном
  const draftA = easeOut((f - 14) / 10) * (1 - easeIn((f - dive) / 8));
  const cursor = Math.floor(f / 15) % 2 === 0;

  // заголовок по словам
  const words = BG38_TEXT.title.split(" ");
  const titleOut = 1 - easeIn((f - dive + 2) / 8);
  // условный пример: метка видна весь план (и при «нырянии» в телефон)
  const tag = 1;
  return (
    <>
      <World cam={cam} bg="#EFE3D0" filter={d > 0.05 ? `blur(${(d * 6).toFixed(1)}px)` : undefined}>
        <HomeWorld f={f} uid="h1" momPlace={() => MOM_HOOK} momPose={momPose} momFace={momFace} />
        {/* черновик в мире, рядом с телефоном */}
        {draftA > 0.01 ? (
          <div
            style={box({
              left: 610,
              top: 900,
              width: 300,
              padding: "14px 18px 16px",
              borderRadius: "22px 22px 6px 22px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 10px 24px rgba(20,40,90,0.18)",
              fontFamily,
              opacity: draftA,
              scale: `${0.85 + 0.15 * draftA}`,
              transformOrigin: "100% 100%",
            })}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: "#3FA36A" }}>{BG38_TEXT.chat.contact}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: NAVY, lineHeight: 1.15 }}>
              {BG38_TEXT.draft}
              <span style={{ opacity: cursor ? 1 : 0, color: "#3FA36A" }}>|</span>
            </div>
          </div>
        ) : null}
      </World>
      {/* заголовок */}
      <div style={box({ left: 90, right: 150, top: 318, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 22px", fontFamily, opacity: titleOut })}>
        {words.map((w, i) => {
          const a = easeOut((f - 8 - i * 5) / 9);
          const hot = w.startsWith("ООРУП");
          return (
            <span
              key={i}
              style={{
                position: "relative",
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1.05,
                color: NAVY,
                WebkitTextStroke: "10px #FFFFFF",
                paintOrder: "stroke fill",
                textShadow: "0 8px 22px rgba(20,40,90,0.22)",
                opacity: a,
                translate: `0 ${(1 - a) * -40}px`,
                scale: `${1 + 0.12 * (1 - a)}`,
              }}
            >
              {hot ? (
                <span style={box({ left: -6, right: -6, bottom: 6, height: 30, borderRadius: 10, backgroundColor: YELLOW, zIndex: -1, scale: `${clamp((f - 24) / 8)} 1`, transformOrigin: "0 50%" })} />
              ) : null}
              {w}
            </span>
          );
        })}
      </div>
      <ExampleTag a={tag} />
    </>
  );
};

// BalaGoBG041 — BG-041 «Аягынан баштайлы» (BalaGo-50, выпуск №41).
// 1080×1920, 30 fps; длительность — по фактической озвучке (timing.ts).
// Обратная хронология: каждая сцена — шаг назад во времени.
//   1. evening  — аягы: спокойный вечер семьи → вопрос → ◀◀ перемотка
//   2. route    — кийин: уюшулган каттам (день перематывается: үй ← мектеп ← үй)
//   3. decision — чечим сыноодон кийин (галочка «Улантабыз» стирается назад)
//   4. group    — алгач топ изделет; кепилдик жок
//   5. start    — башы: апа өзү маалымат киргизип, өзү жөнөтөт (▶), цепочка вперёд
//   6. cta      — телефон поворачивается → финал: Бишкек + оба контакта
// Склейки по совпадающему предмету: каждая сцена в конце «въезжает» в
// предмет (рюкзак → папка → карточка → карта → поле → телефон), следующая
// начинается с того же предмета; между ними — короткое растворение.
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeInOut, prog } from "./art";
import { Bg41Audio } from "./Bg41Audio";
import { DISSOLVE, hudAt, SCENES } from "./edit";
import { FPS } from "./kit";
import { BG41_VIDEO } from "./script";
import { Subtitles } from "./Subtitles";
import { Hud, RewFx } from "./tape";
import { buildBg41Timeline, sceneOf, type Bg41Manifest } from "./timing";

export type BalaGoBG041Props = { readonly manifest: Bg41Manifest };

export const BalaGoBG041: React.FC<BalaGoBG041Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildBg41Timeline(manifest), [manifest]);
  const t = frame / BG41_VIDEO.fps;
  const { s: hud, rew } = hudAt(tl, t);
  const cta = sceneOf(tl, "cta");
  // позднее сцены рисуются раньше (ниже), уходящая — поверх
  const order = [...tl.scenes].reverse();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily }}>
      {order.map((sc) => {
        const isLast = sc.id === "cta";
        const end = isLast ? sc.to : sc.to + DISSOLVE;
        if (t < sc.from || t >= end) return null;
        const Scene = SCENES[sc.id].C;
        if (t < sc.to) return <Scene key={sc.id} t={t} tl={tl} />;
        const u = easeInOut(prog(t, sc.to, DISSOLVE));
        return (
          <div key={sc.id} style={{ position: "absolute", inset: 0, opacity: 1 - u }}>
            <Scene t={sc.to - 1 / FPS} tl={tl} />
          </div>
        );
      })}
      <RewFx f={frame} k={rew} />
      {hud && t < cta.to ? <Hud s={hud} f={frame} /> : null}
      <Subtitles t={t} cues={tl.cues} />
      <Bg41Audio tl={tl} />
    </AbsoluteFill>
  );
};

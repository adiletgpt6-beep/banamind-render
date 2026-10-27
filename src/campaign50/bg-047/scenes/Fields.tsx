// Сцена 2: «Картадагы бир белги эле жетишсиз. Баланын үйү, мектеби жана
// сабак убактысы так көрсөтүлүшү керек.» Камера мягко опускается над
// картой. Точка переворачивает лист бумаги — на нём три пустых поля.
// Только руки мамы придают точке смысл: левая кладёт на карту наклейку
// дома (дом раскрывается), правая карандашом отмечает школу и пишет
// время «08:00 – 13:00». По улицам прорисовывается маршрут, вокруг точки —
// светящееся кольцо. Никаких автоматически подставленных адресов.
import { useCurrentFrame } from "remotion";
import { useSceneFrames, useSpeech, useTimeline } from "../context";
import { fieldsBeats } from "../beats";
import { BG47_TEXT } from "../script";
import { Dot } from "../art/Dot";
import { CARD_H, CARD_W, FieldsCard } from "../art/FieldsCard";
import { Hand } from "../art/Hand";
import { SPOT } from "../art/MapSheet";
import { blink, clamp, easeIn, easeInOut, easeOut, keyed, lerp, prog, springy } from "../art/motion";
import { HeroPlaces, Sticker } from "../art/places";
import { Chip, ExampleTag } from "../art/ui";
import { lerpCam, project, projectBillboard, type Cam } from "../art/Stage";
import { World } from "../art/World";
import { DotOnMap, HOOK_CAM_END, HOOK_DOT_END } from "./Hook";

export const FIELDS_CAM: Cam = { cx: 470, cy: 800, zoom: 1.3, tilt: 38, sy: 930 };
// К концу сцены камера медленно приближается к точке со смыслом.
export const FIELDS_END_CAM: Cam = { cx: 500, cy: 820, zoom: 1.46, tilt: 40, sy: 940 };
export const CARD_POS = { x: 130, y: 1186 } as const;

// Тайминги сцены по словам реплики n1 (для звука и следующей сцены).

// Рука движется от края кадра к цели и обратно: 0 — за кадром, 1 — у цели.
const reach = (f: number, inAt: number, holdTo: number, d = 14) => easeInOut(prog(f, inAt - d, d)) * (1 - easeInOut(prog(f, holdTo, d)));

export const FieldsScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = fieldsBeats(useTimeline());
  const speech = useSpeech("dot", f);
  const len = useSceneFrames("fields");
  const cam = lerpCam(lerpCam(HOOK_CAM_END, FIELDS_CAM, easeInOut(f / 40)), FIELDS_END_CAM, easeInOut(prog(f, b.glow, Math.max(20, len - b.glow))));

  const home = springy(prog(f, b.home, 16));
  const school = springy(prog(f, b.school + 2, 16));
  const timeP = easeInOut(prog(f, b.write, b.writeEnd - b.write));
  const route = easeInOut(prog(f, b.route, 22));
  const glow = easeOut(prog(f, b.glow, 12));

  // карточка: лежит у ног точки, точка её переворачивает, карточка уезжает вниз
  const dotScr = project(cam, HOOK_DOT_END.x, HOOK_DOT_END.y);
  const flip = easeInOut(prog(f, b.flip, 14));
  const fly = easeInOut(prog(f, b.flip + 16, 18));
  const startX = dotScr.x + 130;
  const startY = dotScr.y + 14;
  const cardScale = lerp(0.26, 1, fly);
  const cardCx = lerp(startX, CARD_POS.x + CARD_W / 2, fly);
  const cardCy = lerp(startY, CARD_POS.y + CARD_H / 2, fly);
  const cardIn = easeOut(prog(f, 4, 8));

  // точка: смотрит на лист, тянется к нему, пожимает плечами на «жетишсиз»
  const shrug = easeInOut(prog(f, b.shrug - 4, 8)) * (1 - easeInOut(prog(f, b.home - 6, 10)));
  const reachCard = easeInOut(prog(f, b.flip - 6, 8)) * (1 - easeInOut(prog(f, b.flip + 16, 8)));
  const look =
    f < b.flip + 30
      ? { x: keyed(f, [[0, 0], [10, 0.9]]), y: keyed(f, [[0, 0.1], [10, 0.6]]) }
      : f < b.home + 10
        ? { x: 0, y: 0.2 }
        : { x: keyed(f, [[b.home + 10, -0.9], [b.school, -0.9], [b.school + 8, 0.6], [b.write, 0.6], [b.write + 8, 0.3], [b.route + 10, 0]]), y: keyed(f, [[b.school, 0.3], [b.school + 8, -0.8], [b.write, -0.8], [b.write + 8, 0.9], [b.route + 10, 0]]) };
  // радостный подскок на «керек», потом спокойное «дыхание»
  const hopUp =
    glow > 0
      ? Math.max(0, Math.sin(Math.PI * prog(f, b.glow, 14))) * 40 + Math.max(0, Math.sin((f - b.glow - 14) / 9)) * 10 * prog(f, b.glow + 14, 10) * (1 - prog(f, len - 14, 12))
      : 0;

  // руки
  const homeScr = project(cam, SPOT.home.x, SPOT.home.y);
  const schoolScr = project(cam, SPOT.school.x, SPOT.school.y);
  const lh = reach(f, b.home, b.home + 12, 14);
  const writeX = CARD_POS.x + CARD_W - 290 + 230 * timeP;
  const writeY = CARD_POS.y + CARD_H - 54 + Math.sin(f * 1.9) * 4 * (timeP > 0 && timeP < 1 ? 1 : 0);
  // правая рука: одна непрерывная траектория — к школе, к полю времени, прочь
  const rVis = easeInOut(prog(f, b.school - 12, 12)) * (1 - easeInOut(prog(f, b.writeEnd + 6, 16)));
  const toWrite = easeInOut(prog(f, b.school + 6, Math.max(8, b.write - b.school - 6)));
  const rx = lerp(schoolScr.x - 30, writeX, toWrite);
  const ry = lerp(schoolScr.y - 30, writeY, toWrite);
  const rOff = 1 - rVis;

  return (
    <>
      <World cam={cam} label={0} hole={1 - easeOut(prog(f, 20, 20))}>
        <HeroPlaces home={home} school={school} route={route} flag={f / 6} angle={70} />
        <DotOnMap x={HOOK_DOT_END.x} y={HOOK_DOT_END.y} angle={cam.tilt} lift={hopUp}>
          <Dot
            look={look}
            blink={blink(f, 2)}
            mouth={clamp(speech * 1.35)}
            mood={shrug > 0.3 ? "thoughtful" : glow > 0.2 ? "happy" : "curious"}
            armL={lerp(lerp(24, 115, shrug), 150, glow * (1 - prog(f, b.glow + 20, 10)))}
            armR={Math.max(lerp(lerp(24, 115, shrug), 70, reachCard), lerp(24, 150, glow * (1 - prog(f, b.glow + 20, 10))))}
            glow={glow}
          />
        </DotOnMap>
      </World>

      {/* три поля на листе */}
      <div
        style={{
          position: "absolute",
          left: cardCx - CARD_W / 2,
          top: cardCy - CARD_H / 2,
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${cardScale}) rotate(${lerp(-8, 0, fly)}deg) rotateY(${lerp(180, 0, flip)}deg)`,
          transformOrigin: "50% 50%",
          opacity: cardIn,
        }}
      >
        <FieldsCard home={clamp((f - b.home - 2) / 10)} school={clamp((f - b.school - 4) / 10)} time={timeP} back={flip < 0.5} />
      </div>

      {/* левая рука: наклейка дома */}
      {lh > 0 ? (
        <Hand
          x={lerp(-260, homeScr.x - 4, lh)}
          y={lerp(2100, homeScr.y - 46, lh)}
          angle={26}
          flip
          pose="pinch"
          scale={0.92}
          holding={f < b.home ? <Sticker kind="home" size={110} /> : null}
        />
      ) : null}
      {/* правая рука: карандашом отмечает школу, затем пишет время */}
      {rVis > 0 ? (
        <Hand
          x={lerp(rx, 1300, rOff)}
          y={lerp(ry, 2100, rOff)}
          angle={lerp(-30, -22, toWrite)}
          pose="pencil"
          scale={0.9}
        />
      ) : null}
      {/* отметка карандаша на школе */}
      {f >= b.school && f < b.school + 14 ? (
        <div
          style={{
            position: "absolute",
            left: schoolScr.x - 40,
            top: schoolScr.y - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            border: `5px solid #FFC90E`,
            transform: `scale(${0.4 + 1.2 * easeOut(prog(f, b.school, 14))})`,
            opacity: 1 - easeIn(prog(f, b.school, 14)),
          }}
        />
      ) : null}

      <ExampleTag text={BG47_TEXT.example} />
      <Chip f={f} at={b.n1.to - 6} out={len - 8} y={334} center size={44} bg="#FFF4C2">
        {BG47_TEXT.fields.title}
      </Chip>
      {/* табличка над точкой: «смысл» точки */}
      {glow > 0 ? <DotBadge cam={cam} p={glow} f={f} /> : null}
    </>
  );
};

// Маленькая табличка над точкой: дом • школа • время.
export const DotBadge: React.FC<{ readonly cam: Cam; readonly p: number; readonly f: number }> = ({ cam, p }) => {
  const top = projectBillboard(cam, HOOK_DOT_END.x, HOOK_DOT_END.y, 230);
  const s = springy(p);
  return (
    <div
      style={{
        position: "absolute",
        left: top.x - 120,
        top: top.y - 74,
        width: 240,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
        border: "4px solid #14285A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        transform: `scale(${s})`,
        boxShadow: "0 8px 16px rgba(20,40,90,0.2)",
      }}
    >
      {(["home", "school", "time"] as const).map((k) => (
        <svg key={k} width={44} height={44} viewBox="0 0 64 64">
          {k === "home" ? (
            <path d="M8 30 L32 10 L56 30 L50 30 L50 56 L14 56 L14 30 Z" fill="#FFC90E" stroke="#14285A" strokeWidth={5} strokeLinejoin="round" />
          ) : k === "school" ? (
            <path d="M6 28 L32 14 L58 28 L58 56 L6 56 Z" fill="#FFFFFF" stroke="#14285A" strokeWidth={5} strokeLinejoin="round" />
          ) : (
            <g>
              <circle cx={32} cy={33} r={23} fill="#FFFFFF" stroke="#14285A" strokeWidth={5} />
              <path d="M32 19 L32 33 L42 39" fill="none" stroke="#14285A" strokeWidth={5} strokeLinecap="round" />
            </g>
          )}
        </svg>
      ))}
    </div>
  );
};

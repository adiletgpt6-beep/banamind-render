// Сцена 4 — «Маалымат → топ издөө». Мама сама: поиск в телефоне → страница
// BalaGo → поля (адрес, школа, уроки) → «WhatsApp аркылуу жазуу» →
// подготовленное сообщение, мама САМА нажимает «отправить» (одна серая
// галочка — отправлено, не подтверждено). Памятка — отдельная карточка вне
// телефона: «Ылайыктуу топ изделет · Баштапкы издөө — 2 жумага чейин ·
// Топтун табылышы кепил эмес». На «Бул дароо иштей турган баскыч эмес»
// папа с надеждой жмёт картонную «МЕКТЕП» — «пфф», ничего; дочь хохочет.
// Развязка сегодняшней «операции»: папа клеит на холодильник стикер
// «Бүгүн: Ата алып келет», мама показывает большой палец.
import { AbsoluteFill, interpolate } from "remotion";
import { useScene, useViseme } from "../context";
import { fontFamily } from "../fonts";
import { MemoCard, PhoneFlow } from "../inserts/PhoneFlow";
import { NAVY, YELLOW } from "../palette";
import { Puff, Sparkles } from "../props/Fx";
import { BOX, CONSOLE_IDLE } from "../sets/Console";
import { lerpCam, type Cam } from "../shots";
import { B48_TEXT } from "../script";
import { breath, clamp, face, idleTilt, prog, talkNod } from "./common";
import { handKeys, ramp, W, type Pt } from "./acting";
import { Caption } from "./Overlays";
import { MomPhone } from "./Reveal";
import { KitchenWorld, SEATS } from "./World";

const SILENT = { open: 0, round: 0, wide: 0, talking: false };

// Стикер на холодильнике (мировые координаты): развязка сегодняшнего дня.
export const STICKER = { x: 236, y: 1120 } as const;
export const Sticker: React.FC<{ readonly k: number; readonly x?: number; readonly y?: number }> = ({ k, x = STICKER.x, y = STICKER.y }) => {
  if (k <= 0) return null;
  const [l1, l2] = B48_TEXT.sticker.split(": ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${(-6 + 3 * (1 - k)).toFixed(1)}) scale(${(0.6 + 0.4 * k).toFixed(3)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-165} y={-64} width={330} height={128} rx={6} fill="#000000" opacity={0.12} transform="translate(5 6)" />
      <rect x={-165} y={-64} width={330} height={128} rx={6} fill={YELLOW} />
      <rect x={-165} y={-64} width={330} height={22} rx={6} fill="#E8B52A" />
      <text x={0} y={-6} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill={NAVY}>
        {`${l1}:`}
      </text>
      <text x={0} y={40} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={34} fill={NAVY}>
        {l2}
      </text>
    </g>
  );
};

type Span = { readonly from: number; readonly to: number };

// Ключевые моменты сцены — общие для анимации и звука.
export const siteBeats = (n01: Span, n02: Span) => {
  const times = {
    // поиск решения в телефоне до страницы BalaGo
    searchFrom: 0.45,
    searchTo: 1.55,
    tapResult: 2.05,
    fillFrom: n01.from + 0.25,
    fillTo: n01.from + 2.0,
    tapButton: n01.from + 2.35,
    chatOpen: n01.from + 2.65,
    tapSend: n01.to - 0.75,
    sent: n01.to - 0.45,
    exit: n01.to + 0.35,
  };
  const press = n02.from + 0.45;
  const stick0 = n02.to + 0.1;
  // памятка — только когда телефон уже ушёл (не похожа на ответ в чате)
  return { times, memoAt: times.exit + 0.45, press, stick0, stick1: stick0 + 0.8 };
};

export const SiteScene: React.FC = () => {
  const { t, cue, start } = useScene();
  const dadV = useViseme("father");
  const momV = useViseme("mother");
  const n01 = cue("n01");
  const n02 = cue("n02");
  const dadAt = SEATS.dad;
  const momAt = SEATS.mom;
  const girlAt = { x: SEATS.girl.x, y: SEATS.girl.y };

  // ---------- Телефон ----------
  const beats = siteBeats(n01, n02);
  const { times } = beats;
  const phoneOn = t < times.exit + 0.6;
  const memoAt = beats.memoAt;
  const memoOut = ramp(t, n02.to + 0.4, n02.to + 0.8);

  // ---------- Гэг с картонной кнопкой ----------
  const { press, stick0, stick1 } = beats;
  const dud = prog(t, press + 0.05, press + 0.9);

  const restDL = W("dad", dadAt, 1, 430, 1290);
  const restDR = W("dad", dadAt, 1, 610, 1290);
  const mek: Pt = { x: BOX.mektep.x, y: BOX.mektep.y };
  const dadR = handKeys(t, [
    [0, restDR],
    [press - 0.45, restDR],
    [press - 0.15, W("dad", dadAt, 1, mek.x, mek.y - 40), "point"],
    [press, W("dad", dadAt, 1, mek.x, mek.y - 4), "point"],
    [press + 0.25, W("dad", dadAt, 1, mek.x, mek.y - 2), "point"],
    [press + 0.25 + 0.3, W("dad", dadAt, 1, mek.x, mek.y - 30), "point"],
    [press + 0.25 + 0.42, W("dad", dadAt, 1, mek.x, mek.y - 4), "point"],
    [press + 1.1, restDR],
    [stick1 + 0.4, restDR],
    [stick1 + 0.8, { x: 60, y: 60 }, "open"],
  ], { elbowIn: t > press - 0.8 && t < press + 1.4 });
  const dadL = handKeys(t, [
    [0, restDL],
    [stick0 - 0.4, restDL],
    [stick0 - 0.05, W("dad", dadAt, 1, 400, 1180), "hold"],
    [stick1, W("dad", dadAt, 1, STICKER.x + 20, STICKER.y + 10), "flat"],
    [stick1 + 0.45, W("dad", dadAt, 1, STICKER.x + 30, STICKER.y + 20), "flat"],
    [stick1 + 0.9, restDL],
  ]);
  const hope = ramp(t, press - 0.5, press - 0.1) * (1 - ramp(t, press + 0.6, press + 0.9));
  const meh = ramp(t, press + 0.7, press + 1.0) * (1 - ramp(t, stick0 - 0.3, stick0));
  const proud = ramp(t, stick1, stick1 + 0.3);
  const dadTurn = 0.2 * hope + 0.55 * ramp(t, press + 0.9, press + 1.3) * (1 - ramp(t, stick0 - 0.4, stick0 - 0.1)) - 0.6 * ramp(t, stick0 - 0.3, stick0) * (1 - ramp(t, stick1 + 0.5, stick1 + 0.9));
  const dad = {
    look: "dad" as const,
    ...dadAt,
    face: face(t, 1, dadV, {
      turn: dadTurn,
      lookX: dadTurn * 0.8,
      lookY: 0.5 * hope,
      wide: 0.5 * hope,
      raise: 0.4 * hope - 0.2 * meh,
      worry: 0.6 * meh,
      smile: 0.35 + 0.3 * hope - 0.35 * meh + 0.4 * proud,
      blink: 0,
    }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 1),
      tilt: idleTilt(t, 1) + 6 * meh,
      nod: talkNod(dadV, t, 1),
      shrug: 0.8 * meh,
      lean: -3 * ramp(t, stick0 - 0.3, stick0) * (1 - ramp(t, stick1 + 0.4, stick1 + 0.8)),
      l: dadL,
      r: dadR,
    },
  };

  // ---------- Апа: держит телефон, потом смеётся, большой палец ----------
  const hold: Pt = { x: 1085, y: 1185 };
  const phoneDown = ramp(t, times.exit, times.exit + 0.6);
  const ph: Pt = { x: hold.x + (1200 - hold.x) * phoneDown, y: hold.y + (1288 - hold.y) * phoneDown };
  const thumb = ramp(t, stick1 + 0.2, stick1 + 0.5);
  const momLaugh = ramp(t, press + 0.6, press + 0.9) * (1 - ramp(t, press + 2.0, press + 2.4));
  const momR = handKeys(t, [
    [0, W("mom", momAt, 1, ph.x + 36, ph.y + 40), "hold"],
    [times.exit, W("mom", momAt, 1, hold.x + 36, hold.y + 40), "hold"],
    [times.exit + 0.6, W("mom", momAt, 1, 1230, 1288), "hold"],
    [times.exit + 0.9, W("mom", momAt, 1, 1190, 1290)],
    [stick1 + 0.2, W("mom", momAt, 1, 1190, 1290)],
    [stick1 + 0.5, { x: 70, y: 40 }, "point"],
  ]);
  const momL = handKeys(t, [
    [0, W("mom", momAt, 1, ph.x - 36, ph.y + 40), "hold"],
    [times.exit, W("mom", momAt, 1, hold.x - 36, hold.y + 40), "hold"],
    [times.exit + 0.5, W("mom", momAt, 1, 1010, 1290)],
  ]);
  const momTurn = -0.6 * ramp(t, press + 0.4, press + 0.8) * (1 - ramp(t, stick1 + 0.6, stick1 + 1.0));
  const mom = {
    look: "mom" as const,
    ...momAt,
    headset: { paper: 1 },
    face: face(t, 2, momV, {
      turn: momTurn,
      lookX: momTurn * 0.8,
      lookY: 0.55 * (1 - phoneDown),
      smile: 0.45 + 0.3 * momLaugh + 0.3 * thumb,
      laugh: momLaugh,
    }),
    pose: { legs: "none" as const, breathe: breath(t, 2), tilt: idleTilt(t, 2), nod: talkNod(momV, t, 2) + 4 * momLaugh * Math.abs(Math.sin(t * 9)), l: momL, r: momR },
  };

  // ---------- Дочь (в наушниках-стаканчиках) ----------
  const giggle = ramp(t, press + 0.45, press + 0.7) * (1 - ramp(t, press + 2.2, press + 2.6));
  const clap = ramp(t, stick1, stick1 + 0.2);
  const clapX = 18 + 16 * Math.abs(Math.sin((t - stick1) * 12)) * clap;
  const girl = {
    look: "girl" as const,
    ...girlAt,
    headset: { paper: 1 },
    face: face(t, 3, SILENT, { turn: -0.35 * giggle + 0.2 * ramp(t, stick0, stick0 + 0.3), lookX: -0.4 * giggle, smile: 0.7, laugh: giggle }),
    pose: {
      legs: "none" as const,
      breathe: breath(t, 3),
      tilt: idleTilt(t, 3, 2.2) + 5 * giggle * Math.sin(t * 10),
      nod: 3 * giggle * Math.abs(Math.sin(t * 11)),
      l: handKeys(t, [
        [0, { x: -60, y: 80 }],
        [press + 0.4, { x: -60, y: 80 }],
        [press + 0.7, { x: -30, y: 40 }, "open"],
        [press + 2.2, { x: -30, y: 40 }, "open"],
        [stick1, { x: -60, y: 80 }],
        [stick1 + 0.2, { x: -clapX, y: 30 }, "open"],
      ]),
      r: handKeys(t, [
        [0, { x: 60, y: 80 }],
        [stick1, { x: 60, y: 80 }],
        [stick1 + 0.2, { x: clapX, y: 30 }, "open"],
      ]),
    },
  };

  // ---------- Камера ----------
  const ONMOM: Cam = { cx: 1000, cy: 1150, z: 1.1 };
  const GAG: Cam = { cx: 790, cy: 990, z: 0.95 };
  const FRIDGE: Cam = { cx: 470, cy: 1060, z: 1.3 };
  const cam = lerpCam(lerpCam(ONMOM, GAG, ramp(t, times.exit, times.exit + 0.9)), FRIDGE, ramp(t, stick0 - 0.5, stick0 + 0.5));
  const blur = phoneOn ? 9 * (1 - ramp(t, times.exit, times.exit + 0.6)) : 0;

  const phoneK = interpolate(t, [times.exit, times.exit + 0.35], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <KitchenWorld
        w={{
          t: start + t,
          cam,
          blur,
          console: { ...CONSOLE_IDLE, t: start + t, paper: 1, fold: 1, shrink: 1 },
          fantasy: 0,
          dad,
          mom,
          girl,
          cat: { x: 1268, y: 1300, scale: 0.85, pose: "loaf", tail: 0.4 * Math.sin(t * 1.5), blink: 0.55 + 0.45 * ramp(t, press + 0.3, press + 0.6), look: -0.5 },
          box: { appear: 1, pressMektep: interpolate(t, [press - 0.05, press, press + 0.25, press + 0.3, press + 0.67, press + 0.75], [0, 1, 1, 0, 1, 0], clamp) },
          onWall: <Sticker k={ramp(t, stick1 - 0.15, stick1 + 0.1)} />,
          onTable: (
            <>
              <MomPhone x={ph.x} y={ph.y} a={-90 * phoneDown} s={1.2 - 0.3 * phoneDown} lit={1 - phoneDown} />
              <Puff k={dud} x={mek.x} y={mek.y - 40} scale={1.1} />
            </>
          ),
          over: (
            <>
              <Sparkles k={prog(t, stick1, stick1 + 0.8)} x={STICKER.x} y={STICKER.y - 40} scale={1.0} />
            </>
          ),
        }}
      />
      {phoneOn ? (
        <AbsoluteFill style={{ transform: `translateY(${60 + 300 * (1 - phoneK)}px) scale(0.82)`, transformOrigin: "50% 50%", opacity: phoneK }}>
          <PhoneFlow t={t} times={times} />
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - memoOut }}>
        <MemoCard t={t} at={memoAt} x={100} y={340} width={860} />
      </div>
      {/* титр сцены — в паузе между n01 и n02 (субтитров нет) */}
      <Caption t={t} from={memoAt + 0.1} to={n02.to + 0.5} text={B48_TEXT.captions.site} top={262} />
    </AbsoluteFill>
  );
};

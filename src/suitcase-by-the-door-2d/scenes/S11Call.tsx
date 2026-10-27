// S11 · Вечерний видеозвонок маме.
//
// 11A — гостиная, вечер: папа и сын на диване, папа держит телефон перед
//       собой, сын придвигается. Тихий сигнал звонка, экран загорается.
// 11B — средний план: папа спрашивает («Сөз сүйлөгөнүң кандай өттү?»),
//       сын улыбается в экран.
// 11C — телефон крупно в руке папы: мама на видео (номер в гостинице,
//       вечер за окном). На «залдын» она показывает фото зала — оно
//       заполняет экран; на «угармандардын» снова мама, рядом всплывают
//       три спокойных пузырька с вопросительным знаком.
// 11D — сын наклоняется к телефону и спрашивает; вставка: фото зала на
//       экране, палец сына касается сцены у кафедры, мягкое кольцо.
import { useScene, usePlan, Shot, Svg, camKeys, useInk, Ring, fadeIO } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { murmur } from "../context";
import { LIVING, LivingBack, LivingSofa, CoffeeTable, LampGlow, LIVING_TINT } from "../sets/Living";
import { HALL, HallPicture, hallPt } from "../sets/Hall";
import { PhoneFrame, PhoneGrip, phoneGeom, phonePt, PHONE_CASE, SCREEN, type PhonePlace } from "../props/Phone";
import { CloseHand, SKIN } from "../props/CloseHand";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const callPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "call");
  return {
    len: T.len,
    ring: T.from("N10") + 12,
    answer: T.word("N10", "чалышты"),
    mid: T.from("P02") - 8,
    screen: T.to("P02") + 8,
    photo: T.word("N11", "залдын"),
    photoOff: T.word("N11", "угармандардын") + 2,
    talkTo: T.to("N11"),
    son: T.from("C02") - 10,
    point: T.word("C02", "мына") - 4,
    here: T.word("C02", "ушул"),
  };
};
type Plan = ReturnType<typeof callPlan>;

// ---------- 11A, 11B, 11D-1: диван ----------
const D = { x: 600, y: LIVING.feetY, h: H.dad };
// сын на диване: ноги не достают до пола (стопы чуть выше)
const SON_FEET = LIVING.feetY - 52;
const SON_SEAT = { seat: SON_FEET - (LIVING.feetY - LIVING.seat), y: SON_FEET };
const S = { x: 440, y: SON_SEAT.y, h: H.son };
const HOLD: Vec = { x: D.x - 74, y: 1292 }; // телефон у груди папы, ближе к сыну

const Sofa: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const lit = clamp((f - p.answer) / 6);
  const bob = Math.sin(f / 26) * 2;
  const lift = easeInOut((f - 2) / 16);
  const phoneAt: Vec = { x: lerp(D.x - 30, HOLD.x, lift), y: lerp(1410, HOLD.y, lift) + bob };
  const leanIn = keys(f, [[p.son - 2, 0], [p.son + 14, 1]]);
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: LIVING.seat,
    expr: t > p.answer + 6 ? EXPR.smile : EXPR.calm,
    lookY: 0.42,
    lean: 4,
    armL: { target: phoneAt, shape: "phone", item: "phone", itemColor: PHONE_CASE, glow: lit * 0.85, itemTilt: 4, elbow: "hang" },
    armR: { target: { x: phoneAt.x + 44, y: phoneAt.y + 40 }, shape: "relax", elbow: "hang", wrist: -30 },
  });
  const reach = keys(f, [[p.point - 16, 0], [p.point - 2, 1]]);
  const sonPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SON_SEAT.seat,
    expr: t > p.answer + 4 ? EXPR.smile : EXPR.calm,
    lookY: 0.32,
    lean: 4 + 8 * leanIn,
    armL: { target: { x: S.x - 10, y: 1424 }, shape: "relax", elbow: "hang" },
    armR: {
      target: keysV(t, [
        [p.son - 2, { x: S.x + 50, y: 1424 }],
        [p.son + 14, { x: S.x + 64, y: 1400 }],
        [p.point - 16, { x: S.x + 64, y: 1400 }],
        [p.point - 2, { x: HOLD.x - 10, y: HOLD.y + 6 }],
      ]),
      shape: reach > 0.5 ? "point" : "relax",
      elbow: "down",
    },
  });
  const wide = f < p.mid;
  const cam = wide
    ? camKeys(f, [
        [0, { x: 540, y: 1250, zoom: 1.22 }],
        [p.mid, { x: 530, y: 1250, zoom: 1.28 }],
      ])
    : camKeys(f, [
        [p.mid, { x: 512, y: 1236, zoom: 1.86 }],
        [p.screen, { x: 506, y: 1240, zoom: 1.94 }],
        [p.son, { x: 500, y: 1240, zoom: 1.9 }],
        [p.point, { x: 492, y: 1244, zoom: 2.0 }],
      ]);
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={LIVING_TINT}>
      <LivingBack ink={ink} uid="s11-liv" />
      <LivingSofa ink={ink} uid="s11-sofa" />
      <Actor uid="s11-dad" look="dadHome" f={f} place={() => D} face={() => -0.3} pose={dadPose} role="father" seed={5} blinkShift={23} />
      <Actor uid="s11-son" look="sonHome" f={f} place={() => S} face={() => 0.5} pose={sonPose} role="son" seed={3} blinkShift={9} />
      <CoffeeTable ink={ink} uid="s11-table" />
      <LampGlow uid="s11-glow" />
    </Shot>
  );
};

// ---------- экран видеозвонка (единицы экрана 360 × 740) ----------
const PHOTO = { x: 18, y: 112, w: 324, h: 470 };
const PHOTO_FULL = { x: 0, y: 70, w: SCREEN.w, h: 560 }; // фото во весь экран (11D)
const VideoMom: React.FC<{ f: number; p: Plan; inkPx: number; ink: number }> = ({ f, p, inkPx, ink }) => {
  const pose = (t: number): PoseIn => ({
    expr: t > p.photoOff + 6 && t < p.talkTo ? EXPR.softSmile : EXPR.smile,
    lookY: 0.06,
    nod: keys(t, [[p.screen + 10, 0], [p.screen + 16, 4], [p.screen + 24, 0]]),
    armL: { target: null },
    armR: { target: null },
  });
  return (
    <g>
      {/* номер гостиницы: тёплая стена, окно с вечерним городом, лампа */}
      <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} fill="#EBDDC5" />
      <rect x={196} y={70} width={150} height={220} rx={6} fill="#8EA3C2" stroke={C.ink} strokeWidth={ink} />
      {[
        [220, 240],
        [246, 222],
        [270, 250],
        [300, 230],
        [326, 248],
        [236, 196],
        [312, 204],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#FBE7A6" />
      ))}
      <path d={`M 196 180 L 346 180 M 271 70 L 271 290`} stroke={C.ink} strokeWidth={ink * 0.6} />
      <path d={`M 34 300 L 70 220 L 106 300 Z`} fill="#F6E3B4" stroke={C.ink} strokeWidth={ink * 0.8} />
      <circle cx={70} cy={260} r={60} fill="#FFF3D6" opacity={0.4} />
      <Actor uid="s11-vmom" look="momTalk" f={f} place={() => ({ x: 176, y: 1290, h: 1110 })} face={() => -0.08} pose={pose} seed={1} inkPx={inkPx} talk={(t) => murmur(t, p.photoOff + 4, p.talkTo - 2, 5, 0.5)} />
    </g>
  );
};

// три спокойных вопроса угармандардын
const Questions: React.FC<{ f: number; p: Plan; ink: number }> = ({ f, p, ink }) => (
  <g>
    {[
      [70, 420, 6],
      [292, 360, 18],
      [96, 250, 30],
    ].map(([x, y, d], i) => {
      const t = f - p.photoOff - d;
      const o = clamp(t / 8) * (1 - clamp((f - p.talkTo + 6) / 10));
      if (o <= 0) return null;
      const up = Math.min(t, 80) * 0.25;
      return (
        <g key={i} opacity={o} transform={`translate(${x} ${y - up}) scale(${0.85 + 0.15 * easeOut(t / 10)})`}>
          <path d={`M -34 -26 Q -34 -40 -20 -40 L 20 -40 Q 34 -40 34 -26 L 34 4 Q 34 18 20 18 L -6 18 L -18 32 L -16 18 L -20 18 Q -34 18 -34 4 Z`} fill="#FFFDF7" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
          <text x={0} y={-2} textAnchor="middle" dominantBaseline="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={36} fill={i === 1 ? C.yellowDeep : C.ink}>
            ?
          </text>
        </g>
      );
    })}
  </g>
);

const CallUi: React.FC<{ ink: number; selfView?: boolean }> = ({ ink, selfView = true }) => (
  <g>
    {selfView ? (
      <g>
        <rect x={258} y={38} width={84} height={120} rx={14} fill="#E4CFA8" stroke={C.ink} strokeWidth={ink * 0.8} />
        {/* папа и сын в маленьком окне */}
        <circle cx={284} cy={98} r={14} fill="#E8B48D" stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={`M 270 92 Q 284 76 298 92`} fill="#2B2420" stroke={C.ink} strokeWidth={ink * 0.5} />
        <circle cx={316} cy={92} r={17} fill="#DCAA84" stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={`M 299 86 Q 316 66 333 86`} fill="#1F1B1A" stroke={C.ink} strokeWidth={ink * 0.5} />
        <path d={`M 262 158 Q 284 118 300 158 M 296 158 Q 316 116 340 158`} fill="#7D8C9B" stroke={C.ink} strokeWidth={ink * 0.5} />
      </g>
    ) : null}
    <circle cx={130} cy={672} r={26} fill="#4A5470" stroke={C.ink} strokeWidth={ink * 0.8} />
    <rect x={124} y={656} width={12} height={22} rx={6} fill="#FFFFFF" />
    <circle cx={230} cy={672} r={26} fill="#D2604F" stroke={C.ink} strokeWidth={ink * 0.8} />
    <path d={`M 216 676 Q 230 662 244 676`} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
  </g>
);

// фото зала на экране: белая рамка, выезжает снизу
const PhotoCard: React.FC<{ k: number; ink: number }> = ({ k, ink }) => {
  if (k <= 0) return null;
  const dy = (1 - easeOut(k)) * 520;
  return (
    <g transform={`translate(0 ${dy})`} opacity={clamp(k * 3)}>
      <rect x={PHOTO.x - 8} y={PHOTO.y - 8} width={PHOTO.w + 16} height={PHOTO.h + 16} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink} />
      <HallPicture x={PHOTO.x} y={PHOTO.y} w={PHOTO.w} h={PHOTO.h} ink={ink * 2} />
    </g>
  );
};

const PHONE: PhonePlace = { x: 540, y: 880, w: 520, rot: -3 };
const PhoneClose: React.FC<{ f: number; p: Plan; pointing: boolean }> = ({ f, p, pointing }) => {
  const ink = useInk(3.6);
  const g = phoneGeom(PHONE.w);
  const sInk = 3 / g.s; // контур внутри экрана ≈ 3 px кадра
  const photoK = pointing ? 1 : fadeIO(f, p.photo - 2, p.photoOff + 8, 14, 10);
  const bob = Math.sin(f / 30) * 4;
  const ph = { ...PHONE, y: PHONE.y + bob };
  // место у кафедры на фото → экран → мир
  const spotScr = hallPt(PHOTO_FULL, HALL.lectern.x - 150, HALL.stageTop + 4);
  const spot = phonePt(ph, spotScr.x, spotScr.y);
  const tap = easeInOut((f - p.point - 2) / 12);
  const finger: Vec = { x: lerp(spot.x + 260, spot.x + 46, tap), y: lerp(spot.y + 420, spot.y + 92, tap) };
  return (
    <Shot f={f} cam={{ x: 540, y: 960 + (pointing ? -(f - p.point) * 0.2 : 0), zoom: 1 + (pointing ? (f - p.point) * 0.0012 : (f - p.screen) * 0.0006) }} bg="#E2CDA7" tint={LIVING_TINT}>
      <Svg>
        {/* размытая комната за телефоном: тёплые пятна света */}
        <circle cx={920} cy={300} r={240} fill="#F6E1B5" opacity={0.7} />
        <circle cx={120} cy={1500} r={300} fill="#D9B98E" opacity={0.6} />
        <circle cx={200} cy={420} r={130} fill="#EED7AE" opacity={0.6} />
        <PhoneGrip {...ph} look={SKIN.dadHome} ink={ink} part="back" />
        <PhoneFrame {...ph} ink={ink} uid="s11-ph" screenColor="#EBDDC5">
          {pointing ? (
            <g>
              <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} fill="#2A3142" />
              <HallPicture {...PHOTO_FULL} ink={sInk * 1.6} />
              <CallUi ink={sInk} selfView={false} />
            </g>
          ) : (
            <g>
              <VideoMom f={f} p={p} inkPx={sInk} ink={sInk} />
              <Questions f={f} p={p} ink={sInk} />
              <PhotoCard k={photoK} ink={sInk} />
              <CallUi ink={sInk} />
            </g>
          )}
        </PhoneFrame>
        <PhoneGrip {...ph} look={SKIN.dadHome} ink={ink} part="front" />
        {pointing ? (
          <>
            {f >= p.here ? <Ring x={spot.x} y={spot.y} r={70} t={f - p.here} color={C.yellow} width={ink * 1.4} dur={14} /> : null}
            <CloseHand x={finger.x} y={finger.y} angle={152} size={170} look={SKIN.sonHome} shape="point" armLen={4} ink={ink} />
          </>
        ) : null}
      </Svg>
    </Shot>
  );
};

export const S11Call: React.FC = () => {
  const { f } = useScene("call");
  const p = usePlan(callPlan);
  if (f >= p.screen && f < p.son) return <PhoneClose f={f} p={p} pointing={false} />;
  if (f >= p.point) return <PhoneClose f={f} p={p} pointing />;
  return <Sofa f={f} p={p} />;
};

// Звук: тихий сигнал звонка, атмосфера комнаты.
export const sfxS11Call: Sd2SfxPlan = (tl) => {
  const p = callPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.ring, kind: "call" },
    { at: p.point + 12, kind: "tap", volume: 0.16 },
  ];
};

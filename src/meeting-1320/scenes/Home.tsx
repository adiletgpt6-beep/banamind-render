// Сцена 9 «Үйдө» — вечер, кухонный стол.
// 9a. N14 (1-е предложение): общий план — жена и муж обсуждают, как
//     устроить ежедневную дорогу: она объясняет жестом, он думает (рука у
//     подбородка), кивает.
// 9b. N14 (2-е): стол сверху — бумажный планер недели, в каждом дне 13:20;
//     палец жены проходит по меткам, рука мужа рядом.
// 9c. N15: средний план — отец сам берёт телефон; крупно — он набирает
//     запрос, находит BalaGo, открывает страницу; средний — поворачивает
//     экран к жене, она придвигается вместе со стулом.
// 9d. N16: крупно — читают вместе (палец жены на «ҮЙ → МЕКТЕП → ҮЙ»);
//     форма: «Аты-жөнү», «Дарек», «Мектеп», «Убакыт» → «Өтүнмө калтыруу»
//     → «Алдын ала өтүнмө жөнөтүлдү». Только предварительная заявка.
// 9e. Общий: переглядываются, отец кладёт телефон на стол.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { H, seatOf } from "./common";
import { HM_POS, HomeRoom } from "../sets/Home31";
import { BalagoPage, FormScreen, FORM_FIELD, FORM_SEND, KB_TOP, PAGE_CTA, Phone, PhoneHold, phonePt, SEARCH_CARD, SearchScreen } from "../props/Phone31";
import { PlannerTop, plannerChip, TableTop } from "../props/HomeProps";
import { CloseHand } from "../props/CloseHand";
import { M13_HANDS } from "../props/hands";
import { sfxAt, type M13Sfx } from "./sfx";

export const homePlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "home");
  const n15 = T.from("N15");
  const n16 = T.from("N16");
  const cutB = Math.max(70, T.word("N14", "Жумуштагы") - 6);
  const cutC = Math.max(cutB + 60, n15 - 4);
  const cutD = Math.max(cutC + 22, T.word("N15", "варианттарды") - 6);
  const site = T.word("N15", "Балагонун");
  const cutE = Math.max(site + 14, T.word("N15", "көрсөттү") - 8);
  const cutF = Math.max(cutE + 30, n16 - 2);
  const school = T.word("N16", "мектепке");
  const cutG = Math.max(cutF + 40, school + 20);
  const req = T.word("N16", "өтүнмө");
  const cutH = Math.min(T.len - 28, Math.max(req + 50, T.to("N16") + 16));
  return {
    len: T.len,
    cutB,
    lit: [cutB + 14, cutC - 16] as const,
    cutC,
    grab: n15 + 4,
    cutD,
    type: [cutD + 2, site - 12] as const,
    results: [site - 10, site - 4] as const,
    pick: [site - 2, site + 6] as const,
    page: site + 8,
    cutE,
    turn: [cutE + 4, cutE + 18] as const,
    slide: [cutE + 8, cutE + 30] as const,
    cutF,
    scroll: [cutF + 6, school - 4] as const,
    point: [school - 6, school + 14] as const,
    cutG,
    fill: [cutG + 2, req - 10] as const,
    press: [req - 6, req + 2] as const,
    sent: [req + 4, req + 24] as const,
    cutH,
    down: [cutH + 4, cutH + 20] as const,
  };
};

export const homeSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = homePlan(tl);
  return [
    sfxAt(tl, "home", P.pick[0], "phone-tap", 0.35),
    sfxAt(tl, "home", P.press[0] + 2, "phone-tap", 0.35),
    sfxAt(tl, "home", P.sent[0] + 4, "notify", 0.22),
    sfxAt(tl, "home", P.slide[0], "chair", 0.25),
  ];
};

export const homeSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));
const pulse = (f: number, a: number, b: number) => Math.sin(Math.PI * ramp(f, a, b));

const PHONE_ON_TABLE = { x: 730, y: 1372 };
const PH_SHOT = { x: 540, y: 840, k: 1.3 } as const;

export const HomeScene: React.FC = () => {
  const { f } = useScene("home");
  const P = usePlan(homePlan);
  const T = HM_POS.table;
  const fa = HM_POS.father;
  const dH = H.dad;
  const mH = H.mom;

  // жена придвигается вместе со стулом
  const moX = (t: number) => lerp(HM_POS.mother.x, HM_POS.motherNear.x, easeInOut(ramp(t, P.slide[0], P.slide[1])));
  const near = (t: number) => easeInOut(ramp(t, P.slide[0], P.slide[1]));

  // телефон: на столе → в руке (экран к себе) → к жене (экран к ней/камере) → на стол
  const inHand = f >= P.grab + 12 && f < P.down[1];
  const chest = { x: fa.x + 40, y: 1236 };
  const shown = { x: fa.x - 70, y: 1226 };
  const dadPose = (t: number): PoseIn => {
    const think = pulse(t, 18, P.cutB + 4);
    const turn = easeInOut(ramp(t, P.turn[0], P.turn[1]));
    const back = easeInOut(ramp(t, P.down[0], P.down[1]));
    const g = easeInOut(ramp(t, P.grab, P.grab + 12));
    const l = easeInOut(ramp(t, P.grab + 12, P.grab + 28));
    const holding = t >= P.grab + 12 && t < P.down[1];
    const rest = { x: fa.x + 60, y: T.top + 44 };
    let target = rest;
    if (t < P.grab) target = think > 0.05 ? { x: lerp(rest.x, fa.x + 18, think), y: lerp(rest.y, 1150, think) } : rest;
    else if (t < P.grab + 12) target = { x: lerp(rest.x, PHONE_ON_TABLE.x, g), y: lerp(rest.y, PHONE_ON_TABLE.y - 4, g) };
    else if (t < P.down[0]) {
      const c = { x: lerp(PHONE_ON_TABLE.x, chest.x, l), y: lerp(PHONE_ON_TABLE.y - 4, chest.y, l) };
      target = { x: lerp(c.x, shown.x, turn), y: lerp(c.y, shown.y, turn) };
    } else target = { x: lerp(shown.x, PHONE_ON_TABLE.x, back), y: lerp(shown.y, PHONE_ON_TABLE.y - 4, back) };
    return {
      sit: 1,
      seat: seatOf(dH),
      expr: t < P.cutC ? (think > 0.3 ? "thinking" : "calm") : t > P.cutH ? "softSmile" : "calm",
      nod: pulse(t, P.cutB - 26, P.cutB - 8) * 0.8,
      lookY: holding && turn < 0.5 ? 0.55 : t < P.cutB ? 0 : 0.35,
      lookX: t > P.cutH ? -0.4 : 0,
      armL: { target: { x: fa.x - 56, y: T.top + 42 }, elbow: "hang" },
      armR: { target, elbow: holding || think > 0.05 ? "front" : "hang", item: holding ? "phone" : undefined, facing: turn > 0.5 ? "camera" : "self", glow: holding ? 1 : 0, shape: think > 0.3 ? "fist" : undefined },
    };
  };
  const dadFace = (t: number) => (t < P.cutB ? keys(t, [[0, -0.35], [26, -0.35], [40, -0.1], [P.cutB - 20, -0.1], [P.cutB - 8, -0.4]]) : t > P.cutH ? -0.45 : keys(t, [[P.turn[0], 0], [P.turn[1], -0.4]]));

  const momPose = (t: number): PoseIn => {
    const gest = pulse(t, 22, 70);
    const lean = near(t);
    const mx = moX(t);
    return {
      sit: 1,
      seat: seatOf(mH),
      expr: t > P.cutE ? "softSmile" : "calm",
      lean: 9 * lean,
      lookY: t > P.cutE ? 0.3 : 0,
      armL: { target: { x: mx - 50, y: T.top + 40 }, elbow: "hang" },
      armR: gest > 0.05 ? { target: { x: mx + 90 + 20 * Math.sin(t * 0.25), y: lerp(T.top + 40, 1190, gest) }, elbow: "front", shape: "open" } : { target: { x: mx + 52, y: T.top + 42 }, elbow: "hang" },
    };
  };
  const momFace = (t: number) => (t < P.cutB ? 0.45 : 0.5);

  const room = (late: number) => {
    const mPlace = (t: number) => ({ x: moX(t), y: HM_POS.mother.y, h: mH });
    const dPlace = () => ({ x: fa.x, y: fa.y, h: dH });
    const mom = (layer: "body" | "arms") => <Actor uid="h-mom" look="m13MomHome" f={f} place={mPlace} face={momFace} pose={momPose} seed={6} blinkShift={9} layer={layer} />;
    const dad = (layer: "body" | "arms") => <Actor uid="h-dad" look="m13DirectorHome" f={f} place={dPlace} face={dadFace} pose={dadPose} seed={3} blinkShift={2} layer={layer} />;
    return (
      <HomeRoom
        late={late}
        chairs={[{ x: moX(f), seat: seatOf(mH) }, { x: fa.x, seat: seatOf(dH) }, { x: HM_POS.sonChair.x, seat: seatOf(dH) }]}
        seated={
          <>
            {mom("body")}
            {dad("body")}
          </>
        }
        onTable={
          !inHand ? (
            <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
              <path d={`M ${PHONE_ON_TABLE.x - 34} ${PHONE_ON_TABLE.y + 6} L ${PHONE_ON_TABLE.x + 34} ${PHONE_ON_TABLE.y + 6} L ${PHONE_ON_TABLE.x + 28} ${PHONE_ON_TABLE.y - 8} L ${PHONE_ON_TABLE.x - 28} ${PHONE_ON_TABLE.y - 8} Z`} fill="#1C2230" stroke="#0E1420" strokeWidth={2} />
            </svg>
          ) : null
        }
        arms={
          <>
            {mom("arms")}
            {dad("arms")}
          </>
        }
      />
    );
  };

  // ---- 9b: планер сверху
  const PL = { x: 540, y: 860 };
  const sweep = ramp(f, P.lit[0], P.lit[1]) * 4;
  const ci = Math.min(4, Math.floor(sweep));
  const c0 = plannerChip(PL.x, PL.y, ci);
  const c1 = plannerChip(PL.x, PL.y, Math.min(4, ci + 1));
  const fr = sweep - ci;
  const hop = Math.sin(Math.PI * fr) * 34;
  const tip = { x: lerp(c0.x, c1.x, easeInOut(fr)), y: lerp(c0.y, c1.y, fr) + 10 - hop };
  const pointA = 206;
  const pL = 230;
  const dir = { x: -Math.sin((pointA * Math.PI) / 180), y: Math.cos((pointA * Math.PI) / 180) };
  const enter = easeInOut(ramp(f, P.cutB, P.lit[0]));
  const wrist = { x: tip.x - dir.x * pL * 1.12 - (1 - enter) * 200, y: tip.y - dir.y * pL * 1.12 + (1 - enter) * 400 };
  const momHand = M13_HANDS.momHome;
  const dadHand = M13_HANDS.directorHome;

  // ---- 9c/9d: телефон крупно
  const ph = PH_SHOT;
  const tapTo = (sx: number, sy: number) => phonePt(ph.x, ph.y, ph.k, -2, sx, sy);
  const finger = (target: { x: number; y: number }, lift: number) => {
    const L = 250;
    const a = 154;
    const d = { x: -Math.sin((a * Math.PI) / 180), y: Math.cos((a * Math.PI) / 180) };
    const w = { x: target.x - d.x * L * 1.12, y: target.y - d.y * L * 1.12 + lift * 60 };
    return <CloseHand {...dadHand} x={w.x} y={w.y} angle={a} size={L} shape="point" armLen={3} />;
  };
  const typingTap = (t: number) => 0.5 + 0.5 * Math.sin(t * 1.4);
  const kbTarget = { x: 60 + 230 * Math.abs(Math.sin(f * 0.37)), y: KB_TOP + 44 + 62 * (Math.floor(f / 5) % 3) };
  const searchFinger = f < P.results[0] ? tapTo(kbTarget.x, kbTarget.y) : tapTo(SEARCH_CARD.x + SEARCH_CARD.w * 0.6, SEARCH_CARD.y + SEARCH_CARD.h * 0.55);
  const pageFinger = tapTo(PAGE_CTA.x + PAGE_CTA.w * 0.7, PAGE_CTA.y + PAGE_CTA.h * 0.5);
  const fillI = Math.min(3, Math.floor(ramp(f, P.fill[0], P.fill[1]) * 4));
  const fieldFinger = f < P.press[0] - 4 ? tapTo(FORM_FIELD(fillI).x + 120, FORM_FIELD(fillI).y + 30) : tapTo(FORM_SEND.x + FORM_SEND.w * 0.65, FORM_SEND.y + FORM_SEND.h * 0.5);
  // палец жены на маршруте (страница BalaGo, строка маршрута)
  const routeTip = tapTo(200, 418);
  const mpA = 232;
  const mpL = 240;
  const mpDir = { x: -Math.sin((mpA * Math.PI) / 180), y: Math.cos((mpA * Math.PI) / 180) };
  const momPoint = easeInOut(ramp(f, P.point[0], P.point[0] + 8)) * (1 - easeInOut(ramp(f, P.point[1], P.point[1] + 8)));

  return (
    <>
      {/* 9a: общий план — обсуждают */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 520, y: 1240, zoom: 1.3 }, { x: 520, y: 1250, zoom: 1.36 })}>
        {room(0.25)}
      </Shot>
      {/* 9b: планер недели сверху */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={camMove(f, P.cutB, P.cutC, { x: 540, y: 960, zoom: 1.0 }, { x: 540, y: 940, zoom: 1.05 })}>
        <TableTop late={0.3}>
          <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
            <PlannerTop x={PL.x} y={PL.y} lit={f < P.lit[0] ? 0 : sweep + 0.6} />
            <CloseHand {...momHand} x={wrist.x} y={wrist.y} angle={pointA} size={pL} shape="point" armLen={3} mirror />
          </svg>
        </TableTop>
      </Shot>
      {/* 9c-1: отец берёт телефон */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={{ x: 560, y: 1230, zoom: 1.62 }}>
        {room(0.3)}
      </Shot>
      {/* 9c-2: поиск и страница BalaGo крупно */}
      <Shot f={f} from={P.cutD} to={P.cutE} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A2C22">
        <PhoneHold layer="back" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <Phone x={ph.x} y={ph.y} k={ph.k} angle={-2}>
          {f < P.page ? <SearchScreen f={f} typed={ramp(f, P.type[0], P.type[1])} results={ramp(f, P.results[0], P.results[1])} pick={ramp(f, P.pick[0], P.pick[1])} /> : <BalagoPage />}
        </Phone>
        <PhoneHold layer="front" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>{f < P.page - 2 ? finger(searchFinger, f < P.results[0] ? typingTap(f) * 0.4 : 1 - pulse(f, P.pick[0] - 4, P.pick[1])) : finger(pageFinger, 1.6)}</svg>
      </Shot>
      {/* 9c-3: показывает жене; она придвигается */}
      <Shot f={f} from={P.cutE} to={P.cutF} cam={camMove(f, P.cutE, P.cutF, { x: 540, y: 1220, zoom: 1.58 }, { x: 520, y: 1220, zoom: 1.66 })}>
        {room(0.3)}
      </Shot>
      {/* 9d-1: читают вместе — палец жены на маршруте */}
      <Shot f={f} from={P.cutF} to={P.cutG} cam={camMove(f, P.cutF, P.cutG, { x: 540, y: 960, zoom: 1 }, { x: 540, y: 940, zoom: 1.04 })} bg="#3A2C22">
        <PhoneHold layer="back" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <Phone x={ph.x} y={ph.y} k={ph.k} angle={-2}>
          <BalagoPage scroll={ramp(f, P.scroll[0], P.scroll[1])} />
        </Phone>
        <PhoneHold layer="front" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          {momPoint > 0.01 ? <CloseHand {...momHand} x={routeTip.x - mpDir.x * mpL * 1.12 - (1 - momPoint) * 260} y={routeTip.y - mpDir.y * mpL * 1.12 + (1 - momPoint) * 220} angle={mpA} size={mpL} shape="point" armLen={3} mirror /> : null}
        </svg>
      </Shot>
      {/* 9d-2: форма предварительной заявки */}
      <Shot f={f} from={P.cutG} to={P.cutH} cam={camMove(f, P.cutG, P.cutH, { x: 540, y: 960, zoom: 1 }, { x: 540, y: 950, zoom: 1.04 })} bg="#3A2C22">
        <PhoneHold layer="back" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <Phone x={ph.x} y={ph.y} k={ph.k} angle={-2}>
          <FormScreen fill={ramp(f, P.fill[0], P.fill[1]) * 4} press={ramp(f, P.press[0], P.press[1])} sent={ramp(f, P.sent[0], P.sent[1])} />
        </Phone>
        <PhoneHold layer="front" x={ph.x} y={ph.y} k={ph.k} angle={-2} {...dadHand} />
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>{f < P.sent[0] ? finger(fieldFinger, f < P.press[0] - 4 ? typingTap(f) * 0.3 : 1 - pulse(f, P.press[0] - 4, P.press[1] + 2)) : null}</svg>
      </Shot>
      {/* 9e: переглянулись, телефон — на стол */}
      <Shot f={f} from={P.cutH} to={P.len} cam={camMove(f, P.cutH, P.len, { x: 530, y: 1200, zoom: 1.4 }, { x: 530, y: 1190, zoom: 1.44 })}>
        {room(0.35)}
      </Shot>
    </>
  );
};


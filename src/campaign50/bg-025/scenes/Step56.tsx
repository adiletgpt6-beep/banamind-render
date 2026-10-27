// Шаги 5/6 и 6/6 одной сценой. Мама тянет ленту — сгиб 5 разворачивается
// в бумажную карточку группового чата: на «ата-энелер» мягко подсвечиваются
// места родителей, на «Ватсап» шапка группы окрашивается в зелёный, на
// «тобу түзүлөт» участники присоединяются по одному (три родителя и
// водитель). На «Андан соң» руки перехватывают ленту, камера едет вниз —
// сгиб 6 раскрывается полосой недели; на «туруктуу каттам» маленькая белая
// машина проезжает от дня к дню, и каждый день получает галочку.
// На «Айдоочу…» — врезка: водитель у ПРИПАРКОВАННОЙ машины сам пишет
// «Жолго чыктым», затем (скачок времени) у школы — «Жеткирдим»; пузыри
// появляются в крупном плане той же карточки группы. Плашка «Айдоочу өзү
// кабарлайт» — на «өзү». Возврат к ленте (на панели 5 те же два
// сообщения), заголовок и плашки уходят, камера отъезжает на общий план
// всей ленты; руки мамы держат её по краям — передача в финал.
import { useCurrentFrame } from "remotion";
import { Icon } from "../art";
import { useLine, useScene, useWordMatch } from "../context";
import { box, camKeys, Chip, ExampleBadge, span, StepHead, Svg, type Cam } from "../kit";
import { P5_CHAT, P5Art, P5Chat } from "../panels/P5";
import { P6Art, p6TickAt } from "../panels/P6";
import { CloseHand, SKIN } from "../props/CloseHand";
import { FoldedEdge, panelTop, RIB, RIB_X } from "../ribbon";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { camOnFold, RibbonStage } from "../stage";
import { C } from "../theme";
import { lineIn, sceneOf, wordMatchIn } from "../timing";
import { CARD_BOX, Step56Insert, type InsertBeats } from "./step56-insert";

const T = BG25_TEXT.step56;

// ---------- План сцены (кадры сцены) по фактической речи ----------
type Beats = {
  readonly F: number; // длина сцены
  readonly from: number; // начало n05
  readonly to: number; // конец n05 (после него уходят субтитры)
  readonly parents: number; // «ата-энелер»
  readonly wa: number; // «Ватсап»
  readonly tobu: number; // «тобу»
  readonly andan: number; // «Андан»
  readonly turuk: number; // «туруктуу»
  readonly aid: number; // «Айдоочу»
  readonly jolgo: number; // «жолго»
  readonly jetkir: number; // «жеткирүү»
  readonly ozu: number; // «өзү»
};

const U_DUR = 18;
const REG_DUR = 11; // перехват ленты руками перед сгибом 6
const plan = (b: Beats) => {
  // сгиб 5 разворачивается после бумажного листа перехода (≈ 9 кадров)
  const u5 = Math.max(10, b.from - 16);
  const u6 = b.andan - 2; // сгиб 6 разворачивается
  // участники присоединяются по одному и успевают встать до сгиба 6
  const gap = clamp((u6 - 16 - b.tobu) / 3, 3, 6);
  const joins = [0, 1, 2, 3].map((i) => Math.round(b.tobu + i * gap));
  // руки перехватывают ленту ниже — после последнего участника, к сгибу 6
  const reg = Math.min(u6 - 6, Math.max(joins[3] + 2, u6 - REG_DUR - 1));
  const drive = b.turuk - 2; // машина едет по неделе
  const insA = b.aid - 8;
  const type1 = b.aid + 2;
  const send1 = Math.max(type1 + 10, b.jolgo + 1);
  const msg1 = send1 + 2;
  const jumpA = Math.max(msg1 + 12, b.jetkir - 22);
  const type2 = jumpA + 10;
  const send2 = Math.max(type2 + 8, b.jetkir + 1);
  const msg2 = send2 + 2;
  const outA = b.F - 56; // заголовок и плашки уходят
  // возврат к ленте — когда реплика закончилась (субтитры уходят), но
  // не позже, чем за 10 кадров до ухода заголовков
  const insB = Math.min(outA - 10, Math.max(b.ozu + 22, msg2 + 30, b.to + 4, b.F - 92));
  const wideA = b.F - 46; // отъезд на всю ленту
  const wideB = b.F - 10;
  return { u5, u6, joins, reg, drive, insA, type1, send1, msg1, jumpA, type2, send2, msg2, insB, outA, wideA, wideB };
};

const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));

// Переезд камеры одним плавным движением с лёгким отъездом посередине
// (без остановки на промежуточной точке).
const camArc = (f: number, a: number, b: number, c0: Cam, c1: Cam, dip: number): Cam => {
  const u = clamp((f - a) / Math.max(1, b - a));
  const e = easeInOut(u);
  return { x: lerp(c0.x, c1.x, e), y: lerp(c0.y, c1.y, e), zoom: lerp(c0.zoom, c1.zoom, e) - dip * Math.sin(Math.PI * u) };
};

// Камеры ленты. Центр печати панели (x ≈ 528) ставим в середину безопасной
// зоны кадра (x ≈ 500): карточка и язычки не заходят под кнопки Reels.
// Панель чуть выше середины — руки по краям видны над субтитрами.
const camNear = (n: number, zoom: number, dy = 0): Cam => ({ x: 528 + 40 / zoom, y: panelTop(n) + 410 + dy, zoom });
const NEAR5 = camNear(5, 1.14);
const NEAR6 = camNear(6, 1.14);
// возврат к ленте: панели 5 (два сообщения водителя) и 6 целиком; низ
// карточек дней выше карточки субтитров
const RET: Cam = { x: 540, y: panelTop(5) + 664, zoom: 0.9 };
// общий план всей ленты — как первый кадр финала (Cta.tsx)
const WIDE: Cam = { x: 540, y: panelTop(1) + 3 * RIB.h, zoom: 0.44 };
// руки в первом кадре финала: запястья у низа ленты, кисть 280
const END_HAND = { y: panelTop(1) + RIB.count * RIB.h - 30, size: 280, dx: 16, armLen: 7 } as const;

// Руки мамы крупно (как MomHands из stage.tsx), но с размером и длиной
// рукава — чтобы в конце совпасть с первым кадром финала.
const Hands56: React.FC<{ readonly f: number; readonly y: number; readonly size: number; readonly dx: number; readonly armLen: number; readonly calm: number }> = ({ f, y, size, dx, armLen, calm }) => {
  const breathe = Math.sin(f / 26) * 4 * (1 - calm);
  return (
    <Svg>
      <CloseHand x={RIB_X - dx} y={y + breathe} angle={-150} size={size} {...SKIN.apa} shape="pinch" mirror armLen={armLen} />
      <CloseHand x={RIB_X + RIB.w + dx} y={y + Math.sin(f / 31 + 1) * 3 * (1 - calm)} angle={150} size={size} {...SKIN.apa} shape="pinch" armLen={armLen} />
    </Svg>
  );
};

export const Step56Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames: F } = useScene();
  const n05 = useLine("n05");
  const b: Beats = {
    F,
    from: n05.from,
    to: n05.to,
    parents: useWordMatch("n05", "ата"),
    wa: useWordMatch("n05", "ватсап"),
    tobu: useWordMatch("n05", "тобу"),
    andan: useWordMatch("n05", "андан"),
    turuk: useWordMatch("n05", "туруктуу"),
    aid: useWordMatch("n05", "айдоочу"),
    jolgo: useWordMatch("n05", "жолго"),
    jetkir: useWordMatch("n05", "жеткир"),
    ozu: useWordMatch("n05", "өзү"),
  };
  const P = plan(b);
  const B: InsertBeats = P;

  // ---------- лента ----------
  const part6 = f >= P.u6;
  const unfold5 = clamp((f - P.u5) / U_DUR);
  const unfold6 = clamp((f - P.u6) / U_DUR);
  const ue5 = easeInOut(unfold5);
  const ue6 = easeInOut(unfold6);

  // печать панели 5 (часть 5 — текущая панель; часть 6 — накрываем поле
  // сообщений, пока водитель не написал)
  const msgs = [f - P.msg1, f - P.msg2];
  const p5 = (
    <P5Art
      t={f - (P.u5 + U_DUR)}
      show={{
        ink: f - b.wa,
        pulse: bump(f, b.parents - 2, b.parents + 36),
        joins: P.joins.map((j) => f - j),
        msgs: [-1, -1],
      }}
    />
  );
  const p6 = <P6Art t={f - (P.u6 + U_DUR)} show={{ drive: f - P.drive }} />;

  // ---------- камера ----------
  // часть 5 — лёгкий наезд; на «Андан» — один плавный переезд вниз к
  // панели 6 с небольшим отъездом посередине
  const pre6 = camNear(5, 1.16, -10);
  const keys5: (readonly [number, Cam])[] = [
    [2, camOnFold(5)],
    [Math.max(P.u5 + U_DUR + 2, b.from + 4), NEAR5],
    [b.tobu - 6, camNear(5, 1.15, -5)],
    [P.u6 - 10, pre6],
  ];
  const keys6: (readonly [number, Cam])[] = [
    [P.u6 + 24, NEAR6],
    [P.insA + 6, camNear(6, 1.16, 8)],
    [P.insB, RET],
    [P.wideA, { ...RET, y: RET.y + 10, zoom: 0.88 }],
    [P.wideB, WIDE],
  ];
  const cam = f < P.u6 - 10 ? camKeys(f, keys5) : f <= P.u6 + 24 ? camArc(f, P.u6 - 10, P.u6 + 24, pre6, NEAR6, 0.15) : camKeys(f, keys6);

  // ---------- руки мамы ----------
  // часть 5: тянут нижний край сгиба 5 и держат низ панели 5; перед
  // сгибом 6 перехватывают ниже; часть 6 — тянут край сгиба 6
  // (щепоть пальцев — примерно на 187 px выше запястья)
  // держат бока панели чуть выше её низа — кисти видны над субтитрами
  const HOLD = 100;
  const LOW = 230;
  const edge5 = panelTop(5) + RIB.h * Math.sin((Math.PI / 2) * ue5) + 177;
  const hold5 = panelTop(6) + HOLD;
  const low5 = panelTop(6) + LOW;
  const regrip = easeInOut(clamp((f - P.reg) / (P.u6 - P.reg)));
  const hy0 = part6 ? panelTop(6) + RIB.h * Math.sin((Math.PI / 2) * ue6) + lerp(LOW, HOLD, ue6) : lerp(lerp(edge5, hold5, ue5), low5, regrip);
  const endK = easeInOut(clamp((f - P.wideA) / (P.wideB - P.wideA)));
  const hands = (
    <Hands56
      f={f}
      y={lerp(hy0, END_HAND.y, endK) - 18 * (0.7 * bump(f, P.u5 - 6, P.u5 + 8) + 0.9 * bump(f, P.reg - 2, P.u6 + 2) + 0.7 * bump(f, P.u6 - 4, P.u6 + 10))}
      size={lerp(240, END_HAND.size, endK)}
      dx={lerp(18, END_HAND.dx, endK)}
      armLen={lerp(5, END_HAND.armLen, endK)}
      calm={endK}
    />
  );
  // язычок «6/6» один раз мягко качнётся, когда руки берут ленту ниже
  // (заканчивается до раскрытия сгиба 6)
  const wobA = P.reg - 2;
  const wobble = part6 ? 0 : bump(f, wobA, Math.min(wobA + 12, P.u6)) ** 2;

  // Язычок под лентой: «5/6» мягко сменяется на «6/6», когда раскрывается
  // сгиб 5; «6/6» растворяется, когда раскрывается последний сгиб.
  const swapLen = Math.round(U_DUR * 0.6);
  const swap5 = f >= P.u5 && f < P.u5 + swapLen;
  const swap6 = f >= P.u6 && f < P.u6 + swapLen;
  const edge = (() => {
    if (swap5) {
      const k = easeInOut((f - P.u5) / swapLen);
      const y = panelTop(5) + RIB.h * Math.sin((Math.PI / 2) * ue5) - 4;
      return (
        <>
          <div style={box({ left: 0, top: 0, opacity: 1 - k })}>
            <FoldedEdge x={RIB_X} y={y} rest={2} next={5} />
          </div>
          <div style={box({ left: 0, top: 0, opacity: k })}>
            <FoldedEdge x={RIB_X} y={y} rest={1} next={6} />
          </div>
        </>
      );
    }
    if (swap6) {
      const k = easeInOut((f - P.u6) / swapLen);
      const y = panelTop(6) + RIB.h * Math.sin((Math.PI / 2) * ue6) - 4;
      return (
        <div style={box({ left: 0, top: 0, opacity: 1 - k })}>
          <FoldedEdge x={RIB_X} y={y} rest={1} next={6} />
        </div>
      );
    }
    return null;
  })();

  // ---------- врезка ----------
  const insO = easeInOut(clamp((f - P.insA) / 6)) * (1 - easeInOut(clamp((f - P.insB) / 6)));

  // ---------- слой кадра ----------
  const out5 = span(f, P.u6 - 8, P.u6 + 2);
  const outAll = span(f, P.outA, P.outA + 10);
  // пометка «Шарттуу мисал» бледнеет, пока под ней проезжает шапка панели 5
  const badgeDip = 1 - 0.7 * Math.min(span(f, P.u6 - 4, P.u6 + 2), 1 - span(f, P.u6 + 14, P.u6 + 22));
  // плашка «Айдоочу өзү кабарлайт» — под карточкой группы во врезке и
  // уходит вместе с врезкой
  const chipOut = span(f, P.insB - 2, P.insB + 6);

  return (
    <div style={box({ inset: 0 })}>
      {insO < 0.999 ? (
        part6 ? (
          <RibbonStage f={f} n={6} unfold={unfold6} art={p6} cam={cam} hands={null} showEdge={!swap6}>
            {/* поле сообщений панели 5: пока водитель не написал — пусто */}
            <div style={box({ left: RIB_X + P5_CHAT.x, top: panelTop(5) + P5_CHAT.y, width: P5_CHAT.w, height: P5_CHAT.h })}>
              <P5Chat w={P5_CHAT.w} h={P5_CHAT.h} msgs={msgs} />
            </div>
            {edge}
            {hands}
          </RibbonStage>
        ) : (
          <RibbonStage f={f} n={5} unfold={unfold5} art={p5} cam={cam} hands={null} wobble={wobble} showEdge={!swap5}>
            {edge}
            {hands}
          </RibbonStage>
        )
      ) : null}
      <Step56Insert f={f} B={B} opacity={insO} />
      {/* слой кадра: заголовки шагов, пометка, плашка */}
      <StepHead n={5} text={T.head5} t={f - (P.u5 + 6)} out={out5} size={44} />
      {f >= P.u6 ? <StepHead n={6} text={T.head6} t={f - (P.u6 + 17)} out={outAll} /> : null}
      <ExampleBadge text={T.example} t={f - (P.u5 + 14)} out={1 - (1 - span(f, P.outA + 4, P.outA + 14)) * badgeDip} />
      {/* ярлык на нижнем крае карточки группы (над головой водителя и над
          вывеской школы) */}
      {chipOut < 1 ? (
        <Chip
          text={T.note}
          x={CARD_BOX.x + CARD_BOX.w - 6}
          y={CARD_BOX.y + CARD_BOX.head + CARD_BOX.chat + 22}
          anchor="right"
          t={f - b.ozu}
          out={chipOut}
          bg={C.navy}
          color={C.white}
          size={30}
          icon={<Icon kind="chat" s={36} color={C.yellow} w={4.6} />}
        />
      ) : null}
    </div>
  );
};

export const step56Sfx: SceneSfx = (tl) => {
  const sc = sceneOf(tl, "step56");
  const w = (p: string) => wordMatchIn(tl, "step56", "n05", p);
  const b: Beats = {
    F: sc.frames,
    from: lineIn(tl, "step56", "n05").from,
    to: lineIn(tl, "step56", "n05").to,
    parents: w("ата"),
    wa: w("ватсап"),
    tobu: w("тобу"),
    andan: w("андан"),
    turuk: w("туруктуу"),
    aid: w("айдоочу"),
    jolgo: w("жолго"),
    jetkir: w("жеткир"),
    ozu: w("өзү"),
  };
  const P = plan(b);
  return [
    { at: P.u5, src: SFX.unfold, volume: 0.36 },
    { at: b.wa + 1, src: SFX.slide, volume: 0.12 },
    ...P.joins.map((j, i) => ({ at: j, src: SFX.pop, volume: 0.13 + i * 0.02 })),
    { at: P.joins[3] + 4, src: SFX.chime, volume: 0.16 },
    { at: P.reg, src: SFX.rustle, volume: 0.18 },
    { at: P.u6, src: SFX.unfold, volume: 0.32 },
    ...[0, 1, 2, 3, 4].map((i) => ({ at: P.drive + p6TickAt(i), src: SFX.tick, volume: 0.15 + i * 0.01 })),
    { at: P.insA + 1, src: SFX.whoosh, volume: 0.1 },
    { at: P.type1, src: SFX.type, volume: 0.22 },
    { at: P.send1, src: SFX.tap, volume: 0.22 },
    { at: P.msg1, src: SFX.ping, volume: 0.3 },
    { at: P.jumpA, src: SFX.whoosh, volume: 0.1 },
    { at: P.type2, src: SFX.type, volume: 0.22 },
    { at: P.send2, src: SFX.tap, volume: 0.22 },
    { at: P.msg2, src: SFX.ping, volume: 0.3 },
    { at: b.ozu, src: SFX.pop, volume: 0.16 },
    { at: P.insB, src: SFX.rustle, volume: 0.14 },
    { at: P.wideA + 2, src: SFX.rustle, volume: 0.2 },
  ];
};

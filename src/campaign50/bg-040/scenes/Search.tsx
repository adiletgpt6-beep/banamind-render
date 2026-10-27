// Сцена 4: «Өзү издейт, өзү жөнөтөт» — причинный мост к BalaGo.
//
// Мама сама берёт телефон со стола (решение после листа с вопросом).
// Крупно: она ищет «Бишкек балдар үчүн такси», открывает сайт BalaGo —
// сверху полоса «Алгач ылайыктуу топ издөө»; на словах «дарек»,
// «мектеп», «убакыт» заполняются поля формы (подписи как на сайте).
// «Арыз калтыруу» открывает WhatsApp с подготовленным текстом — мама
// сама нажимает «отправить»: две серые галочки, без «заявка принята».
// Диктор: «Ошондуктан күн сайын кайталанган мектеп каттамын алдын ала
// уюштуруунун жолун издейт. BalaGo'го дарек, мектеп жана убакыт керек.»
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { PhoneFrame } from "../../../two-schedules-2d/screens";
import { box, Panel, useTimeline, type Cam } from "../context";
import { lineFramesIn, wordAt, type Bg40Timeline } from "../timing";
import { BG40_TEXT } from "../script";
import { Chip } from "../kit/Labels";
import { OFFICE } from "../kit/Office";
import { PhoneHand, SearchScreen, SITE_Y, SiteScreen, TapThumb, WaScreen } from "../kit/Phone";
import { C } from "../kit/theme";
import { OfficeShot } from "./Flow";
import type { PoseIn } from "../../../two-schedules-2d/rig/Actor";

const A_MIN = 46; // минимальная длина плана в офисе
export const PHONE = { x: 250, y: 336, w: 580 } as const;
const IN = PHONE.w * 0.035; // отступ экрана в корпусе
// Точка экрана (px экрана) → кадр.
const scr = (x: number, y: number) => ({ x: PHONE.x + IN + x, y: PHONE.y + IN + y });

export const searchBeats = (tl: Bg40Timeline) => {
  const n3 = lineFramesIn(tl, "n3");
  const wSearch = wordAt(tl, "n3", "издейт");
  const wBala = wordAt(tl, "n3", "балаго");
  const wAddr = wordAt(tl, "n3", "дарек");
  const wSchool = wordAt(tl, "n3", "мектеп", 1);
  const wTime = wordAt(tl, "n3", "убакыт");
  // запрос допечатывается к слову «издейт»; план в офисе длится до тех
  // пор, пока не пора начинать печатать (экран не стоит без движения)
  const typeTo = Math.max(A_MIN + 36, wSearch + 4);
  const aEnd = Math.max(A_MIN, Math.min(typeTo - 44, 110));
  const typeFrom = aEnd + 8;
  const results = typeTo + 4;
  const tapResult = Math.max(results + 14, wBala - 8);
  const site = tapResult + 6;
  // поля — по словам «дарек», «мектеп», «убакыт», не ближе 18 кадров друг к другу
  const f0 = Math.max(site + 4, wAddr);
  const f1 = Math.max(site + 14, wSchool, f0 + 18);
  const f2 = Math.max(site + 24, wTime, f1 + 18);
  const fill = [f0, f1, f2] as const;
  const consent = fill[2] + 24;
  const button = Math.max(consent + 14, n3.to + 6);
  const wa = button + 10;
  const send = wa + 46;
  // «Өзү издеп, маалымат жөнөтөт» — с начала поиска до конца сцены
  const chip = typeFrom + 6;
  return { aEnd, typeFrom, typeTo, results, tapResult, site, fill, consent, button, wa, send, chip };
};

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = searchBeats(useTimeline());
  const t = BG40_TEXT.search;

  const A_END = b.aEnd;
  if (f < A_END) {
    // мама берёт телефон со стола
    const phoneAt = { x: OFFICE.phone.x, y: OFFICE.phone.y - 6 };
    const pose = (tt: number): PoseIn => ({
      expr: tt < 20 ? "thinking" : "calm",
      lookX: keys(tt, [[0, -0.2], [12, -0.5], [30, -0.15]]),
      lookY: keys(tt, [[0, 0.3], [14, 0.6], [32, 0.85]]),
      nod: keys(tt, [[20, 0], [34, 9]]),
      armL: {
        target: keysV(tt, [[0, { x: 600, y: 1296 }], [12, phoneAt], [18, phoneAt], [34, { x: 452, y: 1196 }]], anticipate),
        shape: tt < 14 ? "open" : "phone",
        item: tt < 14 ? "none" : "phone",
        glow: tt > 20 ? 1 : 0,
        itemTilt: -10,
        flat: keys(tt, [[14, 1], [30, 0.35]]),
        elbow: "down",
        behind: false,
      },
      armR: { target: { x: 774, y: 1296 }, shape: "relax", elbow: "down" },
    });
    const cam: Cam = { x: keys(f, [[0, 500], [A_END, 450]]), y: keys(f, [[0, 1100], [A_END, 1090]]), zoom: keys(f, [[0, 1.42], [A_END, 1.62]]) };
    return (
      <Panel cam={cam} bg={C.wall}>
        <OfficeShot uid="search-mom" f={f} pose={pose} face={(tt) => keys(tt, [[0, 0.3], [12, -0.3], [32, 0.05]])} lid={1} build={0.86} minutes={835} />
      </Panel>
    );
  }

  // крупно: телефон в руке
  const rise = easeOut((f - A_END) / 12);
  const typeP = clamp((f - b.typeFrom) / (b.typeTo - b.typeFrom));
  const resP = clamp((f - b.results) / 8);
  const pressRes = f >= b.tapResult && f < b.tapResult + 8 ? 1 - Math.abs(f - b.tapResult - 3) / 5 : 0;
  const fills = b.fill.map((at, i) => clamp((f - at) / (i === 2 ? 20 : 16))) as unknown as [number, number, number];
  const consent = clamp((f - b.consent - 2) / 6);
  const pressBtn = f >= b.button && f < b.button + 8 ? 1 - Math.abs(f - b.button - 3) / 5 : 0;
  const waOpen = clamp((f - b.wa) / 8);
  const pressSend = f >= b.send && f < b.send + 8 ? 1 - Math.abs(f - b.send - 3) / 5 : 0;
  const sent = easeInOut((f - b.send - 3) / 12);

  // куда касается палец
  const taps = [
    { at: b.tapResult, p: scr(300, 300) },
    ...b.fill.map((at, i) => ({ at: at - 4, p: scr(300, SITE_Y.fields[i]) })),
    { at: b.fill[2] + 6, p: scr(300, SITE_Y.fields[3]) },
    { at: b.consent, p: scr(44, SITE_Y.consent) },
    { at: b.button, p: scr(280, SITE_Y.button) },
    { at: b.send, p: scr(478, 1077) },
  ];
  const tap = taps.reduce((acc, tp) => (f >= tp.at - 8 && f <= tp.at + 10 ? tp : acc), null as null | (typeof taps)[number]);
  const tapA = tap ? clamp(1 - Math.abs(f - tap.at) / 10) * 1.6 : 0;
  const tapPress = tap && f >= tap.at && f < tap.at + 8 ? clamp((f - tap.at) / 8) : 0;

  const screen =
    f >= b.wa ? (
      <WaScreen f={f} open={waOpen} press={pressSend} sent={sent} />
    ) : f >= b.site ? (
      <SiteScreen f={f} fills={fills} consent={consent} press={pressBtn} />
    ) : (
      <SearchScreen f={f} typeP={typeP} resP={resP} press={pressRes} />
    );
  return (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      {/* фон: мягкий офис не в фокусе */}
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 35%, #F7FAFD 0%, #DDE7F1 60%, #CBD8E6 100%)" })} />
      <div style={box({ left: -120, top: 260, width: 520, height: 760, borderRadius: 30, background: "linear-gradient(180deg, #DCEBF7, #F3EBDD)", filter: "blur(18px)", opacity: 0.7 })} />
      <div style={box({ left: 760, top: 300, width: 300, height: 300, borderRadius: 150, border: `26px solid ${C.navy}`, filter: "blur(16px)", opacity: 0.35 })} />
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, translate: `0 ${(1 - rise) * 900}px`, rotate: `${(1 - rise) * 6}deg` })}>
        <PhoneHand x={PHONE.x} y={PHONE.y} w={PHONE.w} part="back" />
        <PhoneFrame x={PHONE.x} y={PHONE.y} w={PHONE.w}>
          {screen}
        </PhoneFrame>
        <PhoneHand x={PHONE.x} y={PHONE.y} w={PHONE.w} part="front" />
        {tap ? <TapThumb x={tap.p.x} y={tap.p.y} a={tapA} press={tapPress} /> : null}
      </div>
      <Chip x={540} y={232} text={t.chip} a={clamp((f - b.chip) / 10)} size={46} center />
    </div>
  );
};

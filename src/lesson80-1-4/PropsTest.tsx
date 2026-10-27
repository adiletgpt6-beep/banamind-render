// Технический лист предметов ролика 80-1-4 (проверка формы, размеров и опорных точек).
//   кадры 0–4 — общий лист; струя воды по кадрам: 0 — ещё нет воды, 1 — фронт
//   струи на полпути, 2 — полный поток, 3 — после остановки падает хвост (лейку
//   уже выпрямляют и поднимают), 4 — последняя капля падает из точки отрыва, а
//   первая впиталась; подпись — dripLandTimes. Лейка 0° — капля набухает снизу на
//   кромке поднятого носика; лейка 25° — земля выше носика: струи нет;
//   кадр 5 — крупно: полив, ямка от пальца, вырезы у дна, точки лейки;
//   кадр 6 — в комнате: Коран на тумбе и предметы на столике в масштабе стола;
//   кадр 7 — карточки: лицо, рубашка, наклон, поворот, стопки, подставка с пустыми местами.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CABINET, TABLE, scaleAt, tableTopY } from "../lesson01/layout";
import { Table } from "../lesson01/sets/Props";
import { RoomBack } from "../lesson01/sets/Room";
import { Card, CARD_GRIP, CardRail, CardStack, canPoint, dripLandTimes, POT_SOIL, plantBox, QuranOnStand, SproutPot, SunPatch, WateringCan, WaterStream, type CanPointName, type CardKind } from "./sets/props";

type P = { x: number; y: number };

const KINDS: CardKind[] = ["sun", "drop", "soil", "wind"];
const DBG = "#e0218a";

const Cross: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 3 }) => (
  <g stroke={DBG} strokeWidth={0.7}>
    <line x1={x - r} y1={y} x2={x + r} y2={y} />
    <line x1={x} y1={y - r} x2={x} y2={y + r} />
    <circle cx={x} cy={y} r={r * 0.45} fill="none" />
  </g>
);

const CanDebug: React.FC<{ x: number; y: number; s: number; tilt: number }> = ({ x, y, s, tilt }) => {
  const names: CanPointName[] = ["spoutTip", "handleGrip", "bodyGrip", "bottomFront", "bottomBack", "bodyCenter"];
  const tip = canPoint("spoutTip", tilt);
  const d = canPoint("spoutDir", tilt);
  const w = (p: { x: number; y: number }) => ({ x: x + s * p.x, y: y + s * p.y });
  const t0 = w(tip);
  return (
    <g>
      {names.map((n) => {
        const p = w(canPoint(n, tilt));
        return <Cross key={n} x={p.x} y={p.y} r={2.6 * s} />;
      })}
      <line x1={t0.x} y1={t0.y} x2={t0.x + d.x * 14 * s} y2={t0.y + d.y * 14 * s} stroke={DBG} strokeWidth={0.8} />
      <circle cx={t0.x + d.x * 14 * s} cy={t0.y + d.y * 14 * s} r={1.2} fill={DBG} />
    </g>
  );
};

const PlantBoxRect: React.FC<{ x: number; y: number; s: number; sway?: number; tilt?: number; t?: number }> = ({ x, y, s, sway = 0, tilt = 0, t = 0 }) => {
  const b = plantBox(sway, tilt, t);
  return <rect x={x + s * b.x} y={y + s * b.y} width={s * b.w} height={s * b.h} fill="none" stroke={DBG} strokeWidth={0.6} strokeDasharray="2 1.5" />;
};

// Полив: лейка ставится так, чтобы кончик носика оказался в точке tipPos. После
// остановки (stop) лейку, как в фильме, выпрямляют (untilt, °/с) и поднимают
// (lift, ед/с): капли набухают на нижней точке кромки движущегося носика, а
// оторвавшись, падают из точки отрыва (tipAt/dirAt), не догоняя носик.
const Pour: React.FC<{
  potX: number;
  potY: number;
  s: number;
  tilt: number;
  tipPos: P;
  t: number;
  stop: number | null;
  wet: number;
  puddle: number;
  dent?: number;
  debug?: boolean;
  lift?: P;
  untilt?: number;
}> = ({ potX, potY, s, tilt, tipPos, t, stop, wet, puddle, dent = 0, debug = false, lift, untilt = 0 }) => {
  const after = (tt: number) => (stop === null ? 0 : Math.max(0, tt - stop));
  const tiltAt = (tt: number) => Math.max(0, tilt - untilt * after(tt));
  const tipAt = (tt: number): P => (lift ? { x: tipPos.x + lift.x * after(tt), y: tipPos.y + lift.y * after(tt) } : tipPos);
  const dirAt = (tt: number) => canPoint("spoutDir", tiltAt(tt));
  const tl = tiltAt(t);
  const tip = tipAt(t);
  const tipL = canPoint("spoutTip", tl);
  const cx = tip.x - s * tipL.x;
  const cy = tip.y - s * tipL.y;
  const land = { x: potX + s * POT_SOIL.land.x, y: potY + s * POT_SOIL.land.y };
  const detach = stop !== null && t >= stop ? { tip: tipAt(stop), dir: dirAt(stop) } : undefined;
  const lands = stop === null ? [] : dripLandTimes(tipAt, land, stop, s, dirAt);
  return (
    <g>
      <SproutPot x={potX} y={potY} s={s} wet={wet} puddle={puddle} dent={dent} t={t} />
      <WateringCan x={cx} y={cy} s={s} tilt={tl} water={0.6} />
      <WaterStream tip={tip} dir={dirAt(t)} land={land} start={0} stop={stop} t={t} s={s} detach={detach} tipAt={tipAt} dirAt={dirAt} />
      {debug ? <CanDebug x={cx} y={cy} s={s} tilt={tl} /> : null}
      {lands.length ? (
        <text x={land.x - 70} y={potY + 22} fontSize={9} fill={DBG} fontFamily="monospace">
          {`drips land: stop + ${lands.map((x) => (x - (stop as number)).toFixed(3)).join(", ")} s`}
        </text>
      ) : null}
    </g>
  );
};

// состояние струи по кадру листа
const STREAM_STATES = [
  { t: -0.05, stop: null, wet: 0, puddle: 0 },
  { t: 0.125, stop: null, wet: 0, puddle: 0 },
  { t: 1.0, stop: null, wet: 0.45, puddle: 0.7 },
  { t: 1.32, stop: 1.2, wet: 0.6, puddle: 0.6 },
  { t: 1.92, stop: 1.2, wet: 0.7, puddle: 0.4 },
] as const;

const MainSheet: React.FC<{ fr: number }> = ({ fr }) => {
  const st = STREAM_STATES[Math.min(4, fr)];
  const by = 262;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1280 720">
      {/* горшки: сухой (с солнечным пятном и рамкой габаритов растения), влажный с лужицей, мокрый с ямкой в тени, с наклоном */}
      <SunPatch x={112} y={by - 2} w={150} id="sp-main" />
      <SproutPot x={110} y={by} />
      <PlantBoxRect x={110} y={by} s={1} />
      <SproutPot x={235} y={by} wet={0.6} puddle={0.5} t={0.4} />
      <SproutPot x={360} y={by} wet={1} dent={1} light={0} />
      <SproutPot x={485} y={by} tilt={8} sway={5} t={1.1} />
      {/* полив из лейки под 45°; после остановки лейку выпрямляют и поднимают */}
      <Pour potX={665} potY={by} s={1} tilt={45} tipPos={{ x: 700, y: 176 }} t={st.t} stop={st.stop} wet={st.wet} puddle={st.puddle} lift={{ x: 30, y: -45 }} untilt={60} />
      {/* лейки: 0° (стоит, с тенью; на поднятом носике набухает капля — снизу на кромке),
          25° (с отладочными точками; земля выше носика — струя не рисуется) */}
      <WateringCan x={905} y={by} tilt={0} shadow={1} />
      <WaterStream tip={{ x: 905 + canPoint("spoutTip", 0).x, y: by + canPoint("spoutTip", 0).y }} dir={canPoint("spoutDir", 0)} land={{ x: 846, y: by }} start={0} stop={0} t={0.38} />
      <WateringCan x={1075} y={by - 10} tilt={25} water={0.8} />
      <CanDebug x={1075} y={by - 10} s={1} tilt={25} />
      <WaterStream tip={{ x: 1075 + canPoint("spoutTip", 25).x, y: by - 10 + canPoint("spoutTip", 25).y }} dir={canPoint("spoutDir", 25)} land={{ x: 1000, y: by - 80 }} start={0} stop={null} t={1} />
      <Cross x={1000} y={by - 80} r={2.5} />
      {/* карточки крупно */}
      {KINDS.map((k, i) => (
        <Card key={k} x={85 + i * 125} y={650} s={3} kind={k} shadow />
      ))}
      {/* подставка с карточками и стопка рубашкой вверх */}
      <CardRail x={735} y={560} cards={KINDS} />
      <CardStack x={680} y={655} n={4} />
      <CardStack x={790} y={655} n={1} />
      <Card x={900} y={655} s={2} kind="sun" back shadow />
      {/* Коран на подставке на верхней доске тумбы */}
      <rect x={1010} y={640} width={240} height={20} fill="#c99a68" stroke="#3b2c26" strokeWidth={2} />
      <QuranOnStand x={1130} y={640} />
    </svg>
  );
};

const CloseUps: React.FC = () => (
  <svg width={1920} height={1080} viewBox="0 0 640 360">
    <SunPatch x={150} y={300} s={1.9} w={140} k={0.8} id="sp-close" />
    <Pour potX={150} potY={300} s={1.9} tilt={50} tipPos={{ x: 215, y: 170 }} t={1.0} stop={null} wet={0.5} puddle={0.85} dent={0.8} debug />
    <SproutPot x={470} y={300} s={1.9} sway={-5} t={0.7} />
    <PlantBoxRect x={470} y={300} s={1.9} sway={-5} t={0.7} />
  </svg>
);

const Context: React.FC = () => {
  const TS = scaleAt(TABLE.floorY);
  const top = tableTopY();
  const qx = CABINET.x + 150;
  const qy = CABINET.y - 16;
  const can0 = { x: TABLE.x + 155, y: top - 26 };
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={960} height={1080} viewBox={`${CABINET.x - 40} ${CABINET.y - 330} 600 675`}>
        <RoomBack t={0} />
        <QuranOnStand x={qx} y={qy} />
      </svg>
      <svg style={{ position: "absolute", left: 960, top: 0 }} width={960} height={1080} viewBox={`${TABLE.x - 270} ${top - 380} 540 607.5`}>
        <RoomBack t={0} />
        <Table x={TABLE.x} floorY={TABLE.floorY} s={TS} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} />
        <SunPatch x={TABLE.x + 40} y={top - 30} s={TS} w={150} id="sp-table" />
        <CardStack x={TABLE.x - 175} y={top - 14} s={TS} n={4} />
        <SproutPot x={TABLE.x + 40} y={top - 30} s={TS} wet={0.3} puddle={0.3} />
        <WateringCan x={can0.x} y={can0.y} s={TS} shadow={1} />
        <CardRail x={TABLE.x - 70} y={top - 6} s={TS} cards={["sun", "drop", null, null]} />
        <Card x={TABLE.x - 120} y={top - 130} s={TS} kind="soil" rot={-8} />
        <Cross x={TABLE.x - 120 + TS * CARD_GRIP.x} y={top - 130 + TS * CARD_GRIP.y} r={3} />
      </svg>
    </AbsoluteFill>
  );
};

const CardsSheet: React.FC = () => (
  <svg width={1920} height={1080} viewBox="0 0 1280 720">
    {KINDS.map((k, i) => (
      <Card key={k} x={85 + i * 125} y={330} s={3} kind={k} />
    ))}
    <Card x={585} y={330} s={3} kind="wind" back />
    {[0, 0.5, 1].map((l, i) => (
      <Card key={l} x={760 + i * 95} y={330} s={2.2} kind="drop" lean={l} shadow />
    ))}
    <Card x={1120} y={300} s={2.2} kind="sun" rot={-18} />
    <Card x={1180} y={300} s={2.2} kind="soil" rot={30} />
    {[1, 2, 3, 4].map((n) => (
      <CardStack key={n} x={110 + (n - 1) * 140} y={520} s={2} n={n} />
    ))}
    <CardRail x={850} y={520} s={2} cards={[null, "drop", null, "wind"]} />
    <CardRail x={850} y={660} s={2} cards={["soil", "sun", "wind", "drop"]} />
  </svg>
);

export const PropsTest: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr === 6) return <Context />;
  return (
    <AbsoluteFill style={{ background: "#c9925f" }}>
      {fr <= 4 ? <MainSheet fr={fr} /> : fr === 5 ? <CloseUps /> : <CardsSheet />}
    </AbsoluteFill>
  );
};

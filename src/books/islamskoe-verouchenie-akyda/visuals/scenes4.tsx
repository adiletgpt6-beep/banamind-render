// Части 8–9 и итоги: свет, огонь и глина; невидимое; почему выбор ценен; посох и
// червь; пламя и глина; только Откровение; поле и урожай; оживающая земля; этапы
// вечной жизни; надежда; душа; итоги и финал. Ангелы, джинны и незримый мир
// не изображаются: только стихии, природа, абстрактные знаки и слова.
import React from "react";
import { BRAND } from "../../../banamind/brand";
import { C, HEAVY, SERIF } from "../theme";
import { Lantern, Mountains, OL, Sky, Star8 } from "./draw";
import { PageTag, QuoteCard, wrap } from "./generic";
import { Icon } from "./icons";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// пламя (рисованное, колышется)
const Flame: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => {
  const f = Math.sin(t * 8 + seed) * 0.06;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + f)} ${s * (1 - f)})`}>
      <path d="M 0 0 Q -70 -20 -60 -90 Q -50 -150 -10 -200 Q -6 -140 20 -130 Q 30 -170 50 -180 Q 90 -110 66 -50 Q 50 0 0 0 Z" fill="#ff8a3a" stroke={OL} strokeWidth={5} />
      <path d="M 0 -6 Q -34 -14 -30 -56 Q -24 -86 0 -110 Q 6 -80 20 -76 Q 40 -40 30 -20 Q 20 -4 0 -6 Z" fill="#ffd25e" />
    </g>
  );
};
// комок глины
const Clay: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 Q -130 -70 -60 -100 Q 0 -130 60 -96 Q 130 -70 110 0 Z" fill="#b97a4a" stroke={OL} strokeWidth={6} />
    <path d="M -60 -60 Q -20 -80 20 -66" stroke="#d99a68" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

// ─────────────── свет, огонь и глина ───────────────
export const LightFireClay: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = 860;
  const q = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1) - 0.2, 0.4));
  const els = [
    { lab: "свет", who: "ангелы", at: 1 },
    { lab: "огонь", who: "джинны", at: 1.3 },
    { lab: "глина", who: "Адам", at: 1.6 },
  ];
  return (
    <g>
      <PageTag x={x} y={150} text="хадис от Айши · PDF 153" dark k={ramp(t, 0.3, 0.5)} />
      <QuoteCard x={x} y={480} w={1100} k={q} text="Ангелы созданы из света, джинн (и шайтан) из огня, Адам же из глины" by="Муслим «Зухд», 10 · PDF 153" size={46} dark />
      {els.map((e, i) => {
        const k = pop(t, at(c, e.at));
        const ex = x - 460 + i * 460;
        return (
          <g key={e.lab} transform={`translate(${ex} 520) scale(${k})`} opacity={clamp01(k * 2)}>
            {i === 0 && <Lantern x={0} y={20} s={1.15} t={t} glow={1} />}
            {i === 1 && <Flame x={0} y={110} s={1.25} t={t} />}
            {i === 2 && <Clay x={0} y={80} s={1.3} />}
            <Txt x={0} y={230} size={54} weight={900} family={HEAVY} color="#fff4d0">
              {e.lab}
            </Txt>
            <Txt x={0} y={280} size={32} weight={800} color={C.goldSoft}>
              {e.who}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── невидимое — не значит несуществующее ───────────────
export const Invisible: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const lab = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const things = [
    { ic: "star", l: "душа" },
    { ic: "mind", l: "ум" },
    { ic: "sun", l: "радость" },
    { ic: "tears", l: "печаль" },
  ];
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 153, 157–158" dark k={ramp(t, 0.3, 0.5)} />
      {lab > 0 && (
        <g opacity={lab}>
          <g transform={`translate(${x - 250} 470)`}>
            <Icon name="flask" r={90} t={t} color="#cdeaff" />
            <Txt x={0} y={150} size={34} weight={900} color="#fff4d0">
              эксперимент
            </Txt>
          </g>
          <g transform={`translate(${x + 250} 470)`}>
            <Icon name="eye" r={90} t={t} color="#fff" />
            <Txt x={0} y={150} size={34} weight={900} color="#fff4d0">
              наблюдение
            </Txt>
          </g>
          <rect x={x - 520} y={240} width={1040} height={6} rx={3} fill="#fff4d0" opacity={0.5} />
          <Txt x={x} y={220} size={34} weight={800} color={C.goldSoft}>
            за этой границей — невидимое
          </Txt>
        </g>
      )}
      {things.map((th, i) => {
        const k = pop(t, at(c, 1.05 + i * 0.12));
        const pulse = 0.55 + 0.45 * Math.sin(t * 2 + i);
        return (
          <g key={th.l} transform={`translate(${x - 450 + i * 300} 500) scale(${k})`} opacity={clamp01(k * 2)}>
            <circle r={110} fill="none" stroke="#fff4d0" strokeWidth={5} strokeDasharray="14 12" opacity={pulse} />
            <g opacity={0.35 + 0.4 * pulse}>
              <Icon name={th.ic} r={70} t={t} color="#2f3f78" />
            </g>
            <Txt x={0} y={180} size={40} weight={900} family={HEAVY} color="#fff4d0">
              {th.l}
            </Txt>
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.7)} x={x} y={780}>
        <Tag x={0} y={0} text="не видим — но признаём" size={34} color={C.goldSoft} />
      </Pop>
    </g>
  );
};

// ─────────────── служение по природе и служение по выбору ───────────────
export const Breath: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const top = pop(t, 0.3);
  const two = ramp(t, at(c, 1), 0.5);
  const hop = ramp(t, at(c, 1.5), 1.8);
  const breathe = 1 + 0.08 * Math.sin(t * 2.2);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 165 · вслед за Тафтазани" dark k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 260) scale(${top})`}>
        <Panel x={-520} y={-70} w={1040} h={140} fill="#1d2b52" stroke={C.gold} r={30} />
        <Txt x={0} y={14} size={38} weight={900} color="#fff4d0">
          пророки из людей выше главных ангелов
        </Txt>
      </g>
      {two > 0 && (
        <g opacity={two}>
          <g transform={`translate(${x - 300} 560)`}>
            <Panel x={-250} y={-180} w={500} h={360} fill="#22325e" r={30} />
            <g transform={`scale(${breathe})`}>
              <Icon name="pulse" r={80} t={t} color="#ffd0c2" />
            </g>
            <Txt x={0} y={120} size={34} weight={900} color="#fff4d0">
              {"как дыхание:\nне по личной воле"}
            </Txt>
          </g>
          <g transform={`translate(${x + 300} 560)`}>
            <Panel x={-250} y={-180} w={500} h={360} fill="#22325e" stroke={C.gold} r={30} />
            {[-120, 0, 120].map((hx, i) => (
              <rect key={i} x={hx - 12} y={-30} width={24} height={60} rx={6} fill="#c9935a" />
            ))}
            <circle cx={-200 + 400 * hop} cy={-60 - Math.abs(Math.sin(hop * Math.PI * 3)) * 70} r={22} fill={C.gold} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={120} size={34} weight={900} color="#fff4d0">
              {"человек выбирает,\nпреодолевая преграды"}
            </Txt>
            <Check x={190} y={-130} s={44} k={ramp(t, at(c, 1.85), 0.4)} />
          </g>
        </g>
      )}
    </g>
  );
};

// ─────────────── джинны и посох ───────────────
export const Staff: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const facts = ramp(t, 0.3, 0.5) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const staff = ramp(t, at(c, 1), 0.5);
  const eat = ramp(t, at(c, 1.35), 1.8);
  const fall = ramp(t, at(c, 1.35) + 1.9, 0.9);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 166–168" dark k={ramp(t, 0.3, 0.5)} />
      {facts > 0 && (
        <g opacity={facts}>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={0.5}>
              <Icon name="fire" r={50} t={t + i} color="#2f3f78" />
            </g>
          ))}
          <g transform={`translate(${x} 330)`}>
            <Icon name="fire" r={80} t={t} color="#2f3f78" />
          </g>
          {["созданы из огня", "едят · вступают в брак · умирают", "есть верующие и неверующие"].map((f, i) => (
            <Pop key={f} t={t} at={at(c, 0.1 + i * 0.3)} x={x} y={500 + i * 100}>
              <Tag x={0} y={0} text={f} size={34} color={i === 2 ? C.goldSoft : "#fff4d0"} />
            </Pop>
          ))}
        </g>
      )}
      {staff > 0 && (
        <g opacity={staff}>
          <rect x={x - 520} y={780} width={1040} height={20} rx={10} fill="#3a4a7a" />
          <g transform={`translate(${x} 790) rotate(${fall * 78})`}>
            <rect x={-14} y={-560} width={28} height={560} rx={12} fill="#8a5a33" stroke={OL} strokeWidth={5} />
            <path d="M -14 -560 Q -50 -600 -20 -630 Q 20 -640 14 -580" fill="#8a5a33" stroke={OL} strokeWidth={5} />
            {Array.from({ length: 14 }).map((_, i) => (
              <circle key={i} cx={(i % 2 ? 6 : -6)} cy={-30 - i * 22} r={4} fill="#3b2a1a" opacity={clamp01(eat * 14 - i)} />
            ))}
          </g>
          {/* древесный червь */}
          <g transform={`translate(${x + 40} ${760 - eat * 260 * (1 - fall)})`} opacity={1 - fall}>
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={i * 10} cy={Math.sin(t * 8 + i) * 4} r={7} fill="#e7c08a" stroke={OL} strokeWidth={2} />
            ))}
          </g>
          <Pop t={t} at={at(c, 1.35) + 2.6} x={x} y={320}>
            <Tag x={0} y={0} text="джинны не знают сокровенного" size={36} color={C.goldSoft} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ─────────────── пламя и глина: гордыня ───────────────
export const FlameClay: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.3, 0.6);
  const tall = ramp(t, at(c, 1), 1.2);
  const quote = ramp(t, at(c, 2), 0.6) * (1 - ramp(t, at(c, 3) - 0.3, 0.4));
  const end = pop(t, at(c, 3));
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 170–176" dark k={ramp(t, 0.3, 0.5)} />
      <g opacity={k * (1 - quote * 0.85) * (1 - end * 0.8)}>
        <Flame x={x - 260} y={720} s={1.1 + 0.9 * tall} t={t} />
        <Clay x={x + 260} y={720} s={0.9} />
        <Tag x={x - 260} y={790} text="«высоко взвивающееся пламя»" size={28} color="#ffd0c2" />
        <Tag x={x + 260} y={790} text="«комочек глины»" size={28} color="#fff4d0" />
        <Pop t={t} at={at(c, 1.6)} x={x} y={260}>
          <Tag x={0} y={0} text="«Не истина двигала Иблисом, а его самолюбие»" size={32} color={C.goldSoft} />
        </Pop>
      </g>
      <QuoteCard x={x} y={460} w={900} k={quote} text="порицайте не меня, а самих себя" by="Сура «Ибрахим» 14/22 · PDF 174" size={56} dark />
      {end > 0.001 && (
        <g transform={`translate(${x} 470) scale(${end})`}>
          <Txt x={0} y={0} size={110} weight={900} family={HEAVY} color="#fff4d0" stroke={C.terracotta}>
            ответственность
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── только Откровение ───────────────
export const OnlyRevelation: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.2, 0.8);
  const src = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const ess = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={k}>
        <rect x={0} y={640} width={1920} height={440} fill="#1b2a4a" />
        <ellipse cx={x} cy={650} rx={900} ry={60} fill="#3c5583" opacity={0.6} />
      </g>
      <PageTag x={x} y={150} text="PDF 178–179" dark k={ramp(t, 0.3, 0.5)} />
      <Pop t={t} at={0.4} x={x} y={260}>
        <g opacity={1 - ess * 0.5}>
          <Txt x={0} y={0} size={60} weight={900} family={HEAVY} color="#fff4d0">
            ахира — вечная жизнь
          </Txt>
        </g>
      </Pop>
      {src > 0 && (
        <g opacity={src}>
          {[
            { ic: "mind", l: "разум" },
            { ic: "flask", l: "естественные науки" },
          ].map((s, i) => (
            <g key={s.l} transform={`translate(${x - 380 + i * 300} 500)`}>
              <Icon name={s.ic} r={70} t={t} color="#2f3f78" />
              <Cross x={0} y={0} s={110} k={ramp(t, at(c, 1.3) + i * 0.2, 0.4)} />
              <Txt x={0} y={130} size={30} weight={900} color="#fff4d0">
                {s.l}
              </Txt>
            </g>
          ))}
          <g transform={`translate(${x + 330} 500)`}>
            <Icon name="book" r={80} t={t} color={C.goldSoft} />
            <Check x={95} y={-80} s={50} k={ramp(t, at(c, 1.6), 0.4)} />
            <Txt x={0} y={140} size={34} weight={900} color={C.goldSoft}>
              Откровение
            </Txt>
          </g>
        </g>
      )}
      {ess > 0 && (
        <g opacity={ess}>
          {["sound", "scale", "book"].map((ic, i) => (
            <g key={ic} transform={`translate(${x - 300 + i * 300} 470)`} opacity={0.35 + 0.15 * Math.sin(t * 2 + i)}>
              <Icon name={ic} r={80} t={t} color="#2f3f78" />
              <Txt x={0} y={20} size={90} weight={900} color="#fff4d0" opacity={0.85}>
                ?
              </Txt>
            </g>
          ))}
          <Tag x={x} y={680} text="сущность известна только Аллаху" size={40} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── поле и урожай; путник и родной дом ───────────────
export const Field: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const scale = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const field = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const grow = ramp(t, at(c, 1.3), 2.5);
  const home = ramp(t, at(c, 2), 0.6);
  const tilt = 9 + Math.sin(t * 1.5) * 2;
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 179–181" dark k={ramp(t, 0.3, 0.5)} />
      {scale > 0 && (
        <g opacity={scale} transform={`translate(${x} 330)`}>
          <rect x={-10} y={0} width={20} height={360} fill="#c9935a" />
          <g transform={`rotate(${tilt})`}>
            <rect x={-360} y={-12} width={720} height={24} rx={12} fill="#e2b56c" stroke={OL} strokeWidth={5} />
            {[-1, 1].map((sd, i) => (
              <g key={sd} transform={`translate(${sd * 320} 0) rotate(${-tilt})`}>
                <path d="M 0 0 L -80 140 M 0 0 L 80 140" stroke="#fff4d0" strokeWidth={4} />
                <path d="M -110 140 Q 0 200 110 140 Z" fill={i ? "#b9e6c6" : "#ffb4a8"} stroke={OL} strokeWidth={5} />
                <Txt x={0} y={250} size={36} weight={900} color="#fff4d0">
                  {i ? "добро" : "зло"}
                </Txt>
              </g>
            ))}
          </g>
          <Tag x={0} y={-90} text="в земной жизни не каждый получает воздаяние" size={30} color="#fff4d0" />
        </g>
      )}
      {field > 0 && (
        <g opacity={field}>
          <rect x={x - 600} y={600} width={1200} height={240} rx={30} fill="#5a4a32" />
          {Array.from({ length: 24 }).map((_, i) => {
            const sx = x - 550 + (i % 12) * 100;
            const sy = 680 + Math.floor(i / 12) * 90;
            const g = clamp01(grow * 1.6 - (i % 12) * 0.05);
            return (
              <g key={i} transform={`translate(${sx} ${sy}) scale(${g})`}>
                <path d="M 0 0 L 0 -100" stroke="#d9b54a" strokeWidth={6} />
                <ellipse cx={0} cy={-110} rx={12} ry={28} fill="#f2c94c" stroke={OL} strokeWidth={3} />
              </g>
            );
          })}
          <Tag x={x - 260} y={420} text="посеяли — здесь" size={36} color="#fff4d0" />
          <Tag x={x + 260} y={420} text="пожнём — там" size={36} color={C.goldSoft} />
        </g>
      )}
      {home > 0 && (
        <g opacity={home}>
          <path d={`M ${x - 600} 800 Q ${x - 200} 640 ${x + 180} 600`} stroke="#d8c3a2" strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - home)} />
          <g transform={`translate(${x + 300} 560)`}>
            <circle r={150} fill="#ffe08a" opacity={0.2 + 0.1 * Math.sin(t * 2)} />
            <Icon name="house" r={90} t={t} color="#fff4d0" />
          </g>
          <Tag x={x} y={330} text="путник, желающий вернуться в «родной дом»" size={34} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── доводы воскрешения: оживающая земля ───────────────
export const Spring: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const two = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const land = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3) - 0.3, 0.4));
  const rain = ramp(t, at(c, 2.3), 0.6);
  const green = ramp(t, at(c, 2.6), 1.6);
  const fire = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 194–196" dark k={ramp(t, 0.3, 0.5)} />
      <Pop t={t} at={0.4} x={x} y={300}>
        <g opacity={1 - two - land - fire}>
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={(i * 47) % 600 - 300} cy={Math.sin(i * 1.3 + t) * 40 + 120} r={6 + (i % 4) * 2} fill="#c9b48a" opacity={0.7} />
          ))}
          <Txt x={0} y={0} size={56} weight={900} family={HEAVY} color="#fff4d0">
            из праха — снова?
          </Txt>
        </g>
      </Pop>
      {two > 0 && (
        <g opacity={two}>
          <g transform={`translate(${x - 300} 500)`}>
            <Tag x={0} y={-120} text="первый раз" size={36} color="#fff4d0" />
            <Arrow x1={-120} y1={20} x2={120} y2={20} k={1} color={C.gold} w={10} bend={-0.4} />
            <Tag x={0} y={140} text="значит, и второй" size={36} color={C.goldSoft} />
          </g>
          <g transform={`translate(${x + 300} 500)`}>
            <circle r={150} fill="#22325e" stroke="#c5d8ff" strokeWidth={4} />
            {Array.from({ length: 24 }).map((_, i) => (
              <circle key={i} cx={Math.cos(i * 2.4) * (40 + (i % 5) * 20)} cy={Math.sin(i * 2.4) * (40 + (i % 5) * 20)} r={3 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />
            ))}
            <Tag x={0} y={200} text="небеса и земля — сложнее" size={30} color="#fff4d0" />
          </g>
        </g>
      )}
      {land > 0 && (
        <g opacity={land}>
          <g transform={camera(t, c.dur, x, 600, 1, 1.04)}>
            <rect x={x - 600} y={600} width={1200} height={230} rx={30} fill={`rgb(${185 - 90 * green}, ${150 - 10 * green}, ${100 - 30 * green})`} />
            {Array.from({ length: 10 }).map((_, i) => (
              <path key={i} d={`M ${x - 560 + i * 120} 640 l 40 50 l -30 40 l 50 60`} stroke="#8a6a42" strokeWidth={5} fill="none" opacity={1 - green} />
            ))}
            {rain > 0 &&
              Array.from({ length: 40 }).map((_, i) => {
                const rx = x - 580 + ((i * 113) % 1160);
                const ry = 260 + (((t * 600 + i * 97) % 340));
                return <line key={i} x1={rx} y1={ry} x2={rx - 8} y2={ry + 30} stroke="#9fd0f0" strokeWidth={4} opacity={rain * (1 - green * 0.7)} />;
              })}
            {rain > 0 && (
              <g opacity={rain * (1 - green * 0.6)}>
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`translate(${x - 300 + i * 300} 240)`}>
                    <ellipse rx={150} ry={50} fill="#c9d3ee" />
                    <ellipse cx={60} cy={-30} rx={80} ry={45} fill="#c9d3ee" />
                  </g>
                ))}
              </g>
            )}
            {green > 0 &&
              Array.from({ length: 22 }).map((_, i) => {
                const gx = x - 560 + i * 53;
                const g = clamp01(green * 1.5 - (i % 7) * 0.08);
                return (
                  <g key={i} transform={`translate(${gx} ${660 + (i % 3) * 50}) scale(${g})`}>
                    <path d="M 0 0 Q -10 -40 -26 -56 M 0 0 Q 4 -50 0 -70 M 0 0 Q 14 -40 28 -52" stroke="#5bb36a" strokeWidth={6} fill="none" strokeLinecap="round" />
                    {i % 4 === 0 && <circle cx={0} cy={-76} r={10} fill="#ff9ab0" stroke={OL} strokeWidth={2} />}
                  </g>
                );
              })}
          </g>
          <Pop t={t} at={at(c, 2.75)} x={x} y={430}>
            <Tag x={0} y={0} text="мёртвая земля оживает после дождя" size={34} color={C.goldSoft} />
          </Pop>
        </g>
      )}
      {fire > 0 && (
        <g opacity={fire} transform={`translate(${x} 520)`}>
          <path d="M -360 0 Q -100 -60 120 -10" stroke="#5b8a3c" strokeWidth={30} strokeLinecap="round" fill="none" />
          {[-300, -200, -100, 0].map((lx, i) => (
            <path key={i} d="M 0 0 Q -30 -50 20 -70 Q 44 -16 0 0 Z" fill="#7cc576" stroke={OL} strokeWidth={4} transform={`translate(${lx} ${-30 + (i % 2) * 20}) rotate(${-30 + i * 20})`} />
          ))}
          <Arrow x1={160} y1={-10} x2={300} y2={-10} k={ramp(t, at(c, 3.3), 0.4)} color={C.gold} w={9} />
          {ramp(t, at(c, 3.5), 0.4) > 0 && (
            <g transform="translate(420 90)">
              <Icon name="fire" r={90} t={t} color="#2f3f78" />
            </g>
          )}
          <Tag x={0} y={170} text="огонь из сырой зелёной древесины" size={34} color="#fff4d0" />
        </g>
      )}
    </g>
  );
};

// ─────────────── этапы вечной жизни ───────────────
const STAGES = [
  { l: "смерть", s: "малый Конец Света", at: 0.15 },
  { l: "барзах", s: "до воскрешения", at: 0.6 },
  { l: "Конец Света", s: "время знает Аллах", at: 1.2 },
  { l: "Сур", s: "", at: 2.05 },
  { l: "воскрешение", s: "телом и душой", at: 2.25 },
  { l: "сбор", s: "", at: 2.55 },
  { l: "книги деяний", s: "", at: 2.65 },
  { l: "отчёт", s: "", at: 2.75 },
  { l: "мизан", s: "весы", at: 2.85 },
  { l: "сырат", s: "мост", at: 2.95 },
];
export const Timeline: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = 860;
  const essence = ramp(t, at(c, 3), 0.6);
  const n = STAGES.length;
  const pos = (i: number) => {
    const row = i < 5 ? 0 : 1;
    const col = row === 0 ? i : 9 - i;
    return { x: x - 560 + col * 280, y: 330 + row * 300 };
  };
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 182–204" dark k={ramp(t, 0.3, 0.5)} />
      {STAGES.map((s, i) => {
        if (i === 0) return null;
        const a = pos(i - 1);
        const b = pos(i);
        const k = ramp(t, at(c, s.at) - 0.1, 0.4);
        return <Arrow key={`a${i}`} x1={a.x + (a.y === b.y ? (b.x > a.x ? 100 : -100) : 0)} y1={a.y + (a.y === b.y ? 0 : 90)} x2={b.x - (a.y === b.y ? (b.x > a.x ? 100 : -100) : 0)} y2={b.y - (a.y === b.y ? 0 : 90)} k={k} color="#c9d3ee" w={7} />;
      })}
      {STAGES.map((s, i) => {
        const k = pop(t, at(c, s.at));
        const p = pos(i);
        const active = i === n - 1 ? essence : 0;
        return (
          <g key={s.l} transform={`translate(${p.x} ${p.y}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-115} y={-80} w={230} h={160} fill="#22325e" stroke={active > 0 ? C.gold : "#3e5596"} r={26} />
            <Txt x={0} y={s.s ? -6 : 12} size={s.l.length > 10 ? 28 : 34} weight={900} color="#fff4d0">
              {wrap(s.l, 11)}
            </Txt>
            {s.s && (
              <Txt x={0} y={48} size={22} weight={800} color={C.goldSoft}>
                {wrap(s.s, 16)}
              </Txt>
            )}
          </g>
        );
      })}
      {essence > 0 && (
        <g opacity={essence}>
          <Tag x={x} y={820} text="«Одному Аллаху известна суть этого моста»" size={34} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── заступничество, надежда, блага ───────────────
export const Hope: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.3, 0.6);
  const earn = pop(t, at(c, 1));
  const light = ramp(t, at(c, 2), 1);
  const top = pop(t, at(c, 3));
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 202–212" dark k={ramp(t, 0.3, 0.5)} />
      <g opacity={k * (1 - light * 0.7)}>
        <Tag x={x} y={280} text="заступничество — только с дозволения Аллаха" size={36} color="#fff4d0" />
      </g>
      {earn > 0.001 && (
        <g transform={`translate(${x} 470) scale(${earn})`} opacity={1 - light * 0.85}>
          <Panel x={-470} y={-110} w={940} h={220} fill="#1d2b52" stroke={C.gold} r={30} />
          <Txt x={0} y={-20} size={38} weight={900} color="#fff4d0">
            нельзя лишь надеяться —
          </Txt>
          <Txt x={0} y={40} size={44} weight={900} family={HEAVY} color={C.goldSoft}>
            нужно заслужить
          </Txt>
        </g>
      )}
      {light > 0 && (
        <g opacity={light}>
          {Array.from({ length: 70 }).map((_, i) => {
            const px = x - 560 + ((i * 167) % 1120);
            const py = 260 + ((i * 89) % 520);
            return <circle key={i} cx={px} cy={py} r={2 + (i % 4)} fill="#fff6c8" opacity={(0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))) * light} />;
          })}
          <Tag x={x} y={420} text="грешный мусульманин — не навечно в аду" size={34} color="#fff4d0" />
          <Tag x={x} y={530} text="блага рая — «в мыслях представить» невозможно" size={34} color="#fff4d0" />
        </g>
      )}
      {top > 0.001 && (
        <g transform={`translate(${x} 700) scale(${top})`}>
          <Txt x={0} y={0} size={46} weight={700} family={SERIF} color={C.goldSoft}>
            величайшее благо — благоволение Аллаха
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── душа ───────────────
export const Soul: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.3, 0.6);
  const cells = (t * 0.6) % 1;
  const views = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const rose = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3) - 0.3, 0.4));
  const water = ramp(t, at(c, 2.3), 1.5);
  const end = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 213–217" dark k={ramp(t, 0.3, 0.5)} />
      {/* тело меняется — личность та же: клетки сменяются, свет в центре неизменен */}
      <g opacity={k * (1 - views) * (1 - rose) * (1 - end)} transform={`translate(${x} 480)`}>
        <circle r={260} fill="none" stroke="#c5d8ff" strokeWidth={6} />
        {Array.from({ length: 26 }).map((_, i) => {
          const a = i * 2.4;
          const r = 90 + (i % 5) * 34;
          const life = (cells + i / 26) % 1;
          return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={18 * Math.sin(life * Math.PI)} fill="#9fdcc0" opacity={0.8} />;
        })}
        <circle r={46} fill="#fff6c8" />
        <circle r={70} fill="#fff6c8" opacity={0.3} />
        <Tag x={0} y={330} text="тело меняется — личность та же" size={34} color="#fff4d0" />
      </g>
      {views > 0 && (
        <g opacity={views}>
          <Tag x={x - 300} y={330} text="салафиты: Божественная тайна" size={32} color="#fff4d0" />
          <Tag x={x + 300} y={430} text="халяфиты: отчасти постижима" size={32} color={C.goldSoft} />
          <QuoteCard x={x} y={640} w={900} k={views} text="Вам же дано весьма мало знаний об этом" by="Сура «Аль-Исра» 17/85 · PDF 215" size={44} dark />
        </g>
      )}
      {rose > 0 && (
        <g opacity={rose} transform={`translate(${x} 520)`}>
          <path d="M 0 260 L 0 0" stroke="#3d9a62" strokeWidth={14} />
          <path d="M 0 120 Q -80 100 -100 40 Q -30 50 0 120 Z" fill="#5bb36a" stroke={OL} strokeWidth={4} />
          <rect x={-6} y={0} width={12} height={260 * water} fill="#9fd0f0" opacity={0.85} transform={`translate(0 ${260 * (1 - water)})`} />
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={Math.cos(i * 1.26) * 40} cy={-60 + Math.sin(i * 1.26) * 30} rx={60} ry={44} fill={`rgb(${230 + 25 * water}, ${80 + 40 * water}, ${110 + 30 * water})`} stroke={OL} strokeWidth={4} transform={`rotate(${i * 72} ${Math.cos(i * 1.26) * 40} ${-60 + Math.sin(i * 1.26) * 30})`} />
          ))}
          <circle cx={0} cy={-60} r={36} fill="#ffb0c0" stroke={OL} strokeWidth={4} />
          <Tag x={-380} y={-200} text="нетелесная субстанция" size={30} color="#fff4d0" />
          <Tag x={380} y={-120} text="тонкое тело — как вода в розе" size={30} color={C.goldSoft} />
          <Pop t={t} at={at(c, 2.7)} x={0} y={330}>
            <Tag x={0} y={0} text="споры — вторичны" size={34} color="#fff4d0" />
          </Pop>
        </g>
      )}
      {end > 0 && (
        <g opacity={end} transform={`translate(${x} 470)`}>
          <circle r={180 + 10 * Math.sin(t * 2)} fill="#fff6c8" opacity={0.15} />
          <circle r={70} fill="#fff6c8" />
          <circle r={110} fill="none" stroke="#fff6c8" strokeWidth={4} strokeDasharray="10 12" transform={`rotate(${t * 20})`} />
          <Tag x={0} y={250} text="душа не умирает вместе с телом" size={36} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── итоги ───────────────
const RECAP = [
  { ic: "heart", h: "фундамент", s: "вера сердца, плоды — дела" },
  { ic: "mind", h: "разум", s: "доводы, а не закрытые глаза" },
  { ic: "camel", h: "выбор", s: "привяжи верблюда" },
  { ic: "link", h: "школы", s: "разногласия — в формулировках" },
];
export const Recap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const w = 290;
  const total = 4 * w + 3 * 24;
  return (
    <g>
      <Txt x={x} y={200} size={60} weight={900} family={HEAVY} opacity={ramp(t, 0.2, 0.5)}>
        Главное в книге
      </Txt>
      {RECAP.map((r, i) => {
        const k = pop(t, at(c, i + 0.05));
        const cx = x - total / 2 + w / 2 + i * (w + 24);
        const now = i === Math.min(3, c.beats.filter((b) => b <= t).length - 1);
        return (
          <g key={r.h} transform={`translate(${cx} ${540 + wob(t, i, 3) - (now ? 20 : 0)}) scale(${k * (now ? 1.05 : 1)})`} opacity={clamp01(k * 2)}>
            <Panel x={-w / 2} y={-220} w={w} h={440} fill="#fffaf0" stroke={now ? C.gold : undefined} r={30} />
            <g transform="translate(0 -110)">
              <Icon name={r.ic} r={70} t={t} color={[C.goldSoft, "#bfe0f7", "#d9f0c8", "#ffd0c2"][i]} />
            </g>
            <Txt x={0} y={20} size={42} weight={900} family={HEAVY}>
              {r.h}
            </Txt>
            <Txt x={0} y={90} size={28} weight={800} color={C.terracotta}>
              {wrap(r.s, 15)}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── финал ───────────────
export const Finale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, 0.2);
  const logo = pop(t, at(c, 1));
  return (
    <g>
      <Sky mode="night" t={t} id="finale" sunX={1600} sunY={180} stars={120} />
      <Mountains y={880} color="#1b2140" seed={2} scale={0.6} />
      <g transform={`translate(${x} ${430 - 70 * clamp01(logo)}) scale(${k})`}>
        <Txt x={0} y={0} size={60} weight={700} family={SERIF} color="#fff4d0">
          «Исламское вероучение (Акыда)»
        </Txt>
        <Txt x={0} y={70} size={34} weight={800} color="#c9d3ee">
          профессор Ахмед Саим Кылавуз
        </Txt>
        <Txt x={0} y={118} size={26} weight={700} color="#9aa8cc">
          перевод А. Разоренова · ИГ «САД», Москва, 2010
        </Txt>
        <Star8 x={-620} y={-18} r={20} fill={C.gold} rot={t * 20} />
        <Star8 x={620} y={-18} r={20} fill={C.gold} rot={-t * 20} />
      </g>
      {logo > 0.001 && (
        <g transform={`translate(${x} 620) scale(${logo})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={96}>
            <tspan fill="#ffffff">{BRAND.wordmark[0]}</tspan>
            <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
          </text>
          <Txt x={0} y={70} size={38} weight={800} color={C.goldSoft}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
    </g>
  );
};

// Карточки, цитаты-свитки, солнце и луна, «Един!», карта, бойкот, ат-Таиф, ночное путешествие.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { Camel, Dunes, Kaaba, Lantern, Mountains, OL, Scroll, Ship, Sky, Star8 } from "./draw";
import { Icon } from "./icons";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";
import { PageTag } from "./scenes1";

// перенос строки по словам
export const wrap = (text: string, max: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out.join("\n");
};

// ─────────────── карточки с иконками ───────────────
type CardItem = { icon: string; text: string; sub?: string; at: number };
export const Cards: React.FC<VisualProps<{ title?: string; items: CardItem[]; cross?: boolean; footer?: string; page?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const n = p.items.length;
  const w = n >= 5 ? 250 : n === 4 ? 290 : 330;
  const gap = 26;
  const total = n * w + (n - 1) * gap;
  const crossK = p.cross ? ramp(t, at(c, 1), 0.6) : 0;
  const title = pop(t, 0.2);
  return (
    <g>
      {title > 0 && p.title && (
        <g transform={`translate(${x} 175) scale(${title})`}>
          <Txt x={0} y={0} size={58} weight={900} family={HEAVY} color={C.ink}>
            {p.title}
          </Txt>
          {p.page && <PageTag x={0} y={55} text={p.page} />}
        </g>
      )}
      {p.items.map((it, i) => {
        const cx = x - total / 2 + w / 2 + i * (w + gap);
        const k = pop(t, at(c, it.at) + 0.05);
        const lines = wrap(it.text, n >= 4 ? 12 : 16);
        return (
          <g key={i} transform={`translate(${cx} ${520 + wob(t, i, 4)}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-w / 2} y={-200} w={w} h={400} fill="#fffaf0" r={30} />
            <g transform="translate(0 -95)">
              <Icon name={it.icon} r={68} t={t} color={[C.goldSoft, C.tealSoft, "#ffd0c2", "#d9f0c8", "#e6dcff"][i % 5]} />
            </g>
            <Txt x={0} y={30} size={n >= 4 ? 30 : 36} weight={900} color={C.ink}>
              {lines}
            </Txt>
            {it.sub && (
              <Txt x={0} y={170} size={22} weight={700} color={C.inkSoft}>
                {it.sub}
              </Txt>
            )}
            {crossK > 0 && <Cross x={0} y={-95} s={150} k={crossK} />}
          </g>
        );
      })}
      {p.footer && (
        <Pop t={t} at={at(c, Math.max(0, c.beats.length - 1))} x={x} y={800}>
          <Tag x={0} y={0} text={p.footer} size={30} color={C.goldSoft} />
        </Pop>
      )}
    </g>
  );
};

// ─────────────── цитата на свитке ───────────────
export const Quote: React.FC<VisualProps<{ text: string; by: string; page: string; night?: boolean; foot?: string; big?: boolean; chains?: boolean }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const k = ramp(t, 0.2, 1.1);
  const size = p.big ? 92 : p.text.length > 90 ? 44 : 54;
  const lines = wrap(p.text, p.big ? 18 : p.text.length > 90 ? 34 : 26);
  const nl = lines.split("\n").length;
  const h = Math.max(420, nl * size * 1.2 + 260);
  return (
    <g>
      {p.night && (
        <g>
          <Sky mode="night" t={t} id="qnight" sunX={x + 560} sunY={180} />
          <Mountains y={900} color="#1b2140" seed={2} scale={0.6} />
        </g>
      )}
      <g transform={`translate(0 ${-20 + Math.sin(t * 0.8) * 4})`}>
        <Scroll x={x} y={480} w={980} h={h} k={k}>
          <Star8 x={-440} y={-h / 2 + 50} r={18} fill={C.gold} rot={t * 20} />
          <Star8 x={440} y={-h / 2 + 50} r={18} fill={C.gold} rot={-t * 20} />
          <Txt x={0} y={-(nl - 1) * size * 0.6 - 30} size={size} weight={700} family={SERIF} color={C.ink}>
            {lines}
          </Txt>
          <Txt x={0} y={h / 2 - 95} size={30} weight={800} color={C.inkSoft}>
            {`— ${p.by}`}
          </Txt>
          <Txt x={0} y={h / 2 - 50} size={24} weight={700} color={C.terracotta}>
            {p.page}
          </Txt>
        </Scroll>
      </g>
      {p.foot && (
        <Pop t={t} at={at(c, 1)} x={x} y={880}>
          <Tag x={0} y={0} text={p.foot} size={32} color={C.goldSoft} />
        </Pop>
      )}
      {p.chains &&
        [-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${x + sd * 560} ${480})`} opacity={k}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx={0} cy={-150 + i * 60 + wob(t, i, 3)} rx={18} ry={30} fill="none" stroke="#6b6f78" strokeWidth={9} transform={`rotate(${i % 2 ? 90 : 0} 0 ${-150 + i * 60})`} />
            ))}
          </g>
        ))}
    </g>
  );
};

// ─────────────── солнце в правую руку, луну в левую ───────────────
export const SunMoon: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, at(c, 1), 1.4);
  const word = pop(t, at(c, 1.5));
  const end = pop(t, at(c, 2.3));
  return (
    <g>
      <rect x={0} y={0} width={960} height={1080} fill="#ffe7a8" opacity={0.65 * k} />
      <rect x={960} y={0} width={960} height={1080} fill="#1c2c58" opacity={0.75 * k} />
      <g transform={`translate(${x - 420 + (1 - k) * -300} ${430}) rotate(${t * 10})`} opacity={k}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-8} y={-190} width={16} height={60} rx={8} fill="#ffb347" transform={`rotate(${i * 30})`} />
        ))}
        <circle r={110} fill="#ffd25e" stroke={OL} strokeWidth={6} />
      </g>
      <g transform={`translate(${x + 420 + (1 - k) * 300} 430)`} opacity={k}>
        <circle r={160} fill="#fff4c4" opacity={0.15} />
        <path d="M 10 -110 A 110 110 0 1 0 10 110 A 86 86 0 1 1 10 -110 Z" fill="#fff4c4" stroke={OL} strokeWidth={6} />
      </g>
      {word > 0 && (
        <g transform={`translate(${x} 470) scale(${word})`}>
          <Panel x={-230} y={-80} w={460} h={140} fill="#fffaf0" stroke={C.gold} />
          <Txt x={0} y={14} size={50} weight={900} family={HEAVY} color={C.ink}>
            не оставлю
          </Txt>
        </g>
      )}
      <PageTag x={x} y={160} text="стр. 104" k={k} />
      {end > 0 && (
        <g transform={`translate(${x} 790) scale(${end})`}>
          <Tag x={0} y={0} text="«Я не выдам тебя ни за что!» — Абу Талиб" size={32} color="#fff4d0" />
        </g>
      )}
    </g>
  );
};

// ─────────────── «Един!» на раскалённом песке ───────────────
export const BigWord: React.FC<VisualProps<{ word: string; page?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const k = pop(t, at(c, 1));
  const free = ramp(t, at(c, 2), 1);
  const heat = Math.sin(t * 6);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={`rgb(${255}, ${200 + 30 * free}, ${120 + 80 * free})`} opacity={0.75} />
      <circle cx={x + 380} cy={210} r={150 + heat * 4} fill="#fff1a8" opacity={0.9 - 0.3 * free} />
      <circle cx={x + 380} cy={210} r={260} fill="#ffcf6a" opacity={0.25} />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M ${300 + i * 260} 760 q 30 -20 60 0 t 60 0 t 60 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.35 + 0.2 * Math.sin(t * 4 + i)} transform={`translate(0 ${Math.sin(t * 2 + i) * 6})`} />
      ))}
      <rect x={0} y={800} width={1920} height={280} fill="#e6a35a" />
      <g transform={`translate(${x - 80} ${790 + free * 40}) rotate(${free * 25})`} opacity={1 - free}>
        <path d="M -160 0 L -130 -90 L 30 -120 L 150 -60 L 170 0 Z" fill="#8c7a66" stroke={OL} strokeWidth={6} />
      </g>
      {k > 0 && (
        <g transform={`translate(${x} 470) scale(${k * (1 + 0.04 * Math.sin(t * 5))})`}>
          <Txt x={0} y={0} size={220} weight={900} family={HEAVY} color="#fffaf0" stroke={C.terracotta}>
            {p.word}
          </Txt>
        </g>
      )}
      {free > 0 && (
        <g opacity={free}>
          <Tag x={x} y={640} text="Абу Бакр выкупил и освободил Биляля" size={34} color={C.white} />
        </g>
      )}
      {p.page && <PageTag x={x} y={160} text={`${p.page}–130`} k={ramp(t, 0.6, 0.5)} />}
    </g>
  );
};

// ─────────────── анимированная карта ───────────────
export const PLACES: Record<string, { x: number; y: number; label: string; side?: 1 | -1 }> = {
  mecca: { x: 1010, y: 700, label: "Мекка" },
  medina: { x: 900, y: 430, label: "Ясриб / Медина" },
  taif: { x: 1110, y: 745, label: "ат-Таиф" },
  badr: { x: 880, y: 560, label: "Бадр", side: -1 },
  hudaybiya: { x: 975, y: 665, label: "аль-Худайбия", side: -1 },
  abyssinia: { x: 560, y: 820, label: "Эфиопия", side: -1 },
  jerusalem: { x: 650, y: 70, label: "Иерусалим ↑" },
};

const MapBase: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-200} width={2800} height={1500} fill="#7fb7dc" />
    {Array.from({ length: 10 }).map((_, i) => (
      <path key={i} d={`M ${200 + i * 90} ${i * 110} q 30 -12 60 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.3 + 0.2 * Math.sin(t * 2 + i)} />
    ))}
    {/* Африка (запад) */}
    <path d="M -400 -200 L 360 -200 L 420 160 L 560 420 L 700 640 L 820 900 L 900 1300 L -400 1300 Z" fill="#e3c590" stroke="#b9945a" strokeWidth={5} />
    {/* Аравия (восток) */}
    <path d="M 560 -200 L 2400 -200 L 2400 1300 L 1060 1300 L 1000 1000 L 930 800 L 860 600 L 760 380 L 640 120 Z" fill="#f1d9a6" stroke="#b9945a" strokeWidth={5} />
    <text x={300} y={600} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={34} fill="#a07c46" opacity={0.7}>Африка</text>
    <text x={1300} y={560} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={34} fill="#a07c46" opacity={0.7}>Аравия</text>
    {[[1300, 300], [1500, 650], [1700, 420], [1350, 900]].map(([mx, my], i) => (
      <path key={i} d={`M ${mx - 60} ${my} L ${mx} ${my - 60} L ${mx + 60} ${my} Z`} fill="#d8b77e" opacity={0.7} />
    ))}
    <text x={700} y={560} fontFamily={SERIF} fontSize={30} fill="#3f6f93" transform="rotate(62 700 560)" opacity={0.8}>
      Красное море
    </text>
  </g>
);

export const MapScene: React.FC<VisualProps<{ show: string[]; routes: { from: string; to: string; sea?: boolean; at: number }[]; tag?: { at: number; text: string }; focus?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const dx = x - 880;
  return (
    <g>
      <g transform={`translate(${dx} 0) ${camera(t, c.dur, 880, 560, 1.0, 1.06)}`}>
        <MapBase t={t} />
        {p.routes.map((r, i) => {
          const a = PLACES[r.from];
          const b = PLACES[r.to];
          const k = ramp(t, at(c, r.at) + 0.3, 2.2);
          const mx = (a.x + b.x) / 2 + (r.sea ? -160 : 60);
          const my = (a.y + b.y) / 2 + (r.sea ? 40 : 0);
          const len = Math.hypot(b.x - a.x, b.y - a.y) * 1.25;
          const px = (1 - k) * (1 - k) * a.x + 2 * (1 - k) * k * mx + k * k * b.x;
          const py = (1 - k) * (1 - k) * a.y + 2 * (1 - k) * k * my + k * k * b.y;
          return (
            <g key={i}>
              <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke={r.sea ? "#ffffff" : C.terracotta} strokeWidth={9} strokeDasharray={`${len}`} strokeDashoffset={len * (1 - k)} strokeLinecap="round" />
              {k > 0 && k < 1 && (r.sea ? <Ship x={px} y={py} s={0.32} t={t} /> : <Camel x={px - 20} y={py + 20} s={0.3} walk={t * 6} />)}
            </g>
          );
        })}
        {p.show.map((id, i) => {
          const pl = PLACES[id];
          const k = pop(t, 0.2 + i * 0.15);
          const sd = pl.side ?? 1;
          return (
            <g key={id} transform={`translate(${pl.x} ${pl.y}) scale(${k})`}>
              <circle r={18} fill={id === "mecca" ? C.gold : C.white} stroke={OL} strokeWidth={5} />
              {id === "mecca" && <Kaaba x={0} y={8} s={0.12} />}
              <g transform={`translate(${sd * 30} -6)`}>
                <text x={0} y={0} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={38} textAnchor={sd > 0 ? "start" : "end"} fill={C.ink} stroke="#fffaf0" strokeWidth={7} paintOrder="stroke">
                  {pl.label}
                </text>
              </g>
            </g>
          );
        })}
      </g>
      {p.tag && (
        <Pop t={t} at={at(c, p.tag.at)} x={x} y={170}>
          <Tag x={0} y={0} text={p.tag.text} size={36} color="#fff4d0" />
        </Pop>
      )}
    </g>
  );
};

// ─────────────── бойкот: договор на стене, съеденный червями ───────────────
export const Boycott: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.2, 1.2);
  const eat = ramp(t, at(c, 3), 2.5);
  const conscience = pop(t, at(c, 2));
  const holes = Array.from({ length: 26 }).map((_, i) => ({ hx: -290 + ((i * 137) % 580), hy: -150 + ((i * 71) % 330), r: 14 + ((i * 13) % 22) }));
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a2a31" />
      {Array.from({ length: 70 }).map((_, i) => (
        <rect key={i} x={(i % 10) * 200 - ((Math.floor(i / 10) % 2) * 100)} y={Math.floor(i / 10) * 160} width={196} height={156} fill="#34343c" stroke="#232329" strokeWidth={4} />
      ))}
      <rect x={0} y={150} width={1920} height={60} fill={C.gold} opacity={0.85} />
      <g transform={`translate(${x} 560) scale(${k}) rotate(-2)`}>
        <rect x={-340} y={-300} width={680} height={600} fill={C.parchment} stroke={C.parchmentDeep} strokeWidth={6} />
        <Txt x={0} y={-220} size={38} weight={800} family={SERIF} color={C.ink}>
          {eat > 0.15 ? "" : "Договор курайшитов"}
        </Txt>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-280} y={-170 + i * 46} width={560 - (i % 3) * 60} height={12} rx={6} fill="#a88f63" opacity={1 - eat} />
        ))}
        <rect x={-210} y={-250} width={420} height={70} rx={10} fill={eat > 0.5 ? "#fff4d0" : "transparent"} />
        <Txt x={0} y={-205} size={40} weight={900} family={SERIF} color={C.ink} opacity={clamp01(eat * 2)}>
          «Твоим именем, о Боже!»
        </Txt>
        {holes.map((h, i) => {
          const hk = clamp01(eat * 1.4 - (i % 7) * 0.08);
          if (hk <= 0) return null;
          return (
            <g key={i}>
              <circle cx={h.hx} cy={h.hy + 60} r={h.r * hk + 5} fill="#b89a62" />
              <circle cx={h.hx} cy={h.hy + 60} r={h.r * hk} fill="#2a2a31" />
            </g>
          );
        })}
        <circle cx={0} cy={-300} r={14} fill="#8a5a33" stroke={OL} strokeWidth={4} />
      </g>
      {conscience > 0 && eat < 0.2 && (
        <g transform={`translate(${x} 960) scale(${conscience})`}>
          <Tag x={0} y={0} text="«…жестокая, несправедливая табличка»" size={32} color="#fff4d0" />
        </g>
      )}
      <PageTag x={x} y={95} text="стр. 142–157" dark k={k} />
    </g>
  );
};

// ─────────────── ат-Таиф: виноградник ───────────────
export const Garden: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const dusk = ramp(t, at(c, 2), 1.5);
  const grapes = pop(t, at(c, 3));
  const escort = ramp(t, at(c, 4), 2);
  return (
    <g>
      <Sky mode={dusk > 0.5 ? "dusk" : "day"} t={t} id={`taif-${dusk > 0.5}`} sunX={x + 480} sunY={260 + dusk * 120} />
      <Mountains y={640} color={dusk > 0.5 ? "#6d4f5b" : "#8f6f55"} seed={11} />
      {/* стены города вдали */}
      <g transform={`translate(${x + 420} 610)`}>
        <rect x={-260} y={-90} width={520} height={90} fill="#c9a77a" stroke={OL} strokeWidth={4} />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-260 + i * 60} y={-110} width={30} height={22} fill="#c9a77a" stroke={OL} strokeWidth={3} />
        ))}
        <Txt x={0} y={-130} size={32} weight={800} color="#fff4d0" stroke={OL}>
          ат-Таиф
        </Txt>
      </g>
      <rect x={0} y={640} width={1920} height={440} fill="#b9a36a" />
      {/* виноградная беседка */}
      <g transform={`translate(${x - 120} 640)`}>
        <path d="M -380 0 L -380 -300 M 380 0 L 380 -300 M -400 -300 L 400 -300" stroke="#6b4428" strokeWidth={14} />
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={i} cx={-380 + i * 50 + wob(t, i, 3)} cy={-300 + ((i * 37) % 50)} rx={52} ry={34} fill={i % 2 ? "#5d9e4f" : "#6fb05c"} stroke={OL} strokeWidth={3} />
        ))}
        <ellipse cx={0} cy={20} rx={360} ry={40} fill="#000" opacity={0.15} />
        {[-260, -60, 160, 300].map((gx, i) => (
          <g key={i} transform={`translate(${gx} ${-240 + (i % 2) * 20}) scale(${i === 1 ? 1 + grapes * 0.5 : 1})`}>
            {Array.from({ length: 7 }).map((_, j) => (
              <circle key={j} cx={(j % 3) * 14 - 14} cy={Math.floor(j / 3) * 14} r={9} fill="#7a3d8a" stroke={OL} strokeWidth={2} />
            ))}
            {i === 1 && grapes > 0 && <circle cx={0} cy={14} r={50} fill="#fff1b0" opacity={0.3 * grapes} />}
          </g>
        ))}
      </g>
      <Pop t={t} at={at(c, 2.2)} x={x} y={170}>
        <Tag x={0} y={0} text="«Я Тебе жалуюсь на слабость моей силы…»" size={34} color="#fff4d0" />
      </Pop>
      <PageTag x={x} y={245} text="стр. 178–183" k={ramp(t, at(c, 2.3), 0.5)} dark={dusk > 0.5} />
      {grapes > 0 && (
        <g transform={`translate(${x - 180} 900) scale(${grapes})`}>
          <Tag x={0} y={0} text="виноград от Аддаса" size={32} color={C.white} />
        </g>
      )}
      {escort > 0 && (
        <g opacity={escort}>
          <Tag x={x + 280} y={900} text="защита аль-Мутима" size={32} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── ночное путешествие (без изображения людей и пророков) ───────────────
export const Isra: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.4, 2.6);
  const sid = pop(t, at(c, 1.2));
  const five = ramp(t, at(c, 2), 1.5);
  const a = { x: x - 480, y: 800 };
  const b = { x: x + 470, y: 470 };
  const len = 1300;
  return (
    <g>
      <Sky mode="night" t={t} id="isra" sunX={x} sunY={160} stars={110} />
      <Mountains y={860} color="#1b2140" seed={4} scale={0.6} />
      <rect x={0} y={860} width={1920} height={220} fill="#151a33" />
      <Kaaba x={a.x} y={a.y + 50} s={0.5} glow={0.6} />
      <g transform={`translate(${b.x} ${b.y + 70})`}>
        <rect x={-110} y={-60} width={220} height={60} fill="#3a4a7a" stroke="#ffe8a0" strokeWidth={3} />
        <path d="M -60 -60 Q 0 -150 60 -60 Z" fill="#c9a24a" stroke="#ffe8a0" strokeWidth={3} />
        <Txt x={0} y={60} size={30} weight={800} color="#fff4d0">
          аль-Акса, Иерусалим
        </Txt>
      </g>
      <path d={`M ${a.x} ${a.y - 120} Q ${x} ${80} ${b.x} ${b.y - 40}`} fill="none" stroke="#fff1b0" strokeWidth={7} strokeDasharray={len} strokeDashoffset={len * (1 - k)} strokeLinecap="round" opacity={0.95} />
      <path d={`M ${a.x} ${a.y - 120} Q ${x} ${80} ${b.x} ${b.y - 40}`} fill="none" stroke="#ffe08a" strokeWidth={26} strokeDasharray={len} strokeDashoffset={len * (1 - k)} opacity={0.18} />
      {sid > 0 && (
        <g transform={`translate(${x} 160) scale(${sid})`}>
          <Tag x={0} y={0} text="Абу Бакр — «ас-Сиддик», правдивейший" size={34} color="#fff4d0" />
        </g>
      )}
      {five > 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${x - 240 + i * 120} 300)`} opacity={clamp01(five * 5 - i)}>
            <Lantern x={0} y={0} s={0.45} t={t + i} />
          </g>
        ))}
      {five > 0 && <Tag x={x} y={400} text="пять ежедневных молитв" size={30} color={C.goldSoft} />}
      <PageTag x={x} y={235} text="стр. 166–175" dark k={k} />
    </g>
  );
};

export { Dunes, Arrow };

// Вступление BM-011: два пилота над Атлантикой, три загадки, книга
// (собственный рисунок, не обложка), доска всех 22 законов и пекарня «Рассвет».
import React from "react";
import { Pop, Tag, Txt, at, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { LAWS } from "../laws";
import { C, FONT, Z } from "../theme";
import { OL, Plane } from "./draw";
import { Bakery, Head, Loaf, Newspaper } from "./items";
import { AX, Card3D } from "./parts";

type VP = VisualProps<{ host?: string }>;

// море с волнами и два берега
export const Ocean: React.FC<{ cx: number; t: number; y?: number; w?: number }> = ({ cx, t, y = 560, w = 1100 }) => (
  <g>
    <rect x={cx - w / 2} y={y} width={w} height={220} rx={30} fill={C.sky} opacity={0.75} />
    {[0, 1, 2].map((r) => (
      <path
        key={r}
        d={Array.from({ length: 12 })
          .map((_, i) => `${i === 0 ? "M" : "Q"} ${cx - w / 2 + 40 + i * 90 + ((t * 30 + r * 40) % 90)} ${y + 50 + r * 55 + (i % 2 ? -14 : 14)} ${cx - w / 2 + 85 + i * 90 + ((t * 30 + r * 40) % 90)} ${y + 50 + r * 55}`)
          .join(" ")}
        stroke="#fff"
        strokeWidth={5}
        fill="none"
        opacity={0.55}
      />
    ))}
    <path d={`M ${cx - w / 2 - 20} ${y + 230} L ${cx - w / 2 - 20} ${y - 20} Q ${cx - w / 2 + 90} ${y - 40} ${cx - w / 2 + 110} ${y + 230} Z`} fill={C.green} stroke={OL} strokeWidth={5} />
    <path d={`M ${cx + w / 2 + 20} ${y + 230} L ${cx + w / 2 + 20} ${y - 20} Q ${cx + w / 2 - 90} ${y - 40} ${cx + w / 2 - 110} ${y + 230} Z`} fill={C.green} stroke={OL} strokeWidth={5} />
  </g>
);

export const Atlantic: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const f1 = ramp(t, 0.3, Math.max(1, at(c, 0.8) - 0.3));
  const second = ramp(t, at(c, 1), 0.6);
  const hinkler = pop(t, at(c, 2.05));
  const stats = ramp(t, at(c, 2.35), 0.5);
  const fade = ramp(t, at(c, 2.75), 0.6);
  const x1 = cx - 480 + 960 * f1;
  const x2 = cx - 480 + 960 * ramp(t, at(c, 1.3), Math.max(1, at(c, 2.6) - at(c, 1.3)));
  return (
    <g>
      <Ocean cx={cx} t={t} />
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Txt x={0} y={0} size={52} weight={900}>
          Атлантика в одиночку
        </Txt>
      </Pop>
      <Plane x={x1} y={330 + Math.sin(t * 2) * 10} s={0.9} />
      {pop(t, at(c, 0.7)) > 0 && (
        <g transform={`translate(${Math.min(x1, cx + 260)} 410) scale(${pop(t, at(c, 0.7))})`}>
          <Tag x={0} y={0} text="№1 · Чарльз Линдберг" size={34} color={C.yellow} />
        </g>
      )}
      {second > 0 && (
        <g opacity={second * (1 - fade * 0.55)}>
          <Plane x={x2} y={500 + Math.sin(t * 2 + 1) * 10} s={0.75} color={Z.greySoft} />
          {hinkler <= 0 && (
            <text x={x2} y={450} fontFamily={FONT} fontWeight={900} fontSize={90} textAnchor="middle" fill={C.coral} opacity={0.6 + 0.4 * Math.sin(t * 5)}>
              ?
            </text>
          )}
        </g>
      )}
      {hinkler > 0 && (
        <g transform={`translate(${cx + 230} 540) scale(${hinkler})`} opacity={1 - fade * 0.45}>
          <Tag x={0} y={0} text="№2 · Берт Хинклер" size={34} color={C.white} />
          <g opacity={stats}>
            <Tag x={-110} y={80} text="быстрее" size={28} color={Z.mint} />
            <Tag x={130} y={80} text="меньше топлива" size={28} color={Z.mint} />
          </g>
        </g>
      )}
      {fade > 0 && (
        <g transform={`translate(${cx + 150} 840) rotate(-4)`} opacity={fade}>
          <Tag x={0} y={0} text="Кто его помнит?" size={44} color={C.coral} textColor={C.white} />
        </g>
      )}
    </g>
  );
};

export const Teaser: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [0, 1, 2].map((i) => pop(t, at(c, i) - 0.1));
  return (
    <g>
      {items.map((k, i) => (
        <Card3D key={i} k={k} x={cx - 380 + i * 380} y={480} w={340} h={460} color={["#ffe7c2", Z.tealSoft, "#e6e1ff"][i]} active={t >= at(c, i) - 0.1 && (i === 2 || t < at(c, i + 1) - 0.1)}>
          {i === 0 && (
            <g>
              {/* «лучший» внизу пьедестала */}
              <rect x={-120} y={-60} width={110} height={120} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <rect x={10} y={0} width={110} height={60} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
              <Txt x={-65} y={20} size={48} weight={900}>
                1
              </Txt>
              <Txt x={65} y={44} size={40} weight={900}>
                2
              </Txt>
              <g transform={`translate(65 ${-50 + wob(t, 1, 6)})`}>
                <path d="M 0 -50 L 12 -16 L 48 -16 L 20 6 L 30 40 L 0 20 L -30 40 L -20 6 L -48 -16 L -12 -16 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
              </g>
              <Txt x={0} y={150} size={32}>
                лучший — второй?
              </Txt>
            </g>
          )}
          {i === 1 && (
            <g>
              <Loaf x={0} y={-40} s={1.2} />
              {[0, 1, 2, 3, 4].map((j) => {
                const a = (j / 5) * Math.PI * 2 + t * 0.8;
                return (
                  <g key={j} transform={`translate(${Math.cos(a) * 120} ${-70 + Math.sin(a) * 70}) scale(0.5)`}>
                    <rect x={-40} y={-40} width={80} height={80} rx={12} fill={[C.coral, Z.purple, Z.teal, C.green, Z.orange][j]} stroke={OL} strokeWidth={6} />
                  </g>
                );
              })}
              <Txt x={0} y={150} size={32}>
                всё подряд?
              </Txt>
            </g>
          )}
          {i === 2 && (
            <g>
              <Newspaper x={0} y={-60} s={0.8} head="СЕНСАЦИЯ!" rot={-4 + wob(t, 2, 2)} />
              <Txt x={0} y={150} size={32}>
                шумиха = продажи?
              </Txt>
            </g>
          )}
        </Card3D>
      ))}
    </g>
  );
};

// собственный рисунок книги «22» (не обложка издания)
export const LawsBook: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.8) * 2})`}>
    <rect x={-150} y={-210} width={300} height={420} rx={16} fill="#24324a" opacity={0.15} transform="translate(12 14)" />
    <rect x={-150} y={-210} width={300} height={420} rx={16} fill="#fdfbf5" stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-210} width={34} height={420} rx={10} fill={C.coral} stroke={OL} strokeWidth={6} />
    <text x={18} y={30} fontFamily={FONT} fontWeight={900} fontSize={200} textAnchor="middle" fill={C.ink}>
      22
    </text>
    <rect x={-70} y={70} width={180} height={18} rx={9} fill={C.yellowDeep} />
    <rect x={-50} y={110} width={140} height={14} rx={7} fill={Z.greySoft} />
    <rect x={-50} y={140} width={110} height={14} rx={7} fill={Z.greySoft} />
  </g>
);

export const BookIntro: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const years = ramp(t, at(c, 1), 0.5);
  const caveat = ramp(t, at(c, 2.05), 0.6);
  return (
    <g>
      <Pop t={t} at={0} x={cx - 300} y={470}>
        <LawsBook x={0} y={0} s={0.95} t={t} />
      </Pop>
      <g opacity={ramp(t, 0.2, 0.5) * (1 - caveat * 0.6)}>
        <Txt x={cx + 170} y={230} size={50} weight={900}>
          {"«22 непреложных\nзакона маркетинга»"}
        </Txt>
        <Txt x={cx + 170} y={400} size={36} color={C.inkSoft}>
          Эл Рис, Джек Траут
        </Txt>
      </g>
      <g opacity={years * (1 - caveat)}>
        <Pop t={t} at={at(c, 1.1)} x={cx + 170} y={520}>
          <Tag x={0} y={0} text="25+ лет наблюдений" size={34} color={Z.tealSoft} />
        </Pop>
        <Pop t={t} at={at(c, 1.4)} x={cx + 170} y={620}>
          <Tag x={0} y={0} text="22 закона" size={40} color={C.yellow} />
        </Pop>
      </g>
      {caveat > 0 && (
        <g transform={`translate(${cx + 170} 620) rotate(-4) scale(${0.6 + 0.4 * caveat})`} opacity={caveat}>
          <rect x={-260} y={-120} width={520} height={240} rx={22} fill="#fff" stroke={C.coral} strokeWidth={8} />
          <Txt x={0} y={-40} size={40} weight={900} color={C.coral}>
            модель авторов,
          </Txt>
          <Txt x={0} y={14} size={40} weight={900} color={C.coral}>
            не законы физики
          </Txt>
          <Txt x={0} y={78} size={30} color={C.inkSoft}>
            примеры 80-х и начала 90-х
          </Txt>
        </g>
      )}
    </g>
  );
};

// доска всех 22 законов (названия по оглавлению книги)
export const LawsGrid: React.FC<{ cx: number; t: number; y0?: number; start: number; step?: number; lit?: (n: number) => number; size?: number }> = ({ cx, t, y0 = 170, start, step = 0.08, lit, size = 23 }) => (
  <g>
    {LAWS.map((name, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const k = pop(t, start + i * step);
      if (k <= 0) return null;
      const L = lit ? lit(i + 1) : 0;
      return (
        <g key={i} transform={`translate(${cx - 430 + col * 287} ${y0 + row * 74}) scale(${k})`}>
          <rect x={-136} y={-28} width={272} height={58} rx={29} fill={L > 0 ? C.yellow : "#ffffffe6"} stroke={L > 0 ? C.yellowDeep : OL} strokeWidth={3} />
          <circle cx={-108} cy={1} r={20} fill={L > 0 ? "#fff" : C.yellow} stroke={OL} strokeWidth={3} />
          <text x={-108} y={9} fontFamily={FONT} fontWeight={900} fontSize={20} textAnchor="middle" fill={C.ink}>
            {i + 1}
          </text>
          <text x={-80} y={9} fontFamily={FONT} fontWeight={800} fontSize={name.length > 15 ? size - 4 : size} fill={C.ink}>
            {name}
          </text>
        </g>
      );
    })}
  </g>
);

export const LawsBoardV: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const brand = ramp(t, 0.1, 0.5) * (1 - ramp(t, at(c, 1), 0.4));
  const bak = pop(t, at(c, 1.55));
  return (
    <g>
      <g opacity={brand}>
        <text x={cx} y={420} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={120} textAnchor="middle" fill={C.ink}>
          Bana<tspan fill={C.yellowDeep}>Mind</tspan>
        </text>
        <Txt x={cx} y={490} size={40} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </g>
      <LawsGrid cx={cx} t={t} start={at(c, 1)} step={0.07} />
      {bak > 0 && (
        <g transform={`translate(${cx + 330} 860) scale(${0.62 * bak})`}>
          <Bakery x={0} y={0} t={t} glow={1} />
        </g>
      )}
      <Pop t={t} at={at(c, 1.7)} x={cx - 180} y={710}>
        <Tag x={0} y={0} text="учебный пример: пекарня «Рассвет»" size={30} color={C.white} />
      </Pop>
      <Pop t={t} at={at(c, 2.2)} x={cx - 180} y={790}>
        <Tag x={0} y={0} text="придумана для примера" size={28} color={Z.tealSoft} />
      </Pop>
    </g>
  );
};

// голова покупателя с содержимым (используется в нескольких частях)
export const MindHead: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; flip?: boolean }> = ({ x, y, s = 1, children, flip }) => (
  <Head x={x} y={y} s={s} flip={flip}>
    {children}
  </Head>
);


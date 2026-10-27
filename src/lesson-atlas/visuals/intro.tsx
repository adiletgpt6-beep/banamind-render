// Начало и финал: крючок (город, календарь, уходящие мастера, фраза о Голте),
// честная плашка «только фрагмент», трейлер, представление ведущего, прощание.
import React from "react";
import { interpolate } from "remotion";
import { BRAND } from "../../banamind/brand";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bridge, Canyon, Doc, FogQuestion, Ladle, OL, Signal, Silhouette, Skyline, Track, Train, zoneX } from "./draw";
import { Pop, Tag, Txt, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

// Белый календарь над крышей: страницы иногда срываются ветром (дата одна — из гл. I).
const SkyCalendar: React.FC<{ x: number; y: number; s?: number; t: number; text?: string; sub?: string }> = ({ x, y, s = 1, t, text = "2 сентября", sub }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={40} width={16} height={120} fill={C.steelDark} />
    <rect x={-170} y={-120} width={340} height={170} rx={12} fill="#fffdf6" stroke={OL} strokeWidth={6} />
    <rect x={-170} y={-120} width={340} height={44} rx={12} fill={C.red} />
    <text x={0} y={10} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={54} fill={C.ink}>
      {text}
    </text>
    {sub && (
      <text x={0} y={-88} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill={C.white}>
        {sub}
      </text>
    )}
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.32 + i / 3) % 1);
      return <rect key={i} x={-120 + k * 520} y={-90 + Math.sin(k * 9 + i) * 50 - k * 160} width={90} height={60} rx={6} fill="#fffdf6" stroke={OL} strokeWidth={3} opacity={(1 - k) * 0.9} transform={`rotate(${k * 280 + i * 40} ${-120 + k * 520 + 45} ${-90 + Math.sin(k * 9 + i) * 50 - k * 160 + 30})`} />;
    })}
  </g>
);

export const HookCity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const walk = ramp(t, at(c, 1), 0.4);
  const fog = ramp(t, at(c, 2), 0.8);
  const roles = ["инженер", "подрядчик", "композитор", "промышленник"];
  return (
    <g>
      <defs>
        <linearGradient id="hookSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a8" />
          <stop offset="1" stopColor="#ffeed2" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#hookSky)" opacity={0.85} />
      <circle cx={980} cy={700} r={170} fill="#ffb469" opacity={0.6} />
      <Skyline y={760} t={t} seed={2} x1={1500} />
      <SkyCalendar x={430} y={290} s={0.95} t={t} />
      <rect x={0} y={760} width={1920} height={320} fill="#cfd6e2" />
      <Track x1={0} x2={1920} y={800} />
      {/* уходящие мастера */}
      {roles.map((r, i) => {
        const appear = ramp(t, at(c, 1) + i * 0.45, 0.5);
        if (appear <= 0) return null;
        const x = 420 + i * 230 - walk * Math.max(0, t - at(c, 1) - i * 0.45) * 90;
        const op = clamp01(appear) * clamp01((x - 40) / 160);
        return (
          <g key={r} opacity={op}>
            <Silhouette x={x} y={980} s={0.95} walk={1} t={t + i} bag color="#4f5d78" />
            <Tag x={x} y={790} text={r} size={30} color={C.white} />
          </g>
        );
      })}
      {fog > 0 && (
        <g opacity={fog}>
          <rect x={0} y={0} width={1920} height={1080} fill="#eef2f8" opacity={0.55} />
          <FogQuestion x={640} y={430} s={1.1} t={t} />
          <g transform={`translate(640 760) scale(${0.85 + 0.15 * fog})`}>
            <rect x={-560} y={-62} width={1120} height={124} rx={62} fill={C.ink} />
            <text y={22} textAnchor="middle" fontFamily={FONTS.display} fontSize={64} fill={C.yellow}>
              Кто такой Джон Голт?
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

// Книга-фрагмент: оглавление части I, главы I–IX, последний лист оборван.
export const FragmentBook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const book = pop(t, 0.1);
  const list = ramp(t, at(c, 1), 1.6);
  const tear = ramp(t, at(c, 2), 0.8);
  const stamp = ramp(t, at(c, 2.4), 0.4);
  const ch = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
  return (
    <g>
      <g transform={`translate(${cx} 520) scale(${book})`}>
        <rect x={-430} y={-370} width={860} height={720} rx={30} fill="#000" opacity={0.1} transform="translate(10 14)" />
        <rect x={-430} y={-370} width={860} height={720} rx={30} fill="#fffdf6" stroke={OL} strokeWidth={6} />
        <rect x={-6} y={-370} width={12} height={720} fill="#e3dccb" />
        <text x={-215} y={-286} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={40} fill={C.ink}>
          Айн Рэнд
        </text>
        <text x={-215} y={-230} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={34} fill={C.inkSoft}>
          «Атлант
        </text>
        <text x={-215} y={-190} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={34} fill={C.inkSoft}>
          расправил плечи»
        </text>
        <g transform="translate(-215 -40)">
          <rect x={-170} y={-50} width={340} height={100} rx={20} fill={C.ink} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.yellow}>
            ЧАСТЬ I
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill="#d9deea">
            главы I–IX
          </text>
        </g>
        <text x={-215} y={140} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
          ознакомительный
        </text>
        <text x={-215} y={178} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
          фрагмент
        </text>
        {ch.map((n, i) => {
          const k = clamp01(list * 9 - i);
          const last = i === ch.length - 1;
          return (
            <g key={n} opacity={k} transform={`translate(${60 + (1 - k) * 30} ${-300 + i * 66})`}>
              <rect x={0} y={-26} width={last ? 330 * (1 - tear * 0.45) : 330} height={50} rx={12} fill={last ? "#ffe9c2" : "#eef3fa"} stroke={OL} strokeWidth={3} />
              <text x={20} y={10} fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.ink}>
                {`Глава ${n}`}
              </text>
              {last && tear > 0 && (
                <path d={`M ${330 * (1 - tear * 0.45)} -26 l -10 12 l 12 10 l -12 12 l 10 16`} fill="none" stroke={C.red} strokeWidth={4} />
              )}
            </g>
          );
        })}
        {tear > 0 && (
          <g opacity={tear} transform="translate(225 300)">
            <text textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.red}>
              текст обрывается
            </text>
          </g>
        )}
        {stamp > 0 && (
          <g transform={`translate(-215 250) rotate(-14) scale(${(2 - stamp) * 0.62})`} opacity={stamp}>
            <rect x={-300} y={-62} width={600} height={124} rx={18} fill="none" stroke={C.red} strokeWidth={10} />
            <text y={26} textAnchor="middle" fontFamily={FONTS.display} fontSize={74} fill={C.red}>
              ФРАГМЕНТ
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

// Трейлер: четыре кадра будущих сцен на «киноплёнке».
export const Trailer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const frames = [
    { b: 0.15, label: "красный семафор" },
    { b: 0.6, label: "новый металл" },
    { b: 1.05, label: "закон за 45 минут" },
    { b: 1.5, label: "мост" },
  ];
  const q = pop(t, at(c, 2));
  const pan = interpolate(t, [0, c.dur], [0, -60]);
  return (
    <g>
      <g transform={`translate(${pan} 0)`}>
        <rect x={40} y={210} width={1360} height={520} rx={20} fill="#2b3446" />
        {Array.from({ length: 22 }).map((_, i) => (
          <g key={i}>
            <rect x={60 + i * 62} y={226} width={30} height={22} rx={4} fill="#e8eef6" />
            <rect x={60 + i * 62} y={692} width={30} height={22} rx={4} fill="#e8eef6" />
          </g>
        ))}
        {frames.map((f, i) => {
          const k = pop(t, at(c, f.b));
          const x = 210 + i * 330;
          return (
            <g key={i} transform={`translate(${x} 470) scale(${0.3 + 0.7 * k})`} opacity={clamp01(k * 1.5)}>
              <rect x={-150} y={-190} width={300} height={380} rx={14} fill="#f4f7fb" />
              <svg x={-150} y={-190} width={300} height={380} viewBox="-150 -190 300 380" overflow="hidden">
                {i === 0 && (
                  <g>
                    <rect x={-150} y={-190} width={300} height={380} fill="#2d3a55" />
                    <Signal x={60} y={60} s={0.7} state="red" glow={0.6 + 0.4 * Math.sin(t * 5)} />
                    <Train x={-150} y={160} s={0.55} cars={1} lights t={0} />
                  </g>
                )}
                {i === 1 && (
                  <g>
                    <rect x={-150} y={-190} width={300} height={380} fill="#3a2f2a" />
                    <Ladle x={-10} y={-10} s={0.75} tilt={-20 + wob(t, 1, 3)} />
                    <path d={`M 70 -60 Q 90 40 60 190`} stroke="#fff3c4" strokeWidth={26} fill="none" strokeLinecap="round" />
                    {Array.from({ length: 8 }).map((_, j) => (
                      <circle key={j} cx={60 + Math.sin(t * 6 + j) * 60} cy={120 - ((t * 120 + j * 30) % 160)} r={4} fill="#ffd27a" />
                    ))}
                  </g>
                )}
                {i === 2 && (
                  <g>
                    <rect x={-150} y={-190} width={300} height={380} fill="#f3e6ec" />
                    <Doc x={0} y={10} s={0.65} title={"Закон\nсправедливой доли"} stamp="ПРИНЯТ" stampK={ramp(t, at(c, 1.3), 0.4)} />
                  </g>
                )}
                {i === 3 && (
                  <g>
                    <rect x={-150} y={-190} width={300} height={380} fill="#cfe7f6" />
                    <g transform="scale(0.32) translate(-960 -540)">
                      <Canyon y={620} gapA={640} gapB={1280} />
                      <Bridge x={640} y={600} w={640} />
                    </g>
                  </g>
                )}
              </svg>
              <rect x={-150} y={140} width={300} height={50} fill="#fff" opacity={0.9} />
              <text y={176} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.ink}>
                {f.label}
              </text>
            </g>
          );
        })}
      </g>
      {q > 0 && (
        <g transform={`translate(720 810) scale(${q})`}>
          <rect x={-420} y={-50} width={840} height={100} rx={50} fill={C.ink} />
          <text y={18} textAnchor="middle" fontFamily={FONTS.display} fontSize={48} fill={C.yellow}>
            Джон Голт: отговорка → вызов?
          </text>
        </g>
      )}
    </g>
  );
};

export const Hello: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const logo = pop(t, 0.2);
  const rule = pop(t, at(c, 1));
  const ruleOut = ramp(t, at(c, 2), 0.4);
  return (
    <g>
      <g transform={`translate(960 190) scale(${logo})`}>
        <rect x={-380} y={-70} width={760} height={140} rx={70} fill={BRAND.ink} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={76}>
          <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
          <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
        </text>
      </g>
      <Pop t={t} at={0.6} x={960} y={300}>
        <Txt x={0} y={0} size={38} weight={800} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </Pop>
      {rule > 0 && (
        <g opacity={1 - ruleOut * 0.4}>
          <g transform={`translate(420 560) scale(${rule}) rotate(${wob(t, 1, 1.5)})`}>
            <rect x={-300} y={-110} width={600} height={220} rx={30} fill={C.white} stroke={C.metal} strokeWidth={6} />
            <text y={-30} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={C.ink}>
              «герой утверждает»
            </text>
            <text y={20} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={C.ink}>
              «автор показывает»
            </text>
            <text y={74} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
              позиция книги
            </text>
          </g>
          <g transform={`translate(1500 560) scale(${rule}) rotate(${wob(t, 2, 1.5)})`}>
            <rect x={-300} y={-110} width={600} height={220} rx={30} fill={C.white} stroke={C.coral} strokeWidth={6} />
            <text y={-10} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={C.ink}>
              не доказанный
            </text>
            <text y={40} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={C.ink}>
              закон экономики
            </text>
          </g>
          <g transform={`translate(960 560) scale(${rule})`}>
            <circle r={48} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <text y={20} textAnchor="middle" fontFamily={FONTS.display} fontSize={56} fill={C.ink}>
              ≠
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const note = pop(t, 0.2) * (1 - ramp(t, at(c, 2) - 0.2, 0.5));
  const bye = pop(t, at(c, 2));
  const x = zoneX(c.p.host);
  return (
    <g>
      {note > 0 && (
        <g transform={`translate(${x} 420) scale(${note})`}>
          <rect x={-520} y={-170} width={1040} height={340} rx={36} fill="#fffdf6" stroke={C.metal} strokeWidth={8} />
          <text y={-80} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={C.ink}>
            Разобран только фрагмент
          </text>
          <text y={-20} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill={C.inkSoft}>
            часть I · главы I–IX (IX — частично)
          </text>
          <g transform="translate(0 80)">
            <rect x={-330} y={-40} width={660} height={80} rx={40} fill={C.ink} />
            <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.yellow}>
              продолжение — в полной книге
            </text>
          </g>
        </g>
      )}
      {bye > 0 && (
        <g>
          <g transform={`translate(${x} 330) scale(${bye})`}>
            <Txt x={0} y={0} size={92} weight={900}>
              Спасибо за внимание
            </Txt>
            <Txt x={0} y={70} size={40} weight={700} color={C.inkSoft}>
              до встречи в следующей книге
            </Txt>
          </g>
          <g transform="translate(1560 150)" opacity={bye}>
            <rect x={-330} y={-34} width={660} height={64} rx={32} fill={BRAND.ink} />
            <text x={-300} y={11} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34}>
              <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
              <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
            </text>
            <text x={300} y={9} textAnchor="end" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill="#d9deea">
              {BRAND.slogan}
            </text>
          </g>
          <Train x={interpolate(t, [at(c, 2), c.dur], [600, 1150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })} y={760} s={0.8} cars={3} t={t} color={C.metalDeep} />
          <Track x1={500} x2={1920} y={770} shift={t * 120} color={C.metal} />
        </g>
      )}
    </g>
  );
};

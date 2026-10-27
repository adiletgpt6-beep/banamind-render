// Реквизит Бюро невозможных доказательств BM-033 — собственный 2D-стиль BanaMind:
// дневник со строками, штамп «наблюдение / догадка / свидетельство», прозрачный
// лист показаний, телеграмма, газетная вырезка, фонограф с валиком, пишущая
// машинка, стопка листов, колба факта, лампа, стилизованная карта, ключ.
// Это образы фильма, не иллюстрации издания и не кадры экранизаций.
// Всё зависит только от времени сцены (без случайного шума).
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { clamp01, ease } from "./kit";
import { OL } from "./props";

// Штамп: падает сверху и «впечатывается» (scale 1.4 → 1), лёгкий поворот.
export const Stamp: React.FC<{ x: number; y: number; text: string; k: number; color?: string; rot?: number; size?: number }> = ({ x, y, text, k, color = C.wine, rot = -8, size = 34 }) => {
  if (k <= 0) return null;
  const s = 1.45 - 0.45 * ease(clamp01(k * 1.4));
  const w = text.length * size * 0.66 + size * 1.4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 2.2) * 0.92}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={10} fill="none" stroke={color} strokeWidth={6} />
      <rect x={-w / 2 + 8} y={-size * 0.95 + 8} width={w - 16} height={size * 1.9 - 16} rx={6} fill="none" stroke={color} strokeWidth={2} />
      <text y={size * 0.36} fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={color} textAnchor="middle" letterSpacing={2}>
        {text.toUpperCase()}
      </text>
    </g>
  );
};

// Раскрытый дневник: дата сверху, строки «пишутся» слева направо (k по строкам).
export const Diary: React.FC<{ x: number; y: number; s?: number; k: number; date?: string; title?: string; rows?: string[]; t: number; rowAt?: number[]; rot?: number }> = ({ x, y, s = 1, k, date, title, rows = [], t, rowAt = [], rot = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 1.4)}>
      <rect x={-372} y={-232} width={760} height={480} rx={18} fill="#24324a" opacity={0.14} />
      <rect x={-380} y={-245} width={760} height={480} rx={18} fill="#6b4524" stroke={OL} strokeWidth={4} />
      <path d="M -360 -228 Q -180 -246 -6 -224 L -6 222 Q -180 200 -360 218 Z" fill={C.paper} stroke={OL} strokeWidth={3} />
      <path d="M 6 -224 Q 180 -246 360 -228 L 360 218 Q 180 200 6 222 Z" fill={C.paper} stroke={OL} strokeWidth={3} />
      <line x1={0} y1={-232} x2={0} y2={226} stroke="#8a5a34" strokeWidth={6} />
      {title && (
        <text x={-183} y={-160} fontFamily={SERIF} fontWeight={700} fontSize={34} fill={C.ink} textAnchor="middle">
          {title}
        </text>
      )}
      {date && (
        <text x={183} y={-160} fontFamily={SERIF} fontWeight={700} fontStyle="italic" fontSize={34} fill={C.amber} textAnchor="middle">
          {date}
        </text>
      )}
      {/* «почерк»: волнистые строки на левой странице, затем — короткие фразы справа */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const kk = clamp01((t - 0.3 - i * 0.25) / 0.5) * k;
        const w = [270, 240, 285, 210, 260, 180][i];
        return (
          <path key={i} d={`M -330 ${-100 + i * 50} q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke={C.inkSoft} strokeWidth={3.4} opacity={0.55} strokeDasharray={w} strokeDashoffset={w * (1 - kk)} />
        );
      })}
      {rows.map((r, i) => {
        const rk = clamp01((t - (rowAt[i] ?? 0.4 + i * 0.5)) / 0.45);
        if (rk <= 0) return null;
        return (
          <text key={i} x={30} y={-90 + i * 62} fontFamily={SERIF} fontWeight={700} fontStyle="italic" fontSize={Math.min(32, 640 / Math.max(1, r.length))} fill={C.ink} opacity={rk}>
            {r}
          </text>
        );
      })}
    </g>
  );
};

// Прозрачный лист показаний: светлое «стекло», имя свидетеля сверху, точки-наблюдения.
export const Sheet: React.FC<{ x: number; y: number; w?: number; h?: number; k: number; who: string; color?: string; dots?: [number, number][]; rot?: number; note?: string }> = ({ x, y, w = 360, h = 460, k, who, color = C.amber, dots = [], rot = 0, note }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 50}) rotate(${rot})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={C.glass} opacity={0.62} stroke={color} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={58} rx={16} fill={color} opacity={0.92} />
      <text y={-h / 2 + 40} fontFamily={HEAVY} fontWeight={800} fontSize={30} fill={C.white} textAnchor="middle">
        {who}
      </text>
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={15} fill={color} stroke={OL} strokeWidth={2.5} opacity={clamp01(k * 2 - i * 0.2)} />
      ))}
      {note && (
        <text y={h / 2 - 28} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle">
          {note}
        </text>
      )}
    </g>
  );
};

// Телеграмма: узкая лента с текстом заглавными буквами.
export const Telegram: React.FC<{ x: number; y: number; k: number; text: string; rot?: number; s?: number }> = ({ x, y, k, text, rot = 0, s = 1 }) => {
  if (k <= 0) return null;
  const w = Math.max(320, text.length * 19 + 80);
  const shown = text.slice(0, Math.ceil(text.length * clamp01(k * 1.3)));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={8} fill="#f3e7c6" stroke={OL} strokeWidth={4} />
      <text y={-22} fontFamily={HEAVY} fontWeight={800} fontSize={22} fill={C.inkSoft} textAnchor="middle" letterSpacing={4}>
        ТЕЛЕГРАММА
      </text>
      <rect x={-w / 2 + 24} y={-4} width={w - 48} height={46} rx={4} fill="#fffaf0" stroke={OL} strokeWidth={1.5} strokeOpacity={0.4} />
      <text y={29} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={28} fill={C.ink} textAnchor="middle">
        {shown}
      </text>
    </g>
  );
};

// Газетная вырезка: заголовок и колонки-полосы.
export const Clipping: React.FC<{ x: number; y: number; k: number; head: string; sub?: string; rot?: number; s?: number }> = ({ x, y, k, head, sub, rot = 0, s = 1 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 1.5)}>
      <path d="M -230 -170 L 230 -176 L 236 170 L 214 160 L 190 174 L 160 162 L -226 176 Z" fill="#efe9da" stroke={OL} strokeWidth={4} />
      <text y={-112} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
        {head}
      </text>
      {sub && (
        <text y={-70} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.inkSoft} textAnchor="middle">
          {sub}
        </text>
      )}
      {[0, 1].map((c) =>
        [0, 1, 2, 3, 4].map((r) => <rect key={`${c}${r}`} x={-200 + c * 210} y={-40 + r * 36} width={c === 1 && r === 4 ? 100 : 190} height={12} rx={4} fill={C.inkSoft} opacity={0.35} />),
      )}
    </g>
  );
};

// Фонограф: валик крутится (полоски бегут), из рупора выходят волны.
export const Phonograph: React.FC<{ x: number; y: number; s?: number; k: number; t: number; play?: number }> = ({ x, y, s = 1, k, t, play = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) scale(${s})`} opacity={clamp01(k * 1.4)}>
      <rect x={-210} y={60} width={420} height={110} rx={12} fill="#8a5a34" stroke={OL} strokeWidth={5} />
      <rect x={-170} y={8} width={290} height={58} rx={29} fill={C.amber} stroke={OL} strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => {
        const ph = ((i / 9 + t * 0.6 * play) % 1 + 1) % 1;
        return <line key={i} x1={-150 + ph * 250} y1={14} x2={-150 + ph * 250} y2={60} stroke="#a8691c" strokeWidth={4} opacity={0.6} />;
      })}
      <path d="M 90 10 L 140 -90 L 170 -84 L 124 18 Z" fill={C.stoneDark} stroke={OL} strokeWidth={4} />
      <path d="M 140 -90 L 70 -290 Q 200 -330 320 -270 L 170 -84 Z" fill={C.gold} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={195} cy={-282} rx={128} ry={30} fill="#c9852a" stroke={OL} strokeWidth={5} transform="rotate(8 195 -282)" />
      {play > 0 &&
        [0, 1, 2].map((i) => {
          const ph = ((t * 0.8 + i / 3) % 1 + 1) % 1;
          const r = 70 + ph * 170;
          return <path key={i} d={`M ${195 + r * 0.3} ${-300 - r * 0.9} A ${r} ${r} 0 0 1 ${195 + r * 0.95} ${-300 - r * 0.2}`} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" opacity={(1 - ph) * play} />;
        })}
    </g>
  );
};

// Пишущая машинка: лист поднимается по мере «печати» (k), строки появляются.
export const Typewriter: React.FC<{ x: number; y: number; s?: number; k: number; typed: number; rows?: string[] }> = ({ x, y, s = 1, k, typed, rows = [] }) => {
  if (k <= 0) return null;
  const lift = clamp01(typed) * 70;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) scale(${s})`} opacity={clamp01(k * 1.4)}>
      <rect x={-160} y={-250 - lift} width={320} height={250} rx={6} fill={C.cream} stroke={OL} strokeWidth={4} />
      {rows.map((r, i) => {
        const rk = clamp01(typed * rows.length - i);
        if (rk <= 0) return null;
        const shown = r.slice(0, Math.ceil(r.length * rk));
        return (
          <text key={i} x={-136} y={-205 - lift + i * 38} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={25} fill={C.ink}>
            {shown}
          </text>
        );
      })}
      <rect x={-250} y={-20} width={500} height={56} rx={26} fill={C.stoneDark} stroke={OL} strokeWidth={5} />
      <path d="M -270 230 L -215 30 L 215 30 L 270 230 Z" fill={C.ink} stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((r) =>
        Array.from({ length: 8 - r }).map((_, i) => (
          <circle key={`${r}-${i}`} cx={-175 + r * 25 + i * 50} cy={90 + r * 50} r={17} fill={C.paper} stroke={OL} strokeWidth={2.5} />
        )),
      )}
    </g>
  );
};

// Стопка листов, которые складываются по датам: n — сколько уже легло.
export const Stack: React.FC<{ x: number; y: number; n: number; total: number; labels?: string[]; color?: string }> = ({ x, y, n, total, labels = [], color = C.amber }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: total }).map((_, i) => {
      const k = clamp01(n - i);
      if (k <= 0) return null;
      const yy = -i * 16 - (1 - ease(k)) * 220;
      return (
        <g key={i} transform={`translate(${(i % 2 ? 6 : -6) * (1 - k)} ${yy}) rotate(${(i % 3) - 1})`} opacity={clamp01(k * 2)}>
          <rect x={-200} y={-20} width={400} height={30} rx={4} fill={i % 2 ? C.cream : C.paper} stroke={OL} strokeWidth={3} />
          <rect x={-200} y={-20} width={14} height={30} fill={color} />
          {labels[i] && (
            <text x={-172} y={3} fontFamily={FONT} fontWeight={800} fontSize={18} fill={C.inkSoft}>
              {labels[i]}
            </text>
          )}
        </g>
      );
    })}
  </g>
);

// Колба факта: прозрачный сосуд, внутри светящийся «факт» (уровень level 0…1).
export const Flask: React.FC<{ x: number; y: number; s?: number; k: number; level: number; color?: string; label?: string; t: number }> = ({ x, y, s = 1, k, level, color = C.teal, label, t }) => {
  if (k <= 0) return null;
  const lv = clamp01(level);
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) scale(${s})`} opacity={clamp01(k * 1.4)}>
      <defs>
        <clipPath id={`flask-${Math.round(x)}-${Math.round(y)}`}>
          <path d="M -40 -200 L -40 -90 L -150 130 Q -160 160 -130 160 L 130 160 Q 160 160 150 130 L 40 -90 L 40 -200 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flask-${Math.round(x)}-${Math.round(y)})`}>
        <rect x={-170} y={160 - lv * 300} width={340} height={lv * 300 + 10} fill={color} opacity={0.85} />
        {[0, 1, 2, 3].map((i) => {
          const ph = ((t * 0.4 + i / 4) % 1 + 1) % 1;
          return <circle key={i} cx={-60 + i * 40} cy={150 - ph * lv * 280} r={8 + i * 2} fill="#fff" opacity={0.6 * (1 - ph) * lv} />;
        })}
      </g>
      <path d="M -40 -200 L -40 -90 L -150 130 Q -160 160 -130 160 L 130 160 Q 160 160 150 130 L 40 -90 L 40 -200 Z" fill={C.glass} fillOpacity={0.25} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-56} y={-222} width={112} height={26} rx={8} fill={C.stoneDark} stroke={OL} strokeWidth={4} />
      <path d="M -24 -170 L -24 -110" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
      {label && (
        <g transform="translate(0 214)">
          <rect x={-label.length * 9.5 - 26} y={-28} width={label.length * 19 + 52} height={54} rx={27} fill={C.white} stroke={OL} strokeWidth={3} />
          <text y={10} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// Настольная лампа Бюро: тёплый конус света.
export const Lamp: React.FC<{ x: number; y: number; s?: number; k: number; t: number }> = ({ x, y, s = 1, k, t }) => {
  if (k <= 0) return null;
  const fl = 0.85 + 0.15 * Math.sin(t * 3.1) * Math.sin(t * 1.7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(k * 1.4)}>
      <path d="M -60 -140 L -330 260 L 330 260 L 60 -140 Z" fill="#ffe6a8" opacity={0.18 * fl} />
      <rect x={-90} y={240} width={180} height={30} rx={10} fill="#6b4524" stroke={OL} strokeWidth={4} />
      <path d="M 0 240 L 0 -60" stroke={C.stoneDark} strokeWidth={14} strokeLinecap="round" />
      <path d="M -100 -100 Q 0 -230 100 -100 Z" fill={C.tealDeep} stroke={OL} strokeWidth={5} />
      <circle cx={0} cy={-100} r={26} fill="#fff3c4" opacity={fl} />
    </g>
  );
};

// Ключ (замок закрыт/открыт).
export const Key: React.FC<{ x: number; y: number; s?: number; k: number; rot?: number; color?: string }> = ({ x, y, s = 1, k, rot = 0, color = C.gold }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 1.6)}>
      <circle r={36} fill="none" stroke={color} strokeWidth={14} />
      <rect x={30} y={-8} width={120} height={16} rx={6} fill={color} />
      <rect x={118} y={8} width={14} height={30} fill={color} />
      <rect x={92} y={8} width={14} height={22} fill={color} />
    </g>
  );
};

// Замочная скважина на табличке — «закрытая дверь».
export const Lock: React.FC<{ x: number; y: number; s?: number; k: number; open?: number; label?: string }> = ({ x, y, s = 1, k, open = 0, label }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30}) scale(${s})`} opacity={clamp01(k * 1.5)}>
      <rect x={-70} y={-110} width={140} height={210} rx={20} fill="#7b5634" stroke={OL} strokeWidth={5} />
      <path d={`M -40 -110 L -40 ${-150 - open * 30} Q 0 ${-200 - open * 30} 40 ${-150 - open * 30} L 40 -110`} fill="none" stroke={C.stone} strokeWidth={14} />
      <circle cx={0} cy={-20} r={24} fill={C.ink} />
      <path d="M -14 -6 L -22 50 L 22 50 L 14 -6 Z" fill={C.ink} />
      {label && (
        <text y={150} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.white} textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  );
};

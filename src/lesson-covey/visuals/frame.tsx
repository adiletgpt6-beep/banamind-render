// Рамка фильма: Этика Характера и «пластырь», карта не того города, «одна картинка —
// двое очков», навык = знание + умение + желание, ось зрелости «ты → я → мы»,
// гусыня и золотые яйца (Р/РС-баланс). Образы — собственные схемы BanaMind по тексту книги.
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, OL, Person } from "./draw";
import { Appear, area, Arrow, at, clamp01, Drift, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

// Весы общего назначения: tilt −1…1 (+ — правая чаша ниже).
export const Balance: React.FC<{ x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ x, y, s = 1, tilt, left, right }) => {
  const a = (tilt * 12 * Math.PI) / 180;
  const lx = -260 * Math.cos(a);
  const ly = -260 * Math.sin(a);
  const pan = (px: number, py: number, content: React.ReactNode) => (
    <g transform={`translate(${px} ${py})`}>
      <path d="M 0 0 L -90 140 M 0 0 L 90 140" stroke={C.goldDeep} strokeWidth={4} />
      <path d="M -120 140 Q 0 200 120 140 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
      <g transform="translate(0 138)">{content}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={0} width={24} height={360} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
      <path d="M -110 380 Q 0 344 110 380 L 128 404 L -128 404 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
      <circle r={22} fill={C.gold} stroke={OL} strokeWidth={5} />
      <line x1={lx} y1={ly} x2={-lx} y2={-ly} stroke={C.goldDeep} strokeWidth={16} strokeLinecap="round" />
      {pan(lx, ly, left)}
      {pan(-lx, -ly, right)}
    </g>
  );
};

// ───────────── пластырь против характера ─────────────
export const Plaster: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const crack = clamp01(ramp(t, 0.3, 1.4) + ramp(t, b1 + 0.8, 1.6) * 0.6);
  const field = ramp(t, b2, 1.2);
  const grow = ramp(t, b2 + 1.2, 3);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <g opacity={1 - field} transform={`translate(${cx - 300} ${170 - field * 40})`}>
        <rect x={0} y={0} width={600} height={360} rx={16} fill="#e9dcc4" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 6 }).map((__, c) => <rect key={`${r}-${c}`} x={10 + c * 98 + (r % 2) * 49 - 49} y={10 + r * 70} width={92} height={62} rx={6} fill="#f3e8d3" stroke="#cdbb98" strokeWidth={3} />),
        )}
        <path d={`M 300 0 L 280 ${60 * crack} L 330 ${130 * crack} L 290 ${210 * crack} L 340 ${290 * crack} L 310 ${360 * crack}`} stroke={OL} strokeWidth={9} fill="none" strokeLinecap="round" />
        {["улыбка", "приём", "уверенный тон"].map((lbl, i) => {
          const k = ramp(t, 0.8 + i * 0.6, 0.4);
          if (k <= 0) return null;
          return (
            <g key={lbl} transform={`translate(${305 + (i - 1) * 10} ${80 + i * 100}) rotate(${-18 + i * 14}) scale(${k})`}>
              <rect x={-110} y={-30} width={220} height={60} rx={20} fill="#ffd2b0" stroke={OL} strokeWidth={4} />
              <rect x={-40} y={-24} width={80} height={48} rx={8} fill="#f5b993" />
              <text y={10} fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink} textAnchor="middle">
                {lbl}
              </text>
            </g>
          );
        })}
      </g>
      <g opacity={1 - field}>
        <Appear t={t} at={b1} x={cx} y={600}>
          <Label x={-170} y={0} text="«социальный аспирин»" size={30} bg={C.coralSoft} />
          <Label x={210} y={0} text="вторично" size={30} bg={C.white} />
        </Appear>
      </g>
      {field > 0 && (
        <g transform={`translate(${cx} 760)`} opacity={field}>
          <rect x={-520} y={-30} width={1040} height={110} rx={30} fill="#a8764a" stroke={OL} strokeWidth={5} />
          {["честность", "терпение", "слово", "труд"].map((lbl, i) => {
            const x = -390 + i * 260;
            const h = 30 + grow * 150;
            return (
              <g key={lbl} transform={`translate(${x} -30)`}>
                <path d={`M 0 0 Q ${wob(t, i, 6)} ${-h / 2} 0 ${-h}`} stroke={C.grassDeep} strokeWidth={10} fill="none" strokeLinecap="round" />
                <ellipse cx={-24} cy={-h * 0.6} rx={26} ry={12} fill={C.grass} stroke={OL} strokeWidth={3} transform={`rotate(-30 -24 ${-h * 0.6})`} />
                <ellipse cx={24} cy={-h * 0.8} rx={26} ry={12} fill={C.grass} stroke={OL} strokeWidth={3} transform={`rotate(30 24 ${-h * 0.8})`} />
                {grow > 0.85 && <circle cx={0} cy={-h - 14} r={18 * clamp01((grow - 0.85) * 7)} fill={C.sun} stroke={OL} strokeWidth={3} />}
                <Txt x={0} y={66} size={28} color={C.white} weight={900}>
                  {lbl}
                </Txt>
              </g>
            );
          })}
          <Label x={0} y={-330} text="закон урожая: сначала посеять" size={32} bg={C.tealSoft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── карта не того города ─────────────
export const MapScene: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const speed = ramp(t, b1, 0.8);
  const carX = cx - 360 + ((t * (40 + speed * 140)) % 760);
  const head = ramp(t, b2, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <g opacity={1 - head}>
        <rect x={cx - 520} y={560} width={1040} height={120} rx={60} fill="#5c6b8f" stroke={OL} strokeWidth={5} />
        <line x1={cx - 480} y1={620} x2={cx + 480} y2={620} stroke="#fff" strokeWidth={7} strokeDasharray="40 30" strokeDashoffset={-t * (60 + speed * 400)} />
        <g transform={`translate(${cx + 400} 470)`}>
          <rect x={-8} y={0} width={16} height={100} fill="#8a93b5" stroke={OL} strokeWidth={3} />
          <path d="M -150 -50 L 90 -50 L 130 -20 L 90 10 L -150 10 Z" fill={C.green} stroke={OL} strokeWidth={4} transform="scale(-1 1)" />
          <text x={10} y={-10} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff" textAnchor="middle">
            ← Чикаго
          </text>
        </g>
        <g transform={`translate(${carX} 590)`}>
          {speed > 0.3 && [0, 1, 2].map((i) => <line key={i} x1={-120 - i * 10} y1={-20 + i * 18} x2={-200 - i * 20} y2={-20 + i * 18} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={speed * 0.8} />)}
          <path d="M -90 10 L -80 -30 Q -60 -60 -10 -60 L 40 -60 Q 70 -60 85 -30 L 100 10 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-60} y={-52} width={60} height={26} rx={6} fill={C.sky} stroke={OL} strokeWidth={3} />
          <circle cx={-50} cy={14} r={18} fill={OL} />
          <circle cx={60} cy={14} r={18} fill={OL} />
        </g>
        <Appear t={t} at={0.4} x={cx - 140} y={300}>
          <g transform={`rotate(${-4 + wob(t, 1, 1)})`}>
            <path d="M -220 -140 L -70 -160 L 70 -140 L 220 -160 L 220 140 L 70 160 L -70 140 L -220 160 Z" fill={C.paper} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -70 -160 L -70 140 M 70 -140 L 70 160" stroke="#d9c9a8" strokeWidth={4} />
            <path d="M -180 60 Q -100 -60 0 20 Q 90 90 180 -60" stroke={C.skyDeep} strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M -150 -90 L 160 100 M -160 100 L 140 -100" stroke="#c9b48c" strokeWidth={6} />
            <rect x={-120} y={-150} width={240} height={56} rx={14} fill={C.white} stroke={OL} strokeWidth={4} />
            <text y={-112} fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink} textAnchor="middle">
              Детройт
            </text>
          </g>
        </Appear>
        <Appear t={t} at={b1 + 0.6} x={cx + 250} y={250}>
          <Label x={0} y={0} text="быстрее" size={32} bg={C.white} />
          <Label x={0} y={80} text="бодрее" size={32} bg={C.white} />
          <Label x={0} y={170} text="всё равно не туда" size={32} bg={C.coralSoft} />
        </Appear>
      </g>
      {head > 0 && (
        <g transform={`translate(${cx} 470) scale(${0.85 + 0.15 * head})`} opacity={head}>
          <path d="M -150 230 Q -160 120 -120 60 Q -170 -20 -120 -110 Q -60 -200 40 -190 Q 160 -180 180 -60 Q 190 0 160 40 L 190 100 L 150 110 L 150 170 Q 100 200 40 190 L 40 230 Z" fill={C.white} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <g transform="translate(20 -40) scale(0.45) rotate(-4)">
            <path d="M -220 -140 L -70 -160 L 70 -140 L 220 -160 L 220 140 L 70 160 L -70 140 L -220 160 Z" fill={C.paper} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
            <path d="M -180 60 Q -100 -60 0 20 Q 90 90 180 -60" stroke={C.skyDeep} strokeWidth={16} fill="none" strokeLinecap="round" />
          </g>
          <Label x={10} y={300} text="парадигма — карта в голове" size={34} bg={C.violetSoft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── одна картинка — двое очков; метро ─────────────
const Glasses: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-20} cy={0} r={17} fill={color} opacity={0.55} stroke={OL} strokeWidth={4} />
    <circle cx={20} cy={0} r={17} fill={color} opacity={0.55} stroke={OL} strokeWidth={4} />
    <path d="M -3 0 L 3 0" stroke={OL} strokeWidth={4} />
  </g>
);

export const GlassesView: React.FC<VisualProps<{ host?: string; mode?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const metro = ramp(t, b1 - 0.2, 0.7);
  const shift = ramp(t, at(ctx, 1.75), 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <g opacity={1 - metro}>
        <g transform={`translate(${cx} 320)`}>
          <rect x={-150} y={-150} width={300} height={300} rx={20} fill={C.paper} stroke={OL} strokeWidth={6} />
          <rect x={-130} y={-130} width={260} height={260} rx={12} fill="#fff" stroke="#d9c9a8" strokeWidth={4} />
          <path d="M -60 90 Q -90 0 -40 -60 Q 10 -110 60 -50 Q 90 0 60 80 M -20 -10 Q 10 -30 40 0 M -80 40 Q -30 20 -20 70" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
          <text y={-170} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.white} textAnchor="middle">
            одна и та же картинка
          </text>
        </g>
        <Person who="dina" x={cx - 340} y={880} s={0.72} t={t} pose="point" mood="happy" />
        <Glasses x={cx - 340} y={880 - 0.72 * 1.12 * (150 + 168 + 44)} color={C.sun} s={0.9} />
        <Person who="man" x={cx + 340} y={880} s={0.72} t={t} pose="point" mood="happy" flip />
        <Glasses x={cx + 340} y={880 - 0.72 * 1.12 * (150 + 168 + 44)} color={C.violet} s={0.9} />
        <Appear t={t} at={0.9} x={0} y={0}>
          <Bubble x={cx - 330} y={360} text={"молодая\nженщина!"} w={260} size={30} />
          <Bubble x={cx + 330} y={360} text={"пожилая\nженщина!"} w={260} size={30} />
        </Appear>
      </g>
      {metro > 0 && (
        <g opacity={metro}>
          <rect x={cx - 560} y={180} width={1120} height={560} rx={60} fill="#dfe7f5" stroke={OL} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={cx - 480 + i * 340} y={230} width={260} height={150} rx={30} fill={C.sky} stroke={OL} strokeWidth={5} />
          ))}
          <rect x={cx - 520} y={600} width={1040} height={60} rx={20} fill="#9aa6c4" stroke={OL} strokeWidth={4} />
          <Person who="man" x={cx - 300} y={660} s={0.6} t={t} pose="sit" mood={shift > 0.5 ? "sad" : "neutral"} />
          {[0, 1].map((i) => (
            <Person key={i} who="kid" x={cx - 60 + i * 140} y={720 - Math.abs(Math.sin(t * 5 + i * 2)) * 30 * (1 - shift)} s={0.7} t={t} pose={shift > 0.5 ? "stand" : "wave"} mood={shift > 0.5 ? "sad" : "happy"} seed={i} />
          ))}
          <Person who="marat" x={cx + 360} y={660} s={0.6} t={t} pose="sit" mood={shift > 0.5 ? "sad" : "angry"} flip />
          {shift < 0.5 && t > b1 + 0.6 && <Bubble x={cx + 360} y={250} text="Ну сколько можно!" w={340} size={30} bg={C.coralSoft} />}
          {shift > 0.5 && (
            <Pop t={t} at={at(ctx, 1.75) + 0.3} x={cx + 360} y={290}>
              <Icon name="heart" x={0} y={0} s={1.6} color={C.rose} />
            </Pop>
          )}
        </g>
      )}
      <Appear t={t} at={b2} x={cx} y={830}>
        <Label x={0} y={0} text="факты те же · другая карта → другое поведение" size={30} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// ───────────── навык = три круга ─────────────
export const Venn: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const cy = 450;
  const b1 = at(ctx, 1);
  const away = clamp01(ramp(t, b1 + 0.3, 0.7) - ramp(t, b1 + 2.4, 0.8));
  const items = [
    { label: "Знание", sub: "что? зачем?", color: "#3d8bff", dx: 0, dy: -110 },
    { label: "Умение", sub: "как?", color: "#ff8a3d", dx: -125, dy: 100 },
    { label: "Желание", sub: "хочу!", color: "#2fbf71", dx: 125, dy: 100 },
  ];
  const core = clamp01(ramp(t, at(ctx, 0.85), 0.6) - away);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy}>
      {items.map((it, i) => {
        const k = ramp(t, 0.3 + i * 0.9, 0.6);
        const ox = i === 2 ? away * 260 : 0;
        return (
          <g key={it.label} opacity={k} transform={`translate(${cx + it.dx * (0.6 + 0.4 * k) + ox} ${cy + it.dy * (0.6 + 0.4 * k)})`}>
            <circle r={190} fill={it.color} opacity={0.32} stroke={OL} strokeWidth={5} />
            <g transform={`translate(${it.dx * 0.55} ${it.dy * 0.6})`}>
              <Txt x={0} y={0} size={40} weight={900}>
                {it.label}
              </Txt>
              <Txt x={0} y={44} size={28} color={C.inkSoft}>
                {it.sub}
              </Txt>
            </g>
          </g>
        );
      })}
      {core > 0 && (
        <g transform={`translate(${cx} ${cy + 28})`} opacity={core}>
          <circle r={64} fill={C.sun} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={12} size={32} weight={900}>
            навык
          </Txt>
        </g>
      )}
      <Appear t={t} at={b1 + 0.6} x={cx} y={830}>
        <g opacity={away}>
          <Label x={0} y={0} text="без одного круга привычка не складывается" size={30} bg={C.coralSoft} />
        </g>
      </Appear>
      <Appear t={t} at={b1 + 2.6} x={cx} y={830}>
        <Label x={0} y={0} text="нужна тренировка, а не только вдохновение" size={30} bg={C.tealSoft} />
      </Appear>
    </Drift>
  );
};

// ───────────── ось зрелости ─────────────
export const Maturity: React.FC<VisualProps<{ host?: string; mode?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0 + 70;
  const w = A.x1 - A.x0 - 140;
  const steps = [
    { word: "ты", name: "зависимость", sub: "«ты виноват»", color: C.coral },
    { word: "я", name: "независимость", sub: "«я могу сам»", color: "#3d8bff" },
    { word: "мы", name: "взаимозависимость", sub: "«вместе — больше»", color: C.teal },
  ];
  const bridge = p.mode === "bridge";
  const b1 = at(ctx, 1);
  const sw = w / 3;
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={520}>
      {steps.map((s, i) => {
        const k = bridge ? 1 : ramp(t, i < 2 ? 0.4 + i * 1.6 : b1, 0.6);
        const sx = x0 + i * sw;
        const bh = 150 + i * 140;
        const sy = 830 - bh;
        const hot = bridge ? (i === 2 ? 1 : 0.45) : 1;
        return (
          <g key={s.word} opacity={k * hot}>
            <rect x={sx} y={sy} width={sw - 18} height={bh} rx={24} fill={s.color} stroke={OL} strokeWidth={5} />
            <text x={sx + (sw - 18) / 2} y={sy + bh / 2 + 30} fontFamily={DISPLAY} fontWeight={800} fontSize={84} fill={C.white} textAnchor="middle">
              {s.word}
            </text>
            <Txt x={sx + (sw - 18) / 2} y={sy - 58} size={32} weight={900} color={C.white}>
              {s.name}
            </Txt>
            <Txt x={sx + (sw - 18) / 2} y={sy - 18} size={26} color={C.white}>
              {s.sub}
            </Txt>
          </g>
        );
      })}
      {!bridge && (
        <g>
          <Appear t={t} at={b1 + 1.2} x={x0 + sw} y={240}>
            <Label x={0} y={0} text="навыки 1–3 · личная победа" size={26} bg={C.paper} />
          </Appear>
          <Appear t={t} at={b1 + 2.4} x={x0 + 2.35 * sw} y={160}>
            <Label x={0} y={0} text="навыки 4–6 · общая победа" size={26} bg={C.paper} />
          </Appear>
          <Appear t={t} at={b1 + 3.6} x={x0 + sw * 0.9} y={330}>
            <Label x={0} y={0} text="навык 7 · обновление всех шести" size={26} bg={HABIT[7].soft} />
          </Appear>
        </g>
      )}
      {bridge && (
        <g>
          <Arrow x1={x0 + sw * 1.5} y1={500} x2={x0 + sw * 2.3} y2={370} k={ramp(t, 0.6, 0.8)} color={C.white} w={12} bend={0.2} />
          <Appear t={t} at={b1} x={x0 + sw * 2.45} y={250}>
            <Label x={0} y={0} text="сначала личная, потом общая" size={28} bg={C.tealSoft} />
          </Appear>
          <Appear t={t} at={b1 + 1.6} x={x0 + sw * 0.9} y={330}>
            <Label x={0} y={0} text="поступки ≠ слова" size={30} bg={C.white} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ───────────── гусыня и золотые яйца ─────────────
const Goose: React.FC<{ x: number; y: number; s?: number; t: number; mood?: "ok" | "gone" }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 2) * 2})`}>
    <ellipse cx={0} cy={-70} rx={120} ry={80} fill="#fff" stroke={OL} strokeWidth={5} />
    <path d="M 60 -110 Q 90 -200 60 -240 Q 40 -270 70 -280 Q 110 -290 110 -250 Q 100 -200 110 -140" fill="#fff" stroke={OL} strokeWidth={5} />
    <path d="M 108 -268 L 150 -258 L 108 -248 Z" fill={C.sunDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={90} cy={-262} r={5} fill={OL} />
    <path d="M -100 -70 Q -40 -20 40 -60" stroke="#dfe5f0" strokeWidth={8} fill="none" />
    <path d="M -30 8 L -30 30 L -50 34 M 20 8 L 20 30 L 0 34" stroke={C.sunDeep} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

const Egg: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={30} ry={38} fill={C.gold} stroke={OL} strokeWidth={4} />
    <ellipse cx={-9} cy={-12} rx={8} ry={12} fill="#fff" opacity={0.6} />
  </g>
);

export const GooseScene: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const greed = ramp(t, at(ctx, 0.55), 0.6);
  const gone = ramp(t, at(ctx, 0.8), 0.5);
  const scale = ramp(t, b1, 0.8);
  const frame = ramp(t, b2, 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <g opacity={1 - scale}>
        <g opacity={1 - gone}>
          <Goose x={cx - 120} y={700} s={0.9} t={t} />
        </g>
        {gone > 0 && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={cx - 120 + Math.cos(i * 1.3) * 140 * gone} cy={560 + Math.sin(i * 1.3) * 100 * gone} r={30 * (1 - gone) + 8} fill="#fff" opacity={1 - gone} />)}
        {[0, 1, 2].map((i) => {
          const k = ramp(t, 0.5 + i * 0.5, 0.4);
          return k > 0 ? <Egg key={i} x={cx + 80 + i * 80} y={760} s={k} /> : null;
        })}
        <Person who="man" x={cx + 340} y={860} s={0.7} t={t} pose={greed > 0.5 ? "open" : "stand"} mood={gone > 0.5 ? "shock" : greed > 0.5 ? "tense" : "happy"} flip />
        {greed > 0.3 && gone < 0.5 && <Bubble x={cx + 300} y={380} text="Все яйца сразу!" w={300} size={30} />}
        {gone > 0.5 && <Bubble x={cx + 300} y={380} text="…ни гусыни, ни яиц" w={330} size={28} bg={C.coralSoft} />}
      </g>
      {scale > 0 && (
        <g opacity={scale * (1 - frame * 0.7)}>
          <Balance x={cx} y={300} s={0.8} tilt={Math.sin(t * 1.2) * 0.15} left={<Egg x={0} y={-30} s={1.1} />} right={<Goose x={0} y={-6} s={0.22} t={t} />} />
          <Label x={cx - 210} y={240} text="Р — результат" size={30} bg={C.paper} />
          <Label x={cx + 210} y={240} text="РС — способность" size={30} bg={C.paper} />
          <Appear t={t} at={b1 + 2.4} x={cx} y={830}>
            <Label x={0} y={0} text="суп + вода: сегодня экономия, завтра — пустой зал" size={28} bg={C.coralSoft} />
          </Appear>
        </g>
      )}
      {frame > 0 && (
        <g transform={`translate(${cx} 470) scale(${0.8 + 0.2 * frame})`} opacity={frame}>
          <Card x={0} y={0} w={760} h={250} color={C.violet} title="Кови предлагает рамку" lines={["а не семь доказанных законов природы", "проверим её на одном дне"]} size={34} titleSize={44} />
        </g>
      )}
    </Drift>
  );
};


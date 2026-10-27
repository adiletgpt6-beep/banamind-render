// Сцены 1–4 одним непрерывным планом: условная карта Бишкека (горы
// Ала-Тоо, тополя, кварталы) с точкой МЕКТЕП и тремя жёлтыми маршрутами до
// домов на 7, 12 и 20 км. Камера плавно переезжает от общего плана к
// каждому маршруту; белая машина BalaGo едет үй → мектеп → үй; подпись
// «7 км» превращается в ценник; границы 7 и 12 км подсвечиваются; за 20 км —
// серый пунктир и знак «азырынча тейленбейт».
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { CarTop, easeInOut, easeOut, House, Mountains, NAVY, NAVY_SOFT, Pin, popScale, Poplar, prog, ROAD, School, YELLOW } from "../art";
import type { Bg32Beats } from "../beats";
import { BG32_TEXT, BG32_TIERS } from "../script";

const T = BG32_TEXT;
// мир = экран 1080×1920 при масштабе 1
const SX = 200; // точка «0 км» — ворота школы
const SY = 1080;
const PX = 38; // пикселей на километр
export const kmX = (km: number) => SX + km * PX;
const RULER_Y = 1372;

const LANES = BG32_TIERS.map((t, i) => {
  const y = [880, 1080, 1280][i];
  const xEnd = kmX(t.toKm);
  const d = y === SY ? `M ${SX} ${SY} L ${xEnd} ${SY}` : `M ${SX} ${SY} C ${SX + 50} ${SY} ${SX + 40} ${y} ${SX + 90} ${y} L ${xEnd} ${y}`;
  const len = getLength(d);
  // длина пути до отметки km (последний участок горизонтальный)
  const lenAt = (km: number) => len - (xEnd - kmX(km));
  return { ...t, y, xEnd, d, len, lenAt };
});

type Cam = { fx: number; fy: number; s: number };
const lerpCam = (a: Cam, b: Cam, u: number): Cam => ({ fx: a.fx + (b.fx - a.fx) * u, fy: a.fy + (b.fy - a.fy) * u, s: a.s + (b.s - a.s) * u });

const CAM = {
  start: { fx: 300, fy: 1080, s: 1.55 },
  overview: { fx: 560, fy: 1085, s: 1.0 },
  t1: { fx: 320, fy: 985, s: 1.62 },
  t2: { fx: 425, fy: 1075, s: 1.32 },
  t3: { fx: 575, fy: 1095, s: 1.0 },
  out: { fx: 900, fy: 1240, s: 2.4 },
};

const camera = (t: number, b: Bg32Beats): Cam => {
  if (t < b.t1.from) return lerpCam(CAM.start, CAM.overview, easeInOut(prog(t, b.hook.pull, 2.2)));
  if (t < b.t2.from) return lerpCam(CAM.overview, CAM.t1, easeInOut(prog(t, b.t1.from, 1.0)));
  if (t < b.t3.from) return lerpCam(CAM.t1, CAM.t2, easeInOut(prog(t, b.t2.from, 1.0)));
  const c = lerpCam(CAM.t2, CAM.t3, easeInOut(prog(t, b.t3.from, 1.0)));
  return lerpCam(c, CAM.out, easeInOut(prog(t, b.t3.to - 0.55, 0.55)));
};

// положение машины на маршруте: 1 — у дома, 0 — у школы
const carU = (t: number, d: { go: number; arrive: number; back: number; home: number }) => {
  if (t < d.go) return { u: 1, toSchool: true };
  if (t < d.arrive) return { u: 1 - easeInOut((t - d.go) / (d.arrive - d.go)), toSchool: true };
  if (t < d.back) return { u: 0, toSchool: false };
  return { u: easeInOut((t - d.back) / (d.home - d.back)), toSchool: false };
};

const Car: React.FC<{ lane: (typeof LANES)[number]; t: number; d: { go: number; arrive: number; back: number; home: number } }> = ({ lane, t, d }) => {
  const { u, toSchool } = carU(t, d);
  const L = Math.max(0.5, Math.min(lane.len - 0.5, u * lane.len));
  const p = getPointAtLength(lane.d, L)!;
  const tg = getTangentAtLength(lane.d, L)!;
  let ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
  if (toSchool) ang += 180;
  // машина стоит у дома/школы чуть в стороне от пина
  return <CarTop x={p.x} y={p.y} angle={ang} scale={0.9} />;
};

export const MapStory: React.FC<{ readonly t: number; readonly b: Bg32Beats }> = ({ t, b }) => {
  const cam = camera(t, b);
  const active = t < b.t1.from ? -1 : t < b.t2.from ? 0 : t < b.t3.from ? 1 : 2;
  const inHook = active < 0;

  // уровень «подсветки» каждого маршрута
  const laneAlpha = (i: number) => (inHook || active === i ? 1 : 0.32);
  const drawn = (i: number) => easeOut(prog(t, b.hook.lines[i], 1.1));

  // пульс подписей в хуке
  const pulse = (i: number) => 1 + 0.07 * Math.sin((t - b.hook.pills[i]) * 7) * (inHook ? 1 : 0);

  // граница, которую подсвечиваем в текущей сцене
  const boundaryGlow = (km: number) => {
    if (km === 7 && active === 0) return prog(t, b.t1.range, 0.4);
    if (km === 7 && active === 1) return prog(t, b.t2.grow, 0.4);
    if (km === 12 && active === 1) return prog(t, b.t2.range, 0.4);
    if (km === 12 && active === 2) return prog(t, b.t3.grow, 0.4);
    if (km === 20 && active === 2) return prog(t, b.t3.range, 0.4);
    return 0;
  };

  const tr = `translate(${540 - cam.fx * cam.s} ${1080 - cam.fy * cam.s}) scale(${cam.s})`;
  const fadeOut = 1 - prog(t, b.t3.to - 0.35, 0.35);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: fadeOut }}>
      <defs>
        <linearGradient id="bg32sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAF2FD" />
          <stop offset="0.45" stopColor="#F8FAFD" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bg32sky)" />
      <g transform={tr}>
        {/* горы Ала-Тоо — Бишкек узнаваем по горизонту */}
        <Mountains width={1080} y={610} shift={-(cam.fx - 560) * 0.15} />
        <rect x={-600} y={758} width={2400} height={1400} fill="#FFFFFF" />
        {/* кварталы и улицы */}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`v${i}`} d={`M ${60 + i * 125} 770 L ${60 + i * 125} 2100`} stroke="#EEF2F7" strokeWidth={10} />
        ))}
        {[810, 980, 1180, 1340, 1520, 1700].map((y) => (
          <path key={`h${y}`} d={`M -200 ${y} L 1300 ${y}`} stroke="#EEF2F7" strokeWidth={10} />
        ))}
        {[
          [300, 925, 90, 40],
          [560, 925, 140, 40],
          [830, 925, 120, 40],
          [320, 1125, 110, 40],
          [720, 1125, 130, 40],
          [280, 1220, 120, 36],
          [560, 1220, 150, 36],
          [860, 1220, 100, 36],
          [420, 790, 90, 34],
          [700, 790, 120, 34],
        ].map(([x, y, w, h], i) => (
          <rect key={`b${i}`} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} fill={i % 3 ? "#F1F4F9" : "#F4F1EA"} />
        ))}
        {[
          [250, 960],
          [395, 960],
          [610, 1000],
          [780, 1160],
          [1000, 1000],
          [520, 1170],
          [250, 1210],
          [660, 840],
          [880, 860],
          [1020, 1180],
          [360, 1340],
          [740, 1340],
        ].map(([x, y], i) => (
          <Poplar key={`p${i}`} x={x} y={y} s={0.75} />
        ))}
        <text x={1040} y={800} textAnchor="end" fontSize={26} fontWeight={900} fill="#9AA8C0" fontFamily="Nunito" letterSpacing={3}>
          {T.city.toUpperCase()}
        </text>

        {/* вертикальные границы тарифов 7 / 12 / 20 км */}
        {[7, 12, 20].map((km) => {
          const g = boundaryGlow(km);
          const show = easeOut(prog(t, b.hook.pills[0], 0.6));
          return (
            <g key={`g${km}`} opacity={show}>
              <path
                d={`M ${kmX(km)} 800 L ${kmX(km)} ${RULER_Y}`}
                stroke={g > 0 ? NAVY : "#C3CCDA"}
                strokeWidth={2 + g * 3 * (1 + 0.25 * Math.sin(t * 8))}
                strokeDasharray="10 10"
                opacity={0.55 + 0.45 * g}
              />
            </g>
          );
        })}

        {/* дороги (серые подложки) и жёлтые маршруты */}
        {LANES.map((l, i) => (
          <g key={l.id} opacity={laneAlpha(i) === 1 ? 1 : 0.6}>
            <path d={l.d} stroke={ROAD} strokeWidth={26} fill="none" strokeLinecap="round" opacity={drawn(i)} />
          </g>
        ))}
        {LANES.map((l, i) => {
          const a = laneAlpha(i);
          // в сценах тарифов: участок до прошлой границы — тёмный, новый — жёлтый
          const prevKm = i === 0 ? 0 : BG32_TIERS[i - 1].toKm;
          const growT = i === 1 ? b.t2.grow : i === 2 ? b.t3.grow : b.t1.from;
          const showSplit = active === i && i > 0;
          const g = showSplit ? easeOut(prog(t, growT, 1.0)) : 1;
          const head = l.lenAt(prevKm);
          return (
            <g key={`y${l.id}`} opacity={a}>
              {showSplit ? (
                <>
                  <path d={l.d} stroke={NAVY_SOFT} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={`${head} ${l.len}`} />
                  <path
                    d={l.d}
                    stroke={YELLOW}
                    strokeWidth={12}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`0 ${head} ${(l.len - head) * g} ${l.len}`}
                  />
                </>
              ) : (
                <path d={l.d} stroke={YELLOW} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={`${l.len * drawn(i)} ${l.len}`} />
              )}
            </g>
          );
        })}

        {/* за 20 км: серый пунктир и знак «нет» */}
        {(() => {
          const u = easeOut(prog(t, b.t3.over, 0.7));
          if (u <= 0) return null;
          const l = LANES[2];
          return (
            <g opacity={u}>
              <path d={`M ${l.xEnd + 20} ${l.y} L ${l.xEnd + 20 + 40 * u} ${l.y}`} stroke="#B9C2D0" strokeWidth={8} strokeDasharray="10 10" strokeLinecap="round" />
              <g transform={`translate(${l.xEnd + 86} ${l.y}) scale(${popScale(u)})`}>
                <circle r={22} fill="#FFFFFF" stroke="#E8463A" strokeWidth={5} />
                <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke="#E8463A" strokeWidth={5} strokeLinecap="round" />
              </g>
            </g>
          );
        })()}

        {/* школа и дома */}
        <g transform={`translate(140 1112)`}>
          <School glow={active === -1 ? 0 : prog(t, b.t1.pins, 0.4) * (active === 0 ? 1 : 0)} />
        </g>
        <Pin x={140} y={960} label={T.school} s={1 + 0.08 * Math.sin(Math.max(0, t - b.t1.pins) * 8) * (active === 0 && t < b.t1.pins + 1.2 ? 1 : 0)} />
        {LANES.map((l, i) => {
          const u = easeOut(prog(t, b.hook.pills[i] - 0.3, 0.5));
          return (
            <g key={`h${l.id}`} opacity={laneAlpha(i) * u}>
              <g transform={`translate(${l.xEnd} ${l.y - 16}) scale(${0.85 * popScale(u)})`}>
                <House glow={active === i ? 1 : 0} />
              </g>
              <Pin x={l.xEnd} y={l.y - 92} label={T.home} dark={false} s={0.85} />
            </g>
          );
        })}

        {/* база расчёта: путь школа → дом обводится — это расстояние в одну сторону */}
        {(() => {
          const u = easeOut(prog(t, b.t1.bracket, 1.0));
          if (active !== 0 || u <= 0) return null;
          const l = LANES[0];
          const lu = easeOut(prog(t, b.t1.bracket + 0.6, 0.4));
          const mx = (SX + 90 + l.xEnd) / 2 - 30;
          return (
            <g>
              <path d={l.d} stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${l.len * u} ${l.len}`} opacity={0.9} />
              <circle cx={SX} cy={SY} r={9} fill={NAVY} />
              {u > 0.97 ? <circle cx={l.xEnd} cy={l.y} r={9} fill={NAVY} /> : null}
              <g opacity={lu} transform={`translate(${mx} ${l.y - 40}) scale(${popScale(lu)})`}>
                <rect x={-88} y={-20} width={176} height={38} rx={19} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
                <text x={0} y={7} textAnchor="middle" fontSize={21} fontWeight={900} fill={NAVY} fontFamily="Nunito">
                  бир тарапка
                </text>
              </g>
            </g>
          );
        })()}

        {/* подписи км у домов → ценник в своей сцене */}
        {LANES.map((l, i) => {
          const u = easeOut(prog(t, b.hook.pills[i], 0.45));
          const priceAt = [b.t1.price, b.t2.price, b.t3.price][i];
          const pu = easeOut(prog(t, priceAt, 0.45));
          const asPrice = pu > 0 && active >= i;
          const label = asPrice ? `${l.price} сом` : `${l.toKm} км`;
          const w = asPrice ? 150 : 96;
          const s = popScale(u) * pulse(i) * (asPrice ? 0.9 + 0.1 * popScale(pu) : 1);
          return (
            <g key={`k${l.id}`} opacity={u * (active < 0 || active >= i ? (active === i || active < 0 ? 1 : 0.6) : 0.35)} transform={`translate(${l.xEnd} ${l.y + 44}) scale(${s})`}>
              <rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill={asPrice ? YELLOW : NAVY} stroke={NAVY} strokeWidth={3} />
              <text x={0} y={10} textAnchor="middle" fontSize={27} fontWeight={1000} fill={asPrice ? NAVY : "#FFFFFF"} fontFamily="Nunito">
                {label}
              </text>
            </g>
          );
        })}

        {/* машина в сцене своего тарифа */}
        {active === 0 ? <Car lane={LANES[0]} t={t} d={b.t1.drive} /> : null}
        {active === 1 ? <Car lane={LANES[1]} t={t} d={b.t2.drive} /> : null}
        {active === 2 ? <Car lane={LANES[2]} t={t} d={b.t3.drive} /> : null}

        {/* линейка 0–20 км */}
        <g opacity={easeOut(prog(t, b.hook.pills[2], 0.6))}>
          <path d={`M ${SX} ${RULER_Y} L ${kmX(20)} ${RULER_Y}`} stroke={NAVY_SOFT} strokeWidth={3} />
          {Array.from({ length: 21 }, (_, km) => (
            <path key={km} d={`M ${kmX(km)} ${RULER_Y} L ${kmX(km)} ${RULER_Y + ([0, 7, 12, 20].includes(km) ? 16 : 8)}`} stroke={NAVY_SOFT} strokeWidth={[0, 7, 12, 20].includes(km) ? 4 : 2} />
          ))}
          {[0, 7, 12, 20].map((km) => (
            <text key={km} x={kmX(km)} y={RULER_Y + 44} textAnchor="middle" fontSize={26} fontWeight={900} fill={boundaryGlow(km) > 0 ? NAVY : NAVY_SOFT} fontFamily="Nunito">
              {km} {T.km}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
};

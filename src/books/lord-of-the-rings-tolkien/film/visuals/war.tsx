// Залы 5–7 и 9: слова Боромира по ступеням, обет Фарамира на дороге, два брата,
// две карты войны, зрячий камень (Пин, Денетор), машина Скальбурга и энты, голос Сарумана.
import React from "react";
import { interpolate } from "remotion";
import { C, SERIF } from "../theme";
import { cxOf } from "./common";
import { Figure, Label, OL, Ring } from "./figures";
import { Arrow, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── «одолжи» → «могло быть моим» → «должно быть моим» ──
export const Escalation: React.FC<VisualProps<P & { steps: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const col = ["#7a9a6a", "#d49a3a", C.red];
  const lunge = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      {p.steps.map((w, i) => {
        const a = pop(t, at(c, 2.15 + i * 0.27));
        const x = cx - 380 + i * 340;
        const y = 760 - i * 150;
        const bw = w.length * 17 + 60;
        return (
          <g key={i}>
            <rect x={x - 170} y={y} width={340} height={880 - y} fill="#e2d8c6" stroke={OL} strokeWidth={4} />
            {a > 0 && (
              <g transform={`translate(${x + 40} ${y - 250}) scale(${a})`}>
                <rect x={-bw / 2} y={-44} width={bw} height={80} rx={24} fill="#fff" stroke={col[i]} strokeWidth={6} />
                <Txt x={0} y={10} size={34} weight={900} color={col[i]}>
                  {w}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      <g transform={`translate(${interpolate(lunge, [0, 1], [0, 160])} 0)`}>
        <Figure kind="man" x={cx - 380} y={760} s={0.8} t={t} color="#a8443c" label="Боромир" mood={t > at(c, 2.6) ? "wild" : t > at(c, 1) ? "angry" : "calm"} arm={lunge > 0 ? "push" : "down"} />
      </g>
      <Pop t={t} at={at(c, 0.3)} x={cx - 300} y={180}>
        <Label x={0} y={0} text="любит свой город" size={34} bg={C.goldLight} />
      </Pop>
      <Pop t={t} at={at(c, 1)} x={cx - 300} y={280}>
        <Label x={0} y={0} text="«сила для справедливой борьбы»" size={30} bg="#fff" />
      </Pop>
      {t > at(c, 3.3) && <Ring x={cx + 440} y={560} r={30} glow={0.8} t={t} />}
    </g>
  );
};

// ── обет на дороге: кольцо лежит, Фарамир проходит мимо ──
export const Road: React.FC<VisualProps<P & { text: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const walk = ramp(t, 0.3, Math.max(2, at(c, 2) - 0.3));
  const stop = ramp(t, at(c, 2), 0.4) * (1 - ramp(t, at(c, 2.5), 0.6));
  return (
    <g>
      <path d={`M ${cx - 800} 880 Q ${cx} 700 ${cx + 800} 880 Z`} fill="#d9c9a5" />
      <path d={`M ${cx - 800} 880 Q ${cx} 740 ${cx + 800} 880`} stroke="#b9a47a" strokeWidth={8} fill="none" strokeDasharray="30 24" />
      <Ring x={cx} y={790} r={26} glow={0.7} t={t} />
      <Figure kind="man" x={cx - 600 + walk * 1050} y={830} s={0.9} t={t} color="#4f7a55" label="Фарамир" mood={stop > 0.3 ? "scared" : "calm"} />
      <Pop t={t} at={at(c, 1)} x={cx} y={300}>
        <rect x={-430} y={-120} width={860} height={220} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        {p.text.split("\n").map((l, i) => (
          <text key={i} x={0} y={-50 + i * 58} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.ink} textAnchor="middle">
            {l}
          </text>
        ))}
      </Pop>
      <Pop t={t} at={at(c, 2.6)} x={cx + 330} y={540}>
        <Label x={0} y={0} text="слово сдержано" size={34} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── два брата: два ответа одному искушению ──
export const Brothers: React.FC<VisualProps<P & { left: { name: string; text: string }; right: { name: string; text: string } }>> = (c) => {
  const { t, p } = c;
  const split = ramp(t, 0.1, 0.8);
  const L = ramp(t, at(c, 2), 0.6);
  const R = ramp(t, at(c, 2.5), 0.6);
  const Side: React.FC<{ x: number; name: string; text: string; k: number; color: string; mood: "angry" | "calm" }> = ({ x, name, text, k, color, mood }) => (
    <g>
      <Figure kind="man" x={x} y={780} s={1} t={t} color={color} label={name} mood={mood} />
      <g opacity={k} transform={`translate(${x} ${300 - (1 - k) * 20})`}>
        <rect x={-260} y={-90} width={520} height={170} rx={30} fill="#fff" stroke={color} strokeWidth={6} />
        {text.split("\n").map((l, i) => (
          <Txt key={i} x={0} y={-14 + i * 54} size={44} weight={900} color={color}>
            {l}
          </Txt>
        ))}
      </g>
    </g>
  );
  return (
    <g>
      <rect x={0} y={120} width={960 * split} height={800} fill="#f6e3df" opacity={0.6} />
      <rect x={1920 - 960 * split} y={120} width={960 * split} height={800} fill="#e3f0e3" opacity={0.6} />
      <Side x={480} name={p.left.name} text={p.left.text} k={L} color="#a8443c" mood="angry" />
      <Side x={1440} name={p.right.name} text={p.right.text} k={R} color="#3f7a4f" mood="calm" />
      <Pop t={t} at={at(c, 1)} x={960} y={150}>
        <Label x={0} y={0} text="оба любят Гондор" size={38} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── две карты: верхняя — войны, нижняя — тропинка двух хоббитов ──
export const TwoMaps: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const top = ramp(t, 0.2, 0.8);
  const bottom = ramp(t, at(c, 1), 0.8);
  const path = ramp(t, at(c, 3), 3);
  const lembas = Math.round(interpolate(ramp(t, at(c, 3.5), 2), [0, 1], [12, 8]));
  return (
    <g>
      {/* верхняя карта */}
      <g opacity={top}>
        <rect x={340} y={110} width={1500} height={400} rx={30} fill="#f2ece0" stroke={OL} strokeWidth={4} />
        <Txt x={420} y={170} size={32} weight={900} color={C.inkSoft} anchor="start">
          БОЛЬШАЯ КАРТА · книги III и V
        </Txt>
        {[
          [560, 360, "Ристания"],
          [1060, 300, "крепость"],
          [1520, 380, "Гондор"],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={Number(x) - 26} y={Number(y) - 70} width={8} height={80} fill={OL} />
            <path d={`M ${Number(x) - 18} ${Number(y) - 70} l 70 18 l -70 18 Z`} fill={[C.green, C.gold, C.sky][i]} stroke={OL} strokeWidth={3} transform={`rotate(${wob(t, i, 4)} ${x} ${y})`} />
            <Txt x={Number(x)} y={Number(y) + 50} size={30} weight={800}>
              {String(w)}
            </Txt>
          </g>
        ))}
        <Arrow x1={640} y1={430} x2={1000} y2={330} k={ramp(t, at(c, 0.5), 1)} color={C.red} w={12} bend={-0.15} />
        <Arrow x1={1130} y1={330} x2={1460} y2={410} k={ramp(t, at(c, 2), 1)} color={C.red} w={12} bend={-0.15} />
        {t > at(c, 2) && <Figure kind="whiteWizard" x={1100} y={470} s={0.32} t={t} />}
      </g>
      {/* нижняя карта */}
      <g opacity={bottom}>
        <rect x={340} y={540} width={1500} height={340} rx={30} fill="#efe7da" stroke={OL} strokeWidth={4} />
        <Txt x={420} y={600} size={32} weight={900} color={C.inkSoft} anchor="start">
          МАЛЕНЬКАЯ ТРОПИНКА · книги IV и VI
        </Txt>
        <path d="M 480 800 C 700 700 820 860 1040 760 S 1400 700 1700 780" stroke="#b9a47a" strokeWidth={6} fill="none" strokeDasharray="10 14" />
        {(() => {
          const x = 480 + path * 1220;
          const y = 800 - Math.sin(path * Math.PI) * 50;
          return (
            <g>
              <Figure kind="hobbit" x={x} y={y} s={0.4} t={t} />
              <Figure kind="sam" x={x - 50} y={y + 4} s={0.4} t={t} />
            </g>
          );
        })()}
        {t > at(c, 3.3) &&
          Array.from({ length: lembas }).map((_, i) => <rect key={i} x={1300 + (i % 6) * 46} y={600 + Math.floor(i / 6) * 40} width={38} height={28} rx={6} fill="#e9d7a2" stroke={OL} strokeWidth={3} />)}
      </g>
    </g>
  );
};

// ── зрячий камень: любопытство Пина и отчаяние Денетора ──
export const Orb: React.FC<VisualProps<P & { mode: "pippin" | "denethor" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const look = ramp(t, at(c, 0.5), 0.8);
  const dark = p.mode === "denethor" ? ramp(t, at(c, 0.4), 1.5) : look * 0.7;
  const fire = p.mode === "denethor" ? ramp(t, at(c, 1), 0.8) : 0;
  return (
    <g>
      <g transform={`translate(${cx + 160} 520)`}>
        <rect x={-110} y={110} width={220} height={60} rx={14} fill="#6b5a4a" stroke={OL} strokeWidth={4} />
        <circle r={150} fill={interpolate(dark, [0, 1], [0, 1]) > 0.5 ? "#2a2440" : "#3d4f6a"} stroke={OL} strokeWidth={6} />
        <circle r={150} fill={C.ember} opacity={dark * (0.25 + 0.15 * Math.sin(t * 3))} />
        <ellipse cx={-50} cy={-60} rx={40} ry={20} fill="#fff" opacity={0.35} />
        {p.mode === "denethor" && (
          <Txt x={0} y={14} size={36} weight={900} color="#f2d0c0" opacity={dark}>
            «Запад пал»
          </Txt>
        )}
      </g>
      {p.mode === "pippin" ? (
        <Figure kind="hobbit" x={cx - 220} y={860} s={1.3} t={t} color="#5a7fc4" label="Пин" mood={look > 0.5 ? "scared" : "happy"} arm="out" />
      ) : (
        <g>
          <Figure kind="man" x={cx - 260} y={860} s={1.05} t={t} color="#3a3445" label="Денетор" mood="sad" />
          {fire > 0 && (
            <g opacity={fire}>
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${cx - 680 + i * 60} 880 q ${wob(t * 3, i, 12)} -90 20 -150 q 20 60 20 150 Z`} fill={i % 2 ? C.ember : C.gold} opacity={0.85} />
              ))}
              <Label x={cx - 280} y={330} text="между уставом и жизнью" size={32} bg="#fff" />
            </g>
          )}
        </g>
      )}
      {p.mode === "pippin" && (
        <Pop t={t} at={at(c, 1)} x={cx - 220} y={330}>
          <Label x={0} y={0} text="«честный олух»" size={38} bg={C.goldLight} />
        </Pop>
      )}
    </g>
  );
};

// шестерёнка
const Gear: React.FC<{ x: number; y: number; r: number; rot: number; color?: string }> = ({ x, y, r, rot, color = "#8a8191" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-r * 0.16} y={-r * 1.22} width={r * 0.32} height={r * 0.4} fill={color} stroke={OL} strokeWidth={3} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} fill={color} stroke={OL} strokeWidth={4} />
    <circle r={r * 0.32} fill="#e8e1d6" stroke={OL} strokeWidth={4} />
  </g>
);

// ── машина: рубка, Скальбург, потоп и чистая река ──
export const Gears: React.FC<VisualProps<P & { mode: "felling" | "isengard" | "flood" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const mode = p.mode;
  const spin = t * 40 * (mode === "flood" ? 1 - ramp(t, at(c, 1), 1.5) : 1);
  const flood = mode === "flood" ? ramp(t, at(c, 1.1), 2) : 0;
  const clean = mode === "flood" ? ramp(t, at(c, 1.7), 1.2) : 0;
  const felled = mode === "felling" ? ramp(t, at(c, 1), 1.5) : 0;
  return (
    <g>
      {mode !== "felling" && (
        <g>
          {/* башня-«модель», колёса, печи */}
          <rect x={cx - 60} y={260} width={120} height={600} fill="#5a5560" stroke={OL} strokeWidth={5} />
          <path d={`M ${cx - 90} 270 L ${cx} 170 L ${cx + 90} 270 Z`} fill="#5a5560" stroke={OL} strokeWidth={5} />
          <Gear x={cx - 340} y={620} r={110} rot={spin} />
          <Gear x={cx - 170} y={760} r={70} rot={-spin * 1.6} color="#a39aa8" />
          <Gear x={cx + 300} y={650} r={120} rot={-spin} color="#9a7a6a" />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${cx + 480 + i * 150} 860)`}>
              <rect x={-50} y={-160} width={100} height={160} fill="#7a3a2e" stroke={OL} strokeWidth={4} />
              <rect x={-30} y={-70} width={60} height={50} fill={C.ember} opacity={0.7 + 0.3 * Math.sin(t * 5 + i)} />
              {[0, 1].map((j) => {
                const k = (t * 0.4 + j / 2 + i * 0.3) % 1;
                return <circle key={j} cx={wob(t, j, 10)} cy={-180 - k * 200} r={26 + k * 40} fill="#5a5560" opacity={(0.5 - flood * 0.5) * (1 - k)} />;
              })}
            </g>
          ))}
          {mode === "isengard" && (
            <g>
              <Pop t={t} at={at(c, 0.3)} x={cx - 450} y={260}>
                <Label x={0} y={0} text="вместо садов — печи" size={34} bg="#fff" />
              </Pop>
              <Pop t={t} at={at(c, 1.3)} x={cx + 400} y={260}>
                <Label x={0} y={0} text="«рабское подражание»" size={34} bg={C.goldLight} />
              </Pop>
              <Pop t={t} at={at(c, 2.3)} x={cx} y={140}>
                <Label x={0} y={0} text="зло — не техника, а машина господства" size={32} bg="#fff" />
              </Pop>
            </g>
          )}
        </g>
      )}
      {mode === "felling" && (
        <g>
          {Array.from({ length: 6 }).map((_, i) => {
            const x = cx - 360 + i * 170;
            const k = clamp01(felled * 6 - i);
            return (
              <g key={i} transform={`translate(${x} 860) rotate(${k * 82})`}>
                <rect x={-18} y={-180} width={36} height={180} fill="#7a5532" stroke={OL} strokeWidth={4} />
                <circle cx={0} cy={-240} r={80} fill={interpolate(k, [0, 1], [0, 1]) > 0.5 ? "#9aa36a" : C.green} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
          <Gear x={cx + 520} y={300} r={90} rot={spin} />
          <Figure kind="ent" x={cx - 560} y={880} s={1} t={t} mood={felled > 0.5 ? "sad" : "calm"} label="Древобород" />
          <Pop t={t} at={at(c, 0.4)} x={cx + 180} y={200}>
            <Label x={0} y={0} text="«мысль — металлические колёса»" size={34} bg={C.goldLight} />
          </Pop>
          <Pop t={t} at={at(c, 2)} x={cx + 180} y={320}>
            <Label x={0} y={0} text="деревья-друзья с голосами" size={32} bg="#fff" />
          </Pop>
        </g>
      )}
      {mode === "flood" && (
        <g>
          {[0, 1, 2].map((i) => (
            <Figure key={i} kind="ent" x={cx - 640 + i * 150 + ramp(t, at(c, 0.8), 2) * 150} y={880} s={0.85} t={t + i} mood="angry" />
          ))}
          <rect x={cx - 560} y={880 - flood * 330} width={1320} height={flood * 330} fill={interpolate(clean, [0, 1], [0, 1]) > 0.5 ? "#7cc4ea" : "#7a8a92"} opacity={0.75} />
          {flood > 0 &&
            [0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${cx - 700 + i * 380 + ((t * 80) % 380)} ${880 - flood * 330} q 40 -26 80 0 t 80 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />
            ))}
          <Pop t={t} at={at(c, 0.2)} x={cx + 380} y={200}>
            <Label x={0} y={0} text="«Я был лентяем»" size={36} bg="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 1.8)} x={cx + 380} y={320}>
            <Label x={0} y={0} text="река побежит чистой" size={36} bg={C.goldLight} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── голос Сарумана: сладкие волны и «мелкий шрифт» ──
export const Voice: React.FC<VisualProps<P & { sweet: string[]; truth: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const reveal = ramp(t, at(c, 2), 0.8);
  return (
    <g>
      <Figure kind="whiteWizard" x={cx - 440} y={860} s={1.05} t={t} label="Саруман" mood={reveal > 0.5 ? "angry" : "happy"} arm="out" color="#eef0f4" />
      {[0, 1, 2, 3].map((i) => {
        const k = (t * 0.5 + i / 4) % 1;
        return <path key={i} d={`M ${cx - 300 + k * 600} ${520 - 120} q 30 120 0 240`} stroke={C.violet} strokeWidth={8} fill="none" opacity={(1 - k) * (1 - reveal * 0.7)} />;
      })}
      {p.sweet.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 0.2 + i * 0.25)} x={cx + 220 + (i % 2) * 160} y={260 + i * 130}>
          <g opacity={1 - reveal * 0.6}>
            <rect x={-170} y={-46} width={340} height={84} rx={42} fill="#efe7ff" stroke={C.violet} strokeWidth={4} />
            <Txt x={0} y={12} size={36} weight={900} color={C.violet}>
              {w}
            </Txt>
          </g>
        </Pop>
      ))}
      {reveal > 0 && (
        <g transform={`translate(${cx + 260} 720) scale(${reveal})`}>
          <rect x={-330} y={-90} width={660} height={170} rx={24} fill="#fff" stroke={C.red} strokeWidth={6} />
          {p.truth.split("\n").map((l, i) => (
            <Txt key={i} x={0} y={-14 + i * 54} size={42} weight={900} color={C.red}>
              {l}
            </Txt>
          ))}
        </g>
      )}
    </g>
  );
};

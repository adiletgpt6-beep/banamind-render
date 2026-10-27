import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FeatureHeader } from "../components/Header";
import { BigNumber, Chip, Label, PopCard, Waveform, clamp } from "../components/ui";
import { C, FONT, levelAt, wordFrame } from "../theme";

const CARD = { left: 80, width: 920, height: 290 };
const STAGE = { width: 330, height: 226 };

/** Мини-анимация 1: прыгающий персонаж говорит, ниже таймлайн с ключами. */
const AnimationDemo: React.FC<{ t: number; lvl: number }> = ({ t, lvl }) => {
  const bounce = Math.abs(Math.sin(t / 9)) * 46;
  const squash = 1 + (bounce < 6 ? 0.12 : 0);
  return (
    <svg width={STAGE.width} height={STAGE.height}>
      <rect width={STAGE.width} height={STAGE.height} rx="26" fill="#FFF4EC" />
      <ellipse cx="165" cy="180" rx={48 - bounce * 0.3} ry="8" fill="rgba(14,27,61,0.12)" />
      <g transform={`translate(165 ${176 - bounce}) scale(${1 / squash} ${squash})`}>
        <path d="M -52 0 C -52 -76, 52 -76, 52 0 Z" fill={C.orange} />
        <circle cx="-17" cy="-40" r="8" fill="#FFF" />
        <circle cx="17" cy="-40" r="8" fill="#FFF" />
        <circle cx="-15" cy="-39" r="4" fill={C.navy} />
        <circle cx="19" cy="-39" r="4" fill={C.navy} />
        <ellipse cx="0" cy="-17" rx="12" ry={3 + 11 * Math.min(1, lvl * 1.2)} fill={C.navy} />
      </g>
    </svg>
  );
};

/** Мини-анимация 2: видео с меняющимися языками субтитров. */
const DubDemo: React.FC<{ t: number }> = ({ t }) => {
  const phrases = ["Привет!", "Hello!", "¡Hola!", "Salut!"];
  const i = Math.floor(t / 22) % phrases.length;
  const local = (t % 22) / 22;
  const flip = interpolate(local, [0, 0.15], [0, 1], clamp);
  return (
    <div style={{ width: STAGE.width, height: STAGE.height, borderRadius: 26, overflow: "hidden", position: "relative", background: "linear-gradient(140deg, #8E7BFF 0%, #4C6BFF 100%)" }}>
      <svg width={STAGE.width} height={STAGE.height} style={{ position: "absolute" }}>
        <circle cx="70" cy="60" r="26" fill="#FFD84D" opacity="0.9" />
        <path d="M 0 170 L 90 110 L 160 160 L 240 100 L 330 160 V 226 H 0 Z" fill="#FFFFFF" opacity="0.25" />
        <circle cx="165" cy="100" r="34" fill="rgba(255,255,255,0.9)" />
        <path d="M 154 84 L 182 100 L 154 116 Z" fill="#5A6BFF" />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT.text,
          fontWeight: 800,
          fontSize: 34,
          color: "#FFF",
          textShadow: "0 2px 8px rgba(0,0,0,0.35)",
          opacity: flip,
          transform: `translateY(${(1 - flip) * 14}px)`,
        }}
      >
        {phrases[i]}
      </div>
    </div>
  );
};

/** Мини-анимация 3: открытая книга с перелистывающейся страницей. */
const BookDemo: React.FC<{ t: number }> = ({ t }) => {
  const turn = (t % 40) / 40;
  const angle = interpolate(turn, [0.2, 0.75], [0, 180], clamp);
  return (
    <div style={{ width: STAGE.width, height: STAGE.height, borderRadius: 26, background: "#F1EEFF", position: "relative", perspective: 700 }}>
      <div style={{ position: "absolute", left: 45, top: 40, width: 120, height: 150, background: "#FFF", borderRadius: "14px 4px 4px 14px", boxShadow: "0 8px 20px rgba(60,40,140,0.15)" }} />
      <div style={{ position: "absolute", left: 165, top: 40, width: 120, height: 150, background: "#FFF", borderRadius: "4px 14px 14px 4px", boxShadow: "0 8px 20px rgba(60,40,140,0.15)" }} />
      {[0, 1].map((side) =>
        [0, 1, 2, 3, 4].map((k) => (
          <div key={`${side}-${k}`} style={{ position: "absolute", left: 62 + side * 120, top: 64 + k * 22, width: 86 - (k === 4 ? 30 : 0), height: 8, borderRadius: 4, background: "#DCD5FF" }} />
        )),
      )}
      <div
        style={{
          position: "absolute",
          left: 165,
          top: 40,
          width: 120,
          height: 150,
          background: "linear-gradient(90deg, #EDE8FF, #FFFFFF)",
          borderRadius: "4px 14px 14px 4px",
          transformOrigin: "left center",
          transform: `rotateY(${-angle}deg)`,
          backfaceVisibility: "hidden",
          boxShadow: "0 6px 14px rgba(60,40,140,0.12)",
        }}
      />
      <div style={{ position: "absolute", left: 163, top: 36, width: 4, height: 158, background: C.violet, borderRadius: 2 }} />
    </div>
  );
};

const UseCard: React.FC<{
  delay: number;
  top: number;
  active: number;
  color: string;
  title: string;
  sub: string;
  stage: React.ReactNode;
  extra: React.ReactNode;
}> = ({ delay, top, active, color, title, sub, stage, extra }) => (
  <PopCard delay={delay} from="right" style={{ ...CARD, top, padding: 32 }}>
    <div style={{ position: "absolute", inset: -5, borderRadius: 45, border: `5px solid ${color}`, opacity: active }} />
    <div style={{ display: "flex", gap: 32, alignItems: "center", height: "100%" }}>
      {stage}
      <div style={{ flex: 1 }}>
        <div data-fit="use-title" style={{ fontFamily: FONT.text, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: C.navy }}>
          {title}
        </div>
        <Label size={26} style={{ marginTop: 8 }}>
          {sub}
        </Label>
        <div style={{ marginTop: 18 }}>{extra}</div>
      </div>
    </div>
  </PopCard>
);

// 39–52 с: возможность №3 — три применения, у каждого своя мини-анимация.
export const UsesScene: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const at = (needle: string, fb = 0) => wordFrame("uses", needle, fb) - offset;
  const head = 24;
  const a = at("Озвучка", 1.6) - 8;
  const d = at("Дубляж", 3.4) - 8;
  const b = at("Истории", 5.6) - 8;
  const lvl = levelAt(frame + offset);
  const act = (s: number, e: number) =>
    interpolate(frame, [s + 6, s + 14, e, e + 8], [0, 1, 1, 0], clamp);
  const langs = ["RU", "EN", "ES", "FR"];
  const li = Math.max(0, Math.floor((frame - d) / 22)) % langs.length;

  return (
    <>
      <BigNumber n={3} color={C.violet} start={0} end={head} />
      <FeatureHeader
        n={3}
        title="Применение"
        color={C.violet}
        icon={
          <svg width="44" height="44" viewBox="0 0 40 40">
            <rect x="4" y="8" width="32" height="24" rx="6" fill={C.violet} />
            <path d="M 17 14 L 26 20 L 17 26 Z" fill="#FFF" />
          </svg>
        }
        delay={head - 4}
      />
      <UseCard
        delay={a}
        top={340}
        active={act(a, d)}
        color={C.orange}
        title="Озвучка анимации"
        sub="голос персонажа под каждый кадр"
        stage={<AnimationDemo t={Math.max(0, frame - a)} lvl={frame > a ? lvl : 0} />}
        extra={
          <div style={{ position: "relative", height: 54 }}>
            <div style={{ position: "absolute", top: 24, left: 0, right: 0, height: 6, borderRadius: 3, background: C.soft }} />
            {[0.05, 0.3, 0.55, 0.85].map((x) => (
              <div key={x} style={{ position: "absolute", top: 17, left: `${x * 100}%`, width: 20, height: 20, background: C.orange, transform: "rotate(45deg)", borderRadius: 4 }} />
            ))}
            <div style={{ position: "absolute", top: 4, bottom: 4, width: 4, borderRadius: 2, background: C.navy, left: `${((Math.max(0, frame - a) % 60) / 60) * 100}%` }} />
          </div>
        }
      />
      <UseCard
        delay={d}
        top={660}
        active={act(d, b)}
        color={C.blue}
        title="Дубляж роликов"
        sub="та же интонация на других языках"
        stage={<DubDemo t={Math.max(0, frame - d)} />}
        extra={
          <div style={{ display: "flex", gap: 12 }}>
            {langs.map((l, i) => (
              <Chip key={l} color={C.blue} active={frame > d && i === li ? 1 : 0} size={26}>
                {l}
              </Chip>
            ))}
          </div>
        }
      />
      <UseCard
        delay={b}
        top={980}
        active={act(b, 10000)}
        color={C.violet}
        title="Истории и аудиокниги"
        sub="без студии и микрофона"
        stage={<BookDemo t={Math.max(0, frame - b)} />}
        extra={<Waveform width={430} height={56} bars={26} seed={14} live={frame > b} colors={[C.violet, C.pink]} />}
      />
    </>
  );
};

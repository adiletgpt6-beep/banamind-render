import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeatureHeader } from "../components/Header";
import { BigNumber, Card, Chip, Label, PopCard, Waveform, clamp } from "../components/ui";
import { C, FONT, GRAD, levelAt, wordFrame } from "../theme";

const TRAITS: Array<[string, string]> = [
  ["женский", C.orange],
  ["молодой", C.pink],
  ["тёплый", C.violet],
  ["спокойный", C.blue],
  ["уверенный", C.green],
];

const Mic: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="13" y="4" width="14" height="22" rx="7" fill={color} />
    <path d="M 8 19 A 12 12 0 0 0 32 19" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <line x1="20" y1="31" x2="20" y2="37" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// 15–26 с: возможность №1 — создание нового голоса, локальная обработка.
export const VoicesScene: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (needle: string, fb = 0) => wordFrame("voices", needle, fb) - offset;
  const head = 26;
  const traitsStart = at("Опиши", 2);
  const traitsEnd = at("характер", 3);
  const create = at("создаст", 4.5);
  const self = at("Кстати", 6.5);
  const local = at("железе", 9.5) - 12;
  const glow = interpolate(frame, [self, self + 10], [0, 1], clamp);
  const lvl = levelAt(frame + offset);

  return (
    <>
      <BigNumber n={1} color={C.orange} start={0} end={head} />
      <FeatureHeader n={1} title="Свои голоса" color={C.orange} icon={<Mic size={46} color={C.orange} />} delay={head - 4} />

      <PopCard delay={traitsStart - 10} style={{ top: 350, left: 80, width: 920, height: 380, padding: "34px 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: C.navy }}>Voice Design</div>
          <Label size={28}>опиши голос словами</Label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 34 }}>
          {TRAITS.map(([t, color], i) => {
            const f = traitsStart + ((traitsEnd + 14 - traitsStart) / TRAITS.length) * i;
            const act = interpolate(frame, [f, f + 6], [0, 1], clamp);
            return (
              <Chip key={t} color={color} active={act} size={36}>
                {t}
              </Chip>
            );
          })}
        </div>
        <div style={{ marginTop: 34, height: 12, borderRadius: 6, background: C.soft, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${interpolate(frame, [traitsStart, create + 10], [0, 100], clamp)}%`,
              background: GRAD.brand,
            }}
          />
        </div>
      </PopCard>

      {/* Новый голос: карточка «Ника» и две карточки-пресета за ней */}
      {[2, 1].map((k) => {
        const p = spring({ frame: frame - create - 6 - k * 3, fps, config: { damping: 14 } });
        return (
          <Card
            key={k}
            style={{
              top: 790 + k * 26,
              left: 80 + k * 30,
              width: 920 - k * 60,
              height: 250,
              opacity: p * (0.75 - k * 0.2),
              transform: `translateY(${(1 - p) * 60}px)`,
            }}
          />
        );
      })}
      <PopCard delay={create} from="scale" style={{ top: 770, left: 80, width: 920, height: 250, padding: "30px 36px" }}>
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 46,
            border: `5px solid ${C.orange}`,
            opacity: glow * (0.6 + 0.4 * Math.sin(frame / 4)),
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: GRAD.brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: 56,
              color: "#FFF",
              transform: `scale(${1 + 0.08 * Math.min(1, lvl) * glow})`,
            }}
          >
            Н
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: C.navy }}>Ника</div>
              <Chip color={C.green} size={24}>
                новый голос
              </Chip>
            </div>
            <Label size={27} style={{ marginTop: 6 }}>
              создан с нуля · не клон
            </Label>
            <Waveform width={600} height={70} bars={38} seed={8} live={glow > 0.5} style={{ marginTop: 10 }} />
          </div>
        </div>
      </PopCard>
      <div
        style={{
          position: "absolute",
          top: 1046,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: glow,
          transform: `translateY(${(1 - glow) * 20}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONT.text,
            fontWeight: 800,
            fontSize: 32,
            color: C.orange,
            background: "rgba(255,255,255,0.9)",
            padding: "10px 24px",
            borderRadius: 999,
            border: `2px solid ${C.orange}55`,
          }}
        >
          ↑ этот голос звучит прямо сейчас
        </span>
      </div>

      {[
        { t: "CPU · твой компьютер", icon: "chip", x: 80, c: C.blue },
        { t: "данные остаются у тебя", icon: "lock", x: 550, c: C.violet },
      ].map((b, i) => (
        <PopCard key={b.t} delay={local + i * 5} style={{ top: 1130, left: b.x, width: 450, height: 120, padding: "0 26px" }}>
          <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 40 40">
              {b.icon === "chip" ? (
                <>
                  <rect x="9" y="9" width="22" height="22" rx="5" fill={b.c} />
                  <rect x="15" y="15" width="10" height="10" rx="2" fill="#FFF" />
                  {[13, 20, 27].map((v) => (
                    <g key={v} stroke={b.c} strokeWidth="2.5" strokeLinecap="round">
                      <line x1={v} y1="3" x2={v} y2="8" />
                      <line x1={v} y1="32" x2={v} y2="37" />
                      <line x1="3" y1={v} x2="8" y2={v} />
                      <line x1="32" y1={v} x2="37" y2={v} />
                    </g>
                  ))}
                </>
              ) : (
                <>
                  <path d="M 13 18 V 13 A 7 7 0 0 1 27 13 V 18" stroke={b.c} strokeWidth="4" fill="none" />
                  <rect x="9" y="17" width="22" height="18" rx="5" fill={b.c} />
                  <circle cx="20" cy="26" r="3" fill="#FFF" />
                </>
              )}
            </svg>
            <div data-fit="badge" style={{ fontFamily: FONT.text, fontWeight: 800, fontSize: 29, color: C.navy, lineHeight: 1.15 }}>
              {b.t}
            </div>
          </div>
        </PopCard>
      ))}
    </>
  );
};

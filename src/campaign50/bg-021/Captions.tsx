// Кинетические субтитры: короткие фрагменты речи диктора, синхронные со
// словами (тайминги ElevenLabs). Текущее слово подсвечивается жёлтым.
// В финале субтитров нет: те же слова уже крупно на карточке контактов.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { spokenWords } from "./script";
import type { Bg021Timeline } from "./timing";
import { C, clamp, FONT } from "./parts";

type Chunk = { text: string; words: string[]; times: { start: number; end: number }[]; from: number; to: number };

const chunksOf = (tl: Bg021Timeline): Chunk[] => {
  const out: Chunk[] = [];
  for (const cue of tl.cues) {
    let k = 0;
    const list = cue.line.chunks.map(([text, n]) => {
      const times = cue.words.slice(k, k + n);
      k += n;
      return { text, times };
    });
    list.forEach((c, i) => {
      if (!c.times.length) return;
      const next = list[i + 1]?.times[0];
      out.push({
        text: c.text,
        words: spokenWords(c.text),
        times: c.times,
        from: c.times[0].start - 0.12,
        to: next ? next.start - 0.12 : c.times[c.times.length - 1].end + 0.45,
      });
    });
  }
  return out;
};

export const Captions: React.FC<{ readonly tl: Bg021Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunk = chunksOf(tl).find((c) => t >= c.from && t < c.to);
  if (!chunk) return null;
  const local = Math.round((t - chunk.from) * fps);
  const p = spring({ frame: local, fps, config: { damping: 14, mass: 0.6 } });
  const out = interpolate(t, [chunk.to - 0.12, chunk.to], [1, 0], clamp);
  const perWord = chunk.words.length === chunk.times.length;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1335,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(p, out),
        transform: `translateY(${(1 - p) * 26}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "16px 34px 20px",
          borderRadius: 30,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 12px 30px rgba(20,40,90,0.16)",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.15,
          color: C.ink,
          textAlign: "center",
        }}
      >
        {perWord
          ? chunk.text.split(/(\s+)/).reduce<{ nodes: React.ReactNode[]; i: number }>(
              (acc, part, j) => {
                if (/^\s+$/.test(part) || !spokenWords(part).length) {
                  acc.nodes.push(<span key={j}>{part}</span>);
                  return acc;
                }
                const w = chunk.times[acc.i];
                const active = t >= w.start - 0.05 && t < (chunk.times[acc.i + 1]?.start ?? chunk.to) - 0.05;
                acc.nodes.push(
                  <span
                    key={j}
                    style={{
                      background: active ? `linear-gradient(transparent 58%, ${C.yellow} 58%, ${C.yellow} 92%, transparent 92%)` : undefined,
                    }}
                  >
                    {part}
                  </span>,
                );
                acc.i++;
                return acc;
              },
              { nodes: [], i: 0 },
            ).nodes
          : chunk.text}
      </div>
    </div>
  );
};

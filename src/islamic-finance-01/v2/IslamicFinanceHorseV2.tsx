// IslamicFinanceHorseV2 — the same 30 s video (narration, music, captions,
// graphics) with the finance-horse presenter acting through every scene.
// The original IslamicFinanceShort01 composition is untouched.
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Captions } from "../Captions";
import { If01Audio } from "../If01Audio";
import { Backdrop } from "../components/ui";
import { fontFamily } from "../fonts";
import type { LipsyncData } from "../horse/lipsync";
import { type If01Manifest } from "../manifest";
import { easeInOut, map, mixColor, sec } from "../motion";
import { IF01_FRAMES } from "../script";
import { PALETTE } from "../theme";
import { CarStoryV2 } from "./CarStoryV2";
import { CtaV2 } from "./CtaV2";
import { HookRuleV2 } from "./HookRuleV2";
import { NameV2 } from "./NameV2";
import { QuestionV2 } from "./QuestionV2";
import { TakeawayV2 } from "./TakeawayV2";

export type IslamicFinanceHorseV2Props = { readonly manifest: If01Manifest; readonly lipsync: LipsyncData };

const Local: React.FC<{ readonly render: (frame: number) => React.ReactNode }> = ({ render }) => <>{render(useCurrentFrame())}</>;

export const IslamicFinanceHorseV2: React.FC<IslamicFinanceHorseV2Props> = ({ manifest, lipsync }) => {
  const frame = useCurrentFrame();
  const toBlue = map(frame, [sec(8.6), sec(9.4)], [0, 1], easeInOut);
  const toWhite = map(frame, [sec(23.0), sec(23.5)], [0, 1]);
  const bg = toWhite > 0 ? mixColor(PALETTE.blue, PALETTE.bg, toWhite) : mixColor(PALETTE.bg, PALETTE.blue, toBlue);
  const grid = map(frame, [0, sec(6.5), sec(9)], [1, 1, 0.55]);
  const p = { manifest, lipsync };
  return (
    <AbsoluteFill style={{ fontFamily, overflow: "hidden" }}>
      <Backdrop color={bg} grid={grid} />
      <Sequence name="1–2 Hook + Rule" durationInFrames={sec(6.5)}>
        <Local render={(f) => <HookRuleV2 frame={f} {...p} />} />
      </Sequence>
      <Sequence name="3 Question" from={sec(6.5)} durationInFrames={sec(2.5)}>
        <Local render={(f) => <QuestionV2 frame={f} {...p} />} />
      </Sequence>
      <Sequence name="4–5 Car + Transaction" from={sec(9)} durationInFrames={sec(13)}>
        <Local render={(f) => <CarStoryV2 frame={f} {...p} />} />
      </Sequence>
      <Sequence name="7 Takeaway" from={sec(24.5)} durationInFrames={sec(3)}>
        <Local render={(f) => <TakeawayV2 frame={f} {...p} />} />
      </Sequence>
      <Sequence name="8 Ending" from={sec(27.5)} durationInFrames={IF01_FRAMES - sec(27.5)}>
        <Local render={(f) => <CtaV2 frame={f} {...p} />} />
      </Sequence>
      <Sequence name="6 Name" from={sec(22)} durationInFrames={sec(2.5) + 8}>
        <Local render={(f) => <NameV2 frame={f} {...p} />} />
      </Sequence>
      <Captions manifest={manifest} />
      {manifest.draft ? (
        <div style={{ position: "absolute", left: 24, top: 24, padding: "6px 12px", borderRadius: 10, backgroundColor: "rgba(21,24,32,0.08)", fontFamily, fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", color: PALETTE.inkSoft }}>
          DRAFT VOICE · {manifest.provider}
        </div>
      ) : null}
      <If01Audio manifest={manifest} />
    </AbsoluteFill>
  );
};

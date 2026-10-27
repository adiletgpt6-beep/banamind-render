import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG042, type BalaGoBG042Props } from "./BalaGoBG042";
import { loadBg42Manifest } from "./loadManifest";
import { BG42_VIDEO } from "./script";
import { buildTimeline, estimateManifest } from "./timeline";

type Props = BalaGoBG042Props & { readonly allowEstimate?: boolean };

// Отдельный корень выпуска №42 (BG-042): общий src/Root.tsx не меняется.
export const Bg042Root: React.FC = () => (
  <Composition
    id={BG42_VIDEO.id}
    component={BalaGoBG042 as React.FC<Props>}
    width={BG42_VIDEO.width}
    height={BG42_VIDEO.height}
    fps={BG42_VIDEO.fps}
    durationInFrames={buildTimeline(estimateManifest()).frames}
    defaultProps={{ manifest: null, allowEstimate: false } as Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg42Manifest(Boolean(props.allowEstimate));
      return { durationInFrames: buildTimeline(manifest).frames, props: { ...props, manifest } };
    }}
  />
);

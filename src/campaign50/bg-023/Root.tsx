import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import { BalaGoBG023, type BalaGoBG023Props } from "./BalaGoBG023";
import { loadBg23Manifest } from "./loadManifest";
import { BG23_VIDEO, buildBg23Timeline } from "./script";

type Props = BalaGoBG023Props & { readonly allowSilent?: boolean };

// Отдельный корень выпуска №24 (BG-023): общий src/Root.tsx не меняется.
export const Bg023Root: React.FC = () => (
  <Composition
    id={BG23_VIDEO.id}
    component={BalaGoBG023 as React.FC<Props>}
    width={BG23_VIDEO.width}
    height={BG23_VIDEO.height}
    fps={BG23_VIDEO.fps}
    durationInFrames={buildBg23Timeline(null).durationInFrames}
    defaultProps={{ manifest: null, allowSilent: false } as Props}
    calculateMetadata={async ({ props }) => {
      const manifest = await loadBg23Manifest(Boolean(props.allowSilent));
      return { durationInFrames: buildBg23Timeline(manifest).durationInFrames, props: { ...props, manifest } };
    }}
  />
);

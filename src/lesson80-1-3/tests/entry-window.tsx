// Отдельный вход для технического листа уголка у окна (80-1-3).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { WindowTest, type WindowTestProps } from "./WindowTest";

const Root: React.FC = () => (
  <Composition id="L80-1-3-WindowTest" component={WindowTest} defaultProps={{ view: "room" } satisfies WindowTestProps} durationInFrames={90} fps={30} width={1920} height={1080} />
);

registerRoot(Root);

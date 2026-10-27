// Отдельная точка входа Remotion для обложек BM-010 (не меняет общий src/thumbnails/Root.tsx
// и релизы других книг): пять кадров thumb-peter-thiel-zero-to-one-1…5, 1280×720.
import React from "react";
import { registerRoot, Still } from "remotion";
import "../../fonts";
import "../../banamind/fonts";
import { TH, TW } from "../../thumbnails/kit";
import { ZERO_TO_ONE_THUMBNAILS as B } from "./thumbnails";

const Root: React.FC = () => (
  <>
    {([1, 2, 3, 4, 5] as const).map((n) => (
      <Still key={n} id={`thumb-${B.slug}-${n}`} component={B.components[n]} width={TW} height={TH} />
    ))}
  </>
);

registerRoot(Root);

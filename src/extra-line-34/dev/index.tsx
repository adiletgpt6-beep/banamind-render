// Регистрация рабочих листов №34 (папка «Extra-line-34-dev»).
import { Composition, Folder } from "remotion";
import { DEV_FRAMES } from "./DevSheet";
import { SheetBook } from "./SheetBook";
import { SheetCharacters } from "./SheetCharacters";
import { SheetLiving } from "./SheetLiving";
import { SheetOffice } from "./SheetOffice";
import { SheetSite } from "./SheetSite";
import { SheetUI } from "./SheetUI";

const SHEETS = [
  ["El34SheetCharacters", SheetCharacters],
  ["El34SheetLiving", SheetLiving],
  ["El34SheetOffice", SheetOffice],
  ["El34SheetUI", SheetUI],
  ["El34SheetSite", SheetSite],
  ["El34SheetBook", SheetBook],
] as const;

export const El34DevSheets: React.FC = () => (
  <Folder name="Extra-line-34-dev">
    {SHEETS.map(([id, C]) => (
      <Composition key={id} id={id} component={C} durationInFrames={DEV_FRAMES} fps={30} width={1080} height={1920} />
    ))}
  </Folder>
);

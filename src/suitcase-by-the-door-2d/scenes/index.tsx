// Сцены S01–S16 по порядку шкалы и их звуковые планы.
import type { Sd2SceneId } from "../script";
import type { Sd2SfxPlan } from "../sfx";
import { S01Suitcase, sfxS01Suitcase } from "./S01Suitcase";
import { S02Invite, sfxS02Invite } from "./S02Invite";
import { S03Schedule, sfxS03Schedule } from "./S03Schedule";
import { S04Who, sfxS04Who } from "./S04Who";
import { S05Dinner, sfxS05Dinner } from "./S05Dinner";
import { S06Three, sfxS06Three } from "./S06Three";
import { S07Meetings, sfxS07Meetings } from "./S07Meetings";
import { S08Pack, sfxS08Pack } from "./S08Pack";
import { S09Request, sfxS09Request } from "./S09Request";
import { S10Trip, sfxS10Trip } from "./S10Trip";
import { S11Call, sfxS11Call } from "./S11Call";
import { S12Back, sfxS12Back } from "./S12Back";
import { S13Badge, sfxS13Badge } from "./S13Badge";
import { S14Photo, sfxS14Photo } from "./S14Photo";
import { S15Folder, sfxS15Folder } from "./S15Folder";
import { S16Cta, sfxS16Cta } from "./S16Cta";

export const SCENES: Record<Sd2SceneId, React.FC> = {
  suitcase: S01Suitcase,
  invite: S02Invite,
  schedule: S03Schedule,
  who: S04Who,
  dinner: S05Dinner,
  three: S06Three,
  meetings: S07Meetings,
  pack: S08Pack,
  request: S09Request,
  trip: S10Trip,
  call: S11Call,
  back: S12Back,
  badge: S13Badge,
  photo: S14Photo,
  folder: S15Folder,
  cta: S16Cta,
};

export const SCENE_SFX: Record<Sd2SceneId, Sd2SfxPlan> = {
  suitcase: sfxS01Suitcase,
  invite: sfxS02Invite,
  schedule: sfxS03Schedule,
  who: sfxS04Who,
  dinner: sfxS05Dinner,
  three: sfxS06Three,
  meetings: sfxS07Meetings,
  pack: sfxS08Pack,
  request: sfxS09Request,
  trip: sfxS10Trip,
  call: sfxS11Call,
  back: sfxS12Back,
  badge: sfxS13Badge,
  photo: sfxS14Photo,
  folder: sfxS15Folder,
  cta: sfxS16Cta,
};

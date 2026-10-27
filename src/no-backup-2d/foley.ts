// Естественные звуки (фоли) ролика: записи со свободной лицензией,
// источники и авторы — public/audio/no-backup-2d/foley/SOURCES.json.
// Синтетический генератор (scripts/nb2d-sfx.mjs) эти файлы не трогает.
// null — подходящей естественной записи нет: звук не используется.
const F = (n: string) => `audio/no-backup-2d/foley/${n}.mp3`;
type Clip = string | null;

export const FOLEY: {
  readonly stepAdult: readonly string[];
  readonly stepChild: readonly string[];
  readonly doorOpen: Clip;
  readonly doorClose: Clip;
  readonly carDoor: Clip;
  readonly keys: Clip;
  readonly beltPull: Clip;
  readonly beltClick: Clip;
  readonly rustle: Clip;
  readonly bagDown: Clip;
  readonly ambYard: Clip;
  readonly ambRoom: Clip;
  readonly ambCar: Clip;
  readonly ambStreet: Clip;
} = {
  stepAdult: [F("step-1"), F("step-2"), F("step-3")],
  stepChild: [F("step-2"), F("step-1"), F("step-3")],
  doorOpen: F("door-handle"),
  doorClose: F("door-close"),
  carDoor: null,
  keys: F("keys"),
  beltPull: null,
  beltClick: F("belt-click"),
  rustle: null,
  bagDown: null,
  ambYard: F("amb-yard"),
  ambRoom: null,
  ambCar: null,
  ambStreet: null,
};
export const foleyFile = F;

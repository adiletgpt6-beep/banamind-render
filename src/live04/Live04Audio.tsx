// Звук BalaGoLive04Motion:
//   • голос — только оригинальная запись Адилета (очищенная копия
//     public/live04/voice.wav, тот же тайминг, без ускорения и замены);
//   • бренд-реплика финала — отдельный женский голос проекта;
//   • музыка проекта (код, scripts/live04/sound.mjs) — тихо, под речью
//     приглушается ещё сильнее (плавно, без «качелей»);
//   • мягкие UI-звуки точно на событиях графики (время — из раскадровки).
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { LIVE04_WORDS } from "./transcript";
import { CUE, LIVE04, type BrandVoice } from "./cues";

type Sfx = { readonly at: number; readonly name: string; readonly volume: number };

const SFX: readonly Sfx[] = [
  { at: 0.02, name: "whoosh", volume: 0.22 },
  { at: CUE.zhetkiruu + 0.04, name: "tick", volume: 0.35 },
  { at: CUE.keede, name: "pop", volume: 0.35 },
  { at: CUE.twenty, name: "tick", volume: 0.3 },
  { at: CUE.emes, name: "alert", volume: 0.3 },
  { at: LIVE04.cuts[0] - 0.3, name: "whoosh", volume: 0.3 },
  { at: CUE.ishinizdi, name: "pop", volume: 0.3 },
  { at: CUE.toktotosuz, name: "stop", volume: 0.38 },
  { at: CUE.anan, name: "glide", volume: 0.28 },
  { at: CUE.zholgo, name: "pop", volume: 0.28 },
  { at: CUE.mektepke2, name: "pop", volume: 0.32 },
  { at: CUE.zhetesiz, name: "success", volume: 0.3 },
  { at: LIVE04.cuts[1] - 0.15, name: "whoosh", volume: 0.28 },
  { at: CUE.zhumushka, name: "pop", volume: 0.3 },
  { at: CUE.zhumushka + 0.07, name: "notify", volume: 0.26 },
  { at: CUE.zhumushka + 0.32, name: "tick", volume: 0.3 },
  { at: CUE.zhumushka + 0.58, name: "tick", volume: 0.3 },
  { at: CUE.kayra2, name: "pop", volume: 0.26 },
  { at: CUE.kirish, name: "glide", volume: 0.34 },
  { at: LIVE04.cuts[2] - 0.15, name: "whoosh", volume: 0.26 },
  { at: CUE.munu, name: "pop", volume: 0.26 },
  { at: CUE.birok - 0.05, name: "whoosh", volume: 0.32 },
  { at: CUE.mektep, name: "tick", volume: 0.32 },
  { at: CUE.zhumasyna, name: "tick", volume: 0.32 },
  { at: CUE.zhumasyna + 0.22, name: "tick", volume: 0.3 },
  { at: CUE.zhumasyna + 0.44, name: "tick", volume: 0.3 },
  { at: CUE.besh, name: "pop", volume: 0.4 },
  { at: LIVE04.cuts[3] - 0.32, name: "whoosh", volume: 0.3 },
  { at: CUE.balago - 0.05, name: "thump", volume: 0.5 },
  { at: CUE.balago + 0.12, name: "success", volume: 0.24 },
  { at: CUE.kattamdy, name: "pop", volume: 0.28 },
  { at: CUE.ozubuzgo, name: "glide", volume: 0.3 },
  { at: CUE.alabyz + 0.1, name: "success", volume: 0.28 },
  { at: LIVE04.cuts[4] - 0.15, name: "whoosh", volume: 0.26 },
  { at: CUE.erteng, name: "pop", volume: 0.22 },
  { at: CUE.uydon, name: "pop", volume: 0.28 },
  { at: CUE.mektepke3, name: "glide", volume: 0.3 },
  { at: CUE.sabaktan, name: "notify", volume: 0.26 },
  { at: CUE.kayra3, name: "glide", volume: 0.3 },
  { at: CUE.uygo + 0.12, name: "success", volume: 0.3 },
  { at: LIVE04.cuts[5] - 0.15, name: "whoosh", volume: 0.26 },
  { at: CUE.kyzmat, name: "tick", volume: 0.3 },
  { at: CUE.profil, name: "pop", volume: 0.36 },
  { at: CUE.whatsapp, name: "pop", volume: 0.36 },
  { at: CUE.whatsapp + 0.08, name: "notify", volume: 0.22 },
  { at: CUE.lastWordEnd + 0.05, name: "whoosh", volume: 0.3 },
  { at: CUE.lastWordEnd + 0.3, name: "thump", volume: 0.36 },
];

// Говорит ли кто-то в момент t (для приглушения музыки).
const speaking = (t: number, brand: BrandVoice | null) => {
  for (const w of LIVE04_WORDS) if (t >= w.start - 0.25 && t <= w.end + 0.35) return true;
  if (brand) {
    const s = LIVE04.brandAt + brand.speechStart;
    const e = LIVE04.brandAt + brand.speechEnd;
    if (t >= s - 0.25 && t <= e + 0.35) return true;
  }
  return false;
};

export const Live04Audio: React.FC<{ readonly brand: BrandVoice | null; readonly totalSec: number }> = ({ brand, totalSec }) => {
  const fps = LIVE04.fps;
  // уровень музыки: 0,16 в паузах, 0,075 под речью; сглаживание ≈ 0,25 с
  const musicVolume = (f: number) => {
    const t = f / fps;
    let acc = 0;
    let n = 0;
    for (let d = -0.25; d <= 0.25; d += 0.05) {
      acc += speaking(t + d, brand) ? 0.075 : 0.16;
      n++;
    }
    const fadeIn = interpolate(t, [0, 0.6], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(t, [totalSec - 2.2, totalSec], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (acc / n) * fadeIn * fadeOut;
  };
  return (
    <>
      <Audio src={staticFile(LIVE04.voice)} volume={1} />
      <Audio src={staticFile("audio/live04/music.mp3")} volume={musicVolume} />
      {brand ? (
        <Sequence from={Math.round(LIVE04.brandAt * fps)} layout="none">
          <Audio src={staticFile("audio/live04/brand.mp3")} volume={1} />
        </Sequence>
      ) : null}
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={Math.round(1.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/live04/sfx-${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

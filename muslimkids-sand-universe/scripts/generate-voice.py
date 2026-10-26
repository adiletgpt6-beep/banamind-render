"""Russian narration for Sand Universe, synthesised locally and free of charge.

Engine: Piper VITS voice ru_RU-ruslan-medium (male) run through sherpa-onnx.
The model is downloaded once from the sherpa-onnx GitHub release into
~/.cache/sand-universe-tts. Each scene line becomes its own 48 kHz WAV in
public/audio/voice/, and the measured durations are written to
src/voice-timings.json so the timeline can sync picture to speech.

    pip install sherpa-onnx soundfile numpy
    python3 scripts/generate-voice.py

VITS sampling is stochastic, so several takes are synthesised per line. When
WHISPER_DIR points at a sherpa-onnx Whisper model (sherpa-onnx-whisper-small
from the same GitHub release), every take is transcribed and the one closest
to the script wins — an automatic intelligibility check for pronunciation.
"""
import difflib, json, os, re, subprocess, tarfile, urllib.request
import numpy as np
import sherpa_onnx
import soundfile as sf

VOICE = "vits-piper-ru_RU-ruslan-medium"
URL = f"https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/{VOICE}.tar.bz2"
CACHE = os.path.expanduser("~/.cache/sand-universe-tts")

# (id, text, length_scale) — length_scale > 1 slows speech down naturally
# (no time-stretching): calmer pace for children, slowest for the ayah.
LINES = [
    ("s1", "Смотри внимательно. Всего одна песчинка. А что будет, если их станет тысячи?", 1.12),
    ("s2", "Песчинки собираются, и появляется Земля! Она вращается. На одной стороне день, на другой ночь.", 1.08),
    ("s3", "Теперь песчинки собираются снова. Перед нами горы, долины и реки. Какой удивительный мир!", 1.08),
    ("s4", "А теперь маленькое семечко. Появляется росток. Он растёт, выпускает ветви и превращается в дерево.", 1.08),
    ("s5", "Поднимем взгляд. Перед нами небо и звёзды. Коран призывает нас размышлять о сотворении небес и земли.", 1.06),
    ("s6", "Посмотри! Земля, горы, дерево и звёздное небо. Сколько удивительного вокруг нас!", 1.08),
    ("s7", "Господь наш! Ты не сотворил это понапрасну.", 1.28),
]


def ensure_model():
    d = os.path.join(CACHE, VOICE)
    if not os.path.isdir(d):
        os.makedirs(CACHE, exist_ok=True)
        arc = os.path.join(CACHE, VOICE + ".tar.bz2")
        urllib.request.urlretrieve(URL, arc)
        with tarfile.open(arc) as t:
            t.extractall(CACHE)
        os.remove(arc)
    return d


def make_tts(d, length_scale):
    onnx = [f for f in os.listdir(d) if f.endswith(".onnx")][0]
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=f"{d}/{onnx}", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data",
                length_scale=length_scale, noise_scale=0.62, noise_scale_w=0.8),
            num_threads=4))
    return sherpa_onnx.OfflineTts(cfg)


TAKES = int(os.environ.get("TAKES", "6"))


def norm(t):
    return re.sub(r"[^а-я ]", "", t.lower().replace("ё", "е")).split()


def make_asr():
    w = os.environ.get("WHISPER_DIR")
    if not w:
        return None
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{w}/small-encoder.int8.onnx", decoder=f"{w}/small-decoder.int8.onnx",
        tokens=f"{w}/small-tokens.txt", language="ru", task="transcribe", num_threads=4)


def score(asr, samples, sr, text):
    s = asr.create_stream()
    s.accept_waveform(sr, samples)
    asr.decode_stream(s)
    heard = s.result.text
    return difflib.SequenceMatcher(None, norm(text), norm(heard)).ratio(), heard


def main():
    d = ensure_model()
    asr = make_asr()
    out = os.path.join("public", "audio", "voice")
    os.makedirs(out, exist_ok=True)
    timings = {}
    for sid, text, ls in LINES:
        tts = make_tts(d, ls)
        best = None
        for _ in range(TAKES if asr else 1):
            a = tts.generate(text, sid=0, speed=1.0)
            smp = np.asarray(a.samples, dtype=np.float32)
            sc, heard = score(asr, smp, a.sample_rate, text) if asr else (1.0, "")
            if best is None or sc > best[0]:
                best = (sc, heard, a)
        audio = best[2]
        if asr:
            print(f"  best take {best[0]:.2f}: {best[1]}")
        raw = os.path.join(out, f"{sid}.raw.wav")
        wav = os.path.join(out, f"{sid}.wav")
        sf.write(raw, np.asarray(audio.samples, dtype=np.float32), audio.sample_rate)
        # Trim silence, gentle warmth EQ + light compression, 48 kHz mono.
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                        "silenceremove=start_periods=1:start_threshold=-62dB:start_silence=0.06,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-62dB:start_silence=0.12,areverse,"
                        "highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=6500:t=q:w=1.5:g=-2,"
                        "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,aresample=48000",
                        "-ac", "1", wav], check=True)
        os.remove(raw)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                             "-of", "csv=p=0", wav]).decode())
        timings[sid] = {"text": text, "duration": round(dur, 3)}
        print(sid, f"{dur:.2f}s", text)
    with open(os.path.join("src", "voice-timings.json"), "w", encoding="utf-8") as f:
        json.dump(timings, f, ensure_ascii=False, indent="\t")
        f.write("\n")


if __name__ == "__main__":
    main()

"""Локальная озвучка BM-039 и выравнивание слов (резерв, когда ElevenLabs/CI недоступны).

1. Синтез: Piper ru_RU (sherpa-onnx, VITS), один голос на весь фильм.
2. Выравнивание: локальное распознавание той же реплики (sherpa-onnx zipformer-ru,
   таймкоды токенов) → время каждой буквы распознанного текста → сопоставление
   с буквами текста титров (difflib по буквам) → время каждой буквы и слова
   сценария. Не попавшие в сопоставление буквы интерполируются между соседями.

Вход — JSON [{id, say, text, out, speed}], выход — JSON {id: {chars, words, asr}}.
Запуск: python -I tts_align_local.py PIPER_DIR ASR_DIR jobs.json out.json
"""
import difflib
import json
import subprocess
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

piper_dir, asr_dir, jobs_path, out_path = sys.argv[1:5]
name = piper_dir.rstrip("/").split("/")[-1].replace("vits-piper-", "")
tts = sherpa_onnx.OfflineTts(
    sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{piper_dir}/{name}.onnx", tokens=f"{piper_dir}/tokens.txt", data_dir=f"{piper_dir}/espeak-ng-data"),
            num_threads=4,
        ),
        max_num_sentences=1,
    )
)
asr = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{asr_dir}/encoder.int8.onnx", decoder=f"{asr_dir}/decoder.int8.onnx", joiner=f"{asr_dir}/joiner.int8.onnx", tokens=f"{asr_dir}/tokens.txt", num_threads=4
)


def norm(ch):
    ch = ch.lower()
    return "е" if ch == "ё" else ch


def is_letter(ch):
    return ch.isalpha() or ch.isdigit()


def align(text, wav):
    pcm = subprocess.check_output(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"])
    audio = np.frombuffer(pcm, dtype=np.float32)
    dur = len(audio) / 16000
    s = asr.create_stream()
    s.accept_waveform(16000, audio)
    asr.decode_stream(s)
    r = s.result
    # буквы распознанного текста с временем: внутри токена — равномерно до начала следующего
    a_letters, a_times = [], []
    toks, ts = list(r.tokens), list(r.timestamps)
    for i, tok in enumerate(toks):
        letters = [norm(c) for c in tok if is_letter(c)]
        t0 = ts[i]
        t1 = ts[i + 1] if i + 1 < len(ts) else min(dur, t0 + 0.32)
        for k, c in enumerate(letters):
            a_letters.append(c)
            a_times.append(t0 + (t1 - t0) * k / max(1, len(letters)))
    # буквы сценария
    s_idx = [i for i, c in enumerate(text) if is_letter(c)]
    s_letters = [norm(text[i]) for i in s_idx]
    times = [None] * len(s_letters)
    sm = difflib.SequenceMatcher(None, s_letters, a_letters, autojunk=False)
    for b in sm.get_matching_blocks():
        for k in range(b.size):
            times[b.a + k] = a_times[b.b + k]
    # интерполяция пропусков; монотонность
    known = [i for i, t in enumerate(times) if t is not None]
    if not known:
        times = [dur * (i + 0.5) / max(1, len(times)) for i in range(len(times))]
    else:
        for i in range(len(times)):
            if times[i] is None:
                prev = max([k for k in known if k < i], default=None)
                nxt = min([k for k in known if k > i], default=None)
                if prev is None:
                    times[i] = max(0.0, times[nxt] - 0.06 * (nxt - i))
                elif nxt is None:
                    times[i] = min(dur, times[prev] + 0.06 * (i - prev))
                else:
                    times[i] = times[prev] + (times[nxt] - times[prev]) * (i - prev) / (nxt - prev)
        for i in range(1, len(times)):
            times[i] = max(times[i], times[i - 1])
    chars = []
    for i, t in enumerate(times):
        end = times[i + 1] if i + 1 < len(times) else min(dur, t + 0.2)
        chars.append({"c": s_letters[i], "start": round(t, 3), "end": round(max(end, t + 0.02), 3)})
    # слова сценария по буквам
    words = []
    li = 0
    for tok in text.split():
        n = sum(1 for c in tok if is_letter(c))
        if n == 0:
            words.append(None)
            continue
        words.append({"text": tok, "start": chars[li]["start"], "end": chars[li + n - 1]["end"]})
        li += n
    matched = sum(b.size for b in sm.get_matching_blocks())
    return {"chars": chars, "words": words, "asr": r.text, "match": round(matched / max(1, len(s_letters)), 3)}


out = {}
for job in json.load(open(jobs_path, encoding="utf-8")):
    audio = tts.generate(job["say"], sid=0, speed=job.get("speed", 1.0))
    sf.write(job["out"], np.array(audio.samples, dtype=np.float32), audio.sample_rate)
    out[job["id"]] = align(job["text"], job["out"])
    print(f"✓ {job['id']} совпадение букв {out[job['id']]['match']:.0%}", flush=True)
json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)

# Расшифровка живой кыргызской речи с таймкодами: Meta MMS (facebook/mms-1b-all,
# адаптер "kir"), жадное CTC-декодирование, время каждого символа по кадрам
# логитов (20 мс). Это черновик для ручной сверки, а не готовые субтитры:
# модель не ставит пунктуацию и может ошибаться в отдельных буквах.
#
#   python scripts/live04/asr.py in.wav out.json
import json
import subprocess
import sys

SR = 16000


def load(path):
    import numpy as np

    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main():
    import torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC

    src, out = sys.argv[1], sys.argv[2]
    audio = load(src)
    model_id = "facebook/mms-1b-all"
    proc = AutoProcessor.from_pretrained(model_id, target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="kir", ignore_mismatched_sizes=True)
    model.eval()
    vocab = {v: k for k, v in proc.tokenizer.get_vocab().items()}
    blank = proc.tokenizer.pad_token_id
    delim = proc.tokenizer.word_delimiter_token

    # Куски по 20 с с перекрытием 2 с: модель видит контекст, а память не растёт.
    chunk, hop = 20 * SR, 18 * SR
    frames = []  # (time, token_id, prob)
    pos = 0
    while pos < len(audio):
        seg = audio[pos : pos + chunk]
        inputs = proc(seg, sampling_rate=SR, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits[0]
        probs = torch.softmax(logits, dim=-1)
        step = len(seg) / SR / logits.shape[0]
        keep_from = 0 if pos == 0 else 1.0
        keep_to = len(seg) / SR if pos + chunk >= len(audio) else 19.0
        for i in range(logits.shape[0]):
            t = i * step
            if keep_from <= t < keep_to:
                p, k = probs[i].max(dim=-1)
                frames.append((pos / SR + t, int(k), float(p)))
        if pos + chunk >= len(audio):
            break
        pos += hop

    chars = []
    prev = None
    for t, k, p in frames:
        if k != prev and k != blank:
            chars.append({"c": vocab[k], "start": round(t, 2), "end": round(t + 0.02, 2), "p": round(p, 2)})
        elif k == prev and k != blank and chars:
            chars[-1]["end"] = round(t + 0.02, 2)
        prev = k

    words, cur = [], None
    for c in chars:
        if c["c"] == delim:
            cur = None
            continue
        if cur is None:
            cur = {"w": "", "start": c["start"], "end": c["end"], "minP": 1.0}
            words.append(cur)
        cur["w"] += c["c"]
        cur["end"] = c["end"]
        cur["minP"] = min(cur["minP"], c["p"])
    text = " ".join(w["w"] for w in words)
    json.dump({"source": src, "model": model_id, "text": text, "words": words, "chars": chars}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(text)
    for w in words:
        flag = "  ?" if w["minP"] < 0.6 else ""
        print(f"{w['start']:6.2f}–{w['end']:6.2f}  {w['w']}{flag}")


if __name__ == "__main__":
    main()

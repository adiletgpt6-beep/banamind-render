"""ASR round-trip QA of public/audio/voice.wav (Whisper small via sherpa-onnx).
Prints recognised text per scene and a character error rate (CER)."""
import json, re, sherpa_onnx, soundfile as sf
D = "scripts/.cache/tts/sherpa-onnx-whisper-small/"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=D + "small-encoder.int8.onnx", decoder=D + "small-decoder.int8.onnx",
    tokens=D + "small-tokens.txt", language="ru", task="transcribe", num_threads=4)
a, sr = sf.read("public/audio/voice.wav", dtype="float32")
tl = json.load(open("src/timeline.json"))
norm = lambda s: re.sub(r"[^а-я ]", "", s.lower().replace("ё", "е")).split()


def lev(x, y):
    d = list(range(len(y) + 1))
    for i, cx in enumerate(x, 1):
        p, d[0] = d[0], i
        for j, cy in enumerate(y, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (cx != cy))
    return d[-1]

tot_e = tot_n = 0
for sc in tl["scenes"]:
    ref = " ".join(s["text"] for s in tl["sentences"] if s["scene"] == sc["id"])
    seg = a[int((sc["voiceStart"] - 0.3) * sr): int((sc["voiceEnd"] + 0.4) * sr)]
    st = rec.create_stream(); st.accept_waveform(sr, seg); rec.decode_stream(st)
    r, h = " ".join(norm(ref)), " ".join(norm(st.result.text))
    e = lev(r, h); tot_e += e; tot_n += len(r)
    print(f"[{sc['id']}] CER {e/len(r):.2f}\n  ref: {ref}\n  asr: {st.result.text}")
print(f"TOTAL CER {tot_e/tot_n:.3f}")

# Технический замер русской озвучки Lesson80_1_14 (не замена прослушиванию):
#   • разборчивость — Meta MMS (facebook/mms-1b-all, адаптер "rus"):
#     доля ошибок по буквам (CER) относительно сценария;
#   • медиана основного тона F0 (Гц) — голоса четырёх ролей различаются.
#
#   python scripts/lesson80/asr.py in.json out.json
#       in.json: [{"path": …, "text": …}, …] → out.json: [{"path","heard","cer","f0"}, …]
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import ts2d_asr as base  # noqa: E402

_model = None


def recognizer():
    global _model
    if _model is None:
        import torch
        from transformers import AutoProcessor, Wav2Vec2ForCTC

        model_id = "facebook/mms-1b-all"
        processor = AutoProcessor.from_pretrained(model_id, target_lang="rus")
        model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="rus", ignore_mismatched_sizes=True)
        model.eval()
        _model = (processor, model, torch)
    return _model


def transcribe(audio) -> str:
    processor, model, torch = recognizer()
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
    return processor.decode(torch.argmax(logits, dim=-1)[0])


def main() -> None:
    items = json.load(open(sys.argv[1], encoding="utf-8"))
    res = []
    for it in items:
        audio = base.load(it["path"])
        heard = transcribe(audio)
        r = {"path": it["path"], "heard": heard, "cer": base.cer(it["text"], heard), "f0": base.median_f0(audio)}
        res.append(r)
        print(f"  {os.path.basename(it['path'])}: CER {r['cer']}, F0 {r['f0']} Гц — «{heard}»", flush=True)
    json.dump(res, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

"""ElevenLabs helpers (stdlib only): TTS with timestamps, Scribe STT, account info."""
import base64
import json
import os
import time
import urllib.error
import urllib.request
import uuid

API = os.environ.get("ELEVENLABS_API_BASE", "https://api.elevenlabs.io")


def _key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        raise SystemExit("ELEVENLABS_API_KEY is not set")
    return k


def _req(method, path, body=None, headers=None, timeout=300):
    h = {"xi-api-key": _key()}
    h.update(headers or {})
    for attempt in range(5):
        r = urllib.request.Request(API + path, data=body, headers=h, method=method)
        try:
            with urllib.request.urlopen(r, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:500]
            if e.code in (429, 500, 502, 503) and attempt < 4:
                time.sleep(4 * 2**attempt)
                continue
            raise RuntimeError(f"{method} {path}: HTTP {e.code} {msg}") from None


def get_json(path):
    return json.loads(_req("GET", path))


def tts(voice_id, text, model_id, settings, seed=None, previous_text=None, next_text=None,
        output_format="mp3_44100_192", language_code=None):
    """Returns (audio_bytes, alignment dict with characters / start / end lists)."""
    body = {"text": text, "model_id": model_id, "voice_settings": settings}
    if seed is not None:
        body["seed"] = seed
    if previous_text:
        body["previous_text"] = previous_text
    if next_text:
        body["next_text"] = next_text
    if language_code:
        body["language_code"] = language_code
    raw = _req("POST", f"/v1/text-to-speech/{voice_id}/with-timestamps?output_format={output_format}",
               json.dumps(body).encode(), {"Content-Type": "application/json"})
    d = json.loads(raw)
    al = d.get("alignment") or {}
    return base64.b64decode(d["audio_base64"]), {
        "characters": al.get("characters", []),
        "start": al.get("character_start_times_seconds", []),
        "end": al.get("character_end_times_seconds", []),
    }


def stt(path, language_code="rus", model_id="scribe_v1"):
    """Scribe transcription with word timestamps."""
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in (("model_id", model_id), ("language_code", language_code),
                 ("timestamps_granularity", "word"), ("tag_audio_events", "false")):
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    with open(path, "rb") as f:
        data = f.read()
    name = os.path.basename(path)
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\n'
                 f'Content-Type: application/octet-stream\r\n\r\n'.encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    raw = _req("POST", "/v1/speech-to-text", b"".join(parts),
               {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    return json.loads(raw)

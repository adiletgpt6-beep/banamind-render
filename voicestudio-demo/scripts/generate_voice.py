"""Generate the Russian voiceover through VoiceStudio MCP and build timing.json.

Every line of speech comes from VoiceStudio's MCP tools at
http://localhost:3900/mcp/ (engine: VoxCPM2, Apache-2.0). No other TTS is used.

Pipeline:
  1. design  — `generate_speech` with a voice description and no profile
               (VoxCPM2 Voice Design) → several candidates → QC → best one;
  2. profile — `clone_voice` from that synthetic sample, so every scene keeps
               the same new voice (nobody's real voice is cloned);
  3. scenes  — `generate_speech(profile_id)` per scene, QC + `transcribe`
               check, retry on failure;
  4. assemble — pauses, 60 s voiceover.wav, timing.json, script.txt.

Usage (VoiceStudio venv python: it ships `mcp`, numpy, soundfile):
  python generate_voice.py                 # design (if needed) + all scenes
  python generate_voice.py --only mcp      # regenerate one scene, re-assemble
  python generate_voice.py --check         # exit 0 if audio is up to date
  python generate_voice.py --estimate      # no audio: estimated draft timing

Env:
  VOICESTUDIO_MCP_URL   default http://localhost:3900/mcp/
  VOICESTUDIO_MCP_BASE  the backend's OMNIVOICE_MCP_BASE_PATH (shared dir)
"""
from __future__ import annotations

import argparse
import ast
import asyncio
import base64
import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
DEMO = ROOT / "voicestudio-demo"
SCRIPT = DEMO / "script.json"
PROFILE = DEMO / "voice-profile.json"
SCENE_DIR = DEMO / "audio"
PUBLIC = ROOT / "public" / "voicestudio-demo"
TIMING = ROOT / "src" / "voicestudio-demo" / "timing.json"
OUTPUT = ROOT / "output"

FPS = 30
TOTAL_SEC = 60.0
LEAD_IN_SEC = 0.6
SR = 48000
ENGINE = "voxcpm2"
MCP_URL = os.environ.get("VOICESTUDIO_MCP_URL", "http://localhost:3900/mcp/")
API = MCP_URL.split("/mcp")[0]
MCP_BASE = Path(os.environ.get("VOICESTUDIO_MCP_BASE", ROOT / "vs-out"))
# Russian narration that sounds unhurried lands around 11–16 chars/s.
RATE_MIN, RATE_MAX = 9.0, 17.5
ASR_MIN_SIMILARITY = 0.75
FEMALE_F0 = (155.0, 300.0)


async def mcp(tool: str, args: dict) -> dict:
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client

    headers = {"X-OmniVoice-Client-Id": "claude-code"}
    async with streamablehttp_client(MCP_URL, headers=headers, timeout=60, sse_read_timeout=7200) as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = await s.call_tool(tool, args)
            body = "".join(getattr(c, "text", "") for c in res.content)
            if res.isError:
                raise RuntimeError(f"{tool} failed: {body[:800]}")
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                data = ast.literal_eval(body)  # list_voices returns str(list)
            if isinstance(data, dict) and data.get("error"):
                raise RuntimeError(f"{tool} error: {data['error']}")
            return data


def call(tool: str, args: dict) -> dict:
    return asyncio.run(mcp(tool, args))


def fetch_wav(result: dict, dest: Path) -> None:
    if result.get("output_path") and Path(result["output_path"]).is_file():
        shutil.copyfile(result["output_path"], dest)
    elif result.get("wav_base64"):
        dest.write_bytes(base64.b64decode(result["wav_base64"]))
    elif result.get("audio_url"):
        url = result["audio_url"]
        url = url if url.startswith("http") else API + url
        with urllib.request.urlopen(url) as resp:
            dest.write_bytes(resp.read())
    else:
        raise RuntimeError(f"no audio in MCP result: {list(result)}")


def asr_similarity(wav: Path, expected: str) -> tuple[float | None, str]:
    """Transcribe through VoiceStudio and compare with the script line."""
    MCP_BASE.mkdir(parents=True, exist_ok=True)
    tmp = MCP_BASE / f"asr-{wav.stem}.wav"
    shutil.copyfile(wav, tmp)
    try:
        res = call("transcribe", {"audio_path": str(tmp), "language": "ru"})
    except Exception as e:  # ASR is a QC aid; its absence is reported, not hidden
        print(f"  ASR unavailable: {str(e)[:200]}")
        return None, ""
    heard = res.get("text", "")
    a, b = asr_words(expected), asr_words(heard)
    return difflib.SequenceMatcher(None, a, b).ratio(), heard


TRANSLIT = {"claude": "клод", "code": "код", "voicestudio": "войс студио", "voice": "войс", "studio": "студио",
            "mcp": "эм си пи", "wav": "вав", "open": "опен", "source": "сорс", "эмсипи": "эм си пи"}


def asr_words(s: str) -> list[str]:
    s = s.lower().replace("ё", "е").replace("-", " ")
    words = re.sub(r"[^a-zа-я0-9 ]+", " ", s).split()
    return " ".join(TRANSLIT.get(w, w) for w in words).split()


def median_f0(x: np.ndarray) -> float:
    y = x[:: SR // 16000]
    sr = 16000
    f = []
    for i in range(0, len(y) - 1024, 800):
        w = y[i : i + 1024] * np.hanning(1024)
        if np.sqrt((w**2).mean()) < 0.02:
            continue
        ac = np.correlate(w, w, "full")[1023:]
        lo, hi = sr // 400, sr // 70
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.4 * ac[0]:
            f.append(sr / k)
    return float(np.median(f)) if f else 0.0


def script_hash(cfg: dict) -> str:
    keep = {"voice": cfg["voice"], "scenes": [[s["id"], s["tts"]] for s in cfg["scenes"]]}
    return hashlib.sha256(json.dumps(keep, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]


def load_mono(path: Path) -> np.ndarray:
    """Decode with ffmpeg to 48 kHz mono float32."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def trim_silence(x: np.ndarray, thr: float = 0.008) -> np.ndarray:
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.03 * SR))
    b = min(len(x), idx[-1] + int(0.08 * SR))
    return x[a:b]


def qc(x: np.ndarray, text: str) -> list[str]:
    """Return a list of problems; empty means the clip passes."""
    problems = []
    dur = len(x) / SR
    if dur < 0.8:
        problems.append(f"too short ({dur:.2f}s)")
    peak = float(np.max(np.abs(x))) if len(x) else 0.0
    if peak < 0.05:
        problems.append(f"near-silent (peak {peak:.3f})")
    if peak >= 0.999:
        problems.append("clipping")
    rate = len(re.sub(r"\s+", "", text)) / max(dur, 0.01)
    if not RATE_MIN <= rate <= RATE_MAX:
        problems.append(f"speech rate {rate:.1f} chars/s outside {RATE_MIN}-{RATE_MAX}")
    # long dead air inside the clip usually means a broken generation
    gaps = silence_gaps(x)
    if any(e - s > 1.2 for s, e in gaps):
        problems.append("internal silence > 1.2s")
    return problems


def envelope(x: np.ndarray) -> np.ndarray:
    hop = SR // FPS
    n = len(x) // hop
    if n == 0:
        return np.zeros(0)
    frames = x[: n * hop].reshape(n, hop)
    return np.sqrt((frames**2).mean(axis=1))


def silence_gaps(x: np.ndarray, min_gap: float = 0.11) -> list[tuple[float, float]]:
    """Pauses inside speech, in seconds (10 ms resolution)."""
    hop = SR // 100
    n = len(x) // hop
    if n == 0:
        return []
    rms = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1))
    quiet = rms < max(0.012, 0.08 * float(np.percentile(rms, 95)))
    gaps, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) / 100 >= min_gap and start > 0:
                gaps.append((start / 100, i / 100))
            start = None
    return gaps


def word_weight(w: str) -> float:
    base = len(re.sub(r"[^\wА-Яа-яЁё]", "", w)) + 1.5
    if re.search(r"[.!?]$", w):
        base += 4
    elif re.search(r"[,:—–-]$", w) or w in ("—", "–"):
        base += 2
    return base


def word_timings(text: str, dur: float, gaps: list[tuple[float, float]]) -> list[dict]:
    """Distribute words over the clip, snapping phrase ends to detected pauses."""
    words = text.split()
    weights = np.array([word_weight(w) for w in words], dtype=float)
    cum = np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * dur
    # anchors: (word boundary index, end time of previous word, start of next)
    anchors = [(0, 0.0, 0.0)]
    used: set[int] = set()
    for i, w in enumerate(words[:-1]):
        if not re.search(r"[.!?,:—–]$", w) and words[i + 1] not in ("—", "–"):
            continue
        best, bd = None, 0.6
        for gi, (gs, _) in enumerate(gaps):
            if gi not in used and gs > anchors[-1][2] and abs(gs - cum[i + 1]) < bd:
                best, bd = gi, abs(gs - cum[i + 1])
        if best is not None:
            used.add(best)
            anchors.append((i + 1, gaps[best][0], gaps[best][1]))
    anchors.append((len(words), dur, dur))
    out = []
    for (i0, _, t0), (i1, t1, _) in zip(anchors, anchors[1:]):
        seg = weights[i0:i1]
        edges = t0 + np.concatenate([[0], np.cumsum(seg)]) / seg.sum() * (t1 - t0)
        for k in range(i1 - i0):
            out.append({"w": words[i0 + k], "s": round(float(edges[k]), 3), "e": round(float(edges[k + 1]), 3)})
    return out


def assemble(cfg: dict, clips: dict[str, np.ndarray], provenance: dict, estimated: bool) -> None:
    pause = cfg["pauseAfterSec"]
    total = np.zeros(int(TOTAL_SEC * SR), dtype=np.float32)
    t = LEAD_IN_SEC
    scenes = []
    for sc in cfg["scenes"]:
        x = clips[sc["id"]]
        dur = len(x) / SR
        a = int(round(t * SR))
        if a + len(x) > len(total):
            raise SystemExit(
                f"Narration overruns {TOTAL_SEC}s at scene {sc['id']} — shorten text or raise speed."
            )
        total[a : a + len(x)] += x
        gaps = [] if estimated else silence_gaps(x)
        words = word_timings(sc["text"], dur, gaps)
        for wd in words:
            wd["s"] = round(wd["s"] + t, 3)
            wd["e"] = round(wd["e"] + t, 3)
        scenes.append({
            "id": sc["id"], "text": sc["text"], "keywords": sc.get("keywords", []),
            "speechStart": round(t, 3), "speechEnd": round(t + dur, 3), "words": words,
        })
        t += dur + pause
    speech_end = scenes[-1]["speechEnd"]
    if not estimated and not 52.0 <= speech_end <= 58.5:
        print(f"WARNING: narration ends at {speech_end:.2f}s (target 55–58s)", file=sys.stderr)

    env = envelope(total)
    if estimated:
        # Draft only: a synthetic envelope from word timings so the mouth moves.
        f = np.arange(int(TOTAL_SEC * FPS)) / FPS
        env = np.zeros_like(f)
        for sc in scenes:
            for wd in sc["words"]:
                m = (f >= wd["s"]) & (f < wd["e"] - 0.03)
                env[m] = 0.5 + 0.4 * np.abs(np.sin(f[m] * 23))
    if env.max() > 0:
        env = env / np.percentile(env[env > 0], 98)
    timing = {
        "fps": FPS, "durationInFrames": int(TOTAL_SEC * FPS), "estimated": estimated,
        "speechEnd": round(speech_end, 3), "scenes": scenes,
        "envelope": [round(float(min(v, 1.0)), 3) for v in env],
        "provenance": provenance,
    }
    TIMING.parent.mkdir(parents=True, exist_ok=True)
    TIMING.write_text(json.dumps(timing, ensure_ascii=False, indent=1))
    print(f"timing.json written ({'ESTIMATED' if estimated else 'from VoiceStudio audio'}); speech ends {speech_end:.2f}s")
    if estimated:
        return

    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    peak = float(np.max(np.abs(total)))
    if peak > 0.98:
        total *= 0.98 / peak
    sf.write(PUBLIC / "voiceover.wav", total, SR, subtype="PCM_16")
    shutil.copyfile(PUBLIC / "voiceover.wav", OUTPUT / "voiceover.wav")
    print("voiceover.wav written:", PUBLIC / "voiceover.wav", "and", OUTPUT / "voiceover.wav")


def write_script_txt(cfg: dict, timing_path: Path) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    t = json.loads(timing_path.read_text())
    lines = [cfg["title"], ""]
    for sc in t["scenes"]:
        lines.append(f"[{sc['speechStart']:05.2f}–{sc['speechEnd']:05.2f}] {sc['id']}: {sc['text']}")
    lines += ["", "Голос: VoiceStudio 0.5.6, движок VoxCPM2 (openbmb/VoxCPM2, Apache-2.0), Voice Design:",
              "  " + cfg["voice"]["description"],
              "Новый синтетический голос; голос из референсного ролика и чужие записи не использовались."]
    (OUTPUT / "script.txt").write_text("\n".join(lines) + "\n")




def active_engine() -> dict:
    with urllib.request.urlopen(API + "/engines/tts") as r:
        d = json.loads(r.read())
    with urllib.request.urlopen(API + "/health") as r:
        h = json.loads(r.read())
    return {"engine": d.get("active"), "voicestudio_version": h.get("version"), "device": h.get("device")}


def design_voice(cfg: dict, args) -> dict:
    """VoxCPM2 Voice Design → best candidate → clone_voice profile."""
    v = cfg["voice"]
    SCENE_DIR.mkdir(parents=True, exist_ok=True)
    best = None
    for k in range(1, args.candidates + 1):
        res = call("generate_speech", {"text": v["sampleText"], "language": "Russian",
                                       "instruct": v["description"], "steps": args.steps})
        wav = SCENE_DIR / f"design-candidate-{k}.wav"
        fetch_wav(res, wav)
        x = trim_silence(load_mono(wav))
        f0 = median_f0(x)
        problems = qc(x, v["sampleText"])
        if not FEMALE_F0[0] <= f0 <= FEMALE_F0[1]:
            problems.append(f"F0 {f0:.0f} Hz outside female range")
        sim, heard = asr_similarity(wav, v["sampleText"])
        if sim is not None and sim < ASR_MIN_SIMILARITY:
            problems.append(f"ASR similarity {sim:.2f}")
        score = (sim or 0.9) - 0.2 * len(problems)
        print(f"[design {k}] audio_id={res.get('audio_id')} dur={len(x)/SR:.2f}s F0={f0:.0f}Hz "
              f"sim={sim} heard={heard!r} {problems or 'OK'}", flush=True)
        if best is None or score > best["score"]:
            best = {"score": score, "wav": wav, "x": x, "f0": f0, "sim": sim, "audio_id": res.get("audio_id"),
                    "problems": problems}
    if best["problems"]:
        raise SystemExit(f"no voice-design candidate passed QC: {best['problems']}")
    sample = SCENE_DIR / "voice-design-sample.wav"
    sf.write(sample, best["x"], SR, subtype="PCM_16")
    MCP_BASE.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(sample, MCP_BASE / sample.name)
    prof = call("clone_voice", {"name": v["name"], "ref_audio_path": str(MCP_BASE / sample.name),
                                "ref_text": v["sampleText"], "language": "Russian"})
    pid = prof.get("profile_id") or prof.get("id")
    info = {"profile_id": pid, "name": v["name"], "engine": ENGINE, "description": v["description"],
            "sample_text": v["sampleText"], "sample_audio_id": best["audio_id"], "sample_f0_hz": round(best["f0"]),
            "sample_asr_similarity": best["sim"], "script_hash": script_hash(cfg),
            "created_via": "VoiceStudio MCP generate_speech (voice design) + clone_voice of that synthetic sample"}
    PROFILE.write_text(json.dumps(info, ensure_ascii=False, indent=1) + "\n")
    print("voice profile:", info)
    return info


def is_up_to_date(cfg: dict) -> bool:
    prov_path = SCENE_DIR / "provenance.json"
    if not prov_path.exists() or not TIMING.exists():
        return False
    prov = json.loads(prov_path.read_text())
    t = json.loads(TIMING.read_text())
    return (prov.get("engine") == ENGINE and prov.get("script_hash") == script_hash(cfg) and not t["estimated"]
            and all((SCENE_DIR / f"{s['id']}.wav").exists() for s in cfg["scenes"]))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="regenerate one scene id")
    ap.add_argument("--estimate", action="store_true", help="draft timing without audio")
    ap.add_argument("--check", action="store_true", help="exit 0 when audio is up to date, 1 otherwise")
    ap.add_argument("--steps", type=int, default=16)
    ap.add_argument("--retries", type=int, default=4)
    ap.add_argument("--candidates", type=int, default=3)
    args = ap.parse_args()
    cfg = json.loads(SCRIPT.read_text())

    if args.check:
        sys.exit(0 if is_up_to_date(cfg) else 1)
    if args.estimate:
        clips = {sc["id"]: np.zeros(int(len(sc["text"]) / 13.5 * SR), dtype=np.float32) for sc in cfg["scenes"]}
        assemble(cfg, clips, {"engine": None, "note": "estimated timing, no audio"}, estimated=True)
        return

    eng = active_engine()
    print("VoiceStudio:", eng, flush=True)
    if eng["engine"] != ENGINE:
        raise SystemExit(f"active TTS engine is {eng['engine']!r}, expected {ENGINE!r} (OMNIVOICE_TTS_BACKEND={ENGINE})")
    prof = json.loads(PROFILE.read_text()) if PROFILE.exists() else {}
    if prof.get("engine") != ENGINE or prof.get("script_hash") != script_hash(cfg) or not prof.get("profile_id") \
            or os.environ.get("REDESIGN") == "1":
        prof = design_voice(cfg, args)
        args.only = None  # a new voice means every scene is regenerated
    else:
        # the profile lives in the backend's data dir; recreate it from the saved sample if missing
        voices = call("list_voices", {})
        if not any(v.get("id") == prof["profile_id"] for v in voices if isinstance(v, dict)):
            sample = SCENE_DIR / "voice-design-sample.wav"
            MCP_BASE.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(sample, MCP_BASE / sample.name)
            res = call("clone_voice", {"name": prof["name"], "ref_audio_path": str(MCP_BASE / sample.name),
                                       "ref_text": prof["sample_text"], "language": "Russian"})
            prof["profile_id"] = res.get("profile_id") or res.get("id")
            PROFILE.write_text(json.dumps(prof, ensure_ascii=False, indent=1) + "\n")
    pid = prof["profile_id"]

    prov_path = SCENE_DIR / "provenance.json"
    old = json.loads(prov_path.read_text()) if prov_path.exists() else {}
    provenance = {"tool": "VoiceStudio MCP generate_speech", "mcp_url": MCP_URL, "engine": ENGINE,
                  "model": "openbmb/VoxCPM2", "voicestudio_version": eng["voicestudio_version"],
                  "device": eng["device"], "profile_id": pid, "language": "Russian", "steps": args.steps,
                  "script_hash": script_hash(cfg),
                  "scenes": old.get("scenes", {}) if old.get("engine") == ENGINE else {}}
    clips: dict[str, np.ndarray] = {}
    for sc in cfg["scenes"]:
        wav = SCENE_DIR / f"{sc['id']}.wav"
        if args.only and sc["id"] != args.only and wav.exists() and sc["id"] in provenance["scenes"]:
            clips[sc["id"]] = trim_silence(load_mono(wav))
            continue
        best = None
        for attempt in range(1, args.retries + 1):
            print(f"[{sc['id']}] VoiceStudio generate_speech (attempt {attempt})…", flush=True)
            res = call("generate_speech", {"text": sc["tts"], "language": "Russian", "profile_id": pid,
                                           "steps": args.steps})
            cand = SCENE_DIR / f"{sc['id']}.try{attempt}.wav"
            fetch_wav(res, cand)
            x = trim_silence(load_mono(cand))
            problems = qc(x, sc["text"])
            sim, heard = asr_similarity(cand, sc["tts"])
            if sim is not None and sim < ASR_MIN_SIMILARITY:
                problems.append(f"ASR similarity {sim:.2f}")
            print(f"  audio_id={res.get('audio_id')} gen={res.get('generation_time_s')}s dur={len(x)/SR:.2f}s "
                  f"sim={sim} heard={heard!r} {problems or 'OK'}", flush=True)
            entry = {"audio_id": res.get("audio_id"), "generation_time_s": res.get("generation_time_s"),
                     "audio_duration_s": res.get("audio_duration_s"), "attempt": attempt,
                     "asr_similarity": sim, "asr_text": heard, "qc": problems or "ok"}
            score = (sim or 0.9) - 0.2 * len(problems)
            if best is None or score > best[0]:
                best = (score, cand, x, entry)
            if not problems:
                break
        score, cand, x, entry = best
        if entry["qc"] != "ok":
            raise SystemExit(f"scene {sc['id']} failed QC after {args.retries} attempts: {entry['qc']}")
        shutil.move(cand, wav)
        for p in SCENE_DIR.glob(f"{sc['id']}.try*.wav"):
            p.unlink()
        provenance["scenes"][sc["id"]] = entry
        clips[sc["id"]] = x
    prov_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=1))
    assemble(cfg, clips, provenance, estimated=False)
    write_script_txt(cfg, TIMING)


if __name__ == "__main__":
    main()

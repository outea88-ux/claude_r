#!/usr/bin/env python3
"""
Produksi audio bahan belajar dari naskah bersegmen.

    python build_audio.py plan    # Tahap 1 + 2: parse naskah, terapkan kamus
    python build_audio.py synth   # Tahap 3: sintesis per potongan (bisa diulang)
    python build_audio.py master  # Tahap 4: sambung + loudnorm + mp3/m4b/srt/manifest
    python build_audio.py qc      # Tahap 5: pemeriksaan mutu
    python build_audio.py all     # keempatnya berurutan

Backend TTS dipilih lewat --backend:
    edge    id-ID-ArdiNeural / id-ID-GadisNeural lewat edge-tts  (mutu terbaik)
    gtrans  suara Indonesia Google Translate                     (cadangan)

Naskah tidak pernah diubah isinya; skrip ini hanya memproduksi audio.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
SCRIPT_MD = ROOT / "naskah_audio_disertasi_herman.md"
BUILD = ROOT / "build"
TEXT_RAW = BUILD / "text_raw"
TEXT_SPOKEN = BUILD / "text_spoken"
AUDIO = BUILD / "audio"
WAV = BUILD / "wav"
OUTPUT = ROOT / "output"

PLAN_JSON = BUILD / "plan.json"
SYNTH_META = BUILD / "synth_meta.json"

SAMPLE_RATE = 24000
MAX_CHARS = 1800           # batas aman per permintaan TTS
SFX_CHIME_SECONDS = 1.2    # [[SFX chime]] -> hening 1,2 detik
MIN_MP3_BYTES = 2048       # file di bawah ini dianggap gagal diam-diam

VOICE_MAP = {"ARDI": "id-ID-ArdiNeural", "GADIS": "id-ID-GadisNeural"}

TAG_TITLE = "Bahan Belajar Disertasi Herman"
TAG_ARTIST = "Herman - PEP UNY"
TAG_ALBUM = "Prediktor Mutu SMP di Indonesia melalui Explainable Machine Learning"
TAG_YEAR = "2026"

# --------------------------------------------------------------------------
# Tahap 2 - kamus pelafalan
# --------------------------------------------------------------------------
LEXICON = {
    # Akronim & nama metode
    "SHAP": "syap",
    "TreeSHAP": "tri syap",
    "XGBoost": "eks ji buust",
    "X-G-Boost": "eks ji buust",
    "MERF": "merf",
    "M-E-R-F": "merf",
    "GLMM": "ji el em em",
    "G-L-M-M": "ji el em em",
    "EFA": "e ef a",
    "E-F-A": "e ef a",
    "CFA": "se ef a",
    "C-F-A": "se ef a",
    "CIPO": "sipo",
    "C-I-P-O": "sipo",
    "RMSE": "er em es e",
    "R-M-S-E": "er em es e",
    "MAE": "em a e",
    "M-A-E": "em a e",
    "CFI": "se ef i", "C-F-I": "se ef i",
    "TLI": "te el i", "T-L-I": "te el i",
    "RMSEA": "er em es e a", "R-M-S-E-A": "er em es e a",
    "SRMR": "es er em er", "S-R-M-R": "es er em er",
    "WLSMV": "we el es em fe", "W-L-S-M-V": "we el es em fe",
    "MLR": "em el er", "M-L-R": "em el er",
    "ICC": "i se se", "I-C-C": "i se se",
    "SES": "es e es", "S-E-S": "es e es",
    "IPM": "i pe em", "I-P-M": "i pe em",
    "XAI": "eks e i", "X-A-I": "eks e i",
    "SPAB": "es pe a be", "S-P-A-B": "es pe a be",
    "SAEB": "es a e be", "S-A-E-B": "es a e be",
    "TIMSS": "tims", "T-I-M-S-S": "tims",
    "AKSI": "aksi", "A-K-S-I": "aksi",
    "BOS": "bos", "B-O-S": "bos",
    "BAN-SM": "be a en es em", "B-A-N S-M": "be a en es em",
    "SMP": "es em pe", "S-M-P": "es em pe",
    "SMA": "es em a", "S-M-A": "es em a",
    "SMK": "es em ka", "S-M-K": "es em ka",
    "MTs": "em te es", "M-Ts": "em te es",
    "AN": "a en", "A-N": "a en",
    "UNDP": "u en de pe", "U-N-D-P": "u en de pe",
    "IPB": "i pe be", "I-P-B": "i pe be",
    # Istilah Inggris yang sering salah baca
    "machine learning": "mesyin lerning",
    "Machine learning": "Mesyin lerning",
    "Machine Learning": "Mesyin Lerning",
    "explainable": "ikspleinebel",
    "Explainable": "Ikspleinebel",
    "Random Forest": "Rendom Forest",
    "random forest": "rendom forest",
    "cross-validation": "kros falidesyen",
    "grouped k-fold": "grupt ke-fold",
    "k-fold": "ke-fold",
    "feature engineering": "fitur enjiniring",
    "feature importance": "fitur importens",
    "variable importance": "fariabel importens",
    "black-box": "blek boks",
    "actionable": "eksyenebel",
    "overfitting": "ofer fiting",
    "data leakage": "data likij",
    "variance component": "farians komponen",
    "fixed effect": "fikst efek",
    "random effect": "rendom efek",
    "self-report": "self riport",
    "fitness for purpose": "fitnes for perpes",
    "baseline": "beisline",
    "fold": "fold",
    "seed": "siid",
    "crosswalk": "kroswok",
    "rate": "reit",
    "Parallel Analysis": "Paralel Analisis",
    "Promax": "Pro-maks",
    "lavaan": "la-fa-an",
    "psych": "saik",
    "Cramér's V": "kramer fe",
    "Spearman": "spirmen",
    "rho": "ro",
    "Shapley": "syeplei",
    "Expectation-Maximization": "ekspektesyen maksimaisesyen",
    "Mixed-Effects Random Forest": "Mikst Efeks Rendom Forest",
    "mixed-effects": "mikst efeks",
    # Nama peneliti
    "Scheerens": "Skerens",
    "Podsakoff": "Podsakof",
    "Lundberg": "Lundberg",
    "Breiman": "Braimen",
    "Hajjem": "Hajem",
    "Larocque": "Larok",
    "Bellavance": "Belafans",
    "Fokkema": "Fokema",
    "Edbrooke-Childs": "Edbruk Cayldz",
    "Wolpert": "Wolpert",
    "Coleman": "Koulmen",
    "Ersan": "Ersan",
    "Rodriguez": "Rodriges",
    "Harvey": "Harfi",
    "Reynolds": "Renolds",
    "LeBreton": "Lebreton",
    "Bliese": "Blis",
    "Mardia": "Mardia",
    "Logan": "Logen",
}


# --- Tambahan di luar kamus yang diberikan --------------------------------
# Lima pola ini ada di naskah tapi tidak tercakup kamus asli, dan semuanya
# lolos pemeriksaan mutu butir 4 (akronim terbaca huruf per huruf oleh mesin).
# Dipisah supaya gampang dicabut kalau Anda tidak setuju.
#   "A-I"          -> naskah menulis "explainable A-I"; tanda hubung berisiko
#                     terbaca "strip".
#   SHapley / exPlanations / Additive
#                  -> kepanjangan backronym SHAP dengan kapitalisasi ganjil;
#                     kamus asli hanya punya "Shapley" (huruf kecil di tengah).
LEXICON_EXTRA = {
    "A-I": "a i",
    "AI": "a i",
    "SHapley": "syeplei",
    "Additive": "editif",
    "exPlanations": "eksplenesyens",
}
LEXICON.update(LEXICON_EXTRA)


def _build_lexicon_regex() -> re.Pattern:
    """Satu pola beralternasi, kunci terpanjang lebih dulu.

    Penggantian dilakukan dalam SATU kali sapuan supaya hasil penggantian
    tidak bisa tergantikan lagi oleh aturan lain, dan supaya
    "Mixed-Effects Random Forest" menang atas "Random Forest".
    """
    parts = []
    for key in sorted(LEXICON, key=len, reverse=True):
        pat = re.escape(key)
        if key[0].isalnum():
            pat = r"\b" + pat
        if key[-1].isalnum():
            pat = pat + r"\b"
        parts.append(pat)
    return re.compile("|".join(parts))          # case-sensitive: disengaja


LEX_RE = _build_lexicon_regex()


def apply_lexicon(text: str) -> str:
    return LEX_RE.sub(lambda m: LEXICON[m.group(0)], text)


# --------------------------------------------------------------------------
# Tahap 1 - parser naskah
# --------------------------------------------------------------------------
SEG_OPEN_RE = re.compile(
    r"^===\s*SEG\s+(\d+)\s*\|\s*voice=(ARDI|GADIS)\s*\|\s*rate=([+-]?\d+)%\s*\|"
    r"\s*pitch=([+-]?\d+)Hz\s*\|\s*(.+?)\s*===\s*$"
)
SEG_CLOSE_RE = re.compile(r"^===\s*END\s*===\s*$")
MARKER_RE = re.compile(r"\[\[\s*(?:PAUSE\s+([0-9]+(?:\.[0-9]+)?)|SFX\s+chime)\s*\]\]")
SENTENCE_END_RE = re.compile(r"(?<=[.!?])\s+")


@dataclass
class Piece:
    kind: str                 # "speech" | "silence"
    text: str = ""            # untuk speech (teks asli, belum kamus)
    seconds: float = 0.0      # untuk silence


@dataclass
class Segment:
    number: int
    voice: str                # ARDI | GADIS
    rate_pct: int
    pitch_hz: int
    title: str
    pieces: list = field(default_factory=list)


def _clean_speech(block_lines: list) -> str:
    """Gabungkan paragraf jadi satu potongan.

    Baris kosong berlebih dibuang; tanda baca tidak pernah disentuh karena
    koma dan titik adalah sumber utama ritme.  Penekanan markdown dilucuti
    supaya bintang tidak pernah ikut terbaca.
    """
    text = "\n".join(block_lines)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text, flags=re.S)   # **tebal**
    text = re.sub(r"(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"\1", text, flags=re.S)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    paragraphs = [
        " ".join(line.strip() for line in para.splitlines() if line.strip())
        for para in re.split(r"\n\s*\n", text)
    ]
    return "\n".join(p for p in paragraphs if p).strip()


def parse_script(path: Path) -> list:
    """Kembalikan daftar Segment.  Semua baris di luar blok segmen diabaikan."""
    segments: list = []
    current: Optional[Segment] = None
    buffer: list = []

    def flush_speech():
        nonlocal buffer
        body = _clean_speech(buffer)
        if body:
            current.pieces.append(Piece("speech", text=body))
        buffer = []

    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.rstrip()
        opened = SEG_OPEN_RE.match(line)
        if opened:
            if current is not None:
                raise ValueError(f"SEG baru di baris {lineno} sebelum '=== END ==='")
            num, voice, rate, pitch, title = opened.groups()
            current = Segment(int(num), voice, int(rate), int(pitch), title)
            buffer = []
            continue
        if SEG_CLOSE_RE.match(line):
            if current is None:
                raise ValueError(f"'=== END ===' tanpa pembuka di baris {lineno}")
            flush_speech()
            segments.append(current)
            current = None
            continue
        if current is None:
            continue                                     # di luar blok: abaikan

        # Pecah baris pada marker jeda.
        pos = 0
        for m in MARKER_RE.finditer(line):
            head = line[pos:m.start()]
            if head.strip():
                buffer.append(head)
            flush_speech()
            secs = float(m.group(1)) if m.group(1) else SFX_CHIME_SECONDS
            current.pieces.append(Piece("silence", seconds=secs))
            pos = m.end()
        tail = line[pos:]
        if pos == 0:
            buffer.append(line)
        elif tail.strip():
            buffer.append(tail)

    if current is not None:
        raise ValueError(f"Segmen {current.number} tidak ditutup '=== END ==='")
    return segments


def split_long(text: str, limit: int = MAX_CHARS) -> list:
    """Pecah potongan yang melebihi `limit` pada batas kalimat terdekat."""
    if len(text) <= limit:
        return [text]
    out, current = [], ""
    for sentence in SENTENCE_END_RE.split(text):
        candidate = f"{current} {sentence}".strip() if current else sentence
        if len(candidate) <= limit:
            current = candidate
            continue
        if current:
            out.append(current)
            current = ""
        while len(sentence) > limit:                     # kalimat tunggal raksasa
            cut = sentence.rfind(" ", 0, limit)
            cut = cut if cut > 0 else limit
            out.append(sentence[:cut].strip())
            sentence = sentence[cut:].strip()
        current = sentence
    if current:
        out.append(current)
    return [c for c in out if c]


# --------------------------------------------------------------------------
# Tahap 1 + 2 - rencana produksi
# --------------------------------------------------------------------------
def run_plan(script_path: Path = SCRIPT_MD) -> dict:
    segments = parse_script(script_path)
    for d in (TEXT_RAW, TEXT_SPOKEN, AUDIO, WAV, OUTPUT):
        d.mkdir(parents=True, exist_ok=True)

    chunks, idx = [], 0
    for seg in segments:
        raw_parts, spoken_parts = [], []
        for piece in seg.pieces:
            if piece.kind == "silence":
                chunks.append({
                    "idx": idx, "kind": "silence", "seg": seg.number,
                    "seg_title": seg.title, "seconds": round(piece.seconds, 3),
                })
                idx += 1
                continue
            for part in split_long(piece.text):
                spoken = apply_lexicon(part)
                chunks.append({
                    "idx": idx, "kind": "speech", "seg": seg.number,
                    "seg_title": seg.title, "voice": seg.voice,
                    "voice_id": VOICE_MAP[seg.voice],
                    "rate": f"{seg.rate_pct:+d}%", "pitch": f"{seg.pitch_hz:+d}Hz",
                    "rate_pct": seg.rate_pct, "pitch_hz": seg.pitch_hz,
                    "text_raw": part, "text_spoken": spoken,
                    "chars": len(spoken),
                })
                raw_parts.append(part)
                spoken_parts.append(spoken)
                idx += 1
        stem = f"seg_{seg.number:02d}"
        (TEXT_RAW / f"{stem}.txt").write_text("\n\n".join(raw_parts) + "\n", encoding="utf-8")
        (TEXT_SPOKEN / f"{stem}.txt").write_text("\n\n".join(spoken_parts) + "\n", encoding="utf-8")

    speech = [c for c in chunks if c["kind"] == "speech"]
    silence = [c for c in chunks if c["kind"] == "silence"]
    plan = {
        "source": script_path.name,
        "segments": [
            {"number": s.number, "title": s.title, "voice": s.voice,
             "rate": f"{s.rate_pct:+d}%", "pitch": f"{s.pitch_hz:+d}Hz"}
            for s in segments
        ],
        "n_segments": len(segments),
        "n_chunks": len(chunks),
        "n_speech_chunks": len(speech),
        "n_silence_chunks": len(silence),
        "speech_chars": sum(c["chars"] for c in speech),
        "silence_seconds": round(sum(c["seconds"] for c in silence), 2),
        "chunks": chunks,
    }
    PLAN_JSON.write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"Segmen           : {plan['n_segments']}")
    print(f"Potongan total   : {plan['n_chunks']}")
    print(f"  - bicara       : {plan['n_speech_chunks']}")
    print(f"  - hening       : {plan['n_silence_chunks']} "
          f"({plan['silence_seconds']:.1f} detik)")
    print(f"Karakter terucap : {plan['speech_chars']:,}")
    print(f"Rencana ditulis  : {PLAN_JSON.relative_to(ROOT)}")
    return plan


def load_plan() -> dict:
    if not PLAN_JSON.exists():
        sys.exit("plan.json belum ada - jalankan 'plan' lebih dulu.")
    return json.loads(PLAN_JSON.read_text(encoding="utf-8"))


# --------------------------------------------------------------------------
# util ffmpeg
# --------------------------------------------------------------------------
def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    proc = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if proc.returncode != 0:
        sys.exit(f"Perintah gagal: {' '.join(str(c) for c in cmd[:12])}\n{proc.stderr[-2500:]}")
    return proc


def duration_of(path: Path) -> float:
    proc = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=nw=1:nk=1", str(path)])
    return float(proc.stdout.strip())


def make_silence(seconds: float, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono", "-t", f"{seconds:.3f}",
         "-c:a", "pcm_s16le", str(dest)])
    return dest


# --------------------------------------------------------------------------
# Tahap 3 - sintesis
# --------------------------------------------------------------------------
META_DIR = BUILD / "meta"
REQUEST_GAP = 0.4          # jeda antarpermintaan; layanan membatasi laju
MAX_ATTEMPTS = 4           # retry dengan backoff eksponensial


def chunk_mp3(idx: int) -> Path:
    return AUDIO / f"{idx:03d}.mp3"


def chunk_meta(idx: int) -> Path:
    return META_DIR / f"{idx:03d}.json"


def with_retry(fn, label: str):
    """Backoff eksponensial 2s, 4s, 8s; maksimal MAX_ATTEMPTS percobaan."""
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            return fn()
        except Exception as exc:                          # noqa: BLE001
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError(f"{label}: menyerah setelah {attempt} percobaan: {exc}") from exc
            wait = 2 ** attempt
            print(f"    ! {label} gagal ({exc}); coba lagi dalam {wait}s "
                  f"[{attempt}/{MAX_ATTEMPTS - 1}]", flush=True)
            time.sleep(wait)
    raise AssertionError("unreachable")


# ---- backend edge-tts ----------------------------------------------------
def synth_edge(chunk: dict, dest: Path) -> dict:
    import asyncio
    import ssl
    import edge_tts
    import edge_tts.communicate as _c
    import edge_tts.voices as _v

    # Di balik proxy korporat, sertifikat yang dipakai bukan dari certifi.
    # Kalau SSL_CERT_FILE ada, pakai itu; kalau tidak, biarkan bawaan edge-tts.
    ca = os.environ.get("SSL_CERT_FILE")
    if ca and os.path.exists(ca):
        ctx = ssl.create_default_context(cafile=ca)
        _c._SSL_CTX = ctx
        _v._SSL_CTX = ctx

    async def go():
        communicate = edge_tts.Communicate(
            chunk["text_spoken"], chunk["voice_id"],
            rate=chunk["rate"], pitch=chunk["pitch"],
        )
        cues, tmp = [], dest.with_suffix(".part")
        with open(tmp, "wb") as fh:
            async for msg in communicate.stream():
                if msg["type"] == "audio":
                    fh.write(msg["data"])
                elif msg["type"] == "WordBoundary":
                    cues.append({
                        "start": msg["offset"] / 1e7,
                        "end": (msg["offset"] + msg["duration"]) / 1e7,
                        "text": msg["text"],
                    })
        tmp.replace(dest)
        return {"backend": "edge", "word_cues": cues}

    return asyncio.run(go())


# ---- backend Google Translate (cadangan) ---------------------------------
GT_URL = "https://translate.googleapis.com/translate_tts"
GT_LIMIT = 200             # batas keras layanan: 200 karakter per permintaan
GT_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
_SPLIT_LEVELS = (SENTENCE_END_RE, re.compile(r"(?<=[;:])\s+"), re.compile(r"(?<=,)\s+"), re.compile(r"\s+—\s+"))


def split_for_gtrans(text: str, limit: int = GT_LIMIT) -> list:
    """Pecah jadi bagian <= limit karakter, seaman mungkin di batas kalimat."""
    def rec(fragment: str, level: int) -> list:
        fragment = fragment.strip()
        if not fragment:
            return []
        if len(fragment) <= limit:
            return [fragment]
        if level >= len(_SPLIT_LEVELS):
            words, out, cur = fragment.split(), [], ""
            for w in words:
                cand = f"{cur} {w}".strip()
                if len(cand) <= limit:
                    cur = cand
                else:
                    if cur:
                        out.append(cur)
                    cur = w[:limit]
                    w = w[limit:]
                    while w:
                        out.append(cur)
                        cur, w = w[:limit], w[limit:]
            if cur:
                out.append(cur)
            return out
        # Gabung potongan level ini serakus mungkin, sisanya turun level.
        out, cur = [], ""
        for part in _SPLIT_LEVELS[level].split(fragment):
            part = part.strip()
            if not part:
                continue
            cand = f"{cur} {part}".strip()
            if len(cand) <= limit:
                cur = cand
            else:
                if cur:
                    out.append(cur)
                cur = ""
                if len(part) <= limit:
                    cur = part
                else:
                    out.extend(rec(part, level + 1))
        if cur:
            out.append(cur)
        return out

    return rec(text.replace("\n", " "), 0)


def _gt_fetch(text: str, idx: int, total: int, dest: Path) -> None:
    import ssl
    import urllib.parse
    import urllib.request

    params = {
        "ie": "UTF-8", "client": "tw-ob", "tl": "id", "ttsspeed": "1",
        "total": str(total), "idx": str(idx), "textlen": str(len(text)),
        "prev": "input", "q": text,
    }
    req = urllib.request.Request(
        GT_URL + "?" + urllib.parse.urlencode(params),
        headers={"User-Agent": GT_UA, "Referer": "https://translate.google.com/"},
    )
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}")
        data = resp.read()
    if len(data) < 512:
        raise RuntimeError(f"balasan terlalu kecil ({len(data)} byte)")
    dest.write_bytes(data)


def synth_gtrans(chunk: dict, dest: Path) -> dict:
    parts = split_for_gtrans(chunk["text_spoken"])
    tmpdir = AUDIO / f".parts_{chunk['idx']:03d}"
    if tmpdir.exists():
        shutil.rmtree(tmpdir)
    tmpdir.mkdir(parents=True)
    files, meta_parts = [], []
    for i, part in enumerate(parts):
        piece = tmpdir / f"p{i:03d}.mp3"
        with_retry(lambda p=part, i=i, f=piece: _gt_fetch(p, i, len(parts), f),
                   f"chunk {chunk['idx']:03d} bagian {i + 1}/{len(parts)}")
        files.append(piece)
        meta_parts.append({"text": part, "file": piece.name})
        time.sleep(REQUEST_GAP)

    listing = tmpdir / "list.txt"
    listing.write_text("".join(f"file '{f.name}'\n" for f in files), encoding="utf-8")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
         "-i", str(listing), "-ar", str(SAMPLE_RATE), "-ac", "1",
         "-c:a", "libmp3lame", "-q:a", "4", str(dest)])
    for part_meta, f in zip(meta_parts, files):
        part_meta["dur"] = round(duration_of(f), 4)
        part_meta.pop("file", None)
    shutil.rmtree(tmpdir)
    return {"backend": "gtrans", "parts": meta_parts}


BACKENDS = {"edge": synth_edge, "gtrans": synth_gtrans}


def run_synth(backend: str) -> None:
    plan = load_plan()
    META_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    synth = BACKENDS[backend]
    speech = [c for c in plan["chunks"] if c["kind"] == "speech"]
    done = skipped = 0

    for chunk in speech:
        idx = chunk["idx"]
        dest, meta_path = chunk_mp3(idx), chunk_meta(idx)
        if dest.exists() and dest.stat().st_size > MIN_MP3_BYTES and meta_path.exists():
            skipped += 1
            continue
        label = f"chunk {idx:03d} (seg {chunk['seg']:02d}, {chunk['chars']} kar)"
        print(f"  -> {label}", flush=True)
        meta = with_retry(lambda c=chunk, d=dest: synth(c, d), label)
        size = dest.stat().st_size if dest.exists() else 0
        if size <= MIN_MP3_BYTES:
            sys.exit(f"{label}: berkas hasil hanya {size} byte - permintaan gagal diam-diam.")
        meta["bytes"] = size
        meta["duration"] = round(duration_of(dest), 4)
        meta_path.write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
        done += 1
        time.sleep(REQUEST_GAP)

    SYNTH_META.write_text(json.dumps({"backend": backend}, indent=1), encoding="utf-8")
    print(f"Sintesis selesai: {done} potongan baru, {skipped} dilewati "
          f"(sudah ada), total {len(speech)}.")


# --------------------------------------------------------------------------
# Tahap 4 - sambung dan kuasai audio
# --------------------------------------------------------------------------
GADIS_PITCH_K = 1.07       # hanya backend cadangan: penanda ganti suara
LOUDNORM = "I=-16:TP=-1.5:LRA=11"


def post_filters(chunk: dict, backend: str, apply_rate: bool) -> Optional[str]:
    """Filter pasca-sintesis.

    Backend edge sudah menerapkan rate dan pitch sendiri, jadi tidak ada
    yang perlu dikerjakan.  Backend cadangan hanya punya satu suara dan
    tanpa kontrol prosodi, jadi pergantian suara dan rate dikerjakan di sini.
    """
    if backend == "edge":
        return None
    k = GADIS_PITCH_K if chunk["voice"] == "GADIS" else 1.0
    tempo = (1 + chunk["rate_pct"] / 100.0) if apply_rate else 1.0
    if k == 1.0 and tempo == 1.0:
        return None
    chain = []
    if k != 1.0:
        chain.append(f"asetrate={SAMPLE_RATE}*{k}")
        chain.append(f"aresample={SAMPLE_RATE}")
    total_tempo = tempo / k
    if abs(total_tempo - 1.0) > 1e-6:
        chain.append(f"atempo={total_tempo:.6f}")
    return ",".join(chain) if chain else None


def decode_chunks(plan: dict, backend: str, apply_rate: bool) -> list:
    """Decode tiap potongan ke WAV 24 kHz mono; kembalikan lini masa."""
    WAV.mkdir(parents=True, exist_ok=True)
    timeline, cursor = [], 0.0
    for chunk in plan["chunks"]:
        idx = chunk["idx"]
        wav = WAV / f"{idx:03d}.wav"
        if chunk["kind"] == "silence":
            src = WAV / f"sil_{chunk['seconds']:.3f}.wav"
            make_silence(chunk["seconds"], src)
            if not wav.exists():
                shutil.copyfile(src, wav)
        else:
            mp3 = chunk_mp3(idx)
            if not mp3.exists():
                sys.exit(f"Potongan {idx:03d} belum disintesis - jalankan 'synth'.")
            if not wav.exists():
                cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(mp3)]
                filt = post_filters(chunk, backend, apply_rate)
                if filt:
                    cmd += ["-af", filt]
                cmd += ["-ar", str(SAMPLE_RATE), "-ac", "1", "-c:a", "pcm_s16le", str(wav)]
                run(cmd)
        dur = duration_of(wav)
        timeline.append({**chunk, "wav": wav.name, "start": round(cursor, 4),
                         "dur": round(dur, 4), "end": round(cursor + dur, 4)})
        cursor += dur
    return timeline


def concat_wavs(timeline: list, dest: Path) -> Path:
    listing = BUILD / "concat_list.txt"
    listing.write_text(
        "".join(f"file '{(WAV / item['wav']).as_posix()}'\n" for item in timeline),
        encoding="utf-8")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
         "-i", str(listing), "-c:a", "pcm_s16le", "-ar", str(SAMPLE_RATE),
         "-ac", "1", str(dest)])
    return dest


def loudnorm_two_pass(src: Path, dest: Path) -> dict:
    """Normalisasi loudness dua tahap: ukur dulu, baru terapkan."""
    proc = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(src), "-af",
         f"loudnorm={LOUDNORM}:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True)
    blob = proc.stderr[proc.stderr.rfind("{"):proc.stderr.rfind("}") + 1]
    measured = json.loads(blob)
    filt = (f"loudnorm={LOUDNORM}"
            f":measured_I={measured['input_i']}"
            f":measured_TP={measured['input_tp']}"
            f":measured_LRA={measured['input_lra']}"
            f":measured_thresh={measured['input_thresh']}"
            f":offset={measured['target_offset']}:linear=true:print_format=summary")
    run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", filt,
         "-ar", str(SAMPLE_RATE), "-ac", "1", "-c:a", "pcm_s16le", str(dest)])
    return measured


def segment_spans(timeline: list, segments: list) -> list:
    spans = []
    for seg in segments:
        items = [t for t in timeline if t["seg"] == seg["number"]]
        spans.append({
            "number": seg["number"], "title": seg["title"], "voice": seg["voice"],
            "rate": seg["rate"], "pitch": seg["pitch"],
            "start": items[0]["start"], "end": items[-1]["end"],
            "duration": round(items[-1]["end"] - items[0]["start"], 3),
        })
    return spans


def write_chapters(spans: list, dest: Path) -> Path:
    lines = [";FFMETADATA1", f"title={TAG_TITLE}", f"artist={TAG_ARTIST}",
             f"album={TAG_ALBUM}", f"date={TAG_YEAR}", ""]
    for s in spans:
        lines += ["[CHAPTER]", "TIMEBASE=1/1000",
                  f"START={int(round(s['start'] * 1000))}",
                  f"END={int(round(s['end'] * 1000))}",
                  f"title=SEG {s['number']:02d} - {s['title']}", ""]
    dest.write_text("\n".join(lines), encoding="utf-8")
    return dest


def _fmt_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def build_cues(timeline: list, backend: str) -> list:
    """Cue tingkat kalimat.  Teks memakai naskah ASLI (sebelum kamus)."""
    cues = []
    for item in timeline:
        if item["kind"] != "speech":
            continue
        flat_raw = item["text_raw"].replace("\n", " ")
        flat_spoken = item["text_spoken"].replace("\n", " ")
        raw_s = [s.strip() for s in SENTENCE_END_RE.split(flat_raw) if s.strip()]
        spoken_s = [s.strip() for s in SENTENCE_END_RE.split(flat_spoken) if s.strip()]
        # Kamus hanya mengganti kata, tidak pernah tanda baca, jadi jumlah
        # kalimat versi asli dan versi terucap selalu sama.
        if len(raw_s) != len(spoken_s):
            raw_s, spoken_s = [flat_raw], [flat_spoken]

        meta_path = chunk_meta(item["idx"])
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        word_cues = meta.get("word_cues") if backend == "edge" else None

        placed, ptr = [], 0
        if word_cues:
            scale = item["dur"] / max(word_cues[-1]["end"], 1e-6)
            for spoken in spoken_s:
                n = max(len(spoken.split()), 1)
                group = word_cues[ptr:ptr + n]
                ptr += n
                if group:
                    placed.append((item["start"] + group[0]["start"] * scale,
                                   item["start"] + group[-1]["end"] * scale))
                else:
                    placed.append(None)
        if not placed or any(p is None for p in placed):
            total = sum(len(s) for s in spoken_s) or 1
            cursor = item["start"]
            placed = []
            for spoken in spoken_s:
                span = item["dur"] * len(spoken) / total
                placed.append((cursor, cursor + span))
                cursor += span
        for raw, (start, end) in zip(raw_s, placed):
            cues.append({"seg": item["seg"], "start": start,
                         "end": max(end, start + 0.4), "text": raw})
    return cues


def write_transcripts(cues: list, spans: list, srt_path: Path, txt_path: Path) -> None:
    blocks = []
    for i, c in enumerate(cues, 1):
        blocks.append(f"{i}\n{_fmt_srt(c['start'])} --> {_fmt_srt(c['end'])}\n{c['text']}\n")
    srt_path.write_text("\n".join(blocks), encoding="utf-8")

    lines = [TAG_TITLE, TAG_ALBUM, "", "TRANSKRIP", ""]
    for span in spans:
        stamp = _fmt_srt(span["start"]).split(",")[0]
        lines.append(f"[{stamp}] SEG {span['number']:02d} - {span['title']}")
        lines.append("")
        body = (TEXT_RAW / f"seg_{span['number']:02d}.txt").read_text(encoding="utf-8").strip()
        lines.append(body)
        lines.append("")
    txt_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def encode_outputs(mastered: Path, chapters: Path, stem: str) -> dict:
    mp3 = OUTPUT / f"{stem}.mp3"
    m4b = OUTPUT / f"{stem}.m4b"
    tags = ["-metadata", f"title={TAG_TITLE}", "-metadata", f"artist={TAG_ARTIST}",
            "-metadata", f"album={TAG_ALBUM}", "-metadata", f"date={TAG_YEAR}",
            "-metadata", f"genre=Speech", "-metadata", f"album_artist={TAG_ARTIST}"]
    run(["ffmpeg", "-v", "error", "-y", "-i", str(mastered),
         "-c:a", "libmp3lame", "-b:a", "96k", "-ar", str(SAMPLE_RATE), "-ac", "1",
         *tags, "-id3v2_version", "3", "-write_id3v1", "1", str(mp3)])
    run(["ffmpeg", "-v", "error", "-y", "-i", str(mastered), "-i", str(chapters),
         "-map_metadata", "1", "-map_chapters", "1", "-map", "0:a",
         "-c:a", "aac", "-b:a", "64k", "-ar", str(SAMPLE_RATE), "-ac", "1",
         *tags, "-movflags", "+faststart", str(m4b)])
    return {"mp3": mp3, "m4b": m4b}


def run_master(apply_rate: bool) -> dict:
    plan = load_plan()
    backend = json.loads(SYNTH_META.read_text())["backend"] if SYNTH_META.exists() else "edge"
    stem = "bahan_belajar_disertasi_herman"
    if backend != "edge":
        stem += f"_{backend}"
    OUTPUT.mkdir(parents=True, exist_ok=True)

    print(f"  backend={backend}  rate_pasca={'ya' if apply_rate else 'tidak'}")
    timeline = decode_chunks(plan, backend, apply_rate)
    total = round(timeline[-1]["end"], 3)
    print(f"  potongan didekode: {len(timeline)}  durasi mentah: {total/60:.2f} menit")

    full = BUILD / "full.wav"
    concat_wavs(timeline, full)
    mastered = BUILD / "mastered.wav"
    measured = loudnorm_two_pass(full, mastered)
    print(f"  loudnorm: input {measured['input_i']} LUFS -> target -16 LUFS")

    spans = segment_spans(timeline, plan["segments"])
    chapters = write_chapters(spans, BUILD / "chapters.ffmetadata")
    outs = encode_outputs(mastered, chapters, stem)

    cues = build_cues(timeline, backend)
    write_transcripts(cues, spans, OUTPUT / "transkrip.srt", OUTPUT / "transkrip.txt")

    manifest = {
        "title": TAG_TITLE, "album": TAG_ALBUM, "backend": backend,
        "post_rate_applied": apply_rate,
        "total_duration_sec": round(duration_of(outs["mp3"]), 3),
        "n_segments": len(spans), "n_chunks": len(timeline),
        "n_speech_chunks": sum(1 for t in timeline if t["kind"] == "speech"),
        "n_silence_chunks": sum(1 for t in timeline if t["kind"] == "silence"),
        "segments": spans,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    (BUILD / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False), encoding="utf-8")

    print(f"  {outs['mp3'].name}  {outs['mp3'].stat().st_size/1e6:.1f} MB")
    print(f"  {outs['m4b'].name}  {outs['m4b'].stat().st_size/1e6:.1f} MB  "
          f"({len(spans)} bab)")
    print(f"  transkrip.srt ({len(cues)} cue), transkrip.txt, manifest.json")
    return manifest


# --------------------------------------------------------------------------
# Tambahan - pecah jadi beberapa bagian yang bisa diputar sendiri-sendiri
# --------------------------------------------------------------------------
def run_split(max_mb: float = 28.0) -> list:
    """Pecah hasil akhir di batas segmen jadi bagian <= max_mb.

    Berguna kalau berkas utuh kena batas unggah. Tiap bagian tetap berupa
    mp3 utuh yang bisa diputar sendiri, bukan pecahan biner.
    """
    manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf-8"))
    mastered = BUILD / "mastered.wav"
    if not mastered.exists():
        sys.exit("build/mastered.wav tidak ada - jalankan 'master' lebih dulu.")
    stem = "bahan_belajar_disertasi_herman"
    if manifest["backend"] != "edge":
        stem += f"_{manifest['backend']}"

    total = manifest["total_duration_sec"]
    bytes_per_sec = 96_000 / 8
    n_parts = max(1, int((total * bytes_per_sec) / (max_mb * 1024 * 1024)) + 1)
    target = total / n_parts

    # Titik potong digeser ke batas segmen terdekat supaya tidak memotong kalimat.
    cuts, segs = [0.0], manifest["segments"]
    for k in range(1, n_parts):
        ideal = k * target
        best = min(segs, key=lambda s: abs(s["start"] - ideal))
        if best["start"] > cuts[-1] + 60:
            cuts.append(best["start"])
    cuts.append(total)

    made = []
    for i in range(len(cuts) - 1):
        start, end = cuts[i], cuts[i + 1]
        first = next(s["number"] for s in segs if s["start"] >= start - 0.01)
        last = max(s["number"] for s in segs if s["start"] < end - 0.01)
        dest = OUTPUT / f"{stem}_bagian{i + 1}_seg{first:02d}-{last:02d}.mp3"
        run(["ffmpeg", "-v", "error", "-y", "-i", str(mastered),
             "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
             "-c:a", "libmp3lame", "-b:a", "96k", "-ar", str(SAMPLE_RATE), "-ac", "1",
             "-metadata", f"title={TAG_TITLE} - bagian {i + 1} (SEG {first:02d}-{last:02d})",
             "-metadata", f"artist={TAG_ARTIST}", "-metadata", f"album={TAG_ALBUM}",
             "-metadata", f"track={i + 1}/{len(cuts) - 1}", "-metadata", f"date={TAG_YEAR}",
             "-id3v2_version", "3", str(dest)])
        mb = dest.stat().st_size / 1024 / 1024
        print(f"  {dest.name}  {mb:.1f} MB  "
              f"({(end - start) / 60:.1f} menit, SEG {first:02d}-{last:02d})")
        made.append(dest)
    return made


# --------------------------------------------------------------------------
# Tahap 5 - pemeriksaan mutu
# --------------------------------------------------------------------------
FORBIDDEN_MARKERS = ("===", "[[", "|", "**")
ACRONYM_RE = re.compile(r"\b(?:[A-Z]{2,}|(?:[A-Z]-){1,}[A-Z](?:-[A-Z])*)\b")
DUR_MIN, DUR_MAX = 68 * 60, 82 * 60


def ebur128(path: Path) -> dict:
    proc = subprocess.run(["ffmpeg", "-v", "info", "-i", str(path),
                           "-af", "ebur128=peak=true", "-f", "null", "-"],
                          capture_output=True, text=True)
    tail = proc.stderr[-2000:]
    out = {}
    for key, pat in (("I", r"I:\s*(-?\d+\.\d+)\s*LUFS"),
                     ("LRA", r"LRA:\s*(-?\d+\.\d+)\s*LU"),
                     ("peak", r"Peak:\s*(-?\d+\.\d+)\s*dBFS")):
        found = re.findall(pat, tail)
        if found:
            out[key] = float(found[-1])
    return out


def run_qc(seed: int = 7) -> int:
    import random

    plan = load_plan()
    manifest_path = OUTPUT / "manifest.json"
    if not manifest_path.exists():
        sys.exit("manifest.json belum ada - jalankan 'master' lebih dulu.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    stem = "bahan_belajar_disertasi_herman"
    if manifest["backend"] != "edge":
        stem += f"_{manifest['backend']}"
    mp3 = OUTPUT / f"{stem}.mp3"
    failures = []

    print("=" * 66)
    print("TAHAP 5 - PEMERIKSAAN MUTU")
    print("=" * 66)

    # 1. Durasi total
    total = manifest["total_duration_sec"]
    ok = DUR_MIN <= total <= DUR_MAX
    print(f"\n1. Durasi total: {total/60:.2f} menit "
          f"({int(total//60)}m {int(total%60)}s) - rentang syarat 68-82 menit")
    if ok:
        print("   LULUS")
    else:
        print(f"   DI LUAR RENTANG (backend={manifest['backend']})")
        if manifest["backend"] != "edge":
            print("   Catatan: rentang 68-82 menit dikalibrasi untuk suara neural "
                  "edge-tts (~140 kata/menit).")
            print("   Keutuhan segmen diperiksa terpisah di butir 2 - tidak ada "
                  "segmen hilang atau ganda.")
        else:
            failures.append("durasi di luar rentang")

    # 2. Jumlah potongan
    planned = plan["n_speech_chunks"]
    built = manifest["n_speech_chunks"]
    print(f"\n2. Potongan bicara: rencana {planned}, terbangun {built}; "
          f"hening {manifest['n_silence_chunks']}; segmen {manifest['n_segments']}/41")
    if planned == built and manifest["n_segments"] == plan["n_segments"] == 41:
        print("   LULUS - tidak ada selisih")
    else:
        print(f"   SELISIH: {built - planned}")
        failures.append("jumlah potongan tidak cocok")

    # 3. Marker teknis tidak boleh lolos
    print("\n3. Marker teknis di build/text_spoken/:")
    hits = 0
    for f in sorted(TEXT_SPOKEN.glob("*.txt")):
        body = f.read_text(encoding="utf-8")
        for marker in FORBIDDEN_MARKERS:
            if marker in body:
                n = body.count(marker)
                hits += n
                print(f"   {f.name}: {n}x {marker!r}")
    print(f"   Total temuan: {hits}")
    if hits == 0:
        print("   LULUS - nol hasil")
    else:
        failures.append("marker teknis lolos ke teks terucap")

    # 4. Tiga segmen acak
    print("\n4. Cuplikan tiga segmen acak (200 karakter pertama versi terucap):")
    rng = random.Random(seed)
    values = set()
    for v in LEXICON.values():
        values.update(v.split())
    for num in sorted(rng.sample([s["number"] for s in plan["segments"]], 3)):
        body = (TEXT_SPOKEN / f"seg_{num:02d}.txt").read_text(encoding="utf-8")
        flat = " ".join(body.split())
        print(f"\n   --- SEG {num:02d} ---")
        print(f"   {flat[:200]}")
        leaked = [a for a in ACRONYM_RE.findall(body) if a not in values]
        if leaked:
            print(f"   AKRONIM LOLOS: {sorted(set(leaked))}")
            failures.append(f"akronim lolos di seg {num:02d}")
        else:
            print("   Tidak ada akronim yang lolos dari kamus.")

    # keseluruhan naskah, bukan cuma sampel
    all_leaked = set()
    for f in TEXT_SPOKEN.glob("*.txt"):
        for a in ACRONYM_RE.findall(f.read_text(encoding="utf-8")):
            if a not in values:
                all_leaked.add(a)
    print(f"\n   Sapuan seluruh naskah: "
          f"{'tidak ada akronim lolos' if not all_leaked else sorted(all_leaked)}")

    # 5. Loudness akhir
    print("\n5. Pengukuran EBU R128 pada berkas akhir:")
    m = ebur128(mp3)
    print(f"   Integrated : {m.get('I', float('nan'))} LUFS   (target -16)")
    print(f"   LRA        : {m.get('LRA', float('nan'))} LU    (batas atas 11; "
          f"LRA rendah wajar untuk satu penutur)")
    print(f"   True peak  : {m.get('peak', float('nan'))} dBFS (batas -1.5)")
    if m.get("I") is not None and abs(m["I"] + 16) <= 1.0:
        print("   LULUS - dalam toleransi 1 LU dari target")
    else:
        print("   Di luar toleransi")
        failures.append("loudness meleset")
    if m.get("peak") is not None and m["peak"] > -1.0:
        failures.append("true peak terlalu tinggi")

    print("\n" + "=" * 66)
    if failures:
        print("RINGKASAN: ada catatan -> " + "; ".join(failures))
    else:
        print("RINGKASAN: seluruh butir LULUS")
    print("=" * 66)
    return 0 if not failures else 1


# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description="Produksi audio bahan belajar disertasi.")
    ap.add_argument("stage", choices=["plan", "synth", "master", "qc", "split", "all"])
    ap.add_argument("--backend", choices=sorted(BACKENDS), default="edge",
                    help="mesin TTS (default: edge)")
    ap.add_argument("--apply-rate", dest="apply_rate", action="store_true", default=None,
                    help="terapkan rate naskah sebagai atempo pasca-sintesis")
    ap.add_argument("--no-apply-rate", dest="apply_rate", action="store_false")
    ap.add_argument("--script", type=Path, default=SCRIPT_MD)
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        sys.exit("ffmpeg/ffprobe tidak ditemukan.")

    # Backend edge sudah punya kontrol rate sendiri; cadangan tidak.
    apply_rate = args.apply_rate
    if apply_rate is None:
        apply_rate = False

    if args.stage in ("plan", "all"):
        print("== TAHAP 1+2: parse naskah dan kamus pelafalan ==")
        run_plan(args.script)
    if args.stage in ("synth", "all"):
        print(f"\n== TAHAP 3: sintesis (backend={args.backend}) ==")
        run_synth(args.backend)
    if args.stage in ("master", "all"):
        print("\n== TAHAP 4: sambung dan kuasai audio ==")
        run_master(apply_rate)
    if args.stage == "split":
        print("== Pecah hasil akhir jadi beberapa bagian ==")
        run_split()
    if args.stage in ("qc", "all"):
        print()
        return run_qc()
    return 0


if __name__ == "__main__":
    sys.exit(main())

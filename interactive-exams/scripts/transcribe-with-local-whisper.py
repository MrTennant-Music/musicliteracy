#!/usr/bin/env python3
"""Transcribe exam audio locally on macOS without requiring ffmpeg.

Run this script with the project's Whisper virtual environment. Audio is
decoded to a temporary 16 kHz mono WAV using the built-in macOS `afconvert`
tool, then passed to Whisper with word timestamps enabled.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
import shutil
import wave
from pathlib import Path

import numpy as np
import whisper


def decode_audio(source: Path, destination: Path, ffmpeg: str | None = None) -> None:
    ffmpeg_path = ffmpeg or shutil.which("ffmpeg")
    if ffmpeg_path:
        subprocess.run(
            [ffmpeg_path, "-nostdin", "-loglevel", "error", "-i", str(source), "-ac", "1", "-ar", "16000", str(destination)],
            check=True,
            capture_output=True,
        )
        return
    subprocess.run(
        [
            "/usr/bin/afconvert",
            str(source),
            str(destination),
            "-f",
            "WAVE",
            "-d",
            "LEI16@16000",
            "-c",
            "1",
        ],
        check=True,
        capture_output=True,
    )


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as audio:
        if audio.getnchannels() != 1 or audio.getsampwidth() != 2 or audio.getframerate() != 16000:
            raise ValueError("Decoded audio must be 16 kHz, mono, 16-bit PCM")
        samples = np.frombuffer(audio.readframes(audio.getnframes()), dtype="<i2")
    return samples.astype(np.float32) / 32768.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", nargs="+")
    parser.add_argument("--model", default="small.en")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    model = whisper.load_model(args.model, download_root=args.model_dir)

    for source_name in args.audio:
        source = Path(source_name)
        with tempfile.TemporaryDirectory(prefix="exam-whisper-") as temporary_dir:
            decoded = Path(temporary_dir) / "audio.wav"
            decode_audio(source, decoded, args.ffmpeg)
            result = model.transcribe(read_wav(decoded), language="en", word_timestamps=True, fp16=False)
        destination = output_dir / f"{source.stem}.json"
        destination.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(destination)


if __name__ == "__main__":
    main()

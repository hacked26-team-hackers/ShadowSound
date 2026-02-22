"""
Shadow-Sound — Sound Classifier

Loads the YAMNet model locally to classify short audio clips 
into the 5 safety-critical categories used by the app.
"""

import io
import os
import numpy as np
import librosa
import tensorflow as tf

# ── Class labels (our 5 classes) ────────────────

CLASS_NAMES: list[str] = [
    "alarm",
    "dog_barking",
    "emergency_siren",
    "horn",
    "shouting",
]

# Urgency per category
URGENCY: dict[str, str] = {
    "emergency_siren": "critical",
    "horn": "high",
    "shouting": "medium",
    "dog_barking": "low",
    "alarm": "medium",
}

# Haptic pattern per category
HAPTIC_PATTERN: dict[str, str] = {
    "emergency_siren": "rapid_pulse_3x",
    "horn": "double_tap",
    "shouting": "long_pulse",
    "dog_barking": "triple_tap",
    "alarm": "alternating_short_long",
}

# Mapping from YAMNet classes to our 5 categories
# We only list YAMNet indices that map to our critical sounds.
YAMNET_TO_TARGET = {
    # Shouting
    22: "shouting",
    23: "shouting",
    24: "shouting",
    # Dog barking
    73: "dog_barking",
    74: "dog_barking",
    75: "dog_barking",
    76: "dog_barking", # Growl
    # Horn
    311: "horn",
    312: "horn",
    313: "horn",
    # Emergency Siren
    322: "emergency_siren",
    323: "emergency_siren",
    324: "emergency_siren",
    325: "emergency_siren",
    326: "emergency_siren",
    # Alarm
    382: "alarm",
    388: "alarm",
    389: "alarm",
    393: "alarm",
    394: "alarm",
}

# ── Audio settings ──────────────────────────

TARGET_SR = 16000       # YAMNet requires 16 kHz mono
CONFIDENCE_THRESHOLD = 0.1 # YAMNet gives spread out probabilities, so 0.1 is okay for detecting presence.

# Default model path (relative to this file)
DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "yamnet", "yamnet-tensorflow2-yamnet-v1")


class SoundClassifier:
    """Loads the YAMNet model once and exposes a classify() method."""

    def __init__(self, model_path: str | None = None) -> None:
        path = model_path or DEFAULT_MODEL_PATH
        print(f"[classifier] Loading YAMNet model from {path} …")
        self.model = tf.saved_model.load(path)
        print("[classifier] YAMNet Model loaded.")

    # ── public API ─────────────────────────────────────────────────────

    def classify(
        self,
        audio_bytes: bytes,
        sample_rate: int = TARGET_SR,
    ) -> dict | None:
        """
        Classify raw audio bytes using YAMNet.

        Parameters
        ----------
        audio_bytes : bytes
            Raw audio file bytes (WAV, OGG, etc.).
        sample_rate : int
            Sample rate of the incoming audio.

        Returns
        -------
        dict | None
            Detection dict or None if nothing exceeds threshold.
        """
        waveform = self._audio_to_waveform(audio_bytes, sample_rate)
        if waveform is None:
            return None

        # Run YAMNet model
        scores, embeddings, spectrogram = self.model(waveform)
        
        # average scores across frames
        mean_scores = np.mean(scores.numpy(), axis=0)
        
        # find the highest scoring mapped class
        best_mapped_class = None
        best_mapped_score = 0.0
        
        for idx, target_class in YAMNET_TO_TARGET.items():
            if mean_scores[idx] > best_mapped_score:
                best_mapped_score = float(mean_scores[idx])
                best_mapped_class = target_class

        if best_mapped_score < CONFIDENCE_THRESHOLD or best_mapped_class is None:
            return None

        return {
            "sound_type": best_mapped_class,
            "confidence": round(best_mapped_score, 3),
            "urgency": URGENCY.get(best_mapped_class, "low"),
            "haptic_pattern": HAPTIC_PATTERN.get(best_mapped_class, "single_tap"),
        }

    # ── internals ──────────────────────────────────────────────────────

    def _audio_to_waveform(
        self, audio_bytes: bytes, original_sr: int
    ) -> np.ndarray | None:
        """Decode audio bytes → 16 kHz mono float32 waveform."""
        import tempfile
        import os
        
        try:
            # Write bytes to a temporary file so librosa/audioread can decode
            # Android/iOS streams (m4a, amr, pcm) that soundfile can't read directly from memory
            with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            try:
                # Load audio using librosa from the temporary file
                waveform, _ = librosa.load(
                    tmp_path, sr=TARGET_SR, mono=True
                )
            finally:
                # Ensure we clean up the temporary file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

            return waveform.astype(np.float32)

        except Exception as exc:
            print(f"[classifier] Failed to process audio: {exc}")
            return None

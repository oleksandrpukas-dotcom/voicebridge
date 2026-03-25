type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

let recognition: SpeechRecognition | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening(
  langCode: string,
  onResult: SpeechCallback,
  onError: ErrorCallback
): void {
  if (!isSpeechRecognitionSupported()) {
    onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    return;
  }

  stopListening();

  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) {
    onError("Speech recognition is not supported in this browser.");
    return;
  }
  recognition = new SpeechRecognitionCtor();
  recognition.lang = langCode;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  let buffer = "";
  let bufferTimer: ReturnType<typeof setTimeout> | null = null;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        // Pick the highest-confidence alternative
        let best = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > best.confidence) {
            best = result[j];
          }
        }
        finalTranscript += best.transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      // Buffer consecutive final results to form complete sentences
      buffer += (buffer ? " " : "") + finalTranscript.trim();
      if (bufferTimer) clearTimeout(bufferTimer);
      bufferTimer = setTimeout(() => {
        if (buffer) {
          onResult(buffer, true);
          buffer = "";
        }
      }, 1200);
    } else if (interimTranscript) {
      const display = buffer ? buffer + " " + interimTranscript.trim() : interimTranscript.trim();
      onResult(display, false);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "no-speech" || event.error === "aborted") return;
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.onend = () => {
    // Auto-restart for continuous listening
    if (recognition) {
      try {
        recognition.start();
      } catch {
        // Already started or stopped intentionally
      }
    }
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    const ref = recognition;
    recognition = null;
    try {
      ref.stop();
    } catch {
      // Already stopped
    }
  }
}

export function speak(text: string, langCode: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
    if (match) utterance.voice = match;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

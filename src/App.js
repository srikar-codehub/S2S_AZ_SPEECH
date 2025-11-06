import React, { useEffect, useRef, useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

function App() {
  const [listening, setListening] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [latestAudioUrl, setLatestAudioUrl] = useState(null);
  const [error, setError] = useState("");
  const translatorRef = useRef(null);
  const synthesizerRef = useRef(null);
  const stopTimerRef = useRef(null);

  const startTranslation = () => {
    const speechKey = process.env.REACT_APP_SPEECH_KEY;
    const serviceRegion = process.env.REACT_APP_SPEECH_REGION;

    if (!speechKey || !serviceRegion) {
      alert("Missing Azure Speech key or region in .env");
      return;
    }
    if (listening) {
      return;
    }

    setError("");
    setSourceText("");
    setTranslatedText("");

    const translationConfig =
      SpeechSDK.SpeechTranslationConfig.fromSubscription(
        speechKey,
        serviceRegion
      );
    translationConfig.speechRecognitionLanguage = "en-US"; // You speak English
    translationConfig.addTargetLanguage("fr"); // Translate to French
    translationConfig.voiceName = "fr-FR-DeniseNeural";
    translationConfig.speechSynthesisOutputFormat =
      SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const translator = new SpeechSDK.TranslationRecognizer(
      translationConfig,
      audioConfig
    );
    translatorRef.current = translator;

    const synthesizer = new SpeechSDK.SpeechSynthesizer(translationConfig);
    synthesizerRef.current = synthesizer;

    setListening(true);
    translator.startContinuousRecognitionAsync(
      () => {},
      (err) => {
        console.error(err);
        setError("Unable to start translation. Check mic permissions.");
        stopTranslation();
      }
    );

    translator.recognizing = (s, e) => {
      setSourceText(e.result.text || "");
    };

    translator.recognized = (s, e) => {
      if (
        e.result.reason !== SpeechSDK.ResultReason.TranslatedSpeech ||
        !e.result.translations
      ) {
        return;
      }
      const french = e.result.translations.get("fr");
      if (!french) {
        return;
      }
      setTranslatedText(french);

      const activeSynthesizer = synthesizerRef.current;
      if (!activeSynthesizer) {
        return;
      }
      activeSynthesizer.speakTextAsync(
        french,
        (result) => {
          if (
            result.reason ===
            SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            const audioBuffer = result.audioData;
            const blob = new Blob([audioBuffer], { type: "audio/mp3" });
            const url = window.URL.createObjectURL(blob);
            setLatestAudioUrl((previousUrl) => {
              if (previousUrl) {
                window.URL.revokeObjectURL(previousUrl);
              }
              return url;
            });
          } else if (
            result.reason === SpeechSDK.ResultReason.Canceled &&
            result.errorDetails
          ) {
            console.error(result.errorDetails);
            setError("Text synthesized but playback was canceled.");
          }
        },
        (err) => {
          console.error(err);
          setError("Unable to synthesize the translated audio.");
        }
      );
    };

    translator.canceled = (s, e) => {
      console.error(e);
      setError(e.errorDetails || "Translation canceled.");
      stopTranslation();
    };

    translator.sessionStopped = () => {
      stopTranslation();
    };
  };

  const stopTranslation = () => {
    const translator = translatorRef.current;
    if (translator) {
      translator.stopContinuousRecognitionAsync(
        () => translator.close(),
        () => translator.close()
      );
      translatorRef.current = null;
    }
    const synthesizer = synthesizerRef.current;
    if (synthesizer) {
      synthesizer.close();
      synthesizerRef.current = null;
    }
    setListening(false);
  };

  useEffect(() => {
    return () => {
      stopTranslation();
      setLatestAudioUrl((currentUrl) => {
        if (currentUrl) {
          window.URL.revokeObjectURL(currentUrl);
        }
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>🎤 Live English → French Speech Translation</h2>

      {!listening ? (
        <button onClick={startTranslation}>Start Talking</button>
      ) : (
        <div>
          <p>Listening… Speak now.</p>
          <button onClick={stopTranslation} style={{ marginTop: 8 }}>
            Stop
          </button>
        </div>
      )}

      <h3>Detected Speech (English)</h3>
      <div style={{ background: "#eee", padding: 12 }}>{sourceText}</div>

      <h3>Translated (French)</h3>
      <div style={{ background: "#dfffd6", padding: 12 }}>{translatedText}</div>

      {latestAudioUrl ? (
        <div style={{ marginTop: 16 }}>
          <h4>Latest Translation Audio</h4>
          <audio controls src={latestAudioUrl} />
          <div>
            <a href={latestAudioUrl} download="translation.mp3">
              Download MP3
            </a>
          </div>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 16, color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      ) : null}
    </div>
  );
}

export default App;
